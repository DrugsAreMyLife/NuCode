import styled from 'styled-components';
import { VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react";

export const ContextAnalysisContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

export const AnalysisGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--chat-bubble-border);
  border-radius: var(--radius);
  background-color: color-mix(in srgb, var(--roo-primary) 5%, var(--background));
`;

export const AnalysisHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
`;

export const AnalysisIcon = styled.span`
  color: var(--foreground);
  font-size: 16px;
`;

export const AnalysisTitle = styled.span`
  font-weight: 500;
  font-size: 14px;
`;

export const AnalysisSettings = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
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

export const Description = styled.p`
  font-size: 12px;
  color: var(--muted-foreground);
  margin: 0;
  padding-left: 24px;
`;

export const ThresholdSlider = styled.div`
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