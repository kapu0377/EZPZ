import React from 'react';

const Card = ({ children }) => (
  <div style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px' }}>
    {children}
  </div>
);

export default Card;  // ✅ Default Export 추가
