declare function question(queryStr: string, defaultValue?: string): Promise<string>;
declare function questionUntil(queryStr: string, f: (input: string) => boolean): Promise<string>;
declare function questionNumber(queryStr: string, defaultValue?: number): Promise<number>;
declare function refreshProp(obj: any, propName: string): void;
declare function enumerate<T>(arr: T[]): [T, number][];
declare function forRun<T>(arr: T[], func: (value: T, index: number, array: T[]) => void): Promise<void>;
export { question, questionUntil, questionNumber, refreshProp, enumerate, forRun, };
