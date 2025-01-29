import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as chalk from 'chalk'

const execAsync = promisify(exec)

async function restructureProject() {
    try {
        console.log(chalk.blue('\n🚀 Restructuring project for NuCode...\n'))

        // Get current directory structure
        const currentDir = process.cwd()
        const parentDir = path.dirname(currentDir)
        const targetDir = path.join(parentDir, 'NuCode')

        // Create new directory
        console.log(chalk.yellow('📁 Creating new directory structure...'))
        await fs.mkdir(targetDir, { recursive: true })

        // Move all files to new directory
        console.log(chalk.yellow('📦 Moving files to new location...'))
        const files = await fs.readdir(currentDir)
        for (const file of files) {
            if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
                await fs.rename(
                    path.join(currentDir, file),
                    path.join(targetDir, file)
                )
            }
        }

        // Initialize git repository
        console.log(chalk.yellow('\n🔄 Setting up Git repository...'))
        process.chdir(targetDir)
        await execAsync('git init')

        // Update package.json
        console.log(chalk.yellow('\n📝 Updating package.json...'))
        const packageJsonPath = path.join(targetDir, 'package.json')
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'))
        
        packageJson.name = 'nucode'
        packageJson.displayName = 'NuCode'
        packageJson.publisher = 'DrugsAreMyLife'
        packageJson.repository = {
            type: 'git',
            url: 'https://github.com/DrugsAreMyLife/NuCode.git'
        }
        
        await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2))

        // Create initial commit
        console.log(chalk.yellow('\n📝 Creating initial commit...'))
        await execAsync('git add .')
        await execAsync('git commit -m "Initial commit: Fork from Roo-code"')

        // Add remotes
        console.log(chalk.yellow('\n🔗 Setting up Git remotes...'))
        await execAsync('git remote add origin https://github.com/DrugsAreMyLife/NuCode.git')
        await execAsync('git remote add upstream https://github.com/rooveterinaryinc/roo-code.git')

        // Update VS Code settings paths
        console.log(chalk.yellow('\n⚙️ Updating VS Code settings paths...'))
        const settingsDir = path.join(
            process.env.APPDATA || process.env.HOME || '',
            'Code',
            'User',
            'globalStorage',
            'DrugsAreMyLife.nucode',
            'settings'
        )
        await fs.mkdir(settingsDir, { recursive: true })

        // Create settings files
        const mcpSettings = {
            mcpServers: {
                "update-checker": {
                    command: "node",
                    args: ["src/services/mcp/update-checker/dist/index.js"],
                    env: {
                        NUCODE_HOME: "${globalStorage}/DrugsAreMyLife.nucode",
                        NUCODE_SETTINGS: "${globalStorage}/DrugsAreMyLife.nucode/settings",
                        GITHUB_TOKEN: "${config:nucode.github.token}"
                    },
                    disabled: false,
                    alwaysAllow: []
                }
            }
        }

        await fs.writeFile(
            path.join(settingsDir, 'nucode_mcp_settings.json'),
            JSON.stringify(mcpSettings, null, 2)
        )

        // Create empty custom modes file
        await fs.writeFile(
            path.join(settingsDir, 'nucode_custom_modes.json'),
            JSON.stringify({ customModes: [] }, null, 2)
        )

        // Clean up old directory
        console.log(chalk.yellow('\n🧹 Cleaning up...'))
        await fs.rm(path.join(currentDir, 'node_modules'), { recursive: true, force: true })
        await fs.rm(path.join(currentDir, 'dist'), { recursive: true, force: true })
        await fs.rm(path.join(currentDir, '.git'), { recursive: true, force: true })
        await fs.rmdir(currentDir)

        console.log(chalk.green('\n✅ Project restructured successfully!'))
        console.log(chalk.blue('\nNext steps:'))
        console.log('1. cd ../NuCode')
        console.log('2. npm install')
        console.log('3. npm run build-and-test')
        console.log('4. git push -u origin main')

    } catch (error) {
        console.error(chalk.red('\n❌ Error during restructuring:'))
        console.error(chalk.red(error instanceof Error ? error.message : String(error)))
        process.exit(1)
    }
}

// Run restructuring
restructureProject().catch(error => {
    console.error(chalk.red('\n❌ Unexpected error:'))
    console.error(chalk.red(error instanceof Error ? error.message : String(error)))
    process.exit(1)
})