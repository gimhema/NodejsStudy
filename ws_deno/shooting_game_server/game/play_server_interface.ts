import { Player } from "../common/game_data.ts";

export class GameServer {
    private players: Player[];

    constructor() {
        this.players = [];
    }

    newPlayer(player : Player) {        
        this.players.push(player);
    }

    messageAction(msg: string) {
        console.log("Server - received:", msg);
        
        try {
            const jsonData = JSON.parse(msg); // JSON 파싱
    
            switch (jsonData.action) {
                case 'join':
                    // 플레이어 추가 처리
                    console.log(`Player joined: ${jsonData.playerName}`);
                    break;
                case 'message':
                    // 메시지 처리
                    console.log(`Message from player: ${jsonData.playerName} - ${jsonData.content}`);
                    break;
                case 'disconnect':
                    // 연결 끊김 처리
                    console.log(`Player disconnected: ${jsonData.playerName}`);
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