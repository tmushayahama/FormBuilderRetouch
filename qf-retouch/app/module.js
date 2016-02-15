define(['angular',
 'angular-ui-router'

], function (angular) {

    "use strict";

    var module = angular.module('qfretouch.app', ['ui.router']);

    module.config(['$stateProvider',
     function ($stateProvider) {
         $stateProvider
                        .state('app', {
                            url: '/app',
                            views: {
                                "root": {
                                    templateUrl: 'qf-retouch/app/views/app.html',
                                    controller: 'AppCtrl as appCtrl',
                                    resolve: {
                                        load: function ($ocLazyLoad) {
                                            return $ocLazyLoad.load({
                                                serie: true,
                                                name: 'qf-retouch.app',
                                                files: [
                                                    'qf-retouch/modules/folder/services/FolderItem.js',
                                                    'qf-retouch/modules/document/services/DocumentItem.js',
                                                    'qf-retouch/common/services/ConfigContent.js',
                                                    'qf-retouch/modules/folder/services/FolderManager.js',
                                                    'qf-retouch/app/controllers/AppCtrl.js',
                                                    'qf-retouch/modules/folder/controllers/modals/CreateFolderModalCtrl.js',
                                                    'qf-retouch/modules/folder/controllers/modals/EditFolderModalCtrl.js',
                                                    'qf-retouch/modules/folder/controllers/modals/MoveFolderModalCtrl.js',
                                                    'qf-retouch/modules/folder/controllers/modals/DeleteFolderModalCtrl.js',
                                                    'qf-retouch/modules/folder/controllers/modals/FolderLinkModalCtrl.js',
                                                    'qf-retouch/modules/folder/controllers/modals/UploadDocumentModalCtrl.js',
                                                    'qf-retouch/modules/folder/controllers/modals/FolderDetailsModalCtrl.js',
                                                    'qf-retouch/modules/document/controllers/modals/DocumentSearchModalCtrl.js',
                                                ]
                                            });
                                        }
                                    }
                                }
                            }
                        })
     }
    ]);
    return module;
});
