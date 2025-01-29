import * as vscode from 'vscode';
import { TransitionEngine } from './core/transition/TransitionEngine';
import { ConfigManager } from './core/config/ConfigManager';
import { CustomModesManager } from './core/config/CustomModesManager';
import { UpdateCheckerServer } from './services/mcp/update-checker';
export const EXTENSION_ID = 'your-publisher.nucode';
export const CONFIG_PREFIX = 'nucode';
export const STORAGE_DIR = 'nucode_settings';
let extensionContext;
export async function activate(context) {
    extensionContext = context;
    // Initialize configuration manager
    const configManager = new ConfigManager(context);
    // Initialize custom modes manager with new settings path
    const customModesManager = new CustomModesManager(context, async () => {
        // Handle mode updates
        await transitionEngine?.reset();
    });
    // Initialize transition engine
    const transitionEngine = new TransitionEngine(await customModesManager.getCustomModes());
    // Initialize update checker
    const updateChecker = new UpdateCheckerServer();
    // Register commands
    context.subscriptions.push(vscode.commands.registerCommand(`${CONFIG_PREFIX}.start`, () => {
        vscode.window.showInformationMessage('NuCode started');
    }), vscode.commands.registerCommand(`${CONFIG_PREFIX}.stop`, () => {
        vscode.window.showInformationMessage('NuCode stopped');
    }), vscode.commands.registerCommand(`${CONFIG_PREFIX}.switchMode`, async () => {
        const modes = await customModesManager.getCustomModes();
        const items = modes.map(mode => ({
            label: mode.name,
            description: mode.roleDefinition,
            mode: mode
        }));
        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select mode'
        });
        if (selected) {
            await transitionEngine.forceTransition(selected.mode.slug);
        }
    }), vscode.commands.registerCommand(`${CONFIG_PREFIX}.checkForUpdates`, async () => {
        try {
            await updateChecker.handleCheckForUpdates({ force: true });
            vscode.window.showInformationMessage('Update check complete');
        }
        catch (error) {
            vscode.window.showErrorMessage(`Update check failed: ${error}`);
        }
    }));
    // Register status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = '$(rocket) NuCode';
    statusBarItem.tooltip = 'Click to switch mode';
    statusBarItem.command = `${CONFIG_PREFIX}.switchMode`;
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
    // Register webview provider
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(`${CONFIG_PREFIX}.modes`, new ModesWebviewProvider(context, customModesManager)), vscode.window.registerWebviewViewProvider(`${CONFIG_PREFIX}.updates`, new UpdatesWebviewProvider(context, updateChecker)));
    // Start services
    await updateChecker.run();
    // Register cleanup
    context.subscriptions.push({
        dispose: () => {
            updateChecker.dispose();
            transitionEngine.dispose();
            customModesManager.dispose();
        }
    });
}
export function deactivate() {
    // Cleanup will be handled by disposables
}
class ModesWebviewProvider {
    context;
    modesManager;
    constructor(context, modesManager) {
        this.context = context;
        this.modesManager = modesManager;
    }
    async resolveWebviewView(webviewView, _context, _token) {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.context.extensionUri]
        };
        webviewView.webview.html = await this.getWebviewContent();
    }
    async getWebviewContent() {
        const modes = await this.modesManager.getCustomModes();
        return `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>NuCode Modes</title>
			</head>
			<body>
				<h2>Available Modes</h2>
				<ul>
					${modes.map(mode => `
						<li>
							<h3>${mode.name}</h3>
							<p>${mode.roleDefinition}</p>
						</li>
					`).join('')}
				</ul>
			</body>
			</html>
		`;
    }
}
class UpdatesWebviewProvider {
    context;
    updateChecker;
    constructor(context, updateChecker) {
        this.context = context;
        this.updateChecker = updateChecker;
    }
    async resolveWebviewView(webviewView, _context, _token) {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.context.extensionUri]
        };
        webviewView.webview.html = await this.getWebviewContent();
    }
    async getWebviewContent() {
        const status = await this.updateChecker.handleGetUpdateStatus();
        return `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>NuCode Updates</title>
			</head>
			<body>
				<h2>Update Status</h2>
				<pre>${status.content[0].text}</pre>
				<button onclick="vscode.postMessage({ command: 'checkUpdates' })">
					Check for Updates
				</button>
			</body>
			</html>
		`;
    }
}
//# sourceMappingURL=extension.js.map