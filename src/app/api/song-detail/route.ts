import { Client } from "@notionhq/client";
import { NextRequest, NextResponse } from "next/server";

const NOTION_DEMO_TOKEN = process.env.NEXT_PUBLIC_NOTION_TOKEN;
const NOTION_DEMO_DATABASE_ID = process.env.NEXT_PUBLIC_NOTION_DATABASE_ID2;

const notion = new Client({ auth: NOTION_DEMO_TOKEN });

// Player용 단일 곡 상세 정보 조회 (데이터 가공)
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const { filter } = await request.json();
    const response = await notion.databases.query({
      database_id: NOTION_DEMO_DATABASE_ID!,
      filter,
    });

    if (response.results.length === 0) {
      return NextResponse.json(
        { message: "No matching records found." },
        { status: 404 }
      );
    }

    const data = response.results[0] as any;
    const songData = data.properties;

    // 순서를 정의하는 배열
    const order = [
      "date",
      "sold",
      "멜로디메이커",
      "포스트프로덕션",
      "스케치트랙메이커",
      "마스터트랙메이커",
      "작사",
      "코러스",
      "가이드비",
    ];

    // 프로퍼티를 저장할 배열
    let props: any[] = [];
    let dateSold: any[] = [];

    // songData를 순회하며 props 배열에 값을 푸시
    for (const key in songData) {
      if (songData.hasOwnProperty(key)) {
        if (key === "확정") {
          if (songData[key].checkbox === true) {
            dateSold.push({ sold: true });
          } else {
            dateSold.push({ sold: false });
          }
        } else if (key === "완성일") {
          dateSold.push({ date: `${songData[key].date.start}` });
        } else if (key === "멜로디메이커") {
          const multiSelect = songData[key].multi_select;
          const names = multiSelect.map((item: { name: any }) => {
            return item.name;
          });
          props.push({ key: "멜로디메이커", value: `Ⓜ: ${names}` });
        } else if (key === "포스트프로덕션") {
          const multiSelect = songData[key].multi_select;
          const names = multiSelect.map((item: { name: any }) => {
            return item.name;
          });
          props.push({ key: "포스트프로덕션", value: `Ⓟ: ${names}` });
        } else if (key === "스케치트랙메이커") {
          const multiSelect = songData[key].multi_select;
          const names = multiSelect.map((item: { name: any }) => {
            return item.name;
          });
          props.push({ key: "스케치트랙메이커", value: `Ⓢ: ${names}` });
        } else if (key === "마스터트랙메이커") {
          const multiSelect = songData[key].multi_select;
          const names = multiSelect.map((item: { name: any }) => {
            return item.name;
          });
          props.push({ key: "마스터트랙메이커", value: `Ⓣ: ${names}` });
        } else if (key === "작사") {
          const multiSelect = songData[key].multi_select;
          const names = multiSelect.map((item: { name: any }) => {
            return item.name;
          });
          props.push({ key: "작사", value: `Ⓛ: ${names}` });
        } else if (key === "코러스") {
          const multiSelect = songData[key].multi_select;
          const names = multiSelect.map((item: { name: any }) => {
            return item.name;
          });
          props.push({ key: "코러스", value: `Ⓒ: ${names}` });
        } else if (key === "가이드비") {
          props.push({ key: "가이드비", value: `Ⓖ: ${songData[key].number}` });
        }
      }
    }

    // 원하는 순서대로 props 배열을 정렬
    props.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));

    // POST 요청은 캐싱하기 어려우므로 no-store
    return NextResponse.json({ props, dateSold }, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json(
        { error: "Unknown error occurred" },
        { status: 500 }
      );
    }
  }
}
