import React from "react";
import { Link } from "react-router-dom";
import { AppBar, Toolbar, Button } from "@mui/material";



const MenuBar = () => {
  return (
    <AppBar position="static">
      <Toolbar>

        <Button         sx={{
            backgroundColor: "#d3b638",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "14px",
            height: "40px",
            width: "200px",
            "&:hover": {
              backgroundColor: "#a6a6a6",
            },
          }}
          component={Link} to="/" mr={2}>
          Home
        </Button>

        <Button  sx={{
            backgroundColor: "#d3b638",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "14px",
            height: "40px",
            width: "220px",
            "&:hover": {
              backgroundColor: "#a6a6a6",
            },
            ml: 2,
          }}
           component={Link} to="/project-info" mr={2}>
          Project Info
        </Button>

        <Button  sx={{
            backgroundColor: "#d3b638", // jaune doré 
            color: "#fff",
            fontWeight: "bold",
            fontSize: "14px",
            height: "40px",
            width: "260px",
            "&:hover": {
              backgroundColor: "#a6a6a6", // gris clair 
            },
            ml: 2,
          }}
           component={Link} to="/vote-project-validation">
          Vote Project Validation
        </Button>

        <Button  sx={{
            backgroundColor: "#d3b638", // jaune doré 
            color: "#fff",
            fontWeight: "bold",
            fontSize: "14px",
            height: "40px",
            width: "260px",
            "&:hover": {
              backgroundColor: "#a6a6a6", // gris clair 
            },
            ml: 2,
          }}
           component={Link} to="/vote-unlock-funds">
          Vote Unlock Funds
        </Button>

        <Button  sx={{
            backgroundColor: "#d3b638", // jaune doré 
            color: "#fff",
            fontWeight: "bold",
            fontSize: "14px",
            height: "40px",
            width: "260px",
            "&:hover": {
              backgroundColor: "#a6a6a6", // gris clair 
            },
            ml: 2,
          }}
           component={Link} to="/governance-token">
          Governance Token - SEED
        </Button>


      </Toolbar>
    </AppBar>
  );
};

export default MenuBar;
