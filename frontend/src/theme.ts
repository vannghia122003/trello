import { experimental_extendTheme as extendTheme } from '@mui/material/styles'

const theme = extendTheme({
  colorSchemes: {
    light: {},
    dark: {}
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 768,
      lg: 1024,
      xl: 1280
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          '*::-webkit-scrollbar': {
            width: ' 8px',
            height: ' 8px'
          },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: '#dcdde1',
            borderRadius: '8px'
          },
          '*::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'white'
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderWidth: '0.5px',
          '&:hover': { borderWidth: '0.5px' }
        }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { fontSize: '0.875rem' }
      }
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          // '&.MuiTypography-body1': { fontSize: '0.875rem' }
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontSize: '0.875rem',
          '& fieldset': { borderWidth: '0.5px' },
          '&:not(.Mui-error):hover .MuiOutlinedInput-notchedOutline': {
            borderColor: `${theme.palette.primary.main}`
          },
          '&.Mui-focused fieldset': { borderWidth: '1px' }
        })
      }
    }
  }
})

export default theme
