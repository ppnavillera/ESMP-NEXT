// "use client";

// import { useParams } from "next/navigation";
// import SongData from "../../player/songData";
// import { useState } from "react";

// interface ParamsName {
//   name: string;
// }

// export default function Detail() {
//   // const params = useParams<{ name: string }>();
//   const params = useParams();
//   const { name } = params;
//   // const { name } = params as { name: string };
//   const decodedName = decodeURIComponent(name);

//   const [isOpen, setIsOpen] = useState(false);

//   const toggleAccordion = () => {
//     setIsOpen(!isOpen);
//   };

//   return (
//     <>
//       <div className="border-b">
//         <button
//           className="w-full flex justify-between items-center p-4 bg-gray-200"
//           onClick={toggleAccordion}
//         >
//           <span>h</span>
//           <span>{isOpen ? "-" : "+"}</span>
//         </button>
//         {isOpen && <div className="p-4 bg-gray-100">hi</div>}
//       </div>
//       {/* <SongData name={name} /> */}
//       <h1>{decodedName}</h1>
//       <SongData name={decodedName} />
//     </>
//   );
// }

// //상세 페이지 드롭다운
// //sorting by 날짜.
// //제목 /  멜메, 포프, 스케치, 마스터, 작사, 가이드
// // 필터링

// pages/index.jsx
import Head from "next/head";
import Accordion from "./acco";

const items = [
  { title: "제목 영역 1", content: "내용 영역 1" },
  { title: "제목 영역 2", content: "내용 영역 2" },
  { title: "제목 영역 3", content: "내용 영역 3" },
];

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center py-4">
      <Head>
        <title>Next.js Accordion Example</title>
      </Head>
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Accordion Example
        </h1>
        <Accordion items={items} />
      </div>
    </div>
  );
}
