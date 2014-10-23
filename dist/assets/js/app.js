(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./src/javascript/app.js":[function(require,module,exports){
var InstantWin = require('./instant');
var Steps = InstantWin.Steps;
var defaultStep = Steps[0];

window.tv4 = require('tv4');
var ObjectPath = require('objectpath');

try {
  angular.module('ObjectPath', []).provider('ObjectPath', function(){
    this.parse = ObjectPath.parse;
    this.stringify = ObjectPath.stringify;
    this.normalize = ObjectPath.normalize;
    this.$get = function(){
      return ObjectPath;
    };
  });
} catch(e) {}

require('angular-schema-form/dist/schema-form');
require('./schema-form/foundation-decorator');
require('./schema-form/foundation-decorator-datepicker');

var app = angular.module('hull-instant', ['ngAnimate', 'schemaForm'])

.factory("$instant", ["$hullInit", function($hullInit) {
  var instant = new InstantWin($hullInit.user, $hullInit.ship);
  window.$instant = instant;
  return instant;
}])

.directive("progress", function(){
  return {
    restrict: "A",
    scope: { step: "=", steps: "=", stepIndex: "=" },
    templateUrl: "templates/hull-instant/directives/progress.html",
    controller: function($scope) {
      $scope.progressRate = function() {
        return 100 * ($scope.stepIndex + 1) / ($scope.steps.length + 1);
      }
    }
  };
})

.controller('FormController', ['$scope', '$instant', function($scope) {
  $scope.model = {};
  var fields = ($scope.instant.form && $scope.instant.form.fields_list) || [];
  angular.forEach(fields, function(field) {
    $scope.model[field.name] = field.value;
  });
  $scope.schema = $scope.instant.form.fields_schema;
  $scope.form = [
    {
      "type": "fieldset",
      "title" : "Form",
      "items" : [ "*" ],
    },
    { "type": "submit", "title": "Save", "style":"" }
  ];

  $scope.onSubmit = function(form) {
    // First we broadcast an event so all fields validate themselves
    $scope.$broadcast('schemaFormValidate');

    // Then we check if the form is valid
    if (form.$valid) {
      $instant.submitForm($scope.model);
    }
  }
}])

.controller('InstantWinController',['$scope', '$instant',
  function InstantWinController($scope, $instant) {

    $scope.login    = Hull.login;
    $scope.logout   = Hull.logout;
    $scope.play     = $instant.play;

    $scope.steps = Steps;
    $scope.$instant = $instant;
    $scope.instant  = $instant.getState();

    function onChange(instant) {
      $scope.$apply(function() {
        $scope.instant = instant;
      });
    }

    $instant.onChange(onChange);
  }
]);


Hull.ready(function(_, currentUser, ship, org) {
  var HullInit = {
    user: currentUser,
    ship: ship,
    org: org
  };

  app.value('$hullInit', HullInit);
  angular.bootstrap(document, ['hull-instant']);
});

},{"./instant":"/Users/sbellity/code/h/instant-win/src/javascript/instant.js","./schema-form/foundation-decorator":"/Users/sbellity/code/h/instant-win/src/javascript/schema-form/foundation-decorator.js","./schema-form/foundation-decorator-datepicker":"/Users/sbellity/code/h/instant-win/src/javascript/schema-form/foundation-decorator-datepicker.js","angular-schema-form/dist/schema-form":"/Users/sbellity/code/h/instant-win/node_modules/angular-schema-form/dist/schema-form.js","objectpath":"/Users/sbellity/code/h/instant-win/node_modules/objectpath/index.js","tv4":"/Users/sbellity/code/h/instant-win/node_modules/tv4/tv4.js"}],"/Users/sbellity/code/h/instant-win/node_modules/angular-schema-form/dist/schema-form.js":[function(require,module,exports){
// Deps is sort of a problem for us, maybe in the future we will ask the user to depend
// on modules for add-ons

var deps = ['ObjectPath'];
try {
  //This throws an expection if module does not exist.
  angular.module('ngSanitize');
  deps.push('ngSanitize');
} catch (e) {}

try {
  //This throws an expection if module does not exist.
  angular.module('ui.sortable');
  deps.push('ui.sortable');
} catch (e) {}

try {
  //This throws an expection if module does not exist.
  angular.module('angularSpectrumColorpicker');
  deps.push('angularSpectrumColorpicker');
} catch (e) {}

angular.module('schemaForm', deps);

angular.module('schemaForm').provider('sfPath',
['ObjectPathProvider', function(ObjectPathProvider) {
  var ObjectPath = {parse: ObjectPathProvider.parse};

  // if we're on Angular 1.2.x, we need to continue using dot notation
  if (angular.version.major === 1 && angular.version.minor < 3) {
    ObjectPath.stringify = function(arr) {
      return Array.isArray(arr) ? arr.join('.') : arr.toString();
    };
  } else {
    ObjectPath.stringify = ObjectPathProvider.stringify;
  }

  // We want this to use whichever stringify method is defined above,
  // so we have to copy the code here.
  ObjectPath.normalize = function(data, quote) {
    return ObjectPath.stringify(Array.isArray(data) ? data : ObjectPath.parse(data), quote);
  };

  this.parse = ObjectPath.parse;
  this.stringify = ObjectPath.stringify;
  this.normalize = ObjectPath.normalize;
  this.$get = function() {
    return ObjectPath;
  };
}]);

/**
 * @ngdoc service
 * @name sfSelect
 * @kind function
 *
 */
angular.module('schemaForm').factory('sfSelect', ['sfPath', function(sfPath) {
  var numRe = /^\d+$/;

  /**
    * @description
    * Utility method to access deep properties without
    * throwing errors when things are not defined.
    * Can also set a value in a deep structure, creating objects when missing
    * ex.
    * var foo = Select('address.contact.name',obj)
    * Select('address.contact.name',obj,'Leeroy')
    *
    * @param {string} projection A dot path to the property you want to get/set
    * @param {object} obj   (optional) The object to project on, defaults to 'this'
    * @param {Any}    valueToSet (opional)  The value to set, if parts of the path of
    *                 the projection is missing empty objects will be created.
    * @returns {Any|undefined} returns the value at the end of the projection path
    *                          or undefined if there is none.
    */
  return function(projection, obj, valueToSet) {
    if (!obj) {
      obj = this;
    }
    //Support [] array syntax
    var parts = typeof projection === 'string' ? sfPath.parse(projection) : projection;

    if (typeof valueToSet !== 'undefined' && parts.length === 1) {
      //special case, just setting one variable
      obj[parts[0]] = valueToSet;
      return obj;
    }

    if (typeof valueToSet !== 'undefined' &&
        typeof obj[parts[0]] === 'undefined') {
       // We need to look ahead to check if array is appropriate
      obj[parts[0]] = parts.length > 2 && numRe.test(parts[1]) ? [] : {};
    }

    var value = obj[parts[0]];
    for (var i = 1; i < parts.length; i++) {
      // Special case: We allow JSON Form syntax for arrays using empty brackets
      // These will of course not work here so we exit if they are found.
      if (parts[i] === '') {
        return undefined;
      }
      if (typeof valueToSet !== 'undefined') {
        if (i === parts.length - 1) {
          //last step. Let's set the value
          value[parts[i]] = valueToSet;
          return valueToSet;
        } else {
          // Make sure to create new objects on the way if they are not there.
          // We need to look ahead to check if array is appropriate
          var tmp = value[parts[i]];
          if (typeof tmp === 'undefined' || tmp === null) {
            tmp = numRe.test(parts[i + 1]) ? [] : {};
            value[parts[i]] = tmp;
          }
          value = tmp;
        }
      } else if (value) {
        //Just get nex value.
        value = value[parts[i]];
      }
    }
    return value;
  };
}]);

angular.module('schemaForm').provider('schemaFormDecorators',
['$compileProvider', 'sfPathProvider', function($compileProvider, sfPathProvider) {
  var defaultDecorator = '';
  var directives = {};

  var templateUrl = function(name, form) {
    //schemaDecorator is alias for whatever is set as default
    if (name === 'sfDecorator') {
      name = defaultDecorator;
    }

    var directive = directives[name];

    //rules first
    var rules = directive.rules;
    for (var i = 0; i < rules.length; i++) {
      var res = rules[i](form);
      if (res) {
        return res;
      }
    }

    //then check mapping
    if (directive.mappings[form.type]) {
      return directive.mappings[form.type];
    }

    //try default
    return directive.mappings['default'];
  };

  var createDirective = function(name, options) {
    $compileProvider.directive(name, ['$parse', '$compile', '$http', '$templateCache',
      function($parse,  $compile,  $http,  $templateCache) {

        return {
          restrict: 'AE',
          replace: false,
          transclude: false,
          scope: true,
          require: '?^sfSchema',
          link: function(scope, element, attrs, sfSchema) {
            //rebind our part of the form to the scope.
            var once = scope.$watch(attrs.form, function(form) {

              if (form) {
                scope.form  = form;

                //ok let's replace that template!
                //We do this manually since we need to bind ng-model properly and also
                //for fieldsets to recurse properly.
                var url = templateUrl(name, form);
                $http.get(url, {cache: $templateCache}).then(function(res) {
                  var key = form.key ?
                            sfPathProvider.stringify(form.key).replace(/"/g, '&quot;') : '';
                  var template = res.data.replace(
                    /\$\$value\$\$/g,
                    'model' + (key[0] !== '[' ? '.' : '') + key
                  );

                  if (options && options.className) {
                  	element.addClass(options.className);
                  }
                  element.html(template);
                  $compile(element.contents())(scope);
                });
                once();
              }
            });

            //Keep error prone logic from the template
            scope.showTitle = function() {
              return scope.form && scope.form.notitle !== true && scope.form.title;
            };

            scope.listToCheckboxValues = function(list) {
              var values = {};
              angular.forEach(list, function(v) {
                values[v] = true;
              });
              return values;
            };

            scope.checkboxValuesToList = function(values) {
              var lst = [];
              angular.forEach(values, function(v, k) {
                if (v) {
                  lst.push(k);
                }
              });
              return lst;
            };

            scope.buttonClick = function($event, form) {
              if (angular.isFunction(form.onClick)) {
                form.onClick($event, form);
              } else if (angular.isString(form.onClick)) {
                if (sfSchema) {
                  //evaluating in scope outside of sfSchemas isolated scope
                  sfSchema.evalInParentScope(form.onClick, {'$event': $event, form: form});
                } else {
                  scope.$eval(form.onClick, {'$event': $event, form: form});
                }
              }
            };

            /**
             * Evaluate an expression, i.e. scope.$eval
             * but do it in sfSchemas parent scope sf-schema directive is used
             * @param {string} expression
             * @param {Object} locals (optional)
             * @return {Any} the result of the expression
             */
            scope.evalExpr = function(expression, locals) {
              if (sfSchema) {
                //evaluating in scope outside of sfSchemas isolated scope
                return sfSchema.evalInParentScope(expression, locals);
              }

              return scope.$eval(expression, locals);
            };

            /**
             * Evaluate an expression, i.e. scope.$eval
             * in this decorators scope
             * @param {string} expression
             * @param {Object} locals (optional)
             * @return {Any} the result of the expression
             */
            scope.evalInScope = function(expression, locals) {
              if (expression) {
                return scope.$eval(expression, locals);
              }
            };

            /**
             * Error message handler
             * An error can either be a schema validation message or a angular js validtion
             * error (i.e. required)
             */
            scope.errorMessage = function(schemaError) {
              //User has supplied validation messages
              if (scope.form.validationMessage) {
                if (schemaError) {
                  if (angular.isString(scope.form.validationMessage)) {
                    return scope.form.validationMessage;
                  }

                  return scope.form.validationMessage[schemaError.code] ||
                         scope.form.validationMessage['default'];
                } else {
                  return scope.form.validationMessage.number ||
                         scope.form.validationMessage['default'] ||
                         scope.form.validationMessage;
                }
              }

              //No user supplied validation message.
              if (schemaError) {
                return schemaError.message; //use tv4.js validation message
              }

              //Otherwise we only have input number not being a number
              return 'Not a number';

            };
          }
        };
      }
    ]);
  };

  var createManualDirective = function(type, templateUrl, transclude) {
    transclude = angular.isDefined(transclude) ? transclude : false;
    $compileProvider.directive('sf' + angular.uppercase(type[0]) + type.substr(1), function() {
      return {
        restrict: 'EAC',
        scope: true,
        replace: true,
        transclude: transclude,
        template: '<sf-decorator form="form"></sf-decorator>',
        link: function(scope, element, attrs) {
          var watchThis = {
            'items': 'c',
            'titleMap': 'c',
            'schema': 'c'
          };
          var form = {type: type};
          var once = true;
          angular.forEach(attrs, function(value, name) {
            if (name[0] !== '$' && name.indexOf('ng') !== 0 && name !== 'sfField') {

              var updateForm = function(val) {
                if (angular.isDefined(val) && val !== form[name]) {
                  form[name] = val;

                  //when we have type, and if specified key we apply it on scope.
                  if (once && form.type && (form.key || angular.isUndefined(attrs.key))) {
                    scope.form = form;
                    once = false;
                  }
                }
              };

              if (name === 'model') {
                //"model" is bound to scope under the name "model" since this is what the decorators
                //know and love.
                scope.$watch(value, function(val) {
                  if (val && scope.model !== val) {
                    scope.model = val;
                  }
                });
              } else if (watchThis[name] === 'c') {
                //watch collection
                scope.$watchCollection(value, updateForm);
              } else {
                //$observe
                attrs.$observe(name, updateForm);
              }
            }
          });
        }
      };
    });
  };

  /**
   * Create a decorator directive and its sibling "manual" use directives.
   * The directive can be used to create form fields or other form entities.
   * It can be used in conjunction with <schema-form> directive in which case the decorator is
   * given it's configuration via a the "form" attribute.
   *
   * ex. Basic usage
   *   <sf-decorator form="myform"></sf-decorator>
   **
   * @param {string} name directive name (CamelCased)
   * @param {Object} mappings, an object that maps "type" => "templateUrl"
   * @param {Array}  rules (optional) a list of functions, function(form) {}, that are each tried in
   *                 turn,
   *                 if they return a string then that is used as the templateUrl. Rules come before
   *                 mappings.
   */
  this.createDecorator = function(name, mappings, rules, options) {
    directives[name] = {
      mappings: mappings || {},
      rules:    rules    || []
    };

    if (!directives[defaultDecorator]) {
      defaultDecorator = name;
    }
    createDirective(name, options);
  };

  /**
   * Creates a directive of a decorator
   * Usable when you want to use the decorators without using <schema-form> directive.
   * Specifically when you need to reuse styling.
   *
   * ex. createDirective('text','...')
   *  <sf-text title="foobar" model="person" key="name" schema="schema"></sf-text>
   *
   * @param {string}  type The type of the directive, resulting directive will have sf- prefixed
   * @param {string}  templateUrl
   * @param {boolean} transclude (optional) sets transclude option of directive, defaults to false.
   */
  this.createDirective = createManualDirective;

  /**
   * Same as createDirective, but takes an object where key is 'type' and value is 'templateUrl'
   * Useful for batching.
   * @param {Object} mappings
   */
  this.createDirectives = function(mappings) {
    angular.forEach(mappings, function(url, type) {
      createManualDirective(type, url);
    });
  };

  /**
   * Getter for directive mappings
   * Can be used to override a mapping or add a rule
   * @param {string} name (optional) defaults to defaultDecorator
   * @return {Object} rules and mappings { rules: [],mappings: {}}
   */
  this.directive = function(name) {
    name = name || defaultDecorator;
    return directives[name];
  };

  /**
   * Adds a mapping to an existing decorator.
   * @param {String} name Decorator name
   * @param {String} type Form type for the mapping
   * @param {String} url  The template url
   */
  this.addMapping = function(name, type, url) {
    if (directives[name]) {
      directives[name].mappings[type] = url;
    }
  };

  //Service is just a getter for directive mappings and rules
  this.$get = function() {
    return {
      directive: function(name) {
        return directives[name];
      },
      defaultDecorator: defaultDecorator
    };
  };

  //Create a default directive
  createDirective('sfDecorator');

}]);

/**
 * Schema form service.
 * This service is not that useful outside of schema form directive
 * but makes the code more testable.
 */
angular.module('schemaForm').provider('schemaForm',
['sfPathProvider', function(sfPathProvider) {

  //Creates an default titleMap list from an enum, i.e. a list of strings.
  var enumToTitleMap = function(enm) {
    var titleMap = []; //canonical titleMap format is a list.
    enm.forEach(function(name) {
      titleMap.push({name: name, value: name});
    });
    return titleMap;
  };

  // Takes a titleMap in either object or list format and returns one in
  // in the list format.
  var canonicalTitleMap = function(titleMap, originalEnum) {
    if (!angular.isArray(titleMap)) {
      var canonical = [];
      if (originalEnum) {
        angular.forEach(originalEnum, function(value, index) {
          canonical.push({name: titleMap[value], value: value});
        });
      } else {
        angular.forEach(titleMap, function(name, value) {
          canonical.push({name: name, value: value});
        });
      }
      return canonical;
    }
    return titleMap;
  };

  var defaultFormDefinition = function(name, schema, options) {
    var rules = defaults[schema.type];
    if (rules) {
      var def;
      for (var i = 0; i < rules.length; i++) {
        def = rules[i](name, schema, options);
        //first handler in list that actually returns something is our handler!
        if (def) {
          return def;
        }
      }
    }
  };

  //Creates a form object with all common properties
  var stdFormObj = function(name, schema, options) {
    options = options || {};
    var f = options.global && options.global.formDefaults ?
            angular.copy(options.global.formDefaults) : {};
    if (options.global && options.global.supressPropertyTitles === true) {
      f.title = schema.title;
    } else {
      f.title = schema.title || name;
    }

    if (schema.description) { f.description = schema.description; }
    if (options.required === true || schema.required === true) { f.required = true; }
    if (schema.maxLength) { f.maxlength = schema.maxLength; }
    if (schema.minLength) { f.minlength = schema.maxLength; }
    if (schema.readOnly || schema.readonly) { f.readonly  = true; }
    if (schema.minimum) { f.minimum = schema.minimum + (schema.exclusiveMinimum ? 1 : 0); }
    if (schema.maximum) { f.maximum = schema.maximum - (schema.exclusiveMaximum ? 1 : 0); }

    //Non standard attributes
    if (schema.validationMessage) { f.validationMessage = schema.validationMessage; }
    if (schema.enumNames) { f.titleMap = canonicalTitleMap(schema.enumNames, schema['enum']); }
    f.schema = schema;

    // Ng model options doesn't play nice with undefined, might be defined
    // globally though
    f.ngModelOptions = f.ngModelOptions || {};
    return f;
  };

  var text = function(name, schema, options) {
    if (schema.type === 'string' && !schema['enum']) {
      var f = stdFormObj(name, schema, options);
      f.key  = options.path;
      f.type = 'text';
      options.lookup[sfPathProvider.stringify(options.path)] = f;
      return f;
    }
  };

  //default in json form for number and integer is a text field
  //input type="number" would be more suitable don't ya think?
  var number = function(name, schema, options) {
    if (schema.type === 'number') {
      var f = stdFormObj(name, schema, options);
      f.key  = options.path;
      f.type = 'number';
      options.lookup[sfPathProvider.stringify(options.path)] = f;
      return f;
    }
  };

  var integer = function(name, schema, options) {
    if (schema.type === 'integer') {
      var f = stdFormObj(name, schema, options);
      f.key  = options.path;
      f.type = 'number';
      options.lookup[sfPathProvider.stringify(options.path)] = f;
      return f;
    }
  };

  var checkbox = function(name, schema, options) {
    if (schema.type === 'boolean') {
      var f = stdFormObj(name, schema, options);
      f.key  = options.path;
      f.type = 'checkbox';
      options.lookup[sfPathProvider.stringify(options.path)] = f;
      return f;
    }
  };

  var select = function(name, schema, options) {
    if (schema.type === 'string' && schema['enum']) {
      var f = stdFormObj(name, schema, options);
      f.key  = options.path;
      f.type = 'select';
      if (!f.titleMap) {
        f.titleMap = enumToTitleMap(schema['enum']);
      }
      options.lookup[sfPathProvider.stringify(options.path)] = f;
      return f;
    }
  };

  var checkboxes = function(name, schema, options) {
    if (schema.type === 'array' && schema.items && schema.items['enum']) {
      var f = stdFormObj(name, schema, options);
      f.key  = options.path;
      f.type = 'checkboxes';
      if (!f.titleMap) {
        f.titleMap = enumToTitleMap(schema.items['enum']);
      }
      options.lookup[sfPathProvider.stringify(options.path)] = f;
      return f;
    }
  };

  var fieldset = function(name, schema, options) {
    if (schema.type === 'object') {
      var f   = stdFormObj(name, schema, options);
      f.type  = 'fieldset';
      f.items = [];
      options.lookup[sfPathProvider.stringify(options.path)] = f;

      //recurse down into properties
      angular.forEach(schema.properties, function(v, k) {
        var path = options.path.slice();
        path.push(k);
        if (options.ignore[sfPathProvider.stringify(path)] !== true) {
          var required = schema.required && schema.required.indexOf(k) !== -1;

          var def = defaultFormDefinition(k, v, {
            path: path,
            required: required || false,
            lookup: options.lookup,
            ignore: options.ignore
          });
          if (def) {
            f.items.push(def);
          }
        }
      });

      return f;
    }

  };

  var array = function(name, schema, options) {

    if (schema.type === 'array') {
      var f   = stdFormObj(name, schema, options);
      f.type  = 'array';
      f.key   = options.path;
      options.lookup[sfPathProvider.stringify(options.path)] = f;

      var required = schema.required &&
                     schema.required.indexOf(options.path[options.path.length - 1]) !== -1;

      // The default is to always just create one child. This works since if the
      // schemas items declaration is of type: "object" then we get a fieldset.
      // We also follow json form notatation, adding empty brackets "[]" to
      // signify arrays.

      var arrPath = options.path.slice();
      arrPath.push('');

      f.items = [defaultFormDefinition(name, schema.items, {
        path: arrPath,
        required: required || false,
        lookup: options.lookup,
        ignore: options.ignore,
        global: options.global
      })];

      return f;
    }

  };

  //First sorted by schema type then a list.
  //Order has importance. First handler returning an form snippet will be used.
  var defaults = {
    string:  [select, text],
    object:  [fieldset],
    number:  [number],
    integer: [integer],
    boolean: [checkbox],
    array:   [checkboxes, array]
  };

  var postProcessFn = function(form) { return form; };

  /**
   * Provider API
   */
  this.defaults              = defaults;
  this.stdFormObj            = stdFormObj;
  this.defaultFormDefinition = defaultFormDefinition;

  /**
   * Register a post process function.
   * This function is called with the fully merged
   * form definition (i.e. after merging with schema)
   * and whatever it returns is used as form.
   */
  this.postProcess = function(fn) {
    postProcessFn = fn;
  };

  /**
   * Append default form rule
   * @param {string}   type json schema type
   * @param {Function} rule a function(propertyName,propertySchema,options) that returns a form
   *                        definition or undefined
   */
  this.appendRule = function(type, rule) {
    if (!defaults[type]) {
      defaults[type] = [];
    }
    defaults[type].push(rule);
  };

  /**
   * Prepend default form rule
   * @param {string}   type json schema type
   * @param {Function} rule a function(propertyName,propertySchema,options) that returns a form
   *                        definition or undefined
   */
  this.prependRule = function(type, rule) {
    if (!defaults[type]) {
      defaults[type] = [];
    }
    defaults[type].unshift(rule);
  };

  /**
   * Utility function to create a standard form object.
   * This does *not* set the type of the form but rather all shared attributes.
   * You probably want to start your rule with creating the form with this method
   * then setting type and any other values you need.
   * @param {Object} schema
   * @param {Object} options
   * @return {Object} a form field defintion
   */
  this.createStandardForm = stdFormObj;
  /* End Provider API */

  this.$get = function() {

    var service = {};

    service.merge = function(schema, form, ignore, options, readonly) {
      form  = form || ['*'];
      options = options || {};

      // Get readonly from root object
      readonly = readonly || schema.readonly || schema.readOnly;

      var stdForm = service.defaults(schema, ignore, options);

      //simple case, we have a "*", just put the stdForm there
      var idx = form.indexOf('*');
      if (idx !== -1) {
        form  = form.slice(0, idx)
                    .concat(stdForm.form)
                    .concat(form.slice(idx + 1));
      }

      //ok let's merge!
      //We look at the supplied form and extend it with schema standards
      var lookup = stdForm.lookup;

      return postProcessFn(form.map(function(obj) {

        //handle the shortcut with just a name
        if (typeof obj === 'string') {
          obj = {key: obj};
        }

        if (obj.key) {
          if (typeof obj.key === 'string') {
            obj.key = sfPathProvider.parse(obj.key);
          }
        }

        //If it has a titleMap make sure it's a list
        if (obj.titleMap) {
          obj.titleMap = canonicalTitleMap(obj.titleMap);
        }

        //
        if (obj.itemForm) {
          obj.items = [];
          var str = sfPathProvider.stringify(obj.key);
          var stdForm = lookup[str];
          angular.forEach(stdForm.items, function(item) {
            var o = angular.copy(obj.itemForm);
            o.key = item.key;
            obj.items.push(o);
          });
        }

        //extend with std form from schema.

        if (obj.key) {
          var strid = sfPathProvider.stringify(obj.key);
          if (lookup[strid]) {
            obj = angular.extend(lookup[strid], obj);
          }
        }

        // Are we inheriting readonly?
        if (readonly === true) { // Inheriting false is not cool.
          obj.readonly = true;
        }

        //if it's a type with items, merge 'em!
        if (obj.items) {
          obj.items = service.merge(schema, obj.items, ignore, options, obj.readonly);
        }

        //if its has tabs, merge them also!
        if (obj.tabs) {
          angular.forEach(obj.tabs, function(tab) {
            tab.items = service.merge(schema, tab.items, ignore, options, obj.readonly);
          });
        }

        // Special case: checkbox
        // Since have to ternary state we need a default
        if (obj.type === 'checkbox' && angular.isUndefined(obj.schema['default'])) {
          obj.schema['default'] = false;
        }

        return obj;
      }));
    };

    /**
     * Create form defaults from schema
     */
    service.defaults = function(schema, ignore, globalOptions) {
      var form   = [];
      var lookup = {}; //Map path => form obj for fast lookup in merging
      ignore = ignore || {};
      globalOptions = globalOptions || {};

      if (schema.type === 'object') {
        angular.forEach(schema.properties, function(v, k) {
          if (ignore[k] !== true) {
            var required = schema.required && schema.required.indexOf(k) !== -1;
            var def = defaultFormDefinition(k, v, {
              path: [k],         // Path to this property in bracket notation.
              lookup: lookup,    // Extra map to register with. Optimization for merger.
              ignore: ignore,    // The ignore list of paths (sans root level name)
              required: required, // Is it required? (v4 json schema style)
              global: globalOptions // Global options, including form defaults
            });
            if (def) {
              form.push(def);
            }
          }
        });

      } else {
        throw new Error('Not implemented. Only type "object" allowed at root level of schema.');
      }
      return {form: form, lookup: lookup};
    };

    //Utility functions
    /**
     * Traverse a schema, applying a function(schema,path) on every sub schema
     * i.e. every property of an object.
     */
    service.traverseSchema = function(schema, fn, path, ignoreArrays) {
      ignoreArrays = angular.isDefined(ignoreArrays) ? ignoreArrays : true;

      path = path || [];

      var traverse = function(schema, fn, path) {
        fn(schema, path);
        angular.forEach(schema.properties, function(prop, name) {
          var currentPath = path.slice();
          currentPath.push(name);
          traverse(prop, fn, currentPath);
        });

        //Only support type "array" which have a schema as "items".
        if (!ignoreArrays && schema.items) {
          var arrPath = path.slice(); arrPath.push('');
          traverse(schema.items, fn, arrPath);
        }
      };

      traverse(schema, fn, path || []);
    };

    service.traverseForm = function(form, fn) {
      fn(form);
      angular.forEach(form.items, function(f) {
        service.traverseForm(f, fn);
      });

      if (form.tabs) {
        angular.forEach(form.tabs, function(tab) {
          angular.forEach(tab.items, function(f) {
            service.traverseForm(f, fn);
          });
        });
      }
    };

    return service;
  };

}]);

/*  Common code for validating a value against its form and schema definition */
/* global tv4 */
angular.module('schemaForm').factory('sfValidator', [function() {

  var validator = {};

  /**
   * Validate a value against its form definition and schema.
   * The value should either be of proper type or a string, some type
   * coercion is applied.
   *
   * @param {Object} form A merged form definition, i.e. one with a schema.
   * @param {Any} value the value to validate.
   * @return a tv4js result object.
   */
  validator.validate = function(form, value) {
    if (!form) {
      return {valid: true};
    }
    var schema = form.schema;

    if (!schema) {
      return {valid: true};
    }

    // Input of type text and textareas will give us a viewValue of ''
    // when empty, this is a valid value in a schema and does not count as something
    // that breaks validation of 'required'. But for our own sanity an empty field should
    // not validate if it's required.
    if (value === '') {
      value = undefined;
    }

    // Numbers fields will give a null value, which also means empty field
    if (form.type === 'number' && value === null) {
      value = undefined;
    }

    // Version 4 of JSON Schema has the required property not on the
    // property itself but on the wrapping object. Since we like to test
    // only this property we wrap it in a fake object.
    var wrap = {type: 'object', 'properties': {}};
    var propName = form.key[form.key.length - 1];
    wrap.properties[propName] = schema;

    if (form.required) {
      wrap.required = [propName];
    }
    var valueWrap = {};
    if (angular.isDefined(value)) {
      valueWrap[propName] = value;
    }
    return tv4.validateResult(valueWrap, wrap);

  };

  return validator;
}]);

/**
 * Directive that handles the model arrays
 */
angular.module('schemaForm').directive('sfArray', ['sfSelect', 'schemaForm', 'sfValidator',
  function(sfSelect, schemaForm, sfValidator) {

    var setIndex = function(index) {
      return function(form) {
        if (form.key) {
          form.key[form.key.indexOf('')] = index;
        }
      };
    };

    return {
      restrict: 'A',
      scope: true,
      require: '?ngModel',
      link: function(scope, element, attrs, ngModel) {
        var formDefCache = {};

        // Watch for the form definition and then rewrite it.
        // It's the (first) array part of the key, '[]' that needs a number
        // corresponding to an index of the form.
        var once = scope.$watch(attrs.sfArray, function(form) {

          // An array model always needs a key so we know what part of the model
          // to look at. This makes us a bit incompatible with JSON Form, on the
          // other hand it enables two way binding.
          var list = sfSelect(form.key, scope.model);

          // Since ng-model happily creates objects in a deep path when setting a
          // a value but not arrays we need to create the array.
          if (angular.isUndefined(list)) {
            list = [];
            sfSelect(form.key, scope.model, list);
          }
          scope.modelArray = list;

          // Arrays with titleMaps, i.e. checkboxes doesn't have items.
          if (form.items) {

            // To be more compatible with JSON Form we support an array of items
            // in the form definition of "array" (the schema just a value).
            // for the subforms code to work this means we wrap everything in a
            // section. Unless there is just one.
            var subForm = form.items[0];
            if (form.items.length > 1) {
              subForm = {
                type: 'section',
                items: form.items.map(function(item){
                  item.ngModelOptions = form.ngModelOptions;
                  item.readonly = form.readonly;
                  return item;
                })
              };
            }

          }

          // We ceate copies of the form on demand, caching them for
          // later requests
          scope.copyWithIndex = function(index) {
            if (!formDefCache[index]) {
              if (subForm) {
                var copy = angular.copy(subForm);
                copy.arrayIndex = index;
                schemaForm.traverseForm(copy, setIndex(index));
                formDefCache[index] = copy;
              }
            }
            return formDefCache[index];
          };

          scope.appendToArray = function() {
            var len = list.length;
            var copy = scope.copyWithIndex(len);
            schemaForm.traverseForm(copy, function(part) {
              if (part.key && angular.isDefined(part['default'])) {
                sfSelect(part.key, scope.model, part['default']);
              }
            });

            // If there are no defaults nothing is added so we need to initialize
            // the array. undefined for basic values, {} or [] for the others.
            if (len === list.length) {
              var type = sfSelect('schema.items.type', form);
              var dflt;
              if (type === 'object') {
                dflt = {};
              } else if (type === 'array') {
                dflt = [];
              }
              list.push(dflt);
            }

            // Trigger validation.
            if (scope.validateArray) {
              scope.validateArray();
            }
            return list;
          };

          scope.deleteFromArray = function(index) {
            list.splice(index, 1);

            // Trigger validation.
            if (scope.validateArray) {
              scope.validateArray();
            }
            return list;
          };

          // Always start with one empty form unless configured otherwise.
          // Special case: don't do it if form has a titleMap
          if (!form.titleMap && form.startEmpty !== true && list.length === 0) {
            scope.appendToArray();
          }

          // Title Map handling
          // If form has a titleMap configured we'd like to enable looping over
          // titleMap instead of modelArray, this is used for intance in
          // checkboxes. So instead of variable number of things we like to create
          // a array value from a subset of values in the titleMap.
          // The problem here is that ng-model on a checkbox doesn't really map to
          // a list of values. This is here to fix that.
          if (form.titleMap && form.titleMap.length > 0) {
            scope.titleMapValues = [];

            // We watch the model for changes and the titleMapValues to reflect
            // the modelArray
            var updateTitleMapValues = function(arr) {
              scope.titleMapValues = [];
              arr = arr || [];

              form.titleMap.forEach(function(item) {
                scope.titleMapValues.push(arr.indexOf(item.value) !== -1);
              });

            };
            //Catch default values
            updateTitleMapValues(scope.modelArray);
            scope.$watchCollection('modelArray', updateTitleMapValues);

            //To get two way binding we also watch our titleMapValues
            scope.$watchCollection('titleMapValues', function(vals) {
              if (vals) {
                var arr = scope.modelArray;

                // Apparently the fastest way to clear an array, readable too.
                // http://jsperf.com/array-destroy/32
                while (arr.length > 0) {
                  arr.shift();
                }

                form.titleMap.forEach(function(item, index) {
                  if (vals[index]) {
                    arr.push(item.value);
                  }
                });

              }
            });
          }

          // If there is a ngModel present we need to validate when asked.
          if (ngModel) {
            var error;

            scope.validateArray = function() {
              // The actual content of the array is validated by each field
              // so we settle for checking validations specific to arrays

              // Since we prefill with empty arrays we can get the funny situation
              // where the array is required but empty in the gui but still validates.
              // Thats why we check the length.
              var result = sfValidator.validate(
                form,
                scope.modelArray.length > 0 ? scope.modelArray : undefined
              );
              if (result.valid === false &&
                  result.error &&
                  (result.error.dataPath === '' ||
                  result.error.dataPath === '/' + form.key[form.key.length - 1])) {

                // Set viewValue to trigger $dirty on field. If someone knows a
                // a better way to do it please tell.
                ngModel.$setViewValue(scope.modelArray);
                error = result.error;
                ngModel.$setValidity('schema', false);

              } else {
                ngModel.$setValidity('schema', true);
              }
            };

            scope.$on('schemaFormValidate', scope.validateArray);

            scope.hasSuccess = function() {
              return ngModel.$valid && !ngModel.$pristine;
            };

            scope.hasError = function() {
              return ngModel.$invalid;
            };

            scope.schemaError = function() {
              return error;
            };

          }

          once();
        });
      }
    };
  }
]);

/**
 * A version of ng-changed that only listens if
 * there is actually a onChange defined on the form
 *
 * Takes the form definition as argument.
 * If the form definition has a "onChange" defined as either a function or
 */
angular.module('schemaForm').directive('sfChanged', function() {
  return {
    require: 'ngModel',
    restrict: 'AC',
    scope: false,
    link: function(scope, element, attrs, ctrl) {
      var form = scope.$eval(attrs.sfChanged);
      //"form" is really guaranteed to be here since the decorator directive
      //waits for it. But best be sure.
      if (form && form.onChange) {
        ctrl.$viewChangeListeners.push(function() {
          if (angular.isFunction(form.onChange)) {
            form.onChange(ctrl.$modelValue, form);
          } else {
            scope.evalExpr(form.onChange, {'modelValue': ctrl.$modelValue, form: form});
          }
        });
      }
    }
  };
});

/*
FIXME: real documentation
<form sf-form="form"  sf-schema="schema" sf-decorator="foobar"></form>
*/

angular.module('schemaForm')
       .directive('sfSchema',
['$compile', 'schemaForm', 'schemaFormDecorators', 'sfSelect',
  function($compile,  schemaForm,  schemaFormDecorators, sfSelect) {

    var SNAKE_CASE_REGEXP = /[A-Z]/g;
    var snakeCase = function(name, separator) {
      separator = separator || '_';
      return name.replace(SNAKE_CASE_REGEXP, function(letter, pos) {
        return (pos ? separator : '') + letter.toLowerCase();
      });
    };

    return {
      scope: {
        schema: '=sfSchema',
        initialForm: '=sfForm',
        model: '=sfModel',
        options: '=sfOptions'
      },
      controller: ['$scope', function($scope) {
        this.evalInParentScope = function(expr, locals) {
          return $scope.$parent.$eval(expr, locals);
        };
      }],
      replace: false,
      restrict: 'A',
      transclude: true,
      require: '?form',
      link: function(scope, element, attrs, formCtrl, transclude) {

        //expose form controller on scope so that we don't force authors to use name on form
        scope.formCtrl = formCtrl;

        //We'd like to handle existing markup,
        //besides using it in our template we also
        //check for ng-model and add that to an ignore list
        //i.e. even if form has a definition for it or form is ["*"]
        //we don't generate it.
        var ignore = {};
        transclude(scope, function(clone) {
          clone.addClass('schema-form-ignore');
          element.prepend(clone);

          if (element[0].querySelectorAll) {
            var models = element[0].querySelectorAll('[ng-model]');
            if (models) {
              for (var i = 0; i < models.length; i++) {
                var key = models[i].getAttribute('ng-model');
                //skip first part before .
                ignore[key.substring(key.indexOf('.') + 1)] = true;
              }
            }
          }
        });
        //Since we are dependant on up to three
        //attributes we'll do a common watch
        var lastDigest = {};

        scope.$watch(function() {

          var schema = scope.schema;
          var form   = scope.initialForm || ['*'];

          //The check for schema.type is to ensure that schema is not {}
          if (form && schema && schema.type &&
              (lastDigest.form !== form || lastDigest.schema !== schema) &&
              Object.keys(schema.properties).length > 0) {
            lastDigest.schema = schema;
            lastDigest.form = form;

            var merged = schemaForm.merge(schema, form, ignore, scope.options);
            var frag = document.createDocumentFragment();

            //make the form available to decorators
            scope.schemaForm  = {form:  merged, schema: schema};

            //clean all but pre existing html.
            element.children(':not(.schema-form-ignore)').remove();

            //Create directives from the form definition
            angular.forEach(merged,function(obj,i){
              var n = document.createElement(attrs.sfDecorator || snakeCase(schemaFormDecorators.defaultDecorator,'-'));
              n.setAttribute('form','schemaForm.form['+i+']');
              var slot;
              try {
                slot = element[0].querySelector('*[sf-insert-field="' + obj.key + '"]');
              } catch(err) {
                // field insertion not supported for complex keys
                slot = null;
              }
              if(slot) {
                slot.innerHTML = "";
                slot.appendChild(n);  
              } else {
                frag.appendChild(n);
              }
            });

            element[0].appendChild(frag);

            //compile only children
            $compile(element.children())(scope);

            //ok, now that that is done let's set any defaults
            schemaForm.traverseSchema(schema, function(prop, path) {
              if (angular.isDefined(prop['default'])) {
                var val = sfSelect(path, scope.model);
                if (angular.isUndefined(val)) {
                  sfSelect(path, scope.model, prop['default']);
                }
              }
            });
          }
        });
      }
    };
  }
]);

angular.module('schemaForm').directive('schemaValidate', ['sfValidator', function(sfValidator) {
  return {
    restrict: 'A',
    scope: false,
    // We want the link function to be *after* the input directives link function so we get access
    // the parsed value, ex. a number instead of a string
    priority: 1000,
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      //Since we have scope false this is the same scope
      //as the decorator
      scope.ngModel = ngModel;

      var error = null;

      var getForm = function() {
        if (!form) {
          form = scope.$eval(attrs.schemaValidate);
        }
        return form;
      };
      var form   = getForm();

      // Validate against the schema.

      // Get in last of the parses so the parsed value has the correct type.
      if (ngModel.$validators) { // Angular 1.3
        ngModel.$validators.schema = function(value) {
          var result = sfValidator.validate(getForm(), value);
          error = result.error;
          return result.valid;
        };
      } else {

        // Angular 1.2
        ngModel.$parsers.push(function(viewValue) {
          form = getForm();
          //Still might be undefined
          if (!form) {
            return viewValue;
          }

          var result =  sfValidator.validate(form, viewValue);

          if (result.valid) {
            // it is valid
            ngModel.$setValidity('schema', true);
            return viewValue;
          } else {
            // it is invalid, return undefined (no model update)
            ngModel.$setValidity('schema', false);
            error = result.error;
            return undefined;
          }
        });
      }


      // Listen to an event so we can validate the input on request
      scope.$on('schemaFormValidate', function() {

        if (ngModel.$validate) {
          ngModel.$validate();
          if (ngModel.$invalid) { // The field must be made dirty so the error message is displayed
            ngModel.$dirty = true;
            ngModel.$pristine = false;
          }
        } else {
          ngModel.$setViewValue(ngModel.$viewValue);
        }
      });

      //This works since we now we're inside a decorator and that this is the decorators scope.
      //If $pristine and empty don't show success (even if it's valid)
      scope.hasSuccess = function() {
        return ngModel.$valid && (!ngModel.$pristine || !ngModel.$isEmpty(ngModel.$modelValue));
      };

      scope.hasError = function() {
        return ngModel.$invalid && !ngModel.$pristine;
      };

      scope.schemaError = function() {
        return error;
      };

    }
  };
}]);

},{}],"/Users/sbellity/code/h/instant-win/node_modules/objectpath/index.js":[function(require,module,exports){
module.exports = require('./lib/ObjectPath.js').ObjectPath;

},{"./lib/ObjectPath.js":"/Users/sbellity/code/h/instant-win/node_modules/objectpath/lib/ObjectPath.js"}],"/Users/sbellity/code/h/instant-win/node_modules/objectpath/lib/ObjectPath.js":[function(require,module,exports){
'use strict';

;!function(undefined) {

	var ObjectPath = {
		parse: function(str){
			if(typeof str !== 'string'){
				throw new TypeError('ObjectPath.parse must be passed a string');
			}

			var i = 0;
			var parts = [];
			var d, b, q, c;
			while (i < str.length){
				d = str.indexOf('.', i);
				b = str.indexOf('[', i);

				// we've reached the end
				if (d === -1 && b === -1){
					parts.push(str.slice(i, str.length));
					i = str.length;
				}

				// dots
				else if (b === -1 || (d !== -1 && d < b)) {
					parts.push(str.slice(i, d));
					i = d + 1;
				}

				// brackets
				else {
					if (b > i){
						parts.push(str.slice(i, b));
						i = b;
					}
					q = str.slice(b+1, b+2);
					if (q !== '"' && q !=='\'') {
						c = str.indexOf(']', b);
						if (c === -1) c = str.length;
						parts.push(str.slice(i + 1, c));
						i = (str.slice(c + 1, c + 2) === '.') ? c + 2 : c + 1;
					} else {
						c = str.indexOf(q+']', b);
						if (c === -1) c = str.length;
						while (str.slice(c - 1, c) === '\\' && b < str.length){
							b++;
							c = str.indexOf(q+']', b);
						}
						parts.push(str.slice(i + 2, c).replace(new RegExp('\\'+q,'g'), q));
						i = (str.slice(c + 2, c + 3) === '.') ? c + 3 : c + 2;
					}
				}
			}
			return parts;
		},

		// root === true : auto calculate root; must be dot-notation friendly
		// root String : the string to use as root
		stringify: function(arr, quote){

			if(!Array.isArray(arr))
				arr = [arr.toString()];

			quote = quote === '"' ? '"' : '\'';

			return arr.map(function(n){ return '[' + quote + (n.toString()).replace(new RegExp(quote, 'g'), '\\' + quote) + quote + ']'; }).join('');
		},

		normalize: function(data, quote){
			return ObjectPath.stringify(Array.isArray(data) ? data : ObjectPath.parse(data), quote);
		}
	};

	// AMD
	if (typeof define === 'function' && define.amd) {
		define(function() {
			return ObjectPath;
		});
	}

	// CommonJS
	else if (typeof exports === 'object') {
		exports.ObjectPath = ObjectPath;
	}

	// Angular
	else if (typeof angular === 'object') {
		angular.module('ObjectPath', []).provider('ObjectPath', function(){
			this.parse = ObjectPath.parse;
			this.stringify = ObjectPath.stringify;
			this.normalize = ObjectPath.normalize;
			this.$get = function(){
				return ObjectPath;
			};
		});
	}

	// Browser global.
	else {
		window.ObjectPath = ObjectPath;
	}
}();

},{}],"/Users/sbellity/code/h/instant-win/node_modules/tv4/tv4.js":[function(require,module,exports){
/*
Author: Geraint Luff and others
Year: 2013

This code is released into the "public domain" by its author(s).  Anybody may use, alter and distribute the code without restriction.  The author makes no guarantees, and takes no liability of any kind for use of this code.

If you find a bug or make an improvement, it would be courteous to let the author know, but it is not compulsory.
*/
(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else if (typeof module !== 'undefined' && module.exports){
    // CommonJS. Define export.
    module.exports = factory();
  } else {
    // Browser globals
    global.tv4 = factory();
  }
}(this, function () {

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys?redirectlocale=en-US&redirectslug=JavaScript%2FReference%2FGlobal_Objects%2FObject%2Fkeys
if (!Object.keys) {
	Object.keys = (function () {
		var hasOwnProperty = Object.prototype.hasOwnProperty,
			hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
			dontEnums = [
				'toString',
				'toLocaleString',
				'valueOf',
				'hasOwnProperty',
				'isPrototypeOf',
				'propertyIsEnumerable',
				'constructor'
			],
			dontEnumsLength = dontEnums.length;

		return function (obj) {
			if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) {
				throw new TypeError('Object.keys called on non-object');
			}

			var result = [];

			for (var prop in obj) {
				if (hasOwnProperty.call(obj, prop)) {
					result.push(prop);
				}
			}

			if (hasDontEnumBug) {
				for (var i=0; i < dontEnumsLength; i++) {
					if (hasOwnProperty.call(obj, dontEnums[i])) {
						result.push(dontEnums[i]);
					}
				}
			}
			return result;
		};
	})();
}
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
if (!Object.create) {
	Object.create = (function(){
		function F(){}

		return function(o){
			if (arguments.length !== 1) {
				throw new Error('Object.create implementation only accepts one parameter.');
			}
			F.prototype = o;
			return new F();
		};
	})();
}
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray?redirectlocale=en-US&redirectslug=JavaScript%2FReference%2FGlobal_Objects%2FArray%2FisArray
if(!Array.isArray) {
	Array.isArray = function (vArg) {
		return Object.prototype.toString.call(vArg) === "[object Array]";
	};
}
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf?redirectlocale=en-US&redirectslug=JavaScript%2FReference%2FGlobal_Objects%2FArray%2FindexOf
if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
		if (this === null) {
			throw new TypeError();
		}
		var t = Object(this);
		var len = t.length >>> 0;

		if (len === 0) {
			return -1;
		}
		var n = 0;
		if (arguments.length > 1) {
			n = Number(arguments[1]);
			if (n !== n) { // shortcut for verifying if it's NaN
				n = 0;
			} else if (n !== 0 && n !== Infinity && n !== -Infinity) {
				n = (n > 0 || -1) * Math.floor(Math.abs(n));
			}
		}
		if (n >= len) {
			return -1;
		}
		var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
		for (; k < len; k++) {
			if (k in t && t[k] === searchElement) {
				return k;
			}
		}
		return -1;
	};
}

// Grungey Object.isFrozen hack
if (!Object.isFrozen) {
	Object.isFrozen = function (obj) {
		var key = "tv4_test_frozen_key";
		while (obj.hasOwnProperty(key)) {
			key += Math.random();
		}
		try {
			obj[key] = true;
			delete obj[key];
			return false;
		} catch (e) {
			return true;
		}
	};
}
// Based on: https://github.com/geraintluff/uri-templates, but with all the de-substitution stuff removed

var uriTemplateGlobalModifiers = {
	"+": true,
	"#": true,
	".": true,
	"/": true,
	";": true,
	"?": true,
	"&": true
};
var uriTemplateSuffices = {
	"*": true
};

function notReallyPercentEncode(string) {
	return encodeURI(string).replace(/%25[0-9][0-9]/g, function (doubleEncoded) {
		return "%" + doubleEncoded.substring(3);
	});
}

function uriTemplateSubstitution(spec) {
	var modifier = "";
	if (uriTemplateGlobalModifiers[spec.charAt(0)]) {
		modifier = spec.charAt(0);
		spec = spec.substring(1);
	}
	var separator = "";
	var prefix = "";
	var shouldEscape = true;
	var showVariables = false;
	var trimEmptyString = false;
	if (modifier === '+') {
		shouldEscape = false;
	} else if (modifier === ".") {
		prefix = ".";
		separator = ".";
	} else if (modifier === "/") {
		prefix = "/";
		separator = "/";
	} else if (modifier === '#') {
		prefix = "#";
		shouldEscape = false;
	} else if (modifier === ';') {
		prefix = ";";
		separator = ";";
		showVariables = true;
		trimEmptyString = true;
	} else if (modifier === '?') {
		prefix = "?";
		separator = "&";
		showVariables = true;
	} else if (modifier === '&') {
		prefix = "&";
		separator = "&";
		showVariables = true;
	}

	var varNames = [];
	var varList = spec.split(",");
	var varSpecs = [];
	var varSpecMap = {};
	for (var i = 0; i < varList.length; i++) {
		var varName = varList[i];
		var truncate = null;
		if (varName.indexOf(":") !== -1) {
			var parts = varName.split(":");
			varName = parts[0];
			truncate = parseInt(parts[1], 10);
		}
		var suffices = {};
		while (uriTemplateSuffices[varName.charAt(varName.length - 1)]) {
			suffices[varName.charAt(varName.length - 1)] = true;
			varName = varName.substring(0, varName.length - 1);
		}
		var varSpec = {
			truncate: truncate,
			name: varName,
			suffices: suffices
		};
		varSpecs.push(varSpec);
		varSpecMap[varName] = varSpec;
		varNames.push(varName);
	}
	var subFunction = function (valueFunction) {
		var result = "";
		var startIndex = 0;
		for (var i = 0; i < varSpecs.length; i++) {
			var varSpec = varSpecs[i];
			var value = valueFunction(varSpec.name);
			if (value === null || value === undefined || (Array.isArray(value) && value.length === 0) || (typeof value === 'object' && Object.keys(value).length === 0)) {
				startIndex++;
				continue;
			}
			if (i === startIndex) {
				result += prefix;
			} else {
				result += (separator || ",");
			}
			if (Array.isArray(value)) {
				if (showVariables) {
					result += varSpec.name + "=";
				}
				for (var j = 0; j < value.length; j++) {
					if (j > 0) {
						result += varSpec.suffices['*'] ? (separator || ",") : ",";
						if (varSpec.suffices['*'] && showVariables) {
							result += varSpec.name + "=";
						}
					}
					result += shouldEscape ? encodeURIComponent(value[j]).replace(/!/g, "%21") : notReallyPercentEncode(value[j]);
				}
			} else if (typeof value === "object") {
				if (showVariables && !varSpec.suffices['*']) {
					result += varSpec.name + "=";
				}
				var first = true;
				for (var key in value) {
					if (!first) {
						result += varSpec.suffices['*'] ? (separator || ",") : ",";
					}
					first = false;
					result += shouldEscape ? encodeURIComponent(key).replace(/!/g, "%21") : notReallyPercentEncode(key);
					result += varSpec.suffices['*'] ? '=' : ",";
					result += shouldEscape ? encodeURIComponent(value[key]).replace(/!/g, "%21") : notReallyPercentEncode(value[key]);
				}
			} else {
				if (showVariables) {
					result += varSpec.name;
					if (!trimEmptyString || value !== "") {
						result += "=";
					}
				}
				if (varSpec.truncate != null) {
					value = value.substring(0, varSpec.truncate);
				}
				result += shouldEscape ? encodeURIComponent(value).replace(/!/g, "%21"): notReallyPercentEncode(value);
			}
		}
		return result;
	};
	subFunction.varNames = varNames;
	return {
		prefix: prefix,
		substitution: subFunction
	};
}

function UriTemplate(template) {
	if (!(this instanceof UriTemplate)) {
		return new UriTemplate(template);
	}
	var parts = template.split("{");
	var textParts = [parts.shift()];
	var prefixes = [];
	var substitutions = [];
	var varNames = [];
	while (parts.length > 0) {
		var part = parts.shift();
		var spec = part.split("}")[0];
		var remainder = part.substring(spec.length + 1);
		var funcs = uriTemplateSubstitution(spec);
		substitutions.push(funcs.substitution);
		prefixes.push(funcs.prefix);
		textParts.push(remainder);
		varNames = varNames.concat(funcs.substitution.varNames);
	}
	this.fill = function (valueFunction) {
		var result = textParts[0];
		for (var i = 0; i < substitutions.length; i++) {
			var substitution = substitutions[i];
			result += substitution(valueFunction);
			result += textParts[i + 1];
		}
		return result;
	};
	this.varNames = varNames;
	this.template = template;
}
UriTemplate.prototype = {
	toString: function () {
		return this.template;
	},
	fillFromObject: function (obj) {
		return this.fill(function (varName) {
			return obj[varName];
		});
	}
};
var ValidatorContext = function ValidatorContext(parent, collectMultiple, errorMessages, checkRecursive, trackUnknownProperties) {
	this.missing = [];
	this.missingMap = {};
	this.formatValidators = parent ? Object.create(parent.formatValidators) : {};
	this.schemas = parent ? Object.create(parent.schemas) : {};
	this.collectMultiple = collectMultiple;
	this.errors = [];
	this.handleError = collectMultiple ? this.collectError : this.returnError;
	if (checkRecursive) {
		this.checkRecursive = true;
		this.scanned = [];
		this.scannedFrozen = [];
		this.scannedFrozenSchemas = [];
		this.scannedFrozenValidationErrors = [];
		this.validatedSchemasKey = 'tv4_validation_id';
		this.validationErrorsKey = 'tv4_validation_errors_id';
	}
	if (trackUnknownProperties) {
		this.trackUnknownProperties = true;
		this.knownPropertyPaths = {};
		this.unknownPropertyPaths = {};
	}
	this.errorMessages = errorMessages;
	this.definedKeywords = {};
	if (parent) {
		for (var key in parent.definedKeywords) {
			this.definedKeywords[key] = parent.definedKeywords[key].slice(0);
		}
	}
};
ValidatorContext.prototype.defineKeyword = function (keyword, keywordFunction) {
	this.definedKeywords[keyword] = this.definedKeywords[keyword] || [];
	this.definedKeywords[keyword].push(keywordFunction);
};
ValidatorContext.prototype.createError = function (code, messageParams, dataPath, schemaPath, subErrors) {
	var messageTemplate = this.errorMessages[code] || ErrorMessagesDefault[code];
	if (typeof messageTemplate !== 'string') {
		return new ValidationError(code, "Unknown error code " + code + ": " + JSON.stringify(messageParams), messageParams, dataPath, schemaPath, subErrors);
	}
	// Adapted from Crockford's supplant()
	var message = messageTemplate.replace(/\{([^{}]*)\}/g, function (whole, varName) {
		var subValue = messageParams[varName];
		return typeof subValue === 'string' || typeof subValue === 'number' ? subValue : whole;
	});
	return new ValidationError(code, message, messageParams, dataPath, schemaPath, subErrors);
};
ValidatorContext.prototype.returnError = function (error) {
	return error;
};
ValidatorContext.prototype.collectError = function (error) {
	if (error) {
		this.errors.push(error);
	}
	return null;
};
ValidatorContext.prototype.prefixErrors = function (startIndex, dataPath, schemaPath) {
	for (var i = startIndex; i < this.errors.length; i++) {
		this.errors[i] = this.errors[i].prefixWith(dataPath, schemaPath);
	}
	return this;
};
ValidatorContext.prototype.banUnknownProperties = function () {
	for (var unknownPath in this.unknownPropertyPaths) {
		var error = this.createError(ErrorCodes.UNKNOWN_PROPERTY, {path: unknownPath}, unknownPath, "");
		var result = this.handleError(error);
		if (result) {
			return result;
		}
	}
	return null;
};

ValidatorContext.prototype.addFormat = function (format, validator) {
	if (typeof format === 'object') {
		for (var key in format) {
			this.addFormat(key, format[key]);
		}
		return this;
	}
	this.formatValidators[format] = validator;
};
ValidatorContext.prototype.resolveRefs = function (schema, urlHistory) {
	if (schema['$ref'] !== undefined) {
		urlHistory = urlHistory || {};
		if (urlHistory[schema['$ref']]) {
			return this.createError(ErrorCodes.CIRCULAR_REFERENCE, {urls: Object.keys(urlHistory).join(', ')}, '', '');
		}
		urlHistory[schema['$ref']] = true;
		schema = this.getSchema(schema['$ref'], urlHistory);
	}
	return schema;
};
ValidatorContext.prototype.getSchema = function (url, urlHistory) {
	var schema;
	if (this.schemas[url] !== undefined) {
		schema = this.schemas[url];
		return this.resolveRefs(schema, urlHistory);
	}
	var baseUrl = url;
	var fragment = "";
	if (url.indexOf('#') !== -1) {
		fragment = url.substring(url.indexOf("#") + 1);
		baseUrl = url.substring(0, url.indexOf("#"));
	}
	if (typeof this.schemas[baseUrl] === 'object') {
		schema = this.schemas[baseUrl];
		var pointerPath = decodeURIComponent(fragment);
		if (pointerPath === "") {
			return this.resolveRefs(schema, urlHistory);
		} else if (pointerPath.charAt(0) !== "/") {
			return undefined;
		}
		var parts = pointerPath.split("/").slice(1);
		for (var i = 0; i < parts.length; i++) {
			var component = parts[i].replace(/~1/g, "/").replace(/~0/g, "~");
			if (schema[component] === undefined) {
				schema = undefined;
				break;
			}
			schema = schema[component];
		}
		if (schema !== undefined) {
			return this.resolveRefs(schema, urlHistory);
		}
	}
	if (this.missing[baseUrl] === undefined) {
		this.missing.push(baseUrl);
		this.missing[baseUrl] = baseUrl;
		this.missingMap[baseUrl] = baseUrl;
	}
};
ValidatorContext.prototype.searchSchemas = function (schema, url) {
	if (schema && typeof schema === "object") {
		if (typeof schema.id === "string") {
			if (isTrustedUrl(url, schema.id)) {
				if (this.schemas[schema.id] === undefined) {
					this.schemas[schema.id] = schema;
				}
			}
		}
		for (var key in schema) {
			if (key !== "enum") {
				if (typeof schema[key] === "object") {
					this.searchSchemas(schema[key], url);
				} else if (key === "$ref") {
					var uri = getDocumentUri(schema[key]);
					if (uri && this.schemas[uri] === undefined && this.missingMap[uri] === undefined) {
						this.missingMap[uri] = uri;
					}
				}
			}
		}
	}
};
ValidatorContext.prototype.addSchema = function (url, schema) {
	//overload
	if (typeof url !== 'string' || typeof schema === 'undefined') {
		if (typeof url === 'object' && typeof url.id === 'string') {
			schema = url;
			url = schema.id;
		}
		else {
			return;
		}
	}
	if (url === getDocumentUri(url) + "#") {
		// Remove empty fragment
		url = getDocumentUri(url);
	}
	this.schemas[url] = schema;
	delete this.missingMap[url];
	normSchema(schema, url);
	this.searchSchemas(schema, url);
};

ValidatorContext.prototype.getSchemaMap = function () {
	var map = {};
	for (var key in this.schemas) {
		map[key] = this.schemas[key];
	}
	return map;
};

ValidatorContext.prototype.getSchemaUris = function (filterRegExp) {
	var list = [];
	for (var key in this.schemas) {
		if (!filterRegExp || filterRegExp.test(key)) {
			list.push(key);
		}
	}
	return list;
};

ValidatorContext.prototype.getMissingUris = function (filterRegExp) {
	var list = [];
	for (var key in this.missingMap) {
		if (!filterRegExp || filterRegExp.test(key)) {
			list.push(key);
		}
	}
	return list;
};

ValidatorContext.prototype.dropSchemas = function () {
	this.schemas = {};
	this.reset();
};
ValidatorContext.prototype.reset = function () {
	this.missing = [];
	this.missingMap = {};
	this.errors = [];
};

ValidatorContext.prototype.validateAll = function (data, schema, dataPathParts, schemaPathParts, dataPointerPath) {
	var topLevel;
	schema = this.resolveRefs(schema);
	if (!schema) {
		return null;
	} else if (schema instanceof ValidationError) {
		this.errors.push(schema);
		return schema;
	}

	var startErrorCount = this.errors.length;
	var frozenIndex, scannedFrozenSchemaIndex = null, scannedSchemasIndex = null;
	if (this.checkRecursive && data && typeof data === 'object') {
		topLevel = !this.scanned.length;
		if (data[this.validatedSchemasKey]) {
			var schemaIndex = data[this.validatedSchemasKey].indexOf(schema);
			if (schemaIndex !== -1) {
				this.errors = this.errors.concat(data[this.validationErrorsKey][schemaIndex]);
				return null;
			}
		}
		if (Object.isFrozen(data)) {
			frozenIndex = this.scannedFrozen.indexOf(data);
			if (frozenIndex !== -1) {
				var frozenSchemaIndex = this.scannedFrozenSchemas[frozenIndex].indexOf(schema);
				if (frozenSchemaIndex !== -1) {
					this.errors = this.errors.concat(this.scannedFrozenValidationErrors[frozenIndex][frozenSchemaIndex]);
					return null;
				}
			}
		}
		this.scanned.push(data);
		if (Object.isFrozen(data)) {
			if (frozenIndex === -1) {
				frozenIndex = this.scannedFrozen.length;
				this.scannedFrozen.push(data);
				this.scannedFrozenSchemas.push([]);
			}
			scannedFrozenSchemaIndex = this.scannedFrozenSchemas[frozenIndex].length;
			this.scannedFrozenSchemas[frozenIndex][scannedFrozenSchemaIndex] = schema;
			this.scannedFrozenValidationErrors[frozenIndex][scannedFrozenSchemaIndex] = [];
		} else {
			if (!data[this.validatedSchemasKey]) {
				try {
					Object.defineProperty(data, this.validatedSchemasKey, {
						value: [],
						configurable: true
					});
					Object.defineProperty(data, this.validationErrorsKey, {
						value: [],
						configurable: true
					});
				} catch (e) {
					//IE 7/8 workaround
					data[this.validatedSchemasKey] = [];
					data[this.validationErrorsKey] = [];
				}
			}
			scannedSchemasIndex = data[this.validatedSchemasKey].length;
			data[this.validatedSchemasKey][scannedSchemasIndex] = schema;
			data[this.validationErrorsKey][scannedSchemasIndex] = [];
		}
	}

	var errorCount = this.errors.length;
	var error = this.validateBasic(data, schema, dataPointerPath)
		|| this.validateNumeric(data, schema, dataPointerPath)
		|| this.validateString(data, schema, dataPointerPath)
		|| this.validateArray(data, schema, dataPointerPath)
		|| this.validateObject(data, schema, dataPointerPath)
		|| this.validateCombinations(data, schema, dataPointerPath)
		|| this.validateHypermedia(data, schema, dataPointerPath)
		|| this.validateFormat(data, schema, dataPointerPath)
		|| this.validateDefinedKeywords(data, schema, dataPointerPath)
		|| null;

	if (topLevel) {
		while (this.scanned.length) {
			var item = this.scanned.pop();
			delete item[this.validatedSchemasKey];
		}
		this.scannedFrozen = [];
		this.scannedFrozenSchemas = [];
	}

	if (error || errorCount !== this.errors.length) {
		while ((dataPathParts && dataPathParts.length) || (schemaPathParts && schemaPathParts.length)) {
			var dataPart = (dataPathParts && dataPathParts.length) ? "" + dataPathParts.pop() : null;
			var schemaPart = (schemaPathParts && schemaPathParts.length) ? "" + schemaPathParts.pop() : null;
			if (error) {
				error = error.prefixWith(dataPart, schemaPart);
			}
			this.prefixErrors(errorCount, dataPart, schemaPart);
		}
	}

	if (scannedFrozenSchemaIndex !== null) {
		this.scannedFrozenValidationErrors[frozenIndex][scannedFrozenSchemaIndex] = this.errors.slice(startErrorCount);
	} else if (scannedSchemasIndex !== null) {
		data[this.validationErrorsKey][scannedSchemasIndex] = this.errors.slice(startErrorCount);
	}

	return this.handleError(error);
};
ValidatorContext.prototype.validateFormat = function (data, schema) {
	if (typeof schema.format !== 'string' || !this.formatValidators[schema.format]) {
		return null;
	}
	var errorMessage = this.formatValidators[schema.format].call(null, data, schema);
	if (typeof errorMessage === 'string' || typeof errorMessage === 'number') {
		return this.createError(ErrorCodes.FORMAT_CUSTOM, {message: errorMessage}).prefixWith(null, "format");
	} else if (errorMessage && typeof errorMessage === 'object') {
		return this.createError(ErrorCodes.FORMAT_CUSTOM, {message: errorMessage.message || "?"}, errorMessage.dataPath || null, errorMessage.schemaPath || "/format");
	}
	return null;
};
ValidatorContext.prototype.validateDefinedKeywords = function (data, schema) {
	for (var key in this.definedKeywords) {
		if (typeof schema[key] === 'undefined') {
			continue;
		}
		var validationFunctions = this.definedKeywords[key];
		for (var i = 0; i < validationFunctions.length; i++) {
			var func = validationFunctions[i];
			var result = func(data, schema[key], schema);
			if (typeof result === 'string' || typeof result === 'number') {
				return this.createError(ErrorCodes.KEYWORD_CUSTOM, {key: key, message: result}).prefixWith(null, "format");
			} else if (result && typeof result === 'object') {
				var code = result.code || ErrorCodes.KEYWORD_CUSTOM;
				if (typeof code === 'string') {
					if (!ErrorCodes[code]) {
						throw new Error('Undefined error code (use defineError): ' + code);
					}
					code = ErrorCodes[code];
				}
				var messageParams = (typeof result.message === 'object') ? result.message : {key: key, message: result.message || "?"};
				var schemaPath = result.schemaPath ||( "/" + key.replace(/~/g, '~0').replace(/\//g, '~1'));
				return this.createError(code, messageParams, result.dataPath || null, schemaPath);
			}
		}
	}
	return null;
};

function recursiveCompare(A, B) {
	if (A === B) {
		return true;
	}
	if (typeof A === "object" && typeof B === "object") {
		if (Array.isArray(A) !== Array.isArray(B)) {
			return false;
		} else if (Array.isArray(A)) {
			if (A.length !== B.length) {
				return false;
			}
			for (var i = 0; i < A.length; i++) {
				if (!recursiveCompare(A[i], B[i])) {
					return false;
				}
			}
		} else {
			var key;
			for (key in A) {
				if (B[key] === undefined && A[key] !== undefined) {
					return false;
				}
			}
			for (key in B) {
				if (A[key] === undefined && B[key] !== undefined) {
					return false;
				}
			}
			for (key in A) {
				if (!recursiveCompare(A[key], B[key])) {
					return false;
				}
			}
		}
		return true;
	}
	return false;
}

ValidatorContext.prototype.validateBasic = function validateBasic(data, schema, dataPointerPath) {
	var error;
	if (error = this.validateType(data, schema, dataPointerPath)) {
		return error.prefixWith(null, "type");
	}
	if (error = this.validateEnum(data, schema, dataPointerPath)) {
		return error.prefixWith(null, "type");
	}
	return null;
};

ValidatorContext.prototype.validateType = function validateType(data, schema) {
	if (schema.type === undefined) {
		return null;
	}
	var dataType = typeof data;
	if (data === null) {
		dataType = "null";
	} else if (Array.isArray(data)) {
		dataType = "array";
	}
	var allowedTypes = schema.type;
	if (typeof allowedTypes !== "object") {
		allowedTypes = [allowedTypes];
	}

	for (var i = 0; i < allowedTypes.length; i++) {
		var type = allowedTypes[i];
		if (type === dataType || (type === "integer" && dataType === "number" && (data % 1 === 0))) {
			return null;
		}
	}
	return this.createError(ErrorCodes.INVALID_TYPE, {type: dataType, expected: allowedTypes.join("/")});
};

ValidatorContext.prototype.validateEnum = function validateEnum(data, schema) {
	if (schema["enum"] === undefined) {
		return null;
	}
	for (var i = 0; i < schema["enum"].length; i++) {
		var enumVal = schema["enum"][i];
		if (recursiveCompare(data, enumVal)) {
			return null;
		}
	}
	return this.createError(ErrorCodes.ENUM_MISMATCH, {value: (typeof JSON !== 'undefined') ? JSON.stringify(data) : data});
};

ValidatorContext.prototype.validateNumeric = function validateNumeric(data, schema, dataPointerPath) {
	return this.validateMultipleOf(data, schema, dataPointerPath)
		|| this.validateMinMax(data, schema, dataPointerPath)
		|| this.validateNaN(data, schema, dataPointerPath)
		|| null;
};

ValidatorContext.prototype.validateMultipleOf = function validateMultipleOf(data, schema) {
	var multipleOf = schema.multipleOf || schema.divisibleBy;
	if (multipleOf === undefined) {
		return null;
	}
	if (typeof data === "number") {
		if (data % multipleOf !== 0) {
			return this.createError(ErrorCodes.NUMBER_MULTIPLE_OF, {value: data, multipleOf: multipleOf});
		}
	}
	return null;
};

ValidatorContext.prototype.validateMinMax = function validateMinMax(data, schema) {
	if (typeof data !== "number") {
		return null;
	}
	if (schema.minimum !== undefined) {
		if (data < schema.minimum) {
			return this.createError(ErrorCodes.NUMBER_MINIMUM, {value: data, minimum: schema.minimum}).prefixWith(null, "minimum");
		}
		if (schema.exclusiveMinimum && data === schema.minimum) {
			return this.createError(ErrorCodes.NUMBER_MINIMUM_EXCLUSIVE, {value: data, minimum: schema.minimum}).prefixWith(null, "exclusiveMinimum");
		}
	}
	if (schema.maximum !== undefined) {
		if (data > schema.maximum) {
			return this.createError(ErrorCodes.NUMBER_MAXIMUM, {value: data, maximum: schema.maximum}).prefixWith(null, "maximum");
		}
		if (schema.exclusiveMaximum && data === schema.maximum) {
			return this.createError(ErrorCodes.NUMBER_MAXIMUM_EXCLUSIVE, {value: data, maximum: schema.maximum}).prefixWith(null, "exclusiveMaximum");
		}
	}
	return null;
};

ValidatorContext.prototype.validateNaN = function validateNaN(data) {
	if (typeof data !== "number") {
		return null;
	}
	if (isNaN(data) === true || data === Infinity || data === -Infinity) {
		return this.createError(ErrorCodes.NUMBER_NOT_A_NUMBER, {value: data}).prefixWith(null, "type");
	}
	return null;
};

ValidatorContext.prototype.validateString = function validateString(data, schema, dataPointerPath) {
	return this.validateStringLength(data, schema, dataPointerPath)
		|| this.validateStringPattern(data, schema, dataPointerPath)
		|| null;
};

ValidatorContext.prototype.validateStringLength = function validateStringLength(data, schema) {
	if (typeof data !== "string") {
		return null;
	}
	if (schema.minLength !== undefined) {
		if (data.length < schema.minLength) {
			return this.createError(ErrorCodes.STRING_LENGTH_SHORT, {length: data.length, minimum: schema.minLength}).prefixWith(null, "minLength");
		}
	}
	if (schema.maxLength !== undefined) {
		if (data.length > schema.maxLength) {
			return this.createError(ErrorCodes.STRING_LENGTH_LONG, {length: data.length, maximum: schema.maxLength}).prefixWith(null, "maxLength");
		}
	}
	return null;
};

ValidatorContext.prototype.validateStringPattern = function validateStringPattern(data, schema) {
	if (typeof data !== "string" || schema.pattern === undefined) {
		return null;
	}
	var regexp = new RegExp(schema.pattern);
	if (!regexp.test(data)) {
		return this.createError(ErrorCodes.STRING_PATTERN, {pattern: schema.pattern}).prefixWith(null, "pattern");
	}
	return null;
};
ValidatorContext.prototype.validateArray = function validateArray(data, schema, dataPointerPath) {
	if (!Array.isArray(data)) {
		return null;
	}
	return this.validateArrayLength(data, schema, dataPointerPath)
		|| this.validateArrayUniqueItems(data, schema, dataPointerPath)
		|| this.validateArrayItems(data, schema, dataPointerPath)
		|| null;
};

ValidatorContext.prototype.validateArrayLength = function validateArrayLength(data, schema) {
	var error;
	if (schema.minItems !== undefined) {
		if (data.length < schema.minItems) {
			error = (this.createError(ErrorCodes.ARRAY_LENGTH_SHORT, {length: data.length, minimum: schema.minItems})).prefixWith(null, "minItems");
			if (this.handleError(error)) {
				return error;
			}
		}
	}
	if (schema.maxItems !== undefined) {
		if (data.length > schema.maxItems) {
			error = (this.createError(ErrorCodes.ARRAY_LENGTH_LONG, {length: data.length, maximum: schema.maxItems})).prefixWith(null, "maxItems");
			if (this.handleError(error)) {
				return error;
			}
		}
	}
	return null;
};

ValidatorContext.prototype.validateArrayUniqueItems = function validateArrayUniqueItems(data, schema) {
	if (schema.uniqueItems) {
		for (var i = 0; i < data.length; i++) {
			for (var j = i + 1; j < data.length; j++) {
				if (recursiveCompare(data[i], data[j])) {
					var error = (this.createError(ErrorCodes.ARRAY_UNIQUE, {match1: i, match2: j})).prefixWith(null, "uniqueItems");
					if (this.handleError(error)) {
						return error;
					}
				}
			}
		}
	}
	return null;
};

ValidatorContext.prototype.validateArrayItems = function validateArrayItems(data, schema, dataPointerPath) {
	if (schema.items === undefined) {
		return null;
	}
	var error, i;
	if (Array.isArray(schema.items)) {
		for (i = 0; i < data.length; i++) {
			if (i < schema.items.length) {
				if (error = this.validateAll(data[i], schema.items[i], [i], ["items", i], dataPointerPath + "/" + i)) {
					return error;
				}
			} else if (schema.additionalItems !== undefined) {
				if (typeof schema.additionalItems === "boolean") {
					if (!schema.additionalItems) {
						error = (this.createError(ErrorCodes.ARRAY_ADDITIONAL_ITEMS, {})).prefixWith("" + i, "additionalItems");
						if (this.handleError(error)) {
							return error;
						}
					}
				} else if (error = this.validateAll(data[i], schema.additionalItems, [i], ["additionalItems"], dataPointerPath + "/" + i)) {
					return error;
				}
			}
		}
	} else {
		for (i = 0; i < data.length; i++) {
			if (error = this.validateAll(data[i], schema.items, [i], ["items"], dataPointerPath + "/" + i)) {
				return error;
			}
		}
	}
	return null;
};

ValidatorContext.prototype.validateObject = function validateObject(data, schema, dataPointerPath) {
	if (typeof data !== "object" || data === null || Array.isArray(data)) {
		return null;
	}
	return this.validateObjectMinMaxProperties(data, schema, dataPointerPath)
		|| this.validateObjectRequiredProperties(data, schema, dataPointerPath)
		|| this.validateObjectProperties(data, schema, dataPointerPath)
		|| this.validateObjectDependencies(data, schema, dataPointerPath)
		|| null;
};

ValidatorContext.prototype.validateObjectMinMaxProperties = function validateObjectMinMaxProperties(data, schema) {
	var keys = Object.keys(data);
	var error;
	if (schema.minProperties !== undefined) {
		if (keys.length < schema.minProperties) {
			error = this.createError(ErrorCodes.OBJECT_PROPERTIES_MINIMUM, {propertyCount: keys.length, minimum: schema.minProperties}).prefixWith(null, "minProperties");
			if (this.handleError(error)) {
				return error;
			}
		}
	}
	if (schema.maxProperties !== undefined) {
		if (keys.length > schema.maxProperties) {
			error = this.createError(ErrorCodes.OBJECT_PROPERTIES_MAXIMUM, {propertyCount: keys.length, maximum: schema.maxProperties}).prefixWith(null, "maxProperties");
			if (this.handleError(error)) {
				return error;
			}
		}
	}
	return null;
};

ValidatorContext.prototype.validateObjectRequiredProperties = function validateObjectRequiredProperties(data, schema) {
	if (schema.required !== undefined) {
		for (var i = 0; i < schema.required.length; i++) {
			var key = schema.required[i];
			if (data[key] === undefined) {
				var error = this.createError(ErrorCodes.OBJECT_REQUIRED, {key: key}).prefixWith(null, "" + i).prefixWith(null, "required");
				if (this.handleError(error)) {
					return error;
				}
			}
		}
	}
	return null;
};

ValidatorContext.prototype.validateObjectProperties = function validateObjectProperties(data, schema, dataPointerPath) {
	var error;
	for (var key in data) {
		var keyPointerPath = dataPointerPath + "/" + key.replace(/~/g, '~0').replace(/\//g, '~1');
		var foundMatch = false;
		if (schema.properties !== undefined && schema.properties[key] !== undefined) {
			foundMatch = true;
			if (error = this.validateAll(data[key], schema.properties[key], [key], ["properties", key], keyPointerPath)) {
				return error;
			}
		}
		if (schema.patternProperties !== undefined) {
			for (var patternKey in schema.patternProperties) {
				var regexp = new RegExp(patternKey);
				if (regexp.test(key)) {
					foundMatch = true;
					if (error = this.validateAll(data[key], schema.patternProperties[patternKey], [key], ["patternProperties", patternKey], keyPointerPath)) {
						return error;
					}
				}
			}
		}
		if (!foundMatch) {
			if (schema.additionalProperties !== undefined) {
				if (this.trackUnknownProperties) {
					this.knownPropertyPaths[keyPointerPath] = true;
					delete this.unknownPropertyPaths[keyPointerPath];
				}
				if (typeof schema.additionalProperties === "boolean") {
					if (!schema.additionalProperties) {
						error = this.createError(ErrorCodes.OBJECT_ADDITIONAL_PROPERTIES, {}).prefixWith(key, "additionalProperties");
						if (this.handleError(error)) {
							return error;
						}
					}
				} else {
					if (error = this.validateAll(data[key], schema.additionalProperties, [key], ["additionalProperties"], keyPointerPath)) {
						return error;
					}
				}
			} else if (this.trackUnknownProperties && !this.knownPropertyPaths[keyPointerPath]) {
				this.unknownPropertyPaths[keyPointerPath] = true;
			}
		} else if (this.trackUnknownProperties) {
			this.knownPropertyPaths[keyPointerPath] = true;
			delete this.unknownPropertyPaths[keyPointerPath];
		}
	}
	return null;
};

ValidatorContext.prototype.validateObjectDependencies = function validateObjectDependencies(data, schema, dataPointerPath) {
	var error;
	if (schema.dependencies !== undefined) {
		for (var depKey in schema.dependencies) {
			if (data[depKey] !== undefined) {
				var dep = schema.dependencies[depKey];
				if (typeof dep === "string") {
					if (data[dep] === undefined) {
						error = this.createError(ErrorCodes.OBJECT_DEPENDENCY_KEY, {key: depKey, missing: dep}).prefixWith(null, depKey).prefixWith(null, "dependencies");
						if (this.handleError(error)) {
							return error;
						}
					}
				} else if (Array.isArray(dep)) {
					for (var i = 0; i < dep.length; i++) {
						var requiredKey = dep[i];
						if (data[requiredKey] === undefined) {
							error = this.createError(ErrorCodes.OBJECT_DEPENDENCY_KEY, {key: depKey, missing: requiredKey}).prefixWith(null, "" + i).prefixWith(null, depKey).prefixWith(null, "dependencies");
							if (this.handleError(error)) {
								return error;
							}
						}
					}
				} else {
					if (error = this.validateAll(data, dep, [], ["dependencies", depKey], dataPointerPath)) {
						return error;
					}
				}
			}
		}
	}
	return null;
};

ValidatorContext.prototype.validateCombinations = function validateCombinations(data, schema, dataPointerPath) {
	return this.validateAllOf(data, schema, dataPointerPath)
		|| this.validateAnyOf(data, schema, dataPointerPath)
		|| this.validateOneOf(data, schema, dataPointerPath)
		|| this.validateNot(data, schema, dataPointerPath)
		|| null;
};

ValidatorContext.prototype.validateAllOf = function validateAllOf(data, schema, dataPointerPath) {
	if (schema.allOf === undefined) {
		return null;
	}
	var error;
	for (var i = 0; i < schema.allOf.length; i++) {
		var subSchema = schema.allOf[i];
		if (error = this.validateAll(data, subSchema, [], ["allOf", i], dataPointerPath)) {
			return error;
		}
	}
	return null;
};

ValidatorContext.prototype.validateAnyOf = function validateAnyOf(data, schema, dataPointerPath) {
	if (schema.anyOf === undefined) {
		return null;
	}
	var errors = [];
	var startErrorCount = this.errors.length;
	var oldUnknownPropertyPaths, oldKnownPropertyPaths;
	if (this.trackUnknownProperties) {
		oldUnknownPropertyPaths = this.unknownPropertyPaths;
		oldKnownPropertyPaths = this.knownPropertyPaths;
	}
	var errorAtEnd = true;
	for (var i = 0; i < schema.anyOf.length; i++) {
		if (this.trackUnknownProperties) {
			this.unknownPropertyPaths = {};
			this.knownPropertyPaths = {};
		}
		var subSchema = schema.anyOf[i];

		var errorCount = this.errors.length;
		var error = this.validateAll(data, subSchema, [], ["anyOf", i], dataPointerPath);

		if (error === null && errorCount === this.errors.length) {
			this.errors = this.errors.slice(0, startErrorCount);

			if (this.trackUnknownProperties) {
				for (var knownKey in this.knownPropertyPaths) {
					oldKnownPropertyPaths[knownKey] = true;
					delete oldUnknownPropertyPaths[knownKey];
				}
				for (var unknownKey in this.unknownPropertyPaths) {
					if (!oldKnownPropertyPaths[unknownKey]) {
						oldUnknownPropertyPaths[unknownKey] = true;
					}
				}
				// We need to continue looping so we catch all the property definitions, but we don't want to return an error
				errorAtEnd = false;
				continue;
			}

			return null;
		}
		if (error) {
			errors.push(error.prefixWith(null, "" + i).prefixWith(null, "anyOf"));
		}
	}
	if (this.trackUnknownProperties) {
		this.unknownPropertyPaths = oldUnknownPropertyPaths;
		this.knownPropertyPaths = oldKnownPropertyPaths;
	}
	if (errorAtEnd) {
		errors = errors.concat(this.errors.slice(startErrorCount));
		this.errors = this.errors.slice(0, startErrorCount);
		return this.createError(ErrorCodes.ANY_OF_MISSING, {}, "", "/anyOf", errors);
	}
};

ValidatorContext.prototype.validateOneOf = function validateOneOf(data, schema, dataPointerPath) {
	if (schema.oneOf === undefined) {
		return null;
	}
	var validIndex = null;
	var errors = [];
	var startErrorCount = this.errors.length;
	var oldUnknownPropertyPaths, oldKnownPropertyPaths;
	if (this.trackUnknownProperties) {
		oldUnknownPropertyPaths = this.unknownPropertyPaths;
		oldKnownPropertyPaths = this.knownPropertyPaths;
	}
	for (var i = 0; i < schema.oneOf.length; i++) {
		if (this.trackUnknownProperties) {
			this.unknownPropertyPaths = {};
			this.knownPropertyPaths = {};
		}
		var subSchema = schema.oneOf[i];

		var errorCount = this.errors.length;
		var error = this.validateAll(data, subSchema, [], ["oneOf", i], dataPointerPath);

		if (error === null && errorCount === this.errors.length) {
			if (validIndex === null) {
				validIndex = i;
			} else {
				this.errors = this.errors.slice(0, startErrorCount);
				return this.createError(ErrorCodes.ONE_OF_MULTIPLE, {index1: validIndex, index2: i}, "", "/oneOf");
			}
			if (this.trackUnknownProperties) {
				for (var knownKey in this.knownPropertyPaths) {
					oldKnownPropertyPaths[knownKey] = true;
					delete oldUnknownPropertyPaths[knownKey];
				}
				for (var unknownKey in this.unknownPropertyPaths) {
					if (!oldKnownPropertyPaths[unknownKey]) {
						oldUnknownPropertyPaths[unknownKey] = true;
					}
				}
			}
		} else if (error) {
			errors.push(error);
		}
	}
	if (this.trackUnknownProperties) {
		this.unknownPropertyPaths = oldUnknownPropertyPaths;
		this.knownPropertyPaths = oldKnownPropertyPaths;
	}
	if (validIndex === null) {
		errors = errors.concat(this.errors.slice(startErrorCount));
		this.errors = this.errors.slice(0, startErrorCount);
		return this.createError(ErrorCodes.ONE_OF_MISSING, {}, "", "/oneOf", errors);
	} else {
		this.errors = this.errors.slice(0, startErrorCount);
	}
	return null;
};

ValidatorContext.prototype.validateNot = function validateNot(data, schema, dataPointerPath) {
	if (schema.not === undefined) {
		return null;
	}
	var oldErrorCount = this.errors.length;
	var oldUnknownPropertyPaths, oldKnownPropertyPaths;
	if (this.trackUnknownProperties) {
		oldUnknownPropertyPaths = this.unknownPropertyPaths;
		oldKnownPropertyPaths = this.knownPropertyPaths;
		this.unknownPropertyPaths = {};
		this.knownPropertyPaths = {};
	}
	var error = this.validateAll(data, schema.not, null, null, dataPointerPath);
	var notErrors = this.errors.slice(oldErrorCount);
	this.errors = this.errors.slice(0, oldErrorCount);
	if (this.trackUnknownProperties) {
		this.unknownPropertyPaths = oldUnknownPropertyPaths;
		this.knownPropertyPaths = oldKnownPropertyPaths;
	}
	if (error === null && notErrors.length === 0) {
		return this.createError(ErrorCodes.NOT_PASSED, {}, "", "/not");
	}
	return null;
};

ValidatorContext.prototype.validateHypermedia = function validateCombinations(data, schema, dataPointerPath) {
	if (!schema.links) {
		return null;
	}
	var error;
	for (var i = 0; i < schema.links.length; i++) {
		var ldo = schema.links[i];
		if (ldo.rel === "describedby") {
			var template = new UriTemplate(ldo.href);
			var allPresent = true;
			for (var j = 0; j < template.varNames.length; j++) {
				if (!(template.varNames[j] in data)) {
					allPresent = false;
					break;
				}
			}
			if (allPresent) {
				var schemaUrl = template.fillFromObject(data);
				var subSchema = {"$ref": schemaUrl};
				if (error = this.validateAll(data, subSchema, [], ["links", i], dataPointerPath)) {
					return error;
				}
			}
		}
	}
};

// parseURI() and resolveUrl() are from https://gist.github.com/1088850
//   -  released as public domain by author ("Yaffle") - see comments on gist

function parseURI(url) {
	var m = String(url).replace(/^\s+|\s+$/g, '').match(/^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
	// authority = '//' + user + ':' + pass '@' + hostname + ':' port
	return (m ? {
		href     : m[0] || '',
		protocol : m[1] || '',
		authority: m[2] || '',
		host     : m[3] || '',
		hostname : m[4] || '',
		port     : m[5] || '',
		pathname : m[6] || '',
		search   : m[7] || '',
		hash     : m[8] || ''
	} : null);
}

function resolveUrl(base, href) {// RFC 3986

	function removeDotSegments(input) {
		var output = [];
		input.replace(/^(\.\.?(\/|$))+/, '')
			.replace(/\/(\.(\/|$))+/g, '/')
			.replace(/\/\.\.$/, '/../')
			.replace(/\/?[^\/]*/g, function (p) {
				if (p === '/..') {
					output.pop();
				} else {
					output.push(p);
				}
		});
		return output.join('').replace(/^\//, input.charAt(0) === '/' ? '/' : '');
	}

	href = parseURI(href || '');
	base = parseURI(base || '');

	return !href || !base ? null : (href.protocol || base.protocol) +
		(href.protocol || href.authority ? href.authority : base.authority) +
		removeDotSegments(href.protocol || href.authority || href.pathname.charAt(0) === '/' ? href.pathname : (href.pathname ? ((base.authority && !base.pathname ? '/' : '') + base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1) + href.pathname) : base.pathname)) +
		(href.protocol || href.authority || href.pathname ? href.search : (href.search || base.search)) +
		href.hash;
}

function getDocumentUri(uri) {
	return uri.split('#')[0];
}
function normSchema(schema, baseUri) {
	if (schema && typeof schema === "object") {
		if (baseUri === undefined) {
			baseUri = schema.id;
		} else if (typeof schema.id === "string") {
			baseUri = resolveUrl(baseUri, schema.id);
			schema.id = baseUri;
		}
		if (Array.isArray(schema)) {
			for (var i = 0; i < schema.length; i++) {
				normSchema(schema[i], baseUri);
			}
		} else {
			if (typeof schema['$ref'] === "string") {
				schema['$ref'] = resolveUrl(baseUri, schema['$ref']);
			}
			for (var key in schema) {
				if (key !== "enum") {
					normSchema(schema[key], baseUri);
				}
			}
		}
	}
}

var ErrorCodes = {
	INVALID_TYPE: 0,
	ENUM_MISMATCH: 1,
	ANY_OF_MISSING: 10,
	ONE_OF_MISSING: 11,
	ONE_OF_MULTIPLE: 12,
	NOT_PASSED: 13,
	// Numeric errors
	NUMBER_MULTIPLE_OF: 100,
	NUMBER_MINIMUM: 101,
	NUMBER_MINIMUM_EXCLUSIVE: 102,
	NUMBER_MAXIMUM: 103,
	NUMBER_MAXIMUM_EXCLUSIVE: 104,
	NUMBER_NOT_A_NUMBER: 105,
	// String errors
	STRING_LENGTH_SHORT: 200,
	STRING_LENGTH_LONG: 201,
	STRING_PATTERN: 202,
	// Object errors
	OBJECT_PROPERTIES_MINIMUM: 300,
	OBJECT_PROPERTIES_MAXIMUM: 301,
	OBJECT_REQUIRED: 302,
	OBJECT_ADDITIONAL_PROPERTIES: 303,
	OBJECT_DEPENDENCY_KEY: 304,
	// Array errors
	ARRAY_LENGTH_SHORT: 400,
	ARRAY_LENGTH_LONG: 401,
	ARRAY_UNIQUE: 402,
	ARRAY_ADDITIONAL_ITEMS: 403,
	// Custom/user-defined errors
	FORMAT_CUSTOM: 500,
	KEYWORD_CUSTOM: 501,
	// Schema structure
	CIRCULAR_REFERENCE: 600,
	// Non-standard validation options
	UNKNOWN_PROPERTY: 1000
};
var ErrorCodeLookup = {};
for (var key in ErrorCodes) {
	ErrorCodeLookup[ErrorCodes[key]] = key;
}
var ErrorMessagesDefault = {
	INVALID_TYPE: "Invalid type: {type} (expected {expected})",
	ENUM_MISMATCH: "No enum match for: {value}",
	ANY_OF_MISSING: "Data does not match any schemas from \"anyOf\"",
	ONE_OF_MISSING: "Data does not match any schemas from \"oneOf\"",
	ONE_OF_MULTIPLE: "Data is valid against more than one schema from \"oneOf\": indices {index1} and {index2}",
	NOT_PASSED: "Data matches schema from \"not\"",
	// Numeric errors
	NUMBER_MULTIPLE_OF: "Value {value} is not a multiple of {multipleOf}",
	NUMBER_MINIMUM: "Value {value} is less than minimum {minimum}",
	NUMBER_MINIMUM_EXCLUSIVE: "Value {value} is equal to exclusive minimum {minimum}",
	NUMBER_MAXIMUM: "Value {value} is greater than maximum {maximum}",
	NUMBER_MAXIMUM_EXCLUSIVE: "Value {value} is equal to exclusive maximum {maximum}",
	NUMBER_NOT_A_NUMBER: "Value {value} is not a valid number",
	// String errors
	STRING_LENGTH_SHORT: "String is too short ({length} chars), minimum {minimum}",
	STRING_LENGTH_LONG: "String is too long ({length} chars), maximum {maximum}",
	STRING_PATTERN: "String does not match pattern: {pattern}",
	// Object errors
	OBJECT_PROPERTIES_MINIMUM: "Too few properties defined ({propertyCount}), minimum {minimum}",
	OBJECT_PROPERTIES_MAXIMUM: "Too many properties defined ({propertyCount}), maximum {maximum}",
	OBJECT_REQUIRED: "Missing required property: {key}",
	OBJECT_ADDITIONAL_PROPERTIES: "Additional properties not allowed",
	OBJECT_DEPENDENCY_KEY: "Dependency failed - key must exist: {missing} (due to key: {key})",
	// Array errors
	ARRAY_LENGTH_SHORT: "Array is too short ({length}), minimum {minimum}",
	ARRAY_LENGTH_LONG: "Array is too long ({length}), maximum {maximum}",
	ARRAY_UNIQUE: "Array items are not unique (indices {match1} and {match2})",
	ARRAY_ADDITIONAL_ITEMS: "Additional items not allowed",
	// Format errors
	FORMAT_CUSTOM: "Format validation failed ({message})",
	KEYWORD_CUSTOM: "Keyword failed: {key} ({message})",
	// Schema structure
	CIRCULAR_REFERENCE: "Circular $refs: {urls}",
	// Non-standard validation options
	UNKNOWN_PROPERTY: "Unknown property (not in schema)"
};

function ValidationError(code, message, params, dataPath, schemaPath, subErrors) {
	Error.call(this);
	if (code === undefined) {
		throw new Error ("No code supplied for error: "+ message);
	}
	this.message = message;
	this.params = params;
	this.code = code;
	this.dataPath = dataPath || "";
	this.schemaPath = schemaPath || "";
	this.subErrors = subErrors || null;

	var err = new Error(this.message);
	this.stack = err.stack || err.stacktrace;
	if (!this.stack) {
		try {
			throw err;
		}
		catch(err) {
			this.stack = err.stack || err.stacktrace;
		}
	}
}
ValidationError.prototype = Object.create(Error.prototype);
ValidationError.prototype.constructor = ValidationError;
ValidationError.prototype.name = 'ValidationError';

ValidationError.prototype.prefixWith = function (dataPrefix, schemaPrefix) {
	if (dataPrefix !== null) {
		dataPrefix = dataPrefix.replace(/~/g, "~0").replace(/\//g, "~1");
		this.dataPath = "/" + dataPrefix + this.dataPath;
	}
	if (schemaPrefix !== null) {
		schemaPrefix = schemaPrefix.replace(/~/g, "~0").replace(/\//g, "~1");
		this.schemaPath = "/" + schemaPrefix + this.schemaPath;
	}
	if (this.subErrors !== null) {
		for (var i = 0; i < this.subErrors.length; i++) {
			this.subErrors[i].prefixWith(dataPrefix, schemaPrefix);
		}
	}
	return this;
};

function isTrustedUrl(baseUrl, testUrl) {
	if(testUrl.substring(0, baseUrl.length) === baseUrl){
		var remainder = testUrl.substring(baseUrl.length);
		if ((testUrl.length > 0 && testUrl.charAt(baseUrl.length - 1) === "/")
			|| remainder.charAt(0) === "#"
			|| remainder.charAt(0) === "?") {
			return true;
		}
	}
	return false;
}

var languages = {};
function createApi(language) {
	var globalContext = new ValidatorContext();
	var currentLanguage = language || 'en';
	var api = {
		addFormat: function () {
			globalContext.addFormat.apply(globalContext, arguments);
		},
		language: function (code) {
			if (!code) {
				return currentLanguage;
			}
			if (!languages[code]) {
				code = code.split('-')[0]; // fall back to base language
			}
			if (languages[code]) {
				currentLanguage = code;
				return code; // so you can tell if fall-back has happened
			}
			return false;
		},
		addLanguage: function (code, messageMap) {
			var key;
			for (key in ErrorCodes) {
				if (messageMap[key] && !messageMap[ErrorCodes[key]]) {
					messageMap[ErrorCodes[key]] = messageMap[key];
				}
			}
			var rootCode = code.split('-')[0];
			if (!languages[rootCode]) { // use for base language if not yet defined
				languages[code] = messageMap;
				languages[rootCode] = messageMap;
			} else {
				languages[code] = Object.create(languages[rootCode]);
				for (key in messageMap) {
					if (typeof languages[rootCode][key] === 'undefined') {
						languages[rootCode][key] = messageMap[key];
					}
					languages[code][key] = messageMap[key];
				}
			}
			return this;
		},
		freshApi: function (language) {
			var result = createApi();
			if (language) {
				result.language(language);
			}
			return result;
		},
		validate: function (data, schema, checkRecursive, banUnknownProperties) {
			var context = new ValidatorContext(globalContext, false, languages[currentLanguage], checkRecursive, banUnknownProperties);
			if (typeof schema === "string") {
				schema = {"$ref": schema};
			}
			context.addSchema("", schema);
			var error = context.validateAll(data, schema, null, null, "");
			if (!error && banUnknownProperties) {
				error = context.banUnknownProperties();
			}
			this.error = error;
			this.missing = context.missing;
			this.valid = (error === null);
			return this.valid;
		},
		validateResult: function () {
			var result = {};
			this.validate.apply(result, arguments);
			return result;
		},
		validateMultiple: function (data, schema, checkRecursive, banUnknownProperties) {
			var context = new ValidatorContext(globalContext, true, languages[currentLanguage], checkRecursive, banUnknownProperties);
			if (typeof schema === "string") {
				schema = {"$ref": schema};
			}
			context.addSchema("", schema);
			context.validateAll(data, schema, null, null, "");
			if (banUnknownProperties) {
				context.banUnknownProperties();
			}
			var result = {};
			result.errors = context.errors;
			result.missing = context.missing;
			result.valid = (result.errors.length === 0);
			return result;
		},
		addSchema: function () {
			return globalContext.addSchema.apply(globalContext, arguments);
		},
		getSchema: function () {
			return globalContext.getSchema.apply(globalContext, arguments);
		},
		getSchemaMap: function () {
			return globalContext.getSchemaMap.apply(globalContext, arguments);
		},
		getSchemaUris: function () {
			return globalContext.getSchemaUris.apply(globalContext, arguments);
		},
		getMissingUris: function () {
			return globalContext.getMissingUris.apply(globalContext, arguments);
		},
		dropSchemas: function () {
			globalContext.dropSchemas.apply(globalContext, arguments);
		},
		defineKeyword: function () {
			globalContext.defineKeyword.apply(globalContext, arguments);
		},
		defineError: function (codeName, codeNumber, defaultMessage) {
			if (typeof codeName !== 'string' || !/^[A-Z]+(_[A-Z]+)*$/.test(codeName)) {
				throw new Error('Code name must be a string in UPPER_CASE_WITH_UNDERSCORES');
			}
			if (typeof codeNumber !== 'number' || codeNumber%1 !== 0 || codeNumber < 10000) {
				throw new Error('Code number must be an integer > 10000');
			}
			if (typeof ErrorCodes[codeName] !== 'undefined') {
				throw new Error('Error already defined: ' + codeName + ' as ' + ErrorCodes[codeName]);
			}
			if (typeof ErrorCodeLookup[codeNumber] !== 'undefined') {
				throw new Error('Error code already used: ' + ErrorCodeLookup[codeNumber] + ' as ' + codeNumber);
			}
			ErrorCodes[codeName] = codeNumber;
			ErrorCodeLookup[codeNumber] = codeName;
			ErrorMessagesDefault[codeName] = ErrorMessagesDefault[codeNumber] = defaultMessage;
			for (var langCode in languages) {
				var language = languages[langCode];
				if (language[codeName]) {
					language[codeNumber] = language[codeNumber] || language[codeName];
				}
			}
		},
		reset: function () {
			globalContext.reset();
			this.error = null;
			this.missing = [];
			this.valid = true;
		},
		missing: [],
		error: null,
		valid: true,
		normSchema: normSchema,
		resolveUrl: resolveUrl,
		getDocumentUri: getDocumentUri,
		errorCodes: ErrorCodes
	};
	return api;
}

var tv4 = createApi();
tv4.addLanguage('en-gb', ErrorMessagesDefault);

//legacy property
tv4.tv4 = tv4;

return tv4; // used by _header.js to globalise.

}));
},{}],"/Users/sbellity/code/h/instant-win/src/javascript/instant.js":[function(require,module,exports){
var _ = require('./util');

var Steps = ['play', 'form', 'result'];

function InstantWin(CurrentUser, Ship) {

  var CHANGE_EVENT = ["SHIP_CHANGE", Math.floor(Math.random() * 100000000000)].join('_');

  var AppState = {};

  function initState(user, ship) {
    AppState = {
      ship: _.omit(ship, 'settings', 'resources', 'translations'),
      settings: ship.settings,
      form: ship.resources.form,
      achievement: ship.resources.achievement,
      translations: ship.translations,
      user: user,
      badge: (ship.resources.achievement && ship.resources.achievement.badge)
    };
    emitChange();
    return AppState;
  };

  function emitChange(tmp) {
    var s = getAppState(tmp);
    Hull.emit(CHANGE_EVENT, s);
  }


  // Customization support

  function updateSettings(settings) {
    AppState.settings = settings;
    emitChange({ changed: 'settings' });
  }

  function updateTranslations(translations) {
    AppState.translations = translations;
    emitChange({ changed: 'translations' });
  }


  // User actions


  function submitForm(formData) {
    emitChange({ changed: 'loading', loading: 'form' });
    Hull.api.put(AppState.form.id + "/submit", { data: formData }).then(function(form) {
      AppState.form = form;
      emitChange({ changed: 'form' });
    }, function(err) {
      console.warn('Error', err);
    });
  }

  function play(provider) {
    if (userCanPlay()) {
      emitChange({ changed: 'loading', loading: 'badge' });
      return Hull.api.post(AppState.achievement.id + "/achieve").then(function(badge) {
        AppState.badge = badge;
        emitChange({ changed: 'badge' });
      }, function(err) {
        console.warn('Error: ', err);
      });
    } else if (provider && !AppState.user) {
      loginAndPlay(provider);
    } else {
      console.warn("User cannot play", canPlay());
    }
  }

  var autoPlay = false;
  function loginAndPlay(provider, options) {
    if (provider) {
      autoPlay = true;
      emitChange({ isLoggingIn: true });
      Hull.login(provider, options);
    } else {
      throw "[InstantWin] Error in loginAndPlay method: missing `provider`";
    }
  }

  // State management

  function getAppState(tmp) {
    var step = currentStep();
    var ret = _.extend({}, AppState, {
      userCanPlay: userCanPlay(),
      userHasPlayed: userHasPlayed(),
      userHasWon: userHasWon(),
      currentStep: step,
      currentStepIndex: stepIndex(step),
      isFormComplete: isFormComplete(),
    }, tmp);
    return _.deepClone(ret);
  }

  function userCanPlay() {
    return canPlay() === true;
  }

  function canPlay() {
    if (!AppState.user) return "No current user";
    if (userHasWon()) return "Already won";
    var badge = AppState.badge;
    if (!badge || !badge.data.attempts) return true;
    var d = new Date().toISOString().slice(0, 10);
    if (badge.data.attempts[d]) {
      return "One attempt already today";
    } else {
      return true;
    }
  }

  function userHasPlayed() {
    return !!AppState.badge;
  }

  function userHasWon() {
    var badge = AppState.badge;
    if (!badge || !badge.data) return false;
    return badge.data.winner === true;
  }

  function currentStep() {
    if (!AppState.user || userCanPlay()) return 'play';
    if (!isFormComplete()) return 'form';
    return 'result';
  }

  function stepIndex(step) {
    return Steps.indexOf(step);
  }

  function isFormComplete() {
    if (!AppState.user) return false;
    var fields = AppState.form && AppState.form.fields_list;
    var ret = AppState.form.user_data.created_at && fields && fields.reduce(function(res, field) {
      return res && !!field.value;
    }, true);
    return ret || false;
  }

  function reset() {
    if (AppState.user.is_admin) {
      emitChange({ loading: 'reset' });
      if (AppState.badge && AppState.badge.id) {
        Hull.api(AppState.badge.id, 'delete', function() {
          AppState.badge = null;
          Hull.api(AppState.form.id + '/submit', 'delete', function(form) {
            AppState.form = form;
            emitChange({ changed: 'reset' });
          });
        }, function(err) {
          console.warn("Error: ", err);
        });
      } else {
        emitChange({ changed: 'reset' });
        throw "[InstantWin] No badge found here...";
      }
    } else {
      throw "[InstantWin] You need to be a administrator to reset badges";
    }
  }

  function onAuthEvent() {
    emitChange({ changed: 'loading', loading: 'ship' });
    Hull.api(Ship.id, { fields: 'badge' }).then(function(ship) {
      initState(Hull.currentUser(), ship);
      if (autoPlay && userCanPlay()) play();
      autoPlay = false;
    }, function(err) {
    });
  }

  Hull.on('hull.auth.login',  onAuthEvent);
  Hull.on('hull.auth.logout', onAuthEvent);

  var _listeners = [];

  // Public API

  this.onChange = function(cb) {
    var callback = function() {
      var args = [].slice.call(arguments);
      setTimeout(function() {
        cb.apply(undefined, args);
      })
    };
    _listeners.push(callback);
    Hull.on(CHANGE_EVENT, callback);
  };

  this.teardown = function() {
    Hull.off('hull.auth.login',  onAuthEvent);
    Hull.off('hull.auth.logout', onAuthEvent);
    for (var l=0; l < _listeners.length; l++) {
      Hull.off(CHANGE_EVENT, listeners[l]);
    }
  };

  this.getState = function() {
    return getAppState();
  };

  this.play         = play;
  this.reset        = reset;
  this.submitForm   = submitForm;

  if (Ship) {
    initState(CurrentUser, Ship);
  }

};


InstantWin.Steps = Steps;

module.exports = InstantWin;

},{"./util":"/Users/sbellity/code/h/instant-win/src/javascript/util.js"}],"/Users/sbellity/code/h/instant-win/src/javascript/schema-form/foundation-decorator-datepicker.js":[function(require,module,exports){
angular.module('schemaForm').config(
['schemaFormProvider', 'schemaFormDecoratorsProvider', 'sfPathProvider',
  function(schemaFormProvider,  schemaFormDecoratorsProvider, sfPathProvider) {

    var datepicker = function(name, schema, options) {
      if (schema.type === 'string' && (schema.format === 'date' || schema.format === 'date-time')) {
        var f = schemaFormProvider.stdFormObj(name, schema, options);
        f.key  = options.path;
        f.type = 'datepicker';
        options.lookup[sfPathProvider.stringify(options.path)] = f;
        return f;
      }
    };

    schemaFormProvider.defaults.string.unshift(datepicker);

    //Add to the Foundation directive
    schemaFormDecoratorsProvider.addMapping(
      'foundationDecorator',
      'datepicker',
      'directives/decorators/foundation/datepicker.html'
    );
    schemaFormDecoratorsProvider.createDirective(
      'datepicker',
      'directives/decorators/foundation/datepicker.html'
    );
  }
]);

},{}],"/Users/sbellity/code/h/instant-win/src/javascript/schema-form/foundation-decorator.js":[function(require,module,exports){
require('./foundation-decorator-datepicker');
angular.module('schemaForm').config(['schemaFormDecoratorsProvider', function(decoratorsProvider) {
  var base = 'templates/schemaForm/directives/decorators/foundation/';

  decoratorsProvider.createDecorator('foundationDecorator', {
    textarea: base + 'textarea.html',
    fieldset: base + 'fieldset.html',
    array: base + 'array.html',
    tabarray: base + 'tabarray.html',
    tabs: base + 'tabs.html',
    section: base + 'section.html',
    conditional: base + 'section.html',
    actions: base + 'actions.html',
    datepicker: base + 'datepicker.html',
    select: base + 'select.html',
    checkbox: base + 'checkbox.html',
    checkboxes: base + 'checkboxes.html',
    number: base + 'default.html',
    password: base + 'default.html',
    submit: base + 'submit.html',
    button: base + 'submit.html',
    radios: base + 'radios.html',
    'radios-inline': base + 'radios-inline.html',
    radiobuttons: base + 'radio-buttons.html',
    help: base + 'help.html',
    'default': base + 'default.html'
  }, [
    function(form) {
      if (form.readonly && form.key && form.type !== 'fieldset') {
        return base + 'readonly.html';
      }
    }
  ], { className: "row" });

  //manual use directives
  decoratorsProvider.createDirectives({
    textarea: base + 'textarea.html',
    select: base + 'select.html',
    checkbox: base + 'checkbox.html',
    checkboxes: base + 'checkboxes.html',
    number: base + 'default.html',
    submit: base + 'submit.html',
    button: base + 'submit.html',
    text: base + 'default.html',
    date: base + 'default.html',
    password: base + 'default.html',
    datepicker: base + 'datepicker.html',
    input: base + 'default.html',
    radios: base + 'radios.html',
    'radios-inline': base + 'radios-inline.html',
    radiobuttons: base + 'radio-buttons.html',
  });

}]).directive('sfFieldset', function() {
  return {
    transclude: true,
    scope: true,
    templateUrl: 'directives/decorators/foundation/fieldset-trcl.html',
    link: function(scope, element, attrs) {
      scope.title = scope.$eval(attrs.title);
    }
  };
});

},{"./foundation-decorator-datepicker":"/Users/sbellity/code/h/instant-win/src/javascript/schema-form/foundation-decorator-datepicker.js"}],"/Users/sbellity/code/h/instant-win/src/javascript/util.js":[function(require,module,exports){
function isObject(obj) {
  var type = typeof obj;
  return type === 'function' || type === 'object' && !!obj;
};


 function extend(obj) {
  if (!isObject(obj)) return obj;
  var source, prop;
  for (var i = 1, length = arguments.length; i < length; i++) {
    source = arguments[i];
    for (prop in source) {
      if (hasOwnProperty.call(source, prop)) {
          obj[prop] = source[prop];
      }
    }
  }
  return obj;
};

function omit(obj /* keys */) {
  var withoutKeys = [].slice.call(arguments, 1);
  return obj && Object.keys(obj).reduce(function(s, k) {
    if (withoutKeys.indexOf(k) === -1) s[k] = obj[k]
    return s;
  }, {});
};

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}


module.exports = {
  extend: extend,
  omit: omit,
  isObject: isObject,
  deepClone: deepClone
};

},{}]},{},["./src/javascript/app.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvamF2YXNjcmlwdC9hcHAuanMiLCJub2RlX21vZHVsZXMvYW5ndWxhci1zY2hlbWEtZm9ybS9kaXN0L3NjaGVtYS1mb3JtLmpzIiwibm9kZV9tb2R1bGVzL29iamVjdHBhdGgvaW5kZXguanMiLCJub2RlX21vZHVsZXMvb2JqZWN0cGF0aC9saWIvT2JqZWN0UGF0aC5qcyIsIm5vZGVfbW9kdWxlcy90djQvdHY0LmpzIiwic3JjL2phdmFzY3JpcHQvaW5zdGFudC5qcyIsInNyYy9qYXZhc2NyaXB0L3NjaGVtYS1mb3JtL2ZvdW5kYXRpb24tZGVjb3JhdG9yLWRhdGVwaWNrZXIuanMiLCJzcmMvamF2YXNjcmlwdC9zY2hlbWEtZm9ybS9mb3VuZGF0aW9uLWRlY29yYXRvci5qcyIsInNyYy9qYXZhc2NyaXB0L3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0NENBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2psREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBJbnN0YW50V2luID0gcmVxdWlyZSgnLi9pbnN0YW50Jyk7XG52YXIgU3RlcHMgPSBJbnN0YW50V2luLlN0ZXBzO1xudmFyIGRlZmF1bHRTdGVwID0gU3RlcHNbMF07XG5cbndpbmRvdy50djQgPSByZXF1aXJlKCd0djQnKTtcbnZhciBPYmplY3RQYXRoID0gcmVxdWlyZSgnb2JqZWN0cGF0aCcpO1xuXG50cnkge1xuICBhbmd1bGFyLm1vZHVsZSgnT2JqZWN0UGF0aCcsIFtdKS5wcm92aWRlcignT2JqZWN0UGF0aCcsIGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5wYXJzZSA9IE9iamVjdFBhdGgucGFyc2U7XG4gICAgdGhpcy5zdHJpbmdpZnkgPSBPYmplY3RQYXRoLnN0cmluZ2lmeTtcbiAgICB0aGlzLm5vcm1hbGl6ZSA9IE9iamVjdFBhdGgubm9ybWFsaXplO1xuICAgIHRoaXMuJGdldCA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gT2JqZWN0UGF0aDtcbiAgICB9O1xuICB9KTtcbn0gY2F0Y2goZSkge31cblxucmVxdWlyZSgnYW5ndWxhci1zY2hlbWEtZm9ybS9kaXN0L3NjaGVtYS1mb3JtJyk7XG5yZXF1aXJlKCcuL3NjaGVtYS1mb3JtL2ZvdW5kYXRpb24tZGVjb3JhdG9yJyk7XG5yZXF1aXJlKCcuL3NjaGVtYS1mb3JtL2ZvdW5kYXRpb24tZGVjb3JhdG9yLWRhdGVwaWNrZXInKTtcblxudmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdodWxsLWluc3RhbnQnLCBbJ25nQW5pbWF0ZScsICdzY2hlbWFGb3JtJ10pXG5cbi5mYWN0b3J5KFwiJGluc3RhbnRcIiwgW1wiJGh1bGxJbml0XCIsIGZ1bmN0aW9uKCRodWxsSW5pdCkge1xuICB2YXIgaW5zdGFudCA9IG5ldyBJbnN0YW50V2luKCRodWxsSW5pdC51c2VyLCAkaHVsbEluaXQuc2hpcCk7XG4gIHdpbmRvdy4kaW5zdGFudCA9IGluc3RhbnQ7XG4gIHJldHVybiBpbnN0YW50O1xufV0pXG5cbi5kaXJlY3RpdmUoXCJwcm9ncmVzc1wiLCBmdW5jdGlvbigpe1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiBcIkFcIixcbiAgICBzY29wZTogeyBzdGVwOiBcIj1cIiwgc3RlcHM6IFwiPVwiLCBzdGVwSW5kZXg6IFwiPVwiIH0sXG4gICAgdGVtcGxhdGVVcmw6IFwidGVtcGxhdGVzL2h1bGwtaW5zdGFudC9kaXJlY3RpdmVzL3Byb2dyZXNzLmh0bWxcIixcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUpIHtcbiAgICAgICRzY29wZS5wcm9ncmVzc1JhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIDEwMCAqICgkc2NvcGUuc3RlcEluZGV4ICsgMSkgLyAoJHNjb3BlLnN0ZXBzLmxlbmd0aCArIDEpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn0pXG5cbi5jb250cm9sbGVyKCdGb3JtQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRpbnN0YW50JywgZnVuY3Rpb24oJHNjb3BlKSB7XG4gICRzY29wZS5tb2RlbCA9IHt9O1xuICB2YXIgZmllbGRzID0gKCRzY29wZS5pbnN0YW50LmZvcm0gJiYgJHNjb3BlLmluc3RhbnQuZm9ybS5maWVsZHNfbGlzdCkgfHwgW107XG4gIGFuZ3VsYXIuZm9yRWFjaChmaWVsZHMsIGZ1bmN0aW9uKGZpZWxkKSB7XG4gICAgJHNjb3BlLm1vZGVsW2ZpZWxkLm5hbWVdID0gZmllbGQudmFsdWU7XG4gIH0pO1xuICAkc2NvcGUuc2NoZW1hID0gJHNjb3BlLmluc3RhbnQuZm9ybS5maWVsZHNfc2NoZW1hO1xuICAkc2NvcGUuZm9ybSA9IFtcbiAgICB7XG4gICAgICBcInR5cGVcIjogXCJmaWVsZHNldFwiLFxuICAgICAgXCJ0aXRsZVwiIDogXCJGb3JtXCIsXG4gICAgICBcIml0ZW1zXCIgOiBbIFwiKlwiIF0sXG4gICAgfSxcbiAgICB7IFwidHlwZVwiOiBcInN1Ym1pdFwiLCBcInRpdGxlXCI6IFwiU2F2ZVwiLCBcInN0eWxlXCI6XCJcIiB9XG4gIF07XG5cbiAgJHNjb3BlLm9uU3VibWl0ID0gZnVuY3Rpb24oZm9ybSkge1xuICAgIC8vIEZpcnN0IHdlIGJyb2FkY2FzdCBhbiBldmVudCBzbyBhbGwgZmllbGRzIHZhbGlkYXRlIHRoZW1zZWx2ZXNcbiAgICAkc2NvcGUuJGJyb2FkY2FzdCgnc2NoZW1hRm9ybVZhbGlkYXRlJyk7XG5cbiAgICAvLyBUaGVuIHdlIGNoZWNrIGlmIHRoZSBmb3JtIGlzIHZhbGlkXG4gICAgaWYgKGZvcm0uJHZhbGlkKSB7XG4gICAgICAkaW5zdGFudC5zdWJtaXRGb3JtKCRzY29wZS5tb2RlbCk7XG4gICAgfVxuICB9XG59XSlcblxuLmNvbnRyb2xsZXIoJ0luc3RhbnRXaW5Db250cm9sbGVyJyxbJyRzY29wZScsICckaW5zdGFudCcsXG4gIGZ1bmN0aW9uIEluc3RhbnRXaW5Db250cm9sbGVyKCRzY29wZSwgJGluc3RhbnQpIHtcblxuICAgICRzY29wZS5sb2dpbiAgICA9IEh1bGwubG9naW47XG4gICAgJHNjb3BlLmxvZ291dCAgID0gSHVsbC5sb2dvdXQ7XG4gICAgJHNjb3BlLnBsYXkgICAgID0gJGluc3RhbnQucGxheTtcblxuICAgICRzY29wZS5zdGVwcyA9IFN0ZXBzO1xuICAgICRzY29wZS4kaW5zdGFudCA9ICRpbnN0YW50O1xuICAgICRzY29wZS5pbnN0YW50ICA9ICRpbnN0YW50LmdldFN0YXRlKCk7XG5cbiAgICBmdW5jdGlvbiBvbkNoYW5nZShpbnN0YW50KSB7XG4gICAgICAkc2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xuICAgICAgICAkc2NvcGUuaW5zdGFudCA9IGluc3RhbnQ7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAkaW5zdGFudC5vbkNoYW5nZShvbkNoYW5nZSk7XG4gIH1cbl0pO1xuXG5cbkh1bGwucmVhZHkoZnVuY3Rpb24oXywgY3VycmVudFVzZXIsIHNoaXAsIG9yZykge1xuICB2YXIgSHVsbEluaXQgPSB7XG4gICAgdXNlcjogY3VycmVudFVzZXIsXG4gICAgc2hpcDogc2hpcCxcbiAgICBvcmc6IG9yZ1xuICB9O1xuXG4gIGFwcC52YWx1ZSgnJGh1bGxJbml0JywgSHVsbEluaXQpO1xuICBhbmd1bGFyLmJvb3RzdHJhcChkb2N1bWVudCwgWydodWxsLWluc3RhbnQnXSk7XG59KTtcbiIsIi8vIERlcHMgaXMgc29ydCBvZiBhIHByb2JsZW0gZm9yIHVzLCBtYXliZSBpbiB0aGUgZnV0dXJlIHdlIHdpbGwgYXNrIHRoZSB1c2VyIHRvIGRlcGVuZFxuLy8gb24gbW9kdWxlcyBmb3IgYWRkLW9uc1xuXG52YXIgZGVwcyA9IFsnT2JqZWN0UGF0aCddO1xudHJ5IHtcbiAgLy9UaGlzIHRocm93cyBhbiBleHBlY3Rpb24gaWYgbW9kdWxlIGRvZXMgbm90IGV4aXN0LlxuICBhbmd1bGFyLm1vZHVsZSgnbmdTYW5pdGl6ZScpO1xuICBkZXBzLnB1c2goJ25nU2FuaXRpemUnKTtcbn0gY2F0Y2ggKGUpIHt9XG5cbnRyeSB7XG4gIC8vVGhpcyB0aHJvd3MgYW4gZXhwZWN0aW9uIGlmIG1vZHVsZSBkb2VzIG5vdCBleGlzdC5cbiAgYW5ndWxhci5tb2R1bGUoJ3VpLnNvcnRhYmxlJyk7XG4gIGRlcHMucHVzaCgndWkuc29ydGFibGUnKTtcbn0gY2F0Y2ggKGUpIHt9XG5cbnRyeSB7XG4gIC8vVGhpcyB0aHJvd3MgYW4gZXhwZWN0aW9uIGlmIG1vZHVsZSBkb2VzIG5vdCBleGlzdC5cbiAgYW5ndWxhci5tb2R1bGUoJ2FuZ3VsYXJTcGVjdHJ1bUNvbG9ycGlja2VyJyk7XG4gIGRlcHMucHVzaCgnYW5ndWxhclNwZWN0cnVtQ29sb3JwaWNrZXInKTtcbn0gY2F0Y2ggKGUpIHt9XG5cbmFuZ3VsYXIubW9kdWxlKCdzY2hlbWFGb3JtJywgZGVwcyk7XG5cbmFuZ3VsYXIubW9kdWxlKCdzY2hlbWFGb3JtJykucHJvdmlkZXIoJ3NmUGF0aCcsXG5bJ09iamVjdFBhdGhQcm92aWRlcicsIGZ1bmN0aW9uKE9iamVjdFBhdGhQcm92aWRlcikge1xuICB2YXIgT2JqZWN0UGF0aCA9IHtwYXJzZTogT2JqZWN0UGF0aFByb3ZpZGVyLnBhcnNlfTtcblxuICAvLyBpZiB3ZSdyZSBvbiBBbmd1bGFyIDEuMi54LCB3ZSBuZWVkIHRvIGNvbnRpbnVlIHVzaW5nIGRvdCBub3RhdGlvblxuICBpZiAoYW5ndWxhci52ZXJzaW9uLm1ham9yID09PSAxICYmIGFuZ3VsYXIudmVyc2lvbi5taW5vciA8IDMpIHtcbiAgICBPYmplY3RQYXRoLnN0cmluZ2lmeSA9IGZ1bmN0aW9uKGFycikge1xuICAgICAgcmV0dXJuIEFycmF5LmlzQXJyYXkoYXJyKSA/IGFyci5qb2luKCcuJykgOiBhcnIudG9TdHJpbmcoKTtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIE9iamVjdFBhdGguc3RyaW5naWZ5ID0gT2JqZWN0UGF0aFByb3ZpZGVyLnN0cmluZ2lmeTtcbiAgfVxuXG4gIC8vIFdlIHdhbnQgdGhpcyB0byB1c2Ugd2hpY2hldmVyIHN0cmluZ2lmeSBtZXRob2QgaXMgZGVmaW5lZCBhYm92ZSxcbiAgLy8gc28gd2UgaGF2ZSB0byBjb3B5IHRoZSBjb2RlIGhlcmUuXG4gIE9iamVjdFBhdGgubm9ybWFsaXplID0gZnVuY3Rpb24oZGF0YSwgcXVvdGUpIHtcbiAgICByZXR1cm4gT2JqZWN0UGF0aC5zdHJpbmdpZnkoQXJyYXkuaXNBcnJheShkYXRhKSA/IGRhdGEgOiBPYmplY3RQYXRoLnBhcnNlKGRhdGEpLCBxdW90ZSk7XG4gIH07XG5cbiAgdGhpcy5wYXJzZSA9IE9iamVjdFBhdGgucGFyc2U7XG4gIHRoaXMuc3RyaW5naWZ5ID0gT2JqZWN0UGF0aC5zdHJpbmdpZnk7XG4gIHRoaXMubm9ybWFsaXplID0gT2JqZWN0UGF0aC5ub3JtYWxpemU7XG4gIHRoaXMuJGdldCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBPYmplY3RQYXRoO1xuICB9O1xufV0pO1xuXG4vKipcbiAqIEBuZ2RvYyBzZXJ2aWNlXG4gKiBAbmFtZSBzZlNlbGVjdFxuICogQGtpbmQgZnVuY3Rpb25cbiAqXG4gKi9cbmFuZ3VsYXIubW9kdWxlKCdzY2hlbWFGb3JtJykuZmFjdG9yeSgnc2ZTZWxlY3QnLCBbJ3NmUGF0aCcsIGZ1bmN0aW9uKHNmUGF0aCkge1xuICB2YXIgbnVtUmUgPSAvXlxcZCskLztcblxuICAvKipcbiAgICAqIEBkZXNjcmlwdGlvblxuICAgICogVXRpbGl0eSBtZXRob2QgdG8gYWNjZXNzIGRlZXAgcHJvcGVydGllcyB3aXRob3V0XG4gICAgKiB0aHJvd2luZyBlcnJvcnMgd2hlbiB0aGluZ3MgYXJlIG5vdCBkZWZpbmVkLlxuICAgICogQ2FuIGFsc28gc2V0IGEgdmFsdWUgaW4gYSBkZWVwIHN0cnVjdHVyZSwgY3JlYXRpbmcgb2JqZWN0cyB3aGVuIG1pc3NpbmdcbiAgICAqIGV4LlxuICAgICogdmFyIGZvbyA9IFNlbGVjdCgnYWRkcmVzcy5jb250YWN0Lm5hbWUnLG9iailcbiAgICAqIFNlbGVjdCgnYWRkcmVzcy5jb250YWN0Lm5hbWUnLG9iaiwnTGVlcm95JylcbiAgICAqXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gcHJvamVjdGlvbiBBIGRvdCBwYXRoIHRvIHRoZSBwcm9wZXJ0eSB5b3Ugd2FudCB0byBnZXQvc2V0XG4gICAgKiBAcGFyYW0ge29iamVjdH0gb2JqICAgKG9wdGlvbmFsKSBUaGUgb2JqZWN0IHRvIHByb2plY3Qgb24sIGRlZmF1bHRzIHRvICd0aGlzJ1xuICAgICogQHBhcmFtIHtBbnl9ICAgIHZhbHVlVG9TZXQgKG9waW9uYWwpICBUaGUgdmFsdWUgdG8gc2V0LCBpZiBwYXJ0cyBvZiB0aGUgcGF0aCBvZlxuICAgICogICAgICAgICAgICAgICAgIHRoZSBwcm9qZWN0aW9uIGlzIG1pc3NpbmcgZW1wdHkgb2JqZWN0cyB3aWxsIGJlIGNyZWF0ZWQuXG4gICAgKiBAcmV0dXJucyB7QW55fHVuZGVmaW5lZH0gcmV0dXJucyB0aGUgdmFsdWUgYXQgdGhlIGVuZCBvZiB0aGUgcHJvamVjdGlvbiBwYXRoXG4gICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgb3IgdW5kZWZpbmVkIGlmIHRoZXJlIGlzIG5vbmUuXG4gICAgKi9cbiAgcmV0dXJuIGZ1bmN0aW9uKHByb2plY3Rpb24sIG9iaiwgdmFsdWVUb1NldCkge1xuICAgIGlmICghb2JqKSB7XG4gICAgICBvYmogPSB0aGlzO1xuICAgIH1cbiAgICAvL1N1cHBvcnQgW10gYXJyYXkgc3ludGF4XG4gICAgdmFyIHBhcnRzID0gdHlwZW9mIHByb2plY3Rpb24gPT09ICdzdHJpbmcnID8gc2ZQYXRoLnBhcnNlKHByb2plY3Rpb24pIDogcHJvamVjdGlvbjtcblxuICAgIGlmICh0eXBlb2YgdmFsdWVUb1NldCAhPT0gJ3VuZGVmaW5lZCcgJiYgcGFydHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAvL3NwZWNpYWwgY2FzZSwganVzdCBzZXR0aW5nIG9uZSB2YXJpYWJsZVxuICAgICAgb2JqW3BhcnRzWzBdXSA9IHZhbHVlVG9TZXQ7XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgdmFsdWVUb1NldCAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgICAgdHlwZW9mIG9ialtwYXJ0c1swXV0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgLy8gV2UgbmVlZCB0byBsb29rIGFoZWFkIHRvIGNoZWNrIGlmIGFycmF5IGlzIGFwcHJvcHJpYXRlXG4gICAgICBvYmpbcGFydHNbMF1dID0gcGFydHMubGVuZ3RoID4gMiAmJiBudW1SZS50ZXN0KHBhcnRzWzFdKSA/IFtdIDoge307XG4gICAgfVxuXG4gICAgdmFyIHZhbHVlID0gb2JqW3BhcnRzWzBdXTtcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IHBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAvLyBTcGVjaWFsIGNhc2U6IFdlIGFsbG93IEpTT04gRm9ybSBzeW50YXggZm9yIGFycmF5cyB1c2luZyBlbXB0eSBicmFja2V0c1xuICAgICAgLy8gVGhlc2Ugd2lsbCBvZiBjb3Vyc2Ugbm90IHdvcmsgaGVyZSBzbyB3ZSBleGl0IGlmIHRoZXkgYXJlIGZvdW5kLlxuICAgICAgaWYgKHBhcnRzW2ldID09PSAnJykge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiB2YWx1ZVRvU2V0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBpZiAoaSA9PT0gcGFydHMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgIC8vbGFzdCBzdGVwLiBMZXQncyBzZXQgdGhlIHZhbHVlXG4gICAgICAgICAgdmFsdWVbcGFydHNbaV1dID0gdmFsdWVUb1NldDtcbiAgICAgICAgICByZXR1cm4gdmFsdWVUb1NldDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBNYWtlIHN1cmUgdG8gY3JlYXRlIG5ldyBvYmplY3RzIG9uIHRoZSB3YXkgaWYgdGhleSBhcmUgbm90IHRoZXJlLlxuICAgICAgICAgIC8vIFdlIG5lZWQgdG8gbG9vayBhaGVhZCB0byBjaGVjayBpZiBhcnJheSBpcyBhcHByb3ByaWF0ZVxuICAgICAgICAgIHZhciB0bXAgPSB2YWx1ZVtwYXJ0c1tpXV07XG4gICAgICAgICAgaWYgKHR5cGVvZiB0bXAgPT09ICd1bmRlZmluZWQnIHx8IHRtcCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdG1wID0gbnVtUmUudGVzdChwYXJ0c1tpICsgMV0pID8gW10gOiB7fTtcbiAgICAgICAgICAgIHZhbHVlW3BhcnRzW2ldXSA9IHRtcDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFsdWUgPSB0bXA7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodmFsdWUpIHtcbiAgICAgICAgLy9KdXN0IGdldCBuZXggdmFsdWUuXG4gICAgICAgIHZhbHVlID0gdmFsdWVbcGFydHNbaV1dO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG59XSk7XG5cbmFuZ3VsYXIubW9kdWxlKCdzY2hlbWFGb3JtJykucHJvdmlkZXIoJ3NjaGVtYUZvcm1EZWNvcmF0b3JzJyxcblsnJGNvbXBpbGVQcm92aWRlcicsICdzZlBhdGhQcm92aWRlcicsIGZ1bmN0aW9uKCRjb21waWxlUHJvdmlkZXIsIHNmUGF0aFByb3ZpZGVyKSB7XG4gIHZhciBkZWZhdWx0RGVjb3JhdG9yID0gJyc7XG4gIHZhciBkaXJlY3RpdmVzID0ge307XG5cbiAgdmFyIHRlbXBsYXRlVXJsID0gZnVuY3Rpb24obmFtZSwgZm9ybSkge1xuICAgIC8vc2NoZW1hRGVjb3JhdG9yIGlzIGFsaWFzIGZvciB3aGF0ZXZlciBpcyBzZXQgYXMgZGVmYXVsdFxuICAgIGlmIChuYW1lID09PSAnc2ZEZWNvcmF0b3InKSB7XG4gICAgICBuYW1lID0gZGVmYXVsdERlY29yYXRvcjtcbiAgICB9XG5cbiAgICB2YXIgZGlyZWN0aXZlID0gZGlyZWN0aXZlc1tuYW1lXTtcblxuICAgIC8vcnVsZXMgZmlyc3RcbiAgICB2YXIgcnVsZXMgPSBkaXJlY3RpdmUucnVsZXM7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBydWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHJlcyA9IHJ1bGVzW2ldKGZvcm0pO1xuICAgICAgaWYgKHJlcykge1xuICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vdGhlbiBjaGVjayBtYXBwaW5nXG4gICAgaWYgKGRpcmVjdGl2ZS5tYXBwaW5nc1tmb3JtLnR5cGVdKSB7XG4gICAgICByZXR1cm4gZGlyZWN0aXZlLm1hcHBpbmdzW2Zvcm0udHlwZV07XG4gICAgfVxuXG4gICAgLy90cnkgZGVmYXVsdFxuICAgIHJldHVybiBkaXJlY3RpdmUubWFwcGluZ3NbJ2RlZmF1bHQnXTtcbiAgfTtcblxuICB2YXIgY3JlYXRlRGlyZWN0aXZlID0gZnVuY3Rpb24obmFtZSwgb3B0aW9ucykge1xuICAgICRjb21waWxlUHJvdmlkZXIuZGlyZWN0aXZlKG5hbWUsIFsnJHBhcnNlJywgJyRjb21waWxlJywgJyRodHRwJywgJyR0ZW1wbGF0ZUNhY2hlJyxcbiAgICAgIGZ1bmN0aW9uKCRwYXJzZSwgICRjb21waWxlLCAgJGh0dHAsICAkdGVtcGxhdGVDYWNoZSkge1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgcmVzdHJpY3Q6ICdBRScsXG4gICAgICAgICAgcmVwbGFjZTogZmFsc2UsXG4gICAgICAgICAgdHJhbnNjbHVkZTogZmFsc2UsXG4gICAgICAgICAgc2NvcGU6IHRydWUsXG4gICAgICAgICAgcmVxdWlyZTogJz9ec2ZTY2hlbWEnLFxuICAgICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgc2ZTY2hlbWEpIHtcbiAgICAgICAgICAgIC8vcmViaW5kIG91ciBwYXJ0IG9mIHRoZSBmb3JtIHRvIHRoZSBzY29wZS5cbiAgICAgICAgICAgIHZhciBvbmNlID0gc2NvcGUuJHdhdGNoKGF0dHJzLmZvcm0sIGZ1bmN0aW9uKGZvcm0pIHtcblxuICAgICAgICAgICAgICBpZiAoZm9ybSkge1xuICAgICAgICAgICAgICAgIHNjb3BlLmZvcm0gID0gZm9ybTtcblxuICAgICAgICAgICAgICAgIC8vb2sgbGV0J3MgcmVwbGFjZSB0aGF0IHRlbXBsYXRlIVxuICAgICAgICAgICAgICAgIC8vV2UgZG8gdGhpcyBtYW51YWxseSBzaW5jZSB3ZSBuZWVkIHRvIGJpbmQgbmctbW9kZWwgcHJvcGVybHkgYW5kIGFsc29cbiAgICAgICAgICAgICAgICAvL2ZvciBmaWVsZHNldHMgdG8gcmVjdXJzZSBwcm9wZXJseS5cbiAgICAgICAgICAgICAgICB2YXIgdXJsID0gdGVtcGxhdGVVcmwobmFtZSwgZm9ybSk7XG4gICAgICAgICAgICAgICAgJGh0dHAuZ2V0KHVybCwge2NhY2hlOiAkdGVtcGxhdGVDYWNoZX0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgICB2YXIga2V5ID0gZm9ybS5rZXkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNmUGF0aFByb3ZpZGVyLnN0cmluZ2lmeShmb3JtLmtleSkucmVwbGFjZSgvXCIvZywgJyZxdW90OycpIDogJyc7XG4gICAgICAgICAgICAgICAgICB2YXIgdGVtcGxhdGUgPSByZXMuZGF0YS5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICAvXFwkXFwkdmFsdWVcXCRcXCQvZyxcbiAgICAgICAgICAgICAgICAgICAgJ21vZGVsJyArIChrZXlbMF0gIT09ICdbJyA/ICcuJyA6ICcnKSArIGtleVxuICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5jbGFzc05hbWUpIHtcbiAgICAgICAgICAgICAgICAgIFx0ZWxlbWVudC5hZGRDbGFzcyhvcHRpb25zLmNsYXNzTmFtZSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBlbGVtZW50Lmh0bWwodGVtcGxhdGUpO1xuICAgICAgICAgICAgICAgICAgJGNvbXBpbGUoZWxlbWVudC5jb250ZW50cygpKShzY29wZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgb25jZSgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy9LZWVwIGVycm9yIHByb25lIGxvZ2ljIGZyb20gdGhlIHRlbXBsYXRlXG4gICAgICAgICAgICBzY29wZS5zaG93VGl0bGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHNjb3BlLmZvcm0gJiYgc2NvcGUuZm9ybS5ub3RpdGxlICE9PSB0cnVlICYmIHNjb3BlLmZvcm0udGl0bGU7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzY29wZS5saXN0VG9DaGVja2JveFZhbHVlcyA9IGZ1bmN0aW9uKGxpc3QpIHtcbiAgICAgICAgICAgICAgdmFyIHZhbHVlcyA9IHt9O1xuICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2gobGlzdCwgZnVuY3Rpb24odikge1xuICAgICAgICAgICAgICAgIHZhbHVlc1t2XSA9IHRydWU7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICByZXR1cm4gdmFsdWVzO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2NvcGUuY2hlY2tib3hWYWx1ZXNUb0xpc3QgPSBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgICAgICAgdmFyIGxzdCA9IFtdO1xuICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2godmFsdWVzLCBmdW5jdGlvbih2LCBrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHYpIHtcbiAgICAgICAgICAgICAgICAgIGxzdC5wdXNoKGspO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIHJldHVybiBsc3Q7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzY29wZS5idXR0b25DbGljayA9IGZ1bmN0aW9uKCRldmVudCwgZm9ybSkge1xuICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKGZvcm0ub25DbGljaykpIHtcbiAgICAgICAgICAgICAgICBmb3JtLm9uQ2xpY2soJGV2ZW50LCBmb3JtKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChhbmd1bGFyLmlzU3RyaW5nKGZvcm0ub25DbGljaykpIHtcbiAgICAgICAgICAgICAgICBpZiAoc2ZTY2hlbWEpIHtcbiAgICAgICAgICAgICAgICAgIC8vZXZhbHVhdGluZyBpbiBzY29wZSBvdXRzaWRlIG9mIHNmU2NoZW1hcyBpc29sYXRlZCBzY29wZVxuICAgICAgICAgICAgICAgICAgc2ZTY2hlbWEuZXZhbEluUGFyZW50U2NvcGUoZm9ybS5vbkNsaWNrLCB7JyRldmVudCc6ICRldmVudCwgZm9ybTogZm9ybX0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBzY29wZS4kZXZhbChmb3JtLm9uQ2xpY2ssIHsnJGV2ZW50JzogJGV2ZW50LCBmb3JtOiBmb3JtfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEV2YWx1YXRlIGFuIGV4cHJlc3Npb24sIGkuZS4gc2NvcGUuJGV2YWxcbiAgICAgICAgICAgICAqIGJ1dCBkbyBpdCBpbiBzZlNjaGVtYXMgcGFyZW50IHNjb3BlIHNmLXNjaGVtYSBkaXJlY3RpdmUgaXMgdXNlZFxuICAgICAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGV4cHJlc3Npb25cbiAgICAgICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBsb2NhbHMgKG9wdGlvbmFsKVxuICAgICAgICAgICAgICogQHJldHVybiB7QW55fSB0aGUgcmVzdWx0IG9mIHRoZSBleHByZXNzaW9uXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHNjb3BlLmV2YWxFeHByID0gZnVuY3Rpb24oZXhwcmVzc2lvbiwgbG9jYWxzKSB7XG4gICAgICAgICAgICAgIGlmIChzZlNjaGVtYSkge1xuICAgICAgICAgICAgICAgIC8vZXZhbHVhdGluZyBpbiBzY29wZSBvdXRzaWRlIG9mIHNmU2NoZW1hcyBpc29sYXRlZCBzY29wZVxuICAgICAgICAgICAgICAgIHJldHVybiBzZlNjaGVtYS5ldmFsSW5QYXJlbnRTY29wZShleHByZXNzaW9uLCBsb2NhbHMpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgcmV0dXJuIHNjb3BlLiRldmFsKGV4cHJlc3Npb24sIGxvY2Fscyk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEV2YWx1YXRlIGFuIGV4cHJlc3Npb24sIGkuZS4gc2NvcGUuJGV2YWxcbiAgICAgICAgICAgICAqIGluIHRoaXMgZGVjb3JhdG9ycyBzY29wZVxuICAgICAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGV4cHJlc3Npb25cbiAgICAgICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBsb2NhbHMgKG9wdGlvbmFsKVxuICAgICAgICAgICAgICogQHJldHVybiB7QW55fSB0aGUgcmVzdWx0IG9mIHRoZSBleHByZXNzaW9uXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHNjb3BlLmV2YWxJblNjb3BlID0gZnVuY3Rpb24oZXhwcmVzc2lvbiwgbG9jYWxzKSB7XG4gICAgICAgICAgICAgIGlmIChleHByZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNjb3BlLiRldmFsKGV4cHJlc3Npb24sIGxvY2Fscyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogRXJyb3IgbWVzc2FnZSBoYW5kbGVyXG4gICAgICAgICAgICAgKiBBbiBlcnJvciBjYW4gZWl0aGVyIGJlIGEgc2NoZW1hIHZhbGlkYXRpb24gbWVzc2FnZSBvciBhIGFuZ3VsYXIganMgdmFsaWR0aW9uXG4gICAgICAgICAgICAgKiBlcnJvciAoaS5lLiByZXF1aXJlZClcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgc2NvcGUuZXJyb3JNZXNzYWdlID0gZnVuY3Rpb24oc2NoZW1hRXJyb3IpIHtcbiAgICAgICAgICAgICAgLy9Vc2VyIGhhcyBzdXBwbGllZCB2YWxpZGF0aW9uIG1lc3NhZ2VzXG4gICAgICAgICAgICAgIGlmIChzY29wZS5mb3JtLnZhbGlkYXRpb25NZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNjaGVtYUVycm9yKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc1N0cmluZyhzY29wZS5mb3JtLnZhbGlkYXRpb25NZXNzYWdlKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2NvcGUuZm9ybS52YWxpZGF0aW9uTWVzc2FnZTtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgcmV0dXJuIHNjb3BlLmZvcm0udmFsaWRhdGlvbk1lc3NhZ2Vbc2NoZW1hRXJyb3IuY29kZV0gfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5mb3JtLnZhbGlkYXRpb25NZXNzYWdlWydkZWZhdWx0J107XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBzY29wZS5mb3JtLnZhbGlkYXRpb25NZXNzYWdlLm51bWJlciB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmZvcm0udmFsaWRhdGlvbk1lc3NhZ2VbJ2RlZmF1bHQnXSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmZvcm0udmFsaWRhdGlvbk1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLy9ObyB1c2VyIHN1cHBsaWVkIHZhbGlkYXRpb24gbWVzc2FnZS5cbiAgICAgICAgICAgICAgaWYgKHNjaGVtYUVycm9yKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNjaGVtYUVycm9yLm1lc3NhZ2U7IC8vdXNlIHR2NC5qcyB2YWxpZGF0aW9uIG1lc3NhZ2VcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vT3RoZXJ3aXNlIHdlIG9ubHkgaGF2ZSBpbnB1dCBudW1iZXIgbm90IGJlaW5nIGEgbnVtYmVyXG4gICAgICAgICAgICAgIHJldHVybiAnTm90IGEgbnVtYmVyJztcblxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgXSk7XG4gIH07XG5cbiAgdmFyIGNyZWF0ZU1hbnVhbERpcmVjdGl2ZSA9IGZ1bmN0aW9uKHR5cGUsIHRlbXBsYXRlVXJsLCB0cmFuc2NsdWRlKSB7XG4gICAgdHJhbnNjbHVkZSA9IGFuZ3VsYXIuaXNEZWZpbmVkKHRyYW5zY2x1ZGUpID8gdHJhbnNjbHVkZSA6IGZhbHNlO1xuICAgICRjb21waWxlUHJvdmlkZXIuZGlyZWN0aXZlKCdzZicgKyBhbmd1bGFyLnVwcGVyY2FzZSh0eXBlWzBdKSArIHR5cGUuc3Vic3RyKDEpLCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRUFDJyxcbiAgICAgICAgc2NvcGU6IHRydWUsXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRyYW5zY2x1ZGUsXG4gICAgICAgIHRlbXBsYXRlOiAnPHNmLWRlY29yYXRvciBmb3JtPVwiZm9ybVwiPjwvc2YtZGVjb3JhdG9yPicsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICAgIHZhciB3YXRjaFRoaXMgPSB7XG4gICAgICAgICAgICAnaXRlbXMnOiAnYycsXG4gICAgICAgICAgICAndGl0bGVNYXAnOiAnYycsXG4gICAgICAgICAgICAnc2NoZW1hJzogJ2MnXG4gICAgICAgICAgfTtcbiAgICAgICAgICB2YXIgZm9ybSA9IHt0eXBlOiB0eXBlfTtcbiAgICAgICAgICB2YXIgb25jZSA9IHRydWU7XG4gICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGF0dHJzLCBmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICAgICAgaWYgKG5hbWVbMF0gIT09ICckJyAmJiBuYW1lLmluZGV4T2YoJ25nJykgIT09IDAgJiYgbmFtZSAhPT0gJ3NmRmllbGQnKSB7XG5cbiAgICAgICAgICAgICAgdmFyIHVwZGF0ZUZvcm0gPSBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQodmFsKSAmJiB2YWwgIT09IGZvcm1bbmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgIGZvcm1bbmFtZV0gPSB2YWw7XG5cbiAgICAgICAgICAgICAgICAgIC8vd2hlbiB3ZSBoYXZlIHR5cGUsIGFuZCBpZiBzcGVjaWZpZWQga2V5IHdlIGFwcGx5IGl0IG9uIHNjb3BlLlxuICAgICAgICAgICAgICAgICAgaWYgKG9uY2UgJiYgZm9ybS50eXBlICYmIChmb3JtLmtleSB8fCBhbmd1bGFyLmlzVW5kZWZpbmVkKGF0dHJzLmtleSkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmZvcm0gPSBmb3JtO1xuICAgICAgICAgICAgICAgICAgICBvbmNlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgIGlmIChuYW1lID09PSAnbW9kZWwnKSB7XG4gICAgICAgICAgICAgICAgLy9cIm1vZGVsXCIgaXMgYm91bmQgdG8gc2NvcGUgdW5kZXIgdGhlIG5hbWUgXCJtb2RlbFwiIHNpbmNlIHRoaXMgaXMgd2hhdCB0aGUgZGVjb3JhdG9yc1xuICAgICAgICAgICAgICAgIC8va25vdyBhbmQgbG92ZS5cbiAgICAgICAgICAgICAgICBzY29wZS4kd2F0Y2godmFsdWUsIGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgICAgICAgaWYgKHZhbCAmJiBzY29wZS5tb2RlbCAhPT0gdmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLm1vZGVsID0gdmFsO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKHdhdGNoVGhpc1tuYW1lXSA9PT0gJ2MnKSB7XG4gICAgICAgICAgICAgICAgLy93YXRjaCBjb2xsZWN0aW9uXG4gICAgICAgICAgICAgICAgc2NvcGUuJHdhdGNoQ29sbGVjdGlvbih2YWx1ZSwgdXBkYXRlRm9ybSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8kb2JzZXJ2ZVxuICAgICAgICAgICAgICAgIGF0dHJzLiRvYnNlcnZlKG5hbWUsIHVwZGF0ZUZvcm0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGRlY29yYXRvciBkaXJlY3RpdmUgYW5kIGl0cyBzaWJsaW5nIFwibWFudWFsXCIgdXNlIGRpcmVjdGl2ZXMuXG4gICAqIFRoZSBkaXJlY3RpdmUgY2FuIGJlIHVzZWQgdG8gY3JlYXRlIGZvcm0gZmllbGRzIG9yIG90aGVyIGZvcm0gZW50aXRpZXMuXG4gICAqIEl0IGNhbiBiZSB1c2VkIGluIGNvbmp1bmN0aW9uIHdpdGggPHNjaGVtYS1mb3JtPiBkaXJlY3RpdmUgaW4gd2hpY2ggY2FzZSB0aGUgZGVjb3JhdG9yIGlzXG4gICAqIGdpdmVuIGl0J3MgY29uZmlndXJhdGlvbiB2aWEgYSB0aGUgXCJmb3JtXCIgYXR0cmlidXRlLlxuICAgKlxuICAgKiBleC4gQmFzaWMgdXNhZ2VcbiAgICogICA8c2YtZGVjb3JhdG9yIGZvcm09XCJteWZvcm1cIj48L3NmLWRlY29yYXRvcj5cbiAgICoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIGRpcmVjdGl2ZSBuYW1lIChDYW1lbENhc2VkKVxuICAgKiBAcGFyYW0ge09iamVjdH0gbWFwcGluZ3MsIGFuIG9iamVjdCB0aGF0IG1hcHMgXCJ0eXBlXCIgPT4gXCJ0ZW1wbGF0ZVVybFwiXG4gICAqIEBwYXJhbSB7QXJyYXl9ICBydWxlcyAob3B0aW9uYWwpIGEgbGlzdCBvZiBmdW5jdGlvbnMsIGZ1bmN0aW9uKGZvcm0pIHt9LCB0aGF0IGFyZSBlYWNoIHRyaWVkIGluXG4gICAqICAgICAgICAgICAgICAgICB0dXJuLFxuICAgKiAgICAgICAgICAgICAgICAgaWYgdGhleSByZXR1cm4gYSBzdHJpbmcgdGhlbiB0aGF0IGlzIHVzZWQgYXMgdGhlIHRlbXBsYXRlVXJsLiBSdWxlcyBjb21lIGJlZm9yZVxuICAgKiAgICAgICAgICAgICAgICAgbWFwcGluZ3MuXG4gICAqL1xuICB0aGlzLmNyZWF0ZURlY29yYXRvciA9IGZ1bmN0aW9uKG5hbWUsIG1hcHBpbmdzLCBydWxlcywgb3B0aW9ucykge1xuICAgIGRpcmVjdGl2ZXNbbmFtZV0gPSB7XG4gICAgICBtYXBwaW5nczogbWFwcGluZ3MgfHwge30sXG4gICAgICBydWxlczogICAgcnVsZXMgICAgfHwgW11cbiAgICB9O1xuXG4gICAgaWYgKCFkaXJlY3RpdmVzW2RlZmF1bHREZWNvcmF0b3JdKSB7XG4gICAgICBkZWZhdWx0RGVjb3JhdG9yID0gbmFtZTtcbiAgICB9XG4gICAgY3JlYXRlRGlyZWN0aXZlKG5hbWUsIG9wdGlvbnMpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgZGlyZWN0aXZlIG9mIGEgZGVjb3JhdG9yXG4gICAqIFVzYWJsZSB3aGVuIHlvdSB3YW50IHRvIHVzZSB0aGUgZGVjb3JhdG9ycyB3aXRob3V0IHVzaW5nIDxzY2hlbWEtZm9ybT4gZGlyZWN0aXZlLlxuICAgKiBTcGVjaWZpY2FsbHkgd2hlbiB5b3UgbmVlZCB0byByZXVzZSBzdHlsaW5nLlxuICAgKlxuICAgKiBleC4gY3JlYXRlRGlyZWN0aXZlKCd0ZXh0JywnLi4uJylcbiAgICogIDxzZi10ZXh0IHRpdGxlPVwiZm9vYmFyXCIgbW9kZWw9XCJwZXJzb25cIiBrZXk9XCJuYW1lXCIgc2NoZW1hPVwic2NoZW1hXCI+PC9zZi10ZXh0PlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gIHR5cGUgVGhlIHR5cGUgb2YgdGhlIGRpcmVjdGl2ZSwgcmVzdWx0aW5nIGRpcmVjdGl2ZSB3aWxsIGhhdmUgc2YtIHByZWZpeGVkXG4gICAqIEBwYXJhbSB7c3RyaW5nfSAgdGVtcGxhdGVVcmxcbiAgICogQHBhcmFtIHtib29sZWFufSB0cmFuc2NsdWRlIChvcHRpb25hbCkgc2V0cyB0cmFuc2NsdWRlIG9wdGlvbiBvZiBkaXJlY3RpdmUsIGRlZmF1bHRzIHRvIGZhbHNlLlxuICAgKi9cbiAgdGhpcy5jcmVhdGVEaXJlY3RpdmUgPSBjcmVhdGVNYW51YWxEaXJlY3RpdmU7XG5cbiAgLyoqXG4gICAqIFNhbWUgYXMgY3JlYXRlRGlyZWN0aXZlLCBidXQgdGFrZXMgYW4gb2JqZWN0IHdoZXJlIGtleSBpcyAndHlwZScgYW5kIHZhbHVlIGlzICd0ZW1wbGF0ZVVybCdcbiAgICogVXNlZnVsIGZvciBiYXRjaGluZy5cbiAgICogQHBhcmFtIHtPYmplY3R9IG1hcHBpbmdzXG4gICAqL1xuICB0aGlzLmNyZWF0ZURpcmVjdGl2ZXMgPSBmdW5jdGlvbihtYXBwaW5ncykge1xuICAgIGFuZ3VsYXIuZm9yRWFjaChtYXBwaW5ncywgZnVuY3Rpb24odXJsLCB0eXBlKSB7XG4gICAgICBjcmVhdGVNYW51YWxEaXJlY3RpdmUodHlwZSwgdXJsKTtcbiAgICB9KTtcbiAgfTtcblxuICAvKipcbiAgICogR2V0dGVyIGZvciBkaXJlY3RpdmUgbWFwcGluZ3NcbiAgICogQ2FuIGJlIHVzZWQgdG8gb3ZlcnJpZGUgYSBtYXBwaW5nIG9yIGFkZCBhIHJ1bGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgKG9wdGlvbmFsKSBkZWZhdWx0cyB0byBkZWZhdWx0RGVjb3JhdG9yXG4gICAqIEByZXR1cm4ge09iamVjdH0gcnVsZXMgYW5kIG1hcHBpbmdzIHsgcnVsZXM6IFtdLG1hcHBpbmdzOiB7fX1cbiAgICovXG4gIHRoaXMuZGlyZWN0aXZlID0gZnVuY3Rpb24obmFtZSkge1xuICAgIG5hbWUgPSBuYW1lIHx8IGRlZmF1bHREZWNvcmF0b3I7XG4gICAgcmV0dXJuIGRpcmVjdGl2ZXNbbmFtZV07XG4gIH07XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBtYXBwaW5nIHRvIGFuIGV4aXN0aW5nIGRlY29yYXRvci5cbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgRGVjb3JhdG9yIG5hbWVcbiAgICogQHBhcmFtIHtTdHJpbmd9IHR5cGUgRm9ybSB0eXBlIGZvciB0aGUgbWFwcGluZ1xuICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsICBUaGUgdGVtcGxhdGUgdXJsXG4gICAqL1xuICB0aGlzLmFkZE1hcHBpbmcgPSBmdW5jdGlvbihuYW1lLCB0eXBlLCB1cmwpIHtcbiAgICBpZiAoZGlyZWN0aXZlc1tuYW1lXSkge1xuICAgICAgZGlyZWN0aXZlc1tuYW1lXS5tYXBwaW5nc1t0eXBlXSA9IHVybDtcbiAgICB9XG4gIH07XG5cbiAgLy9TZXJ2aWNlIGlzIGp1c3QgYSBnZXR0ZXIgZm9yIGRpcmVjdGl2ZSBtYXBwaW5ncyBhbmQgcnVsZXNcbiAgdGhpcy4kZ2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRpcmVjdGl2ZTogZnVuY3Rpb24obmFtZSkge1xuICAgICAgICByZXR1cm4gZGlyZWN0aXZlc1tuYW1lXTtcbiAgICAgIH0sXG4gICAgICBkZWZhdWx0RGVjb3JhdG9yOiBkZWZhdWx0RGVjb3JhdG9yXG4gICAgfTtcbiAgfTtcblxuICAvL0NyZWF0ZSBhIGRlZmF1bHQgZGlyZWN0aXZlXG4gIGNyZWF0ZURpcmVjdGl2ZSgnc2ZEZWNvcmF0b3InKTtcblxufV0pO1xuXG4vKipcbiAqIFNjaGVtYSBmb3JtIHNlcnZpY2UuXG4gKiBUaGlzIHNlcnZpY2UgaXMgbm90IHRoYXQgdXNlZnVsIG91dHNpZGUgb2Ygc2NoZW1hIGZvcm0gZGlyZWN0aXZlXG4gKiBidXQgbWFrZXMgdGhlIGNvZGUgbW9yZSB0ZXN0YWJsZS5cbiAqL1xuYW5ndWxhci5tb2R1bGUoJ3NjaGVtYUZvcm0nKS5wcm92aWRlcignc2NoZW1hRm9ybScsXG5bJ3NmUGF0aFByb3ZpZGVyJywgZnVuY3Rpb24oc2ZQYXRoUHJvdmlkZXIpIHtcblxuICAvL0NyZWF0ZXMgYW4gZGVmYXVsdCB0aXRsZU1hcCBsaXN0IGZyb20gYW4gZW51bSwgaS5lLiBhIGxpc3Qgb2Ygc3RyaW5ncy5cbiAgdmFyIGVudW1Ub1RpdGxlTWFwID0gZnVuY3Rpb24oZW5tKSB7XG4gICAgdmFyIHRpdGxlTWFwID0gW107IC8vY2Fub25pY2FsIHRpdGxlTWFwIGZvcm1hdCBpcyBhIGxpc3QuXG4gICAgZW5tLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgdGl0bGVNYXAucHVzaCh7bmFtZTogbmFtZSwgdmFsdWU6IG5hbWV9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gdGl0bGVNYXA7XG4gIH07XG5cbiAgLy8gVGFrZXMgYSB0aXRsZU1hcCBpbiBlaXRoZXIgb2JqZWN0IG9yIGxpc3QgZm9ybWF0IGFuZCByZXR1cm5zIG9uZSBpblxuICAvLyBpbiB0aGUgbGlzdCBmb3JtYXQuXG4gIHZhciBjYW5vbmljYWxUaXRsZU1hcCA9IGZ1bmN0aW9uKHRpdGxlTWFwLCBvcmlnaW5hbEVudW0pIHtcbiAgICBpZiAoIWFuZ3VsYXIuaXNBcnJheSh0aXRsZU1hcCkpIHtcbiAgICAgIHZhciBjYW5vbmljYWwgPSBbXTtcbiAgICAgIGlmIChvcmlnaW5hbEVudW0pIHtcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKG9yaWdpbmFsRW51bSwgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgY2Fub25pY2FsLnB1c2goe25hbWU6IHRpdGxlTWFwW3ZhbHVlXSwgdmFsdWU6IHZhbHVlfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRpdGxlTWFwLCBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgICAgICAgIGNhbm9uaWNhbC5wdXNoKHtuYW1lOiBuYW1lLCB2YWx1ZTogdmFsdWV9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gY2Fub25pY2FsO1xuICAgIH1cbiAgICByZXR1cm4gdGl0bGVNYXA7XG4gIH07XG5cbiAgdmFyIGRlZmF1bHRGb3JtRGVmaW5pdGlvbiA9IGZ1bmN0aW9uKG5hbWUsIHNjaGVtYSwgb3B0aW9ucykge1xuICAgIHZhciBydWxlcyA9IGRlZmF1bHRzW3NjaGVtYS50eXBlXTtcbiAgICBpZiAocnVsZXMpIHtcbiAgICAgIHZhciBkZWY7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJ1bGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGRlZiA9IHJ1bGVzW2ldKG5hbWUsIHNjaGVtYSwgb3B0aW9ucyk7XG4gICAgICAgIC8vZmlyc3QgaGFuZGxlciBpbiBsaXN0IHRoYXQgYWN0dWFsbHkgcmV0dXJucyBzb21ldGhpbmcgaXMgb3VyIGhhbmRsZXIhXG4gICAgICAgIGlmIChkZWYpIHtcbiAgICAgICAgICByZXR1cm4gZGVmO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIC8vQ3JlYXRlcyBhIGZvcm0gb2JqZWN0IHdpdGggYWxsIGNvbW1vbiBwcm9wZXJ0aWVzXG4gIHZhciBzdGRGb3JtT2JqID0gZnVuY3Rpb24obmFtZSwgc2NoZW1hLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdmFyIGYgPSBvcHRpb25zLmdsb2JhbCAmJiBvcHRpb25zLmdsb2JhbC5mb3JtRGVmYXVsdHMgP1xuICAgICAgICAgICAgYW5ndWxhci5jb3B5KG9wdGlvbnMuZ2xvYmFsLmZvcm1EZWZhdWx0cykgOiB7fTtcbiAgICBpZiAob3B0aW9ucy5nbG9iYWwgJiYgb3B0aW9ucy5nbG9iYWwuc3VwcmVzc1Byb3BlcnR5VGl0bGVzID09PSB0cnVlKSB7XG4gICAgICBmLnRpdGxlID0gc2NoZW1hLnRpdGxlO1xuICAgIH0gZWxzZSB7XG4gICAgICBmLnRpdGxlID0gc2NoZW1hLnRpdGxlIHx8IG5hbWU7XG4gICAgfVxuXG4gICAgaWYgKHNjaGVtYS5kZXNjcmlwdGlvbikgeyBmLmRlc2NyaXB0aW9uID0gc2NoZW1hLmRlc2NyaXB0aW9uOyB9XG4gICAgaWYgKG9wdGlvbnMucmVxdWlyZWQgPT09IHRydWUgfHwgc2NoZW1hLnJlcXVpcmVkID09PSB0cnVlKSB7IGYucmVxdWlyZWQgPSB0cnVlOyB9XG4gICAgaWYgKHNjaGVtYS5tYXhMZW5ndGgpIHsgZi5tYXhsZW5ndGggPSBzY2hlbWEubWF4TGVuZ3RoOyB9XG4gICAgaWYgKHNjaGVtYS5taW5MZW5ndGgpIHsgZi5taW5sZW5ndGggPSBzY2hlbWEubWF4TGVuZ3RoOyB9XG4gICAgaWYgKHNjaGVtYS5yZWFkT25seSB8fCBzY2hlbWEucmVhZG9ubHkpIHsgZi5yZWFkb25seSAgPSB0cnVlOyB9XG4gICAgaWYgKHNjaGVtYS5taW5pbXVtKSB7IGYubWluaW11bSA9IHNjaGVtYS5taW5pbXVtICsgKHNjaGVtYS5leGNsdXNpdmVNaW5pbXVtID8gMSA6IDApOyB9XG4gICAgaWYgKHNjaGVtYS5tYXhpbXVtKSB7IGYubWF4aW11bSA9IHNjaGVtYS5tYXhpbXVtIC0gKHNjaGVtYS5leGNsdXNpdmVNYXhpbXVtID8gMSA6IDApOyB9XG5cbiAgICAvL05vbiBzdGFuZGFyZCBhdHRyaWJ1dGVzXG4gICAgaWYgKHNjaGVtYS52YWxpZGF0aW9uTWVzc2FnZSkgeyBmLnZhbGlkYXRpb25NZXNzYWdlID0gc2NoZW1hLnZhbGlkYXRpb25NZXNzYWdlOyB9XG4gICAgaWYgKHNjaGVtYS5lbnVtTmFtZXMpIHsgZi50aXRsZU1hcCA9IGNhbm9uaWNhbFRpdGxlTWFwKHNjaGVtYS5lbnVtTmFtZXMsIHNjaGVtYVsnZW51bSddKTsgfVxuICAgIGYuc2NoZW1hID0gc2NoZW1hO1xuXG4gICAgLy8gTmcgbW9kZWwgb3B0aW9ucyBkb2Vzbid0IHBsYXkgbmljZSB3aXRoIHVuZGVmaW5lZCwgbWlnaHQgYmUgZGVmaW5lZFxuICAgIC8vIGdsb2JhbGx5IHRob3VnaFxuICAgIGYubmdNb2RlbE9wdGlvbnMgPSBmLm5nTW9kZWxPcHRpb25zIHx8IHt9O1xuICAgIHJldHVybiBmO1xuICB9O1xuXG4gIHZhciB0ZXh0ID0gZnVuY3Rpb24obmFtZSwgc2NoZW1hLCBvcHRpb25zKSB7XG4gICAgaWYgKHNjaGVtYS50eXBlID09PSAnc3RyaW5nJyAmJiAhc2NoZW1hWydlbnVtJ10pIHtcbiAgICAgIHZhciBmID0gc3RkRm9ybU9iaihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpO1xuICAgICAgZi5rZXkgID0gb3B0aW9ucy5wYXRoO1xuICAgICAgZi50eXBlID0gJ3RleHQnO1xuICAgICAgb3B0aW9ucy5sb29rdXBbc2ZQYXRoUHJvdmlkZXIuc3RyaW5naWZ5KG9wdGlvbnMucGF0aCldID0gZjtcbiAgICAgIHJldHVybiBmO1xuICAgIH1cbiAgfTtcblxuICAvL2RlZmF1bHQgaW4ganNvbiBmb3JtIGZvciBudW1iZXIgYW5kIGludGVnZXIgaXMgYSB0ZXh0IGZpZWxkXG4gIC8vaW5wdXQgdHlwZT1cIm51bWJlclwiIHdvdWxkIGJlIG1vcmUgc3VpdGFibGUgZG9uJ3QgeWEgdGhpbms/XG4gIHZhciBudW1iZXIgPSBmdW5jdGlvbihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpIHtcbiAgICBpZiAoc2NoZW1hLnR5cGUgPT09ICdudW1iZXInKSB7XG4gICAgICB2YXIgZiA9IHN0ZEZvcm1PYmoobmFtZSwgc2NoZW1hLCBvcHRpb25zKTtcbiAgICAgIGYua2V5ICA9IG9wdGlvbnMucGF0aDtcbiAgICAgIGYudHlwZSA9ICdudW1iZXInO1xuICAgICAgb3B0aW9ucy5sb29rdXBbc2ZQYXRoUHJvdmlkZXIuc3RyaW5naWZ5KG9wdGlvbnMucGF0aCldID0gZjtcbiAgICAgIHJldHVybiBmO1xuICAgIH1cbiAgfTtcblxuICB2YXIgaW50ZWdlciA9IGZ1bmN0aW9uKG5hbWUsIHNjaGVtYSwgb3B0aW9ucykge1xuICAgIGlmIChzY2hlbWEudHlwZSA9PT0gJ2ludGVnZXInKSB7XG4gICAgICB2YXIgZiA9IHN0ZEZvcm1PYmoobmFtZSwgc2NoZW1hLCBvcHRpb25zKTtcbiAgICAgIGYua2V5ICA9IG9wdGlvbnMucGF0aDtcbiAgICAgIGYudHlwZSA9ICdudW1iZXInO1xuICAgICAgb3B0aW9ucy5sb29rdXBbc2ZQYXRoUHJvdmlkZXIuc3RyaW5naWZ5KG9wdGlvbnMucGF0aCldID0gZjtcbiAgICAgIHJldHVybiBmO1xuICAgIH1cbiAgfTtcblxuICB2YXIgY2hlY2tib3ggPSBmdW5jdGlvbihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpIHtcbiAgICBpZiAoc2NoZW1hLnR5cGUgPT09ICdib29sZWFuJykge1xuICAgICAgdmFyIGYgPSBzdGRGb3JtT2JqKG5hbWUsIHNjaGVtYSwgb3B0aW9ucyk7XG4gICAgICBmLmtleSAgPSBvcHRpb25zLnBhdGg7XG4gICAgICBmLnR5cGUgPSAnY2hlY2tib3gnO1xuICAgICAgb3B0aW9ucy5sb29rdXBbc2ZQYXRoUHJvdmlkZXIuc3RyaW5naWZ5KG9wdGlvbnMucGF0aCldID0gZjtcbiAgICAgIHJldHVybiBmO1xuICAgIH1cbiAgfTtcblxuICB2YXIgc2VsZWN0ID0gZnVuY3Rpb24obmFtZSwgc2NoZW1hLCBvcHRpb25zKSB7XG4gICAgaWYgKHNjaGVtYS50eXBlID09PSAnc3RyaW5nJyAmJiBzY2hlbWFbJ2VudW0nXSkge1xuICAgICAgdmFyIGYgPSBzdGRGb3JtT2JqKG5hbWUsIHNjaGVtYSwgb3B0aW9ucyk7XG4gICAgICBmLmtleSAgPSBvcHRpb25zLnBhdGg7XG4gICAgICBmLnR5cGUgPSAnc2VsZWN0JztcbiAgICAgIGlmICghZi50aXRsZU1hcCkge1xuICAgICAgICBmLnRpdGxlTWFwID0gZW51bVRvVGl0bGVNYXAoc2NoZW1hWydlbnVtJ10pO1xuICAgICAgfVxuICAgICAgb3B0aW9ucy5sb29rdXBbc2ZQYXRoUHJvdmlkZXIuc3RyaW5naWZ5KG9wdGlvbnMucGF0aCldID0gZjtcbiAgICAgIHJldHVybiBmO1xuICAgIH1cbiAgfTtcblxuICB2YXIgY2hlY2tib3hlcyA9IGZ1bmN0aW9uKG5hbWUsIHNjaGVtYSwgb3B0aW9ucykge1xuICAgIGlmIChzY2hlbWEudHlwZSA9PT0gJ2FycmF5JyAmJiBzY2hlbWEuaXRlbXMgJiYgc2NoZW1hLml0ZW1zWydlbnVtJ10pIHtcbiAgICAgIHZhciBmID0gc3RkRm9ybU9iaihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpO1xuICAgICAgZi5rZXkgID0gb3B0aW9ucy5wYXRoO1xuICAgICAgZi50eXBlID0gJ2NoZWNrYm94ZXMnO1xuICAgICAgaWYgKCFmLnRpdGxlTWFwKSB7XG4gICAgICAgIGYudGl0bGVNYXAgPSBlbnVtVG9UaXRsZU1hcChzY2hlbWEuaXRlbXNbJ2VudW0nXSk7XG4gICAgICB9XG4gICAgICBvcHRpb25zLmxvb2t1cFtzZlBhdGhQcm92aWRlci5zdHJpbmdpZnkob3B0aW9ucy5wYXRoKV0gPSBmO1xuICAgICAgcmV0dXJuIGY7XG4gICAgfVxuICB9O1xuXG4gIHZhciBmaWVsZHNldCA9IGZ1bmN0aW9uKG5hbWUsIHNjaGVtYSwgb3B0aW9ucykge1xuICAgIGlmIChzY2hlbWEudHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHZhciBmICAgPSBzdGRGb3JtT2JqKG5hbWUsIHNjaGVtYSwgb3B0aW9ucyk7XG4gICAgICBmLnR5cGUgID0gJ2ZpZWxkc2V0JztcbiAgICAgIGYuaXRlbXMgPSBbXTtcbiAgICAgIG9wdGlvbnMubG9va3VwW3NmUGF0aFByb3ZpZGVyLnN0cmluZ2lmeShvcHRpb25zLnBhdGgpXSA9IGY7XG5cbiAgICAgIC8vcmVjdXJzZSBkb3duIGludG8gcHJvcGVydGllc1xuICAgICAgYW5ndWxhci5mb3JFYWNoKHNjaGVtYS5wcm9wZXJ0aWVzLCBmdW5jdGlvbih2LCBrKSB7XG4gICAgICAgIHZhciBwYXRoID0gb3B0aW9ucy5wYXRoLnNsaWNlKCk7XG4gICAgICAgIHBhdGgucHVzaChrKTtcbiAgICAgICAgaWYgKG9wdGlvbnMuaWdub3JlW3NmUGF0aFByb3ZpZGVyLnN0cmluZ2lmeShwYXRoKV0gIT09IHRydWUpIHtcbiAgICAgICAgICB2YXIgcmVxdWlyZWQgPSBzY2hlbWEucmVxdWlyZWQgJiYgc2NoZW1hLnJlcXVpcmVkLmluZGV4T2YoaykgIT09IC0xO1xuXG4gICAgICAgICAgdmFyIGRlZiA9IGRlZmF1bHRGb3JtRGVmaW5pdGlvbihrLCB2LCB7XG4gICAgICAgICAgICBwYXRoOiBwYXRoLFxuICAgICAgICAgICAgcmVxdWlyZWQ6IHJlcXVpcmVkIHx8IGZhbHNlLFxuICAgICAgICAgICAgbG9va3VwOiBvcHRpb25zLmxvb2t1cCxcbiAgICAgICAgICAgIGlnbm9yZTogb3B0aW9ucy5pZ25vcmVcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAoZGVmKSB7XG4gICAgICAgICAgICBmLml0ZW1zLnB1c2goZGVmKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gZjtcbiAgICB9XG5cbiAgfTtcblxuICB2YXIgYXJyYXkgPSBmdW5jdGlvbihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpIHtcblxuICAgIGlmIChzY2hlbWEudHlwZSA9PT0gJ2FycmF5Jykge1xuICAgICAgdmFyIGYgICA9IHN0ZEZvcm1PYmoobmFtZSwgc2NoZW1hLCBvcHRpb25zKTtcbiAgICAgIGYudHlwZSAgPSAnYXJyYXknO1xuICAgICAgZi5rZXkgICA9IG9wdGlvbnMucGF0aDtcbiAgICAgIG9wdGlvbnMubG9va3VwW3NmUGF0aFByb3ZpZGVyLnN0cmluZ2lmeShvcHRpb25zLnBhdGgpXSA9IGY7XG5cbiAgICAgIHZhciByZXF1aXJlZCA9IHNjaGVtYS5yZXF1aXJlZCAmJlxuICAgICAgICAgICAgICAgICAgICAgc2NoZW1hLnJlcXVpcmVkLmluZGV4T2Yob3B0aW9ucy5wYXRoW29wdGlvbnMucGF0aC5sZW5ndGggLSAxXSkgIT09IC0xO1xuXG4gICAgICAvLyBUaGUgZGVmYXVsdCBpcyB0byBhbHdheXMganVzdCBjcmVhdGUgb25lIGNoaWxkLiBUaGlzIHdvcmtzIHNpbmNlIGlmIHRoZVxuICAgICAgLy8gc2NoZW1hcyBpdGVtcyBkZWNsYXJhdGlvbiBpcyBvZiB0eXBlOiBcIm9iamVjdFwiIHRoZW4gd2UgZ2V0IGEgZmllbGRzZXQuXG4gICAgICAvLyBXZSBhbHNvIGZvbGxvdyBqc29uIGZvcm0gbm90YXRhdGlvbiwgYWRkaW5nIGVtcHR5IGJyYWNrZXRzIFwiW11cIiB0b1xuICAgICAgLy8gc2lnbmlmeSBhcnJheXMuXG5cbiAgICAgIHZhciBhcnJQYXRoID0gb3B0aW9ucy5wYXRoLnNsaWNlKCk7XG4gICAgICBhcnJQYXRoLnB1c2goJycpO1xuXG4gICAgICBmLml0ZW1zID0gW2RlZmF1bHRGb3JtRGVmaW5pdGlvbihuYW1lLCBzY2hlbWEuaXRlbXMsIHtcbiAgICAgICAgcGF0aDogYXJyUGF0aCxcbiAgICAgICAgcmVxdWlyZWQ6IHJlcXVpcmVkIHx8IGZhbHNlLFxuICAgICAgICBsb29rdXA6IG9wdGlvbnMubG9va3VwLFxuICAgICAgICBpZ25vcmU6IG9wdGlvbnMuaWdub3JlLFxuICAgICAgICBnbG9iYWw6IG9wdGlvbnMuZ2xvYmFsXG4gICAgICB9KV07XG5cbiAgICAgIHJldHVybiBmO1xuICAgIH1cblxuICB9O1xuXG4gIC8vRmlyc3Qgc29ydGVkIGJ5IHNjaGVtYSB0eXBlIHRoZW4gYSBsaXN0LlxuICAvL09yZGVyIGhhcyBpbXBvcnRhbmNlLiBGaXJzdCBoYW5kbGVyIHJldHVybmluZyBhbiBmb3JtIHNuaXBwZXQgd2lsbCBiZSB1c2VkLlxuICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgc3RyaW5nOiAgW3NlbGVjdCwgdGV4dF0sXG4gICAgb2JqZWN0OiAgW2ZpZWxkc2V0XSxcbiAgICBudW1iZXI6ICBbbnVtYmVyXSxcbiAgICBpbnRlZ2VyOiBbaW50ZWdlcl0sXG4gICAgYm9vbGVhbjogW2NoZWNrYm94XSxcbiAgICBhcnJheTogICBbY2hlY2tib3hlcywgYXJyYXldXG4gIH07XG5cbiAgdmFyIHBvc3RQcm9jZXNzRm4gPSBmdW5jdGlvbihmb3JtKSB7IHJldHVybiBmb3JtOyB9O1xuXG4gIC8qKlxuICAgKiBQcm92aWRlciBBUElcbiAgICovXG4gIHRoaXMuZGVmYXVsdHMgICAgICAgICAgICAgID0gZGVmYXVsdHM7XG4gIHRoaXMuc3RkRm9ybU9iaiAgICAgICAgICAgID0gc3RkRm9ybU9iajtcbiAgdGhpcy5kZWZhdWx0Rm9ybURlZmluaXRpb24gPSBkZWZhdWx0Rm9ybURlZmluaXRpb247XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGEgcG9zdCBwcm9jZXNzIGZ1bmN0aW9uLlxuICAgKiBUaGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCB3aXRoIHRoZSBmdWxseSBtZXJnZWRcbiAgICogZm9ybSBkZWZpbml0aW9uIChpLmUuIGFmdGVyIG1lcmdpbmcgd2l0aCBzY2hlbWEpXG4gICAqIGFuZCB3aGF0ZXZlciBpdCByZXR1cm5zIGlzIHVzZWQgYXMgZm9ybS5cbiAgICovXG4gIHRoaXMucG9zdFByb2Nlc3MgPSBmdW5jdGlvbihmbikge1xuICAgIHBvc3RQcm9jZXNzRm4gPSBmbjtcbiAgfTtcblxuICAvKipcbiAgICogQXBwZW5kIGRlZmF1bHQgZm9ybSBydWxlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSAgIHR5cGUganNvbiBzY2hlbWEgdHlwZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBydWxlIGEgZnVuY3Rpb24ocHJvcGVydHlOYW1lLHByb3BlcnR5U2NoZW1hLG9wdGlvbnMpIHRoYXQgcmV0dXJucyBhIGZvcm1cbiAgICogICAgICAgICAgICAgICAgICAgICAgICBkZWZpbml0aW9uIG9yIHVuZGVmaW5lZFxuICAgKi9cbiAgdGhpcy5hcHBlbmRSdWxlID0gZnVuY3Rpb24odHlwZSwgcnVsZSkge1xuICAgIGlmICghZGVmYXVsdHNbdHlwZV0pIHtcbiAgICAgIGRlZmF1bHRzW3R5cGVdID0gW107XG4gICAgfVxuICAgIGRlZmF1bHRzW3R5cGVdLnB1c2gocnVsZSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFByZXBlbmQgZGVmYXVsdCBmb3JtIHJ1bGVcbiAgICogQHBhcmFtIHtzdHJpbmd9ICAgdHlwZSBqc29uIHNjaGVtYSB0eXBlXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IHJ1bGUgYSBmdW5jdGlvbihwcm9wZXJ0eU5hbWUscHJvcGVydHlTY2hlbWEsb3B0aW9ucykgdGhhdCByZXR1cm5zIGEgZm9ybVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmluaXRpb24gb3IgdW5kZWZpbmVkXG4gICAqL1xuICB0aGlzLnByZXBlbmRSdWxlID0gZnVuY3Rpb24odHlwZSwgcnVsZSkge1xuICAgIGlmICghZGVmYXVsdHNbdHlwZV0pIHtcbiAgICAgIGRlZmF1bHRzW3R5cGVdID0gW107XG4gICAgfVxuICAgIGRlZmF1bHRzW3R5cGVdLnVuc2hpZnQocnVsZSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFV0aWxpdHkgZnVuY3Rpb24gdG8gY3JlYXRlIGEgc3RhbmRhcmQgZm9ybSBvYmplY3QuXG4gICAqIFRoaXMgZG9lcyAqbm90KiBzZXQgdGhlIHR5cGUgb2YgdGhlIGZvcm0gYnV0IHJhdGhlciBhbGwgc2hhcmVkIGF0dHJpYnV0ZXMuXG4gICAqIFlvdSBwcm9iYWJseSB3YW50IHRvIHN0YXJ0IHlvdXIgcnVsZSB3aXRoIGNyZWF0aW5nIHRoZSBmb3JtIHdpdGggdGhpcyBtZXRob2RcbiAgICogdGhlbiBzZXR0aW5nIHR5cGUgYW5kIGFueSBvdGhlciB2YWx1ZXMgeW91IG5lZWQuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBzY2hlbWFcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICogQHJldHVybiB7T2JqZWN0fSBhIGZvcm0gZmllbGQgZGVmaW50aW9uXG4gICAqL1xuICB0aGlzLmNyZWF0ZVN0YW5kYXJkRm9ybSA9IHN0ZEZvcm1PYmo7XG4gIC8qIEVuZCBQcm92aWRlciBBUEkgKi9cblxuICB0aGlzLiRnZXQgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZXJ2aWNlID0ge307XG5cbiAgICBzZXJ2aWNlLm1lcmdlID0gZnVuY3Rpb24oc2NoZW1hLCBmb3JtLCBpZ25vcmUsIG9wdGlvbnMsIHJlYWRvbmx5KSB7XG4gICAgICBmb3JtICA9IGZvcm0gfHwgWycqJ107XG4gICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgICAgLy8gR2V0IHJlYWRvbmx5IGZyb20gcm9vdCBvYmplY3RcbiAgICAgIHJlYWRvbmx5ID0gcmVhZG9ubHkgfHwgc2NoZW1hLnJlYWRvbmx5IHx8IHNjaGVtYS5yZWFkT25seTtcblxuICAgICAgdmFyIHN0ZEZvcm0gPSBzZXJ2aWNlLmRlZmF1bHRzKHNjaGVtYSwgaWdub3JlLCBvcHRpb25zKTtcblxuICAgICAgLy9zaW1wbGUgY2FzZSwgd2UgaGF2ZSBhIFwiKlwiLCBqdXN0IHB1dCB0aGUgc3RkRm9ybSB0aGVyZVxuICAgICAgdmFyIGlkeCA9IGZvcm0uaW5kZXhPZignKicpO1xuICAgICAgaWYgKGlkeCAhPT0gLTEpIHtcbiAgICAgICAgZm9ybSAgPSBmb3JtLnNsaWNlKDAsIGlkeClcbiAgICAgICAgICAgICAgICAgICAgLmNvbmNhdChzdGRGb3JtLmZvcm0pXG4gICAgICAgICAgICAgICAgICAgIC5jb25jYXQoZm9ybS5zbGljZShpZHggKyAxKSk7XG4gICAgICB9XG5cbiAgICAgIC8vb2sgbGV0J3MgbWVyZ2UhXG4gICAgICAvL1dlIGxvb2sgYXQgdGhlIHN1cHBsaWVkIGZvcm0gYW5kIGV4dGVuZCBpdCB3aXRoIHNjaGVtYSBzdGFuZGFyZHNcbiAgICAgIHZhciBsb29rdXAgPSBzdGRGb3JtLmxvb2t1cDtcblxuICAgICAgcmV0dXJuIHBvc3RQcm9jZXNzRm4oZm9ybS5tYXAoZnVuY3Rpb24ob2JqKSB7XG5cbiAgICAgICAgLy9oYW5kbGUgdGhlIHNob3J0Y3V0IHdpdGgganVzdCBhIG5hbWVcbiAgICAgICAgaWYgKHR5cGVvZiBvYmogPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgb2JqID0ge2tleTogb2JqfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvYmoua2V5KSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBvYmoua2V5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgb2JqLmtleSA9IHNmUGF0aFByb3ZpZGVyLnBhcnNlKG9iai5rZXkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vSWYgaXQgaGFzIGEgdGl0bGVNYXAgbWFrZSBzdXJlIGl0J3MgYSBsaXN0XG4gICAgICAgIGlmIChvYmoudGl0bGVNYXApIHtcbiAgICAgICAgICBvYmoudGl0bGVNYXAgPSBjYW5vbmljYWxUaXRsZU1hcChvYmoudGl0bGVNYXApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9cbiAgICAgICAgaWYgKG9iai5pdGVtRm9ybSkge1xuICAgICAgICAgIG9iai5pdGVtcyA9IFtdO1xuICAgICAgICAgIHZhciBzdHIgPSBzZlBhdGhQcm92aWRlci5zdHJpbmdpZnkob2JqLmtleSk7XG4gICAgICAgICAgdmFyIHN0ZEZvcm0gPSBsb29rdXBbc3RyXTtcbiAgICAgICAgICBhbmd1bGFyLmZvckVhY2goc3RkRm9ybS5pdGVtcywgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgdmFyIG8gPSBhbmd1bGFyLmNvcHkob2JqLml0ZW1Gb3JtKTtcbiAgICAgICAgICAgIG8ua2V5ID0gaXRlbS5rZXk7XG4gICAgICAgICAgICBvYmouaXRlbXMucHVzaChvKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vZXh0ZW5kIHdpdGggc3RkIGZvcm0gZnJvbSBzY2hlbWEuXG5cbiAgICAgICAgaWYgKG9iai5rZXkpIHtcbiAgICAgICAgICB2YXIgc3RyaWQgPSBzZlBhdGhQcm92aWRlci5zdHJpbmdpZnkob2JqLmtleSk7XG4gICAgICAgICAgaWYgKGxvb2t1cFtzdHJpZF0pIHtcbiAgICAgICAgICAgIG9iaiA9IGFuZ3VsYXIuZXh0ZW5kKGxvb2t1cFtzdHJpZF0sIG9iaik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQXJlIHdlIGluaGVyaXRpbmcgcmVhZG9ubHk/XG4gICAgICAgIGlmIChyZWFkb25seSA9PT0gdHJ1ZSkgeyAvLyBJbmhlcml0aW5nIGZhbHNlIGlzIG5vdCBjb29sLlxuICAgICAgICAgIG9iai5yZWFkb25seSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvL2lmIGl0J3MgYSB0eXBlIHdpdGggaXRlbXMsIG1lcmdlICdlbSFcbiAgICAgICAgaWYgKG9iai5pdGVtcykge1xuICAgICAgICAgIG9iai5pdGVtcyA9IHNlcnZpY2UubWVyZ2Uoc2NoZW1hLCBvYmouaXRlbXMsIGlnbm9yZSwgb3B0aW9ucywgb2JqLnJlYWRvbmx5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vaWYgaXRzIGhhcyB0YWJzLCBtZXJnZSB0aGVtIGFsc28hXG4gICAgICAgIGlmIChvYmoudGFicykge1xuICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChvYmoudGFicywgZnVuY3Rpb24odGFiKSB7XG4gICAgICAgICAgICB0YWIuaXRlbXMgPSBzZXJ2aWNlLm1lcmdlKHNjaGVtYSwgdGFiLml0ZW1zLCBpZ25vcmUsIG9wdGlvbnMsIG9iai5yZWFkb25seSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTcGVjaWFsIGNhc2U6IGNoZWNrYm94XG4gICAgICAgIC8vIFNpbmNlIGhhdmUgdG8gdGVybmFyeSBzdGF0ZSB3ZSBuZWVkIGEgZGVmYXVsdFxuICAgICAgICBpZiAob2JqLnR5cGUgPT09ICdjaGVja2JveCcgJiYgYW5ndWxhci5pc1VuZGVmaW5lZChvYmouc2NoZW1hWydkZWZhdWx0J10pKSB7XG4gICAgICAgICAgb2JqLnNjaGVtYVsnZGVmYXVsdCddID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgfSkpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgZm9ybSBkZWZhdWx0cyBmcm9tIHNjaGVtYVxuICAgICAqL1xuICAgIHNlcnZpY2UuZGVmYXVsdHMgPSBmdW5jdGlvbihzY2hlbWEsIGlnbm9yZSwgZ2xvYmFsT3B0aW9ucykge1xuICAgICAgdmFyIGZvcm0gICA9IFtdO1xuICAgICAgdmFyIGxvb2t1cCA9IHt9OyAvL01hcCBwYXRoID0+IGZvcm0gb2JqIGZvciBmYXN0IGxvb2t1cCBpbiBtZXJnaW5nXG4gICAgICBpZ25vcmUgPSBpZ25vcmUgfHwge307XG4gICAgICBnbG9iYWxPcHRpb25zID0gZ2xvYmFsT3B0aW9ucyB8fCB7fTtcblxuICAgICAgaWYgKHNjaGVtYS50eXBlID09PSAnb2JqZWN0Jykge1xuICAgICAgICBhbmd1bGFyLmZvckVhY2goc2NoZW1hLnByb3BlcnRpZXMsIGZ1bmN0aW9uKHYsIGspIHtcbiAgICAgICAgICBpZiAoaWdub3JlW2tdICE9PSB0cnVlKSB7XG4gICAgICAgICAgICB2YXIgcmVxdWlyZWQgPSBzY2hlbWEucmVxdWlyZWQgJiYgc2NoZW1hLnJlcXVpcmVkLmluZGV4T2YoaykgIT09IC0xO1xuICAgICAgICAgICAgdmFyIGRlZiA9IGRlZmF1bHRGb3JtRGVmaW5pdGlvbihrLCB2LCB7XG4gICAgICAgICAgICAgIHBhdGg6IFtrXSwgICAgICAgICAvLyBQYXRoIHRvIHRoaXMgcHJvcGVydHkgaW4gYnJhY2tldCBub3RhdGlvbi5cbiAgICAgICAgICAgICAgbG9va3VwOiBsb29rdXAsICAgIC8vIEV4dHJhIG1hcCB0byByZWdpc3RlciB3aXRoLiBPcHRpbWl6YXRpb24gZm9yIG1lcmdlci5cbiAgICAgICAgICAgICAgaWdub3JlOiBpZ25vcmUsICAgIC8vIFRoZSBpZ25vcmUgbGlzdCBvZiBwYXRocyAoc2FucyByb290IGxldmVsIG5hbWUpXG4gICAgICAgICAgICAgIHJlcXVpcmVkOiByZXF1aXJlZCwgLy8gSXMgaXQgcmVxdWlyZWQ/ICh2NCBqc29uIHNjaGVtYSBzdHlsZSlcbiAgICAgICAgICAgICAgZ2xvYmFsOiBnbG9iYWxPcHRpb25zIC8vIEdsb2JhbCBvcHRpb25zLCBpbmNsdWRpbmcgZm9ybSBkZWZhdWx0c1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoZGVmKSB7XG4gICAgICAgICAgICAgIGZvcm0ucHVzaChkZWYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkLiBPbmx5IHR5cGUgXCJvYmplY3RcIiBhbGxvd2VkIGF0IHJvb3QgbGV2ZWwgb2Ygc2NoZW1hLicpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtmb3JtOiBmb3JtLCBsb29rdXA6IGxvb2t1cH07XG4gICAgfTtcblxuICAgIC8vVXRpbGl0eSBmdW5jdGlvbnNcbiAgICAvKipcbiAgICAgKiBUcmF2ZXJzZSBhIHNjaGVtYSwgYXBwbHlpbmcgYSBmdW5jdGlvbihzY2hlbWEscGF0aCkgb24gZXZlcnkgc3ViIHNjaGVtYVxuICAgICAqIGkuZS4gZXZlcnkgcHJvcGVydHkgb2YgYW4gb2JqZWN0LlxuICAgICAqL1xuICAgIHNlcnZpY2UudHJhdmVyc2VTY2hlbWEgPSBmdW5jdGlvbihzY2hlbWEsIGZuLCBwYXRoLCBpZ25vcmVBcnJheXMpIHtcbiAgICAgIGlnbm9yZUFycmF5cyA9IGFuZ3VsYXIuaXNEZWZpbmVkKGlnbm9yZUFycmF5cykgPyBpZ25vcmVBcnJheXMgOiB0cnVlO1xuXG4gICAgICBwYXRoID0gcGF0aCB8fCBbXTtcblxuICAgICAgdmFyIHRyYXZlcnNlID0gZnVuY3Rpb24oc2NoZW1hLCBmbiwgcGF0aCkge1xuICAgICAgICBmbihzY2hlbWEsIHBhdGgpO1xuICAgICAgICBhbmd1bGFyLmZvckVhY2goc2NoZW1hLnByb3BlcnRpZXMsIGZ1bmN0aW9uKHByb3AsIG5hbWUpIHtcbiAgICAgICAgICB2YXIgY3VycmVudFBhdGggPSBwYXRoLnNsaWNlKCk7XG4gICAgICAgICAgY3VycmVudFBhdGgucHVzaChuYW1lKTtcbiAgICAgICAgICB0cmF2ZXJzZShwcm9wLCBmbiwgY3VycmVudFBhdGgpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvL09ubHkgc3VwcG9ydCB0eXBlIFwiYXJyYXlcIiB3aGljaCBoYXZlIGEgc2NoZW1hIGFzIFwiaXRlbXNcIi5cbiAgICAgICAgaWYgKCFpZ25vcmVBcnJheXMgJiYgc2NoZW1hLml0ZW1zKSB7XG4gICAgICAgICAgdmFyIGFyclBhdGggPSBwYXRoLnNsaWNlKCk7IGFyclBhdGgucHVzaCgnJyk7XG4gICAgICAgICAgdHJhdmVyc2Uoc2NoZW1hLml0ZW1zLCBmbiwgYXJyUGF0aCk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHRyYXZlcnNlKHNjaGVtYSwgZm4sIHBhdGggfHwgW10pO1xuICAgIH07XG5cbiAgICBzZXJ2aWNlLnRyYXZlcnNlRm9ybSA9IGZ1bmN0aW9uKGZvcm0sIGZuKSB7XG4gICAgICBmbihmb3JtKTtcbiAgICAgIGFuZ3VsYXIuZm9yRWFjaChmb3JtLml0ZW1zLCBmdW5jdGlvbihmKSB7XG4gICAgICAgIHNlcnZpY2UudHJhdmVyc2VGb3JtKGYsIGZuKTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoZm9ybS50YWJzKSB7XG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaChmb3JtLnRhYnMsIGZ1bmN0aW9uKHRhYikge1xuICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCh0YWIuaXRlbXMsIGZ1bmN0aW9uKGYpIHtcbiAgICAgICAgICAgIHNlcnZpY2UudHJhdmVyc2VGb3JtKGYsIGZuKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBzZXJ2aWNlO1xuICB9O1xuXG59XSk7XG5cbi8qICBDb21tb24gY29kZSBmb3IgdmFsaWRhdGluZyBhIHZhbHVlIGFnYWluc3QgaXRzIGZvcm0gYW5kIHNjaGVtYSBkZWZpbml0aW9uICovXG4vKiBnbG9iYWwgdHY0ICovXG5hbmd1bGFyLm1vZHVsZSgnc2NoZW1hRm9ybScpLmZhY3RvcnkoJ3NmVmFsaWRhdG9yJywgW2Z1bmN0aW9uKCkge1xuXG4gIHZhciB2YWxpZGF0b3IgPSB7fTtcblxuICAvKipcbiAgICogVmFsaWRhdGUgYSB2YWx1ZSBhZ2FpbnN0IGl0cyBmb3JtIGRlZmluaXRpb24gYW5kIHNjaGVtYS5cbiAgICogVGhlIHZhbHVlIHNob3VsZCBlaXRoZXIgYmUgb2YgcHJvcGVyIHR5cGUgb3IgYSBzdHJpbmcsIHNvbWUgdHlwZVxuICAgKiBjb2VyY2lvbiBpcyBhcHBsaWVkLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gZm9ybSBBIG1lcmdlZCBmb3JtIGRlZmluaXRpb24sIGkuZS4gb25lIHdpdGggYSBzY2hlbWEuXG4gICAqIEBwYXJhbSB7QW55fSB2YWx1ZSB0aGUgdmFsdWUgdG8gdmFsaWRhdGUuXG4gICAqIEByZXR1cm4gYSB0djRqcyByZXN1bHQgb2JqZWN0LlxuICAgKi9cbiAgdmFsaWRhdG9yLnZhbGlkYXRlID0gZnVuY3Rpb24oZm9ybSwgdmFsdWUpIHtcbiAgICBpZiAoIWZvcm0pIHtcbiAgICAgIHJldHVybiB7dmFsaWQ6IHRydWV9O1xuICAgIH1cbiAgICB2YXIgc2NoZW1hID0gZm9ybS5zY2hlbWE7XG5cbiAgICBpZiAoIXNjaGVtYSkge1xuICAgICAgcmV0dXJuIHt2YWxpZDogdHJ1ZX07XG4gICAgfVxuXG4gICAgLy8gSW5wdXQgb2YgdHlwZSB0ZXh0IGFuZCB0ZXh0YXJlYXMgd2lsbCBnaXZlIHVzIGEgdmlld1ZhbHVlIG9mICcnXG4gICAgLy8gd2hlbiBlbXB0eSwgdGhpcyBpcyBhIHZhbGlkIHZhbHVlIGluIGEgc2NoZW1hIGFuZCBkb2VzIG5vdCBjb3VudCBhcyBzb21ldGhpbmdcbiAgICAvLyB0aGF0IGJyZWFrcyB2YWxpZGF0aW9uIG9mICdyZXF1aXJlZCcuIEJ1dCBmb3Igb3VyIG93biBzYW5pdHkgYW4gZW1wdHkgZmllbGQgc2hvdWxkXG4gICAgLy8gbm90IHZhbGlkYXRlIGlmIGl0J3MgcmVxdWlyZWQuXG4gICAgaWYgKHZhbHVlID09PSAnJykge1xuICAgICAgdmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgLy8gTnVtYmVycyBmaWVsZHMgd2lsbCBnaXZlIGEgbnVsbCB2YWx1ZSwgd2hpY2ggYWxzbyBtZWFucyBlbXB0eSBmaWVsZFxuICAgIGlmIChmb3JtLnR5cGUgPT09ICdudW1iZXInICYmIHZhbHVlID09PSBudWxsKSB7XG4gICAgICB2YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICAvLyBWZXJzaW9uIDQgb2YgSlNPTiBTY2hlbWEgaGFzIHRoZSByZXF1aXJlZCBwcm9wZXJ0eSBub3Qgb24gdGhlXG4gICAgLy8gcHJvcGVydHkgaXRzZWxmIGJ1dCBvbiB0aGUgd3JhcHBpbmcgb2JqZWN0LiBTaW5jZSB3ZSBsaWtlIHRvIHRlc3RcbiAgICAvLyBvbmx5IHRoaXMgcHJvcGVydHkgd2Ugd3JhcCBpdCBpbiBhIGZha2Ugb2JqZWN0LlxuICAgIHZhciB3cmFwID0ge3R5cGU6ICdvYmplY3QnLCAncHJvcGVydGllcyc6IHt9fTtcbiAgICB2YXIgcHJvcE5hbWUgPSBmb3JtLmtleVtmb3JtLmtleS5sZW5ndGggLSAxXTtcbiAgICB3cmFwLnByb3BlcnRpZXNbcHJvcE5hbWVdID0gc2NoZW1hO1xuXG4gICAgaWYgKGZvcm0ucmVxdWlyZWQpIHtcbiAgICAgIHdyYXAucmVxdWlyZWQgPSBbcHJvcE5hbWVdO1xuICAgIH1cbiAgICB2YXIgdmFsdWVXcmFwID0ge307XG4gICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKHZhbHVlKSkge1xuICAgICAgdmFsdWVXcmFwW3Byb3BOYW1lXSA9IHZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gdHY0LnZhbGlkYXRlUmVzdWx0KHZhbHVlV3JhcCwgd3JhcCk7XG5cbiAgfTtcblxuICByZXR1cm4gdmFsaWRhdG9yO1xufV0pO1xuXG4vKipcbiAqIERpcmVjdGl2ZSB0aGF0IGhhbmRsZXMgdGhlIG1vZGVsIGFycmF5c1xuICovXG5hbmd1bGFyLm1vZHVsZSgnc2NoZW1hRm9ybScpLmRpcmVjdGl2ZSgnc2ZBcnJheScsIFsnc2ZTZWxlY3QnLCAnc2NoZW1hRm9ybScsICdzZlZhbGlkYXRvcicsXG4gIGZ1bmN0aW9uKHNmU2VsZWN0LCBzY2hlbWFGb3JtLCBzZlZhbGlkYXRvcikge1xuXG4gICAgdmFyIHNldEluZGV4ID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihmb3JtKSB7XG4gICAgICAgIGlmIChmb3JtLmtleSkge1xuICAgICAgICAgIGZvcm0ua2V5W2Zvcm0ua2V5LmluZGV4T2YoJycpXSA9IGluZGV4O1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgIHNjb3BlOiB0cnVlLFxuICAgICAgcmVxdWlyZTogJz9uZ01vZGVsJyxcbiAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgbmdNb2RlbCkge1xuICAgICAgICB2YXIgZm9ybURlZkNhY2hlID0ge307XG5cbiAgICAgICAgLy8gV2F0Y2ggZm9yIHRoZSBmb3JtIGRlZmluaXRpb24gYW5kIHRoZW4gcmV3cml0ZSBpdC5cbiAgICAgICAgLy8gSXQncyB0aGUgKGZpcnN0KSBhcnJheSBwYXJ0IG9mIHRoZSBrZXksICdbXScgdGhhdCBuZWVkcyBhIG51bWJlclxuICAgICAgICAvLyBjb3JyZXNwb25kaW5nIHRvIGFuIGluZGV4IG9mIHRoZSBmb3JtLlxuICAgICAgICB2YXIgb25jZSA9IHNjb3BlLiR3YXRjaChhdHRycy5zZkFycmF5LCBmdW5jdGlvbihmb3JtKSB7XG5cbiAgICAgICAgICAvLyBBbiBhcnJheSBtb2RlbCBhbHdheXMgbmVlZHMgYSBrZXkgc28gd2Uga25vdyB3aGF0IHBhcnQgb2YgdGhlIG1vZGVsXG4gICAgICAgICAgLy8gdG8gbG9vayBhdC4gVGhpcyBtYWtlcyB1cyBhIGJpdCBpbmNvbXBhdGlibGUgd2l0aCBKU09OIEZvcm0sIG9uIHRoZVxuICAgICAgICAgIC8vIG90aGVyIGhhbmQgaXQgZW5hYmxlcyB0d28gd2F5IGJpbmRpbmcuXG4gICAgICAgICAgdmFyIGxpc3QgPSBzZlNlbGVjdChmb3JtLmtleSwgc2NvcGUubW9kZWwpO1xuXG4gICAgICAgICAgLy8gU2luY2UgbmctbW9kZWwgaGFwcGlseSBjcmVhdGVzIG9iamVjdHMgaW4gYSBkZWVwIHBhdGggd2hlbiBzZXR0aW5nIGFcbiAgICAgICAgICAvLyBhIHZhbHVlIGJ1dCBub3QgYXJyYXlzIHdlIG5lZWQgdG8gY3JlYXRlIHRoZSBhcnJheS5cbiAgICAgICAgICBpZiAoYW5ndWxhci5pc1VuZGVmaW5lZChsaXN0KSkge1xuICAgICAgICAgICAgbGlzdCA9IFtdO1xuICAgICAgICAgICAgc2ZTZWxlY3QoZm9ybS5rZXksIHNjb3BlLm1vZGVsLCBsaXN0KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgc2NvcGUubW9kZWxBcnJheSA9IGxpc3Q7XG5cbiAgICAgICAgICAvLyBBcnJheXMgd2l0aCB0aXRsZU1hcHMsIGkuZS4gY2hlY2tib3hlcyBkb2Vzbid0IGhhdmUgaXRlbXMuXG4gICAgICAgICAgaWYgKGZvcm0uaXRlbXMpIHtcblxuICAgICAgICAgICAgLy8gVG8gYmUgbW9yZSBjb21wYXRpYmxlIHdpdGggSlNPTiBGb3JtIHdlIHN1cHBvcnQgYW4gYXJyYXkgb2YgaXRlbXNcbiAgICAgICAgICAgIC8vIGluIHRoZSBmb3JtIGRlZmluaXRpb24gb2YgXCJhcnJheVwiICh0aGUgc2NoZW1hIGp1c3QgYSB2YWx1ZSkuXG4gICAgICAgICAgICAvLyBmb3IgdGhlIHN1YmZvcm1zIGNvZGUgdG8gd29yayB0aGlzIG1lYW5zIHdlIHdyYXAgZXZlcnl0aGluZyBpbiBhXG4gICAgICAgICAgICAvLyBzZWN0aW9uLiBVbmxlc3MgdGhlcmUgaXMganVzdCBvbmUuXG4gICAgICAgICAgICB2YXIgc3ViRm9ybSA9IGZvcm0uaXRlbXNbMF07XG4gICAgICAgICAgICBpZiAoZm9ybS5pdGVtcy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgIHN1YkZvcm0gPSB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3NlY3Rpb24nLFxuICAgICAgICAgICAgICAgIGl0ZW1zOiBmb3JtLml0ZW1zLm1hcChmdW5jdGlvbihpdGVtKXtcbiAgICAgICAgICAgICAgICAgIGl0ZW0ubmdNb2RlbE9wdGlvbnMgPSBmb3JtLm5nTW9kZWxPcHRpb25zO1xuICAgICAgICAgICAgICAgICAgaXRlbS5yZWFkb25seSA9IGZvcm0ucmVhZG9ubHk7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gV2UgY2VhdGUgY29waWVzIG9mIHRoZSBmb3JtIG9uIGRlbWFuZCwgY2FjaGluZyB0aGVtIGZvclxuICAgICAgICAgIC8vIGxhdGVyIHJlcXVlc3RzXG4gICAgICAgICAgc2NvcGUuY29weVdpdGhJbmRleCA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgICAgICBpZiAoIWZvcm1EZWZDYWNoZVtpbmRleF0pIHtcbiAgICAgICAgICAgICAgaWYgKHN1YkZvcm0pIHtcbiAgICAgICAgICAgICAgICB2YXIgY29weSA9IGFuZ3VsYXIuY29weShzdWJGb3JtKTtcbiAgICAgICAgICAgICAgICBjb3B5LmFycmF5SW5kZXggPSBpbmRleDtcbiAgICAgICAgICAgICAgICBzY2hlbWFGb3JtLnRyYXZlcnNlRm9ybShjb3B5LCBzZXRJbmRleChpbmRleCkpO1xuICAgICAgICAgICAgICAgIGZvcm1EZWZDYWNoZVtpbmRleF0gPSBjb3B5O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZm9ybURlZkNhY2hlW2luZGV4XTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgc2NvcGUuYXBwZW5kVG9BcnJheSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGxlbiA9IGxpc3QubGVuZ3RoO1xuICAgICAgICAgICAgdmFyIGNvcHkgPSBzY29wZS5jb3B5V2l0aEluZGV4KGxlbik7XG4gICAgICAgICAgICBzY2hlbWFGb3JtLnRyYXZlcnNlRm9ybShjb3B5LCBmdW5jdGlvbihwYXJ0KSB7XG4gICAgICAgICAgICAgIGlmIChwYXJ0LmtleSAmJiBhbmd1bGFyLmlzRGVmaW5lZChwYXJ0WydkZWZhdWx0J10pKSB7XG4gICAgICAgICAgICAgICAgc2ZTZWxlY3QocGFydC5rZXksIHNjb3BlLm1vZGVsLCBwYXJ0WydkZWZhdWx0J10pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gSWYgdGhlcmUgYXJlIG5vIGRlZmF1bHRzIG5vdGhpbmcgaXMgYWRkZWQgc28gd2UgbmVlZCB0byBpbml0aWFsaXplXG4gICAgICAgICAgICAvLyB0aGUgYXJyYXkuIHVuZGVmaW5lZCBmb3IgYmFzaWMgdmFsdWVzLCB7fSBvciBbXSBmb3IgdGhlIG90aGVycy5cbiAgICAgICAgICAgIGlmIChsZW4gPT09IGxpc3QubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIHZhciB0eXBlID0gc2ZTZWxlY3QoJ3NjaGVtYS5pdGVtcy50eXBlJywgZm9ybSk7XG4gICAgICAgICAgICAgIHZhciBkZmx0O1xuICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICBkZmx0ID0ge307XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2FycmF5Jykge1xuICAgICAgICAgICAgICAgIGRmbHQgPSBbXTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBsaXN0LnB1c2goZGZsdCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFRyaWdnZXIgdmFsaWRhdGlvbi5cbiAgICAgICAgICAgIGlmIChzY29wZS52YWxpZGF0ZUFycmF5KSB7XG4gICAgICAgICAgICAgIHNjb3BlLnZhbGlkYXRlQXJyYXkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBsaXN0O1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICBzY29wZS5kZWxldGVGcm9tQXJyYXkgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAgICAgbGlzdC5zcGxpY2UoaW5kZXgsIDEpO1xuXG4gICAgICAgICAgICAvLyBUcmlnZ2VyIHZhbGlkYXRpb24uXG4gICAgICAgICAgICBpZiAoc2NvcGUudmFsaWRhdGVBcnJheSkge1xuICAgICAgICAgICAgICBzY29wZS52YWxpZGF0ZUFycmF5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbGlzdDtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgLy8gQWx3YXlzIHN0YXJ0IHdpdGggb25lIGVtcHR5IGZvcm0gdW5sZXNzIGNvbmZpZ3VyZWQgb3RoZXJ3aXNlLlxuICAgICAgICAgIC8vIFNwZWNpYWwgY2FzZTogZG9uJ3QgZG8gaXQgaWYgZm9ybSBoYXMgYSB0aXRsZU1hcFxuICAgICAgICAgIGlmICghZm9ybS50aXRsZU1hcCAmJiBmb3JtLnN0YXJ0RW1wdHkgIT09IHRydWUgJiYgbGlzdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHNjb3BlLmFwcGVuZFRvQXJyYXkoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBUaXRsZSBNYXAgaGFuZGxpbmdcbiAgICAgICAgICAvLyBJZiBmb3JtIGhhcyBhIHRpdGxlTWFwIGNvbmZpZ3VyZWQgd2UnZCBsaWtlIHRvIGVuYWJsZSBsb29waW5nIG92ZXJcbiAgICAgICAgICAvLyB0aXRsZU1hcCBpbnN0ZWFkIG9mIG1vZGVsQXJyYXksIHRoaXMgaXMgdXNlZCBmb3IgaW50YW5jZSBpblxuICAgICAgICAgIC8vIGNoZWNrYm94ZXMuIFNvIGluc3RlYWQgb2YgdmFyaWFibGUgbnVtYmVyIG9mIHRoaW5ncyB3ZSBsaWtlIHRvIGNyZWF0ZVxuICAgICAgICAgIC8vIGEgYXJyYXkgdmFsdWUgZnJvbSBhIHN1YnNldCBvZiB2YWx1ZXMgaW4gdGhlIHRpdGxlTWFwLlxuICAgICAgICAgIC8vIFRoZSBwcm9ibGVtIGhlcmUgaXMgdGhhdCBuZy1tb2RlbCBvbiBhIGNoZWNrYm94IGRvZXNuJ3QgcmVhbGx5IG1hcCB0b1xuICAgICAgICAgIC8vIGEgbGlzdCBvZiB2YWx1ZXMuIFRoaXMgaXMgaGVyZSB0byBmaXggdGhhdC5cbiAgICAgICAgICBpZiAoZm9ybS50aXRsZU1hcCAmJiBmb3JtLnRpdGxlTWFwLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHNjb3BlLnRpdGxlTWFwVmFsdWVzID0gW107XG5cbiAgICAgICAgICAgIC8vIFdlIHdhdGNoIHRoZSBtb2RlbCBmb3IgY2hhbmdlcyBhbmQgdGhlIHRpdGxlTWFwVmFsdWVzIHRvIHJlZmxlY3RcbiAgICAgICAgICAgIC8vIHRoZSBtb2RlbEFycmF5XG4gICAgICAgICAgICB2YXIgdXBkYXRlVGl0bGVNYXBWYWx1ZXMgPSBmdW5jdGlvbihhcnIpIHtcbiAgICAgICAgICAgICAgc2NvcGUudGl0bGVNYXBWYWx1ZXMgPSBbXTtcbiAgICAgICAgICAgICAgYXJyID0gYXJyIHx8IFtdO1xuXG4gICAgICAgICAgICAgIGZvcm0udGl0bGVNYXAuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgc2NvcGUudGl0bGVNYXBWYWx1ZXMucHVzaChhcnIuaW5kZXhPZihpdGVtLnZhbHVlKSAhPT0gLTEpO1xuICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8vQ2F0Y2ggZGVmYXVsdCB2YWx1ZXNcbiAgICAgICAgICAgIHVwZGF0ZVRpdGxlTWFwVmFsdWVzKHNjb3BlLm1vZGVsQXJyYXkpO1xuICAgICAgICAgICAgc2NvcGUuJHdhdGNoQ29sbGVjdGlvbignbW9kZWxBcnJheScsIHVwZGF0ZVRpdGxlTWFwVmFsdWVzKTtcblxuICAgICAgICAgICAgLy9UbyBnZXQgdHdvIHdheSBiaW5kaW5nIHdlIGFsc28gd2F0Y2ggb3VyIHRpdGxlTWFwVmFsdWVzXG4gICAgICAgICAgICBzY29wZS4kd2F0Y2hDb2xsZWN0aW9uKCd0aXRsZU1hcFZhbHVlcycsIGZ1bmN0aW9uKHZhbHMpIHtcbiAgICAgICAgICAgICAgaWYgKHZhbHMpIHtcbiAgICAgICAgICAgICAgICB2YXIgYXJyID0gc2NvcGUubW9kZWxBcnJheTtcblxuICAgICAgICAgICAgICAgIC8vIEFwcGFyZW50bHkgdGhlIGZhc3Rlc3Qgd2F5IHRvIGNsZWFyIGFuIGFycmF5LCByZWFkYWJsZSB0b28uXG4gICAgICAgICAgICAgICAgLy8gaHR0cDovL2pzcGVyZi5jb20vYXJyYXktZGVzdHJveS8zMlxuICAgICAgICAgICAgICAgIHdoaWxlIChhcnIubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgYXJyLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9ybS50aXRsZU1hcC5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0sIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICBpZiAodmFsc1tpbmRleF0pIHtcbiAgICAgICAgICAgICAgICAgICAgYXJyLnB1c2goaXRlbS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gSWYgdGhlcmUgaXMgYSBuZ01vZGVsIHByZXNlbnQgd2UgbmVlZCB0byB2YWxpZGF0ZSB3aGVuIGFza2VkLlxuICAgICAgICAgIGlmIChuZ01vZGVsKSB7XG4gICAgICAgICAgICB2YXIgZXJyb3I7XG5cbiAgICAgICAgICAgIHNjb3BlLnZhbGlkYXRlQXJyYXkgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgLy8gVGhlIGFjdHVhbCBjb250ZW50IG9mIHRoZSBhcnJheSBpcyB2YWxpZGF0ZWQgYnkgZWFjaCBmaWVsZFxuICAgICAgICAgICAgICAvLyBzbyB3ZSBzZXR0bGUgZm9yIGNoZWNraW5nIHZhbGlkYXRpb25zIHNwZWNpZmljIHRvIGFycmF5c1xuXG4gICAgICAgICAgICAgIC8vIFNpbmNlIHdlIHByZWZpbGwgd2l0aCBlbXB0eSBhcnJheXMgd2UgY2FuIGdldCB0aGUgZnVubnkgc2l0dWF0aW9uXG4gICAgICAgICAgICAgIC8vIHdoZXJlIHRoZSBhcnJheSBpcyByZXF1aXJlZCBidXQgZW1wdHkgaW4gdGhlIGd1aSBidXQgc3RpbGwgdmFsaWRhdGVzLlxuICAgICAgICAgICAgICAvLyBUaGF0cyB3aHkgd2UgY2hlY2sgdGhlIGxlbmd0aC5cbiAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHNmVmFsaWRhdG9yLnZhbGlkYXRlKFxuICAgICAgICAgICAgICAgIGZvcm0sXG4gICAgICAgICAgICAgICAgc2NvcGUubW9kZWxBcnJheS5sZW5ndGggPiAwID8gc2NvcGUubW9kZWxBcnJheSA6IHVuZGVmaW5lZFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICBpZiAocmVzdWx0LnZhbGlkID09PSBmYWxzZSAmJlxuICAgICAgICAgICAgICAgICAgcmVzdWx0LmVycm9yICYmXG4gICAgICAgICAgICAgICAgICAocmVzdWx0LmVycm9yLmRhdGFQYXRoID09PSAnJyB8fFxuICAgICAgICAgICAgICAgICAgcmVzdWx0LmVycm9yLmRhdGFQYXRoID09PSAnLycgKyBmb3JtLmtleVtmb3JtLmtleS5sZW5ndGggLSAxXSkpIHtcblxuICAgICAgICAgICAgICAgIC8vIFNldCB2aWV3VmFsdWUgdG8gdHJpZ2dlciAkZGlydHkgb24gZmllbGQuIElmIHNvbWVvbmUga25vd3MgYVxuICAgICAgICAgICAgICAgIC8vIGEgYmV0dGVyIHdheSB0byBkbyBpdCBwbGVhc2UgdGVsbC5cbiAgICAgICAgICAgICAgICBuZ01vZGVsLiRzZXRWaWV3VmFsdWUoc2NvcGUubW9kZWxBcnJheSk7XG4gICAgICAgICAgICAgICAgZXJyb3IgPSByZXN1bHQuZXJyb3I7XG4gICAgICAgICAgICAgICAgbmdNb2RlbC4kc2V0VmFsaWRpdHkoJ3NjaGVtYScsIGZhbHNlKTtcblxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5nTW9kZWwuJHNldFZhbGlkaXR5KCdzY2hlbWEnLCB0cnVlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2NvcGUuJG9uKCdzY2hlbWFGb3JtVmFsaWRhdGUnLCBzY29wZS52YWxpZGF0ZUFycmF5KTtcblxuICAgICAgICAgICAgc2NvcGUuaGFzU3VjY2VzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gbmdNb2RlbC4kdmFsaWQgJiYgIW5nTW9kZWwuJHByaXN0aW5lO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2NvcGUuaGFzRXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIG5nTW9kZWwuJGludmFsaWQ7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzY29wZS5zY2hlbWFFcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gZXJyb3I7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgb25jZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5dKTtcblxuLyoqXG4gKiBBIHZlcnNpb24gb2YgbmctY2hhbmdlZCB0aGF0IG9ubHkgbGlzdGVucyBpZlxuICogdGhlcmUgaXMgYWN0dWFsbHkgYSBvbkNoYW5nZSBkZWZpbmVkIG9uIHRoZSBmb3JtXG4gKlxuICogVGFrZXMgdGhlIGZvcm0gZGVmaW5pdGlvbiBhcyBhcmd1bWVudC5cbiAqIElmIHRoZSBmb3JtIGRlZmluaXRpb24gaGFzIGEgXCJvbkNoYW5nZVwiIGRlZmluZWQgYXMgZWl0aGVyIGEgZnVuY3Rpb24gb3JcbiAqL1xuYW5ndWxhci5tb2R1bGUoJ3NjaGVtYUZvcm0nKS5kaXJlY3RpdmUoJ3NmQ2hhbmdlZCcsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHJlcXVpcmU6ICduZ01vZGVsJyxcbiAgICByZXN0cmljdDogJ0FDJyxcbiAgICBzY29wZTogZmFsc2UsXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XG4gICAgICB2YXIgZm9ybSA9IHNjb3BlLiRldmFsKGF0dHJzLnNmQ2hhbmdlZCk7XG4gICAgICAvL1wiZm9ybVwiIGlzIHJlYWxseSBndWFyYW50ZWVkIHRvIGJlIGhlcmUgc2luY2UgdGhlIGRlY29yYXRvciBkaXJlY3RpdmVcbiAgICAgIC8vd2FpdHMgZm9yIGl0LiBCdXQgYmVzdCBiZSBzdXJlLlxuICAgICAgaWYgKGZvcm0gJiYgZm9ybS5vbkNoYW5nZSkge1xuICAgICAgICBjdHJsLiR2aWV3Q2hhbmdlTGlzdGVuZXJzLnB1c2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKGFuZ3VsYXIuaXNGdW5jdGlvbihmb3JtLm9uQ2hhbmdlKSkge1xuICAgICAgICAgICAgZm9ybS5vbkNoYW5nZShjdHJsLiRtb2RlbFZhbHVlLCBmb3JtKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2NvcGUuZXZhbEV4cHIoZm9ybS5vbkNoYW5nZSwgeydtb2RlbFZhbHVlJzogY3RybC4kbW9kZWxWYWx1ZSwgZm9ybTogZm9ybX0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufSk7XG5cbi8qXG5GSVhNRTogcmVhbCBkb2N1bWVudGF0aW9uXG48Zm9ybSBzZi1mb3JtPVwiZm9ybVwiICBzZi1zY2hlbWE9XCJzY2hlbWFcIiBzZi1kZWNvcmF0b3I9XCJmb29iYXJcIj48L2Zvcm0+XG4qL1xuXG5hbmd1bGFyLm1vZHVsZSgnc2NoZW1hRm9ybScpXG4gICAgICAgLmRpcmVjdGl2ZSgnc2ZTY2hlbWEnLFxuWyckY29tcGlsZScsICdzY2hlbWFGb3JtJywgJ3NjaGVtYUZvcm1EZWNvcmF0b3JzJywgJ3NmU2VsZWN0JyxcbiAgZnVuY3Rpb24oJGNvbXBpbGUsICBzY2hlbWFGb3JtLCAgc2NoZW1hRm9ybURlY29yYXRvcnMsIHNmU2VsZWN0KSB7XG5cbiAgICB2YXIgU05BS0VfQ0FTRV9SRUdFWFAgPSAvW0EtWl0vZztcbiAgICB2YXIgc25ha2VDYXNlID0gZnVuY3Rpb24obmFtZSwgc2VwYXJhdG9yKSB7XG4gICAgICBzZXBhcmF0b3IgPSBzZXBhcmF0b3IgfHwgJ18nO1xuICAgICAgcmV0dXJuIG5hbWUucmVwbGFjZShTTkFLRV9DQVNFX1JFR0VYUCwgZnVuY3Rpb24obGV0dGVyLCBwb3MpIHtcbiAgICAgICAgcmV0dXJuIChwb3MgPyBzZXBhcmF0b3IgOiAnJykgKyBsZXR0ZXIudG9Mb3dlckNhc2UoKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgc2NvcGU6IHtcbiAgICAgICAgc2NoZW1hOiAnPXNmU2NoZW1hJyxcbiAgICAgICAgaW5pdGlhbEZvcm06ICc9c2ZGb3JtJyxcbiAgICAgICAgbW9kZWw6ICc9c2ZNb2RlbCcsXG4gICAgICAgIG9wdGlvbnM6ICc9c2ZPcHRpb25zJ1xuICAgICAgfSxcbiAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgZnVuY3Rpb24oJHNjb3BlKSB7XG4gICAgICAgIHRoaXMuZXZhbEluUGFyZW50U2NvcGUgPSBmdW5jdGlvbihleHByLCBsb2NhbHMpIHtcbiAgICAgICAgICByZXR1cm4gJHNjb3BlLiRwYXJlbnQuJGV2YWwoZXhwciwgbG9jYWxzKTtcbiAgICAgICAgfTtcbiAgICAgIH1dLFxuICAgICAgcmVwbGFjZTogZmFsc2UsXG4gICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgIHJlcXVpcmU6ICc/Zm9ybScsXG4gICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIGZvcm1DdHJsLCB0cmFuc2NsdWRlKSB7XG5cbiAgICAgICAgLy9leHBvc2UgZm9ybSBjb250cm9sbGVyIG9uIHNjb3BlIHNvIHRoYXQgd2UgZG9uJ3QgZm9yY2UgYXV0aG9ycyB0byB1c2UgbmFtZSBvbiBmb3JtXG4gICAgICAgIHNjb3BlLmZvcm1DdHJsID0gZm9ybUN0cmw7XG5cbiAgICAgICAgLy9XZSdkIGxpa2UgdG8gaGFuZGxlIGV4aXN0aW5nIG1hcmt1cCxcbiAgICAgICAgLy9iZXNpZGVzIHVzaW5nIGl0IGluIG91ciB0ZW1wbGF0ZSB3ZSBhbHNvXG4gICAgICAgIC8vY2hlY2sgZm9yIG5nLW1vZGVsIGFuZCBhZGQgdGhhdCB0byBhbiBpZ25vcmUgbGlzdFxuICAgICAgICAvL2kuZS4gZXZlbiBpZiBmb3JtIGhhcyBhIGRlZmluaXRpb24gZm9yIGl0IG9yIGZvcm0gaXMgW1wiKlwiXVxuICAgICAgICAvL3dlIGRvbid0IGdlbmVyYXRlIGl0LlxuICAgICAgICB2YXIgaWdub3JlID0ge307XG4gICAgICAgIHRyYW5zY2x1ZGUoc2NvcGUsIGZ1bmN0aW9uKGNsb25lKSB7XG4gICAgICAgICAgY2xvbmUuYWRkQ2xhc3MoJ3NjaGVtYS1mb3JtLWlnbm9yZScpO1xuICAgICAgICAgIGVsZW1lbnQucHJlcGVuZChjbG9uZSk7XG5cbiAgICAgICAgICBpZiAoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yQWxsKSB7XG4gICAgICAgICAgICB2YXIgbW9kZWxzID0gZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yQWxsKCdbbmctbW9kZWxdJyk7XG4gICAgICAgICAgICBpZiAobW9kZWxzKSB7XG4gICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW9kZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGtleSA9IG1vZGVsc1tpXS5nZXRBdHRyaWJ1dGUoJ25nLW1vZGVsJyk7XG4gICAgICAgICAgICAgICAgLy9za2lwIGZpcnN0IHBhcnQgYmVmb3JlIC5cbiAgICAgICAgICAgICAgICBpZ25vcmVba2V5LnN1YnN0cmluZyhrZXkuaW5kZXhPZignLicpICsgMSldID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vU2luY2Ugd2UgYXJlIGRlcGVuZGFudCBvbiB1cCB0byB0aHJlZVxuICAgICAgICAvL2F0dHJpYnV0ZXMgd2UnbGwgZG8gYSBjb21tb24gd2F0Y2hcbiAgICAgICAgdmFyIGxhc3REaWdlc3QgPSB7fTtcblxuICAgICAgICBzY29wZS4kd2F0Y2goZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICB2YXIgc2NoZW1hID0gc2NvcGUuc2NoZW1hO1xuICAgICAgICAgIHZhciBmb3JtICAgPSBzY29wZS5pbml0aWFsRm9ybSB8fCBbJyonXTtcblxuICAgICAgICAgIC8vVGhlIGNoZWNrIGZvciBzY2hlbWEudHlwZSBpcyB0byBlbnN1cmUgdGhhdCBzY2hlbWEgaXMgbm90IHt9XG4gICAgICAgICAgaWYgKGZvcm0gJiYgc2NoZW1hICYmIHNjaGVtYS50eXBlICYmXG4gICAgICAgICAgICAgIChsYXN0RGlnZXN0LmZvcm0gIT09IGZvcm0gfHwgbGFzdERpZ2VzdC5zY2hlbWEgIT09IHNjaGVtYSkgJiZcbiAgICAgICAgICAgICAgT2JqZWN0LmtleXMoc2NoZW1hLnByb3BlcnRpZXMpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGxhc3REaWdlc3Quc2NoZW1hID0gc2NoZW1hO1xuICAgICAgICAgICAgbGFzdERpZ2VzdC5mb3JtID0gZm9ybTtcblxuICAgICAgICAgICAgdmFyIG1lcmdlZCA9IHNjaGVtYUZvcm0ubWVyZ2Uoc2NoZW1hLCBmb3JtLCBpZ25vcmUsIHNjb3BlLm9wdGlvbnMpO1xuICAgICAgICAgICAgdmFyIGZyYWcgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG5cbiAgICAgICAgICAgIC8vbWFrZSB0aGUgZm9ybSBhdmFpbGFibGUgdG8gZGVjb3JhdG9yc1xuICAgICAgICAgICAgc2NvcGUuc2NoZW1hRm9ybSAgPSB7Zm9ybTogIG1lcmdlZCwgc2NoZW1hOiBzY2hlbWF9O1xuXG4gICAgICAgICAgICAvL2NsZWFuIGFsbCBidXQgcHJlIGV4aXN0aW5nIGh0bWwuXG4gICAgICAgICAgICBlbGVtZW50LmNoaWxkcmVuKCc6bm90KC5zY2hlbWEtZm9ybS1pZ25vcmUpJykucmVtb3ZlKCk7XG5cbiAgICAgICAgICAgIC8vQ3JlYXRlIGRpcmVjdGl2ZXMgZnJvbSB0aGUgZm9ybSBkZWZpbml0aW9uXG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2gobWVyZ2VkLGZ1bmN0aW9uKG9iaixpKXtcbiAgICAgICAgICAgICAgdmFyIG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGF0dHJzLnNmRGVjb3JhdG9yIHx8IHNuYWtlQ2FzZShzY2hlbWFGb3JtRGVjb3JhdG9ycy5kZWZhdWx0RGVjb3JhdG9yLCctJykpO1xuICAgICAgICAgICAgICBuLnNldEF0dHJpYnV0ZSgnZm9ybScsJ3NjaGVtYUZvcm0uZm9ybVsnK2krJ10nKTtcbiAgICAgICAgICAgICAgdmFyIHNsb3Q7XG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgc2xvdCA9IGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignKltzZi1pbnNlcnQtZmllbGQ9XCInICsgb2JqLmtleSArICdcIl0nKTtcbiAgICAgICAgICAgICAgfSBjYXRjaChlcnIpIHtcbiAgICAgICAgICAgICAgICAvLyBmaWVsZCBpbnNlcnRpb24gbm90IHN1cHBvcnRlZCBmb3IgY29tcGxleCBrZXlzXG4gICAgICAgICAgICAgICAgc2xvdCA9IG51bGw7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYoc2xvdCkge1xuICAgICAgICAgICAgICAgIHNsb3QuaW5uZXJIVE1MID0gXCJcIjtcbiAgICAgICAgICAgICAgICBzbG90LmFwcGVuZENoaWxkKG4pOyAgXG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZnJhZy5hcHBlbmRDaGlsZChuKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGVsZW1lbnRbMF0uYXBwZW5kQ2hpbGQoZnJhZyk7XG5cbiAgICAgICAgICAgIC8vY29tcGlsZSBvbmx5IGNoaWxkcmVuXG4gICAgICAgICAgICAkY29tcGlsZShlbGVtZW50LmNoaWxkcmVuKCkpKHNjb3BlKTtcblxuICAgICAgICAgICAgLy9vaywgbm93IHRoYXQgdGhhdCBpcyBkb25lIGxldCdzIHNldCBhbnkgZGVmYXVsdHNcbiAgICAgICAgICAgIHNjaGVtYUZvcm0udHJhdmVyc2VTY2hlbWEoc2NoZW1hLCBmdW5jdGlvbihwcm9wLCBwYXRoKSB7XG4gICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZChwcm9wWydkZWZhdWx0J10pKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZhbCA9IHNmU2VsZWN0KHBhdGgsIHNjb3BlLm1vZGVsKTtcbiAgICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc1VuZGVmaW5lZCh2YWwpKSB7XG4gICAgICAgICAgICAgICAgICBzZlNlbGVjdChwYXRoLCBzY29wZS5tb2RlbCwgcHJvcFsnZGVmYXVsdCddKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXSk7XG5cbmFuZ3VsYXIubW9kdWxlKCdzY2hlbWFGb3JtJykuZGlyZWN0aXZlKCdzY2hlbWFWYWxpZGF0ZScsIFsnc2ZWYWxpZGF0b3InLCBmdW5jdGlvbihzZlZhbGlkYXRvcikge1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnQScsXG4gICAgc2NvcGU6IGZhbHNlLFxuICAgIC8vIFdlIHdhbnQgdGhlIGxpbmsgZnVuY3Rpb24gdG8gYmUgKmFmdGVyKiB0aGUgaW5wdXQgZGlyZWN0aXZlcyBsaW5rIGZ1bmN0aW9uIHNvIHdlIGdldCBhY2Nlc3NcbiAgICAvLyB0aGUgcGFyc2VkIHZhbHVlLCBleC4gYSBudW1iZXIgaW5zdGVhZCBvZiBhIHN0cmluZ1xuICAgIHByaW9yaXR5OiAxMDAwLFxuICAgIHJlcXVpcmU6ICduZ01vZGVsJyxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIG5nTW9kZWwpIHtcbiAgICAgIC8vU2luY2Ugd2UgaGF2ZSBzY29wZSBmYWxzZSB0aGlzIGlzIHRoZSBzYW1lIHNjb3BlXG4gICAgICAvL2FzIHRoZSBkZWNvcmF0b3JcbiAgICAgIHNjb3BlLm5nTW9kZWwgPSBuZ01vZGVsO1xuXG4gICAgICB2YXIgZXJyb3IgPSBudWxsO1xuXG4gICAgICB2YXIgZ2V0Rm9ybSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIWZvcm0pIHtcbiAgICAgICAgICBmb3JtID0gc2NvcGUuJGV2YWwoYXR0cnMuc2NoZW1hVmFsaWRhdGUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmb3JtO1xuICAgICAgfTtcbiAgICAgIHZhciBmb3JtICAgPSBnZXRGb3JtKCk7XG5cbiAgICAgIC8vIFZhbGlkYXRlIGFnYWluc3QgdGhlIHNjaGVtYS5cblxuICAgICAgLy8gR2V0IGluIGxhc3Qgb2YgdGhlIHBhcnNlcyBzbyB0aGUgcGFyc2VkIHZhbHVlIGhhcyB0aGUgY29ycmVjdCB0eXBlLlxuICAgICAgaWYgKG5nTW9kZWwuJHZhbGlkYXRvcnMpIHsgLy8gQW5ndWxhciAxLjNcbiAgICAgICAgbmdNb2RlbC4kdmFsaWRhdG9ycy5zY2hlbWEgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIHZhciByZXN1bHQgPSBzZlZhbGlkYXRvci52YWxpZGF0ZShnZXRGb3JtKCksIHZhbHVlKTtcbiAgICAgICAgICBlcnJvciA9IHJlc3VsdC5lcnJvcjtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0LnZhbGlkO1xuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcblxuICAgICAgICAvLyBBbmd1bGFyIDEuMlxuICAgICAgICBuZ01vZGVsLiRwYXJzZXJzLnB1c2goZnVuY3Rpb24odmlld1ZhbHVlKSB7XG4gICAgICAgICAgZm9ybSA9IGdldEZvcm0oKTtcbiAgICAgICAgICAvL1N0aWxsIG1pZ2h0IGJlIHVuZGVmaW5lZFxuICAgICAgICAgIGlmICghZm9ybSkge1xuICAgICAgICAgICAgcmV0dXJuIHZpZXdWYWx1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgcmVzdWx0ID0gIHNmVmFsaWRhdG9yLnZhbGlkYXRlKGZvcm0sIHZpZXdWYWx1ZSk7XG5cbiAgICAgICAgICBpZiAocmVzdWx0LnZhbGlkKSB7XG4gICAgICAgICAgICAvLyBpdCBpcyB2YWxpZFxuICAgICAgICAgICAgbmdNb2RlbC4kc2V0VmFsaWRpdHkoJ3NjaGVtYScsIHRydWUpO1xuICAgICAgICAgICAgcmV0dXJuIHZpZXdWYWx1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gaXQgaXMgaW52YWxpZCwgcmV0dXJuIHVuZGVmaW5lZCAobm8gbW9kZWwgdXBkYXRlKVxuICAgICAgICAgICAgbmdNb2RlbC4kc2V0VmFsaWRpdHkoJ3NjaGVtYScsIGZhbHNlKTtcbiAgICAgICAgICAgIGVycm9yID0gcmVzdWx0LmVycm9yO1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG5cbiAgICAgIC8vIExpc3RlbiB0byBhbiBldmVudCBzbyB3ZSBjYW4gdmFsaWRhdGUgdGhlIGlucHV0IG9uIHJlcXVlc3RcbiAgICAgIHNjb3BlLiRvbignc2NoZW1hRm9ybVZhbGlkYXRlJywgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgaWYgKG5nTW9kZWwuJHZhbGlkYXRlKSB7XG4gICAgICAgICAgbmdNb2RlbC4kdmFsaWRhdGUoKTtcbiAgICAgICAgICBpZiAobmdNb2RlbC4kaW52YWxpZCkgeyAvLyBUaGUgZmllbGQgbXVzdCBiZSBtYWRlIGRpcnR5IHNvIHRoZSBlcnJvciBtZXNzYWdlIGlzIGRpc3BsYXllZFxuICAgICAgICAgICAgbmdNb2RlbC4kZGlydHkgPSB0cnVlO1xuICAgICAgICAgICAgbmdNb2RlbC4kcHJpc3RpbmUgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmdNb2RlbC4kc2V0Vmlld1ZhbHVlKG5nTW9kZWwuJHZpZXdWYWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvL1RoaXMgd29ya3Mgc2luY2Ugd2Ugbm93IHdlJ3JlIGluc2lkZSBhIGRlY29yYXRvciBhbmQgdGhhdCB0aGlzIGlzIHRoZSBkZWNvcmF0b3JzIHNjb3BlLlxuICAgICAgLy9JZiAkcHJpc3RpbmUgYW5kIGVtcHR5IGRvbid0IHNob3cgc3VjY2VzcyAoZXZlbiBpZiBpdCdzIHZhbGlkKVxuICAgICAgc2NvcGUuaGFzU3VjY2VzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbmdNb2RlbC4kdmFsaWQgJiYgKCFuZ01vZGVsLiRwcmlzdGluZSB8fCAhbmdNb2RlbC4kaXNFbXB0eShuZ01vZGVsLiRtb2RlbFZhbHVlKSk7XG4gICAgICB9O1xuXG4gICAgICBzY29wZS5oYXNFcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbmdNb2RlbC4kaW52YWxpZCAmJiAhbmdNb2RlbC4kcHJpc3RpbmU7XG4gICAgICB9O1xuXG4gICAgICBzY29wZS5zY2hlbWFFcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gZXJyb3I7XG4gICAgICB9O1xuXG4gICAgfVxuICB9O1xufV0pO1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9PYmplY3RQYXRoLmpzJykuT2JqZWN0UGF0aDtcbiIsIid1c2Ugc3RyaWN0JztcblxuOyFmdW5jdGlvbih1bmRlZmluZWQpIHtcblxuXHR2YXIgT2JqZWN0UGF0aCA9IHtcblx0XHRwYXJzZTogZnVuY3Rpb24oc3RyKXtcblx0XHRcdGlmKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKXtcblx0XHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignT2JqZWN0UGF0aC5wYXJzZSBtdXN0IGJlIHBhc3NlZCBhIHN0cmluZycpO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgaSA9IDA7XG5cdFx0XHR2YXIgcGFydHMgPSBbXTtcblx0XHRcdHZhciBkLCBiLCBxLCBjO1xuXHRcdFx0d2hpbGUgKGkgPCBzdHIubGVuZ3RoKXtcblx0XHRcdFx0ZCA9IHN0ci5pbmRleE9mKCcuJywgaSk7XG5cdFx0XHRcdGIgPSBzdHIuaW5kZXhPZignWycsIGkpO1xuXG5cdFx0XHRcdC8vIHdlJ3ZlIHJlYWNoZWQgdGhlIGVuZFxuXHRcdFx0XHRpZiAoZCA9PT0gLTEgJiYgYiA9PT0gLTEpe1xuXHRcdFx0XHRcdHBhcnRzLnB1c2goc3RyLnNsaWNlKGksIHN0ci5sZW5ndGgpKTtcblx0XHRcdFx0XHRpID0gc3RyLmxlbmd0aDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIGRvdHNcblx0XHRcdFx0ZWxzZSBpZiAoYiA9PT0gLTEgfHwgKGQgIT09IC0xICYmIGQgPCBiKSkge1xuXHRcdFx0XHRcdHBhcnRzLnB1c2goc3RyLnNsaWNlKGksIGQpKTtcblx0XHRcdFx0XHRpID0gZCArIDE7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBicmFja2V0c1xuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRpZiAoYiA+IGkpe1xuXHRcdFx0XHRcdFx0cGFydHMucHVzaChzdHIuc2xpY2UoaSwgYikpO1xuXHRcdFx0XHRcdFx0aSA9IGI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHEgPSBzdHIuc2xpY2UoYisxLCBiKzIpO1xuXHRcdFx0XHRcdGlmIChxICE9PSAnXCInICYmIHEgIT09J1xcJycpIHtcblx0XHRcdFx0XHRcdGMgPSBzdHIuaW5kZXhPZignXScsIGIpO1xuXHRcdFx0XHRcdFx0aWYgKGMgPT09IC0xKSBjID0gc3RyLmxlbmd0aDtcblx0XHRcdFx0XHRcdHBhcnRzLnB1c2goc3RyLnNsaWNlKGkgKyAxLCBjKSk7XG5cdFx0XHRcdFx0XHRpID0gKHN0ci5zbGljZShjICsgMSwgYyArIDIpID09PSAnLicpID8gYyArIDIgOiBjICsgMTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0YyA9IHN0ci5pbmRleE9mKHErJ10nLCBiKTtcblx0XHRcdFx0XHRcdGlmIChjID09PSAtMSkgYyA9IHN0ci5sZW5ndGg7XG5cdFx0XHRcdFx0XHR3aGlsZSAoc3RyLnNsaWNlKGMgLSAxLCBjKSA9PT0gJ1xcXFwnICYmIGIgPCBzdHIubGVuZ3RoKXtcblx0XHRcdFx0XHRcdFx0YisrO1xuXHRcdFx0XHRcdFx0XHRjID0gc3RyLmluZGV4T2YocSsnXScsIGIpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0cGFydHMucHVzaChzdHIuc2xpY2UoaSArIDIsIGMpLnJlcGxhY2UobmV3IFJlZ0V4cCgnXFxcXCcrcSwnZycpLCBxKSk7XG5cdFx0XHRcdFx0XHRpID0gKHN0ci5zbGljZShjICsgMiwgYyArIDMpID09PSAnLicpID8gYyArIDMgOiBjICsgMjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBwYXJ0cztcblx0XHR9LFxuXG5cdFx0Ly8gcm9vdCA9PT0gdHJ1ZSA6IGF1dG8gY2FsY3VsYXRlIHJvb3Q7IG11c3QgYmUgZG90LW5vdGF0aW9uIGZyaWVuZGx5XG5cdFx0Ly8gcm9vdCBTdHJpbmcgOiB0aGUgc3RyaW5nIHRvIHVzZSBhcyByb290XG5cdFx0c3RyaW5naWZ5OiBmdW5jdGlvbihhcnIsIHF1b3RlKXtcblxuXHRcdFx0aWYoIUFycmF5LmlzQXJyYXkoYXJyKSlcblx0XHRcdFx0YXJyID0gW2Fyci50b1N0cmluZygpXTtcblxuXHRcdFx0cXVvdGUgPSBxdW90ZSA9PT0gJ1wiJyA/ICdcIicgOiAnXFwnJztcblxuXHRcdFx0cmV0dXJuIGFyci5tYXAoZnVuY3Rpb24obil7IHJldHVybiAnWycgKyBxdW90ZSArIChuLnRvU3RyaW5nKCkpLnJlcGxhY2UobmV3IFJlZ0V4cChxdW90ZSwgJ2cnKSwgJ1xcXFwnICsgcXVvdGUpICsgcXVvdGUgKyAnXSc7IH0pLmpvaW4oJycpO1xuXHRcdH0sXG5cblx0XHRub3JtYWxpemU6IGZ1bmN0aW9uKGRhdGEsIHF1b3RlKXtcblx0XHRcdHJldHVybiBPYmplY3RQYXRoLnN0cmluZ2lmeShBcnJheS5pc0FycmF5KGRhdGEpID8gZGF0YSA6IE9iamVjdFBhdGgucGFyc2UoZGF0YSksIHF1b3RlKTtcblx0XHR9XG5cdH07XG5cblx0Ly8gQU1EXG5cdGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcblx0XHRkZWZpbmUoZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gT2JqZWN0UGF0aDtcblx0XHR9KTtcblx0fVxuXG5cdC8vIENvbW1vbkpTXG5cdGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuXHRcdGV4cG9ydHMuT2JqZWN0UGF0aCA9IE9iamVjdFBhdGg7XG5cdH1cblxuXHQvLyBBbmd1bGFyXG5cdGVsc2UgaWYgKHR5cGVvZiBhbmd1bGFyID09PSAnb2JqZWN0Jykge1xuXHRcdGFuZ3VsYXIubW9kdWxlKCdPYmplY3RQYXRoJywgW10pLnByb3ZpZGVyKCdPYmplY3RQYXRoJywgZnVuY3Rpb24oKXtcblx0XHRcdHRoaXMucGFyc2UgPSBPYmplY3RQYXRoLnBhcnNlO1xuXHRcdFx0dGhpcy5zdHJpbmdpZnkgPSBPYmplY3RQYXRoLnN0cmluZ2lmeTtcblx0XHRcdHRoaXMubm9ybWFsaXplID0gT2JqZWN0UGF0aC5ub3JtYWxpemU7XG5cdFx0XHR0aGlzLiRnZXQgPSBmdW5jdGlvbigpe1xuXHRcdFx0XHRyZXR1cm4gT2JqZWN0UGF0aDtcblx0XHRcdH07XG5cdFx0fSk7XG5cdH1cblxuXHQvLyBCcm93c2VyIGdsb2JhbC5cblx0ZWxzZSB7XG5cdFx0d2luZG93Lk9iamVjdFBhdGggPSBPYmplY3RQYXRoO1xuXHR9XG59KCk7XG4iLCIvKlxuQXV0aG9yOiBHZXJhaW50IEx1ZmYgYW5kIG90aGVyc1xuWWVhcjogMjAxM1xuXG5UaGlzIGNvZGUgaXMgcmVsZWFzZWQgaW50byB0aGUgXCJwdWJsaWMgZG9tYWluXCIgYnkgaXRzIGF1dGhvcihzKS4gIEFueWJvZHkgbWF5IHVzZSwgYWx0ZXIgYW5kIGRpc3RyaWJ1dGUgdGhlIGNvZGUgd2l0aG91dCByZXN0cmljdGlvbi4gIFRoZSBhdXRob3IgbWFrZXMgbm8gZ3VhcmFudGVlcywgYW5kIHRha2VzIG5vIGxpYWJpbGl0eSBvZiBhbnkga2luZCBmb3IgdXNlIG9mIHRoaXMgY29kZS5cblxuSWYgeW91IGZpbmQgYSBidWcgb3IgbWFrZSBhbiBpbXByb3ZlbWVudCwgaXQgd291bGQgYmUgY291cnRlb3VzIHRvIGxldCB0aGUgYXV0aG9yIGtub3csIGJ1dCBpdCBpcyBub3QgY29tcHVsc29yeS5cbiovXG4oZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuICAgIGRlZmluZShbXSwgZmFjdG9yeSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpe1xuICAgIC8vIENvbW1vbkpTLiBEZWZpbmUgZXhwb3J0LlxuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICB9IGVsc2Uge1xuICAgIC8vIEJyb3dzZXIgZ2xvYmFsc1xuICAgIGdsb2JhbC50djQgPSBmYWN0b3J5KCk7XG4gIH1cbn0odGhpcywgZnVuY3Rpb24gKCkge1xuXG4vLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9PYmplY3Qva2V5cz9yZWRpcmVjdGxvY2FsZT1lbi1VUyZyZWRpcmVjdHNsdWc9SmF2YVNjcmlwdCUyRlJlZmVyZW5jZSUyRkdsb2JhbF9PYmplY3RzJTJGT2JqZWN0JTJGa2V5c1xuaWYgKCFPYmplY3Qua2V5cykge1xuXHRPYmplY3Qua2V5cyA9IChmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSxcblx0XHRcdGhhc0RvbnRFbnVtQnVnID0gISh7dG9TdHJpbmc6IG51bGx9KS5wcm9wZXJ0eUlzRW51bWVyYWJsZSgndG9TdHJpbmcnKSxcblx0XHRcdGRvbnRFbnVtcyA9IFtcblx0XHRcdFx0J3RvU3RyaW5nJyxcblx0XHRcdFx0J3RvTG9jYWxlU3RyaW5nJyxcblx0XHRcdFx0J3ZhbHVlT2YnLFxuXHRcdFx0XHQnaGFzT3duUHJvcGVydHknLFxuXHRcdFx0XHQnaXNQcm90b3R5cGVPZicsXG5cdFx0XHRcdCdwcm9wZXJ0eUlzRW51bWVyYWJsZScsXG5cdFx0XHRcdCdjb25zdHJ1Y3Rvcidcblx0XHRcdF0sXG5cdFx0XHRkb250RW51bXNMZW5ndGggPSBkb250RW51bXMubGVuZ3RoO1xuXG5cdFx0cmV0dXJuIGZ1bmN0aW9uIChvYmopIHtcblx0XHRcdGlmICh0eXBlb2Ygb2JqICE9PSAnb2JqZWN0JyAmJiB0eXBlb2Ygb2JqICE9PSAnZnVuY3Rpb24nIHx8IG9iaiA9PT0gbnVsbCkge1xuXHRcdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdPYmplY3Qua2V5cyBjYWxsZWQgb24gbm9uLW9iamVjdCcpO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgcmVzdWx0ID0gW107XG5cblx0XHRcdGZvciAodmFyIHByb3AgaW4gb2JqKSB7XG5cdFx0XHRcdGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIHtcblx0XHRcdFx0XHRyZXN1bHQucHVzaChwcm9wKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoaGFzRG9udEVudW1CdWcpIHtcblx0XHRcdFx0Zm9yICh2YXIgaT0wOyBpIDwgZG9udEVudW1zTGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRpZiAoaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGRvbnRFbnVtc1tpXSkpIHtcblx0XHRcdFx0XHRcdHJlc3VsdC5wdXNoKGRvbnRFbnVtc1tpXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH07XG5cdH0pKCk7XG59XG4vLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9PYmplY3QvY3JlYXRlXG5pZiAoIU9iamVjdC5jcmVhdGUpIHtcblx0T2JqZWN0LmNyZWF0ZSA9IChmdW5jdGlvbigpe1xuXHRcdGZ1bmN0aW9uIEYoKXt9XG5cblx0XHRyZXR1cm4gZnVuY3Rpb24obyl7XG5cdFx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCAhPT0gMSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ09iamVjdC5jcmVhdGUgaW1wbGVtZW50YXRpb24gb25seSBhY2NlcHRzIG9uZSBwYXJhbWV0ZXIuJyk7XG5cdFx0XHR9XG5cdFx0XHRGLnByb3RvdHlwZSA9IG87XG5cdFx0XHRyZXR1cm4gbmV3IEYoKTtcblx0XHR9O1xuXHR9KSgpO1xufVxuLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXkvaXNBcnJheT9yZWRpcmVjdGxvY2FsZT1lbi1VUyZyZWRpcmVjdHNsdWc9SmF2YVNjcmlwdCUyRlJlZmVyZW5jZSUyRkdsb2JhbF9PYmplY3RzJTJGQXJyYXklMkZpc0FycmF5XG5pZighQXJyYXkuaXNBcnJheSkge1xuXHRBcnJheS5pc0FycmF5ID0gZnVuY3Rpb24gKHZBcmcpIHtcblx0XHRyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZBcmcpID09PSBcIltvYmplY3QgQXJyYXldXCI7XG5cdH07XG59XG4vLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS9pbmRleE9mP3JlZGlyZWN0bG9jYWxlPWVuLVVTJnJlZGlyZWN0c2x1Zz1KYXZhU2NyaXB0JTJGUmVmZXJlbmNlJTJGR2xvYmFsX09iamVjdHMlMkZBcnJheSUyRmluZGV4T2ZcbmlmICghQXJyYXkucHJvdG90eXBlLmluZGV4T2YpIHtcblx0QXJyYXkucHJvdG90eXBlLmluZGV4T2YgPSBmdW5jdGlvbiAoc2VhcmNoRWxlbWVudCAvKiwgZnJvbUluZGV4ICovICkge1xuXHRcdGlmICh0aGlzID09PSBudWxsKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCk7XG5cdFx0fVxuXHRcdHZhciB0ID0gT2JqZWN0KHRoaXMpO1xuXHRcdHZhciBsZW4gPSB0Lmxlbmd0aCA+Pj4gMDtcblxuXHRcdGlmIChsZW4gPT09IDApIHtcblx0XHRcdHJldHVybiAtMTtcblx0XHR9XG5cdFx0dmFyIG4gPSAwO1xuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuXHRcdFx0biA9IE51bWJlcihhcmd1bWVudHNbMV0pO1xuXHRcdFx0aWYgKG4gIT09IG4pIHsgLy8gc2hvcnRjdXQgZm9yIHZlcmlmeWluZyBpZiBpdCdzIE5hTlxuXHRcdFx0XHRuID0gMDtcblx0XHRcdH0gZWxzZSBpZiAobiAhPT0gMCAmJiBuICE9PSBJbmZpbml0eSAmJiBuICE9PSAtSW5maW5pdHkpIHtcblx0XHRcdFx0biA9IChuID4gMCB8fCAtMSkgKiBNYXRoLmZsb29yKE1hdGguYWJzKG4pKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKG4gPj0gbGVuKSB7XG5cdFx0XHRyZXR1cm4gLTE7XG5cdFx0fVxuXHRcdHZhciBrID0gbiA+PSAwID8gbiA6IE1hdGgubWF4KGxlbiAtIE1hdGguYWJzKG4pLCAwKTtcblx0XHRmb3IgKDsgayA8IGxlbjsgaysrKSB7XG5cdFx0XHRpZiAoayBpbiB0ICYmIHRba10gPT09IHNlYXJjaEVsZW1lbnQpIHtcblx0XHRcdFx0cmV0dXJuIGs7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiAtMTtcblx0fTtcbn1cblxuLy8gR3J1bmdleSBPYmplY3QuaXNGcm96ZW4gaGFja1xuaWYgKCFPYmplY3QuaXNGcm96ZW4pIHtcblx0T2JqZWN0LmlzRnJvemVuID0gZnVuY3Rpb24gKG9iaikge1xuXHRcdHZhciBrZXkgPSBcInR2NF90ZXN0X2Zyb3plbl9rZXlcIjtcblx0XHR3aGlsZSAob2JqLmhhc093blByb3BlcnR5KGtleSkpIHtcblx0XHRcdGtleSArPSBNYXRoLnJhbmRvbSgpO1xuXHRcdH1cblx0XHR0cnkge1xuXHRcdFx0b2JqW2tleV0gPSB0cnVlO1xuXHRcdFx0ZGVsZXRlIG9ialtrZXldO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0fTtcbn1cbi8vIEJhc2VkIG9uOiBodHRwczovL2dpdGh1Yi5jb20vZ2VyYWludGx1ZmYvdXJpLXRlbXBsYXRlcywgYnV0IHdpdGggYWxsIHRoZSBkZS1zdWJzdGl0dXRpb24gc3R1ZmYgcmVtb3ZlZFxuXG52YXIgdXJpVGVtcGxhdGVHbG9iYWxNb2RpZmllcnMgPSB7XG5cdFwiK1wiOiB0cnVlLFxuXHRcIiNcIjogdHJ1ZSxcblx0XCIuXCI6IHRydWUsXG5cdFwiL1wiOiB0cnVlLFxuXHRcIjtcIjogdHJ1ZSxcblx0XCI/XCI6IHRydWUsXG5cdFwiJlwiOiB0cnVlXG59O1xudmFyIHVyaVRlbXBsYXRlU3VmZmljZXMgPSB7XG5cdFwiKlwiOiB0cnVlXG59O1xuXG5mdW5jdGlvbiBub3RSZWFsbHlQZXJjZW50RW5jb2RlKHN0cmluZykge1xuXHRyZXR1cm4gZW5jb2RlVVJJKHN0cmluZykucmVwbGFjZSgvJTI1WzAtOV1bMC05XS9nLCBmdW5jdGlvbiAoZG91YmxlRW5jb2RlZCkge1xuXHRcdHJldHVybiBcIiVcIiArIGRvdWJsZUVuY29kZWQuc3Vic3RyaW5nKDMpO1xuXHR9KTtcbn1cblxuZnVuY3Rpb24gdXJpVGVtcGxhdGVTdWJzdGl0dXRpb24oc3BlYykge1xuXHR2YXIgbW9kaWZpZXIgPSBcIlwiO1xuXHRpZiAodXJpVGVtcGxhdGVHbG9iYWxNb2RpZmllcnNbc3BlYy5jaGFyQXQoMCldKSB7XG5cdFx0bW9kaWZpZXIgPSBzcGVjLmNoYXJBdCgwKTtcblx0XHRzcGVjID0gc3BlYy5zdWJzdHJpbmcoMSk7XG5cdH1cblx0dmFyIHNlcGFyYXRvciA9IFwiXCI7XG5cdHZhciBwcmVmaXggPSBcIlwiO1xuXHR2YXIgc2hvdWxkRXNjYXBlID0gdHJ1ZTtcblx0dmFyIHNob3dWYXJpYWJsZXMgPSBmYWxzZTtcblx0dmFyIHRyaW1FbXB0eVN0cmluZyA9IGZhbHNlO1xuXHRpZiAobW9kaWZpZXIgPT09ICcrJykge1xuXHRcdHNob3VsZEVzY2FwZSA9IGZhbHNlO1xuXHR9IGVsc2UgaWYgKG1vZGlmaWVyID09PSBcIi5cIikge1xuXHRcdHByZWZpeCA9IFwiLlwiO1xuXHRcdHNlcGFyYXRvciA9IFwiLlwiO1xuXHR9IGVsc2UgaWYgKG1vZGlmaWVyID09PSBcIi9cIikge1xuXHRcdHByZWZpeCA9IFwiL1wiO1xuXHRcdHNlcGFyYXRvciA9IFwiL1wiO1xuXHR9IGVsc2UgaWYgKG1vZGlmaWVyID09PSAnIycpIHtcblx0XHRwcmVmaXggPSBcIiNcIjtcblx0XHRzaG91bGRFc2NhcGUgPSBmYWxzZTtcblx0fSBlbHNlIGlmIChtb2RpZmllciA9PT0gJzsnKSB7XG5cdFx0cHJlZml4ID0gXCI7XCI7XG5cdFx0c2VwYXJhdG9yID0gXCI7XCI7XG5cdFx0c2hvd1ZhcmlhYmxlcyA9IHRydWU7XG5cdFx0dHJpbUVtcHR5U3RyaW5nID0gdHJ1ZTtcblx0fSBlbHNlIGlmIChtb2RpZmllciA9PT0gJz8nKSB7XG5cdFx0cHJlZml4ID0gXCI/XCI7XG5cdFx0c2VwYXJhdG9yID0gXCImXCI7XG5cdFx0c2hvd1ZhcmlhYmxlcyA9IHRydWU7XG5cdH0gZWxzZSBpZiAobW9kaWZpZXIgPT09ICcmJykge1xuXHRcdHByZWZpeCA9IFwiJlwiO1xuXHRcdHNlcGFyYXRvciA9IFwiJlwiO1xuXHRcdHNob3dWYXJpYWJsZXMgPSB0cnVlO1xuXHR9XG5cblx0dmFyIHZhck5hbWVzID0gW107XG5cdHZhciB2YXJMaXN0ID0gc3BlYy5zcGxpdChcIixcIik7XG5cdHZhciB2YXJTcGVjcyA9IFtdO1xuXHR2YXIgdmFyU3BlY01hcCA9IHt9O1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHZhckxpc3QubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgdmFyTmFtZSA9IHZhckxpc3RbaV07XG5cdFx0dmFyIHRydW5jYXRlID0gbnVsbDtcblx0XHRpZiAodmFyTmFtZS5pbmRleE9mKFwiOlwiKSAhPT0gLTEpIHtcblx0XHRcdHZhciBwYXJ0cyA9IHZhck5hbWUuc3BsaXQoXCI6XCIpO1xuXHRcdFx0dmFyTmFtZSA9IHBhcnRzWzBdO1xuXHRcdFx0dHJ1bmNhdGUgPSBwYXJzZUludChwYXJ0c1sxXSwgMTApO1xuXHRcdH1cblx0XHR2YXIgc3VmZmljZXMgPSB7fTtcblx0XHR3aGlsZSAodXJpVGVtcGxhdGVTdWZmaWNlc1t2YXJOYW1lLmNoYXJBdCh2YXJOYW1lLmxlbmd0aCAtIDEpXSkge1xuXHRcdFx0c3VmZmljZXNbdmFyTmFtZS5jaGFyQXQodmFyTmFtZS5sZW5ndGggLSAxKV0gPSB0cnVlO1xuXHRcdFx0dmFyTmFtZSA9IHZhck5hbWUuc3Vic3RyaW5nKDAsIHZhck5hbWUubGVuZ3RoIC0gMSk7XG5cdFx0fVxuXHRcdHZhciB2YXJTcGVjID0ge1xuXHRcdFx0dHJ1bmNhdGU6IHRydW5jYXRlLFxuXHRcdFx0bmFtZTogdmFyTmFtZSxcblx0XHRcdHN1ZmZpY2VzOiBzdWZmaWNlc1xuXHRcdH07XG5cdFx0dmFyU3BlY3MucHVzaCh2YXJTcGVjKTtcblx0XHR2YXJTcGVjTWFwW3Zhck5hbWVdID0gdmFyU3BlYztcblx0XHR2YXJOYW1lcy5wdXNoKHZhck5hbWUpO1xuXHR9XG5cdHZhciBzdWJGdW5jdGlvbiA9IGZ1bmN0aW9uICh2YWx1ZUZ1bmN0aW9uKSB7XG5cdFx0dmFyIHJlc3VsdCA9IFwiXCI7XG5cdFx0dmFyIHN0YXJ0SW5kZXggPSAwO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdmFyU3BlY3MubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciB2YXJTcGVjID0gdmFyU3BlY3NbaV07XG5cdFx0XHR2YXIgdmFsdWUgPSB2YWx1ZUZ1bmN0aW9uKHZhclNwZWMubmFtZSk7XG5cdFx0XHRpZiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCB8fCAoQXJyYXkuaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUubGVuZ3RoID09PSAwKSB8fCAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiBPYmplY3Qua2V5cyh2YWx1ZSkubGVuZ3RoID09PSAwKSkge1xuXHRcdFx0XHRzdGFydEluZGV4Kys7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGkgPT09IHN0YXJ0SW5kZXgpIHtcblx0XHRcdFx0cmVzdWx0ICs9IHByZWZpeDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJlc3VsdCArPSAoc2VwYXJhdG9yIHx8IFwiLFwiKTtcblx0XHRcdH1cblx0XHRcdGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuXHRcdFx0XHRpZiAoc2hvd1ZhcmlhYmxlcykge1xuXHRcdFx0XHRcdHJlc3VsdCArPSB2YXJTcGVjLm5hbWUgKyBcIj1cIjtcblx0XHRcdFx0fVxuXHRcdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IHZhbHVlLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdFx0aWYgKGogPiAwKSB7XG5cdFx0XHRcdFx0XHRyZXN1bHQgKz0gdmFyU3BlYy5zdWZmaWNlc1snKiddID8gKHNlcGFyYXRvciB8fCBcIixcIikgOiBcIixcIjtcblx0XHRcdFx0XHRcdGlmICh2YXJTcGVjLnN1ZmZpY2VzWycqJ10gJiYgc2hvd1ZhcmlhYmxlcykge1xuXHRcdFx0XHRcdFx0XHRyZXN1bHQgKz0gdmFyU3BlYy5uYW1lICsgXCI9XCI7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJlc3VsdCArPSBzaG91bGRFc2NhcGUgPyBlbmNvZGVVUklDb21wb25lbnQodmFsdWVbal0pLnJlcGxhY2UoLyEvZywgXCIlMjFcIikgOiBub3RSZWFsbHlQZXJjZW50RW5jb2RlKHZhbHVlW2pdKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdFx0aWYgKHNob3dWYXJpYWJsZXMgJiYgIXZhclNwZWMuc3VmZmljZXNbJyonXSkge1xuXHRcdFx0XHRcdHJlc3VsdCArPSB2YXJTcGVjLm5hbWUgKyBcIj1cIjtcblx0XHRcdFx0fVxuXHRcdFx0XHR2YXIgZmlyc3QgPSB0cnVlO1xuXHRcdFx0XHRmb3IgKHZhciBrZXkgaW4gdmFsdWUpIHtcblx0XHRcdFx0XHRpZiAoIWZpcnN0KSB7XG5cdFx0XHRcdFx0XHRyZXN1bHQgKz0gdmFyU3BlYy5zdWZmaWNlc1snKiddID8gKHNlcGFyYXRvciB8fCBcIixcIikgOiBcIixcIjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Zmlyc3QgPSBmYWxzZTtcblx0XHRcdFx0XHRyZXN1bHQgKz0gc2hvdWxkRXNjYXBlID8gZW5jb2RlVVJJQ29tcG9uZW50KGtleSkucmVwbGFjZSgvIS9nLCBcIiUyMVwiKSA6IG5vdFJlYWxseVBlcmNlbnRFbmNvZGUoa2V5KTtcblx0XHRcdFx0XHRyZXN1bHQgKz0gdmFyU3BlYy5zdWZmaWNlc1snKiddID8gJz0nIDogXCIsXCI7XG5cdFx0XHRcdFx0cmVzdWx0ICs9IHNob3VsZEVzY2FwZSA/IGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZVtrZXldKS5yZXBsYWNlKC8hL2csIFwiJTIxXCIpIDogbm90UmVhbGx5UGVyY2VudEVuY29kZSh2YWx1ZVtrZXldKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aWYgKHNob3dWYXJpYWJsZXMpIHtcblx0XHRcdFx0XHRyZXN1bHQgKz0gdmFyU3BlYy5uYW1lO1xuXHRcdFx0XHRcdGlmICghdHJpbUVtcHR5U3RyaW5nIHx8IHZhbHVlICE9PSBcIlwiKSB7XG5cdFx0XHRcdFx0XHRyZXN1bHQgKz0gXCI9XCI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICh2YXJTcGVjLnRydW5jYXRlICE9IG51bGwpIHtcblx0XHRcdFx0XHR2YWx1ZSA9IHZhbHVlLnN1YnN0cmluZygwLCB2YXJTcGVjLnRydW5jYXRlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXN1bHQgKz0gc2hvdWxkRXNjYXBlID8gZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKS5yZXBsYWNlKC8hL2csIFwiJTIxXCIpOiBub3RSZWFsbHlQZXJjZW50RW5jb2RlKHZhbHVlKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fTtcblx0c3ViRnVuY3Rpb24udmFyTmFtZXMgPSB2YXJOYW1lcztcblx0cmV0dXJuIHtcblx0XHRwcmVmaXg6IHByZWZpeCxcblx0XHRzdWJzdGl0dXRpb246IHN1YkZ1bmN0aW9uXG5cdH07XG59XG5cbmZ1bmN0aW9uIFVyaVRlbXBsYXRlKHRlbXBsYXRlKSB7XG5cdGlmICghKHRoaXMgaW5zdGFuY2VvZiBVcmlUZW1wbGF0ZSkpIHtcblx0XHRyZXR1cm4gbmV3IFVyaVRlbXBsYXRlKHRlbXBsYXRlKTtcblx0fVxuXHR2YXIgcGFydHMgPSB0ZW1wbGF0ZS5zcGxpdChcIntcIik7XG5cdHZhciB0ZXh0UGFydHMgPSBbcGFydHMuc2hpZnQoKV07XG5cdHZhciBwcmVmaXhlcyA9IFtdO1xuXHR2YXIgc3Vic3RpdHV0aW9ucyA9IFtdO1xuXHR2YXIgdmFyTmFtZXMgPSBbXTtcblx0d2hpbGUgKHBhcnRzLmxlbmd0aCA+IDApIHtcblx0XHR2YXIgcGFydCA9IHBhcnRzLnNoaWZ0KCk7XG5cdFx0dmFyIHNwZWMgPSBwYXJ0LnNwbGl0KFwifVwiKVswXTtcblx0XHR2YXIgcmVtYWluZGVyID0gcGFydC5zdWJzdHJpbmcoc3BlYy5sZW5ndGggKyAxKTtcblx0XHR2YXIgZnVuY3MgPSB1cmlUZW1wbGF0ZVN1YnN0aXR1dGlvbihzcGVjKTtcblx0XHRzdWJzdGl0dXRpb25zLnB1c2goZnVuY3Muc3Vic3RpdHV0aW9uKTtcblx0XHRwcmVmaXhlcy5wdXNoKGZ1bmNzLnByZWZpeCk7XG5cdFx0dGV4dFBhcnRzLnB1c2gocmVtYWluZGVyKTtcblx0XHR2YXJOYW1lcyA9IHZhck5hbWVzLmNvbmNhdChmdW5jcy5zdWJzdGl0dXRpb24udmFyTmFtZXMpO1xuXHR9XG5cdHRoaXMuZmlsbCA9IGZ1bmN0aW9uICh2YWx1ZUZ1bmN0aW9uKSB7XG5cdFx0dmFyIHJlc3VsdCA9IHRleHRQYXJ0c1swXTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHN1YnN0aXR1dGlvbnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBzdWJzdGl0dXRpb24gPSBzdWJzdGl0dXRpb25zW2ldO1xuXHRcdFx0cmVzdWx0ICs9IHN1YnN0aXR1dGlvbih2YWx1ZUZ1bmN0aW9uKTtcblx0XHRcdHJlc3VsdCArPSB0ZXh0UGFydHNbaSArIDFdO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9O1xuXHR0aGlzLnZhck5hbWVzID0gdmFyTmFtZXM7XG5cdHRoaXMudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcbn1cblVyaVRlbXBsYXRlLnByb3RvdHlwZSA9IHtcblx0dG9TdHJpbmc6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gdGhpcy50ZW1wbGF0ZTtcblx0fSxcblx0ZmlsbEZyb21PYmplY3Q6IGZ1bmN0aW9uIChvYmopIHtcblx0XHRyZXR1cm4gdGhpcy5maWxsKGZ1bmN0aW9uICh2YXJOYW1lKSB7XG5cdFx0XHRyZXR1cm4gb2JqW3Zhck5hbWVdO1xuXHRcdH0pO1xuXHR9XG59O1xudmFyIFZhbGlkYXRvckNvbnRleHQgPSBmdW5jdGlvbiBWYWxpZGF0b3JDb250ZXh0KHBhcmVudCwgY29sbGVjdE11bHRpcGxlLCBlcnJvck1lc3NhZ2VzLCBjaGVja1JlY3Vyc2l2ZSwgdHJhY2tVbmtub3duUHJvcGVydGllcykge1xuXHR0aGlzLm1pc3NpbmcgPSBbXTtcblx0dGhpcy5taXNzaW5nTWFwID0ge307XG5cdHRoaXMuZm9ybWF0VmFsaWRhdG9ycyA9IHBhcmVudCA/IE9iamVjdC5jcmVhdGUocGFyZW50LmZvcm1hdFZhbGlkYXRvcnMpIDoge307XG5cdHRoaXMuc2NoZW1hcyA9IHBhcmVudCA/IE9iamVjdC5jcmVhdGUocGFyZW50LnNjaGVtYXMpIDoge307XG5cdHRoaXMuY29sbGVjdE11bHRpcGxlID0gY29sbGVjdE11bHRpcGxlO1xuXHR0aGlzLmVycm9ycyA9IFtdO1xuXHR0aGlzLmhhbmRsZUVycm9yID0gY29sbGVjdE11bHRpcGxlID8gdGhpcy5jb2xsZWN0RXJyb3IgOiB0aGlzLnJldHVybkVycm9yO1xuXHRpZiAoY2hlY2tSZWN1cnNpdmUpIHtcblx0XHR0aGlzLmNoZWNrUmVjdXJzaXZlID0gdHJ1ZTtcblx0XHR0aGlzLnNjYW5uZWQgPSBbXTtcblx0XHR0aGlzLnNjYW5uZWRGcm96ZW4gPSBbXTtcblx0XHR0aGlzLnNjYW5uZWRGcm96ZW5TY2hlbWFzID0gW107XG5cdFx0dGhpcy5zY2FubmVkRnJvemVuVmFsaWRhdGlvbkVycm9ycyA9IFtdO1xuXHRcdHRoaXMudmFsaWRhdGVkU2NoZW1hc0tleSA9ICd0djRfdmFsaWRhdGlvbl9pZCc7XG5cdFx0dGhpcy52YWxpZGF0aW9uRXJyb3JzS2V5ID0gJ3R2NF92YWxpZGF0aW9uX2Vycm9yc19pZCc7XG5cdH1cblx0aWYgKHRyYWNrVW5rbm93blByb3BlcnRpZXMpIHtcblx0XHR0aGlzLnRyYWNrVW5rbm93blByb3BlcnRpZXMgPSB0cnVlO1xuXHRcdHRoaXMua25vd25Qcm9wZXJ0eVBhdGhzID0ge307XG5cdFx0dGhpcy51bmtub3duUHJvcGVydHlQYXRocyA9IHt9O1xuXHR9XG5cdHRoaXMuZXJyb3JNZXNzYWdlcyA9IGVycm9yTWVzc2FnZXM7XG5cdHRoaXMuZGVmaW5lZEtleXdvcmRzID0ge307XG5cdGlmIChwYXJlbnQpIHtcblx0XHRmb3IgKHZhciBrZXkgaW4gcGFyZW50LmRlZmluZWRLZXl3b3Jkcykge1xuXHRcdFx0dGhpcy5kZWZpbmVkS2V5d29yZHNba2V5XSA9IHBhcmVudC5kZWZpbmVkS2V5d29yZHNba2V5XS5zbGljZSgwKTtcblx0XHR9XG5cdH1cbn07XG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5kZWZpbmVLZXl3b3JkID0gZnVuY3Rpb24gKGtleXdvcmQsIGtleXdvcmRGdW5jdGlvbikge1xuXHR0aGlzLmRlZmluZWRLZXl3b3Jkc1trZXl3b3JkXSA9IHRoaXMuZGVmaW5lZEtleXdvcmRzW2tleXdvcmRdIHx8IFtdO1xuXHR0aGlzLmRlZmluZWRLZXl3b3Jkc1trZXl3b3JkXS5wdXNoKGtleXdvcmRGdW5jdGlvbik7XG59O1xuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUuY3JlYXRlRXJyb3IgPSBmdW5jdGlvbiAoY29kZSwgbWVzc2FnZVBhcmFtcywgZGF0YVBhdGgsIHNjaGVtYVBhdGgsIHN1YkVycm9ycykge1xuXHR2YXIgbWVzc2FnZVRlbXBsYXRlID0gdGhpcy5lcnJvck1lc3NhZ2VzW2NvZGVdIHx8IEVycm9yTWVzc2FnZXNEZWZhdWx0W2NvZGVdO1xuXHRpZiAodHlwZW9mIG1lc3NhZ2VUZW1wbGF0ZSAhPT0gJ3N0cmluZycpIHtcblx0XHRyZXR1cm4gbmV3IFZhbGlkYXRpb25FcnJvcihjb2RlLCBcIlVua25vd24gZXJyb3IgY29kZSBcIiArIGNvZGUgKyBcIjogXCIgKyBKU09OLnN0cmluZ2lmeShtZXNzYWdlUGFyYW1zKSwgbWVzc2FnZVBhcmFtcywgZGF0YVBhdGgsIHNjaGVtYVBhdGgsIHN1YkVycm9ycyk7XG5cdH1cblx0Ly8gQWRhcHRlZCBmcm9tIENyb2NrZm9yZCdzIHN1cHBsYW50KClcblx0dmFyIG1lc3NhZ2UgPSBtZXNzYWdlVGVtcGxhdGUucmVwbGFjZSgvXFx7KFtee31dKilcXH0vZywgZnVuY3Rpb24gKHdob2xlLCB2YXJOYW1lKSB7XG5cdFx0dmFyIHN1YlZhbHVlID0gbWVzc2FnZVBhcmFtc1t2YXJOYW1lXTtcblx0XHRyZXR1cm4gdHlwZW9mIHN1YlZhbHVlID09PSAnc3RyaW5nJyB8fCB0eXBlb2Ygc3ViVmFsdWUgPT09ICdudW1iZXInID8gc3ViVmFsdWUgOiB3aG9sZTtcblx0fSk7XG5cdHJldHVybiBuZXcgVmFsaWRhdGlvbkVycm9yKGNvZGUsIG1lc3NhZ2UsIG1lc3NhZ2VQYXJhbXMsIGRhdGFQYXRoLCBzY2hlbWFQYXRoLCBzdWJFcnJvcnMpO1xufTtcblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnJldHVybkVycm9yID0gZnVuY3Rpb24gKGVycm9yKSB7XG5cdHJldHVybiBlcnJvcjtcbn07XG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5jb2xsZWN0RXJyb3IgPSBmdW5jdGlvbiAoZXJyb3IpIHtcblx0aWYgKGVycm9yKSB7XG5cdFx0dGhpcy5lcnJvcnMucHVzaChlcnJvcik7XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUucHJlZml4RXJyb3JzID0gZnVuY3Rpb24gKHN0YXJ0SW5kZXgsIGRhdGFQYXRoLCBzY2hlbWFQYXRoKSB7XG5cdGZvciAodmFyIGkgPSBzdGFydEluZGV4OyBpIDwgdGhpcy5lcnJvcnMubGVuZ3RoOyBpKyspIHtcblx0XHR0aGlzLmVycm9yc1tpXSA9IHRoaXMuZXJyb3JzW2ldLnByZWZpeFdpdGgoZGF0YVBhdGgsIHNjaGVtYVBhdGgpO1xuXHR9XG5cdHJldHVybiB0aGlzO1xufTtcblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLmJhblVua25vd25Qcm9wZXJ0aWVzID0gZnVuY3Rpb24gKCkge1xuXHRmb3IgKHZhciB1bmtub3duUGF0aCBpbiB0aGlzLnVua25vd25Qcm9wZXJ0eVBhdGhzKSB7XG5cdFx0dmFyIGVycm9yID0gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLlVOS05PV05fUFJPUEVSVFksIHtwYXRoOiB1bmtub3duUGF0aH0sIHVua25vd25QYXRoLCBcIlwiKTtcblx0XHR2YXIgcmVzdWx0ID0gdGhpcy5oYW5kbGVFcnJvcihlcnJvcik7XG5cdFx0aWYgKHJlc3VsdCkge1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5hZGRGb3JtYXQgPSBmdW5jdGlvbiAoZm9ybWF0LCB2YWxpZGF0b3IpIHtcblx0aWYgKHR5cGVvZiBmb3JtYXQgPT09ICdvYmplY3QnKSB7XG5cdFx0Zm9yICh2YXIga2V5IGluIGZvcm1hdCkge1xuXHRcdFx0dGhpcy5hZGRGb3JtYXQoa2V5LCBmb3JtYXRba2V5XSk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdHRoaXMuZm9ybWF0VmFsaWRhdG9yc1tmb3JtYXRdID0gdmFsaWRhdG9yO1xufTtcblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnJlc29sdmVSZWZzID0gZnVuY3Rpb24gKHNjaGVtYSwgdXJsSGlzdG9yeSkge1xuXHRpZiAoc2NoZW1hWyckcmVmJ10gIT09IHVuZGVmaW5lZCkge1xuXHRcdHVybEhpc3RvcnkgPSB1cmxIaXN0b3J5IHx8IHt9O1xuXHRcdGlmICh1cmxIaXN0b3J5W3NjaGVtYVsnJHJlZiddXSkge1xuXHRcdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5DSVJDVUxBUl9SRUZFUkVOQ0UsIHt1cmxzOiBPYmplY3Qua2V5cyh1cmxIaXN0b3J5KS5qb2luKCcsICcpfSwgJycsICcnKTtcblx0XHR9XG5cdFx0dXJsSGlzdG9yeVtzY2hlbWFbJyRyZWYnXV0gPSB0cnVlO1xuXHRcdHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKHNjaGVtYVsnJHJlZiddLCB1cmxIaXN0b3J5KTtcblx0fVxuXHRyZXR1cm4gc2NoZW1hO1xufTtcblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLmdldFNjaGVtYSA9IGZ1bmN0aW9uICh1cmwsIHVybEhpc3RvcnkpIHtcblx0dmFyIHNjaGVtYTtcblx0aWYgKHRoaXMuc2NoZW1hc1t1cmxdICE9PSB1bmRlZmluZWQpIHtcblx0XHRzY2hlbWEgPSB0aGlzLnNjaGVtYXNbdXJsXTtcblx0XHRyZXR1cm4gdGhpcy5yZXNvbHZlUmVmcyhzY2hlbWEsIHVybEhpc3RvcnkpO1xuXHR9XG5cdHZhciBiYXNlVXJsID0gdXJsO1xuXHR2YXIgZnJhZ21lbnQgPSBcIlwiO1xuXHRpZiAodXJsLmluZGV4T2YoJyMnKSAhPT0gLTEpIHtcblx0XHRmcmFnbWVudCA9IHVybC5zdWJzdHJpbmcodXJsLmluZGV4T2YoXCIjXCIpICsgMSk7XG5cdFx0YmFzZVVybCA9IHVybC5zdWJzdHJpbmcoMCwgdXJsLmluZGV4T2YoXCIjXCIpKTtcblx0fVxuXHRpZiAodHlwZW9mIHRoaXMuc2NoZW1hc1tiYXNlVXJsXSA9PT0gJ29iamVjdCcpIHtcblx0XHRzY2hlbWEgPSB0aGlzLnNjaGVtYXNbYmFzZVVybF07XG5cdFx0dmFyIHBvaW50ZXJQYXRoID0gZGVjb2RlVVJJQ29tcG9uZW50KGZyYWdtZW50KTtcblx0XHRpZiAocG9pbnRlclBhdGggPT09IFwiXCIpIHtcblx0XHRcdHJldHVybiB0aGlzLnJlc29sdmVSZWZzKHNjaGVtYSwgdXJsSGlzdG9yeSk7XG5cdFx0fSBlbHNlIGlmIChwb2ludGVyUGF0aC5jaGFyQXQoMCkgIT09IFwiL1wiKSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0XHR2YXIgcGFydHMgPSBwb2ludGVyUGF0aC5zcGxpdChcIi9cIikuc2xpY2UoMSk7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwYXJ0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGNvbXBvbmVudCA9IHBhcnRzW2ldLnJlcGxhY2UoL34xL2csIFwiL1wiKS5yZXBsYWNlKC9+MC9nLCBcIn5cIik7XG5cdFx0XHRpZiAoc2NoZW1hW2NvbXBvbmVudF0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRzY2hlbWEgPSB1bmRlZmluZWQ7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdFx0c2NoZW1hID0gc2NoZW1hW2NvbXBvbmVudF07XG5cdFx0fVxuXHRcdGlmIChzY2hlbWEgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cmV0dXJuIHRoaXMucmVzb2x2ZVJlZnMoc2NoZW1hLCB1cmxIaXN0b3J5KTtcblx0XHR9XG5cdH1cblx0aWYgKHRoaXMubWlzc2luZ1tiYXNlVXJsXSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0dGhpcy5taXNzaW5nLnB1c2goYmFzZVVybCk7XG5cdFx0dGhpcy5taXNzaW5nW2Jhc2VVcmxdID0gYmFzZVVybDtcblx0XHR0aGlzLm1pc3NpbmdNYXBbYmFzZVVybF0gPSBiYXNlVXJsO1xuXHR9XG59O1xuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUuc2VhcmNoU2NoZW1hcyA9IGZ1bmN0aW9uIChzY2hlbWEsIHVybCkge1xuXHRpZiAoc2NoZW1hICYmIHR5cGVvZiBzY2hlbWEgPT09IFwib2JqZWN0XCIpIHtcblx0XHRpZiAodHlwZW9mIHNjaGVtYS5pZCA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0aWYgKGlzVHJ1c3RlZFVybCh1cmwsIHNjaGVtYS5pZCkpIHtcblx0XHRcdFx0aWYgKHRoaXMuc2NoZW1hc1tzY2hlbWEuaWRdID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHR0aGlzLnNjaGVtYXNbc2NoZW1hLmlkXSA9IHNjaGVtYTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRmb3IgKHZhciBrZXkgaW4gc2NoZW1hKSB7XG5cdFx0XHRpZiAoa2V5ICE9PSBcImVudW1cIikge1xuXHRcdFx0XHRpZiAodHlwZW9mIHNjaGVtYVtrZXldID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRcdFx0dGhpcy5zZWFyY2hTY2hlbWFzKHNjaGVtYVtrZXldLCB1cmwpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGtleSA9PT0gXCIkcmVmXCIpIHtcblx0XHRcdFx0XHR2YXIgdXJpID0gZ2V0RG9jdW1lbnRVcmkoc2NoZW1hW2tleV0pO1xuXHRcdFx0XHRcdGlmICh1cmkgJiYgdGhpcy5zY2hlbWFzW3VyaV0gPT09IHVuZGVmaW5lZCAmJiB0aGlzLm1pc3NpbmdNYXBbdXJpXSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHR0aGlzLm1pc3NpbmdNYXBbdXJpXSA9IHVyaTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cbn07XG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5hZGRTY2hlbWEgPSBmdW5jdGlvbiAodXJsLCBzY2hlbWEpIHtcblx0Ly9vdmVybG9hZFxuXHRpZiAodHlwZW9mIHVybCAhPT0gJ3N0cmluZycgfHwgdHlwZW9mIHNjaGVtYSA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRpZiAodHlwZW9mIHVybCA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHVybC5pZCA9PT0gJ3N0cmluZycpIHtcblx0XHRcdHNjaGVtYSA9IHVybDtcblx0XHRcdHVybCA9IHNjaGVtYS5pZDtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHR9XG5cdGlmICh1cmwgPT09IGdldERvY3VtZW50VXJpKHVybCkgKyBcIiNcIikge1xuXHRcdC8vIFJlbW92ZSBlbXB0eSBmcmFnbWVudFxuXHRcdHVybCA9IGdldERvY3VtZW50VXJpKHVybCk7XG5cdH1cblx0dGhpcy5zY2hlbWFzW3VybF0gPSBzY2hlbWE7XG5cdGRlbGV0ZSB0aGlzLm1pc3NpbmdNYXBbdXJsXTtcblx0bm9ybVNjaGVtYShzY2hlbWEsIHVybCk7XG5cdHRoaXMuc2VhcmNoU2NoZW1hcyhzY2hlbWEsIHVybCk7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5nZXRTY2hlbWFNYXAgPSBmdW5jdGlvbiAoKSB7XG5cdHZhciBtYXAgPSB7fTtcblx0Zm9yICh2YXIga2V5IGluIHRoaXMuc2NoZW1hcykge1xuXHRcdG1hcFtrZXldID0gdGhpcy5zY2hlbWFzW2tleV07XG5cdH1cblx0cmV0dXJuIG1hcDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLmdldFNjaGVtYVVyaXMgPSBmdW5jdGlvbiAoZmlsdGVyUmVnRXhwKSB7XG5cdHZhciBsaXN0ID0gW107XG5cdGZvciAodmFyIGtleSBpbiB0aGlzLnNjaGVtYXMpIHtcblx0XHRpZiAoIWZpbHRlclJlZ0V4cCB8fCBmaWx0ZXJSZWdFeHAudGVzdChrZXkpKSB7XG5cdFx0XHRsaXN0LnB1c2goa2V5KTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGxpc3Q7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5nZXRNaXNzaW5nVXJpcyA9IGZ1bmN0aW9uIChmaWx0ZXJSZWdFeHApIHtcblx0dmFyIGxpc3QgPSBbXTtcblx0Zm9yICh2YXIga2V5IGluIHRoaXMubWlzc2luZ01hcCkge1xuXHRcdGlmICghZmlsdGVyUmVnRXhwIHx8IGZpbHRlclJlZ0V4cC50ZXN0KGtleSkpIHtcblx0XHRcdGxpc3QucHVzaChrZXkpO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gbGlzdDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLmRyb3BTY2hlbWFzID0gZnVuY3Rpb24gKCkge1xuXHR0aGlzLnNjaGVtYXMgPSB7fTtcblx0dGhpcy5yZXNldCgpO1xufTtcblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gKCkge1xuXHR0aGlzLm1pc3NpbmcgPSBbXTtcblx0dGhpcy5taXNzaW5nTWFwID0ge307XG5cdHRoaXMuZXJyb3JzID0gW107XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZUFsbCA9IGZ1bmN0aW9uIChkYXRhLCBzY2hlbWEsIGRhdGFQYXRoUGFydHMsIHNjaGVtYVBhdGhQYXJ0cywgZGF0YVBvaW50ZXJQYXRoKSB7XG5cdHZhciB0b3BMZXZlbDtcblx0c2NoZW1hID0gdGhpcy5yZXNvbHZlUmVmcyhzY2hlbWEpO1xuXHRpZiAoIXNjaGVtYSkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9IGVsc2UgaWYgKHNjaGVtYSBpbnN0YW5jZW9mIFZhbGlkYXRpb25FcnJvcikge1xuXHRcdHRoaXMuZXJyb3JzLnB1c2goc2NoZW1hKTtcblx0XHRyZXR1cm4gc2NoZW1hO1xuXHR9XG5cblx0dmFyIHN0YXJ0RXJyb3JDb3VudCA9IHRoaXMuZXJyb3JzLmxlbmd0aDtcblx0dmFyIGZyb3plbkluZGV4LCBzY2FubmVkRnJvemVuU2NoZW1hSW5kZXggPSBudWxsLCBzY2FubmVkU2NoZW1hc0luZGV4ID0gbnVsbDtcblx0aWYgKHRoaXMuY2hlY2tSZWN1cnNpdmUgJiYgZGF0YSAmJiB0eXBlb2YgZGF0YSA9PT0gJ29iamVjdCcpIHtcblx0XHR0b3BMZXZlbCA9ICF0aGlzLnNjYW5uZWQubGVuZ3RoO1xuXHRcdGlmIChkYXRhW3RoaXMudmFsaWRhdGVkU2NoZW1hc0tleV0pIHtcblx0XHRcdHZhciBzY2hlbWFJbmRleCA9IGRhdGFbdGhpcy52YWxpZGF0ZWRTY2hlbWFzS2V5XS5pbmRleE9mKHNjaGVtYSk7XG5cdFx0XHRpZiAoc2NoZW1hSW5kZXggIT09IC0xKSB7XG5cdFx0XHRcdHRoaXMuZXJyb3JzID0gdGhpcy5lcnJvcnMuY29uY2F0KGRhdGFbdGhpcy52YWxpZGF0aW9uRXJyb3JzS2V5XVtzY2hlbWFJbmRleF0pO1xuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKE9iamVjdC5pc0Zyb3plbihkYXRhKSkge1xuXHRcdFx0ZnJvemVuSW5kZXggPSB0aGlzLnNjYW5uZWRGcm96ZW4uaW5kZXhPZihkYXRhKTtcblx0XHRcdGlmIChmcm96ZW5JbmRleCAhPT0gLTEpIHtcblx0XHRcdFx0dmFyIGZyb3plblNjaGVtYUluZGV4ID0gdGhpcy5zY2FubmVkRnJvemVuU2NoZW1hc1tmcm96ZW5JbmRleF0uaW5kZXhPZihzY2hlbWEpO1xuXHRcdFx0XHRpZiAoZnJvemVuU2NoZW1hSW5kZXggIT09IC0xKSB7XG5cdFx0XHRcdFx0dGhpcy5lcnJvcnMgPSB0aGlzLmVycm9ycy5jb25jYXQodGhpcy5zY2FubmVkRnJvemVuVmFsaWRhdGlvbkVycm9yc1tmcm96ZW5JbmRleF1bZnJvemVuU2NoZW1hSW5kZXhdKTtcblx0XHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHR0aGlzLnNjYW5uZWQucHVzaChkYXRhKTtcblx0XHRpZiAoT2JqZWN0LmlzRnJvemVuKGRhdGEpKSB7XG5cdFx0XHRpZiAoZnJvemVuSW5kZXggPT09IC0xKSB7XG5cdFx0XHRcdGZyb3plbkluZGV4ID0gdGhpcy5zY2FubmVkRnJvemVuLmxlbmd0aDtcblx0XHRcdFx0dGhpcy5zY2FubmVkRnJvemVuLnB1c2goZGF0YSk7XG5cdFx0XHRcdHRoaXMuc2Nhbm5lZEZyb3plblNjaGVtYXMucHVzaChbXSk7XG5cdFx0XHR9XG5cdFx0XHRzY2FubmVkRnJvemVuU2NoZW1hSW5kZXggPSB0aGlzLnNjYW5uZWRGcm96ZW5TY2hlbWFzW2Zyb3plbkluZGV4XS5sZW5ndGg7XG5cdFx0XHR0aGlzLnNjYW5uZWRGcm96ZW5TY2hlbWFzW2Zyb3plbkluZGV4XVtzY2FubmVkRnJvemVuU2NoZW1hSW5kZXhdID0gc2NoZW1hO1xuXHRcdFx0dGhpcy5zY2FubmVkRnJvemVuVmFsaWRhdGlvbkVycm9yc1tmcm96ZW5JbmRleF1bc2Nhbm5lZEZyb3plblNjaGVtYUluZGV4XSA9IFtdO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAoIWRhdGFbdGhpcy52YWxpZGF0ZWRTY2hlbWFzS2V5XSkge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkYXRhLCB0aGlzLnZhbGlkYXRlZFNjaGVtYXNLZXksIHtcblx0XHRcdFx0XHRcdHZhbHVlOiBbXSxcblx0XHRcdFx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkYXRhLCB0aGlzLnZhbGlkYXRpb25FcnJvcnNLZXksIHtcblx0XHRcdFx0XHRcdHZhbHVlOiBbXSxcblx0XHRcdFx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0Ly9JRSA3Lzggd29ya2Fyb3VuZFxuXHRcdFx0XHRcdGRhdGFbdGhpcy52YWxpZGF0ZWRTY2hlbWFzS2V5XSA9IFtdO1xuXHRcdFx0XHRcdGRhdGFbdGhpcy52YWxpZGF0aW9uRXJyb3JzS2V5XSA9IFtdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRzY2FubmVkU2NoZW1hc0luZGV4ID0gZGF0YVt0aGlzLnZhbGlkYXRlZFNjaGVtYXNLZXldLmxlbmd0aDtcblx0XHRcdGRhdGFbdGhpcy52YWxpZGF0ZWRTY2hlbWFzS2V5XVtzY2FubmVkU2NoZW1hc0luZGV4XSA9IHNjaGVtYTtcblx0XHRcdGRhdGFbdGhpcy52YWxpZGF0aW9uRXJyb3JzS2V5XVtzY2FubmVkU2NoZW1hc0luZGV4XSA9IFtdO1xuXHRcdH1cblx0fVxuXG5cdHZhciBlcnJvckNvdW50ID0gdGhpcy5lcnJvcnMubGVuZ3RoO1xuXHR2YXIgZXJyb3IgPSB0aGlzLnZhbGlkYXRlQmFzaWMoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZU51bWVyaWMoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZVN0cmluZyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCB0aGlzLnZhbGlkYXRlQXJyYXkoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZU9iamVjdChkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCB0aGlzLnZhbGlkYXRlQ29tYmluYXRpb25zKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVIeXBlcm1lZGlhKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVGb3JtYXQoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZURlZmluZWRLZXl3b3JkcyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCBudWxsO1xuXG5cdGlmICh0b3BMZXZlbCkge1xuXHRcdHdoaWxlICh0aGlzLnNjYW5uZWQubGVuZ3RoKSB7XG5cdFx0XHR2YXIgaXRlbSA9IHRoaXMuc2Nhbm5lZC5wb3AoKTtcblx0XHRcdGRlbGV0ZSBpdGVtW3RoaXMudmFsaWRhdGVkU2NoZW1hc0tleV07XG5cdFx0fVxuXHRcdHRoaXMuc2Nhbm5lZEZyb3plbiA9IFtdO1xuXHRcdHRoaXMuc2Nhbm5lZEZyb3plblNjaGVtYXMgPSBbXTtcblx0fVxuXG5cdGlmIChlcnJvciB8fCBlcnJvckNvdW50ICE9PSB0aGlzLmVycm9ycy5sZW5ndGgpIHtcblx0XHR3aGlsZSAoKGRhdGFQYXRoUGFydHMgJiYgZGF0YVBhdGhQYXJ0cy5sZW5ndGgpIHx8IChzY2hlbWFQYXRoUGFydHMgJiYgc2NoZW1hUGF0aFBhcnRzLmxlbmd0aCkpIHtcblx0XHRcdHZhciBkYXRhUGFydCA9IChkYXRhUGF0aFBhcnRzICYmIGRhdGFQYXRoUGFydHMubGVuZ3RoKSA/IFwiXCIgKyBkYXRhUGF0aFBhcnRzLnBvcCgpIDogbnVsbDtcblx0XHRcdHZhciBzY2hlbWFQYXJ0ID0gKHNjaGVtYVBhdGhQYXJ0cyAmJiBzY2hlbWFQYXRoUGFydHMubGVuZ3RoKSA/IFwiXCIgKyBzY2hlbWFQYXRoUGFydHMucG9wKCkgOiBudWxsO1xuXHRcdFx0aWYgKGVycm9yKSB7XG5cdFx0XHRcdGVycm9yID0gZXJyb3IucHJlZml4V2l0aChkYXRhUGFydCwgc2NoZW1hUGFydCk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLnByZWZpeEVycm9ycyhlcnJvckNvdW50LCBkYXRhUGFydCwgc2NoZW1hUGFydCk7XG5cdFx0fVxuXHR9XG5cblx0aWYgKHNjYW5uZWRGcm96ZW5TY2hlbWFJbmRleCAhPT0gbnVsbCkge1xuXHRcdHRoaXMuc2Nhbm5lZEZyb3plblZhbGlkYXRpb25FcnJvcnNbZnJvemVuSW5kZXhdW3NjYW5uZWRGcm96ZW5TY2hlbWFJbmRleF0gPSB0aGlzLmVycm9ycy5zbGljZShzdGFydEVycm9yQ291bnQpO1xuXHR9IGVsc2UgaWYgKHNjYW5uZWRTY2hlbWFzSW5kZXggIT09IG51bGwpIHtcblx0XHRkYXRhW3RoaXMudmFsaWRhdGlvbkVycm9yc0tleV1bc2Nhbm5lZFNjaGVtYXNJbmRleF0gPSB0aGlzLmVycm9ycy5zbGljZShzdGFydEVycm9yQ291bnQpO1xuXHR9XG5cblx0cmV0dXJuIHRoaXMuaGFuZGxlRXJyb3IoZXJyb3IpO1xufTtcblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlRm9ybWF0ID0gZnVuY3Rpb24gKGRhdGEsIHNjaGVtYSkge1xuXHRpZiAodHlwZW9mIHNjaGVtYS5mb3JtYXQgIT09ICdzdHJpbmcnIHx8ICF0aGlzLmZvcm1hdFZhbGlkYXRvcnNbc2NoZW1hLmZvcm1hdF0pIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHR2YXIgZXJyb3JNZXNzYWdlID0gdGhpcy5mb3JtYXRWYWxpZGF0b3JzW3NjaGVtYS5mb3JtYXRdLmNhbGwobnVsbCwgZGF0YSwgc2NoZW1hKTtcblx0aWYgKHR5cGVvZiBlcnJvck1lc3NhZ2UgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBlcnJvck1lc3NhZ2UgPT09ICdudW1iZXInKSB7XG5cdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5GT1JNQVRfQ1VTVE9NLCB7bWVzc2FnZTogZXJyb3JNZXNzYWdlfSkucHJlZml4V2l0aChudWxsLCBcImZvcm1hdFwiKTtcblx0fSBlbHNlIGlmIChlcnJvck1lc3NhZ2UgJiYgdHlwZW9mIGVycm9yTWVzc2FnZSA9PT0gJ29iamVjdCcpIHtcblx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLkZPUk1BVF9DVVNUT00sIHttZXNzYWdlOiBlcnJvck1lc3NhZ2UubWVzc2FnZSB8fCBcIj9cIn0sIGVycm9yTWVzc2FnZS5kYXRhUGF0aCB8fCBudWxsLCBlcnJvck1lc3NhZ2Uuc2NoZW1hUGF0aCB8fCBcIi9mb3JtYXRcIik7XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVEZWZpbmVkS2V5d29yZHMgPSBmdW5jdGlvbiAoZGF0YSwgc2NoZW1hKSB7XG5cdGZvciAodmFyIGtleSBpbiB0aGlzLmRlZmluZWRLZXl3b3Jkcykge1xuXHRcdGlmICh0eXBlb2Ygc2NoZW1hW2tleV0gPT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cdFx0dmFyIHZhbGlkYXRpb25GdW5jdGlvbnMgPSB0aGlzLmRlZmluZWRLZXl3b3Jkc1trZXldO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdmFsaWRhdGlvbkZ1bmN0aW9ucy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGZ1bmMgPSB2YWxpZGF0aW9uRnVuY3Rpb25zW2ldO1xuXHRcdFx0dmFyIHJlc3VsdCA9IGZ1bmMoZGF0YSwgc2NoZW1hW2tleV0sIHNjaGVtYSk7XG5cdFx0XHRpZiAodHlwZW9mIHJlc3VsdCA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHJlc3VsdCA9PT0gJ251bWJlcicpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5LRVlXT1JEX0NVU1RPTSwge2tleToga2V5LCBtZXNzYWdlOiByZXN1bHR9KS5wcmVmaXhXaXRoKG51bGwsIFwiZm9ybWF0XCIpO1xuXHRcdFx0fSBlbHNlIGlmIChyZXN1bHQgJiYgdHlwZW9mIHJlc3VsdCA9PT0gJ29iamVjdCcpIHtcblx0XHRcdFx0dmFyIGNvZGUgPSByZXN1bHQuY29kZSB8fCBFcnJvckNvZGVzLktFWVdPUkRfQ1VTVE9NO1xuXHRcdFx0XHRpZiAodHlwZW9mIGNvZGUgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRcdFx0aWYgKCFFcnJvckNvZGVzW2NvZGVdKSB7XG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ1VuZGVmaW5lZCBlcnJvciBjb2RlICh1c2UgZGVmaW5lRXJyb3IpOiAnICsgY29kZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvZGUgPSBFcnJvckNvZGVzW2NvZGVdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHZhciBtZXNzYWdlUGFyYW1zID0gKHR5cGVvZiByZXN1bHQubWVzc2FnZSA9PT0gJ29iamVjdCcpID8gcmVzdWx0Lm1lc3NhZ2UgOiB7a2V5OiBrZXksIG1lc3NhZ2U6IHJlc3VsdC5tZXNzYWdlIHx8IFwiP1wifTtcblx0XHRcdFx0dmFyIHNjaGVtYVBhdGggPSByZXN1bHQuc2NoZW1hUGF0aCB8fCggXCIvXCIgKyBrZXkucmVwbGFjZSgvfi9nLCAnfjAnKS5yZXBsYWNlKC9cXC8vZywgJ34xJykpO1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihjb2RlLCBtZXNzYWdlUGFyYW1zLCByZXN1bHQuZGF0YVBhdGggfHwgbnVsbCwgc2NoZW1hUGF0aCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuZnVuY3Rpb24gcmVjdXJzaXZlQ29tcGFyZShBLCBCKSB7XG5cdGlmIChBID09PSBCKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblx0aWYgKHR5cGVvZiBBID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBCID09PSBcIm9iamVjdFwiKSB7XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkoQSkgIT09IEFycmF5LmlzQXJyYXkoQikpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoQSkpIHtcblx0XHRcdGlmIChBLmxlbmd0aCAhPT0gQi5sZW5ndGgpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBBLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmICghcmVjdXJzaXZlQ29tcGFyZShBW2ldLCBCW2ldKSkge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIga2V5O1xuXHRcdFx0Zm9yIChrZXkgaW4gQSkge1xuXHRcdFx0XHRpZiAoQltrZXldID09PSB1bmRlZmluZWQgJiYgQVtrZXldICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGZvciAoa2V5IGluIEIpIHtcblx0XHRcdFx0aWYgKEFba2V5XSA9PT0gdW5kZWZpbmVkICYmIEJba2V5XSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRmb3IgKGtleSBpbiBBKSB7XG5cdFx0XHRcdGlmICghcmVjdXJzaXZlQ29tcGFyZShBW2tleV0sIEJba2V5XSkpIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufVxuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZUJhc2ljID0gZnVuY3Rpb24gdmFsaWRhdGVCYXNpYyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aCkge1xuXHR2YXIgZXJyb3I7XG5cdGlmIChlcnJvciA9IHRoaXMudmFsaWRhdGVUeXBlKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKSkge1xuXHRcdHJldHVybiBlcnJvci5wcmVmaXhXaXRoKG51bGwsIFwidHlwZVwiKTtcblx0fVxuXHRpZiAoZXJyb3IgPSB0aGlzLnZhbGlkYXRlRW51bShkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aCkpIHtcblx0XHRyZXR1cm4gZXJyb3IucHJlZml4V2l0aChudWxsLCBcInR5cGVcIik7XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZVR5cGUgPSBmdW5jdGlvbiB2YWxpZGF0ZVR5cGUoZGF0YSwgc2NoZW1hKSB7XG5cdGlmIChzY2hlbWEudHlwZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0dmFyIGRhdGFUeXBlID0gdHlwZW9mIGRhdGE7XG5cdGlmIChkYXRhID09PSBudWxsKSB7XG5cdFx0ZGF0YVR5cGUgPSBcIm51bGxcIjtcblx0fSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGRhdGEpKSB7XG5cdFx0ZGF0YVR5cGUgPSBcImFycmF5XCI7XG5cdH1cblx0dmFyIGFsbG93ZWRUeXBlcyA9IHNjaGVtYS50eXBlO1xuXHRpZiAodHlwZW9mIGFsbG93ZWRUeXBlcyAhPT0gXCJvYmplY3RcIikge1xuXHRcdGFsbG93ZWRUeXBlcyA9IFthbGxvd2VkVHlwZXNdO1xuXHR9XG5cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhbGxvd2VkVHlwZXMubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgdHlwZSA9IGFsbG93ZWRUeXBlc1tpXTtcblx0XHRpZiAodHlwZSA9PT0gZGF0YVR5cGUgfHwgKHR5cGUgPT09IFwiaW50ZWdlclwiICYmIGRhdGFUeXBlID09PSBcIm51bWJlclwiICYmIChkYXRhICUgMSA9PT0gMCkpKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5JTlZBTElEX1RZUEUsIHt0eXBlOiBkYXRhVHlwZSwgZXhwZWN0ZWQ6IGFsbG93ZWRUeXBlcy5qb2luKFwiL1wiKX0pO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVFbnVtID0gZnVuY3Rpb24gdmFsaWRhdGVFbnVtKGRhdGEsIHNjaGVtYSkge1xuXHRpZiAoc2NoZW1hW1wiZW51bVwiXSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzY2hlbWFbXCJlbnVtXCJdLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIGVudW1WYWwgPSBzY2hlbWFbXCJlbnVtXCJdW2ldO1xuXHRcdGlmIChyZWN1cnNpdmVDb21wYXJlKGRhdGEsIGVudW1WYWwpKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5FTlVNX01JU01BVENILCB7dmFsdWU6ICh0eXBlb2YgSlNPTiAhPT0gJ3VuZGVmaW5lZCcpID8gSlNPTi5zdHJpbmdpZnkoZGF0YSkgOiBkYXRhfSk7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZU51bWVyaWMgPSBmdW5jdGlvbiB2YWxpZGF0ZU51bWVyaWMoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpIHtcblx0cmV0dXJuIHRoaXMudmFsaWRhdGVNdWx0aXBsZU9mKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVNaW5NYXgoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZU5hTihkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVNdWx0aXBsZU9mID0gZnVuY3Rpb24gdmFsaWRhdGVNdWx0aXBsZU9mKGRhdGEsIHNjaGVtYSkge1xuXHR2YXIgbXVsdGlwbGVPZiA9IHNjaGVtYS5tdWx0aXBsZU9mIHx8IHNjaGVtYS5kaXZpc2libGVCeTtcblx0aWYgKG11bHRpcGxlT2YgPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdGlmICh0eXBlb2YgZGF0YSA9PT0gXCJudW1iZXJcIikge1xuXHRcdGlmIChkYXRhICUgbXVsdGlwbGVPZiAhPT0gMCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5OVU1CRVJfTVVMVElQTEVfT0YsIHt2YWx1ZTogZGF0YSwgbXVsdGlwbGVPZjogbXVsdGlwbGVPZn0pO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlTWluTWF4ID0gZnVuY3Rpb24gdmFsaWRhdGVNaW5NYXgoZGF0YSwgc2NoZW1hKSB7XG5cdGlmICh0eXBlb2YgZGF0YSAhPT0gXCJudW1iZXJcIikge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdGlmIChzY2hlbWEubWluaW11bSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0aWYgKGRhdGEgPCBzY2hlbWEubWluaW11bSkge1xuXHRcdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5OVU1CRVJfTUlOSU1VTSwge3ZhbHVlOiBkYXRhLCBtaW5pbXVtOiBzY2hlbWEubWluaW11bX0pLnByZWZpeFdpdGgobnVsbCwgXCJtaW5pbXVtXCIpO1xuXHRcdH1cblx0XHRpZiAoc2NoZW1hLmV4Y2x1c2l2ZU1pbmltdW0gJiYgZGF0YSA9PT0gc2NoZW1hLm1pbmltdW0pIHtcblx0XHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuTlVNQkVSX01JTklNVU1fRVhDTFVTSVZFLCB7dmFsdWU6IGRhdGEsIG1pbmltdW06IHNjaGVtYS5taW5pbXVtfSkucHJlZml4V2l0aChudWxsLCBcImV4Y2x1c2l2ZU1pbmltdW1cIik7XG5cdFx0fVxuXHR9XG5cdGlmIChzY2hlbWEubWF4aW11bSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0aWYgKGRhdGEgPiBzY2hlbWEubWF4aW11bSkge1xuXHRcdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5OVU1CRVJfTUFYSU1VTSwge3ZhbHVlOiBkYXRhLCBtYXhpbXVtOiBzY2hlbWEubWF4aW11bX0pLnByZWZpeFdpdGgobnVsbCwgXCJtYXhpbXVtXCIpO1xuXHRcdH1cblx0XHRpZiAoc2NoZW1hLmV4Y2x1c2l2ZU1heGltdW0gJiYgZGF0YSA9PT0gc2NoZW1hLm1heGltdW0pIHtcblx0XHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuTlVNQkVSX01BWElNVU1fRVhDTFVTSVZFLCB7dmFsdWU6IGRhdGEsIG1heGltdW06IHNjaGVtYS5tYXhpbXVtfSkucHJlZml4V2l0aChudWxsLCBcImV4Y2x1c2l2ZU1heGltdW1cIik7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVOYU4gPSBmdW5jdGlvbiB2YWxpZGF0ZU5hTihkYXRhKSB7XG5cdGlmICh0eXBlb2YgZGF0YSAhPT0gXCJudW1iZXJcIikge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdGlmIChpc05hTihkYXRhKSA9PT0gdHJ1ZSB8fCBkYXRhID09PSBJbmZpbml0eSB8fCBkYXRhID09PSAtSW5maW5pdHkpIHtcblx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLk5VTUJFUl9OT1RfQV9OVU1CRVIsIHt2YWx1ZTogZGF0YX0pLnByZWZpeFdpdGgobnVsbCwgXCJ0eXBlXCIpO1xuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVTdHJpbmcgPSBmdW5jdGlvbiB2YWxpZGF0ZVN0cmluZyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aCkge1xuXHRyZXR1cm4gdGhpcy52YWxpZGF0ZVN0cmluZ0xlbmd0aChkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCB0aGlzLnZhbGlkYXRlU3RyaW5nUGF0dGVybihkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVTdHJpbmdMZW5ndGggPSBmdW5jdGlvbiB2YWxpZGF0ZVN0cmluZ0xlbmd0aChkYXRhLCBzY2hlbWEpIHtcblx0aWYgKHR5cGVvZiBkYXRhICE9PSBcInN0cmluZ1wiKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0aWYgKHNjaGVtYS5taW5MZW5ndGggIT09IHVuZGVmaW5lZCkge1xuXHRcdGlmIChkYXRhLmxlbmd0aCA8IHNjaGVtYS5taW5MZW5ndGgpIHtcblx0XHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuU1RSSU5HX0xFTkdUSF9TSE9SVCwge2xlbmd0aDogZGF0YS5sZW5ndGgsIG1pbmltdW06IHNjaGVtYS5taW5MZW5ndGh9KS5wcmVmaXhXaXRoKG51bGwsIFwibWluTGVuZ3RoXCIpO1xuXHRcdH1cblx0fVxuXHRpZiAoc2NoZW1hLm1heExlbmd0aCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0aWYgKGRhdGEubGVuZ3RoID4gc2NoZW1hLm1heExlbmd0aCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5TVFJJTkdfTEVOR1RIX0xPTkcsIHtsZW5ndGg6IGRhdGEubGVuZ3RoLCBtYXhpbXVtOiBzY2hlbWEubWF4TGVuZ3RofSkucHJlZml4V2l0aChudWxsLCBcIm1heExlbmd0aFwiKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZVN0cmluZ1BhdHRlcm4gPSBmdW5jdGlvbiB2YWxpZGF0ZVN0cmluZ1BhdHRlcm4oZGF0YSwgc2NoZW1hKSB7XG5cdGlmICh0eXBlb2YgZGF0YSAhPT0gXCJzdHJpbmdcIiB8fCBzY2hlbWEucGF0dGVybiA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0dmFyIHJlZ2V4cCA9IG5ldyBSZWdFeHAoc2NoZW1hLnBhdHRlcm4pO1xuXHRpZiAoIXJlZ2V4cC50ZXN0KGRhdGEpKSB7XG5cdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5TVFJJTkdfUEFUVEVSTiwge3BhdHRlcm46IHNjaGVtYS5wYXR0ZXJufSkucHJlZml4V2l0aChudWxsLCBcInBhdHRlcm5cIik7XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVBcnJheSA9IGZ1bmN0aW9uIHZhbGlkYXRlQXJyYXkoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpIHtcblx0aWYgKCFBcnJheS5pc0FycmF5KGRhdGEpKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0cmV0dXJuIHRoaXMudmFsaWRhdGVBcnJheUxlbmd0aChkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCB0aGlzLnZhbGlkYXRlQXJyYXlVbmlxdWVJdGVtcyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCB0aGlzLnZhbGlkYXRlQXJyYXlJdGVtcyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVBcnJheUxlbmd0aCA9IGZ1bmN0aW9uIHZhbGlkYXRlQXJyYXlMZW5ndGgoZGF0YSwgc2NoZW1hKSB7XG5cdHZhciBlcnJvcjtcblx0aWYgKHNjaGVtYS5taW5JdGVtcyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0aWYgKGRhdGEubGVuZ3RoIDwgc2NoZW1hLm1pbkl0ZW1zKSB7XG5cdFx0XHRlcnJvciA9ICh0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuQVJSQVlfTEVOR1RIX1NIT1JULCB7bGVuZ3RoOiBkYXRhLmxlbmd0aCwgbWluaW11bTogc2NoZW1hLm1pbkl0ZW1zfSkpLnByZWZpeFdpdGgobnVsbCwgXCJtaW5JdGVtc1wiKTtcblx0XHRcdGlmICh0aGlzLmhhbmRsZUVycm9yKGVycm9yKSkge1xuXHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdGlmIChzY2hlbWEubWF4SXRlbXMgIT09IHVuZGVmaW5lZCkge1xuXHRcdGlmIChkYXRhLmxlbmd0aCA+IHNjaGVtYS5tYXhJdGVtcykge1xuXHRcdFx0ZXJyb3IgPSAodGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLkFSUkFZX0xFTkdUSF9MT05HLCB7bGVuZ3RoOiBkYXRhLmxlbmd0aCwgbWF4aW11bTogc2NoZW1hLm1heEl0ZW1zfSkpLnByZWZpeFdpdGgobnVsbCwgXCJtYXhJdGVtc1wiKTtcblx0XHRcdGlmICh0aGlzLmhhbmRsZUVycm9yKGVycm9yKSkge1xuXHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVBcnJheVVuaXF1ZUl0ZW1zID0gZnVuY3Rpb24gdmFsaWRhdGVBcnJheVVuaXF1ZUl0ZW1zKGRhdGEsIHNjaGVtYSkge1xuXHRpZiAoc2NoZW1hLnVuaXF1ZUl0ZW1zKSB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRmb3IgKHZhciBqID0gaSArIDE7IGogPCBkYXRhLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdGlmIChyZWN1cnNpdmVDb21wYXJlKGRhdGFbaV0sIGRhdGFbal0pKSB7XG5cdFx0XHRcdFx0dmFyIGVycm9yID0gKHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5BUlJBWV9VTklRVUUsIHttYXRjaDE6IGksIG1hdGNoMjogan0pKS5wcmVmaXhXaXRoKG51bGwsIFwidW5pcXVlSXRlbXNcIik7XG5cdFx0XHRcdFx0aWYgKHRoaXMuaGFuZGxlRXJyb3IoZXJyb3IpKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVBcnJheUl0ZW1zID0gZnVuY3Rpb24gdmFsaWRhdGVBcnJheUl0ZW1zKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKSB7XG5cdGlmIChzY2hlbWEuaXRlbXMgPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdHZhciBlcnJvciwgaTtcblx0aWYgKEFycmF5LmlzQXJyYXkoc2NoZW1hLml0ZW1zKSkge1xuXHRcdGZvciAoaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpZiAoaSA8IHNjaGVtYS5pdGVtcy5sZW5ndGgpIHtcblx0XHRcdFx0aWYgKGVycm9yID0gdGhpcy52YWxpZGF0ZUFsbChkYXRhW2ldLCBzY2hlbWEuaXRlbXNbaV0sIFtpXSwgW1wiaXRlbXNcIiwgaV0sIGRhdGFQb2ludGVyUGF0aCArIFwiL1wiICsgaSkpIHtcblx0XHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAoc2NoZW1hLmFkZGl0aW9uYWxJdGVtcyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdGlmICh0eXBlb2Ygc2NoZW1hLmFkZGl0aW9uYWxJdGVtcyA9PT0gXCJib29sZWFuXCIpIHtcblx0XHRcdFx0XHRpZiAoIXNjaGVtYS5hZGRpdGlvbmFsSXRlbXMpIHtcblx0XHRcdFx0XHRcdGVycm9yID0gKHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5BUlJBWV9BRERJVElPTkFMX0lURU1TLCB7fSkpLnByZWZpeFdpdGgoXCJcIiArIGksIFwiYWRkaXRpb25hbEl0ZW1zXCIpO1xuXHRcdFx0XHRcdFx0aWYgKHRoaXMuaGFuZGxlRXJyb3IoZXJyb3IpKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSBpZiAoZXJyb3IgPSB0aGlzLnZhbGlkYXRlQWxsKGRhdGFbaV0sIHNjaGVtYS5hZGRpdGlvbmFsSXRlbXMsIFtpXSwgW1wiYWRkaXRpb25hbEl0ZW1zXCJdLCBkYXRhUG9pbnRlclBhdGggKyBcIi9cIiArIGkpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdGZvciAoaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpZiAoZXJyb3IgPSB0aGlzLnZhbGlkYXRlQWxsKGRhdGFbaV0sIHNjaGVtYS5pdGVtcywgW2ldLCBbXCJpdGVtc1wiXSwgZGF0YVBvaW50ZXJQYXRoICsgXCIvXCIgKyBpKSkge1xuXHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVPYmplY3QgPSBmdW5jdGlvbiB2YWxpZGF0ZU9iamVjdChkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aCkge1xuXHRpZiAodHlwZW9mIGRhdGEgIT09IFwib2JqZWN0XCIgfHwgZGF0YSA9PT0gbnVsbCB8fCBBcnJheS5pc0FycmF5KGRhdGEpKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0cmV0dXJuIHRoaXMudmFsaWRhdGVPYmplY3RNaW5NYXhQcm9wZXJ0aWVzKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVPYmplY3RSZXF1aXJlZFByb3BlcnRpZXMoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZU9iamVjdFByb3BlcnRpZXMoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZU9iamVjdERlcGVuZGVuY2llcyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVPYmplY3RNaW5NYXhQcm9wZXJ0aWVzID0gZnVuY3Rpb24gdmFsaWRhdGVPYmplY3RNaW5NYXhQcm9wZXJ0aWVzKGRhdGEsIHNjaGVtYSkge1xuXHR2YXIga2V5cyA9IE9iamVjdC5rZXlzKGRhdGEpO1xuXHR2YXIgZXJyb3I7XG5cdGlmIChzY2hlbWEubWluUHJvcGVydGllcyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0aWYgKGtleXMubGVuZ3RoIDwgc2NoZW1hLm1pblByb3BlcnRpZXMpIHtcblx0XHRcdGVycm9yID0gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLk9CSkVDVF9QUk9QRVJUSUVTX01JTklNVU0sIHtwcm9wZXJ0eUNvdW50OiBrZXlzLmxlbmd0aCwgbWluaW11bTogc2NoZW1hLm1pblByb3BlcnRpZXN9KS5wcmVmaXhXaXRoKG51bGwsIFwibWluUHJvcGVydGllc1wiKTtcblx0XHRcdGlmICh0aGlzLmhhbmRsZUVycm9yKGVycm9yKSkge1xuXHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdGlmIChzY2hlbWEubWF4UHJvcGVydGllcyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0aWYgKGtleXMubGVuZ3RoID4gc2NoZW1hLm1heFByb3BlcnRpZXMpIHtcblx0XHRcdGVycm9yID0gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLk9CSkVDVF9QUk9QRVJUSUVTX01BWElNVU0sIHtwcm9wZXJ0eUNvdW50OiBrZXlzLmxlbmd0aCwgbWF4aW11bTogc2NoZW1hLm1heFByb3BlcnRpZXN9KS5wcmVmaXhXaXRoKG51bGwsIFwibWF4UHJvcGVydGllc1wiKTtcblx0XHRcdGlmICh0aGlzLmhhbmRsZUVycm9yKGVycm9yKSkge1xuXHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVPYmplY3RSZXF1aXJlZFByb3BlcnRpZXMgPSBmdW5jdGlvbiB2YWxpZGF0ZU9iamVjdFJlcXVpcmVkUHJvcGVydGllcyhkYXRhLCBzY2hlbWEpIHtcblx0aWYgKHNjaGVtYS5yZXF1aXJlZCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzY2hlbWEucmVxdWlyZWQubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBrZXkgPSBzY2hlbWEucmVxdWlyZWRbaV07XG5cdFx0XHRpZiAoZGF0YVtrZXldID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0dmFyIGVycm9yID0gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLk9CSkVDVF9SRVFVSVJFRCwge2tleToga2V5fSkucHJlZml4V2l0aChudWxsLCBcIlwiICsgaSkucHJlZml4V2l0aChudWxsLCBcInJlcXVpcmVkXCIpO1xuXHRcdFx0XHRpZiAodGhpcy5oYW5kbGVFcnJvcihlcnJvcikpIHtcblx0XHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZU9iamVjdFByb3BlcnRpZXMgPSBmdW5jdGlvbiB2YWxpZGF0ZU9iamVjdFByb3BlcnRpZXMoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpIHtcblx0dmFyIGVycm9yO1xuXHRmb3IgKHZhciBrZXkgaW4gZGF0YSkge1xuXHRcdHZhciBrZXlQb2ludGVyUGF0aCA9IGRhdGFQb2ludGVyUGF0aCArIFwiL1wiICsga2V5LnJlcGxhY2UoL34vZywgJ34wJykucmVwbGFjZSgvXFwvL2csICd+MScpO1xuXHRcdHZhciBmb3VuZE1hdGNoID0gZmFsc2U7XG5cdFx0aWYgKHNjaGVtYS5wcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgJiYgc2NoZW1hLnByb3BlcnRpZXNba2V5XSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRmb3VuZE1hdGNoID0gdHJ1ZTtcblx0XHRcdGlmIChlcnJvciA9IHRoaXMudmFsaWRhdGVBbGwoZGF0YVtrZXldLCBzY2hlbWEucHJvcGVydGllc1trZXldLCBba2V5XSwgW1wicHJvcGVydGllc1wiLCBrZXldLCBrZXlQb2ludGVyUGF0aCkpIHtcblx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoc2NoZW1hLnBhdHRlcm5Qcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdGZvciAodmFyIHBhdHRlcm5LZXkgaW4gc2NoZW1hLnBhdHRlcm5Qcm9wZXJ0aWVzKSB7XG5cdFx0XHRcdHZhciByZWdleHAgPSBuZXcgUmVnRXhwKHBhdHRlcm5LZXkpO1xuXHRcdFx0XHRpZiAocmVnZXhwLnRlc3Qoa2V5KSkge1xuXHRcdFx0XHRcdGZvdW5kTWF0Y2ggPSB0cnVlO1xuXHRcdFx0XHRcdGlmIChlcnJvciA9IHRoaXMudmFsaWRhdGVBbGwoZGF0YVtrZXldLCBzY2hlbWEucGF0dGVyblByb3BlcnRpZXNbcGF0dGVybktleV0sIFtrZXldLCBbXCJwYXR0ZXJuUHJvcGVydGllc1wiLCBwYXR0ZXJuS2V5XSwga2V5UG9pbnRlclBhdGgpKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmICghZm91bmRNYXRjaCkge1xuXHRcdFx0aWYgKHNjaGVtYS5hZGRpdGlvbmFsUHJvcGVydGllcyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdGlmICh0aGlzLnRyYWNrVW5rbm93blByb3BlcnRpZXMpIHtcblx0XHRcdFx0XHR0aGlzLmtub3duUHJvcGVydHlQYXRoc1trZXlQb2ludGVyUGF0aF0gPSB0cnVlO1xuXHRcdFx0XHRcdGRlbGV0ZSB0aGlzLnVua25vd25Qcm9wZXJ0eVBhdGhzW2tleVBvaW50ZXJQYXRoXTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAodHlwZW9mIHNjaGVtYS5hZGRpdGlvbmFsUHJvcGVydGllcyA9PT0gXCJib29sZWFuXCIpIHtcblx0XHRcdFx0XHRpZiAoIXNjaGVtYS5hZGRpdGlvbmFsUHJvcGVydGllcykge1xuXHRcdFx0XHRcdFx0ZXJyb3IgPSB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuT0JKRUNUX0FERElUSU9OQUxfUFJPUEVSVElFUywge30pLnByZWZpeFdpdGgoa2V5LCBcImFkZGl0aW9uYWxQcm9wZXJ0aWVzXCIpO1xuXHRcdFx0XHRcdFx0aWYgKHRoaXMuaGFuZGxlRXJyb3IoZXJyb3IpKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0aWYgKGVycm9yID0gdGhpcy52YWxpZGF0ZUFsbChkYXRhW2tleV0sIHNjaGVtYS5hZGRpdGlvbmFsUHJvcGVydGllcywgW2tleV0sIFtcImFkZGl0aW9uYWxQcm9wZXJ0aWVzXCJdLCBrZXlQb2ludGVyUGF0aCkpIHtcblx0XHRcdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAodGhpcy50cmFja1Vua25vd25Qcm9wZXJ0aWVzICYmICF0aGlzLmtub3duUHJvcGVydHlQYXRoc1trZXlQb2ludGVyUGF0aF0pIHtcblx0XHRcdFx0dGhpcy51bmtub3duUHJvcGVydHlQYXRoc1trZXlQb2ludGVyUGF0aF0gPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAodGhpcy50cmFja1Vua25vd25Qcm9wZXJ0aWVzKSB7XG5cdFx0XHR0aGlzLmtub3duUHJvcGVydHlQYXRoc1trZXlQb2ludGVyUGF0aF0gPSB0cnVlO1xuXHRcdFx0ZGVsZXRlIHRoaXMudW5rbm93blByb3BlcnR5UGF0aHNba2V5UG9pbnRlclBhdGhdO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlT2JqZWN0RGVwZW5kZW5jaWVzID0gZnVuY3Rpb24gdmFsaWRhdGVPYmplY3REZXBlbmRlbmNpZXMoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpIHtcblx0dmFyIGVycm9yO1xuXHRpZiAoc2NoZW1hLmRlcGVuZGVuY2llcyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0Zm9yICh2YXIgZGVwS2V5IGluIHNjaGVtYS5kZXBlbmRlbmNpZXMpIHtcblx0XHRcdGlmIChkYXRhW2RlcEtleV0gIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHR2YXIgZGVwID0gc2NoZW1hLmRlcGVuZGVuY2llc1tkZXBLZXldO1xuXHRcdFx0XHRpZiAodHlwZW9mIGRlcCA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRcdGlmIChkYXRhW2RlcF0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0ZXJyb3IgPSB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuT0JKRUNUX0RFUEVOREVOQ1lfS0VZLCB7a2V5OiBkZXBLZXksIG1pc3Npbmc6IGRlcH0pLnByZWZpeFdpdGgobnVsbCwgZGVwS2V5KS5wcmVmaXhXaXRoKG51bGwsIFwiZGVwZW5kZW5jaWVzXCIpO1xuXHRcdFx0XHRcdFx0aWYgKHRoaXMuaGFuZGxlRXJyb3IoZXJyb3IpKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShkZXApKSB7XG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkZXAubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdHZhciByZXF1aXJlZEtleSA9IGRlcFtpXTtcblx0XHRcdFx0XHRcdGlmIChkYXRhW3JlcXVpcmVkS2V5XSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHRcdGVycm9yID0gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLk9CSkVDVF9ERVBFTkRFTkNZX0tFWSwge2tleTogZGVwS2V5LCBtaXNzaW5nOiByZXF1aXJlZEtleX0pLnByZWZpeFdpdGgobnVsbCwgXCJcIiArIGkpLnByZWZpeFdpdGgobnVsbCwgZGVwS2V5KS5wcmVmaXhXaXRoKG51bGwsIFwiZGVwZW5kZW5jaWVzXCIpO1xuXHRcdFx0XHRcdFx0XHRpZiAodGhpcy5oYW5kbGVFcnJvcihlcnJvcikpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0aWYgKGVycm9yID0gdGhpcy52YWxpZGF0ZUFsbChkYXRhLCBkZXAsIFtdLCBbXCJkZXBlbmRlbmNpZXNcIiwgZGVwS2V5XSwgZGF0YVBvaW50ZXJQYXRoKSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlQ29tYmluYXRpb25zID0gZnVuY3Rpb24gdmFsaWRhdGVDb21iaW5hdGlvbnMoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpIHtcblx0cmV0dXJuIHRoaXMudmFsaWRhdGVBbGxPZihkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCB0aGlzLnZhbGlkYXRlQW55T2YoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZU9uZU9mKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVOb3QoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlQWxsT2YgPSBmdW5jdGlvbiB2YWxpZGF0ZUFsbE9mKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKSB7XG5cdGlmIChzY2hlbWEuYWxsT2YgPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdHZhciBlcnJvcjtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzY2hlbWEuYWxsT2YubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgc3ViU2NoZW1hID0gc2NoZW1hLmFsbE9mW2ldO1xuXHRcdGlmIChlcnJvciA9IHRoaXMudmFsaWRhdGVBbGwoZGF0YSwgc3ViU2NoZW1hLCBbXSwgW1wiYWxsT2ZcIiwgaV0sIGRhdGFQb2ludGVyUGF0aCkpIHtcblx0XHRcdHJldHVybiBlcnJvcjtcblx0XHR9XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZUFueU9mID0gZnVuY3Rpb24gdmFsaWRhdGVBbnlPZihkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aCkge1xuXHRpZiAoc2NoZW1hLmFueU9mID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHR2YXIgZXJyb3JzID0gW107XG5cdHZhciBzdGFydEVycm9yQ291bnQgPSB0aGlzLmVycm9ycy5sZW5ndGg7XG5cdHZhciBvbGRVbmtub3duUHJvcGVydHlQYXRocywgb2xkS25vd25Qcm9wZXJ0eVBhdGhzO1xuXHRpZiAodGhpcy50cmFja1Vua25vd25Qcm9wZXJ0aWVzKSB7XG5cdFx0b2xkVW5rbm93blByb3BlcnR5UGF0aHMgPSB0aGlzLnVua25vd25Qcm9wZXJ0eVBhdGhzO1xuXHRcdG9sZEtub3duUHJvcGVydHlQYXRocyA9IHRoaXMua25vd25Qcm9wZXJ0eVBhdGhzO1xuXHR9XG5cdHZhciBlcnJvckF0RW5kID0gdHJ1ZTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzY2hlbWEuYW55T2YubGVuZ3RoOyBpKyspIHtcblx0XHRpZiAodGhpcy50cmFja1Vua25vd25Qcm9wZXJ0aWVzKSB7XG5cdFx0XHR0aGlzLnVua25vd25Qcm9wZXJ0eVBhdGhzID0ge307XG5cdFx0XHR0aGlzLmtub3duUHJvcGVydHlQYXRocyA9IHt9O1xuXHRcdH1cblx0XHR2YXIgc3ViU2NoZW1hID0gc2NoZW1hLmFueU9mW2ldO1xuXG5cdFx0dmFyIGVycm9yQ291bnQgPSB0aGlzLmVycm9ycy5sZW5ndGg7XG5cdFx0dmFyIGVycm9yID0gdGhpcy52YWxpZGF0ZUFsbChkYXRhLCBzdWJTY2hlbWEsIFtdLCBbXCJhbnlPZlwiLCBpXSwgZGF0YVBvaW50ZXJQYXRoKTtcblxuXHRcdGlmIChlcnJvciA9PT0gbnVsbCAmJiBlcnJvckNvdW50ID09PSB0aGlzLmVycm9ycy5sZW5ndGgpIHtcblx0XHRcdHRoaXMuZXJyb3JzID0gdGhpcy5lcnJvcnMuc2xpY2UoMCwgc3RhcnRFcnJvckNvdW50KTtcblxuXHRcdFx0aWYgKHRoaXMudHJhY2tVbmtub3duUHJvcGVydGllcykge1xuXHRcdFx0XHRmb3IgKHZhciBrbm93bktleSBpbiB0aGlzLmtub3duUHJvcGVydHlQYXRocykge1xuXHRcdFx0XHRcdG9sZEtub3duUHJvcGVydHlQYXRoc1trbm93bktleV0gPSB0cnVlO1xuXHRcdFx0XHRcdGRlbGV0ZSBvbGRVbmtub3duUHJvcGVydHlQYXRoc1trbm93bktleV07XG5cdFx0XHRcdH1cblx0XHRcdFx0Zm9yICh2YXIgdW5rbm93bktleSBpbiB0aGlzLnVua25vd25Qcm9wZXJ0eVBhdGhzKSB7XG5cdFx0XHRcdFx0aWYgKCFvbGRLbm93blByb3BlcnR5UGF0aHNbdW5rbm93bktleV0pIHtcblx0XHRcdFx0XHRcdG9sZFVua25vd25Qcm9wZXJ0eVBhdGhzW3Vua25vd25LZXldID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gV2UgbmVlZCB0byBjb250aW51ZSBsb29waW5nIHNvIHdlIGNhdGNoIGFsbCB0aGUgcHJvcGVydHkgZGVmaW5pdGlvbnMsIGJ1dCB3ZSBkb24ndCB3YW50IHRvIHJldHVybiBhbiBlcnJvclxuXHRcdFx0XHRlcnJvckF0RW5kID0gZmFsc2U7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdFx0aWYgKGVycm9yKSB7XG5cdFx0XHRlcnJvcnMucHVzaChlcnJvci5wcmVmaXhXaXRoKG51bGwsIFwiXCIgKyBpKS5wcmVmaXhXaXRoKG51bGwsIFwiYW55T2ZcIikpO1xuXHRcdH1cblx0fVxuXHRpZiAodGhpcy50cmFja1Vua25vd25Qcm9wZXJ0aWVzKSB7XG5cdFx0dGhpcy51bmtub3duUHJvcGVydHlQYXRocyA9IG9sZFVua25vd25Qcm9wZXJ0eVBhdGhzO1xuXHRcdHRoaXMua25vd25Qcm9wZXJ0eVBhdGhzID0gb2xkS25vd25Qcm9wZXJ0eVBhdGhzO1xuXHR9XG5cdGlmIChlcnJvckF0RW5kKSB7XG5cdFx0ZXJyb3JzID0gZXJyb3JzLmNvbmNhdCh0aGlzLmVycm9ycy5zbGljZShzdGFydEVycm9yQ291bnQpKTtcblx0XHR0aGlzLmVycm9ycyA9IHRoaXMuZXJyb3JzLnNsaWNlKDAsIHN0YXJ0RXJyb3JDb3VudCk7XG5cdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5BTllfT0ZfTUlTU0lORywge30sIFwiXCIsIFwiL2FueU9mXCIsIGVycm9ycyk7XG5cdH1cbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlT25lT2YgPSBmdW5jdGlvbiB2YWxpZGF0ZU9uZU9mKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKSB7XG5cdGlmIChzY2hlbWEub25lT2YgPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdHZhciB2YWxpZEluZGV4ID0gbnVsbDtcblx0dmFyIGVycm9ycyA9IFtdO1xuXHR2YXIgc3RhcnRFcnJvckNvdW50ID0gdGhpcy5lcnJvcnMubGVuZ3RoO1xuXHR2YXIgb2xkVW5rbm93blByb3BlcnR5UGF0aHMsIG9sZEtub3duUHJvcGVydHlQYXRocztcblx0aWYgKHRoaXMudHJhY2tVbmtub3duUHJvcGVydGllcykge1xuXHRcdG9sZFVua25vd25Qcm9wZXJ0eVBhdGhzID0gdGhpcy51bmtub3duUHJvcGVydHlQYXRocztcblx0XHRvbGRLbm93blByb3BlcnR5UGF0aHMgPSB0aGlzLmtub3duUHJvcGVydHlQYXRocztcblx0fVxuXHRmb3IgKHZhciBpID0gMDsgaSA8IHNjaGVtYS5vbmVPZi5sZW5ndGg7IGkrKykge1xuXHRcdGlmICh0aGlzLnRyYWNrVW5rbm93blByb3BlcnRpZXMpIHtcblx0XHRcdHRoaXMudW5rbm93blByb3BlcnR5UGF0aHMgPSB7fTtcblx0XHRcdHRoaXMua25vd25Qcm9wZXJ0eVBhdGhzID0ge307XG5cdFx0fVxuXHRcdHZhciBzdWJTY2hlbWEgPSBzY2hlbWEub25lT2ZbaV07XG5cblx0XHR2YXIgZXJyb3JDb3VudCA9IHRoaXMuZXJyb3JzLmxlbmd0aDtcblx0XHR2YXIgZXJyb3IgPSB0aGlzLnZhbGlkYXRlQWxsKGRhdGEsIHN1YlNjaGVtYSwgW10sIFtcIm9uZU9mXCIsIGldLCBkYXRhUG9pbnRlclBhdGgpO1xuXG5cdFx0aWYgKGVycm9yID09PSBudWxsICYmIGVycm9yQ291bnQgPT09IHRoaXMuZXJyb3JzLmxlbmd0aCkge1xuXHRcdFx0aWYgKHZhbGlkSW5kZXggPT09IG51bGwpIHtcblx0XHRcdFx0dmFsaWRJbmRleCA9IGk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLmVycm9ycyA9IHRoaXMuZXJyb3JzLnNsaWNlKDAsIHN0YXJ0RXJyb3JDb3VudCk7XG5cdFx0XHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuT05FX09GX01VTFRJUExFLCB7aW5kZXgxOiB2YWxpZEluZGV4LCBpbmRleDI6IGl9LCBcIlwiLCBcIi9vbmVPZlwiKTtcblx0XHRcdH1cblx0XHRcdGlmICh0aGlzLnRyYWNrVW5rbm93blByb3BlcnRpZXMpIHtcblx0XHRcdFx0Zm9yICh2YXIga25vd25LZXkgaW4gdGhpcy5rbm93blByb3BlcnR5UGF0aHMpIHtcblx0XHRcdFx0XHRvbGRLbm93blByb3BlcnR5UGF0aHNba25vd25LZXldID0gdHJ1ZTtcblx0XHRcdFx0XHRkZWxldGUgb2xkVW5rbm93blByb3BlcnR5UGF0aHNba25vd25LZXldO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGZvciAodmFyIHVua25vd25LZXkgaW4gdGhpcy51bmtub3duUHJvcGVydHlQYXRocykge1xuXHRcdFx0XHRcdGlmICghb2xkS25vd25Qcm9wZXJ0eVBhdGhzW3Vua25vd25LZXldKSB7XG5cdFx0XHRcdFx0XHRvbGRVbmtub3duUHJvcGVydHlQYXRoc1t1bmtub3duS2V5XSA9IHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChlcnJvcikge1xuXHRcdFx0ZXJyb3JzLnB1c2goZXJyb3IpO1xuXHRcdH1cblx0fVxuXHRpZiAodGhpcy50cmFja1Vua25vd25Qcm9wZXJ0aWVzKSB7XG5cdFx0dGhpcy51bmtub3duUHJvcGVydHlQYXRocyA9IG9sZFVua25vd25Qcm9wZXJ0eVBhdGhzO1xuXHRcdHRoaXMua25vd25Qcm9wZXJ0eVBhdGhzID0gb2xkS25vd25Qcm9wZXJ0eVBhdGhzO1xuXHR9XG5cdGlmICh2YWxpZEluZGV4ID09PSBudWxsKSB7XG5cdFx0ZXJyb3JzID0gZXJyb3JzLmNvbmNhdCh0aGlzLmVycm9ycy5zbGljZShzdGFydEVycm9yQ291bnQpKTtcblx0XHR0aGlzLmVycm9ycyA9IHRoaXMuZXJyb3JzLnNsaWNlKDAsIHN0YXJ0RXJyb3JDb3VudCk7XG5cdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5PTkVfT0ZfTUlTU0lORywge30sIFwiXCIsIFwiL29uZU9mXCIsIGVycm9ycyk7XG5cdH0gZWxzZSB7XG5cdFx0dGhpcy5lcnJvcnMgPSB0aGlzLmVycm9ycy5zbGljZSgwLCBzdGFydEVycm9yQ291bnQpO1xuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVOb3QgPSBmdW5jdGlvbiB2YWxpZGF0ZU5vdChkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aCkge1xuXHRpZiAoc2NoZW1hLm5vdCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0dmFyIG9sZEVycm9yQ291bnQgPSB0aGlzLmVycm9ycy5sZW5ndGg7XG5cdHZhciBvbGRVbmtub3duUHJvcGVydHlQYXRocywgb2xkS25vd25Qcm9wZXJ0eVBhdGhzO1xuXHRpZiAodGhpcy50cmFja1Vua25vd25Qcm9wZXJ0aWVzKSB7XG5cdFx0b2xkVW5rbm93blByb3BlcnR5UGF0aHMgPSB0aGlzLnVua25vd25Qcm9wZXJ0eVBhdGhzO1xuXHRcdG9sZEtub3duUHJvcGVydHlQYXRocyA9IHRoaXMua25vd25Qcm9wZXJ0eVBhdGhzO1xuXHRcdHRoaXMudW5rbm93blByb3BlcnR5UGF0aHMgPSB7fTtcblx0XHR0aGlzLmtub3duUHJvcGVydHlQYXRocyA9IHt9O1xuXHR9XG5cdHZhciBlcnJvciA9IHRoaXMudmFsaWRhdGVBbGwoZGF0YSwgc2NoZW1hLm5vdCwgbnVsbCwgbnVsbCwgZGF0YVBvaW50ZXJQYXRoKTtcblx0dmFyIG5vdEVycm9ycyA9IHRoaXMuZXJyb3JzLnNsaWNlKG9sZEVycm9yQ291bnQpO1xuXHR0aGlzLmVycm9ycyA9IHRoaXMuZXJyb3JzLnNsaWNlKDAsIG9sZEVycm9yQ291bnQpO1xuXHRpZiAodGhpcy50cmFja1Vua25vd25Qcm9wZXJ0aWVzKSB7XG5cdFx0dGhpcy51bmtub3duUHJvcGVydHlQYXRocyA9IG9sZFVua25vd25Qcm9wZXJ0eVBhdGhzO1xuXHRcdHRoaXMua25vd25Qcm9wZXJ0eVBhdGhzID0gb2xkS25vd25Qcm9wZXJ0eVBhdGhzO1xuXHR9XG5cdGlmIChlcnJvciA9PT0gbnVsbCAmJiBub3RFcnJvcnMubGVuZ3RoID09PSAwKSB7XG5cdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5OT1RfUEFTU0VELCB7fSwgXCJcIiwgXCIvbm90XCIpO1xuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVIeXBlcm1lZGlhID0gZnVuY3Rpb24gdmFsaWRhdGVDb21iaW5hdGlvbnMoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpIHtcblx0aWYgKCFzY2hlbWEubGlua3MpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHR2YXIgZXJyb3I7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgc2NoZW1hLmxpbmtzLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIGxkbyA9IHNjaGVtYS5saW5rc1tpXTtcblx0XHRpZiAobGRvLnJlbCA9PT0gXCJkZXNjcmliZWRieVwiKSB7XG5cdFx0XHR2YXIgdGVtcGxhdGUgPSBuZXcgVXJpVGVtcGxhdGUobGRvLmhyZWYpO1xuXHRcdFx0dmFyIGFsbFByZXNlbnQgPSB0cnVlO1xuXHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCB0ZW1wbGF0ZS52YXJOYW1lcy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRpZiAoISh0ZW1wbGF0ZS52YXJOYW1lc1tqXSBpbiBkYXRhKSkge1xuXHRcdFx0XHRcdGFsbFByZXNlbnQgPSBmYWxzZTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKGFsbFByZXNlbnQpIHtcblx0XHRcdFx0dmFyIHNjaGVtYVVybCA9IHRlbXBsYXRlLmZpbGxGcm9tT2JqZWN0KGRhdGEpO1xuXHRcdFx0XHR2YXIgc3ViU2NoZW1hID0ge1wiJHJlZlwiOiBzY2hlbWFVcmx9O1xuXHRcdFx0XHRpZiAoZXJyb3IgPSB0aGlzLnZhbGlkYXRlQWxsKGRhdGEsIHN1YlNjaGVtYSwgW10sIFtcImxpbmtzXCIsIGldLCBkYXRhUG9pbnRlclBhdGgpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59O1xuXG4vLyBwYXJzZVVSSSgpIGFuZCByZXNvbHZlVXJsKCkgYXJlIGZyb20gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vMTA4ODg1MFxuLy8gICAtICByZWxlYXNlZCBhcyBwdWJsaWMgZG9tYWluIGJ5IGF1dGhvciAoXCJZYWZmbGVcIikgLSBzZWUgY29tbWVudHMgb24gZ2lzdFxuXG5mdW5jdGlvbiBwYXJzZVVSSSh1cmwpIHtcblx0dmFyIG0gPSBTdHJpbmcodXJsKS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJykubWF0Y2goL14oW146XFwvPyNdKzopPyhcXC9cXC8oPzpbXjpAXSooPzo6W146QF0qKT9AKT8oKFteOlxcLz8jXSopKD86OihcXGQqKSk/KSk/KFtePyNdKikoXFw/W14jXSopPygjW1xcc1xcU10qKT8vKTtcblx0Ly8gYXV0aG9yaXR5ID0gJy8vJyArIHVzZXIgKyAnOicgKyBwYXNzICdAJyArIGhvc3RuYW1lICsgJzonIHBvcnRcblx0cmV0dXJuIChtID8ge1xuXHRcdGhyZWYgICAgIDogbVswXSB8fCAnJyxcblx0XHRwcm90b2NvbCA6IG1bMV0gfHwgJycsXG5cdFx0YXV0aG9yaXR5OiBtWzJdIHx8ICcnLFxuXHRcdGhvc3QgICAgIDogbVszXSB8fCAnJyxcblx0XHRob3N0bmFtZSA6IG1bNF0gfHwgJycsXG5cdFx0cG9ydCAgICAgOiBtWzVdIHx8ICcnLFxuXHRcdHBhdGhuYW1lIDogbVs2XSB8fCAnJyxcblx0XHRzZWFyY2ggICA6IG1bN10gfHwgJycsXG5cdFx0aGFzaCAgICAgOiBtWzhdIHx8ICcnXG5cdH0gOiBudWxsKTtcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZVVybChiYXNlLCBocmVmKSB7Ly8gUkZDIDM5ODZcblxuXHRmdW5jdGlvbiByZW1vdmVEb3RTZWdtZW50cyhpbnB1dCkge1xuXHRcdHZhciBvdXRwdXQgPSBbXTtcblx0XHRpbnB1dC5yZXBsYWNlKC9eKFxcLlxcLj8oXFwvfCQpKSsvLCAnJylcblx0XHRcdC5yZXBsYWNlKC9cXC8oXFwuKFxcL3wkKSkrL2csICcvJylcblx0XHRcdC5yZXBsYWNlKC9cXC9cXC5cXC4kLywgJy8uLi8nKVxuXHRcdFx0LnJlcGxhY2UoL1xcLz9bXlxcL10qL2csIGZ1bmN0aW9uIChwKSB7XG5cdFx0XHRcdGlmIChwID09PSAnLy4uJykge1xuXHRcdFx0XHRcdG91dHB1dC5wb3AoKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRvdXRwdXQucHVzaChwKTtcblx0XHRcdFx0fVxuXHRcdH0pO1xuXHRcdHJldHVybiBvdXRwdXQuam9pbignJykucmVwbGFjZSgvXlxcLy8sIGlucHV0LmNoYXJBdCgwKSA9PT0gJy8nID8gJy8nIDogJycpO1xuXHR9XG5cblx0aHJlZiA9IHBhcnNlVVJJKGhyZWYgfHwgJycpO1xuXHRiYXNlID0gcGFyc2VVUkkoYmFzZSB8fCAnJyk7XG5cblx0cmV0dXJuICFocmVmIHx8ICFiYXNlID8gbnVsbCA6IChocmVmLnByb3RvY29sIHx8IGJhc2UucHJvdG9jb2wpICtcblx0XHQoaHJlZi5wcm90b2NvbCB8fCBocmVmLmF1dGhvcml0eSA/IGhyZWYuYXV0aG9yaXR5IDogYmFzZS5hdXRob3JpdHkpICtcblx0XHRyZW1vdmVEb3RTZWdtZW50cyhocmVmLnByb3RvY29sIHx8IGhyZWYuYXV0aG9yaXR5IHx8IGhyZWYucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycgPyBocmVmLnBhdGhuYW1lIDogKGhyZWYucGF0aG5hbWUgPyAoKGJhc2UuYXV0aG9yaXR5ICYmICFiYXNlLnBhdGhuYW1lID8gJy8nIDogJycpICsgYmFzZS5wYXRobmFtZS5zbGljZSgwLCBiYXNlLnBhdGhuYW1lLmxhc3RJbmRleE9mKCcvJykgKyAxKSArIGhyZWYucGF0aG5hbWUpIDogYmFzZS5wYXRobmFtZSkpICtcblx0XHQoaHJlZi5wcm90b2NvbCB8fCBocmVmLmF1dGhvcml0eSB8fCBocmVmLnBhdGhuYW1lID8gaHJlZi5zZWFyY2ggOiAoaHJlZi5zZWFyY2ggfHwgYmFzZS5zZWFyY2gpKSArXG5cdFx0aHJlZi5oYXNoO1xufVxuXG5mdW5jdGlvbiBnZXREb2N1bWVudFVyaSh1cmkpIHtcblx0cmV0dXJuIHVyaS5zcGxpdCgnIycpWzBdO1xufVxuZnVuY3Rpb24gbm9ybVNjaGVtYShzY2hlbWEsIGJhc2VVcmkpIHtcblx0aWYgKHNjaGVtYSAmJiB0eXBlb2Ygc2NoZW1hID09PSBcIm9iamVjdFwiKSB7XG5cdFx0aWYgKGJhc2VVcmkgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0YmFzZVVyaSA9IHNjaGVtYS5pZDtcblx0XHR9IGVsc2UgaWYgKHR5cGVvZiBzY2hlbWEuaWQgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdGJhc2VVcmkgPSByZXNvbHZlVXJsKGJhc2VVcmksIHNjaGVtYS5pZCk7XG5cdFx0XHRzY2hlbWEuaWQgPSBiYXNlVXJpO1xuXHRcdH1cblx0XHRpZiAoQXJyYXkuaXNBcnJheShzY2hlbWEpKSB7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNjaGVtYS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRub3JtU2NoZW1hKHNjaGVtYVtpXSwgYmFzZVVyaSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICh0eXBlb2Ygc2NoZW1hWyckcmVmJ10gPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0c2NoZW1hWyckcmVmJ10gPSByZXNvbHZlVXJsKGJhc2VVcmksIHNjaGVtYVsnJHJlZiddKTtcblx0XHRcdH1cblx0XHRcdGZvciAodmFyIGtleSBpbiBzY2hlbWEpIHtcblx0XHRcdFx0aWYgKGtleSAhPT0gXCJlbnVtXCIpIHtcblx0XHRcdFx0XHRub3JtU2NoZW1hKHNjaGVtYVtrZXldLCBiYXNlVXJpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuXG52YXIgRXJyb3JDb2RlcyA9IHtcblx0SU5WQUxJRF9UWVBFOiAwLFxuXHRFTlVNX01JU01BVENIOiAxLFxuXHRBTllfT0ZfTUlTU0lORzogMTAsXG5cdE9ORV9PRl9NSVNTSU5HOiAxMSxcblx0T05FX09GX01VTFRJUExFOiAxMixcblx0Tk9UX1BBU1NFRDogMTMsXG5cdC8vIE51bWVyaWMgZXJyb3JzXG5cdE5VTUJFUl9NVUxUSVBMRV9PRjogMTAwLFxuXHROVU1CRVJfTUlOSU1VTTogMTAxLFxuXHROVU1CRVJfTUlOSU1VTV9FWENMVVNJVkU6IDEwMixcblx0TlVNQkVSX01BWElNVU06IDEwMyxcblx0TlVNQkVSX01BWElNVU1fRVhDTFVTSVZFOiAxMDQsXG5cdE5VTUJFUl9OT1RfQV9OVU1CRVI6IDEwNSxcblx0Ly8gU3RyaW5nIGVycm9yc1xuXHRTVFJJTkdfTEVOR1RIX1NIT1JUOiAyMDAsXG5cdFNUUklOR19MRU5HVEhfTE9ORzogMjAxLFxuXHRTVFJJTkdfUEFUVEVSTjogMjAyLFxuXHQvLyBPYmplY3QgZXJyb3JzXG5cdE9CSkVDVF9QUk9QRVJUSUVTX01JTklNVU06IDMwMCxcblx0T0JKRUNUX1BST1BFUlRJRVNfTUFYSU1VTTogMzAxLFxuXHRPQkpFQ1RfUkVRVUlSRUQ6IDMwMixcblx0T0JKRUNUX0FERElUSU9OQUxfUFJPUEVSVElFUzogMzAzLFxuXHRPQkpFQ1RfREVQRU5ERU5DWV9LRVk6IDMwNCxcblx0Ly8gQXJyYXkgZXJyb3JzXG5cdEFSUkFZX0xFTkdUSF9TSE9SVDogNDAwLFxuXHRBUlJBWV9MRU5HVEhfTE9ORzogNDAxLFxuXHRBUlJBWV9VTklRVUU6IDQwMixcblx0QVJSQVlfQURESVRJT05BTF9JVEVNUzogNDAzLFxuXHQvLyBDdXN0b20vdXNlci1kZWZpbmVkIGVycm9yc1xuXHRGT1JNQVRfQ1VTVE9NOiA1MDAsXG5cdEtFWVdPUkRfQ1VTVE9NOiA1MDEsXG5cdC8vIFNjaGVtYSBzdHJ1Y3R1cmVcblx0Q0lSQ1VMQVJfUkVGRVJFTkNFOiA2MDAsXG5cdC8vIE5vbi1zdGFuZGFyZCB2YWxpZGF0aW9uIG9wdGlvbnNcblx0VU5LTk9XTl9QUk9QRVJUWTogMTAwMFxufTtcbnZhciBFcnJvckNvZGVMb29rdXAgPSB7fTtcbmZvciAodmFyIGtleSBpbiBFcnJvckNvZGVzKSB7XG5cdEVycm9yQ29kZUxvb2t1cFtFcnJvckNvZGVzW2tleV1dID0ga2V5O1xufVxudmFyIEVycm9yTWVzc2FnZXNEZWZhdWx0ID0ge1xuXHRJTlZBTElEX1RZUEU6IFwiSW52YWxpZCB0eXBlOiB7dHlwZX0gKGV4cGVjdGVkIHtleHBlY3RlZH0pXCIsXG5cdEVOVU1fTUlTTUFUQ0g6IFwiTm8gZW51bSBtYXRjaCBmb3I6IHt2YWx1ZX1cIixcblx0QU5ZX09GX01JU1NJTkc6IFwiRGF0YSBkb2VzIG5vdCBtYXRjaCBhbnkgc2NoZW1hcyBmcm9tIFxcXCJhbnlPZlxcXCJcIixcblx0T05FX09GX01JU1NJTkc6IFwiRGF0YSBkb2VzIG5vdCBtYXRjaCBhbnkgc2NoZW1hcyBmcm9tIFxcXCJvbmVPZlxcXCJcIixcblx0T05FX09GX01VTFRJUExFOiBcIkRhdGEgaXMgdmFsaWQgYWdhaW5zdCBtb3JlIHRoYW4gb25lIHNjaGVtYSBmcm9tIFxcXCJvbmVPZlxcXCI6IGluZGljZXMge2luZGV4MX0gYW5kIHtpbmRleDJ9XCIsXG5cdE5PVF9QQVNTRUQ6IFwiRGF0YSBtYXRjaGVzIHNjaGVtYSBmcm9tIFxcXCJub3RcXFwiXCIsXG5cdC8vIE51bWVyaWMgZXJyb3JzXG5cdE5VTUJFUl9NVUxUSVBMRV9PRjogXCJWYWx1ZSB7dmFsdWV9IGlzIG5vdCBhIG11bHRpcGxlIG9mIHttdWx0aXBsZU9mfVwiLFxuXHROVU1CRVJfTUlOSU1VTTogXCJWYWx1ZSB7dmFsdWV9IGlzIGxlc3MgdGhhbiBtaW5pbXVtIHttaW5pbXVtfVwiLFxuXHROVU1CRVJfTUlOSU1VTV9FWENMVVNJVkU6IFwiVmFsdWUge3ZhbHVlfSBpcyBlcXVhbCB0byBleGNsdXNpdmUgbWluaW11bSB7bWluaW11bX1cIixcblx0TlVNQkVSX01BWElNVU06IFwiVmFsdWUge3ZhbHVlfSBpcyBncmVhdGVyIHRoYW4gbWF4aW11bSB7bWF4aW11bX1cIixcblx0TlVNQkVSX01BWElNVU1fRVhDTFVTSVZFOiBcIlZhbHVlIHt2YWx1ZX0gaXMgZXF1YWwgdG8gZXhjbHVzaXZlIG1heGltdW0ge21heGltdW19XCIsXG5cdE5VTUJFUl9OT1RfQV9OVU1CRVI6IFwiVmFsdWUge3ZhbHVlfSBpcyBub3QgYSB2YWxpZCBudW1iZXJcIixcblx0Ly8gU3RyaW5nIGVycm9yc1xuXHRTVFJJTkdfTEVOR1RIX1NIT1JUOiBcIlN0cmluZyBpcyB0b28gc2hvcnQgKHtsZW5ndGh9IGNoYXJzKSwgbWluaW11bSB7bWluaW11bX1cIixcblx0U1RSSU5HX0xFTkdUSF9MT05HOiBcIlN0cmluZyBpcyB0b28gbG9uZyAoe2xlbmd0aH0gY2hhcnMpLCBtYXhpbXVtIHttYXhpbXVtfVwiLFxuXHRTVFJJTkdfUEFUVEVSTjogXCJTdHJpbmcgZG9lcyBub3QgbWF0Y2ggcGF0dGVybjoge3BhdHRlcm59XCIsXG5cdC8vIE9iamVjdCBlcnJvcnNcblx0T0JKRUNUX1BST1BFUlRJRVNfTUlOSU1VTTogXCJUb28gZmV3IHByb3BlcnRpZXMgZGVmaW5lZCAoe3Byb3BlcnR5Q291bnR9KSwgbWluaW11bSB7bWluaW11bX1cIixcblx0T0JKRUNUX1BST1BFUlRJRVNfTUFYSU1VTTogXCJUb28gbWFueSBwcm9wZXJ0aWVzIGRlZmluZWQgKHtwcm9wZXJ0eUNvdW50fSksIG1heGltdW0ge21heGltdW19XCIsXG5cdE9CSkVDVF9SRVFVSVJFRDogXCJNaXNzaW5nIHJlcXVpcmVkIHByb3BlcnR5OiB7a2V5fVwiLFxuXHRPQkpFQ1RfQURESVRJT05BTF9QUk9QRVJUSUVTOiBcIkFkZGl0aW9uYWwgcHJvcGVydGllcyBub3QgYWxsb3dlZFwiLFxuXHRPQkpFQ1RfREVQRU5ERU5DWV9LRVk6IFwiRGVwZW5kZW5jeSBmYWlsZWQgLSBrZXkgbXVzdCBleGlzdDoge21pc3Npbmd9IChkdWUgdG8ga2V5OiB7a2V5fSlcIixcblx0Ly8gQXJyYXkgZXJyb3JzXG5cdEFSUkFZX0xFTkdUSF9TSE9SVDogXCJBcnJheSBpcyB0b28gc2hvcnQgKHtsZW5ndGh9KSwgbWluaW11bSB7bWluaW11bX1cIixcblx0QVJSQVlfTEVOR1RIX0xPTkc6IFwiQXJyYXkgaXMgdG9vIGxvbmcgKHtsZW5ndGh9KSwgbWF4aW11bSB7bWF4aW11bX1cIixcblx0QVJSQVlfVU5JUVVFOiBcIkFycmF5IGl0ZW1zIGFyZSBub3QgdW5pcXVlIChpbmRpY2VzIHttYXRjaDF9IGFuZCB7bWF0Y2gyfSlcIixcblx0QVJSQVlfQURESVRJT05BTF9JVEVNUzogXCJBZGRpdGlvbmFsIGl0ZW1zIG5vdCBhbGxvd2VkXCIsXG5cdC8vIEZvcm1hdCBlcnJvcnNcblx0Rk9STUFUX0NVU1RPTTogXCJGb3JtYXQgdmFsaWRhdGlvbiBmYWlsZWQgKHttZXNzYWdlfSlcIixcblx0S0VZV09SRF9DVVNUT006IFwiS2V5d29yZCBmYWlsZWQ6IHtrZXl9ICh7bWVzc2FnZX0pXCIsXG5cdC8vIFNjaGVtYSBzdHJ1Y3R1cmVcblx0Q0lSQ1VMQVJfUkVGRVJFTkNFOiBcIkNpcmN1bGFyICRyZWZzOiB7dXJsc31cIixcblx0Ly8gTm9uLXN0YW5kYXJkIHZhbGlkYXRpb24gb3B0aW9uc1xuXHRVTktOT1dOX1BST1BFUlRZOiBcIlVua25vd24gcHJvcGVydHkgKG5vdCBpbiBzY2hlbWEpXCJcbn07XG5cbmZ1bmN0aW9uIFZhbGlkYXRpb25FcnJvcihjb2RlLCBtZXNzYWdlLCBwYXJhbXMsIGRhdGFQYXRoLCBzY2hlbWFQYXRoLCBzdWJFcnJvcnMpIHtcblx0RXJyb3IuY2FsbCh0aGlzKTtcblx0aWYgKGNvZGUgPT09IHVuZGVmaW5lZCkge1xuXHRcdHRocm93IG5ldyBFcnJvciAoXCJObyBjb2RlIHN1cHBsaWVkIGZvciBlcnJvcjogXCIrIG1lc3NhZ2UpO1xuXHR9XG5cdHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG5cdHRoaXMucGFyYW1zID0gcGFyYW1zO1xuXHR0aGlzLmNvZGUgPSBjb2RlO1xuXHR0aGlzLmRhdGFQYXRoID0gZGF0YVBhdGggfHwgXCJcIjtcblx0dGhpcy5zY2hlbWFQYXRoID0gc2NoZW1hUGF0aCB8fCBcIlwiO1xuXHR0aGlzLnN1YkVycm9ycyA9IHN1YkVycm9ycyB8fCBudWxsO1xuXG5cdHZhciBlcnIgPSBuZXcgRXJyb3IodGhpcy5tZXNzYWdlKTtcblx0dGhpcy5zdGFjayA9IGVyci5zdGFjayB8fCBlcnIuc3RhY2t0cmFjZTtcblx0aWYgKCF0aGlzLnN0YWNrKSB7XG5cdFx0dHJ5IHtcblx0XHRcdHRocm93IGVycjtcblx0XHR9XG5cdFx0Y2F0Y2goZXJyKSB7XG5cdFx0XHR0aGlzLnN0YWNrID0gZXJyLnN0YWNrIHx8IGVyci5zdGFja3RyYWNlO1xuXHRcdH1cblx0fVxufVxuVmFsaWRhdGlvbkVycm9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRXJyb3IucHJvdG90eXBlKTtcblZhbGlkYXRpb25FcnJvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBWYWxpZGF0aW9uRXJyb3I7XG5WYWxpZGF0aW9uRXJyb3IucHJvdG90eXBlLm5hbWUgPSAnVmFsaWRhdGlvbkVycm9yJztcblxuVmFsaWRhdGlvbkVycm9yLnByb3RvdHlwZS5wcmVmaXhXaXRoID0gZnVuY3Rpb24gKGRhdGFQcmVmaXgsIHNjaGVtYVByZWZpeCkge1xuXHRpZiAoZGF0YVByZWZpeCAhPT0gbnVsbCkge1xuXHRcdGRhdGFQcmVmaXggPSBkYXRhUHJlZml4LnJlcGxhY2UoL34vZywgXCJ+MFwiKS5yZXBsYWNlKC9cXC8vZywgXCJ+MVwiKTtcblx0XHR0aGlzLmRhdGFQYXRoID0gXCIvXCIgKyBkYXRhUHJlZml4ICsgdGhpcy5kYXRhUGF0aDtcblx0fVxuXHRpZiAoc2NoZW1hUHJlZml4ICE9PSBudWxsKSB7XG5cdFx0c2NoZW1hUHJlZml4ID0gc2NoZW1hUHJlZml4LnJlcGxhY2UoL34vZywgXCJ+MFwiKS5yZXBsYWNlKC9cXC8vZywgXCJ+MVwiKTtcblx0XHR0aGlzLnNjaGVtYVBhdGggPSBcIi9cIiArIHNjaGVtYVByZWZpeCArIHRoaXMuc2NoZW1hUGF0aDtcblx0fVxuXHRpZiAodGhpcy5zdWJFcnJvcnMgIT09IG51bGwpIHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc3ViRXJyb3JzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR0aGlzLnN1YkVycm9yc1tpXS5wcmVmaXhXaXRoKGRhdGFQcmVmaXgsIHNjaGVtYVByZWZpeCk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiB0aGlzO1xufTtcblxuZnVuY3Rpb24gaXNUcnVzdGVkVXJsKGJhc2VVcmwsIHRlc3RVcmwpIHtcblx0aWYodGVzdFVybC5zdWJzdHJpbmcoMCwgYmFzZVVybC5sZW5ndGgpID09PSBiYXNlVXJsKXtcblx0XHR2YXIgcmVtYWluZGVyID0gdGVzdFVybC5zdWJzdHJpbmcoYmFzZVVybC5sZW5ndGgpO1xuXHRcdGlmICgodGVzdFVybC5sZW5ndGggPiAwICYmIHRlc3RVcmwuY2hhckF0KGJhc2VVcmwubGVuZ3RoIC0gMSkgPT09IFwiL1wiKVxuXHRcdFx0fHwgcmVtYWluZGVyLmNoYXJBdCgwKSA9PT0gXCIjXCJcblx0XHRcdHx8IHJlbWFpbmRlci5jaGFyQXQoMCkgPT09IFwiP1wiKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufVxuXG52YXIgbGFuZ3VhZ2VzID0ge307XG5mdW5jdGlvbiBjcmVhdGVBcGkobGFuZ3VhZ2UpIHtcblx0dmFyIGdsb2JhbENvbnRleHQgPSBuZXcgVmFsaWRhdG9yQ29udGV4dCgpO1xuXHR2YXIgY3VycmVudExhbmd1YWdlID0gbGFuZ3VhZ2UgfHwgJ2VuJztcblx0dmFyIGFwaSA9IHtcblx0XHRhZGRGb3JtYXQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdGdsb2JhbENvbnRleHQuYWRkRm9ybWF0LmFwcGx5KGdsb2JhbENvbnRleHQsIGFyZ3VtZW50cyk7XG5cdFx0fSxcblx0XHRsYW5ndWFnZTogZnVuY3Rpb24gKGNvZGUpIHtcblx0XHRcdGlmICghY29kZSkge1xuXHRcdFx0XHRyZXR1cm4gY3VycmVudExhbmd1YWdlO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCFsYW5ndWFnZXNbY29kZV0pIHtcblx0XHRcdFx0Y29kZSA9IGNvZGUuc3BsaXQoJy0nKVswXTsgLy8gZmFsbCBiYWNrIHRvIGJhc2UgbGFuZ3VhZ2Vcblx0XHRcdH1cblx0XHRcdGlmIChsYW5ndWFnZXNbY29kZV0pIHtcblx0XHRcdFx0Y3VycmVudExhbmd1YWdlID0gY29kZTtcblx0XHRcdFx0cmV0dXJuIGNvZGU7IC8vIHNvIHlvdSBjYW4gdGVsbCBpZiBmYWxsLWJhY2sgaGFzIGhhcHBlbmVkXG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSxcblx0XHRhZGRMYW5ndWFnZTogZnVuY3Rpb24gKGNvZGUsIG1lc3NhZ2VNYXApIHtcblx0XHRcdHZhciBrZXk7XG5cdFx0XHRmb3IgKGtleSBpbiBFcnJvckNvZGVzKSB7XG5cdFx0XHRcdGlmIChtZXNzYWdlTWFwW2tleV0gJiYgIW1lc3NhZ2VNYXBbRXJyb3JDb2Rlc1trZXldXSkge1xuXHRcdFx0XHRcdG1lc3NhZ2VNYXBbRXJyb3JDb2Rlc1trZXldXSA9IG1lc3NhZ2VNYXBba2V5XTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dmFyIHJvb3RDb2RlID0gY29kZS5zcGxpdCgnLScpWzBdO1xuXHRcdFx0aWYgKCFsYW5ndWFnZXNbcm9vdENvZGVdKSB7IC8vIHVzZSBmb3IgYmFzZSBsYW5ndWFnZSBpZiBub3QgeWV0IGRlZmluZWRcblx0XHRcdFx0bGFuZ3VhZ2VzW2NvZGVdID0gbWVzc2FnZU1hcDtcblx0XHRcdFx0bGFuZ3VhZ2VzW3Jvb3RDb2RlXSA9IG1lc3NhZ2VNYXA7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRsYW5ndWFnZXNbY29kZV0gPSBPYmplY3QuY3JlYXRlKGxhbmd1YWdlc1tyb290Q29kZV0pO1xuXHRcdFx0XHRmb3IgKGtleSBpbiBtZXNzYWdlTWFwKSB7XG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBsYW5ndWFnZXNbcm9vdENvZGVdW2tleV0gPT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdFx0XHRsYW5ndWFnZXNbcm9vdENvZGVdW2tleV0gPSBtZXNzYWdlTWFwW2tleV07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGxhbmd1YWdlc1tjb2RlXVtrZXldID0gbWVzc2FnZU1hcFtrZXldO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9LFxuXHRcdGZyZXNoQXBpOiBmdW5jdGlvbiAobGFuZ3VhZ2UpIHtcblx0XHRcdHZhciByZXN1bHQgPSBjcmVhdGVBcGkoKTtcblx0XHRcdGlmIChsYW5ndWFnZSkge1xuXHRcdFx0XHRyZXN1bHQubGFuZ3VhZ2UobGFuZ3VhZ2UpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9LFxuXHRcdHZhbGlkYXRlOiBmdW5jdGlvbiAoZGF0YSwgc2NoZW1hLCBjaGVja1JlY3Vyc2l2ZSwgYmFuVW5rbm93blByb3BlcnRpZXMpIHtcblx0XHRcdHZhciBjb250ZXh0ID0gbmV3IFZhbGlkYXRvckNvbnRleHQoZ2xvYmFsQ29udGV4dCwgZmFsc2UsIGxhbmd1YWdlc1tjdXJyZW50TGFuZ3VhZ2VdLCBjaGVja1JlY3Vyc2l2ZSwgYmFuVW5rbm93blByb3BlcnRpZXMpO1xuXHRcdFx0aWYgKHR5cGVvZiBzY2hlbWEgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0c2NoZW1hID0ge1wiJHJlZlwiOiBzY2hlbWF9O1xuXHRcdFx0fVxuXHRcdFx0Y29udGV4dC5hZGRTY2hlbWEoXCJcIiwgc2NoZW1hKTtcblx0XHRcdHZhciBlcnJvciA9IGNvbnRleHQudmFsaWRhdGVBbGwoZGF0YSwgc2NoZW1hLCBudWxsLCBudWxsLCBcIlwiKTtcblx0XHRcdGlmICghZXJyb3IgJiYgYmFuVW5rbm93blByb3BlcnRpZXMpIHtcblx0XHRcdFx0ZXJyb3IgPSBjb250ZXh0LmJhblVua25vd25Qcm9wZXJ0aWVzKCk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLmVycm9yID0gZXJyb3I7XG5cdFx0XHR0aGlzLm1pc3NpbmcgPSBjb250ZXh0Lm1pc3Npbmc7XG5cdFx0XHR0aGlzLnZhbGlkID0gKGVycm9yID09PSBudWxsKTtcblx0XHRcdHJldHVybiB0aGlzLnZhbGlkO1xuXHRcdH0sXG5cdFx0dmFsaWRhdGVSZXN1bHQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHZhciByZXN1bHQgPSB7fTtcblx0XHRcdHRoaXMudmFsaWRhdGUuYXBwbHkocmVzdWx0LCBhcmd1bWVudHMpO1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9LFxuXHRcdHZhbGlkYXRlTXVsdGlwbGU6IGZ1bmN0aW9uIChkYXRhLCBzY2hlbWEsIGNoZWNrUmVjdXJzaXZlLCBiYW5Vbmtub3duUHJvcGVydGllcykge1xuXHRcdFx0dmFyIGNvbnRleHQgPSBuZXcgVmFsaWRhdG9yQ29udGV4dChnbG9iYWxDb250ZXh0LCB0cnVlLCBsYW5ndWFnZXNbY3VycmVudExhbmd1YWdlXSwgY2hlY2tSZWN1cnNpdmUsIGJhblVua25vd25Qcm9wZXJ0aWVzKTtcblx0XHRcdGlmICh0eXBlb2Ygc2NoZW1hID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdHNjaGVtYSA9IHtcIiRyZWZcIjogc2NoZW1hfTtcblx0XHRcdH1cblx0XHRcdGNvbnRleHQuYWRkU2NoZW1hKFwiXCIsIHNjaGVtYSk7XG5cdFx0XHRjb250ZXh0LnZhbGlkYXRlQWxsKGRhdGEsIHNjaGVtYSwgbnVsbCwgbnVsbCwgXCJcIik7XG5cdFx0XHRpZiAoYmFuVW5rbm93blByb3BlcnRpZXMpIHtcblx0XHRcdFx0Y29udGV4dC5iYW5Vbmtub3duUHJvcGVydGllcygpO1xuXHRcdFx0fVxuXHRcdFx0dmFyIHJlc3VsdCA9IHt9O1xuXHRcdFx0cmVzdWx0LmVycm9ycyA9IGNvbnRleHQuZXJyb3JzO1xuXHRcdFx0cmVzdWx0Lm1pc3NpbmcgPSBjb250ZXh0Lm1pc3Npbmc7XG5cdFx0XHRyZXN1bHQudmFsaWQgPSAocmVzdWx0LmVycm9ycy5sZW5ndGggPT09IDApO1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9LFxuXHRcdGFkZFNjaGVtYTogZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIGdsb2JhbENvbnRleHQuYWRkU2NoZW1hLmFwcGx5KGdsb2JhbENvbnRleHQsIGFyZ3VtZW50cyk7XG5cdFx0fSxcblx0XHRnZXRTY2hlbWE6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBnbG9iYWxDb250ZXh0LmdldFNjaGVtYS5hcHBseShnbG9iYWxDb250ZXh0LCBhcmd1bWVudHMpO1xuXHRcdH0sXG5cdFx0Z2V0U2NoZW1hTWFwOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gZ2xvYmFsQ29udGV4dC5nZXRTY2hlbWFNYXAuYXBwbHkoZ2xvYmFsQ29udGV4dCwgYXJndW1lbnRzKTtcblx0XHR9LFxuXHRcdGdldFNjaGVtYVVyaXM6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBnbG9iYWxDb250ZXh0LmdldFNjaGVtYVVyaXMuYXBwbHkoZ2xvYmFsQ29udGV4dCwgYXJndW1lbnRzKTtcblx0XHR9LFxuXHRcdGdldE1pc3NpbmdVcmlzOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gZ2xvYmFsQ29udGV4dC5nZXRNaXNzaW5nVXJpcy5hcHBseShnbG9iYWxDb250ZXh0LCBhcmd1bWVudHMpO1xuXHRcdH0sXG5cdFx0ZHJvcFNjaGVtYXM6IGZ1bmN0aW9uICgpIHtcblx0XHRcdGdsb2JhbENvbnRleHQuZHJvcFNjaGVtYXMuYXBwbHkoZ2xvYmFsQ29udGV4dCwgYXJndW1lbnRzKTtcblx0XHR9LFxuXHRcdGRlZmluZUtleXdvcmQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdGdsb2JhbENvbnRleHQuZGVmaW5lS2V5d29yZC5hcHBseShnbG9iYWxDb250ZXh0LCBhcmd1bWVudHMpO1xuXHRcdH0sXG5cdFx0ZGVmaW5lRXJyb3I6IGZ1bmN0aW9uIChjb2RlTmFtZSwgY29kZU51bWJlciwgZGVmYXVsdE1lc3NhZ2UpIHtcblx0XHRcdGlmICh0eXBlb2YgY29kZU5hbWUgIT09ICdzdHJpbmcnIHx8ICEvXltBLVpdKyhfW0EtWl0rKSokLy50ZXN0KGNvZGVOYW1lKSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0NvZGUgbmFtZSBtdXN0IGJlIGEgc3RyaW5nIGluIFVQUEVSX0NBU0VfV0lUSF9VTkRFUlNDT1JFUycpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHR5cGVvZiBjb2RlTnVtYmVyICE9PSAnbnVtYmVyJyB8fCBjb2RlTnVtYmVyJTEgIT09IDAgfHwgY29kZU51bWJlciA8IDEwMDAwKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcignQ29kZSBudW1iZXIgbXVzdCBiZSBhbiBpbnRlZ2VyID4gMTAwMDAnKTtcblx0XHRcdH1cblx0XHRcdGlmICh0eXBlb2YgRXJyb3JDb2Rlc1tjb2RlTmFtZV0gIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcignRXJyb3IgYWxyZWFkeSBkZWZpbmVkOiAnICsgY29kZU5hbWUgKyAnIGFzICcgKyBFcnJvckNvZGVzW2NvZGVOYW1lXSk7XG5cdFx0XHR9XG5cdFx0XHRpZiAodHlwZW9mIEVycm9yQ29kZUxvb2t1cFtjb2RlTnVtYmVyXSAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdFcnJvciBjb2RlIGFscmVhZHkgdXNlZDogJyArIEVycm9yQ29kZUxvb2t1cFtjb2RlTnVtYmVyXSArICcgYXMgJyArIGNvZGVOdW1iZXIpO1xuXHRcdFx0fVxuXHRcdFx0RXJyb3JDb2Rlc1tjb2RlTmFtZV0gPSBjb2RlTnVtYmVyO1xuXHRcdFx0RXJyb3JDb2RlTG9va3VwW2NvZGVOdW1iZXJdID0gY29kZU5hbWU7XG5cdFx0XHRFcnJvck1lc3NhZ2VzRGVmYXVsdFtjb2RlTmFtZV0gPSBFcnJvck1lc3NhZ2VzRGVmYXVsdFtjb2RlTnVtYmVyXSA9IGRlZmF1bHRNZXNzYWdlO1xuXHRcdFx0Zm9yICh2YXIgbGFuZ0NvZGUgaW4gbGFuZ3VhZ2VzKSB7XG5cdFx0XHRcdHZhciBsYW5ndWFnZSA9IGxhbmd1YWdlc1tsYW5nQ29kZV07XG5cdFx0XHRcdGlmIChsYW5ndWFnZVtjb2RlTmFtZV0pIHtcblx0XHRcdFx0XHRsYW5ndWFnZVtjb2RlTnVtYmVyXSA9IGxhbmd1YWdlW2NvZGVOdW1iZXJdIHx8IGxhbmd1YWdlW2NvZGVOYW1lXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0cmVzZXQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdGdsb2JhbENvbnRleHQucmVzZXQoKTtcblx0XHRcdHRoaXMuZXJyb3IgPSBudWxsO1xuXHRcdFx0dGhpcy5taXNzaW5nID0gW107XG5cdFx0XHR0aGlzLnZhbGlkID0gdHJ1ZTtcblx0XHR9LFxuXHRcdG1pc3Npbmc6IFtdLFxuXHRcdGVycm9yOiBudWxsLFxuXHRcdHZhbGlkOiB0cnVlLFxuXHRcdG5vcm1TY2hlbWE6IG5vcm1TY2hlbWEsXG5cdFx0cmVzb2x2ZVVybDogcmVzb2x2ZVVybCxcblx0XHRnZXREb2N1bWVudFVyaTogZ2V0RG9jdW1lbnRVcmksXG5cdFx0ZXJyb3JDb2RlczogRXJyb3JDb2Rlc1xuXHR9O1xuXHRyZXR1cm4gYXBpO1xufVxuXG52YXIgdHY0ID0gY3JlYXRlQXBpKCk7XG50djQuYWRkTGFuZ3VhZ2UoJ2VuLWdiJywgRXJyb3JNZXNzYWdlc0RlZmF1bHQpO1xuXG4vL2xlZ2FjeSBwcm9wZXJ0eVxudHY0LnR2NCA9IHR2NDtcblxucmV0dXJuIHR2NDsgLy8gdXNlZCBieSBfaGVhZGVyLmpzIHRvIGdsb2JhbGlzZS5cblxufSkpOyIsInZhciBfID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbnZhciBTdGVwcyA9IFsncGxheScsICdmb3JtJywgJ3Jlc3VsdCddO1xuXG5mdW5jdGlvbiBJbnN0YW50V2luKEN1cnJlbnRVc2VyLCBTaGlwKSB7XG5cbiAgdmFyIENIQU5HRV9FVkVOVCA9IFtcIlNISVBfQ0hBTkdFXCIsIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMDAwMDAwMDAwMCldLmpvaW4oJ18nKTtcblxuICB2YXIgQXBwU3RhdGUgPSB7fTtcblxuICBmdW5jdGlvbiBpbml0U3RhdGUodXNlciwgc2hpcCkge1xuICAgIEFwcFN0YXRlID0ge1xuICAgICAgc2hpcDogXy5vbWl0KHNoaXAsICdzZXR0aW5ncycsICdyZXNvdXJjZXMnLCAndHJhbnNsYXRpb25zJyksXG4gICAgICBzZXR0aW5nczogc2hpcC5zZXR0aW5ncyxcbiAgICAgIGZvcm06IHNoaXAucmVzb3VyY2VzLmZvcm0sXG4gICAgICBhY2hpZXZlbWVudDogc2hpcC5yZXNvdXJjZXMuYWNoaWV2ZW1lbnQsXG4gICAgICB0cmFuc2xhdGlvbnM6IHNoaXAudHJhbnNsYXRpb25zLFxuICAgICAgdXNlcjogdXNlcixcbiAgICAgIGJhZGdlOiAoc2hpcC5yZXNvdXJjZXMuYWNoaWV2ZW1lbnQgJiYgc2hpcC5yZXNvdXJjZXMuYWNoaWV2ZW1lbnQuYmFkZ2UpXG4gICAgfTtcbiAgICBlbWl0Q2hhbmdlKCk7XG4gICAgcmV0dXJuIEFwcFN0YXRlO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGVtaXRDaGFuZ2UodG1wKSB7XG4gICAgdmFyIHMgPSBnZXRBcHBTdGF0ZSh0bXApO1xuICAgIEh1bGwuZW1pdChDSEFOR0VfRVZFTlQsIHMpO1xuICB9XG5cblxuICAvLyBDdXN0b21pemF0aW9uIHN1cHBvcnRcblxuICBmdW5jdGlvbiB1cGRhdGVTZXR0aW5ncyhzZXR0aW5ncykge1xuICAgIEFwcFN0YXRlLnNldHRpbmdzID0gc2V0dGluZ3M7XG4gICAgZW1pdENoYW5nZSh7IGNoYW5nZWQ6ICdzZXR0aW5ncycgfSk7XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVUcmFuc2xhdGlvbnModHJhbnNsYXRpb25zKSB7XG4gICAgQXBwU3RhdGUudHJhbnNsYXRpb25zID0gdHJhbnNsYXRpb25zO1xuICAgIGVtaXRDaGFuZ2UoeyBjaGFuZ2VkOiAndHJhbnNsYXRpb25zJyB9KTtcbiAgfVxuXG5cbiAgLy8gVXNlciBhY3Rpb25zXG5cblxuICBmdW5jdGlvbiBzdWJtaXRGb3JtKGZvcm1EYXRhKSB7XG4gICAgZW1pdENoYW5nZSh7IGNoYW5nZWQ6ICdsb2FkaW5nJywgbG9hZGluZzogJ2Zvcm0nIH0pO1xuICAgIEh1bGwuYXBpLnB1dChBcHBTdGF0ZS5mb3JtLmlkICsgXCIvc3VibWl0XCIsIHsgZGF0YTogZm9ybURhdGEgfSkudGhlbihmdW5jdGlvbihmb3JtKSB7XG4gICAgICBBcHBTdGF0ZS5mb3JtID0gZm9ybTtcbiAgICAgIGVtaXRDaGFuZ2UoeyBjaGFuZ2VkOiAnZm9ybScgfSk7XG4gICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ0Vycm9yJywgZXJyKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBsYXkocHJvdmlkZXIpIHtcbiAgICBpZiAodXNlckNhblBsYXkoKSkge1xuICAgICAgZW1pdENoYW5nZSh7IGNoYW5nZWQ6ICdsb2FkaW5nJywgbG9hZGluZzogJ2JhZGdlJyB9KTtcbiAgICAgIHJldHVybiBIdWxsLmFwaS5wb3N0KEFwcFN0YXRlLmFjaGlldmVtZW50LmlkICsgXCIvYWNoaWV2ZVwiKS50aGVuKGZ1bmN0aW9uKGJhZGdlKSB7XG4gICAgICAgIEFwcFN0YXRlLmJhZGdlID0gYmFkZ2U7XG4gICAgICAgIGVtaXRDaGFuZ2UoeyBjaGFuZ2VkOiAnYmFkZ2UnIH0pO1xuICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGNvbnNvbGUud2FybignRXJyb3I6ICcsIGVycik7XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHByb3ZpZGVyICYmICFBcHBTdGF0ZS51c2VyKSB7XG4gICAgICBsb2dpbkFuZFBsYXkocHJvdmlkZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oXCJVc2VyIGNhbm5vdCBwbGF5XCIsIGNhblBsYXkoKSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIGF1dG9QbGF5ID0gZmFsc2U7XG4gIGZ1bmN0aW9uIGxvZ2luQW5kUGxheShwcm92aWRlciwgb3B0aW9ucykge1xuICAgIGlmIChwcm92aWRlcikge1xuICAgICAgYXV0b1BsYXkgPSB0cnVlO1xuICAgICAgZW1pdENoYW5nZSh7IGlzTG9nZ2luZ0luOiB0cnVlIH0pO1xuICAgICAgSHVsbC5sb2dpbihwcm92aWRlciwgb3B0aW9ucyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IFwiW0luc3RhbnRXaW5dIEVycm9yIGluIGxvZ2luQW5kUGxheSBtZXRob2Q6IG1pc3NpbmcgYHByb3ZpZGVyYFwiO1xuICAgIH1cbiAgfVxuXG4gIC8vIFN0YXRlIG1hbmFnZW1lbnRcblxuICBmdW5jdGlvbiBnZXRBcHBTdGF0ZSh0bXApIHtcbiAgICB2YXIgc3RlcCA9IGN1cnJlbnRTdGVwKCk7XG4gICAgdmFyIHJldCA9IF8uZXh0ZW5kKHt9LCBBcHBTdGF0ZSwge1xuICAgICAgdXNlckNhblBsYXk6IHVzZXJDYW5QbGF5KCksXG4gICAgICB1c2VySGFzUGxheWVkOiB1c2VySGFzUGxheWVkKCksXG4gICAgICB1c2VySGFzV29uOiB1c2VySGFzV29uKCksXG4gICAgICBjdXJyZW50U3RlcDogc3RlcCxcbiAgICAgIGN1cnJlbnRTdGVwSW5kZXg6IHN0ZXBJbmRleChzdGVwKSxcbiAgICAgIGlzRm9ybUNvbXBsZXRlOiBpc0Zvcm1Db21wbGV0ZSgpLFxuICAgIH0sIHRtcCk7XG4gICAgcmV0dXJuIF8uZGVlcENsb25lKHJldCk7XG4gIH1cblxuICBmdW5jdGlvbiB1c2VyQ2FuUGxheSgpIHtcbiAgICByZXR1cm4gY2FuUGxheSgpID09PSB0cnVlO1xuICB9XG5cbiAgZnVuY3Rpb24gY2FuUGxheSgpIHtcbiAgICBpZiAoIUFwcFN0YXRlLnVzZXIpIHJldHVybiBcIk5vIGN1cnJlbnQgdXNlclwiO1xuICAgIGlmICh1c2VySGFzV29uKCkpIHJldHVybiBcIkFscmVhZHkgd29uXCI7XG4gICAgdmFyIGJhZGdlID0gQXBwU3RhdGUuYmFkZ2U7XG4gICAgaWYgKCFiYWRnZSB8fCAhYmFkZ2UuZGF0YS5hdHRlbXB0cykgcmV0dXJuIHRydWU7XG4gICAgdmFyIGQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkuc2xpY2UoMCwgMTApO1xuICAgIGlmIChiYWRnZS5kYXRhLmF0dGVtcHRzW2RdKSB7XG4gICAgICByZXR1cm4gXCJPbmUgYXR0ZW1wdCBhbHJlYWR5IHRvZGF5XCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHVzZXJIYXNQbGF5ZWQoKSB7XG4gICAgcmV0dXJuICEhQXBwU3RhdGUuYmFkZ2U7XG4gIH1cblxuICBmdW5jdGlvbiB1c2VySGFzV29uKCkge1xuICAgIHZhciBiYWRnZSA9IEFwcFN0YXRlLmJhZGdlO1xuICAgIGlmICghYmFkZ2UgfHwgIWJhZGdlLmRhdGEpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gYmFkZ2UuZGF0YS53aW5uZXIgPT09IHRydWU7XG4gIH1cblxuICBmdW5jdGlvbiBjdXJyZW50U3RlcCgpIHtcbiAgICBpZiAoIUFwcFN0YXRlLnVzZXIgfHwgdXNlckNhblBsYXkoKSkgcmV0dXJuICdwbGF5JztcbiAgICBpZiAoIWlzRm9ybUNvbXBsZXRlKCkpIHJldHVybiAnZm9ybSc7XG4gICAgcmV0dXJuICdyZXN1bHQnO1xuICB9XG5cbiAgZnVuY3Rpb24gc3RlcEluZGV4KHN0ZXApIHtcbiAgICByZXR1cm4gU3RlcHMuaW5kZXhPZihzdGVwKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzRm9ybUNvbXBsZXRlKCkge1xuICAgIGlmICghQXBwU3RhdGUudXNlcikgcmV0dXJuIGZhbHNlO1xuICAgIHZhciBmaWVsZHMgPSBBcHBTdGF0ZS5mb3JtICYmIEFwcFN0YXRlLmZvcm0uZmllbGRzX2xpc3Q7XG4gICAgdmFyIHJldCA9IEFwcFN0YXRlLmZvcm0udXNlcl9kYXRhLmNyZWF0ZWRfYXQgJiYgZmllbGRzICYmIGZpZWxkcy5yZWR1Y2UoZnVuY3Rpb24ocmVzLCBmaWVsZCkge1xuICAgICAgcmV0dXJuIHJlcyAmJiAhIWZpZWxkLnZhbHVlO1xuICAgIH0sIHRydWUpO1xuICAgIHJldHVybiByZXQgfHwgZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiByZXNldCgpIHtcbiAgICBpZiAoQXBwU3RhdGUudXNlci5pc19hZG1pbikge1xuICAgICAgZW1pdENoYW5nZSh7IGxvYWRpbmc6ICdyZXNldCcgfSk7XG4gICAgICBpZiAoQXBwU3RhdGUuYmFkZ2UgJiYgQXBwU3RhdGUuYmFkZ2UuaWQpIHtcbiAgICAgICAgSHVsbC5hcGkoQXBwU3RhdGUuYmFkZ2UuaWQsICdkZWxldGUnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBBcHBTdGF0ZS5iYWRnZSA9IG51bGw7XG4gICAgICAgICAgSHVsbC5hcGkoQXBwU3RhdGUuZm9ybS5pZCArICcvc3VibWl0JywgJ2RlbGV0ZScsIGZ1bmN0aW9uKGZvcm0pIHtcbiAgICAgICAgICAgIEFwcFN0YXRlLmZvcm0gPSBmb3JtO1xuICAgICAgICAgICAgZW1pdENoYW5nZSh7IGNoYW5nZWQ6ICdyZXNldCcgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgIGNvbnNvbGUud2FybihcIkVycm9yOiBcIiwgZXJyKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbWl0Q2hhbmdlKHsgY2hhbmdlZDogJ3Jlc2V0JyB9KTtcbiAgICAgICAgdGhyb3cgXCJbSW5zdGFudFdpbl0gTm8gYmFkZ2UgZm91bmQgaGVyZS4uLlwiO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBcIltJbnN0YW50V2luXSBZb3UgbmVlZCB0byBiZSBhIGFkbWluaXN0cmF0b3IgdG8gcmVzZXQgYmFkZ2VzXCI7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gb25BdXRoRXZlbnQoKSB7XG4gICAgZW1pdENoYW5nZSh7IGNoYW5nZWQ6ICdsb2FkaW5nJywgbG9hZGluZzogJ3NoaXAnIH0pO1xuICAgIEh1bGwuYXBpKFNoaXAuaWQsIHsgZmllbGRzOiAnYmFkZ2UnIH0pLnRoZW4oZnVuY3Rpb24oc2hpcCkge1xuICAgICAgaW5pdFN0YXRlKEh1bGwuY3VycmVudFVzZXIoKSwgc2hpcCk7XG4gICAgICBpZiAoYXV0b1BsYXkgJiYgdXNlckNhblBsYXkoKSkgcGxheSgpO1xuICAgICAgYXV0b1BsYXkgPSBmYWxzZTtcbiAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICB9KTtcbiAgfVxuXG4gIEh1bGwub24oJ2h1bGwuYXV0aC5sb2dpbicsICBvbkF1dGhFdmVudCk7XG4gIEh1bGwub24oJ2h1bGwuYXV0aC5sb2dvdXQnLCBvbkF1dGhFdmVudCk7XG5cbiAgdmFyIF9saXN0ZW5lcnMgPSBbXTtcblxuICAvLyBQdWJsaWMgQVBJXG5cbiAgdGhpcy5vbkNoYW5nZSA9IGZ1bmN0aW9uKGNiKSB7XG4gICAgdmFyIGNhbGxiYWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIGNiLmFwcGx5KHVuZGVmaW5lZCwgYXJncyk7XG4gICAgICB9KVxuICAgIH07XG4gICAgX2xpc3RlbmVycy5wdXNoKGNhbGxiYWNrKTtcbiAgICBIdWxsLm9uKENIQU5HRV9FVkVOVCwgY2FsbGJhY2spO1xuICB9O1xuXG4gIHRoaXMudGVhcmRvd24gPSBmdW5jdGlvbigpIHtcbiAgICBIdWxsLm9mZignaHVsbC5hdXRoLmxvZ2luJywgIG9uQXV0aEV2ZW50KTtcbiAgICBIdWxsLm9mZignaHVsbC5hdXRoLmxvZ291dCcsIG9uQXV0aEV2ZW50KTtcbiAgICBmb3IgKHZhciBsPTA7IGwgPCBfbGlzdGVuZXJzLmxlbmd0aDsgbCsrKSB7XG4gICAgICBIdWxsLm9mZihDSEFOR0VfRVZFTlQsIGxpc3RlbmVyc1tsXSk7XG4gICAgfVxuICB9O1xuXG4gIHRoaXMuZ2V0U3RhdGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZ2V0QXBwU3RhdGUoKTtcbiAgfTtcblxuICB0aGlzLnBsYXkgICAgICAgICA9IHBsYXk7XG4gIHRoaXMucmVzZXQgICAgICAgID0gcmVzZXQ7XG4gIHRoaXMuc3VibWl0Rm9ybSAgID0gc3VibWl0Rm9ybTtcblxuICBpZiAoU2hpcCkge1xuICAgIGluaXRTdGF0ZShDdXJyZW50VXNlciwgU2hpcCk7XG4gIH1cblxufTtcblxuXG5JbnN0YW50V2luLlN0ZXBzID0gU3RlcHM7XG5cbm1vZHVsZS5leHBvcnRzID0gSW5zdGFudFdpbjtcbiIsImFuZ3VsYXIubW9kdWxlKCdzY2hlbWFGb3JtJykuY29uZmlnKFxuWydzY2hlbWFGb3JtUHJvdmlkZXInLCAnc2NoZW1hRm9ybURlY29yYXRvcnNQcm92aWRlcicsICdzZlBhdGhQcm92aWRlcicsXG4gIGZ1bmN0aW9uKHNjaGVtYUZvcm1Qcm92aWRlciwgIHNjaGVtYUZvcm1EZWNvcmF0b3JzUHJvdmlkZXIsIHNmUGF0aFByb3ZpZGVyKSB7XG5cbiAgICB2YXIgZGF0ZXBpY2tlciA9IGZ1bmN0aW9uKG5hbWUsIHNjaGVtYSwgb3B0aW9ucykge1xuICAgICAgaWYgKHNjaGVtYS50eXBlID09PSAnc3RyaW5nJyAmJiAoc2NoZW1hLmZvcm1hdCA9PT0gJ2RhdGUnIHx8IHNjaGVtYS5mb3JtYXQgPT09ICdkYXRlLXRpbWUnKSkge1xuICAgICAgICB2YXIgZiA9IHNjaGVtYUZvcm1Qcm92aWRlci5zdGRGb3JtT2JqKG5hbWUsIHNjaGVtYSwgb3B0aW9ucyk7XG4gICAgICAgIGYua2V5ICA9IG9wdGlvbnMucGF0aDtcbiAgICAgICAgZi50eXBlID0gJ2RhdGVwaWNrZXInO1xuICAgICAgICBvcHRpb25zLmxvb2t1cFtzZlBhdGhQcm92aWRlci5zdHJpbmdpZnkob3B0aW9ucy5wYXRoKV0gPSBmO1xuICAgICAgICByZXR1cm4gZjtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgc2NoZW1hRm9ybVByb3ZpZGVyLmRlZmF1bHRzLnN0cmluZy51bnNoaWZ0KGRhdGVwaWNrZXIpO1xuXG4gICAgLy9BZGQgdG8gdGhlIEZvdW5kYXRpb24gZGlyZWN0aXZlXG4gICAgc2NoZW1hRm9ybURlY29yYXRvcnNQcm92aWRlci5hZGRNYXBwaW5nKFxuICAgICAgJ2ZvdW5kYXRpb25EZWNvcmF0b3InLFxuICAgICAgJ2RhdGVwaWNrZXInLFxuICAgICAgJ2RpcmVjdGl2ZXMvZGVjb3JhdG9ycy9mb3VuZGF0aW9uL2RhdGVwaWNrZXIuaHRtbCdcbiAgICApO1xuICAgIHNjaGVtYUZvcm1EZWNvcmF0b3JzUHJvdmlkZXIuY3JlYXRlRGlyZWN0aXZlKFxuICAgICAgJ2RhdGVwaWNrZXInLFxuICAgICAgJ2RpcmVjdGl2ZXMvZGVjb3JhdG9ycy9mb3VuZGF0aW9uL2RhdGVwaWNrZXIuaHRtbCdcbiAgICApO1xuICB9XG5dKTtcbiIsInJlcXVpcmUoJy4vZm91bmRhdGlvbi1kZWNvcmF0b3ItZGF0ZXBpY2tlcicpO1xuYW5ndWxhci5tb2R1bGUoJ3NjaGVtYUZvcm0nKS5jb25maWcoWydzY2hlbWFGb3JtRGVjb3JhdG9yc1Byb3ZpZGVyJywgZnVuY3Rpb24oZGVjb3JhdG9yc1Byb3ZpZGVyKSB7XG4gIHZhciBiYXNlID0gJ3RlbXBsYXRlcy9zY2hlbWFGb3JtL2RpcmVjdGl2ZXMvZGVjb3JhdG9ycy9mb3VuZGF0aW9uLyc7XG5cbiAgZGVjb3JhdG9yc1Byb3ZpZGVyLmNyZWF0ZURlY29yYXRvcignZm91bmRhdGlvbkRlY29yYXRvcicsIHtcbiAgICB0ZXh0YXJlYTogYmFzZSArICd0ZXh0YXJlYS5odG1sJyxcbiAgICBmaWVsZHNldDogYmFzZSArICdmaWVsZHNldC5odG1sJyxcbiAgICBhcnJheTogYmFzZSArICdhcnJheS5odG1sJyxcbiAgICB0YWJhcnJheTogYmFzZSArICd0YWJhcnJheS5odG1sJyxcbiAgICB0YWJzOiBiYXNlICsgJ3RhYnMuaHRtbCcsXG4gICAgc2VjdGlvbjogYmFzZSArICdzZWN0aW9uLmh0bWwnLFxuICAgIGNvbmRpdGlvbmFsOiBiYXNlICsgJ3NlY3Rpb24uaHRtbCcsXG4gICAgYWN0aW9uczogYmFzZSArICdhY3Rpb25zLmh0bWwnLFxuICAgIGRhdGVwaWNrZXI6IGJhc2UgKyAnZGF0ZXBpY2tlci5odG1sJyxcbiAgICBzZWxlY3Q6IGJhc2UgKyAnc2VsZWN0Lmh0bWwnLFxuICAgIGNoZWNrYm94OiBiYXNlICsgJ2NoZWNrYm94Lmh0bWwnLFxuICAgIGNoZWNrYm94ZXM6IGJhc2UgKyAnY2hlY2tib3hlcy5odG1sJyxcbiAgICBudW1iZXI6IGJhc2UgKyAnZGVmYXVsdC5odG1sJyxcbiAgICBwYXNzd29yZDogYmFzZSArICdkZWZhdWx0Lmh0bWwnLFxuICAgIHN1Ym1pdDogYmFzZSArICdzdWJtaXQuaHRtbCcsXG4gICAgYnV0dG9uOiBiYXNlICsgJ3N1Ym1pdC5odG1sJyxcbiAgICByYWRpb3M6IGJhc2UgKyAncmFkaW9zLmh0bWwnLFxuICAgICdyYWRpb3MtaW5saW5lJzogYmFzZSArICdyYWRpb3MtaW5saW5lLmh0bWwnLFxuICAgIHJhZGlvYnV0dG9uczogYmFzZSArICdyYWRpby1idXR0b25zLmh0bWwnLFxuICAgIGhlbHA6IGJhc2UgKyAnaGVscC5odG1sJyxcbiAgICAnZGVmYXVsdCc6IGJhc2UgKyAnZGVmYXVsdC5odG1sJ1xuICB9LCBbXG4gICAgZnVuY3Rpb24oZm9ybSkge1xuICAgICAgaWYgKGZvcm0ucmVhZG9ubHkgJiYgZm9ybS5rZXkgJiYgZm9ybS50eXBlICE9PSAnZmllbGRzZXQnKSB7XG4gICAgICAgIHJldHVybiBiYXNlICsgJ3JlYWRvbmx5Lmh0bWwnO1xuICAgICAgfVxuICAgIH1cbiAgXSwgeyBjbGFzc05hbWU6IFwicm93XCIgfSk7XG5cbiAgLy9tYW51YWwgdXNlIGRpcmVjdGl2ZXNcbiAgZGVjb3JhdG9yc1Byb3ZpZGVyLmNyZWF0ZURpcmVjdGl2ZXMoe1xuICAgIHRleHRhcmVhOiBiYXNlICsgJ3RleHRhcmVhLmh0bWwnLFxuICAgIHNlbGVjdDogYmFzZSArICdzZWxlY3QuaHRtbCcsXG4gICAgY2hlY2tib3g6IGJhc2UgKyAnY2hlY2tib3guaHRtbCcsXG4gICAgY2hlY2tib3hlczogYmFzZSArICdjaGVja2JveGVzLmh0bWwnLFxuICAgIG51bWJlcjogYmFzZSArICdkZWZhdWx0Lmh0bWwnLFxuICAgIHN1Ym1pdDogYmFzZSArICdzdWJtaXQuaHRtbCcsXG4gICAgYnV0dG9uOiBiYXNlICsgJ3N1Ym1pdC5odG1sJyxcbiAgICB0ZXh0OiBiYXNlICsgJ2RlZmF1bHQuaHRtbCcsXG4gICAgZGF0ZTogYmFzZSArICdkZWZhdWx0Lmh0bWwnLFxuICAgIHBhc3N3b3JkOiBiYXNlICsgJ2RlZmF1bHQuaHRtbCcsXG4gICAgZGF0ZXBpY2tlcjogYmFzZSArICdkYXRlcGlja2VyLmh0bWwnLFxuICAgIGlucHV0OiBiYXNlICsgJ2RlZmF1bHQuaHRtbCcsXG4gICAgcmFkaW9zOiBiYXNlICsgJ3JhZGlvcy5odG1sJyxcbiAgICAncmFkaW9zLWlubGluZSc6IGJhc2UgKyAncmFkaW9zLWlubGluZS5odG1sJyxcbiAgICByYWRpb2J1dHRvbnM6IGJhc2UgKyAncmFkaW8tYnV0dG9ucy5odG1sJyxcbiAgfSk7XG5cbn1dKS5kaXJlY3RpdmUoJ3NmRmllbGRzZXQnLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHtcbiAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgIHNjb3BlOiB0cnVlLFxuICAgIHRlbXBsYXRlVXJsOiAnZGlyZWN0aXZlcy9kZWNvcmF0b3JzL2ZvdW5kYXRpb24vZmllbGRzZXQtdHJjbC5odG1sJyxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgIHNjb3BlLnRpdGxlID0gc2NvcGUuJGV2YWwoYXR0cnMudGl0bGUpO1xuICAgIH1cbiAgfTtcbn0pO1xuIiwiZnVuY3Rpb24gaXNPYmplY3Qob2JqKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIG9iajtcbiAgcmV0dXJuIHR5cGUgPT09ICdmdW5jdGlvbicgfHwgdHlwZSA9PT0gJ29iamVjdCcgJiYgISFvYmo7XG59O1xuXG5cbiBmdW5jdGlvbiBleHRlbmQob2JqKSB7XG4gIGlmICghaXNPYmplY3Qob2JqKSkgcmV0dXJuIG9iajtcbiAgdmFyIHNvdXJjZSwgcHJvcDtcbiAgZm9yICh2YXIgaSA9IDEsIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTtcbiAgICBmb3IgKHByb3AgaW4gc291cmNlKSB7XG4gICAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIHByb3ApKSB7XG4gICAgICAgICAgb2JqW3Byb3BdID0gc291cmNlW3Byb3BdO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gb2JqO1xufTtcblxuZnVuY3Rpb24gb21pdChvYmogLyoga2V5cyAqLykge1xuICB2YXIgd2l0aG91dEtleXMgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gIHJldHVybiBvYmogJiYgT2JqZWN0LmtleXMob2JqKS5yZWR1Y2UoZnVuY3Rpb24ocywgaykge1xuICAgIGlmICh3aXRob3V0S2V5cy5pbmRleE9mKGspID09PSAtMSkgc1trXSA9IG9ialtrXVxuICAgIHJldHVybiBzO1xuICB9LCB7fSk7XG59O1xuXG5mdW5jdGlvbiBkZWVwQ2xvbmUob2JqKSB7XG4gIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9iaikpO1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBleHRlbmQ6IGV4dGVuZCxcbiAgb21pdDogb21pdCxcbiAgaXNPYmplY3Q6IGlzT2JqZWN0LFxuICBkZWVwQ2xvbmU6IGRlZXBDbG9uZVxufTtcbiJdfQ==
