import * as React from "react"
import { memo, useEffect, useRef, useState } from "react"
import type { DropdownOption } from "vscrui"
import { ApiConfigMeta } from "../../../../src/shared/ExtensionMessage"
import {
  Container,
  ConfigWrapper,
  Label,
  EditContainer,
  StyledTextField,
  IconButton,
  StyledDropdown,
  Description
} from "./ApiConfigManagerStyles"

interface ApiConfigManagerProps {
  currentApiConfigName?: string
  listApiConfigMeta?: ApiConfigMeta[]
  onSelectConfig: (configName: string) => void
  onDeleteConfig: (configName: string) => void
  onRenameConfig: (oldName: string, newName: string) => void
  onUpsertConfig: (configName: string) => void
}

const ApiConfigManager: React.FC<ApiConfigManagerProps> = ({
  currentApiConfigName = "",
  listApiConfigMeta = [],
  onSelectConfig,
  onDeleteConfig,
  onRenameConfig,
  onUpsertConfig,
}) => {
  const [editState, setEditState] = useState<"new" | "rename" | null>(null)
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>()

  useEffect(() => {
    if (editState) {
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [editState])

  useEffect(() => {
    setEditState(null)
    setInputValue("")
  }, [currentApiConfigName])

  const handleAdd = (): void => {
    const newConfigName = currentApiConfigName + " (copy)"
    onUpsertConfig(newConfigName)
  }

  const handleStartRename = (): void => {
    setEditState("rename")
    setInputValue(currentApiConfigName || "")
  }

  const handleCancel = (): void => {
    setEditState(null)
    setInputValue("")
  }

  const handleSave = (): void => {
    const trimmedValue = inputValue.trim()
    if (!trimmedValue) return

    if (editState === "new") {
      onUpsertConfig(trimmedValue)
    } else if (editState === "rename" && currentApiConfigName) {
      onRenameConfig(currentApiConfigName, trimmedValue)
    }

    setEditState(null)
    setInputValue("")
  }

  const handleDelete = (): void => {
    if (!currentApiConfigName || !listApiConfigMeta || listApiConfigMeta.length <= 1) return
    onDeleteConfig(currentApiConfigName)
  }

  const isOnlyProfile = listApiConfigMeta?.length === 1

  return (
    <Container>
      <ConfigWrapper>
        <Label htmlFor="config-profile">
          <span>Configuration Profile</span>
        </Label>

        {editState ? (
          <EditContainer>
            <StyledTextField
              ref={inputRef as any}
              value={inputValue}
              onInput={(e: React.FormEvent<HTMLInputElement>) => 
                setInputValue((e.target as HTMLInputElement).value)
              }
              placeholder={editState === "new" ? "Enter profile name" : "Enter new name"}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter" && inputValue.trim()) {
                  handleSave()
                } else if (e.key === "Escape") {
                  handleCancel()
                }
              }}
            />
            <IconButton
              appearance="icon"
              disabled={!inputValue.trim()}
              onClick={handleSave}
              title="Save"
            >
              <span className="codicon codicon-check" />
            </IconButton>
            <IconButton
              appearance="icon"
              onClick={handleCancel}
              title="Cancel"
            >
              <span className="codicon codicon-close" />
            </IconButton>
          </EditContainer>
        ) : (
          <>
            <EditContainer>
              <StyledDropdown
                id="config-profile"
                value={currentApiConfigName}
                onChange={(value: unknown) => {
                  onSelectConfig((value as DropdownOption).value)
                }}
                role="combobox"
                options={listApiConfigMeta.map((config) => ({
                  value: config.name,
                  label: config.name,
                }))}
              />
              <IconButton
                appearance="icon"
                onClick={handleAdd}
                title="Add profile"
              >
                <span className="codicon codicon-add" />
              </IconButton>
              {currentApiConfigName && (
                <>
                  <IconButton
                    appearance="icon"
                    onClick={handleStartRename}
                    title="Rename profile"
                  >
                    <span className="codicon codicon-edit" />
                  </IconButton>
                  <IconButton
                    appearance="icon"
                    onClick={handleDelete}
                    title={isOnlyProfile ? "Cannot delete the only profile" : "Delete profile"}
                    disabled={isOnlyProfile}
                  >
                    <span className="codicon codicon-trash" />
                  </IconButton>
                </>
              )}
            </EditContainer>
            <Description>
              Save different API configurations to quickly switch between providers and settings
            </Description>
          </>
        )}
      </ConfigWrapper>
    </Container>
  )
}

export default memo(ApiConfigManager)
