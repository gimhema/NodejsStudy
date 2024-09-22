export enum UserType {
    DEFAULT,
    CLIENT,
    SERVER
}

export enum UserConnectionType {
    DEFAULT,    // 0
    LOGIN,  // 1
    LOBBY,  // 2
    GAME  // 3
  }

export class User {
    name: string;
    ip_address : string;
    user_type : UserType;
    connection_type : UserConnectionType;
    game_session_id : number;

    constructor(name: string) {
        this.name = name;
        this.ip_address = "";
        this.connection_type = UserConnectionType.DEFAULT;
        this.user_type = UserType.DEFAULT;
        this.game_session_id = 0;
    }

    ChangeConnectionType(changedType : UserConnectionType) {
        this.connection_type = changedType;
    }
  
  }