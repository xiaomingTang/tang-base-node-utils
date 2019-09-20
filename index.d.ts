import * as fs from "fs"

class Base {
  constructor(path: string);

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

class File extends Base {
  constructor(path: string);

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

class Dir extends Base {
  constructor(path: string);

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

class Json extends File {
  constructor(path: string);

  readSync(encoding?: string): string;
  writeSync(data: string | array | object, space: number, encoding?: string): Json;
}

function question(queryStr: string, defaultValue?: string): string;

function validFunc(input: string): boolean;

function questionUntil(queryStr: string, func: validFunc): string;

function questionNumber(queryStr: string, defaultValue?: number): string;

function refreshProp(obj: object, propName: string): void;

function enumerate(arr: array): [any, number][]

module.exports = {
  Base,
  File,
  Dir,
  Json,
  question,
  questionUntil,
  questionNumber,
  refreshProp,
  enumerate,
}
