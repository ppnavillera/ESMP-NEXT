import { Client } from "@notionhq/client";
import { NextRequest, NextResponse } from "next/server";

const NOTION_TOKEN = process.env.NEXT_PUBLIC_NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NEXT_PUBLIC_NOTION_DATABASE_ID2;

const notion = new Client({ auth: NOTION_TOKEN });

// 단일 곡 정보 조회 API
// GET /api/track?title=곡제목
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const title = searchParams.get("title");

    if (!title) {
      return NextResponse.json(
        { error: "Title parameter is required" },
        { status: 400 }
      );
    }

    // Title로 단일 곡 검색
    const response = await notion.databases.query({
      database_id: NOTION_DATABASE_ID!,
      filter: {
        property: "Title",
        title: {
          equals: title,
        },
      },
      page_size: 1,
    });

    if (response.results.length === 0) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    const track = response.results[0];

    // 캐싱 헤더 추가 (5분간 캐시, 1시간 stale-while-revalidate)
    return NextResponse.json(track, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error("Error fetching track:", error);
    return NextResponse.json(
      { error: "Failed to fetch track" },
      { status: 500 }
    );
  }
}
