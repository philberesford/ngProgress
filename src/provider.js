// Here is the business logic that we will use for the progress
angular.module('ngProgress.provider', ['ngProgress.directive'])
    .provider('ngProgress', function () {
        'use strict';
        //Default values for provider
        var DEFAULT_INCREMENT = 0.15;

        this.autoStyle = true;
        this.count = 0;
        this.height = '2px';
        this.color = 'firebrick';
        this.increment = DEFAULT_INCREMENT;

        this.$get = ['$document',
            '$window',
            '$compile',
            '$rootScope',
            '$timeout', function ($document, $window, $compile, $rootScope, $timeout) {
            var count = this.count,
                height = this.height,
                color = this.color,
                increment = this.increment,
                $scope = $rootScope,
                parent = $document.find('body')[0];

            // Compile the directive
            var progressbarEl = $compile('<ng-progress></ng-progress>')($scope);
            // Add the element to body
            parent.appendChild(progressbarEl[0]);
            // Set the initial height
            $scope.count = count;
            // If height or color isn't undefined, set the height, background-color and color.
            if (height !== undefined) {
                progressbarEl.eq(0).children().css('height', height);
            }
            if (color !== undefined) {
                progressbarEl.eq(0).children().css('background-color', color);
                progressbarEl.eq(0).children().css('color', color);
            }
            // The ID for the interval controlling start()
            var intervalCounterId = 0;
            var animation;
            return {
                // Starts the animation and adds between 0 - 5 percent to loading
                // each 400 milliseconds. Should always be finished with progressbar.complete()
                // to hide it
                start: function () {
                    // TODO Use requestAnimationFrame instead of setInterval
                    // https://developer.mozilla.org/en-US/docs/Web/API/window.requestAnimationFrame
                    this.show();
                    var self = this;
                    clearInterval(intervalCounterId);
                    intervalCounterId = setInterval(function () {
                        if (isNaN(count)) {
                            clearInterval(intervalCounterId);
                            count = 0;
                            self.hide();
                        } else {
                            var remaining = 100 - count;
                            count = count + (increment * Math.pow(1 - Math.sqrt(remaining), 2));
                            self.updateCount(count);
                        }
                    }, 200);
                },
                // Returns the increment used by the progress bar
                getIncrement: function(){
                    return increment;
                },
                // Sets the increment of the progress bar
                setIncrement: function(new_increment){
                    increment = new_increment;
                },
                // Resets the increment to the default value
                resetIncrement: function () {
                   increment = DEFAULT_INCREMENT;
                },
                updateCount: function (new_count) {
                    $scope.count = new_count;
                    if(!$scope.$$phase) {
                        $scope.$apply();
                    }
                },
                // Sets the height of the progressbar. Use any valid CSS value
                // Eg '10px', '1em' or '1%'
                height: function (new_height) {
                    if (new_height !== undefined) {
                        height = new_height;
                        $scope.height = height;
                        if(!$scope.$$phase) {
                            $scope.$apply();
                        }
                    }
                    return height;
                },
                // Sets the color of the progressbar and it's shadow. Use any valid HTML
                // color
                color: function (new_color) {
                    if (new_color !== undefined) {
                        color = new_color;
                        $scope.color = color;
                        if(!$scope.$$phase) {
                            $scope.$apply();
                        }
                    }
                    return color;
                },
                hide: function () {
                    progressbarEl.children().css('opacity', '0');
                    var self = this;
                    self.animate(function () {
                        progressbarEl.children().css('width', '0%');
                        self.animate(function () {
                            self.show();
                        }, 500);
                    }, 500);
                },
                show: function () {
                    var self = this;
                    self.animate(function () {
                        progressbarEl.children().css('opacity', '1');
                    }, 100);
                },
                // Cancel any prior animations before running new ones.
                // Multiple simultaneous animations just look weird.
                animate: function(fn, time) {
                    if(animation) { $timeout.cancel(animation); }
                    animation = $timeout(fn, time);
                },
                // Returns on how many percent the progressbar is at. Should'nt be needed
                status: function () {
                    return count;
                },
                // Stops the progressbar at it's current location
                stop: function () {
                    clearInterval(intervalCounterId);
                },
                // Set's the progressbar percentage. Use a number between 0 - 100. 
                // If 100 is provided, complete will be called.
                set: function (new_count) {
                    this.show();
                    this.updateCount(new_count);
                    count = new_count;
                    clearInterval(intervalCounterId);
                    return count;
                },
                css: function (args) {
                    return progressbarEl.children().css(args);
                },
                // Resets the progressbar to percetage 0 and therefore will be hided after
                // it's rollbacked
                reset: function () {
                    clearInterval(intervalCounterId);
                    count = 0;
                    this.updateCount(count);
                    return 0;
                },
                // Jumps to 100% progress and fades away progressbar.
                complete: function () {
                    count = 100;
                    this.updateCount(count);
                    var self = this;
                    clearInterval(intervalCounterId);
                    $timeout(function () {
                        self.hide();
                        $timeout(function () {
                            count = 0;
                            self.updateCount(count);
                        }, 500);
                    }, 1000);
                    return count;
                },
                //set the parent of the directive, sometimes body is not sufficient
                setParent: function(newParent) {
                    if(newParent === null || newParent === undefined) {
                        throw new Error('Provide a valid parent of type HTMLElement');
                    }
                    
                    if(parent !== null && parent !== undefined) {
                        parent.removeChild(progressbarEl[0]);
                    }   

                    parent = newParent;
                    parent.appendChild(progressbarEl[0]);
                },
                getDomElement: function () {
                    return progressbarEl;
                }
            };
        }];
        
        this.setColor = function (color) {
            if (color !== undefined) {
                this.color = color;
            }
            
            return this.color;
        };

        this.setHeight = function (height) {
            if (height !== undefined) {
                this.height = height;
            }
            
            return this.height;
        };
    });