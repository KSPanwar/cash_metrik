# CashMertik

**CashMertik** is a privacy-first, client-side cash flow tracking application for personal finance management. It lets you securely import bank statements, analyze transactions, and visualize spending patterns—all without sending your financial data anywhere.  Every calculation, parse, and visualization happens entirely in your browser.

![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6? logo=typescript)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Table of Contents

- [Features](#features)
- [Why CashMertik?](#why-cashmetrik)
- [How It Works](#how-it-works)
- [Quick Start](#quick-start)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development](#development)
  - [Build for Production](#build-for-production)
- [Supported Bank Formats](#supported-bank-formats)
- [Architecture](#architecture)
- [Usage Guide](#usage-guide)
- [Tech Stack](#tech-stack)
- [Data & Privacy](#data--privacy)
- [FAQ](#faq)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

---

## Features

✅ **Secure Bank Statement Import**
- Upload Excel files from PNB, HDFC, or SBI (India).
- Parse transactions instantly in your browser.
- No data uploaded to any server.

✅ **Manual Transaction Entry**
- Add cash expenses and income on the fly.
- Calendar-based entry with date selection.
- Full transaction remarks and categorization.

✅ **Interactive Visualizations**
- Monthly and yearly cash flow charts.
- Category-wise spending analysis (Income, Expense, Savings).
- Beautiful, responsive charts powered by Recharts.

✅ **Calendar & Table Views**
- Calendar widget for date-based transaction browsing.
- Detailed transaction tables with sorting and filtering.
- Quick overview of daily cash movements.

✅ **Complete Data Privacy**
- 100% client-side processing—zero server involvement.
- No analytics, trackers, or ads.
- Your data stays on your device. 

✅ **Lightweight & Fast**
- No backend dependencies.
- Instant load times.
- Works offline (everything is local).

---

## Why CashMertik?

Most personal finance apps require you to upload sensitive banking data to their servers. CashMertik is different: 

| Feature | CashMertik | Typical Finance Apps |
|---------|-----------|---------------------|
| Data Privacy | Your device only | Uploaded to servers |
| Sign-up Required | ❌ No | ✅ Yes |
| Trackers/Analytics | ❌ None | ✅ Typically present |
| Works Offline | ✅ Yes | ❌ No |
| Open Source | ✅ Yes | ❌ Usually closed |
| Cost | Free | Often freemium or paid |

---

## How It Works

### 1. Import Bank Statements
- Download your statement as an Excel file from your bank (PNB, HDFC, SBI).
- Upload the file using the import dialog. 
- All parsing happens instantly in your browser.

### 2. Add Manual Entries
- Click any date on the calendar to add a transaction.
- Record cash expenses, income, or missed bank transactions.
- Assign categories and add notes.

### 3. Analyze & Visualize
- View transactions in calendar, table, or category views.
- Interactive charts show monthly trends and category breakdowns.
- Export or print reports for your records.

### 4. Stay in Control
- Your data is stored locally (IndexedDB/localStorage).
- Clear it anytime—the app cannot recover deleted data.
- No cloud sync, no accounts, no surprises.

---

## Quick Start

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js 18+ and npm (for local development)

### Installation

Clone the repository: 

```bash
git clone https://github.com/KSPanwar/cash_metrik.git
cd cash_metrik
npm install
```

### Development

Start the Vite development server:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal).

Hot module reload is enabled—edit and save to see changes instantly. 

### Build for Production

Build the optimized bundle:

```bash
npm run build
```

The `dist/` folder will contain your production-ready static files.

### Preview Production Build

```bash
npm run preview
```

---

## Supported Bank Formats

Currently, CashMertik supports Excel statement imports from: 

- **PNB** (Punjab National Bank)
- **HDFC** (Housing Development Finance Corporation)
- **SBI** (State Bank of India)

Each bank's Excel format is handled via the xlsx parser.  If you use a different bank or format, you can [open an issue](https://github.com/KSPanwar/cash_metrik/issues) to request support.

---

## Architecture

```
cash_metrik/
├── App.tsx                 # Main application component
├── types.ts                # TypeScript type definitions
├── components/             # Reusable React components
├── utils/                  # Helper functions (parsing, calculations, storage)
├── index.html              # HTML entry point
├── index.tsx               # React DOM render
├── metadata.json           # App metadata
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```

**Key Design Principles:**
- All data processing is synchronous and client-side. 
- No external API calls for core functionality.
- Storage uses browser APIs (localStorage/IndexedDB).
- UI is built with React and styled with Tailwind CSS.

---

## Usage Guide

### Importing a Bank Statement

1. Click the **Import** button. 
2. Select your bank (PNB, HDFC, or SBI).
3. Upload the corresponding Excel file.
4. Transactions are parsed and displayed instantly.

### Adding a Manual Transaction

1. Click on any date in the **Calendar View**.
2. Fill in the transaction details:
   - **Amount**: The transaction value.
   - **Type**: Income or Expense (or Savings).
   - **Description**:  Brief notes or remarks.
   - **Category**:  Classify the transaction.
3. Click **Save**. 

### Viewing Analytics

- **Monthly Chart**: See income vs. expenses by month.
- **Category Breakdown**: Pie or bar chart of spending by category.
- **Table View**: Detailed list of all transactions.
- **Calendar View**: Transaction summary by date.

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| **TypeScript 5.8** | Type-safe JavaScript |
| **React 19.2** | UI framework |
| **Vite 6.2** | Build tool & dev server |
| **Recharts 3.6** | Data visualization |
| **Tailwind CSS** | Utility-first CSS styling |
| **Lucide React 0.562** | Icon library |
| **xlsx 0.18** | Excel file parsing |

---

## Data & Privacy

### How Your Data Is Stored

- All transactions and settings are stored in your browser using **IndexedDB** or **localStorage**.
- No data is sent to any remote server.
- No cookies or tracking scripts are used. 

### What Happens If I Clear My Browser Data? 

- All CashMertik data will be deleted.
- The app has no way to recover it (by design).
- To preserve data, export it as JSON or CSV before clearing (if export feature is available).

### Is This App Secure?

- CashMertik is client-side only, so it's as secure as your device and browser.
- Always use HTTPS when accessing the app over a network.
- No passwords or authentication are stored—your data is entirely yours.

---

## FAQ

**Q: Can I sync my data across devices?**  
A:  Not currently.  Data is stored locally per device.  You can export and re-import if needed.

**Q: Will you add support for my bank? **  
A: Yes! [Open an issue](https://github.com/KSPanwar/cash_metrik/issues) with your bank's statement format, and we'll work on it.

**Q: Can I use this on mobile? **  
A: CashMertik is responsive and works on phones, but the full experience is better on desktop/tablet.

**Q: How do I report a bug?**  
A:  [Open an issue on GitHub](https://github.com/KSPanwar/cash_metrik/issues) with a clear description and steps to reproduce.

**Q: Can I contribute? **  
A:  Absolutely! See [Contributing](#contributing) below.

---

## Contributing

Contributions are welcome! Whether it's bug fixes, new features, or better documentation, your help is appreciated.

### Getting Started

1. Fork the repository. 
2. Create a feature branch: `git checkout -b feat/your-feature`.
3. Make your changes and commit: `git commit -am 'Add new feature'`.
4. Push to your fork: `git push origin feat/your-feature`.
5. Open a Pull Request with a clear description.

### Development Guidelines

- Write TypeScript for type safety.
- Follow the existing code style.
- Test your changes locally before submitting a PR. 
- Keep commits small and focused.

### Areas to Contribute

- [ ] Additional bank format support
- [ ] Export/import features (JSON, CSV)
- [ ] Multi-currency support
- [ ] Budget tracking
- [ ] Advanced filtering and search
- [ ] Dark mode
- [ ] Documentation improvements

---

## License

This project is licensed under the **MIT License**.  See the [LICENSE](LICENSE) file for details.

---

## Support

Have a question or need help? 

- 💬 [Open an issue](https://github.com/KSPanwar/cash_metrik/issues)
- 📧 Reach out to the maintainer: [@KSPanwar](https://github.com/KSPanwar)

---

## Acknowledgments

- [React](https://react.dev)
- [Vite](https://vitejs.dev)
- [Recharts](https://recharts.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)
- [xlsx](https://sheetjs.com)

---

**Made with ❤️ by the CashMertik community.  Keep your financial data private.**
