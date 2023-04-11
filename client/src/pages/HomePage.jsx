import React from "react";
import { useState, useCallback } from "react"; 
import { Card, CardContent, Grid, Typography } from "@mui/material";

//import projectImage from "./Seed_Logo.png";

function HomePage()  {
  return (
    <Grid container spacing={2}>
      <Card style={{ maxWidth: 750, padding: "20px 5px", margin: "0 auto", justify: "center" }}>
        <CardContent> 
      <Grid item xs={12} md={6}>
        <Typography variant="h3" gutterBottom>
          The Common Seed DAO
        </Typography>
        <Typography variant="h6" paragraph>
        The Common Seed DAO is a groundbreaking decentralized platform designed to revolutionize project financing and governance. By harnessing the power of decentralization, we enable investors and project teams to collaborate in a transparent, secure, and efficient manner. 
        </Typography> <br/>
        <Typography variant="h5" paragraph>
        	Sow, Vote, Harvest: The Power of Decentralization
        </Typography>        
	<Typography variant="h6" paragraph>
        Our unique voting system ensures that funds are released in stages, based on project milestones, minimizing financial risks for investors. This approach deters fraudulent projects, allowing only genuine and serious projects to approach our DAO.
        </Typography>
        <br/>
	<Typography variant="h5" paragraph>
		Cultivating a Decentralized Future, Together
        </Typography>        
	<Typography variant="h6" paragraph>
        Through continuous monitoring of project progress and active involvement in decision-making, investors play a crucial role in shaping the future of financed projects. 
        </Typography> <br/>
        <Typography variant="h6" paragraph>
        The Common Seed DAO aims to create a thriving ecosystem where innovation flourishes, fostering sustainable growth and shared success for all stakeholders.
        </Typography>
      </Grid>
      </CardContent>
      </Card>
    </Grid>
  );
};

export default HomePage;
