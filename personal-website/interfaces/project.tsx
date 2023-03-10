export type ProjectData = {
  slug: string
  title: string
  description: string
  date: string
  url: string
  image: string
}

export type ProjectType = {
  content: string
  data: ProjectData
  filePath: string
}

export default ProjectType
