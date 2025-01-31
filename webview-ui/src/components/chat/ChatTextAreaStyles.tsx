import styled from 'styled-components';
import DynamicTextArea from "react-textarea-autosize";

export const Container = styled.div<{ disabled: boolean; isFocused: boolean }>`
  opacity: ${props => props.disabled ? 0.5 : 1};
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-color: var(--background);
  margin: 10px 15px;
  padding: 8px;
  outline: none;
  border: 1px solid;
  border-color: ${props => props.isFocused ? 'var(--roo-primary)' : 'transparent'};
  border-radius: var(--radius);
  transition: border-color 0.1s ease;
`;

export const TextAreaWrapper = styled.div`
  position: relative;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column-reverse;
  min-height: 0;
  overflow: hidden;
`;

export const HighlightLayer = styled.div<{ thumbnailsHeight: number }>`
  position: absolute;
  inset: 0;
  pointer-events: none;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: transparent;
  overflow: hidden;
  font-family: var(--font-family);
  font-size: var(--vscode-editor-font-size);
  line-height: var(--vscode-editor-line-height);
  padding: 2px;
  padding-right: 8px;
  margin-bottom: ${props => props.thumbnailsHeight > 0 ? `${props.thumbnailsHeight + 16}px` : 0};
  z-index: 1;

  .mention-context-textarea-highlight {
    background-color: color-mix(in srgb, var(--roo-primary) 20%, transparent);
  }
`;

export const StyledTextArea = styled(DynamicTextArea)<{ 
  disabled?: boolean; 
  thumbnailsHeight: number;
}>`
  width: 100%;
  outline: none;
  box-sizing: border-box;
  background-color: transparent;
  color: var(--foreground);
  border-radius: var(--radius);
  font-family: var(--font-family);
  font-size: var(--vscode-editor-font-size);
  line-height: var(--vscode-editor-line-height);
  resize: none;
  overflow-x: hidden;
  overflow-y: auto;
  border: none;
  padding: 2px;
  padding-right: 8px;
  margin-bottom: ${props => props.thumbnailsHeight > 0 ? `${props.thumbnailsHeight + 16}px` : 0};
  cursor: ${props => props.disabled ? 'not-allowed' : 'text'};
  flex: 0 1 auto;
  z-index: 2;
  scrollbar-width: none;

  &::placeholder {
    color: var(--muted-foreground);
  }

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const ThumbnailsContainer = styled.div`
  position: absolute;
  bottom: 36px;
  left: 16px;
  z-index: 2;
  margin-bottom: 4px;
`;

export const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 2px;
`;

export const SelectContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const SelectWrapper = styled.div<{ maxWidth?: string }>`
  position: relative;
  display: inline-block;
  flex: ${props => props.maxWidth ? '1 1 auto' : '0 0 auto'};
  min-width: 0;
  max-width: ${props => props.maxWidth || 'none'};
  overflow: hidden;
`;

export const StyledSelect = styled.select<{ disabled?: boolean }>`
  font-size: 11px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  background-color: transparent;
  border: none;
  color: var(--foreground);
  opacity: ${props => props.disabled ? 0.5 : 0.8};
  outline: none;
  padding-left: 20px;
  padding-right: 6px;
  width: 100%;
  text-overflow: ellipsis;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;

  &:hover {
    opacity: 1;
  }

  option {
    background-color: var(--background);
    color: var(--foreground);
  }

  option:disabled {
    border-top: 1px solid var(--chat-bubble-border);
  }
`;

export const CaretContainer = styled.div<{ disabled?: boolean }>`
  position: absolute;
  left: 6px;
  top: 50%;
  transform: translateY(-45%);
  pointer-events: none;
  opacity: ${props => props.disabled ? 0.5 : 0.8};
`;

export const ButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const IconButton = styled.span<{ disabled?: boolean; fontSize?: number }>`
  font-size: ${props => props.fontSize || 16.5}px;
  color: var(--foreground);
  opacity: ${props => props.disabled ? 0.5 : 0.8};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: opacity 0.1s ease;

  &:hover {
    opacity: ${props => props.disabled ? 0.5 : 1};
  }

  &.loading {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;