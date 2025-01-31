import type { Mode } from '../../shared/modes';
import type { ExtensionState } from '../../shared/ExtensionMessage';

interface CommandContext {
  command: string;
  args?: string[];
}

export class CommandAnalyzer {
  private readonly frontendCommands = [
    'npm run dev',
    'npm start',
    'yarn dev',
    'ng serve',
    'vue serve'
  ];

  private readonly backendCommands = [
    'node server.js',
    'npm run server',
    'python manage.py runserver',
    'go run',
    'docker-compose up'
  ];

  private readonly devopsCommands = [
    'docker',
    'kubectl',
    'terraform',
    'aws',
    'gcloud'
  ];

  private readonly securityCommands = [
    'npm audit',
    'yarn audit',
    'snyk test',
    'trivy',
    'sonarqube'
  ];

  public analyzeCommand(state: Partial<ExtensionState>, context: CommandContext): Mode | null {
    const confidence = this.calculateConfidence(context);
    if (confidence < (state.autoSwitchSensitivity || 0.8)) {
      return null;
    }

    const command = context.command.toLowerCase();

    // Frontend commands
    if (this.frontendCommands.some(cmd => command.includes(cmd.toLowerCase()))) {
      return 'frontend';
    }

    // Backend commands
    if (this.backendCommands.some(cmd => command.includes(cmd.toLowerCase()))) {
      return 'backend';
    }

    // DevOps commands
    if (this.devopsCommands.some(cmd => command.includes(cmd.toLowerCase()))) {
      return 'devops';
    }

    // Security commands
    if (this.securityCommands.some(cmd => command.includes(cmd.toLowerCase()))) {
      return 'security';
    }

    return null;
  }

  public suggestModeForCommand(command: string): Mode | null {
    // Analyze command without sensitivity threshold
    const context: CommandContext = { command };
    const confidence = this.calculateConfidence({ command });

    if (confidence >= 0.5) { // Lower threshold for suggestions
      return this.analyzeCommand({ autoSwitchSensitivity: 0.5 }, context);
    }

    return null;
  }

  private calculateConfidence(context: CommandContext): number {
    let confidence = 0;
    const command = context.command.toLowerCase();

    // Exact command matches
    if (this.frontendCommands.some(cmd => command === cmd.toLowerCase())) {
      confidence += 0.8;
    }
    if (this.backendCommands.some(cmd => command === cmd.toLowerCase())) {
      confidence += 0.8;
    }
    if (this.devopsCommands.some(cmd => command === cmd.toLowerCase())) {
      confidence += 0.8;
    }
    if (this.securityCommands.some(cmd => command === cmd.toLowerCase())) {
      confidence += 0.8;
    }

    // Partial command matches
    if (this.frontendCommands.some(cmd => command.includes(cmd.toLowerCase()))) {
      confidence += 0.5;
    }
    if (this.backendCommands.some(cmd => command.includes(cmd.toLowerCase()))) {
      confidence += 0.5;
    }
    if (this.devopsCommands.some(cmd => command.includes(cmd.toLowerCase()))) {
      confidence += 0.5;
    }
    if (this.securityCommands.some(cmd => command.includes(cmd.toLowerCase()))) {
      confidence += 0.5;
    }

    // Additional context from arguments
    if (context.args) {
      if (context.args.some(arg => arg.includes('--prod') || arg.includes('--production'))) {
        confidence += 0.1;
      }
      if (context.args.some(arg => arg.includes('--dev') || arg.includes('--development'))) {
        confidence += 0.1;
      }
    }

    return Math.min(confidence, 1);
  }
}