import styled from 'styled-components';

export const ThumbnailsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  row-gap: 6px;
`;

export const ThumbnailWrapper = styled.div`
  position: relative;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

export const ThumbnailImage = styled.img`
  width: 34px;
  height: 34px;
  object-fit: cover;
  border-radius: var(--radius);
  cursor: pointer;
  border: 1px solid var(--chat-bubble-border);
  transition: border-color 0.2s ease;

  &:hover {
    border-color: var(--roo-primary);
  }
`;

export const DeleteButton = styled.div`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: var(--roo-primary);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s ease;
  border: 1px solid var(--chat-bubble-border);

  ${ThumbnailWrapper}:hover & {
    opacity: 1;
    transform: scale(1);
  }

  &:hover {
    background-color: var(--roo-primary-dark);
  }
`;

export const DeleteIcon = styled.span`
  color: var(--primary-foreground);
  font-size: 10px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ImagePreview = styled.div<{ isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.isVisible ? 1 : 0};
  visibility: ${props => props.isVisible ? 'visible' : 'hidden'};
  transition: opacity 0.3s ease, visibility 0.3s ease;
  z-index: 1000;

  img {
    max-width: 90%;
    max-height: 90%;
    border-radius: var(--radius);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;