const { Client } = require("@notionhq/client");

const NOTION_TOKEN = process.env.NEXT_PUBLIC_NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NEXT_PUBLIC_NOTION_DATABASE_ID;

const notion = new Client({ auth: NOTION_TOKEN });

// export const dynamic = "force-dynamic"; // defaults to auto
export async function GET(request: Request) {
  const url = new URL(request.url);
  const startCursor = url.searchParams.get("start_cursor") || undefined;

  try {
    const data = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
      start_cursor: startCursor,
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

// const { Client } = require("@notionhq/client");

// const NOTION_TOKEN = process.env.NEXT_PUBLIC_NOTION_TOKEN;
// const NOTION_DATABASE_ID = process.env.NEXT_PUBLIC_NOTION_DATABASE_ID;

// const notion = new Client({ auth: NOTION_TOKEN });

// let hasMore = true;
// let startCursor: undefined = undefined;
// let allPages: any[] = [];

// // export const dynamic = "force-dynamic"; // defaults to auto
// export async function GET(request: Request) {
//   try {
//     while (hasMore) {
//       const data = await notion.databases.query({
//         database_id: NOTION_DATABASE_ID,
//         start_cursor: startCursor,
//       });
//       console.log(data);

//       allPages = allPages.concat(data.results);
//       hasMore = data.has_more;
//       startCursor = data.next_cursor;
//     }
//     return Response.json(allPages);
//   } catch (error) {
//     console.error("Error fetching data from Notion:", error);
//     throw error;
//   }
// }
// export async function getPages(){
//     try {
//         while (hasMore) {
//           const response: any = await fetch(
//             `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`,
//             {
//               method: "POST",
//               headers: {
//                 Authorization: `Bearer ${NOTION_TOKEN}`,
//                 "Content-Type": "application/json",
//                 "Notion-Version": "2022-06-28",
//               },
//               body: JSON.stringify({ start_cursor: startCursor }),
//             }
//           );

//           if (!response.ok) {
//             throw new Error(`Failed to fetch data: ${response.statusText}`);
//           }

//           const data = await response.json();
//           allPages = allPages.concat(data.results);
//           hasMore = data.has_more;
//           startCursor = data.next_cursor;
//         }
//       } catch (error) {
//         console.error("Error fetching data from Notion:", error);
//         throw error;
//       }
//       const songs = allPages.map(
//         (page: {
//           properties: {
//             Link: { url: string };
//             Song: { title: { text: { content: string } }[] };
//           };
//         }) => {
//           return {
//             name: page.properties.Song.title[0].text.content,
//             url: page.properties.Link.url,
//           };
//         }
//       );
//       return songs;
// }

// export const dynamic = "force-dynamic"; // defaults to auto
// export async function GET(request: Request): Promise<Response> {
//   try {
//     const { filter } = await request.json();
//     console.log(filter);
//     const response = await notion.databases.query({
//       database_id: NOTION_DATABASE_ID,
//       filter,
//     });
//     console.log(response);

//     if (response.results.length === 0) {
//       return Response.json(
//         { message: "No matching records found." },
//         {
//           status: 404, // 상태 코드를 404로 설정
//           headers: {
//             "Content-Type": "application/json", // 헤더 설정
//           },
//         }
//       );
//     }

//     const data = response.results[0];
//     const songData = data.properties;

//     const props = [];
//     // props.push(songData.Title.title[0].text.content);

//     // console.log(songData);
//     for (const key in songData) {
//       if (songData.hasOwnProperty(key)) {
//         let propType = songData[key].type;
//         // props.push(songData[key].type);
//         if (propType === "checkbox") {
//           if (songData[key].checkbox === true) {
//             props.push(`${key}: O`);
//           } else {
//             props.push(`${key}: x`);
//           }
//         } else if (propType === "select") {
//           props.push(`${key}: ${songData[key].select.name}`);
//         } else if (propType === "multi_select") {
//           const multiSelect = songData[key].multi_select;
//           const names = multiSelect.map((item: { name: any }) => {
//             return item.name;
//           });
//           props.push(`${key}: ${names}`);
//         } else if (propType === "number") {
//           props.push(`${key}: ${songData[key].number}`);
//         } else if (propType === "date") {
//           props.push(`${key}: ${songData[key].date.start}`);
//         } else if (propType === "rich_text") {
//           if (songData[key].rich_text[0]) {
//             props.push(`${key}: ${songData[key].rich_text[0].text.content}`);
//           } else {
//             props.push(`${key}: X`);
//           }
//         }
//       }
//     }
//     // console.log(songData);
//     return Response.json(props);
//   } catch (error) {
//     if (error instanceof Error) {
//       return Response.json({ error: error.message }, { status: 500 });
//     } else {
//       return Response.json(
//         { error: "Unknown error occurred" },
//         { status: 500 }
//       );
//     }
//   }
// }
