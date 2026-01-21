import { handle } from "hono/vercel";
import server from "@/server";

export const GET = handle(server);
export const POST = handle(server);
export const PUT = handle(server);
export const DELETE = handle(server);
