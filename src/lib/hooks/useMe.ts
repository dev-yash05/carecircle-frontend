"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getMe, type User } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/authStore";

/** Fetches current user via TanStack Query and syncs to Zustand */
export function useMe() {
  const setUser = useAuthStore((s) => s.setUser);

  const query = useQuery<User>({
    queryKey: ["me"],
    queryFn: getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (query.data) {
      setUser(query.data);
    }
  }, [query.data, setUser]);

  return query;
}
