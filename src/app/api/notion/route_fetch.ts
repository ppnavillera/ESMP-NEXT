const NOTION_TOKEN = process.env.NEXT_PUBLIC_NOTION_TOKEN;
const NOTION_DEMO_DATABASE_ID = process.env.NEXT_PUBLIC_NOTION_DEMO_DATABASE_ID;

const notionHeaders = {
  Authorization: `Bearer ${NOTION_TOKEN}`,
  "Content-Type": "application/json",
  "Notion-Version": "2022-06-28",
};

export const dynamic = "force-dynamic"; // defaults to auto
export async function POST(request: Request) {
  const searchUrl = `https://api.notion.com/v1/databases/${NOTION_DEMO_DATABASE_ID}/query`;
  const query = await request.json();
  console.log(query);
  try {
    const response = await fetch(searchUrl, {
      method: "POST",
      headers: notionHeaders,
      body: JSON.stringify(query),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const songData = data.results[0].properties;

    const props = [];
    props.push(songData.Title.title[0].text.content);

    console.log(songData);
    for (const key in songData) {
      if (songData.hasOwnProperty(key)) {
        let propType = songData[key].type;
        props.push(songData[key].type);
        if (propType === "checkbox") {
          if (songData[key].checkbox === true) {
            console.log(`${key}: O`);
          } else {
            console.log(`${key}: x`);
          }
        } else if (propType === "select") {
          console.log(`${key}: ${songData[key].select.name}`);
        } else if (propType === "multi_select") {
          const multiSelect = songData[key].multi_select;
          const names = multiSelect.map((item: { name: any }) => {
            return item.name;
          });
          console.log(`${key}: ${names}`);
        } else if (propType === "number") {
          console.log(`${key}: ${songData[key].number}`);
        } else if (propType === "date") {
          console.log(`${key}: ${songData[key].date.start}`);
        } else if (propType === "rich_text") {
          if (songData[key].rich_text[0]) {
            console.log(`${key}: ${songData[key].rich_text[0].text.content}`);
          } else {
            console.log(`${key}: X`);
          }
        }
      }
    }
    return Response.json(songData);
    // return Response.json("1");
  } catch (error) {
    console.log(error);
    return Response.json(error);
  }
}
