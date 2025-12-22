const { Client } = require("@notionhq/client");
import {
  PageObjectResponse,
  QueryDatabaseResponse,
} from "@notionhq/client/build/src/api-endpoints";

const NOTION_DEMO_TOKEN = process.env.NEXT_PUBLIC_NOTION_TOKEN;
const NOTION_DEMO_DATABASE_ID = process.env.NEXT_PUBLIC_NOTION_DATABASE_ID2;

const notion = new Client({ auth: NOTION_DEMO_TOKEN });

// // 타입 가드 함수 추가
// function isPageObjectResponse(obj: any): obj is PageObjectResponse {
//   return "properties" in obj;
// }

// export const dynamic = "force-dynamic"; // defaults to auto
export async function POST(request: Request): Promise<Response> {
  try {
    const { filter } = await request.json();

    let has_more = true;
    let next_cursor: string | null = null;
    let result: any[] = [];

    while (has_more) {
      const response: QueryDatabaseResponse = await notion.databases.query({
        database_id: NOTION_DEMO_DATABASE_ID,
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
      return Response.json(
        { message: "No matching records found." },
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return Response.json(result);
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

export async function GET(request: Request): Promise<Response> {
  try {
    let has_more = true; // 초기화
    let next_cursor: string | null = null; // 초기화
    let result: any[] = []; // 초기화 및 타입 변경

    while (has_more) {
      const response: QueryDatabaseResponse = await notion.databases.query({
        database_id: NOTION_DEMO_DATABASE_ID,
        start_cursor: next_cursor ?? undefined,
        sorts: [
          {
            property: "완성일", // ID 속성을 기준으로 정렬
            direction: "descending", // 오름차순 정렬
          },
        ],
      });

      if (response.results.length === 0 && result.length === 0) {
        return Response.json(
          { message: "No matching records found." },
          {
            status: 404,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      // console.log(response.results);
      result = result.concat(response.results); // 결과를 배열에 추가

      has_more = response.has_more; // has_more 업데이트
      next_cursor = response.next_cursor; // next_cursor 업데이트
    }
    return Response.json(result);
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
