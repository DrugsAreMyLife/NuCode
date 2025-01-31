import * as React from 'react'
import { ChangeEvent } from 'react'
import {
  ExperimentalContainer,
  FeatureHeader,
  WarningIcon,
  StyledCheckbox,
  FeatureName,
  Description
} from './ExperimentalFeatureStyles'

interface ExperimentalFeatureProps {
  name: string
  description: string
  enabled: boolean
  onChange: (value: boolean) => void
}

interface CheckboxEvent extends ChangeEvent<HTMLInputElement> {
  target: HTMLInputElement & {
    checked: boolean
  }
}

const ExperimentalFeature: React.FC<ExperimentalFeatureProps> = ({
  name,
  description,
  enabled,
  onChange
}: ExperimentalFeatureProps) => {
  const handleChange = (e: CheckboxEvent): void => {
    onChange(e.target.checked)
  }

  return (
    <ExperimentalContainer>
      <FeatureHeader>
        <WarningIcon>⚠️</WarningIcon>
        <StyledCheckbox 
          checked={enabled} 
          onChange={handleChange}
        >
          <FeatureName>{name}</FeatureName>
        </StyledCheckbox>
      </FeatureHeader>
      <Description>{description}</Description>
    </ExperimentalContainer>
  )
}

ExperimentalFeature.displayName = 'ExperimentalFeature'

export default ExperimentalFeature
