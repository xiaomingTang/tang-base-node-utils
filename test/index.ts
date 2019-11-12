import {
  question,
  questionUntil,
  questionNumber,
} from "../src/index"

function log(s: string) {
  console.log(`
----------------

--- ${s} ---

----------------
  `)
}

async function main() {
  let closeFlagA = ""
  log("开始测试 question 函数，输入美元符号 $ 结束该段测试...")
  while (closeFlagA !== "$") {
    closeFlagA = await question("无输入(直接回车)视为无效输入，其他任意字符(包括空格)均视为有效输入: ")
    console.log(`有效输入: 【${closeFlagA}】`)
  }

  let closeFlagB = ""
  log("开始测试 questionUntil 函数，输入美元符号 $ 结束该段测试...")
  while (closeFlagB !== "$") {
    closeFlagB = await questionUntil("任何 不符合回调函数 的输入均为无效输入，例如这儿的回调函数是：字符 $ 或 数字 0 才视为有效输入: ", (input) => ["$", "0"].includes(input))
    console.log(`有效输入: 【${closeFlagB}】`)
  }

  let closeFlagC = 0
  log("开始测试 questionNumber 函数，输入数字 99 结束该段测试...")
  while (closeFlagC !== 99) {
    closeFlagC = await questionNumber("只有合法数字输入才是有效输入: ")
    console.log(`有效输入: 【${closeFlagC}】`)
  }
}

main()
