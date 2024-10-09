import { GamePacketDamage, GamePacketTransformation, GamePakcetPing, GamePacketStatus } from "./game_packet.ts";
import { GameServer } from "../game/play_server_interface.ts";




export function syncPlayerTransform() {
    
    GameServer.getInstance().playerContainer.forEach((value, key) => {
        let transfrom = new GamePacketTransformation();

        let syncMsg = transfrom.toJSON();

        GameServer.getInstance().sendMsgToClientUDPbyIPAddress(key, syncMsg);
    });
}

export function syncPlayerStatus() {
    GameServer.getInstance().playerContainer.forEach((value, key) => {
        let status = new GamePacketStatus();

        let syncMsg = "";

        GameServer.getInstance().sendMsgToClientUDPbyIPAddress(key, syncMsg);
    });
}
