import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid, Box, Card, CardContent, Typography } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import useEth from "../contexts/EthContext/useEth";

function ProjectForm() {

  const { state: {accounts, contractsData, web3}} = useEth();
  const [isOwner, setIsOwner] = useState(false);
  const [projects, setProjects] = useState([]);

  const [formData, setFormData] = useState({
    projectOwner: '',
    projectTitle: '',
    goalAmount: '',
    totalPhases: '',
    fundraisingDeadline: '',
    minContribution: ''
  });


  const fetchProjects = async () => {
    const projects = [];

    //if (contractsData && contractsData[0].artifact)
    {
      const numProjects = await contractsData[0].contract.methods.getNumProjects().call();
  
      for (let i = 1; i <= numProjects; i++) {
        const projectGI = await contractsData[0].contract.methods.projectsGI(i).call();
        const projectPI = await contractsData[0].contract.methods.projectsPI(i).call();
        projects.push({ ...projectGI, ...projectPI });
      }
    }

    setProjects(projects);
  };

  useEffect(() => {
    fetchProjects();
  }); // , []

  // IsOwner
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
        toast.success("SUCCESS : Project Added Sucessfully !", {
          closeButton: true,
          autoClose: true,
          position: 'top-center',
        });

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

  const VoteValidationStatus = {
    0: 'RegisterVotersOpen',
    1: 'RegisterVotersClose',
    2: 'VotingSessionOpen',
    3: 'VotingSessionClose',
    4: 'ProjectAccepted',
    5: 'ProjectRejected',
  };

  const  FundraisingStatus = {
    0: 'FundraisingPhaseOpen',
    1: 'FundraisingPhaseClosed',
    2: 'FundraisingSuccessful',
    3: 'FundraisingFailed',
    4: 'WithdrawalPhaseOpen',
    5: 'WithdrawalPhaseClosed',
};

   return (
    <>
    <Typography gutterBottom variant="h3" align="center">
      Projects Dashboard 
     </Typography>
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650, maxWidth: 1550, padding: "20px 5px", margin: "0 auto",
            fontSize: "1.2rem", 
            fontFamily: "Arial,sans-serif" 
          }} aria-label="projects table">
        <TableHead>
          <TableRow sx={{fontSize: "12px", fontWeight: "bold", background: '#d3b638' }}> 
            <TableCell sx={{fontSize: "12px", fontWeight: "bold", background: '#d3b638' }} >Project ID</TableCell>
            <TableCell sx={{fontSize: "12px", fontWeight: "bold", background: '#d3b638' }}>Project Owner</TableCell>
            <TableCell sx={{fontSize: "12px", fontWeight: "bold", background: '#d3b638' }}>Project Title</TableCell>
            <TableCell sx={{fontSize: "12px", fontWeight: "bold", background: '#d3b638' }}>Goal Amount</TableCell>
            <TableCell sx={{fontSize: "12px", fontWeight: "bold", background: '#d3b638' }}>Vote Validation Status</TableCell>
            <TableCell sx={{fontSize: "12px", fontWeight: "bold", background: '#d3b638' }}>Fundraising Status</TableCell>
            <TableCell sx={{fontSize: "12px", fontWeight: "bold", background: '#d3b638' }}>Total Raised</TableCell>
            <TableCell sx={{fontSize: "12px", fontWeight: "bold", background: '#d3b638' }}>Total Unlocked</TableCell>
            <TableCell sx={{fontSize: "12px", fontWeight: "bold", background: '#d3b638' }}>Remaining Funds</TableCell>
            <TableCell sx={{fontSize: "12px", fontWeight: "bold", background: '#d3b638' }}>Number of Investors</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {projects.map((project, index) => (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{project.projectOwner}</TableCell>
              <TableCell>{project.projectTitle}</TableCell>
              <TableCell>{project.goalAmount}</TableCell>
              <TableCell>{VoteValidationStatus[project.voteValidationStatus]}</TableCell>
              <TableCell>{FundraisingStatus[project.fundraisingStatus]}</TableCell>
              <TableCell>{project.totalRaised}</TableCell>
              <TableCell>{project.totalUnlocked}</TableCell>
              <TableCell>{project.remainingFunds}</TableCell>
              <TableCell>{project.numberOfInvestors}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>

    <hr/>
    { isOwner  && (
    <div className="App">
    <ToastContainer /> 
    <Typography gutterBottom variant="h3" align="center" sx={{ background: '#d3b638' }}>
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
    )}

    </>
    


  );
};
  export default ProjectForm;
