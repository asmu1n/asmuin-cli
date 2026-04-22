# asmuin-cli

[![npm version](https://img.shields.io/npm/v/asmuin-cli)](https://www.npmjs.com/package/asmuin-cli)
[![Node.js](https://img.shields.io/node/v/asmuin-cli)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight CLI scaffolding tool that bootstraps projects from GitHub branch-based templates via interactive prompts — no Git installation required.

## Table of Contents

- [asmuin-cli](#asmuin-cli)
  - [Table of Contents](#table-of-contents)
  - [Why](#why)
  - [Requirements](#requirements)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Available templates](#available-templates)
  - [How It Works](#how-it-works)
  - [Configuration](#configuration)
    - [`template.json` schema](#templatejson-schema)
    - [Branch mapping](#branch-mapping)
  - [Development](#development)
  - [Contributing](#contributing)
  - [License](#license)

---

## Why

Every new project requires the same baseline setup: TypeScript, ESLint, Prettier, compiler configs, directory structure. Rather than repeating that work, this tool downloads the right template branch and drops it into a new folder — so you start coding instead of configuring.

## Requirements

- **Node.js** `>= 18`
- An internet connection (downloads template archives from GitHub)

> No Git installation needed. The tool fetches templates directly over HTTPS as `.tar.gz` archives using Node.js built-in modules.

## Installation

```bash
# Global install (recommended for repeated use)
npm install -g asmuin-cli

# Or run without installing
npx asmuin-cli
```

## Usage

```bash
asmuin-cli
```

The CLI will prompt you to:

1. Enter a **project name** (becomes the output folder)
2. Select a **project type** (frontend / backend / full-stack / plugin)
3. Select a **framework** and optionally a **database**

The chosen template is downloaded and extracted into `./<project-name>`.

```
    _        __  __       _         _____                    _       _
   / \   ___|  \/  |_   _(_)_ __   |_   _|__ _ __ ___  _ __ | | __ _| |_ ___
  / _ \ / __| |\/| | | | | | '_ \    | |/ _ \ '_ ` _ \| '_ \| |/ _` | __/ _ \
 / ___ \\__ \ |  | | |_| | | | | |   | |  __/ | | | | | |_) | | (_| | ||  __/
/_/   \_\___/_|  |_|\__,_|_|_| |_|   |_|\___|_| |_| |_| .__/|_|\__,_|\__\___|
                                                        |_|

欢迎！🎉🎉
请选择一个模版开始你的项目：

? 请输入项目名称： my-app
? 请选择项目类型： 后端项目
? 请选择使用的开发框架： Express
? 请选择使用的数据库： PostgreSQL
```

### Available templates

| Type | Framework | Database | Branch |
|---|---|---|---|
| Frontend | React + Axios + TailwindCSS | — | `react` |
| Backend | Express | MongoDB | `express-mongodb` |
| Backend | Express | PostgreSQL | `express-postgresql` |
| Full-Stack | Next.js | PostgreSQL | `next-postgresql` |
| Full-Stack | Monorepo (React + Express) | — | `monorepo` |
| Plugin | Chrome Extension | — | `chrome_plugin` |

## How It Works

1. Reads `template.json` to build the interactive prompt tree
2. Resolves the selected options to a **branch name**
3. Downloads `https://github.com/<owner>/<repo>/archive/refs/heads/<branch>.tar.gz` via Node.js built-in `https`
4. Decompresses with Node.js built-in `zlib` and parses the TAR format natively
5. Writes the template files into `./<project-name>`, then cleans up

No temporary ZIP files, no Git dependency, no shelling out.

## Configuration

### `template.json` schema

The prompt tree is driven entirely by `template.json`. Each node supports the following fields:

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | ✅ | Display label shown in the prompt |
| `value` | `string` | ✅ | Value passed to the branch resolver |
| `description` | `string` | — | Prompt message for this selection level |
| `color` | `string` | — | Terminal color for the label (`green`, `blue`, `cyan`, `magenta`, `red`, `yellow`…). Falls back to `green`. |
| `choices` | `array` | — | Sub-options for this node. Omit to mark as a leaf (final selection). |
| `next` | `object` | — | Nested selection level triggered after this choice is made. Key becomes part of the resolved branch name. |

**Multi-level value resolution:**  
For nested selections, the final branch value is assembled as `parentValue-childValue` (e.g. `express` + `mongodb` → `express-mongodb`). The top-level category key (`frontend`, `backend`, etc.) is not included.

**Example:**

```json
{
    "backend": {
        "key": "backend",
        "description": "请选择使用的开发框架：",
        "name": "后端项目",
        "value": "backend",
        "choices": [
            {
                "name": "Express",
                "value": "express",
                "color": "magenta",
                "next": {
                    "database": {
                        "description": "请选择使用的数据库：",
                        "key": "database",
                        "name": "数据库",
                        "choices": [
                            { "name": "MongoDB",    "value": "mongodb",    "color": "cyan"  },
                            { "name": "PostgreSQL", "value": "postgresql", "color": "green" }
                        ]
                    }
                }
            }
        ]
    }
}
```

### Branch mapping

`main.ts` contains a `BRANCH_MAP` that maps resolved template values to actual repository branch names. If a value has no explicit mapping, it is used as-is.

```ts
const BRANCH_MAP: Record<string, string> = {
    react: 'react',
    'express-mongodb': 'express-mongodb',
    'express-postgresql': 'express-postgresql',
    'next-postgresql': 'next-postgresql',
};
```

Update `REPO_URL` and `BRANCH_MAP` in `src/main.ts` to point at your own template repository.

## Development

```bash
# Install dependencies
bun install

# Run from source (no build step needed)
bun run dev

# Type check
bun run typecheck

# Build for distribution
bun run build
```

**Source layout:**

```
src/
├── main.ts      # Entry point — UI, prompt orchestration
├── choose.ts    # Interactive prompts (inquirer)
├── tarball.ts   # HTTPS download + gzip decompress + TAR extract
└── colors.ts    # Inline ANSI color helpers
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: describe your change"`
4. Push and open a Pull Request

Please open an [issue](https://github.com/AsMuin/asmuin-cli/issues) first for significant changes.

## License

[MIT](./LICENSE) © [AsMuin](https://github.com/AsMuin)
