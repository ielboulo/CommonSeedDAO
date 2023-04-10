import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid, Box, Card, CardContent, Typography } from '@mui/material';
import { AddBox } from '@mui/icons-material';
import useEth from "../contexts/EthContext/useEth";

function ProjectForm() {

  const { state: {accounts, contractsData, web3}} = useEth();
  const [isOwner, setIsOwner] = useState(false);

  const [formData, setFormData] = useState({
    projectOwner: '',
    projectTitle: '',
    goalAmount: '',
    totalPhases: '',
    fundraisingDeadline: '',
    minContribution: ''
  });

  useEffect(() => {
    async function getOwner() {
      if (contractsData && contractsData[0].artifact) {
        const owner = await contractsData[0].contract.methods.owner().call({ from: accounts[0] });
        accounts[0] === owner ? setIsOwner(true) : setIsOwner(false);
      }
    }
    getOwner();
  }, [accounts, contractsData]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "projectOwner" && !web3.utils.isAddress(value)) {
      alert("Address not valid");
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if(formData.projectOwner && formData.projectTitle && formData.goalAmount &&
        formData.totalPhases && formData.fundraisingDeadline && formData.minContribution )
      {
        const deadlineTimestamp = Date.parse(formData.fundraisingDeadline) / 1000;
        await contractsData[0].contract.methods.addProject(formData.projectOwner, formData.projectTitle, formData.goalAmount,
          formData.totalPhases, deadlineTimestamp, formData.minContribution).send({from : accounts[0]});
      }
      else {
        alert("WARNING : All Mandatory fields should be filled ! "); 
      }

    } 
    catch (err) 
    {
         console.error(err);
    }
  };

   return (
    isOwner  && (
    <div className="App"> 
    <Typography gutterBottom variant="h3" align="center">
      Add Project Details - Admin
     </Typography>
    <Grid>
      <Card style={{ maxWidth: 450, padding: "20px 5px", margin: "0 auto" }}>
        <CardContent>
          <Typography gutterBottom variant="h5">
            Project Details
        </Typography> 
          <Typography variant="body2" color="textSecondary" component="p" gutterBottom>
            Fill up the form with project details.
        </Typography> 
          <form>
            <Grid container spacing={1}>
              <Grid xs={12} sm={6} item>
                <TextField required label="Enter Project Owner Address" placeholder="Project Owner" 
                variant="outlined" fullWidth
                name="projectOwner" 
                value={formData.projectOwner}
                onChange={handleChange}/>
              </Grid>
              <Grid xs={12} sm={6} item>
                <TextField label="Enter Project Title" placeholder="Project Title" 
                variant="outlined" fullWidth required 
                name="projectTitle"
                value={formData.projectTitle}
                onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField type="number" label="Enter Goal Amount" placeholder="Goal Amount" 
                variant="outlined" fullWidth required 
                name="goalAmount"
                value={formData.goalAmount}
                onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField type="number" label="Enter Total Phases" placeholder="Total Phases" 
                variant="outlined" fullWidth required
                name="totalPhases"
                value={formData.totalPhases}
                onChange={handleChange}
                 />
              </Grid>
              <Grid item xs={12}>
                <TextField type="number" label="Enter Min Contribution Per Investor" placeholder="Min Contribution" 
                variant="outlined" fullWidth required 
                name="minContribution"
                value={formData.minContribution}
                onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField type="date" label="Enter Fundraising Deadline" placeholder="Fundraising Deadline" 
                variant="outlined" fullWidth required   
                InputLabelProps={{
                  shrink: true
                }}
                name="fundraisingDeadline"
                value={formData.fundraisingDeadline}
                onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField type="url" label="Enter link to whitepaper" placeholder="Whitepaper" 
                variant="outlined" fullWidth 
                />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" 
                color="primary" fullWidth
                value={formData.fundraisingDeadline}
                onClick={handleSubmit}
                > Submit
                </Button>
              </Grid>

            </Grid>
          </form>
        </CardContent>
      </Card>
    </Grid>
  </div>
   )

  );
};
  export default ProjectForm;
