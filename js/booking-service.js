 /* =========================================================
   FACULTY VENUE BOOKING PORTAL - BOOKING SERVICE (booking-service.js)
   BookingService: full CRUD for venue bookings, persisted in localStorage.

   Public API:
     loadBookings()              → all bookings (array)
     saveBookings(arr)           → overwrite all bookings
     createBooking(data)         → add + return new booking object
     updateBooking(id, updates)  → patch a booking by id
     deleteBooking(id)           → remove a booking by id
     approveBooking(id)          → set status = 'approved'
     rejectBooking(id)           → set status = 'rejected'
     getBookingsByFaculty(email) → filter by faculty email
     getBookingsByStatus(status) → filter by status string
   ========================================================= */

app.service('BookingService', ['$window', function ($window) {
    var self       = this;
    var STORE_KEY  = 'venueBookings';

    // ---- Private: localStorage read/write ------------------
    function load() {
        try {
            var raw = $window.localStorage.getItem(STORE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) { return []; }
    }

    function persist(bookings) {
        try {
            $window.localStorage.setItem(STORE_KEY, JSON.stringify(bookings));
        } catch (e) {}
    }

    // ---- Private: find a booking's index by id -------------
    function indexOf(bookings, id) {
        for (var i = 0; i < bookings.length; i++) {
            if (bookings[i].id === id) return i;
        }
        return -1;
    }

    // ---- Private: generate a unique booking ID -------------
    function generateId() {
        return 'BK-' +
               Math.floor(10000 + Math.random() * 90000) + '-' +
               Math.random().toString(36).substring(2, 6).toUpperCase();
    }

    // ================================================================
    // Public Methods
    // ================================================================

    /** Load and return all bookings from localStorage. */
    self.loadBookings = function () {
        return load();
    };

    /** Overwrite the entire booking list in localStorage. */
    self.saveBookings = function (bookings) {
        persist(bookings);
    };

    /**
     * Create a new booking.
     * Includes techReq so technical requirements survive page navigation.
     * @param {Object} data – { venue, date, slot, faculty, email, notes, building, category, techReq }
     * @returns {Object} The newly created booking record.
     */
    self.createBooking = function (data) {
        var bookings   = load();
        var newBooking = {
            id:        data.id || generateId(),
            venue:     data.venue     || '',
            date:      data.date      || '',
            slot:      data.slot      || '',
            faculty:   data.faculty   || '',
            email:     data.email     || '',
            notes:     data.notes     || '',
            building:  data.building  || '',
            category:  data.category  || '',
            status:    data.status    || 'pending',
            techReq:   data.techReq   || {},     // ← FIXED: was missing
            purpose:   data.notes     || '',     // alias for display
            createdAt: new Date().toISOString()
        };
        bookings.unshift(newBooking);
        persist(bookings);
        return newBooking;
    };

    /**
     * Update an existing booking by id.
     * @param {string} id      – Booking id.
     * @param {Object} updates – Key/value pairs to merge into the booking.
     * @returns {Object|null} Updated booking, or null if not found.
     */
    self.updateBooking = function (id, updates) {
        var bookings = load();
        var idx      = indexOf(bookings, id);
        if (idx === -1) return null;
        var updated = angular.extend({}, bookings[idx], updates);
        bookings[idx] = updated;
        persist(bookings);
        return updated;
    };

    /**
     * Delete a booking by id.
     * @param {string} id – Booking id to remove.
     * @returns {Array} The updated bookings list.
     */
    self.deleteBooking = function (id) {
        var bookings = load().filter(function (b) { return b.id !== id; });
        persist(bookings);
        return bookings;
    };

    /**
     * Approve a booking (sets status = 'approved').
     * @param {string} id – Booking id.
     */
    self.approveBooking = function (id) {
        return self.updateBooking(id, {
            status:     'approved',
            approvedAt: new Date().toISOString()
        });
    };

    /**
     * Reject a booking (sets status = 'rejected').
     * @param {string} id – Booking id.
     */
    self.rejectBooking = function (id) {
        return self.updateBooking(id, {
            status:     'rejected',
            rejectedAt: new Date().toISOString()
        });
    };

    /**
     * Return all bookings belonging to a given faculty email.
     * @param {string} email – Faculty email address.
     * @returns {Array}
     */
    self.getBookingsByFaculty = function (email) {
        if (!email) return load();
        var lc = email.toLowerCase();
        return load().filter(function (b) {
            return (b.email || '').toLowerCase() === lc;
        });
    };

    /**
     * Return all bookings with a given status.
     * @param {string} status – 'pending' | 'approved' | 'rejected'
     * @returns {Array}
     */
    self.getBookingsByStatus = function (status) {
        return load().filter(function (b) {
            return b.status === status;
        });
    };
}]);
