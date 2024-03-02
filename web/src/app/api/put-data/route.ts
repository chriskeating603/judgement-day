import { NextRequest, NextResponse } from "next/server";

import { db } from "@vercel/postgres";

export async function POST(req: NextRequest) {
  const client = await db.connect();
  const res = await client.sql`
  CREATE TABLE IF NOT EXISTS users (
    id serial PRIMARY KEY,
    name VARCHAR ( 50 ) UNIQUE NOT NULL,
    created_on TIMESTAMP NOT NULL DEFAULT now(),
    judgement_json JSONB NOT NULL
  )
  `;

  ///{
  //   teamName: "Name 1",
  //   judgement: {
  //     criteria: [
  //       {
  //         name: "whimsical",
  //         rating: 10,
  //       },
  //       {
  //         name: "gravitas",
  //         rating: 10,
  //       },
  //       {
  //         name: "innovation",
  //         rating: 10,
  //       },
  //     ],
  //     review: "This is a great project.",
  //   }
  // }
  const body: {
    teamName: string;
    judgement: {
      criteria: {
        name: string;
        rating: number;
      }[];
      review: string;
    };
  } = await req.json();

  const res2 = await client.sql`
  INSERT INTO users (name, judgement_json)
  VALUES (${body.teamName}, ${JSON.stringify(body.judgement)})
  `;
  console.log(res2);

  return new NextResponse("Hello, world!");
  //   const { message, history } = (await req.json()) as {
  //     message: string;
  //     history: {
  //       from: "user" | "bot";
  //       message: string;
  //     }[];
  //   };
  //   console.log(message, history);
  //   const openai = new OpenAI({
  //     apiKey: process.env.OPENAI_API_KEY,
  //     baseURL: "https://oai.hconeai.com/v1",
  //     defaultHeaders: {
  //       "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
  //     },
  //   });

  //   const chatCompletion = await openai.chat.completions.create({
  //     model: "gpt-3.5-turbo",
  //     messages: [
  //       {
  //         role: "system",
  //         content: `
  // You are a bot that lives on justintorre.com, you are designed to help users learn about Justin Torre.

  // ${whoIsJustin}

  // Be friendly and funny! You are a casual bot that is trying to help users. You are not a professional bot.
  // Please let them know that you are here to help them learn about Justin Torre.
  // Ask them questions, and try to learn more about them.
  // `,
  //       },
  //       {
  //         role: "assistant",
  //         content: `Sounds good! I will let them know about Justin Torre. I will try to center the conversation towards Justin Torre.
  // I will also keep the conversation casual and try to learn more about the reader, like their name and interests.`,
  //       },

  //       ...(history.map((h) => ({
  //         role: h.from === "user" ? "user" : "assistant",
  //         content: h.message,
  //       })) as {
  //         role: "user" | "assistant";
  //         content: string;
  //       }[]),

  //       {
  //         role: "user",
  //         content: message,
  //       },
  //       {
  //         role: "assistant",
  //         content: `
  // I will respond to the user's message now. I will try to keep the conversation casual and try to learn more about the reader, like their name and interests.
  // If they are asking a question, I am going to keep it short and simple. I will try to answer their question.
  // `,
  //       },
  //     ],
  //     stream: true,
  //   });

  //   let { readable, writable } = new TransformStream();

  //   let writer = writable.getWriter();
  //   const textEncoder = new TextEncoder();
  //   let allContent = ""; // Store all chunks

  //   (async () => {
  //     for await (const part of chatCompletion) {
  //       const partContent = part.choices[0]?.delta?.content || "";
  //       allContent += partContent; // Add to the stored content
  //       await writer.write(textEncoder.encode(partContent));
  //     }
  //     await writer.close();
  //   })();

  //   return new NextResponse(readable);
}
