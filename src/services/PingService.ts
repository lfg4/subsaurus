
export class PingService {
    constructor() {}
  
    public handlePing() {
      return {
        status: 'ok',
        message: 'pong',
        timestamp: new Date().toISOString(),
      };
    }
  }
  
  