import { useState } from "preact/hooks";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div class="demo-card">
      <h3>Counter</h3>
      <p>
        Current count: <strong>{count}</strong>
      </p>
      <div class="button-group">
        <button onClick={() => setCount(count - 1)}>-</button>
        <button onClick={() => setCount(0)}>Reset</button>
        <button onClick={() => setCount(count + 1)}>+</button>
      </div>
    </div>
  );
}
