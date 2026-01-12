
export class PingService {
    constructor() {}
  
    public async handlePing() {
      return {
        status: 'ok',
        message: 'pong',
        timestamp: new Date().toISOString(),
      };
    }
  }
  
  