/// <reference  path="../assets/angular.min.js"/>
/// <reference  path="../assets/angular-route.min.js"/>

angular.module('carServices',[])

.service('Car',function($http){
    // Set of Services
    carService = {};

    //Get the Users Responses
    carService.calculate = function(Car){
        return $http.post('/api/calculateResult',Car);
    };


});
