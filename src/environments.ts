export const environments = [
  {
    name: "The Entrance",
    accent: "#e9c77a",
    arrival:
      "I’m Pip. Seven lanterns once lit the path to the Proof Workshop. Help me relight them. First, borrow the door’s glowing seal: assume A, then show it A.",
    resolution:
      "The entrance lantern glows. Keep your seal: evidence can be reused. The storeroom is just ahead.",
  },
  {
    name: "The Storeroom",
    accent: "#edbb86",
    arrival:
      "Dusty shelves, one promising chest. Inside are A and B. Unpack both facts, then show this room’s door A.",
    resolution:
      "A second light can join the trail. Both tools stay with you; nothing was used up. Beyond the shelves, water echoes.",
  },
  {
    name: "The Cistern Bridge",
    accent: "#9ed5d2",
    arrival:
      "The bridge has two locking mechanisms. One needs A, the other B. Prove both parts before we cross the dark water.",
    resolution:
      "Both mechanisms release and the bridge extends. One finished branch was not enough: you supplied both proofs.",
  },
  {
    name: "The Machine Room",
    accent: "#eec182",
    arrival:
      "The old machinery is packed backwards. Our box holds A and B; the mechanism asks for B and A. Unpack, then rebuild.",
    resolution:
      "The gears align. The same facts work in a new arrangement. A shaft of green light points toward the courtyard.",
  },
  {
    name: "The Moss Courtyard",
    accent: "#c5da95",
    arrival:
      "Two archways lead out of this mossy courtyard. You carry B. Choose the promise you can prove; one supported exit is enough.",
    resolution:
      "The right archway opens. An OR goal asks for one supported choice. Ahead, the passage splits into reflections.",
  },
  {
    name: "The Hall of Mirrors",
    accent: "#d0b9ef",
    arrival:
      "The mirrors show two possible worlds: A or B. A rule reaches C in each. We must check both worlds before trusting the way forward.",
    resolution:
      "Both reflections reach the same destination. An OR fact required both cases. The great lantern gate is near.",
  },
  {
    name: "The Lantern Gate",
    accent: "#f1d59a",
    arrival:
      "Here is the gate to the stairs above. A stays with you; B or C changes the route. Show that either world reaches an exit, then bring every lantern to life.",
    resolution:
      "The gate’s lantern is lit. Each finished room adds a light to the path upstairs. Any dark lantern marks a proof still waiting.",
  },
] as const;
export const journeyEnding =
  "All seven lanterns shine. Dawn reaches the Proof Workshop. “You’ve learned which doors your facts can open. Upstairs, we’ll learn who those facts are about.” — Pip";
export const workshopEnvironments = [
  {
    name: "The Rule Press",
    accent: "#edc779",
    arrival:
      "The workshop is waking up. This press has a rule for every object. Try it on a: a rule for everyone also covers this one object.",
    resolution:
      "The press stamps its first certificate. A universal rule can be used for any object of the right type.",
  },
  {
    name: "The Packing Bench",
    accent: "#b9d9a2",
    arrival:
      "We have evidence about a. Pack a and its matching evidence together. That is enough to promise that something has the property.",
    resolution:
      "The certificate is sealed. A witness alone was not enough: the package also needed evidence about that very witness.",
  },
  {
    name: "The Sealed Cabinet",
    accent: "#e8bc98",
    arrival:
      "A package contains an unknown object and two facts about it. Open it carefully, keep its identity, and repack only the fact we need.",
    resolution:
      "The cabinet opens. We kept the witness we discovered; evidence about it cannot be reassigned to a different object.",
  },
  {
    name: "The Universal Engine",
    accent: "#a8d8df",
    arrival:
      "This engine must work for any input. Take an arbitrary object x, use the two-part certificate for x, and keep its first fact.",
    resolution:
      "The engine runs for every input. We proved the result for an arbitrary x, not just our favorite example.",
  },
  {
    name: "The Certificate Gate",
    accent: "#e8d294",
    arrival:
      "Someone carries a key. Our rule says every key holder can open the gate. Find that same person's opening certificate and package it.",
    resolution:
      "The gate opens. You connected the witness, its key, and the rule without ever changing who the evidence was about.",
  },
  {
    name: "The Dispatch Desk",
    accent: "#d1bee9",
    arrival:
      "One tool works for everyone. Can we issue each customer a suitable tool? Use the shared witness, then check why the reverse promise is different.",
    resolution:
      "The dispatch desk is ready. A shared witness gives each input a witness; separate witnesses need not all be the same one.",
  },
] as const;
export const workshopEnding =
  "All six stations are working. Pip hands you a railway ticket: “We can certify any object. Next, let's certify trains of any length.”";
export function environmentFor(id: string) {
  const index = Number(id.slice(1)) - 1;
  const environment = (
    id.startsWith("W") ? workshopEnvironments : environments
  )[index];
  if (!/^[DW]0[1-7]$/.test(id) || !environment)
    throw new Error("Unknown room environment");
  return environment;
}
