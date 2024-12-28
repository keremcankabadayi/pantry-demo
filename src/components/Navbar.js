import React from 'react';
import { Navbar, Container } from 'react-bootstrap';
import './Navbar.css';

const NavigationBar = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" fixed="top" className="custom-navbar">
      <Container>
        <Navbar.Brand>
          <span className="brand-text">Dünyanın En Gizli Bilgisi</span>
        </Navbar.Brand>
      </Container>
    </Navbar>
  );
};

export default NavigationBar; 