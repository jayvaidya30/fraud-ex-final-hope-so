# Software Requirements Specification (SRS)

## Backend System – AI‑Powered Anti‑Corruption Intelligence Platform

---

## 1. Introduction

### 1.1 Purpose

This document specifies the functional and non‑functional requirements of the backend system for an AI‑assisted platform that detects and explains corruption risk indicators using user‑provided and open‑source data.

The backend provides:

- document ingestion
- AI‑based analysis
- risk scoring
- explainable outputs
- safe, controlled access via APIs

### 1.2 Scope

The backend system:

- accepts documents and metadata
- extracts structured information
- applies AI models to detect anomalies
- generates explainable risk insights
- exposes REST APIs for frontend consumption

> ⚠️ The system does not accuse or conclude corruption.  
> It only flags risk and irregularity indicators.

### 1.3 Definitions

- **Risk Score**: A numeric indicator (0–100) representing anomaly likelihood.
- **OSINT**: Open Source Intelligence (publicly available data).
- **Case**: A single analysis instance for one uploaded document.
- **Explainability**: Human‑readable reasoning behind AI outputs.

---

## 2. Overall System Description

### 2.1 Product Perspective

The backend is a standalone API service consumed by a web frontend.

Architecture style:

- RESTful
- AI‑assisted
- Modular services

### 2.2 User Classes

| User Type        | Backend Interaction            |
| ---------------- | ------------------------------ |
| Citizen          | Upload documents, view results |
| Journalist / NGO | Analyze, download reports      |
| Admin            | Monitor usage, moderation      |

### 2.3 Operating Environment

- Python 3.10+
- FastAPI
- Linux‑based cloud environment
- HTTPS‑secured APIs

---

## 3. System Architecture (Backend View)

```
Client (Frontend)
           |
REST APIs (FastAPI)
           |
---------------------------------
| Auth & Rate Limiting           |
| Case Management Service        |
| Document Processing Service    |
| AI Analysis Engine             |
| Risk Scoring Engine            |
| Explainability Module          |
| Safeguards & Moderation Layer  |
---------------------------------
           |
Database + Object Storage
```

---

## 4. Functional Requirements

### 4.1 Authentication & Access Control

- **FR‑1**
  - The backend shall authenticate users via token‑based authentication.
- **FR‑2**
  - The backend shall support role‑based access (citizen, analyst, admin).

### 4.2 Document Upload & Case Creation

- **FR‑3**
  - The backend shall allow users to upload documents (PDF, image, CSV).
- **FR‑4**
  - The backend shall create a unique case ID for each upload.
- **FR‑5**
  - The backend shall store original documents securely.

### 4.3 Document Processing

- **FR‑6**
  - The backend shall extract text using OCR when required.
- **FR‑7**
  - The backend shall normalize extracted data into structured formats.
- **FR‑8**
  - The backend shall tag extracted data with metadata (source, timestamp).

### 4.4 AI Analysis Engine

- **FR‑9**
  - The backend shall compute anomaly indicators using statistical methods.
- **FR‑10**
  - The backend shall detect:
    - price deviations
    - repeated entities
    - temporal inconsistencies
    - document similarity patterns
- **FR‑11**
  - The backend shall integrate an LLM to assist in interpretation and explanation.

### 4.5 Risk Scoring

- **FR‑12**
  - The backend shall aggregate multiple signals into a risk score (0–100).
- **FR‑13**
  - The backend shall store individual signal contributions.

### 4.6 Explainability & Reporting

- **FR‑14**
  - The backend shall generate a plain‑language explanation of flagged risks.
- **FR‑15**
  - The backend shall expose explanations via API responses.
- **FR‑16**
  - The backend shall allow exporting case summaries.

### 4.7 Safeguards & Moderation

- **FR‑17**
  - The backend shall ensure outputs are labeled as “risk indicators”.
- **FR‑18**
  - The backend shall prevent personal accusations in generated content.
- **FR‑19**
  - The backend shall rate‑limit analysis requests.

---

## 5. API Requirements (Abstract)

| Endpoint   | Method | Description        |
| ---------- | ------ | ------------------ |
| /upload    | POST   | Upload document    |
| /analyze   | POST   | Run AI analysis    |
| /case/{id} | GET    | Fetch case results |
| /health    | GET    | Service health     |

---

## 6. Data Requirements

### 6.1 Database

- Cases
- Risk scores
- Extracted text
- Metadata
- Audit logs

### 6.2 Storage

- Original documents
- Processed artifacts

---

## 7. Non‑Functional Requirements

### 7.1 Performance

- Analysis response ≤ 10 seconds (MVP)
- Async processing supported

### 7.2 Security

- Encrypted data at rest and in transit
- No public exposure of raw evidence

### 7.3 Reliability

- Graceful handling of incomplete data
- Partial results allowed

### 7.4 Scalability

- Stateless API design
- Modular AI services

---

## 8. Constraints

- Government data availability may be incomplete.
- AI models must remain assistive, not authoritative.
- System must comply with ethical AI principles.

---

## 9. Assumptions

- Users provide consent for uploaded data.
- AI outputs are reviewed by humans before action.
- The system operates as a decision‑support tool.

---

## 10. Out of Scope

- Legal enforcement
- Automated accusations
- Judicial decisions
- Political profiling

---

## 11. Future Enhancements

- OSINT automation
- Graph‑based collusion detection
- Multi‑case pattern learning
- Advanced confidence calibration
