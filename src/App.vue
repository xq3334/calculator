<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  Calculator,
  Delete,
  Trash2,
  Menu,
  Minus,
  PanelRightOpen,
  Square,
  X,
} from 'lucide-vue-next'
import {
  createInitialState,
  getOperatorLabel,
  pressBackspace,
  pressBinaryOperator,
  pressClear,
  pressClearEntry,
  pressDecimal,
  pressDigit,
  pressEquals,
  pressSign,
  pressUnaryOperator,
  formatDisplayValue,
  formatNumber,
  toNumber,
} from './calculatorEngine'

const calculatorState = ref(createInitialState())
const activePanel = ref('history')
const historyItems = ref([])
const memoryValue = ref(null)

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

const binaryOperatorKeys = new Set(['add', 'subtract', 'multiply', 'divide'])
const unaryOperatorKeys = new Set(['percent', 'reciprocal', 'square', 'sqrt'])

const memoryKeys = [
  { id: 'memoryClear', label: 'MC' },
  { id: 'memoryRecall', label: 'MR' },
  { id: 'memoryAdd', label: 'M+' },
  { id: 'memorySubtract', label: 'M-' },
  { id: 'memoryStore', label: 'MS' },
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

const displayValue = computed(() => calculatorState.value.displayValue)
const formattedDisplayValue = computed(() => formatDisplayValue(displayValue.value))

const displayClass = computed(() => ({
  compact: formattedDisplayValue.value.length > 12,
  dense: formattedDisplayValue.value.length > 16,
  error: calculatorState.value.isError,
}))

const expressionText = computed(() => {
  const { storedValue, pendingOperator, isError } = calculatorState.value

  if (isError || storedValue === null || !pendingOperator) {
    return ''
  }

  return `${formatDisplayValue(formatNumber(storedValue))} ${getOperatorLabel(pendingOperator)}`
})

const formattedMemory = computed(() =>
  memoryValue.value === null ? '' : formatDisplayValue(formatNumber(memoryValue.value)),
)

const hasMemory = computed(() => memoryValue.value !== null)

function commitState(nextState) {
  calculatorState.value = nextState

  if (nextState.completedEntry) {
    historyItems.value = [
      {
        id: `${Date.now()}-${historyItems.value.length}`,
        expression: nextState.completedEntry.expression,
        result: nextState.completedEntry.result,
      },
      ...historyItems.value,
    ]

    calculatorState.value = {
      ...nextState,
      completedEntry: null,
    }
  }
}

function setDisplayValue(value) {
  calculatorState.value = {
    ...calculatorState.value,
    displayValue: formatNumber(toNumber(value)),
    isError: false,
    isNewInput: false,
  }
}

function handleMemoryClick(action) {
  if (calculatorState.value.isError) {
    return
  }

  const currentValue = toNumber(calculatorState.value.displayValue)

  switch (action) {
    case 'memoryClear':
      memoryValue.value = null
      break
    case 'memoryRecall':
      if (hasMemory.value) {
        setDisplayValue(memoryValue.value)
      }
      break
    case 'memoryStore':
      memoryValue.value = currentValue
      activePanel.value = 'memory'
      break
    case 'memoryAdd':
      memoryValue.value = (memoryValue.value ?? 0) + currentValue
      activePanel.value = 'memory'
      break
    case 'memorySubtract':
      memoryValue.value = (memoryValue.value ?? 0) - currentValue
      activePanel.value = 'memory'
      break
  }
}

function recallHistory(result) {
  setDisplayValue(result)
}

function clearHistory() {
  historyItems.value = []
}

function clearMemory() {
  memoryValue.value = null
}

function handleKeyAction(key) {
  const digit = digitKeys[key.id]

  if (digit !== undefined) {
    commitState(pressDigit(calculatorState.value, digit))
    return
  }

  switch (key.id) {
    case 'decimal':
      commitState(pressDecimal(calculatorState.value))
      break
    case 'sign':
      commitState(pressSign(calculatorState.value))
      break
    case 'clear':
      commitState(pressClear())
      break
    case 'ce':
      commitState(pressClearEntry(calculatorState.value))
      break
    case 'equals':
      commitState(pressEquals(calculatorState.value))
      break
    case undefined:
      if (key.label === 'backspace') {
        commitState(pressBackspace(calculatorState.value))
      }
      break
    default:
      if (binaryOperatorKeys.has(key.id)) {
        commitState(pressBinaryOperator(calculatorState.value, key.id))
      }

      if (unaryOperatorKeys.has(key.id)) {
        commitState(pressUnaryOperator(calculatorState.value, key.id))
      }
  }
}

function handleKeyboard(event) {
  if (event.ctrlKey || event.metaKey || event.altKey) {
    return
  }

  const keyboardMap = {
    '+': { id: 'add' },
    '-': { id: 'subtract' },
    '*': { id: 'multiply' },
    '/': { id: 'divide' },
    Enter: { id: 'equals' },
    '=': { id: 'equals' },
    '.': { id: 'decimal' },
    '%': { id: 'percent' },
    Escape: { id: 'clear' },
    Delete: { id: 'ce' },
    Backspace: { label: 'backspace' },
  }

  let action = null

  if (/^\d$/.test(event.key)) {
    const id = Object.keys(digitKeys).find((key) => digitKeys[key] === event.key)
    action = { id }
  } else {
    action = keyboardMap[event.key]
  }

  if (!action) {
    return
  }

  event.preventDefault()
  handleKeyAction(action)
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyboard)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyboard)
})

function getKeyClass(key) {
  return [
    'calc-key',
    key.class,
    {
      active:
        binaryOperatorKeys.has(key.id) &&
        calculatorState.value.pendingOperator === key.id &&
        calculatorState.value.isNewInput,
    },
  ]
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
          <div class="expression-line" aria-live="polite">{{ expressionText }}</div>
          <output :class="displayClass" aria-live="polite">{{ formattedDisplayValue }}</output>
        </section>

        <nav class="memory-row" aria-label="内存操作">
          <button
            v-for="item in memoryKeys"
            :key="item.label"
            :class="{ muted: !hasMemory && ['memoryClear', 'memoryRecall'].includes(item.id) }"
            :disabled="!hasMemory && ['memoryClear', 'memoryRecall'].includes(item.id)"
            @click="handleMemoryClick(item.id)"
            @keydown.space.prevent
            type="button"
          >
            {{ item.label }}
          </button>
        </nav>

        <section class="keypad" aria-label="计算器按键">
          <button
            v-for="key in keys"
            :key="key.id || key.label"
            :class="getKeyClass(key)"
            :aria-label="key.aria || key.label"
            @click="handleKeyAction(key)"
            @keydown.space.prevent
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
          <button
            :class="{ active: activePanel === 'history' }"
            role="tab"
            :aria-selected="activePanel === 'history'"
            @click="activePanel = 'history'"
            type="button"
          >
            历史记录
          </button>
          <button
            :class="{ active: activePanel === 'memory' }"
            role="tab"
            :aria-selected="activePanel === 'memory'"
            @click="activePanel = 'memory'"
            type="button"
          >
            记忆
          </button>
        </div>

        <section v-if="activePanel === 'history'" class="panel-content" aria-label="历史记录列表">
          <p v-if="historyItems.length === 0" class="empty-state">尚无历史记录。</p>
          <div v-else class="entry-list">
            <button
              v-for="item in historyItems"
              :key="item.id"
            class="history-entry"
            @click="recallHistory(item.result)"
            @keydown.space.prevent
            type="button"
          >
              <span>{{ item.expression }}</span>
              <strong>{{ formatDisplayValue(item.result) }}</strong>
            </button>
            <button
              class="clear-panel-button"
              @click="clearHistory"
              @keydown.space.prevent
              aria-label="清空历史记录"
              type="button"
            >
              <Trash2 :size="20" />
            </button>
          </div>
        </section>

        <section v-else class="panel-content" aria-label="记忆列表">
          <p v-if="!hasMemory" class="empty-state">内存中没有内容。</p>
          <div v-else class="entry-list">
            <button
              class="memory-entry"
              @click="setDisplayValue(memoryValue)"
              @keydown.space.prevent
              type="button"
            >
              <strong>{{ formattedMemory }}</strong>
            </button>
            <button
              class="clear-panel-button"
              @click="clearMemory"
              @keydown.space.prevent
              aria-label="清空记忆"
              type="button"
            >
              <Trash2 :size="20" />
            </button>
          </div>
        </section>
      </aside>
    </section>
  </main>
</template>
