import * as React from "react"
import { useState, useRef, useLayoutEffect, memo } from "react"
import { useWindowSize } from "react-use"
import { vscode } from "../../utils/vscode"
import {
  ThumbnailsContainer,
  ThumbnailWrapper,
  ThumbnailImage,
  DeleteButton,
  DeleteIcon,
  ImagePreview
} from "./ThumbnailsStyles"

interface ThumbnailsProps {
  images: string[]
  style?: React.CSSProperties
  setImages?: React.Dispatch<React.SetStateAction<string[]>>
  onHeightChange?: (height: number) => void
}

const Thumbnails: React.FC<ThumbnailsProps> = ({ 
  images, 
  style, 
  setImages, 
  onHeightChange 
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { width } = useWindowSize()

  useLayoutEffect(() => {
    if (containerRef.current) {
      let height = containerRef.current.clientHeight
      if (!height) {
        height = containerRef.current.getBoundingClientRect().height
      }
      onHeightChange?.(height)
    }
    setHoveredIndex(null)
  }, [images, width, onHeightChange])

  const handleDelete = (index: number): void => {
    setImages?.((prevImages: string[]) => 
      prevImages.filter((_: string, i: number) => i !== index)
    )
  }

  const isDeletable = setImages !== undefined

  const handleImageClick = (image: string): void => {
    setPreviewImage(image)
    vscode.postMessage({ type: "openImage", text: image })
  }

  const handleClosePreview = (): void => {
    setPreviewImage(null)
  }

  return (
    <>
      <ThumbnailsContainer ref={containerRef} style={style}>
        {images.map((image: string, index: number) => (
          <ThumbnailWrapper
            key={index}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <ThumbnailImage
              src={image}
              alt={`Thumbnail ${index + 1}`}
              onClick={() => handleImageClick(image)}
            />
            {isDeletable && hoveredIndex === index && (
              <DeleteButton onClick={() => handleDelete(index)}>
                <DeleteIcon className="codicon codicon-close" />
              </DeleteButton>
            )}
          </ThumbnailWrapper>
        ))}
      </ThumbnailsContainer>

      <ImagePreview
        isVisible={!!previewImage}
        onClick={handleClosePreview}
      >
        {previewImage && (
          <img
            src={previewImage}
            alt="Preview"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          />
        )}
      </ImagePreview>
    </>
  )
}

Thumbnails.displayName = 'Thumbnails'

export default memo(Thumbnails)
