"use client";

import { useParams } from "next/navigation";
import SongData from "../../player/songData";

interface ParamsName {
  name: string;
}

export default function Detail() {
  // const params = useParams<{ name: string }>();
  const params = useParams();
  const { name } = params;
  // const { name } = params as { name: string };
  const decodedName = decodeURIComponent(name);

  return (
    <>
      {/* <SongData name={name} /> */}
      <h1>{decodedName}</h1>
      <SongData name={decodedName} />
    </>
  );
}

//상세 페이지 드롭다운
//sorting by 날짜.
//제목 /  멜메, 포프, 스케치, 마스터, 작사, 가이드
// 필터링
