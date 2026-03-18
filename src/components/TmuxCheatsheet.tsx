import { useState, useMemo } from "preact/hooks";

interface Shortcut {
  keys: string;
  description: string;
}

interface Section {
  title: string;
  shortcuts: Shortcut[];
}

const sections: Section[] = [
  {
    title: "Sessions",
    shortcuts: [
      { keys: "tmux new -s name", description: "Create a new named session" },
      { keys: "tmux ls", description: "List all sessions" },
      { keys: "tmux attach -t name", description: "Attach to a session" },
      { keys: "tmux kill-session -t name", description: "Kill a session" },
      { keys: "Prefix + d", description: "Detach from current session" },
      { keys: "Prefix + s", description: "List and switch sessions" },
      { keys: "Prefix + $", description: "Rename current session" },
      { keys: "Prefix + (", description: "Switch to previous session" },
      { keys: "Prefix + )", description: "Switch to next session" },
    ],
  },
  {
    title: "Windows",
    shortcuts: [
      { keys: "Prefix + c", description: "Create a new window" },
      { keys: "Prefix + ,", description: "Rename current window" },
      { keys: "Prefix + w", description: "List all windows" },
      { keys: "Prefix + n", description: "Go to next window" },
      { keys: "Prefix + p", description: "Go to previous window" },
      { keys: "Prefix + 0-9", description: "Go to window by number" },
      { keys: "Prefix + &", description: "Kill current window" },
      { keys: "Prefix + l", description: "Toggle last active window" },
    ],
  },
  {
    title: "Panes",
    shortcuts: [
      { keys: "Prefix + %", description: "Split pane vertically" },
      { keys: 'Prefix + "', description: "Split pane horizontally" },
      { keys: "Prefix + arrow", description: "Move to pane in direction" },
      { keys: "Prefix + o", description: "Cycle through panes" },
      { keys: "Prefix + x", description: "Kill current pane" },
      { keys: "Prefix + z", description: "Toggle pane zoom (fullscreen)" },
      { keys: "Prefix + {", description: "Swap pane left" },
      { keys: "Prefix + }", description: "Swap pane right" },
      { keys: "Prefix + q", description: "Show pane numbers" },
      { keys: "Prefix + Space", description: "Toggle between pane layouts" },
      { keys: "Prefix + !", description: "Convert pane to window" },
    ],
  },
  {
    title: "Pane Resizing",
    shortcuts: [
      { keys: "Prefix + Ctrl+arrow", description: "Resize pane in direction" },
      { keys: "Prefix + Alt+arrow", description: "Resize pane (5 cells)" },
      {
        keys: ":resize-pane -D 10",
        description: "Resize pane down by 10 cells",
      },
      {
        keys: ":resize-pane -U 10",
        description: "Resize pane up by 10 cells",
      },
      {
        keys: ":resize-pane -L 10",
        description: "Resize pane left by 10 cells",
      },
      {
        keys: ":resize-pane -R 10",
        description: "Resize pane right by 10 cells",
      },
    ],
  },
  {
    title: "Copy Mode",
    shortcuts: [
      { keys: "Prefix + [", description: "Enter copy mode" },
      { keys: "q", description: "Quit copy mode" },
      { keys: "Space", description: "Start selection (in copy mode)" },
      { keys: "Enter", description: "Copy selection (in copy mode)" },
      { keys: "Prefix + ]", description: "Paste buffer" },
      { keys: "/ or ?", description: "Search forward / backward" },
      { keys: "n / N", description: "Next / previous search match" },
      { keys: "g / G", description: "Go to top / bottom" },
    ],
  },
  {
    title: "Misc",
    shortcuts: [
      { keys: "Prefix + :", description: "Enter command mode" },
      { keys: "Prefix + t", description: "Show clock" },
      { keys: "Prefix + ?", description: "List all keybindings" },
      { keys: "Prefix + r", description: "Reload tmux config (if bound)" },
      {
        keys: "tmux source ~/.tmux.conf",
        description: "Reload config from shell",
      },
      {
        keys: ":setw synchronize-panes",
        description: "Toggle sync input across panes",
      },
    ],
  },
];

function KeyBadge({ text }: { text: string }) {
  const parts = text.split(/(\+)/);
  return (
    <span class="keys">
      {parts.map((part, i) =>
        part === "+" ? (
          <span key={i} class="key-plus">
            +
          </span>
        ) : (
          <kbd key={i}>{part.trim()}</kbd>
        ),
      )}
    </span>
  );
}

function isCommand(keys: string) {
  return keys.startsWith("tmux ") || keys.startsWith(":");
}

export default function TmuxCheatsheet() {
  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return sections
      .map((section) => ({
        ...section,
        shortcuts: section.shortcuts.filter(
          (s) =>
            s.keys.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q),
        ),
      }))
      .filter((section) => section.shortcuts.length > 0);
  }, [search]);

  const displayed = activeSection
    ? filtered.filter((s) => s.title === activeSection)
    : filtered;

  const totalShown = displayed.reduce((acc, s) => acc + s.shortcuts.length, 0);

  return (
    <div class="cheatsheet">
      <input
        type="text"
        class="search-input"
        placeholder="Search shortcuts... (e.g. split, window, copy)"
        value={search}
        onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
        autofocus
      />

      <div class="section-tabs">
        <button
          class={`section-tab ${activeSection === null ? "active" : ""}`}
          onClick={() => setActiveSection(null)}
        >
          All
        </button>
        {sections.map((section) => {
          const matchCount =
            filtered.find((s) => s.title === section.title)?.shortcuts.length ??
            0;
          return (
            <button
              key={section.title}
              class={`section-tab ${activeSection === section.title ? "active" : ""} ${matchCount === 0 ? "dimmed" : ""}`}
              onClick={() =>
                setActiveSection(
                  activeSection === section.title ? null : section.title,
                )
              }
            >
              {section.title}
              {search && <span class="tab-count">{matchCount}</span>}
            </button>
          );
        })}
      </div>

      {search && (
        <p class="result-count">
          {totalShown} shortcut{totalShown !== 1 ? "s" : ""} found
        </p>
      )}

      {displayed.map((section) => (
        <div key={section.title} class="section">
          <h2 class="section-title">{section.title}</h2>
          <div class="shortcut-list">
            {section.shortcuts.map((shortcut) => (
              <div key={shortcut.keys} class="shortcut-row">
                <div class="shortcut-keys">
                  {isCommand(shortcut.keys) ? (
                    <code class="command">{shortcut.keys}</code>
                  ) : (
                    <KeyBadge text={shortcut.keys} />
                  )}
                </div>
                <div class="shortcut-desc">{shortcut.description}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {displayed.length === 0 && (
        <p class="no-results">No shortcuts match your search.</p>
      )}

      <p class="prefix-note">
        <strong>Prefix</strong> is <kbd>Ctrl</kbd>
        <span class="key-plus">+</span>
        <kbd>b</kbd> by default
      </p>
    </div>
  );
}
