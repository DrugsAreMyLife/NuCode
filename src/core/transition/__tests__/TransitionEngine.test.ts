/// <reference types="jest" />

import { describe, expect, it, beforeEach, jest } from '@jest/globals'
import * as vscode from 'vscode'
import { TransitionEngine, TransitionEvent, TransitionErrorEvent, MODE_TRANSITION_EVENTS } from "../TransitionEngine"
import { ModeConfig } from "../../../shared/modes"

// Mock vscode
jest.mock('vscode', () => ({
	EventEmitter: jest.fn().mockImplementation(() => ({
		event: jest.fn(),
		fire: jest.fn(),
		dispose: jest.fn()
	})),
	window: {
		createOutputChannel: jest.fn().mockReturnValue({
			appendLine: jest.fn(),
			dispose: jest.fn()
		})
	}
}))

// Test mode configurations
const testModes: ModeConfig[] = [
	{
		slug: "code",
		name: "Code",
		roleDefinition: "Code mode for testing",
		groups: ["read", "edit"],
		capabilities: ["implement", "test"],
		triggers: ["code", "implement"],
		handoffTo: ["architect", "tester"],
		filePatterns: ["\\.ts$", "\\.js$"]
	},
	{
		slug: "architect",
		name: "Architect",
		roleDefinition: "Architect mode for testing",
		groups: ["read"],
		capabilities: ["design", "review"],
		triggers: ["architecture", "design"],
		handoffTo: ["code"],
		filePatterns: ["\\.md$"]
	},
	{
		slug: "tester",
		name: "Tester",
		roleDefinition: "Tester mode for testing",
		groups: ["read"],
		capabilities: ["test", "verify"],
		triggers: ["test", "verify"],
		handoffTo: ["code"],
		filePatterns: ["test\\.ts$"]
	}
]

describe("TransitionEngine", () => {
	let engine: TransitionEngine
	let onTransitionMock: jest.Mock
	let eventEmitterMock: jest.SpyInstance
	let outputChannelMock: jest.SpyInstance

	beforeEach(() => {
		onTransitionMock = jest.fn()
		eventEmitterMock = jest.spyOn(vscode.EventEmitter.prototype, 'fire')
		outputChannelMock = jest.spyOn(vscode.window.createOutputChannel('Mode Transition'), 'appendLine')
		engine = new TransitionEngine(testModes, onTransitionMock)
	})

	describe("Initial State", () => {
		it("should start with no current mode", () => {
			expect(engine.getCurrentMode()).toBeNull()
		})

		it("should start with no context", () => {
			expect(engine.getContext()).toBeNull()
		})

		it("should initialize event emitter", () => {
			expect(vscode.EventEmitter).toHaveBeenCalled()
		})

		it("should create output channel", () => {
			expect(vscode.window.createOutputChannel).toHaveBeenCalledWith("Mode Transition")
		})
	})

	describe("Task-based Transitions", () => {
		it("should transition to code mode for implementation task", async () => {
			await engine.startTask("implement new feature")
			expect(engine.getCurrentMode()?.slug).toBe("code")
			expect(eventEmitterMock).toHaveBeenCalled()
			expect(onTransitionMock).toHaveBeenCalled()
		})

		it("should transition to architect mode for design task", async () => {
			await engine.startTask("design system architecture")
			expect(engine.getCurrentMode()?.slug).toBe("architect")
		})

		it("should transition to tester mode for testing task", async () => {
			await engine.startTask("verify functionality")
			expect(engine.getCurrentMode()?.slug).toBe("tester")
		})

		it("should log task transitions", async () => {
			await engine.startTask("implement new feature")
			expect(outputChannelMock).toHaveBeenCalledWith(expect.stringContaining("Starting task"))
		})
	})

	describe("File-based Transitions", () => {
		it("should transition based on file patterns", async () => {
			await engine.startTask("work on files", ["src/component.ts"])
			expect(engine.getCurrentMode()?.slug).toBe("code")
		})

		it("should transition to architect for markdown files", async () => {
			await engine.startTask("work on files", ["docs/architecture.md"])
			expect(engine.getCurrentMode()?.slug).toBe("architect")
		})

		it("should transition to tester for test files", async () => {
			await engine.startTask("work on files", ["src/component.test.ts"])
			expect(engine.getCurrentMode()?.slug).toBe("tester")
		})

		it("should update mode when files change", async () => {
			await engine.startTask("work on files", ["src/component.ts"])
			expect(engine.getCurrentMode()?.slug).toBe("code")
			
			await engine.updateFiles(["docs/architecture.md"])
			expect(engine.getCurrentMode()?.slug).toBe("architect")
		})

		it("should log file updates", async () => {
			await engine.updateFiles(["src/component.ts"])
			expect(outputChannelMock).toHaveBeenCalledWith(expect.stringContaining("Updating files"))
		})
	})

	describe("Handoff Transitions", () => {
		it("should allow handoff from code to architect", async () => {
			await engine.startTask("implement feature")
			expect(engine.getCurrentMode()?.slug).toBe("code")
			
			await engine.completeCurrentTask()
			await engine.updateFiles(["docs/architecture.md"])
			expect(engine.getCurrentMode()?.slug).toBe("architect")
		})

		it("should track handoff history", async () => {
			await engine.startTask("implement feature")
			await engine.completeCurrentTask()
			await engine.updateFiles(["docs/architecture.md"])
			
			const context = engine.getContext()
			expect(context?.handoffQueue).toContain("code")
		})

		it("should prevent invalid handoffs", async () => {
			await engine.startTask("design architecture")
			expect(engine.getCurrentMode()?.slug).toBe("architect")
			
			await engine.updateFiles(["src/component.test.ts"])
			expect(engine.getCurrentMode()?.slug).toBe("architect")
		})

		it("should emit transition events", async () => {
			await engine.startTask("implement feature")
			await engine.completeCurrentTask()
			
			expect(eventEmitterMock).toHaveBeenCalledWith(expect.objectContaining({
				fromMode: expect.any(Object),
				toMode: expect.any(Object),
				context: expect.any(Object)
			}))
		})
	})

	describe("Performance Optimizations", () => {
		it("should cache rule evaluations", async () => {
			await engine.startTask("implement feature")
			const firstMode = engine.getCurrentMode()
			
			// Second evaluation should use cache
			await engine.startTask("implement feature")
			expect(engine.getCurrentMode()).toBe(firstMode)
		})

		it("should clear cache on context change", async () => {
			await engine.startTask("implement feature")
			await engine.updateFiles(["new-file.ts"])
			
			// Cache should be cleared due to context change
			expect(outputChannelMock).toHaveBeenCalledWith(expect.stringContaining("Evaluating transition rules"))
		})
	})

	describe("Error Handling", () => {
		it("should emit error events", async () => {
			await expect(engine.updateFiles(["file.ts"])).rejects.toThrow("No active context")
			expect(eventEmitterMock).toHaveBeenCalledWith(expect.objectContaining({
				error: expect.any(Error)
			}))
		})

		it("should log errors", async () => {
			await expect(engine.completeCurrentTask()).rejects.toThrow()
			expect(outputChannelMock).toHaveBeenCalledWith(expect.stringContaining("error"))
		})
	})

	describe("Resource Management", () => {
		it("should dispose resources", () => {
			engine.dispose()
			expect(vscode.EventEmitter.prototype.dispose).toHaveBeenCalled()
		})
	})
})