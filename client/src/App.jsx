import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AppBar, Box, Toolbar, Typography, Grid } from "@mui/material";
import { createTheme, ThemeProvider } from '@mui/material/styles';

import HomePage from "./pages/HomePage";
import ProjectInfoPage from './pages/ProjectInfoPage';
import VoteProjectValidationPage from './pages/VoteProjectValidationPage';
import VoteUnlockFundsPage from "./pages/VoteUnlockFundsPage";
import GovernanceTokenPage from "./pages/GovernanceTokenPage";
import FundraisingProjectPage from "./pages/FundraisingProjectPage"

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
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
              }}
            >
              <Box sx={{ flex: "1" }}>
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
                      <Route
                        path="/vote-project-validation"
                        element={<VoteProjectValidationPage />}
                      />
                      <Route
                        path="/collect-funds"
                        element={<FundraisingProjectPage />}
                      />
                      <Route
                        path="/vote-unlock-funds"
                        element={<VoteUnlockFundsPage />}
                      />
                      <Route
                        path="/governance-token"
                        element={<GovernanceTokenPage />}
                      />
                    </Routes>
                  </Grid>
                </Grid>
              </Box>

              <Footer />
            </Box>
          </Router>
        </AppProvider>
      </ThemeProvider>
    </EthProvider>
  );
}

export default App;



