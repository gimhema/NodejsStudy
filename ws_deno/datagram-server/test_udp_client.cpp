#include <iostream>
#include <winsock2.h>
#include <ws2tcpip.h>
#include <string>
#include <thread>
#include <chrono>
#include <vector>
#include <random>

#pragma comment(lib, "ws2_32.lib")

// 무작위 메시지 선택을 위한 함수
template <typename T>
T getRandomElement(const std::vector<T>& array) {
	static std::random_device rd;
	static std::mt19937 gen(rd());
	std::uniform_int_distribution<> distr(0, array.size() - 1);
	return array[distr(gen)];
}

// UDP 메시지 전송 함수
void sendGameEvent(SOCKET& sock, sockaddr_in& peerAddr, int& message_count) {
	std::vector<std::string> messages = { "Ping", "Hello", "Test", "Event" };

	// 무작위 메시지 선택
	std::string message = getRandomElement(messages);
	// UDP 패킷 전송
	sendto(sock, message.c_str(), message.size(), 0, (sockaddr*)&peerAddr, sizeof(peerAddr));
	message_count++;

	// IP 주소를 문자열로 변환하여 출력
	char peerAddrStr[INET_ADDRSTRLEN];
	inet_ntop(AF_INET, &(peerAddr.sin_addr), peerAddrStr, INET_ADDRSTRLEN);
	std::cout << "Message sent to: " << peerAddrStr << ":" << ntohs(peerAddr.sin_port)
		<< " with message: " << message << std::endl;
}

int main() {
	// Winsock 초기화
	WSADATA wsaData;
	if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) {
		std::cerr << "WSAStartup failed." << std::endl;
		return 1;
	}

	// UDP 소켓 생성
	SOCKET sock = socket(AF_INET, SOCK_DGRAM, IPPROTO_UDP);
	if (sock == INVALID_SOCKET) {
		std::cerr << "Socket creation failed." << std::endl;
		WSACleanup();
		return 1;
	}

	// 상대방 주소 설정
	sockaddr_in peerAddr;
	peerAddr.sin_family = AF_INET;
	peerAddr.sin_port = htons(10000);

	// 문자열 IP 주소를 이진 형식으로 변환
	if (inet_pton(AF_INET, "127.0.0.1", &peerAddr.sin_addr) <= 0) {
		std::cerr << "Invalid address or Address not supported" << std::endl;
		closesocket(sock);
		WSACleanup();
		return 1;
	}

	int message_count = 0;
	const int interval = 100; // 메시지 전송 간격 (밀리초)
	const int timeOut = 10000; // 전체 실행 시간 (밀리초)

	auto startTime = std::chrono::steady_clock::now();

	// 일정 시간 동안 메시지 전송
	while (std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::steady_clock::now() - startTime).count() < timeOut) {
		sendGameEvent(sock, peerAddr, message_count);
		std::this_thread::sleep_for(std::chrono::milliseconds(interval));
	}

	// 소켓 종료 및 Winsock 정리
	closesocket(sock);
	WSACleanup();
	std::cout << "Test completed and closed, total sent messages: " << message_count << std::endl;

	return 0;
}
