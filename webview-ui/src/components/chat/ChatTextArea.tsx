import * as React from "react"
import { forwardRef, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { mentionRegex, mentionRegexGlobal } from "../../../../src/shared/context-mentions"
import { useExtensionState } from "../../context/ExtensionStateContext"
import {
  ContextMenuOptionType,
  getContextMenuOptions,
  insertMention,
  removeMention,
  shouldShowContextMenu,
} from "../../utils/context-mentions"
import { MAX_IMAGES_PER_MESSAGE } from "./ChatView"
import ContextMenu from "./ContextMenu"
import Thumbnails from "../common/Thumbnails"
import { vscode } from "../../utils/vscode"
import { WebviewMessage } from "../../../../src/shared/WebviewMessage"
import { Mode, getAllModes } from "../../../../src/shared/modes"
import { CaretIcon } from "../common/CaretIcon"
import {
  Container,
  TextAreaWrapper,
  HighlightLayer,
  StyledTextArea,
  ThumbnailsContainer,
  ControlsContainer,
  SelectContainer,
  SelectWrapper,
  StyledSelect,
  CaretContainer,
  ButtonsContainer,
  IconButton
} from "./ChatTextAreaStyles"

interface ChatTextAreaProps {
  inputValue: string
  setInputValue: (value: string) => void
  textAreaDisabled: boolean
  placeholderText: string
  selectedImages: string[]
  setSelectedImages: React.Dispatch<React.SetStateAction<string[]>>
  onSend: () => void
  onSelectImages: () => void
  shouldDisableImages: boolean
  onHeightChange?: (height: number) => void
  mode: Mode
  setMode: (value: Mode) => void
}

const ChatTextArea = forwardRef<HTMLTextAreaElement, ChatTextAreaProps>(({
  inputValue,
  setInputValue,
  textAreaDisabled,
  placeholderText,
  selectedImages,
  setSelectedImages,
  onSend,
  onSelectImages,
  shouldDisableImages,
  onHeightChange,
  mode,
  setMode,
}, ref) => {
  const { filePaths, currentApiConfigName, listApiConfigMeta, customModes } = useExtensionState()
  const [gitCommits, setGitCommits] = useState<any[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [thumbnailsHeight, setThumbnailsHeight] = useState(0)
  const [textAreaBaseHeight, setTextAreaBaseHeight] = useState<number | undefined>(undefined)
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [cursorPosition, setCursorPosition] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null)
  const [isMouseDownOnMenu, setIsMouseDownOnMenu] = useState(false)
  const highlightLayerRef = useRef<HTMLDivElement>(null)
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(-1)
  const [selectedType, setSelectedType] = useState<ContextMenuOptionType | null>(null)
  const [justDeletedSpaceAfterMention, setJustDeletedSpaceAfterMention] = useState(false)
  const [intendedCursorPosition, setIntendedCursorPosition] = useState<number | null>(null)
  const contextMenuContainerRef = useRef<HTMLDivElement>(null)
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (showDropdown) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showDropdown])

  useEffect(() => {
    const messageHandler = (event: MessageEvent): void => {
      const message = event.data
      if (message.type === "enhancedPrompt") {
        if (message.text) {
          setInputValue(message.text)
        }
        setIsEnhancingPrompt(false)
      } else if (message.type === "commitSearchResults") {
        const commits = message.commits.map((commit: any) => ({
          type: ContextMenuOptionType.Git,
          value: commit.hash,
          label: commit.subject,
          description: `${commit.shortHash} by ${commit.author} on ${commit.date}`,
          icon: "$(git-commit)",
        }))
        setGitCommits(commits)
      }
    }
    window.addEventListener("message", messageHandler)
    return () => window.removeEventListener("message", messageHandler)
  }, [setInputValue])

  const queryItems = useMemo(() => {
    return [
      { type: ContextMenuOptionType.Problems, value: "problems" },
      ...gitCommits,
      ...filePaths
        .map((file) => "/" + file)
        .map((path) => ({
          type: path.endsWith("/") ? ContextMenuOptionType.Folder : ContextMenuOptionType.File,
          value: path,
        })),
    ]
  }, [filePaths, gitCommits])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        contextMenuContainerRef.current &&
        !contextMenuContainerRef.current.contains(event.target as Node)
      ) {
        setShowContextMenu(false)
      }
    }

    if (showContextMenu) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showContextMenu])

  const handleMentionSelect = useCallback(
    (type: ContextMenuOptionType, value?: string): void => {
      if (type === ContextMenuOptionType.NoResults) {
        return
      }

      if (
        type === ContextMenuOptionType.File ||
        type === ContextMenuOptionType.Folder ||
        type === ContextMenuOptionType.Git
      ) {
        if (!value) {
          setSelectedType(type)
          setSearchQuery("")
          setSelectedMenuIndex(0)
          return
        }
      }

      setShowContextMenu(false)
      setSelectedType(null)
      if (textAreaRef.current) {
        let insertValue = value || ""
        if (type === ContextMenuOptionType.URL) {
          insertValue = value || ""
        } else if (type === ContextMenuOptionType.File || type === ContextMenuOptionType.Folder) {
          insertValue = value || ""
        } else if (type === ContextMenuOptionType.Problems) {
          insertValue = "problems"
        } else if (type === ContextMenuOptionType.Git) {
          insertValue = value || ""
        }

        const { newValue, mentionIndex } = insertMention(
          textAreaRef.current.value,
          cursorPosition,
          insertValue,
        )

        setInputValue(newValue)
        const newCursorPosition = newValue.indexOf(" ", mentionIndex + insertValue.length) + 1
        setCursorPosition(newCursorPosition)
        setIntendedCursorPosition(newCursorPosition)

        setTimeout(() => {
          if (textAreaRef.current) {
            textAreaRef.current.blur()
            textAreaRef.current.focus()
          }
        }, 0)
      }
    },
    [setInputValue, cursorPosition],
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>): void => {
      if (showContextMenu) {
        if (event.key === "Escape") {
          setSelectedType(null)
          setSelectedMenuIndex(3)
          return
        }

        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
          event.preventDefault()
          setSelectedMenuIndex((prevIndex) => {
            const direction = event.key === "ArrowUp" ? -1 : 1
            const options = getContextMenuOptions(searchQuery, selectedType, queryItems)
            const optionsLength = options.length

            if (optionsLength === 0) return prevIndex

            const selectableOptions = options.filter(
              (option) =>
                option.type !== ContextMenuOptionType.URL &&
                option.type !== ContextMenuOptionType.NoResults,
            )

            if (selectableOptions.length === 0) return -1

            const currentSelectableIndex = selectableOptions.findIndex(
              (option) => option === options[prevIndex],
            )

            const newSelectableIndex =
              (currentSelectableIndex + direction + selectableOptions.length) %
              selectableOptions.length

            return options.findIndex((option) => option === selectableOptions[newSelectableIndex])
          })
          return
        }
        if ((event.key === "Enter" || event.key === "Tab") && selectedMenuIndex !== -1) {
          event.preventDefault()
          const selectedOption = getContextMenuOptions(searchQuery, selectedType, queryItems)[
            selectedMenuIndex
          ]
          if (
            selectedOption &&
            selectedOption.type !== ContextMenuOptionType.URL &&
            selectedOption.type !== ContextMenuOptionType.NoResults
          ) {
            handleMentionSelect(selectedOption.type, selectedOption.value)
          }
          return
        }
      }

      const isComposing = event.nativeEvent?.isComposing ?? false
      if (event.key === "Enter" && !event.shiftKey && !isComposing) {
        event.preventDefault()
        onSend()
      }

      if (event.key === "Backspace" && !isComposing) {
        const charBeforeCursor = inputValue[cursorPosition - 1]
        const charAfterCursor = inputValue[cursorPosition + 1]

        const charBeforeIsWhitespace =
          charBeforeCursor === " " || charBeforeCursor === "\n" || charBeforeCursor === "\r\n"
        const charAfterIsWhitespace =
          charAfterCursor === " " || charAfterCursor === "\n" || charAfterCursor === "\r\n"

        if (
          charBeforeIsWhitespace &&
          inputValue.slice(0, cursorPosition - 1).match(new RegExp(mentionRegex.source + "$"))
        ) {
          const newCursorPosition = cursorPosition - 1
          if (!charAfterIsWhitespace) {
            event.preventDefault()
            textAreaRef.current?.setSelectionRange(newCursorPosition, newCursorPosition)
            setCursorPosition(newCursorPosition)
          }
          setCursorPosition(newCursorPosition)
          setJustDeletedSpaceAfterMention(true)
        } else if (justDeletedSpaceAfterMention) {
          const { newText, newPosition } = removeMention(inputValue, cursorPosition)
          if (newText !== inputValue) {
            event.preventDefault()
            setInputValue(newText)
            setIntendedCursorPosition(newPosition)
          }
          setJustDeletedSpaceAfterMention(false)
          setShowContextMenu(false)
        } else {
          setJustDeletedSpaceAfterMention(false)
        }
      }
    },
    [
      onSend,
      showContextMenu,
      searchQuery,
      selectedMenuIndex,
      handleMentionSelect,
      selectedType,
      inputValue,
      cursorPosition,
      setInputValue,
      justDeletedSpaceAfterMention,
      queryItems,
    ],
  )

  useLayoutEffect(() => {
    if (intendedCursorPosition !== null && textAreaRef.current) {
      textAreaRef.current.setSelectionRange(intendedCursorPosition, intendedCursorPosition)
      setIntendedCursorPosition(null)
    }
  }, [inputValue, intendedCursorPosition])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
      const newValue = e.target.value
      const newCursorPosition = e.target.selectionStart || 0
      setInputValue(newValue)
      setCursorPosition(newCursorPosition)
      const showMenu = shouldShowContextMenu(newValue, newCursorPosition)

      setShowContextMenu(showMenu)
      if (showMenu) {
        const lastAtIndex = newValue.lastIndexOf("@", newCursorPosition - 1)
        const query = newValue.slice(lastAtIndex + 1, newCursorPosition)
        setSearchQuery(query)
        if (query.length > 0) {
          setSelectedMenuIndex(0)
        } else {
          setSelectedMenuIndex(3)
        }
      } else {
        setSearchQuery("")
        setSelectedMenuIndex(-1)
      }
    },
    [setInputValue],
  )

  useEffect(() => {
    if (!showContextMenu) {
      setSelectedType(null)
    }
  }, [showContextMenu])

  const handleBlur = useCallback((): void => {
    if (!isMouseDownOnMenu) {
      setShowContextMenu(false)
    }
    setIsFocused(false)
  }, [isMouseDownOnMenu])

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent): Promise<void> => {
      const items = e.clipboardData.items

      const pastedText = e.clipboardData.getData("text")
      const urlRegex = /^\S+:\/\/\S+$/
      if (urlRegex.test(pastedText.trim())) {
        e.preventDefault()
        const trimmedUrl = pastedText.trim()
        const newValue =
          inputValue.slice(0, cursorPosition) + trimmedUrl + " " + inputValue.slice(cursorPosition)
        setInputValue(newValue)
        const newCursorPosition = cursorPosition + trimmedUrl.length + 1
        setCursorPosition(newCursorPosition)
        setIntendedCursorPosition(newCursorPosition)
        setShowContextMenu(false)

        setTimeout(() => {
          if (textAreaRef.current) {
            textAreaRef.current.blur()
            textAreaRef.current.focus()
          }
        }, 0)

        return
      }

      const acceptedTypes = ["png", "jpeg", "webp"]
      const imageItems = Array.from(items).filter((item) => {
        const [type, subtype] = item.type.split("/")
        return type === "image" && acceptedTypes.includes(subtype)
      })
      if (!shouldDisableImages && imageItems.length > 0) {
        e.preventDefault()
        const imagePromises = imageItems.map((item) => {
          return new Promise<string | null>((resolve) => {
            const blob = item.getAsFile()
            if (!blob) {
              resolve(null)
              return
            }
            const reader = new FileReader()
            reader.onloadend = () => {
              if (reader.error) {
                console.error("Error reading file:", reader.error)
                resolve(null)
              } else {
                const result = reader.result
                resolve(typeof result === "string" ? result : null)
              }
            }
            reader.readAsDataURL(blob)
          })
        })
        const imageDataArray = await Promise.all(imagePromises)
        const dataUrls = imageDataArray.filter((dataUrl): dataUrl is string => dataUrl !== null)
        if (dataUrls.length > 0) {
          setSelectedImages((prevImages) => [...prevImages, ...dataUrls].slice(0, MAX_IMAGES_PER_MESSAGE))
        } else {
          console.warn("No valid images were processed")
        }
      }
    },
    [shouldDisableImages, setSelectedImages, cursorPosition, setInputValue, inputValue],
  )

  const handleThumbnailsHeightChange = useCallback((height: number): void => {
    setThumbnailsHeight(height)
  }, [])

  useEffect(() => {
    if (selectedImages.length === 0) {
      setThumbnailsHeight(0)
    }
  }, [selectedImages])

  const handleMenuMouseDown = useCallback((): void => {
    setIsMouseDownOnMenu(true)
  }, [])

  const updateHighlights = useCallback((): void => {
    if (!textAreaRef.current || !highlightLayerRef.current) return

    const text = textAreaRef.current.value

    highlightLayerRef.current.innerHTML = text
      .replace(/\n$/, "\n\n")
      .replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c] || c)
      .replace(mentionRegexGlobal, '<mark class="mention-context-textarea-highlight">$&</mark>')

    highlightLayerRef.current.scrollTop = textAreaRef.current.scrollTop
    highlightLayerRef.current.scrollLeft = textAreaRef.current.scrollLeft
  }, [])

  useLayoutEffect(() => {
    updateHighlights()
  }, [inputValue, updateHighlights])

  const updateCursorPosition = useCallback((): void => {
    if (textAreaRef.current) {
      setCursorPosition(textAreaRef.current.selectionStart || 0)
    }
  }, [])

  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(e.key)) {
        updateCursorPosition()
      }
    },
    [updateCursorPosition],
  )

  const handleEnhancePrompt = useCallback((): void => {
    if (!textAreaDisabled) {
      const trimmedInput = inputValue.trim()
      if (trimmedInput) {
        setIsEnhancingPrompt(true)
        const message = {
          type: "enhancePrompt" as const,
          text: trimmedInput,
        }
        vscode.postMessage(message)
      } else {
        const promptDescription =
          "The 'Enhance Prompt' button helps improve your prompt by providing additional context, clarification, or rephrasing. Try typing a prompt in here and clicking the button again to see how it works."
        setInputValue(promptDescription)
      }
    }
  }, [inputValue, textAreaDisabled, setInputValue])

  return (
    <Container disabled={textAreaDisabled} isFocused={isFocused}>
      {showContextMenu && (
        <div ref={contextMenuContainerRef}>
          <ContextMenu
            onSelect={handleMentionSelect}
            searchQuery={searchQuery}
            onMouseDown={handleMenuMouseDown}
            selectedIndex={selectedMenuIndex}
            setSelectedIndex={setSelectedMenuIndex}
            selectedType={selectedType}
            queryItems={queryItems}
          />
        </div>
      )}

      <TextAreaWrapper>
        <HighlightLayer
          ref={highlightLayerRef}
          thumbnailsHeight={thumbnailsHeight}
        />
        <StyledTextArea
          ref={(el: HTMLTextAreaElement | null) => {
            if (typeof ref === "function") {
              ref(el)
            } else if (ref) {
              ref.current = el
            }
            textAreaRef.current = el
          }}
          value={inputValue}
          disabled={textAreaDisabled}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            handleInputChange(e)
            updateHighlights()
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onBlur={handleBlur}
          onPaste={handlePaste}
          onSelect={updateCursorPosition}
          onMouseUp={updateCursorPosition}
          onHeightChange={(height: number) => {
            if (textAreaBaseHeight === undefined || height < textAreaBaseHeight) {
              setTextAreaBaseHeight(height)
            }
            onHeightChange?.(height)
          }}
          placeholder={placeholderText}
          minRows={3}
          maxRows={15}
          autoFocus={true}
          thumbnailsHeight={thumbnailsHeight}
          onScroll={() => updateHighlights()}
        />
      </TextAreaWrapper>

      {selectedImages.length > 0 && (
        <ThumbnailsContainer>
          <Thumbnails
            images={selectedImages}
            setImages={setSelectedImages}
            onHeightChange={handleThumbnailsHeightChange}
          />
        </ThumbnailsContainer>
      )}

      <ControlsContainer>
        <SelectContainer>
          <SelectWrapper>
            <StyledSelect
              value={mode}
              disabled={textAreaDisabled}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                const value = e.target.value
                if (value === "prompts-action") {
                  window.postMessage({ type: "action", action: "promptsButtonClicked" })
                  return
                }
                setMode(value as Mode)
                vscode.postMessage({
                  type: "mode",
                  text: value,
                })
              }}
            >
              {getAllModes(customModes).map((mode) => (
                <option key={mode.slug} value={mode.slug}>
                  {mode.name}
                </option>
              ))}
              <option disabled>────</option>
              <option value="prompts-action">Edit...</option>
            </StyledSelect>
            <CaretContainer disabled={textAreaDisabled}>
              <CaretIcon />
            </CaretContainer>
          </SelectWrapper>

          <SelectWrapper maxWidth="150px">
            <StyledSelect
              value={currentApiConfigName || ""}
              disabled={textAreaDisabled}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                const value = e.target.value
                if (value === "settings-action") {
                  window.postMessage({ type: "action", action: "settingsButtonClicked" })
                  return
                }
                vscode.postMessage({
                  type: "loadApiConfiguration",
                  text: value,
                })
              }}
            >
              {(listApiConfigMeta || []).map((config) => (
                <option key={config.name} value={config.name}>
                  {config.name}
                </option>
              ))}
              <option disabled>────</option>
              <option value="settings-action">Edit...</option>
            </StyledSelect>
            <CaretContainer disabled={textAreaDisabled}>
              <CaretIcon />
            </CaretContainer>
          </SelectWrapper>
        </SelectContainer>

        <ButtonsContainer>
          <div>
            {isEnhancingPrompt ? (
              <IconButton
                className="codicon codicon-loading codicon-modifier-spin"
                disabled={true}
                fontSize={16.5}
              />
            ) : (
              <IconButton
                role="button"
                aria-label="enhance prompt"
                data-testid="enhance-prompt-button"
                className="codicon codicon-sparkle"
                disabled={textAreaDisabled}
                onClick={() => !textAreaDisabled && handleEnhancePrompt()}
                fontSize={16.5}
              />
            )}
          </div>
          <IconButton
            className="codicon codicon-device-camera"
            disabled={shouldDisableImages}
            onClick={() => !shouldDisableImages && onSelectImages()}
            fontSize={16.5}
          />
          <IconButton
            className="codicon codicon-send"
            disabled={textAreaDisabled}
            onClick={() => !textAreaDisabled && onSend()}
            fontSize={15}
          />
        </ButtonsContainer>
      </ControlsContainer>
    </Container>
  )
})

ChatTextArea.displayName = 'ChatTextArea'

export default ChatTextArea
