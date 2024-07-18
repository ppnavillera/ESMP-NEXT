import Mp3Player from "./player";
import notion from "./notionPOST";
import getTest from "./notionGET";

interface Mp3Link {
  name: string;
  url: string;
}

export default async function Page() {
  const notionSongs: Mp3Link[] = await notion();
  return (
    <>
      {/* <h1>mp3 player</h1> */}
      <Mp3Player songs={notionSongs} />
    </>
  );
}
