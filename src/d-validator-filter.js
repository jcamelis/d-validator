/* global angular */

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
