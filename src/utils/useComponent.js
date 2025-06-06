import { useState } from 'react';

/**
 * @param {React.ComponentType} Component 
 * @param {Object} props 
 * @returns {React.ReactElement} 
 */
export const useComponent = (Component, props = {}) => {

  const [instance] = useState(() => <Component {...props} />);
  return instance;
}; 