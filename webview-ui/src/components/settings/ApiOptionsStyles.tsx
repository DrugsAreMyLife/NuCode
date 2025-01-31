import styled from 'styled-components';
import { VSCodeTextField, VSCodeRadioGroup, VSCodeRadio } from "@vscode/webview-ui-toolkit/react";

export const ApiOptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

interface ProviderDropdownProps {
  zIndex?: number;
}

export const ProviderDropdown = styled.div<ProviderDropdownProps>`
  .dropdown-container {
    position: relative;
    z-index: ${props => props.zIndex || 'auto'};
  }
`;

export const StyledTextField = styled(VSCodeTextField)`
  &::part(control) {
    border-color: var(--chat-bubble-border);
    
    &:focus {
      border-color: var(--roo-primary);
    }
  }
`;

export const StyledRadioGroup = styled(VSCodeRadioGroup)`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const StyledRadio = styled(VSCodeRadio)`
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
  margin-top: 5px;
  color: var(--muted-foreground);
`;

export const ErrorMessage = styled.p`
  margin: -10px 0 4px 0;
  font-size: 12px;
  color: var(--destructive);
`;

export const ModelConfigSection = styled.div`
  margin-top: 15px;
  padding: 15px;
  background-color: var(--background);
`;

export const ModelConfigTitle = styled.span`
  font-weight: 500;
  font-size: 12px;
  display: block;
  margin-bottom: 12px;
  color: var(--foreground);
`;

export const CapabilitiesSection = styled.div`
  margin-bottom: 20px;
  padding: 12px;
  background-color: color-mix(in srgb, var(--roo-primary) 5%, var(--background));
  border-radius: var(--radius);
  border: 1px solid var(--chat-bubble-border);
`;

export const TokenConfigField = styled.div`
  .token-config-field {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
`;

export const InfoIcon = styled.i`
  font-size: 12px;
  color: var(--muted-foreground);
  cursor: help;
`;

export const FeatureToggle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 12px;
  border-top: 1px solid var(--chat-bubble-border);

  &:first-child {
    padding-top: 0;
    border-top: none;
  }
`;

export const PricingSection = styled.div`
  background-color: color-mix(in srgb, var(--roo-primary) 5%, var(--background));
  padding: 12px;
  border-radius: var(--radius);
  border: 1px solid var(--chat-bubble-border);
  margin-top: 15px;
`;

export const PricingGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  background-color: var(--background);
  padding: 12px;
  border-radius: var(--radius);
`;

export const Link = styled.span`
  color: var(--roo-primary);
  cursor: pointer;
  text-decoration: underline;
  
  &:hover {
    color: var(--roo-primary-light);
  }
`;