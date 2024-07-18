const { Client } = require("@notionhq/client");

const NOTION_TOKEN = process.env.NEXT_PUBLIC_NOTION_TOKEN;
const NOTION_DEMO_DATABASE_ID = process.env.NEXT_PUBLIC_NOTION_DEMO_DATABASE_ID;

const notion = new Client({ auth: NOTION_TOKEN });

// export const dynamic = "force-dynamic"; // defaults to auto
export async function POST(request: Request): Promise<Response> {
  try {
    const { filter } = await request.json();
    console.log(filter);
    const response = await notion.databases.query({
      database_id: NOTION_DEMO_DATABASE_ID,
      filter,
    });
    console.log(response);

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
