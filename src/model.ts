export type Formula =
  | { kind: "atom"; name: string }
  | { kind: "and" | "or" | "implies"; left: Formula; right: Formula };
export type Hypothesis = { name: string; type: Formula };
export type Goal = { context: Hypothesis[]; conclusion: Formula };
export type Action = {
  id: string;
  label: string;
  tactic: string;
  next: string | null;
  feedback: string;
};
export type ProofNode = {
  id: string;
  goals: Goal[];
  actions: Action[];
  hint: string;
  complete: boolean;
};
export type Level = {
  id: string;
  title: string;
  subtitle: string;
  story: string;
  lesson: string;
  theorem: string;
  nodes: ProofNode[];
  solution: string[];
};
export const CONTENT_VERSION = "dungeon-1";
export function equal(a: Formula, b: Formula): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
export function format(f: Formula, rocq = false): string {
  if (f.kind === "atom") return f.name;
  const symbols = rocq
    ? { and: "/\\", or: "\\/", implies: "->" }
    : { and: "∧", or: "∨", implies: "→" };
  return `(${format(f.left, rocq)} ${symbols[f.kind]} ${format(f.right, rocq)})`;
}
export function parseFormula(input: string): Formula {
  const tokens = input.match(/->|\/\\|\\\/|[A-Z][A-Za-z0-9_]*|[()]/g) ?? [];
  if (tokens.join("") !== input.replace(/\s/g, ""))
    throw new Error(`Unsupported formula: ${input}`);
  let i = 0;
  function atom(): Formula {
    const t = tokens[i++];
    if (t === "(") {
      const f = imp();
      if (tokens[i++] !== ")") throw new Error("Missing parenthesis");
      return f;
    }
    if (!t || !/^[A-Z]/.test(t)) throw new Error("Expected atom");
    return { kind: "atom", name: t };
  }
  function and(): Formula {
    const left = atom();
    return tokens[i] === "/\\"
      ? (i++, { kind: "and", left, right: and() })
      : left;
  }
  function or(): Formula {
    const left = and();
    return tokens[i] === "\\/"
      ? (i++, { kind: "or", left, right: or() })
      : left;
  }
  function imp(): Formula {
    const left = or();
    return tokens[i] === "->"
      ? (i++, { kind: "implies", left, right: imp() })
      : left;
  }
  const f = imp();
  if (i !== tokens.length) throw new Error("Unexpected tokens");
  return f;
}
export function nodeAt(level: Level, id: string): ProofNode {
  const n = level.nodes.find((n) => n.id === id);
  if (!n) throw new Error("Unknown proof state");
  return n;
}
export function replay(level: Level, history: string[]): ProofNode {
  if (history.length > 128) throw new Error("Progress is too long");
  let node = nodeAt(level, "n0");
  for (const id of history) {
    const action = node.actions.find((a) => a.id === id);
    if (!action?.next) throw new Error("Invalid saved move");
    node = nodeAt(level, action.next);
  }
  return node;
}
export function move(level: Level, history: string[], actionId: string) {
  const node = replay(level, history);
  const action = node.actions.find((a) => a.id === actionId);
  if (!action) throw new Error("This choice is no longer available");
  return {
    history: action.next ? [...history, action.id] : history,
    feedback: action.feedback,
    accepted: action.next !== null,
  };
}
export function proofScript(level: Level, history: string[]) {
  let node = nodeAt(level, "n0");
  const lines = [
    `Theorem room_${level.id} (A B C : Prop) : ${level.theorem}.`,
    "Proof.",
  ];
  for (const id of history) {
    const a = node.actions.find((a) => a.id === id);
    if (!a?.next) throw new Error("Invalid proof history");
    lines.push(`  ${a.tactic}`);
    node = nodeAt(level, a.next);
  }
  lines.push(
    node.complete
      ? "Qed."
      : "(* Proof in progress: remaining goals shown in the game. *)",
  );
  return lines.join("\n");
}
