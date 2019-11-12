# tang-base-node-utils

一个让`文件+目录的读写`更简单的语法糖    
& 一个让`交互`更简单的语法糖

```javascript
const newFile = new Base("nonexistent-file").createAsFile()

newFile.write("what ever").moveTo("nonexistent-path")

newFile.handleLineByLine((str, i, close) => {
  console.log(`${i} -> ${str}`)
  if (i >= 5) {
    close()  // quit?
  }
})

async function func() {
  const inputStr = question("not non string to be accepted.", defaultValIfNeeded)
  const inputNum = questionNumber("quit until valid number.", defaultValIfNeeded)
  const specialInput = questionUntil("quit until valid string", (inputStr) => {
    return /^a (young|naive|simple) guy$/.test(inputStr)
  })
}

func()
```