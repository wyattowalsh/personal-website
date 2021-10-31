import Layout from '../components/layout'
import style from '../styles/global.scss'
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../components/themes/theme.js';
import { ThemeProvider } from '@mui/material/styles';

export default function MyApp({ Component, pageProps }) {
  console.log(style);
  return (
    <Layout>
      {/* <CssBaseline /> */}
      {/* <ThemeProvider theme={theme}> */}
        <Component {...pageProps} />
      {/* </ThemeProvider> */}
    </Layout>
  )
}