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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable max-classes-per-file */
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const readline = require("readline");
const utils_1 = require("./utils");
class Base {
    constructor(...paths) {
        this.originData = [...paths];
    }
    get path() {
        return path.resolve(...this.originData);
    }
    get dirname() {
        return path.dirname(this.path);
    }
    get basename() {
        return path.basename(this.path);
    }
    get parent() {
        return new Base(this.dirname);
    }
    get stat() {
        try {
            return fs.statSync(this.path);
        }
        catch (err) {
            return null;
        }
    }
    get isFile() {
        return this.stat && this.stat.isFile();
    }
    get isDir() {
        return this.stat && this.stat.isDirectory();
    }
    asFile() {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return new File(this.path);
    }
    asDir() {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return new Dir(this.path);
    }
    createAsDir() {
        if (!this.isDir) {
            fs.mkdirSync(this.path, { recursive: true });
        }
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return new Dir(this.path);
    }
    createAsFile() {
        this.parent.createAsDir();
        fs.writeFileSync(this.path, "", { flag: "a" });
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return new File(this.path);
    }
    sibling(basename) {
        return new Base(path.join(this.dirname, basename));
    }
}
exports.Base = Base;
class File extends Base {
    constructor(...paths) {
        super(...paths);
        assert(this.isFile, `${this.path} is not file`);
    }
    get suffix() {
        return path.parse(this.path).ext;
    }
    get name() {
        return path.parse(this.path).name;
    }
    get parent() {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return new Dir(this.dirname);
    }
    read(encoding = "utf8") {
        return fs.readFileSync(this.path, {
            encoding,
            flag: "r",
        });
    }
    /**
     * 逐行处理文件
     */
    handleLineByLine(func) {
        var e_1, _a;
        return __awaiter(this, void 0, void 0, function* () {
            const rl = readline.createInterface({
                input: fs.createReadStream(this.path),
                crlfDelay: Infinity,
            });
            let doContinue = true;
            // eslint-disable-next-line no-return-assign
            const close = () => doContinue = false;
            let lineIdx = 0;
            try {
                // eslint-disable-next-line no-restricted-syntax
                for (var rl_1 = __asyncValues(rl), rl_1_1; rl_1_1 = yield rl_1.next(), !rl_1_1.done;) {
                    const line = rl_1_1.value;
                    if (doContinue) {
                        func(line, lineIdx, close);
                        lineIdx += 1;
                    }
                    else {
                        break;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (rl_1_1 && !rl_1_1.done && (_a = rl_1.return)) yield _a.call(rl_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        });
    }
    /**
     * 对文件的每一行执行相同的处理
     */
    handleEveryLine(func) {
        var e_2, _a;
        return __awaiter(this, void 0, void 0, function* () {
            const rl = readline.createInterface({
                input: fs.createReadStream(this.path),
                crlfDelay: Infinity,
            });
            let lineIdx = 0;
            try {
                // eslint-disable-next-line no-restricted-syntax
                for (var rl_2 = __asyncValues(rl), rl_2_1; rl_2_1 = yield rl_2.next(), !rl_2_1.done;) {
                    const line = rl_2_1.value;
                    func(line, lineIdx);
                    lineIdx += 1;
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (rl_2_1 && !rl_2_1.done && (_a = rl_2.return)) yield _a.call(rl_2);
                }
                finally { if (e_2) throw e_2.error; }
            }
        });
    }
    __write(content, flag = "w", encoding = "utf8") {
        fs.writeFileSync(this.path, content, {
            encoding,
            flag,
        });
        return this;
    }
    /**
     * 覆盖式写入
     */
    write(content, encoding = "utf8") {
        return this.__write(content, "w", encoding);
    }
    /**
     * 尾添加式写入
     */
    aWrite(content, encoding = "utf8") {
        return this.__write(content, "a", encoding);
    }
    moveTo(newPath) {
        new Base(newPath).parent.createAsDir();
        fs.renameSync(this.path, newPath);
        this.originData = [newPath];
        return this;
    }
    remove() {
        fs.unlinkSync(this.path);
        return new Base(this.path);
    }
    toJsonData() {
        return {
            basename: this.basename,
            children: null,
        };
    }
}
exports.File = File;
class Json extends File {
    readSync(encoding = "utf8") {
        const data = fs.readFileSync(this.path, { encoding });
        if (data.trim() === "") {
            return null;
        }
        return JSON.parse(data);
    }
    writeSync(data, space = 0, encoding = "utf8") {
        let str = "";
        if (typeof data === "string") {
            str = data;
        }
        else {
            str = JSON.stringify(data, null, space);
        }
        fs.writeFileSync(this.path, str, { encoding });
        return this;
    }
}
exports.Json = Json;
class Dir extends Base {
    constructor(...paths) {
        super(...paths);
        this.suffix = "";
        assert(this.isDir, `${this.path} is not dir`);
    }
    get name() {
        return this.basename;
    }
    get parent() {
        return new Dir(this.dirname);
    }
    get rawChildren() {
        return fs.readdirSync(this.path);
    }
    get files() {
        return this.rawChildren.map((name) => {
            try {
                return new File(path.join(this.path, name));
            }
            catch (err) {
                return null;
            }
        }).filter((f) => !!f);
    }
    get dirs() {
        return this.rawChildren.map((name) => {
            try {
                return new Dir(path.join(this.path, name));
            }
            catch (err) {
                return null;
            }
        }).filter((d) => !!d);
    }
    get allFiles() {
        const files = [...this.files];
        this.allDirs.forEach((dir) => {
            files.push(...dir.files);
        });
        // 不用递归，防止爆栈
        // this.dirs.forEach(dir => {
        //   files.push(...dir.allFiles)
        // })
        return files;
    }
    get allDirs() {
        const dirs = [...this.dirs];
        let curIdx = 0;
        while (curIdx < dirs.length) { // 这儿利用的就是 [].length 动态获取长度
            dirs.push(...dirs[curIdx].dirs);
            curIdx += 1;
        }
        // 不用递归，防止爆栈
        // this.dirs.forEach(dir => {
        //   dirs.push(...dir.allDirs)
        // })
        return dirs;
    }
    get fileNames() {
        return this.files.map((f) => f.basename);
    }
    get dirNames() {
        return this.dirs.map((d) => d.basename);
    }
    moveTo(newPath) {
        new Base(newPath).parent.createAsDir();
        fs.renameSync(this.path, newPath);
        this.originData = [newPath];
        return this;
    }
    remove(defaultPrompt) {
        return new Promise((resolve, reject) => {
            utils_1.question(`将会删除【${this.path}】整个目录及其子目录, 是否确定[y / n]?`, defaultPrompt).then((ans) => {
                if (ans.toLowerCase() === "y") {
                    fs.rmdirSync(this.path, {
                        recursive: true,
                    });
                    resolve(new Base(this.path));
                }
                reject(new Error("您手动取消了删除目录"));
            });
        });
    }
    dangerousRemoveWithoutEnsure() {
        fs.rmdirSync(this.path, {
            recursive: true,
        });
        return new Base(this.path);
    }
    toJsonData(filterChildrenDirs) {
        const result = {
            basename: this.basename,
            children: [],
        };
        if (filterChildrenDirs instanceof Function) {
            this.files.forEach((f) => {
                if (filterChildrenDirs(f)) {
                    result.children.push(f.toJsonData());
                }
            });
            this.dirs.forEach((d) => {
                if (filterChildrenDirs(d)) {
                    result.children.push(d.toJsonData(filterChildrenDirs));
                }
            });
        }
        else {
            this.files.forEach((f) => {
                result.children.push(f.toJsonData());
            });
            this.dirs.forEach((d) => {
                result.children.push(d.toJsonData());
            });
        }
        return result;
    }
}
exports.Dir = Dir;
//# sourceMappingURL=Base.js.map