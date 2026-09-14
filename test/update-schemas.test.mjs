import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const dist = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'index.js'),
    'utf8',
);

function toolSlice(toolName, length = 2500) {
    const idx = dist.indexOf(`"${toolName}"`);
    assert.notEqual(idx, -1, `bundled CLI is missing tool ${toolName}`);
    return dist.slice(idx, idx + length);
}

test('config_profiles_update exposes optional config', () => {
    const slice = toolSlice('config_profiles_update');
    assert.match(
        slice,
        /config:\s*\w+(?:\.\w+)*\.record\(\w+(?:\.\w+)*\.unknown\(\)\)\.optional\(\)/,
        'config_profiles_update must accept optional config so agents can edit the core Xray/sing-box object',
    );
});

test('sub_page_configs_update exposes optional config', () => {
    const slice = toolSlice('sub_page_configs_update');
    assert.match(
        slice,
        /config:\s*\w+(?:\.\w+)*\.record\(\w+(?:\.\w+)*\.unknown\(\)\)\.optional\(\)/,
        'sub_page_configs_update must accept optional config',
    );
});

test('node_plugins_update exposes optional pluginConfig', () => {
    const slice = toolSlice('node_plugins_update');
    assert.match(
        slice,
        /pluginConfig:\s*\w+(?:\.\w+)*\.record\(\w+(?:\.\w+)*\.unknown\(\)\)\.optional\(\)/,
        'node_plugins_update must accept optional pluginConfig',
    );
});

test('squads_update exposes optional inbounds', () => {
    const slice = toolSlice('squads_update');
    assert.match(
        slice,
        /inbounds:\s*\w+(?:\.\w+)*\.array\(\w+(?:\.\w+)*\.string\(\)\)\s*\.optional\(\)/,
        'squads_update must accept optional inbounds',
    );
});

test('edit_config_profile prompt is registered', () => {
    assert.match(dist, /"edit_config_profile"/);
});

test('contract 3.4 tools replace IP control with connections', () => {
    for (const tool of [
        'connections_by_user',
        'connections_drop',
        'node_integrations_list',
        'node_ssh_create_ticket',
        'shared_lists_list',
        'users_extend_expiration',
        'system_stats_digest',
    ]) {
        assert.notEqual(dist.indexOf(`"${tool}"`), -1, `missing tool ${tool}`);
    }
    assert.equal(dist.indexOf('"ip_control_fetch_ips"'), -1);
    assert.equal(dist.indexOf('"users_get_by_telegram_id"'), -1);
    assert.match(dist, /@remnawave\/backend-contract\/build\/backend\/api\/routes\.js/);
});

test('api_tokens_create uses 3.4 name and expiresInDays', () => {
    const slice = toolSlice('api_tokens_create');
    assert.match(slice, /name:\s*\w+(?:\.\w+)*\.string\(\)/);
    assert.match(slice, /expiresInDays:\s*\w+(?:\.\w+)*\.number\(\)/);
    assert.doesNotMatch(slice, /tokenName/);
});

test('hosts_create uses tags and internalSquads', () => {
    const slice = toolSlice('hosts_create', 4000);
    assert.match(slice, /tags:\s*\w+(?:\.\w+)*\.array\(\w+(?:\.\w+)*\.string\(\)\)/);
    assert.match(slice, /internalSquads:/);
    assert.doesNotMatch(slice, /excludedInternalSquads/);
});

test('nodes_bulk_profile_modification sends nested configProfile, not a flat body', () => {
    const slice = toolSlice('nodes_bulk_profile_modification', 2000);
    assert.match(
        slice,
        /configProfile:\s*nodeConfigProfileSchema/,
        'MCP schema must expose nested configProfile to match the Remnawave API',
    );
    assert.match(slice, /uuids:/);
    assert.doesNotMatch(
        slice,
        /configProfileUuid:\s*\w+(?:\.\w+)*\.string\(\)/,
        'Do not flatten activeConfigProfileUuid to top-level configProfileUuid',
    );
    assert.match(
        dist,
        /nodeConfigProfileSchema = [\s\S]*activeConfigProfileUuid:[\s\S]*activeInbounds:/,
        'Shared configProfile schema must include activeConfigProfileUuid and activeInbounds',
    );
});

test('nodes_create uses nested configProfile object', () => {
    const slice = toolSlice('nodes_create', 3000);
    assert.match(
        slice,
        /configProfile:\s*nodeConfigProfileSchema/,
        'nodes_create must take configProfile: { activeConfigProfileUuid, activeInbounds }',
    );
    assert.doesNotMatch(
        slice,
        /activeConfigProfileUuid:\s*\w+(?:\.\w+)*\.string\(\)\s*\.describe\("Config profile UUID to assign"\)/,
    );
});

test('nodes_update accepts nested configProfile', () => {
    const slice = toolSlice('nodes_update', 2500);
    assert.match(
        slice,
        /configProfile:\s*nodeConfigProfileSchema\.optional\(\)/,
        'nodes_update must accept nested configProfile so profile/inbound changes are not dropped',
    );
});

test('hosts_create and hosts_update nest inbound instead of flattening profile UUIDs', () => {
    const createSlice = toolSlice('hosts_create', 2500);
    assert.match(
        createSlice,
        /inbound:\s*hostInboundSchema/,
        'hosts_create must send inbound: { configProfileUuid, configProfileInboundUuid }',
    );

    const updateSlice = toolSlice('hosts_update', 2500);
    assert.match(
        updateSlice,
        /inbound:\s*hostInboundSchema\.optional\(\)/,
        'hosts_update must send nested inbound, not top-level configProfileUuid',
    );
    assert.match(
        dist,
        /hostInboundSchema = [\s\S]*configProfileUuid:[\s\S]*configProfileInboundUuid:/,
        'Shared inbound schema must include both profile and inbound UUIDs',
    );
});

test('handlers forward nested objects instead of remapping flat fields', () => {
    assert.doesNotMatch(
        dist,
        /activeConfigProfileUuid:\s*params\.configProfileUuid/,
        'Must not remap flattened configProfileUuid into the API body',
    );
    assert.doesNotMatch(
        dist,
        /configProfileUuid:\s*params\.configProfileUuid/,
        'Must not rebuild inbound from flattened top-level profile UUIDs',
    );
    assert.match(dist, /client\.bulkNodeProfileModification\(\s*compactBody\(params\)/);
    assert.match(dist, /client\.createNode\(compactBody\(params\)\)/);
    assert.match(dist, /client\.createHost\(compactBody\(params\)\)/);
    assert.match(dist, /client\.updateHost\(compactBody\(params\)\)/);
});
