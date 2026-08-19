import { useEffect, useRef, useState } from "preact/hooks";

const PRESET_MINUTES = [1, 5, 10, 15, 25];
const DEFAULT_DURATION_SECONDS = 5 * 60;
const EXTRA_MINUTE_SECONDS = 60;
const MAX_MINUTES = 999;

type TimerPhase = "idle" | "running" | "paused" | "finished";

function clampMinutes(value: number): number {
  return Math.min(MAX_MINUTES, Math.max(0, value));
}

function clampSeconds(value: number): number {
  return Math.min(59, Math.max(0, value));
}

function sanitizeNumericInput(value: string, max: number): string {
  const digitsOnly = value.replace(/\D/g, "");

  if (!digitsOnly) {
    return "";
  }

  return String(Math.min(max, Number(digitsOnly)));
}

function formatDurationLabel(totalSeconds: number): string {
  const seconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const parts: string[] = [];

  if (minutes > 0) {
    parts.push(`${minutes} minute${minutes === 1 ? "" : "s"}`);
  }

  if (remainingSeconds > 0 || parts.length === 0) {
    parts.push(
      `${remainingSeconds} second${remainingSeconds === 1 ? "" : "s"}`,
    );
  }

  return parts.join(" ");
}

function formatDisplay(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function splitDuration(totalSeconds: number): {
  minutes: string;
  seconds: string;
} {
  const safeSeconds = Math.max(0, totalSeconds);

  return {
    minutes: String(Math.floor(safeSeconds / 60)),
    seconds: String(safeSeconds % 60),
  };
}

export default function Timer() {
  const [selectedDurationMs, setSelectedDurationMs] = useState(
    DEFAULT_DURATION_SECONDS * 1000,
  );
  const [remainingMs, setRemainingMs] = useState(
    DEFAULT_DURATION_SECONDS * 1000,
  );
  const [phase, setPhase] = useState<TimerPhase>("idle");
  const [minutesInput, setMinutesInput] = useState("5");
  const [secondsInput, setSecondsInput] = useState("0");
  const [liveStatus, setLiveStatus] = useState("Timer set for 5 minutes.");

  const endTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const selectedDurationSeconds = Math.floor(selectedDurationMs / 1000);
  const isRunning = phase === "running";
  const isFinished = phase === "finished";
  const currentDisplay = formatDisplay(remainingMs);

  const statusText =
    phase === "running"
      ? "Running"
      : phase === "paused"
        ? "Paused"
        : phase === "finished"
          ? "Finished"
          : "Ready";

  function clearTicking() {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function syncInputs(totalSeconds: number) {
    const next = splitDuration(totalSeconds);
    setMinutesInput(next.minutes);
    setSecondsInput(next.seconds);
  }

  function applySelectedDuration(totalSeconds: number) {
    const safeSeconds = Math.max(0, totalSeconds);
    const nextMs = safeSeconds * 1000;

    clearTicking();
    endTimeRef.current = null;
    setSelectedDurationMs(nextMs);
    setRemainingMs(nextMs);
    setPhase("idle");
    syncInputs(safeSeconds);
    setLiveStatus(`Timer set for ${formatDurationLabel(safeSeconds)}.`);
  }

  function readRemainingFromClock() {
    if (endTimeRef.current === null) {
      return;
    }

    const nextRemaining = Math.max(0, endTimeRef.current - Date.now());
    setRemainingMs(nextRemaining);

    if (nextRemaining <= 0) {
      clearTicking();
      endTimeRef.current = null;
      setPhase("finished");
      setLiveStatus("Time's up.");
    }
  }

  useEffect(() => {
    if (!isRunning) {
      clearTicking();
      return;
    }

    const startTicking = () => {
      clearTicking();

      if (document.visibilityState !== "visible") {
        return;
      }

      readRemainingFromClock();
      intervalRef.current = window.setInterval(readRemainingFromClock, 250);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        startTicking();
      } else {
        clearTicking();
      }
    };

    startTicking();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearTicking();
    };
  }, [isRunning]);

  useEffect(() => {
    return () => {
      clearTicking();
    };
  }, []);

  function handlePreset(minutes: number) {
    applySelectedDuration(minutes * 60);
  }

  function updateCustomDuration(
    nextMinutesText: string,
    nextSecondsText: string,
    announce = false,
  ) {
    const nextMinutes = clampMinutes(Number(nextMinutesText || "0"));
    const nextSeconds = clampSeconds(Number(nextSecondsText || "0"));
    const nextTotalSeconds = nextMinutes * 60 + nextSeconds;

    clearTicking();
    endTimeRef.current = null;
    setSelectedDurationMs(nextTotalSeconds * 1000);
    setRemainingMs(nextTotalSeconds * 1000);
    setPhase("idle");

    if (announce) {
      setLiveStatus(`Timer set for ${formatDurationLabel(nextTotalSeconds)}.`);
    }
  }

  function handleMinutesInput(value: string) {
    const nextValue = sanitizeNumericInput(value, MAX_MINUTES);
    setMinutesInput(nextValue);
    updateCustomDuration(nextValue, secondsInput);
  }

  function handleSecondsInput(value: string) {
    const nextValue = sanitizeNumericInput(value, 59);
    setSecondsInput(nextValue);
    updateCustomDuration(minutesInput, nextValue);
  }

  function handleInputBlur() {
    const nextMinutes = minutesInput || "0";
    const nextSeconds = secondsInput || "0";

    setMinutesInput(nextMinutes);
    setSecondsInput(nextSeconds);
    updateCustomDuration(nextMinutes, nextSeconds, true);
  }

  function handleStartPause() {
    if (isRunning) {
      const nextRemaining =
        endTimeRef.current === null
          ? remainingMs
          : Math.max(0, endTimeRef.current - Date.now());

      clearTicking();
      endTimeRef.current = null;
      setRemainingMs(nextRemaining);
      setPhase(nextRemaining <= 0 ? "finished" : "paused");
      setLiveStatus(
        nextRemaining <= 0
          ? "Time's up."
          : `Timer paused with ${formatDurationLabel(Math.ceil(nextRemaining / 1000))} remaining.`,
      );
      return;
    }

    if (remainingMs <= 0) {
      return;
    }

    endTimeRef.current = Date.now() + remainingMs;
    setPhase("running");
    setLiveStatus(
      `Timer started with ${formatDurationLabel(Math.ceil(remainingMs / 1000))} remaining.`,
    );
  }

  function handleReset() {
    clearTicking();
    endTimeRef.current = null;
    setRemainingMs(selectedDurationMs);
    setPhase("idle");
    setLiveStatus(
      `Timer reset to ${formatDurationLabel(selectedDurationSeconds)}.`,
    );
  }

  function handleAddMinute() {
    const nextRemainingMs = remainingMs + EXTRA_MINUTE_SECONDS * 1000;

    if (isRunning && endTimeRef.current !== null) {
      endTimeRef.current += EXTRA_MINUTE_SECONDS * 1000;
    }

    setRemainingMs(nextRemainingMs);

    if (isFinished) {
      setPhase("idle");
    }

    setLiveStatus(
      `Added 1 minute. ${formatDurationLabel(Math.ceil(nextRemainingMs / 1000))} remaining.`,
    );
  }

  const primaryLabel = isRunning
    ? "Pause"
    : phase === "paused"
      ? "Resume"
      : "Start";
  const primaryAriaLabel = isRunning
    ? "Pause timer"
    : phase === "paused"
      ? "Resume timer"
      : "Start timer";
  const isStartDisabled = !isRunning && remainingMs <= 0;

  return (
    <div class="timer-shell">
      <div class={`timer-card ${isFinished ? "is-finished" : ""}`}>
        <section class="timer-display" aria-labelledby="timer-heading">
          <div class="timer-display-top">
            <p id="timer-heading" class="timer-kicker">
              Countdown timer
            </p>
            <span class={`timer-badge timer-badge-${phase}`}>{statusText}</span>
          </div>

          <p class="timer-time" role="timer" aria-live="off">
            {currentDisplay}
          </p>

          <p class="timer-helper">
            {isFinished
              ? "Time's up. Reset to start again or add a minute."
              : `Reset always returns to ${formatDurationLabel(selectedDurationSeconds)}.`}
          </p>
        </section>

        <section class="timer-section" aria-labelledby="timer-presets-heading">
          <div class="timer-section-head">
            <h2 id="timer-presets-heading">Quick presets</h2>
          </div>
          <div
            class="timer-presets"
            role="group"
            aria-label="Quick preset durations"
          >
            {PRESET_MINUTES.map((minutes) => {
              const presetSeconds = minutes * 60;
              const isActive = presetSeconds === selectedDurationSeconds;

              return (
                <button
                  key={minutes}
                  type="button"
                  class={`timer-chip ${isActive ? "active" : ""}`}
                  aria-pressed={isActive}
                  onClick={() => handlePreset(minutes)}
                >
                  {minutes} min
                </button>
              );
            })}
          </div>
        </section>

        <section class="timer-section" aria-labelledby="timer-custom-heading">
          <div class="timer-section-head">
            <h2 id="timer-custom-heading">Custom duration</h2>
          </div>
          <div class="timer-input-grid">
            <label class="timer-field">
              <span>Minutes</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={minutesInput}
                aria-label="Minutes"
                onInput={(e) =>
                  handleMinutesInput((e.target as HTMLInputElement).value)
                }
                onBlur={handleInputBlur}
              />
            </label>
            <label class="timer-field">
              <span>Seconds</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={secondsInput}
                aria-label="Seconds"
                onInput={(e) =>
                  handleSecondsInput((e.target as HTMLInputElement).value)
                }
                onBlur={handleInputBlur}
              />
            </label>
          </div>
        </section>

        <section class="timer-section" aria-labelledby="timer-actions-heading">
          <h2 id="timer-actions-heading" class="sr-only">
            Timer actions
          </h2>
          <div class="timer-actions">
            <button
              type="button"
              class="timer-button timer-button-primary timer-button-wide"
              aria-label={primaryAriaLabel}
              disabled={isStartDisabled}
              onClick={handleStartPause}
            >
              {primaryLabel}
            </button>
            <div class="timer-action-row">
              <button
                type="button"
                class="timer-button timer-button-secondary"
                aria-label="Reset timer to selected duration"
                onClick={handleReset}
              >
                Reset
              </button>
              <button
                type="button"
                class="timer-button timer-button-secondary"
                aria-label="Add one minute"
                onClick={handleAddMinute}
              >
                +1 minute
              </button>
            </div>
          </div>
        </section>

        <p class="timer-footnote">
          Pick a preset or set minutes and seconds, then start when ready.
        </p>

        <div class="sr-only" aria-live="polite" aria-atomic="true">
          {liveStatus}
        </div>
      </div>
    </div>
  );
}
