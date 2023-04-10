import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";

const Footer = () => {
  return (
    <AppBar position="static">
      <Toolbar  sx={{ flexGrow: 1 }}>
        <Typography variant="body1" component="div" align="center" sx={{ width: "100%" }} >
        Common Seed DAO - Planting the Seeds of a Decentralized Tomorrow - CopyRight@2023
	</Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Footer;


// export default function Footer() {
//   return (
//     <AppBar position="fixed" color="primary" className="footer">
//       <Toolbar>
//         <Box className="footer-content">
//           <Typography variant="body2">Made by Quentin and Samir for Alyra</Typography>
//         </Box>
//       </Toolbar>
//     </AppBar>
//   );
// }

// function Link({ uri, text }) {
//   return <a href={uri} target="_blank" rel="noreferrer">{text}</a>;
// }

// function Footer() {
//   const classes = useStyles();
//   return (
//     <AppBar position="fixed" color="primary" className="footer">
//       <Toolbar>
//         <Box className={classes.footerContent}>
//           <Typography variant="body2">Made by Quentin and Samir for Alyra</Typography>
//         </Box>
//       </Toolbar>
//     </AppBar>
//   );
// }
// export default Footer;

// function Footer() {
//   return (
//     <footer>
//       <h2>More resources</h2>
//       <Link uri={"https://trufflesuite.com"} text={"Truffle"} />
//       <Link uri={"https://reactjs.org"} text={"React"} />
//       <Link uri={"https://soliditylang.org"} text={"Solidity"} />
//       <Link uri={"https://ethereum.org"} text={"Ethereum"} />
//     </footer >
//   );
// }

//export default Footer;
