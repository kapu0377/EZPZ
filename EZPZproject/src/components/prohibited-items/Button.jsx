import React from 'react';

const Button = ({ onClick, children }) => (
  <button 
    onClick={onClick} 
    style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff' }}>
    {children}
  </button>
);

export default Button;
