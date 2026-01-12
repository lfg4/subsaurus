import { getSlackService } from "@/src/container";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { SlackResponse, SlackModalResponse } from "@/src/types/slack";

export async function POST(request: NextRequest) {
    try {
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

      if (data.type === 'url_verification' && data.challenge) {
        return NextResponse.json({ challenge: data.challenge });
      }
      
      const slackService = getSlackService();
      
      if (data.payload && typeof data.payload === 'object') {
        try {
          const response = await slackService.handleInteraction(data.payload as { type: string; [key: string]: unknown });
          return NextResponse.json(response);
        } catch (error) {
          console.error('❌ Error handling interaction:', error);
          return NextResponse.json({
            response_action: 'errors',
            errors: {
              name_block: 'Error processing form. Check server logs.'
            }
          });
        }
      }
      
      const response: SlackResponse = await slackService.handleSlack(data);
      
      if (typeof response === 'object' && 'type' in response && response.type === 'modal') {
        const modalResponse = response as SlackModalResponse;
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

        await fetch('https://slack.com/api/chat.postMessage', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${slackToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              channel: "U07KE5UBS85", // 👈 El user ID es el "canal" para DMs
              text: "🔔 Netflix se renueva en 3 días (€15.99)"
            })
          })
        
        return new NextResponse('', { status: 200 });
      }
      
      if (typeof response === 'string') {
        return NextResponse.json({ 
          response_type: 'ephemeral',
          text: response
        });
      }
      
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