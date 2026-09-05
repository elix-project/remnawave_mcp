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
