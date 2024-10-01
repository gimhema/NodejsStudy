import { PlayerSession } from "./game_session.ts";

export enum UserType {
    DEFAULT,
    CLIENT,
    SERVER
}

export enum UserConnectionType {
    DEFAULT,    // 0
    LOGIN,  // 1
    LOBBY,  // 2
    GAME  // 3
  }

export class User {
    name: string;
    user_type : UserType;
    connection_type : UserConnectionType;
    playerSession : PlayerSession | null;

    constructor(name: string) {
        this.name = name;
        this.connection_type = UserConnectionType.DEFAULT;
        this.user_type = UserType.DEFAULT;
        this.playerSession = null;
    }

    ChangeConnectionType(changedType : UserConnectionType) {
        this.connection_type = changedType;
    }

    

}

// const address = { hostname: "127.0.0.1", port: 8080 };
// const socket = Deno.listenDatagram("udp", address);

// console.log(`UDP 서버가 ${address.hostname}:${address.port}에서 실행 중입니다.`);

// for await (const [data, remote] of socket) {
//   const message = new TextDecoder().decode(data);
//   console.log(`클라이언트로부터 받은 메시지: ${message} (from ${remote.hostname}:${remote.port})`);

//   // 받은 메시지를 클라이언트에게 그대로 돌려줌 (에코)
//   const response = new TextEncoder().encode(message);
//   socket.send(response, remote);
// }



// const address = { hostname: "127.0.0.1", port: 8080 };
// const socket = Deno.listenDatagram("udp", address);
// const clients = new Map<string, { hostname: string; port: number }>(); // 클라이언트 정보 저장

// console.log(`UDP 서버가 ${address.hostname}:${address.port}에서 실행 중입니다.`);

// for await (const [data, remote] of socket) {
//   const message = new TextDecoder().decode(data);
//   const clientKey = `${remote.hostname}:${remote.port}`;

//   // 새로운 클라이언트인 경우, 클라이언트 목록에 추가
//   if (!clients.has(clientKey)) {
//     clients.set(clientKey, { hostname: remote.hostname, port: remote.port });
//     console.log(`새 클라이언트 추가: ${clientKey}`);
//   }

//   console.log(`클라이언트로부터 받은 메시지: ${message} (from ${clientKey})`);

//   // 받은 메시지를 클라이언트에게 에코
//   const response = new TextEncoder().encode(message);
//   socket.send(response, remote);
// }
