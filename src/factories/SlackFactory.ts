// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class SlackFactory {
    static getHelpMessage() {
        return {
            "blocks": [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": "📚 Comandos Disponibles",
                        "emoji": true
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "*`/subsaurus help`*\nMuestra este mensaje de ayuda"
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
                            "text": "💡 _Más comandos próximamente..._"
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
}