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
    user_type : UserType;
    connection_type : UserConnectionType;
  
    constructor(name: string) {
        this.name = name;
        this.connection_type = UserConnectionType.DEFAULT;
        this.user_type = UserType.DEFAULT;
    }

    ChangeConnectionType(changedType : UserConnectionType) {
        this.connection_type = changedType;
    }
  
  }