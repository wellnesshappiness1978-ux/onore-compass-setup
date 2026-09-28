import { createFileRoute } from "@tanstack/react-router";
import { handleConsultation } from "@/lib/ai/consultation.server";

export const Route = createFileRoute("/api/consultation")({
  server: {
    handlers: {
      POST: ({ request }) => handleConsultation(request),
    },
  },
});