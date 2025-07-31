# Enterprise GRC Platform

This repository contains the codebase for the Enterprise Governance, Risk, and Compliance (GRC) platform, built using the MERN stack (MongoDB, Express.js, React.js, Node.js). This application aims to provide a comprehensive solution for managing an organization's GRC activities, including risk management, control implementation, policy management, audit management, and evidence collection.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Features

* **User Management:** Role-Based Access Control (RBAC) with SuperAdmin, AuditManager, ComplianceOfficer, ControlOwner roles.
* **Asset Registry:** Centralized inventory of systems and assets, with mapping to risks and controls.
* **Risk Register:** Identification, assessment (inherent and residual scoring), and tracking of organizational risks.
* **Control Library:** Management and tracking of controls, aligned with various frameworks (ISO 27001, NIST CSF, QCSF, etc.). Includes audit steps and evidence linking.
* **Evidence Repository:** Secure storage, review, and lifecycle management of evidence files.
* **Policy Library:** Creation, versioning, and management of organizational policies, with attestation tracking.
* **Audit Management:** Planning, execution, and reporting of audits, including auto-population of RCM and guided audit flows.
* **Interactive Dashboards:** Role-specific dashboards providing real-time insights into GRC status, risks, and compliance.
* **Business Continuity Management (BCM):** Tracking of BCM plans, criticality scores, RTO/RPO, and test results.
* **Notifications & Alerts:** Real-time notifications for critical events and deadlines.
* **Advanced Reporting:** Customizable reports for compliance, audit findings, and risk analysis.
* **Robust Security:** JWT authentication, rate limiting, comprehensive input validation, HTTPS enforcement, and environment variable management.
* **Scalability & Performance:** Database indexing, server-side pagination, caching, and load balancing considerations.
* **Integration Capabilities:** Designed for integration with CMDB, Active Directory, ERP, Email services, and AI services.
* **Comprehensive Logging & Error Handling:** Centralized logging and error management for better debugging and auditing.

## Architecture

The application follows a layered MERN stack architecture:

* **Frontend (React.js):** User interface and client-side logic.
* **Backend (Node.js/Express.js):** Business logic, API endpoints, and workflow orchestration.
* **Database (MongoDB):** Persistent data storage.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

* Node.js (LTS version recommended)
* npm (comes with Node.js)
* MongoDB (local installation or cloud service like MongoDB Atlas)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd GRC_Enterprise_App
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    npm install
    ```

3.  **Frontend Setup:**
    ```bash
    cd ../frontend
    npm install
    ```

### Running the Application

1.  **Start MongoDB:** Ensure your MongoDB instance is running.

2.  **Create `.env` file:** In the root `GRC_Enterprise_App` directory, create a `.env` file and configure your environment variables (see [Environment Variables](#environment-variables) section).

3.  **Start the Backend Server:**
    ```bash
    cd backend
    npm run server
    ```
    The backend will run on `http://localhost:5000` (or your specified `PORT`).

4.  **Start the Frontend Development Server:**
    ```bash
    cd ../frontend
    npm start
    ```
    The frontend will open in your browser, usually at `http://localhost:3000`.

## Environment Variables

Create a `.env` file in the root directory of the project (`GRC_Enterprise_App/`) with the following variables:
