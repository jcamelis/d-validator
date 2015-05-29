/* global angular */

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
