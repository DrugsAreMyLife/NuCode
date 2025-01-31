import styled from 'styled-components';
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";

export const ModelSelectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

export const ModelGroup = styled.div<{ $mode: string }>`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--chat-bubble-border);
  border-radius: var(--radius);
  background-color: ${props => {
    switch (props.$mode) {
      case 'code':
        return 'color-mix(in srgb, var(--roo-primary) 15%, var(--background))';
      case 'architect':
        return 'color-mix(in srgb, var(--roo-primary) 10%, var(--background))';
      case 'frontend':
        return 'color-mix(in srgb, var(--roo-primary) 20%, var(--background))';
      case 'backend':
        return 'color-mix(in srgb, var(--roo-primary) 12%, var(--background))';
      case 'security':
        return 'color-mix(in srgb, var(--destructive) 8%, var(--background))';
      case 'devops':
        return 'color-mix(in srgb, var(--roo-primary) 5%, var(--background))';
      default:
        return 'color-mix(in srgb, var(--roo-primary) 15%, var(--background))';
    }
  }};
  transition: background-color 0.3s ease;
`;

export const ModelHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
`;

export const ModelIcon = styled.span<{ $mode: string }>`
  color: ${props => {
    switch (props.$mode) {
      case 'code':
        return 'var(--foreground)';
      case 'architect':
        return 'color-mix(in srgb, var(--foreground) 90%, var(--roo-primary))';
      case 'frontend':
        return 'color-mix(in srgb, var(--foreground) 95%, var(--roo-primary))';
      case 'backend':
        return 'color-mix(in srgb, var(--foreground) 85%, var(--roo-primary))';
      case 'security':
        return 'color-mix(in srgb, var(--foreground) 90%, var(--destructive))';
      case 'devops':
        return 'color-mix(in srgb, var(--foreground) 80%, var(--roo-primary))';
      default:
        return 'var(--foreground)';
    }
  }};
  font-size: 16px;
`;

export const ModelTitle = styled.span`
  font-weight: 500;
  font-size: 14px;
`;

export const ModelSettings = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const SettingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const SettingLabel = styled.span`
  font-size: 12px;
  min-width: 120px;
`;

export const StyledModelTextField = styled(VSCodeTextField)`
  flex-grow: 1;
  
  &::part(control) {
    border-color: var(--chat-bubble-border);
    
    &:focus {
      border-color: var(--roo-primary);
    }
  }
`;

export const ThresholdSlider = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
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