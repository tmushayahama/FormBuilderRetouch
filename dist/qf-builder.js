var copyObjectToScope;

copyObjectToScope = function (object, scope) {

 /*
  Copy object (ng-repeat="object in objects") to scope without `hashKey`.
  */
 var key, value;
 for (key in object) {
  value = object[key];
  if (key !== '$$hashKey') {
   scope[key] = value;
  }
 }
};

angular.module('builder.controller', ['builder.provider']).controller('qfFormObjectEditableController', [
 '$scope', '$injector', function ($scope, $injector) {
  var $builder;
  $builder = $injector.get('$builder');
  $scope.setupScope = function (formObject) {

   /*
    1. Copy origin formObject (ng-repeat="object in formObjects") to scope.
    2. Setup optionsText with formObject.options.
    3. Watch scope.label, .description, .placeholder, .required, .options then copy to origin formObject.
    4. Watch scope.optionsText then convert to scope.options.
    5. setup validationOptions
    */
   var component;
   copyObjectToScope(formObject, $scope);
   $scope.optionsText = formObject.options.join('\n');
   $scope.$watch('[label, description, placeholder, required, options, validation]', function () {
    formObject.label = $scope.label;
    formObject.description = $scope.description;
    formObject.placeholder = $scope.placeholder;
    formObject.required = $scope.required;
    formObject.options = $scope.options;
    return formObject.validation = $scope.validation;
   }, true);
   $scope.$watch('optionsText', function (text) {
    var x;
    $scope.options = (function () {
     var i, len, ref, results;
     ref = text.split('\n');
     results = [];
     for (i = 0, len = ref.length; i < len; i++) {
      x = ref[i];
      if (x.length > 0) {
       results.push(x);
      }
     }
     return results;
    })();
    return $scope.inputText = $scope.options[0];
   });
   component = $builder.components[formObject.component];
   return $scope.validationOptions = component.validationOptions;
  };
  return $scope.data = {
   model: null,
   backup: function () {

    /*
     Backup input value.
     */
    return this.model = {
     label: $scope.label,
     description: $scope.description,
     placeholder: $scope.placeholder,
     required: $scope.required,
     optionsText: $scope.optionsText,
     validation: $scope.validation
    };
   },
   rollback: function () {

    /*
     Rollback input value.
     */
    if (!this.model) {
     return;
    }
    $scope.label = this.model.label;
    $scope.description = this.model.description;
    $scope.placeholder = this.model.placeholder;
    $scope.required = this.model.required;
    $scope.optionsText = this.model.optionsText;
    return $scope.validation = this.model.validation;
   }
  };
 }
]).controller('qfComponentsController', [
 '$scope', '$injector', function ($scope, $injector) {
  var $builder;
  $builder = $injector.get('$builder');
  $scope.selectGroup = function ($event, group) {
   var component, name, ref, results;
   if ($event != null) {
    $event.preventDefault();
   }
   $scope.activeGroup = group;
   $scope.components = [];
   ref = $builder.components;
   results = [];
   for (name in ref) {
    component = ref[name];
    if (component.group === group) {
     results.push($scope.components.push(component));
    }
   }
   return results;
  };
  $scope.groups = $builder.groups;
  $scope.activeGroup = $scope.groups[0];
  $scope.allComponents = $builder.components;
  return $scope.$watch('allComponents', function () {
   return $scope.selectGroup(null, $scope.activeGroup);
  });
 }
]).controller('qfComponentController', [
 '$scope', function ($scope) {
  return $scope.copyObjectToScope = function (object) {
   return copyObjectToScope(object, $scope);
  };
 }
]).controller('qfFormController', [
 '$scope', '$injector', function ($scope, $injector) {
  var $builder, $timeout;
  $builder = $injector.get('$builder');
  $timeout = $injector.get('$timeout');
  if ($scope.input == null) {
   $scope.input = [];
  }
  return $scope.$watch('form', function () {
   if ($scope.input.length > $scope.form.length) {
    $scope.input.splice($scope.form.length);
   }
   return $timeout(function () {
    return $scope.$broadcast($builder.broadcastChannel.updateInput);
   });
  }, true);
 }
]).controller('qfFormObjectController', [
 '$scope', '$injector', function ($scope, $injector) {
  var $builder;
  $builder = $injector.get('$builder');
  $scope.copyObjectToScope = function (object) {
   return copyObjectToScope(object, $scope);
  };
  return $scope.updateInput = function (value) {

   /*
    Copy current scope.input[X] to $parent.input.
    @param value: The input value.
    */
   var input;
   input = {
    id: $scope.formObject.id,
    label: $scope.formObject.label,
    value: value != null ? value : ''
   };
   return $scope.$parent.input.splice($scope.$index, 1, input);
  };
 }
]);angular.module('builder.directive', ['builder.provider', 'builder.controller', 'builder.drag', 'validator']).directive('qfBuilder', [
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
angular.module('builder.drag', []).provider('$drag', function () {
 var $injector, $rootScope, delay;
 $injector = null;
 $rootScope = null;
 this.data = {
  draggables: {},
  droppables: {}
 };
 this.mouseMoved = false;
 this.isMouseMoved = (function (_this) {
  return function () {
   return _this.mouseMoved;
  };
 })(this);
 this.hooks = {
  down: {},
  move: {},
  up: {}
 };
 this.eventMouseMove = function () {};
 this.eventMouseUp = function () {};
 $((function (_this) {
  return function () {
   $(document).on('mousedown', function (e) {
    var func, key, ref;
    _this.mouseMoved = false;
    ref = _this.hooks.down;
    for (key in ref) {
     func = ref[key];
     func(e);
    }
   });
   $(document).on('mousemove', function (e) {
    var func, key, ref;
    _this.mouseMoved = true;
    ref = _this.hooks.move;
    for (key in ref) {
     func = ref[key];
     func(e);
    }
   });
   return $(document).on('mouseup', function (e) {
    var func, key, ref;
    ref = _this.hooks.up;
    for (key in ref) {
     func = ref[key];
     func(e);
    }
   });
  };
 })(this));
 this.currentId = 0;
 this.getNewId = (function (_this) {
  return function () {
   return "" + (_this.currentId++);
  };
 })(this);
 this.setupEasing = function () {
  return jQuery.extend(jQuery.easing, {
   easeOutQuad: function (x, t, b, c, d) {
    return -c * (t /= d) * (t - 2) + b;
   }
  });
 };
 this.setupProviders = function (injector) {

  /*
   Setup providers.
   */
  $injector = injector;
  return $rootScope = $injector.get('$rootScope');
 };
 this.isHover = (function (_this) {
  return function ($elementA, $elementB) {

   /*
    Is element A hover on element B?
    @param $elementA: jQuery object
    @param $elementB: jQuery object
    */
   var isHover, offsetA, offsetB, sizeA, sizeB;
   offsetA = $elementA.offset();
   offsetB = $elementB.offset();
   sizeA = {
    width: $elementA.width(),
    height: $elementA.height()
   };
   sizeB = {
    width: $elementB.width(),
    height: $elementB.height()
   };
   isHover = {
    x: false,
    y: false
   };
   isHover.x = offsetA.left > offsetB.left && offsetA.left < offsetB.left + sizeB.width;
   isHover.x = isHover.x || offsetA.left + sizeA.width > offsetB.left && offsetA.left + sizeA.width < offsetB.left + sizeB.width;
   if (!isHover) {
    return false;
   }
   isHover.y = offsetA.top > offsetB.top && offsetA.top < offsetB.top + sizeB.height;
   isHover.y = isHover.y || offsetA.top + sizeA.height > offsetB.top && offsetA.top + sizeA.height < offsetB.top + sizeB.height;
   return isHover.x && isHover.y;
  };
 })(this);
 delay = function (ms, func) {
  return setTimeout(function () {
   return func();
  }, ms);
 };
 this.autoScroll = {
  up: false,
  down: false,
  scrolling: false,
  scroll: (function (_this) {
   return function () {
    _this.autoScroll.scrolling = true;
    if (_this.autoScroll.up) {
     $('html, body').dequeue().animate({
      scrollTop: $(window).scrollTop() - 50
     }, 100, 'easeOutQuad');
     return delay(100, function () {
      return _this.autoScroll.scroll();
     });
    } else if (_this.autoScroll.down) {
     $('html, body').dequeue().animate({
      scrollTop: $(window).scrollTop() + 50
     }, 100, 'easeOutQuad');
     return delay(100, function () {
      return _this.autoScroll.scroll();
     });
    } else {
     return _this.autoScroll.scrolling = false;
    }
   };
  })(this),
  start: (function (_this) {
   return function (e) {
    if (e.clientY < 50) {
     _this.autoScroll.up = true;
     _this.autoScroll.down = false;
     if (!_this.autoScroll.scrolling) {
      return _this.autoScroll.scroll();
     }
    } else if (e.clientY > $(window).innerHeight() - 50) {
     _this.autoScroll.up = false;
     _this.autoScroll.down = true;
     if (!_this.autoScroll.scrolling) {
      return _this.autoScroll.scroll();
     }
    } else {
     _this.autoScroll.up = false;
     return _this.autoScroll.down = false;
    }
   };
  })(this),
  stop: (function (_this) {
   return function () {
    _this.autoScroll.up = false;
    return _this.autoScroll.down = false;
   };
  })(this)
 };
 this.dragMirrorMode = (function (_this) {
  return function ($element, defer, object) {
   var result;
   if (defer == null) {
    defer = true;
   }
   result = {
    id: _this.getNewId(),
    mode: 'mirror',
    maternal: $element[0],
    element: null,
    object: object
   };
   $element.on('mousedown', function (e) {
    var $clone;
    e.preventDefault();
    $clone = $element.clone();
    result.element = $clone[0];
    $clone.addClass("qf-draggable form-horizontal prepare-dragging");
    _this.hooks.move.drag = function (e, defer) {
     var droppable, id, ref, results;
     if ($clone.hasClass('prepare-dragging')) {
      $clone.css({
       width: $element.width(),
       height: $element.height()
      });
      $clone.removeClass('prepare-dragging');
      $clone.addClass('dragging');
      if (defer) {
       return;
      }
     }
     $clone.offset({
      left: e.pageX - $clone.width() / 2,
      top: e.pageY - $clone.height() / 2
     });
     _this.autoScroll.start(e);
     ref = _this.data.droppables;
     results = [];
     for (id in ref) {
      droppable = ref[id];
      if (_this.isHover($clone, $(droppable.element))) {
       results.push(droppable.move(e, result));
      } else {
       results.push(droppable.out(e, result));
      }
     }
     return results;
    };
    _this.hooks.up.drag = function (e) {
     var droppable, id, isHover, ref;
     ref = _this.data.droppables;
     for (id in ref) {
      droppable = ref[id];
      isHover = _this.isHover($clone, $(droppable.element));
      droppable.up(e, isHover, result);
     }
     delete _this.hooks.move.drag;
     delete _this.hooks.up.drag;
     result.element = null;
     $clone.remove();
     return _this.autoScroll.stop();
    };
    $('body').append($clone);
    if (!defer) {
     return _this.hooks.move.drag(e, defer);
    }
   });
   return result;
  };
 })(this);
 this.dragDragMode = (function (_this) {
  return function ($element, defer, object) {
   var result;
   if (defer == null) {
    defer = true;
   }
   result = {
    id: _this.getNewId(),
    mode: 'drag',
    maternal: null,
    element: $element[0],
    object: object
   };
   $element.addClass('qf-draggable');
   $element.on('mousedown', function (e) {
    e.preventDefault();
    if ($element.hasClass('dragging')) {
     return;
    }
    $element.addClass('prepare-dragging');
    _this.hooks.move.drag = function (e, defer) {
     var droppable, id, ref;
     if ($element.hasClass('prepare-dragging')) {
      $element.css({
       width: $element.width(),
       height: $element.height()
      });
      $element.removeClass('prepare-dragging');
      $element.addClass('dragging');
      if (defer) {
       return;
      }
     }
     $element.offset({
      left: e.pageX - $element.width() / 2,
      top: e.pageY - $element.height() / 2
     });
     _this.autoScroll.start(e);
     ref = _this.data.droppables;
     for (id in ref) {
      droppable = ref[id];
      if (_this.isHover($element, $(droppable.element))) {
       droppable.move(e, result);
      } else {
       droppable.out(e, result);
      }
     }
    };
    _this.hooks.up.drag = function (e) {
     var droppable, id, isHover, ref;
     ref = _this.data.droppables;
     for (id in ref) {
      droppable = ref[id];
      isHover = _this.isHover($element, $(droppable.element));
      droppable.up(e, isHover, result);
     }
     delete _this.hooks.move.drag;
     delete _this.hooks.up.drag;
     $element.css({
      width: '',
      height: '',
      left: '',
      top: ''
     });
     $element.removeClass('dragging defer-dragging');
     return _this.autoScroll.stop();
    };
    if (!defer) {
     return _this.hooks.move.drag(e, defer);
    }
   });
   return result;
  };
 })(this);
 this.dropMode = (function (_this) {
  return function ($element, options) {
   var result;
   result = {
    id: _this.getNewId(),
    element: $element[0],
    move: function (e, draggable) {
     return $rootScope.$apply(function () {
      return typeof options.move === "function" ? options.move(e, draggable) : void 0;
     });
    },
    up: function (e, isHover, draggable) {
     return $rootScope.$apply(function () {
      return typeof options.up === "function" ? options.up(e, isHover, draggable) : void 0;
     });
    },
    out: function (e, draggable) {
     return $rootScope.$apply(function () {
      return typeof options.out === "function" ? options.out(e, draggable) : void 0;
     });
    }
   };
   return result;
  };
 })(this);
 this.draggable = (function (_this) {
  return function ($element, options) {
   var draggable, element, i, j, len, len1, result;
   if (options == null) {
    options = {};
   }

   /*
    Make the element could be drag.
    @param element: The jQuery element.
    @param options: Options
    mode: 'drag' [default], 'mirror'
    defer: yes/no. defer dragging
    object: custom information
    */
   result = [];
   if (options.mode === 'mirror') {
    for (i = 0, len = $element.length; i < len; i++) {
     element = $element[i];
     draggable = _this.dragMirrorMode($(element), options.defer, options.object);
     result.push(draggable.id);
     _this.data.draggables[draggable.id] = draggable;
    }
   } else {
    for (j = 0, len1 = $element.length; j < len1; j++) {
     element = $element[j];
     draggable = _this.dragDragMode($(element), options.defer, options.object);
     result.push(draggable.id);
     _this.data.draggables[draggable.id] = draggable;
    }
   }
   return result;
  };
 })(this);
 this.droppable = (function (_this) {
  return function ($element, options) {
   var droppable, element, i, len, result;
   if (options == null) {
    options = {};
   }

   /*
    Make the element coulde be drop.
    @param $element: The jQuery element.
    @param options: The droppable options.
    move: The custom mouse move callback. (e, draggable)->
    up: The custom mouse up callback. (e, isHover, draggable)->
    out: The custom mouse out callback. (e, draggable)->
    */
   result = [];
   for (i = 0, len = $element.length; i < len; i++) {
    element = $element[i];
    droppable = _this.dropMode($(element), options);
    result.push(droppable);
    _this.data.droppables[droppable.id] = droppable;
   }
   return result;
  };
 })(this);
 this.get = function ($injector) {
  this.setupEasing();
  this.setupProviders($injector);
  return {
   isMouseMoved: this.isMouseMoved,
   data: this.data,
   draggable: this.draggable,
   droppable: this.droppable
  };
 };
 this.get.$inject = ['$injector'];
 this.$get = this.get;
});
angular.module('builder', ['builder.directive']);
/*
 component:
 It is like a class.
 The base components are textInput, textArea, select, check, radio.
 User can custom the form with components.
 formObject:
 It is like an object (an instance of the component).
 User can custom the label, description, required and validation of the input.
 form:
 This is for end-user. There are form groups int the form.
 They can input the value to the form.
 */
var indexOf = [].indexOf || function (item) {
 for (var i = 0, l = this.length; i < l; i++) {
  if (i in this && this[i] === item)
   return i;
 }
 return -1;
};

angular.module('builder.provider', []).provider('$builder', function () {
 var $http, $injector, $templateCache;
 $injector = null;
 $http = null;
 $templateCache = null;
 this.config = {
  popoverPlacement: 'bottom'
 };
 this.components = {};
 this.groups = [];
 this.broadcastChannel = {
  updateInput: '$updateInput'
 };
 this.forms = {
  "default": []
 };
 this.convertComponent = function (name, component) {
  var ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, result;
  result = {
   name: name,
   group: (ref = component.group) != null ? ref : 'Default',
   label: (ref1 = component.label) != null ? ref1 : '',
   description: (ref2 = component.description) != null ? ref2 : '',
   placeholder: (ref3 = component.placeholder) != null ? ref3 : '',
   editable: (ref4 = component.editable) != null ? ref4 : true,
   required: (ref5 = component.required) != null ? ref5 : false,
   validation: (ref6 = component.validation) != null ? ref6 : '/.*/',
   validationOptions: (ref7 = component.validationOptions) != null ? ref7 : [],
   options: (ref8 = component.options) != null ? ref8 : [],
   arrayToText: (ref9 = component.arrayToText) != null ? ref9 : false,
   template: component.template,
   templateUrl: component.templateUrl,
   popoverTemplate: component.popoverTemplate,
   popoverTemplateUrl: component.popoverTemplateUrl
  };
  if (!result.template && !result.templateUrl) {
   console.error("The template is empty.");
  }
  if (!result.popoverTemplate && !result.popoverTemplateUrl) {
   console.error("The popoverTemplate is empty.");
  }
  return result;
 };
 this.convertFormObject = function (name, formObject) {
  var component, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, result;
  if (formObject == null) {
   formObject = {};
  }
  component = this.components[formObject.component];
  if (component == null) {
   throw "The component " + formObject.component + " was not registered.";
  }
  result = {
   id: formObject.id,
   component: formObject.component,
   editable: (ref = formObject.editable) != null ? ref : component.editable,
   index: (ref1 = formObject.index) != null ? ref1 : 0,
   label: (ref2 = formObject.label) != null ? ref2 : component.label,
   description: (ref3 = formObject.description) != null ? ref3 : component.description,
   placeholder: (ref4 = formObject.placeholder) != null ? ref4 : component.placeholder,
   options: (ref5 = formObject.options) != null ? ref5 : component.options,
   required: (ref6 = formObject.required) != null ? ref6 : component.required,
   validation: (ref7 = formObject.validation) != null ? ref7 : component.validation
  };
  return result;
 };
 this.reindexFormObject = (function (_this) {
  return function (name) {
   var formObjects, i, index, ref;
   formObjects = _this.forms[name];
   for (index = i = 0, ref = formObjects.length; i < ref; index = i += 1) {
    formObjects[index].index = index;
   }
  };
 })(this);
 this.setupProviders = (function (_this) {
  return function (injector) {
   $injector = injector;
   $http = $injector.get('$http');
   return $templateCache = $injector.get('$templateCache');
  };
 })(this);
 this.loadTemplate = function (component) {

  /*
   Load template for components.
   @param component: {object} The component of $builder.
   */
  if (component.template == null) {
   $http.get(component.templateUrl, {
    cache: $templateCache
   }).success(function (template) {
    return component.template = template;
   });
  }
  if (component.popoverTemplate == null) {
   return $http.get(component.popoverTemplateUrl, {
    cache: $templateCache
   }).success(function (template) {
    return component.popoverTemplate = template;
   });
  }
 };
 this.registerComponent = (function (_this) {
  return function (name, component) {
   var newComponent, ref;
   if (component == null) {
    component = {};
   }

   /*
    Register the component for form-builder.
    @param name: The component name.
    @param component: The component object.
    group: {string} The component group.
    label: {string} The label of the input.
    description: {string} The description of the input.
    placeholder: {string} The placeholder of the input.
    editable: {bool} Is the form object editable?
    required: {bool} Is the form object required?
    validation: {string} angular-validator. "/regex/" or "[rule1, rule2]". (default is RegExp(.*))
    validationOptions: {array} [{rule: angular-validator, label: 'option label'}] the options for the validation. (default is [])
    options: {array} The input options.
    arrayToText: {bool} checkbox could use this to convert input (default is no)
    template: {string} html template
    templateUrl: {string} The url of the template.
    popoverTemplate: {string} html template
    popoverTemplateUrl: {string} The url of the popover template.
    */
   if (_this.components[name] == null) {
    newComponent = _this.convertComponent(name, component);
    _this.components[name] = newComponent;
    if ($injector != null) {
     _this.loadTemplate(newComponent);
    }
    if (ref = newComponent.group, indexOf.call(_this.groups, ref) < 0) {
     _this.groups.push(newComponent.group);
    }
   } else {
    console.error("The component " + name + " was registered.");
   }
  };
 })(this);
 this.addFormObject = (function (_this) {
  return function (name, formObject) {
   var base;
   if (formObject == null) {
    formObject = {};
   }

   /*
    Insert the form object into the form at last.
    */
   if ((base = _this.forms)[name] == null) {
    base[name] = [];
   }
   return _this.insertFormObject(name, _this.forms[name].length, formObject);
  };
 })(this);
 this.insertFormObject = (function (_this) {
  return function (name, index, formObject) {
   var base;
   if (formObject == null) {
    formObject = {};
   }

   /*
    Insert the form object into the form at {index}.
    @param name: The form name.
    @param index: The form object index.
    @param form: The form object.
    id: The form object id.
    component: {string} The component name
    editable: {bool} Is the form object editable? (default is yes)
    label: {string} The form object label.
    description: {string} The form object description.
    placeholder: {string} The form object placeholder.
    options: {array} The form object options.
    required: {bool} Is the form object required? (default is no)
    validation: {string} angular-validator. "/regex/" or "[rule1, rule2]".
    [index]: {int} The form object index. It will be updated by $builder.
    @return: The form object.
    */
   if ((base = _this.forms)[name] == null) {
    base[name] = [];
   }
   if (index > _this.forms[name].length) {
    index = _this.forms[name].length;
   } else if (index < 0) {
    index = 0;
   }
   _this.forms[name].splice(index, 0, _this.convertFormObject(name, formObject));
   _this.reindexFormObject(name);
   return _this.forms[name][index];
  };
 })(this);
 this.removeFormObject = (function (_this) {
  return function (name, index) {

   /*
    Remove the form object by the index.
    @param name: The form name.
    @param index: The form object index.
    */
   var formObjects;
   formObjects = _this.forms[name];
   formObjects.splice(index, 1);
   return _this.reindexFormObject(name);
  };
 })(this);
 this.updateFormObjectIndex = (function (_this) {
  return function (name, oldIndex, newIndex) {

   /*
    Update the index of the form object.
    @param name: The form name.
    @param oldIndex: The old index.
    @param newIndex: The new index.
    */
   var formObject, formObjects;
   if (oldIndex === newIndex) {
    return;
   }
   formObjects = _this.forms[name];
   formObject = formObjects.splice(oldIndex, 1)[0];
   formObjects.splice(newIndex, 0, formObject);
   return _this.reindexFormObject(name);
  };
 })(this);
 this.$get = [
  '$injector', (function (_this) {
   return function ($injector) {
    var component, name, ref;
    _this.setupProviders($injector);
    ref = _this.components;
    for (name in ref) {
     component = ref[name];
     _this.loadTemplate(component);
    }
    return {
     config: _this.config,
     components: _this.components,
     groups: _this.groups,
     forms: _this.forms,
     broadcastChannel: _this.broadcastChannel,
     registerComponent: _this.registerComponent,
     addFormObject: _this.addFormObject,
     insertFormObject: _this.insertFormObject,
     removeFormObject: _this.removeFormObject,
     updateFormObjectIndex: _this.updateFormObjectIndex
    };
   };
  })(this)
 ];
});