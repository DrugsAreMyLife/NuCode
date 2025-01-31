import * as React from "react"
import { memo } from "react"
import { useExtensionState } from "../../context/ExtensionStateContext"
import { vscode } from "../../utils/vscode"
import { Mode } from "../../../../src/shared/modes"
import {
  ModelSelectionContainer,
  ModelGroup,
  ModelHeader,
  ModelIcon,
  ModelTitle,
  ModelSettings,
  SettingRow,
  SettingLabel,
  StyledModelTextField,
  ThresholdSlider,
  SliderLabel,
  Slider
} from "./ModelSelectionSettingsStyles"

interface ModelSelectionSettingsProps {
  onUpdateModel: (mode: Mode, model: string) => void
  onUpdateFallback: (mode: Mode, fallback: string) => void
  onUpdateThreshold: (mode: Mode, threshold: number) => void
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

interface ModelConfig {
  primary: string
  fallback: string
  threshold: number
}

type ModeModelConfigs = {
  [key in Mode]: ModelConfig
}

const defaultModelConfigs: ModeModelConfigs = {
  code: { primary: '', fallback: '', threshold: 0.8 },
  architect: { primary: '', fallback: '', threshold: 0.8 },
  frontend: { primary: '', fallback: '', threshold: 0.8 },
  backend: { primary: '', fallback: '', threshold: 0.8 },
  security: { primary: '', fallback: '', threshold: 0.8 },
  devops: { primary: '', fallback: '', threshold: 0.8 },
  ask: { primary: '', fallback: '', threshold: 0.8 }
} as const;

const ModelSelectionSettings: React.FC<ModelSelectionSettingsProps> = ({
  onUpdateModel,
  onUpdateFallback,
  onUpdateThreshold
}) => {
  const { modeApiConfigs = {} } = useExtensionState()
  const [modelConfigs, setModelConfigs] = React.useState<ModeModelConfigs>(defaultModelConfigs)

  const handlePrimaryModelChange = (mode: Mode, value: string) => {
    const newConfigs = { ...modelConfigs }
    newConfigs[mode].primary = value
    setModelConfigs(newConfigs)
    onUpdateModel(mode, value)
  }

  const handleFallbackModelChange = (mode: Mode, value: string) => {
    const newConfigs = { ...modelConfigs }
    newConfigs[mode].fallback = value
    setModelConfigs(newConfigs)
    onUpdateFallback(mode, value)
  }

  const handleThresholdChange = (mode: Mode, value: number) => {
    const newConfigs = { ...modelConfigs }
    newConfigs[mode].threshold = value
    setModelConfigs(newConfigs)
    onUpdateThreshold(mode, value)
  }

  return (
    <ModelSelectionContainer>
      {(Object.entries(modelConfigs) as [Mode, ModelConfig][]).map(([mode, config]) => (
        <ModelGroup key={mode} $mode={mode}>
          <ModelHeader>
            <ModelIcon $mode={mode} className={`codicon codicon-${getModeIcon(mode)}`} />
            <ModelTitle>{mode.charAt(0).toUpperCase() + mode.slice(1)} Mode Models</ModelTitle>
          </ModelHeader>
          <ModelSettings>
            <SettingRow>
              <SettingLabel>Primary Model:</SettingLabel>
              <StyledModelTextField
                value={config.primary}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handlePrimaryModelChange(mode, e.target.value)
                }
                placeholder="Enter primary model ID..."
              />
            </SettingRow>
            <SettingRow>
              <SettingLabel>Fallback Model:</SettingLabel>
              <StyledModelTextField
                value={config.fallback}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleFallbackModelChange(mode, e.target.value)
                }
                placeholder="Enter fallback model ID..."
              />
            </SettingRow>
            <ThresholdSlider>
              <SliderLabel>Performance Threshold: {(config.threshold * 100).toFixed(0)}%</SliderLabel>
              <Slider
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={config.threshold}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleThresholdChange(mode, parseFloat(e.target.value))
                }
              />
            </ThresholdSlider>
          </ModelSettings>
        </ModelGroup>
      ))}
    </ModelSelectionContainer>
  )
}

export default memo(ModelSelectionSettings)