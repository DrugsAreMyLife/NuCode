import { Mode } from '../../shared/modes';
import { ExtensionState } from '../../shared/ExtensionMessage';

interface FileContext {
  fileName: string;
  content: string;
}

interface AnalysisResult {
  type: string;
  confidence: number;
}

export class ModeManager {
  private currentMode: Mode = 'code';
  private sensitivity: number;

  constructor(sensitivity: number = 0.8) {
    this.sensitivity = sensitivity;
  }

  public shouldSwitchMode(state: Partial<ExtensionState>, file: FileContext): Mode | null {
    const confidence = this.analyzeContext(file);
    if (confidence < (state.autoSwitchSensitivity || this.sensitivity)) {
      return null;
    }

    // File type based switching
    if (file.fileName.match(/\.(css|html|jsx?|tsx?)$/)) {
      return 'frontend';
    }
    if (file.fileName.match(/\.(py|java|go|rs)$/)) {
      return 'backend';
    }

    // Content based switching
    if (file.content.includes('app.post') || file.content.includes('app.get')) {
      return 'backend';
    }
    if (file.content.includes('class') && file.content.includes('extends')) {
      return 'code';
    }

    return null;
  }

  public analyzeProjectStructure(files: string[]): AnalysisResult {
    let confidence = 0;
    let type = 'unknown';

    // React app detection
    if (
      files.includes('src/components/') &&
      files.includes('package.json')
    ) {
      confidence += 0.5;
      type = 'react-app';
    }

    // Backend app detection
    if (
      files.includes('src/api/') ||
      files.includes('src/routes/')
    ) {
      confidence += 0.4;
      type = type === 'react-app' ? 'fullstack-app' : 'backend-app';
    }

    return {
      type,
      confidence: Math.min(confidence, 1)
    };
  }

  public analyzeTechStack(dependencies: Record<string, string>) {
    const result = {
      frontend: [] as string[],
      backend: [] as string[],
      languages: [] as string[]
    };

    // Frontend dependencies
    if (dependencies.react) result.frontend.push('react');
    if (dependencies.vue) result.frontend.push('vue');
    if (dependencies.angular) result.frontend.push('angular');

    // Backend dependencies
    if (dependencies.express) result.backend.push('express');
    if (dependencies.fastify) result.backend.push('fastify');
    if (dependencies.nest) result.backend.push('nest');

    // Languages
    if (dependencies.typescript) result.languages.push('typescript');
    if (dependencies.babel) result.languages.push('javascript');
    if (dependencies.python) result.languages.push('python');

    return result;
  }

  private analyzeContext(file: FileContext): number {
    let confidence = 0;

    // File type confidence
    if (file.fileName.match(/\.(css|html|jsx?|tsx?)$/)) {
      confidence += 0.6;
    }
    if (file.fileName.match(/\.(py|java|go|rs)$/)) {
      confidence += 0.6;
    }

    // Content confidence
    if (file.content.includes('app.post') || file.content.includes('app.get')) {
      confidence += 0.3;
    }
    if (file.content.includes('class') && file.content.includes('extends')) {
      confidence += 0.2;
    }

    return Math.min(confidence, 1);
  }
}