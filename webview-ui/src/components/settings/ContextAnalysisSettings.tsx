import * as React from "react"
import { memo } from "react"
import { useExtensionState } from "../../context/ExtensionStateContext"
import { vscode } from "../../utils/vscode"
import {
  ContextAnalysisContainer,
  AnalysisGroup,
  AnalysisHeader,
  AnalysisIcon,
  AnalysisTitle,
  AnalysisSettings,
  StyledCheckbox,
  Description,
  ThresholdSlider,
  SliderLabel,
  Slider
} from "./ContextAnalysisSettingsStyles"

interface ContextAnalysisSettingsProps {
  onUpdateSetting: (key: string, value: boolean) => void
  onUpdateThreshold: (key: string, value: number) => void
}

interface AnalysisSetting {
  key: string
  title: string
  description: string
  icon: string
  hasThreshold?: boolean
}

const analysisSettings: AnalysisSetting[] = [
  {
    key: 'projectStructure',
    title: 'Project Structure Analysis',
    description: 'Analyze project directory structure and file organization to understand project architecture',
    icon: 'folder',
    hasThreshold: true
  },
  {
    key: 'techStack',
    title: 'Technology Stack Detection',
    description: 'Detect frameworks, libraries, and tools used in the project',
    icon: 'library',
    hasThreshold: true
  },
  {
    key: 'framework',
    title: 'Framework Recognition',
    description: 'Identify specific frameworks and their patterns in the codebase',
    icon: 'extensions',
    hasThreshold: true
  },
  {
    key: 'patterns',
    title: 'Development Pattern Detection',
    description: 'Recognize common development patterns and architectural styles',
    icon: 'symbol-class',
    hasThreshold: true
  }
];

const ContextAnalysisSettings: React.FC<ContextAnalysisSettingsProps> = ({
  onUpdateSetting,
  onUpdateThreshold
}) => {
  const { contextAnalysis = {}, contextThresholds = {} } = useExtensionState()

  const handleSettingChange = (key: string, checked: boolean) => {
    onUpdateSetting(key, checked)
    vscode.postMessage({
      type: "updateCustomMode",
      values: {
        contextAnalysis: {
          ...contextAnalysis,
          [key]: checked
        }
      }
    })
  }

  const handleThresholdChange = (key: string, value: number) => {
    onUpdateThreshold(key, value)
    vscode.postMessage({
      type: "updateCustomMode",
      values: {
        contextThresholds: {
          ...contextThresholds,
          [key]: value
        }
      }
    })
  }

  return (
    <ContextAnalysisContainer>
      {analysisSettings.map(({ key, title, description, icon, hasThreshold }) => (
        <AnalysisGroup key={key}>
          <AnalysisHeader>
            <AnalysisIcon className={`codicon codicon-${icon}`} />
            <AnalysisTitle>{title}</AnalysisTitle>
          </AnalysisHeader>
          <AnalysisSettings>
            <StyledCheckbox
              checked={contextAnalysis[key] ?? false}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleSettingChange(key, e.target.checked)
              }>
              Enable {title}
            </StyledCheckbox>
            <Description>{description}</Description>
            {hasThreshold && contextAnalysis[key] && (
              <ThresholdSlider>
                <SliderLabel>Confidence Threshold: {((contextThresholds[key] ?? 0.8) * 100).toFixed(0)}%</SliderLabel>
                <Slider
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={contextThresholds[key] ?? 0.8}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleThresholdChange(key, parseFloat(e.target.value))
                  }
                />
              </ThresholdSlider>
            )}
          </AnalysisSettings>
        </AnalysisGroup>
      ))}
    </ContextAnalysisContainer>
  )
}

export default memo(ContextAnalysisSettings)