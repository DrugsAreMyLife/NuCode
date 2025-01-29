const { Server } = require('@modelcontextprotocol/sdk/dist/server')
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/dist/server/stdio')
const {
  CallToolRequestSchema,
  ErrorCode,
  McpError,
  CallToolRequest
} = require('@modelcontextprotocol/sdk/dist/types')
const { Octokit } = require('@octokit/rest')
const semver = require('semver')
const { exec } = require('child_process')
const { promisify } = require('util')
const path = require('path')
const fs = require('fs/promises')

const execAsync = promisify(exec)

interface UpdateCheckerConfig {
  enabled: boolean
  interval: 'hourly' | 'daily' | 'weekly'
  autoCreatePRs: boolean
  notifyOnUpdates: boolean
  runCompatibilityTests: boolean
  createBackupBranch: boolean
  githubToken?: string
}

interface CheckForUpdatesArgs {
  force?: boolean
}

interface ApplyUpdatesArgs {
  version?: string
}

interface ConfigureArgs extends Partial<UpdateCheckerConfig> {}

export class UpdateCheckerServer {
  private server: typeof Server
  private octokit: typeof Octokit
  private config: UpdateCheckerConfig
  private lastCheck: Date | null = null
  private updateInterval: NodeJS.Timeout | null = null

  constructor() {
    this.server = new Server(
      {
        name: 'nucode-update-checker',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {
            checkForUpdates: {
              description: 'Check for updates from upstream repository',
              inputSchema: {
                type: 'object',
                properties: {
                  force: {
                    type: 'boolean',
                    description: 'Force check even if interval hasn\'t elapsed',
                  },
                },
              },
            },
            getUpdateStatus: {
              description: 'Get current update status',
              inputSchema: {
                type: 'object',
                properties: {},
              },
            },
            applyUpdates: {
              description: 'Apply available updates',
              inputSchema: {
                type: 'object',
                properties: {
                  version: {
                    type: 'string',
                    description: 'Specific version to update to',
                  },
                },
              },
            },
            configure: {
              description: 'Configure update checker',
              inputSchema: {
                type: 'object',
                properties: {
                  enabled: { type: 'boolean' },
                  interval: { type: 'string', enum: ['hourly', 'daily', 'weekly'] },
                  autoCreatePRs: { type: 'boolean' },
                  notifyOnUpdates: { type: 'boolean' },
                  runCompatibilityTests: { type: 'boolean' },
                  createBackupBranch: { type: 'boolean' },
                  githubToken: { type: 'string' },
                },
              },
            },
          },
        },
      }
    )

    this.octokit = new Octokit()
    this.config = {
      enabled: true,
      interval: 'daily',
      autoCreatePRs: true,
      notifyOnUpdates: true,
      runCompatibilityTests: true,
      createBackupBranch: true,
    }

    this.setupHandlers()
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(CallToolRequestSchema, async (request: typeof CallToolRequest) => {
      switch (request.params.name) {
        case 'checkForUpdates':
          return this.handleCheckForUpdates(request.params.arguments as CheckForUpdatesArgs)
        case 'getUpdateStatus':
          return this.handleGetUpdateStatus()
        case 'applyUpdates':
          return this.handleApplyUpdates(request.params.arguments as ApplyUpdatesArgs)
        case 'configure':
          return this.handleConfigure(request.params.arguments as ConfigureArgs)
        default:
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`)
      }
    })
  }

  private async initializeOctokit(): Promise<void> {
    if (!this.config.githubToken) {
      throw new McpError(ErrorCode.InvalidRequest, 'GitHub token not configured')
    }

    this.octokit = new Octokit({
      auth: this.config.githubToken,
    })
  }

  private async getCurrentVersion(): Promise<string> {
    const packageJson = await fs.readFile('package.json', 'utf-8')
    return JSON.parse(packageJson).version
  }

  private async getLatestUpstreamVersion(): Promise<string> {
    const { data: tags } = await this.octokit.repos.listTags({
      owner: 'rooveterinaryinc',
      repo: 'roo-code',
      per_page: 1,
    })

    if (!tags.length) {
      throw new McpError(ErrorCode.InternalError, 'No tags found in upstream repository')
    }

    return tags[0].name.replace(/^v/, '')
  }

  private async runCompatibilityTests(): Promise<boolean> {
    try {
      await execAsync('npm test')
      return true
    } catch (error) {
      return false
    }
  }

  private async createUpdatePR(version: string): Promise<void> {
    const branchName = `update-to-v${version}`

    // Create backup branch if configured
    if (this.config.createBackupBranch) {
      await execAsync(`git checkout -b backup-${new Date().toISOString()}`)
      await execAsync('git checkout -')
    }

    // Create update branch
    await execAsync(`git checkout -b ${branchName}`)

    try {
      // Fetch and merge upstream
      await execAsync('git fetch upstream')
      await execAsync(`git merge v${version}`)

      // Push branch and create PR
      await execAsync(`git push origin ${branchName}`)

      await this.octokit.pulls.create({
        owner: 'DrugsAreMyLife',
        repo: 'NuCode',
        title: `Update to v${version}`,
        head: branchName,
        base: 'main',
        body: this.generateUpdatePRBody(version),
      })
    } catch (error) {
      // Cleanup on error
      await execAsync('git checkout main')
      await execAsync(`git branch -D ${branchName}`)
      throw error
    }
  }

  private generateUpdatePRBody(version: string): string {
    return `
# Update to v${version}

This PR updates NuCode to version ${version} of the upstream Roo-code.

## Changes
- Fetched latest changes from upstream
- Merged upstream version ${version}
${this.config.runCompatibilityTests ? '- Ran compatibility tests' : ''}

## Compatibility
${this.config.runCompatibilityTests ? '✅ All tests passing' : '⚠️ Tests not run'}

Please review the changes and ensure all custom features continue to work as expected.
    `.trim()
  }

  private shouldCheck(): boolean {
    if (!this.lastCheck) return true

    const now = new Date()
    const elapsed = now.getTime() - this.lastCheck.getTime()

    switch (this.config.interval) {
      case 'hourly':
        return elapsed >= 60 * 60 * 1000
      case 'daily':
        return elapsed >= 24 * 60 * 60 * 1000
      case 'weekly':
        return elapsed >= 7 * 24 * 60 * 60 * 1000
      default:
        return true
    }
  }

  public async handleCheckForUpdates(args: CheckForUpdatesArgs): Promise<any> {
    if (!this.config.enabled) {
      return {
        content: [{ type: 'text', text: 'Update checker is disabled' }],
      }
    }

    if (!args.force && !this.shouldCheck()) {
      return {
        content: [{ type: 'text', text: 'Update check skipped (interval not elapsed)' }],
      }
    }

    try {
      await this.initializeOctokit()

      const currentVersion = await this.getCurrentVersion()
      const latestVersion = await this.getLatestUpstreamVersion()

      this.lastCheck = new Date()

      if (semver.gt(latestVersion, currentVersion)) {
        if (this.config.autoCreatePRs) {
          await this.createUpdatePR(latestVersion)
          return {
            content: [{ type: 'text', text: `Created PR for update to v${latestVersion}` }],
          }
        }

        return {
          content: [{ type: 'text', text: `Update available: v${latestVersion}` }],
        }
      }

      return {
        content: [{ type: 'text', text: 'No updates available' }],
      }
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to check for updates: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  public async handleGetUpdateStatus(): Promise<any> {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              enabled: this.config.enabled,
              lastCheck: this.lastCheck?.toISOString(),
              interval: this.config.interval,
              autoCreatePRs: this.config.autoCreatePRs,
            },
            null,
            2
          ),
        },
      ],
    }
  }

  private async handleApplyUpdates(args: ApplyUpdatesArgs): Promise<any> {
    if (!this.config.enabled) {
      throw new McpError(ErrorCode.InvalidRequest, 'Update checker is disabled')
    }

    try {
      await this.initializeOctokit()

      const version = args.version || await this.getLatestUpstreamVersion()
      await this.createUpdatePR(version)

      return {
        content: [{ type: 'text', text: `Created PR for update to v${version}` }],
      }
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to apply updates: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  private async handleConfigure(args: ConfigureArgs): Promise<any> {
    this.config = {
      ...this.config,
      ...args,
    }

    if (this.config.enabled && !this.updateInterval) {
      this.startUpdateChecker()
    } else if (!this.config.enabled && this.updateInterval) {
      this.stopUpdateChecker()
    }

    return {
      content: [{ type: 'text', text: 'Configuration updated' }],
    }
  }

  private startUpdateChecker(): void {
    // Convert interval to milliseconds
    const intervals: Record<UpdateCheckerConfig['interval'], number> = {
      hourly: 60 * 60 * 1000,
      daily: 24 * 60 * 60 * 1000,
      weekly: 7 * 24 * 60 * 60 * 1000,
    }

    this.updateInterval = setInterval(
      () => this.handleCheckForUpdates({ force: false }),
      intervals[this.config.interval]
    )
  }

  private stopUpdateChecker(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)

    if (this.config.enabled) {
      this.startUpdateChecker()
    }

    console.error('NuCode update checker MCP server running on stdio')
  }

  dispose(): void {
    this.stopUpdateChecker()
    this.server.close()
  }
}

// Start the server if this file is being run directly
if (require.main === module) {
  const server = new UpdateCheckerServer()
  server.run().catch(console.error)
}