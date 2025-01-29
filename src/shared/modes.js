import { TOOL_GROUPS, ALWAYS_AVAILABLE_TOOLS } from "./tool-groups";
// Helper to extract group name regardless of format
export function getGroupName(group) {
    return Array.isArray(group) ? group[0] : group;
}
// Helper to get group options if they exist
function getGroupOptions(group) {
    return Array.isArray(group) ? group[1] : undefined;
}
// Helper to check if a file path matches a regex pattern
export function doesFileMatchRegex(filePath, pattern) {
    try {
        const regex = new RegExp(pattern);
        return regex.test(filePath);
    }
    catch (error) {
        console.error(`Invalid regex pattern: ${pattern}`, error);
        return false;
    }
}
// Helper to get all tools for a mode
export function getToolsForMode(groups) {
    const tools = new Set();
    // Add tools from each group
    groups.forEach((group) => {
        const groupName = getGroupName(group);
        TOOL_GROUPS[groupName].forEach((tool) => tools.add(tool));
    });
    // Always add required tools
    ALWAYS_AVAILABLE_TOOLS.forEach((tool) => tools.add(tool));
    return Array.from(tools);
}
// Main modes configuration as an ordered array
export const modes = [
    {
        slug: "code",
        name: "Code",
        roleDefinition: "You are Roo, a highly skilled software engineer with extensive knowledge in many programming languages, frameworks, design patterns, and best practices.",
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
        roleDefinition: "You are Roo, a software architecture expert specializing in analyzing codebases, identifying patterns, and providing high-level technical guidance. You excel at understanding complex systems, evaluating architectural decisions, and suggesting improvements. You can edit markdown documentation files to help document architectural decisions and patterns.",
        groups: ["read", ["edit", { fileRegex: "\\.md$", description: "Markdown files only" }], "browser", "mcp"],
        capabilities: ["design", "review", "document", "analyze"],
        triggers: ["architecture", "design", "pattern", "structure"],
        handoffTo: ["code", "security", "deployer"],
        filePatterns: [".*\\.md$", "docs/.*", "architecture/.*"]
    },
    {
        slug: "ask",
        name: "Ask",
        roleDefinition: "You are Roo, a knowledgeable technical assistant focused on answering questions and providing information about software development, technology, and related topics. You can analyze code, explain concepts, and access external resources. While you primarily maintain a read-only approach to the codebase, you can create and edit markdown files to better document and explain concepts. Make sure to answer the user's questions and don't rush to switch to implementing code.",
        groups: ["read", ["edit", { fileRegex: "\\.md$", description: "Markdown files only" }], "browser", "mcp"],
        capabilities: ["explain", "research", "document", "analyze"],
        triggers: ["explain", "how", "what", "why", "help"],
        handoffTo: ["code", "architect"],
        filePatterns: [".*\\.md$", "docs/.*"]
    },
];
// Export the default mode slug
export const defaultModeSlug = modes[0].slug;
// Helper functions
export function getModeBySlug(slug, customModes) {
    // Check custom modes first
    const customMode = customModes?.find((mode) => mode.slug === slug);
    if (customMode) {
        return customMode;
    }
    // Then check built-in modes
    return modes.find((mode) => mode.slug === slug);
}
export function getModeConfig(slug, customModes) {
    const mode = getModeBySlug(slug, customModes);
    if (!mode) {
        throw new Error(`No mode found for slug: ${slug}`);
    }
    return mode;
}
// Get all available modes, with custom modes overriding built-in modes
export function getAllModes(customModes) {
    if (!customModes?.length) {
        return [...modes];
    }
    // Start with built-in modes
    const allModes = [...modes];
    // Process custom modes
    customModes.forEach((customMode) => {
        const index = allModes.findIndex((mode) => mode.slug === customMode.slug);
        if (index !== -1) {
            // Override existing mode
            allModes[index] = customMode;
        }
        else {
            // Add new mode
            allModes.push(customMode);
        }
    });
    return allModes;
}
// Check if a mode is custom or an override
export function isCustomMode(slug, customModes) {
    return !!customModes?.some((mode) => mode.slug === slug);
}
// Custom error class for file restrictions
export class FileRestrictionError extends Error {
    constructor(mode, pattern, description, filePath) {
        super(`This mode (${mode}) can only edit files matching pattern: ${pattern}${description ? ` (${description})` : ""}. Got: ${filePath}`);
        this.name = "FileRestrictionError";
    }
}
export function isToolAllowedForMode(tool, modeSlug, customModes, toolRequirements, toolParams, experiments) {
    // Always allow these tools
    if (ALWAYS_AVAILABLE_TOOLS.includes(tool)) {
        return true;
    }
    if (experiments && tool in experiments) {
        if (!experiments[tool]) {
            return false;
        }
    }
    // Check tool requirements if any exist
    if (toolRequirements && tool in toolRequirements) {
        if (!toolRequirements[tool]) {
            return false;
        }
    }
    const mode = getModeBySlug(modeSlug, customModes);
    if (!mode) {
        return false;
    }
    // Check if tool is in any of the mode's groups and respects any group options
    for (const group of mode.groups) {
        const groupName = getGroupName(group);
        const options = getGroupOptions(group);
        // If the tool isn't in this group, continue to next group
        if (!TOOL_GROUPS[groupName].includes(tool)) {
            continue;
        }
        // If there are no options, allow the tool
        if (!options) {
            return true;
        }
        // For the edit group, check file regex if specified
        if (groupName === "edit" && options.fileRegex) {
            const filePath = toolParams?.path;
            if (filePath &&
                (toolParams.diff || toolParams.content || toolParams.operations) &&
                !doesFileMatchRegex(filePath, options.fileRegex)) {
                throw new FileRestrictionError(mode.name, options.fileRegex, options.description, filePath);
            }
        }
        return true;
    }
    return false;
}
// Create the mode-specific default prompts
export const defaultPrompts = Object.freeze(Object.fromEntries(modes.map((mode) => [mode.slug, { roleDefinition: mode.roleDefinition }])));
// Helper function to safely get role definition
export function getRoleDefinition(modeSlug, customModes) {
    const mode = getModeBySlug(modeSlug, customModes);
    if (!mode) {
        console.warn(`No mode found for slug: ${modeSlug}`);
        return "";
    }
    return mode.roleDefinition;
}
// New helper functions for enhanced mode system
// Check if a mode has a specific capability
export function hasCapability(mode, capability) {
    return mode.capabilities?.includes(capability) ?? false;
}
// Check if a mode can handle a specific file pattern
export function canHandleFile(mode, filePath) {
    if (!mode.filePatterns?.length) {
        return true; // If no patterns specified, assume it can handle any file
    }
    return mode.filePatterns.some(pattern => doesFileMatchRegex(filePath, pattern));
}
// Check if a mode can receive handoffs from another mode
export function canReceiveHandoff(fromMode, toMode) {
    return fromMode.handoffTo?.includes(toMode.slug) ?? false;
}
// Check if a mode should be triggered based on task description
export function shouldTriggerForTask(mode, task) {
    if (!mode.triggers?.length) {
        return false;
    }
    return mode.triggers.some(trigger => task.toLowerCase().includes(trigger.toLowerCase()));
}
// Create a new context for a mode
export function createModeContext(task, files = []) {
    return {
        currentTask: task,
        currentFiles: files,
        requiredCapabilities: new Set(),
        completionStatus: {},
        handoffQueue: []
    };
}
// Update context with completion status
export function updateCompletionStatus(context, modeSlug, completed) {
    return {
        ...context,
        completionStatus: {
            ...context.completionStatus,
            [modeSlug]: completed
        }
    };
}
//# sourceMappingURL=modes.js.map