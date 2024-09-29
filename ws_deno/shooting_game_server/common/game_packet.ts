import { Rotation, Location, MoveMode } from "./game_data.ts";

// 0 : Ping
// 1 : Transformation
// 2 : Damage

export interface GamePakcetPing {
    packetType : number;
}

export interface GamePacketTransformation {
    packetType : number;
    locX : number;
    locY : number;
    locZ : number;
    roll : number;
    pitch : number;
    yaw : number;
};

export interface GamePacketDamage {
    packetType : number;
    damage : number;
}


