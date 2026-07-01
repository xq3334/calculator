export const INITIAL_DISPLAY = '0'
export const MAX_INPUT_DIGITS = 16

const binaryOperatorLabels = {
  add: '+',
  subtract: '-',
  multiply: '×',
  divide: '÷',
}

export function createInitialState() {
  return {
    displayValue: INITIAL_DISPLAY,
    storedValue: null,
    pendingOperator: null,
    lastOperation: null,
    isNewInput: true,
    isError: false,
  }
}

export function countDigits(value) {
  return String(value).replace(/\D/g, '').length
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

export function toNumber(value) {
  return Number(String(value).replace(/,/g, ''))
}

export function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return '错误'
  }

  if (Object.is(value, -0) || Math.abs(value) < Number.EPSILON) {
    return INITIAL_DISPLAY
  }

  const rounded = Number(value.toPrecision(15))
  const text = String(rounded)

  if (text.includes('e')) {
    return text
  }

  return text.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1')
}

export function formatDisplayValue(value) {
  const text = String(value)

  if (!Number.isFinite(toNumber(text))) {
    return text
  }

  if (text.includes('e')) {
    return text
  }

  const sign = text.startsWith('-') ? '-' : ''
  const unsigned = sign ? text.slice(1) : text
  const [integerPart, decimalPart] = unsigned.split('.')
  const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return `${sign}${groupedInteger}${decimalPart === undefined ? '' : `.${decimalPart}`}`
}

function errorState(message) {
  return {
    ...createInitialState(),
    displayValue: message,
    isError: true,
  }
}

function calculate(left, operator, right) {
  switch (operator) {
    case 'add':
      return { value: left + right }
    case 'subtract':
      return { value: left - right }
    case 'multiply':
      return { value: left * right }
    case 'divide':
      if (right === 0) {
        return { error: '无法除以零' }
      }
      return { value: left / right }
    default:
      return { value: right }
  }
}

function applyPendingOperation(state, rightValue = toNumber(state.displayValue)) {
  if (!state.pendingOperator || state.storedValue === null) {
    return {
      state,
      resultNumber: rightValue,
    }
  }

  const result = calculate(state.storedValue, state.pendingOperator, rightValue)

  if (result.error) {
    return {
      state: errorState(result.error),
      resultNumber: null,
    }
  }

  return {
    state: {
      ...state,
      displayValue: formatNumber(result.value),
      storedValue: result.value,
    },
    resultNumber: result.value,
  }
}

export function pressDigit(state, digit) {
  const currentState = state.isError ? createInitialState() : state

  return {
    ...currentState,
    displayValue: inputDigit(currentState.displayValue, digit, currentState.isNewInput),
    isNewInput: false,
  }
}

export function pressDecimal(state) {
  const currentState = state.isError ? createInitialState() : state

  return {
    ...currentState,
    displayValue: inputDecimal(currentState.displayValue, currentState.isNewInput),
    isNewInput: false,
  }
}

export function pressBackspace(state) {
  if (state.isError) {
    return state
  }

  return {
    ...state,
    displayValue: backspaceInput(state.displayValue, state.isNewInput),
    isNewInput: false,
  }
}

export function pressClear() {
  return createInitialState()
}

export function pressClearEntry(state) {
  if (state.isError) {
    return createInitialState()
  }

  return {
    ...state,
    displayValue: clearInput(),
    isNewInput: true,
  }
}

export function pressSign(state) {
  if (state.isError) {
    return state
  }

  return {
    ...state,
    displayValue: toggleSign(state.displayValue),
  }
}

export function pressBinaryOperator(state, operator) {
  if (state.isError) {
    return createInitialState()
  }

  if (!binaryOperatorLabels[operator]) {
    return state
  }

  const currentValue = toNumber(state.displayValue)

  if (state.pendingOperator && !state.isNewInput) {
    const applied = applyPendingOperation(state, currentValue)

    if (applied.state.isError) {
      return applied.state
    }

    return {
      ...applied.state,
      pendingOperator: operator,
      storedValue: applied.resultNumber,
      lastOperation: null,
      isNewInput: true,
    }
  }

  return {
    ...state,
    storedValue: state.storedValue === null || !state.isNewInput ? currentValue : state.storedValue,
    pendingOperator: operator,
    lastOperation: null,
    isNewInput: true,
  }
}

export function pressEquals(state) {
  if (state.isError) {
    return state
  }

  if (state.pendingOperator) {
    const rightValue = state.isNewInput ? state.storedValue : toNumber(state.displayValue)
    const applied = applyPendingOperation(state, rightValue)
    const expression = `${formatNumber(state.storedValue)} ${getOperatorLabel(state.pendingOperator)} ${formatNumber(rightValue)} =`

    if (applied.state.isError) {
      return applied.state
    }

    return {
      ...applied.state,
      storedValue: null,
      pendingOperator: null,
      lastOperation: {
        operator: state.pendingOperator,
        operand: rightValue,
      },
      isNewInput: true,
      completedEntry: {
        expression,
        result: applied.state.displayValue,
      },
    }
  }

  if (state.lastOperation) {
    const leftValue = toNumber(state.displayValue)
    const result = calculate(leftValue, state.lastOperation.operator, state.lastOperation.operand)
    const expression = `${formatNumber(leftValue)} ${getOperatorLabel(state.lastOperation.operator)} ${formatNumber(state.lastOperation.operand)} =`

    if (result.error) {
      return errorState(result.error)
    }

    return {
      ...state,
      displayValue: formatNumber(result.value),
      isNewInput: true,
      completedEntry: {
        expression,
        result: formatNumber(result.value),
      },
    }
  }

  return {
    ...state,
    isNewInput: true,
    completedEntry: null,
  }
}

export function pressUnaryOperator(state, operator) {
  if (state.isError) {
    return state
  }

  const value = toNumber(state.displayValue)
  let result

  switch (operator) {
    case 'reciprocal':
      if (value === 0) {
        return errorState('无法除以零')
      }
      result = 1 / value
      break
    case 'square':
      result = value * value
      break
    case 'sqrt':
      if (value < 0) {
        return errorState('无效输入')
      }
      result = Math.sqrt(value)
      break
    case 'percent':
      if (state.pendingOperator && state.storedValue !== null) {
        result = state.storedValue * value / 100
      } else {
        result = 0
      }
      break
    default:
      return state
  }

  return {
    ...state,
    displayValue: formatNumber(result),
    isNewInput: false,
  }
}

export function getOperatorLabel(operator) {
  return binaryOperatorLabels[operator] || ''
}
