import { GameServer } from "./play_server_interface.ts";

let message_count = 0;

const decoder = new TextDecoder();
const encoder = new TextEncoder();  // 데이터를 다시 클라이언트에게 보내기 위해 인코더 추가

// IP와 포트를 변수로 설정
const SERVER_IP = "127.0.0.1"; // 원하는 IP 주소로 변경 가능
const UDP_PORT = 3001;
const TCP_PORT = 3002;

const udpListener = Deno.listenDatagram({
  hostname: SERVER_IP,
  port: UDP_PORT,
  transport: "udp",
});

const tcpListener = Deno.listen({ hostname: SERVER_IP, port: TCP_PORT }); // TCP 서버 리스너 추가

const gameServer = new GameServer();

console.log(`UDP Server is running on ${SERVER_IP}:${UDP_PORT}`);
console.log(`TCP Server is running on ${SERVER_IP}:${TCP_PORT}`);

async function handleUdpConnections() {
  for await (const [data, address] of udpListener) {
    message_count++;
    const startTime = performance.now(); // Start

    const receivedMessage = decoder.decode(data);

    gameServer.messageAction(receivedMessage);

    const endTime = performance.now(); // End

    console.log(`UDP Processing time: ${(endTime - startTime).toFixed(2)} ms`);
    console.log("UDP message count : ", message_count);
  }
}

async function handleTcpConnections() {
  for await (const tcpConn of tcpListener) {
    (async () => {
      try {
        const buffer = new Uint8Array(1024);
        const n = await tcpConn.read(buffer);
        if (n === null) {
          tcpConn.close();
          return;
        }

        const receivedMessage = decoder.decode(buffer.subarray(0, n));

        gameServer.messageAction(receivedMessage);

        const response = encoder.encode("Echo Message from TCP Server");
        await tcpConn.write(response);

        tcpConn.close();
      } catch (error) {
        console.error("TCP connection error:", error);
      }
    })();
  }
}

// UDP와 TCP 서버를 비동기적으로 실행
await Promise.all([handleUdpConnections(), handleTcpConnections()]);
