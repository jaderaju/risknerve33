import React, { useContext } from 'react';
import { AuthContext } from '../AuthContext';

function HomePage() {
  const { isAuthenticated, user } = useContext(AuthContext);

  return (
    <div className="home-page">
      <h1>Welcome to the GRC Platform</h1>
      {isAuthenticated ? (
        <p>You are logged in as **{user.username}** with the role of **{user.role}**.</p>
      ) : (
        <p>Please register or log in to access the GRC functionalities.</p>
      )}

      <section>
        <h2>About This Platform</h2>
        <p>This GRC (Governance, Risk, and Compliance) platform is designed to help organizations manage their IT governance, identify and mitigate risks, ensure compliance with various regulations and frameworks, and streamline audit processes. It provides modules for:</p>
        <ul>
          <li>**User Management**: Secure authentication and role-based access.</li>
          <li>**Asset Management**: Cataloging and tracking organizational assets.</li>
          <li>**Risk Management**: Identifying, assessing, and treating risks.</li>
          <li>**Control Management**: Defining, implementing, and monitoring security controls.</li>
          <li>**Framework Management**: Mapping controls to compliance standards (e.g., ISO, NIST).</li>
          <li>**Policy Management**: Creating, distributing, and tracking policy attestations.</li>
          <li>**Evidence Repository**: Centralized storage for audit and compliance evidence.</li>
          <li>**Audit Management**: Planning, executing, and reporting on internal/external audits.</li>
          <li>**Business Continuity Management (BCM)**: Developing and maintaining continuity plans.</li>
        </ul>
        <p>This platform aims to provide a unified view of your organization's GRC posture.</p>
      </section>
    </div>
  );
}

export default HomePage;
