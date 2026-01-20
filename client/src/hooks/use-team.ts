import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useTeamStats() {
  return useQuery({
    queryKey: [api.team.stats.path],
    queryFn: async () => {
      const res = await fetch(api.team.stats.path);
      if (!res.ok) throw new Error("Failed to fetch team stats");
      return await res.json();
    },
  });
}
