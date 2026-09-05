import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { RemnawaveClient } from '../client/index.js';
import { toolResult, toolError } from './helpers.js';

export function registerNodePluginTools(server: McpServer, client: RemnawaveClient, readonly: boolean) {
    server.tool('node_plugins_list', 'List all node plugins', {}, async () => {
        try { return toolResult(await client.getNodePlugins()); } catch (e) { return toolError(e); }
    });

    server.tool('node_plugins_get', 'Get a node plugin by UUID', {
        uuid: z.string().describe('Plugin UUID'),
    }, async ({ uuid }) => {
        try { return toolResult(await client.getNodePlugin(uuid)); } catch (e) { return toolError(e); }
    });

    server.tool('node_plugins_torrent_reports', 'Get torrent blocker reports', {}, async () => {
        try { return toolResult(await client.getTorrentBlockerReports()); } catch (e) { return toolError(e); }
    });

    server.tool('node_plugins_torrent_stats', 'Get torrent blocker statistics', {}, async () => {
        try { return toolResult(await client.getTorrentBlockerStats()); } catch (e) { return toolError(e); }
    });

    server.tool('node_plugins_tags_list', 'List all node plugin tags', {}, async () => {
        try { return toolResult(await client.getNodePluginTags()); } catch (e) { return toolError(e); }
    });

    server.tool('shared_lists_list', 'List shared lists (name, type, item count)', {}, async () => {
        try { return toolResult(await client.getSharedLists()); } catch (e) { return toolError(e); }
    });

    server.tool('shared_lists_get', 'Get a shared list by name', {
        name: z.string().describe('Shared list name'),
    }, async ({ name }) => {
        try { return toolResult(await client.getSharedList(name)); } catch (e) { return toolError(e); }
    });

    if (readonly) return;

    server.tool('node_plugins_create', 'Create a new node plugin', {
        name: z.string().describe('Plugin name'),
    }, async (params) => {
        try { return toolResult(await client.createNodePlugin(params)); } catch (e) { return toolError(e); }
    });

    server.tool('node_plugins_update', 'Update a node plugin name and/or pluginConfig. Get the current object with node_plugins_get, then pass the full `pluginConfig` to replace it.', {
        uuid: z.string().describe('Plugin UUID'),
        name: z.string().optional().describe('New name'),
        pluginConfig: z.record(z.unknown()).optional().describe('Plugin configuration object. Replaces the entire pluginConfig. Omit to leave the existing config unchanged.'),
    }, async (params) => {
        try { return toolResult(await client.updateNodePlugin(params)); } catch (e) { return toolError(e); }
    });

    server.tool('node_plugins_delete', 'Delete a node plugin', {
        uuid: z.string().describe('Plugin UUID'),
    }, async ({ uuid }) => {
        try { await client.deleteNodePlugin(uuid); return toolResult({ success: true, message: `Plugin ${uuid} deleted` }); } catch (e) { return toolError(e); }
    });

    server.tool('node_plugins_reorder', 'Reorder node plugins', {
        items: z.array(z.object({
            viewPosition: z.number().describe('Sort position (0-based)'),
            uuid: z.string().describe('Plugin UUID'),
        })).describe('Ordered array of { viewPosition, uuid } objects'),
    }, async (params) => {
        try { return toolResult(await client.reorderNodePlugins(params)); } catch (e) { return toolError(e); }
    });

    server.tool('node_plugins_sync', 'Sync a node plugin config (including shared lists) to connected nodes', {
        uuid: z.string().describe('Plugin UUID'),
    }, async (params) => {
        try { return toolResult(await client.syncNodePlugin(params)); } catch (e) { return toolError(e); }
    });

    server.tool('node_plugins_tags_set', 'Set tags for a node plugin', {
        uuid: z.string().describe('Plugin UUID'),
        tags: z.array(z.string()).describe('Tags to assign'),
    }, async (params) => {
        try { return toolResult(await client.setNodePluginTags(params)); } catch (e) { return toolError(e); }
    });

    server.tool('shared_lists_create', 'Create a shared list', {
        name: z.string().describe('Shared list name'),
        config: z.record(z.unknown()).describe('Shared list configuration object'),
    }, async (params) => {
        try { return toolResult(await client.createSharedList(params)); } catch (e) { return toolError(e); }
    });

    server.tool('shared_lists_update', 'Update a shared list config. Get the current object with shared_lists_get, then pass the full `config` to replace it.', {
        name: z.string().describe('Shared list name'),
        config: z.record(z.unknown()).describe('Shared list configuration object. Replaces the entire config.'),
    }, async (params) => {
        try { return toolResult(await client.updateSharedList(params)); } catch (e) { return toolError(e); }
    });

    server.tool('shared_lists_delete', 'Delete a shared list by name', {
        name: z.string().describe('Shared list name'),
    }, async (params) => {
        try { return toolResult(await client.deleteSharedList(params)); } catch (e) { return toolError(e); }
    });

    server.tool('shared_lists_sync', 'Sync a shared list to nodes via every plugin that references it', {
        name: z.string().describe('Shared list name'),
    }, async (params) => {
        try { return toolResult(await client.syncSharedList(params)); } catch (e) { return toolError(e); }
    });

    server.tool('node_plugins_clone', 'Clone a node plugin', {
        cloneFromUuid: z.string().describe('Plugin UUID to clone'),
    }, async (params) => {
        try { return toolResult(await client.cloneNodePlugin(params)); } catch (e) { return toolError(e); }
    });

    server.tool('node_plugins_execute', 'Execute a node plugin with a command on target nodes', {
        command: z.union([
            z.object({
                command: z.literal('blockIps'),
                ips: z.array(z.object({
                    ip: z.string().describe('IP address to block'),
                    timeout: z.number().describe('Block timeout in seconds'),
                })).min(1).describe('Array of IP addresses with timeouts'),
            }),
            z.object({
                command: z.literal('unblockIps'),
                ips: z.array(z.string()).min(1).describe('Array of IP addresses to unblock'),
            }),
            z.object({
                command: z.literal('recreateTables'),
            }),
        ]).describe('Command to execute'),
        targetNodes: z.union([
            z.object({
                target: z.literal('allNodes'),
            }),
            z.object({
                target: z.literal('specificNodes'),
                nodeUuids: z.array(z.string()).min(1).describe('Array of node UUIDs'),
            }),
        ]).describe('Which nodes to target'),
    }, async (params) => {
        try { return toolResult(await client.executeNodePlugin(params)); } catch (e) { return toolError(e); }
    });

    server.tool('node_plugins_torrent_truncate', 'Truncate all torrent blocker reports', {}, async () => {
        try { return toolResult(await client.truncateTorrentBlockerReports()); } catch (e) { return toolError(e); }
    });
}
