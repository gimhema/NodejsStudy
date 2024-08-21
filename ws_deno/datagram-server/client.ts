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
        playerId: `player_${getRandomInt(10000, 99999)}`, // ·£´ý ÇÃ·¹ÀÌ¾î ID
        position: {
            x: getRandomFloat(0, 200), // ·£´ý X À§Ä¡
            y: getRandomFloat(0, 200), // ·£´ý Y À§Ä¡
            z: getRandomFloat(0, 200), // ·£´ý Z À§Ä¡
        },
        rotation: {
            pitch: getRandomFloat(-90, 90), // ·£´ý pitch (À§¾Æ·¡ °¢µµ)
            yaw: getRandomFloat(0, 360),    // ·£´ý yaw (ÁÂ¿ì °¢µµ)
            roll: getRandomFloat(-180, 180), // ·£´ý roll (È¸Àü °¢µµ)
        },
        health: getRandomInt(0, 100), // ·£´ý Ã¼·Â
        ammo: {
            current: getRandomInt(0, 30), // ·£´ý ÇöÀç Åº¾à ¼ö
            reserve: getRandomInt(0, 100), // ·£´ý ³²Àº Åº¾à ¼ö
        },
        event: {
            action: getRandomElement(actions), // ·£´ý ¾×¼Ç
            targetId: getRandomElement(targetIds), // ·£´ý Å¸°Ù ID
            weapon: getRandomElement(weapons), // ·£´ý ¹«±â
            damage: getRandomInt(0, 100), // ·£´ý ÇÇÇØ·®
        },
    };
    message_count++;
    const encodedMessage = encoder.encode(JSON.stringify(message));
    await listener.send(encodedMessage, peerAddress);
    console.log("Game event sent to:", peerAddress, "with message:", message);
};

const interval = 100; // ¸Þ½ÃÁö Àü¼Û °£°Ý (¹Ð¸®ÃÊ)
const timeOut = 10000; // ÀüÃ¼ ½ÇÇà ½Ã°£ (¹Ð¸®ÃÊ)

const intervalId = setInterval(sendGameEvent, interval);

setTimeout(() => {
    clearInterval(intervalId);
    listener.close();
    console.log("Game event test completed and closed, total send messages : ", message_count);
}, timeOut);
