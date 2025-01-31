import styled from 'styled-components';
import { VSCodeButton, VSCodeTextField } from "@vscode/webview-ui-toolkit/react";

export const ModeCard = styled.div<{ $mode: string }>`
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
  border: 1px solid var(--chat-bubble-border);
  border-radius: var(--radius);
  padding: 12px;
  margin-bottom: 10px;
  transition: background-color 0.3s ease;

  &:hover {
    border-color: color-mix(in srgb, var(--roo-primary) 50%, var(--chat-bubble-border));
  }
`;

export const ModeHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
`;

export const ModeIcon = styled.span<{ $mode: string }>`
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

export const ModeName = styled.span`
  font-weight: 500;
  font-size: 14px;
`;

export const ModeDescription = styled.p`
  font-size: 12px;
  color: var(--muted-foreground);
  margin: 0 0 10px 0;
`;

export const ModeSettings = styled.div`
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

export const StyledModeTextField = styled(VSCodeTextField)`
  flex-grow: 1;
  
  &::part(control) {
    border-color: var(--chat-bubble-border);
    
    &:focus {
      border-color: var(--roo-primary);
    }
  }
`;

export const StyledModeButton = styled(VSCodeButton)`
  &::part(control) {
    background-color: var(--roo-primary);
    opacity: 0.8;
    
    &:hover {
      opacity: 1;
      background-color: var(--roo-primary);
    }
  }
`;