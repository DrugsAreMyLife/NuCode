import * as React from "react"
import { memo, useEffect, useMemo, useRef, useState } from "react"
import { useRemark } from "react-remark"
import { useMount } from "react-use"
import debounce from "debounce"
import { Fzf } from "fzf"
import { openRouterDefaultModelId } from "../../../../src/shared/api"
import { useExtensionState } from "../../context/ExtensionStateContext"
import { vscode } from "../../utils/vscode"
import { highlightFzfMatch } from "../../utils/highlight"
import { ModelInfoView, normalizeApiConfiguration } from "./ApiOptions"
import {
  ModelPickerContainer,
  ModelLabel,
  StyledTextField,
  ClearButton,
  DropdownList,
  DropdownItem,
  Description,
  StyledLink,
  MarkdownContainer,
  TextContainer,
  TextContent,
  GradientOverlay,
  Gradient,
  ExpandLink,
  OPENROUTER_MODEL_PICKER_Z_INDEX
} from "./OpenRouterModelPickerStyles"

interface OpenRouterModelPickerProps {}

const OpenRouterModelPicker: React.FC<OpenRouterModelPickerProps> = () => {
  const { apiConfiguration, setApiConfiguration, openRouterModels, onUpdateApiConfig } = useExtensionState()
  const [searchTerm, setSearchTerm] = useState(apiConfiguration?.openRouterModelId || openRouterDefaultModelId)
  const [isDropdownVisible, setIsDropdownVisible] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  
  const dropdownRef = useRef<HTMLDivElement>(null)
  const dropdownListRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  const handleModelChange = (newModelId: string): void => {
    const apiConfig = {
      ...apiConfiguration,
      openRouterModelId: newModelId,
      openRouterModelInfo: openRouterModels[newModelId],
    }
    setApiConfiguration(apiConfig)
    onUpdateApiConfig(apiConfig)
    setSearchTerm(newModelId)
  }

  const { selectedModelId, selectedModelInfo } = useMemo(() => {
    return normalizeApiConfiguration(apiConfiguration)
  }, [apiConfiguration])

  useEffect(() => {
    if (apiConfiguration?.openRouterModelId && apiConfiguration?.openRouterModelId !== searchTerm) {
      setSearchTerm(apiConfiguration?.openRouterModelId)
    }
  }, [apiConfiguration, searchTerm])

  const debouncedRefreshModels = useMemo(
    () => debounce(() => {
      vscode.postMessage({ type: "refreshOpenRouterModels" })
    }, 50),
    []
  )

  useMount(() => {
    debouncedRefreshModels()
    return () => {
      debouncedRefreshModels.clear()
    }
  })

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownVisible(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const modelIds = useMemo(() => {
    return Object.keys(openRouterModels).sort((a, b) => a.localeCompare(b))
  }, [openRouterModels])

  const searchableItems = useMemo(() => {
    return modelIds.map((id) => ({
      id,
      html: id,
    }))
  }, [modelIds])

  const fzf = useMemo(() => {
    return new Fzf(searchableItems, {
      selector: (item) => item.html,
    })
  }, [searchableItems])

  const modelSearchResults = useMemo(() => {
    if (!searchTerm) return searchableItems
    const searchResults = fzf.find(searchTerm)
    return searchResults.map((result) => ({
      ...result.item,
      html: highlightFzfMatch(result.item.html, Array.from(result.positions), "model-item-highlight"),
    }))
  }, [searchableItems, searchTerm, fzf])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (!isDropdownVisible) return

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault()
        setSelectedIndex((prev) => (prev < modelSearchResults.length - 1 ? prev + 1 : prev))
        break
      case "ArrowUp":
        event.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
        break
      case "Enter":
        event.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < modelSearchResults.length) {
          handleModelChange(modelSearchResults[selectedIndex].id)
          setIsDropdownVisible(false)
        }
        break
      case "Escape":
        setIsDropdownVisible(false)
        setSelectedIndex(-1)
        break
    }
  }

  const hasInfo = useMemo(() => {
    return modelIds.some((id) => id.toLowerCase() === searchTerm.toLowerCase())
  }, [modelIds, searchTerm])

  useEffect(() => {
    setSelectedIndex(-1)
    if (dropdownListRef.current) {
      dropdownListRef.current.scrollTop = 0
    }
  }, [searchTerm])

  useEffect(() => {
    if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      })
    }
  }, [selectedIndex])

  return (
    <>
      <style>
        {`
        .model-item-highlight {
          background-color: color-mix(in srgb, var(--roo-primary) 20%, transparent);
          color: inherit;
        }
        `}
      </style>
      <ModelPickerContainer>
        <ModelLabel htmlFor="model-search">Model</ModelLabel>
        <div ref={dropdownRef}>
          <StyledTextField
            id="model-search"
            placeholder="Search and select a model..."
            value={searchTerm}
            onInput={(e: React.FormEvent<HTMLInputElement>) => {
              handleModelChange((e.target as HTMLInputElement)?.value?.toLowerCase())
              setIsDropdownVisible(true)
            }}
            onFocus={() => setIsDropdownVisible(true)}
            onKeyDown={handleKeyDown}
          >
            {searchTerm && (
              <ClearButton
                className="codicon codicon-close"
                aria-label="Clear search"
                onClick={() => {
                  handleModelChange("")
                  setIsDropdownVisible(true)
                }}
                slot="end"
              />
            )}
          </StyledTextField>
          {isDropdownVisible && (
            <DropdownList ref={dropdownListRef}>
              {modelSearchResults.map((item, index) => (
                <DropdownItem
                  key={item.id}
                  ref={(el: HTMLDivElement | null) => (itemRefs.current[index] = el)}
                  isSelected={index === selectedIndex}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => {
                    handleModelChange(item.id)
                    setIsDropdownVisible(false)
                  }}
                  dangerouslySetInnerHTML={{
                    __html: item.html,
                  }}
                />
              ))}
            </DropdownList>
          )}
        </div>
      </ModelPickerContainer>

      {hasInfo ? (
        <ModelInfoView
          selectedModelId={selectedModelId}
          modelInfo={selectedModelInfo}
          isDescriptionExpanded={isDescriptionExpanded}
          setIsDescriptionExpanded={setIsDescriptionExpanded}
        />
      ) : (
        <Description>
          The extension automatically fetches the latest list of models available on{" "}
          <StyledLink href="https://openrouter.ai/models">OpenRouter.</StyledLink>
          {" "}If you're unsure which model to choose, Roo Code works best with{" "}
          <StyledLink onClick={() => handleModelChange("anthropic/claude-3.5-sonnet:beta")}>
            anthropic/claude-3.5-sonnet:beta.
          </StyledLink>
          {" "}You can also try searching "free" for no-cost options currently available.
        </Description>
      )}
    </>
  )
}

interface ModelDescriptionMarkdownProps {
  markdown?: string
  key: string
  isExpanded: boolean
  setIsExpanded: (isExpanded: boolean) => void
}

export const ModelDescriptionMarkdown = memo<ModelDescriptionMarkdownProps>(({
  markdown,
  key,
  isExpanded,
  setIsExpanded,
}) => {
  const [reactContent, setMarkdown] = useRemark()
  const [showSeeMore, setShowSeeMore] = useState(false)
  const textContainerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMarkdown(markdown || "")
  }, [markdown, setMarkdown])

  useEffect(() => {
    if (textRef.current && textContainerRef.current) {
      const { scrollHeight } = textRef.current
      const { clientHeight } = textContainerRef.current
      const isOverflowing = scrollHeight > clientHeight
      setShowSeeMore(isOverflowing)
    }
  }, [reactContent])

  return (
    <MarkdownContainer key={key} style={{ display: "inline-block", marginBottom: 0 }}>
      <TextContainer ref={textContainerRef} isExpanded={isExpanded}>
        <TextContent ref={textRef} isExpanded={isExpanded}>
          {reactContent}
        </TextContent>
        {!isExpanded && showSeeMore && (
          <GradientOverlay>
            <Gradient />
            <ExpandLink onClick={() => setIsExpanded(true)}>
              See more
            </ExpandLink>
          </GradientOverlay>
        )}
      </TextContainer>
    </MarkdownContainer>
  )
})

ModelDescriptionMarkdown.displayName = 'ModelDescriptionMarkdown'

export default memo(OpenRouterModelPicker)
