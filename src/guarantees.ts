// This finite example uses equality as its relation, with two distinct inputs.
export const inputs = [false, true] as const;
export function sharedWitness(candidate: boolean) {
  return inputs.map((input) => ({
    input,
    witness: candidate,
    works: input === candidate,
  }));
}
