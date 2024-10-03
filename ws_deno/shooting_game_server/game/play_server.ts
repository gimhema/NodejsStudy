import { GameServer } from "./play_server_interface.ts";
import { Player } from "./../common/game_data.ts"

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

      // address가 NetAddr 타입인지 확인
      if (address.transport === "udp") {
        const key = (address as Deno.NetAddr).hostname;  // address를 NetAddr로 캐스팅
        if (gameServer.isExistUdpConn(key)) {
          gameServer.messageAction(receivedMessage);
        }
        else {
          if(gameServer.isExistTcpConn(key) ){
            gameServer.establishUdpSocket(key, udpListener);
          }
        }

      } else {
        console.error("Unsupported address type:", address);
      }



    const endTime = performance.now(); // End

    console.log(`UDP Processing time: ${(endTime - startTime).toFixed(2)} ms`);
    console.log("UDP message count : ", message_count);
  }
}

async function handleTcpConnections() {
    for await (const tcpConn of tcpListener) {
        // 클라이언트가 연결되었을 때
        (async () => {
            try {
                const buffer = new Uint8Array(1024);
                // 클라이언트와의 연결을 배열에 추가
                const remoteAddr = tcpConn.remoteAddr as Deno.NetAddr;
                
                // gameServer.newPlayer(connected_player);
                if ( false == gameServer.isExistPlayer(remoteAddr.hostname) ) {
                  
                  let connected_player = new Player();
                  gameServer.addNewPlayer(remoteAddr.hostname, connected_player);
                  gameServer.establishTcpStream(remoteAddr.hostname, tcpConn);
                  console.log(`New client connected: ${remoteAddr.hostname}:${remoteAddr.port}`);
                }

                const n = await tcpConn.read(buffer);

                // 연결이 끊어진 경우
                if (n === null) {
                    console.log(`Client disconnected: ${remoteAddr.hostname}:${remoteAddr.port}`);
                    gameServer.delUserByIPAddress(remoteAddr.hostname);
                    // this.connections = this.connections.filter(conn => conn !== tcpConn); // 배열에서 삭제
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

function gameUpdate() {
  // 주기적으로 실행할 작업 (예: 플레이어 상태 업데이트, 세션 관리 등)
  console.log("Update: Server is running...");
  
  // 예시로 모든 플레이어의 위치를 로그로 출력
  // gameServer.players.forEach(player => {
  //   console.log(`Player ${player.name}: ${player.location.x}, ${player.location.y}, ${player.location.z}`);
  // });

}

const tickInterval = 100; 
setInterval(gameUpdate, tickInterval);


// UDP와 TCP 서버를 비동기적으로 실행
await Promise.all([handleUdpConnections(), handleTcpConnections()]);
