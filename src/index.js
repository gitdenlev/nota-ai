#!/usr/bin/env node
import cfonts from "cfonts";
import chalk from "chalk";
import path from "path";
import fs from "fs/promises";
import ora from "ora";
import { main as generateComments } from "./commands/generate-comments/index.js";

// ------------------- Банер -------------------
const displayBanner = () => {
  cfonts.say("Nota AI", {
    font: "block",
    align: "center",
    colors: ["cyan", "blue"],
    background: "transparent",
    spaceless: true,
  });
  cfonts.say("Intelligent Code Commenting", {
    font: "console",
    align: "center",
    colors: ["cyan", "blue"],
    background: "transparent",
    spaceless: true,
  });
};

// ------------------- Хелп -------------------
const showHelp = () => {
  console.log(chalk.yellow.bold.underline("Usage:"));
  console.log("  nota comment <input_file> [--config <config_file>]\n");
  console.log(chalk.yellow.bold.underline("Options:"));
  console.log(
    `  ${chalk.cyan(
      "--config, -c"
    )}    Path to a custom .notarc.json config file (default: .notarc.json)`
  );
  console.log(`  ${chalk.cyan("--help, -h")}      Show this help message`);
};

// ------------------- Підтримувані розширення -------------------
const SUPPORTED_EXTENSIONS = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
  ".py",
  ".java",
  ".cpp",
  ".c",
  ".h",
  ".hpp",
  ".go",
  ".rs",
  ".rb",
  ".php",
  ".swift",
  ".kt",
  ".cs",
  ".scala",
  ".r",
  ".m",
  ".sh",
  ".bash",
];

// ------------------- Валідація файлу -------------------
const validateInputFile = async (filePath) => {
  try {
    const stats = await fs.stat(filePath);
    if (!stats.isFile()) throw new Error(`${filePath} is not a file`);
  } catch (error) {
    if (error.code === "ENOENT") throw new Error(`File not found: ${filePath}`);
    throw error;
  }

  const ext = path.extname(filePath).toLowerCase();
  if (!SUPPORTED_EXTENSIONS.includes(ext)) {
    throw new Error(
      `Unsupported file type: ${ext}\nSupported extensions: ${SUPPORTED_EXTENSIONS.join(
        ", "
      )}`
    );
  }

  return true;
};

// ------------------- Парсинг аргументів -------------------
const parseArgs = (args) => {
  const parsed = {
    inputFile: null,
    configFile: ".notarc.json",
    showHelp: false,
  };
  let command = null;

  if (args.length === 0) {
    parsed.showHelp = true;
    return parsed;
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "comment" && !command) {
      command = "comment";
      if (args[i + 1] && !args[i + 1].startsWith("-")) {
        parsed.inputFile = args[i + 1];
        i++;
      }
      continue;
    }

    switch (arg) {
      case "--config":
      case "-c":
        parsed.configFile = args[i + 1];
        i++;
        break;
      case "--help":
      case "-h":
        parsed.showHelp = true;
        break;
      default:
        // Невідомий аргумент, будемо обробляти нижче
        break;
    }
  }

  if (!command && !parsed.showHelp) return null; // невірна команда
  if (command === "comment" && !parsed.inputFile) {
    console.error(
      chalk.red.bold('Error: Missing <input_file> for "comment" command.')
    );
    return null;
  }

  return parsed;
};

// ------------------- Завантаження конфіга -------------------
const loadConfig = async (configPath) => {
  try {
    const resolvedPath = path.resolve(process.cwd(), configPath);
    const configData = await fs.readFile(resolvedPath, "utf-8");
    return JSON.parse(configData);
  } catch (error) {
    if (error.code === "ENOENT") {
      if (configPath !== ".notarc.json") {
        console.warn(
          chalk.yellow(
            `Warning: Config file not found at ${configPath}. Using defaults.`
          )
        );
      }
      return {};
    }
    throw new Error(
      `Failed to load or parse config file at ${configPath}: ${error.message}`
    );
  }
};

// ------------------- Основна функція -------------------
const run = async () => {
  const args = parseArgs(process.argv.slice(2));

  if (!args) {
    displayBanner();
    console.error(chalk.red.bold("Error: Unknown or missing command."));
    showHelp();
    process.exit(1);
  }

  if (args.showHelp) {
    displayBanner();
    showHelp();
    process.exit(0);
  }

  displayBanner();

  const spinner = ora({
    text: chalk.cyan("Initializing..."),
    spinner: "dots",
    color: "cyan",
  }).start();

  try {
    // Валідація вхідного файлу
    spinner.text = chalk.cyan(
      `Validating input file ${chalk.bold(args.inputFile)}...`
    );
    await validateInputFile(args.inputFile);

    spinner.text = chalk.cyan(
      `Loading configuration from ${chalk.bold(args.configFile)}...`
    );
    const config = await loadConfig(args.configFile);

    spinner.text = chalk.cyan(
      `Analyzing and commenting ${chalk.bold(args.inputFile)}...`
    );
    await generateComments(args.inputFile, config);

    spinner.succeed(
      chalk.green(`Successfully commented ${chalk.bold(args.inputFile)}`)
    );

    console.log(chalk.blue.bold("\n┌─[ Operation Complete ]──────────"));
    console.log(chalk.blue("│"));
    console.log(
      `${chalk.blue("│")} ${chalk.white("File:")} ${chalk.yellow(
        args.inputFile
      )}`
    );
    console.log(
      `${chalk.blue("│")} ${chalk.white("Status:")} ${chalk.green("Updated")}`
    );
    console.log(
      `${chalk.blue("│")} ${chalk.white("Config:")} ${chalk.yellow(
        args.configFile
      )}`
    );
    console.log(chalk.blue("│"));
    console.log(chalk.blue.bold("└──────────────────────────────────"));
  } catch (error) {
    spinner.fail(chalk.red.bold("An error occurred:"));
    console.error(chalk.red(error.message));
    process.exit(1);
  }
};

run();
