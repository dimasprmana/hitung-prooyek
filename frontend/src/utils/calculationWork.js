function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function makeWorkFromCalculation(
  type,
  title,
  inputData,
  resultData,
) {
  return {
    id: uid('work'),
    type,
    calculatorType: type,
    title,
    inputData,
    resultData,
    totalCost: resultData.totalCost,
  }
}
