import { z } from "zod";
import { TOOL_GROUPS } from "../../shared/tool-groups";
// Create a schema for valid tool groups using the keys of TOOL_GROUPS
const ToolGroupSchema = z.enum(Object.keys(TOOL_GROUPS));
// Schema for group options with regex validation
const GroupOptionsSchema = z.object({
    fileRegex: z
        .string()
        .optional()
        .refine((pattern) => {
        if (!pattern)
            return true; // Optional, so empty is valid
        try {
            new RegExp(pattern);
            return true;
        }
        catch {
            return false;
        }
    }, { message: "Invalid regular expression pattern" }),
    description: z.string().optional(),
});
// Schema for a group entry - either a tool group string or a tuple of [group, options]
const GroupEntrySchema = z.union([ToolGroupSchema, z.tuple([ToolGroupSchema, GroupOptionsSchema])]);
// Schema for array of groups
const GroupsArraySchema = z
    .array(GroupEntrySchema)
    .min(1, "At least one tool group is required")
    .refine((groups) => {
    const seen = new Set();
    return groups.every((group) => {
        // For tuples, check the group name (first element)
        const groupName = Array.isArray(group) ? group[0] : group;
        if (seen.has(groupName))
            return false;
        seen.add(groupName);
        return true;
    });
}, { message: "Duplicate groups are not allowed" });
// Schema for file patterns with regex validation
const FilePatternSchema = z.string().refine((pattern) => {
    try {
        new RegExp(pattern);
        return true;
    }
    catch {
        return false;
    }
}, { message: "Invalid file pattern regex" });
// Schema for capabilities
const CapabilitiesSchema = z
    .array(z.string())
    .min(1, "At least one capability is required")
    .refine((capabilities) => {
    const seen = new Set();
    return capabilities.every((cap) => {
        if (seen.has(cap))
            return false;
        seen.add(cap);
        return true;
    });
}, { message: "Duplicate capabilities are not allowed" });
// Schema for triggers
const TriggersSchema = z
    .array(z.string())
    .min(1, "At least one trigger is required")
    .refine((triggers) => {
    const seen = new Set();
    return triggers.every((trigger) => {
        if (seen.has(trigger))
            return false;
        seen.add(trigger);
        return true;
    });
}, { message: "Duplicate triggers are not allowed" });
// Schema for handoff targets
const HandoffSchema = z
    .array(z.string())
    .refine((handoffs) => {
    const seen = new Set();
    return handoffs.every((target) => {
        if (seen.has(target))
            return false;
        seen.add(target);
        return true;
    });
}, { message: "Duplicate handoff targets are not allowed" });
// Schema for mode configuration
export const CustomModeSchema = z.object({
    // Existing fields
    slug: z.string().regex(/^[a-zA-Z0-9-]+$/, "Slug must contain only letters numbers and dashes"),
    name: z.string().min(1, "Name is required"),
    roleDefinition: z.string().min(1, "Role definition is required"),
    customInstructions: z.string().optional(),
    groups: GroupsArraySchema,
    // New fields for enhanced mode system
    capabilities: CapabilitiesSchema.optional(),
    triggers: TriggersSchema.optional(),
    handoffTo: HandoffSchema.optional(),
    filePatterns: z.array(FilePatternSchema).optional(),
});
// Schema for the entire custom modes settings file
export const CustomModesSettingsSchema = z.object({
    customModes: z.array(CustomModeSchema).refine((modes) => {
        const slugs = new Set();
        return modes.every((mode) => {
            if (slugs.has(mode.slug)) {
                return false;
            }
            slugs.add(mode.slug);
            return true;
        });
    }, {
        message: "Duplicate mode slugs are not allowed",
    }).refine((modes) => {
        // Validate handoff targets refer to valid mode slugs
        const validSlugs = new Set(modes.map(mode => mode.slug));
        return modes.every(mode => !mode.handoffTo || mode.handoffTo.every(target => validSlugs.has(target)));
    }, {
        message: "Handoff targets must refer to valid mode slugs",
    }),
});
/**
 * Validates a custom mode configuration against the schema
 * @throws {z.ZodError} if validation fails
 */
export function validateCustomMode(mode) {
    CustomModeSchema.parse(mode);
}
/**
 * Validates handoff targets against available modes
 * @throws {Error} if any handoff target is invalid
 */
export function validateHandoffTargets(mode, availableModes) {
    if (!mode.handoffTo?.length)
        return;
    const validSlugs = new Set(availableModes.map(m => m.slug));
    const invalidTargets = mode.handoffTo.filter(target => !validSlugs.has(target));
    if (invalidTargets.length > 0) {
        throw new Error(`Invalid handoff targets in mode ${mode.slug}: ${invalidTargets.join(", ")}`);
    }
}
//# sourceMappingURL=CustomModesSchema.js.map