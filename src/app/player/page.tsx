import Mp3Player from "./player";

interface Mp3Link {
  name: string;
  url: string;
}

export default async function Page() {
  // const notionSongs: Mp3Link[] = await notion();
  return (
    <>
      <Mp3Player />
    </>
  );
}
