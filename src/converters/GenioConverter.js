import chalk from "chalk";
import fs from "fs-extra";
import path from "path";

class GenioConverter {
  constructor() {
    this.name = "GENIO"; // Google Events to Node.js Intelligent Orchestration
    this.description = "Converts GAS triggers to Bull queues and scheduled jobs";

    this.triggerMappings = {
      onEdit: {
        type: "SPREADSHEET_TRIGGER",
        conversion: "WEBHOOK",
        queue: "sheet-updates",
        schedule: null,
      },
      onOpen: {
        type: "SPREADSHEET_TRIGGER",
        conversion: "WEBHOOK",
        queue: "sheet-access",
        schedule: null,
      },
      onFormSubmit: {
        type: "FORM_TRIGGER",
        conversion: "WEBHOOK",
        queue: "form-submissions",
        schedule: null,
      },
      TIME_DRIVEN: {
        type: "TIME_TRIGGER",
        conversion: "CRON_JOB",
        queue: "scheduled-tasks",
        schedule: "0 * * * *", // Default: hourly
      },
    };
  }

  async convert(trigger, _context) {
    console.log(chalk.blue(`â° GENIO: Converting ${trigger.name} trigger`));

    const triggerType = this.detectTriggerType(trigger);
    const mapping = this.triggerMappings[triggerType] || this.triggerMappings.TIME_DRIVEN;

    let conversion;

    switch (mapping.conversion) {
      case "WEBHOOK":
        conversion = this.convertToWebhook(trigger, mapping);
        break;
      case "CRON_JOB":
        conversion = this.convertToCronJob(trigger, mapping);
        break;
      case "QUEUE":
        conversion = this.convertToQueue(trigger, mapping);
        break;
      default:
        conversion = this.convertToQueue(trigger, mapping);
    }

    const files = this.generateFiles(trigger, mapping, _conversion);

    return {
      trigger: {
        original: trigger.name,
        type: triggerType,
        location: trigger.location,
      },
      conversion: {
        type: mapping.conversion,
        ...conversion,
      },
      files: files,
    };
  }

  detectTriggerType(trigger) {
    const name = trigger.name.toLowerCase();

    if (name.includes("edit")) return "onEdit";
    if (name.includes("open")) return "onOpen";
    if (name.includes("form")) return "onFormSubmit";
    if (name.includes("time") || name.includes("timer")) return "TIME_DRIVEN";

    // Check trigger properties
    if (trigger.properties?.eventType === "ON_EDIT") return "onEdit";
    if (trigger.properties?.eventType === "ON_OPEN") return "onOpen";
    if (trigger.properties?.eventType === "ON_FORM_SUBMIT") return "onFormSubmit";
    if (trigger.properties?.eventType === "CLOCK") return "TIME_DRIVEN";

    return "TIME_DRIVEN";
  }

  convertToWebhook(trigger, mapping) {
    const endpointName = this.slugify(trigger.name);

    return {
      endpoint: `/webhooks/${endpointName}`,
      method: "POST",
      queue: mapping.queue,
      handler: `${trigger.name}Handler`,
      validation: this.generateWebhookValidation(trigger),
    };
  }

  convertToCronJob(trigger, mapping) {
    // Extract schedule from trigger if available
    let schedule = mapping.schedule;

    if (trigger.properties?.frequency) {
      schedule = this.convertGasFrequencyToCron(trigger.properties.frequency);
    }

    return {
      schedule: schedule,
      queue: mapping.queue,
      job: `${trigger.name}Job`,
      options: {
        repeat: { cron: schedule },
        removeOnComplete: true,
        attempts: 3,
      },
    };
  }

  convertToQueue(trigger, mapping) {
    return {
      queue: mapping.queue,
      processor: `${trigger.name}Processor`,
      concurrency: 1,
      options: {
        delay: trigger.properties?.delay || 0,
        attempts: trigger.properties?.attempts || 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
      },
    };
  }

  convertGasFrequencyToCron(frequency) {
    const mappings = {
      MINUTES: "*/5 * * * *", // Every 5 minutes
      HOURLY: "0 * * * *", // Every hour
      DAILY: "0 9 * * *", // 9 AM daily
      WEEKLY: "0 9 * * 1", // 9 AM every Monday
      MONTHLY: "0 9 1 * *", // 9 AM on 1st of month
      YEARLY: "0 9 1 1 *", // 9 AM on Jan 1st
    };

    return mappings[frequency] || "0 * * * *";
  }

  generateWebhookValidation(trigger) {
    return `// Validation for ${trigger.name} webhook
const validate${this.pascalCase(trigger.name)} = (req, res, next) => {
  const { body } = req;
  
  // Validate required fields based on trigger parameters
  const required = ['timestamp', 'source'];
  
  for (const field of required) {
    if (!body[field]) {
      return res.status(400).json({
        error: \`Missing required field: \${field}\`,
      });
    }
  }
  
  // Add signature verification for security
  if (process.env.WEBHOOK_SECRET) {
    const signature = req.headers['x-webhook-signature'];
    const expected = crypto
      .createHmac('sha256', process.env.WEBHOOK_SECRET)
      .update(JSON.stringify(body))
      .digest('hex');
    
    if (signature !== expected) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
  }
  
  next();
}`;
  }

  generateFiles(trigger, mapping, _conversion) {
    const _baseName = this.slugify(trigger.name);

    return {
      webhook: this.generateWebhookFile(trigger, _conversion),
      queue: this.generateQueueFile(trigger, _conversion),
      worker: this.generateWorkerFile(trigger, _conversion),
      job: this.generateJobFile(trigger, _conversion),
    };
  }

  generateWebhookFile(trigger, conversion) {
    return `// webhooks/${this.slugify(trigger.name)}.js
const express = require('express');
const router = express.Router();
const ${this.camelCase(trigger.name)}Queue = require('../queues/${this.slugify(trigger.name)}');

router.post('/', async (req, res) => {
  try {
    // Add webhook data to queue
    await ${this.camelCase(trigger.name)}Queue.add({
      type: 'webhook',
      data: req.body,
      timestamp: new Date().toISOString(),
      source: req.headers['x-webhook-source'] || 'unknown',
    });
    
    res.json({
      success: true,
      message: 'Webhook received and queued',
      queue: '${conversion.queue}',
    });
    
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;`;
  }

  generateQueueFile(trigger, conversion) {
    const scheduledJobCode = conversion.schedule ? `
// Scheduled job
${this.camelCase(trigger.name)}Queue.add(
  { type: 'scheduled', trigger: '${trigger.name}' },
  {
    repeat: { cron: '${conversion.schedule}' },
    jobId: '${trigger.name}-scheduled',
  }
);` : "";

    return `// queues/${this.slugify(trigger.name)}.js
const Queue = require('bull');
const redisConfig = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  }
};

const ${this.camelCase(trigger.name)}Queue = new Queue('${conversion.queue}', redisConfig);

// Process jobs
${this.camelCase(trigger.name)}Queue.process('${trigger.name}', async (job) => {
  console.log(\`Processing ${trigger.name} job: \${job.id}\`);
  
  try {
    // Original GAS trigger logic goes here
    ${trigger.body || "// Add your converted trigger logic here"}
    
    return { success: true };
  } catch (error) {
    console.error(\`Error in ${trigger.name} job:\`, error);
    throw error;
  }
});
${scheduledJobCode}

module.exports = ${this.camelCase(trigger.name)}Queue;`;
  }

  generateWorkerFile(trigger, conversion) {
    return `// workers/${this.slugify(trigger.name)}Worker.js
const ${this.camelCase(trigger.name)}Queue = require('../queues/${this.slugify(trigger.name)}');

class ${this.pascalCase(trigger.name)}Worker {
  constructor() {
    this.queue = ${this.camelCase(trigger.name)}Queue;
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    this.queue.on('completed', (job, result) => {
      console.log(\`Job \${job.id} completed: \`, result);
    });
    
    this.queue.on('failed', (job, error) => {
      console.error(\`Job \${job.id} failed: \`, error);
      
      // Retry logic
      if (job.attemptsMade < job.opts.attempts) {
        console.log(\`Retrying job \${job.id}...\`);
      }
    });
    
    this.queue.on('stalled', (job) => {
      console.warn(\`Job \${job.id} stalled\`);
    });
  }
  
  async start() {
    console.log(\`${this.pascalCase(trigger.name)}Worker started\`);
    
    // Clean old jobs
    await this.queue.clean(1000, 'completed');
    await this.queue.clean(1000, 'failed');
    
    return this;
  }
  
  async stop() {
    await this.queue.close();
    console.log(\`${this.pascalCase(trigger.name)}Worker stopped\`);
  }
}

module.exports = ${this.pascalCase(trigger.name)}Worker;`;
  }

  generateJobFile(trigger, conversion) {
    // Use the actual convertTriggerBody method on this class
    const convertedBody = this.convertTriggerBody(trigger.body || "");

    return `// jobs/${this.slugify(trigger.name)}Job.js
class ${this.pascalCase(trigger.name)}Job {
  constructor(data) {
    this.data = data;
    this.createdAt = new Date();
  }
  
  async execute() {
    console.log(\`Executing ${trigger.name} job at \${this.createdAt.toISOString()}\`);
    
    try {
      // Converted GAS trigger logic
      ${convertedBody}
      
      return {
        success: true,
        executedAt: new Date().toISOString(),
        trigger: '${trigger.name}',
      };
      
    } catch (error) {
      console.error(\`Error executing ${trigger.name} job:\`, error);
      throw error;
    }
  }
}

module.exports = ${this.pascalCase(trigger.name)}Job;`;
  }

  // FIXED: Add the missing convertTriggerBody method to the class
  convertTriggerBody(gasBody) {
    let converted = gasBody || "";

    // Convert event parameter access
    converted = converted.replace(/e\.range/g, "this.data.range");
    converted = converted.replace(/e\.source/g, "this.data.source");
    converted = converted.replace(/e\.value/g, "this.data.value");
    converted = converted.replace(/e\.user/g, "this.data.user");
    converted = converted.replace(/e\.authMode/g, "this.data.authMode");

    // Convert SpreadsheetApp in triggers
    converted = converted.replace(/SpreadsheetApp\./g, "spreadsheet.");

    // Add return statement if missing
    if (gasBody && !converted.includes("return") && !converted.includes("console.log")) {
      converted += "\n    // Trigger executed successfully";
    }

    return converted;
  }

  // Utility functions
  slugify(text) {
    if (!text) return "trigger";
    return text
      .toString()
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  camelCase(text) {
    if (!text) return "trigger";
    return text
      .replace(/-([a-z])/g, (g) => g[1].toUpperCase())
      .replace(/^./, (c) => c.toLowerCase());
  }

  pascalCase(text) {
    if (!text) return "Trigger";
    return this.camelCase(text).replace(/^./, (c) => c.toUpperCase());
  }
}

export default GenioConverter;

