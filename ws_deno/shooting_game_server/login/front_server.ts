Deno.serve((req) => {
    
    if (req.headers.get("upgrade") != "websocket") {
      return new Response(null, { status: 501 });
    }
    
    const { socket, response } = Deno.upgradeWebSocket(req);
    
    socket.addEventListener("login", () => {

        console.log("Login Client");

    });
    
    // socket.addEventListener("message", (event) => {
    //   if (event.data === "ping") {
    //     socket.send("pong");
    //   }
    // });
    
    return response;

});