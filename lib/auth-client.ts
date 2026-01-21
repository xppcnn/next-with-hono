
import { createAuthClient } from "better-auth/react";
import { toast } from "sonner";

export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:6688"),
  fetchOptions: {
    onError: async (e) => {
      const message = e.error?.message || "出错了，请稍后重试";
      toast.error(message);
    },
  },
});
