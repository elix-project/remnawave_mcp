# mcp-remnawave

[English](#english) | [Русский](#русский)

---

<a id="english"></a>

## MCP Server for Remnawave Panel

MCP server ([Model Context Protocol](https://modelcontextprotocol.io)) providing LLM clients (Claude Desktop, Cursor, Windsurf, etc.) with tools to manage a [Remnawave](https://github.com/remnawave/) VPN panel.

**Version:** 1.7.0 | **Remnawave panel:** 3.4.4 | **Contract:** `@remnawave/backend-contract` 3.4.15

Requires Remnawave panel 3.4.4. Users are identified by numeric `userId` (not UUID). IP Control tools are replaced by `connections_*`. Keep 1.5.0 for panel 2.8. Node and host write tools send nested API bodies (`configProfile`, `inbound`) instead of flattened fields.

### Features

- **208 tools** — full management of users, nodes, hosts, subscriptions, squads, HWID, config profiles, inbounds, API tokens, billing, snippets, external squads, settings, subscription templates, subscription settings, subscription page configs, node plugins, shared lists, node integrations, node SSH, connections, bandwidth stats, and metadata
- **4 resources** — real-time panel stats, node status, health checks, and per-user details
- **6 prompts** — guided workflows for common tasks
- **Readonly mode** — restrict to 96 read-only tools for safe monitoring
- **Caddy support** — `X-Api-Key` header for panels behind Caddy with custom path
- **Type-safe** — built on [@remnawave/backend-contract](https://www.npmjs.com/package/@remnawave/backend-contract) for API route validation
- **stdio transport** — works with Cursor, Codex, OpenCode, Claude Desktop, Windsurf, and any MCP-compatible client

### Requirements

- Node.js >= 22
- Remnawave panel with API token (Settings > API Tokens)

### Installation

No clone, no build, no local path. Use `npx` in your MCP client.

Optional env vars besides the two required ones: `REMNAWAVE_API_KEY` (Caddy), `REMNAWAVE_READONLY` (`true` for read-only).

#### Cursor

Project: `.cursor/mcp.json`. Global: `~/.cursor/mcp.json`. Or **Cursor Settings → MCP**.

```json
{
  "mcpServers": {
    "remnawave": {
      "command": "npx",
      "args": ["-y", "git+https://github.com/elix-project/remnawave_mcp.git"],
      "env": {
        "REMNAWAVE_BASE_URL": "https://vpn.example.com",
        "REMNAWAVE_API_TOKEN": "your-api-token-here"
      }
    }
  }
}
```

#### Codex

CLI / IDE / ChatGPT desktop share `~/.codex/config.toml` (or project `.codex/config.toml`):

```toml
[mcp_servers.remnawave]
command = "npx"
args = ["-y", "git+https://github.com/elix-project/remnawave_mcp.git"]

[mcp_servers.remnawave.env]
REMNAWAVE_BASE_URL = "https://vpn.example.com"
REMNAWAVE_API_TOKEN = "your-api-token-here"
```

Or:

```bash
codex mcp add remnawave -- npx -y git+https://github.com/elix-project/remnawave_mcp.git
```

Then add the `env` table in `config.toml`. Check with `codex mcp list`.

#### OpenCode

Project: `opencode.json` / `opencode.jsonc`. Global: `~/.config/opencode/opencode.json`.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "remnawave": {
      "type": "local",
      "command": ["npx", "-y", "git+https://github.com/elix-project/remnawave_mcp.git"],
      "environment": {
        "REMNAWAVE_BASE_URL": "https://vpn.example.com",
        "REMNAWAVE_API_TOKEN": "your-api-token-here"
      },
      "enabled": true,
      "timeout": 60000
    }
  }
}
```

`timeout` is in ms. First `npx git+https` fetch can be slow, so 60s is safer than the 5s default.

#### Other clients

| Client | Config file |
|--------|-------------|
| Windsurf | `.windsurf/mcp.json` |
| Claude Desktop | `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) |
| VS Code Copilot | `.vscode/mcp.json` |

Same JSON shape as Cursor (`mcpServers` + `command` / `args` / `env`).

Claude Code:

```bash
claude mcp add remnawave \
  -e REMNAWAVE_BASE_URL=https://vpn.example.com \
  -e REMNAWAVE_API_TOKEN=your-api-token-here \
  -- npx -y git+https://github.com/elix-project/remnawave_mcp.git
```

### Configuration

Same variables can be put in a `.env` file for Docker or local development:

| Variable | Required | Description |
|----------|----------|-------------|
| `REMNAWAVE_BASE_URL` | Yes | Panel URL (e.g. `https://vpn.example.com`) |
| `REMNAWAVE_API_TOKEN` | Yes | API token from panel settings |
| `REMNAWAVE_API_KEY` | No | API key for Caddy reverse proxy authentication |
| `REMNAWAVE_READONLY` | No | Set to `true` to enable readonly mode |

```env
REMNAWAVE_BASE_URL=https://vpn.example.com
REMNAWAVE_API_TOKEN=your-api-token-here
```

### Caddy with Custom Path

If your Remnawave panel is deployed behind [Caddy with a custom path and API key protection](https://docs.remnawave.com/docs/security/caddy-with-custom-path/), set the base URL to include the custom path and provide the API key:

```env
REMNAWAVE_BASE_URL=https://example.com/your-secret-path/api
REMNAWAVE_API_KEY=your-caddy-api-key
```

The `X-Api-Key` header will be added to every request automatically.

### Readonly Mode

Set `REMNAWAVE_READONLY=true` to disable all write operations (create, update, delete, enable, disable, restart, revoke, reset). Only read/list tools will be registered.

Useful for monitoring dashboards or shared environments where you want to prevent accidental changes.

In readonly mode, the available tools are reduced from 208 to 96:

| Category | Available tools |
|----------|----------------|
| Users (9) | `users_list`, `users_stream`, `users_get`, `users_get_by_username`, `users_get_by_short_uuid`, `users_accessible_nodes`, `users_subscription_request_history`, `users_tags_list`, `users_resolve` |
| Nodes (3) | `nodes_list`, `nodes_get`, `nodes_tags_list` |
| Hosts (3) | `hosts_list`, `hosts_get`, `hosts_tags_list` |
| System (13) | all tools (read-only by nature) |
| Subscriptions (10) | all tools (read-only by nature) |
| Config Profiles & Inbounds (6) | `config_profiles_list`, `config_profiles_get`, `inbounds_list`, `config_profiles_get_inbounds`, `config_profiles_tags_list`, `config_profiles_get_computed_config` |
| Internal Squads (4) | `squads_list`, `squads_get`, `squads_tags_list`, `squads_accessible_nodes` |
| HWID (4) | `hwid_devices_list`, `hwid_devices_list_all`, `hwid_stats`, `hwid_top_users` |
| API Tokens (2) | `api_tokens_list`, `api_tokens_scopes` |
| Keygen (1) | `keygen_get` |
| Infra Billing (4) | `billing_providers_list`, `billing_provider_get`, `billing_nodes_list`, `billing_history_list` |
| Snippets (1) | `snippets_list` |
| External Squads (3) | `external_squads_list`, `external_squads_get`, `external_squads_tags_list` |
| Settings (1) | `settings_get` |
| Sub Page Configs (3) | `sub_page_configs_list`, `sub_page_configs_get`, `sub_page_configs_tags_list` |
| Node Plugins (7) | `node_plugins_list`, `node_plugins_get`, `node_plugins_torrent_reports`, `node_plugins_torrent_stats`, `node_plugins_tags_list`, `shared_lists_list`, `shared_lists_get` |
| Connections (6) | `connections_by_user`, `connections_by_user_result`, `connections_by_node`, `connections_by_node_result`, `connections_geocheck`, `connections_geocheck_result` |
| Subscription Templates (3) | `subscription_templates_list`, `subscription_templates_get`, `subscription_templates_tags_list` |
| Subscription Settings (1) | `subscription_settings_get` |
| Bandwidth Stats (8) | `bandwidth_nodes`, `bandwidth_nodes_realtime`, `bandwidth_node_users`, `bandwidth_nodes_users`, `bandwidth_user`, `bandwidth_nodes_usage`, `bandwidth_squad_usage`, `bandwidth_squad_user_usage` |
| Metadata (2) | `metadata_node_get`, `metadata_user_get` |
| Node Integrations (2) | `node_integrations_list`, `node_integrations_get` |

### Docker

```bash
docker compose up -d
```

Environment variables are passed via `.env` file or `docker-compose.yml`.

### Development (from source)

```bash
git clone https://github.com/elix-project/remnawave_mcp.git
cd remnawave_mcp
npm install
npm run build
```

After changing TypeScript sources, run `npm run build` and commit the updated `dist/index.js` so `npx git+https://...` keeps working.

### Available Tools

#### Users (27 tools)

| Tool | Description | Mode |
|------|-------------|------|
| `users_list` | List all users with pagination | read |
| `users_stream` | List users with cursor pagination | read |
| `users_get` | Get user by numeric ID | read |
| `users_get_by_username` | Get user by username | read |
| `users_get_by_short_uuid` | Get user by short UUID | read |
| `users_accessible_nodes` | Get nodes accessible to a user | read |
| `users_subscription_request_history` | Get user subscription request history | read |
| `users_tags_list` | List all user tags | read |
| `users_resolve` | Resolve users by ID, short UUID, or username | read |
| `users_create` | Create a new user | write |
| `users_update` | Update user settings | write |
| `users_delete` | Delete a user | write |
| `users_enable` | Enable a disabled user | write |
| `users_disable` | Disable a user | write |
| `users_revoke_subscription` | Revoke subscription (regenerate link) | write |
| `users_reset_traffic` | Reset traffic counter | write |
| `users_extend_expiration` | Extend a single user expiration | write |
| `users_bulk_delete_by_status` | Bulk delete users by status | write |
| `users_bulk_update` | Bulk update users | write |
| `users_bulk_reset_traffic` | Bulk reset traffic | write |
| `users_bulk_revoke_subscription` | Bulk revoke subscriptions | write |
| `users_bulk_delete` | Bulk delete users | write |
| `users_bulk_update_squads` | Bulk update user squads | write |
| `users_bulk_extend_expiration` | Bulk extend expiration dates | write |
| `users_bulk_all_update` | Bulk update all users | write |
| `users_bulk_all_reset_traffic` | Bulk reset all users traffic | write |
| `users_bulk_all_extend_expiration` | Bulk extend all users expiration | write |

#### Nodes (15 tools)

| Tool | Description | Mode |
|------|-------------|------|
| `nodes_list` | List all nodes | read |
| `nodes_get` | Get node by UUID | read |
| `nodes_tags_list` | List all node tags | read |
| `nodes_create` | Create a new node | write |
| `nodes_update` | Update node settings | write |
| `nodes_delete` | Delete a node | write |
| `nodes_enable` | Enable a node | write |
| `nodes_disable` | Disable a node | write |
| `nodes_restart` | Restart a specific node | write |
| `nodes_restart_all` | Restart all nodes | write |
| `nodes_reset_traffic` | Reset node traffic counter | write |
| `nodes_reorder` | Reorder nodes | write |
| `nodes_bulk_profile_modification` | Bulk modify node profiles (`uuids` + nested `configProfile`) | write |
| `nodes_bulk_actions` | Bulk node actions | write |
| `nodes_bulk_update` | Bulk update nodes | write |

#### Hosts (12 tools)

| Tool | Description | Mode |
|------|-------------|------|
| `hosts_list` | List all hosts | read |
| `hosts_get` | Get host by UUID | read |
| `hosts_tags_list` | List all host tags | read |
| `hosts_create` | Create a new host | write |
| `hosts_update` | Update host settings | write |
| `hosts_delete` | Delete a host | write |
| `hosts_reorder` | Reorder hosts | write |
| `hosts_clone` | Clone a host | write |
| `hosts_bulk_enable` | Bulk enable hosts | write |
| `hosts_bulk_disable` | Bulk disable hosts | write |
| `hosts_bulk_delete` | Bulk delete hosts | write |
| `hosts_bulk_update` | Bulk update hosts (port, inbound, and other fields) | write |

#### System (13 tools)

| Tool | Description | Mode |
|------|-------------|------|
| `system_stats` | Panel statistics (users, nodes, traffic, CPU, memory) | read |
| `system_bandwidth_stats` | Bandwidth statistics | read |
| `system_nodes_metrics` | Node metrics | read |
| `system_nodes_statistics` | Node statistics | read |
| `system_health` | Panel health check | read |
| `system_metadata` | Panel version and metadata | read |
| `system_generate_x25519` | Generate X25519 key pair | read |
| `auth_status` | Check authentication status | read |
| `system_stats_recap` | System statistics recap | read |
| `system_configuration` | Panel configuration flags | read |
| `system_stats_digest` | Aggregated stats digest for a datetime range | read |
| `system_stats_http` | HTTP route usage statistics | read |
| `system_srr_matcher` | Test SRR routing rules | read |

#### Subscriptions (10 tools)

| Tool | Description | Mode |
|------|-------------|------|
| `subscriptions_list` | List all subscriptions | read |
| `subscriptions_get_by_user_id` | Get subscription by user numeric ID | read |
| `subscriptions_get_by_username` | Get subscription by username | read |
| `subscriptions_get_by_short_uuid` | Get subscription by short UUID | read |
| `subscriptions_get_raw_by_short_uuid` | Get raw subscription by short UUID | read |
| `subscriptions_get_subpage_config` | Get subscription subpage config | read |
| `subscriptions_get_connection_keys` | Get connection keys by user ID | read |
| `subscription_info` | Get subscription info | read |
| `subscription_request_history_list` | Subscription request history | read |
| `subscription_request_history_stats` | Subscription request history stats | read |

#### Config Profiles & Inbounds (11 tools)

| Tool | Description | Mode |
|------|-------------|------|
| `config_profiles_list` | List config profiles | read |
| `config_profiles_get` | Get config profile by UUID | read |
| `inbounds_list` | List all inbounds | read |
| `config_profiles_get_inbounds` | Get inbounds by profile UUID | read |
| `config_profiles_tags_list` | List config profile tags | read |
| `config_profiles_get_computed_config` | Get computed config by profile UUID | read |
| `config_profiles_create` | Create config profile | write |
| `config_profiles_update` | Update config profile name and/or core Xray/sing-box config | write |
| `config_profiles_delete` | Delete config profile | write |
| `config_profiles_tags_set` | Set config profile tags | write |
| `config_profiles_reorder` | Reorder config profiles | write |

#### Internal Squads (13 tools)

| Tool | Description | Mode |
|------|-------------|------|
| `squads_list` | List all squads | read |
| `squads_get` | Get squad by UUID | read |
| `squads_tags_list` | List squad tags | read |
| `squads_accessible_nodes` | Get squad accessible nodes | read |
| `squads_create` | Create a squad | write |
| `squads_update` | Update a squad name and/or inbound list | write |
| `squads_delete` | Delete a squad | write |
| `squads_add_users` | Add selected users to a squad | write |
| `squads_remove_users` | Remove selected users from a squad | write |
| `squads_add_all_users` | Add all users to a squad | write |
| `squads_remove_all_users` | Remove all users from a squad | write |
| `squads_tags_set` | Set squad tags | write |
| `squads_reorder` | Reorder squads | write |

#### HWID Devices (7 tools)

| Tool | Description | Mode |
|------|-------------|------|
| `hwid_devices_list` | List user's HWID devices | read |
| `hwid_devices_list_all` | List all HWID devices | read |
| `hwid_stats` | Get HWID statistics | read |
| `hwid_top_users` | Get top users by devices | read |
| `hwid_device_create` | Create HWID device | write |
| `hwid_device_delete` | Delete a specific device | write |
| `hwid_devices_delete_all` | Delete all user's devices | write |

#### API Tokens (5 tools)

| Tool | Description | Mode |
|------|-------------|------|
| `api_tokens_list` | List API tokens | read |
| `api_tokens_scopes` | List available API token scopes | read |
| `api_tokens_ott` | Create a short-lived backend-tools token | write |
| `api_tokens_create` | Create API token | write |
| `api_tokens_delete` | Delete API token | write |

#### Keygen (1 tool)

| Tool | Description | Mode |
|------|-------------|------|
| `keygen_get` | Get keygen data | read |

#### Infra Billing (12 tools)

| Tool | Description | Mode |
|------|-------------|------|
| `billing_providers_list` | List billing providers | read |
| `billing_provider_get` | Get billing provider by UUID | read |
| `billing_nodes_list` | List billing nodes | read |
| `billing_history_list` | List billing history | read |
| `billing_provider_create` | Create billing provider | write |
| `billing_provider_update` | Update billing provider | write |
| `billing_provider_delete` | Delete billing provider | write |
| `billing_node_create` | Create billing node | write |
| `billing_node_update` | Update billing node | write |
| `billing_node_delete` | Delete billing node | write |
| `billing_history_create` | Create billing history entry | write |
| `billing_history_delete` | Delete billing history entry | write |

#### Snippets (5 tools)

| Tool | Description | Mode |
|------|-------------|------|
| `snippets_list` | List snippets | read |
| `snippets_create` | Create snippet | write |
| `snippets_update` | Update snippet | write |
| `snippets_delete` | Delete snippet | write |
| `snippets_sync` | Sync snippet to referencing config profiles | write |

#### External Squads (10 tools)

| Tool | Description | Mode |
|------|-------------|------|
| `external_squads_list` | List external squads | read |
| `external_squads_get` | Get external squad by UUID | read |
| `external_squads_tags_list` | List external squad tags | read |
| `external_squads_create` | Create external squad | write |
| `external_squads_update` | Update external squad | write |
| `external_squads_delete` | Delete external squad | write |
| `external_squads_add_users` | Add all users to external squad | write |
| `external_squads_remove_users` | Remove all users from external squad | write |
| `external_squads_tags_set` | Set external squad tags | write |
| `external_squads_reorder` | Reorder external squads | write |

#### Settings (2 tools)

| Tool | Description | Mode |
|------|-------------|------|
| `settings_get` | Get panel settings | read |
| `settings_update` | Update panel settings | write |

#### Subscription Templates (8 tools)

| Tool | Description | Mode |
|------|-------------|------|
| `subscription_templates_list` | List subscription templates | read |
| `subscription_templates_get` | Get subscription template by UUID | read |
| `subscription_templates_tags_list` | List subscription template tags | read |
| `subscription_templates_create` | Create subscription template | write |
| `subscription_templates_update` | Update subscription template | write |
| `subscription_templates_delete` | Delete subscription template | write |
| `subscription_templates_tags_set` | Set subscription template tags | write |
| `subscription_templates_reorder` | Reorder subscription templates | write |

#### Subscription Settings (2 tools)

| Tool | Description | Mode |
|------|-------------|------|
| `subscription_settings_get` | Get subscription settings | read |
| `subscription_settings_update` | Update subscription settings | write |

#### Bandwidth Stats (8 tools)

| Tool | Description | Mode |
|------|-------------|------|
| `bandwidth_nodes` | Bandwidth usage across nodes | read |
| `bandwidth_nodes_realtime` | Realtime node bandwidth | read |
| `bandwidth_node_users` | Bandwidth by users on a node | read |
| `bandwidth_nodes_users` | Bandwidth by users across nodes | read |
| `bandwidth_user` | Bandwidth usage for a user | read |
| `bandwidth_nodes_usage` | Users exceeding a traffic threshold on selected nodes | read |
| `bandwidth_squad_usage` | Per-user bandwidth for an internal squad | read |
| `bandwidth_squad_user_usage` | Per-node daily bandwidth for a user in a squad | read |

#### Subscription Page Configs (9 tools)

| Tool | Description | Mode |
|------|-------------|------|
| `sub_page_configs_list` | List subscription page configs | read |
| `sub_page_configs_get` | Get subscription page config | read |
| `sub_page_configs_tags_list` | List subscription page config tags | read |
| `sub_page_configs_create` | Create subscription page config | write |
| `sub_page_configs_update` | Update subscription page config name and/or config payload | write |
| `sub_page_configs_delete` | Delete subscription page config | write |
| `sub_page_configs_reorder` | Reorder subscription page configs | write |
| `sub_page_configs_tags_set` | Set subscription page config tags | write |
| `sub_page_configs_clone` | Clone subscription page config | write |

#### Node Plugins (20 tools)

| Tool | Description | Mode |
|------|-------------|------|
| `node_plugins_list` | List node plugins | read |
| `node_plugins_get` | Get node plugin by UUID | read |
| `node_plugins_torrent_reports` | Get torrent blocker reports | read |
| `node_plugins_torrent_stats` | Get torrent blocker stats | read |
| `node_plugins_tags_list` | List node plugin tags | read |
| `shared_lists_list` | List shared lists | read |
| `shared_lists_get` | Get a shared list by name | read |
| `node_plugins_create` | Create node plugin | write |
| `node_plugins_update` | Update node plugin name and/or pluginConfig | write |
| `node_plugins_delete` | Delete node plugin | write |
| `node_plugins_reorder` | Reorder node plugins | write |
| `node_plugins_sync` | Sync plugin config to nodes | write |
| `node_plugins_tags_set` | Set node plugin tags | write |
| `shared_lists_create` | Create shared list | write |
| `shared_lists_update` | Update shared list config | write |
| `shared_lists_delete` | Delete shared list | write |
| `shared_lists_sync` | Sync shared list to nodes | write |
| `node_plugins_clone` | Clone node plugin | write |
| `node_plugins_execute` | Execute node plugin | write |
| `node_plugins_torrent_truncate` | Truncate torrent blocker reports | write |

#### Connections (7 tools)

| Tool | Description | Mode |
|------|-------------|------|
| `connections_by_user` | Start async job to fetch user connections | read |
| `connections_by_user_result` | Get user connections job result | read |
| `connections_by_node` | Start async job to fetch node connections | read |
| `connections_by_node_result` | Get node connections job result | read |
| `connections_geocheck` | Start async node geocheck job | read |
| `connections_geocheck_result` | Get node geocheck job result | read |
| `connections_drop` | Drop connections by IP or user IDs | write |

#### Metadata (4 tools)

| Tool | Description | Mode |
|------|-------------|------|
| `metadata_node_get` | Get node metadata | read |
| `metadata_user_get` | Get user metadata | read |
| `metadata_node_upsert` | Upsert node metadata | write |
| `metadata_user_upsert` | Upsert user metadata | write |

#### Node Integrations (5 tools)

| Tool | Description | Mode |
|------|-------------|------|
| `node_integrations_list` | List node integrations | read |
| `node_integrations_get` | Get node integration by UUID | read |
| `node_integrations_create` | Create node integration | write |
| `node_integrations_update` | Update node integration | write |
| `node_integrations_delete` | Delete node integration | write |

#### Node SSH (2 tools)

| Tool | Description | Mode |
|------|-------------|------|
| `node_ssh_create_ticket` | Create a single-use SSH terminal ticket | write |
| `node_ssh_evaluate_vault` | Evaluate the node SSH key vault | write |

### Resources

| URI | Description |
|-----|-------------|
| `remnawave://stats` | Current panel statistics |
| `remnawave://nodes` | All nodes status |
| `remnawave://health` | Panel health status |
| `remnawave://users/{userId}` | Specific user details |

### Prompts

| Prompt | Description |
|--------|-------------|
| `create_user_wizard` | Step-by-step user creation guide |
| `node_diagnostics` | Node troubleshooting |
| `traffic_report` | Traffic usage report |
| `user_audit` | Complete user audit |
| `edit_config_profile` | Edit a config profile core config |
| `bulk_user_cleanup` | Find and manage expired users |

### Example Queries

```
"Show me all users with expired subscriptions"
"Create user vasya with 50 GB limit for one month"
"Restart node amsterdam-01"
"Give me a traffic report for the last week"
"Disable users who exceeded their traffic limit"
"Which nodes are offline right now?"
"Show billing history"
"List all node plugins"
"Get IP connections for user X"
"Edit the Xray inbounds in config profile Default"
```

### Project Structure

```
src/
├── index.ts                       # Entry point (stdio transport)
├── server.ts                      # McpServer setup
├── config.ts                      # Environment config
├── client/
│   └── index.ts                   # Remnawave HTTP client
├── tools/
│   ├── helpers.ts                 # Result formatting helpers
│   ├── index.ts                   # Tool registration
│   ├── users.ts                   # User management (27 tools)
│   ├── nodes.ts                   # Node management (15 tools)
│   ├── hosts.ts                   # Host management (12 tools)
│   ├── bandwidth-stats.ts        # Bandwidth stats (8 tools)
│   ├── system.ts                  # System & auth (13 tools)
│   ├── subscriptions.ts           # Subscriptions (10 tools)
│   ├── inbounds.ts                # Config profiles & inbounds (11 tools)
│   ├── squads.ts                  # Internal squads (13 tools)
│   ├── hwid.ts                    # HWID devices (7 tools)
│   ├── infra-billing.ts           # Infrastructure billing (12 tools)
│   ├── node-plugins.ts            # Node plugins & shared lists (20 tools)
│   ├── external-squads.ts         # External squads (10 tools)
│   ├── subscription-page-configs.ts # Subscription page configs (9 tools)
│   ├── connections.ts             # Connections & geocheck (7 tools)
│   ├── node-integrations.ts       # Node integrations (5 tools)
│   ├── node-ssh.ts                # Node SSH tickets (2 tools)
│   ├── snippets.ts                # Snippets (5 tools)
│   ├── metadata.ts                # Node & user metadata (4 tools)
│   ├── api-tokens.ts              # API tokens (5 tools)
│   ├── subscription-templates.ts # Subscription templates (8 tools)
│   ├── subscription-settings.ts  # Subscription settings (2 tools)
│   ├── settings.ts                # Panel settings (2 tools)
│   └── keygen.ts                  # Keygen (1 tool)
├── resources/
│   └── index.ts                   # MCP resources
└── prompts/
    └── index.ts                   # MCP prompts
```

### License

MIT

---

<a id="русский"></a>

## MCP-сервер для Remnawave Panel

MCP-сервер ([Model Context Protocol](https://modelcontextprotocol.io)), предоставляющий LLM-клиентам (Claude Desktop, Cursor, Windsurf и др.) инструменты для управления VPN-панелью [Remnawave](https://github.com/remnawave/).

**Версия:** 1.7.0 | **Панель Remnawave:** 3.4.4 | **Контракт:** `@remnawave/backend-contract` 3.4.15

Нужна панель Remnawave 3.4.4. Пользователи идентифицируются числовым `userId` (не UUID). IP Control заменён на `connections_*`. Для панели 2.8 оставайтесь на 1.5.0. Write-инструменты нод и хостов отправляют вложенные тела API (`configProfile`, `inbound`), а не плоские поля.

### Возможности

- **208 инструментов** — полное управление пользователями, нодами, хостами, подписками, группами, HWID, конфиг-профилями, inbounds, API-токенами, биллингом, сниппетами, внешними группами, настройками, шаблонами подписок, настройками подписок, страницами подписок, плагинами нод, shared lists, интеграциями нод, SSH нод, соединениями, статистикой bandwidth и метаданными
- **4 ресурса** — статистика панели, статус нод, проверка здоровья и данные пользователя
- **6 промптов** — пошаговые сценарии для типичных задач
- **Readonly-режим** — ограничение до 96 инструментов только для чтения
- **Поддержка Caddy** — заголовок `X-Api-Key` для панелей за Caddy с кастомным путём
- **Type-safe** — построен на [@remnawave/backend-contract](https://www.npmjs.com/package/@remnawave/backend-contract) для валидации API-маршрутов
- **stdio транспорт** — работает с Cursor, Codex, OpenCode, Claude Desktop, Windsurf и любым MCP-совместимым клиентом

### Требования

- Node.js >= 22
- Remnawave панель с API-токеном (Настройки > API Tokens)

### Установка

Клонировать репозиторий и собирать ничего не нужно. В MCP-клиенте достаточно `npx`.

Необязательные переменные кроме двух обязательных: `REMNAWAVE_API_KEY` (Caddy), `REMNAWAVE_READONLY` (`true` для режима только чтения).

#### Cursor

Проект: `.cursor/mcp.json`. Глобально: `~/.cursor/mcp.json`. Или **Settings → MCP**.

```json
{
  "mcpServers": {
    "remnawave": {
      "command": "npx",
      "args": ["-y", "git+https://github.com/elix-project/remnawave_mcp.git"],
      "env": {
        "REMNAWAVE_BASE_URL": "https://vpn.example.com",
        "REMNAWAVE_API_TOKEN": "ваш-api-токен"
      }
    }
  }
}
```

#### Codex

CLI / IDE / ChatGPT desktop читают `~/.codex/config.toml` (или проектный `.codex/config.toml`):

```toml
[mcp_servers.remnawave]
command = "npx"
args = ["-y", "git+https://github.com/elix-project/remnawave_mcp.git"]

[mcp_servers.remnawave.env]
REMNAWAVE_BASE_URL = "https://vpn.example.com"
REMNAWAVE_API_TOKEN = "ваш-api-токен"
```

Или:

```bash
codex mcp add remnawave -- npx -y git+https://github.com/elix-project/remnawave_mcp.git
```

Потом допишите таблицу `env` в `config.toml`. Проверка: `codex mcp list`.

#### OpenCode

Проект: `opencode.json` / `opencode.jsonc`. Глобально: `~/.config/opencode/opencode.json`.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "remnawave": {
      "type": "local",
      "command": ["npx", "-y", "git+https://github.com/elix-project/remnawave_mcp.git"],
      "environment": {
        "REMNAWAVE_BASE_URL": "https://vpn.example.com",
        "REMNAWAVE_API_TOKEN": "ваш-api-токен"
      },
      "enabled": true,
      "timeout": 60000
    }
  }
}
```

`timeout` в миллисекундах. Первый `npx git+https` может быть долгим, 60 с надёжнее дефолтных 5 с.

#### Другие клиенты

| Клиент | Файл конфигурации |
|--------|-------------------|
| Windsurf | `.windsurf/mcp.json` |
| Claude Desktop | `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) |
| VS Code Copilot | `.vscode/mcp.json` |

Тот же JSON, что у Cursor (`mcpServers` + `command` / `args` / `env`).

Claude Code:

```bash
claude mcp add remnawave \
  -e REMNAWAVE_BASE_URL=https://vpn.example.com \
  -e REMNAWAVE_API_TOKEN=ваш-api-токен \
  -- npx -y git+https://github.com/elix-project/remnawave_mcp.git
```

### Конфигурация

Те же переменные можно положить в `.env` для Docker или локальной разработки:

| Переменная | Обязательная | Описание |
|------------|-------------|----------|
| `REMNAWAVE_BASE_URL` | Да | URL панели (например `https://vpn.example.com`) |
| `REMNAWAVE_API_TOKEN` | Да | API-токен из настроек панели |
| `REMNAWAVE_API_KEY` | Нет | API-ключ для аутентификации через Caddy reverse proxy |
| `REMNAWAVE_READONLY` | Нет | `true` для включения режима только чтения |

```env
REMNAWAVE_BASE_URL=https://vpn.example.com
REMNAWAVE_API_TOKEN=ваш-api-токен
```

### Caddy с кастомным путём

Если ваша панель Remnawave развёрнута за [Caddy с кастомным путём и защитой API-ключом](https://docs.remnawave.com/docs/security/caddy-with-custom-path/), укажите полный путь в base URL и предоставьте API-ключ:

```env
REMNAWAVE_BASE_URL=https://example.com/your-secret-path/api
REMNAWAVE_API_KEY=ваш-caddy-api-ключ
```

Заголовок `X-Api-Key` будет автоматически добавляться к каждому запросу.

### Режим Readonly

Установите `REMNAWAVE_READONLY=true`, чтобы отключить все операции записи (создание, обновление, удаление, включение, отключение, перезапуск, отзыв, сброс). Будут зарегистрированы только инструменты чтения.

Полезно для мониторинговых дашбордов или общих окружений, где нужно исключить случайные изменения.

В readonly-режиме количество доступных инструментов сокращается с 208 до 96:

| Категория | Доступные инструменты |
|-----------|----------------------|
| Пользователи (9) | `users_list`, `users_stream`, `users_get`, `users_get_by_username`, `users_get_by_short_uuid`, `users_accessible_nodes`, `users_subscription_request_history`, `users_tags_list`, `users_resolve` |
| Ноды (3) | `nodes_list`, `nodes_get`, `nodes_tags_list` |
| Хосты (3) | `hosts_list`, `hosts_get`, `hosts_tags_list` |
| Система (13) | все инструменты (только чтение по природе) |
| Подписки (10) | все инструменты (только чтение по природе) |
| Конфиг-профили и Inbounds (6) | `config_profiles_list`, `config_profiles_get`, `inbounds_list`, `config_profiles_get_inbounds`, `config_profiles_tags_list`, `config_profiles_get_computed_config` |
| Внутренние группы (4) | `squads_list`, `squads_get`, `squads_tags_list`, `squads_accessible_nodes` |
| HWID (4) | `hwid_devices_list`, `hwid_devices_list_all`, `hwid_stats`, `hwid_top_users` |
| API-токены (2) | `api_tokens_list`, `api_tokens_scopes` |
| Keygen (1) | `keygen_get` |
| Биллинг (4) | `billing_providers_list`, `billing_provider_get`, `billing_nodes_list`, `billing_history_list` |
| Сниппеты (1) | `snippets_list` |
| Внешние группы (3) | `external_squads_list`, `external_squads_get`, `external_squads_tags_list` |
| Настройки (1) | `settings_get` |
| Страницы подписок (3) | `sub_page_configs_list`, `sub_page_configs_get`, `sub_page_configs_tags_list` |
| Плагины нод (7) | `node_plugins_list`, `node_plugins_get`, `node_plugins_torrent_reports`, `node_plugins_torrent_stats`, `node_plugins_tags_list`, `shared_lists_list`, `shared_lists_get` |
| Соединения (6) | `connections_by_user`, `connections_by_user_result`, `connections_by_node`, `connections_by_node_result`, `connections_geocheck`, `connections_geocheck_result` |
| Шаблоны подписок (3) | `subscription_templates_list`, `subscription_templates_get`, `subscription_templates_tags_list` |
| Настройки подписок (1) | `subscription_settings_get` |
| Bandwidth Stats (8) | `bandwidth_nodes`, `bandwidth_nodes_realtime`, `bandwidth_node_users`, `bandwidth_nodes_users`, `bandwidth_user`, `bandwidth_nodes_usage`, `bandwidth_squad_usage`, `bandwidth_squad_user_usage` |
| Метаданные (2) | `metadata_node_get`, `metadata_user_get` |
| Интеграции нод (2) | `node_integrations_list`, `node_integrations_get` |

### Docker

```bash
docker compose up -d
```

Переменные окружения передаются через `.env` файл или `docker-compose.yml`.

### Разработка (из исходников)

```bash
git clone https://github.com/elix-project/remnawave_mcp.git
cd remnawave_mcp
npm install
npm run build
```

После изменений в TypeScript запустите `npm run build` и закоммитьте обновлённый `dist/index.js`, чтобы `npx git+https://...` продолжал работать.

### Доступные инструменты

#### Пользователи (27 инструментов)

| Инструмент | Описание | Режим |
|------------|----------|-------|
| `users_list` | Список пользователей с пагинацией | read |
| `users_stream` | Список пользователей с cursor-пагинацией | read |
| `users_get` | Получить пользователя по числовому ID | read |
| `users_get_by_username` | Получить пользователя по username | read |
| `users_get_by_short_uuid` | Получить пользователя по short UUID | read |
| `users_accessible_nodes` | Ноды, доступные пользователю | read |
| `users_subscription_request_history` | История запросов подписки пользователя | read |
| `users_tags_list` | Список тегов пользователей | read |
| `users_resolve` | Поиск пользователей по ID, short UUID или username | read |
| `users_create` | Создать нового пользователя | write |
| `users_update` | Обновить настройки пользователя | write |
| `users_delete` | Удалить пользователя | write |
| `users_enable` | Включить пользователя | write |
| `users_disable` | Отключить пользователя | write |
| `users_revoke_subscription` | Отозвать подписку (перегенерировать ссылку) | write |
| `users_reset_traffic` | Сбросить счётчик трафика | write |
| `users_extend_expiration` | Продлить срок одного пользователя | write |
| `users_bulk_delete_by_status` | Массовое удаление по статусу | write |
| `users_bulk_update` | Массовое обновление | write |
| `users_bulk_reset_traffic` | Массовый сброс трафика | write |
| `users_bulk_revoke_subscription` | Массовый отзыв подписок | write |
| `users_bulk_delete` | Массовое удаление | write |
| `users_bulk_update_squads` | Массовое обновление групп | write |
| `users_bulk_extend_expiration` | Массовое продление срока | write |
| `users_bulk_all_update` | Обновить всех пользователей | write |
| `users_bulk_all_reset_traffic` | Сбросить трафик всех пользователей | write |
| `users_bulk_all_extend_expiration` | Продлить срок всех пользователей | write |

#### Ноды (15 инструментов)

| Инструмент | Описание | Режим |
|------------|----------|-------|
| `nodes_list` | Список всех нод | read |
| `nodes_get` | Получить ноду по UUID | read |
| `nodes_tags_list` | Список тегов нод | read |
| `nodes_create` | Создать новую ноду | write |
| `nodes_update` | Обновить настройки ноды | write |
| `nodes_delete` | Удалить ноду | write |
| `nodes_enable` | Включить ноду | write |
| `nodes_disable` | Отключить ноду | write |
| `nodes_restart` | Перезапустить ноду | write |
| `nodes_restart_all` | Перезапустить все ноды | write |
| `nodes_reset_traffic` | Сбросить трафик ноды | write |
| `nodes_reorder` | Переупорядочить ноды | write |
| `nodes_bulk_profile_modification` | Массовое изменение профилей нод (`uuids` + вложенный `configProfile`) | write |
| `nodes_bulk_actions` | Массовые действия с нодами | write |
| `nodes_bulk_update` | Массовое обновление нод | write |

#### Хосты (12 инструментов)

| Инструмент | Описание | Режим |
|------------|----------|-------|
| `hosts_list` | Список всех хостов | read |
| `hosts_get` | Получить хост по UUID | read |
| `hosts_tags_list` | Список тегов хостов | read |
| `hosts_create` | Создать новый хост | write |
| `hosts_update` | Обновить настройки хоста | write |
| `hosts_delete` | Удалить хост | write |
| `hosts_reorder` | Изменить порядок хостов | write |
| `hosts_clone` | Клонировать хост | write |
| `hosts_bulk_enable` | Массовое включение хостов | write |
| `hosts_bulk_disable` | Массовое отключение хостов | write |
| `hosts_bulk_delete` | Массовое удаление хостов | write |
| `hosts_bulk_update` | Массовое обновление хостов (порт, inbound и др.) | write |

#### Система (13 инструментов)

| Инструмент | Описание | Режим |
|------------|----------|-------|
| `system_stats` | Статистика панели (пользователи, ноды, трафик, CPU, память) | read |
| `system_bandwidth_stats` | Статистика пропускной способности | read |
| `system_nodes_metrics` | Метрики нод | read |
| `system_nodes_statistics` | Статистика нод | read |
| `system_health` | Проверка здоровья панели | read |
| `system_metadata` | Версия и метаданные панели | read |
| `system_generate_x25519` | Генерация пары ключей X25519 | read |
| `auth_status` | Проверка статуса аутентификации | read |
| `system_stats_recap` | Обзор статистики | read |
| `system_configuration` | Конфигурация панели | read |
| `system_stats_digest` | Сводка статистики за период | read |
| `system_stats_http` | Статистика HTTP-маршрутов | read |
| `system_srr_matcher` | Тест SRR-правил маршрутизации | read |

#### Подписки (10 инструментов)

| Инструмент | Описание | Режим |
|------------|----------|-------|
| `subscriptions_list` | Список всех подписок | read |
| `subscriptions_get_by_user_id` | Подписка по числовому ID пользователя | read |
| `subscriptions_get_by_username` | Подписка по username | read |
| `subscriptions_get_by_short_uuid` | Подписка по short UUID | read |
| `subscriptions_get_raw_by_short_uuid` | Сырая подписка по short UUID | read |
| `subscriptions_get_subpage_config` | Конфиг субстраницы подписки | read |
| `subscriptions_get_connection_keys` | Ключи подключения по ID пользователя | read |
| `subscription_info` | Информация о подписке | read |
| `subscription_request_history_list` | История запросов подписок | read |
| `subscription_request_history_stats` | Статистика запросов подписок | read |

#### Конфиг-профили и Inbounds (11 инструментов)

| Инструмент | Описание | Режим |
|------------|----------|-------|
| `config_profiles_list` | Список конфиг-профилей | read |
| `config_profiles_get` | Получить конфиг-профиль по UUID | read |
| `inbounds_list` | Список всех inbounds | read |
| `config_profiles_get_inbounds` | Inbounds по UUID профиля | read |
| `config_profiles_tags_list` | Список тегов конфиг-профилей | read |
| `config_profiles_get_computed_config` | Вычисленный конфиг по UUID профиля | read |
| `config_profiles_create` | Создать конфиг-профиль | write |
| `config_profiles_update` | Обновить имя и/или core-конфиг (Xray/sing-box) профиля | write |
| `config_profiles_delete` | Удалить конфиг-профиль | write |
| `config_profiles_tags_set` | Задать теги конфиг-профиля | write |
| `config_profiles_reorder` | Переупорядочить конфиг-профили | write |

#### Внутренние группы (13 инструментов)

| Инструмент | Описание | Режим |
|------------|----------|-------|
| `squads_list` | Список групп | read |
| `squads_get` | Получить группу по UUID | read |
| `squads_tags_list` | Список тегов групп | read |
| `squads_accessible_nodes` | Доступные ноды группы | read |
| `squads_create` | Создать группу | write |
| `squads_update` | Обновить имя и/или список inbound группы | write |
| `squads_delete` | Удалить группу | write |
| `squads_add_users` | Добавить выбранных пользователей в группу | write |
| `squads_remove_users` | Убрать выбранных пользователей из группы | write |
| `squads_add_all_users` | Добавить всех пользователей в группу | write |
| `squads_remove_all_users` | Убрать всех пользователей из группы | write |
| `squads_tags_set` | Задать теги группы | write |
| `squads_reorder` | Изменить порядок групп | write |

#### HWID-устройства (7 инструментов)

| Инструмент | Описание | Режим |
|------------|----------|-------|
| `hwid_devices_list` | Список устройств пользователя | read |
| `hwid_devices_list_all` | Список всех устройств | read |
| `hwid_stats` | Статистика HWID | read |
| `hwid_top_users` | Топ пользователей по устройствам | read |
| `hwid_device_create` | Создать HWID-устройство | write |
| `hwid_device_delete` | Удалить конкретное устройство | write |
| `hwid_devices_delete_all` | Удалить все устройства пользователя | write |

#### API-токены (5 инструментов)

| Инструмент | Описание | Режим |
|------------|----------|-------|
| `api_tokens_list` | Список API-токенов | read |
| `api_tokens_scopes` | Список доступных scope API-токенов | read |
| `api_tokens_ott` | Создать короткоживущий токен backend-tools | write |
| `api_tokens_create` | Создать API-токен | write |
| `api_tokens_delete` | Удалить API-токен | write |

#### Keygen (1 инструмент)

| Инструмент | Описание | Режим |
|------------|----------|-------|
| `keygen_get` | Получить данные keygen | read |

#### Биллинг инфраструктуры (12 инструментов)

| Инструмент | Описание | Режим |
|------------|----------|-------|
| `billing_providers_list` | Список провайдеров биллинга | read |
| `billing_provider_get` | Получить провайдера по UUID | read |
| `billing_nodes_list` | Список биллинговых нод | read |
| `billing_history_list` | История биллинга | read |
| `billing_provider_create` | Создать провайдера | write |
| `billing_provider_update` | Обновить провайдера | write |
| `billing_provider_delete` | Удалить провайдера | write |
| `billing_node_create` | Создать биллинговую ноду | write |
| `billing_node_update` | Обновить биллинговую ноду | write |
| `billing_node_delete` | Удалить биллинговую ноду | write |
| `billing_history_create` | Создать запись истории | write |
| `billing_history_delete` | Удалить запись истории | write |

#### Сниппеты (5 инструментов)

| Инструмент | Описание | Режим |
|------------|----------|-------|
| `snippets_list` | Список сниппетов | read |
| `snippets_create` | Создать сниппет | write |
| `snippets_update` | Обновить сниппет | write |
| `snippets_delete` | Удалить сниппет | write |
| `snippets_sync` | Синхронизировать сниппет с профилями | write |

#### Внешние группы (10 инструментов)

| Инструмент | Описание | Режим |
|------------|----------|-------|
| `external_squads_list` | Список внешних групп | read |
| `external_squads_get` | Получить внешнюю группу по UUID | read |
| `external_squads_tags_list` | Список тегов внешних групп | read |
| `external_squads_create` | Создать внешнюю группу | write |
| `external_squads_update` | Обновить внешнюю группу | write |
| `external_squads_delete` | Удалить внешнюю группу | write |
| `external_squads_add_users` | Добавить всех пользователей | write |
| `external_squads_remove_users` | Убрать всех пользователей | write |
| `external_squads_tags_set` | Задать теги внешней группы | write |
| `external_squads_reorder` | Переупорядочить | write |

#### Настройки (2 инструмента)

| Инструмент | Описание | Режим |
|------------|----------|-------|
| `settings_get` | Получить настройки панели | read |
| `settings_update` | Обновить настройки панели | write |

#### Шаблоны подписок (8 инструментов)

| Инструмент | Описание | Режим |
|------------|----------|-------|
| `subscription_templates_list` | Список шаблонов подписок | read |
| `subscription_templates_get` | Получить шаблон по UUID | read |
| `subscription_templates_tags_list` | Список тегов шаблонов | read |
| `subscription_templates_create` | Создать шаблон подписки | write |
| `subscription_templates_update` | Обновить шаблон подписки | write |
| `subscription_templates_delete` | Удалить шаблон подписки | write |
| `subscription_templates_tags_set` | Задать теги шаблона | write |
| `subscription_templates_reorder` | Изменить порядок шаблонов | write |

#### Настройки подписок (2 инструмента)

| Инструмент | Описание | Режим |
|------------|----------|-------|
| `subscription_settings_get` | Получить настройки подписок | read |
| `subscription_settings_update` | Обновить настройки подписок | write |

#### Bandwidth Stats (8 инструментов)

| Инструмент | Описание | Режим |
|------------|----------|-------|
| `bandwidth_nodes` | Использование bandwidth по нодам | read |
| `bandwidth_nodes_realtime` | Realtime bandwidth нод | read |
| `bandwidth_node_users` | Bandwidth пользователей на ноде | read |
| `bandwidth_nodes_users` | Bandwidth пользователей по нодам | read |
| `bandwidth_user` | Bandwidth конкретного пользователя | read |
| `bandwidth_nodes_usage` | Пользователи выше порога трафика на нодах | read |
| `bandwidth_squad_usage` | Bandwidth пользователей внутренней группы | read |
| `bandwidth_squad_user_usage` | Посуточный bandwidth пользователя в группе | read |

#### Страницы подписок (9 инструментов)

| Инструмент | Описание | Режим |
|------------|----------|-------|
| `sub_page_configs_list` | Список конфигов страниц | read |
| `sub_page_configs_get` | Получить конфиг страницы | read |
| `sub_page_configs_tags_list` | Список тегов страниц подписок | read |
| `sub_page_configs_create` | Создать конфиг страницы | write |
| `sub_page_configs_update` | Обновить имя и/или payload конфига страницы | write |
| `sub_page_configs_delete` | Удалить конфиг страницы | write |
| `sub_page_configs_reorder` | Переупорядочить | write |
| `sub_page_configs_tags_set` | Задать теги конфига страницы | write |
| `sub_page_configs_clone` | Клонировать конфиг | write |

#### Плагины нод (20 инструментов)

| Инструмент | Описание | Режим |
|------------|----------|-------|
| `node_plugins_list` | Список плагинов | read |
| `node_plugins_get` | Получить плагин по UUID | read |
| `node_plugins_torrent_reports` | Отчёты торрент-блокировщика | read |
| `node_plugins_torrent_stats` | Статистика торрент-блокировщика | read |
| `node_plugins_tags_list` | Список тегов плагинов | read |
| `shared_lists_list` | Список shared lists | read |
| `shared_lists_get` | Получить shared list по имени | read |
| `node_plugins_create` | Создать плагин | write |
| `node_plugins_update` | Обновить имя и/или pluginConfig плагина | write |
| `node_plugins_delete` | Удалить плагин | write |
| `node_plugins_reorder` | Переупорядочить плагины | write |
| `node_plugins_sync` | Синхронизировать плагин на ноды | write |
| `node_plugins_tags_set` | Задать теги плагина | write |
| `shared_lists_create` | Создать shared list | write |
| `shared_lists_update` | Обновить shared list | write |
| `shared_lists_delete` | Удалить shared list | write |
| `shared_lists_sync` | Синхронизировать shared list на ноды | write |
| `node_plugins_clone` | Клонировать плагин | write |
| `node_plugins_execute` | Выполнить плагин | write |
| `node_plugins_torrent_truncate` | Очистить отчёты торрент-блокировщика | write |

#### Соединения (7 инструментов)

| Инструмент | Описание | Режим |
|------------|----------|-------|
| `connections_by_user` | Запустить job соединений пользователя | read |
| `connections_by_user_result` | Результат job соединений пользователя | read |
| `connections_by_node` | Запустить job соединений ноды | read |
| `connections_by_node_result` | Результат job соединений ноды | read |
| `connections_geocheck` | Запустить geocheck ноды | read |
| `connections_geocheck_result` | Результат geocheck ноды | read |
| `connections_drop` | Сбросить соединения по IP или ID пользователей | write |

#### Метаданные (4 инструмента)

| Инструмент | Описание | Режим |
|------------|----------|-------|
| `metadata_node_get` | Получить метаданные ноды | read |
| `metadata_user_get` | Получить метаданные пользователя | read |
| `metadata_node_upsert` | Обновить метаданные ноды | write |
| `metadata_user_upsert` | Обновить метаданные пользователя | write |

#### Интеграции нод (5 инструментов)

| Инструмент | Описание | Режим |
|------------|----------|-------|
| `node_integrations_list` | Список интеграций нод | read |
| `node_integrations_get` | Получить интеграцию по UUID | read |
| `node_integrations_create` | Создать интеграцию | write |
| `node_integrations_update` | Обновить интеграцию | write |
| `node_integrations_delete` | Удалить интеграцию | write |

#### SSH нод (2 инструмента)

| Инструмент | Описание | Режим |
|------------|----------|-------|
| `node_ssh_create_ticket` | Создать одноразовый SSH-тикет | write |
| `node_ssh_evaluate_vault` | Оценить vault SSH-ключей ноды | write |

### Ресурсы

| URI | Описание |
|-----|----------|
| `remnawave://stats` | Текущая статистика панели |
| `remnawave://nodes` | Статус всех нод |
| `remnawave://health` | Состояние здоровья панели |
| `remnawave://users/{userId}` | Данные конкретного пользователя |

### Промпты

| Промпт | Описание |
|--------|----------|
| `create_user_wizard` | Пошаговое создание пользователя |
| `node_diagnostics` | Диагностика ноды |
| `traffic_report` | Отчёт по трафику |
| `user_audit` | Полный аудит пользователя |
| `edit_config_profile` | Редактирование core-конфига профиля |
| `bulk_user_cleanup` | Поиск и управление просроченными пользователями |

### Примеры запросов

```
«Покажи мне всех пользователей с истёкшей подпиской»
«Создай пользователя vasya с лимитом 50 ГБ на месяц»
«Перезапусти ноду amsterdam-01»
«Дай отчёт по трафику за последнюю неделю»
«Отключи пользователей, которые превысили лимит трафика»
«Какие ноды сейчас офлайн?»
«Покажи историю биллинга»
«Список плагинов нод»
«Получи IP-соединения пользователя X»
«Отредактируй Xray inbounds в конфиг-профиле Default»
```

### Структура проекта

```
src/
├── index.ts                       # Точка входа (stdio транспорт)
├── server.ts                      # Настройка McpServer
├── config.ts                      # Конфигурация окружения
├── client/
│   └── index.ts                   # HTTP-клиент Remnawave
├── tools/
│   ├── helpers.ts                 # Хелперы форматирования
│   ├── index.ts                   # Регистрация инструментов
│   ├── users.ts                   # Управление пользователями (27)
│   ├── nodes.ts                   # Управление нодами (15)
│   ├── hosts.ts                   # Управление хостами (12)
│   ├── bandwidth-stats.ts         # Статистика bandwidth (8)
│   ├── system.ts                  # Система и авторизация (13)
│   ├── subscriptions.ts           # Подписки (10)
│   ├── inbounds.ts                # Конфиг-профили и inbounds (11)
│   ├── squads.ts                  # Внутренние группы (13)
│   ├── hwid.ts                    # HWID-устройства (7)
│   ├── infra-billing.ts           # Биллинг инфраструктуры (12)
│   ├── node-plugins.ts            # Плагины нод и shared lists (20)
│   ├── external-squads.ts         # Внешние группы (10)
│   ├── subscription-page-configs.ts # Страницы подписок (9)
│   ├── subscription-templates.ts  # Шаблоны подписок (8)
│   ├── subscription-settings.ts   # Настройки подписок (2)
│   ├── connections.ts             # Соединения и geocheck (7)
│   ├── node-integrations.ts       # Интеграции нод (5)
│   ├── node-ssh.ts                # SSH-тикеты нод (2)
│   ├── snippets.ts                # Сниппеты (5)
│   ├── metadata.ts                # Метаданные нод и пользователей (4)
│   ├── api-tokens.ts              # API-токены (5)
│   ├── settings.ts                # Настройки панели (2)
│   └── keygen.ts                  # Keygen (1)
├── resources/
│   └── index.ts                   # MCP-ресурсы
└── prompts/
    └── index.ts                   # MCP-промпты
```

### Лицензия

MIT
