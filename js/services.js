/* =========================================================
   FACULTY VENUE BOOKING PORTAL - SERVICES (services.js)
   VenueService: central data store shared across all pages.
   Auth user stored in BOTH sessionStorage (fast read) and
   localStorage (survives refresh / tab reopen).
   ========================================================= */

app.service('VenueService', ['$window', function ($window) {
    var self = this;

    // ---- Storage Helpers ----------------------------------------
    function safeGet(storage, key, fallback) {
        try {
            var val = storage.getItem(key);
            return val ? JSON.parse(val) : fallback;
        } catch (e) { return fallback; }
    }

    function safeSet(storage, key, value) {
        try { storage.setItem(key, JSON.stringify(value)); } catch (e) {}
    }

    function safeRemove(storage, key) {
        try { storage.removeItem(key); } catch (e) {}
    }

    // Shorthand wrappers for sessionStorage (used for transient state)
    function ssGet(key, fallback)  { return safeGet($window.sessionStorage, key, fallback); }
    function ssSet(key, value)     { safeSet($window.sessionStorage, key, value); }
    function ssRemove(key)         { safeRemove($window.sessionStorage, key); }

    // ---- Current Logged-In User ---------------------------------
    // Prefer sessionStorage; fall back to localStorage so the user
    // stays logged in after a browser refresh.
    var _stored = safeGet($window.sessionStorage, 'authUser', null)
               || safeGet($window.localStorage,   'authUser', null);

    self.currentUser = _stored || {
        name: '', role: '', email: '', department: '', employeeId: ''
    };

    // Save auth user after a successful login
    self.saveAuthUser = function (user) {
        safeSet($window.sessionStorage, 'authUser', user);
        safeSet($window.localStorage,   'authUser', user);
        self.currentUser = user;
    };

    // Read auth user (used by controllers to check login state)
    self.getAuthUser = function () {
        return safeGet($window.sessionStorage, 'authUser', null)
            || safeGet($window.localStorage,   'authUser', null);
    };

    // Clear auth user (used on logout)
    self.clearAuthUser = function () {
        ssRemove('authUser');
        safeRemove($window.localStorage, 'authUser');
        self.currentUser = { name: '', role: '', email: '', department: '', employeeId: '' };
    };

    // ---- Full Venue Dataset ------------------------------------
    self.venuesList = [
        // ---- Main Building ----
        { name: 'KS Auditorium',                category: 'Auditorium',   building: 'Main Building',           capacity: '660 People',      image: 'images/ks-auditorium.jpg' },
        { name: 'KK Auditorium',                category: 'Auditorium',   building: 'Main Building',           capacity: '450 People',      image: 'images/kk-auditorium.png' },
        { name: 'ECE Seminar Hall',             category: 'Seminar Hall', building: 'Main Building',           capacity: '180 People',      image: 'images/ece-seminar-hall.jpg' },
        { name: 'EEE Seminar Hall',             category: 'Seminar Hall', building: 'Main Building',           capacity: '150 People',      image: 'images/eee-seminar-hall.jpg' },
        { name: 'Embedded UR Lab',              category: 'Lab',          building: 'Main Building',           capacity: '60 Computers'     },
        { name: 'Digital Lab',                  category: 'Lab',          building: 'Main Building',           capacity: '75 Computers',    image: 'images/digital-lab.png' },
        // ---- Mechatronics ----
        { name: 'Robotics & Automation Lab',    category: 'Lab',          building: 'Mechatronics',            capacity: '40 Workstations', image: 'images/robotics-automation-lab.jpg' },
        { name: 'Mechatronics Seminar Hall',    category: 'Seminar Hall', building: 'Mechatronics',            capacity: '120 People'       },
        { name: 'PLC Control Lab',              category: 'Lab',          building: 'Mechatronics',            capacity: '35 Computers'     },
        // ---- CSE Dept ----
        { name: 'CSE Supercomputing Lab',       category: 'Lab',          building: 'CSE dept',                capacity: '100 High-End PCs' },
        { name: 'AI & Data Science Lab',        category: 'Lab',          building: 'CSE dept',                capacity: '80 Systems',      image: 'images/ai-data-science-lab.png' },
        { name: 'Alan Turing Auditorium',       category: 'Auditorium',   building: 'CSE dept',                capacity: '500 Seats',       image: 'images/alan-turing-auditorium.png' },
        { name: 'Cloud Computing Seminar Hall', category: 'Seminar Hall', building: 'CSE dept',                capacity: '200 Seats'        },
        // ---- IT Department ----
        { name: 'IT Seminar Hall',              category: 'Seminar Hall', building: 'IT Department',           capacity: '100 People',      image: 'images/it-seminar-hall.jpg' },
        { name: 'IT Server Lab',                category: 'Lab',          building: 'IT Department',           capacity: '40 Computers'     },
        { name: 'IT Project Room',              category: 'Lab',          building: 'IT Department',           capacity: '30 Workstations'  },
        { name: 'Network Security Lab',         category: 'Lab',          building: 'IT Department',           capacity: '50 Systems'       },
        // ---- Indoor Stadium ----
        { name: 'Main Sports Court',            category: 'Auditorium',   building: 'Indoor Stadium',          capacity: '500 Spectators'   },
        { name: 'Stadium Conference Room',      category: 'Seminar Hall', building: 'Indoor Stadium',          capacity: '80 People'        },
        { name: 'Sports Training Lab',          category: 'Lab',          building: 'Indoor Stadium',          capacity: '30 Stations'      },
        // ---- Architecture Department ----
        { name: 'Design Studio A',              category: 'Lab',          building: 'Architecture Department', capacity: '60 Workstations'  },
        { name: 'Architecture Seminar Hall',    category: 'Seminar Hall', building: 'Architecture Department', capacity: '150 People'       },
        { name: 'Model Workshop',               category: 'Lab',          building: 'Architecture Department', capacity: '40 Workstations'  },
        { name: 'Architecture Auditorium',      category: 'Auditorium',   building: 'Architecture Department', capacity: '300 Seats'        }
    ];

    // ---- Available Time Slots ----------------------------------
    self.timeSlots = [
        '9:00 AM - 10:30 AM',
        '10:00 AM - 12:00 PM',
        '1:00 PM - 2:30 PM',
        '2:00 PM - 4:00 PM',
        '4:00 PM - 5:30 PM'
    ];

    // ---- Last Booking (shown on confirmation page) -------------
    self.getLastBooking = function () {
        return ssGet('lastBooking', {
            venue: 'KS Auditorium',
            date:  'Mon, 20 Apr',
            slot:  '10:00 AM - 12:00 PM',
            id:    'BK-10482-9A21'
        });
    };

    self.saveLastBooking = function (booking) {
        ssSet('lastBooking', booking);
    };

    // ---- Selected Venue (venue-booking → booking-details) ------
    self.getSelectedVenue = function () {
        return ssGet('selectedVenue', null);
    };

    self.saveSelectedVenue = function (venue) {
        ssSet('selectedVenue', venue);
    };

    // ---- Booking Draft (date + slot between booking steps) -----
    self.getBookingDraft = function () {
        return ssGet('bookingDraft', {
            selectedDay:    20,
            selectedSlot:   '10:00 AM - 12:00 PM',
            activeCategory: 'All'
        });
    };

    self.saveBookingDraft = function (draft) {
        ssSet('bookingDraft', draft);
    };

    // ---- HOD Selected Booking (HOD "View More" → booking-details) ----
    self.saveHodSelectedBooking = function (bk) {
        if (bk) { ssSet('hodSelectedBooking', bk); }
        else     { ssRemove('hodSelectedBooking'); }
    };

    self.getHodSelectedBooking = function () {
        return ssGet('hodSelectedBooking', null);
    };

    self.clearHodSelectedBooking = function () {
        ssRemove('hodSelectedBooking');
    };

    // ---- Faculty Selected Booking (Faculty "View" → booking-details) ----
    self.saveFacultySelectedBooking = function (bk) {
        if (bk) { ssSet('facultySelectedBooking', bk); }
        else     { ssRemove('facultySelectedBooking'); }
    };

    self.getFacultySelectedBooking = function () {
        return ssGet('facultySelectedBooking', null);
    };

    self.clearFacultySelectedBooking = function () {
        ssRemove('facultySelectedBooking');
    };

    // ---- Filter Venues -----------------------------------------
    self.filteredVenues = function (building, category, search) {
        return self.venuesList.filter(function (v) {
            var buildingMatch  = (v.building === building);
            var categoryMatch  = (category === 'All' || v.category === category);
            var searchMatch    = !search ||
                v.name.toLowerCase().indexOf(search.toLowerCase())     !== -1 ||
                v.category.toLowerCase().indexOf(search.toLowerCase()) !== -1;
            return buildingMatch && categoryMatch && searchMatch;
        });
    };

    // ---- Generate Booking ID -----------------------------------
    self.generateBookingId = function () {
        return 'BK-' +
               Math.floor(10000 + Math.random() * 90000) + '-' +
               Math.random().toString(36).substring(2, 6).toUpperCase();
    };
}]);

/* =========================================================
   AccountService  (services.js)
   AngularJS Service for the Account / Profile page.

   Injected into AccountController via AngularJS Dependency
   Injection.  All data is persisted in LocalStorage.

   Public API:
     getFacultyProfile()               → returns the logged-in faculty object
     updateProfile(profile)            → saves updated profile to LocalStorage
     changePassword(oldPw, newPw)      → validates old password, stores new one

   Storage keys used:
     'authUser'         – current logged-in user (session + localStorage)
     'registeredUsers'  – full user registry (localStorage)
   ========================================================= */
// <!-- AccountService Starts -->
app.service('AccountService', [
    // <!-- Dependency Injection -->
    '$window', function ($window) {
    var self = this;

    // ---- Private helpers ----------------------------------------
    function lsGet(key, fallback) {
        try {
            var raw = $window.localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (e) { return fallback; }
    }

    function lsSet(key, value) {
        try { $window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
    }

    // ---- 1. getFacultyProfile() ---------------------------------
    /**
     * Fetch the logged-in faculty details from LocalStorage.
     * Prefers the 'authUser' key (set on login).
     * Returns a plain object with name, email, role, department, employeeId.
     * Returns null if no user is logged in.
     */
    self.getFacultyProfile = function () {
        // Try sessionStorage first (faster, survives refresh within same tab)
        var ssRaw = $window.sessionStorage.getItem('authUser');
        if (ssRaw) {
            try { return JSON.parse(ssRaw); } catch (e) {}
        }
        // Fall back to localStorage (survives browser restart)
        return lsGet('authUser', null);
    };

    // ---- 2. updateProfile(profile) ------------------------------
    /**
     * Update and save the modified profile details.
     * Updates both the 'authUser' entry (session + localStorage)
     * and the user's record inside 'registeredUsers'.
     *
     * @param {Object} profile – { name, email, role, department, employeeId }
     * @returns {boolean} true on success, false if user record not found
     */
    self.updateProfile = function (profile) {
        // Refresh the authUser key with the new values
        var authUser = lsGet('authUser', {});
        authUser.name       = profile.name;
        authUser.email      = profile.email;
        authUser.department = profile.department;
        lsSet('authUser', authUser);

        // Mirror changes to sessionStorage so the header updates immediately
        try {
            $window.sessionStorage.setItem('authUser', JSON.stringify(authUser));
        } catch (e) {}

        // Also patch the user record inside the full registeredUsers array
        var users   = lsGet('registeredUsers', []);
        var updated = false;
        for (var i = 0; i < users.length; i++) {
            if ((users[i].email || '').toLowerCase() === (profile.email || '').toLowerCase()) {
                users[i].name       = profile.name;
                users[i].department = profile.department;
                updated = true;
                break;
            }
        }
        if (updated) { lsSet('registeredUsers', users); }
        return updated;
    };

    // ---- 3. changePassword(oldPassword, newPassword) ------------
    /**
     * Validate the current password and update it in LocalStorage.
     *
     * @param {string} oldPassword – the password the user claims is current
     * @param {string} newPassword – the new password to set
     * @returns {{ success: boolean, message: string }}
     */
    self.changePassword = function (oldPassword, newPassword) {
        var authUser = self.getFacultyProfile();
        if (!authUser || !authUser.email) {
            return { success: false, message: 'No logged-in user found.' };
        }

        // Look up the user's actual stored password from registeredUsers
        var users = lsGet('registeredUsers', []);
        var userRecord = null;
        var userIndex  = -1;
        for (var i = 0; i < users.length; i++) {
            if ((users[i].email || '').toLowerCase() === authUser.email.toLowerCase()) {
                userRecord = users[i];
                userIndex  = i;
                break;
            }
        }

        if (!userRecord) {
            return { success: false, message: 'User account not found in registry.' };
        }

        // Validate old password
        if (userRecord.password !== oldPassword) {
            return { success: false, message: 'Current password is incorrect. Please try again.' };
        }

        // Validate new password is not the same as old
        if (oldPassword === newPassword) {
            return { success: false, message: 'New password must be different from the current password.' };
        }

        // Persist the new password
        users[userIndex].password = newPassword;
        lsSet('registeredUsers', users);

        return { success: true, message: 'Password changed successfully.' };
    };
}]);

/* =========================================================
   TechnicalRequirementService  (services.js)
   AngularJS Service for the Technical Requirements page.

   Injected into TechnicalRequirementController via AngularJS
   Dependency Injection (array annotation).

   Public API:
     loadRequirements(draft)               → returns a techReq object
     validateRequirements(techReq)         → returns array of error strings
     saveRequirements(techReq, draftMeta)  → persists draft to sessionStorage

   Storage key used:
     'bookingDraft' (sessionStorage) — shared with VenueService booking flow
   ========================================================= */
// <!-- TechnicalRequirementService Starts -->
app.service('TechnicalRequirementService', [
    // <!-- Dependency Injection -->
    '$window', function ($window) {
    var self = this;

    /** Default values for the technical requirements form. */
    var DEFAULTS = {
        projector:         'No',
        microphoneQty:     0,
        speakersQty:       0,
        lcdDisplay:        'No',
        desktopSystemsQty: 0,
        laptopConnection:  'HDMI',
        internetRequired:  'No',
        extensionBoardQty: 0,
        whiteboard:        'No',
        techStaffRequired: 'No',
        otherRequirements: ''
    };

    // ---- Private helpers ----------------------------------------
    function ssGet(key, fallback) {
        try {
            var raw = $window.sessionStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (e) { return fallback; }
    }

    function ssSet(key, value) {
        try { $window.sessionStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
    }

    // ----------------------------------------------------------------
    // 1. loadRequirements(draft)
    // ----------------------------------------------------------------
    /**
     * Load existing technical requirements from the booking draft stored
     * in sessionStorage (set during the booking wizard flow).
     *
     * @param {Object|null} draft – optional draft object already in memory.
     *   If the draft has isEditing=true and a techReq sub-object, those
     *   values are returned so the edit workflow pre-fills the form.
     *   Otherwise, the service falls back to session storage, then defaults.
     *
     * @returns {Object} A fully-populated techReq object ready for ng-model.
     */
    self.loadRequirements = function (draft) {
        // Priority 1: draft passed from controller (editing existing booking)
        if (draft && draft.isEditing && draft.techReq) {
            return angular.copy(draft.techReq);
        }

        // Priority 2: techReq stored inside the sessionStorage booking draft
        var stored = ssGet('bookingDraft', null);
        if (stored && stored.techReq) {
            return angular.copy(stored.techReq);
        }

        // Priority 3: fresh defaults
        return angular.copy(DEFAULTS);
    };

    // ----------------------------------------------------------------
    // 2. validateRequirements(techReq)
    // ----------------------------------------------------------------
    /**
     * Validate the quantities entered by the user.
     * Returns an array of human-readable error strings.
     * An empty array means all fields are valid.
     *
     * Validated fields:
     *   Projector, Microphone, Speaker, Desktop Systems,
     *   Internet, Extension Board, Technical Staff, Other Requirements.
     *
     * @param {Object} techReq – the current ng-model techReq object.
     * @returns {Array<string>} List of validation errors (empty = valid).
     */
    self.validateRequirements = function (techReq) {
        var errors = [];

        if (!techReq) {
            errors.push('Technical requirements data is missing.');
            return errors;
        }

        // ---- Quantity fields: must be non-negative integers ----
        var qtyFields = [
            { key: 'microphoneQty',     label: 'Microphone Quantity'     },
            { key: 'speakersQty',       label: 'Speakers Quantity'       },
            { key: 'desktopSystemsQty', label: 'Desktop Systems Quantity' },
            { key: 'extensionBoardQty', label: 'Extension Board Quantity' }
        ];

        for (var i = 0; i < qtyFields.length; i++) {
            var field = qtyFields[i];
            var val   = techReq[field.key];

            // Value must be present and a non-negative integer
            if (val === null || val === undefined || val === '') {
                errors.push(field.label + ' is required.');
            } else if (!Number.isInteger(Number(val)) || Number(val) < 0) {
                errors.push(field.label + ' must be a non-negative whole number.');
            }
        }

        // ---- Projector: must be 'Yes' or 'No' ----
        if (!techReq.projector || ['Yes', 'No'].indexOf(techReq.projector) === -1) {
            errors.push('Projector selection is required (Yes or No).');
        }

        // ---- Internet Required: must be 'Yes' or 'No' ----
        if (!techReq.internetRequired || ['Yes', 'No'].indexOf(techReq.internetRequired) === -1) {
            errors.push('Internet Required selection is required (Yes or No).');
        }

        // ---- Technical Staff Required: must be 'Yes' or 'No' ----
        if (!techReq.techStaffRequired || ['Yes', 'No'].indexOf(techReq.techStaffRequired) === -1) {
            errors.push('Technical Staff Required selection is required (Yes or No).');
        }

        // ---- Other Requirements: must not be blank ----
        if (!techReq.otherRequirements || techReq.otherRequirements.trim() === '') {
            errors.push('Purpose / Other Requirements is required.');
        }

        return errors;
    };

    // ----------------------------------------------------------------
    // 3. saveRequirements(techReq, draftMeta)
    // ----------------------------------------------------------------
    /**
     * Store all selected requirements in LocalStorage (via sessionStorage
     * bookingDraft key, which is read by TechReqCtrl on confirmation).
     *
     * Merges the techReq object into the existing bookingDraft so that
     * other draft fields (selectedDay, selectedSlot, isEditing, etc.)
     * are preserved.
     *
     * @param {Object} techReq    – the completed techReq form object.
     * @param {Object} draftMeta  – optional extra fields to merge into draft
     *                              (e.g., { selectedDay, selectedSlot }).
     */
    self.saveRequirements = function (techReq, draftMeta) {
        var existing = ssGet('bookingDraft', {});
        var merged   = angular.extend({}, existing, draftMeta || {}, {
            techReq: angular.copy(techReq)
        });
        ssSet('bookingDraft', merged);
    };

    /** Return a clean copy of the default techReq values (used by Reset). */
    self.getDefaults = function () {
        return angular.copy(DEFAULTS);
    };
}]);

/* =========================================================
   BookingDetailsService  (services.js)
   AngularJS Service for the Booking Details page.

   Injected into BookingDetailsController via AngularJS
   Dependency Injection (minification-safe array annotation).

   This service wraps LocalStorage / sessionStorage access
   for the three operations required on the booking-details page.

   Public API:
     getBookingDetails()           → returns { hodBooking, facultyBooking }
     updateBookingStatus(id, st)   → updates status in LocalStorage
     deleteBooking(id, venueName)  → confirm popup + deletes from LocalStorage
     buildTechReqRows(techReq)     → returns label/value pairs for ng-repeat

   Storage keys:
     sessionStorage 'hodSelectedBooking'     – booking selected by HOD
     sessionStorage 'facultySelectedBooking' – booking selected by faculty
     localStorage   'venueBookings'          – master booking array
   ========================================================= */
// <!-- BookingDetailsService Starts -->
app.service('BookingDetailsService', [
    // <!-- Dependency Injection -->
    '$window', function ($window) {
    var self = this;

    // ---- Private helpers ----------------------------------------
    function ssGet(key, fallback) {
        try {
            var raw = $window.sessionStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (e) { return fallback; }
    }

    function lsGet(key, fallback) {
        try {
            var raw = $window.localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (e) { return fallback; }
    }

    function lsSet(key, value) {
        try { $window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
    }

    // ----------------------------------------------------------------
    // 1. getBookingDetails()
    // ----------------------------------------------------------------
    /**
     * Retrieve booking information from LocalStorage / sessionStorage.
     *
     * Checks sessionStorage for both HOD and Faculty selected bookings.
     * Returns an object with two fields so the controller can branch on
     * which mode to activate:
     *   { hodBooking: Object|null, facultyBooking: Object|null }
     *
     * @returns {{ hodBooking: Object|null, facultyBooking: Object|null }}
     */
    self.getBookingDetails = function () {
        var hodBooking     = ssGet('hodSelectedBooking',     null);
        var facultyBooking = ssGet('facultySelectedBooking', null);
        return {
            hodBooking:     hodBooking,
            facultyBooking: facultyBooking
        };
    };

    // ----------------------------------------------------------------
    // 2. updateBookingStatus(id, status)
    // ----------------------------------------------------------------
    /**
     * Update booking status (Pending → Approved or Rejected) in LocalStorage.
     *
     * Patches the matching record inside the 'venueBookings' array in
     * localStorage.  Returns the patched booking or null if not found.
     *
     * @param {string} id     – Booking ID to update.
     * @param {string} status – New status: 'pending' | 'approved' | 'rejected'
     * @returns {Object|null}  Updated booking object, or null if not found.
     */
    self.updateBookingStatus = function (id, status) {
        var bookings = lsGet('venueBookings', []);
        var updated  = null;

        for (var i = 0; i < bookings.length; i++) {
            if (bookings[i].id === id) {
                bookings[i].status = status;
                if (status === 'approved') {
                    bookings[i].approvedAt = new Date().toISOString();
                } else if (status === 'rejected') {
                    bookings[i].rejectedAt = new Date().toISOString();
                }
                updated = bookings[i];
                break;
            }
        }

        if (updated) { lsSet('venueBookings', bookings); }
        return updated;
    };

    // ----------------------------------------------------------------
    // 3. deleteBooking(id, venueName)
    // ----------------------------------------------------------------
    /**
     * Delete the selected booking after showing a confirmation popup.
     *
     * Uses $window.confirm() so the popup is controllable in tests.
     * Returns true if the booking was deleted, false if the user cancelled.
     *
     * @param {string} id        – Booking ID to remove.
     * @param {string} venueName – Venue name shown in the confirmation prompt.
     * @returns {boolean} true = deleted, false = cancelled by user.
     */
    self.deleteBooking = function (id, venueName) {
        var message = 'Delete this booking for ' + (venueName || 'this venue') + '?\nThis action cannot be undone.';
        if (!$window.confirm(message)) {
            return false;   // user pressed Cancel
        }

        var bookings = lsGet('venueBookings', []);
        var filtered = bookings.filter(function (b) { return b.id !== id; });
        lsSet('venueBookings', filtered);
        return true;
    };

    // ----------------------------------------------------------------
    // buildTechReqRows(techReq)  — helper for ng-repeat in the template
    // ----------------------------------------------------------------
    /**
     * Convert a techReq object into a flat array of { label, value } pairs.
     * Used by BookingDetailsController to populate $scope.hodTechReqRows
     * and $scope.facultyTechReqRows for ng-repeat in the HTML.
     *
     * @param {Object} techReq – techReq sub-object from a booking record.
     * @returns {Array<{ label: string, value: string|number }>}
     */
    self.buildTechReqRows = function (techReq) {
        if (!techReq) return [];
        return [
            { label: 'Projector',        value: techReq.projector         || 'No'   },
            { label: 'Microphone',       value: techReq.microphoneQty     || 0      },
            { label: 'Speakers',         value: techReq.speakersQty       || 0      },
            { label: 'LCD Display',      value: techReq.lcdDisplay        || 'No'   },
            { label: 'Desktop Systems',  value: techReq.desktopSystemsQty || 0      },
            { label: 'Laptop Connection',value: techReq.laptopConnection  || 'HDMI' },
            { label: 'Internet',         value: techReq.internetRequired  || 'No'   },
            { label: 'Extension Board',  value: techReq.extensionBoardQty || 0      },
            { label: 'Whiteboard',       value: techReq.whiteboard        || 'No'   },
            { label: 'Tech Staff',       value: techReq.techStaffRequired || 'No'   }
        ];
    };
}]);
