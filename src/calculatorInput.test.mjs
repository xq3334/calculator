import assert from 'node:assert/strict'
import {
  backspaceInput,
  clearInput,
  inputDecimal,
  inputDigit,
  toggleSign,
} from './calculatorInput.js'

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

console.log('calculator input tests passed')
