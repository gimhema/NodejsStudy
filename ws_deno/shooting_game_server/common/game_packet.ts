import { Rotation, Location, MoveMode } from "./game_data.ts";

export enum PacketType {
    PING,
    TRANSFORMATION,
    DAMAGE
}

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


