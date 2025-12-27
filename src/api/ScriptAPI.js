import { google } from "googleapis";
import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // eslint-disable-line no-unused-vars

class ScriptAPI {
  constructor(authClient) {
    this.authClient = authClient;
    this.script = google.script({ version: "v1", auth: authClient });
    this.drive = google.drive({ version: "v3", auth: authClient });
    this.sheets = google.sheets({ version: "v4", auth: authClient });
  }

  async getProject(scriptId) {
    console.log(chalk.blue(`ðŸ“¥ Fetching project: ${scriptId}`));

    try {
      const response = await this.script.projects.get({
        scriptId,
      });

      console.log(chalk.green(`âœ… Project found: ${response.data.title}`));
      return response.data;
    } catch (error) {
      console.error(chalk.red("âŒ Error fetching project:"), error.message);
      throw error;
    }
  }

  async getContent(scriptId) {
    console.log(chalk.blue("ðŸ“„ Downloading project content..."));

    try {
      const response = await this.script.projects.getContent({
        scriptId,
      });

      const files = response.data.files || [];
      console.log(chalk.green(`âœ… Downloaded ${files.length} files`));
      return files;
    } catch (error) {
      console.error(chalk.red("âŒ Error downloading content:"), error.message);
      throw error;
    }
  }

  async downloadProject(scriptId, outputDir) {
    console.log(chalk.cyan("\nðŸ“¦ Downloading Google Apps Script Project"));
    console.log(chalk.gray("=".repeat(50)));

    // Get project metadata
    const project = await this.getProject(scriptId);

    // Get project content
    const files = await this.getContent(scriptId);

    // Create output directory
    await fs.ensureDir(outputDir);

    // Save project metadata
    await fs.writeJson(
      path.join(outputDir, "project.json"),
      {
        id: project.scriptId,
        title: project.title,
        createdTime: project.createTime,
        modifiedTime: project.updateTime,
        parentId: project.parentId,
      },
      { spaces: 2 }
    );

    // Save each file
    let savedFiles = [];
    for (const file of files) {
      const fileInfo = await this.saveFile(file, outputDir);
      savedFiles.push(fileInfo);
    }

    console.log(chalk.green(`\nâœ… Project downloaded to: ${outputDir}`));
    console.log(chalk.gray(`ðŸ“ Files: ${savedFiles.length}`));

    return {
      project,
      files: savedFiles,
    };
  }

  async saveFile(file, outputDir) {
    const { name, type, source } = file;

    let extension = ".gs";
    let subDir = "src";

    // Determine file type and extension
    if (type === "SERVER_JS") {
      extension = ".gs";
      subDir = "src";
    } else if (type === "HTML") {
      extension = ".html";
      subDir = "html";
    } else if (type === "JSON") {
      extension = ".json";
      subDir = "config";
    }

    // Create filename
    const filename = `${name}${extension}`;
    const filePath = path.join(outputDir, subDir, filename);

    // Ensure directory exists
    await fs.ensureDir(path.dirname(filePath));

    // Write file content
    if (source) {
      await fs.writeFile(filePath, source, "utf8");
    } else if (file.fileUri) {
      // For HTML files with external resources
      await fs.writeFile(filePath, file.fileUri, "utf8");
    }

    console.log(chalk.gray(`  ðŸ“„ ${path.join(subDir, filename)}`));

    return {
      name,
      type,
      path: filePath,
      size: source ? Buffer.byteLength(source, "utf8") : 0,
    };
  }

  async getScriptTriggers(scriptId) {
    console.log(chalk.blue("ðŸ” Fetching script triggers..."));

    try {
      const response = await this.script.projects.triggers.list({
        scriptId,
      });

      const triggers = response.data.triggers || [];
      console.log(chalk.green(`âœ… Found ${triggers.length} triggers`));
      return triggers;
    } catch (error) {
      console.log(
        chalk.yellow("âš ï¸  No triggers found or insufficient permissions")
      );
      return [];
    }
  }

  async getDeployments(scriptId) {
    console.log(chalk.blue("ðŸš€ Fetching deployments..."));

    try {
      const response = await this.script.projects.deployments.list({
        scriptId,
      });

      const deployments = response.data.deployments || [];
      console.log(chalk.green(`âœ… Found ${deployments.length} deployments`));
      return deployments;
    } catch (error) {
      console.log(chalk.yellow("âš ï¸  No deployments found"));
      return [];
    }
  }

  async getSheetData(spreadsheetId, range = "A1:Z1000") {
    console.log(chalk.blue("ðŸ“Š Fetching Google Sheets data..."));

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      const rows = response.data.values || [];
      console.log(chalk.green(`âœ… Fetched ${rows.length} rows`));
      return rows;
    } catch (error) {
      console.error(chalk.red("âŒ Error fetching sheet data:"), error.message);
      throw error;
    }
  }

  async analyzeProject(scriptId) {
    console.log(chalk.cyan("\nðŸ”¬ Analyzing GAS Project"));
    console.log(chalk.gray("=".repeat(50)));

    const [project, files, triggers, deployments] = await Promise.all([
      this.getProject(scriptId),
      this.getContent(scriptId),
      this.getScriptTriggers(scriptId),
      this.getDeployments(scriptId),
    ]);

    // Analyze file types
    const fileTypes = files.reduce((acc, file) => {
      acc[file.type] = (acc[file.type] || 0) + 1;
      return acc;
    }, {});

    // Detect common patterns
    const analysis = {
      projectId: scriptId,
      projectTitle: project.title,
      fileCount: files.length,
      fileTypes,
      triggers: triggers.length,
      deployments: deployments.length,
      hasWebApp: deployments.some(
        (d) => d.deploymentConfig && d.deploymentConfig.scriptId
      ),
      hasTimeTriggers: triggers.some((t) => t.eventType === "CLOCK"),
      hasSpreadsheetTriggers: triggers.some(
        (t) => t.eventType === "ON_OPEN" || t.eventType === "ON_EDIT"
      ),
      estimatedComplexity: this.estimateComplexity(files),
    };

    console.log(chalk.green("âœ… Analysis complete"));
    console.log(chalk.gray(JSON.stringify(analysis, null, 2)));

    return analysis;
  }

  estimateComplexity(files) {
    let score = 0;

    for (const file of files) {
      if (file.source) {
        const lines = file.source.split("\n").length;
        score += Math.min(Math.floor(lines / 10), 10); // Max 10 points per file

        // Detect complexity patterns
        if (file.source.includes("doGet") || file.source.includes("doPost")) {
          score += 5; // Web app endpoints
        }
        if (file.source.includes("onEdit") || file.source.includes("onOpen")) {
          score += 3; // Spreadsheet triggers
        }
        if (file.source.includes("SpreadsheetApp")) {
          score += 2; // Spreadsheet operations
        }
        if (file.source.includes("UrlFetchApp")) {
          score += 4; // HTTP requests
        }
        if (file.source.includes("PropertiesService")) {
          score += 2; // Configuration
        }
      }
    }

    if (score < 10) return "Simple";
    if (score < 25) return "Moderate";
    if (score < 50) return "Complex";
    return "Very Complex";
  }
}

export default ScriptAPI;


