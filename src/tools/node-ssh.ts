import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { RemnawaveClient } from '../client/index.js';
import { toolResult, toolError } from './helpers.js';

export function registerNodeSshTools(server: McpServer, client: RemnawaveClient, readonly: boolean) {
    if (readonly) return;

    server.tool('node_ssh_create_ticket', 'Create a single-use ticket for opening an SSH terminal session on a node', {
        uuid: z.string().describe('Node UUID'),
    }, async ({ uuid }) => {
        try { return toolResult(await client.createNodeSshTicket(uuid)); } catch (e) { return toolError(e); }
    });

    server.tool('node_ssh_evaluate_vault', 'Oblivious evaluation step for unlocking the node SSH key vault', {
        blinded: z.string().describe('Base64-encoded blinded vault payload'),
    }, async (params) => {
        try { return toolResult(await client.evaluateNodeSshVault(params)); } catch (e) { return toolError(e); }
    });
}
