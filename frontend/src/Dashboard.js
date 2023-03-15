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
import ListSubheader from '@mui/material/ListSubheader';
import LayersIcon from '@mui/icons-material/Layers';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import MenuIcon from '@mui/icons-material/Menu';
import { amber, red, blue, grey, green } from '@mui/material/colors';
import Pie from './PieLayout';
import TableResources from './TableResources';
import Config from "./Config"
import { fetchConfig,configHydration, fetchConfigMaps, fetchSecrets, fetchServiceAccounts } from "./helpers"

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

const MassagePieData = data => {
  let count = 0
  Array.isArray(data) && data.map((item) => item.exists === false && count++)
  let tempData = [{
    name: 'Used',
    value: Array.isArray(data) ? data.length - count : 0
  }, {
    name: 'Orphaned',
    value: count
  }]
  return tempData
}

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    primary: {
      ...amber,
      ...(mode === 'light' && {
        main: grey[800]
      }),
    },
    secondary: {
      ...green,
      ...(mode === 'light' && {
        main: blue[500]
      }),
    },
    ...(mode === 'dark' && {
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
  const [cm, setCM] = React.useState([])
  const [poll, setPoll] = React.useState(false)
  const [pollInterval, setPollInterval] = React.useState(null)
  const [sa, setSA] = React.useState([])
  const [secret, setSecret] = React.useState([])
  const [resources, setResources] = React.useState([])
  const [namespaces, setNamespaces] = React.useState([])
  const [namespace, setNamespace] = React.useState("All")
  const [resource, setResource] = React.useState("All")


  const decideData = (cm, secret, sa, resources, namespace) => {
    if (resources === "All") {
      if (namespace != "All") {
        cm = cm.filter((item) => item.namespace === namespace)
        secret = secret.filter((item) => item.namespace === namespace)
        sa = sa.filter((item) => item.namespace === namespace)
      }
      return [...cm, ...secret, ...sa]
    }
    else if (resources === "ConfigMap") {
      if (namespace != "All") {
        cm = cm.filter((item) => item.namespace === namespace)
      }
      return cm
    }
    else if (resources === "Secret") {
      if (namespace != "All") {
        secret = secret.filter((item) => item.namespace === namespace)
      }
      return secret
    }
    else if (resources === "ServiceAccount") {
      if (namespace != "All") {
        sa = sa.filter((item) => item.namespace === namespace)
      }
      return sa
    }

  }
  const toggleDrawer = () => {
    setOpen(!open);
  };

  React.useEffect(() => {
     fetchConfig().then((config) => {
      console.log(config, undefined, 2)
      setNamespaces(config.namespaces == [] ? "All" : config.namespaces)
      setResources(config.watch)
      
      // if (resources.includes("ConfigMap")) {
      //   fetchConfigMaps().then((data) => {
      //     setCM(data)
      //   })
      // }
      // if(resources.includes("Secret")) {
      //   fetchSecrets().then((data) => {
      //     setSecret(data)
      //   })
      // }
      // if (resources.includes("ServiceAccount")) {
      //   fetchServiceAccounts().then((data) => {
      //     setSA(data)
      //   })
      // }

      setPoll(config.poll)
      setPollInterval(config['poll-interval'])
      setMode(config.theme)

      configHydration(poll, pollInterval, resources, setCM, setSecret, setSA)
    })

  }, [poll,pollInterval])

  return (
    <ThemeProvider theme={createTheme(getDesignTokens(mode))}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
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
              <Config mode={mode} poll={poll} pollInterval={pollInterval} resources={resources} namespaces={namespaces} />
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
              <Div>
                KubeScrub
              </Div>
              <div style={{ fontSize: "10px" }}>v0.0.1</div>
            </IconButton>
          </Toolbar>
          <Divider />
          <List component="nav">
            <ListSubheader component="div" inset >
              Resource
            </ListSubheader>
            <ListItemButton onClick={() => setResource("All")}>
              <ListItemIcon>
                <LayersIcon />
              </ListItemIcon>
              <ListItemText primary="All" />
            </ListItemButton>
            {Array.isArray(resources) && resources.map((r,i) => {
              return (
                <ListItemButton key={i} onClick={() => setResource(r)}>
                  <ListItemIcon>
                    <LayersIcon />
                  </ListItemIcon>
                  <ListItemText primary={r} />
                </ListItemButton>
              )
            }
            )}
            <Divider sx={{ my: 1 }} />
            <ListSubheader component="div" inset>
              Namespaces
            </ListSubheader>
            <ListItemButton onClick={() => setNamespace("All")}>
              <ListItemIcon>
                <LayersIcon />
              </ListItemIcon>
              <ListItemText primary="All" />
            </ListItemButton>
            {Array.isArray(namespaces) && namespaces.map((r,i) => {
              return (
                <ListItemButton onClick={() => setNamespace(r)} key={i}>
                  <ListItemIcon>
                    <LayersIcon />
                  </ListItemIcon>
                  <ListItemText primary={r} />
                </ListItemButton>
              )
            }
            )}
            {/* <ListItemButton>
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
            </ListItemButton> */}
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
                    p: 1,
                    margin: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    height: 340,
                  }}
                >
                  <Pie data={MassagePieData(decideData(cm, secret, sa, resource, namespace))} />
                </Paper>
              </Grid>
              {/* TableResources */}
              <Grid item xs={12}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                  <TableResources data={decideData(cm, secret, sa, resource, namespace)} />
                </Paper>
              </Grid>
            </Grid>

          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}
