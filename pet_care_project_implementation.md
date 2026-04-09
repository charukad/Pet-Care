# Pet Care Project Implementation Plan

## Project Goal

Build Pet Care as a single-platform veterinary booking and consultation system managed by one admin, with three main roles:

- User (pet owner)
- Doctor (vet)
- Admin

This plan converts the overview into a complete execution checklist so the full product can be built phase by phase without missing features.

## Delivery Principles

- [ ] Keep the system single-platform and non-SaaS
- [x] Use Next.js App Router for the frontend
- [x] Use Node.js + Express for the backend API
- [ ] Use MongoDB Atlas as the primary database
- [x] Use Socket.io for real-time messaging
- [ ] Use Cloudinary or AWS S3 for file and image storage
- [ ] Keep the UI mobile-first, clean, modern, and card-based
- [x] Apply JWT authentication and role-based authorization across the system

## Phase 0 - Discovery, Planning, and Setup

- [ ] Confirm final product scope from the overview and freeze the MVP, advanced, AI, and future enhancement lists
- [ ] Define user journeys for pet owners, doctors, and admin
- [x] Define frontend and backend folder structure
- [x] Set up the Next.js frontend project
- [x] Set up the Express backend project
- [x] Configure Tailwind CSS in the frontend project
- [x] Configure MongoDB connection and environment variables
- [ ] Configure shared coding standards, linting, formatting, and commit rules
- [ ] Define API naming conventions, response format, and error handling standards
- [ ] Define role permissions for user, doctor, and admin
- [ ] Create the initial project board and milestone structure
- [ ] Prepare local, staging, and production environment configurations

## Phase 1 - System Architecture and Core Data Design

- [ ] Design the high-level architecture for client, API, services, database, and external integrations
- [x] Define collection/schema structure for users
- [x] Define collection/schema structure for doctors
- [x] Define collection/schema structure for pets
- [x] Define collection/schema structure for bookings
- [x] Define collection/schema structure for messages and conversations
- [x] Define collection/schema structure for prescriptions
- [x] Define collection/schema structure for reviews and ratings
- [x] Define collection/schema structure for notifications
- [ ] Define collection/schema structure for uploaded files and pet condition images
- [x] Define collection/schema structure for payments
- [ ] Define collection/schema structure for audit logs and system monitoring events
- [ ] Define collection/schema structure for AI symptom checks
- [ ] Define collection/schema structure for AI health scores
- [ ] Define indexes for search, bookings, availability, chat history, and performance-critical queries
- [x] Create database seed data for doctors, users, specializations, and demo bookings

## Phase 2 - UI Foundation and Shared Frontend System

- [x] Implement the global layout, navigation, footer, and responsive shell
- [x] Set up the design system using the defined green, blue, white, and soft accent palette
- [ ] Build reusable UI components for cards, buttons, badges, inputs, modals, drawers, tabs, and tables
- [ ] Build reusable form components with validation messages and loading states
- [ ] Build skeleton loaders, empty states, error states, and success feedback components
- [x] Add smooth page transitions and targeted Framer Motion animations
- [ ] Ensure full mobile-first responsive behavior
- [ ] Implement image optimization for profile and pet images
- [x] Set up Axios API client utilities with auth-aware request handling
- [ ] Create route guards and dashboard layout wrappers for each role

## Phase 3 - Public Website and Doctor Discovery

- [x] Build the home page
- [x] Build the doctor listing page
- [x] Build the doctor profile page
- [x] Build the public specialization search experience
- [x] Show doctor specialization, experience, profile details, and availability summary
- [ ] Add pagination or incremental loading for doctor listing
- [x] Add SEO metadata for public pages
- [x] Add public call-to-action flows for booking and registration

## Phase 4 - Authentication and Access Control

- [x] Build user registration
- [x] Build user login
- [x] Build doctor login
- [x] Build admin login
- [x] Implement password hashing and secure credential storage
- [x] Implement JWT-based authentication
- [x] Implement token validation middleware
- [x] Implement role-based access control middleware
- [x] Protect private routes in the frontend and backend
- [x] Build logout flow
- [ ] Add forgot password and reset password flow
- [ ] Add email verification flow if required by release policy
- [ ] Add account profile management for all authenticated users

## Phase 5 - Admin Management Module

- [x] Build the admin dashboard
- [ ] Allow admin to create doctor accounts
- [ ] Allow admin to update doctor accounts
- [ ] Allow admin to deactivate or reactivate doctor accounts
- [ ] Allow admin to manage user accounts
- [x] Allow admin to view all bookings
- [ ] Allow admin to monitor system activity and platform health
- [ ] Allow admin to view consultation, prescription, payment, and notification summaries
- [ ] Add admin audit logging for sensitive actions

## Phase 6 - Doctor Module

- [x] Build the doctor dashboard
- [ ] Allow doctors to manage profile details
- [ ] Allow doctors to manage specialization and experience information
- [ ] Allow doctors to configure availability schedules
- [ ] Allow doctors to create recurring and custom time slots
- [ ] Allow doctors to block unavailable dates and times
- [x] Allow doctors to accept bookings
- [x] Allow doctors to reject bookings
- [x] Allow doctors to mark consultations as completed
- [x] Allow doctors to access booking history
- [x] Allow doctors to view chat conversations with pet owners
- [ ] Allow doctors to write consultation notes
- [x] Allow doctors to generate prescriptions

## Phase 7 - User Module and Pet Management

- [x] Build the user dashboard
- [ ] Allow users to manage their account profile
- [x] Allow users to add multiple pets
- [ ] Allow users to edit pet profiles
- [ ] Allow users to archive or remove pet profiles
- [ ] Store pet type, age, history, and supporting medical data
- [x] Build pet medical history timeline view
- [ ] Attach prescriptions and consultation outcomes to each pet
- [ ] Allow users to upload pet condition images
- [ ] Validate file size, type, and upload security rules

## Phase 8 - Booking System and Smart Calendar

- [x] Build the booking page
- [x] Allow users to select a doctor
- [x] Allow users to choose one of their pets for the appointment
- [x] Allow users to choose a date and time slot
- [ ] Show live slot availability before booking confirmation
- [x] Create booking records with Pending status
- [x] Allow doctors to change booking status to Accepted
- [x] Allow doctors to change booking status to Rejected
- [x] Allow doctors to change booking status to Completed
- [x] Show booking status history to users and doctors
- [x] Prevent double booking and time slot conflicts
- [ ] Lock or reserve slots during active booking checkout
- [x] Allow users to view upcoming and past bookings
- [x] Allow doctors to filter bookings by date, status, and patient
- [ ] Add smart calendar views for doctors and users
- [ ] Add appointment reschedule and cancellation rules if approved for release
- [ ] Add reminder scheduling tied to booking date and time

## Phase 9 - Real-Time Messaging and Consultation Communication

- [x] Build the chat page
- [x] Create conversation threads between user and doctor
- [x] Implement real-time messaging with Socket.io
- [x] Persist chat history in the database
- [x] Show message timestamps and delivery state
- [x] Restrict chat access to valid doctor-user booking relationships
- [ ] Add unread message indicators
- [ ] Add chat search or conversation filtering
- [x] Ensure chat works on mobile and desktop layouts

## Phase 10 - Prescription, Consultation, and Medical Records

- [x] Build prescription creation workflow for doctors
- [x] Support structured prescription entry with medicines, dosage, notes, and follow-up guidance
- [ ] Support PDF prescription upload
- [x] Store prescriptions against doctor, user, pet, and booking records
- [x] Allow users to view prescriptions
- [ ] Allow users to download prescriptions
- [ ] Add consultation summary records after each completed appointment
- [ ] Add searchable medical history across consultations, prescriptions, and notes

## Phase 11 - Remote Consultation and Media Support

- [ ] Integrate Google Meet or Zoom for MVP remote consultations
- [ ] Generate or store meeting links per eligible booking
- [ ] Show consultation join links to users and doctors at the correct time
- [ ] Add consultation readiness checks for booking status and permissions
- [ ] Ensure uploaded pet condition images are visible during consultation workflows
- [ ] Handle expired, cancelled, or rejected consultation sessions cleanly

## Phase 12 - Ratings, Reviews, Notifications, and Engagement

- [ ] Allow users to rate doctors after completed bookings
- [ ] Allow users to submit written reviews
- [ ] Show doctor ratings on profile and listing pages
- [ ] Add moderation or admin review controls for abusive feedback
- [ ] Integrate email notifications for registration, booking updates, reminders, and prescription availability
- [ ] Send appointment reminder notifications before consultation time
- [x] Send notification on booking acceptance and rejection
- [x] Send notification when a new prescription is issued
- [x] Build in-app notification center if included in the final release scope

## Phase 13 - Payments

- [ ] Decide whether the first release includes Stripe or PayHere
- [ ] Define consultation pricing model per doctor or service
- [ ] Build payment initiation flow from the booking journey
- [ ] Integrate selected payment gateway
- [ ] Store payment status, transaction reference, and invoice metadata
- [ ] Link payment state to booking state where required
- [ ] Handle payment success, failure, refund, and cancellation scenarios
- [ ] Add admin visibility into payment records
- [ ] Add user payment history view

## Phase 14 - AI Features

- [ ] Design safe product boundaries and disclaimers for AI-assisted features
- [ ] Build AI symptom checker input flow for pet owners
- [ ] Build AI service that suggests possible issues from entered symptoms
- [ ] Show symptom checker results with safety warnings and doctor escalation guidance
- [ ] Build AI prescription assistant for doctors
- [ ] Ensure AI prescription assistant only assists and does not auto-publish without doctor approval
- [ ] Build pet health score system using defined health indicators
- [ ] Store AI outputs with traceability and timestamps
- [ ] Add admin controls or monitoring for AI feature usage
- [ ] Add feedback loop to improve AI output quality over time

## Phase 15 - Security, Validation, and Compliance

- [ ] Validate all API inputs on the server
- [ ] Validate all critical forms on the client
- [ ] Secure private API routes by role and ownership
- [ ] Apply secure password, JWT, and secret management practices
- [ ] Add rate limiting for authentication and chat-sensitive endpoints
- [ ] Sanitize uploaded files and image metadata
- [ ] Restrict file access to authorized users
- [ ] Add request logging and suspicious activity monitoring
- [ ] Add audit trails for admin and doctor actions
- [ ] Review privacy handling for medical and personal pet data

## Phase 16 - Performance and Reliability

- [ ] Add API caching where safe and useful
- [ ] Add lazy loading for non-critical UI sections
- [ ] Optimize image delivery and transformations
- [ ] Optimize doctor listing, booking, and message queries
- [ ] Add pagination for large datasets
- [ ] Add background jobs or queues for email, reminders, and heavy async tasks
- [ ] Add retry handling for external service failures
- [ ] Add graceful fallback behavior when chat, email, storage, or video services fail

## Phase 17 - Testing and Quality Assurance

- [ ] Write unit tests for backend services and utilities
- [ ] Write API tests for authentication, booking, chat, prescriptions, and admin actions
- [ ] Write frontend component tests for critical UI pieces
- [ ] Write end-to-end tests for public browsing, auth, booking, chat, and prescription flows
- [ ] Test role permissions for user, doctor, and admin
- [ ] Test booking conflict prevention and time slot edge cases
- [ ] Test real-time chat delivery and persistence
- [ ] Test upload workflows for pet images and prescription PDFs
- [ ] Test payment flows if payments are enabled
- [ ] Test AI workflows and safety messaging if AI features are enabled
- [ ] Run mobile responsiveness and cross-browser testing
- [ ] Run accessibility testing on key user journeys

## Phase 18 - Deployment, Monitoring, and Release

- [ ] Prepare the frontend for Vercel deployment
- [ ] Prepare the backend for Render or Railway deployment
- [ ] Provision MongoDB Atlas for staging and production
- [ ] Configure Cloudinary or AWS S3 production storage
- [ ] Configure production environment secrets
- [ ] Set up domain, HTTPS, and CORS configuration
- [ ] Configure email provider and production sender settings
- [ ] Configure monitoring, uptime checks, and error tracking
- [ ] Add database backup and recovery plan
- [ ] Create release checklist for staging sign-off and production launch
- [ ] Run final smoke tests in production-like environment

## Phase 19 - Post-Launch Enhancements

- [ ] Plan the React Native mobile app
- [ ] Plan pharmacy integration for prescription fulfillment
- [ ] Plan GPS-based vet finder
- [ ] Evaluate analytics for product usage and retention
- [ ] Collect feedback from admin, doctors, and users for roadmap iteration

## Required Pages Checklist

- [x] Home page
- [x] Doctor listing page
- [x] Doctor profile page
- [x] Booking page
- [x] Chat page
- [x] User dashboard
- [x] Doctor dashboard
- [x] Admin dashboard
- [x] Authentication pages
- [ ] Pet management pages
- [x] Prescription and medical history pages
- [x] Notification views
- [ ] Payment views if payments are enabled

## Required Backend Modules Checklist

- [x] Authentication module
- [ ] User module
- [ ] Doctor module
- [x] Pet module
- [x] Booking module
- [ ] Availability and calendar module
- [x] Messaging and Socket.io module
- [x] Prescription module
- [ ] Upload and storage module
- [ ] Review and rating module
- [ ] Notification and email module
- [ ] Payment module
- [ ] AI services module
- [ ] Admin monitoring module

## Definition of Done

- [x] Public users can browse, search, and view doctors without logging in
- [ ] Pet owners can register, log in, manage pets, book appointments, chat with doctors, and view prescriptions and medical history
- [ ] Doctors can manage availability, respond to bookings, chat with users, provide consultations, and generate prescriptions
- [ ] Admin can manage doctors, users, bookings, and system monitoring from one platform
- [ ] Real-time chat works reliably
- [x] Booking status flow supports Pending, Accepted, Rejected, and Completed
- [ ] Prescription workflow supports structured data and PDF upload
- [ ] Remote consultation workflow is functional for MVP
- [ ] Ratings, reviews, notifications, image uploads, and smart calendar features are complete
- [ ] Payment flow is complete if enabled for release
- [ ] AI features are implemented safely if included in release scope
- [ ] Security, performance, testing, and deployment tasks are completed
