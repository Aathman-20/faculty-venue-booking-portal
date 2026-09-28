/* =================================================================
   FACULTY VENUE BOOKING PORTAL — DEBUG TOOLS  (js/debug-tools.js)
   =================================================================

   PURPOSE
   -------
   Development / laboratory debugging layer for AngularJS 1.8.2.
   Provides helper functions that write to the Chrome DevTools
   console only — nothing is rendered in the production UI.

   USAGE
   -----
   Load this file AFTER app.js and BEFORE controllers.js.
   In account.html the script tag order is:
       js/app.js  →  js/debug-tools.js  →  js/services.js  →  …

   All helpers are exposed on the global DebugTools object so they
   can be called from the Chrome Console at any time, e.g.:
       DebugTools.logController('AccountController');
       DebugTools.clearDebugLog();

   ANGULARJS DEBUGGING DEMONSTRATION
   ----------------------------------
   The DebugTools object is intentionally kept outside the Angular
   DI system so it can be called from plain console commands without
   needing angular.element().scope() first.

   window.fvbDebug (defined in faculty-venue-app.js) wraps the
   Angular-specific helpers that DO require a live scope reference.

   ================================================================= */

/* ----------------------------------------------------------------
   ANGULARJS DEBUGGING DEMONSTRATION
   Global debug log — stores every logged entry so you can review
   all captured events with  DebugTools.getLog()  in the console.
   ---------------------------------------------------------------- */
var _debugLog = [];

/* ----------------------------------------------------------------
   DebugTools — the public debugging API
   ---------------------------------------------------------------- */
var DebugTools = {

    /* ------------------------------------------------------------
       logScopeChange(name, oldValue, newValue)
       ============================================================
       ANGULARJS DEBUGGING DEMONSTRATION — Scope Watch
       Called from $scope.$watch() inside controllers to trace
       every scope-variable mutation in the Chrome DevTools console.

       Example console output:
         [FVB DebugTools] Scope change detected
         (table with Variable / Old Value / New Value / Timestamp)
    ------------------------------------------------------------ */
    logScopeChange: function (name, oldValue, newValue) {
        var entry = {
            type:      'scope-change',
            variable:  name,
            oldValue:  oldValue,
            newValue:  newValue,
            timestamp: new Date().toISOString()
        };
        _debugLog.push(entry);

        // ANGULARJS DEBUGGING DEMONSTRATION — Scope Watch
        console.log(
            '%c[FVB DebugTools] Scope change detected',
            'color:#7c3aed;font-weight:bold;'
        );
        console.table([{
            Variable:    name,
            'Old Value': (oldValue === undefined ? '(undefined)' : JSON.stringify(oldValue)),
            'New Value': (newValue === undefined ? '(undefined)' : JSON.stringify(newValue)),
            Timestamp:   entry.timestamp
        }]);
    },

    /* ------------------------------------------------------------
       logController(controllerName)
       ============================================================
       ANGULARJS DEBUGGING DEMONSTRATION — Controller Binding
       Call this from a controller's init block to confirm that the
       controller was successfully instantiated by AngularJS.
    ------------------------------------------------------------ */
    logController: function (controllerName) {
        var entry = {
            type:       'controller-bind',
            controller: controllerName,
            timestamp:  new Date().toISOString()
        };
        _debugLog.push(entry);

        // ANGULARJS DEBUGGING DEMONSTRATION — Controller Binding
        console.log(
            '%c[FVB DebugTools] ' + controllerName + ' successfully bound to Account page',
            'color:#16a34a;font-weight:bold;'
        );
        console.log('   Controller instantiated at:', entry.timestamp);
    },

    /* ------------------------------------------------------------
       logBinding(name, value)
       ============================================================
       ANGULARJS DEBUGGING DEMONSTRATION — Two-Way Data Binding
       Call this whenever you want to snapshot a current scope
       variable value for inspection.
    ------------------------------------------------------------ */
    logBinding: function (name, value) {
        var entry = {
            type:      'binding-snapshot',
            variable:  name,
            value:     value,
            timestamp: new Date().toISOString()
        };
        _debugLog.push(entry);

        // ANGULARJS DEBUGGING DEMONSTRATION — Two-Way Data Binding
        console.log(
            '%c[FVB DebugTools] Binding snapshot',
            'color:#0284c7;font-weight:bold;',
            '— ' + name + ' :',
            value
        );
    },

    /* ------------------------------------------------------------
       clearDebugLog()
       Wipes the in-memory debug log and prints a confirmation.
       Useful between demo scenarios during the lab session.
    ------------------------------------------------------------ */
    clearDebugLog: function () {
        var cleared = _debugLog.length;
        _debugLog   = [];
        console.log(
            '%c[FVB DebugTools] Debug log cleared (' + cleared + ' entries removed)',
            'color:#6b7280;font-style:italic;'
        );
    },

    /* ------------------------------------------------------------
       getLog()
       Returns the full in-memory debug log array.
       Usage in console:  DebugTools.getLog()
    ------------------------------------------------------------ */
    getLog: function () {
        return _debugLog.slice(); // return a copy
    },

    /* ------------------------------------------------------------
       isDebugMode()
       Returns true when the URL contains ?debug=true or &debug=true.
       Used to gate the debug-only UI panel in account.html.
    ------------------------------------------------------------ */
    isDebugMode: function () {
        return (window.location.search || '').indexOf('debug=true') !== -1;
    }
};

/* ----------------------------------------------------------------
   Register DebugTools as a constant on the venueApp AngularJS module.
   This makes DebugTools injectable by name inside any controller
   without needing to reference the global directly.

   Usage inside a controller:
       app.controller('AccountController', [
           '$scope', 'DebugTools', function ($scope, DebugTools) { … }
       ]);
   ---------------------------------------------------------------- */
app.constant('DebugTools', DebugTools);

/* ----------------------------------------------------------------
   ANGULARJS DEBUGGING DEMONSTRATION — Chrome DevTools Inspection
   Also expose on window so Chrome DevTools can access it without
   needing to navigate the AngularJS DI tree first.
   ---------------------------------------------------------------- */
window.DebugTools = DebugTools;
