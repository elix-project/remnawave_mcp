import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { RemnawaveClient } from '../client/index.js';
import { toolResult, toolError } from './helpers.js';

export function registerInboundTools(
    server: McpServer,
    client: RemnawaveClient,
    readonly: boolean,
) {
    server.tool(
        'config_profiles_list',
        'List all config profiles',
        {},
        async () => {
            try {
                const result = await client.getConfigProfiles();
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'config_profiles_get',
        'Get a config profile by UUID',
        {
            uuid: z.string().describe('Config profile UUID'),
        },
        async ({ uuid }) => {
            try {
                const result = await client.getConfigProfileByUuid(uuid);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'inbounds_list',
        'List all inbounds from all config profiles',
        {},
        async () => {
            try {
                const result = await client.getAllInbounds();
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'config_profiles_get_inbounds',
        'Get inbounds for a specific config profile',
        {
            uuid: z.string().describe('Config profile UUID'),
        },
        async ({ uuid }) => {
            try {
                const result = await client.getInboundsByProfileUuid(uuid);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'config_profiles_tags_list',
        'List all config profile tags',
        {},
        async () => {
            try {
                const result = await client.getConfigProfileTags();
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'config_profiles_get_computed_config',
        'Get computed configuration for a config profile',
        {
            uuid: z.string().describe('Config profile UUID'),
        },
        async ({ uuid }) => {
            try {
                const result = await client.getComputedConfigByProfileUuid(uuid);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    if (readonly) return;

    server.tool(
        'config_profiles_create',
        'Create a new config profile with an Xray/sing-box core config',
        {
            name: z.string().describe('Profile name'),
            config: z
                .record(z.unknown())
                .describe(
                    'Full Xray/sing-box core configuration object (inbounds, outbounds, routing, etc.)',
                ),
        },
        async (params) => {
            try {
                const result = await client.createConfigProfile(params);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'config_profiles_update',
        'Update a config profile: rename it and/or replace its Xray/sing-box core config. Get the current object with config_profiles_get, edit it, then pass the full `config` here (this replaces the entire core config, not a partial patch).',
        {
            uuid: z.string().describe('Profile UUID'),
            name: z.string().optional().describe('New profile name'),
            config: z
                .record(z.unknown())
                .optional()
                .describe(
                    'Full Xray/sing-box core configuration object. Same shape as config_profiles_create.config and the `config` field returned by config_profiles_get. Replaces the entire core config. Omit to leave the existing config unchanged.',
                ),
        },
        async (params) => {
            try {
                const result = await client.updateConfigProfile(params);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'config_profiles_delete',
        'Delete a config profile',
        {
            uuid: z.string().describe('Profile UUID'),
        },
        async ({ uuid }) => {
            try {
                await client.deleteConfigProfile(uuid);
                return toolResult({ success: true, message: `Profile ${uuid} deleted` });
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'config_profiles_tags_set',
        'Set tags for a config profile',
        {
            uuid: z.string().describe('Config profile UUID'),
            tags: z.array(z.string()).describe('Tags to assign'),
        },
        async (params) => {
            try {
                const result = await client.setConfigProfileTags(params);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'config_profiles_reorder',
        'Reorder config profiles',
        {
            items: z.array(z.object({
                viewPosition: z.number().describe('Sort position (0-based)'),
                uuid: z.string().describe('Config profile UUID'),
            })).describe('Ordered array of { viewPosition, uuid } objects'),
        },
        async (params) => {
            try {
                const result = await client.reorderConfigProfiles(params);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );
}
