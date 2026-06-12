import React from 'react';
import './DeviceShell.css';

export default function DeviceShell({ children }) {
  return (
    <div className="device-shell-wrapper">
      <div className="device-shell">
        <div className="app-content">
          {children}
        </div>
      </div>
    </div>
  );
}
