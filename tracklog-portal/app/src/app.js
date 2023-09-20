import { createTheme, ThemeProvider } from '@mui/material/styles';
import routeMdw from './middleware/routes';
import { common } from '@mui/material/colors';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import { Routes, Route } from 'react-router-dom';

import ZonesPage from './pages/zones';

const mdTheme = createTheme({
    palette: {
        default: {
            main: common[500],
        }
    },
});

const routes = [
    { path: routeMdw.urlIndex(), name: 'Index', Component: <ZonesPage /> },
    /* { path: routeMdw.urlNodes(), name: 'Nodes', Component: NodesPage },
     { path: routeMdw.urlNode(":id"), name: 'Sensors', Component: NodePage },
     { path: routeMdw.urlZones(), name: 'Zones', Component: ZonesPage },*/
]

function App(props) {

    return <ThemeProvider theme={mdTheme}>
        <CssBaseline />
        <Container sx={{ paddingTop: "32px" }}>
            <Routes>
                {routes.map(({ path, Component }) => (
                    <Route path={path} key={path} element={Component} />
                ))}
            </Routes>
        </Container>
    </ThemeProvider>;
}


export default App;