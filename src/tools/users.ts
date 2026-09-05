import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { RemnawaveClient } from '../client/index.js';
import { toolResult, toolError } from './helpers.js';

const userIdField = z.number().describe('User numeric ID');

export function registerUserTools(server: McpServer, client: RemnawaveClient, readonly: boolean) {
    server.tool(
        'users_list',
        'List all Remnawave VPN users with pagination',
        {
            start: z.number().default(0).describe('Offset for pagination'),
            size: z.number().default(25).describe('Number of users to return'),
        },
        async ({ start, size }) => {
            try {
                const result = await client.getUsers(start, size);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_stream',
        'List Remnawave users with cursor pagination',
        {
            cursor: z.string().optional().describe('Cursor from the previous page'),
            size: z.number().default(25).describe('Number of users to return'),
        },
        async ({ cursor, size }) => {
            try {
                const result = await client.streamUsers(cursor, size);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_get',
        'Get a specific Remnawave user by their numeric ID',
        {
            userId: userIdField,
        },
        async ({ userId }) => {
            try {
                const result = await client.getUserById(userId);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_get_by_username',
        'Get a Remnawave user by their username',
        {
            username: z.string().describe('Username'),
        },
        async ({ username }) => {
            try {
                const result = await client.getUserByUsername(username);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_get_by_short_uuid',
        'Get a Remnawave user by their short UUID',
        {
            shortUuid: z.string().describe('Short UUID'),
        },
        async ({ shortUuid }) => {
            try {
                const result = await client.getUserByShortUuid(shortUuid);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_accessible_nodes',
        'Get nodes accessible to a specific user',
        {
            userId: userIdField,
        },
        async ({ userId }) => {
            try {
                const result = await client.getUserAccessibleNodes(userId);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_subscription_request_history',
        'Get subscription request history for a specific user',
        {
            userId: userIdField,
        },
        async ({ userId }) => {
            try {
                const result = await client.getUserSubscriptionRequestHistory(userId);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_tags_list',
        'List all user tags',
        {},
        async () => {
            try {
                const result = await client.getUserTags();
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_resolve',
        'Search and resolve users by numeric ID, short UUID, or username',
        {
            id: z.number().optional().describe('User numeric ID'),
            shortUuid: z.string().optional().describe('Short UUID'),
            username: z.string().optional().describe('Username'),
        },
        async (params) => {
            try {
                const result = await client.resolveUsers(params);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    if (readonly) return;

    server.tool(
        'users_create',
        'Create a new VPN user in Remnawave',
        {
            username: z.string().describe('Unique username'),
            expireAt: z.string().describe('Expiration date in ISO 8601 format'),
            trafficLimitBytes: z
                .number()
                .optional()
                .describe('Traffic limit in bytes (0 = unlimited)'),
            trafficLimitStrategy: z
                .enum(['NO_RESET', 'DAY', 'WEEK', 'MONTH', 'MONTH_ROLLING'])
                .optional()
                .describe('Traffic reset period'),
            status: z
                .enum(['ACTIVE', 'DISABLED', 'LIMITED', 'EXPIRED'])
                .optional()
                .describe('Initial user status'),
            description: z.string().optional().describe('User description'),
            tag: z.string().optional().describe('User tag for grouping'),
            telegramId: z.number().optional().describe('Telegram user ID'),
            email: z.string().optional().describe('User email'),
            hwidDeviceLimit: z
                .number()
                .optional()
                .describe('Max number of HWID devices'),
            activeInternalSquads: z
                .array(z.string())
                .optional()
                .describe('Array of internal squad UUIDs'),
            shortUuid: z.string().optional().describe('Custom short UUID for the user'),
            vlessUuid: z.string().optional().describe('Custom VLESS UUID'),
            trojanPassword: z.string().optional().describe('Custom Trojan password'),
            ssPassword: z.string().optional().describe('Custom Shadowsocks password'),
            externalSquadUuid: z.string().optional().describe('External squad UUID'),
        },
        async (params) => {
            try {
                const result = await client.createUser(params);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_update',
        'Update an existing Remnawave user',
        {
            id: userIdField.describe('User numeric ID to update'),
            username: z.string().optional().describe('New username'),
            expireAt: z
                .string()
                .optional()
                .describe('New expiration date (ISO 8601)'),
            trafficLimitBytes: z
                .number()
                .optional()
                .describe('New traffic limit in bytes'),
            trafficLimitStrategy: z
                .enum(['NO_RESET', 'DAY', 'WEEK', 'MONTH', 'MONTH_ROLLING'])
                .optional()
                .describe('Traffic reset period'),
            status: z
                .enum(['ACTIVE', 'DISABLED'])
                .optional()
                .describe('User status'),
            description: z.string().optional().describe('User description'),
            tag: z.string().optional().describe('User tag'),
            telegramId: z.number().optional().describe('Telegram user ID'),
            email: z.string().optional().describe('User email'),
            hwidDeviceLimit: z
                .number()
                .optional()
                .describe('Max HWID devices'),
            activeInternalSquads: z
                .array(z.string())
                .optional()
                .describe('Internal squad UUIDs'),
            externalSquadUuid: z.string().optional().describe('External squad UUID'),
        },
        async (params) => {
            try {
                const result = await client.updateUser(params);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_delete',
        'Permanently delete a Remnawave user',
        {
            userId: userIdField.describe('User numeric ID to delete'),
        },
        async ({ userId }) => {
            try {
                await client.deleteUser(userId);
                return toolResult({ success: true, message: `User ${userId} deleted` });
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_enable',
        'Enable a disabled Remnawave user (restore VPN access)',
        {
            userId: userIdField,
        },
        async ({ userId }) => {
            try {
                const result = await client.enableUser(userId);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_disable',
        'Disable a Remnawave user (block VPN access)',
        {
            userId: userIdField,
        },
        async ({ userId }) => {
            try {
                const result = await client.disableUser(userId);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_revoke_subscription',
        'Revoke subscription for a Remnawave user (generates new subscription link)',
        {
            userId: userIdField,
        },
        async ({ userId }) => {
            try {
                const result = await client.revokeUserSubscription(userId);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_reset_traffic',
        'Reset traffic counter for a Remnawave user',
        {
            userId: userIdField,
        },
        async ({ userId }) => {
            try {
                const result = await client.resetUserTraffic(userId);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_extend_expiration',
        'Extend a single user expiration date by a number of days',
        {
            userId: userIdField,
            days: z.number().describe('Number of days to extend'),
        },
        async ({ userId, days }) => {
            try {
                const result = await client.extendUserExpiration(userId, days);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_bulk_delete_by_status',
        'Bulk delete users by status',
        {
            status: z.enum(['ACTIVE', 'DISABLED', 'LIMITED', 'EXPIRED']).describe('User status to delete'),
        },
        async (params) => {
            try {
                const result = await client.bulkDeleteUsersByStatus(params);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_bulk_update',
        'Bulk update selected users',
        {
            userIds: z.array(z.number()).describe('Array of user numeric IDs to update'),
            status: z.enum(['ACTIVE', 'DISABLED', 'LIMITED', 'EXPIRED']).optional().describe('New status'),
            expireAt: z.string().optional().describe('New expiration date (ISO 8601)'),
            trafficLimitBytes: z.number().optional().describe('New traffic limit'),
            trafficLimitStrategy: z.enum(['NO_RESET', 'DAY', 'WEEK', 'MONTH', 'MONTH_ROLLING']).optional().describe('Traffic reset period'),
            description: z.string().optional().describe('User description'),
            telegramId: z.number().optional().describe('Telegram user ID'),
            email: z.string().optional().describe('User email'),
            tag: z.string().optional().describe('User tag'),
            hwidDeviceLimit: z.number().optional().describe('Max HWID devices'),
            externalSquadUuid: z.string().optional().describe('External squad UUID'),
        },
        async (params) => {
            try {
                const { userIds, ...fields } = params;
                const result = await client.bulkUpdateUsers({ userIds, fields });
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_bulk_reset_traffic',
        'Bulk reset traffic for selected users',
        {
            userIds: z.array(z.number()).describe('Array of user numeric IDs'),
        },
        async (params) => {
            try {
                const result = await client.bulkResetUsersTraffic(params);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_bulk_revoke_subscription',
        'Bulk revoke subscriptions for selected users',
        {
            userIds: z.array(z.number()).describe('Array of user numeric IDs'),
        },
        async (params) => {
            try {
                const result = await client.bulkRevokeUsersSubscription(params);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_bulk_delete',
        'Bulk delete selected users',
        {
            userIds: z.array(z.number()).describe('Array of user numeric IDs to delete'),
        },
        async (params) => {
            try {
                const result = await client.bulkDeleteUsers(params);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_bulk_update_squads',
        'Bulk update squad assignments for selected users',
        {
            userIds: z.array(z.number()).describe('Array of user numeric IDs'),
            activeInternalSquads: z.array(z.string()).describe('Squad UUIDs to assign'),
        },
        async (params) => {
            try {
                const result = await client.bulkUpdateUserSquads(params);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_bulk_extend_expiration',
        'Bulk extend expiration date for selected users',
        {
            userIds: z.array(z.number()).describe('Array of user numeric IDs'),
            extendDays: z.number().describe('Number of days to extend'),
        },
        async (params) => {
            try {
                const result = await client.bulkExtendUsersExpiration(params);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_bulk_all_update',
        'Update ALL users at once',
        {
            status: z.enum(['ACTIVE', 'DISABLED', 'LIMITED', 'EXPIRED']).optional().describe('New status for all'),
            expireAt: z.string().optional().describe('New expiration date for all'),
            trafficLimitBytes: z.number().optional().describe('Traffic limit in bytes'),
            trafficLimitStrategy: z.enum(['NO_RESET', 'DAY', 'WEEK', 'MONTH', 'MONTH_ROLLING']).optional().describe('Traffic reset period'),
            description: z.string().optional().describe('User description'),
            telegramId: z.number().optional().describe('Telegram user ID'),
            email: z.string().optional().describe('User email'),
            tag: z.string().optional().describe('User tag'),
            hwidDeviceLimit: z.number().optional().describe('Max HWID devices'),
        },
        async (params) => {
            try {
                const result = await client.bulkAllUpdateUsers(params);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_bulk_all_reset_traffic',
        'Reset traffic counters for ALL users',
        {},
        async () => {
            try {
                const result = await client.bulkAllResetUsersTraffic();
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_bulk_all_extend_expiration',
        'Extend expiration date for ALL users',
        {
            extendDays: z.number().describe('Number of days to extend'),
        },
        async (params) => {
            try {
                const result = await client.bulkAllExtendUsersExpiration(params);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );
}
