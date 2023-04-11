import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";

const Footer = () => {
  return (
    <AppBar position="static">
      <Toolbar  sx={{ flexGrow: 1 }}>
        <Typography variant="body1" component="div" align="center" sx={{ width: "100%" }} >
        Common Seed DAO - Planting the Seeds of a Decentralized Tomorrow - CopyRight@2023
	</Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Footer;
