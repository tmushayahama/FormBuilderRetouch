requirejs.config({
    waitSeconds: 0,
    paths: { 
        'jquery': '../bower_components/jquery/dist/jquery',
        'angular': '../bower_components/angular/angular',
        'bootstrap': '../bower_components/bootstrap/dist/js/bootstrap',
        'angular-bootstrap': '../bower_components/angular-bootstrap/ui-bootstrap-tpls',
        'angular-ui-router': '../bower_components/angular-ui-router/release/angular-ui-router',
        'angular-resource': '../bower_components/angular-resource/angular-resource',
        'satellizer': '../bower_components/satellizer/satellizer',
        'oc-lazy-load': '../bower_components/ocLazyLoad/dist/ocLazyLoad',
        'angular-cookies': '../bower_components/angular-cookies/angular-cookies',
        'angular-animate': '../bower_components/angular-animate/angular-animate',
        //'angular-context-menu': '../bower_components/ng-context-menu/dist/ng-context-menu',
       
         'dom-ready': '../bower_components/domready/ready',
        //'modules-includes': 'includes'

        "angular-local-storage": '../bower_components/angular-local-storage/dist/angular-local-storage',

        'xeditable': '../bower_components/angular-xeditable/dist/js/xeditable',
        'hammerjs': '../bower_components/hammerjs/hammer',
        'angular-gestures': '../bower_components/angular-gestures/gestures',
        'rzslider': '../bower_components/angularjs-slider/dist/rzslider',
		
		//Quickform
		 'qf-components': '../qf/qf-components',
		 'qf-builder': '../qf/qf-builder',
    },
    shim: {      
        'angular': { 'exports': 'angular', deps: ['jquery'] },
        'jquery': { 'exports': 'jquery' },
        'angular-ui-router': { deps: ['angular'] },
        'angular-resource': { deps: ['angular'] },
        'angular-animate': { deps: ['angular'] },
        'angular-local-storage': { deps: ['angular'] },
        'angular-cookies': { deps: ['angular'] },
        //'angular-context-menu': { deps: ['angular'] },
        'oc-lazy-load': { deps: ['angular'] },
        'satellizer': { deps: ['angular'] },
        'bootstrap': { 'exports': 'bootstrap', deps: ['jquery'] },
        'angular-bootstrap': { deps: ['angular'] },
        

        'xeditable': { deps: ['angular'] },
        //'moment': { exports: 'moment' },
        'hammerjs': { deps: ['angular'] },
        'angular-gestures': { deps: ['angular', 'hammerjs'] },
        'rzslider': { deps: ['angular', 'jquery'] },
		'qf-components': {deps: ['angular']},
		'qf-builder': {deps: ['angular']},
    },
    priority: [
     'jquery',
     'bootstrap',
     'angular',
    ],
});


requirejs([
 'angular',
 'application'
], function (angular, app) {
    'use strict';
    console.log(app);
    var $html = angular.element(document.getElementsByTagName('html')[0]);
    angular.element().ready(function () {
        // bootstrap the app manually
        angular.bootstrap(document, ['qf-retouch']);
        //resumeBootstrap();
    });
});

