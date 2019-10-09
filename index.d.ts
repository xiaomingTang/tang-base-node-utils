import * as fs from "fs"

export class Base {
  constructor(...paths: string[]);

  readonly path: string;
  readonly dirname: string;
  readonly basename: string;
  readonly parent: Base;
  readonly stat: fs.Stats;
  readonly isFile: boolean;
  readonly isDir: boolean;

  createAsDir(): Dir;
  createAsFile(): File;
  sibling(basename: string): Base;
}

export class File extends Base {
  constructor(...paths: string[]);

  readonly suffix: string;
  readonly name: string;
  readonly parent: Dir;
  read(encoding?: string): string;
  write(content: string, encoding?: string): File;
  aWrite(content: string, encoding?: string): File;
  moveTo(newPath: string): File;
  remove(): Base;
  toJsonData(): object;
}

export class Dir extends Base {
  constructor(...paths: string[]);

  readonly suffix: string;
  readonly name: string;
  readonly parent: Dir;
  readonly rawChildren: string[];
  readonly files: File[];
  readonly dirs: Dir[];
  readonly allFiles: File[];
  readonly allDirs: Dir[];
  readonly fileNames: string[];
  readonly dirNames: string[];
  moveTo(newPath: string): File;
  remove(): Base;
  toJsonData(): object;
}

export class Json extends File {
  constructor(...paths: string[]);

  readSync(encoding?: string): any;
  writeSync(data: string | any[] | object, space: number, encoding?: string): Json;
}

export function question(queryStr: string, defaultValue?: string): Promise<string>;

type validFunc = (input: string) => boolean;

export function questionUntil(queryStr: string, func: validFunc): Promise<string>;

export function questionNumber(queryStr: string, defaultValue?: number): Promise<number>;

export function refreshProp(obj: object, propName: string): void;

export function enumerate(arr: any[]): [any, number][]
