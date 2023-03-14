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
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import ListSubheader from '@mui/material/ListSubheader';
import LayersIcon from '@mui/icons-material/Layers';
import AssignmentIcon from '@mui/icons-material/Assignment';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { amber, red, blue, grey, green } from '@mui/material/colors';
import Pie from './PieLayout';
import TableResources from './TableResources';
import Config from "./Config"
import Login from './Login';
import { fetchConfig, fetchConfigMaps, fetchSecrets } from "./helpers"

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
  const [cm,setCM]=React.useState([])
  const [secret,setSecret]=React.useState([])
  const [resources, setResources] = React.useState("all")
  const [namespaces, setNamespaces] = React.useState("all")
  const [resource, setResource] = React.useState("all")
  const [namespace, setNamespace] = React.useState("all")

  const decideData = (cm,secret, resources) => {
    if (resources === "all") {
      return cm.concat(secret)
    }
    else if (resources === "CMs") {
      return cm
    }
    else if (resources === "Secrets") {
      return secret
    }

  }
  const toggleDrawer = () => {
    setOpen(!open);
  };

  React.useEffect(() => {
    fetchSecrets().then((data) => {
      data.items.map((item) => item.kind = "Secret")
      setSecret(data.items)
    })
    fetchConfigMaps().then((data) => {
      data.items.map((item) => item.kind = "ConfigMap")
      setCM(data.items)
    })
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
              {resources}:{namespaces}
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
          <ListSubheader component="div" inset >
      Resource
    </ListSubheader>
    <ListItemButton onClick={()=>setResources("All")}>
      <ListItemIcon>
        <LayersIcon />
      </ListItemIcon>
      <ListItemText primary="All" />
    </ListItemButton>
    <ListItemButton onClick={()=>setResources("SAs")}>
      <ListItemIcon>
        <DashboardIcon />
      </ListItemIcon>
      <ListItemText primary="Service Accounts" />
    </ListItemButton>
    <ListItemButton onClick={()=>setResources("CMs")}>
      <ListItemIcon>
        <ShoppingCartIcon />
      </ListItemIcon>
      <ListItemText primary="Config Maps" />
    </ListItemButton>
    <ListItemButton onClick={()=>setResources("SVCs")}>
      <ListItemIcon>
        <PeopleIcon />
      </ListItemIcon>
      <ListItemText primary="Services" />
    </ListItemButton>
    <ListItemButton  onClick={()=>setResources("Secrets")}>
      <ListItemIcon>
        <BarChartIcon />
      </ListItemIcon>
      <ListItemText primary="Secrets" />
    </ListItemButton>
            <Divider sx={{ my: 1 }} />
            <ListSubheader component="div" inset>
      Namespaces
    </ListSubheader>
    <ListItemButton>
      <ListItemIcon>
        <LayersIcon />
      </ListItemIcon>
      <ListItemText primary="All" />
    </ListItemButton>
    <ListItemButton>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary="default" />
    </ListItemButton>
    <ListItemButton>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary="kube-system" />
    </ListItemButton>
    <ListItemButton>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary="kubefs" />
    </ListItemButton>
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
                  <Pie data={cm} />
                </Paper>
              </Grid>
              {/* TableResources */}
              <Grid item xs={12}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                  <TableResources data={decideData(cm,secret,resources)} />
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
