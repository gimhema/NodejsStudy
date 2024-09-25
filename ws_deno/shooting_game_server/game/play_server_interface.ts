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

}