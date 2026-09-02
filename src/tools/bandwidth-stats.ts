import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { RemnawaveClient } from '../client/index.js';
import { toolResult, toolError } from './helpers.js';

export function registerBandwidthStatsTools(
    server: McpServer,
    client: RemnawaveClient,
) {
    server.tool(
        'bandwidth_nodes',
        'Get bandwidth usage stats across nodes for a date range',
        {
            start: z.string().describe('Start datetime (ISO 8601)'),
            end: z.string().describe('End datetime (ISO 8601)'),
            topNodesLimit: z
                .number()
                .optional()
                .describe('Max number of top nodes to return'),
        },
        async (params) => {
            try {
                return toolResult(await client.getNodesBandwidth(params));
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'bandwidth_nodes_realtime',
        'Get realtime bandwidth stats for nodes',
        {},
        async () => {
            try {
                return toolResult(await client.getNodesRealtimeBandwidth());
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'bandwidth_node_users',
        'Get bandwidth usage by users on a specific node for a date range',
        {
            uuid: z.string().describe('Node UUID'),
            start: z.string().describe('Start datetime (ISO 8601)'),
            end: z.string().describe('End datetime (ISO 8601)'),
            topUsersLimit: z
                .number()
                .optional()
                .describe('Max number of top users to return'),
        },
        async ({ uuid, start, end, topUsersLimit }) => {
            try {
                return toolResult(
                    await client.getNodeUsersBandwidth(uuid, {
                        start,
                        end,
                        topUsersLimit,
                    }),
                );
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'bandwidth_nodes_users',
        'Get bandwidth usage by users across selected nodes for a date range',
        {
            nodesUuids: z.array(z.string()).describe('Array of node UUIDs'),
            start: z.string().describe('Start datetime (ISO 8601)'),
            end: z.string().describe('End datetime (ISO 8601)'),
            topUsersLimit: z
                .number()
                .optional()
                .describe('Max number of top users to return'),
        },
        async (params) => {
            try {
                return toolResult(await client.getNodesUsersBandwidth(params));
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'bandwidth_user',
        'Get bandwidth usage for a specific user for a date range',
        {
            uuid: z.string().describe('User UUID'),
            start: z.string().describe('Start datetime (ISO 8601)'),
            end: z.string().describe('End datetime (ISO 8601)'),
            topNodesLimit: z
                .number()
                .optional()
                .describe('Max number of top nodes to return'),
        },
        async ({ uuid, start, end, topNodesLimit }) => {
            try {
                return toolResult(
                    await client.getUserBandwidthByUuid(uuid, {
                        start,
                        end,
                        topNodesLimit,
                    }),
                );
            } catch (e) {
                return toolError(e);
            }
        },
    );
}
