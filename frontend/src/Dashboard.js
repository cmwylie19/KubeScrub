import * as React from 'react';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { amber, red, blue, grey, green } from '@mui/material/colors';
import { mainListItems, secondaryListItems } from './listItems';
import Chart from './Chart';
import Deposits from './Pie';
import Orders from './Results';
import Config from "./Config"
import Login from './Login';
import { fetchConfig } from "./helpers"

const Div = styled('div')(({ theme }) => ({
  ...theme.typography.button,
  padding: theme.spacing(0),
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  width: '100%',
  color: theme.palette.secondary.main,
  fontWeight: 'bold',
}));


const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(9),
        },
      }),
    },
  }),
);



const getDesignTokens = (mode) => ({
  palette: {
    mode,
    primary: {
      ...amber,
      ...(mode === 'light' && {
        main: grey[500]
      }),
    },
    secondary: {
      ...green,
      ...(mode === 'light' && {
        main: blue[500]
      }),
    },
    ...(mode === 'dark' && {
      // background: {
      //   default: deepOrange[900],
      //   paper: deepOrange[900],
      // },
    }),
    text: {
      ...(mode === 'light'
        ? {
          primary: grey[900],
          secondary: grey[800],
        }
        : {
          primary: '#fff',
          secondary: grey[500],
        }),
    },
  },
});

function DashboardContent() {
  const [open, setOpen] = React.useState(true);
  const [mode, setMode] = React.useState('dark');
  const [pw, setPW] = React.useState('')
  const [resource, setResource] = React.useState("all")
  const [namespace, setNamespace] = React.useState("all")

  const toggleDrawer = () => {
    setOpen(!open);
  };

  React.useEffect(() => {
    fetchConfig().then((config) => {
      setMode(config.theme)
    })
  }, [])

  return (
    <ThemeProvider theme={createTheme(getDesignTokens(mode))}>
      <CssBaseline />
      {pw === '' ? <Box sx={{ display: 'flex' }}>


        <AppBar position="absolute" open={open}>
          <Toolbar
            sx={{
              pr: '24px', // keep right padding when drawer closed
            }}
          >
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{
                marginRight: '36px',
                ...(open && { display: 'none' }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              component="h1"
              variant="h6"
              color="primary.light"
              fontWeight="bold"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              {resource}:{namespace}
            </Typography>
            <IconButton color="inherit">

              <Config />

            </IconButton>
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={open}>
          <Toolbar
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: (theme) => theme.palette.dark,
              boxShadow: (theme) => theme.shadows[3],
              px: [1],
            }}
          >
            <IconButton onClick={toggleDrawer} sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Div>KubeScrub

              </Div>      <div style={{ fontSize: "10px" }}>v0.0.1</div>

            </IconButton>

          </Toolbar>
          <Divider />
          <List component="nav">
            {mainListItems}
            <Divider sx={{ my: 1 }} />
            {secondaryListItems}
          </List>
        </Drawer>
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
          }}
        >
          <Toolbar />
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>

              {/* Recent Deposits */}
              <Grid item xs={12}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    height: 340,
                  }}
                >
                  <Deposits />
                </Paper>
              </Grid>
              {/* Recent Orders */}
              <Grid item xs={12}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                  <Orders />
                </Paper>
              </Grid>
            </Grid>
          
          </Container>
        </Box>
      </Box> : <Login setPW={setPW} />}
    </ThemeProvider>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}
