import { Rotation, Location, MoveMode } from "./game_data.ts";

// 0 : Ping
// 1 : Transformation
// 2 : Damage

export class GamePakcetPing {
    packetType : number = 0;
    playerId : number = 0;
}

export class GamePacketTransformation {
    packetType : number = 0;
    playerId : number = 0;
    locX : number = 0;
    locY : number = 0;
    locZ : number = 0;
    roll : number = 0;
    pitch : number = 0;
    yaw : number = 0;
};

export class GamePacketDamage {
    packetType : number = 0;
    playerId : number = 0;
    damage : number = 0;
}


