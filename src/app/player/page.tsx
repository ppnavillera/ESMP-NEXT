import Player from "./Player";

interface Mp3Link {
  name: string;
  url: string;
}

export default async function Page() {
  // const notionSongs: Mp3Link[] = await notion();
  return (
    <>
      <Player />
    </>
  );
}
