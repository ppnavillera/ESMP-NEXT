const NOTION_TOKEN = process.env.NEXT_PUBLIC_NOTION_TOKEN;
const NOTION_DEMO_DATABASE_ID = process.env.NEXT_PUBLIC_NOTION_DEMO_DATABASE_ID;

const notionHeaders = {
  Authorization: `Bearer ${NOTION_TOKEN}`,
  "Content-Type": "application/json",
  "Notion-Version": "2022-06-28",
};

const notionGET = async (name: string) => {
  const searchUrl = `https://api.notion.com/v1/databases/${NOTION_DEMO_DATABASE_ID}/query`;
  const title = name;
  const searchPayload = {
    filter: {
      property: "Title",
      title: {
        contains: title, // 'contains'로 변경하여 부분 일치 검색
      },
    },
  };
  const response = await fetch(searchUrl, {
    method: "POST",
    headers: notionHeaders,
    body: JSON.stringify(searchPayload),
  });
  const data = await response.json();
};

export default notionGET;
