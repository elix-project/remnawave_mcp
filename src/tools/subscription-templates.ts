import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { RemnawaveClient } from '../client/index.js';
import { toolResult, toolError } from './helpers.js';

const TEMPLATE_TYPES = [
    'XRAY_JSON',
    'XRAY_BASE64',
    'MIHOMO',
    'STASH',
    'CLASH',
    'SINGBOX',
] as const;

export function registerSubscriptionTemplateTools(
    server: McpServer,
    client: RemnawaveClient,
    readonly: boolean,
) {
    server.tool(
        'subscription_templates_list',
        'List all subscription templates',
        {},
        async () => {
            try {
                return toolResult(await client.getSubscriptionTemplates());
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'subscription_templates_get',
        'Get a subscription template by UUID',
        {
            uuid: z.string().describe('Template UUID'),
        },
        async ({ uuid }) => {
            try {
                return toolResult(await client.getSubscriptionTemplateByUuid(uuid));
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'subscription_templates_tags_list',
        'List all subscription template tags',
        {},
        async () => {
            try {
                return toolResult(await client.getSubscriptionTemplateTags());
            } catch (e) {
                return toolError(e);
            }
        },
    );

    if (readonly) return;

    server.tool(
        'subscription_templates_create',
        'Create a subscription template',
        {
            name: z.string().describe('Template name'),
            templateType: z.enum(TEMPLATE_TYPES).describe('Template type'),
        },
        async (params) => {
            try {
                return toolResult(await client.createSubscriptionTemplate(params));
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'subscription_templates_update',
        'Update a subscription template name and/or content. Get the current object with subscription_templates_get first.',
        {
            uuid: z.string().describe('Template UUID'),
            name: z.string().optional().describe('New template name'),
            templateJson: z
                .record(z.unknown())
                .optional()
                .describe('JSON template body (for XRAY_JSON)'),
            encodedTemplateYaml: z
                .string()
                .optional()
                .describe('Base64-encoded YAML template body'),
        },
        async (params) => {
            try {
                return toolResult(await client.updateSubscriptionTemplate(params));
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'subscription_templates_delete',
        'Delete a subscription template',
        {
            uuid: z.string().describe('Template UUID to delete'),
        },
        async ({ uuid }) => {
            try {
                await client.deleteSubscriptionTemplate(uuid);
                return toolResult({
                    success: true,
                    message: `Subscription template ${uuid} deleted`,
                });
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'subscription_templates_tags_set',
        'Set tags for a subscription template',
        {
            uuid: z.string().describe('Template UUID'),
            tags: z.array(z.string()).describe('Tags to assign'),
        },
        async (params) => {
            try {
                return toolResult(await client.setSubscriptionTemplateTags(params));
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'subscription_templates_reorder',
        'Reorder subscription templates',
        {
            items: z
                .array(
                    z.object({
                        viewPosition: z.number().describe('Sort position (0-based)'),
                        uuid: z.string().describe('Template UUID'),
                    }),
                )
                .describe('Ordered array of { viewPosition, uuid } objects'),
        },
        async (params) => {
            try {
                return toolResult(await client.reorderSubscriptionTemplates(params));
            } catch (e) {
                return toolError(e);
            }
        },
    );
}
