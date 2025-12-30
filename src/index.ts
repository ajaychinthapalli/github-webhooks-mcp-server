#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { Octokit } from "@octokit/rest";

// GitHub API client
let octokit: Octokit;

// Initialize GitHub client with token from environment
function initializeGitHub() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN environment variable is required");
  }
  octokit = new Octokit({ auth: token });
}

// Tool definitions
const TOOLS: Tool[] = [
  {
    name: "create_org_webhook",
    description: "Create a webhook for an organization that applies to all repositories in the organization",
    inputSchema: {
      type: "object",
      properties: {
        org: {
          type: "string",
          description: "Organization name"
        },
        name: {
          type: "string",
          description: "The name of the webhook (must be 'web')",
          default: "web"
        },
        config: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "The URL to which the payloads will be delivered"
            },
            content_type: {
              type: "string",
              description: "The media type used to serialize the payloads (json or form)",
              enum: ["json", "form"]
            },
            secret: {
              type: "string",
              description: "Secret used to generate webhook signature"
            },
            insecure_ssl: {
              type: "string",
              description: "Whether to verify SSL certificates (0 or 1)",
              enum: ["0", "1"]
            }
          },
          required: ["url"]
        },
        events: {
          type: "array",
          items: {
            type: "string"
          },
          description: "Array of events that trigger the webhook (e.g., ['push', 'pull_request'])"
        },
        active: {
          type: "boolean",
          description: "Whether the webhook is active (default: true)"
        }
      },
      required: ["org", "config"]
    }
  },
  {
    name: "list_org_webhooks",
    description: "List all webhooks for an organization",
    inputSchema: {
      type: "object",
      properties: {
        org: {
          type: "string",
          description: "Organization name"
        },
        per_page: {
          type: "number",
          description: "Number of results per page (default: 30)"
        },
        page: {
          type: "number",
          description: "Page number (default: 1)"
        }
      },
      required: ["org"]
    }
  },
  {
    name: "update_org_webhook",
    description: "Update an existing organization webhook",
    inputSchema: {
      type: "object",
      properties: {
        org: {
          type: "string",
          description: "Organization name"
        },
        hook_id: {
          type: "number",
          description: "Webhook ID to update"
        },
        config: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "The URL to which the payloads will be delivered"
            },
            content_type: {
              type: "string",
              description: "The media type used to serialize the payloads (json or form)",
              enum: ["json", "form"]
            },
            secret: {
              type: "string",
              description: "Secret used to generate webhook signature"
            },
            insecure_ssl: {
              type: "string",
              description: "Whether to verify SSL certificates (0 or 1)",
              enum: ["0", "1"]
            }
          }
        },
        events: {
          type: "array",
          items: {
            type: "string"
          },
          description: "Array of events that trigger the webhook"
        },
        active: {
          type: "boolean",
          description: "Whether the webhook is active"
        }
      },
      required: ["org", "hook_id"]
    }
  },
  {
    name: "delete_org_webhook",
    description: "Delete an organization webhook",
    inputSchema: {
      type: "object",
      properties: {
        org: {
          type: "string",
          description: "Organization name"
        },
        hook_id: {
          type: "number",
          description: "Webhook ID to delete"
        }
      },
      required: ["org", "hook_id"]
    }
  },
  {
    name: "create_repo_webhook",
    description: "Create a webhook for a specific repository",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner (user or organization)"
        },
        repo: {
          type: "string",
          description: "Repository name"
        },
        name: {
          type: "string",
          description: "The name of the webhook (must be 'web')",
          default: "web"
        },
        config: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "The URL to which the payloads will be delivered"
            },
            content_type: {
              type: "string",
              description: "The media type used to serialize the payloads (json or form)",
              enum: ["json", "form"]
            },
            secret: {
              type: "string",
              description: "Secret used to generate webhook signature"
            },
            insecure_ssl: {
              type: "string",
              description: "Whether to verify SSL certificates (0 or 1)",
              enum: ["0", "1"]
            }
          },
          required: ["url"]
        },
        events: {
          type: "array",
          items: {
            type: "string"
          },
          description: "Array of events that trigger the webhook (e.g., ['push', 'pull_request'])"
        },
        active: {
          type: "boolean",
          description: "Whether the webhook is active (default: true)"
        }
      },
      required: ["owner", "repo", "config"]
    }
  },
  {
    name: "list_repo_webhooks",
    description: "List all webhooks for a repository",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner (user or organization)"
        },
        repo: {
          type: "string",
          description: "Repository name"
        },
        per_page: {
          type: "number",
          description: "Number of results per page (default: 30)"
        },
        page: {
          type: "number",
          description: "Page number (default: 1)"
        }
      },
      required: ["owner", "repo"]
    }
  },
  {
    name: "update_repo_webhook",
    description: "Update an existing repository webhook",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner (user or organization)"
        },
        repo: {
          type: "string",
          description: "Repository name"
        },
        hook_id: {
          type: "number",
          description: "Webhook ID to update"
        },
        config: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "The URL to which the payloads will be delivered"
            },
            content_type: {
              type: "string",
              description: "The media type used to serialize the payloads (json or form)",
              enum: ["json", "form"]
            },
            secret: {
              type: "string",
              description: "Secret used to generate webhook signature"
            },
            insecure_ssl: {
              type: "string",
              description: "Whether to verify SSL certificates (0 or 1)",
              enum: ["0", "1"]
            }
          }
        },
        events: {
          type: "array",
          items: {
            type: "string"
          },
          description: "Array of events that trigger the webhook"
        },
        active: {
          type: "boolean",
          description: "Whether the webhook is active"
        }
      },
      required: ["owner", "repo", "hook_id"]
    }
  },
  {
    name: "delete_repo_webhook",
    description: "Delete a repository webhook",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner (user or organization)"
        },
        repo: {
          type: "string",
          description: "Repository name"
        },
        hook_id: {
          type: "number",
          description: "Webhook ID to delete"
        }
      },
      required: ["owner", "repo", "hook_id"]
    }
  }
];

// Tool handlers
async function handleCreateOrgWebhook(args: any) {
  const { org, name = "web", config, events = ["push"], active = true } = args;
  
  const response = await octokit.orgs.createWebhook({
    org,
    name,
    config,
    events,
    active,
  });
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(response.data, null, 2),
      },
    ],
  };
}

async function handleListOrgWebhooks(args: any) {
  const { org, per_page = 30, page = 1 } = args;
  
  const response = await octokit.orgs.listWebhooks({
    org,
    per_page,
    page,
  });
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(response.data, null, 2),
      },
    ],
  };
}

async function handleUpdateOrgWebhook(args: any) {
  const { org, hook_id, config, events, active } = args;
  
  const params: any = {
    org,
    hook_id,
  };
  
  if (config) params.config = config;
  if (events) params.events = events;
  if (active !== undefined) params.active = active;
  
  const response = await octokit.orgs.updateWebhook(params);
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(response.data, null, 2),
      },
    ],
  };
}

async function handleDeleteOrgWebhook(args: any) {
  const { org, hook_id } = args;
  
  await octokit.orgs.deleteWebhook({
    org,
    hook_id,
  });
  
  return {
    content: [
      {
        type: "text",
        text: `Successfully deleted webhook ${hook_id} from organization ${org}`,
      },
    ],
  };
}

async function handleCreateRepoWebhook(args: any) {
  const { owner, repo, name = "web", config, events = ["push"], active = true } = args;
  
  const response = await octokit.repos.createWebhook({
    owner,
    repo,
    name,
    config,
    events,
    active,
  });
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(response.data, null, 2),
      },
    ],
  };
}

async function handleListRepoWebhooks(args: any) {
  const { owner, repo, per_page = 30, page = 1 } = args;
  
  const response = await octokit.repos.listWebhooks({
    owner,
    repo,
    per_page,
    page,
  });
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(response.data, null, 2),
      },
    ],
  };
}

async function handleUpdateRepoWebhook(args: any) {
  const { owner, repo, hook_id, config, events, active } = args;
  
  const params: any = {
    owner,
    repo,
    hook_id,
  };
  
  if (config) params.config = config;
  if (events) params.events = events;
  if (active !== undefined) params.active = active;
  
  const response = await octokit.repos.updateWebhook(params);
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(response.data, null, 2),
      },
    ],
  };
}

async function handleDeleteRepoWebhook(args: any) {
  const { owner, repo, hook_id } = args;
  
  await octokit.repos.deleteWebhook({
    owner,
    repo,
    hook_id,
  });
  
  return {
    content: [
      {
        type: "text",
        text: `Successfully deleted webhook ${hook_id} from repository ${owner}/${repo}`,
      },
    ],
  };
}

// Main server setup
async function main() {
  // Initialize GitHub client
  initializeGitHub();

  // Create server instance
  const server = new Server(
    {
      name: "github-webhooks-mcp-server",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register tool list handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: TOOLS,
    };
  });

  // Register tool call handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "create_org_webhook":
          return await handleCreateOrgWebhook(args);
        case "list_org_webhooks":
          return await handleListOrgWebhooks(args);
        case "update_org_webhook":
          return await handleUpdateOrgWebhook(args);
        case "delete_org_webhook":
          return await handleDeleteOrgWebhook(args);
        case "create_repo_webhook":
          return await handleCreateRepoWebhook(args);
        case "list_repo_webhooks":
          return await handleListRepoWebhooks(args);
        case "update_repo_webhook":
          return await handleUpdateRepoWebhook(args);
        case "delete_repo_webhook":
          return await handleDeleteRepoWebhook(args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  });

  // Start server with stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error("GitHub Webhooks MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
