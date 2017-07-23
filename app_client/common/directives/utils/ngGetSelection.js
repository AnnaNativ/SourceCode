(function () {
    angular
        .module('meanApp')
        .directive('ngGetSelection', ngGetSelection);

    function ngGetSelection($timeout) {
        var text = '';
    
        function getSelectedText() {
            var text = "";
            if (typeof window.getSelection != "undefined") {
                text = window.getSelection().toString();
            } else if (typeof document.selection != "undefined" && document.selection.type == "Text") {
                text = document.selection.createRange().text;
            }
            return text;
        }
    
        return {
            restrict: 'A',
            scope: {
                ngGetSelection: '='
            },
            link: function (scope, element) {
                $timeout(function getSelection() {
                    var newText = getSelectedText();
    
                    if (text != newText) {
                        text = newText;
                        element.val(newText);
                        vm.ngGetSelection = newText;
                    }
    
                    $timeout(getSelection, 50);
                }, 50);
            }
        };
    };
})();