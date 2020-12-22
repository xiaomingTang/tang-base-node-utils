/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
import * as fs from "fs"
import * as path from "path"
import * as assert from "assert"
import * as readline from "readline"
import { questionBoolean } from "./utils"

export interface FileJson {
  basename: string;
  children: null;
}

export interface DirJson {
  basename: string;
  children: (FileJson | DirJson)[];
}

export type Filter = (item: File | Dir) => boolean

export class Base {
  originData: string[];

  constructor(...paths: string[]) {
    this.originData = [...paths]
  }

  get path() {
    return path.resolve(...this.originData)
  }

  /**
   * 父目录的路径
   */
  get dirname() {
    return path.dirname(this.path)
  }

  /**
   * 文件名, 包括后缀
   */
  get basename() {
    return path.basename(this.path)
  }

  /**
   * 文件名, 不包括后缀
   *
   * Base 与 Dir 中, 后缀为空
   *
   * File 中才有后缀
   *
   * 所以 Base 与 Dir 中, basename 与 name 相等
   */
  get name() {
    return this.basename
  }

  get suffix() {
    return ""
  }

  get parent() {
    return new Base(this.dirname)
  }

  get stat(): fs.Stats | null {
    try {
      return fs.statSync(this.path)
    } catch (err) {
      return null
    }
  }

  get isFile(): boolean {
    return this.stat && this.stat.isFile()
  }

  get isDir(): boolean {
    return this.stat && this.stat.isDirectory()
  }

  asFile() {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return new File(this.path)
  }

  asDir() {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return new Dir(this.path)
  }

  createAsFile() {
    this.parent.createAsDir()
    fs.writeFileSync(this.path, "", { flag: "a" })
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return new File(this.path)
  }

  createAsDir() {
    if (!this.isDir) {
      fs.mkdirSync(this.path, { recursive: true })
    }
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return new Dir(this.path)
  }

  childOf(...basename: string[]) {
    return new Base(path.join(this.path, ...basename))
  }

  siblingOf(...basename: string[]) {
    return new Base(path.join(this.dirname, ...basename))
  }

  relativeFrom(...p: string[]) {
    return path.relative(new Base(...p).path, this.path)
  }

  relativeTo(...p: string[]): string {
    return path.relative(this.path, new Base(...p).path)
  }
}

export class File extends Base {
  constructor(...paths: string[]) {
    super(...paths)
    assert(this.isFile, `${this.path} is not file`)
  }

  get suffix() {
    return path.parse(this.path).ext
  }

  get name() {
    return path.parse(this.path).name
  }

  get parent() {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return new Dir(this.dirname)
  }

  read(encoding: BufferEncoding = "utf-8") {
    return fs.readFileSync(this.path, {
      encoding,
      flag: "r",
    })
  }

  /**
   * 逐行处理文件
   */
  async handleLineByLine(func: (lineStr: string, lineIdx: number, close: () => void) => void): Promise<void> {
    const rl = readline.createInterface({
      input: fs.createReadStream(this.path),
      crlfDelay: Infinity,
    })
    let doContinue = true
    // eslint-disable-next-line no-return-assign
    const close = () => doContinue = false
    let lineIdx = 0
    // eslint-disable-next-line no-restricted-syntax
    for await (const line of rl) {
      if (doContinue) {
        func(line, lineIdx, close)
        lineIdx += 1
      } else {
        break
      }
    }
  }

  /**
   * 对文件的每一行执行相同的处理
   */
  async handleEveryLine(func: (lineStr: string, lineIdx: number) => void): Promise<void> {
    const rl = readline.createInterface({
      input: fs.createReadStream(this.path),
      crlfDelay: Infinity,
    })
    let lineIdx = 0
    // eslint-disable-next-line no-restricted-syntax
    for await (const line of rl) {
      func(line, lineIdx)
      lineIdx += 1
    }
  }

  private __write(content: string, flag = "w", encoding: BufferEncoding = "utf-8") {
    fs.writeFileSync(this.path, content, {
      encoding,
      flag,
    })
    return this
  }

  /**
   * 覆盖式写入
   */
  write(content: string, encoding: BufferEncoding = "utf-8") {
    return this.__write(content, "w", encoding)
  }

  /**
   * 尾添加式写入
   */
  aWrite(content: string, encoding: BufferEncoding = "utf-8") {
    return this.__write(content, "a", encoding)
  }

  moveTo(...paths: string[]) {
    const newBase = new Base(...paths)
    newBase.parent.createAsDir()
    fs.renameSync(this.path, newBase.path)
    this.originData = paths
    return this
  }

  remove() {
    fs.unlinkSync(this.path)
    return new Base(this.path)
  }

  toJsonData(): FileJson {
    return {
      basename: this.basename,
      children: null,
    }
  }
}

export class Json extends File {
  /**
   * read as json, or throw Error
   */
  readSync(encoding: BufferEncoding = "utf-8") {
    const data = fs.readFileSync(this.path, { encoding })
    if (data.trim() === "") {
      return null
    }
    return JSON.parse(data)
  }

  /**
   * write as json
   */
  writeSync(data: any, space = 0, encoding: BufferEncoding = "utf-8") {
    let str = ""
    if (typeof data === "string") {
      str = data
    } else {
      str = JSON.stringify(data, null, space)
    }
    fs.writeFileSync(this.path, str, { encoding })
    return this
  }
}

export class Dir extends Base {
  constructor(...paths: string[]) {
    super(...paths)
    assert(this.isDir, `${this.path} is not dir`)
  }

  get parent() {
    return new Dir(this.dirname)
  }

  get rawChildren() {
    return fs.readdirSync(this.path)
  }

  get files(): File[] {
    return this.rawChildren.map((name) => {
      try {
        return new File(this.path, name)
      } catch (err) {
        return null
      }
    }).filter(Boolean)
  }

  get dirs(): Dir[] {
    return this.rawChildren.map((name) => {
      try {
        return new Dir(this.path, name)
      } catch (err) {
        return null
      }
    }).filter(Boolean)
  }

  get allFiles() {
    const files = [...this.files]
    this.allDirs.forEach((dir) => {
      files.push(...dir.files)
    })
    // 不用递归，防止爆栈
    // this.dirs.forEach(dir => {
    //   files.push(...dir.allFiles)
    // })
    return files
  }

  get allDirs() {
    const dirs = [...this.dirs]
    let curIdx = 0
    while (curIdx < dirs.length) { // 这儿利用的就是 [].length 动态获取长度
      dirs.push(...dirs[curIdx].dirs)
      curIdx += 1
    }
    // 不用递归，防止爆栈
    // this.dirs.forEach(dir => {
    //   dirs.push(...dir.allDirs)
    // })
    return dirs
  }

  get fileNames() {
    return this.files.map((f) => f.basename)
  }

  get dirNames() {
    return this.dirs.map((d) => d.basename)
  }

  moveTo(...paths: string[]) {
    const newBase = new Base(...paths)
    newBase.parent.createAsDir()
    fs.renameSync(this.path, newBase.path)
    this.originData = paths
    return this
  }

  remove(defaultInput?: boolean) {
    return new Promise((resolve, reject) => {
      questionBoolean(`将会删除【${this.path}】整个目录及其子目录`, defaultInput).then((ans) => {
        if (ans) {
          fs.rmdirSync(this.path, {
            recursive: true,
          })
          resolve(new Base(this.path))
        } else {
          reject(new Error("您手动取消了删除目录"))
        }
      })
    })
  }

  dangerousRemoveWithoutEnsure() {
    fs.rmdirSync(this.path, {
      recursive: true,
    })
    return new Base(this.path)
  }

  toJsonData(filterChildrenDirs?: Filter): DirJson {
    const result: DirJson = {
      basename: this.basename,
      children: [],
    }
    if (filterChildrenDirs instanceof Function) {
      this.files.forEach((f) => {
        if (filterChildrenDirs(f)) {
          result.children.push(f.toJsonData())
        }
      })
      this.dirs.forEach((d) => {
        if (filterChildrenDirs(d)) {
          result.children.push(d.toJsonData(filterChildrenDirs))
        }
      })
    } else {
      this.files.forEach((f) => {
        result.children.push(f.toJsonData())
      })
      this.dirs.forEach((d) => {
        result.children.push(d.toJsonData())
      })
    }
    return result
  }
}

export function getInputFiles() {
  const files: File[] = []
  process.argv.slice(2).forEach((arg) => {
    const base = new Base(arg)
    if (base.isFile) {
      files.push(base.asFile())
    } else if (base.isDir) {
      files.push(...base.asDir().allFiles)
    }
  })
  return files
}
