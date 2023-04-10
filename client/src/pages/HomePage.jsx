// const Home = () => {
//     return <h1>Home</h1>;
//   };
  
//   export default Home;

import { useState, useCallback } from "react"; 
 import ReactDOM from "react-dom/client";
  import Todos from "./Todos";
  
  const HomePage = () => {
    const [count, setCount] = useState(0);
    const [todos, setTodos] = useState([]);
  
    const increment = () => {
      setCount((c) => c + 1);
    };
    // const addTodo = () => {
    //   setTodos((t) => [...t, "New Todo"]);
    // };
    const addTodo = useCallback(() => {
        setTodos((t) => [...t, "New Todo"]);
      }, [todos]);
    
  
    return (
      <>
        <h1>Home</h1>;
        <Todos todos={todos} addTodo={addTodo} />
        <hr />
        <div>
          Count: {count}
          <button onClick={increment}>+</button>
        </div>
      </>
    );
  };
  export default HomePage;
  
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
