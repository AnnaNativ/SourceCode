(function () {
    angular
        .module('meanApp')
        .directive('focusMe', focusMe);

    function focusMe() {
        return {
            scope: { trigger: '@focusMe' },
            link: function (scope, element) {
                scope.$watch('trigger', function () {
                    element[0].focus();
                });
            }
        }
    };

})();