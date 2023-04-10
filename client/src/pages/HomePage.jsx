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

/* <Grid item xs={12} md={6}>
<img src={projectImage} alt="Project Image" style={{ width: "100%" }} />
</Grid> */
// const Home = () => {
//     return <h1>Home</h1>;
//   };
  
//   export default Home;

// import { useState, useCallback } from "react"; 
//  import ReactDOM from "react-dom/client";
//   import Todos from "./Todos";
  
//   const HomePage = () => {
//     const [count, setCount] = useState(0);
//     const [todos, setTodos] = useState([]);
  
//     const increment = () => {
//       setCount((c) => c + 1);
//     };
//     // const addTodo = () => {
//     //   setTodos((t) => [...t, "New Todo"]);
//     // };
//     const addTodo = useCallback(() => {
//         setTodos((t) => [...t, "New Todo"]);
//       }, [todos]);
    
  
//     return (
//       <>
//         <h1>Home</h1>;
//         <Todos todos={todos} addTodo={addTodo} />
//         <hr />
//         <div>
//           Count: {count}
//           <button onClick={increment}>+</button>
//         </div>
//       </>
//     );
//   };
//   export default HomePage;
  
// import React from 'react';
// import { Container, Typography, Button } from '@mui/material';
// import { styled } from '@mui/system';
// import { Link } from 'react-router-dom';

// const StyledContainer = styled(Container)({
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
//     justifyContent: 'center',
//     minHeight: '100vh',
//   });
  
//   const StyledTitle = styled(Typography)({
//     marginBottom: '2rem',
//   });
  
//   const StyledButton = styled(Button)({
//     marginBottom: '1rem',
//   });
  
//   function HomePage() {
//     return (
//       <StyledContainer maxWidth="sm">
//         <StyledTitle variant="h2" component="h1">
//           Bienvenue sur la plateforme DAO de Crowdfunding
//         </StyledTitle>
//         <StyledButton
//           variant="contained"
//           color="primary"
//           component={Link}
//           to="/project-info"
//         >
//           Créer un projet
//         </StyledButton>
//         <Button
//           variant="outlined"
//           color="primary"
//           component={Link}
//           to="/vote-project-validation"
//         >
//           Voter pour valider les projets
//         </Button>
//       </StyledContainer>
//     );
//   }
  

// export default HomePage;
