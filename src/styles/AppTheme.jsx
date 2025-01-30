import { useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';


function AppTheme({ children }) {
    const theme = useMemo(() => {
        return createTheme({
            typography: {
                fontFamily: ['Poppins'].join(','),
            }
        });
    }, []);

    return (
        <ThemeProvider theme={theme} disableTransitionOnChange>
            <CssBaseline enableColorScheme />
            {children}
        </ThemeProvider>
    );
}

export default AppTheme;






