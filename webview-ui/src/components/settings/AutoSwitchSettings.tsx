import * as React from "react"
import { memo } from "react"
import { useExtensionState } from "../../context/ExtensionStateContext"
import { vscode } from "../../utils/vscode"
import { Mode } from "../../../../src/shared/modes"

type ModeTriggers = {
  [key in Mode]: string[]
}

interface TriggerState {
  triggers: ModeTriggers
  autoSwitchSensitivity: number
}
import {
  AutoSwitchContainer,
  TriggerGroup,
  TriggerHeader,
  TriggerIcon,
  TriggerTitle,
  TriggerList,
  TriggerItem,
  StyledTriggerInput,
  SensitivitySlider,
  SliderLabel,
  Slider
} from "./AutoSwitchSettingsStyles"

interface AutoSwitchSettingsProps {
  onUpdateTriggers: (mode: Mode, triggers: string[]) => void
  onUpdateSensitivity: (value: number) => void
}

const getModeIcon = (mode: string): string => {
  switch (mode) {
    case 'frontend':
      return 'layout';
    case 'backend':
      return 'server';
    case 'architect':
      return 'project';
    case 'security':
      return 'shield';
    default:
      return 'symbol-misc';
  }
}

const defaultTriggers: ModeTriggers = {
  frontend: [
    '*.css',
    '*.html',
    '*.jsx?',
    '*.tsx?',
    'layout',
    'styling'
  ],
  backend: [
    'api',
    'database',
    'server',
    'endpoint'
  ],
  architect: [
    'design',
    'pattern',
    'architecture',
    'system'
  ],
  security: [
    'security',
    'auth',
    'vulnerability',
    'dependency'
  ],
  code: [],
  devops: [],
  ask: []
} as const;

const AutoSwitchSettings: React.FC<AutoSwitchSettingsProps> = ({
  onUpdateTriggers,
  onUpdateSensitivity
}) => {
  const { autoSwitchSensitivity = 0.8 } = useExtensionState()
  const [triggers, setTriggers] = React.useState<ModeTriggers>(defaultTriggers)

  const handleTriggerChange = (mode: Mode, index: number, value: string) => {
    const newTriggers = { ...triggers }
    newTriggers[mode][index] = value
    setTriggers(newTriggers)
    onUpdateTriggers(mode, newTriggers[mode])
  }

  const handleAddTrigger = (mode: Mode) => {
    const newTriggers = { ...triggers }
    newTriggers[mode] = [...newTriggers[mode], '']
    setTriggers(newTriggers)
  }

  const handleRemoveTrigger = (mode: Mode, index: number) => {
    const newTriggers = { ...triggers }
    newTriggers[mode] = newTriggers[mode].filter((_: string, i: number) => i !== index)
    setTriggers(newTriggers)
    onUpdateTriggers(mode, newTriggers[mode])
  }

  const handleSensitivityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    onUpdateSensitivity(value)
    vscode.postMessage({
      type: "updateCustomMode",
      values: {
        autoSwitchSensitivity: value
      }
    })
  }

  return (
    <AutoSwitchContainer>
      <SensitivitySlider>
        <SliderLabel>Auto-switch sensitivity: {(autoSwitchSensitivity * 100).toFixed(0)}%</SliderLabel>
        <Slider
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={autoSwitchSensitivity}
          onChange={handleSensitivityChange}
        />
      </SensitivitySlider>

      {(Object.entries(triggers) as [Mode, string[]][]).map(([mode, modeTriggers]) => (
        <TriggerGroup key={mode}>
          <TriggerHeader>
            <TriggerIcon $mode={mode} className={`codicon codicon-${getModeIcon(mode)}`} />
            <TriggerTitle>{mode.charAt(0).toUpperCase() + mode.slice(1)} Mode Triggers</TriggerTitle>
          </TriggerHeader>
          <TriggerList>
            {modeTriggers.map((trigger, index) => (
              <TriggerItem key={index}>
                <StyledTriggerInput
                  value={trigger}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleTriggerChange(mode, index, e.target.value)
                  }
                  placeholder="Enter trigger pattern..."
                />
                <button
                  className="codicon codicon-close"
                  onClick={() => handleRemoveTrigger(mode, index)}
                  style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'var(--foreground)' }}
                />
              </TriggerItem>
            ))}
            <button
              onClick={() => handleAddTrigger(mode)}
              style={{
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                color: 'var(--foreground)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px'
              }}>
              <span className="codicon codicon-add" />
              Add Trigger
            </button>
          </TriggerList>
        </TriggerGroup>
      ))}
    </AutoSwitchContainer>
  )
}

export default memo(AutoSwitchSettings)