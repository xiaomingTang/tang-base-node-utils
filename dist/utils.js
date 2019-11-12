"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const readline = require("readline");
const assert = require("assert");
function isEmpty(s) {
    return s === null || s === undefined;
}
function __queryInput(queryStr) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question(queryStr, (answer) => {
            resolve(answer);
            rl.close();
        });
    });
}
function question(queryStr, defaultValue) {
    return __awaiter(this, void 0, void 0, function* () {
        const noDefaultValue = isEmpty(defaultValue);
        const prompt = noDefaultValue ? queryStr : `${queryStr}, 缺省值【${defaultValue}】: `;
        const inputStr = yield __queryInput(prompt);
        if (noDefaultValue) { // 无默认值
            if (inputStr === "") {
                return question(queryStr);
            }
            return inputStr;
        }
        // 有默认值
        if (inputStr === "") {
            return defaultValue;
        }
        return inputStr;
    });
}
exports.question = question;
function questionUntil(queryStr, f) {
    return __awaiter(this, void 0, void 0, function* () {
        const inputStr = yield question(queryStr);
        if (f(inputStr)) {
            return inputStr;
        }
        return questionUntil(queryStr, f);
    });
}
exports.questionUntil = questionUntil;
function questionNumber(queryStr, defaultValue) {
    return __awaiter(this, void 0, void 0, function* () {
        assert(isEmpty(defaultValue) || (typeof defaultValue === "number"), `${defaultValue} is not number`);
        const defaultStr = isEmpty(defaultValue) ? undefined : `${defaultValue}`;
        let input = "";
        while (!/^[+-]?\d+(\.\d+)?$/.test(input)) {
            input = yield question(queryStr, defaultStr);
        }
        return +input;
    });
}
exports.questionNumber = questionNumber;
function refreshProp(obj, propName) {
    const newProp = JSON.parse(JSON.stringify(obj[propName]));
    /* eslint-disable no-param-reassign */
    delete obj[propName];
    obj[propName] = newProp;
    /* eslint-enable no-param-reassign */
}
exports.refreshProp = refreshProp;
function enumerate(arr) {
    return arr.map((item, i) => [item, i]);
}
exports.enumerate = enumerate;
function forRun(arr, func) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 0, len = arr.length; i < len; i += 1) {
            yield func(arr[i], i, arr);
        }
    });
}
exports.forRun = forRun;
//# sourceMappingURL=utils.js.map