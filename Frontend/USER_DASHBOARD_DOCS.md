# User Dashboard Implementation

## Overview
A comprehensive user dashboard system for the Hospital Management application that displays user profile information, allows profile editing, and shows appointment details.

## Features Implemented

### 1. **User Profile Display**
   - View complete user profile with:
     - Profile image
     - Name, email, phone
     - Gender and date of birth
     - Complete address information
     - Member join date
   - Beautiful card layout with profile header

### 2. **Profile Editing**
   - Modal-based edit form
   - Edit fields:
     - Full name
     - Phone number
     - Gender (dropdown with Male/Female/Other options)
     - Date of birth
     - Complete address (line1, line2, city, state, postal code, country)
   - Real-time form validation
   - Loading state indication
   - Toast notifications for success/error feedback

### 3. **Appointments Management**
   - View all user appointments
   - Display per appointment:
     - Doctor name and specialization
     - Doctor credentials (degree, experience, gender)
     - Appointment date and time
     - Amount/fees
     - Status badge (Pending Payment, Paid, Completed, Cancelled)
   - Pagination support (5 appointments per page)
   - Empty state message when no appointments

### 4. **Toast Notifications**
   - Success notifications for profile updates
   - Error notifications for failed operations
   - Professional styled toasts with:
     - Position: Top-right
     - Auto-close after 3-4 seconds
     - Draggable and dismissible
     - Dark theme matching app design

### 5. **Tab Navigation**
   - Switch between Profile and Appointments tabs
   - Smooth transitions
   - Active tab highlighting

## API Integration

### Endpoints Used

1. **Get User Profile**
   ```
   GET /api/users/profile
   Authorization: Bearer {token}
   ```

2. **Get Appointments**
   ```
   GET /api/users/appointments?page=1&limit=10
   Authorization: Bearer {token}
   ```

3. **Update User Profile**
   ```
   PATCH /api/users/edit
   Authorization: Bearer {token}
   Content-Type: application/json
   ```

## Component Structure

### UserDashboard.jsx
Main dashboard component featuring:
- Profile tab with user information display
- Appointments tab with pagination
- Modal trigger for profile editing
- Loading states and error handling
- Responsive design

### ProfileEditModal.jsx
Modal component for editing profile with:
- Form validation
- Address field grouping
- Loading state during submission
- Cancel/Save buttons
- Callback to parent component on successful update

### userService.js
Service layer for API calls:
- `getProfile(token)` - Fetch user profile
- `getAppointments(token, page, limit)` - Fetch appointments with pagination
- `updateProfile(token, profileData)` - Update user profile

## Authentication & Token Management

### Updated AuthContext
Enhanced authentication context with:
- Token storage and retrieval
- LocalStorage persistence
- User type tracking
- Logout functionality clearing all data

Token is automatically:
- Stored in localStorage on login
- Retrieved from localStorage on app initialization
- Sent with all API requests via Authorization header
- Cleared on logout

## Styling

- **Color Scheme**: Dark theme with teal accents
  - Primary: Teal-500 to Teal-700
  - Secondary: Cyan-600
  - Background: Gray-900, Gray-800
  
- **Components**:
  - Responsive grid layouts
  - Hover effects and transitions
  - Gradient overlays
  - Border highlights
  - Loading spinners and animations

## Usage

### Accessing the Dashboard
After successful login, navigate to:
```
/dashboard
```

### Profile Editing Flow
1. Click "Edit Profile" button
2. Modify desired fields in modal
3. Click "Save Changes"
4. Wait for API response
5. Toast notification shows success/error
6. Profile data updates automatically

### Viewing Appointments
1. Click "Appointments" tab
2. Browse through paginated appointments
3. Each appointment shows doctor and appointment details
4. Use pagination controls for more appointments

## Error Handling

- **Missing Token**: Displays error message and redirects
- **API Failures**: Shows detailed error toast
- **Validation**: Client-side validation before submission
- **Network Issues**: Catches and displays errors gracefully

## Responsive Design

- Mobile-first approach
- Responsive grids (1 column on mobile, 2 columns on desktop)
- Flexible layouts
- Touch-friendly buttons and controls
- Optimized spacing and padding

## Future Enhancements

1. Appointment booking functionality
2. Appointment cancellation
3. Medical records management
4. Prescription viewing
5. Payment history
6. Notification preferences
7. Two-factor authentication
8. Dark/Light theme toggle

## Setup Instructions

### Prerequisites
- React 19.2.0 or higher
- React Router 7.13.2
- React Toastify 11.1.0
- Tailwind CSS configured

### Installation
1. All components are already integrated
2. Ensure backend API is running on `http://localhost:3000`
3. Login to access the dashboard

### Testing
1. Login with valid credentials
2. Navigate to dashboard
3. Try editing profile fields
4. Switch between tabs
5. Test pagination in appointments

## Troubleshooting

### Profile not loading
- Check token in localStorage: `localStorage.getItem('token')`
- Verify API endpoint: `http://localhost:3000/api/users/profile`
- Check browser console for errors

### Toast notifications not showing
- Verify ToastContainer in App.jsx
- Check react-toastify CSS import
- Ensure notification position settings

### Appointments not loading
- Check pagination parameters in API request
- Verify API returns appointments array
- Check for network errors in console

## Files Modified/Created

- ✅ `src/services/userService.js` - API service layer
- ✅ `src/components/UserDashboard.jsx` - Main dashboard component
- ✅ `src/components/ProfileEditModal.jsx` - Edit profile modal
- ✅ `src/context/AuthContext.jsx` - Enhanced with token management
- ✅ `src/App.jsx` - Added UserDashboard route
- ✅ `src/components/Login.jsx` - Updated to pass token to context
