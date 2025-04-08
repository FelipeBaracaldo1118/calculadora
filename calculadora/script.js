// ==============================
// 🔢 Operaciones matemáticas puras
// ==============================

const binaryOperations = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => b === 0 ? 'Error' : a / b,
  power: (a, b) => Math.pow(a, b)
}

const unaryOperations = {
  sqrt: val => val < 0 ? 'Error' : Math.sqrt(val),
  factorial: val => {
    if (val < 0 || !Number.isInteger(val)) return 'Error'
    return Array.from({ length: val }, (_, i) => i + 1)
      .reduce((acc, n) => acc * n, 1)
  }
}

const operationSymbols = {
  add: '+',
  subtract: '−',
  multiply: '×',
  divide: '÷',
  power: '^',
  sqrt: '√',
  factorial: '!'
}

// ==============================
// 🧠 Lógica de la calculadora
// ==============================

const calculator = {
  currentInput: '',
  previousInput: '',
  operation: null,
  history: [],

  appendNumber: num => {
    if (num === '.' && calculator.currentInput.includes('.')) return
    calculator.currentInput += num
    calculator.updateDisplay()
  },

  prepareOperation: op => {
    if (calculator.currentInput === '') return
    if (calculator.previousInput !== '') calculator.calculate()
    calculator.operation = op
    calculator.previousInput = calculator.currentInput
    calculator.currentInput = ''
    calculator.updateDisplay()
  },

  calculate: () => {
    const a = parseFloat(calculator.previousInput)
    const b = parseFloat(calculator.currentInput)
    const op = calculator.operation

    if (isNaN(a) || isNaN(b) || !binaryOperations[op]) return

    let result = binaryOperations[op](a, b)
    if (!isFinite(result)) result = 'Error'

    calculator.handleResult(result, `${a} ${operationSymbols[op]} ${b}`)
  },

  applyUnaryOperation: type => {
    const val = parseFloat(calculator.currentInput)
    const opFn = unaryOperations[type]
    if (isNaN(val) || !opFn) return

    const result = opFn(val)
    const expr = type === 'sqrt'
      ? `√(${val})`
      : `${val}${operationSymbols[type]}`

    calculator.handleResult(result, expr)
  },

  handleResult: (result, expression) => {
    if (result === 'Error' || !isFinite(result)) {
      calculator.currentInput = 'Error'
    } else {
      const displayResult = formatResult(result)
      calculator.currentInput = displayResult
      calculator.addToHistory(`${expression} = ${displayResult}`)
    }
    calculator.operation = null
    calculator.previousInput = ''
    calculator.updateDisplay()
  },

  clearAll: () => {
    calculator.currentInput = ''
    calculator.previousInput = ''
    calculator.operation = null
    calculator.updateDisplay()
  },

  updateDisplay: () => {
    currentDisplay.textContent = calculator.currentInput || '0'
    previousDisplay.textContent = calculator.previousInput && calculator.operation
      ? `${calculator.previousInput} ${operationSymbols[calculator.operation]}`
      : ''
  },

  addToHistory: entry => {
    calculator.history.unshift(entry)
    if (calculator.history.length > 10) calculator.history.pop()
    calculator.renderHistory()
  },

  renderHistory: () => {
    historyContainer.innerHTML = calculator.history
      .map(h => `<div class="history-entry">${h}</div>`)
      .join('')
  }
}

// ==============================
// 📟 Utilidad de formateo
// ==============================

const formatResult = value => {
  if (typeof value !== 'number') return value
  return value.toLocaleString('fullwide', {
    useGrouping: false,
    maximumFractionDigits: 20
  })
}

// ==============================
// 🖱️ Manejo de eventos del DOM
// ==============================

const currentDisplay = document.getElementById('current-display')
const previousDisplay = document.getElementById('previous-display')
const historyContainer = document.getElementById('history')

document.querySelectorAll('button').forEach(btn =>
  btn.addEventListener('click', () => {
    const number = btn.dataset.number
    const action = btn.dataset.action

    if (number !== undefined) {
      calculator.appendNumber(number)
    } else if (action) {
      const binaryOps = ['add', 'subtract', 'multiply', 'divide', 'power']
      const unaryOps = ['sqrt', 'factorial']

      if (action === 'clear') calculator.clearAll()
      else if (action === 'equals') calculator.calculate()
      else if (binaryOps.includes(action)) calculator.prepareOperation(action)
      else if (unaryOps.includes(action)) calculator.applyUnaryOperation(action)
    }
  })
)
