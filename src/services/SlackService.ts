export class SlackService {
    constructor() {}

    public async handleSlack(data: any) {
        const message = data.text.split(' ')
        const action = message[0]
        switch (action) {
            case 'help':
                return 'Help command'
            default:
                return 'Command not found'
        }
    }
}