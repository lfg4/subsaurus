import { SlackFactory } from "../factories/SlackFactory"
import type { SlackResponse, SlackInteractionPayload, SlackSubscriptionData } from "../types/slack"

enum SlackCommands {
    HELP = 'help',
    CREATE = 'create'
}

export class SlackService {
    constructor() {}

    public async handleSlack(data: Record<string, unknown>): Promise<SlackResponse> {
        const message = (data.text as string)?.split(' ') || [];
        const action = message[0];
        
        switch (action) {
            case SlackCommands.HELP:
                return SlackFactory.getHelpMessage();
            case SlackCommands.CREATE:
                // Para abrir un modal, necesitamos el trigger_id
                return {
                    type: 'modal',
                    trigger_id: data.trigger_id as string,
                    view: SlackFactory.getCreateSubscriptionModal()
                };
            default:
                return SlackFactory.getErrorMessage('Command not found');
        }
    }

    public async handleInteraction(payload: SlackInteractionPayload) {
        // Cuando el usuario hace submit del modal
        if (payload.type === 'view_submission') {
            return this.handleViewSubmission(payload);
        }
        
        return { response_action: 'clear' };
    }

    private async handleViewSubmission(payload: SlackInteractionPayload) {
        try {
            const values = payload.view?.state.values;
            
            console.log('📋 Form values:', JSON.stringify(values, null, 2));
            
            if (!values) {
                return { 
                    response_action: 'errors', 
                    errors: { name_block: 'Invalid form submission' } 
                };
            }

            // Extraer los datos del formulario de forma segura
            const nameValue = values.name_block?.name_input as any;
            const priceValue = values.price_block?.price_input as any;
            const dateValue = values.date_block?.date_input as any;
            const usersValue = values.users_block?.users_select as any;
            const projectsValue = values.projects_block?.projects_select as any;

            // Validar campos requeridos
            if (!nameValue?.value) {
                return {
                    response_action: 'errors',
                    errors: { name_block: 'Name is required' }
                };
            }

            if (!priceValue?.value) {
                return {
                    response_action: 'errors',
                    errors: { price_block: 'Price is required' }
                };
            }

            if (!dateValue?.selected_date) {
                return {
                    response_action: 'errors',
                    errors: { date_block: 'Date is required' }
                };
            }

            const subscription: SlackSubscriptionData = {
                name: nameValue.value,
                price: parseFloat(priceValue.value),
                renewalDate: dateValue.selected_date,
                users: usersValue?.selected_users || [],
                projects: projectsValue?.selected_options?.map((o: any) => o.value) || []
            };

            console.log('✅ Nueva suscripción:', subscription);

            // TODO: Aquí guardarías en la base de datos
            // await subscriptionRepository.create(subscription);

            // Respuesta de éxito
            return {
                response_action: 'update',
                view: SlackFactory.getSuccessModal(subscription)
            };
        } catch (error) {
            console.error('❌ Error in handleViewSubmission:', error);
            return {
                response_action: 'errors',
                errors: {
                    name_block: 'An error occurred. Please try again.'
                }
            };
        }
    }
}