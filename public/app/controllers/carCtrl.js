/// <reference  path="../assets/angular.min.js"/>
/// <reference  path="../assets/angular-route.min.js"/>


angular.module('carControllers',[])
    .controller('carData',function(Userr,$scope){
        app = this;
      
        
       
    
        // Attaches the user responses to car object
        app.getAnswers= function(carData){
            $scope.showResult = false;
            Userr.getResult(this.carData).then(function(res){
                
                // Convert Object to  2D Array
                var result = Object.keys(res.data).map(function(key) {
                    return [Number(key), res.data[key]];
                });
                
                $scope.cars = new Array();
                
                for (i = 0; i < result.length; i++) {
                    $scope.cars.push("\tName: " + result[i][1].Name.toUpperCase() +  "\nMPG: " + result[i][1].MPG +  "\nNum. of Cylinders: " + result[i][1].cylinders 
                    +  "\nDisplacement:" + result[i][1].displacement +  "\nHorsepower:" + result[i][1].horsepower +  "\nOrigin:" + result[i][1].origin
                    +  "\nWeight:" + result[i][1].weight +  "\nYear:" + result[i][1].year.substring(0,4));
                }
                
                $scope.showResult = true;
               console.log("DONE");
               
                
            });

            
        };
    /// Make a Desicion Tree

        
    });
