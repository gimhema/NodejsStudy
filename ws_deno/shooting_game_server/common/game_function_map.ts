import { messageAction_Ping, messageAction_Transformation, messageAction_Damage } from "./game_message_action.ts";

type FunctionType = (...args: any[]) => void;

export class FunctionMap {
    private functionMap: Map<number, FunctionType>;

    constructor() {
        this.functionMap = new Map();
    }

    // 함수 등록 메서드
    public register(id: number, fn: FunctionType): void {
        this.functionMap.set(id, fn);
    }

    // 함수 실행 메서드
    public execute(id: number, ...params: any[]): void {
        const fn = this.functionMap.get(id);
        if (fn) {
            fn(...params);
        } else {
            console.log(`Function for id ${id} not found.`);
        }
    }

    // 필요에 따라 함수 삭제 메서드 추가 가능
    public remove(id: number): void {
        if (this.functionMap.has(id)) {
            this.functionMap.delete(id);
        } else {
            console.log(`Function for id ${id} not found.`);
        }
    }

    public init() {

        // // 함수 등록
        // functionMap.register(1, exampleFunction1);
        // functionMap.register(2, exampleFunction2);

        this.register(0, messageAction_Ping);
        this.register(1, messageAction_Transformation);
        this.register(2, messageAction_Damage);

    }
}

// 클래스 사용 예시

// const functionMap = new FunctionMap();
// 
// // 함수들을 정의
// function exampleFunction1(param1: string, param2: number) {
//     console.log(`Function 1: ${param1}, ${param2}`);
// }
// 
// function exampleFunction2(param1: number) {
//     console.log(`Function 2: ${param1}`);
// }
// 
// // 함수 등록
// functionMap.register(1, exampleFunction1);
// functionMap.register(2, exampleFunction2);
// 
// // 함수 실행
// functionMap.execute(1, "Hello", 42);  // Function 1: Hello, 42
// functionMap.execute(2, 123);          // Function 2: 123
// 
// // 함수 제거
// functionMap.remove(1);
// functionMap.execute(1, "Test", 50);   // Function for id 1 not found.
