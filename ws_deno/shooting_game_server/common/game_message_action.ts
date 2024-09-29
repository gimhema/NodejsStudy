import { GamePacketDamage, GamePacketTransformation, GamePakcetPing } from "./game_packet.ts";
import { GameServer } from "../game/play_server_interface.ts";


export class MessageHandler {   
    
    constructor() {

    }

    messageAction_Ping(pingMsg : GamePakcetPing) {

    }

    messageAction_Transformation(transformationMsg : GamePacketTransformation) {

    }
    
    messageAction_Damage(damageMsg : GamePacketDamage) {

    }
}


