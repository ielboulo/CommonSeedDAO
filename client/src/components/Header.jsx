import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { Box } from "@mui/system";

import { useState, useEffect } from 'react';
import useEth from '../contexts/EthContext/useEth';


const Header = () => {
    const {
        state: { accounts },
        tryInit
      } = useEth();
      const [address, setAddress] = useState('');
    
      useEffect(() => {
        if (accounts) {
          let _address = accounts[0];
    
          setAddress(_address.substring(0, 5) + '...' + _address.substring(_address.length - 4));
        }
      }, [accounts]);
    
    // TODO Ilham 
    //   useEffect(() => {
    //     if (window.ethereum && window.ethereum.isConnected()) {
    //       tryInit();
    //     }
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    //   }, []);
    

    return (
        <Box> 
        <AppBar position="static">
        <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box> 
            <Typography variant="h3" component="div">
            The Common Seed DAO
            </Typography>
            </Box>
            <Box ml="auto">

            {address ? 
            <Typography variant="h4">{address}</Typography> 
            : window.ethereum && 

            <Button onClick={tryInit}
                    sx={{
                    backgroundColor: "#d3b638",
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: "16px",
                    height: "50px",
                    width: "150px",
                    "&:hover": {
                    backgroundColor: "#a6a6a6",
                    },
                    }}> 
            Connect 
            </Button>
            }
            </Box>
        </Toolbar>
        </AppBar>
        </Box>
    );
};

export default Header;

// {address ? <Typography>{address}</Typography> :
// 