import { Hono } from "hono";
import authRoutes from "@/server/modules/auth";
import privateRoutes from "@/server/modules/user";

const app = new Hono().basePath("/api");

// Mount auth routes
app.route("/auth", authRoutes);
// Mount user routes
app.route("/users", privateRoutes);

// Proxy all /api/agent/* requests to http://localhost:3456/
app.all("/agent/*", async (c) => {
  const path = c.req.path.replace("/api/agent", "");
  const basURL = process.env.AGENT_BASE_URL;
  const port = process.env.AGENT_PORT;
  const url = new URL(`${basURL}:${port}${path}`);

  // Preserve query parameters
  url.search = c.req.url.split("?")[1] || "";

  try {
    const response = await fetch(url.toString(), {
      method: c.req.method,
      headers: c.req.raw.headers,
      body:
        c.req.method !== "GET" && c.req.method !== "HEAD"
          ? await c.req.text()
          : undefined,
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (error) {
    return c.json({ error: "Failed to proxy request to agent service" }, 500);
  }
});

export default app;
