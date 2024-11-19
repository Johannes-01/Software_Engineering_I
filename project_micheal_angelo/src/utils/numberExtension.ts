export function toDoubleWithTwoDecimalPlaces(num: number): number {
    return parseFloat((num / 100).toFixed(2));
}

export function fromDoubleWithTwoDecimalInt(num: number): number {
    return parseFloat((num * 100).toFixed(0));
}