import styled from 'styled-components';

interface MessageContainerProps {
  isAssistant?: boolean;
}

interface ColorProps {
  color?: string;
}

export const ChatContainer = styled.div`
  padding: 10px 6px 10px 15px;
  position: relative;
`;

export const MessageContainer = styled.div<MessageContainerProps>`
  background-color: ${(props) => props.isAssistant ? 'var(--chat-bubble-assistant)' : 'var(--chat-bubble-user)'};
  border: 1px solid var(--chat-bubble-border);
  border-radius: var(--radius);
  padding: 12px;
  margin-bottom: 8px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${(props) => props.isAssistant 
      ? 'color-mix(in srgb, var(--roo-primary) 20%, var(--background))'
      : 'color-mix(in srgb, var(--roo-primary) 8%, var(--background))'};
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
`;

export const HeaderWithActions = styled(Header)`
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
`;

export const IconContainer = styled.div<ColorProps>`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.color || 'var(--foreground)'};
`;

export const Title = styled.span<ColorProps>`
  font-weight: bold;
  color: ${(props) => props.color || 'var(--foreground)'};
`;

export const Badge = styled.div`
  background-color: var(--roo-primary);
  color: var(--primary-foreground);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  opacity: 0.9;
`;

export const CodeContainer = styled.div`
  background-color: var(--vscode-textCodeBlock-background);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
`;

export const MarkdownContent = styled.div`
  word-break: break-word;
  overflow-wrap: anywhere;
  margin-bottom: -15px;
  margin-top: -15px;

  code {
    color: var(--roo-primary);
    background-color: color-mix(in srgb, var(--roo-primary) 10%, var(--background));
    padding: 2px 4px;
    border-radius: 3px;
  }

  pre code {
    color: inherit;
    background-color: transparent;
    padding: 0;
  }
`;

export const CopyButton = styled.button`
  height: 24px;
  border: none;
  background: var(--background);
  transition: background 0.2s ease-in-out;
  opacity: 0.7;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 1;
    background: var(--roo-primary);
    color: var(--primary-foreground);
  }
`;

export const ErrorMessage = styled.p`
  color: var(--destructive);
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: anywhere;
`;

export const SuccessMessage = styled.div`
  color: var(--roo-primary);
  padding-top: 10px;
`;

export const WarningContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: color-mix(in srgb, var(--roo-primary) 10%, var(--background));
  padding: 8px;
  border-radius: var(--radius);
  font-size: 12px;
  border: 1px solid var(--chat-bubble-border);
`;

export const WarningHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  color: var(--roo-primary);
  font-weight: 500;
`;

export const WarningIcon = styled.i`
  margin-right: 8px;
  font-size: 18px;
  color: var(--roo-primary);
`;