// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class SlackFactory {
    static getHelpMessage() {
        return {
            "blocks": [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "*Help command*\n\nThis is the help command"
                    }
                }
            ]
        }
    }
}