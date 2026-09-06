"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculator = void 0;
const calculator = (a, b, op) => {
    switch (op) {
        case 'multiply':
            return a * b;
        case 'divide':
            if (b === 0)
                throw new Error('Can\'t divide by 0!');
            return a / b;
        case 'add':
            return a + b;
        default:
            throw new Error('Operation is not multiply, add or divide!');
    }
};
exports.calculator = calculator;
try {
    console.log((0, exports.calculator)(1, 0, 'divide'));
}
catch (error) {
    let errorMessage = 'Something went wrong: ';
    if (error instanceof Error) {
        errorMessage += error.message;
    }
    console.log(errorMessage);
}
