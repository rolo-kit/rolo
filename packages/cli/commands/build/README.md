# rolo build

Build your extension for production (Web Store ready).

## Usage

```sh
rolo build
```

## Description

- Builds your extension project for production.
- Requires `rolo.config.json` in the project root.
- Detects the template type (`react` or `vanilla`) and builds accordingly:
  - **React**: Uses Vite to build and minify the project.
  - **Vanilla**: Uses esbuild to bundle and minify, copying assets from `public` to `dist`.

## Example Output

- On success: `Build complete` or similar log messages.
- On error: Logs error and exits.

## Notes

- Output is placed in the `dist/` directory.
- Make sure your `rolo.config.json` is correctly configured.
