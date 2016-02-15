angular.module('qf-retouch.common')
.service('ConfigContent', [
        'config', '$q',  '$http', '$filter', 'FolderItem',
        function (config, $q, $http, $filter, FolderItem) {

            $http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

            var ConfigContent = function () {
                this.Contents = [];
                this.NonFertileFolders = [0, 2];
            };

            ConfigContent.prototype.deferredHandler = function (data, deferred, defaultMsg) {
                if (!data || typeof data !== 'object') {
                    this.error = 'Error';
                }
                if (!this.error && data.result && data.result.error) {
                    this.error = data.result.error;
                }
                if (!this.error && data.error) {
                    this.error = data.error.message;
                }
                if (!this.error && defaultMsg) {
                    this.error = defaultMsg;
                }
                if (this.error) {
                    return deferred.reject(data);
                }
                return deferred.resolve(data);
            };

            ConfigContent.prototype.getSearchOperator = function (type) {
                var self = this;
                var result = $filter('filter')(self.Contents.SearchOperatorRules,
                     function (d) { return d.Type === type; })[0];

                return result.SearchOperatorsDTO;
            }

            ConfigContent.prototype.getConfigContent = function (folderManager) {
                var self = this;
                var deferred = $q.defer();
                self.error = '';
                $http.get(config.apiModel.configContent, {}).success(function (data) {
                    folderManager.folderList = [];
                    self.Contents = data["ConfigContent"];
                    angular.forEach(data.DefaultFolders, function (folder) {
                        folderManager.folderList.push(new FolderItem(folder));
                        folderManager.initFolderTrees(folder);
                    });
                    self.deferredHandler(data, deferred);
                }).error(function (data) {
                    self.deferredHandler(data, deferred, 'Unknown error');
                });
                return deferred.promise;
            };

            ConfigContent.prototype.getDocumentConfigContent = function (success, error) {
                var self = this;
                self.error = '';
                $http.get(config.apiModel.configContent, {}).success(function (data) {
                    self.Contents = data["ConfigContent"];

                    if (data.error) {
                        self.error = data.error;
                        return typeof error === 'function' && error(data);
                    }
                    typeof success === 'function' && success(data);
                }).error(function (data) {
                    //self.requesting = false;
                    typeof error === 'function' && error(data);
                });
            };

            ConfigContent.prototype.canCreateFolders = function (code) {
                var self = this;
                var permission = _.where(
                    self.Contents.RoleFolderAccessDTO,
                    { Name: "CreateFolders" });
                return permission.length > 0 ? code & permission[0].Value : false;
            }
            ConfigContent.prototype.canRenameFolders = function (code) {
                var self = this;
                var permission = _.where(
                    self.Contents.RoleFolderAccessDTO,
                    { Name: "RenameFolders" });
                return permission.length > 0 ? code & permission[0].Value : false;
            }
            ConfigContent.prototype.canCopyPasteSubFolders = function (code) {
                var self = this;
                var permission = _.where(
                    self.Contents.RoleFolderAccessDTO,
                    { Name: "CopyPasteSubFolders" });
                return permission.length > 0 ? code & permission[0].Value : false;
            }
            ConfigContent.prototype.canSortSubFolders = function (code) {
                var self = this;
                var permission = _.where(
                    self.Contents.RoleFolderAccessDTO,
                    { Name: "SortSubFolders" });
                return permission.length > 0 ? code & permission[0].Value : false;
            }
            ConfigContent.prototype.canMoveFolders = function (code) {
                var self = this;
                var permission = _.where(
                    self.Contents.RoleFolderAccessDTO,
                    { Name: "MoveFolders" });
                return permission.length > 0 ? code & permission[0].Value : false;
            }
            ConfigContent.prototype.canEditFolderSecurity = function (code) {
                var self = this;
                var permission = _.where(
                    self.Contents.RoleFolderAccessDTO,
                    { Name: "EditFolderSecurity" });
                return permission.length > 0 ? code & permission[0].Value : false;
            }
            ConfigContent.prototype.canDeleteFolders = function (code) {
                var self = this;
                var permission = _.where(
                    self.Contents.RoleFolderAccessDTO,
                    { Name: "DeleteFolders" });
                return permission.length > 0 ? code & permission[0].Value : false;
            }
            ConfigContent.prototype.canOtherFolderModify = function (code) {
                var self = this;
                var permission = _.where(
                    self.Contents.RoleFolderAccessDTO,
                    { Name: "OtherFolderModify" });
                return permission.length > 0 ? code & permission[0].Value : false;
            }

            ConfigContent.prototype.canCreateDocuments = function (code) {
                var self = this;
                var permission = _.where(
                    self.Contents.RoleDocumentAccessDTO,
                    { Name: "CreateDocuments" });
                return permission.length > 0 ? code & permission[0].Value : false;
            }

            return ConfigContent;
        }
]);
