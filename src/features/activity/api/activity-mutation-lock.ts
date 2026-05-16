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
  const activeMutation = activeActivityMutations.get(key);

  if (activeMutation) {
    return activeMutation as Promise<T>;
  }

  const mutationPromise = Promise.resolve()
    .then(mutation)
    .finally(() => {
      if (activeActivityMutations.get(key) === mutationPromise) {
        activeActivityMutations.delete(key);
      }
    });

  activeActivityMutations.set(key, mutationPromise);
  return mutationPromise;
}
