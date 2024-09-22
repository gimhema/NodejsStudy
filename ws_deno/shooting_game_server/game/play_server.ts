// deno run --allow-net --unstable .\server.ts

let message_count = 0;

const decoder = new TextDecoder();
const encoder = new TextEncoder();  // 데이터를 다시 클라이언트에게 보내기 위해 인코더 추가

// IP와 포트를 변수로 설정
const SERVER_IP = "127.0.0.1"; // 원하는 IP 주소로 변경 가능
const SERVER_PORT = 3001;

const listener = Deno.listenDatagram({
    hostname: SERVER_IP,
    port: SERVER_PORT,
    transport: "udp",
});

console.log(`Server is running on ${SERVER_IP}:${SERVER_PORT}`);

for await (const [data, address] of listener) {
    message_count++;
    const startTime = performance.now(); // Start

    const receivedMessage = decoder.decode(data);
    console.log("Server - received : ", receivedMessage);

    // Echo back the received message
    const response =  encoder.encode("Echo Message from Deno");
    // const response = encoder.encode(receivedMessage);
    await listener.send(response, address);  // 받은 데이터를 클라이언트에게 그대로 전송

    const endTime = performance.now(); // End

    console.log(`Processing time: ${(endTime - startTime).toFixed(2)} ms`);
    console.log("message count : ", message_count);
}

// listener.close(); // 이 부분은 필요 없을 수 있습니다.
