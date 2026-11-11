export interface Tool {
  title: string;
  href: string;
  description: string;
  /** Inline SVG paths for the card icon. */
  icon: string;
}

export interface ToolCategory {
  label: string;
  tools: Tool[];
  more?: { label: string; href: string };
}

export const toolCategories: ToolCategory[] = [
  {
    label: "Drive",
    tools: [
      {
        title: "Car Loan: Price to Monthly",
        href: "/car/price/",
        description:
          "Enter a car price and calculate monthly hire purchase payments with adjustable interest, tenure, and down payment.",
        icon: `<path d="M5 17h2m10 0h2M2 9l2-4h16l2 4M2 9h20v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9z"></path><circle cx="7" cy="17" r="2"></circle><circle cx="17" cy="17" r="2"></circle>`,
      },
      {
        title: "Car Loan: Monthly to Price",
        href: "/car/monthly/",
        description:
          "Enter your monthly budget and find out what car price you can afford with Malaysian hire purchase rates.",
        icon: `<line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>`,
      },
      {
        title: "Used vs New Car",
        href: "/car/used-vs-new/",
        description:
          "Check if a used car discount beats its higher loan rate — with upkeep and resale in the maths.",
        icon: `<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>`,
      },
      {
        title: "EV Charging Cost & Time",
        href: "/ev-charging/cost/",
        description:
          "Estimate EV charging cost and time in Malaysia — compare providers, charger types, and see how long a charge takes.",
        icon: `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>`,
      },
      {
        title: "EV Cost Comparison",
        href: "/ev-comparison/",
        description:
          "Compare charging costs between two EVs — choose models, adjust efficiency, and pick a charging provider.",
        icon: `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>`,
      },
      {
        title: "Fuel Economy Converter",
        href: "/fuel-economy/",
        description:
          "Convert between km/L, L/100km, US MPG, and UK MPG — type in any unit and see all conversions instantly.",
        icon: `<line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>`,
      },
      {
        title: "Fuel Cost Comparison",
        href: "/fuel-comparison/",
        description:
          "Compare fuel costs between two cars with different efficiency — km/L or L/100km, with Malaysian fuel price presets.",
        icon: `<path d="M12 2v20M2 12h20M12 2a10 10 0 0 1 10 10M12 2a10 10 0 0 0-10 10"></path>`,
      },
      {
        title: "Home Loan Calculator",
        href: "/house-loan/price/",
        description:
          "Calculate monthly payments for Malaysian housing loans — reducing balance, tenure up to 35 years, with amortisation chart.",
        icon: `<path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>`,
      },
    ],
    more: {
      label: "Compare all car monthly payments",
      href: "/car/payment-table/",
    },
  },
  {
    label: "Calculate",
    tools: [
      {
        title: "Age Calculator",
        href: "/age-calculator/",
        description:
          "Calculate age from birth year — save and track multiple entries locally in your browser.",
        icon: `<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>`,
      },
      {
        title: "Date Calculator",
        href: "/date-calculator/",
        description:
          "Add or subtract days, months, and years from a date using the Temporal API.",
        icon: `<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><line x1="10" y1="14" x2="14" y2="14"></line><line x1="12" y1="12" x2="12" y2="16"></line>`,
      },
      {
        title: "Days Between Dates",
        href: "/days-between/",
        description:
          "Calculate the number of days, weeks, months, and years between two dates.",
        icon: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
      },
      {
        title: "Calculator",
        href: "/calculator/",
        description:
          "Basic calculator with arithmetic operations and calculation history saved in your browser.",
        icon: `<rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="8" y1="10" x2="10" y2="10"></line><line x1="12" y1="10" x2="14" y2="10"></line><line x1="16" y1="10" x2="16" y2="10"></line><line x1="8" y1="14" x2="10" y2="14"></line><line x1="12" y1="14" x2="14" y2="14"></line><line x1="8" y1="18" x2="10" y2="18"></line><line x1="12" y1="18" x2="16" y2="18"></line>`,
      },
      {
        title: "Budget Calculator",
        href: "/budget/",
        description:
          "Track your income and expenses to see how much is left over each month.",
        icon: `<line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>`,
      },
      {
        title: "Medicine Timer",
        href: "/medicine-timer/",
        description:
          "Calculate your daily medication schedule — evenly spaced doses based on frequency and start time.",
        icon: `<path d="M10.5 4.5v3m3-3v3m-6-3v3M5 10h14M5 14h2m4 0h2m4 0h2M5 18h14"></path><circle cx="7" cy="14" r="1" fill="currentColor"></circle><circle cx="17" cy="14" r="1" fill="currentColor"></circle><rect x="3" y="3" width="18" height="18" rx="2"></rect>`,
      },
    ],
  },
  {
    label: "Explore",
    tools: [
      {
        title: "Tmux Cheatsheet",
        href: "/tmux/",
        description:
          "Interactive quick reference for tmux shortcuts — search, filter by category, and find commands fast.",
        icon: `<rect x="2" y="3" width="20" height="18" rx="2"></rect><line x1="2" y1="9" x2="22" y2="9"></line><line x1="12" y1="9" x2="12" y2="21"></line>`,
      },
      {
        title: "Articles",
        href: "/articles/",
        description:
          "Saved articles and references for future recall — EV, tech, and more.",
        icon: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>`,
      },
      {
        title: "S3 Upload",
        href: "/s3-upload/",
        description: "Upload files directly to an S3 bucket from your browser.",
        icon: `<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22" x2="12" y2="12"></line>`,
      },
    ],
  },
];
