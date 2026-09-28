/* =================================================================
   FACULTY VENUE BOOKING PORTAL — FACULTY VENUE APP
   (js/faculty-venue-app.js)
   =================================================================

   PURPOSE
   -------
   Declares the  facultyVenueBookingApp  AngularJS sub-module used
   by account.html (ng-app="facultyVenueBookingApp").

   It inherits from  venueApp  (declared in app.js), which means all
   services, controllers, filters and directives registered on venueApp
   are automatically available here.

   This file also:
     • Provides the facultyName filter used in the header and profile card
     • Provides the statusBadge filter
     • Adds the $scope.$watch() debugging hooks for AccountController
     • Exposes window.fvbDebug for Chrome DevTools inspection
     • Enables the ?debug=true panel in account.html

   LOAD ORDER (account.html)
   -------------------------
   1. angular.min.js
   2. angular-animate.min.js
   3. app.js                      ← declares venueApp
   4. debug-tools.js              ← registers DebugTools constant on venueApp
   5. services.js / controllers.js / …
   6. faculty-venue-app.js        ← this file — loaded LAST

   ================================================================= */

/* ----------------------------------------------------------------
   ANGULARJS DEBUGGING DEMONSTRATION
   Declare the facultyVenueBookingApp module, inheriting venueApp
   and adding ngAnimate support for CSS animations.
   ---------------------------------------------------------------- */
var facultyVenueBookingApp = angular.module('facultyVenueBookingApp', [
    'venueApp',      // inherits all services, controllers, filters, directives
    'ngAnimate'      // enables CSS class hooks for animations.css
]);

/* ================================================================
   FILTER: facultyName
   ================================================================
   ANGULARJS DEBUGGING DEMONSTRATION — Filter
   Title-cases a faculty name for display in the header and
   profile card.  Used as:  {{profile.name | facultyName}}

   Handles both "DR. VIGNESH KUMAR" and "dr. vignesh kumar" inputs.
   ================================================================ */
facultyVenueBookingApp.filter('facultyName', function () {
    return function (input) {
        if (!input) return '';
        return input.replace(/\w\S*/g, function (word) {
            return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
        });
    };
});

/* ================================================================
   FILTER: statusBadge
   ================================================================
   Maps a booking status string to a display label / badge class.
   Available to all pages that use the facultyVenueBookingApp module.
   ================================================================ */
facultyVenueBookingApp.filter('statusBadge', function () {
    var map = {
        pending:  'Pending Review',
        approved: 'Approved',
        rejected: 'Rejected'
    };
    return function (status) {
        return map[(status || '').toLowerCase()] || status;
    };
});

/* ================================================================
   ACCOUNT PAGE DEBUGGING — AccountController $watch hooks
   ================================================================
   ANGULARJS DEBUGGING DEMONSTRATION — Scope Watch
   We decorate the AccountController's $scope after AngularJS
   creates it by using facultyVenueBookingApp.run() with $rootScope.

   Instead of modifying controllers.js, we add a run() block that
   listens for the AccountController scope to be created, then
   attaches $watch() observers to the relevant scope variables.

   This keeps all debug code isolated from the production controller.
   ================================================================ */
facultyVenueBookingApp.run([
    '$rootScope', '$injector',
    function ($rootScope, $injector) {

        var DebugTools = $injector.has('DebugTools') ? $injector.get('DebugTools') : null;
        if (!DebugTools) return;

        // ANGULARJS DEBUGGING DEMONSTRATION — Controller Binding
        // Log once when the app boots so we can confirm the module loaded.
        console.log(
            '%c[FVB] facultyVenueBookingApp module loaded',
            'color:#0ea5e9;font-weight:bold;'
        );

        /* ----------------------------------------------------------
           $rootScope.$on — listen for every new child scope created.
           When the scope belongs to AccountController (detected by
           the presence of $scope.profile), attach $watch hooks.
        ---------------------------------------------------------- */
        $rootScope.$on('$viewContentLoaded', function () {
            // Chrome DevTools Inspection helper exposed on window
            _attachFvbDebugHelpers();
        });

        /* ----------------------------------------------------------
           Attach window.fvbDebug after a short delay to ensure the
           AccountController scope has been fully initialised.
        ---------------------------------------------------------- */
        $rootScope.$watch(function () {
            // Trigger once on every digest — we use this to lazily
            // set up fvbDebug the first time.
            if (!window._fvbDebugReady) {
                _attachFvbDebugHelpers();
            }
        });

        function _attachFvbDebugHelpers() {
            /* -------------------------------------------------------
               ANGULARJS DEBUGGING DEMONSTRATION — Chrome DevTools Inspection
               Expose the convenient  window.fvbDebug  helper object.
               This allows the following in the Chrome Console:

                   fvbDebug.getAccountScope()   // returns $scope
                   fvbDebug.getCurrentUser()    // returns currentUser (no password)
                   fvbDebug.getDebugInput()     // returns $scope.debugInput
            ------------------------------------------------------- */
            window.fvbDebug = {

                /* ----------------------------------------------------
                   getAccountScope()
                   Uses the AngularJS public API to retrieve the live
                   $scope from the element that has ng-controller="AccountController".
                   Returns null if the controller is not on the page.
                ---------------------------------------------------- */
                getAccountScope: function () {
                    // ANGULARJS DEBUGGING DEMONSTRATION — Chrome DevTools Inspection
                    var el = document.querySelector('[ng-controller="AccountController"]');
                    if (!el) {
                        console.warn('[fvbDebug] AccountController element not found on this page.');
                        return null;
                    }
                    var scope = angular.element(el).scope();
                    console.log('[fvbDebug] AccountController $scope:', scope);
                    return scope;
                },

                /* ----------------------------------------------------
                   getCurrentUser()
                   Returns the currently logged-in user object from the
                   AccountController scope — password is intentionally
                   excluded to avoid accidental exposure.
                ---------------------------------------------------- */
                getCurrentUser: function () {
                    // ANGULARJS DEBUGGING DEMONSTRATION — Chrome DevTools Inspection
                    var scope = window.fvbDebug.getAccountScope();
                    if (!scope || !scope.currentUser) {
                        console.warn('[fvbDebug] currentUser not available.');
                        return null;
                    }
                    // Do NOT expose password or sensitive auth data
                    var user = scope.currentUser;
                    return {
                        name:       user.name,
                        email:      user.email,
                        role:       user.role,
                        department: user.department,
                        employeeId: user.employeeId
                        // password intentionally omitted
                    };
                },

                /* ----------------------------------------------------
                   getDebugInput()
                   Returns the current value of $scope.debugInput — the
                   two-way binding demonstration field shown when
                   ?debug=true is in the URL.
                ---------------------------------------------------- */
                getDebugInput: function () {
                    // ANGULARJS DEBUGGING DEMONSTRATION — Two-Way Data Binding
                    var scope = window.fvbDebug.getAccountScope();
                    if (!scope) return null;
                    console.log('[fvbDebug] debugInput value:', scope.debugInput);
                    return scope.debugInput;
                }
            };

            window._fvbDebugReady = true;
        }
    }
]);

/* ================================================================
   ACCOUNT CONTROLLER DEBUGGING EXTENSION
   ================================================================
   ANGULARJS DEBUGGING DEMONSTRATION — $watch hooks for AccountController

   We use a decorator-style pattern: after the app has run, we hook
   into $rootScope events to watch for AccountController scopes.
   The $watch calls are appended here (loaded last) without touching
   the original AccountController source in controllers.js.
   ================================================================ */
facultyVenueBookingApp.run([
    '$rootScope', '$injector',
    function ($rootScope, $injector) {

        var DebugTools = $injector.has('DebugTools') ? $injector.get('DebugTools') : null;
        if (!DebugTools) return;

        /* ----------------------------------------------------------
           Defer scope-watch setup so AccountController has finished
           initialising its own $scope variables.
        ---------------------------------------------------------- */
        $rootScope.$on('$routeChangeSuccess', function () {
            _setupAccountWatches($rootScope);
        });

        // Also run on initial page load (no route change fires for plain HTML pages)
        setTimeout(function () {
            _setupAccountWatches($rootScope);
        }, 200);

        function _setupAccountWatches(rootScope) {
            // ANGULARJS DEBUGGING DEMONSTRATION — Scope Watch
            var el = document.querySelector('[ng-controller="AccountController"]');
            if (!el) return; // Not on the account page — skip

            var scope = angular.element(el).scope();
            if (!scope || scope._debugWatchesAttached) return; // already set up

            // ANGULARJS DEBUGGING DEMONSTRATION — Controller Binding
            DebugTools.logController('AccountController');

            // Verify expected scope variables exist
            if (scope.profile === undefined) {
                console.warn('[FVB DebugTools] ⚠️ Warning: $scope.profile is not defined in AccountController. ' +
                             'The controller may not have loaded correctly.');
            }

            /* -------------------------------------------------------
               ANGULARJS DEBUGGING DEMONSTRATION — Scope Watch
               $watch tempProfile.* — fires whenever the user edits
               a field in the Edit Profile form.
            ------------------------------------------------------- */
            scope.$watch('tempProfile.name', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    DebugTools.logScopeChange('tempProfile.name', oldValue, newValue);
                }
            });

            scope.$watch('tempProfile.email', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    DebugTools.logScopeChange('tempProfile.email', oldValue, newValue);
                }
            });

            scope.$watch('tempProfile.department', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    DebugTools.logScopeChange('tempProfile.department', oldValue, newValue);
                }
            });

            /* -------------------------------------------------------
               ANGULARJS DEBUGGING DEMONSTRATION — Scope Watch
               $watch profile.* — fires when saveProfile() commits
               the edited values back to the profile object.
            ------------------------------------------------------- */
            scope.$watch('profile.name', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    DebugTools.logScopeChange('profile.name', oldValue, newValue);
                }
            });

            scope.$watch('profile.email', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    DebugTools.logScopeChange('profile.email', oldValue, newValue);
                }
            });

            scope.$watch('profile.department', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    DebugTools.logScopeChange('profile.department', oldValue, newValue);
                }
            });

            /* -------------------------------------------------------
               ANGULARJS DEBUGGING DEMONSTRATION — Scope Watch
               $watch editMode — fires when Edit Profile is toggled.
            ------------------------------------------------------- */
            scope.$watch('editMode', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    DebugTools.logScopeChange('editMode', oldValue, newValue);
                }
            });

            /* -------------------------------------------------------
               ANGULARJS DEBUGGING DEMONSTRATION — Scope Watch
               $watch successMessage — fires after saveProfile() sets
               the success banner text.
            ------------------------------------------------------- */
            scope.$watch('successMessage', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    DebugTools.logScopeChange('successMessage', oldValue, newValue);
                }
            });

            /* -------------------------------------------------------
               ANGULARJS DEBUGGING DEMONSTRATION — Two-Way Data Binding
               $watch debugInput — fires every time the user types in the
               ?debug=true two-way binding demonstration field.
            ------------------------------------------------------- */
            scope.$watch('debugInput', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    console.log(
                        '%cdebugInput changed:',
                        'color:#d97706;font-weight:bold;',
                        JSON.stringify(oldValue) + ' → ' + JSON.stringify(newValue)
                    );
                    DebugTools.logScopeChange('debugInput', oldValue, newValue);
                }
            });

            /* -------------------------------------------------------
               Log initial binding snapshot for profile fields.
               ANGULARJS DEBUGGING DEMONSTRATION — Binding snapshot
            ------------------------------------------------------- */
            DebugTools.logBinding('profile.name',       scope.profile ? scope.profile.name       : undefined);
            DebugTools.logBinding('profile.email',      scope.profile ? scope.profile.email      : undefined);
            DebugTools.logBinding('profile.department', scope.profile ? scope.profile.department : undefined);
            DebugTools.logBinding('editMode',           scope.editMode);
            DebugTools.logBinding('successMessage',     scope.successMessage);

            // Mark this scope so we don't re-attach on repeated digest calls
            scope._debugWatchesAttached = true;
        }
    }
]);
