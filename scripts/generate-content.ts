import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import {
  parseFormula as p,
  equal,
  type Goal,
  type Level,
  type ProofNode,
} from "../src/model.ts";
const recipes = [
  [
    "D01",
    "Borrowed key",
    "Every proof begins somewhere.",
    "I’m Pip, keeper of these halls. The door asks for A. First, let it lend you A.",
    "To prove an implication, assume its premise. An exact matching fact closes a goal.",
    "A -> A",
    ["intro HA.", "exact HA."],
  ],
  [
    "D02",
    "Open the toolbox",
    "Two facts, one little box.",
    "This box contains A and B. Open it, then show the door the fact it needs.",
    "An AND hypothesis contains both facts. Destruct unpacks them; the facts remain reusable.",
    "(A /\\ B) -> A",
    ["intro H.", "destruct H as [HA HB].", "exact HA."],
  ],
  [
    "D03",
    "Two locks",
    "Both lights must glow.",
    "One door, two locks. A and B each have their own proof to finish.",
    "An AND goal requires both parts. Finishing one branch does not finish the room.",
    "A -> B -> A /\\ B",
    ["intro HA.", "intro HB.", "split.", "exact HA.", "exact HB."],
  ],
  [
    "D04",
    "Rearrange the tools",
    "Same facts. A new arrangement.",
    "The old keeper packed these backwards. You have everything you need.",
    "Unpack an AND hypothesis, then build the AND conclusion in the requested order.",
    "(A /\\ B) -> B /\\ A",
    ["intro H.", "destruct H as [HA HB].", "split.", "exact HB.", "exact HA."],
  ],
  [
    "D05",
    "Choose an exit",
    "Only one path needs a proof.",
    "Two exits await. You carry B. Which promise can you keep?",
    "An OR goal lets you choose a side. A legal choice can still leave you without the evidence you need.",
    "B -> A \\/ B",
    ["intro HB.", "right.", "exact HB."],
  ],
  [
    "D06",
    "Both possible worlds",
    "Be ready for either possibility.",
    "The sealed box holds A or B. There is a route to C in either world. We must check both.",
    "An OR hypothesis requires both cases. Apply a rule backwards: to reach C using A → C, prove A.",
    "(A \\/ B) -> (A -> C) -> (B -> C) -> C",
    [
      "intro H.",
      "intro HAC.",
      "intro HBC.",
      "destruct H as [HA | HB].",
      "apply HAC.",
      "exact HA.",
      "apply HBC.",
      "exact HB.",
    ],
  ],
  [
    "D07",
    "The keeper’s gate",
    "Bring every lesson together.",
    "A stays with you. B or C changes the route. Show me that both worlds reach the gate.",
    "OR in a hypothesis means both cases; OR in a goal means a choice. A shared fact can be reused in each branch.",
    "A /\\ (B \\/ C) -> (A /\\ B) \\/ (A /\\ C)",
    [
      "intro H.",
      "destruct H as [HA HBC].",
      "destruct HBC as [HB | HC].",
      "left.",
      "split.",
      "exact HA.",
      "exact HB.",
      "right.",
      "split.",
      "exact HA.",
      "exact HC.",
    ],
  ],
] as const;
export function applyTactic(input: Goal[], tactic: string): Goal[] | null {
  const goals = structuredClone(input);
  const g = goals[0];
  if (!g) return null;
  const f = g.conclusion;
  let match = /^intro (\w+)\.$/.exec(tactic);
  if (match && f.kind === "implies") {
    g.context.push({ name: match[1], type: f.left });
    g.conclusion = f.right;
    return goals;
  }
  if (tactic === "split." && f.kind === "and")
    return [
      { context: g.context, conclusion: f.left },
      { context: structuredClone(g.context), conclusion: f.right },
      ...goals.slice(1),
    ];
  if ((tactic === "left." || tactic === "right.") && f.kind === "or") {
    g.conclusion = tactic === "left." ? f.left : f.right;
    return goals;
  }
  match = /^exact (\w+)\.$/.exec(tactic);
  if (match)
    return g.context.some((h) => h.name === match![1] && equal(h.type, f))
      ? goals.slice(1)
      : null;
  match = /^apply (\w+)\.$/.exec(tactic);
  if (match) {
    const h = g.context.find((h) => h.name === match![1]);
    if (h?.type.kind === "implies" && equal(h.type.right, f)) {
      g.conclusion = h.type.left;
      return goals;
    }
    return null;
  }
  match = /^destruct (\w+) as \[(\w+) (\| )?(\w+)\]\.$/.exec(tactic);
  if (match) {
    const index = g.context.findIndex((h) => h.name === match![1]);
    if (index < 0) return null;
    const h = g.context[index];
    if (h.type.kind !== "and" && h.type.kind !== "or") return null;
    g.context.splice(index, 1);
    const a = { name: match[2], type: h.type.left };
    const b = { name: match[4], type: h.type.right };
    if (h.type.kind === "and") {
      g.context.splice(index, 0, a, b);
      return goals;
    }
    const before = g.context.slice(0, index),
      after = g.context.slice(index);
    return [
      { context: [...before, a, ...after], conclusion: f },
      { context: [...before, b, ...after], conclusion: f },
      ...goals.slice(1),
    ];
  }
  return null;
}
function label(t: string): string {
  if (t.startsWith("intro")) return "Assume the premise";
  if (t.startsWith("destruct"))
    return t.includes("|") ? "Explore both cases" : "Unpack both facts";
  if (t === "split.") return "Prove both parts";
  if (t === "left.") return "Choose the left side";
  if (t === "right.") return "Choose the right side";
  if (t.startsWith("apply")) return `Use rule ${t.split(" ")[1].slice(0, -1)}`;
  return `Use fact ${t.split(" ")[1].slice(0, -1)}`;
}
const feedback = (t: string) =>
  t.startsWith("intro")
    ? "A new assumption is available. Now prove what follows."
    : t.startsWith("destruct")
      ? t.includes("|")
        ? "Two possible worlds. Both must be solved, with their own facts."
        : "The package is open. Both facts are now available."
      : t === "split."
        ? "Two obligations are open. Each needs its own evidence."
        : t.startsWith("apply")
          ? "The rule changes what you need to prove. Supply its premise."
          : t.startsWith("exact")
            ? "That fact matches exactly. One goal is closed."
            : "You chose a side. Now provide evidence for it.";
const levels: Level[] = recipes.map(
  ([id, title, subtitle, story, lesson, theorem, steps]) => {
    const nodes: ProofNode[] = [];
    let goals: Goal[] = [{ context: [], conclusion: p(theorem) }];
    for (let i = 0; i <= steps.length; i++) {
      const node: ProofNode = {
        id: `n${i}`,
        goals,
        actions: [],
        hint: i < steps.length ? label(steps[i]) + ` (${steps[i]})` : lesson,
        complete: goals.length === 0,
      };
      nodes.push(node);
      if (i === steps.length) break;
      const t = steps[i];
      const next = applyTactic(goals, t);
      if (!next) throw new Error(`${id}: ${t}`);
      node.actions.push({
        id: "advance",
        label: label(t),
        tactic: t,
        next: `n${i + 1}`,
        feedback: feedback(t),
      });
      const candidates = goals[0].context.map((h) => `exact ${h.name}.`);
      if (goals[0].conclusion.kind === "or")
        candidates.push(t === "left." ? "right." : "left.");
      candidates.push(
        goals[0].conclusion.kind === "implies" ? "exact HA." : "intro Hnew.",
      );
      for (const candidate of candidates) {
        if (candidate === t || node.actions.length >= 3) continue;
        const alt = applyTactic(goals, candidate);
        if (alt && goals[0].conclusion.kind !== "or") continue;
        let destination: string | null = null;
        if (alt) {
          destination = `dead${i}`;
          nodes.push({
            id: destination,
            goals: alt,
            actions: [],
            hint: "This choice is legal, but this route is not offered further in this lesson. Undo to try the other side.",
            complete: false,
          });
        }
        node.actions.push({
          id: `choice${node.actions.length}`,
          label: label(candidate),
          tactic: candidate,
          next: destination,
          feedback: alt
            ? "That is a legal Rocq move. This lesson follows the other route; inspect this obligation, then undo."
            : candidate.startsWith("exact")
              ? goals[0].context.some((h) => candidate === `exact ${h.name}.`)
                ? "That fact does not match the active goal. Compare the two formulas."
                : "That fact is not available yet. Look at your hypotheses; first introduce an assumption."
              : "This tactic does not fit the active goal’s outer operator.",
        });
      }
      // Rotate the buttons so the lesson does not reduce to choosing the first one.
      const rotate = (i + Number(id.slice(1))) % node.actions.length;
      node.actions = [
        ...node.actions.slice(rotate),
        ...node.actions.slice(0, rotate),
      ];
      goals = next;
    }
    if (goals.length) throw new Error(`Unfinished level ${id}`);
    return {
      id,
      title,
      subtitle,
      story,
      lesson,
      theorem,
      nodes,
      solution: steps.map(() => "advance"),
    };
  },
);
const destination = "src/content/dungeon.json";
if (process.argv.includes("--check")) {
  const existing = JSON.parse(readFileSync(destination, "utf8"));
  if (JSON.stringify(existing) !== JSON.stringify(levels))
    throw new Error(
      "Content is stale. Run npm run content and verify the changed graph.",
    );
} else {
  mkdirSync("src/content", { recursive: true });
  writeFileSync(destination, JSON.stringify(levels, null, 2) + "\n");
}
console.log(
  `Checked ${levels.length} levels, ${levels.reduce((n, l) => n + l.nodes.length, 0)} nodes.`,
);
