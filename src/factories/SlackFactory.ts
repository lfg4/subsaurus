// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
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
}