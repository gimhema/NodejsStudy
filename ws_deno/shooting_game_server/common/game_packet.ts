import { Rotation, Location, MoveMode } from "./game_data.ts";

// 0 : Ping
// 1 : Transformation
// 2 : Damage

export class GamePakcetPing {
    packetType : number = 0;
    playerId : number = 0;

    toJSON(): string {
        return JSON.stringify({
            packetType: this.packetType,
            playerId: this.playerId,
        });
    }

}

export class GamePacketTransformation {
    packetType : number = 1;
    playerId : number = 0;
    locX : number = 0;
    locY : number = 0;
    locZ : number = 0;
    roll : number = 0;
    pitch : number = 0;
    yaw : number = 0;

    toJSON(): string {
        return JSON.stringify({
            packetType: this.packetType,
            playerId: this.playerId,
            locX: this.locX,
            locY: this.locY,
            locZ: this.locZ,
            roll: this.roll,
            pitch: this.pitch,
            yaw: this.yaw,
        });
    }
};

export class GamePacketDamage {
    packetType : number = 2;
    playerId : number = 0;
    damage : number = 0;

    toJSON(): string {
        return JSON.stringify({
            packetType: this.packetType,
            playerId: this.playerId,
            damage: this.damage,
        });
    }
}

export class GamePacketStatus {
    packetType : number = 3;
    playerId : number = 0;
    health : number = 0;

    toJSON(): string {
        return JSON.stringify({
            packetType: this.packetType,
            playerId: this.playerId,
            health: this.health,
        });
    }
}

export class GamePacketSwapWeapon {
    packetType : number = 4;
    playerId : number = 0;
    weaponUnique : number = 0;

    toJSON() : string {
        return JSON.stringify({
           packetType: this.packetType,
           playerId: this.playerId,
           weaponUnique: this.weaponUnique, 
        });
    }
}
