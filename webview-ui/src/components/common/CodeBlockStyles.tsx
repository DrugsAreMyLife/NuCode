import styled from 'styled-components';

export const CodeBlockContainer = styled.div<{ forceWrap: boolean }>`
  overflow-y: ${props => props.forceWrap ? 'visible' : 'auto'};
  max-height: ${props => props.forceWrap ? 'none' : '100%'};
  background-color: var(--background);
  border: 1px solid var(--chat-bubble-border);
  border-radius: var(--radius);
`;

export const StyledMarkdown = styled.div<{ forceWrap: boolean }>`
  ${({ forceWrap }) =>
    forceWrap &&
    `
    pre, code {
      white-space: pre-wrap;
      word-break: break-all;
      overflow-wrap: anywhere;
    }
  `}

  pre {
    background-color: color-mix(in srgb, var(--roo-primary) 5%, var(--background));
    border-radius: var(--radius);
    margin: 0;
    min-width: ${({ forceWrap }) => (forceWrap ? 'auto' : 'max-content')};
    padding: 12px;
    border: 1px solid var(--chat-bubble-border);
  }

  pre > code {
    .hljs-deletion {
      background-color: color-mix(in srgb, var(--destructive) 20%, transparent);
      display: inline-block;
      width: 100%;
      border-radius: 2px;
    }
    
    .hljs-addition {
      background-color: color-mix(in srgb, var(--roo-primary) 20%, transparent);
      display: inline-block;
      width: 100%;
      border-radius: 2px;
    }
  }

  code {
    span.line:empty {
      display: none;
    }
    word-wrap: break-word;
    border-radius: var(--radius);
    background-color: color-mix(in srgb, var(--roo-primary) 5%, var(--background));
    font-size: var(--vscode-editor-font-size, var(--vscode-font-size, 12px));
    font-family: var(--vscode-editor-font-family);
    padding: 2px 4px;
  }

  code:not(pre > code) {
    font-family: var(--vscode-editor-font-family);
    color: var(--roo-primary);
  }

  background-color: var(--background);
  font-family:
    var(--vscode-font-family),
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    'Open Sans',
    'Helvetica Neue',
    sans-serif;
  font-size: var(--vscode-editor-font-size, var(--vscode-font-size, 12px));
  color: var(--foreground);

  p,
  li,
  ol,
  ul {
    line-height: 1.5;
  }
`;

export const StyledPre = styled.pre<{ theme: any }>`
  & .hljs {
    color: var(--foreground);
  }

  & .hljs-keyword,
  & .hljs-selector-tag,
  & .hljs-title,
  & .hljs-section,
  & .hljs-doctag,
  & .hljs-name,
  & .hljs-strong {
    color: var(--roo-primary);
    font-weight: bold;
  }

  & .hljs-comment {
    color: color-mix(in srgb, var(--foreground) 60%, transparent);
    font-style: italic;
  }

  & .hljs-string,
  & .hljs-regexp,
  & .hljs-symbol,
  & .hljs-bullet,
  & .hljs-link {
    color: color-mix(in srgb, var(--roo-primary) 80%, var(--foreground));
  }

  & .hljs-number,
  & .hljs-meta,
  & .hljs-built_in,
  & .hljs-builtin-name,
  & .hljs-literal,
  & .hljs-type,
  & .hljs-params {
    color: color-mix(in srgb, var(--roo-primary) 70%, var(--foreground));
  }

  & .hljs-attribute,
  & .hljs-subst,
  & .hljs-formula {
    color: color-mix(in srgb, var(--roo-primary) 60%, var(--foreground));
  }

  & .hljs-variable,
  & .hljs-template-variable {
    color: color-mix(in srgb, var(--roo-primary) 50%, var(--foreground));
  }

  & .hljs-addition {
    background-color: color-mix(in srgb, var(--roo-primary) 20%, transparent);
  }

  & .hljs-deletion {
    background-color: color-mix(in srgb, var(--destructive) 20%, transparent);
  }

  & .hljs-emphasis {
    font-style: italic;
  }

  & .hljs-strong {
    font-weight: bold;
  }

  ${(props) =>
    Object.keys(props.theme)
      .map((key) => {
        return `
        & ${key} {
          color: ${props.theme[key]};
        }
      `
      })
      .join('')}
`;