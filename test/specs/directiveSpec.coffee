describe 'builder.directive', ->
    beforeEach module('builder')


    describe 'qf-components', ->
        $scope = null
        $compile = null
        $builder = null
        template = """<div qf-components></div>"""

        beforeEach inject ($rootScope, $injector) ->
            $scope = $rootScope.$new()
            $compile = $injector.get '$compile'
            $builder = $injector.get '$builder'

            $builder.registerComponent 'textInput',
                group: 'Default'
                label: 'Text Input'
                description: 'description'
                placeholder: 'placeholder'
                required: no
                template:
                    """
                    <div class="form-group">
                        <label for="{{name+index}}" class="col-md-4 control-label" ng-class="{'qf-required':required}">{{label}}</label>
                        <div class="col-md-8">
                            <input type="text" ng-model="inputText" validator-required="{{required}}" id="{{name+index}}" class="form-control" placeholder="{{placeholder}}"/>
                            <p class='help-block'>{{description}}</p>
                        </div>
                    </div>
                    """
                popoverTemplate: """<form></form>"""

        it 'compile qf-components with a component', ->
            view = $compile(template) $scope
            $scope.$digest()
            expect($(view).find('>.form-horizontal').length).toBe 1
            $components = $(view).find '.qf-component'
            expect($components.length).toBe 1
            expect($components.attr('ng-repeat')).toEqual 'component in components'
            expect($components.attr('qf-component')).toEqual 'component'


    describe 'qf-component', ->
        $scope = null
        $compile = null
        $builder = null
        template = """<div qf-components></div>"""

        beforeEach inject ($rootScope, $injector) ->
            $scope = $rootScope.$new()
            $compile = $injector.get '$compile'
            $builder = $injector.get '$builder'

            $builder.registerComponent 'textInput',
                group: 'Default'
                label: 'Text Input'
                description: 'description'
                placeholder: 'placeholder'
                required: no
                template:
                    """
                    <div class="form-group">
                        <label for="{{name+index}}" class="col-md-4 control-label" ng-class="{'qf-required':required}">{{label}}</label>
                        <div class="col-md-8">
                            <input type="text" ng-model="inputText" validator-required="{{required}}" id="{{name+index}}" class="form-control" placeholder="{{placeholder}}"/>
                            <p class='help-block'>{{description}}</p>
                        </div>
                    </div>
                    """
                popoverTemplate: """<form></form>"""

        it 'compile qf-component and called `scope.copyObjectToScope()`', ->
            $compile(template) $scope
            $scope.$digest()

            expect($scope.$$childHead).toBe $scope.$$childTail
            child = $scope.$$childHead.$$childHead
            expect(child.$$hashKey).toBeUndefined()
            for key, value of $scope.components[0] when key isnt '$$hashKey'
                expect(child[key]).toEqual value

        it 'compile qf-component and called `$drag.draggable()`', inject ($drag) ->
            componentName = Object.keys($builder.components)[0]
            spyOn($drag, 'draggable').and.callFake ($element, object) ->
                expect($element.length).toBe 1
                expect($element.hasClass('qf-component')).toBe yes
                expect
                    mode: 'mirror'
                    defer: no
                    object:
                        componentName: componentName
                .toEqual object

            $compile(template) $scope
            $scope.$digest()
            expect($drag.draggable).toHaveBeenCalled()

        it 'compile qf-component, the view is component.template', ->
            view = $compile(template) $scope
            $scope.$digest()

            $component = $(view).find '.qf-component'
            expect($component.length).toBe 1
            $formGroup = $component.find '.form-group'
            expect($formGroup.length).toBe 1


    describe 'qf-form', ->
        $scope = null
        $compile = null
        $builder = null
        template = """<div ng-model="input" qf-form="default"></div>"""

        beforeEach inject ($rootScope, $injector) ->
            $scope = $rootScope.$new()
            $compile = $injector.get '$compile'
            $builder = $injector.get '$builder'

            $builder.registerComponent 'textInput',
                group: 'Default'
                label: 'Text Input'
                description: 'description'
                placeholder: 'placeholder'
                required: no
                template:
                    """
                    <div class="form-group">
                        <label for="{{name+index}}" class="col-md-4 control-label" ng-class="{'qf-required':required}">{{label}}</label>
                        <div class="col-md-8">
                            <input type="text" ng-model="inputText" validator-required="{{required}}" id="{{name+index}}" class="form-control" placeholder="{{placeholder}}"/>
                            <p class='help-block'>{{description}}</p>
                        </div>
                    </div>
                    """
                popoverTemplate: """<form></form>"""
            $builder.addFormObject 'default', component: 'textInput'

        it 'compile qf-form', ->
            $scope.input = []
            view = $compile(template) $scope
            $scope.$digest()
            expect($scope.$$childHead).toBe $scope.$$childTail
            expect($scope.$$childHead.form).toBe $builder.forms.default
            $formObject = $(view).find '.qf-form-object'
            expect($formObject.length).toBe 1
            expect($formObject.attr('ng-repeat')).toEqual 'object in form'
            expect($formObject.attr('qf-form-object')).toEqual 'object'
