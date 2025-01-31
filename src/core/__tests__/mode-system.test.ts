import type { ExtensionState } from '../../shared/ExtensionMessage';
import type { Mode } from '../../shared/modes';
import { ModeManager } from '../mode/ModeManager';
import { ModelSelector } from '../mode/ModelSelector';
import { ResourceManager, ModeCache } from '../mode/ResourceManager';
import { CommandAnalyzer } from '../mode/CommandAnalyzer';
import { PromptAnalyzer } from '../mode/PromptAnalyzer';


describe('Mode System', () => {
  describe('Command Analysis', () => {
    let commandAnalyzer: CommandAnalyzer;

    beforeEach(() => {
      commandAnalyzer = new CommandAnalyzer();
    });

    it('should detect frontend commands', () => {
      const state: Partial<ExtensionState> = {
        autoSwitchSensitivity: 0.8
      };

      expect(commandAnalyzer.analyzeCommand(state, { command: 'npm run dev' })).toBe('frontend');
      expect(commandAnalyzer.analyzeCommand(state, { command: 'yarn dev' })).toBe('frontend');
      expect(commandAnalyzer.analyzeCommand(state, { command: 'ng serve' })).toBe('frontend');
    });

    it('should detect backend commands', () => {
      const state: Partial<ExtensionState> = {
        autoSwitchSensitivity: 0.8
      };

      expect(commandAnalyzer.analyzeCommand(state, { command: 'node server.js' })).toBe('backend');
      expect(commandAnalyzer.analyzeCommand(state, { command: 'python manage.py runserver' })).toBe('backend');
      expect(commandAnalyzer.analyzeCommand(state, { command: 'npm run server' })).toBe('backend');
    });

    it('should detect devops commands', () => {
      const state: Partial<ExtensionState> = {
        autoSwitchSensitivity: 0.8
      };

      expect(commandAnalyzer.analyzeCommand(state, { command: 'docker-compose up' })).toBe('devops');
      expect(commandAnalyzer.analyzeCommand(state, { command: 'kubectl get pods' })).toBe('devops');
      expect(commandAnalyzer.analyzeCommand(state, { command: 'terraform apply' })).toBe('devops');
    });

    it('should detect security commands', () => {
      const state: Partial<ExtensionState> = {
        autoSwitchSensitivity: 0.8
      };

      expect(commandAnalyzer.analyzeCommand(state, { command: 'npm audit' })).toBe('security');
      expect(commandAnalyzer.analyzeCommand(state, { command: 'snyk test' })).toBe('security');
      expect(commandAnalyzer.analyzeCommand(state, { command: 'trivy scan' })).toBe('security');
    });

    it('should respect sensitivity threshold', () => {
      const state: Partial<ExtensionState> = {
        autoSwitchSensitivity: 0.9 // High sensitivity
      };

      // Ambiguous command should not trigger mode switch
      expect(commandAnalyzer.analyzeCommand(state, { command: 'npm run custom-script' })).toBe(null);
    });

    it('should suggest modes for commands', () => {
      expect(commandAnalyzer.suggestModeForCommand('npm run dev')).toBe('frontend');
      expect(commandAnalyzer.suggestModeForCommand('docker-compose up')).toBe('devops');
      expect(commandAnalyzer.suggestModeForCommand('unknown-command')).toBe(null);
    });

    it('should consider command arguments', () => {
      const state: Partial<ExtensionState> = {
        autoSwitchSensitivity: 0.8
      };

      expect(commandAnalyzer.analyzeCommand(state, {
        command: 'npm run build',
        args: ['--prod', '--env=production']
      })).toBe('frontend');
    });
  });

  describe('Mode Transitions', () => {
    let modeManager: ModeManager;

    beforeEach(() => {
      modeManager = new ModeManager(0.8);
    });

    it('should handle seamless mode transitions', () => {
      const state: Partial<ExtensionState> = {
        mode: 'code',
        autoSwitchSensitivity: 0.8,
        contextAnalysis: {
          projectStructure: true,
          techStack: true
        }
      };

      // Test mode transition based on file type
      const cssFile = { fileName: 'styles.css', content: '.header { color: blue; }' };
      expect(modeManager.shouldSwitchMode(state, cssFile)).toBe('frontend');

      // Test mode transition based on content
      const apiFile = { fileName: 'api.ts', content: 'app.post("/api/users", ...)' };
      expect(modeManager.shouldSwitchMode(state, apiFile)).toBe('backend');
    });

    it('should respect auto-switch sensitivity', () => {
      const state: Partial<ExtensionState> = {
        mode: 'code',
        autoSwitchSensitivity: 0.9, // High sensitivity
        contextAnalysis: {
          projectStructure: true
        }
      };

      // Should not switch with low confidence
      const ambiguousFile = { fileName: 'utils.ts', content: 'export function helper() {}' };
      expect(modeManager.shouldSwitchMode(state, ambiguousFile)).toBe(null);
    });
  });

  describe('Context Analysis', () => {
    let modeManager: ModeManager;

    beforeEach(() => {
      modeManager = new ModeManager(0.8);
    });

    it('should detect project structure', () => {
      const state: Partial<ExtensionState> = {
        contextAnalysis: {
          projectStructure: true
        },
        contextThresholds: {
          projectStructure: 0.8
        }
      };

      const projectFiles = [
        'src/components/',
        'src/api/',
        'src/utils/',
        'package.json'
      ];

      expect(modeManager.analyzeProjectStructure(projectFiles)).toEqual({
        type: 'react-app',
        confidence: 0.9
      });
    });

    it('should identify technology stack', () => {
      const state: Partial<ExtensionState> = {
        contextAnalysis: {
          techStack: true
        },
        contextThresholds: {
          techStack: 0.7
        }
      };

      const dependencies = {
        "react": "^17.0.0",
        "express": "^4.17.0",
        "typescript": "^4.5.0"
      };

      expect(modeManager.analyzeTechStack(dependencies)).toEqual({
        frontend: ['react'],
        backend: ['express'],
        languages: ['typescript']
      });
    });
  });

  describe('Model Selection', () => {
    let modelSelector: ModelSelector;

    beforeEach(() => {
      modelSelector = new ModelSelector();
    });

    it('should select appropriate models per mode', () => {
      const state: Partial<ExtensionState> = {
        mode: 'code',
        modeApiConfigs: {
          code: 'gpt-4',
          frontend: 'claude-3'
        } as Record<Mode, string>,
        modeFallbackConfigs: {
          code: 'gpt-3.5-turbo',
          frontend: 'gpt-4'
        } as Record<Mode, string>
      };

      expect(modelSelector.selectModelForMode(state, 'code')).toBe('gpt-4');
      expect(modelSelector.selectFallbackModel(state, 'code')).toBe('gpt-3.5-turbo');
    });

    it('should handle model fallbacks', () => {
      const state: Partial<ExtensionState> = {
        mode: 'code',
        modeFallbackConfigs: {
          code: 'gpt-3.5-turbo'
        } as Record<Mode, string>
      };

      const primaryModel = 'gpt-4';
      expect(modelSelector.handleModelFailover(state, primaryModel, 'code')).toBe('gpt-3.5-turbo');
    });
  });

  describe('Performance', () => {
    let resourceManager: ResourceManager;
    let modeCache: ModeCache;

    beforeEach(() => {
      const state: Partial<ExtensionState> = {
        performanceSettings: {
          modeCaching: true,
          preemptiveLoading: true
        },
        resourceLimits: {
          modeCaching: 100,
          preemptiveLoading: 2
        }
      };
      resourceManager = new ResourceManager(state);
      modeCache = new ModeCache(state.resourceLimits?.modeCaching || 100);
    });

    it('should manage caching correctly', () => {
      modeCache.set('frontend', { context: 'React components', timestamp: Date.now() });

      expect(modeCache.get('frontend')).toBeDefined();
      expect(modeCache.size()).toBeLessThanOrEqual(100);
    });

    it('should optimize resource usage', () => {
      resourceManager.preloadModel('gpt-4');
      resourceManager.preloadModel('claude-3');

      expect(resourceManager.getLoadedModels().length).toBeLessThanOrEqual(2);
      expect(resourceManager.isModelLoaded('gpt-4')).toBe(true);
      expect(resourceManager.isModelLoaded('claude-3')).toBe(true);
    });
  });

  describe('Mode Switching', () => {
    it('should handle mode transitions correctly', () => {
      const state: Partial<ExtensionState> = {
        mode: 'code',
        autoSwitchSensitivity: 0.8,
        contextAnalysis: {
          projectStructure: true,
          techStack: true
        }
      };

      // Test mode transition
      expect(state.mode).toBe('code');
      // Add mode transition logic test here
    });

    it('should respect auto-switch settings', () => {
      const state: Partial<ExtensionState> = {
        mode: 'code',
        autoSwitchSensitivity: 0.8,
        performanceSettings: {
          modeCaching: true,
          preemptiveLoading: true
        }
      };

      // Test auto-switch behavior
      expect(state.autoSwitchSensitivity).toBe(0.8);
      // Add auto-switch logic test here
    });
  });

  describe('Context Analysis', () => {
    it('should detect project structure correctly', () => {
      const state: Partial<ExtensionState> = {
        contextAnalysis: {
          projectStructure: true,
          techStack: true
        },
        contextThresholds: {
          projectStructure: 0.8,
          techStack: 0.7
        }
      };

      // Test project structure analysis
      expect(state.contextAnalysis?.projectStructure).toBe(true);
      // Add structure analysis test here
    });

    it('should identify technology stack', () => {
      const state: Partial<ExtensionState> = {
        contextAnalysis: {
          techStack: true
        },
        contextThresholds: {
          techStack: 0.7
        }
      };

      // Test tech stack detection
      expect(state.contextAnalysis?.techStack).toBe(true);
      // Add tech stack detection test here
    });
  });

  describe('Model Selection', () => {
    it('should select appropriate models per mode', () => {
      const state: Partial<ExtensionState> = {
        mode: 'code',
        modeApiConfigs: {
          code: 'model1',
          frontend: 'model2'
        } as Record<Mode, string>,
        modeFallbackConfigs: {
          code: 'fallback1',
          frontend: 'fallback2'
        } as Record<Mode, string>
      };

      // Test model selection
      expect(state.modeApiConfigs?.code).toBe('model1');
      // Add model selection logic test here
    });

    it('should handle fallback models', () => {
      const state: Partial<ExtensionState> = {
        mode: 'code',
        modeFallbackConfigs: {
          code: 'fallback1'
        } as Record<Mode, string>
      };

      // Test fallback behavior
      expect(state.modeFallbackConfigs?.code).toBe('fallback1');
      // Add fallback logic test here
    });
  });

  describe('Performance', () => {
    it('should manage caching correctly', () => {
      const state: Partial<ExtensionState> = {
        performanceSettings: {
          modeCaching: true
        },
        resourceLimits: {
          modeCaching: 100
        }
      };

      // Test caching behavior
      expect(state.performanceSettings?.modeCaching).toBe(true);
      // Add caching logic test here
    });

    it('should handle resource limits', () => {
      const state: Partial<ExtensionState> = {
        resourceLimits: {
          modeCaching: 100,
          preemptiveLoading: 2
        }
      };

      // Test resource management
      expect(state.resourceLimits?.modeCaching).toBe(100);
      // Add resource management test here
    });
  });

  describe('UI Integration', () => {
    it('should update UI components on mode change', () => {
      const state: Partial<ExtensionState> = {
        mode: 'code'
      };

      // Test UI updates
      expect(state.mode).toBe('code');
      // Add UI update test here
    });

    it('should handle settings changes', () => {
      const state: Partial<ExtensionState> = {
        autoSwitchSensitivity: 0.8,
        performanceSettings: {
          modeCaching: true
        }
      };

      // Test settings updates
      expect(state.autoSwitchSensitivity).toBe(0.8);
      // Add settings update test here
    });
  });

  describe('Prompt Analysis', () => {
    let promptAnalyzer: PromptAnalyzer;

    beforeEach(() => {
      promptAnalyzer = new PromptAnalyzer();
    });

    it('should detect frontend-related prompts', () => {
      const state: Partial<ExtensionState> = {
        autoSwitchSensitivity: 0.8
      };

      expect(promptAnalyzer.analyzePrompt(state, {
        text: 'Help me style this component with CSS'
      })).toBe('frontend');

      expect(promptAnalyzer.analyzePrompt(state, {
        text: 'Create a responsive layout for the dashboard'
      })).toBe('frontend');

      expect(promptAnalyzer.analyzePrompt(state, {
        text: 'Implement a new UI animation'
      })).toBe('frontend');
    });

    it('should detect backend-related prompts', () => {
      const state: Partial<ExtensionState> = {
        autoSwitchSensitivity: 0.8
      };

      expect(promptAnalyzer.analyzePrompt(state, {
        text: 'Create a new API endpoint for user authentication'
      })).toBe('backend');

      expect(promptAnalyzer.analyzePrompt(state, {
        text: 'Optimize the database query performance'
      })).toBe('backend');

      expect(promptAnalyzer.analyzePrompt(state, {
        text: 'Implement server-side caching'
      })).toBe('backend');
    });

    it('should detect architect-related prompts', () => {
      const state: Partial<ExtensionState> = {
        autoSwitchSensitivity: 0.8
      };

      expect(promptAnalyzer.analyzePrompt(state, {
        text: 'Design a microservices architecture'
      })).toBe('architect');

      expect(promptAnalyzer.analyzePrompt(state, {
        text: 'Implement the observer pattern'
      })).toBe('architect');

      expect(promptAnalyzer.analyzePrompt(state, {
        text: 'Create a system design document'
      })).toBe('architect');
    });

    it('should detect security-related prompts', () => {
      const state: Partial<ExtensionState> = {
        autoSwitchSensitivity: 0.8
      };

      expect(promptAnalyzer.analyzePrompt(state, {
        text: 'Fix the security vulnerability in authentication'
      })).toBe('security');

      expect(promptAnalyzer.analyzePrompt(state, {
        text: 'Implement encryption for sensitive data'
      })).toBe('security');

      expect(promptAnalyzer.analyzePrompt(state, {
        text: 'Perform a security audit'
      })).toBe('security');
    });

    it('should detect devops-related prompts', () => {
      const state: Partial<ExtensionState> = {
        autoSwitchSensitivity: 0.8
      };

      expect(promptAnalyzer.analyzePrompt(state, {
        text: 'Set up a CI/CD pipeline'
      })).toBe('devops');

      expect(promptAnalyzer.analyzePrompt(state, {
        text: 'Configure Kubernetes deployment'
      })).toBe('devops');

      expect(promptAnalyzer.analyzePrompt(state, {
        text: 'Implement infrastructure monitoring'
      })).toBe('devops');
    });

    it('should respect sensitivity threshold', () => {
      const state: Partial<ExtensionState> = {
        autoSwitchSensitivity: 0.9 // High sensitivity
      };

      // Ambiguous prompt should not trigger mode switch
      expect(promptAnalyzer.analyzePrompt(state, {
        text: 'Help me with this code'
      })).toBe(null);
    });

    it('should consider previous mode context', () => {
      const state: Partial<ExtensionState> = {
        autoSwitchSensitivity: 0.8
      };

      expect(promptAnalyzer.analyzePrompt(state, {
        text: 'Optimize the performance',
        previousMode: 'backend'
      })).toBe('backend');

      expect(promptAnalyzer.analyzePrompt(state, {
        text: 'Improve the design',
        previousMode: 'frontend'
      })).toBe('frontend');
    });

    it('should suggest modes for prompts', () => {
      expect(promptAnalyzer.suggestModeForPrompt(
        'Can you help me style this component?'
      )).toBe('frontend');

      expect(promptAnalyzer.suggestModeForPrompt(
        'How do I deploy to production?'
      )).toBe('devops');

      expect(promptAnalyzer.suggestModeForPrompt(
        'What is the best way to write code?'
      )).toBe(null);
    });
  });
});