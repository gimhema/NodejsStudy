import { WeaponBase } from "./game_weapon.ts"; 

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
    ip_address : string;

    constructor(name: string, location: Location, 
        status: PlayerStatus, weapon : WeaponBase, ip_address : string) {
        this.name = name;
        this.location = location;
        this.status = status;
        this.weapon = weapon;
        this.ip_address = ip_address;
    }
}
