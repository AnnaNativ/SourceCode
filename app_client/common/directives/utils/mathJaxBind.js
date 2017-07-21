(function () {
    angular
        .module('meanApp')
        .directive('mathJaxBind', mathJaxBind);

    function mathJaxBind() {
        var refresh = function(element) {
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, element]);
        };
        return {
            link: function(scope, element, attrs) {
            scope.$watch(attrs.mathJaxBind, function(newValue, oldValue) {
                element.text(newValue);
                refresh(element[0]);
            });
            }
        };
    };
})();