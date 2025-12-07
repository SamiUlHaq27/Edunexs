import React from "react";
import { ASSETS } from "../config/assets";
import "../styles/loader.css";

export default function Loader(): React.JSX.Element {
  return (
    <div className="loader-container">
      <div className="loader-content">
        <div className="logo-wrapper">
          <img src={ASSETS.logo} alt={ASSETS.alt} className="loader-logo" />
        </div>
        <h2 className="loader-title">Edunexs</h2>
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
        <p className="loader-text">Loading your workspace...</p>
      </div>
    </div>
  );
}