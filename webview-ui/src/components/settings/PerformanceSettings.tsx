import * as React from "react"
import { memo } from "react"
import { useExtensionState } from "../../context/ExtensionStateContext"
import { vscode } from "../../utils/vscode"
import {
  PerformanceContainer,
  PerformanceGroup,
  PerformanceHeader,
  PerformanceIcon,
  PerformanceTitle,
  PerformanceSettings as Settings,
  StyledCheckbox,
  Description,
  ThresholdSlider,
  SliderLabel,
  Slider,
  ResourceLimitGroup,
  ResourceLimit,
  ResourceLabel
} from "./PerformanceSettingsStyles"

interface PerformanceSettingsProps {
  onUpdateSetting: (key: string, value: boolean) => void
  onUpdateLimit: (key: string, value: number) => void
}

interface PerformanceSetting {
  key: string
  title: string
  description: string
  icon: string
  hasLimit?: boolean
  defaultLimit?: number
  limitLabel?: string
  limitMin?: number
  limitMax?: number
  limitStep?: number
}

const performanceSettings: PerformanceSetting[] = [
  {
    key: 'modeCaching',
    title: 'Mode-specific Caching',
    description: 'Cache mode-specific data to improve switching performance',
    icon: 'database',
    hasLimit: true,
    defaultLimit: 100,
    limitLabel: 'Cache Size (MB)',
    limitMin: 10,
    limitMax: 1000,
    limitStep: 10
  },
  {
    key: 'preemptiveLoading',
    title: 'Preemptive Model Loading',
    description: 'Load models in advance based on context analysis',
    icon: 'sync',
    hasLimit: true,
    defaultLimit: 2,
    limitLabel: 'Max Preloaded Models',
    limitMin: 1,
    limitMax: 5,
    limitStep: 1
  },
  {
    key: 'resourceOptimization',
    title: 'Resource Usage Optimization',
    description: 'Optimize memory and CPU usage for better performance',
    icon: 'pulse',
    hasLimit: true,
    defaultLimit: 50,
    limitLabel: 'Max CPU Usage (%)',
    limitMin: 10,
    limitMax: 100,
    limitStep: 5
  },
  {
    key: 'contextRetention',
    title: 'Context Retention',
    description: 'Maintain context between mode switches for faster transitions',
    icon: 'history',
    hasLimit: true,
    defaultLimit: 5,
    limitLabel: 'Context History Size',
    limitMin: 1,
    limitMax: 10,
    limitStep: 1
  }
];

const PerformanceSettings: React.FC<PerformanceSettingsProps> = ({
  onUpdateSetting,
  onUpdateLimit
}) => {
  const { performanceSettings: settings = {}, resourceLimits = {} } = useExtensionState()

  const handleSettingChange = (key: string, checked: boolean) => {
    onUpdateSetting(key, checked)
    vscode.postMessage({
      type: "updateCustomMode",
      values: {
        performanceSettings: {
          ...settings,
          [key]: checked
        }
      }
    })
  }

  const handleLimitChange = (key: string, value: number) => {
    onUpdateLimit(key, value)
    vscode.postMessage({
      type: "updateCustomMode",
      values: {
        resourceLimits: {
          ...resourceLimits,
          [key]: value
        }
      }
    })
  }

  return (
    <PerformanceContainer>
      {performanceSettings.map(({
        key,
        title,
        description,
        icon,
        hasLimit,
        defaultLimit,
        limitLabel,
        limitMin,
        limitMax,
        limitStep
      }) => (
        <PerformanceGroup key={key}>
          <PerformanceHeader>
            <PerformanceIcon className={`codicon codicon-${icon}`} />
            <PerformanceTitle>{title}</PerformanceTitle>
          </PerformanceHeader>
          <Settings>
            <StyledCheckbox
              checked={settings[key] ?? false}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleSettingChange(key, e.target.checked)
              }>
              Enable {title}
            </StyledCheckbox>
            <Description>{description}</Description>
            {hasLimit && settings[key] && (
              <ResourceLimitGroup>
                <ResourceLimit>
                  <ResourceLabel>{limitLabel}:</ResourceLabel>
                  <Slider
                    type="range"
                    min={limitMin}
                    max={limitMax}
                    step={limitStep}
                    value={resourceLimits[key] ?? defaultLimit}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleLimitChange(key, parseFloat(e.target.value))
                    }
                  />
                  <SliderLabel>{resourceLimits[key] ?? defaultLimit}</SliderLabel>
                </ResourceLimit>
              </ResourceLimitGroup>
            )}
          </Settings>
        </PerformanceGroup>
      ))}
    </PerformanceContainer>
  )
}

export default memo(PerformanceSettings)