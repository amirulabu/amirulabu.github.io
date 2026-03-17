import { useState } from "preact/hooks";

interface Props {
  name?: string;
}

const greetings = [
  "Hello",
  "Hola",
  "Bonjour",
  "Ciao",
  "Konnichiwa",
  "Assalamualaikum",
  "Namaste",
  "Hej",
];

export default function Greeting({ name = "World" }: Props) {
  const [index, setIndex] = useState(0);
  const greeting = greetings[index];

  const nextGreeting = () => {
    setIndex((index + 1) % greetings.length);
  };

  return (
    <div class="demo-card">
      <h3>Greeting (with Props)</h3>
      <p class="greeting-text">
        {greeting}, <strong>{name}</strong>!
      </p>
      <button onClick={nextGreeting}>Next language</button>
    </div>
  );
}
