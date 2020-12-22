import * as readline from "readline"

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

export async function question(queryStr: string, defaultValue?: string): Promise<string> {
  const noDefaultValue = isEmpty(defaultValue)
  const prompt = noDefaultValue ? queryStr : `${queryStr}, 默认值【${defaultValue}】: `
  let inputStr = await __queryInput(prompt)

  if (inputStr === "" && !noDefaultValue) {
    inputStr = defaultValue
  }

  while (inputStr === "") {
    inputStr = await __queryInput(prompt)

    if (inputStr === "" && !noDefaultValue) {
      inputStr = defaultValue
    }
  }

  return inputStr
}

export async function questionUntil(queryStr: string, f: (input: string) => boolean): Promise<string> {
  let inputStr = await question(queryStr)
  while (!f(inputStr)) {
    inputStr = await question(queryStr)
  }
  return inputStr
}

export async function questionNumber(queryStr: string, defaultValue?: number) {
  const defaultInput = isEmpty(defaultValue) ? undefined : `${defaultValue}`

  let input = ""
  while (!/^[+-]?\d+(\.\d*)?$/.test(input)) {
    input = await question(queryStr, defaultInput)
  }

  return +input
}

export async function questionBoolean(queryStr: string, defaultValue?: boolean): Promise<boolean> {
  let defaultInput
  if (isEmpty(defaultValue)) {
    defaultInput = undefined
  } else if (defaultValue) {
    defaultInput = "Y"
  } else {
    defaultInput = "n"
  }

  let input = ""
  while (!["Y", "y", "N", "n"].includes(input)) {
    input = await question(`${queryStr} 【Y/n】`, defaultInput)
  }
  return input.toLowerCase() === "y"
}

export function refreshProp(obj: any, propName: string) {
  const newProp = JSON.parse(JSON.stringify(obj[propName]))
  /* eslint-disable no-param-reassign */
  delete obj[propName]
  obj[propName] = newProp
  /* eslint-enable no-param-reassign */
}

export function enumerate<T>(arr: T[]): [T, number][] {
  return arr.map((item, i) => [item, i])
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

export type AsyncCallback<T> = (value: T, index: number, arr: T[]) => Promise<void>

/**
 * 一般用法为:
 *
 * await forRun(list, async (item, i) => {
 *
 *   // do something
 *
 * })
 */
export async function forRun<T>(arr: T[], callback: AsyncCallback<T>): Promise<void> {
  for (let i = 0, len = arr.length; i < len; i += 1) {
    await callback(arr[i], i, arr)
  }
}

export interface Size {
  width: number;
  height: number;
}

/**
 * 用于图片时确定缩放
 *
 * 尺寸不得含有0, 源尺寸必须均大于0
 *
 * 目标尺寸允许其中一个为-1, 另一个为正数, 表示以另一个正数为标准, 保持比例缩放
 */
export function resizeWithin(origin: Size, target: Size): Size {
  const {
    width: originW,
    height: originH,
  } = origin
  const {
    width: targetW,
    height: targetH,
  } = target

  if ([originW, originH, targetW, targetH].includes(0)) {
    throw new Error("尺寸不得含有0")
  }
  if (originW < 0 || originH < 0) {
    throw new Error("源尺寸必须均大于0")
  }
  if ((targetW < 0 && targetW !== -1) || (targetH < 0 && targetH !== -1)) {
    throw new Error("目标尺寸不得为其他负数 (但可以为-1, 表示以另一个正数为标准, 保持比例缩放)")
  }
  if (targetW < 0 && targetH < 0) {
    throw new Error("目标尺寸不得同时小于0")
  }

  const aspect = originW / originH

  if (targetW < 0) {
    return {
      width: Math.floor(aspect * targetH),
      height: targetH,
    }
  }
  if (targetH < 0) {
    return {
      width: targetW,
      height: Math.floor(targetW / aspect),
    }
  }
  // 瘦高, 以高为准
  if (aspect < targetW / targetH) {
    return {
      width: Math.floor(aspect * targetH),
      height: targetH,
    }
  }
  // 否则以宽为准
  return {
    width: targetW,
    height: Math.floor(targetW / aspect),
  }
}
