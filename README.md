# Raven API Documentation

**Base URL:** `https://raven-server-three.vercel.app`

---

## Auth

### GET `/api/auth/me`

**Name:** Get Me (Log In)
**Status:** ✅

Returns the currently authenticated user's information.

---

### POST `/api/auth/login`

**Name:** Login
**Status:** ✅

#### Request Body

```json
{
  "email": "john.doe@gmail.com",
  "password": "John@12345"
}
```

#### Test Accounts

**Admin**

```json
{
  "email": "admin@gmail.com",
  "password": "Admin@12345"
}
```

**Project Manager**

```json
{
  "email": "tanvir.hasan@example.com",
  "password": "r3i5y89A@a1"
}
```

**DevOps Developer**

```json
{
  "email": "rafiul.islam@example.com",
  "password": "811pvcoA@a1"
}
```

**QA Developer**

```json
{
  "email": "maliha.chowdhury@example.com",
  "password": "zuktp62A@a1"
}
```

**Frontend Developer**

```json
{
  "email": "nusrat.jahan@example.com",
  "password": "1lip2zdA@a1"
}
```

---

### POST `/api/auth/register`

**Name:** Register Client
**Status:** ✅

#### Request Body

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

### POST `/api/auth/verify-email`

**Name:** Verify Email
**Status:** ✅

#### Request Body

```json
{
  "email": "john.doe@gmail.com",
  "otp": "868955"
}
```

---

### POST `/api/auth/forgot-password`

**Name:** Forgot Password
**Status:** ✅

#### Request Body

```json
{
  "email": "rahim.ahmed@example.com"
}
```

---

### POST `/api/auth/reset-password`

**Name:** Reset Password
**Status:** ✅

#### Request Body

```json
{
  "email": "rahim.ahmed@example.com",
  "newPassword": "NewSecurePass@123",
  "otp": "883824"
}
```

---

### POST `/api/auth/google`

**Name:** Google Login
**Status:** ✅

#### Request Body

```json
{
  "idToken": ""
}
```

---

# User

## PATCH `/api/user/profile-image`

**Name:** Update Profile Image
**Status:** ✅

**Body:** `form-data`

| Key            | Type | Value         |
| -------------- | ---- | ------------- |
| `profileImage` | File | Profile image |

---

## PATCH `/api/user/profile`

**Name:** Update My Profile
**Status:** ✅

#### Request Body

```json
{
  "name": "Rafiul Islam",
  "contactNumber": "01614445567",
  "address": "Gulshan, Dhaka, Bangladesh"
}
```

---

# Career

## POST `/api/career/job-opening`

**Name:** Create Job Opening
**Role:** Admin
**Status:** ✅

#### Request Body

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

## POST `/api/developer/apply-for-job`

**Name:** Job Apply
**Access:** Public
**Status:** ✅

**Body:** `form-data`

| Key      | Type | Description             |
| -------- | ---- | ----------------------- |
| `resume` | File | Applicant resume        |
| `data`   | JSON | Application information |

#### `data`

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

## POST `/api/developer/hired`

**Name:** Hire Applicant
**Role:** Admin
**Status:** ✅

#### Request Body

```json
{
  "applicationId": "6fe56bc4-507c-4956-aa95-5eb3b0823ea3"
}
```

---

## POST `/api/developer/rejected`

**Name:** Reject Applicant
**Role:** Admin
**Status:** ✅

#### Request Body

```json
{
  "applicationId": "bbc12710-5d46-4792-8654-465dec55099a"
}
```

---

## GET `/api/developer/:developerId/schedule`

**Name:** Developer Next 30-Day Availability

#### Example

```text
GET /api/developer/04435a57-aefb-4bbf-9b67-4556ed0fd1e7/schedule
```

---

## GET `/api/developer/all-developers`

**Name:** Get All Developers
**Access:** Admin & Project Manager
**Status:** ✅

---

## PATCH `/api/developer/developer-profile`

**Name:** Update Developer Profile
**Access:** Developer & Project Manager
**Status:** ✅

#### Request Body

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

## GET `/api/project/all-services`

**Name:** Get All Services
**Status:** ✅

---

## POST `/api/project/project-request`

**Name:** Create Project Request
**Status:** ✅

#### Request Body

```json
{
  "serviceId": "2c727e07-f0ec-4030-b311-161c64b82b07",
  "projectDescription": "I need a modern e-commerce website with product management, user authentication, payment integration, and an admin dashboard."
}
```

---

## GET `/api/project/my-requests`

**Name:** Get My Project Requests
**Status:** ✅

---

## GET `/api/project/all-project-request`

**Name:** Get All Project Requests
**Role:** Admin
**Status:** ✅

---

## PATCH `/api/project/offer-price/:projectRequestId`

**Name:** Offer Project Price
**Role:** Admin
**Status:** ✅

#### Example

```text
PATCH /api/project/offer-price/73747fd0-e6f5-4e66-959f-c506f579e82d
```

#### Request Body

```json
{
  "proposedPrice": 75000,
  "adminMessage": "The proposed price includes development, testing, and deployment."
}
```

---

## POST `/api/project/create-project`

**Name:** Create Project
**Status:** ✅

#### Request Body

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

## POST `/api/project/assign-developer/:projectId`

**Name:** Assign Developer
**Status:** ✅

#### Example

```text
POST /api/project/assign-developer/518ada36-c3c1-477a-a367-557bc6ed42cb
```

#### Request Body

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

## GET `/api/project/:projectId/members`

**Name:** Get Project Members

#### Example

```text
GET /api/project/518ada36-c3c1-477a-a367-557bc6ed42cb/members
```

---

## GET `/api/project/:projectId/developer-schedule-report`

**Name:** Developer Schedule Report

#### Example

```text
GET /api/project/518ada36-c3c1-477a-a367-557bc6ed42cb/developer-schedule-report
```

---

## GET `/api/project/:projectId/progress`

**Name:** Get Project Progress

---

# Payment

## POST `/api/project/payment-initiate`

**Name:** Payment Initiate
**Status:** ✅

#### Request Body

```json
{
  "projectRequestId": "73747fd0-e6f5-4e66-959f-c506f579e82d"
}
```

---

## POST `/api/project/payment-initiate`

**Name:** Pay

#### Request Body

```json
{
  "projectRequestId": "73747fd0-e6f5-4e66-959f-c506f579e82d"
}
```

> **Note:** Both `Payment Initiate` and `Pay` currently use the same endpoint. If they are intended to represent different operations, the endpoint or request name should be updated accordingly.

---

# Kanban

## POST `/api/kanban/assign-task`

**Name:** Assign Task

---

## GET `/api/kanban/all-task`

**Name:** Get All Tasks

---

## GET `/api/kanban/developer-task/:developerId`

**Name:** Get Developer Tasks

#### Example

```text
GET /api/kanban/developer-task/04435a57-aefb-4bbf-9b67-4556ed0fd1e7
```

---

## PATCH `/api/kanban/developer/:taskId/status`

**Name:** Update Task Status — Developer
**Status:** ✅

#### Example

```text
PATCH /api/kanban/developer/156d5b22-2b37-41ab-9e61-28ad2a6ca8ec/status
```

#### Request Body

```json
{
  "status": "DONE"
}
```

---

## PATCH `/api/kanban/project-manager/:taskId/status`

**Name:** Update Task Status — Project Manager

#### Example

```text
PATCH /api/kanban/project-manager/156d5b22-2b37-41ab-9e61-28ad2a6ca8ec/status
```

---

# Root

## GET `/`

**Name:** Root

```text
GET https://raven-server-three.vercel.app/
```

---

# API Summary

| Module    | Method | Endpoint                                            | Status |
| --------- | ------ | --------------------------------------------------- | ------ |
| Auth      | GET    | `/api/auth/me`                                      | ✅      |
| Auth      | POST   | `/api/auth/login`                                   | ✅      |
| Auth      | POST   | `/api/auth/register`                                | ✅      |
| Auth      | POST   | `/api/auth/verify-email`                            | ✅      |
| Auth      | POST   | `/api/auth/forgot-password`                         | ✅      |
| Auth      | POST   | `/api/auth/reset-password`                          | ✅      |
| Auth      | POST   | `/api/auth/google`                                  | ✅      |
| User      | PATCH  | `/api/user/profile-image`                           | ✅      |
| User      | PATCH  | `/api/user/profile`                                 | ✅      |
| Career    | POST   | `/api/career/job-opening`                           | ✅      |
| Developer | POST   | `/api/developer/apply-for-job`                      | ✅      |
| Developer | POST   | `/api/developer/hired`                              | ✅      |
| Developer | POST   | `/api/developer/rejected`                           | ✅      |
| Developer | GET    | `/api/developer/:developerId/schedule`              | —      |
| Developer | GET    | `/api/developer/all-developers`                     | ✅      |
| Developer | PATCH  | `/api/developer/developer-profile`                  | ✅      |
| Project   | GET    | `/api/project/all-services`                         | ✅      |
| Project   | POST   | `/api/project/project-request`                      | ✅      |
| Project   | GET    | `/api/project/my-requests`                          | ✅      |
| Project   | GET    | `/api/project/all-project-request`                  | ✅      |
| Project   | PATCH  | `/api/project/offer-price/:projectRequestId`        | ✅      |
| Project   | POST   | `/api/project/create-project`                       | —      |
| Project   | POST   | `/api/project/assign-developer/:projectId`          | —      |
| Project   | GET    | `/api/project/:projectId/members`                   | —      |
| Project   | GET    | `/api/project/:projectId/developer-schedule-report` | —      |
| Project   | GET    | `/api/project/:projectId/progress`                  | —      |
| Payment   | POST   | `/api/project/payment-initiate`                     | ✅      |
| Kanban    | POST   | `/api/kanban/assign-task`                           | —      |
| Kanban    | GET    | `/api/kanban/all-task`                              | —      |
| Kanban    | GET    | `/api/kanban/developer-task/:developerId`           | —      |
| Kanban    | PATCH  | `/api/kanban/developer/:taskId/status`              | ✅      |
| Kanban    | PATCH  | `/api/kanban/project-manager/:taskId/status`        | —      |
| Root      | GET    | `/`                                                 | —      |

---

## Base URL

```text
https://raven-server-three.vercel.app
```

## Authentication

Protected endpoints require authentication using the authentication mechanism configured by the Raven API.

**Primary roles:**

* `ADMIN`
* `CLIENT`
* `PROJECT_MANAGER`
* `DEVELOPER`
