import { Client } from "@notionhq/client";
import { NextRequest, NextResponse } from "next/server";
import { QueryDatabaseResponse } from "@notionhq/client/build/src/api-endpoints";

const NOTION_DEMO_TOKEN = process.env.NEXT_PUBLIC_NOTION_TOKEN;
const NOTION_DEMO_DATABASE_ID = process.env.NEXT_PUBLIC_NOTION_DATABASE_ID2;

const notion = new Client({ auth: NOTION_DEMO_TOKEN });

// POST: 필터링된 데이터 조회
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const { filter } = await request.json();

    let has_more = true;
    let next_cursor: string | null = null;
    let result: any[] = [];

    while (has_more) {
      const response: QueryDatabaseResponse = await notion.databases.query({
        database_id: NOTION_DEMO_DATABASE_ID!,
        filter,
        start_cursor: next_cursor ?? undefined,
        sorts: [
          {
            property: "완성일",
            direction: "descending",
          },
        ],
      });

      result = result.concat(response.results);
      has_more = response.has_more;
      next_cursor = response.next_cursor;
    }

    if (result.length === 0) {
      return NextResponse.json(
        { message: "No matching records found." },
        { status: 404 }
      );
    }

    // POST 요청은 캐싱하기 어려우므로 no-store
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json(
        { error: "Unknown error occurred" },
        { status: 500 }
      );
    }
  }
}

// GET: 전체 데이터 조회 (캐싱 적용)
export async function GET(request: NextRequest): Promise<Response> {
  try {
    let has_more = true;
    let next_cursor: string | null = null;
    let result: any[] = [];

    while (has_more) {
      const response: QueryDatabaseResponse = await notion.databases.query({
        database_id: NOTION_DEMO_DATABASE_ID!,
        start_cursor: next_cursor ?? undefined,
        sorts: [
          {
            property: "완성일",
            direction: "descending",
          },
        ],
      });

      if (response.results.length === 0 && result.length === 0) {
        return NextResponse.json(
          { message: "No matching records found." },
          { status: 404 }
        );
      }

      result = result.concat(response.results);
      has_more = response.has_more;
      next_cursor = response.next_cursor;
    }

    // GET 요청은 캐싱 (3분간 캐시, 10분 stale-while-revalidate)
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=180, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json(
        { error: "Unknown error occurred" },
        { status: 500 }
      );
    }
  }
}
