import React from "react";
import { useState, useCallback } from "react"; 
import { Card, CardContent, Grid, Typography } from "@mui/material";

//import projectImage from "./Seed_Logo.png";
//          <Grid item xs={12} md={6}>
//style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
/**
 * 
 * @returns       <Card >
        <CardContent> 
              </CardContent>
      </Card>
 */
function HomePage()  {
  return (
    <div class="background-container" style={{ display: "flex", alignItems: "stretch" }}>
    <Grid container spacing={1} style={{ maxWidth: 850, padding: "20px 5px", margin: "0 auto", justify: "center" }}>
      <Grid item xs={12} md={6}>
        <Card >
          <CardContent> 
            <Typography variant="h3" gutterBottom style={{ fontWeight: "bold" }}>
                The Common Seed DAO
              </Typography>
              <Typography variant="h6" paragraph>
                The Common Seed DAO is a groundbreaking decentralized platform designed to revolutionize project financing and governance. By harnessing the power of decentralization, we enable investors and project teams to collaborate in a transparent, secure, and efficient manner. 
              </Typography> <br/>
              <Typography variant="h5" paragraph style={{ fontWeight: "bold" }}>
                Sow, Vote, Harvest: The Power of Decentralization
              </Typography>        
              <Typography variant="h6" paragraph>
                Our unique voting system ensures that funds are released in stages, based on project milestones, minimizing financial risks for investors. This approach deters fraudulent projects, allowing only genuine and serious projects to approach our DAO.
              </Typography>
              <br/>
              <Typography variant="h5" paragraph style={{ fontWeight: "bold" }}>
                Cultivating a Decentralized Future, Together
              </Typography>        
              <Typography variant="h6" paragraph>
                Through continuous monitoring of project progress and active involvement in decision-making, investors play a crucial role in shaping the future of financed projects. 
              </Typography>
              <Typography variant="h6" paragraph>
                The Common Seed DAO aims to create a thriving ecosystem where innovation flourishes, fostering sustainable growth and shared success for all stakeholders.
              </Typography>
              <div style={{ textAlign: "center" }}>
              <Typography variant="h4" gutterBottom style={{ fontWeight: "bold" }}>
              Common Seed DAO <br/> Planting the Seeds of <br/> a Decentralized Tomorrow
              </Typography>
              </div>

            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card >
            <CardContent> 
              <img 
                src="../seed_2.png" 
                alt="test image"
                style={{
                  maxWidth: "100%",
                  height: "auto"
                }}
              />
            </CardContent>
          </Card >
        </Grid>
      </Grid>
    </div>
  );
};

export default HomePage;
