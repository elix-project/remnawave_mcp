import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { RemnawaveClient } from '../client/index.js';
import { toolResult, toolError } from './helpers.js';

export function registerSquadTools(
    server: McpServer,
    client: RemnawaveClient,
    readonly: boolean,
) {
    server.tool(
        'squads_list',
        'List all internal squads',
        {},
        async () => {
            try {
                const result = await client.getInternalSquads();
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'squads_get',
        'Get an internal squad by UUID',
        {
            uuid: z.string().describe('Squad UUID'),
        },
        async ({ uuid }) => {
            try {
                const result = await client.getInternalSquadByUuid(uuid);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'squads_tags_list',
        'List all internal squad tags',
        {},
        async () => {
            try {
                const result = await client.getInternalSquadTags();
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'squads_accessible_nodes',
        'Get nodes accessible to a specific squad',
        {
            uuid: z.string().describe('Squad UUID'),
        },
        async ({ uuid }) => {
            try {
                const result = await client.getSquadAccessibleNodes(uuid);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    if (readonly) return;

    server.tool(
        'squads_create',
        'Create a new internal squad',
        {
            name: z.string().describe('Squad name'),
            inbounds: z.array(z.string()).describe('Array of inbound UUIDs'),
        },
        async (params) => {
            try {
                const result = await client.createInternalSquad(params);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'squads_update',
        'Update an internal squad name and/or inbound list',
        {
            uuid: z.string().describe('Squad UUID'),
            name: z.string().optional().describe('New squad name'),
            inbounds: z
                .array(z.string())
                .optional()
                .describe('Array of inbound UUIDs. Replaces the squad inbound list. Omit to leave inbounds unchanged.'),
        },
        async (params) => {
            try {
                const result = await client.updateInternalSquad(params);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'squads_delete',
        'Delete an internal squad',
        {
            uuid: z.string().describe('Squad UUID to delete'),
        },
        async ({ uuid }) => {
            try {
                await client.deleteInternalSquad(uuid);
                return toolResult({
                    success: true,
                    message: `Squad ${uuid} deleted`,
                });
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'squads_add_users',
        'Add selected users to an internal squad',
        {
            squadUuid: z.string().describe('Squad UUID'),
            userIds: z
                .array(z.number())
                .describe('Array of user numeric IDs to add'),
        },
        async ({ squadUuid, userIds }) => {
            try {
                const result = await client.addUsersToSquad(squadUuid, userIds);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'squads_remove_users',
        'Remove selected users from an internal squad',
        {
            squadUuid: z.string().describe('Squad UUID'),
            userIds: z
                .array(z.number())
                .describe('Array of user numeric IDs to remove'),
        },
        async ({ squadUuid, userIds }) => {
            try {
                const result = await client.removeUsersFromSquad(
                    squadUuid,
                    userIds,
                );
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'squads_add_all_users',
        'Add ALL users to an internal squad',
        {
            squadUuid: z.string().describe('Squad UUID'),
        },
        async ({ squadUuid }) => {
            try {
                const result = await client.addAllUsersToSquad(squadUuid);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'squads_remove_all_users',
        'Remove ALL users from an internal squad',
        {
            squadUuid: z.string().describe('Squad UUID'),
        },
        async ({ squadUuid }) => {
            try {
                const result = await client.removeAllUsersFromSquad(squadUuid);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'squads_tags_set',
        'Set tags for an internal squad',
        {
            uuid: z.string().describe('Squad UUID'),
            tags: z.array(z.string()).describe('Tags to assign'),
        },
        async (params) => {
            try {
                const result = await client.setInternalSquadTags(params);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'squads_reorder',
        'Reorder internal squads',
        {
            items: z
                .array(
                    z.object({
                        viewPosition: z.number().describe('Sort position (0-based)'),
                        uuid: z.string().describe('Squad UUID'),
                    }),
                )
                .describe('Ordered array of { viewPosition, uuid } objects'),
        },
        async (params) => {
            try {
                const result = await client.reorderInternalSquads(params);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );
}
