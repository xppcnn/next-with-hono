import { Hono } from "hono";
import authRoutes from "@/server/modules/auth";
import privateRoutes from "@/server/modules/user";

const app = new Hono().basePath("/api");

// Mount auth routes
app.route("/auth", authRoutes);
// Mount user routes
app.route("/users", privateRoutes);

export default app