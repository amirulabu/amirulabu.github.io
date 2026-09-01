import { useState } from "preact/hooks";

const PRICES = Array.from({ length: 37 }, (_, index) => 20000 + index * 5000);
const YEARS = [5, 6, 7, 8, 9];
const DOWN_PAYMENT_OPTIONS = [0, 10, 20, 30];

const formatPrice = (price: number) =>
  price >= 100000 ? `RM${price / 1000}k` : `RM${price.toLocaleString("en-MY")}`;

const monthlyPayment = (
  price: number,
  years: number,
  rate: number,
  downPayment: number,
) => {
  const principal = price * (1 - downPayment / 100);
  return (principal * (1 + (rate / 100) * years)) / (years * 12);
};

export default function CarPaymentTable() {
  const [rate, setRate] = useState(2.5);
  const [minimumPrice, setMinimumPrice] = useState(20000);
  const [maximumPrice, setMaximumPrice] = useState(200000);
  const [downPayment, setDownPayment] = useState(10);
  const [activeCell, setActiveCell] = useState<{
    row: number;
    column: number;
  } | null>(null);

  const changeRate = (amount: number) => {
    setRate((current) =>
      Math.min(10, Math.max(0, Math.round((current + amount) * 10) / 10)),
    );
  };

  const visiblePrices = PRICES.filter(
    (price) => price >= minimumPrice && price <= maximumPrice,
  );

  return (
    <section class="payment-tool" aria-label="Car monthly payment table">
      <div class="toolbar">
        <div class="control-row">
          <div>
            <span class="eyebrow">Flat interest rate</span>
            <p class="rate-note">Adjust to match your bank's offer.</p>
          </div>
          <div class="stepper" role="group" aria-label="Interest rate controls">
            <button
              type="button"
              onClick={() => changeRate(-0.1)}
              aria-label="Decrease interest rate by 0.1 percent"
            >
              −
            </button>
            <output aria-live="polite">
              <strong>{rate.toFixed(1)}</strong>
              <span>%</span>
            </output>
            <button
              type="button"
              onClick={() => changeRate(0.1)}
              aria-label="Increase interest rate by 0.1 percent"
            >
              +
            </button>
          </div>
        </div>

        <div class="control-row price-control">
          <div>
            <label class="eyebrow" for="minimum-price">
              Car price range
            </label>
            <p class="rate-note">Choose which prices appear in the table.</p>
          </div>
          <div class="range-selects">
            <select
              id="minimum-price"
              value={minimumPrice}
              onChange={(event) => {
                const value = Number(event.currentTarget.value);
                setMinimumPrice(value);
                if (value > maximumPrice) setMaximumPrice(value);
                setActiveCell(null);
              }}
            >
              {PRICES.map((price) => (
                <option value={price}>{formatPrice(price)}</option>
              ))}
            </select>
            <span aria-hidden="true">to</span>
            <label class="sr-only" for="maximum-price">
              Maximum car price
            </label>
            <select
              id="maximum-price"
              value={maximumPrice}
              onChange={(event) => {
                const value = Number(event.currentTarget.value);
                setMaximumPrice(value);
                if (value < minimumPrice) setMinimumPrice(value);
                setActiveCell(null);
              }}
            >
              {PRICES.map((price) => (
                <option value={price}>{formatPrice(price)}</option>
              ))}
            </select>
          </div>
        </div>

        <div class="control-row price-control">
          <div>
            <label class="eyebrow" for="down-payment">
              Down payment
            </label>
            <p class="rate-note">Applied to every estimate in the table.</p>
          </div>
          <div class="single-select">
            <select
              id="down-payment"
              value={downPayment}
              onChange={(event) => {
                setDownPayment(Number(event.currentTarget.value));
                setActiveCell(null);
              }}
            >
              {DOWN_PAYMENT_OPTIONS.map((percentage) => (
                <option value={percentage}>{percentage}%</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div class="table-frame">
        <div class="table-scroll">
          <table onMouseLeave={() => setActiveCell(null)}>
            <caption class="sr-only">
              Estimated monthly car payments by car price and loan tenure
            </caption>
            <thead>
              <tr>
                <th class="corner" scope="col">
                  <span>Loan</span>
                  <span>Car price</span>
                </th>
                {visiblePrices.map((price, column) => (
                  <th
                    scope="col"
                    class={activeCell?.column === column ? "axis-active" : ""}
                  >
                    {formatPrice(price)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {YEARS.map((year, row) => (
                <tr>
                  <th
                    scope="row"
                    class={activeCell?.row === row ? "axis-active" : ""}
                  >
                    <strong>{year}</strong> years
                  </th>
                  {visiblePrices.map((price, column) => (
                    <td
                      tabIndex={0}
                      class={
                        activeCell?.row === row && activeCell?.column === column
                          ? "cell-active"
                          : ""
                      }
                      onMouseEnter={() => setActiveCell({ row, column })}
                      onFocus={() => setActiveCell({ row, column })}
                      onBlur={() => setActiveCell(null)}
                      aria-label={`${year} years, ${formatPrice(price)} car price: RM ${Math.round(monthlyPayment(price, year, rate, downPayment)).toLocaleString("en-MY")} per month`}
                    >
                      <span>RM</span>
                      {Math.round(
                        monthlyPayment(price, year, rate, downPayment),
                      ).toLocaleString("en-MY")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div class="legend">
        <span>
          <i></i> Monthly payment
        </span>
        <span>Assumes {downPayment}% down payment</span>
      </div>
      <p class="disclaimer">
        Estimates use the flat-rate hire purchase method. Bank fees, insurance,
        and other charges are not included.
      </p>
    </section>
  );
}
