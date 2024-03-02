import { NextRequest, NextResponse } from "next/server";

import { db } from "@vercel/postgres";

export async function GET(req: NextRequest) {
  const client = await db.connect();
  const res = await client.sql`SELECT * from users`;
  console.log(res.rows);
  return new NextResponse(JSON.stringify(res.rows));
}
