import { getSlackService } from "@/src/container";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
      const contentType = request.headers.get('content-type');
      
      let data: any;
      
      if (contentType?.includes('application/json')) {
        data = await request.json();
      } else {
        const text = await request.text();
        data = Object.fromEntries(new URLSearchParams(text));
        
        if (data.payload) {
          data.payload = JSON.parse(data.payload);
        }
      }
      
        const slackService = getSlackService();
        const response = await slackService.handleSlack(data);
      
      return NextResponse.json({ 
        response_type: 'ephemeral',
        text: JSON.stringify(response)
      });
    } catch (error) {
      console.error('Error en Slack webhook:', error);
      return NextResponse.json(
        { error: 'Error procesando webhook de Slack' },
        { status: 500 }
      );
    }
  }