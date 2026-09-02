import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { RemnawaveClient } from '../client/index.js';
import { toolResult, toolError } from './helpers.js';

export function registerSubscriptionSettingsTools(
    server: McpServer,
    client: RemnawaveClient,
    readonly: boolean,
) {
    server.tool(
        'subscription_settings_get',
        'Get subscription settings',
        {},
        async () => {
            try {
                return toolResult(await client.getSubscriptionSettings());
            } catch (e) {
                return toolError(e);
            }
        },
    );

    if (readonly) return;

    server.tool(
        'subscription_settings_update',
        'Update subscription settings. Get the current object with subscription_settings_get first, then pass uuid plus fields to change.',
        {
            uuid: z.string().describe('Subscription settings UUID'),
            profileTitle: z.string().optional().describe('Profile title'),
            supportLink: z.string().optional().describe('Support link'),
            profileUpdateInterval: z
                .number()
                .optional()
                .describe('Profile update interval in hours'),
            isProfileWebpageUrlEnabled: z
                .boolean()
                .optional()
                .describe('Enable profile web page URL'),
            serveJsonAtBaseSubscription: z
                .boolean()
                .optional()
                .describe('Serve JSON at base subscription URL'),
            happAnnounce: z
                .string()
                .nullable()
                .optional()
                .describe('Happ announce message'),
            happRouting: z
                .string()
                .nullable()
                .optional()
                .describe('Happ routing config'),
            isShowCustomRemarks: z
                .boolean()
                .optional()
                .describe('Show custom remarks'),
            customRemarks: z
                .record(z.unknown())
                .optional()
                .describe('Custom remarks object'),
            customResponseHeaders: z
                .record(z.string())
                .optional()
                .describe('Custom response headers map'),
            randomizeHosts: z.boolean().optional().describe('Randomize hosts'),
            responseRules: z
                .record(z.unknown())
                .optional()
                .describe('Subscription request routing rules'),
            hwidSettings: z
                .record(z.unknown())
                .optional()
                .describe('HWID settings object'),
        },
        async (params) => {
            try {
                return toolResult(await client.updateSubscriptionSettings(params));
            } catch (e) {
                return toolError(e);
            }
        },
    );
}
