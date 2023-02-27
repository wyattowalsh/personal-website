export type PostData = {
  slug: string
  title: string
  description: string
  date: string
  url: string
  image: string
}

export type PostType = {
  content: string
  data: PostData
  filePath: string
}
