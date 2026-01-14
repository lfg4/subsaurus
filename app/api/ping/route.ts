import { NextResponse } from 'next/server';

export async function GET() {
   
    const response = {text: 'pong'};
    return NextResponse.json(response);
 
}

