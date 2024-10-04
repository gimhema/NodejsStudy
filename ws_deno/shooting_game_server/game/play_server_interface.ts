import { Player } from "../common/game_data.ts";
import { GamePakcetPing, GamePacketDamage, GamePacketTransformation } from "../common/game_packet.ts";
import { MessageHandler } from "../common/game_message_action.ts";

// Map<string, { hostname: string; port: number }>();

export class GameServer {
    private static instance: GameServer | null = null;

    private playerContainer : Map<string, Player>;
    private messageHandler : MessageHandler;

    constructor() {
        this.playerContainer = new Map<string, Player>();
        this.messageHandler = new MessageHandler();
    }

    public static getInstance(): GameServer {
        if (this.instance === null) {
          this.instance = new GameServer();
        }
        return this.instance;
      }

    isExistPlayer(key : string) : boolean {
        if (!this.playerContainer.has(key)) {
            return false;
        }
        return true;
    }

    // Deno.DatagramConn
    // TcpConn
    establishTcpStream(key: string, tcpStream: Deno.TcpConn) {
        const player = this.playerContainer.get(key);
        if (player) {
            // 플레이어 세션이 없으면 새로 생성
            if (!player.playerSession) {
                player.playerSession = {
                    sessionId: Date.now(),  // sessionId를 현재 시간 기반으로 생성 (유일성 보장)
                    udpSocket: null as unknown as Deno.DatagramConn, // 초기 값, 이후 실제 연결 시 설정
                    tcpStream: tcpStream
                };
            } else {
                // 기존 세션에 TCP 스트림만 갱신
                player.playerSession.tcpStream = tcpStream;
            }
    
            // TCP 연결이 성공적으로 설정되었음을 표시
            player.isEstablishedTCP = true;
        } else {
            console.log(`Player with key ${key} not found.`);
        }
    }

    establishUdpSocket(key: string, udpSocket : Deno.DatagramConn) {
        const player = this.playerContainer.get(key);
        if (player) {
            // 플레이어 세션이 없으면 새로 생성
            if (!player.playerSession) {
                console.log("Must be establish TCP stream")
            } else {
                // 기존 세션에 UDP 스트림만 갱신
                player.playerSession.udpSocket = udpSocket;
            }
    
            // UDP 연결이 성공적으로 설정되었음을 표시
            player.isEstablishedUDP = true;
        } else {
            console.log(`Player with key ${key} not found.`);
        }
    }


    isExistTcpConn(key : string) : boolean {
        if (true == this.playerContainer.get(key)?.isEstablishedTCP)
        {
            return true;
        }
        return false;
    }

    isExistUdpConn(key : string) : boolean {
        if (true == this.playerContainer.get(key)?.isEstablishedUDP)
        {
            return true;
        }
        return false;
    }

    addNewPlayer(key : string, player : Player) {
        this.playerContainer.set(key, player);
    }

    messageAction(msg: string) {
        console.log("Server - received:", msg);
        
        try {
            const jsonData : any = JSON.parse(msg); // JSON 파싱
    
            switch (jsonData.packetType) {
                case 0:
                    {
                    // Ping
                    const pingPacket = jsonData as GamePakcetPing;
                    this.messageHandler.messageAction_Ping(pingPacket);
                    }
                    break;
                case 1:
                    // Transformation
                    {
                        const transformationPacket = jsonData as GamePacketTransformation;
                        this.messageHandler.messageAction_Transformation(transformationPacket);
                    }
                    break;
                case 2:
                    // Damage
                    {
                        const damagePacket = jsonData  as GamePacketDamage;
                        this.messageHandler.messageAction_Damage(damagePacket);
                    }
                    break;
                default:
                    console.log("Unknown action:", jsonData.action);
            }
        } catch (error) {
            console.error("Error parsing JSON:", error);
        }
    }
    

    delUserByIPAddress(ipAddress: string) {
        let result = this.playerContainer.delete(ipAddress);
        if(false == result)
        {
            console.log(`No player found with IP ${ipAddress}.`); // 플레이어가 없을 경우 메시지 출력
        }
    }
    

}