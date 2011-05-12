(function someObject() {
    
    var inherit = function (C, P) {
        var F = function () {};
        F.prototype = P.prototype;
        C.prototype = new F();
        C.uber = P.prototype;
        C.prototype.constructor = C;
    }
    
    
    var inherit = (function () {
        var F = function () {};
        inherit = function (C, P) {
            F.prototype = P.prototype;
            C.prototype = new F();
            C.uber = P.prototype;
            C.prototype.constructor = C;
        };
    }());
    
    var inherit = (function () {
        var Template = function () {}; // use descriptive variable names, we'll let a minifier rename for production
        inherit = function (prototype, target) { //instead of passing in a Parent function, just past in a prototype since that's we actually need
            Template.prototype = prototype;
            target.prototype = new Template();
            target.uber = prototype;
            target.prototype.constructor = target;
            return target; //return the Constructor so we can pass in an anonymous function and assign it to a variable for example
        }
    }());
    
    if (!Object.create) {
        Object.create = (function () {
            var F = function () {};
            return function (prototype) {
                var C = {};
                F.prototype = prototype
                C.prototype = new F();
                C.uber = prototype;
                //C.prototype.constructor = C;
                return C;
            }
        }());
    }
}());


function someFunction() {} //function declarations, automagically gets hoisted for evaluation like var statements.

var someOtherFunction = function () {}; //function expressions are evaluted as they are encountered

//function expressions can be called following their definition
var someFunctionResult = function () { return true; }();

(function () {}); // function expressions when not assigned to a variable or being passed in as a parameter must enclosed with parends

(function () {}());// not very useful unless called immediately since it's not being bound to any accessible identifier.
// or
(function () {})();// either forms are valid; I prefer the aesthetics of the first form

//function expressions without a name are commonly called anonymous functions, when they are called following definition they are called self invoking anonymous functions

(function optional(parameter) { //naming function expressions can be useful if your debugger supports them.
    
})(value);





