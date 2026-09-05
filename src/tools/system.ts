import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { RemnawaveClient } from '../client/index.js';
import { toolResult, toolError } from './helpers.js';

export function registerSystemTools(
    server: McpServer,
    client: RemnawaveClient,
) {
    server.tool(
        'system_stats',
        'Get overall Remnawave panel statistics (users, nodes, traffic, memory, CPU)',
        {},
        async () => {
            try {
                const result = await client.getStats();
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'system_bandwidth_stats',
        'Get bandwidth statistics',
        {},
        async () => {
            try {
                const result = await client.getBandwidthStats();
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'system_nodes_metrics',
        'Get detailed node metrics',
        {},
        async () => {
            try {
                const result = await client.getNodesMetrics();
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'system_nodes_statistics',
        'Get node statistics',
        {},
        async () => {
            try {
                const result = await client.getNodesStatistics();
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'system_health',
        'Check Remnawave panel health status',
        {},
        async () => {
            try {
                const result = await client.getHealth();
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'system_metadata',
        'Get Remnawave panel metadata and version information',
        {},
        async () => {
            try {
                const result = await client.getSystemMetadata();
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'system_generate_x25519',
        'Generate X25519 key pair for VLESS Reality',
        {},
        async () => {
            try {
                const result = await client.generateX25519();
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'auth_status',
        'Check current authentication status with Remnawave panel',
        {},
        async () => {
            try {
                const result = await client.getAuthStatus();
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'system_stats_recap',
        'Get system statistics recap',
        {},
        async () => {
            try {
                const result = await client.getStatsRecap();
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'system_configuration',
        'Get Remnawave panel configuration (notifications, service flags, short UUID length)',
        {},
        async () => {
            try {
                const result = await client.getSystemConfiguration();
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'system_stats_digest',
        'Get aggregated stats digest for a datetime range (created/expired users, traffic, HWID)',
        {
            start: z.string().describe('Start datetime (ISO 8601)'),
            end: z.string().describe('End datetime (ISO 8601)'),
        },
        async (params) => {
            try {
                const result = await client.getStatsDigest(params);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'system_stats_http',
        'Get HTTP route usage statistics',
        {},
        async () => {
            try {
                const result = await client.getHttpStats();
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'system_srr_matcher',
        'Test subscription request routing rules',
        {
            responseRules: z.record(z.unknown()).describe('Response rules configuration object with version and rules array'),
        },
        async (params) => {
            try {
                const result = await client.testSrrMatcher(params);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );
}
