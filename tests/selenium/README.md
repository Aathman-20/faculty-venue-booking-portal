# Experiment 10: Functional, Usability, and Interface Testing using Selenium

This directory contains automated Selenium tests for the Faculty Venue Booking Portal. 
The tests verify the functionality of the login system, venue booking navigation, date/time validation, and usability checks.

## 1. Required Software
- **Node.js**: Required to run the backend server (`express`).
- **Python 3.x**: Required to execute the Selenium script.
- **Google Chrome**: The browser automated by the tests.
- **ChromeDriver**: Matches your Chrome version (managed automatically by Selenium 4.x).

## 2. Installation Commands

1. **Install Python dependencies (Selenium):**
   ```bash
   cd "tests/selenium"
   pip install -r requirements.txt
   ```

2. **Install Node.js backend dependencies:**
   ```bash
   cd "server"
   npm install
   ```

## 3. Starting the Application

The tests require both the backend API and the frontend application to be running locally. Open two separate terminal windows:

**Terminal 1 (Backend Server):**
```bash
cd "server"
npm start
```
*The backend will run on port 3000.*

**Terminal 2 (Frontend Server):**
```bash
# From the project root directory
python -m http.server 8000
```
*The frontend will run on port 8000.*

## 4. Executing the Selenium Tests

Open a third terminal window and execute the test script:
```bash
cd "tests/selenium"
python test_faculty_venue_portal.py
```

## 5. Test Cases and Expected Output

The script executes 5 test cases (`test_a` to `test_e`).

### Test Cases Implemented:
* **E. Usability and interface checks**: Verifies that the login page displays the logo, email placeholder, password placeholder, and the Login button.
* **B. Invalid login**: Attempts to login with incorrect credentials and asserts that the `Invalid email or password` error is displayed without navigating.
* **A. Valid login**: Submits valid credentials (`faculty1@tce.edu` / `faculty123`) and verifies successful navigation to the dashboard.
* **C. Venue booking navigation**: Logs in, navigates to the venue booking page, clicks "Book Now" for a venue, and verifies navigation to `booking-details.html`.
* **D. Date/time validation and Continue**: Tests time input logic. First, it tests an invalid timeslot (end time <= start time) and asserts that the validation message appears and the "Continue" button is disabled. Then, it tests a valid timeslot and asserts that clicking "Continue" navigates successfully to `technical-requirements.html`.

### Expected Successful Terminal Output:
```text
test_a_usability_and_interface_checks (__main__.FacultyVenuePortalTests.test_a_usability_and_interface_checks)
E. Usability and interface checks ... Saved screenshot: C:\Users\aathm\.gemini\antigravity-ide\brain\...\usability_login_page.png
ok
test_b_invalid_login (__main__.FacultyVenuePortalTests.test_b_invalid_login)
B. Invalid login ... Saved screenshot: C:\Users\aathm\.gemini\antigravity-ide\brain\...\invalid_login_test.png
ok
test_c_valid_login (__main__.FacultyVenuePortalTests.test_c_valid_login)
A. Valid login ... Saved screenshot: C:\Users\aathm\.gemini\antigravity-ide\brain\...\valid_login_test.png
ok
test_d_venue_booking_navigation (__main__.FacultyVenuePortalTests.test_d_venue_booking_navigation)
C. Venue booking navigation ... Saved screenshot: C:\Users\aathm\.gemini\antigravity-ide\brain\...\venue_booking_navigation.png
ok
test_e_date_time_validation (__main__.FacultyVenuePortalTests.test_e_date_time_validation)
D. Date/time validation and Continue ... Saved screenshot: C:\Users\aathm\.gemini\antigravity-ide\brain\...\invalid_time_test.png
Saved screenshot: C:\Users\aathm\.gemini\antigravity-ide\brain\...\date_time_validation_continue.png
ok

----------------------------------------------------------------------
Ran 5 tests in X.XXXs

OK
```

*Note: Screenshots of the tests are automatically saved in the artifact directory.*
