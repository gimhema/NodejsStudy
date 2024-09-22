Deno.serve((req) => {
    
    if (req.headers.get("upgrade") != "websocket") {
      return new Response(null, { status: 501 });
    }
    
    const { socket, response } = Deno.upgradeWebSocket(req);
    
    socket.addEventListener("enter_lobby_from_front", () => {

        console.log("Entered Client from Front Server");

    });
    
    // socket.addEventListener("message", (event) => {
    //   if (event.data === "ping") {
    //     socket.send("pong");
    //   }
    // });
    
    return response;

});