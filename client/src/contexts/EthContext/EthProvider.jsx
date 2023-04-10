import React, { useReducer, useCallback, useEffect } from "react";
import Web3 from "web3";
import EthContext from "./EthContext";
import { reducer, actions, initialState } from "./state";

function EthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const init = useCallback(async (artifacts) => {

    console.log("go call init() ==> init = useCallback ");
    console.log("artifacts ", artifacts);
    console.log("artifacts.length ", artifacts.length);

    if (artifacts && artifacts.length > 0) {
      const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
      const accounts = await web3.eth.requestAccounts();
      const networkID = await web3.eth.net.getId();
      const currentBlock = await web3.eth.getBlockNumber();
  
      const contractsData = await Promise.all(
        artifacts.map(async (artifact) => {
          const deployTransaction = await web3.eth.getTransaction(
            artifact.networks[networkID].transactionHash
          );
          const deployBlock = deployTransaction.blockNumber;
  
          const { abi } = artifact;
          let address, contract;
          try {
            address = artifact.networks[networkID].address;
            contract = new web3.eth.Contract(abi, address);
          } catch (err) {
            console.error(err);
          }
  
          return {
            artifact,
            contract,
            deployBlock,
          };
        })
      );
  
      dispatch({
        type: actions.init,
        data: {
          artifacts,
          web3,
          accounts,
          networkID,
          contractsData,
          currentBlock,
        },
      });
    }
  }, []);
  

  useEffect(() => {
    console.log("useEffect - before tryInit - begin ");

    const tryInit = async () => {

      console.log("tryInit - begin ");
      try {
        const artifacts = [require("../../contracts/ProjectInfo.json"),
                          require("../../contracts/VoteProjectValidation.json"), 
                          require("../../contracts/FundraisingProject.json"), 
                          require("../../contracts/VoteUnlockFunds.json"),
                          require("../../contracts/SeedToken.json")];
        console.log("artifact with 5 smart contracts = ", artifacts.length);
        
        console.log("go call init()");

        init(artifacts);
      } catch (err) {
        console.error(err);
      }
    };

    //tryInit();
    if (typeof tryInit === 'function') {
      tryInit();
    } else {
      console.error('tryInit is not a function');
    }
  }, [init]);

  useEffect(() => {
    const events = ["chainChanged", "accountsChanged"];
    const handleChange = () => {
      init(state.artifacts);
    };

    events.forEach(e => window.ethereum.on(e, handleChange));
    return () => {
      events.forEach(e => window.ethereum.removeListener(e, handleChange));
    };
  }, [init, state.artifacts]);

  return (
    <EthContext.Provider value={{
      state,
      dispatch
    }}>
      {children}
    </EthContext.Provider>
  );
}

export default EthProvider;
