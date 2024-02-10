import * as React from 'react';
import { BrowserRouter, Routes, Route, Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography } from '@mui/material';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import UserManagePage from './pages/UserManagePage';
import NoPage from './pages/NoPage';
import AnaylzePage from './pages/AnaylzePage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <div>
      <BrowserRouter>
        <AppBar position="static" style={{backgroundColor: '#006093'}}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} >
            Network Analyzer - yair elad
            </Typography>
            <RouterLink to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              Home
            </RouterLink>
            {/* once i figure out how to control the access of a page then ill render based on the role */}
            {/* <RouterLink to="/login" style={{ textDecoration: 'none', color: 'inherit', marginLeft: '20px' }}>
              Login
            </RouterLink>
            <RouterLink to="/users" style={{ textDecoration: 'none', color: 'inherit', marginLeft: '20px' }}>
              Users
            </RouterLink> */}
          </Toolbar>
        </AppBar>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/analyze" element={<AnaylzePage/>}/>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/users" element={<UserManagePage />} />
          <Route path="/signup" element={<RegisterPage />}/>
          <Route path="*" element={<NoPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;


// import * as React from 'react';
// import { BrowserRouter, Routes, Route, Link as RouterLink } from 'react-router-dom';
// import { AppBar, Toolbar, Typography, Container } from '@mui/material';
// import HomePage from './pages/HomePage';
// import LoginPage from './pages/LoginPage';
// import UserManagePage from './pages/UserManagePage';
// import NoPage from './pages/NoPage';

// function App() {
//   return (
//     <div>
//       <BrowserRouter>
//         <AppBar position="static" style={{"position": "fixed", "top": 0, "left": 0, "width": "100%", "zIndex": "1000" }}>
//           <Toolbar>
//             <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
//               Network Analyzer - yair elad
//             </Typography>
//             <RouterLink to="/" style={{ "textDecoration": 'none', color: 'inherit' }}>
//               Home
//             </RouterLink>
            
//             <RouterLink to="/login" style={{ textDecoration: 'none', color: 'inherit', marginLeft: '20px' }}>
//               Login
//             </RouterLink>
            
//             <RouterLink to="/users" style={{ textDecoration: 'none', color: 'inherit', marginLeft: '20px' }}>
//               Users
//             </RouterLink>
//           </Toolbar>
//         </AppBar>
//           <Routes>
//             <Route path="/" element={<HomePage />} />
//             <Route path="/login" element={<LoginPage />} />
//             <Route path="/users" element={<UserManagePage />} />
//             <Route path="*" element={<NoPage />} />
//           </Routes>
//       </BrowserRouter>
//     </div>
//   );
// }

// export default App;


// /* 

//           <AppBar position="static" >
//           <Container maxWidth="xl">
//             <button>click 1</button>
//             <button>click 2</button>
//             <button>click 3</button>
//             <button>click 4</button>
//           </Container>
//           </AppBar>
// */