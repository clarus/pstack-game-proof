import {
  parseFormula as p,
  equal,
  substitute,
  type Formula,
  type Goal,
  type Level,
  type Parameter,
  type ProofNode,
} from "../src/model.ts";
import { environmentFor } from "../src/environments.ts";

type Step = {
  tactic: string;
  label: string;
  hint: string;
  alternatives?: { tactic: string; label: string; feedback: string }[];
};
type Recipe = {
  id: string;
  title: string;
  subtitle: string;
  lesson: string;
  parameters: Parameter[];
  theorem: string;
  steps: Step[];
};
const parameter = (name: string, type: string): Parameter => ({ name, type });
const predicates = (...names: string[]) => [
  parameter("T", "Type"),
  ...names.map((name) => parameter(name, "T -> Prop")),
];
const objects = [parameter("a", "T"), parameter("b", "T")];
const step = (
  tactic: string,
  label: string,
  hint: string,
  alternatives: Step["alternatives"] = [],
): Step => ({ tactic, label, hint, alternatives });
const wrongFact = {
  tactic: "exact missing.",
  label: "Use an unseen fact",
  feedback:
    "That fact is not in this context. Use evidence that is actually available.",
};
const witnessB = {
  tactic: "exists b.",
  label: "Choose witness b",
  feedback:
    "Choosing b is legal, but the evidence is about another object. Compare the remaining goal, then undo.",
};
const recipes: Recipe[] = [
  {
    id: "W01",
    title: "A rule for everyone",
    subtitle: "From every object to this object.",
    parameters: [...predicates("P"), ...objects],
    theorem: "(forall x : T, P x) -> P a",
    lesson:
      "A universal fact can be used at any in-scope object of its input type. Applying it to a gives P a, not P b.",
    steps: [
      step(
        "intro Hall.",
        "Assume the rule",
        "Introduce the universal rule Hall.",
      ),
      step(
        "pose proof (Hall a) as Ha.",
        "Use the rule for a",
        "Specialize Hall at a and keep the result as Ha.",
        [
          {
            tactic: "pose proof (Hall b) as Hb.",
            label: "Use the rule for b",
            feedback:
              "That is a valid use of the rule, but it proves P b. The goal asks about a. Undo to follow the guided route.",
          },
        ],
      ),
      step("exact Ha.", "Use evidence for a", "Ha proves P a exactly.", [
        {
          tactic: "exact Hall.",
          label: "Use the whole rule",
          feedback:
            "The goal asks for evidence about a. The rule must first be applied to that object.",
        },
      ]),
    ],
  },
  {
    id: "W02",
    title: "Pack a certificate",
    subtitle: "An object and its evidence.",
    parameters: [...predicates("P"), ...objects],
    theorem: "P a -> exists x : T, P x",
    lesson:
      "To prove that something has a property, choose a witness and then supply evidence about that same object.",
    steps: [
      step(
        "intro Ha.",
        "Assume evidence for a",
        "Keep the given proof of P a as Ha.",
      ),
      step(
        "exists a.",
        "Choose witness a",
        "We have P a, so choose a as the witness.",
        [
          witnessB,
          {
            tactic: "exists unseen.",
            label: "Choose unseen",
            feedback:
              "That object is not in scope. Choose an available object of type T.",
          },
        ],
      ),
      step(
        "exact Ha.",
        "Pack its evidence",
        "The remaining goal is P a, exactly what Ha proves.",
      ),
    ],
  },
  {
    id: "W03",
    title: "Open a sealed package",
    subtitle: "Keep track of what you discover.",
    parameters: [...predicates("P", "Q"), ...objects],
    theorem: "(exists x : T, P x /\\ Q x) -> exists x : T, P x",
    lesson:
      "Unpacking an existential introduces a witness and evidence about it. The witness is discovered, not chosen by you.",
    steps: [
      step(
        "intro Hpackage.",
        "Accept the package",
        "Assume the existential certificate.",
      ),
      step(
        "destruct Hpackage as [x Hboth].",
        "Discover its witness",
        "Unpack a fresh x and its certificate Hboth.",
        [
          {
            tactic: "exact x.",
            label: "Use x before opening",
            feedback:
              "The package's witness is not available until you unpack it.",
          },
        ],
      ),
      step(
        "destruct Hboth as [HP HQ].",
        "Unpack both facts",
        "Hboth contains P x and Q x.",
      ),
      step(
        "exists x.",
        "Keep witness x",
        "Repackage the same x, since HP concerns x.",
        [witnessB],
      ),
      step(
        "exact HP.",
        "Keep the first fact",
        "HP proves P x; HQ is about the other property.",
        [
          {
            tactic: "exact HQ.",
            label: "Use the other property",
            feedback:
              "HQ proves Q x. The goal needs P x, even though the object is the same.",
          },
        ],
      ),
    ],
  },
  {
    id: "W04",
    title: "Build a general rule",
    subtitle: "Any input, not a favorite example.",
    parameters: [...predicates("P", "Q"), ...objects],
    theorem: "(forall x : T, P x /\\ Q x) -> forall x : T, P x",
    lesson:
      "To establish a universal goal, introduce an arbitrary object. A proof for a particular a does not establish the claim for every x.",
    steps: [
      step(
        "intro Hall.",
        "Assume the general rule",
        "Hall supplies both properties for every input.",
      ),
      step(
        "intro x.",
        "Take an arbitrary x",
        "Introduce an arbitrary x of type T.",
        [
          {
            tactic: "exact (Hall a).",
            label: "Use just the example a",
            feedback:
              "A certificate for a particular a is not a rule for every x.",
          },
        ],
      ),
      step(
        "pose proof (Hall x) as Hboth.",
        "Use the rule for x",
        "Apply Hall to this arbitrary x.",
        [
          {
            tactic: "pose proof (Hall a) as Ha.",
            label: "Use the rule for a",
            feedback:
              "This is valid evidence about a. Our current goal is about arbitrary x, so undo to follow the guided route.",
          },
        ],
      ),
      step(
        "destruct Hboth as [HP HQ].",
        "Unpack x's certificate",
        "Extract both properties of x.",
      ),
      step(
        "exact HP.",
        "Return the first fact",
        "HP establishes P x for the arbitrary input.",
      ),
    ],
  },
  {
    id: "W05",
    title: "Open the gate",
    subtitle: "The same key holder all the way through.",
    parameters: [...predicates("Key", "Opens"), ...objects],
    theorem:
      "(exists x : T, Key x) -> (forall x : T, Key x -> Opens x) -> exists z : T, Opens z",
    lesson:
      "Unpack the key holder, use the opening rule for that same person, and package the resulting opening evidence.",
    steps: [
      step(
        "intro Hholder.",
        "Accept a key holder",
        "Assume someone has a key.",
      ),
      step(
        "intro Hrule.",
        "Accept the opening rule",
        "Assume the rule for every key holder.",
      ),
      step(
        "destruct Hholder as [x Hkey].",
        "Discover the key holder",
        "Unpack x and the proof Hkey : Key x.",
      ),
      step(
        "pose proof (Hrule x) as Hopen.",
        "Use the rule for x",
        "Hopen is now Key x → Opens x.",
      ),
      step(
        "exists x.",
        "Name x as the opener",
        "Choose the person whose key we actually have.",
        [witnessB],
      ),
      step(
        "apply Hopen.",
        "Use x's opening rule",
        "To establish Opens x, Hopen asks for Key x.",
      ),
      step(
        "exact Hkey.",
        "Present x's key",
        "Hkey supplies the required evidence.",
      ),
    ],
  },
  {
    id: "W06",
    title: "Compare guarantees",
    subtitle: "One for everyone, or one for each?",
    parameters: [
      parameter("T", "Type"),
      parameter("U", "Type"),
      parameter("R", "T -> U -> Prop"),
    ],
    theorem:
      "(exists y : U, forall x : T, R x y) -> forall x : T, exists z : U, R x z",
    lesson:
      "One shared witness works for each input. The reverse does not follow: different inputs may require different witnesses.",
    steps: [
      step(
        "intro Hshared.",
        "Accept a shared tool",
        "Assume one witness works for every input.",
      ),
      step(
        "destruct Hshared as [y Hall].",
        "Unpack the shared tool",
        "Discover y : U and Hall, its rule for every x.",
      ),
      step(
        "intro x.",
        "Take any customer x",
        "Introduce an arbitrary input of type T.",
      ),
      step(
        "exists y.",
        "Issue the shared tool y",
        "Choose the witness that already works for everyone.",
        [
          {
            tactic: "exists x.",
            label: "Issue the input x",
            feedback:
              "The witness must have type U. Our input x has type T; these types are not interchangeable.",
          },
        ],
      ),
      step(
        "pose proof (Hall x) as Hxy.",
        "Check this customer's fit",
        "Hall x gives R x y.",
      ),
      step(
        "exact Hxy.",
        "Supply the fit certificate",
        "The same y works for this arbitrary x.",
      ),
    ],
  },
];

function apply(
  input: Goal[],
  tactic: string,
  parameters: Parameter[],
): Goal[] | null {
  const goals = structuredClone(input),
    g = goals[0];
  if (!g) return null;
  const f = g.conclusion;
  const typeOf = (name: string) =>
    g.context.find((h) => h.name === name)?.type ??
    (parameters.some((p) => p.name === name)
      ? p(parameters.find((p) => p.name === name)!.type)
      : null);
  const hasName = (name: string) =>
    parameters.some((p) => p.name === name) ||
    g.context.some((h) => h.name === name);
  let m = /^intro (\w+)\.$/.exec(tactic);
  if (m && !hasName(m[1])) {
    if (f.kind === "implies") {
      g.context.push({ name: m[1], type: f.left });
      g.conclusion = f.right;
      return goals;
    }
    if (f.kind === "forall") {
      g.context.push({ name: m[1], type: p(f.domain) });
      g.conclusion = substitute(f.body, f.variable, m[1]);
      return goals;
    }
  }
  m = /^exists (\w+)\.$/.exec(tactic);
  if (m && f.kind === "exists") {
    const type = typeOf(m[1]);
    if (!type || !equal(type, p(f.domain))) return null;
    g.conclusion = substitute(f.body, f.variable, m[1]);
    return goals;
  }
  m = /^pose proof \((\w+) (\w+)\) as (\w+)\.$/.exec(tactic);
  if (m && !hasName(m[3])) {
    const rule = g.context.find((h) => h.name === m![1])?.type,
      type = typeOf(m[2]);
    if (
      !rule ||
      rule.kind !== "forall" ||
      !type ||
      !equal(type, p(rule.domain))
    )
      return null;
    g.context.push({
      name: m[3],
      type: substitute(rule.body, rule.variable, m[2]),
    });
    return goals;
  }
  m = /^destruct (\w+) as \[(\w+) (\w+)\]\.$/.exec(tactic);
  if (m && !hasName(m[2]) && !hasName(m[3])) {
    const index = g.context.findIndex((h) => h.name === m![1]);
    if (index < 0) return null;
    const source = g.context[index].type;
    if (source.kind === "exists") {
      g.context.splice(
        index,
        1,
        { name: m[2], type: p(source.domain) },
        { name: m[3], type: substitute(source.body, source.variable, m[2]) },
      );
      return goals;
    }
    if (source.kind === "and") {
      g.context.splice(
        index,
        1,
        { name: m[2], type: source.left },
        { name: m[3], type: source.right },
      );
      return goals;
    }
  }
  m = /^exact (\w+)\.$/.exec(tactic);
  if (m)
    return g.context.some((h) => h.name === m![1] && equal(h.type, f))
      ? goals.slice(1)
      : null;
  m = /^apply (\w+)\.$/.exec(tactic);
  if (m) {
    const rule = g.context.find((h) => h.name === m![1])?.type;
    if (rule?.kind === "implies" && equal(rule.right, f)) {
      g.conclusion = rule.left;
      return goals;
    }
  }
  return null;
}

export function workshopLevels(): Level[] {
  return recipes.map((recipe) => {
    const nodes: ProofNode[] = [];
    let goals: Goal[] = [{ context: [], conclusion: p(recipe.theorem) }];
    recipe.steps.forEach((step, i) => {
      const node: ProofNode = {
        id: `n${i}`,
        goals,
        actions: [],
        hint: step.hint + ` (${step.tactic})`,
        complete: false,
      };
      nodes.push(node);
      const next = apply(goals, step.tactic, recipe.parameters);
      if (!next)
        throw new Error(`${recipe.id}: unsupported step ${step.tactic}`);
      node.actions.push({
        id: "advance",
        tactic: step.tactic,
        label: step.label,
        next: `n${i + 1}`,
        feedback: step.hint,
      });
      for (const alternative of step.alternatives?.length
        ? step.alternatives
        : [wrongFact]) {
        const other = apply(goals, alternative.tactic, recipe.parameters);
        const id = `choice${node.actions.length}`,
          destination = other ? `alt${i}_${id}` : null;
        if (other)
          nodes.push({
            id: destination!,
            goals: other,
            actions: [],
            hint: "This move is legal, but this guided lesson follows a different route. Inspect the goal and undo.",
            complete: false,
          });
        node.actions.push({ id, ...alternative, next: destination });
      }
      const rotate = (i + Number(recipe.id.slice(1))) % node.actions.length;
      node.actions = [
        ...node.actions.slice(rotate),
        ...node.actions.slice(0, rotate),
      ];
      goals = next;
    });
    if (goals.length) throw new Error(`Unfinished ${recipe.id}`);
    nodes.push({
      id: `n${recipe.steps.length}`,
      goals: [],
      actions: [],
      hint: recipe.lesson,
      complete: true,
    });
    const { steps, ...metadata } = recipe;
    return {
      ...metadata,
      story: environmentFor(recipe.id).arrival,
      nodes,
      solution: steps.map(() => "advance"),
    };
  });
}
