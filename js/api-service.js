/* =========================================================
   FACULTY VENUE BOOKING PORTAL
   js/api-service.js

   BookingApiService — wraps $http calls to the Express backend.
   Base URL: https://faculty-venue-booking-portal.onrender.com//api
   ========================================================= */

app.service('BookingApiService', ['$http', function ($http) {
    var self = this;
    var BASE = 'https://faculty-venue-booking-portal.onrender.com/api';

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

    self.updateBookingStatus = function (id, status, user, reason) {
        var payload = { status: status, user: user };
        if (reason) payload.reason = reason;
        console.log("DEBUG API: PATCH /bookings/" + id + "/status");
        console.log("DEBUG API: reason passed in =", reason);
        console.log("DEBUG API: payload =", payload);
        return $http.patch(BASE + '/bookings/' + id + '/status', payload);
    };

    // ---- Auth API ----
    self.login = function (email, password) {
        return $http.post(BASE + '/auth/login', { email: email, password: password });
    };

    self.register = function (user) {
        return $http.post(BASE + '/auth/register', user);
    };

    self.resetPassword = function (email, pin, newPassword) {
        return $http.post(BASE + '/auth/reset-password', { email: email, recoveryPin: pin, newPassword: newPassword });
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
