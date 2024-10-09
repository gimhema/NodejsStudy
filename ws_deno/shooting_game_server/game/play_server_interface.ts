import { Player } from "../common/game_data.ts";
import { GamePakcetPing, GamePacketDamage, GamePacketTransformation, GamePacketSwapWeapon } from "../common/game_packet.ts";
import { MessageHandler } from "../common/game_message_action.ts";
import { FunctionMap } from "../common/game_function_map.ts";


export class GameServer {
    private static instance: GameServer | null = null;
    playerContainer : Map<string, Player>;
    pIdMap : Map <number, string>;
    pIdTop : number = 0;
    functionMap : FunctionMap = new FunctionMap();

    private messageHandler : MessageHandler;

    constructor() {
        this.playerContainer = new Map<string, Player>();
        this.pIdMap = new Map<number, string>();

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
                    udpAddr : null as unknown as Deno.Addr,
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
                player.playerSession.udpAddr = udpSocket.addr;
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
        this.pIdMap.set(this.pIdTop, key);
        this.pIdTop += 1;
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
                case 4:
                    {
                        const swapWeaponPacket = jsonData as GamePacketSwapWeapon;
                        // this.messageHandler.messageAction_SwapWeapon(swapWeaponPacket);
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
        else
        {
            let delKey = 0;
            this.pIdMap.forEach((value, key) => {
                if (value === ipAddress) {
                  delKey = key;
                }
              });
            this.pIdMap.delete(delKey);
        }
    }

    getPlayerByIpAddress(ipAddress: string): Player | null {
        const player = this.playerContainer.get(ipAddress);
    
            // player가 존재하는지 확인
            if (player !== undefined) {
                return player; // 플레이어를 반환
            } else {
                console.log(`No player found with IP ${ipAddress}.`);
            }

        return null;
    }

    getPlayerById(pId: number): Player | null {
        const ipKey = this.pIdMap.get(pId);
        
        // ipKey가 존재하는지 확인
        if (ipKey !== undefined) {
            const player = this.playerContainer.get(ipKey);
    
            // player가 존재하는지 확인
            if (player !== undefined) {
                return player; // 플레이어를 반환
            } else {
                console.log(`No player found with IP ${ipKey}.`);
            }
        } else {
            console.log(`No IP associated with player ID ${pId}.`);
        }
    
        return null; // 플레이어가 없을 경우 null 반환
    }

    rangeExecFuncInPidMap(action: (...args: any[]) => void, start: number, end: number, ...extraArgs: any[]) {
        let count = 0;
    
        this.pIdMap.forEach((value, key) => {
            if (count >= start && count < end) {
                const args = [...extraArgs];  // 오직 extraArgs만 인자로 사용
                action.apply(null, args);     // apply로 extraArgs를 함수에 전달
            }
            count++;
        });
    }

    rangeExecFuncInPlayerMap(action: (...args: any[]) => void, start: number, end: number, ...extraArgs: any[]) {
        let count = 0;
    
        this.playerContainer.forEach((value, key) => {
            if (count >= start && count < end) {
                const args = [...extraArgs];  // 오직 extraArgs만 인자로 사용
                action.apply(null, args);     // apply로 extraArgs를 함수에 전달
            }
            count++;
        });
    }

    // TCP
    sendMsgToClientTCPbyIPAddress(ipKey : string, msg : string) {
        let player = this.getPlayerByIpAddress(ipKey);
        const encoder = new TextEncoder();
        const sendMsg = encoder.encode(msg);
        player?.sendMsgTCP(sendMsg);
    }

    sendMsgToClientTCPbyPID(idKey : number, msg : string) {
        let player = this.getPlayerById(idKey);
        const encoder = new TextEncoder();
        const sendMsg = encoder.encode(msg);
        player?.sendMsgTCP(sendMsg);
    }

    sendMsgToAllTCP(msg : string) {
        
        const encoder = new TextEncoder();
        const sendMsg = encoder.encode(msg);

        this.playerContainer.forEach((value, key) => {
            this.sendMsgToClientTCPbyIPAddress(key, msg);
        });

    }

    // UDP
    sendMsgToClientUDPbyIPAddress(ipKey : string, msg : string) {
        let player = this.getPlayerByIpAddress(ipKey);
        const encoder = new TextEncoder();
        const sendMsg = encoder.encode(msg);
        player?.sendMsgUDP(sendMsg);
    }

    sendMsgToClientUDPbyPID(idKey : number, msg : string) {
        let player = this.getPlayerById(idKey);
        const encoder = new TextEncoder();
        const sendMsg = encoder.encode(msg);
        player?.sendMsgUDP(sendMsg);
    }

    sendMsgToAllUDP(msg : string) {
        const encoder = new TextEncoder();
        const sendMsg = encoder.encode(msg);

        this.playerContainer.forEach((value, key) => {
            this.sendMsgToClientUDPbyIPAddress(key, msg);
        });
    }

    initServer() {
        this.functionMap.init();
    }

}