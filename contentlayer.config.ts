// contentlayer.config.ts
import {
    defineDocumentType,
    makeSource,
    ComputedFields,
  } from 'contentlayer/source-files'
  import { remarkPluginCollection } from './lib/mdx/remark'
  import { rehypePluginCollection } from './lib/mdx/rehype'
  import readingTime from 'reading-time'
  import { getGitFileData } from './lib/git'
  import { getTableOfContents } from './lib/toc'
  
  const computedFields: ComputedFields = {
    slug: {
      type: 'string',
      resolve: (doc) => doc._raw.sourceFileName.replace(/\.mdx$/, ''),
    },
    toc: {
      type: 'json',
      resolve: async (doc) => getTableOfContents(doc.body.raw),
    },
    readingTime: {
      type: 'json',
      resolve: (doc) => readingTime(doc.body.raw),
    },
    wordCount: {
      type: 'number',
      resolve: (doc) => doc.body.raw.split(/\s+/g).length,
    },
    gitHistory: {
      type: 'json',
      resolve: async (doc) => await getGitFileData(doc._raw.sourceFilePath),
    },
  }
  
  export const Post = defineDocumentType(() => ({
    name: 'Post',
    filePathPattern: 'posts/**/*.mdx',
    contentType: 'mdx',
    fields: {
      title: { type: 'string', required: true },
      summary: { type: 'string', required: true },
      image: { type: 'string' },
      caption: { type: 'string' },
      created: { type: 'date', required: true },
      updated: { type: 'date' },
      tags: { type: 'list', of: { type: 'string' }, required: true },
      draft: { type: 'boolean', default: false },
      featured: { type: 'boolean', default: false },
      series: { type: 'string' },
      seriesIndex: { type: 'number' },
    },
    computedFields,
  }))
  
  export default makeSource({
    contentDirPath: 'content',
    documentTypes: [Post],
    mdx: {
      remarkPlugins: remarkPluginCollection,
      rehypePlugins: rehypePluginCollection,
    },
    disableImportAliasWarning: true,
  })
  
  // lib/toc.ts
  import { slugifyWithCounter } from '@sindresorhus/slugify'
  import { toString } from 'mdast-util-to-string'
  import { remark } from 'remark'
  import { visit } from 'unist-util-visit'
  
  interface TableOfContents {
    items?: TableOfContentsItem[]
  }
  
  interface TableOfContentsItem {
    title: string
    url: string
    items?: TableOfContentsItem[]
  }
  
  export async function getTableOfContents(
    content: string
  ): Promise<TableOfContents> {
    const slugify = slugifyWithCounter()
    const result = await remark().use(plugin).process(content)
  
    return result.data.toc
  
    function plugin() {
      return (tree: any, file: any) => {
        const items: TableOfContentsItem[] = []
        let heading: TableOfContentsItem | undefined
        let stack: TableOfContentsItem[] = []
  
        visit(tree, 'heading', (node) => {
          const title = toString(node)
          const level = node.depth
          const url = `#${slugify(title)}`
  
          heading = { title, url, items: [] }
  
          if (level === 2) {
            items.push(heading)
            stack = [heading]
          } else if (level === 3 && stack.length > 0) {
            const parent = stack[stack.length - 1]
            if (!parent.items) parent.items = []
            parent.items.push(heading)
          }
        })
  
        file.data.toc = { items }
      }
    }
  }