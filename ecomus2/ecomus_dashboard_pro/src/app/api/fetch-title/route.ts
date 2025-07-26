import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  if (!url) return NextResponse.json("", { status: 400 });
  try {
    const html = await fetch(url).then(r => r.text());
    const $ = cheerio.load(html);
    const title = $("title").first().text();
    return NextResponse.json(title);
  } catch {
    return NextResponse.json(url);
  }
}
