# ANUTEX PARIKRAMA

## README / ACCESS GUIDE / ROLE WORKFLOW DOCUMENT

# APPLICATION OVERVIEW

Anutex Parikrama is an industrial enterprise checklist and verification system designed for factory operations.

The application is used to:

* manage daily operational checklists
* upload image evidence
* verify completed work
* maintain audit and operational tracking

The app contains 3 roles:

1. USER
2. ADMIN
3. SUPER ADMIN

The current version is fully functional locally using browser storage simulation.

Only these integrations are currently mocked:

* real cloud/database
* real cloud image storage
* real OTP SMS provider

Everything else behaves like a real production workflow system.

---

## TECH STACK

Frontend:

* React
* Vite
* Vanilla CSS

Storage:

* localStorage simulation

Image Handling:

* Camera API
* File Upload
* Industrial Mock Gallery

---

## INSTALLATION & RUNNING

1. Clone Repository

```bash
git clone <repository-url>
```

2. Open Project

```bash
cd anutex-parikrama
```

3. Install Dependencies

```bash
npm install
```

4. Start Development Server

```bash
npm run dev
```

5. Open Application

[http://localhost:5173](http://localhost:5173)

---

## DEFAULT TEST OTP

Phone Number:
`+91 99999 99999`

OTP:
`123456`

---

## ROLE STRUCTURE

The application contains 3 roles:

1. USER
2. ADMIN
3. SUPER ADMIN

---

## SUPER ADMIN ACCESS

DEFAULT SUPER ADMIN ACCOUNT

Employee ID:
`SUPER1`

Password:
`password`

Role:
`SUPERADMIN`

---

## SUPER ADMIN RESPONSIBILITIES

The Super Admin is the highest authority in the system.

Super Admin can:

* approve new admins
* manage admin accounts
* view audit logs
* monitor system activity
* run compliance purge simulation
* manage overall system workflow

---

## ADMIN ACCESS

Authorized Admin IDs:

* `ADM1001`
* `ADM1002`

Admin accounts are NOT active immediately after registration.

---

## ADMIN CREATION FLOW

STEP 1:
Register using authorized Admin Employee ID.

Example:
`ADM1001`

STEP 2:
Account status becomes:
`PENDING_APPROVAL`

STEP 3:
Super Admin logs into:
`SUPER1` / `password`

STEP 4:
Super Admin opens approval panel.

STEP 5:
Super Admin clicks:
`Approve & Generate Code`

STEP 6:
System generates 4-digit activation code.

Example:
`8412`

STEP 7:
Admin logs in again.

STEP 8:
Admin enters activation code.

STEP 9:
Admin account becomes ACTIVE.

---

## ADMIN RESPONSIBILITIES

Admins can:

* verify employee submissions
* inspect uploaded evidence
* manage checklist templates
* monitor employee activity
* view operational records

---

## USER ACCESS

Authorized User IDs:
* `EMP1001`
* `EMP1002`
* `EMP1003`
* `EMP1004`
* `EMP1005`
* `EMP1006`
* `EMP1007`
* `EMP1008`
* `EMP1009`
* `EMP1010`

---

## USER REGISTRATION FLOW

STEP 1:
Register using valid Employee ID.

STEP 2:
Enter:

* Full Name
* Phone Number
* Password

STEP 3:
OTP verification required.

Use:
`OTP = 123456`

STEP 4:
Account created successfully.

STEP 5:
Login using Employee ID and password.

---

## USER APPLICATION FLOW

BOTTOM NAVIGATION:

* Checklist
* Profile

---

## CHECKLIST WORKFLOW

Users receive daily checklist items.

Example:

* Machine Safety Check
* Electrical Panel Vitals
* Fire Suppression Scan

---

## CHECKLIST COMPLETION RULES

A checklist item becomes COMPLETED only if:

1. User opens checklist item
2. User uploads image evidence
3. User presses SAVE

ALL 3 actions are mandatory.

---

## IMPORTANT LOCKING LOGIC

Without image:
SAVE button remains disabled.

If user exits before SAVE:
checklist item remains pending.

After SAVE:

* checklist item becomes locked
* image cannot be changed
* item cannot be undone

After FINAL SUBMIT:

* entire checklist becomes read-only

---

## ADMIN VERIFICATION FLOW

Admins open:
`DATA` section.

Admins can:

* filter by employee
* filter by date
* inspect checklist items
* open uploaded evidence
* verify work

---

## VERIFICATION COUNTS

Example:

Verified: `2/5`

Meaning:

* 5 completed checklist items exist
* admin verified 2 items

---

## IMPORTANT IMAGE RULE

Images are ONLY used as:
verification evidence.

The app should NEVER behave like:

* gallery app
* media manager
* image browser

---

## RETENTION POLICY

The application stores:

* checklist records
* uploaded evidence
* verification logs

for:
45 days only.

The Compliance Purge simulation removes old records automatically.

---

## LOCAL STORAGE STRUCTURE

The application uses localStorage with these keys:

`parikrama_users`
`parikrama_admin_requests`
`parikrama_checklists`
`parikrama_templates`
`parikrama_audit_logs`
`parikrama_notifications`

---

## IMPORTANT DEVELOPMENT NOTE

The architecture is modular and production-ready.

Later integrations can replace:

* localStorage → real database
* local image storage → cloud storage
* simulated OTP → real SMS provider

without redesigning the app.

---

## FINAL APPLICATION PURPOSE

This application is designed to behave like:

* industrial workflow software
* factory operations system
* checklist verification platform
* enterprise inspection application

The UI and workflows prioritize:

* simplicity
* readability
* operational trust
* workflow efficiency
* industrial usability
* production readiness
