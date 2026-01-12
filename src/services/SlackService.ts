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
        const values = payload.view?.state.values;
        
        if (!values) {
            return { response_action: 'errors', errors: { general: 'Invalid submission' } };
        }

        // Extraer los datos del formulario
        const subscription: SlackSubscriptionData = {
            name: (values.name_block?.name_input as { value: string }).value,
            price: parseFloat((values.price_block?.price_input as { value: string }).value),
            renewalDate: (values.date_block?.date_input as { selected_date: string }).selected_date,
            users: (values.users_block?.users_select as { selected_options?: Array<{ value: string }> })
                .selected_options?.map(o => o.value) || [],
            projects: (values.projects_block?.projects_select as { selected_options?: Array<{ value: string }> })
                .selected_options?.map(o => o.value) || []
        };

        console.log('Nueva suscripción:', subscription);

        // TODO: Aquí guardarías en la base de datos
        // await subscriptionRepository.create(subscription);

        // Respuesta de éxito
        return {
            response_action: 'update',
            view: SlackFactory.getSuccessModal(subscription)
        };
    }
}