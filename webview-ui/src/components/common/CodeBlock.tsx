import * as React from "react"
import { memo, useEffect } from "react"
import { useRemark } from "react-remark"
import rehypeHighlight, { Options } from "rehype-highlight"
import { visit } from "unist-util-visit"
import { Node } from "unist"
import { useExtensionState } from "../../context/ExtensionStateContext"
import {
  CodeBlockContainer,
  StyledMarkdown,
  StyledPre
} from "./CodeBlockStyles"

interface CodeBlockProps {
  source?: string
  forceWrap?: boolean
}

interface CodeNode extends Node {
  lang?: string
  value?: string
  type: 'code'
}

interface ThemeProps {
  theme: Record<string, string>
}

interface PreProps extends React.HTMLAttributes<HTMLPreElement> {
  node?: Node
  theme: Record<string, string>
}

const CodeBlock = memo(({ source, forceWrap = false }: CodeBlockProps) => {
  const { theme } = useExtensionState()
  const [reactContent, setMarkdownSource] = useRemark({
    remarkPlugins: [
      () => {
        return (tree: Node) => {
          visit(tree, "code", (node: CodeNode) => {
            if (!node.lang) {
              node.lang = "javascript"
            } else if (node.lang.includes(".")) {
              // if the language is a file, get the extension
              node.lang = node.lang.split(".").slice(-1)[0]
            }
          })
        }
      },
    ],
    rehypePlugins: [
      [rehypeHighlight as any, {} as Options],
    ],
    rehypeReactOptions: {
      components: {
        pre: ({ node, ...preProps }: PreProps) => (
          <StyledPre {...preProps} theme={theme} />
        ),
      },
    },
  })

  useEffect(() => {
    setMarkdownSource(source || "")
  }, [source, setMarkdownSource, theme])

  return (
    <CodeBlockContainer forceWrap={forceWrap}>
      <StyledMarkdown forceWrap={forceWrap}>{reactContent}</StyledMarkdown>
    </CodeBlockContainer>
  )
})

CodeBlock.displayName = 'CodeBlock'

export default CodeBlock
