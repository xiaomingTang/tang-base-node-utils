/* eslint-disable max-classes-per-file */
import * as fs from "fs"
import * as path from "path"
import * as assert from "assert"
import * as readline from "readline"
import { question } from "./utils"

export interface FileJson {
  basename: string;
  children: null;
}

export interface DirJson {
  basename: string;
  children: (FileJson | DirJson)[];
}

export class Base {
  originData: string[];

  constructor(...paths: string[]) {
    this.originData = [...paths]
  }

  get path() {
    return path.resolve(...this.originData)
  }

  get dirname() {
    return path.dirname(this.path)
  }

  get basename() {
    return path.basename(this.path)
  }

  get parent() {
    return new Base(this.dirname)
  }

  get stat() {
    try {
      return fs.statSync(this.path)
    } catch (err) {
      return null
    }
  }

  get isFile() {
    return this.stat && this.stat.isFile()
  }

  get isDir() {
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

  createAsDir() {
    if (!this.isDir) {
      fs.mkdirSync(this.path, { recursive: true })
    }
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return new Dir(this.path)
  }

  createAsFile() {
    this.parent.createAsDir()
    fs.writeFileSync(this.path, "", { flag: "a" })
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return new File(this.path)
  }

  sibling(basename: string) {
    return new Base(path.join(this.dirname, basename))
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

  read(encoding = "utf8") {
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

  private __write(content: string, flag = "w", encoding = "utf8") {
    fs.writeFileSync(this.path, content, {
      encoding,
      flag,
    })
    return this
  }

  /**
   * 覆盖式写入
   */
  write(content: string, encoding: string) {
    return this.__write(content, "w", encoding)
  }

  /**
   * 尾添加式写入
   */
  aWrite(content: string, encoding: string) {
    return this.__write(content, "a", encoding)
  }

  moveTo(newPath: string) {
    new Base(newPath).parent.createAsDir()
    fs.renameSync(this.path, newPath)
    this.originData = [newPath]
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
  readSync(encoding = "utf8") {
    const data = fs.readFileSync(this.path, { encoding })
    return JSON.parse(data)
  }

  writeSync(data: any, space = 0, encoding = "utf8") {
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
  suffix = ""

  constructor(...paths: string[]) {
    super(...paths)
    assert(this.isDir, `${this.path} is not dir`)
  }

  get name() {
    return this.basename
  }

  get parent() {
    return new Dir(this.dirname)
  }

  get rawChildren() {
    return fs.readdirSync(this.path)
  }

  get files() {
    return this.rawChildren.map((name) => {
      try {
        return new File(path.join(this.path, name))
      } catch (err) {
        return null
      }
    }).filter((f) => !!f)
  }

  get dirs() {
    return this.rawChildren.map((name) => {
      try {
        return new Dir(path.join(this.path, name))
      } catch (err) {
        return null
      }
    }).filter((d) => !!d)
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

  moveTo(newPath: string) {
    new Base(newPath).parent.createAsDir()
    fs.renameSync(this.path, newPath)
    this.originData = [newPath]
    return this
  }

  remove(defaultPrompt?: string) {
    return new Promise((resolve, reject) => {
      question(`将会删除【${this.path}】整个目录及其子目录, 是否确定[y / n]?`, defaultPrompt).then((ans) => {
        if (ans.toLowerCase() === "y") {
          fs.rmdirSync(this.path, {
            recursive: true,
          })
          resolve(new Base(this.path))
        }
        reject(new Error("您手动取消了删除目录"))
      })
    })
  }

  dangerousRemoveWithoutEnsure() {
    fs.rmdirSync(this.path, {
      recursive: true,
    })
    return new Base(this.path)
  }

  toJsonData(): DirJson {
    const result: DirJson = {
      basename: this.basename,
      children: [],
    }
    this.files.forEach((f) => {
      result.children.push(f.toJsonData())
    })
    this.dirs.forEach((d) => {
      result.children.push(d.toJsonData())
    })
    return result
  }
}
