import styled from 'styled-components';
import { VSCodeButton, VSCodeTextField, VSCodeTextArea } from "@vscode/webview-ui-toolkit/react";

export const PromptsContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
`;

export const PromptsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 17px 10px 20px;
`;

export const PromptsContent = styled.div`
  flex: 1;
  overflow: auto;
  padding: 0 20px;

  &::-webkit-scrollbar-thumb {
    background-color: var(--roo-primary);
    opacity: 0.5;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: var(--roo-primary-light);
  }
`;

export const Section = styled.div`
  padding-bottom: 20px;
  border-bottom: 1px solid var(--chat-bubble-border);
  margin-bottom: 20px;
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

export const TabContainer = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 12px;
  overflow-x: auto;
  flex-wrap: nowrap;
  padding-bottom: 4px;
  padding-right: 20px;

  &::-webkit-scrollbar-thumb {
    background-color: var(--roo-primary);
    opacity: 0.5;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: var(--roo-primary-light);
  }
`;

export const TabButton = styled.button<{ isActive: boolean }>`
  padding: 4px 8px;
  border: none;
  background: ${props => props.isActive ? 'var(--roo-primary)' : 'none'};
  color: ${props => props.isActive ? 'var(--primary-foreground)' : 'var(--foreground)'};
  cursor: pointer;
  opacity: ${props => props.isActive ? 1 : 0.8};
  border-radius: var(--radius);
  font-weight: bold;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.isActive ? 'var(--roo-primary)' : 'color-mix(in srgb, var(--roo-primary) 10%, transparent)'};
    opacity: 1;
  }
`;

export const StyledSelect = styled.select`
  width: 100%;
  padding: 4px 8px;
  background-color: var(--background);
  color: var(--foreground);
  border: 1px solid var(--chat-bubble-border);
  border-radius: var(--radius);
  height: 28px;

  &:focus {
    border-color: var(--roo-primary);
    outline: none;
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

export const StyledTextArea = styled(VSCodeTextArea)`
  &::part(control) {
    border-color: var(--chat-bubble-border);
    
    &:focus {
      border-color: var(--roo-primary);
    }
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

export const Dialog = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: flex-end;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
`;

export const DialogContent = styled.div`
  width: calc(100vw - 100px);
  height: 100%;
  background-color: var(--background);
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  position: relative;
`;

export const DialogBody = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  min-height: 0;

  &::-webkit-scrollbar-thumb {
    background-color: var(--roo-primary);
    opacity: 0.5;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: var(--roo-primary-light);
  }
`;

export const DialogFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 12px 20px;
  gap: 8px;
  border-top: 1px solid var(--chat-bubble-border);
  background-color: var(--background);
`;

export const PreviewContent = styled.pre`
  padding: 8px;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: var(--vscode-editor-font-family);
  font-size: var(--vscode-editor-font-size);
  color: var(--foreground);
  background-color: color-mix(in srgb, var(--roo-primary) 5%, var(--background));
  border: 1px solid var(--chat-bubble-border);
  border-radius: var(--radius);
  overflow-y: auto;

  &::-webkit-scrollbar-thumb {
    background-color: var(--roo-primary);
    opacity: 0.5;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: var(--roo-primary-light);
  }
`;

export const Link = styled.span`
  color: var(--roo-primary);
  cursor: pointer;
  text-decoration: underline;
  
  &:hover {
    color: var(--roo-primary-light);
  }
`;

export const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px;
`;