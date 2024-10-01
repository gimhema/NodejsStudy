

export type PlayerSession = {
    sessionId : number;
    udpSocket : Deno.DatagramConn;
    tcpStream : Deno.TcpConn;
};