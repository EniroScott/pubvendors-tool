import React, { Component } from 'react';
import { ThemeProvider } from '@material-ui/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { SnackbarProvider } from 'material-ui-snackbar-provider';
import theme from './theme';
import App from './App';

class Root extends Component {
    render() {
        return (
            <SnackbarProvider SnackbarProps={{ autoHideDuration: 4000 }}>
                <ThemeProvider theme={theme}>
                    <CssBaseline/>
                    <App/>
                </ThemeProvider>
            </SnackbarProvider>
        );
    }
}

export default Root;
