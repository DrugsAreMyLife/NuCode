import React, { useEffect, useRef } from "react"
import styled from "styled-components"
import MarkdownBlock from "../common/MarkdownBlock"

interface ReasoningBlockProps {
  content: string
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  autoHeight?: boolean
}

interface ReasoningHeaderProps {
  isCollapsed: boolean
}

interface ReasoningContentProps {
  autoHeight: boolean
}

const ReasoningContainer = styled.div`
  background-color: color-mix(in srgb, var(--roo-primary) 5%, var(--background));
  border: 1px solid var(--chat-bubble-border);
  border-radius: var(--radius);
  overflow: hidden;
`;

const ReasoningHeader = styled.div<ReasoningHeaderProps>`
  padding: 8px 12px;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: ${(props: ReasoningHeaderProps) => props.isCollapsed ? 'none' : '1px solid var(--chat-bubble-border)'};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: color-mix(in srgb, var(--roo-primary) 10%, var(--background));
  }
`;

const ReasoningTitle = styled.span`
  font-weight: bold;
  color: var(--roo-primary);
`;

const ReasoningContent = styled.div<ReasoningContentProps>`
  padding: 8px 12px;
  max-height: ${(props: ReasoningContentProps) => props.autoHeight ? 'none' : '160px'};
  overflow-y: auto;

  &::-webkit-scrollbar-thumb {
    background-color: var(--roo-primary);
    opacity: 0.5;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: var(--roo-primary-light);
  }
`;

const ReasoningText = styled.div`
  font-size: 13px;
  opacity: 0.9;
  color: var(--foreground);

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

const ReasoningBlock: React.FC<ReasoningBlockProps> = ({
  content,
  isCollapsed = false,
  onToggleCollapse,
  autoHeight = false,
}: ReasoningBlockProps) => {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (contentRef.current && !isCollapsed) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight
    }
  }, [content, isCollapsed])

  return (
    <ReasoningContainer>
      <ReasoningHeader isCollapsed={isCollapsed} onClick={onToggleCollapse}>
        <ReasoningTitle>Reasoning</ReasoningTitle>
        <span className={`codicon codicon-chevron-${isCollapsed ? "right" : "down"}`}></span>
      </ReasoningHeader>
      {!isCollapsed && (
        <ReasoningContent ref={contentRef} autoHeight={autoHeight}>
          <ReasoningText>
            <MarkdownBlock markdown={content} />
          </ReasoningText>
        </ReasoningContent>
      )}
    </ReasoningContainer>
  )
}

export default ReasoningBlock
