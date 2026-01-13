import { NextResponse } from 'next/server';
import { SlackFactory } from '../factories/SlackFactory';
import type { SlackSubscriptionData } from '../types/slack';
import type { CreateSubscriptionService } from './CreateSubscriptionService';
import type { UsageResponseRepository } from '../repositories/UsageResponseRepository';
import type { RenewalCycle } from '../types/enums';
import { UsageResponseType } from '../types/enums';

enum SlackCommands {
    HELP = 'help',
    CREATE = 'create'
}

export class SlackService {
    private slackToken: string;
    constructor(
        private readonly createSubscriptionService: CreateSubscriptionService,
        private readonly usageResponseRepository: UsageResponseRepository
    ) {
        this.slackToken = process.env.SLACK_BOT_TOKEN || '';
        if (!this.slackToken) {
            console.error('❌ SLACK_BOT_TOKEN not configured');
            throw new Error('Slack bot token not configured');
        }
    }

    
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
        
        if (type === 'block_actions') {
            return this.handleBlockActions(payload);
        }
        
        return NextResponse.json({ response_action: 'clear' });
    }

    private async handleBlockActions(payload: Record<string, unknown>) {
        try {
            const actions = (payload.actions as any[])?.[0];
            if (!actions) {
                return NextResponse.json({ ok: true });
            }

            const actionId = actions.action_id as string;
            const value = actions.value as string;
            const userId = (payload.user as any)?.id;

            if (actionId?.startsWith('usage_response_')) {
                return this.handleUsageResponse(value, userId);
            }

            return NextResponse.json({ ok: true });
        } catch (error) {
            console.error('❌ Error handling block actions:', error);
            return NextResponse.json({ ok: true });
        }
    }

    private async handleUsageResponse(value: string, userId: string) {
        try {
            const [usageCheckIdStr, response] = value.split('|');
            const usageCheckId = parseInt(usageCheckIdStr, 10);

            if (!usageCheckId || !response) {
                throw new Error('Invalid button value format');
            }

            const usageResponse = await this.usageResponseRepository.findPendingByUsageCheckAndUser(
                usageCheckId,
                userId
            );

            if (!usageResponse) {
                console.error(`❌ UsageResponse not found for check ${usageCheckId} and user ${userId}`);
                return NextResponse.json({
                    text: '❌ Your pending response was not found.',
                });
            }

            await this.usageResponseRepository.updateResponse(
                usageResponse.id,
                response as UsageResponseType
            );

            console.log(`✅ User ${userId} responded ${response} to usage check ${usageCheckId}`);

            const responseMessages: Record<string, string> = {
                [UsageResponseType.YES]: '✅ Great! Thanks for confirming you\'re using this subscription.',
                [UsageResponseType.NO]: '🚫 Got it. We will consider canceling if you\'re not using it.',
                [UsageResponseType.LITTLE]: '🤔 Hmm, maybe we could optimize the plan. Thanks for the feedback!',
            };

            this.notifyUsers([userId], responseMessages[response]);

            return NextResponse.json({
                text: '✅ Response recorded.',
            });
        } catch (error) {
            console.error('❌ Error handling usage response:', error);
            return NextResponse.json({
                text: '❌ There was an error processing your response.',
            });
        }
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
            
            
            const workspaceId = (payload.team as any)?.id || 'unknown';
            const userId = (payload.user as any)?.id || 'unknown';

            await this.createSubscriptionService.run(
                subscription, 
                workspaceId, 
                userId
            );
            
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
                renewalCycle: renewalCycleValue.selected_option.value as RenewalCycle,
                renewalDate: dateValue.selected_date,
                users: users,
                projects: projects
            } as SlackSubscriptionData
        };
    }

    private async openModal(triggerId: string, modalView: any) {

        try {
            const response = await fetch('https://slack.com/api/views.open', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.slackToken}`,
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

    
    public async notifyUsers(userIds: string[], message: string | { blocks: unknown[] }) {
        const sendPromises = userIds.map(async (userId) => {
            try {
                const body = typeof message === 'string' 
                    ? { channel: userId, text: message }
                    : { channel: userId, blocks: message.blocks, text: 'Notification' };

                const response = await fetch('https://slack.com/api/chat.postMessage', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.slackToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                });

                const result = await response.json();
                
                if (!result.ok) {
                    throw new Error(`Slack API error: ${result.error}`);
                }

                console.log(`📤 Message sent to user ${userId}`);
            } catch (error) {
                console.error(`❌ Error notificando a ${userId}:`, error);
                throw error;
            }
        });

        await Promise.allSettled(sendPromises);
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
