const { Client } = require("@notionhq/client");
import {
  PageObjectResponse,
  QueryDatabaseResponse,
} from "@notionhq/client/build/src/api-endpoints";

const NOTION_DEMO_TOKEN = process.env.NEXT_PUBLIC_NOTION_TOKEN;
const NOTION_DEMO_DATABASE_ID = process.env.NEXT_PUBLIC_NOTION_DATABASE_ID2;

const notion = new Client({ auth: NOTION_DEMO_TOKEN });

// // 타입 가드 함수 추가
// function isPageObjectResponse(obj: any): obj is PageObjectResponse {
//   return "properties" in obj;
// }

// export const dynamic = "force-dynamic"; // defaults to auto
export async function POST(request: Request): Promise<Response> {
  try {
    const { filter } = await request.json();
    const response = await notion.databases.query({
      database_id: NOTION_DEMO_DATABASE_ID,
      filter,
    });

    if (response.results.length === 0) {
      return Response.json(
        { message: "No matching records found." },
        {
          status: 404, // 상태 코드를 404로 설정
          headers: {
            "Content-Type": "application/json", // 헤더 설정
          },
        }
      );
    }

    const data = response.results[0];
    // // 타입 가드 사용하여 properties 속성 확인
    // if (!isPageObjectResponse(data)) {
    //   return Response.json(
    //     { error: "Unexpected response format" },
    //     { status: 500 }
    //   );
    // }

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
    let props = [];

    let dateSold = [];

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

    console.log(props);
    console.log(dateSold);

    return Response.json({ props, dateSold });
  } catch (error) {
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 500 });
    } else {
      return Response.json(
        { error: "Unknown error occurred" },
        { status: 500 }
      );
    }
  }
}

export async function GET(request: Request): Promise<Response> {
  try {
    let has_more = true; // 초기화
    let next_cursor: string | null = null; // 초기화
    let result: any[] = []; // 초기화 및 타입 변경

    while (has_more) {
      const response: QueryDatabaseResponse = await notion.databases.query({
        database_id: NOTION_DEMO_DATABASE_ID,
        start_cursor: next_cursor ?? undefined,
        sorts: [
          {
            property: "완성일", // ID 속성을 기준으로 정렬
            direction: "descending", // 오름차순 정렬
          },
        ],
      });

      if (response.results.length === 0 && result.length === 0) {
        return Response.json(
          { message: "No matching records found." },
          {
            status: 404,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      // console.log(response.results);
      result = result.concat(response.results); // 결과를 배열에 추가

      has_more = response.has_more; // has_more 업데이트
      next_cursor = response.next_cursor; // next_cursor 업데이트
    }
    return Response.json(result);
  } catch (error) {
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 500 });
    } else {
      return Response.json(
        { error: "Unknown error occurred" },
        { status: 500 }
      );
    }
  }
}
