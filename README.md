# Rolo

[![Build and Check](https://github.com/rolo-kit/rolo/actions/workflows/ci.yml/badge.svg)](https://github.com/rolo-kit/rolo/actions/workflows/ci.yml)
[![Prettier Lint](https://github.com/rolo-kit/rolo/actions/workflows/prettier.yml/badge.svg)](https://github.com/rolo-kit/rolo/actions/workflows/prettier.yml)

Rolo is a modern CLI tool designed to streamline your web development workflow. It provides fast project initialization, hot module reloading (HMR), and quick build capabilities for efficient development.

## Features

- **Project Initialization (`init`)**: Instantly scaffold new projects with best practices and ready-to-go templates.
- **Hot Module Reloading (HMR)**: Experience lightning-fast updates in your development environment without full page reloads.
- **Quick Builds**: Build your projects rapidly with optimized configurations for both development and production.
- **Template Support**: Choose from React and Vanilla JS templates to kickstart your project.
- **Easy CLI Commands**: Simple and intuitive commands for all major actions.
- **Easy Configuration**: Manage extension settings and permissions easily with `rolo config` for robust, safe, and interactive project configuration.

## Getting Started

1. **Install Rolo** (if published to npm):

   ```sh
   npm install -g rolo-cli
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
   rolo build
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

5. `rolo config []` Command

The `rolo config` command lets you safely update, merge, append, or remove keys in your `rolo.config.json` for your extension project. It supports both interactive and non-interactive usage, robust value parsing, and safe merging for arrays and objects.

**Usage:**

```sh
rolo config [options]
```

**Options:**

- `-k, --key <key>`: Config key to set or remove
- `-v, --value <value>`: Value to set for the key (supports JSON, arrays, or strings)
- `-a, --add`: Append/merge value to existing array/object (deduplicates arrays)
- `-r, --remove`: Remove a key from `rolo.config.json`

**Examples:**

- Set a string value:
  ```sh
  rolo config -k name -v "My Extension"
  ```
- Set an array (e.g., permissions):
  ```sh
  rolo config -k permissions -v '["storage","tabs"]'
  ```
- Append to an array (deduplicates):
  ```sh
  rolo config -k permissions -v '["notifications"]' --add
  ```
- Merge an object:
  ```sh
  rolo config -k options -v '{"foo":1}' --add
  ```
- Remove a key:
  ```sh
  rolo config -r -k permissions
  ```

**Best Practices:**

- Use JSON for complex values (arrays/objects).
- Use `--add` to merge/append instead of replacing arrays/objects.
- All config changes are safely merged and written to `rolo.config.json`.
- **You can also manually edit `rolo.config.json` in your project root if you prefer direct control.**

You can now use the `rolo` command globally for local development and testing.

---

## CLI Commands

- `rolo init` – Scaffold a new project
- `rolo dev` – Start development server with HMR
- `rolo build` – Build the project for production
- `rolo config [options]` – Update and manage your extension's configuration (see below)

## Templates

- **React**: Modern React setup with Vite
- **Vanilla JS**: Lightweight vanilla JavaScript template

## Build Status

[![Build and Check](https://github.com/rolo-kit/rolo/actions/workflows/ci.yml/badge.svg)](https://github.com/rolo-kit/rolo/actions/workflows/ci.yml)
[![Prettier Lint](https://github.com/rolo-kit/rolo/actions/workflows/prettier.yml/badge.svg)](https://github.com/rolo-kit/rolo/actions/workflows/prettier.yml)

---

Feel free to contribute or open issues to help improve Rolo!
