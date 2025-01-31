import styled from 'styled-components';
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";

export const StyledLink = styled.a`
  text-decoration: none;
  color: inherit;
  display: inline-block;
  
  &:hover {
    text-decoration: none;
  }
`;

export const StyledButton = styled(VSCodeButton)`
  &::part(control) {
    background-color: var(--roo-primary);
    
    &:hover {
      background-color: var(--roo-primary-light);
    }
  }

  &[appearance="secondary"]::part(control) {
    background-color: transparent;
    border: 1px solid var(--roo-primary);
    color: var(--roo-primary);
    
    &:hover {
      background-color: color-mix(in srgb, var(--roo-primary) 10%, transparent);
    }
  }
`;