import React from 'react';
import { Container, Navbar } from 'react-bootstrap';

function Footer() {
  return (
    <Navbar bg="light" fixed="bottom" className="mt-5">
      <Container>
        <div className="w-100 text-center">
          <small className="text-muted">
            🏫 LUCT Reporting System • Developed for Web Application Development - DIWA2110
          </small>
        </div>
      </Container>
    </Navbar>
  );
}

export default Footer;