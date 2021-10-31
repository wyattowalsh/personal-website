import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: '#547F90',
    },
    secondary: {
      main: '#906554',
    },
  },
  typography: {
    fontFamily: ["'ubuntu', sans-serif", "'open-sans', sans-serif", "'roboto', sans-serif"].join(','),
    fontWeightRegular: 500,
    fontWeightLight: 400,
    fontWeightMedium: 600,
    fontWeightBold: 800,
  },
  shape: {
    borderRadius: 4,
  },
  spacing: 8,
  MuiAppBar: {
    colorInherit: {
      backgroundColor: '#547F90',
      color: '#fff',
    },
  },
  MuiSwitch: {
    root: {
      width: 42,
      height: 26,
      padding: 0,
      margin: 8,
    },
    switchBase: {
      padding: 1,
      '&$checked, &$colorPrimary$checked, &$colorSecondary$checked': {
        transform: 'translateX(16px)',
        color: '#fff',
        '& + $track': {
          opacity: 1,
          border: 'none',
        },
      },
    },
    thumb: {
      width: 24,
      height: 24,
    },
    track: {
      borderRadius: 13,
      border: '1px solid #bdbdbd',
      backgroundColor: '#fafafa',
      opacity: 1,
      transition: 'background-color 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    },
  },
  MuiButton: {
    root: {
      background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
      border: 0,
      borderRadius: 3,
      boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
      color: 'white',
      height: 48,
      padding: '0 30px',
    },
  },
props: {
  MuiList: {
    dense: true,
  },
  MuiMenuItem: {
    dense: true,
  },
  MuiTable: {
    size: 'small',
  },
  MuiTooltip: {
    arrow: true,
  }
}
});

export default theme;
