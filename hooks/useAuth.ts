"use client";

import { authClient } from "@/lib/auth-client";

export function useAuth() {
  const {
    data: session,
    isPending: isLoading,
    error,
    refetch,
  } = authClient.useSession();

  const signOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            window.location.href = "/sign-in";
          },
        },
      });
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

  return {
    session,
    isLoading,
    error: error ? (error as Error).message : null,
    isAuthenticated: !!session?.user,
    user: session?.user || null,
    signOut,
    refetch,
  };
}
