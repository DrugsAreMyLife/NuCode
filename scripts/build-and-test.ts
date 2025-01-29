import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as chalk from 'chalk'

const execAsync = promisify(exec)

interface BuildStep {
    name: string
    command: string
    errorMessage: string
}

async function buildAndTest() {
    console.log(chalk.blue('\n🚀 Starting build and test process for NuCode...\n'))

    const steps: BuildStep[] = [
        {
            name: 'Clean previous builds',
            command: 'rm -rf dist out',
            errorMessage: 'Failed to clean previous builds'
        },
        {
            name: 'Install dependencies',
            command: 'npm install',
            errorMessage: 'Failed to install dependencies'
        },
        {
            name: 'Lint code',
            command: 'npm run lint',
            errorMessage: 'Linting failed - please fix code style issues'
        },
        {
            name: 'Build MCP servers',
            command: 'npm run build-mcp',
            errorMessage: 'Failed to build MCP servers'
        },
        {
            name: 'Compile TypeScript',
            command: 'npm run compile',
            errorMessage: 'TypeScript compilation failed'
        },
        {
            name: 'Run tests',
            command: 'npm test',
            errorMessage: 'Tests failed - please fix failing tests'
        },
        {
            name: 'Package extension',
            command: 'npm run package',
            errorMessage: 'Failed to package extension'
        }
    ]

    try {
        // Verify package.json
        console.log(chalk.yellow('📦 Verifying package.json...'))
        const packageJson = JSON.parse(await fs.readFile('package.json', 'utf-8'))
        
        if (packageJson.name === 'nucode' && packageJson.publisher === 'your-publisher') {
            throw new Error('Please update package.json with your publisher ID and repository details')
        }

        // Run build steps
        for (const step of steps) {
            console.log(chalk.yellow(`\n🔨 ${step.name}...`))
            try {
                const { stdout, stderr } = await execAsync(step.command)
                if (stdout) console.log(stdout)
                if (stderr) console.error(chalk.yellow(stderr))
            } catch (error) {
                console.error(chalk.red(`\n❌ ${step.errorMessage}`))
                if (error instanceof Error) {
                    console.error(chalk.red(error.message))
                }
                process.exit(1)
            }
        }

        // Verify dist directory
        console.log(chalk.yellow('\n📁 Verifying build output...'))
        const distExists = await fs.access('dist').then(() => true).catch(() => false)
        if (!distExists) {
            throw new Error('Build output directory not found')
        }

        // Verify extension package
        const vsixFiles = await fs.readdir('.')
            .then(files => files.filter(f => f.endsWith('.vsix')))
        if (vsixFiles.length === 0) {
            console.log(chalk.yellow('\n📦 Creating VSIX package...'))
            await execAsync('vsce package')
        }

        console.log(chalk.green('\n✅ Build and test completed successfully!'))
        console.log(chalk.blue('\nNext steps:'))
        console.log('1. Review the generated VSIX package')
        console.log('2. Test the extension in a new VS Code window')
        console.log('3. Publish to the VS Code Marketplace: vsce publish')

    } catch (error) {
        console.error(chalk.red('\n❌ Build and test failed:'))
        if (error instanceof Error) {
            console.error(chalk.red(error.message))
        }
        process.exit(1)
    }
}

// Run build and test
buildAndTest().catch(error => {
    console.error(chalk.red('\n❌ Unexpected error:'))
    console.error(chalk.red(error instanceof Error ? error.message : String(error)))
    process.exit(1)
})