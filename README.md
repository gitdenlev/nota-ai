# Nota AI

**Nota AI** is a command-line tool for developers that automatically generates code comments using locally hosted [Ollama](https://ollama.com) models.  
All processing happens on your machine: no APIs, no cloud data transfer.  

## Features
- Generates Google-style DocStrings and (optionally) inline comments for:
  - complex logic,
  - algorithms,
  - state changes,
  - error handling,
  - configurations.
- Automatic language detection:  
  **Python, JavaScript, TypeScript, C++, Java, PHP, Go, C#**
- Handles large files (1000–5000+ lines) by splitting them into manageable chunks.
- Configurable via `.notarc.json` (model, commenting style, etc.).

## Installation
Install Nota AI globally using **npm**:
```bash
npm install -g nota-ai
```

### Prerequisites
1. Install [Ollama](https://ollama.com).
2. Pull and run a compatible model, for example:
   ```bash
   ollama pull llama3
   ollama run llama3
   ```
3. Ensure Ollama is running locally (default: `http://localhost:11434`).

## Usage

Generate comments for a code file:
```bash
nota comment <input_file> [--config <config_file>]
```

- `<input_file>` — path to the source code file (e.g., `src/index.py`)  
- `--config` — optional path to config file (default: `.vororc.json`)  

### Example:
```bash
nota comment src/main.py
```

Show help:
```bash
nota --help
```

## Configuration
Create a `.vororc.json` file in the root of your project to customize behavior:

```json
{
  "nota": {
    "ai": {
      "model": "llama3",
      "temperature": 0.5
    },
    "commenting": {
      "includeLineComments": false,
      "includeDocstrings": true,
      "overwriteExisting": false
    }
  }
}
```

### Options
- `nota.ai.model` — Ollama model name (e.g., `llama3`, `codellama`).
- `nota.ai.temperature` — creativity/randomness (0.0–1.0, default: `0.5`).
- `nota.commenting.includeLineComments` — enable inline comments (default: `false`).
- `nota.commenting.includeDocstrings` — generate DocStrings (default: `true`).
- `nota.commenting.overwriteExisting` — overwrite existing comments (default: `false`).

## Handling Large Files
- up to **800 lines** → single pass;
- **800–4000 lines** → chunks of ~1000 lines;
- **4000+ lines** → chunks of ~500 lines.

If the model has a small context window (e.g., 8k tokens), processing large files may be slow or fail.  
It is recommended to use models with a larger context window (128k+).

## Supported Languages
- Python (`.py`)
- JavaScript (`.js`)
- TypeScript (`.ts`)
- C++ (`.cpp`)
- Java (`.java`)
- PHP (`.php`)
- Go (`.go`)
- C# (`.cs`)

## Commenting Guidelines
Nota AI generates comments that:
- Use Google-style DocStrings for functions and classes.
- Are written in English.
- Focus on business logic, algorithms, non-trivial calculations, and error handling.
- Avoid describing obvious code (e.g., getters/setters).
- Are concise: 1–2 sentences, professional tone.

## Notes
- Ensure the selected Ollama model is running before using Nota AI.  
- Performance depends on your system and model’s context window.  
- Mixed-language files may be partially supported.  
- Existing comments are preserved unless `overwriteExisting = true`.

## Example
```bash
nota comment src/main.py
```

## Disclaimer
This project does **not** include or distribute any AI models.  
Nota AI only provides an interface for running locally hosted models via [Ollama](https://ollama.com).  

All models (e.g., LLaMA, Mistral, Phi, CodeLlama, etc.) are subject to their original licenses.  
Users are responsible for downloading models separately and complying with their respective license terms.

## License
[MIT](./LICENSE)
