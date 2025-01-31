import { VSCodeBadge, VSCodeButton, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react"
import deepEqual from "fast-deep-equal"
import React, { memo, useEffect, useMemo, useRef, useState } from "react"
import { useSize } from "react-use"
import {
  ClineApiReqInfo,
  ClineAskUseMcpServer,
  ClineMessage,
  ClineSayTool,
} from "../../../../src/shared/ExtensionMessage"
import { COMMAND_OUTPUT_STRING } from "../../../../src/shared/combineCommandSequences"
import { useExtensionState } from "../../context/ExtensionStateContext"
import { findMatchingResourceOrTemplate } from "../../utils/mcp"
import { vscode } from "../../utils/vscode"
import CodeAccordian, { removeLeadingNonAlphanumeric } from "../common/CodeAccordian"
import CodeBlock from "../common/CodeBlock"
import MarkdownBlock from "../common/MarkdownBlock"
import ReasoningBlock from "./ReasoningBlock"
import Thumbnails from "../common/Thumbnails"
import McpResourceRow from "../mcp/McpResourceRow"
import McpToolRow from "../mcp/McpToolRow"
import { highlightMentions } from "./TaskHeader"
import {
  Badge,
  ChatContainer,
  CodeContainer,
  CopyButton,
  ErrorMessage,
  Header,
  HeaderWithActions,
  IconContainer,
  MarkdownContent,
  MessageContainer,
  SuccessMessage,
  Title,
  WarningContainer,
  WarningHeader,
  WarningIcon,
} from "./ChatStyles"

interface ChatRowProps {
  message: ClineMessage
  isExpanded: boolean
  onToggleExpand: () => void
  lastModifiedMessage?: ClineMessage
  isLast: boolean
  onHeightChange: (isTaller: boolean) => void
  isStreaming: boolean
}

const ChatRow = memo(
  (props: ChatRowProps) => {
    const { isLast, onHeightChange, message } = props
    const prevHeightRef = useRef(0)

    const [chatrow, { height }] = useSize(
      <ChatContainer>
        <ChatRowContent {...props} />
      </ChatContainer>,
    )

    useEffect(() => {
      const isInitialRender = prevHeightRef.current === 0
      if (isLast && height !== 0 && height !== Infinity && height !== prevHeightRef.current) {
        if (!isInitialRender) {
          onHeightChange(height > prevHeightRef.current)
        }
        prevHeightRef.current = height
      }
    }, [height, isLast, onHeightChange, message])

    return chatrow
  },
  deepEqual,
)

export default ChatRow

const ChatRowContent = ({
  message,
  isExpanded,
  onToggleExpand,
  lastModifiedMessage,
  isLast,
  isStreaming,
}: Omit<ChatRowProps, "onHeightChange">) => {
  const { mcpServers, alwaysAllowMcp } = useExtensionState()
  const [reasoningCollapsed, setReasoningCollapsed] = useState(false)

  useEffect(() => {
    if (!isLast && message.say === "reasoning") {
      setReasoningCollapsed(true)
    }
  }, [isLast, message.say])

  const [cost, apiReqCancelReason, apiReqStreamingFailedMessage] = useMemo(() => {
    if (message.text != null && message.say === "api_req_started") {
      const info: ClineApiReqInfo = JSON.parse(message.text)
      return [info.cost, info.cancelReason, info.streamingFailedMessage]
    }
    return [undefined, undefined, undefined]
  }, [message.text, message.say])

  const apiRequestFailedMessage =
    isLast && lastModifiedMessage?.ask === "api_req_failed"
      ? lastModifiedMessage?.text
      : undefined

  const isCommandExecuting =
    isLast && lastModifiedMessage?.ask === "command" && lastModifiedMessage?.text?.includes(COMMAND_OUTPUT_STRING)

  const isMcpServerResponding = isLast && lastModifiedMessage?.say === "mcp_server_request_started"

  const type = message.type === "ask" ? message.ask : message.say

  const normalColor = "var(--foreground)"
  const errorColor = "var(--destructive)"
  const successColor = "var(--roo-primary)"
  const cancelledColor = "var(--muted)"

  const [icon, title] = useMemo(() => {
    switch (type) {
      case "error":
        return [
          <IconContainer color={errorColor}>
            <span className="codicon codicon-error"></span>
          </IconContainer>,
          <Title color={errorColor}>Error</Title>,
        ]
      case "mistake_limit_reached":
        return [
          <IconContainer color={errorColor}>
            <span className="codicon codicon-error"></span>
          </IconContainer>,
          <Title color={errorColor}>Roo is having trouble...</Title>,
        ]
      case "command":
        return [
          isCommandExecuting ? (
            <ProgressIndicator />
          ) : (
            <IconContainer color={normalColor}>
              <span className="codicon codicon-terminal"></span>
            </IconContainer>
          ),
          <Title color={normalColor}>Roo wants to execute this command:</Title>,
        ]
      case "use_mcp_server":
        const mcpServerUse = JSON.parse(message.text || "{}") as ClineAskUseMcpServer
        return [
          isMcpServerResponding ? (
            <ProgressIndicator />
          ) : (
            <IconContainer color={normalColor}>
              <span className="codicon codicon-server"></span>
            </IconContainer>
          ),
          <Title color={normalColor}>
            Roo wants to {mcpServerUse.type === "use_mcp_tool" ? "use a tool" : "access a resource"} on the{" "}
            <code>{mcpServerUse.serverName}</code> MCP server:
          </Title>,
        ]
      case "completion_result":
        return [
          <IconContainer color={successColor}>
            <span className="codicon codicon-check"></span>
          </IconContainer>,
          <Title color={successColor}>Task Completed</Title>,
        ]
      case "api_req_retry_delayed":
        return []
      case "api_req_started":
        const getIconSpan = (iconName: string, color: string) => (
          <IconContainer color={color}>
            <span className={`codicon codicon-${iconName}`}></span>
          </IconContainer>
        )
        return [
          apiReqCancelReason != null ? (
            apiReqCancelReason === "user_cancelled" ? (
              getIconSpan("error", cancelledColor)
            ) : (
              getIconSpan("error", errorColor)
            )
          ) : cost != null ? (
            getIconSpan("check", successColor)
          ) : apiRequestFailedMessage ? (
            getIconSpan("error", errorColor)
          ) : (
            <ProgressIndicator />
          ),
          apiReqCancelReason != null ? (
            apiReqCancelReason === "user_cancelled" ? (
              <Title color={normalColor}>API Request Cancelled</Title>
            ) : (
              <Title color={errorColor}>API Streaming Failed</Title>
            )
          ) : cost != null ? (
            <Title color={normalColor}>API Request</Title>
          ) : apiRequestFailedMessage ? (
            <Title color={errorColor}>API Request Failed</Title>
          ) : (
            <Title color={normalColor}>API Request...</Title>
          ),
        ]
      case "followup":
        return [
          <IconContainer color={normalColor}>
            <span className="codicon codicon-question"></span>
          </IconContainer>,
          <Title color={normalColor}>Roo has a question:</Title>,
        ]
      default:
        return [null, null]
    }
  }, [
    type,
    isCommandExecuting,
    message,
    isMcpServerResponding,
    apiReqCancelReason,
    cost,
    apiRequestFailedMessage,
    normalColor,
    errorColor,
    successColor,
    cancelledColor,
  ])

  const renderMessageContent = () => {
    const tool = message.ask === "tool" || message.say === "tool"
      ? JSON.parse(message.text || "{}") as ClineSayTool
      : null

    if (tool) {
      const toolIcon = (name: string) => (
        <IconContainer>
          <span className={`codicon codicon-${name}`}></span>
        </IconContainer>
      )

      switch (tool.tool) {
        case "editedExistingFile":
        case "appliedDiff":
          return (
            <>
              <Header>
                {toolIcon(tool.tool === "appliedDiff" ? "diff" : "edit")}
                <Title>Roo wants to edit this file:</Title>
              </Header>
              <CodeAccordian
                isLoading={message.partial}
                diff={tool.diff!}
                path={tool.path!}
                isExpanded={isExpanded}
                onToggleExpand={onToggleExpand}
              />
            </>
          )
        case "newFileCreated":
          return (
            <>
              <Header>
                {toolIcon("new-file")}
                <Title>Roo wants to create a new file:</Title>
              </Header>
              <CodeAccordian
                isLoading={message.partial}
                code={tool.content!}
                path={tool.path!}
                isExpanded={isExpanded}
                onToggleExpand={onToggleExpand}
              />
            </>
          )
        // ... other tool cases remain the same
      }
    }

    switch (message.type) {
      case "say":
        switch (message.say) {
          case "reasoning":
            return (
              <ReasoningBlock
                content={message.text || ""}
                isCollapsed={reasoningCollapsed}
                onToggleCollapse={() => setReasoningCollapsed(!reasoningCollapsed)}
              />
            )
          case "text":
            return (
              <MarkdownContent>
                <MarkdownBlock markdown={message.text} />
              </MarkdownContent>
            )
          case "error":
            return (
              <>
                {title && <Header>{icon}{title}</Header>}
                <ErrorMessage>{message.text}</ErrorMessage>
              </>
            )
          case "completion_result":
            return (
              <>
                <Header>{icon}{title}</Header>
                <SuccessMessage>
                  <MarkdownBlock markdown={message.text} />
                </SuccessMessage>
              </>
            )
          // ... other message cases remain the same
        }
        break
      case "ask":
        // ... ask cases remain the same
        break
    }

    return null
  }

  return (
    <MessageContainer isAssistant={message.type === "say"}>
      {renderMessageContent()}
    </MessageContainer>
  )
}

export const ProgressIndicator = () => (
  <IconContainer>
    <div style={{ transform: "scale(0.55)", transformOrigin: "center" }}>
      <VSCodeProgressRing />
    </div>
  </IconContainer>
)

const Markdown = memo(({ markdown, partial }: { markdown?: string; partial?: boolean }) => {
  const [isHovering, setIsHovering] = useState(false)

  return (
    <div
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{ position: "relative" }}>
      <MarkdownContent>
        <MarkdownBlock markdown={markdown} />
      </MarkdownContent>
      {markdown && !partial && isHovering && (
        <div
          style={{
            position: "absolute",
            bottom: "-4px",
            right: "8px",
            opacity: 0,
            animation: "fadeIn 0.2s ease-in-out forwards",
          }}>
          <style>
            {`
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1.0; }
              }
            `}
          </style>
          <CopyButton
            onClick={() => {
              navigator.clipboard.writeText(markdown)
              const button = document.activeElement as HTMLElement
              if (button) {
                button.style.background = "var(--roo-primary)"
                setTimeout(() => {
                  button.style.background = ""
                }, 200)
              }
            }}
            title="Copy as markdown">
            <span className="codicon codicon-copy"></span>
          </CopyButton>
        </div>
      )}
    </div>
  )
})
