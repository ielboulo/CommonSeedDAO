// const VoteProjectValidationPage = () => {
//   return <h1>VoteProjectValidationPage </h1>;
// };

// export default VoteProjectValidationPage;


import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid, Box, Card, CardContent, Typography } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { FormControl, RadioGroup, FormControlLabel, Radio } from '@mui/material';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import useEth from "../contexts/EthContext/useEth";
// const artifacts = [
//   require("../../contracts/ProjectInfo.json"),
//   require("../../contracts/VoteProjectValidation.json"),
//   require("../../contracts/FundraisingProject.json"),
//   require("../../contracts/VoteUnlockFunds.json"),
//   require("../../contracts/SeedToken.json"),
// ];

function VoteProjectValidationPage() {

  const { state: {accounts, contractsData, web3}} = useEth();
  const [isOwner, setIsOwner] = useState(false);
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    projectID: '',
  });
  const [formData2, setFormData2] = useState({ projectID_: 0, vote: "No" });

  const [projectToVote, setProjectToVote] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const phases = [
    "Voters Registeration Open", // 0
    "Voters Registeration Close", // 1
    "Voting Session Open", // 2
    "Voting Session Close",//3
    "Get Vote Results ", // 4
    "Session Closed", // 5
  ];


  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({ ...formData, [name]: value });
  };

  const handleChangeVote = (event) => {
    const { name, value } = event.target;
    console.log("handleChangeVote " , name , " => ", value);
    setFormData2({ ...formData2, [name]: value });
  };

  const handleVote = async (event) => {
    event.preventDefault();
    const { projectID_, vote } = formData2;
    console.log("handleVote projectToVote ", formData2.projectID_ , " vote ", formData2.vote);
    try { 
    const numProjects = await contractsData[0].contract.methods.getNumProjects().call();
    console.log("projectID_ > numProjects ", projectID_ > numProjects); 
      if(projectID_ > numProjects)
      {
        toast.error("ERROR : Project ID Invalid : "+ projectID_  , {
          closeButton: true,
          autoClose: true,
          position: 'top-center',
        });
        return;
      }
      // IEL : check project Id - Phase :
      const project_vote_phase = await contractsData[0].contract.methods.getVoteValidationStatus(projectID_).call({ from: accounts[0] });
      if(project_vote_phase >= 3)
      {
        toast.error("ERROR : Voting Session Closed !", {
          closeButton: true,
          autoClose: true,
          position: 'top-center',
        });
        return; 
      }

      // isEligibleVoter
      const isRegisteredVoter = await contractsData[1].contract.methods.isRegisteredVoter(projectID_, accounts[0]).call( { from: accounts[0] });
      console.log("isRegisteredVoter = ",isRegisteredVoter);
     if(! isRegisteredVoter)
      {
        toast.error("ERROR : Not iRegistered Voter !", {
          closeButton: true,
          autoClose: true,
          position: 'top-center',
        });
        return; 
      }

      console.log("project ",projectID_, "vote ", vote );
      const decision = (vote === "Yes" ? true : false); 
console.log("setVote decision" , decision, "projectID_ ", projectID_); 

      await contractsData[1].contract.methods
      .setVote(projectID_ , decision )
      .send( { from: accounts[0] })
      .then((receipt) => {
        console.log("Transaction hash:", receipt.transactionHash);
        console.log("Gas used:", receipt.gasUsed);
        toast.success("SUCCESS : Vote Successful! project : "+ projectID_+" voted "+ vote, {
          closeButton: true,
          autoClose: true,
          position: 'top-center',
        });
      })
      .catch((error) => {
        console.error("Transaction failed:", error);
        toast.error("ERROR : Vote Failed !", {
          closeButton: true,
          autoClose: true,
          position: 'top-center',
        });
      });

    }
    catch (err) 
    {
         console.error(err);
         toast.error("ERROR : Unknown error !", {
          closeButton: true,
          autoClose: true,
          position: 'top-center',
        });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const projectId = formData.projectID;
      const numProjects = await contractsData[0].contract.methods.getNumProjects().call();
      if(projectId > numProjects)
      {
        toast.error("ERROR : Project ID Invalid : "+ projectId  , {
          closeButton: true,
          autoClose: true,
          position: 'top-center',
        });
        return;
      }
      // IEL : check project Id - Phase :
      const project_vote_phase = await contractsData[0].contract.methods.getVoteValidationStatus(projectId).call({ from: accounts[0] });
      if(project_vote_phase >= 1)
      {
        toast.error("ERROR : Registration Session Closed !", {
          closeButton: true,
          autoClose: true,
          position: 'top-center',
        });
        return; 
      }

      const projectOWner = await contractsData[0].contract.methods.getProjectOwner(projectId).call();
      if(projectOWner === accounts[0])
      {
        toast.error("ERROR : Project Owners are Not Eligible Voters !", {
          closeButton: true,
          autoClose: true,
          position: 'top-center',
        });
        return; 
      }
      // isEligibleVoter
      const isEligibleVoter = await contractsData[1].contract.methods.isEligibleVoter(accounts[0]).call( { from: accounts[0] });
      console.log("isEligibleVoter = ",isEligibleVoter);
      if(! isEligibleVoter)
      {
        toast.error("ERROR : Not Enough Seed Tokens - Not Eligible Voters !", {
          closeButton: true,
          autoClose: true,
          position: 'top-center',
        });
        return; 
      }

      console.log("accounts[0] ", accounts[0]); 

      await contractsData[1].contract.methods
      .registerEligibleVoters(formData.projectID)
      .send( { from: accounts[0] })
      .then((receipt) => {
        console.log("Registration successful!");
        console.log("Transaction hash:", receipt.transactionHash);
        console.log("Gas used:", receipt.gasUsed);

        // emit an event :
        toast.success("SUCCESS : Registration Successful!", {
          closeButton: true,
          autoClose: true,
          position: 'top-center',
        });
      })
      .catch((error) => {
        console.error("Transaction failed:", error);
        toast.error("ERROR : Registration Failed !", {
          closeButton: true,
          autoClose: true,
          position: 'top-center',
        });
      });
    }
    catch (err) 
    {
         console.error(err);
         toast.error("ERROR : Unknown error !", {
          closeButton: true,
          autoClose: true,
          position: 'top-center',
        });
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

  const fetchProjects = async () => {
    const projects = [];

    if (contractsData && contractsData[0].artifact)
    {
      const numProjects = await contractsData[0].contract.methods.getNumProjects().call();
  
      for (let i = 1; i <= numProjects; i++) {
        const projectGI = await contractsData[0].contract.methods.projectsGI(i).call();
        const projectPI = await contractsData[0].contract.methods.projectsPI(i).call();

        const _voteValidationStatus = await contractsData[0].contract.methods.getVoteValidationStatus(i).call();
        //console.log("_voteValidationStatus", _voteValidationStatus);
        
        //if (parseInt(_voteValidationStatus) === 0)
        {
          projects.push({ ...projectGI, ...projectPI });
        }
        
      }
    }
    setProjects(projects);
  };
  useEffect(() => {
    fetchProjects();
  }, []); //, [setCurrentPhase] // IEL_UseEffect


  const handleProjectID = async (event) => {
    const { name, value } = event.target;
    console.log("project to vote = ", value);

    const numProjects = await contractsData[0].contract.methods.getNumProjects().call();
    console.log("numProjects = ", numProjects);
    if(parseInt(value) > numProjects)
    {
      console.log("value ", value, "numProjects = ", numProjects);
      toast.error("ERROR : Project ID Invalid : "+value , {
        closeButton: true,
        autoClose: true,
        position: 'top-center',
      });
      return;
    }
    setProjectToVote(value);
  };

  // useEffect(() => {
  //   handleProjectID();
  // }); //, []  


  ////// Handle Owner Status :
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

  useEffect(() => {
  async function getPhase() {
    if (contractsData) {
      const phase = await contractsData[0].contract.methods.getVoteValidationStatus(projectToVote).call({ from: accounts[0] });
      setCurrentPhase(parseInt(phase));
    }
  }
  getPhase();
}, [accounts, contractsData, currentPhase, projectToVote]);

  const handleChangePhase = async () => {
    console.log("handleChangePhase ", currentPhase);

    switch (currentPhase) {
      case 0:
        await contractsData[1].contract.methods.registerVotersClosing(projectToVote).send({ from: accounts[0] });
        setCurrentPhase(1);
        break;
      case 1:
        await contractsData[1].contract.methods.VotingSessionOpening(projectToVote).send({ from: accounts[0] });
        setCurrentPhase(2);
        break;
      case 2:
        await contractsData[1].contract.methods.VotingSessionClosing(projectToVote).send({ from: accounts[0] });
        setCurrentPhase(3);
        break;
      case 3:
        await contractsData[1].contract.methods.tallyVote(projectToVote).send({ from: accounts[0] });
        setCurrentPhase(4);
        break;
      default:
        break;
    }
  };



   return (
    <>
    <ToastContainer /> 
    <Typography gutterBottom variant="h3" align="center">
      Dashboard of projects open for Voters Registration     
    </Typography>
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650, maxWidth: 1050, padding: "20px 5px", margin: "0 auto",
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
            <TableCell sx={{fontSize: "12px", fontWeight: "bold", background: '#d3b638' }}>Whitepaper Link</TableCell>
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
              <TableCell><a href={project.whitepaperLink} target="_blank" rel="noreferrer">{project.whitepaperLink}</a></TableCell>

            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>

    <hr/>

  { isOwner && 
  
  <Grid>
  <Card style={{ maxWidth: 450, padding: "20px 5px", margin: "0 auto" }}>
    <CardContent>
    <Typography gutterBottom variant="h3" align="center" sx={{ background: '#d3b638' }}>
      Admin Panel
    </Typography>
    <Typography variant="h6" paragraph>
      Ochestrate Voting Session.
    </Typography> 

    <TextField
      type="number"
      label="Enter Project ID"
      placeholder="Project ID"
      variant="outlined"
      fullWidth
      required
      name="projectID"
      value={projectToVote}
      onChange={handleProjectID}
    />
    <br/> 
    <br/> 
    {
      projectToVote && 

      (        
      <Typography variant="h6" paragraph>
      Project = {projectToVote} current phase = {phases[currentPhase]} 
      </Typography>
    )
    }

    <br/> 
    {phases.map((phase, index) => {
        if (index === currentPhase + 1) {
          return (
            <Button                 
            sx={{fontSize: "12px", fontWeight: "bold"}}
            key={phase} 
            onClick={handleChangePhase}
            >
              Go2Next : {phases[currentPhase+1]}
             </Button>
          );
        }
      })}
      </CardContent>
    </Card>
  </Grid>

  
  }

<hr/>

    <div className="App">

    <Grid>
      <Card style={{ maxWidth: 450, padding: "20px 5px", margin: "0 auto" }}>
        <CardContent>
        <Typography gutterBottom variant="h3" align="center" sx={{ background: '#d3b638' }}>
          Voters Registration 
        </Typography>
        <Typography variant="h6" paragraph>
          Register yourself for the project that you want.
          <br/> Fill in with the project Id, and after then, click the button "Register".    
        </Typography> 
          <form>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <TextField type="number" label="Enter Project ID" placeholder="Project ID" 
                variant="outlined" fullWidth required 
                name="projectID"
                value={formData.projectID}
                onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" 
                color="primary" fullWidth
                onClick={handleSubmit}
                sx={{fontSize: "12px", fontWeight: "bold"}}
                > 
                Register
                </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Grid>
    </div>


    <hr/>

    <div className="App">
    <Grid>
    <Card style={{ maxWidth: 450, padding: "20px 5px", margin: "0 auto" }}>
      <CardContent>
        <Typography gutterBottom variant="h3" align="center" sx={{ background: '#d3b638' }}>
          Make Your Choice
        </Typography>
        <Typography variant="h6" paragraph>
          Register yourself for the project that you want.
          <br/> Fill in with the project Id and your vote (yes or no), and then click the button "Vote Now!".
        </Typography>
        <form>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <TextField
                type="number"
                label="Enter Project ID"
                placeholder="Project ID"
                variant="outlined"
                fullWidth
                required
                name="projectID_"
                value={formData2.projectID_}
                onChange={handleChangeVote}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" paragraph>
                Vote:
              </Typography>
              <FormControl component="fieldset" required>
                <RadioGroup aria-label="vote"  name="vote" value={formData2.vote} onChange={handleChangeVote}>
                  <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="No" control={<Radio />} label="No"  />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleVote}
                sx={{fontSize: "12px", fontWeight: "bold"}}
              >
                Vote Now!
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  </Grid>
</div>

<hr/>
    </>
  );
};
  export default VoteProjectValidationPage;


