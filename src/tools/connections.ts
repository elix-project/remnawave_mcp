import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { RemnawaveClient } from '../client/index.js';
import { toolResult, toolError } from './helpers.js';

export function registerConnectionTools(server: McpServer, client: RemnawaveClient, readonly: boolean) {
    server.tool('connections_by_user', 'Start an async job to fetch active connections for a user', {
        userId: z.number().describe('User numeric ID'),
    }, async ({ userId }) => {
        try { return toolResult(await client.getConnectionsByUser(userId)); } catch (e) { return toolError(e); }
    });

    server.tool('connections_by_user_result', 'Get result of a user connections job', {
        jobId: z.string().describe('Job ID from connections_by_user'),
    }, async ({ jobId }) => {
        try { return toolResult(await client.getConnectionsByUserResult(jobId)); } catch (e) { return toolError(e); }
    });

    server.tool('connections_by_node', 'Start an async job to fetch active connections on a node', {
        uuid: z.string().describe('Node UUID'),
    }, async ({ uuid }) => {
        try { return toolResult(await client.getConnectionsByNode(uuid)); } catch (e) { return toolError(e); }
    });

    server.tool('connections_by_node_result', 'Get result of a node connections job', {
        jobId: z.string().describe('Job ID from connections_by_node'),
    }, async ({ jobId }) => {
        try { return toolResult(await client.getConnectionsByNodeResult(jobId)); } catch (e) { return toolError(e); }
    });

    server.tool('connections_geocheck', 'Start an async geocheck job on a node', {
        uuid: z.string().describe('Node UUID'),
    }, async ({ uuid }) => {
        try { return toolResult(await client.geocheckByNode(uuid)); } catch (e) { return toolError(e); }
    });

    server.tool('connections_geocheck_result', 'Get result of a node geocheck job', {
        jobId: z.string().describe('Job ID from connections_geocheck'),
    }, async ({ jobId }) => {
        try { return toolResult(await client.getGeocheckByNodeResult(jobId)); } catch (e) { return toolError(e); }
    });

    if (readonly) return;

    server.tool('connections_drop', 'Drop active connections by IP or user IDs on specific/all nodes', {
        dropBy: z.union([
            z.object({
                by: z.literal('ipAddresses'),
                ipAddresses: z.array(z.string()).min(1).describe('Array of IP addresses'),
            }),
            z.object({
                by: z.literal('userIds'),
                userIds: z.array(z.number()).min(1).describe('Array of user numeric IDs'),
            }),
        ]).describe('What to drop connections by'),
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
        try { return toolResult(await client.dropConnections(params)); } catch (e) { return toolError(e); }
    });
}
