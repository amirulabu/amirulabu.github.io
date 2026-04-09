import { useState, useEffect } from "preact/hooks";

const STORAGE_KEY = "ageCalcSaved";

interface SavedEntry {
  name: string;
  birthYear: number;
}

function loadSaved(): SavedEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveToDisk(entries: SavedEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export default function AgeCalculator() {
  const currentYear = new Date().getFullYear();
  const [birthYear, setBirthYear] = useState(2000);
  const [saveName, setSaveName] = useState("");
  const [savedEntries, setSavedEntries] = useState<SavedEntry[]>([]);

  useEffect(() => {
    setSavedEntries(loadSaved());
  }, []);

  const age = currentYear - birthYear;

  const handleSave = () => {
    const trimmed = saveName.trim();
    if (!trimmed || isNaN(birthYear)) return;
    const entry: SavedEntry = { name: trimmed, birthYear };
    const updated = [...savedEntries, entry];
    setSavedEntries(updated);
    saveToDisk(updated);
    setSaveName("");
  };

  const handleDelete = (index: number) => {
    const updated = savedEntries.filter((_, i) => i !== index);
    setSavedEntries(updated);
    saveToDisk(updated);
  };

  const handleClearAll = () => {
    setSavedEntries([]);
    saveToDisk([]);
  };

  return (
    <div>
      <div class="calc">
        <div class="field">
          <label>
            <strong>Birth Year</strong>
          </label>
          <input
            type="number"
            min={1900}
            max={currentYear}
            value={birthYear}
            onInput={(e) =>
              setBirthYear(parseInt((e.target as HTMLInputElement).value) || 0)
            }
          />
        </div>

        <div class="results">
          <div class="result-row monthly">
            <span>Age in {currentYear}</span>
            <span class="value">
              {birthYear >= 1900 && birthYear <= currentYear
                ? `${age} years old`
                : "—"}
            </span>
          </div>
        </div>

        <div class="save-section">
          <h3 class="save-title">Save Result</h3>
          <div class="save-row">
            <input
              type="text"
              class="name-input"
              placeholder="Enter a name..."
              value={saveName}
              onInput={(e) => setSaveName((e.target as HTMLInputElement).value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
              }}
            />
            <button
              class="save-btn"
              onClick={handleSave}
              disabled={
                !saveName.trim() || birthYear < 1900 || birthYear > currentYear
              }
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {savedEntries.length > 0 && (
        <div class="saved-list">
          <div class="saved-header">
            <h3 class="saved-title">Saved Results</h3>
            <button class="clear-btn" onClick={handleClearAll}>
              Clear All
            </button>
          </div>
          <div class="saved-table">
            <div class="saved-table-header">
              <span>Name</span>
              <span>Birth Year</span>
              <span>Age</span>
              <span></span>
            </div>
            {savedEntries.map((entry, i) => (
              <div class="saved-row" key={i}>
                <span class="saved-name">{entry.name}</span>
                <span class="saved-year">{entry.birthYear}</span>
                <span class="saved-age">{currentYear - entry.birthYear}</span>
                <button
                  class="delete-btn"
                  onClick={() => handleDelete(i)}
                  title="Remove"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
