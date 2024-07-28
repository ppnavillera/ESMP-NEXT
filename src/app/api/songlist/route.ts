const { Client } = require("@notionhq/client");

const NOTION_TOKEN = process.env.NEXT_PUBLIC_NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NEXT_PUBLIC_NOTION_DATABASE_ID;

const notion = new Client({ auth: NOTION_TOKEN });

// export const dynamic = "force-dynamic"; // defaults to auto
export async function GET(request: Request) {
  const url = new URL(request.url);
  const startCursor = url.searchParams.get("start_cursor") || undefined;
  const limit = parseInt(url.searchParams.get("limit") || "20"); // 기본값을 20으로 설정

  try {
    const data = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
      start_cursor: startCursor,
      page_size: limit, // 한 번에 불러올 데이터 수를 제한
    });

    return new Response(
      JSON.stringify({
        results: data.results,
        has_more: data.has_more,
        next_cursor: data.next_cursor,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching data from Notion:", error);
    return new Response(JSON.stringify({ error: "Error fetching data" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
