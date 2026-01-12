export class SlackService {
    constructor() {}

    public async handleSlack(data: any) {
        console.log(data.text)
        return {
            text: '¡Recibido! 👍'
        }
    }
}