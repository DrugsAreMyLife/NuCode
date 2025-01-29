import * as vscode from 'vscode'
import {
	ModeConfig,
	ModeContext,
	TransitionRule,
	TaskRule,
	FileRule,
	CapabilityRule,
	HandoffRule,
	TransitionRuleType,
	createModeContext,
	updateCompletionStatus,
	shouldTriggerForTask,
	canHandleFile,
	hasCapability,
	canReceiveHandoff
} from "../../shared/modes"

// Event names for mode transitions
export const MODE_TRANSITION_EVENTS = {
	BEFORE_TRANSITION: 'beforeTransition',
	AFTER_TRANSITION: 'afterTransition',
	TRANSITION_ERROR: 'transitionError'
} as const

// Event types for mode transitions
export type TransitionEvent = {
	fromMode: ModeConfig | null
	toMode: ModeConfig
	context: ModeContext
}

export type TransitionErrorEvent = {
	error: Error
	context: ModeContext | null
	attemptedMode?: ModeConfig
}

export class TransitionEngine {
	private rules: TransitionRule[] = []
	private context: ModeContext | null = null
	private currentMode: ModeConfig | null = null
	private availableModes: ModeConfig[] = []
	private eventEmitter: vscode.EventEmitter<TransitionEvent | TransitionErrorEvent>
	private ruleCache: Map<string, ModeConfig[]> = new Map()
	private logger: vscode.OutputChannel

	constructor(
		modes: ModeConfig[],
		private readonly onTransition?: (event: TransitionEvent) => Promise<void>
	) {
		this.availableModes = modes
		this.eventEmitter = new vscode.EventEmitter()
		this.logger = vscode.window.createOutputChannel("Mode Transition")
		this.initializeRules()
	}

	/**
	 * Initialize transition rules based on mode configurations
	 */
	private initializeRules(): void {
		this.logger.appendLine("Initializing transition rules...")
		this.availableModes.forEach(mode => {
			// Task-based rules
			if (mode.triggers?.length) {
				this.rules.push({
					type: 'task',
					condition: mode.triggers,
					targetMode: mode.slug,
					automatic: true
				} as TaskRule)
			}

			// File-based rules
			if (mode.filePatterns?.length) {
				this.rules.push({
					type: 'file',
					condition: mode.filePatterns,
					targetMode: mode.slug,
					automatic: true
				} as FileRule)
			}

			// Capability-based rules
			if (mode.capabilities?.length) {
				this.rules.push({
					type: 'capability',
					condition: new Set(mode.capabilities),
					targetMode: mode.slug,
					automatic: true
				} as CapabilityRule)
			}

			// Handoff rules
			if (mode.handoffTo?.length) {
				this.rules.push({
					type: 'handoff',
					condition: { [mode.slug]: true },
					targetMode: mode.handoffTo[0], // Default to first handoff target
					automatic: false
				} as HandoffRule)
			}
		})
		this.logger.appendLine(`Initialized ${this.rules.length} rules`)
	}

	/**
	 * Subscribe to transition events
	 */
	public onTransitionEvent(
		listener: (event: TransitionEvent | TransitionErrorEvent) => void
	): vscode.Disposable {
		return this.eventEmitter.event(listener)
	}

	/**
	 * Start a new task with context
	 */
	public async startTask(task: string, files: string[] = []): Promise<void> {
		this.logger.appendLine(`Starting task: ${task}`)
		this.context = createModeContext(task, files)
		await this.evaluateTransition()
	}

	/**
	 * Update task context with new files
	 */
	public async updateFiles(files: string[]): Promise<void> {
		if (!this.context) {
			const error = new Error("No active context")
			this.eventEmitter.fire({ error, context: null })
			throw error
		}
		this.logger.appendLine(`Updating files: ${files.join(", ")}`)
		this.context.currentFiles = files
		await this.evaluateTransition()
	}

	/**
	 * Mark current mode's task as complete
	 */
	public async completeCurrentTask(): Promise<void> {
		if (!this.context || !this.currentMode) {
			const error = new Error("No active context or current mode")
			this.eventEmitter.fire({ error, context: this.context })
			throw error
		}
		this.logger.appendLine(`Completing task for mode: ${this.currentMode.slug}`)
		this.context = updateCompletionStatus(this.context, this.currentMode.slug, true)
		await this.evaluateTransition()
	}

	/**
	 * Evaluate rules and determine if a transition is needed
	 */
	private async evaluateTransition(): Promise<ModeConfig | null> {
		if (!this.context) {
			return null
		}

		const cacheKey = this.getCacheKey()
		const cachedResult = this.ruleCache.get(cacheKey)
		if (cachedResult) {
			this.logger.appendLine("Using cached rule evaluation result")
			return cachedResult[0] || null
		}

		this.logger.appendLine("Evaluating transition rules...")
		const matchingModes: ModeConfig[] = []

		for (const rule of this.rules) {
			const nextMode = await this.evaluateRule(rule)
			if (nextMode && this.isValidTransition(this.currentMode, nextMode)) {
				matchingModes.push(nextMode)
				if (rule.automatic) {
					await this.transition(nextMode)
					break
				}
			}
		}

		this.ruleCache.set(cacheKey, matchingModes)
		return matchingModes[0] || null
	}

	/**
	 * Get cache key for current context
	 */
	private getCacheKey(): string {
		if (!this.context) return ''
		return JSON.stringify({
			task: this.context.currentTask,
			files: this.context.currentFiles.sort(),
			completion: this.context.completionStatus
		})
	}

	/**
	 * Evaluate a single transition rule
	 */
	private async evaluateRule(rule: TransitionRule): Promise<ModeConfig | null> {
		if (!this.context) {
			return null
		}

		const targetMode = this.availableModes.find(mode => mode.slug === rule.targetMode)
		if (!targetMode) {
			return null
		}

		try {
			switch (rule.type) {
				case 'task':
					return this.evaluateTaskRule(rule as TaskRule, targetMode)
				case 'file':
					return this.evaluateFileRule(rule as FileRule, targetMode)
				case 'capability':
					return this.evaluateCapabilityRule(rule as CapabilityRule, targetMode)
				case 'handoff':
					return this.evaluateHandoffRule(rule as HandoffRule, targetMode)
				default:
					return null
			}
		} catch (error) {
			this.logger.appendLine(`Error evaluating rule: ${error}`)
			return null
		}
	}

	/**
	 * Evaluate task-based transition rule
	 */
	private evaluateTaskRule(rule: TaskRule, targetMode: ModeConfig): ModeConfig | null {
		return shouldTriggerForTask(targetMode, this.context!.currentTask) ? targetMode : null
	}

	/**
	 * Evaluate file-based transition rule
	 */
	private evaluateFileRule(rule: FileRule, targetMode: ModeConfig): ModeConfig | null {
		return this.context!.currentFiles.some(file => canHandleFile(targetMode, file)) ? targetMode : null
	}

	/**
	 * Evaluate capability-based transition rule
	 */
	private evaluateCapabilityRule(rule: CapabilityRule, targetMode: ModeConfig): ModeConfig | null {
		const requiredCapabilities = Array.from(rule.condition)
		return requiredCapabilities.every(cap => hasCapability(targetMode, cap)) ? targetMode : null
	}

	/**
	 * Evaluate handoff-based transition rule
	 */
	private evaluateHandoffRule(rule: HandoffRule, targetMode: ModeConfig): ModeConfig | null {
		if (!this.currentMode) {
			return null
		}

		const isComplete = Object.entries(rule.condition).every(
			([mode, required]) => !required || this.context!.completionStatus[mode]
		)

		return isComplete && canReceiveHandoff(this.currentMode, targetMode) ? targetMode : null
	}

	/**
	 * Check if a transition between modes is valid
	 */
	private isValidTransition(from: ModeConfig | null, to: ModeConfig): boolean {
		if (!from) {
			return true // Initial transition is always valid
		}

		// Check if the target mode can handle current files
		const canHandleFiles = this.context!.currentFiles.every(file => canHandleFile(to, file))
		if (!canHandleFiles) {
			this.logger.appendLine(`Invalid transition: ${to.slug} cannot handle current files`)
			return false
		}

		// Check if handoff is allowed
		if (from.handoffTo && !from.handoffTo.includes(to.slug)) {
			this.logger.appendLine(`Invalid transition: ${from.slug} cannot hand off to ${to.slug}`)
			return false
		}

		return true
	}

	/**
	 * Perform the transition to a new mode
	 */
	private async transition(newMode: ModeConfig): Promise<void> {
		if (!this.context) {
			throw new Error("Cannot transition without context")
		}

		try {
			// Emit before transition event
			const beforeEvent: TransitionEvent = {
				fromMode: this.currentMode,
				toMode: newMode,
				context: this.context
			}
			this.eventEmitter.fire(beforeEvent)
			this.logger.appendLine(`Transitioning from ${this.currentMode?.slug || 'none'} to ${newMode.slug}`)

			// Preserve context during transition
			const prevMode = this.currentMode
			this.currentMode = newMode

			// Add to handoff queue if this was a handoff
			if (prevMode && prevMode.handoffTo?.includes(newMode.slug)) {
				this.context.handoffQueue.push(prevMode.slug)
			}

			// Reset completion status for new mode
			this.context = updateCompletionStatus(this.context, newMode.slug, false)

			// Notify listeners
			if (this.onTransition) {
				await this.onTransition(beforeEvent)
			}

			// Clear rule cache
			this.ruleCache.clear()

			// Emit after transition event
			const afterEvent: TransitionEvent = {
				fromMode: prevMode,
				toMode: newMode,
				context: this.context
			}
			this.eventEmitter.fire(afterEvent)
		} catch (error) {
			const errorEvent: TransitionErrorEvent = {
				error: error instanceof Error ? error : new Error(String(error)),
				context: this.context,
				attemptedMode: newMode
			}
			this.eventEmitter.fire(errorEvent)
			this.logger.appendLine(`Transition error: ${errorEvent.error.message}`)
			throw errorEvent.error
		}
	}

	/**
	 * Get the current mode
	 */
	public getCurrentMode(): ModeConfig | null {
		return this.currentMode
	}

	/**
	 * Get the current context
	 */
	public getContext(): ModeContext | null {
		return this.context
	}

	/**
	 * Force a transition to a specific mode
	 */
	public async forceTransition(targetSlug: string): Promise<boolean> {
		const targetMode = this.availableModes.find(mode => mode.slug === targetSlug)
		if (!targetMode) {
			return false
		}

		try {
			await this.transition(targetMode)
			return true
		} catch (error) {
			this.logger.appendLine(`Force transition error: ${error}`)
			return false
		}
	}

	/**
	 * Reset the transition engine
	 */
	public reset(): void {
		this.logger.appendLine("Resetting transition engine")
		this.context = null
		this.currentMode = null
		this.ruleCache.clear()
	}

	/**
	 * Dispose of resources
	 */
	public dispose(): void {
		this.eventEmitter.dispose()
		this.logger.dispose()
	}
}