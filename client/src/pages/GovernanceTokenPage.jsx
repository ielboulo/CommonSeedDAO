import { useState, useEffect } from "react";
import { Container, Typography, TextField, Button, Box } from "@mui/material";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import useEth from "../contexts/EthContext/useEth";
import Web3 from "web3";

function GovernanceTokenPage() {
  const { state: {accounts, contractsData, web3}} = useEth(); // contractsData[4] : is for seed token 
  const [isOwner, setIsOwner] = useState(false);
  const [refreshData, setRefreshData] = useState(false);

  //const { activate, active, account, library, chainId } = useWeb3React();
  const [maxSupply, setMaxSupply] = useState("");
  const [holdersCount, setHoldersCount] = useState("");
  const [transferToAddress, setTransferToAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState("");

  // IsOwner
  useEffect(() => {
    async function getOwner() {
      if (contractsData && contractsData[4].artifact) {
        const owner = await contractsData[4].contract.methods.owner().call({ from: accounts[0] });
        console.log("owner address = ", owner, " accounts[0] = ", accounts[0]);
        accounts[0] === owner ? setIsOwner(true) : setIsOwner(false);
      }
    }
    getOwner();
  }, [accounts, contractsData]);
  
  useEffect(() => {
    async function fetchTokenData() {
      if (contractsData[4].contract) {
        const maxSupply = await contractsData[4].contract.methods.totalSupply().call();
        const holdersCount = await contractsData[4].contract.methods.holdersCount().call();
        setMaxSupply(maxSupply);
        setHoldersCount(holdersCount);
      }
    }
    fetchTokenData();
  }, [contractsData[4].contract, refreshData]);


  const handleTransfer = async () => {
    if (!transferToAddress || !transferAmount) return;
    const weiAmount = Web3.utils.toWei(transferAmount, "ether");
    if (isOwner)
    {
      console.log(" weiAmount = " , weiAmount );
      console.log("contract address = ", contractsData[4].contract._address);
      console.log(" transferToAddress = ", transferToAddress);

      await contractsData[4].contract.methods
      .transfer(transferToAddress, weiAmount)
      .send( { from: accounts[0] })
      .then((receipt) => {
        console.log("Transaction successful!");
        console.log("Transaction hash:", receipt.transactionHash);
        console.log("Gas used:", receipt.gasUsed);
        // Refresh token data after a successful transfer
        setRefreshData(!refreshData);

        // emit an event :
        toast.success("SUCCESS : Transfer Successful!", {
          closeButton: true,
          autoClose: true,
          position: 'top-center',
        });
      })
      .catch((error) => {
        console.error("Transaction failed:", error);
        toast.error("ERROR : Transfer Failed !", {
          closeButton: true,
          autoClose: true,
          position: 'top-center',
        });
      });
      
    }
    else
    {
      console.log(" isOwner " , isOwner);
      toast.warning("WARNING : Only owner can transfer funds!", {
        closeButton: true,
        autoClose: true,
        position: 'top-center',
      });
    }
  };

  return (
    <Container maxWidth="md">
    <>
      <Typography gutterBottom variant="h3" align="center">
        SEED Token Dashboard
      </Typography>
      <TableContainer component={Paper}>
        <Table
          sx={{
            minWidth: 550,
            maxWidth: 1550,
            padding: "20px 5px",
            margin: "0 auto",
            fontSize: "1.2rem",
            fontFamily: "Arial,sans-serif",
          }}
          aria-label="token table"
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={{ fontSize: "12px", fontWeight: "bold", background: "#d3b638" }}
              >
                Max Supply
              </TableCell>
              <TableCell
                sx={{ fontSize: "12px", fontWeight: "bold", background: "#d3b638" }}
              >
                Number of Holders
              </TableCell>
              <TableCell
                sx={{ fontSize: "12px", fontWeight: "bold", background: "#d3b638" }}
              >
                Smart Contract Address
              </TableCell>
              <TableCell
                sx={{ fontSize: "12px", fontWeight: "bold", background: "#d3b638" }}
              >
                Network
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>{maxSupply}</TableCell>
              <TableCell>{holdersCount}</TableCell>
              <TableCell>{contractsData[4].contract._address}</TableCell>
              <TableCell>Not Retrieved Yet</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <br />
      <hr />
  
      {isOwner && (
        <>
	<ToastContainer />
          <Typography gutterBottom variant="h3" align="center">
            Transfer SEED Tokens - Admin
          </Typography>
  
          <Box>
            <TextField
              required
              label="Recipient Address"
              value={transferToAddress}
              onChange={(e) => setTransferToAddress(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              required
              label="Transfer Amount"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              fullWidth
              margin="normal"
            />
            <Button variant="contained" onClick={handleTransfer}>
              Transfer
            </Button>
          </Box>
        </>
      )}
    </>
  </Container>
  
  );
}

export default GovernanceTokenPage;
