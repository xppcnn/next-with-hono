import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "@/lib/auth";
import authMiddleware from "@/server/middleware/auth";
import { mastra } from "@/mastra";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  UIMessage,
} from "ai";
import { toAISdkStream } from "@mastra/ai-sdk";
import { RequestContext } from "@mastra/core/request-context";
type Env = {
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
};

const agentsRoutes = new Hono<Env>();

agentsRoutes
  .use(
    "*",
    cors({
      origin: "*", // replace with your origin
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["POST", "GET", "OPTIONS"],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
      credentials: true,
    })
  )
  .use(authMiddleware);

agentsRoutes.post("/stream", async (c) => {
  const body = await c.req.json();
  const agent = await mastra.getAgent("weatherAgent");

  // 提取最后一条用户消息（优化 token 使用）
  // Memory 会自动从存储中获取历史消息
  const allMessages = body.messages || [];
  const lastUserMessage = allMessages
    .slice()
    .reverse()
    .find((msg: any) => msg.role === "user");

  if (!lastUserMessage) {
    return c.json({ error: "No user message found" }, 400);
  }
  const userId = c.get("user")?.id || "anonymous";
  const threadId = body.threadId || `thread-${userId}`;

  // 提取用户消息内容
  const userText =
    lastUserMessage.parts?.[0]?.text || lastUserMessage.content || "";

  // 只传递当前用户消息，Memory 会自动从存储中获取历史消息
  // 这样每次请求只消耗当前消息的 token，而不是整个会话历史

  const requestContext = new RequestContext();
  requestContext.set("modelConfig", {
    id: "openrouter/deepseek/deepseek-v3.2",
    apiKey: process.env.OPENROUTER_API_KEY || "",
  });
  const stream = await agent.stream(
    [
      {
        role: "user" as const,
        content: userText,
      },
    ],
    {
      memory: {
        resource: userId,
        thread: threadId,
      },
      requestContext,
    }
  );

  const uiMessageStream = createUIMessageStream({
    // 保持完整的消息历史用于 UI 渲染（不影响 token）
    originalMessages: allMessages as UIMessage[],
    execute: async ({ writer }) => {
      const readableStream = toAISdkStream(stream, { from: "agent" });
      const reader = readableStream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          await writer.write(value);
        }
      } finally {
        reader.releaseLock();
      }
    },
  });

  return createUIMessageStreamResponse({
    stream: uiMessageStream,
  });
});

export default agentsRoutes;
