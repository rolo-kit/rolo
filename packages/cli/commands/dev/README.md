# rolo dev

Start a development server for your Rolo extension.

## Usage

```sh
rolo dev
```

## Description

- Starts a dev server for your extension project.
- Requires `rolo.config.json` in the project root.
- Detects the template type (`react` or `vanilla`) and starts the appropriate dev process:
  - **React**: Uses Vite and sets up live reload via websocket.
  - **Vanilla**: Uses esbuild and chokidar for file watching, with live reload.
- Watches `src/` and `public/` for changes and rebuilds automatically.

## Example Output

- Logs build and reload events, e.g. `Detected change in ...`, `Build complete`.
- On error: Logs error and exits.

## Notes
- Output is placed in the `dist/` directory.
- Live reload is enabled for fast development.
