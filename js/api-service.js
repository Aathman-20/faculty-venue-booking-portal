/* =========================================================
   FACULTY VENUE BOOKING PORTAL
   js/api-service.js

   BookingApiService — wraps $http calls to the Express backend.
   Base URL: http://localhost:3000/api
   ========================================================= */

app.service('BookingApiService', ['$http', function ($http) {
    var self    = this;
    var BASE    = 'http://localhost:3000/api';

    // ---- Bookings API ----
    self.getBookings = function (params) {
        return $http.get(BASE + '/bookings', { params: params });
    };

    self.getBooking = function (id) {
        return $http.get(BASE + '/bookings/' + id);
    };

    self.createBooking = function (booking) {
        return $http.post(BASE + '/bookings', booking);
    };

    self.updateBooking = function (id, booking) {
        return $http.put(BASE + '/bookings/' + id, booking);
    };

    self.deleteBooking = function (id) {
        return $http.delete(BASE + '/bookings/' + id);
    };
    
    self.updateBookingStatus = function (id, status) {
        return $http.patch(BASE + '/bookings/' + id + '/status', { status: status });
    };

    // ---- Auth API ----
    self.login = function (email, password) {
        return $http.post(BASE + '/auth/login', { email: email, password: password });
    };
    
    self.register = function (user) {
        return $http.post(BASE + '/auth/register', user);
    };

    // ---- Users API ----
    self.updateProfile = function (id, profile) {
        return $http.put(BASE + '/users/' + id, profile);
    };

    // ---- Dashboard API ----
    self.getStats = function (email) {
        return $http.get(BASE + '/dashboard/stats', { params: { email: email } });
    };

    // ---- Venues API ----
    self.getVenues = function () {
        return $http.get(BASE + '/venues');
    };
}]);
