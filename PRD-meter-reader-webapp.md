# Product Requirements Document: Meter Reader Web Application

## 1. Introduction

The Meter Reader Web Application is a user-friendly interface that enables property managers, homeowners, and utility companies to digitize and track utility meter readings through automated image recognition. The application leverages AI-powered vision technology to extract meter readings from photographs, eliminating manual transcription errors and streamlining the meter reading process.

### 1.1 Document Purpose

This PRD defines the requirements for the web-based frontend application that interfaces with the existing Meter Reader Backend API.

### 1.2 Stakeholders

- **End Users**: Property managers, facility managers, homeowners
- **Utility Companies**: Energy providers requiring meter reading data
- **Development Team**: Frontend and backend developers
- **Product Owner**: Business stakeholder responsible for feature prioritization

---

## 2. Problem Statement

### 2.1 Current Challenges

1. **Manual Data Entry Errors**: Handwritten or manually typed meter readings are prone to transcription errors, leading to incorrect billing and disputes
2. **Time-Consuming Process**: Physical meter reading and manual data entry requires significant time investment from property managers
3. **Limited Historical Tracking**: Paper-based or spreadsheet tracking makes it difficult to analyze consumption patterns over time
4. **Multiple Meter Types**: Managing different meter types (electricity, water, gas) requires different knowledge and processes
5. **Verification Difficulty**: No easy way to verify the accuracy of recorded readings or trace back to source images

### 2.2 Business Impact

- Billing inaccuracies leading to revenue loss or customer disputes
- Labor costs associated with manual meter reading
- Delayed detection of abnormal consumption patterns
- Poor customer experience due to billing errors

---

## 3. Solution/Feature Overview

The Meter Reader Web Application provides a modern, responsive web interface that allows users to:

### 3.1 Core Features

1. **User Authentication & Account Management**

   - Secure user registration with email verification
   - Login with email and password (2-step authentication)
   - Password reset functionality
   - User profile management
   - Session management with automatic logout
   - Role-based access control (Admin, Property Manager, Viewer)

2. **Image Upload & Processing**

   - Drag-and-drop or click-to-upload interface
   - Real-time image preview
   - Instant AI-powered meter reading extraction
   - Feedback of identified values for immediate input correction
   - Support for electricity, water, and gas meters

3. **Reading Management**

   - View all historical meter readings in a searchable table
   - Filter readings by meter ID, date range, or meter type
   - Sort and paginate large datasets

4. **Meter Dashboard**

   - Individual meter detail pages showing reading history
   - Consumption trend visualization (charts/graphs)
   - Latest readings display with confidence score
   - Alerts for unusual consumption patterns

5. **Statistics & Analytics**

   - Overall statistics dashboard
   - Breakdown by meter type (electricity, water, gas)
   - Average confidence scores
   - Processing performance metrics

6. **Multi-Meter Management**
   - Organize meters by property or location
   - Batch upload for multiple meters
   - Meter grouping and categorization

---

## 4. User Stories

### 4.1 User Authentication & Account Management

**US-001: User Registration**

```gherkin
As a new user,
I want to register with my email and password
So that I can create a personal account to manage my meter readings
```

**US-002: User Login**

```gherkin
As a registered user,
I want to log in with my email and password using 2-step authentication
So that I can securely access my meter reading data
```

**US-003: Password Reset**

```gherkin
As a user who forgot their password,
I want to request a password reset link via email
So that I can regain access to my account without contacting support
```

**US-004: User Profile Management**

```gherkin
As a logged-in user,
I want to view and edit my profile information
So that I can keep my account details up to date
```

**US-005: Session Management**

```gherkin
As a logged-in user,
I want my session to remain active for a reasonable time
So that I don't have to repeatedly log in during active use
```

**US-006: Secure Logout**

```gherkin
As a logged-in user,
I want to log out of my account
So that my data remains secure when I'm done using the application
```

**US-007: Role-Based Access**

```gherkin
As an administrator,
I want to assign different roles to users (Admin, Property Manager, Viewer)
So that I can control what actions each user can perform in the system
```

### 4.2 Image Upload & Reading Extraction

**US-008: Upload Meter Image**

```gherkin
As a property manager,
I want to upload a photo of my utility meter
So that I can automatically extract the reading without manual entry
```

**US-009: View Confidence Score**

```gherkin
As a property manager,
I want to see a confidence score for each extracted reading
So that I can verify low-confidence readings manually before submitting
```

**US-010: Batch Upload Multiple Meters**

```gherkin
As a facility manager,
I want to upload multiple meter images at once
So that I can process all meters in a building efficiently
```

### 4.2 Reading Management

**US-011: View Reading History**

```gherkin
As a homeowner,
I want to view all my historical meter readings in chronological order
So that I can track my utility consumption over time
```

**US-012: Filter Readings by Meter**

```gherkin
As a property manager with multiple properties,
I want to filter readings by specific meter ID
So that I can isolate data for individual properties
```

**US-013: Export Reading Data**

```gherkin
As an accountant,
I want to export meter readings to CSV format
So that I can import them into billing systems or spreadsheets
```

**US-014: Search Readings**

```gherkin
As a utility company administrator,
I want to search readings by date range or meter ID
So that I can quickly find specific reading records for customer inquiries
```

### 4.3 Meter Dashboard & Analytics

**US-015: View Meter Details**

```gherkin
As a property manager,
I want to see detailed information about a specific meter
So that I can understand its reading history and consumption patterns
```

**US-016: Consumption Trend Visualization**

```gherkin
As a homeowner,
I want to see my consumption trends in a line chart
So that I can identify periods of high usage and optimize my energy consumption
```

**US-017: Statistics Dashboard**

```gherkin
As a facility manager,
I want to view aggregate statistics across all my meters
So that I can get an overview of total consumption and meter distribution
```

**US-018: Detect Anomalies**

```gherkin
As a property manager,
I want to be alerted when a reading shows unusual consumption
So that I can investigate potential leaks or meter malfunctions early
```

### 4.4 User Experience

**US-019: Mobile-Responsive Interface**

```gherkin
As a field technician,
I want to use the application on my smartphone while on-site
So that I can capture and submit readings immediately without returning to the office
```

**US-020: Image Preview Before Upload**

```gherkin
As a user,
I want to preview the image before uploading
So that I can ensure the meter display is clearly visible and retry if needed
```

**US-021: Processing Status Feedback**

```gherkin
As a user,
I want to see a loading indicator while the image is being processed
So that I understand the system is working and know when to expect results
```

### 4.5 Data Quality & Verification

**US-022: Review Low-Confidence Readings**

```gherkin
As a quality assurance manager,
I want to filter readings below 70% confidence score
So that I can manually verify and correct them before finalizing billing
```

**US-023: View Original Image**

```gherkin
As a billing administrator,
I want to view the original meter image associated with each reading
So that I can verify disputed charges with visual evidence
```

**US-024: Duplicate Detection**

```gherkin
As a quality assurance manager,
I want to be informated that a reading with identical values already exists in the database
So that duplicates can be prevented before persistence
```

---

## 5. Technical Requirements

### 5.1 Frontend Technology Stack

- **Framework**: React.js (modern component-based framework)
- **UI Library**: Tailwind CSS
- **State Management**: Redux
- **Authentication**: Supabase Auth (handles user registration, login, sessions, and role management)
- **Database Client**: Supabase JavaScript Client (@supabase/supabase-js)
- **Data Visualization**: Chart.js, Recharts, or D3.js
- **Build Tool**: Vite or Create React App

### 5.2 Backend API Integration

#### 5.2.1 Supabase Services

The application uses Supabase for authentication and database operations:

**Authentication (Supabase Auth)**:
- User registration with email/password
- Email verification
- Login/logout
- Password reset
- Session management
- JWT token handling
- Role-based access control via Supabase user metadata

**Database (Supabase PostgreSQL)**:
- Direct access to `meter_readings` table
- Access to `latest_meter_readings` view
- Access to `meter_statistics` view
- Row Level Security (RLS) policies for data isolation

#### 5.2.2 Custom Backend API Endpoints

The application integrates with the Node.js/Express backend for AI processing:

| Endpoint                  | Method | Purpose                            |
| ------------------------- | ------ | ---------------------------------- |
| `/api/meter-reading`      | POST   | Upload meter image for processing  |
| `/api/readings`           | GET    | Fetch all readings with pagination |
| `/api/readings/:meter_id` | GET    | Fetch readings for specific meter  |
| `/api/stats`              | GET    | Fetch aggregated statistics        |
| `/health`                 | GET    | Health check                       |

**Note**: Authentication endpoints are handled entirely by Supabase Auth, not the custom backend.

### 5.3 Functional Requirements

#### 5.3.0 User Authentication (Supabase Auth)

All authentication is handled by Supabase Auth, leveraging its built-in features:

- **Registration** (via `supabase.auth.signUp()`):
  - Email and password required
  - Client-side password strength validation (minimum 8 characters, uppercase, lowercase, number)
  - Automatic email verification via Supabase email templates
  - Built-in duplicate email detection by Supabase
  - Success/error feedback from Supabase response

- **Login** (via `supabase.auth.signInWithPassword()`):
  - Email and password authentication
  - Optional: Email OTP for 2-step verification (Supabase feature)
  - Persistent sessions using Supabase session management
  - Rate limiting and security features built into Supabase
  - Automatic JWT token generation by Supabase

- **Password Reset** (via `supabase.auth.resetPasswordForEmail()`):
  - Email-based password reset flow using Supabase templates
  - Secure reset token with expiration managed by Supabase
  - Password confirmation matching on client-side
  - Success notification after password update

- **Session Management**:
  - Automatic session refresh via Supabase client (`supabase.auth.onAuthStateChange`)
  - JWT tokens stored securely by Supabase client (localStorage with encryption)
  - Session persistence across browser tabs
  - Automatic token refresh before expiration
  - Configurable session timeout in Supabase dashboard

- **Authorization**:
  - Role-based permissions stored in Supabase user metadata (`user.user_metadata.role`)
  - Roles: Admin, Property Manager, Home Owner, Viewer
  - Protected routes using `supabase.auth.getSession()` checks
  - Redirect to login for unauthenticated access
  - Permission-based UI element visibility based on user role
  - Row Level Security (RLS) policies in database for data isolation per user

**Implementation Notes**:
- Initialize Supabase client with project URL and anon key from environment variables
- Listen to auth state changes for real-time session updates
- Store user role in user_metadata during registration or via admin panel
- Apply RLS policies to `meter_readings` table for multi-tenant data separation

#### 5.3.1 Image Upload

- Accept image formats: JPEG, PNG, WebP, GIF
- Maximum file size: 5MB (as configured in backend)
- Drag-and-drop support
- Multiple file selection for batch upload
- Client-side image validation before upload
- Display upload progress indicator
- Client-side feedback form to verify identified values for each uploaded image
- Persist meter readings only after user accepts values

#### 5.3.2 Reading Display

- Tabular view with columns:
  - Meter ID
  - Meter Type (electricity/water/gas)
  - Reading Value
  - Unit (kWh/m³)
  - Confidence Score
  - Date/Time
  - Actions (view details, delete)
- Pagination (100 items per page default)
- Sort by any column
- Filter by meter_id, meter_type, date range
- Search functionality
- Update single column value functionality

#### 5.3.3 Statistics Dashboard

- Display key metrics:
  - Total number of readings
  - Number of unique meters
  - Breakdown by meter type (pie/bar chart)
- Refresh data automatically or on-demand
- Date range selector for filtered statistics

#### 5.3.4 Meter Detail View

- Individual page per meter showing:
  - Latest reading with large display
  - Meter metadata (type, unit, ID)
  - Consumption trend chart (time-series)
  - Average confidence score for this meter

### 5.4 Non-Functional Requirements

#### 5.4.1 Performance

- Initial page load: < 1 seconds
- Image upload processing feedback: < 1 second to show loading state
- Table rendering: < 500ms for 100 rows
- Chart rendering: < 1 second for 1 year of data

#### 5.4.2 Usability

- Mobile-responsive design (breakpoints: 320px, 768px, 1024px, 1440px)
- Touch-friendly UI elements (minimum 48x48px tap targets)
- Utilize the "8pt grid system"
- Keyboard navigation support
- Accessibility (WCAG 2.1 AA compliance)
- Error messages as notifications with actionable guidance

#### 5.4.3 Security

- HTTPS only in production
- API key/token stored securely (environment variables)
- 2-step user authentication
- Input validation on client-side
- XSS protection
- CORS configuration

#### 5.4.4 Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- Mobile Safari iOS 14+
- Chrome Android (latest version)

### 5.5 Data Requirements

#### 5.5.1 Local Storage (Optional)

- Cache recent readings for offline viewing
- Store user preferences (theme, default filters)
- Maximum 5MB local storage usage

#### 5.5.2 Session Management

- Maintain API connection state
- Handle token refresh if applicable
- Graceful degradation on API unavailability

---

## 6. Acceptance Criteria

### 6.0 User Authentication & Authorization

- [ ] Registration form accepts email and password
- [ ] Password validation enforces minimum 8 characters, uppercase, lowercase, and number
- [ ] Duplicate email shows error message
- [ ] Email verification link sent after registration
- [ ] Email verification link activates account
- [ ] Login form accepts email and password
- [ ] 2-step verification code sent via email after login
- [ ] Correct 2FA code grants access
- [ ] Incorrect 2FA code shows error and allows retry
- [ ] Failed login after 5 attempts locks account for 15 minutes
- [ ] "Remember me" checkbox extends session duration
- [ ] Password reset link sent to email
- [ ] Reset token expires after 24 hours
- [ ] New password must match confirmation
- [ ] Successful password reset allows login with new password
- [ ] Session expires after 30 minutes of inactivity
- [ ] Token refresh happens automatically before expiration
- [ ] Logout clears session and redirects to login
- [ ] Unauthenticated users redirected to login page
- [ ] Authenticated users can access protected routes
- [ ] Admin role can access all features
- [ ] Property Manager role can upload and view readings
- [ ] Viewer role can only view readings (no upload/edit/delete)

### 6.1 Image Upload Feature

- [ ] User can upload image via drag-and-drop
- [ ] User can upload image via file picker
- [ ] Image preview displays before submission
- [ ] Upload progress indicator shows during processing
- [ ] Success message displays with extracted reading
- [ ] Error message displays if upload fails with clear reason
- [ ] File size validation prevents >5MB uploads
- [ ] File type validation only allows supported formats
- [ ] Response includes all fields: meter_id, meter_type, reading_value, unit, confidence, confidence_score

### 6.2 Reading List Feature

- [ ] All readings display in a table
- [ ] Table shows: meter_id, meter_type, reading_value, unit, confidence_score, created_at
- [ ] Pagination controls allow navigation through >100 readings
- [ ] Sort functionality works on all columns
- [ ] Filter by meter_id reduces visible rows
- [ ] Search finds readings by meter_id or meter_type
- [ ] Date range filter shows only readings within selected dates
- [ ] "No data" state displays when no readings exist

### 6.3 Statistics Dashboard

- [ ] Displays total_readings count
- [ ] Displays meters_count
- [ ] Pie/bar chart shows meters_by_type distribution
- [ ] Statistics update after new reading uploaded
- [ ] Loading state displays while fetching data
- [ ] Error state displays if API fails

### 6.4 Meter Detail View

- [ ] Accessible via clicking meter_id in reading list
- [ ] Shows latest reading value prominently
- [ ] Displays reading history for this meter only
- [ ] Chart visualizes consumption trend over time
- [ ] Meter metadata (ID, type, unit) clearly visible
- [ ] Back navigation returns to reading list

### 6.5 Mobile Responsiveness

- [ ] Layout adapts to mobile viewport (320px - 767px)
- [ ] Touch targets are minimum 48x48px
- [ ] Tables become scrollable on small screens
- [ ] Charts resize appropriately
- [ ] Upload button/dropzone usable on mobile
- [ ] Navigation menu collapses to hamburger on mobile

### 6.6 Error Handling

- [ ] Network error displays user-friendly message
- [ ] API error displays error message from backend
- [ ] Invalid image format shows clear validation message
- [ ] Oversized file shows file size limit message
- [ ] 404/500 errors have specific messages
- [ ] Retry mechanism available for failed uploads

---

## 7. Constraints

### 7.1 Technical Constraints

1. **Backend Dependency**: Frontend must use existing backend API without modifications
2. **File Size Limit**: 5MB maximum per image (backend constraint)
3. **Supported Formats**: JPEG, PNG, GIF, WebP only
4. **API Rate Limits**: If implemented on backend, must handle gracefully
5. **No Image Storage**: Frontend does not store images; relies on backend/database

### 7.2 Business Constraints

1. **Budget**: Development timeline limited to [X weeks/months]
2. **Resource Availability**: [Y] developers available
3. **Authentication Required**: User authentication is done via Supabase
4. **Single Language**: English only for MVP
5. **Desktop-First**: Primary users on desktop, mobile is secondary use case

### 7.3 Regulatory Constraints

1. **Data Privacy**: Must comply with GDPR if handling EU user data
2. **Accessibility**: WCAG 2.1 AA compliance required for public-facing applications
3. **Security**: HTTPS required for production deployment

### 7.4 Design Constraints

1. **Branding**: Must follow company brand guidelines (if applicable)
2. **UI Framework**: Preference for Material Design or similar modern design system
3. **Color Scheme**: High contrast required for accessibility

### 7.5 Performance Constraints

1. **Network**: Must work on 3G mobile networks (slower uploads acceptable)
2. **Device**: Must work on devices with 2GB RAM minimum
3. **Browser**: No IE11 support required

---

## 8. Future Enhancements (Out of Scope for MVP)

1. **Advanced Authentication Features**

   - OAuth/SSO integration (Google, Microsoft, etc.)
   - Biometric authentication (fingerprint, face ID)
   - Multi-factor authentication via authenticator apps (Google Authenticator, Authy)
   - API key management per user

2. **Advanced Analytics**

   - Predictive consumption forecasting
   - Cost calculations based on utility rates
   - Comparison with previous periods

3. **Notifications & Alerts**

   - Email alerts for unusual consumption
   - Scheduled reading reminders
   - Low confidence score notifications

4. **Multi-Language Support**

   - Internationalization (i18n)
   - German, Spanish, French translations

5. **Image Storage & Gallery**

   - Store original images for audit trail
   - Image gallery view per meter
   - Compare multiple images side-by-side

6. **Bulk Operations**

   - Bulk delete readings
   - Bulk export with filters
   - Bulk meter registration

7. **Mobile Native App**

   - iOS and Android native applications
   - Camera integration for in-app capture
   - Offline mode with sync

8. **Integration Capabilities**
   - API for third-party integrations
   - Webhook support for real-time events
   - Export to accounting software (QuickBooks, Xero)

---

## 9. Success Metrics

### 9.1 User Adoption

- 80% of target users onboarded within 3 months
- 50% reduction in manual meter reading time

### 9.2 Accuracy

- 90%+ average confidence score across all readings
- <5% manual correction rate

### 9.3 Performance

- 99% uptime
- <3 second average processing time per image

### 9.4 User Satisfaction

- 4.0+ average user rating (out of 5)
- <10% support ticket rate per active user

---

## 10. Release Plan

### Phase 1: MVP (Version 1.0)

**Timeline**: [8-10 weeks]

- Image upload with preview
- Reading list with basic filtering
- Statistics dashboard
- Mobile-responsive design

### Phase 2: Enhanced Features (Version 1.1)

**Timeline**: [+4 weeks after MVP]

- Meter detail pages
- Consumption trend charts
- Export to CSV
- Advanced filtering (date range, confidence threshold)

### Phase 3: Analytics & Optimization (Version 1.2)

**Timeline**: [+6 weeks after v1.1]

- Anomaly detection alerts
- Batch upload
- Performance optimizations
- Accessibility improvements

---

## Appendix A: Wireframe References

[Placeholder for wireframe/mockup links]

## Appendix B: API Documentation

See: `/api/docs` or backend API documentation

## Appendix C: Glossary

- **Confidence Score**: AI model's confidence level (0.0 - 1.0) in reading accuracy
- **Meter Reading**: Numeric value displayed on utility meter
- **Meter Type**: Category of meter (electricity, water, gas, unknown)
- **Processing Time**: Time taken by backend to process image and extract reading
