import * as readline from "readline"
import * as assert from "assert"

function isEmpty(s: any) {
  return s === null || s === undefined
}

function __queryInput(queryStr: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    rl.question(queryStr, (answer) => {
      resolve(answer)
      rl.close()
    })
  })
}

async function question(queryStr: string, defaultValue?: string): Promise<string> {
  const noDefaultValue = isEmpty(defaultValue)
  const prompt = noDefaultValue ? queryStr : `${queryStr}, 缺省值【${defaultValue}】: `
  const inputStr = await __queryInput(prompt)

  if (noDefaultValue) { // 无默认值
    if (inputStr === "") {
      return question(queryStr)
    }
    return inputStr
  }
  // 有默认值
  if (inputStr === "") {
    return defaultValue
  }
  return inputStr
}

async function questionUntil(queryStr: string, f: (input: string) => boolean): Promise<string> {
  const inputStr = await question(queryStr)
  if (f(inputStr)) {
    return inputStr
  }
  return questionUntil(queryStr, f)
}

async function questionNumber(queryStr: string, defaultValue?: number) {
  assert(
    isEmpty(defaultValue) || (typeof defaultValue === "number"),
    `${defaultValue} is not number`,
  )
  const defaultStr = isEmpty(defaultValue) ? undefined : `${defaultValue}`

  let input = ""
  while (!/^[+-]?\d+(\.\d+)?$/.test(input)) {
    input = await question(queryStr, defaultStr)
  }

  return +input
}

function refreshProp(obj: any, propName: string) {
  const newProp = JSON.parse(JSON.stringify(obj[propName]))
  /* eslint-disable no-param-reassign */
  delete obj[propName]
  obj[propName] = newProp
  /* eslint-enable no-param-reassign */
}

function enumerate<T>(arr: T[]): [T, number][] {
  return arr.map((item, i) => [item, i])
}

async function forRun<T>(arr: T[], func: (value: T, index: number, array: T[]) => void): Promise<void> {
  for (let i = 0, len = arr.length; i < len; i += 1) {
    await func(arr[i], i, arr)
  }
}

export {
  question,
  questionUntil,
  questionNumber,
  refreshProp,
  enumerate,
  forRun,
}
