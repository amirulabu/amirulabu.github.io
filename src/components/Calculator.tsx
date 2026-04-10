import { useState } from "preact/hooks";

const STORAGE_KEY = "calcHistory";

interface HistoryEntry {
  expression: string;
  result: string;
}

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveHistory(entries: HistoryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export default function Calculator() {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);
  const [newNumber, setNewNumber] = useState(true);
  const [operator, setOperator] = useState<string | null>(null);
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [justEvaluated, setJustEvaluated] = useState(false);

  const inputDigit = (digit: string) => {
    if (justEvaluated) {
      setDisplay(digit);
      setExpression(digit);
      setPrevValue(null);
      setOperator(null);
      setJustEvaluated(false);
      setNewNumber(false);
      return;
    }
    if (newNumber) {
      setDisplay(digit);
      setNewNumber(false);
    } else {
      setDisplay(display === "0" ? digit : display + digit);
    }
    setExpression((prev) => (prev === "0" || newNumber ? digit : prev + digit));
  };

  const inputDecimal = () => {
    if (justEvaluated) {
      setDisplay("0.");
      setExpression("0.");
      setPrevValue(null);
      setOperator(null);
      setJustEvaluated(false);
      setNewNumber(false);
      return;
    }
    if (newNumber) {
      setDisplay("0.");
      setExpression((prev) => prev + "0.");
      setNewNumber(false);
      return;
    }
    if (!display.includes(".")) {
      setDisplay(display + ".");
      setExpression((prev) => prev + ".");
    }
  };

  const inputOperator = (nextOp: string) => {
    const current = parseFloat(display);
    const opSymbol: Record<string, string> = {
      "+": "+",
      "-": "−",
      "*": "×",
      "/": "÷",
    };

    if (justEvaluated) {
      setPrevValue(current);
      setOperator(nextOp);
      setExpression(`${current} ${opSymbol[nextOp]}`);
      setNewNumber(true);
      setJustEvaluated(false);
      return;
    }

    if (prevValue !== null && operator && !newNumber) {
      const result = calculate(prevValue, current, operator);
      setDisplay(formatNumber(result));
      setPrevValue(result);
      setExpression(`${formatNumber(result)} ${opSymbol[nextOp]}`);
    } else {
      setPrevValue(current);
      setExpression(`${current} ${opSymbol[nextOp]}`);
    }
    setOperator(nextOp);
    setNewNumber(true);
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "*":
        return a * b;
      case "/":
        return b !== 0 ? a / b : NaN;
      default:
        return b;
    }
  };

  const formatNumber = (n: number): string => {
    if (isNaN(n)) return "Error";
    if (!isFinite(n)) return "Error";
    const str = n.toPrecision(10);
    return parseFloat(str).toString();
  };

  const evaluate = () => {
    if (prevValue === null || !operator) return;
    const current = parseFloat(display);
    const result = calculate(prevValue, current, operator);
    const opSymbol: Record<string, string> = {
      "+": "+",
      "-": "−",
      "*": "×",
      "/": "÷",
    };
    const exprString = `${formatNumber(prevValue)} ${opSymbol[operator]} ${formatNumber(current)}`;
    const resultString = formatNumber(result);

    const entry: HistoryEntry = {
      expression: exprString,
      result: resultString,
    };
    const updated = [entry, ...history].slice(0, 50);
    setHistory(updated);
    saveHistory(updated);

    setDisplay(resultString);
    setExpression(resultString);
    setPrevValue(null);
    setOperator(null);
    setNewNumber(true);
    setJustEvaluated(true);
  };

  const clear = () => {
    setDisplay("0");
    setExpression("");
    setPrevValue(null);
    setOperator(null);
    setNewNumber(true);
    setJustEvaluated(false);
  };

  const toggleSign = () => {
    if (display === "0" || display === "Error") return;
    const current = parseFloat(display);
    setDisplay(formatNumber(-current));
    setJustEvaluated(false);
  };

  const percentage = () => {
    const current = parseFloat(display);
    setDisplay(formatNumber(current / 100));
    setJustEvaluated(false);
  };

  const backspace = () => {
    if (justEvaluated || display === "Error") {
      clear();
      return;
    }
    if (
      display.length === 1 ||
      (display.length === 2 && display.startsWith("-"))
    ) {
      setDisplay("0");
      setNewNumber(true);
    } else {
      setDisplay(display.slice(0, -1));
    }
    setExpression((prev) => {
      if (prev.length <= 1) return "0";
      return prev.slice(0, -1);
    });
  };

  const clearHistory = () => {
    setHistory([]);
    saveHistory([]);
  };

  const useHistoryEntry = (entry: HistoryEntry) => {
    setDisplay(entry.result);
    setExpression(entry.result);
    setNewNumber(true);
    setJustEvaluated(true);
  };

  return (
    <div class="calc-wrapper">
      <div class="calc">
        <div class="calc-display">
          <div class="calc-expression">{expression || "\u00A0"}</div>
          <div class="calc-value">{display}</div>
        </div>

        <div class="calc-grid">
          <button type="button" class="calc-btn fn" onClick={clear}>
            AC
          </button>
          <button type="button" class="calc-btn fn" onClick={toggleSign}>
            +/−
          </button>
          <button type="button" class="calc-btn fn" onClick={percentage}>
            %
          </button>
          <button
            type="button"
            class={`calc-btn op ${operator === "/" && newNumber ? "active" : ""}`}
            onClick={() => inputOperator("/")}
          >
            ÷
          </button>

          <button
            type="button"
            class="calc-btn"
            onClick={() => inputDigit("7")}
          >
            7
          </button>
          <button
            type="button"
            class="calc-btn"
            onClick={() => inputDigit("8")}
          >
            8
          </button>
          <button
            type="button"
            class="calc-btn"
            onClick={() => inputDigit("9")}
          >
            9
          </button>
          <button
            type="button"
            class={`calc-btn op ${operator === "*" && newNumber ? "active" : ""}`}
            onClick={() => inputOperator("*")}
          >
            ×
          </button>

          <button
            type="button"
            class="calc-btn"
            onClick={() => inputDigit("4")}
          >
            4
          </button>
          <button
            type="button"
            class="calc-btn"
            onClick={() => inputDigit("5")}
          >
            5
          </button>
          <button
            type="button"
            class="calc-btn"
            onClick={() => inputDigit("6")}
          >
            6
          </button>
          <button
            type="button"
            class={`calc-btn op ${operator === "-" && newNumber ? "active" : ""}`}
            onClick={() => inputOperator("-")}
          >
            −
          </button>

          <button
            type="button"
            class="calc-btn"
            onClick={() => inputDigit("1")}
          >
            1
          </button>
          <button
            type="button"
            class="calc-btn"
            onClick={() => inputDigit("2")}
          >
            2
          </button>
          <button
            type="button"
            class="calc-btn"
            onClick={() => inputDigit("3")}
          >
            3
          </button>
          <button
            type="button"
            class={`calc-btn op ${operator === "+" && newNumber ? "active" : ""}`}
            onClick={() => inputOperator("+")}
          >
            +
          </button>

          <button
            type="button"
            class="calc-btn wide"
            onClick={() => inputDigit("0")}
          >
            0
          </button>
          <button type="button" class="calc-btn" onClick={inputDecimal}>
            .
          </button>
          <button type="button" class="calc-btn equals" onClick={evaluate}>
            =
          </button>
        </div>
      </div>

      {history.length > 0 && (
        <div class="calc-history">
          <div class="history-header">
            <h3 class="history-title">History</h3>
            <button type="button" class="clear-btn" onClick={clearHistory}>
              Clear All
            </button>
          </div>
          <div class="history-list">
            {history.map((entry, i) => (
              <button
                type="button"
                class="history-item"
                key={i}
                onClick={() => useHistoryEntry(entry)}
              >
                <span class="history-expr">{entry.expression}</span>
                <span class="history-result">= {entry.result}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
