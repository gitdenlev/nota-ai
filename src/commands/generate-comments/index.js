import fs from "fs/promises";
import ollama from "ollama";
import path from "path";

async function loadPrompt(templatePath) {
  try {
    return await fs.readFile(templatePath, "utf-8");
  } catch (error) {
    console.error("Error: Failed to load context file.");
    throw error;
  }
}

const sanitizeCodeBlock = (rawContent) => {
  const codeBlockRegex = /^```(?:\w+)?\s*\n([\s\S]+?)\n```$/;
  const match = rawContent.match(codeBlockRegex);
  if (match) {
    return match[1];
  }
  return rawContent;
};

async function generateComment(codeSnippet) {
  const contextPath = path.resolve(
    path.dirname(import.meta.url.replace("file://", "")),
    "CONTEXT.md"
  );
  const basePrompt = await loadPrompt(contextPath);

  const prompt = `${basePrompt}  Add comments to the following code:\n${codeSnippet}`;

  const response = await ollama.chat({
    model: "llama3.2:latest",
    messages: [{ role: "user", content: prompt }],
  });

  return response.message.content.trim();
}

// Main CLI runner
export async function main(inputPath) {
  if (!inputPath) {
    console.log("Please provide an input file path.");
    return;
  }

  let finalFilePath = inputPath;
  if (finalFilePath.startsWith("@/")) {
    const baseDir = path.resolve(process.cwd(), "./");
    finalFilePath = path.join(baseDir, finalFilePath.slice(2));
  }

  try {
    const code = await fs.readFile(finalFilePath, "utf-8");
    const commentedCodeRaw = await generateComment(code);
    const commentedCode = sanitizeCodeBlock(commentedCodeRaw);
    await fs.writeFile(finalFilePath, commentedCode, "utf-8");
  } catch (error) {
    console.error("Error!");
    console.error(`An issue occurred:

${error.message}`);
    throw error;
  }
}
