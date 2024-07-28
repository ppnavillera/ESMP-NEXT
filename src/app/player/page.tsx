import Mp3Player from "./player";
import notion from "./notionPOST";

interface Mp3Link {
  name: string;
  url: string;
}

export default async function Page() {
  const notionSongs: Mp3Link[] = await notion();
  return (
    <>
      <Mp3Player songs={notionSongs} />
    </>
  );
}
