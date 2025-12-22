const { Client } = require("@notionhq/client");

const NOTION_TOKEN = process.env.NEXT_PUBLIC_NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NEXT_PUBLIC_NOTION_DATABASE_ID; // ID1 - 링크가 있는 DB

const notion = new Client({ auth: NOTION_TOKEN });

export async function POST(request: Request): Promise<Response> {
  try {
    const { title } = await request.json();

    if (!title) {
      return Response.json({ error: "Title is required" }, { status: 400 });
    }

    // Song 필드(title 타입)로 검색
    const response = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
      filter: {
        property: "Song",
        title: {
          equals: title,
        },
      },
      page_size: 1,
    });

    if (response.results.length === 0) {
      return Response.json({ link: null }, { status: 200 });
    }

    const page = response.results[0] as any;
    const linkUrl = page.properties.Link?.url || null;

    return Response.json({ link: linkUrl });
  } catch (error) {
    console.error("Error fetching link:", error);
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 500 });
    } else {
      return Response.json(
        { error: "Unknown error occurred" },
        { status: 500 }
      );
    }
  }
}
