import { Player } from "../common/game_data.ts";
import { GamePakcetPing, GamePacketDamage, GamePacketTransformation } from "../common/game_packet.ts";
import { MessageHandler } from "../common/game_message_action.ts";

export class GameServer {
    private players: Player[];
    private messageHandler : MessageHandler;

    constructor() {
        this.players = [];
        this.messageHandler = new MessageHandler();
    }

    newPlayer(player : Player) {        
        this.players.push(player);
    }

    messageAction(msg: string) {
        console.log("Server - received:", msg);
        
        try {
            const jsonData : any = JSON.parse(msg); // JSON 파싱
    
            switch (jsonData.packetType) {
                case 0:
                    {
                    // Ping
                    const pingPacket = jsonData as GamePakcetPing;
                    this.messageHandler.messageAction_Ping(pingPacket);
                    }
                    break;
                case 1:
                    // Transformation
                    {
                        const transformationPacket = jsonData as GamePacketTransformation;
                        this.messageHandler.messageAction_Transformation(transformationPacket);
                    }
                    break;
                case 2:
                    // Damage
                    {
                        const damagePacket = jsonData  as GamePacketDamage;
                        this.messageHandler.messageAction_Damage(damagePacket);
                    }
                    break;
                default:
                    console.log("Unknown action:", jsonData.action);
            }
        } catch (error) {
            console.error("Error parsing JSON:", error);
        }
    }
    

    delUserByIPAddress(ipAddress: string) {
        for (let index = 0; index < this.players.length; index++) {
            if (this.players[index].ip_address === ipAddress) {
                this.players.splice(index, 1);
                console.log(`Player with IP ${ipAddress} has been removed.`);
                return; 
            }
        }
        console.log(`No player found with IP ${ipAddress}.`); // 플레이어가 없을 경우 메시지 출력
    }
    

}