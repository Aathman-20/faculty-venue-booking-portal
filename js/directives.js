/* =========================================================
   FACULTY VENUE BOOKING PORTAL - DIRECTIVES (directives.js)
   Custom AngularJS Directives for HOD Dashboard, Register Page,
   and Booking Confirmation Page.
   ========================================================= */

/**
 * 1. statusBadge Directive
 * Usage: <status-badge status="bk.status"></status-badge>
 * Renders a color-coded, animated badge for booking status.
 */
app.directive('statusBadge', function () {
    return {
        restrict: 'E',
        scope: {
            status: '='
        },
        template: 
            '<span class="approval-status" ng-class="statusClass">' +
            '  <span class="status-dot"></span> {{statusLabel}}' +
            '</span>',
        link: function (scope) {
            scope.$watch('status', function (newStatus) {
                var st = (newStatus || 'pending').toLowerCase();
                if (st === 'approved') {
                    scope.statusClass = 'approved';
                    scope.statusLabel = '✓ Approved';
                } else if (st === 'rejected') {
                    scope.statusClass = 'rejected';
                    scope.statusLabel = '✗ Rejected';
                } else {
                    scope.statusClass = 'pending';
                    scope.statusLabel = '⏳ Pending';
                }
            });
        }
    };
});

/**
 * 2. requestCard Directive
 * Usage: <request-card booking="bk" on-approve="approve(bk)" on-reject="reject(bk)" on-edit="edit(bk)" on-delete="delete(bk)" on-view="view(bk)"></request-card>
 * Renders an interactive card for each booking request in the HOD request panel,
 * supporting Add, Update (Edit), Delete, Approve, and Reject actions.
 */
app.directive('requestCard', function () {
    return {
        restrict: 'E',
        scope: {
            booking: '=',
            onApprove: '&',
            onReject: '&',
            onEdit: '&',
            onDelete: '&',
            onView: '&'
        },
        template:
            '<div class="upcoming-item request-card-item" ' +
            '     style="border-left: 4px solid {{getBorderColor()}};">' +
            '    <div class="card-left-info">' +
            '        <div class="venue-header-row">' +
            '            <h4>{{booking.venue}}</h4>' +
            '            <span class="building-tag">{{booking.building || "Main Building"}}</span>' +
            '        </div>' +
            '        <p class="faculty-subinfo">' +
            '            <span class="icon">👤</span> <strong>{{booking.faculty}}</strong> &bull; ' +
            '            <span>{{booking.department}}</span> &bull; ' +
            '            <code class="ref-code">Ref: {{booking.id}}</code>' +
            '        </p>' +
            '        <p class="request-notes" ng-if="booking.notes">' +
            '            📝 <em>{{booking.notes}}</em>' +
            '        </p>' +
            '    </div>' +
            '    <div class="time-badge">' +
            '        📅 {{booking.date}} &bull; ⏰ {{booking.slot}}' +
            '    </div>' +
            '    <div class="action-column">' +
            '        <status-badge status="booking.status"></status-badge>' +
            '        <div class="button-row mt-2">' +
            '            <button class="btn btn-outline btn-sm" title="View details" ng-click="onView({booking: booking})">👁️ View</button>' +
            '            <button class="btn btn-outline btn-sm btn-edit" title="Update Request" ng-click="onEdit({booking: booking})">✏️ Edit</button>' +
            '            <button class="btn btn-outline btn-sm btn-delete" title="Delete Request" ng-click="onDelete({booking: booking})">🗑️ Delete</button>' +
            '            <button class="btn btn-outline btn-sm btn-reject" title="Reject Request" ng-if="booking.status === \'pending\'" ng-click="onReject({booking: booking})">✗ Reject</button>' +
            '            <button class="btn btn-dark btn-sm btn-approve" title="Approve Request" ng-if="booking.status === \'pending\'" ng-click="onApprove({booking: booking})">✓ Approve</button>' +
            '        </div>' +
            '    </div>' +
            '</div>',
        link: function (scope) {
            scope.getBorderColor = function () {
                var st = (scope.booking && scope.booking.status) ? scope.booking.status.toLowerCase() : 'pending';
                if (st === 'approved') return '#4caf50';
                if (st === 'rejected') return '#f44336';
                return '#ff9800';
            };
        }
    };
});

/**
 * 3. confirmationCard Directive
 * Usage: <confirmation-card icon="🏛️" label="Location" value="KS Auditorium" badge="Verified"></confirmation-card>
 * Custom directive for detail items on the Booking Confirmation Page.
 */
app.directive('confirmationCard', function () {
    return {
        restrict: 'E',
        scope: {
            icon: '@',
            label: '@',
            value: '@',
            badge: '@'
        },
        template:
            '<div class="detail-card animated-card">' +
            '    <div class="card-icon-box">{{icon}}</div>' +
            '    <div class="card-content">' +
            '        <small>{{label}}</small>' +
            '        <h4>{{value}}</h4>' +
            '        <span class="status-badge" ng-if="badge">{{badge}}</span>' +
            '    </div>' +
            '</div>'
    };
});

/**
 * 4. tceEmailValidator Directive
 * Custom directive for register.html to validate institutional TCE email addresses.
 */
app.directive('tceEmailValidator', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            ngModel.$validators.tceEmail = function (modelValue) {
                if (!modelValue) return true;
                return /^[a-zA-Z0-9._%+-]+@tce\.edu$/.test(modelValue);
            };
        }
    };
});

/**
 * 5. toastNotification Directive
 * Animated toast feedback popup using ngAnimate properties.
 */
app.directive('toastNotification', function () {
    return {
        restrict: 'E',
        scope: {
            message: '=',
            type: '='
        },
        template:
            '<div class="toast-banner" ng-class="type" ng-if="message">' +
            '    <span class="toast-icon">{{getIcon()}}</span>' +
            '    <span class="toast-text">{{message}}</span>' +
            '</div>',
        link: function (scope) {
            scope.getIcon = function () {
                if (scope.type === 'success') return '✅';
                if (scope.type === 'error') return '⚠️';
                if (scope.type === 'info') return 'ℹ️';
                return '🔔';
            };
        }
    };
});
