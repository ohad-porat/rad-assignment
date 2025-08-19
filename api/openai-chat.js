export const config = { runtime: "edge" };

import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(request) {
  try {
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
        status: 405,
        headers: { "content-type": "application/json" },
      });
    }

    const { query, alerts, conversationHistory } = await request.json().catch(() => ({}));
    if (!query) {
      return new Response(JSON.stringify({ error: "Query is required" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const alertContext =
      alerts?.length
        ? `\n\nSelected Alerts:\n${alerts
            .map(a => `- ${a.severity} severity ${a.category} alert in ${a.clusterName} (${a.resourceType})`)
            .join("\n")}`
        : "";

    const conversationContext =
      conversationHistory?.length
        ? `\n\nConversation History:\n${conversationHistory
            .slice(-5)
            .map(m => `${m.role}: ${m.content}`)
            .join("\n")}`
        : "";

    const systemPrompt =
      `You are a security analyst AI assistant. Give BRIEF, CONCISE responses in 2-3 sentences maximum. ` +
      `Focus only on the most critical actions needed.` +
      alertContext +
      conversationContext;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query },
      ],
      stream: true,
      max_tokens: 2000,
      temperature: 0.7,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const token = chunk.choices?.[0]?.delta?.content ?? "";
            if (token) controller.enqueue(encoder.encode(token));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-cache",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Failed to get AI response" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
