import React from 'react';

const LoadingSpinner = () => {
  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        height: '100%',
        justifyContent: 'center',
        width: '100%'
      }}
    >
      <div
        style={{
          animation: 'spin 1s linear infinite',
          border: '5px solid #f3f3f3',
          borderRadius: '50%',
          borderTop: '5px solid #3498db',
          height: '50px',
          width: '50px'
        }}
      ></div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
