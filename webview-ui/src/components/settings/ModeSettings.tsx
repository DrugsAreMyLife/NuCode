import * as React from "react"
import { memo } from "react"
import { useExtensionState } from "../../context/ExtensionStateContext"
import { Mode } from "../../../../src/shared/modes"
import {
  ModeCard,
  ModeHeader,
  ModeIcon,
  ModeName,
  ModeDescription,
  ModeSettings as ModeSettingsContainer,
  SettingRow,
  SettingLabel,
  StyledModeTextField,
  StyledModeButton,
} from "./ModeSettingsStyles"

interface ModeSettingsProps {
  mode: Mode
  description: string
  onUpdatePrompt: (mode: string, prompt: string) => void
  onUpdateModel: (mode: string, model: string) => void
}

const getModeIcon = (mode: string): string => {
  switch (mode) {
    case 'code':
      return 'code';
    case 'architect':
      return 'project';
    case 'frontend':
      return 'layout';
    case 'backend':
      return 'server';
    case 'security':
      return 'shield';
    case 'devops':
      return 'server-environment';
    default:
      return 'symbol-misc';
  }
}

const ModeSettings: React.FC<ModeSettingsProps> = ({
  mode,
  description,
  onUpdatePrompt,
  onUpdateModel,
}) => {
  const { customModePrompts = {}, apiConfiguration } = useExtensionState()
  const [prompt, setPrompt] = React.useState(
    typeof customModePrompts[mode] === 'string' ? customModePrompts[mode] as string : ''
  )
  const [model, setModel] = React.useState(apiConfiguration?.id || "")

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value)
  }

  const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setModel(e.target.value)
  }

  const handleSavePrompt = () => {
    onUpdatePrompt(mode, prompt)
  }

  const handleSaveModel = () => {
    onUpdateModel(mode, model)
  }

  return (
    <ModeCard $mode={mode}>
      <ModeHeader>
        <ModeIcon $mode={mode} className={`codicon codicon-${getModeIcon(mode)}`} />
        <ModeName>{mode.charAt(0).toUpperCase() + mode.slice(1)} Mode</ModeName>
      </ModeHeader>
      <ModeDescription>{description}</ModeDescription>
      <ModeSettingsContainer>
        <SettingRow>
          <SettingLabel>Custom Prompt:</SettingLabel>
          <StyledModeTextField
            value={prompt}
            onChange={handlePromptChange}
            placeholder="Enter custom prompt template..."
          />
          <StyledModeButton onClick={handleSavePrompt}>Save</StyledModeButton>
        </SettingRow>
        <SettingRow>
          <SettingLabel>Preferred Model:</SettingLabel>
          <StyledModeTextField
            value={model}
            onChange={handleModelChange}
            placeholder="Enter preferred model ID..."
          />
          <StyledModeButton onClick={handleSaveModel}>Save</StyledModeButton>
        </SettingRow>
      </ModeSettingsContainer>
    </ModeCard>
  )
}

export default memo(ModeSettings)