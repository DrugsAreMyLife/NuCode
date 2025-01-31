import * as React from "react"
import { memo, useState, ChangeEvent, KeyboardEvent } from "react"
import { useExtensionState } from "../../context/ExtensionStateContext"
import { validateApiConfiguration, validateModelId } from "../../utils/validate"
import { vscode } from "../../utils/vscode"
import ApiOptions from "./ApiOptions"
import ExperimentalFeature from "./ExperimentalFeature"
import { EXPERIMENT_IDS, experimentConfigsMap } from "../../../../src/shared/experiments"
import ApiConfigManager from "./ApiConfigManager"
import ModeSettings from "./ModeSettings"
import AutoSwitchSettings from "./AutoSwitchSettings"
import ModelSelectionSettings from "./ModelSelectionSettings"
import ContextAnalysisSettings from "./ContextAnalysisSettings"
import PerformanceSettings from "./PerformanceSettings"
import { Dropdown } from "vscrui"
import type { DropdownOption } from "vscrui"
import { Mode } from "../../../../src/shared/modes"
import {
  SettingsContainer,
  SettingsHeader,
  SettingsContent,
  Section,
  SectionTitle,
  Description,
  SettingGroup,
  SubSettingGroup,
  StyledCheckbox,
  StyledButton,
  StyledTextField,
  CommandTag,
  Slider,
  SliderLabel,
  Footer,
  FooterLink,
  Version
} from "./SettingsStyles"

interface SettingsViewProps {
  onDone: () => void
}

interface CheckboxEvent extends ChangeEvent<HTMLInputElement> {
  target: HTMLInputElement & {
    checked: boolean
  }
}

interface TextFieldEvent extends ChangeEvent<HTMLInputElement> {
  target: HTMLInputElement & {
    value: string
  }
}

interface SliderEvent extends ChangeEvent<HTMLInputElement> {
  target: HTMLInputElement & {
    value: string
  }
}

const SettingsView: React.FC<SettingsViewProps> = ({ onDone }) => {
  const {
    apiConfiguration,
    version,
    alwaysAllowReadOnly,
    setAlwaysAllowReadOnly,
    alwaysAllowWrite,
    setAlwaysAllowWrite,
    alwaysAllowExecute,
    setAlwaysAllowExecute,
    alwaysAllowBrowser,
    setAlwaysAllowBrowser,
    alwaysAllowMcp,
    setAlwaysAllowMcp,
    soundEnabled,
    setSoundEnabled,
    soundVolume,
    setSoundVolume,
    diffEnabled,
    setDiffEnabled,
    browserViewportSize,
    setBrowserViewportSize,
    openRouterModels,
    glamaModels,
    setAllowedCommands,
    allowedCommands,
    fuzzyMatchThreshold,
    setFuzzyMatchThreshold,
    writeDelayMs,
    setWriteDelayMs,
    screenshotQuality,
    setScreenshotQuality,
    terminalOutputLineLimit,
    setTerminalOutputLineLimit,
    mcpEnabled,
    alwaysApproveResubmit,
    setAlwaysApproveResubmit,
    requestDelaySeconds,
    setRequestDelaySeconds,
    currentApiConfigName,
    listApiConfigMeta,
    experiments,
    setExperimentEnabled,
    alwaysAllowModeSwitch,
    setAlwaysAllowModeSwitch,
  } = useExtensionState()

  const [apiErrorMessage, setApiErrorMessage] = useState<string | undefined>(undefined)
  const [modelIdErrorMessage, setModelIdErrorMessage] = useState<string | undefined>(undefined)
  const [commandInput, setCommandInput] = useState<string>("")

  const handleSubmit = (): void => {
    const apiValidationResult = validateApiConfiguration(apiConfiguration)
    const modelIdValidationResult = validateModelId(apiConfiguration, glamaModels, openRouterModels)

    setApiErrorMessage(apiValidationResult)
    setModelIdErrorMessage(modelIdValidationResult)
    if (!apiValidationResult && !modelIdValidationResult) {
      // Send all settings to VSCode
      vscode.postMessage({ type: "apiConfiguration", apiConfiguration })
      vscode.postMessage({ type: "alwaysAllowReadOnly", bool: alwaysAllowReadOnly })
      vscode.postMessage({ type: "alwaysAllowWrite", bool: alwaysAllowWrite })
      vscode.postMessage({ type: "alwaysAllowExecute", bool: alwaysAllowExecute })
      vscode.postMessage({ type: "alwaysAllowBrowser", bool: alwaysAllowBrowser })
      vscode.postMessage({ type: "alwaysAllowMcp", bool: alwaysAllowMcp })
      vscode.postMessage({ type: "allowedCommands", commands: allowedCommands ?? [] })
      vscode.postMessage({ type: "soundEnabled", bool: soundEnabled })
      vscode.postMessage({ type: "soundVolume", value: soundVolume })
      vscode.postMessage({ type: "diffEnabled", bool: diffEnabled })
      vscode.postMessage({ type: "browserViewportSize", text: browserViewportSize })
      vscode.postMessage({ type: "fuzzyMatchThreshold", value: fuzzyMatchThreshold ?? 1.0 })
      vscode.postMessage({ type: "writeDelayMs", value: writeDelayMs })
      vscode.postMessage({ type: "screenshotQuality", value: screenshotQuality ?? 75 })
      vscode.postMessage({ type: "terminalOutputLineLimit", value: terminalOutputLineLimit ?? 500 })
      vscode.postMessage({ type: "mcpEnabled", bool: mcpEnabled })
      vscode.postMessage({ type: "alwaysApproveResubmit", bool: alwaysApproveResubmit })
      vscode.postMessage({ type: "requestDelaySeconds", value: requestDelaySeconds })
      vscode.postMessage({ type: "currentApiConfigName", text: currentApiConfigName })
      vscode.postMessage({
        type: "upsertApiConfiguration",
        text: currentApiConfigName,
        apiConfiguration,
      })
      vscode.postMessage({
        type: "updateExperimental",
        values: experiments,
      })
      vscode.postMessage({ type: "alwaysAllowModeSwitch", bool: alwaysAllowModeSwitch })
      onDone()
    }
  }

  const handleResetState = (): void => {
    vscode.postMessage({ type: "resetState" })
  }

  const handleAddCommand = (): void => {
    const currentCommands = allowedCommands ?? []
    if (commandInput && !currentCommands.includes(commandInput)) {
      const newCommands = [...currentCommands, commandInput]
      setAllowedCommands(newCommands)
      setCommandInput("")
      vscode.postMessage({
        type: "allowedCommands",
        commands: newCommands,
      })
    }
  }

  const handleCheckboxChange = (e: CheckboxEvent, setter: (value: boolean) => void): void => {
    setter(e.target.checked)
  }

  const handleSliderChange = (e: SliderEvent, setter: (value: number) => void): void => {
    setter(parseInt(e.target.value))
  }

  const handleTextFieldKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddCommand()
    }
  }

  return (
    <SettingsContainer>
      <SettingsHeader>
        <SectionTitle>Settings</SectionTitle>
        <StyledButton onClick={handleSubmit}>Done</StyledButton>
      </SettingsHeader>

      <SettingsContent>
        {/* Provider Settings Section */}
        <Section>
          <SectionTitle>Provider Settings</SectionTitle>
          <SettingGroup>
            <ApiConfigManager
              currentApiConfigName={currentApiConfigName}
              listApiConfigMeta={listApiConfigMeta}
              onSelectConfig={(configName: string) => {
                vscode.postMessage({
                  type: "loadApiConfiguration",
                  text: configName,
                })
              }}
              onDeleteConfig={(configName: string) => {
                vscode.postMessage({
                  type: "deleteApiConfiguration",
                  text: configName,
                })
              }}
              onRenameConfig={(oldName: string, newName: string) => {
                vscode.postMessage({
                  type: "renameApiConfiguration",
                  values: { oldName, newName },
                  apiConfiguration,
                })
              }}
              onUpsertConfig={(configName: string) => {
                vscode.postMessage({
                  type: "upsertApiConfiguration",
                  text: configName,
                  apiConfiguration,
                })
              }}
            />
            <ApiOptions apiErrorMessage={apiErrorMessage} modelIdErrorMessage={modelIdErrorMessage} />
          </SettingGroup>
        </Section>

        {/* Auto-Approve Settings Section */}
        <Section>
          <SectionTitle>Auto-Approve Settings</SectionTitle>
          <Description>
            The following settings allow Roo to automatically perform operations without requiring approval.
            Enable these settings only if you fully trust the AI and understand the associated security risks.
          </Description>

          {/* Read-only Operations */}
          <SettingGroup>
            <StyledCheckbox
              checked={alwaysAllowReadOnly}
              onChange={(e: CheckboxEvent) => handleCheckboxChange(e, setAlwaysAllowReadOnly)}>
              Always approve read-only operations
            </StyledCheckbox>
            <Description>
              When enabled, Roo will automatically view directory contents and read files without
              requiring you to click the Approve button.
            </Description>
          </SettingGroup>

          {/* Write Operations */}
          <SettingGroup>
            <StyledCheckbox
              checked={alwaysAllowWrite}
              onChange={(e: CheckboxEvent) => handleCheckboxChange(e, setAlwaysAllowWrite)}>
              Always approve write operations
            </StyledCheckbox>
            <Description>
              Automatically create and edit files without requiring approval
            </Description>
            {alwaysAllowWrite && (
              <SubSettingGroup>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Slider
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    value={writeDelayMs}
                    onChange={(e: SliderEvent) => handleSliderChange(e, setWriteDelayMs)}
                  />
                  <SliderLabel>{writeDelayMs}ms</SliderLabel>
                </div>
                <Description>
                  Delay after writes to allow diagnostics to detect potential problems
                </Description>
              </SubSettingGroup>
            )}
          </SettingGroup>

          {/* Browser Actions */}
          <SettingGroup>
            <StyledCheckbox
              checked={alwaysAllowBrowser}
              onChange={(e: CheckboxEvent) => handleCheckboxChange(e, setAlwaysAllowBrowser)}>
              Always approve browser actions
            </StyledCheckbox>
            <Description>
              Automatically perform browser actions without requiring approval
              <br />
              Note: Only applies when the model supports computer use
            </Description>
          </SettingGroup>

          {/* API Request Retry */}
          <SettingGroup>
            <StyledCheckbox
              checked={alwaysApproveResubmit}
              onChange={(e: CheckboxEvent) => handleCheckboxChange(e, setAlwaysApproveResubmit)}>
              Always retry failed API requests
            </StyledCheckbox>
            <Description>
              Automatically retry failed API requests when server returns an error response
            </Description>
            {alwaysApproveResubmit && (
              <SubSettingGroup>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Slider
                    type="range"
                    min="5"
                    max="100"
                    step="1"
                    value={requestDelaySeconds}
                    onChange={(e: SliderEvent) => handleSliderChange(e, setRequestDelaySeconds)}
                  />
                  <SliderLabel>{requestDelaySeconds}s</SliderLabel>
                </div>
                <Description>
                  Delay before retrying the request
                </Description>
              </SubSettingGroup>
            )}
          </SettingGroup>

          {/* MCP Tools */}
          <SettingGroup>
            <StyledCheckbox
              checked={alwaysAllowMcp}
              onChange={(e: CheckboxEvent) => handleCheckboxChange(e, setAlwaysAllowMcp)}>
              Always approve MCP tools
            </StyledCheckbox>
            <Description>
              Enable auto-approval of individual MCP tools in the MCP Servers view (requires both this
              setting and the tool's individual "Always allow" checkbox)
            </Description>
          </SettingGroup>

          {/* Mode Switching */}
          <SettingGroup>
            <StyledCheckbox
              checked={alwaysAllowModeSwitch}
              onChange={(e: CheckboxEvent) => handleCheckboxChange(e, setAlwaysAllowModeSwitch)}>
              Always approve mode switching & task creation
            </StyledCheckbox>
            <Description>
              Automatically switch between different AI modes and create new tasks without requiring
              approval
            </Description>
          </SettingGroup>

          {/* Execute Operations */}
          <SettingGroup>
            <StyledCheckbox
              checked={alwaysAllowExecute}
              onChange={(e: CheckboxEvent) => handleCheckboxChange(e, setAlwaysAllowExecute)}>
              Always approve allowed execute operations
            </StyledCheckbox>
            <Description>
              Automatically execute allowed terminal commands without requiring approval
            </Description>

            {alwaysAllowExecute && (
              <SubSettingGroup>
                <span style={{ fontWeight: "500" }}>Allowed Auto-Execute Commands</span>
                <Description>
                  Command prefixes that can be auto-executed when "Always approve execute operations"
                  is enabled.
                </Description>

                <div style={{ display: "flex", gap: "5px", marginTop: "10px" }}>
                  <StyledTextField
                    value={commandInput}
                    onInput={(e: TextFieldEvent) => setCommandInput(e.target.value)}
                    onKeyDown={handleTextFieldKeyDown}
                    placeholder="Enter command prefix (e.g., 'git ')"
                    style={{ flexGrow: 1 }}
                  />
                  <StyledButton onClick={handleAddCommand}>Add</StyledButton>
                </div>

                <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "5px" }}>
                  {(allowedCommands ?? []).map((cmd: string, index: number) => (
                    <CommandTag key={index}>
                      <span>{cmd}</span>
                      <StyledButton
                        appearance="icon"
                        onClick={() => {
                          const newCommands = (allowedCommands ?? []).filter((_, i) => i !== index)
                          setAllowedCommands(newCommands)
                          vscode.postMessage({
                            type: "allowedCommands",
                            commands: newCommands,
                          })
                        }}>
                        <span className="codicon codicon-close" />
                      </StyledButton>
                    </CommandTag>
                  ))}
                </div>
              </SubSettingGroup>
            )}
          </SettingGroup>
        </Section>

        {/* Browser Settings Section */}
        <Section>
          <SectionTitle>Browser Settings</SectionTitle>
          <SettingGroup>
            <label style={{ fontWeight: "500", display: "block", marginBottom: 5 }}>Viewport size</label>
            <div className="dropdown-container">
              <Dropdown
                value={browserViewportSize}
                onChange={(value: unknown) => {
                  setBrowserViewportSize((value as DropdownOption).value)
                }}
                style={{ width: "100%" }}
                options={[
                  { value: "1280x800", label: "Large Desktop (1280x800)" },
                  { value: "900x600", label: "Small Desktop (900x600)" },
                  { value: "768x1024", label: "Tablet (768x1024)" },
                  { value: "360x640", label: "Mobile (360x640)" },
                ]}
              />
            </div>
            <Description>
              Select the viewport size for browser interactions. This affects how websites are displayed
              and interacted with.
            </Description>
          </SettingGroup>

          <SettingGroup>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <span style={{ fontWeight: "500" }}>Screenshot quality</span>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <Slider
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={screenshotQuality ?? 75}
                  onChange={(e: SliderEvent) => handleSliderChange(e, setScreenshotQuality)}
                />
                <SliderLabel>{screenshotQuality ?? 75}%</SliderLabel>
              </div>
            </div>
            <Description>
              Adjust the WebP quality of browser screenshots. Higher values provide clearer screenshots
              but increase token usage.
            </Description>
          </SettingGroup>
        </Section>

        {/* Notification Settings Section */}
        <Section>
          <SectionTitle>Notification Settings</SectionTitle>
          <SettingGroup>
            <StyledCheckbox
              checked={soundEnabled}
              onChange={(e: CheckboxEvent) => handleCheckboxChange(e, setSoundEnabled)}>
              Enable sound effects
            </StyledCheckbox>
            <Description>
              When enabled, Roo will play sound effects for notifications and events.
            </Description>
          </SettingGroup>
          {soundEnabled && (
            <SubSettingGroup>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ fontWeight: "500", minWidth: "100px" }}>Volume</span>
                <Slider
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={soundVolume ?? 0.5}
                  onChange={(e: SliderEvent) => {
                    setSoundVolume(parseFloat(e.target.value))
                  }}
                  aria-label="Volume"
                />
                <SliderLabel>
                  {((soundVolume ?? 0.5) * 100).toFixed(0)}%
                </SliderLabel>
              </div>
            </SubSettingGroup>
          )}
        </Section>

        {/* Performance Settings Section */}
        <Section>
          <SectionTitle>Performance</SectionTitle>
          <Description>
            Configure caching, model loading, and resource optimization settings to improve performance.
          </Description>
          <SettingGroup>
            <PerformanceSettings
              onUpdateSetting={(key: string, value: boolean) => {
                vscode.postMessage({
                  type: "updateCustomMode",
                  values: {
                    performanceSettings: {
                      [key]: value
                    }
                  }
                })
              }}
              onUpdateLimit={(key: string, value: number) => {
                vscode.postMessage({
                  type: "updateCustomMode",
                  values: {
                    resourceLimits: {
                      [key]: value
                    }
                  }
                })
              }}
            />
          </SettingGroup>
        </Section>

        {/* Context Analysis Settings Section */}
        <Section>
          <SectionTitle>Context Analysis</SectionTitle>
          <Description>
            Configure how Roo analyzes your project structure, technology stack, and development patterns.
          </Description>
          <SettingGroup>
            <ContextAnalysisSettings
              onUpdateSetting={(key: string, value: boolean) => {
                vscode.postMessage({
                  type: "updateCustomMode",
                  values: {
                    contextAnalysis: {
                      [key]: value
                    }
                  }
                })
              }}
              onUpdateThreshold={(key: string, value: number) => {
                vscode.postMessage({
                  type: "updateCustomMode",
                  values: {
                    contextThresholds: {
                      [key]: value
                    }
                  }
                })
              }}
            />
          </SettingGroup>
        </Section>

        {/* Model Selection Settings Section */}
        <Section>
          <SectionTitle>Model Selection</SectionTitle>
          <Description>
            Configure primary and fallback models for each mode, along with performance thresholds.
          </Description>
          <SettingGroup>
            <ModelSelectionSettings
              onUpdateModel={(mode: Mode, model: string) => {
                vscode.postMessage({
                  type: "updateCustomMode",
                  values: { mode, model }
                })
              }}
              onUpdateFallback={(mode: Mode, fallback: string) => {
                vscode.postMessage({
                  type: "updateCustomMode",
                  values: { mode, fallback }
                })
              }}
              onUpdateThreshold={(mode: Mode, threshold: number) => {
                vscode.postMessage({
                  type: "updateCustomMode",
                  values: { mode, threshold }
                })
              }}
            />
          </SettingGroup>
        </Section>

        {/* Mode Auto-Switch Settings Section */}
        <Section>
          <SectionTitle>Mode Auto-Switching</SectionTitle>
          <Description>
            Configure when Roo should automatically switch between different modes based on context.
          </Description>
          <SettingGroup>
            <AutoSwitchSettings
              onUpdateTriggers={(mode: Mode, triggers: string[]) => {
                vscode.postMessage({
                  type: "updateCustomMode",
                  values: { mode, triggers }
                })
              }}
              onUpdateSensitivity={(value: number) => {
                vscode.postMessage({
                  type: "updateCustomMode",
                  values: { autoSwitchSensitivity: value }
                })
              }}
            />
          </SettingGroup>
        </Section>

        {/* Mode Settings Section */}
        <Section>
          <SectionTitle>Mode Settings</SectionTitle>
          <Description>
            Configure mode-specific settings including custom prompts and preferred models for each mode.
          </Description>
          <SettingGroup>
            {[
              {
                mode: "code",
                description: "General software development with broad language support"
              },
              {
                mode: "architect",
                description: "Focus on system design, patterns, and high-level decisions"
              },
              {
                mode: "frontend",
                description: "Specialized for web UI/UX development"
              },
              {
                mode: "backend",
                description: "Optimized for server-side and API development"
              },
              {
                mode: "security",
                description: "Specialized for security audits and fixes"
              },
              {
                mode: "devops",
                description: "Infrastructure and deployment focused"
              }
            ].map(({ mode, description }) => (
              <ModeSettings
                key={mode}
                mode={mode}
                description={description}
                onUpdatePrompt={(mode, prompt) => {
                  vscode.postMessage({
                    type: "updateCustomMode",
                    values: {
                      mode,
                      prompt
                    }
                  })
                }}
                onUpdateModel={(mode, model) => {
                  vscode.postMessage({
                    type: "updateCustomMode",
                    values: {
                      mode,
                      model
                    }
                  })
                }}
              />
            ))}
          </SettingGroup>
        </Section>

        {/* Advanced Settings Section */}
        <Section>
          <SectionTitle>Advanced Settings</SectionTitle>
          <SettingGroup>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <span style={{ fontWeight: "500" }}>Terminal output limit</span>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <Slider
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  value={terminalOutputLineLimit ?? 500}
                  onChange={(e: SliderEvent) => handleSliderChange(e, setTerminalOutputLineLimit)}
                />
                <SliderLabel>{terminalOutputLineLimit ?? 500}</SliderLabel>
              </div>
            </div>
            <Description>
              Maximum number of lines to include in terminal output when executing commands. When exceeded
              lines will be removed from the middle, saving tokens.
            </Description>
          </SettingGroup>

          <SettingGroup>
            <StyledCheckbox
              checked={diffEnabled}
              onChange={(e: CheckboxEvent) => {
                handleCheckboxChange(e, setDiffEnabled)
                if (!e.target.checked) {
                  setExperimentEnabled(EXPERIMENT_IDS.DIFF_STRATEGY, false)
                }
              }}>
              Enable editing through diffs
            </StyledCheckbox>
            <Description>
              When enabled, Roo will be able to edit files more quickly and will automatically reject
              truncated full-file writes. Works best with the latest Claude 3.5 Sonnet model.
            </Description>

            {diffEnabled && (
              <SubSettingGroup>
                <ExperimentalFeature
                  key={EXPERIMENT_IDS.DIFF_STRATEGY}
                  {...experimentConfigsMap.DIFF_STRATEGY}
                  enabled={experiments[EXPERIMENT_IDS.DIFF_STRATEGY] ?? false}
                  onChange={(enabled: boolean) => setExperimentEnabled(EXPERIMENT_IDS.DIFF_STRATEGY, enabled)}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginTop: "15px" }}>
                  <span style={{ fontWeight: "500" }}>Match precision</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <Slider
                      type="range"
                      min="0.8"
                      max="1"
                      step="0.005"
                      value={fuzzyMatchThreshold ?? 1.0}
                      onChange={(e: SliderEvent) => {
                        setFuzzyMatchThreshold(parseFloat(e.target.value))
                      }}
                    />
                    <SliderLabel>
                      {Math.round((fuzzyMatchThreshold || 1) * 100)}%
                    </SliderLabel>
                  </div>
                </div>
                <Description>
                  This slider controls how precisely code sections must match when applying diffs.
                  Lower values allow more flexible matching but increase the risk of incorrect
                  replacements. Use values below 100% with extreme caution.
                </Description>
              </SubSettingGroup>
            )}
            {Object.entries(experimentConfigsMap)
              .filter((config) => config[0] !== "DIFF_STRATEGY")
              .map((config) => (
                <ExperimentalFeature
                  key={config[0]}
                  {...config[1]}
                  enabled={
                    experiments[EXPERIMENT_IDS[config[0] as keyof typeof EXPERIMENT_IDS]] ?? false
                  }
                  onChange={(enabled: boolean) =>
                    setExperimentEnabled(
                      EXPERIMENT_IDS[config[0] as keyof typeof EXPERIMENT_IDS],
                      enabled,
                    )
                  }
                />
              ))}
          </SettingGroup>
        </Section>

        <Footer>
          <p>
            If you have any questions or feedback, feel free to open an issue at{" "}
            <FooterLink href="https://github.com/RooVetGit/Roo-Code">
              github.com/RooVetGit/Roo-Code
            </FooterLink>{" "}
            or join{" "}
            <FooterLink href="https://www.reddit.com/r/RooCode/">
              reddit.com/r/RooCode
            </FooterLink>
          </p>
          <Version>v{version}</Version>

          <Description>
            This will reset all global state and secret storage in the extension.
          </Description>

          <StyledButton
            onClick={handleResetState}
            appearance="secondary"
            style={{ marginTop: "5px", width: "auto" }}>
            Reset State
          </StyledButton>
        </Footer>
      </SettingsContent>
    </SettingsContainer>
  )
}

export default memo(SettingsView)
