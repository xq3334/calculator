export const INITIAL_DISPLAY = '0'
export const MAX_INPUT_DIGITS = 16

export function countDigits(value) {
  return value.replace(/\D/g, '').length
}

export function inputDigit(currentValue, digit, shouldReplace = false) {
  if (shouldReplace) {
    return digit
  }

  if (countDigits(currentValue) >= MAX_INPUT_DIGITS) {
    return currentValue
  }

  if (currentValue === INITIAL_DISPLAY) {
    return digit === '0' ? INITIAL_DISPLAY : digit
  }

  if (currentValue === `-${INITIAL_DISPLAY}`) {
    return digit === '0' ? INITIAL_DISPLAY : `-${digit}`
  }

  return `${currentValue}${digit}`
}

export function inputDecimal(currentValue, shouldReplace = false) {
  if (shouldReplace) {
    return `${INITIAL_DISPLAY}.`
  }

  if (currentValue.includes('.')) {
    return currentValue
  }

  return `${currentValue}.`
}

export function toggleSign(currentValue) {
  if (Number(currentValue) === 0) {
    return currentValue
  }

  return currentValue.startsWith('-') ? currentValue.slice(1) : `-${currentValue}`
}

export function backspaceInput(currentValue, shouldReplace = false) {
  if (shouldReplace || currentValue.length <= 1) {
    return INITIAL_DISPLAY
  }

  const nextValue = currentValue.slice(0, -1)

  if (nextValue === '' || nextValue === '-' || nextValue === '-0' || nextValue === '-0.') {
    return INITIAL_DISPLAY
  }

  return nextValue
}

export function clearInput() {
  return INITIAL_DISPLAY
}
