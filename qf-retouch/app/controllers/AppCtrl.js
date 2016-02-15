angular.module("qf-retouch.app").controller('AppCtrl',
    [
        'config',
        '$scope',
        '$q',
        '$rootScope',
        '$state',
        '$stateParams',
        '$log',
        'localStorageService',
        '$timeout',
        '$translate',
        '$cookies',
        '$uibModal',
        'qfretouchAuth',
        'FolderItem',
        'DocumentItem',
        'ConfigContent',
        'FolderManager',
        'FileUploader',
function (
    config,
    $scope,
    $q,
    $rootScope,
    $state,
    $stateParams,
    $log,
    localStorageService,
    $timeout,
    $translate,
    $cookies,
    $uibModal,
    qfretouchAuth,
    FolderItem,
    DocumentItem,
    ConfigContent,
    FolderManager,
    FileUploader
    ) {
    var vm = this;

    //User
    vm.qfretouchAuth = new qfretouchAuth();
    vm.userInfo;

    //Folder
    var folderId = $state.params.folderId;  
    vm.configContent = new ConfigContent();
    vm.currentFolder;
    vm.folderManagers = [
     {
         Content: new FolderManager(),//Main 
     },
     {
         Content: new FolderManager(),//Search Results
     },
     {
         Content: new FolderManager(),//Workflow
     }
    ];
    vm.mainTabIndex = 0;
    vm.searchTabIndex = 1;
    vm.workflowTabIndex = 2;


    vm.orderProp = ['model.Type', 'model.Name'];
    vm.query = '';

    //Search
    vm.searchModel;
    vm.searchHistory = [];
    vm.searchOperators = [
        { "Value": "Equal", "Text": "=" },
        { "Value": "Between", "Text": "<>" },
        { "Value": "GreaterThan", "Text": "<" },
    ];
    vm.searchSelectedCategories = [];
    vm.searchSelectedFolders = [];
    vm.searchSelectedFileTypes = [];   

 
    vm.viewTemplate = $cookies.viewTemplate || 'main-table.html'; 
    vm.selectedAllFileTypes = true;
  
    /**
   * Logs the user out and clears the local storage
   * @param [object] user - The current logged in user
   */
    vm.logout = function (user) {
        vm.qf-retouchAuth.logout()
        .then(function (data) {
            localStorageService.remove("userInfo");
            $rootScope.displayName = '';
            $rootScope.userName = '';
            $state.go("login");
        })
        .catch(function (err) {
            vm.errors.other = err.message;
        });
    };

    /**
     * Gets the user info from the localStorage, either from cookies, localstorage or session storage.
     * According the localStorageService setup
     */
    vm.initUserInfo = function () {
        vm.userInfo = JSON.parse(localStorageService.get("userInfo"));
    };


    vm.initSearchModel = function () {
        vm.searchModel = {
            FullText: '',
            Categories: [],
            Folders: [],
        };
    }

    vm.hoverItemIn = function () {
        this.hoverAction = true;
    };

    vm.hoverItemOut = function () {
        this.hoverAction = false;
    };

    vm.setTemplate = function (name) {
        vm.viewTemplate = $cookies.viewTemplate = name;
    };

    vm.changeLanguage = function (locale) {
        if (locale) {
            return $translate.use($cookies.language = locale);
        }
        $translate.use($cookies.language || config.defaultLang);
    };  

    /**
     * Initializes the Advanced search side bar accordions to have 100% height
     */
    vm.initSidebarLayout = function () {
        var h2 = $('#dr-advanced-search-nav').height();
        $("#dr-advanced-search-nav .dr-search-sidebar-collapse-body").height(h2 - 170);

        $(window).resize(function () {
            var h2 = $('#dr-advanced-search-nav').height();
            $("#dr-advanced-search-nav .dr-search-sidebar-collapse-body").height(h2 - 170);
        });
    };

    /**
     * Gets the last n characters of a word (used in breadcrumbs of folder path) to add the 
     * ellipsis ... to the beginning of the trimmed word.
     * @param [string] text - string to be trimmed
     * @param [integer] len - the length of the reslting trimmed string exluding the '...'
     */
    vm.trimLeft = function (text, len) {
        if (text.length > len) {
            return "..." + text.substring(len - 20)
        }
        return text;
    };

    /**
     * Opens the tab where the tab has both accordion and tab functionality. 
     * @param [string] tabTarget - the id of the tab to be opened
     */
    $rootScope.openTab = function (tabTarget) {
        //var tabHref = $($event.target).data('dr-tab-target');
        $("#dr-advanced-search-detail .tab-pane").removeClass("active");
        $(tabTarget).addClass("active");
    };

     /**
     * To trigger the open tab button. It fail to trigger using the bootstrap javascrip
     * if there are more than 2 click events 
     * @param [object] alias - the trigger button with a tab open functionality
     * @param [string] tabTarget - the id of the tab to be opened
     */
    $rootScope.openTabAlias = function (alias, tabTarget) {
        //var tabref= $($event.currentTarget).data('dr-alias-target');
        angular.element(alias).trigger('click');
        vm.openTab(tabTarget)
    };

    /**
     * Converts the qf-retouch Type to HTML input type on an 'input' element i.e
     * <input type='text'/>
     * @param [string] qf-retouchType - The qf-retouchType input type
     */
    $rootScope.getHtmlInputType = function (qfretouchType) {
        switch (qf-retouchType) {
            case "Date":
                return "date";
            case "Number":
                return "number";
            default: //including String
                return "text";
        }
    };
    
    vm.treeOptions = {
        nodeChildren: "children",
        dirSelectable: true,
        isLeaf: function (node) {
            return !node.FolderItem.model.HasChildren;
        },
        injectClasses: {
            ul: "a1",
            li: "a2",
            liSelected: "a7",
            iExpanded: "a3",
            iCollapsed: "a4",
            iLeaf: "a5",
            label: "a6",
            labelSelected: "a8"
        }
    }

    vm.toggleTree = function (node, expanded, $parentNode, $index, $first, $middle, $last, $odd, $even) {
        var parent = $parentNode ? ("child of: " + $parentNode.Name) : "root node";
        var location = $first ? "first" : ($last ? "last" : ("middle node at index " + $index));
        var oddEven = $odd ? "odd" : "even";
        if (expanded) {
            vm.folderManagers[vm.mainTabIndex].Content.folderExpand(node.FolderItem);
        }
    };

    vm.selectTreeNode = function (node, selected, $parentNode, $index, $first, $middle, $last, $odd, $even) {
        var parent = $parentNode ? ("child of: " + $parentNode.Name) : "root node";
        var location = $first ? "first" : ($last ? "last" : ("middle node at index " + $index));
        var oddEven = $odd ? "odd" : "even";

        vm.openFolder(node.FolderItem);
        vm.selectFileTab(vm.mainTabIndex);
    };

    /**
     * Substites the use of a tree in UI. Used in smaller devices to navigate one level at a time. But
     * it uses the tree structure only this time just showing children of a parent
     * @param [object] node the clicked node of the tree
     */
    vm.selectFolderRow = function (node) {
        vm.folderManagers[vm.mainTabIndex].Content.folderExpand(node);
        vm.openFolder(node);
        vm.selectFileTab(vm.mainTabIndex);
    }  

    vm.addFileTab = function (summary) {
        var fileTabsLength = vm.fileTabs.length;
        vm.fileTabs.push(
            {
                Id: fileTabsLength,
                Name: "Search Results " + fileTabsLength,
                Summary: summary
            });
        vm.folderManagers.push(
            {
                Content: new FolderManager(),
            });
        vm.selectFileTab(fileTabsLength);
        console.log("File Navigators\n", vm.folderManagers)
    }


    vm.deleteFileTab = function (index) {
        vm.fileTabs.splice(index, 1); //remove the object from the array based on index
    }


    vm.folderExpand = function (id, path) {
        var deferred = $q.defer();
        var node = {};
        var model = {
            Id: id,
            Path: path
        }
        node.model = model;
        vm.selectFileTab(vm.mainTabIndex);
        return vm.folderManagers[vm.mainTabIndex].Content.folderExpand(node);
    };

    vm.folderUp = function () {
        var pathInfo = vm.currentFolder.model.PathInfo.slice(0, -1);

        vm.folderManagers[vm.mainTabIndex].Content.folderExpand(vm.currentFolder.Parent.FolderItem);
        vm.openFolder(vm.currentFolder.Parent.FolderItem);
        vm.selectFileTab(vm.mainTabIndex);
    };

    vm.openFolder = function (item) {
        vm.folderManagers[vm.mainTabIndex].Content.folderPath = item.model.PathInfo;
        vm.currentFolder = item;
        $state.go('app.folder', { folderId: item.model.Id }, { reload: 'app.folder' });
    };

    vm.openWorkflow = function () {
        vm.selectFileTab(vm.mainTabIndex);
        vm.folderManagers[vm.workflowTabIndex].Content.folderPath;
        $state.go('app.folder', { folderId: 'workflow' }, { reload: 'app.folder' });
    };

    vm.nextDocument = function (item, index) {
        vm.folderManagers[index].Content.filePreviewNextClick(item);
    }

    $scope.$watch(angular.bind(this, function () {
        return this.searchModel.FullText;
    }), function (newVal) {
        console.log('search model ' + newVal);
        if (newVal.trim().length > 0) {
            vm.instantSearch();
        }
    });

    vm.instantSearch = function () {
        var searchCriteria = vm.searchModel;
        vm.folderManagers[vm.searchTabIndex].Content.instantSearch(searchCriteria).then(function (data) {
            vm.folderManagers[vm.searchTabIndex].instantSearchDocumentList;
        });
    }

    vm.textSearch = function () {
        var searchCriteria = vm.searchModel;
        vm.folderManagers[vm.searchTabIndex].Content.search(searchCriteria).then(function (data) {
            vm.documentsResultViewIndex = vm.searchTabIndex;
            //vm.initSearchModel();
            vm.searchHistory.push(
                {
                    type: "Basic Search",
                    description: "description",
                    searchModel: vm.searchModel
                }
                );
            $state.go('app.folder', { folderId: 'search' }, { reload: 'app.folder' });
        });
    };

    vm.prepareAdvancedSearch = function (item) {
        var modalInstance = $uibModal.open({
            templateUrl: 'document-search-modal.html',
            controller: 'DocumentSearchModalCtrl as documentSearchModalCtrl',
            size: 'search',
            backdrop: 'static',
            resolve: {
                DocumentSearchData: function () {
                    return vm.searchModel;
                }
            }
        });

        modalInstance.result.then(function (searchCriteria) {
            // vm.folderManagers[vm.searchTabIndex].Content = searchFileManager

            vm.folderManagers[vm.searchTabIndex].Content.search(searchCriteria).then(function (data) {
                vm.documentsResultViewIndex = vm.searchTabIndex;
                $state.go('app.folder', { folderId: 'search' }, { reload: 'app.folder' });
                vm.searchHistory.push(
                   {
                       type: "Advanced Search",
                       description: "description",
                       searchModel: vm.searchModel
                   }
               );
            });
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    vm.openDocument = function (item) {
        //$state.go('document', { documentId: item.model.Id });
        var modalInstance = $uibModal.open({
            templateUrl: 'document-modal.html',
            controller: 'DocumentModalCtrl as documentModalCtrl',
            size: 'document',
            backdrop: 'static',
            scope: $scope,
            resolve: {
                documentId: function () {
                    return item.model.Id;
                },
                folderId: function () {
                    return vm.folderId;
                }
            }
        });

        modalInstance.result.then(function (documentId) {
            vm.documentId = documentId;
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    vm.prepareCreateFolder = function (item) {
        if (item && item.model) {
            var folderData = {};
            folderData.Name = "New Folder";
            folderData.ParentFolderId = item.model.Id;
            folderData.Path = item.model.Path;
            var modalInstance = $uibModal.open({
                templateUrl: 'create-folder-modal.html',
                controller: 'CreateFolderModalCtrl as createFolderModalCtrl',
                size: 'md',
                backdrop: 'static',
                resolve: {
                    CreateFolderData: function () {
                        return folderData;
                    }
                }
            });

            modalInstance.result.then(function (createFolderData) {
                vm.createFolder(createFolderData);
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        }
    };

    vm.prepareEditFolder = function (item) {
        if (item && item.model) {
            var folderData = {};
            folderData.ParentId = item.model.ParentId;
            folderData.Id = item.model.Id;
            folderData.Name = item.model.Name;
            folderData.Path = item.model.Path
            var modalInstance = $uibModal.open({
                templateUrl: 'edit-folder-modal.html',
                controller: 'EditFolderModalCtrl as editFolderModalCtrl',
                size: 'md',
                backdrop: 'static',
                resolve: {
                    EditFolderData: function () {
                        return folderData;
                    }
                }
            });

            modalInstance.result.then(function (editFolderData) {
                vm.editFolder(editFolderData);
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        }
    };

    vm.prepareMoveFolder = function (item) {
        if (item && item.model) {
            var folderData = {};
            folderData.FromFolderId = item.model.ParentId;
            folderData.Id = item.model.Id;
            folderData.FromPath = item.model.Path;
            var modalInstance = $uibModal.open({
                templateUrl: 'move-folder-modal.html',
                controller: 'MoveFolderModalCtrl as moveFolderModalCtrl',
                size: 'move-folder',
               // backdrop: 'static',
                resolve: {
                    MoveFolderData: function () {
                        return folderData;
                    }
                }
            });

            modalInstance.result.then(function (moveFolderData) {
                vm.moveFolder(moveFolderData);
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        }
    };

    vm.prepareDeleteFolder = function (item) {
        if (item && item.model) {
            var folderData = {};
            folderData.ParentId = item.model.ParentId;
            folderData.Id = item.model.Id;
            folderData.Name = item.model.Name
            folderData.Path = item.model.Path
            var modalInstance = $uibModal.open({
                templateUrl: 'delete-folder-modal.html',
                controller: 'DeleteFolderModalCtrl as deleteFolderModalCtrl',
                size: 'md',
                //backdrop: 'static',
                resolve: {
                    DeleteFolderData: function () {
                        return folderData;
                    }
                }
            });

            modalInstance.result.then(function (deleteFolderData) {
                vm.deleteFolder(deleteFolderData);
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        }
    };

    vm.prepareUploadDocument = function (item) {
        if (item && item.model) {
            var folderData = {};
            folderData.FolderId = item.model.Id;
            folderData.SelectedCategory = {
                id: "",
                Name: "",
            }
            var modalInstance = $uibModal.open({
                templateUrl: 'upload-document-modal.html',
                controller: 'UploadDocumentModalCtrl as uploadDocumentModalCtrl',
                size: 'upload',
                backdrop: 'static',
                resolve: {
                    UploadDocumentData: function () {
                        return folderData;
                    }
                }
            });

            modalInstance.result.then(function (uploadDocumentData) {
                //vm.uploadDocument(uploadDocumentData);
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        }
    };

    vm.prepareFolderLink = function (item) {
        if (item && item.model) {
            var folderData = {};
            folderData.FromFolderId = item.model.ParentId;
            folderData.Id = item.model.Id;
            folderData.FromPath = item.model.Path;
            folderData.Link = "http://localhost/dr/#/app/folder/" + item.model.Id;
            var modalInstance = $uibModal.open({
                templateUrl: 'folder-link-modal.html',
                controller: 'FolderLinkModalCtrl as folderLinkModalCtrl',
                size: 'md',
               // backdrop: 'static',
                resolve: {
                    FolderLinkData: function () {
                        return folderData;
                    }
                }
            });

            modalInstance.result.then(function () {
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        }
    };

    vm.prepareFolderDetails = function (item) {
        if (item && item.model) {
            var folderData = item.model
            var modalInstance = $uibModal.open({
                templateUrl: 'folder-details-modal.html',
                controller: 'FolderDetailsModalCtrl as folderDetailsModalCtrl',
                size: 'md',
               // backdrop: 'static',
                resolve: {
                    FolderDetailsData: function () {
                        return folderData;
                    }
                }
            });
            modalInstance.result.then(function () {
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        }
    };



    vm.moveDocument = function (item) {
        var documentData = {
            DocumentId: $rootScope.selectedDocumentToMoveItem.Id,
            FromFolderId: $rootScope.selectedDocumentToMoveItem.FromFolderId,
            ToFolderId: item.model.Id,
        }
        vm.folderManagers[vm.mainTabIndex].Content.moveDocument(documentData);
    };


    vm.createFolder = function (folderData) {
        /*
        if (vm.configContent.NonFertileFolders.indexOf(vm.folderManagers[vm.mainTabIndex].Content.currentFolderId) != -1) {
            return;
        } */
        vm.folderManagers[vm.mainTabIndex].Content.createSubfolder(folderData);
    };

    vm.editFolder = function (folderData) {
        vm.folderManagers[vm.mainTabIndex].Content.editFolder(folderData);
    };

    vm.moveFolder = function (folderData) {
        vm.folderManagers[vm.mainTabIndex].Content.moveFolder(folderData);
    };

    vm.deleteFolder = function (folderData) {
        vm.folderManagers[vm.mainTabIndex].Content.deleteFolder(folderData);
    };


    vm.addFolderFavorite = function (item) {
        var folderFavoriteData = {
            FolderId: item.model.Id
        }
        vm.folderManagers[vm.mainTabIndex].Content.addFolderFavorite(folderFavoriteData);
    };


    vm.getQueryParam = function (param) {
        var found;
        window.location.search.substr(1).split("&").forEach(function (item) {
            if (param === item.split("=")[0]) {
                found = item.split("=")[1];
            }
        });
        return found;
    };



    $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
        $(".dr-files-nav-tab-item").removeClass("active");
        $('#dr-file-tab-nav a:last').tab('show');
    });

    vm.initUserInfo();

    vm.changeLanguage(vm.getQueryParam('lang'));
    vm.isWindows = vm.getQueryParam('server') === 'Windows';
    var initExpand = function (pathInfo) {
        var promises = [];
        var getFolders = function () {
            var deferred = $q.defer(), i = 0, cummulativePath = "";
            do {
                cummulativePath += pathInfo[i].Name;
                promises.push(vm.folderExpand(pathInfo[i].Id, cummulativePath));
                cummulativePath += "/";//this will get dropped if ends
            } while (++i < pathInfo.length);    
        }
        var expandAll = function () {
            vm.folderManagers[vm.mainTabIndex].Content.expandAllNodes(0);
        }
        getFolders();
        $q.all(promises).then(function (data) {
            expandAll(data);
        });
    }


    vm.configContent.getConfigContent(vm.folderManagers[vm.mainTabIndex].Content).then(function () {
        if (!isNaN(folderId)) {
            vm.folderManagers[vm.mainTabIndex].Content.getFolder(folderId).then(function (data) {
                //check errors later
                var pathInfo = vm.folderManagers[vm.mainTabIndex].Content.folderPath = data.Folders[0].PathInfo;
                initExpand(pathInfo);
            });
        }
    });

    vm.folderManagers[vm.mainTabIndex].Content.getFavoriteFolders();

    //$rootScope.selectedDocumentToMoveItem = $cookies.getObject('selectedDocumentToMoveItem');
    //vm.folderManagers[vm.mainTabIndex].Content.setExpandedNodes(0);
    vm.initSearchModel();


}
    ])