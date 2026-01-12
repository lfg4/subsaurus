import { getSlackService } from "@/src/container";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { SlackResponse, SlackModalResponse } from "@/src/types/slack";

export async function POST(request: NextRequest) {
    try {
        console.log('🔔 Slack webhook received');
      const contentType = request.headers.get('content-type');
      
      let data: Record<string, unknown>;
      
      if (contentType?.includes('application/json')) {
        data = await request.json() as Record<string, unknown>;
      } else {
        const text = await request.text();
        const parsed = Object.fromEntries(new URLSearchParams(text));
        data = parsed as Record<string, unknown>;
        
        if (typeof data.payload === 'string') {
          data.payload = JSON.parse(data.payload) as Record<string, unknown>;
        }
      }

      // Slack URL Verification Challenge (cuando configuras la URL por primera vez)
      if (data.type === 'url_verification' && data.challenge) {
        console.log('✅ Responding to Slack URL verification challenge');
        return NextResponse.json({ challenge: data.challenge });
      }
      
      const slackService = getSlackService();
      
      // Si es una interacción (modal submission, button click, etc)
      if (data.payload && typeof data.payload === 'object') {
        console.log('📥 Interaction received:', JSON.stringify(data.payload, null, 2));
        try {
          const response = await slackService.handleInteraction(data.payload as { type: string; [key: string]: unknown });
          console.log('📤 Interaction response:', JSON.stringify(response, null, 2));
          return NextResponse.json(response);
        } catch (error) {
          console.error('❌ Error handling interaction:', error);
          // Responder con un error visible en el modal
          return NextResponse.json({
            response_action: 'errors',
            errors: {
              name_block: 'Error processing form. Check server logs.'
            }
          });
        }
      }
      
      // Si es un slash command
      const response: SlackResponse = await slackService.handleSlack(data);
      
      // Si la respuesta es para abrir un modal
      if (typeof response === 'object' && 'type' in response && response.type === 'modal') {
        const modalResponse = response as SlackModalResponse;
        // Necesitamos llamar a la API de Slack para abrir el modal
        const slackToken = process.env.SLACK_BOT_TOKEN;
        
        if (!slackToken) {
          console.error('SLACK_BOT_TOKEN no está configurado');
          return NextResponse.json({
            response_type: 'ephemeral',
            text: ':x: Error: Slack bot token not configured'
          });
        }
        
        await fetch('https://slack.com/api/views.open', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${slackToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            trigger_id: modalResponse.trigger_id,
            view: modalResponse.view
          })
        });
        
        // Responder vacío al comando (el modal se abre aparte)
        return new NextResponse('', { status: 200 });
      }
      
      // Si la respuesta es un string, convertirlo a formato de texto
      if (typeof response === 'string') {
        return NextResponse.json({ 
          response_type: 'ephemeral',
          text: response
        });
      }
      
      // Si la respuesta tiene blocks u otro formato, devolverlo tal cual
      return NextResponse.json({ 
        response_type: 'ephemeral',
        ...response
      });
    } catch (error) {
      console.error('Error en Slack webhook:', error);
      return NextResponse.json(
        { error: 'Error procesando webhook de Slack' },
        { status: 500 }
      );
    }
}