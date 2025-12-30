# GitHub Webhooks MCP Server

A Model Context Protocol (MCP) server for managing GitHub webhooks at both organization and repository levels.

## Features

### Organization-level Webhooks
- **create_org_webhook** - Create webhooks that apply to all repositories in an organization
- **list_org_webhooks** - List all organization-level webhooks
- **update_org_webhook** - Modify existing organization webhooks
- **delete_org_webhook** - Remove organization webhooks

### Repository-level Webhooks
- **create_repo_webhook** - Create webhooks for a specific repository
- **list_repo_webhooks** - List all webhooks for a repository
- **update_repo_webhook** - Modify existing repository webhooks
- **delete_repo_webhook** - Remove repository webhooks

## Installation

```bash
npm install
npm run build
```

## Configuration

The server requires a GitHub personal access token with appropriate permissions:

- For organization webhooks: `admin:org_hook` scope
- For repository webhooks: `admin:repo_hook` scope

Set the token as an environment variable:

```bash
export GITHUB_TOKEN=your_github_token_here
```

## Usage

### Running the Server

```bash
node dist/index.js
```

### MCP Client Configuration

Add to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "github-webhooks": {
      "command": "node",
      "args": ["/path/to/github-webhooks-mcp-server/dist/index.js"],
      "env": {
        "GITHUB_TOKEN": "your_github_token_here"
      }
    }
  }
}
```

## Tool Examples

### Create Organization Webhook

```json
{
  "org": "my-org",
  "config": {
    "url": "https://example.com/webhook",
    "content_type": "json",
    "secret": "my-secret"
  },
  "events": ["push", "pull_request"],
  "active": true
}
```

### List Organization Webhooks

```json
{
  "org": "my-org",
  "per_page": 30,
  "page": 1
}
```

### Update Organization Webhook

```json
{
  "org": "my-org",
  "hook_id": 12345,
  "config": {
    "url": "https://example.com/new-webhook"
  },
  "active": false
}
```

### Delete Organization Webhook

```json
{
  "org": "my-org",
  "hook_id": 12345
}
```

### Create Repository Webhook

```json
{
  "owner": "username",
  "repo": "repository-name",
  "config": {
    "url": "https://example.com/webhook",
    "content_type": "json"
  },
  "events": ["push", "issues"],
  "active": true
}
```

### List Repository Webhooks

```json
{
  "owner": "username",
  "repo": "repository-name"
}
```

### Update Repository Webhook

```json
{
  "owner": "username",
  "repo": "repository-name",
  "hook_id": 12345,
  "events": ["push", "pull_request", "issues"]
}
```

### Delete Repository Webhook

```json
{
  "owner": "username",
  "repo": "repository-name",
  "hook_id": 12345
}
```

## Webhook Events

Common webhook events include:
- `push` - Git push to a repository
- `pull_request` - Pull request activity
- `issues` - Issue activity
- `issue_comment` - Issue comment activity
- `release` - Release activity
- `create` - Branch or tag created
- `delete` - Branch or tag deleted
- `fork` - Repository forked
- `star` - Repository starred
- `watch` - Repository watched

For a complete list of events, see [GitHub Webhook Events Documentation](https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads).

## Development

### Build

```bash
npm run build
```

### Project Structure

```
github-webhooks-mcp-server/
├── src/
│   └── index.ts          # Main server implementation
├── dist/                 # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── README.md
```

## Requirements

- Node.js 18 or higher
- GitHub personal access token with appropriate webhook permissions

## License

MIT