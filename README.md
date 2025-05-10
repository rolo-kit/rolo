# Rolo

[![Prettier Lint](https://github.com/rolo-kit/rolo/actions/workflows/prettier.yml/badge.svg)](https://github.com/rolo-kit/rolo/actions/workflows/prettier.yml)

Rolo is a modern CLI tool designed to streamline your web development workflow. It provides fast project initialization, hot module reloading (HMR), and quick build capabilities for efficient development.

## Features

- **Project Initialization (`init`)**: Instantly scaffold new projects with best practices and ready-to-go templates.
- **Hot Module Reloading (HMR)**: Experience lightning-fast updates in your development environment without full page reloads.
- **Quick Builds**: Build your projects rapidly with optimized configurations for both development and production.
- **Template Support**: Choose from React and Vanilla JS templates to kickstart your project.
- **Easy CLI Commands**: Simple and intuitive commands for all major actions.

## Getting Started

1. **Install Rolo** (if published to npm):

   ```sh
   npm install -g rolo
   ```

2. **Initialize a New Project**:

   ```sh
   rolo init
   ```

3. **Start Development Server with HMR**:

   ```sh
   rolo dev
   ```

4. **Build Your Project**:
   ```sh
   rolo build (work in progress)
   ```

## Running Rolo Locally (Development)

To run and test the Rolo CLI locally, use Node.js 20. Follow these steps:

1. **Install dependencies** (from the project root):

   ```sh
   cd packages/cli
   npm install
   ```

2. **Build the CLI package**:

   ```sh
   cd packages/cli
   npm run build --workspace=cli
   ```

3. **Link the CLI globally** (so you can use `rolo` from anywhere):

   ```sh
   cd packages/cli
   npm link
   ```

4. **Verify Node.js version** (should be 20):
   ```sh
   node -v
   # v20.x.x
   ```

You can now use the `rolo` command globally for local development and testing.

---

## CLI Commands

- `rolo init` – Scaffold a new project
- `rolo dev` – Start development server with HMR
- `rolo build` – Build the project for production

## Templates

- **React**: Modern React setup with Vite (works, but HMR is work in progress)
- **Vanilla JS**: Lightweight vanilla JavaScript template

## Build Status

[![Prettier Lint](https://github.com/rolo-kit/rolo/actions/workflows/prettier.yml/badge.svg)](https://github.com/rolo-kit/rolo/actions/workflows/prettier.yml)

---

Feel free to contribute or open issues to help improve Rolo!
