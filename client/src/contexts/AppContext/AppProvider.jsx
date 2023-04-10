import React, { useReducer, useCallback, useEffect, useState } from 'react';

import { reducer, actions, initialState } from './state';
import AppContext from './AppContext';
import useEth from '../EthContext/useEth';

// const artifacts = [require("../../contracts/ProjectInfo.json"),
//                   require("../../contracts/VoteProjectValidation.json"), 
//                   require("../../contracts/FundraisingProject.json"), 
//                   require("../../contracts/VoteUnlockFunds.json"),
//                   require("../../contracts/SeedToken.json")];
// contractsData is a table of 5 elements containing each following 3 elements:
                  // artifact,
                  // contract,
                  // deployBlock,
function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [connected, setConnected] = useState(false);

  const {
    events: { statusEvents, registeredEvents }
  } = state;

  const eth = useEth();
  const {
    state: { contractsData, accounts, deployBlock, currentBlock } 
 
  } = eth;


  const updateOwner = useCallback(async (owner) => {
    console.log("updateOwner = ", owner);

    dispatch({
      type: actions.setOwner,
      data: owner
    });
  }, []);

  useEffect(() => {
    const tryGetOwner = async () => {
      try {
        let owner = await contractsData[0].contract.methods.owner().call({ from: accounts[0] });
        console.log("tryGetOwner = ", owner);
        updateOwner(owner);
      } catch (error) {
        dispatch({
          type: actions.setAlert,
          data: {
            message: error.message,
            severity: 'error'
          }
        });
      }
    };
    if (contractsData && contractsData[0].contract && accounts) {
      console.log("call tryGetOwner() ");
      tryGetOwner();
    }
  }, [contractsData && contractsData[0].contract, accounts, updateOwner]);

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export default AppProvider;
