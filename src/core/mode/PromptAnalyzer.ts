import type { Mode } from '../../shared/modes';
import type { ExtensionState } from '../../shared/ExtensionMessage';

interface PromptContext {
  text: string;
  previousMode?: Mode;
}

export class PromptAnalyzer {
  private readonly frontendKeywords = [
    'css',
    'html',
    'layout',
    'styling',
    'responsive',
    'ui',
    'ux',
    'component',
    'animation',
    'design'
  ];

  private readonly backendKeywords = [
    'api',
    'database',
    'server',
    'endpoint',
    'authentication',
    'middleware',
    'cache',
    'performance'
  ];

  private readonly architectKeywords = [
    'architecture',
    'design pattern',
    'system design',
    'scalability',
    'microservices',
    'integration',
    'workflow'
  ];

  private readonly securityKeywords = [
    'security',
    'vulnerability',
    'authentication',
    'authorization',
    'encryption',
    'audit',
    'compliance'
  ];

  private readonly devopsKeywords = [
    'deployment',
    'infrastructure',
    'pipeline',
    'monitoring',
    'kubernetes',
    'docker',
    'ci/cd'
  ];

  public analyzePrompt(state: Partial<ExtensionState>, context: PromptContext): Mode | null {
    const confidence = this.calculateConfidence(context);
    if (confidence < (state.autoSwitchSensitivity || 0.8)) {
      return null;
    }

    const text = context.text.toLowerCase();

    // Frontend mode detection
    if (this.frontendKeywords.some(kw => text.includes(kw.toLowerCase()))) {
      return 'frontend';
    }

    // Backend mode detection
    if (this.backendKeywords.some(kw => text.includes(kw.toLowerCase()))) {
      return 'backend';
    }

    // Architect mode detection
    if (this.architectKeywords.some(kw => text.includes(kw.toLowerCase()))) {
      return 'architect';
    }

    // Security mode detection
    if (this.securityKeywords.some(kw => text.includes(kw.toLowerCase()))) {
      return 'security';
    }

    // DevOps mode detection
    if (this.devopsKeywords.some(kw => text.includes(kw.toLowerCase()))) {
      return 'devops';
    }

    return null;
  }

  public suggestModeForPrompt(text: string): Mode | null {
    // Analyze prompt without sensitivity threshold
    const context: PromptContext = { text };
    const confidence = this.calculateConfidence(context);

    if (confidence >= 0.5) { // Lower threshold for suggestions
      return this.analyzePrompt({ autoSwitchSensitivity: 0.5 }, context);
    }

    return null;
  }

  private calculateConfidence(context: PromptContext): number {
    let confidence = 0;
    const text = context.text.toLowerCase();

    // Exact keyword matches
    const allKeywords = [
      ...this.frontendKeywords,
      ...this.backendKeywords,
      ...this.architectKeywords,
      ...this.securityKeywords,
      ...this.devopsKeywords
    ];

    // Count exact matches
    const exactMatches = allKeywords.filter(kw => 
      text.includes(kw.toLowerCase())
    ).length;

    if (exactMatches > 0) {
      confidence += Math.min(exactMatches * 0.2, 0.8); // Up to 0.8 for multiple matches
    }

    // Context from previous mode
    if (context.previousMode) {
      // If keywords match previous mode's domain, increase confidence
      const modeKeywords = this.getKeywordsForMode(context.previousMode);
      const modeMatches = modeKeywords.filter(kw => 
        text.includes(kw.toLowerCase())
      ).length;

      if (modeMatches > 0) {
        confidence += 0.2; // Bonus for matching previous mode's context
      }
    }

    // Additional context clues
    if (text.includes('create') || text.includes('implement')) {
      confidence += 0.1;
    }
    if (text.includes('improve') || text.includes('optimize')) {
      confidence += 0.1;
    }
    if (text.includes('fix') || text.includes('debug')) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1);
  }

  private getKeywordsForMode(mode: Mode): string[] {
    switch (mode) {
      case 'frontend':
        return this.frontendKeywords;
      case 'backend':
        return this.backendKeywords;
      case 'architect':
        return this.architectKeywords;
      case 'security':
        return this.securityKeywords;
      case 'devops':
        return this.devopsKeywords;
      default:
        return [];
    }
  }
}