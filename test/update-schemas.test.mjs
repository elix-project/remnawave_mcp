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
