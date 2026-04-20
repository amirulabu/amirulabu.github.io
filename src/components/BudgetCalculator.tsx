import { useState, useEffect } from "preact/hooks";

interface LineItem {
  id: number;
  label: string;
  amount: number;
}

const STORAGE_KEY = "budgetCalcData";

let nextId = 1;
function genId() {
  return nextId++;
}

function withIds(items: Omit<LineItem, "id">[]): LineItem[] {
  return items.map((item) => ({ ...item, id: genId() }));
}

const DEFAULT_INCOME: Omit<LineItem, "id">[] = [
  { label: "Salary", amount: 5000 },
];

const DEFAULT_EXPENSES: Omit<LineItem, "id">[] = [
  { label: "Rent", amount: 1500 },
  { label: "Utilities (Electric/Water)", amount: 200 },
  { label: "Food & Groceries", amount: 800 },
  { label: "Transportation", amount: 500 },
  { label: "Phone & Internet", amount: 150 },
  { label: "Entertainment", amount: 200 },
];

function loadSaved(): { incomes: LineItem[]; expenses: LineItem[] } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return {
        incomes: withIds(data.incomes),
        expenses: withIds(data.expenses),
      };
    }
  } catch {}
  return null;
}

function formatRM(n: number): string {
  return `RM ${n.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function ItemRow({
  item,
  onUpdate,
  onRemove,
}: {
  item: LineItem;
  onUpdate: (item: LineItem) => void;
  onRemove: () => void;
}) {
  return (
    <div class="budget-row">
      <input
        type="text"
        class="budget-label-input"
        name={`label-${item.id}`}
        value={item.label}
        placeholder="Label"
        onInput={(e) =>
          onUpdate({ ...item, label: (e.target as HTMLInputElement).value })
        }
      />
      <input
        type="number"
        class="budget-amount-input"
        name={`amount-${item.id}`}
        value={item.amount}
        min={0}
        step="any"
        onInput={(e) =>
          onUpdate({
            ...item,
            amount: parseFloat((e.target as HTMLInputElement).value) || 0,
          })
        }
      />
      <button
        type="button"
        class="remove-btn"
        onClick={onRemove}
        title="Remove"
      >
        &times;
      </button>
    </div>
  );
}

export default function BudgetCalculator() {
  const [incomes, setIncomes] = useState<LineItem[]>(() =>
    withIds(DEFAULT_INCOME),
  );
  const [expenses, setExpenses] = useState<LineItem[]>(() =>
    withIds(DEFAULT_EXPENSES),
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = loadSaved();
    if (saved) {
      setIncomes(saved.incomes);
      setExpenses(saved.expenses);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          incomes: incomes.map(({ label, amount }) => ({ label, amount })),
          expenses: expenses.map(({ label, amount }) => ({ label, amount })),
        }),
      );
    }
  }, [incomes, expenses, loaded]);

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = totalIncome - totalExpenses;

  const updateIncome = (index: number, item: LineItem) => {
    const updated = [...incomes];
    updated[index] = item;
    setIncomes(updated);
  };

  const updateExpense = (index: number, item: LineItem) => {
    const updated = [...expenses];
    updated[index] = item;
    setExpenses(updated);
  };

  const removeIncome = (index: number) => {
    setIncomes(incomes.filter((_, i) => i !== index));
  };

  const removeExpense = (index: number) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  const addIncome = () => {
    setIncomes([...incomes, { id: genId(), label: "", amount: 0 }]);
  };

  const addExpense = () => {
    setExpenses([...expenses, { id: genId(), label: "", amount: 0 }]);
  };

  const handleReset = () => {
    setIncomes(withIds(DEFAULT_INCOME));
    setExpenses(withIds(DEFAULT_EXPENSES));
  };

  return (
    <div>
      <div class="budget-section">
        <div class="section-header">
          <h2 class="section-title income-title">Money In</h2>
          <span class="section-total">{formatRM(totalIncome)}</span>
        </div>
        {incomes.map((item, i) => (
          <ItemRow
            key={item.id}
            item={item}
            onUpdate={(updated) => updateIncome(i, updated)}
            onRemove={() => removeIncome(i)}
          />
        ))}
        <button type="button" class="add-btn" onClick={addIncome}>
          + Add Income
        </button>
      </div>

      <div class="budget-section">
        <div class="section-header">
          <h2 class="section-title expense-title">Money Out</h2>
          <span class="section-total">{formatRM(totalExpenses)}</span>
        </div>
        {expenses.map((item, i) => (
          <ItemRow
            key={item.id}
            item={item}
            onUpdate={(updated) => updateExpense(i, updated)}
            onRemove={() => removeExpense(i)}
          />
        ))}
        <button type="button" class="add-btn" onClick={addExpense}>
          + Add Expense
        </button>
      </div>

      <div class="budget-summary">
        <div class="summary-row">
          <span>Total Income</span>
          <span class="summary-value income-color">
            {formatRM(totalIncome)}
          </span>
        </div>
        <div class="summary-row">
          <span>Total Expenses</span>
          <span class="summary-value expense-color">
            {formatRM(totalExpenses)}
          </span>
        </div>
        <div class="summary-divider" />
        <div class="summary-row remaining">
          <span>Remaining</span>
          <span
            class={`summary-value ${remaining >= 0 ? "income-color" : "expense-color"}`}
          >
            {formatRM(remaining)}
          </span>
        </div>
      </div>

      <button type="button" class="reset-btn" onClick={handleReset}>
        Reset to Defaults
      </button>
    </div>
  );
}
