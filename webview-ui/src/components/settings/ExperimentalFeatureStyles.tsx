import styled from 'styled-components';
import { VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react";

export const ExperimentalContainer = styled.div`
  margin-top: 10px;
  padding-left: 10px;
  border-left: 2px solid var(--roo-primary);
`;

export const FeatureHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

export const WarningIcon = styled.span`
  color: var(--destructive);
`;

export const StyledCheckbox = styled(VSCodeCheckbox)`
  &::part(control) {
    border-color: var(--roo-primary);
  }

  &::part(control):hover {
    background-color: color-mix(in srgb, var(--roo-primary) 10%, transparent);
  }

  &[checked]::part(control) {
    background-color: var(--roo-primary);
  }
`;

export const FeatureName = styled.span`
  font-weight: 500;
  color: var(--foreground);
`;

export const Description = styled.p`
  font-size: 12px;
  margin-bottom: 15px;
  color: var(--muted-foreground);
  line-height: 1.4;
`;