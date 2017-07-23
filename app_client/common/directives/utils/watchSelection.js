(function () {
    angular
        .module('meanApp')
        .directive('watchSelection', watchSelection);

    function watchSelection() {
        return function(scope, elem) {
            elem.on('mouseup', function() {
                scope.startPosition = elem[0].selectionStart;
                scope.endPosition = elem[0].selectionEnd;
                console.log("start at: " + scope.startPosition + " end at: " + scope.endPosition);
                scope.$apply();
            });
        };
    };
})();

