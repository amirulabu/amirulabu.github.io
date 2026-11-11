export interface ToolTab {
  key: string;
  label: string;
  href: string;
}

export const carLoanTabs: ToolTab[] = [
  { key: "price", label: "Price → Monthly", href: "/car/price/" },
  { key: "monthly", label: "Monthly → Price", href: "/car/monthly/" },
];

export const houseLoanTabs: ToolTab[] = [
  { key: "price", label: "Price → Monthly", href: "/house-loan/price/" },
  { key: "monthly", label: "Monthly → Price", href: "/house-loan/monthly/" },
];

export const evChargingTabs: ToolTab[] = [
  { key: "cost", label: "Cost", href: "/ev-charging/cost/" },
  { key: "time", label: "Time", href: "/ev-charging/time/" },
];
