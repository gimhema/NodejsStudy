import {LobbyServer} from "./lobby_server_interface.ts";

Deno.serve((req) => {
  
    const lobbyServer = new LobbyServer();

    if (req.headers.get("upgrade") != "websocket") {
      return new Response(null, { status: 501 });
    }
    
    const { socket, response } = Deno.upgradeWebSocket(req);
    
    socket.addEventListener("enter_lobby_from_front", (event) => {

        console.log("Entered Client from Front Server");

        // lobbyServer.NewUser()
        // console.log("Recv data" + event.);

    });
    
    // socket.addEventListener("message", (event) => {
    //   if (event.data === "ping") {
    //     socket.send("pong");
    //   }
    // });
    
    return response;

});