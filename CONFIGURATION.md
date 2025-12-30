# Example MCP Client Configuration

This file shows example configurations for using the GitHub Webhooks MCP Server with various MCP clients.

## Claude Desktop Configuration

Add this to your Claude Desktop config file (`claude_desktop_config.json`):

### macOS/Linux
Location: `~/Library/Application Support/Claude/claude_desktop_config.json`

### Windows
Location: `%APPDATA%\Claude\claude_desktop_config.json`

### Configuration

```json
{
  "mcpServers": {
    "github-webhooks": {
      "command": "node",
      "args": [
        "/absolute/path/to/github-webhooks-mcp-server/dist/index.js"
      ],
      "env": {
        "GITHUB_TOKEN": "your_github_personal_access_token_here"
      }
    }
  }
}
```

## Creating a GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name
4. Select the following scopes:
   - For organization webhooks: `admin:org_hook`
   - For repository webhooks: `admin:repo_hook`
5. Click "Generate token"
6. Copy the token and add it to your configuration

## Security Notes

- **Never commit your GitHub token to version control**
- Store tokens securely using environment variables or secret management tools
- Use tokens with minimal required permissions
- Consider using fine-grained personal access tokens for better security
- Rotate tokens regularly

## Testing the Server

After configuration, restart your MCP client and verify the server is loaded:
1. Check that the server appears in your MCP client's server list
2. Try listing webhooks for a repository you have access to
3. The server logs will appear in stderr (check your MCP client's logs)

## Example Usage

### List Repository Webhooks

```
Can you list all webhooks for the repository owner/repo?
```

### Create a Repository Webhook

```
Create a webhook for repository owner/repo that sends push events to https://example.com/webhook
```

### Update a Webhook

```
Update webhook 12345 in repository owner/repo to also listen for pull_request events
```

### Delete a Webhook

```
Delete webhook 12345 from repository owner/repo
```
