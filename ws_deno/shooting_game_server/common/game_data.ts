import { WeaponBase, WeaponKind } from "./game_weapon.ts"; 
import { PlayerSession } from "./game_session.ts";

export type Rotation = {
    roll: number;
    pitch: number;
    yaw: number;
};

export type Location = {
    x: number;
    y: number;
    z: number;
};

export enum MoveMode {
    DEFAULT,
    GROUND,
    FLY
}

export type PlayerStatus = {
    life: number;
    mana: number;
    alive : boolean;
    move : MoveMode;
};

export class Player {
    name: string;
    location: Location;
    status: PlayerStatus;
    weapon : WeaponBase;
    playerSession : PlayerSession | null;
    isEstablishedTCP : boolean;
    isEstablishedUDP : boolean;
    // ip_address : string;

    constructor(
        name: string = "",
        location: Location = { x: 0, y: 0, z : 0 }, // 예시: Location 객체 초기값
        status: PlayerStatus = {life : 0, mana : 0, alive : false, move : 0}, // 예시: 기본 상태
        weapon: WeaponBase = {kind : WeaponKind.DEFAULT, name : "", max_ammo : 0, damage : 0}, // 예시: 기본 무기
        
    ) {
        this.name = name;
        this.location = location;
        this.status = status;
        this.weapon = weapon;
        this.playerSession = null;
        this.isEstablishedTCP = false;
        this.isEstablishedUDP = false; 
    }

    sendMsgUDP(target : Deno.Addr, msg : Uint8Array) {
        this.playerSession?.udpSocket.send(msg, target);
    }

    sendMsgTCP(msg : Uint8Array) {
        this.playerSession?.tcpStream.write(msg);
    }
    
}
