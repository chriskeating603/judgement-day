import { NextRequest, NextResponse } from "next/server";

import { db } from "@vercel/postgres";

export async function GET(req: NextRequest) {
  const client = await db.connect();
  const res = await client.sql`SELECT * from users ORDER BY created_on DESC`;
  console.log(res);

  const response = new NextResponse(JSON.stringify(res.rows));

  // Set headers to disable caching
  response.headers.set("Cache-Control", "no-store, max-age=0");
  response.headers.set("Pragma", "no-cache"); // For HTTP/1.0 compatibility
  response.headers.set("Expires", "0");

  return response;
}
