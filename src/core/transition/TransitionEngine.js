import * as vscode from 'vscode';
import { createModeContext, updateCompletionStatus, shouldTriggerForTask, canHandleFile, hasCapability, canReceiveHandoff } from "../../shared/modes";
// Event names for mode transitions
export const MODE_TRANSITION_EVENTS = {
    BEFORE_TRANSITION: 'beforeTransition',
    AFTER_TRANSITION: 'afterTransition',
    TRANSITION_ERROR: 'transitionError'
};
export class TransitionEngine {
    onTransition;
    rules = [];
    context = null;
    currentMode = null;
    availableModes = [];
    eventEmitter;
    ruleCache = new Map();
    logger;
    constructor(modes, onTransition) {
        this.onTransition = onTransition;
        this.availableModes = modes;
        this.eventEmitter = new vscode.EventEmitter();
        this.logger = vscode.window.createOutputChannel("Mode Transition");
        this.initializeRules();
    }
    /**
     * Initialize transition rules based on mode configurations
     */
    initializeRules() {
        this.logger.appendLine("Initializing transition rules...");
        this.availableModes.forEach(mode => {
            // Task-based rules
            if (mode.triggers?.length) {
                this.rules.push({
                    type: 'task',
                    condition: mode.triggers,
                    targetMode: mode.slug,
                    automatic: true
                });
            }
            // File-based rules
            if (mode.filePatterns?.length) {
                this.rules.push({
                    type: 'file',
                    condition: mode.filePatterns,
                    targetMode: mode.slug,
                    automatic: true
                });
            }
            // Capability-based rules
            if (mode.capabilities?.length) {
                this.rules.push({
                    type: 'capability',
                    condition: new Set(mode.capabilities),
                    targetMode: mode.slug,
                    automatic: true
                });
            }
            // Handoff rules
            if (mode.handoffTo?.length) {
                this.rules.push({
                    type: 'handoff',
                    condition: { [mode.slug]: true },
                    targetMode: mode.handoffTo[0], // Default to first handoff target
                    automatic: false
                });
            }
        });
        this.logger.appendLine(`Initialized ${this.rules.length} rules`);
    }
    /**
     * Subscribe to transition events
     */
    onTransitionEvent(listener) {
        return this.eventEmitter.event(listener);
    }
    /**
     * Start a new task with context
     */
    async startTask(task, files = []) {
        this.logger.appendLine(`Starting task: ${task}`);
        this.context = createModeContext(task, files);
        await this.evaluateTransition();
    }
    /**
     * Update task context with new files
     */
    async updateFiles(files) {
        if (!this.context) {
            const error = new Error("No active context");
            this.eventEmitter.fire({ error, context: null });
            throw error;
        }
        this.logger.appendLine(`Updating files: ${files.join(", ")}`);
        this.context.currentFiles = files;
        await this.evaluateTransition();
    }
    /**
     * Mark current mode's task as complete
     */
    async completeCurrentTask() {
        if (!this.context || !this.currentMode) {
            const error = new Error("No active context or current mode");
            this.eventEmitter.fire({ error, context: this.context });
            throw error;
        }
        this.logger.appendLine(`Completing task for mode: ${this.currentMode.slug}`);
        this.context = updateCompletionStatus(this.context, this.currentMode.slug, true);
        await this.evaluateTransition();
    }
    /**
     * Evaluate rules and determine if a transition is needed
     */
    async evaluateTransition() {
        if (!this.context) {
            return null;
        }
        const cacheKey = this.getCacheKey();
        const cachedResult = this.ruleCache.get(cacheKey);
        if (cachedResult) {
            this.logger.appendLine("Using cached rule evaluation result");
            return cachedResult[0] || null;
        }
        this.logger.appendLine("Evaluating transition rules...");
        const matchingModes = [];
        for (const rule of this.rules) {
            const nextMode = await this.evaluateRule(rule);
            if (nextMode && this.isValidTransition(this.currentMode, nextMode)) {
                matchingModes.push(nextMode);
                if (rule.automatic) {
                    await this.transition(nextMode);
                    break;
                }
            }
        }
        this.ruleCache.set(cacheKey, matchingModes);
        return matchingModes[0] || null;
    }
    /**
     * Get cache key for current context
     */
    getCacheKey() {
        if (!this.context)
            return '';
        return JSON.stringify({
            task: this.context.currentTask,
            files: this.context.currentFiles.sort(),
            completion: this.context.completionStatus
        });
    }
    /**
     * Evaluate a single transition rule
     */
    async evaluateRule(rule) {
        if (!this.context) {
            return null;
        }
        const targetMode = this.availableModes.find(mode => mode.slug === rule.targetMode);
        if (!targetMode) {
            return null;
        }
        try {
            switch (rule.type) {
                case 'task':
                    return this.evaluateTaskRule(rule, targetMode);
                case 'file':
                    return this.evaluateFileRule(rule, targetMode);
                case 'capability':
                    return this.evaluateCapabilityRule(rule, targetMode);
                case 'handoff':
                    return this.evaluateHandoffRule(rule, targetMode);
                default:
                    return null;
            }
        }
        catch (error) {
            this.logger.appendLine(`Error evaluating rule: ${error}`);
            return null;
        }
    }
    /**
     * Evaluate task-based transition rule
     */
    evaluateTaskRule(rule, targetMode) {
        return shouldTriggerForTask(targetMode, this.context.currentTask) ? targetMode : null;
    }
    /**
     * Evaluate file-based transition rule
     */
    evaluateFileRule(rule, targetMode) {
        return this.context.currentFiles.some(file => canHandleFile(targetMode, file)) ? targetMode : null;
    }
    /**
     * Evaluate capability-based transition rule
     */
    evaluateCapabilityRule(rule, targetMode) {
        const requiredCapabilities = Array.from(rule.condition);
        return requiredCapabilities.every(cap => hasCapability(targetMode, cap)) ? targetMode : null;
    }
    /**
     * Evaluate handoff-based transition rule
     */
    evaluateHandoffRule(rule, targetMode) {
        if (!this.currentMode) {
            return null;
        }
        const isComplete = Object.entries(rule.condition).every(([mode, required]) => !required || this.context.completionStatus[mode]);
        return isComplete && canReceiveHandoff(this.currentMode, targetMode) ? targetMode : null;
    }
    /**
     * Check if a transition between modes is valid
     */
    isValidTransition(from, to) {
        if (!from) {
            return true; // Initial transition is always valid
        }
        // Check if the target mode can handle current files
        const canHandleFiles = this.context.currentFiles.every(file => canHandleFile(to, file));
        if (!canHandleFiles) {
            this.logger.appendLine(`Invalid transition: ${to.slug} cannot handle current files`);
            return false;
        }
        // Check if handoff is allowed
        if (from.handoffTo && !from.handoffTo.includes(to.slug)) {
            this.logger.appendLine(`Invalid transition: ${from.slug} cannot hand off to ${to.slug}`);
            return false;
        }
        return true;
    }
    /**
     * Perform the transition to a new mode
     */
    async transition(newMode) {
        if (!this.context) {
            throw new Error("Cannot transition without context");
        }
        try {
            // Emit before transition event
            const beforeEvent = {
                fromMode: this.currentMode,
                toMode: newMode,
                context: this.context
            };
            this.eventEmitter.fire(beforeEvent);
            this.logger.appendLine(`Transitioning from ${this.currentMode?.slug || 'none'} to ${newMode.slug}`);
            // Preserve context during transition
            const prevMode = this.currentMode;
            this.currentMode = newMode;
            // Add to handoff queue if this was a handoff
            if (prevMode && prevMode.handoffTo?.includes(newMode.slug)) {
                this.context.handoffQueue.push(prevMode.slug);
            }
            // Reset completion status for new mode
            this.context = updateCompletionStatus(this.context, newMode.slug, false);
            // Notify listeners
            if (this.onTransition) {
                await this.onTransition(beforeEvent);
            }
            // Clear rule cache
            this.ruleCache.clear();
            // Emit after transition event
            const afterEvent = {
                fromMode: prevMode,
                toMode: newMode,
                context: this.context
            };
            this.eventEmitter.fire(afterEvent);
        }
        catch (error) {
            const errorEvent = {
                error: error instanceof Error ? error : new Error(String(error)),
                context: this.context,
                attemptedMode: newMode
            };
            this.eventEmitter.fire(errorEvent);
            this.logger.appendLine(`Transition error: ${errorEvent.error.message}`);
            throw errorEvent.error;
        }
    }
    /**
     * Get the current mode
     */
    getCurrentMode() {
        return this.currentMode;
    }
    /**
     * Get the current context
     */
    getContext() {
        return this.context;
    }
    /**
     * Force a transition to a specific mode
     */
    async forceTransition(targetSlug) {
        const targetMode = this.availableModes.find(mode => mode.slug === targetSlug);
        if (!targetMode) {
            return false;
        }
        try {
            await this.transition(targetMode);
            return true;
        }
        catch (error) {
            this.logger.appendLine(`Force transition error: ${error}`);
            return false;
        }
    }
    /**
     * Reset the transition engine
     */
    reset() {
        this.logger.appendLine("Resetting transition engine");
        this.context = null;
        this.currentMode = null;
        this.ruleCache.clear();
    }
    /**
     * Dispose of resources
     */
    dispose() {
        this.eventEmitter.dispose();
        this.logger.dispose();
    }
}
//# sourceMappingURL=TransitionEngine.js.map