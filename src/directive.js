angular.module('builder.directive', ['builder.provider', 'builder.controller', 'builder.drag', 'validator']).directive('qfBuilder', [
 '$injector', function ($injector) {
  var $builder, $drag;
  $builder = $injector.get('$builder');
  $drag = $injector.get('$drag');
  return {
   restrict: 'A',
   scope: {
    qfBuilder: '='
   },
   templateUrl: function (element, attrs) {
    return attrs.templateUrl;
   },
   link: function (scope, element, attrs) {
    var base, beginMove, name;
    scope.formName = attrs.qfBuilder;
    if ((base = $builder.forms)[name = scope.formName] == null) {
     base[name] = [];
    }
    scope.formObjects = $builder.forms[scope.formName];
    beginMove = true;
    $(element).addClass('qf-builder');
    return $drag.droppable($(element), {
     move: function (e) {
      var $empty, $formObject, $formObjects, height, i, index, j, offset, positions, ref, ref1;
      if (beginMove) {
       $("div.qf-form-object-editable").popover('hide');
       beginMove = false;
      }
      $formObjects = $(element).find('.qf-form-object-editable:not(.empty,.dragging)');
      if ($formObjects.length === 0) {
       if ($(element).find('.qf-form-object-editable.empty').length === 0) {
        $(element).find('>div:first').append($("<div class='qf-form-object-editable empty'></div>"));
       }
       return;
      }
      positions = [];
      positions.push(-1000);
      for (index = i = 0, ref = $formObjects.length; i < ref; index = i += 1) {
       $formObject = $($formObjects[index]);
       offset = $formObject.offset();
       height = $formObject.height();
       positions.push(offset.top + height / 2);
      }
      positions.push(positions[positions.length - 1] + 1000);
      for (index = j = 1, ref1 = positions.length; j < ref1; index = j += 1) {
       if (e.pageY > positions[index - 1] && e.pageY <= positions[index]) {
        $(element).find('.empty').remove();
        $empty = $("<div class='qf-form-object-editable empty'></div>");
        if (index - 1 < $formObjects.length) {
         $empty.insertBefore($($formObjects[index - 1]));
        } else {
         $empty.insertAfter($($formObjects[index - 2]));
        }
        break;
       }
      }
     },
     out: function () {
      if (beginMove) {
       $("div.qf-form-object-editable").popover('hide');
       beginMove = false;
      }
      return $(element).find('.empty').remove();
     },
     up: function (e, isHover, draggable) {
      var formObject, newIndex, oldIndex;
      beginMove = true;
      if (!$drag.isMouseMoved()) {
       $(element).find('.empty').remove();
       return;
      }
      if (!isHover && draggable.mode === 'drag') {
       formObject = draggable.object.formObject;
       if (formObject.editable) {
        $builder.removeFormObject(attrs.qfBuilder, formObject.index);
       }
      } else if (isHover) {
       if (draggable.mode === 'mirror') {
        $builder.insertFormObject(scope.formName, $(element).find('.empty').index('.qf-form-object-editable'), {
         component: draggable.object.componentName
        });
       }
       if (draggable.mode === 'drag') {
        oldIndex = draggable.object.formObject.index;
        newIndex = $(element).find('.empty').index('.qf-form-object-editable');
        if (oldIndex < newIndex) {
         newIndex--;
        }
        $builder.updateFormObjectIndex(scope.formName, oldIndex, newIndex);
       }
      }
      return $(element).find('.empty').remove();
     }
    });
   }
  };
 }
]).directive('qfFormObjectEditable', [
 '$injector', function ($injector) {
  var $builder, $compile, $drag, $validator;
  $builder = $injector.get('$builder');
  $drag = $injector.get('$drag');
  $compile = $injector.get('$compile');
  $validator = $injector.get('$validator');
  return {
   restrict: 'A',
   controller: 'qfFormObjectEditableController',
   scope: {
    formObject: '=qfFormObjectEditable'
   },
   link: function (scope, element) {
    var popover;
    var settingContainer = $('.qf-properties');
    scope.inputArray = [];
    scope.$component = $builder.components[scope.formObject.component];
    scope.setupScope(scope.formObject);
    scope.$watch('$component.template', function (template) {
     var view;
     if (!template) {
      return;
     }
     view = $compile(template)(scope);
     return $(element).html(view);
    });
    $(element).on('click', function () {
     return false;
    });
    $drag.draggable($(element), {
     object: {
      formObject: scope.formObject
     }
    });
    if (!scope.formObject.editable) {
     return;
    }
    popover = {};
    scope.$watch('$component.popoverTemplate', function (template) {
     if (!template) {
      return;
     }
     $(element).removeClass(popover.id);

     popover = {
      id: "qf-" + (Math.random().toString().substr(2)),
      isClickedSave: false,
      view: null,
      html: template
     };



     popover.html = $(popover.html).addClass(popover.id);
     settingContainer.html($(popover.html));
     popover.view = $compile(popover.html)(scope);
     $(element).addClass(popover.id);
     return $(element).popover({
      html: true,
      title: scope.$component.label,
      content: popover.view,
      container: 'body',
      placement: $builder.config.popoverPlacement
     });
    });
    scope.popover = {
     save: function ($event) {

      /*
       The save event of the popover.
       */
      $event.preventDefault();
      $validator.validate(scope).success(function () {
       popover.isClickedSave = true;
       return $(element).popover('hide');
      });
     },
     remove: function ($event) {

      /*
       The delete event of the popover.
       */
      $event.preventDefault();
      $builder.removeFormObject(scope.$parent.formName, scope.$parent.$index);
      $(element).popover('hide');
     },
     shown: function () {

      /*
       The shown event of the popover.
       */
      scope.data.backup();
      return popover.isClickedSave = false;
     },
     cancel: function ($event) {

      /*
       The cancel event of the popover.
       */
      scope.data.rollback();
      if ($event) {
       $event.preventDefault();
       $(element).popover('hide');
      }
     }
    };
    $(element).on('show.bs.popover', function () {
     var $popover, elementOrigin, popoverTop;
     if ($drag.isMouseMoved()) {
      return false;
     }
     $("div.qf-form-object-editable:not(." + popover.id + ")").popover('hide');
     $popover = $("form." + popover.id).closest('.popover');
     if ($popover.length > 0) {
      elementOrigin = $(element).offset().top + $(element).height() / 2;
      popoverTop = elementOrigin - $popover.height() / 2;
      $popover.css({
       position: 'absolute',
       top: popoverTop
      });
      $popover.show();
      setTimeout(function () {
       $popover.addClass('in');
       return $(element).triggerHandler('shown.bs.popover');
      }, 0);
      return false;
     }
    });
    $(element).on('shown.bs.popover', function () {
     $(".popover ." + popover.id + " input:first").select();
     scope.$apply(function () {
      return scope.popover.shown();
     });
    });
    return $(element).on('hide.bs.popover', function () {
     var $popover;
     $popover = $("form." + popover.id).closest('.popover');
     if (!popover.isClickedSave) {
      if (scope.$$phase || scope.$root.$$phase) {
       scope.popover.cancel();
      } else {
       scope.$apply(function () {
        return scope.popover.cancel();
       });
      }
     }
     $popover.removeClass('in');
     setTimeout(function () {
      return $popover.hide();
     }, 300);
     return false;
    });
   }
  };
 }
]).directive('qfComponents', function () {
 return {
  restrict: 'A',
  templateUrl: function (element, attrs) {
   return attrs.templateUrl;
  },
  controller: 'qfComponentsController'
 };
}).directive('qfComponent', [
 '$injector', function ($injector) {
  var $builder, $compile, $drag;
  $builder = $injector.get('$builder');
  $drag = $injector.get('$drag');
  $compile = $injector.get('$compile');
  return {
   restrict: 'A',
   scope: {
    component: '=qfComponent'
   },
   controller: 'qfComponentController',
   link: function (scope, element) {
    scope.copyObjectToScope(scope.component);
    $drag.draggable($(element), {
     mode: 'mirror',
     defer: false,
     object: {
      componentName: scope.component.name
     }
    });
    return scope.$watch('component.template', function (template) {
     var view;
     if (!template) {
      return;
     }
     view = $compile(template)(scope);
     return $(element).html(view);
    });
   }
  };
 }
]).directive('qfForm', [
 '$injector', function ($injector) {
  return {
   restrict: 'A',
   require: 'ngModel',
   scope: {
    formName: '@qfForm',
    input: '=ngModel',
    "default": '=qfDefault'
   },
   template: "<div class='qf-form-object' ng-repeat=\"object in form\" qf-form-object=\"object\"></div>",
   controller: 'qfFormController',
   link: function (scope, element, attrs) {
    var $builder, base, name;
    $builder = $injector.get('$builder');
    if ((base = $builder.forms)[name = scope.formName] == null) {
     base[name] = [];
    }
    return scope.form = $builder.forms[scope.formName];
   }
  };
 }
]).directive('qfFormObject', [
 '$injector', function ($injector) {
  var $builder, $compile, $parse;
  $builder = $injector.get('$builder');
  $compile = $injector.get('$compile');
  $parse = $injector.get('$parse');
  return {
   restrict: 'A',
   controller: 'qfFormObjectController',
   link: function (scope, element, attrs) {
    scope.formObject = $parse(attrs.qfFormObject)(scope);
    scope.$component = $builder.components[scope.formObject.component];
    scope.$on($builder.broadcastChannel.updateInput, function () {
     return scope.updateInput(scope.inputText);
    });
    if (scope.$component.arrayToText) {
     scope.inputArray = [];
     scope.$watch('inputArray', function (newValue, oldValue) {
      var checked, index, ref;
      if (newValue === oldValue) {
       return;
      }
      checked = [];
      for (index in scope.inputArray) {
       if (scope.inputArray[index]) {
        checked.push((ref = scope.options[index]) != null ? ref : scope.inputArray[index]);
       }
      }
      return scope.inputText = checked.join(', ');
     }, true);
    }
    scope.$watch('inputText', function () {
     return scope.updateInput(scope.inputText);
    });
    scope.$watch(attrs.qfFormObject, function () {
     return scope.copyObjectToScope(scope.formObject);
    }, true);
    scope.$watch('$component.template', function (template) {
     var $input, $template, view;
     if (!template) {
      return;
     }
     $template = $(template);
     $input = $template.find("[ng-model='inputText']");
     $input.attr({
      validator: '{{validation}}'
     });
     view = $compile($template)(scope);
     return $(element).html(view);
    });
    if (!scope.$component.arrayToText && scope.formObject.options.length > 0) {
     scope.inputText = scope.formObject.options[0];
    }
    return scope.$watch("default['" + scope.formObject.id + "']", function (value) {
     if (!value) {
      return;
     }
     if (scope.$component.arrayToText) {
      return scope.inputArray = value;
     } else {
      return scope.inputText = value;
     }
    });
   }
  };
 }
]);

// ---
// generated by coffee-script 1.9.2