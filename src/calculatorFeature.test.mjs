import assert from 'node:assert/strict'
import {
  createInitialState,
  formatNumber,
  pressBinaryOperator,
  pressClear,
  pressClearEntry,
  pressDigit,
  pressEquals,
  pressUnaryOperator,
  toNumber,
} from './calculatorEngine.js'

const digitIds = {
  '0': 'zero',
  '1': 'one',
  '2': 'two',
  '3': 'three',
  '4': 'four',
  '5': 'five',
  '6': 'six',
  '7': 'seven',
  '8': 'eight',
  '9': 'nine',
}

const keyboardMap = {
  '+': 'add',
  '-': 'subtract',
  '*': 'multiply',
  '/': 'divide',
  Enter: 'equals',
  '=': 'equals',
  '%': 'percent',
  Delete: 'ce',
  Escape: 'clear',
}

function createHarness() {
  return {
    state: createInitialState(),
    history: [],
    memory: null,
  }
}

function commit(app, nextState) {
  app.state = nextState

  if (nextState.completedEntry) {
    app.history.unshift({
      expression: nextState.completedEntry.expression,
      result: nextState.completedEntry.result,
    })

    app.state = {
      ...nextState,
      completedEntry: null,
    }
  }
}

function press(app, action) {
  if (/^\d$/.test(action)) {
    commit(app, pressDigit(app.state, action))
    return
  }

  switch (action) {
    case 'add':
    case 'subtract':
    case 'multiply':
    case 'divide':
      commit(app, pressBinaryOperator(app.state, action))
      break
    case 'equals':
      commit(app, pressEquals(app.state))
      break
    case 'sqrt':
    case 'square':
    case 'reciprocal':
    case 'percent':
      commit(app, pressUnaryOperator(app.state, action))
      break
    case 'ce':
      commit(app, pressClearEntry(app.state))
      break
    case 'clear':
      commit(app, pressClear())
      break
  }
}

function pressKey(app, key) {
  if (/^\d$/.test(key)) {
    assert.ok(digitIds[key])
    press(app, key)
    return
  }

  const action = keyboardMap[key]
  assert.ok(action, `missing keyboard action for ${key}`)
  press(app, action)
}

function memory(app, action) {
  if (app.state.isError) {
    return
  }

  const currentValue = toNumber(app.state.displayValue)

  switch (action) {
    case 'MS':
      app.memory = currentValue
      break
    case 'MR':
      if (app.memory !== null) {
        app.state = {
          ...app.state,
          displayValue: formatNumber(app.memory),
          expressionValue: formatNumber(app.memory),
          isNewInput: false,
        }
      }
      break
    case 'M+':
      app.memory = (app.memory ?? 0) + currentValue
      break
    case 'M-':
      app.memory = (app.memory ?? 0) - currentValue
      break
    case 'MC':
      app.memory = null
      break
  }
}

let app = createHarness()
press(app, '1')
press(app, '2')
press(app, 'add')
press(app, '3')
press(app, 'equals')
assert.equal(app.state.displayValue, '15')
assert.deepEqual(app.history, [{ expression: '12 + 3 =', result: '15' }])

press(app, 'equals')
assert.equal(app.state.displayValue, '18')
assert.deepEqual(app.history[0], { expression: '15 + 3 =', result: '18' })

app = createHarness()
press(app, '9')
press(app, 'sqrt')
press(app, 'multiply')
press(app, '2')
press(app, 'equals')
assert.deepEqual(app.history[0], { expression: '√(9) × 2 =', result: '6' })

app = createHarness()
press(app, '5')
memory(app, 'MS')
press(app, '2')
memory(app, 'M+')
assert.equal(app.memory, 57)
memory(app, 'M-')
assert.equal(app.memory, 5)
memory(app, 'MR')
assert.equal(app.state.displayValue, '5')
memory(app, 'MC')
assert.equal(app.memory, null)

app = createHarness()
pressKey(app, '8')
pressKey(app, '/')
pressKey(app, '0')
pressKey(app, 'Enter')
assert.equal(app.state.isError, true)
assert.equal(app.state.displayValue, '无法除以零')
pressKey(app, 'Escape')
assert.deepEqual(app.state, createInitialState())

app = createHarness()
pressKey(app, '4')
pressKey(app, '+')
pressKey(app, 'Delete')
pressKey(app, '9')
pressKey(app, '=')
assert.equal(app.state.displayValue, '13')

console.log('calculator feature tests passed')
