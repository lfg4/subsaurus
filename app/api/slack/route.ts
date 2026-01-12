import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
      const data = await request.json();
      
      console.log(data)
      return NextResponse.json({ status: 'ok' }, { status: 200 });
    } catch (error) {
      console.error( error);
      return NextResponse.json(
        { error: error },
        { status: 500 }
      );
    }
  }