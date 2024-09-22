
export enum WeaponKind {
    DEFAULT,    // 0
}

export interface WeaponBase {
    kind : WeaponKind;
    name : string;
    max_ammo : number;
    damage : number;
}