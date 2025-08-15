import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url, filename, password } = await request.json();
    
    // 비밀번호 확인
    const correctPassword = process.env.NEXT_PUBLIC_DOWNLOAD_PASSWORD || "0000";
    if (password !== correctPassword) {
      return NextResponse.json(
        { error: "비밀번호가 일치하지 않습니다." },
        { status: 401 }
      );
    }

    // Firebase Storage에서 파일 가져오기
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    
    // 파일 다운로드 응답 생성
    const headers = new Headers({
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}.mp3"`,
      'Content-Length': arrayBuffer.byteLength.toString(),
    });

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: "다운로드에 실패했습니다." },
      { status: 500 }
    );
  }
}