// deno run --allow-net --unstable .\client.ts

const encoder = new TextEncoder();

const listener = Deno.listenDatagram({
    port: 10001,
    transport: "udp",
});

const peerAddress: Deno.NetAddr = {
    transport: "udp",
    hostname: "127.0.0.1",
    port: 10000,
};

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomFloat = (min: number, max: number) => Math.random() * (max - min) + min;
const getRandomElement = <T>(array: T[]): T => array[getRandomInt(0, array.length - 1)];

let message_count = 0;
const actions = ["shoot", "move", "jump", "reload"];
const weapons = ["rifle", "pistol", "shotgun", "sniper"];
const targetIds = ["enemy_67890", "enemy_12345", "enemy_54321", "enemy_98765"];

const sendGameEvent = async () => {
    const message = {
        type: "game_event",
        timestamp: new Date().toISOString(),
        playerId: `player_${getRandomInt(10000, 99999)}`, // ���� �÷��̾� ID
        position: {
            x: getRandomFloat(0, 200), // ���� X ��ġ
            y: getRandomFloat(0, 200), // ���� Y ��ġ
            z: getRandomFloat(0, 200), // ���� Z ��ġ
        },
        rotation: {
            pitch: getRandomFloat(-90, 90), // ���� pitch (���Ʒ� ����)
            yaw: getRandomFloat(0, 360),    // ���� yaw (�¿� ����)
            roll: getRandomFloat(-180, 180), // ���� roll (ȸ�� ����)
        },
        health: getRandomInt(0, 100), // ���� ü��
        ammo: {
            current: getRandomInt(0, 30), // ���� ���� ź�� ��
            reserve: getRandomInt(0, 100), // ���� ���� ź�� ��
        },
        event: {
            action: getRandomElement(actions), // ���� �׼�
            targetId: getRandomElement(targetIds), // ���� Ÿ�� ID
            weapon: getRandomElement(weapons), // ���� ����
            damage: getRandomInt(0, 100), // ���� ���ط�
        },
    };
    message_count++;
    const encodedMessage = encoder.encode(JSON.stringify(message));
    await listener.send(encodedMessage, peerAddress);
    console.log("Game event sent to:", peerAddress, "with message:", message);
};

const interval = 100; // �޽��� ���� ���� (�и���)
const timeOut = 10000; // ��ü ���� �ð� (�и���)

const intervalId = setInterval(sendGameEvent, interval);

setTimeout(() => {
    clearInterval(intervalId);
    listener.close();
    console.log("Game event test completed and closed, total send messages : ", message_count);
}, timeOut);
