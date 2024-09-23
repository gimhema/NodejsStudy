import { LobbyServer } from "./lobby_server_interface.ts";

Deno.serve((req) => {

    const lobbyServer = new LobbyServer();

    if (req.headers.get("upgrade") != "websocket") {
      return new Response(null, { status: 501 });
    }

    const { socket, response } = Deno.upgradeWebSocket(req);

    socket.addEventListener("message", (event) => {
        try {
            // event.data를 JSON으로 파싱
            const jsonData = JSON.parse(event.data);
            console.log("Received JSON data:", jsonData);

            // 예시로 JSON에서 특정 필드 접근
            if (jsonData.type === "enter_lobby_from_front") {
                console.log("Client entered the lobby:", jsonData.user);
            }

        } catch (error) {
            console.error("Failed to parse JSON:", error);
        }
    });

    return response;
});
