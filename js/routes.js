/* =========================================================
   FACULTY VENUE BOOKING PORTAL - ROUTES (routes.js)
   RouteService: centralised navigation helper so controllers
   navigate between pages without scattering window.location.
   ========================================================= */

app.service('RouteService', ['$window', function ($window) {
    var self = this;

    // Navigate to a given page filename, e.g. 'dashboard.html'
    self.navigateTo = function (page) {
        $window.location.href = page;
    };

    // Navigate back in browser history
    self.goBack = function () {
        $window.history.back();
    };
}]);
