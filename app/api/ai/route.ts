import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

const client = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const AnswerExtraction = z.object({
      response: z.string(),
      relatedquery: z.boolean(),
    });

    const result = await client.responses.parse({
      model: "gpt-4o-2024-08-06",
      input: [
        {
          role: "system",
          content: `
            You are an AI assistant specializing in topics related to Israel.
          - If the user's question is related to Israel, return the answer and set "relatedquery" to true.
          - If the question is not related to Israel, say you do not have knowledge on that topic and set "relatedquery" to false.
          - ofc, when user query is greeting, "relatequery" will be false
          - Give me response in hebrew.
          `,
        },
        { role: "user", content: message },
      ],
      text: { format: zodTextFormat(AnswerExtraction, "answer_extraction") },
    });

    const data = result.output_parsed ?? {
      response: "לא הצלחתי לעבד את הבקשה.",
      relatedquery: false,
    };

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
