import styled from 'styled-components';
import { VSCodeButton, VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { Dropdown } from "vscrui";

export const Container = styled.div`
  margin-bottom: 5px;
`;

export const ConfigWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const Label = styled.label`
  span {
    font-weight: 500;
  }
`;

export const EditContainer = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

export const StyledTextField = styled(VSCodeTextField)`
  flex-grow: 1;

  &::part(control) {
    border-color: var(--chat-bubble-border);
    
    &:focus {
      border-color: var(--roo-primary);
    }
  }
`;

export const IconButton = styled(VSCodeButton)`
  padding: 0;
  margin: 0;
  height: 28px;
  width: 28px;
  min-width: 28px;

  &::part(control) {
    background-color: transparent;
    
    &:hover {
      background-color: color-mix(in srgb, var(--roo-primary) 10%, transparent);
    }
  }

  &[disabled]::part(control) {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .codicon {
    color: var(--foreground);
  }

  &:hover .codicon {
    color: var(--roo-primary);
  }
`;

export const StyledDropdown = styled(Dropdown)`
  min-width: 130px;
  z-index: 1002;

  &::part(control) {
    border-color: var(--chat-bubble-border);
    
    &:focus {
      border-color: var(--roo-primary);
    }
  }

  &::part(listbox) {
    border-color: var(--chat-bubble-border);
    background-color: var(--background);
  }

  &::part(option) {
    &:hover {
      background-color: color-mix(in srgb, var(--roo-primary) 10%, transparent);
    }

    &[selected] {
      background-color: color-mix(in srgb, var(--roo-primary) 20%, transparent);
    }
  }
`;

export const Description = styled.p`
  font-size: 12px;
  margin: 5px 0 12px;
  color: var(--muted-foreground);
  line-height: 1.4;
`;