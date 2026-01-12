import { NextResponse } from 'next/server';
import { SlackFactory } from '../factories/SlackFactory';
import type { SlackSubscriptionData } from '../types/slack';
import { SubscriptionRepository } from '../repositories/SubscriptionRepository';
import { CreateSubscriptionDto } from '../dtos/subscription.dto';

enum SlackCommands {
    HELP = 'help',
    CREATE = 'create'
}

export class SlackService {
    constructor(private readonly subscriptionRepository: SubscriptionRepository) {}

    
    public async handle(data: Record<string, unknown>) {
        if (data.payload && typeof data.payload === 'object') {
            return this.handleInteraction(data.payload as Record<string, unknown>);
        }

        return this.handleCommand(data);
    }

    private async handleCommand(data: Record<string, unknown>) {
        const text = (data.text as string) || '';
        const command = text.split(' ')[0];
        
        switch (command) {
            case SlackCommands.HELP:
                return this.respondWithBlocks(SlackFactory.getHelpMessage());
                
            case SlackCommands.CREATE:
                return this.openModal(
                    data.trigger_id as string,
                    SlackFactory.getCreateSubscriptionModal()
                );
                
            default:
                return this.respondWithBlocks(
                    SlackFactory.getErrorMessage('Command not found')
                );
        }
    }

    private async handleInteraction(payload: Record<string, unknown>) {
        const type = payload.type as string;

        if (type === 'view_submission') {
            return this.handleModalSubmission(payload);
        }
        
        return NextResponse.json({ response_action: 'clear' });
    }

    private async handleModalSubmission(payload: Record<string, unknown>) {
        try {
            const view = payload.view as any;
            const values = view?.state?.values;
            
            if (!values) {
                return NextResponse.json({ 
                    response_action: 'errors', 
                    errors: { name_block: 'Invalid form submission' } 
                });
            }

            const validationResult = this.validateAndExtractFormData(values);
            
            if ('errors' in validationResult) {
                return NextResponse.json({
                    response_action: 'errors',
                    errors: validationResult.errors
                });
            }

            const subscription = validationResult.data;
            
            console.log('✅ Nueva suscripción:', subscription);

            // Guardar en base de datos
            const dto = new CreateSubscriptionDto({
                name: subscription.name,
                price: subscription.price,
                currency: subscription.currency,
                renewalCycle: subscription.renewalCycle,
                renewalDate: subscription.renewalDate,
                slackUserIds: subscription.users,
                projects: subscription.projects
            });

            // Extraer workspace_id y user_id del payload
            const workspaceId = (payload.team as any)?.id || 'unknown';
            const userId = (payload.user as any)?.id || 'unknown';

            const savedSubscription = await this.subscriptionRepository.create(dto, workspaceId, userId);
            console.log('💾 Suscripción guardada con ID:', savedSubscription.id);
            
            return NextResponse.json({
                response_action: 'update',
                view: SlackFactory.getSuccessModal(subscription)
            });
        } catch (error) {
            console.error('❌ Error in handleModalSubmission:', error);
            return NextResponse.json({
                response_action: 'errors',
                errors: {
                    name_block: 'An error occurred. Please try again.'
                }
            });
        }
    }

    private validateAndExtractFormData(values: Record<string, any>) {
        const nameValue = values.name_block?.name_input;
        const priceValue = values.price_block?.price_input;
        const currencyValue = values.currency_block?.currency_select;
        const renewalCycleValue = values.renewal_cycle_block?.renewal_cycle_select;
        const dateValue = values.date_block?.date_input;
        const usersValue = values.users_block?.users_select;
        const projectsValue = values.projects_block?.projects_select;

        if (!nameValue?.value) {
            return { errors: { name_block: 'Name is required' } };
        }

        if (!priceValue?.value) {
            return { errors: { price_block: 'Price is required' } };
        }

        const price = parseFloat(priceValue.value);
        if (Number.isNaN(price) || price <= 0) {
            return { 
                errors: { price_block: 'Price must be a valid number greater than 0' } 
            };
        }

        if (!currencyValue?.selected_option?.value) {
            return { errors: { currency_block: 'Currency is required' } };
        }

        if (!renewalCycleValue?.selected_option?.value) {
            return { errors: { renewal_cycle_block: 'Renewal period is required' } };
        }

        if (!dateValue?.selected_date) {
            return { errors: { date_block: 'Date is required' } };
        }

        const users = usersValue?.selected_users || [];
        const projects = projectsValue?.selected_options?.map((o: any) => o.value) || [];

        return {
            data: {
                name: nameValue.value,
                price: price,
                currency: currencyValue.selected_option.value,
                renewalCycle: renewalCycleValue.selected_option.value as 'MONTHLY' | 'YEARLY' | 'CUSTOM',
                renewalDate: dateValue.selected_date,
                users: users,
                projects: projects
            } as SlackSubscriptionData
        };
    }

    private async openModal(triggerId: string, modalView: any) {
        const slackToken = process.env.SLACK_BOT_TOKEN;
        
        if (!slackToken) {
            console.error('❌ SLACK_BOT_TOKEN not configured');
            return this.respondWithText(':x: Error: Slack bot token not configured');
        }

        try {
            const response = await fetch('https://slack.com/api/views.open', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${slackToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    trigger_id: triggerId,
                    view: modalView
                })
            });

            const result = await response.json();
            
            if (!result.ok) {
                console.error('❌ Error opening modal:', result.error);
                return this.respondWithText(':x: Error opening modal');
            }

            return new NextResponse('', { status: 200 });
        } catch (error) {
            console.error('❌ Error calling Slack API:', error);
            return this.respondWithText(':x: Error connecting to Slack');
        }
    }

    
    private async notifyUsers(userIds: string[], message: string) {
        const slackToken = process.env.SLACK_BOT_TOKEN;
        
        if (!slackToken) {
            console.error('❌ SLACK_BOT_TOKEN not configured');
            return;
        }

        for (const userId of userIds) {
            try {
                 await fetch('https://slack.com/api/chat.postMessage', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${slackToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        channel: userId,
                        text: message
                    })
                });

                
                
                
            } catch (error) {
                console.error(`❌ Error notificando a ${userId}:`, error);
            }
        }
    }

    
    private respondWithText(text: string) {
        return NextResponse.json({ 
            response_type: 'ephemeral',
            text: text
        });
    }

    private respondWithBlocks(blocks: any) {
        return NextResponse.json({ 
            response_type: 'ephemeral',
            ...blocks
        });
    }
}
