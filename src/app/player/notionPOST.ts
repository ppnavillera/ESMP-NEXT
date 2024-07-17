const notionPOST = async () => {
  const NOTION_TOKEN = process.env.NEXT_PUBLIC_NOTION_TOKEN;
  const NOTION_DATABASE_ID = process.env.NEXT_PUBLIC_NOTION_DATABASE_ID;

  let hasMore = true;
  let startCursor = undefined;
  let allPages: any[] = [];

  try {
    while (hasMore) {
      const response: any = await fetch(
        `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${NOTION_TOKEN}`,
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28",
          },
          body: JSON.stringify({ start_cursor: startCursor }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const data = await response.json();
      allPages = allPages.concat(data.results);
      hasMore = data.has_more;
      startCursor = data.next_cursor;
    }
  } catch (error) {
    console.error("Error fetching data from Notion:", error);
    throw error;
  }
  const songs = allPages.map(
    (page: {
      properties: {
        Link: { url: string };
        Song: { title: { text: { content: string } }[] };
      };
    }) => {
      return {
        name: page.properties.Song.title[0].text.content,
        url: page.properties.Link.url,
      };
    }
  );
  return songs;
};

export default notionPOST;
