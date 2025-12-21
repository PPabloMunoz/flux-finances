# Flux finances

**Flux Finances** is a modern, high-performance personal finance management platform designed to give you total control over your financial data. Built with the cutting-edge TanStack Start framework, it brings type-safe routing, server functions, and lightning-fast performance to your personal accounting.

This project is born from the idea that your financial tools should be as fast as your bank's app but as flexible as a spreadsheet. Inspired by the vision of [Maybe Finances](https://github.com/maybe-finance/maybe). **Flux Finances** is a complete rewrite for the TypeScript ecosystem, prioritizing developer experience and user privacy.

## ✨ Features

- **Total Net Worth**: A bird's-eye view of your entire financial life, aggregating assets and liabilities in real-time.
- **Transaction Intelligence**: Clean, categorized spending history with powerful search and tagging.
- **Visual Wealth Tracking**: Interactive charts that help you visualize your progress toward financial independence.
- **Type-Safe Architecture**: Built with end-to-end type safety using TanStack Router and Server Functions—no more brittle API layers.
- **Privacy First**: You own your data. Whether you use our cloud or host it yourself, your data remains encrypted and under your control.

## 🏠 How to Self-Host

**Flux Finances** is designed to be easily self-hosted using Docker or a standard Node.js environment.

### Using Docker (Recommended)

1. Clone the repo:

```bash
  git clone https://github.com/pablomunoz/flux-finances.git
```

2. Configure environment: Create a `.env` file based on `.env.example`.
3. Launch:

```bash
  docker-compose up -d
```

### Manual Setup

This project requires [Bun](https://bun.sh/) as the runtime.\
You can use other package managers but there is no guarantee they will work as expected.

1. Clone the repo:

```bash
  git clone https://github.com/pablomunoz/flux-finances.git
```

2. Set `DATABASE_URL` in your `.env`.
3. Run migrations:

```bash
  bunx drizzle-kit push
```

4. Build and start the server:

```bash
  bun build
  bun start
```

## 🔨 How to develop locally

Flux uses TanStack Start, which combines the best of React, Vite, and Nitro.

1. Clone the repo:

```bash
  git clone https://github.com/pablomunoz/flux-finances.git
```

2. Install dependencies:

```bash
  bun install
```

3. Set up your database and run migrations:

```bash
  bunx drizzle-kit push
```

4. Start the development server:

```bash
  bun dev
```

The app will be live at http://localhost:3000.

## 🤝 Contributing

We love contributors! Whether you are fixing a bug or suggesting a feature, please check out our [CONTRIBUTING.md](https://github.com/ppablomunoz/flux-finances) for guidelines on how to get started.

## 📄 License

This project is licensed under the [O'Saasy License](https://osaasy.dev/).

What does this mean?
You are free to use, study, modify, and self-host this software for personal or internal business use. However, you may not use this code to run a competing SaaS or hosted service. This license allows us to keep the source code open and available for the community while protecting the sustainability of our hosted "Flux Cloud" service.

O'Saasy License details can be found in the [LICENSE](https://github.com/ppablomunoz/flux-finances)
