/* =================================================================
   FACULTY VENUE BOOKING PORTAL — DEBUG CONTROLLER
   js/debug-controller.js
   =================================================================

   PURPOSE
   -------
   Registers  DebugController  on the existing  venueApp  AngularJS
   module.  This file is loaded ONLY by debug-angular.html and is
   NEVER referenced by any production page (login, account, dashboard,
   booking-confirmation, technical-requirements, hod-dashboard …).

   DEMONSTRATES
   ------------
   1. Two-Way Data Binding     — debugInput via ng-model + live display
   2. Controller Binding       — ng-controller attachment + console log
   3. Scope Inspection         — angular.element(...).scope() in DevTools
   4. $watch()                 — fires on every debugInput change
   5. Undefined Variable       — undefinedValue intentionally omitted
   6. Incorrect Binding        — debugUser.name instead of user.name

   LOAD ORDER  (debug-angular.html only)
   ----------------------------------------
     1. angular.min.js
     2. app.js              ← declares venueApp module
     3. debug-tools.js      ← registers DebugTools constant on venueApp
     4. debug-controller.js ← this file (must come after app.js)
   ================================================================= */

'use strict';

/* -----------------------------------------------------------------
   ANGULARJS DEBUGGING DEMONSTRATION — Controller Registration
   DebugController is registered on the shared venueApp module.
   It is only ever instantiated when debug-angular.html is opened.
----------------------------------------------------------------- */
app.controller('DebugController', [
    '$scope',
    function ($scope) {

        /* ==========================================================
           ANGULARJS DEBUGGING DEMONSTRATION — Controller Binding
           Log immediately so students can confirm in the Console
           that ng-controller correctly instantiated this controller.
        ========================================================== */
        console.log(
            '%c[DebugController] ✅ Controller initialized',
            'color:#16a34a; font-weight:bold; font-size:13px;'
        );
        console.log(
            '[DebugController] Scope variables available:\n' +
            '  debugInput   (string, empty)\n' +
            '  user         (object: { name, email })\n' +
            '  undefinedValue ← intentionally NOT declared'
        );

        /* ==========================================================
           DEMONSTRATION 1 & 3 — Two-Way Binding + Scope Inspection

           $scope.debugInput
           -----------------
           Bound to  <input ng-model="debugInput">  in the template.
           Any keystroke in the input immediately updates this variable
           and vice-versa (two-way).

           $scope.user
           -----------
           Object with name and email properties.
           The CORRECT binding is  ng-model="user.name".
           The BROKEN  binding is  ng-model="debugUser.name"
           (a typo — debugUser does not exist in this scope).
        ========================================================== */

        // ANGULARJS DEBUGGING DEMONSTRATION — Two-Way Data Binding
        $scope.debugInput = '';

        // ANGULARJS DEBUGGING DEMONSTRATION — Scope object
        $scope.user = {
            name:  '',
            email: ''
        };

        /* ==========================================================
           DEMONSTRATION 5 — Undefined Variable

           $scope.undefinedValue is intentionally NOT declared below.
           In the template, {{undefinedValue}} renders as an empty
           string — AngularJS does NOT throw an error.

           Students verify this in the Console:
             var s = angular.element(
               document.querySelector('[ng-controller="DebugController"]')
             ).scope();
             typeof s.undefinedValue;   // → "undefined"
        ========================================================== */

        // $scope.undefinedValue   ← intentionally omitted (Demonstration 5)

        /* ==========================================================
           DEMONSTRATION 4 — $watch()

           Observes debugInput on every digest cycle.
           Console output:
             debugInput changed: "" → "h"
             debugInput changed: "h" → "he"  …
        ========================================================== */

        // ANGULARJS DEBUGGING DEMONSTRATION — $watch()
        $scope.$watch('debugInput', function (newValue, oldValue) {
            console.log('debugInput changed:', oldValue, '→', newValue);
        });

        /* ==========================================================
           DEMONSTRATION 6 — Incorrect Binding (Bug + Fix)

           BROKEN state  (bindingFixed = false)
           ─────────────────────────────────────
           The template renders:
             <input ng-model="debugUser.name">

           But the controller declares $scope.user, NOT $scope.debugUser.
           AngularJS silently creates debugUser on a child scope, so
           $scope.user.name is NEVER updated when you type.

           FIX state  (bindingFixed = true)
           ─────────────────────────────────
           The Fix Binding button calls fixBinding(), which sets
           bindingFixed = true.  The template then shows the correct:
             <input ng-model="user.name">
        ========================================================== */

        // Toggle flag: false = broken demo, true = fixed
        $scope.bindingFixed = false;
        $scope.fixMessage   = '';

        /* ----------------------------------------------------------
           fixBinding()
           Called when the student clicks "Fix Binding".
        ---------------------------------------------------------- */
        $scope.fixBinding = function () {
            $scope.bindingFixed = true;
            $scope.fixMessage   = 'Binding fixed successfully';
            console.log(
                '%c[DebugController] Binding fixed: ng-model="debugUser.name"' +
                ' → ng-model="user.name"',
                'color:#16a34a; font-weight:bold;'
            );
        };

        /* ----------------------------------------------------------
           resetBinding()
           Resets Section 6 back to the broken state so the demo
           can be repeated.
        ---------------------------------------------------------- */
        $scope.resetBinding = function () {
            $scope.bindingFixed = false;
            $scope.fixMessage   = '';
            $scope.user         = { name: '', email: '' };
            console.log(
                '%c[DebugController] Broken binding demo reset.',
                'color:#6b7280;'
            );
        };

        /* ----------------------------------------------------------
           clearConsole()
           Wipes the Chrome Console between demonstration steps.
        ---------------------------------------------------------- */
        $scope.clearConsole = function () {
            console.clear();
            console.log(
                '%c[DebugController] Console cleared — ready for next step.',
                'color:#6366f1; font-weight:bold;'
            );
        };

    }
]);
