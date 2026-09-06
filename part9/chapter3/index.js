"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const calculator_1 = require("./calculator");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get('/ping', (_req, res) => {
    res.send('pong');
});
app.post('/calculate', (req, res) => {
    const { value1, value2, op } = req.body;
    const result = (0, calculator_1.calculator)(Number(value1), Number(value2), op);
    res.send({ result });
});
const PORT = 3003;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
