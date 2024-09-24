import { LobbyServer } from "./lobby_server_interface.ts";

const lobbyServer = new LobbyServer();

function handleWebSocket(sock: WebSocket) {
    console.log("WebSocket connection established");
  
    // message 이벤트가 발생할 때 수신한 데이터를 JSON으로 파싱
    sock.onmessage = (event) => {
      try {
        // 수신된 데이터를 JSON으로 파싱
        const data = JSON.parse(event.data);
        console.log("Received data:", data);

        lobbyServer.messageAction(data);
  
        // 예시 응답: 클라이언트로 수신한 데이터를 그대로 반환
        // sock.send(JSON.stringify({ message: "Data received", data }));
      
        } catch (error) {
        console.error("Failed to parse JSON:", error);
        sock.send(JSON.stringify({ error: "Invalid JSON" }));
      }
    };
  
    sock.onclose = () => {
      console.log("WebSocket connection closed");
    };
  
    sock.onerror = (err) => {
      console.error("WebSocket error:", err);
    };
  }
  
  Deno.serve({ port: 8080 }, (req) => {
    if (req.headers.get("upgrade") !== "websocket") {
      return new Response("Not a WebSocket request", { status: 400 });
    }
  
    const { socket, response } = Deno.upgradeWebSocket(req);
    handleWebSocket(socket);
    return response;
  });
  
  console.log("WebSocket server is running on ws://localhost:8080/");
  