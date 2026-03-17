import { useState } from "preact/hooks";

export default function TodoList() {
  const [items, setItems] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const addItem = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setItems([...items, trimmed]);
    setInput("");
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <div class="demo-card">
      <h3>Todo List</h3>
      <div class="input-group">
        <input
          type="text"
          value={input}
          onInput={(e) => setInput((e.target as HTMLInputElement).value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          placeholder="Add a todo..."
        />
        <button onClick={addItem}>Add</button>
      </div>
      {items.length === 0 ? (
        <p class="empty-state">No todos yet. Add one above!</p>
      ) : (
        <ul>
          {items.map((item, i) => (
            <li key={i}>
              <span>{item}</span>
              <button class="remove-btn" onClick={() => removeItem(i)}>
                x
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
