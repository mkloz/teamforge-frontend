type ActivityMutationKeyPart = boolean | number | string | null | undefined;

const activeActivityMutations = new Map<string, Promise<unknown>>();

export function getActivityMutationKey(
  ...parts: ActivityMutationKeyPart[]
): string {
  return JSON.stringify(parts);
}

export function runExclusiveActivityMutation<T>(
  key: string,
  mutation: () => Promise<T> | T,
): Promise<T> {
  const previousMutation = activeActivityMutations.get(key);
  const mutationPromise = Promise.resolve(previousMutation)
    .catch(() => undefined)
    .then(mutation)
    .finally(() => {
      if (activeActivityMutations.get(key) === mutationPromise) {
        activeActivityMutations.delete(key);
      }
    });

  activeActivityMutations.set(key, mutationPromise);
  return mutationPromise;
}
