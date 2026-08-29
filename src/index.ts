import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadConfig } from './config.js';
import { createServer } from './server.js';

try {
    const config = loadConfig();
    const server = createServer(config);
    const transport = new StdioServerTransport();
    await server.connect(transport);
} catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[remnawave-mcp] ${message}`);
    process.exit(1);
}
