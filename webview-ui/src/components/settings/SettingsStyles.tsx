import styled from 'styled-components';
import { VSCodeButton, VSCodeCheckbox, VSCodeTextField } from "@vscode/webview-ui-toolkit/react";

export const SettingsContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 10px 0px 0px 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const SettingsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 17px;
  padding-right: 17px;
`;

export const SettingsContent = styled.div`
  flex-grow: 1;
  overflow-y: scroll;
  padding-right: 8px;
  display: flex;
  flex-direction: column;

  &::-webkit-scrollbar-thumb {
    background-color: var(--roo-primary);
    opacity: 0.5;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: var(--roo-primary-light);
  }
`;

export const Section = styled.div`
  margin-bottom: 40px;
`;

export const SectionTitle = styled.h3`
  color: var(--foreground);
  margin: 0 0 15px 0;
  font-weight: 600;
`;

export const Description = styled.p`
  font-size: 12px;
  margin-top: 5px;
  color: var(--muted-foreground);
`;

export const SettingGroup = styled.div`
  margin-bottom: 15px;
`;

export const SubSettingGroup = styled.div`
  margin-top: 10px;
  padding-left: 10px;
  border-left: 2px solid var(--roo-primary);
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

export const StyledButton = styled(VSCodeButton)`
  &::part(control) {
    background-color: var(--roo-primary);
    
    &:hover {
      background-color: var(--roo-primary-light);
    }
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

export const CommandTag = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: color-mix(in srgb, var(--roo-primary) 10%, var(--background));
  padding: 2px 6px;
  border-radius: var(--radius);
  border: 1px solid var(--chat-bubble-border);
  height: 24px;
`;

export const Slider = styled.input`
  flex-grow: 1;
  max-width: 80%;
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

export const SliderLabel = styled.span`
  min-width: 45px;
  text-align: right;
  line-height: 20px;
  padding-bottom: 2px;
`;

export const Footer = styled.div`
  text-align: center;
  color: var(--muted-foreground);
  font-size: 12px;
  line-height: 1.2;
  margin-top: auto;
  padding: 10px 8px 15px 0px;
`;

export const FooterLink = styled.a`
  color: var(--roo-primary);
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

export const Version = styled.p`
  font-style: italic;
  margin: 10px 0 0 0;
  padding: 0;
  margin-bottom: 100px;
  color: var(--muted-foreground);
`;