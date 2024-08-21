// deno run --allow-net --unstable .\server.ts

let message_count = 0;

const decoder = new TextDecoder();

const listener = Deno.listenDatagram({
    port: 10000,
    transport: "udp",
});

for await (const [data, address] of listener) {
    message_count++;
    const startTime = performance.now(); // Start

    console.log("Server - received information from", address);
    console.log("Server - received : ", decoder.decode(data));

    const endTime = performance.now(); // End

    console.log(`Processing time: ${(endTime - startTime).toFixed(2)} ms`);
    console.log("message count : ", message_count);
}

listener.close();


