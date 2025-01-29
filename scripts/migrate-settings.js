import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
async function migrateSettings() {
    const homeDir = os.homedir();
    const vscodeDir = path.join(homeDir, '.vscode');
    const globalStorageDir = path.join(homeDir, 'AppData', 'Roaming', 'Code', 'User', 'globalStorage');
    // Old and new settings paths
    const oldSettingsDir = path.join(globalStorageDir, 'rooveterinaryinc.roo-cline', 'settings');
    const newSettingsDir = path.join(globalStorageDir, 'your-publisher.nucode', 'settings');
    try {
        // Create new settings directory if it doesn't exist
        await fs.mkdir(newSettingsDir, { recursive: true });
        // Migrate custom modes
        const oldModesPath = path.join(oldSettingsDir, 'cline_custom_modes.json');
        const newModesPath = path.join(newSettingsDir, 'nucode_custom_modes.json');
        if (await fileExists(oldModesPath)) {
            const modesContent = await fs.readFile(oldModesPath, 'utf-8');
            const modes = JSON.parse(modesContent);
            await fs.writeFile(newModesPath, JSON.stringify(modes, null, 2));
            console.log('✅ Migrated custom modes');
        }
        // Migrate MCP settings
        const oldMcpPath = path.join(oldSettingsDir, 'cline_mcp_settings.json');
        const newMcpPath = path.join(newSettingsDir, 'nucode_mcp_settings.json');
        if (await fileExists(oldMcpPath)) {
            const mcpContent = await fs.readFile(oldMcpPath, 'utf-8');
            const mcpSettings = JSON.parse(mcpContent);
            // Update paths and identifiers in MCP settings
            const updatedMcpSettings = {
                mcpServers: Object.fromEntries(Object.entries(mcpSettings.mcpServers).map(([key, value]) => {
                    const updatedValue = {
                        ...value,
                        env: {
                            ...value.env,
                            NUCODE_HOME: '${globalStorage}/your-publisher.nucode',
                            NUCODE_SETTINGS: '${globalStorage}/your-publisher.nucode/settings',
                        }
                    };
                    // Update any Roo-code specific paths
                    if (updatedValue.args) {
                        updatedValue.args = updatedValue.args.map((arg) => arg.replace(/roo-code/g, 'nucode')
                            .replace(/cline/g, 'nucode'));
                    }
                    return [key, updatedValue];
                }))
            };
            await fs.writeFile(newMcpPath, JSON.stringify(updatedMcpSettings, null, 2));
            console.log('✅ Migrated MCP settings');
        }
        // Migrate VS Code settings
        const vscodeSettingsPath = path.join(vscodeDir, 'settings.json');
        if (await fileExists(vscodeSettingsPath)) {
            const settingsContent = await fs.readFile(vscodeSettingsPath, 'utf-8');
            const settings = JSON.parse(settingsContent);
            // Update VS Code settings
            const updatedSettings = Object.fromEntries(Object.entries(settings).map(([key, value]) => {
                const newKey = key.replace(/^roo-code\./, 'nucode.')
                    .replace(/^cline\./, 'nucode.');
                return [newKey, value];
            }));
            await fs.writeFile(vscodeSettingsPath, JSON.stringify(updatedSettings, null, 2));
            console.log('✅ Migrated VS Code settings');
        }
        console.log('\n🎉 Migration complete! Your settings have been transferred to NuCode.');
        console.log('\nNote: The original Roo-code settings were not modified or deleted.');
        console.log('You can safely remove them after verifying NuCode works as expected.');
    }
    catch (error) {
        console.error('❌ Error during migration:', error);
        process.exit(1);
    }
}
async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    }
    catch {
        return false;
    }
}
// Run migration
migrateSettings().catch(console.error);
//# sourceMappingURL=migrate-settings.js.map