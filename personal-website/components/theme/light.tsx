import { createTheme, responsiveFontSizes } from '@mui/material/styles'

interface Color {
  main: string
  light: string
  dark: string
  contrastText: string
}

interface Palette {
  mode: 'light' | 'dark'
  primary: Color
  secondary: Color
  error: Color
  warning: Color
  info: Color
  success: Color
}

interface TypographyElement {
  fontWeight: number
  fontSize: string
  fontStyle: string
  fontFamily: string
  lineHeight: number
  letterSpacing: string
}

interface Typography {
  fontFamily: string
  fontSize: number
  htmlFontSize: number
  fontWeightLight: number
  fontWeightRegular: number
  fontWeightMedium: number
  fontWeightBold: number
  h1: TypographyElement
  h2: TypographyElement
  h3: TypographyElement
  h4: TypographyElement
  h5: TypographyElement
  h6: TypographyElement
  subtitle1: TypographyElement
  subtitle2: TypographyElement
  body1: TypographyElement
  body2: TypographyElement
  button: TypographyElement
  caption: TypographyElement
  overline: TypographyElement
}

interface Breakpoints {
  keys: string[]
  values: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
  }
  unit: string
}

interface Shape {
  borderRadius: number
}

interface Components {
  MuiAppBar: {
    color: string
    contrastText: string
  }
  MuiTooltip: {
    arrow: boolean
  }
}

interface Theme {
  palette: Palette
  typography: Typography
  spacing: (factor: number) => number
  breakpoints: Breakpoints
  shape: Shape
}

export const lightTheme = responsiveFontSizes(
  createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#6a9fb5',
        contrastText: 'white',
      },
      secondary: {
        main: '#b5a76a',
      },
    },
    shape: {
      borderRadius: 4,
    },
    components: {
      MuiAppBar: {
        defaultProps: {
          color: 'secondary',
          contrastText: 'white',
        },
      },
      MuiTooltip: {
        defaultProps: {
          arrow: true,
        },
      },
    },
    typography: {
      fontFamily: 'Open Sans',
      fontSize: 14,
      h1: {
        fontWeight: 900,
        fontSize: '3.5rem',
      },
      htmlFontSize: 14,
      h2: {
        fontSize: '3rem',
      },
      h3: {
        fontSize: '2.5rem',
      },
      h4: {
        fontSize: '2rem',
      },
      h5: {
        fontSize: '1.5rem',
      },
      h6: {
        fontSize: '1.3rem',
      },
      body1: {
        fontWeight: 400,
      },
      body2: {
        fontWeight: 400,
      },
      button: {
        fontWeight: 600,
      },
    },
  }),
)

export default lightTheme
