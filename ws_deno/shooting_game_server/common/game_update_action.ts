import { GamePacketDamage, GamePacketTransformation, GamePakcetPing } from "./game_packet.ts";
import { GameServer } from "../game/play_server_interface.ts";




export function syncPlayerTransform() {
    
    GameServer.getInstance().playerContainer.forEach((value, key) => {
        let syncMsg = "";

        // Location 정보를 json으로 Encode

        GameServer.getInstance().sendMsgToClientUDPbyIPAddress(key, syncMsg);
    });
}

export function syncPlayerStatus() {
    GameServer.getInstance().playerContainer.forEach((value, key) => {
        let syncMsg = "";

        // Status 정보를 json으로 Encode

        GameServer.getInstance().sendMsgToClientUDPbyIPAddress(key, syncMsg);
    });
}
