/* =========================================================
   FACULTY VENUE BOOKING PORTAL — COMBINED APP
   VALIDATIONS (validations.js)

   Source: Merged from Sarvesh + Vignesh Code

   Directives:
     matchPassword  – custom validator that checks two password fields match
     ngConform      – confirmation dialog wrapper for click actions
   ========================================================= */

// Custom directive for matching passwords (from Vignesh Code)
app.directive('matchPassword', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attributes, ngModel) {
            ngModel.$validators.matchPassword = function (modelValue) {
                return modelValue === scope.$eval(attributes.matchPassword);
            };

            scope.$watch(attributes.matchPassword, function () {
                ngModel.$validate();
            });
        }
    };
});

// Custom directive for confirmation dialogs on click actions (from Vignesh Code)
app.directive('ngConform', NgConform);

function NgConform() {
    var ddo = {
        restrict: 'A',
        link: function (scope, element, attributes) {
            element.bind('click', function (event) {
                var message = attributes.confirmMessage || 'Are you sure you want to perform this action?';
                if (window.confirm(message)) {
                    scope.$apply(function () {
                        scope.$eval(attributes.ngConform);
                    });
                } else {
                    event.preventDefault();
                    event.stopPropagation();
                }
            });
        }
    };
    return ddo;
}
