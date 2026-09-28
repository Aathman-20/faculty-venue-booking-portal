/* =========================================================
   FACULTY VENUE BOOKING PORTAL - FILTERS (filters.js)
   Custom AngularJS filters used across all pages.

   Filters:
     venueSearch(building, category, search) – filters venue cards
     bookingStatus(status)                   – filters bookings by status
     buildingFilter(building)               – filters venues by building
     dateFilter(date)                        – filters bookings by date string
     facultyFilter(faculty)                 – filters bookings by faculty name/email
   ========================================================= */

// -------------------------------------------------------
// venueSearch
// Filters a venue list by building, category, and free-text.
// -------------------------------------------------------
app.filter('venueSearch', function () {
    return function (venues, building, category, search) {
        if (!venues) return [];
        return venues.filter(function (v) {
            var buildingMatch = !building || v.building === building;
            var categoryMatch = !category || category === 'All' || v.category === category;
            var searchMatch   = !search   ||
                v.name.toLowerCase().indexOf(search.toLowerCase())     !== -1 ||
                v.category.toLowerCase().indexOf(search.toLowerCase()) !== -1;
            return buildingMatch && categoryMatch && searchMatch;
        });
    };
});

// -------------------------------------------------------
// bookingStatus
// Filters a bookings array by an exact status string.
// Pass 'all' (or omit) to return the full list unchanged.
// Used in dashboards with a status select (ng-options).
// -------------------------------------------------------
app.filter('bookingStatus', function () {
    return function (bookings, status) {
        if (!bookings) return [];
        if (!status || status === 'all') return bookings;
        return bookings.filter(function (b) {
            return b.status === status;
        });
    };
});

// -------------------------------------------------------
// buildingFilter
// Filters a venues/bookings array by building name.
// Pass 'All' or empty to return the full list.
// -------------------------------------------------------
app.filter('buildingFilter', function () {
    return function (items, building) {
        if (!items) return [];
        if (!building || building === 'All') return items;
        return items.filter(function (item) {
            return item.building === building;
        });
    };
});

// -------------------------------------------------------
// dateFilter
// Filters a bookings array where the date string contains
// the query substring (case-insensitive).
// Pass empty string to return the full list.
// -------------------------------------------------------
app.filter('dateFilter', function () {
    return function (bookings, date) {
        if (!bookings) return [];
        if (!date || date.trim() === '') return bookings;
        var q = date.toLowerCase();
        return bookings.filter(function (b) {
            return b.date && b.date.toLowerCase().indexOf(q) !== -1;
        });
    };
});

// -------------------------------------------------------
// facultyFilter
// Filters a bookings array by faculty name or email
// (case-insensitive substring match).
// Pass empty string to return the full list.
// -------------------------------------------------------
app.filter('facultyFilter', function () {
    return function (bookings, faculty) {
        if (!bookings) return [];
        if (!faculty || faculty.trim() === '') return bookings;
        var q = faculty.toLowerCase();
        return bookings.filter(function (b) {
            return (b.faculty && b.faculty.toLowerCase().indexOf(q) !== -1) ||
                   (b.email   && b.email.toLowerCase().indexOf(q)   !== -1);
        });
    };
});
