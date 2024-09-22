export enum ConnectionType {
    DEFAULT,    // 0
    LOGIN,  // 1
    LOBBY,  // 2
    GAME  // 3
  }

export class User {
    name: string;
    connection_type : ConnectionType;
  
    constructor(name: string) {
        this.name = name;
        this.connection_type = ConnectionType.DEFAULT;
    }

    ChangeConnectionType(changedType : ConnectionType) {
        this.connection_type = changedType;
    }
  
  }