import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  palette: {
    primary: { main: '#0A6E79' },
    secondary: { main: '#2C3E50' },
    background: { default: '#F5F7FA', paper: '#FFFFFF' },
  },
});