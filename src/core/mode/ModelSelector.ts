import { Mode } from '../../shared/modes';
import { ExtensionState } from '../../shared/ExtensionMessage';

export class ModelSelector {
  private readonly defaultModel = 'gpt-4';
  private readonly defaultFallback = 'gpt-3.5-turbo';

  public selectModelForMode(state: Partial<ExtensionState>, mode: Mode): string {
    if (state.modeApiConfigs && state.modeApiConfigs[mode]) {
      return state.modeApiConfigs[mode];
    }

    // Default model selection based on mode
    switch (mode) {
      case 'frontend':
        return 'claude-3'; // Better at UI/UX tasks
      case 'backend':
        return 'gpt-4'; // Better at complex logic
      case 'security':
        return 'claude-3'; // Better at security analysis
      default:
        return this.defaultModel;
    }
  }

  public selectFallbackModel(state: Partial<ExtensionState>, mode: Mode): string {
    if (state.modeFallbackConfigs && state.modeFallbackConfigs[mode]) {
      return state.modeFallbackConfigs[mode];
    }

    // Default fallback selection based on mode
    switch (mode) {
      case 'frontend':
        return 'gpt-4';
      case 'backend':
        return 'gpt-3.5-turbo';
      case 'security':
        return 'gpt-4';
      default:
        return this.defaultFallback;
    }
  }

  public handleModelFailover(
    state: Partial<ExtensionState>,
    primaryModel: string,
    mode: Mode
  ): string {
    // If primary model fails, use mode-specific fallback
    const fallback = this.selectFallbackModel(state, mode);
    
    // If fallback is same as failed primary, use default fallback
    if (fallback === primaryModel) {
      return this.defaultFallback;
    }

    return fallback;
  }

  public evaluateModelCapabilities(model: string): Record<string, number> {
    // Capability scores (0-1) for different aspects
    const capabilities: Record<string, number> = {
      complexity: 0,
      creativity: 0,
      accuracy: 0,
      speed: 0
    };

    switch (model) {
      case 'gpt-4':
        capabilities.complexity = 0.9;
        capabilities.creativity = 0.8;
        capabilities.accuracy = 0.9;
        capabilities.speed = 0.7;
        break;
      case 'claude-3':
        capabilities.complexity = 0.85;
        capabilities.creativity = 0.9;
        capabilities.accuracy = 0.85;
        capabilities.speed = 0.8;
        break;
      case 'gpt-3.5-turbo':
        capabilities.complexity = 0.7;
        capabilities.creativity = 0.7;
        capabilities.accuracy = 0.7;
        capabilities.speed = 0.9;
        break;
      default:
        capabilities.complexity = 0.5;
        capabilities.creativity = 0.5;
        capabilities.accuracy = 0.5;
        capabilities.speed = 0.5;
    }

    return capabilities;
  }

  public selectModelForTask(
    state: Partial<ExtensionState>,
    mode: Mode,
    requirements: {
      complexity?: number;
      creativity?: number;
      accuracy?: number;
      speed?: number;
    }
  ): string {
    const primaryModel = this.selectModelForMode(state, mode);
    const primaryCapabilities = this.evaluateModelCapabilities(primaryModel);

    // Check if primary model meets requirements
    const meetsRequirements = Object.entries(requirements).every(
      ([key, value]) => primaryCapabilities[key] >= (value || 0)
    );

    if (meetsRequirements) {
      return primaryModel;
    }

    // Try fallback model
    const fallbackModel = this.selectFallbackModel(state, mode);
    const fallbackCapabilities = this.evaluateModelCapabilities(fallbackModel);

    const fallbackMeetsRequirements = Object.entries(requirements).every(
      ([key, value]) => fallbackCapabilities[key] >= (value || 0)
    );

    if (fallbackMeetsRequirements) {
      return fallbackModel;
    }

    // If no model meets all requirements, use primary model
    return primaryModel;
  }
}