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

  const doesNameExist = await client.sql`
    SELECT * from users WHERE name = ${body.teamName}
  `;
  if (doesNameExist.rows.length > 0) {
    const update = await client.sql`
      UPDATE users
      SET judgement_json = ${JSON.stringify(body.judgement)}
      WHERE name = ${body.teamName}
    `;
    console.log(update);
    return new NextResponse("Hello, world!");
  } else {
    const insert = await client.sql`
      INSERT INTO users (name, judgement_json)
      VALUES (${body.teamName}, ${JSON.stringify(body.judgement)})
    `;
    console.log(insert);
  }

  return new NextResponse("Hello, world!");
}
