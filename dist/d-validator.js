/* global angular */

angular.module("d-validator", []);
;/* global angular */

angular.module("d-validator").

    directive("dValidator", ["dValidatorFactory", "dValidatorRegExpFactory", "dUnderscoreToCamelCaseFilter", "dValidationWrapperFactory", function (dValidatorFactory, dValidatorRegExpFactory, dUnderscoreToCamelCaseFilter, dValidationWrapperFactory) {

    return {
        restrict: "A",
        require: '?ngModel',
        scope: {
            "definition": "=dValidator"
        },
        link: function (dScope, dElement, dAttrs, dCtrl) {
            if (!dCtrl) {
                throw new TypeError("d-validator depende de ng-model. ng-model no definido en el elemento #" + dAttrs.id);
            }

            var validations = [];
            /**
             * El array de validaciones puede venir en definition.validations || definition.regexValidations
             */
            if (angular.isArray(dScope.definition.validations)) {
                validations = validations.concat(dScope.definition.validations);
            }

            if (angular.isArray(dScope.definition.regexValidations)) {
                validations = validations.concat(dScope.definition.regexValidations);
            }

            function addValidation(validation) {
                /**
                 * @type {string} errorCode
                 */
                var errorCode = dUnderscoreToCamelCaseFilter(validation.errorCode);

                if (angular.isFunction(dCtrl.$validators[errorCode])) {
                    /**
                     * Si ya hay definida una function con el mismo errorCode.
                     * Se agregan a un Array de functions por medio de dValidationWrapper
                     */
                    if (!dCtrl.$validators[errorCode].multiple) {
                        /** 
                         * Si no es una instancia de dValidationWrapper, dValidationWrapperFactory se la crea.
                         * 
                         */
                        dCtrl.$validators[errorCode] = dValidationWrapperFactory(dCtrl.$validators[errorCode]);
                    }
                    /**
                     * Se agrega la function al Array de validaciones de dValidationWrapper.
                     */
                    dCtrl.$validators[errorCode].addValidation(validation);
                } else {
                    dCtrl.$validators[errorCode] = validation;
                }
            }

            angular.forEach(validations, function (validation, index) {
                if (angular.isFunction(validation)) {

                    if (validation.errorCode) {
                        /**
                         * Si tiene definido errorCode se concidera que validation es una instancia de dValidator
                         */
                        if (angular.isFunction(validation.watch)) {
                            /**
                             * 
                             */
                            dScope.$watch(validation.watch, dCtrl.$validate);
                        }
                        /**
                         *  Se agrega validation a dCtrl.$validators
                         */
                        addValidation(validation);
                    } else {
                        /**
                         *  Se agrega validation a dCtrl.$validators una instancia de dValidator con errorCode GENERIC_ERROR
                         */
                        addValidation(dValidatorFactory("GENERIC_ERROR", validation));
                    }
                } else {
                    /**
                     *  Se agrega validation a dCtrl.$validators una instancia de dValidator cuyo callback evalúa la expresión regular
                     * validation = {
                     *   "errorCode": "INVALID_PHONE_NUMBER",
                     *   "regex": "^([0-9]+-?)*$"
                     * };
                     * 
                     */
                    addValidation(dValidatorRegExpFactory(validation));
                }
            });
        }
    };
}]);
;/* global angular */

angular.module("d-validator").

    factory("dValidatorFactory", function () {
        /**
         * @param {string} errorCode
         * @param {function} callback
         * @param {function} watch
         * @returns {function} dValidator
         */
        function dValidatorFactory(errorCode, callback, watch) {
            /**
             * @param {string} value
             * @param {object} element
             * @param {function} controller  
             */
            function dValidator(value, element, controller) {

                if (!angular.isFunction(callback)) {
                    throw new TypeError("Expected callback to be a function");
                }

                return callback.apply(callback, arguments);
            }
            /**
             * @type {string}
             */
            dValidator.errorCode = errorCode;

            if (angular.isFunction(watch)) {
                dValidator.watch = watch;
            }

            return dValidator;
        }
        return dValidatorFactory;
    }).

    factory("dValidatorRegExpFactory", ["dValidatorFactory", function (dValidatorFactory) {
        /**
         * @param {function} validation
         * @returns {function} dValidatorFactory
         */
        function dValidatorRegExpFactory(validation) {

            if (!angular.isString(validation.errorCode)) {
                throw new TypeError("Expedted validation.errorCode to be a String");
            }

            if (!angular.isString(validation.regex)) {
                throw new TypeError("Expedted validation.regex to be a String");
            }
            /**
             * @type {RegExp}
             */
            var regExp = new RegExp(validation.regex);

            return dValidatorFactory(validation.errorCode, function dValidatorregExp(value, element, controller) {
                return regExp.test(value + "");
            });
        }
        return dValidatorRegExpFactory;
    }]).
    
    factory("dValidationWrapperFactory", function () {
        /**
         * dValidationWrapperFactory
         * @param {string} errorCode
         * @param {function} validation
         * @returns {function} 
         */
        function dValidationWrapperFactory(errorCode, validation) {
            /**
             * @type {array}
             */
            var validations = [];
            /**
             * @returns {boolean}
             */
            function dValidationWrapper() {
                /**
                 * @index {number}
                 */
                var index;
                for(index = 0; index < validations.length; index++) {
                    if (!validations[index].apply(validations[index], arguments)) {
                        return false;
                    }
                }
                return true;
            }
            /**
             * @return {void}
             */
            dValidationWrapper.addValidation = function (validation) {
                validations.push(validation);
            };
            
            if (angular.isFunction(validation)) {
                validations.push(validation);
            }
            /**
             * @type {boolean}
             */
            dValidationWrapper.multiple = true;
            /**
             * @type {string}
             */
            dValidationWrapper.erroCode = errorCode;
            
            return dValidationWrapper;
        }
        
        return dValidationWrapperFactory;
    });
;/* global angular */

angular.module("d-validator").

    filter("dUnderscoreToCamelCase", function dUnderscoreToCamelCase() {
        /**
         * @param {string} input
         * @return {string}
         */
        function dUnderscoreToCamelCaseFilter(input) {

            if (!angular.isString(input)) {
                throw new TypeError("expected input to be a String.");
            }

            return input.toLowerCase().replace(/(\_[a-zA-Z])/g, function($1) {
                return $1.toUpperCase().replace('_','');
            });
        }
        return dUnderscoreToCamelCaseFilter;
    }).

    filter("dCamelCaseToUnderscore", function dCamelCaseToUnderscore() {
        /**
         * @param {string} input
         * @return {string}
         */
        function dCamelCaseToUnderscoreFilter(input) {

            if (!angular.isString(input)) {
                throw new TypeError("expected input to be a String.");
            }

            return input.replace(/([A-Z])/g, function($1) {
                return "_" + $1;
            }).toUpperCase();
        }
        return dCamelCaseToUnderscoreFilter;
    });
