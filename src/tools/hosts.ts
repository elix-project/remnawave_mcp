import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { RemnawaveClient } from '../client/index.js';
import { compactBody, toolResult, toolError } from './helpers.js';

const SUBSCRIPTION_TYPES = ['XRAY_JSON', 'XRAY_BASE64', 'MIHOMO', 'STASH', 'CLASH', 'SINGBOX'] as const;

const hostInboundSchema = z
    .object({
        configProfileUuid: z.string().describe('Config profile UUID'),
        configProfileInboundUuid: z.string().describe('Config profile inbound UUID'),
    })
    .describe(
        'Nested API object { configProfileUuid, configProfileInboundUuid }. Do not flatten these fields to the top level.',
    );

export function registerHostTools(server: McpServer, client: RemnawaveClient, readonly: boolean) {
    server.tool(
        'hosts_list',
        'List all Remnawave hosts',
        {},
        async () => {
            try {
                const result = await client.getHosts();
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'hosts_get',
        'Get a specific host by UUID',
        {
            uuid: z.string().describe('Host UUID'),
        },
        async ({ uuid }) => {
            try {
                const result = await client.getHostByUuid(uuid);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'hosts_tags_list',
        'List all host tags',
        {},
        async () => {
            try {
                const result = await client.getHostTags();
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    if (readonly) return;

    server.tool(
        'hosts_create',
        'Create a new host in Remnawave',
        {
            remark: z.string().describe('Host remark/name'),
            address: z.string().describe('Host address'),
            port: z.number().describe('Host port'),
            inbound: hostInboundSchema,
            path: z.string().optional().describe('URL path'),
            sni: z.string().optional().describe('SNI (Server Name Indication)'),
            host: z.string().optional().describe('Host header'),
            alpn: z
                .enum(['h3', 'h2', 'http/1.1', 'h2,http/1.1', 'h3,h2,http/1.1', 'h3,h2'])
                .optional()
                .describe('ALPN protocol'),
            fingerprint: z
                .enum([
                    'chrome',
                    'firefox',
                    'safari',
                    'ios',
                    'android',
                    'edge',
                    'qq',
                    'random',
                    'randomized',
                ])
                .optional()
                .describe('TLS fingerprint'),
            isDisabled: z
                .boolean()
                .optional()
                .describe('Create in disabled state'),
            isHidden: z
                .boolean()
                .optional()
                .describe('Hide from subscription list'),
            securityLayer: z
                .enum(['DEFAULT', 'TLS', 'NONE'])
                .optional()
                .describe('Security layer'),
            tags: z.array(z.string()).optional().describe('Host tags'),
            serverDescription: z
                .string()
                .optional()
                .describe('Server description'),
            nodes: z
                .array(z.string())
                .optional()
                .describe('Array of node UUIDs to assign'),
            excludeFromSubscriptionTypes: z
                .array(z.enum(SUBSCRIPTION_TYPES))
                .optional()
                .describe('Subscription types to exclude this host from'),
            xrayJsonTemplateUuid: z
                .string()
                .optional()
                .describe('Xray JSON template UUID'),
            internalSquads: z
                .object({
                    mode: z.enum(['EXCLUDE', 'ALLOW_ONLY']).describe('Squad filter mode'),
                    squads: z.array(z.string()).describe('Internal squad UUIDs'),
                })
                .optional()
                .describe('Internal squad visibility filter'),
            overrideSniFromAddress: z
                .boolean()
                .optional()
                .describe('Override SNI from address'),
            keepSniBlank: z
                .boolean()
                .optional()
                .describe('Keep SNI field blank'),
            allowInsecure: z
                .boolean()
                .optional()
                .describe('Allow insecure connections'),
            vlessRouteId: z
                .number()
                .optional()
                .describe('VLESS route ID (0-65535)'),
            shuffleHost: z
                .boolean()
                .optional()
                .describe('Enable host shuffling'),
            mihomoX25519: z
                .boolean()
                .optional()
                .describe('Enable Mihomo X25519'),
        },
        async (params) => {
            try {
                const result = await client.createHost(compactBody(params));
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'hosts_update',
        'Update an existing host',
        {
            uuid: z.string().describe('Host UUID to update'),
            remark: z.string().optional().describe('New remark/name'),
            address: z.string().optional().describe('New address'),
            port: z.number().optional().describe('New port'),
            inbound: hostInboundSchema.optional(),
            path: z.string().optional().describe('New URL path'),
            sni: z.string().optional().describe('New SNI'),
            host: z.string().optional().describe('New host header'),
            alpn: z
                .enum(['h3', 'h2', 'http/1.1', 'h2,http/1.1', 'h3,h2,http/1.1', 'h3,h2'])
                .optional()
                .describe('New ALPN'),
            fingerprint: z
                .enum([
                    'chrome',
                    'firefox',
                    'safari',
                    'ios',
                    'android',
                    'edge',
                    'qq',
                    'random',
                    'randomized',
                ])
                .optional()
                .describe('New fingerprint'),
            isDisabled: z
                .boolean()
                .optional()
                .describe('Enable/disable host'),
            isHidden: z
                .boolean()
                .optional()
                .describe('Hide from subscription list'),
            securityLayer: z
                .enum(['DEFAULT', 'TLS', 'NONE'])
                .optional()
                .describe('New security layer'),
            tags: z.array(z.string()).optional().describe('New tags'),
            serverDescription: z
                .string()
                .optional()
                .describe('New server description'),
            nodes: z
                .array(z.string())
                .optional()
                .describe('New node UUIDs'),
            excludeFromSubscriptionTypes: z
                .array(z.enum(SUBSCRIPTION_TYPES))
                .optional()
                .describe('Subscription types to exclude this host from'),
            xrayJsonTemplateUuid: z
                .string()
                .optional()
                .describe('Xray JSON template UUID'),
            internalSquads: z
                .object({
                    mode: z.enum(['EXCLUDE', 'ALLOW_ONLY']).describe('Squad filter mode'),
                    squads: z.array(z.string()).describe('Internal squad UUIDs'),
                })
                .optional()
                .describe('Internal squad visibility filter'),
            overrideSniFromAddress: z
                .boolean()
                .optional()
                .describe('Override SNI from address'),
            keepSniBlank: z
                .boolean()
                .optional()
                .describe('Keep SNI field blank'),
            allowInsecure: z
                .boolean()
                .optional()
                .describe('Allow insecure connections'),
            vlessRouteId: z
                .number()
                .optional()
                .describe('VLESS route ID (0-65535)'),
            shuffleHost: z
                .boolean()
                .optional()
                .describe('Enable host shuffling'),
            mihomoX25519: z
                .boolean()
                .optional()
                .describe('Enable Mihomo X25519'),
        },
        async (params) => {
            try {
                const result = await client.updateHost(compactBody(params));
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'hosts_delete',
        'Delete a host from Remnawave',
        {
            uuid: z.string().describe('Host UUID to delete'),
        },
        async ({ uuid }) => {
            try {
                await client.deleteHost(uuid);
                return toolResult({
                    success: true,
                    message: `Host ${uuid} deleted`,
                });
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'hosts_reorder',
        'Reorder hosts',
        {
            hosts: z
                .array(
                    z.object({
                        viewPosition: z.number().describe('Sort position (0-based)'),
                        uuid: z.string().describe('Host UUID'),
                    }),
                )
                .describe('Ordered array of { viewPosition, uuid } objects'),
        },
        async ({ hosts }) => {
            try {
                return toolResult(await client.reorderHosts(hosts));
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'hosts_clone',
        'Clone an existing host',
        {
            cloneFromUuid: z.string().describe('Host UUID to clone'),
        },
        async (params) => {
            try {
                return toolResult(await client.cloneHost(params));
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'hosts_bulk_enable',
        'Bulk enable selected hosts',
        { uuids: z.array(z.string()).describe('Array of host UUIDs') },
        async (params) => {
            try { return toolResult(await client.bulkEnableHosts(params)); } catch (e) { return toolError(e); }
        },
    );

    server.tool(
        'hosts_bulk_disable',
        'Bulk disable selected hosts',
        { uuids: z.array(z.string()).describe('Array of host UUIDs') },
        async (params) => {
            try { return toolResult(await client.bulkDisableHosts(params)); } catch (e) { return toolError(e); }
        },
    );

    server.tool(
        'hosts_bulk_delete',
        'Bulk delete selected hosts',
        { uuids: z.array(z.string()).describe('Array of host UUIDs') },
        async (params) => {
            try { return toolResult(await client.bulkDeleteHosts(params)); } catch (e) { return toolError(e); }
        },
    );

    server.tool(
        'hosts_bulk_update',
        'Bulk update selected hosts (port, inbound, tags, address, and other host fields)',
        {
            uuids: z.array(z.string()).describe('Array of host UUIDs'),
            port: z.number().optional().describe('New port number'),
            inbound: hostInboundSchema.optional(),
            remark: z.string().optional().describe('Host remark/name'),
            address: z.string().optional().describe('Host address'),
            path: z.string().nullable().optional().describe('Path'),
            sni: z.string().nullable().optional().describe('SNI'),
            host: z.string().nullable().optional().describe('Host header'),
            tags: z.array(z.string()).optional().describe('Host tags'),
            nodes: z.array(z.string()).optional().describe('Node UUIDs'),
            isDisabled: z.boolean().optional().describe('Disable host'),
            isHidden: z.boolean().optional().describe('Hide host'),
            securityLayer: z
                .enum(['DEFAULT', 'TLS', 'NONE'])
                .optional()
                .describe('Security layer'),
            excludeFromSubscriptionTypes: z
                .array(z.enum(SUBSCRIPTION_TYPES))
                .optional()
                .describe('Subscription types to exclude from'),
            internalSquads: z
                .object({
                    mode: z.enum(['EXCLUDE', 'ALLOW_ONLY']).describe('Squad filter mode'),
                    squads: z.array(z.string()).describe('Internal squad UUIDs'),
                })
                .optional()
                .describe('Internal squad visibility filter'),
        },
        async (params) => {
            try { return toolResult(await client.bulkUpdateHosts(params)); } catch (e) { return toolError(e); }
        },
    );
}
