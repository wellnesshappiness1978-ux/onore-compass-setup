import { createServerFn } from "@tanstack/react-start";
import { todayFortuneRequestSchema } from "../today-fortune";
export const generateTodayFortune = createServerFn({ method: "POST" }).inputValidator((input: unknown) => todayFortuneRequestSchema.parse(input)).handler(async ({ data }) => {
  const { runReading } = await import("./today-fortune.server");
  return runReading(data);
});
