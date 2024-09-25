
import { User, UserConnectionType, UserType } from "../common/user.ts";

export class LobbyServer {
    user_map : Map<string, User>


    constructor() {
        this.user_map = new Map();
    }

    newUser(name : string, ip_address : string) {

        let new_user = new User(name);

        new_user.ip_address = ip_address;

        this.user_map.set(name, new_user);
    }

    messageAction(jsonData : any) {

        console.log("Received JSON data:", jsonData);

        if (jsonData.type === "enter_lobby_from_front") {
            console.log("Client entered the lobby:", jsonData.user);
        }

    }



}