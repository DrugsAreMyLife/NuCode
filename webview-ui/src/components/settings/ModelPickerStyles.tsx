import styled from 'styled-components';
import { VSCodeTextField, VSCodeLink } from "@vscode/webview-ui-toolkit/react";

export const MODEL_PICKER_Z_INDEX = 1_000;

export const ModelPickerContainer = styled.div`
  position: relative;
  width: 100%;
`;

export const ModelLabel = styled.label`
  font-weight: 500;
`;

export const StyledTextField = styled(VSCodeTextField)`
  width: 100%;
  position: relative;
  z-index: ${MODEL_PICKER_Z_INDEX};

  &::part(control) {
    border-color: var(--chat-bubble-border);
    
    &:focus {
      border-color: var(--roo-primary);
    }
  }
`;

export const ClearButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  cursor: pointer;
  color: var(--muted-foreground);
  
  &:hover {
    color: var(--foreground);
  }
`;

export const DropdownList = styled.div`
  position: absolute;
  top: calc(100% - 3px);
  left: 0;
  width: calc(100% - 2px);
  max-height: 200px;
  overflow-y: auto;
  background-color: var(--background);
  border: 1px solid var(--chat-bubble-border);
  z-index: ${MODEL_PICKER_Z_INDEX - 1};
  border-bottom-left-radius: var(--radius);
  border-bottom-right-radius: var(--radius);

  &::-webkit-scrollbar-thumb {
    background-color: var(--roo-primary);
    opacity: 0.5;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: var(--roo-primary-light);
  }
`;

export const DropdownItem = styled.div<{ isSelected: boolean }>`
  padding: 8px 12px;
  cursor: pointer;
  word-break: break-all;
  white-space: normal;
  transition: background-color 0.1s ease;

  background-color: ${({ isSelected }) => 
    isSelected ? 'color-mix(in srgb, var(--roo-primary) 10%, var(--background))' : 'inherit'};

  &:hover {
    background-color: color-mix(in srgb, var(--roo-primary) 10%, var(--background));
  }
`;

export const Description = styled.p`
  font-size: 12px;
  margin-top: 0;
  color: var(--muted-foreground);
  line-height: 1.4;
`;

export const StyledLink = styled(VSCodeLink)`
  display: inline;
  font-size: inherit;
  color: var(--roo-primary);
  
  &:hover {
    color: var(--roo-primary-light);
  }
`;

export const MarkdownContainer = styled.div`
  font-family: var(--font-family);
  font-size: 12px;
  color: var(--muted-foreground);

  p, li, ol, ul {
    line-height: 1.25;
    margin: 0;
  }

  ol, ul {
    padding-left: 1.5em;
    margin-left: 0;
  }

  p {
    white-space: pre-wrap;
  }

  a {
    text-decoration: none;
    color: var(--roo-primary);
    
    &:hover {
      text-decoration: underline;
      color: var(--roo-primary-light);
    }
  }
`;

export const TextContainer = styled.div<{ isExpanded: boolean }>`
  overflow-y: ${props => props.isExpanded ? 'auto' : 'hidden'};
  position: relative;
  word-break: break-word;
  overflow-wrap: anywhere;
`;

export const TextContent = styled.div<{ isExpanded: boolean }>`
  display: -webkit-box;
  -webkit-line-clamp: ${props => props.isExpanded ? 'unset' : 3};
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const GradientOverlay = styled.div`
  position: absolute;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
`;

export const Gradient = styled.div`
  width: 30px;
  height: 1.2em;
  background: linear-gradient(to right, transparent, var(--background));
`;

export const ExpandLink = styled(VSCodeLink)`
  font-size: inherit;
  padding: 0 0 0 3px;
  background-color: var(--background);
  color: var(--roo-primary);
  
  &:hover {
    color: var(--roo-primary-light);
  }
`;