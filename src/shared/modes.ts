import { TOOL_GROUPS, ToolGroup, ALWAYS_AVAILABLE_TOOLS } from "./tool-groups"

// Mode types
export type Mode = string

// Group options type
export type GroupOptions = {
	fileRegex?: string // Regular expression pattern
	description?: string // Human-readable description of the pattern
}

// Group entry can be either a string or tuple with options
export type GroupEntry = ToolGroup | readonly [ToolGroup, GroupOptions]

// Mode configuration type with enhanced features
export type ModeConfig = {
	slug: string
	name: string
	roleDefinition: string
	customInstructions?: string
	groups: readonly GroupEntry[]
	// New fields for enhanced mode system
	capabilities?: string[]          // Core competencies of the mode
	triggers?: string[]             // Keywords that trigger mode selection
	handoffTo?: string[]           // Modes that can receive handoffs
	filePatterns?: string[]        // File patterns this mode can handle
}

// Mode context for tracking state
export type ModeContext = {
	currentTask: string
	currentFiles: string[]
	requiredCapabilities: Set<string>
	completionStatus: Record<string, boolean>
	handoffQueue: string[]
}

// Transition rule types
export type TransitionRuleType = 'task' | 'file' | 'capability' | 'handoff'

export type BaseTransitionRule = {
	type: TransitionRuleType
	targetMode: string
	automatic: boolean
}

export type TaskRule = BaseTransitionRule & {
	type: 'task'
	condition: string[]  // Trigger keywords
}

export type FileRule = BaseTransitionRule & {
	type: 'file'
	condition: string[]  // File patterns
}

export type CapabilityRule = BaseTransitionRule & {
	type: 'capability'
	condition: Set<string>  // Required capabilities
}

export type HandoffRule = BaseTransitionRule & {
	type: 'handoff'
	condition: Record<string, boolean>  // Completion requirements
}

export type TransitionRule = TaskRule | FileRule | CapabilityRule | HandoffRule

// Mode-specific prompts only
export type PromptComponent = {
	roleDefinition?: string
	customInstructions?: string
}

export type CustomModePrompts = {
	[key: string]: PromptComponent | undefined
}

// Helper to extract group name regardless of format
export function getGroupName(group: GroupEntry): ToolGroup {
	return Array.isArray(group) ? group[0] : group
}

// Helper to get group options if they exist
function getGroupOptions(group: GroupEntry): GroupOptions | undefined {
	return Array.isArray(group) ? group[1] : undefined
}

// Helper to check if a file path matches a regex pattern
export function doesFileMatchRegex(filePath: string, pattern: string): boolean {
	try {
		const regex = new RegExp(pattern)
		return regex.test(filePath)
	} catch (error) {
		console.error(`Invalid regex pattern: ${pattern}`, error)
		return false
	}
}

// Helper to get all tools for a mode
export function getToolsForMode(groups: readonly GroupEntry[]): string[] {
	const tools = new Set<string>()

	// Add tools from each group
	groups.forEach((group) => {
		const groupName = getGroupName(group)
		TOOL_GROUPS[groupName].forEach((tool) => tools.add(tool))
	})

	// Always add required tools
	ALWAYS_AVAILABLE_TOOLS.forEach((tool) => tools.add(tool))

	return Array.from(tools)
}

// Main modes configuration as an ordered array
export const modes: readonly ModeConfig[] = [
	{
		slug: "code",
		name: "Code",
		roleDefinition:
			"You are Roo, a highly skilled software engineer with extensive knowledge in many programming languages, frameworks, design patterns, and best practices.",
		groups: ["read", "edit", "browser", "command", "mcp"],
		capabilities: ["implement", "test", "debug", "refactor"],
		triggers: ["code", "implement", "develop", "fix", "test"],
		handoffTo: ["architect", "tester", "security"],
		filePatterns: [
			".*\\.(ts|js|jsx|tsx)$",
			".*\\.(py|java|cpp|cs)$",
			".*\\.(html|css|scss)$"
		]
	},
	{
		slug: "architect",
		name: "Architect",
		roleDefinition:
			"You are Roo, a software architecture expert specializing in analyzing codebases, identifying patterns, and providing high-level technical guidance. You excel at understanding complex systems, evaluating architectural decisions, and suggesting improvements. You can edit markdown documentation files to help document architectural decisions and patterns.",
		groups: ["read", ["edit", { fileRegex: "\\.md$", description: "Markdown files only" }], "browser", "mcp"],
		capabilities: ["design", "review", "document", "analyze"],
		triggers: ["architecture", "design", "pattern", "structure"],
		handoffTo: ["code", "security", "deployer"],
		filePatterns: [".*\\.md$", "docs/.*", "architecture/.*"]
	},
	{
		slug: "ask",
		name: "Ask",
		roleDefinition:
			"You are Roo, a knowledgeable technical assistant focused on answering questions and providing information about software development, technology, and related topics. You can analyze code, explain concepts, and access external resources. While you primarily maintain a read-only approach to the codebase, you can create and edit markdown files to better document and explain concepts. Make sure to answer the user's questions and don't rush to switch to implementing code.",
		groups: ["read", ["edit", { fileRegex: "\\.md$", description: "Markdown files only" }], "browser", "mcp"],
		capabilities: ["explain", "research", "document", "analyze"],
		triggers: ["explain", "how", "what", "why", "help"],
		handoffTo: ["code", "architect"],
		filePatterns: [".*\\.md$", "docs/.*"]
	},
] as const

// Export the default mode slug
export const defaultModeSlug = modes[0].slug

// Helper functions
export function getModeBySlug(slug: string, customModes?: ModeConfig[]): ModeConfig | undefined {
	// Check custom modes first
	const customMode = customModes?.find((mode) => mode.slug === slug)
	if (customMode) {
		return customMode
	}
	// Then check built-in modes
	return modes.find((mode) => mode.slug === slug)
}

export function getModeConfig(slug: string, customModes?: ModeConfig[]): ModeConfig {
	const mode = getModeBySlug(slug, customModes)
	if (!mode) {
		throw new Error(`No mode found for slug: ${slug}`)
	}
	return mode
}

// Get all available modes, with custom modes overriding built-in modes
export function getAllModes(customModes?: ModeConfig[]): ModeConfig[] {
	if (!customModes?.length) {
		return [...modes]
	}

	// Start with built-in modes
	const allModes = [...modes]

	// Process custom modes
	customModes.forEach((customMode) => {
		const index = allModes.findIndex((mode) => mode.slug === customMode.slug)
		if (index !== -1) {
			// Override existing mode
			allModes[index] = customMode
		} else {
			// Add new mode
			allModes.push(customMode)
		}
	})

	return allModes
}

// Check if a mode is custom or an override
export function isCustomMode(slug: string, customModes?: ModeConfig[]): boolean {
	return !!customModes?.some((mode) => mode.slug === slug)
}

// Custom error class for file restrictions
export class FileRestrictionError extends Error {
	constructor(mode: string, pattern: string, description: string | undefined, filePath: string) {
		super(
			`This mode (${mode}) can only edit files matching pattern: ${pattern}${description ? ` (${description})` : ""}. Got: ${filePath}`,
		)
		this.name = "FileRestrictionError"
	}
}

export function isToolAllowedForMode(
	tool: string,
	modeSlug: string,
	customModes: ModeConfig[],
	toolRequirements?: Record<string, boolean>,
	toolParams?: Record<string, any>,
	experiments?: Record<string, boolean>,
): boolean {
	// Always allow these tools
	if (ALWAYS_AVAILABLE_TOOLS.includes(tool as any)) {
		return true
	}

	if (experiments && tool in experiments) {
		if (!experiments[tool]) {
			return false
		}
	}

	// Check tool requirements if any exist
	if (toolRequirements && tool in toolRequirements) {
		if (!toolRequirements[tool]) {
			return false
		}
	}

	const mode = getModeBySlug(modeSlug, customModes)
	if (!mode) {
		return false
	}

	// Check if tool is in any of the mode's groups and respects any group options
	for (const group of mode.groups) {
		const groupName = getGroupName(group)
		const options = getGroupOptions(group)

		// If the tool isn't in this group, continue to next group
		if (!TOOL_GROUPS[groupName].includes(tool)) {
			continue
		}

		// If there are no options, allow the tool
		if (!options) {
			return true
		}

		// For the edit group, check file regex if specified
		if (groupName === "edit" && options.fileRegex) {
			const filePath = toolParams?.path
			if (
				filePath &&
				(toolParams.diff || toolParams.content || toolParams.operations) &&
				!doesFileMatchRegex(filePath, options.fileRegex)
			) {
				throw new FileRestrictionError(mode.name, options.fileRegex, options.description, filePath)
			}
		}

		return true
	}

	return false
}

// Create the mode-specific default prompts
export const defaultPrompts: Readonly<CustomModePrompts> = Object.freeze(
	Object.fromEntries(modes.map((mode) => [mode.slug, { roleDefinition: mode.roleDefinition }])),
)

// Helper function to safely get role definition
export function getRoleDefinition(modeSlug: string, customModes?: ModeConfig[]): string {
	const mode = getModeBySlug(modeSlug, customModes)
	if (!mode) {
		console.warn(`No mode found for slug: ${modeSlug}`)
		return ""
	}
	return mode.roleDefinition
}

// New helper functions for enhanced mode system

// Check if a mode has a specific capability
export function hasCapability(mode: ModeConfig, capability: string): boolean {
	return mode.capabilities?.includes(capability) ?? false
}

// Check if a mode can handle a specific file pattern
export function canHandleFile(mode: ModeConfig, filePath: string): boolean {
	if (!mode.filePatterns?.length) {
		return true // If no patterns specified, assume it can handle any file
	}
	return mode.filePatterns.some(pattern => doesFileMatchRegex(filePath, pattern))
}

// Check if a mode can receive handoffs from another mode
export function canReceiveHandoff(fromMode: ModeConfig, toMode: ModeConfig): boolean {
	return fromMode.handoffTo?.includes(toMode.slug) ?? false
}

// Check if a mode should be triggered based on task description
export function shouldTriggerForTask(mode: ModeConfig, task: string): boolean {
	if (!mode.triggers?.length) {
		return false
	}
	return mode.triggers.some(trigger => task.toLowerCase().includes(trigger.toLowerCase()))
}

// Create a new context for a mode
export function createModeContext(task: string, files: string[] = []): ModeContext {
	return {
		currentTask: task,
		currentFiles: files,
		requiredCapabilities: new Set<string>(),
		completionStatus: {},
		handoffQueue: []
	}
}

// Update context with completion status
export function updateCompletionStatus(
	context: ModeContext,
	modeSlug: string,
	completed: boolean
): ModeContext {
	return {
		...context,
		completionStatus: {
			...context.completionStatus,
			[modeSlug]: completed
		}
	}
}
