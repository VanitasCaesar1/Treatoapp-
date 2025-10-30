# Requirements Document

## Introduction

The Patient App is a web-based application that enables patients to manage their healthcare journey through a comprehensive digital platform. The system integrates with the existing healthcare backend microservices to provide appointment booking, telemedicine consultations, medical record access, doctor search, and community engagement features. The application serves as the primary patient-facing interface for the healthcare ecosystem.

## Glossary

- **Patient App**: The web-based application interface for patients
- **Healthcare Backend**: The existing microservices ecosystem (17+ services)
- **API Gateway**: The single entry point at port 8080 for all backend services
- **WorkOS**: The enterprise SSO authentication provider
- **JWT**: JSON Web Token used for authentication
- **EMR**: Electronic Medical Records stored in the backend
- **Video Room**: WebRTC-based video consultation session
- **Social Feed**: Community posts and health experience sharing
- **MeiliSearch**: The fast search engine for doctors, medicines, and templates
- **Appointment**: A scheduled consultation between patient and doctor
- **Template**: Medical forms and documents available in the system
- **Vital Signs**: Health measurements like blood pressure, heart rate, temperature

## Requirements

### Requirement 1

**User Story:** As a new patient, I want to register and authenticate securely, so that I can access my healthcare information safely

#### Acceptance Criteria

1. WHEN a patient initiates registration, THE Patient App SHALL redirect to WorkOS authentication
2. WHEN WorkOS returns a valid JWT token, THE Patient App SHALL store the token securely in HTTP-only cookies
3. WHEN a patient accesses protected routes without authentication, THE Patient App SHALL redirect to the login page
4. WHEN a JWT token expires, THE Patient App SHALL prompt the patient to re-authenticate
5. THE Patient App SHALL include the JWT token in all API requests to the API Gateway

### Requirement 2

**User Story:** As a patient, I want to search and view doctor profiles, so that I can find the right healthcare provider for my needs

#### Acceptance Criteria

1. WHEN a patient enters search criteria, THE Patient App SHALL query the API Gateway doctor search endpoint with filters for specialty, location, and availability
2. THE Patient App SHALL display doctor results with name, specialty, location, rating, and availability status
3. WHEN a patient selects a doctor, THE Patient App SHALL retrieve and display the complete doctor profile including schedules and consultation fees
4. THE Patient App SHALL provide filter options for specialty, location, availability date, and fee range
5. WHEN search results exceed 20 doctors, THE Patient App SHALL implement pagination with 20 results per page

### Requirement 3

**User Story:** As a patient, I want to book appointments with doctors, so that I can schedule consultations at convenient times

#### Acceptance Criteria

1. WHEN a patient views a doctor's schedule, THE Patient App SHALL display available time slots for the next 30 days
2. WHEN a patient selects a time slot, THE Patient App SHALL create an appointment via the API Gateway appointments endpoint
3. THE Patient App SHALL display appointment confirmation with date, time, doctor name, and consultation type
4. WHEN a patient views their appointments, THE Patient App SHALL retrieve and display upcoming and past appointments
5. WHEN a patient cancels an appointment, THE Patient App SHALL send a delete request to the API Gateway and update the display

### Requirement 4

**User Story:** As a patient, I want to join video consultations with my doctor, so that I can receive remote healthcare services

#### Acceptance Criteria

1. WHEN an appointment time arrives, THE Patient App SHALL display a join button for video consultation
2. WHEN a patient clicks join, THE Patient App SHALL create a video room via the API Gateway video service endpoint
3. THE Patient App SHALL establish WebRTC connection using the video room credentials
4. THE Patient App SHALL display local and remote video streams with audio controls
5. WHEN the consultation ends, THE Patient App SHALL terminate the WebRTC connection and close the video room

### Requirement 5

**User Story:** As a patient, I want to view my medical records and history, so that I can track my health information

#### Acceptance Criteria

1. WHEN a patient accesses medical records, THE Patient App SHALL retrieve patient profile and medical history from the API Gateway
2. THE Patient App SHALL display medical encounters with date, doctor, diagnosis, and treatment information
3. THE Patient App SHALL display vital signs history with charts showing trends over time
4. WHEN a patient views a specific encounter, THE Patient App SHALL retrieve detailed diagnosis and prescription information
5. THE Patient App SHALL organize medical records by date with most recent entries displayed first

### Requirement 6

**User Story:** As a patient, I want to update my profile information, so that my healthcare providers have accurate contact and medical details

#### Acceptance Criteria

1. WHEN a patient accesses profile settings, THE Patient App SHALL retrieve current profile data from the API Gateway user service
2. THE Patient App SHALL provide editable fields for phone, address, emergency contact, and medical conditions
3. WHEN a patient saves profile changes, THE Patient App SHALL send updated data to the API Gateway user service endpoint
4. THE Patient App SHALL validate required fields before submission
5. WHEN profile update succeeds, THE Patient App SHALL display a confirmation message

### Requirement 7

**User Story:** As a patient, I want to search for medicines and view information, so that I can learn about prescribed medications

#### Acceptance Criteria

1. WHEN a patient enters a medicine name, THE Patient App SHALL query the API Gateway medicine search endpoint
2. THE Patient App SHALL display search results with medicine name, generic name, and manufacturer
3. WHEN a patient selects a medicine, THE Patient App SHALL display detailed information including indications and dosage
4. THE Patient App SHALL provide autocomplete suggestions as the patient types
5. WHEN no results are found, THE Patient App SHALL display a helpful message with search tips

### Requirement 8

**User Story:** As a patient, I want to participate in the health community, so that I can share experiences and learn from others

#### Acceptance Criteria

1. WHEN a patient accesses the community feed, THE Patient App SHALL retrieve social posts from the API Gateway social service
2. THE Patient App SHALL display posts with content, author, timestamp, likes, and comments
3. WHEN a patient creates a post, THE Patient App SHALL submit content to the API Gateway social service endpoint
4. THE Patient App SHALL allow patients to like, comment, and save posts
5. WHEN a patient receives notifications, THE Patient App SHALL establish WebSocket connection to display real-time updates

### Requirement 9

**User Story:** As a patient, I want to access medical templates and forms, so that I can complete required documentation efficiently

#### Acceptance Criteria

1. WHEN a patient accesses templates, THE Patient App SHALL retrieve available templates from the API Gateway template service
2. THE Patient App SHALL display templates organized by category and specialty
3. WHEN a patient selects a template, THE Patient App SHALL display the template content with fillable fields
4. THE Patient App SHALL allow patients to save and like templates for future use
5. WHEN a patient searches templates, THE Patient App SHALL query the template search endpoint with filters

### Requirement 10

**User Story:** As a patient, I want to view my dashboard with personalized health information, so that I can quickly access important healthcare data

#### Acceptance Criteria

1. WHEN a patient logs in, THE Patient App SHALL display a dashboard with upcoming appointments, recent vitals, and notifications
2. THE Patient App SHALL retrieve dashboard data from multiple API Gateway endpoints in parallel
3. THE Patient App SHALL display quick action buttons for booking appointments, viewing records, and joining video calls
4. THE Patient App SHALL show appointment reminders for consultations within 24 hours
5. WHEN dashboard data is loading, THE Patient App SHALL display loading indicators for each section
