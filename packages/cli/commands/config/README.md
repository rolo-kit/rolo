# rolo config

Manage and inspect your Rolo extension configuration.

## Usage

```sh
rolo config [options]
```

## Options

- `-k, --key <key>`: Config key to set or remove (e.g. `name`, `description`, `permissions`)
- `-v, --value <value>`: Value to set for the key (can be a string, number, boolean, or JSON array/object)
- `-a, --add`: Add a value to an existing array/object property (merges arrays/objects)
- `-r, --remove`: Remove a key from `rolo.config.json`

## Description

- Allows you to view, add, update, or remove keys in your `rolo.config.json` file.
- Supports merging values into arrays/objects with `--add`.
- Prompts for missing keys/values if not provided via CLI.
- Useful for advanced configuration and troubleshooting.
- You can also manually edit or add configuration options directly in the `rolo.config.json` file for advanced or bulk changes.

## Examples

**Set a config value:**

```sh
rolo config --key name --value "My Extension"
```

**Set a JSON array value:**

```sh
rolo config --key permissions --value '["storage","tabs"]'
```

**Add a value to an existing array property:**

```sh
rolo config --key permissions --value 'cookies' --add
```

**Remove a config key:**

```sh
rolo config --key permissions --remove
```

If you omit `--key` or `--value`, the CLI will prompt you interactively.
