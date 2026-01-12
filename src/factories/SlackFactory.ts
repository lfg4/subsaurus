import type { SlackSubscriptionData } from "../types/slack";

// biome-ignore lint/complexity/noStaticOnlyClass: Factory pattern
export class SlackFactory {
    static getHelpMessage() {
        return {
            "blocks": [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": ":t-rex: Available Commands",
                        "emoji": true
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "*`/subsaurus help`*\nShow this help message"
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "*`/subsaurus create`*\nCreate a new subscription"
                    }
                },
                {
                    "type": "divider"
                },
                {
                    "type": "context",
                    "elements": [
                        {
                            "type": "mrkdwn",
                            "text": "💡 _More commands coming soon..._"
                        }
                    ]
                }
            ]
        }
    }

    static getErrorMessage(error: string) {
        return {
            "blocks": [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `:x: *Error*\n${error}`
                    }
                }
            ]
        }
    }

    static getCreateSubscriptionModal() {
        return {
            "type": "modal",
            "callback_id": "create_subscription_modal",
            "title": {
                "type": "plain_text",
                "text": "Create Subscription"
            },
            "submit": {
                "type": "plain_text",
                "text": "Create"
            },
            "close": {
                "type": "plain_text",
                "text": "Cancel"
            },
            "blocks": [
                {
                    "type": "input",
                    "block_id": "name_block",
                    "element": {
                        "type": "plain_text_input",
                        "action_id": "name_input",
                        "placeholder": {
                            "type": "plain_text",
                            "text": "e.g., Netflix Premium"
                        }
                    },
                    "label": {
                        "type": "plain_text",
                        "text": "Subscription Name"
                    }
                },
                {
                    "type": "input",
                    "block_id": "price_block",
                    "element": {
                        "type": "plain_text_input",
                        "action_id": "price_input",
                        "placeholder": {
                            "type": "plain_text",
                            "text": "e.g., 15.99"
                        }
                    },
                    "label": {
                        "type": "plain_text",
                        "text": "Price"
                    }
                },
                {
                    "type": "input",
                    "block_id": "currency_block",
                    "element": {
                        "type": "static_select",
                        "action_id": "currency_select",
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Select currency"
                        },
                        "initial_option": {
                            "text": {
                                "type": "plain_text",
                                "text": "EUR (€)"
                            },
                            "value": "EUR"
                        },
                        "options": [
                            {
                                "text": {
                                    "type": "plain_text",
                                    "text": "EUR (€)"
                                },
                                "value": "EUR"
                            },
                            {
                                "text": {
                                    "type": "plain_text",
                                    "text": "USD ($)"
                                },
                                "value": "USD"
                            },
                            {
                                "text": {
                                    "type": "plain_text",
                                    "text": "GBP (£)"
                                },
                                "value": "GBP"
                            }
                        ]
                    },
                    "label": {
                        "type": "plain_text",
                        "text": "Currency"
                    }
                },
                {
                    "type": "input",
                    "block_id": "renewal_cycle_block",
                    "element": {
                        "type": "static_select",
                        "action_id": "renewal_cycle_select",
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Select renewal period"
                        },
                        "initial_option": {
                            "text": {
                                "type": "plain_text",
                                "text": "Monthly"
                            },
                            "value": "MONTHLY"
                        },
                        "options": [
                            {
                                "text": {
                                    "type": "plain_text",
                                    "text": "Monthly"
                                },
                                "value": "MONTHLY"
                            },
                            {
                                "text": {
                                    "type": "plain_text",
                                    "text": "Yearly"
                                },
                                "value": "YEARLY"
                            }
                        ]
                    },
                    "label": {
                        "type": "plain_text",
                        "text": "Renewal Period"
                    }
                },
                {
                    "type": "input",
                    "block_id": "date_block",
                    "element": {
                        "type": "datepicker",
                        "action_id": "date_input",
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Select renewal date"
                        }
                    },
                    "label": {
                        "type": "plain_text",
                        "text": "Renewal Date"
                    }
                },
                {
                    "type": "input",
                    "block_id": "users_block",
                    "optional": true,
                    "element": {
                        "type": "multi_users_select",
                        "action_id": "users_select",
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Select users (optional)"
                        }
                    },
                    "label": {
                        "type": "plain_text",
                        "text": "Users"
                    }
                },
                {
                    "type": "input",
                    "block_id": "projects_block",
                    "optional": true,
                    "element": {
                        "type": "multi_static_select",
                        "action_id": "projects_select",
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Select projects (optional)"
                        },
                        "options": [
                            {
                                "text": {
                                    "type": "plain_text",
                                    "text": "Project Alpha"
                                },
                                "value": "project_alpha"
                            },
                            {
                                "text": {
                                    "type": "plain_text",
                                    "text": "Project Beta"
                                },
                                "value": "project_beta"
                            },
                            {
                                "text": {
                                    "type": "plain_text",
                                    "text": "Project Gamma"
                                },
                                "value": "project_gamma"
                            }
                        ]
                    },
                    "label": {
                        "type": "plain_text",
                        "text": "Projects"
                    }
                }
            ]
        }
    }

    static getSuccessModal(subscription: SlackSubscriptionData) {
        const currencySymbol = subscription.currency === 'EUR' ? '€' : 
                              subscription.currency === 'USD' ? '$' : 
                              subscription.currency === 'GBP' ? '£' : subscription.currency;
        
        const renewalCycleText = subscription.renewalCycle === 'MONTHLY' ? 'Monthly' :
                                subscription.renewalCycle === 'YEARLY' ? 'Yearly' : 'Custom';

        const fields = [
            {
                "type": "mrkdwn",
                "text": `*Name:*\n${subscription.name}`
            },
            {
                "type": "mrkdwn",
                "text": `*Price:*\n${currencySymbol}${subscription.price}`
            },
            {
                "type": "mrkdwn",
                "text": `*Period:*\n${renewalCycleText}`
            },
            {
                "type": "mrkdwn",
                "text": `*Renewal Date:*\n${subscription.renewalDate}`
            }
        ];

        // Solo añadir usuarios si hay alguno seleccionado
        if (subscription.users.length > 0) {
            fields.push({
                "type": "mrkdwn",
                "text": `*Users:*\n${subscription.users.length} selected`
            });
        }

        // Solo añadir proyectos si hay alguno seleccionado
        if (subscription.projects.length > 0) {
            fields.push({
                "type": "mrkdwn",
                "text": `*Projects:*\n${subscription.projects.join(', ')}`
            });
        }

        return {
            "type": "modal",
            "title": {
                "type": "plain_text",
                "text": "Success!"
            },
            "close": {
                "type": "plain_text",
                "text": "Close"
            },
            "blocks": [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `:white_check_mark: *Subscription created successfully!*`
                    }
                },
                {
                    "type": "section",
                    "fields": fields
                }
            ]
        }
    }
}