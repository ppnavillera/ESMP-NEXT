import Mp3Player from "./player";
import notion from "./notionPOST";
import getTest from "./notionGET";

interface Mp3Link {
  name: string;
  url: string;
}

export default async function Page() {
  const notionSongs: Mp3Link[] = await notion();
  // console.log(notionSongs.length);
  const get = await getTest();
  // console.log(get.json());
  return (
    <>
      <div className="container">mp3 player</div>
      <Mp3Player songs={notionSongs} />
    </>
  );
}
