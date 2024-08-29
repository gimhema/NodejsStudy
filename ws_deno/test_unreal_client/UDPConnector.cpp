// Fill out your copyright notice in the Description page of Project Settings.


#include "UDPComponent.h"
#include "Async/Async.h"
#include "SocketSubsystem.h"
#include "Kismet/KismetSystemLibrary.h"
// Sets default values for this component's properties
UUDPComponent::UUDPComponent(const FObjectInitializer& init) : UActorComponent(init)
{
	bWantsInitializeComponent = true;
	bAutoActivate = true;

	Native = MakeShareable(new FUDPNative);

	LinkupCallbacks();
}

void UUDPComponent::LinkupCallbacks()
{
	Native->OnSendOpened = [this](int32 SpecifiedPort, int32 BoundPort, FString BoundIP)
		{
			Settings.bIsSendOpen = true;
			Settings.SendBoundPort = BoundPort;	//ensure sync on opened bound port
			Settings.SendBoundIP = BoundIP;

			Settings.SendIP = Native->Settings.SendIP;
			Settings.SendPort = Native->Settings.SendPort;

			OnSendSocketOpened.Broadcast(Settings.SendPort, Settings.SendBoundPort, Settings.SendBoundIP);
		};
	Native->OnSendClosed = [this](int32 Port)
		{
			Settings.bIsSendOpen = false;
			OnSendSocketClosed.Broadcast(Port);
		};
	Native->OnReceiveOpened = [this](int32 Port)
		{
			Settings.ReceiveIP = Native->Settings.ReceiveIP;
			Settings.ReceivePort = Native->Settings.ReceivePort;

			Settings.bIsReceiveOpen = true;
			OnReceiveSocketOpened.Broadcast(Port);
		};
	Native->OnReceiveClosed = [this](int32 Port)
		{
			Settings.bIsReceiveOpen = false;
			OnReceiveSocketClosed.Broadcast(Port);
		};
	Native->OnReceivedBytes = [this](const TArray<uint8>& Data, const FString& Endpoint, const int32& Port)
		{
			OnReceivedBytes.Broadcast(Data, Endpoint, Port);
		};
}

bool UUDPComponent::CloseReceiveSocket()
{
	return Native->CloseReceiveSocket();
}

int32 UUDPComponent::OpenSendSocket(const FString& InIP /*= TEXT("127.0.0.1")*/, const int32 InPort /*= 3000*/)
{
	//Sync side effect sampled settings
	Native->Settings.SendSocketName = Settings.SendSocketName;
	Native->Settings.BufferSize = Settings.BufferSize;

	return Native->OpenSendSocket(InIP, InPort);
}

bool UUDPComponent::CloseSendSocket()
{
	Settings.SendBoundPort = 0;
	Settings.SendBoundIP = FString(TEXT("0.0.0.0"));
	return Native->CloseSendSocket();
}

bool UUDPComponent::OpenReceiveSocket(const FString& InListenIp /*= TEXT("0.0.0.0")*/, const int32 InListenPort /*= 3002*/)
{
	//Sync side effect sampled settings
	Native->Settings.bShouldAutoOpenReceive = Settings.bShouldAutoOpenReceive;
	Native->Settings.ReceiveSocketName = Settings.ReceiveSocketName;
	Native->Settings.BufferSize = Settings.BufferSize;

	return Native->OpenReceiveSocket(InListenIp, InListenPort);
}

bool UUDPComponent::EmitBytes(const TArray<uint8>& Bytes)
{
	return Native->EmitBytes(Bytes);
}

bool UUDPComponent::EmitString(const FString& InputString)
{
	// FString MyString = TEXT("Hello, Unreal UDP!");
	TArray<uint8> Bytes;

	this->FStringToTArray(InputString, Bytes);

	return Native->EmitBytes(Bytes);
}

void UUDPComponent::InitializeComponent()
{
	Super::InitializeComponent();
}

void UUDPComponent::UninitializeComponent()
{
	Super::UninitializeComponent();
}

void UUDPComponent::BeginPlay()
{
	Super::BeginPlay();

	//Sync all settings to native. These are duplicated for dev convenience in bp
	Native->Settings = Settings;

	if (Settings.bShouldAutoOpenSend)
	{
		OpenSendSocket(Settings.SendIP, Settings.SendPort);
	}

	if (Settings.bShouldAutoOpenReceive)
	{
		OpenReceiveSocket(Settings.ReceiveIP, Settings.ReceivePort);
	}
}

void UUDPComponent::EndPlay(const EEndPlayReason::Type EndPlayReason)
{
	CloseSendSocket();
	CloseReceiveSocket();

	Native->ClearSendCallbacks();
	Native->ClearReceiveCallbacks();

	Super::EndPlay(EndPlayReason);
}

FUDPNative::FUDPNative()
{
	SenderSocket = nullptr;
	ReceiverSocket = nullptr;

	ClearReceiveCallbacks();
	ClearSendCallbacks();
}

FUDPNative::~FUDPNative()
{
	if (Settings.bIsReceiveOpen)
	{
		CloseReceiveSocket();
		ClearReceiveCallbacks();
	}
	if (Settings.bIsSendOpen)
	{
		CloseSendSocket();
		ClearSendCallbacks();
	}
}

int32 FUDPNative::OpenSendSocket(const FString& InIP /*= TEXT("127.0.0.1")*/, const int32 InPort /*= 3000*/)
{
	Settings.SendIP = InIP;
	Settings.SendPort = InPort;

	RemoteAdress = ISocketSubsystem::Get(PLATFORM_SOCKETSUBSYSTEM)->CreateInternetAddr();

	bool bIsValid;
	RemoteAdress->SetIp(*Settings.SendIP, bIsValid);
	RemoteAdress->SetPort(Settings.SendPort);

	if (!bIsValid)
	{
		UE_LOG(LogTemp, Error, TEXT("UDP address is invalid <%s:%d>"), *Settings.SendIP, Settings.SendPort);
		return 0;
	}

	SenderSocket = FUdpSocketBuilder(*Settings.SendSocketName).AsReusable().WithBroadcast();

	//Set Send Buffer Size
	SenderSocket->SetSendBufferSize(Settings.BufferSize, Settings.BufferSize);
	SenderSocket->SetReceiveBufferSize(Settings.BufferSize, Settings.BufferSize);

	bool bDidConnect = SenderSocket->Connect(*RemoteAdress);
	Settings.bIsSendOpen = true;
	Settings.SendBoundPort = SenderSocket->GetPortNo();
	TSharedRef<FInternetAddr> SendBoundAddress = ISocketSubsystem::Get(PLATFORM_SOCKETSUBSYSTEM)->CreateInternetAddr();
	SenderSocket->GetAddress(*SendBoundAddress);
	Settings.SendBoundIP = SendBoundAddress->ToString(false);

	if (OnSendOpened)
	{
		OnSendOpened(Settings.SendPort, Settings.SendBoundPort, Settings.SendBoundIP);
	}

	return Settings.SendBoundPort;
}

bool FUDPNative::CloseSendSocket()
{
	bool bDidCloseCorrectly = true;
	Settings.bIsSendOpen = false;

	if (SenderSocket)
	{
		bDidCloseCorrectly = SenderSocket->Close();
		ISocketSubsystem::Get(PLATFORM_SOCKETSUBSYSTEM)->DestroySocket(SenderSocket);
		SenderSocket = nullptr;

		if (OnSendClosed)
		{
			OnSendClosed(Settings.SendPort);
		}
	}

	return bDidCloseCorrectly;
}

bool FUDPNative::EmitBytes(const TArray<uint8>& Bytes)
{
	bool bDidSendCorrectly = true;

	if (SenderSocket && SenderSocket->GetConnectionState() == SCS_Connected)
	{
		int32 BytesSent = 0;
		bDidSendCorrectly = SenderSocket->Send(Bytes.GetData(), Bytes.Num(), BytesSent);
	}
	else if (Settings.bShouldAutoOpenSend)
	{
		bool bDidOpen = OpenSendSocket(Settings.SendIP, Settings.SendPort) != 0;
		return bDidOpen && EmitBytes(Bytes);
	}

	return bDidSendCorrectly;
}

bool FUDPNative::OpenReceiveSocket(const FString& InListenIP /*= TEXT("0.0.0.0")*/, const int32 InListenPort /*= 3002*/)
{
	//Sync and overwrite settings
	if (Settings.bShouldOpenReceiveToBoundSendPort)
	{
		if (Settings.SendBoundPort == 0)
		{
			UE_LOG(LogTemp, Error, TEXT("FUDPNative::OpenReceiveSocket Can't bind to SendBoundPort if send socket hasn't been opened before this call."));
			return false;
		}
		Settings.ReceiveIP = Settings.SendBoundIP;
		Settings.ReceivePort = Settings.SendBoundPort;
	}
	else
	{
		Settings.ReceiveIP = InListenIP;
		Settings.ReceivePort = InListenPort;
	}

	bool bDidOpenCorrectly = true;

	if (Settings.bIsReceiveOpen)
	{
		bDidOpenCorrectly = CloseReceiveSocket();
	}

	FIPv4Address Addr;
	FIPv4Address::Parse(Settings.ReceiveIP, Addr);

	//Create Socket
	FIPv4Endpoint Endpoint(Addr, Settings.ReceivePort);

	ReceiverSocket = FUdpSocketBuilder(*Settings.ReceiveSocketName)
		.AsNonBlocking()
		.AsReusable()
		.BoundToEndpoint(Endpoint)
		.WithReceiveBufferSize(Settings.BufferSize);

	FTimespan ThreadWaitTime = FTimespan::FromMilliseconds(100);
	FString ThreadName = FString::Printf(TEXT("UDP RECEIVER-FUDPNative"));
	UDPReceiver = new FUdpSocketReceiver(ReceiverSocket, ThreadWaitTime, *ThreadName);

	UDPReceiver->OnDataReceived().BindLambda([this](const FArrayReaderPtr& DataPtr, const FIPv4Endpoint& Endpoint)
		{
			if (!OnReceivedBytes)
			{
				return;
			}

			TArray<uint8> Data;
			Data.AddUninitialized(DataPtr->TotalSize());
			DataPtr->Serialize(Data.GetData(), DataPtr->TotalSize());

			FString SenderIp = Endpoint.Address.ToString();
			int32 SenderPort = Endpoint.Port;

			if (Settings.bReceiveDataOnGameThread)
			{
				//Copy data to receiving thread via lambda capture
				AsyncTask(ENamedThreads::GameThread, [this, Data, SenderIp, SenderPort]()
					{
						//double check we're still bound on this thread
						if (OnReceivedBytes)
						{
							OnReceivedBytes(Data, SenderIp, SenderPort);
						}
					});
			}
			else
			{
				OnReceivedBytes(Data, SenderIp, SenderPort);
			}
		});

	Settings.bIsReceiveOpen = true;

	if (OnReceiveOpened)
	{
		OnReceiveOpened(Settings.ReceivePort);
	}

	UDPReceiver->Start();

	return bDidOpenCorrectly;
}

bool FUDPNative::CloseReceiveSocket()
{
	bool bDidCloseCorrectly = true;
	Settings.bIsReceiveOpen = false;

	if (ReceiverSocket)
	{
		UDPReceiver->Stop();
		delete UDPReceiver;
		UDPReceiver = nullptr;

		bDidCloseCorrectly = ReceiverSocket->Close();
		ISocketSubsystem::Get(PLATFORM_SOCKETSUBSYSTEM)->DestroySocket(ReceiverSocket);
		ReceiverSocket = nullptr;

		if (OnReceiveClosed)
		{
			OnReceiveClosed(Settings.ReceivePort);
		}
	}

	return bDidCloseCorrectly;
}

void FUDPNative::ClearSendCallbacks()
{
	OnSendOpened = nullptr;
	OnSendClosed = nullptr;
}

void FUDPNative::ClearReceiveCallbacks()
{
	OnReceivedBytes = nullptr;
	OnReceiveOpened = nullptr;
	OnReceiveClosed = nullptr;
}

FUDPSettings::FUDPSettings()
{
	bShouldAutoOpenSend = true;
	bShouldAutoOpenReceive = true;
	bShouldOpenReceiveToBoundSendPort = false;
	bReceiveDataOnGameThread = true;
	SendIP = FString(TEXT("127.0.0.1"));
	SendPort = 3001;
	SendBoundPort = 0;	//invalid if 0
	SendBoundIP = FString(TEXT("0.0.0.0"));
	ReceiveIP = FString(TEXT("0.0.0.0"));
	ReceivePort = 3002;
	SendSocketName = FString(TEXT("ue4-dgram-send"));
	ReceiveSocketName = FString(TEXT("ue4-dgram-receive"));

	bIsReceiveOpen = false;
	bIsSendOpen = false;

	BufferSize = 2 * 1024 * 1024;	//default roughly 2mb
}

void UUDPComponent::FStringToTArray(const FString& InputString, TArray<uint8>& OutArray)
{
	// UTF-8 형식으로 FString을 변환
	FTCHARToUTF8 Convert(*InputString);
	const uint8* UTF8Data = reinterpret_cast<const uint8*>(Convert.Get());

	// 변환된 UTF-8 데이터를 OutArray에 추가
	OutArray.Append(UTF8Data, Convert.Length());
}

void UUDPComponent::JsonToTBytes(const TSharedPtr<FJsonObject>& JsonObject, TArray<uint8>& OutArray)
{
	// JSON 객체를 문자열로 직렬화
	FString JsonString;
	TSharedRef<TJsonWriter<>> Writer = TJsonWriterFactory<>::Create(&JsonString);
	if (FJsonSerializer::Serialize(JsonObject.ToSharedRef(), Writer))
	{
		// UTF-8 형식으로 변환하여 TArray에 저장
		FTCHARToUTF8 Convert(*JsonString);
		const uint8* UTF8Data = reinterpret_cast<const uint8*>(Convert.Get());
		OutArray.Append(UTF8Data, Convert.Length());
	}
}

TSharedPtr<FJsonObject> UUDPComponent::BytesToJson(const TArray<uint8>& InArray)
{
	// UTF-8 바이트 배열을 FString으로 변환
	FString JsonString = FString(UTF8_TO_TCHAR(reinterpret_cast<const char*>(InArray.GetData())));

	// JSON 문자열을 파싱하여 FJsonObject로 변환
	TSharedPtr<FJsonObject> JsonObject;
	TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(JsonString);
	if (FJsonSerializer::Deserialize(Reader, JsonObject) && JsonObject.IsValid())
	{
		return JsonObject;
	}

	// 변환 실패 시 null 반환
	return nullptr;
}

FString UUDPComponent::JsonToFString(const TSharedPtr<FJsonObject>& JsonObject)
{
	FString JsonString;
	TSharedRef<TJsonWriter<>> Writer = TJsonWriterFactory<>::Create(&JsonString);

	// JSON 객체를 직렬화하여 FString으로 변환
	if (FJsonSerializer::Serialize(JsonObject.ToSharedRef(), Writer))
	{
		return JsonString;
	}

	// 변환 실패 시 빈 문자열 반환
	return TEXT("");
}

bool UUDPComponent::EmitJson(const TSharedPtr<FJsonObject>& JsonObject)
{
	TArray<uint8> Bytes;

	this->JsonToTBytes(JsonObject, Bytes);

	return this->EmitBytes(Bytes);
}
