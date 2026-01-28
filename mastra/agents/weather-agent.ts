import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { weatherTool } from "../tools/weather-tool";
import { MastraModelConfig } from "@mastra/core/dist/llm";
export const weatherAgent = new Agent({
  id: "weather-agent",
  name: "Weather Agent",
  instructions: `
      You are a helpful weather assistant that provides accurate weather information and can help planning activities based on the weather.

      Your primary function is to help users get weather details for specific locations. When responding:
      - Always ask for a location if none is provided
      - If the location name isn't in English, please translate it
      - If giving a location with multiple parts (e.g. "New York, NY"), use the most relevant part (e.g. "New York")
      - Include relevant details like humidity, wind conditions, and precipitation
      - Keep responses concise but informative
      - If the user asks for activities and provides the weather forecast, suggest activities based on the weather forecast.
      - If the user asks for activities, respond in the format they request.

      Use the weatherTool to fetch current weather data.
`,
  model: ({ requestContext  }) => {
    const model = requestContext.get("modelConfig") as MastraModelConfig;
    return model;
  },
  tools: { weatherTool },

  // 配置 Memory：只保留最近 10 条消息，优化 token 使用
  // 每次请求时，Memory 会自动从存储中获取这 10 条消息
  memory: new Memory({
    options: {
      lastMessages: 10, // 只保留最近 10 条消息，可根据需要调整
    },
  }),
});
