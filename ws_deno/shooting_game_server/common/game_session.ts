

export type PlayerSession = {
    sessionId : number;
    udpSocket : Deno.DatagramConn;
    udpAddr : Deno.Addr;
    tcpStream : Deno.TcpConn;
};