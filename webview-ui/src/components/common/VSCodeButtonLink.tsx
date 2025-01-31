import * as React from "react"
import { StyledLink, StyledButton } from "./VSCodeButtonLinkStyles"

interface VSCodeButtonLinkProps {
  href: string
  children: React.ReactNode
  appearance?: "primary" | "secondary" | "icon"
  style?: React.CSSProperties
  className?: string
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void
}

const VSCodeButtonLink: React.FC<VSCodeButtonLinkProps> = ({
  href,
  children,
  appearance = "primary",
  style,
  className,
  onClick,
  ...props
}) => {
  return (
    <StyledLink
      href={href}
      style={style}
      className={className}
      onClick={onClick}
    >
      <StyledButton appearance={appearance} {...props}>
        {children}
      </StyledButton>
    </StyledLink>
  )
}

VSCodeButtonLink.displayName = 'VSCodeButtonLink'

export default VSCodeButtonLink
