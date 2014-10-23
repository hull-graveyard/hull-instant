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
    templateUrl: "directives/progress.html",
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
  var base = 'directives/decorators/foundation/';

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvamF2YXNjcmlwdC9hcHAuanMiLCJub2RlX21vZHVsZXMvYW5ndWxhci1zY2hlbWEtZm9ybS9kaXN0L3NjaGVtYS1mb3JtLmpzIiwibm9kZV9tb2R1bGVzL29iamVjdHBhdGgvaW5kZXguanMiLCJub2RlX21vZHVsZXMvb2JqZWN0cGF0aC9saWIvT2JqZWN0UGF0aC5qcyIsIm5vZGVfbW9kdWxlcy90djQvdHY0LmpzIiwic3JjL2phdmFzY3JpcHQvaW5zdGFudC5qcyIsInNyYy9qYXZhc2NyaXB0L3NjaGVtYS1mb3JtL2ZvdW5kYXRpb24tZGVjb3JhdG9yLWRhdGVwaWNrZXIuanMiLCJzcmMvamF2YXNjcmlwdC9zY2hlbWEtZm9ybS9mb3VuZGF0aW9uLWRlY29yYXRvci5qcyIsInNyYy9qYXZhc2NyaXB0L3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0NENBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2psREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBJbnN0YW50V2luID0gcmVxdWlyZSgnLi9pbnN0YW50Jyk7XG52YXIgU3RlcHMgPSBJbnN0YW50V2luLlN0ZXBzO1xudmFyIGRlZmF1bHRTdGVwID0gU3RlcHNbMF07XG5cbndpbmRvdy50djQgPSByZXF1aXJlKCd0djQnKTtcbnZhciBPYmplY3RQYXRoID0gcmVxdWlyZSgnb2JqZWN0cGF0aCcpO1xuXG50cnkge1xuICBhbmd1bGFyLm1vZHVsZSgnT2JqZWN0UGF0aCcsIFtdKS5wcm92aWRlcignT2JqZWN0UGF0aCcsIGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5wYXJzZSA9IE9iamVjdFBhdGgucGFyc2U7XG4gICAgdGhpcy5zdHJpbmdpZnkgPSBPYmplY3RQYXRoLnN0cmluZ2lmeTtcbiAgICB0aGlzLm5vcm1hbGl6ZSA9IE9iamVjdFBhdGgubm9ybWFsaXplO1xuICAgIHRoaXMuJGdldCA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gT2JqZWN0UGF0aDtcbiAgICB9O1xuICB9KTtcbn0gY2F0Y2goZSkge31cblxucmVxdWlyZSgnYW5ndWxhci1zY2hlbWEtZm9ybS9kaXN0L3NjaGVtYS1mb3JtJyk7XG5yZXF1aXJlKCcuL3NjaGVtYS1mb3JtL2ZvdW5kYXRpb24tZGVjb3JhdG9yJyk7XG5yZXF1aXJlKCcuL3NjaGVtYS1mb3JtL2ZvdW5kYXRpb24tZGVjb3JhdG9yLWRhdGVwaWNrZXInKTtcblxudmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdodWxsLWluc3RhbnQnLCBbJ25nQW5pbWF0ZScsICdzY2hlbWFGb3JtJ10pXG5cbi5mYWN0b3J5KFwiJGluc3RhbnRcIiwgW1wiJGh1bGxJbml0XCIsIGZ1bmN0aW9uKCRodWxsSW5pdCkge1xuICB2YXIgaW5zdGFudCA9IG5ldyBJbnN0YW50V2luKCRodWxsSW5pdC51c2VyLCAkaHVsbEluaXQuc2hpcCk7XG4gIHdpbmRvdy4kaW5zdGFudCA9IGluc3RhbnQ7XG4gIHJldHVybiBpbnN0YW50O1xufV0pXG5cbi5kaXJlY3RpdmUoXCJwcm9ncmVzc1wiLCBmdW5jdGlvbigpe1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiBcIkFcIixcbiAgICBzY29wZTogeyBzdGVwOiBcIj1cIiwgc3RlcHM6IFwiPVwiLCBzdGVwSW5kZXg6IFwiPVwiIH0sXG4gICAgdGVtcGxhdGVVcmw6IFwiZGlyZWN0aXZlcy9wcm9ncmVzcy5odG1sXCIsXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlKSB7XG4gICAgICAkc2NvcGUucHJvZ3Jlc3NSYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAxMDAgKiAoJHNjb3BlLnN0ZXBJbmRleCArIDEpIC8gKCRzY29wZS5zdGVwcy5sZW5ndGggKyAxKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59KVxuXG4uY29udHJvbGxlcignRm9ybUNvbnRyb2xsZXInLCBbJyRzY29wZScsICckaW5zdGFudCcsIGZ1bmN0aW9uKCRzY29wZSkge1xuICAkc2NvcGUubW9kZWwgPSB7fTtcbiAgdmFyIGZpZWxkcyA9ICgkc2NvcGUuaW5zdGFudC5mb3JtICYmICRzY29wZS5pbnN0YW50LmZvcm0uZmllbGRzX2xpc3QpIHx8IFtdO1xuICBhbmd1bGFyLmZvckVhY2goZmllbGRzLCBmdW5jdGlvbihmaWVsZCkge1xuICAgICRzY29wZS5tb2RlbFtmaWVsZC5uYW1lXSA9IGZpZWxkLnZhbHVlO1xuICB9KTtcbiAgJHNjb3BlLnNjaGVtYSA9ICRzY29wZS5pbnN0YW50LmZvcm0uZmllbGRzX3NjaGVtYTtcbiAgJHNjb3BlLmZvcm0gPSBbXG4gICAge1xuICAgICAgXCJ0eXBlXCI6IFwiZmllbGRzZXRcIixcbiAgICAgIFwidGl0bGVcIiA6IFwiRm9ybVwiLFxuICAgICAgXCJpdGVtc1wiIDogWyBcIipcIiBdLFxuICAgIH0sXG4gICAgeyBcInR5cGVcIjogXCJzdWJtaXRcIiwgXCJ0aXRsZVwiOiBcIlNhdmVcIiwgXCJzdHlsZVwiOlwiXCIgfVxuICBdO1xuXG4gICRzY29wZS5vblN1Ym1pdCA9IGZ1bmN0aW9uKGZvcm0pIHtcbiAgICAvLyBGaXJzdCB3ZSBicm9hZGNhc3QgYW4gZXZlbnQgc28gYWxsIGZpZWxkcyB2YWxpZGF0ZSB0aGVtc2VsdmVzXG4gICAgJHNjb3BlLiRicm9hZGNhc3QoJ3NjaGVtYUZvcm1WYWxpZGF0ZScpO1xuXG4gICAgLy8gVGhlbiB3ZSBjaGVjayBpZiB0aGUgZm9ybSBpcyB2YWxpZFxuICAgIGlmIChmb3JtLiR2YWxpZCkge1xuICAgICAgJGluc3RhbnQuc3VibWl0Rm9ybSgkc2NvcGUubW9kZWwpO1xuICAgIH1cbiAgfVxufV0pXG5cbi5jb250cm9sbGVyKCdJbnN0YW50V2luQ29udHJvbGxlcicsWyckc2NvcGUnLCAnJGluc3RhbnQnLFxuICBmdW5jdGlvbiBJbnN0YW50V2luQ29udHJvbGxlcigkc2NvcGUsICRpbnN0YW50KSB7XG5cbiAgICAkc2NvcGUubG9naW4gICAgPSBIdWxsLmxvZ2luO1xuICAgICRzY29wZS5sb2dvdXQgICA9IEh1bGwubG9nb3V0O1xuICAgICRzY29wZS5wbGF5ICAgICA9ICRpbnN0YW50LnBsYXk7XG5cbiAgICAkc2NvcGUuc3RlcHMgPSBTdGVwcztcbiAgICAkc2NvcGUuJGluc3RhbnQgPSAkaW5zdGFudDtcbiAgICAkc2NvcGUuaW5zdGFudCAgPSAkaW5zdGFudC5nZXRTdGF0ZSgpO1xuXG4gICAgZnVuY3Rpb24gb25DaGFuZ2UoaW5zdGFudCkge1xuICAgICAgJHNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcbiAgICAgICAgJHNjb3BlLmluc3RhbnQgPSBpbnN0YW50O1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgJGluc3RhbnQub25DaGFuZ2Uob25DaGFuZ2UpO1xuICB9XG5dKTtcblxuXG5IdWxsLnJlYWR5KGZ1bmN0aW9uKF8sIGN1cnJlbnRVc2VyLCBzaGlwLCBvcmcpIHtcbiAgdmFyIEh1bGxJbml0ID0ge1xuICAgIHVzZXI6IGN1cnJlbnRVc2VyLFxuICAgIHNoaXA6IHNoaXAsXG4gICAgb3JnOiBvcmdcbiAgfTtcblxuICBhcHAudmFsdWUoJyRodWxsSW5pdCcsIEh1bGxJbml0KTtcbiAgYW5ndWxhci5ib290c3RyYXAoZG9jdW1lbnQsIFsnaHVsbC1pbnN0YW50J10pO1xufSk7XG4iLCIvLyBEZXBzIGlzIHNvcnQgb2YgYSBwcm9ibGVtIGZvciB1cywgbWF5YmUgaW4gdGhlIGZ1dHVyZSB3ZSB3aWxsIGFzayB0aGUgdXNlciB0byBkZXBlbmRcbi8vIG9uIG1vZHVsZXMgZm9yIGFkZC1vbnNcblxudmFyIGRlcHMgPSBbJ09iamVjdFBhdGgnXTtcbnRyeSB7XG4gIC8vVGhpcyB0aHJvd3MgYW4gZXhwZWN0aW9uIGlmIG1vZHVsZSBkb2VzIG5vdCBleGlzdC5cbiAgYW5ndWxhci5tb2R1bGUoJ25nU2FuaXRpemUnKTtcbiAgZGVwcy5wdXNoKCduZ1Nhbml0aXplJyk7XG59IGNhdGNoIChlKSB7fVxuXG50cnkge1xuICAvL1RoaXMgdGhyb3dzIGFuIGV4cGVjdGlvbiBpZiBtb2R1bGUgZG9lcyBub3QgZXhpc3QuXG4gIGFuZ3VsYXIubW9kdWxlKCd1aS5zb3J0YWJsZScpO1xuICBkZXBzLnB1c2goJ3VpLnNvcnRhYmxlJyk7XG59IGNhdGNoIChlKSB7fVxuXG50cnkge1xuICAvL1RoaXMgdGhyb3dzIGFuIGV4cGVjdGlvbiBpZiBtb2R1bGUgZG9lcyBub3QgZXhpc3QuXG4gIGFuZ3VsYXIubW9kdWxlKCdhbmd1bGFyU3BlY3RydW1Db2xvcnBpY2tlcicpO1xuICBkZXBzLnB1c2goJ2FuZ3VsYXJTcGVjdHJ1bUNvbG9ycGlja2VyJyk7XG59IGNhdGNoIChlKSB7fVxuXG5hbmd1bGFyLm1vZHVsZSgnc2NoZW1hRm9ybScsIGRlcHMpO1xuXG5hbmd1bGFyLm1vZHVsZSgnc2NoZW1hRm9ybScpLnByb3ZpZGVyKCdzZlBhdGgnLFxuWydPYmplY3RQYXRoUHJvdmlkZXInLCBmdW5jdGlvbihPYmplY3RQYXRoUHJvdmlkZXIpIHtcbiAgdmFyIE9iamVjdFBhdGggPSB7cGFyc2U6IE9iamVjdFBhdGhQcm92aWRlci5wYXJzZX07XG5cbiAgLy8gaWYgd2UncmUgb24gQW5ndWxhciAxLjIueCwgd2UgbmVlZCB0byBjb250aW51ZSB1c2luZyBkb3Qgbm90YXRpb25cbiAgaWYgKGFuZ3VsYXIudmVyc2lvbi5tYWpvciA9PT0gMSAmJiBhbmd1bGFyLnZlcnNpb24ubWlub3IgPCAzKSB7XG4gICAgT2JqZWN0UGF0aC5zdHJpbmdpZnkgPSBmdW5jdGlvbihhcnIpIHtcbiAgICAgIHJldHVybiBBcnJheS5pc0FycmF5KGFycikgPyBhcnIuam9pbignLicpIDogYXJyLnRvU3RyaW5nKCk7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICBPYmplY3RQYXRoLnN0cmluZ2lmeSA9IE9iamVjdFBhdGhQcm92aWRlci5zdHJpbmdpZnk7XG4gIH1cblxuICAvLyBXZSB3YW50IHRoaXMgdG8gdXNlIHdoaWNoZXZlciBzdHJpbmdpZnkgbWV0aG9kIGlzIGRlZmluZWQgYWJvdmUsXG4gIC8vIHNvIHdlIGhhdmUgdG8gY29weSB0aGUgY29kZSBoZXJlLlxuICBPYmplY3RQYXRoLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKGRhdGEsIHF1b3RlKSB7XG4gICAgcmV0dXJuIE9iamVjdFBhdGguc3RyaW5naWZ5KEFycmF5LmlzQXJyYXkoZGF0YSkgPyBkYXRhIDogT2JqZWN0UGF0aC5wYXJzZShkYXRhKSwgcXVvdGUpO1xuICB9O1xuXG4gIHRoaXMucGFyc2UgPSBPYmplY3RQYXRoLnBhcnNlO1xuICB0aGlzLnN0cmluZ2lmeSA9IE9iamVjdFBhdGguc3RyaW5naWZ5O1xuICB0aGlzLm5vcm1hbGl6ZSA9IE9iamVjdFBhdGgubm9ybWFsaXplO1xuICB0aGlzLiRnZXQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gT2JqZWN0UGF0aDtcbiAgfTtcbn1dKTtcblxuLyoqXG4gKiBAbmdkb2Mgc2VydmljZVxuICogQG5hbWUgc2ZTZWxlY3RcbiAqIEBraW5kIGZ1bmN0aW9uXG4gKlxuICovXG5hbmd1bGFyLm1vZHVsZSgnc2NoZW1hRm9ybScpLmZhY3RvcnkoJ3NmU2VsZWN0JywgWydzZlBhdGgnLCBmdW5jdGlvbihzZlBhdGgpIHtcbiAgdmFyIG51bVJlID0gL15cXGQrJC87XG5cbiAgLyoqXG4gICAgKiBAZGVzY3JpcHRpb25cbiAgICAqIFV0aWxpdHkgbWV0aG9kIHRvIGFjY2VzcyBkZWVwIHByb3BlcnRpZXMgd2l0aG91dFxuICAgICogdGhyb3dpbmcgZXJyb3JzIHdoZW4gdGhpbmdzIGFyZSBub3QgZGVmaW5lZC5cbiAgICAqIENhbiBhbHNvIHNldCBhIHZhbHVlIGluIGEgZGVlcCBzdHJ1Y3R1cmUsIGNyZWF0aW5nIG9iamVjdHMgd2hlbiBtaXNzaW5nXG4gICAgKiBleC5cbiAgICAqIHZhciBmb28gPSBTZWxlY3QoJ2FkZHJlc3MuY29udGFjdC5uYW1lJyxvYmopXG4gICAgKiBTZWxlY3QoJ2FkZHJlc3MuY29udGFjdC5uYW1lJyxvYmosJ0xlZXJveScpXG4gICAgKlxuICAgICogQHBhcmFtIHtzdHJpbmd9IHByb2plY3Rpb24gQSBkb3QgcGF0aCB0byB0aGUgcHJvcGVydHkgeW91IHdhbnQgdG8gZ2V0L3NldFxuICAgICogQHBhcmFtIHtvYmplY3R9IG9iaiAgIChvcHRpb25hbCkgVGhlIG9iamVjdCB0byBwcm9qZWN0IG9uLCBkZWZhdWx0cyB0byAndGhpcydcbiAgICAqIEBwYXJhbSB7QW55fSAgICB2YWx1ZVRvU2V0IChvcGlvbmFsKSAgVGhlIHZhbHVlIHRvIHNldCwgaWYgcGFydHMgb2YgdGhlIHBhdGggb2ZcbiAgICAqICAgICAgICAgICAgICAgICB0aGUgcHJvamVjdGlvbiBpcyBtaXNzaW5nIGVtcHR5IG9iamVjdHMgd2lsbCBiZSBjcmVhdGVkLlxuICAgICogQHJldHVybnMge0FueXx1bmRlZmluZWR9IHJldHVybnMgdGhlIHZhbHVlIGF0IHRoZSBlbmQgb2YgdGhlIHByb2plY3Rpb24gcGF0aFxuICAgICogICAgICAgICAgICAgICAgICAgICAgICAgIG9yIHVuZGVmaW5lZCBpZiB0aGVyZSBpcyBub25lLlxuICAgICovXG4gIHJldHVybiBmdW5jdGlvbihwcm9qZWN0aW9uLCBvYmosIHZhbHVlVG9TZXQpIHtcbiAgICBpZiAoIW9iaikge1xuICAgICAgb2JqID0gdGhpcztcbiAgICB9XG4gICAgLy9TdXBwb3J0IFtdIGFycmF5IHN5bnRheFxuICAgIHZhciBwYXJ0cyA9IHR5cGVvZiBwcm9qZWN0aW9uID09PSAnc3RyaW5nJyA/IHNmUGF0aC5wYXJzZShwcm9qZWN0aW9uKSA6IHByb2plY3Rpb247XG5cbiAgICBpZiAodHlwZW9mIHZhbHVlVG9TZXQgIT09ICd1bmRlZmluZWQnICYmIHBhcnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgLy9zcGVjaWFsIGNhc2UsIGp1c3Qgc2V0dGluZyBvbmUgdmFyaWFibGVcbiAgICAgIG9ialtwYXJ0c1swXV0gPSB2YWx1ZVRvU2V0O1xuICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHZhbHVlVG9TZXQgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICAgIHR5cGVvZiBvYmpbcGFydHNbMF1dID09PSAndW5kZWZpbmVkJykge1xuICAgICAgIC8vIFdlIG5lZWQgdG8gbG9vayBhaGVhZCB0byBjaGVjayBpZiBhcnJheSBpcyBhcHByb3ByaWF0ZVxuICAgICAgb2JqW3BhcnRzWzBdXSA9IHBhcnRzLmxlbmd0aCA+IDIgJiYgbnVtUmUudGVzdChwYXJ0c1sxXSkgPyBbXSA6IHt9O1xuICAgIH1cblxuICAgIHZhciB2YWx1ZSA9IG9ialtwYXJ0c1swXV07XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBwYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgICAgLy8gU3BlY2lhbCBjYXNlOiBXZSBhbGxvdyBKU09OIEZvcm0gc3ludGF4IGZvciBhcnJheXMgdXNpbmcgZW1wdHkgYnJhY2tldHNcbiAgICAgIC8vIFRoZXNlIHdpbGwgb2YgY291cnNlIG5vdCB3b3JrIGhlcmUgc28gd2UgZXhpdCBpZiB0aGV5IGFyZSBmb3VuZC5cbiAgICAgIGlmIChwYXJ0c1tpXSA9PT0gJycpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgdmFsdWVUb1NldCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgaWYgKGkgPT09IHBhcnRzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAvL2xhc3Qgc3RlcC4gTGV0J3Mgc2V0IHRoZSB2YWx1ZVxuICAgICAgICAgIHZhbHVlW3BhcnRzW2ldXSA9IHZhbHVlVG9TZXQ7XG4gICAgICAgICAgcmV0dXJuIHZhbHVlVG9TZXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gTWFrZSBzdXJlIHRvIGNyZWF0ZSBuZXcgb2JqZWN0cyBvbiB0aGUgd2F5IGlmIHRoZXkgYXJlIG5vdCB0aGVyZS5cbiAgICAgICAgICAvLyBXZSBuZWVkIHRvIGxvb2sgYWhlYWQgdG8gY2hlY2sgaWYgYXJyYXkgaXMgYXBwcm9wcmlhdGVcbiAgICAgICAgICB2YXIgdG1wID0gdmFsdWVbcGFydHNbaV1dO1xuICAgICAgICAgIGlmICh0eXBlb2YgdG1wID09PSAndW5kZWZpbmVkJyB8fCB0bXAgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRtcCA9IG51bVJlLnRlc3QocGFydHNbaSArIDFdKSA/IFtdIDoge307XG4gICAgICAgICAgICB2YWx1ZVtwYXJ0c1tpXV0gPSB0bXA7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhbHVlID0gdG1wO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHZhbHVlKSB7XG4gICAgICAgIC8vSnVzdCBnZXQgbmV4IHZhbHVlLlxuICAgICAgICB2YWx1ZSA9IHZhbHVlW3BhcnRzW2ldXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xufV0pO1xuXG5hbmd1bGFyLm1vZHVsZSgnc2NoZW1hRm9ybScpLnByb3ZpZGVyKCdzY2hlbWFGb3JtRGVjb3JhdG9ycycsXG5bJyRjb21waWxlUHJvdmlkZXInLCAnc2ZQYXRoUHJvdmlkZXInLCBmdW5jdGlvbigkY29tcGlsZVByb3ZpZGVyLCBzZlBhdGhQcm92aWRlcikge1xuICB2YXIgZGVmYXVsdERlY29yYXRvciA9ICcnO1xuICB2YXIgZGlyZWN0aXZlcyA9IHt9O1xuXG4gIHZhciB0ZW1wbGF0ZVVybCA9IGZ1bmN0aW9uKG5hbWUsIGZvcm0pIHtcbiAgICAvL3NjaGVtYURlY29yYXRvciBpcyBhbGlhcyBmb3Igd2hhdGV2ZXIgaXMgc2V0IGFzIGRlZmF1bHRcbiAgICBpZiAobmFtZSA9PT0gJ3NmRGVjb3JhdG9yJykge1xuICAgICAgbmFtZSA9IGRlZmF1bHREZWNvcmF0b3I7XG4gICAgfVxuXG4gICAgdmFyIGRpcmVjdGl2ZSA9IGRpcmVjdGl2ZXNbbmFtZV07XG5cbiAgICAvL3J1bGVzIGZpcnN0XG4gICAgdmFyIHJ1bGVzID0gZGlyZWN0aXZlLnJ1bGVzO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcnVsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciByZXMgPSBydWxlc1tpXShmb3JtKTtcbiAgICAgIGlmIChyZXMpIHtcbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvL3RoZW4gY2hlY2sgbWFwcGluZ1xuICAgIGlmIChkaXJlY3RpdmUubWFwcGluZ3NbZm9ybS50eXBlXSkge1xuICAgICAgcmV0dXJuIGRpcmVjdGl2ZS5tYXBwaW5nc1tmb3JtLnR5cGVdO1xuICAgIH1cblxuICAgIC8vdHJ5IGRlZmF1bHRcbiAgICByZXR1cm4gZGlyZWN0aXZlLm1hcHBpbmdzWydkZWZhdWx0J107XG4gIH07XG5cbiAgdmFyIGNyZWF0ZURpcmVjdGl2ZSA9IGZ1bmN0aW9uKG5hbWUsIG9wdGlvbnMpIHtcbiAgICAkY29tcGlsZVByb3ZpZGVyLmRpcmVjdGl2ZShuYW1lLCBbJyRwYXJzZScsICckY29tcGlsZScsICckaHR0cCcsICckdGVtcGxhdGVDYWNoZScsXG4gICAgICBmdW5jdGlvbigkcGFyc2UsICAkY29tcGlsZSwgICRodHRwLCAgJHRlbXBsYXRlQ2FjaGUpIHtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHJlc3RyaWN0OiAnQUUnLFxuICAgICAgICAgIHJlcGxhY2U6IGZhbHNlLFxuICAgICAgICAgIHRyYW5zY2x1ZGU6IGZhbHNlLFxuICAgICAgICAgIHNjb3BlOiB0cnVlLFxuICAgICAgICAgIHJlcXVpcmU6ICc/XnNmU2NoZW1hJyxcbiAgICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIHNmU2NoZW1hKSB7XG4gICAgICAgICAgICAvL3JlYmluZCBvdXIgcGFydCBvZiB0aGUgZm9ybSB0byB0aGUgc2NvcGUuXG4gICAgICAgICAgICB2YXIgb25jZSA9IHNjb3BlLiR3YXRjaChhdHRycy5mb3JtLCBmdW5jdGlvbihmb3JtKSB7XG5cbiAgICAgICAgICAgICAgaWYgKGZvcm0pIHtcbiAgICAgICAgICAgICAgICBzY29wZS5mb3JtICA9IGZvcm07XG5cbiAgICAgICAgICAgICAgICAvL29rIGxldCdzIHJlcGxhY2UgdGhhdCB0ZW1wbGF0ZSFcbiAgICAgICAgICAgICAgICAvL1dlIGRvIHRoaXMgbWFudWFsbHkgc2luY2Ugd2UgbmVlZCB0byBiaW5kIG5nLW1vZGVsIHByb3Blcmx5IGFuZCBhbHNvXG4gICAgICAgICAgICAgICAgLy9mb3IgZmllbGRzZXRzIHRvIHJlY3Vyc2UgcHJvcGVybHkuXG4gICAgICAgICAgICAgICAgdmFyIHVybCA9IHRlbXBsYXRlVXJsKG5hbWUsIGZvcm0pO1xuICAgICAgICAgICAgICAgICRodHRwLmdldCh1cmwsIHtjYWNoZTogJHRlbXBsYXRlQ2FjaGV9KS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IGZvcm0ua2V5ID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZlBhdGhQcm92aWRlci5zdHJpbmdpZnkoZm9ybS5rZXkpLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKSA6ICcnO1xuICAgICAgICAgICAgICAgICAgdmFyIHRlbXBsYXRlID0gcmVzLmRhdGEucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgL1xcJFxcJHZhbHVlXFwkXFwkL2csXG4gICAgICAgICAgICAgICAgICAgICdtb2RlbCcgKyAoa2V5WzBdICE9PSAnWycgPyAnLicgOiAnJykgKyBrZXlcbiAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICAgICAgICBcdGVsZW1lbnQuYWRkQ2xhc3Mob3B0aW9ucy5jbGFzc05hbWUpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgZWxlbWVudC5odG1sKHRlbXBsYXRlKTtcbiAgICAgICAgICAgICAgICAgICRjb21waWxlKGVsZW1lbnQuY29udGVudHMoKSkoc2NvcGUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIG9uY2UoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vS2VlcCBlcnJvciBwcm9uZSBsb2dpYyBmcm9tIHRoZSB0ZW1wbGF0ZVxuICAgICAgICAgICAgc2NvcGUuc2hvd1RpdGxlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBzY29wZS5mb3JtICYmIHNjb3BlLmZvcm0ubm90aXRsZSAhPT0gdHJ1ZSAmJiBzY29wZS5mb3JtLnRpdGxlO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2NvcGUubGlzdFRvQ2hlY2tib3hWYWx1ZXMgPSBmdW5jdGlvbihsaXN0KSB7XG4gICAgICAgICAgICAgIHZhciB2YWx1ZXMgPSB7fTtcbiAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGxpc3QsIGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZXNbdl0gPSB0cnVlO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlcztcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNjb3BlLmNoZWNrYm94VmFsdWVzVG9MaXN0ID0gZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgICAgICAgIHZhciBsc3QgPSBbXTtcbiAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHZhbHVlcywgZnVuY3Rpb24odiwgaykge1xuICAgICAgICAgICAgICAgIGlmICh2KSB7XG4gICAgICAgICAgICAgICAgICBsc3QucHVzaChrKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICByZXR1cm4gbHN0O1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2NvcGUuYnV0dG9uQ2xpY2sgPSBmdW5jdGlvbigkZXZlbnQsIGZvcm0pIHtcbiAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNGdW5jdGlvbihmb3JtLm9uQ2xpY2spKSB7XG4gICAgICAgICAgICAgICAgZm9ybS5vbkNsaWNrKCRldmVudCwgZm9ybSk7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoYW5ndWxhci5pc1N0cmluZyhmb3JtLm9uQ2xpY2spKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNmU2NoZW1hKSB7XG4gICAgICAgICAgICAgICAgICAvL2V2YWx1YXRpbmcgaW4gc2NvcGUgb3V0c2lkZSBvZiBzZlNjaGVtYXMgaXNvbGF0ZWQgc2NvcGVcbiAgICAgICAgICAgICAgICAgIHNmU2NoZW1hLmV2YWxJblBhcmVudFNjb3BlKGZvcm0ub25DbGljaywgeyckZXZlbnQnOiAkZXZlbnQsIGZvcm06IGZvcm19KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgc2NvcGUuJGV2YWwoZm9ybS5vbkNsaWNrLCB7JyRldmVudCc6ICRldmVudCwgZm9ybTogZm9ybX0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBFdmFsdWF0ZSBhbiBleHByZXNzaW9uLCBpLmUuIHNjb3BlLiRldmFsXG4gICAgICAgICAgICAgKiBidXQgZG8gaXQgaW4gc2ZTY2hlbWFzIHBhcmVudCBzY29wZSBzZi1zY2hlbWEgZGlyZWN0aXZlIGlzIHVzZWRcbiAgICAgICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBleHByZXNzaW9uXG4gICAgICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gbG9jYWxzIChvcHRpb25hbClcbiAgICAgICAgICAgICAqIEByZXR1cm4ge0FueX0gdGhlIHJlc3VsdCBvZiB0aGUgZXhwcmVzc2lvblxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBzY29wZS5ldmFsRXhwciA9IGZ1bmN0aW9uKGV4cHJlc3Npb24sIGxvY2Fscykge1xuICAgICAgICAgICAgICBpZiAoc2ZTY2hlbWEpIHtcbiAgICAgICAgICAgICAgICAvL2V2YWx1YXRpbmcgaW4gc2NvcGUgb3V0c2lkZSBvZiBzZlNjaGVtYXMgaXNvbGF0ZWQgc2NvcGVcbiAgICAgICAgICAgICAgICByZXR1cm4gc2ZTY2hlbWEuZXZhbEluUGFyZW50U2NvcGUoZXhwcmVzc2lvbiwgbG9jYWxzKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHJldHVybiBzY29wZS4kZXZhbChleHByZXNzaW9uLCBsb2NhbHMpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBFdmFsdWF0ZSBhbiBleHByZXNzaW9uLCBpLmUuIHNjb3BlLiRldmFsXG4gICAgICAgICAgICAgKiBpbiB0aGlzIGRlY29yYXRvcnMgc2NvcGVcbiAgICAgICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBleHByZXNzaW9uXG4gICAgICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gbG9jYWxzIChvcHRpb25hbClcbiAgICAgICAgICAgICAqIEByZXR1cm4ge0FueX0gdGhlIHJlc3VsdCBvZiB0aGUgZXhwcmVzc2lvblxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBzY29wZS5ldmFsSW5TY29wZSA9IGZ1bmN0aW9uKGV4cHJlc3Npb24sIGxvY2Fscykge1xuICAgICAgICAgICAgICBpZiAoZXhwcmVzc2lvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBzY29wZS4kZXZhbChleHByZXNzaW9uLCBsb2NhbHMpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEVycm9yIG1lc3NhZ2UgaGFuZGxlclxuICAgICAgICAgICAgICogQW4gZXJyb3IgY2FuIGVpdGhlciBiZSBhIHNjaGVtYSB2YWxpZGF0aW9uIG1lc3NhZ2Ugb3IgYSBhbmd1bGFyIGpzIHZhbGlkdGlvblxuICAgICAgICAgICAgICogZXJyb3IgKGkuZS4gcmVxdWlyZWQpXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHNjb3BlLmVycm9yTWVzc2FnZSA9IGZ1bmN0aW9uKHNjaGVtYUVycm9yKSB7XG4gICAgICAgICAgICAgIC8vVXNlciBoYXMgc3VwcGxpZWQgdmFsaWRhdGlvbiBtZXNzYWdlc1xuICAgICAgICAgICAgICBpZiAoc2NvcGUuZm9ybS52YWxpZGF0aW9uTWVzc2FnZSkge1xuICAgICAgICAgICAgICAgIGlmIChzY2hlbWFFcnJvcikge1xuICAgICAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNTdHJpbmcoc2NvcGUuZm9ybS52YWxpZGF0aW9uTWVzc2FnZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNjb3BlLmZvcm0udmFsaWRhdGlvbk1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIHJldHVybiBzY29wZS5mb3JtLnZhbGlkYXRpb25NZXNzYWdlW3NjaGVtYUVycm9yLmNvZGVdIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuZm9ybS52YWxpZGF0aW9uTWVzc2FnZVsnZGVmYXVsdCddO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gc2NvcGUuZm9ybS52YWxpZGF0aW9uTWVzc2FnZS5udW1iZXIgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5mb3JtLnZhbGlkYXRpb25NZXNzYWdlWydkZWZhdWx0J10gfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5mb3JtLnZhbGlkYXRpb25NZXNzYWdlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vTm8gdXNlciBzdXBwbGllZCB2YWxpZGF0aW9uIG1lc3NhZ2UuXG4gICAgICAgICAgICAgIGlmIChzY2hlbWFFcnJvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBzY2hlbWFFcnJvci5tZXNzYWdlOyAvL3VzZSB0djQuanMgdmFsaWRhdGlvbiBtZXNzYWdlXG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvL090aGVyd2lzZSB3ZSBvbmx5IGhhdmUgaW5wdXQgbnVtYmVyIG5vdCBiZWluZyBhIG51bWJlclxuICAgICAgICAgICAgICByZXR1cm4gJ05vdCBhIG51bWJlcic7XG5cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIF0pO1xuICB9O1xuXG4gIHZhciBjcmVhdGVNYW51YWxEaXJlY3RpdmUgPSBmdW5jdGlvbih0eXBlLCB0ZW1wbGF0ZVVybCwgdHJhbnNjbHVkZSkge1xuICAgIHRyYW5zY2x1ZGUgPSBhbmd1bGFyLmlzRGVmaW5lZCh0cmFuc2NsdWRlKSA/IHRyYW5zY2x1ZGUgOiBmYWxzZTtcbiAgICAkY29tcGlsZVByb3ZpZGVyLmRpcmVjdGl2ZSgnc2YnICsgYW5ndWxhci51cHBlcmNhc2UodHlwZVswXSkgKyB0eXBlLnN1YnN0cigxKSwgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0VBQycsXG4gICAgICAgIHNjb3BlOiB0cnVlLFxuICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICB0cmFuc2NsdWRlOiB0cmFuc2NsdWRlLFxuICAgICAgICB0ZW1wbGF0ZTogJzxzZi1kZWNvcmF0b3IgZm9ybT1cImZvcm1cIj48L3NmLWRlY29yYXRvcj4nLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICB2YXIgd2F0Y2hUaGlzID0ge1xuICAgICAgICAgICAgJ2l0ZW1zJzogJ2MnLFxuICAgICAgICAgICAgJ3RpdGxlTWFwJzogJ2MnLFxuICAgICAgICAgICAgJ3NjaGVtYSc6ICdjJ1xuICAgICAgICAgIH07XG4gICAgICAgICAgdmFyIGZvcm0gPSB7dHlwZTogdHlwZX07XG4gICAgICAgICAgdmFyIG9uY2UgPSB0cnVlO1xuICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChhdHRycywgZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgICAgICAgIGlmIChuYW1lWzBdICE9PSAnJCcgJiYgbmFtZS5pbmRleE9mKCduZycpICE9PSAwICYmIG5hbWUgIT09ICdzZkZpZWxkJykge1xuXG4gICAgICAgICAgICAgIHZhciB1cGRhdGVGb3JtID0gZnVuY3Rpb24odmFsKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKHZhbCkgJiYgdmFsICE9PSBmb3JtW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgICBmb3JtW25hbWVdID0gdmFsO1xuXG4gICAgICAgICAgICAgICAgICAvL3doZW4gd2UgaGF2ZSB0eXBlLCBhbmQgaWYgc3BlY2lmaWVkIGtleSB3ZSBhcHBseSBpdCBvbiBzY29wZS5cbiAgICAgICAgICAgICAgICAgIGlmIChvbmNlICYmIGZvcm0udHlwZSAmJiAoZm9ybS5rZXkgfHwgYW5ndWxhci5pc1VuZGVmaW5lZChhdHRycy5rZXkpKSkge1xuICAgICAgICAgICAgICAgICAgICBzY29wZS5mb3JtID0gZm9ybTtcbiAgICAgICAgICAgICAgICAgICAgb25jZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICBpZiAobmFtZSA9PT0gJ21vZGVsJykge1xuICAgICAgICAgICAgICAgIC8vXCJtb2RlbFwiIGlzIGJvdW5kIHRvIHNjb3BlIHVuZGVyIHRoZSBuYW1lIFwibW9kZWxcIiBzaW5jZSB0aGlzIGlzIHdoYXQgdGhlIGRlY29yYXRvcnNcbiAgICAgICAgICAgICAgICAvL2tub3cgYW5kIGxvdmUuXG4gICAgICAgICAgICAgICAgc2NvcGUuJHdhdGNoKHZhbHVlLCBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICAgICAgICAgIGlmICh2YWwgJiYgc2NvcGUubW9kZWwgIT09IHZhbCkge1xuICAgICAgICAgICAgICAgICAgICBzY29wZS5tb2RlbCA9IHZhbDtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmICh3YXRjaFRoaXNbbmFtZV0gPT09ICdjJykge1xuICAgICAgICAgICAgICAgIC8vd2F0Y2ggY29sbGVjdGlvblxuICAgICAgICAgICAgICAgIHNjb3BlLiR3YXRjaENvbGxlY3Rpb24odmFsdWUsIHVwZGF0ZUZvcm0pO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vJG9ic2VydmVcbiAgICAgICAgICAgICAgICBhdHRycy4kb2JzZXJ2ZShuYW1lLCB1cGRhdGVGb3JtKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBkZWNvcmF0b3IgZGlyZWN0aXZlIGFuZCBpdHMgc2libGluZyBcIm1hbnVhbFwiIHVzZSBkaXJlY3RpdmVzLlxuICAgKiBUaGUgZGlyZWN0aXZlIGNhbiBiZSB1c2VkIHRvIGNyZWF0ZSBmb3JtIGZpZWxkcyBvciBvdGhlciBmb3JtIGVudGl0aWVzLlxuICAgKiBJdCBjYW4gYmUgdXNlZCBpbiBjb25qdW5jdGlvbiB3aXRoIDxzY2hlbWEtZm9ybT4gZGlyZWN0aXZlIGluIHdoaWNoIGNhc2UgdGhlIGRlY29yYXRvciBpc1xuICAgKiBnaXZlbiBpdCdzIGNvbmZpZ3VyYXRpb24gdmlhIGEgdGhlIFwiZm9ybVwiIGF0dHJpYnV0ZS5cbiAgICpcbiAgICogZXguIEJhc2ljIHVzYWdlXG4gICAqICAgPHNmLWRlY29yYXRvciBmb3JtPVwibXlmb3JtXCI+PC9zZi1kZWNvcmF0b3I+XG4gICAqKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBkaXJlY3RpdmUgbmFtZSAoQ2FtZWxDYXNlZClcbiAgICogQHBhcmFtIHtPYmplY3R9IG1hcHBpbmdzLCBhbiBvYmplY3QgdGhhdCBtYXBzIFwidHlwZVwiID0+IFwidGVtcGxhdGVVcmxcIlxuICAgKiBAcGFyYW0ge0FycmF5fSAgcnVsZXMgKG9wdGlvbmFsKSBhIGxpc3Qgb2YgZnVuY3Rpb25zLCBmdW5jdGlvbihmb3JtKSB7fSwgdGhhdCBhcmUgZWFjaCB0cmllZCBpblxuICAgKiAgICAgICAgICAgICAgICAgdHVybixcbiAgICogICAgICAgICAgICAgICAgIGlmIHRoZXkgcmV0dXJuIGEgc3RyaW5nIHRoZW4gdGhhdCBpcyB1c2VkIGFzIHRoZSB0ZW1wbGF0ZVVybC4gUnVsZXMgY29tZSBiZWZvcmVcbiAgICogICAgICAgICAgICAgICAgIG1hcHBpbmdzLlxuICAgKi9cbiAgdGhpcy5jcmVhdGVEZWNvcmF0b3IgPSBmdW5jdGlvbihuYW1lLCBtYXBwaW5ncywgcnVsZXMsIG9wdGlvbnMpIHtcbiAgICBkaXJlY3RpdmVzW25hbWVdID0ge1xuICAgICAgbWFwcGluZ3M6IG1hcHBpbmdzIHx8IHt9LFxuICAgICAgcnVsZXM6ICAgIHJ1bGVzICAgIHx8IFtdXG4gICAgfTtcblxuICAgIGlmICghZGlyZWN0aXZlc1tkZWZhdWx0RGVjb3JhdG9yXSkge1xuICAgICAgZGVmYXVsdERlY29yYXRvciA9IG5hbWU7XG4gICAgfVxuICAgIGNyZWF0ZURpcmVjdGl2ZShuYW1lLCBvcHRpb25zKTtcbiAgfTtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGRpcmVjdGl2ZSBvZiBhIGRlY29yYXRvclxuICAgKiBVc2FibGUgd2hlbiB5b3Ugd2FudCB0byB1c2UgdGhlIGRlY29yYXRvcnMgd2l0aG91dCB1c2luZyA8c2NoZW1hLWZvcm0+IGRpcmVjdGl2ZS5cbiAgICogU3BlY2lmaWNhbGx5IHdoZW4geW91IG5lZWQgdG8gcmV1c2Ugc3R5bGluZy5cbiAgICpcbiAgICogZXguIGNyZWF0ZURpcmVjdGl2ZSgndGV4dCcsJy4uLicpXG4gICAqICA8c2YtdGV4dCB0aXRsZT1cImZvb2JhclwiIG1vZGVsPVwicGVyc29uXCIga2V5PVwibmFtZVwiIHNjaGVtYT1cInNjaGVtYVwiPjwvc2YtdGV4dD5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9ICB0eXBlIFRoZSB0eXBlIG9mIHRoZSBkaXJlY3RpdmUsIHJlc3VsdGluZyBkaXJlY3RpdmUgd2lsbCBoYXZlIHNmLSBwcmVmaXhlZFxuICAgKiBAcGFyYW0ge3N0cmluZ30gIHRlbXBsYXRlVXJsXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gdHJhbnNjbHVkZSAob3B0aW9uYWwpIHNldHMgdHJhbnNjbHVkZSBvcHRpb24gb2YgZGlyZWN0aXZlLCBkZWZhdWx0cyB0byBmYWxzZS5cbiAgICovXG4gIHRoaXMuY3JlYXRlRGlyZWN0aXZlID0gY3JlYXRlTWFudWFsRGlyZWN0aXZlO1xuXG4gIC8qKlxuICAgKiBTYW1lIGFzIGNyZWF0ZURpcmVjdGl2ZSwgYnV0IHRha2VzIGFuIG9iamVjdCB3aGVyZSBrZXkgaXMgJ3R5cGUnIGFuZCB2YWx1ZSBpcyAndGVtcGxhdGVVcmwnXG4gICAqIFVzZWZ1bCBmb3IgYmF0Y2hpbmcuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBtYXBwaW5nc1xuICAgKi9cbiAgdGhpcy5jcmVhdGVEaXJlY3RpdmVzID0gZnVuY3Rpb24obWFwcGluZ3MpIHtcbiAgICBhbmd1bGFyLmZvckVhY2gobWFwcGluZ3MsIGZ1bmN0aW9uKHVybCwgdHlwZSkge1xuICAgICAgY3JlYXRlTWFudWFsRGlyZWN0aXZlKHR5cGUsIHVybCk7XG4gICAgfSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEdldHRlciBmb3IgZGlyZWN0aXZlIG1hcHBpbmdzXG4gICAqIENhbiBiZSB1c2VkIHRvIG92ZXJyaWRlIGEgbWFwcGluZyBvciBhZGQgYSBydWxlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIChvcHRpb25hbCkgZGVmYXVsdHMgdG8gZGVmYXVsdERlY29yYXRvclxuICAgKiBAcmV0dXJuIHtPYmplY3R9IHJ1bGVzIGFuZCBtYXBwaW5ncyB7IHJ1bGVzOiBbXSxtYXBwaW5nczoge319XG4gICAqL1xuICB0aGlzLmRpcmVjdGl2ZSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBuYW1lID0gbmFtZSB8fCBkZWZhdWx0RGVjb3JhdG9yO1xuICAgIHJldHVybiBkaXJlY3RpdmVzW25hbWVdO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBZGRzIGEgbWFwcGluZyB0byBhbiBleGlzdGluZyBkZWNvcmF0b3IuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIERlY29yYXRvciBuYW1lXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlIEZvcm0gdHlwZSBmb3IgdGhlIG1hcHBpbmdcbiAgICogQHBhcmFtIHtTdHJpbmd9IHVybCAgVGhlIHRlbXBsYXRlIHVybFxuICAgKi9cbiAgdGhpcy5hZGRNYXBwaW5nID0gZnVuY3Rpb24obmFtZSwgdHlwZSwgdXJsKSB7XG4gICAgaWYgKGRpcmVjdGl2ZXNbbmFtZV0pIHtcbiAgICAgIGRpcmVjdGl2ZXNbbmFtZV0ubWFwcGluZ3NbdHlwZV0gPSB1cmw7XG4gICAgfVxuICB9O1xuXG4gIC8vU2VydmljZSBpcyBqdXN0IGEgZ2V0dGVyIGZvciBkaXJlY3RpdmUgbWFwcGluZ3MgYW5kIHJ1bGVzXG4gIHRoaXMuJGdldCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBkaXJlY3RpdmU6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZXNbbmFtZV07XG4gICAgICB9LFxuICAgICAgZGVmYXVsdERlY29yYXRvcjogZGVmYXVsdERlY29yYXRvclxuICAgIH07XG4gIH07XG5cbiAgLy9DcmVhdGUgYSBkZWZhdWx0IGRpcmVjdGl2ZVxuICBjcmVhdGVEaXJlY3RpdmUoJ3NmRGVjb3JhdG9yJyk7XG5cbn1dKTtcblxuLyoqXG4gKiBTY2hlbWEgZm9ybSBzZXJ2aWNlLlxuICogVGhpcyBzZXJ2aWNlIGlzIG5vdCB0aGF0IHVzZWZ1bCBvdXRzaWRlIG9mIHNjaGVtYSBmb3JtIGRpcmVjdGl2ZVxuICogYnV0IG1ha2VzIHRoZSBjb2RlIG1vcmUgdGVzdGFibGUuXG4gKi9cbmFuZ3VsYXIubW9kdWxlKCdzY2hlbWFGb3JtJykucHJvdmlkZXIoJ3NjaGVtYUZvcm0nLFxuWydzZlBhdGhQcm92aWRlcicsIGZ1bmN0aW9uKHNmUGF0aFByb3ZpZGVyKSB7XG5cbiAgLy9DcmVhdGVzIGFuIGRlZmF1bHQgdGl0bGVNYXAgbGlzdCBmcm9tIGFuIGVudW0sIGkuZS4gYSBsaXN0IG9mIHN0cmluZ3MuXG4gIHZhciBlbnVtVG9UaXRsZU1hcCA9IGZ1bmN0aW9uKGVubSkge1xuICAgIHZhciB0aXRsZU1hcCA9IFtdOyAvL2Nhbm9uaWNhbCB0aXRsZU1hcCBmb3JtYXQgaXMgYSBsaXN0LlxuICAgIGVubS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHRpdGxlTWFwLnB1c2goe25hbWU6IG5hbWUsIHZhbHVlOiBuYW1lfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRpdGxlTWFwO1xuICB9O1xuXG4gIC8vIFRha2VzIGEgdGl0bGVNYXAgaW4gZWl0aGVyIG9iamVjdCBvciBsaXN0IGZvcm1hdCBhbmQgcmV0dXJucyBvbmUgaW5cbiAgLy8gaW4gdGhlIGxpc3QgZm9ybWF0LlxuICB2YXIgY2Fub25pY2FsVGl0bGVNYXAgPSBmdW5jdGlvbih0aXRsZU1hcCwgb3JpZ2luYWxFbnVtKSB7XG4gICAgaWYgKCFhbmd1bGFyLmlzQXJyYXkodGl0bGVNYXApKSB7XG4gICAgICB2YXIgY2Fub25pY2FsID0gW107XG4gICAgICBpZiAob3JpZ2luYWxFbnVtKSB7XG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaChvcmlnaW5hbEVudW0sIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgIGNhbm9uaWNhbC5wdXNoKHtuYW1lOiB0aXRsZU1hcFt2YWx1ZV0sIHZhbHVlOiB2YWx1ZX0pO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaCh0aXRsZU1hcCwgZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICAgICAgICBjYW5vbmljYWwucHVzaCh7bmFtZTogbmFtZSwgdmFsdWU6IHZhbHVlfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNhbm9uaWNhbDtcbiAgICB9XG4gICAgcmV0dXJuIHRpdGxlTWFwO1xuICB9O1xuXG4gIHZhciBkZWZhdWx0Rm9ybURlZmluaXRpb24gPSBmdW5jdGlvbihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpIHtcbiAgICB2YXIgcnVsZXMgPSBkZWZhdWx0c1tzY2hlbWEudHlwZV07XG4gICAgaWYgKHJ1bGVzKSB7XG4gICAgICB2YXIgZGVmO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBydWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBkZWYgPSBydWxlc1tpXShuYW1lLCBzY2hlbWEsIG9wdGlvbnMpO1xuICAgICAgICAvL2ZpcnN0IGhhbmRsZXIgaW4gbGlzdCB0aGF0IGFjdHVhbGx5IHJldHVybnMgc29tZXRoaW5nIGlzIG91ciBoYW5kbGVyIVxuICAgICAgICBpZiAoZGVmKSB7XG4gICAgICAgICAgcmV0dXJuIGRlZjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvL0NyZWF0ZXMgYSBmb3JtIG9iamVjdCB3aXRoIGFsbCBjb21tb24gcHJvcGVydGllc1xuICB2YXIgc3RkRm9ybU9iaiA9IGZ1bmN0aW9uKG5hbWUsIHNjaGVtYSwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHZhciBmID0gb3B0aW9ucy5nbG9iYWwgJiYgb3B0aW9ucy5nbG9iYWwuZm9ybURlZmF1bHRzID9cbiAgICAgICAgICAgIGFuZ3VsYXIuY29weShvcHRpb25zLmdsb2JhbC5mb3JtRGVmYXVsdHMpIDoge307XG4gICAgaWYgKG9wdGlvbnMuZ2xvYmFsICYmIG9wdGlvbnMuZ2xvYmFsLnN1cHJlc3NQcm9wZXJ0eVRpdGxlcyA9PT0gdHJ1ZSkge1xuICAgICAgZi50aXRsZSA9IHNjaGVtYS50aXRsZTtcbiAgICB9IGVsc2Uge1xuICAgICAgZi50aXRsZSA9IHNjaGVtYS50aXRsZSB8fCBuYW1lO1xuICAgIH1cblxuICAgIGlmIChzY2hlbWEuZGVzY3JpcHRpb24pIHsgZi5kZXNjcmlwdGlvbiA9IHNjaGVtYS5kZXNjcmlwdGlvbjsgfVxuICAgIGlmIChvcHRpb25zLnJlcXVpcmVkID09PSB0cnVlIHx8IHNjaGVtYS5yZXF1aXJlZCA9PT0gdHJ1ZSkgeyBmLnJlcXVpcmVkID0gdHJ1ZTsgfVxuICAgIGlmIChzY2hlbWEubWF4TGVuZ3RoKSB7IGYubWF4bGVuZ3RoID0gc2NoZW1hLm1heExlbmd0aDsgfVxuICAgIGlmIChzY2hlbWEubWluTGVuZ3RoKSB7IGYubWlubGVuZ3RoID0gc2NoZW1hLm1heExlbmd0aDsgfVxuICAgIGlmIChzY2hlbWEucmVhZE9ubHkgfHwgc2NoZW1hLnJlYWRvbmx5KSB7IGYucmVhZG9ubHkgID0gdHJ1ZTsgfVxuICAgIGlmIChzY2hlbWEubWluaW11bSkgeyBmLm1pbmltdW0gPSBzY2hlbWEubWluaW11bSArIChzY2hlbWEuZXhjbHVzaXZlTWluaW11bSA/IDEgOiAwKTsgfVxuICAgIGlmIChzY2hlbWEubWF4aW11bSkgeyBmLm1heGltdW0gPSBzY2hlbWEubWF4aW11bSAtIChzY2hlbWEuZXhjbHVzaXZlTWF4aW11bSA/IDEgOiAwKTsgfVxuXG4gICAgLy9Ob24gc3RhbmRhcmQgYXR0cmlidXRlc1xuICAgIGlmIChzY2hlbWEudmFsaWRhdGlvbk1lc3NhZ2UpIHsgZi52YWxpZGF0aW9uTWVzc2FnZSA9IHNjaGVtYS52YWxpZGF0aW9uTWVzc2FnZTsgfVxuICAgIGlmIChzY2hlbWEuZW51bU5hbWVzKSB7IGYudGl0bGVNYXAgPSBjYW5vbmljYWxUaXRsZU1hcChzY2hlbWEuZW51bU5hbWVzLCBzY2hlbWFbJ2VudW0nXSk7IH1cbiAgICBmLnNjaGVtYSA9IHNjaGVtYTtcblxuICAgIC8vIE5nIG1vZGVsIG9wdGlvbnMgZG9lc24ndCBwbGF5IG5pY2Ugd2l0aCB1bmRlZmluZWQsIG1pZ2h0IGJlIGRlZmluZWRcbiAgICAvLyBnbG9iYWxseSB0aG91Z2hcbiAgICBmLm5nTW9kZWxPcHRpb25zID0gZi5uZ01vZGVsT3B0aW9ucyB8fCB7fTtcbiAgICByZXR1cm4gZjtcbiAgfTtcblxuICB2YXIgdGV4dCA9IGZ1bmN0aW9uKG5hbWUsIHNjaGVtYSwgb3B0aW9ucykge1xuICAgIGlmIChzY2hlbWEudHlwZSA9PT0gJ3N0cmluZycgJiYgIXNjaGVtYVsnZW51bSddKSB7XG4gICAgICB2YXIgZiA9IHN0ZEZvcm1PYmoobmFtZSwgc2NoZW1hLCBvcHRpb25zKTtcbiAgICAgIGYua2V5ICA9IG9wdGlvbnMucGF0aDtcbiAgICAgIGYudHlwZSA9ICd0ZXh0JztcbiAgICAgIG9wdGlvbnMubG9va3VwW3NmUGF0aFByb3ZpZGVyLnN0cmluZ2lmeShvcHRpb25zLnBhdGgpXSA9IGY7XG4gICAgICByZXR1cm4gZjtcbiAgICB9XG4gIH07XG5cbiAgLy9kZWZhdWx0IGluIGpzb24gZm9ybSBmb3IgbnVtYmVyIGFuZCBpbnRlZ2VyIGlzIGEgdGV4dCBmaWVsZFxuICAvL2lucHV0IHR5cGU9XCJudW1iZXJcIiB3b3VsZCBiZSBtb3JlIHN1aXRhYmxlIGRvbid0IHlhIHRoaW5rP1xuICB2YXIgbnVtYmVyID0gZnVuY3Rpb24obmFtZSwgc2NoZW1hLCBvcHRpb25zKSB7XG4gICAgaWYgKHNjaGVtYS50eXBlID09PSAnbnVtYmVyJykge1xuICAgICAgdmFyIGYgPSBzdGRGb3JtT2JqKG5hbWUsIHNjaGVtYSwgb3B0aW9ucyk7XG4gICAgICBmLmtleSAgPSBvcHRpb25zLnBhdGg7XG4gICAgICBmLnR5cGUgPSAnbnVtYmVyJztcbiAgICAgIG9wdGlvbnMubG9va3VwW3NmUGF0aFByb3ZpZGVyLnN0cmluZ2lmeShvcHRpb25zLnBhdGgpXSA9IGY7XG4gICAgICByZXR1cm4gZjtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGludGVnZXIgPSBmdW5jdGlvbihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpIHtcbiAgICBpZiAoc2NoZW1hLnR5cGUgPT09ICdpbnRlZ2VyJykge1xuICAgICAgdmFyIGYgPSBzdGRGb3JtT2JqKG5hbWUsIHNjaGVtYSwgb3B0aW9ucyk7XG4gICAgICBmLmtleSAgPSBvcHRpb25zLnBhdGg7XG4gICAgICBmLnR5cGUgPSAnbnVtYmVyJztcbiAgICAgIG9wdGlvbnMubG9va3VwW3NmUGF0aFByb3ZpZGVyLnN0cmluZ2lmeShvcHRpb25zLnBhdGgpXSA9IGY7XG4gICAgICByZXR1cm4gZjtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGNoZWNrYm94ID0gZnVuY3Rpb24obmFtZSwgc2NoZW1hLCBvcHRpb25zKSB7XG4gICAgaWYgKHNjaGVtYS50eXBlID09PSAnYm9vbGVhbicpIHtcbiAgICAgIHZhciBmID0gc3RkRm9ybU9iaihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpO1xuICAgICAgZi5rZXkgID0gb3B0aW9ucy5wYXRoO1xuICAgICAgZi50eXBlID0gJ2NoZWNrYm94JztcbiAgICAgIG9wdGlvbnMubG9va3VwW3NmUGF0aFByb3ZpZGVyLnN0cmluZ2lmeShvcHRpb25zLnBhdGgpXSA9IGY7XG4gICAgICByZXR1cm4gZjtcbiAgICB9XG4gIH07XG5cbiAgdmFyIHNlbGVjdCA9IGZ1bmN0aW9uKG5hbWUsIHNjaGVtYSwgb3B0aW9ucykge1xuICAgIGlmIChzY2hlbWEudHlwZSA9PT0gJ3N0cmluZycgJiYgc2NoZW1hWydlbnVtJ10pIHtcbiAgICAgIHZhciBmID0gc3RkRm9ybU9iaihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpO1xuICAgICAgZi5rZXkgID0gb3B0aW9ucy5wYXRoO1xuICAgICAgZi50eXBlID0gJ3NlbGVjdCc7XG4gICAgICBpZiAoIWYudGl0bGVNYXApIHtcbiAgICAgICAgZi50aXRsZU1hcCA9IGVudW1Ub1RpdGxlTWFwKHNjaGVtYVsnZW51bSddKTtcbiAgICAgIH1cbiAgICAgIG9wdGlvbnMubG9va3VwW3NmUGF0aFByb3ZpZGVyLnN0cmluZ2lmeShvcHRpb25zLnBhdGgpXSA9IGY7XG4gICAgICByZXR1cm4gZjtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGNoZWNrYm94ZXMgPSBmdW5jdGlvbihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpIHtcbiAgICBpZiAoc2NoZW1hLnR5cGUgPT09ICdhcnJheScgJiYgc2NoZW1hLml0ZW1zICYmIHNjaGVtYS5pdGVtc1snZW51bSddKSB7XG4gICAgICB2YXIgZiA9IHN0ZEZvcm1PYmoobmFtZSwgc2NoZW1hLCBvcHRpb25zKTtcbiAgICAgIGYua2V5ICA9IG9wdGlvbnMucGF0aDtcbiAgICAgIGYudHlwZSA9ICdjaGVja2JveGVzJztcbiAgICAgIGlmICghZi50aXRsZU1hcCkge1xuICAgICAgICBmLnRpdGxlTWFwID0gZW51bVRvVGl0bGVNYXAoc2NoZW1hLml0ZW1zWydlbnVtJ10pO1xuICAgICAgfVxuICAgICAgb3B0aW9ucy5sb29rdXBbc2ZQYXRoUHJvdmlkZXIuc3RyaW5naWZ5KG9wdGlvbnMucGF0aCldID0gZjtcbiAgICAgIHJldHVybiBmO1xuICAgIH1cbiAgfTtcblxuICB2YXIgZmllbGRzZXQgPSBmdW5jdGlvbihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpIHtcbiAgICBpZiAoc2NoZW1hLnR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgICB2YXIgZiAgID0gc3RkRm9ybU9iaihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpO1xuICAgICAgZi50eXBlICA9ICdmaWVsZHNldCc7XG4gICAgICBmLml0ZW1zID0gW107XG4gICAgICBvcHRpb25zLmxvb2t1cFtzZlBhdGhQcm92aWRlci5zdHJpbmdpZnkob3B0aW9ucy5wYXRoKV0gPSBmO1xuXG4gICAgICAvL3JlY3Vyc2UgZG93biBpbnRvIHByb3BlcnRpZXNcbiAgICAgIGFuZ3VsYXIuZm9yRWFjaChzY2hlbWEucHJvcGVydGllcywgZnVuY3Rpb24odiwgaykge1xuICAgICAgICB2YXIgcGF0aCA9IG9wdGlvbnMucGF0aC5zbGljZSgpO1xuICAgICAgICBwYXRoLnB1c2goayk7XG4gICAgICAgIGlmIChvcHRpb25zLmlnbm9yZVtzZlBhdGhQcm92aWRlci5zdHJpbmdpZnkocGF0aCldICE9PSB0cnVlKSB7XG4gICAgICAgICAgdmFyIHJlcXVpcmVkID0gc2NoZW1hLnJlcXVpcmVkICYmIHNjaGVtYS5yZXF1aXJlZC5pbmRleE9mKGspICE9PSAtMTtcblxuICAgICAgICAgIHZhciBkZWYgPSBkZWZhdWx0Rm9ybURlZmluaXRpb24oaywgdiwge1xuICAgICAgICAgICAgcGF0aDogcGF0aCxcbiAgICAgICAgICAgIHJlcXVpcmVkOiByZXF1aXJlZCB8fCBmYWxzZSxcbiAgICAgICAgICAgIGxvb2t1cDogb3B0aW9ucy5sb29rdXAsXG4gICAgICAgICAgICBpZ25vcmU6IG9wdGlvbnMuaWdub3JlXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWYgKGRlZikge1xuICAgICAgICAgICAgZi5pdGVtcy5wdXNoKGRlZik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGY7XG4gICAgfVxuXG4gIH07XG5cbiAgdmFyIGFycmF5ID0gZnVuY3Rpb24obmFtZSwgc2NoZW1hLCBvcHRpb25zKSB7XG5cbiAgICBpZiAoc2NoZW1hLnR5cGUgPT09ICdhcnJheScpIHtcbiAgICAgIHZhciBmICAgPSBzdGRGb3JtT2JqKG5hbWUsIHNjaGVtYSwgb3B0aW9ucyk7XG4gICAgICBmLnR5cGUgID0gJ2FycmF5JztcbiAgICAgIGYua2V5ICAgPSBvcHRpb25zLnBhdGg7XG4gICAgICBvcHRpb25zLmxvb2t1cFtzZlBhdGhQcm92aWRlci5zdHJpbmdpZnkob3B0aW9ucy5wYXRoKV0gPSBmO1xuXG4gICAgICB2YXIgcmVxdWlyZWQgPSBzY2hlbWEucmVxdWlyZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgIHNjaGVtYS5yZXF1aXJlZC5pbmRleE9mKG9wdGlvbnMucGF0aFtvcHRpb25zLnBhdGgubGVuZ3RoIC0gMV0pICE9PSAtMTtcblxuICAgICAgLy8gVGhlIGRlZmF1bHQgaXMgdG8gYWx3YXlzIGp1c3QgY3JlYXRlIG9uZSBjaGlsZC4gVGhpcyB3b3JrcyBzaW5jZSBpZiB0aGVcbiAgICAgIC8vIHNjaGVtYXMgaXRlbXMgZGVjbGFyYXRpb24gaXMgb2YgdHlwZTogXCJvYmplY3RcIiB0aGVuIHdlIGdldCBhIGZpZWxkc2V0LlxuICAgICAgLy8gV2UgYWxzbyBmb2xsb3cganNvbiBmb3JtIG5vdGF0YXRpb24sIGFkZGluZyBlbXB0eSBicmFja2V0cyBcIltdXCIgdG9cbiAgICAgIC8vIHNpZ25pZnkgYXJyYXlzLlxuXG4gICAgICB2YXIgYXJyUGF0aCA9IG9wdGlvbnMucGF0aC5zbGljZSgpO1xuICAgICAgYXJyUGF0aC5wdXNoKCcnKTtcblxuICAgICAgZi5pdGVtcyA9IFtkZWZhdWx0Rm9ybURlZmluaXRpb24obmFtZSwgc2NoZW1hLml0ZW1zLCB7XG4gICAgICAgIHBhdGg6IGFyclBhdGgsXG4gICAgICAgIHJlcXVpcmVkOiByZXF1aXJlZCB8fCBmYWxzZSxcbiAgICAgICAgbG9va3VwOiBvcHRpb25zLmxvb2t1cCxcbiAgICAgICAgaWdub3JlOiBvcHRpb25zLmlnbm9yZSxcbiAgICAgICAgZ2xvYmFsOiBvcHRpb25zLmdsb2JhbFxuICAgICAgfSldO1xuXG4gICAgICByZXR1cm4gZjtcbiAgICB9XG5cbiAgfTtcblxuICAvL0ZpcnN0IHNvcnRlZCBieSBzY2hlbWEgdHlwZSB0aGVuIGEgbGlzdC5cbiAgLy9PcmRlciBoYXMgaW1wb3J0YW5jZS4gRmlyc3QgaGFuZGxlciByZXR1cm5pbmcgYW4gZm9ybSBzbmlwcGV0IHdpbGwgYmUgdXNlZC5cbiAgdmFyIGRlZmF1bHRzID0ge1xuICAgIHN0cmluZzogIFtzZWxlY3QsIHRleHRdLFxuICAgIG9iamVjdDogIFtmaWVsZHNldF0sXG4gICAgbnVtYmVyOiAgW251bWJlcl0sXG4gICAgaW50ZWdlcjogW2ludGVnZXJdLFxuICAgIGJvb2xlYW46IFtjaGVja2JveF0sXG4gICAgYXJyYXk6ICAgW2NoZWNrYm94ZXMsIGFycmF5XVxuICB9O1xuXG4gIHZhciBwb3N0UHJvY2Vzc0ZuID0gZnVuY3Rpb24oZm9ybSkgeyByZXR1cm4gZm9ybTsgfTtcblxuICAvKipcbiAgICogUHJvdmlkZXIgQVBJXG4gICAqL1xuICB0aGlzLmRlZmF1bHRzICAgICAgICAgICAgICA9IGRlZmF1bHRzO1xuICB0aGlzLnN0ZEZvcm1PYmogICAgICAgICAgICA9IHN0ZEZvcm1PYmo7XG4gIHRoaXMuZGVmYXVsdEZvcm1EZWZpbml0aW9uID0gZGVmYXVsdEZvcm1EZWZpbml0aW9uO1xuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBhIHBvc3QgcHJvY2VzcyBmdW5jdGlvbi5cbiAgICogVGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgd2l0aCB0aGUgZnVsbHkgbWVyZ2VkXG4gICAqIGZvcm0gZGVmaW5pdGlvbiAoaS5lLiBhZnRlciBtZXJnaW5nIHdpdGggc2NoZW1hKVxuICAgKiBhbmQgd2hhdGV2ZXIgaXQgcmV0dXJucyBpcyB1c2VkIGFzIGZvcm0uXG4gICAqL1xuICB0aGlzLnBvc3RQcm9jZXNzID0gZnVuY3Rpb24oZm4pIHtcbiAgICBwb3N0UHJvY2Vzc0ZuID0gZm47XG4gIH07XG5cbiAgLyoqXG4gICAqIEFwcGVuZCBkZWZhdWx0IGZvcm0gcnVsZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gICB0eXBlIGpzb24gc2NoZW1hIHR5cGVcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gcnVsZSBhIGZ1bmN0aW9uKHByb3BlcnR5TmFtZSxwcm9wZXJ0eVNjaGVtYSxvcHRpb25zKSB0aGF0IHJldHVybnMgYSBmb3JtXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgZGVmaW5pdGlvbiBvciB1bmRlZmluZWRcbiAgICovXG4gIHRoaXMuYXBwZW5kUnVsZSA9IGZ1bmN0aW9uKHR5cGUsIHJ1bGUpIHtcbiAgICBpZiAoIWRlZmF1bHRzW3R5cGVdKSB7XG4gICAgICBkZWZhdWx0c1t0eXBlXSA9IFtdO1xuICAgIH1cbiAgICBkZWZhdWx0c1t0eXBlXS5wdXNoKHJ1bGUpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBQcmVwZW5kIGRlZmF1bHQgZm9ybSBydWxlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSAgIHR5cGUganNvbiBzY2hlbWEgdHlwZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBydWxlIGEgZnVuY3Rpb24ocHJvcGVydHlOYW1lLHByb3BlcnR5U2NoZW1hLG9wdGlvbnMpIHRoYXQgcmV0dXJucyBhIGZvcm1cbiAgICogICAgICAgICAgICAgICAgICAgICAgICBkZWZpbml0aW9uIG9yIHVuZGVmaW5lZFxuICAgKi9cbiAgdGhpcy5wcmVwZW5kUnVsZSA9IGZ1bmN0aW9uKHR5cGUsIHJ1bGUpIHtcbiAgICBpZiAoIWRlZmF1bHRzW3R5cGVdKSB7XG4gICAgICBkZWZhdWx0c1t0eXBlXSA9IFtdO1xuICAgIH1cbiAgICBkZWZhdWx0c1t0eXBlXS51bnNoaWZ0KHJ1bGUpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBVdGlsaXR5IGZ1bmN0aW9uIHRvIGNyZWF0ZSBhIHN0YW5kYXJkIGZvcm0gb2JqZWN0LlxuICAgKiBUaGlzIGRvZXMgKm5vdCogc2V0IHRoZSB0eXBlIG9mIHRoZSBmb3JtIGJ1dCByYXRoZXIgYWxsIHNoYXJlZCBhdHRyaWJ1dGVzLlxuICAgKiBZb3UgcHJvYmFibHkgd2FudCB0byBzdGFydCB5b3VyIHJ1bGUgd2l0aCBjcmVhdGluZyB0aGUgZm9ybSB3aXRoIHRoaXMgbWV0aG9kXG4gICAqIHRoZW4gc2V0dGluZyB0eXBlIGFuZCBhbnkgb3RoZXIgdmFsdWVzIHlvdSBuZWVkLlxuICAgKiBAcGFyYW0ge09iamVjdH0gc2NoZW1hXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAqIEByZXR1cm4ge09iamVjdH0gYSBmb3JtIGZpZWxkIGRlZmludGlvblxuICAgKi9cbiAgdGhpcy5jcmVhdGVTdGFuZGFyZEZvcm0gPSBzdGRGb3JtT2JqO1xuICAvKiBFbmQgUHJvdmlkZXIgQVBJICovXG5cbiAgdGhpcy4kZ2V0ID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgc2VydmljZSA9IHt9O1xuXG4gICAgc2VydmljZS5tZXJnZSA9IGZ1bmN0aW9uKHNjaGVtYSwgZm9ybSwgaWdub3JlLCBvcHRpb25zLCByZWFkb25seSkge1xuICAgICAgZm9ybSAgPSBmb3JtIHx8IFsnKiddO1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICAgIC8vIEdldCByZWFkb25seSBmcm9tIHJvb3Qgb2JqZWN0XG4gICAgICByZWFkb25seSA9IHJlYWRvbmx5IHx8IHNjaGVtYS5yZWFkb25seSB8fCBzY2hlbWEucmVhZE9ubHk7XG5cbiAgICAgIHZhciBzdGRGb3JtID0gc2VydmljZS5kZWZhdWx0cyhzY2hlbWEsIGlnbm9yZSwgb3B0aW9ucyk7XG5cbiAgICAgIC8vc2ltcGxlIGNhc2UsIHdlIGhhdmUgYSBcIipcIiwganVzdCBwdXQgdGhlIHN0ZEZvcm0gdGhlcmVcbiAgICAgIHZhciBpZHggPSBmb3JtLmluZGV4T2YoJyonKTtcbiAgICAgIGlmIChpZHggIT09IC0xKSB7XG4gICAgICAgIGZvcm0gID0gZm9ybS5zbGljZSgwLCBpZHgpXG4gICAgICAgICAgICAgICAgICAgIC5jb25jYXQoc3RkRm9ybS5mb3JtKVxuICAgICAgICAgICAgICAgICAgICAuY29uY2F0KGZvcm0uc2xpY2UoaWR4ICsgMSkpO1xuICAgICAgfVxuXG4gICAgICAvL29rIGxldCdzIG1lcmdlIVxuICAgICAgLy9XZSBsb29rIGF0IHRoZSBzdXBwbGllZCBmb3JtIGFuZCBleHRlbmQgaXQgd2l0aCBzY2hlbWEgc3RhbmRhcmRzXG4gICAgICB2YXIgbG9va3VwID0gc3RkRm9ybS5sb29rdXA7XG5cbiAgICAgIHJldHVybiBwb3N0UHJvY2Vzc0ZuKGZvcm0ubWFwKGZ1bmN0aW9uKG9iaikge1xuXG4gICAgICAgIC8vaGFuZGxlIHRoZSBzaG9ydGN1dCB3aXRoIGp1c3QgYSBuYW1lXG4gICAgICAgIGlmICh0eXBlb2Ygb2JqID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIG9iaiA9IHtrZXk6IG9ian07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob2JqLmtleSkge1xuICAgICAgICAgIGlmICh0eXBlb2Ygb2JqLmtleSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIG9iai5rZXkgPSBzZlBhdGhQcm92aWRlci5wYXJzZShvYmoua2V5KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvL0lmIGl0IGhhcyBhIHRpdGxlTWFwIG1ha2Ugc3VyZSBpdCdzIGEgbGlzdFxuICAgICAgICBpZiAob2JqLnRpdGxlTWFwKSB7XG4gICAgICAgICAgb2JqLnRpdGxlTWFwID0gY2Fub25pY2FsVGl0bGVNYXAob2JqLnRpdGxlTWFwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vXG4gICAgICAgIGlmIChvYmouaXRlbUZvcm0pIHtcbiAgICAgICAgICBvYmouaXRlbXMgPSBbXTtcbiAgICAgICAgICB2YXIgc3RyID0gc2ZQYXRoUHJvdmlkZXIuc3RyaW5naWZ5KG9iai5rZXkpO1xuICAgICAgICAgIHZhciBzdGRGb3JtID0gbG9va3VwW3N0cl07XG4gICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHN0ZEZvcm0uaXRlbXMsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgIHZhciBvID0gYW5ndWxhci5jb3B5KG9iai5pdGVtRm9ybSk7XG4gICAgICAgICAgICBvLmtleSA9IGl0ZW0ua2V5O1xuICAgICAgICAgICAgb2JqLml0ZW1zLnB1c2gobyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvL2V4dGVuZCB3aXRoIHN0ZCBmb3JtIGZyb20gc2NoZW1hLlxuXG4gICAgICAgIGlmIChvYmoua2V5KSB7XG4gICAgICAgICAgdmFyIHN0cmlkID0gc2ZQYXRoUHJvdmlkZXIuc3RyaW5naWZ5KG9iai5rZXkpO1xuICAgICAgICAgIGlmIChsb29rdXBbc3RyaWRdKSB7XG4gICAgICAgICAgICBvYmogPSBhbmd1bGFyLmV4dGVuZChsb29rdXBbc3RyaWRdLCBvYmopO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFyZSB3ZSBpbmhlcml0aW5nIHJlYWRvbmx5P1xuICAgICAgICBpZiAocmVhZG9ubHkgPT09IHRydWUpIHsgLy8gSW5oZXJpdGluZyBmYWxzZSBpcyBub3QgY29vbC5cbiAgICAgICAgICBvYmoucmVhZG9ubHkgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9pZiBpdCdzIGEgdHlwZSB3aXRoIGl0ZW1zLCBtZXJnZSAnZW0hXG4gICAgICAgIGlmIChvYmouaXRlbXMpIHtcbiAgICAgICAgICBvYmouaXRlbXMgPSBzZXJ2aWNlLm1lcmdlKHNjaGVtYSwgb2JqLml0ZW1zLCBpZ25vcmUsIG9wdGlvbnMsIG9iai5yZWFkb25seSk7XG4gICAgICAgIH1cblxuICAgICAgICAvL2lmIGl0cyBoYXMgdGFicywgbWVyZ2UgdGhlbSBhbHNvIVxuICAgICAgICBpZiAob2JqLnRhYnMpIHtcbiAgICAgICAgICBhbmd1bGFyLmZvckVhY2gob2JqLnRhYnMsIGZ1bmN0aW9uKHRhYikge1xuICAgICAgICAgICAgdGFiLml0ZW1zID0gc2VydmljZS5tZXJnZShzY2hlbWEsIHRhYi5pdGVtcywgaWdub3JlLCBvcHRpb25zLCBvYmoucmVhZG9ubHkpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU3BlY2lhbCBjYXNlOiBjaGVja2JveFxuICAgICAgICAvLyBTaW5jZSBoYXZlIHRvIHRlcm5hcnkgc3RhdGUgd2UgbmVlZCBhIGRlZmF1bHRcbiAgICAgICAgaWYgKG9iai50eXBlID09PSAnY2hlY2tib3gnICYmIGFuZ3VsYXIuaXNVbmRlZmluZWQob2JqLnNjaGVtYVsnZGVmYXVsdCddKSkge1xuICAgICAgICAgIG9iai5zY2hlbWFbJ2RlZmF1bHQnXSA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgIH0pKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGZvcm0gZGVmYXVsdHMgZnJvbSBzY2hlbWFcbiAgICAgKi9cbiAgICBzZXJ2aWNlLmRlZmF1bHRzID0gZnVuY3Rpb24oc2NoZW1hLCBpZ25vcmUsIGdsb2JhbE9wdGlvbnMpIHtcbiAgICAgIHZhciBmb3JtICAgPSBbXTtcbiAgICAgIHZhciBsb29rdXAgPSB7fTsgLy9NYXAgcGF0aCA9PiBmb3JtIG9iaiBmb3IgZmFzdCBsb29rdXAgaW4gbWVyZ2luZ1xuICAgICAgaWdub3JlID0gaWdub3JlIHx8IHt9O1xuICAgICAgZ2xvYmFsT3B0aW9ucyA9IGdsb2JhbE9wdGlvbnMgfHwge307XG5cbiAgICAgIGlmIChzY2hlbWEudHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKHNjaGVtYS5wcm9wZXJ0aWVzLCBmdW5jdGlvbih2LCBrKSB7XG4gICAgICAgICAgaWYgKGlnbm9yZVtrXSAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgdmFyIHJlcXVpcmVkID0gc2NoZW1hLnJlcXVpcmVkICYmIHNjaGVtYS5yZXF1aXJlZC5pbmRleE9mKGspICE9PSAtMTtcbiAgICAgICAgICAgIHZhciBkZWYgPSBkZWZhdWx0Rm9ybURlZmluaXRpb24oaywgdiwge1xuICAgICAgICAgICAgICBwYXRoOiBba10sICAgICAgICAgLy8gUGF0aCB0byB0aGlzIHByb3BlcnR5IGluIGJyYWNrZXQgbm90YXRpb24uXG4gICAgICAgICAgICAgIGxvb2t1cDogbG9va3VwLCAgICAvLyBFeHRyYSBtYXAgdG8gcmVnaXN0ZXIgd2l0aC4gT3B0aW1pemF0aW9uIGZvciBtZXJnZXIuXG4gICAgICAgICAgICAgIGlnbm9yZTogaWdub3JlLCAgICAvLyBUaGUgaWdub3JlIGxpc3Qgb2YgcGF0aHMgKHNhbnMgcm9vdCBsZXZlbCBuYW1lKVxuICAgICAgICAgICAgICByZXF1aXJlZDogcmVxdWlyZWQsIC8vIElzIGl0IHJlcXVpcmVkPyAodjQganNvbiBzY2hlbWEgc3R5bGUpXG4gICAgICAgICAgICAgIGdsb2JhbDogZ2xvYmFsT3B0aW9ucyAvLyBHbG9iYWwgb3B0aW9ucywgaW5jbHVkaW5nIGZvcm0gZGVmYXVsdHNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGRlZikge1xuICAgICAgICAgICAgICBmb3JtLnB1c2goZGVmKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZC4gT25seSB0eXBlIFwib2JqZWN0XCIgYWxsb3dlZCBhdCByb290IGxldmVsIG9mIHNjaGVtYS4nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7Zm9ybTogZm9ybSwgbG9va3VwOiBsb29rdXB9O1xuICAgIH07XG5cbiAgICAvL1V0aWxpdHkgZnVuY3Rpb25zXG4gICAgLyoqXG4gICAgICogVHJhdmVyc2UgYSBzY2hlbWEsIGFwcGx5aW5nIGEgZnVuY3Rpb24oc2NoZW1hLHBhdGgpIG9uIGV2ZXJ5IHN1YiBzY2hlbWFcbiAgICAgKiBpLmUuIGV2ZXJ5IHByb3BlcnR5IG9mIGFuIG9iamVjdC5cbiAgICAgKi9cbiAgICBzZXJ2aWNlLnRyYXZlcnNlU2NoZW1hID0gZnVuY3Rpb24oc2NoZW1hLCBmbiwgcGF0aCwgaWdub3JlQXJyYXlzKSB7XG4gICAgICBpZ25vcmVBcnJheXMgPSBhbmd1bGFyLmlzRGVmaW5lZChpZ25vcmVBcnJheXMpID8gaWdub3JlQXJyYXlzIDogdHJ1ZTtcblxuICAgICAgcGF0aCA9IHBhdGggfHwgW107XG5cbiAgICAgIHZhciB0cmF2ZXJzZSA9IGZ1bmN0aW9uKHNjaGVtYSwgZm4sIHBhdGgpIHtcbiAgICAgICAgZm4oc2NoZW1hLCBwYXRoKTtcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKHNjaGVtYS5wcm9wZXJ0aWVzLCBmdW5jdGlvbihwcm9wLCBuYW1lKSB7XG4gICAgICAgICAgdmFyIGN1cnJlbnRQYXRoID0gcGF0aC5zbGljZSgpO1xuICAgICAgICAgIGN1cnJlbnRQYXRoLnB1c2gobmFtZSk7XG4gICAgICAgICAgdHJhdmVyc2UocHJvcCwgZm4sIGN1cnJlbnRQYXRoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy9Pbmx5IHN1cHBvcnQgdHlwZSBcImFycmF5XCIgd2hpY2ggaGF2ZSBhIHNjaGVtYSBhcyBcIml0ZW1zXCIuXG4gICAgICAgIGlmICghaWdub3JlQXJyYXlzICYmIHNjaGVtYS5pdGVtcykge1xuICAgICAgICAgIHZhciBhcnJQYXRoID0gcGF0aC5zbGljZSgpOyBhcnJQYXRoLnB1c2goJycpO1xuICAgICAgICAgIHRyYXZlcnNlKHNjaGVtYS5pdGVtcywgZm4sIGFyclBhdGgpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICB0cmF2ZXJzZShzY2hlbWEsIGZuLCBwYXRoIHx8IFtdKTtcbiAgICB9O1xuXG4gICAgc2VydmljZS50cmF2ZXJzZUZvcm0gPSBmdW5jdGlvbihmb3JtLCBmbikge1xuICAgICAgZm4oZm9ybSk7XG4gICAgICBhbmd1bGFyLmZvckVhY2goZm9ybS5pdGVtcywgZnVuY3Rpb24oZikge1xuICAgICAgICBzZXJ2aWNlLnRyYXZlcnNlRm9ybShmLCBmbik7XG4gICAgICB9KTtcblxuICAgICAgaWYgKGZvcm0udGFicykge1xuICAgICAgICBhbmd1bGFyLmZvckVhY2goZm9ybS50YWJzLCBmdW5jdGlvbih0YWIpIHtcbiAgICAgICAgICBhbmd1bGFyLmZvckVhY2godGFiLml0ZW1zLCBmdW5jdGlvbihmKSB7XG4gICAgICAgICAgICBzZXJ2aWNlLnRyYXZlcnNlRm9ybShmLCBmbik7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gc2VydmljZTtcbiAgfTtcblxufV0pO1xuXG4vKiAgQ29tbW9uIGNvZGUgZm9yIHZhbGlkYXRpbmcgYSB2YWx1ZSBhZ2FpbnN0IGl0cyBmb3JtIGFuZCBzY2hlbWEgZGVmaW5pdGlvbiAqL1xuLyogZ2xvYmFsIHR2NCAqL1xuYW5ndWxhci5tb2R1bGUoJ3NjaGVtYUZvcm0nKS5mYWN0b3J5KCdzZlZhbGlkYXRvcicsIFtmdW5jdGlvbigpIHtcblxuICB2YXIgdmFsaWRhdG9yID0ge307XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRlIGEgdmFsdWUgYWdhaW5zdCBpdHMgZm9ybSBkZWZpbml0aW9uIGFuZCBzY2hlbWEuXG4gICAqIFRoZSB2YWx1ZSBzaG91bGQgZWl0aGVyIGJlIG9mIHByb3BlciB0eXBlIG9yIGEgc3RyaW5nLCBzb21lIHR5cGVcbiAgICogY29lcmNpb24gaXMgYXBwbGllZC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IGZvcm0gQSBtZXJnZWQgZm9ybSBkZWZpbml0aW9uLCBpLmUuIG9uZSB3aXRoIGEgc2NoZW1hLlxuICAgKiBAcGFyYW0ge0FueX0gdmFsdWUgdGhlIHZhbHVlIHRvIHZhbGlkYXRlLlxuICAgKiBAcmV0dXJuIGEgdHY0anMgcmVzdWx0IG9iamVjdC5cbiAgICovXG4gIHZhbGlkYXRvci52YWxpZGF0ZSA9IGZ1bmN0aW9uKGZvcm0sIHZhbHVlKSB7XG4gICAgaWYgKCFmb3JtKSB7XG4gICAgICByZXR1cm4ge3ZhbGlkOiB0cnVlfTtcbiAgICB9XG4gICAgdmFyIHNjaGVtYSA9IGZvcm0uc2NoZW1hO1xuXG4gICAgaWYgKCFzY2hlbWEpIHtcbiAgICAgIHJldHVybiB7dmFsaWQ6IHRydWV9O1xuICAgIH1cblxuICAgIC8vIElucHV0IG9mIHR5cGUgdGV4dCBhbmQgdGV4dGFyZWFzIHdpbGwgZ2l2ZSB1cyBhIHZpZXdWYWx1ZSBvZiAnJ1xuICAgIC8vIHdoZW4gZW1wdHksIHRoaXMgaXMgYSB2YWxpZCB2YWx1ZSBpbiBhIHNjaGVtYSBhbmQgZG9lcyBub3QgY291bnQgYXMgc29tZXRoaW5nXG4gICAgLy8gdGhhdCBicmVha3MgdmFsaWRhdGlvbiBvZiAncmVxdWlyZWQnLiBCdXQgZm9yIG91ciBvd24gc2FuaXR5IGFuIGVtcHR5IGZpZWxkIHNob3VsZFxuICAgIC8vIG5vdCB2YWxpZGF0ZSBpZiBpdCdzIHJlcXVpcmVkLlxuICAgIGlmICh2YWx1ZSA9PT0gJycpIHtcbiAgICAgIHZhbHVlID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIC8vIE51bWJlcnMgZmllbGRzIHdpbGwgZ2l2ZSBhIG51bGwgdmFsdWUsIHdoaWNoIGFsc28gbWVhbnMgZW1wdHkgZmllbGRcbiAgICBpZiAoZm9ybS50eXBlID09PSAnbnVtYmVyJyAmJiB2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgdmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgLy8gVmVyc2lvbiA0IG9mIEpTT04gU2NoZW1hIGhhcyB0aGUgcmVxdWlyZWQgcHJvcGVydHkgbm90IG9uIHRoZVxuICAgIC8vIHByb3BlcnR5IGl0c2VsZiBidXQgb24gdGhlIHdyYXBwaW5nIG9iamVjdC4gU2luY2Ugd2UgbGlrZSB0byB0ZXN0XG4gICAgLy8gb25seSB0aGlzIHByb3BlcnR5IHdlIHdyYXAgaXQgaW4gYSBmYWtlIG9iamVjdC5cbiAgICB2YXIgd3JhcCA9IHt0eXBlOiAnb2JqZWN0JywgJ3Byb3BlcnRpZXMnOiB7fX07XG4gICAgdmFyIHByb3BOYW1lID0gZm9ybS5rZXlbZm9ybS5rZXkubGVuZ3RoIC0gMV07XG4gICAgd3JhcC5wcm9wZXJ0aWVzW3Byb3BOYW1lXSA9IHNjaGVtYTtcblxuICAgIGlmIChmb3JtLnJlcXVpcmVkKSB7XG4gICAgICB3cmFwLnJlcXVpcmVkID0gW3Byb3BOYW1lXTtcbiAgICB9XG4gICAgdmFyIHZhbHVlV3JhcCA9IHt9O1xuICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZCh2YWx1ZSkpIHtcbiAgICAgIHZhbHVlV3JhcFtwcm9wTmFtZV0gPSB2YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHR2NC52YWxpZGF0ZVJlc3VsdCh2YWx1ZVdyYXAsIHdyYXApO1xuXG4gIH07XG5cbiAgcmV0dXJuIHZhbGlkYXRvcjtcbn1dKTtcblxuLyoqXG4gKiBEaXJlY3RpdmUgdGhhdCBoYW5kbGVzIHRoZSBtb2RlbCBhcnJheXNcbiAqL1xuYW5ndWxhci5tb2R1bGUoJ3NjaGVtYUZvcm0nKS5kaXJlY3RpdmUoJ3NmQXJyYXknLCBbJ3NmU2VsZWN0JywgJ3NjaGVtYUZvcm0nLCAnc2ZWYWxpZGF0b3InLFxuICBmdW5jdGlvbihzZlNlbGVjdCwgc2NoZW1hRm9ybSwgc2ZWYWxpZGF0b3IpIHtcblxuICAgIHZhciBzZXRJbmRleCA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZm9ybSkge1xuICAgICAgICBpZiAoZm9ybS5rZXkpIHtcbiAgICAgICAgICBmb3JtLmtleVtmb3JtLmtleS5pbmRleE9mKCcnKV0gPSBpbmRleDtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICBzY29wZTogdHJ1ZSxcbiAgICAgIHJlcXVpcmU6ICc/bmdNb2RlbCcsXG4gICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIG5nTW9kZWwpIHtcbiAgICAgICAgdmFyIGZvcm1EZWZDYWNoZSA9IHt9O1xuXG4gICAgICAgIC8vIFdhdGNoIGZvciB0aGUgZm9ybSBkZWZpbml0aW9uIGFuZCB0aGVuIHJld3JpdGUgaXQuXG4gICAgICAgIC8vIEl0J3MgdGhlIChmaXJzdCkgYXJyYXkgcGFydCBvZiB0aGUga2V5LCAnW10nIHRoYXQgbmVlZHMgYSBudW1iZXJcbiAgICAgICAgLy8gY29ycmVzcG9uZGluZyB0byBhbiBpbmRleCBvZiB0aGUgZm9ybS5cbiAgICAgICAgdmFyIG9uY2UgPSBzY29wZS4kd2F0Y2goYXR0cnMuc2ZBcnJheSwgZnVuY3Rpb24oZm9ybSkge1xuXG4gICAgICAgICAgLy8gQW4gYXJyYXkgbW9kZWwgYWx3YXlzIG5lZWRzIGEga2V5IHNvIHdlIGtub3cgd2hhdCBwYXJ0IG9mIHRoZSBtb2RlbFxuICAgICAgICAgIC8vIHRvIGxvb2sgYXQuIFRoaXMgbWFrZXMgdXMgYSBiaXQgaW5jb21wYXRpYmxlIHdpdGggSlNPTiBGb3JtLCBvbiB0aGVcbiAgICAgICAgICAvLyBvdGhlciBoYW5kIGl0IGVuYWJsZXMgdHdvIHdheSBiaW5kaW5nLlxuICAgICAgICAgIHZhciBsaXN0ID0gc2ZTZWxlY3QoZm9ybS5rZXksIHNjb3BlLm1vZGVsKTtcblxuICAgICAgICAgIC8vIFNpbmNlIG5nLW1vZGVsIGhhcHBpbHkgY3JlYXRlcyBvYmplY3RzIGluIGEgZGVlcCBwYXRoIHdoZW4gc2V0dGluZyBhXG4gICAgICAgICAgLy8gYSB2YWx1ZSBidXQgbm90IGFycmF5cyB3ZSBuZWVkIHRvIGNyZWF0ZSB0aGUgYXJyYXkuXG4gICAgICAgICAgaWYgKGFuZ3VsYXIuaXNVbmRlZmluZWQobGlzdCkpIHtcbiAgICAgICAgICAgIGxpc3QgPSBbXTtcbiAgICAgICAgICAgIHNmU2VsZWN0KGZvcm0ua2V5LCBzY29wZS5tb2RlbCwgbGlzdCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHNjb3BlLm1vZGVsQXJyYXkgPSBsaXN0O1xuXG4gICAgICAgICAgLy8gQXJyYXlzIHdpdGggdGl0bGVNYXBzLCBpLmUuIGNoZWNrYm94ZXMgZG9lc24ndCBoYXZlIGl0ZW1zLlxuICAgICAgICAgIGlmIChmb3JtLml0ZW1zKSB7XG5cbiAgICAgICAgICAgIC8vIFRvIGJlIG1vcmUgY29tcGF0aWJsZSB3aXRoIEpTT04gRm9ybSB3ZSBzdXBwb3J0IGFuIGFycmF5IG9mIGl0ZW1zXG4gICAgICAgICAgICAvLyBpbiB0aGUgZm9ybSBkZWZpbml0aW9uIG9mIFwiYXJyYXlcIiAodGhlIHNjaGVtYSBqdXN0IGEgdmFsdWUpLlxuICAgICAgICAgICAgLy8gZm9yIHRoZSBzdWJmb3JtcyBjb2RlIHRvIHdvcmsgdGhpcyBtZWFucyB3ZSB3cmFwIGV2ZXJ5dGhpbmcgaW4gYVxuICAgICAgICAgICAgLy8gc2VjdGlvbi4gVW5sZXNzIHRoZXJlIGlzIGp1c3Qgb25lLlxuICAgICAgICAgICAgdmFyIHN1YkZvcm0gPSBmb3JtLml0ZW1zWzBdO1xuICAgICAgICAgICAgaWYgKGZvcm0uaXRlbXMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICBzdWJGb3JtID0ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdzZWN0aW9uJyxcbiAgICAgICAgICAgICAgICBpdGVtczogZm9ybS5pdGVtcy5tYXAoZnVuY3Rpb24oaXRlbSl7XG4gICAgICAgICAgICAgICAgICBpdGVtLm5nTW9kZWxPcHRpb25zID0gZm9ybS5uZ01vZGVsT3B0aW9ucztcbiAgICAgICAgICAgICAgICAgIGl0ZW0ucmVhZG9ubHkgPSBmb3JtLnJlYWRvbmx5O1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFdlIGNlYXRlIGNvcGllcyBvZiB0aGUgZm9ybSBvbiBkZW1hbmQsIGNhY2hpbmcgdGhlbSBmb3JcbiAgICAgICAgICAvLyBsYXRlciByZXF1ZXN0c1xuICAgICAgICAgIHNjb3BlLmNvcHlXaXRoSW5kZXggPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAgICAgaWYgKCFmb3JtRGVmQ2FjaGVbaW5kZXhdKSB7XG4gICAgICAgICAgICAgIGlmIChzdWJGb3JtKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvcHkgPSBhbmd1bGFyLmNvcHkoc3ViRm9ybSk7XG4gICAgICAgICAgICAgICAgY29weS5hcnJheUluZGV4ID0gaW5kZXg7XG4gICAgICAgICAgICAgICAgc2NoZW1hRm9ybS50cmF2ZXJzZUZvcm0oY29weSwgc2V0SW5kZXgoaW5kZXgpKTtcbiAgICAgICAgICAgICAgICBmb3JtRGVmQ2FjaGVbaW5kZXhdID0gY29weTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZvcm1EZWZDYWNoZVtpbmRleF07XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIHNjb3BlLmFwcGVuZFRvQXJyYXkgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBsZW4gPSBsaXN0Lmxlbmd0aDtcbiAgICAgICAgICAgIHZhciBjb3B5ID0gc2NvcGUuY29weVdpdGhJbmRleChsZW4pO1xuICAgICAgICAgICAgc2NoZW1hRm9ybS50cmF2ZXJzZUZvcm0oY29weSwgZnVuY3Rpb24ocGFydCkge1xuICAgICAgICAgICAgICBpZiAocGFydC5rZXkgJiYgYW5ndWxhci5pc0RlZmluZWQocGFydFsnZGVmYXVsdCddKSkge1xuICAgICAgICAgICAgICAgIHNmU2VsZWN0KHBhcnQua2V5LCBzY29wZS5tb2RlbCwgcGFydFsnZGVmYXVsdCddKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIElmIHRoZXJlIGFyZSBubyBkZWZhdWx0cyBub3RoaW5nIGlzIGFkZGVkIHNvIHdlIG5lZWQgdG8gaW5pdGlhbGl6ZVxuICAgICAgICAgICAgLy8gdGhlIGFycmF5LiB1bmRlZmluZWQgZm9yIGJhc2ljIHZhbHVlcywge30gb3IgW10gZm9yIHRoZSBvdGhlcnMuXG4gICAgICAgICAgICBpZiAobGVuID09PSBsaXN0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICB2YXIgdHlwZSA9IHNmU2VsZWN0KCdzY2hlbWEuaXRlbXMudHlwZScsIGZvcm0pO1xuICAgICAgICAgICAgICB2YXIgZGZsdDtcbiAgICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgZGZsdCA9IHt9O1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdhcnJheScpIHtcbiAgICAgICAgICAgICAgICBkZmx0ID0gW107XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgbGlzdC5wdXNoKGRmbHQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBUcmlnZ2VyIHZhbGlkYXRpb24uXG4gICAgICAgICAgICBpZiAoc2NvcGUudmFsaWRhdGVBcnJheSkge1xuICAgICAgICAgICAgICBzY29wZS52YWxpZGF0ZUFycmF5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbGlzdDtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgc2NvcGUuZGVsZXRlRnJvbUFycmF5ID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgICAgIGxpc3Quc3BsaWNlKGluZGV4LCAxKTtcblxuICAgICAgICAgICAgLy8gVHJpZ2dlciB2YWxpZGF0aW9uLlxuICAgICAgICAgICAgaWYgKHNjb3BlLnZhbGlkYXRlQXJyYXkpIHtcbiAgICAgICAgICAgICAgc2NvcGUudmFsaWRhdGVBcnJheSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGxpc3Q7XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIC8vIEFsd2F5cyBzdGFydCB3aXRoIG9uZSBlbXB0eSBmb3JtIHVubGVzcyBjb25maWd1cmVkIG90aGVyd2lzZS5cbiAgICAgICAgICAvLyBTcGVjaWFsIGNhc2U6IGRvbid0IGRvIGl0IGlmIGZvcm0gaGFzIGEgdGl0bGVNYXBcbiAgICAgICAgICBpZiAoIWZvcm0udGl0bGVNYXAgJiYgZm9ybS5zdGFydEVtcHR5ICE9PSB0cnVlICYmIGxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBzY29wZS5hcHBlbmRUb0FycmF5KCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gVGl0bGUgTWFwIGhhbmRsaW5nXG4gICAgICAgICAgLy8gSWYgZm9ybSBoYXMgYSB0aXRsZU1hcCBjb25maWd1cmVkIHdlJ2QgbGlrZSB0byBlbmFibGUgbG9vcGluZyBvdmVyXG4gICAgICAgICAgLy8gdGl0bGVNYXAgaW5zdGVhZCBvZiBtb2RlbEFycmF5LCB0aGlzIGlzIHVzZWQgZm9yIGludGFuY2UgaW5cbiAgICAgICAgICAvLyBjaGVja2JveGVzLiBTbyBpbnN0ZWFkIG9mIHZhcmlhYmxlIG51bWJlciBvZiB0aGluZ3Mgd2UgbGlrZSB0byBjcmVhdGVcbiAgICAgICAgICAvLyBhIGFycmF5IHZhbHVlIGZyb20gYSBzdWJzZXQgb2YgdmFsdWVzIGluIHRoZSB0aXRsZU1hcC5cbiAgICAgICAgICAvLyBUaGUgcHJvYmxlbSBoZXJlIGlzIHRoYXQgbmctbW9kZWwgb24gYSBjaGVja2JveCBkb2Vzbid0IHJlYWxseSBtYXAgdG9cbiAgICAgICAgICAvLyBhIGxpc3Qgb2YgdmFsdWVzLiBUaGlzIGlzIGhlcmUgdG8gZml4IHRoYXQuXG4gICAgICAgICAgaWYgKGZvcm0udGl0bGVNYXAgJiYgZm9ybS50aXRsZU1hcC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBzY29wZS50aXRsZU1hcFZhbHVlcyA9IFtdO1xuXG4gICAgICAgICAgICAvLyBXZSB3YXRjaCB0aGUgbW9kZWwgZm9yIGNoYW5nZXMgYW5kIHRoZSB0aXRsZU1hcFZhbHVlcyB0byByZWZsZWN0XG4gICAgICAgICAgICAvLyB0aGUgbW9kZWxBcnJheVxuICAgICAgICAgICAgdmFyIHVwZGF0ZVRpdGxlTWFwVmFsdWVzID0gZnVuY3Rpb24oYXJyKSB7XG4gICAgICAgICAgICAgIHNjb3BlLnRpdGxlTWFwVmFsdWVzID0gW107XG4gICAgICAgICAgICAgIGFyciA9IGFyciB8fCBbXTtcblxuICAgICAgICAgICAgICBmb3JtLnRpdGxlTWFwLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgIHNjb3BlLnRpdGxlTWFwVmFsdWVzLnB1c2goYXJyLmluZGV4T2YoaXRlbS52YWx1ZSkgIT09IC0xKTtcbiAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvL0NhdGNoIGRlZmF1bHQgdmFsdWVzXG4gICAgICAgICAgICB1cGRhdGVUaXRsZU1hcFZhbHVlcyhzY29wZS5tb2RlbEFycmF5KTtcbiAgICAgICAgICAgIHNjb3BlLiR3YXRjaENvbGxlY3Rpb24oJ21vZGVsQXJyYXknLCB1cGRhdGVUaXRsZU1hcFZhbHVlcyk7XG5cbiAgICAgICAgICAgIC8vVG8gZ2V0IHR3byB3YXkgYmluZGluZyB3ZSBhbHNvIHdhdGNoIG91ciB0aXRsZU1hcFZhbHVlc1xuICAgICAgICAgICAgc2NvcGUuJHdhdGNoQ29sbGVjdGlvbigndGl0bGVNYXBWYWx1ZXMnLCBmdW5jdGlvbih2YWxzKSB7XG4gICAgICAgICAgICAgIGlmICh2YWxzKSB7XG4gICAgICAgICAgICAgICAgdmFyIGFyciA9IHNjb3BlLm1vZGVsQXJyYXk7XG5cbiAgICAgICAgICAgICAgICAvLyBBcHBhcmVudGx5IHRoZSBmYXN0ZXN0IHdheSB0byBjbGVhciBhbiBhcnJheSwgcmVhZGFibGUgdG9vLlxuICAgICAgICAgICAgICAgIC8vIGh0dHA6Ly9qc3BlcmYuY29tL2FycmF5LWRlc3Ryb3kvMzJcbiAgICAgICAgICAgICAgICB3aGlsZSAoYXJyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgIGFyci5zaGlmdCgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGZvcm0udGl0bGVNYXAuZm9yRWFjaChmdW5jdGlvbihpdGVtLCBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgaWYgKHZhbHNbaW5kZXhdKSB7XG4gICAgICAgICAgICAgICAgICAgIGFyci5wdXNoKGl0ZW0udmFsdWUpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIElmIHRoZXJlIGlzIGEgbmdNb2RlbCBwcmVzZW50IHdlIG5lZWQgdG8gdmFsaWRhdGUgd2hlbiBhc2tlZC5cbiAgICAgICAgICBpZiAobmdNb2RlbCkge1xuICAgICAgICAgICAgdmFyIGVycm9yO1xuXG4gICAgICAgICAgICBzY29wZS52YWxpZGF0ZUFycmF5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIC8vIFRoZSBhY3R1YWwgY29udGVudCBvZiB0aGUgYXJyYXkgaXMgdmFsaWRhdGVkIGJ5IGVhY2ggZmllbGRcbiAgICAgICAgICAgICAgLy8gc28gd2Ugc2V0dGxlIGZvciBjaGVja2luZyB2YWxpZGF0aW9ucyBzcGVjaWZpYyB0byBhcnJheXNcblxuICAgICAgICAgICAgICAvLyBTaW5jZSB3ZSBwcmVmaWxsIHdpdGggZW1wdHkgYXJyYXlzIHdlIGNhbiBnZXQgdGhlIGZ1bm55IHNpdHVhdGlvblxuICAgICAgICAgICAgICAvLyB3aGVyZSB0aGUgYXJyYXkgaXMgcmVxdWlyZWQgYnV0IGVtcHR5IGluIHRoZSBndWkgYnV0IHN0aWxsIHZhbGlkYXRlcy5cbiAgICAgICAgICAgICAgLy8gVGhhdHMgd2h5IHdlIGNoZWNrIHRoZSBsZW5ndGguXG4gICAgICAgICAgICAgIHZhciByZXN1bHQgPSBzZlZhbGlkYXRvci52YWxpZGF0ZShcbiAgICAgICAgICAgICAgICBmb3JtLFxuICAgICAgICAgICAgICAgIHNjb3BlLm1vZGVsQXJyYXkubGVuZ3RoID4gMCA/IHNjb3BlLm1vZGVsQXJyYXkgOiB1bmRlZmluZWRcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgaWYgKHJlc3VsdC52YWxpZCA9PT0gZmFsc2UgJiZcbiAgICAgICAgICAgICAgICAgIHJlc3VsdC5lcnJvciAmJlxuICAgICAgICAgICAgICAgICAgKHJlc3VsdC5lcnJvci5kYXRhUGF0aCA9PT0gJycgfHxcbiAgICAgICAgICAgICAgICAgIHJlc3VsdC5lcnJvci5kYXRhUGF0aCA9PT0gJy8nICsgZm9ybS5rZXlbZm9ybS5rZXkubGVuZ3RoIC0gMV0pKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBTZXQgdmlld1ZhbHVlIHRvIHRyaWdnZXIgJGRpcnR5IG9uIGZpZWxkLiBJZiBzb21lb25lIGtub3dzIGFcbiAgICAgICAgICAgICAgICAvLyBhIGJldHRlciB3YXkgdG8gZG8gaXQgcGxlYXNlIHRlbGwuXG4gICAgICAgICAgICAgICAgbmdNb2RlbC4kc2V0Vmlld1ZhbHVlKHNjb3BlLm1vZGVsQXJyYXkpO1xuICAgICAgICAgICAgICAgIGVycm9yID0gcmVzdWx0LmVycm9yO1xuICAgICAgICAgICAgICAgIG5nTW9kZWwuJHNldFZhbGlkaXR5KCdzY2hlbWEnLCBmYWxzZSk7XG5cbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZ01vZGVsLiRzZXRWYWxpZGl0eSgnc2NoZW1hJywgdHJ1ZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNjb3BlLiRvbignc2NoZW1hRm9ybVZhbGlkYXRlJywgc2NvcGUudmFsaWRhdGVBcnJheSk7XG5cbiAgICAgICAgICAgIHNjb3BlLmhhc1N1Y2Nlc3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIG5nTW9kZWwuJHZhbGlkICYmICFuZ01vZGVsLiRwcmlzdGluZTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNjb3BlLmhhc0Vycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBuZ01vZGVsLiRpbnZhbGlkO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2NvcGUuc2NoZW1hRXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGVycm9yO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgIH1cblxuICAgICAgICAgIG9uY2UoKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXSk7XG5cbi8qKlxuICogQSB2ZXJzaW9uIG9mIG5nLWNoYW5nZWQgdGhhdCBvbmx5IGxpc3RlbnMgaWZcbiAqIHRoZXJlIGlzIGFjdHVhbGx5IGEgb25DaGFuZ2UgZGVmaW5lZCBvbiB0aGUgZm9ybVxuICpcbiAqIFRha2VzIHRoZSBmb3JtIGRlZmluaXRpb24gYXMgYXJndW1lbnQuXG4gKiBJZiB0aGUgZm9ybSBkZWZpbml0aW9uIGhhcyBhIFwib25DaGFuZ2VcIiBkZWZpbmVkIGFzIGVpdGhlciBhIGZ1bmN0aW9uIG9yXG4gKi9cbmFuZ3VsYXIubW9kdWxlKCdzY2hlbWFGb3JtJykuZGlyZWN0aXZlKCdzZkNoYW5nZWQnLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHtcbiAgICByZXF1aXJlOiAnbmdNb2RlbCcsXG4gICAgcmVzdHJpY3Q6ICdBQycsXG4gICAgc2NvcGU6IGZhbHNlLFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xuICAgICAgdmFyIGZvcm0gPSBzY29wZS4kZXZhbChhdHRycy5zZkNoYW5nZWQpO1xuICAgICAgLy9cImZvcm1cIiBpcyByZWFsbHkgZ3VhcmFudGVlZCB0byBiZSBoZXJlIHNpbmNlIHRoZSBkZWNvcmF0b3IgZGlyZWN0aXZlXG4gICAgICAvL3dhaXRzIGZvciBpdC4gQnV0IGJlc3QgYmUgc3VyZS5cbiAgICAgIGlmIChmb3JtICYmIGZvcm0ub25DaGFuZ2UpIHtcbiAgICAgICAgY3RybC4kdmlld0NoYW5nZUxpc3RlbmVycy5wdXNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24oZm9ybS5vbkNoYW5nZSkpIHtcbiAgICAgICAgICAgIGZvcm0ub25DaGFuZ2UoY3RybC4kbW9kZWxWYWx1ZSwgZm9ybSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNjb3BlLmV2YWxFeHByKGZvcm0ub25DaGFuZ2UsIHsnbW9kZWxWYWx1ZSc6IGN0cmwuJG1vZGVsVmFsdWUsIGZvcm06IGZvcm19KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn0pO1xuXG4vKlxuRklYTUU6IHJlYWwgZG9jdW1lbnRhdGlvblxuPGZvcm0gc2YtZm9ybT1cImZvcm1cIiAgc2Ytc2NoZW1hPVwic2NoZW1hXCIgc2YtZGVjb3JhdG9yPVwiZm9vYmFyXCI+PC9mb3JtPlxuKi9cblxuYW5ndWxhci5tb2R1bGUoJ3NjaGVtYUZvcm0nKVxuICAgICAgIC5kaXJlY3RpdmUoJ3NmU2NoZW1hJyxcblsnJGNvbXBpbGUnLCAnc2NoZW1hRm9ybScsICdzY2hlbWFGb3JtRGVjb3JhdG9ycycsICdzZlNlbGVjdCcsXG4gIGZ1bmN0aW9uKCRjb21waWxlLCAgc2NoZW1hRm9ybSwgIHNjaGVtYUZvcm1EZWNvcmF0b3JzLCBzZlNlbGVjdCkge1xuXG4gICAgdmFyIFNOQUtFX0NBU0VfUkVHRVhQID0gL1tBLVpdL2c7XG4gICAgdmFyIHNuYWtlQ2FzZSA9IGZ1bmN0aW9uKG5hbWUsIHNlcGFyYXRvcikge1xuICAgICAgc2VwYXJhdG9yID0gc2VwYXJhdG9yIHx8ICdfJztcbiAgICAgIHJldHVybiBuYW1lLnJlcGxhY2UoU05BS0VfQ0FTRV9SRUdFWFAsIGZ1bmN0aW9uKGxldHRlciwgcG9zKSB7XG4gICAgICAgIHJldHVybiAocG9zID8gc2VwYXJhdG9yIDogJycpICsgbGV0dGVyLnRvTG93ZXJDYXNlKCk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHNjb3BlOiB7XG4gICAgICAgIHNjaGVtYTogJz1zZlNjaGVtYScsXG4gICAgICAgIGluaXRpYWxGb3JtOiAnPXNmRm9ybScsXG4gICAgICAgIG1vZGVsOiAnPXNmTW9kZWwnLFxuICAgICAgICBvcHRpb25zOiAnPXNmT3B0aW9ucydcbiAgICAgIH0sXG4gICAgICBjb250cm9sbGVyOiBbJyRzY29wZScsIGZ1bmN0aW9uKCRzY29wZSkge1xuICAgICAgICB0aGlzLmV2YWxJblBhcmVudFNjb3BlID0gZnVuY3Rpb24oZXhwciwgbG9jYWxzKSB7XG4gICAgICAgICAgcmV0dXJuICRzY29wZS4kcGFyZW50LiRldmFsKGV4cHIsIGxvY2Fscyk7XG4gICAgICAgIH07XG4gICAgICB9XSxcbiAgICAgIHJlcGxhY2U6IGZhbHNlLFxuICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICByZXF1aXJlOiAnP2Zvcm0nLFxuICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBmb3JtQ3RybCwgdHJhbnNjbHVkZSkge1xuXG4gICAgICAgIC8vZXhwb3NlIGZvcm0gY29udHJvbGxlciBvbiBzY29wZSBzbyB0aGF0IHdlIGRvbid0IGZvcmNlIGF1dGhvcnMgdG8gdXNlIG5hbWUgb24gZm9ybVxuICAgICAgICBzY29wZS5mb3JtQ3RybCA9IGZvcm1DdHJsO1xuXG4gICAgICAgIC8vV2UnZCBsaWtlIHRvIGhhbmRsZSBleGlzdGluZyBtYXJrdXAsXG4gICAgICAgIC8vYmVzaWRlcyB1c2luZyBpdCBpbiBvdXIgdGVtcGxhdGUgd2UgYWxzb1xuICAgICAgICAvL2NoZWNrIGZvciBuZy1tb2RlbCBhbmQgYWRkIHRoYXQgdG8gYW4gaWdub3JlIGxpc3RcbiAgICAgICAgLy9pLmUuIGV2ZW4gaWYgZm9ybSBoYXMgYSBkZWZpbml0aW9uIGZvciBpdCBvciBmb3JtIGlzIFtcIipcIl1cbiAgICAgICAgLy93ZSBkb24ndCBnZW5lcmF0ZSBpdC5cbiAgICAgICAgdmFyIGlnbm9yZSA9IHt9O1xuICAgICAgICB0cmFuc2NsdWRlKHNjb3BlLCBmdW5jdGlvbihjbG9uZSkge1xuICAgICAgICAgIGNsb25lLmFkZENsYXNzKCdzY2hlbWEtZm9ybS1pZ25vcmUnKTtcbiAgICAgICAgICBlbGVtZW50LnByZXBlbmQoY2xvbmUpO1xuXG4gICAgICAgICAgaWYgKGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvckFsbCkge1xuICAgICAgICAgICAgdmFyIG1vZGVscyA9IGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvckFsbCgnW25nLW1vZGVsXScpO1xuICAgICAgICAgICAgaWYgKG1vZGVscykge1xuICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vZGVscy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBrZXkgPSBtb2RlbHNbaV0uZ2V0QXR0cmlidXRlKCduZy1tb2RlbCcpO1xuICAgICAgICAgICAgICAgIC8vc2tpcCBmaXJzdCBwYXJ0IGJlZm9yZSAuXG4gICAgICAgICAgICAgICAgaWdub3JlW2tleS5zdWJzdHJpbmcoa2V5LmluZGV4T2YoJy4nKSArIDEpXSA9IHRydWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAvL1NpbmNlIHdlIGFyZSBkZXBlbmRhbnQgb24gdXAgdG8gdGhyZWVcbiAgICAgICAgLy9hdHRyaWJ1dGVzIHdlJ2xsIGRvIGEgY29tbW9uIHdhdGNoXG4gICAgICAgIHZhciBsYXN0RGlnZXN0ID0ge307XG5cbiAgICAgICAgc2NvcGUuJHdhdGNoKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgdmFyIHNjaGVtYSA9IHNjb3BlLnNjaGVtYTtcbiAgICAgICAgICB2YXIgZm9ybSAgID0gc2NvcGUuaW5pdGlhbEZvcm0gfHwgWycqJ107XG5cbiAgICAgICAgICAvL1RoZSBjaGVjayBmb3Igc2NoZW1hLnR5cGUgaXMgdG8gZW5zdXJlIHRoYXQgc2NoZW1hIGlzIG5vdCB7fVxuICAgICAgICAgIGlmIChmb3JtICYmIHNjaGVtYSAmJiBzY2hlbWEudHlwZSAmJlxuICAgICAgICAgICAgICAobGFzdERpZ2VzdC5mb3JtICE9PSBmb3JtIHx8IGxhc3REaWdlc3Quc2NoZW1hICE9PSBzY2hlbWEpICYmXG4gICAgICAgICAgICAgIE9iamVjdC5rZXlzKHNjaGVtYS5wcm9wZXJ0aWVzKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBsYXN0RGlnZXN0LnNjaGVtYSA9IHNjaGVtYTtcbiAgICAgICAgICAgIGxhc3REaWdlc3QuZm9ybSA9IGZvcm07XG5cbiAgICAgICAgICAgIHZhciBtZXJnZWQgPSBzY2hlbWFGb3JtLm1lcmdlKHNjaGVtYSwgZm9ybSwgaWdub3JlLCBzY29wZS5vcHRpb25zKTtcbiAgICAgICAgICAgIHZhciBmcmFnID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuXG4gICAgICAgICAgICAvL21ha2UgdGhlIGZvcm0gYXZhaWxhYmxlIHRvIGRlY29yYXRvcnNcbiAgICAgICAgICAgIHNjb3BlLnNjaGVtYUZvcm0gID0ge2Zvcm06ICBtZXJnZWQsIHNjaGVtYTogc2NoZW1hfTtcblxuICAgICAgICAgICAgLy9jbGVhbiBhbGwgYnV0IHByZSBleGlzdGluZyBodG1sLlxuICAgICAgICAgICAgZWxlbWVudC5jaGlsZHJlbignOm5vdCguc2NoZW1hLWZvcm0taWdub3JlKScpLnJlbW92ZSgpO1xuXG4gICAgICAgICAgICAvL0NyZWF0ZSBkaXJlY3RpdmVzIGZyb20gdGhlIGZvcm0gZGVmaW5pdGlvblxuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKG1lcmdlZCxmdW5jdGlvbihvYmosaSl7XG4gICAgICAgICAgICAgIHZhciBuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChhdHRycy5zZkRlY29yYXRvciB8fCBzbmFrZUNhc2Uoc2NoZW1hRm9ybURlY29yYXRvcnMuZGVmYXVsdERlY29yYXRvciwnLScpKTtcbiAgICAgICAgICAgICAgbi5zZXRBdHRyaWJ1dGUoJ2Zvcm0nLCdzY2hlbWFGb3JtLmZvcm1bJytpKyddJyk7XG4gICAgICAgICAgICAgIHZhciBzbG90O1xuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHNsb3QgPSBlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJypbc2YtaW5zZXJ0LWZpZWxkPVwiJyArIG9iai5rZXkgKyAnXCJdJyk7XG4gICAgICAgICAgICAgIH0gY2F0Y2goZXJyKSB7XG4gICAgICAgICAgICAgICAgLy8gZmllbGQgaW5zZXJ0aW9uIG5vdCBzdXBwb3J0ZWQgZm9yIGNvbXBsZXgga2V5c1xuICAgICAgICAgICAgICAgIHNsb3QgPSBudWxsO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmKHNsb3QpIHtcbiAgICAgICAgICAgICAgICBzbG90LmlubmVySFRNTCA9IFwiXCI7XG4gICAgICAgICAgICAgICAgc2xvdC5hcHBlbmRDaGlsZChuKTsgIFxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZyYWcuYXBwZW5kQ2hpbGQobik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBlbGVtZW50WzBdLmFwcGVuZENoaWxkKGZyYWcpO1xuXG4gICAgICAgICAgICAvL2NvbXBpbGUgb25seSBjaGlsZHJlblxuICAgICAgICAgICAgJGNvbXBpbGUoZWxlbWVudC5jaGlsZHJlbigpKShzY29wZSk7XG5cbiAgICAgICAgICAgIC8vb2ssIG5vdyB0aGF0IHRoYXQgaXMgZG9uZSBsZXQncyBzZXQgYW55IGRlZmF1bHRzXG4gICAgICAgICAgICBzY2hlbWFGb3JtLnRyYXZlcnNlU2NoZW1hKHNjaGVtYSwgZnVuY3Rpb24ocHJvcCwgcGF0aCkge1xuICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQocHJvcFsnZGVmYXVsdCddKSkge1xuICAgICAgICAgICAgICAgIHZhciB2YWwgPSBzZlNlbGVjdChwYXRoLCBzY29wZS5tb2RlbCk7XG4gICAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNVbmRlZmluZWQodmFsKSkge1xuICAgICAgICAgICAgICAgICAgc2ZTZWxlY3QocGF0aCwgc2NvcGUubW9kZWwsIHByb3BbJ2RlZmF1bHQnXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gIH1cbl0pO1xuXG5hbmd1bGFyLm1vZHVsZSgnc2NoZW1hRm9ybScpLmRpcmVjdGl2ZSgnc2NoZW1hVmFsaWRhdGUnLCBbJ3NmVmFsaWRhdG9yJywgZnVuY3Rpb24oc2ZWYWxpZGF0b3IpIHtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0EnLFxuICAgIHNjb3BlOiBmYWxzZSxcbiAgICAvLyBXZSB3YW50IHRoZSBsaW5rIGZ1bmN0aW9uIHRvIGJlICphZnRlciogdGhlIGlucHV0IGRpcmVjdGl2ZXMgbGluayBmdW5jdGlvbiBzbyB3ZSBnZXQgYWNjZXNzXG4gICAgLy8gdGhlIHBhcnNlZCB2YWx1ZSwgZXguIGEgbnVtYmVyIGluc3RlYWQgb2YgYSBzdHJpbmdcbiAgICBwcmlvcml0eTogMTAwMCxcbiAgICByZXF1aXJlOiAnbmdNb2RlbCcsXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBuZ01vZGVsKSB7XG4gICAgICAvL1NpbmNlIHdlIGhhdmUgc2NvcGUgZmFsc2UgdGhpcyBpcyB0aGUgc2FtZSBzY29wZVxuICAgICAgLy9hcyB0aGUgZGVjb3JhdG9yXG4gICAgICBzY29wZS5uZ01vZGVsID0gbmdNb2RlbDtcblxuICAgICAgdmFyIGVycm9yID0gbnVsbDtcblxuICAgICAgdmFyIGdldEZvcm0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCFmb3JtKSB7XG4gICAgICAgICAgZm9ybSA9IHNjb3BlLiRldmFsKGF0dHJzLnNjaGVtYVZhbGlkYXRlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZm9ybTtcbiAgICAgIH07XG4gICAgICB2YXIgZm9ybSAgID0gZ2V0Rm9ybSgpO1xuXG4gICAgICAvLyBWYWxpZGF0ZSBhZ2FpbnN0IHRoZSBzY2hlbWEuXG5cbiAgICAgIC8vIEdldCBpbiBsYXN0IG9mIHRoZSBwYXJzZXMgc28gdGhlIHBhcnNlZCB2YWx1ZSBoYXMgdGhlIGNvcnJlY3QgdHlwZS5cbiAgICAgIGlmIChuZ01vZGVsLiR2YWxpZGF0b3JzKSB7IC8vIEFuZ3VsYXIgMS4zXG4gICAgICAgIG5nTW9kZWwuJHZhbGlkYXRvcnMuc2NoZW1hID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICB2YXIgcmVzdWx0ID0gc2ZWYWxpZGF0b3IudmFsaWRhdGUoZ2V0Rm9ybSgpLCB2YWx1ZSk7XG4gICAgICAgICAgZXJyb3IgPSByZXN1bHQuZXJyb3I7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdC52YWxpZDtcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgLy8gQW5ndWxhciAxLjJcbiAgICAgICAgbmdNb2RlbC4kcGFyc2Vycy5wdXNoKGZ1bmN0aW9uKHZpZXdWYWx1ZSkge1xuICAgICAgICAgIGZvcm0gPSBnZXRGb3JtKCk7XG4gICAgICAgICAgLy9TdGlsbCBtaWdodCBiZSB1bmRlZmluZWRcbiAgICAgICAgICBpZiAoIWZvcm0pIHtcbiAgICAgICAgICAgIHJldHVybiB2aWV3VmFsdWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIHJlc3VsdCA9ICBzZlZhbGlkYXRvci52YWxpZGF0ZShmb3JtLCB2aWV3VmFsdWUpO1xuXG4gICAgICAgICAgaWYgKHJlc3VsdC52YWxpZCkge1xuICAgICAgICAgICAgLy8gaXQgaXMgdmFsaWRcbiAgICAgICAgICAgIG5nTW9kZWwuJHNldFZhbGlkaXR5KCdzY2hlbWEnLCB0cnVlKTtcbiAgICAgICAgICAgIHJldHVybiB2aWV3VmFsdWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGl0IGlzIGludmFsaWQsIHJldHVybiB1bmRlZmluZWQgKG5vIG1vZGVsIHVwZGF0ZSlcbiAgICAgICAgICAgIG5nTW9kZWwuJHNldFZhbGlkaXR5KCdzY2hlbWEnLCBmYWxzZSk7XG4gICAgICAgICAgICBlcnJvciA9IHJlc3VsdC5lcnJvcjtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuXG4gICAgICAvLyBMaXN0ZW4gdG8gYW4gZXZlbnQgc28gd2UgY2FuIHZhbGlkYXRlIHRoZSBpbnB1dCBvbiByZXF1ZXN0XG4gICAgICBzY29wZS4kb24oJ3NjaGVtYUZvcm1WYWxpZGF0ZScsIGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIGlmIChuZ01vZGVsLiR2YWxpZGF0ZSkge1xuICAgICAgICAgIG5nTW9kZWwuJHZhbGlkYXRlKCk7XG4gICAgICAgICAgaWYgKG5nTW9kZWwuJGludmFsaWQpIHsgLy8gVGhlIGZpZWxkIG11c3QgYmUgbWFkZSBkaXJ0eSBzbyB0aGUgZXJyb3IgbWVzc2FnZSBpcyBkaXNwbGF5ZWRcbiAgICAgICAgICAgIG5nTW9kZWwuJGRpcnR5ID0gdHJ1ZTtcbiAgICAgICAgICAgIG5nTW9kZWwuJHByaXN0aW5lID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5nTW9kZWwuJHNldFZpZXdWYWx1ZShuZ01vZGVsLiR2aWV3VmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy9UaGlzIHdvcmtzIHNpbmNlIHdlIG5vdyB3ZSdyZSBpbnNpZGUgYSBkZWNvcmF0b3IgYW5kIHRoYXQgdGhpcyBpcyB0aGUgZGVjb3JhdG9ycyBzY29wZS5cbiAgICAgIC8vSWYgJHByaXN0aW5lIGFuZCBlbXB0eSBkb24ndCBzaG93IHN1Y2Nlc3MgKGV2ZW4gaWYgaXQncyB2YWxpZClcbiAgICAgIHNjb3BlLmhhc1N1Y2Nlc3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5nTW9kZWwuJHZhbGlkICYmICghbmdNb2RlbC4kcHJpc3RpbmUgfHwgIW5nTW9kZWwuJGlzRW1wdHkobmdNb2RlbC4kbW9kZWxWYWx1ZSkpO1xuICAgICAgfTtcblxuICAgICAgc2NvcGUuaGFzRXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5nTW9kZWwuJGludmFsaWQgJiYgIW5nTW9kZWwuJHByaXN0aW5lO1xuICAgICAgfTtcblxuICAgICAgc2NvcGUuc2NoZW1hRXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGVycm9yO1xuICAgICAgfTtcblxuICAgIH1cbiAgfTtcbn1dKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvT2JqZWN0UGF0aC5qcycpLk9iamVjdFBhdGg7XG4iLCIndXNlIHN0cmljdCc7XG5cbjshZnVuY3Rpb24odW5kZWZpbmVkKSB7XG5cblx0dmFyIE9iamVjdFBhdGggPSB7XG5cdFx0cGFyc2U6IGZ1bmN0aW9uKHN0cil7XG5cdFx0XHRpZih0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJyl7XG5cdFx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ09iamVjdFBhdGgucGFyc2UgbXVzdCBiZSBwYXNzZWQgYSBzdHJpbmcnKTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIGkgPSAwO1xuXHRcdFx0dmFyIHBhcnRzID0gW107XG5cdFx0XHR2YXIgZCwgYiwgcSwgYztcblx0XHRcdHdoaWxlIChpIDwgc3RyLmxlbmd0aCl7XG5cdFx0XHRcdGQgPSBzdHIuaW5kZXhPZignLicsIGkpO1xuXHRcdFx0XHRiID0gc3RyLmluZGV4T2YoJ1snLCBpKTtcblxuXHRcdFx0XHQvLyB3ZSd2ZSByZWFjaGVkIHRoZSBlbmRcblx0XHRcdFx0aWYgKGQgPT09IC0xICYmIGIgPT09IC0xKXtcblx0XHRcdFx0XHRwYXJ0cy5wdXNoKHN0ci5zbGljZShpLCBzdHIubGVuZ3RoKSk7XG5cdFx0XHRcdFx0aSA9IHN0ci5sZW5ndGg7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBkb3RzXG5cdFx0XHRcdGVsc2UgaWYgKGIgPT09IC0xIHx8IChkICE9PSAtMSAmJiBkIDwgYikpIHtcblx0XHRcdFx0XHRwYXJ0cy5wdXNoKHN0ci5zbGljZShpLCBkKSk7XG5cdFx0XHRcdFx0aSA9IGQgKyAxO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gYnJhY2tldHNcblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0aWYgKGIgPiBpKXtcblx0XHRcdFx0XHRcdHBhcnRzLnB1c2goc3RyLnNsaWNlKGksIGIpKTtcblx0XHRcdFx0XHRcdGkgPSBiO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRxID0gc3RyLnNsaWNlKGIrMSwgYisyKTtcblx0XHRcdFx0XHRpZiAocSAhPT0gJ1wiJyAmJiBxICE9PSdcXCcnKSB7XG5cdFx0XHRcdFx0XHRjID0gc3RyLmluZGV4T2YoJ10nLCBiKTtcblx0XHRcdFx0XHRcdGlmIChjID09PSAtMSkgYyA9IHN0ci5sZW5ndGg7XG5cdFx0XHRcdFx0XHRwYXJ0cy5wdXNoKHN0ci5zbGljZShpICsgMSwgYykpO1xuXHRcdFx0XHRcdFx0aSA9IChzdHIuc2xpY2UoYyArIDEsIGMgKyAyKSA9PT0gJy4nKSA/IGMgKyAyIDogYyArIDE7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGMgPSBzdHIuaW5kZXhPZihxKyddJywgYik7XG5cdFx0XHRcdFx0XHRpZiAoYyA9PT0gLTEpIGMgPSBzdHIubGVuZ3RoO1xuXHRcdFx0XHRcdFx0d2hpbGUgKHN0ci5zbGljZShjIC0gMSwgYykgPT09ICdcXFxcJyAmJiBiIDwgc3RyLmxlbmd0aCl7XG5cdFx0XHRcdFx0XHRcdGIrKztcblx0XHRcdFx0XHRcdFx0YyA9IHN0ci5pbmRleE9mKHErJ10nLCBiKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHBhcnRzLnB1c2goc3RyLnNsaWNlKGkgKyAyLCBjKS5yZXBsYWNlKG5ldyBSZWdFeHAoJ1xcXFwnK3EsJ2cnKSwgcSkpO1xuXHRcdFx0XHRcdFx0aSA9IChzdHIuc2xpY2UoYyArIDIsIGMgKyAzKSA9PT0gJy4nKSA/IGMgKyAzIDogYyArIDI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcGFydHM7XG5cdFx0fSxcblxuXHRcdC8vIHJvb3QgPT09IHRydWUgOiBhdXRvIGNhbGN1bGF0ZSByb290OyBtdXN0IGJlIGRvdC1ub3RhdGlvbiBmcmllbmRseVxuXHRcdC8vIHJvb3QgU3RyaW5nIDogdGhlIHN0cmluZyB0byB1c2UgYXMgcm9vdFxuXHRcdHN0cmluZ2lmeTogZnVuY3Rpb24oYXJyLCBxdW90ZSl7XG5cblx0XHRcdGlmKCFBcnJheS5pc0FycmF5KGFycikpXG5cdFx0XHRcdGFyciA9IFthcnIudG9TdHJpbmcoKV07XG5cblx0XHRcdHF1b3RlID0gcXVvdGUgPT09ICdcIicgPyAnXCInIDogJ1xcJyc7XG5cblx0XHRcdHJldHVybiBhcnIubWFwKGZ1bmN0aW9uKG4peyByZXR1cm4gJ1snICsgcXVvdGUgKyAobi50b1N0cmluZygpKS5yZXBsYWNlKG5ldyBSZWdFeHAocXVvdGUsICdnJyksICdcXFxcJyArIHF1b3RlKSArIHF1b3RlICsgJ10nOyB9KS5qb2luKCcnKTtcblx0XHR9LFxuXG5cdFx0bm9ybWFsaXplOiBmdW5jdGlvbihkYXRhLCBxdW90ZSl7XG5cdFx0XHRyZXR1cm4gT2JqZWN0UGF0aC5zdHJpbmdpZnkoQXJyYXkuaXNBcnJheShkYXRhKSA/IGRhdGEgOiBPYmplY3RQYXRoLnBhcnNlKGRhdGEpLCBxdW90ZSk7XG5cdFx0fVxuXHR9O1xuXG5cdC8vIEFNRFxuXHRpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG5cdFx0ZGVmaW5lKGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIE9iamVjdFBhdGg7XG5cdFx0fSk7XG5cdH1cblxuXHQvLyBDb21tb25KU1xuXHRlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcblx0XHRleHBvcnRzLk9iamVjdFBhdGggPSBPYmplY3RQYXRoO1xuXHR9XG5cblx0Ly8gQW5ndWxhclxuXHRlbHNlIGlmICh0eXBlb2YgYW5ndWxhciA9PT0gJ29iamVjdCcpIHtcblx0XHRhbmd1bGFyLm1vZHVsZSgnT2JqZWN0UGF0aCcsIFtdKS5wcm92aWRlcignT2JqZWN0UGF0aCcsIGZ1bmN0aW9uKCl7XG5cdFx0XHR0aGlzLnBhcnNlID0gT2JqZWN0UGF0aC5wYXJzZTtcblx0XHRcdHRoaXMuc3RyaW5naWZ5ID0gT2JqZWN0UGF0aC5zdHJpbmdpZnk7XG5cdFx0XHR0aGlzLm5vcm1hbGl6ZSA9IE9iamVjdFBhdGgubm9ybWFsaXplO1xuXHRcdFx0dGhpcy4kZ2V0ID0gZnVuY3Rpb24oKXtcblx0XHRcdFx0cmV0dXJuIE9iamVjdFBhdGg7XG5cdFx0XHR9O1xuXHRcdH0pO1xuXHR9XG5cblx0Ly8gQnJvd3NlciBnbG9iYWwuXG5cdGVsc2Uge1xuXHRcdHdpbmRvdy5PYmplY3RQYXRoID0gT2JqZWN0UGF0aDtcblx0fVxufSgpO1xuIiwiLypcbkF1dGhvcjogR2VyYWludCBMdWZmIGFuZCBvdGhlcnNcblllYXI6IDIwMTNcblxuVGhpcyBjb2RlIGlzIHJlbGVhc2VkIGludG8gdGhlIFwicHVibGljIGRvbWFpblwiIGJ5IGl0cyBhdXRob3IocykuICBBbnlib2R5IG1heSB1c2UsIGFsdGVyIGFuZCBkaXN0cmlidXRlIHRoZSBjb2RlIHdpdGhvdXQgcmVzdHJpY3Rpb24uICBUaGUgYXV0aG9yIG1ha2VzIG5vIGd1YXJhbnRlZXMsIGFuZCB0YWtlcyBubyBsaWFiaWxpdHkgb2YgYW55IGtpbmQgZm9yIHVzZSBvZiB0aGlzIGNvZGUuXG5cbklmIHlvdSBmaW5kIGEgYnVnIG9yIG1ha2UgYW4gaW1wcm92ZW1lbnQsIGl0IHdvdWxkIGJlIGNvdXJ0ZW91cyB0byBsZXQgdGhlIGF1dGhvciBrbm93LCBidXQgaXQgaXMgbm90IGNvbXB1bHNvcnkuXG4qL1xuKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cbiAgICBkZWZpbmUoW10sIGZhY3RvcnkpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKXtcbiAgICAvLyBDb21tb25KUy4gRGVmaW5lIGV4cG9ydC5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBCcm93c2VyIGdsb2JhbHNcbiAgICBnbG9iYWwudHY0ID0gZmFjdG9yeSgpO1xuICB9XG59KHRoaXMsIGZ1bmN0aW9uICgpIHtcblxuLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvT2JqZWN0L2tleXM/cmVkaXJlY3Rsb2NhbGU9ZW4tVVMmcmVkaXJlY3RzbHVnPUphdmFTY3JpcHQlMkZSZWZlcmVuY2UlMkZHbG9iYWxfT2JqZWN0cyUyRk9iamVjdCUyRmtleXNcbmlmICghT2JqZWN0LmtleXMpIHtcblx0T2JqZWN0LmtleXMgPSAoZnVuY3Rpb24gKCkge1xuXHRcdHZhciBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHksXG5cdFx0XHRoYXNEb250RW51bUJ1ZyA9ICEoe3RvU3RyaW5nOiBudWxsfSkucHJvcGVydHlJc0VudW1lcmFibGUoJ3RvU3RyaW5nJyksXG5cdFx0XHRkb250RW51bXMgPSBbXG5cdFx0XHRcdCd0b1N0cmluZycsXG5cdFx0XHRcdCd0b0xvY2FsZVN0cmluZycsXG5cdFx0XHRcdCd2YWx1ZU9mJyxcblx0XHRcdFx0J2hhc093blByb3BlcnR5Jyxcblx0XHRcdFx0J2lzUHJvdG90eXBlT2YnLFxuXHRcdFx0XHQncHJvcGVydHlJc0VudW1lcmFibGUnLFxuXHRcdFx0XHQnY29uc3RydWN0b3InXG5cdFx0XHRdLFxuXHRcdFx0ZG9udEVudW1zTGVuZ3RoID0gZG9udEVudW1zLmxlbmd0aDtcblxuXHRcdHJldHVybiBmdW5jdGlvbiAob2JqKSB7XG5cdFx0XHRpZiAodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcgJiYgdHlwZW9mIG9iaiAhPT0gJ2Z1bmN0aW9uJyB8fCBvYmogPT09IG51bGwpIHtcblx0XHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignT2JqZWN0LmtleXMgY2FsbGVkIG9uIG5vbi1vYmplY3QnKTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHJlc3VsdCA9IFtdO1xuXG5cdFx0XHRmb3IgKHZhciBwcm9wIGluIG9iaikge1xuXHRcdFx0XHRpZiAoaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSB7XG5cdFx0XHRcdFx0cmVzdWx0LnB1c2gocHJvcCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKGhhc0RvbnRFbnVtQnVnKSB7XG5cdFx0XHRcdGZvciAodmFyIGk9MDsgaSA8IGRvbnRFbnVtc0xlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0aWYgKGhhc093blByb3BlcnR5LmNhbGwob2JqLCBkb250RW51bXNbaV0pKSB7XG5cdFx0XHRcdFx0XHRyZXN1bHQucHVzaChkb250RW51bXNbaV0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9O1xuXHR9KSgpO1xufVxuLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvT2JqZWN0L2NyZWF0ZVxuaWYgKCFPYmplY3QuY3JlYXRlKSB7XG5cdE9iamVjdC5jcmVhdGUgPSAoZnVuY3Rpb24oKXtcblx0XHRmdW5jdGlvbiBGKCl7fVxuXG5cdFx0cmV0dXJuIGZ1bmN0aW9uKG8pe1xuXHRcdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggIT09IDEpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdPYmplY3QuY3JlYXRlIGltcGxlbWVudGF0aW9uIG9ubHkgYWNjZXB0cyBvbmUgcGFyYW1ldGVyLicpO1xuXHRcdFx0fVxuXHRcdFx0Ri5wcm90b3R5cGUgPSBvO1xuXHRcdFx0cmV0dXJuIG5ldyBGKCk7XG5cdFx0fTtcblx0fSkoKTtcbn1cbi8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5L2lzQXJyYXk/cmVkaXJlY3Rsb2NhbGU9ZW4tVVMmcmVkaXJlY3RzbHVnPUphdmFTY3JpcHQlMkZSZWZlcmVuY2UlMkZHbG9iYWxfT2JqZWN0cyUyRkFycmF5JTJGaXNBcnJheVxuaWYoIUFycmF5LmlzQXJyYXkpIHtcblx0QXJyYXkuaXNBcnJheSA9IGZ1bmN0aW9uICh2QXJnKSB7XG5cdFx0cmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2QXJnKSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiO1xuXHR9O1xufVxuLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXkvaW5kZXhPZj9yZWRpcmVjdGxvY2FsZT1lbi1VUyZyZWRpcmVjdHNsdWc9SmF2YVNjcmlwdCUyRlJlZmVyZW5jZSUyRkdsb2JhbF9PYmplY3RzJTJGQXJyYXklMkZpbmRleE9mXG5pZiAoIUFycmF5LnByb3RvdHlwZS5pbmRleE9mKSB7XG5cdEFycmF5LnByb3RvdHlwZS5pbmRleE9mID0gZnVuY3Rpb24gKHNlYXJjaEVsZW1lbnQgLyosIGZyb21JbmRleCAqLyApIHtcblx0XHRpZiAodGhpcyA9PT0gbnVsbCkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcigpO1xuXHRcdH1cblx0XHR2YXIgdCA9IE9iamVjdCh0aGlzKTtcblx0XHR2YXIgbGVuID0gdC5sZW5ndGggPj4+IDA7XG5cblx0XHRpZiAobGVuID09PSAwKSB7XG5cdFx0XHRyZXR1cm4gLTE7XG5cdFx0fVxuXHRcdHZhciBuID0gMDtcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcblx0XHRcdG4gPSBOdW1iZXIoYXJndW1lbnRzWzFdKTtcblx0XHRcdGlmIChuICE9PSBuKSB7IC8vIHNob3J0Y3V0IGZvciB2ZXJpZnlpbmcgaWYgaXQncyBOYU5cblx0XHRcdFx0biA9IDA7XG5cdFx0XHR9IGVsc2UgaWYgKG4gIT09IDAgJiYgbiAhPT0gSW5maW5pdHkgJiYgbiAhPT0gLUluZmluaXR5KSB7XG5cdFx0XHRcdG4gPSAobiA+IDAgfHwgLTEpICogTWF0aC5mbG9vcihNYXRoLmFicyhuKSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChuID49IGxlbikge1xuXHRcdFx0cmV0dXJuIC0xO1xuXHRcdH1cblx0XHR2YXIgayA9IG4gPj0gMCA/IG4gOiBNYXRoLm1heChsZW4gLSBNYXRoLmFicyhuKSwgMCk7XG5cdFx0Zm9yICg7IGsgPCBsZW47IGsrKykge1xuXHRcdFx0aWYgKGsgaW4gdCAmJiB0W2tdID09PSBzZWFyY2hFbGVtZW50KSB7XG5cdFx0XHRcdHJldHVybiBrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gLTE7XG5cdH07XG59XG5cbi8vIEdydW5nZXkgT2JqZWN0LmlzRnJvemVuIGhhY2tcbmlmICghT2JqZWN0LmlzRnJvemVuKSB7XG5cdE9iamVjdC5pc0Zyb3plbiA9IGZ1bmN0aW9uIChvYmopIHtcblx0XHR2YXIga2V5ID0gXCJ0djRfdGVzdF9mcm96ZW5fa2V5XCI7XG5cdFx0d2hpbGUgKG9iai5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG5cdFx0XHRrZXkgKz0gTWF0aC5yYW5kb20oKTtcblx0XHR9XG5cdFx0dHJ5IHtcblx0XHRcdG9ialtrZXldID0gdHJ1ZTtcblx0XHRcdGRlbGV0ZSBvYmpba2V5XTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH07XG59XG4vLyBCYXNlZCBvbjogaHR0cHM6Ly9naXRodWIuY29tL2dlcmFpbnRsdWZmL3VyaS10ZW1wbGF0ZXMsIGJ1dCB3aXRoIGFsbCB0aGUgZGUtc3Vic3RpdHV0aW9uIHN0dWZmIHJlbW92ZWRcblxudmFyIHVyaVRlbXBsYXRlR2xvYmFsTW9kaWZpZXJzID0ge1xuXHRcIitcIjogdHJ1ZSxcblx0XCIjXCI6IHRydWUsXG5cdFwiLlwiOiB0cnVlLFxuXHRcIi9cIjogdHJ1ZSxcblx0XCI7XCI6IHRydWUsXG5cdFwiP1wiOiB0cnVlLFxuXHRcIiZcIjogdHJ1ZVxufTtcbnZhciB1cmlUZW1wbGF0ZVN1ZmZpY2VzID0ge1xuXHRcIipcIjogdHJ1ZVxufTtcblxuZnVuY3Rpb24gbm90UmVhbGx5UGVyY2VudEVuY29kZShzdHJpbmcpIHtcblx0cmV0dXJuIGVuY29kZVVSSShzdHJpbmcpLnJlcGxhY2UoLyUyNVswLTldWzAtOV0vZywgZnVuY3Rpb24gKGRvdWJsZUVuY29kZWQpIHtcblx0XHRyZXR1cm4gXCIlXCIgKyBkb3VibGVFbmNvZGVkLnN1YnN0cmluZygzKTtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIHVyaVRlbXBsYXRlU3Vic3RpdHV0aW9uKHNwZWMpIHtcblx0dmFyIG1vZGlmaWVyID0gXCJcIjtcblx0aWYgKHVyaVRlbXBsYXRlR2xvYmFsTW9kaWZpZXJzW3NwZWMuY2hhckF0KDApXSkge1xuXHRcdG1vZGlmaWVyID0gc3BlYy5jaGFyQXQoMCk7XG5cdFx0c3BlYyA9IHNwZWMuc3Vic3RyaW5nKDEpO1xuXHR9XG5cdHZhciBzZXBhcmF0b3IgPSBcIlwiO1xuXHR2YXIgcHJlZml4ID0gXCJcIjtcblx0dmFyIHNob3VsZEVzY2FwZSA9IHRydWU7XG5cdHZhciBzaG93VmFyaWFibGVzID0gZmFsc2U7XG5cdHZhciB0cmltRW1wdHlTdHJpbmcgPSBmYWxzZTtcblx0aWYgKG1vZGlmaWVyID09PSAnKycpIHtcblx0XHRzaG91bGRFc2NhcGUgPSBmYWxzZTtcblx0fSBlbHNlIGlmIChtb2RpZmllciA9PT0gXCIuXCIpIHtcblx0XHRwcmVmaXggPSBcIi5cIjtcblx0XHRzZXBhcmF0b3IgPSBcIi5cIjtcblx0fSBlbHNlIGlmIChtb2RpZmllciA9PT0gXCIvXCIpIHtcblx0XHRwcmVmaXggPSBcIi9cIjtcblx0XHRzZXBhcmF0b3IgPSBcIi9cIjtcblx0fSBlbHNlIGlmIChtb2RpZmllciA9PT0gJyMnKSB7XG5cdFx0cHJlZml4ID0gXCIjXCI7XG5cdFx0c2hvdWxkRXNjYXBlID0gZmFsc2U7XG5cdH0gZWxzZSBpZiAobW9kaWZpZXIgPT09ICc7Jykge1xuXHRcdHByZWZpeCA9IFwiO1wiO1xuXHRcdHNlcGFyYXRvciA9IFwiO1wiO1xuXHRcdHNob3dWYXJpYWJsZXMgPSB0cnVlO1xuXHRcdHRyaW1FbXB0eVN0cmluZyA9IHRydWU7XG5cdH0gZWxzZSBpZiAobW9kaWZpZXIgPT09ICc/Jykge1xuXHRcdHByZWZpeCA9IFwiP1wiO1xuXHRcdHNlcGFyYXRvciA9IFwiJlwiO1xuXHRcdHNob3dWYXJpYWJsZXMgPSB0cnVlO1xuXHR9IGVsc2UgaWYgKG1vZGlmaWVyID09PSAnJicpIHtcblx0XHRwcmVmaXggPSBcIiZcIjtcblx0XHRzZXBhcmF0b3IgPSBcIiZcIjtcblx0XHRzaG93VmFyaWFibGVzID0gdHJ1ZTtcblx0fVxuXG5cdHZhciB2YXJOYW1lcyA9IFtdO1xuXHR2YXIgdmFyTGlzdCA9IHNwZWMuc3BsaXQoXCIsXCIpO1xuXHR2YXIgdmFyU3BlY3MgPSBbXTtcblx0dmFyIHZhclNwZWNNYXAgPSB7fTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCB2YXJMaXN0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIHZhck5hbWUgPSB2YXJMaXN0W2ldO1xuXHRcdHZhciB0cnVuY2F0ZSA9IG51bGw7XG5cdFx0aWYgKHZhck5hbWUuaW5kZXhPZihcIjpcIikgIT09IC0xKSB7XG5cdFx0XHR2YXIgcGFydHMgPSB2YXJOYW1lLnNwbGl0KFwiOlwiKTtcblx0XHRcdHZhck5hbWUgPSBwYXJ0c1swXTtcblx0XHRcdHRydW5jYXRlID0gcGFyc2VJbnQocGFydHNbMV0sIDEwKTtcblx0XHR9XG5cdFx0dmFyIHN1ZmZpY2VzID0ge307XG5cdFx0d2hpbGUgKHVyaVRlbXBsYXRlU3VmZmljZXNbdmFyTmFtZS5jaGFyQXQodmFyTmFtZS5sZW5ndGggLSAxKV0pIHtcblx0XHRcdHN1ZmZpY2VzW3Zhck5hbWUuY2hhckF0KHZhck5hbWUubGVuZ3RoIC0gMSldID0gdHJ1ZTtcblx0XHRcdHZhck5hbWUgPSB2YXJOYW1lLnN1YnN0cmluZygwLCB2YXJOYW1lLmxlbmd0aCAtIDEpO1xuXHRcdH1cblx0XHR2YXIgdmFyU3BlYyA9IHtcblx0XHRcdHRydW5jYXRlOiB0cnVuY2F0ZSxcblx0XHRcdG5hbWU6IHZhck5hbWUsXG5cdFx0XHRzdWZmaWNlczogc3VmZmljZXNcblx0XHR9O1xuXHRcdHZhclNwZWNzLnB1c2godmFyU3BlYyk7XG5cdFx0dmFyU3BlY01hcFt2YXJOYW1lXSA9IHZhclNwZWM7XG5cdFx0dmFyTmFtZXMucHVzaCh2YXJOYW1lKTtcblx0fVxuXHR2YXIgc3ViRnVuY3Rpb24gPSBmdW5jdGlvbiAodmFsdWVGdW5jdGlvbikge1xuXHRcdHZhciByZXN1bHQgPSBcIlwiO1xuXHRcdHZhciBzdGFydEluZGV4ID0gMDtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHZhclNwZWNzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgdmFyU3BlYyA9IHZhclNwZWNzW2ldO1xuXHRcdFx0dmFyIHZhbHVlID0gdmFsdWVGdW5jdGlvbih2YXJTcGVjLm5hbWUpO1xuXHRcdFx0aWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgfHwgKEFycmF5LmlzQXJyYXkodmFsdWUpICYmIHZhbHVlLmxlbmd0aCA9PT0gMCkgfHwgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgT2JqZWN0LmtleXModmFsdWUpLmxlbmd0aCA9PT0gMCkpIHtcblx0XHRcdFx0c3RhcnRJbmRleCsrO1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHRcdGlmIChpID09PSBzdGFydEluZGV4KSB7XG5cdFx0XHRcdHJlc3VsdCArPSBwcmVmaXg7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXN1bHQgKz0gKHNlcGFyYXRvciB8fCBcIixcIik7XG5cdFx0XHR9XG5cdFx0XHRpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcblx0XHRcdFx0aWYgKHNob3dWYXJpYWJsZXMpIHtcblx0XHRcdFx0XHRyZXN1bHQgKz0gdmFyU3BlYy5uYW1lICsgXCI9XCI7XG5cdFx0XHRcdH1cblx0XHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCB2YWx1ZS5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcdGlmIChqID4gMCkge1xuXHRcdFx0XHRcdFx0cmVzdWx0ICs9IHZhclNwZWMuc3VmZmljZXNbJyonXSA/IChzZXBhcmF0b3IgfHwgXCIsXCIpIDogXCIsXCI7XG5cdFx0XHRcdFx0XHRpZiAodmFyU3BlYy5zdWZmaWNlc1snKiddICYmIHNob3dWYXJpYWJsZXMpIHtcblx0XHRcdFx0XHRcdFx0cmVzdWx0ICs9IHZhclNwZWMubmFtZSArIFwiPVwiO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXN1bHQgKz0gc2hvdWxkRXNjYXBlID8gZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlW2pdKS5yZXBsYWNlKC8hL2csIFwiJTIxXCIpIDogbm90UmVhbGx5UGVyY2VudEVuY29kZSh2YWx1ZVtqXSk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRcdGlmIChzaG93VmFyaWFibGVzICYmICF2YXJTcGVjLnN1ZmZpY2VzWycqJ10pIHtcblx0XHRcdFx0XHRyZXN1bHQgKz0gdmFyU3BlYy5uYW1lICsgXCI9XCI7XG5cdFx0XHRcdH1cblx0XHRcdFx0dmFyIGZpcnN0ID0gdHJ1ZTtcblx0XHRcdFx0Zm9yICh2YXIga2V5IGluIHZhbHVlKSB7XG5cdFx0XHRcdFx0aWYgKCFmaXJzdCkge1xuXHRcdFx0XHRcdFx0cmVzdWx0ICs9IHZhclNwZWMuc3VmZmljZXNbJyonXSA/IChzZXBhcmF0b3IgfHwgXCIsXCIpIDogXCIsXCI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGZpcnN0ID0gZmFsc2U7XG5cdFx0XHRcdFx0cmVzdWx0ICs9IHNob3VsZEVzY2FwZSA/IGVuY29kZVVSSUNvbXBvbmVudChrZXkpLnJlcGxhY2UoLyEvZywgXCIlMjFcIikgOiBub3RSZWFsbHlQZXJjZW50RW5jb2RlKGtleSk7XG5cdFx0XHRcdFx0cmVzdWx0ICs9IHZhclNwZWMuc3VmZmljZXNbJyonXSA/ICc9JyA6IFwiLFwiO1xuXHRcdFx0XHRcdHJlc3VsdCArPSBzaG91bGRFc2NhcGUgPyBlbmNvZGVVUklDb21wb25lbnQodmFsdWVba2V5XSkucmVwbGFjZSgvIS9nLCBcIiUyMVwiKSA6IG5vdFJlYWxseVBlcmNlbnRFbmNvZGUodmFsdWVba2V5XSk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmIChzaG93VmFyaWFibGVzKSB7XG5cdFx0XHRcdFx0cmVzdWx0ICs9IHZhclNwZWMubmFtZTtcblx0XHRcdFx0XHRpZiAoIXRyaW1FbXB0eVN0cmluZyB8fCB2YWx1ZSAhPT0gXCJcIikge1xuXHRcdFx0XHRcdFx0cmVzdWx0ICs9IFwiPVwiO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAodmFyU3BlYy50cnVuY2F0ZSAhPSBudWxsKSB7XG5cdFx0XHRcdFx0dmFsdWUgPSB2YWx1ZS5zdWJzdHJpbmcoMCwgdmFyU3BlYy50cnVuY2F0ZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmVzdWx0ICs9IHNob3VsZEVzY2FwZSA/IGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkucmVwbGFjZSgvIS9nLCBcIiUyMVwiKTogbm90UmVhbGx5UGVyY2VudEVuY29kZSh2YWx1ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH07XG5cdHN1YkZ1bmN0aW9uLnZhck5hbWVzID0gdmFyTmFtZXM7XG5cdHJldHVybiB7XG5cdFx0cHJlZml4OiBwcmVmaXgsXG5cdFx0c3Vic3RpdHV0aW9uOiBzdWJGdW5jdGlvblxuXHR9O1xufVxuXG5mdW5jdGlvbiBVcmlUZW1wbGF0ZSh0ZW1wbGF0ZSkge1xuXHRpZiAoISh0aGlzIGluc3RhbmNlb2YgVXJpVGVtcGxhdGUpKSB7XG5cdFx0cmV0dXJuIG5ldyBVcmlUZW1wbGF0ZSh0ZW1wbGF0ZSk7XG5cdH1cblx0dmFyIHBhcnRzID0gdGVtcGxhdGUuc3BsaXQoXCJ7XCIpO1xuXHR2YXIgdGV4dFBhcnRzID0gW3BhcnRzLnNoaWZ0KCldO1xuXHR2YXIgcHJlZml4ZXMgPSBbXTtcblx0dmFyIHN1YnN0aXR1dGlvbnMgPSBbXTtcblx0dmFyIHZhck5hbWVzID0gW107XG5cdHdoaWxlIChwYXJ0cy5sZW5ndGggPiAwKSB7XG5cdFx0dmFyIHBhcnQgPSBwYXJ0cy5zaGlmdCgpO1xuXHRcdHZhciBzcGVjID0gcGFydC5zcGxpdChcIn1cIilbMF07XG5cdFx0dmFyIHJlbWFpbmRlciA9IHBhcnQuc3Vic3RyaW5nKHNwZWMubGVuZ3RoICsgMSk7XG5cdFx0dmFyIGZ1bmNzID0gdXJpVGVtcGxhdGVTdWJzdGl0dXRpb24oc3BlYyk7XG5cdFx0c3Vic3RpdHV0aW9ucy5wdXNoKGZ1bmNzLnN1YnN0aXR1dGlvbik7XG5cdFx0cHJlZml4ZXMucHVzaChmdW5jcy5wcmVmaXgpO1xuXHRcdHRleHRQYXJ0cy5wdXNoKHJlbWFpbmRlcik7XG5cdFx0dmFyTmFtZXMgPSB2YXJOYW1lcy5jb25jYXQoZnVuY3Muc3Vic3RpdHV0aW9uLnZhck5hbWVzKTtcblx0fVxuXHR0aGlzLmZpbGwgPSBmdW5jdGlvbiAodmFsdWVGdW5jdGlvbikge1xuXHRcdHZhciByZXN1bHQgPSB0ZXh0UGFydHNbMF07XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzdWJzdGl0dXRpb25zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgc3Vic3RpdHV0aW9uID0gc3Vic3RpdHV0aW9uc1tpXTtcblx0XHRcdHJlc3VsdCArPSBzdWJzdGl0dXRpb24odmFsdWVGdW5jdGlvbik7XG5cdFx0XHRyZXN1bHQgKz0gdGV4dFBhcnRzW2kgKyAxXTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fTtcblx0dGhpcy52YXJOYW1lcyA9IHZhck5hbWVzO1xuXHR0aGlzLnRlbXBsYXRlID0gdGVtcGxhdGU7XG59XG5VcmlUZW1wbGF0ZS5wcm90b3R5cGUgPSB7XG5cdHRvU3RyaW5nOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHRoaXMudGVtcGxhdGU7XG5cdH0sXG5cdGZpbGxGcm9tT2JqZWN0OiBmdW5jdGlvbiAob2JqKSB7XG5cdFx0cmV0dXJuIHRoaXMuZmlsbChmdW5jdGlvbiAodmFyTmFtZSkge1xuXHRcdFx0cmV0dXJuIG9ialt2YXJOYW1lXTtcblx0XHR9KTtcblx0fVxufTtcbnZhciBWYWxpZGF0b3JDb250ZXh0ID0gZnVuY3Rpb24gVmFsaWRhdG9yQ29udGV4dChwYXJlbnQsIGNvbGxlY3RNdWx0aXBsZSwgZXJyb3JNZXNzYWdlcywgY2hlY2tSZWN1cnNpdmUsIHRyYWNrVW5rbm93blByb3BlcnRpZXMpIHtcblx0dGhpcy5taXNzaW5nID0gW107XG5cdHRoaXMubWlzc2luZ01hcCA9IHt9O1xuXHR0aGlzLmZvcm1hdFZhbGlkYXRvcnMgPSBwYXJlbnQgPyBPYmplY3QuY3JlYXRlKHBhcmVudC5mb3JtYXRWYWxpZGF0b3JzKSA6IHt9O1xuXHR0aGlzLnNjaGVtYXMgPSBwYXJlbnQgPyBPYmplY3QuY3JlYXRlKHBhcmVudC5zY2hlbWFzKSA6IHt9O1xuXHR0aGlzLmNvbGxlY3RNdWx0aXBsZSA9IGNvbGxlY3RNdWx0aXBsZTtcblx0dGhpcy5lcnJvcnMgPSBbXTtcblx0dGhpcy5oYW5kbGVFcnJvciA9IGNvbGxlY3RNdWx0aXBsZSA/IHRoaXMuY29sbGVjdEVycm9yIDogdGhpcy5yZXR1cm5FcnJvcjtcblx0aWYgKGNoZWNrUmVjdXJzaXZlKSB7XG5cdFx0dGhpcy5jaGVja1JlY3Vyc2l2ZSA9IHRydWU7XG5cdFx0dGhpcy5zY2FubmVkID0gW107XG5cdFx0dGhpcy5zY2FubmVkRnJvemVuID0gW107XG5cdFx0dGhpcy5zY2FubmVkRnJvemVuU2NoZW1hcyA9IFtdO1xuXHRcdHRoaXMuc2Nhbm5lZEZyb3plblZhbGlkYXRpb25FcnJvcnMgPSBbXTtcblx0XHR0aGlzLnZhbGlkYXRlZFNjaGVtYXNLZXkgPSAndHY0X3ZhbGlkYXRpb25faWQnO1xuXHRcdHRoaXMudmFsaWRhdGlvbkVycm9yc0tleSA9ICd0djRfdmFsaWRhdGlvbl9lcnJvcnNfaWQnO1xuXHR9XG5cdGlmICh0cmFja1Vua25vd25Qcm9wZXJ0aWVzKSB7XG5cdFx0dGhpcy50cmFja1Vua25vd25Qcm9wZXJ0aWVzID0gdHJ1ZTtcblx0XHR0aGlzLmtub3duUHJvcGVydHlQYXRocyA9IHt9O1xuXHRcdHRoaXMudW5rbm93blByb3BlcnR5UGF0aHMgPSB7fTtcblx0fVxuXHR0aGlzLmVycm9yTWVzc2FnZXMgPSBlcnJvck1lc3NhZ2VzO1xuXHR0aGlzLmRlZmluZWRLZXl3b3JkcyA9IHt9O1xuXHRpZiAocGFyZW50KSB7XG5cdFx0Zm9yICh2YXIga2V5IGluIHBhcmVudC5kZWZpbmVkS2V5d29yZHMpIHtcblx0XHRcdHRoaXMuZGVmaW5lZEtleXdvcmRzW2tleV0gPSBwYXJlbnQuZGVmaW5lZEtleXdvcmRzW2tleV0uc2xpY2UoMCk7XG5cdFx0fVxuXHR9XG59O1xuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUuZGVmaW5lS2V5d29yZCA9IGZ1bmN0aW9uIChrZXl3b3JkLCBrZXl3b3JkRnVuY3Rpb24pIHtcblx0dGhpcy5kZWZpbmVkS2V5d29yZHNba2V5d29yZF0gPSB0aGlzLmRlZmluZWRLZXl3b3Jkc1trZXl3b3JkXSB8fCBbXTtcblx0dGhpcy5kZWZpbmVkS2V5d29yZHNba2V5d29yZF0ucHVzaChrZXl3b3JkRnVuY3Rpb24pO1xufTtcblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLmNyZWF0ZUVycm9yID0gZnVuY3Rpb24gKGNvZGUsIG1lc3NhZ2VQYXJhbXMsIGRhdGFQYXRoLCBzY2hlbWFQYXRoLCBzdWJFcnJvcnMpIHtcblx0dmFyIG1lc3NhZ2VUZW1wbGF0ZSA9IHRoaXMuZXJyb3JNZXNzYWdlc1tjb2RlXSB8fCBFcnJvck1lc3NhZ2VzRGVmYXVsdFtjb2RlXTtcblx0aWYgKHR5cGVvZiBtZXNzYWdlVGVtcGxhdGUgIT09ICdzdHJpbmcnKSB7XG5cdFx0cmV0dXJuIG5ldyBWYWxpZGF0aW9uRXJyb3IoY29kZSwgXCJVbmtub3duIGVycm9yIGNvZGUgXCIgKyBjb2RlICsgXCI6IFwiICsgSlNPTi5zdHJpbmdpZnkobWVzc2FnZVBhcmFtcyksIG1lc3NhZ2VQYXJhbXMsIGRhdGFQYXRoLCBzY2hlbWFQYXRoLCBzdWJFcnJvcnMpO1xuXHR9XG5cdC8vIEFkYXB0ZWQgZnJvbSBDcm9ja2ZvcmQncyBzdXBwbGFudCgpXG5cdHZhciBtZXNzYWdlID0gbWVzc2FnZVRlbXBsYXRlLnJlcGxhY2UoL1xceyhbXnt9XSopXFx9L2csIGZ1bmN0aW9uICh3aG9sZSwgdmFyTmFtZSkge1xuXHRcdHZhciBzdWJWYWx1ZSA9IG1lc3NhZ2VQYXJhbXNbdmFyTmFtZV07XG5cdFx0cmV0dXJuIHR5cGVvZiBzdWJWYWx1ZSA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHN1YlZhbHVlID09PSAnbnVtYmVyJyA/IHN1YlZhbHVlIDogd2hvbGU7XG5cdH0pO1xuXHRyZXR1cm4gbmV3IFZhbGlkYXRpb25FcnJvcihjb2RlLCBtZXNzYWdlLCBtZXNzYWdlUGFyYW1zLCBkYXRhUGF0aCwgc2NoZW1hUGF0aCwgc3ViRXJyb3JzKTtcbn07XG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5yZXR1cm5FcnJvciA9IGZ1bmN0aW9uIChlcnJvcikge1xuXHRyZXR1cm4gZXJyb3I7XG59O1xuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUuY29sbGVjdEVycm9yID0gZnVuY3Rpb24gKGVycm9yKSB7XG5cdGlmIChlcnJvcikge1xuXHRcdHRoaXMuZXJyb3JzLnB1c2goZXJyb3IpO1xuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnByZWZpeEVycm9ycyA9IGZ1bmN0aW9uIChzdGFydEluZGV4LCBkYXRhUGF0aCwgc2NoZW1hUGF0aCkge1xuXHRmb3IgKHZhciBpID0gc3RhcnRJbmRleDsgaSA8IHRoaXMuZXJyb3JzLmxlbmd0aDsgaSsrKSB7XG5cdFx0dGhpcy5lcnJvcnNbaV0gPSB0aGlzLmVycm9yc1tpXS5wcmVmaXhXaXRoKGRhdGFQYXRoLCBzY2hlbWFQYXRoKTtcblx0fVxuXHRyZXR1cm4gdGhpcztcbn07XG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5iYW5Vbmtub3duUHJvcGVydGllcyA9IGZ1bmN0aW9uICgpIHtcblx0Zm9yICh2YXIgdW5rbm93blBhdGggaW4gdGhpcy51bmtub3duUHJvcGVydHlQYXRocykge1xuXHRcdHZhciBlcnJvciA9IHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5VTktOT1dOX1BST1BFUlRZLCB7cGF0aDogdW5rbm93blBhdGh9LCB1bmtub3duUGF0aCwgXCJcIik7XG5cdFx0dmFyIHJlc3VsdCA9IHRoaXMuaGFuZGxlRXJyb3IoZXJyb3IpO1xuXHRcdGlmIChyZXN1bHQpIHtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUuYWRkRm9ybWF0ID0gZnVuY3Rpb24gKGZvcm1hdCwgdmFsaWRhdG9yKSB7XG5cdGlmICh0eXBlb2YgZm9ybWF0ID09PSAnb2JqZWN0Jykge1xuXHRcdGZvciAodmFyIGtleSBpbiBmb3JtYXQpIHtcblx0XHRcdHRoaXMuYWRkRm9ybWF0KGtleSwgZm9ybWF0W2tleV0pO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXHR0aGlzLmZvcm1hdFZhbGlkYXRvcnNbZm9ybWF0XSA9IHZhbGlkYXRvcjtcbn07XG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5yZXNvbHZlUmVmcyA9IGZ1bmN0aW9uIChzY2hlbWEsIHVybEhpc3RvcnkpIHtcblx0aWYgKHNjaGVtYVsnJHJlZiddICE9PSB1bmRlZmluZWQpIHtcblx0XHR1cmxIaXN0b3J5ID0gdXJsSGlzdG9yeSB8fCB7fTtcblx0XHRpZiAodXJsSGlzdG9yeVtzY2hlbWFbJyRyZWYnXV0pIHtcblx0XHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuQ0lSQ1VMQVJfUkVGRVJFTkNFLCB7dXJsczogT2JqZWN0LmtleXModXJsSGlzdG9yeSkuam9pbignLCAnKX0sICcnLCAnJyk7XG5cdFx0fVxuXHRcdHVybEhpc3Rvcnlbc2NoZW1hWyckcmVmJ11dID0gdHJ1ZTtcblx0XHRzY2hlbWEgPSB0aGlzLmdldFNjaGVtYShzY2hlbWFbJyRyZWYnXSwgdXJsSGlzdG9yeSk7XG5cdH1cblx0cmV0dXJuIHNjaGVtYTtcbn07XG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5nZXRTY2hlbWEgPSBmdW5jdGlvbiAodXJsLCB1cmxIaXN0b3J5KSB7XG5cdHZhciBzY2hlbWE7XG5cdGlmICh0aGlzLnNjaGVtYXNbdXJsXSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0c2NoZW1hID0gdGhpcy5zY2hlbWFzW3VybF07XG5cdFx0cmV0dXJuIHRoaXMucmVzb2x2ZVJlZnMoc2NoZW1hLCB1cmxIaXN0b3J5KTtcblx0fVxuXHR2YXIgYmFzZVVybCA9IHVybDtcblx0dmFyIGZyYWdtZW50ID0gXCJcIjtcblx0aWYgKHVybC5pbmRleE9mKCcjJykgIT09IC0xKSB7XG5cdFx0ZnJhZ21lbnQgPSB1cmwuc3Vic3RyaW5nKHVybC5pbmRleE9mKFwiI1wiKSArIDEpO1xuXHRcdGJhc2VVcmwgPSB1cmwuc3Vic3RyaW5nKDAsIHVybC5pbmRleE9mKFwiI1wiKSk7XG5cdH1cblx0aWYgKHR5cGVvZiB0aGlzLnNjaGVtYXNbYmFzZVVybF0gPT09ICdvYmplY3QnKSB7XG5cdFx0c2NoZW1hID0gdGhpcy5zY2hlbWFzW2Jhc2VVcmxdO1xuXHRcdHZhciBwb2ludGVyUGF0aCA9IGRlY29kZVVSSUNvbXBvbmVudChmcmFnbWVudCk7XG5cdFx0aWYgKHBvaW50ZXJQYXRoID09PSBcIlwiKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5yZXNvbHZlUmVmcyhzY2hlbWEsIHVybEhpc3RvcnkpO1xuXHRcdH0gZWxzZSBpZiAocG9pbnRlclBhdGguY2hhckF0KDApICE9PSBcIi9cIikge1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdFx0dmFyIHBhcnRzID0gcG9pbnRlclBhdGguc3BsaXQoXCIvXCIpLnNsaWNlKDEpO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcGFydHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBjb21wb25lbnQgPSBwYXJ0c1tpXS5yZXBsYWNlKC9+MS9nLCBcIi9cIikucmVwbGFjZSgvfjAvZywgXCJ+XCIpO1xuXHRcdFx0aWYgKHNjaGVtYVtjb21wb25lbnRdID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0c2NoZW1hID0gdW5kZWZpbmVkO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHRcdHNjaGVtYSA9IHNjaGVtYVtjb21wb25lbnRdO1xuXHRcdH1cblx0XHRpZiAoc2NoZW1hICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHJldHVybiB0aGlzLnJlc29sdmVSZWZzKHNjaGVtYSwgdXJsSGlzdG9yeSk7XG5cdFx0fVxuXHR9XG5cdGlmICh0aGlzLm1pc3NpbmdbYmFzZVVybF0gPT09IHVuZGVmaW5lZCkge1xuXHRcdHRoaXMubWlzc2luZy5wdXNoKGJhc2VVcmwpO1xuXHRcdHRoaXMubWlzc2luZ1tiYXNlVXJsXSA9IGJhc2VVcmw7XG5cdFx0dGhpcy5taXNzaW5nTWFwW2Jhc2VVcmxdID0gYmFzZVVybDtcblx0fVxufTtcblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnNlYXJjaFNjaGVtYXMgPSBmdW5jdGlvbiAoc2NoZW1hLCB1cmwpIHtcblx0aWYgKHNjaGVtYSAmJiB0eXBlb2Ygc2NoZW1hID09PSBcIm9iamVjdFwiKSB7XG5cdFx0aWYgKHR5cGVvZiBzY2hlbWEuaWQgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdGlmIChpc1RydXN0ZWRVcmwodXJsLCBzY2hlbWEuaWQpKSB7XG5cdFx0XHRcdGlmICh0aGlzLnNjaGVtYXNbc2NoZW1hLmlkXSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0dGhpcy5zY2hlbWFzW3NjaGVtYS5pZF0gPSBzY2hlbWE7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0Zm9yICh2YXIga2V5IGluIHNjaGVtYSkge1xuXHRcdFx0aWYgKGtleSAhPT0gXCJlbnVtXCIpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBzY2hlbWFba2V5XSA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0XHRcdHRoaXMuc2VhcmNoU2NoZW1hcyhzY2hlbWFba2V5XSwgdXJsKTtcblx0XHRcdFx0fSBlbHNlIGlmIChrZXkgPT09IFwiJHJlZlwiKSB7XG5cdFx0XHRcdFx0dmFyIHVyaSA9IGdldERvY3VtZW50VXJpKHNjaGVtYVtrZXldKTtcblx0XHRcdFx0XHRpZiAodXJpICYmIHRoaXMuc2NoZW1hc1t1cmldID09PSB1bmRlZmluZWQgJiYgdGhpcy5taXNzaW5nTWFwW3VyaV0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0dGhpcy5taXNzaW5nTWFwW3VyaV0gPSB1cmk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59O1xuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUuYWRkU2NoZW1hID0gZnVuY3Rpb24gKHVybCwgc2NoZW1hKSB7XG5cdC8vb3ZlcmxvYWRcblx0aWYgKHR5cGVvZiB1cmwgIT09ICdzdHJpbmcnIHx8IHR5cGVvZiBzY2hlbWEgPT09ICd1bmRlZmluZWQnKSB7XG5cdFx0aWYgKHR5cGVvZiB1cmwgPT09ICdvYmplY3QnICYmIHR5cGVvZiB1cmwuaWQgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRzY2hlbWEgPSB1cmw7XG5cdFx0XHR1cmwgPSBzY2hlbWEuaWQ7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0fVxuXHRpZiAodXJsID09PSBnZXREb2N1bWVudFVyaSh1cmwpICsgXCIjXCIpIHtcblx0XHQvLyBSZW1vdmUgZW1wdHkgZnJhZ21lbnRcblx0XHR1cmwgPSBnZXREb2N1bWVudFVyaSh1cmwpO1xuXHR9XG5cdHRoaXMuc2NoZW1hc1t1cmxdID0gc2NoZW1hO1xuXHRkZWxldGUgdGhpcy5taXNzaW5nTWFwW3VybF07XG5cdG5vcm1TY2hlbWEoc2NoZW1hLCB1cmwpO1xuXHR0aGlzLnNlYXJjaFNjaGVtYXMoc2NoZW1hLCB1cmwpO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUuZ2V0U2NoZW1hTWFwID0gZnVuY3Rpb24gKCkge1xuXHR2YXIgbWFwID0ge307XG5cdGZvciAodmFyIGtleSBpbiB0aGlzLnNjaGVtYXMpIHtcblx0XHRtYXBba2V5XSA9IHRoaXMuc2NoZW1hc1trZXldO1xuXHR9XG5cdHJldHVybiBtYXA7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5nZXRTY2hlbWFVcmlzID0gZnVuY3Rpb24gKGZpbHRlclJlZ0V4cCkge1xuXHR2YXIgbGlzdCA9IFtdO1xuXHRmb3IgKHZhciBrZXkgaW4gdGhpcy5zY2hlbWFzKSB7XG5cdFx0aWYgKCFmaWx0ZXJSZWdFeHAgfHwgZmlsdGVyUmVnRXhwLnRlc3Qoa2V5KSkge1xuXHRcdFx0bGlzdC5wdXNoKGtleSk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBsaXN0O1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUuZ2V0TWlzc2luZ1VyaXMgPSBmdW5jdGlvbiAoZmlsdGVyUmVnRXhwKSB7XG5cdHZhciBsaXN0ID0gW107XG5cdGZvciAodmFyIGtleSBpbiB0aGlzLm1pc3NpbmdNYXApIHtcblx0XHRpZiAoIWZpbHRlclJlZ0V4cCB8fCBmaWx0ZXJSZWdFeHAudGVzdChrZXkpKSB7XG5cdFx0XHRsaXN0LnB1c2goa2V5KTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGxpc3Q7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5kcm9wU2NoZW1hcyA9IGZ1bmN0aW9uICgpIHtcblx0dGhpcy5zY2hlbWFzID0ge307XG5cdHRoaXMucmVzZXQoKTtcbn07XG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uICgpIHtcblx0dGhpcy5taXNzaW5nID0gW107XG5cdHRoaXMubWlzc2luZ01hcCA9IHt9O1xuXHR0aGlzLmVycm9ycyA9IFtdO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVBbGwgPSBmdW5jdGlvbiAoZGF0YSwgc2NoZW1hLCBkYXRhUGF0aFBhcnRzLCBzY2hlbWFQYXRoUGFydHMsIGRhdGFQb2ludGVyUGF0aCkge1xuXHR2YXIgdG9wTGV2ZWw7XG5cdHNjaGVtYSA9IHRoaXMucmVzb2x2ZVJlZnMoc2NoZW1hKTtcblx0aWYgKCFzY2hlbWEpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fSBlbHNlIGlmIChzY2hlbWEgaW5zdGFuY2VvZiBWYWxpZGF0aW9uRXJyb3IpIHtcblx0XHR0aGlzLmVycm9ycy5wdXNoKHNjaGVtYSk7XG5cdFx0cmV0dXJuIHNjaGVtYTtcblx0fVxuXG5cdHZhciBzdGFydEVycm9yQ291bnQgPSB0aGlzLmVycm9ycy5sZW5ndGg7XG5cdHZhciBmcm96ZW5JbmRleCwgc2Nhbm5lZEZyb3plblNjaGVtYUluZGV4ID0gbnVsbCwgc2Nhbm5lZFNjaGVtYXNJbmRleCA9IG51bGw7XG5cdGlmICh0aGlzLmNoZWNrUmVjdXJzaXZlICYmIGRhdGEgJiYgdHlwZW9mIGRhdGEgPT09ICdvYmplY3QnKSB7XG5cdFx0dG9wTGV2ZWwgPSAhdGhpcy5zY2FubmVkLmxlbmd0aDtcblx0XHRpZiAoZGF0YVt0aGlzLnZhbGlkYXRlZFNjaGVtYXNLZXldKSB7XG5cdFx0XHR2YXIgc2NoZW1hSW5kZXggPSBkYXRhW3RoaXMudmFsaWRhdGVkU2NoZW1hc0tleV0uaW5kZXhPZihzY2hlbWEpO1xuXHRcdFx0aWYgKHNjaGVtYUluZGV4ICE9PSAtMSkge1xuXHRcdFx0XHR0aGlzLmVycm9ycyA9IHRoaXMuZXJyb3JzLmNvbmNhdChkYXRhW3RoaXMudmFsaWRhdGlvbkVycm9yc0tleV1bc2NoZW1hSW5kZXhdKTtcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChPYmplY3QuaXNGcm96ZW4oZGF0YSkpIHtcblx0XHRcdGZyb3plbkluZGV4ID0gdGhpcy5zY2FubmVkRnJvemVuLmluZGV4T2YoZGF0YSk7XG5cdFx0XHRpZiAoZnJvemVuSW5kZXggIT09IC0xKSB7XG5cdFx0XHRcdHZhciBmcm96ZW5TY2hlbWFJbmRleCA9IHRoaXMuc2Nhbm5lZEZyb3plblNjaGVtYXNbZnJvemVuSW5kZXhdLmluZGV4T2Yoc2NoZW1hKTtcblx0XHRcdFx0aWYgKGZyb3plblNjaGVtYUluZGV4ICE9PSAtMSkge1xuXHRcdFx0XHRcdHRoaXMuZXJyb3JzID0gdGhpcy5lcnJvcnMuY29uY2F0KHRoaXMuc2Nhbm5lZEZyb3plblZhbGlkYXRpb25FcnJvcnNbZnJvemVuSW5kZXhdW2Zyb3plblNjaGVtYUluZGV4XSk7XG5cdFx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0dGhpcy5zY2FubmVkLnB1c2goZGF0YSk7XG5cdFx0aWYgKE9iamVjdC5pc0Zyb3plbihkYXRhKSkge1xuXHRcdFx0aWYgKGZyb3plbkluZGV4ID09PSAtMSkge1xuXHRcdFx0XHRmcm96ZW5JbmRleCA9IHRoaXMuc2Nhbm5lZEZyb3plbi5sZW5ndGg7XG5cdFx0XHRcdHRoaXMuc2Nhbm5lZEZyb3plbi5wdXNoKGRhdGEpO1xuXHRcdFx0XHR0aGlzLnNjYW5uZWRGcm96ZW5TY2hlbWFzLnB1c2goW10pO1xuXHRcdFx0fVxuXHRcdFx0c2Nhbm5lZEZyb3plblNjaGVtYUluZGV4ID0gdGhpcy5zY2FubmVkRnJvemVuU2NoZW1hc1tmcm96ZW5JbmRleF0ubGVuZ3RoO1xuXHRcdFx0dGhpcy5zY2FubmVkRnJvemVuU2NoZW1hc1tmcm96ZW5JbmRleF1bc2Nhbm5lZEZyb3plblNjaGVtYUluZGV4XSA9IHNjaGVtYTtcblx0XHRcdHRoaXMuc2Nhbm5lZEZyb3plblZhbGlkYXRpb25FcnJvcnNbZnJvemVuSW5kZXhdW3NjYW5uZWRGcm96ZW5TY2hlbWFJbmRleF0gPSBbXTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKCFkYXRhW3RoaXMudmFsaWRhdGVkU2NoZW1hc0tleV0pIHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZGF0YSwgdGhpcy52YWxpZGF0ZWRTY2hlbWFzS2V5LCB7XG5cdFx0XHRcdFx0XHR2YWx1ZTogW10sXG5cdFx0XHRcdFx0XHRjb25maWd1cmFibGU6IHRydWVcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZGF0YSwgdGhpcy52YWxpZGF0aW9uRXJyb3JzS2V5LCB7XG5cdFx0XHRcdFx0XHR2YWx1ZTogW10sXG5cdFx0XHRcdFx0XHRjb25maWd1cmFibGU6IHRydWVcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRcdC8vSUUgNy84IHdvcmthcm91bmRcblx0XHRcdFx0XHRkYXRhW3RoaXMudmFsaWRhdGVkU2NoZW1hc0tleV0gPSBbXTtcblx0XHRcdFx0XHRkYXRhW3RoaXMudmFsaWRhdGlvbkVycm9yc0tleV0gPSBbXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0c2Nhbm5lZFNjaGVtYXNJbmRleCA9IGRhdGFbdGhpcy52YWxpZGF0ZWRTY2hlbWFzS2V5XS5sZW5ndGg7XG5cdFx0XHRkYXRhW3RoaXMudmFsaWRhdGVkU2NoZW1hc0tleV1bc2Nhbm5lZFNjaGVtYXNJbmRleF0gPSBzY2hlbWE7XG5cdFx0XHRkYXRhW3RoaXMudmFsaWRhdGlvbkVycm9yc0tleV1bc2Nhbm5lZFNjaGVtYXNJbmRleF0gPSBbXTtcblx0XHR9XG5cdH1cblxuXHR2YXIgZXJyb3JDb3VudCA9IHRoaXMuZXJyb3JzLmxlbmd0aDtcblx0dmFyIGVycm9yID0gdGhpcy52YWxpZGF0ZUJhc2ljKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVOdW1lcmljKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVTdHJpbmcoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZUFycmF5KGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVPYmplY3QoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZUNvbWJpbmF0aW9ucyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCB0aGlzLnZhbGlkYXRlSHlwZXJtZWRpYShkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCB0aGlzLnZhbGlkYXRlRm9ybWF0KGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVEZWZpbmVkS2V5d29yZHMoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgbnVsbDtcblxuXHRpZiAodG9wTGV2ZWwpIHtcblx0XHR3aGlsZSAodGhpcy5zY2FubmVkLmxlbmd0aCkge1xuXHRcdFx0dmFyIGl0ZW0gPSB0aGlzLnNjYW5uZWQucG9wKCk7XG5cdFx0XHRkZWxldGUgaXRlbVt0aGlzLnZhbGlkYXRlZFNjaGVtYXNLZXldO1xuXHRcdH1cblx0XHR0aGlzLnNjYW5uZWRGcm96ZW4gPSBbXTtcblx0XHR0aGlzLnNjYW5uZWRGcm96ZW5TY2hlbWFzID0gW107XG5cdH1cblxuXHRpZiAoZXJyb3IgfHwgZXJyb3JDb3VudCAhPT0gdGhpcy5lcnJvcnMubGVuZ3RoKSB7XG5cdFx0d2hpbGUgKChkYXRhUGF0aFBhcnRzICYmIGRhdGFQYXRoUGFydHMubGVuZ3RoKSB8fCAoc2NoZW1hUGF0aFBhcnRzICYmIHNjaGVtYVBhdGhQYXJ0cy5sZW5ndGgpKSB7XG5cdFx0XHR2YXIgZGF0YVBhcnQgPSAoZGF0YVBhdGhQYXJ0cyAmJiBkYXRhUGF0aFBhcnRzLmxlbmd0aCkgPyBcIlwiICsgZGF0YVBhdGhQYXJ0cy5wb3AoKSA6IG51bGw7XG5cdFx0XHR2YXIgc2NoZW1hUGFydCA9IChzY2hlbWFQYXRoUGFydHMgJiYgc2NoZW1hUGF0aFBhcnRzLmxlbmd0aCkgPyBcIlwiICsgc2NoZW1hUGF0aFBhcnRzLnBvcCgpIDogbnVsbDtcblx0XHRcdGlmIChlcnJvcikge1xuXHRcdFx0XHRlcnJvciA9IGVycm9yLnByZWZpeFdpdGgoZGF0YVBhcnQsIHNjaGVtYVBhcnQpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5wcmVmaXhFcnJvcnMoZXJyb3JDb3VudCwgZGF0YVBhcnQsIHNjaGVtYVBhcnQpO1xuXHRcdH1cblx0fVxuXG5cdGlmIChzY2FubmVkRnJvemVuU2NoZW1hSW5kZXggIT09IG51bGwpIHtcblx0XHR0aGlzLnNjYW5uZWRGcm96ZW5WYWxpZGF0aW9uRXJyb3JzW2Zyb3plbkluZGV4XVtzY2FubmVkRnJvemVuU2NoZW1hSW5kZXhdID0gdGhpcy5lcnJvcnMuc2xpY2Uoc3RhcnRFcnJvckNvdW50KTtcblx0fSBlbHNlIGlmIChzY2FubmVkU2NoZW1hc0luZGV4ICE9PSBudWxsKSB7XG5cdFx0ZGF0YVt0aGlzLnZhbGlkYXRpb25FcnJvcnNLZXldW3NjYW5uZWRTY2hlbWFzSW5kZXhdID0gdGhpcy5lcnJvcnMuc2xpY2Uoc3RhcnRFcnJvckNvdW50KTtcblx0fVxuXG5cdHJldHVybiB0aGlzLmhhbmRsZUVycm9yKGVycm9yKTtcbn07XG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZUZvcm1hdCA9IGZ1bmN0aW9uIChkYXRhLCBzY2hlbWEpIHtcblx0aWYgKHR5cGVvZiBzY2hlbWEuZm9ybWF0ICE9PSAnc3RyaW5nJyB8fCAhdGhpcy5mb3JtYXRWYWxpZGF0b3JzW3NjaGVtYS5mb3JtYXRdKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0dmFyIGVycm9yTWVzc2FnZSA9IHRoaXMuZm9ybWF0VmFsaWRhdG9yc1tzY2hlbWEuZm9ybWF0XS5jYWxsKG51bGwsIGRhdGEsIHNjaGVtYSk7XG5cdGlmICh0eXBlb2YgZXJyb3JNZXNzYWdlID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgZXJyb3JNZXNzYWdlID09PSAnbnVtYmVyJykge1xuXHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuRk9STUFUX0NVU1RPTSwge21lc3NhZ2U6IGVycm9yTWVzc2FnZX0pLnByZWZpeFdpdGgobnVsbCwgXCJmb3JtYXRcIik7XG5cdH0gZWxzZSBpZiAoZXJyb3JNZXNzYWdlICYmIHR5cGVvZiBlcnJvck1lc3NhZ2UgPT09ICdvYmplY3QnKSB7XG5cdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5GT1JNQVRfQ1VTVE9NLCB7bWVzc2FnZTogZXJyb3JNZXNzYWdlLm1lc3NhZ2UgfHwgXCI/XCJ9LCBlcnJvck1lc3NhZ2UuZGF0YVBhdGggfHwgbnVsbCwgZXJyb3JNZXNzYWdlLnNjaGVtYVBhdGggfHwgXCIvZm9ybWF0XCIpO1xuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlRGVmaW5lZEtleXdvcmRzID0gZnVuY3Rpb24gKGRhdGEsIHNjaGVtYSkge1xuXHRmb3IgKHZhciBrZXkgaW4gdGhpcy5kZWZpbmVkS2V5d29yZHMpIHtcblx0XHRpZiAodHlwZW9mIHNjaGVtYVtrZXldID09PSAndW5kZWZpbmVkJykge1xuXHRcdFx0Y29udGludWU7XG5cdFx0fVxuXHRcdHZhciB2YWxpZGF0aW9uRnVuY3Rpb25zID0gdGhpcy5kZWZpbmVkS2V5d29yZHNba2V5XTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHZhbGlkYXRpb25GdW5jdGlvbnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBmdW5jID0gdmFsaWRhdGlvbkZ1bmN0aW9uc1tpXTtcblx0XHRcdHZhciByZXN1bHQgPSBmdW5jKGRhdGEsIHNjaGVtYVtrZXldLCBzY2hlbWEpO1xuXHRcdFx0aWYgKHR5cGVvZiByZXN1bHQgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiByZXN1bHQgPT09ICdudW1iZXInKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuS0VZV09SRF9DVVNUT00sIHtrZXk6IGtleSwgbWVzc2FnZTogcmVzdWx0fSkucHJlZml4V2l0aChudWxsLCBcImZvcm1hdFwiKTtcblx0XHRcdH0gZWxzZSBpZiAocmVzdWx0ICYmIHR5cGVvZiByZXN1bHQgPT09ICdvYmplY3QnKSB7XG5cdFx0XHRcdHZhciBjb2RlID0gcmVzdWx0LmNvZGUgfHwgRXJyb3JDb2Rlcy5LRVlXT1JEX0NVU1RPTTtcblx0XHRcdFx0aWYgKHR5cGVvZiBjb2RlID09PSAnc3RyaW5nJykge1xuXHRcdFx0XHRcdGlmICghRXJyb3JDb2Rlc1tjb2RlXSkge1xuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdVbmRlZmluZWQgZXJyb3IgY29kZSAodXNlIGRlZmluZUVycm9yKTogJyArIGNvZGUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjb2RlID0gRXJyb3JDb2Rlc1tjb2RlXTtcblx0XHRcdFx0fVxuXHRcdFx0XHR2YXIgbWVzc2FnZVBhcmFtcyA9ICh0eXBlb2YgcmVzdWx0Lm1lc3NhZ2UgPT09ICdvYmplY3QnKSA/IHJlc3VsdC5tZXNzYWdlIDoge2tleToga2V5LCBtZXNzYWdlOiByZXN1bHQubWVzc2FnZSB8fCBcIj9cIn07XG5cdFx0XHRcdHZhciBzY2hlbWFQYXRoID0gcmVzdWx0LnNjaGVtYVBhdGggfHwoIFwiL1wiICsga2V5LnJlcGxhY2UoL34vZywgJ34wJykucmVwbGFjZSgvXFwvL2csICd+MScpKTtcblx0XHRcdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoY29kZSwgbWVzc2FnZVBhcmFtcywgcmVzdWx0LmRhdGFQYXRoIHx8IG51bGwsIHNjaGVtYVBhdGgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cbmZ1bmN0aW9uIHJlY3Vyc2l2ZUNvbXBhcmUoQSwgQikge1xuXHRpZiAoQSA9PT0gQikge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cdGlmICh0eXBlb2YgQSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgQiA9PT0gXCJvYmplY3RcIikge1xuXHRcdGlmIChBcnJheS5pc0FycmF5KEEpICE9PSBBcnJheS5pc0FycmF5KEIpKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSBlbHNlIGlmIChBcnJheS5pc0FycmF5KEEpKSB7XG5cdFx0XHRpZiAoQS5sZW5ndGggIT09IEIubGVuZ3RoKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgQS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAoIXJlY3Vyc2l2ZUNvbXBhcmUoQVtpXSwgQltpXSkpIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIGtleTtcblx0XHRcdGZvciAoa2V5IGluIEEpIHtcblx0XHRcdFx0aWYgKEJba2V5XSA9PT0gdW5kZWZpbmVkICYmIEFba2V5XSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRmb3IgKGtleSBpbiBCKSB7XG5cdFx0XHRcdGlmIChBW2tleV0gPT09IHVuZGVmaW5lZCAmJiBCW2tleV0gIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Zm9yIChrZXkgaW4gQSkge1xuXHRcdFx0XHRpZiAoIXJlY3Vyc2l2ZUNvbXBhcmUoQVtrZXldLCBCW2tleV0pKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cdHJldHVybiBmYWxzZTtcbn1cblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVCYXNpYyA9IGZ1bmN0aW9uIHZhbGlkYXRlQmFzaWMoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpIHtcblx0dmFyIGVycm9yO1xuXHRpZiAoZXJyb3IgPSB0aGlzLnZhbGlkYXRlVHlwZShkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aCkpIHtcblx0XHRyZXR1cm4gZXJyb3IucHJlZml4V2l0aChudWxsLCBcInR5cGVcIik7XG5cdH1cblx0aWYgKGVycm9yID0gdGhpcy52YWxpZGF0ZUVudW0oZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpKSB7XG5cdFx0cmV0dXJuIGVycm9yLnByZWZpeFdpdGgobnVsbCwgXCJ0eXBlXCIpO1xuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVUeXBlID0gZnVuY3Rpb24gdmFsaWRhdGVUeXBlKGRhdGEsIHNjaGVtYSkge1xuXHRpZiAoc2NoZW1hLnR5cGUgPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdHZhciBkYXRhVHlwZSA9IHR5cGVvZiBkYXRhO1xuXHRpZiAoZGF0YSA9PT0gbnVsbCkge1xuXHRcdGRhdGFUeXBlID0gXCJudWxsXCI7XG5cdH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShkYXRhKSkge1xuXHRcdGRhdGFUeXBlID0gXCJhcnJheVwiO1xuXHR9XG5cdHZhciBhbGxvd2VkVHlwZXMgPSBzY2hlbWEudHlwZTtcblx0aWYgKHR5cGVvZiBhbGxvd2VkVHlwZXMgIT09IFwib2JqZWN0XCIpIHtcblx0XHRhbGxvd2VkVHlwZXMgPSBbYWxsb3dlZFR5cGVzXTtcblx0fVxuXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgYWxsb3dlZFR5cGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIHR5cGUgPSBhbGxvd2VkVHlwZXNbaV07XG5cdFx0aWYgKHR5cGUgPT09IGRhdGFUeXBlIHx8ICh0eXBlID09PSBcImludGVnZXJcIiAmJiBkYXRhVHlwZSA9PT0gXCJudW1iZXJcIiAmJiAoZGF0YSAlIDEgPT09IDApKSkge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHR9XG5cdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuSU5WQUxJRF9UWVBFLCB7dHlwZTogZGF0YVR5cGUsIGV4cGVjdGVkOiBhbGxvd2VkVHlwZXMuam9pbihcIi9cIil9KTtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlRW51bSA9IGZ1bmN0aW9uIHZhbGlkYXRlRW51bShkYXRhLCBzY2hlbWEpIHtcblx0aWYgKHNjaGVtYVtcImVudW1cIl0gPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgc2NoZW1hW1wiZW51bVwiXS5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBlbnVtVmFsID0gc2NoZW1hW1wiZW51bVwiXVtpXTtcblx0XHRpZiAocmVjdXJzaXZlQ29tcGFyZShkYXRhLCBlbnVtVmFsKSkge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHR9XG5cdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuRU5VTV9NSVNNQVRDSCwge3ZhbHVlOiAodHlwZW9mIEpTT04gIT09ICd1bmRlZmluZWQnKSA/IEpTT04uc3RyaW5naWZ5KGRhdGEpIDogZGF0YX0pO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVOdW1lcmljID0gZnVuY3Rpb24gdmFsaWRhdGVOdW1lcmljKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKSB7XG5cdHJldHVybiB0aGlzLnZhbGlkYXRlTXVsdGlwbGVPZihkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCB0aGlzLnZhbGlkYXRlTWluTWF4KGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVOYU4oZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlTXVsdGlwbGVPZiA9IGZ1bmN0aW9uIHZhbGlkYXRlTXVsdGlwbGVPZihkYXRhLCBzY2hlbWEpIHtcblx0dmFyIG11bHRpcGxlT2YgPSBzY2hlbWEubXVsdGlwbGVPZiB8fCBzY2hlbWEuZGl2aXNpYmxlQnk7XG5cdGlmIChtdWx0aXBsZU9mID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHRpZiAodHlwZW9mIGRhdGEgPT09IFwibnVtYmVyXCIpIHtcblx0XHRpZiAoZGF0YSAlIG11bHRpcGxlT2YgIT09IDApIHtcblx0XHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuTlVNQkVSX01VTFRJUExFX09GLCB7dmFsdWU6IGRhdGEsIG11bHRpcGxlT2Y6IG11bHRpcGxlT2Z9KTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZU1pbk1heCA9IGZ1bmN0aW9uIHZhbGlkYXRlTWluTWF4KGRhdGEsIHNjaGVtYSkge1xuXHRpZiAodHlwZW9mIGRhdGEgIT09IFwibnVtYmVyXCIpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHRpZiAoc2NoZW1hLm1pbmltdW0gIT09IHVuZGVmaW5lZCkge1xuXHRcdGlmIChkYXRhIDwgc2NoZW1hLm1pbmltdW0pIHtcblx0XHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuTlVNQkVSX01JTklNVU0sIHt2YWx1ZTogZGF0YSwgbWluaW11bTogc2NoZW1hLm1pbmltdW19KS5wcmVmaXhXaXRoKG51bGwsIFwibWluaW11bVwiKTtcblx0XHR9XG5cdFx0aWYgKHNjaGVtYS5leGNsdXNpdmVNaW5pbXVtICYmIGRhdGEgPT09IHNjaGVtYS5taW5pbXVtKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLk5VTUJFUl9NSU5JTVVNX0VYQ0xVU0lWRSwge3ZhbHVlOiBkYXRhLCBtaW5pbXVtOiBzY2hlbWEubWluaW11bX0pLnByZWZpeFdpdGgobnVsbCwgXCJleGNsdXNpdmVNaW5pbXVtXCIpO1xuXHRcdH1cblx0fVxuXHRpZiAoc2NoZW1hLm1heGltdW0gIT09IHVuZGVmaW5lZCkge1xuXHRcdGlmIChkYXRhID4gc2NoZW1hLm1heGltdW0pIHtcblx0XHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuTlVNQkVSX01BWElNVU0sIHt2YWx1ZTogZGF0YSwgbWF4aW11bTogc2NoZW1hLm1heGltdW19KS5wcmVmaXhXaXRoKG51bGwsIFwibWF4aW11bVwiKTtcblx0XHR9XG5cdFx0aWYgKHNjaGVtYS5leGNsdXNpdmVNYXhpbXVtICYmIGRhdGEgPT09IHNjaGVtYS5tYXhpbXVtKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLk5VTUJFUl9NQVhJTVVNX0VYQ0xVU0lWRSwge3ZhbHVlOiBkYXRhLCBtYXhpbXVtOiBzY2hlbWEubWF4aW11bX0pLnByZWZpeFdpdGgobnVsbCwgXCJleGNsdXNpdmVNYXhpbXVtXCIpO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlTmFOID0gZnVuY3Rpb24gdmFsaWRhdGVOYU4oZGF0YSkge1xuXHRpZiAodHlwZW9mIGRhdGEgIT09IFwibnVtYmVyXCIpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHRpZiAoaXNOYU4oZGF0YSkgPT09IHRydWUgfHwgZGF0YSA9PT0gSW5maW5pdHkgfHwgZGF0YSA9PT0gLUluZmluaXR5KSB7XG5cdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5OVU1CRVJfTk9UX0FfTlVNQkVSLCB7dmFsdWU6IGRhdGF9KS5wcmVmaXhXaXRoKG51bGwsIFwidHlwZVwiKTtcblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlU3RyaW5nID0gZnVuY3Rpb24gdmFsaWRhdGVTdHJpbmcoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpIHtcblx0cmV0dXJuIHRoaXMudmFsaWRhdGVTdHJpbmdMZW5ndGgoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZVN0cmluZ1BhdHRlcm4oZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlU3RyaW5nTGVuZ3RoID0gZnVuY3Rpb24gdmFsaWRhdGVTdHJpbmdMZW5ndGgoZGF0YSwgc2NoZW1hKSB7XG5cdGlmICh0eXBlb2YgZGF0YSAhPT0gXCJzdHJpbmdcIikge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdGlmIChzY2hlbWEubWluTGVuZ3RoICE9PSB1bmRlZmluZWQpIHtcblx0XHRpZiAoZGF0YS5sZW5ndGggPCBzY2hlbWEubWluTGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLlNUUklOR19MRU5HVEhfU0hPUlQsIHtsZW5ndGg6IGRhdGEubGVuZ3RoLCBtaW5pbXVtOiBzY2hlbWEubWluTGVuZ3RofSkucHJlZml4V2l0aChudWxsLCBcIm1pbkxlbmd0aFwiKTtcblx0XHR9XG5cdH1cblx0aWYgKHNjaGVtYS5tYXhMZW5ndGggIT09IHVuZGVmaW5lZCkge1xuXHRcdGlmIChkYXRhLmxlbmd0aCA+IHNjaGVtYS5tYXhMZW5ndGgpIHtcblx0XHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuU1RSSU5HX0xFTkdUSF9MT05HLCB7bGVuZ3RoOiBkYXRhLmxlbmd0aCwgbWF4aW11bTogc2NoZW1hLm1heExlbmd0aH0pLnByZWZpeFdpdGgobnVsbCwgXCJtYXhMZW5ndGhcIik7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVTdHJpbmdQYXR0ZXJuID0gZnVuY3Rpb24gdmFsaWRhdGVTdHJpbmdQYXR0ZXJuKGRhdGEsIHNjaGVtYSkge1xuXHRpZiAodHlwZW9mIGRhdGEgIT09IFwic3RyaW5nXCIgfHwgc2NoZW1hLnBhdHRlcm4gPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdHZhciByZWdleHAgPSBuZXcgUmVnRXhwKHNjaGVtYS5wYXR0ZXJuKTtcblx0aWYgKCFyZWdleHAudGVzdChkYXRhKSkge1xuXHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuU1RSSU5HX1BBVFRFUk4sIHtwYXR0ZXJuOiBzY2hlbWEucGF0dGVybn0pLnByZWZpeFdpdGgobnVsbCwgXCJwYXR0ZXJuXCIpO1xuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlQXJyYXkgPSBmdW5jdGlvbiB2YWxpZGF0ZUFycmF5KGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKSB7XG5cdGlmICghQXJyYXkuaXNBcnJheShkYXRhKSkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdHJldHVybiB0aGlzLnZhbGlkYXRlQXJyYXlMZW5ndGgoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZUFycmF5VW5pcXVlSXRlbXMoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZUFycmF5SXRlbXMoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlQXJyYXlMZW5ndGggPSBmdW5jdGlvbiB2YWxpZGF0ZUFycmF5TGVuZ3RoKGRhdGEsIHNjaGVtYSkge1xuXHR2YXIgZXJyb3I7XG5cdGlmIChzY2hlbWEubWluSXRlbXMgIT09IHVuZGVmaW5lZCkge1xuXHRcdGlmIChkYXRhLmxlbmd0aCA8IHNjaGVtYS5taW5JdGVtcykge1xuXHRcdFx0ZXJyb3IgPSAodGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLkFSUkFZX0xFTkdUSF9TSE9SVCwge2xlbmd0aDogZGF0YS5sZW5ndGgsIG1pbmltdW06IHNjaGVtYS5taW5JdGVtc30pKS5wcmVmaXhXaXRoKG51bGwsIFwibWluSXRlbXNcIik7XG5cdFx0XHRpZiAodGhpcy5oYW5kbGVFcnJvcihlcnJvcikpIHtcblx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRpZiAoc2NoZW1hLm1heEl0ZW1zICE9PSB1bmRlZmluZWQpIHtcblx0XHRpZiAoZGF0YS5sZW5ndGggPiBzY2hlbWEubWF4SXRlbXMpIHtcblx0XHRcdGVycm9yID0gKHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5BUlJBWV9MRU5HVEhfTE9ORywge2xlbmd0aDogZGF0YS5sZW5ndGgsIG1heGltdW06IHNjaGVtYS5tYXhJdGVtc30pKS5wcmVmaXhXaXRoKG51bGwsIFwibWF4SXRlbXNcIik7XG5cdFx0XHRpZiAodGhpcy5oYW5kbGVFcnJvcihlcnJvcikpIHtcblx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlQXJyYXlVbmlxdWVJdGVtcyA9IGZ1bmN0aW9uIHZhbGlkYXRlQXJyYXlVbmlxdWVJdGVtcyhkYXRhLCBzY2hlbWEpIHtcblx0aWYgKHNjaGVtYS51bmlxdWVJdGVtcykge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuXHRcdFx0Zm9yICh2YXIgaiA9IGkgKyAxOyBqIDwgZGF0YS5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRpZiAocmVjdXJzaXZlQ29tcGFyZShkYXRhW2ldLCBkYXRhW2pdKSkge1xuXHRcdFx0XHRcdHZhciBlcnJvciA9ICh0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuQVJSQVlfVU5JUVVFLCB7bWF0Y2gxOiBpLCBtYXRjaDI6IGp9KSkucHJlZml4V2l0aChudWxsLCBcInVuaXF1ZUl0ZW1zXCIpO1xuXHRcdFx0XHRcdGlmICh0aGlzLmhhbmRsZUVycm9yKGVycm9yKSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlQXJyYXlJdGVtcyA9IGZ1bmN0aW9uIHZhbGlkYXRlQXJyYXlJdGVtcyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aCkge1xuXHRpZiAoc2NoZW1hLml0ZW1zID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHR2YXIgZXJyb3IsIGk7XG5cdGlmIChBcnJheS5pc0FycmF5KHNjaGVtYS5pdGVtcykpIHtcblx0XHRmb3IgKGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKGkgPCBzY2hlbWEuaXRlbXMubGVuZ3RoKSB7XG5cdFx0XHRcdGlmIChlcnJvciA9IHRoaXMudmFsaWRhdGVBbGwoZGF0YVtpXSwgc2NoZW1hLml0ZW1zW2ldLCBbaV0sIFtcIml0ZW1zXCIsIGldLCBkYXRhUG9pbnRlclBhdGggKyBcIi9cIiArIGkpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKHNjaGVtYS5hZGRpdGlvbmFsSXRlbXMgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRpZiAodHlwZW9mIHNjaGVtYS5hZGRpdGlvbmFsSXRlbXMgPT09IFwiYm9vbGVhblwiKSB7XG5cdFx0XHRcdFx0aWYgKCFzY2hlbWEuYWRkaXRpb25hbEl0ZW1zKSB7XG5cdFx0XHRcdFx0XHRlcnJvciA9ICh0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuQVJSQVlfQURESVRJT05BTF9JVEVNUywge30pKS5wcmVmaXhXaXRoKFwiXCIgKyBpLCBcImFkZGl0aW9uYWxJdGVtc1wiKTtcblx0XHRcdFx0XHRcdGlmICh0aGlzLmhhbmRsZUVycm9yKGVycm9yKSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2UgaWYgKGVycm9yID0gdGhpcy52YWxpZGF0ZUFsbChkYXRhW2ldLCBzY2hlbWEuYWRkaXRpb25hbEl0ZW1zLCBbaV0sIFtcImFkZGl0aW9uYWxJdGVtc1wiXSwgZGF0YVBvaW50ZXJQYXRoICsgXCIvXCIgKyBpKSkge1xuXHRcdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRmb3IgKGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKGVycm9yID0gdGhpcy52YWxpZGF0ZUFsbChkYXRhW2ldLCBzY2hlbWEuaXRlbXMsIFtpXSwgW1wiaXRlbXNcIl0sIGRhdGFQb2ludGVyUGF0aCArIFwiL1wiICsgaSkpIHtcblx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlT2JqZWN0ID0gZnVuY3Rpb24gdmFsaWRhdGVPYmplY3QoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpIHtcblx0aWYgKHR5cGVvZiBkYXRhICE9PSBcIm9iamVjdFwiIHx8IGRhdGEgPT09IG51bGwgfHwgQXJyYXkuaXNBcnJheShkYXRhKSkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdHJldHVybiB0aGlzLnZhbGlkYXRlT2JqZWN0TWluTWF4UHJvcGVydGllcyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCB0aGlzLnZhbGlkYXRlT2JqZWN0UmVxdWlyZWRQcm9wZXJ0aWVzKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVPYmplY3RQcm9wZXJ0aWVzKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVPYmplY3REZXBlbmRlbmNpZXMoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlT2JqZWN0TWluTWF4UHJvcGVydGllcyA9IGZ1bmN0aW9uIHZhbGlkYXRlT2JqZWN0TWluTWF4UHJvcGVydGllcyhkYXRhLCBzY2hlbWEpIHtcblx0dmFyIGtleXMgPSBPYmplY3Qua2V5cyhkYXRhKTtcblx0dmFyIGVycm9yO1xuXHRpZiAoc2NoZW1hLm1pblByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCkge1xuXHRcdGlmIChrZXlzLmxlbmd0aCA8IHNjaGVtYS5taW5Qcm9wZXJ0aWVzKSB7XG5cdFx0XHRlcnJvciA9IHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5PQkpFQ1RfUFJPUEVSVElFU19NSU5JTVVNLCB7cHJvcGVydHlDb3VudDoga2V5cy5sZW5ndGgsIG1pbmltdW06IHNjaGVtYS5taW5Qcm9wZXJ0aWVzfSkucHJlZml4V2l0aChudWxsLCBcIm1pblByb3BlcnRpZXNcIik7XG5cdFx0XHRpZiAodGhpcy5oYW5kbGVFcnJvcihlcnJvcikpIHtcblx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRpZiAoc2NoZW1hLm1heFByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCkge1xuXHRcdGlmIChrZXlzLmxlbmd0aCA+IHNjaGVtYS5tYXhQcm9wZXJ0aWVzKSB7XG5cdFx0XHRlcnJvciA9IHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5PQkpFQ1RfUFJPUEVSVElFU19NQVhJTVVNLCB7cHJvcGVydHlDb3VudDoga2V5cy5sZW5ndGgsIG1heGltdW06IHNjaGVtYS5tYXhQcm9wZXJ0aWVzfSkucHJlZml4V2l0aChudWxsLCBcIm1heFByb3BlcnRpZXNcIik7XG5cdFx0XHRpZiAodGhpcy5oYW5kbGVFcnJvcihlcnJvcikpIHtcblx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlT2JqZWN0UmVxdWlyZWRQcm9wZXJ0aWVzID0gZnVuY3Rpb24gdmFsaWRhdGVPYmplY3RSZXF1aXJlZFByb3BlcnRpZXMoZGF0YSwgc2NoZW1hKSB7XG5cdGlmIChzY2hlbWEucmVxdWlyZWQgIT09IHVuZGVmaW5lZCkge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc2NoZW1hLnJlcXVpcmVkLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIga2V5ID0gc2NoZW1hLnJlcXVpcmVkW2ldO1xuXHRcdFx0aWYgKGRhdGFba2V5XSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHZhciBlcnJvciA9IHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5PQkpFQ1RfUkVRVUlSRUQsIHtrZXk6IGtleX0pLnByZWZpeFdpdGgobnVsbCwgXCJcIiArIGkpLnByZWZpeFdpdGgobnVsbCwgXCJyZXF1aXJlZFwiKTtcblx0XHRcdFx0aWYgKHRoaXMuaGFuZGxlRXJyb3IoZXJyb3IpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVPYmplY3RQcm9wZXJ0aWVzID0gZnVuY3Rpb24gdmFsaWRhdGVPYmplY3RQcm9wZXJ0aWVzKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKSB7XG5cdHZhciBlcnJvcjtcblx0Zm9yICh2YXIga2V5IGluIGRhdGEpIHtcblx0XHR2YXIga2V5UG9pbnRlclBhdGggPSBkYXRhUG9pbnRlclBhdGggKyBcIi9cIiArIGtleS5yZXBsYWNlKC9+L2csICd+MCcpLnJlcGxhY2UoL1xcLy9nLCAnfjEnKTtcblx0XHR2YXIgZm91bmRNYXRjaCA9IGZhbHNlO1xuXHRcdGlmIChzY2hlbWEucHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICYmIHNjaGVtYS5wcm9wZXJ0aWVzW2tleV0gIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Zm91bmRNYXRjaCA9IHRydWU7XG5cdFx0XHRpZiAoZXJyb3IgPSB0aGlzLnZhbGlkYXRlQWxsKGRhdGFba2V5XSwgc2NoZW1hLnByb3BlcnRpZXNba2V5XSwgW2tleV0sIFtcInByb3BlcnRpZXNcIiwga2V5XSwga2V5UG9pbnRlclBhdGgpKSB7XG5cdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKHNjaGVtYS5wYXR0ZXJuUHJvcGVydGllcyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRmb3IgKHZhciBwYXR0ZXJuS2V5IGluIHNjaGVtYS5wYXR0ZXJuUHJvcGVydGllcykge1xuXHRcdFx0XHR2YXIgcmVnZXhwID0gbmV3IFJlZ0V4cChwYXR0ZXJuS2V5KTtcblx0XHRcdFx0aWYgKHJlZ2V4cC50ZXN0KGtleSkpIHtcblx0XHRcdFx0XHRmb3VuZE1hdGNoID0gdHJ1ZTtcblx0XHRcdFx0XHRpZiAoZXJyb3IgPSB0aGlzLnZhbGlkYXRlQWxsKGRhdGFba2V5XSwgc2NoZW1hLnBhdHRlcm5Qcm9wZXJ0aWVzW3BhdHRlcm5LZXldLCBba2V5XSwgW1wicGF0dGVyblByb3BlcnRpZXNcIiwgcGF0dGVybktleV0sIGtleVBvaW50ZXJQYXRoKSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoIWZvdW5kTWF0Y2gpIHtcblx0XHRcdGlmIChzY2hlbWEuYWRkaXRpb25hbFByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRpZiAodGhpcy50cmFja1Vua25vd25Qcm9wZXJ0aWVzKSB7XG5cdFx0XHRcdFx0dGhpcy5rbm93blByb3BlcnR5UGF0aHNba2V5UG9pbnRlclBhdGhdID0gdHJ1ZTtcblx0XHRcdFx0XHRkZWxldGUgdGhpcy51bmtub3duUHJvcGVydHlQYXRoc1trZXlQb2ludGVyUGF0aF07XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHR5cGVvZiBzY2hlbWEuYWRkaXRpb25hbFByb3BlcnRpZXMgPT09IFwiYm9vbGVhblwiKSB7XG5cdFx0XHRcdFx0aWYgKCFzY2hlbWEuYWRkaXRpb25hbFByb3BlcnRpZXMpIHtcblx0XHRcdFx0XHRcdGVycm9yID0gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLk9CSkVDVF9BRERJVElPTkFMX1BST1BFUlRJRVMsIHt9KS5wcmVmaXhXaXRoKGtleSwgXCJhZGRpdGlvbmFsUHJvcGVydGllc1wiKTtcblx0XHRcdFx0XHRcdGlmICh0aGlzLmhhbmRsZUVycm9yKGVycm9yKSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGlmIChlcnJvciA9IHRoaXMudmFsaWRhdGVBbGwoZGF0YVtrZXldLCBzY2hlbWEuYWRkaXRpb25hbFByb3BlcnRpZXMsIFtrZXldLCBbXCJhZGRpdGlvbmFsUHJvcGVydGllc1wiXSwga2V5UG9pbnRlclBhdGgpKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKHRoaXMudHJhY2tVbmtub3duUHJvcGVydGllcyAmJiAhdGhpcy5rbm93blByb3BlcnR5UGF0aHNba2V5UG9pbnRlclBhdGhdKSB7XG5cdFx0XHRcdHRoaXMudW5rbm93blByb3BlcnR5UGF0aHNba2V5UG9pbnRlclBhdGhdID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKHRoaXMudHJhY2tVbmtub3duUHJvcGVydGllcykge1xuXHRcdFx0dGhpcy5rbm93blByb3BlcnR5UGF0aHNba2V5UG9pbnRlclBhdGhdID0gdHJ1ZTtcblx0XHRcdGRlbGV0ZSB0aGlzLnVua25vd25Qcm9wZXJ0eVBhdGhzW2tleVBvaW50ZXJQYXRoXTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZU9iamVjdERlcGVuZGVuY2llcyA9IGZ1bmN0aW9uIHZhbGlkYXRlT2JqZWN0RGVwZW5kZW5jaWVzKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKSB7XG5cdHZhciBlcnJvcjtcblx0aWYgKHNjaGVtYS5kZXBlbmRlbmNpZXMgIT09IHVuZGVmaW5lZCkge1xuXHRcdGZvciAodmFyIGRlcEtleSBpbiBzY2hlbWEuZGVwZW5kZW5jaWVzKSB7XG5cdFx0XHRpZiAoZGF0YVtkZXBLZXldICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0dmFyIGRlcCA9IHNjaGVtYS5kZXBlbmRlbmNpZXNbZGVwS2V5XTtcblx0XHRcdFx0aWYgKHR5cGVvZiBkZXAgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0XHRpZiAoZGF0YVtkZXBdID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdGVycm9yID0gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLk9CSkVDVF9ERVBFTkRFTkNZX0tFWSwge2tleTogZGVwS2V5LCBtaXNzaW5nOiBkZXB9KS5wcmVmaXhXaXRoKG51bGwsIGRlcEtleSkucHJlZml4V2l0aChudWxsLCBcImRlcGVuZGVuY2llc1wiKTtcblx0XHRcdFx0XHRcdGlmICh0aGlzLmhhbmRsZUVycm9yKGVycm9yKSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoZGVwKSkge1xuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZGVwLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHR2YXIgcmVxdWlyZWRLZXkgPSBkZXBbaV07XG5cdFx0XHRcdFx0XHRpZiAoZGF0YVtyZXF1aXJlZEtleV0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0XHRlcnJvciA9IHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5PQkpFQ1RfREVQRU5ERU5DWV9LRVksIHtrZXk6IGRlcEtleSwgbWlzc2luZzogcmVxdWlyZWRLZXl9KS5wcmVmaXhXaXRoKG51bGwsIFwiXCIgKyBpKS5wcmVmaXhXaXRoKG51bGwsIGRlcEtleSkucHJlZml4V2l0aChudWxsLCBcImRlcGVuZGVuY2llc1wiKTtcblx0XHRcdFx0XHRcdFx0aWYgKHRoaXMuaGFuZGxlRXJyb3IoZXJyb3IpKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGlmIChlcnJvciA9IHRoaXMudmFsaWRhdGVBbGwoZGF0YSwgZGVwLCBbXSwgW1wiZGVwZW5kZW5jaWVzXCIsIGRlcEtleV0sIGRhdGFQb2ludGVyUGF0aCkpIHtcblx0XHRcdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZUNvbWJpbmF0aW9ucyA9IGZ1bmN0aW9uIHZhbGlkYXRlQ29tYmluYXRpb25zKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKSB7XG5cdHJldHVybiB0aGlzLnZhbGlkYXRlQWxsT2YoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZUFueU9mKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVPbmVPZihkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCB0aGlzLnZhbGlkYXRlTm90KGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZUFsbE9mID0gZnVuY3Rpb24gdmFsaWRhdGVBbGxPZihkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aCkge1xuXHRpZiAoc2NoZW1hLmFsbE9mID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHR2YXIgZXJyb3I7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgc2NoZW1hLmFsbE9mLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIHN1YlNjaGVtYSA9IHNjaGVtYS5hbGxPZltpXTtcblx0XHRpZiAoZXJyb3IgPSB0aGlzLnZhbGlkYXRlQWxsKGRhdGEsIHN1YlNjaGVtYSwgW10sIFtcImFsbE9mXCIsIGldLCBkYXRhUG9pbnRlclBhdGgpKSB7XG5cdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVBbnlPZiA9IGZ1bmN0aW9uIHZhbGlkYXRlQW55T2YoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpIHtcblx0aWYgKHNjaGVtYS5hbnlPZiA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0dmFyIGVycm9ycyA9IFtdO1xuXHR2YXIgc3RhcnRFcnJvckNvdW50ID0gdGhpcy5lcnJvcnMubGVuZ3RoO1xuXHR2YXIgb2xkVW5rbm93blByb3BlcnR5UGF0aHMsIG9sZEtub3duUHJvcGVydHlQYXRocztcblx0aWYgKHRoaXMudHJhY2tVbmtub3duUHJvcGVydGllcykge1xuXHRcdG9sZFVua25vd25Qcm9wZXJ0eVBhdGhzID0gdGhpcy51bmtub3duUHJvcGVydHlQYXRocztcblx0XHRvbGRLbm93blByb3BlcnR5UGF0aHMgPSB0aGlzLmtub3duUHJvcGVydHlQYXRocztcblx0fVxuXHR2YXIgZXJyb3JBdEVuZCA9IHRydWU7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgc2NoZW1hLmFueU9mLmxlbmd0aDsgaSsrKSB7XG5cdFx0aWYgKHRoaXMudHJhY2tVbmtub3duUHJvcGVydGllcykge1xuXHRcdFx0dGhpcy51bmtub3duUHJvcGVydHlQYXRocyA9IHt9O1xuXHRcdFx0dGhpcy5rbm93blByb3BlcnR5UGF0aHMgPSB7fTtcblx0XHR9XG5cdFx0dmFyIHN1YlNjaGVtYSA9IHNjaGVtYS5hbnlPZltpXTtcblxuXHRcdHZhciBlcnJvckNvdW50ID0gdGhpcy5lcnJvcnMubGVuZ3RoO1xuXHRcdHZhciBlcnJvciA9IHRoaXMudmFsaWRhdGVBbGwoZGF0YSwgc3ViU2NoZW1hLCBbXSwgW1wiYW55T2ZcIiwgaV0sIGRhdGFQb2ludGVyUGF0aCk7XG5cblx0XHRpZiAoZXJyb3IgPT09IG51bGwgJiYgZXJyb3JDb3VudCA9PT0gdGhpcy5lcnJvcnMubGVuZ3RoKSB7XG5cdFx0XHR0aGlzLmVycm9ycyA9IHRoaXMuZXJyb3JzLnNsaWNlKDAsIHN0YXJ0RXJyb3JDb3VudCk7XG5cblx0XHRcdGlmICh0aGlzLnRyYWNrVW5rbm93blByb3BlcnRpZXMpIHtcblx0XHRcdFx0Zm9yICh2YXIga25vd25LZXkgaW4gdGhpcy5rbm93blByb3BlcnR5UGF0aHMpIHtcblx0XHRcdFx0XHRvbGRLbm93blByb3BlcnR5UGF0aHNba25vd25LZXldID0gdHJ1ZTtcblx0XHRcdFx0XHRkZWxldGUgb2xkVW5rbm93blByb3BlcnR5UGF0aHNba25vd25LZXldO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGZvciAodmFyIHVua25vd25LZXkgaW4gdGhpcy51bmtub3duUHJvcGVydHlQYXRocykge1xuXHRcdFx0XHRcdGlmICghb2xkS25vd25Qcm9wZXJ0eVBhdGhzW3Vua25vd25LZXldKSB7XG5cdFx0XHRcdFx0XHRvbGRVbmtub3duUHJvcGVydHlQYXRoc1t1bmtub3duS2V5XSA9IHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIFdlIG5lZWQgdG8gY29udGludWUgbG9vcGluZyBzbyB3ZSBjYXRjaCBhbGwgdGhlIHByb3BlcnR5IGRlZmluaXRpb25zLCBidXQgd2UgZG9uJ3Qgd2FudCB0byByZXR1cm4gYW4gZXJyb3Jcblx0XHRcdFx0ZXJyb3JBdEVuZCA9IGZhbHNlO1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHRcdGlmIChlcnJvcikge1xuXHRcdFx0ZXJyb3JzLnB1c2goZXJyb3IucHJlZml4V2l0aChudWxsLCBcIlwiICsgaSkucHJlZml4V2l0aChudWxsLCBcImFueU9mXCIpKTtcblx0XHR9XG5cdH1cblx0aWYgKHRoaXMudHJhY2tVbmtub3duUHJvcGVydGllcykge1xuXHRcdHRoaXMudW5rbm93blByb3BlcnR5UGF0aHMgPSBvbGRVbmtub3duUHJvcGVydHlQYXRocztcblx0XHR0aGlzLmtub3duUHJvcGVydHlQYXRocyA9IG9sZEtub3duUHJvcGVydHlQYXRocztcblx0fVxuXHRpZiAoZXJyb3JBdEVuZCkge1xuXHRcdGVycm9ycyA9IGVycm9ycy5jb25jYXQodGhpcy5lcnJvcnMuc2xpY2Uoc3RhcnRFcnJvckNvdW50KSk7XG5cdFx0dGhpcy5lcnJvcnMgPSB0aGlzLmVycm9ycy5zbGljZSgwLCBzdGFydEVycm9yQ291bnQpO1xuXHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuQU5ZX09GX01JU1NJTkcsIHt9LCBcIlwiLCBcIi9hbnlPZlwiLCBlcnJvcnMpO1xuXHR9XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZU9uZU9mID0gZnVuY3Rpb24gdmFsaWRhdGVPbmVPZihkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aCkge1xuXHRpZiAoc2NoZW1hLm9uZU9mID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHR2YXIgdmFsaWRJbmRleCA9IG51bGw7XG5cdHZhciBlcnJvcnMgPSBbXTtcblx0dmFyIHN0YXJ0RXJyb3JDb3VudCA9IHRoaXMuZXJyb3JzLmxlbmd0aDtcblx0dmFyIG9sZFVua25vd25Qcm9wZXJ0eVBhdGhzLCBvbGRLbm93blByb3BlcnR5UGF0aHM7XG5cdGlmICh0aGlzLnRyYWNrVW5rbm93blByb3BlcnRpZXMpIHtcblx0XHRvbGRVbmtub3duUHJvcGVydHlQYXRocyA9IHRoaXMudW5rbm93blByb3BlcnR5UGF0aHM7XG5cdFx0b2xkS25vd25Qcm9wZXJ0eVBhdGhzID0gdGhpcy5rbm93blByb3BlcnR5UGF0aHM7XG5cdH1cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzY2hlbWEub25lT2YubGVuZ3RoOyBpKyspIHtcblx0XHRpZiAodGhpcy50cmFja1Vua25vd25Qcm9wZXJ0aWVzKSB7XG5cdFx0XHR0aGlzLnVua25vd25Qcm9wZXJ0eVBhdGhzID0ge307XG5cdFx0XHR0aGlzLmtub3duUHJvcGVydHlQYXRocyA9IHt9O1xuXHRcdH1cblx0XHR2YXIgc3ViU2NoZW1hID0gc2NoZW1hLm9uZU9mW2ldO1xuXG5cdFx0dmFyIGVycm9yQ291bnQgPSB0aGlzLmVycm9ycy5sZW5ndGg7XG5cdFx0dmFyIGVycm9yID0gdGhpcy52YWxpZGF0ZUFsbChkYXRhLCBzdWJTY2hlbWEsIFtdLCBbXCJvbmVPZlwiLCBpXSwgZGF0YVBvaW50ZXJQYXRoKTtcblxuXHRcdGlmIChlcnJvciA9PT0gbnVsbCAmJiBlcnJvckNvdW50ID09PSB0aGlzLmVycm9ycy5sZW5ndGgpIHtcblx0XHRcdGlmICh2YWxpZEluZGV4ID09PSBudWxsKSB7XG5cdFx0XHRcdHZhbGlkSW5kZXggPSBpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5lcnJvcnMgPSB0aGlzLmVycm9ycy5zbGljZSgwLCBzdGFydEVycm9yQ291bnQpO1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLk9ORV9PRl9NVUxUSVBMRSwge2luZGV4MTogdmFsaWRJbmRleCwgaW5kZXgyOiBpfSwgXCJcIiwgXCIvb25lT2ZcIik7XG5cdFx0XHR9XG5cdFx0XHRpZiAodGhpcy50cmFja1Vua25vd25Qcm9wZXJ0aWVzKSB7XG5cdFx0XHRcdGZvciAodmFyIGtub3duS2V5IGluIHRoaXMua25vd25Qcm9wZXJ0eVBhdGhzKSB7XG5cdFx0XHRcdFx0b2xkS25vd25Qcm9wZXJ0eVBhdGhzW2tub3duS2V5XSA9IHRydWU7XG5cdFx0XHRcdFx0ZGVsZXRlIG9sZFVua25vd25Qcm9wZXJ0eVBhdGhzW2tub3duS2V5XTtcblx0XHRcdFx0fVxuXHRcdFx0XHRmb3IgKHZhciB1bmtub3duS2V5IGluIHRoaXMudW5rbm93blByb3BlcnR5UGF0aHMpIHtcblx0XHRcdFx0XHRpZiAoIW9sZEtub3duUHJvcGVydHlQYXRoc1t1bmtub3duS2V5XSkge1xuXHRcdFx0XHRcdFx0b2xkVW5rbm93blByb3BlcnR5UGF0aHNbdW5rbm93bktleV0gPSB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoZXJyb3IpIHtcblx0XHRcdGVycm9ycy5wdXNoKGVycm9yKTtcblx0XHR9XG5cdH1cblx0aWYgKHRoaXMudHJhY2tVbmtub3duUHJvcGVydGllcykge1xuXHRcdHRoaXMudW5rbm93blByb3BlcnR5UGF0aHMgPSBvbGRVbmtub3duUHJvcGVydHlQYXRocztcblx0XHR0aGlzLmtub3duUHJvcGVydHlQYXRocyA9IG9sZEtub3duUHJvcGVydHlQYXRocztcblx0fVxuXHRpZiAodmFsaWRJbmRleCA9PT0gbnVsbCkge1xuXHRcdGVycm9ycyA9IGVycm9ycy5jb25jYXQodGhpcy5lcnJvcnMuc2xpY2Uoc3RhcnRFcnJvckNvdW50KSk7XG5cdFx0dGhpcy5lcnJvcnMgPSB0aGlzLmVycm9ycy5zbGljZSgwLCBzdGFydEVycm9yQ291bnQpO1xuXHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuT05FX09GX01JU1NJTkcsIHt9LCBcIlwiLCBcIi9vbmVPZlwiLCBlcnJvcnMpO1xuXHR9IGVsc2Uge1xuXHRcdHRoaXMuZXJyb3JzID0gdGhpcy5lcnJvcnMuc2xpY2UoMCwgc3RhcnRFcnJvckNvdW50KTtcblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlTm90ID0gZnVuY3Rpb24gdmFsaWRhdGVOb3QoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpIHtcblx0aWYgKHNjaGVtYS5ub3QgPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdHZhciBvbGRFcnJvckNvdW50ID0gdGhpcy5lcnJvcnMubGVuZ3RoO1xuXHR2YXIgb2xkVW5rbm93blByb3BlcnR5UGF0aHMsIG9sZEtub3duUHJvcGVydHlQYXRocztcblx0aWYgKHRoaXMudHJhY2tVbmtub3duUHJvcGVydGllcykge1xuXHRcdG9sZFVua25vd25Qcm9wZXJ0eVBhdGhzID0gdGhpcy51bmtub3duUHJvcGVydHlQYXRocztcblx0XHRvbGRLbm93blByb3BlcnR5UGF0aHMgPSB0aGlzLmtub3duUHJvcGVydHlQYXRocztcblx0XHR0aGlzLnVua25vd25Qcm9wZXJ0eVBhdGhzID0ge307XG5cdFx0dGhpcy5rbm93blByb3BlcnR5UGF0aHMgPSB7fTtcblx0fVxuXHR2YXIgZXJyb3IgPSB0aGlzLnZhbGlkYXRlQWxsKGRhdGEsIHNjaGVtYS5ub3QsIG51bGwsIG51bGwsIGRhdGFQb2ludGVyUGF0aCk7XG5cdHZhciBub3RFcnJvcnMgPSB0aGlzLmVycm9ycy5zbGljZShvbGRFcnJvckNvdW50KTtcblx0dGhpcy5lcnJvcnMgPSB0aGlzLmVycm9ycy5zbGljZSgwLCBvbGRFcnJvckNvdW50KTtcblx0aWYgKHRoaXMudHJhY2tVbmtub3duUHJvcGVydGllcykge1xuXHRcdHRoaXMudW5rbm93blByb3BlcnR5UGF0aHMgPSBvbGRVbmtub3duUHJvcGVydHlQYXRocztcblx0XHR0aGlzLmtub3duUHJvcGVydHlQYXRocyA9IG9sZEtub3duUHJvcGVydHlQYXRocztcblx0fVxuXHRpZiAoZXJyb3IgPT09IG51bGwgJiYgbm90RXJyb3JzLmxlbmd0aCA9PT0gMCkge1xuXHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuTk9UX1BBU1NFRCwge30sIFwiXCIsIFwiL25vdFwiKTtcblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlSHlwZXJtZWRpYSA9IGZ1bmN0aW9uIHZhbGlkYXRlQ29tYmluYXRpb25zKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKSB7XG5cdGlmICghc2NoZW1hLmxpbmtzKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0dmFyIGVycm9yO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHNjaGVtYS5saW5rcy5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBsZG8gPSBzY2hlbWEubGlua3NbaV07XG5cdFx0aWYgKGxkby5yZWwgPT09IFwiZGVzY3JpYmVkYnlcIikge1xuXHRcdFx0dmFyIHRlbXBsYXRlID0gbmV3IFVyaVRlbXBsYXRlKGxkby5ocmVmKTtcblx0XHRcdHZhciBhbGxQcmVzZW50ID0gdHJ1ZTtcblx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgdGVtcGxhdGUudmFyTmFtZXMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0aWYgKCEodGVtcGxhdGUudmFyTmFtZXNbal0gaW4gZGF0YSkpIHtcblx0XHRcdFx0XHRhbGxQcmVzZW50ID0gZmFsc2U7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmIChhbGxQcmVzZW50KSB7XG5cdFx0XHRcdHZhciBzY2hlbWFVcmwgPSB0ZW1wbGF0ZS5maWxsRnJvbU9iamVjdChkYXRhKTtcblx0XHRcdFx0dmFyIHN1YlNjaGVtYSA9IHtcIiRyZWZcIjogc2NoZW1hVXJsfTtcblx0XHRcdFx0aWYgKGVycm9yID0gdGhpcy52YWxpZGF0ZUFsbChkYXRhLCBzdWJTY2hlbWEsIFtdLCBbXCJsaW5rc1wiLCBpXSwgZGF0YVBvaW50ZXJQYXRoKSkge1xuXHRcdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxufTtcblxuLy8gcGFyc2VVUkkoKSBhbmQgcmVzb2x2ZVVybCgpIGFyZSBmcm9tIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tLzEwODg4NTBcbi8vICAgLSAgcmVsZWFzZWQgYXMgcHVibGljIGRvbWFpbiBieSBhdXRob3IgKFwiWWFmZmxlXCIpIC0gc2VlIGNvbW1lbnRzIG9uIGdpc3RcblxuZnVuY3Rpb24gcGFyc2VVUkkodXJsKSB7XG5cdHZhciBtID0gU3RyaW5nKHVybCkucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpLm1hdGNoKC9eKFteOlxcLz8jXSs6KT8oXFwvXFwvKD86W146QF0qKD86OlteOkBdKik/QCk/KChbXjpcXC8/I10qKSg/OjooXFxkKikpPykpPyhbXj8jXSopKFxcP1teI10qKT8oI1tcXHNcXFNdKik/Lyk7XG5cdC8vIGF1dGhvcml0eSA9ICcvLycgKyB1c2VyICsgJzonICsgcGFzcyAnQCcgKyBob3N0bmFtZSArICc6JyBwb3J0XG5cdHJldHVybiAobSA/IHtcblx0XHRocmVmICAgICA6IG1bMF0gfHwgJycsXG5cdFx0cHJvdG9jb2wgOiBtWzFdIHx8ICcnLFxuXHRcdGF1dGhvcml0eTogbVsyXSB8fCAnJyxcblx0XHRob3N0ICAgICA6IG1bM10gfHwgJycsXG5cdFx0aG9zdG5hbWUgOiBtWzRdIHx8ICcnLFxuXHRcdHBvcnQgICAgIDogbVs1XSB8fCAnJyxcblx0XHRwYXRobmFtZSA6IG1bNl0gfHwgJycsXG5cdFx0c2VhcmNoICAgOiBtWzddIHx8ICcnLFxuXHRcdGhhc2ggICAgIDogbVs4XSB8fCAnJ1xuXHR9IDogbnVsbCk7XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVVcmwoYmFzZSwgaHJlZikgey8vIFJGQyAzOTg2XG5cblx0ZnVuY3Rpb24gcmVtb3ZlRG90U2VnbWVudHMoaW5wdXQpIHtcblx0XHR2YXIgb3V0cHV0ID0gW107XG5cdFx0aW5wdXQucmVwbGFjZSgvXihcXC5cXC4/KFxcL3wkKSkrLywgJycpXG5cdFx0XHQucmVwbGFjZSgvXFwvKFxcLihcXC98JCkpKy9nLCAnLycpXG5cdFx0XHQucmVwbGFjZSgvXFwvXFwuXFwuJC8sICcvLi4vJylcblx0XHRcdC5yZXBsYWNlKC9cXC8/W15cXC9dKi9nLCBmdW5jdGlvbiAocCkge1xuXHRcdFx0XHRpZiAocCA9PT0gJy8uLicpIHtcblx0XHRcdFx0XHRvdXRwdXQucG9wKCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0b3V0cHV0LnB1c2gocCk7XG5cdFx0XHRcdH1cblx0XHR9KTtcblx0XHRyZXR1cm4gb3V0cHV0LmpvaW4oJycpLnJlcGxhY2UoL15cXC8vLCBpbnB1dC5jaGFyQXQoMCkgPT09ICcvJyA/ICcvJyA6ICcnKTtcblx0fVxuXG5cdGhyZWYgPSBwYXJzZVVSSShocmVmIHx8ICcnKTtcblx0YmFzZSA9IHBhcnNlVVJJKGJhc2UgfHwgJycpO1xuXG5cdHJldHVybiAhaHJlZiB8fCAhYmFzZSA/IG51bGwgOiAoaHJlZi5wcm90b2NvbCB8fCBiYXNlLnByb3RvY29sKSArXG5cdFx0KGhyZWYucHJvdG9jb2wgfHwgaHJlZi5hdXRob3JpdHkgPyBocmVmLmF1dGhvcml0eSA6IGJhc2UuYXV0aG9yaXR5KSArXG5cdFx0cmVtb3ZlRG90U2VnbWVudHMoaHJlZi5wcm90b2NvbCB8fCBocmVmLmF1dGhvcml0eSB8fCBocmVmLnBhdGhuYW1lLmNoYXJBdCgwKSA9PT0gJy8nID8gaHJlZi5wYXRobmFtZSA6IChocmVmLnBhdGhuYW1lID8gKChiYXNlLmF1dGhvcml0eSAmJiAhYmFzZS5wYXRobmFtZSA/ICcvJyA6ICcnKSArIGJhc2UucGF0aG5hbWUuc2xpY2UoMCwgYmFzZS5wYXRobmFtZS5sYXN0SW5kZXhPZignLycpICsgMSkgKyBocmVmLnBhdGhuYW1lKSA6IGJhc2UucGF0aG5hbWUpKSArXG5cdFx0KGhyZWYucHJvdG9jb2wgfHwgaHJlZi5hdXRob3JpdHkgfHwgaHJlZi5wYXRobmFtZSA/IGhyZWYuc2VhcmNoIDogKGhyZWYuc2VhcmNoIHx8IGJhc2Uuc2VhcmNoKSkgK1xuXHRcdGhyZWYuaGFzaDtcbn1cblxuZnVuY3Rpb24gZ2V0RG9jdW1lbnRVcmkodXJpKSB7XG5cdHJldHVybiB1cmkuc3BsaXQoJyMnKVswXTtcbn1cbmZ1bmN0aW9uIG5vcm1TY2hlbWEoc2NoZW1hLCBiYXNlVXJpKSB7XG5cdGlmIChzY2hlbWEgJiYgdHlwZW9mIHNjaGVtYSA9PT0gXCJvYmplY3RcIikge1xuXHRcdGlmIChiYXNlVXJpID09PSB1bmRlZmluZWQpIHtcblx0XHRcdGJhc2VVcmkgPSBzY2hlbWEuaWQ7XG5cdFx0fSBlbHNlIGlmICh0eXBlb2Ygc2NoZW1hLmlkID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRiYXNlVXJpID0gcmVzb2x2ZVVybChiYXNlVXJpLCBzY2hlbWEuaWQpO1xuXHRcdFx0c2NoZW1hLmlkID0gYmFzZVVyaTtcblx0XHR9XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkoc2NoZW1hKSkge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzY2hlbWEubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0bm9ybVNjaGVtYShzY2hlbWFbaV0sIGJhc2VVcmkpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAodHlwZW9mIHNjaGVtYVsnJHJlZiddID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdHNjaGVtYVsnJHJlZiddID0gcmVzb2x2ZVVybChiYXNlVXJpLCBzY2hlbWFbJyRyZWYnXSk7XG5cdFx0XHR9XG5cdFx0XHRmb3IgKHZhciBrZXkgaW4gc2NoZW1hKSB7XG5cdFx0XHRcdGlmIChrZXkgIT09IFwiZW51bVwiKSB7XG5cdFx0XHRcdFx0bm9ybVNjaGVtYShzY2hlbWFba2V5XSwgYmFzZVVyaSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cblxudmFyIEVycm9yQ29kZXMgPSB7XG5cdElOVkFMSURfVFlQRTogMCxcblx0RU5VTV9NSVNNQVRDSDogMSxcblx0QU5ZX09GX01JU1NJTkc6IDEwLFxuXHRPTkVfT0ZfTUlTU0lORzogMTEsXG5cdE9ORV9PRl9NVUxUSVBMRTogMTIsXG5cdE5PVF9QQVNTRUQ6IDEzLFxuXHQvLyBOdW1lcmljIGVycm9yc1xuXHROVU1CRVJfTVVMVElQTEVfT0Y6IDEwMCxcblx0TlVNQkVSX01JTklNVU06IDEwMSxcblx0TlVNQkVSX01JTklNVU1fRVhDTFVTSVZFOiAxMDIsXG5cdE5VTUJFUl9NQVhJTVVNOiAxMDMsXG5cdE5VTUJFUl9NQVhJTVVNX0VYQ0xVU0lWRTogMTA0LFxuXHROVU1CRVJfTk9UX0FfTlVNQkVSOiAxMDUsXG5cdC8vIFN0cmluZyBlcnJvcnNcblx0U1RSSU5HX0xFTkdUSF9TSE9SVDogMjAwLFxuXHRTVFJJTkdfTEVOR1RIX0xPTkc6IDIwMSxcblx0U1RSSU5HX1BBVFRFUk46IDIwMixcblx0Ly8gT2JqZWN0IGVycm9yc1xuXHRPQkpFQ1RfUFJPUEVSVElFU19NSU5JTVVNOiAzMDAsXG5cdE9CSkVDVF9QUk9QRVJUSUVTX01BWElNVU06IDMwMSxcblx0T0JKRUNUX1JFUVVJUkVEOiAzMDIsXG5cdE9CSkVDVF9BRERJVElPTkFMX1BST1BFUlRJRVM6IDMwMyxcblx0T0JKRUNUX0RFUEVOREVOQ1lfS0VZOiAzMDQsXG5cdC8vIEFycmF5IGVycm9yc1xuXHRBUlJBWV9MRU5HVEhfU0hPUlQ6IDQwMCxcblx0QVJSQVlfTEVOR1RIX0xPTkc6IDQwMSxcblx0QVJSQVlfVU5JUVVFOiA0MDIsXG5cdEFSUkFZX0FERElUSU9OQUxfSVRFTVM6IDQwMyxcblx0Ly8gQ3VzdG9tL3VzZXItZGVmaW5lZCBlcnJvcnNcblx0Rk9STUFUX0NVU1RPTTogNTAwLFxuXHRLRVlXT1JEX0NVU1RPTTogNTAxLFxuXHQvLyBTY2hlbWEgc3RydWN0dXJlXG5cdENJUkNVTEFSX1JFRkVSRU5DRTogNjAwLFxuXHQvLyBOb24tc3RhbmRhcmQgdmFsaWRhdGlvbiBvcHRpb25zXG5cdFVOS05PV05fUFJPUEVSVFk6IDEwMDBcbn07XG52YXIgRXJyb3JDb2RlTG9va3VwID0ge307XG5mb3IgKHZhciBrZXkgaW4gRXJyb3JDb2Rlcykge1xuXHRFcnJvckNvZGVMb29rdXBbRXJyb3JDb2Rlc1trZXldXSA9IGtleTtcbn1cbnZhciBFcnJvck1lc3NhZ2VzRGVmYXVsdCA9IHtcblx0SU5WQUxJRF9UWVBFOiBcIkludmFsaWQgdHlwZToge3R5cGV9IChleHBlY3RlZCB7ZXhwZWN0ZWR9KVwiLFxuXHRFTlVNX01JU01BVENIOiBcIk5vIGVudW0gbWF0Y2ggZm9yOiB7dmFsdWV9XCIsXG5cdEFOWV9PRl9NSVNTSU5HOiBcIkRhdGEgZG9lcyBub3QgbWF0Y2ggYW55IHNjaGVtYXMgZnJvbSBcXFwiYW55T2ZcXFwiXCIsXG5cdE9ORV9PRl9NSVNTSU5HOiBcIkRhdGEgZG9lcyBub3QgbWF0Y2ggYW55IHNjaGVtYXMgZnJvbSBcXFwib25lT2ZcXFwiXCIsXG5cdE9ORV9PRl9NVUxUSVBMRTogXCJEYXRhIGlzIHZhbGlkIGFnYWluc3QgbW9yZSB0aGFuIG9uZSBzY2hlbWEgZnJvbSBcXFwib25lT2ZcXFwiOiBpbmRpY2VzIHtpbmRleDF9IGFuZCB7aW5kZXgyfVwiLFxuXHROT1RfUEFTU0VEOiBcIkRhdGEgbWF0Y2hlcyBzY2hlbWEgZnJvbSBcXFwibm90XFxcIlwiLFxuXHQvLyBOdW1lcmljIGVycm9yc1xuXHROVU1CRVJfTVVMVElQTEVfT0Y6IFwiVmFsdWUge3ZhbHVlfSBpcyBub3QgYSBtdWx0aXBsZSBvZiB7bXVsdGlwbGVPZn1cIixcblx0TlVNQkVSX01JTklNVU06IFwiVmFsdWUge3ZhbHVlfSBpcyBsZXNzIHRoYW4gbWluaW11bSB7bWluaW11bX1cIixcblx0TlVNQkVSX01JTklNVU1fRVhDTFVTSVZFOiBcIlZhbHVlIHt2YWx1ZX0gaXMgZXF1YWwgdG8gZXhjbHVzaXZlIG1pbmltdW0ge21pbmltdW19XCIsXG5cdE5VTUJFUl9NQVhJTVVNOiBcIlZhbHVlIHt2YWx1ZX0gaXMgZ3JlYXRlciB0aGFuIG1heGltdW0ge21heGltdW19XCIsXG5cdE5VTUJFUl9NQVhJTVVNX0VYQ0xVU0lWRTogXCJWYWx1ZSB7dmFsdWV9IGlzIGVxdWFsIHRvIGV4Y2x1c2l2ZSBtYXhpbXVtIHttYXhpbXVtfVwiLFxuXHROVU1CRVJfTk9UX0FfTlVNQkVSOiBcIlZhbHVlIHt2YWx1ZX0gaXMgbm90IGEgdmFsaWQgbnVtYmVyXCIsXG5cdC8vIFN0cmluZyBlcnJvcnNcblx0U1RSSU5HX0xFTkdUSF9TSE9SVDogXCJTdHJpbmcgaXMgdG9vIHNob3J0ICh7bGVuZ3RofSBjaGFycyksIG1pbmltdW0ge21pbmltdW19XCIsXG5cdFNUUklOR19MRU5HVEhfTE9ORzogXCJTdHJpbmcgaXMgdG9vIGxvbmcgKHtsZW5ndGh9IGNoYXJzKSwgbWF4aW11bSB7bWF4aW11bX1cIixcblx0U1RSSU5HX1BBVFRFUk46IFwiU3RyaW5nIGRvZXMgbm90IG1hdGNoIHBhdHRlcm46IHtwYXR0ZXJufVwiLFxuXHQvLyBPYmplY3QgZXJyb3JzXG5cdE9CSkVDVF9QUk9QRVJUSUVTX01JTklNVU06IFwiVG9vIGZldyBwcm9wZXJ0aWVzIGRlZmluZWQgKHtwcm9wZXJ0eUNvdW50fSksIG1pbmltdW0ge21pbmltdW19XCIsXG5cdE9CSkVDVF9QUk9QRVJUSUVTX01BWElNVU06IFwiVG9vIG1hbnkgcHJvcGVydGllcyBkZWZpbmVkICh7cHJvcGVydHlDb3VudH0pLCBtYXhpbXVtIHttYXhpbXVtfVwiLFxuXHRPQkpFQ1RfUkVRVUlSRUQ6IFwiTWlzc2luZyByZXF1aXJlZCBwcm9wZXJ0eToge2tleX1cIixcblx0T0JKRUNUX0FERElUSU9OQUxfUFJPUEVSVElFUzogXCJBZGRpdGlvbmFsIHByb3BlcnRpZXMgbm90IGFsbG93ZWRcIixcblx0T0JKRUNUX0RFUEVOREVOQ1lfS0VZOiBcIkRlcGVuZGVuY3kgZmFpbGVkIC0ga2V5IG11c3QgZXhpc3Q6IHttaXNzaW5nfSAoZHVlIHRvIGtleToge2tleX0pXCIsXG5cdC8vIEFycmF5IGVycm9yc1xuXHRBUlJBWV9MRU5HVEhfU0hPUlQ6IFwiQXJyYXkgaXMgdG9vIHNob3J0ICh7bGVuZ3RofSksIG1pbmltdW0ge21pbmltdW19XCIsXG5cdEFSUkFZX0xFTkdUSF9MT05HOiBcIkFycmF5IGlzIHRvbyBsb25nICh7bGVuZ3RofSksIG1heGltdW0ge21heGltdW19XCIsXG5cdEFSUkFZX1VOSVFVRTogXCJBcnJheSBpdGVtcyBhcmUgbm90IHVuaXF1ZSAoaW5kaWNlcyB7bWF0Y2gxfSBhbmQge21hdGNoMn0pXCIsXG5cdEFSUkFZX0FERElUSU9OQUxfSVRFTVM6IFwiQWRkaXRpb25hbCBpdGVtcyBub3QgYWxsb3dlZFwiLFxuXHQvLyBGb3JtYXQgZXJyb3JzXG5cdEZPUk1BVF9DVVNUT006IFwiRm9ybWF0IHZhbGlkYXRpb24gZmFpbGVkICh7bWVzc2FnZX0pXCIsXG5cdEtFWVdPUkRfQ1VTVE9NOiBcIktleXdvcmQgZmFpbGVkOiB7a2V5fSAoe21lc3NhZ2V9KVwiLFxuXHQvLyBTY2hlbWEgc3RydWN0dXJlXG5cdENJUkNVTEFSX1JFRkVSRU5DRTogXCJDaXJjdWxhciAkcmVmczoge3VybHN9XCIsXG5cdC8vIE5vbi1zdGFuZGFyZCB2YWxpZGF0aW9uIG9wdGlvbnNcblx0VU5LTk9XTl9QUk9QRVJUWTogXCJVbmtub3duIHByb3BlcnR5IChub3QgaW4gc2NoZW1hKVwiXG59O1xuXG5mdW5jdGlvbiBWYWxpZGF0aW9uRXJyb3IoY29kZSwgbWVzc2FnZSwgcGFyYW1zLCBkYXRhUGF0aCwgc2NoZW1hUGF0aCwgc3ViRXJyb3JzKSB7XG5cdEVycm9yLmNhbGwodGhpcyk7XG5cdGlmIChjb2RlID09PSB1bmRlZmluZWQpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IgKFwiTm8gY29kZSBzdXBwbGllZCBmb3IgZXJyb3I6IFwiKyBtZXNzYWdlKTtcblx0fVxuXHR0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuXHR0aGlzLnBhcmFtcyA9IHBhcmFtcztcblx0dGhpcy5jb2RlID0gY29kZTtcblx0dGhpcy5kYXRhUGF0aCA9IGRhdGFQYXRoIHx8IFwiXCI7XG5cdHRoaXMuc2NoZW1hUGF0aCA9IHNjaGVtYVBhdGggfHwgXCJcIjtcblx0dGhpcy5zdWJFcnJvcnMgPSBzdWJFcnJvcnMgfHwgbnVsbDtcblxuXHR2YXIgZXJyID0gbmV3IEVycm9yKHRoaXMubWVzc2FnZSk7XG5cdHRoaXMuc3RhY2sgPSBlcnIuc3RhY2sgfHwgZXJyLnN0YWNrdHJhY2U7XG5cdGlmICghdGhpcy5zdGFjaykge1xuXHRcdHRyeSB7XG5cdFx0XHR0aHJvdyBlcnI7XG5cdFx0fVxuXHRcdGNhdGNoKGVycikge1xuXHRcdFx0dGhpcy5zdGFjayA9IGVyci5zdGFjayB8fCBlcnIuc3RhY2t0cmFjZTtcblx0XHR9XG5cdH1cbn1cblZhbGlkYXRpb25FcnJvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVycm9yLnByb3RvdHlwZSk7XG5WYWxpZGF0aW9uRXJyb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVmFsaWRhdGlvbkVycm9yO1xuVmFsaWRhdGlvbkVycm9yLnByb3RvdHlwZS5uYW1lID0gJ1ZhbGlkYXRpb25FcnJvcic7XG5cblZhbGlkYXRpb25FcnJvci5wcm90b3R5cGUucHJlZml4V2l0aCA9IGZ1bmN0aW9uIChkYXRhUHJlZml4LCBzY2hlbWFQcmVmaXgpIHtcblx0aWYgKGRhdGFQcmVmaXggIT09IG51bGwpIHtcblx0XHRkYXRhUHJlZml4ID0gZGF0YVByZWZpeC5yZXBsYWNlKC9+L2csIFwifjBcIikucmVwbGFjZSgvXFwvL2csIFwifjFcIik7XG5cdFx0dGhpcy5kYXRhUGF0aCA9IFwiL1wiICsgZGF0YVByZWZpeCArIHRoaXMuZGF0YVBhdGg7XG5cdH1cblx0aWYgKHNjaGVtYVByZWZpeCAhPT0gbnVsbCkge1xuXHRcdHNjaGVtYVByZWZpeCA9IHNjaGVtYVByZWZpeC5yZXBsYWNlKC9+L2csIFwifjBcIikucmVwbGFjZSgvXFwvL2csIFwifjFcIik7XG5cdFx0dGhpcy5zY2hlbWFQYXRoID0gXCIvXCIgKyBzY2hlbWFQcmVmaXggKyB0aGlzLnNjaGVtYVBhdGg7XG5cdH1cblx0aWYgKHRoaXMuc3ViRXJyb3JzICE9PSBudWxsKSB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnN1YkVycm9ycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dGhpcy5zdWJFcnJvcnNbaV0ucHJlZml4V2l0aChkYXRhUHJlZml4LCBzY2hlbWFQcmVmaXgpO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gdGhpcztcbn07XG5cbmZ1bmN0aW9uIGlzVHJ1c3RlZFVybChiYXNlVXJsLCB0ZXN0VXJsKSB7XG5cdGlmKHRlc3RVcmwuc3Vic3RyaW5nKDAsIGJhc2VVcmwubGVuZ3RoKSA9PT0gYmFzZVVybCl7XG5cdFx0dmFyIHJlbWFpbmRlciA9IHRlc3RVcmwuc3Vic3RyaW5nKGJhc2VVcmwubGVuZ3RoKTtcblx0XHRpZiAoKHRlc3RVcmwubGVuZ3RoID4gMCAmJiB0ZXN0VXJsLmNoYXJBdChiYXNlVXJsLmxlbmd0aCAtIDEpID09PSBcIi9cIilcblx0XHRcdHx8IHJlbWFpbmRlci5jaGFyQXQoMCkgPT09IFwiI1wiXG5cdFx0XHR8fCByZW1haW5kZXIuY2hhckF0KDApID09PSBcIj9cIikge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBmYWxzZTtcbn1cblxudmFyIGxhbmd1YWdlcyA9IHt9O1xuZnVuY3Rpb24gY3JlYXRlQXBpKGxhbmd1YWdlKSB7XG5cdHZhciBnbG9iYWxDb250ZXh0ID0gbmV3IFZhbGlkYXRvckNvbnRleHQoKTtcblx0dmFyIGN1cnJlbnRMYW5ndWFnZSA9IGxhbmd1YWdlIHx8ICdlbic7XG5cdHZhciBhcGkgPSB7XG5cdFx0YWRkRm9ybWF0OiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRnbG9iYWxDb250ZXh0LmFkZEZvcm1hdC5hcHBseShnbG9iYWxDb250ZXh0LCBhcmd1bWVudHMpO1xuXHRcdH0sXG5cdFx0bGFuZ3VhZ2U6IGZ1bmN0aW9uIChjb2RlKSB7XG5cdFx0XHRpZiAoIWNvZGUpIHtcblx0XHRcdFx0cmV0dXJuIGN1cnJlbnRMYW5ndWFnZTtcblx0XHRcdH1cblx0XHRcdGlmICghbGFuZ3VhZ2VzW2NvZGVdKSB7XG5cdFx0XHRcdGNvZGUgPSBjb2RlLnNwbGl0KCctJylbMF07IC8vIGZhbGwgYmFjayB0byBiYXNlIGxhbmd1YWdlXG5cdFx0XHR9XG5cdFx0XHRpZiAobGFuZ3VhZ2VzW2NvZGVdKSB7XG5cdFx0XHRcdGN1cnJlbnRMYW5ndWFnZSA9IGNvZGU7XG5cdFx0XHRcdHJldHVybiBjb2RlOyAvLyBzbyB5b3UgY2FuIHRlbGwgaWYgZmFsbC1iYWNrIGhhcyBoYXBwZW5lZFxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0sXG5cdFx0YWRkTGFuZ3VhZ2U6IGZ1bmN0aW9uIChjb2RlLCBtZXNzYWdlTWFwKSB7XG5cdFx0XHR2YXIga2V5O1xuXHRcdFx0Zm9yIChrZXkgaW4gRXJyb3JDb2Rlcykge1xuXHRcdFx0XHRpZiAobWVzc2FnZU1hcFtrZXldICYmICFtZXNzYWdlTWFwW0Vycm9yQ29kZXNba2V5XV0pIHtcblx0XHRcdFx0XHRtZXNzYWdlTWFwW0Vycm9yQ29kZXNba2V5XV0gPSBtZXNzYWdlTWFwW2tleV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHZhciByb290Q29kZSA9IGNvZGUuc3BsaXQoJy0nKVswXTtcblx0XHRcdGlmICghbGFuZ3VhZ2VzW3Jvb3RDb2RlXSkgeyAvLyB1c2UgZm9yIGJhc2UgbGFuZ3VhZ2UgaWYgbm90IHlldCBkZWZpbmVkXG5cdFx0XHRcdGxhbmd1YWdlc1tjb2RlXSA9IG1lc3NhZ2VNYXA7XG5cdFx0XHRcdGxhbmd1YWdlc1tyb290Q29kZV0gPSBtZXNzYWdlTWFwO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0bGFuZ3VhZ2VzW2NvZGVdID0gT2JqZWN0LmNyZWF0ZShsYW5ndWFnZXNbcm9vdENvZGVdKTtcblx0XHRcdFx0Zm9yIChrZXkgaW4gbWVzc2FnZU1hcCkge1xuXHRcdFx0XHRcdGlmICh0eXBlb2YgbGFuZ3VhZ2VzW3Jvb3RDb2RlXVtrZXldID09PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHRcdFx0bGFuZ3VhZ2VzW3Jvb3RDb2RlXVtrZXldID0gbWVzc2FnZU1hcFtrZXldO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRsYW5ndWFnZXNbY29kZV1ba2V5XSA9IG1lc3NhZ2VNYXBba2V5XTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fSxcblx0XHRmcmVzaEFwaTogZnVuY3Rpb24gKGxhbmd1YWdlKSB7XG5cdFx0XHR2YXIgcmVzdWx0ID0gY3JlYXRlQXBpKCk7XG5cdFx0XHRpZiAobGFuZ3VhZ2UpIHtcblx0XHRcdFx0cmVzdWx0Lmxhbmd1YWdlKGxhbmd1YWdlKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fSxcblx0XHR2YWxpZGF0ZTogZnVuY3Rpb24gKGRhdGEsIHNjaGVtYSwgY2hlY2tSZWN1cnNpdmUsIGJhblVua25vd25Qcm9wZXJ0aWVzKSB7XG5cdFx0XHR2YXIgY29udGV4dCA9IG5ldyBWYWxpZGF0b3JDb250ZXh0KGdsb2JhbENvbnRleHQsIGZhbHNlLCBsYW5ndWFnZXNbY3VycmVudExhbmd1YWdlXSwgY2hlY2tSZWN1cnNpdmUsIGJhblVua25vd25Qcm9wZXJ0aWVzKTtcblx0XHRcdGlmICh0eXBlb2Ygc2NoZW1hID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdHNjaGVtYSA9IHtcIiRyZWZcIjogc2NoZW1hfTtcblx0XHRcdH1cblx0XHRcdGNvbnRleHQuYWRkU2NoZW1hKFwiXCIsIHNjaGVtYSk7XG5cdFx0XHR2YXIgZXJyb3IgPSBjb250ZXh0LnZhbGlkYXRlQWxsKGRhdGEsIHNjaGVtYSwgbnVsbCwgbnVsbCwgXCJcIik7XG5cdFx0XHRpZiAoIWVycm9yICYmIGJhblVua25vd25Qcm9wZXJ0aWVzKSB7XG5cdFx0XHRcdGVycm9yID0gY29udGV4dC5iYW5Vbmtub3duUHJvcGVydGllcygpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5lcnJvciA9IGVycm9yO1xuXHRcdFx0dGhpcy5taXNzaW5nID0gY29udGV4dC5taXNzaW5nO1xuXHRcdFx0dGhpcy52YWxpZCA9IChlcnJvciA9PT0gbnVsbCk7XG5cdFx0XHRyZXR1cm4gdGhpcy52YWxpZDtcblx0XHR9LFxuXHRcdHZhbGlkYXRlUmVzdWx0OiBmdW5jdGlvbiAoKSB7XG5cdFx0XHR2YXIgcmVzdWx0ID0ge307XG5cdFx0XHR0aGlzLnZhbGlkYXRlLmFwcGx5KHJlc3VsdCwgYXJndW1lbnRzKTtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fSxcblx0XHR2YWxpZGF0ZU11bHRpcGxlOiBmdW5jdGlvbiAoZGF0YSwgc2NoZW1hLCBjaGVja1JlY3Vyc2l2ZSwgYmFuVW5rbm93blByb3BlcnRpZXMpIHtcblx0XHRcdHZhciBjb250ZXh0ID0gbmV3IFZhbGlkYXRvckNvbnRleHQoZ2xvYmFsQ29udGV4dCwgdHJ1ZSwgbGFuZ3VhZ2VzW2N1cnJlbnRMYW5ndWFnZV0sIGNoZWNrUmVjdXJzaXZlLCBiYW5Vbmtub3duUHJvcGVydGllcyk7XG5cdFx0XHRpZiAodHlwZW9mIHNjaGVtYSA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRzY2hlbWEgPSB7XCIkcmVmXCI6IHNjaGVtYX07XG5cdFx0XHR9XG5cdFx0XHRjb250ZXh0LmFkZFNjaGVtYShcIlwiLCBzY2hlbWEpO1xuXHRcdFx0Y29udGV4dC52YWxpZGF0ZUFsbChkYXRhLCBzY2hlbWEsIG51bGwsIG51bGwsIFwiXCIpO1xuXHRcdFx0aWYgKGJhblVua25vd25Qcm9wZXJ0aWVzKSB7XG5cdFx0XHRcdGNvbnRleHQuYmFuVW5rbm93blByb3BlcnRpZXMoKTtcblx0XHRcdH1cblx0XHRcdHZhciByZXN1bHQgPSB7fTtcblx0XHRcdHJlc3VsdC5lcnJvcnMgPSBjb250ZXh0LmVycm9ycztcblx0XHRcdHJlc3VsdC5taXNzaW5nID0gY29udGV4dC5taXNzaW5nO1xuXHRcdFx0cmVzdWx0LnZhbGlkID0gKHJlc3VsdC5lcnJvcnMubGVuZ3RoID09PSAwKTtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fSxcblx0XHRhZGRTY2hlbWE6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBnbG9iYWxDb250ZXh0LmFkZFNjaGVtYS5hcHBseShnbG9iYWxDb250ZXh0LCBhcmd1bWVudHMpO1xuXHRcdH0sXG5cdFx0Z2V0U2NoZW1hOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gZ2xvYmFsQ29udGV4dC5nZXRTY2hlbWEuYXBwbHkoZ2xvYmFsQ29udGV4dCwgYXJndW1lbnRzKTtcblx0XHR9LFxuXHRcdGdldFNjaGVtYU1hcDogZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIGdsb2JhbENvbnRleHQuZ2V0U2NoZW1hTWFwLmFwcGx5KGdsb2JhbENvbnRleHQsIGFyZ3VtZW50cyk7XG5cdFx0fSxcblx0XHRnZXRTY2hlbWFVcmlzOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gZ2xvYmFsQ29udGV4dC5nZXRTY2hlbWFVcmlzLmFwcGx5KGdsb2JhbENvbnRleHQsIGFyZ3VtZW50cyk7XG5cdFx0fSxcblx0XHRnZXRNaXNzaW5nVXJpczogZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIGdsb2JhbENvbnRleHQuZ2V0TWlzc2luZ1VyaXMuYXBwbHkoZ2xvYmFsQ29udGV4dCwgYXJndW1lbnRzKTtcblx0XHR9LFxuXHRcdGRyb3BTY2hlbWFzOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRnbG9iYWxDb250ZXh0LmRyb3BTY2hlbWFzLmFwcGx5KGdsb2JhbENvbnRleHQsIGFyZ3VtZW50cyk7XG5cdFx0fSxcblx0XHRkZWZpbmVLZXl3b3JkOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRnbG9iYWxDb250ZXh0LmRlZmluZUtleXdvcmQuYXBwbHkoZ2xvYmFsQ29udGV4dCwgYXJndW1lbnRzKTtcblx0XHR9LFxuXHRcdGRlZmluZUVycm9yOiBmdW5jdGlvbiAoY29kZU5hbWUsIGNvZGVOdW1iZXIsIGRlZmF1bHRNZXNzYWdlKSB7XG5cdFx0XHRpZiAodHlwZW9mIGNvZGVOYW1lICE9PSAnc3RyaW5nJyB8fCAhL15bQS1aXSsoX1tBLVpdKykqJC8udGVzdChjb2RlTmFtZSkpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdDb2RlIG5hbWUgbXVzdCBiZSBhIHN0cmluZyBpbiBVUFBFUl9DQVNFX1dJVEhfVU5ERVJTQ09SRVMnKTtcblx0XHRcdH1cblx0XHRcdGlmICh0eXBlb2YgY29kZU51bWJlciAhPT0gJ251bWJlcicgfHwgY29kZU51bWJlciUxICE9PSAwIHx8IGNvZGVOdW1iZXIgPCAxMDAwMCkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0NvZGUgbnVtYmVyIG11c3QgYmUgYW4gaW50ZWdlciA+IDEwMDAwJyk7XG5cdFx0XHR9XG5cdFx0XHRpZiAodHlwZW9mIEVycm9yQ29kZXNbY29kZU5hbWVdICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yIGFscmVhZHkgZGVmaW5lZDogJyArIGNvZGVOYW1lICsgJyBhcyAnICsgRXJyb3JDb2Rlc1tjb2RlTmFtZV0pO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHR5cGVvZiBFcnJvckNvZGVMb29rdXBbY29kZU51bWJlcl0gIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcignRXJyb3IgY29kZSBhbHJlYWR5IHVzZWQ6ICcgKyBFcnJvckNvZGVMb29rdXBbY29kZU51bWJlcl0gKyAnIGFzICcgKyBjb2RlTnVtYmVyKTtcblx0XHRcdH1cblx0XHRcdEVycm9yQ29kZXNbY29kZU5hbWVdID0gY29kZU51bWJlcjtcblx0XHRcdEVycm9yQ29kZUxvb2t1cFtjb2RlTnVtYmVyXSA9IGNvZGVOYW1lO1xuXHRcdFx0RXJyb3JNZXNzYWdlc0RlZmF1bHRbY29kZU5hbWVdID0gRXJyb3JNZXNzYWdlc0RlZmF1bHRbY29kZU51bWJlcl0gPSBkZWZhdWx0TWVzc2FnZTtcblx0XHRcdGZvciAodmFyIGxhbmdDb2RlIGluIGxhbmd1YWdlcykge1xuXHRcdFx0XHR2YXIgbGFuZ3VhZ2UgPSBsYW5ndWFnZXNbbGFuZ0NvZGVdO1xuXHRcdFx0XHRpZiAobGFuZ3VhZ2VbY29kZU5hbWVdKSB7XG5cdFx0XHRcdFx0bGFuZ3VhZ2VbY29kZU51bWJlcl0gPSBsYW5ndWFnZVtjb2RlTnVtYmVyXSB8fCBsYW5ndWFnZVtjb2RlTmFtZV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXHRcdHJlc2V0OiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRnbG9iYWxDb250ZXh0LnJlc2V0KCk7XG5cdFx0XHR0aGlzLmVycm9yID0gbnVsbDtcblx0XHRcdHRoaXMubWlzc2luZyA9IFtdO1xuXHRcdFx0dGhpcy52YWxpZCA9IHRydWU7XG5cdFx0fSxcblx0XHRtaXNzaW5nOiBbXSxcblx0XHRlcnJvcjogbnVsbCxcblx0XHR2YWxpZDogdHJ1ZSxcblx0XHRub3JtU2NoZW1hOiBub3JtU2NoZW1hLFxuXHRcdHJlc29sdmVVcmw6IHJlc29sdmVVcmwsXG5cdFx0Z2V0RG9jdW1lbnRVcmk6IGdldERvY3VtZW50VXJpLFxuXHRcdGVycm9yQ29kZXM6IEVycm9yQ29kZXNcblx0fTtcblx0cmV0dXJuIGFwaTtcbn1cblxudmFyIHR2NCA9IGNyZWF0ZUFwaSgpO1xudHY0LmFkZExhbmd1YWdlKCdlbi1nYicsIEVycm9yTWVzc2FnZXNEZWZhdWx0KTtcblxuLy9sZWdhY3kgcHJvcGVydHlcbnR2NC50djQgPSB0djQ7XG5cbnJldHVybiB0djQ7IC8vIHVzZWQgYnkgX2hlYWRlci5qcyB0byBnbG9iYWxpc2UuXG5cbn0pKTsiLCJ2YXIgXyA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG52YXIgU3RlcHMgPSBbJ3BsYXknLCAnZm9ybScsICdyZXN1bHQnXTtcblxuZnVuY3Rpb24gSW5zdGFudFdpbihDdXJyZW50VXNlciwgU2hpcCkge1xuXG4gIHZhciBDSEFOR0VfRVZFTlQgPSBbXCJTSElQX0NIQU5HRVwiLCBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDAwMDAwMDAwMDApXS5qb2luKCdfJyk7XG5cbiAgdmFyIEFwcFN0YXRlID0ge307XG5cbiAgZnVuY3Rpb24gaW5pdFN0YXRlKHVzZXIsIHNoaXApIHtcbiAgICBBcHBTdGF0ZSA9IHtcbiAgICAgIHNoaXA6IF8ub21pdChzaGlwLCAnc2V0dGluZ3MnLCAncmVzb3VyY2VzJywgJ3RyYW5zbGF0aW9ucycpLFxuICAgICAgc2V0dGluZ3M6IHNoaXAuc2V0dGluZ3MsXG4gICAgICBmb3JtOiBzaGlwLnJlc291cmNlcy5mb3JtLFxuICAgICAgYWNoaWV2ZW1lbnQ6IHNoaXAucmVzb3VyY2VzLmFjaGlldmVtZW50LFxuICAgICAgdHJhbnNsYXRpb25zOiBzaGlwLnRyYW5zbGF0aW9ucyxcbiAgICAgIHVzZXI6IHVzZXIsXG4gICAgICBiYWRnZTogKHNoaXAucmVzb3VyY2VzLmFjaGlldmVtZW50ICYmIHNoaXAucmVzb3VyY2VzLmFjaGlldmVtZW50LmJhZGdlKVxuICAgIH07XG4gICAgZW1pdENoYW5nZSgpO1xuICAgIHJldHVybiBBcHBTdGF0ZTtcbiAgfTtcblxuICBmdW5jdGlvbiBlbWl0Q2hhbmdlKHRtcCkge1xuICAgIHZhciBzID0gZ2V0QXBwU3RhdGUodG1wKTtcbiAgICBIdWxsLmVtaXQoQ0hBTkdFX0VWRU5ULCBzKTtcbiAgfVxuXG5cbiAgLy8gQ3VzdG9taXphdGlvbiBzdXBwb3J0XG5cbiAgZnVuY3Rpb24gdXBkYXRlU2V0dGluZ3Moc2V0dGluZ3MpIHtcbiAgICBBcHBTdGF0ZS5zZXR0aW5ncyA9IHNldHRpbmdzO1xuICAgIGVtaXRDaGFuZ2UoeyBjaGFuZ2VkOiAnc2V0dGluZ3MnIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlVHJhbnNsYXRpb25zKHRyYW5zbGF0aW9ucykge1xuICAgIEFwcFN0YXRlLnRyYW5zbGF0aW9ucyA9IHRyYW5zbGF0aW9ucztcbiAgICBlbWl0Q2hhbmdlKHsgY2hhbmdlZDogJ3RyYW5zbGF0aW9ucycgfSk7XG4gIH1cblxuXG4gIC8vIFVzZXIgYWN0aW9uc1xuXG5cbiAgZnVuY3Rpb24gc3VibWl0Rm9ybShmb3JtRGF0YSkge1xuICAgIGVtaXRDaGFuZ2UoeyBjaGFuZ2VkOiAnbG9hZGluZycsIGxvYWRpbmc6ICdmb3JtJyB9KTtcbiAgICBIdWxsLmFwaS5wdXQoQXBwU3RhdGUuZm9ybS5pZCArIFwiL3N1Ym1pdFwiLCB7IGRhdGE6IGZvcm1EYXRhIH0pLnRoZW4oZnVuY3Rpb24oZm9ybSkge1xuICAgICAgQXBwU3RhdGUuZm9ybSA9IGZvcm07XG4gICAgICBlbWl0Q2hhbmdlKHsgY2hhbmdlZDogJ2Zvcm0nIH0pO1xuICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgY29uc29sZS53YXJuKCdFcnJvcicsIGVycik7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBwbGF5KHByb3ZpZGVyKSB7XG4gICAgaWYgKHVzZXJDYW5QbGF5KCkpIHtcbiAgICAgIGVtaXRDaGFuZ2UoeyBjaGFuZ2VkOiAnbG9hZGluZycsIGxvYWRpbmc6ICdiYWRnZScgfSk7XG4gICAgICByZXR1cm4gSHVsbC5hcGkucG9zdChBcHBTdGF0ZS5hY2hpZXZlbWVudC5pZCArIFwiL2FjaGlldmVcIikudGhlbihmdW5jdGlvbihiYWRnZSkge1xuICAgICAgICBBcHBTdGF0ZS5iYWRnZSA9IGJhZGdlO1xuICAgICAgICBlbWl0Q2hhbmdlKHsgY2hhbmdlZDogJ2JhZGdlJyB9KTtcbiAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICBjb25zb2xlLndhcm4oJ0Vycm9yOiAnLCBlcnIpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChwcm92aWRlciAmJiAhQXBwU3RhdGUudXNlcikge1xuICAgICAgbG9naW5BbmRQbGF5KHByb3ZpZGVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS53YXJuKFwiVXNlciBjYW5ub3QgcGxheVwiLCBjYW5QbGF5KCkpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBhdXRvUGxheSA9IGZhbHNlO1xuICBmdW5jdGlvbiBsb2dpbkFuZFBsYXkocHJvdmlkZXIsIG9wdGlvbnMpIHtcbiAgICBpZiAocHJvdmlkZXIpIHtcbiAgICAgIGF1dG9QbGF5ID0gdHJ1ZTtcbiAgICAgIGVtaXRDaGFuZ2UoeyBpc0xvZ2dpbmdJbjogdHJ1ZSB9KTtcbiAgICAgIEh1bGwubG9naW4ocHJvdmlkZXIsIG9wdGlvbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBcIltJbnN0YW50V2luXSBFcnJvciBpbiBsb2dpbkFuZFBsYXkgbWV0aG9kOiBtaXNzaW5nIGBwcm92aWRlcmBcIjtcbiAgICB9XG4gIH1cblxuICAvLyBTdGF0ZSBtYW5hZ2VtZW50XG5cbiAgZnVuY3Rpb24gZ2V0QXBwU3RhdGUodG1wKSB7XG4gICAgdmFyIHN0ZXAgPSBjdXJyZW50U3RlcCgpO1xuICAgIHZhciByZXQgPSBfLmV4dGVuZCh7fSwgQXBwU3RhdGUsIHtcbiAgICAgIHVzZXJDYW5QbGF5OiB1c2VyQ2FuUGxheSgpLFxuICAgICAgdXNlckhhc1BsYXllZDogdXNlckhhc1BsYXllZCgpLFxuICAgICAgdXNlckhhc1dvbjogdXNlckhhc1dvbigpLFxuICAgICAgY3VycmVudFN0ZXA6IHN0ZXAsXG4gICAgICBjdXJyZW50U3RlcEluZGV4OiBzdGVwSW5kZXgoc3RlcCksXG4gICAgICBpc0Zvcm1Db21wbGV0ZTogaXNGb3JtQ29tcGxldGUoKSxcbiAgICB9LCB0bXApO1xuICAgIHJldHVybiBfLmRlZXBDbG9uZShyZXQpO1xuICB9XG5cbiAgZnVuY3Rpb24gdXNlckNhblBsYXkoKSB7XG4gICAgcmV0dXJuIGNhblBsYXkoKSA9PT0gdHJ1ZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNhblBsYXkoKSB7XG4gICAgaWYgKCFBcHBTdGF0ZS51c2VyKSByZXR1cm4gXCJObyBjdXJyZW50IHVzZXJcIjtcbiAgICBpZiAodXNlckhhc1dvbigpKSByZXR1cm4gXCJBbHJlYWR5IHdvblwiO1xuICAgIHZhciBiYWRnZSA9IEFwcFN0YXRlLmJhZGdlO1xuICAgIGlmICghYmFkZ2UgfHwgIWJhZGdlLmRhdGEuYXR0ZW1wdHMpIHJldHVybiB0cnVlO1xuICAgIHZhciBkID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpLnNsaWNlKDAsIDEwKTtcbiAgICBpZiAoYmFkZ2UuZGF0YS5hdHRlbXB0c1tkXSkge1xuICAgICAgcmV0dXJuIFwiT25lIGF0dGVtcHQgYWxyZWFkeSB0b2RheVwiO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB1c2VySGFzUGxheWVkKCkge1xuICAgIHJldHVybiAhIUFwcFN0YXRlLmJhZGdlO1xuICB9XG5cbiAgZnVuY3Rpb24gdXNlckhhc1dvbigpIHtcbiAgICB2YXIgYmFkZ2UgPSBBcHBTdGF0ZS5iYWRnZTtcbiAgICBpZiAoIWJhZGdlIHx8ICFiYWRnZS5kYXRhKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIGJhZGdlLmRhdGEud2lubmVyID09PSB0cnVlO1xuICB9XG5cbiAgZnVuY3Rpb24gY3VycmVudFN0ZXAoKSB7XG4gICAgaWYgKCFBcHBTdGF0ZS51c2VyIHx8IHVzZXJDYW5QbGF5KCkpIHJldHVybiAncGxheSc7XG4gICAgaWYgKCFpc0Zvcm1Db21wbGV0ZSgpKSByZXR1cm4gJ2Zvcm0nO1xuICAgIHJldHVybiAncmVzdWx0JztcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0ZXBJbmRleChzdGVwKSB7XG4gICAgcmV0dXJuIFN0ZXBzLmluZGV4T2Yoc3RlcCk7XG4gIH1cblxuICBmdW5jdGlvbiBpc0Zvcm1Db21wbGV0ZSgpIHtcbiAgICBpZiAoIUFwcFN0YXRlLnVzZXIpIHJldHVybiBmYWxzZTtcbiAgICB2YXIgZmllbGRzID0gQXBwU3RhdGUuZm9ybSAmJiBBcHBTdGF0ZS5mb3JtLmZpZWxkc19saXN0O1xuICAgIHZhciByZXQgPSBBcHBTdGF0ZS5mb3JtLnVzZXJfZGF0YS5jcmVhdGVkX2F0ICYmIGZpZWxkcyAmJiBmaWVsZHMucmVkdWNlKGZ1bmN0aW9uKHJlcywgZmllbGQpIHtcbiAgICAgIHJldHVybiByZXMgJiYgISFmaWVsZC52YWx1ZTtcbiAgICB9LCB0cnVlKTtcbiAgICByZXR1cm4gcmV0IHx8IGZhbHNlO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgaWYgKEFwcFN0YXRlLnVzZXIuaXNfYWRtaW4pIHtcbiAgICAgIGVtaXRDaGFuZ2UoeyBsb2FkaW5nOiAncmVzZXQnIH0pO1xuICAgICAgaWYgKEFwcFN0YXRlLmJhZGdlICYmIEFwcFN0YXRlLmJhZGdlLmlkKSB7XG4gICAgICAgIEh1bGwuYXBpKEFwcFN0YXRlLmJhZGdlLmlkLCAnZGVsZXRlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgQXBwU3RhdGUuYmFkZ2UgPSBudWxsO1xuICAgICAgICAgIEh1bGwuYXBpKEFwcFN0YXRlLmZvcm0uaWQgKyAnL3N1Ym1pdCcsICdkZWxldGUnLCBmdW5jdGlvbihmb3JtKSB7XG4gICAgICAgICAgICBBcHBTdGF0ZS5mb3JtID0gZm9ybTtcbiAgICAgICAgICAgIGVtaXRDaGFuZ2UoeyBjaGFuZ2VkOiAncmVzZXQnIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oXCJFcnJvcjogXCIsIGVycik7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZW1pdENoYW5nZSh7IGNoYW5nZWQ6ICdyZXNldCcgfSk7XG4gICAgICAgIHRocm93IFwiW0luc3RhbnRXaW5dIE5vIGJhZGdlIGZvdW5kIGhlcmUuLi5cIjtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgXCJbSW5zdGFudFdpbl0gWW91IG5lZWQgdG8gYmUgYSBhZG1pbmlzdHJhdG9yIHRvIHJlc2V0IGJhZGdlc1wiO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG9uQXV0aEV2ZW50KCkge1xuICAgIGVtaXRDaGFuZ2UoeyBjaGFuZ2VkOiAnbG9hZGluZycsIGxvYWRpbmc6ICdzaGlwJyB9KTtcbiAgICBIdWxsLmFwaShTaGlwLmlkLCB7IGZpZWxkczogJ2JhZGdlJyB9KS50aGVuKGZ1bmN0aW9uKHNoaXApIHtcbiAgICAgIGluaXRTdGF0ZShIdWxsLmN1cnJlbnRVc2VyKCksIHNoaXApO1xuICAgICAgaWYgKGF1dG9QbGF5ICYmIHVzZXJDYW5QbGF5KCkpIHBsYXkoKTtcbiAgICAgIGF1dG9QbGF5ID0gZmFsc2U7XG4gICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgfSk7XG4gIH1cblxuICBIdWxsLm9uKCdodWxsLmF1dGgubG9naW4nLCAgb25BdXRoRXZlbnQpO1xuICBIdWxsLm9uKCdodWxsLmF1dGgubG9nb3V0Jywgb25BdXRoRXZlbnQpO1xuXG4gIHZhciBfbGlzdGVuZXJzID0gW107XG5cbiAgLy8gUHVibGljIEFQSVxuXG4gIHRoaXMub25DaGFuZ2UgPSBmdW5jdGlvbihjYikge1xuICAgIHZhciBjYWxsYmFjayA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBjYi5hcHBseSh1bmRlZmluZWQsIGFyZ3MpO1xuICAgICAgfSlcbiAgICB9O1xuICAgIF9saXN0ZW5lcnMucHVzaChjYWxsYmFjayk7XG4gICAgSHVsbC5vbihDSEFOR0VfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfTtcblxuICB0aGlzLnRlYXJkb3duID0gZnVuY3Rpb24oKSB7XG4gICAgSHVsbC5vZmYoJ2h1bGwuYXV0aC5sb2dpbicsICBvbkF1dGhFdmVudCk7XG4gICAgSHVsbC5vZmYoJ2h1bGwuYXV0aC5sb2dvdXQnLCBvbkF1dGhFdmVudCk7XG4gICAgZm9yICh2YXIgbD0wOyBsIDwgX2xpc3RlbmVycy5sZW5ndGg7IGwrKykge1xuICAgICAgSHVsbC5vZmYoQ0hBTkdFX0VWRU5ULCBsaXN0ZW5lcnNbbF0pO1xuICAgIH1cbiAgfTtcblxuICB0aGlzLmdldFN0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGdldEFwcFN0YXRlKCk7XG4gIH07XG5cbiAgdGhpcy5wbGF5ICAgICAgICAgPSBwbGF5O1xuICB0aGlzLnJlc2V0ICAgICAgICA9IHJlc2V0O1xuICB0aGlzLnN1Ym1pdEZvcm0gICA9IHN1Ym1pdEZvcm07XG5cbiAgaWYgKFNoaXApIHtcbiAgICBpbml0U3RhdGUoQ3VycmVudFVzZXIsIFNoaXApO1xuICB9XG5cbn07XG5cblxuSW5zdGFudFdpbi5TdGVwcyA9IFN0ZXBzO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEluc3RhbnRXaW47XG4iLCJhbmd1bGFyLm1vZHVsZSgnc2NoZW1hRm9ybScpLmNvbmZpZyhcblsnc2NoZW1hRm9ybVByb3ZpZGVyJywgJ3NjaGVtYUZvcm1EZWNvcmF0b3JzUHJvdmlkZXInLCAnc2ZQYXRoUHJvdmlkZXInLFxuICBmdW5jdGlvbihzY2hlbWFGb3JtUHJvdmlkZXIsICBzY2hlbWFGb3JtRGVjb3JhdG9yc1Byb3ZpZGVyLCBzZlBhdGhQcm92aWRlcikge1xuXG4gICAgdmFyIGRhdGVwaWNrZXIgPSBmdW5jdGlvbihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpIHtcbiAgICAgIGlmIChzY2hlbWEudHlwZSA9PT0gJ3N0cmluZycgJiYgKHNjaGVtYS5mb3JtYXQgPT09ICdkYXRlJyB8fCBzY2hlbWEuZm9ybWF0ID09PSAnZGF0ZS10aW1lJykpIHtcbiAgICAgICAgdmFyIGYgPSBzY2hlbWFGb3JtUHJvdmlkZXIuc3RkRm9ybU9iaihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpO1xuICAgICAgICBmLmtleSAgPSBvcHRpb25zLnBhdGg7XG4gICAgICAgIGYudHlwZSA9ICdkYXRlcGlja2VyJztcbiAgICAgICAgb3B0aW9ucy5sb29rdXBbc2ZQYXRoUHJvdmlkZXIuc3RyaW5naWZ5KG9wdGlvbnMucGF0aCldID0gZjtcbiAgICAgICAgcmV0dXJuIGY7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHNjaGVtYUZvcm1Qcm92aWRlci5kZWZhdWx0cy5zdHJpbmcudW5zaGlmdChkYXRlcGlja2VyKTtcblxuICAgIC8vQWRkIHRvIHRoZSBGb3VuZGF0aW9uIGRpcmVjdGl2ZVxuICAgIHNjaGVtYUZvcm1EZWNvcmF0b3JzUHJvdmlkZXIuYWRkTWFwcGluZyhcbiAgICAgICdmb3VuZGF0aW9uRGVjb3JhdG9yJyxcbiAgICAgICdkYXRlcGlja2VyJyxcbiAgICAgICdkaXJlY3RpdmVzL2RlY29yYXRvcnMvZm91bmRhdGlvbi9kYXRlcGlja2VyLmh0bWwnXG4gICAgKTtcbiAgICBzY2hlbWFGb3JtRGVjb3JhdG9yc1Byb3ZpZGVyLmNyZWF0ZURpcmVjdGl2ZShcbiAgICAgICdkYXRlcGlja2VyJyxcbiAgICAgICdkaXJlY3RpdmVzL2RlY29yYXRvcnMvZm91bmRhdGlvbi9kYXRlcGlja2VyLmh0bWwnXG4gICAgKTtcbiAgfVxuXSk7XG4iLCJyZXF1aXJlKCcuL2ZvdW5kYXRpb24tZGVjb3JhdG9yLWRhdGVwaWNrZXInKTtcbmFuZ3VsYXIubW9kdWxlKCdzY2hlbWFGb3JtJykuY29uZmlnKFsnc2NoZW1hRm9ybURlY29yYXRvcnNQcm92aWRlcicsIGZ1bmN0aW9uKGRlY29yYXRvcnNQcm92aWRlcikge1xuICB2YXIgYmFzZSA9ICdkaXJlY3RpdmVzL2RlY29yYXRvcnMvZm91bmRhdGlvbi8nO1xuXG4gIGRlY29yYXRvcnNQcm92aWRlci5jcmVhdGVEZWNvcmF0b3IoJ2ZvdW5kYXRpb25EZWNvcmF0b3InLCB7XG4gICAgdGV4dGFyZWE6IGJhc2UgKyAndGV4dGFyZWEuaHRtbCcsXG4gICAgZmllbGRzZXQ6IGJhc2UgKyAnZmllbGRzZXQuaHRtbCcsXG4gICAgYXJyYXk6IGJhc2UgKyAnYXJyYXkuaHRtbCcsXG4gICAgdGFiYXJyYXk6IGJhc2UgKyAndGFiYXJyYXkuaHRtbCcsXG4gICAgdGFiczogYmFzZSArICd0YWJzLmh0bWwnLFxuICAgIHNlY3Rpb246IGJhc2UgKyAnc2VjdGlvbi5odG1sJyxcbiAgICBjb25kaXRpb25hbDogYmFzZSArICdzZWN0aW9uLmh0bWwnLFxuICAgIGFjdGlvbnM6IGJhc2UgKyAnYWN0aW9ucy5odG1sJyxcbiAgICBkYXRlcGlja2VyOiBiYXNlICsgJ2RhdGVwaWNrZXIuaHRtbCcsXG4gICAgc2VsZWN0OiBiYXNlICsgJ3NlbGVjdC5odG1sJyxcbiAgICBjaGVja2JveDogYmFzZSArICdjaGVja2JveC5odG1sJyxcbiAgICBjaGVja2JveGVzOiBiYXNlICsgJ2NoZWNrYm94ZXMuaHRtbCcsXG4gICAgbnVtYmVyOiBiYXNlICsgJ2RlZmF1bHQuaHRtbCcsXG4gICAgcGFzc3dvcmQ6IGJhc2UgKyAnZGVmYXVsdC5odG1sJyxcbiAgICBzdWJtaXQ6IGJhc2UgKyAnc3VibWl0Lmh0bWwnLFxuICAgIGJ1dHRvbjogYmFzZSArICdzdWJtaXQuaHRtbCcsXG4gICAgcmFkaW9zOiBiYXNlICsgJ3JhZGlvcy5odG1sJyxcbiAgICAncmFkaW9zLWlubGluZSc6IGJhc2UgKyAncmFkaW9zLWlubGluZS5odG1sJyxcbiAgICByYWRpb2J1dHRvbnM6IGJhc2UgKyAncmFkaW8tYnV0dG9ucy5odG1sJyxcbiAgICBoZWxwOiBiYXNlICsgJ2hlbHAuaHRtbCcsXG4gICAgJ2RlZmF1bHQnOiBiYXNlICsgJ2RlZmF1bHQuaHRtbCdcbiAgfSwgW1xuICAgIGZ1bmN0aW9uKGZvcm0pIHtcbiAgICAgIGlmIChmb3JtLnJlYWRvbmx5ICYmIGZvcm0ua2V5ICYmIGZvcm0udHlwZSAhPT0gJ2ZpZWxkc2V0Jykge1xuICAgICAgICByZXR1cm4gYmFzZSArICdyZWFkb25seS5odG1sJztcbiAgICAgIH1cbiAgICB9XG4gIF0sIHsgY2xhc3NOYW1lOiBcInJvd1wiIH0pO1xuXG4gIC8vbWFudWFsIHVzZSBkaXJlY3RpdmVzXG4gIGRlY29yYXRvcnNQcm92aWRlci5jcmVhdGVEaXJlY3RpdmVzKHtcbiAgICB0ZXh0YXJlYTogYmFzZSArICd0ZXh0YXJlYS5odG1sJyxcbiAgICBzZWxlY3Q6IGJhc2UgKyAnc2VsZWN0Lmh0bWwnLFxuICAgIGNoZWNrYm94OiBiYXNlICsgJ2NoZWNrYm94Lmh0bWwnLFxuICAgIGNoZWNrYm94ZXM6IGJhc2UgKyAnY2hlY2tib3hlcy5odG1sJyxcbiAgICBudW1iZXI6IGJhc2UgKyAnZGVmYXVsdC5odG1sJyxcbiAgICBzdWJtaXQ6IGJhc2UgKyAnc3VibWl0Lmh0bWwnLFxuICAgIGJ1dHRvbjogYmFzZSArICdzdWJtaXQuaHRtbCcsXG4gICAgdGV4dDogYmFzZSArICdkZWZhdWx0Lmh0bWwnLFxuICAgIGRhdGU6IGJhc2UgKyAnZGVmYXVsdC5odG1sJyxcbiAgICBwYXNzd29yZDogYmFzZSArICdkZWZhdWx0Lmh0bWwnLFxuICAgIGRhdGVwaWNrZXI6IGJhc2UgKyAnZGF0ZXBpY2tlci5odG1sJyxcbiAgICBpbnB1dDogYmFzZSArICdkZWZhdWx0Lmh0bWwnLFxuICAgIHJhZGlvczogYmFzZSArICdyYWRpb3MuaHRtbCcsXG4gICAgJ3JhZGlvcy1pbmxpbmUnOiBiYXNlICsgJ3JhZGlvcy1pbmxpbmUuaHRtbCcsXG4gICAgcmFkaW9idXR0b25zOiBiYXNlICsgJ3JhZGlvLWJ1dHRvbnMuaHRtbCcsXG4gIH0pO1xuXG59XSkuZGlyZWN0aXZlKCdzZkZpZWxkc2V0JywgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7XG4gICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICBzY29wZTogdHJ1ZSxcbiAgICB0ZW1wbGF0ZVVybDogJ2RpcmVjdGl2ZXMvZGVjb3JhdG9ycy9mb3VuZGF0aW9uL2ZpZWxkc2V0LXRyY2wuaHRtbCcsXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICBzY29wZS50aXRsZSA9IHNjb3BlLiRldmFsKGF0dHJzLnRpdGxlKTtcbiAgICB9XG4gIH07XG59KTtcbiIsImZ1bmN0aW9uIGlzT2JqZWN0KG9iaikge1xuICB2YXIgdHlwZSA9IHR5cGVvZiBvYmo7XG4gIHJldHVybiB0eXBlID09PSAnZnVuY3Rpb24nIHx8IHR5cGUgPT09ICdvYmplY3QnICYmICEhb2JqO1xufTtcblxuXG4gZnVuY3Rpb24gZXh0ZW5kKG9iaikge1xuICBpZiAoIWlzT2JqZWN0KG9iaikpIHJldHVybiBvYmo7XG4gIHZhciBzb3VyY2UsIHByb3A7XG4gIGZvciAodmFyIGkgPSAxLCBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBzb3VyY2UgPSBhcmd1bWVudHNbaV07XG4gICAgZm9yIChwcm9wIGluIHNvdXJjZSkge1xuICAgICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBwcm9wKSkge1xuICAgICAgICAgIG9ialtwcm9wXSA9IHNvdXJjZVtwcm9wXTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG9iajtcbn07XG5cbmZ1bmN0aW9uIG9taXQob2JqIC8qIGtleXMgKi8pIHtcbiAgdmFyIHdpdGhvdXRLZXlzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICByZXR1cm4gb2JqICYmIE9iamVjdC5rZXlzKG9iaikucmVkdWNlKGZ1bmN0aW9uKHMsIGspIHtcbiAgICBpZiAod2l0aG91dEtleXMuaW5kZXhPZihrKSA9PT0gLTEpIHNba10gPSBvYmpba11cbiAgICByZXR1cm4gcztcbiAgfSwge30pO1xufTtcblxuZnVuY3Rpb24gZGVlcENsb25lKG9iaikge1xuICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvYmopKTtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZXh0ZW5kOiBleHRlbmQsXG4gIG9taXQ6IG9taXQsXG4gIGlzT2JqZWN0OiBpc09iamVjdCxcbiAgZGVlcENsb25lOiBkZWVwQ2xvbmVcbn07XG4iXX0=
