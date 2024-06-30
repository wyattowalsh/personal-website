// styles/layouts/main.tsx
import "@fontsource/fira-code";
import { createTheme } from '@mantine/core';

export const theme = createTheme({
  fontFamily: 'Fira Code',
  primaryColor: 'primary',
  colors: {
      primary: ["#e5f9ff", "#d9ecf3", "#bad5e0", "#96bccd", "#78a8bc", "#659cb2", "#5995ae", "#46819a", "#39748b", "#24657c"],
      myBlue: ["#e5f9ff", "#d9ecf3", "#bad5e0", "#96bccd", "#78a8bc", "#659cb2", "#5995ae", "#46819a", "#39748b", "#24657c"],
      secondary: ["#faf7e6", "#f0ecda", "#dfd8ba", "#ccc297", "#bcb078", "#b2a465", "#ad9e5a", "#988948", "#887a3e", "#75692f"],
      myGold: ["#faf7e6", "#f0ecda", "#dfd8ba", "#ccc297", "#bcb078", "#b2a465", "#ad9e5a", "#988948", "#887a3e", "#75692f"],
      myBrown: ["#fff2e7", "#f4e3db", "#e0c6bb", "#cda897", "#bc8e78", "#b27d65", "#ae755a", "#9a6349", "#8a583f", "#7a4933"],
      myPurple: ["#fbefff", "#ecdef3", "#d3bce0", "#ba98cd", "#a578bc", "#9765b2", "#915bae", "#7e4a9a", "#70418a", "#63377a"],
      myGray: ["#fff1f5", "#e7e7ed", "#cacdd1", "#afb2b4", "#989a9c", "#898b8e", "#818487", "#6e7176", "#5f666c", "#4b5960"],
  },
  autoContrast: true,
  cursorType: 'pointer'
})