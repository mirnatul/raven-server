# Raven API Documentation

**Base URL:** `https://raven-server-three.vercel.app`

Raven is a project management and software development platform with authentication, career management, developer management, project management, payments, and Kanban task management.

---

## Table of Contents

* [Authentication](#authentication)
* [User](#user)
* [Career](#career)
* [Developer](#developer)
* [Project](#project)
* [Payment](#payment)
* [Kanban](#kanban)
* [Root](#root)
* [API Summary](#api-summary)

---

# Authentication

## Get Current User

**GET** `/api/auth/me`

Returns information about the currently authenticated user.

---

## Login

**POST** `/api/auth/login`

Authenticates a user and creates an authenticated session.

### Request Body

```json
{
  "email": "john.doe@gmail.com",
  "password": "John@12345"
}
```

---

## Register Client

**POST** `/api/auth/register`

Creates a new client account.

### Request Body

```json
{
  "name": "John Doe",
  "email": "john.doe@gmail.com",
  "password": "John@12345",
  "contactNumber": "01712345678",
  "address": "House 12, Road 5, Dhaka, Bangladesh",
  "companyName": "Tech Solutions Ltd",
  "bio": "We provide software development and technology consulting services."
}
```

---

## Verify Email

**POST** `/api/auth/verify-email`

Verifies a client's email address using an OTP.

### Request Body

```json
{
  "email": "john.doe@gmail.com",
  "otp": "868955"
}
```

---

## Forgot Password

**POST** `/api/auth/forgot-password`

Initiates the password recovery process by sending an OTP to the user's email.

### Request Body

```json
{
  "email": "rahim.ahmed@example.com"
}
```

---

## Reset Password

**POST** `/api/auth/reset-password`

Resets the user's password using the OTP received through email.

### Request Body

```json
{
  "email": "rahim.ahmed@example.com",
  "newPassword": "NewSecurePass@123",
  "otp": "883824"
}
```

---

## Google Login

**POST** `/api/auth/google`

Authenticates a user using a Google ID token.

### Request Body

```json
{
  "idToken": ""
}
```

---

# User

## Update Profile Image

**PATCH** `/api/user/profile-image`

Updates the authenticated user's profile image.

### Request

**Content-Type:** `multipart/form-data`

| Field          | Type | Description       |
| -------------- | ---- | ----------------- |
| `profileImage` | File | New profile image |

---

## Update My Profile

**PATCH** `/api/user/profile`

Updates the authenticated user's profile information.

### Request Body

```json
{
  "name": "Rafiul Islam",
  "contactNumber": "01614445567",
  "address": "Gulshan, Dhaka, Bangladesh"
}
```

---

# Career

## Create Job Opening

**POST** `/api/career/job-opening`

**Access:** Admin

Creates a new job opening.

### Request Body

```json
{
  "title": "Junior QA Engineer",
  "position": "DEVELOPER",
  "description": "We are looking for a Junior QA Engineer to test web applications, identify bugs and ensure software meets functional, usability and quality requirements.",
  "requirements": "Understanding of software testing concepts, test cases, bug reporting and API testing. Knowledge of manual testing and basic automation is preferred.",
  "responsibilities": "Create and execute test cases, perform functional and regression testing, test REST APIs, identify and document bugs, verify bug fixes and collaborate with developers and the project manager to improve software quality.",
  "nice_to_have": "Postman, Playwright, Cypress, Selenium, API testing, SQL and experience with Agile development teams.",
  "employmentType": "FULL_TIME",
  "workplaceType": "HYBRID",
  "location": "Dhaka, Bangladesh",
  "salaryMin": 30000,
  "salaryMax": 55000,
  "experienceMin": 0,
  "experienceMax": 2,
  "skills": [
    "Software Testing",
    "Manual Testing",
    "API Testing",
    "Postman",
    "Playwright",
    "Regression Testing",
    "Bug Reporting",
    "SQL"
  ],
  "applicationDeadline": "2026-11-25T23:59:59.000Z"
}
```

---

# Developer

## Apply for Job

**POST** `/api/developer/apply-for-job`

**Access:** Public

Allows applicants to submit a job application with their resume and application information.

### Request

**Content-Type:** `multipart/form-data`

| Field    | Type | Description             |
| -------- | ---- | ----------------------- |
| `resume` | File | Applicant's resume      |
| `data`   | JSON | Application information |

### `data`

```json
{
  "jobOpeningId": "6ace0477-f856-4f1f-b8ab-a76f16b28895",
  "name": "Maliha Chowdhury",
  "email": "maliha.chowdhury@example.com",
  "contactNumber": "01515556677",
  "address": "Dhanmondi, Dhaka, Bangladesh",
  "coverLetter": "I am interested in the Junior QA Engineer position. I have experience with manual testing, API testing, test case design and bug reporting, and I enjoy ensuring applications are reliable and user friendly.",
  "portfolioUrl": "https://maliha.example.com",
  "githubUrl": "https://github.com/malihachowdhury",
  "linkedinUrl": "https://linkedin.com/in/malihachowdhury",
  "expectedSalary": 40000,
  "availableFrom": "2026-10-01"
}
```

---

## Hire Applicant

**POST** `/api/developer/hired`

**Access:** Admin

Hires a job applicant and creates the corresponding developer account/profile.

### Request Body

```json
{
  "applicationId": "6fe56bc4-507c-4956-aa95-5eb3b0823ea3"
}
```

---

## Reject Applicant

**POST** `/api/developer/rejected`

**Access:** Admin

Rejects a job application.

### Request Body

```json
{
  "applicationId": "bbc12710-5d46-4792-8654-465dec55099a"
}
```

---

## Get Developer Schedule

**GET** `/api/developer/:developerId/schedule`

Returns the developer's availability for the next 30 days.

### Example

```http
GET /api/developer/04435a57-aefb-4bbf-9b67-4556ed0fd1e7/schedule
```

---

## Get All Developers

**GET** `/api/developer/all-developers`

**Access:** Admin, Project Manager

Returns all developers available in the organization.

---

## Update Developer Profile

**PATCH** `/api/developer/developer-profile`

**Access:** Developer, Project Manager

Updates developer profile information.

### Request Body

```json
{
  "bio": "Full stack developer interested in building scalable and maintainable web applications.",
  "experienceYears": 2,
  "specialization": "DevOps, Backend Development, Cloud Technologies",
  "qualifications": "BSc in Computer Science and Engineering",
  "portfolioUrl": "https://rafiul.example.com",
  "githubUrl": "https://github.com/rafiulislam",
  "linkedinUrl": "https://linkedin.com/in/rafiulislam"
}
```

---

# Project

## Get All Services

**GET** `/api/project/all-services`

Returns all services offered by Raven.

---

## Create Project Request

**POST** `/api/project/project-request`

Creates a new project request for a selected service.

### Request Body

```json
{
  "serviceId": "2c727e07-f0ec-4030-b311-161c64b82b07",
  "projectDescription": "I need a modern e-commerce website with product management, user authentication, payment integration, and an admin dashboard."
}
```

---

## Get My Project Requests

**GET** `/api/project/my-requests`

Returns project requests created by the authenticated client.

---

## Get All Project Requests

**GET** `/api/project/all-project-request`

**Access:** Admin

Returns all project requests submitted by clients.

---

## Offer Project Price

**PATCH** `/api/project/offer-price/:projectRequestId`

**Access:** Admin

Allows the admin to review a project request and send a proposed project price to the client.

### Example

```http
PATCH /api/project/offer-price/73747fd0-e6f5-4e66-959f-c506f579e82d
```

### Request Body

```json
{
  "proposedPrice": 75000,
  "adminMessage": "The proposed price includes development, testing, and deployment."
}
```

---

## Create Project

**POST** `/api/project/create-project`

Creates a project from an approved project request.

### Request Body

```json
{
  "projectRequestId": "fd003fe9-b80f-49f9-9d4c-6700abb93f68",
  "title": "New Project creation",
  "description": "Build a complete e-commerce platform with admin dashboard and payment integration.",
  "startDate": "2026-09-25T00:00:00.000Z",
  "deadline": "2026-09-30T00:00:00.000Z",
  "projectManagerId": "8c9d5fca-3e06-44a7-a33f-23b95f78bce9"
}
```

---

## Assign Developer

**POST** `/api/project/assign-developer/:projectId`

Assigns a developer to a project for specific working dates.

### Example

```http
POST /api/project/assign-developer/518ada36-c3c1-477a-a367-557bc6ed42cb
```

### Request Body

```json
{
  "developerId": "4554ca1c-dd52-4700-8a66-798c52b43576",
  "dates": [
    "2026-09-25",
    "2026-09-29",
    "2026-09-30"
  ]
}
```

---

## Get Project Members

**GET** `/api/project/:projectId/members`

Returns the project manager and developers assigned to the project.

### Example

```http
GET /api/project/518ada36-c3c1-477a-a367-557bc6ed42cb/members
```

---

## Get Developer Schedule Report

**GET** `/api/project/:projectId/developer-schedule-report`

Returns the developer scheduling information associated with a project.

### Example

```http
GET /api/project/518ada36-c3c1-477a-a367-557bc6ed42cb/developer-schedule-report
```

---

## Get Project Progress

**GET** `/api/project/:projectId/progress`

Returns the current progress of a project.

---

# Payment

## Initiate Payment

**POST** `/api/project/payment-initiate`

Initiates payment for an approved project request.

### Request Body

```json
{
  "projectRequestId": "73747fd0-e6f5-4e66-959f-c506f579e82d"
}
```

---

## Pay

**POST** `/api/project/payment-initiate`

Processes payment using the project request information.

### Request Body

```json
{
  "projectRequestId": "73747fd0-e6f5-4e66-959f-c506f579e82d"
}
```

> **Note:** The current Postman collection uses the same endpoint for both `Initiate Payment` and `Pay`. Update the documentation if the payment flow is separated into different endpoints.

---

# Kanban

## Assign Task

**POST** `/api/kanban/assign-task`

Assigns a task to a developer within a project.

---

## Get All Tasks

**GET** `/api/kanban/all-task`

Returns all tasks available to the authenticated user according to their access level.

---

## Get Developer Tasks

**GET** `/api/kanban/developer-task/:developerId`

Returns tasks assigned to a specific developer.

### Example

```http
GET /api/kanban/developer-task/04435a57-aefb-4bbf-9b67-4556ed0fd1e7
```

---

## Update Task Status — Developer

**PATCH** `/api/kanban/developer/:taskId/status`

Allows a developer to update the status of an assigned task.

### Example

```http
PATCH /api/kanban/developer/156d5b22-2b37-41ab-9e61-28ad2a6ca8ec/status
```

### Request Body

```json
{
  "status": "DONE"
}
```

---

## Update Task Status — Project Manager

**PATCH** `/api/kanban/project-manager/:taskId/status`

Allows a project manager to review and update the status of a task.

### Example

```http
PATCH /api/kanban/project-manager/156d5b22-2b37-41ab-9e61-28ad2a6ca8ec/status
```

---

# Root

## Health Check

**GET** `/`

Returns the root response of the Raven API.

### Example

```http
GET https://raven-server-three.vercel.app/
```

---

# API Summary

| Module         | Method | Endpoint                                            |
| -------------- | ------ | --------------------------------------------------- |
| Authentication | GET    | `/api/auth/me`                                      |
| Authentication | POST   | `/api/auth/login`                                   |
| Authentication | POST   | `/api/auth/register`                                |
| Authentication | POST   | `/api/auth/verify-email`                            |
| Authentication | POST   | `/api/auth/forgot-password`                         |
| Authentication | POST   | `/api/auth/reset-password`                          |
| Authentication | POST   | `/api/auth/google`                                  |
| User           | PATCH  | `/api/user/profile-image`                           |
| User           | PATCH  | `/api/user/profile`                                 |
| Career         | POST   | `/api/career/job-opening`                           |
| Developer      | POST   | `/api/developer/apply-for-job`                      |
| Developer      | POST   | `/api/developer/hired`                              |
| Developer      | POST   | `/api/developer/rejected`                           |
| Developer      | GET    | `/api/developer/:developerId/schedule`              |
| Developer      | GET    | `/api/developer/all-developers`                     |
| Developer      | PATCH  | `/api/developer/developer-profile`                  |
| Project        | GET    | `/api/project/all-services`                         |
| Project        | POST   | `/api/project/project-request`                      |
| Project        | GET    | `/api/project/my-requests`                          |
| Project        | GET    | `/api/project/all-project-request`                  |
| Project        | PATCH  | `/api/project/offer-price/:projectRequestId`        |
| Project        | POST   | `/api/project/create-project`                       |
| Project        | POST   | `/api/project/assign-developer/:projectId`          |
| Project        | GET    | `/api/project/:projectId/members`                   |
| Project        | GET    | `/api/project/:projectId/developer-schedule-report` |
| Project        | GET    | `/api/project/:projectId/progress`                  |
| Payment        | POST   | `/api/project/payment-initiate`                     |
| Kanban         | POST   | `/api/kanban/assign-task`                           |
| Kanban         | GET    | `/api/kanban/all-task`                              |
| Kanban         | GET    | `/api/kanban/developer-task/:developerId`           |
| Kanban         | PATCH  | `/api/kanban/developer/:taskId/status`              |
| Kanban         | PATCH  | `/api/kanban/project-manager/:taskId/status`        |
| Root           | GET    | `/`                                                 |

---

# Authentication & Roles

Raven uses role-based access control for protected resources.

### Available Roles

* `ADMIN`
* `CLIENT`
* `PROJECT_MANAGER`
* `DEVELOPER`

### Access Levels

| Role                | Main Responsibilities                                                                                |
| ------------------- | ---------------------------------------------------------------------------------------------------- |
| **ADMIN**           | Manage users, job openings, applications, project requests, pricing, and overall platform operations |
| **CLIENT**          | Register, manage profile, request projects, review project offers, and make payments                 |
| **PROJECT_MANAGER** | Manage projects, assign developers, manage schedules, and review tasks                               |
| **DEVELOPER**       | Manage developer profile, view assigned tasks, manage task progress, and work on assigned projects   |

---

# Base URL

```text
https://raven-server-three.vercel.app
```
