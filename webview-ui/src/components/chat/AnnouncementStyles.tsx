import styled from 'styled-components';
import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react";

export const Container = styled.div`
  background-color: color-mix(in srgb, var(--roo-primary) 5%, var(--background));
  border-radius: var(--radius);
  padding: 12px 16px;
  margin: 5px 15px;
  position: relative;
  flex-shrink: 0;
  border: 1px solid var(--chat-bubble-border);
`;

export const CloseButton = styled(VSCodeButton)`
  position: absolute;
  top: 8px;
  right: 8px;

  &::part(control) {
    background-color: transparent;
    
    &:hover {
      background-color: color-mix(in srgb, var(--roo-primary) 10%, transparent);
    }
  }
`;

export const Title = styled.h2`
  margin: 0 0 8px;
  color: var(--foreground);
  font-size: 1.2em;
  font-weight: 600;

  .emoji {
    margin-right: 8px;
  }
`;

export const Paragraph = styled.p`
  margin: 5px 0;
  color: var(--foreground);
  line-height: 1.4;
`;

export const SubTitle = styled.h3`
  margin: 12px 0 8px;
  color: var(--foreground);
  font-size: 1.1em;
  font-weight: 500;
`;

export const List = styled.ul`
  margin: 4px 0 6px 20px;
  padding: 0;
  color: var(--foreground);

  li {
    margin-bottom: 4px;
    line-height: 1.4;

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

export const Icon = styled.span`
  font-size: 10px;
  color: var(--foreground);
  vertical-align: middle;
`;

export const StyledLink = styled(VSCodeLink)`
  display: inline;
  color: var(--roo-primary);
  text-decoration: none;
  
  &:hover {
    color: var(--roo-primary-light);
    text-decoration: underline;
  }
`;