import Layout from '../components/layout'
import style from '../styles/global.scss'

export default function MyApp({ Component, pageProps }) {
  console.log(style);
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}