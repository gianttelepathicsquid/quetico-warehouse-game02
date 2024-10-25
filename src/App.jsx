import React from 'react';
import WarehouseOptimizer from './components/WarehouseOptimizer';

function App() {
  return (
    <div style={{ 
      padding: '20px',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <WarehouseOptimizer />
    </div>
  );
}

export default App;
