import styled from 'styled-components';
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { CSSProperties } from 'react';

export const CODE_BLOCK_BG_COLOR = 'var(--background)';

export const Container = styled.div`
  padding: 10px 6px 10px 15px;
  margin-bottom: -10px;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
`;

export const HeaderIcon = styled.span`
  color: var(--foreground);
  margin-bottom: -1.5px;
`;

export const HeaderText = styled.span`
  font-weight: bold;
`;

export const BrowserWindow = styled.div`
  border-radius: var(--radius);
  border: 1px solid var(--chat-bubble-border);
  overflow: hidden;
  background-color: var(--chat-bubble-assistant);
  margin-bottom: 10px;
`;

interface URLBarProps {
  $hasUrl: boolean;
}

export const URLBar = styled.div<URLBarProps>`
  margin: 5px auto;
  width: calc(100% - 10px);
  box-sizing: border-box;
  background-color: var(--input);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 3px 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$hasUrl ? 'var(--foreground)' : 'var(--muted-foreground)'};
  font-size: 12px;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: var(--ring);
  }
`;

export const URLText = styled.div`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  width: 100%;
  text-align: center;
`;

interface ScreenshotContainerProps {
  $aspectRatio: string;
}

export const ScreenshotContainer = styled.div<ScreenshotContainerProps>`
  width: 100%;
  padding-bottom: ${props => props.$aspectRatio};
  position: relative;
  background-color: var(--input);
  transition: background-color 0.2s ease;

  &:hover {
    background-color: color-mix(in srgb, var(--input) 90%, var(--roo-primary));
  }
`;

export const Screenshot = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    opacity: 0.8;
  }
`;

export const EmptyScreenshot = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  .codicon {
    font-size: 80px;
    color: var(--muted-foreground);
    transition: color 0.2s ease, transform 0.2s ease;
  }

  &:hover .codicon {
    color: var(--foreground);
    transform: scale(1.05);
  }
`;

export const ConsoleLogs = styled.div`
  width: 100%;
`;

interface ConsoleHeaderProps {
  $expanded: boolean;
}

export const ConsoleHeader = styled.div<ConsoleHeaderProps>`
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  justify-content: flex-start;
  cursor: pointer;
  padding: 9px 8px ${props => props.$expanded ? 0 : 8}px 8px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: color-mix(in srgb, var(--roo-primary) 5%, transparent);
  }

  .codicon {
    color: var(--muted-foreground);
    transition: color 0.2s ease;
  }

  &:hover .codicon {
    color: var(--foreground);
  }
`;

export const ConsoleText = styled.span`
  font-size: 0.8em;
`;

interface ActionContentProps {
  $minHeight: number;
}

export const ActionContent = styled.div<ActionContentProps>`
  min-height: ${props => props.$minHeight}px;
`;

export const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0px;
  margin-top: 15px;
  border-top: 1px solid var(--chat-bubble-border);
`;

export const PaginationButtons = styled.div`
  display: flex;
  gap: 4px;
`;

export const StyledButton = styled(VSCodeButton)`
  &::part(control) {
    background-color: var(--primary);
    color: var(--primary-foreground);
    transition: background-color 0.2s ease;
    
    &:hover {
      background-color: var(--primary-hover);
    }

    &:active {
      background-color: var(--primary-active);
    }

    &[disabled] {
      opacity: 0.5;
      cursor: not-allowed;
      background-color: var(--muted);
      color: var(--muted-foreground);
    }
  }
`;

// BrowserActionBox Styles
export const ActionBox = styled.div`
  padding: 10px 0 0 0;
`;

export const ActionBoxContent = styled.div`
  border-radius: var(--radius);
  background-color: var(--chat-bubble-assistant);
  overflow: hidden;
  border: 1px solid var(--chat-bubble-border);
  transition: border-color 0.2s ease;

  &:hover {
    border-color: color-mix(in srgb, var(--roo-primary) 50%, var(--chat-bubble-border));
  }
`;

export const ActionBoxHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 9px 10px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: color-mix(in srgb, var(--roo-primary) 5%, transparent);
  }
`;

export const ActionBoxText = styled.span`
  white-space: normal;
  word-break: break-word;

  span {
    font-weight: 500;
  }
`;

// BrowserCursor Styles
interface CursorProps {
  $cursorStyle?: CSSProperties;
}

export const Cursor = styled.img<CursorProps>`
  width: 17px;
  height: 22px;
  position: absolute;
  transition: top 0.3s ease-out, left 0.3s ease-out;
  ${props => props.$cursorStyle && { ...props.$cursorStyle }}
`;