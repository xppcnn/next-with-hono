import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import {
  type HonoBindings,
  type HonoVariables,
  MastraServer,
} from "@mastra/hono";
import { mastra } from "./index";

const app = new Hono<{ Bindings: HonoBindings; Variables: HonoVariables }>();
const server = new MastraServer({ app, mastra });
const port = process.env.AGENT_PORT! || 3456;
console.log("🚀 ~ port:", port);
await server.init();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

serve(
  {
    fetch: app.fetch,
    port: Number(port),
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
