declare module 'react-remark' {
  import { Node } from 'unist'
  import { Plugin } from 'unified'
  import { ReactNode } from 'react'

  interface RemarkOptions {
    remarkPlugins?: Plugin[]
    rehypePlugins?: (Plugin | [Plugin, any])[]
    rehypeReactOptions?: {
      components?: {
        [key: string]: React.ComponentType<any>
      }
    }
  }

  type UseRemarkReturn = [
    ReactNode,
    (markdown: string) => void,
    {
      remarkPlugins: Plugin[]
      rehypePlugins: (Plugin | [Plugin, any])[]
      tree: Node | null
    }
  ]

  export function useRemark(options?: RemarkOptions): UseRemarkReturn
}