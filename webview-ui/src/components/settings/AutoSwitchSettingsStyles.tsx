import styled from 'styled-components';
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";

export const AutoSwitchContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

export const TriggerGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  border: 1px solid var(--chat-bubble-border);
  border-radius: var(--radius);
  background-color: color-mix(in srgb, var(--roo-primary) 5%, var(--background));
`;

export const TriggerHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
`;

export const TriggerIcon = styled.span<{ $mode: string }>`
  color: ${props => {
    switch (props.$mode) {
      case 'frontend':
        return 'color-mix(in srgb, var(--foreground) 95%, var(--roo-primary))';
      case 'backend':
        return 'color-mix(in srgb, var(--foreground) 85%, var(--roo-primary))';
      case 'architect':
        return 'color-mix(in srgb, var(--foreground) 90%, var(--roo-primary))';
      case 'security':
        return 'color-mix(in srgb, var(--foreground) 90%, var(--destructive))';
      default:
        return 'var(--foreground)';
    }
  }};
  font-size: 16px;
`;

export const TriggerTitle = styled.span`
  font-weight: 500;
  font-size: 14px;
`;

export const TriggerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const TriggerItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const StyledTriggerInput = styled(VSCodeTextField)`
  flex-grow: 1;
  
  &::part(control) {
    border-color: var(--chat-bubble-border);
    
    &:focus {
      border-color: var(--roo-primary);
    }
  }
`;

export const SensitivitySlider = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 10px;
`;

export const SliderLabel = styled.span`
  font-size: 12px;
  color: var(--muted-foreground);
`;

export const Slider = styled.input`
  width: 100%;
  accent-color: var(--roo-primary);
  height: 2px;

  &::-webkit-slider-thumb {
    background: var(--roo-primary);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    height: 12px;
    width: 12px;
    margin-top: -5px;
  }

  &::-webkit-slider-thumb:hover {
    background: var(--roo-primary-light);
  }
`;