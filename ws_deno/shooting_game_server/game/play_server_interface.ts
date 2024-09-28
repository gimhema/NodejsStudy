import { Player } from "../common/game_data.ts";

export class GameServer {
    private players: Player[];

    constructor() {
        this.players = [];
    }

    newPlayer(player : Player) {        
        this.players.push(player);
    }

    messageAction(msg : string) {
        console.log("Server - received : ", msg);
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