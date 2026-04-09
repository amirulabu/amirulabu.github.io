import { useState } from "preact/hooks";

function todayString(): string {
  return Temporal.Now.plainDateISO().toString();
}

export default function DaysBetween() {
  const [startDate, setStartDate] = useState(todayString());
  const [endDate, setEndDate] = useState(todayString());

  let totalDays: number | null = null;
  let breakdown: { years: number; months: number; days: number } | null = null;
  let error: string | null = null;

  try {
    const start = Temporal.PlainDate.from(startDate);
    const end = Temporal.PlainDate.from(endDate);

    const diffDays = start.until(end, { largestUnit: "day" });
    totalDays = diffDays.days;

    const diffFull = start.until(end, { largestUnit: "year" });
    breakdown = {
      years: diffFull.years,
      months: diffFull.months,
      days: diffFull.days,
    };
  } catch {
    error = "Invalid date";
  }

  const isNegative = totalDays !== null && totalDays < 0;
  const absDays = totalDays !== null ? Math.abs(totalDays) : 0;
  const absBreakdown = breakdown
    ? {
        years: Math.abs(breakdown.years),
        months: Math.abs(breakdown.months),
        days: Math.abs(breakdown.days),
      }
    : null;

  return (
    <div>
      <div class="calc">
        <div class="date-row">
          <div class="field">
            <label>
              <strong>Start Date</strong>
            </label>
            <input
              type="date"
              value={startDate}
              onInput={(e) =>
                setStartDate((e.target as HTMLInputElement).value)
              }
            />
          </div>
          <div class="field">
            <label>
              <strong>End Date</strong>
            </label>
            <input
              type="date"
              value={endDate}
              onInput={(e) => setEndDate((e.target as HTMLInputElement).value)}
            />
          </div>
        </div>

        {error ? (
          <div class="results">
            <div class="result-row monthly">
              <span>Difference</span>
              <span class="value">—</span>
            </div>
          </div>
        ) : (
          <div class="results">
            <div class="result-row monthly">
              <span>Total Days</span>
              <span class="value">
                {isNegative && absDays > 0 ? "-" : ""}
                {absDays} {absDays === 1 ? "day" : "days"}
              </span>
            </div>
            {absBreakdown &&
              (absBreakdown.years > 0 || absBreakdown.months > 0) && (
                <div class="result-row">
                  <span>Breakdown</span>
                  <span>
                    {isNegative && absDays > 0 ? "-" : ""}
                    {[
                      absBreakdown.years > 0 &&
                        `${absBreakdown.years} ${absBreakdown.years === 1 ? "year" : "years"}`,
                      absBreakdown.months > 0 &&
                        `${absBreakdown.months} ${absBreakdown.months === 1 ? "month" : "months"}`,
                      absBreakdown.days > 0 &&
                        `${absBreakdown.days} ${absBreakdown.days === 1 ? "day" : "days"}`,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              )}
            <div class="result-row">
              <span>Weeks</span>
              <span>
                {isNegative && absDays > 0 ? "-" : ""}
                {Math.floor(absDays / 7)} weeks, {absDays % 7} days
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
