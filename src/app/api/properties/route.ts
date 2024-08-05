import next from "next";

const { Client } = require("@notionhq/client");

const NOTION_DEMO_TOKEN = process.env.NEXT_PUBLIC_NOTION_TOKEN;
const NOTION_DEMO_DATABASE_ID = process.env.NEXT_PUBLIC_NOTION_DATABASE_ID2;

const notion = new Client({ auth: NOTION_DEMO_TOKEN });

// export const dynamic = "force-dynamic"; // defaults to auto

export async function GET(request: Request): Promise<Response> {
  try {
    const response = await notion.databases.retrieve({
      database_id: NOTION_DEMO_DATABASE_ID,
    });
    console.log(response);

    // if (response.results.length === 0 && result.length === 0) {
    //   return Response.json(
    //     { message: "No matching records found." },
    //     {
    //       status: 404,
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //     }
    //   );
    // }

    //   console.log(response.results);}

    return Response.json(response);
  } catch (error) {
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
