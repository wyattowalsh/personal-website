import fs from 'fs'
import path from 'path'
import Layout from '../components/Layout'

export const PROJECTS_PATH = path.join(process.cwd(), 'projects')

export const projectFilePaths = fs
  .readdirSync(PROJECTS_PATH)
  // Only include md(x) files
  .filter((path) => /\.mdx?$/.test(path))

type Project = {
  slug: string
  content: string
  title: string
  description: string
  date: string
  url: string
  image: string
}

type project = {
  content: string
  data: Project
  filePath: string
}

type Props = {
  allProjects: project[]
}

export default function Projects({ allProjects }: Props) {}

export function getStaticProps() {
  const allProjects = projectFilePaths.map((filePath) => {
    const source = fs.readFileSync(path.join(PROJECTS_PATH, filePath))
    const { content, data } = matter(source)

    return {
      content,
      data,
      filePath,
    }
  })
  return { props: { allProjects } }
}

Projects.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>
}
