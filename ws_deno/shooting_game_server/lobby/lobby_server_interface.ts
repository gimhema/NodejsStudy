
import { User, UserConnectionType, UserType } from "../common/user.ts";

export class LobbyServer {
    user_map : Map<string, User>


    constructor() {
        this.user_map = new Map();
    }

    NewUser(name : string, ip_address : string) {

        let new_user = new User(name);

        new_user.ip_address = ip_address;

        this.user_map.set(name, new_user);
    }

}