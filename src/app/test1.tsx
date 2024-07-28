// "use client";

// import { useEffect, useState } from "react";

// export default function Test1() {
//   const [songs, setSongs] = useState([]);
//   const [hasMore, setHasMore] = useState(true);
//   const [startCursor, setStartCursor] = useState(undefined);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         while (hasMore) {
//           const response = await fetch("/api/songlist", {
//             method: "GET",
//             headers: {
//               "Content-Type": "application/json",
//             },
//           });

//           const data = await response.json();
//           console.log(data);
//         }
//       } catch {}
//     };
//     fetchData();
//   }, [hasMore, startCursor]);
//   return (
//     <>
//       <h1>hi</h1>
//     </>
//   );
// }

"use client";

import { useEffect, useState } from "react";

export default function Test1() {
  const [songs, setSongs] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [startCursor, setStartCursor] = useState(undefined);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   const fetchData = async (cursor) => {
  //     try {
  //       const response = await fetch(
  //         `/api/songlist?start_cursor=${cursor || ""}`,
  //         {
  //           method: "GET",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //         }
  //       );

  //       const json = await response.json();
  //       console.log(json);

  //       // setSongs((prevSongs) => [...prevSongs, ...json.results]);
  //       // setHasMore(json.has_more);
  //       // setStartCursor(json.next_cursor);
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     }
  //   };

  //   if (hasMore) {
  //     fetchData(startCursor);
  //   }
  //   console.log(songs);
  // }, [hasMore, startCursor]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/songlist`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const json = await response.json();
      console.log(json);

      setSongs((prevSongs) => [...prevSongs, ...json.results]);
      // setHasMore(json.has_more);
      // setStartCursor(json.next_cursor);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // console.log(page);
  }, [page]);

  const handleObserver = (entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && !loading) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0,
    });
    const observerTarget = document.getElementById("observer");
    if (observerTarget) {
      observer.observe(observerTarget);
    }
  });
  return (
    <div>
      <ul>
        {songs.map((song, index) => {
          const title = song.properties.Song.title[0].text.content;
          return <li key={index}>{title}</li>;
        })}
      </ul>
      <div id="observer" style={{ height: "10px" }}></div>
    </div>
  );
}
