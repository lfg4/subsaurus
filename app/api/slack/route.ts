import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
      // Slack envía datos como application/x-www-form-urlencoded
      const contentType = request.headers.get('content-type');
      
      let data: any;
      
      if (contentType?.includes('application/json')) {
        // Si es JSON (Slack Event API)
        data = await request.json();
      } else {
        // Si es form-urlencoded (Slash commands, Interactive messages)
        const text = await request.text();
        data = Object.fromEntries(new URLSearchParams(text));
        
        // Si tiene payload (para interactive components), parsearlo
        if (data.payload) {
          data.payload = JSON.parse(data.payload);
        }
      }
      
      console.log('Slack data:', data);
      
      // Responder rápidamente a Slack (tienen timeout de 3 segundos)
      return NextResponse.json({ 
        response_type: 'in_channel', // o 'ephemeral' para mensaje privado
        text: '¡Recibido! 👍'
      });
    } catch (error) {
      console.error('Error en Slack webhook:', error);
      return NextResponse.json(
        { error: 'Error procesando webhook de Slack' },
        { status: 500 }
      );
    }
  }