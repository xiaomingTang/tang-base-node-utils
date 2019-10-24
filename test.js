const { File } = require("./index")
const path = require("path")

const f = new File(path.join(__dirname, "package.json"))

f.handleEveryLine((str, num) => {
  console.log(`${num} -> ${str}`)
})

f.handleLineByLine((str, num, close) => {
  console.log(`${num} -> ${str}`)
  if (num >= 11) {
    close()
  }
})
