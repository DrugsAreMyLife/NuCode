import styled from 'styled-components';
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";

export const TaskContainer = styled.div`
  padding: 10px 13px 10px 13px;
`;

export const TaskCard = styled.div<{ $mode?: string }>`
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
  color: var(--foreground);
  border-radius: var(--radius);
  padding: 9px 10px 9px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
  z-index: 1;
  border: 1px solid var(--chat-bubble-border);
  transition: background-color 0.3s ease;
`;

export const TaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const TaskTitleContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-left: -2px;
  user-select: none;
  flex-grow: 1;
  min-width: 0;
`;

export const TaskTitle = styled.div<{ $mode?: string }>`
  margin-left: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
  min-width: 0;
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
  transition: color 0.3s ease;
`;

export const CostBadge = styled.div`
  margin-left: 10px;
  background-color: var(--roo-primary);
  color: var(--primary-foreground);
  padding: 2px 4px;
  border-radius: 500px;
  font-size: 11px;
  font-weight: 500;
  display: inline-block;
  flex-shrink: 0;
`;

export const TaskContent = styled.div<{ isExpanded: boolean }>`
  margin-top: -2px;
  font-size: var(--vscode-font-size);
  overflow-y: ${props => props.isExpanded ? 'auto' : 'hidden'};
  word-break: break-word;
  overflow-wrap: anywhere;
  position: relative;

  &::-webkit-scrollbar-thumb {
    background-color: var(--roo-primary);
    opacity: 0.5;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: var(--roo-primary-light);
  }
`;

export const TaskText = styled.div<{ isExpanded: boolean }>`
  display: -webkit-box;
  -webkit-line-clamp: ${props => props.isExpanded ? 'unset' : 3};
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: anywhere;
`;

export const SeeMoreGradient = styled.div`
  width: 30px;
  height: 1.2em;
  background: linear-gradient(to right, transparent, var(--background));
`;

export const SeeMoreButton = styled.div`
  cursor: pointer;
  color: var(--roo-primary);
  padding-right: 0;
  padding-left: 3px;
  background-color: var(--background);

  &:hover {
    text-decoration: underline;
  }
`;

export const MetricsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const MetricsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const MetricsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
`;

export const MetricsLabel = styled.span<{ $mode?: string }>`
  font-weight: bold;
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
  transition: color 0.3s ease;
`;

export const MetricsValue = styled.span`
  display: flex;
  align-items: center;
  gap: 3px;
`;

export const StyledExportButton = styled(VSCodeButton)`
  &::part(control) {
    background-color: var(--roo-primary);
    opacity: 0.8;
    
    &:hover {
      opacity: 1;
      background-color: var(--roo-primary);
    }
  }
`;

export const ExportButtonText = styled.div`
  font-size: 10.5px;
  font-weight: bold;
  opacity: 0.6;
`;