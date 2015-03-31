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
require('angular-datepicker/build/angular-datepicker');
require('angular-translate');

var app = angular.module('hull-instant', ['ngAnimate', 'schemaForm', 'angular-datepicker', 'pascalprecht.translate'])

.config(["$translateProvider", function ($translateProvider) {
  $translateProvider.useLoader("$translateShipLoader");
  $translateProvider.preferredLanguage("en");
}])

.factory("$instant", ["$hullInit", function($hullInit) {
  var instant = new InstantWin($hullInit.user, $hullInit.ship);
  window.$instant = instant;
  return instant;
}])

.factory("$translateShipLoader", ["$q", "$instant", function ($q, $instant) {
  return function (options) {
    var deferred = $q.defer();
    deferred.resolve($instant.translate(options.key));
    return deferred.promise;
  };
}])

.factory('$hullConfig', ['$hullInit', function($hullInit) {
  function getAuthServices() {
    var auth = Hull.config('services').auth || {};
    return Object.keys(auth).filter(function(s) { return s !== 'hull'; });
  }

  return {
    getAuthServices: getAuthServices
  };
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

.directive("spinner", function(){
  return {
    restrict: "EA",
    scope: { spinning: "=" },
    templateUrl: "directives/spinner.html"
  };
})

.filter('capitalize', function() {
  return function(input, all) {
    return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){ return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); }) : '';
  }
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
    { "type": "submit", "title": "Save" }
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

.controller('InstantWinController',['$scope', '$instant', '$translate', '$hullConfig',
  function InstantWinController($scope, $instant, $translate, $hullConfig) {
    $scope.styles = {};
    $scope.login = Hull.login;
    $scope.logout = Hull.logout;
    $scope.play = $instant.play;

    $scope.steps = Steps;
    $scope.$instant = $instant;
    $scope.instant = $instant.getState();
    $scope.authServices = $hullConfig.getAuthServices();

    function setStyles(settings) {
      var styles = {};
      angular.forEach(settings.images, function(img, target) {
        if (img) {
          styles[target] = styles[target] || {};
          styles[target].backgroundImage = 'url(' + img + ')';
        }
      });
      $scope.styles = styles;
    }

    setStyles($scope.instant.settings);

    function onChange(instant) {
      $scope.$apply(function() {
        $scope.instant = instant;
        setStyles(instant.settings);
        $translate.refresh();
      });
    }

    $instant.onChange(onChange);
  }
]);

Hull.onEmbed(document, function(element, deployment) {
  app.value('$hullInit', {
    user: Hull.currentUser(),
    ship: deployment.ship
  });

  angular.bootstrap(element, ['hull-instant']);
});


},{"./instant":"/Users/Jimmy/code/hull/hull-instant/src/javascript/instant.js","./schema-form/foundation-decorator":"/Users/Jimmy/code/hull/hull-instant/src/javascript/schema-form/foundation-decorator.js","./schema-form/foundation-decorator-datepicker":"/Users/Jimmy/code/hull/hull-instant/src/javascript/schema-form/foundation-decorator-datepicker.js","angular-datepicker/build/angular-datepicker":"/Users/Jimmy/code/hull/hull-instant/node_modules/angular-datepicker/build/angular-datepicker.js","angular-schema-form/dist/schema-form":"/Users/Jimmy/code/hull/hull-instant/node_modules/angular-schema-form/dist/schema-form.js","angular-translate":"/Users/Jimmy/code/hull/hull-instant/node_modules/angular-translate/dist/angular-translate.js","objectpath":"/Users/Jimmy/code/hull/hull-instant/node_modules/objectpath/index.js","tv4":"/Users/Jimmy/code/hull/hull-instant/node_modules/tv4/tv4.js"}],"/Users/Jimmy/code/hull/hull-instant/node_modules/angular-datepicker/build/angular-datepicker.js":[function(require,module,exports){
/*!
 * pickadate.js v3.4.0, 2014/02/15
 * By Amsul, http://amsul.ca
 * Hosted on http://amsul.github.io/pickadate.js
 * Licensed under MIT
 */
!function(a){"function"==typeof define&&define.amd?define("picker",["angular"],a):this.Picker=a(angular)}(function(a){function b(a,d,e,g){function h(){return b._.node("div",b._.node("div",b._.node("div",b._.node("div",r.component.nodes(o.open),n.box),n.wrap),n.frame),n.holder)}function i(){p.data(d,r),p.addClass(n.input),p[0].value=p.attr("data-value")?r.get("select",m.format):a.value,angular.element(document.querySelectorAll("#"+o.id)).on("focus",l),angular.element(document.querySelectorAll("#"+o.id)).on("click",l),m.editable||angular.element(document.querySelectorAll("#"+o.id)).on("keydown",function(a){var b=a.keyCode,c=/^(8|46)$/.test(b);return 27==b?(r.close(),!1):void((32==b||c||!o.open&&r.component.key[b])&&(a.preventDefault(),a.stopPropagation(),c?r.clear().close():r.open()))}),c(a,{haspopup:!0,expanded:!1,readonly:!1,owns:a.id+"_root"+(r._hidden?" "+r._hidden.id:"")})}function j(){function d(){angular.element(r.$root[0].querySelectorAll("[data-pick], [data-nav], [data-clear]")).on("click",function(){var c=angular.element(this),e=c.hasClass(n.navDisabled)||c.hasClass(n.disabled),f=document.activeElement;f=f&&(f.type||f.href)&&f,(e||f&&!r.$root[0].contains(f))&&a.focus(),c.attr("data-nav")&&!e?(r.set("highlight",r.component.item.highlight,{nav:parseInt(c.attr("data-nav"))}),d()):b._.isInteger(parseInt(c.attr("data-pick")))&&!e?(r.set("select",parseInt(c.attr("data-pick"))).close(!0),d()):c.attr("data-clear")&&(r.clear().close(!0),d())})}r.$root.on("focusin",function(a){r.$root.removeClass(n.focused),c(r.$root[0],"selected",!1),a.stopPropagation()}),r.$root.on("mousedown click",function(b){var c=b.target;c!=r.$root.children()[0]&&(b.stopPropagation(),"mousedown"==b.type&&"input"!==angular.element(c)[0].tagName&&"OPTION"!=c.nodeName&&(b.preventDefault(),a.focus()))}),d(),c(r.$root[0],"hidden",!0)}function k(){var b=["string"==typeof m.hiddenPrefix?m.hiddenPrefix:"","string"==typeof m.hiddenSuffix?m.hiddenSuffix:"_submit"];r._hidden=angular.element('<input type=hidden name="'+b[0]+a.name+b[1]+'"id="'+b[0]+a.id+b[1]+'"'+(p.attr("data-value")||a.value?' value="'+r.get("select",m.formatSubmit)+'"':"")+">")[0],p.on("change."+o.id,function(){r._hidden.value=a.value?r.get("select",m.formatSubmit):""}).after(r._hidden)}function l(a){a.stopPropagation(),"focus"==a.type&&(r.$root.addClass(n.focused),c(r.$root[0],"selected",!0)),r.open()}if(!a)return b;var m;e?(m=e.defaults,angular.extend(m,g)):m=g||{};var n=b.klasses();angular.extend(n,m.klass);var o={id:a.id||"P"+Math.abs(~~(Math.random()*new Date))},p=angular.element(a),q=function(){return this.start()},r=q.prototype={constructor:q,$node:p,start:function(){return o&&o.start?r:(o.methods={},o.start=!0,o.open=!1,o.type=a.type,a.autofocus=a==document.activeElement,a.type="text",a.readOnly=!m.editable,a.id=a.id||o.id,r.component=new e(r,m),r.$root=angular.element(b._.node("div",h(),n.picker,'id="'+a.id+'_root"')),j(),m.formatSubmit&&k(),i(),m.container?angular.element(m.container).append(r.$root):p.after(r.$root),r.on({start:r.component.onStart,render:r.component.onRender,stop:r.component.onStop,open:r.component.onOpen,close:r.component.onClose,set:r.component.onSet}).on({start:m.onStart,render:m.onRender,stop:m.onStop,open:m.onOpen,close:m.onClose,set:m.onSet}),a.autofocus&&r.open(),r.trigger("start").trigger("render"))},render:function(a){return a?r.$root.html(h()):angular.element(r.$root[0].querySelectorAll("."+n.box)).html(r.component.nodes(o.open)),r.trigger("render")},stop:function(){return o.start?(r.close(),r._hidden&&r._hidden.parentNode.removeChild(r._hidden),r.$root.remove(),p.removeClass(n.input).removeData(d),setTimeout(function(){p.off("."+o.id)},0),a.type=o.type,a.readOnly=!1,r.trigger("stop"),o.methods={},o.start=!1,r):r},open:function(d){return o.open?r:(p.addClass(n.active),c(a,"expanded",!0),r.$root.addClass(n.opened),c(r.$root[0],"hidden",!1),d!==!1&&(o.open=!0,p.triggerHandler("focus"),angular.element(document.querySelectorAll("#"+o.id)).on("click focusin",function(b){var c=b.target;c!=a&&c!=document&&3!=b.which&&r.close(c===r.$root.children()[0])}),angular.element(document.querySelectorAll("#"+o.id)).on("keydown",function(c){var d=c.keyCode,e=r.component.key[d],f=c.target;27==d?r.close(!0):f!=a||!e&&13!=d?r.$root[0].contains(f)&&13==d&&(c.preventDefault(),f.click()):(c.preventDefault(),e?b._.trigger(r.component.key.go,r,[b._.trigger(e)]):angular.element(r.$root[0].querySelectorAll("."+n.highlighted)).hasClass(n.disabled)||r.set("select",r.component.item.highlight).close())})),r.trigger("open"))},close:function(b){return b&&(p.off("focus."+o.id),p.triggerHandler("focus"),setTimeout(function(){angular.element(document.querySelectorAll("#"+o.id)).on("focus",l)},0)),p.removeClass(n.active),c(a,"expanded",!1),r.$root.removeClass(n.opened+" "+n.focused),c(r.$root[0],"hidden",!0),c(r.$root[0],"selected",!1),o.open?(setTimeout(function(){o.open=!1},1e3),f.off("."+o.id),r.trigger("close")):r},clear:function(){return r.set("clear")},set:function(a,b,c){var d,e,f=angular.isObject(a),g=f?a:{};if(c=f&&angular.isObject(b)?b:c||{},a){f||(g[a]=b);for(d in g)e=g[d],d in r.component.item&&r.component.set(d,e,c),("select"==d||"clear"==d)&&(p[0].value="clear"==d?"":r.get(d,m.format),p.triggerHandler("change"));r.render()}return c.muted?r:r.trigger("set",g)},get:function(c,d){return c=c||"value",null!=o[c]?o[c]:"value"==c?a.value:c in r.component.item?"string"==typeof d?b._.trigger(r.component.formats.toString,r.component,[d,r.component.get(c)]):r.component.get(c):void 0},on:function(a,b){var c,d,e=angular.isObject(a),f=e?a:{};if(a){e||(f[a]=b);for(c in f)d=f[c],o.methods[c]=o.methods[c]||[],o.methods[c].push(d)}return r},off:function(){var a,b,c=arguments;for(a=0,namesCount=c.length;namesCount>a;a+=1)b=c[a],b in o.methods&&delete o.methods[b];return r},trigger:function(a,c){var d=o.methods[a];return d&&d.map(function(a){b._.trigger(a,r,[c])}),r}};return new q}function c(a,b,c){if(angular.isObject(b))for(var e in b)d(a,e,b[e]);else d(a,b,c)}function d(a,b,c){angular.element(a).attr(("role"==b?"":"aria-")+b,c)}function e(a,b){angular.isObject(a)||(a={attribute:b}),b="";for(var c in a){var d=("role"==c?"":"aria-")+c,e=a[c];b+=null==e?"":d+'="'+a[c]+'"'}return b}var f=angular.element(document);return b.klasses=function(a){return a=a||"picker",{picker:a,opened:a+"--opened",focused:a+"--focused",input:a+"__input",active:a+"__input--active",holder:a+"__holder",frame:a+"__frame",wrap:a+"__wrap",box:a+"__box"}},b._={group:function(a){for(var c,d="",e=b._.trigger(a.min,a);e<=b._.trigger(a.max,a,[e]);e+=a.i)c=b._.trigger(a.item,a,[e]),d+=b._.node(a.node,c[0],c[1],c[2]);return d},node:function(b,c,d,e){return c?(c=a.isArray(c)?c.join(""):c,d=d?' class="'+d+'"':"",e=e?" "+e:"","<"+b+d+e+">"+c+"</"+b+">"):""},lead:function(a){return(10>a?"0":"")+a},trigger:function(a,b,c){return"function"==typeof a?a.apply(b,c||[]):a},digits:function(a){return/\d/.test(a[1])?2:1},isDate:function(a){return{}.toString.call(a).indexOf("Date")>-1&&this.isInteger(a.getDate())},isInteger:function(a){return{}.toString.call(a).indexOf("Number")>-1&&a%1===0},ariaAttr:e},b.extend=function(a,c){angular.element.prototype[a]=function(d,e){var f=this.data(a);if("picker"==d)return f;if(f&&"string"==typeof d)return b._.trigger(f[d],f,[e]),this;for(var g=0;g<this.length;g++){var h=angular.element(this[g]);h.data(a)||new b(h[0],a,c,d)}},angular.element.prototype[a].defaults=c.defaults},b});
/*!
 * Date picker for pickadate.js v3.4.0
 * http://amsul.github.io/pickadate.js/date.htm
 */
!function(a){"function"==typeof define&&define.amd?define(["picker","angular"],a):a(Picker,angular)}(function(a,b){function c(a,c){var d=this,e=a.$node[0].value,f=a.$node.attr("data-value"),g=f||e,h=f?c.formatSubmit:c.format,i=function(){return"rtl"===getComputedStyle(a.$root[0]).direction};d.settings=c,d.$node=a.$node,d.queue={min:"measure create",max:"measure create",now:"now create",select:"parse create validate",highlight:"parse navigate create validate",view:"parse create validate viewset",disable:"deactivate",enable:"activate"},d.item={},d.item.disable=(c.disable||[]).slice(0),d.item.enable=-function(a){return a[0]===!0?a.shift():-1}(d.item.disable),d.set("min",c.min).set("max",c.max).set("now"),g?d.set("select",g,{format:h,fromValue:!!e}):d.set("select",null).set("highlight",d.item.now),d.key={40:7,38:-7,39:function(){return i()?-1:1},37:function(){return i()?1:-1},go:function(a){var b=d.item.highlight,c=new Date(b.year,b.month,b.date+a);d.set("highlight",[c.getFullYear(),c.getMonth(),c.getDate()],{interval:a}),this.render()}},a.on("render",function(){b.element(a.$root[0].querySelectorAll("."+c.klass.selectMonth)).on("change",function(){var d=this.value;d&&(a.set("highlight",[a.get("view").year,d,a.get("highlight").date]),b.element(a.$root[0].querySelectorAll("."+c.klass.selectMonth)).triggerHandler("focus"))}),b.element(a.$root[0].querySelectorAll("."+c.klass.selectYear)).on("change",function(){var d=this.value;d&&(a.set("highlight",[d,a.get("view").month,a.get("highlight").date]),b.element(a.$root[0].querySelectorAll("."+c.klass.selectYear)).triggerHandler("focus"))})}).on("open",function(){b.element(a.$root[0].querySelectorAll("button, select")).attr("disabled",!1)}).on("close",function(){b.element(a.$root[0].querySelectorAll("button, select")).attr("disabled",!0)})}var d=7,e=6,f=a._;c.prototype.set=function(a,b,c){var d=this,e=d.item;return null===b?(e[a]=b,d):(e["enable"==a?"disable":"flip"==a?"enable":a]=d.queue[a].split(" ").map(function(e){return b=d[e](a,b,c)}).pop(),"select"==a?d.set("highlight",e.select,c):"highlight"==a?d.set("view",e.highlight,c):a.match(/^(flip|min|max|disable|enable)$/)&&(e.select&&d.disabled(e.select)&&d.set("select",e.select,c),e.highlight&&d.disabled(e.highlight)&&d.set("highlight",e.highlight,c)),d)},c.prototype.get=function(a){return this.item[a]},c.prototype.create=function(a,c,d){var e,g=this;return c=void 0===c?a:c,c==-1/0||1/0==c?e=c:b.isObject(c)&&f.isInteger(c.pick)?c=c.obj:b.isArray(c)?(c=new Date(c[0],c[1],c[2]),c=f.isDate(c)?c:g.create().obj):c=f.isInteger(c)||f.isDate(c)?g.normalize(new Date(c),d):g.now(a,c,d),{year:e||c.getFullYear(),month:e||c.getMonth(),date:e||c.getDate(),day:e||c.getDay(),obj:e||c,pick:e||c.getTime()}},c.prototype.createRange=function(a,c){var d=this,e=function(a){return a===!0||b.isArray(a)||f.isDate(a)?d.create(a):a};return f.isInteger(a)||(a=e(a)),f.isInteger(c)||(c=e(c)),f.isInteger(a)&&b.isObject(c)?a=[c.year,c.month,c.date+a]:f.isInteger(c)&&b.isObject(a)&&(c=[a.year,a.month,a.date+c]),{from:e(a),to:e(c)}},c.prototype.withinRange=function(a,b){return a=this.createRange(a.from,a.to),b.pick>=a.from.pick&&b.pick<=a.to.pick},c.prototype.overlapRanges=function(a,b){var c=this;return a=c.createRange(a.from,a.to),b=c.createRange(b.from,b.to),c.withinRange(a,b.from)||c.withinRange(a,b.to)||c.withinRange(b,a.from)||c.withinRange(b,a.to)},c.prototype.now=function(a,b,c){return b=new Date,c&&c.rel&&b.setDate(b.getDate()+c.rel),this.normalize(b,c)},c.prototype.navigate=function(a,c,d){var e,f,g,h,i=b.isArray(c),j=b.isObject(c),k=this.item.view;if(i||j){for(j?(f=c.year,g=c.month,h=c.date):(f=+c[0],g=+c[1],h=+c[2]),d&&d.nav&&k&&k.month!==g&&(f=k.year,g=k.month),e=new Date(f,g+(d&&d.nav?d.nav:0),1),f=e.getFullYear(),g=e.getMonth();new Date(f,g,h).getMonth()!==g;)h-=1;c=[f,g,h]}return c},c.prototype.normalize=function(a){return a.setHours(0,0,0,0),a},c.prototype.measure=function(a,b){var c=this;return b?f.isInteger(b)&&(b=c.now(a,b,{rel:b})):b="min"==a?-1/0:1/0,b},c.prototype.viewset=function(a,b){return this.create([b.year,b.month,1])},c.prototype.validate=function(a,c,d){var e,g,h,i,j=this,k=c,l=d&&d.interval?d.interval:1,m=-1===j.item.enable,n=j.item.min,o=j.item.max,p=m&&j.item.disable.filter(function(a){if(b.isArray(a)){var d=j.create(a).pick;d<c.pick?e=!0:d>c.pick&&(g=!0)}return f.isInteger(a)}).length;if((!d||!d.nav)&&(!m&&j.disabled(c)||m&&j.disabled(c)&&(p||e||g)||!m&&(c.pick<=n.pick||c.pick>=o.pick)))for(m&&!p&&(!g&&l>0||!e&&0>l)&&(l*=-1);j.disabled(c)&&(Math.abs(l)>1&&(c.month<k.month||c.month>k.month)&&(c=k,l=l>0?1:-1),c.pick<=n.pick?(h=!0,l=1,c=j.create([n.year,n.month,n.date-1])):c.pick>=o.pick&&(i=!0,l=-1,c=j.create([o.year,o.month,o.date+1])),!h||!i);)c=j.create([c.year,c.month,c.date+l]);return c},c.prototype.disabled=function(a){var c=this,d=c.item.disable.filter(function(d){return f.isInteger(d)?a.day===(c.settings.firstDay?d:d-1)%7:b.isArray(d)||f.isDate(d)?a.pick===c.create(d).pick:b.isObject(d)?c.withinRange(d,a):void 0});return d=d.length&&!d.filter(function(a){return b.isArray(a)&&"inverted"==a[3]||b.isObject(a)&&a.inverted}).length,-1===c.item.enable?!d:d||a.pick<c.item.min.pick||a.pick>c.item.max.pick},c.prototype.parse=function(a,c,d){var e,g=this,h={};return!c||f.isInteger(c)||b.isArray(c)||f.isDate(c)||b.isObject(c)&&f.isInteger(c.pick)?c:(d&&d.format||(d=d||{},d.format=g.settings.format),e="string"!=typeof c||d.fromValue?0:1,g.formats.toArray(d.format).map(function(a){var b=g.formats[a],d=b?f.trigger(b,g,[c,h]):a.replace(/^!/,"").length;b&&(h[a]=c.substr(0,d)),c=c.substr(d)}),[h.yyyy||h.yy,+(h.mm||h.m)-e,h.dd||h.d])},c.prototype.formats=function(){function a(a,b,c){var d=a.match(/\w+/)[0];return c.mm||c.m||(c.m=b.indexOf(d)),d.length}function b(a){return a.match(/\w+/)[0].length}return{d:function(a,b){return a?f.digits(a):b.date},dd:function(a,b){return a?2:f.lead(b.date)},ddd:function(a,c){return a?b(a):this.settings.weekdaysShort[c.day]},dddd:function(a,c){return a?b(a):this.settings.weekdaysFull[c.day]},m:function(a,b){return a?f.digits(a):b.month+1},mm:function(a,b){return a?2:f.lead(b.month+1)},mmm:function(b,c){var d=this.settings.monthsShort;return b?a(b,d,c):d[c.month]},mmmm:function(b,c){var d=this.settings.monthsFull;return b?a(b,d,c):d[c.month]},yy:function(a,b){return a?2:(""+b.year).slice(2)},yyyy:function(a,b){return a?4:b.year},toArray:function(a){return a.split(/(d{1,4}|m{1,4}|y{4}|yy|!.)/g)},toString:function(a,b){var c=this;return c.formats.toArray(a).map(function(a){return f.trigger(c.formats[a],c,[0,b])||a.replace(/^!/,"")}).join("")}}}(),c.prototype.isDateExact=function(a,c){var d=this;return f.isInteger(a)&&f.isInteger(c)||"boolean"==typeof a&&"boolean"==typeof c?a===c:(f.isDate(a)||b.isArray(a))&&(f.isDate(c)||b.isArray(c))?d.create(a).pick===d.create(c).pick:b.isObject(a)&&b.isObject(c)?d.isDateExact(a.from,c.from)&&d.isDateExact(a.to,c.to):!1},c.prototype.isDateOverlap=function(a,c){var d=this;return f.isInteger(a)&&(f.isDate(c)||b.isArray(c))?a===d.create(c).day+1:f.isInteger(c)&&(f.isDate(a)||b.isArray(a))?c===d.create(a).day+1:b.isObject(a)&&b.isObject(c)?d.overlapRanges(a,c):!1},c.prototype.flipEnable=function(a){var b=this.item;b.enable=a||(-1==b.enable?1:-1)},c.prototype.deactivate=function(a,c){var d=this,e=d.item.disable.slice(0);return"flip"==c?d.flipEnable():c===!1?(d.flipEnable(1),e=[]):c===!0?(d.flipEnable(-1),e=[]):c.map(function(a){for(var c,g=0;g<e.length;g+=1)if(d.isDateExact(a,e[g])){c=!0;break}c||(f.isInteger(a)||f.isDate(a)||b.isArray(a)||b.isObject(a)&&a.from&&a.to)&&e.push(a)}),e},c.prototype.activate=function(a,c){var d=this,e=d.item.disable,g=e.length;return"flip"==c?d.flipEnable():c===!0?(d.flipEnable(1),e=[]):c===!1?(d.flipEnable(-1),e=[]):c.map(function(a){var c,h,i,j;for(i=0;g>i;i+=1){if(h=e[i],d.isDateExact(h,a)){c=e[i]=null,j=!0;break}if(d.isDateOverlap(h,a)){b.isObject(a)?(a.inverted=!0,c=a):b.isArray(a)?(c=a,c[3]||c.push("inverted")):f.isDate(a)&&(c=[a.getFullYear(),a.getMonth(),a.getDate(),"inverted"]);break}}if(c)for(i=0;g>i;i+=1)if(d.isDateExact(e[i],a)){e[i]=null;break}if(j)for(i=0;g>i;i+=1)if(d.isDateOverlap(e[i],a)){e[i]=null;break}c&&e.push(c)}),e.filter(function(a){return null!=a})},c.prototype.nodes=function(a){var b=this,c=b.settings,g=b.item,h=g.now,i=g.select,j=g.highlight,k=g.view,l=g.disable,m=g.min,n=g.max,o=function(a){return c.firstDay&&a.push(a.shift()),f.node("thead",f.node("tr",f.group({min:0,max:d-1,i:1,node:"th",item:function(b){return[a[b],c.klass.weekdays]}})))}((c.showWeekdaysFull?c.weekdaysFull:c.weekdaysShort).slice(0)),p=function(a){return f.node("div"," ",c.klass["nav"+(a?"Next":"Prev")]+(a&&k.year>=n.year&&k.month>=n.month||!a&&k.year<=m.year&&k.month<=m.month?" "+c.klass.navDisabled:""),"data-nav="+(a||-1))},q=function(b){return c.selectMonths?f.node("select",f.group({min:0,max:11,i:1,node:"option",item:function(a){return[b[a],0,"value="+a+(k.month==a?" selected":"")+(k.year==m.year&&a<m.month||k.year==n.year&&a>n.month?" disabled":"")]}}),c.klass.selectMonth,a?"":"disabled"):f.node("div",b[k.month],c.klass.month)},r=function(){var b=k.year,d=c.selectYears===!0?5:~~(c.selectYears/2);if(d){var e=m.year,g=n.year,h=b-d,i=b+d;if(e>h&&(i+=e-h,h=e),i>g){var j=h-e,l=i-g;h-=j>l?l:j,i=g}return f.node("select",f.group({min:h,max:i,i:1,node:"option",item:function(a){return[a,0,"value="+a+(b==a?" selected":"")]}}),c.klass.selectYear,a?"":"disabled")}return f.node("div",b,c.klass.year)};return f.node("div",p()+p(1)+q(c.showMonthsShort?c.monthsShort:c.monthsFull)+r(),c.klass.header)+f.node("table",o+f.node("tbody",f.group({min:0,max:e-1,i:1,node:"tr",item:function(a){var e=c.firstDay&&0===b.create([k.year,k.month,1]).day?-7:0;return[f.group({min:d*a-k.day+e+1,max:function(){return this.min+d-1},i:1,node:"td",item:function(a){a=b.create([k.year,k.month,a+(c.firstDay?1:0)]);var d=i&&i.pick==a.pick,e=j&&j.pick==a.pick,g=l&&b.disabled(a)||a.pick<m.pick||a.pick>n.pick;return[f.node("div",a.date,function(b){return b.push(k.month==a.month?c.klass.infocus:c.klass.outfocus),h.pick==a.pick&&b.push(c.klass.now),d&&b.push(c.klass.selected),e&&b.push(c.klass.highlighted),g&&b.push(c.klass.disabled),b.join(" ")}([c.klass.day]),"data-pick="+a.pick+" "+f.ariaAttr({role:"button",controls:b.$node[0].id,checked:d&&b.$node[0].value===f.trigger(b.formats.toString,b,[c.format,a])?!0:null,activedescendant:e?!0:null,disabled:g?!0:null}))]}})]}})),c.klass.table)+f.node("div",f.node("button",c.today,c.klass.buttonToday,"type=button data-pick="+h.pick+(a?"":" disabled"))+f.node("button",c.clear,c.klass.buttonClear,"type=button data-clear=1"+(a?"":" disabled")),c.klass.footer)},c.defaults=function(a){return{monthsFull:["January","February","March","April","May","June","July","August","September","October","November","December"],monthsShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],weekdaysFull:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],weekdaysShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],today:"Today",clear:"Clear",format:"d mmmm, yyyy",klass:{table:a+"table",header:a+"header",navPrev:a+"nav--prev",navNext:a+"nav--next",navDisabled:a+"nav--disabled",month:a+"month",year:a+"year",selectMonth:a+"select--month",selectYear:a+"select--year",weekdays:a+"weekday",day:a+"day",disabled:a+"day--disabled",selected:a+"day--selected",highlighted:a+"day--highlighted",now:a+"day--today",infocus:a+"day--infocus",outfocus:a+"day--outfocus",footer:a+"footer",buttonClear:a+"button--clear",buttonToday:a+"button--today"}}}(a.klasses().picker+"__"),a.extend("pickadate",c)});
/*!
 * Time picker for pickadate.js v3.4.0
 * http://amsul.github.io/pickadate.js/time.htm
 */
!function(a){"function"==typeof define&&define.amd?define(["picker","angular"],a):a(Picker,angular)}(function(a,b){function c(a,b){var c=this,d=a.$node[0].value,e=a.$node.data("value"),f=e||d,g=e?b.formatSubmit:b.format;c.settings=b,c.$node=a.$node,c.queue={interval:"i",min:"measure create",max:"measure create",now:"now create",select:"parse create validate",highlight:"parse create validate",view:"parse create validate",disable:"deactivate",enable:"activate"},c.item={},c.item.interval=b.interval||30,c.item.disable=(b.disable||[]).slice(0),c.item.enable=-function(a){return a[0]===!0?a.shift():-1}(c.item.disable),c.set("min",b.min).set("max",b.max).set("now"),f?c.set("select",f,{format:g,fromValue:!!d}):c.set("select",null).set("highlight",c.item.now),c.key={40:1,38:-1,39:1,37:-1,go:function(a){c.set("highlight",c.item.highlight.pick+a*c.item.interval,{interval:a*c.item.interval}),this.render()}},a.on("render",function(){var c=a.$root.children(),d=c.find("."+b.klass.viewset);d.length&&(c[0].scrollTop=~~d.position().top-2*d[0].clientHeight)}).on("open",function(){a.$root.find("button").attr("disable",!1)}).on("close",function(){a.$root.find("button").attr("disable",!0)})}var d=24,e=60,f=12,g=d*e,h=a._;c.prototype.set=function(a,b,c){var d=this,e=d.item;return null===b?(e[a]=b,d):(e["enable"==a?"disable":"flip"==a?"enable":a]=d.queue[a].split(" ").map(function(e){return b=d[e](a,b,c)}).pop(),"select"==a?d.set("highlight",e.select,c):"highlight"==a?d.set("view",e.highlight,c):"interval"==a?d.set("min",e.min,c).set("max",e.max,c):a.match(/^(flip|min|max|disable|enable)$/)&&("min"==a&&d.set("max",e.max,c),e.select&&d.disabled(e.select)&&d.set("select",e.select,c),e.highlight&&d.disabled(e.highlight)&&d.set("highlight",e.highlight,c)),d)},c.prototype.get=function(a){return this.item[a]},c.prototype.create=function(a,c,f){var i=this;return c=void 0===c?a:c,h.isDate(c)&&(c=[c.getHours(),c.getMinutes()]),b.isObject(c)&&h.isInteger(c.pick)?c=c.pick:b.isArray(c)?c=+c[0]*e+ +c[1]:h.isInteger(c)||(c=i.now(a,c,f)),"max"==a&&c<i.item.min.pick&&(c+=g),"min"!=a&&"max"!=a&&(c-i.item.min.pick)%i.item.interval!==0&&(c+=i.item.interval),c=i.normalize(a,c,f),{hour:~~(d+c/e)%d,mins:(e+c%e)%e,time:(g+c)%g,pick:c}},c.prototype.createRange=function(a,c){var d=this,e=function(a){return a===!0||b.isArray(a)||h.isDate(a)?d.create(a):a};return h.isInteger(a)||(a=e(a)),h.isInteger(c)||(c=e(c)),h.isInteger(a)&&b.isObject(c)?a=[c.hour,c.mins+a*d.settings.interval]:h.isInteger(c)&&b.isObject(a)&&(c=[a.hour,a.mins+c*d.settings.interval]),{from:e(a),to:e(c)}},c.prototype.withinRange=function(a,b){return a=this.createRange(a.from,a.to),b.pick>=a.from.pick&&b.pick<=a.to.pick},c.prototype.overlapRanges=function(a,b){var c=this;return a=c.createRange(a.from,a.to),b=c.createRange(b.from,b.to),c.withinRange(a,b.from)||c.withinRange(a,b.to)||c.withinRange(b,a.from)||c.withinRange(b,a.to)},c.prototype.now=function(a,b){var c,d=this.item.interval,f=new Date,g=f.getHours()*e+f.getMinutes(),i=h.isInteger(b);return g-=g%d,c=0>b&&-d>=d*b+g,g+="min"==a&&c?0:d,i&&(g+=d*(c&&"max"!=a?b+1:b)),g},c.prototype.normalize=function(a,b){var c=this.item.interval,d=this.item.min&&this.item.min.pick||0;return b-="min"==a?0:(b-d)%c},c.prototype.measure=function(a,c,f){var g=this;return c?c===!0||h.isInteger(c)?c=g.now(a,c,f):b.isObject(c)&&h.isInteger(c.pick)&&(c=g.normalize(a,c.pick,f)):c="min"==a?[0,0]:[d-1,e-1],c},c.prototype.validate=function(a,b,c){var d=this,e=c&&c.interval?c.interval:d.item.interval;return d.disabled(b)&&(b=d.shift(b,e)),b=d.scope(b),d.disabled(b)&&(b=d.shift(b,-1*e)),b},c.prototype.disabled=function(a){var c=this,d=c.item.disable.filter(function(d){return h.isInteger(d)?a.hour==d:b.isArray(d)||h.isDate(d)?a.pick==c.create(d).pick:b.isObject(d)?c.withinRange(d,a):void 0});return d=d.length&&!d.filter(function(a){return b.isArray(a)&&"inverted"==a[2]||b.isObject(a)&&a.inverted}).length,-1===c.item.enable?!d:d||a.pick<c.item.min.pick||a.pick>c.item.max.pick},c.prototype.shift=function(a,b){var c=this,d=c.item.min.pick,e=c.item.max.pick;for(b=b||c.item.interval;c.disabled(a)&&(a=c.create(a.pick+=b),!(a.pick<=d||a.pick>=e)););return a},c.prototype.scope=function(a){var b=this.item.min.pick,c=this.item.max.pick;return this.create(a.pick>c?c:a.pick<b?b:a)},c.prototype.parse=function(a,c,d){var f,g,i,j,k,l=this,m={};if(!c||h.isInteger(c)||b.isArray(c)||h.isDate(c)||b.isObject(c)&&h.isInteger(c.pick))return c;d&&d.format||(d=d||{},d.format=l.settings.format),l.formats.toArray(d.format).map(function(a){var b,d=l.formats[a],e=d?h.trigger(d,l,[c,m]):a.replace(/^!/,"").length;d&&(b=c.substr(0,e),m[a]=b.match(/^\d+$/)?+b:b),c=c.substr(e)});for(j in m)k=m[j],h.isInteger(k)?j.match(/^(h|hh)$/i)?(f=k,("h"==j||"hh"==j)&&(f%=12)):"i"==j&&(g=k):j.match(/^a$/i)&&k.match(/^p/i)&&("h"in m||"hh"in m)&&(i=!0);return(i?f+12:f)*e+g},c.prototype.formats={h:function(a,b){return a?h.digits(a):b.hour%f||f},hh:function(a,b){return a?2:h.lead(b.hour%f||f)},H:function(a,b){return a?h.digits(a):""+b.hour%24},HH:function(a,b){return a?h.digits(a):h.lead(b.hour%24)},i:function(a,b){return a?2:h.lead(b.mins)},a:function(a,b){return a?4:g/2>b.time%g?"a.m.":"p.m."},A:function(a,b){return a?2:g/2>b.time%g?"AM":"PM"},toArray:function(a){return a.split(/(h{1,2}|H{1,2}|i|a|A|!.)/g)},toString:function(a,b){var c=this;return c.formats.toArray(a).map(function(a){return h.trigger(c.formats[a],c,[0,b])||a.replace(/^!/,"")}).join("")}},c.prototype.isTimeExact=function(a,c){var d=this;return h.isInteger(a)&&h.isInteger(c)||"boolean"==typeof a&&"boolean"==typeof c?a===c:(h.isDate(a)||b.isArray(a))&&(h.isDate(c)||b.isArray(c))?d.create(a).pick===d.create(c).pick:b.isObject(a)&&b.isObject(c)?d.isTimeExact(a.from,c.from)&&d.isTimeExact(a.to,c.to):!1},c.prototype.isTimeOverlap=function(a,c){var d=this;return h.isInteger(a)&&(h.isDate(c)||b.isArray(c))?a===d.create(c).hour:h.isInteger(c)&&(h.isDate(a)||b.isArray(a))?c===d.create(a).hour:b.isObject(a)&&b.isObject(c)?d.overlapRanges(a,c):!1},c.prototype.flipEnable=function(a){var b=this.item;b.enable=a||(-1==b.enable?1:-1)},c.prototype.deactivate=function(a,c){var d=this,e=d.item.disable.slice(0);return"flip"==c?d.flipEnable():c===!1?(d.flipEnable(1),e=[]):c===!0?(d.flipEnable(-1),e=[]):c.map(function(a){for(var c,f=0;f<e.length;f+=1)if(d.isTimeExact(a,e[f])){c=!0;break}c||(h.isInteger(a)||h.isDate(a)||b.isArray(a)||b.isObject(a)&&a.from&&a.to)&&e.push(a)}),e},c.prototype.activate=function(a,c){var d=this,e=d.item.disable,f=e.length;return"flip"==c?d.flipEnable():c===!0?(d.flipEnable(1),e=[]):c===!1?(d.flipEnable(-1),e=[]):c.map(function(a){var c,g,i,j;for(i=0;f>i;i+=1){if(g=e[i],d.isTimeExact(g,a)){c=e[i]=null,j=!0;break}if(d.isTimeOverlap(g,a)){b.isObject(a)?(a.inverted=!0,c=a):b.isArray(a)?(c=a,c[2]||c.push("inverted")):h.isDate(a)&&(c=[a.getFullYear(),a.getMonth(),a.getDate(),"inverted"]);break}}if(c)for(i=0;f>i;i+=1)if(d.isTimeExact(e[i],a)){e[i]=null;break}if(j)for(i=0;f>i;i+=1)if(d.isTimeOverlap(e[i],a)){e[i]=null;break}c&&e.push(c)}),e.filter(function(a){return null!=a})},c.prototype.i=function(a,b){return h.isInteger(b)&&b>0?b:this.item.interval},c.prototype.nodes=function(a){var b=this,c=b.settings,d=b.item.select,e=b.item.highlight,f=b.item.view,g=b.item.disable;return h.node("ul",h.group({min:b.item.min.pick,max:b.item.max.pick,i:b.item.interval,node:"li",item:function(a){a=b.create(a);var i=a.pick,j=d&&d.pick==i,k=e&&e.pick==i,l=g&&b.disabled(a);return[h.trigger(b.formats.toString,b,[h.trigger(c.formatLabel,b,[a])||c.format,a]),function(a){return j&&a.push(c.klass.selected),k&&a.push(c.klass.highlighted),f&&f.pick==i&&a.push(c.klass.viewset),l&&a.push(c.klass.disabled),a.join(" ")}([c.klass.listItem]),"data-pick="+a.pick+" "+h.ariaAttr({role:"button",controls:b.$node[0].id,checked:j&&b.$node.val()===h.trigger(b.formats.toString,b,[c.format,a])?!0:null,activedescendant:k?!0:null,disabled:l?!0:null})]}})+h.node("li",h.node("button",c.clear,c.klass.buttonClear,"type=button data-clear=1"+(a?"":" disable"))),c.klass.list)},c.defaults=function(a){return{clear:"Clear",format:"h:i A",interval:30,klass:{picker:a+" "+a+"--time",holder:a+"__holder",list:a+"__list",listItem:a+"__list-item",disabled:a+"__list-item--disabled",selected:a+"__list-item--selected",highlighted:a+"__list-item--highlighted",viewset:a+"__list-item--viewset",now:a+"__list-item--now",buttonClear:a+"__button--clear"}}}(a.klasses().picker),a.extend("pickatime",c)});
/*!
 * Legacy browser support
 */
[].map||(Array.prototype.map=function(a,b){for(var c=this,d=c.length,e=new Array(d),f=0;d>f;f++)f in c&&(e[f]=a.call(b,c[f],f,c));return e}),[].filter||(Array.prototype.filter=function(a){if(null==this)throw new TypeError;var b=Object(this),c=b.length>>>0;if("function"!=typeof a)throw new TypeError;for(var d=[],e=arguments[1],f=0;c>f;f++)if(f in b){var g=b[f];a.call(e,g,f,b)&&d.push(g)}return d}),[].indexOf||(Array.prototype.indexOf=function(a){if(null==this)throw new TypeError;var b=Object(this),c=b.length>>>0;if(0===c)return-1;var d=0;if(arguments.length>1&&(d=Number(arguments[1]),d!=d?d=0:0!==d&&1/0!=d&&d!=-1/0&&(d=(d>0||-1)*Math.floor(Math.abs(d)))),d>=c)return-1;for(var e=d>=0?d:Math.max(c-Math.abs(d),0);c>e;e++)if(e in b&&b[e]===a)return e;return-1});/*!
 * Cross-Browser Split 1.1.1
 * Copyright 2007-2012 Steven Levithan <stevenlevithan.com>
 * Available under the MIT License
 * http://blog.stevenlevithan.com/archives/cross-browser-split
 */
var nativeSplit=String.prototype.split,compliantExecNpcg=void 0===/()??/.exec("")[1];String.prototype.split=function(a,b){var c=this;if("[object RegExp]"!==Object.prototype.toString.call(a))return nativeSplit.call(c,a,b);var d,e,f,g,h=[],i=(a.ignoreCase?"i":"")+(a.multiline?"m":"")+(a.extended?"x":"")+(a.sticky?"y":""),j=0;for(a=new RegExp(a.source,i+"g"),c+="",compliantExecNpcg||(d=new RegExp("^"+a.source+"$(?!\\s)",i)),b=void 0===b?-1>>>0:b>>>0;(e=a.exec(c))&&(f=e.index+e[0].length,!(f>j&&(h.push(c.slice(j,e.index)),!compliantExecNpcg&&e.length>1&&e[0].replace(d,function(){for(var a=1;a<arguments.length-2;a++)void 0===arguments[a]&&(e[a]=void 0)}),e.length>1&&e.index<c.length&&Array.prototype.push.apply(h,e.slice(1)),g=e[0].length,j=f,h.length>=b)));)a.lastIndex===e.index&&a.lastIndex++;return j===c.length?(g||!a.test(""))&&h.push(""):h.push(c.slice(j)),h.length>b?h.slice(0,b):h};
angular.module("angular-datepicker",[]).directive("pickADate",function(){return{restrict:"A",scope:{pickADate:"=",pickADateOptions:"="},link:function(a,b){function c(c){if("function"==typeof f&&f.apply(this,arguments),!a.$$phase&&!a.$root.$$phase){var d=b.pickadate("picker").get("select");a.$apply(function(){return c.hasOwnProperty("clear")?void(a.pickADate=null):(a.pickADate&&"string"!=typeof a.pickADate||(a.pickADate=new Date(0)),a.pickADate.setYear(d.obj.getYear()+1900),a.pickADate.setMonth(d.obj.getMonth()),void a.pickADate.setDate(d.obj.getDate()))})}}function d(){if("function"==typeof g&&g.apply(this,arguments),"undefined"!=typeof cordova&&cordova.plugins&&cordova.plugins.Keyboard){var a=function(){cordova.plugins.Keyboard.close(),window.removeEventListener("native.keyboardshow",this)};window.addEventListener("native.keyboardshow",a),setTimeout(function(){window.removeEventListener("native.keyboardshow",a)},500)}}var e=a.pickADateOptions||{},f=e.onSet,g=e.onClose;b.pickadate(angular.extend(e,{onSet:c,onClose:d,container:document.body})),setTimeout(function(){a.pickADate&&b.pickadate("picker").set("select",a.pickADate)},1e3)}}}).directive("pickATime",function(){return{restrict:"A",scope:{pickATime:"=",pickATimeOptions:"="},link:function(a,b){function c(c){if("function"==typeof f&&f.apply(this,arguments),!a.$$phase&&!a.$root.$$phase){var d=b.pickatime("picker").get("select");a.$apply(function(){return c.hasOwnProperty("clear")?void(a.pickATime=null):(a.pickATime&&"string"!=typeof a.pickATime||(a.pickATime=new Date),a.pickATime.setHours(d.hour),a.pickATime.setMinutes(d.mins),a.pickATime.setSeconds(0),void a.pickATime.setMilliseconds(0))})}}function d(){if("function"==typeof g&&g.apply(this,arguments),"undefined"!=typeof cordova&&cordova.plugins&&cordova.plugins.Keyboard){var a=function(){cordova.plugins.Keyboard.close(),window.removeEventListener("native.keyboardshow",this)};window.addEventListener("native.keyboardshow",a),setTimeout(function(){window.removeEventListener("native.keyboardshow",a)},500)}}var e=a.pickATimeOptions||{},f=e.onSet,g=e.onClose;b.pickatime(angular.extend(e,{onSet:c,onClose:d,container:document.body})),setTimeout(function(){a.pickATime&&b.pickatime("picker").set("select",a.pickATime)},1e3)}}});
},{}],"/Users/Jimmy/code/hull/hull-instant/node_modules/angular-schema-form/dist/schema-form.js":[function(require,module,exports){
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

},{}],"/Users/Jimmy/code/hull/hull-instant/node_modules/angular-translate/dist/angular-translate.js":[function(require,module,exports){
/*!
 * angular-translate - v2.6.1 - 2015-03-01
 * http://github.com/angular-translate/angular-translate
 * Copyright (c) 2015 ; Licensed MIT
 */
/**
 * @ngdoc overview
 * @name pascalprecht.translate
 *
 * @description
 * The main module which holds everything together.
 */
angular.module('pascalprecht.translate', ['ng'])

.run(['$translate', function ($translate) {

  var key = $translate.storageKey(),
      storage = $translate.storage();

  var fallbackFromIncorrectStorageValue = function() {
    var preferred = $translate.preferredLanguage();
    if (angular.isString(preferred)) {
      $translate.use(preferred);
      // $translate.use() will also remember the language.
      // So, we don't need to call storage.put() here.
    } else {
      storage.put(key, $translate.use());
    }
  };

  if (storage) {
    if (!storage.get(key)) {
      fallbackFromIncorrectStorageValue();
    } else {
      $translate.use(storage.get(key))['catch'](fallbackFromIncorrectStorageValue);
    }
  } else if (angular.isString($translate.preferredLanguage())) {
    $translate.use($translate.preferredLanguage());
  }
}]);

/**
 * @ngdoc object
 * @name pascalprecht.translate.$translateProvider
 * @description
 *
 * $translateProvider allows developers to register translation-tables, asynchronous loaders
 * and similar to configure translation behavior directly inside of a module.
 *
 */
angular.module('pascalprecht.translate').provider('$translate', ['$STORAGE_KEY', '$windowProvider', function ($STORAGE_KEY, $windowProvider) {

  var $translationTable = {},
      $preferredLanguage,
      $availableLanguageKeys = [],
      $languageKeyAliases,
      $fallbackLanguage,
      $fallbackWasString,
      $uses,
      $nextLang,
      $storageFactory,
      $storageKey = $STORAGE_KEY,
      $storagePrefix,
      $missingTranslationHandlerFactory,
      $interpolationFactory,
      $interpolatorFactories = [],
      $interpolationSanitizationStrategy = false,
      $loaderFactory,
      $cloakClassName = 'translate-cloak',
      $loaderOptions,
      $notFoundIndicatorLeft,
      $notFoundIndicatorRight,
      $postCompilingEnabled = false,
      NESTED_OBJECT_DELIMITER = '.',
      loaderCache,
      directivePriority = 0;

  var version = '2.6.1';

  // tries to determine the browsers language
  var getFirstBrowserLanguage = function () {
    var nav = $windowProvider.$get().navigator,
        browserLanguagePropertyKeys = ['language', 'browserLanguage', 'systemLanguage', 'userLanguage'],
        i,
        language;

    // support for HTML 5.1 "navigator.languages"
    if (angular.isArray(nav.languages)) {
      for (i = 0; i < nav.languages.length; i++) {
        language = nav.languages[i];
        if (language && language.length) {
          return language;
        }
      }
    }

    // support for other well known properties in browsers
    for (i = 0; i < browserLanguagePropertyKeys.length; i++) {
      language = nav[browserLanguagePropertyKeys[i]];
      if (language && language.length) {
        return language;
      }
    }

    return null;
  };
  getFirstBrowserLanguage.displayName = 'angular-translate/service: getFirstBrowserLanguage';

  // tries to determine the browsers locale
  var getLocale = function () {
    return (getFirstBrowserLanguage() || '').split('-').join('_');
  };
  getLocale.displayName = 'angular-translate/service: getLocale';

  /**
   * @name indexOf
   * @private
   *
   * @description
   * indexOf polyfill. Kinda sorta.
   *
   * @param {array} array Array to search in.
   * @param {string} searchElement Element to search for.
   *
   * @returns {int} Index of search element.
   */
  var indexOf = function(array, searchElement) {
    for (var i = 0, len = array.length; i < len; i++) {
      if (array[i] === searchElement) {
        return i;
      }
    }
    return -1;
  };

  /**
   * @name trim
   * @private
   *
   * @description
   * trim polyfill
   *
   * @returns {string} The string stripped of whitespace from both ends
   */
  var trim = function() {
    return this.replace(/^\s+|\s+$/g, '');
  };

  var negotiateLocale = function (preferred) {

    var avail = [],
        locale = angular.lowercase(preferred),
        i = 0,
        n = $availableLanguageKeys.length;

    for (; i < n; i++) {
      avail.push(angular.lowercase($availableLanguageKeys[i]));
    }

    if (indexOf(avail, locale) > -1) {
      return preferred;
    }

    if ($languageKeyAliases) {
      var alias;
      for (var langKeyAlias in $languageKeyAliases) {
        var hasWildcardKey = false;
        var hasExactKey = Object.prototype.hasOwnProperty.call($languageKeyAliases, langKeyAlias) &&
          angular.lowercase(langKeyAlias) === angular.lowercase(preferred);

        if (langKeyAlias.slice(-1) === '*') {
          hasWildcardKey = langKeyAlias.slice(0, -1) === preferred.slice(0, langKeyAlias.length-1);
        }
        if (hasExactKey || hasWildcardKey) {
          alias = $languageKeyAliases[langKeyAlias];
          if (indexOf(avail, angular.lowercase(alias)) > -1) {
            return alias;
          }
        }
      }
    }

    var parts = preferred.split('_');

    if (parts.length > 1 && indexOf(avail, angular.lowercase(parts[0])) > -1) {
      return parts[0];
    }

    // If everything fails, just return the preferred, unchanged.
    return preferred;
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#translations
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Registers a new translation table for specific language key.
   *
   * To register a translation table for specific language, pass a defined language
   * key as first parameter.
   *
   * <pre>
   *  // register translation table for language: 'de_DE'
   *  $translateProvider.translations('de_DE', {
   *    'GREETING': 'Hallo Welt!'
   *  });
   *
   *  // register another one
   *  $translateProvider.translations('en_US', {
   *    'GREETING': 'Hello world!'
   *  });
   * </pre>
   *
   * When registering multiple translation tables for for the same language key,
   * the actual translation table gets extended. This allows you to define module
   * specific translation which only get added, once a specific module is loaded in
   * your app.
   *
   * Invoking this method with no arguments returns the translation table which was
   * registered with no language key. Invoking it with a language key returns the
   * related translation table.
   *
   * @param {string} key A language key.
   * @param {object} translationTable A plain old JavaScript object that represents a translation table.
   *
   */
  var translations = function (langKey, translationTable) {

    if (!langKey && !translationTable) {
      return $translationTable;
    }

    if (langKey && !translationTable) {
      if (angular.isString(langKey)) {
        return $translationTable[langKey];
      }
    } else {
      if (!angular.isObject($translationTable[langKey])) {
        $translationTable[langKey] = {};
      }
      angular.extend($translationTable[langKey], flatObject(translationTable));
    }
    return this;
  };

  this.translations = translations;

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#cloakClassName
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   *
   * Let's you change the class name for `translate-cloak` directive.
   * Default class name is `translate-cloak`.
   *
   * @param {string} name translate-cloak class name
   */
  this.cloakClassName = function (name) {
    if (!name) {
      return $cloakClassName;
    }
    $cloakClassName = name;
    return this;
  };

  /**
   * @name flatObject
   * @private
   *
   * @description
   * Flats an object. This function is used to flatten given translation data with
   * namespaces, so they are later accessible via dot notation.
   */
  var flatObject = function (data, path, result, prevKey) {
    var key, keyWithPath, keyWithShortPath, val;

    if (!path) {
      path = [];
    }
    if (!result) {
      result = {};
    }
    for (key in data) {
      if (!Object.prototype.hasOwnProperty.call(data, key)) {
        continue;
      }
      val = data[key];
      if (angular.isObject(val)) {
        flatObject(val, path.concat(key), result, key);
      } else {
        keyWithPath = path.length ? ('' + path.join(NESTED_OBJECT_DELIMITER) + NESTED_OBJECT_DELIMITER + key) : key;
        if(path.length && key === prevKey){
          // Create shortcut path (foo.bar == foo.bar.bar)
          keyWithShortPath = '' + path.join(NESTED_OBJECT_DELIMITER);
          // Link it to original path
          result[keyWithShortPath] = '@:' + keyWithPath;
        }
        result[keyWithPath] = val;
      }
    }
    return result;
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#addInterpolation
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Adds interpolation services to angular-translate, so it can manage them.
   *
   * @param {object} factory Interpolation service factory
   */
  this.addInterpolation = function (factory) {
    $interpolatorFactories.push(factory);
    return this;
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#useMessageFormatInterpolation
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Tells angular-translate to use interpolation functionality of messageformat.js.
   * This is useful when having high level pluralization and gender selection.
   */
  this.useMessageFormatInterpolation = function () {
    return this.useInterpolation('$translateMessageFormatInterpolation');
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#useInterpolation
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Tells angular-translate which interpolation style to use as default, application-wide.
   * Simply pass a factory/service name. The interpolation service has to implement
   * the correct interface.
   *
   * @param {string} factory Interpolation service name.
   */
  this.useInterpolation = function (factory) {
    $interpolationFactory = factory;
    return this;
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#useSanitizeStrategy
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Simply sets a sanitation strategy type.
   *
   * @param {string} value Strategy type.
   */
  this.useSanitizeValueStrategy = function (value) {
    $interpolationSanitizationStrategy = value;
    return this;
  };

 /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#preferredLanguage
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Tells the module which of the registered translation tables to use for translation
   * at initial startup by passing a language key. Similar to `$translateProvider#use`
   * only that it says which language to **prefer**.
   *
   * @param {string} langKey A language key.
   *
   */
  this.preferredLanguage = function(langKey) {
    setupPreferredLanguage(langKey);
    return this;

  };
  var setupPreferredLanguage = function (langKey) {
    if (langKey) {
      $preferredLanguage = langKey;
    }
    return $preferredLanguage;
  };
  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#translationNotFoundIndicator
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Sets an indicator which is used when a translation isn't found. E.g. when
   * setting the indicator as 'X' and one tries to translate a translation id
   * called `NOT_FOUND`, this will result in `X NOT_FOUND X`.
   *
   * Internally this methods sets a left indicator and a right indicator using
   * `$translateProvider.translationNotFoundIndicatorLeft()` and
   * `$translateProvider.translationNotFoundIndicatorRight()`.
   *
   * **Note**: These methods automatically add a whitespace between the indicators
   * and the translation id.
   *
   * @param {string} indicator An indicator, could be any string.
   */
  this.translationNotFoundIndicator = function (indicator) {
    this.translationNotFoundIndicatorLeft(indicator);
    this.translationNotFoundIndicatorRight(indicator);
    return this;
  };

  /**
   * ngdoc function
   * @name pascalprecht.translate.$translateProvider#translationNotFoundIndicatorLeft
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Sets an indicator which is used when a translation isn't found left to the
   * translation id.
   *
   * @param {string} indicator An indicator.
   */
  this.translationNotFoundIndicatorLeft = function (indicator) {
    if (!indicator) {
      return $notFoundIndicatorLeft;
    }
    $notFoundIndicatorLeft = indicator;
    return this;
  };

  /**
   * ngdoc function
   * @name pascalprecht.translate.$translateProvider#translationNotFoundIndicatorLeft
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Sets an indicator which is used when a translation isn't found right to the
   * translation id.
   *
   * @param {string} indicator An indicator.
   */
  this.translationNotFoundIndicatorRight = function (indicator) {
    if (!indicator) {
      return $notFoundIndicatorRight;
    }
    $notFoundIndicatorRight = indicator;
    return this;
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#fallbackLanguage
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Tells the module which of the registered translation tables to use when missing translations
   * at initial startup by passing a language key. Similar to `$translateProvider#use`
   * only that it says which language to **fallback**.
   *
   * @param {string||array} langKey A language key.
   *
   */
  this.fallbackLanguage = function (langKey) {
    fallbackStack(langKey);
    return this;
  };

  var fallbackStack = function (langKey) {
    if (langKey) {
      if (angular.isString(langKey)) {
        $fallbackWasString = true;
        $fallbackLanguage = [ langKey ];
      } else if (angular.isArray(langKey)) {
        $fallbackWasString = false;
        $fallbackLanguage = langKey;
      }
      if (angular.isString($preferredLanguage)  && indexOf($fallbackLanguage, $preferredLanguage) < 0) {
        $fallbackLanguage.push($preferredLanguage);
      }

      return this;
    } else {
      if ($fallbackWasString) {
        return $fallbackLanguage[0];
      } else {
        return $fallbackLanguage;
      }
    }
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#use
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Set which translation table to use for translation by given language key. When
   * trying to 'use' a language which isn't provided, it'll throw an error.
   *
   * You actually don't have to use this method since `$translateProvider#preferredLanguage`
   * does the job too.
   *
   * @param {string} langKey A language key.
   */
  this.use = function (langKey) {
    if (langKey) {
      if (!$translationTable[langKey] && (!$loaderFactory)) {
        // only throw an error, when not loading translation data asynchronously
        throw new Error("$translateProvider couldn't find translationTable for langKey: '" + langKey + "'");
      }
      $uses = langKey;
      return this;
    }
    return $uses;
  };

 /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#storageKey
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Tells the module which key must represent the choosed language by a user in the storage.
   *
   * @param {string} key A key for the storage.
   */
  var storageKey = function(key) {
    if (!key) {
      if ($storagePrefix) {
        return $storagePrefix + $storageKey;
      }
      return $storageKey;
    }
    $storageKey = key;
  };

  this.storageKey = storageKey;

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#useUrlLoader
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Tells angular-translate to use `$translateUrlLoader` extension service as loader.
   *
   * @param {string} url Url
   * @param {Object=} options Optional configuration object
   */
  this.useUrlLoader = function (url, options) {
    return this.useLoader('$translateUrlLoader', angular.extend({ url: url }, options));
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#useStaticFilesLoader
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Tells angular-translate to use `$translateStaticFilesLoader` extension service as loader.
   *
   * @param {Object=} options Optional configuration object
   */
  this.useStaticFilesLoader = function (options) {
    return this.useLoader('$translateStaticFilesLoader', options);
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#useLoader
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Tells angular-translate to use any other service as loader.
   *
   * @param {string} loaderFactory Factory name to use
   * @param {Object=} options Optional configuration object
   */
  this.useLoader = function (loaderFactory, options) {
    $loaderFactory = loaderFactory;
    $loaderOptions = options || {};
    return this;
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#useLocalStorage
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Tells angular-translate to use `$translateLocalStorage` service as storage layer.
   *
   */
  this.useLocalStorage = function () {
    return this.useStorage('$translateLocalStorage');
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#useCookieStorage
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Tells angular-translate to use `$translateCookieStorage` service as storage layer.
   */
  this.useCookieStorage = function () {
    return this.useStorage('$translateCookieStorage');
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#useStorage
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Tells angular-translate to use custom service as storage layer.
   */
  this.useStorage = function (storageFactory) {
    $storageFactory = storageFactory;
    return this;
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#storagePrefix
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Sets prefix for storage key.
   *
   * @param {string} prefix Storage key prefix
   */
  this.storagePrefix = function (prefix) {
    if (!prefix) {
      return prefix;
    }
    $storagePrefix = prefix;
    return this;
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#useMissingTranslationHandlerLog
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Tells angular-translate to use built-in log handler when trying to translate
   * a translation Id which doesn't exist.
   *
   * This is actually a shortcut method for `useMissingTranslationHandler()`.
   *
   */
  this.useMissingTranslationHandlerLog = function () {
    return this.useMissingTranslationHandler('$translateMissingTranslationHandlerLog');
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#useMissingTranslationHandler
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Expects a factory name which later gets instantiated with `$injector`.
   * This method can be used to tell angular-translate to use a custom
   * missingTranslationHandler. Just build a factory which returns a function
   * and expects a translation id as argument.
   *
   * Example:
   * <pre>
   *  app.config(function ($translateProvider) {
   *    $translateProvider.useMissingTranslationHandler('customHandler');
   *  });
   *
   *  app.factory('customHandler', function (dep1, dep2) {
   *    return function (translationId) {
   *      // something with translationId and dep1 and dep2
   *    };
   *  });
   * </pre>
   *
   * @param {string} factory Factory name
   */
  this.useMissingTranslationHandler = function (factory) {
    $missingTranslationHandlerFactory = factory;
    return this;
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#usePostCompiling
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * If post compiling is enabled, all translated values will be processed
   * again with AngularJS' $compile.
   *
   * Example:
   * <pre>
   *  app.config(function ($translateProvider) {
   *    $translateProvider.usePostCompiling(true);
   *  });
   * </pre>
   *
   * @param {string} factory Factory name
   */
  this.usePostCompiling = function (value) {
    $postCompilingEnabled = !(!value);
    return this;
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#determinePreferredLanguage
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Tells angular-translate to try to determine on its own which language key
   * to set as preferred language. When `fn` is given, angular-translate uses it
   * to determine a language key, otherwise it uses the built-in `getLocale()`
   * method.
   *
   * The `getLocale()` returns a language key in the format `[lang]_[country]` or
   * `[lang]` depending on what the browser provides.
   *
   * Use this method at your own risk, since not all browsers return a valid
   * locale.
   *
   * @param {object=} fn Function to determine a browser's locale
   */
  this.determinePreferredLanguage = function (fn) {

    var locale = (fn && angular.isFunction(fn)) ? fn() : getLocale();

    if (!$availableLanguageKeys.length) {
      $preferredLanguage = locale;
    } else {
      $preferredLanguage = negotiateLocale(locale);
    }

    return this;
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#registerAvailableLanguageKeys
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Registers a set of language keys the app will work with. Use this method in
   * combination with
   * {@link pascalprecht.translate.$translateProvider#determinePreferredLanguage determinePreferredLanguage}.
   * When available languages keys are registered, angular-translate
   * tries to find the best fitting language key depending on the browsers locale,
   * considering your language key convention.
   *
   * @param {object} languageKeys Array of language keys the your app will use
   * @param {object=} aliases Alias map.
   */
  this.registerAvailableLanguageKeys = function (languageKeys, aliases) {
    if (languageKeys) {
      $availableLanguageKeys = languageKeys;
      if (aliases) {
        $languageKeyAliases = aliases;
      }
      return this;
    }
    return $availableLanguageKeys;
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#useLoaderCache
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Registers a cache for internal $http based loaders.
   * {@link pascalprecht.translate.$translateProvider#determinePreferredLanguage determinePreferredLanguage}.
   * When false the cache will be disabled (default). When true or undefined
   * the cache will be a default (see $cacheFactory). When an object it will
   * be treat as a cache object itself: the usage is $http({cache: cache})
   *
   * @param {object} cache boolean, string or cache-object
   */
  this.useLoaderCache = function (cache) {
    if (cache === false) {
      // disable cache
      loaderCache = undefined;
    } else if (cache === true) {
      // enable cache using AJS defaults
      loaderCache = true;
    } else if (typeof(cache) === 'undefined') {
      // enable cache using default
      loaderCache = '$translationCache';
    } else if (cache) {
      // enable cache using given one (see $cacheFactory)
      loaderCache = cache;
    }
    return this;
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateProvider#directivePriority
   * @methodOf pascalprecht.translate.$translateProvider
   *
   * @description
   * Sets the default priority of the translate directive. The standard value is `0`.
   * Calling this function without an argument will return the current value.
   *
   * @param {number} priority for the translate-directive
   */
  this.directivePriority = function (priority) {
    if (priority === undefined) {
      // getter
      return directivePriority;
    } else {
      // setter with chaining
      directivePriority = priority;
      return this;
    }
  };

  /**
   * @ngdoc object
   * @name pascalprecht.translate.$translate
   * @requires $interpolate
   * @requires $log
   * @requires $rootScope
   * @requires $q
   *
   * @description
   * The `$translate` service is the actual core of angular-translate. It expects a translation id
   * and optional interpolate parameters to translate contents.
   *
   * <pre>
   *  $translate('HEADLINE_TEXT').then(function (translation) {
   *    $scope.translatedText = translation;
   *  });
   * </pre>
   *
   * @param {string|array} translationId A token which represents a translation id
   *                                     This can be optionally an array of translation ids which
   *                                     results that the function returns an object where each key
   *                                     is the translation id and the value the translation.
   * @param {object=} interpolateParams An object hash for dynamic values
   * @param {string} interpolationId The id of the interpolation to use
   * @returns {object} promise
   */
  this.$get = [
    '$log',
    '$injector',
    '$rootScope',
    '$q',
    function ($log, $injector, $rootScope, $q) {

      var Storage,
          defaultInterpolator = $injector.get($interpolationFactory || '$translateDefaultInterpolation'),
          pendingLoader = false,
          interpolatorHashMap = {},
          langPromises = {},
          fallbackIndex,
          startFallbackIteration;

      var $translate = function (translationId, interpolateParams, interpolationId, defaultTranslationText) {

        // Duck detection: If the first argument is an array, a bunch of translations was requested.
        // The result is an object.
        if (angular.isArray(translationId)) {
          // Inspired by Q.allSettled by Kris Kowal
          // https://github.com/kriskowal/q/blob/b0fa72980717dc202ffc3cbf03b936e10ebbb9d7/q.js#L1553-1563
          // This transforms all promises regardless resolved or rejected
          var translateAll = function (translationIds) {
            var results = {}; // storing the actual results
            var promises = []; // promises to wait for
            // Wraps the promise a) being always resolved and b) storing the link id->value
            var translate = function (translationId) {
              var deferred = $q.defer();
              var regardless = function (value) {
                results[translationId] = value;
                deferred.resolve([translationId, value]);
              };
              // we don't care whether the promise was resolved or rejected; just store the values
              $translate(translationId, interpolateParams, interpolationId, defaultTranslationText).then(regardless, regardless);
              return deferred.promise;
            };
            for (var i = 0, c = translationIds.length; i < c; i++) {
              promises.push(translate(translationIds[i]));
            }
            // wait for all (including storing to results)
            return $q.all(promises).then(function () {
              // return the results
              return results;
            });
          };
          return translateAll(translationId);
        }

        var deferred = $q.defer();

        // trim off any whitespace
        if (translationId) {
          translationId = trim.apply(translationId);
        }

        var promiseToWaitFor = (function () {
          var promise = $preferredLanguage ?
            langPromises[$preferredLanguage] :
            langPromises[$uses];

          fallbackIndex = 0;

          if ($storageFactory && !promise) {
            // looks like there's no pending promise for $preferredLanguage or
            // $uses. Maybe there's one pending for a language that comes from
            // storage.
            var langKey = Storage.get($storageKey);
            promise = langPromises[langKey];

            if ($fallbackLanguage && $fallbackLanguage.length) {
                var index = indexOf($fallbackLanguage, langKey);
                // maybe the language from storage is also defined as fallback language
                // we increase the fallback language index to not search in that language
                // as fallback, since it's probably the first used language
                // in that case the index starts after the first element
                fallbackIndex = (index === 0) ? 1 : 0;

                // but we can make sure to ALWAYS fallback to preferred language at least
                if (indexOf($fallbackLanguage, $preferredLanguage) < 0) {
                  $fallbackLanguage.push($preferredLanguage);
                }
            }
          }
          return promise;
        }());

        if (!promiseToWaitFor) {
          // no promise to wait for? okay. Then there's no loader registered
          // nor is a one pending for language that comes from storage.
          // We can just translate.
          determineTranslation(translationId, interpolateParams, interpolationId, defaultTranslationText).then(deferred.resolve, deferred.reject);
        } else {
          promiseToWaitFor.then(function () {
            determineTranslation(translationId, interpolateParams, interpolationId, defaultTranslationText).then(deferred.resolve, deferred.reject);
          }, deferred.reject);
        }
        return deferred.promise;
      };

      /**
       * @name applyNotFoundIndicators
       * @private
       *
       * @description
       * Applies not fount indicators to given translation id, if needed.
       * This function gets only executed, if a translation id doesn't exist,
       * which is why a translation id is expected as argument.
       *
       * @param {string} translationId Translation id.
       * @returns {string} Same as given translation id but applied with not found
       * indicators.
       */
      var applyNotFoundIndicators = function (translationId) {
        // applying notFoundIndicators
        if ($notFoundIndicatorLeft) {
          translationId = [$notFoundIndicatorLeft, translationId].join(' ');
        }
        if ($notFoundIndicatorRight) {
          translationId = [translationId, $notFoundIndicatorRight].join(' ');
        }
        return translationId;
      };

      /**
       * @name useLanguage
       * @private
       *
       * @description
       * Makes actual use of a language by setting a given language key as used
       * language and informs registered interpolators to also use the given
       * key as locale.
       *
       * @param {key} Locale key.
       */
      var useLanguage = function (key) {
        $uses = key;
        $rootScope.$emit('$translateChangeSuccess', {language: key});

        if ($storageFactory) {
          Storage.put($translate.storageKey(), $uses);
        }
        // inform default interpolator
        defaultInterpolator.setLocale($uses);
        // inform all others too!
        angular.forEach(interpolatorHashMap, function (interpolator, id) {
          interpolatorHashMap[id].setLocale($uses);
        });
        $rootScope.$emit('$translateChangeEnd', {language: key});
      };

      /**
       * @name loadAsync
       * @private
       *
       * @description
       * Kicks of registered async loader using `$injector` and applies existing
       * loader options. When resolved, it updates translation tables accordingly
       * or rejects with given language key.
       *
       * @param {string} key Language key.
       * @return {Promise} A promise.
       */
      var loadAsync = function (key) {
        if (!key) {
          throw 'No language key specified for loading.';
        }

        var deferred = $q.defer();

        $rootScope.$emit('$translateLoadingStart', {language: key});
        pendingLoader = true;

        var cache = loaderCache;
        if (typeof(cache) === 'string') {
          // getting on-demand instance of loader
          cache = $injector.get(cache);
        }

        var loaderOptions = angular.extend({}, $loaderOptions, {
          key: key,
          $http: angular.extend({}, {
            cache: cache
          }, $loaderOptions.$http)
        });

        $injector.get($loaderFactory)(loaderOptions).then(function (data) {
          var translationTable = {};
          $rootScope.$emit('$translateLoadingSuccess', {language: key});

          if (angular.isArray(data)) {
            angular.forEach(data, function (table) {
              angular.extend(translationTable, flatObject(table));
            });
          } else {
            angular.extend(translationTable, flatObject(data));
          }
          pendingLoader = false;
          deferred.resolve({
            key: key,
            table: translationTable
          });
          $rootScope.$emit('$translateLoadingEnd', {language: key});
        }, function (key) {
          $rootScope.$emit('$translateLoadingError', {language: key});
          deferred.reject(key);
          $rootScope.$emit('$translateLoadingEnd', {language: key});
        });
        return deferred.promise;
      };

      if ($storageFactory) {
        Storage = $injector.get($storageFactory);

        if (!Storage.get || !Storage.put) {
          throw new Error('Couldn\'t use storage \'' + $storageFactory + '\', missing get() or put() method!');
        }
      }

      // apply additional settings
      if (angular.isFunction(defaultInterpolator.useSanitizeValueStrategy)) {
        defaultInterpolator.useSanitizeValueStrategy($interpolationSanitizationStrategy);
      }

      // if we have additional interpolations that were added via
      // $translateProvider.addInterpolation(), we have to map'em
      if ($interpolatorFactories.length) {
        angular.forEach($interpolatorFactories, function (interpolatorFactory) {
          var interpolator = $injector.get(interpolatorFactory);
          // setting initial locale for each interpolation service
          interpolator.setLocale($preferredLanguage || $uses);
          // apply additional settings
          if (angular.isFunction(interpolator.useSanitizeValueStrategy)) {
            interpolator.useSanitizeValueStrategy($interpolationSanitizationStrategy);
          }
          // make'em recognizable through id
          interpolatorHashMap[interpolator.getInterpolationIdentifier()] = interpolator;
        });
      }

      /**
       * @name getTranslationTable
       * @private
       *
       * @description
       * Returns a promise that resolves to the translation table
       * or is rejected if an error occurred.
       *
       * @param langKey
       * @returns {Q.promise}
       */
      var getTranslationTable = function (langKey) {
        var deferred = $q.defer();
        if (Object.prototype.hasOwnProperty.call($translationTable, langKey)) {
          deferred.resolve($translationTable[langKey]);
        } else if (langPromises[langKey]) {
          langPromises[langKey].then(function (data) {
            translations(data.key, data.table);
            deferred.resolve(data.table);
          }, deferred.reject);
        } else {
          deferred.reject();
        }
        return deferred.promise;
      };

      /**
       * @name getFallbackTranslation
       * @private
       *
       * @description
       * Returns a promise that will resolve to the translation
       * or be rejected if no translation was found for the language.
       * This function is currently only used for fallback language translation.
       *
       * @param langKey The language to translate to.
       * @param translationId
       * @param interpolateParams
       * @param Interpolator
       * @returns {Q.promise}
       */
      var getFallbackTranslation = function (langKey, translationId, interpolateParams, Interpolator) {
        var deferred = $q.defer();

        getTranslationTable(langKey).then(function (translationTable) {
          if (Object.prototype.hasOwnProperty.call(translationTable, translationId)) {
            Interpolator.setLocale(langKey);
            var translation = translationTable[translationId];
            if (translation.substr(0, 2) === '@:') {
              getFallbackTranslation(langKey, translation.substr(2), interpolateParams, Interpolator)
                .then(deferred.resolve, deferred.reject);
            } else {
              deferred.resolve(Interpolator.interpolate(translationTable[translationId], interpolateParams));
            }
            Interpolator.setLocale($uses);
          } else {
            deferred.reject();
          }
        }, deferred.reject);

        return deferred.promise;
      };

      /**
       * @name getFallbackTranslationInstant
       * @private
       *
       * @description
       * Returns a translation
       * This function is currently only used for fallback language translation.
       *
       * @param langKey The language to translate to.
       * @param translationId
       * @param interpolateParams
       * @param Interpolator
       * @returns {string} translation
       */
      var getFallbackTranslationInstant = function (langKey, translationId, interpolateParams, Interpolator) {
        var result, translationTable = $translationTable[langKey];

        if (translationTable && Object.prototype.hasOwnProperty.call(translationTable, translationId)) {
          Interpolator.setLocale(langKey);
          result = Interpolator.interpolate(translationTable[translationId], interpolateParams);
          if (result.substr(0, 2) === '@:') {
            return getFallbackTranslationInstant(langKey, result.substr(2), interpolateParams, Interpolator);
          }
          Interpolator.setLocale($uses);
        }

        return result;
      };


      /**
       * @name translateByHandler
       * @private
       *
       * Translate by missing translation handler.
       *
       * @param translationId
       * @returns translation created by $missingTranslationHandler or translationId is $missingTranslationHandler is
       * absent
       */
      var translateByHandler = function (translationId) {
        // If we have a handler factory - we might also call it here to determine if it provides
        // a default text for a translationid that can't be found anywhere in our tables
        if ($missingTranslationHandlerFactory) {
          var resultString = $injector.get($missingTranslationHandlerFactory)(translationId, $uses);
          if (resultString !== undefined) {
            return resultString;
          } else {
            return translationId;
          }
        } else {
          return translationId;
        }
      };

      /**
       * @name resolveForFallbackLanguage
       * @private
       *
       * Recursive helper function for fallbackTranslation that will sequentially look
       * for a translation in the fallbackLanguages starting with fallbackLanguageIndex.
       *
       * @param fallbackLanguageIndex
       * @param translationId
       * @param interpolateParams
       * @param Interpolator
       * @returns {Q.promise} Promise that will resolve to the translation.
       */
      var resolveForFallbackLanguage = function (fallbackLanguageIndex, translationId, interpolateParams, Interpolator, defaultTranslationText) {
        var deferred = $q.defer();

        if (fallbackLanguageIndex < $fallbackLanguage.length) {
          var langKey = $fallbackLanguage[fallbackLanguageIndex];
          getFallbackTranslation(langKey, translationId, interpolateParams, Interpolator).then(
            deferred.resolve,
            function () {
              // Look in the next fallback language for a translation.
              // It delays the resolving by passing another promise to resolve.
              resolveForFallbackLanguage(fallbackLanguageIndex + 1, translationId, interpolateParams, Interpolator, defaultTranslationText).then(deferred.resolve);
            }
          );
        } else {
          // No translation found in any fallback language
          // if a default translation text is set in the directive, then return this as a result
          if (defaultTranslationText) {
            deferred.resolve(defaultTranslationText);
          } else {
            // if no default translation is set and an error handler is defined, send it to the handler
            // and then return the result
            deferred.resolve(translateByHandler(translationId));
          }
        }
        return deferred.promise;
      };

      /**
       * @name resolveForFallbackLanguageInstant
       * @private
       *
       * Recursive helper function for fallbackTranslation that will sequentially look
       * for a translation in the fallbackLanguages starting with fallbackLanguageIndex.
       *
       * @param fallbackLanguageIndex
       * @param translationId
       * @param interpolateParams
       * @param Interpolator
       * @returns {string} translation
       */
      var resolveForFallbackLanguageInstant = function (fallbackLanguageIndex, translationId, interpolateParams, Interpolator) {
        var result;

        if (fallbackLanguageIndex < $fallbackLanguage.length) {
          var langKey = $fallbackLanguage[fallbackLanguageIndex];
          result = getFallbackTranslationInstant(langKey, translationId, interpolateParams, Interpolator);
          if (!result) {
            result = resolveForFallbackLanguageInstant(fallbackLanguageIndex + 1, translationId, interpolateParams, Interpolator);
          }
        }
        return result;
      };

      /**
       * Translates with the usage of the fallback languages.
       *
       * @param translationId
       * @param interpolateParams
       * @param Interpolator
       * @returns {Q.promise} Promise, that resolves to the translation.
       */
      var fallbackTranslation = function (translationId, interpolateParams, Interpolator, defaultTranslationText) {
        // Start with the fallbackLanguage with index 0
        return resolveForFallbackLanguage((startFallbackIteration>0 ? startFallbackIteration : fallbackIndex), translationId, interpolateParams, Interpolator, defaultTranslationText);
      };

      /**
       * Translates with the usage of the fallback languages.
       *
       * @param translationId
       * @param interpolateParams
       * @param Interpolator
       * @returns {String} translation
       */
      var fallbackTranslationInstant = function (translationId, interpolateParams, Interpolator) {
        // Start with the fallbackLanguage with index 0
        return resolveForFallbackLanguageInstant((startFallbackIteration>0 ? startFallbackIteration : fallbackIndex), translationId, interpolateParams, Interpolator);
      };

      var determineTranslation = function (translationId, interpolateParams, interpolationId, defaultTranslationText) {

        var deferred = $q.defer();

        var table = $uses ? $translationTable[$uses] : $translationTable,
            Interpolator = (interpolationId) ? interpolatorHashMap[interpolationId] : defaultInterpolator;

        // if the translation id exists, we can just interpolate it
        if (table && Object.prototype.hasOwnProperty.call(table, translationId)) {
          var translation = table[translationId];

          // If using link, rerun $translate with linked translationId and return it
          if (translation.substr(0, 2) === '@:') {

            $translate(translation.substr(2), interpolateParams, interpolationId, defaultTranslationText)
              .then(deferred.resolve, deferred.reject);
          } else {
            deferred.resolve(Interpolator.interpolate(translation, interpolateParams));
          }
        } else {
          var missingTranslationHandlerTranslation;
          // for logging purposes only (as in $translateMissingTranslationHandlerLog), value is not returned to promise
          if ($missingTranslationHandlerFactory && !pendingLoader) {
            missingTranslationHandlerTranslation = translateByHandler(translationId);
          }

          // since we couldn't translate the inital requested translation id,
          // we try it now with one or more fallback languages, if fallback language(s) is
          // configured.
          if ($uses && $fallbackLanguage && $fallbackLanguage.length) {
            fallbackTranslation(translationId, interpolateParams, Interpolator, defaultTranslationText)
                .then(function (translation) {
                  deferred.resolve(translation);
                }, function (_translationId) {
                  deferred.reject(applyNotFoundIndicators(_translationId));
                });
          } else if ($missingTranslationHandlerFactory && !pendingLoader && missingTranslationHandlerTranslation) {
            // looks like the requested translation id doesn't exists.
            // Now, if there is a registered handler for missing translations and no
            // asyncLoader is pending, we execute the handler
            if (defaultTranslationText) {
              deferred.resolve(defaultTranslationText);
              } else {
                deferred.resolve(missingTranslationHandlerTranslation);
              }
          } else {
            if (defaultTranslationText) {
              deferred.resolve(defaultTranslationText);
            } else {
              deferred.reject(applyNotFoundIndicators(translationId));
            }
          }
        }
        return deferred.promise;
      };

      var determineTranslationInstant = function (translationId, interpolateParams, interpolationId) {

        var result, table = $uses ? $translationTable[$uses] : $translationTable,
            Interpolator = defaultInterpolator;

        // if the interpolation id exists use custom interpolator
        if (interpolatorHashMap && Object.prototype.hasOwnProperty.call(interpolatorHashMap, interpolationId)) {
          Interpolator = interpolatorHashMap[interpolationId];
        }

        // if the translation id exists, we can just interpolate it
        if (table && Object.prototype.hasOwnProperty.call(table, translationId)) {
          var translation = table[translationId];

          // If using link, rerun $translate with linked translationId and return it
          if (translation.substr(0, 2) === '@:') {
            result = determineTranslationInstant(translation.substr(2), interpolateParams, interpolationId);
          } else {
            result = Interpolator.interpolate(translation, interpolateParams);
          }
        } else {
          var missingTranslationHandlerTranslation;
          // for logging purposes only (as in $translateMissingTranslationHandlerLog), value is not returned to promise
          if ($missingTranslationHandlerFactory && !pendingLoader) {
            missingTranslationHandlerTranslation = translateByHandler(translationId);
          }

          // since we couldn't translate the inital requested translation id,
          // we try it now with one or more fallback languages, if fallback language(s) is
          // configured.
          if ($uses && $fallbackLanguage && $fallbackLanguage.length) {
            fallbackIndex = 0;
            result = fallbackTranslationInstant(translationId, interpolateParams, Interpolator);
          } else if ($missingTranslationHandlerFactory && !pendingLoader && missingTranslationHandlerTranslation) {
            // looks like the requested translation id doesn't exists.
            // Now, if there is a registered handler for missing translations and no
            // asyncLoader is pending, we execute the handler
            result = missingTranslationHandlerTranslation;
          } else {
            result = applyNotFoundIndicators(translationId);
          }
        }

        return result;
      };

      /**
       * @ngdoc function
       * @name pascalprecht.translate.$translate#preferredLanguage
       * @methodOf pascalprecht.translate.$translate
       *
       * @description
       * Returns the language key for the preferred language.
       *
       * @param {string} langKey language String or Array to be used as preferredLanguage (changing at runtime)
       *
       * @return {string} preferred language key
       */
      $translate.preferredLanguage = function (langKey) {
        if(langKey) {
          setupPreferredLanguage(langKey);
        }
        return $preferredLanguage;
      };

      /**
       * @ngdoc function
       * @name pascalprecht.translate.$translate#cloakClassName
       * @methodOf pascalprecht.translate.$translate
       *
       * @description
       * Returns the configured class name for `translate-cloak` directive.
       *
       * @return {string} cloakClassName
       */
      $translate.cloakClassName = function () {
        return $cloakClassName;
      };

      /**
       * @ngdoc function
       * @name pascalprecht.translate.$translate#fallbackLanguage
       * @methodOf pascalprecht.translate.$translate
       *
       * @description
       * Returns the language key for the fallback languages or sets a new fallback stack.
       *
       * @param {string=} langKey language String or Array of fallback languages to be used (to change stack at runtime)
       *
       * @return {string||array} fallback language key
       */
      $translate.fallbackLanguage = function (langKey) {
        if (langKey !== undefined && langKey !== null) {
          fallbackStack(langKey);

          // as we might have an async loader initiated and a new translation language might have been defined
          // we need to add the promise to the stack also. So - iterate.
          if ($loaderFactory) {
            if ($fallbackLanguage && $fallbackLanguage.length) {
              for (var i = 0, len = $fallbackLanguage.length; i < len; i++) {
                if (!langPromises[$fallbackLanguage[i]]) {
                  langPromises[$fallbackLanguage[i]] = loadAsync($fallbackLanguage[i]);
                }
              }
            }
          }
          $translate.use($translate.use());
        }
        if ($fallbackWasString) {
          return $fallbackLanguage[0];
        } else {
          return $fallbackLanguage;
        }

      };

      /**
       * @ngdoc function
       * @name pascalprecht.translate.$translate#useFallbackLanguage
       * @methodOf pascalprecht.translate.$translate
       *
       * @description
       * Sets the first key of the fallback language stack to be used for translation.
       * Therefore all languages in the fallback array BEFORE this key will be skipped!
       *
       * @param {string=} langKey Contains the langKey the iteration shall start with. Set to false if you want to
       * get back to the whole stack
       */
      $translate.useFallbackLanguage = function (langKey) {
        if (langKey !== undefined && langKey !== null) {
          if (!langKey) {
            startFallbackIteration = 0;
          } else {
            var langKeyPosition = indexOf($fallbackLanguage, langKey);
            if (langKeyPosition > -1) {
              startFallbackIteration = langKeyPosition;
            }
          }

        }

      };

      /**
       * @ngdoc function
       * @name pascalprecht.translate.$translate#proposedLanguage
       * @methodOf pascalprecht.translate.$translate
       *
       * @description
       * Returns the language key of language that is currently loaded asynchronously.
       *
       * @return {string} language key
       */
      $translate.proposedLanguage = function () {
        return $nextLang;
      };

      /**
       * @ngdoc function
       * @name pascalprecht.translate.$translate#storage
       * @methodOf pascalprecht.translate.$translate
       *
       * @description
       * Returns registered storage.
       *
       * @return {object} Storage
       */
      $translate.storage = function () {
        return Storage;
      };

      /**
       * @ngdoc function
       * @name pascalprecht.translate.$translate#use
       * @methodOf pascalprecht.translate.$translate
       *
       * @description
       * Tells angular-translate which language to use by given language key. This method is
       * used to change language at runtime. It also takes care of storing the language
       * key in a configured store to let your app remember the choosed language.
       *
       * When trying to 'use' a language which isn't available it tries to load it
       * asynchronously with registered loaders.
       *
       * Returns promise object with loaded language file data
       * @example
       * $translate.use("en_US").then(function(data){
       *   $scope.text = $translate("HELLO");
       * });
       *
       * @param {string} key Language key
       * @return {string} Language key
       */
      $translate.use = function (key) {
        if (!key) {
          return $uses;
        }

        var deferred = $q.defer();

        $rootScope.$emit('$translateChangeStart', {language: key});

        // Try to get the aliased language key
        var aliasedKey = negotiateLocale(key);
        if (aliasedKey) {
          key = aliasedKey;
        }

        // if there isn't a translation table for the language we've requested,
        // we load it asynchronously
        if (!$translationTable[key] && $loaderFactory && !langPromises[key]) {
          $nextLang = key;
          langPromises[key] = loadAsync(key).then(function (translation) {
            translations(translation.key, translation.table);
            deferred.resolve(translation.key);

            useLanguage(translation.key);
            if ($nextLang === key) {
              $nextLang = undefined;
            }
            return translation;
          }, function (key) {
            if ($nextLang === key) {
              $nextLang = undefined;
            }
            $rootScope.$emit('$translateChangeError', {language: key});
            deferred.reject(key);
            $rootScope.$emit('$translateChangeEnd', {language: key});
          });
        } else {
          deferred.resolve(key);
          useLanguage(key);
        }

        return deferred.promise;
      };

      /**
       * @ngdoc function
       * @name pascalprecht.translate.$translate#storageKey
       * @methodOf pascalprecht.translate.$translate
       *
       * @description
       * Returns the key for the storage.
       *
       * @return {string} storage key
       */
      $translate.storageKey = function () {
        return storageKey();
      };

      /**
       * @ngdoc function
       * @name pascalprecht.translate.$translate#isPostCompilingEnabled
       * @methodOf pascalprecht.translate.$translate
       *
       * @description
       * Returns whether post compiling is enabled or not
       *
       * @return {bool} storage key
       */
      $translate.isPostCompilingEnabled = function () {
        return $postCompilingEnabled;
      };

      /**
       * @ngdoc function
       * @name pascalprecht.translate.$translate#refresh
       * @methodOf pascalprecht.translate.$translate
       *
       * @description
       * Refreshes a translation table pointed by the given langKey. If langKey is not specified,
       * the module will drop all existent translation tables and load new version of those which
       * are currently in use.
       *
       * Refresh means that the module will drop target translation table and try to load it again.
       *
       * In case there are no loaders registered the refresh() method will throw an Error.
       *
       * If the module is able to refresh translation tables refresh() method will broadcast
       * $translateRefreshStart and $translateRefreshEnd events.
       *
       * @example
       * // this will drop all currently existent translation tables and reload those which are
       * // currently in use
       * $translate.refresh();
       * // this will refresh a translation table for the en_US language
       * $translate.refresh('en_US');
       *
       * @param {string} langKey A language key of the table, which has to be refreshed
       *
       * @return {promise} Promise, which will be resolved in case a translation tables refreshing
       * process is finished successfully, and reject if not.
       */
      $translate.refresh = function (langKey) {
        if (!$loaderFactory) {
          throw new Error('Couldn\'t refresh translation table, no loader registered!');
        }

        var deferred = $q.defer();

        function resolve() {
          deferred.resolve();
          $rootScope.$emit('$translateRefreshEnd', {language: langKey});
        }

        function reject() {
          deferred.reject();
          $rootScope.$emit('$translateRefreshEnd', {language: langKey});
        }

        $rootScope.$emit('$translateRefreshStart', {language: langKey});

        if (!langKey) {
          // if there's no language key specified we refresh ALL THE THINGS!
          var tables = [], loadingKeys = {};

          // reload registered fallback languages
          if ($fallbackLanguage && $fallbackLanguage.length) {
            for (var i = 0, len = $fallbackLanguage.length; i < len; i++) {
              tables.push(loadAsync($fallbackLanguage[i]));
              loadingKeys[$fallbackLanguage[i]] = true;
            }
          }

          // reload currently used language
          if ($uses && !loadingKeys[$uses]) {
            tables.push(loadAsync($uses));
          }

          $q.all(tables).then(function (tableData) {
            angular.forEach(tableData, function (data) {
              if ($translationTable[data.key]) {
                delete $translationTable[data.key];
              }
              translations(data.key, data.table);
            });
            if ($uses) {
              useLanguage($uses);
            }
            resolve();
          });

        } else if ($translationTable[langKey]) {

          loadAsync(langKey).then(function (data) {
            translations(data.key, data.table);
            if (langKey === $uses) {
              useLanguage($uses);
            }
            resolve();
          }, reject);

        } else {
          reject();
        }
        return deferred.promise;
      };

      /**
       * @ngdoc function
       * @name pascalprecht.translate.$translate#instant
       * @methodOf pascalprecht.translate.$translate
       *
       * @description
       * Returns a translation instantly from the internal state of loaded translation. All rules
       * regarding the current language, the preferred language of even fallback languages will be
       * used except any promise handling. If a language was not found, an asynchronous loading
       * will be invoked in the background.
       *
       * @param {string|array} translationId A token which represents a translation id
       *                                     This can be optionally an array of translation ids which
       *                                     results that the function's promise returns an object where
       *                                     each key is the translation id and the value the translation.
       * @param {object} interpolateParams Params
       * @param {string} interpolationId The id of the interpolation to use
       *
       * @return {string} translation
       */
      $translate.instant = function (translationId, interpolateParams, interpolationId) {

        // Detect undefined and null values to shorten the execution and prevent exceptions
        if (translationId === null || angular.isUndefined(translationId)) {
          return translationId;
        }

        // Duck detection: If the first argument is an array, a bunch of translations was requested.
        // The result is an object.
        if (angular.isArray(translationId)) {
          var results = {};
          for (var i = 0, c = translationId.length; i < c; i++) {
            results[translationId[i]] = $translate.instant(translationId[i], interpolateParams, interpolationId);
          }
          return results;
        }

        // We discarded unacceptable values. So we just need to verify if translationId is empty String
        if (angular.isString(translationId) && translationId.length < 1) {
          return translationId;
        }

        // trim off any whitespace
        if (translationId) {
          translationId = trim.apply(translationId);
        }

        var result, possibleLangKeys = [];
        if ($preferredLanguage) {
          possibleLangKeys.push($preferredLanguage);
        }
        if ($uses) {
          possibleLangKeys.push($uses);
        }
        if ($fallbackLanguage && $fallbackLanguage.length) {
          possibleLangKeys = possibleLangKeys.concat($fallbackLanguage);
        }
        for (var j = 0, d = possibleLangKeys.length; j < d; j++) {
          var possibleLangKey = possibleLangKeys[j];
          if ($translationTable[possibleLangKey]) {
            if (typeof $translationTable[possibleLangKey][translationId] !== 'undefined') {
              result = determineTranslationInstant(translationId, interpolateParams, interpolationId);
            } else if ($notFoundIndicatorLeft || $notFoundIndicatorRight) {
              result = applyNotFoundIndicators(translationId);
            }
          }
          if (typeof result !== 'undefined') {
            break;
          }
        }

        if (!result && result !== '') {
          // Return translation of default interpolator if not found anything.
          result = defaultInterpolator.interpolate(translationId, interpolateParams);
          if ($missingTranslationHandlerFactory && !pendingLoader) {
            result = translateByHandler(translationId);
          }
        }

        return result;
      };

      /**
       * @ngdoc function
       * @name pascalprecht.translate.$translate#versionInfo
       * @methodOf pascalprecht.translate.$translate
       *
       * @description
       * Returns the current version information for the angular-translate library
       *
       * @return {string} angular-translate version
       */
      $translate.versionInfo = function () {
        return version;
      };

      /**
       * @ngdoc function
       * @name pascalprecht.translate.$translate#loaderCache
       * @methodOf pascalprecht.translate.$translate
       *
       * @description
       * Returns the defined loaderCache.
       *
       * @return {boolean|string|object} current value of loaderCache
       */
      $translate.loaderCache = function () {
        return loaderCache;
      };

      // internal purpose only
      $translate.directivePriority = function () {
        return directivePriority;
      };

      if ($loaderFactory) {

        // If at least one async loader is defined and there are no
        // (default) translations available we should try to load them.
        if (angular.equals($translationTable, {})) {
          $translate.use($translate.use());
        }

        // Also, if there are any fallback language registered, we start
        // loading them asynchronously as soon as we can.
        if ($fallbackLanguage && $fallbackLanguage.length) {
          var processAsyncResult = function (translation) {
            translations(translation.key, translation.table);
            $rootScope.$emit('$translateChangeEnd', { language: translation.key });
            return translation;
          };
          for (var i = 0, len = $fallbackLanguage.length; i < len; i++) {
            langPromises[$fallbackLanguage[i]] = loadAsync($fallbackLanguage[i]).then(processAsyncResult);
          }
        }
      }

      return $translate;
    }
  ];
}]);

/**
 * @ngdoc object
 * @name pascalprecht.translate.$translateDefaultInterpolation
 * @requires $interpolate
 *
 * @description
 * Uses angular's `$interpolate` services to interpolate strings against some values.
 *
 * @return {object} $translateInterpolator Interpolator service
 */
angular.module('pascalprecht.translate').factory('$translateDefaultInterpolation', ['$interpolate', function ($interpolate) {

  var $translateInterpolator = {},
      $locale,
      $identifier = 'default',
      $sanitizeValueStrategy = null,
      // map of all sanitize strategies
      sanitizeValueStrategies = {
        escaped: function (params) {
          var result = {};
          for (var key in params) {
            if (Object.prototype.hasOwnProperty.call(params, key)) {
              if (angular.isNumber(params[key])) {
                result[key] = params[key];
              } else {
                result[key] = angular.element('<div></div>').text(params[key]).html();
              }
            }
          }
          return result;
        }
      };

  var sanitizeParams = function (params) {
    var result;
    if (angular.isFunction(sanitizeValueStrategies[$sanitizeValueStrategy])) {
      result = sanitizeValueStrategies[$sanitizeValueStrategy](params);
    } else {
      result = params;
    }
    return result;
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateDefaultInterpolation#setLocale
   * @methodOf pascalprecht.translate.$translateDefaultInterpolation
   *
   * @description
   * Sets current locale (this is currently not use in this interpolation).
   *
   * @param {string} locale Language key or locale.
   */
  $translateInterpolator.setLocale = function (locale) {
    $locale = locale;
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateDefaultInterpolation#getInterpolationIdentifier
   * @methodOf pascalprecht.translate.$translateDefaultInterpolation
   *
   * @description
   * Returns an identifier for this interpolation service.
   *
   * @returns {string} $identifier
   */
  $translateInterpolator.getInterpolationIdentifier = function () {
    return $identifier;
  };

  $translateInterpolator.useSanitizeValueStrategy = function (value) {
    $sanitizeValueStrategy = value;
    return this;
  };

  /**
   * @ngdoc function
   * @name pascalprecht.translate.$translateDefaultInterpolation#interpolate
   * @methodOf pascalprecht.translate.$translateDefaultInterpolation
   *
   * @description
   * Interpolates given string agains given interpolate params using angulars
   * `$interpolate` service.
   *
   * @returns {string} interpolated string.
   */
  $translateInterpolator.interpolate = function (string, interpolateParams) {
    if ($sanitizeValueStrategy) {
      interpolateParams = sanitizeParams(interpolateParams);
    }
    return $interpolate(string)(interpolateParams || {});
  };

  return $translateInterpolator;
}]);

angular.module('pascalprecht.translate').constant('$STORAGE_KEY', 'NG_TRANSLATE_LANG_KEY');

angular.module('pascalprecht.translate')
/**
 * @ngdoc directive
 * @name pascalprecht.translate.directive:translate
 * @requires $compile
 * @requires $filter
 * @requires $interpolate
 * @restrict A
 *
 * @description
 * Translates given translation id either through attribute or DOM content.
 * Internally it uses `translate` filter to translate translation id. It possible to
 * pass an optional `translate-values` object literal as string into translation id.
 *
 * @param {string=} translate Translation id which could be either string or interpolated string.
 * @param {string=} translate-values Values to pass into translation id. Can be passed as object literal string or interpolated object.
 * @param {string=} translate-attr-ATTR translate Translation id and put it into ATTR attribute.
 * @param {string=} translate-default will be used unless translation was successful
 * @param {boolean=} translate-compile (default true if present) defines locally activation of {@link pascalprecht.translate.$translate#usePostCompiling}
 *
 * @example
   <example module="ngView">
    <file name="index.html">
      <div ng-controller="TranslateCtrl">

        <pre translate="TRANSLATION_ID"></pre>
        <pre translate>TRANSLATION_ID</pre>
        <pre translate translate-attr-title="TRANSLATION_ID"></pre>
        <pre translate="{{translationId}}"></pre>
        <pre translate>{{translationId}}</pre>
        <pre translate="WITH_VALUES" translate-values="{value: 5}"></pre>
        <pre translate translate-values="{value: 5}">WITH_VALUES</pre>
        <pre translate="WITH_VALUES" translate-values="{{values}}"></pre>
        <pre translate translate-values="{{values}}">WITH_VALUES</pre>
        <pre translate translate-attr-title="WITH_VALUES" translate-values="{{values}}"></pre>

      </div>
    </file>
    <file name="script.js">
      angular.module('ngView', ['pascalprecht.translate'])

      .config(function ($translateProvider) {

        $translateProvider.translations('en',{
          'TRANSLATION_ID': 'Hello there!',
          'WITH_VALUES': 'The following value is dynamic: {{value}}'
        }).preferredLanguage('en');

      });

      angular.module('ngView').controller('TranslateCtrl', function ($scope) {
        $scope.translationId = 'TRANSLATION_ID';

        $scope.values = {
          value: 78
        };
      });
    </file>
    <file name="scenario.js">
      it('should translate', function () {
        inject(function ($rootScope, $compile) {
          $rootScope.translationId = 'TRANSLATION_ID';

          element = $compile('<p translate="TRANSLATION_ID"></p>')($rootScope);
          $rootScope.$digest();
          expect(element.text()).toBe('Hello there!');

          element = $compile('<p translate="{{translationId}}"></p>')($rootScope);
          $rootScope.$digest();
          expect(element.text()).toBe('Hello there!');

          element = $compile('<p translate>TRANSLATION_ID</p>')($rootScope);
          $rootScope.$digest();
          expect(element.text()).toBe('Hello there!');

          element = $compile('<p translate>{{translationId}}</p>')($rootScope);
          $rootScope.$digest();
          expect(element.text()).toBe('Hello there!');

          element = $compile('<p translate translate-attr-title="TRANSLATION_ID"></p>')($rootScope);
          $rootScope.$digest();
          expect(element.attr('title')).toBe('Hello there!');
        });
      });
    </file>
   </example>
 */
.directive('translate', ['$translate', '$q', '$interpolate', '$compile', '$parse', '$rootScope', function ($translate, $q, $interpolate, $compile, $parse, $rootScope) {

  /**
   * @name trim
   * @private
   *
   * @description
   * trim polyfill
   *
   * @returns {string} The string stripped of whitespace from both ends
   */
  var trim = function() {
    return this.replace(/^\s+|\s+$/g, '');
  };

  return {
    restrict: 'AE',
    scope: true,
    priority: $translate.directivePriority(),
    compile: function (tElement, tAttr) {

      var translateValuesExist = (tAttr.translateValues) ?
        tAttr.translateValues : undefined;

      var translateInterpolation = (tAttr.translateInterpolation) ?
        tAttr.translateInterpolation : undefined;

      var translateValueExist = tElement[0].outerHTML.match(/translate-value-+/i);

      var interpolateRegExp = '^(.*)(' + $interpolate.startSymbol() + '.*' + $interpolate.endSymbol() + ')(.*)',
          watcherRegExp = '^(.*)' + $interpolate.startSymbol() + '(.*)' + $interpolate.endSymbol() + '(.*)';

      return function linkFn(scope, iElement, iAttr) {

        scope.interpolateParams = {};
        scope.preText = '';
        scope.postText = '';
        var translationIds = {};

        // Ensures any change of the attribute "translate" containing the id will
        // be re-stored to the scope's "translationId".
        // If the attribute has no content, the element's text value (white spaces trimmed off) will be used.
        var observeElementTranslation = function (translationId) {

          // Remove any old watcher
          if (angular.isFunction(observeElementTranslation._unwatchOld)) {
            observeElementTranslation._unwatchOld();
            observeElementTranslation._unwatchOld = undefined;
          }

          if (angular.equals(translationId , '') || !angular.isDefined(translationId)) {
            // Resolve translation id by inner html if required
            var interpolateMatches = trim.apply(iElement.text()).match(interpolateRegExp);
            // Interpolate translation id if required
            if (angular.isArray(interpolateMatches)) {
              scope.preText = interpolateMatches[1];
              scope.postText = interpolateMatches[3];
              translationIds.translate = $interpolate(interpolateMatches[2])(scope.$parent);
              var watcherMatches = iElement.text().match(watcherRegExp);
              if (angular.isArray(watcherMatches) && watcherMatches[2] && watcherMatches[2].length) {
                observeElementTranslation._unwatchOld = scope.$watch(watcherMatches[2], function (newValue) {
                  translationIds.translate = newValue;
                  updateTranslations();
                });
              }
            } else {
              translationIds.translate = iElement.text().replace(/^\s+|\s+$/g,'');
            }
          } else {
            translationIds.translate = translationId;
          }
          updateTranslations();
        };

        var observeAttributeTranslation = function (translateAttr) {
          iAttr.$observe(translateAttr, function (translationId) {
            translationIds[translateAttr] = translationId;
            updateTranslations();
          });
        };

        var firstAttributeChangedEvent = true;
        iAttr.$observe('translate', function (translationId) {
          if (typeof translationId === 'undefined') {
            // case of element "<translate>xyz</translate>"
            observeElementTranslation('');
          } else {
            // case of regular attribute
            if (translationId !== '' || !firstAttributeChangedEvent) {
              translationIds.translate = translationId;
              updateTranslations();
            }
          }
          firstAttributeChangedEvent = false;
        });

        for (var translateAttr in iAttr) {
          if (iAttr.hasOwnProperty(translateAttr) && translateAttr.substr(0, 13) === 'translateAttr') {
            observeAttributeTranslation(translateAttr);
          }
        }

        iAttr.$observe('translateDefault', function (value) {
          scope.defaultText = value;
        });

        if (translateValuesExist) {
          iAttr.$observe('translateValues', function (interpolateParams) {
            if (interpolateParams) {
              scope.$parent.$watch(function () {
                angular.extend(scope.interpolateParams, $parse(interpolateParams)(scope.$parent));
              });
            }
          });
        }

        if (translateValueExist) {
          var observeValueAttribute = function (attrName) {
            iAttr.$observe(attrName, function (value) {
              var attributeName = angular.lowercase(attrName.substr(14, 1)) + attrName.substr(15);
              scope.interpolateParams[attributeName] = value;
            });
          };
          for (var attr in iAttr) {
            if (Object.prototype.hasOwnProperty.call(iAttr, attr) && attr.substr(0, 14) === 'translateValue' && attr !== 'translateValues') {
              observeValueAttribute(attr);
            }
          }
        }

        // Master update function
        var updateTranslations = function () {
          for (var key in translationIds) {
            if (translationIds.hasOwnProperty(key)) {
              updateTranslation(key, translationIds[key], scope, scope.interpolateParams, scope.defaultText);
            }
          }
        };

        // Put translation processing function outside loop
        var updateTranslation = function(translateAttr, translationId, scope, interpolateParams, defaultTranslationText) {
          if (translationId) {
            $translate(translationId, interpolateParams, translateInterpolation, defaultTranslationText)
              .then(function (translation) {
                applyTranslation(translation, scope, true, translateAttr);
              }, function (translationId) {
                applyTranslation(translationId, scope, false, translateAttr);
              });
          } else {
            // as an empty string cannot be translated, we can solve this using successful=false
            applyTranslation(translationId, scope, false, translateAttr);
          }
        };

        var applyTranslation = function (value, scope, successful, translateAttr) {
          if (translateAttr === 'translate') {
            // default translate into innerHTML
            if (!successful && typeof scope.defaultText !== 'undefined') {
              value = scope.defaultText;
            }
            iElement.html(scope.preText + value + scope.postText);
            var globallyEnabled = $translate.isPostCompilingEnabled();
            var locallyDefined = typeof tAttr.translateCompile !== 'undefined';
            var locallyEnabled = locallyDefined && tAttr.translateCompile !== 'false';
            if ((globallyEnabled && !locallyDefined) || locallyEnabled) {
              $compile(iElement.contents())(scope);
            }
          } else {
            // translate attribute
            if (!successful && typeof scope.defaultText !== 'undefined') {
              value = scope.defaultText;
            }
            var attributeName = iAttr.$attr[translateAttr].substr(15);
            iElement.attr(attributeName, value);
          }
        };

        scope.$watch('interpolateParams', updateTranslations, true);

        // Ensures the text will be refreshed after the current language was changed
        // w/ $translate.use(...)
        var unbind = $rootScope.$on('$translateChangeSuccess', updateTranslations);

        // ensure translation will be looked up at least one
        if (iElement.text().length) {
          observeElementTranslation('');
        }
        updateTranslations();
        scope.$on('$destroy', unbind);
      };
    }
  };
}]);

angular.module('pascalprecht.translate')
/**
 * @ngdoc directive
 * @name pascalprecht.translate.directive:translateCloak
 * @requires $rootScope
 * @requires $translate
 * @restrict A
 *
 * $description
 * Adds a `translate-cloak` class name to the given element where this directive
 * is applied initially and removes it, once a loader has finished loading.
 *
 * This directive can be used to prevent initial flickering when loading translation
 * data asynchronously.
 *
 * The class name is defined in
 * {@link pascalprecht.translate.$translateProvider#cloakClassName $translate.cloakClassName()}.
 *
 * @param {string=} translate-cloak If a translationId is provided, it will be used for showing
 *                                  or hiding the cloak. Basically it relies on the translation
 *                                  resolve.
 */
.directive('translateCloak', ['$rootScope', '$translate', function ($rootScope, $translate) {

  return {
    compile: function (tElement) {
      var applyCloak = function () {
        tElement.addClass($translate.cloakClassName());
      },
      removeCloak = function () {
        tElement.removeClass($translate.cloakClassName());
      },
      removeListener = $rootScope.$on('$translateChangeEnd', function () {
        removeCloak();
        removeListener();
        removeListener = null;
      });
      applyCloak();

      return function linkFn(scope, iElement, iAttr) {
        // Register a watcher for the defined translation allowing a fine tuned cloak
        if (iAttr.translateCloak && iAttr.translateCloak.length) {
          iAttr.$observe('translateCloak', function (translationId) {
            $translate(translationId).then(removeCloak, applyCloak);
          });
        }
      };
    }
  };
}]);

angular.module('pascalprecht.translate')
/**
 * @ngdoc filter
 * @name pascalprecht.translate.filter:translate
 * @requires $parse
 * @requires pascalprecht.translate.$translate
 * @function
 *
 * @description
 * Uses `$translate` service to translate contents. Accepts interpolate parameters
 * to pass dynamized values though translation.
 *
 * @param {string} translationId A translation id to be translated.
 * @param {*=} interpolateParams Optional object literal (as hash or string) to pass values into translation.
 *
 * @returns {string} Translated text.
 *
 * @example
   <example module="ngView">
    <file name="index.html">
      <div ng-controller="TranslateCtrl">

        <pre>{{ 'TRANSLATION_ID' | translate }}</pre>
        <pre>{{ translationId | translate }}</pre>
        <pre>{{ 'WITH_VALUES' | translate:'{value: 5}' }}</pre>
        <pre>{{ 'WITH_VALUES' | translate:values }}</pre>

      </div>
    </file>
    <file name="script.js">
      angular.module('ngView', ['pascalprecht.translate'])

      .config(function ($translateProvider) {

        $translateProvider.translations('en', {
          'TRANSLATION_ID': 'Hello there!',
          'WITH_VALUES': 'The following value is dynamic: {{value}}'
        });
        $translateProvider.preferredLanguage('en');

      });

      angular.module('ngView').controller('TranslateCtrl', function ($scope) {
        $scope.translationId = 'TRANSLATION_ID';

        $scope.values = {
          value: 78
        };
      });
    </file>
   </example>
 */
.filter('translate', ['$parse', '$translate', function ($parse, $translate) {
  var translateFilter = function (translationId, interpolateParams, interpolation) {

    if (!angular.isObject(interpolateParams)) {
      interpolateParams = $parse(interpolateParams)(this);
    }

    return $translate.instant(translationId, interpolateParams, interpolation);
  };

  // Since AngularJS 1.3, filters which are not stateless (depending at the scope)
  // have to explicit define this behavior.
  translateFilter.$stateful = true;

  return translateFilter;
}]);

},{}],"/Users/Jimmy/code/hull/hull-instant/node_modules/objectpath/index.js":[function(require,module,exports){
module.exports = require('./lib/ObjectPath.js').ObjectPath;

},{"./lib/ObjectPath.js":"/Users/Jimmy/code/hull/hull-instant/node_modules/objectpath/lib/ObjectPath.js"}],"/Users/Jimmy/code/hull/hull-instant/node_modules/objectpath/lib/ObjectPath.js":[function(require,module,exports){
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
		},

		// Angular
		registerModule: function(angular) {
			angular.module('ObjectPath', []).provider('ObjectPath', function(){
				this.parse = ObjectPath.parse;
				this.stringify = ObjectPath.stringify;
				this.normalize = ObjectPath.normalize;
				this.$get = function(){
					return ObjectPath;
				};
			});
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

	// Browser global
	else {
		window.ObjectPath = ObjectPath;
	}
	
}();
},{}],"/Users/Jimmy/code/hull/hull-instant/node_modules/tv4/tv4.js":[function(require,module,exports){
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
	if (Array.isArray(schema)) {
		for (var i = 0; i < schema.length; i++) {
			this.searchSchemas(schema[i], url);
		}
	} else if (schema && typeof schema === "object") {
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
ValidatorContext.prototype.validateDefinedKeywords = function (data, schema, dataPointerPath) {
	for (var key in this.definedKeywords) {
		if (typeof schema[key] === 'undefined') {
			continue;
		}
		var validationFunctions = this.definedKeywords[key];
		for (var i = 0; i < validationFunctions.length; i++) {
			var func = validationFunctions[i];
			var result = func(data, schema[key], schema, dataPointerPath);
			if (typeof result === 'string' || typeof result === 'number') {
				return this.createError(ErrorCodes.KEYWORD_CUSTOM, {key: key, message: result}).prefixWith(null, "format");
			} else if (result && typeof result === 'object') {
				var code = result.code;
				if (typeof code === 'string') {
					if (!ErrorCodes[code]) {
						throw new Error('Undefined error code (use defineError): ' + code);
					}
					code = ErrorCodes[code];
				} else if (typeof code !== 'number') {
					code = ErrorCodes.KEYWORD_CUSTOM;
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

var CLOSE_ENOUGH_LOW = Math.pow(2, -51);
var CLOSE_ENOUGH_HIGH = 1 - CLOSE_ENOUGH_LOW;
ValidatorContext.prototype.validateMultipleOf = function validateMultipleOf(data, schema) {
	var multipleOf = schema.multipleOf || schema.divisibleBy;
	if (multipleOf === undefined) {
		return null;
	}
	if (typeof data === "number") {
		var remainder = (data/multipleOf)%1;
		if (remainder >= CLOSE_ENOUGH_LOW && remainder < CLOSE_ENOUGH_HIGH) {
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
},{}],"/Users/Jimmy/code/hull/hull-instant/src/javascript/instant.js":[function(require,module,exports){
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
      achievement: ship.resources.instant_win,
      translations: ship.translations,
      user: user,
      badge: (ship.resources.instant_win && ship.resources.instant_win.badge)
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

  function processFormData(formData) {
    var fields = AppState.form.fields_list;
    var ret = fields.reduce(function(data, field) {
      var val = formData[field.name];
      if (val.toString().length > 0) {
        switch (field.field_type) {
          case 'date':
            res = new Date(val).toISOString().substring(0,10);
            break;
          default:
            res = formData[field.name];
        }
        data[field.name] = res;
      }
      return data;
    }, {});
    return ret;
  }

  function submitForm(formData) {
    var data = processFormData(formData);
    emitChange({ changed: 'loading', loading: 'form' });
    Hull.api(AppState.form.id + "/submit", { data: data }, 'put').then(function(form) {
      AppState.form = form;
      emitChange({ changed: 'form' });
    }, function(err) {
      emitChange({ error_message: 'invalid_form', error: err });
    });
  }

  function play(provider) {
    if (userCanPlay()) {
      emitChange({ changed: 'loading', loading: 'badge' });
      return Hull.api(AppState.achievement.id + "/achieve", 'post').then(function(badge) {
        AppState.badge = badge;
        emitChange({ changed: 'badge' });
      }, function(err) {
        emitChange({ error_message: 'error_on_achieve', error: err });
      });
    } else if (provider && !AppState.user) {
      loginAndPlay(provider);
    } else {
      emitChange({ error_message: 'user_cannot_play' });
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
          emitChange({ error_message: 'error_deleting_badge', error: err });
        });
      } else {
        emitChange({ changed: 'reset' });
        throw "[InstantWin] No badge found here...";
      }
    } else {
      throw "[InstantWin] You need to be a administrator to reset badges";
    }
  }

  function translate(lang) {
    var ret = AppState.translations[lang] || AppState.translations['en'] || {};
    var result = Object.keys(ret).reduce(function(tr, k) {
      var t = ret[k];
      if (t && t.length > 0) {
        tr[k] = t;
      }
      return tr;
    }, {});
    return result;
  }

  function onAuthEvent() {
    emitChange({ changed: 'loading', loading: 'ship' });
    Hull.api(Ship.id, { fields: 'badge' }).then(function(ship) {
      initState(Hull.currentUser(), ship);
      if (autoPlay && userCanPlay()) play();
      autoPlay = false;
    }, function(err) {
      emitChange({ error_message: 'ship_not_found', error: err });
    });
  }

  Hull.on('hull.user.update', onAuthEvent);
  Hull.on('hull.user.login', onAuthEvent);
  Hull.on('hull.user.logout', onAuthEvent);
  Hull.on('hull.user.fail', onAuthEvent);

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
    Hull.off('hull.user.update', onAuthEvent);
    Hull.off('hull.user.login', onAuthEvent);
    Hull.off('hull.user.logout', onAuthEvent);
    Hull.off('hull.user.fail', onAuthEvent);
    for (var l = 0; l < _listeners.length; l++) {
      Hull.off(CHANGE_EVENT, listeners[l]);
    }
  };

  this.getState = function() {
    return getAppState();
  };

  this.play = play;
  this.reset = reset;
  this.submitForm = submitForm;
  this.translate = translate;

  if (Ship) {
    initState(CurrentUser, Ship);
  }

  window.addEventListener("message", function(e) {
    var message = e.data;
    if (message && message.event === "ship.update") {
      updateSettings(message.ship.settings);
      updateTranslations(message.ship.translations || {});
    }
  }, false);
};

InstantWin.Steps = Steps;

module.exports = InstantWin;

},{"./util":"/Users/Jimmy/code/hull/hull-instant/src/javascript/util.js"}],"/Users/Jimmy/code/hull/hull-instant/src/javascript/schema-form/foundation-decorator-datepicker.js":[function(require,module,exports){
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

},{}],"/Users/Jimmy/code/hull/hull-instant/src/javascript/schema-form/foundation-decorator.js":[function(require,module,exports){
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

},{"./foundation-decorator-datepicker":"/Users/Jimmy/code/hull/hull-instant/src/javascript/schema-form/foundation-decorator-datepicker.js"}],"/Users/Jimmy/code/hull/hull-instant/src/javascript/util.js":[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvamF2YXNjcmlwdC9hcHAuanMiLCJub2RlX21vZHVsZXMvYW5ndWxhci1kYXRlcGlja2VyL2J1aWxkL2FuZ3VsYXItZGF0ZXBpY2tlci5qcyIsIm5vZGVfbW9kdWxlcy9hbmd1bGFyLXNjaGVtYS1mb3JtL2Rpc3Qvc2NoZW1hLWZvcm0uanMiLCJub2RlX21vZHVsZXMvYW5ndWxhci10cmFuc2xhdGUvZGlzdC9hbmd1bGFyLXRyYW5zbGF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9vYmplY3RwYXRoL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL29iamVjdHBhdGgvbGliL09iamVjdFBhdGguanMiLCJub2RlX21vZHVsZXMvdHY0L3R2NC5qcyIsInNyYy9qYXZhc2NyaXB0L2luc3RhbnQuanMiLCJzcmMvamF2YXNjcmlwdC9zY2hlbWEtZm9ybS9mb3VuZGF0aW9uLWRlY29yYXRvci1kYXRlcGlja2VyLmpzIiwic3JjL2phdmFzY3JpcHQvc2NoZW1hLWZvcm0vZm91bmRhdGlvbi1kZWNvcmF0b3IuanMiLCJzcmMvamF2YXNjcmlwdC91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3Q0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2ekVBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIEluc3RhbnRXaW4gPSByZXF1aXJlKCcuL2luc3RhbnQnKTtcbnZhciBTdGVwcyA9IEluc3RhbnRXaW4uU3RlcHM7XG52YXIgZGVmYXVsdFN0ZXAgPSBTdGVwc1swXTtcblxud2luZG93LnR2NCA9IHJlcXVpcmUoJ3R2NCcpO1xudmFyIE9iamVjdFBhdGggPSByZXF1aXJlKCdvYmplY3RwYXRoJyk7XG5cbnRyeSB7XG4gIGFuZ3VsYXIubW9kdWxlKCdPYmplY3RQYXRoJywgW10pLnByb3ZpZGVyKCdPYmplY3RQYXRoJywgZnVuY3Rpb24oKXtcbiAgICB0aGlzLnBhcnNlID0gT2JqZWN0UGF0aC5wYXJzZTtcbiAgICB0aGlzLnN0cmluZ2lmeSA9IE9iamVjdFBhdGguc3RyaW5naWZ5O1xuICAgIHRoaXMubm9ybWFsaXplID0gT2JqZWN0UGF0aC5ub3JtYWxpemU7XG4gICAgdGhpcy4kZ2V0ID0gZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBPYmplY3RQYXRoO1xuICAgIH07XG4gIH0pO1xufSBjYXRjaChlKSB7fVxuXG5yZXF1aXJlKCdhbmd1bGFyLXNjaGVtYS1mb3JtL2Rpc3Qvc2NoZW1hLWZvcm0nKTtcbnJlcXVpcmUoJy4vc2NoZW1hLWZvcm0vZm91bmRhdGlvbi1kZWNvcmF0b3InKTtcbnJlcXVpcmUoJy4vc2NoZW1hLWZvcm0vZm91bmRhdGlvbi1kZWNvcmF0b3ItZGF0ZXBpY2tlcicpO1xucmVxdWlyZSgnYW5ndWxhci1kYXRlcGlja2VyL2J1aWxkL2FuZ3VsYXItZGF0ZXBpY2tlcicpO1xucmVxdWlyZSgnYW5ndWxhci10cmFuc2xhdGUnKTtcblxudmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdodWxsLWluc3RhbnQnLCBbJ25nQW5pbWF0ZScsICdzY2hlbWFGb3JtJywgJ2FuZ3VsYXItZGF0ZXBpY2tlcicsICdwYXNjYWxwcmVjaHQudHJhbnNsYXRlJ10pXG5cbi5jb25maWcoW1wiJHRyYW5zbGF0ZVByb3ZpZGVyXCIsIGZ1bmN0aW9uICgkdHJhbnNsYXRlUHJvdmlkZXIpIHtcbiAgJHRyYW5zbGF0ZVByb3ZpZGVyLnVzZUxvYWRlcihcIiR0cmFuc2xhdGVTaGlwTG9hZGVyXCIpO1xuICAkdHJhbnNsYXRlUHJvdmlkZXIucHJlZmVycmVkTGFuZ3VhZ2UoXCJlblwiKTtcbn1dKVxuXG4uZmFjdG9yeShcIiRpbnN0YW50XCIsIFtcIiRodWxsSW5pdFwiLCBmdW5jdGlvbigkaHVsbEluaXQpIHtcbiAgdmFyIGluc3RhbnQgPSBuZXcgSW5zdGFudFdpbigkaHVsbEluaXQudXNlciwgJGh1bGxJbml0LnNoaXApO1xuICB3aW5kb3cuJGluc3RhbnQgPSBpbnN0YW50O1xuICByZXR1cm4gaW5zdGFudDtcbn1dKVxuXG4uZmFjdG9yeShcIiR0cmFuc2xhdGVTaGlwTG9hZGVyXCIsIFtcIiRxXCIsIFwiJGluc3RhbnRcIiwgZnVuY3Rpb24gKCRxLCAkaW5zdGFudCkge1xuICByZXR1cm4gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgIGRlZmVycmVkLnJlc29sdmUoJGluc3RhbnQudHJhbnNsYXRlKG9wdGlvbnMua2V5KSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG59XSlcblxuLmZhY3RvcnkoJyRodWxsQ29uZmlnJywgWyckaHVsbEluaXQnLCBmdW5jdGlvbigkaHVsbEluaXQpIHtcbiAgZnVuY3Rpb24gZ2V0QXV0aFNlcnZpY2VzKCkge1xuICAgIHZhciBhdXRoID0gSHVsbC5jb25maWcoJ3NlcnZpY2VzJykuYXV0aCB8fCB7fTtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoYXV0aCkuZmlsdGVyKGZ1bmN0aW9uKHMpIHsgcmV0dXJuIHMgIT09ICdodWxsJzsgfSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGdldEF1dGhTZXJ2aWNlczogZ2V0QXV0aFNlcnZpY2VzXG4gIH07XG59XSlcblxuLmRpcmVjdGl2ZShcInByb2dyZXNzXCIsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6IFwiQVwiLFxuICAgIHNjb3BlOiB7IHN0ZXA6IFwiPVwiLCBzdGVwczogXCI9XCIsIHN0ZXBJbmRleDogXCI9XCIgfSxcbiAgICB0ZW1wbGF0ZVVybDogXCJkaXJlY3RpdmVzL3Byb2dyZXNzLmh0bWxcIixcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUpIHtcbiAgICAgICRzY29wZS5wcm9ncmVzc1JhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIDEwMCAqICgkc2NvcGUuc3RlcEluZGV4ICsgMSkgLyAoJHNjb3BlLnN0ZXBzLmxlbmd0aCArIDEpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn0pXG5cbi5kaXJlY3RpdmUoXCJzcGlubmVyXCIsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6IFwiRUFcIixcbiAgICBzY29wZTogeyBzcGlubmluZzogXCI9XCIgfSxcbiAgICB0ZW1wbGF0ZVVybDogXCJkaXJlY3RpdmVzL3NwaW5uZXIuaHRtbFwiXG4gIH07XG59KVxuXG4uZmlsdGVyKCdjYXBpdGFsaXplJywgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBmdW5jdGlvbihpbnB1dCwgYWxsKSB7XG4gICAgcmV0dXJuICghIWlucHV0KSA/IGlucHV0LnJlcGxhY2UoLyhbXlxcV19dK1teXFxzLV0qKSAqL2csIGZ1bmN0aW9uKHR4dCl7IHJldHVybiB0eHQuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB0eHQuc3Vic3RyKDEpLnRvTG93ZXJDYXNlKCk7IH0pIDogJyc7XG4gIH1cbn0pXG5cbi5jb250cm9sbGVyKCdGb3JtQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRpbnN0YW50JywgZnVuY3Rpb24oJHNjb3BlKSB7XG4gICRzY29wZS5tb2RlbCA9IHt9O1xuICB2YXIgZmllbGRzID0gKCRzY29wZS5pbnN0YW50LmZvcm0gJiYgJHNjb3BlLmluc3RhbnQuZm9ybS5maWVsZHNfbGlzdCkgfHwgW107XG4gIGFuZ3VsYXIuZm9yRWFjaChmaWVsZHMsIGZ1bmN0aW9uKGZpZWxkKSB7XG4gICAgJHNjb3BlLm1vZGVsW2ZpZWxkLm5hbWVdID0gZmllbGQudmFsdWU7XG4gIH0pO1xuICAkc2NvcGUuc2NoZW1hID0gJHNjb3BlLmluc3RhbnQuZm9ybS5maWVsZHNfc2NoZW1hO1xuICAkc2NvcGUuZm9ybSA9IFtcbiAgICB7XG4gICAgICBcInR5cGVcIjogXCJmaWVsZHNldFwiLFxuICAgICAgXCJ0aXRsZVwiIDogXCJGb3JtXCIsXG4gICAgICBcIml0ZW1zXCIgOiBbIFwiKlwiIF0sXG4gICAgfSxcbiAgICB7IFwidHlwZVwiOiBcInN1Ym1pdFwiLCBcInRpdGxlXCI6IFwiU2F2ZVwiIH1cbiAgXTtcblxuICAkc2NvcGUub25TdWJtaXQgPSBmdW5jdGlvbihmb3JtKSB7XG4gICAgLy8gRmlyc3Qgd2UgYnJvYWRjYXN0IGFuIGV2ZW50IHNvIGFsbCBmaWVsZHMgdmFsaWRhdGUgdGhlbXNlbHZlc1xuICAgICRzY29wZS4kYnJvYWRjYXN0KCdzY2hlbWFGb3JtVmFsaWRhdGUnKTtcblxuICAgIC8vIFRoZW4gd2UgY2hlY2sgaWYgdGhlIGZvcm0gaXMgdmFsaWRcbiAgICBpZiAoZm9ybS4kdmFsaWQpIHtcbiAgICAgICRpbnN0YW50LnN1Ym1pdEZvcm0oJHNjb3BlLm1vZGVsKTtcbiAgICB9XG4gIH1cbn1dKVxuXG4uY29udHJvbGxlcignSW5zdGFudFdpbkNvbnRyb2xsZXInLFsnJHNjb3BlJywgJyRpbnN0YW50JywgJyR0cmFuc2xhdGUnLCAnJGh1bGxDb25maWcnLFxuICBmdW5jdGlvbiBJbnN0YW50V2luQ29udHJvbGxlcigkc2NvcGUsICRpbnN0YW50LCAkdHJhbnNsYXRlLCAkaHVsbENvbmZpZykge1xuICAgICRzY29wZS5zdHlsZXMgPSB7fTtcbiAgICAkc2NvcGUubG9naW4gPSBIdWxsLmxvZ2luO1xuICAgICRzY29wZS5sb2dvdXQgPSBIdWxsLmxvZ291dDtcbiAgICAkc2NvcGUucGxheSA9ICRpbnN0YW50LnBsYXk7XG5cbiAgICAkc2NvcGUuc3RlcHMgPSBTdGVwcztcbiAgICAkc2NvcGUuJGluc3RhbnQgPSAkaW5zdGFudDtcbiAgICAkc2NvcGUuaW5zdGFudCA9ICRpbnN0YW50LmdldFN0YXRlKCk7XG4gICAgJHNjb3BlLmF1dGhTZXJ2aWNlcyA9ICRodWxsQ29uZmlnLmdldEF1dGhTZXJ2aWNlcygpO1xuXG4gICAgZnVuY3Rpb24gc2V0U3R5bGVzKHNldHRpbmdzKSB7XG4gICAgICB2YXIgc3R5bGVzID0ge307XG4gICAgICBhbmd1bGFyLmZvckVhY2goc2V0dGluZ3MuaW1hZ2VzLCBmdW5jdGlvbihpbWcsIHRhcmdldCkge1xuICAgICAgICBpZiAoaW1nKSB7XG4gICAgICAgICAgc3R5bGVzW3RhcmdldF0gPSBzdHlsZXNbdGFyZ2V0XSB8fCB7fTtcbiAgICAgICAgICBzdHlsZXNbdGFyZ2V0XS5iYWNrZ3JvdW5kSW1hZ2UgPSAndXJsKCcgKyBpbWcgKyAnKSc7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgJHNjb3BlLnN0eWxlcyA9IHN0eWxlcztcbiAgICB9XG5cbiAgICBzZXRTdHlsZXMoJHNjb3BlLmluc3RhbnQuc2V0dGluZ3MpO1xuXG4gICAgZnVuY3Rpb24gb25DaGFuZ2UoaW5zdGFudCkge1xuICAgICAgJHNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcbiAgICAgICAgJHNjb3BlLmluc3RhbnQgPSBpbnN0YW50O1xuICAgICAgICBzZXRTdHlsZXMoaW5zdGFudC5zZXR0aW5ncyk7XG4gICAgICAgICR0cmFuc2xhdGUucmVmcmVzaCgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgJGluc3RhbnQub25DaGFuZ2Uob25DaGFuZ2UpO1xuICB9XG5dKTtcblxuSHVsbC5vbkVtYmVkKGRvY3VtZW50LCBmdW5jdGlvbihlbGVtZW50LCBkZXBsb3ltZW50KSB7XG4gIGFwcC52YWx1ZSgnJGh1bGxJbml0Jywge1xuICAgIHVzZXI6IEh1bGwuY3VycmVudFVzZXIoKSxcbiAgICBzaGlwOiBkZXBsb3ltZW50LnNoaXBcbiAgfSk7XG5cbiAgYW5ndWxhci5ib290c3RyYXAoZWxlbWVudCwgWydodWxsLWluc3RhbnQnXSk7XG59KTtcblxuIiwiLyohXG4gKiBwaWNrYWRhdGUuanMgdjMuNC4wLCAyMDE0LzAyLzE1XG4gKiBCeSBBbXN1bCwgaHR0cDovL2Ftc3VsLmNhXG4gKiBIb3N0ZWQgb24gaHR0cDovL2Ftc3VsLmdpdGh1Yi5pby9waWNrYWRhdGUuanNcbiAqIExpY2Vuc2VkIHVuZGVyIE1JVFxuICovXG4hZnVuY3Rpb24oYSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcInBpY2tlclwiLFtcImFuZ3VsYXJcIl0sYSk6dGhpcy5QaWNrZXI9YShhbmd1bGFyKX0oZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYihhLGQsZSxnKXtmdW5jdGlvbiBoKCl7cmV0dXJuIGIuXy5ub2RlKFwiZGl2XCIsYi5fLm5vZGUoXCJkaXZcIixiLl8ubm9kZShcImRpdlwiLGIuXy5ub2RlKFwiZGl2XCIsci5jb21wb25lbnQubm9kZXMoby5vcGVuKSxuLmJveCksbi53cmFwKSxuLmZyYW1lKSxuLmhvbGRlcil9ZnVuY3Rpb24gaSgpe3AuZGF0YShkLHIpLHAuYWRkQ2xhc3Mobi5pbnB1dCkscFswXS52YWx1ZT1wLmF0dHIoXCJkYXRhLXZhbHVlXCIpP3IuZ2V0KFwic2VsZWN0XCIsbS5mb3JtYXQpOmEudmFsdWUsYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIjXCIrby5pZCkpLm9uKFwiZm9jdXNcIixsKSxhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIiNcIitvLmlkKSkub24oXCJjbGlja1wiLGwpLG0uZWRpdGFibGV8fGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiI1wiK28uaWQpKS5vbihcImtleWRvd25cIixmdW5jdGlvbihhKXt2YXIgYj1hLmtleUNvZGUsYz0vXig4fDQ2KSQvLnRlc3QoYik7cmV0dXJuIDI3PT1iPyhyLmNsb3NlKCksITEpOnZvaWQoKDMyPT1ifHxjfHwhby5vcGVuJiZyLmNvbXBvbmVudC5rZXlbYl0pJiYoYS5wcmV2ZW50RGVmYXVsdCgpLGEuc3RvcFByb3BhZ2F0aW9uKCksYz9yLmNsZWFyKCkuY2xvc2UoKTpyLm9wZW4oKSkpfSksYyhhLHtoYXNwb3B1cDohMCxleHBhbmRlZDohMSxyZWFkb25seTohMSxvd25zOmEuaWQrXCJfcm9vdFwiKyhyLl9oaWRkZW4/XCIgXCIrci5faGlkZGVuLmlkOlwiXCIpfSl9ZnVuY3Rpb24gaigpe2Z1bmN0aW9uIGQoKXthbmd1bGFyLmVsZW1lbnQoci4kcm9vdFswXS5xdWVyeVNlbGVjdG9yQWxsKFwiW2RhdGEtcGlja10sIFtkYXRhLW5hdl0sIFtkYXRhLWNsZWFyXVwiKSkub24oXCJjbGlja1wiLGZ1bmN0aW9uKCl7dmFyIGM9YW5ndWxhci5lbGVtZW50KHRoaXMpLGU9Yy5oYXNDbGFzcyhuLm5hdkRpc2FibGVkKXx8Yy5oYXNDbGFzcyhuLmRpc2FibGVkKSxmPWRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7Zj1mJiYoZi50eXBlfHxmLmhyZWYpJiZmLChlfHxmJiYhci4kcm9vdFswXS5jb250YWlucyhmKSkmJmEuZm9jdXMoKSxjLmF0dHIoXCJkYXRhLW5hdlwiKSYmIWU/KHIuc2V0KFwiaGlnaGxpZ2h0XCIsci5jb21wb25lbnQuaXRlbS5oaWdobGlnaHQse25hdjpwYXJzZUludChjLmF0dHIoXCJkYXRhLW5hdlwiKSl9KSxkKCkpOmIuXy5pc0ludGVnZXIocGFyc2VJbnQoYy5hdHRyKFwiZGF0YS1waWNrXCIpKSkmJiFlPyhyLnNldChcInNlbGVjdFwiLHBhcnNlSW50KGMuYXR0cihcImRhdGEtcGlja1wiKSkpLmNsb3NlKCEwKSxkKCkpOmMuYXR0cihcImRhdGEtY2xlYXJcIikmJihyLmNsZWFyKCkuY2xvc2UoITApLGQoKSl9KX1yLiRyb290Lm9uKFwiZm9jdXNpblwiLGZ1bmN0aW9uKGEpe3IuJHJvb3QucmVtb3ZlQ2xhc3Mobi5mb2N1c2VkKSxjKHIuJHJvb3RbMF0sXCJzZWxlY3RlZFwiLCExKSxhLnN0b3BQcm9wYWdhdGlvbigpfSksci4kcm9vdC5vbihcIm1vdXNlZG93biBjbGlja1wiLGZ1bmN0aW9uKGIpe3ZhciBjPWIudGFyZ2V0O2MhPXIuJHJvb3QuY2hpbGRyZW4oKVswXSYmKGIuc3RvcFByb3BhZ2F0aW9uKCksXCJtb3VzZWRvd25cIj09Yi50eXBlJiZcImlucHV0XCIhPT1hbmd1bGFyLmVsZW1lbnQoYylbMF0udGFnTmFtZSYmXCJPUFRJT05cIiE9Yy5ub2RlTmFtZSYmKGIucHJldmVudERlZmF1bHQoKSxhLmZvY3VzKCkpKX0pLGQoKSxjKHIuJHJvb3RbMF0sXCJoaWRkZW5cIiwhMCl9ZnVuY3Rpb24gaygpe3ZhciBiPVtcInN0cmluZ1wiPT10eXBlb2YgbS5oaWRkZW5QcmVmaXg/bS5oaWRkZW5QcmVmaXg6XCJcIixcInN0cmluZ1wiPT10eXBlb2YgbS5oaWRkZW5TdWZmaXg/bS5oaWRkZW5TdWZmaXg6XCJfc3VibWl0XCJdO3IuX2hpZGRlbj1hbmd1bGFyLmVsZW1lbnQoJzxpbnB1dCB0eXBlPWhpZGRlbiBuYW1lPVwiJytiWzBdK2EubmFtZStiWzFdKydcImlkPVwiJytiWzBdK2EuaWQrYlsxXSsnXCInKyhwLmF0dHIoXCJkYXRhLXZhbHVlXCIpfHxhLnZhbHVlPycgdmFsdWU9XCInK3IuZ2V0KFwic2VsZWN0XCIsbS5mb3JtYXRTdWJtaXQpKydcIic6XCJcIikrXCI+XCIpWzBdLHAub24oXCJjaGFuZ2UuXCIrby5pZCxmdW5jdGlvbigpe3IuX2hpZGRlbi52YWx1ZT1hLnZhbHVlP3IuZ2V0KFwic2VsZWN0XCIsbS5mb3JtYXRTdWJtaXQpOlwiXCJ9KS5hZnRlcihyLl9oaWRkZW4pfWZ1bmN0aW9uIGwoYSl7YS5zdG9wUHJvcGFnYXRpb24oKSxcImZvY3VzXCI9PWEudHlwZSYmKHIuJHJvb3QuYWRkQ2xhc3Mobi5mb2N1c2VkKSxjKHIuJHJvb3RbMF0sXCJzZWxlY3RlZFwiLCEwKSksci5vcGVuKCl9aWYoIWEpcmV0dXJuIGI7dmFyIG07ZT8obT1lLmRlZmF1bHRzLGFuZ3VsYXIuZXh0ZW5kKG0sZykpOm09Z3x8e307dmFyIG49Yi5rbGFzc2VzKCk7YW5ndWxhci5leHRlbmQobixtLmtsYXNzKTt2YXIgbz17aWQ6YS5pZHx8XCJQXCIrTWF0aC5hYnMofn4oTWF0aC5yYW5kb20oKSpuZXcgRGF0ZSkpfSxwPWFuZ3VsYXIuZWxlbWVudChhKSxxPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuc3RhcnQoKX0scj1xLnByb3RvdHlwZT17Y29uc3RydWN0b3I6cSwkbm9kZTpwLHN0YXJ0OmZ1bmN0aW9uKCl7cmV0dXJuIG8mJm8uc3RhcnQ/cjooby5tZXRob2RzPXt9LG8uc3RhcnQ9ITAsby5vcGVuPSExLG8udHlwZT1hLnR5cGUsYS5hdXRvZm9jdXM9YT09ZG9jdW1lbnQuYWN0aXZlRWxlbWVudCxhLnR5cGU9XCJ0ZXh0XCIsYS5yZWFkT25seT0hbS5lZGl0YWJsZSxhLmlkPWEuaWR8fG8uaWQsci5jb21wb25lbnQ9bmV3IGUocixtKSxyLiRyb290PWFuZ3VsYXIuZWxlbWVudChiLl8ubm9kZShcImRpdlwiLGgoKSxuLnBpY2tlciwnaWQ9XCInK2EuaWQrJ19yb290XCInKSksaigpLG0uZm9ybWF0U3VibWl0JiZrKCksaSgpLG0uY29udGFpbmVyP2FuZ3VsYXIuZWxlbWVudChtLmNvbnRhaW5lcikuYXBwZW5kKHIuJHJvb3QpOnAuYWZ0ZXIoci4kcm9vdCksci5vbih7c3RhcnQ6ci5jb21wb25lbnQub25TdGFydCxyZW5kZXI6ci5jb21wb25lbnQub25SZW5kZXIsc3RvcDpyLmNvbXBvbmVudC5vblN0b3Asb3BlbjpyLmNvbXBvbmVudC5vbk9wZW4sY2xvc2U6ci5jb21wb25lbnQub25DbG9zZSxzZXQ6ci5jb21wb25lbnQub25TZXR9KS5vbih7c3RhcnQ6bS5vblN0YXJ0LHJlbmRlcjptLm9uUmVuZGVyLHN0b3A6bS5vblN0b3Asb3BlbjptLm9uT3BlbixjbG9zZTptLm9uQ2xvc2Usc2V0Om0ub25TZXR9KSxhLmF1dG9mb2N1cyYmci5vcGVuKCksci50cmlnZ2VyKFwic3RhcnRcIikudHJpZ2dlcihcInJlbmRlclwiKSl9LHJlbmRlcjpmdW5jdGlvbihhKXtyZXR1cm4gYT9yLiRyb290Lmh0bWwoaCgpKTphbmd1bGFyLmVsZW1lbnQoci4kcm9vdFswXS5xdWVyeVNlbGVjdG9yQWxsKFwiLlwiK24uYm94KSkuaHRtbChyLmNvbXBvbmVudC5ub2RlcyhvLm9wZW4pKSxyLnRyaWdnZXIoXCJyZW5kZXJcIil9LHN0b3A6ZnVuY3Rpb24oKXtyZXR1cm4gby5zdGFydD8oci5jbG9zZSgpLHIuX2hpZGRlbiYmci5faGlkZGVuLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoci5faGlkZGVuKSxyLiRyb290LnJlbW92ZSgpLHAucmVtb3ZlQ2xhc3Mobi5pbnB1dCkucmVtb3ZlRGF0YShkKSxzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7cC5vZmYoXCIuXCIrby5pZCl9LDApLGEudHlwZT1vLnR5cGUsYS5yZWFkT25seT0hMSxyLnRyaWdnZXIoXCJzdG9wXCIpLG8ubWV0aG9kcz17fSxvLnN0YXJ0PSExLHIpOnJ9LG9wZW46ZnVuY3Rpb24oZCl7cmV0dXJuIG8ub3Blbj9yOihwLmFkZENsYXNzKG4uYWN0aXZlKSxjKGEsXCJleHBhbmRlZFwiLCEwKSxyLiRyb290LmFkZENsYXNzKG4ub3BlbmVkKSxjKHIuJHJvb3RbMF0sXCJoaWRkZW5cIiwhMSksZCE9PSExJiYoby5vcGVuPSEwLHAudHJpZ2dlckhhbmRsZXIoXCJmb2N1c1wiKSxhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIiNcIitvLmlkKSkub24oXCJjbGljayBmb2N1c2luXCIsZnVuY3Rpb24oYil7dmFyIGM9Yi50YXJnZXQ7YyE9YSYmYyE9ZG9jdW1lbnQmJjMhPWIud2hpY2gmJnIuY2xvc2UoYz09PXIuJHJvb3QuY2hpbGRyZW4oKVswXSl9KSxhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIiNcIitvLmlkKSkub24oXCJrZXlkb3duXCIsZnVuY3Rpb24oYyl7dmFyIGQ9Yy5rZXlDb2RlLGU9ci5jb21wb25lbnQua2V5W2RdLGY9Yy50YXJnZXQ7Mjc9PWQ/ci5jbG9zZSghMCk6ZiE9YXx8IWUmJjEzIT1kP3IuJHJvb3RbMF0uY29udGFpbnMoZikmJjEzPT1kJiYoYy5wcmV2ZW50RGVmYXVsdCgpLGYuY2xpY2soKSk6KGMucHJldmVudERlZmF1bHQoKSxlP2IuXy50cmlnZ2VyKHIuY29tcG9uZW50LmtleS5nbyxyLFtiLl8udHJpZ2dlcihlKV0pOmFuZ3VsYXIuZWxlbWVudChyLiRyb290WzBdLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuXCIrbi5oaWdobGlnaHRlZCkpLmhhc0NsYXNzKG4uZGlzYWJsZWQpfHxyLnNldChcInNlbGVjdFwiLHIuY29tcG9uZW50Lml0ZW0uaGlnaGxpZ2h0KS5jbG9zZSgpKX0pKSxyLnRyaWdnZXIoXCJvcGVuXCIpKX0sY2xvc2U6ZnVuY3Rpb24oYil7cmV0dXJuIGImJihwLm9mZihcImZvY3VzLlwiK28uaWQpLHAudHJpZ2dlckhhbmRsZXIoXCJmb2N1c1wiKSxzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7YW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIjXCIrby5pZCkpLm9uKFwiZm9jdXNcIixsKX0sMCkpLHAucmVtb3ZlQ2xhc3Mobi5hY3RpdmUpLGMoYSxcImV4cGFuZGVkXCIsITEpLHIuJHJvb3QucmVtb3ZlQ2xhc3Mobi5vcGVuZWQrXCIgXCIrbi5mb2N1c2VkKSxjKHIuJHJvb3RbMF0sXCJoaWRkZW5cIiwhMCksYyhyLiRyb290WzBdLFwic2VsZWN0ZWRcIiwhMSksby5vcGVuPyhzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7by5vcGVuPSExfSwxZTMpLGYub2ZmKFwiLlwiK28uaWQpLHIudHJpZ2dlcihcImNsb3NlXCIpKTpyfSxjbGVhcjpmdW5jdGlvbigpe3JldHVybiByLnNldChcImNsZWFyXCIpfSxzZXQ6ZnVuY3Rpb24oYSxiLGMpe3ZhciBkLGUsZj1hbmd1bGFyLmlzT2JqZWN0KGEpLGc9Zj9hOnt9O2lmKGM9ZiYmYW5ndWxhci5pc09iamVjdChiKT9iOmN8fHt9LGEpe2Z8fChnW2FdPWIpO2ZvcihkIGluIGcpZT1nW2RdLGQgaW4gci5jb21wb25lbnQuaXRlbSYmci5jb21wb25lbnQuc2V0KGQsZSxjKSwoXCJzZWxlY3RcIj09ZHx8XCJjbGVhclwiPT1kKSYmKHBbMF0udmFsdWU9XCJjbGVhclwiPT1kP1wiXCI6ci5nZXQoZCxtLmZvcm1hdCkscC50cmlnZ2VySGFuZGxlcihcImNoYW5nZVwiKSk7ci5yZW5kZXIoKX1yZXR1cm4gYy5tdXRlZD9yOnIudHJpZ2dlcihcInNldFwiLGcpfSxnZXQ6ZnVuY3Rpb24oYyxkKXtyZXR1cm4gYz1jfHxcInZhbHVlXCIsbnVsbCE9b1tjXT9vW2NdOlwidmFsdWVcIj09Yz9hLnZhbHVlOmMgaW4gci5jb21wb25lbnQuaXRlbT9cInN0cmluZ1wiPT10eXBlb2YgZD9iLl8udHJpZ2dlcihyLmNvbXBvbmVudC5mb3JtYXRzLnRvU3RyaW5nLHIuY29tcG9uZW50LFtkLHIuY29tcG9uZW50LmdldChjKV0pOnIuY29tcG9uZW50LmdldChjKTp2b2lkIDB9LG9uOmZ1bmN0aW9uKGEsYil7dmFyIGMsZCxlPWFuZ3VsYXIuaXNPYmplY3QoYSksZj1lP2E6e307aWYoYSl7ZXx8KGZbYV09Yik7Zm9yKGMgaW4gZilkPWZbY10sby5tZXRob2RzW2NdPW8ubWV0aG9kc1tjXXx8W10sby5tZXRob2RzW2NdLnB1c2goZCl9cmV0dXJuIHJ9LG9mZjpmdW5jdGlvbigpe3ZhciBhLGIsYz1hcmd1bWVudHM7Zm9yKGE9MCxuYW1lc0NvdW50PWMubGVuZ3RoO25hbWVzQ291bnQ+YTthKz0xKWI9Y1thXSxiIGluIG8ubWV0aG9kcyYmZGVsZXRlIG8ubWV0aG9kc1tiXTtyZXR1cm4gcn0sdHJpZ2dlcjpmdW5jdGlvbihhLGMpe3ZhciBkPW8ubWV0aG9kc1thXTtyZXR1cm4gZCYmZC5tYXAoZnVuY3Rpb24oYSl7Yi5fLnRyaWdnZXIoYSxyLFtjXSl9KSxyfX07cmV0dXJuIG5ldyBxfWZ1bmN0aW9uIGMoYSxiLGMpe2lmKGFuZ3VsYXIuaXNPYmplY3QoYikpZm9yKHZhciBlIGluIGIpZChhLGUsYltlXSk7ZWxzZSBkKGEsYixjKX1mdW5jdGlvbiBkKGEsYixjKXthbmd1bGFyLmVsZW1lbnQoYSkuYXR0cigoXCJyb2xlXCI9PWI/XCJcIjpcImFyaWEtXCIpK2IsYyl9ZnVuY3Rpb24gZShhLGIpe2FuZ3VsYXIuaXNPYmplY3QoYSl8fChhPXthdHRyaWJ1dGU6Yn0pLGI9XCJcIjtmb3IodmFyIGMgaW4gYSl7dmFyIGQ9KFwicm9sZVwiPT1jP1wiXCI6XCJhcmlhLVwiKStjLGU9YVtjXTtiKz1udWxsPT1lP1wiXCI6ZCsnPVwiJythW2NdKydcIid9cmV0dXJuIGJ9dmFyIGY9YW5ndWxhci5lbGVtZW50KGRvY3VtZW50KTtyZXR1cm4gYi5rbGFzc2VzPWZ1bmN0aW9uKGEpe3JldHVybiBhPWF8fFwicGlja2VyXCIse3BpY2tlcjphLG9wZW5lZDphK1wiLS1vcGVuZWRcIixmb2N1c2VkOmErXCItLWZvY3VzZWRcIixpbnB1dDphK1wiX19pbnB1dFwiLGFjdGl2ZTphK1wiX19pbnB1dC0tYWN0aXZlXCIsaG9sZGVyOmErXCJfX2hvbGRlclwiLGZyYW1lOmErXCJfX2ZyYW1lXCIsd3JhcDphK1wiX193cmFwXCIsYm94OmErXCJfX2JveFwifX0sYi5fPXtncm91cDpmdW5jdGlvbihhKXtmb3IodmFyIGMsZD1cIlwiLGU9Yi5fLnRyaWdnZXIoYS5taW4sYSk7ZTw9Yi5fLnRyaWdnZXIoYS5tYXgsYSxbZV0pO2UrPWEuaSljPWIuXy50cmlnZ2VyKGEuaXRlbSxhLFtlXSksZCs9Yi5fLm5vZGUoYS5ub2RlLGNbMF0sY1sxXSxjWzJdKTtyZXR1cm4gZH0sbm9kZTpmdW5jdGlvbihiLGMsZCxlKXtyZXR1cm4gYz8oYz1hLmlzQXJyYXkoYyk/Yy5qb2luKFwiXCIpOmMsZD1kPycgY2xhc3M9XCInK2QrJ1wiJzpcIlwiLGU9ZT9cIiBcIitlOlwiXCIsXCI8XCIrYitkK2UrXCI+XCIrYytcIjwvXCIrYitcIj5cIik6XCJcIn0sbGVhZDpmdW5jdGlvbihhKXtyZXR1cm4oMTA+YT9cIjBcIjpcIlwiKSthfSx0cmlnZ2VyOmZ1bmN0aW9uKGEsYixjKXtyZXR1cm5cImZ1bmN0aW9uXCI9PXR5cGVvZiBhP2EuYXBwbHkoYixjfHxbXSk6YX0sZGlnaXRzOmZ1bmN0aW9uKGEpe3JldHVybi9cXGQvLnRlc3QoYVsxXSk/MjoxfSxpc0RhdGU6ZnVuY3Rpb24oYSl7cmV0dXJue30udG9TdHJpbmcuY2FsbChhKS5pbmRleE9mKFwiRGF0ZVwiKT4tMSYmdGhpcy5pc0ludGVnZXIoYS5nZXREYXRlKCkpfSxpc0ludGVnZXI6ZnVuY3Rpb24oYSl7cmV0dXJue30udG9TdHJpbmcuY2FsbChhKS5pbmRleE9mKFwiTnVtYmVyXCIpPi0xJiZhJTE9PT0wfSxhcmlhQXR0cjplfSxiLmV4dGVuZD1mdW5jdGlvbihhLGMpe2FuZ3VsYXIuZWxlbWVudC5wcm90b3R5cGVbYV09ZnVuY3Rpb24oZCxlKXt2YXIgZj10aGlzLmRhdGEoYSk7aWYoXCJwaWNrZXJcIj09ZClyZXR1cm4gZjtpZihmJiZcInN0cmluZ1wiPT10eXBlb2YgZClyZXR1cm4gYi5fLnRyaWdnZXIoZltkXSxmLFtlXSksdGhpcztmb3IodmFyIGc9MDtnPHRoaXMubGVuZ3RoO2crKyl7dmFyIGg9YW5ndWxhci5lbGVtZW50KHRoaXNbZ10pO2guZGF0YShhKXx8bmV3IGIoaFswXSxhLGMsZCl9fSxhbmd1bGFyLmVsZW1lbnQucHJvdG90eXBlW2FdLmRlZmF1bHRzPWMuZGVmYXVsdHN9LGJ9KTtcbi8qIVxuICogRGF0ZSBwaWNrZXIgZm9yIHBpY2thZGF0ZS5qcyB2My40LjBcbiAqIGh0dHA6Ly9hbXN1bC5naXRodWIuaW8vcGlja2FkYXRlLmpzL2RhdGUuaHRtXG4gKi9cbiFmdW5jdGlvbihhKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtcInBpY2tlclwiLFwiYW5ndWxhclwiXSxhKTphKFBpY2tlcixhbmd1bGFyKX0oZnVuY3Rpb24oYSxiKXtmdW5jdGlvbiBjKGEsYyl7dmFyIGQ9dGhpcyxlPWEuJG5vZGVbMF0udmFsdWUsZj1hLiRub2RlLmF0dHIoXCJkYXRhLXZhbHVlXCIpLGc9Znx8ZSxoPWY/Yy5mb3JtYXRTdWJtaXQ6Yy5mb3JtYXQsaT1mdW5jdGlvbigpe3JldHVyblwicnRsXCI9PT1nZXRDb21wdXRlZFN0eWxlKGEuJHJvb3RbMF0pLmRpcmVjdGlvbn07ZC5zZXR0aW5ncz1jLGQuJG5vZGU9YS4kbm9kZSxkLnF1ZXVlPXttaW46XCJtZWFzdXJlIGNyZWF0ZVwiLG1heDpcIm1lYXN1cmUgY3JlYXRlXCIsbm93Olwibm93IGNyZWF0ZVwiLHNlbGVjdDpcInBhcnNlIGNyZWF0ZSB2YWxpZGF0ZVwiLGhpZ2hsaWdodDpcInBhcnNlIG5hdmlnYXRlIGNyZWF0ZSB2YWxpZGF0ZVwiLHZpZXc6XCJwYXJzZSBjcmVhdGUgdmFsaWRhdGUgdmlld3NldFwiLGRpc2FibGU6XCJkZWFjdGl2YXRlXCIsZW5hYmxlOlwiYWN0aXZhdGVcIn0sZC5pdGVtPXt9LGQuaXRlbS5kaXNhYmxlPShjLmRpc2FibGV8fFtdKS5zbGljZSgwKSxkLml0ZW0uZW5hYmxlPS1mdW5jdGlvbihhKXtyZXR1cm4gYVswXT09PSEwP2Euc2hpZnQoKTotMX0oZC5pdGVtLmRpc2FibGUpLGQuc2V0KFwibWluXCIsYy5taW4pLnNldChcIm1heFwiLGMubWF4KS5zZXQoXCJub3dcIiksZz9kLnNldChcInNlbGVjdFwiLGcse2Zvcm1hdDpoLGZyb21WYWx1ZTohIWV9KTpkLnNldChcInNlbGVjdFwiLG51bGwpLnNldChcImhpZ2hsaWdodFwiLGQuaXRlbS5ub3cpLGQua2V5PXs0MDo3LDM4Oi03LDM5OmZ1bmN0aW9uKCl7cmV0dXJuIGkoKT8tMToxfSwzNzpmdW5jdGlvbigpe3JldHVybiBpKCk/MTotMX0sZ286ZnVuY3Rpb24oYSl7dmFyIGI9ZC5pdGVtLmhpZ2hsaWdodCxjPW5ldyBEYXRlKGIueWVhcixiLm1vbnRoLGIuZGF0ZSthKTtkLnNldChcImhpZ2hsaWdodFwiLFtjLmdldEZ1bGxZZWFyKCksYy5nZXRNb250aCgpLGMuZ2V0RGF0ZSgpXSx7aW50ZXJ2YWw6YX0pLHRoaXMucmVuZGVyKCl9fSxhLm9uKFwicmVuZGVyXCIsZnVuY3Rpb24oKXtiLmVsZW1lbnQoYS4kcm9vdFswXS5xdWVyeVNlbGVjdG9yQWxsKFwiLlwiK2Mua2xhc3Muc2VsZWN0TW9udGgpKS5vbihcImNoYW5nZVwiLGZ1bmN0aW9uKCl7dmFyIGQ9dGhpcy52YWx1ZTtkJiYoYS5zZXQoXCJoaWdobGlnaHRcIixbYS5nZXQoXCJ2aWV3XCIpLnllYXIsZCxhLmdldChcImhpZ2hsaWdodFwiKS5kYXRlXSksYi5lbGVtZW50KGEuJHJvb3RbMF0ucXVlcnlTZWxlY3RvckFsbChcIi5cIitjLmtsYXNzLnNlbGVjdE1vbnRoKSkudHJpZ2dlckhhbmRsZXIoXCJmb2N1c1wiKSl9KSxiLmVsZW1lbnQoYS4kcm9vdFswXS5xdWVyeVNlbGVjdG9yQWxsKFwiLlwiK2Mua2xhc3Muc2VsZWN0WWVhcikpLm9uKFwiY2hhbmdlXCIsZnVuY3Rpb24oKXt2YXIgZD10aGlzLnZhbHVlO2QmJihhLnNldChcImhpZ2hsaWdodFwiLFtkLGEuZ2V0KFwidmlld1wiKS5tb250aCxhLmdldChcImhpZ2hsaWdodFwiKS5kYXRlXSksYi5lbGVtZW50KGEuJHJvb3RbMF0ucXVlcnlTZWxlY3RvckFsbChcIi5cIitjLmtsYXNzLnNlbGVjdFllYXIpKS50cmlnZ2VySGFuZGxlcihcImZvY3VzXCIpKX0pfSkub24oXCJvcGVuXCIsZnVuY3Rpb24oKXtiLmVsZW1lbnQoYS4kcm9vdFswXS5xdWVyeVNlbGVjdG9yQWxsKFwiYnV0dG9uLCBzZWxlY3RcIikpLmF0dHIoXCJkaXNhYmxlZFwiLCExKX0pLm9uKFwiY2xvc2VcIixmdW5jdGlvbigpe2IuZWxlbWVudChhLiRyb290WzBdLnF1ZXJ5U2VsZWN0b3JBbGwoXCJidXR0b24sIHNlbGVjdFwiKSkuYXR0cihcImRpc2FibGVkXCIsITApfSl9dmFyIGQ9NyxlPTYsZj1hLl87Yy5wcm90b3R5cGUuc2V0PWZ1bmN0aW9uKGEsYixjKXt2YXIgZD10aGlzLGU9ZC5pdGVtO3JldHVybiBudWxsPT09Yj8oZVthXT1iLGQpOihlW1wiZW5hYmxlXCI9PWE/XCJkaXNhYmxlXCI6XCJmbGlwXCI9PWE/XCJlbmFibGVcIjphXT1kLnF1ZXVlW2FdLnNwbGl0KFwiIFwiKS5tYXAoZnVuY3Rpb24oZSl7cmV0dXJuIGI9ZFtlXShhLGIsYyl9KS5wb3AoKSxcInNlbGVjdFwiPT1hP2Quc2V0KFwiaGlnaGxpZ2h0XCIsZS5zZWxlY3QsYyk6XCJoaWdobGlnaHRcIj09YT9kLnNldChcInZpZXdcIixlLmhpZ2hsaWdodCxjKTphLm1hdGNoKC9eKGZsaXB8bWlufG1heHxkaXNhYmxlfGVuYWJsZSkkLykmJihlLnNlbGVjdCYmZC5kaXNhYmxlZChlLnNlbGVjdCkmJmQuc2V0KFwic2VsZWN0XCIsZS5zZWxlY3QsYyksZS5oaWdobGlnaHQmJmQuZGlzYWJsZWQoZS5oaWdobGlnaHQpJiZkLnNldChcImhpZ2hsaWdodFwiLGUuaGlnaGxpZ2h0LGMpKSxkKX0sYy5wcm90b3R5cGUuZ2V0PWZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLml0ZW1bYV19LGMucHJvdG90eXBlLmNyZWF0ZT1mdW5jdGlvbihhLGMsZCl7dmFyIGUsZz10aGlzO3JldHVybiBjPXZvaWQgMD09PWM/YTpjLGM9PS0xLzB8fDEvMD09Yz9lPWM6Yi5pc09iamVjdChjKSYmZi5pc0ludGVnZXIoYy5waWNrKT9jPWMub2JqOmIuaXNBcnJheShjKT8oYz1uZXcgRGF0ZShjWzBdLGNbMV0sY1syXSksYz1mLmlzRGF0ZShjKT9jOmcuY3JlYXRlKCkub2JqKTpjPWYuaXNJbnRlZ2VyKGMpfHxmLmlzRGF0ZShjKT9nLm5vcm1hbGl6ZShuZXcgRGF0ZShjKSxkKTpnLm5vdyhhLGMsZCkse3llYXI6ZXx8Yy5nZXRGdWxsWWVhcigpLG1vbnRoOmV8fGMuZ2V0TW9udGgoKSxkYXRlOmV8fGMuZ2V0RGF0ZSgpLGRheTplfHxjLmdldERheSgpLG9iajplfHxjLHBpY2s6ZXx8Yy5nZXRUaW1lKCl9fSxjLnByb3RvdHlwZS5jcmVhdGVSYW5nZT1mdW5jdGlvbihhLGMpe3ZhciBkPXRoaXMsZT1mdW5jdGlvbihhKXtyZXR1cm4gYT09PSEwfHxiLmlzQXJyYXkoYSl8fGYuaXNEYXRlKGEpP2QuY3JlYXRlKGEpOmF9O3JldHVybiBmLmlzSW50ZWdlcihhKXx8KGE9ZShhKSksZi5pc0ludGVnZXIoYyl8fChjPWUoYykpLGYuaXNJbnRlZ2VyKGEpJiZiLmlzT2JqZWN0KGMpP2E9W2MueWVhcixjLm1vbnRoLGMuZGF0ZSthXTpmLmlzSW50ZWdlcihjKSYmYi5pc09iamVjdChhKSYmKGM9W2EueWVhcixhLm1vbnRoLGEuZGF0ZStjXSkse2Zyb206ZShhKSx0bzplKGMpfX0sYy5wcm90b3R5cGUud2l0aGluUmFuZ2U9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT10aGlzLmNyZWF0ZVJhbmdlKGEuZnJvbSxhLnRvKSxiLnBpY2s+PWEuZnJvbS5waWNrJiZiLnBpY2s8PWEudG8ucGlja30sYy5wcm90b3R5cGUub3ZlcmxhcFJhbmdlcz1mdW5jdGlvbihhLGIpe3ZhciBjPXRoaXM7cmV0dXJuIGE9Yy5jcmVhdGVSYW5nZShhLmZyb20sYS50byksYj1jLmNyZWF0ZVJhbmdlKGIuZnJvbSxiLnRvKSxjLndpdGhpblJhbmdlKGEsYi5mcm9tKXx8Yy53aXRoaW5SYW5nZShhLGIudG8pfHxjLndpdGhpblJhbmdlKGIsYS5mcm9tKXx8Yy53aXRoaW5SYW5nZShiLGEudG8pfSxjLnByb3RvdHlwZS5ub3c9ZnVuY3Rpb24oYSxiLGMpe3JldHVybiBiPW5ldyBEYXRlLGMmJmMucmVsJiZiLnNldERhdGUoYi5nZXREYXRlKCkrYy5yZWwpLHRoaXMubm9ybWFsaXplKGIsYyl9LGMucHJvdG90eXBlLm5hdmlnYXRlPWZ1bmN0aW9uKGEsYyxkKXt2YXIgZSxmLGcsaCxpPWIuaXNBcnJheShjKSxqPWIuaXNPYmplY3QoYyksaz10aGlzLml0ZW0udmlldztpZihpfHxqKXtmb3Ioaj8oZj1jLnllYXIsZz1jLm1vbnRoLGg9Yy5kYXRlKTooZj0rY1swXSxnPStjWzFdLGg9K2NbMl0pLGQmJmQubmF2JiZrJiZrLm1vbnRoIT09ZyYmKGY9ay55ZWFyLGc9ay5tb250aCksZT1uZXcgRGF0ZShmLGcrKGQmJmQubmF2P2QubmF2OjApLDEpLGY9ZS5nZXRGdWxsWWVhcigpLGc9ZS5nZXRNb250aCgpO25ldyBEYXRlKGYsZyxoKS5nZXRNb250aCgpIT09ZzspaC09MTtjPVtmLGcsaF19cmV0dXJuIGN9LGMucHJvdG90eXBlLm5vcm1hbGl6ZT1mdW5jdGlvbihhKXtyZXR1cm4gYS5zZXRIb3VycygwLDAsMCwwKSxhfSxjLnByb3RvdHlwZS5tZWFzdXJlPWZ1bmN0aW9uKGEsYil7dmFyIGM9dGhpcztyZXR1cm4gYj9mLmlzSW50ZWdlcihiKSYmKGI9Yy5ub3coYSxiLHtyZWw6Yn0pKTpiPVwibWluXCI9PWE/LTEvMDoxLzAsYn0sYy5wcm90b3R5cGUudmlld3NldD1mdW5jdGlvbihhLGIpe3JldHVybiB0aGlzLmNyZWF0ZShbYi55ZWFyLGIubW9udGgsMV0pfSxjLnByb3RvdHlwZS52YWxpZGF0ZT1mdW5jdGlvbihhLGMsZCl7dmFyIGUsZyxoLGksaj10aGlzLGs9YyxsPWQmJmQuaW50ZXJ2YWw/ZC5pbnRlcnZhbDoxLG09LTE9PT1qLml0ZW0uZW5hYmxlLG49ai5pdGVtLm1pbixvPWouaXRlbS5tYXgscD1tJiZqLml0ZW0uZGlzYWJsZS5maWx0ZXIoZnVuY3Rpb24oYSl7aWYoYi5pc0FycmF5KGEpKXt2YXIgZD1qLmNyZWF0ZShhKS5waWNrO2Q8Yy5waWNrP2U9ITA6ZD5jLnBpY2smJihnPSEwKX1yZXR1cm4gZi5pc0ludGVnZXIoYSl9KS5sZW5ndGg7aWYoKCFkfHwhZC5uYXYpJiYoIW0mJmouZGlzYWJsZWQoYyl8fG0mJmouZGlzYWJsZWQoYykmJihwfHxlfHxnKXx8IW0mJihjLnBpY2s8PW4ucGlja3x8Yy5waWNrPj1vLnBpY2spKSlmb3IobSYmIXAmJighZyYmbD4wfHwhZSYmMD5sKSYmKGwqPS0xKTtqLmRpc2FibGVkKGMpJiYoTWF0aC5hYnMobCk+MSYmKGMubW9udGg8ay5tb250aHx8Yy5tb250aD5rLm1vbnRoKSYmKGM9ayxsPWw+MD8xOi0xKSxjLnBpY2s8PW4ucGljaz8oaD0hMCxsPTEsYz1qLmNyZWF0ZShbbi55ZWFyLG4ubW9udGgsbi5kYXRlLTFdKSk6Yy5waWNrPj1vLnBpY2smJihpPSEwLGw9LTEsYz1qLmNyZWF0ZShbby55ZWFyLG8ubW9udGgsby5kYXRlKzFdKSksIWh8fCFpKTspYz1qLmNyZWF0ZShbYy55ZWFyLGMubW9udGgsYy5kYXRlK2xdKTtyZXR1cm4gY30sYy5wcm90b3R5cGUuZGlzYWJsZWQ9ZnVuY3Rpb24oYSl7dmFyIGM9dGhpcyxkPWMuaXRlbS5kaXNhYmxlLmZpbHRlcihmdW5jdGlvbihkKXtyZXR1cm4gZi5pc0ludGVnZXIoZCk/YS5kYXk9PT0oYy5zZXR0aW5ncy5maXJzdERheT9kOmQtMSklNzpiLmlzQXJyYXkoZCl8fGYuaXNEYXRlKGQpP2EucGljaz09PWMuY3JlYXRlKGQpLnBpY2s6Yi5pc09iamVjdChkKT9jLndpdGhpblJhbmdlKGQsYSk6dm9pZCAwfSk7cmV0dXJuIGQ9ZC5sZW5ndGgmJiFkLmZpbHRlcihmdW5jdGlvbihhKXtyZXR1cm4gYi5pc0FycmF5KGEpJiZcImludmVydGVkXCI9PWFbM118fGIuaXNPYmplY3QoYSkmJmEuaW52ZXJ0ZWR9KS5sZW5ndGgsLTE9PT1jLml0ZW0uZW5hYmxlPyFkOmR8fGEucGljazxjLml0ZW0ubWluLnBpY2t8fGEucGljaz5jLml0ZW0ubWF4LnBpY2t9LGMucHJvdG90eXBlLnBhcnNlPWZ1bmN0aW9uKGEsYyxkKXt2YXIgZSxnPXRoaXMsaD17fTtyZXR1cm4hY3x8Zi5pc0ludGVnZXIoYyl8fGIuaXNBcnJheShjKXx8Zi5pc0RhdGUoYyl8fGIuaXNPYmplY3QoYykmJmYuaXNJbnRlZ2VyKGMucGljayk/YzooZCYmZC5mb3JtYXR8fChkPWR8fHt9LGQuZm9ybWF0PWcuc2V0dGluZ3MuZm9ybWF0KSxlPVwic3RyaW5nXCIhPXR5cGVvZiBjfHxkLmZyb21WYWx1ZT8wOjEsZy5mb3JtYXRzLnRvQXJyYXkoZC5mb3JtYXQpLm1hcChmdW5jdGlvbihhKXt2YXIgYj1nLmZvcm1hdHNbYV0sZD1iP2YudHJpZ2dlcihiLGcsW2MsaF0pOmEucmVwbGFjZSgvXiEvLFwiXCIpLmxlbmd0aDtiJiYoaFthXT1jLnN1YnN0cigwLGQpKSxjPWMuc3Vic3RyKGQpfSksW2gueXl5eXx8aC55eSwrKGgubW18fGgubSktZSxoLmRkfHxoLmRdKX0sYy5wcm90b3R5cGUuZm9ybWF0cz1mdW5jdGlvbigpe2Z1bmN0aW9uIGEoYSxiLGMpe3ZhciBkPWEubWF0Y2goL1xcdysvKVswXTtyZXR1cm4gYy5tbXx8Yy5tfHwoYy5tPWIuaW5kZXhPZihkKSksZC5sZW5ndGh9ZnVuY3Rpb24gYihhKXtyZXR1cm4gYS5tYXRjaCgvXFx3Ky8pWzBdLmxlbmd0aH1yZXR1cm57ZDpmdW5jdGlvbihhLGIpe3JldHVybiBhP2YuZGlnaXRzKGEpOmIuZGF0ZX0sZGQ6ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT8yOmYubGVhZChiLmRhdGUpfSxkZGQ6ZnVuY3Rpb24oYSxjKXtyZXR1cm4gYT9iKGEpOnRoaXMuc2V0dGluZ3Mud2Vla2RheXNTaG9ydFtjLmRheV19LGRkZGQ6ZnVuY3Rpb24oYSxjKXtyZXR1cm4gYT9iKGEpOnRoaXMuc2V0dGluZ3Mud2Vla2RheXNGdWxsW2MuZGF5XX0sbTpmdW5jdGlvbihhLGIpe3JldHVybiBhP2YuZGlnaXRzKGEpOmIubW9udGgrMX0sbW06ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT8yOmYubGVhZChiLm1vbnRoKzEpfSxtbW06ZnVuY3Rpb24oYixjKXt2YXIgZD10aGlzLnNldHRpbmdzLm1vbnRoc1Nob3J0O3JldHVybiBiP2EoYixkLGMpOmRbYy5tb250aF19LG1tbW06ZnVuY3Rpb24oYixjKXt2YXIgZD10aGlzLnNldHRpbmdzLm1vbnRoc0Z1bGw7cmV0dXJuIGI/YShiLGQsYyk6ZFtjLm1vbnRoXX0seXk6ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT8yOihcIlwiK2IueWVhcikuc2xpY2UoMil9LHl5eXk6ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT80OmIueWVhcn0sdG9BcnJheTpmdW5jdGlvbihhKXtyZXR1cm4gYS5zcGxpdCgvKGR7MSw0fXxtezEsNH18eXs0fXx5eXwhLikvZyl9LHRvU3RyaW5nOmZ1bmN0aW9uKGEsYil7dmFyIGM9dGhpcztyZXR1cm4gYy5mb3JtYXRzLnRvQXJyYXkoYSkubWFwKGZ1bmN0aW9uKGEpe3JldHVybiBmLnRyaWdnZXIoYy5mb3JtYXRzW2FdLGMsWzAsYl0pfHxhLnJlcGxhY2UoL14hLyxcIlwiKX0pLmpvaW4oXCJcIil9fX0oKSxjLnByb3RvdHlwZS5pc0RhdGVFeGFjdD1mdW5jdGlvbihhLGMpe3ZhciBkPXRoaXM7cmV0dXJuIGYuaXNJbnRlZ2VyKGEpJiZmLmlzSW50ZWdlcihjKXx8XCJib29sZWFuXCI9PXR5cGVvZiBhJiZcImJvb2xlYW5cIj09dHlwZW9mIGM/YT09PWM6KGYuaXNEYXRlKGEpfHxiLmlzQXJyYXkoYSkpJiYoZi5pc0RhdGUoYyl8fGIuaXNBcnJheShjKSk/ZC5jcmVhdGUoYSkucGljaz09PWQuY3JlYXRlKGMpLnBpY2s6Yi5pc09iamVjdChhKSYmYi5pc09iamVjdChjKT9kLmlzRGF0ZUV4YWN0KGEuZnJvbSxjLmZyb20pJiZkLmlzRGF0ZUV4YWN0KGEudG8sYy50byk6ITF9LGMucHJvdG90eXBlLmlzRGF0ZU92ZXJsYXA9ZnVuY3Rpb24oYSxjKXt2YXIgZD10aGlzO3JldHVybiBmLmlzSW50ZWdlcihhKSYmKGYuaXNEYXRlKGMpfHxiLmlzQXJyYXkoYykpP2E9PT1kLmNyZWF0ZShjKS5kYXkrMTpmLmlzSW50ZWdlcihjKSYmKGYuaXNEYXRlKGEpfHxiLmlzQXJyYXkoYSkpP2M9PT1kLmNyZWF0ZShhKS5kYXkrMTpiLmlzT2JqZWN0KGEpJiZiLmlzT2JqZWN0KGMpP2Qub3ZlcmxhcFJhbmdlcyhhLGMpOiExfSxjLnByb3RvdHlwZS5mbGlwRW5hYmxlPWZ1bmN0aW9uKGEpe3ZhciBiPXRoaXMuaXRlbTtiLmVuYWJsZT1hfHwoLTE9PWIuZW5hYmxlPzE6LTEpfSxjLnByb3RvdHlwZS5kZWFjdGl2YXRlPWZ1bmN0aW9uKGEsYyl7dmFyIGQ9dGhpcyxlPWQuaXRlbS5kaXNhYmxlLnNsaWNlKDApO3JldHVyblwiZmxpcFwiPT1jP2QuZmxpcEVuYWJsZSgpOmM9PT0hMT8oZC5mbGlwRW5hYmxlKDEpLGU9W10pOmM9PT0hMD8oZC5mbGlwRW5hYmxlKC0xKSxlPVtdKTpjLm1hcChmdW5jdGlvbihhKXtmb3IodmFyIGMsZz0wO2c8ZS5sZW5ndGg7Zys9MSlpZihkLmlzRGF0ZUV4YWN0KGEsZVtnXSkpe2M9ITA7YnJlYWt9Y3x8KGYuaXNJbnRlZ2VyKGEpfHxmLmlzRGF0ZShhKXx8Yi5pc0FycmF5KGEpfHxiLmlzT2JqZWN0KGEpJiZhLmZyb20mJmEudG8pJiZlLnB1c2goYSl9KSxlfSxjLnByb3RvdHlwZS5hY3RpdmF0ZT1mdW5jdGlvbihhLGMpe3ZhciBkPXRoaXMsZT1kLml0ZW0uZGlzYWJsZSxnPWUubGVuZ3RoO3JldHVyblwiZmxpcFwiPT1jP2QuZmxpcEVuYWJsZSgpOmM9PT0hMD8oZC5mbGlwRW5hYmxlKDEpLGU9W10pOmM9PT0hMT8oZC5mbGlwRW5hYmxlKC0xKSxlPVtdKTpjLm1hcChmdW5jdGlvbihhKXt2YXIgYyxoLGksajtmb3IoaT0wO2c+aTtpKz0xKXtpZihoPWVbaV0sZC5pc0RhdGVFeGFjdChoLGEpKXtjPWVbaV09bnVsbCxqPSEwO2JyZWFrfWlmKGQuaXNEYXRlT3ZlcmxhcChoLGEpKXtiLmlzT2JqZWN0KGEpPyhhLmludmVydGVkPSEwLGM9YSk6Yi5pc0FycmF5KGEpPyhjPWEsY1szXXx8Yy5wdXNoKFwiaW52ZXJ0ZWRcIikpOmYuaXNEYXRlKGEpJiYoYz1bYS5nZXRGdWxsWWVhcigpLGEuZ2V0TW9udGgoKSxhLmdldERhdGUoKSxcImludmVydGVkXCJdKTticmVha319aWYoYylmb3IoaT0wO2c+aTtpKz0xKWlmKGQuaXNEYXRlRXhhY3QoZVtpXSxhKSl7ZVtpXT1udWxsO2JyZWFrfWlmKGopZm9yKGk9MDtnPmk7aSs9MSlpZihkLmlzRGF0ZU92ZXJsYXAoZVtpXSxhKSl7ZVtpXT1udWxsO2JyZWFrfWMmJmUucHVzaChjKX0pLGUuZmlsdGVyKGZ1bmN0aW9uKGEpe3JldHVybiBudWxsIT1hfSl9LGMucHJvdG90eXBlLm5vZGVzPWZ1bmN0aW9uKGEpe3ZhciBiPXRoaXMsYz1iLnNldHRpbmdzLGc9Yi5pdGVtLGg9Zy5ub3csaT1nLnNlbGVjdCxqPWcuaGlnaGxpZ2h0LGs9Zy52aWV3LGw9Zy5kaXNhYmxlLG09Zy5taW4sbj1nLm1heCxvPWZ1bmN0aW9uKGEpe3JldHVybiBjLmZpcnN0RGF5JiZhLnB1c2goYS5zaGlmdCgpKSxmLm5vZGUoXCJ0aGVhZFwiLGYubm9kZShcInRyXCIsZi5ncm91cCh7bWluOjAsbWF4OmQtMSxpOjEsbm9kZTpcInRoXCIsaXRlbTpmdW5jdGlvbihiKXtyZXR1cm5bYVtiXSxjLmtsYXNzLndlZWtkYXlzXX19KSkpfSgoYy5zaG93V2Vla2RheXNGdWxsP2Mud2Vla2RheXNGdWxsOmMud2Vla2RheXNTaG9ydCkuc2xpY2UoMCkpLHA9ZnVuY3Rpb24oYSl7cmV0dXJuIGYubm9kZShcImRpdlwiLFwiIFwiLGMua2xhc3NbXCJuYXZcIisoYT9cIk5leHRcIjpcIlByZXZcIildKyhhJiZrLnllYXI+PW4ueWVhciYmay5tb250aD49bi5tb250aHx8IWEmJmsueWVhcjw9bS55ZWFyJiZrLm1vbnRoPD1tLm1vbnRoP1wiIFwiK2Mua2xhc3MubmF2RGlzYWJsZWQ6XCJcIiksXCJkYXRhLW5hdj1cIisoYXx8LTEpKX0scT1mdW5jdGlvbihiKXtyZXR1cm4gYy5zZWxlY3RNb250aHM/Zi5ub2RlKFwic2VsZWN0XCIsZi5ncm91cCh7bWluOjAsbWF4OjExLGk6MSxub2RlOlwib3B0aW9uXCIsaXRlbTpmdW5jdGlvbihhKXtyZXR1cm5bYlthXSwwLFwidmFsdWU9XCIrYSsoay5tb250aD09YT9cIiBzZWxlY3RlZFwiOlwiXCIpKyhrLnllYXI9PW0ueWVhciYmYTxtLm1vbnRofHxrLnllYXI9PW4ueWVhciYmYT5uLm1vbnRoP1wiIGRpc2FibGVkXCI6XCJcIildfX0pLGMua2xhc3Muc2VsZWN0TW9udGgsYT9cIlwiOlwiZGlzYWJsZWRcIik6Zi5ub2RlKFwiZGl2XCIsYltrLm1vbnRoXSxjLmtsYXNzLm1vbnRoKX0scj1mdW5jdGlvbigpe3ZhciBiPWsueWVhcixkPWMuc2VsZWN0WWVhcnM9PT0hMD81On5+KGMuc2VsZWN0WWVhcnMvMik7aWYoZCl7dmFyIGU9bS55ZWFyLGc9bi55ZWFyLGg9Yi1kLGk9YitkO2lmKGU+aCYmKGkrPWUtaCxoPWUpLGk+Zyl7dmFyIGo9aC1lLGw9aS1nO2gtPWo+bD9sOmosaT1nfXJldHVybiBmLm5vZGUoXCJzZWxlY3RcIixmLmdyb3VwKHttaW46aCxtYXg6aSxpOjEsbm9kZTpcIm9wdGlvblwiLGl0ZW06ZnVuY3Rpb24oYSl7cmV0dXJuW2EsMCxcInZhbHVlPVwiK2ErKGI9PWE/XCIgc2VsZWN0ZWRcIjpcIlwiKV19fSksYy5rbGFzcy5zZWxlY3RZZWFyLGE/XCJcIjpcImRpc2FibGVkXCIpfXJldHVybiBmLm5vZGUoXCJkaXZcIixiLGMua2xhc3MueWVhcil9O3JldHVybiBmLm5vZGUoXCJkaXZcIixwKCkrcCgxKStxKGMuc2hvd01vbnRoc1Nob3J0P2MubW9udGhzU2hvcnQ6Yy5tb250aHNGdWxsKStyKCksYy5rbGFzcy5oZWFkZXIpK2Yubm9kZShcInRhYmxlXCIsbytmLm5vZGUoXCJ0Ym9keVwiLGYuZ3JvdXAoe21pbjowLG1heDplLTEsaToxLG5vZGU6XCJ0clwiLGl0ZW06ZnVuY3Rpb24oYSl7dmFyIGU9Yy5maXJzdERheSYmMD09PWIuY3JlYXRlKFtrLnllYXIsay5tb250aCwxXSkuZGF5Py03OjA7cmV0dXJuW2YuZ3JvdXAoe21pbjpkKmEtay5kYXkrZSsxLG1heDpmdW5jdGlvbigpe3JldHVybiB0aGlzLm1pbitkLTF9LGk6MSxub2RlOlwidGRcIixpdGVtOmZ1bmN0aW9uKGEpe2E9Yi5jcmVhdGUoW2sueWVhcixrLm1vbnRoLGErKGMuZmlyc3REYXk/MTowKV0pO3ZhciBkPWkmJmkucGljaz09YS5waWNrLGU9aiYmai5waWNrPT1hLnBpY2ssZz1sJiZiLmRpc2FibGVkKGEpfHxhLnBpY2s8bS5waWNrfHxhLnBpY2s+bi5waWNrO3JldHVybltmLm5vZGUoXCJkaXZcIixhLmRhdGUsZnVuY3Rpb24oYil7cmV0dXJuIGIucHVzaChrLm1vbnRoPT1hLm1vbnRoP2Mua2xhc3MuaW5mb2N1czpjLmtsYXNzLm91dGZvY3VzKSxoLnBpY2s9PWEucGljayYmYi5wdXNoKGMua2xhc3Mubm93KSxkJiZiLnB1c2goYy5rbGFzcy5zZWxlY3RlZCksZSYmYi5wdXNoKGMua2xhc3MuaGlnaGxpZ2h0ZWQpLGcmJmIucHVzaChjLmtsYXNzLmRpc2FibGVkKSxiLmpvaW4oXCIgXCIpfShbYy5rbGFzcy5kYXldKSxcImRhdGEtcGljaz1cIithLnBpY2srXCIgXCIrZi5hcmlhQXR0cih7cm9sZTpcImJ1dHRvblwiLGNvbnRyb2xzOmIuJG5vZGVbMF0uaWQsY2hlY2tlZDpkJiZiLiRub2RlWzBdLnZhbHVlPT09Zi50cmlnZ2VyKGIuZm9ybWF0cy50b1N0cmluZyxiLFtjLmZvcm1hdCxhXSk/ITA6bnVsbCxhY3RpdmVkZXNjZW5kYW50OmU/ITA6bnVsbCxkaXNhYmxlZDpnPyEwOm51bGx9KSldfX0pXX19KSksYy5rbGFzcy50YWJsZSkrZi5ub2RlKFwiZGl2XCIsZi5ub2RlKFwiYnV0dG9uXCIsYy50b2RheSxjLmtsYXNzLmJ1dHRvblRvZGF5LFwidHlwZT1idXR0b24gZGF0YS1waWNrPVwiK2gucGljaysoYT9cIlwiOlwiIGRpc2FibGVkXCIpKStmLm5vZGUoXCJidXR0b25cIixjLmNsZWFyLGMua2xhc3MuYnV0dG9uQ2xlYXIsXCJ0eXBlPWJ1dHRvbiBkYXRhLWNsZWFyPTFcIisoYT9cIlwiOlwiIGRpc2FibGVkXCIpKSxjLmtsYXNzLmZvb3Rlcil9LGMuZGVmYXVsdHM9ZnVuY3Rpb24oYSl7cmV0dXJue21vbnRoc0Z1bGw6W1wiSmFudWFyeVwiLFwiRmVicnVhcnlcIixcIk1hcmNoXCIsXCJBcHJpbFwiLFwiTWF5XCIsXCJKdW5lXCIsXCJKdWx5XCIsXCJBdWd1c3RcIixcIlNlcHRlbWJlclwiLFwiT2N0b2JlclwiLFwiTm92ZW1iZXJcIixcIkRlY2VtYmVyXCJdLG1vbnRoc1Nob3J0OltcIkphblwiLFwiRmViXCIsXCJNYXJcIixcIkFwclwiLFwiTWF5XCIsXCJKdW5cIixcIkp1bFwiLFwiQXVnXCIsXCJTZXBcIixcIk9jdFwiLFwiTm92XCIsXCJEZWNcIl0sd2Vla2RheXNGdWxsOltcIlN1bmRheVwiLFwiTW9uZGF5XCIsXCJUdWVzZGF5XCIsXCJXZWRuZXNkYXlcIixcIlRodXJzZGF5XCIsXCJGcmlkYXlcIixcIlNhdHVyZGF5XCJdLHdlZWtkYXlzU2hvcnQ6W1wiU3VuXCIsXCJNb25cIixcIlR1ZVwiLFwiV2VkXCIsXCJUaHVcIixcIkZyaVwiLFwiU2F0XCJdLHRvZGF5OlwiVG9kYXlcIixjbGVhcjpcIkNsZWFyXCIsZm9ybWF0OlwiZCBtbW1tLCB5eXl5XCIsa2xhc3M6e3RhYmxlOmErXCJ0YWJsZVwiLGhlYWRlcjphK1wiaGVhZGVyXCIsbmF2UHJldjphK1wibmF2LS1wcmV2XCIsbmF2TmV4dDphK1wibmF2LS1uZXh0XCIsbmF2RGlzYWJsZWQ6YStcIm5hdi0tZGlzYWJsZWRcIixtb250aDphK1wibW9udGhcIix5ZWFyOmErXCJ5ZWFyXCIsc2VsZWN0TW9udGg6YStcInNlbGVjdC0tbW9udGhcIixzZWxlY3RZZWFyOmErXCJzZWxlY3QtLXllYXJcIix3ZWVrZGF5czphK1wid2Vla2RheVwiLGRheTphK1wiZGF5XCIsZGlzYWJsZWQ6YStcImRheS0tZGlzYWJsZWRcIixzZWxlY3RlZDphK1wiZGF5LS1zZWxlY3RlZFwiLGhpZ2hsaWdodGVkOmErXCJkYXktLWhpZ2hsaWdodGVkXCIsbm93OmErXCJkYXktLXRvZGF5XCIsaW5mb2N1czphK1wiZGF5LS1pbmZvY3VzXCIsb3V0Zm9jdXM6YStcImRheS0tb3V0Zm9jdXNcIixmb290ZXI6YStcImZvb3RlclwiLGJ1dHRvbkNsZWFyOmErXCJidXR0b24tLWNsZWFyXCIsYnV0dG9uVG9kYXk6YStcImJ1dHRvbi0tdG9kYXlcIn19fShhLmtsYXNzZXMoKS5waWNrZXIrXCJfX1wiKSxhLmV4dGVuZChcInBpY2thZGF0ZVwiLGMpfSk7XG4vKiFcbiAqIFRpbWUgcGlja2VyIGZvciBwaWNrYWRhdGUuanMgdjMuNC4wXG4gKiBodHRwOi8vYW1zdWwuZ2l0aHViLmlvL3BpY2thZGF0ZS5qcy90aW1lLmh0bVxuICovXG4hZnVuY3Rpb24oYSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShbXCJwaWNrZXJcIixcImFuZ3VsYXJcIl0sYSk6YShQaWNrZXIsYW5ndWxhcil9KGZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gYyhhLGIpe3ZhciBjPXRoaXMsZD1hLiRub2RlWzBdLnZhbHVlLGU9YS4kbm9kZS5kYXRhKFwidmFsdWVcIiksZj1lfHxkLGc9ZT9iLmZvcm1hdFN1Ym1pdDpiLmZvcm1hdDtjLnNldHRpbmdzPWIsYy4kbm9kZT1hLiRub2RlLGMucXVldWU9e2ludGVydmFsOlwiaVwiLG1pbjpcIm1lYXN1cmUgY3JlYXRlXCIsbWF4OlwibWVhc3VyZSBjcmVhdGVcIixub3c6XCJub3cgY3JlYXRlXCIsc2VsZWN0OlwicGFyc2UgY3JlYXRlIHZhbGlkYXRlXCIsaGlnaGxpZ2h0OlwicGFyc2UgY3JlYXRlIHZhbGlkYXRlXCIsdmlldzpcInBhcnNlIGNyZWF0ZSB2YWxpZGF0ZVwiLGRpc2FibGU6XCJkZWFjdGl2YXRlXCIsZW5hYmxlOlwiYWN0aXZhdGVcIn0sYy5pdGVtPXt9LGMuaXRlbS5pbnRlcnZhbD1iLmludGVydmFsfHwzMCxjLml0ZW0uZGlzYWJsZT0oYi5kaXNhYmxlfHxbXSkuc2xpY2UoMCksYy5pdGVtLmVuYWJsZT0tZnVuY3Rpb24oYSl7cmV0dXJuIGFbMF09PT0hMD9hLnNoaWZ0KCk6LTF9KGMuaXRlbS5kaXNhYmxlKSxjLnNldChcIm1pblwiLGIubWluKS5zZXQoXCJtYXhcIixiLm1heCkuc2V0KFwibm93XCIpLGY/Yy5zZXQoXCJzZWxlY3RcIixmLHtmb3JtYXQ6Zyxmcm9tVmFsdWU6ISFkfSk6Yy5zZXQoXCJzZWxlY3RcIixudWxsKS5zZXQoXCJoaWdobGlnaHRcIixjLml0ZW0ubm93KSxjLmtleT17NDA6MSwzODotMSwzOToxLDM3Oi0xLGdvOmZ1bmN0aW9uKGEpe2Muc2V0KFwiaGlnaGxpZ2h0XCIsYy5pdGVtLmhpZ2hsaWdodC5waWNrK2EqYy5pdGVtLmludGVydmFsLHtpbnRlcnZhbDphKmMuaXRlbS5pbnRlcnZhbH0pLHRoaXMucmVuZGVyKCl9fSxhLm9uKFwicmVuZGVyXCIsZnVuY3Rpb24oKXt2YXIgYz1hLiRyb290LmNoaWxkcmVuKCksZD1jLmZpbmQoXCIuXCIrYi5rbGFzcy52aWV3c2V0KTtkLmxlbmd0aCYmKGNbMF0uc2Nyb2xsVG9wPX5+ZC5wb3NpdGlvbigpLnRvcC0yKmRbMF0uY2xpZW50SGVpZ2h0KX0pLm9uKFwib3BlblwiLGZ1bmN0aW9uKCl7YS4kcm9vdC5maW5kKFwiYnV0dG9uXCIpLmF0dHIoXCJkaXNhYmxlXCIsITEpfSkub24oXCJjbG9zZVwiLGZ1bmN0aW9uKCl7YS4kcm9vdC5maW5kKFwiYnV0dG9uXCIpLmF0dHIoXCJkaXNhYmxlXCIsITApfSl9dmFyIGQ9MjQsZT02MCxmPTEyLGc9ZCplLGg9YS5fO2MucHJvdG90eXBlLnNldD1mdW5jdGlvbihhLGIsYyl7dmFyIGQ9dGhpcyxlPWQuaXRlbTtyZXR1cm4gbnVsbD09PWI/KGVbYV09YixkKTooZVtcImVuYWJsZVwiPT1hP1wiZGlzYWJsZVwiOlwiZmxpcFwiPT1hP1wiZW5hYmxlXCI6YV09ZC5xdWV1ZVthXS5zcGxpdChcIiBcIikubWFwKGZ1bmN0aW9uKGUpe3JldHVybiBiPWRbZV0oYSxiLGMpfSkucG9wKCksXCJzZWxlY3RcIj09YT9kLnNldChcImhpZ2hsaWdodFwiLGUuc2VsZWN0LGMpOlwiaGlnaGxpZ2h0XCI9PWE/ZC5zZXQoXCJ2aWV3XCIsZS5oaWdobGlnaHQsYyk6XCJpbnRlcnZhbFwiPT1hP2Quc2V0KFwibWluXCIsZS5taW4sYykuc2V0KFwibWF4XCIsZS5tYXgsYyk6YS5tYXRjaCgvXihmbGlwfG1pbnxtYXh8ZGlzYWJsZXxlbmFibGUpJC8pJiYoXCJtaW5cIj09YSYmZC5zZXQoXCJtYXhcIixlLm1heCxjKSxlLnNlbGVjdCYmZC5kaXNhYmxlZChlLnNlbGVjdCkmJmQuc2V0KFwic2VsZWN0XCIsZS5zZWxlY3QsYyksZS5oaWdobGlnaHQmJmQuZGlzYWJsZWQoZS5oaWdobGlnaHQpJiZkLnNldChcImhpZ2hsaWdodFwiLGUuaGlnaGxpZ2h0LGMpKSxkKX0sYy5wcm90b3R5cGUuZ2V0PWZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLml0ZW1bYV19LGMucHJvdG90eXBlLmNyZWF0ZT1mdW5jdGlvbihhLGMsZil7dmFyIGk9dGhpcztyZXR1cm4gYz12b2lkIDA9PT1jP2E6YyxoLmlzRGF0ZShjKSYmKGM9W2MuZ2V0SG91cnMoKSxjLmdldE1pbnV0ZXMoKV0pLGIuaXNPYmplY3QoYykmJmguaXNJbnRlZ2VyKGMucGljayk/Yz1jLnBpY2s6Yi5pc0FycmF5KGMpP2M9K2NbMF0qZSsgK2NbMV06aC5pc0ludGVnZXIoYyl8fChjPWkubm93KGEsYyxmKSksXCJtYXhcIj09YSYmYzxpLml0ZW0ubWluLnBpY2smJihjKz1nKSxcIm1pblwiIT1hJiZcIm1heFwiIT1hJiYoYy1pLml0ZW0ubWluLnBpY2spJWkuaXRlbS5pbnRlcnZhbCE9PTAmJihjKz1pLml0ZW0uaW50ZXJ2YWwpLGM9aS5ub3JtYWxpemUoYSxjLGYpLHtob3VyOn5+KGQrYy9lKSVkLG1pbnM6KGUrYyVlKSVlLHRpbWU6KGcrYyklZyxwaWNrOmN9fSxjLnByb3RvdHlwZS5jcmVhdGVSYW5nZT1mdW5jdGlvbihhLGMpe3ZhciBkPXRoaXMsZT1mdW5jdGlvbihhKXtyZXR1cm4gYT09PSEwfHxiLmlzQXJyYXkoYSl8fGguaXNEYXRlKGEpP2QuY3JlYXRlKGEpOmF9O3JldHVybiBoLmlzSW50ZWdlcihhKXx8KGE9ZShhKSksaC5pc0ludGVnZXIoYyl8fChjPWUoYykpLGguaXNJbnRlZ2VyKGEpJiZiLmlzT2JqZWN0KGMpP2E9W2MuaG91cixjLm1pbnMrYSpkLnNldHRpbmdzLmludGVydmFsXTpoLmlzSW50ZWdlcihjKSYmYi5pc09iamVjdChhKSYmKGM9W2EuaG91cixhLm1pbnMrYypkLnNldHRpbmdzLmludGVydmFsXSkse2Zyb206ZShhKSx0bzplKGMpfX0sYy5wcm90b3R5cGUud2l0aGluUmFuZ2U9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT10aGlzLmNyZWF0ZVJhbmdlKGEuZnJvbSxhLnRvKSxiLnBpY2s+PWEuZnJvbS5waWNrJiZiLnBpY2s8PWEudG8ucGlja30sYy5wcm90b3R5cGUub3ZlcmxhcFJhbmdlcz1mdW5jdGlvbihhLGIpe3ZhciBjPXRoaXM7cmV0dXJuIGE9Yy5jcmVhdGVSYW5nZShhLmZyb20sYS50byksYj1jLmNyZWF0ZVJhbmdlKGIuZnJvbSxiLnRvKSxjLndpdGhpblJhbmdlKGEsYi5mcm9tKXx8Yy53aXRoaW5SYW5nZShhLGIudG8pfHxjLndpdGhpblJhbmdlKGIsYS5mcm9tKXx8Yy53aXRoaW5SYW5nZShiLGEudG8pfSxjLnByb3RvdHlwZS5ub3c9ZnVuY3Rpb24oYSxiKXt2YXIgYyxkPXRoaXMuaXRlbS5pbnRlcnZhbCxmPW5ldyBEYXRlLGc9Zi5nZXRIb3VycygpKmUrZi5nZXRNaW51dGVzKCksaT1oLmlzSW50ZWdlcihiKTtyZXR1cm4gZy09ZyVkLGM9MD5iJiYtZD49ZCpiK2csZys9XCJtaW5cIj09YSYmYz8wOmQsaSYmKGcrPWQqKGMmJlwibWF4XCIhPWE/YisxOmIpKSxnfSxjLnByb3RvdHlwZS5ub3JtYWxpemU9ZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzLml0ZW0uaW50ZXJ2YWwsZD10aGlzLml0ZW0ubWluJiZ0aGlzLml0ZW0ubWluLnBpY2t8fDA7cmV0dXJuIGItPVwibWluXCI9PWE/MDooYi1kKSVjfSxjLnByb3RvdHlwZS5tZWFzdXJlPWZ1bmN0aW9uKGEsYyxmKXt2YXIgZz10aGlzO3JldHVybiBjP2M9PT0hMHx8aC5pc0ludGVnZXIoYyk/Yz1nLm5vdyhhLGMsZik6Yi5pc09iamVjdChjKSYmaC5pc0ludGVnZXIoYy5waWNrKSYmKGM9Zy5ub3JtYWxpemUoYSxjLnBpY2ssZikpOmM9XCJtaW5cIj09YT9bMCwwXTpbZC0xLGUtMV0sY30sYy5wcm90b3R5cGUudmFsaWRhdGU9ZnVuY3Rpb24oYSxiLGMpe3ZhciBkPXRoaXMsZT1jJiZjLmludGVydmFsP2MuaW50ZXJ2YWw6ZC5pdGVtLmludGVydmFsO3JldHVybiBkLmRpc2FibGVkKGIpJiYoYj1kLnNoaWZ0KGIsZSkpLGI9ZC5zY29wZShiKSxkLmRpc2FibGVkKGIpJiYoYj1kLnNoaWZ0KGIsLTEqZSkpLGJ9LGMucHJvdG90eXBlLmRpc2FibGVkPWZ1bmN0aW9uKGEpe3ZhciBjPXRoaXMsZD1jLml0ZW0uZGlzYWJsZS5maWx0ZXIoZnVuY3Rpb24oZCl7cmV0dXJuIGguaXNJbnRlZ2VyKGQpP2EuaG91cj09ZDpiLmlzQXJyYXkoZCl8fGguaXNEYXRlKGQpP2EucGljaz09Yy5jcmVhdGUoZCkucGljazpiLmlzT2JqZWN0KGQpP2Mud2l0aGluUmFuZ2UoZCxhKTp2b2lkIDB9KTtyZXR1cm4gZD1kLmxlbmd0aCYmIWQuZmlsdGVyKGZ1bmN0aW9uKGEpe3JldHVybiBiLmlzQXJyYXkoYSkmJlwiaW52ZXJ0ZWRcIj09YVsyXXx8Yi5pc09iamVjdChhKSYmYS5pbnZlcnRlZH0pLmxlbmd0aCwtMT09PWMuaXRlbS5lbmFibGU/IWQ6ZHx8YS5waWNrPGMuaXRlbS5taW4ucGlja3x8YS5waWNrPmMuaXRlbS5tYXgucGlja30sYy5wcm90b3R5cGUuc2hpZnQ9ZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzLGQ9Yy5pdGVtLm1pbi5waWNrLGU9Yy5pdGVtLm1heC5waWNrO2ZvcihiPWJ8fGMuaXRlbS5pbnRlcnZhbDtjLmRpc2FibGVkKGEpJiYoYT1jLmNyZWF0ZShhLnBpY2srPWIpLCEoYS5waWNrPD1kfHxhLnBpY2s+PWUpKTspO3JldHVybiBhfSxjLnByb3RvdHlwZS5zY29wZT1mdW5jdGlvbihhKXt2YXIgYj10aGlzLml0ZW0ubWluLnBpY2ssYz10aGlzLml0ZW0ubWF4LnBpY2s7cmV0dXJuIHRoaXMuY3JlYXRlKGEucGljaz5jP2M6YS5waWNrPGI/YjphKX0sYy5wcm90b3R5cGUucGFyc2U9ZnVuY3Rpb24oYSxjLGQpe3ZhciBmLGcsaSxqLGssbD10aGlzLG09e307aWYoIWN8fGguaXNJbnRlZ2VyKGMpfHxiLmlzQXJyYXkoYyl8fGguaXNEYXRlKGMpfHxiLmlzT2JqZWN0KGMpJiZoLmlzSW50ZWdlcihjLnBpY2spKXJldHVybiBjO2QmJmQuZm9ybWF0fHwoZD1kfHx7fSxkLmZvcm1hdD1sLnNldHRpbmdzLmZvcm1hdCksbC5mb3JtYXRzLnRvQXJyYXkoZC5mb3JtYXQpLm1hcChmdW5jdGlvbihhKXt2YXIgYixkPWwuZm9ybWF0c1thXSxlPWQ/aC50cmlnZ2VyKGQsbCxbYyxtXSk6YS5yZXBsYWNlKC9eIS8sXCJcIikubGVuZ3RoO2QmJihiPWMuc3Vic3RyKDAsZSksbVthXT1iLm1hdGNoKC9eXFxkKyQvKT8rYjpiKSxjPWMuc3Vic3RyKGUpfSk7Zm9yKGogaW4gbSlrPW1bal0saC5pc0ludGVnZXIoayk/ai5tYXRjaCgvXihofGhoKSQvaSk/KGY9aywoXCJoXCI9PWp8fFwiaGhcIj09aikmJihmJT0xMikpOlwiaVwiPT1qJiYoZz1rKTpqLm1hdGNoKC9eYSQvaSkmJmsubWF0Y2goL15wL2kpJiYoXCJoXCJpbiBtfHxcImhoXCJpbiBtKSYmKGk9ITApO3JldHVybihpP2YrMTI6ZikqZStnfSxjLnByb3RvdHlwZS5mb3JtYXRzPXtoOmZ1bmN0aW9uKGEsYil7cmV0dXJuIGE/aC5kaWdpdHMoYSk6Yi5ob3VyJWZ8fGZ9LGhoOmZ1bmN0aW9uKGEsYil7cmV0dXJuIGE/MjpoLmxlYWQoYi5ob3VyJWZ8fGYpfSxIOmZ1bmN0aW9uKGEsYil7cmV0dXJuIGE/aC5kaWdpdHMoYSk6XCJcIitiLmhvdXIlMjR9LEhIOmZ1bmN0aW9uKGEsYil7cmV0dXJuIGE/aC5kaWdpdHMoYSk6aC5sZWFkKGIuaG91ciUyNCl9LGk6ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT8yOmgubGVhZChiLm1pbnMpfSxhOmZ1bmN0aW9uKGEsYil7cmV0dXJuIGE/NDpnLzI+Yi50aW1lJWc/XCJhLm0uXCI6XCJwLm0uXCJ9LEE6ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT8yOmcvMj5iLnRpbWUlZz9cIkFNXCI6XCJQTVwifSx0b0FycmF5OmZ1bmN0aW9uKGEpe3JldHVybiBhLnNwbGl0KC8oaHsxLDJ9fEh7MSwyfXxpfGF8QXwhLikvZyl9LHRvU3RyaW5nOmZ1bmN0aW9uKGEsYil7dmFyIGM9dGhpcztyZXR1cm4gYy5mb3JtYXRzLnRvQXJyYXkoYSkubWFwKGZ1bmN0aW9uKGEpe3JldHVybiBoLnRyaWdnZXIoYy5mb3JtYXRzW2FdLGMsWzAsYl0pfHxhLnJlcGxhY2UoL14hLyxcIlwiKX0pLmpvaW4oXCJcIil9fSxjLnByb3RvdHlwZS5pc1RpbWVFeGFjdD1mdW5jdGlvbihhLGMpe3ZhciBkPXRoaXM7cmV0dXJuIGguaXNJbnRlZ2VyKGEpJiZoLmlzSW50ZWdlcihjKXx8XCJib29sZWFuXCI9PXR5cGVvZiBhJiZcImJvb2xlYW5cIj09dHlwZW9mIGM/YT09PWM6KGguaXNEYXRlKGEpfHxiLmlzQXJyYXkoYSkpJiYoaC5pc0RhdGUoYyl8fGIuaXNBcnJheShjKSk/ZC5jcmVhdGUoYSkucGljaz09PWQuY3JlYXRlKGMpLnBpY2s6Yi5pc09iamVjdChhKSYmYi5pc09iamVjdChjKT9kLmlzVGltZUV4YWN0KGEuZnJvbSxjLmZyb20pJiZkLmlzVGltZUV4YWN0KGEudG8sYy50byk6ITF9LGMucHJvdG90eXBlLmlzVGltZU92ZXJsYXA9ZnVuY3Rpb24oYSxjKXt2YXIgZD10aGlzO3JldHVybiBoLmlzSW50ZWdlcihhKSYmKGguaXNEYXRlKGMpfHxiLmlzQXJyYXkoYykpP2E9PT1kLmNyZWF0ZShjKS5ob3VyOmguaXNJbnRlZ2VyKGMpJiYoaC5pc0RhdGUoYSl8fGIuaXNBcnJheShhKSk/Yz09PWQuY3JlYXRlKGEpLmhvdXI6Yi5pc09iamVjdChhKSYmYi5pc09iamVjdChjKT9kLm92ZXJsYXBSYW5nZXMoYSxjKTohMX0sYy5wcm90b3R5cGUuZmxpcEVuYWJsZT1mdW5jdGlvbihhKXt2YXIgYj10aGlzLml0ZW07Yi5lbmFibGU9YXx8KC0xPT1iLmVuYWJsZT8xOi0xKX0sYy5wcm90b3R5cGUuZGVhY3RpdmF0ZT1mdW5jdGlvbihhLGMpe3ZhciBkPXRoaXMsZT1kLml0ZW0uZGlzYWJsZS5zbGljZSgwKTtyZXR1cm5cImZsaXBcIj09Yz9kLmZsaXBFbmFibGUoKTpjPT09ITE/KGQuZmxpcEVuYWJsZSgxKSxlPVtdKTpjPT09ITA/KGQuZmxpcEVuYWJsZSgtMSksZT1bXSk6Yy5tYXAoZnVuY3Rpb24oYSl7Zm9yKHZhciBjLGY9MDtmPGUubGVuZ3RoO2YrPTEpaWYoZC5pc1RpbWVFeGFjdChhLGVbZl0pKXtjPSEwO2JyZWFrfWN8fChoLmlzSW50ZWdlcihhKXx8aC5pc0RhdGUoYSl8fGIuaXNBcnJheShhKXx8Yi5pc09iamVjdChhKSYmYS5mcm9tJiZhLnRvKSYmZS5wdXNoKGEpfSksZX0sYy5wcm90b3R5cGUuYWN0aXZhdGU9ZnVuY3Rpb24oYSxjKXt2YXIgZD10aGlzLGU9ZC5pdGVtLmRpc2FibGUsZj1lLmxlbmd0aDtyZXR1cm5cImZsaXBcIj09Yz9kLmZsaXBFbmFibGUoKTpjPT09ITA/KGQuZmxpcEVuYWJsZSgxKSxlPVtdKTpjPT09ITE/KGQuZmxpcEVuYWJsZSgtMSksZT1bXSk6Yy5tYXAoZnVuY3Rpb24oYSl7dmFyIGMsZyxpLGo7Zm9yKGk9MDtmPmk7aSs9MSl7aWYoZz1lW2ldLGQuaXNUaW1lRXhhY3QoZyxhKSl7Yz1lW2ldPW51bGwsaj0hMDticmVha31pZihkLmlzVGltZU92ZXJsYXAoZyxhKSl7Yi5pc09iamVjdChhKT8oYS5pbnZlcnRlZD0hMCxjPWEpOmIuaXNBcnJheShhKT8oYz1hLGNbMl18fGMucHVzaChcImludmVydGVkXCIpKTpoLmlzRGF0ZShhKSYmKGM9W2EuZ2V0RnVsbFllYXIoKSxhLmdldE1vbnRoKCksYS5nZXREYXRlKCksXCJpbnZlcnRlZFwiXSk7YnJlYWt9fWlmKGMpZm9yKGk9MDtmPmk7aSs9MSlpZihkLmlzVGltZUV4YWN0KGVbaV0sYSkpe2VbaV09bnVsbDticmVha31pZihqKWZvcihpPTA7Zj5pO2krPTEpaWYoZC5pc1RpbWVPdmVybGFwKGVbaV0sYSkpe2VbaV09bnVsbDticmVha31jJiZlLnB1c2goYyl9KSxlLmZpbHRlcihmdW5jdGlvbihhKXtyZXR1cm4gbnVsbCE9YX0pfSxjLnByb3RvdHlwZS5pPWZ1bmN0aW9uKGEsYil7cmV0dXJuIGguaXNJbnRlZ2VyKGIpJiZiPjA/Yjp0aGlzLml0ZW0uaW50ZXJ2YWx9LGMucHJvdG90eXBlLm5vZGVzPWZ1bmN0aW9uKGEpe3ZhciBiPXRoaXMsYz1iLnNldHRpbmdzLGQ9Yi5pdGVtLnNlbGVjdCxlPWIuaXRlbS5oaWdobGlnaHQsZj1iLml0ZW0udmlldyxnPWIuaXRlbS5kaXNhYmxlO3JldHVybiBoLm5vZGUoXCJ1bFwiLGguZ3JvdXAoe21pbjpiLml0ZW0ubWluLnBpY2ssbWF4OmIuaXRlbS5tYXgucGljayxpOmIuaXRlbS5pbnRlcnZhbCxub2RlOlwibGlcIixpdGVtOmZ1bmN0aW9uKGEpe2E9Yi5jcmVhdGUoYSk7dmFyIGk9YS5waWNrLGo9ZCYmZC5waWNrPT1pLGs9ZSYmZS5waWNrPT1pLGw9ZyYmYi5kaXNhYmxlZChhKTtyZXR1cm5baC50cmlnZ2VyKGIuZm9ybWF0cy50b1N0cmluZyxiLFtoLnRyaWdnZXIoYy5mb3JtYXRMYWJlbCxiLFthXSl8fGMuZm9ybWF0LGFdKSxmdW5jdGlvbihhKXtyZXR1cm4gaiYmYS5wdXNoKGMua2xhc3Muc2VsZWN0ZWQpLGsmJmEucHVzaChjLmtsYXNzLmhpZ2hsaWdodGVkKSxmJiZmLnBpY2s9PWkmJmEucHVzaChjLmtsYXNzLnZpZXdzZXQpLGwmJmEucHVzaChjLmtsYXNzLmRpc2FibGVkKSxhLmpvaW4oXCIgXCIpfShbYy5rbGFzcy5saXN0SXRlbV0pLFwiZGF0YS1waWNrPVwiK2EucGljaytcIiBcIitoLmFyaWFBdHRyKHtyb2xlOlwiYnV0dG9uXCIsY29udHJvbHM6Yi4kbm9kZVswXS5pZCxjaGVja2VkOmomJmIuJG5vZGUudmFsKCk9PT1oLnRyaWdnZXIoYi5mb3JtYXRzLnRvU3RyaW5nLGIsW2MuZm9ybWF0LGFdKT8hMDpudWxsLGFjdGl2ZWRlc2NlbmRhbnQ6az8hMDpudWxsLGRpc2FibGVkOmw/ITA6bnVsbH0pXX19KStoLm5vZGUoXCJsaVwiLGgubm9kZShcImJ1dHRvblwiLGMuY2xlYXIsYy5rbGFzcy5idXR0b25DbGVhcixcInR5cGU9YnV0dG9uIGRhdGEtY2xlYXI9MVwiKyhhP1wiXCI6XCIgZGlzYWJsZVwiKSkpLGMua2xhc3MubGlzdCl9LGMuZGVmYXVsdHM9ZnVuY3Rpb24oYSl7cmV0dXJue2NsZWFyOlwiQ2xlYXJcIixmb3JtYXQ6XCJoOmkgQVwiLGludGVydmFsOjMwLGtsYXNzOntwaWNrZXI6YStcIiBcIithK1wiLS10aW1lXCIsaG9sZGVyOmErXCJfX2hvbGRlclwiLGxpc3Q6YStcIl9fbGlzdFwiLGxpc3RJdGVtOmErXCJfX2xpc3QtaXRlbVwiLGRpc2FibGVkOmErXCJfX2xpc3QtaXRlbS0tZGlzYWJsZWRcIixzZWxlY3RlZDphK1wiX19saXN0LWl0ZW0tLXNlbGVjdGVkXCIsaGlnaGxpZ2h0ZWQ6YStcIl9fbGlzdC1pdGVtLS1oaWdobGlnaHRlZFwiLHZpZXdzZXQ6YStcIl9fbGlzdC1pdGVtLS12aWV3c2V0XCIsbm93OmErXCJfX2xpc3QtaXRlbS0tbm93XCIsYnV0dG9uQ2xlYXI6YStcIl9fYnV0dG9uLS1jbGVhclwifX19KGEua2xhc3NlcygpLnBpY2tlciksYS5leHRlbmQoXCJwaWNrYXRpbWVcIixjKX0pO1xuLyohXG4gKiBMZWdhY3kgYnJvd3NlciBzdXBwb3J0XG4gKi9cbltdLm1hcHx8KEFycmF5LnByb3RvdHlwZS5tYXA9ZnVuY3Rpb24oYSxiKXtmb3IodmFyIGM9dGhpcyxkPWMubGVuZ3RoLGU9bmV3IEFycmF5KGQpLGY9MDtkPmY7ZisrKWYgaW4gYyYmKGVbZl09YS5jYWxsKGIsY1tmXSxmLGMpKTtyZXR1cm4gZX0pLFtdLmZpbHRlcnx8KEFycmF5LnByb3RvdHlwZS5maWx0ZXI9ZnVuY3Rpb24oYSl7aWYobnVsbD09dGhpcyl0aHJvdyBuZXcgVHlwZUVycm9yO3ZhciBiPU9iamVjdCh0aGlzKSxjPWIubGVuZ3RoPj4+MDtpZihcImZ1bmN0aW9uXCIhPXR5cGVvZiBhKXRocm93IG5ldyBUeXBlRXJyb3I7Zm9yKHZhciBkPVtdLGU9YXJndW1lbnRzWzFdLGY9MDtjPmY7ZisrKWlmKGYgaW4gYil7dmFyIGc9YltmXTthLmNhbGwoZSxnLGYsYikmJmQucHVzaChnKX1yZXR1cm4gZH0pLFtdLmluZGV4T2Z8fChBcnJheS5wcm90b3R5cGUuaW5kZXhPZj1mdW5jdGlvbihhKXtpZihudWxsPT10aGlzKXRocm93IG5ldyBUeXBlRXJyb3I7dmFyIGI9T2JqZWN0KHRoaXMpLGM9Yi5sZW5ndGg+Pj4wO2lmKDA9PT1jKXJldHVybi0xO3ZhciBkPTA7aWYoYXJndW1lbnRzLmxlbmd0aD4xJiYoZD1OdW1iZXIoYXJndW1lbnRzWzFdKSxkIT1kP2Q9MDowIT09ZCYmMS8wIT1kJiZkIT0tMS8wJiYoZD0oZD4wfHwtMSkqTWF0aC5mbG9vcihNYXRoLmFicyhkKSkpKSxkPj1jKXJldHVybi0xO2Zvcih2YXIgZT1kPj0wP2Q6TWF0aC5tYXgoYy1NYXRoLmFicyhkKSwwKTtjPmU7ZSsrKWlmKGUgaW4gYiYmYltlXT09PWEpcmV0dXJuIGU7cmV0dXJuLTF9KTsvKiFcbiAqIENyb3NzLUJyb3dzZXIgU3BsaXQgMS4xLjFcbiAqIENvcHlyaWdodCAyMDA3LTIwMTIgU3RldmVuIExldml0aGFuIDxzdGV2ZW5sZXZpdGhhbi5jb20+XG4gKiBBdmFpbGFibGUgdW5kZXIgdGhlIE1JVCBMaWNlbnNlXG4gKiBodHRwOi8vYmxvZy5zdGV2ZW5sZXZpdGhhbi5jb20vYXJjaGl2ZXMvY3Jvc3MtYnJvd3Nlci1zcGxpdFxuICovXG52YXIgbmF0aXZlU3BsaXQ9U3RyaW5nLnByb3RvdHlwZS5zcGxpdCxjb21wbGlhbnRFeGVjTnBjZz12b2lkIDA9PT0vKCk/Py8uZXhlYyhcIlwiKVsxXTtTdHJpbmcucHJvdG90eXBlLnNwbGl0PWZ1bmN0aW9uKGEsYil7dmFyIGM9dGhpcztpZihcIltvYmplY3QgUmVnRXhwXVwiIT09T2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGEpKXJldHVybiBuYXRpdmVTcGxpdC5jYWxsKGMsYSxiKTt2YXIgZCxlLGYsZyxoPVtdLGk9KGEuaWdub3JlQ2FzZT9cImlcIjpcIlwiKSsoYS5tdWx0aWxpbmU/XCJtXCI6XCJcIikrKGEuZXh0ZW5kZWQ/XCJ4XCI6XCJcIikrKGEuc3RpY2t5P1wieVwiOlwiXCIpLGo9MDtmb3IoYT1uZXcgUmVnRXhwKGEuc291cmNlLGkrXCJnXCIpLGMrPVwiXCIsY29tcGxpYW50RXhlY05wY2d8fChkPW5ldyBSZWdFeHAoXCJeXCIrYS5zb3VyY2UrXCIkKD8hXFxcXHMpXCIsaSkpLGI9dm9pZCAwPT09Yj8tMT4+PjA6Yj4+PjA7KGU9YS5leGVjKGMpKSYmKGY9ZS5pbmRleCtlWzBdLmxlbmd0aCwhKGY+aiYmKGgucHVzaChjLnNsaWNlKGosZS5pbmRleCkpLCFjb21wbGlhbnRFeGVjTnBjZyYmZS5sZW5ndGg+MSYmZVswXS5yZXBsYWNlKGQsZnVuY3Rpb24oKXtmb3IodmFyIGE9MTthPGFyZ3VtZW50cy5sZW5ndGgtMjthKyspdm9pZCAwPT09YXJndW1lbnRzW2FdJiYoZVthXT12b2lkIDApfSksZS5sZW5ndGg+MSYmZS5pbmRleDxjLmxlbmd0aCYmQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoaCxlLnNsaWNlKDEpKSxnPWVbMF0ubGVuZ3RoLGo9ZixoLmxlbmd0aD49YikpKTspYS5sYXN0SW5kZXg9PT1lLmluZGV4JiZhLmxhc3RJbmRleCsrO3JldHVybiBqPT09Yy5sZW5ndGg/KGd8fCFhLnRlc3QoXCJcIikpJiZoLnB1c2goXCJcIik6aC5wdXNoKGMuc2xpY2UoaikpLGgubGVuZ3RoPmI/aC5zbGljZSgwLGIpOmh9O1xuYW5ndWxhci5tb2R1bGUoXCJhbmd1bGFyLWRhdGVwaWNrZXJcIixbXSkuZGlyZWN0aXZlKFwicGlja0FEYXRlXCIsZnVuY3Rpb24oKXtyZXR1cm57cmVzdHJpY3Q6XCJBXCIsc2NvcGU6e3BpY2tBRGF0ZTpcIj1cIixwaWNrQURhdGVPcHRpb25zOlwiPVwifSxsaW5rOmZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gYyhjKXtpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBmJiZmLmFwcGx5KHRoaXMsYXJndW1lbnRzKSwhYS4kJHBoYXNlJiYhYS4kcm9vdC4kJHBoYXNlKXt2YXIgZD1iLnBpY2thZGF0ZShcInBpY2tlclwiKS5nZXQoXCJzZWxlY3RcIik7YS4kYXBwbHkoZnVuY3Rpb24oKXtyZXR1cm4gYy5oYXNPd25Qcm9wZXJ0eShcImNsZWFyXCIpP3ZvaWQoYS5waWNrQURhdGU9bnVsbCk6KGEucGlja0FEYXRlJiZcInN0cmluZ1wiIT10eXBlb2YgYS5waWNrQURhdGV8fChhLnBpY2tBRGF0ZT1uZXcgRGF0ZSgwKSksYS5waWNrQURhdGUuc2V0WWVhcihkLm9iai5nZXRZZWFyKCkrMTkwMCksYS5waWNrQURhdGUuc2V0TW9udGgoZC5vYmouZ2V0TW9udGgoKSksdm9pZCBhLnBpY2tBRGF0ZS5zZXREYXRlKGQub2JqLmdldERhdGUoKSkpfSl9fWZ1bmN0aW9uIGQoKXtpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBnJiZnLmFwcGx5KHRoaXMsYXJndW1lbnRzKSxcInVuZGVmaW5lZFwiIT10eXBlb2YgY29yZG92YSYmY29yZG92YS5wbHVnaW5zJiZjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQpe3ZhciBhPWZ1bmN0aW9uKCl7Y29yZG92YS5wbHVnaW5zLktleWJvYXJkLmNsb3NlKCksd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJuYXRpdmUua2V5Ym9hcmRzaG93XCIsdGhpcyl9O3dpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibmF0aXZlLmtleWJvYXJkc2hvd1wiLGEpLHNldFRpbWVvdXQoZnVuY3Rpb24oKXt3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm5hdGl2ZS5rZXlib2FyZHNob3dcIixhKX0sNTAwKX19dmFyIGU9YS5waWNrQURhdGVPcHRpb25zfHx7fSxmPWUub25TZXQsZz1lLm9uQ2xvc2U7Yi5waWNrYWRhdGUoYW5ndWxhci5leHRlbmQoZSx7b25TZXQ6YyxvbkNsb3NlOmQsY29udGFpbmVyOmRvY3VtZW50LmJvZHl9KSksc2V0VGltZW91dChmdW5jdGlvbigpe2EucGlja0FEYXRlJiZiLnBpY2thZGF0ZShcInBpY2tlclwiKS5zZXQoXCJzZWxlY3RcIixhLnBpY2tBRGF0ZSl9LDFlMyl9fX0pLmRpcmVjdGl2ZShcInBpY2tBVGltZVwiLGZ1bmN0aW9uKCl7cmV0dXJue3Jlc3RyaWN0OlwiQVwiLHNjb3BlOntwaWNrQVRpbWU6XCI9XCIscGlja0FUaW1lT3B0aW9uczpcIj1cIn0sbGluazpmdW5jdGlvbihhLGIpe2Z1bmN0aW9uIGMoYyl7aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgZiYmZi5hcHBseSh0aGlzLGFyZ3VtZW50cyksIWEuJCRwaGFzZSYmIWEuJHJvb3QuJCRwaGFzZSl7dmFyIGQ9Yi5waWNrYXRpbWUoXCJwaWNrZXJcIikuZ2V0KFwic2VsZWN0XCIpO2EuJGFwcGx5KGZ1bmN0aW9uKCl7cmV0dXJuIGMuaGFzT3duUHJvcGVydHkoXCJjbGVhclwiKT92b2lkKGEucGlja0FUaW1lPW51bGwpOihhLnBpY2tBVGltZSYmXCJzdHJpbmdcIiE9dHlwZW9mIGEucGlja0FUaW1lfHwoYS5waWNrQVRpbWU9bmV3IERhdGUpLGEucGlja0FUaW1lLnNldEhvdXJzKGQuaG91ciksYS5waWNrQVRpbWUuc2V0TWludXRlcyhkLm1pbnMpLGEucGlja0FUaW1lLnNldFNlY29uZHMoMCksdm9pZCBhLnBpY2tBVGltZS5zZXRNaWxsaXNlY29uZHMoMCkpfSl9fWZ1bmN0aW9uIGQoKXtpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBnJiZnLmFwcGx5KHRoaXMsYXJndW1lbnRzKSxcInVuZGVmaW5lZFwiIT10eXBlb2YgY29yZG92YSYmY29yZG92YS5wbHVnaW5zJiZjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQpe3ZhciBhPWZ1bmN0aW9uKCl7Y29yZG92YS5wbHVnaW5zLktleWJvYXJkLmNsb3NlKCksd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJuYXRpdmUua2V5Ym9hcmRzaG93XCIsdGhpcyl9O3dpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibmF0aXZlLmtleWJvYXJkc2hvd1wiLGEpLHNldFRpbWVvdXQoZnVuY3Rpb24oKXt3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm5hdGl2ZS5rZXlib2FyZHNob3dcIixhKX0sNTAwKX19dmFyIGU9YS5waWNrQVRpbWVPcHRpb25zfHx7fSxmPWUub25TZXQsZz1lLm9uQ2xvc2U7Yi5waWNrYXRpbWUoYW5ndWxhci5leHRlbmQoZSx7b25TZXQ6YyxvbkNsb3NlOmQsY29udGFpbmVyOmRvY3VtZW50LmJvZHl9KSksc2V0VGltZW91dChmdW5jdGlvbigpe2EucGlja0FUaW1lJiZiLnBpY2thdGltZShcInBpY2tlclwiKS5zZXQoXCJzZWxlY3RcIixhLnBpY2tBVGltZSl9LDFlMyl9fX0pOyIsIi8vIERlcHMgaXMgc29ydCBvZiBhIHByb2JsZW0gZm9yIHVzLCBtYXliZSBpbiB0aGUgZnV0dXJlIHdlIHdpbGwgYXNrIHRoZSB1c2VyIHRvIGRlcGVuZFxuLy8gb24gbW9kdWxlcyBmb3IgYWRkLW9uc1xuXG52YXIgZGVwcyA9IFsnT2JqZWN0UGF0aCddO1xudHJ5IHtcbiAgLy9UaGlzIHRocm93cyBhbiBleHBlY3Rpb24gaWYgbW9kdWxlIGRvZXMgbm90IGV4aXN0LlxuICBhbmd1bGFyLm1vZHVsZSgnbmdTYW5pdGl6ZScpO1xuICBkZXBzLnB1c2goJ25nU2FuaXRpemUnKTtcbn0gY2F0Y2ggKGUpIHt9XG5cbnRyeSB7XG4gIC8vVGhpcyB0aHJvd3MgYW4gZXhwZWN0aW9uIGlmIG1vZHVsZSBkb2VzIG5vdCBleGlzdC5cbiAgYW5ndWxhci5tb2R1bGUoJ3VpLnNvcnRhYmxlJyk7XG4gIGRlcHMucHVzaCgndWkuc29ydGFibGUnKTtcbn0gY2F0Y2ggKGUpIHt9XG5cbnRyeSB7XG4gIC8vVGhpcyB0aHJvd3MgYW4gZXhwZWN0aW9uIGlmIG1vZHVsZSBkb2VzIG5vdCBleGlzdC5cbiAgYW5ndWxhci5tb2R1bGUoJ2FuZ3VsYXJTcGVjdHJ1bUNvbG9ycGlja2VyJyk7XG4gIGRlcHMucHVzaCgnYW5ndWxhclNwZWN0cnVtQ29sb3JwaWNrZXInKTtcbn0gY2F0Y2ggKGUpIHt9XG5cbmFuZ3VsYXIubW9kdWxlKCdzY2hlbWFGb3JtJywgZGVwcyk7XG5cbmFuZ3VsYXIubW9kdWxlKCdzY2hlbWFGb3JtJykucHJvdmlkZXIoJ3NmUGF0aCcsXG5bJ09iamVjdFBhdGhQcm92aWRlcicsIGZ1bmN0aW9uKE9iamVjdFBhdGhQcm92aWRlcikge1xuICB2YXIgT2JqZWN0UGF0aCA9IHtwYXJzZTogT2JqZWN0UGF0aFByb3ZpZGVyLnBhcnNlfTtcblxuICAvLyBpZiB3ZSdyZSBvbiBBbmd1bGFyIDEuMi54LCB3ZSBuZWVkIHRvIGNvbnRpbnVlIHVzaW5nIGRvdCBub3RhdGlvblxuICBpZiAoYW5ndWxhci52ZXJzaW9uLm1ham9yID09PSAxICYmIGFuZ3VsYXIudmVyc2lvbi5taW5vciA8IDMpIHtcbiAgICBPYmplY3RQYXRoLnN0cmluZ2lmeSA9IGZ1bmN0aW9uKGFycikge1xuICAgICAgcmV0dXJuIEFycmF5LmlzQXJyYXkoYXJyKSA/IGFyci5qb2luKCcuJykgOiBhcnIudG9TdHJpbmcoKTtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIE9iamVjdFBhdGguc3RyaW5naWZ5ID0gT2JqZWN0UGF0aFByb3ZpZGVyLnN0cmluZ2lmeTtcbiAgfVxuXG4gIC8vIFdlIHdhbnQgdGhpcyB0byB1c2Ugd2hpY2hldmVyIHN0cmluZ2lmeSBtZXRob2QgaXMgZGVmaW5lZCBhYm92ZSxcbiAgLy8gc28gd2UgaGF2ZSB0byBjb3B5IHRoZSBjb2RlIGhlcmUuXG4gIE9iamVjdFBhdGgubm9ybWFsaXplID0gZnVuY3Rpb24oZGF0YSwgcXVvdGUpIHtcbiAgICByZXR1cm4gT2JqZWN0UGF0aC5zdHJpbmdpZnkoQXJyYXkuaXNBcnJheShkYXRhKSA/IGRhdGEgOiBPYmplY3RQYXRoLnBhcnNlKGRhdGEpLCBxdW90ZSk7XG4gIH07XG5cbiAgdGhpcy5wYXJzZSA9IE9iamVjdFBhdGgucGFyc2U7XG4gIHRoaXMuc3RyaW5naWZ5ID0gT2JqZWN0UGF0aC5zdHJpbmdpZnk7XG4gIHRoaXMubm9ybWFsaXplID0gT2JqZWN0UGF0aC5ub3JtYWxpemU7XG4gIHRoaXMuJGdldCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBPYmplY3RQYXRoO1xuICB9O1xufV0pO1xuXG4vKipcbiAqIEBuZ2RvYyBzZXJ2aWNlXG4gKiBAbmFtZSBzZlNlbGVjdFxuICogQGtpbmQgZnVuY3Rpb25cbiAqXG4gKi9cbmFuZ3VsYXIubW9kdWxlKCdzY2hlbWFGb3JtJykuZmFjdG9yeSgnc2ZTZWxlY3QnLCBbJ3NmUGF0aCcsIGZ1bmN0aW9uKHNmUGF0aCkge1xuICB2YXIgbnVtUmUgPSAvXlxcZCskLztcblxuICAvKipcbiAgICAqIEBkZXNjcmlwdGlvblxuICAgICogVXRpbGl0eSBtZXRob2QgdG8gYWNjZXNzIGRlZXAgcHJvcGVydGllcyB3aXRob3V0XG4gICAgKiB0aHJvd2luZyBlcnJvcnMgd2hlbiB0aGluZ3MgYXJlIG5vdCBkZWZpbmVkLlxuICAgICogQ2FuIGFsc28gc2V0IGEgdmFsdWUgaW4gYSBkZWVwIHN0cnVjdHVyZSwgY3JlYXRpbmcgb2JqZWN0cyB3aGVuIG1pc3NpbmdcbiAgICAqIGV4LlxuICAgICogdmFyIGZvbyA9IFNlbGVjdCgnYWRkcmVzcy5jb250YWN0Lm5hbWUnLG9iailcbiAgICAqIFNlbGVjdCgnYWRkcmVzcy5jb250YWN0Lm5hbWUnLG9iaiwnTGVlcm95JylcbiAgICAqXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gcHJvamVjdGlvbiBBIGRvdCBwYXRoIHRvIHRoZSBwcm9wZXJ0eSB5b3Ugd2FudCB0byBnZXQvc2V0XG4gICAgKiBAcGFyYW0ge29iamVjdH0gb2JqICAgKG9wdGlvbmFsKSBUaGUgb2JqZWN0IHRvIHByb2plY3Qgb24sIGRlZmF1bHRzIHRvICd0aGlzJ1xuICAgICogQHBhcmFtIHtBbnl9ICAgIHZhbHVlVG9TZXQgKG9waW9uYWwpICBUaGUgdmFsdWUgdG8gc2V0LCBpZiBwYXJ0cyBvZiB0aGUgcGF0aCBvZlxuICAgICogICAgICAgICAgICAgICAgIHRoZSBwcm9qZWN0aW9uIGlzIG1pc3NpbmcgZW1wdHkgb2JqZWN0cyB3aWxsIGJlIGNyZWF0ZWQuXG4gICAgKiBAcmV0dXJucyB7QW55fHVuZGVmaW5lZH0gcmV0dXJucyB0aGUgdmFsdWUgYXQgdGhlIGVuZCBvZiB0aGUgcHJvamVjdGlvbiBwYXRoXG4gICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgb3IgdW5kZWZpbmVkIGlmIHRoZXJlIGlzIG5vbmUuXG4gICAgKi9cbiAgcmV0dXJuIGZ1bmN0aW9uKHByb2plY3Rpb24sIG9iaiwgdmFsdWVUb1NldCkge1xuICAgIGlmICghb2JqKSB7XG4gICAgICBvYmogPSB0aGlzO1xuICAgIH1cbiAgICAvL1N1cHBvcnQgW10gYXJyYXkgc3ludGF4XG4gICAgdmFyIHBhcnRzID0gdHlwZW9mIHByb2plY3Rpb24gPT09ICdzdHJpbmcnID8gc2ZQYXRoLnBhcnNlKHByb2plY3Rpb24pIDogcHJvamVjdGlvbjtcblxuICAgIGlmICh0eXBlb2YgdmFsdWVUb1NldCAhPT0gJ3VuZGVmaW5lZCcgJiYgcGFydHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAvL3NwZWNpYWwgY2FzZSwganVzdCBzZXR0aW5nIG9uZSB2YXJpYWJsZVxuICAgICAgb2JqW3BhcnRzWzBdXSA9IHZhbHVlVG9TZXQ7XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgdmFsdWVUb1NldCAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgICAgdHlwZW9mIG9ialtwYXJ0c1swXV0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgLy8gV2UgbmVlZCB0byBsb29rIGFoZWFkIHRvIGNoZWNrIGlmIGFycmF5IGlzIGFwcHJvcHJpYXRlXG4gICAgICBvYmpbcGFydHNbMF1dID0gcGFydHMubGVuZ3RoID4gMiAmJiBudW1SZS50ZXN0KHBhcnRzWzFdKSA/IFtdIDoge307XG4gICAgfVxuXG4gICAgdmFyIHZhbHVlID0gb2JqW3BhcnRzWzBdXTtcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IHBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAvLyBTcGVjaWFsIGNhc2U6IFdlIGFsbG93IEpTT04gRm9ybSBzeW50YXggZm9yIGFycmF5cyB1c2luZyBlbXB0eSBicmFja2V0c1xuICAgICAgLy8gVGhlc2Ugd2lsbCBvZiBjb3Vyc2Ugbm90IHdvcmsgaGVyZSBzbyB3ZSBleGl0IGlmIHRoZXkgYXJlIGZvdW5kLlxuICAgICAgaWYgKHBhcnRzW2ldID09PSAnJykge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiB2YWx1ZVRvU2V0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBpZiAoaSA9PT0gcGFydHMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgIC8vbGFzdCBzdGVwLiBMZXQncyBzZXQgdGhlIHZhbHVlXG4gICAgICAgICAgdmFsdWVbcGFydHNbaV1dID0gdmFsdWVUb1NldDtcbiAgICAgICAgICByZXR1cm4gdmFsdWVUb1NldDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBNYWtlIHN1cmUgdG8gY3JlYXRlIG5ldyBvYmplY3RzIG9uIHRoZSB3YXkgaWYgdGhleSBhcmUgbm90IHRoZXJlLlxuICAgICAgICAgIC8vIFdlIG5lZWQgdG8gbG9vayBhaGVhZCB0byBjaGVjayBpZiBhcnJheSBpcyBhcHByb3ByaWF0ZVxuICAgICAgICAgIHZhciB0bXAgPSB2YWx1ZVtwYXJ0c1tpXV07XG4gICAgICAgICAgaWYgKHR5cGVvZiB0bXAgPT09ICd1bmRlZmluZWQnIHx8IHRtcCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdG1wID0gbnVtUmUudGVzdChwYXJ0c1tpICsgMV0pID8gW10gOiB7fTtcbiAgICAgICAgICAgIHZhbHVlW3BhcnRzW2ldXSA9IHRtcDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFsdWUgPSB0bXA7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodmFsdWUpIHtcbiAgICAgICAgLy9KdXN0IGdldCBuZXggdmFsdWUuXG4gICAgICAgIHZhbHVlID0gdmFsdWVbcGFydHNbaV1dO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG59XSk7XG5cbmFuZ3VsYXIubW9kdWxlKCdzY2hlbWFGb3JtJykucHJvdmlkZXIoJ3NjaGVtYUZvcm1EZWNvcmF0b3JzJyxcblsnJGNvbXBpbGVQcm92aWRlcicsICdzZlBhdGhQcm92aWRlcicsIGZ1bmN0aW9uKCRjb21waWxlUHJvdmlkZXIsIHNmUGF0aFByb3ZpZGVyKSB7XG4gIHZhciBkZWZhdWx0RGVjb3JhdG9yID0gJyc7XG4gIHZhciBkaXJlY3RpdmVzID0ge307XG5cbiAgdmFyIHRlbXBsYXRlVXJsID0gZnVuY3Rpb24obmFtZSwgZm9ybSkge1xuICAgIC8vc2NoZW1hRGVjb3JhdG9yIGlzIGFsaWFzIGZvciB3aGF0ZXZlciBpcyBzZXQgYXMgZGVmYXVsdFxuICAgIGlmIChuYW1lID09PSAnc2ZEZWNvcmF0b3InKSB7XG4gICAgICBuYW1lID0gZGVmYXVsdERlY29yYXRvcjtcbiAgICB9XG5cbiAgICB2YXIgZGlyZWN0aXZlID0gZGlyZWN0aXZlc1tuYW1lXTtcblxuICAgIC8vcnVsZXMgZmlyc3RcbiAgICB2YXIgcnVsZXMgPSBkaXJlY3RpdmUucnVsZXM7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBydWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHJlcyA9IHJ1bGVzW2ldKGZvcm0pO1xuICAgICAgaWYgKHJlcykge1xuICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vdGhlbiBjaGVjayBtYXBwaW5nXG4gICAgaWYgKGRpcmVjdGl2ZS5tYXBwaW5nc1tmb3JtLnR5cGVdKSB7XG4gICAgICByZXR1cm4gZGlyZWN0aXZlLm1hcHBpbmdzW2Zvcm0udHlwZV07XG4gICAgfVxuXG4gICAgLy90cnkgZGVmYXVsdFxuICAgIHJldHVybiBkaXJlY3RpdmUubWFwcGluZ3NbJ2RlZmF1bHQnXTtcbiAgfTtcblxuICB2YXIgY3JlYXRlRGlyZWN0aXZlID0gZnVuY3Rpb24obmFtZSwgb3B0aW9ucykge1xuICAgICRjb21waWxlUHJvdmlkZXIuZGlyZWN0aXZlKG5hbWUsIFsnJHBhcnNlJywgJyRjb21waWxlJywgJyRodHRwJywgJyR0ZW1wbGF0ZUNhY2hlJyxcbiAgICAgIGZ1bmN0aW9uKCRwYXJzZSwgICRjb21waWxlLCAgJGh0dHAsICAkdGVtcGxhdGVDYWNoZSkge1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgcmVzdHJpY3Q6ICdBRScsXG4gICAgICAgICAgcmVwbGFjZTogZmFsc2UsXG4gICAgICAgICAgdHJhbnNjbHVkZTogZmFsc2UsXG4gICAgICAgICAgc2NvcGU6IHRydWUsXG4gICAgICAgICAgcmVxdWlyZTogJz9ec2ZTY2hlbWEnLFxuICAgICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgc2ZTY2hlbWEpIHtcbiAgICAgICAgICAgIC8vcmViaW5kIG91ciBwYXJ0IG9mIHRoZSBmb3JtIHRvIHRoZSBzY29wZS5cbiAgICAgICAgICAgIHZhciBvbmNlID0gc2NvcGUuJHdhdGNoKGF0dHJzLmZvcm0sIGZ1bmN0aW9uKGZvcm0pIHtcblxuICAgICAgICAgICAgICBpZiAoZm9ybSkge1xuICAgICAgICAgICAgICAgIHNjb3BlLmZvcm0gID0gZm9ybTtcblxuICAgICAgICAgICAgICAgIC8vb2sgbGV0J3MgcmVwbGFjZSB0aGF0IHRlbXBsYXRlIVxuICAgICAgICAgICAgICAgIC8vV2UgZG8gdGhpcyBtYW51YWxseSBzaW5jZSB3ZSBuZWVkIHRvIGJpbmQgbmctbW9kZWwgcHJvcGVybHkgYW5kIGFsc29cbiAgICAgICAgICAgICAgICAvL2ZvciBmaWVsZHNldHMgdG8gcmVjdXJzZSBwcm9wZXJseS5cbiAgICAgICAgICAgICAgICB2YXIgdXJsID0gdGVtcGxhdGVVcmwobmFtZSwgZm9ybSk7XG4gICAgICAgICAgICAgICAgJGh0dHAuZ2V0KHVybCwge2NhY2hlOiAkdGVtcGxhdGVDYWNoZX0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgICB2YXIga2V5ID0gZm9ybS5rZXkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNmUGF0aFByb3ZpZGVyLnN0cmluZ2lmeShmb3JtLmtleSkucmVwbGFjZSgvXCIvZywgJyZxdW90OycpIDogJyc7XG4gICAgICAgICAgICAgICAgICB2YXIgdGVtcGxhdGUgPSByZXMuZGF0YS5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICAvXFwkXFwkdmFsdWVcXCRcXCQvZyxcbiAgICAgICAgICAgICAgICAgICAgJ21vZGVsJyArIChrZXlbMF0gIT09ICdbJyA/ICcuJyA6ICcnKSArIGtleVxuICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5jbGFzc05hbWUpIHtcbiAgICAgICAgICAgICAgICAgIFx0ZWxlbWVudC5hZGRDbGFzcyhvcHRpb25zLmNsYXNzTmFtZSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBlbGVtZW50Lmh0bWwodGVtcGxhdGUpO1xuICAgICAgICAgICAgICAgICAgJGNvbXBpbGUoZWxlbWVudC5jb250ZW50cygpKShzY29wZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgb25jZSgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy9LZWVwIGVycm9yIHByb25lIGxvZ2ljIGZyb20gdGhlIHRlbXBsYXRlXG4gICAgICAgICAgICBzY29wZS5zaG93VGl0bGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHNjb3BlLmZvcm0gJiYgc2NvcGUuZm9ybS5ub3RpdGxlICE9PSB0cnVlICYmIHNjb3BlLmZvcm0udGl0bGU7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzY29wZS5saXN0VG9DaGVja2JveFZhbHVlcyA9IGZ1bmN0aW9uKGxpc3QpIHtcbiAgICAgICAgICAgICAgdmFyIHZhbHVlcyA9IHt9O1xuICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2gobGlzdCwgZnVuY3Rpb24odikge1xuICAgICAgICAgICAgICAgIHZhbHVlc1t2XSA9IHRydWU7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICByZXR1cm4gdmFsdWVzO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2NvcGUuY2hlY2tib3hWYWx1ZXNUb0xpc3QgPSBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgICAgICAgdmFyIGxzdCA9IFtdO1xuICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2godmFsdWVzLCBmdW5jdGlvbih2LCBrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHYpIHtcbiAgICAgICAgICAgICAgICAgIGxzdC5wdXNoKGspO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIHJldHVybiBsc3Q7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzY29wZS5idXR0b25DbGljayA9IGZ1bmN0aW9uKCRldmVudCwgZm9ybSkge1xuICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKGZvcm0ub25DbGljaykpIHtcbiAgICAgICAgICAgICAgICBmb3JtLm9uQ2xpY2soJGV2ZW50LCBmb3JtKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChhbmd1bGFyLmlzU3RyaW5nKGZvcm0ub25DbGljaykpIHtcbiAgICAgICAgICAgICAgICBpZiAoc2ZTY2hlbWEpIHtcbiAgICAgICAgICAgICAgICAgIC8vZXZhbHVhdGluZyBpbiBzY29wZSBvdXRzaWRlIG9mIHNmU2NoZW1hcyBpc29sYXRlZCBzY29wZVxuICAgICAgICAgICAgICAgICAgc2ZTY2hlbWEuZXZhbEluUGFyZW50U2NvcGUoZm9ybS5vbkNsaWNrLCB7JyRldmVudCc6ICRldmVudCwgZm9ybTogZm9ybX0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBzY29wZS4kZXZhbChmb3JtLm9uQ2xpY2ssIHsnJGV2ZW50JzogJGV2ZW50LCBmb3JtOiBmb3JtfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEV2YWx1YXRlIGFuIGV4cHJlc3Npb24sIGkuZS4gc2NvcGUuJGV2YWxcbiAgICAgICAgICAgICAqIGJ1dCBkbyBpdCBpbiBzZlNjaGVtYXMgcGFyZW50IHNjb3BlIHNmLXNjaGVtYSBkaXJlY3RpdmUgaXMgdXNlZFxuICAgICAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGV4cHJlc3Npb25cbiAgICAgICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBsb2NhbHMgKG9wdGlvbmFsKVxuICAgICAgICAgICAgICogQHJldHVybiB7QW55fSB0aGUgcmVzdWx0IG9mIHRoZSBleHByZXNzaW9uXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHNjb3BlLmV2YWxFeHByID0gZnVuY3Rpb24oZXhwcmVzc2lvbiwgbG9jYWxzKSB7XG4gICAgICAgICAgICAgIGlmIChzZlNjaGVtYSkge1xuICAgICAgICAgICAgICAgIC8vZXZhbHVhdGluZyBpbiBzY29wZSBvdXRzaWRlIG9mIHNmU2NoZW1hcyBpc29sYXRlZCBzY29wZVxuICAgICAgICAgICAgICAgIHJldHVybiBzZlNjaGVtYS5ldmFsSW5QYXJlbnRTY29wZShleHByZXNzaW9uLCBsb2NhbHMpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgcmV0dXJuIHNjb3BlLiRldmFsKGV4cHJlc3Npb24sIGxvY2Fscyk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEV2YWx1YXRlIGFuIGV4cHJlc3Npb24sIGkuZS4gc2NvcGUuJGV2YWxcbiAgICAgICAgICAgICAqIGluIHRoaXMgZGVjb3JhdG9ycyBzY29wZVxuICAgICAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGV4cHJlc3Npb25cbiAgICAgICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBsb2NhbHMgKG9wdGlvbmFsKVxuICAgICAgICAgICAgICogQHJldHVybiB7QW55fSB0aGUgcmVzdWx0IG9mIHRoZSBleHByZXNzaW9uXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHNjb3BlLmV2YWxJblNjb3BlID0gZnVuY3Rpb24oZXhwcmVzc2lvbiwgbG9jYWxzKSB7XG4gICAgICAgICAgICAgIGlmIChleHByZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNjb3BlLiRldmFsKGV4cHJlc3Npb24sIGxvY2Fscyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogRXJyb3IgbWVzc2FnZSBoYW5kbGVyXG4gICAgICAgICAgICAgKiBBbiBlcnJvciBjYW4gZWl0aGVyIGJlIGEgc2NoZW1hIHZhbGlkYXRpb24gbWVzc2FnZSBvciBhIGFuZ3VsYXIganMgdmFsaWR0aW9uXG4gICAgICAgICAgICAgKiBlcnJvciAoaS5lLiByZXF1aXJlZClcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgc2NvcGUuZXJyb3JNZXNzYWdlID0gZnVuY3Rpb24oc2NoZW1hRXJyb3IpIHtcbiAgICAgICAgICAgICAgLy9Vc2VyIGhhcyBzdXBwbGllZCB2YWxpZGF0aW9uIG1lc3NhZ2VzXG4gICAgICAgICAgICAgIGlmIChzY29wZS5mb3JtLnZhbGlkYXRpb25NZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNjaGVtYUVycm9yKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc1N0cmluZyhzY29wZS5mb3JtLnZhbGlkYXRpb25NZXNzYWdlKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2NvcGUuZm9ybS52YWxpZGF0aW9uTWVzc2FnZTtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgcmV0dXJuIHNjb3BlLmZvcm0udmFsaWRhdGlvbk1lc3NhZ2Vbc2NoZW1hRXJyb3IuY29kZV0gfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5mb3JtLnZhbGlkYXRpb25NZXNzYWdlWydkZWZhdWx0J107XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBzY29wZS5mb3JtLnZhbGlkYXRpb25NZXNzYWdlLm51bWJlciB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmZvcm0udmFsaWRhdGlvbk1lc3NhZ2VbJ2RlZmF1bHQnXSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmZvcm0udmFsaWRhdGlvbk1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLy9ObyB1c2VyIHN1cHBsaWVkIHZhbGlkYXRpb24gbWVzc2FnZS5cbiAgICAgICAgICAgICAgaWYgKHNjaGVtYUVycm9yKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNjaGVtYUVycm9yLm1lc3NhZ2U7IC8vdXNlIHR2NC5qcyB2YWxpZGF0aW9uIG1lc3NhZ2VcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vT3RoZXJ3aXNlIHdlIG9ubHkgaGF2ZSBpbnB1dCBudW1iZXIgbm90IGJlaW5nIGEgbnVtYmVyXG4gICAgICAgICAgICAgIHJldHVybiAnTm90IGEgbnVtYmVyJztcblxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgXSk7XG4gIH07XG5cbiAgdmFyIGNyZWF0ZU1hbnVhbERpcmVjdGl2ZSA9IGZ1bmN0aW9uKHR5cGUsIHRlbXBsYXRlVXJsLCB0cmFuc2NsdWRlKSB7XG4gICAgdHJhbnNjbHVkZSA9IGFuZ3VsYXIuaXNEZWZpbmVkKHRyYW5zY2x1ZGUpID8gdHJhbnNjbHVkZSA6IGZhbHNlO1xuICAgICRjb21waWxlUHJvdmlkZXIuZGlyZWN0aXZlKCdzZicgKyBhbmd1bGFyLnVwcGVyY2FzZSh0eXBlWzBdKSArIHR5cGUuc3Vic3RyKDEpLCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRUFDJyxcbiAgICAgICAgc2NvcGU6IHRydWUsXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRyYW5zY2x1ZGUsXG4gICAgICAgIHRlbXBsYXRlOiAnPHNmLWRlY29yYXRvciBmb3JtPVwiZm9ybVwiPjwvc2YtZGVjb3JhdG9yPicsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICAgIHZhciB3YXRjaFRoaXMgPSB7XG4gICAgICAgICAgICAnaXRlbXMnOiAnYycsXG4gICAgICAgICAgICAndGl0bGVNYXAnOiAnYycsXG4gICAgICAgICAgICAnc2NoZW1hJzogJ2MnXG4gICAgICAgICAgfTtcbiAgICAgICAgICB2YXIgZm9ybSA9IHt0eXBlOiB0eXBlfTtcbiAgICAgICAgICB2YXIgb25jZSA9IHRydWU7XG4gICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGF0dHJzLCBmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICAgICAgaWYgKG5hbWVbMF0gIT09ICckJyAmJiBuYW1lLmluZGV4T2YoJ25nJykgIT09IDAgJiYgbmFtZSAhPT0gJ3NmRmllbGQnKSB7XG5cbiAgICAgICAgICAgICAgdmFyIHVwZGF0ZUZvcm0gPSBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQodmFsKSAmJiB2YWwgIT09IGZvcm1bbmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgIGZvcm1bbmFtZV0gPSB2YWw7XG5cbiAgICAgICAgICAgICAgICAgIC8vd2hlbiB3ZSBoYXZlIHR5cGUsIGFuZCBpZiBzcGVjaWZpZWQga2V5IHdlIGFwcGx5IGl0IG9uIHNjb3BlLlxuICAgICAgICAgICAgICAgICAgaWYgKG9uY2UgJiYgZm9ybS50eXBlICYmIChmb3JtLmtleSB8fCBhbmd1bGFyLmlzVW5kZWZpbmVkKGF0dHJzLmtleSkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmZvcm0gPSBmb3JtO1xuICAgICAgICAgICAgICAgICAgICBvbmNlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgIGlmIChuYW1lID09PSAnbW9kZWwnKSB7XG4gICAgICAgICAgICAgICAgLy9cIm1vZGVsXCIgaXMgYm91bmQgdG8gc2NvcGUgdW5kZXIgdGhlIG5hbWUgXCJtb2RlbFwiIHNpbmNlIHRoaXMgaXMgd2hhdCB0aGUgZGVjb3JhdG9yc1xuICAgICAgICAgICAgICAgIC8va25vdyBhbmQgbG92ZS5cbiAgICAgICAgICAgICAgICBzY29wZS4kd2F0Y2godmFsdWUsIGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgICAgICAgaWYgKHZhbCAmJiBzY29wZS5tb2RlbCAhPT0gdmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLm1vZGVsID0gdmFsO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKHdhdGNoVGhpc1tuYW1lXSA9PT0gJ2MnKSB7XG4gICAgICAgICAgICAgICAgLy93YXRjaCBjb2xsZWN0aW9uXG4gICAgICAgICAgICAgICAgc2NvcGUuJHdhdGNoQ29sbGVjdGlvbih2YWx1ZSwgdXBkYXRlRm9ybSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8kb2JzZXJ2ZVxuICAgICAgICAgICAgICAgIGF0dHJzLiRvYnNlcnZlKG5hbWUsIHVwZGF0ZUZvcm0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGRlY29yYXRvciBkaXJlY3RpdmUgYW5kIGl0cyBzaWJsaW5nIFwibWFudWFsXCIgdXNlIGRpcmVjdGl2ZXMuXG4gICAqIFRoZSBkaXJlY3RpdmUgY2FuIGJlIHVzZWQgdG8gY3JlYXRlIGZvcm0gZmllbGRzIG9yIG90aGVyIGZvcm0gZW50aXRpZXMuXG4gICAqIEl0IGNhbiBiZSB1c2VkIGluIGNvbmp1bmN0aW9uIHdpdGggPHNjaGVtYS1mb3JtPiBkaXJlY3RpdmUgaW4gd2hpY2ggY2FzZSB0aGUgZGVjb3JhdG9yIGlzXG4gICAqIGdpdmVuIGl0J3MgY29uZmlndXJhdGlvbiB2aWEgYSB0aGUgXCJmb3JtXCIgYXR0cmlidXRlLlxuICAgKlxuICAgKiBleC4gQmFzaWMgdXNhZ2VcbiAgICogICA8c2YtZGVjb3JhdG9yIGZvcm09XCJteWZvcm1cIj48L3NmLWRlY29yYXRvcj5cbiAgICoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIGRpcmVjdGl2ZSBuYW1lIChDYW1lbENhc2VkKVxuICAgKiBAcGFyYW0ge09iamVjdH0gbWFwcGluZ3MsIGFuIG9iamVjdCB0aGF0IG1hcHMgXCJ0eXBlXCIgPT4gXCJ0ZW1wbGF0ZVVybFwiXG4gICAqIEBwYXJhbSB7QXJyYXl9ICBydWxlcyAob3B0aW9uYWwpIGEgbGlzdCBvZiBmdW5jdGlvbnMsIGZ1bmN0aW9uKGZvcm0pIHt9LCB0aGF0IGFyZSBlYWNoIHRyaWVkIGluXG4gICAqICAgICAgICAgICAgICAgICB0dXJuLFxuICAgKiAgICAgICAgICAgICAgICAgaWYgdGhleSByZXR1cm4gYSBzdHJpbmcgdGhlbiB0aGF0IGlzIHVzZWQgYXMgdGhlIHRlbXBsYXRlVXJsLiBSdWxlcyBjb21lIGJlZm9yZVxuICAgKiAgICAgICAgICAgICAgICAgbWFwcGluZ3MuXG4gICAqL1xuICB0aGlzLmNyZWF0ZURlY29yYXRvciA9IGZ1bmN0aW9uKG5hbWUsIG1hcHBpbmdzLCBydWxlcywgb3B0aW9ucykge1xuICAgIGRpcmVjdGl2ZXNbbmFtZV0gPSB7XG4gICAgICBtYXBwaW5nczogbWFwcGluZ3MgfHwge30sXG4gICAgICBydWxlczogICAgcnVsZXMgICAgfHwgW11cbiAgICB9O1xuXG4gICAgaWYgKCFkaXJlY3RpdmVzW2RlZmF1bHREZWNvcmF0b3JdKSB7XG4gICAgICBkZWZhdWx0RGVjb3JhdG9yID0gbmFtZTtcbiAgICB9XG4gICAgY3JlYXRlRGlyZWN0aXZlKG5hbWUsIG9wdGlvbnMpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgZGlyZWN0aXZlIG9mIGEgZGVjb3JhdG9yXG4gICAqIFVzYWJsZSB3aGVuIHlvdSB3YW50IHRvIHVzZSB0aGUgZGVjb3JhdG9ycyB3aXRob3V0IHVzaW5nIDxzY2hlbWEtZm9ybT4gZGlyZWN0aXZlLlxuICAgKiBTcGVjaWZpY2FsbHkgd2hlbiB5b3UgbmVlZCB0byByZXVzZSBzdHlsaW5nLlxuICAgKlxuICAgKiBleC4gY3JlYXRlRGlyZWN0aXZlKCd0ZXh0JywnLi4uJylcbiAgICogIDxzZi10ZXh0IHRpdGxlPVwiZm9vYmFyXCIgbW9kZWw9XCJwZXJzb25cIiBrZXk9XCJuYW1lXCIgc2NoZW1hPVwic2NoZW1hXCI+PC9zZi10ZXh0PlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gIHR5cGUgVGhlIHR5cGUgb2YgdGhlIGRpcmVjdGl2ZSwgcmVzdWx0aW5nIGRpcmVjdGl2ZSB3aWxsIGhhdmUgc2YtIHByZWZpeGVkXG4gICAqIEBwYXJhbSB7c3RyaW5nfSAgdGVtcGxhdGVVcmxcbiAgICogQHBhcmFtIHtib29sZWFufSB0cmFuc2NsdWRlIChvcHRpb25hbCkgc2V0cyB0cmFuc2NsdWRlIG9wdGlvbiBvZiBkaXJlY3RpdmUsIGRlZmF1bHRzIHRvIGZhbHNlLlxuICAgKi9cbiAgdGhpcy5jcmVhdGVEaXJlY3RpdmUgPSBjcmVhdGVNYW51YWxEaXJlY3RpdmU7XG5cbiAgLyoqXG4gICAqIFNhbWUgYXMgY3JlYXRlRGlyZWN0aXZlLCBidXQgdGFrZXMgYW4gb2JqZWN0IHdoZXJlIGtleSBpcyAndHlwZScgYW5kIHZhbHVlIGlzICd0ZW1wbGF0ZVVybCdcbiAgICogVXNlZnVsIGZvciBiYXRjaGluZy5cbiAgICogQHBhcmFtIHtPYmplY3R9IG1hcHBpbmdzXG4gICAqL1xuICB0aGlzLmNyZWF0ZURpcmVjdGl2ZXMgPSBmdW5jdGlvbihtYXBwaW5ncykge1xuICAgIGFuZ3VsYXIuZm9yRWFjaChtYXBwaW5ncywgZnVuY3Rpb24odXJsLCB0eXBlKSB7XG4gICAgICBjcmVhdGVNYW51YWxEaXJlY3RpdmUodHlwZSwgdXJsKTtcbiAgICB9KTtcbiAgfTtcblxuICAvKipcbiAgICogR2V0dGVyIGZvciBkaXJlY3RpdmUgbWFwcGluZ3NcbiAgICogQ2FuIGJlIHVzZWQgdG8gb3ZlcnJpZGUgYSBtYXBwaW5nIG9yIGFkZCBhIHJ1bGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgKG9wdGlvbmFsKSBkZWZhdWx0cyB0byBkZWZhdWx0RGVjb3JhdG9yXG4gICAqIEByZXR1cm4ge09iamVjdH0gcnVsZXMgYW5kIG1hcHBpbmdzIHsgcnVsZXM6IFtdLG1hcHBpbmdzOiB7fX1cbiAgICovXG4gIHRoaXMuZGlyZWN0aXZlID0gZnVuY3Rpb24obmFtZSkge1xuICAgIG5hbWUgPSBuYW1lIHx8IGRlZmF1bHREZWNvcmF0b3I7XG4gICAgcmV0dXJuIGRpcmVjdGl2ZXNbbmFtZV07XG4gIH07XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBtYXBwaW5nIHRvIGFuIGV4aXN0aW5nIGRlY29yYXRvci5cbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgRGVjb3JhdG9yIG5hbWVcbiAgICogQHBhcmFtIHtTdHJpbmd9IHR5cGUgRm9ybSB0eXBlIGZvciB0aGUgbWFwcGluZ1xuICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsICBUaGUgdGVtcGxhdGUgdXJsXG4gICAqL1xuICB0aGlzLmFkZE1hcHBpbmcgPSBmdW5jdGlvbihuYW1lLCB0eXBlLCB1cmwpIHtcbiAgICBpZiAoZGlyZWN0aXZlc1tuYW1lXSkge1xuICAgICAgZGlyZWN0aXZlc1tuYW1lXS5tYXBwaW5nc1t0eXBlXSA9IHVybDtcbiAgICB9XG4gIH07XG5cbiAgLy9TZXJ2aWNlIGlzIGp1c3QgYSBnZXR0ZXIgZm9yIGRpcmVjdGl2ZSBtYXBwaW5ncyBhbmQgcnVsZXNcbiAgdGhpcy4kZ2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRpcmVjdGl2ZTogZnVuY3Rpb24obmFtZSkge1xuICAgICAgICByZXR1cm4gZGlyZWN0aXZlc1tuYW1lXTtcbiAgICAgIH0sXG4gICAgICBkZWZhdWx0RGVjb3JhdG9yOiBkZWZhdWx0RGVjb3JhdG9yXG4gICAgfTtcbiAgfTtcblxuICAvL0NyZWF0ZSBhIGRlZmF1bHQgZGlyZWN0aXZlXG4gIGNyZWF0ZURpcmVjdGl2ZSgnc2ZEZWNvcmF0b3InKTtcblxufV0pO1xuXG4vKipcbiAqIFNjaGVtYSBmb3JtIHNlcnZpY2UuXG4gKiBUaGlzIHNlcnZpY2UgaXMgbm90IHRoYXQgdXNlZnVsIG91dHNpZGUgb2Ygc2NoZW1hIGZvcm0gZGlyZWN0aXZlXG4gKiBidXQgbWFrZXMgdGhlIGNvZGUgbW9yZSB0ZXN0YWJsZS5cbiAqL1xuYW5ndWxhci5tb2R1bGUoJ3NjaGVtYUZvcm0nKS5wcm92aWRlcignc2NoZW1hRm9ybScsXG5bJ3NmUGF0aFByb3ZpZGVyJywgZnVuY3Rpb24oc2ZQYXRoUHJvdmlkZXIpIHtcblxuICAvL0NyZWF0ZXMgYW4gZGVmYXVsdCB0aXRsZU1hcCBsaXN0IGZyb20gYW4gZW51bSwgaS5lLiBhIGxpc3Qgb2Ygc3RyaW5ncy5cbiAgdmFyIGVudW1Ub1RpdGxlTWFwID0gZnVuY3Rpb24oZW5tKSB7XG4gICAgdmFyIHRpdGxlTWFwID0gW107IC8vY2Fub25pY2FsIHRpdGxlTWFwIGZvcm1hdCBpcyBhIGxpc3QuXG4gICAgZW5tLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgdGl0bGVNYXAucHVzaCh7bmFtZTogbmFtZSwgdmFsdWU6IG5hbWV9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gdGl0bGVNYXA7XG4gIH07XG5cbiAgLy8gVGFrZXMgYSB0aXRsZU1hcCBpbiBlaXRoZXIgb2JqZWN0IG9yIGxpc3QgZm9ybWF0IGFuZCByZXR1cm5zIG9uZSBpblxuICAvLyBpbiB0aGUgbGlzdCBmb3JtYXQuXG4gIHZhciBjYW5vbmljYWxUaXRsZU1hcCA9IGZ1bmN0aW9uKHRpdGxlTWFwLCBvcmlnaW5hbEVudW0pIHtcbiAgICBpZiAoIWFuZ3VsYXIuaXNBcnJheSh0aXRsZU1hcCkpIHtcbiAgICAgIHZhciBjYW5vbmljYWwgPSBbXTtcbiAgICAgIGlmIChvcmlnaW5hbEVudW0pIHtcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKG9yaWdpbmFsRW51bSwgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgY2Fub25pY2FsLnB1c2goe25hbWU6IHRpdGxlTWFwW3ZhbHVlXSwgdmFsdWU6IHZhbHVlfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRpdGxlTWFwLCBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgICAgICAgIGNhbm9uaWNhbC5wdXNoKHtuYW1lOiBuYW1lLCB2YWx1ZTogdmFsdWV9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gY2Fub25pY2FsO1xuICAgIH1cbiAgICByZXR1cm4gdGl0bGVNYXA7XG4gIH07XG5cbiAgdmFyIGRlZmF1bHRGb3JtRGVmaW5pdGlvbiA9IGZ1bmN0aW9uKG5hbWUsIHNjaGVtYSwgb3B0aW9ucykge1xuICAgIHZhciBydWxlcyA9IGRlZmF1bHRzW3NjaGVtYS50eXBlXTtcbiAgICBpZiAocnVsZXMpIHtcbiAgICAgIHZhciBkZWY7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJ1bGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGRlZiA9IHJ1bGVzW2ldKG5hbWUsIHNjaGVtYSwgb3B0aW9ucyk7XG4gICAgICAgIC8vZmlyc3QgaGFuZGxlciBpbiBsaXN0IHRoYXQgYWN0dWFsbHkgcmV0dXJucyBzb21ldGhpbmcgaXMgb3VyIGhhbmRsZXIhXG4gICAgICAgIGlmIChkZWYpIHtcbiAgICAgICAgICByZXR1cm4gZGVmO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIC8vQ3JlYXRlcyBhIGZvcm0gb2JqZWN0IHdpdGggYWxsIGNvbW1vbiBwcm9wZXJ0aWVzXG4gIHZhciBzdGRGb3JtT2JqID0gZnVuY3Rpb24obmFtZSwgc2NoZW1hLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdmFyIGYgPSBvcHRpb25zLmdsb2JhbCAmJiBvcHRpb25zLmdsb2JhbC5mb3JtRGVmYXVsdHMgP1xuICAgICAgICAgICAgYW5ndWxhci5jb3B5KG9wdGlvbnMuZ2xvYmFsLmZvcm1EZWZhdWx0cykgOiB7fTtcbiAgICBpZiAob3B0aW9ucy5nbG9iYWwgJiYgb3B0aW9ucy5nbG9iYWwuc3VwcmVzc1Byb3BlcnR5VGl0bGVzID09PSB0cnVlKSB7XG4gICAgICBmLnRpdGxlID0gc2NoZW1hLnRpdGxlO1xuICAgIH0gZWxzZSB7XG4gICAgICBmLnRpdGxlID0gc2NoZW1hLnRpdGxlIHx8IG5hbWU7XG4gICAgfVxuXG4gICAgaWYgKHNjaGVtYS5kZXNjcmlwdGlvbikgeyBmLmRlc2NyaXB0aW9uID0gc2NoZW1hLmRlc2NyaXB0aW9uOyB9XG4gICAgaWYgKG9wdGlvbnMucmVxdWlyZWQgPT09IHRydWUgfHwgc2NoZW1hLnJlcXVpcmVkID09PSB0cnVlKSB7IGYucmVxdWlyZWQgPSB0cnVlOyB9XG4gICAgaWYgKHNjaGVtYS5tYXhMZW5ndGgpIHsgZi5tYXhsZW5ndGggPSBzY2hlbWEubWF4TGVuZ3RoOyB9XG4gICAgaWYgKHNjaGVtYS5taW5MZW5ndGgpIHsgZi5taW5sZW5ndGggPSBzY2hlbWEubWF4TGVuZ3RoOyB9XG4gICAgaWYgKHNjaGVtYS5yZWFkT25seSB8fCBzY2hlbWEucmVhZG9ubHkpIHsgZi5yZWFkb25seSAgPSB0cnVlOyB9XG4gICAgaWYgKHNjaGVtYS5taW5pbXVtKSB7IGYubWluaW11bSA9IHNjaGVtYS5taW5pbXVtICsgKHNjaGVtYS5leGNsdXNpdmVNaW5pbXVtID8gMSA6IDApOyB9XG4gICAgaWYgKHNjaGVtYS5tYXhpbXVtKSB7IGYubWF4aW11bSA9IHNjaGVtYS5tYXhpbXVtIC0gKHNjaGVtYS5leGNsdXNpdmVNYXhpbXVtID8gMSA6IDApOyB9XG5cbiAgICAvL05vbiBzdGFuZGFyZCBhdHRyaWJ1dGVzXG4gICAgaWYgKHNjaGVtYS52YWxpZGF0aW9uTWVzc2FnZSkgeyBmLnZhbGlkYXRpb25NZXNzYWdlID0gc2NoZW1hLnZhbGlkYXRpb25NZXNzYWdlOyB9XG4gICAgaWYgKHNjaGVtYS5lbnVtTmFtZXMpIHsgZi50aXRsZU1hcCA9IGNhbm9uaWNhbFRpdGxlTWFwKHNjaGVtYS5lbnVtTmFtZXMsIHNjaGVtYVsnZW51bSddKTsgfVxuICAgIGYuc2NoZW1hID0gc2NoZW1hO1xuXG4gICAgLy8gTmcgbW9kZWwgb3B0aW9ucyBkb2Vzbid0IHBsYXkgbmljZSB3aXRoIHVuZGVmaW5lZCwgbWlnaHQgYmUgZGVmaW5lZFxuICAgIC8vIGdsb2JhbGx5IHRob3VnaFxuICAgIGYubmdNb2RlbE9wdGlvbnMgPSBmLm5nTW9kZWxPcHRpb25zIHx8IHt9O1xuICAgIHJldHVybiBmO1xuICB9O1xuXG4gIHZhciB0ZXh0ID0gZnVuY3Rpb24obmFtZSwgc2NoZW1hLCBvcHRpb25zKSB7XG4gICAgaWYgKHNjaGVtYS50eXBlID09PSAnc3RyaW5nJyAmJiAhc2NoZW1hWydlbnVtJ10pIHtcbiAgICAgIHZhciBmID0gc3RkRm9ybU9iaihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpO1xuICAgICAgZi5rZXkgID0gb3B0aW9ucy5wYXRoO1xuICAgICAgZi50eXBlID0gJ3RleHQnO1xuICAgICAgb3B0aW9ucy5sb29rdXBbc2ZQYXRoUHJvdmlkZXIuc3RyaW5naWZ5KG9wdGlvbnMucGF0aCldID0gZjtcbiAgICAgIHJldHVybiBmO1xuICAgIH1cbiAgfTtcblxuICAvL2RlZmF1bHQgaW4ganNvbiBmb3JtIGZvciBudW1iZXIgYW5kIGludGVnZXIgaXMgYSB0ZXh0IGZpZWxkXG4gIC8vaW5wdXQgdHlwZT1cIm51bWJlclwiIHdvdWxkIGJlIG1vcmUgc3VpdGFibGUgZG9uJ3QgeWEgdGhpbms/XG4gIHZhciBudW1iZXIgPSBmdW5jdGlvbihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpIHtcbiAgICBpZiAoc2NoZW1hLnR5cGUgPT09ICdudW1iZXInKSB7XG4gICAgICB2YXIgZiA9IHN0ZEZvcm1PYmoobmFtZSwgc2NoZW1hLCBvcHRpb25zKTtcbiAgICAgIGYua2V5ICA9IG9wdGlvbnMucGF0aDtcbiAgICAgIGYudHlwZSA9ICdudW1iZXInO1xuICAgICAgb3B0aW9ucy5sb29rdXBbc2ZQYXRoUHJvdmlkZXIuc3RyaW5naWZ5KG9wdGlvbnMucGF0aCldID0gZjtcbiAgICAgIHJldHVybiBmO1xuICAgIH1cbiAgfTtcblxuICB2YXIgaW50ZWdlciA9IGZ1bmN0aW9uKG5hbWUsIHNjaGVtYSwgb3B0aW9ucykge1xuICAgIGlmIChzY2hlbWEudHlwZSA9PT0gJ2ludGVnZXInKSB7XG4gICAgICB2YXIgZiA9IHN0ZEZvcm1PYmoobmFtZSwgc2NoZW1hLCBvcHRpb25zKTtcbiAgICAgIGYua2V5ICA9IG9wdGlvbnMucGF0aDtcbiAgICAgIGYudHlwZSA9ICdudW1iZXInO1xuICAgICAgb3B0aW9ucy5sb29rdXBbc2ZQYXRoUHJvdmlkZXIuc3RyaW5naWZ5KG9wdGlvbnMucGF0aCldID0gZjtcbiAgICAgIHJldHVybiBmO1xuICAgIH1cbiAgfTtcblxuICB2YXIgY2hlY2tib3ggPSBmdW5jdGlvbihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpIHtcbiAgICBpZiAoc2NoZW1hLnR5cGUgPT09ICdib29sZWFuJykge1xuICAgICAgdmFyIGYgPSBzdGRGb3JtT2JqKG5hbWUsIHNjaGVtYSwgb3B0aW9ucyk7XG4gICAgICBmLmtleSAgPSBvcHRpb25zLnBhdGg7XG4gICAgICBmLnR5cGUgPSAnY2hlY2tib3gnO1xuICAgICAgb3B0aW9ucy5sb29rdXBbc2ZQYXRoUHJvdmlkZXIuc3RyaW5naWZ5KG9wdGlvbnMucGF0aCldID0gZjtcbiAgICAgIHJldHVybiBmO1xuICAgIH1cbiAgfTtcblxuICB2YXIgc2VsZWN0ID0gZnVuY3Rpb24obmFtZSwgc2NoZW1hLCBvcHRpb25zKSB7XG4gICAgaWYgKHNjaGVtYS50eXBlID09PSAnc3RyaW5nJyAmJiBzY2hlbWFbJ2VudW0nXSkge1xuICAgICAgdmFyIGYgPSBzdGRGb3JtT2JqKG5hbWUsIHNjaGVtYSwgb3B0aW9ucyk7XG4gICAgICBmLmtleSAgPSBvcHRpb25zLnBhdGg7XG4gICAgICBmLnR5cGUgPSAnc2VsZWN0JztcbiAgICAgIGlmICghZi50aXRsZU1hcCkge1xuICAgICAgICBmLnRpdGxlTWFwID0gZW51bVRvVGl0bGVNYXAoc2NoZW1hWydlbnVtJ10pO1xuICAgICAgfVxuICAgICAgb3B0aW9ucy5sb29rdXBbc2ZQYXRoUHJvdmlkZXIuc3RyaW5naWZ5KG9wdGlvbnMucGF0aCldID0gZjtcbiAgICAgIHJldHVybiBmO1xuICAgIH1cbiAgfTtcblxuICB2YXIgY2hlY2tib3hlcyA9IGZ1bmN0aW9uKG5hbWUsIHNjaGVtYSwgb3B0aW9ucykge1xuICAgIGlmIChzY2hlbWEudHlwZSA9PT0gJ2FycmF5JyAmJiBzY2hlbWEuaXRlbXMgJiYgc2NoZW1hLml0ZW1zWydlbnVtJ10pIHtcbiAgICAgIHZhciBmID0gc3RkRm9ybU9iaihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpO1xuICAgICAgZi5rZXkgID0gb3B0aW9ucy5wYXRoO1xuICAgICAgZi50eXBlID0gJ2NoZWNrYm94ZXMnO1xuICAgICAgaWYgKCFmLnRpdGxlTWFwKSB7XG4gICAgICAgIGYudGl0bGVNYXAgPSBlbnVtVG9UaXRsZU1hcChzY2hlbWEuaXRlbXNbJ2VudW0nXSk7XG4gICAgICB9XG4gICAgICBvcHRpb25zLmxvb2t1cFtzZlBhdGhQcm92aWRlci5zdHJpbmdpZnkob3B0aW9ucy5wYXRoKV0gPSBmO1xuICAgICAgcmV0dXJuIGY7XG4gICAgfVxuICB9O1xuXG4gIHZhciBmaWVsZHNldCA9IGZ1bmN0aW9uKG5hbWUsIHNjaGVtYSwgb3B0aW9ucykge1xuICAgIGlmIChzY2hlbWEudHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHZhciBmICAgPSBzdGRGb3JtT2JqKG5hbWUsIHNjaGVtYSwgb3B0aW9ucyk7XG4gICAgICBmLnR5cGUgID0gJ2ZpZWxkc2V0JztcbiAgICAgIGYuaXRlbXMgPSBbXTtcbiAgICAgIG9wdGlvbnMubG9va3VwW3NmUGF0aFByb3ZpZGVyLnN0cmluZ2lmeShvcHRpb25zLnBhdGgpXSA9IGY7XG5cbiAgICAgIC8vcmVjdXJzZSBkb3duIGludG8gcHJvcGVydGllc1xuICAgICAgYW5ndWxhci5mb3JFYWNoKHNjaGVtYS5wcm9wZXJ0aWVzLCBmdW5jdGlvbih2LCBrKSB7XG4gICAgICAgIHZhciBwYXRoID0gb3B0aW9ucy5wYXRoLnNsaWNlKCk7XG4gICAgICAgIHBhdGgucHVzaChrKTtcbiAgICAgICAgaWYgKG9wdGlvbnMuaWdub3JlW3NmUGF0aFByb3ZpZGVyLnN0cmluZ2lmeShwYXRoKV0gIT09IHRydWUpIHtcbiAgICAgICAgICB2YXIgcmVxdWlyZWQgPSBzY2hlbWEucmVxdWlyZWQgJiYgc2NoZW1hLnJlcXVpcmVkLmluZGV4T2YoaykgIT09IC0xO1xuXG4gICAgICAgICAgdmFyIGRlZiA9IGRlZmF1bHRGb3JtRGVmaW5pdGlvbihrLCB2LCB7XG4gICAgICAgICAgICBwYXRoOiBwYXRoLFxuICAgICAgICAgICAgcmVxdWlyZWQ6IHJlcXVpcmVkIHx8IGZhbHNlLFxuICAgICAgICAgICAgbG9va3VwOiBvcHRpb25zLmxvb2t1cCxcbiAgICAgICAgICAgIGlnbm9yZTogb3B0aW9ucy5pZ25vcmVcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAoZGVmKSB7XG4gICAgICAgICAgICBmLml0ZW1zLnB1c2goZGVmKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gZjtcbiAgICB9XG5cbiAgfTtcblxuICB2YXIgYXJyYXkgPSBmdW5jdGlvbihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpIHtcblxuICAgIGlmIChzY2hlbWEudHlwZSA9PT0gJ2FycmF5Jykge1xuICAgICAgdmFyIGYgICA9IHN0ZEZvcm1PYmoobmFtZSwgc2NoZW1hLCBvcHRpb25zKTtcbiAgICAgIGYudHlwZSAgPSAnYXJyYXknO1xuICAgICAgZi5rZXkgICA9IG9wdGlvbnMucGF0aDtcbiAgICAgIG9wdGlvbnMubG9va3VwW3NmUGF0aFByb3ZpZGVyLnN0cmluZ2lmeShvcHRpb25zLnBhdGgpXSA9IGY7XG5cbiAgICAgIHZhciByZXF1aXJlZCA9IHNjaGVtYS5yZXF1aXJlZCAmJlxuICAgICAgICAgICAgICAgICAgICAgc2NoZW1hLnJlcXVpcmVkLmluZGV4T2Yob3B0aW9ucy5wYXRoW29wdGlvbnMucGF0aC5sZW5ndGggLSAxXSkgIT09IC0xO1xuXG4gICAgICAvLyBUaGUgZGVmYXVsdCBpcyB0byBhbHdheXMganVzdCBjcmVhdGUgb25lIGNoaWxkLiBUaGlzIHdvcmtzIHNpbmNlIGlmIHRoZVxuICAgICAgLy8gc2NoZW1hcyBpdGVtcyBkZWNsYXJhdGlvbiBpcyBvZiB0eXBlOiBcIm9iamVjdFwiIHRoZW4gd2UgZ2V0IGEgZmllbGRzZXQuXG4gICAgICAvLyBXZSBhbHNvIGZvbGxvdyBqc29uIGZvcm0gbm90YXRhdGlvbiwgYWRkaW5nIGVtcHR5IGJyYWNrZXRzIFwiW11cIiB0b1xuICAgICAgLy8gc2lnbmlmeSBhcnJheXMuXG5cbiAgICAgIHZhciBhcnJQYXRoID0gb3B0aW9ucy5wYXRoLnNsaWNlKCk7XG4gICAgICBhcnJQYXRoLnB1c2goJycpO1xuXG4gICAgICBmLml0ZW1zID0gW2RlZmF1bHRGb3JtRGVmaW5pdGlvbihuYW1lLCBzY2hlbWEuaXRlbXMsIHtcbiAgICAgICAgcGF0aDogYXJyUGF0aCxcbiAgICAgICAgcmVxdWlyZWQ6IHJlcXVpcmVkIHx8IGZhbHNlLFxuICAgICAgICBsb29rdXA6IG9wdGlvbnMubG9va3VwLFxuICAgICAgICBpZ25vcmU6IG9wdGlvbnMuaWdub3JlLFxuICAgICAgICBnbG9iYWw6IG9wdGlvbnMuZ2xvYmFsXG4gICAgICB9KV07XG5cbiAgICAgIHJldHVybiBmO1xuICAgIH1cblxuICB9O1xuXG4gIC8vRmlyc3Qgc29ydGVkIGJ5IHNjaGVtYSB0eXBlIHRoZW4gYSBsaXN0LlxuICAvL09yZGVyIGhhcyBpbXBvcnRhbmNlLiBGaXJzdCBoYW5kbGVyIHJldHVybmluZyBhbiBmb3JtIHNuaXBwZXQgd2lsbCBiZSB1c2VkLlxuICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgc3RyaW5nOiAgW3NlbGVjdCwgdGV4dF0sXG4gICAgb2JqZWN0OiAgW2ZpZWxkc2V0XSxcbiAgICBudW1iZXI6ICBbbnVtYmVyXSxcbiAgICBpbnRlZ2VyOiBbaW50ZWdlcl0sXG4gICAgYm9vbGVhbjogW2NoZWNrYm94XSxcbiAgICBhcnJheTogICBbY2hlY2tib3hlcywgYXJyYXldXG4gIH07XG5cbiAgdmFyIHBvc3RQcm9jZXNzRm4gPSBmdW5jdGlvbihmb3JtKSB7IHJldHVybiBmb3JtOyB9O1xuXG4gIC8qKlxuICAgKiBQcm92aWRlciBBUElcbiAgICovXG4gIHRoaXMuZGVmYXVsdHMgICAgICAgICAgICAgID0gZGVmYXVsdHM7XG4gIHRoaXMuc3RkRm9ybU9iaiAgICAgICAgICAgID0gc3RkRm9ybU9iajtcbiAgdGhpcy5kZWZhdWx0Rm9ybURlZmluaXRpb24gPSBkZWZhdWx0Rm9ybURlZmluaXRpb247XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGEgcG9zdCBwcm9jZXNzIGZ1bmN0aW9uLlxuICAgKiBUaGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCB3aXRoIHRoZSBmdWxseSBtZXJnZWRcbiAgICogZm9ybSBkZWZpbml0aW9uIChpLmUuIGFmdGVyIG1lcmdpbmcgd2l0aCBzY2hlbWEpXG4gICAqIGFuZCB3aGF0ZXZlciBpdCByZXR1cm5zIGlzIHVzZWQgYXMgZm9ybS5cbiAgICovXG4gIHRoaXMucG9zdFByb2Nlc3MgPSBmdW5jdGlvbihmbikge1xuICAgIHBvc3RQcm9jZXNzRm4gPSBmbjtcbiAgfTtcblxuICAvKipcbiAgICogQXBwZW5kIGRlZmF1bHQgZm9ybSBydWxlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSAgIHR5cGUganNvbiBzY2hlbWEgdHlwZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBydWxlIGEgZnVuY3Rpb24ocHJvcGVydHlOYW1lLHByb3BlcnR5U2NoZW1hLG9wdGlvbnMpIHRoYXQgcmV0dXJucyBhIGZvcm1cbiAgICogICAgICAgICAgICAgICAgICAgICAgICBkZWZpbml0aW9uIG9yIHVuZGVmaW5lZFxuICAgKi9cbiAgdGhpcy5hcHBlbmRSdWxlID0gZnVuY3Rpb24odHlwZSwgcnVsZSkge1xuICAgIGlmICghZGVmYXVsdHNbdHlwZV0pIHtcbiAgICAgIGRlZmF1bHRzW3R5cGVdID0gW107XG4gICAgfVxuICAgIGRlZmF1bHRzW3R5cGVdLnB1c2gocnVsZSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFByZXBlbmQgZGVmYXVsdCBmb3JtIHJ1bGVcbiAgICogQHBhcmFtIHtzdHJpbmd9ICAgdHlwZSBqc29uIHNjaGVtYSB0eXBlXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IHJ1bGUgYSBmdW5jdGlvbihwcm9wZXJ0eU5hbWUscHJvcGVydHlTY2hlbWEsb3B0aW9ucykgdGhhdCByZXR1cm5zIGEgZm9ybVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmluaXRpb24gb3IgdW5kZWZpbmVkXG4gICAqL1xuICB0aGlzLnByZXBlbmRSdWxlID0gZnVuY3Rpb24odHlwZSwgcnVsZSkge1xuICAgIGlmICghZGVmYXVsdHNbdHlwZV0pIHtcbiAgICAgIGRlZmF1bHRzW3R5cGVdID0gW107XG4gICAgfVxuICAgIGRlZmF1bHRzW3R5cGVdLnVuc2hpZnQocnVsZSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFV0aWxpdHkgZnVuY3Rpb24gdG8gY3JlYXRlIGEgc3RhbmRhcmQgZm9ybSBvYmplY3QuXG4gICAqIFRoaXMgZG9lcyAqbm90KiBzZXQgdGhlIHR5cGUgb2YgdGhlIGZvcm0gYnV0IHJhdGhlciBhbGwgc2hhcmVkIGF0dHJpYnV0ZXMuXG4gICAqIFlvdSBwcm9iYWJseSB3YW50IHRvIHN0YXJ0IHlvdXIgcnVsZSB3aXRoIGNyZWF0aW5nIHRoZSBmb3JtIHdpdGggdGhpcyBtZXRob2RcbiAgICogdGhlbiBzZXR0aW5nIHR5cGUgYW5kIGFueSBvdGhlciB2YWx1ZXMgeW91IG5lZWQuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBzY2hlbWFcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICogQHJldHVybiB7T2JqZWN0fSBhIGZvcm0gZmllbGQgZGVmaW50aW9uXG4gICAqL1xuICB0aGlzLmNyZWF0ZVN0YW5kYXJkRm9ybSA9IHN0ZEZvcm1PYmo7XG4gIC8qIEVuZCBQcm92aWRlciBBUEkgKi9cblxuICB0aGlzLiRnZXQgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZXJ2aWNlID0ge307XG5cbiAgICBzZXJ2aWNlLm1lcmdlID0gZnVuY3Rpb24oc2NoZW1hLCBmb3JtLCBpZ25vcmUsIG9wdGlvbnMsIHJlYWRvbmx5KSB7XG4gICAgICBmb3JtICA9IGZvcm0gfHwgWycqJ107XG4gICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgICAgLy8gR2V0IHJlYWRvbmx5IGZyb20gcm9vdCBvYmplY3RcbiAgICAgIHJlYWRvbmx5ID0gcmVhZG9ubHkgfHwgc2NoZW1hLnJlYWRvbmx5IHx8IHNjaGVtYS5yZWFkT25seTtcblxuICAgICAgdmFyIHN0ZEZvcm0gPSBzZXJ2aWNlLmRlZmF1bHRzKHNjaGVtYSwgaWdub3JlLCBvcHRpb25zKTtcblxuICAgICAgLy9zaW1wbGUgY2FzZSwgd2UgaGF2ZSBhIFwiKlwiLCBqdXN0IHB1dCB0aGUgc3RkRm9ybSB0aGVyZVxuICAgICAgdmFyIGlkeCA9IGZvcm0uaW5kZXhPZignKicpO1xuICAgICAgaWYgKGlkeCAhPT0gLTEpIHtcbiAgICAgICAgZm9ybSAgPSBmb3JtLnNsaWNlKDAsIGlkeClcbiAgICAgICAgICAgICAgICAgICAgLmNvbmNhdChzdGRGb3JtLmZvcm0pXG4gICAgICAgICAgICAgICAgICAgIC5jb25jYXQoZm9ybS5zbGljZShpZHggKyAxKSk7XG4gICAgICB9XG5cbiAgICAgIC8vb2sgbGV0J3MgbWVyZ2UhXG4gICAgICAvL1dlIGxvb2sgYXQgdGhlIHN1cHBsaWVkIGZvcm0gYW5kIGV4dGVuZCBpdCB3aXRoIHNjaGVtYSBzdGFuZGFyZHNcbiAgICAgIHZhciBsb29rdXAgPSBzdGRGb3JtLmxvb2t1cDtcblxuICAgICAgcmV0dXJuIHBvc3RQcm9jZXNzRm4oZm9ybS5tYXAoZnVuY3Rpb24ob2JqKSB7XG5cbiAgICAgICAgLy9oYW5kbGUgdGhlIHNob3J0Y3V0IHdpdGgganVzdCBhIG5hbWVcbiAgICAgICAgaWYgKHR5cGVvZiBvYmogPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgb2JqID0ge2tleTogb2JqfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvYmoua2V5KSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBvYmoua2V5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgb2JqLmtleSA9IHNmUGF0aFByb3ZpZGVyLnBhcnNlKG9iai5rZXkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vSWYgaXQgaGFzIGEgdGl0bGVNYXAgbWFrZSBzdXJlIGl0J3MgYSBsaXN0XG4gICAgICAgIGlmIChvYmoudGl0bGVNYXApIHtcbiAgICAgICAgICBvYmoudGl0bGVNYXAgPSBjYW5vbmljYWxUaXRsZU1hcChvYmoudGl0bGVNYXApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9cbiAgICAgICAgaWYgKG9iai5pdGVtRm9ybSkge1xuICAgICAgICAgIG9iai5pdGVtcyA9IFtdO1xuICAgICAgICAgIHZhciBzdHIgPSBzZlBhdGhQcm92aWRlci5zdHJpbmdpZnkob2JqLmtleSk7XG4gICAgICAgICAgdmFyIHN0ZEZvcm0gPSBsb29rdXBbc3RyXTtcbiAgICAgICAgICBhbmd1bGFyLmZvckVhY2goc3RkRm9ybS5pdGVtcywgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgdmFyIG8gPSBhbmd1bGFyLmNvcHkob2JqLml0ZW1Gb3JtKTtcbiAgICAgICAgICAgIG8ua2V5ID0gaXRlbS5rZXk7XG4gICAgICAgICAgICBvYmouaXRlbXMucHVzaChvKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vZXh0ZW5kIHdpdGggc3RkIGZvcm0gZnJvbSBzY2hlbWEuXG5cbiAgICAgICAgaWYgKG9iai5rZXkpIHtcbiAgICAgICAgICB2YXIgc3RyaWQgPSBzZlBhdGhQcm92aWRlci5zdHJpbmdpZnkob2JqLmtleSk7XG4gICAgICAgICAgaWYgKGxvb2t1cFtzdHJpZF0pIHtcbiAgICAgICAgICAgIG9iaiA9IGFuZ3VsYXIuZXh0ZW5kKGxvb2t1cFtzdHJpZF0sIG9iaik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQXJlIHdlIGluaGVyaXRpbmcgcmVhZG9ubHk/XG4gICAgICAgIGlmIChyZWFkb25seSA9PT0gdHJ1ZSkgeyAvLyBJbmhlcml0aW5nIGZhbHNlIGlzIG5vdCBjb29sLlxuICAgICAgICAgIG9iai5yZWFkb25seSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvL2lmIGl0J3MgYSB0eXBlIHdpdGggaXRlbXMsIG1lcmdlICdlbSFcbiAgICAgICAgaWYgKG9iai5pdGVtcykge1xuICAgICAgICAgIG9iai5pdGVtcyA9IHNlcnZpY2UubWVyZ2Uoc2NoZW1hLCBvYmouaXRlbXMsIGlnbm9yZSwgb3B0aW9ucywgb2JqLnJlYWRvbmx5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vaWYgaXRzIGhhcyB0YWJzLCBtZXJnZSB0aGVtIGFsc28hXG4gICAgICAgIGlmIChvYmoudGFicykge1xuICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChvYmoudGFicywgZnVuY3Rpb24odGFiKSB7XG4gICAgICAgICAgICB0YWIuaXRlbXMgPSBzZXJ2aWNlLm1lcmdlKHNjaGVtYSwgdGFiLml0ZW1zLCBpZ25vcmUsIG9wdGlvbnMsIG9iai5yZWFkb25seSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTcGVjaWFsIGNhc2U6IGNoZWNrYm94XG4gICAgICAgIC8vIFNpbmNlIGhhdmUgdG8gdGVybmFyeSBzdGF0ZSB3ZSBuZWVkIGEgZGVmYXVsdFxuICAgICAgICBpZiAob2JqLnR5cGUgPT09ICdjaGVja2JveCcgJiYgYW5ndWxhci5pc1VuZGVmaW5lZChvYmouc2NoZW1hWydkZWZhdWx0J10pKSB7XG4gICAgICAgICAgb2JqLnNjaGVtYVsnZGVmYXVsdCddID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgfSkpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgZm9ybSBkZWZhdWx0cyBmcm9tIHNjaGVtYVxuICAgICAqL1xuICAgIHNlcnZpY2UuZGVmYXVsdHMgPSBmdW5jdGlvbihzY2hlbWEsIGlnbm9yZSwgZ2xvYmFsT3B0aW9ucykge1xuICAgICAgdmFyIGZvcm0gICA9IFtdO1xuICAgICAgdmFyIGxvb2t1cCA9IHt9OyAvL01hcCBwYXRoID0+IGZvcm0gb2JqIGZvciBmYXN0IGxvb2t1cCBpbiBtZXJnaW5nXG4gICAgICBpZ25vcmUgPSBpZ25vcmUgfHwge307XG4gICAgICBnbG9iYWxPcHRpb25zID0gZ2xvYmFsT3B0aW9ucyB8fCB7fTtcblxuICAgICAgaWYgKHNjaGVtYS50eXBlID09PSAnb2JqZWN0Jykge1xuICAgICAgICBhbmd1bGFyLmZvckVhY2goc2NoZW1hLnByb3BlcnRpZXMsIGZ1bmN0aW9uKHYsIGspIHtcbiAgICAgICAgICBpZiAoaWdub3JlW2tdICE9PSB0cnVlKSB7XG4gICAgICAgICAgICB2YXIgcmVxdWlyZWQgPSBzY2hlbWEucmVxdWlyZWQgJiYgc2NoZW1hLnJlcXVpcmVkLmluZGV4T2YoaykgIT09IC0xO1xuICAgICAgICAgICAgdmFyIGRlZiA9IGRlZmF1bHRGb3JtRGVmaW5pdGlvbihrLCB2LCB7XG4gICAgICAgICAgICAgIHBhdGg6IFtrXSwgICAgICAgICAvLyBQYXRoIHRvIHRoaXMgcHJvcGVydHkgaW4gYnJhY2tldCBub3RhdGlvbi5cbiAgICAgICAgICAgICAgbG9va3VwOiBsb29rdXAsICAgIC8vIEV4dHJhIG1hcCB0byByZWdpc3RlciB3aXRoLiBPcHRpbWl6YXRpb24gZm9yIG1lcmdlci5cbiAgICAgICAgICAgICAgaWdub3JlOiBpZ25vcmUsICAgIC8vIFRoZSBpZ25vcmUgbGlzdCBvZiBwYXRocyAoc2FucyByb290IGxldmVsIG5hbWUpXG4gICAgICAgICAgICAgIHJlcXVpcmVkOiByZXF1aXJlZCwgLy8gSXMgaXQgcmVxdWlyZWQ/ICh2NCBqc29uIHNjaGVtYSBzdHlsZSlcbiAgICAgICAgICAgICAgZ2xvYmFsOiBnbG9iYWxPcHRpb25zIC8vIEdsb2JhbCBvcHRpb25zLCBpbmNsdWRpbmcgZm9ybSBkZWZhdWx0c1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoZGVmKSB7XG4gICAgICAgICAgICAgIGZvcm0ucHVzaChkZWYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkLiBPbmx5IHR5cGUgXCJvYmplY3RcIiBhbGxvd2VkIGF0IHJvb3QgbGV2ZWwgb2Ygc2NoZW1hLicpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtmb3JtOiBmb3JtLCBsb29rdXA6IGxvb2t1cH07XG4gICAgfTtcblxuICAgIC8vVXRpbGl0eSBmdW5jdGlvbnNcbiAgICAvKipcbiAgICAgKiBUcmF2ZXJzZSBhIHNjaGVtYSwgYXBwbHlpbmcgYSBmdW5jdGlvbihzY2hlbWEscGF0aCkgb24gZXZlcnkgc3ViIHNjaGVtYVxuICAgICAqIGkuZS4gZXZlcnkgcHJvcGVydHkgb2YgYW4gb2JqZWN0LlxuICAgICAqL1xuICAgIHNlcnZpY2UudHJhdmVyc2VTY2hlbWEgPSBmdW5jdGlvbihzY2hlbWEsIGZuLCBwYXRoLCBpZ25vcmVBcnJheXMpIHtcbiAgICAgIGlnbm9yZUFycmF5cyA9IGFuZ3VsYXIuaXNEZWZpbmVkKGlnbm9yZUFycmF5cykgPyBpZ25vcmVBcnJheXMgOiB0cnVlO1xuXG4gICAgICBwYXRoID0gcGF0aCB8fCBbXTtcblxuICAgICAgdmFyIHRyYXZlcnNlID0gZnVuY3Rpb24oc2NoZW1hLCBmbiwgcGF0aCkge1xuICAgICAgICBmbihzY2hlbWEsIHBhdGgpO1xuICAgICAgICBhbmd1bGFyLmZvckVhY2goc2NoZW1hLnByb3BlcnRpZXMsIGZ1bmN0aW9uKHByb3AsIG5hbWUpIHtcbiAgICAgICAgICB2YXIgY3VycmVudFBhdGggPSBwYXRoLnNsaWNlKCk7XG4gICAgICAgICAgY3VycmVudFBhdGgucHVzaChuYW1lKTtcbiAgICAgICAgICB0cmF2ZXJzZShwcm9wLCBmbiwgY3VycmVudFBhdGgpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvL09ubHkgc3VwcG9ydCB0eXBlIFwiYXJyYXlcIiB3aGljaCBoYXZlIGEgc2NoZW1hIGFzIFwiaXRlbXNcIi5cbiAgICAgICAgaWYgKCFpZ25vcmVBcnJheXMgJiYgc2NoZW1hLml0ZW1zKSB7XG4gICAgICAgICAgdmFyIGFyclBhdGggPSBwYXRoLnNsaWNlKCk7IGFyclBhdGgucHVzaCgnJyk7XG4gICAgICAgICAgdHJhdmVyc2Uoc2NoZW1hLml0ZW1zLCBmbiwgYXJyUGF0aCk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHRyYXZlcnNlKHNjaGVtYSwgZm4sIHBhdGggfHwgW10pO1xuICAgIH07XG5cbiAgICBzZXJ2aWNlLnRyYXZlcnNlRm9ybSA9IGZ1bmN0aW9uKGZvcm0sIGZuKSB7XG4gICAgICBmbihmb3JtKTtcbiAgICAgIGFuZ3VsYXIuZm9yRWFjaChmb3JtLml0ZW1zLCBmdW5jdGlvbihmKSB7XG4gICAgICAgIHNlcnZpY2UudHJhdmVyc2VGb3JtKGYsIGZuKTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoZm9ybS50YWJzKSB7XG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaChmb3JtLnRhYnMsIGZ1bmN0aW9uKHRhYikge1xuICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCh0YWIuaXRlbXMsIGZ1bmN0aW9uKGYpIHtcbiAgICAgICAgICAgIHNlcnZpY2UudHJhdmVyc2VGb3JtKGYsIGZuKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBzZXJ2aWNlO1xuICB9O1xuXG59XSk7XG5cbi8qICBDb21tb24gY29kZSBmb3IgdmFsaWRhdGluZyBhIHZhbHVlIGFnYWluc3QgaXRzIGZvcm0gYW5kIHNjaGVtYSBkZWZpbml0aW9uICovXG4vKiBnbG9iYWwgdHY0ICovXG5hbmd1bGFyLm1vZHVsZSgnc2NoZW1hRm9ybScpLmZhY3RvcnkoJ3NmVmFsaWRhdG9yJywgW2Z1bmN0aW9uKCkge1xuXG4gIHZhciB2YWxpZGF0b3IgPSB7fTtcblxuICAvKipcbiAgICogVmFsaWRhdGUgYSB2YWx1ZSBhZ2FpbnN0IGl0cyBmb3JtIGRlZmluaXRpb24gYW5kIHNjaGVtYS5cbiAgICogVGhlIHZhbHVlIHNob3VsZCBlaXRoZXIgYmUgb2YgcHJvcGVyIHR5cGUgb3IgYSBzdHJpbmcsIHNvbWUgdHlwZVxuICAgKiBjb2VyY2lvbiBpcyBhcHBsaWVkLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gZm9ybSBBIG1lcmdlZCBmb3JtIGRlZmluaXRpb24sIGkuZS4gb25lIHdpdGggYSBzY2hlbWEuXG4gICAqIEBwYXJhbSB7QW55fSB2YWx1ZSB0aGUgdmFsdWUgdG8gdmFsaWRhdGUuXG4gICAqIEByZXR1cm4gYSB0djRqcyByZXN1bHQgb2JqZWN0LlxuICAgKi9cbiAgdmFsaWRhdG9yLnZhbGlkYXRlID0gZnVuY3Rpb24oZm9ybSwgdmFsdWUpIHtcbiAgICBpZiAoIWZvcm0pIHtcbiAgICAgIHJldHVybiB7dmFsaWQ6IHRydWV9O1xuICAgIH1cbiAgICB2YXIgc2NoZW1hID0gZm9ybS5zY2hlbWE7XG5cbiAgICBpZiAoIXNjaGVtYSkge1xuICAgICAgcmV0dXJuIHt2YWxpZDogdHJ1ZX07XG4gICAgfVxuXG4gICAgLy8gSW5wdXQgb2YgdHlwZSB0ZXh0IGFuZCB0ZXh0YXJlYXMgd2lsbCBnaXZlIHVzIGEgdmlld1ZhbHVlIG9mICcnXG4gICAgLy8gd2hlbiBlbXB0eSwgdGhpcyBpcyBhIHZhbGlkIHZhbHVlIGluIGEgc2NoZW1hIGFuZCBkb2VzIG5vdCBjb3VudCBhcyBzb21ldGhpbmdcbiAgICAvLyB0aGF0IGJyZWFrcyB2YWxpZGF0aW9uIG9mICdyZXF1aXJlZCcuIEJ1dCBmb3Igb3VyIG93biBzYW5pdHkgYW4gZW1wdHkgZmllbGQgc2hvdWxkXG4gICAgLy8gbm90IHZhbGlkYXRlIGlmIGl0J3MgcmVxdWlyZWQuXG4gICAgaWYgKHZhbHVlID09PSAnJykge1xuICAgICAgdmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgLy8gTnVtYmVycyBmaWVsZHMgd2lsbCBnaXZlIGEgbnVsbCB2YWx1ZSwgd2hpY2ggYWxzbyBtZWFucyBlbXB0eSBmaWVsZFxuICAgIGlmIChmb3JtLnR5cGUgPT09ICdudW1iZXInICYmIHZhbHVlID09PSBudWxsKSB7XG4gICAgICB2YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICAvLyBWZXJzaW9uIDQgb2YgSlNPTiBTY2hlbWEgaGFzIHRoZSByZXF1aXJlZCBwcm9wZXJ0eSBub3Qgb24gdGhlXG4gICAgLy8gcHJvcGVydHkgaXRzZWxmIGJ1dCBvbiB0aGUgd3JhcHBpbmcgb2JqZWN0LiBTaW5jZSB3ZSBsaWtlIHRvIHRlc3RcbiAgICAvLyBvbmx5IHRoaXMgcHJvcGVydHkgd2Ugd3JhcCBpdCBpbiBhIGZha2Ugb2JqZWN0LlxuICAgIHZhciB3cmFwID0ge3R5cGU6ICdvYmplY3QnLCAncHJvcGVydGllcyc6IHt9fTtcbiAgICB2YXIgcHJvcE5hbWUgPSBmb3JtLmtleVtmb3JtLmtleS5sZW5ndGggLSAxXTtcbiAgICB3cmFwLnByb3BlcnRpZXNbcHJvcE5hbWVdID0gc2NoZW1hO1xuXG4gICAgaWYgKGZvcm0ucmVxdWlyZWQpIHtcbiAgICAgIHdyYXAucmVxdWlyZWQgPSBbcHJvcE5hbWVdO1xuICAgIH1cbiAgICB2YXIgdmFsdWVXcmFwID0ge307XG4gICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKHZhbHVlKSkge1xuICAgICAgdmFsdWVXcmFwW3Byb3BOYW1lXSA9IHZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gdHY0LnZhbGlkYXRlUmVzdWx0KHZhbHVlV3JhcCwgd3JhcCk7XG5cbiAgfTtcblxuICByZXR1cm4gdmFsaWRhdG9yO1xufV0pO1xuXG4vKipcbiAqIERpcmVjdGl2ZSB0aGF0IGhhbmRsZXMgdGhlIG1vZGVsIGFycmF5c1xuICovXG5hbmd1bGFyLm1vZHVsZSgnc2NoZW1hRm9ybScpLmRpcmVjdGl2ZSgnc2ZBcnJheScsIFsnc2ZTZWxlY3QnLCAnc2NoZW1hRm9ybScsICdzZlZhbGlkYXRvcicsXG4gIGZ1bmN0aW9uKHNmU2VsZWN0LCBzY2hlbWFGb3JtLCBzZlZhbGlkYXRvcikge1xuXG4gICAgdmFyIHNldEluZGV4ID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihmb3JtKSB7XG4gICAgICAgIGlmIChmb3JtLmtleSkge1xuICAgICAgICAgIGZvcm0ua2V5W2Zvcm0ua2V5LmluZGV4T2YoJycpXSA9IGluZGV4O1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgIHNjb3BlOiB0cnVlLFxuICAgICAgcmVxdWlyZTogJz9uZ01vZGVsJyxcbiAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgbmdNb2RlbCkge1xuICAgICAgICB2YXIgZm9ybURlZkNhY2hlID0ge307XG5cbiAgICAgICAgLy8gV2F0Y2ggZm9yIHRoZSBmb3JtIGRlZmluaXRpb24gYW5kIHRoZW4gcmV3cml0ZSBpdC5cbiAgICAgICAgLy8gSXQncyB0aGUgKGZpcnN0KSBhcnJheSBwYXJ0IG9mIHRoZSBrZXksICdbXScgdGhhdCBuZWVkcyBhIG51bWJlclxuICAgICAgICAvLyBjb3JyZXNwb25kaW5nIHRvIGFuIGluZGV4IG9mIHRoZSBmb3JtLlxuICAgICAgICB2YXIgb25jZSA9IHNjb3BlLiR3YXRjaChhdHRycy5zZkFycmF5LCBmdW5jdGlvbihmb3JtKSB7XG5cbiAgICAgICAgICAvLyBBbiBhcnJheSBtb2RlbCBhbHdheXMgbmVlZHMgYSBrZXkgc28gd2Uga25vdyB3aGF0IHBhcnQgb2YgdGhlIG1vZGVsXG4gICAgICAgICAgLy8gdG8gbG9vayBhdC4gVGhpcyBtYWtlcyB1cyBhIGJpdCBpbmNvbXBhdGlibGUgd2l0aCBKU09OIEZvcm0sIG9uIHRoZVxuICAgICAgICAgIC8vIG90aGVyIGhhbmQgaXQgZW5hYmxlcyB0d28gd2F5IGJpbmRpbmcuXG4gICAgICAgICAgdmFyIGxpc3QgPSBzZlNlbGVjdChmb3JtLmtleSwgc2NvcGUubW9kZWwpO1xuXG4gICAgICAgICAgLy8gU2luY2UgbmctbW9kZWwgaGFwcGlseSBjcmVhdGVzIG9iamVjdHMgaW4gYSBkZWVwIHBhdGggd2hlbiBzZXR0aW5nIGFcbiAgICAgICAgICAvLyBhIHZhbHVlIGJ1dCBub3QgYXJyYXlzIHdlIG5lZWQgdG8gY3JlYXRlIHRoZSBhcnJheS5cbiAgICAgICAgICBpZiAoYW5ndWxhci5pc1VuZGVmaW5lZChsaXN0KSkge1xuICAgICAgICAgICAgbGlzdCA9IFtdO1xuICAgICAgICAgICAgc2ZTZWxlY3QoZm9ybS5rZXksIHNjb3BlLm1vZGVsLCBsaXN0KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgc2NvcGUubW9kZWxBcnJheSA9IGxpc3Q7XG5cbiAgICAgICAgICAvLyBBcnJheXMgd2l0aCB0aXRsZU1hcHMsIGkuZS4gY2hlY2tib3hlcyBkb2Vzbid0IGhhdmUgaXRlbXMuXG4gICAgICAgICAgaWYgKGZvcm0uaXRlbXMpIHtcblxuICAgICAgICAgICAgLy8gVG8gYmUgbW9yZSBjb21wYXRpYmxlIHdpdGggSlNPTiBGb3JtIHdlIHN1cHBvcnQgYW4gYXJyYXkgb2YgaXRlbXNcbiAgICAgICAgICAgIC8vIGluIHRoZSBmb3JtIGRlZmluaXRpb24gb2YgXCJhcnJheVwiICh0aGUgc2NoZW1hIGp1c3QgYSB2YWx1ZSkuXG4gICAgICAgICAgICAvLyBmb3IgdGhlIHN1YmZvcm1zIGNvZGUgdG8gd29yayB0aGlzIG1lYW5zIHdlIHdyYXAgZXZlcnl0aGluZyBpbiBhXG4gICAgICAgICAgICAvLyBzZWN0aW9uLiBVbmxlc3MgdGhlcmUgaXMganVzdCBvbmUuXG4gICAgICAgICAgICB2YXIgc3ViRm9ybSA9IGZvcm0uaXRlbXNbMF07XG4gICAgICAgICAgICBpZiAoZm9ybS5pdGVtcy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgIHN1YkZvcm0gPSB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3NlY3Rpb24nLFxuICAgICAgICAgICAgICAgIGl0ZW1zOiBmb3JtLml0ZW1zLm1hcChmdW5jdGlvbihpdGVtKXtcbiAgICAgICAgICAgICAgICAgIGl0ZW0ubmdNb2RlbE9wdGlvbnMgPSBmb3JtLm5nTW9kZWxPcHRpb25zO1xuICAgICAgICAgICAgICAgICAgaXRlbS5yZWFkb25seSA9IGZvcm0ucmVhZG9ubHk7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gV2UgY2VhdGUgY29waWVzIG9mIHRoZSBmb3JtIG9uIGRlbWFuZCwgY2FjaGluZyB0aGVtIGZvclxuICAgICAgICAgIC8vIGxhdGVyIHJlcXVlc3RzXG4gICAgICAgICAgc2NvcGUuY29weVdpdGhJbmRleCA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgICAgICBpZiAoIWZvcm1EZWZDYWNoZVtpbmRleF0pIHtcbiAgICAgICAgICAgICAgaWYgKHN1YkZvcm0pIHtcbiAgICAgICAgICAgICAgICB2YXIgY29weSA9IGFuZ3VsYXIuY29weShzdWJGb3JtKTtcbiAgICAgICAgICAgICAgICBjb3B5LmFycmF5SW5kZXggPSBpbmRleDtcbiAgICAgICAgICAgICAgICBzY2hlbWFGb3JtLnRyYXZlcnNlRm9ybShjb3B5LCBzZXRJbmRleChpbmRleCkpO1xuICAgICAgICAgICAgICAgIGZvcm1EZWZDYWNoZVtpbmRleF0gPSBjb3B5O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZm9ybURlZkNhY2hlW2luZGV4XTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgc2NvcGUuYXBwZW5kVG9BcnJheSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGxlbiA9IGxpc3QubGVuZ3RoO1xuICAgICAgICAgICAgdmFyIGNvcHkgPSBzY29wZS5jb3B5V2l0aEluZGV4KGxlbik7XG4gICAgICAgICAgICBzY2hlbWFGb3JtLnRyYXZlcnNlRm9ybShjb3B5LCBmdW5jdGlvbihwYXJ0KSB7XG4gICAgICAgICAgICAgIGlmIChwYXJ0LmtleSAmJiBhbmd1bGFyLmlzRGVmaW5lZChwYXJ0WydkZWZhdWx0J10pKSB7XG4gICAgICAgICAgICAgICAgc2ZTZWxlY3QocGFydC5rZXksIHNjb3BlLm1vZGVsLCBwYXJ0WydkZWZhdWx0J10pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gSWYgdGhlcmUgYXJlIG5vIGRlZmF1bHRzIG5vdGhpbmcgaXMgYWRkZWQgc28gd2UgbmVlZCB0byBpbml0aWFsaXplXG4gICAgICAgICAgICAvLyB0aGUgYXJyYXkuIHVuZGVmaW5lZCBmb3IgYmFzaWMgdmFsdWVzLCB7fSBvciBbXSBmb3IgdGhlIG90aGVycy5cbiAgICAgICAgICAgIGlmIChsZW4gPT09IGxpc3QubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIHZhciB0eXBlID0gc2ZTZWxlY3QoJ3NjaGVtYS5pdGVtcy50eXBlJywgZm9ybSk7XG4gICAgICAgICAgICAgIHZhciBkZmx0O1xuICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICBkZmx0ID0ge307XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2FycmF5Jykge1xuICAgICAgICAgICAgICAgIGRmbHQgPSBbXTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBsaXN0LnB1c2goZGZsdCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFRyaWdnZXIgdmFsaWRhdGlvbi5cbiAgICAgICAgICAgIGlmIChzY29wZS52YWxpZGF0ZUFycmF5KSB7XG4gICAgICAgICAgICAgIHNjb3BlLnZhbGlkYXRlQXJyYXkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBsaXN0O1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICBzY29wZS5kZWxldGVGcm9tQXJyYXkgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAgICAgbGlzdC5zcGxpY2UoaW5kZXgsIDEpO1xuXG4gICAgICAgICAgICAvLyBUcmlnZ2VyIHZhbGlkYXRpb24uXG4gICAgICAgICAgICBpZiAoc2NvcGUudmFsaWRhdGVBcnJheSkge1xuICAgICAgICAgICAgICBzY29wZS52YWxpZGF0ZUFycmF5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbGlzdDtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgLy8gQWx3YXlzIHN0YXJ0IHdpdGggb25lIGVtcHR5IGZvcm0gdW5sZXNzIGNvbmZpZ3VyZWQgb3RoZXJ3aXNlLlxuICAgICAgICAgIC8vIFNwZWNpYWwgY2FzZTogZG9uJ3QgZG8gaXQgaWYgZm9ybSBoYXMgYSB0aXRsZU1hcFxuICAgICAgICAgIGlmICghZm9ybS50aXRsZU1hcCAmJiBmb3JtLnN0YXJ0RW1wdHkgIT09IHRydWUgJiYgbGlzdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHNjb3BlLmFwcGVuZFRvQXJyYXkoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBUaXRsZSBNYXAgaGFuZGxpbmdcbiAgICAgICAgICAvLyBJZiBmb3JtIGhhcyBhIHRpdGxlTWFwIGNvbmZpZ3VyZWQgd2UnZCBsaWtlIHRvIGVuYWJsZSBsb29waW5nIG92ZXJcbiAgICAgICAgICAvLyB0aXRsZU1hcCBpbnN0ZWFkIG9mIG1vZGVsQXJyYXksIHRoaXMgaXMgdXNlZCBmb3IgaW50YW5jZSBpblxuICAgICAgICAgIC8vIGNoZWNrYm94ZXMuIFNvIGluc3RlYWQgb2YgdmFyaWFibGUgbnVtYmVyIG9mIHRoaW5ncyB3ZSBsaWtlIHRvIGNyZWF0ZVxuICAgICAgICAgIC8vIGEgYXJyYXkgdmFsdWUgZnJvbSBhIHN1YnNldCBvZiB2YWx1ZXMgaW4gdGhlIHRpdGxlTWFwLlxuICAgICAgICAgIC8vIFRoZSBwcm9ibGVtIGhlcmUgaXMgdGhhdCBuZy1tb2RlbCBvbiBhIGNoZWNrYm94IGRvZXNuJ3QgcmVhbGx5IG1hcCB0b1xuICAgICAgICAgIC8vIGEgbGlzdCBvZiB2YWx1ZXMuIFRoaXMgaXMgaGVyZSB0byBmaXggdGhhdC5cbiAgICAgICAgICBpZiAoZm9ybS50aXRsZU1hcCAmJiBmb3JtLnRpdGxlTWFwLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHNjb3BlLnRpdGxlTWFwVmFsdWVzID0gW107XG5cbiAgICAgICAgICAgIC8vIFdlIHdhdGNoIHRoZSBtb2RlbCBmb3IgY2hhbmdlcyBhbmQgdGhlIHRpdGxlTWFwVmFsdWVzIHRvIHJlZmxlY3RcbiAgICAgICAgICAgIC8vIHRoZSBtb2RlbEFycmF5XG4gICAgICAgICAgICB2YXIgdXBkYXRlVGl0bGVNYXBWYWx1ZXMgPSBmdW5jdGlvbihhcnIpIHtcbiAgICAgICAgICAgICAgc2NvcGUudGl0bGVNYXBWYWx1ZXMgPSBbXTtcbiAgICAgICAgICAgICAgYXJyID0gYXJyIHx8IFtdO1xuXG4gICAgICAgICAgICAgIGZvcm0udGl0bGVNYXAuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgc2NvcGUudGl0bGVNYXBWYWx1ZXMucHVzaChhcnIuaW5kZXhPZihpdGVtLnZhbHVlKSAhPT0gLTEpO1xuICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8vQ2F0Y2ggZGVmYXVsdCB2YWx1ZXNcbiAgICAgICAgICAgIHVwZGF0ZVRpdGxlTWFwVmFsdWVzKHNjb3BlLm1vZGVsQXJyYXkpO1xuICAgICAgICAgICAgc2NvcGUuJHdhdGNoQ29sbGVjdGlvbignbW9kZWxBcnJheScsIHVwZGF0ZVRpdGxlTWFwVmFsdWVzKTtcblxuICAgICAgICAgICAgLy9UbyBnZXQgdHdvIHdheSBiaW5kaW5nIHdlIGFsc28gd2F0Y2ggb3VyIHRpdGxlTWFwVmFsdWVzXG4gICAgICAgICAgICBzY29wZS4kd2F0Y2hDb2xsZWN0aW9uKCd0aXRsZU1hcFZhbHVlcycsIGZ1bmN0aW9uKHZhbHMpIHtcbiAgICAgICAgICAgICAgaWYgKHZhbHMpIHtcbiAgICAgICAgICAgICAgICB2YXIgYXJyID0gc2NvcGUubW9kZWxBcnJheTtcblxuICAgICAgICAgICAgICAgIC8vIEFwcGFyZW50bHkgdGhlIGZhc3Rlc3Qgd2F5IHRvIGNsZWFyIGFuIGFycmF5LCByZWFkYWJsZSB0b28uXG4gICAgICAgICAgICAgICAgLy8gaHR0cDovL2pzcGVyZi5jb20vYXJyYXktZGVzdHJveS8zMlxuICAgICAgICAgICAgICAgIHdoaWxlIChhcnIubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgYXJyLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9ybS50aXRsZU1hcC5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0sIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICBpZiAodmFsc1tpbmRleF0pIHtcbiAgICAgICAgICAgICAgICAgICAgYXJyLnB1c2goaXRlbS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gSWYgdGhlcmUgaXMgYSBuZ01vZGVsIHByZXNlbnQgd2UgbmVlZCB0byB2YWxpZGF0ZSB3aGVuIGFza2VkLlxuICAgICAgICAgIGlmIChuZ01vZGVsKSB7XG4gICAgICAgICAgICB2YXIgZXJyb3I7XG5cbiAgICAgICAgICAgIHNjb3BlLnZhbGlkYXRlQXJyYXkgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgLy8gVGhlIGFjdHVhbCBjb250ZW50IG9mIHRoZSBhcnJheSBpcyB2YWxpZGF0ZWQgYnkgZWFjaCBmaWVsZFxuICAgICAgICAgICAgICAvLyBzbyB3ZSBzZXR0bGUgZm9yIGNoZWNraW5nIHZhbGlkYXRpb25zIHNwZWNpZmljIHRvIGFycmF5c1xuXG4gICAgICAgICAgICAgIC8vIFNpbmNlIHdlIHByZWZpbGwgd2l0aCBlbXB0eSBhcnJheXMgd2UgY2FuIGdldCB0aGUgZnVubnkgc2l0dWF0aW9uXG4gICAgICAgICAgICAgIC8vIHdoZXJlIHRoZSBhcnJheSBpcyByZXF1aXJlZCBidXQgZW1wdHkgaW4gdGhlIGd1aSBidXQgc3RpbGwgdmFsaWRhdGVzLlxuICAgICAgICAgICAgICAvLyBUaGF0cyB3aHkgd2UgY2hlY2sgdGhlIGxlbmd0aC5cbiAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHNmVmFsaWRhdG9yLnZhbGlkYXRlKFxuICAgICAgICAgICAgICAgIGZvcm0sXG4gICAgICAgICAgICAgICAgc2NvcGUubW9kZWxBcnJheS5sZW5ndGggPiAwID8gc2NvcGUubW9kZWxBcnJheSA6IHVuZGVmaW5lZFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICBpZiAocmVzdWx0LnZhbGlkID09PSBmYWxzZSAmJlxuICAgICAgICAgICAgICAgICAgcmVzdWx0LmVycm9yICYmXG4gICAgICAgICAgICAgICAgICAocmVzdWx0LmVycm9yLmRhdGFQYXRoID09PSAnJyB8fFxuICAgICAgICAgICAgICAgICAgcmVzdWx0LmVycm9yLmRhdGFQYXRoID09PSAnLycgKyBmb3JtLmtleVtmb3JtLmtleS5sZW5ndGggLSAxXSkpIHtcblxuICAgICAgICAgICAgICAgIC8vIFNldCB2aWV3VmFsdWUgdG8gdHJpZ2dlciAkZGlydHkgb24gZmllbGQuIElmIHNvbWVvbmUga25vd3MgYVxuICAgICAgICAgICAgICAgIC8vIGEgYmV0dGVyIHdheSB0byBkbyBpdCBwbGVhc2UgdGVsbC5cbiAgICAgICAgICAgICAgICBuZ01vZGVsLiRzZXRWaWV3VmFsdWUoc2NvcGUubW9kZWxBcnJheSk7XG4gICAgICAgICAgICAgICAgZXJyb3IgPSByZXN1bHQuZXJyb3I7XG4gICAgICAgICAgICAgICAgbmdNb2RlbC4kc2V0VmFsaWRpdHkoJ3NjaGVtYScsIGZhbHNlKTtcblxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5nTW9kZWwuJHNldFZhbGlkaXR5KCdzY2hlbWEnLCB0cnVlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2NvcGUuJG9uKCdzY2hlbWFGb3JtVmFsaWRhdGUnLCBzY29wZS52YWxpZGF0ZUFycmF5KTtcblxuICAgICAgICAgICAgc2NvcGUuaGFzU3VjY2VzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gbmdNb2RlbC4kdmFsaWQgJiYgIW5nTW9kZWwuJHByaXN0aW5lO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2NvcGUuaGFzRXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIG5nTW9kZWwuJGludmFsaWQ7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzY29wZS5zY2hlbWFFcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gZXJyb3I7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgb25jZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5dKTtcblxuLyoqXG4gKiBBIHZlcnNpb24gb2YgbmctY2hhbmdlZCB0aGF0IG9ubHkgbGlzdGVucyBpZlxuICogdGhlcmUgaXMgYWN0dWFsbHkgYSBvbkNoYW5nZSBkZWZpbmVkIG9uIHRoZSBmb3JtXG4gKlxuICogVGFrZXMgdGhlIGZvcm0gZGVmaW5pdGlvbiBhcyBhcmd1bWVudC5cbiAqIElmIHRoZSBmb3JtIGRlZmluaXRpb24gaGFzIGEgXCJvbkNoYW5nZVwiIGRlZmluZWQgYXMgZWl0aGVyIGEgZnVuY3Rpb24gb3JcbiAqL1xuYW5ndWxhci5tb2R1bGUoJ3NjaGVtYUZvcm0nKS5kaXJlY3RpdmUoJ3NmQ2hhbmdlZCcsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHJlcXVpcmU6ICduZ01vZGVsJyxcbiAgICByZXN0cmljdDogJ0FDJyxcbiAgICBzY29wZTogZmFsc2UsXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XG4gICAgICB2YXIgZm9ybSA9IHNjb3BlLiRldmFsKGF0dHJzLnNmQ2hhbmdlZCk7XG4gICAgICAvL1wiZm9ybVwiIGlzIHJlYWxseSBndWFyYW50ZWVkIHRvIGJlIGhlcmUgc2luY2UgdGhlIGRlY29yYXRvciBkaXJlY3RpdmVcbiAgICAgIC8vd2FpdHMgZm9yIGl0LiBCdXQgYmVzdCBiZSBzdXJlLlxuICAgICAgaWYgKGZvcm0gJiYgZm9ybS5vbkNoYW5nZSkge1xuICAgICAgICBjdHJsLiR2aWV3Q2hhbmdlTGlzdGVuZXJzLnB1c2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKGFuZ3VsYXIuaXNGdW5jdGlvbihmb3JtLm9uQ2hhbmdlKSkge1xuICAgICAgICAgICAgZm9ybS5vbkNoYW5nZShjdHJsLiRtb2RlbFZhbHVlLCBmb3JtKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2NvcGUuZXZhbEV4cHIoZm9ybS5vbkNoYW5nZSwgeydtb2RlbFZhbHVlJzogY3RybC4kbW9kZWxWYWx1ZSwgZm9ybTogZm9ybX0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufSk7XG5cbi8qXG5GSVhNRTogcmVhbCBkb2N1bWVudGF0aW9uXG48Zm9ybSBzZi1mb3JtPVwiZm9ybVwiICBzZi1zY2hlbWE9XCJzY2hlbWFcIiBzZi1kZWNvcmF0b3I9XCJmb29iYXJcIj48L2Zvcm0+XG4qL1xuXG5hbmd1bGFyLm1vZHVsZSgnc2NoZW1hRm9ybScpXG4gICAgICAgLmRpcmVjdGl2ZSgnc2ZTY2hlbWEnLFxuWyckY29tcGlsZScsICdzY2hlbWFGb3JtJywgJ3NjaGVtYUZvcm1EZWNvcmF0b3JzJywgJ3NmU2VsZWN0JyxcbiAgZnVuY3Rpb24oJGNvbXBpbGUsICBzY2hlbWFGb3JtLCAgc2NoZW1hRm9ybURlY29yYXRvcnMsIHNmU2VsZWN0KSB7XG5cbiAgICB2YXIgU05BS0VfQ0FTRV9SRUdFWFAgPSAvW0EtWl0vZztcbiAgICB2YXIgc25ha2VDYXNlID0gZnVuY3Rpb24obmFtZSwgc2VwYXJhdG9yKSB7XG4gICAgICBzZXBhcmF0b3IgPSBzZXBhcmF0b3IgfHwgJ18nO1xuICAgICAgcmV0dXJuIG5hbWUucmVwbGFjZShTTkFLRV9DQVNFX1JFR0VYUCwgZnVuY3Rpb24obGV0dGVyLCBwb3MpIHtcbiAgICAgICAgcmV0dXJuIChwb3MgPyBzZXBhcmF0b3IgOiAnJykgKyBsZXR0ZXIudG9Mb3dlckNhc2UoKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgc2NvcGU6IHtcbiAgICAgICAgc2NoZW1hOiAnPXNmU2NoZW1hJyxcbiAgICAgICAgaW5pdGlhbEZvcm06ICc9c2ZGb3JtJyxcbiAgICAgICAgbW9kZWw6ICc9c2ZNb2RlbCcsXG4gICAgICAgIG9wdGlvbnM6ICc9c2ZPcHRpb25zJ1xuICAgICAgfSxcbiAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgZnVuY3Rpb24oJHNjb3BlKSB7XG4gICAgICAgIHRoaXMuZXZhbEluUGFyZW50U2NvcGUgPSBmdW5jdGlvbihleHByLCBsb2NhbHMpIHtcbiAgICAgICAgICByZXR1cm4gJHNjb3BlLiRwYXJlbnQuJGV2YWwoZXhwciwgbG9jYWxzKTtcbiAgICAgICAgfTtcbiAgICAgIH1dLFxuICAgICAgcmVwbGFjZTogZmFsc2UsXG4gICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgIHJlcXVpcmU6ICc/Zm9ybScsXG4gICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIGZvcm1DdHJsLCB0cmFuc2NsdWRlKSB7XG5cbiAgICAgICAgLy9leHBvc2UgZm9ybSBjb250cm9sbGVyIG9uIHNjb3BlIHNvIHRoYXQgd2UgZG9uJ3QgZm9yY2UgYXV0aG9ycyB0byB1c2UgbmFtZSBvbiBmb3JtXG4gICAgICAgIHNjb3BlLmZvcm1DdHJsID0gZm9ybUN0cmw7XG5cbiAgICAgICAgLy9XZSdkIGxpa2UgdG8gaGFuZGxlIGV4aXN0aW5nIG1hcmt1cCxcbiAgICAgICAgLy9iZXNpZGVzIHVzaW5nIGl0IGluIG91ciB0ZW1wbGF0ZSB3ZSBhbHNvXG4gICAgICAgIC8vY2hlY2sgZm9yIG5nLW1vZGVsIGFuZCBhZGQgdGhhdCB0byBhbiBpZ25vcmUgbGlzdFxuICAgICAgICAvL2kuZS4gZXZlbiBpZiBmb3JtIGhhcyBhIGRlZmluaXRpb24gZm9yIGl0IG9yIGZvcm0gaXMgW1wiKlwiXVxuICAgICAgICAvL3dlIGRvbid0IGdlbmVyYXRlIGl0LlxuICAgICAgICB2YXIgaWdub3JlID0ge307XG4gICAgICAgIHRyYW5zY2x1ZGUoc2NvcGUsIGZ1bmN0aW9uKGNsb25lKSB7XG4gICAgICAgICAgY2xvbmUuYWRkQ2xhc3MoJ3NjaGVtYS1mb3JtLWlnbm9yZScpO1xuICAgICAgICAgIGVsZW1lbnQucHJlcGVuZChjbG9uZSk7XG5cbiAgICAgICAgICBpZiAoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yQWxsKSB7XG4gICAgICAgICAgICB2YXIgbW9kZWxzID0gZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yQWxsKCdbbmctbW9kZWxdJyk7XG4gICAgICAgICAgICBpZiAobW9kZWxzKSB7XG4gICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW9kZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGtleSA9IG1vZGVsc1tpXS5nZXRBdHRyaWJ1dGUoJ25nLW1vZGVsJyk7XG4gICAgICAgICAgICAgICAgLy9za2lwIGZpcnN0IHBhcnQgYmVmb3JlIC5cbiAgICAgICAgICAgICAgICBpZ25vcmVba2V5LnN1YnN0cmluZyhrZXkuaW5kZXhPZignLicpICsgMSldID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vU2luY2Ugd2UgYXJlIGRlcGVuZGFudCBvbiB1cCB0byB0aHJlZVxuICAgICAgICAvL2F0dHJpYnV0ZXMgd2UnbGwgZG8gYSBjb21tb24gd2F0Y2hcbiAgICAgICAgdmFyIGxhc3REaWdlc3QgPSB7fTtcblxuICAgICAgICBzY29wZS4kd2F0Y2goZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICB2YXIgc2NoZW1hID0gc2NvcGUuc2NoZW1hO1xuICAgICAgICAgIHZhciBmb3JtICAgPSBzY29wZS5pbml0aWFsRm9ybSB8fCBbJyonXTtcblxuICAgICAgICAgIC8vVGhlIGNoZWNrIGZvciBzY2hlbWEudHlwZSBpcyB0byBlbnN1cmUgdGhhdCBzY2hlbWEgaXMgbm90IHt9XG4gICAgICAgICAgaWYgKGZvcm0gJiYgc2NoZW1hICYmIHNjaGVtYS50eXBlICYmXG4gICAgICAgICAgICAgIChsYXN0RGlnZXN0LmZvcm0gIT09IGZvcm0gfHwgbGFzdERpZ2VzdC5zY2hlbWEgIT09IHNjaGVtYSkgJiZcbiAgICAgICAgICAgICAgT2JqZWN0LmtleXMoc2NoZW1hLnByb3BlcnRpZXMpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGxhc3REaWdlc3Quc2NoZW1hID0gc2NoZW1hO1xuICAgICAgICAgICAgbGFzdERpZ2VzdC5mb3JtID0gZm9ybTtcblxuICAgICAgICAgICAgdmFyIG1lcmdlZCA9IHNjaGVtYUZvcm0ubWVyZ2Uoc2NoZW1hLCBmb3JtLCBpZ25vcmUsIHNjb3BlLm9wdGlvbnMpO1xuICAgICAgICAgICAgdmFyIGZyYWcgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG5cbiAgICAgICAgICAgIC8vbWFrZSB0aGUgZm9ybSBhdmFpbGFibGUgdG8gZGVjb3JhdG9yc1xuICAgICAgICAgICAgc2NvcGUuc2NoZW1hRm9ybSAgPSB7Zm9ybTogIG1lcmdlZCwgc2NoZW1hOiBzY2hlbWF9O1xuXG4gICAgICAgICAgICAvL2NsZWFuIGFsbCBidXQgcHJlIGV4aXN0aW5nIGh0bWwuXG4gICAgICAgICAgICBlbGVtZW50LmNoaWxkcmVuKCc6bm90KC5zY2hlbWEtZm9ybS1pZ25vcmUpJykucmVtb3ZlKCk7XG5cbiAgICAgICAgICAgIC8vQ3JlYXRlIGRpcmVjdGl2ZXMgZnJvbSB0aGUgZm9ybSBkZWZpbml0aW9uXG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2gobWVyZ2VkLGZ1bmN0aW9uKG9iaixpKXtcbiAgICAgICAgICAgICAgdmFyIG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGF0dHJzLnNmRGVjb3JhdG9yIHx8IHNuYWtlQ2FzZShzY2hlbWFGb3JtRGVjb3JhdG9ycy5kZWZhdWx0RGVjb3JhdG9yLCctJykpO1xuICAgICAgICAgICAgICBuLnNldEF0dHJpYnV0ZSgnZm9ybScsJ3NjaGVtYUZvcm0uZm9ybVsnK2krJ10nKTtcbiAgICAgICAgICAgICAgdmFyIHNsb3Q7XG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgc2xvdCA9IGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignKltzZi1pbnNlcnQtZmllbGQ9XCInICsgb2JqLmtleSArICdcIl0nKTtcbiAgICAgICAgICAgICAgfSBjYXRjaChlcnIpIHtcbiAgICAgICAgICAgICAgICAvLyBmaWVsZCBpbnNlcnRpb24gbm90IHN1cHBvcnRlZCBmb3IgY29tcGxleCBrZXlzXG4gICAgICAgICAgICAgICAgc2xvdCA9IG51bGw7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYoc2xvdCkge1xuICAgICAgICAgICAgICAgIHNsb3QuaW5uZXJIVE1MID0gXCJcIjtcbiAgICAgICAgICAgICAgICBzbG90LmFwcGVuZENoaWxkKG4pOyAgXG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZnJhZy5hcHBlbmRDaGlsZChuKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGVsZW1lbnRbMF0uYXBwZW5kQ2hpbGQoZnJhZyk7XG5cbiAgICAgICAgICAgIC8vY29tcGlsZSBvbmx5IGNoaWxkcmVuXG4gICAgICAgICAgICAkY29tcGlsZShlbGVtZW50LmNoaWxkcmVuKCkpKHNjb3BlKTtcblxuICAgICAgICAgICAgLy9vaywgbm93IHRoYXQgdGhhdCBpcyBkb25lIGxldCdzIHNldCBhbnkgZGVmYXVsdHNcbiAgICAgICAgICAgIHNjaGVtYUZvcm0udHJhdmVyc2VTY2hlbWEoc2NoZW1hLCBmdW5jdGlvbihwcm9wLCBwYXRoKSB7XG4gICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZChwcm9wWydkZWZhdWx0J10pKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZhbCA9IHNmU2VsZWN0KHBhdGgsIHNjb3BlLm1vZGVsKTtcbiAgICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc1VuZGVmaW5lZCh2YWwpKSB7XG4gICAgICAgICAgICAgICAgICBzZlNlbGVjdChwYXRoLCBzY29wZS5tb2RlbCwgcHJvcFsnZGVmYXVsdCddKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXSk7XG5cbmFuZ3VsYXIubW9kdWxlKCdzY2hlbWFGb3JtJykuZGlyZWN0aXZlKCdzY2hlbWFWYWxpZGF0ZScsIFsnc2ZWYWxpZGF0b3InLCBmdW5jdGlvbihzZlZhbGlkYXRvcikge1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnQScsXG4gICAgc2NvcGU6IGZhbHNlLFxuICAgIC8vIFdlIHdhbnQgdGhlIGxpbmsgZnVuY3Rpb24gdG8gYmUgKmFmdGVyKiB0aGUgaW5wdXQgZGlyZWN0aXZlcyBsaW5rIGZ1bmN0aW9uIHNvIHdlIGdldCBhY2Nlc3NcbiAgICAvLyB0aGUgcGFyc2VkIHZhbHVlLCBleC4gYSBudW1iZXIgaW5zdGVhZCBvZiBhIHN0cmluZ1xuICAgIHByaW9yaXR5OiAxMDAwLFxuICAgIHJlcXVpcmU6ICduZ01vZGVsJyxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIG5nTW9kZWwpIHtcbiAgICAgIC8vU2luY2Ugd2UgaGF2ZSBzY29wZSBmYWxzZSB0aGlzIGlzIHRoZSBzYW1lIHNjb3BlXG4gICAgICAvL2FzIHRoZSBkZWNvcmF0b3JcbiAgICAgIHNjb3BlLm5nTW9kZWwgPSBuZ01vZGVsO1xuXG4gICAgICB2YXIgZXJyb3IgPSBudWxsO1xuXG4gICAgICB2YXIgZ2V0Rm9ybSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIWZvcm0pIHtcbiAgICAgICAgICBmb3JtID0gc2NvcGUuJGV2YWwoYXR0cnMuc2NoZW1hVmFsaWRhdGUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmb3JtO1xuICAgICAgfTtcbiAgICAgIHZhciBmb3JtICAgPSBnZXRGb3JtKCk7XG5cbiAgICAgIC8vIFZhbGlkYXRlIGFnYWluc3QgdGhlIHNjaGVtYS5cblxuICAgICAgLy8gR2V0IGluIGxhc3Qgb2YgdGhlIHBhcnNlcyBzbyB0aGUgcGFyc2VkIHZhbHVlIGhhcyB0aGUgY29ycmVjdCB0eXBlLlxuICAgICAgaWYgKG5nTW9kZWwuJHZhbGlkYXRvcnMpIHsgLy8gQW5ndWxhciAxLjNcbiAgICAgICAgbmdNb2RlbC4kdmFsaWRhdG9ycy5zY2hlbWEgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIHZhciByZXN1bHQgPSBzZlZhbGlkYXRvci52YWxpZGF0ZShnZXRGb3JtKCksIHZhbHVlKTtcbiAgICAgICAgICBlcnJvciA9IHJlc3VsdC5lcnJvcjtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0LnZhbGlkO1xuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcblxuICAgICAgICAvLyBBbmd1bGFyIDEuMlxuICAgICAgICBuZ01vZGVsLiRwYXJzZXJzLnB1c2goZnVuY3Rpb24odmlld1ZhbHVlKSB7XG4gICAgICAgICAgZm9ybSA9IGdldEZvcm0oKTtcbiAgICAgICAgICAvL1N0aWxsIG1pZ2h0IGJlIHVuZGVmaW5lZFxuICAgICAgICAgIGlmICghZm9ybSkge1xuICAgICAgICAgICAgcmV0dXJuIHZpZXdWYWx1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgcmVzdWx0ID0gIHNmVmFsaWRhdG9yLnZhbGlkYXRlKGZvcm0sIHZpZXdWYWx1ZSk7XG5cbiAgICAgICAgICBpZiAocmVzdWx0LnZhbGlkKSB7XG4gICAgICAgICAgICAvLyBpdCBpcyB2YWxpZFxuICAgICAgICAgICAgbmdNb2RlbC4kc2V0VmFsaWRpdHkoJ3NjaGVtYScsIHRydWUpO1xuICAgICAgICAgICAgcmV0dXJuIHZpZXdWYWx1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gaXQgaXMgaW52YWxpZCwgcmV0dXJuIHVuZGVmaW5lZCAobm8gbW9kZWwgdXBkYXRlKVxuICAgICAgICAgICAgbmdNb2RlbC4kc2V0VmFsaWRpdHkoJ3NjaGVtYScsIGZhbHNlKTtcbiAgICAgICAgICAgIGVycm9yID0gcmVzdWx0LmVycm9yO1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG5cbiAgICAgIC8vIExpc3RlbiB0byBhbiBldmVudCBzbyB3ZSBjYW4gdmFsaWRhdGUgdGhlIGlucHV0IG9uIHJlcXVlc3RcbiAgICAgIHNjb3BlLiRvbignc2NoZW1hRm9ybVZhbGlkYXRlJywgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgaWYgKG5nTW9kZWwuJHZhbGlkYXRlKSB7XG4gICAgICAgICAgbmdNb2RlbC4kdmFsaWRhdGUoKTtcbiAgICAgICAgICBpZiAobmdNb2RlbC4kaW52YWxpZCkgeyAvLyBUaGUgZmllbGQgbXVzdCBiZSBtYWRlIGRpcnR5IHNvIHRoZSBlcnJvciBtZXNzYWdlIGlzIGRpc3BsYXllZFxuICAgICAgICAgICAgbmdNb2RlbC4kZGlydHkgPSB0cnVlO1xuICAgICAgICAgICAgbmdNb2RlbC4kcHJpc3RpbmUgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmdNb2RlbC4kc2V0Vmlld1ZhbHVlKG5nTW9kZWwuJHZpZXdWYWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvL1RoaXMgd29ya3Mgc2luY2Ugd2Ugbm93IHdlJ3JlIGluc2lkZSBhIGRlY29yYXRvciBhbmQgdGhhdCB0aGlzIGlzIHRoZSBkZWNvcmF0b3JzIHNjb3BlLlxuICAgICAgLy9JZiAkcHJpc3RpbmUgYW5kIGVtcHR5IGRvbid0IHNob3cgc3VjY2VzcyAoZXZlbiBpZiBpdCdzIHZhbGlkKVxuICAgICAgc2NvcGUuaGFzU3VjY2VzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbmdNb2RlbC4kdmFsaWQgJiYgKCFuZ01vZGVsLiRwcmlzdGluZSB8fCAhbmdNb2RlbC4kaXNFbXB0eShuZ01vZGVsLiRtb2RlbFZhbHVlKSk7XG4gICAgICB9O1xuXG4gICAgICBzY29wZS5oYXNFcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbmdNb2RlbC4kaW52YWxpZCAmJiAhbmdNb2RlbC4kcHJpc3RpbmU7XG4gICAgICB9O1xuXG4gICAgICBzY29wZS5zY2hlbWFFcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gZXJyb3I7XG4gICAgICB9O1xuXG4gICAgfVxuICB9O1xufV0pO1xuIiwiLyohXG4gKiBhbmd1bGFyLXRyYW5zbGF0ZSAtIHYyLjYuMSAtIDIwMTUtMDMtMDFcbiAqIGh0dHA6Ly9naXRodWIuY29tL2FuZ3VsYXItdHJhbnNsYXRlL2FuZ3VsYXItdHJhbnNsYXRlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUgOyBMaWNlbnNlZCBNSVRcbiAqL1xuLyoqXG4gKiBAbmdkb2Mgb3ZlcnZpZXdcbiAqIEBuYW1lIHBhc2NhbHByZWNodC50cmFuc2xhdGVcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIFRoZSBtYWluIG1vZHVsZSB3aGljaCBob2xkcyBldmVyeXRoaW5nIHRvZ2V0aGVyLlxuICovXG5hbmd1bGFyLm1vZHVsZSgncGFzY2FscHJlY2h0LnRyYW5zbGF0ZScsIFsnbmcnXSlcblxuLnJ1bihbJyR0cmFuc2xhdGUnLCBmdW5jdGlvbiAoJHRyYW5zbGF0ZSkge1xuXG4gIHZhciBrZXkgPSAkdHJhbnNsYXRlLnN0b3JhZ2VLZXkoKSxcbiAgICAgIHN0b3JhZ2UgPSAkdHJhbnNsYXRlLnN0b3JhZ2UoKTtcblxuICB2YXIgZmFsbGJhY2tGcm9tSW5jb3JyZWN0U3RvcmFnZVZhbHVlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHByZWZlcnJlZCA9ICR0cmFuc2xhdGUucHJlZmVycmVkTGFuZ3VhZ2UoKTtcbiAgICBpZiAoYW5ndWxhci5pc1N0cmluZyhwcmVmZXJyZWQpKSB7XG4gICAgICAkdHJhbnNsYXRlLnVzZShwcmVmZXJyZWQpO1xuICAgICAgLy8gJHRyYW5zbGF0ZS51c2UoKSB3aWxsIGFsc28gcmVtZW1iZXIgdGhlIGxhbmd1YWdlLlxuICAgICAgLy8gU28sIHdlIGRvbid0IG5lZWQgdG8gY2FsbCBzdG9yYWdlLnB1dCgpIGhlcmUuXG4gICAgfSBlbHNlIHtcbiAgICAgIHN0b3JhZ2UucHV0KGtleSwgJHRyYW5zbGF0ZS51c2UoKSk7XG4gICAgfVxuICB9O1xuXG4gIGlmIChzdG9yYWdlKSB7XG4gICAgaWYgKCFzdG9yYWdlLmdldChrZXkpKSB7XG4gICAgICBmYWxsYmFja0Zyb21JbmNvcnJlY3RTdG9yYWdlVmFsdWUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJHRyYW5zbGF0ZS51c2Uoc3RvcmFnZS5nZXQoa2V5KSlbJ2NhdGNoJ10oZmFsbGJhY2tGcm9tSW5jb3JyZWN0U3RvcmFnZVZhbHVlKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoYW5ndWxhci5pc1N0cmluZygkdHJhbnNsYXRlLnByZWZlcnJlZExhbmd1YWdlKCkpKSB7XG4gICAgJHRyYW5zbGF0ZS51c2UoJHRyYW5zbGF0ZS5wcmVmZXJyZWRMYW5ndWFnZSgpKTtcbiAgfVxufV0pO1xuXG4vKipcbiAqIEBuZ2RvYyBvYmplY3RcbiAqIEBuYW1lIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVByb3ZpZGVyXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiAkdHJhbnNsYXRlUHJvdmlkZXIgYWxsb3dzIGRldmVsb3BlcnMgdG8gcmVnaXN0ZXIgdHJhbnNsYXRpb24tdGFibGVzLCBhc3luY2hyb25vdXMgbG9hZGVyc1xuICogYW5kIHNpbWlsYXIgdG8gY29uZmlndXJlIHRyYW5zbGF0aW9uIGJlaGF2aW9yIGRpcmVjdGx5IGluc2lkZSBvZiBhIG1vZHVsZS5cbiAqXG4gKi9cbmFuZ3VsYXIubW9kdWxlKCdwYXNjYWxwcmVjaHQudHJhbnNsYXRlJykucHJvdmlkZXIoJyR0cmFuc2xhdGUnLCBbJyRTVE9SQUdFX0tFWScsICckd2luZG93UHJvdmlkZXInLCBmdW5jdGlvbiAoJFNUT1JBR0VfS0VZLCAkd2luZG93UHJvdmlkZXIpIHtcblxuICB2YXIgJHRyYW5zbGF0aW9uVGFibGUgPSB7fSxcbiAgICAgICRwcmVmZXJyZWRMYW5ndWFnZSxcbiAgICAgICRhdmFpbGFibGVMYW5ndWFnZUtleXMgPSBbXSxcbiAgICAgICRsYW5ndWFnZUtleUFsaWFzZXMsXG4gICAgICAkZmFsbGJhY2tMYW5ndWFnZSxcbiAgICAgICRmYWxsYmFja1dhc1N0cmluZyxcbiAgICAgICR1c2VzLFxuICAgICAgJG5leHRMYW5nLFxuICAgICAgJHN0b3JhZ2VGYWN0b3J5LFxuICAgICAgJHN0b3JhZ2VLZXkgPSAkU1RPUkFHRV9LRVksXG4gICAgICAkc3RvcmFnZVByZWZpeCxcbiAgICAgICRtaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyRmFjdG9yeSxcbiAgICAgICRpbnRlcnBvbGF0aW9uRmFjdG9yeSxcbiAgICAgICRpbnRlcnBvbGF0b3JGYWN0b3JpZXMgPSBbXSxcbiAgICAgICRpbnRlcnBvbGF0aW9uU2FuaXRpemF0aW9uU3RyYXRlZ3kgPSBmYWxzZSxcbiAgICAgICRsb2FkZXJGYWN0b3J5LFxuICAgICAgJGNsb2FrQ2xhc3NOYW1lID0gJ3RyYW5zbGF0ZS1jbG9haycsXG4gICAgICAkbG9hZGVyT3B0aW9ucyxcbiAgICAgICRub3RGb3VuZEluZGljYXRvckxlZnQsXG4gICAgICAkbm90Rm91bmRJbmRpY2F0b3JSaWdodCxcbiAgICAgICRwb3N0Q29tcGlsaW5nRW5hYmxlZCA9IGZhbHNlLFxuICAgICAgTkVTVEVEX09CSkVDVF9ERUxJTUlURVIgPSAnLicsXG4gICAgICBsb2FkZXJDYWNoZSxcbiAgICAgIGRpcmVjdGl2ZVByaW9yaXR5ID0gMDtcblxuICB2YXIgdmVyc2lvbiA9ICcyLjYuMSc7XG5cbiAgLy8gdHJpZXMgdG8gZGV0ZXJtaW5lIHRoZSBicm93c2VycyBsYW5ndWFnZVxuICB2YXIgZ2V0Rmlyc3RCcm93c2VyTGFuZ3VhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG5hdiA9ICR3aW5kb3dQcm92aWRlci4kZ2V0KCkubmF2aWdhdG9yLFxuICAgICAgICBicm93c2VyTGFuZ3VhZ2VQcm9wZXJ0eUtleXMgPSBbJ2xhbmd1YWdlJywgJ2Jyb3dzZXJMYW5ndWFnZScsICdzeXN0ZW1MYW5ndWFnZScsICd1c2VyTGFuZ3VhZ2UnXSxcbiAgICAgICAgaSxcbiAgICAgICAgbGFuZ3VhZ2U7XG5cbiAgICAvLyBzdXBwb3J0IGZvciBIVE1MIDUuMSBcIm5hdmlnYXRvci5sYW5ndWFnZXNcIlxuICAgIGlmIChhbmd1bGFyLmlzQXJyYXkobmF2Lmxhbmd1YWdlcykpIHtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBuYXYubGFuZ3VhZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxhbmd1YWdlID0gbmF2Lmxhbmd1YWdlc1tpXTtcbiAgICAgICAgaWYgKGxhbmd1YWdlICYmIGxhbmd1YWdlLmxlbmd0aCkge1xuICAgICAgICAgIHJldHVybiBsYW5ndWFnZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHN1cHBvcnQgZm9yIG90aGVyIHdlbGwga25vd24gcHJvcGVydGllcyBpbiBicm93c2Vyc1xuICAgIGZvciAoaSA9IDA7IGkgPCBicm93c2VyTGFuZ3VhZ2VQcm9wZXJ0eUtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxhbmd1YWdlID0gbmF2W2Jyb3dzZXJMYW5ndWFnZVByb3BlcnR5S2V5c1tpXV07XG4gICAgICBpZiAobGFuZ3VhZ2UgJiYgbGFuZ3VhZ2UubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBsYW5ndWFnZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcbiAgZ2V0Rmlyc3RCcm93c2VyTGFuZ3VhZ2UuZGlzcGxheU5hbWUgPSAnYW5ndWxhci10cmFuc2xhdGUvc2VydmljZTogZ2V0Rmlyc3RCcm93c2VyTGFuZ3VhZ2UnO1xuXG4gIC8vIHRyaWVzIHRvIGRldGVybWluZSB0aGUgYnJvd3NlcnMgbG9jYWxlXG4gIHZhciBnZXRMb2NhbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIChnZXRGaXJzdEJyb3dzZXJMYW5ndWFnZSgpIHx8ICcnKS5zcGxpdCgnLScpLmpvaW4oJ18nKTtcbiAgfTtcbiAgZ2V0TG9jYWxlLmRpc3BsYXlOYW1lID0gJ2FuZ3VsYXItdHJhbnNsYXRlL3NlcnZpY2U6IGdldExvY2FsZSc7XG5cbiAgLyoqXG4gICAqIEBuYW1lIGluZGV4T2ZcbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIGluZGV4T2YgcG9seWZpbGwuIEtpbmRhIHNvcnRhLlxuICAgKlxuICAgKiBAcGFyYW0ge2FycmF5fSBhcnJheSBBcnJheSB0byBzZWFyY2ggaW4uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzZWFyY2hFbGVtZW50IEVsZW1lbnQgdG8gc2VhcmNoIGZvci5cbiAgICpcbiAgICogQHJldHVybnMge2ludH0gSW5kZXggb2Ygc2VhcmNoIGVsZW1lbnQuXG4gICAqL1xuICB2YXIgaW5kZXhPZiA9IGZ1bmN0aW9uKGFycmF5LCBzZWFyY2hFbGVtZW50KSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGFycmF5Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBpZiAoYXJyYXlbaV0gPT09IHNlYXJjaEVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIGk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAtMTtcbiAgfTtcblxuICAvKipcbiAgICogQG5hbWUgdHJpbVxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogdHJpbSBwb2x5ZmlsbFxuICAgKlxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgc3RyaW5nIHN0cmlwcGVkIG9mIHdoaXRlc3BhY2UgZnJvbSBib3RoIGVuZHNcbiAgICovXG4gIHZhciB0cmltID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xuICB9O1xuXG4gIHZhciBuZWdvdGlhdGVMb2NhbGUgPSBmdW5jdGlvbiAocHJlZmVycmVkKSB7XG5cbiAgICB2YXIgYXZhaWwgPSBbXSxcbiAgICAgICAgbG9jYWxlID0gYW5ndWxhci5sb3dlcmNhc2UocHJlZmVycmVkKSxcbiAgICAgICAgaSA9IDAsXG4gICAgICAgIG4gPSAkYXZhaWxhYmxlTGFuZ3VhZ2VLZXlzLmxlbmd0aDtcblxuICAgIGZvciAoOyBpIDwgbjsgaSsrKSB7XG4gICAgICBhdmFpbC5wdXNoKGFuZ3VsYXIubG93ZXJjYXNlKCRhdmFpbGFibGVMYW5ndWFnZUtleXNbaV0pKTtcbiAgICB9XG5cbiAgICBpZiAoaW5kZXhPZihhdmFpbCwgbG9jYWxlKSA+IC0xKSB7XG4gICAgICByZXR1cm4gcHJlZmVycmVkO1xuICAgIH1cblxuICAgIGlmICgkbGFuZ3VhZ2VLZXlBbGlhc2VzKSB7XG4gICAgICB2YXIgYWxpYXM7XG4gICAgICBmb3IgKHZhciBsYW5nS2V5QWxpYXMgaW4gJGxhbmd1YWdlS2V5QWxpYXNlcykge1xuICAgICAgICB2YXIgaGFzV2lsZGNhcmRLZXkgPSBmYWxzZTtcbiAgICAgICAgdmFyIGhhc0V4YWN0S2V5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKCRsYW5ndWFnZUtleUFsaWFzZXMsIGxhbmdLZXlBbGlhcykgJiZcbiAgICAgICAgICBhbmd1bGFyLmxvd2VyY2FzZShsYW5nS2V5QWxpYXMpID09PSBhbmd1bGFyLmxvd2VyY2FzZShwcmVmZXJyZWQpO1xuXG4gICAgICAgIGlmIChsYW5nS2V5QWxpYXMuc2xpY2UoLTEpID09PSAnKicpIHtcbiAgICAgICAgICBoYXNXaWxkY2FyZEtleSA9IGxhbmdLZXlBbGlhcy5zbGljZSgwLCAtMSkgPT09IHByZWZlcnJlZC5zbGljZSgwLCBsYW5nS2V5QWxpYXMubGVuZ3RoLTEpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChoYXNFeGFjdEtleSB8fCBoYXNXaWxkY2FyZEtleSkge1xuICAgICAgICAgIGFsaWFzID0gJGxhbmd1YWdlS2V5QWxpYXNlc1tsYW5nS2V5QWxpYXNdO1xuICAgICAgICAgIGlmIChpbmRleE9mKGF2YWlsLCBhbmd1bGFyLmxvd2VyY2FzZShhbGlhcykpID4gLTEpIHtcbiAgICAgICAgICAgIHJldHVybiBhbGlhcztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgcGFydHMgPSBwcmVmZXJyZWQuc3BsaXQoJ18nKTtcblxuICAgIGlmIChwYXJ0cy5sZW5ndGggPiAxICYmIGluZGV4T2YoYXZhaWwsIGFuZ3VsYXIubG93ZXJjYXNlKHBhcnRzWzBdKSkgPiAtMSkge1xuICAgICAgcmV0dXJuIHBhcnRzWzBdO1xuICAgIH1cblxuICAgIC8vIElmIGV2ZXJ5dGhpbmcgZmFpbHMsIGp1c3QgcmV0dXJuIHRoZSBwcmVmZXJyZWQsIHVuY2hhbmdlZC5cbiAgICByZXR1cm4gcHJlZmVycmVkO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICogQG5hbWUgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlUHJvdmlkZXIjdHJhbnNsYXRpb25zXG4gICAqIEBtZXRob2RPZiBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlclxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogUmVnaXN0ZXJzIGEgbmV3IHRyYW5zbGF0aW9uIHRhYmxlIGZvciBzcGVjaWZpYyBsYW5ndWFnZSBrZXkuXG4gICAqXG4gICAqIFRvIHJlZ2lzdGVyIGEgdHJhbnNsYXRpb24gdGFibGUgZm9yIHNwZWNpZmljIGxhbmd1YWdlLCBwYXNzIGEgZGVmaW5lZCBsYW5ndWFnZVxuICAgKiBrZXkgYXMgZmlyc3QgcGFyYW1ldGVyLlxuICAgKlxuICAgKiA8cHJlPlxuICAgKiAgLy8gcmVnaXN0ZXIgdHJhbnNsYXRpb24gdGFibGUgZm9yIGxhbmd1YWdlOiAnZGVfREUnXG4gICAqICAkdHJhbnNsYXRlUHJvdmlkZXIudHJhbnNsYXRpb25zKCdkZV9ERScsIHtcbiAgICogICAgJ0dSRUVUSU5HJzogJ0hhbGxvIFdlbHQhJ1xuICAgKiAgfSk7XG4gICAqXG4gICAqICAvLyByZWdpc3RlciBhbm90aGVyIG9uZVxuICAgKiAgJHRyYW5zbGF0ZVByb3ZpZGVyLnRyYW5zbGF0aW9ucygnZW5fVVMnLCB7XG4gICAqICAgICdHUkVFVElORyc6ICdIZWxsbyB3b3JsZCEnXG4gICAqICB9KTtcbiAgICogPC9wcmU+XG4gICAqXG4gICAqIFdoZW4gcmVnaXN0ZXJpbmcgbXVsdGlwbGUgdHJhbnNsYXRpb24gdGFibGVzIGZvciBmb3IgdGhlIHNhbWUgbGFuZ3VhZ2Uga2V5LFxuICAgKiB0aGUgYWN0dWFsIHRyYW5zbGF0aW9uIHRhYmxlIGdldHMgZXh0ZW5kZWQuIFRoaXMgYWxsb3dzIHlvdSB0byBkZWZpbmUgbW9kdWxlXG4gICAqIHNwZWNpZmljIHRyYW5zbGF0aW9uIHdoaWNoIG9ubHkgZ2V0IGFkZGVkLCBvbmNlIGEgc3BlY2lmaWMgbW9kdWxlIGlzIGxvYWRlZCBpblxuICAgKiB5b3VyIGFwcC5cbiAgICpcbiAgICogSW52b2tpbmcgdGhpcyBtZXRob2Qgd2l0aCBubyBhcmd1bWVudHMgcmV0dXJucyB0aGUgdHJhbnNsYXRpb24gdGFibGUgd2hpY2ggd2FzXG4gICAqIHJlZ2lzdGVyZWQgd2l0aCBubyBsYW5ndWFnZSBrZXkuIEludm9raW5nIGl0IHdpdGggYSBsYW5ndWFnZSBrZXkgcmV0dXJucyB0aGVcbiAgICogcmVsYXRlZCB0cmFuc2xhdGlvbiB0YWJsZS5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGtleSBBIGxhbmd1YWdlIGtleS5cbiAgICogQHBhcmFtIHtvYmplY3R9IHRyYW5zbGF0aW9uVGFibGUgQSBwbGFpbiBvbGQgSmF2YVNjcmlwdCBvYmplY3QgdGhhdCByZXByZXNlbnRzIGEgdHJhbnNsYXRpb24gdGFibGUuXG4gICAqXG4gICAqL1xuICB2YXIgdHJhbnNsYXRpb25zID0gZnVuY3Rpb24gKGxhbmdLZXksIHRyYW5zbGF0aW9uVGFibGUpIHtcblxuICAgIGlmICghbGFuZ0tleSAmJiAhdHJhbnNsYXRpb25UYWJsZSkge1xuICAgICAgcmV0dXJuICR0cmFuc2xhdGlvblRhYmxlO1xuICAgIH1cblxuICAgIGlmIChsYW5nS2V5ICYmICF0cmFuc2xhdGlvblRhYmxlKSB7XG4gICAgICBpZiAoYW5ndWxhci5pc1N0cmluZyhsYW5nS2V5KSkge1xuICAgICAgICByZXR1cm4gJHRyYW5zbGF0aW9uVGFibGVbbGFuZ0tleV07XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghYW5ndWxhci5pc09iamVjdCgkdHJhbnNsYXRpb25UYWJsZVtsYW5nS2V5XSkpIHtcbiAgICAgICAgJHRyYW5zbGF0aW9uVGFibGVbbGFuZ0tleV0gPSB7fTtcbiAgICAgIH1cbiAgICAgIGFuZ3VsYXIuZXh0ZW5kKCR0cmFuc2xhdGlvblRhYmxlW2xhbmdLZXldLCBmbGF0T2JqZWN0KHRyYW5zbGF0aW9uVGFibGUpKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgdGhpcy50cmFuc2xhdGlvbnMgPSB0cmFuc2xhdGlvbnM7XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlciNjbG9ha0NsYXNzTmFtZVxuICAgKiBAbWV0aG9kT2YgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlUHJvdmlkZXJcbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqXG4gICAqIExldCdzIHlvdSBjaGFuZ2UgdGhlIGNsYXNzIG5hbWUgZm9yIGB0cmFuc2xhdGUtY2xvYWtgIGRpcmVjdGl2ZS5cbiAgICogRGVmYXVsdCBjbGFzcyBuYW1lIGlzIGB0cmFuc2xhdGUtY2xvYWtgLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSB0cmFuc2xhdGUtY2xvYWsgY2xhc3MgbmFtZVxuICAgKi9cbiAgdGhpcy5jbG9ha0NsYXNzTmFtZSA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgaWYgKCFuYW1lKSB7XG4gICAgICByZXR1cm4gJGNsb2FrQ2xhc3NOYW1lO1xuICAgIH1cbiAgICAkY2xvYWtDbGFzc05hbWUgPSBuYW1lO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAbmFtZSBmbGF0T2JqZWN0XG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBGbGF0cyBhbiBvYmplY3QuIFRoaXMgZnVuY3Rpb24gaXMgdXNlZCB0byBmbGF0dGVuIGdpdmVuIHRyYW5zbGF0aW9uIGRhdGEgd2l0aFxuICAgKiBuYW1lc3BhY2VzLCBzbyB0aGV5IGFyZSBsYXRlciBhY2Nlc3NpYmxlIHZpYSBkb3Qgbm90YXRpb24uXG4gICAqL1xuICB2YXIgZmxhdE9iamVjdCA9IGZ1bmN0aW9uIChkYXRhLCBwYXRoLCByZXN1bHQsIHByZXZLZXkpIHtcbiAgICB2YXIga2V5LCBrZXlXaXRoUGF0aCwga2V5V2l0aFNob3J0UGF0aCwgdmFsO1xuXG4gICAgaWYgKCFwYXRoKSB7XG4gICAgICBwYXRoID0gW107XG4gICAgfVxuICAgIGlmICghcmVzdWx0KSB7XG4gICAgICByZXN1bHQgPSB7fTtcbiAgICB9XG4gICAgZm9yIChrZXkgaW4gZGF0YSkge1xuICAgICAgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZGF0YSwga2V5KSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHZhbCA9IGRhdGFba2V5XTtcbiAgICAgIGlmIChhbmd1bGFyLmlzT2JqZWN0KHZhbCkpIHtcbiAgICAgICAgZmxhdE9iamVjdCh2YWwsIHBhdGguY29uY2F0KGtleSksIHJlc3VsdCwga2V5KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGtleVdpdGhQYXRoID0gcGF0aC5sZW5ndGggPyAoJycgKyBwYXRoLmpvaW4oTkVTVEVEX09CSkVDVF9ERUxJTUlURVIpICsgTkVTVEVEX09CSkVDVF9ERUxJTUlURVIgKyBrZXkpIDoga2V5O1xuICAgICAgICBpZihwYXRoLmxlbmd0aCAmJiBrZXkgPT09IHByZXZLZXkpe1xuICAgICAgICAgIC8vIENyZWF0ZSBzaG9ydGN1dCBwYXRoIChmb28uYmFyID09IGZvby5iYXIuYmFyKVxuICAgICAgICAgIGtleVdpdGhTaG9ydFBhdGggPSAnJyArIHBhdGguam9pbihORVNURURfT0JKRUNUX0RFTElNSVRFUik7XG4gICAgICAgICAgLy8gTGluayBpdCB0byBvcmlnaW5hbCBwYXRoXG4gICAgICAgICAgcmVzdWx0W2tleVdpdGhTaG9ydFBhdGhdID0gJ0A6JyArIGtleVdpdGhQYXRoO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdFtrZXlXaXRoUGF0aF0gPSB2YWw7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlciNhZGRJbnRlcnBvbGF0aW9uXG4gICAqIEBtZXRob2RPZiBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlclxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogQWRkcyBpbnRlcnBvbGF0aW9uIHNlcnZpY2VzIHRvIGFuZ3VsYXItdHJhbnNsYXRlLCBzbyBpdCBjYW4gbWFuYWdlIHRoZW0uXG4gICAqXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBmYWN0b3J5IEludGVycG9sYXRpb24gc2VydmljZSBmYWN0b3J5XG4gICAqL1xuICB0aGlzLmFkZEludGVycG9sYXRpb24gPSBmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgICRpbnRlcnBvbGF0b3JGYWN0b3JpZXMucHVzaChmYWN0b3J5KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAqIEBuYW1lIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVByb3ZpZGVyI3VzZU1lc3NhZ2VGb3JtYXRJbnRlcnBvbGF0aW9uXG4gICAqIEBtZXRob2RPZiBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlclxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogVGVsbHMgYW5ndWxhci10cmFuc2xhdGUgdG8gdXNlIGludGVycG9sYXRpb24gZnVuY3Rpb25hbGl0eSBvZiBtZXNzYWdlZm9ybWF0LmpzLlxuICAgKiBUaGlzIGlzIHVzZWZ1bCB3aGVuIGhhdmluZyBoaWdoIGxldmVsIHBsdXJhbGl6YXRpb24gYW5kIGdlbmRlciBzZWxlY3Rpb24uXG4gICAqL1xuICB0aGlzLnVzZU1lc3NhZ2VGb3JtYXRJbnRlcnBvbGF0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnVzZUludGVycG9sYXRpb24oJyR0cmFuc2xhdGVNZXNzYWdlRm9ybWF0SW50ZXJwb2xhdGlvbicpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICogQG5hbWUgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlUHJvdmlkZXIjdXNlSW50ZXJwb2xhdGlvblxuICAgKiBAbWV0aG9kT2YgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlUHJvdmlkZXJcbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFRlbGxzIGFuZ3VsYXItdHJhbnNsYXRlIHdoaWNoIGludGVycG9sYXRpb24gc3R5bGUgdG8gdXNlIGFzIGRlZmF1bHQsIGFwcGxpY2F0aW9uLXdpZGUuXG4gICAqIFNpbXBseSBwYXNzIGEgZmFjdG9yeS9zZXJ2aWNlIG5hbWUuIFRoZSBpbnRlcnBvbGF0aW9uIHNlcnZpY2UgaGFzIHRvIGltcGxlbWVudFxuICAgKiB0aGUgY29ycmVjdCBpbnRlcmZhY2UuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmYWN0b3J5IEludGVycG9sYXRpb24gc2VydmljZSBuYW1lLlxuICAgKi9cbiAgdGhpcy51c2VJbnRlcnBvbGF0aW9uID0gZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICAkaW50ZXJwb2xhdGlvbkZhY3RvcnkgPSBmYWN0b3J5O1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICogQG5hbWUgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlUHJvdmlkZXIjdXNlU2FuaXRpemVTdHJhdGVneVxuICAgKiBAbWV0aG9kT2YgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlUHJvdmlkZXJcbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFNpbXBseSBzZXRzIGEgc2FuaXRhdGlvbiBzdHJhdGVneSB0eXBlLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWUgU3RyYXRlZ3kgdHlwZS5cbiAgICovXG4gIHRoaXMudXNlU2FuaXRpemVWYWx1ZVN0cmF0ZWd5ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgJGludGVycG9sYXRpb25TYW5pdGl6YXRpb25TdHJhdGVneSA9IHZhbHVlO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlciNwcmVmZXJyZWRMYW5ndWFnZVxuICAgKiBAbWV0aG9kT2YgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlUHJvdmlkZXJcbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFRlbGxzIHRoZSBtb2R1bGUgd2hpY2ggb2YgdGhlIHJlZ2lzdGVyZWQgdHJhbnNsYXRpb24gdGFibGVzIHRvIHVzZSBmb3IgdHJhbnNsYXRpb25cbiAgICogYXQgaW5pdGlhbCBzdGFydHVwIGJ5IHBhc3NpbmcgYSBsYW5ndWFnZSBrZXkuIFNpbWlsYXIgdG8gYCR0cmFuc2xhdGVQcm92aWRlciN1c2VgXG4gICAqIG9ubHkgdGhhdCBpdCBzYXlzIHdoaWNoIGxhbmd1YWdlIHRvICoqcHJlZmVyKiouXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBsYW5nS2V5IEEgbGFuZ3VhZ2Uga2V5LlxuICAgKlxuICAgKi9cbiAgdGhpcy5wcmVmZXJyZWRMYW5ndWFnZSA9IGZ1bmN0aW9uKGxhbmdLZXkpIHtcbiAgICBzZXR1cFByZWZlcnJlZExhbmd1YWdlKGxhbmdLZXkpO1xuICAgIHJldHVybiB0aGlzO1xuXG4gIH07XG4gIHZhciBzZXR1cFByZWZlcnJlZExhbmd1YWdlID0gZnVuY3Rpb24gKGxhbmdLZXkpIHtcbiAgICBpZiAobGFuZ0tleSkge1xuICAgICAgJHByZWZlcnJlZExhbmd1YWdlID0gbGFuZ0tleTtcbiAgICB9XG4gICAgcmV0dXJuICRwcmVmZXJyZWRMYW5ndWFnZTtcbiAgfTtcbiAgLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlciN0cmFuc2xhdGlvbk5vdEZvdW5kSW5kaWNhdG9yXG4gICAqIEBtZXRob2RPZiBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlclxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogU2V0cyBhbiBpbmRpY2F0b3Igd2hpY2ggaXMgdXNlZCB3aGVuIGEgdHJhbnNsYXRpb24gaXNuJ3QgZm91bmQuIEUuZy4gd2hlblxuICAgKiBzZXR0aW5nIHRoZSBpbmRpY2F0b3IgYXMgJ1gnIGFuZCBvbmUgdHJpZXMgdG8gdHJhbnNsYXRlIGEgdHJhbnNsYXRpb24gaWRcbiAgICogY2FsbGVkIGBOT1RfRk9VTkRgLCB0aGlzIHdpbGwgcmVzdWx0IGluIGBYIE5PVF9GT1VORCBYYC5cbiAgICpcbiAgICogSW50ZXJuYWxseSB0aGlzIG1ldGhvZHMgc2V0cyBhIGxlZnQgaW5kaWNhdG9yIGFuZCBhIHJpZ2h0IGluZGljYXRvciB1c2luZ1xuICAgKiBgJHRyYW5zbGF0ZVByb3ZpZGVyLnRyYW5zbGF0aW9uTm90Rm91bmRJbmRpY2F0b3JMZWZ0KClgIGFuZFxuICAgKiBgJHRyYW5zbGF0ZVByb3ZpZGVyLnRyYW5zbGF0aW9uTm90Rm91bmRJbmRpY2F0b3JSaWdodCgpYC5cbiAgICpcbiAgICogKipOb3RlKio6IFRoZXNlIG1ldGhvZHMgYXV0b21hdGljYWxseSBhZGQgYSB3aGl0ZXNwYWNlIGJldHdlZW4gdGhlIGluZGljYXRvcnNcbiAgICogYW5kIHRoZSB0cmFuc2xhdGlvbiBpZC5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGluZGljYXRvciBBbiBpbmRpY2F0b3IsIGNvdWxkIGJlIGFueSBzdHJpbmcuXG4gICAqL1xuICB0aGlzLnRyYW5zbGF0aW9uTm90Rm91bmRJbmRpY2F0b3IgPSBmdW5jdGlvbiAoaW5kaWNhdG9yKSB7XG4gICAgdGhpcy50cmFuc2xhdGlvbk5vdEZvdW5kSW5kaWNhdG9yTGVmdChpbmRpY2F0b3IpO1xuICAgIHRoaXMudHJhbnNsYXRpb25Ob3RGb3VuZEluZGljYXRvclJpZ2h0KGluZGljYXRvcik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIG5nZG9jIGZ1bmN0aW9uXG4gICAqIEBuYW1lIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVByb3ZpZGVyI3RyYW5zbGF0aW9uTm90Rm91bmRJbmRpY2F0b3JMZWZ0XG4gICAqIEBtZXRob2RPZiBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlclxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogU2V0cyBhbiBpbmRpY2F0b3Igd2hpY2ggaXMgdXNlZCB3aGVuIGEgdHJhbnNsYXRpb24gaXNuJ3QgZm91bmQgbGVmdCB0byB0aGVcbiAgICogdHJhbnNsYXRpb24gaWQuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBpbmRpY2F0b3IgQW4gaW5kaWNhdG9yLlxuICAgKi9cbiAgdGhpcy50cmFuc2xhdGlvbk5vdEZvdW5kSW5kaWNhdG9yTGVmdCA9IGZ1bmN0aW9uIChpbmRpY2F0b3IpIHtcbiAgICBpZiAoIWluZGljYXRvcikge1xuICAgICAgcmV0dXJuICRub3RGb3VuZEluZGljYXRvckxlZnQ7XG4gICAgfVxuICAgICRub3RGb3VuZEluZGljYXRvckxlZnQgPSBpbmRpY2F0b3I7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIG5nZG9jIGZ1bmN0aW9uXG4gICAqIEBuYW1lIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVByb3ZpZGVyI3RyYW5zbGF0aW9uTm90Rm91bmRJbmRpY2F0b3JMZWZ0XG4gICAqIEBtZXRob2RPZiBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlclxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogU2V0cyBhbiBpbmRpY2F0b3Igd2hpY2ggaXMgdXNlZCB3aGVuIGEgdHJhbnNsYXRpb24gaXNuJ3QgZm91bmQgcmlnaHQgdG8gdGhlXG4gICAqIHRyYW5zbGF0aW9uIGlkLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gaW5kaWNhdG9yIEFuIGluZGljYXRvci5cbiAgICovXG4gIHRoaXMudHJhbnNsYXRpb25Ob3RGb3VuZEluZGljYXRvclJpZ2h0ID0gZnVuY3Rpb24gKGluZGljYXRvcikge1xuICAgIGlmICghaW5kaWNhdG9yKSB7XG4gICAgICByZXR1cm4gJG5vdEZvdW5kSW5kaWNhdG9yUmlnaHQ7XG4gICAgfVxuICAgICRub3RGb3VuZEluZGljYXRvclJpZ2h0ID0gaW5kaWNhdG9yO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICogQG5hbWUgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlUHJvdmlkZXIjZmFsbGJhY2tMYW5ndWFnZVxuICAgKiBAbWV0aG9kT2YgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlUHJvdmlkZXJcbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFRlbGxzIHRoZSBtb2R1bGUgd2hpY2ggb2YgdGhlIHJlZ2lzdGVyZWQgdHJhbnNsYXRpb24gdGFibGVzIHRvIHVzZSB3aGVuIG1pc3NpbmcgdHJhbnNsYXRpb25zXG4gICAqIGF0IGluaXRpYWwgc3RhcnR1cCBieSBwYXNzaW5nIGEgbGFuZ3VhZ2Uga2V5LiBTaW1pbGFyIHRvIGAkdHJhbnNsYXRlUHJvdmlkZXIjdXNlYFxuICAgKiBvbmx5IHRoYXQgaXQgc2F5cyB3aGljaCBsYW5ndWFnZSB0byAqKmZhbGxiYWNrKiouXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfHxhcnJheX0gbGFuZ0tleSBBIGxhbmd1YWdlIGtleS5cbiAgICpcbiAgICovXG4gIHRoaXMuZmFsbGJhY2tMYW5ndWFnZSA9IGZ1bmN0aW9uIChsYW5nS2V5KSB7XG4gICAgZmFsbGJhY2tTdGFjayhsYW5nS2V5KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICB2YXIgZmFsbGJhY2tTdGFjayA9IGZ1bmN0aW9uIChsYW5nS2V5KSB7XG4gICAgaWYgKGxhbmdLZXkpIHtcbiAgICAgIGlmIChhbmd1bGFyLmlzU3RyaW5nKGxhbmdLZXkpKSB7XG4gICAgICAgICRmYWxsYmFja1dhc1N0cmluZyA9IHRydWU7XG4gICAgICAgICRmYWxsYmFja0xhbmd1YWdlID0gWyBsYW5nS2V5IF07XG4gICAgICB9IGVsc2UgaWYgKGFuZ3VsYXIuaXNBcnJheShsYW5nS2V5KSkge1xuICAgICAgICAkZmFsbGJhY2tXYXNTdHJpbmcgPSBmYWxzZTtcbiAgICAgICAgJGZhbGxiYWNrTGFuZ3VhZ2UgPSBsYW5nS2V5O1xuICAgICAgfVxuICAgICAgaWYgKGFuZ3VsYXIuaXNTdHJpbmcoJHByZWZlcnJlZExhbmd1YWdlKSAgJiYgaW5kZXhPZigkZmFsbGJhY2tMYW5ndWFnZSwgJHByZWZlcnJlZExhbmd1YWdlKSA8IDApIHtcbiAgICAgICAgJGZhbGxiYWNrTGFuZ3VhZ2UucHVzaCgkcHJlZmVycmVkTGFuZ3VhZ2UpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCRmYWxsYmFja1dhc1N0cmluZykge1xuICAgICAgICByZXR1cm4gJGZhbGxiYWNrTGFuZ3VhZ2VbMF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gJGZhbGxiYWNrTGFuZ3VhZ2U7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICogQG5hbWUgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlUHJvdmlkZXIjdXNlXG4gICAqIEBtZXRob2RPZiBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlclxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogU2V0IHdoaWNoIHRyYW5zbGF0aW9uIHRhYmxlIHRvIHVzZSBmb3IgdHJhbnNsYXRpb24gYnkgZ2l2ZW4gbGFuZ3VhZ2Uga2V5LiBXaGVuXG4gICAqIHRyeWluZyB0byAndXNlJyBhIGxhbmd1YWdlIHdoaWNoIGlzbid0IHByb3ZpZGVkLCBpdCdsbCB0aHJvdyBhbiBlcnJvci5cbiAgICpcbiAgICogWW91IGFjdHVhbGx5IGRvbid0IGhhdmUgdG8gdXNlIHRoaXMgbWV0aG9kIHNpbmNlIGAkdHJhbnNsYXRlUHJvdmlkZXIjcHJlZmVycmVkTGFuZ3VhZ2VgXG4gICAqIGRvZXMgdGhlIGpvYiB0b28uXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBsYW5nS2V5IEEgbGFuZ3VhZ2Uga2V5LlxuICAgKi9cbiAgdGhpcy51c2UgPSBmdW5jdGlvbiAobGFuZ0tleSkge1xuICAgIGlmIChsYW5nS2V5KSB7XG4gICAgICBpZiAoISR0cmFuc2xhdGlvblRhYmxlW2xhbmdLZXldICYmICghJGxvYWRlckZhY3RvcnkpKSB7XG4gICAgICAgIC8vIG9ubHkgdGhyb3cgYW4gZXJyb3IsIHdoZW4gbm90IGxvYWRpbmcgdHJhbnNsYXRpb24gZGF0YSBhc3luY2hyb25vdXNseVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCIkdHJhbnNsYXRlUHJvdmlkZXIgY291bGRuJ3QgZmluZCB0cmFuc2xhdGlvblRhYmxlIGZvciBsYW5nS2V5OiAnXCIgKyBsYW5nS2V5ICsgXCInXCIpO1xuICAgICAgfVxuICAgICAgJHVzZXMgPSBsYW5nS2V5O1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHJldHVybiAkdXNlcztcbiAgfTtcblxuIC8qKlxuICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICogQG5hbWUgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlUHJvdmlkZXIjc3RvcmFnZUtleVxuICAgKiBAbWV0aG9kT2YgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlUHJvdmlkZXJcbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFRlbGxzIHRoZSBtb2R1bGUgd2hpY2gga2V5IG11c3QgcmVwcmVzZW50IHRoZSBjaG9vc2VkIGxhbmd1YWdlIGJ5IGEgdXNlciBpbiB0aGUgc3RvcmFnZS5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGtleSBBIGtleSBmb3IgdGhlIHN0b3JhZ2UuXG4gICAqL1xuICB2YXIgc3RvcmFnZUtleSA9IGZ1bmN0aW9uKGtleSkge1xuICAgIGlmICgha2V5KSB7XG4gICAgICBpZiAoJHN0b3JhZ2VQcmVmaXgpIHtcbiAgICAgICAgcmV0dXJuICRzdG9yYWdlUHJlZml4ICsgJHN0b3JhZ2VLZXk7XG4gICAgICB9XG4gICAgICByZXR1cm4gJHN0b3JhZ2VLZXk7XG4gICAgfVxuICAgICRzdG9yYWdlS2V5ID0ga2V5O1xuICB9O1xuXG4gIHRoaXMuc3RvcmFnZUtleSA9IHN0b3JhZ2VLZXk7XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlciN1c2VVcmxMb2FkZXJcbiAgICogQG1ldGhvZE9mIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVByb3ZpZGVyXG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBUZWxscyBhbmd1bGFyLXRyYW5zbGF0ZSB0byB1c2UgYCR0cmFuc2xhdGVVcmxMb2FkZXJgIGV4dGVuc2lvbiBzZXJ2aWNlIGFzIGxvYWRlci5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVybCBVcmxcbiAgICogQHBhcmFtIHtPYmplY3Q9fSBvcHRpb25zIE9wdGlvbmFsIGNvbmZpZ3VyYXRpb24gb2JqZWN0XG4gICAqL1xuICB0aGlzLnVzZVVybExvYWRlciA9IGZ1bmN0aW9uICh1cmwsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gdGhpcy51c2VMb2FkZXIoJyR0cmFuc2xhdGVVcmxMb2FkZXInLCBhbmd1bGFyLmV4dGVuZCh7IHVybDogdXJsIH0sIG9wdGlvbnMpKTtcbiAgfTtcblxuICAvKipcbiAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAqIEBuYW1lIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVByb3ZpZGVyI3VzZVN0YXRpY0ZpbGVzTG9hZGVyXG4gICAqIEBtZXRob2RPZiBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlclxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogVGVsbHMgYW5ndWxhci10cmFuc2xhdGUgdG8gdXNlIGAkdHJhbnNsYXRlU3RhdGljRmlsZXNMb2FkZXJgIGV4dGVuc2lvbiBzZXJ2aWNlIGFzIGxvYWRlci5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3Q9fSBvcHRpb25zIE9wdGlvbmFsIGNvbmZpZ3VyYXRpb24gb2JqZWN0XG4gICAqL1xuICB0aGlzLnVzZVN0YXRpY0ZpbGVzTG9hZGVyID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gdGhpcy51c2VMb2FkZXIoJyR0cmFuc2xhdGVTdGF0aWNGaWxlc0xvYWRlcicsIG9wdGlvbnMpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICogQG5hbWUgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlUHJvdmlkZXIjdXNlTG9hZGVyXG4gICAqIEBtZXRob2RPZiBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlclxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogVGVsbHMgYW5ndWxhci10cmFuc2xhdGUgdG8gdXNlIGFueSBvdGhlciBzZXJ2aWNlIGFzIGxvYWRlci5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGxvYWRlckZhY3RvcnkgRmFjdG9yeSBuYW1lIHRvIHVzZVxuICAgKiBAcGFyYW0ge09iamVjdD19IG9wdGlvbnMgT3B0aW9uYWwgY29uZmlndXJhdGlvbiBvYmplY3RcbiAgICovXG4gIHRoaXMudXNlTG9hZGVyID0gZnVuY3Rpb24gKGxvYWRlckZhY3RvcnksIG9wdGlvbnMpIHtcbiAgICAkbG9hZGVyRmFjdG9yeSA9IGxvYWRlckZhY3Rvcnk7XG4gICAgJGxvYWRlck9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICogQG5hbWUgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlUHJvdmlkZXIjdXNlTG9jYWxTdG9yYWdlXG4gICAqIEBtZXRob2RPZiBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlclxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogVGVsbHMgYW5ndWxhci10cmFuc2xhdGUgdG8gdXNlIGAkdHJhbnNsYXRlTG9jYWxTdG9yYWdlYCBzZXJ2aWNlIGFzIHN0b3JhZ2UgbGF5ZXIuXG4gICAqXG4gICAqL1xuICB0aGlzLnVzZUxvY2FsU3RvcmFnZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy51c2VTdG9yYWdlKCckdHJhbnNsYXRlTG9jYWxTdG9yYWdlJyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlciN1c2VDb29raWVTdG9yYWdlXG4gICAqIEBtZXRob2RPZiBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlclxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogVGVsbHMgYW5ndWxhci10cmFuc2xhdGUgdG8gdXNlIGAkdHJhbnNsYXRlQ29va2llU3RvcmFnZWAgc2VydmljZSBhcyBzdG9yYWdlIGxheWVyLlxuICAgKi9cbiAgdGhpcy51c2VDb29raWVTdG9yYWdlID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnVzZVN0b3JhZ2UoJyR0cmFuc2xhdGVDb29raWVTdG9yYWdlJyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlciN1c2VTdG9yYWdlXG4gICAqIEBtZXRob2RPZiBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlclxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogVGVsbHMgYW5ndWxhci10cmFuc2xhdGUgdG8gdXNlIGN1c3RvbSBzZXJ2aWNlIGFzIHN0b3JhZ2UgbGF5ZXIuXG4gICAqL1xuICB0aGlzLnVzZVN0b3JhZ2UgPSBmdW5jdGlvbiAoc3RvcmFnZUZhY3RvcnkpIHtcbiAgICAkc3RvcmFnZUZhY3RvcnkgPSBzdG9yYWdlRmFjdG9yeTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAqIEBuYW1lIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVByb3ZpZGVyI3N0b3JhZ2VQcmVmaXhcbiAgICogQG1ldGhvZE9mIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVByb3ZpZGVyXG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBTZXRzIHByZWZpeCBmb3Igc3RvcmFnZSBrZXkuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwcmVmaXggU3RvcmFnZSBrZXkgcHJlZml4XG4gICAqL1xuICB0aGlzLnN0b3JhZ2VQcmVmaXggPSBmdW5jdGlvbiAocHJlZml4KSB7XG4gICAgaWYgKCFwcmVmaXgpIHtcbiAgICAgIHJldHVybiBwcmVmaXg7XG4gICAgfVxuICAgICRzdG9yYWdlUHJlZml4ID0gcHJlZml4O1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICogQG5hbWUgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlUHJvdmlkZXIjdXNlTWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlckxvZ1xuICAgKiBAbWV0aG9kT2YgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlUHJvdmlkZXJcbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFRlbGxzIGFuZ3VsYXItdHJhbnNsYXRlIHRvIHVzZSBidWlsdC1pbiBsb2cgaGFuZGxlciB3aGVuIHRyeWluZyB0byB0cmFuc2xhdGVcbiAgICogYSB0cmFuc2xhdGlvbiBJZCB3aGljaCBkb2Vzbid0IGV4aXN0LlxuICAgKlxuICAgKiBUaGlzIGlzIGFjdHVhbGx5IGEgc2hvcnRjdXQgbWV0aG9kIGZvciBgdXNlTWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlcigpYC5cbiAgICpcbiAgICovXG4gIHRoaXMudXNlTWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlckxvZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy51c2VNaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyKCckdHJhbnNsYXRlTWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlckxvZycpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICogQG5hbWUgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlUHJvdmlkZXIjdXNlTWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlclxuICAgKiBAbWV0aG9kT2YgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlUHJvdmlkZXJcbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIEV4cGVjdHMgYSBmYWN0b3J5IG5hbWUgd2hpY2ggbGF0ZXIgZ2V0cyBpbnN0YW50aWF0ZWQgd2l0aCBgJGluamVjdG9yYC5cbiAgICogVGhpcyBtZXRob2QgY2FuIGJlIHVzZWQgdG8gdGVsbCBhbmd1bGFyLXRyYW5zbGF0ZSB0byB1c2UgYSBjdXN0b21cbiAgICogbWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlci4gSnVzdCBidWlsZCBhIGZhY3Rvcnkgd2hpY2ggcmV0dXJucyBhIGZ1bmN0aW9uXG4gICAqIGFuZCBleHBlY3RzIGEgdHJhbnNsYXRpb24gaWQgYXMgYXJndW1lbnQuXG4gICAqXG4gICAqIEV4YW1wbGU6XG4gICAqIDxwcmU+XG4gICAqICBhcHAuY29uZmlnKGZ1bmN0aW9uICgkdHJhbnNsYXRlUHJvdmlkZXIpIHtcbiAgICogICAgJHRyYW5zbGF0ZVByb3ZpZGVyLnVzZU1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXIoJ2N1c3RvbUhhbmRsZXInKTtcbiAgICogIH0pO1xuICAgKlxuICAgKiAgYXBwLmZhY3RvcnkoJ2N1c3RvbUhhbmRsZXInLCBmdW5jdGlvbiAoZGVwMSwgZGVwMikge1xuICAgKiAgICByZXR1cm4gZnVuY3Rpb24gKHRyYW5zbGF0aW9uSWQpIHtcbiAgICogICAgICAvLyBzb21ldGhpbmcgd2l0aCB0cmFuc2xhdGlvbklkIGFuZCBkZXAxIGFuZCBkZXAyXG4gICAqICAgIH07XG4gICAqICB9KTtcbiAgICogPC9wcmU+XG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmYWN0b3J5IEZhY3RvcnkgbmFtZVxuICAgKi9cbiAgdGhpcy51c2VNaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyID0gZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICAkbWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlckZhY3RvcnkgPSBmYWN0b3J5O1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICogQG5hbWUgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlUHJvdmlkZXIjdXNlUG9zdENvbXBpbGluZ1xuICAgKiBAbWV0aG9kT2YgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlUHJvdmlkZXJcbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIElmIHBvc3QgY29tcGlsaW5nIGlzIGVuYWJsZWQsIGFsbCB0cmFuc2xhdGVkIHZhbHVlcyB3aWxsIGJlIHByb2Nlc3NlZFxuICAgKiBhZ2FpbiB3aXRoIEFuZ3VsYXJKUycgJGNvbXBpbGUuXG4gICAqXG4gICAqIEV4YW1wbGU6XG4gICAqIDxwcmU+XG4gICAqICBhcHAuY29uZmlnKGZ1bmN0aW9uICgkdHJhbnNsYXRlUHJvdmlkZXIpIHtcbiAgICogICAgJHRyYW5zbGF0ZVByb3ZpZGVyLnVzZVBvc3RDb21waWxpbmcodHJ1ZSk7XG4gICAqICB9KTtcbiAgICogPC9wcmU+XG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmYWN0b3J5IEZhY3RvcnkgbmFtZVxuICAgKi9cbiAgdGhpcy51c2VQb3N0Q29tcGlsaW5nID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgJHBvc3RDb21waWxpbmdFbmFibGVkID0gISghdmFsdWUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICogQG5hbWUgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlUHJvdmlkZXIjZGV0ZXJtaW5lUHJlZmVycmVkTGFuZ3VhZ2VcbiAgICogQG1ldGhvZE9mIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVByb3ZpZGVyXG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBUZWxscyBhbmd1bGFyLXRyYW5zbGF0ZSB0byB0cnkgdG8gZGV0ZXJtaW5lIG9uIGl0cyBvd24gd2hpY2ggbGFuZ3VhZ2Uga2V5XG4gICAqIHRvIHNldCBhcyBwcmVmZXJyZWQgbGFuZ3VhZ2UuIFdoZW4gYGZuYCBpcyBnaXZlbiwgYW5ndWxhci10cmFuc2xhdGUgdXNlcyBpdFxuICAgKiB0byBkZXRlcm1pbmUgYSBsYW5ndWFnZSBrZXksIG90aGVyd2lzZSBpdCB1c2VzIHRoZSBidWlsdC1pbiBgZ2V0TG9jYWxlKClgXG4gICAqIG1ldGhvZC5cbiAgICpcbiAgICogVGhlIGBnZXRMb2NhbGUoKWAgcmV0dXJucyBhIGxhbmd1YWdlIGtleSBpbiB0aGUgZm9ybWF0IGBbbGFuZ11fW2NvdW50cnldYCBvclxuICAgKiBgW2xhbmddYCBkZXBlbmRpbmcgb24gd2hhdCB0aGUgYnJvd3NlciBwcm92aWRlcy5cbiAgICpcbiAgICogVXNlIHRoaXMgbWV0aG9kIGF0IHlvdXIgb3duIHJpc2ssIHNpbmNlIG5vdCBhbGwgYnJvd3NlcnMgcmV0dXJuIGEgdmFsaWRcbiAgICogbG9jYWxlLlxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdD19IGZuIEZ1bmN0aW9uIHRvIGRldGVybWluZSBhIGJyb3dzZXIncyBsb2NhbGVcbiAgICovXG4gIHRoaXMuZGV0ZXJtaW5lUHJlZmVycmVkTGFuZ3VhZ2UgPSBmdW5jdGlvbiAoZm4pIHtcblxuICAgIHZhciBsb2NhbGUgPSAoZm4gJiYgYW5ndWxhci5pc0Z1bmN0aW9uKGZuKSkgPyBmbigpIDogZ2V0TG9jYWxlKCk7XG5cbiAgICBpZiAoISRhdmFpbGFibGVMYW5ndWFnZUtleXMubGVuZ3RoKSB7XG4gICAgICAkcHJlZmVycmVkTGFuZ3VhZ2UgPSBsb2NhbGU7XG4gICAgfSBlbHNlIHtcbiAgICAgICRwcmVmZXJyZWRMYW5ndWFnZSA9IG5lZ290aWF0ZUxvY2FsZShsb2NhbGUpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICogQG5hbWUgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlUHJvdmlkZXIjcmVnaXN0ZXJBdmFpbGFibGVMYW5ndWFnZUtleXNcbiAgICogQG1ldGhvZE9mIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVByb3ZpZGVyXG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBSZWdpc3RlcnMgYSBzZXQgb2YgbGFuZ3VhZ2Uga2V5cyB0aGUgYXBwIHdpbGwgd29yayB3aXRoLiBVc2UgdGhpcyBtZXRob2QgaW5cbiAgICogY29tYmluYXRpb24gd2l0aFxuICAgKiB7QGxpbmsgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlUHJvdmlkZXIjZGV0ZXJtaW5lUHJlZmVycmVkTGFuZ3VhZ2UgZGV0ZXJtaW5lUHJlZmVycmVkTGFuZ3VhZ2V9LlxuICAgKiBXaGVuIGF2YWlsYWJsZSBsYW5ndWFnZXMga2V5cyBhcmUgcmVnaXN0ZXJlZCwgYW5ndWxhci10cmFuc2xhdGVcbiAgICogdHJpZXMgdG8gZmluZCB0aGUgYmVzdCBmaXR0aW5nIGxhbmd1YWdlIGtleSBkZXBlbmRpbmcgb24gdGhlIGJyb3dzZXJzIGxvY2FsZSxcbiAgICogY29uc2lkZXJpbmcgeW91ciBsYW5ndWFnZSBrZXkgY29udmVudGlvbi5cbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3R9IGxhbmd1YWdlS2V5cyBBcnJheSBvZiBsYW5ndWFnZSBrZXlzIHRoZSB5b3VyIGFwcCB3aWxsIHVzZVxuICAgKiBAcGFyYW0ge29iamVjdD19IGFsaWFzZXMgQWxpYXMgbWFwLlxuICAgKi9cbiAgdGhpcy5yZWdpc3RlckF2YWlsYWJsZUxhbmd1YWdlS2V5cyA9IGZ1bmN0aW9uIChsYW5ndWFnZUtleXMsIGFsaWFzZXMpIHtcbiAgICBpZiAobGFuZ3VhZ2VLZXlzKSB7XG4gICAgICAkYXZhaWxhYmxlTGFuZ3VhZ2VLZXlzID0gbGFuZ3VhZ2VLZXlzO1xuICAgICAgaWYgKGFsaWFzZXMpIHtcbiAgICAgICAgJGxhbmd1YWdlS2V5QWxpYXNlcyA9IGFsaWFzZXM7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgcmV0dXJuICRhdmFpbGFibGVMYW5ndWFnZUtleXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlciN1c2VMb2FkZXJDYWNoZVxuICAgKiBAbWV0aG9kT2YgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlUHJvdmlkZXJcbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFJlZ2lzdGVycyBhIGNhY2hlIGZvciBpbnRlcm5hbCAkaHR0cCBiYXNlZCBsb2FkZXJzLlxuICAgKiB7QGxpbmsgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlUHJvdmlkZXIjZGV0ZXJtaW5lUHJlZmVycmVkTGFuZ3VhZ2UgZGV0ZXJtaW5lUHJlZmVycmVkTGFuZ3VhZ2V9LlxuICAgKiBXaGVuIGZhbHNlIHRoZSBjYWNoZSB3aWxsIGJlIGRpc2FibGVkIChkZWZhdWx0KS4gV2hlbiB0cnVlIG9yIHVuZGVmaW5lZFxuICAgKiB0aGUgY2FjaGUgd2lsbCBiZSBhIGRlZmF1bHQgKHNlZSAkY2FjaGVGYWN0b3J5KS4gV2hlbiBhbiBvYmplY3QgaXQgd2lsbFxuICAgKiBiZSB0cmVhdCBhcyBhIGNhY2hlIG9iamVjdCBpdHNlbGY6IHRoZSB1c2FnZSBpcyAkaHR0cCh7Y2FjaGU6IGNhY2hlfSlcbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3R9IGNhY2hlIGJvb2xlYW4sIHN0cmluZyBvciBjYWNoZS1vYmplY3RcbiAgICovXG4gIHRoaXMudXNlTG9hZGVyQ2FjaGUgPSBmdW5jdGlvbiAoY2FjaGUpIHtcbiAgICBpZiAoY2FjaGUgPT09IGZhbHNlKSB7XG4gICAgICAvLyBkaXNhYmxlIGNhY2hlXG4gICAgICBsb2FkZXJDYWNoZSA9IHVuZGVmaW5lZDtcbiAgICB9IGVsc2UgaWYgKGNhY2hlID09PSB0cnVlKSB7XG4gICAgICAvLyBlbmFibGUgY2FjaGUgdXNpbmcgQUpTIGRlZmF1bHRzXG4gICAgICBsb2FkZXJDYWNoZSA9IHRydWU7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YoY2FjaGUpID09PSAndW5kZWZpbmVkJykge1xuICAgICAgLy8gZW5hYmxlIGNhY2hlIHVzaW5nIGRlZmF1bHRcbiAgICAgIGxvYWRlckNhY2hlID0gJyR0cmFuc2xhdGlvbkNhY2hlJztcbiAgICB9IGVsc2UgaWYgKGNhY2hlKSB7XG4gICAgICAvLyBlbmFibGUgY2FjaGUgdXNpbmcgZ2l2ZW4gb25lIChzZWUgJGNhY2hlRmFjdG9yeSlcbiAgICAgIGxvYWRlckNhY2hlID0gY2FjaGU7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICogQG5hbWUgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlUHJvdmlkZXIjZGlyZWN0aXZlUHJpb3JpdHlcbiAgICogQG1ldGhvZE9mIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVByb3ZpZGVyXG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBTZXRzIHRoZSBkZWZhdWx0IHByaW9yaXR5IG9mIHRoZSB0cmFuc2xhdGUgZGlyZWN0aXZlLiBUaGUgc3RhbmRhcmQgdmFsdWUgaXMgYDBgLlxuICAgKiBDYWxsaW5nIHRoaXMgZnVuY3Rpb24gd2l0aG91dCBhbiBhcmd1bWVudCB3aWxsIHJldHVybiB0aGUgY3VycmVudCB2YWx1ZS5cbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHByaW9yaXR5IGZvciB0aGUgdHJhbnNsYXRlLWRpcmVjdGl2ZVxuICAgKi9cbiAgdGhpcy5kaXJlY3RpdmVQcmlvcml0eSA9IGZ1bmN0aW9uIChwcmlvcml0eSkge1xuICAgIGlmIChwcmlvcml0eSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBnZXR0ZXJcbiAgICAgIHJldHVybiBkaXJlY3RpdmVQcmlvcml0eTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gc2V0dGVyIHdpdGggY2hhaW5pbmdcbiAgICAgIGRpcmVjdGl2ZVByaW9yaXR5ID0gcHJpb3JpdHk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBvYmplY3RcbiAgICogQG5hbWUgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlXG4gICAqIEByZXF1aXJlcyAkaW50ZXJwb2xhdGVcbiAgICogQHJlcXVpcmVzICRsb2dcbiAgICogQHJlcXVpcmVzICRyb290U2NvcGVcbiAgICogQHJlcXVpcmVzICRxXG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBUaGUgYCR0cmFuc2xhdGVgIHNlcnZpY2UgaXMgdGhlIGFjdHVhbCBjb3JlIG9mIGFuZ3VsYXItdHJhbnNsYXRlLiBJdCBleHBlY3RzIGEgdHJhbnNsYXRpb24gaWRcbiAgICogYW5kIG9wdGlvbmFsIGludGVycG9sYXRlIHBhcmFtZXRlcnMgdG8gdHJhbnNsYXRlIGNvbnRlbnRzLlxuICAgKlxuICAgKiA8cHJlPlxuICAgKiAgJHRyYW5zbGF0ZSgnSEVBRExJTkVfVEVYVCcpLnRoZW4oZnVuY3Rpb24gKHRyYW5zbGF0aW9uKSB7XG4gICAqICAgICRzY29wZS50cmFuc2xhdGVkVGV4dCA9IHRyYW5zbGF0aW9uO1xuICAgKiAgfSk7XG4gICAqIDwvcHJlPlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ3xhcnJheX0gdHJhbnNsYXRpb25JZCBBIHRva2VuIHdoaWNoIHJlcHJlc2VudHMgYSB0cmFuc2xhdGlvbiBpZFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUaGlzIGNhbiBiZSBvcHRpb25hbGx5IGFuIGFycmF5IG9mIHRyYW5zbGF0aW9uIGlkcyB3aGljaFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzIHRoYXQgdGhlIGZ1bmN0aW9uIHJldHVybnMgYW4gb2JqZWN0IHdoZXJlIGVhY2gga2V5XG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzIHRoZSB0cmFuc2xhdGlvbiBpZCBhbmQgdGhlIHZhbHVlIHRoZSB0cmFuc2xhdGlvbi5cbiAgICogQHBhcmFtIHtvYmplY3Q9fSBpbnRlcnBvbGF0ZVBhcmFtcyBBbiBvYmplY3QgaGFzaCBmb3IgZHluYW1pYyB2YWx1ZXNcbiAgICogQHBhcmFtIHtzdHJpbmd9IGludGVycG9sYXRpb25JZCBUaGUgaWQgb2YgdGhlIGludGVycG9sYXRpb24gdG8gdXNlXG4gICAqIEByZXR1cm5zIHtvYmplY3R9IHByb21pc2VcbiAgICovXG4gIHRoaXMuJGdldCA9IFtcbiAgICAnJGxvZycsXG4gICAgJyRpbmplY3RvcicsXG4gICAgJyRyb290U2NvcGUnLFxuICAgICckcScsXG4gICAgZnVuY3Rpb24gKCRsb2csICRpbmplY3RvciwgJHJvb3RTY29wZSwgJHEpIHtcblxuICAgICAgdmFyIFN0b3JhZ2UsXG4gICAgICAgICAgZGVmYXVsdEludGVycG9sYXRvciA9ICRpbmplY3Rvci5nZXQoJGludGVycG9sYXRpb25GYWN0b3J5IHx8ICckdHJhbnNsYXRlRGVmYXVsdEludGVycG9sYXRpb24nKSxcbiAgICAgICAgICBwZW5kaW5nTG9hZGVyID0gZmFsc2UsXG4gICAgICAgICAgaW50ZXJwb2xhdG9ySGFzaE1hcCA9IHt9LFxuICAgICAgICAgIGxhbmdQcm9taXNlcyA9IHt9LFxuICAgICAgICAgIGZhbGxiYWNrSW5kZXgsXG4gICAgICAgICAgc3RhcnRGYWxsYmFja0l0ZXJhdGlvbjtcblxuICAgICAgdmFyICR0cmFuc2xhdGUgPSBmdW5jdGlvbiAodHJhbnNsYXRpb25JZCwgaW50ZXJwb2xhdGVQYXJhbXMsIGludGVycG9sYXRpb25JZCwgZGVmYXVsdFRyYW5zbGF0aW9uVGV4dCkge1xuXG4gICAgICAgIC8vIER1Y2sgZGV0ZWN0aW9uOiBJZiB0aGUgZmlyc3QgYXJndW1lbnQgaXMgYW4gYXJyYXksIGEgYnVuY2ggb2YgdHJhbnNsYXRpb25zIHdhcyByZXF1ZXN0ZWQuXG4gICAgICAgIC8vIFRoZSByZXN1bHQgaXMgYW4gb2JqZWN0LlxuICAgICAgICBpZiAoYW5ndWxhci5pc0FycmF5KHRyYW5zbGF0aW9uSWQpKSB7XG4gICAgICAgICAgLy8gSW5zcGlyZWQgYnkgUS5hbGxTZXR0bGVkIGJ5IEtyaXMgS293YWxcbiAgICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20va3Jpc2tvd2FsL3EvYmxvYi9iMGZhNzI5ODA3MTdkYzIwMmZmYzNjYmYwM2I5MzZlMTBlYmJiOWQ3L3EuanMjTDE1NTMtMTU2M1xuICAgICAgICAgIC8vIFRoaXMgdHJhbnNmb3JtcyBhbGwgcHJvbWlzZXMgcmVnYXJkbGVzcyByZXNvbHZlZCBvciByZWplY3RlZFxuICAgICAgICAgIHZhciB0cmFuc2xhdGVBbGwgPSBmdW5jdGlvbiAodHJhbnNsYXRpb25JZHMpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHRzID0ge307IC8vIHN0b3JpbmcgdGhlIGFjdHVhbCByZXN1bHRzXG4gICAgICAgICAgICB2YXIgcHJvbWlzZXMgPSBbXTsgLy8gcHJvbWlzZXMgdG8gd2FpdCBmb3JcbiAgICAgICAgICAgIC8vIFdyYXBzIHRoZSBwcm9taXNlIGEpIGJlaW5nIGFsd2F5cyByZXNvbHZlZCBhbmQgYikgc3RvcmluZyB0aGUgbGluayBpZC0+dmFsdWVcbiAgICAgICAgICAgIHZhciB0cmFuc2xhdGUgPSBmdW5jdGlvbiAodHJhbnNsYXRpb25JZCkge1xuICAgICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgICB2YXIgcmVnYXJkbGVzcyA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdHNbdHJhbnNsYXRpb25JZF0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKFt0cmFuc2xhdGlvbklkLCB2YWx1ZV0pO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAvLyB3ZSBkb24ndCBjYXJlIHdoZXRoZXIgdGhlIHByb21pc2Ugd2FzIHJlc29sdmVkIG9yIHJlamVjdGVkOyBqdXN0IHN0b3JlIHRoZSB2YWx1ZXNcbiAgICAgICAgICAgICAgJHRyYW5zbGF0ZSh0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgaW50ZXJwb2xhdGlvbklkLCBkZWZhdWx0VHJhbnNsYXRpb25UZXh0KS50aGVuKHJlZ2FyZGxlc3MsIHJlZ2FyZGxlc3MpO1xuICAgICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgYyA9IHRyYW5zbGF0aW9uSWRzLmxlbmd0aDsgaSA8IGM7IGkrKykge1xuICAgICAgICAgICAgICBwcm9taXNlcy5wdXNoKHRyYW5zbGF0ZSh0cmFuc2xhdGlvbklkc1tpXSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gd2FpdCBmb3IgYWxsIChpbmNsdWRpbmcgc3RvcmluZyB0byByZXN1bHRzKVxuICAgICAgICAgICAgcmV0dXJuICRxLmFsbChwcm9taXNlcykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgcmVzdWx0c1xuICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH07XG4gICAgICAgICAgcmV0dXJuIHRyYW5zbGF0ZUFsbCh0cmFuc2xhdGlvbklkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgICAgLy8gdHJpbSBvZmYgYW55IHdoaXRlc3BhY2VcbiAgICAgICAgaWYgKHRyYW5zbGF0aW9uSWQpIHtcbiAgICAgICAgICB0cmFuc2xhdGlvbklkID0gdHJpbS5hcHBseSh0cmFuc2xhdGlvbklkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBwcm9taXNlVG9XYWl0Rm9yID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB2YXIgcHJvbWlzZSA9ICRwcmVmZXJyZWRMYW5ndWFnZSA/XG4gICAgICAgICAgICBsYW5nUHJvbWlzZXNbJHByZWZlcnJlZExhbmd1YWdlXSA6XG4gICAgICAgICAgICBsYW5nUHJvbWlzZXNbJHVzZXNdO1xuXG4gICAgICAgICAgZmFsbGJhY2tJbmRleCA9IDA7XG5cbiAgICAgICAgICBpZiAoJHN0b3JhZ2VGYWN0b3J5ICYmICFwcm9taXNlKSB7XG4gICAgICAgICAgICAvLyBsb29rcyBsaWtlIHRoZXJlJ3Mgbm8gcGVuZGluZyBwcm9taXNlIGZvciAkcHJlZmVycmVkTGFuZ3VhZ2Ugb3JcbiAgICAgICAgICAgIC8vICR1c2VzLiBNYXliZSB0aGVyZSdzIG9uZSBwZW5kaW5nIGZvciBhIGxhbmd1YWdlIHRoYXQgY29tZXMgZnJvbVxuICAgICAgICAgICAgLy8gc3RvcmFnZS5cbiAgICAgICAgICAgIHZhciBsYW5nS2V5ID0gU3RvcmFnZS5nZXQoJHN0b3JhZ2VLZXkpO1xuICAgICAgICAgICAgcHJvbWlzZSA9IGxhbmdQcm9taXNlc1tsYW5nS2V5XTtcblxuICAgICAgICAgICAgaWYgKCRmYWxsYmFja0xhbmd1YWdlICYmICRmYWxsYmFja0xhbmd1YWdlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IGluZGV4T2YoJGZhbGxiYWNrTGFuZ3VhZ2UsIGxhbmdLZXkpO1xuICAgICAgICAgICAgICAgIC8vIG1heWJlIHRoZSBsYW5ndWFnZSBmcm9tIHN0b3JhZ2UgaXMgYWxzbyBkZWZpbmVkIGFzIGZhbGxiYWNrIGxhbmd1YWdlXG4gICAgICAgICAgICAgICAgLy8gd2UgaW5jcmVhc2UgdGhlIGZhbGxiYWNrIGxhbmd1YWdlIGluZGV4IHRvIG5vdCBzZWFyY2ggaW4gdGhhdCBsYW5ndWFnZVxuICAgICAgICAgICAgICAgIC8vIGFzIGZhbGxiYWNrLCBzaW5jZSBpdCdzIHByb2JhYmx5IHRoZSBmaXJzdCB1c2VkIGxhbmd1YWdlXG4gICAgICAgICAgICAgICAgLy8gaW4gdGhhdCBjYXNlIHRoZSBpbmRleCBzdGFydHMgYWZ0ZXIgdGhlIGZpcnN0IGVsZW1lbnRcbiAgICAgICAgICAgICAgICBmYWxsYmFja0luZGV4ID0gKGluZGV4ID09PSAwKSA/IDEgOiAwO1xuXG4gICAgICAgICAgICAgICAgLy8gYnV0IHdlIGNhbiBtYWtlIHN1cmUgdG8gQUxXQVlTIGZhbGxiYWNrIHRvIHByZWZlcnJlZCBsYW5ndWFnZSBhdCBsZWFzdFxuICAgICAgICAgICAgICAgIGlmIChpbmRleE9mKCRmYWxsYmFja0xhbmd1YWdlLCAkcHJlZmVycmVkTGFuZ3VhZ2UpIDwgMCkge1xuICAgICAgICAgICAgICAgICAgJGZhbGxiYWNrTGFuZ3VhZ2UucHVzaCgkcHJlZmVycmVkTGFuZ3VhZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICAgIH0oKSk7XG5cbiAgICAgICAgaWYgKCFwcm9taXNlVG9XYWl0Rm9yKSB7XG4gICAgICAgICAgLy8gbm8gcHJvbWlzZSB0byB3YWl0IGZvcj8gb2theS4gVGhlbiB0aGVyZSdzIG5vIGxvYWRlciByZWdpc3RlcmVkXG4gICAgICAgICAgLy8gbm9yIGlzIGEgb25lIHBlbmRpbmcgZm9yIGxhbmd1YWdlIHRoYXQgY29tZXMgZnJvbSBzdG9yYWdlLlxuICAgICAgICAgIC8vIFdlIGNhbiBqdXN0IHRyYW5zbGF0ZS5cbiAgICAgICAgICBkZXRlcm1pbmVUcmFuc2xhdGlvbih0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgaW50ZXJwb2xhdGlvbklkLCBkZWZhdWx0VHJhbnNsYXRpb25UZXh0KS50aGVuKGRlZmVycmVkLnJlc29sdmUsIGRlZmVycmVkLnJlamVjdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcHJvbWlzZVRvV2FpdEZvci50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGRldGVybWluZVRyYW5zbGF0aW9uKHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zLCBpbnRlcnBvbGF0aW9uSWQsIGRlZmF1bHRUcmFuc2xhdGlvblRleHQpLnRoZW4oZGVmZXJyZWQucmVzb2x2ZSwgZGVmZXJyZWQucmVqZWN0KTtcbiAgICAgICAgICB9LCBkZWZlcnJlZC5yZWplY3QpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgfTtcblxuICAgICAgLyoqXG4gICAgICAgKiBAbmFtZSBhcHBseU5vdEZvdW5kSW5kaWNhdG9yc1xuICAgICAgICogQHByaXZhdGVcbiAgICAgICAqXG4gICAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgICAqIEFwcGxpZXMgbm90IGZvdW50IGluZGljYXRvcnMgdG8gZ2l2ZW4gdHJhbnNsYXRpb24gaWQsIGlmIG5lZWRlZC5cbiAgICAgICAqIFRoaXMgZnVuY3Rpb24gZ2V0cyBvbmx5IGV4ZWN1dGVkLCBpZiBhIHRyYW5zbGF0aW9uIGlkIGRvZXNuJ3QgZXhpc3QsXG4gICAgICAgKiB3aGljaCBpcyB3aHkgYSB0cmFuc2xhdGlvbiBpZCBpcyBleHBlY3RlZCBhcyBhcmd1bWVudC5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHJhbnNsYXRpb25JZCBUcmFuc2xhdGlvbiBpZC5cbiAgICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFNhbWUgYXMgZ2l2ZW4gdHJhbnNsYXRpb24gaWQgYnV0IGFwcGxpZWQgd2l0aCBub3QgZm91bmRcbiAgICAgICAqIGluZGljYXRvcnMuXG4gICAgICAgKi9cbiAgICAgIHZhciBhcHBseU5vdEZvdW5kSW5kaWNhdG9ycyA9IGZ1bmN0aW9uICh0cmFuc2xhdGlvbklkKSB7XG4gICAgICAgIC8vIGFwcGx5aW5nIG5vdEZvdW5kSW5kaWNhdG9yc1xuICAgICAgICBpZiAoJG5vdEZvdW5kSW5kaWNhdG9yTGVmdCkge1xuICAgICAgICAgIHRyYW5zbGF0aW9uSWQgPSBbJG5vdEZvdW5kSW5kaWNhdG9yTGVmdCwgdHJhbnNsYXRpb25JZF0uam9pbignICcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICgkbm90Rm91bmRJbmRpY2F0b3JSaWdodCkge1xuICAgICAgICAgIHRyYW5zbGF0aW9uSWQgPSBbdHJhbnNsYXRpb25JZCwgJG5vdEZvdW5kSW5kaWNhdG9yUmlnaHRdLmpvaW4oJyAnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJhbnNsYXRpb25JZDtcbiAgICAgIH07XG5cbiAgICAgIC8qKlxuICAgICAgICogQG5hbWUgdXNlTGFuZ3VhZ2VcbiAgICAgICAqIEBwcml2YXRlXG4gICAgICAgKlxuICAgICAgICogQGRlc2NyaXB0aW9uXG4gICAgICAgKiBNYWtlcyBhY3R1YWwgdXNlIG9mIGEgbGFuZ3VhZ2UgYnkgc2V0dGluZyBhIGdpdmVuIGxhbmd1YWdlIGtleSBhcyB1c2VkXG4gICAgICAgKiBsYW5ndWFnZSBhbmQgaW5mb3JtcyByZWdpc3RlcmVkIGludGVycG9sYXRvcnMgdG8gYWxzbyB1c2UgdGhlIGdpdmVuXG4gICAgICAgKiBrZXkgYXMgbG9jYWxlLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7a2V5fSBMb2NhbGUga2V5LlxuICAgICAgICovXG4gICAgICB2YXIgdXNlTGFuZ3VhZ2UgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICR1c2VzID0ga2V5O1xuICAgICAgICAkcm9vdFNjb3BlLiRlbWl0KCckdHJhbnNsYXRlQ2hhbmdlU3VjY2VzcycsIHtsYW5ndWFnZToga2V5fSk7XG5cbiAgICAgICAgaWYgKCRzdG9yYWdlRmFjdG9yeSkge1xuICAgICAgICAgIFN0b3JhZ2UucHV0KCR0cmFuc2xhdGUuc3RvcmFnZUtleSgpLCAkdXNlcyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gaW5mb3JtIGRlZmF1bHQgaW50ZXJwb2xhdG9yXG4gICAgICAgIGRlZmF1bHRJbnRlcnBvbGF0b3Iuc2V0TG9jYWxlKCR1c2VzKTtcbiAgICAgICAgLy8gaW5mb3JtIGFsbCBvdGhlcnMgdG9vIVxuICAgICAgICBhbmd1bGFyLmZvckVhY2goaW50ZXJwb2xhdG9ySGFzaE1hcCwgZnVuY3Rpb24gKGludGVycG9sYXRvciwgaWQpIHtcbiAgICAgICAgICBpbnRlcnBvbGF0b3JIYXNoTWFwW2lkXS5zZXRMb2NhbGUoJHVzZXMpO1xuICAgICAgICB9KTtcbiAgICAgICAgJHJvb3RTY29wZS4kZW1pdCgnJHRyYW5zbGF0ZUNoYW5nZUVuZCcsIHtsYW5ndWFnZToga2V5fSk7XG4gICAgICB9O1xuXG4gICAgICAvKipcbiAgICAgICAqIEBuYW1lIGxvYWRBc3luY1xuICAgICAgICogQHByaXZhdGVcbiAgICAgICAqXG4gICAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgICAqIEtpY2tzIG9mIHJlZ2lzdGVyZWQgYXN5bmMgbG9hZGVyIHVzaW5nIGAkaW5qZWN0b3JgIGFuZCBhcHBsaWVzIGV4aXN0aW5nXG4gICAgICAgKiBsb2FkZXIgb3B0aW9ucy4gV2hlbiByZXNvbHZlZCwgaXQgdXBkYXRlcyB0cmFuc2xhdGlvbiB0YWJsZXMgYWNjb3JkaW5nbHlcbiAgICAgICAqIG9yIHJlamVjdHMgd2l0aCBnaXZlbiBsYW5ndWFnZSBrZXkuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGtleSBMYW5ndWFnZSBrZXkuXG4gICAgICAgKiBAcmV0dXJuIHtQcm9taXNlfSBBIHByb21pc2UuXG4gICAgICAgKi9cbiAgICAgIHZhciBsb2FkQXN5bmMgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIGlmICgha2V5KSB7XG4gICAgICAgICAgdGhyb3cgJ05vIGxhbmd1YWdlIGtleSBzcGVjaWZpZWQgZm9yIGxvYWRpbmcuJztcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgICAgJHJvb3RTY29wZS4kZW1pdCgnJHRyYW5zbGF0ZUxvYWRpbmdTdGFydCcsIHtsYW5ndWFnZToga2V5fSk7XG4gICAgICAgIHBlbmRpbmdMb2FkZXIgPSB0cnVlO1xuXG4gICAgICAgIHZhciBjYWNoZSA9IGxvYWRlckNhY2hlO1xuICAgICAgICBpZiAodHlwZW9mKGNhY2hlKSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAvLyBnZXR0aW5nIG9uLWRlbWFuZCBpbnN0YW5jZSBvZiBsb2FkZXJcbiAgICAgICAgICBjYWNoZSA9ICRpbmplY3Rvci5nZXQoY2FjaGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxvYWRlck9wdGlvbnMgPSBhbmd1bGFyLmV4dGVuZCh7fSwgJGxvYWRlck9wdGlvbnMsIHtcbiAgICAgICAgICBrZXk6IGtleSxcbiAgICAgICAgICAkaHR0cDogYW5ndWxhci5leHRlbmQoe30sIHtcbiAgICAgICAgICAgIGNhY2hlOiBjYWNoZVxuICAgICAgICAgIH0sICRsb2FkZXJPcHRpb25zLiRodHRwKVxuICAgICAgICB9KTtcblxuICAgICAgICAkaW5qZWN0b3IuZ2V0KCRsb2FkZXJGYWN0b3J5KShsb2FkZXJPcHRpb25zKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgdmFyIHRyYW5zbGF0aW9uVGFibGUgPSB7fTtcbiAgICAgICAgICAkcm9vdFNjb3BlLiRlbWl0KCckdHJhbnNsYXRlTG9hZGluZ1N1Y2Nlc3MnLCB7bGFuZ3VhZ2U6IGtleX0pO1xuXG4gICAgICAgICAgaWYgKGFuZ3VsYXIuaXNBcnJheShkYXRhKSkge1xuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGRhdGEsIGZ1bmN0aW9uICh0YWJsZSkge1xuICAgICAgICAgICAgICBhbmd1bGFyLmV4dGVuZCh0cmFuc2xhdGlvblRhYmxlLCBmbGF0T2JqZWN0KHRhYmxlKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYW5ndWxhci5leHRlbmQodHJhbnNsYXRpb25UYWJsZSwgZmxhdE9iamVjdChkYXRhKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHBlbmRpbmdMb2FkZXIgPSBmYWxzZTtcbiAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHtcbiAgICAgICAgICAgIGtleToga2V5LFxuICAgICAgICAgICAgdGFibGU6IHRyYW5zbGF0aW9uVGFibGVcbiAgICAgICAgICB9KTtcbiAgICAgICAgICAkcm9vdFNjb3BlLiRlbWl0KCckdHJhbnNsYXRlTG9hZGluZ0VuZCcsIHtsYW5ndWFnZToga2V5fSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAkcm9vdFNjb3BlLiRlbWl0KCckdHJhbnNsYXRlTG9hZGluZ0Vycm9yJywge2xhbmd1YWdlOiBrZXl9KTtcbiAgICAgICAgICBkZWZlcnJlZC5yZWplY3Qoa2V5KTtcbiAgICAgICAgICAkcm9vdFNjb3BlLiRlbWl0KCckdHJhbnNsYXRlTG9hZGluZ0VuZCcsIHtsYW5ndWFnZToga2V5fSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgIH07XG5cbiAgICAgIGlmICgkc3RvcmFnZUZhY3RvcnkpIHtcbiAgICAgICAgU3RvcmFnZSA9ICRpbmplY3Rvci5nZXQoJHN0b3JhZ2VGYWN0b3J5KTtcblxuICAgICAgICBpZiAoIVN0b3JhZ2UuZ2V0IHx8ICFTdG9yYWdlLnB1dCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGRuXFwndCB1c2Ugc3RvcmFnZSBcXCcnICsgJHN0b3JhZ2VGYWN0b3J5ICsgJ1xcJywgbWlzc2luZyBnZXQoKSBvciBwdXQoKSBtZXRob2QhJyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gYXBwbHkgYWRkaXRpb25hbCBzZXR0aW5nc1xuICAgICAgaWYgKGFuZ3VsYXIuaXNGdW5jdGlvbihkZWZhdWx0SW50ZXJwb2xhdG9yLnVzZVNhbml0aXplVmFsdWVTdHJhdGVneSkpIHtcbiAgICAgICAgZGVmYXVsdEludGVycG9sYXRvci51c2VTYW5pdGl6ZVZhbHVlU3RyYXRlZ3koJGludGVycG9sYXRpb25TYW5pdGl6YXRpb25TdHJhdGVneSk7XG4gICAgICB9XG5cbiAgICAgIC8vIGlmIHdlIGhhdmUgYWRkaXRpb25hbCBpbnRlcnBvbGF0aW9ucyB0aGF0IHdlcmUgYWRkZWQgdmlhXG4gICAgICAvLyAkdHJhbnNsYXRlUHJvdmlkZXIuYWRkSW50ZXJwb2xhdGlvbigpLCB3ZSBoYXZlIHRvIG1hcCdlbVxuICAgICAgaWYgKCRpbnRlcnBvbGF0b3JGYWN0b3JpZXMubGVuZ3RoKSB7XG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaCgkaW50ZXJwb2xhdG9yRmFjdG9yaWVzLCBmdW5jdGlvbiAoaW50ZXJwb2xhdG9yRmFjdG9yeSkge1xuICAgICAgICAgIHZhciBpbnRlcnBvbGF0b3IgPSAkaW5qZWN0b3IuZ2V0KGludGVycG9sYXRvckZhY3RvcnkpO1xuICAgICAgICAgIC8vIHNldHRpbmcgaW5pdGlhbCBsb2NhbGUgZm9yIGVhY2ggaW50ZXJwb2xhdGlvbiBzZXJ2aWNlXG4gICAgICAgICAgaW50ZXJwb2xhdG9yLnNldExvY2FsZSgkcHJlZmVycmVkTGFuZ3VhZ2UgfHwgJHVzZXMpO1xuICAgICAgICAgIC8vIGFwcGx5IGFkZGl0aW9uYWwgc2V0dGluZ3NcbiAgICAgICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKGludGVycG9sYXRvci51c2VTYW5pdGl6ZVZhbHVlU3RyYXRlZ3kpKSB7XG4gICAgICAgICAgICBpbnRlcnBvbGF0b3IudXNlU2FuaXRpemVWYWx1ZVN0cmF0ZWd5KCRpbnRlcnBvbGF0aW9uU2FuaXRpemF0aW9uU3RyYXRlZ3kpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBtYWtlJ2VtIHJlY29nbml6YWJsZSB0aHJvdWdoIGlkXG4gICAgICAgICAgaW50ZXJwb2xhdG9ySGFzaE1hcFtpbnRlcnBvbGF0b3IuZ2V0SW50ZXJwb2xhdGlvbklkZW50aWZpZXIoKV0gPSBpbnRlcnBvbGF0b3I7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEBuYW1lIGdldFRyYW5zbGF0aW9uVGFibGVcbiAgICAgICAqIEBwcml2YXRlXG4gICAgICAgKlxuICAgICAgICogQGRlc2NyaXB0aW9uXG4gICAgICAgKiBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIHRoZSB0cmFuc2xhdGlvbiB0YWJsZVxuICAgICAgICogb3IgaXMgcmVqZWN0ZWQgaWYgYW4gZXJyb3Igb2NjdXJyZWQuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIGxhbmdLZXlcbiAgICAgICAqIEByZXR1cm5zIHtRLnByb21pc2V9XG4gICAgICAgKi9cbiAgICAgIHZhciBnZXRUcmFuc2xhdGlvblRhYmxlID0gZnVuY3Rpb24gKGxhbmdLZXkpIHtcbiAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCgkdHJhbnNsYXRpb25UYWJsZSwgbGFuZ0tleSkpIHtcbiAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCR0cmFuc2xhdGlvblRhYmxlW2xhbmdLZXldKTtcbiAgICAgICAgfSBlbHNlIGlmIChsYW5nUHJvbWlzZXNbbGFuZ0tleV0pIHtcbiAgICAgICAgICBsYW5nUHJvbWlzZXNbbGFuZ0tleV0udGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgdHJhbnNsYXRpb25zKGRhdGEua2V5LCBkYXRhLnRhYmxlKTtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YS50YWJsZSk7XG4gICAgICAgICAgfSwgZGVmZXJyZWQucmVqZWN0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgIH07XG5cbiAgICAgIC8qKlxuICAgICAgICogQG5hbWUgZ2V0RmFsbGJhY2tUcmFuc2xhdGlvblxuICAgICAgICogQHByaXZhdGVcbiAgICAgICAqXG4gICAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgICAqIFJldHVybnMgYSBwcm9taXNlIHRoYXQgd2lsbCByZXNvbHZlIHRvIHRoZSB0cmFuc2xhdGlvblxuICAgICAgICogb3IgYmUgcmVqZWN0ZWQgaWYgbm8gdHJhbnNsYXRpb24gd2FzIGZvdW5kIGZvciB0aGUgbGFuZ3VhZ2UuXG4gICAgICAgKiBUaGlzIGZ1bmN0aW9uIGlzIGN1cnJlbnRseSBvbmx5IHVzZWQgZm9yIGZhbGxiYWNrIGxhbmd1YWdlIHRyYW5zbGF0aW9uLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSBsYW5nS2V5IFRoZSBsYW5ndWFnZSB0byB0cmFuc2xhdGUgdG8uXG4gICAgICAgKiBAcGFyYW0gdHJhbnNsYXRpb25JZFxuICAgICAgICogQHBhcmFtIGludGVycG9sYXRlUGFyYW1zXG4gICAgICAgKiBAcGFyYW0gSW50ZXJwb2xhdG9yXG4gICAgICAgKiBAcmV0dXJucyB7US5wcm9taXNlfVxuICAgICAgICovXG4gICAgICB2YXIgZ2V0RmFsbGJhY2tUcmFuc2xhdGlvbiA9IGZ1bmN0aW9uIChsYW5nS2V5LCB0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgSW50ZXJwb2xhdG9yKSB7XG4gICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgICAgZ2V0VHJhbnNsYXRpb25UYWJsZShsYW5nS2V5KS50aGVuKGZ1bmN0aW9uICh0cmFuc2xhdGlvblRhYmxlKSB7XG4gICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0cmFuc2xhdGlvblRhYmxlLCB0cmFuc2xhdGlvbklkKSkge1xuICAgICAgICAgICAgSW50ZXJwb2xhdG9yLnNldExvY2FsZShsYW5nS2V5KTtcbiAgICAgICAgICAgIHZhciB0cmFuc2xhdGlvbiA9IHRyYW5zbGF0aW9uVGFibGVbdHJhbnNsYXRpb25JZF07XG4gICAgICAgICAgICBpZiAodHJhbnNsYXRpb24uc3Vic3RyKDAsIDIpID09PSAnQDonKSB7XG4gICAgICAgICAgICAgIGdldEZhbGxiYWNrVHJhbnNsYXRpb24obGFuZ0tleSwgdHJhbnNsYXRpb24uc3Vic3RyKDIpLCBpbnRlcnBvbGF0ZVBhcmFtcywgSW50ZXJwb2xhdG9yKVxuICAgICAgICAgICAgICAgIC50aGVuKGRlZmVycmVkLnJlc29sdmUsIGRlZmVycmVkLnJlamVjdCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKEludGVycG9sYXRvci5pbnRlcnBvbGF0ZSh0cmFuc2xhdGlvblRhYmxlW3RyYW5zbGF0aW9uSWRdLCBpbnRlcnBvbGF0ZVBhcmFtcykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgSW50ZXJwb2xhdG9yLnNldExvY2FsZSgkdXNlcyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgZGVmZXJyZWQucmVqZWN0KTtcblxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgIH07XG5cbiAgICAgIC8qKlxuICAgICAgICogQG5hbWUgZ2V0RmFsbGJhY2tUcmFuc2xhdGlvbkluc3RhbnRcbiAgICAgICAqIEBwcml2YXRlXG4gICAgICAgKlxuICAgICAgICogQGRlc2NyaXB0aW9uXG4gICAgICAgKiBSZXR1cm5zIGEgdHJhbnNsYXRpb25cbiAgICAgICAqIFRoaXMgZnVuY3Rpb24gaXMgY3VycmVudGx5IG9ubHkgdXNlZCBmb3IgZmFsbGJhY2sgbGFuZ3VhZ2UgdHJhbnNsYXRpb24uXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIGxhbmdLZXkgVGhlIGxhbmd1YWdlIHRvIHRyYW5zbGF0ZSB0by5cbiAgICAgICAqIEBwYXJhbSB0cmFuc2xhdGlvbklkXG4gICAgICAgKiBAcGFyYW0gaW50ZXJwb2xhdGVQYXJhbXNcbiAgICAgICAqIEBwYXJhbSBJbnRlcnBvbGF0b3JcbiAgICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHRyYW5zbGF0aW9uXG4gICAgICAgKi9cbiAgICAgIHZhciBnZXRGYWxsYmFja1RyYW5zbGF0aW9uSW5zdGFudCA9IGZ1bmN0aW9uIChsYW5nS2V5LCB0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgSW50ZXJwb2xhdG9yKSB7XG4gICAgICAgIHZhciByZXN1bHQsIHRyYW5zbGF0aW9uVGFibGUgPSAkdHJhbnNsYXRpb25UYWJsZVtsYW5nS2V5XTtcblxuICAgICAgICBpZiAodHJhbnNsYXRpb25UYWJsZSAmJiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodHJhbnNsYXRpb25UYWJsZSwgdHJhbnNsYXRpb25JZCkpIHtcbiAgICAgICAgICBJbnRlcnBvbGF0b3Iuc2V0TG9jYWxlKGxhbmdLZXkpO1xuICAgICAgICAgIHJlc3VsdCA9IEludGVycG9sYXRvci5pbnRlcnBvbGF0ZSh0cmFuc2xhdGlvblRhYmxlW3RyYW5zbGF0aW9uSWRdLCBpbnRlcnBvbGF0ZVBhcmFtcyk7XG4gICAgICAgICAgaWYgKHJlc3VsdC5zdWJzdHIoMCwgMikgPT09ICdAOicpIHtcbiAgICAgICAgICAgIHJldHVybiBnZXRGYWxsYmFja1RyYW5zbGF0aW9uSW5zdGFudChsYW5nS2V5LCByZXN1bHQuc3Vic3RyKDIpLCBpbnRlcnBvbGF0ZVBhcmFtcywgSW50ZXJwb2xhdG9yKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgSW50ZXJwb2xhdG9yLnNldExvY2FsZSgkdXNlcyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfTtcblxuXG4gICAgICAvKipcbiAgICAgICAqIEBuYW1lIHRyYW5zbGF0ZUJ5SGFuZGxlclxuICAgICAgICogQHByaXZhdGVcbiAgICAgICAqXG4gICAgICAgKiBUcmFuc2xhdGUgYnkgbWlzc2luZyB0cmFuc2xhdGlvbiBoYW5kbGVyLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB0cmFuc2xhdGlvbklkXG4gICAgICAgKiBAcmV0dXJucyB0cmFuc2xhdGlvbiBjcmVhdGVkIGJ5ICRtaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyIG9yIHRyYW5zbGF0aW9uSWQgaXMgJG1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXIgaXNcbiAgICAgICAqIGFic2VudFxuICAgICAgICovXG4gICAgICB2YXIgdHJhbnNsYXRlQnlIYW5kbGVyID0gZnVuY3Rpb24gKHRyYW5zbGF0aW9uSWQpIHtcbiAgICAgICAgLy8gSWYgd2UgaGF2ZSBhIGhhbmRsZXIgZmFjdG9yeSAtIHdlIG1pZ2h0IGFsc28gY2FsbCBpdCBoZXJlIHRvIGRldGVybWluZSBpZiBpdCBwcm92aWRlc1xuICAgICAgICAvLyBhIGRlZmF1bHQgdGV4dCBmb3IgYSB0cmFuc2xhdGlvbmlkIHRoYXQgY2FuJ3QgYmUgZm91bmQgYW55d2hlcmUgaW4gb3VyIHRhYmxlc1xuICAgICAgICBpZiAoJG1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXJGYWN0b3J5KSB7XG4gICAgICAgICAgdmFyIHJlc3VsdFN0cmluZyA9ICRpbmplY3Rvci5nZXQoJG1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXJGYWN0b3J5KSh0cmFuc2xhdGlvbklkLCAkdXNlcyk7XG4gICAgICAgICAgaWYgKHJlc3VsdFN0cmluZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0U3RyaW5nO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdHJhbnNsYXRpb25JZDtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRyYW5zbGF0aW9uSWQ7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIC8qKlxuICAgICAgICogQG5hbWUgcmVzb2x2ZUZvckZhbGxiYWNrTGFuZ3VhZ2VcbiAgICAgICAqIEBwcml2YXRlXG4gICAgICAgKlxuICAgICAgICogUmVjdXJzaXZlIGhlbHBlciBmdW5jdGlvbiBmb3IgZmFsbGJhY2tUcmFuc2xhdGlvbiB0aGF0IHdpbGwgc2VxdWVudGlhbGx5IGxvb2tcbiAgICAgICAqIGZvciBhIHRyYW5zbGF0aW9uIGluIHRoZSBmYWxsYmFja0xhbmd1YWdlcyBzdGFydGluZyB3aXRoIGZhbGxiYWNrTGFuZ3VhZ2VJbmRleC5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0gZmFsbGJhY2tMYW5ndWFnZUluZGV4XG4gICAgICAgKiBAcGFyYW0gdHJhbnNsYXRpb25JZFxuICAgICAgICogQHBhcmFtIGludGVycG9sYXRlUGFyYW1zXG4gICAgICAgKiBAcGFyYW0gSW50ZXJwb2xhdG9yXG4gICAgICAgKiBAcmV0dXJucyB7US5wcm9taXNlfSBQcm9taXNlIHRoYXQgd2lsbCByZXNvbHZlIHRvIHRoZSB0cmFuc2xhdGlvbi5cbiAgICAgICAqL1xuICAgICAgdmFyIHJlc29sdmVGb3JGYWxsYmFja0xhbmd1YWdlID0gZnVuY3Rpb24gKGZhbGxiYWNrTGFuZ3VhZ2VJbmRleCwgdHJhbnNsYXRpb25JZCwgaW50ZXJwb2xhdGVQYXJhbXMsIEludGVycG9sYXRvciwgZGVmYXVsdFRyYW5zbGF0aW9uVGV4dCkge1xuICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICAgIGlmIChmYWxsYmFja0xhbmd1YWdlSW5kZXggPCAkZmFsbGJhY2tMYW5ndWFnZS5sZW5ndGgpIHtcbiAgICAgICAgICB2YXIgbGFuZ0tleSA9ICRmYWxsYmFja0xhbmd1YWdlW2ZhbGxiYWNrTGFuZ3VhZ2VJbmRleF07XG4gICAgICAgICAgZ2V0RmFsbGJhY2tUcmFuc2xhdGlvbihsYW5nS2V5LCB0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgSW50ZXJwb2xhdG9yKS50aGVuKFxuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSxcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgLy8gTG9vayBpbiB0aGUgbmV4dCBmYWxsYmFjayBsYW5ndWFnZSBmb3IgYSB0cmFuc2xhdGlvbi5cbiAgICAgICAgICAgICAgLy8gSXQgZGVsYXlzIHRoZSByZXNvbHZpbmcgYnkgcGFzc2luZyBhbm90aGVyIHByb21pc2UgdG8gcmVzb2x2ZS5cbiAgICAgICAgICAgICAgcmVzb2x2ZUZvckZhbGxiYWNrTGFuZ3VhZ2UoZmFsbGJhY2tMYW5ndWFnZUluZGV4ICsgMSwgdHJhbnNsYXRpb25JZCwgaW50ZXJwb2xhdGVQYXJhbXMsIEludGVycG9sYXRvciwgZGVmYXVsdFRyYW5zbGF0aW9uVGV4dCkudGhlbihkZWZlcnJlZC5yZXNvbHZlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE5vIHRyYW5zbGF0aW9uIGZvdW5kIGluIGFueSBmYWxsYmFjayBsYW5ndWFnZVxuICAgICAgICAgIC8vIGlmIGEgZGVmYXVsdCB0cmFuc2xhdGlvbiB0ZXh0IGlzIHNldCBpbiB0aGUgZGlyZWN0aXZlLCB0aGVuIHJldHVybiB0aGlzIGFzIGEgcmVzdWx0XG4gICAgICAgICAgaWYgKGRlZmF1bHRUcmFuc2xhdGlvblRleHQpIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGVmYXVsdFRyYW5zbGF0aW9uVGV4dCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGlmIG5vIGRlZmF1bHQgdHJhbnNsYXRpb24gaXMgc2V0IGFuZCBhbiBlcnJvciBoYW5kbGVyIGlzIGRlZmluZWQsIHNlbmQgaXQgdG8gdGhlIGhhbmRsZXJcbiAgICAgICAgICAgIC8vIGFuZCB0aGVuIHJldHVybiB0aGUgcmVzdWx0XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHRyYW5zbGF0ZUJ5SGFuZGxlcih0cmFuc2xhdGlvbklkKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgfTtcblxuICAgICAgLyoqXG4gICAgICAgKiBAbmFtZSByZXNvbHZlRm9yRmFsbGJhY2tMYW5ndWFnZUluc3RhbnRcbiAgICAgICAqIEBwcml2YXRlXG4gICAgICAgKlxuICAgICAgICogUmVjdXJzaXZlIGhlbHBlciBmdW5jdGlvbiBmb3IgZmFsbGJhY2tUcmFuc2xhdGlvbiB0aGF0IHdpbGwgc2VxdWVudGlhbGx5IGxvb2tcbiAgICAgICAqIGZvciBhIHRyYW5zbGF0aW9uIGluIHRoZSBmYWxsYmFja0xhbmd1YWdlcyBzdGFydGluZyB3aXRoIGZhbGxiYWNrTGFuZ3VhZ2VJbmRleC5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0gZmFsbGJhY2tMYW5ndWFnZUluZGV4XG4gICAgICAgKiBAcGFyYW0gdHJhbnNsYXRpb25JZFxuICAgICAgICogQHBhcmFtIGludGVycG9sYXRlUGFyYW1zXG4gICAgICAgKiBAcGFyYW0gSW50ZXJwb2xhdG9yXG4gICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSB0cmFuc2xhdGlvblxuICAgICAgICovXG4gICAgICB2YXIgcmVzb2x2ZUZvckZhbGxiYWNrTGFuZ3VhZ2VJbnN0YW50ID0gZnVuY3Rpb24gKGZhbGxiYWNrTGFuZ3VhZ2VJbmRleCwgdHJhbnNsYXRpb25JZCwgaW50ZXJwb2xhdGVQYXJhbXMsIEludGVycG9sYXRvcikge1xuICAgICAgICB2YXIgcmVzdWx0O1xuXG4gICAgICAgIGlmIChmYWxsYmFja0xhbmd1YWdlSW5kZXggPCAkZmFsbGJhY2tMYW5ndWFnZS5sZW5ndGgpIHtcbiAgICAgICAgICB2YXIgbGFuZ0tleSA9ICRmYWxsYmFja0xhbmd1YWdlW2ZhbGxiYWNrTGFuZ3VhZ2VJbmRleF07XG4gICAgICAgICAgcmVzdWx0ID0gZ2V0RmFsbGJhY2tUcmFuc2xhdGlvbkluc3RhbnQobGFuZ0tleSwgdHJhbnNsYXRpb25JZCwgaW50ZXJwb2xhdGVQYXJhbXMsIEludGVycG9sYXRvcik7XG4gICAgICAgICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc29sdmVGb3JGYWxsYmFja0xhbmd1YWdlSW5zdGFudChmYWxsYmFja0xhbmd1YWdlSW5kZXggKyAxLCB0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgSW50ZXJwb2xhdG9yKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH07XG5cbiAgICAgIC8qKlxuICAgICAgICogVHJhbnNsYXRlcyB3aXRoIHRoZSB1c2FnZSBvZiB0aGUgZmFsbGJhY2sgbGFuZ3VhZ2VzLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB0cmFuc2xhdGlvbklkXG4gICAgICAgKiBAcGFyYW0gaW50ZXJwb2xhdGVQYXJhbXNcbiAgICAgICAqIEBwYXJhbSBJbnRlcnBvbGF0b3JcbiAgICAgICAqIEByZXR1cm5zIHtRLnByb21pc2V9IFByb21pc2UsIHRoYXQgcmVzb2x2ZXMgdG8gdGhlIHRyYW5zbGF0aW9uLlxuICAgICAgICovXG4gICAgICB2YXIgZmFsbGJhY2tUcmFuc2xhdGlvbiA9IGZ1bmN0aW9uICh0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgSW50ZXJwb2xhdG9yLCBkZWZhdWx0VHJhbnNsYXRpb25UZXh0KSB7XG4gICAgICAgIC8vIFN0YXJ0IHdpdGggdGhlIGZhbGxiYWNrTGFuZ3VhZ2Ugd2l0aCBpbmRleCAwXG4gICAgICAgIHJldHVybiByZXNvbHZlRm9yRmFsbGJhY2tMYW5ndWFnZSgoc3RhcnRGYWxsYmFja0l0ZXJhdGlvbj4wID8gc3RhcnRGYWxsYmFja0l0ZXJhdGlvbiA6IGZhbGxiYWNrSW5kZXgpLCB0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgSW50ZXJwb2xhdG9yLCBkZWZhdWx0VHJhbnNsYXRpb25UZXh0KTtcbiAgICAgIH07XG5cbiAgICAgIC8qKlxuICAgICAgICogVHJhbnNsYXRlcyB3aXRoIHRoZSB1c2FnZSBvZiB0aGUgZmFsbGJhY2sgbGFuZ3VhZ2VzLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB0cmFuc2xhdGlvbklkXG4gICAgICAgKiBAcGFyYW0gaW50ZXJwb2xhdGVQYXJhbXNcbiAgICAgICAqIEBwYXJhbSBJbnRlcnBvbGF0b3JcbiAgICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IHRyYW5zbGF0aW9uXG4gICAgICAgKi9cbiAgICAgIHZhciBmYWxsYmFja1RyYW5zbGF0aW9uSW5zdGFudCA9IGZ1bmN0aW9uICh0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgSW50ZXJwb2xhdG9yKSB7XG4gICAgICAgIC8vIFN0YXJ0IHdpdGggdGhlIGZhbGxiYWNrTGFuZ3VhZ2Ugd2l0aCBpbmRleCAwXG4gICAgICAgIHJldHVybiByZXNvbHZlRm9yRmFsbGJhY2tMYW5ndWFnZUluc3RhbnQoKHN0YXJ0RmFsbGJhY2tJdGVyYXRpb24+MCA/IHN0YXJ0RmFsbGJhY2tJdGVyYXRpb24gOiBmYWxsYmFja0luZGV4KSwgdHJhbnNsYXRpb25JZCwgaW50ZXJwb2xhdGVQYXJhbXMsIEludGVycG9sYXRvcik7XG4gICAgICB9O1xuXG4gICAgICB2YXIgZGV0ZXJtaW5lVHJhbnNsYXRpb24gPSBmdW5jdGlvbiAodHJhbnNsYXRpb25JZCwgaW50ZXJwb2xhdGVQYXJhbXMsIGludGVycG9sYXRpb25JZCwgZGVmYXVsdFRyYW5zbGF0aW9uVGV4dCkge1xuXG4gICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgICAgdmFyIHRhYmxlID0gJHVzZXMgPyAkdHJhbnNsYXRpb25UYWJsZVskdXNlc10gOiAkdHJhbnNsYXRpb25UYWJsZSxcbiAgICAgICAgICAgIEludGVycG9sYXRvciA9IChpbnRlcnBvbGF0aW9uSWQpID8gaW50ZXJwb2xhdG9ySGFzaE1hcFtpbnRlcnBvbGF0aW9uSWRdIDogZGVmYXVsdEludGVycG9sYXRvcjtcblxuICAgICAgICAvLyBpZiB0aGUgdHJhbnNsYXRpb24gaWQgZXhpc3RzLCB3ZSBjYW4ganVzdCBpbnRlcnBvbGF0ZSBpdFxuICAgICAgICBpZiAodGFibGUgJiYgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRhYmxlLCB0cmFuc2xhdGlvbklkKSkge1xuICAgICAgICAgIHZhciB0cmFuc2xhdGlvbiA9IHRhYmxlW3RyYW5zbGF0aW9uSWRdO1xuXG4gICAgICAgICAgLy8gSWYgdXNpbmcgbGluaywgcmVydW4gJHRyYW5zbGF0ZSB3aXRoIGxpbmtlZCB0cmFuc2xhdGlvbklkIGFuZCByZXR1cm4gaXRcbiAgICAgICAgICBpZiAodHJhbnNsYXRpb24uc3Vic3RyKDAsIDIpID09PSAnQDonKSB7XG5cbiAgICAgICAgICAgICR0cmFuc2xhdGUodHJhbnNsYXRpb24uc3Vic3RyKDIpLCBpbnRlcnBvbGF0ZVBhcmFtcywgaW50ZXJwb2xhdGlvbklkLCBkZWZhdWx0VHJhbnNsYXRpb25UZXh0KVxuICAgICAgICAgICAgICAudGhlbihkZWZlcnJlZC5yZXNvbHZlLCBkZWZlcnJlZC5yZWplY3QpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKEludGVycG9sYXRvci5pbnRlcnBvbGF0ZSh0cmFuc2xhdGlvbiwgaW50ZXJwb2xhdGVQYXJhbXMpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIG1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXJUcmFuc2xhdGlvbjtcbiAgICAgICAgICAvLyBmb3IgbG9nZ2luZyBwdXJwb3NlcyBvbmx5IChhcyBpbiAkdHJhbnNsYXRlTWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlckxvZyksIHZhbHVlIGlzIG5vdCByZXR1cm5lZCB0byBwcm9taXNlXG4gICAgICAgICAgaWYgKCRtaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyRmFjdG9yeSAmJiAhcGVuZGluZ0xvYWRlcikge1xuICAgICAgICAgICAgbWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlclRyYW5zbGF0aW9uID0gdHJhbnNsYXRlQnlIYW5kbGVyKHRyYW5zbGF0aW9uSWQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIHNpbmNlIHdlIGNvdWxkbid0IHRyYW5zbGF0ZSB0aGUgaW5pdGFsIHJlcXVlc3RlZCB0cmFuc2xhdGlvbiBpZCxcbiAgICAgICAgICAvLyB3ZSB0cnkgaXQgbm93IHdpdGggb25lIG9yIG1vcmUgZmFsbGJhY2sgbGFuZ3VhZ2VzLCBpZiBmYWxsYmFjayBsYW5ndWFnZShzKSBpc1xuICAgICAgICAgIC8vIGNvbmZpZ3VyZWQuXG4gICAgICAgICAgaWYgKCR1c2VzICYmICRmYWxsYmFja0xhbmd1YWdlICYmICRmYWxsYmFja0xhbmd1YWdlLmxlbmd0aCkge1xuICAgICAgICAgICAgZmFsbGJhY2tUcmFuc2xhdGlvbih0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgSW50ZXJwb2xhdG9yLCBkZWZhdWx0VHJhbnNsYXRpb25UZXh0KVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICh0cmFuc2xhdGlvbikge1xuICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh0cmFuc2xhdGlvbik7XG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKF90cmFuc2xhdGlvbklkKSB7XG4gICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoYXBwbHlOb3RGb3VuZEluZGljYXRvcnMoX3RyYW5zbGF0aW9uSWQpKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2UgaWYgKCRtaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyRmFjdG9yeSAmJiAhcGVuZGluZ0xvYWRlciAmJiBtaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyVHJhbnNsYXRpb24pIHtcbiAgICAgICAgICAgIC8vIGxvb2tzIGxpa2UgdGhlIHJlcXVlc3RlZCB0cmFuc2xhdGlvbiBpZCBkb2Vzbid0IGV4aXN0cy5cbiAgICAgICAgICAgIC8vIE5vdywgaWYgdGhlcmUgaXMgYSByZWdpc3RlcmVkIGhhbmRsZXIgZm9yIG1pc3NpbmcgdHJhbnNsYXRpb25zIGFuZCBub1xuICAgICAgICAgICAgLy8gYXN5bmNMb2FkZXIgaXMgcGVuZGluZywgd2UgZXhlY3V0ZSB0aGUgaGFuZGxlclxuICAgICAgICAgICAgaWYgKGRlZmF1bHRUcmFuc2xhdGlvblRleHQpIHtcbiAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkZWZhdWx0VHJhbnNsYXRpb25UZXh0KTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKG1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXJUcmFuc2xhdGlvbik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGRlZmF1bHRUcmFuc2xhdGlvblRleHQpIHtcbiAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkZWZhdWx0VHJhbnNsYXRpb25UZXh0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChhcHBseU5vdEZvdW5kSW5kaWNhdG9ycyh0cmFuc2xhdGlvbklkKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgfTtcblxuICAgICAgdmFyIGRldGVybWluZVRyYW5zbGF0aW9uSW5zdGFudCA9IGZ1bmN0aW9uICh0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgaW50ZXJwb2xhdGlvbklkKSB7XG5cbiAgICAgICAgdmFyIHJlc3VsdCwgdGFibGUgPSAkdXNlcyA/ICR0cmFuc2xhdGlvblRhYmxlWyR1c2VzXSA6ICR0cmFuc2xhdGlvblRhYmxlLFxuICAgICAgICAgICAgSW50ZXJwb2xhdG9yID0gZGVmYXVsdEludGVycG9sYXRvcjtcblxuICAgICAgICAvLyBpZiB0aGUgaW50ZXJwb2xhdGlvbiBpZCBleGlzdHMgdXNlIGN1c3RvbSBpbnRlcnBvbGF0b3JcbiAgICAgICAgaWYgKGludGVycG9sYXRvckhhc2hNYXAgJiYgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGludGVycG9sYXRvckhhc2hNYXAsIGludGVycG9sYXRpb25JZCkpIHtcbiAgICAgICAgICBJbnRlcnBvbGF0b3IgPSBpbnRlcnBvbGF0b3JIYXNoTWFwW2ludGVycG9sYXRpb25JZF07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiB0aGUgdHJhbnNsYXRpb24gaWQgZXhpc3RzLCB3ZSBjYW4ganVzdCBpbnRlcnBvbGF0ZSBpdFxuICAgICAgICBpZiAodGFibGUgJiYgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRhYmxlLCB0cmFuc2xhdGlvbklkKSkge1xuICAgICAgICAgIHZhciB0cmFuc2xhdGlvbiA9IHRhYmxlW3RyYW5zbGF0aW9uSWRdO1xuXG4gICAgICAgICAgLy8gSWYgdXNpbmcgbGluaywgcmVydW4gJHRyYW5zbGF0ZSB3aXRoIGxpbmtlZCB0cmFuc2xhdGlvbklkIGFuZCByZXR1cm4gaXRcbiAgICAgICAgICBpZiAodHJhbnNsYXRpb24uc3Vic3RyKDAsIDIpID09PSAnQDonKSB7XG4gICAgICAgICAgICByZXN1bHQgPSBkZXRlcm1pbmVUcmFuc2xhdGlvbkluc3RhbnQodHJhbnNsYXRpb24uc3Vic3RyKDIpLCBpbnRlcnBvbGF0ZVBhcmFtcywgaW50ZXJwb2xhdGlvbklkKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0ID0gSW50ZXJwb2xhdG9yLmludGVycG9sYXRlKHRyYW5zbGF0aW9uLCBpbnRlcnBvbGF0ZVBhcmFtcyk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciBtaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyVHJhbnNsYXRpb247XG4gICAgICAgICAgLy8gZm9yIGxvZ2dpbmcgcHVycG9zZXMgb25seSAoYXMgaW4gJHRyYW5zbGF0ZU1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXJMb2cpLCB2YWx1ZSBpcyBub3QgcmV0dXJuZWQgdG8gcHJvbWlzZVxuICAgICAgICAgIGlmICgkbWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlckZhY3RvcnkgJiYgIXBlbmRpbmdMb2FkZXIpIHtcbiAgICAgICAgICAgIG1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXJUcmFuc2xhdGlvbiA9IHRyYW5zbGF0ZUJ5SGFuZGxlcih0cmFuc2xhdGlvbklkKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBzaW5jZSB3ZSBjb3VsZG4ndCB0cmFuc2xhdGUgdGhlIGluaXRhbCByZXF1ZXN0ZWQgdHJhbnNsYXRpb24gaWQsXG4gICAgICAgICAgLy8gd2UgdHJ5IGl0IG5vdyB3aXRoIG9uZSBvciBtb3JlIGZhbGxiYWNrIGxhbmd1YWdlcywgaWYgZmFsbGJhY2sgbGFuZ3VhZ2UocykgaXNcbiAgICAgICAgICAvLyBjb25maWd1cmVkLlxuICAgICAgICAgIGlmICgkdXNlcyAmJiAkZmFsbGJhY2tMYW5ndWFnZSAmJiAkZmFsbGJhY2tMYW5ndWFnZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGZhbGxiYWNrSW5kZXggPSAwO1xuICAgICAgICAgICAgcmVzdWx0ID0gZmFsbGJhY2tUcmFuc2xhdGlvbkluc3RhbnQodHJhbnNsYXRpb25JZCwgaW50ZXJwb2xhdGVQYXJhbXMsIEludGVycG9sYXRvcik7XG4gICAgICAgICAgfSBlbHNlIGlmICgkbWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlckZhY3RvcnkgJiYgIXBlbmRpbmdMb2FkZXIgJiYgbWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlclRyYW5zbGF0aW9uKSB7XG4gICAgICAgICAgICAvLyBsb29rcyBsaWtlIHRoZSByZXF1ZXN0ZWQgdHJhbnNsYXRpb24gaWQgZG9lc24ndCBleGlzdHMuXG4gICAgICAgICAgICAvLyBOb3csIGlmIHRoZXJlIGlzIGEgcmVnaXN0ZXJlZCBoYW5kbGVyIGZvciBtaXNzaW5nIHRyYW5zbGF0aW9ucyBhbmQgbm9cbiAgICAgICAgICAgIC8vIGFzeW5jTG9hZGVyIGlzIHBlbmRpbmcsIHdlIGV4ZWN1dGUgdGhlIGhhbmRsZXJcbiAgICAgICAgICAgIHJlc3VsdCA9IG1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXJUcmFuc2xhdGlvbjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0ID0gYXBwbHlOb3RGb3VuZEluZGljYXRvcnModHJhbnNsYXRpb25JZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH07XG5cbiAgICAgIC8qKlxuICAgICAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAgICAgKiBAbmFtZSBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGUjcHJlZmVycmVkTGFuZ3VhZ2VcbiAgICAgICAqIEBtZXRob2RPZiBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVcbiAgICAgICAqXG4gICAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgICAqIFJldHVybnMgdGhlIGxhbmd1YWdlIGtleSBmb3IgdGhlIHByZWZlcnJlZCBsYW5ndWFnZS5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge3N0cmluZ30gbGFuZ0tleSBsYW5ndWFnZSBTdHJpbmcgb3IgQXJyYXkgdG8gYmUgdXNlZCBhcyBwcmVmZXJyZWRMYW5ndWFnZSAoY2hhbmdpbmcgYXQgcnVudGltZSlcbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IHByZWZlcnJlZCBsYW5ndWFnZSBrZXlcbiAgICAgICAqL1xuICAgICAgJHRyYW5zbGF0ZS5wcmVmZXJyZWRMYW5ndWFnZSA9IGZ1bmN0aW9uIChsYW5nS2V5KSB7XG4gICAgICAgIGlmKGxhbmdLZXkpIHtcbiAgICAgICAgICBzZXR1cFByZWZlcnJlZExhbmd1YWdlKGxhbmdLZXkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAkcHJlZmVycmVkTGFuZ3VhZ2U7XG4gICAgICB9O1xuXG4gICAgICAvKipcbiAgICAgICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgICAgICogQG5hbWUgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlI2Nsb2FrQ2xhc3NOYW1lXG4gICAgICAgKiBAbWV0aG9kT2YgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlXG4gICAgICAgKlxuICAgICAgICogQGRlc2NyaXB0aW9uXG4gICAgICAgKiBSZXR1cm5zIHRoZSBjb25maWd1cmVkIGNsYXNzIG5hbWUgZm9yIGB0cmFuc2xhdGUtY2xvYWtgIGRpcmVjdGl2ZS5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IGNsb2FrQ2xhc3NOYW1lXG4gICAgICAgKi9cbiAgICAgICR0cmFuc2xhdGUuY2xvYWtDbGFzc05hbWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAkY2xvYWtDbGFzc05hbWU7XG4gICAgICB9O1xuXG4gICAgICAvKipcbiAgICAgICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgICAgICogQG5hbWUgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlI2ZhbGxiYWNrTGFuZ3VhZ2VcbiAgICAgICAqIEBtZXRob2RPZiBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVcbiAgICAgICAqXG4gICAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgICAqIFJldHVybnMgdGhlIGxhbmd1YWdlIGtleSBmb3IgdGhlIGZhbGxiYWNrIGxhbmd1YWdlcyBvciBzZXRzIGEgbmV3IGZhbGxiYWNrIHN0YWNrLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nPX0gbGFuZ0tleSBsYW5ndWFnZSBTdHJpbmcgb3IgQXJyYXkgb2YgZmFsbGJhY2sgbGFuZ3VhZ2VzIHRvIGJlIHVzZWQgKHRvIGNoYW5nZSBzdGFjayBhdCBydW50aW1lKVxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm4ge3N0cmluZ3x8YXJyYXl9IGZhbGxiYWNrIGxhbmd1YWdlIGtleVxuICAgICAgICovXG4gICAgICAkdHJhbnNsYXRlLmZhbGxiYWNrTGFuZ3VhZ2UgPSBmdW5jdGlvbiAobGFuZ0tleSkge1xuICAgICAgICBpZiAobGFuZ0tleSAhPT0gdW5kZWZpbmVkICYmIGxhbmdLZXkgIT09IG51bGwpIHtcbiAgICAgICAgICBmYWxsYmFja1N0YWNrKGxhbmdLZXkpO1xuXG4gICAgICAgICAgLy8gYXMgd2UgbWlnaHQgaGF2ZSBhbiBhc3luYyBsb2FkZXIgaW5pdGlhdGVkIGFuZCBhIG5ldyB0cmFuc2xhdGlvbiBsYW5ndWFnZSBtaWdodCBoYXZlIGJlZW4gZGVmaW5lZFxuICAgICAgICAgIC8vIHdlIG5lZWQgdG8gYWRkIHRoZSBwcm9taXNlIHRvIHRoZSBzdGFjayBhbHNvLiBTbyAtIGl0ZXJhdGUuXG4gICAgICAgICAgaWYgKCRsb2FkZXJGYWN0b3J5KSB7XG4gICAgICAgICAgICBpZiAoJGZhbGxiYWNrTGFuZ3VhZ2UgJiYgJGZhbGxiYWNrTGFuZ3VhZ2UubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSAkZmFsbGJhY2tMYW5ndWFnZS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICghbGFuZ1Byb21pc2VzWyRmYWxsYmFja0xhbmd1YWdlW2ldXSkge1xuICAgICAgICAgICAgICAgICAgbGFuZ1Byb21pc2VzWyRmYWxsYmFja0xhbmd1YWdlW2ldXSA9IGxvYWRBc3luYygkZmFsbGJhY2tMYW5ndWFnZVtpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgICR0cmFuc2xhdGUudXNlKCR0cmFuc2xhdGUudXNlKCkpO1xuICAgICAgICB9XG4gICAgICAgIGlmICgkZmFsbGJhY2tXYXNTdHJpbmcpIHtcbiAgICAgICAgICByZXR1cm4gJGZhbGxiYWNrTGFuZ3VhZ2VbMF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuICRmYWxsYmFja0xhbmd1YWdlO1xuICAgICAgICB9XG5cbiAgICAgIH07XG5cbiAgICAgIC8qKlxuICAgICAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAgICAgKiBAbmFtZSBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGUjdXNlRmFsbGJhY2tMYW5ndWFnZVxuICAgICAgICogQG1ldGhvZE9mIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVxuICAgICAgICpcbiAgICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAgICogU2V0cyB0aGUgZmlyc3Qga2V5IG9mIHRoZSBmYWxsYmFjayBsYW5ndWFnZSBzdGFjayB0byBiZSB1c2VkIGZvciB0cmFuc2xhdGlvbi5cbiAgICAgICAqIFRoZXJlZm9yZSBhbGwgbGFuZ3VhZ2VzIGluIHRoZSBmYWxsYmFjayBhcnJheSBCRUZPUkUgdGhpcyBrZXkgd2lsbCBiZSBza2lwcGVkIVxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nPX0gbGFuZ0tleSBDb250YWlucyB0aGUgbGFuZ0tleSB0aGUgaXRlcmF0aW9uIHNoYWxsIHN0YXJ0IHdpdGguIFNldCB0byBmYWxzZSBpZiB5b3Ugd2FudCB0b1xuICAgICAgICogZ2V0IGJhY2sgdG8gdGhlIHdob2xlIHN0YWNrXG4gICAgICAgKi9cbiAgICAgICR0cmFuc2xhdGUudXNlRmFsbGJhY2tMYW5ndWFnZSA9IGZ1bmN0aW9uIChsYW5nS2V5KSB7XG4gICAgICAgIGlmIChsYW5nS2V5ICE9PSB1bmRlZmluZWQgJiYgbGFuZ0tleSAhPT0gbnVsbCkge1xuICAgICAgICAgIGlmICghbGFuZ0tleSkge1xuICAgICAgICAgICAgc3RhcnRGYWxsYmFja0l0ZXJhdGlvbiA9IDA7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBsYW5nS2V5UG9zaXRpb24gPSBpbmRleE9mKCRmYWxsYmFja0xhbmd1YWdlLCBsYW5nS2V5KTtcbiAgICAgICAgICAgIGlmIChsYW5nS2V5UG9zaXRpb24gPiAtMSkge1xuICAgICAgICAgICAgICBzdGFydEZhbGxiYWNrSXRlcmF0aW9uID0gbGFuZ0tleVBvc2l0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgIH07XG5cbiAgICAgIC8qKlxuICAgICAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAgICAgKiBAbmFtZSBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGUjcHJvcG9zZWRMYW5ndWFnZVxuICAgICAgICogQG1ldGhvZE9mIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVxuICAgICAgICpcbiAgICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAgICogUmV0dXJucyB0aGUgbGFuZ3VhZ2Uga2V5IG9mIGxhbmd1YWdlIHRoYXQgaXMgY3VycmVudGx5IGxvYWRlZCBhc3luY2hyb25vdXNseS5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IGxhbmd1YWdlIGtleVxuICAgICAgICovXG4gICAgICAkdHJhbnNsYXRlLnByb3Bvc2VkTGFuZ3VhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAkbmV4dExhbmc7XG4gICAgICB9O1xuXG4gICAgICAvKipcbiAgICAgICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgICAgICogQG5hbWUgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlI3N0b3JhZ2VcbiAgICAgICAqIEBtZXRob2RPZiBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVcbiAgICAgICAqXG4gICAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgICAqIFJldHVybnMgcmVnaXN0ZXJlZCBzdG9yYWdlLlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm4ge29iamVjdH0gU3RvcmFnZVxuICAgICAgICovXG4gICAgICAkdHJhbnNsYXRlLnN0b3JhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBTdG9yYWdlO1xuICAgICAgfTtcblxuICAgICAgLyoqXG4gICAgICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICAgICAqIEBuYW1lIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZSN1c2VcbiAgICAgICAqIEBtZXRob2RPZiBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVcbiAgICAgICAqXG4gICAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgICAqIFRlbGxzIGFuZ3VsYXItdHJhbnNsYXRlIHdoaWNoIGxhbmd1YWdlIHRvIHVzZSBieSBnaXZlbiBsYW5ndWFnZSBrZXkuIFRoaXMgbWV0aG9kIGlzXG4gICAgICAgKiB1c2VkIHRvIGNoYW5nZSBsYW5ndWFnZSBhdCBydW50aW1lLiBJdCBhbHNvIHRha2VzIGNhcmUgb2Ygc3RvcmluZyB0aGUgbGFuZ3VhZ2VcbiAgICAgICAqIGtleSBpbiBhIGNvbmZpZ3VyZWQgc3RvcmUgdG8gbGV0IHlvdXIgYXBwIHJlbWVtYmVyIHRoZSBjaG9vc2VkIGxhbmd1YWdlLlxuICAgICAgICpcbiAgICAgICAqIFdoZW4gdHJ5aW5nIHRvICd1c2UnIGEgbGFuZ3VhZ2Ugd2hpY2ggaXNuJ3QgYXZhaWxhYmxlIGl0IHRyaWVzIHRvIGxvYWQgaXRcbiAgICAgICAqIGFzeW5jaHJvbm91c2x5IHdpdGggcmVnaXN0ZXJlZCBsb2FkZXJzLlxuICAgICAgICpcbiAgICAgICAqIFJldHVybnMgcHJvbWlzZSBvYmplY3Qgd2l0aCBsb2FkZWQgbGFuZ3VhZ2UgZmlsZSBkYXRhXG4gICAgICAgKiBAZXhhbXBsZVxuICAgICAgICogJHRyYW5zbGF0ZS51c2UoXCJlbl9VU1wiKS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICogICAkc2NvcGUudGV4dCA9ICR0cmFuc2xhdGUoXCJIRUxMT1wiKTtcbiAgICAgICAqIH0pO1xuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgTGFuZ3VhZ2Uga2V5XG4gICAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IExhbmd1YWdlIGtleVxuICAgICAgICovXG4gICAgICAkdHJhbnNsYXRlLnVzZSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICByZXR1cm4gJHVzZXM7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICAgICRyb290U2NvcGUuJGVtaXQoJyR0cmFuc2xhdGVDaGFuZ2VTdGFydCcsIHtsYW5ndWFnZToga2V5fSk7XG5cbiAgICAgICAgLy8gVHJ5IHRvIGdldCB0aGUgYWxpYXNlZCBsYW5ndWFnZSBrZXlcbiAgICAgICAgdmFyIGFsaWFzZWRLZXkgPSBuZWdvdGlhdGVMb2NhbGUoa2V5KTtcbiAgICAgICAgaWYgKGFsaWFzZWRLZXkpIHtcbiAgICAgICAgICBrZXkgPSBhbGlhc2VkS2V5O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaWYgdGhlcmUgaXNuJ3QgYSB0cmFuc2xhdGlvbiB0YWJsZSBmb3IgdGhlIGxhbmd1YWdlIHdlJ3ZlIHJlcXVlc3RlZCxcbiAgICAgICAgLy8gd2UgbG9hZCBpdCBhc3luY2hyb25vdXNseVxuICAgICAgICBpZiAoISR0cmFuc2xhdGlvblRhYmxlW2tleV0gJiYgJGxvYWRlckZhY3RvcnkgJiYgIWxhbmdQcm9taXNlc1trZXldKSB7XG4gICAgICAgICAgJG5leHRMYW5nID0ga2V5O1xuICAgICAgICAgIGxhbmdQcm9taXNlc1trZXldID0gbG9hZEFzeW5jKGtleSkudGhlbihmdW5jdGlvbiAodHJhbnNsYXRpb24pIHtcbiAgICAgICAgICAgIHRyYW5zbGF0aW9ucyh0cmFuc2xhdGlvbi5rZXksIHRyYW5zbGF0aW9uLnRhYmxlKTtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUodHJhbnNsYXRpb24ua2V5KTtcblxuICAgICAgICAgICAgdXNlTGFuZ3VhZ2UodHJhbnNsYXRpb24ua2V5KTtcbiAgICAgICAgICAgIGlmICgkbmV4dExhbmcgPT09IGtleSkge1xuICAgICAgICAgICAgICAkbmV4dExhbmcgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJhbnNsYXRpb247XG4gICAgICAgICAgfSwgZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgaWYgKCRuZXh0TGFuZyA9PT0ga2V5KSB7XG4gICAgICAgICAgICAgICRuZXh0TGFuZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICRyb290U2NvcGUuJGVtaXQoJyR0cmFuc2xhdGVDaGFuZ2VFcnJvcicsIHtsYW5ndWFnZToga2V5fSk7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZWplY3Qoa2V5KTtcbiAgICAgICAgICAgICRyb290U2NvcGUuJGVtaXQoJyR0cmFuc2xhdGVDaGFuZ2VFbmQnLCB7bGFuZ3VhZ2U6IGtleX0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoa2V5KTtcbiAgICAgICAgICB1c2VMYW5ndWFnZShrZXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICB9O1xuXG4gICAgICAvKipcbiAgICAgICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgICAgICogQG5hbWUgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlI3N0b3JhZ2VLZXlcbiAgICAgICAqIEBtZXRob2RPZiBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVcbiAgICAgICAqXG4gICAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgICAqIFJldHVybnMgdGhlIGtleSBmb3IgdGhlIHN0b3JhZ2UuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybiB7c3RyaW5nfSBzdG9yYWdlIGtleVxuICAgICAgICovXG4gICAgICAkdHJhbnNsYXRlLnN0b3JhZ2VLZXkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBzdG9yYWdlS2V5KCk7XG4gICAgICB9O1xuXG4gICAgICAvKipcbiAgICAgICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgICAgICogQG5hbWUgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlI2lzUG9zdENvbXBpbGluZ0VuYWJsZWRcbiAgICAgICAqIEBtZXRob2RPZiBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVcbiAgICAgICAqXG4gICAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgICAqIFJldHVybnMgd2hldGhlciBwb3N0IGNvbXBpbGluZyBpcyBlbmFibGVkIG9yIG5vdFxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm4ge2Jvb2x9IHN0b3JhZ2Uga2V5XG4gICAgICAgKi9cbiAgICAgICR0cmFuc2xhdGUuaXNQb3N0Q29tcGlsaW5nRW5hYmxlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICRwb3N0Q29tcGlsaW5nRW5hYmxlZDtcbiAgICAgIH07XG5cbiAgICAgIC8qKlxuICAgICAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAgICAgKiBAbmFtZSBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGUjcmVmcmVzaFxuICAgICAgICogQG1ldGhvZE9mIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVxuICAgICAgICpcbiAgICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAgICogUmVmcmVzaGVzIGEgdHJhbnNsYXRpb24gdGFibGUgcG9pbnRlZCBieSB0aGUgZ2l2ZW4gbGFuZ0tleS4gSWYgbGFuZ0tleSBpcyBub3Qgc3BlY2lmaWVkLFxuICAgICAgICogdGhlIG1vZHVsZSB3aWxsIGRyb3AgYWxsIGV4aXN0ZW50IHRyYW5zbGF0aW9uIHRhYmxlcyBhbmQgbG9hZCBuZXcgdmVyc2lvbiBvZiB0aG9zZSB3aGljaFxuICAgICAgICogYXJlIGN1cnJlbnRseSBpbiB1c2UuXG4gICAgICAgKlxuICAgICAgICogUmVmcmVzaCBtZWFucyB0aGF0IHRoZSBtb2R1bGUgd2lsbCBkcm9wIHRhcmdldCB0cmFuc2xhdGlvbiB0YWJsZSBhbmQgdHJ5IHRvIGxvYWQgaXQgYWdhaW4uXG4gICAgICAgKlxuICAgICAgICogSW4gY2FzZSB0aGVyZSBhcmUgbm8gbG9hZGVycyByZWdpc3RlcmVkIHRoZSByZWZyZXNoKCkgbWV0aG9kIHdpbGwgdGhyb3cgYW4gRXJyb3IuXG4gICAgICAgKlxuICAgICAgICogSWYgdGhlIG1vZHVsZSBpcyBhYmxlIHRvIHJlZnJlc2ggdHJhbnNsYXRpb24gdGFibGVzIHJlZnJlc2goKSBtZXRob2Qgd2lsbCBicm9hZGNhc3RcbiAgICAgICAqICR0cmFuc2xhdGVSZWZyZXNoU3RhcnQgYW5kICR0cmFuc2xhdGVSZWZyZXNoRW5kIGV2ZW50cy5cbiAgICAgICAqXG4gICAgICAgKiBAZXhhbXBsZVxuICAgICAgICogLy8gdGhpcyB3aWxsIGRyb3AgYWxsIGN1cnJlbnRseSBleGlzdGVudCB0cmFuc2xhdGlvbiB0YWJsZXMgYW5kIHJlbG9hZCB0aG9zZSB3aGljaCBhcmVcbiAgICAgICAqIC8vIGN1cnJlbnRseSBpbiB1c2VcbiAgICAgICAqICR0cmFuc2xhdGUucmVmcmVzaCgpO1xuICAgICAgICogLy8gdGhpcyB3aWxsIHJlZnJlc2ggYSB0cmFuc2xhdGlvbiB0YWJsZSBmb3IgdGhlIGVuX1VTIGxhbmd1YWdlXG4gICAgICAgKiAkdHJhbnNsYXRlLnJlZnJlc2goJ2VuX1VTJyk7XG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGxhbmdLZXkgQSBsYW5ndWFnZSBrZXkgb2YgdGhlIHRhYmxlLCB3aGljaCBoYXMgdG8gYmUgcmVmcmVzaGVkXG4gICAgICAgKlxuICAgICAgICogQHJldHVybiB7cHJvbWlzZX0gUHJvbWlzZSwgd2hpY2ggd2lsbCBiZSByZXNvbHZlZCBpbiBjYXNlIGEgdHJhbnNsYXRpb24gdGFibGVzIHJlZnJlc2hpbmdcbiAgICAgICAqIHByb2Nlc3MgaXMgZmluaXNoZWQgc3VjY2Vzc2Z1bGx5LCBhbmQgcmVqZWN0IGlmIG5vdC5cbiAgICAgICAqL1xuICAgICAgJHRyYW5zbGF0ZS5yZWZyZXNoID0gZnVuY3Rpb24gKGxhbmdLZXkpIHtcbiAgICAgICAgaWYgKCEkbG9hZGVyRmFjdG9yeSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGRuXFwndCByZWZyZXNoIHRyYW5zbGF0aW9uIHRhYmxlLCBubyBsb2FkZXIgcmVnaXN0ZXJlZCEnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgICAgZnVuY3Rpb24gcmVzb2x2ZSgpIHtcbiAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XG4gICAgICAgICAgJHJvb3RTY29wZS4kZW1pdCgnJHRyYW5zbGF0ZVJlZnJlc2hFbmQnLCB7bGFuZ3VhZ2U6IGxhbmdLZXl9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdCgpIHtcbiAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcbiAgICAgICAgICAkcm9vdFNjb3BlLiRlbWl0KCckdHJhbnNsYXRlUmVmcmVzaEVuZCcsIHtsYW5ndWFnZTogbGFuZ0tleX0pO1xuICAgICAgICB9XG5cbiAgICAgICAgJHJvb3RTY29wZS4kZW1pdCgnJHRyYW5zbGF0ZVJlZnJlc2hTdGFydCcsIHtsYW5ndWFnZTogbGFuZ0tleX0pO1xuXG4gICAgICAgIGlmICghbGFuZ0tleSkge1xuICAgICAgICAgIC8vIGlmIHRoZXJlJ3Mgbm8gbGFuZ3VhZ2Uga2V5IHNwZWNpZmllZCB3ZSByZWZyZXNoIEFMTCBUSEUgVEhJTkdTIVxuICAgICAgICAgIHZhciB0YWJsZXMgPSBbXSwgbG9hZGluZ0tleXMgPSB7fTtcblxuICAgICAgICAgIC8vIHJlbG9hZCByZWdpc3RlcmVkIGZhbGxiYWNrIGxhbmd1YWdlc1xuICAgICAgICAgIGlmICgkZmFsbGJhY2tMYW5ndWFnZSAmJiAkZmFsbGJhY2tMYW5ndWFnZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSAkZmFsbGJhY2tMYW5ndWFnZS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICB0YWJsZXMucHVzaChsb2FkQXN5bmMoJGZhbGxiYWNrTGFuZ3VhZ2VbaV0pKTtcbiAgICAgICAgICAgICAgbG9hZGluZ0tleXNbJGZhbGxiYWNrTGFuZ3VhZ2VbaV1dID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyByZWxvYWQgY3VycmVudGx5IHVzZWQgbGFuZ3VhZ2VcbiAgICAgICAgICBpZiAoJHVzZXMgJiYgIWxvYWRpbmdLZXlzWyR1c2VzXSkge1xuICAgICAgICAgICAgdGFibGVzLnB1c2gobG9hZEFzeW5jKCR1c2VzKSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgJHEuYWxsKHRhYmxlcykudGhlbihmdW5jdGlvbiAodGFibGVEYXRhKSB7XG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2godGFibGVEYXRhLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICBpZiAoJHRyYW5zbGF0aW9uVGFibGVbZGF0YS5rZXldKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlICR0cmFuc2xhdGlvblRhYmxlW2RhdGEua2V5XTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB0cmFuc2xhdGlvbnMoZGF0YS5rZXksIGRhdGEudGFibGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoJHVzZXMpIHtcbiAgICAgICAgICAgICAgdXNlTGFuZ3VhZ2UoJHVzZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoJHRyYW5zbGF0aW9uVGFibGVbbGFuZ0tleV0pIHtcblxuICAgICAgICAgIGxvYWRBc3luYyhsYW5nS2V5KS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICB0cmFuc2xhdGlvbnMoZGF0YS5rZXksIGRhdGEudGFibGUpO1xuICAgICAgICAgICAgaWYgKGxhbmdLZXkgPT09ICR1c2VzKSB7XG4gICAgICAgICAgICAgIHVzZUxhbmd1YWdlKCR1c2VzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICB9LCByZWplY3QpO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVqZWN0KCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICB9O1xuXG4gICAgICAvKipcbiAgICAgICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgICAgICogQG5hbWUgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlI2luc3RhbnRcbiAgICAgICAqIEBtZXRob2RPZiBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVcbiAgICAgICAqXG4gICAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgICAqIFJldHVybnMgYSB0cmFuc2xhdGlvbiBpbnN0YW50bHkgZnJvbSB0aGUgaW50ZXJuYWwgc3RhdGUgb2YgbG9hZGVkIHRyYW5zbGF0aW9uLiBBbGwgcnVsZXNcbiAgICAgICAqIHJlZ2FyZGluZyB0aGUgY3VycmVudCBsYW5ndWFnZSwgdGhlIHByZWZlcnJlZCBsYW5ndWFnZSBvZiBldmVuIGZhbGxiYWNrIGxhbmd1YWdlcyB3aWxsIGJlXG4gICAgICAgKiB1c2VkIGV4Y2VwdCBhbnkgcHJvbWlzZSBoYW5kbGluZy4gSWYgYSBsYW5ndWFnZSB3YXMgbm90IGZvdW5kLCBhbiBhc3luY2hyb25vdXMgbG9hZGluZ1xuICAgICAgICogd2lsbCBiZSBpbnZva2VkIGluIHRoZSBiYWNrZ3JvdW5kLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfGFycmF5fSB0cmFuc2xhdGlvbklkIEEgdG9rZW4gd2hpY2ggcmVwcmVzZW50cyBhIHRyYW5zbGF0aW9uIGlkXG4gICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUaGlzIGNhbiBiZSBvcHRpb25hbGx5IGFuIGFycmF5IG9mIHRyYW5zbGF0aW9uIGlkcyB3aGljaFxuICAgICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cyB0aGF0IHRoZSBmdW5jdGlvbidzIHByb21pc2UgcmV0dXJucyBhbiBvYmplY3Qgd2hlcmVcbiAgICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhY2gga2V5IGlzIHRoZSB0cmFuc2xhdGlvbiBpZCBhbmQgdGhlIHZhbHVlIHRoZSB0cmFuc2xhdGlvbi5cbiAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBpbnRlcnBvbGF0ZVBhcmFtcyBQYXJhbXNcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpbnRlcnBvbGF0aW9uSWQgVGhlIGlkIG9mIHRoZSBpbnRlcnBvbGF0aW9uIHRvIHVzZVxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm4ge3N0cmluZ30gdHJhbnNsYXRpb25cbiAgICAgICAqL1xuICAgICAgJHRyYW5zbGF0ZS5pbnN0YW50ID0gZnVuY3Rpb24gKHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zLCBpbnRlcnBvbGF0aW9uSWQpIHtcblxuICAgICAgICAvLyBEZXRlY3QgdW5kZWZpbmVkIGFuZCBudWxsIHZhbHVlcyB0byBzaG9ydGVuIHRoZSBleGVjdXRpb24gYW5kIHByZXZlbnQgZXhjZXB0aW9uc1xuICAgICAgICBpZiAodHJhbnNsYXRpb25JZCA9PT0gbnVsbCB8fCBhbmd1bGFyLmlzVW5kZWZpbmVkKHRyYW5zbGF0aW9uSWQpKSB7XG4gICAgICAgICAgcmV0dXJuIHRyYW5zbGF0aW9uSWQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEdWNrIGRldGVjdGlvbjogSWYgdGhlIGZpcnN0IGFyZ3VtZW50IGlzIGFuIGFycmF5LCBhIGJ1bmNoIG9mIHRyYW5zbGF0aW9ucyB3YXMgcmVxdWVzdGVkLlxuICAgICAgICAvLyBUaGUgcmVzdWx0IGlzIGFuIG9iamVjdC5cbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNBcnJheSh0cmFuc2xhdGlvbklkKSkge1xuICAgICAgICAgIHZhciByZXN1bHRzID0ge307XG4gICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGMgPSB0cmFuc2xhdGlvbklkLmxlbmd0aDsgaSA8IGM7IGkrKykge1xuICAgICAgICAgICAgcmVzdWx0c1t0cmFuc2xhdGlvbklkW2ldXSA9ICR0cmFuc2xhdGUuaW5zdGFudCh0cmFuc2xhdGlvbklkW2ldLCBpbnRlcnBvbGF0ZVBhcmFtcywgaW50ZXJwb2xhdGlvbklkKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBXZSBkaXNjYXJkZWQgdW5hY2NlcHRhYmxlIHZhbHVlcy4gU28gd2UganVzdCBuZWVkIHRvIHZlcmlmeSBpZiB0cmFuc2xhdGlvbklkIGlzIGVtcHR5IFN0cmluZ1xuICAgICAgICBpZiAoYW5ndWxhci5pc1N0cmluZyh0cmFuc2xhdGlvbklkKSAmJiB0cmFuc2xhdGlvbklkLmxlbmd0aCA8IDEpIHtcbiAgICAgICAgICByZXR1cm4gdHJhbnNsYXRpb25JZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHRyaW0gb2ZmIGFueSB3aGl0ZXNwYWNlXG4gICAgICAgIGlmICh0cmFuc2xhdGlvbklkKSB7XG4gICAgICAgICAgdHJhbnNsYXRpb25JZCA9IHRyaW0uYXBwbHkodHJhbnNsYXRpb25JZCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmVzdWx0LCBwb3NzaWJsZUxhbmdLZXlzID0gW107XG4gICAgICAgIGlmICgkcHJlZmVycmVkTGFuZ3VhZ2UpIHtcbiAgICAgICAgICBwb3NzaWJsZUxhbmdLZXlzLnB1c2goJHByZWZlcnJlZExhbmd1YWdlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoJHVzZXMpIHtcbiAgICAgICAgICBwb3NzaWJsZUxhbmdLZXlzLnB1c2goJHVzZXMpO1xuICAgICAgICB9XG4gICAgICAgIGlmICgkZmFsbGJhY2tMYW5ndWFnZSAmJiAkZmFsbGJhY2tMYW5ndWFnZS5sZW5ndGgpIHtcbiAgICAgICAgICBwb3NzaWJsZUxhbmdLZXlzID0gcG9zc2libGVMYW5nS2V5cy5jb25jYXQoJGZhbGxiYWNrTGFuZ3VhZ2UpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIGogPSAwLCBkID0gcG9zc2libGVMYW5nS2V5cy5sZW5ndGg7IGogPCBkOyBqKyspIHtcbiAgICAgICAgICB2YXIgcG9zc2libGVMYW5nS2V5ID0gcG9zc2libGVMYW5nS2V5c1tqXTtcbiAgICAgICAgICBpZiAoJHRyYW5zbGF0aW9uVGFibGVbcG9zc2libGVMYW5nS2V5XSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiAkdHJhbnNsYXRpb25UYWJsZVtwb3NzaWJsZUxhbmdLZXldW3RyYW5zbGF0aW9uSWRdICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICByZXN1bHQgPSBkZXRlcm1pbmVUcmFuc2xhdGlvbkluc3RhbnQodHJhbnNsYXRpb25JZCwgaW50ZXJwb2xhdGVQYXJhbXMsIGludGVycG9sYXRpb25JZCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCRub3RGb3VuZEluZGljYXRvckxlZnQgfHwgJG5vdEZvdW5kSW5kaWNhdG9yUmlnaHQpIHtcbiAgICAgICAgICAgICAgcmVzdWx0ID0gYXBwbHlOb3RGb3VuZEluZGljYXRvcnModHJhbnNsYXRpb25JZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0eXBlb2YgcmVzdWx0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFyZXN1bHQgJiYgcmVzdWx0ICE9PSAnJykge1xuICAgICAgICAgIC8vIFJldHVybiB0cmFuc2xhdGlvbiBvZiBkZWZhdWx0IGludGVycG9sYXRvciBpZiBub3QgZm91bmQgYW55dGhpbmcuXG4gICAgICAgICAgcmVzdWx0ID0gZGVmYXVsdEludGVycG9sYXRvci5pbnRlcnBvbGF0ZSh0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcyk7XG4gICAgICAgICAgaWYgKCRtaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyRmFjdG9yeSAmJiAhcGVuZGluZ0xvYWRlcikge1xuICAgICAgICAgICAgcmVzdWx0ID0gdHJhbnNsYXRlQnlIYW5kbGVyKHRyYW5zbGF0aW9uSWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9O1xuXG4gICAgICAvKipcbiAgICAgICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgICAgICogQG5hbWUgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlI3ZlcnNpb25JbmZvXG4gICAgICAgKiBAbWV0aG9kT2YgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlXG4gICAgICAgKlxuICAgICAgICogQGRlc2NyaXB0aW9uXG4gICAgICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50IHZlcnNpb24gaW5mb3JtYXRpb24gZm9yIHRoZSBhbmd1bGFyLXRyYW5zbGF0ZSBsaWJyYXJ5XG4gICAgICAgKlxuICAgICAgICogQHJldHVybiB7c3RyaW5nfSBhbmd1bGFyLXRyYW5zbGF0ZSB2ZXJzaW9uXG4gICAgICAgKi9cbiAgICAgICR0cmFuc2xhdGUudmVyc2lvbkluZm8gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB2ZXJzaW9uO1xuICAgICAgfTtcblxuICAgICAgLyoqXG4gICAgICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICAgICAqIEBuYW1lIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZSNsb2FkZXJDYWNoZVxuICAgICAgICogQG1ldGhvZE9mIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVxuICAgICAgICpcbiAgICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAgICogUmV0dXJucyB0aGUgZGVmaW5lZCBsb2FkZXJDYWNoZS5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJuIHtib29sZWFufHN0cmluZ3xvYmplY3R9IGN1cnJlbnQgdmFsdWUgb2YgbG9hZGVyQ2FjaGVcbiAgICAgICAqL1xuICAgICAgJHRyYW5zbGF0ZS5sb2FkZXJDYWNoZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGxvYWRlckNhY2hlO1xuICAgICAgfTtcblxuICAgICAgLy8gaW50ZXJuYWwgcHVycG9zZSBvbmx5XG4gICAgICAkdHJhbnNsYXRlLmRpcmVjdGl2ZVByaW9yaXR5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gZGlyZWN0aXZlUHJpb3JpdHk7XG4gICAgICB9O1xuXG4gICAgICBpZiAoJGxvYWRlckZhY3RvcnkpIHtcblxuICAgICAgICAvLyBJZiBhdCBsZWFzdCBvbmUgYXN5bmMgbG9hZGVyIGlzIGRlZmluZWQgYW5kIHRoZXJlIGFyZSBub1xuICAgICAgICAvLyAoZGVmYXVsdCkgdHJhbnNsYXRpb25zIGF2YWlsYWJsZSB3ZSBzaG91bGQgdHJ5IHRvIGxvYWQgdGhlbS5cbiAgICAgICAgaWYgKGFuZ3VsYXIuZXF1YWxzKCR0cmFuc2xhdGlvblRhYmxlLCB7fSkpIHtcbiAgICAgICAgICAkdHJhbnNsYXRlLnVzZSgkdHJhbnNsYXRlLnVzZSgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFsc28sIGlmIHRoZXJlIGFyZSBhbnkgZmFsbGJhY2sgbGFuZ3VhZ2UgcmVnaXN0ZXJlZCwgd2Ugc3RhcnRcbiAgICAgICAgLy8gbG9hZGluZyB0aGVtIGFzeW5jaHJvbm91c2x5IGFzIHNvb24gYXMgd2UgY2FuLlxuICAgICAgICBpZiAoJGZhbGxiYWNrTGFuZ3VhZ2UgJiYgJGZhbGxiYWNrTGFuZ3VhZ2UubGVuZ3RoKSB7XG4gICAgICAgICAgdmFyIHByb2Nlc3NBc3luY1Jlc3VsdCA9IGZ1bmN0aW9uICh0cmFuc2xhdGlvbikge1xuICAgICAgICAgICAgdHJhbnNsYXRpb25zKHRyYW5zbGF0aW9uLmtleSwgdHJhbnNsYXRpb24udGFibGUpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kZW1pdCgnJHRyYW5zbGF0ZUNoYW5nZUVuZCcsIHsgbGFuZ3VhZ2U6IHRyYW5zbGF0aW9uLmtleSB9KTtcbiAgICAgICAgICAgIHJldHVybiB0cmFuc2xhdGlvbjtcbiAgICAgICAgICB9O1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSAkZmFsbGJhY2tMYW5ndWFnZS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgbGFuZ1Byb21pc2VzWyRmYWxsYmFja0xhbmd1YWdlW2ldXSA9IGxvYWRBc3luYygkZmFsbGJhY2tMYW5ndWFnZVtpXSkudGhlbihwcm9jZXNzQXN5bmNSZXN1bHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gJHRyYW5zbGF0ZTtcbiAgICB9XG4gIF07XG59XSk7XG5cbi8qKlxuICogQG5nZG9jIG9iamVjdFxuICogQG5hbWUgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlRGVmYXVsdEludGVycG9sYXRpb25cbiAqIEByZXF1aXJlcyAkaW50ZXJwb2xhdGVcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIFVzZXMgYW5ndWxhcidzIGAkaW50ZXJwb2xhdGVgIHNlcnZpY2VzIHRvIGludGVycG9sYXRlIHN0cmluZ3MgYWdhaW5zdCBzb21lIHZhbHVlcy5cbiAqXG4gKiBAcmV0dXJuIHtvYmplY3R9ICR0cmFuc2xhdGVJbnRlcnBvbGF0b3IgSW50ZXJwb2xhdG9yIHNlcnZpY2VcbiAqL1xuYW5ndWxhci5tb2R1bGUoJ3Bhc2NhbHByZWNodC50cmFuc2xhdGUnKS5mYWN0b3J5KCckdHJhbnNsYXRlRGVmYXVsdEludGVycG9sYXRpb24nLCBbJyRpbnRlcnBvbGF0ZScsIGZ1bmN0aW9uICgkaW50ZXJwb2xhdGUpIHtcblxuICB2YXIgJHRyYW5zbGF0ZUludGVycG9sYXRvciA9IHt9LFxuICAgICAgJGxvY2FsZSxcbiAgICAgICRpZGVudGlmaWVyID0gJ2RlZmF1bHQnLFxuICAgICAgJHNhbml0aXplVmFsdWVTdHJhdGVneSA9IG51bGwsXG4gICAgICAvLyBtYXAgb2YgYWxsIHNhbml0aXplIHN0cmF0ZWdpZXNcbiAgICAgIHNhbml0aXplVmFsdWVTdHJhdGVnaWVzID0ge1xuICAgICAgICBlc2NhcGVkOiBmdW5jdGlvbiAocGFyYW1zKSB7XG4gICAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICAgICAgIGZvciAodmFyIGtleSBpbiBwYXJhbXMpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocGFyYW1zLCBrZXkpKSB7XG4gICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzTnVtYmVyKHBhcmFtc1trZXldKSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gcGFyYW1zW2tleV07XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gPSBhbmd1bGFyLmVsZW1lbnQoJzxkaXY+PC9kaXY+JykudGV4dChwYXJhbXNba2V5XSkuaHRtbCgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgdmFyIHNhbml0aXplUGFyYW1zID0gZnVuY3Rpb24gKHBhcmFtcykge1xuICAgIHZhciByZXN1bHQ7XG4gICAgaWYgKGFuZ3VsYXIuaXNGdW5jdGlvbihzYW5pdGl6ZVZhbHVlU3RyYXRlZ2llc1skc2FuaXRpemVWYWx1ZVN0cmF0ZWd5XSkpIHtcbiAgICAgIHJlc3VsdCA9IHNhbml0aXplVmFsdWVTdHJhdGVnaWVzWyRzYW5pdGl6ZVZhbHVlU3RyYXRlZ3ldKHBhcmFtcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdCA9IHBhcmFtcztcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvKipcbiAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAqIEBuYW1lIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZURlZmF1bHRJbnRlcnBvbGF0aW9uI3NldExvY2FsZVxuICAgKiBAbWV0aG9kT2YgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlRGVmYXVsdEludGVycG9sYXRpb25cbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFNldHMgY3VycmVudCBsb2NhbGUgKHRoaXMgaXMgY3VycmVudGx5IG5vdCB1c2UgaW4gdGhpcyBpbnRlcnBvbGF0aW9uKS5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGxvY2FsZSBMYW5ndWFnZSBrZXkgb3IgbG9jYWxlLlxuICAgKi9cbiAgJHRyYW5zbGF0ZUludGVycG9sYXRvci5zZXRMb2NhbGUgPSBmdW5jdGlvbiAobG9jYWxlKSB7XG4gICAgJGxvY2FsZSA9IGxvY2FsZTtcbiAgfTtcblxuICAvKipcbiAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAqIEBuYW1lIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZURlZmF1bHRJbnRlcnBvbGF0aW9uI2dldEludGVycG9sYXRpb25JZGVudGlmaWVyXG4gICAqIEBtZXRob2RPZiBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVEZWZhdWx0SW50ZXJwb2xhdGlvblxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogUmV0dXJucyBhbiBpZGVudGlmaWVyIGZvciB0aGlzIGludGVycG9sYXRpb24gc2VydmljZS5cbiAgICpcbiAgICogQHJldHVybnMge3N0cmluZ30gJGlkZW50aWZpZXJcbiAgICovXG4gICR0cmFuc2xhdGVJbnRlcnBvbGF0b3IuZ2V0SW50ZXJwb2xhdGlvbklkZW50aWZpZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICRpZGVudGlmaWVyO1xuICB9O1xuXG4gICR0cmFuc2xhdGVJbnRlcnBvbGF0b3IudXNlU2FuaXRpemVWYWx1ZVN0cmF0ZWd5ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgJHNhbml0aXplVmFsdWVTdHJhdGVneSA9IHZhbHVlO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICogQG5hbWUgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlRGVmYXVsdEludGVycG9sYXRpb24jaW50ZXJwb2xhdGVcbiAgICogQG1ldGhvZE9mIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZURlZmF1bHRJbnRlcnBvbGF0aW9uXG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBJbnRlcnBvbGF0ZXMgZ2l2ZW4gc3RyaW5nIGFnYWlucyBnaXZlbiBpbnRlcnBvbGF0ZSBwYXJhbXMgdXNpbmcgYW5ndWxhcnNcbiAgICogYCRpbnRlcnBvbGF0ZWAgc2VydmljZS5cbiAgICpcbiAgICogQHJldHVybnMge3N0cmluZ30gaW50ZXJwb2xhdGVkIHN0cmluZy5cbiAgICovXG4gICR0cmFuc2xhdGVJbnRlcnBvbGF0b3IuaW50ZXJwb2xhdGUgPSBmdW5jdGlvbiAoc3RyaW5nLCBpbnRlcnBvbGF0ZVBhcmFtcykge1xuICAgIGlmICgkc2FuaXRpemVWYWx1ZVN0cmF0ZWd5KSB7XG4gICAgICBpbnRlcnBvbGF0ZVBhcmFtcyA9IHNhbml0aXplUGFyYW1zKGludGVycG9sYXRlUGFyYW1zKTtcbiAgICB9XG4gICAgcmV0dXJuICRpbnRlcnBvbGF0ZShzdHJpbmcpKGludGVycG9sYXRlUGFyYW1zIHx8IHt9KTtcbiAgfTtcblxuICByZXR1cm4gJHRyYW5zbGF0ZUludGVycG9sYXRvcjtcbn1dKTtcblxuYW5ndWxhci5tb2R1bGUoJ3Bhc2NhbHByZWNodC50cmFuc2xhdGUnKS5jb25zdGFudCgnJFNUT1JBR0VfS0VZJywgJ05HX1RSQU5TTEFURV9MQU5HX0tFWScpO1xuXG5hbmd1bGFyLm1vZHVsZSgncGFzY2FscHJlY2h0LnRyYW5zbGF0ZScpXG4vKipcbiAqIEBuZ2RvYyBkaXJlY3RpdmVcbiAqIEBuYW1lIHBhc2NhbHByZWNodC50cmFuc2xhdGUuZGlyZWN0aXZlOnRyYW5zbGF0ZVxuICogQHJlcXVpcmVzICRjb21waWxlXG4gKiBAcmVxdWlyZXMgJGZpbHRlclxuICogQHJlcXVpcmVzICRpbnRlcnBvbGF0ZVxuICogQHJlc3RyaWN0IEFcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIFRyYW5zbGF0ZXMgZ2l2ZW4gdHJhbnNsYXRpb24gaWQgZWl0aGVyIHRocm91Z2ggYXR0cmlidXRlIG9yIERPTSBjb250ZW50LlxuICogSW50ZXJuYWxseSBpdCB1c2VzIGB0cmFuc2xhdGVgIGZpbHRlciB0byB0cmFuc2xhdGUgdHJhbnNsYXRpb24gaWQuIEl0IHBvc3NpYmxlIHRvXG4gKiBwYXNzIGFuIG9wdGlvbmFsIGB0cmFuc2xhdGUtdmFsdWVzYCBvYmplY3QgbGl0ZXJhbCBhcyBzdHJpbmcgaW50byB0cmFuc2xhdGlvbiBpZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZz19IHRyYW5zbGF0ZSBUcmFuc2xhdGlvbiBpZCB3aGljaCBjb3VsZCBiZSBlaXRoZXIgc3RyaW5nIG9yIGludGVycG9sYXRlZCBzdHJpbmcuXG4gKiBAcGFyYW0ge3N0cmluZz19IHRyYW5zbGF0ZS12YWx1ZXMgVmFsdWVzIHRvIHBhc3MgaW50byB0cmFuc2xhdGlvbiBpZC4gQ2FuIGJlIHBhc3NlZCBhcyBvYmplY3QgbGl0ZXJhbCBzdHJpbmcgb3IgaW50ZXJwb2xhdGVkIG9iamVjdC5cbiAqIEBwYXJhbSB7c3RyaW5nPX0gdHJhbnNsYXRlLWF0dHItQVRUUiB0cmFuc2xhdGUgVHJhbnNsYXRpb24gaWQgYW5kIHB1dCBpdCBpbnRvIEFUVFIgYXR0cmlidXRlLlxuICogQHBhcmFtIHtzdHJpbmc9fSB0cmFuc2xhdGUtZGVmYXVsdCB3aWxsIGJlIHVzZWQgdW5sZXNzIHRyYW5zbGF0aW9uIHdhcyBzdWNjZXNzZnVsXG4gKiBAcGFyYW0ge2Jvb2xlYW49fSB0cmFuc2xhdGUtY29tcGlsZSAoZGVmYXVsdCB0cnVlIGlmIHByZXNlbnQpIGRlZmluZXMgbG9jYWxseSBhY3RpdmF0aW9uIG9mIHtAbGluayBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGUjdXNlUG9zdENvbXBpbGluZ31cbiAqXG4gKiBAZXhhbXBsZVxuICAgPGV4YW1wbGUgbW9kdWxlPVwibmdWaWV3XCI+XG4gICAgPGZpbGUgbmFtZT1cImluZGV4Lmh0bWxcIj5cbiAgICAgIDxkaXYgbmctY29udHJvbGxlcj1cIlRyYW5zbGF0ZUN0cmxcIj5cblxuICAgICAgICA8cHJlIHRyYW5zbGF0ZT1cIlRSQU5TTEFUSU9OX0lEXCI+PC9wcmU+XG4gICAgICAgIDxwcmUgdHJhbnNsYXRlPlRSQU5TTEFUSU9OX0lEPC9wcmU+XG4gICAgICAgIDxwcmUgdHJhbnNsYXRlIHRyYW5zbGF0ZS1hdHRyLXRpdGxlPVwiVFJBTlNMQVRJT05fSURcIj48L3ByZT5cbiAgICAgICAgPHByZSB0cmFuc2xhdGU9XCJ7e3RyYW5zbGF0aW9uSWR9fVwiPjwvcHJlPlxuICAgICAgICA8cHJlIHRyYW5zbGF0ZT57e3RyYW5zbGF0aW9uSWR9fTwvcHJlPlxuICAgICAgICA8cHJlIHRyYW5zbGF0ZT1cIldJVEhfVkFMVUVTXCIgdHJhbnNsYXRlLXZhbHVlcz1cInt2YWx1ZTogNX1cIj48L3ByZT5cbiAgICAgICAgPHByZSB0cmFuc2xhdGUgdHJhbnNsYXRlLXZhbHVlcz1cInt2YWx1ZTogNX1cIj5XSVRIX1ZBTFVFUzwvcHJlPlxuICAgICAgICA8cHJlIHRyYW5zbGF0ZT1cIldJVEhfVkFMVUVTXCIgdHJhbnNsYXRlLXZhbHVlcz1cInt7dmFsdWVzfX1cIj48L3ByZT5cbiAgICAgICAgPHByZSB0cmFuc2xhdGUgdHJhbnNsYXRlLXZhbHVlcz1cInt7dmFsdWVzfX1cIj5XSVRIX1ZBTFVFUzwvcHJlPlxuICAgICAgICA8cHJlIHRyYW5zbGF0ZSB0cmFuc2xhdGUtYXR0ci10aXRsZT1cIldJVEhfVkFMVUVTXCIgdHJhbnNsYXRlLXZhbHVlcz1cInt7dmFsdWVzfX1cIj48L3ByZT5cblxuICAgICAgPC9kaXY+XG4gICAgPC9maWxlPlxuICAgIDxmaWxlIG5hbWU9XCJzY3JpcHQuanNcIj5cbiAgICAgIGFuZ3VsYXIubW9kdWxlKCduZ1ZpZXcnLCBbJ3Bhc2NhbHByZWNodC50cmFuc2xhdGUnXSlcblxuICAgICAgLmNvbmZpZyhmdW5jdGlvbiAoJHRyYW5zbGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAgICAgJHRyYW5zbGF0ZVByb3ZpZGVyLnRyYW5zbGF0aW9ucygnZW4nLHtcbiAgICAgICAgICAnVFJBTlNMQVRJT05fSUQnOiAnSGVsbG8gdGhlcmUhJyxcbiAgICAgICAgICAnV0lUSF9WQUxVRVMnOiAnVGhlIGZvbGxvd2luZyB2YWx1ZSBpcyBkeW5hbWljOiB7e3ZhbHVlfX0nXG4gICAgICAgIH0pLnByZWZlcnJlZExhbmd1YWdlKCdlbicpO1xuXG4gICAgICB9KTtcblxuICAgICAgYW5ndWxhci5tb2R1bGUoJ25nVmlldycpLmNvbnRyb2xsZXIoJ1RyYW5zbGF0ZUN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlKSB7XG4gICAgICAgICRzY29wZS50cmFuc2xhdGlvbklkID0gJ1RSQU5TTEFUSU9OX0lEJztcblxuICAgICAgICAkc2NvcGUudmFsdWVzID0ge1xuICAgICAgICAgIHZhbHVlOiA3OFxuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgPC9maWxlPlxuICAgIDxmaWxlIG5hbWU9XCJzY2VuYXJpby5qc1wiPlxuICAgICAgaXQoJ3Nob3VsZCB0cmFuc2xhdGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGluamVjdChmdW5jdGlvbiAoJHJvb3RTY29wZSwgJGNvbXBpbGUpIHtcbiAgICAgICAgICAkcm9vdFNjb3BlLnRyYW5zbGF0aW9uSWQgPSAnVFJBTlNMQVRJT05fSUQnO1xuXG4gICAgICAgICAgZWxlbWVudCA9ICRjb21waWxlKCc8cCB0cmFuc2xhdGU9XCJUUkFOU0xBVElPTl9JRFwiPjwvcD4nKSgkcm9vdFNjb3BlKTtcbiAgICAgICAgICAkcm9vdFNjb3BlLiRkaWdlc3QoKTtcbiAgICAgICAgICBleHBlY3QoZWxlbWVudC50ZXh0KCkpLnRvQmUoJ0hlbGxvIHRoZXJlIScpO1xuXG4gICAgICAgICAgZWxlbWVudCA9ICRjb21waWxlKCc8cCB0cmFuc2xhdGU9XCJ7e3RyYW5zbGF0aW9uSWR9fVwiPjwvcD4nKSgkcm9vdFNjb3BlKTtcbiAgICAgICAgICAkcm9vdFNjb3BlLiRkaWdlc3QoKTtcbiAgICAgICAgICBleHBlY3QoZWxlbWVudC50ZXh0KCkpLnRvQmUoJ0hlbGxvIHRoZXJlIScpO1xuXG4gICAgICAgICAgZWxlbWVudCA9ICRjb21waWxlKCc8cCB0cmFuc2xhdGU+VFJBTlNMQVRJT05fSUQ8L3A+JykoJHJvb3RTY29wZSk7XG4gICAgICAgICAgJHJvb3RTY29wZS4kZGlnZXN0KCk7XG4gICAgICAgICAgZXhwZWN0KGVsZW1lbnQudGV4dCgpKS50b0JlKCdIZWxsbyB0aGVyZSEnKTtcblxuICAgICAgICAgIGVsZW1lbnQgPSAkY29tcGlsZSgnPHAgdHJhbnNsYXRlPnt7dHJhbnNsYXRpb25JZH19PC9wPicpKCRyb290U2NvcGUpO1xuICAgICAgICAgICRyb290U2NvcGUuJGRpZ2VzdCgpO1xuICAgICAgICAgIGV4cGVjdChlbGVtZW50LnRleHQoKSkudG9CZSgnSGVsbG8gdGhlcmUhJyk7XG5cbiAgICAgICAgICBlbGVtZW50ID0gJGNvbXBpbGUoJzxwIHRyYW5zbGF0ZSB0cmFuc2xhdGUtYXR0ci10aXRsZT1cIlRSQU5TTEFUSU9OX0lEXCI+PC9wPicpKCRyb290U2NvcGUpO1xuICAgICAgICAgICRyb290U2NvcGUuJGRpZ2VzdCgpO1xuICAgICAgICAgIGV4cGVjdChlbGVtZW50LmF0dHIoJ3RpdGxlJykpLnRvQmUoJ0hlbGxvIHRoZXJlIScpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIDwvZmlsZT5cbiAgIDwvZXhhbXBsZT5cbiAqL1xuLmRpcmVjdGl2ZSgndHJhbnNsYXRlJywgWyckdHJhbnNsYXRlJywgJyRxJywgJyRpbnRlcnBvbGF0ZScsICckY29tcGlsZScsICckcGFyc2UnLCAnJHJvb3RTY29wZScsIGZ1bmN0aW9uICgkdHJhbnNsYXRlLCAkcSwgJGludGVycG9sYXRlLCAkY29tcGlsZSwgJHBhcnNlLCAkcm9vdFNjb3BlKSB7XG5cbiAgLyoqXG4gICAqIEBuYW1lIHRyaW1cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIHRyaW0gcG9seWZpbGxcbiAgICpcbiAgICogQHJldHVybnMge3N0cmluZ30gVGhlIHN0cmluZyBzdHJpcHBlZCBvZiB3aGl0ZXNwYWNlIGZyb20gYm90aCBlbmRzXG4gICAqL1xuICB2YXIgdHJpbSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnQUUnLFxuICAgIHNjb3BlOiB0cnVlLFxuICAgIHByaW9yaXR5OiAkdHJhbnNsYXRlLmRpcmVjdGl2ZVByaW9yaXR5KCksXG4gICAgY29tcGlsZTogZnVuY3Rpb24gKHRFbGVtZW50LCB0QXR0cikge1xuXG4gICAgICB2YXIgdHJhbnNsYXRlVmFsdWVzRXhpc3QgPSAodEF0dHIudHJhbnNsYXRlVmFsdWVzKSA/XG4gICAgICAgIHRBdHRyLnRyYW5zbGF0ZVZhbHVlcyA6IHVuZGVmaW5lZDtcblxuICAgICAgdmFyIHRyYW5zbGF0ZUludGVycG9sYXRpb24gPSAodEF0dHIudHJhbnNsYXRlSW50ZXJwb2xhdGlvbikgP1xuICAgICAgICB0QXR0ci50cmFuc2xhdGVJbnRlcnBvbGF0aW9uIDogdW5kZWZpbmVkO1xuXG4gICAgICB2YXIgdHJhbnNsYXRlVmFsdWVFeGlzdCA9IHRFbGVtZW50WzBdLm91dGVySFRNTC5tYXRjaCgvdHJhbnNsYXRlLXZhbHVlLSsvaSk7XG5cbiAgICAgIHZhciBpbnRlcnBvbGF0ZVJlZ0V4cCA9ICdeKC4qKSgnICsgJGludGVycG9sYXRlLnN0YXJ0U3ltYm9sKCkgKyAnLionICsgJGludGVycG9sYXRlLmVuZFN5bWJvbCgpICsgJykoLiopJyxcbiAgICAgICAgICB3YXRjaGVyUmVnRXhwID0gJ14oLiopJyArICRpbnRlcnBvbGF0ZS5zdGFydFN5bWJvbCgpICsgJyguKiknICsgJGludGVycG9sYXRlLmVuZFN5bWJvbCgpICsgJyguKiknO1xuXG4gICAgICByZXR1cm4gZnVuY3Rpb24gbGlua0ZuKHNjb3BlLCBpRWxlbWVudCwgaUF0dHIpIHtcblxuICAgICAgICBzY29wZS5pbnRlcnBvbGF0ZVBhcmFtcyA9IHt9O1xuICAgICAgICBzY29wZS5wcmVUZXh0ID0gJyc7XG4gICAgICAgIHNjb3BlLnBvc3RUZXh0ID0gJyc7XG4gICAgICAgIHZhciB0cmFuc2xhdGlvbklkcyA9IHt9O1xuXG4gICAgICAgIC8vIEVuc3VyZXMgYW55IGNoYW5nZSBvZiB0aGUgYXR0cmlidXRlIFwidHJhbnNsYXRlXCIgY29udGFpbmluZyB0aGUgaWQgd2lsbFxuICAgICAgICAvLyBiZSByZS1zdG9yZWQgdG8gdGhlIHNjb3BlJ3MgXCJ0cmFuc2xhdGlvbklkXCIuXG4gICAgICAgIC8vIElmIHRoZSBhdHRyaWJ1dGUgaGFzIG5vIGNvbnRlbnQsIHRoZSBlbGVtZW50J3MgdGV4dCB2YWx1ZSAod2hpdGUgc3BhY2VzIHRyaW1tZWQgb2ZmKSB3aWxsIGJlIHVzZWQuXG4gICAgICAgIHZhciBvYnNlcnZlRWxlbWVudFRyYW5zbGF0aW9uID0gZnVuY3Rpb24gKHRyYW5zbGF0aW9uSWQpIHtcblxuICAgICAgICAgIC8vIFJlbW92ZSBhbnkgb2xkIHdhdGNoZXJcbiAgICAgICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKG9ic2VydmVFbGVtZW50VHJhbnNsYXRpb24uX3Vud2F0Y2hPbGQpKSB7XG4gICAgICAgICAgICBvYnNlcnZlRWxlbWVudFRyYW5zbGF0aW9uLl91bndhdGNoT2xkKCk7XG4gICAgICAgICAgICBvYnNlcnZlRWxlbWVudFRyYW5zbGF0aW9uLl91bndhdGNoT2xkID0gdW5kZWZpbmVkO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChhbmd1bGFyLmVxdWFscyh0cmFuc2xhdGlvbklkICwgJycpIHx8ICFhbmd1bGFyLmlzRGVmaW5lZCh0cmFuc2xhdGlvbklkKSkge1xuICAgICAgICAgICAgLy8gUmVzb2x2ZSB0cmFuc2xhdGlvbiBpZCBieSBpbm5lciBodG1sIGlmIHJlcXVpcmVkXG4gICAgICAgICAgICB2YXIgaW50ZXJwb2xhdGVNYXRjaGVzID0gdHJpbS5hcHBseShpRWxlbWVudC50ZXh0KCkpLm1hdGNoKGludGVycG9sYXRlUmVnRXhwKTtcbiAgICAgICAgICAgIC8vIEludGVycG9sYXRlIHRyYW5zbGF0aW9uIGlkIGlmIHJlcXVpcmVkXG4gICAgICAgICAgICBpZiAoYW5ndWxhci5pc0FycmF5KGludGVycG9sYXRlTWF0Y2hlcykpIHtcbiAgICAgICAgICAgICAgc2NvcGUucHJlVGV4dCA9IGludGVycG9sYXRlTWF0Y2hlc1sxXTtcbiAgICAgICAgICAgICAgc2NvcGUucG9zdFRleHQgPSBpbnRlcnBvbGF0ZU1hdGNoZXNbM107XG4gICAgICAgICAgICAgIHRyYW5zbGF0aW9uSWRzLnRyYW5zbGF0ZSA9ICRpbnRlcnBvbGF0ZShpbnRlcnBvbGF0ZU1hdGNoZXNbMl0pKHNjb3BlLiRwYXJlbnQpO1xuICAgICAgICAgICAgICB2YXIgd2F0Y2hlck1hdGNoZXMgPSBpRWxlbWVudC50ZXh0KCkubWF0Y2god2F0Y2hlclJlZ0V4cCk7XG4gICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzQXJyYXkod2F0Y2hlck1hdGNoZXMpICYmIHdhdGNoZXJNYXRjaGVzWzJdICYmIHdhdGNoZXJNYXRjaGVzWzJdLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIG9ic2VydmVFbGVtZW50VHJhbnNsYXRpb24uX3Vud2F0Y2hPbGQgPSBzY29wZS4kd2F0Y2god2F0Y2hlck1hdGNoZXNbMl0sIGZ1bmN0aW9uIChuZXdWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgdHJhbnNsYXRpb25JZHMudHJhbnNsYXRlID0gbmV3VmFsdWU7XG4gICAgICAgICAgICAgICAgICB1cGRhdGVUcmFuc2xhdGlvbnMoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdHJhbnNsYXRpb25JZHMudHJhbnNsYXRlID0gaUVsZW1lbnQudGV4dCgpLnJlcGxhY2UoL15cXHMrfFxccyskL2csJycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0cmFuc2xhdGlvbklkcy50cmFuc2xhdGUgPSB0cmFuc2xhdGlvbklkO1xuICAgICAgICAgIH1cbiAgICAgICAgICB1cGRhdGVUcmFuc2xhdGlvbnMoKTtcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgb2JzZXJ2ZUF0dHJpYnV0ZVRyYW5zbGF0aW9uID0gZnVuY3Rpb24gKHRyYW5zbGF0ZUF0dHIpIHtcbiAgICAgICAgICBpQXR0ci4kb2JzZXJ2ZSh0cmFuc2xhdGVBdHRyLCBmdW5jdGlvbiAodHJhbnNsYXRpb25JZCkge1xuICAgICAgICAgICAgdHJhbnNsYXRpb25JZHNbdHJhbnNsYXRlQXR0cl0gPSB0cmFuc2xhdGlvbklkO1xuICAgICAgICAgICAgdXBkYXRlVHJhbnNsYXRpb25zKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGZpcnN0QXR0cmlidXRlQ2hhbmdlZEV2ZW50ID0gdHJ1ZTtcbiAgICAgICAgaUF0dHIuJG9ic2VydmUoJ3RyYW5zbGF0ZScsIGZ1bmN0aW9uICh0cmFuc2xhdGlvbklkKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiB0cmFuc2xhdGlvbklkID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgLy8gY2FzZSBvZiBlbGVtZW50IFwiPHRyYW5zbGF0ZT54eXo8L3RyYW5zbGF0ZT5cIlxuICAgICAgICAgICAgb2JzZXJ2ZUVsZW1lbnRUcmFuc2xhdGlvbignJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGNhc2Ugb2YgcmVndWxhciBhdHRyaWJ1dGVcbiAgICAgICAgICAgIGlmICh0cmFuc2xhdGlvbklkICE9PSAnJyB8fCAhZmlyc3RBdHRyaWJ1dGVDaGFuZ2VkRXZlbnQpIHtcbiAgICAgICAgICAgICAgdHJhbnNsYXRpb25JZHMudHJhbnNsYXRlID0gdHJhbnNsYXRpb25JZDtcbiAgICAgICAgICAgICAgdXBkYXRlVHJhbnNsYXRpb25zKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGZpcnN0QXR0cmlidXRlQ2hhbmdlZEV2ZW50ID0gZmFsc2U7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZvciAodmFyIHRyYW5zbGF0ZUF0dHIgaW4gaUF0dHIpIHtcbiAgICAgICAgICBpZiAoaUF0dHIuaGFzT3duUHJvcGVydHkodHJhbnNsYXRlQXR0cikgJiYgdHJhbnNsYXRlQXR0ci5zdWJzdHIoMCwgMTMpID09PSAndHJhbnNsYXRlQXR0cicpIHtcbiAgICAgICAgICAgIG9ic2VydmVBdHRyaWJ1dGVUcmFuc2xhdGlvbih0cmFuc2xhdGVBdHRyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpQXR0ci4kb2JzZXJ2ZSgndHJhbnNsYXRlRGVmYXVsdCcsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgIHNjb3BlLmRlZmF1bHRUZXh0ID0gdmFsdWU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICh0cmFuc2xhdGVWYWx1ZXNFeGlzdCkge1xuICAgICAgICAgIGlBdHRyLiRvYnNlcnZlKCd0cmFuc2xhdGVWYWx1ZXMnLCBmdW5jdGlvbiAoaW50ZXJwb2xhdGVQYXJhbXMpIHtcbiAgICAgICAgICAgIGlmIChpbnRlcnBvbGF0ZVBhcmFtcykge1xuICAgICAgICAgICAgICBzY29wZS4kcGFyZW50LiR3YXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgYW5ndWxhci5leHRlbmQoc2NvcGUuaW50ZXJwb2xhdGVQYXJhbXMsICRwYXJzZShpbnRlcnBvbGF0ZVBhcmFtcykoc2NvcGUuJHBhcmVudCkpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0cmFuc2xhdGVWYWx1ZUV4aXN0KSB7XG4gICAgICAgICAgdmFyIG9ic2VydmVWYWx1ZUF0dHJpYnV0ZSA9IGZ1bmN0aW9uIChhdHRyTmFtZSkge1xuICAgICAgICAgICAgaUF0dHIuJG9ic2VydmUoYXR0ck5hbWUsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICB2YXIgYXR0cmlidXRlTmFtZSA9IGFuZ3VsYXIubG93ZXJjYXNlKGF0dHJOYW1lLnN1YnN0cigxNCwgMSkpICsgYXR0ck5hbWUuc3Vic3RyKDE1KTtcbiAgICAgICAgICAgICAgc2NvcGUuaW50ZXJwb2xhdGVQYXJhbXNbYXR0cmlidXRlTmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH07XG4gICAgICAgICAgZm9yICh2YXIgYXR0ciBpbiBpQXR0cikge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChpQXR0ciwgYXR0cikgJiYgYXR0ci5zdWJzdHIoMCwgMTQpID09PSAndHJhbnNsYXRlVmFsdWUnICYmIGF0dHIgIT09ICd0cmFuc2xhdGVWYWx1ZXMnKSB7XG4gICAgICAgICAgICAgIG9ic2VydmVWYWx1ZUF0dHJpYnV0ZShhdHRyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBNYXN0ZXIgdXBkYXRlIGZ1bmN0aW9uXG4gICAgICAgIHZhciB1cGRhdGVUcmFuc2xhdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgZm9yICh2YXIga2V5IGluIHRyYW5zbGF0aW9uSWRzKSB7XG4gICAgICAgICAgICBpZiAodHJhbnNsYXRpb25JZHMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICB1cGRhdGVUcmFuc2xhdGlvbihrZXksIHRyYW5zbGF0aW9uSWRzW2tleV0sIHNjb3BlLCBzY29wZS5pbnRlcnBvbGF0ZVBhcmFtcywgc2NvcGUuZGVmYXVsdFRleHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBQdXQgdHJhbnNsYXRpb24gcHJvY2Vzc2luZyBmdW5jdGlvbiBvdXRzaWRlIGxvb3BcbiAgICAgICAgdmFyIHVwZGF0ZVRyYW5zbGF0aW9uID0gZnVuY3Rpb24odHJhbnNsYXRlQXR0ciwgdHJhbnNsYXRpb25JZCwgc2NvcGUsIGludGVycG9sYXRlUGFyYW1zLCBkZWZhdWx0VHJhbnNsYXRpb25UZXh0KSB7XG4gICAgICAgICAgaWYgKHRyYW5zbGF0aW9uSWQpIHtcbiAgICAgICAgICAgICR0cmFuc2xhdGUodHJhbnNsYXRpb25JZCwgaW50ZXJwb2xhdGVQYXJhbXMsIHRyYW5zbGF0ZUludGVycG9sYXRpb24sIGRlZmF1bHRUcmFuc2xhdGlvblRleHQpXG4gICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICh0cmFuc2xhdGlvbikge1xuICAgICAgICAgICAgICAgIGFwcGx5VHJhbnNsYXRpb24odHJhbnNsYXRpb24sIHNjb3BlLCB0cnVlLCB0cmFuc2xhdGVBdHRyKTtcbiAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKHRyYW5zbGF0aW9uSWQpIHtcbiAgICAgICAgICAgICAgICBhcHBseVRyYW5zbGF0aW9uKHRyYW5zbGF0aW9uSWQsIHNjb3BlLCBmYWxzZSwgdHJhbnNsYXRlQXR0cik7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBhcyBhbiBlbXB0eSBzdHJpbmcgY2Fubm90IGJlIHRyYW5zbGF0ZWQsIHdlIGNhbiBzb2x2ZSB0aGlzIHVzaW5nIHN1Y2Nlc3NmdWw9ZmFsc2VcbiAgICAgICAgICAgIGFwcGx5VHJhbnNsYXRpb24odHJhbnNsYXRpb25JZCwgc2NvcGUsIGZhbHNlLCB0cmFuc2xhdGVBdHRyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGFwcGx5VHJhbnNsYXRpb24gPSBmdW5jdGlvbiAodmFsdWUsIHNjb3BlLCBzdWNjZXNzZnVsLCB0cmFuc2xhdGVBdHRyKSB7XG4gICAgICAgICAgaWYgKHRyYW5zbGF0ZUF0dHIgPT09ICd0cmFuc2xhdGUnKSB7XG4gICAgICAgICAgICAvLyBkZWZhdWx0IHRyYW5zbGF0ZSBpbnRvIGlubmVySFRNTFxuICAgICAgICAgICAgaWYgKCFzdWNjZXNzZnVsICYmIHR5cGVvZiBzY29wZS5kZWZhdWx0VGV4dCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgdmFsdWUgPSBzY29wZS5kZWZhdWx0VGV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlFbGVtZW50Lmh0bWwoc2NvcGUucHJlVGV4dCArIHZhbHVlICsgc2NvcGUucG9zdFRleHQpO1xuICAgICAgICAgICAgdmFyIGdsb2JhbGx5RW5hYmxlZCA9ICR0cmFuc2xhdGUuaXNQb3N0Q29tcGlsaW5nRW5hYmxlZCgpO1xuICAgICAgICAgICAgdmFyIGxvY2FsbHlEZWZpbmVkID0gdHlwZW9mIHRBdHRyLnRyYW5zbGF0ZUNvbXBpbGUgIT09ICd1bmRlZmluZWQnO1xuICAgICAgICAgICAgdmFyIGxvY2FsbHlFbmFibGVkID0gbG9jYWxseURlZmluZWQgJiYgdEF0dHIudHJhbnNsYXRlQ29tcGlsZSAhPT0gJ2ZhbHNlJztcbiAgICAgICAgICAgIGlmICgoZ2xvYmFsbHlFbmFibGVkICYmICFsb2NhbGx5RGVmaW5lZCkgfHwgbG9jYWxseUVuYWJsZWQpIHtcbiAgICAgICAgICAgICAgJGNvbXBpbGUoaUVsZW1lbnQuY29udGVudHMoKSkoc2NvcGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyB0cmFuc2xhdGUgYXR0cmlidXRlXG4gICAgICAgICAgICBpZiAoIXN1Y2Nlc3NmdWwgJiYgdHlwZW9mIHNjb3BlLmRlZmF1bHRUZXh0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICB2YWx1ZSA9IHNjb3BlLmRlZmF1bHRUZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGF0dHJpYnV0ZU5hbWUgPSBpQXR0ci4kYXR0clt0cmFuc2xhdGVBdHRyXS5zdWJzdHIoMTUpO1xuICAgICAgICAgICAgaUVsZW1lbnQuYXR0cihhdHRyaWJ1dGVOYW1lLCB2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHNjb3BlLiR3YXRjaCgnaW50ZXJwb2xhdGVQYXJhbXMnLCB1cGRhdGVUcmFuc2xhdGlvbnMsIHRydWUpO1xuXG4gICAgICAgIC8vIEVuc3VyZXMgdGhlIHRleHQgd2lsbCBiZSByZWZyZXNoZWQgYWZ0ZXIgdGhlIGN1cnJlbnQgbGFuZ3VhZ2Ugd2FzIGNoYW5nZWRcbiAgICAgICAgLy8gdy8gJHRyYW5zbGF0ZS51c2UoLi4uKVxuICAgICAgICB2YXIgdW5iaW5kID0gJHJvb3RTY29wZS4kb24oJyR0cmFuc2xhdGVDaGFuZ2VTdWNjZXNzJywgdXBkYXRlVHJhbnNsYXRpb25zKTtcblxuICAgICAgICAvLyBlbnN1cmUgdHJhbnNsYXRpb24gd2lsbCBiZSBsb29rZWQgdXAgYXQgbGVhc3Qgb25lXG4gICAgICAgIGlmIChpRWxlbWVudC50ZXh0KCkubGVuZ3RoKSB7XG4gICAgICAgICAgb2JzZXJ2ZUVsZW1lbnRUcmFuc2xhdGlvbignJyk7XG4gICAgICAgIH1cbiAgICAgICAgdXBkYXRlVHJhbnNsYXRpb25zKCk7XG4gICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCB1bmJpbmQpO1xuICAgICAgfTtcbiAgICB9XG4gIH07XG59XSk7XG5cbmFuZ3VsYXIubW9kdWxlKCdwYXNjYWxwcmVjaHQudHJhbnNsYXRlJylcbi8qKlxuICogQG5nZG9jIGRpcmVjdGl2ZVxuICogQG5hbWUgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS5kaXJlY3RpdmU6dHJhbnNsYXRlQ2xvYWtcbiAqIEByZXF1aXJlcyAkcm9vdFNjb3BlXG4gKiBAcmVxdWlyZXMgJHRyYW5zbGF0ZVxuICogQHJlc3RyaWN0IEFcbiAqXG4gKiAkZGVzY3JpcHRpb25cbiAqIEFkZHMgYSBgdHJhbnNsYXRlLWNsb2FrYCBjbGFzcyBuYW1lIHRvIHRoZSBnaXZlbiBlbGVtZW50IHdoZXJlIHRoaXMgZGlyZWN0aXZlXG4gKiBpcyBhcHBsaWVkIGluaXRpYWxseSBhbmQgcmVtb3ZlcyBpdCwgb25jZSBhIGxvYWRlciBoYXMgZmluaXNoZWQgbG9hZGluZy5cbiAqXG4gKiBUaGlzIGRpcmVjdGl2ZSBjYW4gYmUgdXNlZCB0byBwcmV2ZW50IGluaXRpYWwgZmxpY2tlcmluZyB3aGVuIGxvYWRpbmcgdHJhbnNsYXRpb25cbiAqIGRhdGEgYXN5bmNocm9ub3VzbHkuXG4gKlxuICogVGhlIGNsYXNzIG5hbWUgaXMgZGVmaW5lZCBpblxuICoge0BsaW5rIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVByb3ZpZGVyI2Nsb2FrQ2xhc3NOYW1lICR0cmFuc2xhdGUuY2xvYWtDbGFzc05hbWUoKX0uXG4gKlxuICogQHBhcmFtIHtzdHJpbmc9fSB0cmFuc2xhdGUtY2xvYWsgSWYgYSB0cmFuc2xhdGlvbklkIGlzIHByb3ZpZGVkLCBpdCB3aWxsIGJlIHVzZWQgZm9yIHNob3dpbmdcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yIGhpZGluZyB0aGUgY2xvYWsuIEJhc2ljYWxseSBpdCByZWxpZXMgb24gdGhlIHRyYW5zbGF0aW9uXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlLlxuICovXG4uZGlyZWN0aXZlKCd0cmFuc2xhdGVDbG9haycsIFsnJHJvb3RTY29wZScsICckdHJhbnNsYXRlJywgZnVuY3Rpb24gKCRyb290U2NvcGUsICR0cmFuc2xhdGUpIHtcblxuICByZXR1cm4ge1xuICAgIGNvbXBpbGU6IGZ1bmN0aW9uICh0RWxlbWVudCkge1xuICAgICAgdmFyIGFwcGx5Q2xvYWsgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRFbGVtZW50LmFkZENsYXNzKCR0cmFuc2xhdGUuY2xvYWtDbGFzc05hbWUoKSk7XG4gICAgICB9LFxuICAgICAgcmVtb3ZlQ2xvYWsgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRFbGVtZW50LnJlbW92ZUNsYXNzKCR0cmFuc2xhdGUuY2xvYWtDbGFzc05hbWUoKSk7XG4gICAgICB9LFxuICAgICAgcmVtb3ZlTGlzdGVuZXIgPSAkcm9vdFNjb3BlLiRvbignJHRyYW5zbGF0ZUNoYW5nZUVuZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmVtb3ZlQ2xvYWsoKTtcbiAgICAgICAgcmVtb3ZlTGlzdGVuZXIoKTtcbiAgICAgICAgcmVtb3ZlTGlzdGVuZXIgPSBudWxsO1xuICAgICAgfSk7XG4gICAgICBhcHBseUNsb2FrKCk7XG5cbiAgICAgIHJldHVybiBmdW5jdGlvbiBsaW5rRm4oc2NvcGUsIGlFbGVtZW50LCBpQXR0cikge1xuICAgICAgICAvLyBSZWdpc3RlciBhIHdhdGNoZXIgZm9yIHRoZSBkZWZpbmVkIHRyYW5zbGF0aW9uIGFsbG93aW5nIGEgZmluZSB0dW5lZCBjbG9ha1xuICAgICAgICBpZiAoaUF0dHIudHJhbnNsYXRlQ2xvYWsgJiYgaUF0dHIudHJhbnNsYXRlQ2xvYWsubGVuZ3RoKSB7XG4gICAgICAgICAgaUF0dHIuJG9ic2VydmUoJ3RyYW5zbGF0ZUNsb2FrJywgZnVuY3Rpb24gKHRyYW5zbGF0aW9uSWQpIHtcbiAgICAgICAgICAgICR0cmFuc2xhdGUodHJhbnNsYXRpb25JZCkudGhlbihyZW1vdmVDbG9haywgYXBwbHlDbG9hayk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuICB9O1xufV0pO1xuXG5hbmd1bGFyLm1vZHVsZSgncGFzY2FscHJlY2h0LnRyYW5zbGF0ZScpXG4vKipcbiAqIEBuZ2RvYyBmaWx0ZXJcbiAqIEBuYW1lIHBhc2NhbHByZWNodC50cmFuc2xhdGUuZmlsdGVyOnRyYW5zbGF0ZVxuICogQHJlcXVpcmVzICRwYXJzZVxuICogQHJlcXVpcmVzIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVxuICogQGZ1bmN0aW9uXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBVc2VzIGAkdHJhbnNsYXRlYCBzZXJ2aWNlIHRvIHRyYW5zbGF0ZSBjb250ZW50cy4gQWNjZXB0cyBpbnRlcnBvbGF0ZSBwYXJhbWV0ZXJzXG4gKiB0byBwYXNzIGR5bmFtaXplZCB2YWx1ZXMgdGhvdWdoIHRyYW5zbGF0aW9uLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB0cmFuc2xhdGlvbklkIEEgdHJhbnNsYXRpb24gaWQgdG8gYmUgdHJhbnNsYXRlZC5cbiAqIEBwYXJhbSB7Kj19IGludGVycG9sYXRlUGFyYW1zIE9wdGlvbmFsIG9iamVjdCBsaXRlcmFsIChhcyBoYXNoIG9yIHN0cmluZykgdG8gcGFzcyB2YWx1ZXMgaW50byB0cmFuc2xhdGlvbi5cbiAqXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUcmFuc2xhdGVkIHRleHQuXG4gKlxuICogQGV4YW1wbGVcbiAgIDxleGFtcGxlIG1vZHVsZT1cIm5nVmlld1wiPlxuICAgIDxmaWxlIG5hbWU9XCJpbmRleC5odG1sXCI+XG4gICAgICA8ZGl2IG5nLWNvbnRyb2xsZXI9XCJUcmFuc2xhdGVDdHJsXCI+XG5cbiAgICAgICAgPHByZT57eyAnVFJBTlNMQVRJT05fSUQnIHwgdHJhbnNsYXRlIH19PC9wcmU+XG4gICAgICAgIDxwcmU+e3sgdHJhbnNsYXRpb25JZCB8IHRyYW5zbGF0ZSB9fTwvcHJlPlxuICAgICAgICA8cHJlPnt7ICdXSVRIX1ZBTFVFUycgfCB0cmFuc2xhdGU6J3t2YWx1ZTogNX0nIH19PC9wcmU+XG4gICAgICAgIDxwcmU+e3sgJ1dJVEhfVkFMVUVTJyB8IHRyYW5zbGF0ZTp2YWx1ZXMgfX08L3ByZT5cblxuICAgICAgPC9kaXY+XG4gICAgPC9maWxlPlxuICAgIDxmaWxlIG5hbWU9XCJzY3JpcHQuanNcIj5cbiAgICAgIGFuZ3VsYXIubW9kdWxlKCduZ1ZpZXcnLCBbJ3Bhc2NhbHByZWNodC50cmFuc2xhdGUnXSlcblxuICAgICAgLmNvbmZpZyhmdW5jdGlvbiAoJHRyYW5zbGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAgICAgJHRyYW5zbGF0ZVByb3ZpZGVyLnRyYW5zbGF0aW9ucygnZW4nLCB7XG4gICAgICAgICAgJ1RSQU5TTEFUSU9OX0lEJzogJ0hlbGxvIHRoZXJlIScsXG4gICAgICAgICAgJ1dJVEhfVkFMVUVTJzogJ1RoZSBmb2xsb3dpbmcgdmFsdWUgaXMgZHluYW1pYzoge3t2YWx1ZX19J1xuICAgICAgICB9KTtcbiAgICAgICAgJHRyYW5zbGF0ZVByb3ZpZGVyLnByZWZlcnJlZExhbmd1YWdlKCdlbicpO1xuXG4gICAgICB9KTtcblxuICAgICAgYW5ndWxhci5tb2R1bGUoJ25nVmlldycpLmNvbnRyb2xsZXIoJ1RyYW5zbGF0ZUN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlKSB7XG4gICAgICAgICRzY29wZS50cmFuc2xhdGlvbklkID0gJ1RSQU5TTEFUSU9OX0lEJztcblxuICAgICAgICAkc2NvcGUudmFsdWVzID0ge1xuICAgICAgICAgIHZhbHVlOiA3OFxuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgPC9maWxlPlxuICAgPC9leGFtcGxlPlxuICovXG4uZmlsdGVyKCd0cmFuc2xhdGUnLCBbJyRwYXJzZScsICckdHJhbnNsYXRlJywgZnVuY3Rpb24gKCRwYXJzZSwgJHRyYW5zbGF0ZSkge1xuICB2YXIgdHJhbnNsYXRlRmlsdGVyID0gZnVuY3Rpb24gKHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zLCBpbnRlcnBvbGF0aW9uKSB7XG5cbiAgICBpZiAoIWFuZ3VsYXIuaXNPYmplY3QoaW50ZXJwb2xhdGVQYXJhbXMpKSB7XG4gICAgICBpbnRlcnBvbGF0ZVBhcmFtcyA9ICRwYXJzZShpbnRlcnBvbGF0ZVBhcmFtcykodGhpcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuICR0cmFuc2xhdGUuaW5zdGFudCh0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgaW50ZXJwb2xhdGlvbik7XG4gIH07XG5cbiAgLy8gU2luY2UgQW5ndWxhckpTIDEuMywgZmlsdGVycyB3aGljaCBhcmUgbm90IHN0YXRlbGVzcyAoZGVwZW5kaW5nIGF0IHRoZSBzY29wZSlcbiAgLy8gaGF2ZSB0byBleHBsaWNpdCBkZWZpbmUgdGhpcyBiZWhhdmlvci5cbiAgdHJhbnNsYXRlRmlsdGVyLiRzdGF0ZWZ1bCA9IHRydWU7XG5cbiAgcmV0dXJuIHRyYW5zbGF0ZUZpbHRlcjtcbn1dKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvT2JqZWN0UGF0aC5qcycpLk9iamVjdFBhdGg7XG4iLCIndXNlIHN0cmljdCc7XG5cbjshZnVuY3Rpb24odW5kZWZpbmVkKSB7XG5cblx0dmFyIE9iamVjdFBhdGggPSB7XG5cdFx0cGFyc2U6IGZ1bmN0aW9uKHN0cil7XG5cdFx0XHRpZih0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJyl7XG5cdFx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ09iamVjdFBhdGgucGFyc2UgbXVzdCBiZSBwYXNzZWQgYSBzdHJpbmcnKTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIGkgPSAwO1xuXHRcdFx0dmFyIHBhcnRzID0gW107XG5cdFx0XHR2YXIgZCwgYiwgcSwgYztcblx0XHRcdHdoaWxlIChpIDwgc3RyLmxlbmd0aCl7XG5cdFx0XHRcdGQgPSBzdHIuaW5kZXhPZignLicsIGkpO1xuXHRcdFx0XHRiID0gc3RyLmluZGV4T2YoJ1snLCBpKTtcblxuXHRcdFx0XHQvLyB3ZSd2ZSByZWFjaGVkIHRoZSBlbmRcblx0XHRcdFx0aWYgKGQgPT09IC0xICYmIGIgPT09IC0xKXtcblx0XHRcdFx0XHRwYXJ0cy5wdXNoKHN0ci5zbGljZShpLCBzdHIubGVuZ3RoKSk7XG5cdFx0XHRcdFx0aSA9IHN0ci5sZW5ndGg7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBkb3RzXG5cdFx0XHRcdGVsc2UgaWYgKGIgPT09IC0xIHx8IChkICE9PSAtMSAmJiBkIDwgYikpIHtcblx0XHRcdFx0XHRwYXJ0cy5wdXNoKHN0ci5zbGljZShpLCBkKSk7XG5cdFx0XHRcdFx0aSA9IGQgKyAxO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gYnJhY2tldHNcblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0aWYgKGIgPiBpKXtcblx0XHRcdFx0XHRcdHBhcnRzLnB1c2goc3RyLnNsaWNlKGksIGIpKTtcblx0XHRcdFx0XHRcdGkgPSBiO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRxID0gc3RyLnNsaWNlKGIrMSwgYisyKTtcblx0XHRcdFx0XHRpZiAocSAhPT0gJ1wiJyAmJiBxICE9PSdcXCcnKSB7XG5cdFx0XHRcdFx0XHRjID0gc3RyLmluZGV4T2YoJ10nLCBiKTtcblx0XHRcdFx0XHRcdGlmIChjID09PSAtMSkgYyA9IHN0ci5sZW5ndGg7XG5cdFx0XHRcdFx0XHRwYXJ0cy5wdXNoKHN0ci5zbGljZShpICsgMSwgYykpO1xuXHRcdFx0XHRcdFx0aSA9IChzdHIuc2xpY2UoYyArIDEsIGMgKyAyKSA9PT0gJy4nKSA/IGMgKyAyIDogYyArIDE7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGMgPSBzdHIuaW5kZXhPZihxKyddJywgYik7XG5cdFx0XHRcdFx0XHRpZiAoYyA9PT0gLTEpIGMgPSBzdHIubGVuZ3RoO1xuXHRcdFx0XHRcdFx0d2hpbGUgKHN0ci5zbGljZShjIC0gMSwgYykgPT09ICdcXFxcJyAmJiBiIDwgc3RyLmxlbmd0aCl7XG5cdFx0XHRcdFx0XHRcdGIrKztcblx0XHRcdFx0XHRcdFx0YyA9IHN0ci5pbmRleE9mKHErJ10nLCBiKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHBhcnRzLnB1c2goc3RyLnNsaWNlKGkgKyAyLCBjKS5yZXBsYWNlKG5ldyBSZWdFeHAoJ1xcXFwnK3EsJ2cnKSwgcSkpO1xuXHRcdFx0XHRcdFx0aSA9IChzdHIuc2xpY2UoYyArIDIsIGMgKyAzKSA9PT0gJy4nKSA/IGMgKyAzIDogYyArIDI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcGFydHM7XG5cdFx0fSxcblxuXHRcdC8vIHJvb3QgPT09IHRydWUgOiBhdXRvIGNhbGN1bGF0ZSByb290OyBtdXN0IGJlIGRvdC1ub3RhdGlvbiBmcmllbmRseVxuXHRcdC8vIHJvb3QgU3RyaW5nIDogdGhlIHN0cmluZyB0byB1c2UgYXMgcm9vdFxuXHRcdHN0cmluZ2lmeTogZnVuY3Rpb24oYXJyLCBxdW90ZSl7XG5cblx0XHRcdGlmKCFBcnJheS5pc0FycmF5KGFycikpXG5cdFx0XHRcdGFyciA9IFthcnIudG9TdHJpbmcoKV07XG5cblx0XHRcdHF1b3RlID0gcXVvdGUgPT09ICdcIicgPyAnXCInIDogJ1xcJyc7XG5cblx0XHRcdHJldHVybiBhcnIubWFwKGZ1bmN0aW9uKG4peyByZXR1cm4gJ1snICsgcXVvdGUgKyAobi50b1N0cmluZygpKS5yZXBsYWNlKG5ldyBSZWdFeHAocXVvdGUsICdnJyksICdcXFxcJyArIHF1b3RlKSArIHF1b3RlICsgJ10nOyB9KS5qb2luKCcnKTtcblx0XHR9LFxuXG5cdFx0bm9ybWFsaXplOiBmdW5jdGlvbihkYXRhLCBxdW90ZSl7XG5cdFx0XHRyZXR1cm4gT2JqZWN0UGF0aC5zdHJpbmdpZnkoQXJyYXkuaXNBcnJheShkYXRhKSA/IGRhdGEgOiBPYmplY3RQYXRoLnBhcnNlKGRhdGEpLCBxdW90ZSk7XG5cdFx0fSxcblxuXHRcdC8vIEFuZ3VsYXJcblx0XHRyZWdpc3Rlck1vZHVsZTogZnVuY3Rpb24oYW5ndWxhcikge1xuXHRcdFx0YW5ndWxhci5tb2R1bGUoJ09iamVjdFBhdGgnLCBbXSkucHJvdmlkZXIoJ09iamVjdFBhdGgnLCBmdW5jdGlvbigpe1xuXHRcdFx0XHR0aGlzLnBhcnNlID0gT2JqZWN0UGF0aC5wYXJzZTtcblx0XHRcdFx0dGhpcy5zdHJpbmdpZnkgPSBPYmplY3RQYXRoLnN0cmluZ2lmeTtcblx0XHRcdFx0dGhpcy5ub3JtYWxpemUgPSBPYmplY3RQYXRoLm5vcm1hbGl6ZTtcblx0XHRcdFx0dGhpcy4kZ2V0ID0gZnVuY3Rpb24oKXtcblx0XHRcdFx0XHRyZXR1cm4gT2JqZWN0UGF0aDtcblx0XHRcdFx0fTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fTtcblxuXHQvLyBBTURcblx0aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuXHRcdGRlZmluZShmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBPYmplY3RQYXRoO1xuXHRcdH0pO1xuXHR9XG5cblx0Ly8gQ29tbW9uSlNcblx0ZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG5cdFx0ZXhwb3J0cy5PYmplY3RQYXRoID0gT2JqZWN0UGF0aDtcblx0fVxuXG5cdC8vIEJyb3dzZXIgZ2xvYmFsXG5cdGVsc2Uge1xuXHRcdHdpbmRvdy5PYmplY3RQYXRoID0gT2JqZWN0UGF0aDtcblx0fVxuXHRcbn0oKTsiLCIvKlxuQXV0aG9yOiBHZXJhaW50IEx1ZmYgYW5kIG90aGVyc1xuWWVhcjogMjAxM1xuXG5UaGlzIGNvZGUgaXMgcmVsZWFzZWQgaW50byB0aGUgXCJwdWJsaWMgZG9tYWluXCIgYnkgaXRzIGF1dGhvcihzKS4gIEFueWJvZHkgbWF5IHVzZSwgYWx0ZXIgYW5kIGRpc3RyaWJ1dGUgdGhlIGNvZGUgd2l0aG91dCByZXN0cmljdGlvbi4gIFRoZSBhdXRob3IgbWFrZXMgbm8gZ3VhcmFudGVlcywgYW5kIHRha2VzIG5vIGxpYWJpbGl0eSBvZiBhbnkga2luZCBmb3IgdXNlIG9mIHRoaXMgY29kZS5cblxuSWYgeW91IGZpbmQgYSBidWcgb3IgbWFrZSBhbiBpbXByb3ZlbWVudCwgaXQgd291bGQgYmUgY291cnRlb3VzIHRvIGxldCB0aGUgYXV0aG9yIGtub3csIGJ1dCBpdCBpcyBub3QgY29tcHVsc29yeS5cbiovXG4oZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuICAgIGRlZmluZShbXSwgZmFjdG9yeSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpe1xuICAgIC8vIENvbW1vbkpTLiBEZWZpbmUgZXhwb3J0LlxuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICB9IGVsc2Uge1xuICAgIC8vIEJyb3dzZXIgZ2xvYmFsc1xuICAgIGdsb2JhbC50djQgPSBmYWN0b3J5KCk7XG4gIH1cbn0odGhpcywgZnVuY3Rpb24gKCkge1xuXG4vLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9PYmplY3Qva2V5cz9yZWRpcmVjdGxvY2FsZT1lbi1VUyZyZWRpcmVjdHNsdWc9SmF2YVNjcmlwdCUyRlJlZmVyZW5jZSUyRkdsb2JhbF9PYmplY3RzJTJGT2JqZWN0JTJGa2V5c1xuaWYgKCFPYmplY3Qua2V5cykge1xuXHRPYmplY3Qua2V5cyA9IChmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSxcblx0XHRcdGhhc0RvbnRFbnVtQnVnID0gISh7dG9TdHJpbmc6IG51bGx9KS5wcm9wZXJ0eUlzRW51bWVyYWJsZSgndG9TdHJpbmcnKSxcblx0XHRcdGRvbnRFbnVtcyA9IFtcblx0XHRcdFx0J3RvU3RyaW5nJyxcblx0XHRcdFx0J3RvTG9jYWxlU3RyaW5nJyxcblx0XHRcdFx0J3ZhbHVlT2YnLFxuXHRcdFx0XHQnaGFzT3duUHJvcGVydHknLFxuXHRcdFx0XHQnaXNQcm90b3R5cGVPZicsXG5cdFx0XHRcdCdwcm9wZXJ0eUlzRW51bWVyYWJsZScsXG5cdFx0XHRcdCdjb25zdHJ1Y3Rvcidcblx0XHRcdF0sXG5cdFx0XHRkb250RW51bXNMZW5ndGggPSBkb250RW51bXMubGVuZ3RoO1xuXG5cdFx0cmV0dXJuIGZ1bmN0aW9uIChvYmopIHtcblx0XHRcdGlmICh0eXBlb2Ygb2JqICE9PSAnb2JqZWN0JyAmJiB0eXBlb2Ygb2JqICE9PSAnZnVuY3Rpb24nIHx8IG9iaiA9PT0gbnVsbCkge1xuXHRcdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdPYmplY3Qua2V5cyBjYWxsZWQgb24gbm9uLW9iamVjdCcpO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgcmVzdWx0ID0gW107XG5cblx0XHRcdGZvciAodmFyIHByb3AgaW4gb2JqKSB7XG5cdFx0XHRcdGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIHtcblx0XHRcdFx0XHRyZXN1bHQucHVzaChwcm9wKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoaGFzRG9udEVudW1CdWcpIHtcblx0XHRcdFx0Zm9yICh2YXIgaT0wOyBpIDwgZG9udEVudW1zTGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRpZiAoaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGRvbnRFbnVtc1tpXSkpIHtcblx0XHRcdFx0XHRcdHJlc3VsdC5wdXNoKGRvbnRFbnVtc1tpXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH07XG5cdH0pKCk7XG59XG4vLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9PYmplY3QvY3JlYXRlXG5pZiAoIU9iamVjdC5jcmVhdGUpIHtcblx0T2JqZWN0LmNyZWF0ZSA9IChmdW5jdGlvbigpe1xuXHRcdGZ1bmN0aW9uIEYoKXt9XG5cblx0XHRyZXR1cm4gZnVuY3Rpb24obyl7XG5cdFx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCAhPT0gMSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ09iamVjdC5jcmVhdGUgaW1wbGVtZW50YXRpb24gb25seSBhY2NlcHRzIG9uZSBwYXJhbWV0ZXIuJyk7XG5cdFx0XHR9XG5cdFx0XHRGLnByb3RvdHlwZSA9IG87XG5cdFx0XHRyZXR1cm4gbmV3IEYoKTtcblx0XHR9O1xuXHR9KSgpO1xufVxuLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXkvaXNBcnJheT9yZWRpcmVjdGxvY2FsZT1lbi1VUyZyZWRpcmVjdHNsdWc9SmF2YVNjcmlwdCUyRlJlZmVyZW5jZSUyRkdsb2JhbF9PYmplY3RzJTJGQXJyYXklMkZpc0FycmF5XG5pZighQXJyYXkuaXNBcnJheSkge1xuXHRBcnJheS5pc0FycmF5ID0gZnVuY3Rpb24gKHZBcmcpIHtcblx0XHRyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZBcmcpID09PSBcIltvYmplY3QgQXJyYXldXCI7XG5cdH07XG59XG4vLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS9pbmRleE9mP3JlZGlyZWN0bG9jYWxlPWVuLVVTJnJlZGlyZWN0c2x1Zz1KYXZhU2NyaXB0JTJGUmVmZXJlbmNlJTJGR2xvYmFsX09iamVjdHMlMkZBcnJheSUyRmluZGV4T2ZcbmlmICghQXJyYXkucHJvdG90eXBlLmluZGV4T2YpIHtcblx0QXJyYXkucHJvdG90eXBlLmluZGV4T2YgPSBmdW5jdGlvbiAoc2VhcmNoRWxlbWVudCAvKiwgZnJvbUluZGV4ICovICkge1xuXHRcdGlmICh0aGlzID09PSBudWxsKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCk7XG5cdFx0fVxuXHRcdHZhciB0ID0gT2JqZWN0KHRoaXMpO1xuXHRcdHZhciBsZW4gPSB0Lmxlbmd0aCA+Pj4gMDtcblxuXHRcdGlmIChsZW4gPT09IDApIHtcblx0XHRcdHJldHVybiAtMTtcblx0XHR9XG5cdFx0dmFyIG4gPSAwO1xuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuXHRcdFx0biA9IE51bWJlcihhcmd1bWVudHNbMV0pO1xuXHRcdFx0aWYgKG4gIT09IG4pIHsgLy8gc2hvcnRjdXQgZm9yIHZlcmlmeWluZyBpZiBpdCdzIE5hTlxuXHRcdFx0XHRuID0gMDtcblx0XHRcdH0gZWxzZSBpZiAobiAhPT0gMCAmJiBuICE9PSBJbmZpbml0eSAmJiBuICE9PSAtSW5maW5pdHkpIHtcblx0XHRcdFx0biA9IChuID4gMCB8fCAtMSkgKiBNYXRoLmZsb29yKE1hdGguYWJzKG4pKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKG4gPj0gbGVuKSB7XG5cdFx0XHRyZXR1cm4gLTE7XG5cdFx0fVxuXHRcdHZhciBrID0gbiA+PSAwID8gbiA6IE1hdGgubWF4KGxlbiAtIE1hdGguYWJzKG4pLCAwKTtcblx0XHRmb3IgKDsgayA8IGxlbjsgaysrKSB7XG5cdFx0XHRpZiAoayBpbiB0ICYmIHRba10gPT09IHNlYXJjaEVsZW1lbnQpIHtcblx0XHRcdFx0cmV0dXJuIGs7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiAtMTtcblx0fTtcbn1cblxuLy8gR3J1bmdleSBPYmplY3QuaXNGcm96ZW4gaGFja1xuaWYgKCFPYmplY3QuaXNGcm96ZW4pIHtcblx0T2JqZWN0LmlzRnJvemVuID0gZnVuY3Rpb24gKG9iaikge1xuXHRcdHZhciBrZXkgPSBcInR2NF90ZXN0X2Zyb3plbl9rZXlcIjtcblx0XHR3aGlsZSAob2JqLmhhc093blByb3BlcnR5KGtleSkpIHtcblx0XHRcdGtleSArPSBNYXRoLnJhbmRvbSgpO1xuXHRcdH1cblx0XHR0cnkge1xuXHRcdFx0b2JqW2tleV0gPSB0cnVlO1xuXHRcdFx0ZGVsZXRlIG9ialtrZXldO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0fTtcbn1cbi8vIEJhc2VkIG9uOiBodHRwczovL2dpdGh1Yi5jb20vZ2VyYWludGx1ZmYvdXJpLXRlbXBsYXRlcywgYnV0IHdpdGggYWxsIHRoZSBkZS1zdWJzdGl0dXRpb24gc3R1ZmYgcmVtb3ZlZFxuXG52YXIgdXJpVGVtcGxhdGVHbG9iYWxNb2RpZmllcnMgPSB7XG5cdFwiK1wiOiB0cnVlLFxuXHRcIiNcIjogdHJ1ZSxcblx0XCIuXCI6IHRydWUsXG5cdFwiL1wiOiB0cnVlLFxuXHRcIjtcIjogdHJ1ZSxcblx0XCI/XCI6IHRydWUsXG5cdFwiJlwiOiB0cnVlXG59O1xudmFyIHVyaVRlbXBsYXRlU3VmZmljZXMgPSB7XG5cdFwiKlwiOiB0cnVlXG59O1xuXG5mdW5jdGlvbiBub3RSZWFsbHlQZXJjZW50RW5jb2RlKHN0cmluZykge1xuXHRyZXR1cm4gZW5jb2RlVVJJKHN0cmluZykucmVwbGFjZSgvJTI1WzAtOV1bMC05XS9nLCBmdW5jdGlvbiAoZG91YmxlRW5jb2RlZCkge1xuXHRcdHJldHVybiBcIiVcIiArIGRvdWJsZUVuY29kZWQuc3Vic3RyaW5nKDMpO1xuXHR9KTtcbn1cblxuZnVuY3Rpb24gdXJpVGVtcGxhdGVTdWJzdGl0dXRpb24oc3BlYykge1xuXHR2YXIgbW9kaWZpZXIgPSBcIlwiO1xuXHRpZiAodXJpVGVtcGxhdGVHbG9iYWxNb2RpZmllcnNbc3BlYy5jaGFyQXQoMCldKSB7XG5cdFx0bW9kaWZpZXIgPSBzcGVjLmNoYXJBdCgwKTtcblx0XHRzcGVjID0gc3BlYy5zdWJzdHJpbmcoMSk7XG5cdH1cblx0dmFyIHNlcGFyYXRvciA9IFwiXCI7XG5cdHZhciBwcmVmaXggPSBcIlwiO1xuXHR2YXIgc2hvdWxkRXNjYXBlID0gdHJ1ZTtcblx0dmFyIHNob3dWYXJpYWJsZXMgPSBmYWxzZTtcblx0dmFyIHRyaW1FbXB0eVN0cmluZyA9IGZhbHNlO1xuXHRpZiAobW9kaWZpZXIgPT09ICcrJykge1xuXHRcdHNob3VsZEVzY2FwZSA9IGZhbHNlO1xuXHR9IGVsc2UgaWYgKG1vZGlmaWVyID09PSBcIi5cIikge1xuXHRcdHByZWZpeCA9IFwiLlwiO1xuXHRcdHNlcGFyYXRvciA9IFwiLlwiO1xuXHR9IGVsc2UgaWYgKG1vZGlmaWVyID09PSBcIi9cIikge1xuXHRcdHByZWZpeCA9IFwiL1wiO1xuXHRcdHNlcGFyYXRvciA9IFwiL1wiO1xuXHR9IGVsc2UgaWYgKG1vZGlmaWVyID09PSAnIycpIHtcblx0XHRwcmVmaXggPSBcIiNcIjtcblx0XHRzaG91bGRFc2NhcGUgPSBmYWxzZTtcblx0fSBlbHNlIGlmIChtb2RpZmllciA9PT0gJzsnKSB7XG5cdFx0cHJlZml4ID0gXCI7XCI7XG5cdFx0c2VwYXJhdG9yID0gXCI7XCI7XG5cdFx0c2hvd1ZhcmlhYmxlcyA9IHRydWU7XG5cdFx0dHJpbUVtcHR5U3RyaW5nID0gdHJ1ZTtcblx0fSBlbHNlIGlmIChtb2RpZmllciA9PT0gJz8nKSB7XG5cdFx0cHJlZml4ID0gXCI/XCI7XG5cdFx0c2VwYXJhdG9yID0gXCImXCI7XG5cdFx0c2hvd1ZhcmlhYmxlcyA9IHRydWU7XG5cdH0gZWxzZSBpZiAobW9kaWZpZXIgPT09ICcmJykge1xuXHRcdHByZWZpeCA9IFwiJlwiO1xuXHRcdHNlcGFyYXRvciA9IFwiJlwiO1xuXHRcdHNob3dWYXJpYWJsZXMgPSB0cnVlO1xuXHR9XG5cblx0dmFyIHZhck5hbWVzID0gW107XG5cdHZhciB2YXJMaXN0ID0gc3BlYy5zcGxpdChcIixcIik7XG5cdHZhciB2YXJTcGVjcyA9IFtdO1xuXHR2YXIgdmFyU3BlY01hcCA9IHt9O1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHZhckxpc3QubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgdmFyTmFtZSA9IHZhckxpc3RbaV07XG5cdFx0dmFyIHRydW5jYXRlID0gbnVsbDtcblx0XHRpZiAodmFyTmFtZS5pbmRleE9mKFwiOlwiKSAhPT0gLTEpIHtcblx0XHRcdHZhciBwYXJ0cyA9IHZhck5hbWUuc3BsaXQoXCI6XCIpO1xuXHRcdFx0dmFyTmFtZSA9IHBhcnRzWzBdO1xuXHRcdFx0dHJ1bmNhdGUgPSBwYXJzZUludChwYXJ0c1sxXSwgMTApO1xuXHRcdH1cblx0XHR2YXIgc3VmZmljZXMgPSB7fTtcblx0XHR3aGlsZSAodXJpVGVtcGxhdGVTdWZmaWNlc1t2YXJOYW1lLmNoYXJBdCh2YXJOYW1lLmxlbmd0aCAtIDEpXSkge1xuXHRcdFx0c3VmZmljZXNbdmFyTmFtZS5jaGFyQXQodmFyTmFtZS5sZW5ndGggLSAxKV0gPSB0cnVlO1xuXHRcdFx0dmFyTmFtZSA9IHZhck5hbWUuc3Vic3RyaW5nKDAsIHZhck5hbWUubGVuZ3RoIC0gMSk7XG5cdFx0fVxuXHRcdHZhciB2YXJTcGVjID0ge1xuXHRcdFx0dHJ1bmNhdGU6IHRydW5jYXRlLFxuXHRcdFx0bmFtZTogdmFyTmFtZSxcblx0XHRcdHN1ZmZpY2VzOiBzdWZmaWNlc1xuXHRcdH07XG5cdFx0dmFyU3BlY3MucHVzaCh2YXJTcGVjKTtcblx0XHR2YXJTcGVjTWFwW3Zhck5hbWVdID0gdmFyU3BlYztcblx0XHR2YXJOYW1lcy5wdXNoKHZhck5hbWUpO1xuXHR9XG5cdHZhciBzdWJGdW5jdGlvbiA9IGZ1bmN0aW9uICh2YWx1ZUZ1bmN0aW9uKSB7XG5cdFx0dmFyIHJlc3VsdCA9IFwiXCI7XG5cdFx0dmFyIHN0YXJ0SW5kZXggPSAwO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdmFyU3BlY3MubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciB2YXJTcGVjID0gdmFyU3BlY3NbaV07XG5cdFx0XHR2YXIgdmFsdWUgPSB2YWx1ZUZ1bmN0aW9uKHZhclNwZWMubmFtZSk7XG5cdFx0XHRpZiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCB8fCAoQXJyYXkuaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUubGVuZ3RoID09PSAwKSB8fCAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiBPYmplY3Qua2V5cyh2YWx1ZSkubGVuZ3RoID09PSAwKSkge1xuXHRcdFx0XHRzdGFydEluZGV4Kys7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGkgPT09IHN0YXJ0SW5kZXgpIHtcblx0XHRcdFx0cmVzdWx0ICs9IHByZWZpeDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJlc3VsdCArPSAoc2VwYXJhdG9yIHx8IFwiLFwiKTtcblx0XHRcdH1cblx0XHRcdGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuXHRcdFx0XHRpZiAoc2hvd1ZhcmlhYmxlcykge1xuXHRcdFx0XHRcdHJlc3VsdCArPSB2YXJTcGVjLm5hbWUgKyBcIj1cIjtcblx0XHRcdFx0fVxuXHRcdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IHZhbHVlLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdFx0aWYgKGogPiAwKSB7XG5cdFx0XHRcdFx0XHRyZXN1bHQgKz0gdmFyU3BlYy5zdWZmaWNlc1snKiddID8gKHNlcGFyYXRvciB8fCBcIixcIikgOiBcIixcIjtcblx0XHRcdFx0XHRcdGlmICh2YXJTcGVjLnN1ZmZpY2VzWycqJ10gJiYgc2hvd1ZhcmlhYmxlcykge1xuXHRcdFx0XHRcdFx0XHRyZXN1bHQgKz0gdmFyU3BlYy5uYW1lICsgXCI9XCI7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJlc3VsdCArPSBzaG91bGRFc2NhcGUgPyBlbmNvZGVVUklDb21wb25lbnQodmFsdWVbal0pLnJlcGxhY2UoLyEvZywgXCIlMjFcIikgOiBub3RSZWFsbHlQZXJjZW50RW5jb2RlKHZhbHVlW2pdKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdFx0aWYgKHNob3dWYXJpYWJsZXMgJiYgIXZhclNwZWMuc3VmZmljZXNbJyonXSkge1xuXHRcdFx0XHRcdHJlc3VsdCArPSB2YXJTcGVjLm5hbWUgKyBcIj1cIjtcblx0XHRcdFx0fVxuXHRcdFx0XHR2YXIgZmlyc3QgPSB0cnVlO1xuXHRcdFx0XHRmb3IgKHZhciBrZXkgaW4gdmFsdWUpIHtcblx0XHRcdFx0XHRpZiAoIWZpcnN0KSB7XG5cdFx0XHRcdFx0XHRyZXN1bHQgKz0gdmFyU3BlYy5zdWZmaWNlc1snKiddID8gKHNlcGFyYXRvciB8fCBcIixcIikgOiBcIixcIjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Zmlyc3QgPSBmYWxzZTtcblx0XHRcdFx0XHRyZXN1bHQgKz0gc2hvdWxkRXNjYXBlID8gZW5jb2RlVVJJQ29tcG9uZW50KGtleSkucmVwbGFjZSgvIS9nLCBcIiUyMVwiKSA6IG5vdFJlYWxseVBlcmNlbnRFbmNvZGUoa2V5KTtcblx0XHRcdFx0XHRyZXN1bHQgKz0gdmFyU3BlYy5zdWZmaWNlc1snKiddID8gJz0nIDogXCIsXCI7XG5cdFx0XHRcdFx0cmVzdWx0ICs9IHNob3VsZEVzY2FwZSA/IGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZVtrZXldKS5yZXBsYWNlKC8hL2csIFwiJTIxXCIpIDogbm90UmVhbGx5UGVyY2VudEVuY29kZSh2YWx1ZVtrZXldKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aWYgKHNob3dWYXJpYWJsZXMpIHtcblx0XHRcdFx0XHRyZXN1bHQgKz0gdmFyU3BlYy5uYW1lO1xuXHRcdFx0XHRcdGlmICghdHJpbUVtcHR5U3RyaW5nIHx8IHZhbHVlICE9PSBcIlwiKSB7XG5cdFx0XHRcdFx0XHRyZXN1bHQgKz0gXCI9XCI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICh2YXJTcGVjLnRydW5jYXRlICE9IG51bGwpIHtcblx0XHRcdFx0XHR2YWx1ZSA9IHZhbHVlLnN1YnN0cmluZygwLCB2YXJTcGVjLnRydW5jYXRlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXN1bHQgKz0gc2hvdWxkRXNjYXBlID8gZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKS5yZXBsYWNlKC8hL2csIFwiJTIxXCIpOiBub3RSZWFsbHlQZXJjZW50RW5jb2RlKHZhbHVlKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fTtcblx0c3ViRnVuY3Rpb24udmFyTmFtZXMgPSB2YXJOYW1lcztcblx0cmV0dXJuIHtcblx0XHRwcmVmaXg6IHByZWZpeCxcblx0XHRzdWJzdGl0dXRpb246IHN1YkZ1bmN0aW9uXG5cdH07XG59XG5cbmZ1bmN0aW9uIFVyaVRlbXBsYXRlKHRlbXBsYXRlKSB7XG5cdGlmICghKHRoaXMgaW5zdGFuY2VvZiBVcmlUZW1wbGF0ZSkpIHtcblx0XHRyZXR1cm4gbmV3IFVyaVRlbXBsYXRlKHRlbXBsYXRlKTtcblx0fVxuXHR2YXIgcGFydHMgPSB0ZW1wbGF0ZS5zcGxpdChcIntcIik7XG5cdHZhciB0ZXh0UGFydHMgPSBbcGFydHMuc2hpZnQoKV07XG5cdHZhciBwcmVmaXhlcyA9IFtdO1xuXHR2YXIgc3Vic3RpdHV0aW9ucyA9IFtdO1xuXHR2YXIgdmFyTmFtZXMgPSBbXTtcblx0d2hpbGUgKHBhcnRzLmxlbmd0aCA+IDApIHtcblx0XHR2YXIgcGFydCA9IHBhcnRzLnNoaWZ0KCk7XG5cdFx0dmFyIHNwZWMgPSBwYXJ0LnNwbGl0KFwifVwiKVswXTtcblx0XHR2YXIgcmVtYWluZGVyID0gcGFydC5zdWJzdHJpbmcoc3BlYy5sZW5ndGggKyAxKTtcblx0XHR2YXIgZnVuY3MgPSB1cmlUZW1wbGF0ZVN1YnN0aXR1dGlvbihzcGVjKTtcblx0XHRzdWJzdGl0dXRpb25zLnB1c2goZnVuY3Muc3Vic3RpdHV0aW9uKTtcblx0XHRwcmVmaXhlcy5wdXNoKGZ1bmNzLnByZWZpeCk7XG5cdFx0dGV4dFBhcnRzLnB1c2gocmVtYWluZGVyKTtcblx0XHR2YXJOYW1lcyA9IHZhck5hbWVzLmNvbmNhdChmdW5jcy5zdWJzdGl0dXRpb24udmFyTmFtZXMpO1xuXHR9XG5cdHRoaXMuZmlsbCA9IGZ1bmN0aW9uICh2YWx1ZUZ1bmN0aW9uKSB7XG5cdFx0dmFyIHJlc3VsdCA9IHRleHRQYXJ0c1swXTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHN1YnN0aXR1dGlvbnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBzdWJzdGl0dXRpb24gPSBzdWJzdGl0dXRpb25zW2ldO1xuXHRcdFx0cmVzdWx0ICs9IHN1YnN0aXR1dGlvbih2YWx1ZUZ1bmN0aW9uKTtcblx0XHRcdHJlc3VsdCArPSB0ZXh0UGFydHNbaSArIDFdO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9O1xuXHR0aGlzLnZhck5hbWVzID0gdmFyTmFtZXM7XG5cdHRoaXMudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcbn1cblVyaVRlbXBsYXRlLnByb3RvdHlwZSA9IHtcblx0dG9TdHJpbmc6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gdGhpcy50ZW1wbGF0ZTtcblx0fSxcblx0ZmlsbEZyb21PYmplY3Q6IGZ1bmN0aW9uIChvYmopIHtcblx0XHRyZXR1cm4gdGhpcy5maWxsKGZ1bmN0aW9uICh2YXJOYW1lKSB7XG5cdFx0XHRyZXR1cm4gb2JqW3Zhck5hbWVdO1xuXHRcdH0pO1xuXHR9XG59O1xudmFyIFZhbGlkYXRvckNvbnRleHQgPSBmdW5jdGlvbiBWYWxpZGF0b3JDb250ZXh0KHBhcmVudCwgY29sbGVjdE11bHRpcGxlLCBlcnJvck1lc3NhZ2VzLCBjaGVja1JlY3Vyc2l2ZSwgdHJhY2tVbmtub3duUHJvcGVydGllcykge1xuXHR0aGlzLm1pc3NpbmcgPSBbXTtcblx0dGhpcy5taXNzaW5nTWFwID0ge307XG5cdHRoaXMuZm9ybWF0VmFsaWRhdG9ycyA9IHBhcmVudCA/IE9iamVjdC5jcmVhdGUocGFyZW50LmZvcm1hdFZhbGlkYXRvcnMpIDoge307XG5cdHRoaXMuc2NoZW1hcyA9IHBhcmVudCA/IE9iamVjdC5jcmVhdGUocGFyZW50LnNjaGVtYXMpIDoge307XG5cdHRoaXMuY29sbGVjdE11bHRpcGxlID0gY29sbGVjdE11bHRpcGxlO1xuXHR0aGlzLmVycm9ycyA9IFtdO1xuXHR0aGlzLmhhbmRsZUVycm9yID0gY29sbGVjdE11bHRpcGxlID8gdGhpcy5jb2xsZWN0RXJyb3IgOiB0aGlzLnJldHVybkVycm9yO1xuXHRpZiAoY2hlY2tSZWN1cnNpdmUpIHtcblx0XHR0aGlzLmNoZWNrUmVjdXJzaXZlID0gdHJ1ZTtcblx0XHR0aGlzLnNjYW5uZWQgPSBbXTtcblx0XHR0aGlzLnNjYW5uZWRGcm96ZW4gPSBbXTtcblx0XHR0aGlzLnNjYW5uZWRGcm96ZW5TY2hlbWFzID0gW107XG5cdFx0dGhpcy5zY2FubmVkRnJvemVuVmFsaWRhdGlvbkVycm9ycyA9IFtdO1xuXHRcdHRoaXMudmFsaWRhdGVkU2NoZW1hc0tleSA9ICd0djRfdmFsaWRhdGlvbl9pZCc7XG5cdFx0dGhpcy52YWxpZGF0aW9uRXJyb3JzS2V5ID0gJ3R2NF92YWxpZGF0aW9uX2Vycm9yc19pZCc7XG5cdH1cblx0aWYgKHRyYWNrVW5rbm93blByb3BlcnRpZXMpIHtcblx0XHR0aGlzLnRyYWNrVW5rbm93blByb3BlcnRpZXMgPSB0cnVlO1xuXHRcdHRoaXMua25vd25Qcm9wZXJ0eVBhdGhzID0ge307XG5cdFx0dGhpcy51bmtub3duUHJvcGVydHlQYXRocyA9IHt9O1xuXHR9XG5cdHRoaXMuZXJyb3JNZXNzYWdlcyA9IGVycm9yTWVzc2FnZXM7XG5cdHRoaXMuZGVmaW5lZEtleXdvcmRzID0ge307XG5cdGlmIChwYXJlbnQpIHtcblx0XHRmb3IgKHZhciBrZXkgaW4gcGFyZW50LmRlZmluZWRLZXl3b3Jkcykge1xuXHRcdFx0dGhpcy5kZWZpbmVkS2V5d29yZHNba2V5XSA9IHBhcmVudC5kZWZpbmVkS2V5d29yZHNba2V5XS5zbGljZSgwKTtcblx0XHR9XG5cdH1cbn07XG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5kZWZpbmVLZXl3b3JkID0gZnVuY3Rpb24gKGtleXdvcmQsIGtleXdvcmRGdW5jdGlvbikge1xuXHR0aGlzLmRlZmluZWRLZXl3b3Jkc1trZXl3b3JkXSA9IHRoaXMuZGVmaW5lZEtleXdvcmRzW2tleXdvcmRdIHx8IFtdO1xuXHR0aGlzLmRlZmluZWRLZXl3b3Jkc1trZXl3b3JkXS5wdXNoKGtleXdvcmRGdW5jdGlvbik7XG59O1xuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUuY3JlYXRlRXJyb3IgPSBmdW5jdGlvbiAoY29kZSwgbWVzc2FnZVBhcmFtcywgZGF0YVBhdGgsIHNjaGVtYVBhdGgsIHN1YkVycm9ycykge1xuXHR2YXIgbWVzc2FnZVRlbXBsYXRlID0gdGhpcy5lcnJvck1lc3NhZ2VzW2NvZGVdIHx8IEVycm9yTWVzc2FnZXNEZWZhdWx0W2NvZGVdO1xuXHRpZiAodHlwZW9mIG1lc3NhZ2VUZW1wbGF0ZSAhPT0gJ3N0cmluZycpIHtcblx0XHRyZXR1cm4gbmV3IFZhbGlkYXRpb25FcnJvcihjb2RlLCBcIlVua25vd24gZXJyb3IgY29kZSBcIiArIGNvZGUgKyBcIjogXCIgKyBKU09OLnN0cmluZ2lmeShtZXNzYWdlUGFyYW1zKSwgbWVzc2FnZVBhcmFtcywgZGF0YVBhdGgsIHNjaGVtYVBhdGgsIHN1YkVycm9ycyk7XG5cdH1cblx0Ly8gQWRhcHRlZCBmcm9tIENyb2NrZm9yZCdzIHN1cHBsYW50KClcblx0dmFyIG1lc3NhZ2UgPSBtZXNzYWdlVGVtcGxhdGUucmVwbGFjZSgvXFx7KFtee31dKilcXH0vZywgZnVuY3Rpb24gKHdob2xlLCB2YXJOYW1lKSB7XG5cdFx0dmFyIHN1YlZhbHVlID0gbWVzc2FnZVBhcmFtc1t2YXJOYW1lXTtcblx0XHRyZXR1cm4gdHlwZW9mIHN1YlZhbHVlID09PSAnc3RyaW5nJyB8fCB0eXBlb2Ygc3ViVmFsdWUgPT09ICdudW1iZXInID8gc3ViVmFsdWUgOiB3aG9sZTtcblx0fSk7XG5cdHJldHVybiBuZXcgVmFsaWRhdGlvbkVycm9yKGNvZGUsIG1lc3NhZ2UsIG1lc3NhZ2VQYXJhbXMsIGRhdGFQYXRoLCBzY2hlbWFQYXRoLCBzdWJFcnJvcnMpO1xufTtcblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnJldHVybkVycm9yID0gZnVuY3Rpb24gKGVycm9yKSB7XG5cdHJldHVybiBlcnJvcjtcbn07XG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5jb2xsZWN0RXJyb3IgPSBmdW5jdGlvbiAoZXJyb3IpIHtcblx0aWYgKGVycm9yKSB7XG5cdFx0dGhpcy5lcnJvcnMucHVzaChlcnJvcik7XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUucHJlZml4RXJyb3JzID0gZnVuY3Rpb24gKHN0YXJ0SW5kZXgsIGRhdGFQYXRoLCBzY2hlbWFQYXRoKSB7XG5cdGZvciAodmFyIGkgPSBzdGFydEluZGV4OyBpIDwgdGhpcy5lcnJvcnMubGVuZ3RoOyBpKyspIHtcblx0XHR0aGlzLmVycm9yc1tpXSA9IHRoaXMuZXJyb3JzW2ldLnByZWZpeFdpdGgoZGF0YVBhdGgsIHNjaGVtYVBhdGgpO1xuXHR9XG5cdHJldHVybiB0aGlzO1xufTtcblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLmJhblVua25vd25Qcm9wZXJ0aWVzID0gZnVuY3Rpb24gKCkge1xuXHRmb3IgKHZhciB1bmtub3duUGF0aCBpbiB0aGlzLnVua25vd25Qcm9wZXJ0eVBhdGhzKSB7XG5cdFx0dmFyIGVycm9yID0gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLlVOS05PV05fUFJPUEVSVFksIHtwYXRoOiB1bmtub3duUGF0aH0sIHVua25vd25QYXRoLCBcIlwiKTtcblx0XHR2YXIgcmVzdWx0ID0gdGhpcy5oYW5kbGVFcnJvcihlcnJvcik7XG5cdFx0aWYgKHJlc3VsdCkge1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5hZGRGb3JtYXQgPSBmdW5jdGlvbiAoZm9ybWF0LCB2YWxpZGF0b3IpIHtcblx0aWYgKHR5cGVvZiBmb3JtYXQgPT09ICdvYmplY3QnKSB7XG5cdFx0Zm9yICh2YXIga2V5IGluIGZvcm1hdCkge1xuXHRcdFx0dGhpcy5hZGRGb3JtYXQoa2V5LCBmb3JtYXRba2V5XSk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdHRoaXMuZm9ybWF0VmFsaWRhdG9yc1tmb3JtYXRdID0gdmFsaWRhdG9yO1xufTtcblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnJlc29sdmVSZWZzID0gZnVuY3Rpb24gKHNjaGVtYSwgdXJsSGlzdG9yeSkge1xuXHRpZiAoc2NoZW1hWyckcmVmJ10gIT09IHVuZGVmaW5lZCkge1xuXHRcdHVybEhpc3RvcnkgPSB1cmxIaXN0b3J5IHx8IHt9O1xuXHRcdGlmICh1cmxIaXN0b3J5W3NjaGVtYVsnJHJlZiddXSkge1xuXHRcdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5DSVJDVUxBUl9SRUZFUkVOQ0UsIHt1cmxzOiBPYmplY3Qua2V5cyh1cmxIaXN0b3J5KS5qb2luKCcsICcpfSwgJycsICcnKTtcblx0XHR9XG5cdFx0dXJsSGlzdG9yeVtzY2hlbWFbJyRyZWYnXV0gPSB0cnVlO1xuXHRcdHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKHNjaGVtYVsnJHJlZiddLCB1cmxIaXN0b3J5KTtcblx0fVxuXHRyZXR1cm4gc2NoZW1hO1xufTtcblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLmdldFNjaGVtYSA9IGZ1bmN0aW9uICh1cmwsIHVybEhpc3RvcnkpIHtcblx0dmFyIHNjaGVtYTtcblx0aWYgKHRoaXMuc2NoZW1hc1t1cmxdICE9PSB1bmRlZmluZWQpIHtcblx0XHRzY2hlbWEgPSB0aGlzLnNjaGVtYXNbdXJsXTtcblx0XHRyZXR1cm4gdGhpcy5yZXNvbHZlUmVmcyhzY2hlbWEsIHVybEhpc3RvcnkpO1xuXHR9XG5cdHZhciBiYXNlVXJsID0gdXJsO1xuXHR2YXIgZnJhZ21lbnQgPSBcIlwiO1xuXHRpZiAodXJsLmluZGV4T2YoJyMnKSAhPT0gLTEpIHtcblx0XHRmcmFnbWVudCA9IHVybC5zdWJzdHJpbmcodXJsLmluZGV4T2YoXCIjXCIpICsgMSk7XG5cdFx0YmFzZVVybCA9IHVybC5zdWJzdHJpbmcoMCwgdXJsLmluZGV4T2YoXCIjXCIpKTtcblx0fVxuXHRpZiAodHlwZW9mIHRoaXMuc2NoZW1hc1tiYXNlVXJsXSA9PT0gJ29iamVjdCcpIHtcblx0XHRzY2hlbWEgPSB0aGlzLnNjaGVtYXNbYmFzZVVybF07XG5cdFx0dmFyIHBvaW50ZXJQYXRoID0gZGVjb2RlVVJJQ29tcG9uZW50KGZyYWdtZW50KTtcblx0XHRpZiAocG9pbnRlclBhdGggPT09IFwiXCIpIHtcblx0XHRcdHJldHVybiB0aGlzLnJlc29sdmVSZWZzKHNjaGVtYSwgdXJsSGlzdG9yeSk7XG5cdFx0fSBlbHNlIGlmIChwb2ludGVyUGF0aC5jaGFyQXQoMCkgIT09IFwiL1wiKSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0XHR2YXIgcGFydHMgPSBwb2ludGVyUGF0aC5zcGxpdChcIi9cIikuc2xpY2UoMSk7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwYXJ0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGNvbXBvbmVudCA9IHBhcnRzW2ldLnJlcGxhY2UoL34xL2csIFwiL1wiKS5yZXBsYWNlKC9+MC9nLCBcIn5cIik7XG5cdFx0XHRpZiAoc2NoZW1hW2NvbXBvbmVudF0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRzY2hlbWEgPSB1bmRlZmluZWQ7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdFx0c2NoZW1hID0gc2NoZW1hW2NvbXBvbmVudF07XG5cdFx0fVxuXHRcdGlmIChzY2hlbWEgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cmV0dXJuIHRoaXMucmVzb2x2ZVJlZnMoc2NoZW1hLCB1cmxIaXN0b3J5KTtcblx0XHR9XG5cdH1cblx0aWYgKHRoaXMubWlzc2luZ1tiYXNlVXJsXSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0dGhpcy5taXNzaW5nLnB1c2goYmFzZVVybCk7XG5cdFx0dGhpcy5taXNzaW5nW2Jhc2VVcmxdID0gYmFzZVVybDtcblx0XHR0aGlzLm1pc3NpbmdNYXBbYmFzZVVybF0gPSBiYXNlVXJsO1xuXHR9XG59O1xuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUuc2VhcmNoU2NoZW1hcyA9IGZ1bmN0aW9uIChzY2hlbWEsIHVybCkge1xuXHRpZiAoQXJyYXkuaXNBcnJheShzY2hlbWEpKSB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzY2hlbWEubGVuZ3RoOyBpKyspIHtcblx0XHRcdHRoaXMuc2VhcmNoU2NoZW1hcyhzY2hlbWFbaV0sIHVybCk7XG5cdFx0fVxuXHR9IGVsc2UgaWYgKHNjaGVtYSAmJiB0eXBlb2Ygc2NoZW1hID09PSBcIm9iamVjdFwiKSB7XG5cdFx0aWYgKHR5cGVvZiBzY2hlbWEuaWQgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdGlmIChpc1RydXN0ZWRVcmwodXJsLCBzY2hlbWEuaWQpKSB7XG5cdFx0XHRcdGlmICh0aGlzLnNjaGVtYXNbc2NoZW1hLmlkXSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0dGhpcy5zY2hlbWFzW3NjaGVtYS5pZF0gPSBzY2hlbWE7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0Zm9yICh2YXIga2V5IGluIHNjaGVtYSkge1xuXHRcdFx0aWYgKGtleSAhPT0gXCJlbnVtXCIpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBzY2hlbWFba2V5XSA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0XHRcdHRoaXMuc2VhcmNoU2NoZW1hcyhzY2hlbWFba2V5XSwgdXJsKTtcblx0XHRcdFx0fSBlbHNlIGlmIChrZXkgPT09IFwiJHJlZlwiKSB7XG5cdFx0XHRcdFx0dmFyIHVyaSA9IGdldERvY3VtZW50VXJpKHNjaGVtYVtrZXldKTtcblx0XHRcdFx0XHRpZiAodXJpICYmIHRoaXMuc2NoZW1hc1t1cmldID09PSB1bmRlZmluZWQgJiYgdGhpcy5taXNzaW5nTWFwW3VyaV0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0dGhpcy5taXNzaW5nTWFwW3VyaV0gPSB1cmk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59O1xuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUuYWRkU2NoZW1hID0gZnVuY3Rpb24gKHVybCwgc2NoZW1hKSB7XG5cdC8vb3ZlcmxvYWRcblx0aWYgKHR5cGVvZiB1cmwgIT09ICdzdHJpbmcnIHx8IHR5cGVvZiBzY2hlbWEgPT09ICd1bmRlZmluZWQnKSB7XG5cdFx0aWYgKHR5cGVvZiB1cmwgPT09ICdvYmplY3QnICYmIHR5cGVvZiB1cmwuaWQgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRzY2hlbWEgPSB1cmw7XG5cdFx0XHR1cmwgPSBzY2hlbWEuaWQ7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0fVxuXHRpZiAodXJsID09PSBnZXREb2N1bWVudFVyaSh1cmwpICsgXCIjXCIpIHtcblx0XHQvLyBSZW1vdmUgZW1wdHkgZnJhZ21lbnRcblx0XHR1cmwgPSBnZXREb2N1bWVudFVyaSh1cmwpO1xuXHR9XG5cdHRoaXMuc2NoZW1hc1t1cmxdID0gc2NoZW1hO1xuXHRkZWxldGUgdGhpcy5taXNzaW5nTWFwW3VybF07XG5cdG5vcm1TY2hlbWEoc2NoZW1hLCB1cmwpO1xuXHR0aGlzLnNlYXJjaFNjaGVtYXMoc2NoZW1hLCB1cmwpO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUuZ2V0U2NoZW1hTWFwID0gZnVuY3Rpb24gKCkge1xuXHR2YXIgbWFwID0ge307XG5cdGZvciAodmFyIGtleSBpbiB0aGlzLnNjaGVtYXMpIHtcblx0XHRtYXBba2V5XSA9IHRoaXMuc2NoZW1hc1trZXldO1xuXHR9XG5cdHJldHVybiBtYXA7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5nZXRTY2hlbWFVcmlzID0gZnVuY3Rpb24gKGZpbHRlclJlZ0V4cCkge1xuXHR2YXIgbGlzdCA9IFtdO1xuXHRmb3IgKHZhciBrZXkgaW4gdGhpcy5zY2hlbWFzKSB7XG5cdFx0aWYgKCFmaWx0ZXJSZWdFeHAgfHwgZmlsdGVyUmVnRXhwLnRlc3Qoa2V5KSkge1xuXHRcdFx0bGlzdC5wdXNoKGtleSk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBsaXN0O1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUuZ2V0TWlzc2luZ1VyaXMgPSBmdW5jdGlvbiAoZmlsdGVyUmVnRXhwKSB7XG5cdHZhciBsaXN0ID0gW107XG5cdGZvciAodmFyIGtleSBpbiB0aGlzLm1pc3NpbmdNYXApIHtcblx0XHRpZiAoIWZpbHRlclJlZ0V4cCB8fCBmaWx0ZXJSZWdFeHAudGVzdChrZXkpKSB7XG5cdFx0XHRsaXN0LnB1c2goa2V5KTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGxpc3Q7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5kcm9wU2NoZW1hcyA9IGZ1bmN0aW9uICgpIHtcblx0dGhpcy5zY2hlbWFzID0ge307XG5cdHRoaXMucmVzZXQoKTtcbn07XG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uICgpIHtcblx0dGhpcy5taXNzaW5nID0gW107XG5cdHRoaXMubWlzc2luZ01hcCA9IHt9O1xuXHR0aGlzLmVycm9ycyA9IFtdO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVBbGwgPSBmdW5jdGlvbiAoZGF0YSwgc2NoZW1hLCBkYXRhUGF0aFBhcnRzLCBzY2hlbWFQYXRoUGFydHMsIGRhdGFQb2ludGVyUGF0aCkge1xuXHR2YXIgdG9wTGV2ZWw7XG5cdHNjaGVtYSA9IHRoaXMucmVzb2x2ZVJlZnMoc2NoZW1hKTtcblx0aWYgKCFzY2hlbWEpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fSBlbHNlIGlmIChzY2hlbWEgaW5zdGFuY2VvZiBWYWxpZGF0aW9uRXJyb3IpIHtcblx0XHR0aGlzLmVycm9ycy5wdXNoKHNjaGVtYSk7XG5cdFx0cmV0dXJuIHNjaGVtYTtcblx0fVxuXG5cdHZhciBzdGFydEVycm9yQ291bnQgPSB0aGlzLmVycm9ycy5sZW5ndGg7XG5cdHZhciBmcm96ZW5JbmRleCwgc2Nhbm5lZEZyb3plblNjaGVtYUluZGV4ID0gbnVsbCwgc2Nhbm5lZFNjaGVtYXNJbmRleCA9IG51bGw7XG5cdGlmICh0aGlzLmNoZWNrUmVjdXJzaXZlICYmIGRhdGEgJiYgdHlwZW9mIGRhdGEgPT09ICdvYmplY3QnKSB7XG5cdFx0dG9wTGV2ZWwgPSAhdGhpcy5zY2FubmVkLmxlbmd0aDtcblx0XHRpZiAoZGF0YVt0aGlzLnZhbGlkYXRlZFNjaGVtYXNLZXldKSB7XG5cdFx0XHR2YXIgc2NoZW1hSW5kZXggPSBkYXRhW3RoaXMudmFsaWRhdGVkU2NoZW1hc0tleV0uaW5kZXhPZihzY2hlbWEpO1xuXHRcdFx0aWYgKHNjaGVtYUluZGV4ICE9PSAtMSkge1xuXHRcdFx0XHR0aGlzLmVycm9ycyA9IHRoaXMuZXJyb3JzLmNvbmNhdChkYXRhW3RoaXMudmFsaWRhdGlvbkVycm9yc0tleV1bc2NoZW1hSW5kZXhdKTtcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChPYmplY3QuaXNGcm96ZW4oZGF0YSkpIHtcblx0XHRcdGZyb3plbkluZGV4ID0gdGhpcy5zY2FubmVkRnJvemVuLmluZGV4T2YoZGF0YSk7XG5cdFx0XHRpZiAoZnJvemVuSW5kZXggIT09IC0xKSB7XG5cdFx0XHRcdHZhciBmcm96ZW5TY2hlbWFJbmRleCA9IHRoaXMuc2Nhbm5lZEZyb3plblNjaGVtYXNbZnJvemVuSW5kZXhdLmluZGV4T2Yoc2NoZW1hKTtcblx0XHRcdFx0aWYgKGZyb3plblNjaGVtYUluZGV4ICE9PSAtMSkge1xuXHRcdFx0XHRcdHRoaXMuZXJyb3JzID0gdGhpcy5lcnJvcnMuY29uY2F0KHRoaXMuc2Nhbm5lZEZyb3plblZhbGlkYXRpb25FcnJvcnNbZnJvemVuSW5kZXhdW2Zyb3plblNjaGVtYUluZGV4XSk7XG5cdFx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0dGhpcy5zY2FubmVkLnB1c2goZGF0YSk7XG5cdFx0aWYgKE9iamVjdC5pc0Zyb3plbihkYXRhKSkge1xuXHRcdFx0aWYgKGZyb3plbkluZGV4ID09PSAtMSkge1xuXHRcdFx0XHRmcm96ZW5JbmRleCA9IHRoaXMuc2Nhbm5lZEZyb3plbi5sZW5ndGg7XG5cdFx0XHRcdHRoaXMuc2Nhbm5lZEZyb3plbi5wdXNoKGRhdGEpO1xuXHRcdFx0XHR0aGlzLnNjYW5uZWRGcm96ZW5TY2hlbWFzLnB1c2goW10pO1xuXHRcdFx0fVxuXHRcdFx0c2Nhbm5lZEZyb3plblNjaGVtYUluZGV4ID0gdGhpcy5zY2FubmVkRnJvemVuU2NoZW1hc1tmcm96ZW5JbmRleF0ubGVuZ3RoO1xuXHRcdFx0dGhpcy5zY2FubmVkRnJvemVuU2NoZW1hc1tmcm96ZW5JbmRleF1bc2Nhbm5lZEZyb3plblNjaGVtYUluZGV4XSA9IHNjaGVtYTtcblx0XHRcdHRoaXMuc2Nhbm5lZEZyb3plblZhbGlkYXRpb25FcnJvcnNbZnJvemVuSW5kZXhdW3NjYW5uZWRGcm96ZW5TY2hlbWFJbmRleF0gPSBbXTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKCFkYXRhW3RoaXMudmFsaWRhdGVkU2NoZW1hc0tleV0pIHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZGF0YSwgdGhpcy52YWxpZGF0ZWRTY2hlbWFzS2V5LCB7XG5cdFx0XHRcdFx0XHR2YWx1ZTogW10sXG5cdFx0XHRcdFx0XHRjb25maWd1cmFibGU6IHRydWVcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZGF0YSwgdGhpcy52YWxpZGF0aW9uRXJyb3JzS2V5LCB7XG5cdFx0XHRcdFx0XHR2YWx1ZTogW10sXG5cdFx0XHRcdFx0XHRjb25maWd1cmFibGU6IHRydWVcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRcdC8vSUUgNy84IHdvcmthcm91bmRcblx0XHRcdFx0XHRkYXRhW3RoaXMudmFsaWRhdGVkU2NoZW1hc0tleV0gPSBbXTtcblx0XHRcdFx0XHRkYXRhW3RoaXMudmFsaWRhdGlvbkVycm9yc0tleV0gPSBbXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0c2Nhbm5lZFNjaGVtYXNJbmRleCA9IGRhdGFbdGhpcy52YWxpZGF0ZWRTY2hlbWFzS2V5XS5sZW5ndGg7XG5cdFx0XHRkYXRhW3RoaXMudmFsaWRhdGVkU2NoZW1hc0tleV1bc2Nhbm5lZFNjaGVtYXNJbmRleF0gPSBzY2hlbWE7XG5cdFx0XHRkYXRhW3RoaXMudmFsaWRhdGlvbkVycm9yc0tleV1bc2Nhbm5lZFNjaGVtYXNJbmRleF0gPSBbXTtcblx0XHR9XG5cdH1cblxuXHR2YXIgZXJyb3JDb3VudCA9IHRoaXMuZXJyb3JzLmxlbmd0aDtcblx0dmFyIGVycm9yID0gdGhpcy52YWxpZGF0ZUJhc2ljKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVOdW1lcmljKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVTdHJpbmcoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZUFycmF5KGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVPYmplY3QoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZUNvbWJpbmF0aW9ucyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCB0aGlzLnZhbGlkYXRlSHlwZXJtZWRpYShkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCB0aGlzLnZhbGlkYXRlRm9ybWF0KGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVEZWZpbmVkS2V5d29yZHMoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgbnVsbDtcblxuXHRpZiAodG9wTGV2ZWwpIHtcblx0XHR3aGlsZSAodGhpcy5zY2FubmVkLmxlbmd0aCkge1xuXHRcdFx0dmFyIGl0ZW0gPSB0aGlzLnNjYW5uZWQucG9wKCk7XG5cdFx0XHRkZWxldGUgaXRlbVt0aGlzLnZhbGlkYXRlZFNjaGVtYXNLZXldO1xuXHRcdH1cblx0XHR0aGlzLnNjYW5uZWRGcm96ZW4gPSBbXTtcblx0XHR0aGlzLnNjYW5uZWRGcm96ZW5TY2hlbWFzID0gW107XG5cdH1cblxuXHRpZiAoZXJyb3IgfHwgZXJyb3JDb3VudCAhPT0gdGhpcy5lcnJvcnMubGVuZ3RoKSB7XG5cdFx0d2hpbGUgKChkYXRhUGF0aFBhcnRzICYmIGRhdGFQYXRoUGFydHMubGVuZ3RoKSB8fCAoc2NoZW1hUGF0aFBhcnRzICYmIHNjaGVtYVBhdGhQYXJ0cy5sZW5ndGgpKSB7XG5cdFx0XHR2YXIgZGF0YVBhcnQgPSAoZGF0YVBhdGhQYXJ0cyAmJiBkYXRhUGF0aFBhcnRzLmxlbmd0aCkgPyBcIlwiICsgZGF0YVBhdGhQYXJ0cy5wb3AoKSA6IG51bGw7XG5cdFx0XHR2YXIgc2NoZW1hUGFydCA9IChzY2hlbWFQYXRoUGFydHMgJiYgc2NoZW1hUGF0aFBhcnRzLmxlbmd0aCkgPyBcIlwiICsgc2NoZW1hUGF0aFBhcnRzLnBvcCgpIDogbnVsbDtcblx0XHRcdGlmIChlcnJvcikge1xuXHRcdFx0XHRlcnJvciA9IGVycm9yLnByZWZpeFdpdGgoZGF0YVBhcnQsIHNjaGVtYVBhcnQpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5wcmVmaXhFcnJvcnMoZXJyb3JDb3VudCwgZGF0YVBhcnQsIHNjaGVtYVBhcnQpO1xuXHRcdH1cblx0fVxuXG5cdGlmIChzY2FubmVkRnJvemVuU2NoZW1hSW5kZXggIT09IG51bGwpIHtcblx0XHR0aGlzLnNjYW5uZWRGcm96ZW5WYWxpZGF0aW9uRXJyb3JzW2Zyb3plbkluZGV4XVtzY2FubmVkRnJvemVuU2NoZW1hSW5kZXhdID0gdGhpcy5lcnJvcnMuc2xpY2Uoc3RhcnRFcnJvckNvdW50KTtcblx0fSBlbHNlIGlmIChzY2FubmVkU2NoZW1hc0luZGV4ICE9PSBudWxsKSB7XG5cdFx0ZGF0YVt0aGlzLnZhbGlkYXRpb25FcnJvcnNLZXldW3NjYW5uZWRTY2hlbWFzSW5kZXhdID0gdGhpcy5lcnJvcnMuc2xpY2Uoc3RhcnRFcnJvckNvdW50KTtcblx0fVxuXG5cdHJldHVybiB0aGlzLmhhbmRsZUVycm9yKGVycm9yKTtcbn07XG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZUZvcm1hdCA9IGZ1bmN0aW9uIChkYXRhLCBzY2hlbWEpIHtcblx0aWYgKHR5cGVvZiBzY2hlbWEuZm9ybWF0ICE9PSAnc3RyaW5nJyB8fCAhdGhpcy5mb3JtYXRWYWxpZGF0b3JzW3NjaGVtYS5mb3JtYXRdKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0dmFyIGVycm9yTWVzc2FnZSA9IHRoaXMuZm9ybWF0VmFsaWRhdG9yc1tzY2hlbWEuZm9ybWF0XS5jYWxsKG51bGwsIGRhdGEsIHNjaGVtYSk7XG5cdGlmICh0eXBlb2YgZXJyb3JNZXNzYWdlID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgZXJyb3JNZXNzYWdlID09PSAnbnVtYmVyJykge1xuXHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuRk9STUFUX0NVU1RPTSwge21lc3NhZ2U6IGVycm9yTWVzc2FnZX0pLnByZWZpeFdpdGgobnVsbCwgXCJmb3JtYXRcIik7XG5cdH0gZWxzZSBpZiAoZXJyb3JNZXNzYWdlICYmIHR5cGVvZiBlcnJvck1lc3NhZ2UgPT09ICdvYmplY3QnKSB7XG5cdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5GT1JNQVRfQ1VTVE9NLCB7bWVzc2FnZTogZXJyb3JNZXNzYWdlLm1lc3NhZ2UgfHwgXCI/XCJ9LCBlcnJvck1lc3NhZ2UuZGF0YVBhdGggfHwgbnVsbCwgZXJyb3JNZXNzYWdlLnNjaGVtYVBhdGggfHwgXCIvZm9ybWF0XCIpO1xuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlRGVmaW5lZEtleXdvcmRzID0gZnVuY3Rpb24gKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKSB7XG5cdGZvciAodmFyIGtleSBpbiB0aGlzLmRlZmluZWRLZXl3b3Jkcykge1xuXHRcdGlmICh0eXBlb2Ygc2NoZW1hW2tleV0gPT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cdFx0dmFyIHZhbGlkYXRpb25GdW5jdGlvbnMgPSB0aGlzLmRlZmluZWRLZXl3b3Jkc1trZXldO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdmFsaWRhdGlvbkZ1bmN0aW9ucy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGZ1bmMgPSB2YWxpZGF0aW9uRnVuY3Rpb25zW2ldO1xuXHRcdFx0dmFyIHJlc3VsdCA9IGZ1bmMoZGF0YSwgc2NoZW1hW2tleV0sIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKTtcblx0XHRcdGlmICh0eXBlb2YgcmVzdWx0ID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgcmVzdWx0ID09PSAnbnVtYmVyJykge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLktFWVdPUkRfQ1VTVE9NLCB7a2V5OiBrZXksIG1lc3NhZ2U6IHJlc3VsdH0pLnByZWZpeFdpdGgobnVsbCwgXCJmb3JtYXRcIik7XG5cdFx0XHR9IGVsc2UgaWYgKHJlc3VsdCAmJiB0eXBlb2YgcmVzdWx0ID09PSAnb2JqZWN0Jykge1xuXHRcdFx0XHR2YXIgY29kZSA9IHJlc3VsdC5jb2RlO1xuXHRcdFx0XHRpZiAodHlwZW9mIGNvZGUgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRcdFx0aWYgKCFFcnJvckNvZGVzW2NvZGVdKSB7XG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ1VuZGVmaW5lZCBlcnJvciBjb2RlICh1c2UgZGVmaW5lRXJyb3IpOiAnICsgY29kZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvZGUgPSBFcnJvckNvZGVzW2NvZGVdO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHR5cGVvZiBjb2RlICE9PSAnbnVtYmVyJykge1xuXHRcdFx0XHRcdGNvZGUgPSBFcnJvckNvZGVzLktFWVdPUkRfQ1VTVE9NO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHZhciBtZXNzYWdlUGFyYW1zID0gKHR5cGVvZiByZXN1bHQubWVzc2FnZSA9PT0gJ29iamVjdCcpID8gcmVzdWx0Lm1lc3NhZ2UgOiB7a2V5OiBrZXksIG1lc3NhZ2U6IHJlc3VsdC5tZXNzYWdlIHx8IFwiP1wifTtcblx0XHRcdFx0dmFyIHNjaGVtYVBhdGggPSByZXN1bHQuc2NoZW1hUGF0aCB8fCggXCIvXCIgKyBrZXkucmVwbGFjZSgvfi9nLCAnfjAnKS5yZXBsYWNlKC9cXC8vZywgJ34xJykpO1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihjb2RlLCBtZXNzYWdlUGFyYW1zLCByZXN1bHQuZGF0YVBhdGggfHwgbnVsbCwgc2NoZW1hUGF0aCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuZnVuY3Rpb24gcmVjdXJzaXZlQ29tcGFyZShBLCBCKSB7XG5cdGlmIChBID09PSBCKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblx0aWYgKHR5cGVvZiBBID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBCID09PSBcIm9iamVjdFwiKSB7XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkoQSkgIT09IEFycmF5LmlzQXJyYXkoQikpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoQSkpIHtcblx0XHRcdGlmIChBLmxlbmd0aCAhPT0gQi5sZW5ndGgpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBBLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmICghcmVjdXJzaXZlQ29tcGFyZShBW2ldLCBCW2ldKSkge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIga2V5O1xuXHRcdFx0Zm9yIChrZXkgaW4gQSkge1xuXHRcdFx0XHRpZiAoQltrZXldID09PSB1bmRlZmluZWQgJiYgQVtrZXldICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGZvciAoa2V5IGluIEIpIHtcblx0XHRcdFx0aWYgKEFba2V5XSA9PT0gdW5kZWZpbmVkICYmIEJba2V5XSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRmb3IgKGtleSBpbiBBKSB7XG5cdFx0XHRcdGlmICghcmVjdXJzaXZlQ29tcGFyZShBW2tleV0sIEJba2V5XSkpIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufVxuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZUJhc2ljID0gZnVuY3Rpb24gdmFsaWRhdGVCYXNpYyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aCkge1xuXHR2YXIgZXJyb3I7XG5cdGlmIChlcnJvciA9IHRoaXMudmFsaWRhdGVUeXBlKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKSkge1xuXHRcdHJldHVybiBlcnJvci5wcmVmaXhXaXRoKG51bGwsIFwidHlwZVwiKTtcblx0fVxuXHRpZiAoZXJyb3IgPSB0aGlzLnZhbGlkYXRlRW51bShkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aCkpIHtcblx0XHRyZXR1cm4gZXJyb3IucHJlZml4V2l0aChudWxsLCBcInR5cGVcIik7XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZVR5cGUgPSBmdW5jdGlvbiB2YWxpZGF0ZVR5cGUoZGF0YSwgc2NoZW1hKSB7XG5cdGlmIChzY2hlbWEudHlwZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0dmFyIGRhdGFUeXBlID0gdHlwZW9mIGRhdGE7XG5cdGlmIChkYXRhID09PSBudWxsKSB7XG5cdFx0ZGF0YVR5cGUgPSBcIm51bGxcIjtcblx0fSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGRhdGEpKSB7XG5cdFx0ZGF0YVR5cGUgPSBcImFycmF5XCI7XG5cdH1cblx0dmFyIGFsbG93ZWRUeXBlcyA9IHNjaGVtYS50eXBlO1xuXHRpZiAodHlwZW9mIGFsbG93ZWRUeXBlcyAhPT0gXCJvYmplY3RcIikge1xuXHRcdGFsbG93ZWRUeXBlcyA9IFthbGxvd2VkVHlwZXNdO1xuXHR9XG5cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhbGxvd2VkVHlwZXMubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgdHlwZSA9IGFsbG93ZWRUeXBlc1tpXTtcblx0XHRpZiAodHlwZSA9PT0gZGF0YVR5cGUgfHwgKHR5cGUgPT09IFwiaW50ZWdlclwiICYmIGRhdGFUeXBlID09PSBcIm51bWJlclwiICYmIChkYXRhICUgMSA9PT0gMCkpKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5JTlZBTElEX1RZUEUsIHt0eXBlOiBkYXRhVHlwZSwgZXhwZWN0ZWQ6IGFsbG93ZWRUeXBlcy5qb2luKFwiL1wiKX0pO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVFbnVtID0gZnVuY3Rpb24gdmFsaWRhdGVFbnVtKGRhdGEsIHNjaGVtYSkge1xuXHRpZiAoc2NoZW1hW1wiZW51bVwiXSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzY2hlbWFbXCJlbnVtXCJdLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIGVudW1WYWwgPSBzY2hlbWFbXCJlbnVtXCJdW2ldO1xuXHRcdGlmIChyZWN1cnNpdmVDb21wYXJlKGRhdGEsIGVudW1WYWwpKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5FTlVNX01JU01BVENILCB7dmFsdWU6ICh0eXBlb2YgSlNPTiAhPT0gJ3VuZGVmaW5lZCcpID8gSlNPTi5zdHJpbmdpZnkoZGF0YSkgOiBkYXRhfSk7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZU51bWVyaWMgPSBmdW5jdGlvbiB2YWxpZGF0ZU51bWVyaWMoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpIHtcblx0cmV0dXJuIHRoaXMudmFsaWRhdGVNdWx0aXBsZU9mKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVNaW5NYXgoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZU5hTihkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCBudWxsO1xufTtcblxudmFyIENMT1NFX0VOT1VHSF9MT1cgPSBNYXRoLnBvdygyLCAtNTEpO1xudmFyIENMT1NFX0VOT1VHSF9ISUdIID0gMSAtIENMT1NFX0VOT1VHSF9MT1c7XG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZU11bHRpcGxlT2YgPSBmdW5jdGlvbiB2YWxpZGF0ZU11bHRpcGxlT2YoZGF0YSwgc2NoZW1hKSB7XG5cdHZhciBtdWx0aXBsZU9mID0gc2NoZW1hLm11bHRpcGxlT2YgfHwgc2NoZW1hLmRpdmlzaWJsZUJ5O1xuXHRpZiAobXVsdGlwbGVPZiA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0aWYgKHR5cGVvZiBkYXRhID09PSBcIm51bWJlclwiKSB7XG5cdFx0dmFyIHJlbWFpbmRlciA9IChkYXRhL211bHRpcGxlT2YpJTE7XG5cdFx0aWYgKHJlbWFpbmRlciA+PSBDTE9TRV9FTk9VR0hfTE9XICYmIHJlbWFpbmRlciA8IENMT1NFX0VOT1VHSF9ISUdIKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLk5VTUJFUl9NVUxUSVBMRV9PRiwge3ZhbHVlOiBkYXRhLCBtdWx0aXBsZU9mOiBtdWx0aXBsZU9mfSk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVNaW5NYXggPSBmdW5jdGlvbiB2YWxpZGF0ZU1pbk1heChkYXRhLCBzY2hlbWEpIHtcblx0aWYgKHR5cGVvZiBkYXRhICE9PSBcIm51bWJlclwiKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0aWYgKHNjaGVtYS5taW5pbXVtICE9PSB1bmRlZmluZWQpIHtcblx0XHRpZiAoZGF0YSA8IHNjaGVtYS5taW5pbXVtKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLk5VTUJFUl9NSU5JTVVNLCB7dmFsdWU6IGRhdGEsIG1pbmltdW06IHNjaGVtYS5taW5pbXVtfSkucHJlZml4V2l0aChudWxsLCBcIm1pbmltdW1cIik7XG5cdFx0fVxuXHRcdGlmIChzY2hlbWEuZXhjbHVzaXZlTWluaW11bSAmJiBkYXRhID09PSBzY2hlbWEubWluaW11bSkge1xuXHRcdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5OVU1CRVJfTUlOSU1VTV9FWENMVVNJVkUsIHt2YWx1ZTogZGF0YSwgbWluaW11bTogc2NoZW1hLm1pbmltdW19KS5wcmVmaXhXaXRoKG51bGwsIFwiZXhjbHVzaXZlTWluaW11bVwiKTtcblx0XHR9XG5cdH1cblx0aWYgKHNjaGVtYS5tYXhpbXVtICE9PSB1bmRlZmluZWQpIHtcblx0XHRpZiAoZGF0YSA+IHNjaGVtYS5tYXhpbXVtKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLk5VTUJFUl9NQVhJTVVNLCB7dmFsdWU6IGRhdGEsIG1heGltdW06IHNjaGVtYS5tYXhpbXVtfSkucHJlZml4V2l0aChudWxsLCBcIm1heGltdW1cIik7XG5cdFx0fVxuXHRcdGlmIChzY2hlbWEuZXhjbHVzaXZlTWF4aW11bSAmJiBkYXRhID09PSBzY2hlbWEubWF4aW11bSkge1xuXHRcdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5OVU1CRVJfTUFYSU1VTV9FWENMVVNJVkUsIHt2YWx1ZTogZGF0YSwgbWF4aW11bTogc2NoZW1hLm1heGltdW19KS5wcmVmaXhXaXRoKG51bGwsIFwiZXhjbHVzaXZlTWF4aW11bVwiKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZU5hTiA9IGZ1bmN0aW9uIHZhbGlkYXRlTmFOKGRhdGEpIHtcblx0aWYgKHR5cGVvZiBkYXRhICE9PSBcIm51bWJlclwiKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0aWYgKGlzTmFOKGRhdGEpID09PSB0cnVlIHx8IGRhdGEgPT09IEluZmluaXR5IHx8IGRhdGEgPT09IC1JbmZpbml0eSkge1xuXHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuTlVNQkVSX05PVF9BX05VTUJFUiwge3ZhbHVlOiBkYXRhfSkucHJlZml4V2l0aChudWxsLCBcInR5cGVcIik7XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZVN0cmluZyA9IGZ1bmN0aW9uIHZhbGlkYXRlU3RyaW5nKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKSB7XG5cdHJldHVybiB0aGlzLnZhbGlkYXRlU3RyaW5nTGVuZ3RoKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVTdHJpbmdQYXR0ZXJuKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZVN0cmluZ0xlbmd0aCA9IGZ1bmN0aW9uIHZhbGlkYXRlU3RyaW5nTGVuZ3RoKGRhdGEsIHNjaGVtYSkge1xuXHRpZiAodHlwZW9mIGRhdGEgIT09IFwic3RyaW5nXCIpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHRpZiAoc2NoZW1hLm1pbkxlbmd0aCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0aWYgKGRhdGEubGVuZ3RoIDwgc2NoZW1hLm1pbkxlbmd0aCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5TVFJJTkdfTEVOR1RIX1NIT1JULCB7bGVuZ3RoOiBkYXRhLmxlbmd0aCwgbWluaW11bTogc2NoZW1hLm1pbkxlbmd0aH0pLnByZWZpeFdpdGgobnVsbCwgXCJtaW5MZW5ndGhcIik7XG5cdFx0fVxuXHR9XG5cdGlmIChzY2hlbWEubWF4TGVuZ3RoICE9PSB1bmRlZmluZWQpIHtcblx0XHRpZiAoZGF0YS5sZW5ndGggPiBzY2hlbWEubWF4TGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLlNUUklOR19MRU5HVEhfTE9ORywge2xlbmd0aDogZGF0YS5sZW5ndGgsIG1heGltdW06IHNjaGVtYS5tYXhMZW5ndGh9KS5wcmVmaXhXaXRoKG51bGwsIFwibWF4TGVuZ3RoXCIpO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlU3RyaW5nUGF0dGVybiA9IGZ1bmN0aW9uIHZhbGlkYXRlU3RyaW5nUGF0dGVybihkYXRhLCBzY2hlbWEpIHtcblx0aWYgKHR5cGVvZiBkYXRhICE9PSBcInN0cmluZ1wiIHx8IHNjaGVtYS5wYXR0ZXJuID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHR2YXIgcmVnZXhwID0gbmV3IFJlZ0V4cChzY2hlbWEucGF0dGVybik7XG5cdGlmICghcmVnZXhwLnRlc3QoZGF0YSkpIHtcblx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLlNUUklOR19QQVRURVJOLCB7cGF0dGVybjogc2NoZW1hLnBhdHRlcm59KS5wcmVmaXhXaXRoKG51bGwsIFwicGF0dGVyblwiKTtcblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZUFycmF5ID0gZnVuY3Rpb24gdmFsaWRhdGVBcnJheShkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aCkge1xuXHRpZiAoIUFycmF5LmlzQXJyYXkoZGF0YSkpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHRyZXR1cm4gdGhpcy52YWxpZGF0ZUFycmF5TGVuZ3RoKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVBcnJheVVuaXF1ZUl0ZW1zKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVBcnJheUl0ZW1zKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZUFycmF5TGVuZ3RoID0gZnVuY3Rpb24gdmFsaWRhdGVBcnJheUxlbmd0aChkYXRhLCBzY2hlbWEpIHtcblx0dmFyIGVycm9yO1xuXHRpZiAoc2NoZW1hLm1pbkl0ZW1zICE9PSB1bmRlZmluZWQpIHtcblx0XHRpZiAoZGF0YS5sZW5ndGggPCBzY2hlbWEubWluSXRlbXMpIHtcblx0XHRcdGVycm9yID0gKHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5BUlJBWV9MRU5HVEhfU0hPUlQsIHtsZW5ndGg6IGRhdGEubGVuZ3RoLCBtaW5pbXVtOiBzY2hlbWEubWluSXRlbXN9KSkucHJlZml4V2l0aChudWxsLCBcIm1pbkl0ZW1zXCIpO1xuXHRcdFx0aWYgKHRoaXMuaGFuZGxlRXJyb3IoZXJyb3IpKSB7XG5cdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0aWYgKHNjaGVtYS5tYXhJdGVtcyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0aWYgKGRhdGEubGVuZ3RoID4gc2NoZW1hLm1heEl0ZW1zKSB7XG5cdFx0XHRlcnJvciA9ICh0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuQVJSQVlfTEVOR1RIX0xPTkcsIHtsZW5ndGg6IGRhdGEubGVuZ3RoLCBtYXhpbXVtOiBzY2hlbWEubWF4SXRlbXN9KSkucHJlZml4V2l0aChudWxsLCBcIm1heEl0ZW1zXCIpO1xuXHRcdFx0aWYgKHRoaXMuaGFuZGxlRXJyb3IoZXJyb3IpKSB7XG5cdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZUFycmF5VW5pcXVlSXRlbXMgPSBmdW5jdGlvbiB2YWxpZGF0ZUFycmF5VW5pcXVlSXRlbXMoZGF0YSwgc2NoZW1hKSB7XG5cdGlmIChzY2hlbWEudW5pcXVlSXRlbXMpIHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcblx0XHRcdGZvciAodmFyIGogPSBpICsgMTsgaiA8IGRhdGEubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0aWYgKHJlY3Vyc2l2ZUNvbXBhcmUoZGF0YVtpXSwgZGF0YVtqXSkpIHtcblx0XHRcdFx0XHR2YXIgZXJyb3IgPSAodGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLkFSUkFZX1VOSVFVRSwge21hdGNoMTogaSwgbWF0Y2gyOiBqfSkpLnByZWZpeFdpdGgobnVsbCwgXCJ1bmlxdWVJdGVtc1wiKTtcblx0XHRcdFx0XHRpZiAodGhpcy5oYW5kbGVFcnJvcihlcnJvcikpIHtcblx0XHRcdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZUFycmF5SXRlbXMgPSBmdW5jdGlvbiB2YWxpZGF0ZUFycmF5SXRlbXMoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpIHtcblx0aWYgKHNjaGVtYS5pdGVtcyA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0dmFyIGVycm9yLCBpO1xuXHRpZiAoQXJyYXkuaXNBcnJheShzY2hlbWEuaXRlbXMpKSB7XG5cdFx0Zm9yIChpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmIChpIDwgc2NoZW1hLml0ZW1zLmxlbmd0aCkge1xuXHRcdFx0XHRpZiAoZXJyb3IgPSB0aGlzLnZhbGlkYXRlQWxsKGRhdGFbaV0sIHNjaGVtYS5pdGVtc1tpXSwgW2ldLCBbXCJpdGVtc1wiLCBpXSwgZGF0YVBvaW50ZXJQYXRoICsgXCIvXCIgKyBpKSkge1xuXHRcdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChzY2hlbWEuYWRkaXRpb25hbEl0ZW1zICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBzY2hlbWEuYWRkaXRpb25hbEl0ZW1zID09PSBcImJvb2xlYW5cIikge1xuXHRcdFx0XHRcdGlmICghc2NoZW1hLmFkZGl0aW9uYWxJdGVtcykge1xuXHRcdFx0XHRcdFx0ZXJyb3IgPSAodGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLkFSUkFZX0FERElUSU9OQUxfSVRFTVMsIHt9KSkucHJlZml4V2l0aChcIlwiICsgaSwgXCJhZGRpdGlvbmFsSXRlbXNcIik7XG5cdFx0XHRcdFx0XHRpZiAodGhpcy5oYW5kbGVFcnJvcihlcnJvcikpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIGlmIChlcnJvciA9IHRoaXMudmFsaWRhdGVBbGwoZGF0YVtpXSwgc2NoZW1hLmFkZGl0aW9uYWxJdGVtcywgW2ldLCBbXCJhZGRpdGlvbmFsSXRlbXNcIl0sIGRhdGFQb2ludGVyUGF0aCArIFwiL1wiICsgaSkpIHtcblx0XHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0Zm9yIChpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmIChlcnJvciA9IHRoaXMudmFsaWRhdGVBbGwoZGF0YVtpXSwgc2NoZW1hLml0ZW1zLCBbaV0sIFtcIml0ZW1zXCJdLCBkYXRhUG9pbnRlclBhdGggKyBcIi9cIiArIGkpKSB7XG5cdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZU9iamVjdCA9IGZ1bmN0aW9uIHZhbGlkYXRlT2JqZWN0KGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKSB7XG5cdGlmICh0eXBlb2YgZGF0YSAhPT0gXCJvYmplY3RcIiB8fCBkYXRhID09PSBudWxsIHx8IEFycmF5LmlzQXJyYXkoZGF0YSkpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHRyZXR1cm4gdGhpcy52YWxpZGF0ZU9iamVjdE1pbk1heFByb3BlcnRpZXMoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZU9iamVjdFJlcXVpcmVkUHJvcGVydGllcyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCB0aGlzLnZhbGlkYXRlT2JqZWN0UHJvcGVydGllcyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCB0aGlzLnZhbGlkYXRlT2JqZWN0RGVwZW5kZW5jaWVzKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZU9iamVjdE1pbk1heFByb3BlcnRpZXMgPSBmdW5jdGlvbiB2YWxpZGF0ZU9iamVjdE1pbk1heFByb3BlcnRpZXMoZGF0YSwgc2NoZW1hKSB7XG5cdHZhciBrZXlzID0gT2JqZWN0LmtleXMoZGF0YSk7XG5cdHZhciBlcnJvcjtcblx0aWYgKHNjaGVtYS5taW5Qcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQpIHtcblx0XHRpZiAoa2V5cy5sZW5ndGggPCBzY2hlbWEubWluUHJvcGVydGllcykge1xuXHRcdFx0ZXJyb3IgPSB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuT0JKRUNUX1BST1BFUlRJRVNfTUlOSU1VTSwge3Byb3BlcnR5Q291bnQ6IGtleXMubGVuZ3RoLCBtaW5pbXVtOiBzY2hlbWEubWluUHJvcGVydGllc30pLnByZWZpeFdpdGgobnVsbCwgXCJtaW5Qcm9wZXJ0aWVzXCIpO1xuXHRcdFx0aWYgKHRoaXMuaGFuZGxlRXJyb3IoZXJyb3IpKSB7XG5cdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0aWYgKHNjaGVtYS5tYXhQcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQpIHtcblx0XHRpZiAoa2V5cy5sZW5ndGggPiBzY2hlbWEubWF4UHJvcGVydGllcykge1xuXHRcdFx0ZXJyb3IgPSB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuT0JKRUNUX1BST1BFUlRJRVNfTUFYSU1VTSwge3Byb3BlcnR5Q291bnQ6IGtleXMubGVuZ3RoLCBtYXhpbXVtOiBzY2hlbWEubWF4UHJvcGVydGllc30pLnByZWZpeFdpdGgobnVsbCwgXCJtYXhQcm9wZXJ0aWVzXCIpO1xuXHRcdFx0aWYgKHRoaXMuaGFuZGxlRXJyb3IoZXJyb3IpKSB7XG5cdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZU9iamVjdFJlcXVpcmVkUHJvcGVydGllcyA9IGZ1bmN0aW9uIHZhbGlkYXRlT2JqZWN0UmVxdWlyZWRQcm9wZXJ0aWVzKGRhdGEsIHNjaGVtYSkge1xuXHRpZiAoc2NoZW1hLnJlcXVpcmVkICE9PSB1bmRlZmluZWQpIHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNjaGVtYS5yZXF1aXJlZC5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGtleSA9IHNjaGVtYS5yZXF1aXJlZFtpXTtcblx0XHRcdGlmIChkYXRhW2tleV0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHR2YXIgZXJyb3IgPSB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuT0JKRUNUX1JFUVVJUkVELCB7a2V5OiBrZXl9KS5wcmVmaXhXaXRoKG51bGwsIFwiXCIgKyBpKS5wcmVmaXhXaXRoKG51bGwsIFwicmVxdWlyZWRcIik7XG5cdFx0XHRcdGlmICh0aGlzLmhhbmRsZUVycm9yKGVycm9yKSkge1xuXHRcdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlT2JqZWN0UHJvcGVydGllcyA9IGZ1bmN0aW9uIHZhbGlkYXRlT2JqZWN0UHJvcGVydGllcyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aCkge1xuXHR2YXIgZXJyb3I7XG5cdGZvciAodmFyIGtleSBpbiBkYXRhKSB7XG5cdFx0dmFyIGtleVBvaW50ZXJQYXRoID0gZGF0YVBvaW50ZXJQYXRoICsgXCIvXCIgKyBrZXkucmVwbGFjZSgvfi9nLCAnfjAnKS5yZXBsYWNlKC9cXC8vZywgJ34xJyk7XG5cdFx0dmFyIGZvdW5kTWF0Y2ggPSBmYWxzZTtcblx0XHRpZiAoc2NoZW1hLnByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCAmJiBzY2hlbWEucHJvcGVydGllc1trZXldICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdGZvdW5kTWF0Y2ggPSB0cnVlO1xuXHRcdFx0aWYgKGVycm9yID0gdGhpcy52YWxpZGF0ZUFsbChkYXRhW2tleV0sIHNjaGVtYS5wcm9wZXJ0aWVzW2tleV0sIFtrZXldLCBbXCJwcm9wZXJ0aWVzXCIsIGtleV0sIGtleVBvaW50ZXJQYXRoKSkge1xuXHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChzY2hlbWEucGF0dGVyblByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Zm9yICh2YXIgcGF0dGVybktleSBpbiBzY2hlbWEucGF0dGVyblByb3BlcnRpZXMpIHtcblx0XHRcdFx0dmFyIHJlZ2V4cCA9IG5ldyBSZWdFeHAocGF0dGVybktleSk7XG5cdFx0XHRcdGlmIChyZWdleHAudGVzdChrZXkpKSB7XG5cdFx0XHRcdFx0Zm91bmRNYXRjaCA9IHRydWU7XG5cdFx0XHRcdFx0aWYgKGVycm9yID0gdGhpcy52YWxpZGF0ZUFsbChkYXRhW2tleV0sIHNjaGVtYS5wYXR0ZXJuUHJvcGVydGllc1twYXR0ZXJuS2V5XSwgW2tleV0sIFtcInBhdHRlcm5Qcm9wZXJ0aWVzXCIsIHBhdHRlcm5LZXldLCBrZXlQb2ludGVyUGF0aCkpIHtcblx0XHRcdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKCFmb3VuZE1hdGNoKSB7XG5cdFx0XHRpZiAoc2NoZW1hLmFkZGl0aW9uYWxQcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0aWYgKHRoaXMudHJhY2tVbmtub3duUHJvcGVydGllcykge1xuXHRcdFx0XHRcdHRoaXMua25vd25Qcm9wZXJ0eVBhdGhzW2tleVBvaW50ZXJQYXRoXSA9IHRydWU7XG5cdFx0XHRcdFx0ZGVsZXRlIHRoaXMudW5rbm93blByb3BlcnR5UGF0aHNba2V5UG9pbnRlclBhdGhdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICh0eXBlb2Ygc2NoZW1hLmFkZGl0aW9uYWxQcm9wZXJ0aWVzID09PSBcImJvb2xlYW5cIikge1xuXHRcdFx0XHRcdGlmICghc2NoZW1hLmFkZGl0aW9uYWxQcm9wZXJ0aWVzKSB7XG5cdFx0XHRcdFx0XHRlcnJvciA9IHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5PQkpFQ1RfQURESVRJT05BTF9QUk9QRVJUSUVTLCB7fSkucHJlZml4V2l0aChrZXksIFwiYWRkaXRpb25hbFByb3BlcnRpZXNcIik7XG5cdFx0XHRcdFx0XHRpZiAodGhpcy5oYW5kbGVFcnJvcihlcnJvcikpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRpZiAoZXJyb3IgPSB0aGlzLnZhbGlkYXRlQWxsKGRhdGFba2V5XSwgc2NoZW1hLmFkZGl0aW9uYWxQcm9wZXJ0aWVzLCBba2V5XSwgW1wiYWRkaXRpb25hbFByb3BlcnRpZXNcIl0sIGtleVBvaW50ZXJQYXRoKSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmICh0aGlzLnRyYWNrVW5rbm93blByb3BlcnRpZXMgJiYgIXRoaXMua25vd25Qcm9wZXJ0eVBhdGhzW2tleVBvaW50ZXJQYXRoXSkge1xuXHRcdFx0XHR0aGlzLnVua25vd25Qcm9wZXJ0eVBhdGhzW2tleVBvaW50ZXJQYXRoXSA9IHRydWU7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICh0aGlzLnRyYWNrVW5rbm93blByb3BlcnRpZXMpIHtcblx0XHRcdHRoaXMua25vd25Qcm9wZXJ0eVBhdGhzW2tleVBvaW50ZXJQYXRoXSA9IHRydWU7XG5cdFx0XHRkZWxldGUgdGhpcy51bmtub3duUHJvcGVydHlQYXRoc1trZXlQb2ludGVyUGF0aF07XG5cdFx0fVxuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVPYmplY3REZXBlbmRlbmNpZXMgPSBmdW5jdGlvbiB2YWxpZGF0ZU9iamVjdERlcGVuZGVuY2llcyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aCkge1xuXHR2YXIgZXJyb3I7XG5cdGlmIChzY2hlbWEuZGVwZW5kZW5jaWVzICE9PSB1bmRlZmluZWQpIHtcblx0XHRmb3IgKHZhciBkZXBLZXkgaW4gc2NoZW1hLmRlcGVuZGVuY2llcykge1xuXHRcdFx0aWYgKGRhdGFbZGVwS2V5XSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHZhciBkZXAgPSBzY2hlbWEuZGVwZW5kZW5jaWVzW2RlcEtleV07XG5cdFx0XHRcdGlmICh0eXBlb2YgZGVwID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdFx0aWYgKGRhdGFbZGVwXSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHRlcnJvciA9IHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5PQkpFQ1RfREVQRU5ERU5DWV9LRVksIHtrZXk6IGRlcEtleSwgbWlzc2luZzogZGVwfSkucHJlZml4V2l0aChudWxsLCBkZXBLZXkpLnByZWZpeFdpdGgobnVsbCwgXCJkZXBlbmRlbmNpZXNcIik7XG5cdFx0XHRcdFx0XHRpZiAodGhpcy5oYW5kbGVFcnJvcihlcnJvcikpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGRlcCkpIHtcblx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGRlcC5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0dmFyIHJlcXVpcmVkS2V5ID0gZGVwW2ldO1xuXHRcdFx0XHRcdFx0aWYgKGRhdGFbcmVxdWlyZWRLZXldID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdFx0ZXJyb3IgPSB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuT0JKRUNUX0RFUEVOREVOQ1lfS0VZLCB7a2V5OiBkZXBLZXksIG1pc3Npbmc6IHJlcXVpcmVkS2V5fSkucHJlZml4V2l0aChudWxsLCBcIlwiICsgaSkucHJlZml4V2l0aChudWxsLCBkZXBLZXkpLnByZWZpeFdpdGgobnVsbCwgXCJkZXBlbmRlbmNpZXNcIik7XG5cdFx0XHRcdFx0XHRcdGlmICh0aGlzLmhhbmRsZUVycm9yKGVycm9yKSkge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRpZiAoZXJyb3IgPSB0aGlzLnZhbGlkYXRlQWxsKGRhdGEsIGRlcCwgW10sIFtcImRlcGVuZGVuY2llc1wiLCBkZXBLZXldLCBkYXRhUG9pbnRlclBhdGgpKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVDb21iaW5hdGlvbnMgPSBmdW5jdGlvbiB2YWxpZGF0ZUNvbWJpbmF0aW9ucyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aCkge1xuXHRyZXR1cm4gdGhpcy52YWxpZGF0ZUFsbE9mKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVBbnlPZihkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCB0aGlzLnZhbGlkYXRlT25lT2YoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZU5vdChkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVBbGxPZiA9IGZ1bmN0aW9uIHZhbGlkYXRlQWxsT2YoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpIHtcblx0aWYgKHNjaGVtYS5hbGxPZiA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0dmFyIGVycm9yO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHNjaGVtYS5hbGxPZi5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBzdWJTY2hlbWEgPSBzY2hlbWEuYWxsT2ZbaV07XG5cdFx0aWYgKGVycm9yID0gdGhpcy52YWxpZGF0ZUFsbChkYXRhLCBzdWJTY2hlbWEsIFtdLCBbXCJhbGxPZlwiLCBpXSwgZGF0YVBvaW50ZXJQYXRoKSkge1xuXHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlQW55T2YgPSBmdW5jdGlvbiB2YWxpZGF0ZUFueU9mKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKSB7XG5cdGlmIChzY2hlbWEuYW55T2YgPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdHZhciBlcnJvcnMgPSBbXTtcblx0dmFyIHN0YXJ0RXJyb3JDb3VudCA9IHRoaXMuZXJyb3JzLmxlbmd0aDtcblx0dmFyIG9sZFVua25vd25Qcm9wZXJ0eVBhdGhzLCBvbGRLbm93blByb3BlcnR5UGF0aHM7XG5cdGlmICh0aGlzLnRyYWNrVW5rbm93blByb3BlcnRpZXMpIHtcblx0XHRvbGRVbmtub3duUHJvcGVydHlQYXRocyA9IHRoaXMudW5rbm93blByb3BlcnR5UGF0aHM7XG5cdFx0b2xkS25vd25Qcm9wZXJ0eVBhdGhzID0gdGhpcy5rbm93blByb3BlcnR5UGF0aHM7XG5cdH1cblx0dmFyIGVycm9yQXRFbmQgPSB0cnVlO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHNjaGVtYS5hbnlPZi5sZW5ndGg7IGkrKykge1xuXHRcdGlmICh0aGlzLnRyYWNrVW5rbm93blByb3BlcnRpZXMpIHtcblx0XHRcdHRoaXMudW5rbm93blByb3BlcnR5UGF0aHMgPSB7fTtcblx0XHRcdHRoaXMua25vd25Qcm9wZXJ0eVBhdGhzID0ge307XG5cdFx0fVxuXHRcdHZhciBzdWJTY2hlbWEgPSBzY2hlbWEuYW55T2ZbaV07XG5cblx0XHR2YXIgZXJyb3JDb3VudCA9IHRoaXMuZXJyb3JzLmxlbmd0aDtcblx0XHR2YXIgZXJyb3IgPSB0aGlzLnZhbGlkYXRlQWxsKGRhdGEsIHN1YlNjaGVtYSwgW10sIFtcImFueU9mXCIsIGldLCBkYXRhUG9pbnRlclBhdGgpO1xuXG5cdFx0aWYgKGVycm9yID09PSBudWxsICYmIGVycm9yQ291bnQgPT09IHRoaXMuZXJyb3JzLmxlbmd0aCkge1xuXHRcdFx0dGhpcy5lcnJvcnMgPSB0aGlzLmVycm9ycy5zbGljZSgwLCBzdGFydEVycm9yQ291bnQpO1xuXG5cdFx0XHRpZiAodGhpcy50cmFja1Vua25vd25Qcm9wZXJ0aWVzKSB7XG5cdFx0XHRcdGZvciAodmFyIGtub3duS2V5IGluIHRoaXMua25vd25Qcm9wZXJ0eVBhdGhzKSB7XG5cdFx0XHRcdFx0b2xkS25vd25Qcm9wZXJ0eVBhdGhzW2tub3duS2V5XSA9IHRydWU7XG5cdFx0XHRcdFx0ZGVsZXRlIG9sZFVua25vd25Qcm9wZXJ0eVBhdGhzW2tub3duS2V5XTtcblx0XHRcdFx0fVxuXHRcdFx0XHRmb3IgKHZhciB1bmtub3duS2V5IGluIHRoaXMudW5rbm93blByb3BlcnR5UGF0aHMpIHtcblx0XHRcdFx0XHRpZiAoIW9sZEtub3duUHJvcGVydHlQYXRoc1t1bmtub3duS2V5XSkge1xuXHRcdFx0XHRcdFx0b2xkVW5rbm93blByb3BlcnR5UGF0aHNbdW5rbm93bktleV0gPSB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBXZSBuZWVkIHRvIGNvbnRpbnVlIGxvb3Bpbmcgc28gd2UgY2F0Y2ggYWxsIHRoZSBwcm9wZXJ0eSBkZWZpbml0aW9ucywgYnV0IHdlIGRvbid0IHdhbnQgdG8gcmV0dXJuIGFuIGVycm9yXG5cdFx0XHRcdGVycm9yQXRFbmQgPSBmYWxzZTtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblx0XHRpZiAoZXJyb3IpIHtcblx0XHRcdGVycm9ycy5wdXNoKGVycm9yLnByZWZpeFdpdGgobnVsbCwgXCJcIiArIGkpLnByZWZpeFdpdGgobnVsbCwgXCJhbnlPZlwiKSk7XG5cdFx0fVxuXHR9XG5cdGlmICh0aGlzLnRyYWNrVW5rbm93blByb3BlcnRpZXMpIHtcblx0XHR0aGlzLnVua25vd25Qcm9wZXJ0eVBhdGhzID0gb2xkVW5rbm93blByb3BlcnR5UGF0aHM7XG5cdFx0dGhpcy5rbm93blByb3BlcnR5UGF0aHMgPSBvbGRLbm93blByb3BlcnR5UGF0aHM7XG5cdH1cblx0aWYgKGVycm9yQXRFbmQpIHtcblx0XHRlcnJvcnMgPSBlcnJvcnMuY29uY2F0KHRoaXMuZXJyb3JzLnNsaWNlKHN0YXJ0RXJyb3JDb3VudCkpO1xuXHRcdHRoaXMuZXJyb3JzID0gdGhpcy5lcnJvcnMuc2xpY2UoMCwgc3RhcnRFcnJvckNvdW50KTtcblx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLkFOWV9PRl9NSVNTSU5HLCB7fSwgXCJcIiwgXCIvYW55T2ZcIiwgZXJyb3JzKTtcblx0fVxufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVPbmVPZiA9IGZ1bmN0aW9uIHZhbGlkYXRlT25lT2YoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpIHtcblx0aWYgKHNjaGVtYS5vbmVPZiA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0dmFyIHZhbGlkSW5kZXggPSBudWxsO1xuXHR2YXIgZXJyb3JzID0gW107XG5cdHZhciBzdGFydEVycm9yQ291bnQgPSB0aGlzLmVycm9ycy5sZW5ndGg7XG5cdHZhciBvbGRVbmtub3duUHJvcGVydHlQYXRocywgb2xkS25vd25Qcm9wZXJ0eVBhdGhzO1xuXHRpZiAodGhpcy50cmFja1Vua25vd25Qcm9wZXJ0aWVzKSB7XG5cdFx0b2xkVW5rbm93blByb3BlcnR5UGF0aHMgPSB0aGlzLnVua25vd25Qcm9wZXJ0eVBhdGhzO1xuXHRcdG9sZEtub3duUHJvcGVydHlQYXRocyA9IHRoaXMua25vd25Qcm9wZXJ0eVBhdGhzO1xuXHR9XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgc2NoZW1hLm9uZU9mLmxlbmd0aDsgaSsrKSB7XG5cdFx0aWYgKHRoaXMudHJhY2tVbmtub3duUHJvcGVydGllcykge1xuXHRcdFx0dGhpcy51bmtub3duUHJvcGVydHlQYXRocyA9IHt9O1xuXHRcdFx0dGhpcy5rbm93blByb3BlcnR5UGF0aHMgPSB7fTtcblx0XHR9XG5cdFx0dmFyIHN1YlNjaGVtYSA9IHNjaGVtYS5vbmVPZltpXTtcblxuXHRcdHZhciBlcnJvckNvdW50ID0gdGhpcy5lcnJvcnMubGVuZ3RoO1xuXHRcdHZhciBlcnJvciA9IHRoaXMudmFsaWRhdGVBbGwoZGF0YSwgc3ViU2NoZW1hLCBbXSwgW1wib25lT2ZcIiwgaV0sIGRhdGFQb2ludGVyUGF0aCk7XG5cblx0XHRpZiAoZXJyb3IgPT09IG51bGwgJiYgZXJyb3JDb3VudCA9PT0gdGhpcy5lcnJvcnMubGVuZ3RoKSB7XG5cdFx0XHRpZiAodmFsaWRJbmRleCA9PT0gbnVsbCkge1xuXHRcdFx0XHR2YWxpZEluZGV4ID0gaTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuZXJyb3JzID0gdGhpcy5lcnJvcnMuc2xpY2UoMCwgc3RhcnRFcnJvckNvdW50KTtcblx0XHRcdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5PTkVfT0ZfTVVMVElQTEUsIHtpbmRleDE6IHZhbGlkSW5kZXgsIGluZGV4MjogaX0sIFwiXCIsIFwiL29uZU9mXCIpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHRoaXMudHJhY2tVbmtub3duUHJvcGVydGllcykge1xuXHRcdFx0XHRmb3IgKHZhciBrbm93bktleSBpbiB0aGlzLmtub3duUHJvcGVydHlQYXRocykge1xuXHRcdFx0XHRcdG9sZEtub3duUHJvcGVydHlQYXRoc1trbm93bktleV0gPSB0cnVlO1xuXHRcdFx0XHRcdGRlbGV0ZSBvbGRVbmtub3duUHJvcGVydHlQYXRoc1trbm93bktleV07XG5cdFx0XHRcdH1cblx0XHRcdFx0Zm9yICh2YXIgdW5rbm93bktleSBpbiB0aGlzLnVua25vd25Qcm9wZXJ0eVBhdGhzKSB7XG5cdFx0XHRcdFx0aWYgKCFvbGRLbm93blByb3BlcnR5UGF0aHNbdW5rbm93bktleV0pIHtcblx0XHRcdFx0XHRcdG9sZFVua25vd25Qcm9wZXJ0eVBhdGhzW3Vua25vd25LZXldID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKGVycm9yKSB7XG5cdFx0XHRlcnJvcnMucHVzaChlcnJvcik7XG5cdFx0fVxuXHR9XG5cdGlmICh0aGlzLnRyYWNrVW5rbm93blByb3BlcnRpZXMpIHtcblx0XHR0aGlzLnVua25vd25Qcm9wZXJ0eVBhdGhzID0gb2xkVW5rbm93blByb3BlcnR5UGF0aHM7XG5cdFx0dGhpcy5rbm93blByb3BlcnR5UGF0aHMgPSBvbGRLbm93blByb3BlcnR5UGF0aHM7XG5cdH1cblx0aWYgKHZhbGlkSW5kZXggPT09IG51bGwpIHtcblx0XHRlcnJvcnMgPSBlcnJvcnMuY29uY2F0KHRoaXMuZXJyb3JzLnNsaWNlKHN0YXJ0RXJyb3JDb3VudCkpO1xuXHRcdHRoaXMuZXJyb3JzID0gdGhpcy5lcnJvcnMuc2xpY2UoMCwgc3RhcnRFcnJvckNvdW50KTtcblx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLk9ORV9PRl9NSVNTSU5HLCB7fSwgXCJcIiwgXCIvb25lT2ZcIiwgZXJyb3JzKTtcblx0fSBlbHNlIHtcblx0XHR0aGlzLmVycm9ycyA9IHRoaXMuZXJyb3JzLnNsaWNlKDAsIHN0YXJ0RXJyb3JDb3VudCk7XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZU5vdCA9IGZ1bmN0aW9uIHZhbGlkYXRlTm90KGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKSB7XG5cdGlmIChzY2hlbWEubm90ID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHR2YXIgb2xkRXJyb3JDb3VudCA9IHRoaXMuZXJyb3JzLmxlbmd0aDtcblx0dmFyIG9sZFVua25vd25Qcm9wZXJ0eVBhdGhzLCBvbGRLbm93blByb3BlcnR5UGF0aHM7XG5cdGlmICh0aGlzLnRyYWNrVW5rbm93blByb3BlcnRpZXMpIHtcblx0XHRvbGRVbmtub3duUHJvcGVydHlQYXRocyA9IHRoaXMudW5rbm93blByb3BlcnR5UGF0aHM7XG5cdFx0b2xkS25vd25Qcm9wZXJ0eVBhdGhzID0gdGhpcy5rbm93blByb3BlcnR5UGF0aHM7XG5cdFx0dGhpcy51bmtub3duUHJvcGVydHlQYXRocyA9IHt9O1xuXHRcdHRoaXMua25vd25Qcm9wZXJ0eVBhdGhzID0ge307XG5cdH1cblx0dmFyIGVycm9yID0gdGhpcy52YWxpZGF0ZUFsbChkYXRhLCBzY2hlbWEubm90LCBudWxsLCBudWxsLCBkYXRhUG9pbnRlclBhdGgpO1xuXHR2YXIgbm90RXJyb3JzID0gdGhpcy5lcnJvcnMuc2xpY2Uob2xkRXJyb3JDb3VudCk7XG5cdHRoaXMuZXJyb3JzID0gdGhpcy5lcnJvcnMuc2xpY2UoMCwgb2xkRXJyb3JDb3VudCk7XG5cdGlmICh0aGlzLnRyYWNrVW5rbm93blByb3BlcnRpZXMpIHtcblx0XHR0aGlzLnVua25vd25Qcm9wZXJ0eVBhdGhzID0gb2xkVW5rbm93blByb3BlcnR5UGF0aHM7XG5cdFx0dGhpcy5rbm93blByb3BlcnR5UGF0aHMgPSBvbGRLbm93blByb3BlcnR5UGF0aHM7XG5cdH1cblx0aWYgKGVycm9yID09PSBudWxsICYmIG5vdEVycm9ycy5sZW5ndGggPT09IDApIHtcblx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLk5PVF9QQVNTRUQsIHt9LCBcIlwiLCBcIi9ub3RcIik7XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZUh5cGVybWVkaWEgPSBmdW5jdGlvbiB2YWxpZGF0ZUNvbWJpbmF0aW9ucyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aCkge1xuXHRpZiAoIXNjaGVtYS5saW5rcykge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdHZhciBlcnJvcjtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzY2hlbWEubGlua3MubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgbGRvID0gc2NoZW1hLmxpbmtzW2ldO1xuXHRcdGlmIChsZG8ucmVsID09PSBcImRlc2NyaWJlZGJ5XCIpIHtcblx0XHRcdHZhciB0ZW1wbGF0ZSA9IG5ldyBVcmlUZW1wbGF0ZShsZG8uaHJlZik7XG5cdFx0XHR2YXIgYWxsUHJlc2VudCA9IHRydWU7XG5cdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IHRlbXBsYXRlLnZhck5hbWVzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdGlmICghKHRlbXBsYXRlLnZhck5hbWVzW2pdIGluIGRhdGEpKSB7XG5cdFx0XHRcdFx0YWxsUHJlc2VudCA9IGZhbHNlO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAoYWxsUHJlc2VudCkge1xuXHRcdFx0XHR2YXIgc2NoZW1hVXJsID0gdGVtcGxhdGUuZmlsbEZyb21PYmplY3QoZGF0YSk7XG5cdFx0XHRcdHZhciBzdWJTY2hlbWEgPSB7XCIkcmVmXCI6IHNjaGVtYVVybH07XG5cdFx0XHRcdGlmIChlcnJvciA9IHRoaXMudmFsaWRhdGVBbGwoZGF0YSwgc3ViU2NoZW1hLCBbXSwgW1wibGlua3NcIiwgaV0sIGRhdGFQb2ludGVyUGF0aCkpIHtcblx0XHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cbn07XG5cbi8vIHBhcnNlVVJJKCkgYW5kIHJlc29sdmVVcmwoKSBhcmUgZnJvbSBodHRwczovL2dpc3QuZ2l0aHViLmNvbS8xMDg4ODUwXG4vLyAgIC0gIHJlbGVhc2VkIGFzIHB1YmxpYyBkb21haW4gYnkgYXV0aG9yIChcIllhZmZsZVwiKSAtIHNlZSBjb21tZW50cyBvbiBnaXN0XG5cbmZ1bmN0aW9uIHBhcnNlVVJJKHVybCkge1xuXHR2YXIgbSA9IFN0cmluZyh1cmwpLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKS5tYXRjaCgvXihbXjpcXC8/I10rOik/KFxcL1xcLyg/OlteOkBdKig/OjpbXjpAXSopP0ApPygoW146XFwvPyNdKikoPzo6KFxcZCopKT8pKT8oW14/I10qKShcXD9bXiNdKik/KCNbXFxzXFxTXSopPy8pO1xuXHQvLyBhdXRob3JpdHkgPSAnLy8nICsgdXNlciArICc6JyArIHBhc3MgJ0AnICsgaG9zdG5hbWUgKyAnOicgcG9ydFxuXHRyZXR1cm4gKG0gPyB7XG5cdFx0aHJlZiAgICAgOiBtWzBdIHx8ICcnLFxuXHRcdHByb3RvY29sIDogbVsxXSB8fCAnJyxcblx0XHRhdXRob3JpdHk6IG1bMl0gfHwgJycsXG5cdFx0aG9zdCAgICAgOiBtWzNdIHx8ICcnLFxuXHRcdGhvc3RuYW1lIDogbVs0XSB8fCAnJyxcblx0XHRwb3J0ICAgICA6IG1bNV0gfHwgJycsXG5cdFx0cGF0aG5hbWUgOiBtWzZdIHx8ICcnLFxuXHRcdHNlYXJjaCAgIDogbVs3XSB8fCAnJyxcblx0XHRoYXNoICAgICA6IG1bOF0gfHwgJydcblx0fSA6IG51bGwpO1xufVxuXG5mdW5jdGlvbiByZXNvbHZlVXJsKGJhc2UsIGhyZWYpIHsvLyBSRkMgMzk4NlxuXG5cdGZ1bmN0aW9uIHJlbW92ZURvdFNlZ21lbnRzKGlucHV0KSB7XG5cdFx0dmFyIG91dHB1dCA9IFtdO1xuXHRcdGlucHV0LnJlcGxhY2UoL14oXFwuXFwuPyhcXC98JCkpKy8sICcnKVxuXHRcdFx0LnJlcGxhY2UoL1xcLyhcXC4oXFwvfCQpKSsvZywgJy8nKVxuXHRcdFx0LnJlcGxhY2UoL1xcL1xcLlxcLiQvLCAnLy4uLycpXG5cdFx0XHQucmVwbGFjZSgvXFwvP1teXFwvXSovZywgZnVuY3Rpb24gKHApIHtcblx0XHRcdFx0aWYgKHAgPT09ICcvLi4nKSB7XG5cdFx0XHRcdFx0b3V0cHV0LnBvcCgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG91dHB1dC5wdXNoKHApO1xuXHRcdFx0XHR9XG5cdFx0fSk7XG5cdFx0cmV0dXJuIG91dHB1dC5qb2luKCcnKS5yZXBsYWNlKC9eXFwvLywgaW5wdXQuY2hhckF0KDApID09PSAnLycgPyAnLycgOiAnJyk7XG5cdH1cblxuXHRocmVmID0gcGFyc2VVUkkoaHJlZiB8fCAnJyk7XG5cdGJhc2UgPSBwYXJzZVVSSShiYXNlIHx8ICcnKTtcblxuXHRyZXR1cm4gIWhyZWYgfHwgIWJhc2UgPyBudWxsIDogKGhyZWYucHJvdG9jb2wgfHwgYmFzZS5wcm90b2NvbCkgK1xuXHRcdChocmVmLnByb3RvY29sIHx8IGhyZWYuYXV0aG9yaXR5ID8gaHJlZi5hdXRob3JpdHkgOiBiYXNlLmF1dGhvcml0eSkgK1xuXHRcdHJlbW92ZURvdFNlZ21lbnRzKGhyZWYucHJvdG9jb2wgfHwgaHJlZi5hdXRob3JpdHkgfHwgaHJlZi5wYXRobmFtZS5jaGFyQXQoMCkgPT09ICcvJyA/IGhyZWYucGF0aG5hbWUgOiAoaHJlZi5wYXRobmFtZSA/ICgoYmFzZS5hdXRob3JpdHkgJiYgIWJhc2UucGF0aG5hbWUgPyAnLycgOiAnJykgKyBiYXNlLnBhdGhuYW1lLnNsaWNlKDAsIGJhc2UucGF0aG5hbWUubGFzdEluZGV4T2YoJy8nKSArIDEpICsgaHJlZi5wYXRobmFtZSkgOiBiYXNlLnBhdGhuYW1lKSkgK1xuXHRcdChocmVmLnByb3RvY29sIHx8IGhyZWYuYXV0aG9yaXR5IHx8IGhyZWYucGF0aG5hbWUgPyBocmVmLnNlYXJjaCA6IChocmVmLnNlYXJjaCB8fCBiYXNlLnNlYXJjaCkpICtcblx0XHRocmVmLmhhc2g7XG59XG5cbmZ1bmN0aW9uIGdldERvY3VtZW50VXJpKHVyaSkge1xuXHRyZXR1cm4gdXJpLnNwbGl0KCcjJylbMF07XG59XG5mdW5jdGlvbiBub3JtU2NoZW1hKHNjaGVtYSwgYmFzZVVyaSkge1xuXHRpZiAoc2NoZW1hICYmIHR5cGVvZiBzY2hlbWEgPT09IFwib2JqZWN0XCIpIHtcblx0XHRpZiAoYmFzZVVyaSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRiYXNlVXJpID0gc2NoZW1hLmlkO1xuXHRcdH0gZWxzZSBpZiAodHlwZW9mIHNjaGVtYS5pZCA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0YmFzZVVyaSA9IHJlc29sdmVVcmwoYmFzZVVyaSwgc2NoZW1hLmlkKTtcblx0XHRcdHNjaGVtYS5pZCA9IGJhc2VVcmk7XG5cdFx0fVxuXHRcdGlmIChBcnJheS5pc0FycmF5KHNjaGVtYSkpIHtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc2NoZW1hLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdG5vcm1TY2hlbWEoc2NoZW1hW2ldLCBiYXNlVXJpKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKHR5cGVvZiBzY2hlbWFbJyRyZWYnXSA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRzY2hlbWFbJyRyZWYnXSA9IHJlc29sdmVVcmwoYmFzZVVyaSwgc2NoZW1hWyckcmVmJ10pO1xuXHRcdFx0fVxuXHRcdFx0Zm9yICh2YXIga2V5IGluIHNjaGVtYSkge1xuXHRcdFx0XHRpZiAoa2V5ICE9PSBcImVudW1cIikge1xuXHRcdFx0XHRcdG5vcm1TY2hlbWEoc2NoZW1hW2tleV0sIGJhc2VVcmkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbnZhciBFcnJvckNvZGVzID0ge1xuXHRJTlZBTElEX1RZUEU6IDAsXG5cdEVOVU1fTUlTTUFUQ0g6IDEsXG5cdEFOWV9PRl9NSVNTSU5HOiAxMCxcblx0T05FX09GX01JU1NJTkc6IDExLFxuXHRPTkVfT0ZfTVVMVElQTEU6IDEyLFxuXHROT1RfUEFTU0VEOiAxMyxcblx0Ly8gTnVtZXJpYyBlcnJvcnNcblx0TlVNQkVSX01VTFRJUExFX09GOiAxMDAsXG5cdE5VTUJFUl9NSU5JTVVNOiAxMDEsXG5cdE5VTUJFUl9NSU5JTVVNX0VYQ0xVU0lWRTogMTAyLFxuXHROVU1CRVJfTUFYSU1VTTogMTAzLFxuXHROVU1CRVJfTUFYSU1VTV9FWENMVVNJVkU6IDEwNCxcblx0TlVNQkVSX05PVF9BX05VTUJFUjogMTA1LFxuXHQvLyBTdHJpbmcgZXJyb3JzXG5cdFNUUklOR19MRU5HVEhfU0hPUlQ6IDIwMCxcblx0U1RSSU5HX0xFTkdUSF9MT05HOiAyMDEsXG5cdFNUUklOR19QQVRURVJOOiAyMDIsXG5cdC8vIE9iamVjdCBlcnJvcnNcblx0T0JKRUNUX1BST1BFUlRJRVNfTUlOSU1VTTogMzAwLFxuXHRPQkpFQ1RfUFJPUEVSVElFU19NQVhJTVVNOiAzMDEsXG5cdE9CSkVDVF9SRVFVSVJFRDogMzAyLFxuXHRPQkpFQ1RfQURESVRJT05BTF9QUk9QRVJUSUVTOiAzMDMsXG5cdE9CSkVDVF9ERVBFTkRFTkNZX0tFWTogMzA0LFxuXHQvLyBBcnJheSBlcnJvcnNcblx0QVJSQVlfTEVOR1RIX1NIT1JUOiA0MDAsXG5cdEFSUkFZX0xFTkdUSF9MT05HOiA0MDEsXG5cdEFSUkFZX1VOSVFVRTogNDAyLFxuXHRBUlJBWV9BRERJVElPTkFMX0lURU1TOiA0MDMsXG5cdC8vIEN1c3RvbS91c2VyLWRlZmluZWQgZXJyb3JzXG5cdEZPUk1BVF9DVVNUT006IDUwMCxcblx0S0VZV09SRF9DVVNUT006IDUwMSxcblx0Ly8gU2NoZW1hIHN0cnVjdHVyZVxuXHRDSVJDVUxBUl9SRUZFUkVOQ0U6IDYwMCxcblx0Ly8gTm9uLXN0YW5kYXJkIHZhbGlkYXRpb24gb3B0aW9uc1xuXHRVTktOT1dOX1BST1BFUlRZOiAxMDAwXG59O1xudmFyIEVycm9yQ29kZUxvb2t1cCA9IHt9O1xuZm9yICh2YXIga2V5IGluIEVycm9yQ29kZXMpIHtcblx0RXJyb3JDb2RlTG9va3VwW0Vycm9yQ29kZXNba2V5XV0gPSBrZXk7XG59XG52YXIgRXJyb3JNZXNzYWdlc0RlZmF1bHQgPSB7XG5cdElOVkFMSURfVFlQRTogXCJJbnZhbGlkIHR5cGU6IHt0eXBlfSAoZXhwZWN0ZWQge2V4cGVjdGVkfSlcIixcblx0RU5VTV9NSVNNQVRDSDogXCJObyBlbnVtIG1hdGNoIGZvcjoge3ZhbHVlfVwiLFxuXHRBTllfT0ZfTUlTU0lORzogXCJEYXRhIGRvZXMgbm90IG1hdGNoIGFueSBzY2hlbWFzIGZyb20gXFxcImFueU9mXFxcIlwiLFxuXHRPTkVfT0ZfTUlTU0lORzogXCJEYXRhIGRvZXMgbm90IG1hdGNoIGFueSBzY2hlbWFzIGZyb20gXFxcIm9uZU9mXFxcIlwiLFxuXHRPTkVfT0ZfTVVMVElQTEU6IFwiRGF0YSBpcyB2YWxpZCBhZ2FpbnN0IG1vcmUgdGhhbiBvbmUgc2NoZW1hIGZyb20gXFxcIm9uZU9mXFxcIjogaW5kaWNlcyB7aW5kZXgxfSBhbmQge2luZGV4Mn1cIixcblx0Tk9UX1BBU1NFRDogXCJEYXRhIG1hdGNoZXMgc2NoZW1hIGZyb20gXFxcIm5vdFxcXCJcIixcblx0Ly8gTnVtZXJpYyBlcnJvcnNcblx0TlVNQkVSX01VTFRJUExFX09GOiBcIlZhbHVlIHt2YWx1ZX0gaXMgbm90IGEgbXVsdGlwbGUgb2Yge211bHRpcGxlT2Z9XCIsXG5cdE5VTUJFUl9NSU5JTVVNOiBcIlZhbHVlIHt2YWx1ZX0gaXMgbGVzcyB0aGFuIG1pbmltdW0ge21pbmltdW19XCIsXG5cdE5VTUJFUl9NSU5JTVVNX0VYQ0xVU0lWRTogXCJWYWx1ZSB7dmFsdWV9IGlzIGVxdWFsIHRvIGV4Y2x1c2l2ZSBtaW5pbXVtIHttaW5pbXVtfVwiLFxuXHROVU1CRVJfTUFYSU1VTTogXCJWYWx1ZSB7dmFsdWV9IGlzIGdyZWF0ZXIgdGhhbiBtYXhpbXVtIHttYXhpbXVtfVwiLFxuXHROVU1CRVJfTUFYSU1VTV9FWENMVVNJVkU6IFwiVmFsdWUge3ZhbHVlfSBpcyBlcXVhbCB0byBleGNsdXNpdmUgbWF4aW11bSB7bWF4aW11bX1cIixcblx0TlVNQkVSX05PVF9BX05VTUJFUjogXCJWYWx1ZSB7dmFsdWV9IGlzIG5vdCBhIHZhbGlkIG51bWJlclwiLFxuXHQvLyBTdHJpbmcgZXJyb3JzXG5cdFNUUklOR19MRU5HVEhfU0hPUlQ6IFwiU3RyaW5nIGlzIHRvbyBzaG9ydCAoe2xlbmd0aH0gY2hhcnMpLCBtaW5pbXVtIHttaW5pbXVtfVwiLFxuXHRTVFJJTkdfTEVOR1RIX0xPTkc6IFwiU3RyaW5nIGlzIHRvbyBsb25nICh7bGVuZ3RofSBjaGFycyksIG1heGltdW0ge21heGltdW19XCIsXG5cdFNUUklOR19QQVRURVJOOiBcIlN0cmluZyBkb2VzIG5vdCBtYXRjaCBwYXR0ZXJuOiB7cGF0dGVybn1cIixcblx0Ly8gT2JqZWN0IGVycm9yc1xuXHRPQkpFQ1RfUFJPUEVSVElFU19NSU5JTVVNOiBcIlRvbyBmZXcgcHJvcGVydGllcyBkZWZpbmVkICh7cHJvcGVydHlDb3VudH0pLCBtaW5pbXVtIHttaW5pbXVtfVwiLFxuXHRPQkpFQ1RfUFJPUEVSVElFU19NQVhJTVVNOiBcIlRvbyBtYW55IHByb3BlcnRpZXMgZGVmaW5lZCAoe3Byb3BlcnR5Q291bnR9KSwgbWF4aW11bSB7bWF4aW11bX1cIixcblx0T0JKRUNUX1JFUVVJUkVEOiBcIk1pc3NpbmcgcmVxdWlyZWQgcHJvcGVydHk6IHtrZXl9XCIsXG5cdE9CSkVDVF9BRERJVElPTkFMX1BST1BFUlRJRVM6IFwiQWRkaXRpb25hbCBwcm9wZXJ0aWVzIG5vdCBhbGxvd2VkXCIsXG5cdE9CSkVDVF9ERVBFTkRFTkNZX0tFWTogXCJEZXBlbmRlbmN5IGZhaWxlZCAtIGtleSBtdXN0IGV4aXN0OiB7bWlzc2luZ30gKGR1ZSB0byBrZXk6IHtrZXl9KVwiLFxuXHQvLyBBcnJheSBlcnJvcnNcblx0QVJSQVlfTEVOR1RIX1NIT1JUOiBcIkFycmF5IGlzIHRvbyBzaG9ydCAoe2xlbmd0aH0pLCBtaW5pbXVtIHttaW5pbXVtfVwiLFxuXHRBUlJBWV9MRU5HVEhfTE9ORzogXCJBcnJheSBpcyB0b28gbG9uZyAoe2xlbmd0aH0pLCBtYXhpbXVtIHttYXhpbXVtfVwiLFxuXHRBUlJBWV9VTklRVUU6IFwiQXJyYXkgaXRlbXMgYXJlIG5vdCB1bmlxdWUgKGluZGljZXMge21hdGNoMX0gYW5kIHttYXRjaDJ9KVwiLFxuXHRBUlJBWV9BRERJVElPTkFMX0lURU1TOiBcIkFkZGl0aW9uYWwgaXRlbXMgbm90IGFsbG93ZWRcIixcblx0Ly8gRm9ybWF0IGVycm9yc1xuXHRGT1JNQVRfQ1VTVE9NOiBcIkZvcm1hdCB2YWxpZGF0aW9uIGZhaWxlZCAoe21lc3NhZ2V9KVwiLFxuXHRLRVlXT1JEX0NVU1RPTTogXCJLZXl3b3JkIGZhaWxlZDoge2tleX0gKHttZXNzYWdlfSlcIixcblx0Ly8gU2NoZW1hIHN0cnVjdHVyZVxuXHRDSVJDVUxBUl9SRUZFUkVOQ0U6IFwiQ2lyY3VsYXIgJHJlZnM6IHt1cmxzfVwiLFxuXHQvLyBOb24tc3RhbmRhcmQgdmFsaWRhdGlvbiBvcHRpb25zXG5cdFVOS05PV05fUFJPUEVSVFk6IFwiVW5rbm93biBwcm9wZXJ0eSAobm90IGluIHNjaGVtYSlcIlxufTtcblxuZnVuY3Rpb24gVmFsaWRhdGlvbkVycm9yKGNvZGUsIG1lc3NhZ2UsIHBhcmFtcywgZGF0YVBhdGgsIHNjaGVtYVBhdGgsIHN1YkVycm9ycykge1xuXHRFcnJvci5jYWxsKHRoaXMpO1xuXHRpZiAoY29kZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yIChcIk5vIGNvZGUgc3VwcGxpZWQgZm9yIGVycm9yOiBcIisgbWVzc2FnZSk7XG5cdH1cblx0dGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcblx0dGhpcy5wYXJhbXMgPSBwYXJhbXM7XG5cdHRoaXMuY29kZSA9IGNvZGU7XG5cdHRoaXMuZGF0YVBhdGggPSBkYXRhUGF0aCB8fCBcIlwiO1xuXHR0aGlzLnNjaGVtYVBhdGggPSBzY2hlbWFQYXRoIHx8IFwiXCI7XG5cdHRoaXMuc3ViRXJyb3JzID0gc3ViRXJyb3JzIHx8IG51bGw7XG5cblx0dmFyIGVyciA9IG5ldyBFcnJvcih0aGlzLm1lc3NhZ2UpO1xuXHR0aGlzLnN0YWNrID0gZXJyLnN0YWNrIHx8IGVyci5zdGFja3RyYWNlO1xuXHRpZiAoIXRoaXMuc3RhY2spIHtcblx0XHR0cnkge1xuXHRcdFx0dGhyb3cgZXJyO1xuXHRcdH1cblx0XHRjYXRjaChlcnIpIHtcblx0XHRcdHRoaXMuc3RhY2sgPSBlcnIuc3RhY2sgfHwgZXJyLnN0YWNrdHJhY2U7XG5cdFx0fVxuXHR9XG59XG5WYWxpZGF0aW9uRXJyb3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFcnJvci5wcm90b3R5cGUpO1xuVmFsaWRhdGlvbkVycm9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFZhbGlkYXRpb25FcnJvcjtcblZhbGlkYXRpb25FcnJvci5wcm90b3R5cGUubmFtZSA9ICdWYWxpZGF0aW9uRXJyb3InO1xuXG5WYWxpZGF0aW9uRXJyb3IucHJvdG90eXBlLnByZWZpeFdpdGggPSBmdW5jdGlvbiAoZGF0YVByZWZpeCwgc2NoZW1hUHJlZml4KSB7XG5cdGlmIChkYXRhUHJlZml4ICE9PSBudWxsKSB7XG5cdFx0ZGF0YVByZWZpeCA9IGRhdGFQcmVmaXgucmVwbGFjZSgvfi9nLCBcIn4wXCIpLnJlcGxhY2UoL1xcLy9nLCBcIn4xXCIpO1xuXHRcdHRoaXMuZGF0YVBhdGggPSBcIi9cIiArIGRhdGFQcmVmaXggKyB0aGlzLmRhdGFQYXRoO1xuXHR9XG5cdGlmIChzY2hlbWFQcmVmaXggIT09IG51bGwpIHtcblx0XHRzY2hlbWFQcmVmaXggPSBzY2hlbWFQcmVmaXgucmVwbGFjZSgvfi9nLCBcIn4wXCIpLnJlcGxhY2UoL1xcLy9nLCBcIn4xXCIpO1xuXHRcdHRoaXMuc2NoZW1hUGF0aCA9IFwiL1wiICsgc2NoZW1hUHJlZml4ICsgdGhpcy5zY2hlbWFQYXRoO1xuXHR9XG5cdGlmICh0aGlzLnN1YkVycm9ycyAhPT0gbnVsbCkge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zdWJFcnJvcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHRoaXMuc3ViRXJyb3JzW2ldLnByZWZpeFdpdGgoZGF0YVByZWZpeCwgc2NoZW1hUHJlZml4KTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHRoaXM7XG59O1xuXG5mdW5jdGlvbiBpc1RydXN0ZWRVcmwoYmFzZVVybCwgdGVzdFVybCkge1xuXHRpZih0ZXN0VXJsLnN1YnN0cmluZygwLCBiYXNlVXJsLmxlbmd0aCkgPT09IGJhc2VVcmwpe1xuXHRcdHZhciByZW1haW5kZXIgPSB0ZXN0VXJsLnN1YnN0cmluZyhiYXNlVXJsLmxlbmd0aCk7XG5cdFx0aWYgKCh0ZXN0VXJsLmxlbmd0aCA+IDAgJiYgdGVzdFVybC5jaGFyQXQoYmFzZVVybC5sZW5ndGggLSAxKSA9PT0gXCIvXCIpXG5cdFx0XHR8fCByZW1haW5kZXIuY2hhckF0KDApID09PSBcIiNcIlxuXHRcdFx0fHwgcmVtYWluZGVyLmNoYXJBdCgwKSA9PT0gXCI/XCIpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gZmFsc2U7XG59XG5cbnZhciBsYW5ndWFnZXMgPSB7fTtcbmZ1bmN0aW9uIGNyZWF0ZUFwaShsYW5ndWFnZSkge1xuXHR2YXIgZ2xvYmFsQ29udGV4dCA9IG5ldyBWYWxpZGF0b3JDb250ZXh0KCk7XG5cdHZhciBjdXJyZW50TGFuZ3VhZ2UgPSBsYW5ndWFnZSB8fCAnZW4nO1xuXHR2YXIgYXBpID0ge1xuXHRcdGFkZEZvcm1hdDogZnVuY3Rpb24gKCkge1xuXHRcdFx0Z2xvYmFsQ29udGV4dC5hZGRGb3JtYXQuYXBwbHkoZ2xvYmFsQ29udGV4dCwgYXJndW1lbnRzKTtcblx0XHR9LFxuXHRcdGxhbmd1YWdlOiBmdW5jdGlvbiAoY29kZSkge1xuXHRcdFx0aWYgKCFjb2RlKSB7XG5cdFx0XHRcdHJldHVybiBjdXJyZW50TGFuZ3VhZ2U7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIWxhbmd1YWdlc1tjb2RlXSkge1xuXHRcdFx0XHRjb2RlID0gY29kZS5zcGxpdCgnLScpWzBdOyAvLyBmYWxsIGJhY2sgdG8gYmFzZSBsYW5ndWFnZVxuXHRcdFx0fVxuXHRcdFx0aWYgKGxhbmd1YWdlc1tjb2RlXSkge1xuXHRcdFx0XHRjdXJyZW50TGFuZ3VhZ2UgPSBjb2RlO1xuXHRcdFx0XHRyZXR1cm4gY29kZTsgLy8gc28geW91IGNhbiB0ZWxsIGlmIGZhbGwtYmFjayBoYXMgaGFwcGVuZWRcblx0XHRcdH1cblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9LFxuXHRcdGFkZExhbmd1YWdlOiBmdW5jdGlvbiAoY29kZSwgbWVzc2FnZU1hcCkge1xuXHRcdFx0dmFyIGtleTtcblx0XHRcdGZvciAoa2V5IGluIEVycm9yQ29kZXMpIHtcblx0XHRcdFx0aWYgKG1lc3NhZ2VNYXBba2V5XSAmJiAhbWVzc2FnZU1hcFtFcnJvckNvZGVzW2tleV1dKSB7XG5cdFx0XHRcdFx0bWVzc2FnZU1hcFtFcnJvckNvZGVzW2tleV1dID0gbWVzc2FnZU1hcFtrZXldO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR2YXIgcm9vdENvZGUgPSBjb2RlLnNwbGl0KCctJylbMF07XG5cdFx0XHRpZiAoIWxhbmd1YWdlc1tyb290Q29kZV0pIHsgLy8gdXNlIGZvciBiYXNlIGxhbmd1YWdlIGlmIG5vdCB5ZXQgZGVmaW5lZFxuXHRcdFx0XHRsYW5ndWFnZXNbY29kZV0gPSBtZXNzYWdlTWFwO1xuXHRcdFx0XHRsYW5ndWFnZXNbcm9vdENvZGVdID0gbWVzc2FnZU1hcDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGxhbmd1YWdlc1tjb2RlXSA9IE9iamVjdC5jcmVhdGUobGFuZ3VhZ2VzW3Jvb3RDb2RlXSk7XG5cdFx0XHRcdGZvciAoa2V5IGluIG1lc3NhZ2VNYXApIHtcblx0XHRcdFx0XHRpZiAodHlwZW9mIGxhbmd1YWdlc1tyb290Q29kZV1ba2V5XSA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0XHRcdGxhbmd1YWdlc1tyb290Q29kZV1ba2V5XSA9IG1lc3NhZ2VNYXBba2V5XTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0bGFuZ3VhZ2VzW2NvZGVdW2tleV0gPSBtZXNzYWdlTWFwW2tleV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH0sXG5cdFx0ZnJlc2hBcGk6IGZ1bmN0aW9uIChsYW5ndWFnZSkge1xuXHRcdFx0dmFyIHJlc3VsdCA9IGNyZWF0ZUFwaSgpO1xuXHRcdFx0aWYgKGxhbmd1YWdlKSB7XG5cdFx0XHRcdHJlc3VsdC5sYW5ndWFnZShsYW5ndWFnZSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH0sXG5cdFx0dmFsaWRhdGU6IGZ1bmN0aW9uIChkYXRhLCBzY2hlbWEsIGNoZWNrUmVjdXJzaXZlLCBiYW5Vbmtub3duUHJvcGVydGllcykge1xuXHRcdFx0dmFyIGNvbnRleHQgPSBuZXcgVmFsaWRhdG9yQ29udGV4dChnbG9iYWxDb250ZXh0LCBmYWxzZSwgbGFuZ3VhZ2VzW2N1cnJlbnRMYW5ndWFnZV0sIGNoZWNrUmVjdXJzaXZlLCBiYW5Vbmtub3duUHJvcGVydGllcyk7XG5cdFx0XHRpZiAodHlwZW9mIHNjaGVtYSA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRzY2hlbWEgPSB7XCIkcmVmXCI6IHNjaGVtYX07XG5cdFx0XHR9XG5cdFx0XHRjb250ZXh0LmFkZFNjaGVtYShcIlwiLCBzY2hlbWEpO1xuXHRcdFx0dmFyIGVycm9yID0gY29udGV4dC52YWxpZGF0ZUFsbChkYXRhLCBzY2hlbWEsIG51bGwsIG51bGwsIFwiXCIpO1xuXHRcdFx0aWYgKCFlcnJvciAmJiBiYW5Vbmtub3duUHJvcGVydGllcykge1xuXHRcdFx0XHRlcnJvciA9IGNvbnRleHQuYmFuVW5rbm93blByb3BlcnRpZXMoKTtcblx0XHRcdH1cblx0XHRcdHRoaXMuZXJyb3IgPSBlcnJvcjtcblx0XHRcdHRoaXMubWlzc2luZyA9IGNvbnRleHQubWlzc2luZztcblx0XHRcdHRoaXMudmFsaWQgPSAoZXJyb3IgPT09IG51bGwpO1xuXHRcdFx0cmV0dXJuIHRoaXMudmFsaWQ7XG5cdFx0fSxcblx0XHR2YWxpZGF0ZVJlc3VsdDogZnVuY3Rpb24gKCkge1xuXHRcdFx0dmFyIHJlc3VsdCA9IHt9O1xuXHRcdFx0dGhpcy52YWxpZGF0ZS5hcHBseShyZXN1bHQsIGFyZ3VtZW50cyk7XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH0sXG5cdFx0dmFsaWRhdGVNdWx0aXBsZTogZnVuY3Rpb24gKGRhdGEsIHNjaGVtYSwgY2hlY2tSZWN1cnNpdmUsIGJhblVua25vd25Qcm9wZXJ0aWVzKSB7XG5cdFx0XHR2YXIgY29udGV4dCA9IG5ldyBWYWxpZGF0b3JDb250ZXh0KGdsb2JhbENvbnRleHQsIHRydWUsIGxhbmd1YWdlc1tjdXJyZW50TGFuZ3VhZ2VdLCBjaGVja1JlY3Vyc2l2ZSwgYmFuVW5rbm93blByb3BlcnRpZXMpO1xuXHRcdFx0aWYgKHR5cGVvZiBzY2hlbWEgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0c2NoZW1hID0ge1wiJHJlZlwiOiBzY2hlbWF9O1xuXHRcdFx0fVxuXHRcdFx0Y29udGV4dC5hZGRTY2hlbWEoXCJcIiwgc2NoZW1hKTtcblx0XHRcdGNvbnRleHQudmFsaWRhdGVBbGwoZGF0YSwgc2NoZW1hLCBudWxsLCBudWxsLCBcIlwiKTtcblx0XHRcdGlmIChiYW5Vbmtub3duUHJvcGVydGllcykge1xuXHRcdFx0XHRjb250ZXh0LmJhblVua25vd25Qcm9wZXJ0aWVzKCk7XG5cdFx0XHR9XG5cdFx0XHR2YXIgcmVzdWx0ID0ge307XG5cdFx0XHRyZXN1bHQuZXJyb3JzID0gY29udGV4dC5lcnJvcnM7XG5cdFx0XHRyZXN1bHQubWlzc2luZyA9IGNvbnRleHQubWlzc2luZztcblx0XHRcdHJlc3VsdC52YWxpZCA9IChyZXN1bHQuZXJyb3JzLmxlbmd0aCA9PT0gMCk7XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH0sXG5cdFx0YWRkU2NoZW1hOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gZ2xvYmFsQ29udGV4dC5hZGRTY2hlbWEuYXBwbHkoZ2xvYmFsQ29udGV4dCwgYXJndW1lbnRzKTtcblx0XHR9LFxuXHRcdGdldFNjaGVtYTogZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIGdsb2JhbENvbnRleHQuZ2V0U2NoZW1hLmFwcGx5KGdsb2JhbENvbnRleHQsIGFyZ3VtZW50cyk7XG5cdFx0fSxcblx0XHRnZXRTY2hlbWFNYXA6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBnbG9iYWxDb250ZXh0LmdldFNjaGVtYU1hcC5hcHBseShnbG9iYWxDb250ZXh0LCBhcmd1bWVudHMpO1xuXHRcdH0sXG5cdFx0Z2V0U2NoZW1hVXJpczogZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIGdsb2JhbENvbnRleHQuZ2V0U2NoZW1hVXJpcy5hcHBseShnbG9iYWxDb250ZXh0LCBhcmd1bWVudHMpO1xuXHRcdH0sXG5cdFx0Z2V0TWlzc2luZ1VyaXM6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBnbG9iYWxDb250ZXh0LmdldE1pc3NpbmdVcmlzLmFwcGx5KGdsb2JhbENvbnRleHQsIGFyZ3VtZW50cyk7XG5cdFx0fSxcblx0XHRkcm9wU2NoZW1hczogZnVuY3Rpb24gKCkge1xuXHRcdFx0Z2xvYmFsQ29udGV4dC5kcm9wU2NoZW1hcy5hcHBseShnbG9iYWxDb250ZXh0LCBhcmd1bWVudHMpO1xuXHRcdH0sXG5cdFx0ZGVmaW5lS2V5d29yZDogZnVuY3Rpb24gKCkge1xuXHRcdFx0Z2xvYmFsQ29udGV4dC5kZWZpbmVLZXl3b3JkLmFwcGx5KGdsb2JhbENvbnRleHQsIGFyZ3VtZW50cyk7XG5cdFx0fSxcblx0XHRkZWZpbmVFcnJvcjogZnVuY3Rpb24gKGNvZGVOYW1lLCBjb2RlTnVtYmVyLCBkZWZhdWx0TWVzc2FnZSkge1xuXHRcdFx0aWYgKHR5cGVvZiBjb2RlTmFtZSAhPT0gJ3N0cmluZycgfHwgIS9eW0EtWl0rKF9bQS1aXSspKiQvLnRlc3QoY29kZU5hbWUpKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcignQ29kZSBuYW1lIG11c3QgYmUgYSBzdHJpbmcgaW4gVVBQRVJfQ0FTRV9XSVRIX1VOREVSU0NPUkVTJyk7XG5cdFx0XHR9XG5cdFx0XHRpZiAodHlwZW9mIGNvZGVOdW1iZXIgIT09ICdudW1iZXInIHx8IGNvZGVOdW1iZXIlMSAhPT0gMCB8fCBjb2RlTnVtYmVyIDwgMTAwMDApIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdDb2RlIG51bWJlciBtdXN0IGJlIGFuIGludGVnZXIgPiAxMDAwMCcpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHR5cGVvZiBFcnJvckNvZGVzW2NvZGVOYW1lXSAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdFcnJvciBhbHJlYWR5IGRlZmluZWQ6ICcgKyBjb2RlTmFtZSArICcgYXMgJyArIEVycm9yQ29kZXNbY29kZU5hbWVdKTtcblx0XHRcdH1cblx0XHRcdGlmICh0eXBlb2YgRXJyb3JDb2RlTG9va3VwW2NvZGVOdW1iZXJdICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yIGNvZGUgYWxyZWFkeSB1c2VkOiAnICsgRXJyb3JDb2RlTG9va3VwW2NvZGVOdW1iZXJdICsgJyBhcyAnICsgY29kZU51bWJlcik7XG5cdFx0XHR9XG5cdFx0XHRFcnJvckNvZGVzW2NvZGVOYW1lXSA9IGNvZGVOdW1iZXI7XG5cdFx0XHRFcnJvckNvZGVMb29rdXBbY29kZU51bWJlcl0gPSBjb2RlTmFtZTtcblx0XHRcdEVycm9yTWVzc2FnZXNEZWZhdWx0W2NvZGVOYW1lXSA9IEVycm9yTWVzc2FnZXNEZWZhdWx0W2NvZGVOdW1iZXJdID0gZGVmYXVsdE1lc3NhZ2U7XG5cdFx0XHRmb3IgKHZhciBsYW5nQ29kZSBpbiBsYW5ndWFnZXMpIHtcblx0XHRcdFx0dmFyIGxhbmd1YWdlID0gbGFuZ3VhZ2VzW2xhbmdDb2RlXTtcblx0XHRcdFx0aWYgKGxhbmd1YWdlW2NvZGVOYW1lXSkge1xuXHRcdFx0XHRcdGxhbmd1YWdlW2NvZGVOdW1iZXJdID0gbGFuZ3VhZ2VbY29kZU51bWJlcl0gfHwgbGFuZ3VhZ2VbY29kZU5hbWVdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRyZXNldDogZnVuY3Rpb24gKCkge1xuXHRcdFx0Z2xvYmFsQ29udGV4dC5yZXNldCgpO1xuXHRcdFx0dGhpcy5lcnJvciA9IG51bGw7XG5cdFx0XHR0aGlzLm1pc3NpbmcgPSBbXTtcblx0XHRcdHRoaXMudmFsaWQgPSB0cnVlO1xuXHRcdH0sXG5cdFx0bWlzc2luZzogW10sXG5cdFx0ZXJyb3I6IG51bGwsXG5cdFx0dmFsaWQ6IHRydWUsXG5cdFx0bm9ybVNjaGVtYTogbm9ybVNjaGVtYSxcblx0XHRyZXNvbHZlVXJsOiByZXNvbHZlVXJsLFxuXHRcdGdldERvY3VtZW50VXJpOiBnZXREb2N1bWVudFVyaSxcblx0XHRlcnJvckNvZGVzOiBFcnJvckNvZGVzXG5cdH07XG5cdHJldHVybiBhcGk7XG59XG5cbnZhciB0djQgPSBjcmVhdGVBcGkoKTtcbnR2NC5hZGRMYW5ndWFnZSgnZW4tZ2InLCBFcnJvck1lc3NhZ2VzRGVmYXVsdCk7XG5cbi8vbGVnYWN5IHByb3BlcnR5XG50djQudHY0ID0gdHY0O1xuXG5yZXR1cm4gdHY0OyAvLyB1c2VkIGJ5IF9oZWFkZXIuanMgdG8gZ2xvYmFsaXNlLlxuXG59KSk7IiwidmFyIF8gPSByZXF1aXJlKCcuL3V0aWwnKTtcblxudmFyIFN0ZXBzID0gWydwbGF5JywgJ2Zvcm0nLCAncmVzdWx0J107XG5cbmZ1bmN0aW9uIEluc3RhbnRXaW4oQ3VycmVudFVzZXIsIFNoaXApIHtcbiAgdmFyIENIQU5HRV9FVkVOVCA9IFtcIlNISVBfQ0hBTkdFXCIsIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMDAwMDAwMDAwMCldLmpvaW4oJ18nKTtcblxuICB2YXIgQXBwU3RhdGUgPSB7fTtcblxuICBmdW5jdGlvbiBpbml0U3RhdGUodXNlciwgc2hpcCkge1xuICAgIEFwcFN0YXRlID0ge1xuICAgICAgc2hpcDogXy5vbWl0KHNoaXAsICdzZXR0aW5ncycsICdyZXNvdXJjZXMnLCAndHJhbnNsYXRpb25zJyksXG4gICAgICBzZXR0aW5nczogc2hpcC5zZXR0aW5ncyxcbiAgICAgIGZvcm06IHNoaXAucmVzb3VyY2VzLmZvcm0sXG4gICAgICBhY2hpZXZlbWVudDogc2hpcC5yZXNvdXJjZXMuaW5zdGFudF93aW4sXG4gICAgICB0cmFuc2xhdGlvbnM6IHNoaXAudHJhbnNsYXRpb25zLFxuICAgICAgdXNlcjogdXNlcixcbiAgICAgIGJhZGdlOiAoc2hpcC5yZXNvdXJjZXMuaW5zdGFudF93aW4gJiYgc2hpcC5yZXNvdXJjZXMuaW5zdGFudF93aW4uYmFkZ2UpXG4gICAgfTtcbiAgICBlbWl0Q2hhbmdlKCk7XG4gICAgcmV0dXJuIEFwcFN0YXRlO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGVtaXRDaGFuZ2UodG1wKSB7XG4gICAgdmFyIHMgPSBnZXRBcHBTdGF0ZSh0bXApO1xuICAgIEh1bGwuZW1pdChDSEFOR0VfRVZFTlQsIHMpO1xuICB9XG5cbiAgLy8gQ3VzdG9taXphdGlvbiBzdXBwb3J0XG5cbiAgZnVuY3Rpb24gdXBkYXRlU2V0dGluZ3Moc2V0dGluZ3MpIHtcbiAgICBBcHBTdGF0ZS5zZXR0aW5ncyA9IHNldHRpbmdzO1xuICAgIGVtaXRDaGFuZ2UoeyBjaGFuZ2VkOiAnc2V0dGluZ3MnIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlVHJhbnNsYXRpb25zKHRyYW5zbGF0aW9ucykge1xuICAgIEFwcFN0YXRlLnRyYW5zbGF0aW9ucyA9IHRyYW5zbGF0aW9ucztcbiAgICBlbWl0Q2hhbmdlKHsgY2hhbmdlZDogJ3RyYW5zbGF0aW9ucycgfSk7XG4gIH1cblxuICAvLyBVc2VyIGFjdGlvbnNcblxuICBmdW5jdGlvbiBwcm9jZXNzRm9ybURhdGEoZm9ybURhdGEpIHtcbiAgICB2YXIgZmllbGRzID0gQXBwU3RhdGUuZm9ybS5maWVsZHNfbGlzdDtcbiAgICB2YXIgcmV0ID0gZmllbGRzLnJlZHVjZShmdW5jdGlvbihkYXRhLCBmaWVsZCkge1xuICAgICAgdmFyIHZhbCA9IGZvcm1EYXRhW2ZpZWxkLm5hbWVdO1xuICAgICAgaWYgKHZhbC50b1N0cmluZygpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgc3dpdGNoIChmaWVsZC5maWVsZF90eXBlKSB7XG4gICAgICAgICAgY2FzZSAnZGF0ZSc6XG4gICAgICAgICAgICByZXMgPSBuZXcgRGF0ZSh2YWwpLnRvSVNPU3RyaW5nKCkuc3Vic3RyaW5nKDAsMTApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJlcyA9IGZvcm1EYXRhW2ZpZWxkLm5hbWVdO1xuICAgICAgICB9XG4gICAgICAgIGRhdGFbZmllbGQubmFtZV0gPSByZXM7XG4gICAgICB9XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9LCB7fSk7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHN1Ym1pdEZvcm0oZm9ybURhdGEpIHtcbiAgICB2YXIgZGF0YSA9IHByb2Nlc3NGb3JtRGF0YShmb3JtRGF0YSk7XG4gICAgZW1pdENoYW5nZSh7IGNoYW5nZWQ6ICdsb2FkaW5nJywgbG9hZGluZzogJ2Zvcm0nIH0pO1xuICAgIEh1bGwuYXBpKEFwcFN0YXRlLmZvcm0uaWQgKyBcIi9zdWJtaXRcIiwgeyBkYXRhOiBkYXRhIH0sICdwdXQnKS50aGVuKGZ1bmN0aW9uKGZvcm0pIHtcbiAgICAgIEFwcFN0YXRlLmZvcm0gPSBmb3JtO1xuICAgICAgZW1pdENoYW5nZSh7IGNoYW5nZWQ6ICdmb3JtJyB9KTtcbiAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGVtaXRDaGFuZ2UoeyBlcnJvcl9tZXNzYWdlOiAnaW52YWxpZF9mb3JtJywgZXJyb3I6IGVyciB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBsYXkocHJvdmlkZXIpIHtcbiAgICBpZiAodXNlckNhblBsYXkoKSkge1xuICAgICAgZW1pdENoYW5nZSh7IGNoYW5nZWQ6ICdsb2FkaW5nJywgbG9hZGluZzogJ2JhZGdlJyB9KTtcbiAgICAgIHJldHVybiBIdWxsLmFwaShBcHBTdGF0ZS5hY2hpZXZlbWVudC5pZCArIFwiL2FjaGlldmVcIiwgJ3Bvc3QnKS50aGVuKGZ1bmN0aW9uKGJhZGdlKSB7XG4gICAgICAgIEFwcFN0YXRlLmJhZGdlID0gYmFkZ2U7XG4gICAgICAgIGVtaXRDaGFuZ2UoeyBjaGFuZ2VkOiAnYmFkZ2UnIH0pO1xuICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGVtaXRDaGFuZ2UoeyBlcnJvcl9tZXNzYWdlOiAnZXJyb3Jfb25fYWNoaWV2ZScsIGVycm9yOiBlcnIgfSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHByb3ZpZGVyICYmICFBcHBTdGF0ZS51c2VyKSB7XG4gICAgICBsb2dpbkFuZFBsYXkocHJvdmlkZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbWl0Q2hhbmdlKHsgZXJyb3JfbWVzc2FnZTogJ3VzZXJfY2Fubm90X3BsYXknIH0pO1xuICAgIH1cbiAgfVxuXG4gIHZhciBhdXRvUGxheSA9IGZhbHNlO1xuICBmdW5jdGlvbiBsb2dpbkFuZFBsYXkocHJvdmlkZXIsIG9wdGlvbnMpIHtcbiAgICBpZiAocHJvdmlkZXIpIHtcbiAgICAgIGF1dG9QbGF5ID0gdHJ1ZTtcbiAgICAgIGVtaXRDaGFuZ2UoeyBpc0xvZ2dpbmdJbjogdHJ1ZSB9KTtcbiAgICAgIEh1bGwubG9naW4ocHJvdmlkZXIsIG9wdGlvbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBcIltJbnN0YW50V2luXSBFcnJvciBpbiBsb2dpbkFuZFBsYXkgbWV0aG9kOiBtaXNzaW5nIGBwcm92aWRlcmBcIjtcbiAgICB9XG4gIH1cblxuICAvLyBTdGF0ZSBtYW5hZ2VtZW50XG5cbiAgZnVuY3Rpb24gZ2V0QXBwU3RhdGUodG1wKSB7XG4gICAgdmFyIHN0ZXAgPSBjdXJyZW50U3RlcCgpO1xuICAgIHZhciByZXQgPSBfLmV4dGVuZCh7fSwgQXBwU3RhdGUsIHtcbiAgICAgIHVzZXJDYW5QbGF5OiB1c2VyQ2FuUGxheSgpLFxuICAgICAgdXNlckhhc1BsYXllZDogdXNlckhhc1BsYXllZCgpLFxuICAgICAgdXNlckhhc1dvbjogdXNlckhhc1dvbigpLFxuICAgICAgY3VycmVudFN0ZXA6IHN0ZXAsXG4gICAgICBjdXJyZW50U3RlcEluZGV4OiBzdGVwSW5kZXgoc3RlcCksXG4gICAgICBpc0Zvcm1Db21wbGV0ZTogaXNGb3JtQ29tcGxldGUoKSxcbiAgICB9LCB0bXApO1xuICAgIHJldHVybiBfLmRlZXBDbG9uZShyZXQpO1xuICB9XG5cbiAgZnVuY3Rpb24gdXNlckNhblBsYXkoKSB7XG4gICAgcmV0dXJuIGNhblBsYXkoKSA9PT0gdHJ1ZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNhblBsYXkoKSB7XG4gICAgaWYgKCFBcHBTdGF0ZS51c2VyKSByZXR1cm4gXCJObyBjdXJyZW50IHVzZXJcIjtcbiAgICBpZiAodXNlckhhc1dvbigpKSByZXR1cm4gXCJBbHJlYWR5IHdvblwiO1xuICAgIHZhciBiYWRnZSA9IEFwcFN0YXRlLmJhZGdlO1xuICAgIGlmICghYmFkZ2UgfHwgIWJhZGdlLmRhdGEuYXR0ZW1wdHMpIHJldHVybiB0cnVlO1xuICAgIHZhciBkID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpLnNsaWNlKDAsIDEwKTtcbiAgICBpZiAoYmFkZ2UuZGF0YS5hdHRlbXB0c1tkXSkge1xuICAgICAgcmV0dXJuIFwiT25lIGF0dGVtcHQgYWxyZWFkeSB0b2RheVwiO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB1c2VySGFzUGxheWVkKCkge1xuICAgIHJldHVybiAhIUFwcFN0YXRlLmJhZGdlO1xuICB9XG5cbiAgZnVuY3Rpb24gdXNlckhhc1dvbigpIHtcbiAgICB2YXIgYmFkZ2UgPSBBcHBTdGF0ZS5iYWRnZTtcbiAgICBpZiAoIWJhZGdlIHx8ICFiYWRnZS5kYXRhKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIGJhZGdlLmRhdGEud2lubmVyID09PSB0cnVlO1xuICB9XG5cbiAgZnVuY3Rpb24gY3VycmVudFN0ZXAoKSB7XG4gICAgaWYgKCFBcHBTdGF0ZS51c2VyIHx8IHVzZXJDYW5QbGF5KCkpIHJldHVybiAncGxheSc7XG4gICAgaWYgKCFpc0Zvcm1Db21wbGV0ZSgpKSByZXR1cm4gJ2Zvcm0nO1xuICAgIHJldHVybiAncmVzdWx0JztcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0ZXBJbmRleChzdGVwKSB7XG4gICAgcmV0dXJuIFN0ZXBzLmluZGV4T2Yoc3RlcCk7XG4gIH1cblxuICBmdW5jdGlvbiBpc0Zvcm1Db21wbGV0ZSgpIHtcbiAgICBpZiAoIUFwcFN0YXRlLnVzZXIpIHJldHVybiBmYWxzZTtcbiAgICB2YXIgZmllbGRzID0gQXBwU3RhdGUuZm9ybSAmJiBBcHBTdGF0ZS5mb3JtLmZpZWxkc19saXN0O1xuICAgIHZhciByZXQgPSBBcHBTdGF0ZS5mb3JtLnVzZXJfZGF0YS5jcmVhdGVkX2F0ICYmIGZpZWxkcyAmJiBmaWVsZHMucmVkdWNlKGZ1bmN0aW9uKHJlcywgZmllbGQpIHtcbiAgICAgIHJldHVybiByZXMgJiYgISFmaWVsZC52YWx1ZTtcbiAgICB9LCB0cnVlKTtcbiAgICByZXR1cm4gcmV0IHx8IGZhbHNlO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgaWYgKEFwcFN0YXRlLnVzZXIuaXNfYWRtaW4pIHtcbiAgICAgIGVtaXRDaGFuZ2UoeyBsb2FkaW5nOiAncmVzZXQnIH0pO1xuICAgICAgaWYgKEFwcFN0YXRlLmJhZGdlICYmIEFwcFN0YXRlLmJhZGdlLmlkKSB7XG4gICAgICAgIEh1bGwuYXBpKEFwcFN0YXRlLmJhZGdlLmlkLCAnZGVsZXRlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgQXBwU3RhdGUuYmFkZ2UgPSBudWxsO1xuICAgICAgICAgIEh1bGwuYXBpKEFwcFN0YXRlLmZvcm0uaWQgKyAnL3N1Ym1pdCcsICdkZWxldGUnLCBmdW5jdGlvbihmb3JtKSB7XG4gICAgICAgICAgICBBcHBTdGF0ZS5mb3JtID0gZm9ybTtcbiAgICAgICAgICAgIGVtaXRDaGFuZ2UoeyBjaGFuZ2VkOiAncmVzZXQnIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICBlbWl0Q2hhbmdlKHsgZXJyb3JfbWVzc2FnZTogJ2Vycm9yX2RlbGV0aW5nX2JhZGdlJywgZXJyb3I6IGVyciB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbWl0Q2hhbmdlKHsgY2hhbmdlZDogJ3Jlc2V0JyB9KTtcbiAgICAgICAgdGhyb3cgXCJbSW5zdGFudFdpbl0gTm8gYmFkZ2UgZm91bmQgaGVyZS4uLlwiO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBcIltJbnN0YW50V2luXSBZb3UgbmVlZCB0byBiZSBhIGFkbWluaXN0cmF0b3IgdG8gcmVzZXQgYmFkZ2VzXCI7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdHJhbnNsYXRlKGxhbmcpIHtcbiAgICB2YXIgcmV0ID0gQXBwU3RhdGUudHJhbnNsYXRpb25zW2xhbmddIHx8IEFwcFN0YXRlLnRyYW5zbGF0aW9uc1snZW4nXSB8fCB7fTtcbiAgICB2YXIgcmVzdWx0ID0gT2JqZWN0LmtleXMocmV0KS5yZWR1Y2UoZnVuY3Rpb24odHIsIGspIHtcbiAgICAgIHZhciB0ID0gcmV0W2tdO1xuICAgICAgaWYgKHQgJiYgdC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRyW2tdID0gdDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cjtcbiAgICB9LCB7fSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uQXV0aEV2ZW50KCkge1xuICAgIGVtaXRDaGFuZ2UoeyBjaGFuZ2VkOiAnbG9hZGluZycsIGxvYWRpbmc6ICdzaGlwJyB9KTtcbiAgICBIdWxsLmFwaShTaGlwLmlkLCB7IGZpZWxkczogJ2JhZGdlJyB9KS50aGVuKGZ1bmN0aW9uKHNoaXApIHtcbiAgICAgIGluaXRTdGF0ZShIdWxsLmN1cnJlbnRVc2VyKCksIHNoaXApO1xuICAgICAgaWYgKGF1dG9QbGF5ICYmIHVzZXJDYW5QbGF5KCkpIHBsYXkoKTtcbiAgICAgIGF1dG9QbGF5ID0gZmFsc2U7XG4gICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICBlbWl0Q2hhbmdlKHsgZXJyb3JfbWVzc2FnZTogJ3NoaXBfbm90X2ZvdW5kJywgZXJyb3I6IGVyciB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIEh1bGwub24oJ2h1bGwudXNlci51cGRhdGUnLCBvbkF1dGhFdmVudCk7XG4gIEh1bGwub24oJ2h1bGwudXNlci5sb2dpbicsIG9uQXV0aEV2ZW50KTtcbiAgSHVsbC5vbignaHVsbC51c2VyLmxvZ291dCcsIG9uQXV0aEV2ZW50KTtcbiAgSHVsbC5vbignaHVsbC51c2VyLmZhaWwnLCBvbkF1dGhFdmVudCk7XG5cbiAgdmFyIF9saXN0ZW5lcnMgPSBbXTtcblxuICAvLyBQdWJsaWMgQVBJXG5cbiAgdGhpcy5vbkNoYW5nZSA9IGZ1bmN0aW9uKGNiKSB7XG4gICAgdmFyIGNhbGxiYWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIGNiLmFwcGx5KHVuZGVmaW5lZCwgYXJncyk7XG4gICAgICB9KVxuICAgIH07XG4gICAgX2xpc3RlbmVycy5wdXNoKGNhbGxiYWNrKTtcbiAgICBIdWxsLm9uKENIQU5HRV9FVkVOVCwgY2FsbGJhY2spO1xuICB9O1xuXG4gIHRoaXMudGVhcmRvd24gPSBmdW5jdGlvbigpIHtcbiAgICBIdWxsLm9mZignaHVsbC51c2VyLnVwZGF0ZScsIG9uQXV0aEV2ZW50KTtcbiAgICBIdWxsLm9mZignaHVsbC51c2VyLmxvZ2luJywgb25BdXRoRXZlbnQpO1xuICAgIEh1bGwub2ZmKCdodWxsLnVzZXIubG9nb3V0Jywgb25BdXRoRXZlbnQpO1xuICAgIEh1bGwub2ZmKCdodWxsLnVzZXIuZmFpbCcsIG9uQXV0aEV2ZW50KTtcbiAgICBmb3IgKHZhciBsID0gMDsgbCA8IF9saXN0ZW5lcnMubGVuZ3RoOyBsKyspIHtcbiAgICAgIEh1bGwub2ZmKENIQU5HRV9FVkVOVCwgbGlzdGVuZXJzW2xdKTtcbiAgICB9XG4gIH07XG5cbiAgdGhpcy5nZXRTdGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBnZXRBcHBTdGF0ZSgpO1xuICB9O1xuXG4gIHRoaXMucGxheSA9IHBsYXk7XG4gIHRoaXMucmVzZXQgPSByZXNldDtcbiAgdGhpcy5zdWJtaXRGb3JtID0gc3VibWl0Rm9ybTtcbiAgdGhpcy50cmFuc2xhdGUgPSB0cmFuc2xhdGU7XG5cbiAgaWYgKFNoaXApIHtcbiAgICBpbml0U3RhdGUoQ3VycmVudFVzZXIsIFNoaXApO1xuICB9XG5cbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgbWVzc2FnZSA9IGUuZGF0YTtcbiAgICBpZiAobWVzc2FnZSAmJiBtZXNzYWdlLmV2ZW50ID09PSBcInNoaXAudXBkYXRlXCIpIHtcbiAgICAgIHVwZGF0ZVNldHRpbmdzKG1lc3NhZ2Uuc2hpcC5zZXR0aW5ncyk7XG4gICAgICB1cGRhdGVUcmFuc2xhdGlvbnMobWVzc2FnZS5zaGlwLnRyYW5zbGF0aW9ucyB8fCB7fSk7XG4gICAgfVxuICB9LCBmYWxzZSk7XG59O1xuXG5JbnN0YW50V2luLlN0ZXBzID0gU3RlcHM7XG5cbm1vZHVsZS5leHBvcnRzID0gSW5zdGFudFdpbjtcbiIsImFuZ3VsYXIubW9kdWxlKCdzY2hlbWFGb3JtJykuY29uZmlnKFxuWydzY2hlbWFGb3JtUHJvdmlkZXInLCAnc2NoZW1hRm9ybURlY29yYXRvcnNQcm92aWRlcicsICdzZlBhdGhQcm92aWRlcicsXG4gIGZ1bmN0aW9uKHNjaGVtYUZvcm1Qcm92aWRlciwgIHNjaGVtYUZvcm1EZWNvcmF0b3JzUHJvdmlkZXIsIHNmUGF0aFByb3ZpZGVyKSB7XG5cbiAgICB2YXIgZGF0ZXBpY2tlciA9IGZ1bmN0aW9uKG5hbWUsIHNjaGVtYSwgb3B0aW9ucykge1xuICAgICAgaWYgKHNjaGVtYS50eXBlID09PSAnc3RyaW5nJyAmJiAoc2NoZW1hLmZvcm1hdCA9PT0gJ2RhdGUnIHx8IHNjaGVtYS5mb3JtYXQgPT09ICdkYXRlLXRpbWUnKSkge1xuICAgICAgICB2YXIgZiA9IHNjaGVtYUZvcm1Qcm92aWRlci5zdGRGb3JtT2JqKG5hbWUsIHNjaGVtYSwgb3B0aW9ucyk7XG4gICAgICAgIGYua2V5ICA9IG9wdGlvbnMucGF0aDtcbiAgICAgICAgZi50eXBlID0gJ2RhdGVwaWNrZXInO1xuICAgICAgICBvcHRpb25zLmxvb2t1cFtzZlBhdGhQcm92aWRlci5zdHJpbmdpZnkob3B0aW9ucy5wYXRoKV0gPSBmO1xuICAgICAgICByZXR1cm4gZjtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgc2NoZW1hRm9ybVByb3ZpZGVyLmRlZmF1bHRzLnN0cmluZy51bnNoaWZ0KGRhdGVwaWNrZXIpO1xuXG4gICAgLy9BZGQgdG8gdGhlIEZvdW5kYXRpb24gZGlyZWN0aXZlXG4gICAgc2NoZW1hRm9ybURlY29yYXRvcnNQcm92aWRlci5hZGRNYXBwaW5nKFxuICAgICAgJ2ZvdW5kYXRpb25EZWNvcmF0b3InLFxuICAgICAgJ2RhdGVwaWNrZXInLFxuICAgICAgJ2RpcmVjdGl2ZXMvZGVjb3JhdG9ycy9mb3VuZGF0aW9uL2RhdGVwaWNrZXIuaHRtbCdcbiAgICApO1xuICAgIHNjaGVtYUZvcm1EZWNvcmF0b3JzUHJvdmlkZXIuY3JlYXRlRGlyZWN0aXZlKFxuICAgICAgJ2RhdGVwaWNrZXInLFxuICAgICAgJ2RpcmVjdGl2ZXMvZGVjb3JhdG9ycy9mb3VuZGF0aW9uL2RhdGVwaWNrZXIuaHRtbCdcbiAgICApO1xuICB9XG5dKTtcbiIsInJlcXVpcmUoJy4vZm91bmRhdGlvbi1kZWNvcmF0b3ItZGF0ZXBpY2tlcicpO1xuYW5ndWxhci5tb2R1bGUoJ3NjaGVtYUZvcm0nKS5jb25maWcoWydzY2hlbWFGb3JtRGVjb3JhdG9yc1Byb3ZpZGVyJywgZnVuY3Rpb24oZGVjb3JhdG9yc1Byb3ZpZGVyKSB7XG4gIHZhciBiYXNlID0gJ2RpcmVjdGl2ZXMvZGVjb3JhdG9ycy9mb3VuZGF0aW9uLyc7XG5cbiAgZGVjb3JhdG9yc1Byb3ZpZGVyLmNyZWF0ZURlY29yYXRvcignZm91bmRhdGlvbkRlY29yYXRvcicsIHtcbiAgICB0ZXh0YXJlYTogYmFzZSArICd0ZXh0YXJlYS5odG1sJyxcbiAgICBmaWVsZHNldDogYmFzZSArICdmaWVsZHNldC5odG1sJyxcbiAgICBhcnJheTogYmFzZSArICdhcnJheS5odG1sJyxcbiAgICB0YWJhcnJheTogYmFzZSArICd0YWJhcnJheS5odG1sJyxcbiAgICB0YWJzOiBiYXNlICsgJ3RhYnMuaHRtbCcsXG4gICAgc2VjdGlvbjogYmFzZSArICdzZWN0aW9uLmh0bWwnLFxuICAgIGNvbmRpdGlvbmFsOiBiYXNlICsgJ3NlY3Rpb24uaHRtbCcsXG4gICAgYWN0aW9uczogYmFzZSArICdhY3Rpb25zLmh0bWwnLFxuICAgIGRhdGVwaWNrZXI6IGJhc2UgKyAnZGF0ZXBpY2tlci5odG1sJyxcbiAgICBzZWxlY3Q6IGJhc2UgKyAnc2VsZWN0Lmh0bWwnLFxuICAgIGNoZWNrYm94OiBiYXNlICsgJ2NoZWNrYm94Lmh0bWwnLFxuICAgIGNoZWNrYm94ZXM6IGJhc2UgKyAnY2hlY2tib3hlcy5odG1sJyxcbiAgICBudW1iZXI6IGJhc2UgKyAnZGVmYXVsdC5odG1sJyxcbiAgICBwYXNzd29yZDogYmFzZSArICdkZWZhdWx0Lmh0bWwnLFxuICAgIHN1Ym1pdDogYmFzZSArICdzdWJtaXQuaHRtbCcsXG4gICAgYnV0dG9uOiBiYXNlICsgJ3N1Ym1pdC5odG1sJyxcbiAgICByYWRpb3M6IGJhc2UgKyAncmFkaW9zLmh0bWwnLFxuICAgICdyYWRpb3MtaW5saW5lJzogYmFzZSArICdyYWRpb3MtaW5saW5lLmh0bWwnLFxuICAgIHJhZGlvYnV0dG9uczogYmFzZSArICdyYWRpby1idXR0b25zLmh0bWwnLFxuICAgIGhlbHA6IGJhc2UgKyAnaGVscC5odG1sJyxcbiAgICAnZGVmYXVsdCc6IGJhc2UgKyAnZGVmYXVsdC5odG1sJ1xuICB9LCBbXG4gICAgZnVuY3Rpb24oZm9ybSkge1xuICAgICAgaWYgKGZvcm0ucmVhZG9ubHkgJiYgZm9ybS5rZXkgJiYgZm9ybS50eXBlICE9PSAnZmllbGRzZXQnKSB7XG4gICAgICAgIHJldHVybiBiYXNlICsgJ3JlYWRvbmx5Lmh0bWwnO1xuICAgICAgfVxuICAgIH1cbiAgXSwgeyBjbGFzc05hbWU6IFwicm93XCIgfSk7XG5cbiAgLy9tYW51YWwgdXNlIGRpcmVjdGl2ZXNcbiAgZGVjb3JhdG9yc1Byb3ZpZGVyLmNyZWF0ZURpcmVjdGl2ZXMoe1xuICAgIHRleHRhcmVhOiBiYXNlICsgJ3RleHRhcmVhLmh0bWwnLFxuICAgIHNlbGVjdDogYmFzZSArICdzZWxlY3QuaHRtbCcsXG4gICAgY2hlY2tib3g6IGJhc2UgKyAnY2hlY2tib3guaHRtbCcsXG4gICAgY2hlY2tib3hlczogYmFzZSArICdjaGVja2JveGVzLmh0bWwnLFxuICAgIG51bWJlcjogYmFzZSArICdkZWZhdWx0Lmh0bWwnLFxuICAgIHN1Ym1pdDogYmFzZSArICdzdWJtaXQuaHRtbCcsXG4gICAgYnV0dG9uOiBiYXNlICsgJ3N1Ym1pdC5odG1sJyxcbiAgICB0ZXh0OiBiYXNlICsgJ2RlZmF1bHQuaHRtbCcsXG4gICAgZGF0ZTogYmFzZSArICdkZWZhdWx0Lmh0bWwnLFxuICAgIHBhc3N3b3JkOiBiYXNlICsgJ2RlZmF1bHQuaHRtbCcsXG4gICAgZGF0ZXBpY2tlcjogYmFzZSArICdkYXRlcGlja2VyLmh0bWwnLFxuICAgIGlucHV0OiBiYXNlICsgJ2RlZmF1bHQuaHRtbCcsXG4gICAgcmFkaW9zOiBiYXNlICsgJ3JhZGlvcy5odG1sJyxcbiAgICAncmFkaW9zLWlubGluZSc6IGJhc2UgKyAncmFkaW9zLWlubGluZS5odG1sJyxcbiAgICByYWRpb2J1dHRvbnM6IGJhc2UgKyAncmFkaW8tYnV0dG9ucy5odG1sJyxcbiAgfSk7XG5cbn1dKS5kaXJlY3RpdmUoJ3NmRmllbGRzZXQnLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHtcbiAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgIHNjb3BlOiB0cnVlLFxuICAgIHRlbXBsYXRlVXJsOiAnZGlyZWN0aXZlcy9kZWNvcmF0b3JzL2ZvdW5kYXRpb24vZmllbGRzZXQtdHJjbC5odG1sJyxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgIHNjb3BlLnRpdGxlID0gc2NvcGUuJGV2YWwoYXR0cnMudGl0bGUpO1xuICAgIH1cbiAgfTtcbn0pO1xuIiwiZnVuY3Rpb24gaXNPYmplY3Qob2JqKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIG9iajtcbiAgcmV0dXJuIHR5cGUgPT09ICdmdW5jdGlvbicgfHwgdHlwZSA9PT0gJ29iamVjdCcgJiYgISFvYmo7XG59O1xuXG5cbiBmdW5jdGlvbiBleHRlbmQob2JqKSB7XG4gIGlmICghaXNPYmplY3Qob2JqKSkgcmV0dXJuIG9iajtcbiAgdmFyIHNvdXJjZSwgcHJvcDtcbiAgZm9yICh2YXIgaSA9IDEsIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTtcbiAgICBmb3IgKHByb3AgaW4gc291cmNlKSB7XG4gICAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIHByb3ApKSB7XG4gICAgICAgICAgb2JqW3Byb3BdID0gc291cmNlW3Byb3BdO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gb2JqO1xufTtcblxuZnVuY3Rpb24gb21pdChvYmogLyoga2V5cyAqLykge1xuICB2YXIgd2l0aG91dEtleXMgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gIHJldHVybiBvYmogJiYgT2JqZWN0LmtleXMob2JqKS5yZWR1Y2UoZnVuY3Rpb24ocywgaykge1xuICAgIGlmICh3aXRob3V0S2V5cy5pbmRleE9mKGspID09PSAtMSkgc1trXSA9IG9ialtrXVxuICAgIHJldHVybiBzO1xuICB9LCB7fSk7XG59O1xuXG5mdW5jdGlvbiBkZWVwQ2xvbmUob2JqKSB7XG4gIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9iaikpO1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBleHRlbmQ6IGV4dGVuZCxcbiAgb21pdDogb21pdCxcbiAgaXNPYmplY3Q6IGlzT2JqZWN0LFxuICBkZWVwQ2xvbmU6IGRlZXBDbG9uZVxufTtcbiJdfQ==
