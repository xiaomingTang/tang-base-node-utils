const fs = require("fs")
const path = require("path")
const readline = require("readline")
const assert = require('assert')

class Base {
  constructor(str) {
    this.originData = str
  }

  get path() {
    return path.resolve(this.originData)
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

  createAsDir() {
    if (!this.isDir) {
      fs.mkdirSync(this.path, { recursive: true })
    }
    return new Dir(this.path)
  }

  createAsFile() {
    this.parent.createAsDir()
    fs.writeFileSync(this.path, "", { flag: "a" })
    return new File(this.path)
  }

  sibling(basename) {
    return new Base(path.join(this.dirname, basename))
  }

  // 感觉没什么用，暂时撤下
  // static fromJsonData(obj) {
  //   const oldCwd = process.cwd()
  //   if (obj.children) {
  //     new Base(obj.basename).createAsDir()
  //     process.chdir(obj.basename)
  //     obj.children.forEach(child => Base.fromJsonData(child))
  //     process.chdir(oldCwd)
  //     return new Dir(obj.basename)
  //   } else {
  //     return new Base(obj.basename).createAsFile()
  //   }
  // }
}

class File extends Base {
  constructor(str) {
    super(str)
    assert(this.isFile, `${this.path} is not file`)
  }

  get suffix() {
    return path.parse(this.path).ext
  }

  get name() {
    return path.parse(this.path).name
  }

  get parent() {
    return new Dir(this.dirname)
  }

  read(encoding="utf8") {
    return fs.readFileSync(this.path, {
      encoding,
      flag: "r",
    })
  }

  __write(content, flag="w", encoding="utf8") {
    fs.writeFileSync(this.path, content, {
      encoding,
      flag,
    })
    return this
  }
  
  write(content, encoding) {
    return this.__write(content, "w", encoding)
  }

  aWrite(content, encoding) {
    return this.__write(content, "a", encoding)
  }

  moveTo(newPath) {
    fs.renameSync(this.path, newPath)
    this.originData = newPath
    return this
  }

  remove() {
    fs.unlinkSync(this.path)
    return new Base(this.path)
  }

  toJsonData() {
    return {
      basename: this.basename,
      children: null,
    }
  }
}

class Dir extends Base {
  constructor(str) {
    super(str)
    assert(this.isDir, `${this.path} is not dir`)
  }

  get name() {
    return this.basename
  }

  get suffix() {
    return ""
  }

  get parent() {
    return new Dir(this.dirname)
  }

  get rawChildren() {
    return fs.readdirSync(this.path)
  }

  get files() {
    return this.rawChildren.map(name => {
      try {
        return new File(path.join(this.path, name))
      } catch (err) {
        return null
      }
    }).filter(f => !!f)
  }

  get dirs() {
    return this.rawChildren.map(name => {
      try {
        return new Dir(path.join(this.path, name))
      } catch (err) {
        return null
      }
    }).filter(d => !!d)
  }

  get allFiles() {
    const files = [...this.files]
    this.allDirs.forEach(dir => {
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
    while(curIdx < dirs.length) { // 这儿利用的就是 [].length 动态获取长度
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
    return this.files.map(f => f.basename)
  }

  get dirNames() {
    return this.dirs.map(d => d.basename)
  }

  moveTo(newPath) {
    fs.renameSync(this.path, newPath)
    this.originData = newPath
    return this
  }

  remove() {
    if (question(`将会删除【${this.path}】整个目录及其子目录, 是否确定[y / n]?`).toLowerCase() === "y") {
      fs.rmdirSync(this.path, {
        recursive: true,
      })
      return new Base(this.path)
    }
    return this
  }

  toJsonData() {
    const result = {
      basename: this.basename,
      children: [],
    }
    this.files.forEach(f => {
      result.children.push(f.toJsonData())
    })
    this.dirs.forEach(d => {
      result.children.push(d.toJsonData())
    })
    return result
  }
}

class Json extends File {
  constructor(str) {
    super(str)
  }

  readSync(encoding="utf8") {
    const data = fs.readFileSync(this.path, { encoding })
    return JSON.parse(data)
  }

  writeSync(data, space=0, encoding="utf8") {
    let str = ""
    if (typeof(data) === "string") {
      str = data
    } else {
      str = JSON.stringify(data, null, space)
    }
    fs.writeFileSync(this.path, str, { encoding })
    return this
  }
}

function __queryInput(queryStr) {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    rl.question(queryStr, (answer) => {
      resolve(answer.trim())
      rl.close()
    });
  })
}

async function question(queryStr, defaultValue) {
  const inputStr = await __queryInput(queryStr)

  if (defaultValue === undefined) {
    if (inputStr === "") {
      return await question(queryStr, defaultValue)
    } else {
      return inputStr
    }
  } else {
    if (inputStr === "") {
      return defaultValue
    } else {
      return inputStr
    }
  }
}

async function questionUntil(queryStr, f) {
  const inputStr = await question(queryStr)
  if (f(inputStr)) {
    return inputStr
  }
  return await questionUntil(queryStr, f)
}

async function questionNumber(queryStr, defaultValue) {
  assert(typeof(defaultValue) === "number", `${defaultValue} is not number`)
  const defaultStr = `${defaultValue}`

  return new Promise(async (resolve, reject) => {
    let input = ""
    while(!/^\d+(\.\d+)?$/.test(input)) {
      input = await question(queryStr, defaultStr)
    }
    resolve(+input)
  })
}

function refreshProp(obj, propName) {
  const newProp = JSON.parse(JSON.stringify(obj[propName]))
  delete(obj[propName])
  obj[propName] = newProp
}

function enumerate(arr) {
  return arr.map((item, i) => [item, i])
}

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
