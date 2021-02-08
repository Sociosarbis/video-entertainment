import React, { PropsWithChildren } from 'react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';
import { blueGrey, orange } from '@material-ui/core/colors';

const theme = createMuiTheme({
  palette: {
    primary: blueGrey,
    secondary: orange,
    text: {
      primary: '#c9d1d9',
      secondary: '#8b949e',
    },
  },
});

function CustomThemeProvider(props: PropsWithChildren<any>) {
  return <ThemeProvider theme={theme}>{props.children}</ThemeProvider>;
}

export { CustomThemeProvider };
