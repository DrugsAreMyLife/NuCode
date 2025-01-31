import * as React from "react"
import { memo, useEffect, useMemo, useRef, useState, useCallback } from "react"
import { useWindowSize } from "react-use"
import { ClineMessage } from "../../../../src/shared/ExtensionMessage"
import { useExtensionState } from "../../context/ExtensionStateContext"
import { vscode } from "../../utils/vscode"
import Thumbnails from "../common/Thumbnails"
import ModeIndicator from "../common/ModeIndicator"
import { mentionRegexGlobal } from "../../../../src/shared/context-mentions"
import { formatLargeNumber } from "../../utils/format"
import { normalizeApiConfiguration } from "../settings/ApiOptions"
import type { ApiProvider } from "../../../../src/shared/api"
import {
  TaskContainer,
  TaskCard,
  TaskHeader as StyledTaskHeader,
  TaskTitleContainer,
  TaskTitle,
  CostBadge,
  TaskContent,
  TaskText,
  SeeMoreGradient,
  SeeMoreButton,
  MetricsContainer,
  MetricsRow,
  MetricsGroup,
  MetricsLabel,
  MetricsValue,
  StyledExportButton,
  ExportButtonText,
} from "./TaskHeaderStyles"

interface TaskHeaderProps {
  task: ClineMessage
  tokensIn: number
  tokensOut: number
  doesModelSupportPromptCache: boolean
  cacheWrites?: number
  cacheReads?: number
  totalCost: number
  contextTokens: number
  onClose: () => void
}

interface ApiConfiguration {
  apiProvider?: ApiProvider
  id?: string
}

interface ModelInfo {
  contextWindow?: number
  supportsPromptCache?: boolean
}

interface NormalizedApiConfig {
  selectedModelInfo: ModelInfo
}

const TaskHeader: React.FC<TaskHeaderProps> = ({
  task,
  tokensIn,
  tokensOut,
  doesModelSupportPromptCache,
  cacheWrites,
  cacheReads,
  totalCost,
  contextTokens,
  onClose,
}) => {
  const { apiConfiguration, mode: currentMode } = useExtensionState()
  const { selectedModelInfo } = useMemo<NormalizedApiConfig>(
    () => normalizeApiConfiguration(apiConfiguration),
    [apiConfiguration]
  )
  const [isTaskExpanded, setIsTaskExpanded] = useState<boolean>(true)
  const [isTextExpanded, setIsTextExpanded] = useState<boolean>(false)
  const [showSeeMore, setShowSeeMore] = useState<boolean>(false)
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false)
  const [prevMode, setPrevMode] = useState(currentMode)

  useEffect(() => {
    if (prevMode !== currentMode) {
      setIsTransitioning(true)
      const timer = setTimeout(() => setIsTransitioning(false), 500)
      setPrevMode(currentMode)
      return () => clearTimeout(timer)
    }
  }, [currentMode, prevMode])
  const textContainerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const contextWindow = selectedModelInfo?.contextWindow || 1
  const contextPercentage = Math.round((contextTokens / contextWindow) * 100)

  const { height: windowHeight, width: windowWidth } = useWindowSize()

  useEffect(() => {
    if (isTextExpanded && textContainerRef.current) {
      const maxHeight = windowHeight * (1 / 2)
      textContainerRef.current.style.maxHeight = `${maxHeight}px`
    }
  }, [isTextExpanded, windowHeight])

  useEffect(() => {
    if (textRef.current && textContainerRef.current) {
      let textContainerHeight = textContainerRef.current.clientHeight
      if (!textContainerHeight) {
        textContainerHeight = textContainerRef.current.getBoundingClientRect().height
      }
      const isOverflowing = textRef.current.scrollHeight > textContainerHeight
      if (!isOverflowing) {
        setIsTextExpanded(false)
      }
      setShowSeeMore(isOverflowing)
    }
  }, [task.text, windowWidth])

  const isCostAvailable = useMemo<boolean>(() => {
    return (
      apiConfiguration?.apiProvider !== "openai" &&
      apiConfiguration?.apiProvider !== "ollama" &&
      apiConfiguration?.apiProvider !== "lmstudio" &&
      apiConfiguration?.apiProvider !== "gemini"
    )
  }, [apiConfiguration?.apiProvider])

  const shouldShowPromptCacheInfo = doesModelSupportPromptCache && apiConfiguration?.apiProvider !== "openrouter"

  const renderHighlightedText = (text?: string): React.ReactNode => {
    if (!text) return null
    const highlighted = highlightMentions(text, false)
    return Array.isArray(highlighted) ? highlighted : text
  }

  return (
    <TaskContainer>
      <TaskCard $mode={currentMode}>
        <StyledTaskHeader>
          <TaskTitleContainer onClick={() => setIsTaskExpanded(!isTaskExpanded)}>
            <span className={`codicon codicon-chevron-${isTaskExpanded ? "down" : "right"}`}></span>
            <TaskTitle $mode={currentMode}>
              <span style={{ fontWeight: "bold" }}>Task{!isTaskExpanded && ":"}</span>
              {!isTaskExpanded && (
                <span style={{ marginLeft: 4 }}>{renderHighlightedText(task.text)}</span>
              )}
            </TaskTitle>
          </TaskTitleContainer>
          {!isTaskExpanded && (
            <>
              {isCostAvailable && <CostBadge>${totalCost?.toFixed(4)}</CostBadge>}
              <ModeIndicator mode={currentMode} isTransitioning={isTransitioning} />
            </>
          )}
          <StyledExportButton appearance="icon" onClick={onClose}>
            <span className="codicon codicon-close"></span>
          </StyledExportButton>
        </StyledTaskHeader>

        {isTaskExpanded && (
          <>
            <TaskContent ref={textContainerRef} isExpanded={isTextExpanded}>
              <TaskText ref={textRef} isExpanded={isTextExpanded}>
                {renderHighlightedText(task.text)}
              </TaskText>
              {!isTextExpanded && showSeeMore && (
                <div style={{
                  position: "absolute",
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  alignItems: "center",
                }}>
                  <SeeMoreGradient />
                  <SeeMoreButton onClick={() => setIsTextExpanded(!isTextExpanded)}>
                    See more
                  </SeeMoreButton>
                </div>
              )}
            </TaskContent>

            {isTextExpanded && showSeeMore && (
              <SeeMoreButton
                style={{ marginLeft: "auto", textAlign: "right", paddingRight: 2 }}
                onClick={() => setIsTextExpanded(!isTextExpanded)}>
                See less
              </SeeMoreButton>
            )}

            {task.images && task.images.length > 0 && <Thumbnails images={task.images} />}

            <MetricsContainer>
              <MetricsRow>
                <MetricsGroup>
                  <MetricsLabel $mode={currentMode}>Tokens:</MetricsLabel>
                  <MetricsValue>
                    <i className="codicon codicon-arrow-up" style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "-2px" }} />
                    {formatLargeNumber(tokensIn || 0)}
                  </MetricsValue>
                  <MetricsValue>
                    <i className="codicon codicon-arrow-down" style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "-2px" }} />
                    {formatLargeNumber(tokensOut || 0)}
                  </MetricsValue>
                </MetricsGroup>
                {!isCostAvailable && <ExportButton />}
              </MetricsRow>

              <MetricsRow>
                <MetricsGroup>
                  <MetricsLabel $mode={currentMode}>Context:</MetricsLabel>
                  <MetricsValue>
                    {contextTokens ? `${formatLargeNumber(contextTokens)} (${contextPercentage}%)` : "-"}
                  </MetricsValue>
                </MetricsGroup>
              </MetricsRow>

              {shouldShowPromptCacheInfo && (cacheReads !== undefined || cacheWrites !== undefined) && (
                <MetricsRow>
                  <MetricsGroup>
                    <MetricsLabel $mode={currentMode}>Cache:</MetricsLabel>
                    <MetricsValue>
                      <i className="codicon codicon-database" style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "-1px" }} />
                      +{formatLargeNumber(cacheWrites || 0)}
                    </MetricsValue>
                    <MetricsValue>
                      <i className="codicon codicon-arrow-right" style={{ fontSize: "12px", fontWeight: "bold", marginBottom: 0 }} />
                      {formatLargeNumber(cacheReads || 0)}
                    </MetricsValue>
                  </MetricsGroup>
                </MetricsRow>
              )}

              {isCostAvailable && (
                <MetricsRow>
                  <MetricsGroup>
                    <MetricsLabel $mode={currentMode}>API Cost:</MetricsLabel>
                    <span>${totalCost?.toFixed(4)}</span>
                  </MetricsGroup>
                  <ExportButton />
                </MetricsRow>
              )}
            </MetricsContainer>
          </>
        )}
      </TaskCard>
    </TaskContainer>
  )
}

export const highlightMentions = (text?: string, withShadow = true): React.ReactNode[] => {
  if (!text) return []
  const parts = text.split(mentionRegexGlobal)
  return parts.map((part, index) => {
    if (index % 2 === 0) {
      return part
    } else {
      return (
        <span
          key={index}
          className={withShadow ? "mention-context-highlight-with-shadow" : "mention-context-highlight"}
          style={{ cursor: "pointer" }}
          onClick={() => vscode.postMessage({ type: "openMention", text: part })}>
          @{part}
        </span>
      )
    }
  })
}

const ExportButton: React.FC = () => (
  <StyledExportButton
    appearance="icon"
    onClick={() => vscode.postMessage({ type: "exportCurrentTask" })}>
    <ExportButtonText>EXPORT</ExportButtonText>
  </StyledExportButton>
)

export default memo(TaskHeader)
