# Roar Fitness ERP — API Reference

Base URL: `http://localhost:5188/api`

Swagger UI (development): `http://localhost:5188/swagger`

Scalar API docs (development): `http://localhost:5188/scalar/v1`

OpenAPI JSON: `http://localhost:5188/swagger/v1/swagger.json`

---

## Authentication API — `/api/authentication`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/login` | No | Login for Admin, Member, Instructor |
| GET | `/me` | JWT | Current user identity and roles |

---

## Membership API — `/api/membership`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/packages` | No | List active membership packages |
| POST | `/register` | No | Online member registration (JOIN US) |
| GET | `/profile` | Member | Member profile, age, emergency contact |
| PUT | `/profile` | Member | Update editable profile fields |
| GET | `/instructor/profile` | Instructor | Instructor profile and age |
| PUT | `/instructor/profile` | Instructor | Update editable profile fields |
| GET | `/members` | Admin | List all members |
| POST | `/members` | Admin | Create member at gym (walk-in) |
| GET | `/instructors` | Admin | List instructors |
| POST | `/instructors` | Admin | Create instructor account |

---

## Payment Gateway API — `/api/payment-gateway`

PayHere integration (Sri Lanka). Sandbox configured in `appsettings.json`.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/membership/init?memberId=&packageId=` | No | Start membership payment |
| POST | `/membership/confirm?packageId=` | No | Confirm payment & activate membership |
| POST | `/webhook/payhere` | No | PayHere IPN webhook |

---

## Attendance API — `/api/attendance`

Entry-only fingerprint scanner at the gym entrance. Each scan validates active membership (members) or staff access (instructors) and logs the result. There is no exit scan.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/scan` | No | Validate entry and log scan (scanner device) |
| POST | `/fingerprint/member/activate` | Admin | Register member fingerprint at gym |
| POST | `/fingerprint/instructor/activate` | Admin | Register instructor fingerprint |
| GET | `/logs/today` | Admin, Instructor | Today's entry scan logs |

**Scan request body:** `{ "fingerprintTemplateId": "...", "scannerDeviceId": "..." }`

**Scan response:** `{ "accessGranted": true/false, "message": "...", "personName": "...", "personType": "Member|Instructor", "loggedAt": "..." }`

---

## Inventory API — `/api/inventory`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Admin | All products with stock levels |
| POST | `/adjust` | Admin | Add/remove stock with audit reason |

---

## POS API — `/api/pos`

In-gym point of sale (integrated with ERP revenue).

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/sale` | Admin | In-gym sale (Cash/Card) |

---

## Reports API — `/api/reports`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/summary` | Admin | Membership + POS revenue |

---

## Public Website API — `/api/public`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/packages` | No | Membership packages for public site |
| GET | `/trainers` | No | Trainer profiles |
| POST | `/contact` | No | Contact form submission |

---

## Backend service layer

| Interface | Implementation | Controller |
|-----------|----------------|------------|
| `IAuthenticationService` | `AuthenticationService` | `AuthenticationController` |
| `IMembershipService` | `MembershipService` | `MembershipController` |
| `IPaymentGatewayService` | `PaymentGatewayService` | `PaymentGatewayController` |
| `IAttendanceService` | `AttendanceService` | `AttendanceController` |
| `IInventoryService` | `InventoryService` | `InventoryController` |
| `IPosService` | `PosService` | `PosController` |
| `IReportService` | `ReportService` | `ReportsController` |
| `IPublicContentService` | `PublicContentService` | `PublicController` |

---

## Default admin credentials

- Email: `admin@roarfitness.lk`
- Password: `Admin@123`

Change these before production deployment.
