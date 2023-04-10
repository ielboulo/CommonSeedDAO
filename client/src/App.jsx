import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AppBar, Box, Toolbar, Typography, Grid } from "@mui/material";
import { createTheme, ThemeProvider } from '@mui/material/styles';

import HomePage from "./pages/HomePage";
import ProjectInfoPage from './pages/ProjectInfoPage';
import VoteProjectValidationPage from './pages/VoteProjectValidationPage';
import VoteUnlockFundsPage from "./pages/VoteUnlockFundsPage";
import GovernanceTokenPage from "./pages/GovernanceTokenPage";

import MenuBar from "./components/MenuBar";
import Footer from "./components/Footer";
import Header from "./components/Header";

import { EthProvider } from './contexts/EthContext';
import { AppProvider } from './contexts/AppContext';

let theme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          background: '#d3b638'
        }
      }
    }
  },
  palette: {
    primary: {
      main: '#012b29'
    }
  }
});

function App() {
  return (
    <EthProvider>
      <ThemeProvider theme={theme}>
      <AppProvider>
        <Router>
          <Box>
          <Grid container spacing={2}>

          <Grid item xs={12}>
                <Header />
            </Grid>

            <Grid item xs={12}>
              <MenuBar />
            </Grid>

            <Grid item lg={12}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/project-info" element={<ProjectInfoPage />} />
              <Route path="/vote-project-validation" element={<VoteProjectValidationPage />} />
              <Route path="/vote-unlock-funds" element={<VoteUnlockFundsPage />} />
              <Route path="/governance-token" element={<GovernanceTokenPage />} />
            </Routes>
            </Grid>

            <Grid item xs={12}>
                <Footer />
            </Grid>

            </Grid>
          </Box>
        </Router>
      </AppProvider>
      </ThemeProvider>
    </EthProvider>

  );
}

export default App;




// import { EthProvider } from "./contexts/EthContext";
// import React from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// import HomePage from './pages/HomePage';
// import ProjectInfoPage from './pages/ProjectInfoPage';
// import VoteProjectValidationPage from './pages/VoteProjectValidationPage';
// import FundraisingProjectPage from './pages/FundraisingProjectPage';
// import Layout from "./pages/Layout";
// import Footer from "./components/Footer";

// function App() {
//   return (
//     <Router>
//       <EthProvider>
//         <div className="App_">
//           <Layout />
//           <main className="main-content">
//             <Routes>
//               <Route index path="/" element={<HomePage />} />
//               <Route path="/project-info" element={<ProjectInfoPage />} />
//               <Route path="/vote-project-validation" element={<VoteProjectValidationPage />} />
//               <Route path="/Fundraising-Project" element={<FundraisingProjectPage />} />
//             </Routes>
//           </main>
//           <Footer />
//         </div>
//       </EthProvider>
//     </Router>
//   );
// }

// export default App;


// import { EthProvider } from "./contexts/EthContext";
// import React from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// import HomePage from './pages/HomePage';
// import ProjectInfoPage from './pages/ProjectInfoPage';
// import VoteProjectValidationPage from './pages/VoteProjectValidationPage';
// import FundraisingProjectPage from './pages/FundraisingProjectPage';
// import Layout from "./pages/Layout";
// import Footer from "./components/Footer";

// function App() {
//   return (
//     <Router>
//       <EthProvider>
//         <div className="App_">
//           <Routes>
//             <Route
//               path="/"
//               element={
//                 <div className="layout">
//                 <Layout>
//                   <Route index element={<HomePage />} />
//                   <Route path="/project-info" element={<ProjectInfoPage />} />
//                   <Route path="/vote-project-validation" element={<VoteProjectValidationPage />} />
//                   <Route path="/Fundraising-Project" element={<FundraisingProjectPage />} />
//                 </Layout>
//                 </div>
//               }
//             />
//           </Routes>
//           <Footer />
//         </div>
//       </EthProvider>
//     </Router>
//   );
// }

// export default App;

// // import { EthProvider } from "./contexts/EthContext";
// // import React from 'react';
// // import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// // //import { CssBaseline } from '@mui/material'; //      // <CssBaseline />

// // import HomePage from './pages/HomePage';
// // import ProjectInfoPage from './pages/ProjectInfoPage';
// // import VoteProjectValidationPage from './pages/VoteProjectValidationPage';
// // import FundraisingProjectPage from './pages/FundraisingProjectPage';
// // //import VoteUnlockFundsPage from './pages/VoteUnlockFundsPage';
// // //import ExecutePartialUnlockPage from './pages/ExecutePartialUnlockPage';
// // import Layout from "./pages/Layout";
// // import Footer from "./components/Footer";


// // function App() {
// //   return (
// //     <Router>
// //       <EthProvider>
// //         <div className="App"> 
// //           <Routes>
// //             <Route path="/" element={<Layout />}>
// //               <Route index element={<HomePage />} />
// //               <Route path="/project-info" element={<ProjectInfoPage />} />
// //               <Route path="/vote-project-validation" element={<VoteProjectValidationPage />} />
// //               <Route path="/Fundraising-Project" element={<FundraisingProjectPage />} />
// //             </Route>
// //           </Routes>
// //           <Footer />
// //         </div>
// //       </EthProvider>
// //     </Router>
// //   );
// // }

// // export default App;
