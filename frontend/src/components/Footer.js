import React from 'react';
import { Container, Navbar, Nav } from 'react-bootstrap';

function Footer() {
  return (
    <Navbar bg="dark" variant="dark" className="mt-5">
      <Container>
        <div className="w-100">
          <div className="row text-center text-md-start">
            <div className="col-md-6">
              <h6 className="text-light">Limkokwing University</h6>
              <p className="text-muted mb-2 small">
                Faculty of Information & Communication Technology<br />
                Transforming Education Through Innovation
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <Nav className="justify-content-center justify-content-md-end">
                <Nav.Link href="#about" className="text-light small">About</Nav.Link>
                <Nav.Link href="#contact" className="text-light small">Contact</Nav.Link>
                <Nav.Link href="#privacy" className="text-light small">Privacy</Nav.Link>
                <Nav.Link href="#terms" className="text-light small">Terms</Nav.Link>
              </Nav>
              <p className="text-muted mt-2 mb-0 small">
                &copy; 2024 LUCT. Developed for DIWA2110 - Web Application Development
              </p>
            </div>
          </div>
        </div>
      </Container>
    </Navbar>
  );
}

export default Footer;