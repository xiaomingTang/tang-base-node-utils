/// <reference types="node" />
import * as fs from "fs";
export interface FileJson {
    basename: string;
    children: null;
}
export interface DirJson {
    basename: string;
    children: (FileJson | DirJson)[];
}
export declare class Base {
    originData: string[];
    constructor(...paths: string[]);
    get path(): string;
    get dirname(): string;
    get basename(): string;
    get parent(): Base;
    get stat(): fs.Stats;
    get isFile(): boolean;
    get isDir(): boolean;
    asFile(): File;
    asDir(): Dir;
    createAsDir(): Dir;
    createAsFile(): File;
    sibling(basename: string): Base;
}
export declare class File extends Base {
    constructor(...paths: string[]);
    get suffix(): string;
    get name(): string;
    get parent(): Dir;
    read(encoding?: string): string;
    /**
     * 逐行处理文件
     */
    handleLineByLine(func: (lineStr: string, lineIdx: number, close: () => void) => void): Promise<void>;
    /**
     * 对文件的每一行执行相同的处理
     */
    handleEveryLine(func: (lineStr: string, lineIdx: number) => void): Promise<void>;
    private __write;
    /**
     * 覆盖式写入
     */
    write(content: string, encoding: string): this;
    /**
     * 尾添加式写入
     */
    aWrite(content: string, encoding: string): this;
    moveTo(newPath: string): this;
    remove(): Base;
    toJsonData(): FileJson;
}
export declare class Json extends File {
    readSync(encoding?: string): any;
    writeSync(data: any, space?: number, encoding?: string): this;
}
export declare class Dir extends Base {
    suffix: string;
    constructor(...paths: string[]);
    get name(): string;
    get parent(): Dir;
    get rawChildren(): string[];
    get files(): File[];
    get dirs(): Dir[];
    get allFiles(): File[];
    get allDirs(): Dir[];
    get fileNames(): string[];
    get dirNames(): string[];
    moveTo(newPath: string): this;
    remove(defaultPrompt?: string): Promise<unknown>;
    dangerousRemoveWithoutEnsure(): Base;
    toJsonData(): DirJson;
}
