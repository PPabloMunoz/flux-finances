# Flux Finances

![License](https://img.shields.io/badge/license-O'Saasy-blue.svg)

**Flux Finances** is a modern, high-performance personal finance management platform designed to give you total control over your financial data. Built with the cutting-edge TanStack Start framework, it brings type-safe routing, server functions, and lightning-fast performance to your personal accounting.

This project is born from the idea that your financial tools should be as fast as your bank's app but as flexible as a spreadsheet. Inspired by the vision of [Maybe Finances](https://github.com/maybe-finance/maybe). **Flux Finances** is a complete rewrite for the TypeScript ecosystem, prioritizing developer experience and user privacy.

## Table of Contents

- [Features](#-features)
- [Screenshots](#-screenshots)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

- **Total Net Worth**: A bird's-eye view of your entire financial life, aggregating assets and liabilities in real-time.
- **Transaction Intelligence**: Clean, categorized spending history with powerful search and tagging.
- **Visual Wealth Tracking**: Interactive charts that help you visualize your progress toward financial independence.
- **Type-Safe Architecture**: Built with end-to-end type safety using TanStack Router and Server Functions—no more brittle API layers.
- **Privacy First**: You own your data. Whether you use our cloud or host it yourself, your data remains encrypted and under your control.

## 📸 Screenshots

_[Screenshots will be added here once available]_

## 🚀 Quick Start

1. Clone and install:

   ```bash
   git clone https://github.com/pablomunoz/flux-finances.git
   cd flux-finances
   bun install
   ```

2. Setup environment:

   ```bash
   cp .env.example .env
   # Edit .env with your DATABASE_URL
   bunx drizzle-kit push
   ```

3. Run the app:
   ```bash
   bun dev
   ```

Visit http://localhost:3000 to get started.

## 🏠 Installation

### Using Docker (Recommended)

```bash
git clone https://github.com/pablomunoz/flux-finances.git
cd flux-finances
cp .env.example .env
# Configure .env
docker-compose up -d
```

### Manual Setup

Requires [Bun](https://bun.sh/) runtime.

```bash
git clone https://github.com/pablomunoz/flux-finances.git
cd flux-finances
bun install
# Set DATABASE_URL in .env
bunx drizzle-kit push
bun build
bun start
```

## 🔨 Development

Flux uses TanStack Start, combining React, Vite, and Nitro.

```bash
bun install
bunx drizzle-kit push
bun dev
```

App runs at http://localhost:3000.

## 🤝 Contributing

We love contributors! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

This project is licensed under the [O'Saasy License](https://osaasy.dev/).

You are free to use, study, modify, and self-host this software for personal or internal business use. However, you may not use this code to run a competing SaaS or hosted service. This license allows us to keep the source code open while protecting the sustainability of our hosted "Flux Cloud" service.

See [LICENSE](LICENSE) for details.
