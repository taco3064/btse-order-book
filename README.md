# BTSE Order Book

A real-time order book built with React, displaying buy and sell quotes dynamically.<br/><br/>
![Deploy Status](https://github.com/taco3064/btse-order-book/actions/workflows/deploy.yml/badge.svg)

## Getting Started

- Node.js Version: **`22.14.0`**
- Install dependencies after checkout: **`npm ci`**
- Start the development server: **`npm run dev`**

## Tech Stack

This project is built using:

- **Vite** ⚡️ - For fast development and optimized builds
- **React** ⚛️ - Component-based UI library
- **TypeScript** 🦕 - Ensuring type safety and better developer experience
- **Tailwind CSS** 🎨 - Utility-first CSS framework for styling

## Code Quality

This project uses **Husky** to enforce code quality at commit time.  
Before each commit, the following checks run automatically:

- **ESLint**: Ensures code follows best practices and coding standards.
- **TypeScript Compiler (`tsc`)**: Ensures type safety and prevents type errors.

If any check fails, the commit will be blocked until the issues are fixed.

## Guidelines

This project follows a structured approach for organizing files and components:<br/>
**[Folder Structure Guideline | Notion](https://lofty-find-5f1.notion.site/Folder-Structure-React-17006b644a208055b985eaa25886a051?pvs=4)**<br/>

To maintain a consistent commit history, this project uses **Commitizen**.  
All commits should follow a standardized format. Please use the following command to commit your changes: `npm run commit`

## Demo

Check out the live demo here:<br/>
**[BTSE Order Book | Github Page](https://taco3064.github.io/btse-order-book/)**<br/>

This project uses **GitHub Actions** for CI/CD.  
Whenever changes are pushed to the `main` branch, the following steps are executed automatically:

1. **Install Dependencies**: Runs `npm ci` to ensure a clean environment.
2. **Lint & Type Check**: Runs `lint` and `tsc` to maintain code quality.
3. **Build the Project**: Uses Vite to generate the production build.
4. **Deploy to GitHub Pages**: The built files are published to GitHub Pages for hosting.

This ensures that every deployment is automated and runs smoothly without manual intervention.
