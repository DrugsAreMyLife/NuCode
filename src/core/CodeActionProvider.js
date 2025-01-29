import * as vscode from "vscode";
import * as path from "path";
export const ACTION_NAMES = {
    EXPLAIN: "Roo Code: Explain Code",
    FIX: "Roo Code: Fix Code",
    IMPROVE: "Roo Code: Improve Code",
};
const COMMAND_IDS = {
    EXPLAIN: "roo-cline.explainCode",
    FIX: "roo-cline.fixCode",
    IMPROVE: "roo-cline.improveCode",
};
export class CodeActionProvider {
    static providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix,
        vscode.CodeActionKind.RefactorRewrite,
    ];
    // Cache file paths for performance
    filePathCache = new WeakMap();
    getEffectiveRange(document, range) {
        try {
            const selectedText = document.getText(range);
            if (selectedText) {
                return { range, text: selectedText };
            }
            const currentLine = document.lineAt(range.start.line);
            if (!currentLine.text.trim()) {
                return null;
            }
            // Optimize range creation by checking bounds first
            const startLine = Math.max(0, currentLine.lineNumber - 1);
            const endLine = Math.min(document.lineCount - 1, currentLine.lineNumber + 1);
            // Only create new positions if needed
            const effectiveRange = new vscode.Range(startLine === currentLine.lineNumber ? range.start : new vscode.Position(startLine, 0), endLine === currentLine.lineNumber
                ? range.end
                : new vscode.Position(endLine, document.lineAt(endLine).text.length));
            return {
                range: effectiveRange,
                text: document.getText(effectiveRange),
            };
        }
        catch (error) {
            console.error("Error getting effective range:", error);
            return null;
        }
    }
    getFilePath(document) {
        // Check cache first
        let filePath = this.filePathCache.get(document);
        if (filePath) {
            return filePath;
        }
        try {
            const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
            if (!workspaceFolder) {
                filePath = document.uri.fsPath;
            }
            else {
                const relativePath = path.relative(workspaceFolder.uri.fsPath, document.uri.fsPath);
                filePath = !relativePath || relativePath.startsWith("..") ? document.uri.fsPath : relativePath;
            }
            // Cache the result
            this.filePathCache.set(document, filePath);
            return filePath;
        }
        catch (error) {
            console.error("Error getting file path:", error);
            return document.uri.fsPath;
        }
    }
    createDiagnosticData(diagnostic) {
        return {
            message: diagnostic.message,
            severity: diagnostic.severity,
            code: diagnostic.code,
            source: diagnostic.source,
            range: diagnostic.range, // Reuse the range object
        };
    }
    createAction(title, kind, command, args) {
        const action = new vscode.CodeAction(title, kind);
        action.command = { command, title, arguments: args };
        return action;
    }
    createActionPair(baseTitle, kind, baseCommand, args) {
        return [
            this.createAction(`${baseTitle} in New Task`, kind, baseCommand, args),
            this.createAction(`${baseTitle} in Current Task`, kind, `${baseCommand}InCurrentTask`, args),
        ];
    }
    hasIntersectingRange(range1, range2) {
        // Optimize range intersection check
        return !(range2.end.line < range1.start.line ||
            range2.start.line > range1.end.line ||
            (range2.end.line === range1.start.line && range2.end.character < range1.start.character) ||
            (range2.start.line === range1.end.line && range2.start.character > range1.end.character));
    }
    provideCodeActions(document, range, context) {
        try {
            const effectiveRange = this.getEffectiveRange(document, range);
            if (!effectiveRange) {
                return [];
            }
            const filePath = this.getFilePath(document);
            const actions = [];
            // Create actions using helper method
            // Add explain actions
            actions.push(...this.createActionPair(ACTION_NAMES.EXPLAIN, vscode.CodeActionKind.QuickFix, COMMAND_IDS.EXPLAIN, [
                filePath,
                effectiveRange.text,
            ]));
            // Only process diagnostics if they exist
            if (context.diagnostics.length > 0) {
                const relevantDiagnostics = context.diagnostics.filter((d) => this.hasIntersectingRange(effectiveRange.range, d.range));
                if (relevantDiagnostics.length > 0) {
                    const diagnosticMessages = relevantDiagnostics.map(this.createDiagnosticData);
                    actions.push(...this.createActionPair(ACTION_NAMES.FIX, vscode.CodeActionKind.QuickFix, COMMAND_IDS.FIX, [
                        filePath,
                        effectiveRange.text,
                        diagnosticMessages,
                    ]));
                }
            }
            // Add improve actions
            actions.push(...this.createActionPair(ACTION_NAMES.IMPROVE, vscode.CodeActionKind.RefactorRewrite, COMMAND_IDS.IMPROVE, [filePath, effectiveRange.text]));
            return actions;
        }
        catch (error) {
            console.error("Error providing code actions:", error);
            return [];
        }
    }
}
//# sourceMappingURL=CodeActionProvider.js.map