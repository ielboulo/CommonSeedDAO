import { Outlet, Link } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/project-info">Projects Info </Link>
          </li>
          <li>
            <Link to="/vote-project-validation">Vote For Project Validation</Link>
          </li>
          <li>
            <Link to="/Fundraising-Project">Fundraise Projects</Link>
          </li>
        </ul>
      </nav>

      <Outlet />
    </>
  )
};

export default Layout;