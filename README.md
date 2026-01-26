# 🌊 Flux Finances

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Runtime: Bun](https://img.shields.io/badge/Runtime-Bun-black?logo=bun)](https://bun.sh/)
[![Framework: TanStack Start](https://img.shields.io/badge/Framework-TanStack_Start-FF4154?logo=react)](https://tanstack.com/start)
[![Built with: TypeScript](https://img.shields.io/badge/Built_with-TypeScript-3178C6?logo=typescript)](https://www.typescriptlang.org/)

**Flux Finances** is a modern, high-performance personal finance management platform designed to give you total control over your financial data. Built with the cutting-edge **TanStack Start** framework, it brings type-safe routing, server functions, and lightning-fast performance to your personal accounting.

> **Note:** Flux is currently in active development. We are building the most flexible and private finance tool in the TypeScript ecosystem.

---

## ✨ Features

- **Total Net Worth**: A bird's-eye view of your entire financial life, aggregating assets and liabilities in real-time.
- **Transaction Intelligence**: Clean, categorized spending history with powerful search and tagging.
- **Visual Wealth Tracking**: Interactive charts powered by Recharts to help you visualize your progress toward financial independence.
- **Type-Safe Architecture**: Built with end-to-end type safety using TanStack Router and Server Functions—no more brittle API layers.
- **Privacy First**: You own your data. Whether you use our cloud or host it yourself, your data remains local-first and under your control.

## 🛠 The Stack

Flux is built on the "bleeding edge" of the React ecosystem for maximum developer speed and user performance:

- **Runtime:** [Bun](https://bun.sh/)
- **Framework:** [TanStack Start](https://tanstack.com/start) (React + Vite + Nitro)
- **Database:** [Drizzle ORM](https://orm.drizzle.team/) + [SQLite/LibSQL](https://turso.tech/)
- **Authentication:** [Better-Auth](https://better-auth.com/)
- **Styling:** [Tailwind CSS v4.0](https://tailwindcss.com/)
- **Components:** [Base UI](https://base-ui.com/) (Unstyled, accessible primitives)
- **Icons:** [Hugeicons](https://hugeicons.com/)

---

## 🚀 Quick Start

### 1. Prerequisites
You need [Bun](https://bun.sh/) installed on your machine.

### 2. Installation
```bash
git clone https://github.com/pablomunoz/flux-finances.git
cd flux-finances
bun install
```

### 3. Environment Setup
```bash
cp .env.example .env
# Edit .env and set your BETTER_AUTH_SECRET
# You can generate one with: openssl rand -base64 32
```

### 4. Database Initialization
```bash
bun db:push
```

### 5. Start Developing
```bash
bun dev
```
Visit [http://localhost:3000](http://localhost:3000) to get started.

---

## 🏠 Self-Hosting (Docker)

Flux is designed to be easily self-hosted using Docker.

```bash
git clone https://github.com/pablomunoz/flux-finances.git
cd flux-finances
cp .env.example .env
# Configure .env with your production values
docker-compose up -d
```

---

## 🏗 Architecture

Flux follows a modern full-stack directory structure:

- `src/routes/`: File-based routing with TanStack Router.
- `src/components/`: Shared UI components (Base UI + Tailwind).
- `src/db/`: Database schema and migrations using Drizzle.
- `src/lib/`: Shared utilities and third-party initializations (Auth, API clients).

---

## 🤝 Contributing

We love contributors! Whether you're fixing a bug or suggesting a new feature, please check out our [Contributing Guidelines](CONTRIBUTING.md) and our [Code of Conduct](CODE_OF_CONDUCT.md).

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🛡 Security

If you discover a security vulnerability, please see our [Security Policy](SECURITY.md) for reporting instructions.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/pablomunoz">Pablo Muñoz</a>
</p>
