/* =========================================================
   FACULTY VENUE BOOKING PORTAL — COMBINED APP
   MODULE DECLARATION (app.js)

   Source: Aathman Code (base)
   Declares the root AngularJS module used across all pages.
   Seeds demo users and bookings into localStorage on first load.
   ========================================================= */

var app = angular.module('venueApp', []);

app.run(['$window', function ($window) {

    // 1. Seed Demo Users — only seeds if NO users exist at all
    var storedUsers = $window.localStorage.getItem('registeredUsers');
    var users = storedUsers ? JSON.parse(storedUsers) : [];

    if (users.length === 0) {
        var defaultUsers = [
            {
                name:       'Dr. Vignesh Kumar',
                email:      'faculty1@tce.edu',
                password:   'Faculty@123',
                role:       'IT Faculty',
                department: 'Information Technology',
                employeeId: 'TCE-IT-001'
            },
            {
                name:       'Dr. Ramesh Babu',
                email:      'faculty2@tce.edu',
                password:   'Faculty@123',
                role:       'CSE Faculty',
                department: 'Computer Science',
                employeeId: 'TCE-CSE-002'
            },
            {
                name:       'Dr. Anita Priya',
                email:      'faculty3@tce.edu',
                password:   'Faculty@123',
                role:       'ECE Faculty',
                department: 'Electronics',
                employeeId: 'TCE-ECE-003'
            },
            {
                name:       'HOD IT',
                email:      'hod@tce.edu',
                password:   'Hod@12345',
                role:       'HOD - IT',
                department: 'Information Technology',
                employeeId: 'TCE-HOD-001'
            }
        ];
        $window.localStorage.setItem('registeredUsers', JSON.stringify(defaultUsers));
    }

    // 2. Seed Demo Bookings — only seeds if NO bookings exist
    var storedBookings = $window.localStorage.getItem('venueBookings');
    var bookings = storedBookings ? JSON.parse(storedBookings) : [];

    if (bookings.length === 0) {
        var defaultBookings = [
            {
                id:        'BK-1001',
                venue:     'KS Auditorium',
                date:      'Mon, 20 Apr',
                slot:      '10:00 AM - 12:00 PM',
                faculty:   'Dr. Vignesh Kumar',
                email:     'faculty1@tce.edu',
                notes:     'Guest Lecture on AI and Machine Learning',
                techReq: {
                    projector:         'Yes',
                    microphoneQty:     2,
                    speakersQty:       2,
                    lcdDisplay:        'No',
                    desktopSystemsQty: 1,
                    laptopConnection:  'HDMI',
                    internetRequired:  'Yes',
                    extensionBoardQty: 1,
                    whiteboard:        'No',
                    techStaffRequired: 'Yes',
                    otherRequirements: 'Guest Lecture on AI and Machine Learning'
                },
                building:  'Main Building',
                category:  'Auditorium',
                status:    'pending',
                createdAt: new Date().toISOString()
            },
            {
                id:        'BK-1002',
                venue:     'IT Seminar Hall',
                date:      'Tue, 21 Apr',
                slot:      '02:00 PM - 04:00 PM',
                faculty:   'Dr. Ramesh Babu',
                email:     'faculty2@tce.edu',
                notes:     'Department Workshop on Cloud Computing',
                techReq: {
                    projector:         'Yes',
                    microphoneQty:     1,
                    speakersQty:       0,
                    lcdDisplay:        'Yes',
                    desktopSystemsQty: 0,
                    laptopConnection:  'HDMI',
                    internetRequired:  'No',
                    extensionBoardQty: 0,
                    whiteboard:        'Yes',
                    techStaffRequired: 'No',
                    otherRequirements: 'Department Workshop on Cloud Computing'
                },
                building:  'IT Department',
                category:  'Seminar Hall',
                status:    'approved',
                createdAt: new Date().toISOString()
            },
            {
                id:        'BK-1003',
                venue:     'Alan Turing Auditorium',
                date:      'Thu, 24 Apr',
                slot:      '9:00 AM - 10:30 AM',
                faculty:   'Dr. Anita Priya',
                email:     'faculty3@tce.edu',
                notes:     'Annual Technical Symposium',
                techReq: {
                    projector:         'Yes',
                    microphoneQty:     4,
                    speakersQty:       4,
                    lcdDisplay:        'Yes',
                    desktopSystemsQty: 2,
                    laptopConnection:  'HDMI',
                    internetRequired:  'Yes',
                    extensionBoardQty: 2,
                    whiteboard:        'No',
                    techStaffRequired: 'Yes',
                    otherRequirements: 'Annual Technical Symposium'
                },
                building:  'CSE dept',
                category:  'Auditorium',
                status:    'rejected',
                createdAt: new Date().toISOString()
            }
        ];
        $window.localStorage.setItem('venueBookings', JSON.stringify(defaultBookings));
    }
}]);
