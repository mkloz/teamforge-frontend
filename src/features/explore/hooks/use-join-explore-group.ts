import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ExploreQueries } from "../api/explore.queries";

export function useJoinExploreGroup(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["explore", "join-group", groupId],
    mutationFn: () => ExploreQueries.joinGroup(groupId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["explore-groups"] }),
        queryClient.invalidateQueries({ queryKey: ["home"] }),
        queryClient.invalidateQueries({ queryKey: ["groups"] }),
      ]);
    },
  });
}
