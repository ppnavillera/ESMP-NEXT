import next from "next";

const { Client } = require("@notionhq/client");

const NOTION_DEMO_TOKEN = process.env.NEXT_PUBLIC_NOTION_TOKEN;
const NOTION_DEMO_DATABASE_ID = process.env.NEXT_PUBLIC_NOTION_DATABASE_ID2;

const notion = new Client({ auth: NOTION_DEMO_TOKEN });

// export const dynamic = "force-dynamic"; // defaults to auto
export async function POST(request: Request): Promise<Response> {
  try {
    const { filter } = await request.json();
    const response = await notion.databases.query({
      database_id: NOTION_DEMO_DATABASE_ID,
      filter,
    });

    if (response.results.length === 0) {
      return Response.json(
        { message: "No matching records found." },
        {
          status: 404, // 상태 코드를 404로 설정
          headers: {
            "Content-Type": "application/json", // 헤더 설정
          },
        }
      );
    }

    const data = response.results[0];
    const songData = data.properties;

    const props = [];
    // props.push(songData.Title.title[0].text.content);

    // console.log(songData);
    for (const key in songData) {
      if (songData.hasOwnProperty(key)) {
        let propType = songData[key].type;
        // props.push(songData[key].type);
        if (propType === "checkbox") {
          if (songData[key].checkbox === true) {
            props.push(`${key}: O`);
          } else {
            props.push(`${key}: x`);
          }
        } else if (propType === "select") {
          props.push(`${key}: ${songData[key].select.name}`);
        } else if (propType === "multi_select") {
          const multiSelect = songData[key].multi_select;
          const names = multiSelect.map((item: { name: any }) => {
            return item.name;
          });
          props.push(`${key}: ${names}`);
        } else if (propType === "number") {
          props.push(`${key}: ${songData[key].number}`);
        } else if (propType === "date") {
          props.push(`${key}: ${songData[key].date.start}`);
        } else if (propType === "rich_text") {
          if (songData[key].rich_text[0]) {
            props.push(`${key}: ${songData[key].rich_text[0].text.content}`);
          } else {
            props.push(`${key}: X`);
          }
        }
      }
    }
    // console.log(songData);
    return Response.json(props);
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
    let next_cursor: string | undefined = undefined; // 초기화
    let result: any[] = []; // 초기화 및 타입 변경

    while (has_more) {
      const response = await notion.databases.query({
        database_id: NOTION_DEMO_DATABASE_ID,
        start_cursor: next_cursor,
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
