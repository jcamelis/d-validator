/* global angular */

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
