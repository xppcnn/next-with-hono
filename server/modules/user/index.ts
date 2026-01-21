import { Hono } from "hono";
import { auth } from "@/lib/auth";
import authMiddleware from "@/server/middleware/auth";

const privateRoutes = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>()
  .use(authMiddleware)
  .get("/", (c) => {
    return c.json({ message: "Private route", user: c.get("user") });
  });

export default privateRoutes;