import assert from 'node:assert/strict'
import {
  backspaceInput,
  clearInput,
  createInitialState,
  inputDecimal,
  inputDigit,
  pressBackspace,
  pressBinaryOperator,
  pressClear,
  pressClearEntry,
  pressDecimal,
  pressDigit,
  pressEquals,
  pressSign,
  pressUnaryOperator,
  toggleSign,
} from './calculatorEngine.js'

assert.equal(inputDigit('0', '7'), '7')
assert.equal(inputDigit('0', '0'), '0')
assert.equal(inputDigit('12', '3'), '123')
assert.equal(inputDigit('987', '4', true), '4')

assert.equal(inputDecimal('0'), '0.')
assert.equal(inputDecimal('12'), '12.')
assert.equal(inputDecimal('12.3'), '12.3')
assert.equal(inputDecimal('12.3', true), '0.')

assert.equal(toggleSign('8'), '-8')
assert.equal(toggleSign('-8'), '8')
assert.equal(toggleSign('0'), '0')
assert.equal(toggleSign('0.'), '0.')

assert.equal(backspaceInput('123'), '12')
assert.equal(backspaceInput('1'), '0')
assert.equal(backspaceInput('-1'), '0')
assert.equal(backspaceInput('123', true), '0')

assert.equal(clearInput(), '0')

let state = createInitialState()
state = pressDigit(state, '1')
state = pressDigit(state, '2')
state = pressBinaryOperator(state, 'add')
state = pressDigit(state, '3')
state = pressEquals(state)
assert.equal(state.displayValue, '15')

state = pressEquals(state)
assert.equal(state.displayValue, '18')

state = createInitialState()
state = pressDigit(state, '1')
state = pressBinaryOperator(state, 'add')
state = pressDigit(state, '2')
state = pressBinaryOperator(state, 'add')
assert.equal(state.displayValue, '3')
state = pressDigit(state, '3')
state = pressEquals(state)
assert.equal(state.displayValue, '6')

state = createInitialState()
state = pressDigit(state, '8')
state = pressBinaryOperator(state, 'add')
state = pressBinaryOperator(state, 'subtract')
state = pressDigit(state, '3')
state = pressEquals(state)
assert.equal(state.displayValue, '5')

state = createInitialState()
state = pressDigit(state, '8')
state = pressBinaryOperator(state, 'divide')
state = pressDigit(state, '0')
state = pressEquals(state)
assert.equal(state.displayValue, '无法除以零')
assert.equal(state.isError, true)

state = createInitialState()
state = pressDigit(state, '9')
state = pressUnaryOperator(state, 'sqrt')
assert.equal(state.displayValue, '3')

state = createInitialState()
state = pressDigit(state, '5')
state = pressUnaryOperator(state, 'square')
assert.equal(state.displayValue, '25')

state = createInitialState()
state = pressDigit(state, '4')
state = pressUnaryOperator(state, 'reciprocal')
assert.equal(state.displayValue, '0.25')

state = createInitialState()
state = pressDigit(state, '2')
state = pressDigit(state, '0')
state = pressDigit(state, '0')
state = pressBinaryOperator(state, 'add')
state = pressDigit(state, '1')
state = pressDigit(state, '0')
state = pressUnaryOperator(state, 'percent')
assert.equal(state.displayValue, '20')
state = pressEquals(state)
assert.equal(state.displayValue, '220')

state = createInitialState()
state = pressDigit(state, '7')
state = pressBinaryOperator(state, 'add')
state = pressDigit(state, '2')
state = pressClearEntry(state)
assert.equal(state.displayValue, '0')
state = pressDigit(state, '5')
state = pressEquals(state)
assert.equal(state.displayValue, '12')

state = createInitialState()
state = pressDigit(state, '7')
state = pressBinaryOperator(state, 'add')
state = pressDigit(state, '2')
state = pressClear()
assert.deepEqual(state, createInitialState())

state = createInitialState()
state = pressDigit(state, '1')
state = pressDigit(state, '2')
state = pressBackspace(state)
assert.equal(state.displayValue, '1')

state = pressDecimal(createInitialState())
assert.equal(state.displayValue, '0.')
state = pressDigit(state, '5')
assert.equal(state.displayValue, '0.5')

state = pressSign(pressDigit(createInitialState(), '9'))
assert.equal(state.displayValue, '-9')

console.log('calculator engine tests passed')
