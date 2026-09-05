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
            userId: z.number().describe('User numeric ID'),
            start: z.string().describe('Start datetime (ISO 8601)'),
            end: z.string().describe('End datetime (ISO 8601)'),
            topNodesLimit: z
                .number()
                .optional()
                .describe('Max number of top nodes to return'),
        },
        async ({ userId, start, end, topNodesLimit }) => {
            try {
                return toolResult(
                    await client.getUserBandwidthById(userId, {
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

    server.tool(
        'bandwidth_nodes_usage',
        'Get users exceeding a traffic threshold on selected nodes for a date range',
        {
            nodesUuids: z.array(z.string()).describe('Array of node UUIDs'),
            start: z.string().describe('Start date (YYYY-MM-DD)'),
            end: z.string().describe('End date (YYYY-MM-DD)'),
            minTotalBytes: z
                .number()
                .optional()
                .describe('Minimum total bytes threshold'),
        },
        async (params) => {
            try {
                return toolResult(await client.getNodesUsage(params));
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'bandwidth_squad_usage',
        'Get per-user bandwidth usage for an internal squad',
        {
            uuid: z.string().describe('Internal squad UUID'),
            start: z.string().describe('Start date (YYYY-MM-DD)'),
            end: z.string().describe('End date (YYYY-MM-DD)'),
            minTotalBytes: z
                .number()
                .optional()
                .describe('Minimum total bytes threshold'),
            limit: z.number().optional().describe('Page size'),
            cursor: z.number().optional().describe('Pagination cursor'),
        },
        async ({ uuid, start, end, minTotalBytes, limit, cursor }) => {
            try {
                return toolResult(
                    await client.getInternalSquadUsage(uuid, {
                        start,
                        end,
                        minTotalBytes,
                        limit,
                        cursor,
                    }),
                );
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'bandwidth_squad_user_usage',
        'Get per-node daily bandwidth usage for a user inside an internal squad',
        {
            squadUuid: z.string().describe('Internal squad UUID'),
            userId: z.number().describe('User numeric ID'),
            start: z.string().describe('Start date (YYYY-MM-DD)'),
            end: z.string().describe('End date (YYYY-MM-DD)'),
        },
        async ({ squadUuid, userId, start, end }) => {
            try {
                return toolResult(
                    await client.getInternalSquadUserUsage(squadUuid, userId, {
                        start,
                        end,
                    }),
                );
            } catch (e) {
                return toolError(e);
            }
        },
    );
}
