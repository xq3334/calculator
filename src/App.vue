<script setup>
import { computed, ref } from 'vue'
import {
  Calculator,
  Delete,
  Menu,
  Minus,
  PanelRightOpen,
  Square,
  X,
} from 'lucide-vue-next'
import {
  backspaceInput,
  clearInput,
  inputDecimal,
  inputDigit,
  toggleSign,
} from './calculatorInput'

const displayValue = ref('0')
const shouldReplaceInput = ref(false)

const digitKeys = {
  zero: '0',
  one: '1',
  two: '2',
  three: '3',
  four: '4',
  five: '5',
  six: '6',
  seven: '7',
  eight: '8',
  nine: '9',
}

const deferredInputKeys = new Set([
  'add',
  'subtract',
  'multiply',
  'divide',
  'equals',
  'percent',
  'reciprocal',
  'square',
  'sqrt',
])

const memoryKeys = [
  { label: 'MC', muted: true },
  { label: 'MR', muted: true },
  { label: 'M+' },
  { label: 'M-' },
  { label: 'MS' },
]

const keys = [
  { id: 'percent', label: '%', class: 'soft' },
  { id: 'ce', label: 'CE', class: 'soft' },
  { id: 'clear', label: 'C', class: 'soft' },
  { label: 'backspace', class: 'soft', icon: Delete, aria: '退格' },
  { id: 'reciprocal', label: '1/x', class: 'soft math fraction' },
  { id: 'square', label: 'x²', class: 'soft math' },
  { id: 'sqrt', label: '²√x', class: 'soft math' },
  { id: 'divide', label: '÷', class: 'soft operator' },
  { id: 'seven', label: '7' },
  { id: 'eight', label: '8' },
  { id: 'nine', label: '9' },
  { id: 'multiply', label: '×', class: 'operator' },
  { id: 'four', label: '4' },
  { id: 'five', label: '5' },
  { id: 'six', label: '6' },
  { id: 'subtract', label: '-', class: 'operator' },
  { id: 'one', label: '1' },
  { id: 'two', label: '2' },
  { id: 'three', label: '3' },
  { id: 'add', label: '+', class: 'operator' },
  { id: 'sign', label: '+/-' },
  { id: 'zero', label: '0' },
  { id: 'decimal', label: '.' },
  { id: 'equals', label: '=', class: 'equals' },
]

const displayClass = computed(() => ({
  compact: displayValue.value.length > 12,
  dense: displayValue.value.length > 16,
}))

function commitDisplay(nextValue) {
  displayValue.value = nextValue
  shouldReplaceInput.value = false
}

function handleDigit(digit) {
  commitDisplay(inputDigit(displayValue.value, digit, shouldReplaceInput.value))
}

function handleDecimal() {
  commitDisplay(inputDecimal(displayValue.value, shouldReplaceInput.value))
}

function handleBackspace() {
  commitDisplay(backspaceInput(displayValue.value, shouldReplaceInput.value))
}

function handleClear() {
  commitDisplay(clearInput())
}

function handleClearEntry() {
  commitDisplay(clearInput())
}

function handleSign() {
  commitDisplay(toggleSign(displayValue.value))
}

function handleDeferredInput() {
  shouldReplaceInput.value = true
}

function handleKeyClick(key) {
  const digit = digitKeys[key.id]

  if (digit !== undefined) {
    handleDigit(digit)
    return
  }

  switch (key.id) {
    case 'decimal':
      handleDecimal()
      break
    case 'sign':
      handleSign()
      break
    case 'clear':
      handleClear()
      break
    case 'ce':
      handleClearEntry()
      break
    case undefined:
      if (key.label === 'backspace') {
        handleBackspace()
      }
      break
    default:
      if (deferredInputKeys.has(key.id)) {
        handleDeferredInput()
      }
  }
}
</script>

<template>
  <main class="calculator-window" aria-label="Windows 标准计算器静态页面">
    <header class="titlebar">
      <div class="app-title">
        <Calculator :size="18" stroke-width="1.8" class="app-icon" aria-hidden="true" />
        <span>计算器</span>
      </div>
      <div class="window-controls" aria-label="窗口控制">
        <button class="window-button" aria-label="最小化"><Minus :size="18" /></button>
        <button class="window-button" aria-label="最大化"><Square :size="16" /></button>
        <button class="window-button close" aria-label="关闭"><X :size="19" /></button>
      </div>
    </header>

    <section class="workspace">
      <section class="standard-panel" aria-label="标准计算器">
        <div class="modebar">
          <button class="icon-button" aria-label="打开菜单"><Menu :size="26" /></button>
          <h1>标准</h1>
          <button class="icon-button compact" aria-label="切换面板">
            <PanelRightOpen :size="24" />
          </button>
        </div>

        <section class="display" aria-label="当前显示值">
          <output :class="displayClass" aria-live="polite">{{ displayValue }}</output>
        </section>

        <nav class="memory-row" aria-label="内存操作">
          <button
            v-for="item in memoryKeys"
            :key="item.label"
            :class="{ muted: item.muted }"
            type="button"
          >
            {{ item.label }}
          </button>
        </nav>

        <section class="keypad" aria-label="计算器按键">
          <button
            v-for="key in keys"
            :key="key.id || key.label"
            :class="['calc-key', key.class]"
            :aria-label="key.aria || key.label"
            @click="handleKeyClick(key)"
            type="button"
          >
            <component :is="key.icon" v-if="key.icon" :size="22" stroke-width="1.7" />
            <span v-else-if="key.id === 'reciprocal'" class="reciprocal">
              <span>1</span><span>x</span>
            </span>
            <span v-else-if="key.id === 'square'">x<sup>2</sup></span>
            <span v-else-if="key.id === 'sqrt'"><sup>2</sup>√x</span>
            <span v-else>{{ key.label }}</span>
          </button>
        </section>
      </section>

      <aside class="history-panel" aria-label="历史记录和记忆">
        <div class="tabs" role="tablist" aria-label="侧边栏">
          <button class="active" role="tab" aria-selected="true" type="button">历史记录</button>
          <button role="tab" aria-selected="false" type="button">记忆</button>
        </div>
        <p class="empty-state">尚无历史记录。</p>
      </aside>
    </section>
  </main>
</template>
