/* =========================================================
   FACULTY VENUE BOOKING PORTAL — COMBINED APP
   CONTROLLERS (controllers.js)

   Source: MERGED from Aathman Code (base) + Sarvesh Code + Vignesh Code
   One AngularJS controller per HTML page.

   Merge Strategy:
     LoginCtrl         : Vignesh (shake animation + $timeout + success popup modal)
     RegisterCtrl      : Sarvesh (RegistrationFactory + dept dropdown + toast + $timeout)
                         + Vignesh (strict validation: name min 3 chars, @tce.edu, pw 8–13)
     DashboardCtrl     : Vignesh (DashboardStatsFactory for stats)
     MyBookingsCtrl    : Aathman (edit/delete/view workflow with toggleView)
     VenueBookingCtrl  : Vignesh (CarouselHelperFactory + building images)
     BookingDetailsController: Aathman (tri-modal + BookingDetailsService + BookingFactory coexistence)
     TechnicalRequirementController: Aathman (TechnicalRequirementService + TechnicalRequirementFactory)
     ConfirmationCtrl  : Sarvesh (ConfirmationFactory — real PDF download + passcode)
     AccountController : Aathman (AccountService + AccountFactory coexistence)
     HodDashboardCtrl  : Sarvesh (HodRequestFactory CRUD + modal + requestCard + toastNotification)
   ========================================================= */

/* ---- Shared auth guard helper ----------------------------
   Every protected controller calls this once on init.
   If no user is logged in, the page is immediately redirected
   to login.html so protected pages are never shown anonymously.
   --------------------------------------------------------- */
function requireAuth(VenueService, RouteService) {
    var user = VenueService.getAuthUser();
    if (!user || !user.email) {
        RouteService.navigateTo('login.html');
        return false;
    }
    return true;
}

/* ---- Shared logout helper --------------------------------
   Clears both sessionStorage and localStorage auth records,
   resets VenueService.currentUser, then navigates to login.
   --------------------------------------------------------- */
function doLogout(VenueService, RouteService) {
    VenueService.clearAuthUser();
    RouteService.navigateTo('login.html');
}

/* -------------------------------------------------------
   1. LoginCtrl  →  login.html
   Source: Vignesh Code (shake animation + success popup + $timeout)
   ------------------------------------------------------- */
app.controller('LoginCtrl', [
    '$scope', '$window', 'VenueService', 'RouteService', '$timeout', 'BookingApiService',
    function ($scope, $window, VenueService, RouteService, $timeout, BookingApiService) {

        $scope.loginEmail       = '';
        $scope.loginPassword    = '';
        $scope.loginError       = '';
        $scope.shakeActive      = false;
        $scope.showSuccessPopup = false;
        $scope.successMessage   = '';

        function deriveName(email) {
            var local = email.split('@')[0];
            var first = local.split('.')[0];
            return first.charAt(0).toUpperCase() + first.slice(1);
        }

        function isHodEmail(email) {
            return email.toLowerCase().indexOf('hod') !== -1;
        }

        // Shake animation + error message (Vignesh)
        function triggerError(msg) {
            $scope.loginError  = msg;
            $scope.shakeActive = true;
            $timeout(function () { $scope.shakeActive = false; }, 450);
        }

        $scope.doLogin = function () {
            $scope.loginError = '';
            var email    = ($scope.loginEmail    || '').trim().toLowerCase();
            var password = ($scope.loginPassword || '').trim();

            if (!email || !password) {
                triggerError('Please enter your email and password.');
                return;
            }

            BookingApiService.login(email, password)
                .then(function (response) {
                    var match = response.data.user;
                    var authUser = {
                        name:       match.name,
                        role:       match.role || 'FACULTY',
                        email:      match.email,
                        department: match.department,
                        employeeId: match.employeeId || ''
                    };
                    VenueService.saveAuthUser(authUser);

                    // Success popup modal (Vignesh feature)
                    $scope.successMessage   = 'Welcome back, ' + authUser.name + '!';
                    $scope.showSuccessPopup = true;

                    $scope.confirmLoginRedirect = function () {
                        var r = authUser.role.toUpperCase();
                        RouteService.navigateTo((r === 'ADMIN' || r === 'HOD') ? 'approval-permission.html' : 'dashboard.html');
                    };
                })
                .catch(function (error) {
                    var msg = (error.data && error.data.error) ? error.data.error : 'Login failed. Please try again.';
                    triggerError(msg);
                });
        };

        $scope.goToRegister = function () { RouteService.navigateTo('register.html'); };
    }
]);

/* -------------------------------------------------------
   2. RegisterCtrl  →  register.html
   Source: Sarvesh (RegistrationFactory + dept dropdown + toast + $timeout)
           + Vignesh (strict validation: name ≥3 chars, @tce.edu, pw 8–13)
   ------------------------------------------------------- */
app.controller('RegisterCtrl', [
    '$scope', '$window', 'VenueService', 'RouteService', '$timeout', 'BookingApiService',
    function ($scope, $window, VenueService, RouteService, $timeout, BookingApiService) {

        $scope.regName         = '';
        $scope.regEmail        = '';
        $scope.regPassword     = '';
        $scope.regConfirm      = '';
        $scope.regDepartment   = 'Information Technology';
        $scope.departmentsList = [
            'Information Technology',
            'Computer Science',
            'Electronics & Communication',
            'Electrical & Electronics',
            'Mechatronics',
            'Architecture'
        ];
        $scope.registerErrors  = [];
        $scope.toastMsg        = '';
        $scope.toastType       = '';
        $scope.shakeActive     = false;

        // Shake animation on error (Vignesh)
        function triggerRegisterError(msg) {
            $scope.registerErrors = [msg];
            $scope.shakeActive    = true;
            $timeout(function () { $scope.shakeActive = false; }, 450);
        }

        $scope.doRegister = function () {
            $scope.registerErrors = [];

            var name       = ($scope.regName     || '').trim();
            var emailLower = ($scope.regEmail    || '').trim().toLowerCase();
            var pass       = ($scope.regPassword || '').trim();
            var conf       = ($scope.regConfirm  || '').trim();

            // Vignesh strict validations
            if (!name || !emailLower || !pass || !conf) {
                triggerRegisterError('Please fill in all the details.');
                return;
            }
            if (name.length < 3) {
                triggerRegisterError('Faculty name must be at least 3 characters.');
                return;
            }
            if (!/^[a-zA-Z0-9._%+-]+@tce\.edu$/.test(emailLower)) {
                triggerRegisterError('Email must end with @tce.edu.');
                return;
            }
            if (pass.length < 8 || pass.length > 13) {
                triggerRegisterError('Password must be 8–13 characters.');
                return;
            }
            if (pass !== conf) {
                triggerRegisterError('Passwords do not match.');
                return;
            }

            var isHod = emailLower.indexOf('hod') !== -1;
            var newUser = {
                name:       name,
                email:      emailLower,
                password:   pass,
                role:       isHod ? 'HOD - IT' : 'IT Faculty',
                department: $scope.regDepartment,
                employeeId: 'TCE-' + Math.floor(100 + Math.random() * 900)
            };

            BookingApiService.register(newUser)
                .then(function (response) {
                    $scope.toastMsg  = 'Faculty Account registered successfully! You can now log in.';
                    $scope.toastType = 'success';
                    $timeout(function () { RouteService.navigateTo('login.html'); }, 1500);
                })
                .catch(function (error) {
                    var msg = (error.data && error.data.error) ? error.data.error : 'Registration failed.';
                    triggerRegisterError(msg);
                });
        };

        $scope.goToLogin = function () { RouteService.navigateTo('login.html'); };
    }
]);

/* -------------------------------------------------------
   3. DashboardCtrl  →  dashboard.html
   Source: Vignesh Code (DashboardStatsFactory for stats)
   ------------------------------------------------------- */
app.controller('DashboardCtrl', [
    '$scope', 'VenueService', 'BookingService', 'BookingApiService', 'RouteService',
    function ($scope, VenueService, BookingService, BookingApiService, RouteService) {

        if (!requireAuth(VenueService, RouteService)) return;

        $scope.currentUser = VenueService.currentUser;
        var userEmail      = $scope.currentUser.email;

        // API mode flag — set to true to route through the Express backend.
        // When false (default), the existing LocalStorage behaviour is preserved.
        $scope.apiMode = true;

        $scope.statusFilter  = 'all';
        $scope.statusOptions = [
            { label: 'All Bookings', value: 'all'      },
            { label: 'Approved',     value: 'approved' },
            { label: 'Pending',      value: 'pending'  },
            { label: 'Rejected',     value: 'rejected' }
        ];

        function loadBookings() {
            if ($scope.apiMode) {
                // API mode ON — fetch from Express server, then filter client-side
                BookingApiService.getBookings()
                    .then(function (response) {
                        var all = response.data;
                        $scope.myBookings = all.filter(function (b) {
                            return (b.email || '').toLowerCase() === userEmail.toLowerCase();
                        });
                        updateStats();
                    })
                    .catch(function (err) {
                        console.error('[DashboardCtrl] API error — falling back to LocalStorage:', err.status, err.statusText);
                        $scope.myBookings = BookingService.getBookingsByFaculty(userEmail);
                        updateStats();
                    });
            } else {
                // API mode OFF — use existing LocalStorage service
                $scope.myBookings = BookingService.getBookingsByFaculty(userEmail);
                updateStats();
            }
        }

        function updateStats() {
            var bookings = $scope.myBookings || [];
            $scope.upcomingCount = bookings.length;
            $scope.approvedCount = bookings.filter(function(b) { return b.status === 'approved'; }).length;
            $scope.pendingCount  = bookings.filter(function(b) { return b.status === 'pending'; }).length;
        }

        loadBookings();

        $scope.exportData = function () {
            var lines  = ['Venue,Date,Slot,Status'];
            ($scope.myBookings || []).forEach(function (b) {
                lines.push([b.venue, b.date, b.slot, b.status].join(','));
            });
            var blob = new Blob([lines.join('\n')], { type: 'text/csv' });
            var url  = URL.createObjectURL(blob);
            var a    = document.createElement('a');
            a.href     = url;
            a.download = 'my_bookings.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };

        $scope.goToVenues     = function () { RouteService.navigateTo('venue-booking.html'); };
        $scope.goToMyBookings = function () { RouteService.navigateTo('my-bookings.html');   };
        $scope.goToAccount    = function () { RouteService.navigateTo('account.html');        };
        $scope.logout         = function () { doLogout(VenueService, RouteService);           };
    }
]);

/* -------------------------------------------------------
   4. MyBookingsCtrl  →  my-bookings.html
   Source: Aathman Code (edit/delete/view workflow + toggleView)
   ------------------------------------------------------- */
app.controller('MyBookingsCtrl', [
    '$scope', '$window', 'VenueService', 'BookingService', 'BookingApiService', 'RouteService',
    function ($scope, $window, VenueService, BookingService, BookingApiService, RouteService) {

        if (!requireAuth(VenueService, RouteService)) return;

        $scope.currentUser = VenueService.currentUser;
        var userEmail      = $scope.currentUser.email;

        // API mode flag — set to true to route through the Express backend.
        // When false (default), the existing LocalStorage behaviour is preserved.
        $scope.apiMode = true;

        function loadMyBookings() {
            if ($scope.apiMode) {
                // API mode ON — fetch all from server, filter by faculty email client-side
                BookingApiService.getBookings()
                    .then(function (response) {
                        var all = response.data;
                        $scope.myBookings = all.filter(function (b) {
                            return (b.email || '').toLowerCase() === userEmail.toLowerCase();
                        });
                    })
                    .catch(function (err) {
                        console.error('[MyBookingsCtrl] API error — falling back to LocalStorage:', err.status, err.statusText);
                        $scope.myBookings = BookingService.getBookingsByFaculty(userEmail);
                    });
            } else {
                // API mode OFF — use existing LocalStorage service
                $scope.myBookings = BookingService.getBookingsByFaculty(userEmail);
            }
        }
        loadMyBookings();

        $scope.statusFilter  = 'all';
        $scope.statusOptions = [
            { label: 'All',      value: 'all'      },
            { label: 'Approved', value: 'approved' },
            { label: 'Pending',  value: 'pending'  },
            { label: 'Rejected', value: 'rejected' }
        ];

        $scope.toggleView = function (bk) { bk.isViewing = !bk.isViewing; };

        $scope.viewDetails = function (bk) {
            VenueService.saveFacultySelectedBooking(bk);
            RouteService.navigateTo('booking-details.html');
        };

        $scope.editWorkflow = function (bk) {
            var venue = null;
            for (var i = 0; i < VenueService.venuesList.length; i++) {
                if (VenueService.venuesList[i].name === bk.venue) { venue = VenueService.venuesList[i]; break; }
            }
            if (venue) { VenueService.saveSelectedVenue(venue); }
            VenueService.saveBookingDraft({
                isEditing:         true,
                editBookingId:     bk.id,
                selectedVenueName: bk.venue,
                selectedBuilding:  bk.building,
                selectedDay:       bk.date ? parseInt(bk.date.replace(/\D/g, ''), 10) || 20 : 20,
                selectedSlot:      bk.slot,
                techReq:           bk.techReq   || {},
                notes:             bk.notes     || '',
                activeCategory:    bk.category  || 'All'
            });
            RouteService.navigateTo('venue-booking.html');
        };

        $scope.deleteBooking = function (bk) {
            if (!$window.confirm('Are you sure you want to delete the booking for ' + bk.venue + '?')) return;
            if ($scope.apiMode) {
                // API mode ON — delete via Express, then reload from server
                BookingApiService.deleteBooking(bk.id)
                    .then(function () { loadMyBookings(); })
                    .catch(function (err) {
                        console.error('[MyBookingsCtrl] Delete API error:', err.status, err.statusText);
                    });
            } else {
                // API mode OFF — delete from LocalStorage
                BookingService.deleteBooking(bk.id);
                loadMyBookings();
            }
        };

        $scope.goToVenues  = function () { RouteService.navigateTo('venue-booking.html'); };
        $scope.goDashboard = function () { RouteService.navigateTo('dashboard.html');     };
        $scope.logout      = function () { doLogout(VenueService, RouteService);          };
    }
]);

/* -------------------------------------------------------
   5. VenueBookingCtrl  →  venue-booking.html
   Source: Vignesh Code (CarouselHelperFactory + building images)
   ------------------------------------------------------- */
app.controller('VenueBookingCtrl', [
    '$scope', 'VenueService', 'RouteService', 'BookingApiService',
    function ($scope, VenueService, RouteService, BookingApiService) {

        if (!requireAuth(VenueService, RouteService)) return;

        $scope.currentUser     = VenueService.currentUser;
        $scope.activeCategory  = 'All';
        $scope.searchQuery     = '';
        $scope.categoryOptions = ['All', 'Auditorium', 'Seminar Hall', 'Lab'];
        
        $scope.venuesList = [];
        // Fetch venues from API
        BookingApiService.getVenues()
            .then(function(response) {
                $scope.venuesList = response.data;
                // Update VenueService static list so filteredVenues() logic works
                VenueService.venuesList = response.data;
            })
            .catch(function(err) {
                console.error('[VenueBookingCtrl] Error fetching venues API, falling back to static:', err);
                $scope.venuesList = VenueService.venuesList;
            });

        // Building carousel with images (Vignesh)
        $scope.buildings = [
            { name: 'Main Building',           count: 6, tag1: 'Main',         tag2: 'Building 6', desc: 'Tap to explore the full venue list.',                 icon: '🏢'   },
            { name: 'Mechatronics',            count: 3, tag1: 'Mechatronics', tag2: 'Dept 3',     desc: 'Tap to view limited venue options.',                  icon: '⚙️'    },
            { name: 'CSE dept',                count: 4, tag1: 'CSE',          tag2: 'Dept 4',     desc: 'Tap to view auditoriums, seminar halls & labs.',       icon: '💻'        },
            { name: 'IT Department',           count: 4, tag1: 'IT',           tag2: 'Dept 4',     desc: 'Tap to explore IT labs and seminar halls.',            icon: '🌐'         },
            { name: 'Indoor Stadium',          count: 3, tag1: 'Sports',       tag2: 'Stadium 3',  desc: 'Tap to view sports courts and conference facilities.', icon: '🏟️'  },
            { name: 'Architecture Department', count: 4, tag1: 'Architecture', tag2: 'Dept 4',     desc: 'Tap to explore design studios and workshops.',         icon: '📐'    }
        ];

        $scope.getBuildingIcon = function(name) {
            var b = $scope.buildings.find(function(x) { return x.name === name; });
            return b ? b.icon : '🏢';
        };

        $scope.currentBuildingIndex = 0;
        $scope.currentBuilding      = function () { return $scope.buildings[$scope.currentBuildingIndex]; };

        // Inline Carousel math
        $scope.prevBuilding = function () {
            $scope.currentBuildingIndex = ($scope.currentBuildingIndex - 1 + $scope.buildings.length) % $scope.buildings.length;
            $scope.selectedBuilding     = $scope.currentBuilding().name;
            $scope.activeCategory       = 'All';
        };

        $scope.nextBuilding = function () {
            $scope.currentBuildingIndex = ($scope.currentBuildingIndex + 1) % $scope.buildings.length;
            $scope.selectedBuilding     = $scope.currentBuilding().name;
            $scope.activeCategory       = 'All';
        };

        var draft = VenueService.getBookingDraft();
        if (draft && draft.isEditing && draft.selectedBuilding) {
            for (var i = 0; i < $scope.buildings.length; i++) {
                if ($scope.buildings[i].name === draft.selectedBuilding) { $scope.currentBuildingIndex = i; break; }
            }
            $scope.activeCategory = draft.activeCategory || 'All';
        } else if (draft && draft.activeCategory && draft.activeCategory !== 'All') {
            $scope.activeCategory = draft.activeCategory;
        }

        $scope.selectedBuilding = $scope.currentBuilding().name;

        $scope.selectBuilding = function (buildingName) {
            $scope.selectedBuilding = buildingName;
            $scope.activeCategory   = 'All';
            for (var j = 0; j < $scope.buildings.length; j++) {
                if ($scope.buildings[j].name === buildingName) { $scope.currentBuildingIndex = j; break; }
            }
        };

        $scope.setCategory = function (catName) { $scope.activeCategory = catName; };

        $scope.filteredVenues = function () {
            return VenueService.filteredVenues($scope.selectedBuilding, $scope.activeCategory, $scope.searchQuery);
        };

        $scope.startBooking = function (venue) {
            VenueService.saveSelectedVenue(venue);
            VenueService.clearHodSelectedBooking();
            VenueService.clearFacultySelectedBooking();
            RouteService.navigateTo('booking-details.html');
        };

        $scope.goDashboard  = function () { RouteService.navigateTo('dashboard.html');  };
        $scope.goMyBookings = function () { RouteService.navigateTo('my-bookings.html'); };
        $scope.logout       = function () { doLogout(VenueService, RouteService);        };
    }
]);

/* -------------------------------------------------------
   6. BookingDetailsController  →  booking-details.html
   Source: Aathman Code (tri-modal + BookingDetailsService + BookingFactory coexistence demo)
   ------------------------------------------------------- */
app.controller('BookingDetailsController', [
    '$scope', 'VenueService', 'BookingService', 'BookingApiService', 'RouteService',
    'BookingDetailsService', '$timeout',
    function ($scope, VenueService, BookingService, BookingApiService, RouteService,
              BookingDetailsService, $timeout) {

        if (!requireAuth(VenueService, RouteService)) return;

        $scope.currentUser = VenueService.currentUser;

        // API mode flag — set to true to route through the Express backend.
        // When false (default), the existing LocalStorage behaviour is preserved.
        $scope.apiMode = true;

        var details        = BookingDetailsService.getBookingDetails();
        var hodBooking     = details.hodBooking;
        var facultyBooking = details.facultyBooking;

        $scope.isHodView     = !!hodBooking;
        $scope.isFacultyView = !hodBooking && !!facultyBooking;

        // Removed coexistence demo logic

        // MODE A: HOD
        if ($scope.isHodView) {
            $scope.hodBooking     = hodBooking;
            $scope.hodTechReqRows = BookingDetailsService.buildTechReqRows(hodBooking.techReq);

            $scope.approveBooking = function () {
                if (!$scope.hodBooking.isStatic) {
                    BookingDetailsService.updateBookingStatus($scope.hodBooking.id, 'approved');
                    BookingService.approveBooking($scope.hodBooking.id);
                    if ($scope.apiMode) {
                        // API mode ON — also update status on Express server
                        BookingApiService.updateBooking($scope.hodBooking.id, { status: 'approved' })
                            .catch(function (err) {
                                console.error('[BookingDetailsController] Approve API error:', err.status, err.statusText);
                            });
                    }
                }
                $scope.hodBooking.status = 'approved';
                VenueService.clearHodSelectedBooking();
                RouteService.navigateTo('approval-permission.html');
            };

            $scope.rejectBooking = function () {
                if (!$scope.hodBooking.isStatic) {
                    BookingDetailsService.updateBookingStatus($scope.hodBooking.id, 'rejected');
                    BookingService.rejectBooking($scope.hodBooking.id);
                    if ($scope.apiMode) {
                        // API mode ON — also update status on Express server
                        BookingApiService.updateBooking($scope.hodBooking.id, { status: 'rejected' })
                            .catch(function (err) {
                                console.error('[BookingDetailsController] Reject API error:', err.status, err.statusText);
                            });
                    }
                }
                $scope.hodBooking.status = 'rejected';
                VenueService.clearHodSelectedBooking();
                RouteService.navigateTo('approval-permission.html');
            };

            $scope.goBack = function () {
                VenueService.clearHodSelectedBooking();
                RouteService.navigateTo('approval-permission.html');
            };

        // MODE B: Faculty existing booking
        } else if ($scope.isFacultyView) {
            $scope.facultyBooking     = facultyBooking;
            $scope.facultyTechReqRows = BookingDetailsService.buildTechReqRows(facultyBooking.techReq);

            $scope.editBooking = function () {
                var venue = null;
                for (var i = 0; i < VenueService.venuesList.length; i++) {
                    if (VenueService.venuesList[i].name === facultyBooking.venue) { venue = VenueService.venuesList[i]; break; }
                }
                if (venue) { VenueService.saveSelectedVenue(venue); }
                VenueService.saveBookingDraft({
                    isEditing:         true,
                    editBookingId:     facultyBooking.id,
                    selectedVenueName: facultyBooking.venue,
                    selectedBuilding:  facultyBooking.building,
                    selectedDay:       facultyBooking.date ? parseInt(facultyBooking.date.replace(/\D/g, ''), 10) || 20 : 20,
                    selectedSlot:      facultyBooking.slot,
                    techReq:           facultyBooking.techReq   || {},
                    notes:             facultyBooking.notes     || '',
                    activeCategory:    facultyBooking.category  || 'All'
                });
                VenueService.clearFacultySelectedBooking();
                RouteService.navigateTo('venue-booking.html');
            };

            $scope.deleteInProgress = false;
            $scope.deleteBooking = function () {
                $scope.deleteInProgress = true;
                if ($scope.apiMode) {
                    // API mode ON — delete on Express server, then navigate away
                    BookingApiService.deleteBooking(facultyBooking.id)
                        .then(function () {
                            BookingDetailsService.deleteBooking(facultyBooking.id, facultyBooking.venue);
                            VenueService.clearFacultySelectedBooking();
                            RouteService.navigateTo('my-bookings.html');
                        })
                        .catch(function (err) {
                            console.error('[BookingDetailsController] Delete API error:', err.status, err.statusText);
                            $scope.deleteInProgress = false;
                        });
                } else {
                    // API mode OFF — existing LocalStorage delete
                    $timeout(function () {
                        var deleted = BookingDetailsService.deleteBooking(facultyBooking.id, facultyBooking.venue);
                        if (deleted) {
                            // Parallel BookingFactory logic removed
                            // BookingService handles its own state.
                            BookingService.deleteBooking(facultyBooking.id);
                            VenueService.clearFacultySelectedBooking();
                            RouteService.navigateTo('my-bookings.html');
                        } else {
                            $scope.deleteInProgress = false;
                        }
                    }, 400);
                }
            };

            $scope.goBack = function () {
                VenueService.clearFacultySelectedBooking();
                RouteService.navigateTo('my-bookings.html');
            };

        // MODE C: Faculty new booking — date & time picker
        } else {
            console.log("[DEBUG] BookingDetailsController MODE C initialized.");
            $scope.selectedVenue = VenueService.getSelectedVenue() || VenueService.venuesList[0];

            var draft = VenueService.getBookingDraft();

            $scope.slot = {
                selectedDate: null,
                selectedStartTime: null,
                selectedEndTime: null,
                timeError: ''
            };

            // minDate as a local YYYY-MM-DD string so the HTML min attribute works
            // correctly in all timezones (using en-CA locale which returns YYYY-MM-DD).
            var today  = new Date();
            var yy     = today.getFullYear();
            var mm     = String(today.getMonth() + 1).padStart(2, '0');
            var dd     = String(today.getDate()).padStart(2, '0');
            $scope.minDate = yy + '-' + mm + '-' + dd;   // e.g. "2026-09-22"

            // AngularJS <input type="date">  expects ng-model = Date object (or null).
            // AngularJS <input type="time">  expects ng-model = Date object (or null).
            // Restore from draft if present, otherwise start with sensible defaults.
            if (draft && draft.selectedDate) {
                // Draft stores an ISO string from a previous visit — parse it back.
                var restoredDate = new Date(draft.selectedDate);
                $scope.slot.selectedDate = isNaN(restoredDate) ? null : restoredDate;
            } else {
                // Default: today at LOCAL midnight so the date input shows today.
                $scope.slot.selectedDate = new Date(yy, today.getMonth(), today.getDate(), 0, 0, 0, 0);
            }

            if (draft && draft.selectedStartTime) {
                var restoredStart = new Date(draft.selectedStartTime);
                // Re-build as an epoch-date time so AngularJS time input displays it.
                $scope.slot.selectedStartTime = isNaN(restoredStart)
                    ? null
                    : new Date(1970, 0, 1, restoredStart.getHours(), restoredStart.getMinutes(), 0, 0);
            } else {
                $scope.slot.selectedStartTime = null;
            }

            if (draft && draft.selectedEndTime) {
                var restoredEnd = new Date(draft.selectedEndTime);
                $scope.slot.selectedEndTime = isNaN(restoredEnd)
                    ? null
                    : new Date(1970, 0, 1, restoredEnd.getHours(), restoredEnd.getMinutes(), 0, 0);
            } else {
                $scope.slot.selectedEndTime = null;
            }

            // Both model values are Date objects; numeric comparison works correctly.
            $scope.$watchGroup(['slot.selectedStartTime', 'slot.selectedEndTime'], function(newValues) {
                var start = newValues[0];
                var end   = newValues[1];
                if (start && end) {
                    $scope.slot.timeError = (end <= start) ? 'End time must be after start time' : '';
                } else {
                    $scope.slot.timeError = '';
                }
            });

            $scope.canContinue = function () {
                return !!$scope.slot.selectedDate &&
                       !!$scope.slot.selectedStartTime &&
                       !!$scope.slot.selectedEndTime &&
                       !$scope.slot.timeError;
            };

            $scope.continueToTechReq = function () {
                console.log("[DEBUG] continueToTechReq() CLICKED");
                console.log("[DEBUG] BEFORE Validation: canContinue() =", $scope.canContinue());
                if (!$scope.canContinue()) {
                    console.log("[DEBUG] Validation FAILED. Stopping execution.");
                    return;
                }
                console.log("[DEBUG] AFTER Validation: Passed");

                try {
                    var dateModel  = new Date($scope.slot.selectedDate);       // Date object (local midnight)
                    
                    var parseTime = function(t) {
                        if (t instanceof Date && !isNaN(t)) return t;
                        if (typeof t === 'string' && t.indexOf(':') !== -1) {
                            var parts = t.split(':');
                            var d = new Date();
                            d.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
                            return d;
                        }
                        return new Date(t);
                    };

                    var startModel = parseTime($scope.slot.selectedStartTime);  // Date object (epoch date, local time)
                    var endModel   = parseTime($scope.slot.selectedEndTime);    // Date object (epoch date, local time)

                    // Combine local date components (from dateModel) with local time
                    // components (from startModel/endModel) into a single ISO timestamp.
                    // This avoids the epoch-date issue in .toISOString() on time-only Dates,
                    // and avoids UTC off-by-one-day issues from .toISOString() on date-only Dates.
                    var combined = function(dateObj, timeObj) {
                        return new Date(
                            dateObj.getFullYear(),
                            dateObj.getMonth(),
                            dateObj.getDate(),
                            timeObj.getHours(),
                            timeObj.getMinutes(),
                            0, 0
                        ).toISOString();
                    };

                    var isoStart = combined(dateModel, startModel);
                    var isoEnd   = combined(dateModel, endModel);
                    // Store the date as local midnight ISO for TechnicalRequirementController.
                    var isoDate  = new Date(
                        dateModel.getFullYear(),
                        dateModel.getMonth(),
                        dateModel.getDate(),
                        0, 0, 0, 0
                    ).toISOString();

                    console.log("[DEBUG] BEFORE saving booking draft");
                    var currentDraft = VenueService.getBookingDraft();
                    VenueService.saveBookingDraft(angular.extend({}, currentDraft, {
                        selectedDate:      isoDate,
                        selectedStartTime: isoStart,
                        selectedEndTime:   isoEnd,
                        activeCategory:    'All'
                    }));

                    console.log("[DEBUG] BEFORE navigation to technical-requirements.html");
                    RouteService.navigateTo('technical-requirements.html');
                } catch (err) {
                    console.error('[BookingDetailsController] continueToTechReq error:', err);
                    alert('An error occurred while processing your booking. Please re-select the date and times and try again.');
                }
            };

            $scope.backToVenues = function () { RouteService.navigateTo('venue-booking.html'); };
            $scope.goDashboard  = function () { RouteService.navigateTo('dashboard.html'); };
        }
    }
]);

/* -------------------------------------------------------
   7. TechnicalRequirementController  →  technical-requirements.html
   Source: Aathman Code (TechnicalRequirementService + TechnicalRequirementFactory coexistence)
   ------------------------------------------------------- */
app.controller('TechnicalRequirementController', [
    '$scope', 'VenueService', 'BookingService', 'BookingApiService', 'RouteService',
    'TechnicalRequirementService',
    function ($scope, VenueService, BookingService, BookingApiService, RouteService,
              TechnicalRequirementService) {

        if (!requireAuth(VenueService, RouteService)) return;

        $scope.currentUser      = VenueService.currentUser;
        $scope.selectedVenue    = VenueService.getSelectedVenue() || VenueService.venuesList[0];
        $scope.submitting       = false;
        $scope.validationErrors = [];

        // API mode flag — set to true to route through the Express backend.
        // When false (default), the existing LocalStorage behaviour is preserved.
        $scope.apiMode = true;

        var draft          = VenueService.getBookingDraft();
        $scope.selectedDate = draft ? draft.selectedDate : null;
        $scope.selectedStartTime = draft ? draft.selectedStartTime : null;
        $scope.selectedEndTime = draft ? draft.selectedEndTime : null;

        $scope.conflictDetected = false;
        $scope.conflictMessage  = '';
        $scope.recommendations  = [];

        $scope.selectAlternativeVenue = function(altVenue) {
            $scope.selectedVenue = altVenue;
            VenueService.saveSelectedVenue(altVenue);
            $scope.conflictDetected = false;
            $scope.conflictMessage = '';
            $scope.recommendations = [];
        };

        $scope.techReq = TechnicalRequirementService.loadRequirements(draft);

        // Coexistence demo logic removed

        $scope.confirmBooking = function () {
            console.log("[DEBUG] confirmBooking started");
            if ($scope.submitting) return;
            $scope.validationErrors = TechnicalRequirementService.validateRequirements($scope.techReq);
            console.log("[DEBUG] validationErrors", $scope.validationErrors);
            if ($scope.validationErrors.length > 0) return;

            $scope.submitting = true;
            TechnicalRequirementService.saveRequirements($scope.techReq, {
                selectedDate:  $scope.selectedDate,
                selectedStartTime: $scope.selectedStartTime,
                selectedEndTime: $scope.selectedEndTime
            });

            var isHod = ($scope.currentUser && $scope.currentUser.role.toUpperCase() === 'HOD');
            var isAdmin = ($scope.currentUser && $scope.currentUser.role.toUpperCase() === 'ADMIN');
            var initialStatus = isAdmin ? 'APPROVED' : (isHod ? 'HOD_APPROVED' : 'pending');

            var dateObj = new Date($scope.selectedDate);
            var dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
            
            var startObj = new Date($scope.selectedStartTime);
            var endObj = new Date($scope.selectedEndTime);
            var startStr = startObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            var endStr = endObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            var slotStr = startStr + ' - ' + endStr;

            var bookingData = {
                venue:    $scope.selectedVenue.name,
                date:     dateStr,
                slot:     slotStr,
                startTime: startObj.toISOString(),
                endTime:   endObj.toISOString(),
                faculty:  $scope.currentUser ? $scope.currentUser.name : 'Unknown',
                email:    $scope.currentUser ? $scope.currentUser.email : 'Unknown',
                department: $scope.currentUser ? ($scope.currentUser.department || 'General') : 'General',
                notes:    $scope.techReq.otherRequirements,
                techReq:  angular.copy($scope.techReq),
                building: $scope.selectedVenue.building,
                category: $scope.selectedVenue.category,
                status:   initialStatus
            };
            console.log("[DEBUG] bookingData", bookingData);

            // ---- Helper: run TechnicalRequirementFactory side-effects & navigate ----
            function finishBooking(finalBooking) {
                VenueService.saveLastBooking(finalBooking);

                // Parallel TechnicalRequirementFactory logic removed

                VenueService.saveBookingDraft({
                    selectedDate:      null,
                    selectedStartTime: null,
                    selectedEndTime:   null,
                    activeCategory:    'All',
                    isEditing:      false,
                    editBookingId:  null,
                    techReq:        null
                });

                RouteService.navigateTo('booking-confirmation.html');
            }

            if ($scope.apiMode) {
                console.log("[DEBUG] API mode is true");
                // API mode ON — create/update via Express server, then fall through to LocalStorage as source of truth for confirmation page
                var apiCall = (draft && draft.isEditing && draft.editBookingId)
                    ? BookingApiService.updateBooking(draft.editBookingId, bookingData)
                    : BookingApiService.createBooking(bookingData);

                apiCall
                    .then(function (response) {
                        // Mirror to LocalStorage so confirmation page can read it
                        var finalBooking = response.data;
                        BookingService.createBooking(angular.extend({}, bookingData, { id: finalBooking.id }));
                        finishBooking(finalBooking);
                    })
                    .catch(function (err) {
                        if (err.status === 409) {
                            console.warn('[TechnicalRequirementController] 409 Conflict. Suggesting alternatives.');
                            $scope.submitting = false;
                            
                            var currentVenue = $scope.selectedVenue.name;
                            var currentCategory = $scope.selectedVenue.category;
                            var newStart = new Date(bookingData.startTime).getTime();
                            var newEnd = new Date(bookingData.endTime).getTime();
                            
                            $scope.conflictDetected = true;
                            $scope.conflictMessage = currentVenue + " is already booked for the selected date and time.";
                            $scope.recommendations = [];
                            
                            BookingApiService.getVenues().then(function(vRes) {
                                var allVenues = vRes.data;
                                var sameCategoryVenues = allVenues.filter(function(v) {
                                    return v.category === currentCategory && v.name !== currentVenue;
                                });
                                
                                BookingApiService.getBookings().then(function(bRes) {
                                    var allBookings = bRes.data;
                                    
                                    var availableAlternatives = sameCategoryVenues.filter(function(candidate) {
                                        var conflict = false;
                                        for (var i = 0; i < allBookings.length; i++) {
                                            var b = allBookings[i];
                                            if (b.venue === candidate.name && b.date === bookingData.date && b.status !== 'rejected') {
                                                if (draft && draft.isEditing && draft.editBookingId === b.id) {
                                                    continue;
                                                }
                                                if (b.startTime && b.endTime) {
                                                    var existingStart = new Date(b.startTime).getTime();
                                                    var existingEnd = new Date(b.endTime).getTime();
                                                    if (newStart < existingEnd && newEnd > existingStart) {
                                                        conflict = true;
                                                        break;
                                                    }
                                                } else if (b.slot === bookingData.slot) {
                                                    conflict = true;
                                                    break;
                                                }
                                            }
                                        }
                                        return !conflict;
                                    });
                                    
                                    $scope.recommendations = availableAlternatives;
                                }).catch(function(e) {
                                    console.error("Error fetching bookings for recommendations", e);
                                });
                            }).catch(function(e) {
                                console.error("Error fetching venues for recommendations", e);
                            });
                        } else {
                            console.error('[TechnicalRequirementController] API error:', err.status, err.statusText);
                            $scope.submitting = false;
                            alert("Booking failed: " + (err.data && err.data.error ? err.data.error : err.statusText));
                        }
                    });
            } else {
                // API mode OFF — use existing LocalStorage service
                var finalBooking;
                if (draft && draft.isEditing && draft.editBookingId) {
                    finalBooking = BookingService.updateBooking(draft.editBookingId, bookingData);
                    if (!finalBooking) { finalBooking = BookingService.createBooking(bookingData); }
                } else {
                    finalBooking = BookingService.createBooking(bookingData);
                }
                finishBooking(finalBooking);
            }
        };

        $scope.resetRequirements = function () {
            $scope.techReq          = TechnicalRequirementService.getDefaults();
            $scope.validationErrors = [];
        };

        $scope.backToDetails = function () { RouteService.navigateTo('booking-details.html'); };
        $scope.logout        = function () { doLogout(VenueService, RouteService); };
    }
]);

/* -------------------------------------------------------
   8. ConfirmationCtrl  →  booking-confirmation.html
   Source: Sarvesh Code (ConfirmationFactory — real PDF + passcode)
   ------------------------------------------------------- */
app.controller('ConfirmationCtrl', [
    '$scope', '$window', 'VenueService', 'RouteService',
    function ($scope, $window, VenueService, RouteService) {

        if (!requireAuth(VenueService, RouteService)) return;

        $scope.currentUser = VenueService.currentUser;
        $scope.lastBooking = VenueService.getLastBooking();

        // Generate security passcode inline
        function generatePasscode(bookingId) {
            var base = bookingId ? bookingId.replace(/[^A-Z0-9]/gi, '') : 'BK1001';
            return 'TCE-PASS-' + base.substring(0, 6) + '-' + Math.floor(1000 + Math.random() * 9000);
        }

        $scope.passCode = generatePasscode($scope.lastBooking ? $scope.lastBooking.id : 'BK-1001');

        $scope.toastMsg  = '';
        $scope.toastType = '';

        // Real PDF download logic inline
        $scope.downloadConfirmation = function () {
            var booking = $scope.lastBooking || {};
            var content = "===========================================\n" +
                          "     THIAGARAJAR COLLEGE OF ENGINEERING    \n" +
                          "      FACULTY VENUE BOOKING PASS          \n" +
                          "===========================================\n" +
                          "Booking Ref : " + (booking.id || 'BK-1001') + "\n" +
                          "Venue       : " + (booking.venue || 'KS Auditorium') + "\n" +
                          "Date & Time : " + (booking.date || 'Mon, 20 Apr') + " | " + (booking.slot || '10:00 AM - 12:00 PM') + "\n" +
                          "Faculty     : " + (booking.faculty || 'Faculty Member') + "\n" +
                          "Status      : " + (booking.status || 'Confirmed').toUpperCase() + "\n" +
                          "Passcode    : " + $scope.passCode + "\n" +
                          "===========================================";

            var blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            var url  = $window.URL.createObjectURL(blob);
            var a    = document.createElement('a');
            a.href     = url;
            a.download = 'Venue_Booking_Pass_' + (booking.id || 'BK1001') + '.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            $window.URL.revokeObjectURL(url);

            $scope.toastMsg  = 'Confirmation pass downloaded successfully!';
            $scope.toastType = 'success';
        };

        $scope.viewInCalendar = function () { RouteService.navigateTo('dashboard.html');     };
        $scope.bookAnother    = function () { RouteService.navigateTo('venue-booking.html'); };
        $scope.goMyBookings   = function () { RouteService.navigateTo('my-bookings.html');   };
        $scope.goDashboard    = function () { RouteService.navigateTo('dashboard.html');     };
        $scope.logout         = function () { doLogout(VenueService, RouteService);          };
    }
]);

/* -------------------------------------------------------
   9. AccountController  →  account.html
   Source: Aathman Code (AccountService + AccountFactory coexistence)
   ------------------------------------------------------- */
app.controller('AccountController', [
    '$scope', 'VenueService', 'AccountService', 'RouteService',
    function ($scope, VenueService, AccountService, RouteService) {

        if (!requireAuth(VenueService, RouteService)) return;

        $scope.currentUser        = VenueService.currentUser;
        $scope.editMode           = false;
        $scope.changePasswordMode = false;
        $scope.successMessage     = '';
        $scope.errorMessage       = '';
        $scope.pwSuccessMessage   = '';
        $scope.pwErrorMessage     = '';

        var loaded        = AccountService.getFacultyProfile();

        $scope.profile = {
            name:       (loaded && loaded.name)       || VenueService.currentUser.name,
            email:      (loaded && loaded.email)      || VenueService.currentUser.email,
            role:       (loaded && loaded.role)       || VenueService.currentUser.role,
            department: (loaded && loaded.department) || VenueService.currentUser.department || '',
            employeeId: (loaded && loaded.employeeId) || VenueService.currentUser.employeeId || ''
        };

        $scope.tempProfile = {};
        $scope.pwData      = { oldPassword: '', newPassword: '', confirmPassword: '' };

        $scope.enableEdit = function () {
            $scope.successMessage = '';
            $scope.errorMessage   = '';
            $scope.tempProfile    = angular.copy($scope.profile);
            $scope.editMode       = true;
        };

        $scope.saveProfile = function () {
            $scope.errorMessage   = '';
            $scope.successMessage = '';
            if (!$scope.tempProfile.name || !$scope.tempProfile.email || !$scope.tempProfile.department) {
                $scope.errorMessage = 'Please fill in all required fields.';
                return;
            }
            AccountService.updateProfile($scope.tempProfile);
            $scope.profile.name       = $scope.tempProfile.name;
            $scope.profile.email      = $scope.tempProfile.email;
            $scope.profile.department = $scope.tempProfile.department;
            VenueService.currentUser.name       = $scope.tempProfile.name;
            VenueService.currentUser.email      = $scope.tempProfile.email;
            VenueService.currentUser.department = $scope.tempProfile.department;
            VenueService.saveAuthUser(VenueService.currentUser);
            $scope.editMode       = false;
            $scope.successMessage = 'Profile updated successfully.';
        };

        $scope.cancelEdit = function () {
            $scope.tempProfile  = {};
            $scope.errorMessage = '';
            $scope.editMode     = false;
        };

        $scope.enableChangePassword = function () {
            $scope.successMessage     = '';
            $scope.pwSuccessMessage   = '';
            $scope.pwErrorMessage     = '';
            $scope.pwData             = { oldPassword: '', newPassword: '', confirmPassword: '' };
            $scope.changePasswordMode = true;
        };

        $scope.submitChangePassword = function () {
            $scope.pwSuccessMessage = '';
            $scope.pwErrorMessage   = '';
            if ($scope.pwData.newPassword !== $scope.pwData.confirmPassword) {
                $scope.pwErrorMessage = 'New password and confirm password do not match.';
                return;
            }
            var result        = AccountService.changePassword($scope.pwData.oldPassword, $scope.pwData.newPassword);
            if (result.success) {
                $scope.changePasswordMode = false;
                $scope.pwData             = { oldPassword: '', newPassword: '', confirmPassword: '' };
                $scope.successMessage     = result.message;
            } else {
                $scope.pwErrorMessage = result.message;
            }
        };

        $scope.cancelChangePassword = function () {
            $scope.pwData             = { oldPassword: '', newPassword: '', confirmPassword: '' };
            $scope.pwErrorMessage     = '';
            $scope.changePasswordMode = false;
        };

        $scope.goDashboard  = function () { RouteService.navigateTo('dashboard.html');  };
        $scope.goMyBookings = function () { RouteService.navigateTo('my-bookings.html'); };
        $scope.logout       = function () { doLogout(VenueService, RouteService);        };
    }
]);

/* -------------------------------------------------------
   10. HodDashboardCtrl  →  approval-permission.html
   Source: Sarvesh Code (HodRequestFactory CRUD + modal + requestCard + toastNotification)
   ------------------------------------------------------- */
app.controller('HodDashboardCtrl', [
    '$scope', 'VenueService', 'RouteService', 'BookingService', '$timeout', 'BookingApiService',
    function ($scope, VenueService, RouteService, BookingService, $timeout, BookingApiService) {

        if (!requireAuth(VenueService, RouteService)) return;

        $scope.currentUser  = VenueService.currentUser;
        $scope.venuesList   = VenueService.venuesList;
        $scope.timeSlots    = VenueService.timeSlots;

        $scope.statusFilter  = 'all';
        $scope.facultyFilter = '';
        $scope.dateFilter    = '';
        var isRoleAdmin = $scope.currentUser && $scope.currentUser.role.toUpperCase() === 'ADMIN';
        var isRoleHod   = $scope.currentUser && $scope.currentUser.role.toUpperCase() === 'HOD';

        $scope.statusOptions = [
            { label: 'All Statuses', value: 'all' },
            { label: 'Pending',      value: isRoleAdmin ? 'HOD_APPROVED' : 'pending' },
            { label: 'Approved',     value: isRoleAdmin ? 'APPROVED' : 'HOD_APPROVED' },
            { label: 'Rejected',     value: isRoleAdmin ? 'ADMIN_REJECTED' : 'HOD_REJECTED' }
        ];

        $scope.toastMsg  = '';
        $scope.toastType = '';

        // Toast helper
        function showToast(msg, type) {
            $scope.toastMsg  = msg;
            $scope.toastType = type || 'info';
            $timeout(function () { $scope.toastMsg = ''; }, 3000);
        }

        $scope.apiMode = true;

        // Load all requests via BookingApiService
        function loadRequests() {
            if ($scope.apiMode) {
                BookingApiService.getBookings().then(function (response) {
                    var bookings = response.data;
                    if (isRoleHod) {
                        bookings = bookings.filter(function(b) { return b.department === $scope.currentUser.department; });
                    } else if (isRoleAdmin) {
                        bookings = bookings.filter(function(b) { return b.status !== 'pending' && b.status !== 'HOD_REJECTED'; });
                    }
                    $scope.allApprovals = bookings;
                    updateCounts();
                }).catch(function (err) {
                    console.error('API Error', err);
                    $scope.allApprovals = [];
                    updateCounts();
                });
            } else {
                $scope.allApprovals = BookingService.loadBookings();
                updateCounts();
            }
        }
        loadRequests();

        function countByStatus(status) {
            return $scope.allApprovals.filter(function (b) { return b.status === status; }).length;
        }
        function updateCounts() {
            var pendingStatus = isRoleAdmin ? 'HOD_APPROVED' : 'pending';
            var approvedStatus = isRoleAdmin ? 'APPROVED' : 'HOD_APPROVED';
            var rejectedStatus = isRoleAdmin ? 'ADMIN_REJECTED' : 'HOD_REJECTED';
            
            $scope.pendingCount  = countByStatus(pendingStatus);
            $scope.approvedCount = countByStatus(approvedStatus);
            $scope.rejectedCount = countByStatus(rejectedStatus);
            $scope.totalManaged  = $scope.allApprovals.length;
        }

        // Approve via API
        $scope.approveBooking = function (booking) {
            var targetStatus = isRoleAdmin ? 'APPROVED' : 'HOD_APPROVED';
            if ($scope.apiMode) {
                BookingApiService.updateBookingStatus(booking.id, targetStatus, $scope.currentUser).then(function () {
                    booking.status = targetStatus;
                    updateCounts();
                    showToast('✓ Booking for ' + booking.venue + ' approved.', 'success');
                });
            } else {
                booking.status = targetStatus;
                updateCounts();
                showToast('✓ Booking for ' + booking.venue + ' approved.', 'success');
            }
        };

        // Reject via API
        $scope.rejectBooking = function (booking) {
            var targetStatus = isRoleAdmin ? 'ADMIN_REJECTED' : 'HOD_REJECTED';
            if ($scope.apiMode) {
                BookingApiService.updateBookingStatus(booking.id, targetStatus, $scope.currentUser).then(function () {
                    booking.status = targetStatus;
                    updateCounts();
                    showToast('✗ Booking for ' + booking.venue + ' rejected.', 'error');
                });
            } else {
                booking.status = targetStatus;
                updateCounts();
                showToast('✗ Booking for ' + booking.venue + ' rejected.', 'error');
            }
        };

        // Delete via API
        $scope.deleteBooking = function (booking) {
            if (!window.confirm('Delete booking for ' + booking.venue + '? This cannot be undone.')) return;
            if ($scope.apiMode) {
                BookingApiService.deleteBooking(booking.id).then(function () {
                    loadRequests();
                    showToast('🗑️ Booking deleted.', 'info');
                });
            } else {
                BookingService.deleteBooking(booking.id);
                loadRequests();
                showToast('🗑️ Booking deleted.', 'info');
            }
        };

        // View in booking-details.html
        $scope.viewMore = function (booking) {
            VenueService.saveHodSelectedBooking(booking.isStatic ? booking : (booking.rawBooking || booking));
            RouteService.navigateTo('booking-details.html');
        };

        // ---- ADD / EDIT MODAL ----
        $scope.showModal      = false;
        $scope.isEditingModal = false;
        $scope.modalReq       = {};
        $scope._editingId     = null;

        $scope.openAddModal = function () {
            $scope.isEditingModal = false;
            $scope.modalReq       = { status: 'pending', slot: '10:00 AM - 12:00 PM', venue: 'KS Auditorium', building: 'Main Building' };
            $scope.showModal      = true;
        };

        $scope.openEditModal = function (booking) {
            $scope.isEditingModal = true;
            $scope._editingId     = booking.id;
            $scope.modalReq       = angular.copy(booking);
            $scope.showModal      = true;
        };

        $scope.closeModal = function () { $scope.showModal = false; $scope._editingId = null; };

        $scope.saveModalRequest = function () {
            if ($scope.isEditingModal && $scope._editingId) {
                if ($scope.apiMode) {
                    BookingApiService.updateBooking($scope._editingId, $scope.modalReq).then(function () {
                        showToast('✏️ Request updated successfully.', 'success');
                        $scope.closeModal();
                        loadRequests();
                    });
                } else {
                    BookingService.updateBooking($scope._editingId, $scope.modalReq);
                    showToast('✏️ Request updated successfully.', 'success');
                    $scope.closeModal();
                    loadRequests();
                }
            } else {
                // Ensure required fields for creation
                if (!$scope.modalReq.faculty) $scope.modalReq.faculty = $scope.currentUser.name;
                if (!$scope.modalReq.email) $scope.modalReq.email = $scope.currentUser.email;
                if (!$scope.modalReq.date) $scope.modalReq.date = 'Mon, 20 Apr';
                
                if ($scope.apiMode) {
                    BookingApiService.createBooking($scope.modalReq).then(function () {
                        showToast('➕ New request added successfully.', 'success');
                        $scope.closeModal();
                        loadRequests();
                    });
                } else {
                    BookingService.createBooking($scope.modalReq);
                    showToast('➕ New request added successfully.', 'success');
                    $scope.closeModal();
                    loadRequests();
                }
            }
        };

        $scope.goToFacultyDashboard = function () { RouteService.navigateTo('dashboard.html');    };
        $scope.goToMyBookings       = function () { RouteService.navigateTo('my-bookings.html');  };
        $scope.logout               = function () { doLogout(VenueService, RouteService);          };
    }
]);
