# 10x-cards

A web application for efficient flashcard creation and learning powered by AI.
Try it out on [Cloudflare deploy](10x-cards-9ei.pages.dev).

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description

10x-cards is a web application designed to make creating and learning with educational flashcards more efficient. The application's core feature is the use of artificial intelligence to automatically generate high-quality flashcards from input text, significantly speeding up the preparation of study materials.

### Problem Statement

Manual creation of high-quality educational flashcards is time-consuming, which discourages many potential users from utilizing the effective spaced repetition learning method. The typical process of creating flashcards involves analyzing source material, identifying key information, transforming it into a question-answer format, and manually entering each flashcard into a system.

10x-cards solves this problem by automating the flashcard creation process using AI, allowing users to:

- Quickly generate flashcard sets from any text
- Focus on learning rather than preparing materials
- Maintain high-quality flashcards without additional effort

## Tech Stack

### Frontend

- [Astro 5](https://astro.build/) - For fast, efficient pages with minimal JavaScript
- [React 19](https://react.dev/) - For interactive components
- [TypeScript 5](https://www.typescriptlang.org/) - For type safety
- [Tailwind 4](https://tailwindcss.com/) - For styling
- [Shadcn/ui](https://ui.shadcn.com/) - For accessible React components

### Backend

- [Supabase](https://supabase.com/) - For PostgreSQL database, authentication, and BaaS

### AI

- [Openrouter.ai](https://openrouter.ai/) - For access to various AI models (OpenAI, Anthropic, Google, etc.)

### Testing

- [Vitest](https://vitest.dev/) - Main framework for unit and integration tests
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) - For testing React components
- [Testing Library for Astro](https://testing-library.com/) - For testing Astro components
- [Playwright](https://playwright.dev/) - For end-to-end testing
- [Storybook](https://storybook.js.org/) - For visual component testing and documentation
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) - For performance testing

### CI/CD & Hosting

- GitHub Actions - For CI/CD pipelines
- DigitalOcean - For hosting via Docker

## Getting Started Locally

### Prerequisites

- Node.js 22.14.0 (we recommend using [nvm](https://github.com/nvm-sh/nvm) for node version management)
- Git

### Installation

1. Clone the repository

```bash
git clone https://github.com/jakubdrewniak/10x-cards.git
cd 10x-cards
```

2. Install the correct Node.js version

```bash
nvm use 22
```

3. Install dependencies

```bash
npm install
```

4. Start the development server

```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:4321`

## Available Scripts

In the project directory, you can run:

- `npm run dev` - Starts the development server
- `npm run build` - Builds the app for production
- `npm run preview` - Previews the built app
- `npm run astro` - Runs Astro CLI commands
- `npm run lint` - Runs ESLint to check code
- `npm run lint:fix` - Runs ESLint and fixes issues
- `npm run format` - Formats code using Prettier

## Project Scope

### Core Features

- **AI-powered flashcard generation**: Generate flashcards from text with AI
- **Manual flashcard creation**: Create flashcards manually with a simple interface
- **Flashcard management**: View, edit, and delete flashcards
- **User account system**: Register, login, and manage user profiles
- **Learning with flashcards**: Integrated spaced repetition algorithm

### Out of Scope for MVP

- Custom advanced spaced repetition algorithm
- Data import/export functionality
- Social features (sharing flashcards, public sets)
- External integrations with other educational platforms
- Mobile apps (web-only initially)
- Offline mode
- Organizing flashcards into categories/sets

## Project Status

The project is currently in early development (MVP phase). We are focusing on implementing the core features described in the project scope.

## License

TBD - To be determined.

---
