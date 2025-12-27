import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ProjectGenerator {
  constructor() {
    this.templatesDir = path.join(__dirname, "..", "..", "templates");
  }

  async generateProject(projectName, options = {}) {
    const {
      frameworks = ["guapo", "genio", "chiew"],
      __database = "postgres",
      outputDir = "./",
      demoMode = false,
    } = options;

    console.log(chalk.cyan(`ðŸ—ï¸ Generating project: ${projectName}`));

    const projectPath = path.join(outputDir, projectName);

    try {
      // Create project structure
      await this.createProjectStructure(projectPath, frameworks, _database);

      // Generate package.json
      await this.generatePackageJson(
        projectPath,
        projectName,
        frameworks,
        _database,
      );

      // Generate configuration files
      await this.generateConfigFiles(
        projectPath,
        projectName,
        frameworks,
        _database,
      );

      // Generate Docker setup
      await this.generateDockerFiles(projectPath, _database);

      // Generate README
      await this.generateReadme(
        projectPath,
        projectName,
        frameworks,
        _database,
        demoMode,
      );

      console.log(chalk.green(`âœ… Project generated at: ${projectPath}`));

      return {
        success: true,
        path: projectPath,
        files: await this.countFiles(projectPath),
      };
    } catch (error) {
      console.error(chalk.red("âŒ Error generating project:"), error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async createProjectStructure(projectPath, frameworks, database) {
    console.log(chalk.blue("ðŸ“ Creating project structure..."));

    const dirs = [
      // Root
      "",

      // Source directories
      "src",
      "src/api",
      "src/api/controllers",
      "src/api/routes",
      "src/api/middleware",
      "src/api/services",
      "src/api/utils",

      "src/workers",
      "src/workers/queues",
      "src/workers/jobs",
      "src/workers/processors",

      "src/ui",
      "src/ui/components",
      "src/ui/pages",
      "src/ui/layouts",
      "src/ui/styles",
      "src/ui/hooks",

      // Database
      "database",
      "database/migrations",
      "database/seeders",

      // Config
      "config",

      // Tests
      "tests",
      "tests/unit",
      "tests/integration",
      "tests/e2e",

      // Docs
      "docs",

      // Logs and temp
      "logs",
      "tmp",
    ];

    // Add framework-specific directories
    if (frameworks.includes("guapo")) {
      dirs.push("src/api/models");
    }

    if (frameworks.includes("chiew")) {
      dirs.push("src/ui/public");
      dirs.push("src/ui/assets");
    }

    // Create all directories
    for (const dir of dirs) {
      const fullPath = path.join(projectPath, dir);
      await fs.ensureDir(fullPath);
    }

    // Create .gitkeep files in empty directories
    for (const dir of dirs.filter((d) => d.includes("/"))) {
      const gitkeepPath = path.join(projectPath, dir, ".gitkeep");
      await fs.writeFile(gitkeepPath, "");
    }

    console.log(chalk.green(`  Created ${dirs.length} directories`));
  }

  async generatePackageJson(projectPath, projectName, frameworks, database) {
    console.log(chalk.blue("ðŸ“¦ Generating package.json..."));

    const dependencies = {
      // Common dependencies
      express: "^4.18.0",
      dotenv: "^16.0.0",
      cors: "^2.8.5",
      helmet: "^7.0.0",
      morgan: "^1.10.0",
    };

    const devDependencies = {
      nodemon: "^3.0.0",
      jest: "^29.0.0",
      supertest: "^6.0.0",
      eslint: "^8.0.0",
      prettier: "^3.0.0",
    };

    // Add framework-specific dependencies
    if (frameworks.includes("guapo")) {
      dependencies["body-parser"] = "^1.20.0";
      dependencies["express-validator"] = "^7.0.0";

      if (database === "postgres") {
        dependencies["pg"] = "^8.11.0";
        dependencies["sequelize"] = "^6.0.0";
      } else if (database === "mysql") {
        dependencies["mysql2"] = "^3.0.0";
        dependencies["sequelize"] = "^6.0.0";
      } else if (database === "sqlite") {
        dependencies["sqlite3"] = "^5.0.0";
        dependencies["sequelize"] = "^6.0.0";
      }
    }

    if (frameworks.includes("genio")) {
      dependencies["bull"] = "^4.10.0";
      dependencies["ioredis"] = "^5.3.0";
      dependencies["node-cron"] = "^3.0.0";
    }

    if (frameworks.includes("chiew")) {
      dependencies["react"] = "^18.0.0";
      dependencies["react-dom"] = "^18.0.0";
      dependencies["react-router-dom"] = "^6.0.0";
      dependencies["axios"] = "^1.0.0";
      devDependencies["vite"] = "^4.0.0";
      devDependencies["@vitejs/plugin-react"] = "^4.0.0";
    }

    const packageJson = {
      name: projectName.toLowerCase().replace(/\s+/g, "-"),
      version: "1.0.0",
      description: "Migrated from Google Apps Script using CÂ³X CLI",
      main: "src/api/server.js",
      scripts: {
        dev: "nodemon src/api/server.js",
        start: "node src/api/server.js",
        test: "jest",
        "test:watch": "jest --watch",
        lint: "eslint src/**/*.js",
        format: "prettier --write src/**/*.js",
      },
      dependencies,
      devDependencies,
      engines: {
        node: ">=18.0.0",
      },
    };

    // Add UI scripts if CHIEW is included
    if (frameworks.includes("chiew")) {
      packageJson.scripts["ui:dev"] = "cd src/ui && npm run dev";
      packageJson.scripts["ui:build"] = "cd src/ui && npm run build";
      packageJson.scripts["ui:preview"] = "cd src/ui && npm run preview";
    }

    await fs.writeJson(path.join(projectPath, "package.json"), packageJson, {
      spaces: 2,
    });

    console.log(chalk.green("  âœ… package.json created"));
  }

  async generateConfigFiles(projectPath, projectName, frameworks, database) {
    console.log(chalk.blue("âš™ï¸ Generating configuration files..."));

    // .env file
    const envContent = `# Environment Configuration
NODE_ENV=development
PORT=3000

# Database
${this.getDatabaseEnvVars(database, projectName)}

# Redis (for queues)
REDIS_HOST=localhost
REDIS_PORT=6379

# API Keys (add your own)
GOOGLE_API_KEY=your_google_api_key_here

# Security
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here

# Logging
LOG_LEVEL=info
LOG_FORMAT=combined`;

    await fs.writeFile(path.join(projectPath, ".env.example"), envContent);

    // Docker Compose
    const dockerCompose = this.generateDockerCompose(
      projectName,
      frameworks,
      database,
    );
    await fs.writeFile(
      path.join(projectPath, "docker-compose.yml"),
      dockerCompose,
    );

    // ESLint config
    const eslintConfig = {
      extends: ["eslint:recommended"],
      env: {
        node: true,
        es2022: true,
      },
      parserOptions: {
        ecmaVersion: "latest",
      },
      rules: {
        "no-console": "off",
        "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      },
    };

    await fs.writeJson(path.join(projectPath, ".eslintrc.json"), eslintConfig, {
      spaces: 2,
    });

    // Gitignore
    const gitignore = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local

# Runtime data
dist/
build/
*.pid
*.seed

# Logs
logs/
*.log

# OS files
.DS_Store
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo

# Coverage
coverage/

# Docker
*.dockerignore`;

    await fs.writeFile(path.join(projectPath, ".gitignore"), gitignore);

    console.log(chalk.green("  âœ… Configuration files created"));
  }

  getDatabaseEnvVars(database, projectName) {
    const dbName = projectName.toLowerCase().replace(/\s+/g, "_");

    switch (database) {
      case "postgres":
        return `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/${dbName}
DB_HOST=localhost
DB_PORT=5432
DB_NAME=${dbName}
DB_USER=postgres
DB_PASSWORD=postgres`;

      case "mysql":
        return `DATABASE_URL=mysql://root:root@localhost:3306/${dbName}
DB_HOST=localhost
DB_PORT=3306
DB_NAME=${dbName}
DB_USER=root
DB_PASSWORD=root`;

      case "sqlite":
        return `DATABASE_URL=sqlite:./database/${dbName}.sqlite`;

      default:
        return "";
    }
  }

  generateDockerCompose(projectName, frameworks, database) {
    const dbName = projectName.toLowerCase().replace(/\s+/g, "_");
    const services = {};

    // API service
    services.api = {
      build: {
        context: ".",
        dockerfile: "Dockerfile.api",
      },
      ports: ["3000:3000"],
      environment: {
        NODE_ENV: "production",
      },
      depends_on: [],
      volumes: ["./:/app", "/app/node_modules"],
    };

    // Database service
    if (database === "postgres") {
      services.database = {
        image: "postgres:15-alpine",
        ports: ["5432:5432"],
        environment: {
          POSTGRES_DB: dbName,
          POSTGRES_USER: "postgres",
          POSTGRES_PASSWORD: "postgres",
        },
        volumes: ["./database/postgres:/var/lib/postgresql/data"],
      };
      services.api.depends_on.push("database");
    }

    if (database === "mysql") {
      services.database = {
        image: "mysql:8",
        ports: ["3306:3306"],
        environment: {
          MYSQL_DATABASE: dbName,
          MYSQL_ROOT_PASSWORD: "root",
        },
        volumes: ["./database/mysql:/var/lib/mysql"],
      };
      services.api.depends_on.push("database");
    }

    // Redis for queues
    if (frameworks.includes("genio")) {
      services.redis = {
        image: "redis:7-alpine",
        ports: ["6379:6379"],
        volumes: ["./database/redis:/data"],
      };
      services.api.depends_on.push("redis");
    }

    // UI service (if CHIEW)
    if (frameworks.includes("chiew")) {
      services.ui = {
        build: {
          context: "./src/ui",
          dockerfile: "Dockerfile.ui",
        },
        ports: ["5173:5173"],
        volumes: ["./src/ui:/app", "/app/node_modules"],
      };
    }

    // Convert services to YAML
    const yamlServices = Object.entries(services)
      .map(([name, config]) => {
        const yaml = `  ${name}:\n`;
        const configLines = [];

        for (const [key, value] of Object.entries(config)) {
          if (typeof value === "object" && value !== null) {
            if (Array.isArray(value)) {
              configLines.push(`    ${key}:`);
              value.forEach((item) => configLines.push(`      - ${item}`));
            } else {
              configLines.push(`    ${key}:`);
              for (const [subKey, subValue] of Object.entries(value)) {
                if (typeof subValue === "object") {
                  configLines.push(`      ${subKey}:`);
                  for (const [subSubKey, subSubValue] of Object.entries(
                    subValue,
                  )) {
                    configLines.push(`        ${subSubKey}: ${subSubValue}`);
                  }
                } else {
                  configLines.push(`      ${subKey}: ${subValue}`);
                }
              }
            }
          } else {
            configLines.push(`    ${key}: ${value}`);
          }
        }

        return yaml + configLines.join("\n");
      })
      .join("\n\n");

    return `version: '3.8'

services:
${yamlServices}`;
  }

  async generateDockerFiles(projectPath, database) {
    console.log(chalk.blue("ðŸ³ Generating Docker files..."));

    // Dockerfile for API
    const apiDockerfile = `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]`;

    await fs.writeFile(path.join(projectPath, "Dockerfile.api"), apiDockerfile);

    // Dockerfile for UI (if needed, will be created in UI directory)
    const uiDockerfile = `FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]`;

    await fs.writeFile(path.join(projectPath, "Dockerfile.ui"), uiDockerfile);

    console.log(chalk.green("  âœ… Docker files created"));
  }

  async generateReadme(
    projectPath,
    projectName,
    frameworks,
    database,
    demoMode,
  ) {
    console.log(chalk.blue("ðŸ“„ Generating README..."));

    const frameworkNames = {
      guapo: "Express.js API",
      genio: "Bull Queues & Workers",
      chiew: "React Frontend",
    };

    const frameworksList = frameworks
      .map((f) => `- ${frameworkNames[f]}`)
      .join("\n");

    const readmeContent = `# ${projectName}

This project was migrated from Google Apps Script using **CÂ³X CLI**.

## ðŸš€ Quick Start

\`\`\`bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# 3. Start with Docker (recommended)
docker-compose up -d

# 4. Or run locally
npm run dev
\`\`\`

## ðŸ—ï¸ Project Structure

\`\`\`
${projectName}/
â”œâ”€â”€ src/api/           # Backend API (GUAPO)
â”œâ”€â”€ src/workers/       # Background jobs (GENIO)
â”œâ”€â”€ src/ui/           # Frontend UI (CHIEW)
â”œâ”€â”€ database/         # Database migrations
â”œâ”€â”€ config/           # Configuration files
â””â”€â”€ tests/            # Test files
\`\`\`

## ðŸ”§ Included Frameworks

${frameworksList}

## ðŸ—„ï¸ Database

Using: **${_database.toUpperCase()}**

## ðŸ“‹ Migration Details

- **Migrated on**: ${new Date().toISOString().split("T")[0]}
- **Migration tool**: CÂ³X CLI ${demoMode ? "(Demo Mode)" : ""}
- **Original**: Google Apps Script
- **Target**: Modern Node.js/React stack

## ðŸš€ Deployment

### Railway
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new?template=https://github.com/your-repo)

### Vercel (Frontend)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo)

### Manual Deployment
\`\`\`bash
# Build
npm run build

# Deploy to your preferred platform
\`\`\`

## ðŸ“š Documentation

- [API Documentation](docs/api.md)
- [Database Schema](docs/database.md)
- [Deployment Guide](docs/deployment.md)

## ðŸ› ï¸ Development

\`\`\`bash
# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
\`\`\`

## ðŸ¤ Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## ðŸ“„ License

MIT License - see [LICENSE](LICENSE) for details.

---

*Migrated with â¤ï¸ by CÂ³X CLI - 3x Productivity for GAS Developers*`;

    await fs.writeFile(path.join(projectPath, "README.md"), readmeContent);
    console.log(chalk.green("  âœ… README created"));
  }

  async countFiles(dirPath) {
    try {
      const files = await fs.readdir(dirPath, { recursive: true });
      return files.length;
    } catch {
      return 0;
    }
  }
}

export default ProjectGenerator;

