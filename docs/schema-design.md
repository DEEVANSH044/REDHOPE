# PostgreSQL Schema Design – redhope

## Overview
This document defines the normalized relational database schema for the
redhope blood donation management system. The design focuses on data
consistency, scalability, and efficient querying.

---

## Core Entities

1. User – Represents all registered users
2. Role – Defines system access levels
3. Donor – Stores donor-specific information
4. Hospital – Represents hospitals requesting blood
5. BloodGroup – Normalized blood group data
6. BloodRequest – Blood requirements raised by hospitals
7. Donation – Records donation history

---

## Entity Relationships

- A User belongs to one Role
- A User can be a Donor or a Hospital
- A Donor belongs to one Blood Group
- A Hospital can create multiple Blood Requests
- Each Blood Request is associated with one Blood Group
- A Donor can have multiple Donation records

---

## Logical Schema Design

### User
- id (PK)
- name
- email (UNIQUE)
- password
- role_id (FK → Role.id)
- created_at
- updated_at

### Role
- id (PK)
- name (UNIQUE)

### BloodGroup
- id (PK)
- type (UNIQUE)

### Donor
- id (PK)
- user_id (FK → User.id)
- blood_group_id (FK → BloodGroup.id)
- age
- last_donation_date
- is_available

### Hospital
- id (PK)
- user_id (FK → User.id)
- name
- address
- contact_number

### BloodRequest
- id (PK)
- hospital_id (FK → Hospital.id)
- blood_group_id (FK → BloodGroup.id)
- quantity
- status
- created_at

### Donation
- id (PK)
- donor_id (FK → Donor.id)
- quantity
- donation_date

---

## Constraints

- User email must be unique
- Blood group types are unique
- Foreign keys enforce relational integrity
- NOT NULL constraints ensure required data
- Cascade deletes prevent orphan records

---

## Normalization

### First Normal Form (1NF)
- All attributes contain atomic values
- No repeating or multi-valued fields

### Second Normal Form (2NF)
- All non-key attributes depend fully on the primary key

### Third Normal Form (3NF)
- No transitive dependencies
- Role, BloodGroup, and User data are separated to avoid redundancy

---

## Scalability Considerations

- Role-based design supports RBAC implementation
- Normalized tables reduce duplication
- Indexed foreign keys improve query performance
- Schema supports future extensions like alerts, campaigns, and analytics
