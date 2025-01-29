import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as readline from 'readline';
const execAsync = promisify(exec);
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const question = (query) => {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
};
async function initializeFork() {
    try {
        console.log('🚀 Initializing NuCode fork...\n');
        // Get user information
        const githubUsername = await question('Enter your GitHub username: ');
        const publisherId = await question('Enter your VS Code publisher ID: ');
        const repoName = await question('Enter repository name (default: nucode): ') || 'nucode';
        // Update package.json
        console.log('\n📦 Updating package.json...');
        const packageJsonPath = path.join(process.cwd(), 'package.json');
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
        packageJson.name = repoName;
        packageJson.displayName = 'NuCode';
        packageJson.publisher = publisherId;
        packageJson.repository = {
            type: 'git',
            url: `https://github.com/${githubUsername}/${repoName}.git`
        };
        await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
        // Initialize git repository
        console.log('\n🔄 Setting up Git repository...');
        await execAsync('git init');
        await execAsync('git add .');
        await execAsync('git commit -m "Initial commit: Fork from Roo-code"');
        // Add upstream remote
        console.log('\n🔗 Adding upstream remote...');
        await execAsync('git remote add upstream https://github.com/rooveterinaryinc/roo-code.git');
        await execAsync('git remote add origin https://github.com/${githubUsername}/${repoName}.git');
        // Create necessary directories
        console.log('\n📁 Creating settings directories...');
        const settingsDir = path.join(process.env.APPDATA || process.env.HOME || '', 'Code', 'User', 'globalStorage', `${publisherId}.${repoName}`, 'settings');
        await fs.mkdir(settingsDir, { recursive: true });
        // Create initial settings files
        console.log('\n⚙️ Creating initial settings...');
        const mcpSettings = {
            mcpServers: {
                "update-checker": {
                    command: "node",
                    args: ["src/services/mcp/update-checker/dist/index.js"],
                    env: {
                        NUCODE_HOME: "${globalStorage}/${publisherId}.${repoName}",
                        NUCODE_SETTINGS: "${globalStorage}/${publisherId}.${repoName}/settings",
                        GITHUB_TOKEN: "${config:nucode.github.token}"
                    },
                    disabled: false,
                    alwaysAllow: []
                }
            }
        };
        await fs.writeFile(path.join(settingsDir, 'nucode_mcp_settings.json'), JSON.stringify(mcpSettings, null, 2));
        // Create empty custom modes file
        await fs.writeFile(path.join(settingsDir, 'nucode_custom_modes.json'), JSON.stringify({ customModes: [] }, null, 2));
        // Update VS Code settings
        console.log('\n🔧 Updating VS Code settings...');
        const vscodeSettingsPath = path.join(process.env.APPDATA || process.env.HOME || '', 'Code', 'User', 'settings.json');
        let vscodeSettings = {};
        try {
            vscodeSettings = JSON.parse(await fs.readFile(vscodeSettingsPath, 'utf-8'));
        }
        catch {
            // File doesn't exist, use empty object
        }
        const settingsPrefix = repoName;
        vscodeSettings[`${settingsPrefix}.updateChecker.enabled`] = true;
        vscodeSettings[`${settingsPrefix}.updateChecker.interval`] = "daily";
        vscodeSettings[`${settingsPrefix}.updateChecker.autoCreatePRs`] = true;
        await fs.writeFile(vscodeSettingsPath, JSON.stringify(vscodeSettings, null, 2));
        console.log('\n✅ Fork initialized successfully!');
        console.log('\nNext steps:');
        console.log('1. Create a new repository on GitHub');
        console.log(`2. Push your code: git push -u origin main`);
        console.log('3. Install the extension in VS Code');
        console.log('4. Run the migration script if needed: npm run migrate-settings');
    }
    catch (error) {
        console.error('\n❌ Error:', error);
        process.exit(1);
    }
    finally {
        rl.close();
    }
}
// Run initialization
initializeFork().catch(console.error);
//# sourceMappingURL=init-fork.js.map