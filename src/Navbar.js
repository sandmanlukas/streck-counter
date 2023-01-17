import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { useLogout } from "./hooks/useLogout";
import { useAuthContext } from "./hooks/useAuthContext";
import { resetDatabase } from "./Reset";


function BasicNavbar() {
  const { logout } = useLogout();
  const { user } = useAuthContext();

  const handleClick = () => {
    logout();
  };

  async function handleReset(e) {
    e.preventDefault();

    if (window.confirm(`Vill du verkligen återställa hela databasen?`)) {
      await resetDatabase(user);
      window.location.reload(true)
    }
    return;
  }
  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand href="/">CCC - Streck</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          {user && (<>
            <Nav.Link disabled={true}>{user.username.toUpperCase()}</Nav.Link>
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link onClick={handleClick}>Log out</Nav.Link>
          </>)}
          {!user && (
            <>
              <Nav.Link href="/login">Login</Nav.Link>
            </>
          )}
        </Nav>
      </Navbar.Collapse>
      {user && user.role === "admin" && (<>
        <Navbar.Collapse className="justify-content-end">
          <Nav className="me">

            <Nav.Link onClick={handleReset}>
              Återställ databasen
            </Nav.Link>
          </Nav>

        </Navbar.Collapse>
      </>)}
    </Navbar>
  );
}

export default BasicNavbar;
