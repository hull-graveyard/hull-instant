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

.config(['$sceProvider', function($sceProvider) {
  $sceProvider.enabled(false);
}])

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvamF2YXNjcmlwdC9hcHAuanMiLCJub2RlX21vZHVsZXMvYW5ndWxhci1kYXRlcGlja2VyL2J1aWxkL2FuZ3VsYXItZGF0ZXBpY2tlci5qcyIsIm5vZGVfbW9kdWxlcy9hbmd1bGFyLXNjaGVtYS1mb3JtL2Rpc3Qvc2NoZW1hLWZvcm0uanMiLCJub2RlX21vZHVsZXMvYW5ndWxhci10cmFuc2xhdGUvZGlzdC9hbmd1bGFyLXRyYW5zbGF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9vYmplY3RwYXRoL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL29iamVjdHBhdGgvbGliL09iamVjdFBhdGguanMiLCJub2RlX21vZHVsZXMvdHY0L3R2NC5qcyIsInNyYy9qYXZhc2NyaXB0L2luc3RhbnQuanMiLCJzcmMvamF2YXNjcmlwdC9zY2hlbWEtZm9ybS9mb3VuZGF0aW9uLWRlY29yYXRvci1kYXRlcGlja2VyLmpzIiwic3JjL2phdmFzY3JpcHQvc2NoZW1hLWZvcm0vZm91bmRhdGlvbi1kZWNvcmF0b3IuanMiLCJzcmMvamF2YXNjcmlwdC91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdDRDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3Z6RUE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMWxEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgSW5zdGFudFdpbiA9IHJlcXVpcmUoJy4vaW5zdGFudCcpO1xudmFyIFN0ZXBzID0gSW5zdGFudFdpbi5TdGVwcztcbnZhciBkZWZhdWx0U3RlcCA9IFN0ZXBzWzBdO1xuXG53aW5kb3cudHY0ID0gcmVxdWlyZSgndHY0Jyk7XG52YXIgT2JqZWN0UGF0aCA9IHJlcXVpcmUoJ29iamVjdHBhdGgnKTtcblxudHJ5IHtcbiAgYW5ndWxhci5tb2R1bGUoJ09iamVjdFBhdGgnLCBbXSkucHJvdmlkZXIoJ09iamVjdFBhdGgnLCBmdW5jdGlvbigpe1xuICAgIHRoaXMucGFyc2UgPSBPYmplY3RQYXRoLnBhcnNlO1xuICAgIHRoaXMuc3RyaW5naWZ5ID0gT2JqZWN0UGF0aC5zdHJpbmdpZnk7XG4gICAgdGhpcy5ub3JtYWxpemUgPSBPYmplY3RQYXRoLm5vcm1hbGl6ZTtcbiAgICB0aGlzLiRnZXQgPSBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIE9iamVjdFBhdGg7XG4gICAgfTtcbiAgfSk7XG59IGNhdGNoKGUpIHt9XG5cbnJlcXVpcmUoJ2FuZ3VsYXItc2NoZW1hLWZvcm0vZGlzdC9zY2hlbWEtZm9ybScpO1xucmVxdWlyZSgnLi9zY2hlbWEtZm9ybS9mb3VuZGF0aW9uLWRlY29yYXRvcicpO1xucmVxdWlyZSgnLi9zY2hlbWEtZm9ybS9mb3VuZGF0aW9uLWRlY29yYXRvci1kYXRlcGlja2VyJyk7XG5yZXF1aXJlKCdhbmd1bGFyLWRhdGVwaWNrZXIvYnVpbGQvYW5ndWxhci1kYXRlcGlja2VyJyk7XG5yZXF1aXJlKCdhbmd1bGFyLXRyYW5zbGF0ZScpO1xuXG52YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2h1bGwtaW5zdGFudCcsIFsnbmdBbmltYXRlJywgJ3NjaGVtYUZvcm0nLCAnYW5ndWxhci1kYXRlcGlja2VyJywgJ3Bhc2NhbHByZWNodC50cmFuc2xhdGUnXSlcblxuLmNvbmZpZyhbJyRzY2VQcm92aWRlcicsIGZ1bmN0aW9uKCRzY2VQcm92aWRlcikge1xuICAkc2NlUHJvdmlkZXIuZW5hYmxlZChmYWxzZSk7XG59XSlcblxuLmNvbmZpZyhbXCIkdHJhbnNsYXRlUHJvdmlkZXJcIiwgZnVuY3Rpb24gKCR0cmFuc2xhdGVQcm92aWRlcikge1xuICAkdHJhbnNsYXRlUHJvdmlkZXIudXNlTG9hZGVyKFwiJHRyYW5zbGF0ZVNoaXBMb2FkZXJcIik7XG4gICR0cmFuc2xhdGVQcm92aWRlci5wcmVmZXJyZWRMYW5ndWFnZShcImVuXCIpO1xufV0pXG5cbi5mYWN0b3J5KFwiJGluc3RhbnRcIiwgW1wiJGh1bGxJbml0XCIsIGZ1bmN0aW9uKCRodWxsSW5pdCkge1xuICB2YXIgaW5zdGFudCA9IG5ldyBJbnN0YW50V2luKCRodWxsSW5pdC51c2VyLCAkaHVsbEluaXQuc2hpcCk7XG4gIHdpbmRvdy4kaW5zdGFudCA9IGluc3RhbnQ7XG4gIHJldHVybiBpbnN0YW50O1xufV0pXG5cbi5mYWN0b3J5KFwiJHRyYW5zbGF0ZVNoaXBMb2FkZXJcIiwgW1wiJHFcIiwgXCIkaW5zdGFudFwiLCBmdW5jdGlvbiAoJHEsICRpbnN0YW50KSB7XG4gIHJldHVybiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgZGVmZXJyZWQucmVzb2x2ZSgkaW5zdGFudC50cmFuc2xhdGUob3B0aW9ucy5rZXkpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbn1dKVxuXG4uZmFjdG9yeSgnJGh1bGxDb25maWcnLCBbJyRodWxsSW5pdCcsIGZ1bmN0aW9uKCRodWxsSW5pdCkge1xuICBmdW5jdGlvbiBnZXRBdXRoU2VydmljZXMoKSB7XG4gICAgdmFyIGF1dGggPSBIdWxsLmNvbmZpZygnc2VydmljZXMnKS5hdXRoIHx8IHt9O1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhhdXRoKS5maWx0ZXIoZnVuY3Rpb24ocykgeyByZXR1cm4gcyAhPT0gJ2h1bGwnOyB9KTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZ2V0QXV0aFNlcnZpY2VzOiBnZXRBdXRoU2VydmljZXNcbiAgfTtcbn1dKVxuXG4uZGlyZWN0aXZlKFwicHJvZ3Jlc3NcIiwgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogXCJBXCIsXG4gICAgc2NvcGU6IHsgc3RlcDogXCI9XCIsIHN0ZXBzOiBcIj1cIiwgc3RlcEluZGV4OiBcIj1cIiB9LFxuICAgIHRlbXBsYXRlVXJsOiBcImRpcmVjdGl2ZXMvcHJvZ3Jlc3MuaHRtbFwiLFxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSkge1xuICAgICAgJHNjb3BlLnByb2dyZXNzUmF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gMTAwICogKCRzY29wZS5zdGVwSW5kZXggKyAxKSAvICgkc2NvcGUuc3RlcHMubGVuZ3RoICsgMSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufSlcblxuLmRpcmVjdGl2ZShcInNwaW5uZXJcIiwgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogXCJFQVwiLFxuICAgIHNjb3BlOiB7IHNwaW5uaW5nOiBcIj1cIiB9LFxuICAgIHRlbXBsYXRlVXJsOiBcImRpcmVjdGl2ZXMvc3Bpbm5lci5odG1sXCJcbiAgfTtcbn0pXG5cbi5maWx0ZXIoJ2NhcGl0YWxpemUnLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGlucHV0LCBhbGwpIHtcbiAgICByZXR1cm4gKCEhaW5wdXQpID8gaW5wdXQucmVwbGFjZSgvKFteXFxXX10rW15cXHMtXSopICovZywgZnVuY3Rpb24odHh0KXsgcmV0dXJuIHR4dC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHR4dC5zdWJzdHIoMSkudG9Mb3dlckNhc2UoKTsgfSkgOiAnJztcbiAgfVxufSlcblxuLmNvbnRyb2xsZXIoJ0Zvcm1Db250cm9sbGVyJywgWyckc2NvcGUnLCAnJGluc3RhbnQnLCBmdW5jdGlvbigkc2NvcGUpIHtcbiAgJHNjb3BlLm1vZGVsID0ge307XG4gIHZhciBmaWVsZHMgPSAoJHNjb3BlLmluc3RhbnQuZm9ybSAmJiAkc2NvcGUuaW5zdGFudC5mb3JtLmZpZWxkc19saXN0KSB8fCBbXTtcbiAgYW5ndWxhci5mb3JFYWNoKGZpZWxkcywgZnVuY3Rpb24oZmllbGQpIHtcbiAgICAkc2NvcGUubW9kZWxbZmllbGQubmFtZV0gPSBmaWVsZC52YWx1ZTtcbiAgfSk7XG4gICRzY29wZS5zY2hlbWEgPSAkc2NvcGUuaW5zdGFudC5mb3JtLmZpZWxkc19zY2hlbWE7XG4gICRzY29wZS5mb3JtID0gW1xuICAgIHtcbiAgICAgIFwidHlwZVwiOiBcImZpZWxkc2V0XCIsXG4gICAgICBcInRpdGxlXCIgOiBcIkZvcm1cIixcbiAgICAgIFwiaXRlbXNcIiA6IFsgXCIqXCIgXSxcbiAgICB9LFxuICAgIHsgXCJ0eXBlXCI6IFwic3VibWl0XCIsIFwidGl0bGVcIjogXCJTYXZlXCIgfVxuICBdO1xuXG4gICRzY29wZS5vblN1Ym1pdCA9IGZ1bmN0aW9uKGZvcm0pIHtcbiAgICAvLyBGaXJzdCB3ZSBicm9hZGNhc3QgYW4gZXZlbnQgc28gYWxsIGZpZWxkcyB2YWxpZGF0ZSB0aGVtc2VsdmVzXG4gICAgJHNjb3BlLiRicm9hZGNhc3QoJ3NjaGVtYUZvcm1WYWxpZGF0ZScpO1xuXG4gICAgLy8gVGhlbiB3ZSBjaGVjayBpZiB0aGUgZm9ybSBpcyB2YWxpZFxuICAgIGlmIChmb3JtLiR2YWxpZCkge1xuICAgICAgJGluc3RhbnQuc3VibWl0Rm9ybSgkc2NvcGUubW9kZWwpO1xuICAgIH1cbiAgfVxufV0pXG5cbi5jb250cm9sbGVyKCdJbnN0YW50V2luQ29udHJvbGxlcicsWyckc2NvcGUnLCAnJGluc3RhbnQnLCAnJHRyYW5zbGF0ZScsICckaHVsbENvbmZpZycsXG4gIGZ1bmN0aW9uIEluc3RhbnRXaW5Db250cm9sbGVyKCRzY29wZSwgJGluc3RhbnQsICR0cmFuc2xhdGUsICRodWxsQ29uZmlnKSB7XG4gICAgJHNjb3BlLnN0eWxlcyA9IHt9O1xuICAgICRzY29wZS5sb2dpbiA9IEh1bGwubG9naW47XG4gICAgJHNjb3BlLmxvZ291dCA9IEh1bGwubG9nb3V0O1xuICAgICRzY29wZS5wbGF5ID0gJGluc3RhbnQucGxheTtcblxuICAgICRzY29wZS5zdGVwcyA9IFN0ZXBzO1xuICAgICRzY29wZS4kaW5zdGFudCA9ICRpbnN0YW50O1xuICAgICRzY29wZS5pbnN0YW50ID0gJGluc3RhbnQuZ2V0U3RhdGUoKTtcbiAgICAkc2NvcGUuYXV0aFNlcnZpY2VzID0gJGh1bGxDb25maWcuZ2V0QXV0aFNlcnZpY2VzKCk7XG5cbiAgICBmdW5jdGlvbiBzZXRTdHlsZXMoc2V0dGluZ3MpIHtcbiAgICAgIHZhciBzdHlsZXMgPSB7fTtcbiAgICAgIGFuZ3VsYXIuZm9yRWFjaChzZXR0aW5ncy5pbWFnZXMsIGZ1bmN0aW9uKGltZywgdGFyZ2V0KSB7XG4gICAgICAgIGlmIChpbWcpIHtcbiAgICAgICAgICBzdHlsZXNbdGFyZ2V0XSA9IHN0eWxlc1t0YXJnZXRdIHx8IHt9O1xuICAgICAgICAgIHN0eWxlc1t0YXJnZXRdLmJhY2tncm91bmRJbWFnZSA9ICd1cmwoJyArIGltZyArICcpJztcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICAkc2NvcGUuc3R5bGVzID0gc3R5bGVzO1xuICAgIH1cblxuICAgIHNldFN0eWxlcygkc2NvcGUuaW5zdGFudC5zZXR0aW5ncyk7XG5cbiAgICBmdW5jdGlvbiBvbkNoYW5nZShpbnN0YW50KSB7XG4gICAgICAkc2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xuICAgICAgICAkc2NvcGUuaW5zdGFudCA9IGluc3RhbnQ7XG4gICAgICAgIHNldFN0eWxlcyhpbnN0YW50LnNldHRpbmdzKTtcbiAgICAgICAgJHRyYW5zbGF0ZS5yZWZyZXNoKCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAkaW5zdGFudC5vbkNoYW5nZShvbkNoYW5nZSk7XG4gIH1cbl0pO1xuXG5IdWxsLm9uRW1iZWQoZG9jdW1lbnQsIGZ1bmN0aW9uKGVsZW1lbnQsIGRlcGxveW1lbnQpIHtcbiAgYXBwLnZhbHVlKCckaHVsbEluaXQnLCB7XG4gICAgdXNlcjogSHVsbC5jdXJyZW50VXNlcigpLFxuICAgIHNoaXA6IGRlcGxveW1lbnQuc2hpcFxuICB9KTtcblxuICBhbmd1bGFyLmJvb3RzdHJhcChlbGVtZW50LCBbJ2h1bGwtaW5zdGFudCddKTtcbn0pO1xuXG4iLCIvKiFcbiAqIHBpY2thZGF0ZS5qcyB2My40LjAsIDIwMTQvMDIvMTVcbiAqIEJ5IEFtc3VsLCBodHRwOi8vYW1zdWwuY2FcbiAqIEhvc3RlZCBvbiBodHRwOi8vYW1zdWwuZ2l0aHViLmlvL3BpY2thZGF0ZS5qc1xuICogTGljZW5zZWQgdW5kZXIgTUlUXG4gKi9cbiFmdW5jdGlvbihhKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwicGlja2VyXCIsW1wiYW5ndWxhclwiXSxhKTp0aGlzLlBpY2tlcj1hKGFuZ3VsYXIpfShmdW5jdGlvbihhKXtmdW5jdGlvbiBiKGEsZCxlLGcpe2Z1bmN0aW9uIGgoKXtyZXR1cm4gYi5fLm5vZGUoXCJkaXZcIixiLl8ubm9kZShcImRpdlwiLGIuXy5ub2RlKFwiZGl2XCIsYi5fLm5vZGUoXCJkaXZcIixyLmNvbXBvbmVudC5ub2RlcyhvLm9wZW4pLG4uYm94KSxuLndyYXApLG4uZnJhbWUpLG4uaG9sZGVyKX1mdW5jdGlvbiBpKCl7cC5kYXRhKGQscikscC5hZGRDbGFzcyhuLmlucHV0KSxwWzBdLnZhbHVlPXAuYXR0cihcImRhdGEtdmFsdWVcIik/ci5nZXQoXCJzZWxlY3RcIixtLmZvcm1hdCk6YS52YWx1ZSxhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIiNcIitvLmlkKSkub24oXCJmb2N1c1wiLGwpLGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiI1wiK28uaWQpKS5vbihcImNsaWNrXCIsbCksbS5lZGl0YWJsZXx8YW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIjXCIrby5pZCkpLm9uKFwia2V5ZG93blwiLGZ1bmN0aW9uKGEpe3ZhciBiPWEua2V5Q29kZSxjPS9eKDh8NDYpJC8udGVzdChiKTtyZXR1cm4gMjc9PWI/KHIuY2xvc2UoKSwhMSk6dm9pZCgoMzI9PWJ8fGN8fCFvLm9wZW4mJnIuY29tcG9uZW50LmtleVtiXSkmJihhLnByZXZlbnREZWZhdWx0KCksYS5zdG9wUHJvcGFnYXRpb24oKSxjP3IuY2xlYXIoKS5jbG9zZSgpOnIub3BlbigpKSl9KSxjKGEse2hhc3BvcHVwOiEwLGV4cGFuZGVkOiExLHJlYWRvbmx5OiExLG93bnM6YS5pZCtcIl9yb290XCIrKHIuX2hpZGRlbj9cIiBcIityLl9oaWRkZW4uaWQ6XCJcIil9KX1mdW5jdGlvbiBqKCl7ZnVuY3Rpb24gZCgpe2FuZ3VsYXIuZWxlbWVudChyLiRyb290WzBdLnF1ZXJ5U2VsZWN0b3JBbGwoXCJbZGF0YS1waWNrXSwgW2RhdGEtbmF2XSwgW2RhdGEtY2xlYXJdXCIpKS5vbihcImNsaWNrXCIsZnVuY3Rpb24oKXt2YXIgYz1hbmd1bGFyLmVsZW1lbnQodGhpcyksZT1jLmhhc0NsYXNzKG4ubmF2RGlzYWJsZWQpfHxjLmhhc0NsYXNzKG4uZGlzYWJsZWQpLGY9ZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtmPWYmJihmLnR5cGV8fGYuaHJlZikmJmYsKGV8fGYmJiFyLiRyb290WzBdLmNvbnRhaW5zKGYpKSYmYS5mb2N1cygpLGMuYXR0cihcImRhdGEtbmF2XCIpJiYhZT8oci5zZXQoXCJoaWdobGlnaHRcIixyLmNvbXBvbmVudC5pdGVtLmhpZ2hsaWdodCx7bmF2OnBhcnNlSW50KGMuYXR0cihcImRhdGEtbmF2XCIpKX0pLGQoKSk6Yi5fLmlzSW50ZWdlcihwYXJzZUludChjLmF0dHIoXCJkYXRhLXBpY2tcIikpKSYmIWU/KHIuc2V0KFwic2VsZWN0XCIscGFyc2VJbnQoYy5hdHRyKFwiZGF0YS1waWNrXCIpKSkuY2xvc2UoITApLGQoKSk6Yy5hdHRyKFwiZGF0YS1jbGVhclwiKSYmKHIuY2xlYXIoKS5jbG9zZSghMCksZCgpKX0pfXIuJHJvb3Qub24oXCJmb2N1c2luXCIsZnVuY3Rpb24oYSl7ci4kcm9vdC5yZW1vdmVDbGFzcyhuLmZvY3VzZWQpLGMoci4kcm9vdFswXSxcInNlbGVjdGVkXCIsITEpLGEuc3RvcFByb3BhZ2F0aW9uKCl9KSxyLiRyb290Lm9uKFwibW91c2Vkb3duIGNsaWNrXCIsZnVuY3Rpb24oYil7dmFyIGM9Yi50YXJnZXQ7YyE9ci4kcm9vdC5jaGlsZHJlbigpWzBdJiYoYi5zdG9wUHJvcGFnYXRpb24oKSxcIm1vdXNlZG93blwiPT1iLnR5cGUmJlwiaW5wdXRcIiE9PWFuZ3VsYXIuZWxlbWVudChjKVswXS50YWdOYW1lJiZcIk9QVElPTlwiIT1jLm5vZGVOYW1lJiYoYi5wcmV2ZW50RGVmYXVsdCgpLGEuZm9jdXMoKSkpfSksZCgpLGMoci4kcm9vdFswXSxcImhpZGRlblwiLCEwKX1mdW5jdGlvbiBrKCl7dmFyIGI9W1wic3RyaW5nXCI9PXR5cGVvZiBtLmhpZGRlblByZWZpeD9tLmhpZGRlblByZWZpeDpcIlwiLFwic3RyaW5nXCI9PXR5cGVvZiBtLmhpZGRlblN1ZmZpeD9tLmhpZGRlblN1ZmZpeDpcIl9zdWJtaXRcIl07ci5faGlkZGVuPWFuZ3VsYXIuZWxlbWVudCgnPGlucHV0IHR5cGU9aGlkZGVuIG5hbWU9XCInK2JbMF0rYS5uYW1lK2JbMV0rJ1wiaWQ9XCInK2JbMF0rYS5pZCtiWzFdKydcIicrKHAuYXR0cihcImRhdGEtdmFsdWVcIil8fGEudmFsdWU/JyB2YWx1ZT1cIicrci5nZXQoXCJzZWxlY3RcIixtLmZvcm1hdFN1Ym1pdCkrJ1wiJzpcIlwiKStcIj5cIilbMF0scC5vbihcImNoYW5nZS5cIitvLmlkLGZ1bmN0aW9uKCl7ci5faGlkZGVuLnZhbHVlPWEudmFsdWU/ci5nZXQoXCJzZWxlY3RcIixtLmZvcm1hdFN1Ym1pdCk6XCJcIn0pLmFmdGVyKHIuX2hpZGRlbil9ZnVuY3Rpb24gbChhKXthLnN0b3BQcm9wYWdhdGlvbigpLFwiZm9jdXNcIj09YS50eXBlJiYoci4kcm9vdC5hZGRDbGFzcyhuLmZvY3VzZWQpLGMoci4kcm9vdFswXSxcInNlbGVjdGVkXCIsITApKSxyLm9wZW4oKX1pZighYSlyZXR1cm4gYjt2YXIgbTtlPyhtPWUuZGVmYXVsdHMsYW5ndWxhci5leHRlbmQobSxnKSk6bT1nfHx7fTt2YXIgbj1iLmtsYXNzZXMoKTthbmd1bGFyLmV4dGVuZChuLG0ua2xhc3MpO3ZhciBvPXtpZDphLmlkfHxcIlBcIitNYXRoLmFicyh+fihNYXRoLnJhbmRvbSgpKm5ldyBEYXRlKSl9LHA9YW5ndWxhci5lbGVtZW50KGEpLHE9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5zdGFydCgpfSxyPXEucHJvdG90eXBlPXtjb25zdHJ1Y3RvcjpxLCRub2RlOnAsc3RhcnQ6ZnVuY3Rpb24oKXtyZXR1cm4gbyYmby5zdGFydD9yOihvLm1ldGhvZHM9e30sby5zdGFydD0hMCxvLm9wZW49ITEsby50eXBlPWEudHlwZSxhLmF1dG9mb2N1cz1hPT1kb2N1bWVudC5hY3RpdmVFbGVtZW50LGEudHlwZT1cInRleHRcIixhLnJlYWRPbmx5PSFtLmVkaXRhYmxlLGEuaWQ9YS5pZHx8by5pZCxyLmNvbXBvbmVudD1uZXcgZShyLG0pLHIuJHJvb3Q9YW5ndWxhci5lbGVtZW50KGIuXy5ub2RlKFwiZGl2XCIsaCgpLG4ucGlja2VyLCdpZD1cIicrYS5pZCsnX3Jvb3RcIicpKSxqKCksbS5mb3JtYXRTdWJtaXQmJmsoKSxpKCksbS5jb250YWluZXI/YW5ndWxhci5lbGVtZW50KG0uY29udGFpbmVyKS5hcHBlbmQoci4kcm9vdCk6cC5hZnRlcihyLiRyb290KSxyLm9uKHtzdGFydDpyLmNvbXBvbmVudC5vblN0YXJ0LHJlbmRlcjpyLmNvbXBvbmVudC5vblJlbmRlcixzdG9wOnIuY29tcG9uZW50Lm9uU3RvcCxvcGVuOnIuY29tcG9uZW50Lm9uT3BlbixjbG9zZTpyLmNvbXBvbmVudC5vbkNsb3NlLHNldDpyLmNvbXBvbmVudC5vblNldH0pLm9uKHtzdGFydDptLm9uU3RhcnQscmVuZGVyOm0ub25SZW5kZXIsc3RvcDptLm9uU3RvcCxvcGVuOm0ub25PcGVuLGNsb3NlOm0ub25DbG9zZSxzZXQ6bS5vblNldH0pLGEuYXV0b2ZvY3VzJiZyLm9wZW4oKSxyLnRyaWdnZXIoXCJzdGFydFwiKS50cmlnZ2VyKFwicmVuZGVyXCIpKX0scmVuZGVyOmZ1bmN0aW9uKGEpe3JldHVybiBhP3IuJHJvb3QuaHRtbChoKCkpOmFuZ3VsYXIuZWxlbWVudChyLiRyb290WzBdLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuXCIrbi5ib3gpKS5odG1sKHIuY29tcG9uZW50Lm5vZGVzKG8ub3BlbikpLHIudHJpZ2dlcihcInJlbmRlclwiKX0sc3RvcDpmdW5jdGlvbigpe3JldHVybiBvLnN0YXJ0PyhyLmNsb3NlKCksci5faGlkZGVuJiZyLl9oaWRkZW4ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChyLl9oaWRkZW4pLHIuJHJvb3QucmVtb3ZlKCkscC5yZW1vdmVDbGFzcyhuLmlucHV0KS5yZW1vdmVEYXRhKGQpLHNldFRpbWVvdXQoZnVuY3Rpb24oKXtwLm9mZihcIi5cIitvLmlkKX0sMCksYS50eXBlPW8udHlwZSxhLnJlYWRPbmx5PSExLHIudHJpZ2dlcihcInN0b3BcIiksby5tZXRob2RzPXt9LG8uc3RhcnQ9ITEscik6cn0sb3BlbjpmdW5jdGlvbihkKXtyZXR1cm4gby5vcGVuP3I6KHAuYWRkQ2xhc3Mobi5hY3RpdmUpLGMoYSxcImV4cGFuZGVkXCIsITApLHIuJHJvb3QuYWRkQ2xhc3Mobi5vcGVuZWQpLGMoci4kcm9vdFswXSxcImhpZGRlblwiLCExKSxkIT09ITEmJihvLm9wZW49ITAscC50cmlnZ2VySGFuZGxlcihcImZvY3VzXCIpLGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiI1wiK28uaWQpKS5vbihcImNsaWNrIGZvY3VzaW5cIixmdW5jdGlvbihiKXt2YXIgYz1iLnRhcmdldDtjIT1hJiZjIT1kb2N1bWVudCYmMyE9Yi53aGljaCYmci5jbG9zZShjPT09ci4kcm9vdC5jaGlsZHJlbigpWzBdKX0pLGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiI1wiK28uaWQpKS5vbihcImtleWRvd25cIixmdW5jdGlvbihjKXt2YXIgZD1jLmtleUNvZGUsZT1yLmNvbXBvbmVudC5rZXlbZF0sZj1jLnRhcmdldDsyNz09ZD9yLmNsb3NlKCEwKTpmIT1hfHwhZSYmMTMhPWQ/ci4kcm9vdFswXS5jb250YWlucyhmKSYmMTM9PWQmJihjLnByZXZlbnREZWZhdWx0KCksZi5jbGljaygpKTooYy5wcmV2ZW50RGVmYXVsdCgpLGU/Yi5fLnRyaWdnZXIoci5jb21wb25lbnQua2V5LmdvLHIsW2IuXy50cmlnZ2VyKGUpXSk6YW5ndWxhci5lbGVtZW50KHIuJHJvb3RbMF0ucXVlcnlTZWxlY3RvckFsbChcIi5cIituLmhpZ2hsaWdodGVkKSkuaGFzQ2xhc3Mobi5kaXNhYmxlZCl8fHIuc2V0KFwic2VsZWN0XCIsci5jb21wb25lbnQuaXRlbS5oaWdobGlnaHQpLmNsb3NlKCkpfSkpLHIudHJpZ2dlcihcIm9wZW5cIikpfSxjbG9zZTpmdW5jdGlvbihiKXtyZXR1cm4gYiYmKHAub2ZmKFwiZm9jdXMuXCIrby5pZCkscC50cmlnZ2VySGFuZGxlcihcImZvY3VzXCIpLHNldFRpbWVvdXQoZnVuY3Rpb24oKXthbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIiNcIitvLmlkKSkub24oXCJmb2N1c1wiLGwpfSwwKSkscC5yZW1vdmVDbGFzcyhuLmFjdGl2ZSksYyhhLFwiZXhwYW5kZWRcIiwhMSksci4kcm9vdC5yZW1vdmVDbGFzcyhuLm9wZW5lZCtcIiBcIituLmZvY3VzZWQpLGMoci4kcm9vdFswXSxcImhpZGRlblwiLCEwKSxjKHIuJHJvb3RbMF0sXCJzZWxlY3RlZFwiLCExKSxvLm9wZW4/KHNldFRpbWVvdXQoZnVuY3Rpb24oKXtvLm9wZW49ITF9LDFlMyksZi5vZmYoXCIuXCIrby5pZCksci50cmlnZ2VyKFwiY2xvc2VcIikpOnJ9LGNsZWFyOmZ1bmN0aW9uKCl7cmV0dXJuIHIuc2V0KFwiY2xlYXJcIil9LHNldDpmdW5jdGlvbihhLGIsYyl7dmFyIGQsZSxmPWFuZ3VsYXIuaXNPYmplY3QoYSksZz1mP2E6e307aWYoYz1mJiZhbmd1bGFyLmlzT2JqZWN0KGIpP2I6Y3x8e30sYSl7Znx8KGdbYV09Yik7Zm9yKGQgaW4gZyllPWdbZF0sZCBpbiByLmNvbXBvbmVudC5pdGVtJiZyLmNvbXBvbmVudC5zZXQoZCxlLGMpLChcInNlbGVjdFwiPT1kfHxcImNsZWFyXCI9PWQpJiYocFswXS52YWx1ZT1cImNsZWFyXCI9PWQ/XCJcIjpyLmdldChkLG0uZm9ybWF0KSxwLnRyaWdnZXJIYW5kbGVyKFwiY2hhbmdlXCIpKTtyLnJlbmRlcigpfXJldHVybiBjLm11dGVkP3I6ci50cmlnZ2VyKFwic2V0XCIsZyl9LGdldDpmdW5jdGlvbihjLGQpe3JldHVybiBjPWN8fFwidmFsdWVcIixudWxsIT1vW2NdP29bY106XCJ2YWx1ZVwiPT1jP2EudmFsdWU6YyBpbiByLmNvbXBvbmVudC5pdGVtP1wic3RyaW5nXCI9PXR5cGVvZiBkP2IuXy50cmlnZ2VyKHIuY29tcG9uZW50LmZvcm1hdHMudG9TdHJpbmcsci5jb21wb25lbnQsW2Qsci5jb21wb25lbnQuZ2V0KGMpXSk6ci5jb21wb25lbnQuZ2V0KGMpOnZvaWQgMH0sb246ZnVuY3Rpb24oYSxiKXt2YXIgYyxkLGU9YW5ndWxhci5pc09iamVjdChhKSxmPWU/YTp7fTtpZihhKXtlfHwoZlthXT1iKTtmb3IoYyBpbiBmKWQ9ZltjXSxvLm1ldGhvZHNbY109by5tZXRob2RzW2NdfHxbXSxvLm1ldGhvZHNbY10ucHVzaChkKX1yZXR1cm4gcn0sb2ZmOmZ1bmN0aW9uKCl7dmFyIGEsYixjPWFyZ3VtZW50cztmb3IoYT0wLG5hbWVzQ291bnQ9Yy5sZW5ndGg7bmFtZXNDb3VudD5hO2ErPTEpYj1jW2FdLGIgaW4gby5tZXRob2RzJiZkZWxldGUgby5tZXRob2RzW2JdO3JldHVybiByfSx0cmlnZ2VyOmZ1bmN0aW9uKGEsYyl7dmFyIGQ9by5tZXRob2RzW2FdO3JldHVybiBkJiZkLm1hcChmdW5jdGlvbihhKXtiLl8udHJpZ2dlcihhLHIsW2NdKX0pLHJ9fTtyZXR1cm4gbmV3IHF9ZnVuY3Rpb24gYyhhLGIsYyl7aWYoYW5ndWxhci5pc09iamVjdChiKSlmb3IodmFyIGUgaW4gYilkKGEsZSxiW2VdKTtlbHNlIGQoYSxiLGMpfWZ1bmN0aW9uIGQoYSxiLGMpe2FuZ3VsYXIuZWxlbWVudChhKS5hdHRyKChcInJvbGVcIj09Yj9cIlwiOlwiYXJpYS1cIikrYixjKX1mdW5jdGlvbiBlKGEsYil7YW5ndWxhci5pc09iamVjdChhKXx8KGE9e2F0dHJpYnV0ZTpifSksYj1cIlwiO2Zvcih2YXIgYyBpbiBhKXt2YXIgZD0oXCJyb2xlXCI9PWM/XCJcIjpcImFyaWEtXCIpK2MsZT1hW2NdO2IrPW51bGw9PWU/XCJcIjpkKyc9XCInK2FbY10rJ1wiJ31yZXR1cm4gYn12YXIgZj1hbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQpO3JldHVybiBiLmtsYXNzZXM9ZnVuY3Rpb24oYSl7cmV0dXJuIGE9YXx8XCJwaWNrZXJcIix7cGlja2VyOmEsb3BlbmVkOmErXCItLW9wZW5lZFwiLGZvY3VzZWQ6YStcIi0tZm9jdXNlZFwiLGlucHV0OmErXCJfX2lucHV0XCIsYWN0aXZlOmErXCJfX2lucHV0LS1hY3RpdmVcIixob2xkZXI6YStcIl9faG9sZGVyXCIsZnJhbWU6YStcIl9fZnJhbWVcIix3cmFwOmErXCJfX3dyYXBcIixib3g6YStcIl9fYm94XCJ9fSxiLl89e2dyb3VwOmZ1bmN0aW9uKGEpe2Zvcih2YXIgYyxkPVwiXCIsZT1iLl8udHJpZ2dlcihhLm1pbixhKTtlPD1iLl8udHJpZ2dlcihhLm1heCxhLFtlXSk7ZSs9YS5pKWM9Yi5fLnRyaWdnZXIoYS5pdGVtLGEsW2VdKSxkKz1iLl8ubm9kZShhLm5vZGUsY1swXSxjWzFdLGNbMl0pO3JldHVybiBkfSxub2RlOmZ1bmN0aW9uKGIsYyxkLGUpe3JldHVybiBjPyhjPWEuaXNBcnJheShjKT9jLmpvaW4oXCJcIik6YyxkPWQ/JyBjbGFzcz1cIicrZCsnXCInOlwiXCIsZT1lP1wiIFwiK2U6XCJcIixcIjxcIitiK2QrZStcIj5cIitjK1wiPC9cIitiK1wiPlwiKTpcIlwifSxsZWFkOmZ1bmN0aW9uKGEpe3JldHVybigxMD5hP1wiMFwiOlwiXCIpK2F9LHRyaWdnZXI6ZnVuY3Rpb24oYSxiLGMpe3JldHVyblwiZnVuY3Rpb25cIj09dHlwZW9mIGE/YS5hcHBseShiLGN8fFtdKTphfSxkaWdpdHM6ZnVuY3Rpb24oYSl7cmV0dXJuL1xcZC8udGVzdChhWzFdKT8yOjF9LGlzRGF0ZTpmdW5jdGlvbihhKXtyZXR1cm57fS50b1N0cmluZy5jYWxsKGEpLmluZGV4T2YoXCJEYXRlXCIpPi0xJiZ0aGlzLmlzSW50ZWdlcihhLmdldERhdGUoKSl9LGlzSW50ZWdlcjpmdW5jdGlvbihhKXtyZXR1cm57fS50b1N0cmluZy5jYWxsKGEpLmluZGV4T2YoXCJOdW1iZXJcIik+LTEmJmElMT09PTB9LGFyaWFBdHRyOmV9LGIuZXh0ZW5kPWZ1bmN0aW9uKGEsYyl7YW5ndWxhci5lbGVtZW50LnByb3RvdHlwZVthXT1mdW5jdGlvbihkLGUpe3ZhciBmPXRoaXMuZGF0YShhKTtpZihcInBpY2tlclwiPT1kKXJldHVybiBmO2lmKGYmJlwic3RyaW5nXCI9PXR5cGVvZiBkKXJldHVybiBiLl8udHJpZ2dlcihmW2RdLGYsW2VdKSx0aGlzO2Zvcih2YXIgZz0wO2c8dGhpcy5sZW5ndGg7ZysrKXt2YXIgaD1hbmd1bGFyLmVsZW1lbnQodGhpc1tnXSk7aC5kYXRhKGEpfHxuZXcgYihoWzBdLGEsYyxkKX19LGFuZ3VsYXIuZWxlbWVudC5wcm90b3R5cGVbYV0uZGVmYXVsdHM9Yy5kZWZhdWx0c30sYn0pO1xuLyohXG4gKiBEYXRlIHBpY2tlciBmb3IgcGlja2FkYXRlLmpzIHYzLjQuMFxuICogaHR0cDovL2Ftc3VsLmdpdGh1Yi5pby9waWNrYWRhdGUuanMvZGF0ZS5odG1cbiAqL1xuIWZ1bmN0aW9uKGEpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoW1wicGlja2VyXCIsXCJhbmd1bGFyXCJdLGEpOmEoUGlja2VyLGFuZ3VsYXIpfShmdW5jdGlvbihhLGIpe2Z1bmN0aW9uIGMoYSxjKXt2YXIgZD10aGlzLGU9YS4kbm9kZVswXS52YWx1ZSxmPWEuJG5vZGUuYXR0cihcImRhdGEtdmFsdWVcIiksZz1mfHxlLGg9Zj9jLmZvcm1hdFN1Ym1pdDpjLmZvcm1hdCxpPWZ1bmN0aW9uKCl7cmV0dXJuXCJydGxcIj09PWdldENvbXB1dGVkU3R5bGUoYS4kcm9vdFswXSkuZGlyZWN0aW9ufTtkLnNldHRpbmdzPWMsZC4kbm9kZT1hLiRub2RlLGQucXVldWU9e21pbjpcIm1lYXN1cmUgY3JlYXRlXCIsbWF4OlwibWVhc3VyZSBjcmVhdGVcIixub3c6XCJub3cgY3JlYXRlXCIsc2VsZWN0OlwicGFyc2UgY3JlYXRlIHZhbGlkYXRlXCIsaGlnaGxpZ2h0OlwicGFyc2UgbmF2aWdhdGUgY3JlYXRlIHZhbGlkYXRlXCIsdmlldzpcInBhcnNlIGNyZWF0ZSB2YWxpZGF0ZSB2aWV3c2V0XCIsZGlzYWJsZTpcImRlYWN0aXZhdGVcIixlbmFibGU6XCJhY3RpdmF0ZVwifSxkLml0ZW09e30sZC5pdGVtLmRpc2FibGU9KGMuZGlzYWJsZXx8W10pLnNsaWNlKDApLGQuaXRlbS5lbmFibGU9LWZ1bmN0aW9uKGEpe3JldHVybiBhWzBdPT09ITA/YS5zaGlmdCgpOi0xfShkLml0ZW0uZGlzYWJsZSksZC5zZXQoXCJtaW5cIixjLm1pbikuc2V0KFwibWF4XCIsYy5tYXgpLnNldChcIm5vd1wiKSxnP2Quc2V0KFwic2VsZWN0XCIsZyx7Zm9ybWF0OmgsZnJvbVZhbHVlOiEhZX0pOmQuc2V0KFwic2VsZWN0XCIsbnVsbCkuc2V0KFwiaGlnaGxpZ2h0XCIsZC5pdGVtLm5vdyksZC5rZXk9ezQwOjcsMzg6LTcsMzk6ZnVuY3Rpb24oKXtyZXR1cm4gaSgpPy0xOjF9LDM3OmZ1bmN0aW9uKCl7cmV0dXJuIGkoKT8xOi0xfSxnbzpmdW5jdGlvbihhKXt2YXIgYj1kLml0ZW0uaGlnaGxpZ2h0LGM9bmV3IERhdGUoYi55ZWFyLGIubW9udGgsYi5kYXRlK2EpO2Quc2V0KFwiaGlnaGxpZ2h0XCIsW2MuZ2V0RnVsbFllYXIoKSxjLmdldE1vbnRoKCksYy5nZXREYXRlKCldLHtpbnRlcnZhbDphfSksdGhpcy5yZW5kZXIoKX19LGEub24oXCJyZW5kZXJcIixmdW5jdGlvbigpe2IuZWxlbWVudChhLiRyb290WzBdLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuXCIrYy5rbGFzcy5zZWxlY3RNb250aCkpLm9uKFwiY2hhbmdlXCIsZnVuY3Rpb24oKXt2YXIgZD10aGlzLnZhbHVlO2QmJihhLnNldChcImhpZ2hsaWdodFwiLFthLmdldChcInZpZXdcIikueWVhcixkLGEuZ2V0KFwiaGlnaGxpZ2h0XCIpLmRhdGVdKSxiLmVsZW1lbnQoYS4kcm9vdFswXS5xdWVyeVNlbGVjdG9yQWxsKFwiLlwiK2Mua2xhc3Muc2VsZWN0TW9udGgpKS50cmlnZ2VySGFuZGxlcihcImZvY3VzXCIpKX0pLGIuZWxlbWVudChhLiRyb290WzBdLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuXCIrYy5rbGFzcy5zZWxlY3RZZWFyKSkub24oXCJjaGFuZ2VcIixmdW5jdGlvbigpe3ZhciBkPXRoaXMudmFsdWU7ZCYmKGEuc2V0KFwiaGlnaGxpZ2h0XCIsW2QsYS5nZXQoXCJ2aWV3XCIpLm1vbnRoLGEuZ2V0KFwiaGlnaGxpZ2h0XCIpLmRhdGVdKSxiLmVsZW1lbnQoYS4kcm9vdFswXS5xdWVyeVNlbGVjdG9yQWxsKFwiLlwiK2Mua2xhc3Muc2VsZWN0WWVhcikpLnRyaWdnZXJIYW5kbGVyKFwiZm9jdXNcIikpfSl9KS5vbihcIm9wZW5cIixmdW5jdGlvbigpe2IuZWxlbWVudChhLiRyb290WzBdLnF1ZXJ5U2VsZWN0b3JBbGwoXCJidXR0b24sIHNlbGVjdFwiKSkuYXR0cihcImRpc2FibGVkXCIsITEpfSkub24oXCJjbG9zZVwiLGZ1bmN0aW9uKCl7Yi5lbGVtZW50KGEuJHJvb3RbMF0ucXVlcnlTZWxlY3RvckFsbChcImJ1dHRvbiwgc2VsZWN0XCIpKS5hdHRyKFwiZGlzYWJsZWRcIiwhMCl9KX12YXIgZD03LGU9NixmPWEuXztjLnByb3RvdHlwZS5zZXQ9ZnVuY3Rpb24oYSxiLGMpe3ZhciBkPXRoaXMsZT1kLml0ZW07cmV0dXJuIG51bGw9PT1iPyhlW2FdPWIsZCk6KGVbXCJlbmFibGVcIj09YT9cImRpc2FibGVcIjpcImZsaXBcIj09YT9cImVuYWJsZVwiOmFdPWQucXVldWVbYV0uc3BsaXQoXCIgXCIpLm1hcChmdW5jdGlvbihlKXtyZXR1cm4gYj1kW2VdKGEsYixjKX0pLnBvcCgpLFwic2VsZWN0XCI9PWE/ZC5zZXQoXCJoaWdobGlnaHRcIixlLnNlbGVjdCxjKTpcImhpZ2hsaWdodFwiPT1hP2Quc2V0KFwidmlld1wiLGUuaGlnaGxpZ2h0LGMpOmEubWF0Y2goL14oZmxpcHxtaW58bWF4fGRpc2FibGV8ZW5hYmxlKSQvKSYmKGUuc2VsZWN0JiZkLmRpc2FibGVkKGUuc2VsZWN0KSYmZC5zZXQoXCJzZWxlY3RcIixlLnNlbGVjdCxjKSxlLmhpZ2hsaWdodCYmZC5kaXNhYmxlZChlLmhpZ2hsaWdodCkmJmQuc2V0KFwiaGlnaGxpZ2h0XCIsZS5oaWdobGlnaHQsYykpLGQpfSxjLnByb3RvdHlwZS5nZXQ9ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuaXRlbVthXX0sYy5wcm90b3R5cGUuY3JlYXRlPWZ1bmN0aW9uKGEsYyxkKXt2YXIgZSxnPXRoaXM7cmV0dXJuIGM9dm9pZCAwPT09Yz9hOmMsYz09LTEvMHx8MS8wPT1jP2U9YzpiLmlzT2JqZWN0KGMpJiZmLmlzSW50ZWdlcihjLnBpY2spP2M9Yy5vYmo6Yi5pc0FycmF5KGMpPyhjPW5ldyBEYXRlKGNbMF0sY1sxXSxjWzJdKSxjPWYuaXNEYXRlKGMpP2M6Zy5jcmVhdGUoKS5vYmopOmM9Zi5pc0ludGVnZXIoYyl8fGYuaXNEYXRlKGMpP2cubm9ybWFsaXplKG5ldyBEYXRlKGMpLGQpOmcubm93KGEsYyxkKSx7eWVhcjplfHxjLmdldEZ1bGxZZWFyKCksbW9udGg6ZXx8Yy5nZXRNb250aCgpLGRhdGU6ZXx8Yy5nZXREYXRlKCksZGF5OmV8fGMuZ2V0RGF5KCksb2JqOmV8fGMscGljazplfHxjLmdldFRpbWUoKX19LGMucHJvdG90eXBlLmNyZWF0ZVJhbmdlPWZ1bmN0aW9uKGEsYyl7dmFyIGQ9dGhpcyxlPWZ1bmN0aW9uKGEpe3JldHVybiBhPT09ITB8fGIuaXNBcnJheShhKXx8Zi5pc0RhdGUoYSk/ZC5jcmVhdGUoYSk6YX07cmV0dXJuIGYuaXNJbnRlZ2VyKGEpfHwoYT1lKGEpKSxmLmlzSW50ZWdlcihjKXx8KGM9ZShjKSksZi5pc0ludGVnZXIoYSkmJmIuaXNPYmplY3QoYyk/YT1bYy55ZWFyLGMubW9udGgsYy5kYXRlK2FdOmYuaXNJbnRlZ2VyKGMpJiZiLmlzT2JqZWN0KGEpJiYoYz1bYS55ZWFyLGEubW9udGgsYS5kYXRlK2NdKSx7ZnJvbTplKGEpLHRvOmUoYyl9fSxjLnByb3RvdHlwZS53aXRoaW5SYW5nZT1mdW5jdGlvbihhLGIpe3JldHVybiBhPXRoaXMuY3JlYXRlUmFuZ2UoYS5mcm9tLGEudG8pLGIucGljaz49YS5mcm9tLnBpY2smJmIucGljazw9YS50by5waWNrfSxjLnByb3RvdHlwZS5vdmVybGFwUmFuZ2VzPWZ1bmN0aW9uKGEsYil7dmFyIGM9dGhpcztyZXR1cm4gYT1jLmNyZWF0ZVJhbmdlKGEuZnJvbSxhLnRvKSxiPWMuY3JlYXRlUmFuZ2UoYi5mcm9tLGIudG8pLGMud2l0aGluUmFuZ2UoYSxiLmZyb20pfHxjLndpdGhpblJhbmdlKGEsYi50byl8fGMud2l0aGluUmFuZ2UoYixhLmZyb20pfHxjLndpdGhpblJhbmdlKGIsYS50byl9LGMucHJvdG90eXBlLm5vdz1mdW5jdGlvbihhLGIsYyl7cmV0dXJuIGI9bmV3IERhdGUsYyYmYy5yZWwmJmIuc2V0RGF0ZShiLmdldERhdGUoKStjLnJlbCksdGhpcy5ub3JtYWxpemUoYixjKX0sYy5wcm90b3R5cGUubmF2aWdhdGU9ZnVuY3Rpb24oYSxjLGQpe3ZhciBlLGYsZyxoLGk9Yi5pc0FycmF5KGMpLGo9Yi5pc09iamVjdChjKSxrPXRoaXMuaXRlbS52aWV3O2lmKGl8fGope2ZvcihqPyhmPWMueWVhcixnPWMubW9udGgsaD1jLmRhdGUpOihmPStjWzBdLGc9K2NbMV0saD0rY1syXSksZCYmZC5uYXYmJmsmJmsubW9udGghPT1nJiYoZj1rLnllYXIsZz1rLm1vbnRoKSxlPW5ldyBEYXRlKGYsZysoZCYmZC5uYXY/ZC5uYXY6MCksMSksZj1lLmdldEZ1bGxZZWFyKCksZz1lLmdldE1vbnRoKCk7bmV3IERhdGUoZixnLGgpLmdldE1vbnRoKCkhPT1nOyloLT0xO2M9W2YsZyxoXX1yZXR1cm4gY30sYy5wcm90b3R5cGUubm9ybWFsaXplPWZ1bmN0aW9uKGEpe3JldHVybiBhLnNldEhvdXJzKDAsMCwwLDApLGF9LGMucHJvdG90eXBlLm1lYXN1cmU9ZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzO3JldHVybiBiP2YuaXNJbnRlZ2VyKGIpJiYoYj1jLm5vdyhhLGIse3JlbDpifSkpOmI9XCJtaW5cIj09YT8tMS8wOjEvMCxifSxjLnByb3RvdHlwZS52aWV3c2V0PWZ1bmN0aW9uKGEsYil7cmV0dXJuIHRoaXMuY3JlYXRlKFtiLnllYXIsYi5tb250aCwxXSl9LGMucHJvdG90eXBlLnZhbGlkYXRlPWZ1bmN0aW9uKGEsYyxkKXt2YXIgZSxnLGgsaSxqPXRoaXMsaz1jLGw9ZCYmZC5pbnRlcnZhbD9kLmludGVydmFsOjEsbT0tMT09PWouaXRlbS5lbmFibGUsbj1qLml0ZW0ubWluLG89ai5pdGVtLm1heCxwPW0mJmouaXRlbS5kaXNhYmxlLmZpbHRlcihmdW5jdGlvbihhKXtpZihiLmlzQXJyYXkoYSkpe3ZhciBkPWouY3JlYXRlKGEpLnBpY2s7ZDxjLnBpY2s/ZT0hMDpkPmMucGljayYmKGc9ITApfXJldHVybiBmLmlzSW50ZWdlcihhKX0pLmxlbmd0aDtpZigoIWR8fCFkLm5hdikmJighbSYmai5kaXNhYmxlZChjKXx8bSYmai5kaXNhYmxlZChjKSYmKHB8fGV8fGcpfHwhbSYmKGMucGljazw9bi5waWNrfHxjLnBpY2s+PW8ucGljaykpKWZvcihtJiYhcCYmKCFnJiZsPjB8fCFlJiYwPmwpJiYobCo9LTEpO2ouZGlzYWJsZWQoYykmJihNYXRoLmFicyhsKT4xJiYoYy5tb250aDxrLm1vbnRofHxjLm1vbnRoPmsubW9udGgpJiYoYz1rLGw9bD4wPzE6LTEpLGMucGljazw9bi5waWNrPyhoPSEwLGw9MSxjPWouY3JlYXRlKFtuLnllYXIsbi5tb250aCxuLmRhdGUtMV0pKTpjLnBpY2s+PW8ucGljayYmKGk9ITAsbD0tMSxjPWouY3JlYXRlKFtvLnllYXIsby5tb250aCxvLmRhdGUrMV0pKSwhaHx8IWkpOyljPWouY3JlYXRlKFtjLnllYXIsYy5tb250aCxjLmRhdGUrbF0pO3JldHVybiBjfSxjLnByb3RvdHlwZS5kaXNhYmxlZD1mdW5jdGlvbihhKXt2YXIgYz10aGlzLGQ9Yy5pdGVtLmRpc2FibGUuZmlsdGVyKGZ1bmN0aW9uKGQpe3JldHVybiBmLmlzSW50ZWdlcihkKT9hLmRheT09PShjLnNldHRpbmdzLmZpcnN0RGF5P2Q6ZC0xKSU3OmIuaXNBcnJheShkKXx8Zi5pc0RhdGUoZCk/YS5waWNrPT09Yy5jcmVhdGUoZCkucGljazpiLmlzT2JqZWN0KGQpP2Mud2l0aGluUmFuZ2UoZCxhKTp2b2lkIDB9KTtyZXR1cm4gZD1kLmxlbmd0aCYmIWQuZmlsdGVyKGZ1bmN0aW9uKGEpe3JldHVybiBiLmlzQXJyYXkoYSkmJlwiaW52ZXJ0ZWRcIj09YVszXXx8Yi5pc09iamVjdChhKSYmYS5pbnZlcnRlZH0pLmxlbmd0aCwtMT09PWMuaXRlbS5lbmFibGU/IWQ6ZHx8YS5waWNrPGMuaXRlbS5taW4ucGlja3x8YS5waWNrPmMuaXRlbS5tYXgucGlja30sYy5wcm90b3R5cGUucGFyc2U9ZnVuY3Rpb24oYSxjLGQpe3ZhciBlLGc9dGhpcyxoPXt9O3JldHVybiFjfHxmLmlzSW50ZWdlcihjKXx8Yi5pc0FycmF5KGMpfHxmLmlzRGF0ZShjKXx8Yi5pc09iamVjdChjKSYmZi5pc0ludGVnZXIoYy5waWNrKT9jOihkJiZkLmZvcm1hdHx8KGQ9ZHx8e30sZC5mb3JtYXQ9Zy5zZXR0aW5ncy5mb3JtYXQpLGU9XCJzdHJpbmdcIiE9dHlwZW9mIGN8fGQuZnJvbVZhbHVlPzA6MSxnLmZvcm1hdHMudG9BcnJheShkLmZvcm1hdCkubWFwKGZ1bmN0aW9uKGEpe3ZhciBiPWcuZm9ybWF0c1thXSxkPWI/Zi50cmlnZ2VyKGIsZyxbYyxoXSk6YS5yZXBsYWNlKC9eIS8sXCJcIikubGVuZ3RoO2ImJihoW2FdPWMuc3Vic3RyKDAsZCkpLGM9Yy5zdWJzdHIoZCl9KSxbaC55eXl5fHxoLnl5LCsoaC5tbXx8aC5tKS1lLGguZGR8fGguZF0pfSxjLnByb3RvdHlwZS5mb3JtYXRzPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gYShhLGIsYyl7dmFyIGQ9YS5tYXRjaCgvXFx3Ky8pWzBdO3JldHVybiBjLm1tfHxjLm18fChjLm09Yi5pbmRleE9mKGQpKSxkLmxlbmd0aH1mdW5jdGlvbiBiKGEpe3JldHVybiBhLm1hdGNoKC9cXHcrLylbMF0ubGVuZ3RofXJldHVybntkOmZ1bmN0aW9uKGEsYil7cmV0dXJuIGE/Zi5kaWdpdHMoYSk6Yi5kYXRlfSxkZDpmdW5jdGlvbihhLGIpe3JldHVybiBhPzI6Zi5sZWFkKGIuZGF0ZSl9LGRkZDpmdW5jdGlvbihhLGMpe3JldHVybiBhP2IoYSk6dGhpcy5zZXR0aW5ncy53ZWVrZGF5c1Nob3J0W2MuZGF5XX0sZGRkZDpmdW5jdGlvbihhLGMpe3JldHVybiBhP2IoYSk6dGhpcy5zZXR0aW5ncy53ZWVrZGF5c0Z1bGxbYy5kYXldfSxtOmZ1bmN0aW9uKGEsYil7cmV0dXJuIGE/Zi5kaWdpdHMoYSk6Yi5tb250aCsxfSxtbTpmdW5jdGlvbihhLGIpe3JldHVybiBhPzI6Zi5sZWFkKGIubW9udGgrMSl9LG1tbTpmdW5jdGlvbihiLGMpe3ZhciBkPXRoaXMuc2V0dGluZ3MubW9udGhzU2hvcnQ7cmV0dXJuIGI/YShiLGQsYyk6ZFtjLm1vbnRoXX0sbW1tbTpmdW5jdGlvbihiLGMpe3ZhciBkPXRoaXMuc2V0dGluZ3MubW9udGhzRnVsbDtyZXR1cm4gYj9hKGIsZCxjKTpkW2MubW9udGhdfSx5eTpmdW5jdGlvbihhLGIpe3JldHVybiBhPzI6KFwiXCIrYi55ZWFyKS5zbGljZSgyKX0seXl5eTpmdW5jdGlvbihhLGIpe3JldHVybiBhPzQ6Yi55ZWFyfSx0b0FycmF5OmZ1bmN0aW9uKGEpe3JldHVybiBhLnNwbGl0KC8oZHsxLDR9fG17MSw0fXx5ezR9fHl5fCEuKS9nKX0sdG9TdHJpbmc6ZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzO3JldHVybiBjLmZvcm1hdHMudG9BcnJheShhKS5tYXAoZnVuY3Rpb24oYSl7cmV0dXJuIGYudHJpZ2dlcihjLmZvcm1hdHNbYV0sYyxbMCxiXSl8fGEucmVwbGFjZSgvXiEvLFwiXCIpfSkuam9pbihcIlwiKX19fSgpLGMucHJvdG90eXBlLmlzRGF0ZUV4YWN0PWZ1bmN0aW9uKGEsYyl7dmFyIGQ9dGhpcztyZXR1cm4gZi5pc0ludGVnZXIoYSkmJmYuaXNJbnRlZ2VyKGMpfHxcImJvb2xlYW5cIj09dHlwZW9mIGEmJlwiYm9vbGVhblwiPT10eXBlb2YgYz9hPT09YzooZi5pc0RhdGUoYSl8fGIuaXNBcnJheShhKSkmJihmLmlzRGF0ZShjKXx8Yi5pc0FycmF5KGMpKT9kLmNyZWF0ZShhKS5waWNrPT09ZC5jcmVhdGUoYykucGljazpiLmlzT2JqZWN0KGEpJiZiLmlzT2JqZWN0KGMpP2QuaXNEYXRlRXhhY3QoYS5mcm9tLGMuZnJvbSkmJmQuaXNEYXRlRXhhY3QoYS50byxjLnRvKTohMX0sYy5wcm90b3R5cGUuaXNEYXRlT3ZlcmxhcD1mdW5jdGlvbihhLGMpe3ZhciBkPXRoaXM7cmV0dXJuIGYuaXNJbnRlZ2VyKGEpJiYoZi5pc0RhdGUoYyl8fGIuaXNBcnJheShjKSk/YT09PWQuY3JlYXRlKGMpLmRheSsxOmYuaXNJbnRlZ2VyKGMpJiYoZi5pc0RhdGUoYSl8fGIuaXNBcnJheShhKSk/Yz09PWQuY3JlYXRlKGEpLmRheSsxOmIuaXNPYmplY3QoYSkmJmIuaXNPYmplY3QoYyk/ZC5vdmVybGFwUmFuZ2VzKGEsYyk6ITF9LGMucHJvdG90eXBlLmZsaXBFbmFibGU9ZnVuY3Rpb24oYSl7dmFyIGI9dGhpcy5pdGVtO2IuZW5hYmxlPWF8fCgtMT09Yi5lbmFibGU/MTotMSl9LGMucHJvdG90eXBlLmRlYWN0aXZhdGU9ZnVuY3Rpb24oYSxjKXt2YXIgZD10aGlzLGU9ZC5pdGVtLmRpc2FibGUuc2xpY2UoMCk7cmV0dXJuXCJmbGlwXCI9PWM/ZC5mbGlwRW5hYmxlKCk6Yz09PSExPyhkLmZsaXBFbmFibGUoMSksZT1bXSk6Yz09PSEwPyhkLmZsaXBFbmFibGUoLTEpLGU9W10pOmMubWFwKGZ1bmN0aW9uKGEpe2Zvcih2YXIgYyxnPTA7ZzxlLmxlbmd0aDtnKz0xKWlmKGQuaXNEYXRlRXhhY3QoYSxlW2ddKSl7Yz0hMDticmVha31jfHwoZi5pc0ludGVnZXIoYSl8fGYuaXNEYXRlKGEpfHxiLmlzQXJyYXkoYSl8fGIuaXNPYmplY3QoYSkmJmEuZnJvbSYmYS50bykmJmUucHVzaChhKX0pLGV9LGMucHJvdG90eXBlLmFjdGl2YXRlPWZ1bmN0aW9uKGEsYyl7dmFyIGQ9dGhpcyxlPWQuaXRlbS5kaXNhYmxlLGc9ZS5sZW5ndGg7cmV0dXJuXCJmbGlwXCI9PWM/ZC5mbGlwRW5hYmxlKCk6Yz09PSEwPyhkLmZsaXBFbmFibGUoMSksZT1bXSk6Yz09PSExPyhkLmZsaXBFbmFibGUoLTEpLGU9W10pOmMubWFwKGZ1bmN0aW9uKGEpe3ZhciBjLGgsaSxqO2ZvcihpPTA7Zz5pO2krPTEpe2lmKGg9ZVtpXSxkLmlzRGF0ZUV4YWN0KGgsYSkpe2M9ZVtpXT1udWxsLGo9ITA7YnJlYWt9aWYoZC5pc0RhdGVPdmVybGFwKGgsYSkpe2IuaXNPYmplY3QoYSk/KGEuaW52ZXJ0ZWQ9ITAsYz1hKTpiLmlzQXJyYXkoYSk/KGM9YSxjWzNdfHxjLnB1c2goXCJpbnZlcnRlZFwiKSk6Zi5pc0RhdGUoYSkmJihjPVthLmdldEZ1bGxZZWFyKCksYS5nZXRNb250aCgpLGEuZ2V0RGF0ZSgpLFwiaW52ZXJ0ZWRcIl0pO2JyZWFrfX1pZihjKWZvcihpPTA7Zz5pO2krPTEpaWYoZC5pc0RhdGVFeGFjdChlW2ldLGEpKXtlW2ldPW51bGw7YnJlYWt9aWYoailmb3IoaT0wO2c+aTtpKz0xKWlmKGQuaXNEYXRlT3ZlcmxhcChlW2ldLGEpKXtlW2ldPW51bGw7YnJlYWt9YyYmZS5wdXNoKGMpfSksZS5maWx0ZXIoZnVuY3Rpb24oYSl7cmV0dXJuIG51bGwhPWF9KX0sYy5wcm90b3R5cGUubm9kZXM9ZnVuY3Rpb24oYSl7dmFyIGI9dGhpcyxjPWIuc2V0dGluZ3MsZz1iLml0ZW0saD1nLm5vdyxpPWcuc2VsZWN0LGo9Zy5oaWdobGlnaHQsaz1nLnZpZXcsbD1nLmRpc2FibGUsbT1nLm1pbixuPWcubWF4LG89ZnVuY3Rpb24oYSl7cmV0dXJuIGMuZmlyc3REYXkmJmEucHVzaChhLnNoaWZ0KCkpLGYubm9kZShcInRoZWFkXCIsZi5ub2RlKFwidHJcIixmLmdyb3VwKHttaW46MCxtYXg6ZC0xLGk6MSxub2RlOlwidGhcIixpdGVtOmZ1bmN0aW9uKGIpe3JldHVyblthW2JdLGMua2xhc3Mud2Vla2RheXNdfX0pKSl9KChjLnNob3dXZWVrZGF5c0Z1bGw/Yy53ZWVrZGF5c0Z1bGw6Yy53ZWVrZGF5c1Nob3J0KS5zbGljZSgwKSkscD1mdW5jdGlvbihhKXtyZXR1cm4gZi5ub2RlKFwiZGl2XCIsXCIgXCIsYy5rbGFzc1tcIm5hdlwiKyhhP1wiTmV4dFwiOlwiUHJldlwiKV0rKGEmJmsueWVhcj49bi55ZWFyJiZrLm1vbnRoPj1uLm1vbnRofHwhYSYmay55ZWFyPD1tLnllYXImJmsubW9udGg8PW0ubW9udGg/XCIgXCIrYy5rbGFzcy5uYXZEaXNhYmxlZDpcIlwiKSxcImRhdGEtbmF2PVwiKyhhfHwtMSkpfSxxPWZ1bmN0aW9uKGIpe3JldHVybiBjLnNlbGVjdE1vbnRocz9mLm5vZGUoXCJzZWxlY3RcIixmLmdyb3VwKHttaW46MCxtYXg6MTEsaToxLG5vZGU6XCJvcHRpb25cIixpdGVtOmZ1bmN0aW9uKGEpe3JldHVybltiW2FdLDAsXCJ2YWx1ZT1cIithKyhrLm1vbnRoPT1hP1wiIHNlbGVjdGVkXCI6XCJcIikrKGsueWVhcj09bS55ZWFyJiZhPG0ubW9udGh8fGsueWVhcj09bi55ZWFyJiZhPm4ubW9udGg/XCIgZGlzYWJsZWRcIjpcIlwiKV19fSksYy5rbGFzcy5zZWxlY3RNb250aCxhP1wiXCI6XCJkaXNhYmxlZFwiKTpmLm5vZGUoXCJkaXZcIixiW2subW9udGhdLGMua2xhc3MubW9udGgpfSxyPWZ1bmN0aW9uKCl7dmFyIGI9ay55ZWFyLGQ9Yy5zZWxlY3RZZWFycz09PSEwPzU6fn4oYy5zZWxlY3RZZWFycy8yKTtpZihkKXt2YXIgZT1tLnllYXIsZz1uLnllYXIsaD1iLWQsaT1iK2Q7aWYoZT5oJiYoaSs9ZS1oLGg9ZSksaT5nKXt2YXIgaj1oLWUsbD1pLWc7aC09aj5sP2w6aixpPWd9cmV0dXJuIGYubm9kZShcInNlbGVjdFwiLGYuZ3JvdXAoe21pbjpoLG1heDppLGk6MSxub2RlOlwib3B0aW9uXCIsaXRlbTpmdW5jdGlvbihhKXtyZXR1cm5bYSwwLFwidmFsdWU9XCIrYSsoYj09YT9cIiBzZWxlY3RlZFwiOlwiXCIpXX19KSxjLmtsYXNzLnNlbGVjdFllYXIsYT9cIlwiOlwiZGlzYWJsZWRcIil9cmV0dXJuIGYubm9kZShcImRpdlwiLGIsYy5rbGFzcy55ZWFyKX07cmV0dXJuIGYubm9kZShcImRpdlwiLHAoKStwKDEpK3EoYy5zaG93TW9udGhzU2hvcnQ/Yy5tb250aHNTaG9ydDpjLm1vbnRoc0Z1bGwpK3IoKSxjLmtsYXNzLmhlYWRlcikrZi5ub2RlKFwidGFibGVcIixvK2Yubm9kZShcInRib2R5XCIsZi5ncm91cCh7bWluOjAsbWF4OmUtMSxpOjEsbm9kZTpcInRyXCIsaXRlbTpmdW5jdGlvbihhKXt2YXIgZT1jLmZpcnN0RGF5JiYwPT09Yi5jcmVhdGUoW2sueWVhcixrLm1vbnRoLDFdKS5kYXk/LTc6MDtyZXR1cm5bZi5ncm91cCh7bWluOmQqYS1rLmRheStlKzEsbWF4OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMubWluK2QtMX0saToxLG5vZGU6XCJ0ZFwiLGl0ZW06ZnVuY3Rpb24oYSl7YT1iLmNyZWF0ZShbay55ZWFyLGsubW9udGgsYSsoYy5maXJzdERheT8xOjApXSk7dmFyIGQ9aSYmaS5waWNrPT1hLnBpY2ssZT1qJiZqLnBpY2s9PWEucGljayxnPWwmJmIuZGlzYWJsZWQoYSl8fGEucGljazxtLnBpY2t8fGEucGljaz5uLnBpY2s7cmV0dXJuW2Yubm9kZShcImRpdlwiLGEuZGF0ZSxmdW5jdGlvbihiKXtyZXR1cm4gYi5wdXNoKGsubW9udGg9PWEubW9udGg/Yy5rbGFzcy5pbmZvY3VzOmMua2xhc3Mub3V0Zm9jdXMpLGgucGljaz09YS5waWNrJiZiLnB1c2goYy5rbGFzcy5ub3cpLGQmJmIucHVzaChjLmtsYXNzLnNlbGVjdGVkKSxlJiZiLnB1c2goYy5rbGFzcy5oaWdobGlnaHRlZCksZyYmYi5wdXNoKGMua2xhc3MuZGlzYWJsZWQpLGIuam9pbihcIiBcIil9KFtjLmtsYXNzLmRheV0pLFwiZGF0YS1waWNrPVwiK2EucGljaytcIiBcIitmLmFyaWFBdHRyKHtyb2xlOlwiYnV0dG9uXCIsY29udHJvbHM6Yi4kbm9kZVswXS5pZCxjaGVja2VkOmQmJmIuJG5vZGVbMF0udmFsdWU9PT1mLnRyaWdnZXIoYi5mb3JtYXRzLnRvU3RyaW5nLGIsW2MuZm9ybWF0LGFdKT8hMDpudWxsLGFjdGl2ZWRlc2NlbmRhbnQ6ZT8hMDpudWxsLGRpc2FibGVkOmc/ITA6bnVsbH0pKV19fSldfX0pKSxjLmtsYXNzLnRhYmxlKStmLm5vZGUoXCJkaXZcIixmLm5vZGUoXCJidXR0b25cIixjLnRvZGF5LGMua2xhc3MuYnV0dG9uVG9kYXksXCJ0eXBlPWJ1dHRvbiBkYXRhLXBpY2s9XCIraC5waWNrKyhhP1wiXCI6XCIgZGlzYWJsZWRcIikpK2Yubm9kZShcImJ1dHRvblwiLGMuY2xlYXIsYy5rbGFzcy5idXR0b25DbGVhcixcInR5cGU9YnV0dG9uIGRhdGEtY2xlYXI9MVwiKyhhP1wiXCI6XCIgZGlzYWJsZWRcIikpLGMua2xhc3MuZm9vdGVyKX0sYy5kZWZhdWx0cz1mdW5jdGlvbihhKXtyZXR1cm57bW9udGhzRnVsbDpbXCJKYW51YXJ5XCIsXCJGZWJydWFyeVwiLFwiTWFyY2hcIixcIkFwcmlsXCIsXCJNYXlcIixcIkp1bmVcIixcIkp1bHlcIixcIkF1Z3VzdFwiLFwiU2VwdGVtYmVyXCIsXCJPY3RvYmVyXCIsXCJOb3ZlbWJlclwiLFwiRGVjZW1iZXJcIl0sbW9udGhzU2hvcnQ6W1wiSmFuXCIsXCJGZWJcIixcIk1hclwiLFwiQXByXCIsXCJNYXlcIixcIkp1blwiLFwiSnVsXCIsXCJBdWdcIixcIlNlcFwiLFwiT2N0XCIsXCJOb3ZcIixcIkRlY1wiXSx3ZWVrZGF5c0Z1bGw6W1wiU3VuZGF5XCIsXCJNb25kYXlcIixcIlR1ZXNkYXlcIixcIldlZG5lc2RheVwiLFwiVGh1cnNkYXlcIixcIkZyaWRheVwiLFwiU2F0dXJkYXlcIl0sd2Vla2RheXNTaG9ydDpbXCJTdW5cIixcIk1vblwiLFwiVHVlXCIsXCJXZWRcIixcIlRodVwiLFwiRnJpXCIsXCJTYXRcIl0sdG9kYXk6XCJUb2RheVwiLGNsZWFyOlwiQ2xlYXJcIixmb3JtYXQ6XCJkIG1tbW0sIHl5eXlcIixrbGFzczp7dGFibGU6YStcInRhYmxlXCIsaGVhZGVyOmErXCJoZWFkZXJcIixuYXZQcmV2OmErXCJuYXYtLXByZXZcIixuYXZOZXh0OmErXCJuYXYtLW5leHRcIixuYXZEaXNhYmxlZDphK1wibmF2LS1kaXNhYmxlZFwiLG1vbnRoOmErXCJtb250aFwiLHllYXI6YStcInllYXJcIixzZWxlY3RNb250aDphK1wic2VsZWN0LS1tb250aFwiLHNlbGVjdFllYXI6YStcInNlbGVjdC0teWVhclwiLHdlZWtkYXlzOmErXCJ3ZWVrZGF5XCIsZGF5OmErXCJkYXlcIixkaXNhYmxlZDphK1wiZGF5LS1kaXNhYmxlZFwiLHNlbGVjdGVkOmErXCJkYXktLXNlbGVjdGVkXCIsaGlnaGxpZ2h0ZWQ6YStcImRheS0taGlnaGxpZ2h0ZWRcIixub3c6YStcImRheS0tdG9kYXlcIixpbmZvY3VzOmErXCJkYXktLWluZm9jdXNcIixvdXRmb2N1czphK1wiZGF5LS1vdXRmb2N1c1wiLGZvb3RlcjphK1wiZm9vdGVyXCIsYnV0dG9uQ2xlYXI6YStcImJ1dHRvbi0tY2xlYXJcIixidXR0b25Ub2RheTphK1wiYnV0dG9uLS10b2RheVwifX19KGEua2xhc3NlcygpLnBpY2tlcitcIl9fXCIpLGEuZXh0ZW5kKFwicGlja2FkYXRlXCIsYyl9KTtcbi8qIVxuICogVGltZSBwaWNrZXIgZm9yIHBpY2thZGF0ZS5qcyB2My40LjBcbiAqIGh0dHA6Ly9hbXN1bC5naXRodWIuaW8vcGlja2FkYXRlLmpzL3RpbWUuaHRtXG4gKi9cbiFmdW5jdGlvbihhKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtcInBpY2tlclwiLFwiYW5ndWxhclwiXSxhKTphKFBpY2tlcixhbmd1bGFyKX0oZnVuY3Rpb24oYSxiKXtmdW5jdGlvbiBjKGEsYil7dmFyIGM9dGhpcyxkPWEuJG5vZGVbMF0udmFsdWUsZT1hLiRub2RlLmRhdGEoXCJ2YWx1ZVwiKSxmPWV8fGQsZz1lP2IuZm9ybWF0U3VibWl0OmIuZm9ybWF0O2Muc2V0dGluZ3M9YixjLiRub2RlPWEuJG5vZGUsYy5xdWV1ZT17aW50ZXJ2YWw6XCJpXCIsbWluOlwibWVhc3VyZSBjcmVhdGVcIixtYXg6XCJtZWFzdXJlIGNyZWF0ZVwiLG5vdzpcIm5vdyBjcmVhdGVcIixzZWxlY3Q6XCJwYXJzZSBjcmVhdGUgdmFsaWRhdGVcIixoaWdobGlnaHQ6XCJwYXJzZSBjcmVhdGUgdmFsaWRhdGVcIix2aWV3OlwicGFyc2UgY3JlYXRlIHZhbGlkYXRlXCIsZGlzYWJsZTpcImRlYWN0aXZhdGVcIixlbmFibGU6XCJhY3RpdmF0ZVwifSxjLml0ZW09e30sYy5pdGVtLmludGVydmFsPWIuaW50ZXJ2YWx8fDMwLGMuaXRlbS5kaXNhYmxlPShiLmRpc2FibGV8fFtdKS5zbGljZSgwKSxjLml0ZW0uZW5hYmxlPS1mdW5jdGlvbihhKXtyZXR1cm4gYVswXT09PSEwP2Euc2hpZnQoKTotMX0oYy5pdGVtLmRpc2FibGUpLGMuc2V0KFwibWluXCIsYi5taW4pLnNldChcIm1heFwiLGIubWF4KS5zZXQoXCJub3dcIiksZj9jLnNldChcInNlbGVjdFwiLGYse2Zvcm1hdDpnLGZyb21WYWx1ZTohIWR9KTpjLnNldChcInNlbGVjdFwiLG51bGwpLnNldChcImhpZ2hsaWdodFwiLGMuaXRlbS5ub3cpLGMua2V5PXs0MDoxLDM4Oi0xLDM5OjEsMzc6LTEsZ286ZnVuY3Rpb24oYSl7Yy5zZXQoXCJoaWdobGlnaHRcIixjLml0ZW0uaGlnaGxpZ2h0LnBpY2srYSpjLml0ZW0uaW50ZXJ2YWwse2ludGVydmFsOmEqYy5pdGVtLmludGVydmFsfSksdGhpcy5yZW5kZXIoKX19LGEub24oXCJyZW5kZXJcIixmdW5jdGlvbigpe3ZhciBjPWEuJHJvb3QuY2hpbGRyZW4oKSxkPWMuZmluZChcIi5cIitiLmtsYXNzLnZpZXdzZXQpO2QubGVuZ3RoJiYoY1swXS5zY3JvbGxUb3A9fn5kLnBvc2l0aW9uKCkudG9wLTIqZFswXS5jbGllbnRIZWlnaHQpfSkub24oXCJvcGVuXCIsZnVuY3Rpb24oKXthLiRyb290LmZpbmQoXCJidXR0b25cIikuYXR0cihcImRpc2FibGVcIiwhMSl9KS5vbihcImNsb3NlXCIsZnVuY3Rpb24oKXthLiRyb290LmZpbmQoXCJidXR0b25cIikuYXR0cihcImRpc2FibGVcIiwhMCl9KX12YXIgZD0yNCxlPTYwLGY9MTIsZz1kKmUsaD1hLl87Yy5wcm90b3R5cGUuc2V0PWZ1bmN0aW9uKGEsYixjKXt2YXIgZD10aGlzLGU9ZC5pdGVtO3JldHVybiBudWxsPT09Yj8oZVthXT1iLGQpOihlW1wiZW5hYmxlXCI9PWE/XCJkaXNhYmxlXCI6XCJmbGlwXCI9PWE/XCJlbmFibGVcIjphXT1kLnF1ZXVlW2FdLnNwbGl0KFwiIFwiKS5tYXAoZnVuY3Rpb24oZSl7cmV0dXJuIGI9ZFtlXShhLGIsYyl9KS5wb3AoKSxcInNlbGVjdFwiPT1hP2Quc2V0KFwiaGlnaGxpZ2h0XCIsZS5zZWxlY3QsYyk6XCJoaWdobGlnaHRcIj09YT9kLnNldChcInZpZXdcIixlLmhpZ2hsaWdodCxjKTpcImludGVydmFsXCI9PWE/ZC5zZXQoXCJtaW5cIixlLm1pbixjKS5zZXQoXCJtYXhcIixlLm1heCxjKTphLm1hdGNoKC9eKGZsaXB8bWlufG1heHxkaXNhYmxlfGVuYWJsZSkkLykmJihcIm1pblwiPT1hJiZkLnNldChcIm1heFwiLGUubWF4LGMpLGUuc2VsZWN0JiZkLmRpc2FibGVkKGUuc2VsZWN0KSYmZC5zZXQoXCJzZWxlY3RcIixlLnNlbGVjdCxjKSxlLmhpZ2hsaWdodCYmZC5kaXNhYmxlZChlLmhpZ2hsaWdodCkmJmQuc2V0KFwiaGlnaGxpZ2h0XCIsZS5oaWdobGlnaHQsYykpLGQpfSxjLnByb3RvdHlwZS5nZXQ9ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuaXRlbVthXX0sYy5wcm90b3R5cGUuY3JlYXRlPWZ1bmN0aW9uKGEsYyxmKXt2YXIgaT10aGlzO3JldHVybiBjPXZvaWQgMD09PWM/YTpjLGguaXNEYXRlKGMpJiYoYz1bYy5nZXRIb3VycygpLGMuZ2V0TWludXRlcygpXSksYi5pc09iamVjdChjKSYmaC5pc0ludGVnZXIoYy5waWNrKT9jPWMucGljazpiLmlzQXJyYXkoYyk/Yz0rY1swXSplKyArY1sxXTpoLmlzSW50ZWdlcihjKXx8KGM9aS5ub3coYSxjLGYpKSxcIm1heFwiPT1hJiZjPGkuaXRlbS5taW4ucGljayYmKGMrPWcpLFwibWluXCIhPWEmJlwibWF4XCIhPWEmJihjLWkuaXRlbS5taW4ucGljayklaS5pdGVtLmludGVydmFsIT09MCYmKGMrPWkuaXRlbS5pbnRlcnZhbCksYz1pLm5vcm1hbGl6ZShhLGMsZikse2hvdXI6fn4oZCtjL2UpJWQsbWluczooZStjJWUpJWUsdGltZTooZytjKSVnLHBpY2s6Y319LGMucHJvdG90eXBlLmNyZWF0ZVJhbmdlPWZ1bmN0aW9uKGEsYyl7dmFyIGQ9dGhpcyxlPWZ1bmN0aW9uKGEpe3JldHVybiBhPT09ITB8fGIuaXNBcnJheShhKXx8aC5pc0RhdGUoYSk/ZC5jcmVhdGUoYSk6YX07cmV0dXJuIGguaXNJbnRlZ2VyKGEpfHwoYT1lKGEpKSxoLmlzSW50ZWdlcihjKXx8KGM9ZShjKSksaC5pc0ludGVnZXIoYSkmJmIuaXNPYmplY3QoYyk/YT1bYy5ob3VyLGMubWlucythKmQuc2V0dGluZ3MuaW50ZXJ2YWxdOmguaXNJbnRlZ2VyKGMpJiZiLmlzT2JqZWN0KGEpJiYoYz1bYS5ob3VyLGEubWlucytjKmQuc2V0dGluZ3MuaW50ZXJ2YWxdKSx7ZnJvbTplKGEpLHRvOmUoYyl9fSxjLnByb3RvdHlwZS53aXRoaW5SYW5nZT1mdW5jdGlvbihhLGIpe3JldHVybiBhPXRoaXMuY3JlYXRlUmFuZ2UoYS5mcm9tLGEudG8pLGIucGljaz49YS5mcm9tLnBpY2smJmIucGljazw9YS50by5waWNrfSxjLnByb3RvdHlwZS5vdmVybGFwUmFuZ2VzPWZ1bmN0aW9uKGEsYil7dmFyIGM9dGhpcztyZXR1cm4gYT1jLmNyZWF0ZVJhbmdlKGEuZnJvbSxhLnRvKSxiPWMuY3JlYXRlUmFuZ2UoYi5mcm9tLGIudG8pLGMud2l0aGluUmFuZ2UoYSxiLmZyb20pfHxjLndpdGhpblJhbmdlKGEsYi50byl8fGMud2l0aGluUmFuZ2UoYixhLmZyb20pfHxjLndpdGhpblJhbmdlKGIsYS50byl9LGMucHJvdG90eXBlLm5vdz1mdW5jdGlvbihhLGIpe3ZhciBjLGQ9dGhpcy5pdGVtLmludGVydmFsLGY9bmV3IERhdGUsZz1mLmdldEhvdXJzKCkqZStmLmdldE1pbnV0ZXMoKSxpPWguaXNJbnRlZ2VyKGIpO3JldHVybiBnLT1nJWQsYz0wPmImJi1kPj1kKmIrZyxnKz1cIm1pblwiPT1hJiZjPzA6ZCxpJiYoZys9ZCooYyYmXCJtYXhcIiE9YT9iKzE6YikpLGd9LGMucHJvdG90eXBlLm5vcm1hbGl6ZT1mdW5jdGlvbihhLGIpe3ZhciBjPXRoaXMuaXRlbS5pbnRlcnZhbCxkPXRoaXMuaXRlbS5taW4mJnRoaXMuaXRlbS5taW4ucGlja3x8MDtyZXR1cm4gYi09XCJtaW5cIj09YT8wOihiLWQpJWN9LGMucHJvdG90eXBlLm1lYXN1cmU9ZnVuY3Rpb24oYSxjLGYpe3ZhciBnPXRoaXM7cmV0dXJuIGM/Yz09PSEwfHxoLmlzSW50ZWdlcihjKT9jPWcubm93KGEsYyxmKTpiLmlzT2JqZWN0KGMpJiZoLmlzSW50ZWdlcihjLnBpY2spJiYoYz1nLm5vcm1hbGl6ZShhLGMucGljayxmKSk6Yz1cIm1pblwiPT1hP1swLDBdOltkLTEsZS0xXSxjfSxjLnByb3RvdHlwZS52YWxpZGF0ZT1mdW5jdGlvbihhLGIsYyl7dmFyIGQ9dGhpcyxlPWMmJmMuaW50ZXJ2YWw/Yy5pbnRlcnZhbDpkLml0ZW0uaW50ZXJ2YWw7cmV0dXJuIGQuZGlzYWJsZWQoYikmJihiPWQuc2hpZnQoYixlKSksYj1kLnNjb3BlKGIpLGQuZGlzYWJsZWQoYikmJihiPWQuc2hpZnQoYiwtMSplKSksYn0sYy5wcm90b3R5cGUuZGlzYWJsZWQ9ZnVuY3Rpb24oYSl7dmFyIGM9dGhpcyxkPWMuaXRlbS5kaXNhYmxlLmZpbHRlcihmdW5jdGlvbihkKXtyZXR1cm4gaC5pc0ludGVnZXIoZCk/YS5ob3VyPT1kOmIuaXNBcnJheShkKXx8aC5pc0RhdGUoZCk/YS5waWNrPT1jLmNyZWF0ZShkKS5waWNrOmIuaXNPYmplY3QoZCk/Yy53aXRoaW5SYW5nZShkLGEpOnZvaWQgMH0pO3JldHVybiBkPWQubGVuZ3RoJiYhZC5maWx0ZXIoZnVuY3Rpb24oYSl7cmV0dXJuIGIuaXNBcnJheShhKSYmXCJpbnZlcnRlZFwiPT1hWzJdfHxiLmlzT2JqZWN0KGEpJiZhLmludmVydGVkfSkubGVuZ3RoLC0xPT09Yy5pdGVtLmVuYWJsZT8hZDpkfHxhLnBpY2s8Yy5pdGVtLm1pbi5waWNrfHxhLnBpY2s+Yy5pdGVtLm1heC5waWNrfSxjLnByb3RvdHlwZS5zaGlmdD1mdW5jdGlvbihhLGIpe3ZhciBjPXRoaXMsZD1jLml0ZW0ubWluLnBpY2ssZT1jLml0ZW0ubWF4LnBpY2s7Zm9yKGI9Ynx8Yy5pdGVtLmludGVydmFsO2MuZGlzYWJsZWQoYSkmJihhPWMuY3JlYXRlKGEucGljays9YiksIShhLnBpY2s8PWR8fGEucGljaz49ZSkpOyk7cmV0dXJuIGF9LGMucHJvdG90eXBlLnNjb3BlPWZ1bmN0aW9uKGEpe3ZhciBiPXRoaXMuaXRlbS5taW4ucGljayxjPXRoaXMuaXRlbS5tYXgucGljaztyZXR1cm4gdGhpcy5jcmVhdGUoYS5waWNrPmM/YzphLnBpY2s8Yj9iOmEpfSxjLnByb3RvdHlwZS5wYXJzZT1mdW5jdGlvbihhLGMsZCl7dmFyIGYsZyxpLGosayxsPXRoaXMsbT17fTtpZighY3x8aC5pc0ludGVnZXIoYyl8fGIuaXNBcnJheShjKXx8aC5pc0RhdGUoYyl8fGIuaXNPYmplY3QoYykmJmguaXNJbnRlZ2VyKGMucGljaykpcmV0dXJuIGM7ZCYmZC5mb3JtYXR8fChkPWR8fHt9LGQuZm9ybWF0PWwuc2V0dGluZ3MuZm9ybWF0KSxsLmZvcm1hdHMudG9BcnJheShkLmZvcm1hdCkubWFwKGZ1bmN0aW9uKGEpe3ZhciBiLGQ9bC5mb3JtYXRzW2FdLGU9ZD9oLnRyaWdnZXIoZCxsLFtjLG1dKTphLnJlcGxhY2UoL14hLyxcIlwiKS5sZW5ndGg7ZCYmKGI9Yy5zdWJzdHIoMCxlKSxtW2FdPWIubWF0Y2goL15cXGQrJC8pPytiOmIpLGM9Yy5zdWJzdHIoZSl9KTtmb3IoaiBpbiBtKWs9bVtqXSxoLmlzSW50ZWdlcihrKT9qLm1hdGNoKC9eKGh8aGgpJC9pKT8oZj1rLChcImhcIj09anx8XCJoaFwiPT1qKSYmKGYlPTEyKSk6XCJpXCI9PWomJihnPWspOmoubWF0Y2goL15hJC9pKSYmay5tYXRjaCgvXnAvaSkmJihcImhcImluIG18fFwiaGhcImluIG0pJiYoaT0hMCk7cmV0dXJuKGk/ZisxMjpmKSplK2d9LGMucHJvdG90eXBlLmZvcm1hdHM9e2g6ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT9oLmRpZ2l0cyhhKTpiLmhvdXIlZnx8Zn0saGg6ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT8yOmgubGVhZChiLmhvdXIlZnx8Zil9LEg6ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT9oLmRpZ2l0cyhhKTpcIlwiK2IuaG91ciUyNH0sSEg6ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT9oLmRpZ2l0cyhhKTpoLmxlYWQoYi5ob3VyJTI0KX0saTpmdW5jdGlvbihhLGIpe3JldHVybiBhPzI6aC5sZWFkKGIubWlucyl9LGE6ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT80OmcvMj5iLnRpbWUlZz9cImEubS5cIjpcInAubS5cIn0sQTpmdW5jdGlvbihhLGIpe3JldHVybiBhPzI6Zy8yPmIudGltZSVnP1wiQU1cIjpcIlBNXCJ9LHRvQXJyYXk6ZnVuY3Rpb24oYSl7cmV0dXJuIGEuc3BsaXQoLyhoezEsMn18SHsxLDJ9fGl8YXxBfCEuKS9nKX0sdG9TdHJpbmc6ZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzO3JldHVybiBjLmZvcm1hdHMudG9BcnJheShhKS5tYXAoZnVuY3Rpb24oYSl7cmV0dXJuIGgudHJpZ2dlcihjLmZvcm1hdHNbYV0sYyxbMCxiXSl8fGEucmVwbGFjZSgvXiEvLFwiXCIpfSkuam9pbihcIlwiKX19LGMucHJvdG90eXBlLmlzVGltZUV4YWN0PWZ1bmN0aW9uKGEsYyl7dmFyIGQ9dGhpcztyZXR1cm4gaC5pc0ludGVnZXIoYSkmJmguaXNJbnRlZ2VyKGMpfHxcImJvb2xlYW5cIj09dHlwZW9mIGEmJlwiYm9vbGVhblwiPT10eXBlb2YgYz9hPT09YzooaC5pc0RhdGUoYSl8fGIuaXNBcnJheShhKSkmJihoLmlzRGF0ZShjKXx8Yi5pc0FycmF5KGMpKT9kLmNyZWF0ZShhKS5waWNrPT09ZC5jcmVhdGUoYykucGljazpiLmlzT2JqZWN0KGEpJiZiLmlzT2JqZWN0KGMpP2QuaXNUaW1lRXhhY3QoYS5mcm9tLGMuZnJvbSkmJmQuaXNUaW1lRXhhY3QoYS50byxjLnRvKTohMX0sYy5wcm90b3R5cGUuaXNUaW1lT3ZlcmxhcD1mdW5jdGlvbihhLGMpe3ZhciBkPXRoaXM7cmV0dXJuIGguaXNJbnRlZ2VyKGEpJiYoaC5pc0RhdGUoYyl8fGIuaXNBcnJheShjKSk/YT09PWQuY3JlYXRlKGMpLmhvdXI6aC5pc0ludGVnZXIoYykmJihoLmlzRGF0ZShhKXx8Yi5pc0FycmF5KGEpKT9jPT09ZC5jcmVhdGUoYSkuaG91cjpiLmlzT2JqZWN0KGEpJiZiLmlzT2JqZWN0KGMpP2Qub3ZlcmxhcFJhbmdlcyhhLGMpOiExfSxjLnByb3RvdHlwZS5mbGlwRW5hYmxlPWZ1bmN0aW9uKGEpe3ZhciBiPXRoaXMuaXRlbTtiLmVuYWJsZT1hfHwoLTE9PWIuZW5hYmxlPzE6LTEpfSxjLnByb3RvdHlwZS5kZWFjdGl2YXRlPWZ1bmN0aW9uKGEsYyl7dmFyIGQ9dGhpcyxlPWQuaXRlbS5kaXNhYmxlLnNsaWNlKDApO3JldHVyblwiZmxpcFwiPT1jP2QuZmxpcEVuYWJsZSgpOmM9PT0hMT8oZC5mbGlwRW5hYmxlKDEpLGU9W10pOmM9PT0hMD8oZC5mbGlwRW5hYmxlKC0xKSxlPVtdKTpjLm1hcChmdW5jdGlvbihhKXtmb3IodmFyIGMsZj0wO2Y8ZS5sZW5ndGg7Zis9MSlpZihkLmlzVGltZUV4YWN0KGEsZVtmXSkpe2M9ITA7YnJlYWt9Y3x8KGguaXNJbnRlZ2VyKGEpfHxoLmlzRGF0ZShhKXx8Yi5pc0FycmF5KGEpfHxiLmlzT2JqZWN0KGEpJiZhLmZyb20mJmEudG8pJiZlLnB1c2goYSl9KSxlfSxjLnByb3RvdHlwZS5hY3RpdmF0ZT1mdW5jdGlvbihhLGMpe3ZhciBkPXRoaXMsZT1kLml0ZW0uZGlzYWJsZSxmPWUubGVuZ3RoO3JldHVyblwiZmxpcFwiPT1jP2QuZmxpcEVuYWJsZSgpOmM9PT0hMD8oZC5mbGlwRW5hYmxlKDEpLGU9W10pOmM9PT0hMT8oZC5mbGlwRW5hYmxlKC0xKSxlPVtdKTpjLm1hcChmdW5jdGlvbihhKXt2YXIgYyxnLGksajtmb3IoaT0wO2Y+aTtpKz0xKXtpZihnPWVbaV0sZC5pc1RpbWVFeGFjdChnLGEpKXtjPWVbaV09bnVsbCxqPSEwO2JyZWFrfWlmKGQuaXNUaW1lT3ZlcmxhcChnLGEpKXtiLmlzT2JqZWN0KGEpPyhhLmludmVydGVkPSEwLGM9YSk6Yi5pc0FycmF5KGEpPyhjPWEsY1syXXx8Yy5wdXNoKFwiaW52ZXJ0ZWRcIikpOmguaXNEYXRlKGEpJiYoYz1bYS5nZXRGdWxsWWVhcigpLGEuZ2V0TW9udGgoKSxhLmdldERhdGUoKSxcImludmVydGVkXCJdKTticmVha319aWYoYylmb3IoaT0wO2Y+aTtpKz0xKWlmKGQuaXNUaW1lRXhhY3QoZVtpXSxhKSl7ZVtpXT1udWxsO2JyZWFrfWlmKGopZm9yKGk9MDtmPmk7aSs9MSlpZihkLmlzVGltZU92ZXJsYXAoZVtpXSxhKSl7ZVtpXT1udWxsO2JyZWFrfWMmJmUucHVzaChjKX0pLGUuZmlsdGVyKGZ1bmN0aW9uKGEpe3JldHVybiBudWxsIT1hfSl9LGMucHJvdG90eXBlLmk9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gaC5pc0ludGVnZXIoYikmJmI+MD9iOnRoaXMuaXRlbS5pbnRlcnZhbH0sYy5wcm90b3R5cGUubm9kZXM9ZnVuY3Rpb24oYSl7dmFyIGI9dGhpcyxjPWIuc2V0dGluZ3MsZD1iLml0ZW0uc2VsZWN0LGU9Yi5pdGVtLmhpZ2hsaWdodCxmPWIuaXRlbS52aWV3LGc9Yi5pdGVtLmRpc2FibGU7cmV0dXJuIGgubm9kZShcInVsXCIsaC5ncm91cCh7bWluOmIuaXRlbS5taW4ucGljayxtYXg6Yi5pdGVtLm1heC5waWNrLGk6Yi5pdGVtLmludGVydmFsLG5vZGU6XCJsaVwiLGl0ZW06ZnVuY3Rpb24oYSl7YT1iLmNyZWF0ZShhKTt2YXIgaT1hLnBpY2ssaj1kJiZkLnBpY2s9PWksaz1lJiZlLnBpY2s9PWksbD1nJiZiLmRpc2FibGVkKGEpO3JldHVybltoLnRyaWdnZXIoYi5mb3JtYXRzLnRvU3RyaW5nLGIsW2gudHJpZ2dlcihjLmZvcm1hdExhYmVsLGIsW2FdKXx8Yy5mb3JtYXQsYV0pLGZ1bmN0aW9uKGEpe3JldHVybiBqJiZhLnB1c2goYy5rbGFzcy5zZWxlY3RlZCksayYmYS5wdXNoKGMua2xhc3MuaGlnaGxpZ2h0ZWQpLGYmJmYucGljaz09aSYmYS5wdXNoKGMua2xhc3Mudmlld3NldCksbCYmYS5wdXNoKGMua2xhc3MuZGlzYWJsZWQpLGEuam9pbihcIiBcIil9KFtjLmtsYXNzLmxpc3RJdGVtXSksXCJkYXRhLXBpY2s9XCIrYS5waWNrK1wiIFwiK2guYXJpYUF0dHIoe3JvbGU6XCJidXR0b25cIixjb250cm9sczpiLiRub2RlWzBdLmlkLGNoZWNrZWQ6aiYmYi4kbm9kZS52YWwoKT09PWgudHJpZ2dlcihiLmZvcm1hdHMudG9TdHJpbmcsYixbYy5mb3JtYXQsYV0pPyEwOm51bGwsYWN0aXZlZGVzY2VuZGFudDprPyEwOm51bGwsZGlzYWJsZWQ6bD8hMDpudWxsfSldfX0pK2gubm9kZShcImxpXCIsaC5ub2RlKFwiYnV0dG9uXCIsYy5jbGVhcixjLmtsYXNzLmJ1dHRvbkNsZWFyLFwidHlwZT1idXR0b24gZGF0YS1jbGVhcj0xXCIrKGE/XCJcIjpcIiBkaXNhYmxlXCIpKSksYy5rbGFzcy5saXN0KX0sYy5kZWZhdWx0cz1mdW5jdGlvbihhKXtyZXR1cm57Y2xlYXI6XCJDbGVhclwiLGZvcm1hdDpcImg6aSBBXCIsaW50ZXJ2YWw6MzAsa2xhc3M6e3BpY2tlcjphK1wiIFwiK2ErXCItLXRpbWVcIixob2xkZXI6YStcIl9faG9sZGVyXCIsbGlzdDphK1wiX19saXN0XCIsbGlzdEl0ZW06YStcIl9fbGlzdC1pdGVtXCIsZGlzYWJsZWQ6YStcIl9fbGlzdC1pdGVtLS1kaXNhYmxlZFwiLHNlbGVjdGVkOmErXCJfX2xpc3QtaXRlbS0tc2VsZWN0ZWRcIixoaWdobGlnaHRlZDphK1wiX19saXN0LWl0ZW0tLWhpZ2hsaWdodGVkXCIsdmlld3NldDphK1wiX19saXN0LWl0ZW0tLXZpZXdzZXRcIixub3c6YStcIl9fbGlzdC1pdGVtLS1ub3dcIixidXR0b25DbGVhcjphK1wiX19idXR0b24tLWNsZWFyXCJ9fX0oYS5rbGFzc2VzKCkucGlja2VyKSxhLmV4dGVuZChcInBpY2thdGltZVwiLGMpfSk7XG4vKiFcbiAqIExlZ2FjeSBicm93c2VyIHN1cHBvcnRcbiAqL1xuW10ubWFwfHwoQXJyYXkucHJvdG90eXBlLm1hcD1mdW5jdGlvbihhLGIpe2Zvcih2YXIgYz10aGlzLGQ9Yy5sZW5ndGgsZT1uZXcgQXJyYXkoZCksZj0wO2Q+ZjtmKyspZiBpbiBjJiYoZVtmXT1hLmNhbGwoYixjW2ZdLGYsYykpO3JldHVybiBlfSksW10uZmlsdGVyfHwoQXJyYXkucHJvdG90eXBlLmZpbHRlcj1mdW5jdGlvbihhKXtpZihudWxsPT10aGlzKXRocm93IG5ldyBUeXBlRXJyb3I7dmFyIGI9T2JqZWN0KHRoaXMpLGM9Yi5sZW5ndGg+Pj4wO2lmKFwiZnVuY3Rpb25cIiE9dHlwZW9mIGEpdGhyb3cgbmV3IFR5cGVFcnJvcjtmb3IodmFyIGQ9W10sZT1hcmd1bWVudHNbMV0sZj0wO2M+ZjtmKyspaWYoZiBpbiBiKXt2YXIgZz1iW2ZdO2EuY2FsbChlLGcsZixiKSYmZC5wdXNoKGcpfXJldHVybiBkfSksW10uaW5kZXhPZnx8KEFycmF5LnByb3RvdHlwZS5pbmRleE9mPWZ1bmN0aW9uKGEpe2lmKG51bGw9PXRoaXMpdGhyb3cgbmV3IFR5cGVFcnJvcjt2YXIgYj1PYmplY3QodGhpcyksYz1iLmxlbmd0aD4+PjA7aWYoMD09PWMpcmV0dXJuLTE7dmFyIGQ9MDtpZihhcmd1bWVudHMubGVuZ3RoPjEmJihkPU51bWJlcihhcmd1bWVudHNbMV0pLGQhPWQ/ZD0wOjAhPT1kJiYxLzAhPWQmJmQhPS0xLzAmJihkPShkPjB8fC0xKSpNYXRoLmZsb29yKE1hdGguYWJzKGQpKSkpLGQ+PWMpcmV0dXJuLTE7Zm9yKHZhciBlPWQ+PTA/ZDpNYXRoLm1heChjLU1hdGguYWJzKGQpLDApO2M+ZTtlKyspaWYoZSBpbiBiJiZiW2VdPT09YSlyZXR1cm4gZTtyZXR1cm4tMX0pOy8qIVxuICogQ3Jvc3MtQnJvd3NlciBTcGxpdCAxLjEuMVxuICogQ29weXJpZ2h0IDIwMDctMjAxMiBTdGV2ZW4gTGV2aXRoYW4gPHN0ZXZlbmxldml0aGFuLmNvbT5cbiAqIEF2YWlsYWJsZSB1bmRlciB0aGUgTUlUIExpY2Vuc2VcbiAqIGh0dHA6Ly9ibG9nLnN0ZXZlbmxldml0aGFuLmNvbS9hcmNoaXZlcy9jcm9zcy1icm93c2VyLXNwbGl0XG4gKi9cbnZhciBuYXRpdmVTcGxpdD1TdHJpbmcucHJvdG90eXBlLnNwbGl0LGNvbXBsaWFudEV4ZWNOcGNnPXZvaWQgMD09PS8oKT8/Ly5leGVjKFwiXCIpWzFdO1N0cmluZy5wcm90b3R5cGUuc3BsaXQ9ZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzO2lmKFwiW29iamVjdCBSZWdFeHBdXCIhPT1PYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYSkpcmV0dXJuIG5hdGl2ZVNwbGl0LmNhbGwoYyxhLGIpO3ZhciBkLGUsZixnLGg9W10saT0oYS5pZ25vcmVDYXNlP1wiaVwiOlwiXCIpKyhhLm11bHRpbGluZT9cIm1cIjpcIlwiKSsoYS5leHRlbmRlZD9cInhcIjpcIlwiKSsoYS5zdGlja3k/XCJ5XCI6XCJcIiksaj0wO2ZvcihhPW5ldyBSZWdFeHAoYS5zb3VyY2UsaStcImdcIiksYys9XCJcIixjb21wbGlhbnRFeGVjTnBjZ3x8KGQ9bmV3IFJlZ0V4cChcIl5cIithLnNvdXJjZStcIiQoPyFcXFxccylcIixpKSksYj12b2lkIDA9PT1iPy0xPj4+MDpiPj4+MDsoZT1hLmV4ZWMoYykpJiYoZj1lLmluZGV4K2VbMF0ubGVuZ3RoLCEoZj5qJiYoaC5wdXNoKGMuc2xpY2UoaixlLmluZGV4KSksIWNvbXBsaWFudEV4ZWNOcGNnJiZlLmxlbmd0aD4xJiZlWzBdLnJlcGxhY2UoZCxmdW5jdGlvbigpe2Zvcih2YXIgYT0xO2E8YXJndW1lbnRzLmxlbmd0aC0yO2ErKyl2b2lkIDA9PT1hcmd1bWVudHNbYV0mJihlW2FdPXZvaWQgMCl9KSxlLmxlbmd0aD4xJiZlLmluZGV4PGMubGVuZ3RoJiZBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShoLGUuc2xpY2UoMSkpLGc9ZVswXS5sZW5ndGgsaj1mLGgubGVuZ3RoPj1iKSkpOylhLmxhc3RJbmRleD09PWUuaW5kZXgmJmEubGFzdEluZGV4Kys7cmV0dXJuIGo9PT1jLmxlbmd0aD8oZ3x8IWEudGVzdChcIlwiKSkmJmgucHVzaChcIlwiKTpoLnB1c2goYy5zbGljZShqKSksaC5sZW5ndGg+Yj9oLnNsaWNlKDAsYik6aH07XG5hbmd1bGFyLm1vZHVsZShcImFuZ3VsYXItZGF0ZXBpY2tlclwiLFtdKS5kaXJlY3RpdmUoXCJwaWNrQURhdGVcIixmdW5jdGlvbigpe3JldHVybntyZXN0cmljdDpcIkFcIixzY29wZTp7cGlja0FEYXRlOlwiPVwiLHBpY2tBRGF0ZU9wdGlvbnM6XCI9XCJ9LGxpbms6ZnVuY3Rpb24oYSxiKXtmdW5jdGlvbiBjKGMpe2lmKFwiZnVuY3Rpb25cIj09dHlwZW9mIGYmJmYuYXBwbHkodGhpcyxhcmd1bWVudHMpLCFhLiQkcGhhc2UmJiFhLiRyb290LiQkcGhhc2Upe3ZhciBkPWIucGlja2FkYXRlKFwicGlja2VyXCIpLmdldChcInNlbGVjdFwiKTthLiRhcHBseShmdW5jdGlvbigpe3JldHVybiBjLmhhc093blByb3BlcnR5KFwiY2xlYXJcIik/dm9pZChhLnBpY2tBRGF0ZT1udWxsKTooYS5waWNrQURhdGUmJlwic3RyaW5nXCIhPXR5cGVvZiBhLnBpY2tBRGF0ZXx8KGEucGlja0FEYXRlPW5ldyBEYXRlKDApKSxhLnBpY2tBRGF0ZS5zZXRZZWFyKGQub2JqLmdldFllYXIoKSsxOTAwKSxhLnBpY2tBRGF0ZS5zZXRNb250aChkLm9iai5nZXRNb250aCgpKSx2b2lkIGEucGlja0FEYXRlLnNldERhdGUoZC5vYmouZ2V0RGF0ZSgpKSl9KX19ZnVuY3Rpb24gZCgpe2lmKFwiZnVuY3Rpb25cIj09dHlwZW9mIGcmJmcuYXBwbHkodGhpcyxhcmd1bWVudHMpLFwidW5kZWZpbmVkXCIhPXR5cGVvZiBjb3Jkb3ZhJiZjb3Jkb3ZhLnBsdWdpbnMmJmNvcmRvdmEucGx1Z2lucy5LZXlib2FyZCl7dmFyIGE9ZnVuY3Rpb24oKXtjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuY2xvc2UoKSx3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm5hdGl2ZS5rZXlib2FyZHNob3dcIix0aGlzKX07d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJuYXRpdmUua2V5Ym9hcmRzaG93XCIsYSksc2V0VGltZW91dChmdW5jdGlvbigpe3dpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwibmF0aXZlLmtleWJvYXJkc2hvd1wiLGEpfSw1MDApfX12YXIgZT1hLnBpY2tBRGF0ZU9wdGlvbnN8fHt9LGY9ZS5vblNldCxnPWUub25DbG9zZTtiLnBpY2thZGF0ZShhbmd1bGFyLmV4dGVuZChlLHtvblNldDpjLG9uQ2xvc2U6ZCxjb250YWluZXI6ZG9jdW1lbnQuYm9keX0pKSxzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7YS5waWNrQURhdGUmJmIucGlja2FkYXRlKFwicGlja2VyXCIpLnNldChcInNlbGVjdFwiLGEucGlja0FEYXRlKX0sMWUzKX19fSkuZGlyZWN0aXZlKFwicGlja0FUaW1lXCIsZnVuY3Rpb24oKXtyZXR1cm57cmVzdHJpY3Q6XCJBXCIsc2NvcGU6e3BpY2tBVGltZTpcIj1cIixwaWNrQVRpbWVPcHRpb25zOlwiPVwifSxsaW5rOmZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gYyhjKXtpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBmJiZmLmFwcGx5KHRoaXMsYXJndW1lbnRzKSwhYS4kJHBoYXNlJiYhYS4kcm9vdC4kJHBoYXNlKXt2YXIgZD1iLnBpY2thdGltZShcInBpY2tlclwiKS5nZXQoXCJzZWxlY3RcIik7YS4kYXBwbHkoZnVuY3Rpb24oKXtyZXR1cm4gYy5oYXNPd25Qcm9wZXJ0eShcImNsZWFyXCIpP3ZvaWQoYS5waWNrQVRpbWU9bnVsbCk6KGEucGlja0FUaW1lJiZcInN0cmluZ1wiIT10eXBlb2YgYS5waWNrQVRpbWV8fChhLnBpY2tBVGltZT1uZXcgRGF0ZSksYS5waWNrQVRpbWUuc2V0SG91cnMoZC5ob3VyKSxhLnBpY2tBVGltZS5zZXRNaW51dGVzKGQubWlucyksYS5waWNrQVRpbWUuc2V0U2Vjb25kcygwKSx2b2lkIGEucGlja0FUaW1lLnNldE1pbGxpc2Vjb25kcygwKSl9KX19ZnVuY3Rpb24gZCgpe2lmKFwiZnVuY3Rpb25cIj09dHlwZW9mIGcmJmcuYXBwbHkodGhpcyxhcmd1bWVudHMpLFwidW5kZWZpbmVkXCIhPXR5cGVvZiBjb3Jkb3ZhJiZjb3Jkb3ZhLnBsdWdpbnMmJmNvcmRvdmEucGx1Z2lucy5LZXlib2FyZCl7dmFyIGE9ZnVuY3Rpb24oKXtjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuY2xvc2UoKSx3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm5hdGl2ZS5rZXlib2FyZHNob3dcIix0aGlzKX07d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJuYXRpdmUua2V5Ym9hcmRzaG93XCIsYSksc2V0VGltZW91dChmdW5jdGlvbigpe3dpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwibmF0aXZlLmtleWJvYXJkc2hvd1wiLGEpfSw1MDApfX12YXIgZT1hLnBpY2tBVGltZU9wdGlvbnN8fHt9LGY9ZS5vblNldCxnPWUub25DbG9zZTtiLnBpY2thdGltZShhbmd1bGFyLmV4dGVuZChlLHtvblNldDpjLG9uQ2xvc2U6ZCxjb250YWluZXI6ZG9jdW1lbnQuYm9keX0pKSxzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7YS5waWNrQVRpbWUmJmIucGlja2F0aW1lKFwicGlja2VyXCIpLnNldChcInNlbGVjdFwiLGEucGlja0FUaW1lKX0sMWUzKX19fSk7IiwiLy8gRGVwcyBpcyBzb3J0IG9mIGEgcHJvYmxlbSBmb3IgdXMsIG1heWJlIGluIHRoZSBmdXR1cmUgd2Ugd2lsbCBhc2sgdGhlIHVzZXIgdG8gZGVwZW5kXG4vLyBvbiBtb2R1bGVzIGZvciBhZGQtb25zXG5cbnZhciBkZXBzID0gWydPYmplY3RQYXRoJ107XG50cnkge1xuICAvL1RoaXMgdGhyb3dzIGFuIGV4cGVjdGlvbiBpZiBtb2R1bGUgZG9lcyBub3QgZXhpc3QuXG4gIGFuZ3VsYXIubW9kdWxlKCduZ1Nhbml0aXplJyk7XG4gIGRlcHMucHVzaCgnbmdTYW5pdGl6ZScpO1xufSBjYXRjaCAoZSkge31cblxudHJ5IHtcbiAgLy9UaGlzIHRocm93cyBhbiBleHBlY3Rpb24gaWYgbW9kdWxlIGRvZXMgbm90IGV4aXN0LlxuICBhbmd1bGFyLm1vZHVsZSgndWkuc29ydGFibGUnKTtcbiAgZGVwcy5wdXNoKCd1aS5zb3J0YWJsZScpO1xufSBjYXRjaCAoZSkge31cblxudHJ5IHtcbiAgLy9UaGlzIHRocm93cyBhbiBleHBlY3Rpb24gaWYgbW9kdWxlIGRvZXMgbm90IGV4aXN0LlxuICBhbmd1bGFyLm1vZHVsZSgnYW5ndWxhclNwZWN0cnVtQ29sb3JwaWNrZXInKTtcbiAgZGVwcy5wdXNoKCdhbmd1bGFyU3BlY3RydW1Db2xvcnBpY2tlcicpO1xufSBjYXRjaCAoZSkge31cblxuYW5ndWxhci5tb2R1bGUoJ3NjaGVtYUZvcm0nLCBkZXBzKTtcblxuYW5ndWxhci5tb2R1bGUoJ3NjaGVtYUZvcm0nKS5wcm92aWRlcignc2ZQYXRoJyxcblsnT2JqZWN0UGF0aFByb3ZpZGVyJywgZnVuY3Rpb24oT2JqZWN0UGF0aFByb3ZpZGVyKSB7XG4gIHZhciBPYmplY3RQYXRoID0ge3BhcnNlOiBPYmplY3RQYXRoUHJvdmlkZXIucGFyc2V9O1xuXG4gIC8vIGlmIHdlJ3JlIG9uIEFuZ3VsYXIgMS4yLngsIHdlIG5lZWQgdG8gY29udGludWUgdXNpbmcgZG90IG5vdGF0aW9uXG4gIGlmIChhbmd1bGFyLnZlcnNpb24ubWFqb3IgPT09IDEgJiYgYW5ndWxhci52ZXJzaW9uLm1pbm9yIDwgMykge1xuICAgIE9iamVjdFBhdGguc3RyaW5naWZ5ID0gZnVuY3Rpb24oYXJyKSB7XG4gICAgICByZXR1cm4gQXJyYXkuaXNBcnJheShhcnIpID8gYXJyLmpvaW4oJy4nKSA6IGFyci50b1N0cmluZygpO1xuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgT2JqZWN0UGF0aC5zdHJpbmdpZnkgPSBPYmplY3RQYXRoUHJvdmlkZXIuc3RyaW5naWZ5O1xuICB9XG5cbiAgLy8gV2Ugd2FudCB0aGlzIHRvIHVzZSB3aGljaGV2ZXIgc3RyaW5naWZ5IG1ldGhvZCBpcyBkZWZpbmVkIGFib3ZlLFxuICAvLyBzbyB3ZSBoYXZlIHRvIGNvcHkgdGhlIGNvZGUgaGVyZS5cbiAgT2JqZWN0UGF0aC5ub3JtYWxpemUgPSBmdW5jdGlvbihkYXRhLCBxdW90ZSkge1xuICAgIHJldHVybiBPYmplY3RQYXRoLnN0cmluZ2lmeShBcnJheS5pc0FycmF5KGRhdGEpID8gZGF0YSA6IE9iamVjdFBhdGgucGFyc2UoZGF0YSksIHF1b3RlKTtcbiAgfTtcblxuICB0aGlzLnBhcnNlID0gT2JqZWN0UGF0aC5wYXJzZTtcbiAgdGhpcy5zdHJpbmdpZnkgPSBPYmplY3RQYXRoLnN0cmluZ2lmeTtcbiAgdGhpcy5ub3JtYWxpemUgPSBPYmplY3RQYXRoLm5vcm1hbGl6ZTtcbiAgdGhpcy4kZ2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIE9iamVjdFBhdGg7XG4gIH07XG59XSk7XG5cbi8qKlxuICogQG5nZG9jIHNlcnZpY2VcbiAqIEBuYW1lIHNmU2VsZWN0XG4gKiBAa2luZCBmdW5jdGlvblxuICpcbiAqL1xuYW5ndWxhci5tb2R1bGUoJ3NjaGVtYUZvcm0nKS5mYWN0b3J5KCdzZlNlbGVjdCcsIFsnc2ZQYXRoJywgZnVuY3Rpb24oc2ZQYXRoKSB7XG4gIHZhciBudW1SZSA9IC9eXFxkKyQvO1xuXG4gIC8qKlxuICAgICogQGRlc2NyaXB0aW9uXG4gICAgKiBVdGlsaXR5IG1ldGhvZCB0byBhY2Nlc3MgZGVlcCBwcm9wZXJ0aWVzIHdpdGhvdXRcbiAgICAqIHRocm93aW5nIGVycm9ycyB3aGVuIHRoaW5ncyBhcmUgbm90IGRlZmluZWQuXG4gICAgKiBDYW4gYWxzbyBzZXQgYSB2YWx1ZSBpbiBhIGRlZXAgc3RydWN0dXJlLCBjcmVhdGluZyBvYmplY3RzIHdoZW4gbWlzc2luZ1xuICAgICogZXguXG4gICAgKiB2YXIgZm9vID0gU2VsZWN0KCdhZGRyZXNzLmNvbnRhY3QubmFtZScsb2JqKVxuICAgICogU2VsZWN0KCdhZGRyZXNzLmNvbnRhY3QubmFtZScsb2JqLCdMZWVyb3knKVxuICAgICpcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBwcm9qZWN0aW9uIEEgZG90IHBhdGggdG8gdGhlIHByb3BlcnR5IHlvdSB3YW50IHRvIGdldC9zZXRcbiAgICAqIEBwYXJhbSB7b2JqZWN0fSBvYmogICAob3B0aW9uYWwpIFRoZSBvYmplY3QgdG8gcHJvamVjdCBvbiwgZGVmYXVsdHMgdG8gJ3RoaXMnXG4gICAgKiBAcGFyYW0ge0FueX0gICAgdmFsdWVUb1NldCAob3Bpb25hbCkgIFRoZSB2YWx1ZSB0byBzZXQsIGlmIHBhcnRzIG9mIHRoZSBwYXRoIG9mXG4gICAgKiAgICAgICAgICAgICAgICAgdGhlIHByb2plY3Rpb24gaXMgbWlzc2luZyBlbXB0eSBvYmplY3RzIHdpbGwgYmUgY3JlYXRlZC5cbiAgICAqIEByZXR1cm5zIHtBbnl8dW5kZWZpbmVkfSByZXR1cm5zIHRoZSB2YWx1ZSBhdCB0aGUgZW5kIG9mIHRoZSBwcm9qZWN0aW9uIHBhdGhcbiAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICBvciB1bmRlZmluZWQgaWYgdGhlcmUgaXMgbm9uZS5cbiAgICAqL1xuICByZXR1cm4gZnVuY3Rpb24ocHJvamVjdGlvbiwgb2JqLCB2YWx1ZVRvU2V0KSB7XG4gICAgaWYgKCFvYmopIHtcbiAgICAgIG9iaiA9IHRoaXM7XG4gICAgfVxuICAgIC8vU3VwcG9ydCBbXSBhcnJheSBzeW50YXhcbiAgICB2YXIgcGFydHMgPSB0eXBlb2YgcHJvamVjdGlvbiA9PT0gJ3N0cmluZycgPyBzZlBhdGgucGFyc2UocHJvamVjdGlvbikgOiBwcm9qZWN0aW9uO1xuXG4gICAgaWYgKHR5cGVvZiB2YWx1ZVRvU2V0ICE9PSAndW5kZWZpbmVkJyAmJiBwYXJ0cy5sZW5ndGggPT09IDEpIHtcbiAgICAgIC8vc3BlY2lhbCBjYXNlLCBqdXN0IHNldHRpbmcgb25lIHZhcmlhYmxlXG4gICAgICBvYmpbcGFydHNbMF1dID0gdmFsdWVUb1NldDtcbiAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB2YWx1ZVRvU2V0ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAgICB0eXBlb2Ygb2JqW3BhcnRzWzBdXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAvLyBXZSBuZWVkIHRvIGxvb2sgYWhlYWQgdG8gY2hlY2sgaWYgYXJyYXkgaXMgYXBwcm9wcmlhdGVcbiAgICAgIG9ialtwYXJ0c1swXV0gPSBwYXJ0cy5sZW5ndGggPiAyICYmIG51bVJlLnRlc3QocGFydHNbMV0pID8gW10gOiB7fTtcbiAgICB9XG5cbiAgICB2YXIgdmFsdWUgPSBvYmpbcGFydHNbMF1dO1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgcGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIFNwZWNpYWwgY2FzZTogV2UgYWxsb3cgSlNPTiBGb3JtIHN5bnRheCBmb3IgYXJyYXlzIHVzaW5nIGVtcHR5IGJyYWNrZXRzXG4gICAgICAvLyBUaGVzZSB3aWxsIG9mIGNvdXJzZSBub3Qgd29yayBoZXJlIHNvIHdlIGV4aXQgaWYgdGhleSBhcmUgZm91bmQuXG4gICAgICBpZiAocGFydHNbaV0gPT09ICcnKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHZhbHVlVG9TZXQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGlmIChpID09PSBwYXJ0cy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgLy9sYXN0IHN0ZXAuIExldCdzIHNldCB0aGUgdmFsdWVcbiAgICAgICAgICB2YWx1ZVtwYXJ0c1tpXV0gPSB2YWx1ZVRvU2V0O1xuICAgICAgICAgIHJldHVybiB2YWx1ZVRvU2V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE1ha2Ugc3VyZSB0byBjcmVhdGUgbmV3IG9iamVjdHMgb24gdGhlIHdheSBpZiB0aGV5IGFyZSBub3QgdGhlcmUuXG4gICAgICAgICAgLy8gV2UgbmVlZCB0byBsb29rIGFoZWFkIHRvIGNoZWNrIGlmIGFycmF5IGlzIGFwcHJvcHJpYXRlXG4gICAgICAgICAgdmFyIHRtcCA9IHZhbHVlW3BhcnRzW2ldXTtcbiAgICAgICAgICBpZiAodHlwZW9mIHRtcCA9PT0gJ3VuZGVmaW5lZCcgfHwgdG1wID09PSBudWxsKSB7XG4gICAgICAgICAgICB0bXAgPSBudW1SZS50ZXN0KHBhcnRzW2kgKyAxXSkgPyBbXSA6IHt9O1xuICAgICAgICAgICAgdmFsdWVbcGFydHNbaV1dID0gdG1wO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YWx1ZSA9IHRtcDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh2YWx1ZSkge1xuICAgICAgICAvL0p1c3QgZ2V0IG5leCB2YWx1ZS5cbiAgICAgICAgdmFsdWUgPSB2YWx1ZVtwYXJ0c1tpXV07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcbn1dKTtcblxuYW5ndWxhci5tb2R1bGUoJ3NjaGVtYUZvcm0nKS5wcm92aWRlcignc2NoZW1hRm9ybURlY29yYXRvcnMnLFxuWyckY29tcGlsZVByb3ZpZGVyJywgJ3NmUGF0aFByb3ZpZGVyJywgZnVuY3Rpb24oJGNvbXBpbGVQcm92aWRlciwgc2ZQYXRoUHJvdmlkZXIpIHtcbiAgdmFyIGRlZmF1bHREZWNvcmF0b3IgPSAnJztcbiAgdmFyIGRpcmVjdGl2ZXMgPSB7fTtcblxuICB2YXIgdGVtcGxhdGVVcmwgPSBmdW5jdGlvbihuYW1lLCBmb3JtKSB7XG4gICAgLy9zY2hlbWFEZWNvcmF0b3IgaXMgYWxpYXMgZm9yIHdoYXRldmVyIGlzIHNldCBhcyBkZWZhdWx0XG4gICAgaWYgKG5hbWUgPT09ICdzZkRlY29yYXRvcicpIHtcbiAgICAgIG5hbWUgPSBkZWZhdWx0RGVjb3JhdG9yO1xuICAgIH1cblxuICAgIHZhciBkaXJlY3RpdmUgPSBkaXJlY3RpdmVzW25hbWVdO1xuXG4gICAgLy9ydWxlcyBmaXJzdFxuICAgIHZhciBydWxlcyA9IGRpcmVjdGl2ZS5ydWxlcztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJ1bGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgcmVzID0gcnVsZXNbaV0oZm9ybSk7XG4gICAgICBpZiAocmVzKSB7XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy90aGVuIGNoZWNrIG1hcHBpbmdcbiAgICBpZiAoZGlyZWN0aXZlLm1hcHBpbmdzW2Zvcm0udHlwZV0pIHtcbiAgICAgIHJldHVybiBkaXJlY3RpdmUubWFwcGluZ3NbZm9ybS50eXBlXTtcbiAgICB9XG5cbiAgICAvL3RyeSBkZWZhdWx0XG4gICAgcmV0dXJuIGRpcmVjdGl2ZS5tYXBwaW5nc1snZGVmYXVsdCddO1xuICB9O1xuXG4gIHZhciBjcmVhdGVEaXJlY3RpdmUgPSBmdW5jdGlvbihuYW1lLCBvcHRpb25zKSB7XG4gICAgJGNvbXBpbGVQcm92aWRlci5kaXJlY3RpdmUobmFtZSwgWyckcGFyc2UnLCAnJGNvbXBpbGUnLCAnJGh0dHAnLCAnJHRlbXBsYXRlQ2FjaGUnLFxuICAgICAgZnVuY3Rpb24oJHBhcnNlLCAgJGNvbXBpbGUsICAkaHR0cCwgICR0ZW1wbGF0ZUNhY2hlKSB7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICByZXN0cmljdDogJ0FFJyxcbiAgICAgICAgICByZXBsYWNlOiBmYWxzZSxcbiAgICAgICAgICB0cmFuc2NsdWRlOiBmYWxzZSxcbiAgICAgICAgICBzY29wZTogdHJ1ZSxcbiAgICAgICAgICByZXF1aXJlOiAnP15zZlNjaGVtYScsXG4gICAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBzZlNjaGVtYSkge1xuICAgICAgICAgICAgLy9yZWJpbmQgb3VyIHBhcnQgb2YgdGhlIGZvcm0gdG8gdGhlIHNjb3BlLlxuICAgICAgICAgICAgdmFyIG9uY2UgPSBzY29wZS4kd2F0Y2goYXR0cnMuZm9ybSwgZnVuY3Rpb24oZm9ybSkge1xuXG4gICAgICAgICAgICAgIGlmIChmb3JtKSB7XG4gICAgICAgICAgICAgICAgc2NvcGUuZm9ybSAgPSBmb3JtO1xuXG4gICAgICAgICAgICAgICAgLy9vayBsZXQncyByZXBsYWNlIHRoYXQgdGVtcGxhdGUhXG4gICAgICAgICAgICAgICAgLy9XZSBkbyB0aGlzIG1hbnVhbGx5IHNpbmNlIHdlIG5lZWQgdG8gYmluZCBuZy1tb2RlbCBwcm9wZXJseSBhbmQgYWxzb1xuICAgICAgICAgICAgICAgIC8vZm9yIGZpZWxkc2V0cyB0byByZWN1cnNlIHByb3Blcmx5LlxuICAgICAgICAgICAgICAgIHZhciB1cmwgPSB0ZW1wbGF0ZVVybChuYW1lLCBmb3JtKTtcbiAgICAgICAgICAgICAgICAkaHR0cC5nZXQodXJsLCB7Y2FjaGU6ICR0ZW1wbGF0ZUNhY2hlfSkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBmb3JtLmtleSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2ZQYXRoUHJvdmlkZXIuc3RyaW5naWZ5KGZvcm0ua2V5KS5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7JykgOiAnJztcbiAgICAgICAgICAgICAgICAgIHZhciB0ZW1wbGF0ZSA9IHJlcy5kYXRhLnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgIC9cXCRcXCR2YWx1ZVxcJFxcJC9nLFxuICAgICAgICAgICAgICAgICAgICAnbW9kZWwnICsgKGtleVswXSAhPT0gJ1snID8gJy4nIDogJycpICsga2V5XG4gICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLmNsYXNzTmFtZSkge1xuICAgICAgICAgICAgICAgICAgXHRlbGVtZW50LmFkZENsYXNzKG9wdGlvbnMuY2xhc3NOYW1lKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGVsZW1lbnQuaHRtbCh0ZW1wbGF0ZSk7XG4gICAgICAgICAgICAgICAgICAkY29tcGlsZShlbGVtZW50LmNvbnRlbnRzKCkpKHNjb3BlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBvbmNlKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvL0tlZXAgZXJyb3IgcHJvbmUgbG9naWMgZnJvbSB0aGUgdGVtcGxhdGVcbiAgICAgICAgICAgIHNjb3BlLnNob3dUaXRsZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gc2NvcGUuZm9ybSAmJiBzY29wZS5mb3JtLm5vdGl0bGUgIT09IHRydWUgJiYgc2NvcGUuZm9ybS50aXRsZTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNjb3BlLmxpc3RUb0NoZWNrYm94VmFsdWVzID0gZnVuY3Rpb24obGlzdCkge1xuICAgICAgICAgICAgICB2YXIgdmFsdWVzID0ge307XG4gICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChsaXN0LCBmdW5jdGlvbih2KSB7XG4gICAgICAgICAgICAgICAgdmFsdWVzW3ZdID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIHJldHVybiB2YWx1ZXM7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzY29wZS5jaGVja2JveFZhbHVlc1RvTGlzdCA9IGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICAgICAgICB2YXIgbHN0ID0gW107XG4gICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCh2YWx1ZXMsIGZ1bmN0aW9uKHYsIGspIHtcbiAgICAgICAgICAgICAgICBpZiAodikge1xuICAgICAgICAgICAgICAgICAgbHN0LnB1c2goayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgcmV0dXJuIGxzdDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNjb3BlLmJ1dHRvbkNsaWNrID0gZnVuY3Rpb24oJGV2ZW50LCBmb3JtKSB7XG4gICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24oZm9ybS5vbkNsaWNrKSkge1xuICAgICAgICAgICAgICAgIGZvcm0ub25DbGljaygkZXZlbnQsIGZvcm0pO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGFuZ3VsYXIuaXNTdHJpbmcoZm9ybS5vbkNsaWNrKSkge1xuICAgICAgICAgICAgICAgIGlmIChzZlNjaGVtYSkge1xuICAgICAgICAgICAgICAgICAgLy9ldmFsdWF0aW5nIGluIHNjb3BlIG91dHNpZGUgb2Ygc2ZTY2hlbWFzIGlzb2xhdGVkIHNjb3BlXG4gICAgICAgICAgICAgICAgICBzZlNjaGVtYS5ldmFsSW5QYXJlbnRTY29wZShmb3JtLm9uQ2xpY2ssIHsnJGV2ZW50JzogJGV2ZW50LCBmb3JtOiBmb3JtfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHNjb3BlLiRldmFsKGZvcm0ub25DbGljaywgeyckZXZlbnQnOiAkZXZlbnQsIGZvcm06IGZvcm19KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogRXZhbHVhdGUgYW4gZXhwcmVzc2lvbiwgaS5lLiBzY29wZS4kZXZhbFxuICAgICAgICAgICAgICogYnV0IGRvIGl0IGluIHNmU2NoZW1hcyBwYXJlbnQgc2NvcGUgc2Ytc2NoZW1hIGRpcmVjdGl2ZSBpcyB1c2VkXG4gICAgICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXhwcmVzc2lvblxuICAgICAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGxvY2FscyAob3B0aW9uYWwpXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHtBbnl9IHRoZSByZXN1bHQgb2YgdGhlIGV4cHJlc3Npb25cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgc2NvcGUuZXZhbEV4cHIgPSBmdW5jdGlvbihleHByZXNzaW9uLCBsb2NhbHMpIHtcbiAgICAgICAgICAgICAgaWYgKHNmU2NoZW1hKSB7XG4gICAgICAgICAgICAgICAgLy9ldmFsdWF0aW5nIGluIHNjb3BlIG91dHNpZGUgb2Ygc2ZTY2hlbWFzIGlzb2xhdGVkIHNjb3BlXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNmU2NoZW1hLmV2YWxJblBhcmVudFNjb3BlKGV4cHJlc3Npb24sIGxvY2Fscyk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICByZXR1cm4gc2NvcGUuJGV2YWwoZXhwcmVzc2lvbiwgbG9jYWxzKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogRXZhbHVhdGUgYW4gZXhwcmVzc2lvbiwgaS5lLiBzY29wZS4kZXZhbFxuICAgICAgICAgICAgICogaW4gdGhpcyBkZWNvcmF0b3JzIHNjb3BlXG4gICAgICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXhwcmVzc2lvblxuICAgICAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGxvY2FscyAob3B0aW9uYWwpXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHtBbnl9IHRoZSByZXN1bHQgb2YgdGhlIGV4cHJlc3Npb25cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgc2NvcGUuZXZhbEluU2NvcGUgPSBmdW5jdGlvbihleHByZXNzaW9uLCBsb2NhbHMpIHtcbiAgICAgICAgICAgICAgaWYgKGV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2NvcGUuJGV2YWwoZXhwcmVzc2lvbiwgbG9jYWxzKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBFcnJvciBtZXNzYWdlIGhhbmRsZXJcbiAgICAgICAgICAgICAqIEFuIGVycm9yIGNhbiBlaXRoZXIgYmUgYSBzY2hlbWEgdmFsaWRhdGlvbiBtZXNzYWdlIG9yIGEgYW5ndWxhciBqcyB2YWxpZHRpb25cbiAgICAgICAgICAgICAqIGVycm9yIChpLmUuIHJlcXVpcmVkKVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBzY29wZS5lcnJvck1lc3NhZ2UgPSBmdW5jdGlvbihzY2hlbWFFcnJvcikge1xuICAgICAgICAgICAgICAvL1VzZXIgaGFzIHN1cHBsaWVkIHZhbGlkYXRpb24gbWVzc2FnZXNcbiAgICAgICAgICAgICAgaWYgKHNjb3BlLmZvcm0udmFsaWRhdGlvbk1lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgICBpZiAoc2NoZW1hRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzU3RyaW5nKHNjb3BlLmZvcm0udmFsaWRhdGlvbk1lc3NhZ2UpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzY29wZS5mb3JtLnZhbGlkYXRpb25NZXNzYWdlO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICByZXR1cm4gc2NvcGUuZm9ybS52YWxpZGF0aW9uTWVzc2FnZVtzY2hlbWFFcnJvci5jb2RlXSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmZvcm0udmFsaWRhdGlvbk1lc3NhZ2VbJ2RlZmF1bHQnXTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHNjb3BlLmZvcm0udmFsaWRhdGlvbk1lc3NhZ2UubnVtYmVyIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuZm9ybS52YWxpZGF0aW9uTWVzc2FnZVsnZGVmYXVsdCddIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuZm9ybS52YWxpZGF0aW9uTWVzc2FnZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvL05vIHVzZXIgc3VwcGxpZWQgdmFsaWRhdGlvbiBtZXNzYWdlLlxuICAgICAgICAgICAgICBpZiAoc2NoZW1hRXJyb3IpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2NoZW1hRXJyb3IubWVzc2FnZTsgLy91c2UgdHY0LmpzIHZhbGlkYXRpb24gbWVzc2FnZVxuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLy9PdGhlcndpc2Ugd2Ugb25seSBoYXZlIGlucHV0IG51bWJlciBub3QgYmVpbmcgYSBudW1iZXJcbiAgICAgICAgICAgICAgcmV0dXJuICdOb3QgYSBudW1iZXInO1xuXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICBdKTtcbiAgfTtcblxuICB2YXIgY3JlYXRlTWFudWFsRGlyZWN0aXZlID0gZnVuY3Rpb24odHlwZSwgdGVtcGxhdGVVcmwsIHRyYW5zY2x1ZGUpIHtcbiAgICB0cmFuc2NsdWRlID0gYW5ndWxhci5pc0RlZmluZWQodHJhbnNjbHVkZSkgPyB0cmFuc2NsdWRlIDogZmFsc2U7XG4gICAgJGNvbXBpbGVQcm92aWRlci5kaXJlY3RpdmUoJ3NmJyArIGFuZ3VsYXIudXBwZXJjYXNlKHR5cGVbMF0pICsgdHlwZS5zdWJzdHIoMSksIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFQUMnLFxuICAgICAgICBzY29wZTogdHJ1ZSxcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJhbnNjbHVkZSxcbiAgICAgICAgdGVtcGxhdGU6ICc8c2YtZGVjb3JhdG9yIGZvcm09XCJmb3JtXCI+PC9zZi1kZWNvcmF0b3I+JyxcbiAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgdmFyIHdhdGNoVGhpcyA9IHtcbiAgICAgICAgICAgICdpdGVtcyc6ICdjJyxcbiAgICAgICAgICAgICd0aXRsZU1hcCc6ICdjJyxcbiAgICAgICAgICAgICdzY2hlbWEnOiAnYydcbiAgICAgICAgICB9O1xuICAgICAgICAgIHZhciBmb3JtID0ge3R5cGU6IHR5cGV9O1xuICAgICAgICAgIHZhciBvbmNlID0gdHJ1ZTtcbiAgICAgICAgICBhbmd1bGFyLmZvckVhY2goYXR0cnMsIGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICAgICAgICBpZiAobmFtZVswXSAhPT0gJyQnICYmIG5hbWUuaW5kZXhPZignbmcnKSAhPT0gMCAmJiBuYW1lICE9PSAnc2ZGaWVsZCcpIHtcblxuICAgICAgICAgICAgICB2YXIgdXBkYXRlRm9ybSA9IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZCh2YWwpICYmIHZhbCAhPT0gZm9ybVtuYW1lXSkge1xuICAgICAgICAgICAgICAgICAgZm9ybVtuYW1lXSA9IHZhbDtcblxuICAgICAgICAgICAgICAgICAgLy93aGVuIHdlIGhhdmUgdHlwZSwgYW5kIGlmIHNwZWNpZmllZCBrZXkgd2UgYXBwbHkgaXQgb24gc2NvcGUuXG4gICAgICAgICAgICAgICAgICBpZiAob25jZSAmJiBmb3JtLnR5cGUgJiYgKGZvcm0ua2V5IHx8IGFuZ3VsYXIuaXNVbmRlZmluZWQoYXR0cnMua2V5KSkpIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuZm9ybSA9IGZvcm07XG4gICAgICAgICAgICAgICAgICAgIG9uY2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgaWYgKG5hbWUgPT09ICdtb2RlbCcpIHtcbiAgICAgICAgICAgICAgICAvL1wibW9kZWxcIiBpcyBib3VuZCB0byBzY29wZSB1bmRlciB0aGUgbmFtZSBcIm1vZGVsXCIgc2luY2UgdGhpcyBpcyB3aGF0IHRoZSBkZWNvcmF0b3JzXG4gICAgICAgICAgICAgICAgLy9rbm93IGFuZCBsb3ZlLlxuICAgICAgICAgICAgICAgIHNjb3BlLiR3YXRjaCh2YWx1ZSwgZnVuY3Rpb24odmFsKSB7XG4gICAgICAgICAgICAgICAgICBpZiAodmFsICYmIHNjb3BlLm1vZGVsICE9PSB2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUubW9kZWwgPSB2YWw7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAod2F0Y2hUaGlzW25hbWVdID09PSAnYycpIHtcbiAgICAgICAgICAgICAgICAvL3dhdGNoIGNvbGxlY3Rpb25cbiAgICAgICAgICAgICAgICBzY29wZS4kd2F0Y2hDb2xsZWN0aW9uKHZhbHVlLCB1cGRhdGVGb3JtKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyRvYnNlcnZlXG4gICAgICAgICAgICAgICAgYXR0cnMuJG9ic2VydmUobmFtZSwgdXBkYXRlRm9ybSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KTtcbiAgfTtcblxuICAvKipcbiAgICogQ3JlYXRlIGEgZGVjb3JhdG9yIGRpcmVjdGl2ZSBhbmQgaXRzIHNpYmxpbmcgXCJtYW51YWxcIiB1c2UgZGlyZWN0aXZlcy5cbiAgICogVGhlIGRpcmVjdGl2ZSBjYW4gYmUgdXNlZCB0byBjcmVhdGUgZm9ybSBmaWVsZHMgb3Igb3RoZXIgZm9ybSBlbnRpdGllcy5cbiAgICogSXQgY2FuIGJlIHVzZWQgaW4gY29uanVuY3Rpb24gd2l0aCA8c2NoZW1hLWZvcm0+IGRpcmVjdGl2ZSBpbiB3aGljaCBjYXNlIHRoZSBkZWNvcmF0b3IgaXNcbiAgICogZ2l2ZW4gaXQncyBjb25maWd1cmF0aW9uIHZpYSBhIHRoZSBcImZvcm1cIiBhdHRyaWJ1dGUuXG4gICAqXG4gICAqIGV4LiBCYXNpYyB1c2FnZVxuICAgKiAgIDxzZi1kZWNvcmF0b3IgZm9ybT1cIm15Zm9ybVwiPjwvc2YtZGVjb3JhdG9yPlxuICAgKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgZGlyZWN0aXZlIG5hbWUgKENhbWVsQ2FzZWQpXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBtYXBwaW5ncywgYW4gb2JqZWN0IHRoYXQgbWFwcyBcInR5cGVcIiA9PiBcInRlbXBsYXRlVXJsXCJcbiAgICogQHBhcmFtIHtBcnJheX0gIHJ1bGVzIChvcHRpb25hbCkgYSBsaXN0IG9mIGZ1bmN0aW9ucywgZnVuY3Rpb24oZm9ybSkge30sIHRoYXQgYXJlIGVhY2ggdHJpZWQgaW5cbiAgICogICAgICAgICAgICAgICAgIHR1cm4sXG4gICAqICAgICAgICAgICAgICAgICBpZiB0aGV5IHJldHVybiBhIHN0cmluZyB0aGVuIHRoYXQgaXMgdXNlZCBhcyB0aGUgdGVtcGxhdGVVcmwuIFJ1bGVzIGNvbWUgYmVmb3JlXG4gICAqICAgICAgICAgICAgICAgICBtYXBwaW5ncy5cbiAgICovXG4gIHRoaXMuY3JlYXRlRGVjb3JhdG9yID0gZnVuY3Rpb24obmFtZSwgbWFwcGluZ3MsIHJ1bGVzLCBvcHRpb25zKSB7XG4gICAgZGlyZWN0aXZlc1tuYW1lXSA9IHtcbiAgICAgIG1hcHBpbmdzOiBtYXBwaW5ncyB8fCB7fSxcbiAgICAgIHJ1bGVzOiAgICBydWxlcyAgICB8fCBbXVxuICAgIH07XG5cbiAgICBpZiAoIWRpcmVjdGl2ZXNbZGVmYXVsdERlY29yYXRvcl0pIHtcbiAgICAgIGRlZmF1bHREZWNvcmF0b3IgPSBuYW1lO1xuICAgIH1cbiAgICBjcmVhdGVEaXJlY3RpdmUobmFtZSwgb3B0aW9ucyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBkaXJlY3RpdmUgb2YgYSBkZWNvcmF0b3JcbiAgICogVXNhYmxlIHdoZW4geW91IHdhbnQgdG8gdXNlIHRoZSBkZWNvcmF0b3JzIHdpdGhvdXQgdXNpbmcgPHNjaGVtYS1mb3JtPiBkaXJlY3RpdmUuXG4gICAqIFNwZWNpZmljYWxseSB3aGVuIHlvdSBuZWVkIHRvIHJldXNlIHN0eWxpbmcuXG4gICAqXG4gICAqIGV4LiBjcmVhdGVEaXJlY3RpdmUoJ3RleHQnLCcuLi4nKVxuICAgKiAgPHNmLXRleHQgdGl0bGU9XCJmb29iYXJcIiBtb2RlbD1cInBlcnNvblwiIGtleT1cIm5hbWVcIiBzY2hlbWE9XCJzY2hlbWFcIj48L3NmLXRleHQ+XG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSAgdHlwZSBUaGUgdHlwZSBvZiB0aGUgZGlyZWN0aXZlLCByZXN1bHRpbmcgZGlyZWN0aXZlIHdpbGwgaGF2ZSBzZi0gcHJlZml4ZWRcbiAgICogQHBhcmFtIHtzdHJpbmd9ICB0ZW1wbGF0ZVVybFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHRyYW5zY2x1ZGUgKG9wdGlvbmFsKSBzZXRzIHRyYW5zY2x1ZGUgb3B0aW9uIG9mIGRpcmVjdGl2ZSwgZGVmYXVsdHMgdG8gZmFsc2UuXG4gICAqL1xuICB0aGlzLmNyZWF0ZURpcmVjdGl2ZSA9IGNyZWF0ZU1hbnVhbERpcmVjdGl2ZTtcblxuICAvKipcbiAgICogU2FtZSBhcyBjcmVhdGVEaXJlY3RpdmUsIGJ1dCB0YWtlcyBhbiBvYmplY3Qgd2hlcmUga2V5IGlzICd0eXBlJyBhbmQgdmFsdWUgaXMgJ3RlbXBsYXRlVXJsJ1xuICAgKiBVc2VmdWwgZm9yIGJhdGNoaW5nLlxuICAgKiBAcGFyYW0ge09iamVjdH0gbWFwcGluZ3NcbiAgICovXG4gIHRoaXMuY3JlYXRlRGlyZWN0aXZlcyA9IGZ1bmN0aW9uKG1hcHBpbmdzKSB7XG4gICAgYW5ndWxhci5mb3JFYWNoKG1hcHBpbmdzLCBmdW5jdGlvbih1cmwsIHR5cGUpIHtcbiAgICAgIGNyZWF0ZU1hbnVhbERpcmVjdGl2ZSh0eXBlLCB1cmwpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBHZXR0ZXIgZm9yIGRpcmVjdGl2ZSBtYXBwaW5nc1xuICAgKiBDYW4gYmUgdXNlZCB0byBvdmVycmlkZSBhIG1hcHBpbmcgb3IgYWRkIGEgcnVsZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAob3B0aW9uYWwpIGRlZmF1bHRzIHRvIGRlZmF1bHREZWNvcmF0b3JcbiAgICogQHJldHVybiB7T2JqZWN0fSBydWxlcyBhbmQgbWFwcGluZ3MgeyBydWxlczogW10sbWFwcGluZ3M6IHt9fVxuICAgKi9cbiAgdGhpcy5kaXJlY3RpdmUgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgbmFtZSA9IG5hbWUgfHwgZGVmYXVsdERlY29yYXRvcjtcbiAgICByZXR1cm4gZGlyZWN0aXZlc1tuYW1lXTtcbiAgfTtcblxuICAvKipcbiAgICogQWRkcyBhIG1hcHBpbmcgdG8gYW4gZXhpc3RpbmcgZGVjb3JhdG9yLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSBEZWNvcmF0b3IgbmFtZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gdHlwZSBGb3JtIHR5cGUgZm9yIHRoZSBtYXBwaW5nXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB1cmwgIFRoZSB0ZW1wbGF0ZSB1cmxcbiAgICovXG4gIHRoaXMuYWRkTWFwcGluZyA9IGZ1bmN0aW9uKG5hbWUsIHR5cGUsIHVybCkge1xuICAgIGlmIChkaXJlY3RpdmVzW25hbWVdKSB7XG4gICAgICBkaXJlY3RpdmVzW25hbWVdLm1hcHBpbmdzW3R5cGVdID0gdXJsO1xuICAgIH1cbiAgfTtcblxuICAvL1NlcnZpY2UgaXMganVzdCBhIGdldHRlciBmb3IgZGlyZWN0aXZlIG1hcHBpbmdzIGFuZCBydWxlc1xuICB0aGlzLiRnZXQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZGlyZWN0aXZlOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIHJldHVybiBkaXJlY3RpdmVzW25hbWVdO1xuICAgICAgfSxcbiAgICAgIGRlZmF1bHREZWNvcmF0b3I6IGRlZmF1bHREZWNvcmF0b3JcbiAgICB9O1xuICB9O1xuXG4gIC8vQ3JlYXRlIGEgZGVmYXVsdCBkaXJlY3RpdmVcbiAgY3JlYXRlRGlyZWN0aXZlKCdzZkRlY29yYXRvcicpO1xuXG59XSk7XG5cbi8qKlxuICogU2NoZW1hIGZvcm0gc2VydmljZS5cbiAqIFRoaXMgc2VydmljZSBpcyBub3QgdGhhdCB1c2VmdWwgb3V0c2lkZSBvZiBzY2hlbWEgZm9ybSBkaXJlY3RpdmVcbiAqIGJ1dCBtYWtlcyB0aGUgY29kZSBtb3JlIHRlc3RhYmxlLlxuICovXG5hbmd1bGFyLm1vZHVsZSgnc2NoZW1hRm9ybScpLnByb3ZpZGVyKCdzY2hlbWFGb3JtJyxcblsnc2ZQYXRoUHJvdmlkZXInLCBmdW5jdGlvbihzZlBhdGhQcm92aWRlcikge1xuXG4gIC8vQ3JlYXRlcyBhbiBkZWZhdWx0IHRpdGxlTWFwIGxpc3QgZnJvbSBhbiBlbnVtLCBpLmUuIGEgbGlzdCBvZiBzdHJpbmdzLlxuICB2YXIgZW51bVRvVGl0bGVNYXAgPSBmdW5jdGlvbihlbm0pIHtcbiAgICB2YXIgdGl0bGVNYXAgPSBbXTsgLy9jYW5vbmljYWwgdGl0bGVNYXAgZm9ybWF0IGlzIGEgbGlzdC5cbiAgICBlbm0uZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICB0aXRsZU1hcC5wdXNoKHtuYW1lOiBuYW1lLCB2YWx1ZTogbmFtZX0pO1xuICAgIH0pO1xuICAgIHJldHVybiB0aXRsZU1hcDtcbiAgfTtcblxuICAvLyBUYWtlcyBhIHRpdGxlTWFwIGluIGVpdGhlciBvYmplY3Qgb3IgbGlzdCBmb3JtYXQgYW5kIHJldHVybnMgb25lIGluXG4gIC8vIGluIHRoZSBsaXN0IGZvcm1hdC5cbiAgdmFyIGNhbm9uaWNhbFRpdGxlTWFwID0gZnVuY3Rpb24odGl0bGVNYXAsIG9yaWdpbmFsRW51bSkge1xuICAgIGlmICghYW5ndWxhci5pc0FycmF5KHRpdGxlTWFwKSkge1xuICAgICAgdmFyIGNhbm9uaWNhbCA9IFtdO1xuICAgICAgaWYgKG9yaWdpbmFsRW51bSkge1xuICAgICAgICBhbmd1bGFyLmZvckVhY2gob3JpZ2luYWxFbnVtLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgICBjYW5vbmljYWwucHVzaCh7bmFtZTogdGl0bGVNYXBbdmFsdWVdLCB2YWx1ZTogdmFsdWV9KTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhbmd1bGFyLmZvckVhY2godGl0bGVNYXAsIGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgICAgICAgY2Fub25pY2FsLnB1c2goe25hbWU6IG5hbWUsIHZhbHVlOiB2YWx1ZX0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjYW5vbmljYWw7XG4gICAgfVxuICAgIHJldHVybiB0aXRsZU1hcDtcbiAgfTtcblxuICB2YXIgZGVmYXVsdEZvcm1EZWZpbml0aW9uID0gZnVuY3Rpb24obmFtZSwgc2NoZW1hLCBvcHRpb25zKSB7XG4gICAgdmFyIHJ1bGVzID0gZGVmYXVsdHNbc2NoZW1hLnR5cGVdO1xuICAgIGlmIChydWxlcykge1xuICAgICAgdmFyIGRlZjtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcnVsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZGVmID0gcnVsZXNbaV0obmFtZSwgc2NoZW1hLCBvcHRpb25zKTtcbiAgICAgICAgLy9maXJzdCBoYW5kbGVyIGluIGxpc3QgdGhhdCBhY3R1YWxseSByZXR1cm5zIHNvbWV0aGluZyBpcyBvdXIgaGFuZGxlciFcbiAgICAgICAgaWYgKGRlZikge1xuICAgICAgICAgIHJldHVybiBkZWY7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLy9DcmVhdGVzIGEgZm9ybSBvYmplY3Qgd2l0aCBhbGwgY29tbW9uIHByb3BlcnRpZXNcbiAgdmFyIHN0ZEZvcm1PYmogPSBmdW5jdGlvbihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB2YXIgZiA9IG9wdGlvbnMuZ2xvYmFsICYmIG9wdGlvbnMuZ2xvYmFsLmZvcm1EZWZhdWx0cyA/XG4gICAgICAgICAgICBhbmd1bGFyLmNvcHkob3B0aW9ucy5nbG9iYWwuZm9ybURlZmF1bHRzKSA6IHt9O1xuICAgIGlmIChvcHRpb25zLmdsb2JhbCAmJiBvcHRpb25zLmdsb2JhbC5zdXByZXNzUHJvcGVydHlUaXRsZXMgPT09IHRydWUpIHtcbiAgICAgIGYudGl0bGUgPSBzY2hlbWEudGl0bGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGYudGl0bGUgPSBzY2hlbWEudGl0bGUgfHwgbmFtZTtcbiAgICB9XG5cbiAgICBpZiAoc2NoZW1hLmRlc2NyaXB0aW9uKSB7IGYuZGVzY3JpcHRpb24gPSBzY2hlbWEuZGVzY3JpcHRpb247IH1cbiAgICBpZiAob3B0aW9ucy5yZXF1aXJlZCA9PT0gdHJ1ZSB8fCBzY2hlbWEucmVxdWlyZWQgPT09IHRydWUpIHsgZi5yZXF1aXJlZCA9IHRydWU7IH1cbiAgICBpZiAoc2NoZW1hLm1heExlbmd0aCkgeyBmLm1heGxlbmd0aCA9IHNjaGVtYS5tYXhMZW5ndGg7IH1cbiAgICBpZiAoc2NoZW1hLm1pbkxlbmd0aCkgeyBmLm1pbmxlbmd0aCA9IHNjaGVtYS5tYXhMZW5ndGg7IH1cbiAgICBpZiAoc2NoZW1hLnJlYWRPbmx5IHx8IHNjaGVtYS5yZWFkb25seSkgeyBmLnJlYWRvbmx5ICA9IHRydWU7IH1cbiAgICBpZiAoc2NoZW1hLm1pbmltdW0pIHsgZi5taW5pbXVtID0gc2NoZW1hLm1pbmltdW0gKyAoc2NoZW1hLmV4Y2x1c2l2ZU1pbmltdW0gPyAxIDogMCk7IH1cbiAgICBpZiAoc2NoZW1hLm1heGltdW0pIHsgZi5tYXhpbXVtID0gc2NoZW1hLm1heGltdW0gLSAoc2NoZW1hLmV4Y2x1c2l2ZU1heGltdW0gPyAxIDogMCk7IH1cblxuICAgIC8vTm9uIHN0YW5kYXJkIGF0dHJpYnV0ZXNcbiAgICBpZiAoc2NoZW1hLnZhbGlkYXRpb25NZXNzYWdlKSB7IGYudmFsaWRhdGlvbk1lc3NhZ2UgPSBzY2hlbWEudmFsaWRhdGlvbk1lc3NhZ2U7IH1cbiAgICBpZiAoc2NoZW1hLmVudW1OYW1lcykgeyBmLnRpdGxlTWFwID0gY2Fub25pY2FsVGl0bGVNYXAoc2NoZW1hLmVudW1OYW1lcywgc2NoZW1hWydlbnVtJ10pOyB9XG4gICAgZi5zY2hlbWEgPSBzY2hlbWE7XG5cbiAgICAvLyBOZyBtb2RlbCBvcHRpb25zIGRvZXNuJ3QgcGxheSBuaWNlIHdpdGggdW5kZWZpbmVkLCBtaWdodCBiZSBkZWZpbmVkXG4gICAgLy8gZ2xvYmFsbHkgdGhvdWdoXG4gICAgZi5uZ01vZGVsT3B0aW9ucyA9IGYubmdNb2RlbE9wdGlvbnMgfHwge307XG4gICAgcmV0dXJuIGY7XG4gIH07XG5cbiAgdmFyIHRleHQgPSBmdW5jdGlvbihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpIHtcbiAgICBpZiAoc2NoZW1hLnR5cGUgPT09ICdzdHJpbmcnICYmICFzY2hlbWFbJ2VudW0nXSkge1xuICAgICAgdmFyIGYgPSBzdGRGb3JtT2JqKG5hbWUsIHNjaGVtYSwgb3B0aW9ucyk7XG4gICAgICBmLmtleSAgPSBvcHRpb25zLnBhdGg7XG4gICAgICBmLnR5cGUgPSAndGV4dCc7XG4gICAgICBvcHRpb25zLmxvb2t1cFtzZlBhdGhQcm92aWRlci5zdHJpbmdpZnkob3B0aW9ucy5wYXRoKV0gPSBmO1xuICAgICAgcmV0dXJuIGY7XG4gICAgfVxuICB9O1xuXG4gIC8vZGVmYXVsdCBpbiBqc29uIGZvcm0gZm9yIG51bWJlciBhbmQgaW50ZWdlciBpcyBhIHRleHQgZmllbGRcbiAgLy9pbnB1dCB0eXBlPVwibnVtYmVyXCIgd291bGQgYmUgbW9yZSBzdWl0YWJsZSBkb24ndCB5YSB0aGluaz9cbiAgdmFyIG51bWJlciA9IGZ1bmN0aW9uKG5hbWUsIHNjaGVtYSwgb3B0aW9ucykge1xuICAgIGlmIChzY2hlbWEudHlwZSA9PT0gJ251bWJlcicpIHtcbiAgICAgIHZhciBmID0gc3RkRm9ybU9iaihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpO1xuICAgICAgZi5rZXkgID0gb3B0aW9ucy5wYXRoO1xuICAgICAgZi50eXBlID0gJ251bWJlcic7XG4gICAgICBvcHRpb25zLmxvb2t1cFtzZlBhdGhQcm92aWRlci5zdHJpbmdpZnkob3B0aW9ucy5wYXRoKV0gPSBmO1xuICAgICAgcmV0dXJuIGY7XG4gICAgfVxuICB9O1xuXG4gIHZhciBpbnRlZ2VyID0gZnVuY3Rpb24obmFtZSwgc2NoZW1hLCBvcHRpb25zKSB7XG4gICAgaWYgKHNjaGVtYS50eXBlID09PSAnaW50ZWdlcicpIHtcbiAgICAgIHZhciBmID0gc3RkRm9ybU9iaihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpO1xuICAgICAgZi5rZXkgID0gb3B0aW9ucy5wYXRoO1xuICAgICAgZi50eXBlID0gJ251bWJlcic7XG4gICAgICBvcHRpb25zLmxvb2t1cFtzZlBhdGhQcm92aWRlci5zdHJpbmdpZnkob3B0aW9ucy5wYXRoKV0gPSBmO1xuICAgICAgcmV0dXJuIGY7XG4gICAgfVxuICB9O1xuXG4gIHZhciBjaGVja2JveCA9IGZ1bmN0aW9uKG5hbWUsIHNjaGVtYSwgb3B0aW9ucykge1xuICAgIGlmIChzY2hlbWEudHlwZSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICB2YXIgZiA9IHN0ZEZvcm1PYmoobmFtZSwgc2NoZW1hLCBvcHRpb25zKTtcbiAgICAgIGYua2V5ICA9IG9wdGlvbnMucGF0aDtcbiAgICAgIGYudHlwZSA9ICdjaGVja2JveCc7XG4gICAgICBvcHRpb25zLmxvb2t1cFtzZlBhdGhQcm92aWRlci5zdHJpbmdpZnkob3B0aW9ucy5wYXRoKV0gPSBmO1xuICAgICAgcmV0dXJuIGY7XG4gICAgfVxuICB9O1xuXG4gIHZhciBzZWxlY3QgPSBmdW5jdGlvbihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpIHtcbiAgICBpZiAoc2NoZW1hLnR5cGUgPT09ICdzdHJpbmcnICYmIHNjaGVtYVsnZW51bSddKSB7XG4gICAgICB2YXIgZiA9IHN0ZEZvcm1PYmoobmFtZSwgc2NoZW1hLCBvcHRpb25zKTtcbiAgICAgIGYua2V5ICA9IG9wdGlvbnMucGF0aDtcbiAgICAgIGYudHlwZSA9ICdzZWxlY3QnO1xuICAgICAgaWYgKCFmLnRpdGxlTWFwKSB7XG4gICAgICAgIGYudGl0bGVNYXAgPSBlbnVtVG9UaXRsZU1hcChzY2hlbWFbJ2VudW0nXSk7XG4gICAgICB9XG4gICAgICBvcHRpb25zLmxvb2t1cFtzZlBhdGhQcm92aWRlci5zdHJpbmdpZnkob3B0aW9ucy5wYXRoKV0gPSBmO1xuICAgICAgcmV0dXJuIGY7XG4gICAgfVxuICB9O1xuXG4gIHZhciBjaGVja2JveGVzID0gZnVuY3Rpb24obmFtZSwgc2NoZW1hLCBvcHRpb25zKSB7XG4gICAgaWYgKHNjaGVtYS50eXBlID09PSAnYXJyYXknICYmIHNjaGVtYS5pdGVtcyAmJiBzY2hlbWEuaXRlbXNbJ2VudW0nXSkge1xuICAgICAgdmFyIGYgPSBzdGRGb3JtT2JqKG5hbWUsIHNjaGVtYSwgb3B0aW9ucyk7XG4gICAgICBmLmtleSAgPSBvcHRpb25zLnBhdGg7XG4gICAgICBmLnR5cGUgPSAnY2hlY2tib3hlcyc7XG4gICAgICBpZiAoIWYudGl0bGVNYXApIHtcbiAgICAgICAgZi50aXRsZU1hcCA9IGVudW1Ub1RpdGxlTWFwKHNjaGVtYS5pdGVtc1snZW51bSddKTtcbiAgICAgIH1cbiAgICAgIG9wdGlvbnMubG9va3VwW3NmUGF0aFByb3ZpZGVyLnN0cmluZ2lmeShvcHRpb25zLnBhdGgpXSA9IGY7XG4gICAgICByZXR1cm4gZjtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGZpZWxkc2V0ID0gZnVuY3Rpb24obmFtZSwgc2NoZW1hLCBvcHRpb25zKSB7XG4gICAgaWYgKHNjaGVtYS50eXBlID09PSAnb2JqZWN0Jykge1xuICAgICAgdmFyIGYgICA9IHN0ZEZvcm1PYmoobmFtZSwgc2NoZW1hLCBvcHRpb25zKTtcbiAgICAgIGYudHlwZSAgPSAnZmllbGRzZXQnO1xuICAgICAgZi5pdGVtcyA9IFtdO1xuICAgICAgb3B0aW9ucy5sb29rdXBbc2ZQYXRoUHJvdmlkZXIuc3RyaW5naWZ5KG9wdGlvbnMucGF0aCldID0gZjtcblxuICAgICAgLy9yZWN1cnNlIGRvd24gaW50byBwcm9wZXJ0aWVzXG4gICAgICBhbmd1bGFyLmZvckVhY2goc2NoZW1hLnByb3BlcnRpZXMsIGZ1bmN0aW9uKHYsIGspIHtcbiAgICAgICAgdmFyIHBhdGggPSBvcHRpb25zLnBhdGguc2xpY2UoKTtcbiAgICAgICAgcGF0aC5wdXNoKGspO1xuICAgICAgICBpZiAob3B0aW9ucy5pZ25vcmVbc2ZQYXRoUHJvdmlkZXIuc3RyaW5naWZ5KHBhdGgpXSAhPT0gdHJ1ZSkge1xuICAgICAgICAgIHZhciByZXF1aXJlZCA9IHNjaGVtYS5yZXF1aXJlZCAmJiBzY2hlbWEucmVxdWlyZWQuaW5kZXhPZihrKSAhPT0gLTE7XG5cbiAgICAgICAgICB2YXIgZGVmID0gZGVmYXVsdEZvcm1EZWZpbml0aW9uKGssIHYsIHtcbiAgICAgICAgICAgIHBhdGg6IHBhdGgsXG4gICAgICAgICAgICByZXF1aXJlZDogcmVxdWlyZWQgfHwgZmFsc2UsXG4gICAgICAgICAgICBsb29rdXA6IG9wdGlvbnMubG9va3VwLFxuICAgICAgICAgICAgaWdub3JlOiBvcHRpb25zLmlnbm9yZVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmIChkZWYpIHtcbiAgICAgICAgICAgIGYuaXRlbXMucHVzaChkZWYpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBmO1xuICAgIH1cblxuICB9O1xuXG4gIHZhciBhcnJheSA9IGZ1bmN0aW9uKG5hbWUsIHNjaGVtYSwgb3B0aW9ucykge1xuXG4gICAgaWYgKHNjaGVtYS50eXBlID09PSAnYXJyYXknKSB7XG4gICAgICB2YXIgZiAgID0gc3RkRm9ybU9iaihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpO1xuICAgICAgZi50eXBlICA9ICdhcnJheSc7XG4gICAgICBmLmtleSAgID0gb3B0aW9ucy5wYXRoO1xuICAgICAgb3B0aW9ucy5sb29rdXBbc2ZQYXRoUHJvdmlkZXIuc3RyaW5naWZ5KG9wdGlvbnMucGF0aCldID0gZjtcblxuICAgICAgdmFyIHJlcXVpcmVkID0gc2NoZW1hLnJlcXVpcmVkICYmXG4gICAgICAgICAgICAgICAgICAgICBzY2hlbWEucmVxdWlyZWQuaW5kZXhPZihvcHRpb25zLnBhdGhbb3B0aW9ucy5wYXRoLmxlbmd0aCAtIDFdKSAhPT0gLTE7XG5cbiAgICAgIC8vIFRoZSBkZWZhdWx0IGlzIHRvIGFsd2F5cyBqdXN0IGNyZWF0ZSBvbmUgY2hpbGQuIFRoaXMgd29ya3Mgc2luY2UgaWYgdGhlXG4gICAgICAvLyBzY2hlbWFzIGl0ZW1zIGRlY2xhcmF0aW9uIGlzIG9mIHR5cGU6IFwib2JqZWN0XCIgdGhlbiB3ZSBnZXQgYSBmaWVsZHNldC5cbiAgICAgIC8vIFdlIGFsc28gZm9sbG93IGpzb24gZm9ybSBub3RhdGF0aW9uLCBhZGRpbmcgZW1wdHkgYnJhY2tldHMgXCJbXVwiIHRvXG4gICAgICAvLyBzaWduaWZ5IGFycmF5cy5cblxuICAgICAgdmFyIGFyclBhdGggPSBvcHRpb25zLnBhdGguc2xpY2UoKTtcbiAgICAgIGFyclBhdGgucHVzaCgnJyk7XG5cbiAgICAgIGYuaXRlbXMgPSBbZGVmYXVsdEZvcm1EZWZpbml0aW9uKG5hbWUsIHNjaGVtYS5pdGVtcywge1xuICAgICAgICBwYXRoOiBhcnJQYXRoLFxuICAgICAgICByZXF1aXJlZDogcmVxdWlyZWQgfHwgZmFsc2UsXG4gICAgICAgIGxvb2t1cDogb3B0aW9ucy5sb29rdXAsXG4gICAgICAgIGlnbm9yZTogb3B0aW9ucy5pZ25vcmUsXG4gICAgICAgIGdsb2JhbDogb3B0aW9ucy5nbG9iYWxcbiAgICAgIH0pXTtcblxuICAgICAgcmV0dXJuIGY7XG4gICAgfVxuXG4gIH07XG5cbiAgLy9GaXJzdCBzb3J0ZWQgYnkgc2NoZW1hIHR5cGUgdGhlbiBhIGxpc3QuXG4gIC8vT3JkZXIgaGFzIGltcG9ydGFuY2UuIEZpcnN0IGhhbmRsZXIgcmV0dXJuaW5nIGFuIGZvcm0gc25pcHBldCB3aWxsIGJlIHVzZWQuXG4gIHZhciBkZWZhdWx0cyA9IHtcbiAgICBzdHJpbmc6ICBbc2VsZWN0LCB0ZXh0XSxcbiAgICBvYmplY3Q6ICBbZmllbGRzZXRdLFxuICAgIG51bWJlcjogIFtudW1iZXJdLFxuICAgIGludGVnZXI6IFtpbnRlZ2VyXSxcbiAgICBib29sZWFuOiBbY2hlY2tib3hdLFxuICAgIGFycmF5OiAgIFtjaGVja2JveGVzLCBhcnJheV1cbiAgfTtcblxuICB2YXIgcG9zdFByb2Nlc3NGbiA9IGZ1bmN0aW9uKGZvcm0pIHsgcmV0dXJuIGZvcm07IH07XG5cbiAgLyoqXG4gICAqIFByb3ZpZGVyIEFQSVxuICAgKi9cbiAgdGhpcy5kZWZhdWx0cyAgICAgICAgICAgICAgPSBkZWZhdWx0cztcbiAgdGhpcy5zdGRGb3JtT2JqICAgICAgICAgICAgPSBzdGRGb3JtT2JqO1xuICB0aGlzLmRlZmF1bHRGb3JtRGVmaW5pdGlvbiA9IGRlZmF1bHRGb3JtRGVmaW5pdGlvbjtcblxuICAvKipcbiAgICogUmVnaXN0ZXIgYSBwb3N0IHByb2Nlc3MgZnVuY3Rpb24uXG4gICAqIFRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIHdpdGggdGhlIGZ1bGx5IG1lcmdlZFxuICAgKiBmb3JtIGRlZmluaXRpb24gKGkuZS4gYWZ0ZXIgbWVyZ2luZyB3aXRoIHNjaGVtYSlcbiAgICogYW5kIHdoYXRldmVyIGl0IHJldHVybnMgaXMgdXNlZCBhcyBmb3JtLlxuICAgKi9cbiAgdGhpcy5wb3N0UHJvY2VzcyA9IGZ1bmN0aW9uKGZuKSB7XG4gICAgcG9zdFByb2Nlc3NGbiA9IGZuO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBcHBlbmQgZGVmYXVsdCBmb3JtIHJ1bGVcbiAgICogQHBhcmFtIHtzdHJpbmd9ICAgdHlwZSBqc29uIHNjaGVtYSB0eXBlXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IHJ1bGUgYSBmdW5jdGlvbihwcm9wZXJ0eU5hbWUscHJvcGVydHlTY2hlbWEsb3B0aW9ucykgdGhhdCByZXR1cm5zIGEgZm9ybVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmluaXRpb24gb3IgdW5kZWZpbmVkXG4gICAqL1xuICB0aGlzLmFwcGVuZFJ1bGUgPSBmdW5jdGlvbih0eXBlLCBydWxlKSB7XG4gICAgaWYgKCFkZWZhdWx0c1t0eXBlXSkge1xuICAgICAgZGVmYXVsdHNbdHlwZV0gPSBbXTtcbiAgICB9XG4gICAgZGVmYXVsdHNbdHlwZV0ucHVzaChydWxlKTtcbiAgfTtcblxuICAvKipcbiAgICogUHJlcGVuZCBkZWZhdWx0IGZvcm0gcnVsZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gICB0eXBlIGpzb24gc2NoZW1hIHR5cGVcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gcnVsZSBhIGZ1bmN0aW9uKHByb3BlcnR5TmFtZSxwcm9wZXJ0eVNjaGVtYSxvcHRpb25zKSB0aGF0IHJldHVybnMgYSBmb3JtXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgZGVmaW5pdGlvbiBvciB1bmRlZmluZWRcbiAgICovXG4gIHRoaXMucHJlcGVuZFJ1bGUgPSBmdW5jdGlvbih0eXBlLCBydWxlKSB7XG4gICAgaWYgKCFkZWZhdWx0c1t0eXBlXSkge1xuICAgICAgZGVmYXVsdHNbdHlwZV0gPSBbXTtcbiAgICB9XG4gICAgZGVmYXVsdHNbdHlwZV0udW5zaGlmdChydWxlKTtcbiAgfTtcblxuICAvKipcbiAgICogVXRpbGl0eSBmdW5jdGlvbiB0byBjcmVhdGUgYSBzdGFuZGFyZCBmb3JtIG9iamVjdC5cbiAgICogVGhpcyBkb2VzICpub3QqIHNldCB0aGUgdHlwZSBvZiB0aGUgZm9ybSBidXQgcmF0aGVyIGFsbCBzaGFyZWQgYXR0cmlidXRlcy5cbiAgICogWW91IHByb2JhYmx5IHdhbnQgdG8gc3RhcnQgeW91ciBydWxlIHdpdGggY3JlYXRpbmcgdGhlIGZvcm0gd2l0aCB0aGlzIG1ldGhvZFxuICAgKiB0aGVuIHNldHRpbmcgdHlwZSBhbmQgYW55IG90aGVyIHZhbHVlcyB5b3UgbmVlZC5cbiAgICogQHBhcmFtIHtPYmplY3R9IHNjaGVtYVxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgKiBAcmV0dXJuIHtPYmplY3R9IGEgZm9ybSBmaWVsZCBkZWZpbnRpb25cbiAgICovXG4gIHRoaXMuY3JlYXRlU3RhbmRhcmRGb3JtID0gc3RkRm9ybU9iajtcbiAgLyogRW5kIFByb3ZpZGVyIEFQSSAqL1xuXG4gIHRoaXMuJGdldCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlcnZpY2UgPSB7fTtcblxuICAgIHNlcnZpY2UubWVyZ2UgPSBmdW5jdGlvbihzY2hlbWEsIGZvcm0sIGlnbm9yZSwgb3B0aW9ucywgcmVhZG9ubHkpIHtcbiAgICAgIGZvcm0gID0gZm9ybSB8fCBbJyonXTtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgICAvLyBHZXQgcmVhZG9ubHkgZnJvbSByb290IG9iamVjdFxuICAgICAgcmVhZG9ubHkgPSByZWFkb25seSB8fCBzY2hlbWEucmVhZG9ubHkgfHwgc2NoZW1hLnJlYWRPbmx5O1xuXG4gICAgICB2YXIgc3RkRm9ybSA9IHNlcnZpY2UuZGVmYXVsdHMoc2NoZW1hLCBpZ25vcmUsIG9wdGlvbnMpO1xuXG4gICAgICAvL3NpbXBsZSBjYXNlLCB3ZSBoYXZlIGEgXCIqXCIsIGp1c3QgcHV0IHRoZSBzdGRGb3JtIHRoZXJlXG4gICAgICB2YXIgaWR4ID0gZm9ybS5pbmRleE9mKCcqJyk7XG4gICAgICBpZiAoaWR4ICE9PSAtMSkge1xuICAgICAgICBmb3JtICA9IGZvcm0uc2xpY2UoMCwgaWR4KVxuICAgICAgICAgICAgICAgICAgICAuY29uY2F0KHN0ZEZvcm0uZm9ybSlcbiAgICAgICAgICAgICAgICAgICAgLmNvbmNhdChmb3JtLnNsaWNlKGlkeCArIDEpKTtcbiAgICAgIH1cblxuICAgICAgLy9vayBsZXQncyBtZXJnZSFcbiAgICAgIC8vV2UgbG9vayBhdCB0aGUgc3VwcGxpZWQgZm9ybSBhbmQgZXh0ZW5kIGl0IHdpdGggc2NoZW1hIHN0YW5kYXJkc1xuICAgICAgdmFyIGxvb2t1cCA9IHN0ZEZvcm0ubG9va3VwO1xuXG4gICAgICByZXR1cm4gcG9zdFByb2Nlc3NGbihmb3JtLm1hcChmdW5jdGlvbihvYmopIHtcblxuICAgICAgICAvL2hhbmRsZSB0aGUgc2hvcnRjdXQgd2l0aCBqdXN0IGEgbmFtZVxuICAgICAgICBpZiAodHlwZW9mIG9iaiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBvYmogPSB7a2V5OiBvYmp9O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9iai5rZXkpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIG9iai5rZXkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBvYmoua2V5ID0gc2ZQYXRoUHJvdmlkZXIucGFyc2Uob2JqLmtleSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy9JZiBpdCBoYXMgYSB0aXRsZU1hcCBtYWtlIHN1cmUgaXQncyBhIGxpc3RcbiAgICAgICAgaWYgKG9iai50aXRsZU1hcCkge1xuICAgICAgICAgIG9iai50aXRsZU1hcCA9IGNhbm9uaWNhbFRpdGxlTWFwKG9iai50aXRsZU1hcCk7XG4gICAgICAgIH1cblxuICAgICAgICAvL1xuICAgICAgICBpZiAob2JqLml0ZW1Gb3JtKSB7XG4gICAgICAgICAgb2JqLml0ZW1zID0gW107XG4gICAgICAgICAgdmFyIHN0ciA9IHNmUGF0aFByb3ZpZGVyLnN0cmluZ2lmeShvYmoua2V5KTtcbiAgICAgICAgICB2YXIgc3RkRm9ybSA9IGxvb2t1cFtzdHJdO1xuICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChzdGRGb3JtLml0ZW1zLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICB2YXIgbyA9IGFuZ3VsYXIuY29weShvYmouaXRlbUZvcm0pO1xuICAgICAgICAgICAgby5rZXkgPSBpdGVtLmtleTtcbiAgICAgICAgICAgIG9iai5pdGVtcy5wdXNoKG8pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9leHRlbmQgd2l0aCBzdGQgZm9ybSBmcm9tIHNjaGVtYS5cblxuICAgICAgICBpZiAob2JqLmtleSkge1xuICAgICAgICAgIHZhciBzdHJpZCA9IHNmUGF0aFByb3ZpZGVyLnN0cmluZ2lmeShvYmoua2V5KTtcbiAgICAgICAgICBpZiAobG9va3VwW3N0cmlkXSkge1xuICAgICAgICAgICAgb2JqID0gYW5ndWxhci5leHRlbmQobG9va3VwW3N0cmlkXSwgb2JqKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBcmUgd2UgaW5oZXJpdGluZyByZWFkb25seT9cbiAgICAgICAgaWYgKHJlYWRvbmx5ID09PSB0cnVlKSB7IC8vIEluaGVyaXRpbmcgZmFsc2UgaXMgbm90IGNvb2wuXG4gICAgICAgICAgb2JqLnJlYWRvbmx5ID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vaWYgaXQncyBhIHR5cGUgd2l0aCBpdGVtcywgbWVyZ2UgJ2VtIVxuICAgICAgICBpZiAob2JqLml0ZW1zKSB7XG4gICAgICAgICAgb2JqLml0ZW1zID0gc2VydmljZS5tZXJnZShzY2hlbWEsIG9iai5pdGVtcywgaWdub3JlLCBvcHRpb25zLCBvYmoucmVhZG9ubHkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9pZiBpdHMgaGFzIHRhYnMsIG1lcmdlIHRoZW0gYWxzbyFcbiAgICAgICAgaWYgKG9iai50YWJzKSB7XG4gICAgICAgICAgYW5ndWxhci5mb3JFYWNoKG9iai50YWJzLCBmdW5jdGlvbih0YWIpIHtcbiAgICAgICAgICAgIHRhYi5pdGVtcyA9IHNlcnZpY2UubWVyZ2Uoc2NoZW1hLCB0YWIuaXRlbXMsIGlnbm9yZSwgb3B0aW9ucywgb2JqLnJlYWRvbmx5KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNwZWNpYWwgY2FzZTogY2hlY2tib3hcbiAgICAgICAgLy8gU2luY2UgaGF2ZSB0byB0ZXJuYXJ5IHN0YXRlIHdlIG5lZWQgYSBkZWZhdWx0XG4gICAgICAgIGlmIChvYmoudHlwZSA9PT0gJ2NoZWNrYm94JyAmJiBhbmd1bGFyLmlzVW5kZWZpbmVkKG9iai5zY2hlbWFbJ2RlZmF1bHQnXSkpIHtcbiAgICAgICAgICBvYmouc2NoZW1hWydkZWZhdWx0J10gPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgICB9KSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBmb3JtIGRlZmF1bHRzIGZyb20gc2NoZW1hXG4gICAgICovXG4gICAgc2VydmljZS5kZWZhdWx0cyA9IGZ1bmN0aW9uKHNjaGVtYSwgaWdub3JlLCBnbG9iYWxPcHRpb25zKSB7XG4gICAgICB2YXIgZm9ybSAgID0gW107XG4gICAgICB2YXIgbG9va3VwID0ge307IC8vTWFwIHBhdGggPT4gZm9ybSBvYmogZm9yIGZhc3QgbG9va3VwIGluIG1lcmdpbmdcbiAgICAgIGlnbm9yZSA9IGlnbm9yZSB8fCB7fTtcbiAgICAgIGdsb2JhbE9wdGlvbnMgPSBnbG9iYWxPcHRpb25zIHx8IHt9O1xuXG4gICAgICBpZiAoc2NoZW1hLnR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaChzY2hlbWEucHJvcGVydGllcywgZnVuY3Rpb24odiwgaykge1xuICAgICAgICAgIGlmIChpZ25vcmVba10gIT09IHRydWUpIHtcbiAgICAgICAgICAgIHZhciByZXF1aXJlZCA9IHNjaGVtYS5yZXF1aXJlZCAmJiBzY2hlbWEucmVxdWlyZWQuaW5kZXhPZihrKSAhPT0gLTE7XG4gICAgICAgICAgICB2YXIgZGVmID0gZGVmYXVsdEZvcm1EZWZpbml0aW9uKGssIHYsIHtcbiAgICAgICAgICAgICAgcGF0aDogW2tdLCAgICAgICAgIC8vIFBhdGggdG8gdGhpcyBwcm9wZXJ0eSBpbiBicmFja2V0IG5vdGF0aW9uLlxuICAgICAgICAgICAgICBsb29rdXA6IGxvb2t1cCwgICAgLy8gRXh0cmEgbWFwIHRvIHJlZ2lzdGVyIHdpdGguIE9wdGltaXphdGlvbiBmb3IgbWVyZ2VyLlxuICAgICAgICAgICAgICBpZ25vcmU6IGlnbm9yZSwgICAgLy8gVGhlIGlnbm9yZSBsaXN0IG9mIHBhdGhzIChzYW5zIHJvb3QgbGV2ZWwgbmFtZSlcbiAgICAgICAgICAgICAgcmVxdWlyZWQ6IHJlcXVpcmVkLCAvLyBJcyBpdCByZXF1aXJlZD8gKHY0IGpzb24gc2NoZW1hIHN0eWxlKVxuICAgICAgICAgICAgICBnbG9iYWw6IGdsb2JhbE9wdGlvbnMgLy8gR2xvYmFsIG9wdGlvbnMsIGluY2x1ZGluZyBmb3JtIGRlZmF1bHRzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChkZWYpIHtcbiAgICAgICAgICAgICAgZm9ybS5wdXNoKGRlZik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQuIE9ubHkgdHlwZSBcIm9iamVjdFwiIGFsbG93ZWQgYXQgcm9vdCBsZXZlbCBvZiBzY2hlbWEuJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4ge2Zvcm06IGZvcm0sIGxvb2t1cDogbG9va3VwfTtcbiAgICB9O1xuXG4gICAgLy9VdGlsaXR5IGZ1bmN0aW9uc1xuICAgIC8qKlxuICAgICAqIFRyYXZlcnNlIGEgc2NoZW1hLCBhcHBseWluZyBhIGZ1bmN0aW9uKHNjaGVtYSxwYXRoKSBvbiBldmVyeSBzdWIgc2NoZW1hXG4gICAgICogaS5lLiBldmVyeSBwcm9wZXJ0eSBvZiBhbiBvYmplY3QuXG4gICAgICovXG4gICAgc2VydmljZS50cmF2ZXJzZVNjaGVtYSA9IGZ1bmN0aW9uKHNjaGVtYSwgZm4sIHBhdGgsIGlnbm9yZUFycmF5cykge1xuICAgICAgaWdub3JlQXJyYXlzID0gYW5ndWxhci5pc0RlZmluZWQoaWdub3JlQXJyYXlzKSA/IGlnbm9yZUFycmF5cyA6IHRydWU7XG5cbiAgICAgIHBhdGggPSBwYXRoIHx8IFtdO1xuXG4gICAgICB2YXIgdHJhdmVyc2UgPSBmdW5jdGlvbihzY2hlbWEsIGZuLCBwYXRoKSB7XG4gICAgICAgIGZuKHNjaGVtYSwgcGF0aCk7XG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaChzY2hlbWEucHJvcGVydGllcywgZnVuY3Rpb24ocHJvcCwgbmFtZSkge1xuICAgICAgICAgIHZhciBjdXJyZW50UGF0aCA9IHBhdGguc2xpY2UoKTtcbiAgICAgICAgICBjdXJyZW50UGF0aC5wdXNoKG5hbWUpO1xuICAgICAgICAgIHRyYXZlcnNlKHByb3AsIGZuLCBjdXJyZW50UGF0aCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vT25seSBzdXBwb3J0IHR5cGUgXCJhcnJheVwiIHdoaWNoIGhhdmUgYSBzY2hlbWEgYXMgXCJpdGVtc1wiLlxuICAgICAgICBpZiAoIWlnbm9yZUFycmF5cyAmJiBzY2hlbWEuaXRlbXMpIHtcbiAgICAgICAgICB2YXIgYXJyUGF0aCA9IHBhdGguc2xpY2UoKTsgYXJyUGF0aC5wdXNoKCcnKTtcbiAgICAgICAgICB0cmF2ZXJzZShzY2hlbWEuaXRlbXMsIGZuLCBhcnJQYXRoKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgdHJhdmVyc2Uoc2NoZW1hLCBmbiwgcGF0aCB8fCBbXSk7XG4gICAgfTtcblxuICAgIHNlcnZpY2UudHJhdmVyc2VGb3JtID0gZnVuY3Rpb24oZm9ybSwgZm4pIHtcbiAgICAgIGZuKGZvcm0pO1xuICAgICAgYW5ndWxhci5mb3JFYWNoKGZvcm0uaXRlbXMsIGZ1bmN0aW9uKGYpIHtcbiAgICAgICAgc2VydmljZS50cmF2ZXJzZUZvcm0oZiwgZm4pO1xuICAgICAgfSk7XG5cbiAgICAgIGlmIChmb3JtLnRhYnMpIHtcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKGZvcm0udGFicywgZnVuY3Rpb24odGFiKSB7XG4gICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRhYi5pdGVtcywgZnVuY3Rpb24oZikge1xuICAgICAgICAgICAgc2VydmljZS50cmF2ZXJzZUZvcm0oZiwgZm4pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIHNlcnZpY2U7XG4gIH07XG5cbn1dKTtcblxuLyogIENvbW1vbiBjb2RlIGZvciB2YWxpZGF0aW5nIGEgdmFsdWUgYWdhaW5zdCBpdHMgZm9ybSBhbmQgc2NoZW1hIGRlZmluaXRpb24gKi9cbi8qIGdsb2JhbCB0djQgKi9cbmFuZ3VsYXIubW9kdWxlKCdzY2hlbWFGb3JtJykuZmFjdG9yeSgnc2ZWYWxpZGF0b3InLCBbZnVuY3Rpb24oKSB7XG5cbiAgdmFyIHZhbGlkYXRvciA9IHt9O1xuXG4gIC8qKlxuICAgKiBWYWxpZGF0ZSBhIHZhbHVlIGFnYWluc3QgaXRzIGZvcm0gZGVmaW5pdGlvbiBhbmQgc2NoZW1hLlxuICAgKiBUaGUgdmFsdWUgc2hvdWxkIGVpdGhlciBiZSBvZiBwcm9wZXIgdHlwZSBvciBhIHN0cmluZywgc29tZSB0eXBlXG4gICAqIGNvZXJjaW9uIGlzIGFwcGxpZWQuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBmb3JtIEEgbWVyZ2VkIGZvcm0gZGVmaW5pdGlvbiwgaS5lLiBvbmUgd2l0aCBhIHNjaGVtYS5cbiAgICogQHBhcmFtIHtBbnl9IHZhbHVlIHRoZSB2YWx1ZSB0byB2YWxpZGF0ZS5cbiAgICogQHJldHVybiBhIHR2NGpzIHJlc3VsdCBvYmplY3QuXG4gICAqL1xuICB2YWxpZGF0b3IudmFsaWRhdGUgPSBmdW5jdGlvbihmb3JtLCB2YWx1ZSkge1xuICAgIGlmICghZm9ybSkge1xuICAgICAgcmV0dXJuIHt2YWxpZDogdHJ1ZX07XG4gICAgfVxuICAgIHZhciBzY2hlbWEgPSBmb3JtLnNjaGVtYTtcblxuICAgIGlmICghc2NoZW1hKSB7XG4gICAgICByZXR1cm4ge3ZhbGlkOiB0cnVlfTtcbiAgICB9XG5cbiAgICAvLyBJbnB1dCBvZiB0eXBlIHRleHQgYW5kIHRleHRhcmVhcyB3aWxsIGdpdmUgdXMgYSB2aWV3VmFsdWUgb2YgJydcbiAgICAvLyB3aGVuIGVtcHR5LCB0aGlzIGlzIGEgdmFsaWQgdmFsdWUgaW4gYSBzY2hlbWEgYW5kIGRvZXMgbm90IGNvdW50IGFzIHNvbWV0aGluZ1xuICAgIC8vIHRoYXQgYnJlYWtzIHZhbGlkYXRpb24gb2YgJ3JlcXVpcmVkJy4gQnV0IGZvciBvdXIgb3duIHNhbml0eSBhbiBlbXB0eSBmaWVsZCBzaG91bGRcbiAgICAvLyBub3QgdmFsaWRhdGUgaWYgaXQncyByZXF1aXJlZC5cbiAgICBpZiAodmFsdWUgPT09ICcnKSB7XG4gICAgICB2YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICAvLyBOdW1iZXJzIGZpZWxkcyB3aWxsIGdpdmUgYSBudWxsIHZhbHVlLCB3aGljaCBhbHNvIG1lYW5zIGVtcHR5IGZpZWxkXG4gICAgaWYgKGZvcm0udHlwZSA9PT0gJ251bWJlcicgJiYgdmFsdWUgPT09IG51bGwpIHtcbiAgICAgIHZhbHVlID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIC8vIFZlcnNpb24gNCBvZiBKU09OIFNjaGVtYSBoYXMgdGhlIHJlcXVpcmVkIHByb3BlcnR5IG5vdCBvbiB0aGVcbiAgICAvLyBwcm9wZXJ0eSBpdHNlbGYgYnV0IG9uIHRoZSB3cmFwcGluZyBvYmplY3QuIFNpbmNlIHdlIGxpa2UgdG8gdGVzdFxuICAgIC8vIG9ubHkgdGhpcyBwcm9wZXJ0eSB3ZSB3cmFwIGl0IGluIGEgZmFrZSBvYmplY3QuXG4gICAgdmFyIHdyYXAgPSB7dHlwZTogJ29iamVjdCcsICdwcm9wZXJ0aWVzJzoge319O1xuICAgIHZhciBwcm9wTmFtZSA9IGZvcm0ua2V5W2Zvcm0ua2V5Lmxlbmd0aCAtIDFdO1xuICAgIHdyYXAucHJvcGVydGllc1twcm9wTmFtZV0gPSBzY2hlbWE7XG5cbiAgICBpZiAoZm9ybS5yZXF1aXJlZCkge1xuICAgICAgd3JhcC5yZXF1aXJlZCA9IFtwcm9wTmFtZV07XG4gICAgfVxuICAgIHZhciB2YWx1ZVdyYXAgPSB7fTtcbiAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQodmFsdWUpKSB7XG4gICAgICB2YWx1ZVdyYXBbcHJvcE5hbWVdID0gdmFsdWU7XG4gICAgfVxuICAgIHJldHVybiB0djQudmFsaWRhdGVSZXN1bHQodmFsdWVXcmFwLCB3cmFwKTtcblxuICB9O1xuXG4gIHJldHVybiB2YWxpZGF0b3I7XG59XSk7XG5cbi8qKlxuICogRGlyZWN0aXZlIHRoYXQgaGFuZGxlcyB0aGUgbW9kZWwgYXJyYXlzXG4gKi9cbmFuZ3VsYXIubW9kdWxlKCdzY2hlbWFGb3JtJykuZGlyZWN0aXZlKCdzZkFycmF5JywgWydzZlNlbGVjdCcsICdzY2hlbWFGb3JtJywgJ3NmVmFsaWRhdG9yJyxcbiAgZnVuY3Rpb24oc2ZTZWxlY3QsIHNjaGVtYUZvcm0sIHNmVmFsaWRhdG9yKSB7XG5cbiAgICB2YXIgc2V0SW5kZXggPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGZvcm0pIHtcbiAgICAgICAgaWYgKGZvcm0ua2V5KSB7XG4gICAgICAgICAgZm9ybS5rZXlbZm9ybS5rZXkuaW5kZXhPZignJyldID0gaW5kZXg7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgc2NvcGU6IHRydWUsXG4gICAgICByZXF1aXJlOiAnP25nTW9kZWwnLFxuICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBuZ01vZGVsKSB7XG4gICAgICAgIHZhciBmb3JtRGVmQ2FjaGUgPSB7fTtcblxuICAgICAgICAvLyBXYXRjaCBmb3IgdGhlIGZvcm0gZGVmaW5pdGlvbiBhbmQgdGhlbiByZXdyaXRlIGl0LlxuICAgICAgICAvLyBJdCdzIHRoZSAoZmlyc3QpIGFycmF5IHBhcnQgb2YgdGhlIGtleSwgJ1tdJyB0aGF0IG5lZWRzIGEgbnVtYmVyXG4gICAgICAgIC8vIGNvcnJlc3BvbmRpbmcgdG8gYW4gaW5kZXggb2YgdGhlIGZvcm0uXG4gICAgICAgIHZhciBvbmNlID0gc2NvcGUuJHdhdGNoKGF0dHJzLnNmQXJyYXksIGZ1bmN0aW9uKGZvcm0pIHtcblxuICAgICAgICAgIC8vIEFuIGFycmF5IG1vZGVsIGFsd2F5cyBuZWVkcyBhIGtleSBzbyB3ZSBrbm93IHdoYXQgcGFydCBvZiB0aGUgbW9kZWxcbiAgICAgICAgICAvLyB0byBsb29rIGF0LiBUaGlzIG1ha2VzIHVzIGEgYml0IGluY29tcGF0aWJsZSB3aXRoIEpTT04gRm9ybSwgb24gdGhlXG4gICAgICAgICAgLy8gb3RoZXIgaGFuZCBpdCBlbmFibGVzIHR3byB3YXkgYmluZGluZy5cbiAgICAgICAgICB2YXIgbGlzdCA9IHNmU2VsZWN0KGZvcm0ua2V5LCBzY29wZS5tb2RlbCk7XG5cbiAgICAgICAgICAvLyBTaW5jZSBuZy1tb2RlbCBoYXBwaWx5IGNyZWF0ZXMgb2JqZWN0cyBpbiBhIGRlZXAgcGF0aCB3aGVuIHNldHRpbmcgYVxuICAgICAgICAgIC8vIGEgdmFsdWUgYnV0IG5vdCBhcnJheXMgd2UgbmVlZCB0byBjcmVhdGUgdGhlIGFycmF5LlxuICAgICAgICAgIGlmIChhbmd1bGFyLmlzVW5kZWZpbmVkKGxpc3QpKSB7XG4gICAgICAgICAgICBsaXN0ID0gW107XG4gICAgICAgICAgICBzZlNlbGVjdChmb3JtLmtleSwgc2NvcGUubW9kZWwsIGxpc3QpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzY29wZS5tb2RlbEFycmF5ID0gbGlzdDtcblxuICAgICAgICAgIC8vIEFycmF5cyB3aXRoIHRpdGxlTWFwcywgaS5lLiBjaGVja2JveGVzIGRvZXNuJ3QgaGF2ZSBpdGVtcy5cbiAgICAgICAgICBpZiAoZm9ybS5pdGVtcykge1xuXG4gICAgICAgICAgICAvLyBUbyBiZSBtb3JlIGNvbXBhdGlibGUgd2l0aCBKU09OIEZvcm0gd2Ugc3VwcG9ydCBhbiBhcnJheSBvZiBpdGVtc1xuICAgICAgICAgICAgLy8gaW4gdGhlIGZvcm0gZGVmaW5pdGlvbiBvZiBcImFycmF5XCIgKHRoZSBzY2hlbWEganVzdCBhIHZhbHVlKS5cbiAgICAgICAgICAgIC8vIGZvciB0aGUgc3ViZm9ybXMgY29kZSB0byB3b3JrIHRoaXMgbWVhbnMgd2Ugd3JhcCBldmVyeXRoaW5nIGluIGFcbiAgICAgICAgICAgIC8vIHNlY3Rpb24uIFVubGVzcyB0aGVyZSBpcyBqdXN0IG9uZS5cbiAgICAgICAgICAgIHZhciBzdWJGb3JtID0gZm9ybS5pdGVtc1swXTtcbiAgICAgICAgICAgIGlmIChmb3JtLml0ZW1zLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgc3ViRm9ybSA9IHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnc2VjdGlvbicsXG4gICAgICAgICAgICAgICAgaXRlbXM6IGZvcm0uaXRlbXMubWFwKGZ1bmN0aW9uKGl0ZW0pe1xuICAgICAgICAgICAgICAgICAgaXRlbS5uZ01vZGVsT3B0aW9ucyA9IGZvcm0ubmdNb2RlbE9wdGlvbnM7XG4gICAgICAgICAgICAgICAgICBpdGVtLnJlYWRvbmx5ID0gZm9ybS5yZWFkb25seTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBXZSBjZWF0ZSBjb3BpZXMgb2YgdGhlIGZvcm0gb24gZGVtYW5kLCBjYWNoaW5nIHRoZW0gZm9yXG4gICAgICAgICAgLy8gbGF0ZXIgcmVxdWVzdHNcbiAgICAgICAgICBzY29wZS5jb3B5V2l0aEluZGV4ID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgICAgIGlmICghZm9ybURlZkNhY2hlW2luZGV4XSkge1xuICAgICAgICAgICAgICBpZiAoc3ViRm9ybSkge1xuICAgICAgICAgICAgICAgIHZhciBjb3B5ID0gYW5ndWxhci5jb3B5KHN1YkZvcm0pO1xuICAgICAgICAgICAgICAgIGNvcHkuYXJyYXlJbmRleCA9IGluZGV4O1xuICAgICAgICAgICAgICAgIHNjaGVtYUZvcm0udHJhdmVyc2VGb3JtKGNvcHksIHNldEluZGV4KGluZGV4KSk7XG4gICAgICAgICAgICAgICAgZm9ybURlZkNhY2hlW2luZGV4XSA9IGNvcHk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmb3JtRGVmQ2FjaGVbaW5kZXhdO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICBzY29wZS5hcHBlbmRUb0FycmF5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgbGVuID0gbGlzdC5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgY29weSA9IHNjb3BlLmNvcHlXaXRoSW5kZXgobGVuKTtcbiAgICAgICAgICAgIHNjaGVtYUZvcm0udHJhdmVyc2VGb3JtKGNvcHksIGZ1bmN0aW9uKHBhcnQpIHtcbiAgICAgICAgICAgICAgaWYgKHBhcnQua2V5ICYmIGFuZ3VsYXIuaXNEZWZpbmVkKHBhcnRbJ2RlZmF1bHQnXSkpIHtcbiAgICAgICAgICAgICAgICBzZlNlbGVjdChwYXJ0LmtleSwgc2NvcGUubW9kZWwsIHBhcnRbJ2RlZmF1bHQnXSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBJZiB0aGVyZSBhcmUgbm8gZGVmYXVsdHMgbm90aGluZyBpcyBhZGRlZCBzbyB3ZSBuZWVkIHRvIGluaXRpYWxpemVcbiAgICAgICAgICAgIC8vIHRoZSBhcnJheS4gdW5kZWZpbmVkIGZvciBiYXNpYyB2YWx1ZXMsIHt9IG9yIFtdIGZvciB0aGUgb3RoZXJzLlxuICAgICAgICAgICAgaWYgKGxlbiA9PT0gbGlzdC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgdmFyIHR5cGUgPSBzZlNlbGVjdCgnc2NoZW1hLml0ZW1zLnR5cGUnLCBmb3JtKTtcbiAgICAgICAgICAgICAgdmFyIGRmbHQ7XG4gICAgICAgICAgICAgIGlmICh0eXBlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIGRmbHQgPSB7fTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnYXJyYXknKSB7XG4gICAgICAgICAgICAgICAgZGZsdCA9IFtdO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGxpc3QucHVzaChkZmx0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVHJpZ2dlciB2YWxpZGF0aW9uLlxuICAgICAgICAgICAgaWYgKHNjb3BlLnZhbGlkYXRlQXJyYXkpIHtcbiAgICAgICAgICAgICAgc2NvcGUudmFsaWRhdGVBcnJheSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGxpc3Q7XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIHNjb3BlLmRlbGV0ZUZyb21BcnJheSA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgICAgICBsaXN0LnNwbGljZShpbmRleCwgMSk7XG5cbiAgICAgICAgICAgIC8vIFRyaWdnZXIgdmFsaWRhdGlvbi5cbiAgICAgICAgICAgIGlmIChzY29wZS52YWxpZGF0ZUFycmF5KSB7XG4gICAgICAgICAgICAgIHNjb3BlLnZhbGlkYXRlQXJyYXkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBsaXN0O1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICAvLyBBbHdheXMgc3RhcnQgd2l0aCBvbmUgZW1wdHkgZm9ybSB1bmxlc3MgY29uZmlndXJlZCBvdGhlcndpc2UuXG4gICAgICAgICAgLy8gU3BlY2lhbCBjYXNlOiBkb24ndCBkbyBpdCBpZiBmb3JtIGhhcyBhIHRpdGxlTWFwXG4gICAgICAgICAgaWYgKCFmb3JtLnRpdGxlTWFwICYmIGZvcm0uc3RhcnRFbXB0eSAhPT0gdHJ1ZSAmJiBsaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgc2NvcGUuYXBwZW5kVG9BcnJheSgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFRpdGxlIE1hcCBoYW5kbGluZ1xuICAgICAgICAgIC8vIElmIGZvcm0gaGFzIGEgdGl0bGVNYXAgY29uZmlndXJlZCB3ZSdkIGxpa2UgdG8gZW5hYmxlIGxvb3Bpbmcgb3ZlclxuICAgICAgICAgIC8vIHRpdGxlTWFwIGluc3RlYWQgb2YgbW9kZWxBcnJheSwgdGhpcyBpcyB1c2VkIGZvciBpbnRhbmNlIGluXG4gICAgICAgICAgLy8gY2hlY2tib3hlcy4gU28gaW5zdGVhZCBvZiB2YXJpYWJsZSBudW1iZXIgb2YgdGhpbmdzIHdlIGxpa2UgdG8gY3JlYXRlXG4gICAgICAgICAgLy8gYSBhcnJheSB2YWx1ZSBmcm9tIGEgc3Vic2V0IG9mIHZhbHVlcyBpbiB0aGUgdGl0bGVNYXAuXG4gICAgICAgICAgLy8gVGhlIHByb2JsZW0gaGVyZSBpcyB0aGF0IG5nLW1vZGVsIG9uIGEgY2hlY2tib3ggZG9lc24ndCByZWFsbHkgbWFwIHRvXG4gICAgICAgICAgLy8gYSBsaXN0IG9mIHZhbHVlcy4gVGhpcyBpcyBoZXJlIHRvIGZpeCB0aGF0LlxuICAgICAgICAgIGlmIChmb3JtLnRpdGxlTWFwICYmIGZvcm0udGl0bGVNYXAubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgc2NvcGUudGl0bGVNYXBWYWx1ZXMgPSBbXTtcblxuICAgICAgICAgICAgLy8gV2Ugd2F0Y2ggdGhlIG1vZGVsIGZvciBjaGFuZ2VzIGFuZCB0aGUgdGl0bGVNYXBWYWx1ZXMgdG8gcmVmbGVjdFxuICAgICAgICAgICAgLy8gdGhlIG1vZGVsQXJyYXlcbiAgICAgICAgICAgIHZhciB1cGRhdGVUaXRsZU1hcFZhbHVlcyA9IGZ1bmN0aW9uKGFycikge1xuICAgICAgICAgICAgICBzY29wZS50aXRsZU1hcFZhbHVlcyA9IFtdO1xuICAgICAgICAgICAgICBhcnIgPSBhcnIgfHwgW107XG5cbiAgICAgICAgICAgICAgZm9ybS50aXRsZU1hcC5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICBzY29wZS50aXRsZU1hcFZhbHVlcy5wdXNoKGFyci5pbmRleE9mKGl0ZW0udmFsdWUpICE9PSAtMSk7XG4gICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLy9DYXRjaCBkZWZhdWx0IHZhbHVlc1xuICAgICAgICAgICAgdXBkYXRlVGl0bGVNYXBWYWx1ZXMoc2NvcGUubW9kZWxBcnJheSk7XG4gICAgICAgICAgICBzY29wZS4kd2F0Y2hDb2xsZWN0aW9uKCdtb2RlbEFycmF5JywgdXBkYXRlVGl0bGVNYXBWYWx1ZXMpO1xuXG4gICAgICAgICAgICAvL1RvIGdldCB0d28gd2F5IGJpbmRpbmcgd2UgYWxzbyB3YXRjaCBvdXIgdGl0bGVNYXBWYWx1ZXNcbiAgICAgICAgICAgIHNjb3BlLiR3YXRjaENvbGxlY3Rpb24oJ3RpdGxlTWFwVmFsdWVzJywgZnVuY3Rpb24odmFscykge1xuICAgICAgICAgICAgICBpZiAodmFscykge1xuICAgICAgICAgICAgICAgIHZhciBhcnIgPSBzY29wZS5tb2RlbEFycmF5O1xuXG4gICAgICAgICAgICAgICAgLy8gQXBwYXJlbnRseSB0aGUgZmFzdGVzdCB3YXkgdG8gY2xlYXIgYW4gYXJyYXksIHJlYWRhYmxlIHRvby5cbiAgICAgICAgICAgICAgICAvLyBodHRwOi8vanNwZXJmLmNvbS9hcnJheS1kZXN0cm95LzMyXG4gICAgICAgICAgICAgICAgd2hpbGUgKGFyci5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICBhcnIuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBmb3JtLnRpdGxlTWFwLmZvckVhY2goZnVuY3Rpb24oaXRlbSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgIGlmICh2YWxzW2luZGV4XSkge1xuICAgICAgICAgICAgICAgICAgICBhcnIucHVzaChpdGVtLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBJZiB0aGVyZSBpcyBhIG5nTW9kZWwgcHJlc2VudCB3ZSBuZWVkIHRvIHZhbGlkYXRlIHdoZW4gYXNrZWQuXG4gICAgICAgICAgaWYgKG5nTW9kZWwpIHtcbiAgICAgICAgICAgIHZhciBlcnJvcjtcblxuICAgICAgICAgICAgc2NvcGUudmFsaWRhdGVBcnJheSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAvLyBUaGUgYWN0dWFsIGNvbnRlbnQgb2YgdGhlIGFycmF5IGlzIHZhbGlkYXRlZCBieSBlYWNoIGZpZWxkXG4gICAgICAgICAgICAgIC8vIHNvIHdlIHNldHRsZSBmb3IgY2hlY2tpbmcgdmFsaWRhdGlvbnMgc3BlY2lmaWMgdG8gYXJyYXlzXG5cbiAgICAgICAgICAgICAgLy8gU2luY2Ugd2UgcHJlZmlsbCB3aXRoIGVtcHR5IGFycmF5cyB3ZSBjYW4gZ2V0IHRoZSBmdW5ueSBzaXR1YXRpb25cbiAgICAgICAgICAgICAgLy8gd2hlcmUgdGhlIGFycmF5IGlzIHJlcXVpcmVkIGJ1dCBlbXB0eSBpbiB0aGUgZ3VpIGJ1dCBzdGlsbCB2YWxpZGF0ZXMuXG4gICAgICAgICAgICAgIC8vIFRoYXRzIHdoeSB3ZSBjaGVjayB0aGUgbGVuZ3RoLlxuICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gc2ZWYWxpZGF0b3IudmFsaWRhdGUoXG4gICAgICAgICAgICAgICAgZm9ybSxcbiAgICAgICAgICAgICAgICBzY29wZS5tb2RlbEFycmF5Lmxlbmd0aCA+IDAgPyBzY29wZS5tb2RlbEFycmF5IDogdW5kZWZpbmVkXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIGlmIChyZXN1bHQudmFsaWQgPT09IGZhbHNlICYmXG4gICAgICAgICAgICAgICAgICByZXN1bHQuZXJyb3IgJiZcbiAgICAgICAgICAgICAgICAgIChyZXN1bHQuZXJyb3IuZGF0YVBhdGggPT09ICcnIHx8XG4gICAgICAgICAgICAgICAgICByZXN1bHQuZXJyb3IuZGF0YVBhdGggPT09ICcvJyArIGZvcm0ua2V5W2Zvcm0ua2V5Lmxlbmd0aCAtIDFdKSkge1xuXG4gICAgICAgICAgICAgICAgLy8gU2V0IHZpZXdWYWx1ZSB0byB0cmlnZ2VyICRkaXJ0eSBvbiBmaWVsZC4gSWYgc29tZW9uZSBrbm93cyBhXG4gICAgICAgICAgICAgICAgLy8gYSBiZXR0ZXIgd2F5IHRvIGRvIGl0IHBsZWFzZSB0ZWxsLlxuICAgICAgICAgICAgICAgIG5nTW9kZWwuJHNldFZpZXdWYWx1ZShzY29wZS5tb2RlbEFycmF5KTtcbiAgICAgICAgICAgICAgICBlcnJvciA9IHJlc3VsdC5lcnJvcjtcbiAgICAgICAgICAgICAgICBuZ01vZGVsLiRzZXRWYWxpZGl0eSgnc2NoZW1hJywgZmFsc2UpO1xuXG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbmdNb2RlbC4kc2V0VmFsaWRpdHkoJ3NjaGVtYScsIHRydWUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzY29wZS4kb24oJ3NjaGVtYUZvcm1WYWxpZGF0ZScsIHNjb3BlLnZhbGlkYXRlQXJyYXkpO1xuXG4gICAgICAgICAgICBzY29wZS5oYXNTdWNjZXNzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBuZ01vZGVsLiR2YWxpZCAmJiAhbmdNb2RlbC4kcHJpc3RpbmU7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzY29wZS5oYXNFcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gbmdNb2RlbC4kaW52YWxpZDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNjb3BlLnNjaGVtYUVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBlcnJvcjtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBvbmNlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gIH1cbl0pO1xuXG4vKipcbiAqIEEgdmVyc2lvbiBvZiBuZy1jaGFuZ2VkIHRoYXQgb25seSBsaXN0ZW5zIGlmXG4gKiB0aGVyZSBpcyBhY3R1YWxseSBhIG9uQ2hhbmdlIGRlZmluZWQgb24gdGhlIGZvcm1cbiAqXG4gKiBUYWtlcyB0aGUgZm9ybSBkZWZpbml0aW9uIGFzIGFyZ3VtZW50LlxuICogSWYgdGhlIGZvcm0gZGVmaW5pdGlvbiBoYXMgYSBcIm9uQ2hhbmdlXCIgZGVmaW5lZCBhcyBlaXRoZXIgYSBmdW5jdGlvbiBvclxuICovXG5hbmd1bGFyLm1vZHVsZSgnc2NoZW1hRm9ybScpLmRpcmVjdGl2ZSgnc2ZDaGFuZ2VkJywgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7XG4gICAgcmVxdWlyZTogJ25nTW9kZWwnLFxuICAgIHJlc3RyaWN0OiAnQUMnLFxuICAgIHNjb3BlOiBmYWxzZSxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmwpIHtcbiAgICAgIHZhciBmb3JtID0gc2NvcGUuJGV2YWwoYXR0cnMuc2ZDaGFuZ2VkKTtcbiAgICAgIC8vXCJmb3JtXCIgaXMgcmVhbGx5IGd1YXJhbnRlZWQgdG8gYmUgaGVyZSBzaW5jZSB0aGUgZGVjb3JhdG9yIGRpcmVjdGl2ZVxuICAgICAgLy93YWl0cyBmb3IgaXQuIEJ1dCBiZXN0IGJlIHN1cmUuXG4gICAgICBpZiAoZm9ybSAmJiBmb3JtLm9uQ2hhbmdlKSB7XG4gICAgICAgIGN0cmwuJHZpZXdDaGFuZ2VMaXN0ZW5lcnMucHVzaChmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKGZvcm0ub25DaGFuZ2UpKSB7XG4gICAgICAgICAgICBmb3JtLm9uQ2hhbmdlKGN0cmwuJG1vZGVsVmFsdWUsIGZvcm0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzY29wZS5ldmFsRXhwcihmb3JtLm9uQ2hhbmdlLCB7J21vZGVsVmFsdWUnOiBjdHJsLiRtb2RlbFZhbHVlLCBmb3JtOiBmb3JtfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59KTtcblxuLypcbkZJWE1FOiByZWFsIGRvY3VtZW50YXRpb25cbjxmb3JtIHNmLWZvcm09XCJmb3JtXCIgIHNmLXNjaGVtYT1cInNjaGVtYVwiIHNmLWRlY29yYXRvcj1cImZvb2JhclwiPjwvZm9ybT5cbiovXG5cbmFuZ3VsYXIubW9kdWxlKCdzY2hlbWFGb3JtJylcbiAgICAgICAuZGlyZWN0aXZlKCdzZlNjaGVtYScsXG5bJyRjb21waWxlJywgJ3NjaGVtYUZvcm0nLCAnc2NoZW1hRm9ybURlY29yYXRvcnMnLCAnc2ZTZWxlY3QnLFxuICBmdW5jdGlvbigkY29tcGlsZSwgIHNjaGVtYUZvcm0sICBzY2hlbWFGb3JtRGVjb3JhdG9ycywgc2ZTZWxlY3QpIHtcblxuICAgIHZhciBTTkFLRV9DQVNFX1JFR0VYUCA9IC9bQS1aXS9nO1xuICAgIHZhciBzbmFrZUNhc2UgPSBmdW5jdGlvbihuYW1lLCBzZXBhcmF0b3IpIHtcbiAgICAgIHNlcGFyYXRvciA9IHNlcGFyYXRvciB8fCAnXyc7XG4gICAgICByZXR1cm4gbmFtZS5yZXBsYWNlKFNOQUtFX0NBU0VfUkVHRVhQLCBmdW5jdGlvbihsZXR0ZXIsIHBvcykge1xuICAgICAgICByZXR1cm4gKHBvcyA/IHNlcGFyYXRvciA6ICcnKSArIGxldHRlci50b0xvd2VyQ2FzZSgpO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICBzY29wZToge1xuICAgICAgICBzY2hlbWE6ICc9c2ZTY2hlbWEnLFxuICAgICAgICBpbml0aWFsRm9ybTogJz1zZkZvcm0nLFxuICAgICAgICBtb2RlbDogJz1zZk1vZGVsJyxcbiAgICAgICAgb3B0aW9uczogJz1zZk9wdGlvbnMnXG4gICAgICB9LFxuICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCBmdW5jdGlvbigkc2NvcGUpIHtcbiAgICAgICAgdGhpcy5ldmFsSW5QYXJlbnRTY29wZSA9IGZ1bmN0aW9uKGV4cHIsIGxvY2Fscykge1xuICAgICAgICAgIHJldHVybiAkc2NvcGUuJHBhcmVudC4kZXZhbChleHByLCBsb2NhbHMpO1xuICAgICAgICB9O1xuICAgICAgfV0sXG4gICAgICByZXBsYWNlOiBmYWxzZSxcbiAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgcmVxdWlyZTogJz9mb3JtJyxcbiAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgZm9ybUN0cmwsIHRyYW5zY2x1ZGUpIHtcblxuICAgICAgICAvL2V4cG9zZSBmb3JtIGNvbnRyb2xsZXIgb24gc2NvcGUgc28gdGhhdCB3ZSBkb24ndCBmb3JjZSBhdXRob3JzIHRvIHVzZSBuYW1lIG9uIGZvcm1cbiAgICAgICAgc2NvcGUuZm9ybUN0cmwgPSBmb3JtQ3RybDtcblxuICAgICAgICAvL1dlJ2QgbGlrZSB0byBoYW5kbGUgZXhpc3RpbmcgbWFya3VwLFxuICAgICAgICAvL2Jlc2lkZXMgdXNpbmcgaXQgaW4gb3VyIHRlbXBsYXRlIHdlIGFsc29cbiAgICAgICAgLy9jaGVjayBmb3IgbmctbW9kZWwgYW5kIGFkZCB0aGF0IHRvIGFuIGlnbm9yZSBsaXN0XG4gICAgICAgIC8vaS5lLiBldmVuIGlmIGZvcm0gaGFzIGEgZGVmaW5pdGlvbiBmb3IgaXQgb3IgZm9ybSBpcyBbXCIqXCJdXG4gICAgICAgIC8vd2UgZG9uJ3QgZ2VuZXJhdGUgaXQuXG4gICAgICAgIHZhciBpZ25vcmUgPSB7fTtcbiAgICAgICAgdHJhbnNjbHVkZShzY29wZSwgZnVuY3Rpb24oY2xvbmUpIHtcbiAgICAgICAgICBjbG9uZS5hZGRDbGFzcygnc2NoZW1hLWZvcm0taWdub3JlJyk7XG4gICAgICAgICAgZWxlbWVudC5wcmVwZW5kKGNsb25lKTtcblxuICAgICAgICAgIGlmIChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3JBbGwpIHtcbiAgICAgICAgICAgIHZhciBtb2RlbHMgPSBlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tuZy1tb2RlbF0nKTtcbiAgICAgICAgICAgIGlmIChtb2RlbHMpIHtcbiAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb2RlbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIga2V5ID0gbW9kZWxzW2ldLmdldEF0dHJpYnV0ZSgnbmctbW9kZWwnKTtcbiAgICAgICAgICAgICAgICAvL3NraXAgZmlyc3QgcGFydCBiZWZvcmUgLlxuICAgICAgICAgICAgICAgIGlnbm9yZVtrZXkuc3Vic3RyaW5nKGtleS5pbmRleE9mKCcuJykgKyAxKV0gPSB0cnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy9TaW5jZSB3ZSBhcmUgZGVwZW5kYW50IG9uIHVwIHRvIHRocmVlXG4gICAgICAgIC8vYXR0cmlidXRlcyB3ZSdsbCBkbyBhIGNvbW1vbiB3YXRjaFxuICAgICAgICB2YXIgbGFzdERpZ2VzdCA9IHt9O1xuXG4gICAgICAgIHNjb3BlLiR3YXRjaChmdW5jdGlvbigpIHtcblxuICAgICAgICAgIHZhciBzY2hlbWEgPSBzY29wZS5zY2hlbWE7XG4gICAgICAgICAgdmFyIGZvcm0gICA9IHNjb3BlLmluaXRpYWxGb3JtIHx8IFsnKiddO1xuXG4gICAgICAgICAgLy9UaGUgY2hlY2sgZm9yIHNjaGVtYS50eXBlIGlzIHRvIGVuc3VyZSB0aGF0IHNjaGVtYSBpcyBub3Qge31cbiAgICAgICAgICBpZiAoZm9ybSAmJiBzY2hlbWEgJiYgc2NoZW1hLnR5cGUgJiZcbiAgICAgICAgICAgICAgKGxhc3REaWdlc3QuZm9ybSAhPT0gZm9ybSB8fCBsYXN0RGlnZXN0LnNjaGVtYSAhPT0gc2NoZW1hKSAmJlxuICAgICAgICAgICAgICBPYmplY3Qua2V5cyhzY2hlbWEucHJvcGVydGllcykubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgbGFzdERpZ2VzdC5zY2hlbWEgPSBzY2hlbWE7XG4gICAgICAgICAgICBsYXN0RGlnZXN0LmZvcm0gPSBmb3JtO1xuXG4gICAgICAgICAgICB2YXIgbWVyZ2VkID0gc2NoZW1hRm9ybS5tZXJnZShzY2hlbWEsIGZvcm0sIGlnbm9yZSwgc2NvcGUub3B0aW9ucyk7XG4gICAgICAgICAgICB2YXIgZnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcblxuICAgICAgICAgICAgLy9tYWtlIHRoZSBmb3JtIGF2YWlsYWJsZSB0byBkZWNvcmF0b3JzXG4gICAgICAgICAgICBzY29wZS5zY2hlbWFGb3JtICA9IHtmb3JtOiAgbWVyZ2VkLCBzY2hlbWE6IHNjaGVtYX07XG5cbiAgICAgICAgICAgIC8vY2xlYW4gYWxsIGJ1dCBwcmUgZXhpc3RpbmcgaHRtbC5cbiAgICAgICAgICAgIGVsZW1lbnQuY2hpbGRyZW4oJzpub3QoLnNjaGVtYS1mb3JtLWlnbm9yZSknKS5yZW1vdmUoKTtcblxuICAgICAgICAgICAgLy9DcmVhdGUgZGlyZWN0aXZlcyBmcm9tIHRoZSBmb3JtIGRlZmluaXRpb25cbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChtZXJnZWQsZnVuY3Rpb24ob2JqLGkpe1xuICAgICAgICAgICAgICB2YXIgbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoYXR0cnMuc2ZEZWNvcmF0b3IgfHwgc25ha2VDYXNlKHNjaGVtYUZvcm1EZWNvcmF0b3JzLmRlZmF1bHREZWNvcmF0b3IsJy0nKSk7XG4gICAgICAgICAgICAgIG4uc2V0QXR0cmlidXRlKCdmb3JtJywnc2NoZW1hRm9ybS5mb3JtWycraSsnXScpO1xuICAgICAgICAgICAgICB2YXIgc2xvdDtcbiAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBzbG90ID0gZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcqW3NmLWluc2VydC1maWVsZD1cIicgKyBvYmoua2V5ICsgJ1wiXScpO1xuICAgICAgICAgICAgICB9IGNhdGNoKGVycikge1xuICAgICAgICAgICAgICAgIC8vIGZpZWxkIGluc2VydGlvbiBub3Qgc3VwcG9ydGVkIGZvciBjb21wbGV4IGtleXNcbiAgICAgICAgICAgICAgICBzbG90ID0gbnVsbDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZihzbG90KSB7XG4gICAgICAgICAgICAgICAgc2xvdC5pbm5lckhUTUwgPSBcIlwiO1xuICAgICAgICAgICAgICAgIHNsb3QuYXBwZW5kQ2hpbGQobik7ICBcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmcmFnLmFwcGVuZENoaWxkKG4pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZWxlbWVudFswXS5hcHBlbmRDaGlsZChmcmFnKTtcblxuICAgICAgICAgICAgLy9jb21waWxlIG9ubHkgY2hpbGRyZW5cbiAgICAgICAgICAgICRjb21waWxlKGVsZW1lbnQuY2hpbGRyZW4oKSkoc2NvcGUpO1xuXG4gICAgICAgICAgICAvL29rLCBub3cgdGhhdCB0aGF0IGlzIGRvbmUgbGV0J3Mgc2V0IGFueSBkZWZhdWx0c1xuICAgICAgICAgICAgc2NoZW1hRm9ybS50cmF2ZXJzZVNjaGVtYShzY2hlbWEsIGZ1bmN0aW9uKHByb3AsIHBhdGgpIHtcbiAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKHByb3BbJ2RlZmF1bHQnXSkpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmFsID0gc2ZTZWxlY3QocGF0aCwgc2NvcGUubW9kZWwpO1xuICAgICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzVW5kZWZpbmVkKHZhbCkpIHtcbiAgICAgICAgICAgICAgICAgIHNmU2VsZWN0KHBhdGgsIHNjb3BlLm1vZGVsLCBwcm9wWydkZWZhdWx0J10pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5dKTtcblxuYW5ndWxhci5tb2R1bGUoJ3NjaGVtYUZvcm0nKS5kaXJlY3RpdmUoJ3NjaGVtYVZhbGlkYXRlJywgWydzZlZhbGlkYXRvcicsIGZ1bmN0aW9uKHNmVmFsaWRhdG9yKSB7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdBJyxcbiAgICBzY29wZTogZmFsc2UsXG4gICAgLy8gV2Ugd2FudCB0aGUgbGluayBmdW5jdGlvbiB0byBiZSAqYWZ0ZXIqIHRoZSBpbnB1dCBkaXJlY3RpdmVzIGxpbmsgZnVuY3Rpb24gc28gd2UgZ2V0IGFjY2Vzc1xuICAgIC8vIHRoZSBwYXJzZWQgdmFsdWUsIGV4LiBhIG51bWJlciBpbnN0ZWFkIG9mIGEgc3RyaW5nXG4gICAgcHJpb3JpdHk6IDEwMDAsXG4gICAgcmVxdWlyZTogJ25nTW9kZWwnLFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgbmdNb2RlbCkge1xuICAgICAgLy9TaW5jZSB3ZSBoYXZlIHNjb3BlIGZhbHNlIHRoaXMgaXMgdGhlIHNhbWUgc2NvcGVcbiAgICAgIC8vYXMgdGhlIGRlY29yYXRvclxuICAgICAgc2NvcGUubmdNb2RlbCA9IG5nTW9kZWw7XG5cbiAgICAgIHZhciBlcnJvciA9IG51bGw7XG5cbiAgICAgIHZhciBnZXRGb3JtID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghZm9ybSkge1xuICAgICAgICAgIGZvcm0gPSBzY29wZS4kZXZhbChhdHRycy5zY2hlbWFWYWxpZGF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZvcm07XG4gICAgICB9O1xuICAgICAgdmFyIGZvcm0gICA9IGdldEZvcm0oKTtcblxuICAgICAgLy8gVmFsaWRhdGUgYWdhaW5zdCB0aGUgc2NoZW1hLlxuXG4gICAgICAvLyBHZXQgaW4gbGFzdCBvZiB0aGUgcGFyc2VzIHNvIHRoZSBwYXJzZWQgdmFsdWUgaGFzIHRoZSBjb3JyZWN0IHR5cGUuXG4gICAgICBpZiAobmdNb2RlbC4kdmFsaWRhdG9ycykgeyAvLyBBbmd1bGFyIDEuM1xuICAgICAgICBuZ01vZGVsLiR2YWxpZGF0b3JzLnNjaGVtYSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgdmFyIHJlc3VsdCA9IHNmVmFsaWRhdG9yLnZhbGlkYXRlKGdldEZvcm0oKSwgdmFsdWUpO1xuICAgICAgICAgIGVycm9yID0gcmVzdWx0LmVycm9yO1xuICAgICAgICAgIHJldHVybiByZXN1bHQudmFsaWQ7XG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuXG4gICAgICAgIC8vIEFuZ3VsYXIgMS4yXG4gICAgICAgIG5nTW9kZWwuJHBhcnNlcnMucHVzaChmdW5jdGlvbih2aWV3VmFsdWUpIHtcbiAgICAgICAgICBmb3JtID0gZ2V0Rm9ybSgpO1xuICAgICAgICAgIC8vU3RpbGwgbWlnaHQgYmUgdW5kZWZpbmVkXG4gICAgICAgICAgaWYgKCFmb3JtKSB7XG4gICAgICAgICAgICByZXR1cm4gdmlld1ZhbHVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciByZXN1bHQgPSAgc2ZWYWxpZGF0b3IudmFsaWRhdGUoZm9ybSwgdmlld1ZhbHVlKTtcblxuICAgICAgICAgIGlmIChyZXN1bHQudmFsaWQpIHtcbiAgICAgICAgICAgIC8vIGl0IGlzIHZhbGlkXG4gICAgICAgICAgICBuZ01vZGVsLiRzZXRWYWxpZGl0eSgnc2NoZW1hJywgdHJ1ZSk7XG4gICAgICAgICAgICByZXR1cm4gdmlld1ZhbHVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBpdCBpcyBpbnZhbGlkLCByZXR1cm4gdW5kZWZpbmVkIChubyBtb2RlbCB1cGRhdGUpXG4gICAgICAgICAgICBuZ01vZGVsLiRzZXRWYWxpZGl0eSgnc2NoZW1hJywgZmFsc2UpO1xuICAgICAgICAgICAgZXJyb3IgPSByZXN1bHQuZXJyb3I7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cblxuICAgICAgLy8gTGlzdGVuIHRvIGFuIGV2ZW50IHNvIHdlIGNhbiB2YWxpZGF0ZSB0aGUgaW5wdXQgb24gcmVxdWVzdFxuICAgICAgc2NvcGUuJG9uKCdzY2hlbWFGb3JtVmFsaWRhdGUnLCBmdW5jdGlvbigpIHtcblxuICAgICAgICBpZiAobmdNb2RlbC4kdmFsaWRhdGUpIHtcbiAgICAgICAgICBuZ01vZGVsLiR2YWxpZGF0ZSgpO1xuICAgICAgICAgIGlmIChuZ01vZGVsLiRpbnZhbGlkKSB7IC8vIFRoZSBmaWVsZCBtdXN0IGJlIG1hZGUgZGlydHkgc28gdGhlIGVycm9yIG1lc3NhZ2UgaXMgZGlzcGxheWVkXG4gICAgICAgICAgICBuZ01vZGVsLiRkaXJ0eSA9IHRydWU7XG4gICAgICAgICAgICBuZ01vZGVsLiRwcmlzdGluZSA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuZ01vZGVsLiRzZXRWaWV3VmFsdWUobmdNb2RlbC4kdmlld1ZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vVGhpcyB3b3JrcyBzaW5jZSB3ZSBub3cgd2UncmUgaW5zaWRlIGEgZGVjb3JhdG9yIGFuZCB0aGF0IHRoaXMgaXMgdGhlIGRlY29yYXRvcnMgc2NvcGUuXG4gICAgICAvL0lmICRwcmlzdGluZSBhbmQgZW1wdHkgZG9uJ3Qgc2hvdyBzdWNjZXNzIChldmVuIGlmIGl0J3MgdmFsaWQpXG4gICAgICBzY29wZS5oYXNTdWNjZXNzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZ01vZGVsLiR2YWxpZCAmJiAoIW5nTW9kZWwuJHByaXN0aW5lIHx8ICFuZ01vZGVsLiRpc0VtcHR5KG5nTW9kZWwuJG1vZGVsVmFsdWUpKTtcbiAgICAgIH07XG5cbiAgICAgIHNjb3BlLmhhc0Vycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZ01vZGVsLiRpbnZhbGlkICYmICFuZ01vZGVsLiRwcmlzdGluZTtcbiAgICAgIH07XG5cbiAgICAgIHNjb3BlLnNjaGVtYUVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBlcnJvcjtcbiAgICAgIH07XG5cbiAgICB9XG4gIH07XG59XSk7XG4iLCIvKiFcbiAqIGFuZ3VsYXItdHJhbnNsYXRlIC0gdjIuNi4xIC0gMjAxNS0wMy0wMVxuICogaHR0cDovL2dpdGh1Yi5jb20vYW5ndWxhci10cmFuc2xhdGUvYW5ndWxhci10cmFuc2xhdGVcbiAqIENvcHlyaWdodCAoYykgMjAxNSA7IExpY2Vuc2VkIE1JVFxuICovXG4vKipcbiAqIEBuZ2RvYyBvdmVydmlld1xuICogQG5hbWUgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZVxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogVGhlIG1haW4gbW9kdWxlIHdoaWNoIGhvbGRzIGV2ZXJ5dGhpbmcgdG9nZXRoZXIuXG4gKi9cbmFuZ3VsYXIubW9kdWxlKCdwYXNjYWxwcmVjaHQudHJhbnNsYXRlJywgWyduZyddKVxuXG4ucnVuKFsnJHRyYW5zbGF0ZScsIGZ1bmN0aW9uICgkdHJhbnNsYXRlKSB7XG5cbiAgdmFyIGtleSA9ICR0cmFuc2xhdGUuc3RvcmFnZUtleSgpLFxuICAgICAgc3RvcmFnZSA9ICR0cmFuc2xhdGUuc3RvcmFnZSgpO1xuXG4gIHZhciBmYWxsYmFja0Zyb21JbmNvcnJlY3RTdG9yYWdlVmFsdWUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcHJlZmVycmVkID0gJHRyYW5zbGF0ZS5wcmVmZXJyZWRMYW5ndWFnZSgpO1xuICAgIGlmIChhbmd1bGFyLmlzU3RyaW5nKHByZWZlcnJlZCkpIHtcbiAgICAgICR0cmFuc2xhdGUudXNlKHByZWZlcnJlZCk7XG4gICAgICAvLyAkdHJhbnNsYXRlLnVzZSgpIHdpbGwgYWxzbyByZW1lbWJlciB0aGUgbGFuZ3VhZ2UuXG4gICAgICAvLyBTbywgd2UgZG9uJ3QgbmVlZCB0byBjYWxsIHN0b3JhZ2UucHV0KCkgaGVyZS5cbiAgICB9IGVsc2Uge1xuICAgICAgc3RvcmFnZS5wdXQoa2V5LCAkdHJhbnNsYXRlLnVzZSgpKTtcbiAgICB9XG4gIH07XG5cbiAgaWYgKHN0b3JhZ2UpIHtcbiAgICBpZiAoIXN0b3JhZ2UuZ2V0KGtleSkpIHtcbiAgICAgIGZhbGxiYWNrRnJvbUluY29ycmVjdFN0b3JhZ2VWYWx1ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkdHJhbnNsYXRlLnVzZShzdG9yYWdlLmdldChrZXkpKVsnY2F0Y2gnXShmYWxsYmFja0Zyb21JbmNvcnJlY3RTdG9yYWdlVmFsdWUpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChhbmd1bGFyLmlzU3RyaW5nKCR0cmFuc2xhdGUucHJlZmVycmVkTGFuZ3VhZ2UoKSkpIHtcbiAgICAkdHJhbnNsYXRlLnVzZSgkdHJhbnNsYXRlLnByZWZlcnJlZExhbmd1YWdlKCkpO1xuICB9XG59XSk7XG5cbi8qKlxuICogQG5nZG9jIG9iamVjdFxuICogQG5hbWUgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlUHJvdmlkZXJcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqICR0cmFuc2xhdGVQcm92aWRlciBhbGxvd3MgZGV2ZWxvcGVycyB0byByZWdpc3RlciB0cmFuc2xhdGlvbi10YWJsZXMsIGFzeW5jaHJvbm91cyBsb2FkZXJzXG4gKiBhbmQgc2ltaWxhciB0byBjb25maWd1cmUgdHJhbnNsYXRpb24gYmVoYXZpb3IgZGlyZWN0bHkgaW5zaWRlIG9mIGEgbW9kdWxlLlxuICpcbiAqL1xuYW5ndWxhci5tb2R1bGUoJ3Bhc2NhbHByZWNodC50cmFuc2xhdGUnKS5wcm92aWRlcignJHRyYW5zbGF0ZScsIFsnJFNUT1JBR0VfS0VZJywgJyR3aW5kb3dQcm92aWRlcicsIGZ1bmN0aW9uICgkU1RPUkFHRV9LRVksICR3aW5kb3dQcm92aWRlcikge1xuXG4gIHZhciAkdHJhbnNsYXRpb25UYWJsZSA9IHt9LFxuICAgICAgJHByZWZlcnJlZExhbmd1YWdlLFxuICAgICAgJGF2YWlsYWJsZUxhbmd1YWdlS2V5cyA9IFtdLFxuICAgICAgJGxhbmd1YWdlS2V5QWxpYXNlcyxcbiAgICAgICRmYWxsYmFja0xhbmd1YWdlLFxuICAgICAgJGZhbGxiYWNrV2FzU3RyaW5nLFxuICAgICAgJHVzZXMsXG4gICAgICAkbmV4dExhbmcsXG4gICAgICAkc3RvcmFnZUZhY3RvcnksXG4gICAgICAkc3RvcmFnZUtleSA9ICRTVE9SQUdFX0tFWSxcbiAgICAgICRzdG9yYWdlUHJlZml4LFxuICAgICAgJG1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXJGYWN0b3J5LFxuICAgICAgJGludGVycG9sYXRpb25GYWN0b3J5LFxuICAgICAgJGludGVycG9sYXRvckZhY3RvcmllcyA9IFtdLFxuICAgICAgJGludGVycG9sYXRpb25TYW5pdGl6YXRpb25TdHJhdGVneSA9IGZhbHNlLFxuICAgICAgJGxvYWRlckZhY3RvcnksXG4gICAgICAkY2xvYWtDbGFzc05hbWUgPSAndHJhbnNsYXRlLWNsb2FrJyxcbiAgICAgICRsb2FkZXJPcHRpb25zLFxuICAgICAgJG5vdEZvdW5kSW5kaWNhdG9yTGVmdCxcbiAgICAgICRub3RGb3VuZEluZGljYXRvclJpZ2h0LFxuICAgICAgJHBvc3RDb21waWxpbmdFbmFibGVkID0gZmFsc2UsXG4gICAgICBORVNURURfT0JKRUNUX0RFTElNSVRFUiA9ICcuJyxcbiAgICAgIGxvYWRlckNhY2hlLFxuICAgICAgZGlyZWN0aXZlUHJpb3JpdHkgPSAwO1xuXG4gIHZhciB2ZXJzaW9uID0gJzIuNi4xJztcblxuICAvLyB0cmllcyB0byBkZXRlcm1pbmUgdGhlIGJyb3dzZXJzIGxhbmd1YWdlXG4gIHZhciBnZXRGaXJzdEJyb3dzZXJMYW5ndWFnZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbmF2ID0gJHdpbmRvd1Byb3ZpZGVyLiRnZXQoKS5uYXZpZ2F0b3IsXG4gICAgICAgIGJyb3dzZXJMYW5ndWFnZVByb3BlcnR5S2V5cyA9IFsnbGFuZ3VhZ2UnLCAnYnJvd3Nlckxhbmd1YWdlJywgJ3N5c3RlbUxhbmd1YWdlJywgJ3VzZXJMYW5ndWFnZSddLFxuICAgICAgICBpLFxuICAgICAgICBsYW5ndWFnZTtcblxuICAgIC8vIHN1cHBvcnQgZm9yIEhUTUwgNS4xIFwibmF2aWdhdG9yLmxhbmd1YWdlc1wiXG4gICAgaWYgKGFuZ3VsYXIuaXNBcnJheShuYXYubGFuZ3VhZ2VzKSkge1xuICAgICAgZm9yIChpID0gMDsgaSA8IG5hdi5sYW5ndWFnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGFuZ3VhZ2UgPSBuYXYubGFuZ3VhZ2VzW2ldO1xuICAgICAgICBpZiAobGFuZ3VhZ2UgJiYgbGFuZ3VhZ2UubGVuZ3RoKSB7XG4gICAgICAgICAgcmV0dXJuIGxhbmd1YWdlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gc3VwcG9ydCBmb3Igb3RoZXIgd2VsbCBrbm93biBwcm9wZXJ0aWVzIGluIGJyb3dzZXJzXG4gICAgZm9yIChpID0gMDsgaSA8IGJyb3dzZXJMYW5ndWFnZVByb3BlcnR5S2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgbGFuZ3VhZ2UgPSBuYXZbYnJvd3Nlckxhbmd1YWdlUHJvcGVydHlLZXlzW2ldXTtcbiAgICAgIGlmIChsYW5ndWFnZSAmJiBsYW5ndWFnZS5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIGxhbmd1YWdlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9O1xuICBnZXRGaXJzdEJyb3dzZXJMYW5ndWFnZS5kaXNwbGF5TmFtZSA9ICdhbmd1bGFyLXRyYW5zbGF0ZS9zZXJ2aWNlOiBnZXRGaXJzdEJyb3dzZXJMYW5ndWFnZSc7XG5cbiAgLy8gdHJpZXMgdG8gZGV0ZXJtaW5lIHRoZSBicm93c2VycyBsb2NhbGVcbiAgdmFyIGdldExvY2FsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gKGdldEZpcnN0QnJvd3Nlckxhbmd1YWdlKCkgfHwgJycpLnNwbGl0KCctJykuam9pbignXycpO1xuICB9O1xuICBnZXRMb2NhbGUuZGlzcGxheU5hbWUgPSAnYW5ndWxhci10cmFuc2xhdGUvc2VydmljZTogZ2V0TG9jYWxlJztcblxuICAvKipcbiAgICogQG5hbWUgaW5kZXhPZlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogaW5kZXhPZiBwb2x5ZmlsbC4gS2luZGEgc29ydGEuXG4gICAqXG4gICAqIEBwYXJhbSB7YXJyYXl9IGFycmF5IEFycmF5IHRvIHNlYXJjaCBpbi5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHNlYXJjaEVsZW1lbnQgRWxlbWVudCB0byBzZWFyY2ggZm9yLlxuICAgKlxuICAgKiBAcmV0dXJucyB7aW50fSBJbmRleCBvZiBzZWFyY2ggZWxlbWVudC5cbiAgICovXG4gIHZhciBpbmRleE9mID0gZnVuY3Rpb24oYXJyYXksIHNlYXJjaEVsZW1lbnQpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gYXJyYXkubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGlmIChhcnJheVtpXSA9PT0gc2VhcmNoRWxlbWVudCkge1xuICAgICAgICByZXR1cm4gaTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIC0xO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAbmFtZSB0cmltXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiB0cmltIHBvbHlmaWxsXG4gICAqXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBzdHJpbmcgc3RyaXBwZWQgb2Ygd2hpdGVzcGFjZSBmcm9tIGJvdGggZW5kc1xuICAgKi9cbiAgdmFyIHRyaW0gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG4gIH07XG5cbiAgdmFyIG5lZ290aWF0ZUxvY2FsZSA9IGZ1bmN0aW9uIChwcmVmZXJyZWQpIHtcblxuICAgIHZhciBhdmFpbCA9IFtdLFxuICAgICAgICBsb2NhbGUgPSBhbmd1bGFyLmxvd2VyY2FzZShwcmVmZXJyZWQpLFxuICAgICAgICBpID0gMCxcbiAgICAgICAgbiA9ICRhdmFpbGFibGVMYW5ndWFnZUtleXMubGVuZ3RoO1xuXG4gICAgZm9yICg7IGkgPCBuOyBpKyspIHtcbiAgICAgIGF2YWlsLnB1c2goYW5ndWxhci5sb3dlcmNhc2UoJGF2YWlsYWJsZUxhbmd1YWdlS2V5c1tpXSkpO1xuICAgIH1cblxuICAgIGlmIChpbmRleE9mKGF2YWlsLCBsb2NhbGUpID4gLTEpIHtcbiAgICAgIHJldHVybiBwcmVmZXJyZWQ7XG4gICAgfVxuXG4gICAgaWYgKCRsYW5ndWFnZUtleUFsaWFzZXMpIHtcbiAgICAgIHZhciBhbGlhcztcbiAgICAgIGZvciAodmFyIGxhbmdLZXlBbGlhcyBpbiAkbGFuZ3VhZ2VLZXlBbGlhc2VzKSB7XG4gICAgICAgIHZhciBoYXNXaWxkY2FyZEtleSA9IGZhbHNlO1xuICAgICAgICB2YXIgaGFzRXhhY3RLZXkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoJGxhbmd1YWdlS2V5QWxpYXNlcywgbGFuZ0tleUFsaWFzKSAmJlxuICAgICAgICAgIGFuZ3VsYXIubG93ZXJjYXNlKGxhbmdLZXlBbGlhcykgPT09IGFuZ3VsYXIubG93ZXJjYXNlKHByZWZlcnJlZCk7XG5cbiAgICAgICAgaWYgKGxhbmdLZXlBbGlhcy5zbGljZSgtMSkgPT09ICcqJykge1xuICAgICAgICAgIGhhc1dpbGRjYXJkS2V5ID0gbGFuZ0tleUFsaWFzLnNsaWNlKDAsIC0xKSA9PT0gcHJlZmVycmVkLnNsaWNlKDAsIGxhbmdLZXlBbGlhcy5sZW5ndGgtMSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhhc0V4YWN0S2V5IHx8IGhhc1dpbGRjYXJkS2V5KSB7XG4gICAgICAgICAgYWxpYXMgPSAkbGFuZ3VhZ2VLZXlBbGlhc2VzW2xhbmdLZXlBbGlhc107XG4gICAgICAgICAgaWYgKGluZGV4T2YoYXZhaWwsIGFuZ3VsYXIubG93ZXJjYXNlKGFsaWFzKSkgPiAtMSkge1xuICAgICAgICAgICAgcmV0dXJuIGFsaWFzO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBwYXJ0cyA9IHByZWZlcnJlZC5zcGxpdCgnXycpO1xuXG4gICAgaWYgKHBhcnRzLmxlbmd0aCA+IDEgJiYgaW5kZXhPZihhdmFpbCwgYW5ndWxhci5sb3dlcmNhc2UocGFydHNbMF0pKSA+IC0xKSB7XG4gICAgICByZXR1cm4gcGFydHNbMF07XG4gICAgfVxuXG4gICAgLy8gSWYgZXZlcnl0aGluZyBmYWlscywganVzdCByZXR1cm4gdGhlIHByZWZlcnJlZCwgdW5jaGFuZ2VkLlxuICAgIHJldHVybiBwcmVmZXJyZWQ7XG4gIH07XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlciN0cmFuc2xhdGlvbnNcbiAgICogQG1ldGhvZE9mIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVByb3ZpZGVyXG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBSZWdpc3RlcnMgYSBuZXcgdHJhbnNsYXRpb24gdGFibGUgZm9yIHNwZWNpZmljIGxhbmd1YWdlIGtleS5cbiAgICpcbiAgICogVG8gcmVnaXN0ZXIgYSB0cmFuc2xhdGlvbiB0YWJsZSBmb3Igc3BlY2lmaWMgbGFuZ3VhZ2UsIHBhc3MgYSBkZWZpbmVkIGxhbmd1YWdlXG4gICAqIGtleSBhcyBmaXJzdCBwYXJhbWV0ZXIuXG4gICAqXG4gICAqIDxwcmU+XG4gICAqICAvLyByZWdpc3RlciB0cmFuc2xhdGlvbiB0YWJsZSBmb3IgbGFuZ3VhZ2U6ICdkZV9ERSdcbiAgICogICR0cmFuc2xhdGVQcm92aWRlci50cmFuc2xhdGlvbnMoJ2RlX0RFJywge1xuICAgKiAgICAnR1JFRVRJTkcnOiAnSGFsbG8gV2VsdCEnXG4gICAqICB9KTtcbiAgICpcbiAgICogIC8vIHJlZ2lzdGVyIGFub3RoZXIgb25lXG4gICAqICAkdHJhbnNsYXRlUHJvdmlkZXIudHJhbnNsYXRpb25zKCdlbl9VUycsIHtcbiAgICogICAgJ0dSRUVUSU5HJzogJ0hlbGxvIHdvcmxkISdcbiAgICogIH0pO1xuICAgKiA8L3ByZT5cbiAgICpcbiAgICogV2hlbiByZWdpc3RlcmluZyBtdWx0aXBsZSB0cmFuc2xhdGlvbiB0YWJsZXMgZm9yIGZvciB0aGUgc2FtZSBsYW5ndWFnZSBrZXksXG4gICAqIHRoZSBhY3R1YWwgdHJhbnNsYXRpb24gdGFibGUgZ2V0cyBleHRlbmRlZC4gVGhpcyBhbGxvd3MgeW91IHRvIGRlZmluZSBtb2R1bGVcbiAgICogc3BlY2lmaWMgdHJhbnNsYXRpb24gd2hpY2ggb25seSBnZXQgYWRkZWQsIG9uY2UgYSBzcGVjaWZpYyBtb2R1bGUgaXMgbG9hZGVkIGluXG4gICAqIHlvdXIgYXBwLlxuICAgKlxuICAgKiBJbnZva2luZyB0aGlzIG1ldGhvZCB3aXRoIG5vIGFyZ3VtZW50cyByZXR1cm5zIHRoZSB0cmFuc2xhdGlvbiB0YWJsZSB3aGljaCB3YXNcbiAgICogcmVnaXN0ZXJlZCB3aXRoIG5vIGxhbmd1YWdlIGtleS4gSW52b2tpbmcgaXQgd2l0aCBhIGxhbmd1YWdlIGtleSByZXR1cm5zIHRoZVxuICAgKiByZWxhdGVkIHRyYW5zbGF0aW9uIHRhYmxlLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IEEgbGFuZ3VhZ2Uga2V5LlxuICAgKiBAcGFyYW0ge29iamVjdH0gdHJhbnNsYXRpb25UYWJsZSBBIHBsYWluIG9sZCBKYXZhU2NyaXB0IG9iamVjdCB0aGF0IHJlcHJlc2VudHMgYSB0cmFuc2xhdGlvbiB0YWJsZS5cbiAgICpcbiAgICovXG4gIHZhciB0cmFuc2xhdGlvbnMgPSBmdW5jdGlvbiAobGFuZ0tleSwgdHJhbnNsYXRpb25UYWJsZSkge1xuXG4gICAgaWYgKCFsYW5nS2V5ICYmICF0cmFuc2xhdGlvblRhYmxlKSB7XG4gICAgICByZXR1cm4gJHRyYW5zbGF0aW9uVGFibGU7XG4gICAgfVxuXG4gICAgaWYgKGxhbmdLZXkgJiYgIXRyYW5zbGF0aW9uVGFibGUpIHtcbiAgICAgIGlmIChhbmd1bGFyLmlzU3RyaW5nKGxhbmdLZXkpKSB7XG4gICAgICAgIHJldHVybiAkdHJhbnNsYXRpb25UYWJsZVtsYW5nS2V5XTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCFhbmd1bGFyLmlzT2JqZWN0KCR0cmFuc2xhdGlvblRhYmxlW2xhbmdLZXldKSkge1xuICAgICAgICAkdHJhbnNsYXRpb25UYWJsZVtsYW5nS2V5XSA9IHt9O1xuICAgICAgfVxuICAgICAgYW5ndWxhci5leHRlbmQoJHRyYW5zbGF0aW9uVGFibGVbbGFuZ0tleV0sIGZsYXRPYmplY3QodHJhbnNsYXRpb25UYWJsZSkpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICB0aGlzLnRyYW5zbGF0aW9ucyA9IHRyYW5zbGF0aW9ucztcblxuICAvKipcbiAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAqIEBuYW1lIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVByb3ZpZGVyI2Nsb2FrQ2xhc3NOYW1lXG4gICAqIEBtZXRob2RPZiBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlclxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICpcbiAgICogTGV0J3MgeW91IGNoYW5nZSB0aGUgY2xhc3MgbmFtZSBmb3IgYHRyYW5zbGF0ZS1jbG9ha2AgZGlyZWN0aXZlLlxuICAgKiBEZWZhdWx0IGNsYXNzIG5hbWUgaXMgYHRyYW5zbGF0ZS1jbG9ha2AuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIHRyYW5zbGF0ZS1jbG9hayBjbGFzcyBuYW1lXG4gICAqL1xuICB0aGlzLmNsb2FrQ2xhc3NOYW1lID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICBpZiAoIW5hbWUpIHtcbiAgICAgIHJldHVybiAkY2xvYWtDbGFzc05hbWU7XG4gICAgfVxuICAgICRjbG9ha0NsYXNzTmFtZSA9IG5hbWU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIEBuYW1lIGZsYXRPYmplY3RcbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIEZsYXRzIGFuIG9iamVjdC4gVGhpcyBmdW5jdGlvbiBpcyB1c2VkIHRvIGZsYXR0ZW4gZ2l2ZW4gdHJhbnNsYXRpb24gZGF0YSB3aXRoXG4gICAqIG5hbWVzcGFjZXMsIHNvIHRoZXkgYXJlIGxhdGVyIGFjY2Vzc2libGUgdmlhIGRvdCBub3RhdGlvbi5cbiAgICovXG4gIHZhciBmbGF0T2JqZWN0ID0gZnVuY3Rpb24gKGRhdGEsIHBhdGgsIHJlc3VsdCwgcHJldktleSkge1xuICAgIHZhciBrZXksIGtleVdpdGhQYXRoLCBrZXlXaXRoU2hvcnRQYXRoLCB2YWw7XG5cbiAgICBpZiAoIXBhdGgpIHtcbiAgICAgIHBhdGggPSBbXTtcbiAgICB9XG4gICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgIHJlc3VsdCA9IHt9O1xuICAgIH1cbiAgICBmb3IgKGtleSBpbiBkYXRhKSB7XG4gICAgICBpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChkYXRhLCBrZXkpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgdmFsID0gZGF0YVtrZXldO1xuICAgICAgaWYgKGFuZ3VsYXIuaXNPYmplY3QodmFsKSkge1xuICAgICAgICBmbGF0T2JqZWN0KHZhbCwgcGF0aC5jb25jYXQoa2V5KSwgcmVzdWx0LCBrZXkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAga2V5V2l0aFBhdGggPSBwYXRoLmxlbmd0aCA/ICgnJyArIHBhdGguam9pbihORVNURURfT0JKRUNUX0RFTElNSVRFUikgKyBORVNURURfT0JKRUNUX0RFTElNSVRFUiArIGtleSkgOiBrZXk7XG4gICAgICAgIGlmKHBhdGgubGVuZ3RoICYmIGtleSA9PT0gcHJldktleSl7XG4gICAgICAgICAgLy8gQ3JlYXRlIHNob3J0Y3V0IHBhdGggKGZvby5iYXIgPT0gZm9vLmJhci5iYXIpXG4gICAgICAgICAga2V5V2l0aFNob3J0UGF0aCA9ICcnICsgcGF0aC5qb2luKE5FU1RFRF9PQkpFQ1RfREVMSU1JVEVSKTtcbiAgICAgICAgICAvLyBMaW5rIGl0IHRvIG9yaWdpbmFsIHBhdGhcbiAgICAgICAgICByZXN1bHRba2V5V2l0aFNob3J0UGF0aF0gPSAnQDonICsga2V5V2l0aFBhdGg7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0W2tleVdpdGhQYXRoXSA9IHZhbDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvKipcbiAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAqIEBuYW1lIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVByb3ZpZGVyI2FkZEludGVycG9sYXRpb25cbiAgICogQG1ldGhvZE9mIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVByb3ZpZGVyXG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBBZGRzIGludGVycG9sYXRpb24gc2VydmljZXMgdG8gYW5ndWxhci10cmFuc2xhdGUsIHNvIGl0IGNhbiBtYW5hZ2UgdGhlbS5cbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3R9IGZhY3RvcnkgSW50ZXJwb2xhdGlvbiBzZXJ2aWNlIGZhY3RvcnlcbiAgICovXG4gIHRoaXMuYWRkSW50ZXJwb2xhdGlvbiA9IGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgJGludGVycG9sYXRvckZhY3Rvcmllcy5wdXNoKGZhY3RvcnkpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICogQG5hbWUgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlUHJvdmlkZXIjdXNlTWVzc2FnZUZvcm1hdEludGVycG9sYXRpb25cbiAgICogQG1ldGhvZE9mIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVByb3ZpZGVyXG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBUZWxscyBhbmd1bGFyLXRyYW5zbGF0ZSB0byB1c2UgaW50ZXJwb2xhdGlvbiBmdW5jdGlvbmFsaXR5IG9mIG1lc3NhZ2Vmb3JtYXQuanMuXG4gICAqIFRoaXMgaXMgdXNlZnVsIHdoZW4gaGF2aW5nIGhpZ2ggbGV2ZWwgcGx1cmFsaXphdGlvbiBhbmQgZ2VuZGVyIHNlbGVjdGlvbi5cbiAgICovXG4gIHRoaXMudXNlTWVzc2FnZUZvcm1hdEludGVycG9sYXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMudXNlSW50ZXJwb2xhdGlvbignJHRyYW5zbGF0ZU1lc3NhZ2VGb3JtYXRJbnRlcnBvbGF0aW9uJyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlciN1c2VJbnRlcnBvbGF0aW9uXG4gICAqIEBtZXRob2RPZiBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlclxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogVGVsbHMgYW5ndWxhci10cmFuc2xhdGUgd2hpY2ggaW50ZXJwb2xhdGlvbiBzdHlsZSB0byB1c2UgYXMgZGVmYXVsdCwgYXBwbGljYXRpb24td2lkZS5cbiAgICogU2ltcGx5IHBhc3MgYSBmYWN0b3J5L3NlcnZpY2UgbmFtZS4gVGhlIGludGVycG9sYXRpb24gc2VydmljZSBoYXMgdG8gaW1wbGVtZW50XG4gICAqIHRoZSBjb3JyZWN0IGludGVyZmFjZS5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZhY3RvcnkgSW50ZXJwb2xhdGlvbiBzZXJ2aWNlIG5hbWUuXG4gICAqL1xuICB0aGlzLnVzZUludGVycG9sYXRpb24gPSBmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgICRpbnRlcnBvbGF0aW9uRmFjdG9yeSA9IGZhY3Rvcnk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlciN1c2VTYW5pdGl6ZVN0cmF0ZWd5XG4gICAqIEBtZXRob2RPZiBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlclxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogU2ltcGx5IHNldHMgYSBzYW5pdGF0aW9uIHN0cmF0ZWd5IHR5cGUuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSBTdHJhdGVneSB0eXBlLlxuICAgKi9cbiAgdGhpcy51c2VTYW5pdGl6ZVZhbHVlU3RyYXRlZ3kgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAkaW50ZXJwb2xhdGlvblNhbml0aXphdGlvblN0cmF0ZWd5ID0gdmFsdWU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAvKipcbiAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAqIEBuYW1lIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVByb3ZpZGVyI3ByZWZlcnJlZExhbmd1YWdlXG4gICAqIEBtZXRob2RPZiBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlclxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogVGVsbHMgdGhlIG1vZHVsZSB3aGljaCBvZiB0aGUgcmVnaXN0ZXJlZCB0cmFuc2xhdGlvbiB0YWJsZXMgdG8gdXNlIGZvciB0cmFuc2xhdGlvblxuICAgKiBhdCBpbml0aWFsIHN0YXJ0dXAgYnkgcGFzc2luZyBhIGxhbmd1YWdlIGtleS4gU2ltaWxhciB0byBgJHRyYW5zbGF0ZVByb3ZpZGVyI3VzZWBcbiAgICogb25seSB0aGF0IGl0IHNheXMgd2hpY2ggbGFuZ3VhZ2UgdG8gKipwcmVmZXIqKi5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGxhbmdLZXkgQSBsYW5ndWFnZSBrZXkuXG4gICAqXG4gICAqL1xuICB0aGlzLnByZWZlcnJlZExhbmd1YWdlID0gZnVuY3Rpb24obGFuZ0tleSkge1xuICAgIHNldHVwUHJlZmVycmVkTGFuZ3VhZ2UobGFuZ0tleSk7XG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgfTtcbiAgdmFyIHNldHVwUHJlZmVycmVkTGFuZ3VhZ2UgPSBmdW5jdGlvbiAobGFuZ0tleSkge1xuICAgIGlmIChsYW5nS2V5KSB7XG4gICAgICAkcHJlZmVycmVkTGFuZ3VhZ2UgPSBsYW5nS2V5O1xuICAgIH1cbiAgICByZXR1cm4gJHByZWZlcnJlZExhbmd1YWdlO1xuICB9O1xuICAvKipcbiAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAqIEBuYW1lIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVByb3ZpZGVyI3RyYW5zbGF0aW9uTm90Rm91bmRJbmRpY2F0b3JcbiAgICogQG1ldGhvZE9mIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVByb3ZpZGVyXG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBTZXRzIGFuIGluZGljYXRvciB3aGljaCBpcyB1c2VkIHdoZW4gYSB0cmFuc2xhdGlvbiBpc24ndCBmb3VuZC4gRS5nLiB3aGVuXG4gICAqIHNldHRpbmcgdGhlIGluZGljYXRvciBhcyAnWCcgYW5kIG9uZSB0cmllcyB0byB0cmFuc2xhdGUgYSB0cmFuc2xhdGlvbiBpZFxuICAgKiBjYWxsZWQgYE5PVF9GT1VORGAsIHRoaXMgd2lsbCByZXN1bHQgaW4gYFggTk9UX0ZPVU5EIFhgLlxuICAgKlxuICAgKiBJbnRlcm5hbGx5IHRoaXMgbWV0aG9kcyBzZXRzIGEgbGVmdCBpbmRpY2F0b3IgYW5kIGEgcmlnaHQgaW5kaWNhdG9yIHVzaW5nXG4gICAqIGAkdHJhbnNsYXRlUHJvdmlkZXIudHJhbnNsYXRpb25Ob3RGb3VuZEluZGljYXRvckxlZnQoKWAgYW5kXG4gICAqIGAkdHJhbnNsYXRlUHJvdmlkZXIudHJhbnNsYXRpb25Ob3RGb3VuZEluZGljYXRvclJpZ2h0KClgLlxuICAgKlxuICAgKiAqKk5vdGUqKjogVGhlc2UgbWV0aG9kcyBhdXRvbWF0aWNhbGx5IGFkZCBhIHdoaXRlc3BhY2UgYmV0d2VlbiB0aGUgaW5kaWNhdG9yc1xuICAgKiBhbmQgdGhlIHRyYW5zbGF0aW9uIGlkLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gaW5kaWNhdG9yIEFuIGluZGljYXRvciwgY291bGQgYmUgYW55IHN0cmluZy5cbiAgICovXG4gIHRoaXMudHJhbnNsYXRpb25Ob3RGb3VuZEluZGljYXRvciA9IGZ1bmN0aW9uIChpbmRpY2F0b3IpIHtcbiAgICB0aGlzLnRyYW5zbGF0aW9uTm90Rm91bmRJbmRpY2F0b3JMZWZ0KGluZGljYXRvcik7XG4gICAgdGhpcy50cmFuc2xhdGlvbk5vdEZvdW5kSW5kaWNhdG9yUmlnaHQoaW5kaWNhdG9yKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogbmdkb2MgZnVuY3Rpb25cbiAgICogQG5hbWUgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlUHJvdmlkZXIjdHJhbnNsYXRpb25Ob3RGb3VuZEluZGljYXRvckxlZnRcbiAgICogQG1ldGhvZE9mIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVByb3ZpZGVyXG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBTZXRzIGFuIGluZGljYXRvciB3aGljaCBpcyB1c2VkIHdoZW4gYSB0cmFuc2xhdGlvbiBpc24ndCBmb3VuZCBsZWZ0IHRvIHRoZVxuICAgKiB0cmFuc2xhdGlvbiBpZC5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGluZGljYXRvciBBbiBpbmRpY2F0b3IuXG4gICAqL1xuICB0aGlzLnRyYW5zbGF0aW9uTm90Rm91bmRJbmRpY2F0b3JMZWZ0ID0gZnVuY3Rpb24gKGluZGljYXRvcikge1xuICAgIGlmICghaW5kaWNhdG9yKSB7XG4gICAgICByZXR1cm4gJG5vdEZvdW5kSW5kaWNhdG9yTGVmdDtcbiAgICB9XG4gICAgJG5vdEZvdW5kSW5kaWNhdG9yTGVmdCA9IGluZGljYXRvcjtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogbmdkb2MgZnVuY3Rpb25cbiAgICogQG5hbWUgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlUHJvdmlkZXIjdHJhbnNsYXRpb25Ob3RGb3VuZEluZGljYXRvckxlZnRcbiAgICogQG1ldGhvZE9mIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVByb3ZpZGVyXG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBTZXRzIGFuIGluZGljYXRvciB3aGljaCBpcyB1c2VkIHdoZW4gYSB0cmFuc2xhdGlvbiBpc24ndCBmb3VuZCByaWdodCB0byB0aGVcbiAgICogdHJhbnNsYXRpb24gaWQuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBpbmRpY2F0b3IgQW4gaW5kaWNhdG9yLlxuICAgKi9cbiAgdGhpcy50cmFuc2xhdGlvbk5vdEZvdW5kSW5kaWNhdG9yUmlnaHQgPSBmdW5jdGlvbiAoaW5kaWNhdG9yKSB7XG4gICAgaWYgKCFpbmRpY2F0b3IpIHtcbiAgICAgIHJldHVybiAkbm90Rm91bmRJbmRpY2F0b3JSaWdodDtcbiAgICB9XG4gICAgJG5vdEZvdW5kSW5kaWNhdG9yUmlnaHQgPSBpbmRpY2F0b3I7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlciNmYWxsYmFja0xhbmd1YWdlXG4gICAqIEBtZXRob2RPZiBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlclxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogVGVsbHMgdGhlIG1vZHVsZSB3aGljaCBvZiB0aGUgcmVnaXN0ZXJlZCB0cmFuc2xhdGlvbiB0YWJsZXMgdG8gdXNlIHdoZW4gbWlzc2luZyB0cmFuc2xhdGlvbnNcbiAgICogYXQgaW5pdGlhbCBzdGFydHVwIGJ5IHBhc3NpbmcgYSBsYW5ndWFnZSBrZXkuIFNpbWlsYXIgdG8gYCR0cmFuc2xhdGVQcm92aWRlciN1c2VgXG4gICAqIG9ubHkgdGhhdCBpdCBzYXlzIHdoaWNoIGxhbmd1YWdlIHRvICoqZmFsbGJhY2sqKi5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd8fGFycmF5fSBsYW5nS2V5IEEgbGFuZ3VhZ2Uga2V5LlxuICAgKlxuICAgKi9cbiAgdGhpcy5mYWxsYmFja0xhbmd1YWdlID0gZnVuY3Rpb24gKGxhbmdLZXkpIHtcbiAgICBmYWxsYmFja1N0YWNrKGxhbmdLZXkpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHZhciBmYWxsYmFja1N0YWNrID0gZnVuY3Rpb24gKGxhbmdLZXkpIHtcbiAgICBpZiAobGFuZ0tleSkge1xuICAgICAgaWYgKGFuZ3VsYXIuaXNTdHJpbmcobGFuZ0tleSkpIHtcbiAgICAgICAgJGZhbGxiYWNrV2FzU3RyaW5nID0gdHJ1ZTtcbiAgICAgICAgJGZhbGxiYWNrTGFuZ3VhZ2UgPSBbIGxhbmdLZXkgXTtcbiAgICAgIH0gZWxzZSBpZiAoYW5ndWxhci5pc0FycmF5KGxhbmdLZXkpKSB7XG4gICAgICAgICRmYWxsYmFja1dhc1N0cmluZyA9IGZhbHNlO1xuICAgICAgICAkZmFsbGJhY2tMYW5ndWFnZSA9IGxhbmdLZXk7XG4gICAgICB9XG4gICAgICBpZiAoYW5ndWxhci5pc1N0cmluZygkcHJlZmVycmVkTGFuZ3VhZ2UpICAmJiBpbmRleE9mKCRmYWxsYmFja0xhbmd1YWdlLCAkcHJlZmVycmVkTGFuZ3VhZ2UpIDwgMCkge1xuICAgICAgICAkZmFsbGJhY2tMYW5ndWFnZS5wdXNoKCRwcmVmZXJyZWRMYW5ndWFnZSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoJGZhbGxiYWNrV2FzU3RyaW5nKSB7XG4gICAgICAgIHJldHVybiAkZmFsbGJhY2tMYW5ndWFnZVswXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAkZmFsbGJhY2tMYW5ndWFnZTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlciN1c2VcbiAgICogQG1ldGhvZE9mIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVByb3ZpZGVyXG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBTZXQgd2hpY2ggdHJhbnNsYXRpb24gdGFibGUgdG8gdXNlIGZvciB0cmFuc2xhdGlvbiBieSBnaXZlbiBsYW5ndWFnZSBrZXkuIFdoZW5cbiAgICogdHJ5aW5nIHRvICd1c2UnIGEgbGFuZ3VhZ2Ugd2hpY2ggaXNuJ3QgcHJvdmlkZWQsIGl0J2xsIHRocm93IGFuIGVycm9yLlxuICAgKlxuICAgKiBZb3UgYWN0dWFsbHkgZG9uJ3QgaGF2ZSB0byB1c2UgdGhpcyBtZXRob2Qgc2luY2UgYCR0cmFuc2xhdGVQcm92aWRlciNwcmVmZXJyZWRMYW5ndWFnZWBcbiAgICogZG9lcyB0aGUgam9iIHRvby5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGxhbmdLZXkgQSBsYW5ndWFnZSBrZXkuXG4gICAqL1xuICB0aGlzLnVzZSA9IGZ1bmN0aW9uIChsYW5nS2V5KSB7XG4gICAgaWYgKGxhbmdLZXkpIHtcbiAgICAgIGlmICghJHRyYW5zbGF0aW9uVGFibGVbbGFuZ0tleV0gJiYgKCEkbG9hZGVyRmFjdG9yeSkpIHtcbiAgICAgICAgLy8gb25seSB0aHJvdyBhbiBlcnJvciwgd2hlbiBub3QgbG9hZGluZyB0cmFuc2xhdGlvbiBkYXRhIGFzeW5jaHJvbm91c2x5XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIiR0cmFuc2xhdGVQcm92aWRlciBjb3VsZG4ndCBmaW5kIHRyYW5zbGF0aW9uVGFibGUgZm9yIGxhbmdLZXk6ICdcIiArIGxhbmdLZXkgKyBcIidcIik7XG4gICAgICB9XG4gICAgICAkdXNlcyA9IGxhbmdLZXk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgcmV0dXJuICR1c2VzO1xuICB9O1xuXG4gLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlciNzdG9yYWdlS2V5XG4gICAqIEBtZXRob2RPZiBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlclxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogVGVsbHMgdGhlIG1vZHVsZSB3aGljaCBrZXkgbXVzdCByZXByZXNlbnQgdGhlIGNob29zZWQgbGFuZ3VhZ2UgYnkgYSB1c2VyIGluIHRoZSBzdG9yYWdlLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IEEga2V5IGZvciB0aGUgc3RvcmFnZS5cbiAgICovXG4gIHZhciBzdG9yYWdlS2V5ID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKCFrZXkpIHtcbiAgICAgIGlmICgkc3RvcmFnZVByZWZpeCkge1xuICAgICAgICByZXR1cm4gJHN0b3JhZ2VQcmVmaXggKyAkc3RvcmFnZUtleTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAkc3RvcmFnZUtleTtcbiAgICB9XG4gICAgJHN0b3JhZ2VLZXkgPSBrZXk7XG4gIH07XG5cbiAgdGhpcy5zdG9yYWdlS2V5ID0gc3RvcmFnZUtleTtcblxuICAvKipcbiAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAqIEBuYW1lIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVByb3ZpZGVyI3VzZVVybExvYWRlclxuICAgKiBAbWV0aG9kT2YgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlUHJvdmlkZXJcbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFRlbGxzIGFuZ3VsYXItdHJhbnNsYXRlIHRvIHVzZSBgJHRyYW5zbGF0ZVVybExvYWRlcmAgZXh0ZW5zaW9uIHNlcnZpY2UgYXMgbG9hZGVyLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsIFVybFxuICAgKiBAcGFyYW0ge09iamVjdD19IG9wdGlvbnMgT3B0aW9uYWwgY29uZmlndXJhdGlvbiBvYmplY3RcbiAgICovXG4gIHRoaXMudXNlVXJsTG9hZGVyID0gZnVuY3Rpb24gKHVybCwgb3B0aW9ucykge1xuICAgIHJldHVybiB0aGlzLnVzZUxvYWRlcignJHRyYW5zbGF0ZVVybExvYWRlcicsIGFuZ3VsYXIuZXh0ZW5kKHsgdXJsOiB1cmwgfSwgb3B0aW9ucykpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICogQG5hbWUgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlUHJvdmlkZXIjdXNlU3RhdGljRmlsZXNMb2FkZXJcbiAgICogQG1ldGhvZE9mIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVByb3ZpZGVyXG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBUZWxscyBhbmd1bGFyLXRyYW5zbGF0ZSB0byB1c2UgYCR0cmFuc2xhdGVTdGF0aWNGaWxlc0xvYWRlcmAgZXh0ZW5zaW9uIHNlcnZpY2UgYXMgbG9hZGVyLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdD19IG9wdGlvbnMgT3B0aW9uYWwgY29uZmlndXJhdGlvbiBvYmplY3RcbiAgICovXG4gIHRoaXMudXNlU3RhdGljRmlsZXNMb2FkZXIgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIHJldHVybiB0aGlzLnVzZUxvYWRlcignJHRyYW5zbGF0ZVN0YXRpY0ZpbGVzTG9hZGVyJywgb3B0aW9ucyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlciN1c2VMb2FkZXJcbiAgICogQG1ldGhvZE9mIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVByb3ZpZGVyXG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBUZWxscyBhbmd1bGFyLXRyYW5zbGF0ZSB0byB1c2UgYW55IG90aGVyIHNlcnZpY2UgYXMgbG9hZGVyLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbG9hZGVyRmFjdG9yeSBGYWN0b3J5IG5hbWUgdG8gdXNlXG4gICAqIEBwYXJhbSB7T2JqZWN0PX0gb3B0aW9ucyBPcHRpb25hbCBjb25maWd1cmF0aW9uIG9iamVjdFxuICAgKi9cbiAgdGhpcy51c2VMb2FkZXIgPSBmdW5jdGlvbiAobG9hZGVyRmFjdG9yeSwgb3B0aW9ucykge1xuICAgICRsb2FkZXJGYWN0b3J5ID0gbG9hZGVyRmFjdG9yeTtcbiAgICAkbG9hZGVyT3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlciN1c2VMb2NhbFN0b3JhZ2VcbiAgICogQG1ldGhvZE9mIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVByb3ZpZGVyXG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBUZWxscyBhbmd1bGFyLXRyYW5zbGF0ZSB0byB1c2UgYCR0cmFuc2xhdGVMb2NhbFN0b3JhZ2VgIHNlcnZpY2UgYXMgc3RvcmFnZSBsYXllci5cbiAgICpcbiAgICovXG4gIHRoaXMudXNlTG9jYWxTdG9yYWdlID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnVzZVN0b3JhZ2UoJyR0cmFuc2xhdGVMb2NhbFN0b3JhZ2UnKTtcbiAgfTtcblxuICAvKipcbiAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAqIEBuYW1lIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVByb3ZpZGVyI3VzZUNvb2tpZVN0b3JhZ2VcbiAgICogQG1ldGhvZE9mIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVByb3ZpZGVyXG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBUZWxscyBhbmd1bGFyLXRyYW5zbGF0ZSB0byB1c2UgYCR0cmFuc2xhdGVDb29raWVTdG9yYWdlYCBzZXJ2aWNlIGFzIHN0b3JhZ2UgbGF5ZXIuXG4gICAqL1xuICB0aGlzLnVzZUNvb2tpZVN0b3JhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMudXNlU3RvcmFnZSgnJHRyYW5zbGF0ZUNvb2tpZVN0b3JhZ2UnKTtcbiAgfTtcblxuICAvKipcbiAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAqIEBuYW1lIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVByb3ZpZGVyI3VzZVN0b3JhZ2VcbiAgICogQG1ldGhvZE9mIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVByb3ZpZGVyXG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBUZWxscyBhbmd1bGFyLXRyYW5zbGF0ZSB0byB1c2UgY3VzdG9tIHNlcnZpY2UgYXMgc3RvcmFnZSBsYXllci5cbiAgICovXG4gIHRoaXMudXNlU3RvcmFnZSA9IGZ1bmN0aW9uIChzdG9yYWdlRmFjdG9yeSkge1xuICAgICRzdG9yYWdlRmFjdG9yeSA9IHN0b3JhZ2VGYWN0b3J5O1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICogQG5hbWUgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlUHJvdmlkZXIjc3RvcmFnZVByZWZpeFxuICAgKiBAbWV0aG9kT2YgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlUHJvdmlkZXJcbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFNldHMgcHJlZml4IGZvciBzdG9yYWdlIGtleS5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHByZWZpeCBTdG9yYWdlIGtleSBwcmVmaXhcbiAgICovXG4gIHRoaXMuc3RvcmFnZVByZWZpeCA9IGZ1bmN0aW9uIChwcmVmaXgpIHtcbiAgICBpZiAoIXByZWZpeCkge1xuICAgICAgcmV0dXJuIHByZWZpeDtcbiAgICB9XG4gICAgJHN0b3JhZ2VQcmVmaXggPSBwcmVmaXg7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlciN1c2VNaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyTG9nXG4gICAqIEBtZXRob2RPZiBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlclxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogVGVsbHMgYW5ndWxhci10cmFuc2xhdGUgdG8gdXNlIGJ1aWx0LWluIGxvZyBoYW5kbGVyIHdoZW4gdHJ5aW5nIHRvIHRyYW5zbGF0ZVxuICAgKiBhIHRyYW5zbGF0aW9uIElkIHdoaWNoIGRvZXNuJ3QgZXhpc3QuXG4gICAqXG4gICAqIFRoaXMgaXMgYWN0dWFsbHkgYSBzaG9ydGN1dCBtZXRob2QgZm9yIGB1c2VNaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyKClgLlxuICAgKlxuICAgKi9cbiAgdGhpcy51c2VNaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyTG9nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnVzZU1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXIoJyR0cmFuc2xhdGVNaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyTG9nJyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlciN1c2VNaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyXG4gICAqIEBtZXRob2RPZiBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlclxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogRXhwZWN0cyBhIGZhY3RvcnkgbmFtZSB3aGljaCBsYXRlciBnZXRzIGluc3RhbnRpYXRlZCB3aXRoIGAkaW5qZWN0b3JgLlxuICAgKiBUaGlzIG1ldGhvZCBjYW4gYmUgdXNlZCB0byB0ZWxsIGFuZ3VsYXItdHJhbnNsYXRlIHRvIHVzZSBhIGN1c3RvbVxuICAgKiBtaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyLiBKdXN0IGJ1aWxkIGEgZmFjdG9yeSB3aGljaCByZXR1cm5zIGEgZnVuY3Rpb25cbiAgICogYW5kIGV4cGVjdHMgYSB0cmFuc2xhdGlvbiBpZCBhcyBhcmd1bWVudC5cbiAgICpcbiAgICogRXhhbXBsZTpcbiAgICogPHByZT5cbiAgICogIGFwcC5jb25maWcoZnVuY3Rpb24gKCR0cmFuc2xhdGVQcm92aWRlcikge1xuICAgKiAgICAkdHJhbnNsYXRlUHJvdmlkZXIudXNlTWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlcignY3VzdG9tSGFuZGxlcicpO1xuICAgKiAgfSk7XG4gICAqXG4gICAqICBhcHAuZmFjdG9yeSgnY3VzdG9tSGFuZGxlcicsIGZ1bmN0aW9uIChkZXAxLCBkZXAyKSB7XG4gICAqICAgIHJldHVybiBmdW5jdGlvbiAodHJhbnNsYXRpb25JZCkge1xuICAgKiAgICAgIC8vIHNvbWV0aGluZyB3aXRoIHRyYW5zbGF0aW9uSWQgYW5kIGRlcDEgYW5kIGRlcDJcbiAgICogICAgfTtcbiAgICogIH0pO1xuICAgKiA8L3ByZT5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZhY3RvcnkgRmFjdG9yeSBuYW1lXG4gICAqL1xuICB0aGlzLnVzZU1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXIgPSBmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgICRtaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyRmFjdG9yeSA9IGZhY3Rvcnk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlciN1c2VQb3N0Q29tcGlsaW5nXG4gICAqIEBtZXRob2RPZiBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlclxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogSWYgcG9zdCBjb21waWxpbmcgaXMgZW5hYmxlZCwgYWxsIHRyYW5zbGF0ZWQgdmFsdWVzIHdpbGwgYmUgcHJvY2Vzc2VkXG4gICAqIGFnYWluIHdpdGggQW5ndWxhckpTJyAkY29tcGlsZS5cbiAgICpcbiAgICogRXhhbXBsZTpcbiAgICogPHByZT5cbiAgICogIGFwcC5jb25maWcoZnVuY3Rpb24gKCR0cmFuc2xhdGVQcm92aWRlcikge1xuICAgKiAgICAkdHJhbnNsYXRlUHJvdmlkZXIudXNlUG9zdENvbXBpbGluZyh0cnVlKTtcbiAgICogIH0pO1xuICAgKiA8L3ByZT5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZhY3RvcnkgRmFjdG9yeSBuYW1lXG4gICAqL1xuICB0aGlzLnVzZVBvc3RDb21waWxpbmcgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAkcG9zdENvbXBpbGluZ0VuYWJsZWQgPSAhKCF2YWx1ZSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlciNkZXRlcm1pbmVQcmVmZXJyZWRMYW5ndWFnZVxuICAgKiBAbWV0aG9kT2YgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlUHJvdmlkZXJcbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFRlbGxzIGFuZ3VsYXItdHJhbnNsYXRlIHRvIHRyeSB0byBkZXRlcm1pbmUgb24gaXRzIG93biB3aGljaCBsYW5ndWFnZSBrZXlcbiAgICogdG8gc2V0IGFzIHByZWZlcnJlZCBsYW5ndWFnZS4gV2hlbiBgZm5gIGlzIGdpdmVuLCBhbmd1bGFyLXRyYW5zbGF0ZSB1c2VzIGl0XG4gICAqIHRvIGRldGVybWluZSBhIGxhbmd1YWdlIGtleSwgb3RoZXJ3aXNlIGl0IHVzZXMgdGhlIGJ1aWx0LWluIGBnZXRMb2NhbGUoKWBcbiAgICogbWV0aG9kLlxuICAgKlxuICAgKiBUaGUgYGdldExvY2FsZSgpYCByZXR1cm5zIGEgbGFuZ3VhZ2Uga2V5IGluIHRoZSBmb3JtYXQgYFtsYW5nXV9bY291bnRyeV1gIG9yXG4gICAqIGBbbGFuZ11gIGRlcGVuZGluZyBvbiB3aGF0IHRoZSBicm93c2VyIHByb3ZpZGVzLlxuICAgKlxuICAgKiBVc2UgdGhpcyBtZXRob2QgYXQgeW91ciBvd24gcmlzaywgc2luY2Ugbm90IGFsbCBicm93c2VycyByZXR1cm4gYSB2YWxpZFxuICAgKiBsb2NhbGUuXG4gICAqXG4gICAqIEBwYXJhbSB7b2JqZWN0PX0gZm4gRnVuY3Rpb24gdG8gZGV0ZXJtaW5lIGEgYnJvd3NlcidzIGxvY2FsZVxuICAgKi9cbiAgdGhpcy5kZXRlcm1pbmVQcmVmZXJyZWRMYW5ndWFnZSA9IGZ1bmN0aW9uIChmbikge1xuXG4gICAgdmFyIGxvY2FsZSA9IChmbiAmJiBhbmd1bGFyLmlzRnVuY3Rpb24oZm4pKSA/IGZuKCkgOiBnZXRMb2NhbGUoKTtcblxuICAgIGlmICghJGF2YWlsYWJsZUxhbmd1YWdlS2V5cy5sZW5ndGgpIHtcbiAgICAgICRwcmVmZXJyZWRMYW5ndWFnZSA9IGxvY2FsZTtcbiAgICB9IGVsc2Uge1xuICAgICAgJHByZWZlcnJlZExhbmd1YWdlID0gbmVnb3RpYXRlTG9jYWxlKGxvY2FsZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlciNyZWdpc3RlckF2YWlsYWJsZUxhbmd1YWdlS2V5c1xuICAgKiBAbWV0aG9kT2YgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlUHJvdmlkZXJcbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFJlZ2lzdGVycyBhIHNldCBvZiBsYW5ndWFnZSBrZXlzIHRoZSBhcHAgd2lsbCB3b3JrIHdpdGguIFVzZSB0aGlzIG1ldGhvZCBpblxuICAgKiBjb21iaW5hdGlvbiB3aXRoXG4gICAqIHtAbGluayBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlciNkZXRlcm1pbmVQcmVmZXJyZWRMYW5ndWFnZSBkZXRlcm1pbmVQcmVmZXJyZWRMYW5ndWFnZX0uXG4gICAqIFdoZW4gYXZhaWxhYmxlIGxhbmd1YWdlcyBrZXlzIGFyZSByZWdpc3RlcmVkLCBhbmd1bGFyLXRyYW5zbGF0ZVxuICAgKiB0cmllcyB0byBmaW5kIHRoZSBiZXN0IGZpdHRpbmcgbGFuZ3VhZ2Uga2V5IGRlcGVuZGluZyBvbiB0aGUgYnJvd3NlcnMgbG9jYWxlLFxuICAgKiBjb25zaWRlcmluZyB5b3VyIGxhbmd1YWdlIGtleSBjb252ZW50aW9uLlxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdH0gbGFuZ3VhZ2VLZXlzIEFycmF5IG9mIGxhbmd1YWdlIGtleXMgdGhlIHlvdXIgYXBwIHdpbGwgdXNlXG4gICAqIEBwYXJhbSB7b2JqZWN0PX0gYWxpYXNlcyBBbGlhcyBtYXAuXG4gICAqL1xuICB0aGlzLnJlZ2lzdGVyQXZhaWxhYmxlTGFuZ3VhZ2VLZXlzID0gZnVuY3Rpb24gKGxhbmd1YWdlS2V5cywgYWxpYXNlcykge1xuICAgIGlmIChsYW5ndWFnZUtleXMpIHtcbiAgICAgICRhdmFpbGFibGVMYW5ndWFnZUtleXMgPSBsYW5ndWFnZUtleXM7XG4gICAgICBpZiAoYWxpYXNlcykge1xuICAgICAgICAkbGFuZ3VhZ2VLZXlBbGlhc2VzID0gYWxpYXNlcztcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICByZXR1cm4gJGF2YWlsYWJsZUxhbmd1YWdlS2V5cztcbiAgfTtcblxuICAvKipcbiAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAqIEBuYW1lIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVByb3ZpZGVyI3VzZUxvYWRlckNhY2hlXG4gICAqIEBtZXRob2RPZiBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlclxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogUmVnaXN0ZXJzIGEgY2FjaGUgZm9yIGludGVybmFsICRodHRwIGJhc2VkIGxvYWRlcnMuXG4gICAqIHtAbGluayBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlciNkZXRlcm1pbmVQcmVmZXJyZWRMYW5ndWFnZSBkZXRlcm1pbmVQcmVmZXJyZWRMYW5ndWFnZX0uXG4gICAqIFdoZW4gZmFsc2UgdGhlIGNhY2hlIHdpbGwgYmUgZGlzYWJsZWQgKGRlZmF1bHQpLiBXaGVuIHRydWUgb3IgdW5kZWZpbmVkXG4gICAqIHRoZSBjYWNoZSB3aWxsIGJlIGEgZGVmYXVsdCAoc2VlICRjYWNoZUZhY3RvcnkpLiBXaGVuIGFuIG9iamVjdCBpdCB3aWxsXG4gICAqIGJlIHRyZWF0IGFzIGEgY2FjaGUgb2JqZWN0IGl0c2VsZjogdGhlIHVzYWdlIGlzICRodHRwKHtjYWNoZTogY2FjaGV9KVxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdH0gY2FjaGUgYm9vbGVhbiwgc3RyaW5nIG9yIGNhY2hlLW9iamVjdFxuICAgKi9cbiAgdGhpcy51c2VMb2FkZXJDYWNoZSA9IGZ1bmN0aW9uIChjYWNoZSkge1xuICAgIGlmIChjYWNoZSA9PT0gZmFsc2UpIHtcbiAgICAgIC8vIGRpc2FibGUgY2FjaGVcbiAgICAgIGxvYWRlckNhY2hlID0gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSBpZiAoY2FjaGUgPT09IHRydWUpIHtcbiAgICAgIC8vIGVuYWJsZSBjYWNoZSB1c2luZyBBSlMgZGVmYXVsdHNcbiAgICAgIGxvYWRlckNhY2hlID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZihjYWNoZSkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAvLyBlbmFibGUgY2FjaGUgdXNpbmcgZGVmYXVsdFxuICAgICAgbG9hZGVyQ2FjaGUgPSAnJHRyYW5zbGF0aW9uQ2FjaGUnO1xuICAgIH0gZWxzZSBpZiAoY2FjaGUpIHtcbiAgICAgIC8vIGVuYWJsZSBjYWNoZSB1c2luZyBnaXZlbiBvbmUgKHNlZSAkY2FjaGVGYWN0b3J5KVxuICAgICAgbG9hZGVyQ2FjaGUgPSBjYWNoZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVQcm92aWRlciNkaXJlY3RpdmVQcmlvcml0eVxuICAgKiBAbWV0aG9kT2YgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlUHJvdmlkZXJcbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFNldHMgdGhlIGRlZmF1bHQgcHJpb3JpdHkgb2YgdGhlIHRyYW5zbGF0ZSBkaXJlY3RpdmUuIFRoZSBzdGFuZGFyZCB2YWx1ZSBpcyBgMGAuXG4gICAqIENhbGxpbmcgdGhpcyBmdW5jdGlvbiB3aXRob3V0IGFuIGFyZ3VtZW50IHdpbGwgcmV0dXJuIHRoZSBjdXJyZW50IHZhbHVlLlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gcHJpb3JpdHkgZm9yIHRoZSB0cmFuc2xhdGUtZGlyZWN0aXZlXG4gICAqL1xuICB0aGlzLmRpcmVjdGl2ZVByaW9yaXR5ID0gZnVuY3Rpb24gKHByaW9yaXR5KSB7XG4gICAgaWYgKHByaW9yaXR5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIGdldHRlclxuICAgICAgcmV0dXJuIGRpcmVjdGl2ZVByaW9yaXR5O1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBzZXR0ZXIgd2l0aCBjaGFpbmluZ1xuICAgICAgZGlyZWN0aXZlUHJpb3JpdHkgPSBwcmlvcml0eTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogQG5nZG9jIG9iamVjdFxuICAgKiBAbmFtZSBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVcbiAgICogQHJlcXVpcmVzICRpbnRlcnBvbGF0ZVxuICAgKiBAcmVxdWlyZXMgJGxvZ1xuICAgKiBAcmVxdWlyZXMgJHJvb3RTY29wZVxuICAgKiBAcmVxdWlyZXMgJHFcbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFRoZSBgJHRyYW5zbGF0ZWAgc2VydmljZSBpcyB0aGUgYWN0dWFsIGNvcmUgb2YgYW5ndWxhci10cmFuc2xhdGUuIEl0IGV4cGVjdHMgYSB0cmFuc2xhdGlvbiBpZFxuICAgKiBhbmQgb3B0aW9uYWwgaW50ZXJwb2xhdGUgcGFyYW1ldGVycyB0byB0cmFuc2xhdGUgY29udGVudHMuXG4gICAqXG4gICAqIDxwcmU+XG4gICAqICAkdHJhbnNsYXRlKCdIRUFETElORV9URVhUJykudGhlbihmdW5jdGlvbiAodHJhbnNsYXRpb24pIHtcbiAgICogICAgJHNjb3BlLnRyYW5zbGF0ZWRUZXh0ID0gdHJhbnNsYXRpb247XG4gICAqICB9KTtcbiAgICogPC9wcmU+XG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfGFycmF5fSB0cmFuc2xhdGlvbklkIEEgdG9rZW4gd2hpY2ggcmVwcmVzZW50cyBhIHRyYW5zbGF0aW9uIGlkXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRoaXMgY2FuIGJlIG9wdGlvbmFsbHkgYW4gYXJyYXkgb2YgdHJhbnNsYXRpb24gaWRzIHdoaWNoXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMgdGhhdCB0aGUgZnVuY3Rpb24gcmV0dXJucyBhbiBvYmplY3Qgd2hlcmUgZWFjaCBrZXlcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXMgdGhlIHRyYW5zbGF0aW9uIGlkIGFuZCB0aGUgdmFsdWUgdGhlIHRyYW5zbGF0aW9uLlxuICAgKiBAcGFyYW0ge29iamVjdD19IGludGVycG9sYXRlUGFyYW1zIEFuIG9iamVjdCBoYXNoIGZvciBkeW5hbWljIHZhbHVlc1xuICAgKiBAcGFyYW0ge3N0cmluZ30gaW50ZXJwb2xhdGlvbklkIFRoZSBpZCBvZiB0aGUgaW50ZXJwb2xhdGlvbiB0byB1c2VcbiAgICogQHJldHVybnMge29iamVjdH0gcHJvbWlzZVxuICAgKi9cbiAgdGhpcy4kZ2V0ID0gW1xuICAgICckbG9nJyxcbiAgICAnJGluamVjdG9yJyxcbiAgICAnJHJvb3RTY29wZScsXG4gICAgJyRxJyxcbiAgICBmdW5jdGlvbiAoJGxvZywgJGluamVjdG9yLCAkcm9vdFNjb3BlLCAkcSkge1xuXG4gICAgICB2YXIgU3RvcmFnZSxcbiAgICAgICAgICBkZWZhdWx0SW50ZXJwb2xhdG9yID0gJGluamVjdG9yLmdldCgkaW50ZXJwb2xhdGlvbkZhY3RvcnkgfHwgJyR0cmFuc2xhdGVEZWZhdWx0SW50ZXJwb2xhdGlvbicpLFxuICAgICAgICAgIHBlbmRpbmdMb2FkZXIgPSBmYWxzZSxcbiAgICAgICAgICBpbnRlcnBvbGF0b3JIYXNoTWFwID0ge30sXG4gICAgICAgICAgbGFuZ1Byb21pc2VzID0ge30sXG4gICAgICAgICAgZmFsbGJhY2tJbmRleCxcbiAgICAgICAgICBzdGFydEZhbGxiYWNrSXRlcmF0aW9uO1xuXG4gICAgICB2YXIgJHRyYW5zbGF0ZSA9IGZ1bmN0aW9uICh0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgaW50ZXJwb2xhdGlvbklkLCBkZWZhdWx0VHJhbnNsYXRpb25UZXh0KSB7XG5cbiAgICAgICAgLy8gRHVjayBkZXRlY3Rpb246IElmIHRoZSBmaXJzdCBhcmd1bWVudCBpcyBhbiBhcnJheSwgYSBidW5jaCBvZiB0cmFuc2xhdGlvbnMgd2FzIHJlcXVlc3RlZC5cbiAgICAgICAgLy8gVGhlIHJlc3VsdCBpcyBhbiBvYmplY3QuXG4gICAgICAgIGlmIChhbmd1bGFyLmlzQXJyYXkodHJhbnNsYXRpb25JZCkpIHtcbiAgICAgICAgICAvLyBJbnNwaXJlZCBieSBRLmFsbFNldHRsZWQgYnkgS3JpcyBLb3dhbFxuICAgICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9rcmlza293YWwvcS9ibG9iL2IwZmE3Mjk4MDcxN2RjMjAyZmZjM2NiZjAzYjkzNmUxMGViYmI5ZDcvcS5qcyNMMTU1My0xNTYzXG4gICAgICAgICAgLy8gVGhpcyB0cmFuc2Zvcm1zIGFsbCBwcm9taXNlcyByZWdhcmRsZXNzIHJlc29sdmVkIG9yIHJlamVjdGVkXG4gICAgICAgICAgdmFyIHRyYW5zbGF0ZUFsbCA9IGZ1bmN0aW9uICh0cmFuc2xhdGlvbklkcykge1xuICAgICAgICAgICAgdmFyIHJlc3VsdHMgPSB7fTsgLy8gc3RvcmluZyB0aGUgYWN0dWFsIHJlc3VsdHNcbiAgICAgICAgICAgIHZhciBwcm9taXNlcyA9IFtdOyAvLyBwcm9taXNlcyB0byB3YWl0IGZvclxuICAgICAgICAgICAgLy8gV3JhcHMgdGhlIHByb21pc2UgYSkgYmVpbmcgYWx3YXlzIHJlc29sdmVkIGFuZCBiKSBzdG9yaW5nIHRoZSBsaW5rIGlkLT52YWx1ZVxuICAgICAgICAgICAgdmFyIHRyYW5zbGF0ZSA9IGZ1bmN0aW9uICh0cmFuc2xhdGlvbklkKSB7XG4gICAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICAgIHZhciByZWdhcmRsZXNzID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0c1t0cmFuc2xhdGlvbklkXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoW3RyYW5zbGF0aW9uSWQsIHZhbHVlXSk7XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIC8vIHdlIGRvbid0IGNhcmUgd2hldGhlciB0aGUgcHJvbWlzZSB3YXMgcmVzb2x2ZWQgb3IgcmVqZWN0ZWQ7IGp1c3Qgc3RvcmUgdGhlIHZhbHVlc1xuICAgICAgICAgICAgICAkdHJhbnNsYXRlKHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zLCBpbnRlcnBvbGF0aW9uSWQsIGRlZmF1bHRUcmFuc2xhdGlvblRleHQpLnRoZW4ocmVnYXJkbGVzcywgcmVnYXJkbGVzcyk7XG4gICAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBjID0gdHJhbnNsYXRpb25JZHMubGVuZ3RoOyBpIDwgYzsgaSsrKSB7XG4gICAgICAgICAgICAgIHByb21pc2VzLnB1c2godHJhbnNsYXRlKHRyYW5zbGF0aW9uSWRzW2ldKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyB3YWl0IGZvciBhbGwgKGluY2x1ZGluZyBzdG9yaW5nIHRvIHJlc3VsdHMpXG4gICAgICAgICAgICByZXR1cm4gJHEuYWxsKHByb21pc2VzKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSByZXN1bHRzXG4gICAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgICByZXR1cm4gdHJhbnNsYXRlQWxsKHRyYW5zbGF0aW9uSWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgICAvLyB0cmltIG9mZiBhbnkgd2hpdGVzcGFjZVxuICAgICAgICBpZiAodHJhbnNsYXRpb25JZCkge1xuICAgICAgICAgIHRyYW5zbGF0aW9uSWQgPSB0cmltLmFwcGx5KHRyYW5zbGF0aW9uSWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHByb21pc2VUb1dhaXRGb3IgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHZhciBwcm9taXNlID0gJHByZWZlcnJlZExhbmd1YWdlID9cbiAgICAgICAgICAgIGxhbmdQcm9taXNlc1skcHJlZmVycmVkTGFuZ3VhZ2VdIDpcbiAgICAgICAgICAgIGxhbmdQcm9taXNlc1skdXNlc107XG5cbiAgICAgICAgICBmYWxsYmFja0luZGV4ID0gMDtcblxuICAgICAgICAgIGlmICgkc3RvcmFnZUZhY3RvcnkgJiYgIXByb21pc2UpIHtcbiAgICAgICAgICAgIC8vIGxvb2tzIGxpa2UgdGhlcmUncyBubyBwZW5kaW5nIHByb21pc2UgZm9yICRwcmVmZXJyZWRMYW5ndWFnZSBvclxuICAgICAgICAgICAgLy8gJHVzZXMuIE1heWJlIHRoZXJlJ3Mgb25lIHBlbmRpbmcgZm9yIGEgbGFuZ3VhZ2UgdGhhdCBjb21lcyBmcm9tXG4gICAgICAgICAgICAvLyBzdG9yYWdlLlxuICAgICAgICAgICAgdmFyIGxhbmdLZXkgPSBTdG9yYWdlLmdldCgkc3RvcmFnZUtleSk7XG4gICAgICAgICAgICBwcm9taXNlID0gbGFuZ1Byb21pc2VzW2xhbmdLZXldO1xuXG4gICAgICAgICAgICBpZiAoJGZhbGxiYWNrTGFuZ3VhZ2UgJiYgJGZhbGxiYWNrTGFuZ3VhZ2UubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gaW5kZXhPZigkZmFsbGJhY2tMYW5ndWFnZSwgbGFuZ0tleSk7XG4gICAgICAgICAgICAgICAgLy8gbWF5YmUgdGhlIGxhbmd1YWdlIGZyb20gc3RvcmFnZSBpcyBhbHNvIGRlZmluZWQgYXMgZmFsbGJhY2sgbGFuZ3VhZ2VcbiAgICAgICAgICAgICAgICAvLyB3ZSBpbmNyZWFzZSB0aGUgZmFsbGJhY2sgbGFuZ3VhZ2UgaW5kZXggdG8gbm90IHNlYXJjaCBpbiB0aGF0IGxhbmd1YWdlXG4gICAgICAgICAgICAgICAgLy8gYXMgZmFsbGJhY2ssIHNpbmNlIGl0J3MgcHJvYmFibHkgdGhlIGZpcnN0IHVzZWQgbGFuZ3VhZ2VcbiAgICAgICAgICAgICAgICAvLyBpbiB0aGF0IGNhc2UgdGhlIGluZGV4IHN0YXJ0cyBhZnRlciB0aGUgZmlyc3QgZWxlbWVudFxuICAgICAgICAgICAgICAgIGZhbGxiYWNrSW5kZXggPSAoaW5kZXggPT09IDApID8gMSA6IDA7XG5cbiAgICAgICAgICAgICAgICAvLyBidXQgd2UgY2FuIG1ha2Ugc3VyZSB0byBBTFdBWVMgZmFsbGJhY2sgdG8gcHJlZmVycmVkIGxhbmd1YWdlIGF0IGxlYXN0XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4T2YoJGZhbGxiYWNrTGFuZ3VhZ2UsICRwcmVmZXJyZWRMYW5ndWFnZSkgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAkZmFsbGJhY2tMYW5ndWFnZS5wdXNoKCRwcmVmZXJyZWRMYW5ndWFnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgICAgfSgpKTtcblxuICAgICAgICBpZiAoIXByb21pc2VUb1dhaXRGb3IpIHtcbiAgICAgICAgICAvLyBubyBwcm9taXNlIHRvIHdhaXQgZm9yPyBva2F5LiBUaGVuIHRoZXJlJ3Mgbm8gbG9hZGVyIHJlZ2lzdGVyZWRcbiAgICAgICAgICAvLyBub3IgaXMgYSBvbmUgcGVuZGluZyBmb3IgbGFuZ3VhZ2UgdGhhdCBjb21lcyBmcm9tIHN0b3JhZ2UuXG4gICAgICAgICAgLy8gV2UgY2FuIGp1c3QgdHJhbnNsYXRlLlxuICAgICAgICAgIGRldGVybWluZVRyYW5zbGF0aW9uKHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zLCBpbnRlcnBvbGF0aW9uSWQsIGRlZmF1bHRUcmFuc2xhdGlvblRleHQpLnRoZW4oZGVmZXJyZWQucmVzb2x2ZSwgZGVmZXJyZWQucmVqZWN0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwcm9taXNlVG9XYWl0Rm9yLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZGV0ZXJtaW5lVHJhbnNsYXRpb24odHJhbnNsYXRpb25JZCwgaW50ZXJwb2xhdGVQYXJhbXMsIGludGVycG9sYXRpb25JZCwgZGVmYXVsdFRyYW5zbGF0aW9uVGV4dCkudGhlbihkZWZlcnJlZC5yZXNvbHZlLCBkZWZlcnJlZC5yZWplY3QpO1xuICAgICAgICAgIH0sIGRlZmVycmVkLnJlamVjdCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICB9O1xuXG4gICAgICAvKipcbiAgICAgICAqIEBuYW1lIGFwcGx5Tm90Rm91bmRJbmRpY2F0b3JzXG4gICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICpcbiAgICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAgICogQXBwbGllcyBub3QgZm91bnQgaW5kaWNhdG9ycyB0byBnaXZlbiB0cmFuc2xhdGlvbiBpZCwgaWYgbmVlZGVkLlxuICAgICAgICogVGhpcyBmdW5jdGlvbiBnZXRzIG9ubHkgZXhlY3V0ZWQsIGlmIGEgdHJhbnNsYXRpb24gaWQgZG9lc24ndCBleGlzdCxcbiAgICAgICAqIHdoaWNoIGlzIHdoeSBhIHRyYW5zbGF0aW9uIGlkIGlzIGV4cGVjdGVkIGFzIGFyZ3VtZW50LlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0cmFuc2xhdGlvbklkIFRyYW5zbGF0aW9uIGlkLlxuICAgICAgICogQHJldHVybnMge3N0cmluZ30gU2FtZSBhcyBnaXZlbiB0cmFuc2xhdGlvbiBpZCBidXQgYXBwbGllZCB3aXRoIG5vdCBmb3VuZFxuICAgICAgICogaW5kaWNhdG9ycy5cbiAgICAgICAqL1xuICAgICAgdmFyIGFwcGx5Tm90Rm91bmRJbmRpY2F0b3JzID0gZnVuY3Rpb24gKHRyYW5zbGF0aW9uSWQpIHtcbiAgICAgICAgLy8gYXBwbHlpbmcgbm90Rm91bmRJbmRpY2F0b3JzXG4gICAgICAgIGlmICgkbm90Rm91bmRJbmRpY2F0b3JMZWZ0KSB7XG4gICAgICAgICAgdHJhbnNsYXRpb25JZCA9IFskbm90Rm91bmRJbmRpY2F0b3JMZWZ0LCB0cmFuc2xhdGlvbklkXS5qb2luKCcgJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCRub3RGb3VuZEluZGljYXRvclJpZ2h0KSB7XG4gICAgICAgICAgdHJhbnNsYXRpb25JZCA9IFt0cmFuc2xhdGlvbklkLCAkbm90Rm91bmRJbmRpY2F0b3JSaWdodF0uam9pbignICcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cmFuc2xhdGlvbklkO1xuICAgICAgfTtcblxuICAgICAgLyoqXG4gICAgICAgKiBAbmFtZSB1c2VMYW5ndWFnZVxuICAgICAgICogQHByaXZhdGVcbiAgICAgICAqXG4gICAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgICAqIE1ha2VzIGFjdHVhbCB1c2Ugb2YgYSBsYW5ndWFnZSBieSBzZXR0aW5nIGEgZ2l2ZW4gbGFuZ3VhZ2Uga2V5IGFzIHVzZWRcbiAgICAgICAqIGxhbmd1YWdlIGFuZCBpbmZvcm1zIHJlZ2lzdGVyZWQgaW50ZXJwb2xhdG9ycyB0byBhbHNvIHVzZSB0aGUgZ2l2ZW5cbiAgICAgICAqIGtleSBhcyBsb2NhbGUuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtrZXl9IExvY2FsZSBrZXkuXG4gICAgICAgKi9cbiAgICAgIHZhciB1c2VMYW5ndWFnZSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgJHVzZXMgPSBrZXk7XG4gICAgICAgICRyb290U2NvcGUuJGVtaXQoJyR0cmFuc2xhdGVDaGFuZ2VTdWNjZXNzJywge2xhbmd1YWdlOiBrZXl9KTtcblxuICAgICAgICBpZiAoJHN0b3JhZ2VGYWN0b3J5KSB7XG4gICAgICAgICAgU3RvcmFnZS5wdXQoJHRyYW5zbGF0ZS5zdG9yYWdlS2V5KCksICR1c2VzKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBpbmZvcm0gZGVmYXVsdCBpbnRlcnBvbGF0b3JcbiAgICAgICAgZGVmYXVsdEludGVycG9sYXRvci5zZXRMb2NhbGUoJHVzZXMpO1xuICAgICAgICAvLyBpbmZvcm0gYWxsIG90aGVycyB0b28hXG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaChpbnRlcnBvbGF0b3JIYXNoTWFwLCBmdW5jdGlvbiAoaW50ZXJwb2xhdG9yLCBpZCkge1xuICAgICAgICAgIGludGVycG9sYXRvckhhc2hNYXBbaWRdLnNldExvY2FsZSgkdXNlcyk7XG4gICAgICAgIH0pO1xuICAgICAgICAkcm9vdFNjb3BlLiRlbWl0KCckdHJhbnNsYXRlQ2hhbmdlRW5kJywge2xhbmd1YWdlOiBrZXl9KTtcbiAgICAgIH07XG5cbiAgICAgIC8qKlxuICAgICAgICogQG5hbWUgbG9hZEFzeW5jXG4gICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICpcbiAgICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAgICogS2lja3Mgb2YgcmVnaXN0ZXJlZCBhc3luYyBsb2FkZXIgdXNpbmcgYCRpbmplY3RvcmAgYW5kIGFwcGxpZXMgZXhpc3RpbmdcbiAgICAgICAqIGxvYWRlciBvcHRpb25zLiBXaGVuIHJlc29sdmVkLCBpdCB1cGRhdGVzIHRyYW5zbGF0aW9uIHRhYmxlcyBhY2NvcmRpbmdseVxuICAgICAgICogb3IgcmVqZWN0cyB3aXRoIGdpdmVuIGxhbmd1YWdlIGtleS5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IExhbmd1YWdlIGtleS5cbiAgICAgICAqIEByZXR1cm4ge1Byb21pc2V9IEEgcHJvbWlzZS5cbiAgICAgICAqL1xuICAgICAgdmFyIGxvYWRBc3luYyA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICB0aHJvdyAnTm8gbGFuZ3VhZ2Uga2V5IHNwZWNpZmllZCBmb3IgbG9hZGluZy4nO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgICAkcm9vdFNjb3BlLiRlbWl0KCckdHJhbnNsYXRlTG9hZGluZ1N0YXJ0Jywge2xhbmd1YWdlOiBrZXl9KTtcbiAgICAgICAgcGVuZGluZ0xvYWRlciA9IHRydWU7XG5cbiAgICAgICAgdmFyIGNhY2hlID0gbG9hZGVyQ2FjaGU7XG4gICAgICAgIGlmICh0eXBlb2YoY2FjaGUpID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIC8vIGdldHRpbmcgb24tZGVtYW5kIGluc3RhbmNlIG9mIGxvYWRlclxuICAgICAgICAgIGNhY2hlID0gJGluamVjdG9yLmdldChjYWNoZSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbG9hZGVyT3B0aW9ucyA9IGFuZ3VsYXIuZXh0ZW5kKHt9LCAkbG9hZGVyT3B0aW9ucywge1xuICAgICAgICAgIGtleToga2V5LFxuICAgICAgICAgICRodHRwOiBhbmd1bGFyLmV4dGVuZCh7fSwge1xuICAgICAgICAgICAgY2FjaGU6IGNhY2hlXG4gICAgICAgICAgfSwgJGxvYWRlck9wdGlvbnMuJGh0dHApXG4gICAgICAgIH0pO1xuXG4gICAgICAgICRpbmplY3Rvci5nZXQoJGxvYWRlckZhY3RvcnkpKGxvYWRlck9wdGlvbnMpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICB2YXIgdHJhbnNsYXRpb25UYWJsZSA9IHt9O1xuICAgICAgICAgICRyb290U2NvcGUuJGVtaXQoJyR0cmFuc2xhdGVMb2FkaW5nU3VjY2VzcycsIHtsYW5ndWFnZToga2V5fSk7XG5cbiAgICAgICAgICBpZiAoYW5ndWxhci5pc0FycmF5KGRhdGEpKSB7XG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goZGF0YSwgZnVuY3Rpb24gKHRhYmxlKSB7XG4gICAgICAgICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHRyYW5zbGF0aW9uVGFibGUsIGZsYXRPYmplY3QodGFibGUpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhbmd1bGFyLmV4dGVuZCh0cmFuc2xhdGlvblRhYmxlLCBmbGF0T2JqZWN0KGRhdGEpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcGVuZGluZ0xvYWRlciA9IGZhbHNlO1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoe1xuICAgICAgICAgICAga2V5OiBrZXksXG4gICAgICAgICAgICB0YWJsZTogdHJhbnNsYXRpb25UYWJsZVxuICAgICAgICAgIH0pO1xuICAgICAgICAgICRyb290U2NvcGUuJGVtaXQoJyR0cmFuc2xhdGVMb2FkaW5nRW5kJywge2xhbmd1YWdlOiBrZXl9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICRyb290U2NvcGUuJGVtaXQoJyR0cmFuc2xhdGVMb2FkaW5nRXJyb3InLCB7bGFuZ3VhZ2U6IGtleX0pO1xuICAgICAgICAgIGRlZmVycmVkLnJlamVjdChrZXkpO1xuICAgICAgICAgICRyb290U2NvcGUuJGVtaXQoJyR0cmFuc2xhdGVMb2FkaW5nRW5kJywge2xhbmd1YWdlOiBrZXl9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgfTtcblxuICAgICAgaWYgKCRzdG9yYWdlRmFjdG9yeSkge1xuICAgICAgICBTdG9yYWdlID0gJGluamVjdG9yLmdldCgkc3RvcmFnZUZhY3RvcnkpO1xuXG4gICAgICAgIGlmICghU3RvcmFnZS5nZXQgfHwgIVN0b3JhZ2UucHV0KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZG5cXCd0IHVzZSBzdG9yYWdlIFxcJycgKyAkc3RvcmFnZUZhY3RvcnkgKyAnXFwnLCBtaXNzaW5nIGdldCgpIG9yIHB1dCgpIG1ldGhvZCEnKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBhcHBseSBhZGRpdGlvbmFsIHNldHRpbmdzXG4gICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKGRlZmF1bHRJbnRlcnBvbGF0b3IudXNlU2FuaXRpemVWYWx1ZVN0cmF0ZWd5KSkge1xuICAgICAgICBkZWZhdWx0SW50ZXJwb2xhdG9yLnVzZVNhbml0aXplVmFsdWVTdHJhdGVneSgkaW50ZXJwb2xhdGlvblNhbml0aXphdGlvblN0cmF0ZWd5KTtcbiAgICAgIH1cblxuICAgICAgLy8gaWYgd2UgaGF2ZSBhZGRpdGlvbmFsIGludGVycG9sYXRpb25zIHRoYXQgd2VyZSBhZGRlZCB2aWFcbiAgICAgIC8vICR0cmFuc2xhdGVQcm92aWRlci5hZGRJbnRlcnBvbGF0aW9uKCksIHdlIGhhdmUgdG8gbWFwJ2VtXG4gICAgICBpZiAoJGludGVycG9sYXRvckZhY3Rvcmllcy5sZW5ndGgpIHtcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKCRpbnRlcnBvbGF0b3JGYWN0b3JpZXMsIGZ1bmN0aW9uIChpbnRlcnBvbGF0b3JGYWN0b3J5KSB7XG4gICAgICAgICAgdmFyIGludGVycG9sYXRvciA9ICRpbmplY3Rvci5nZXQoaW50ZXJwb2xhdG9yRmFjdG9yeSk7XG4gICAgICAgICAgLy8gc2V0dGluZyBpbml0aWFsIGxvY2FsZSBmb3IgZWFjaCBpbnRlcnBvbGF0aW9uIHNlcnZpY2VcbiAgICAgICAgICBpbnRlcnBvbGF0b3Iuc2V0TG9jYWxlKCRwcmVmZXJyZWRMYW5ndWFnZSB8fCAkdXNlcyk7XG4gICAgICAgICAgLy8gYXBwbHkgYWRkaXRpb25hbCBzZXR0aW5nc1xuICAgICAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24oaW50ZXJwb2xhdG9yLnVzZVNhbml0aXplVmFsdWVTdHJhdGVneSkpIHtcbiAgICAgICAgICAgIGludGVycG9sYXRvci51c2VTYW5pdGl6ZVZhbHVlU3RyYXRlZ3koJGludGVycG9sYXRpb25TYW5pdGl6YXRpb25TdHJhdGVneSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIG1ha2UnZW0gcmVjb2duaXphYmxlIHRocm91Z2ggaWRcbiAgICAgICAgICBpbnRlcnBvbGF0b3JIYXNoTWFwW2ludGVycG9sYXRvci5nZXRJbnRlcnBvbGF0aW9uSWRlbnRpZmllcigpXSA9IGludGVycG9sYXRvcjtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQG5hbWUgZ2V0VHJhbnNsYXRpb25UYWJsZVxuICAgICAgICogQHByaXZhdGVcbiAgICAgICAqXG4gICAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgICAqIFJldHVybnMgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gdGhlIHRyYW5zbGF0aW9uIHRhYmxlXG4gICAgICAgKiBvciBpcyByZWplY3RlZCBpZiBhbiBlcnJvciBvY2N1cnJlZC5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0gbGFuZ0tleVxuICAgICAgICogQHJldHVybnMge1EucHJvbWlzZX1cbiAgICAgICAqL1xuICAgICAgdmFyIGdldFRyYW5zbGF0aW9uVGFibGUgPSBmdW5jdGlvbiAobGFuZ0tleSkge1xuICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKCR0cmFuc2xhdGlvblRhYmxlLCBsYW5nS2V5KSkge1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoJHRyYW5zbGF0aW9uVGFibGVbbGFuZ0tleV0pO1xuICAgICAgICB9IGVsc2UgaWYgKGxhbmdQcm9taXNlc1tsYW5nS2V5XSkge1xuICAgICAgICAgIGxhbmdQcm9taXNlc1tsYW5nS2V5XS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICB0cmFuc2xhdGlvbnMoZGF0YS5rZXksIGRhdGEudGFibGUpO1xuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhLnRhYmxlKTtcbiAgICAgICAgICB9LCBkZWZlcnJlZC5yZWplY3QpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgfTtcblxuICAgICAgLyoqXG4gICAgICAgKiBAbmFtZSBnZXRGYWxsYmFja1RyYW5zbGF0aW9uXG4gICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICpcbiAgICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAgICogUmV0dXJucyBhIHByb21pc2UgdGhhdCB3aWxsIHJlc29sdmUgdG8gdGhlIHRyYW5zbGF0aW9uXG4gICAgICAgKiBvciBiZSByZWplY3RlZCBpZiBubyB0cmFuc2xhdGlvbiB3YXMgZm91bmQgZm9yIHRoZSBsYW5ndWFnZS5cbiAgICAgICAqIFRoaXMgZnVuY3Rpb24gaXMgY3VycmVudGx5IG9ubHkgdXNlZCBmb3IgZmFsbGJhY2sgbGFuZ3VhZ2UgdHJhbnNsYXRpb24uXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIGxhbmdLZXkgVGhlIGxhbmd1YWdlIHRvIHRyYW5zbGF0ZSB0by5cbiAgICAgICAqIEBwYXJhbSB0cmFuc2xhdGlvbklkXG4gICAgICAgKiBAcGFyYW0gaW50ZXJwb2xhdGVQYXJhbXNcbiAgICAgICAqIEBwYXJhbSBJbnRlcnBvbGF0b3JcbiAgICAgICAqIEByZXR1cm5zIHtRLnByb21pc2V9XG4gICAgICAgKi9cbiAgICAgIHZhciBnZXRGYWxsYmFja1RyYW5zbGF0aW9uID0gZnVuY3Rpb24gKGxhbmdLZXksIHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zLCBJbnRlcnBvbGF0b3IpIHtcbiAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgICBnZXRUcmFuc2xhdGlvblRhYmxlKGxhbmdLZXkpLnRoZW4oZnVuY3Rpb24gKHRyYW5zbGF0aW9uVGFibGUpIHtcbiAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRyYW5zbGF0aW9uVGFibGUsIHRyYW5zbGF0aW9uSWQpKSB7XG4gICAgICAgICAgICBJbnRlcnBvbGF0b3Iuc2V0TG9jYWxlKGxhbmdLZXkpO1xuICAgICAgICAgICAgdmFyIHRyYW5zbGF0aW9uID0gdHJhbnNsYXRpb25UYWJsZVt0cmFuc2xhdGlvbklkXTtcbiAgICAgICAgICAgIGlmICh0cmFuc2xhdGlvbi5zdWJzdHIoMCwgMikgPT09ICdAOicpIHtcbiAgICAgICAgICAgICAgZ2V0RmFsbGJhY2tUcmFuc2xhdGlvbihsYW5nS2V5LCB0cmFuc2xhdGlvbi5zdWJzdHIoMiksIGludGVycG9sYXRlUGFyYW1zLCBJbnRlcnBvbGF0b3IpXG4gICAgICAgICAgICAgICAgLnRoZW4oZGVmZXJyZWQucmVzb2x2ZSwgZGVmZXJyZWQucmVqZWN0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoSW50ZXJwb2xhdG9yLmludGVycG9sYXRlKHRyYW5zbGF0aW9uVGFibGVbdHJhbnNsYXRpb25JZF0sIGludGVycG9sYXRlUGFyYW1zKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBJbnRlcnBvbGF0b3Iuc2V0TG9jYWxlKCR1c2VzKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBkZWZlcnJlZC5yZWplY3QpO1xuXG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgfTtcblxuICAgICAgLyoqXG4gICAgICAgKiBAbmFtZSBnZXRGYWxsYmFja1RyYW5zbGF0aW9uSW5zdGFudFxuICAgICAgICogQHByaXZhdGVcbiAgICAgICAqXG4gICAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgICAqIFJldHVybnMgYSB0cmFuc2xhdGlvblxuICAgICAgICogVGhpcyBmdW5jdGlvbiBpcyBjdXJyZW50bHkgb25seSB1c2VkIGZvciBmYWxsYmFjayBsYW5ndWFnZSB0cmFuc2xhdGlvbi5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0gbGFuZ0tleSBUaGUgbGFuZ3VhZ2UgdG8gdHJhbnNsYXRlIHRvLlxuICAgICAgICogQHBhcmFtIHRyYW5zbGF0aW9uSWRcbiAgICAgICAqIEBwYXJhbSBpbnRlcnBvbGF0ZVBhcmFtc1xuICAgICAgICogQHBhcmFtIEludGVycG9sYXRvclxuICAgICAgICogQHJldHVybnMge3N0cmluZ30gdHJhbnNsYXRpb25cbiAgICAgICAqL1xuICAgICAgdmFyIGdldEZhbGxiYWNrVHJhbnNsYXRpb25JbnN0YW50ID0gZnVuY3Rpb24gKGxhbmdLZXksIHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zLCBJbnRlcnBvbGF0b3IpIHtcbiAgICAgICAgdmFyIHJlc3VsdCwgdHJhbnNsYXRpb25UYWJsZSA9ICR0cmFuc2xhdGlvblRhYmxlW2xhbmdLZXldO1xuXG4gICAgICAgIGlmICh0cmFuc2xhdGlvblRhYmxlICYmIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0cmFuc2xhdGlvblRhYmxlLCB0cmFuc2xhdGlvbklkKSkge1xuICAgICAgICAgIEludGVycG9sYXRvci5zZXRMb2NhbGUobGFuZ0tleSk7XG4gICAgICAgICAgcmVzdWx0ID0gSW50ZXJwb2xhdG9yLmludGVycG9sYXRlKHRyYW5zbGF0aW9uVGFibGVbdHJhbnNsYXRpb25JZF0sIGludGVycG9sYXRlUGFyYW1zKTtcbiAgICAgICAgICBpZiAocmVzdWx0LnN1YnN0cigwLCAyKSA9PT0gJ0A6Jykge1xuICAgICAgICAgICAgcmV0dXJuIGdldEZhbGxiYWNrVHJhbnNsYXRpb25JbnN0YW50KGxhbmdLZXksIHJlc3VsdC5zdWJzdHIoMiksIGludGVycG9sYXRlUGFyYW1zLCBJbnRlcnBvbGF0b3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBJbnRlcnBvbGF0b3Iuc2V0TG9jYWxlKCR1c2VzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9O1xuXG5cbiAgICAgIC8qKlxuICAgICAgICogQG5hbWUgdHJhbnNsYXRlQnlIYW5kbGVyXG4gICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICpcbiAgICAgICAqIFRyYW5zbGF0ZSBieSBtaXNzaW5nIHRyYW5zbGF0aW9uIGhhbmRsZXIuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHRyYW5zbGF0aW9uSWRcbiAgICAgICAqIEByZXR1cm5zIHRyYW5zbGF0aW9uIGNyZWF0ZWQgYnkgJG1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXIgb3IgdHJhbnNsYXRpb25JZCBpcyAkbWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlciBpc1xuICAgICAgICogYWJzZW50XG4gICAgICAgKi9cbiAgICAgIHZhciB0cmFuc2xhdGVCeUhhbmRsZXIgPSBmdW5jdGlvbiAodHJhbnNsYXRpb25JZCkge1xuICAgICAgICAvLyBJZiB3ZSBoYXZlIGEgaGFuZGxlciBmYWN0b3J5IC0gd2UgbWlnaHQgYWxzbyBjYWxsIGl0IGhlcmUgdG8gZGV0ZXJtaW5lIGlmIGl0IHByb3ZpZGVzXG4gICAgICAgIC8vIGEgZGVmYXVsdCB0ZXh0IGZvciBhIHRyYW5zbGF0aW9uaWQgdGhhdCBjYW4ndCBiZSBmb3VuZCBhbnl3aGVyZSBpbiBvdXIgdGFibGVzXG4gICAgICAgIGlmICgkbWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlckZhY3RvcnkpIHtcbiAgICAgICAgICB2YXIgcmVzdWx0U3RyaW5nID0gJGluamVjdG9yLmdldCgkbWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlckZhY3RvcnkpKHRyYW5zbGF0aW9uSWQsICR1c2VzKTtcbiAgICAgICAgICBpZiAocmVzdWx0U3RyaW5nICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRTdHJpbmc7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0cmFuc2xhdGlvbklkO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdHJhbnNsYXRpb25JZDtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgLyoqXG4gICAgICAgKiBAbmFtZSByZXNvbHZlRm9yRmFsbGJhY2tMYW5ndWFnZVxuICAgICAgICogQHByaXZhdGVcbiAgICAgICAqXG4gICAgICAgKiBSZWN1cnNpdmUgaGVscGVyIGZ1bmN0aW9uIGZvciBmYWxsYmFja1RyYW5zbGF0aW9uIHRoYXQgd2lsbCBzZXF1ZW50aWFsbHkgbG9va1xuICAgICAgICogZm9yIGEgdHJhbnNsYXRpb24gaW4gdGhlIGZhbGxiYWNrTGFuZ3VhZ2VzIHN0YXJ0aW5nIHdpdGggZmFsbGJhY2tMYW5ndWFnZUluZGV4LlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSBmYWxsYmFja0xhbmd1YWdlSW5kZXhcbiAgICAgICAqIEBwYXJhbSB0cmFuc2xhdGlvbklkXG4gICAgICAgKiBAcGFyYW0gaW50ZXJwb2xhdGVQYXJhbXNcbiAgICAgICAqIEBwYXJhbSBJbnRlcnBvbGF0b3JcbiAgICAgICAqIEByZXR1cm5zIHtRLnByb21pc2V9IFByb21pc2UgdGhhdCB3aWxsIHJlc29sdmUgdG8gdGhlIHRyYW5zbGF0aW9uLlxuICAgICAgICovXG4gICAgICB2YXIgcmVzb2x2ZUZvckZhbGxiYWNrTGFuZ3VhZ2UgPSBmdW5jdGlvbiAoZmFsbGJhY2tMYW5ndWFnZUluZGV4LCB0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgSW50ZXJwb2xhdG9yLCBkZWZhdWx0VHJhbnNsYXRpb25UZXh0KSB7XG4gICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgICAgaWYgKGZhbGxiYWNrTGFuZ3VhZ2VJbmRleCA8ICRmYWxsYmFja0xhbmd1YWdlLmxlbmd0aCkge1xuICAgICAgICAgIHZhciBsYW5nS2V5ID0gJGZhbGxiYWNrTGFuZ3VhZ2VbZmFsbGJhY2tMYW5ndWFnZUluZGV4XTtcbiAgICAgICAgICBnZXRGYWxsYmFja1RyYW5zbGF0aW9uKGxhbmdLZXksIHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zLCBJbnRlcnBvbGF0b3IpLnRoZW4oXG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlLFxuICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAvLyBMb29rIGluIHRoZSBuZXh0IGZhbGxiYWNrIGxhbmd1YWdlIGZvciBhIHRyYW5zbGF0aW9uLlxuICAgICAgICAgICAgICAvLyBJdCBkZWxheXMgdGhlIHJlc29sdmluZyBieSBwYXNzaW5nIGFub3RoZXIgcHJvbWlzZSB0byByZXNvbHZlLlxuICAgICAgICAgICAgICByZXNvbHZlRm9yRmFsbGJhY2tMYW5ndWFnZShmYWxsYmFja0xhbmd1YWdlSW5kZXggKyAxLCB0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgSW50ZXJwb2xhdG9yLCBkZWZhdWx0VHJhbnNsYXRpb25UZXh0KS50aGVuKGRlZmVycmVkLnJlc29sdmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gTm8gdHJhbnNsYXRpb24gZm91bmQgaW4gYW55IGZhbGxiYWNrIGxhbmd1YWdlXG4gICAgICAgICAgLy8gaWYgYSBkZWZhdWx0IHRyYW5zbGF0aW9uIHRleHQgaXMgc2V0IGluIHRoZSBkaXJlY3RpdmUsIHRoZW4gcmV0dXJuIHRoaXMgYXMgYSByZXN1bHRcbiAgICAgICAgICBpZiAoZGVmYXVsdFRyYW5zbGF0aW9uVGV4dCkge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkZWZhdWx0VHJhbnNsYXRpb25UZXh0KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gaWYgbm8gZGVmYXVsdCB0cmFuc2xhdGlvbiBpcyBzZXQgYW5kIGFuIGVycm9yIGhhbmRsZXIgaXMgZGVmaW5lZCwgc2VuZCBpdCB0byB0aGUgaGFuZGxlclxuICAgICAgICAgICAgLy8gYW5kIHRoZW4gcmV0dXJuIHRoZSByZXN1bHRcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUodHJhbnNsYXRlQnlIYW5kbGVyKHRyYW5zbGF0aW9uSWQpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICB9O1xuXG4gICAgICAvKipcbiAgICAgICAqIEBuYW1lIHJlc29sdmVGb3JGYWxsYmFja0xhbmd1YWdlSW5zdGFudFxuICAgICAgICogQHByaXZhdGVcbiAgICAgICAqXG4gICAgICAgKiBSZWN1cnNpdmUgaGVscGVyIGZ1bmN0aW9uIGZvciBmYWxsYmFja1RyYW5zbGF0aW9uIHRoYXQgd2lsbCBzZXF1ZW50aWFsbHkgbG9va1xuICAgICAgICogZm9yIGEgdHJhbnNsYXRpb24gaW4gdGhlIGZhbGxiYWNrTGFuZ3VhZ2VzIHN0YXJ0aW5nIHdpdGggZmFsbGJhY2tMYW5ndWFnZUluZGV4LlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSBmYWxsYmFja0xhbmd1YWdlSW5kZXhcbiAgICAgICAqIEBwYXJhbSB0cmFuc2xhdGlvbklkXG4gICAgICAgKiBAcGFyYW0gaW50ZXJwb2xhdGVQYXJhbXNcbiAgICAgICAqIEBwYXJhbSBJbnRlcnBvbGF0b3JcbiAgICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHRyYW5zbGF0aW9uXG4gICAgICAgKi9cbiAgICAgIHZhciByZXNvbHZlRm9yRmFsbGJhY2tMYW5ndWFnZUluc3RhbnQgPSBmdW5jdGlvbiAoZmFsbGJhY2tMYW5ndWFnZUluZGV4LCB0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgSW50ZXJwb2xhdG9yKSB7XG4gICAgICAgIHZhciByZXN1bHQ7XG5cbiAgICAgICAgaWYgKGZhbGxiYWNrTGFuZ3VhZ2VJbmRleCA8ICRmYWxsYmFja0xhbmd1YWdlLmxlbmd0aCkge1xuICAgICAgICAgIHZhciBsYW5nS2V5ID0gJGZhbGxiYWNrTGFuZ3VhZ2VbZmFsbGJhY2tMYW5ndWFnZUluZGV4XTtcbiAgICAgICAgICByZXN1bHQgPSBnZXRGYWxsYmFja1RyYW5zbGF0aW9uSW5zdGFudChsYW5nS2V5LCB0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgSW50ZXJwb2xhdG9yKTtcbiAgICAgICAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzb2x2ZUZvckZhbGxiYWNrTGFuZ3VhZ2VJbnN0YW50KGZhbGxiYWNrTGFuZ3VhZ2VJbmRleCArIDEsIHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zLCBJbnRlcnBvbGF0b3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfTtcblxuICAgICAgLyoqXG4gICAgICAgKiBUcmFuc2xhdGVzIHdpdGggdGhlIHVzYWdlIG9mIHRoZSBmYWxsYmFjayBsYW5ndWFnZXMuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHRyYW5zbGF0aW9uSWRcbiAgICAgICAqIEBwYXJhbSBpbnRlcnBvbGF0ZVBhcmFtc1xuICAgICAgICogQHBhcmFtIEludGVycG9sYXRvclxuICAgICAgICogQHJldHVybnMge1EucHJvbWlzZX0gUHJvbWlzZSwgdGhhdCByZXNvbHZlcyB0byB0aGUgdHJhbnNsYXRpb24uXG4gICAgICAgKi9cbiAgICAgIHZhciBmYWxsYmFja1RyYW5zbGF0aW9uID0gZnVuY3Rpb24gKHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zLCBJbnRlcnBvbGF0b3IsIGRlZmF1bHRUcmFuc2xhdGlvblRleHQpIHtcbiAgICAgICAgLy8gU3RhcnQgd2l0aCB0aGUgZmFsbGJhY2tMYW5ndWFnZSB3aXRoIGluZGV4IDBcbiAgICAgICAgcmV0dXJuIHJlc29sdmVGb3JGYWxsYmFja0xhbmd1YWdlKChzdGFydEZhbGxiYWNrSXRlcmF0aW9uPjAgPyBzdGFydEZhbGxiYWNrSXRlcmF0aW9uIDogZmFsbGJhY2tJbmRleCksIHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zLCBJbnRlcnBvbGF0b3IsIGRlZmF1bHRUcmFuc2xhdGlvblRleHQpO1xuICAgICAgfTtcblxuICAgICAgLyoqXG4gICAgICAgKiBUcmFuc2xhdGVzIHdpdGggdGhlIHVzYWdlIG9mIHRoZSBmYWxsYmFjayBsYW5ndWFnZXMuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHRyYW5zbGF0aW9uSWRcbiAgICAgICAqIEBwYXJhbSBpbnRlcnBvbGF0ZVBhcmFtc1xuICAgICAgICogQHBhcmFtIEludGVycG9sYXRvclxuICAgICAgICogQHJldHVybnMge1N0cmluZ30gdHJhbnNsYXRpb25cbiAgICAgICAqL1xuICAgICAgdmFyIGZhbGxiYWNrVHJhbnNsYXRpb25JbnN0YW50ID0gZnVuY3Rpb24gKHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zLCBJbnRlcnBvbGF0b3IpIHtcbiAgICAgICAgLy8gU3RhcnQgd2l0aCB0aGUgZmFsbGJhY2tMYW5ndWFnZSB3aXRoIGluZGV4IDBcbiAgICAgICAgcmV0dXJuIHJlc29sdmVGb3JGYWxsYmFja0xhbmd1YWdlSW5zdGFudCgoc3RhcnRGYWxsYmFja0l0ZXJhdGlvbj4wID8gc3RhcnRGYWxsYmFja0l0ZXJhdGlvbiA6IGZhbGxiYWNrSW5kZXgpLCB0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgSW50ZXJwb2xhdG9yKTtcbiAgICAgIH07XG5cbiAgICAgIHZhciBkZXRlcm1pbmVUcmFuc2xhdGlvbiA9IGZ1bmN0aW9uICh0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgaW50ZXJwb2xhdGlvbklkLCBkZWZhdWx0VHJhbnNsYXRpb25UZXh0KSB7XG5cbiAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgICB2YXIgdGFibGUgPSAkdXNlcyA/ICR0cmFuc2xhdGlvblRhYmxlWyR1c2VzXSA6ICR0cmFuc2xhdGlvblRhYmxlLFxuICAgICAgICAgICAgSW50ZXJwb2xhdG9yID0gKGludGVycG9sYXRpb25JZCkgPyBpbnRlcnBvbGF0b3JIYXNoTWFwW2ludGVycG9sYXRpb25JZF0gOiBkZWZhdWx0SW50ZXJwb2xhdG9yO1xuXG4gICAgICAgIC8vIGlmIHRoZSB0cmFuc2xhdGlvbiBpZCBleGlzdHMsIHdlIGNhbiBqdXN0IGludGVycG9sYXRlIGl0XG4gICAgICAgIGlmICh0YWJsZSAmJiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGFibGUsIHRyYW5zbGF0aW9uSWQpKSB7XG4gICAgICAgICAgdmFyIHRyYW5zbGF0aW9uID0gdGFibGVbdHJhbnNsYXRpb25JZF07XG5cbiAgICAgICAgICAvLyBJZiB1c2luZyBsaW5rLCByZXJ1biAkdHJhbnNsYXRlIHdpdGggbGlua2VkIHRyYW5zbGF0aW9uSWQgYW5kIHJldHVybiBpdFxuICAgICAgICAgIGlmICh0cmFuc2xhdGlvbi5zdWJzdHIoMCwgMikgPT09ICdAOicpIHtcblxuICAgICAgICAgICAgJHRyYW5zbGF0ZSh0cmFuc2xhdGlvbi5zdWJzdHIoMiksIGludGVycG9sYXRlUGFyYW1zLCBpbnRlcnBvbGF0aW9uSWQsIGRlZmF1bHRUcmFuc2xhdGlvblRleHQpXG4gICAgICAgICAgICAgIC50aGVuKGRlZmVycmVkLnJlc29sdmUsIGRlZmVycmVkLnJlamVjdCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoSW50ZXJwb2xhdG9yLmludGVycG9sYXRlKHRyYW5zbGF0aW9uLCBpbnRlcnBvbGF0ZVBhcmFtcykpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgbWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlclRyYW5zbGF0aW9uO1xuICAgICAgICAgIC8vIGZvciBsb2dnaW5nIHB1cnBvc2VzIG9ubHkgKGFzIGluICR0cmFuc2xhdGVNaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyTG9nKSwgdmFsdWUgaXMgbm90IHJldHVybmVkIHRvIHByb21pc2VcbiAgICAgICAgICBpZiAoJG1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXJGYWN0b3J5ICYmICFwZW5kaW5nTG9hZGVyKSB7XG4gICAgICAgICAgICBtaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyVHJhbnNsYXRpb24gPSB0cmFuc2xhdGVCeUhhbmRsZXIodHJhbnNsYXRpb25JZCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gc2luY2Ugd2UgY291bGRuJ3QgdHJhbnNsYXRlIHRoZSBpbml0YWwgcmVxdWVzdGVkIHRyYW5zbGF0aW9uIGlkLFxuICAgICAgICAgIC8vIHdlIHRyeSBpdCBub3cgd2l0aCBvbmUgb3IgbW9yZSBmYWxsYmFjayBsYW5ndWFnZXMsIGlmIGZhbGxiYWNrIGxhbmd1YWdlKHMpIGlzXG4gICAgICAgICAgLy8gY29uZmlndXJlZC5cbiAgICAgICAgICBpZiAoJHVzZXMgJiYgJGZhbGxiYWNrTGFuZ3VhZ2UgJiYgJGZhbGxiYWNrTGFuZ3VhZ2UubGVuZ3RoKSB7XG4gICAgICAgICAgICBmYWxsYmFja1RyYW5zbGF0aW9uKHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zLCBJbnRlcnBvbGF0b3IsIGRlZmF1bHRUcmFuc2xhdGlvblRleHQpXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHRyYW5zbGF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHRyYW5zbGF0aW9uKTtcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoX3RyYW5zbGF0aW9uSWQpIHtcbiAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChhcHBseU5vdEZvdW5kSW5kaWNhdG9ycyhfdHJhbnNsYXRpb25JZCkpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSBpZiAoJG1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXJGYWN0b3J5ICYmICFwZW5kaW5nTG9hZGVyICYmIG1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXJUcmFuc2xhdGlvbikge1xuICAgICAgICAgICAgLy8gbG9va3MgbGlrZSB0aGUgcmVxdWVzdGVkIHRyYW5zbGF0aW9uIGlkIGRvZXNuJ3QgZXhpc3RzLlxuICAgICAgICAgICAgLy8gTm93LCBpZiB0aGVyZSBpcyBhIHJlZ2lzdGVyZWQgaGFuZGxlciBmb3IgbWlzc2luZyB0cmFuc2xhdGlvbnMgYW5kIG5vXG4gICAgICAgICAgICAvLyBhc3luY0xvYWRlciBpcyBwZW5kaW5nLCB3ZSBleGVjdXRlIHRoZSBoYW5kbGVyXG4gICAgICAgICAgICBpZiAoZGVmYXVsdFRyYW5zbGF0aW9uVGV4dCkge1xuICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRlZmF1bHRUcmFuc2xhdGlvblRleHQpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUobWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlclRyYW5zbGF0aW9uKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoZGVmYXVsdFRyYW5zbGF0aW9uVGV4dCkge1xuICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRlZmF1bHRUcmFuc2xhdGlvblRleHQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGFwcGx5Tm90Rm91bmRJbmRpY2F0b3JzKHRyYW5zbGF0aW9uSWQpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICB9O1xuXG4gICAgICB2YXIgZGV0ZXJtaW5lVHJhbnNsYXRpb25JbnN0YW50ID0gZnVuY3Rpb24gKHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zLCBpbnRlcnBvbGF0aW9uSWQpIHtcblxuICAgICAgICB2YXIgcmVzdWx0LCB0YWJsZSA9ICR1c2VzID8gJHRyYW5zbGF0aW9uVGFibGVbJHVzZXNdIDogJHRyYW5zbGF0aW9uVGFibGUsXG4gICAgICAgICAgICBJbnRlcnBvbGF0b3IgPSBkZWZhdWx0SW50ZXJwb2xhdG9yO1xuXG4gICAgICAgIC8vIGlmIHRoZSBpbnRlcnBvbGF0aW9uIGlkIGV4aXN0cyB1c2UgY3VzdG9tIGludGVycG9sYXRvclxuICAgICAgICBpZiAoaW50ZXJwb2xhdG9ySGFzaE1hcCAmJiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoaW50ZXJwb2xhdG9ySGFzaE1hcCwgaW50ZXJwb2xhdGlvbklkKSkge1xuICAgICAgICAgIEludGVycG9sYXRvciA9IGludGVycG9sYXRvckhhc2hNYXBbaW50ZXJwb2xhdGlvbklkXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIHRoZSB0cmFuc2xhdGlvbiBpZCBleGlzdHMsIHdlIGNhbiBqdXN0IGludGVycG9sYXRlIGl0XG4gICAgICAgIGlmICh0YWJsZSAmJiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGFibGUsIHRyYW5zbGF0aW9uSWQpKSB7XG4gICAgICAgICAgdmFyIHRyYW5zbGF0aW9uID0gdGFibGVbdHJhbnNsYXRpb25JZF07XG5cbiAgICAgICAgICAvLyBJZiB1c2luZyBsaW5rLCByZXJ1biAkdHJhbnNsYXRlIHdpdGggbGlua2VkIHRyYW5zbGF0aW9uSWQgYW5kIHJldHVybiBpdFxuICAgICAgICAgIGlmICh0cmFuc2xhdGlvbi5zdWJzdHIoMCwgMikgPT09ICdAOicpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IGRldGVybWluZVRyYW5zbGF0aW9uSW5zdGFudCh0cmFuc2xhdGlvbi5zdWJzdHIoMiksIGludGVycG9sYXRlUGFyYW1zLCBpbnRlcnBvbGF0aW9uSWQpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgPSBJbnRlcnBvbGF0b3IuaW50ZXJwb2xhdGUodHJhbnNsYXRpb24sIGludGVycG9sYXRlUGFyYW1zKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIG1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXJUcmFuc2xhdGlvbjtcbiAgICAgICAgICAvLyBmb3IgbG9nZ2luZyBwdXJwb3NlcyBvbmx5IChhcyBpbiAkdHJhbnNsYXRlTWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlckxvZyksIHZhbHVlIGlzIG5vdCByZXR1cm5lZCB0byBwcm9taXNlXG4gICAgICAgICAgaWYgKCRtaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyRmFjdG9yeSAmJiAhcGVuZGluZ0xvYWRlcikge1xuICAgICAgICAgICAgbWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlclRyYW5zbGF0aW9uID0gdHJhbnNsYXRlQnlIYW5kbGVyKHRyYW5zbGF0aW9uSWQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIHNpbmNlIHdlIGNvdWxkbid0IHRyYW5zbGF0ZSB0aGUgaW5pdGFsIHJlcXVlc3RlZCB0cmFuc2xhdGlvbiBpZCxcbiAgICAgICAgICAvLyB3ZSB0cnkgaXQgbm93IHdpdGggb25lIG9yIG1vcmUgZmFsbGJhY2sgbGFuZ3VhZ2VzLCBpZiBmYWxsYmFjayBsYW5ndWFnZShzKSBpc1xuICAgICAgICAgIC8vIGNvbmZpZ3VyZWQuXG4gICAgICAgICAgaWYgKCR1c2VzICYmICRmYWxsYmFja0xhbmd1YWdlICYmICRmYWxsYmFja0xhbmd1YWdlLmxlbmd0aCkge1xuICAgICAgICAgICAgZmFsbGJhY2tJbmRleCA9IDA7XG4gICAgICAgICAgICByZXN1bHQgPSBmYWxsYmFja1RyYW5zbGF0aW9uSW5zdGFudCh0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgSW50ZXJwb2xhdG9yKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKCRtaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyRmFjdG9yeSAmJiAhcGVuZGluZ0xvYWRlciAmJiBtaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyVHJhbnNsYXRpb24pIHtcbiAgICAgICAgICAgIC8vIGxvb2tzIGxpa2UgdGhlIHJlcXVlc3RlZCB0cmFuc2xhdGlvbiBpZCBkb2Vzbid0IGV4aXN0cy5cbiAgICAgICAgICAgIC8vIE5vdywgaWYgdGhlcmUgaXMgYSByZWdpc3RlcmVkIGhhbmRsZXIgZm9yIG1pc3NpbmcgdHJhbnNsYXRpb25zIGFuZCBub1xuICAgICAgICAgICAgLy8gYXN5bmNMb2FkZXIgaXMgcGVuZGluZywgd2UgZXhlY3V0ZSB0aGUgaGFuZGxlclxuICAgICAgICAgICAgcmVzdWx0ID0gbWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlclRyYW5zbGF0aW9uO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgPSBhcHBseU5vdEZvdW5kSW5kaWNhdG9ycyh0cmFuc2xhdGlvbklkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfTtcblxuICAgICAgLyoqXG4gICAgICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICAgICAqIEBuYW1lIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZSNwcmVmZXJyZWRMYW5ndWFnZVxuICAgICAgICogQG1ldGhvZE9mIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVxuICAgICAgICpcbiAgICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAgICogUmV0dXJucyB0aGUgbGFuZ3VhZ2Uga2V5IGZvciB0aGUgcHJlZmVycmVkIGxhbmd1YWdlLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsYW5nS2V5IGxhbmd1YWdlIFN0cmluZyBvciBBcnJheSB0byBiZSB1c2VkIGFzIHByZWZlcnJlZExhbmd1YWdlIChjaGFuZ2luZyBhdCBydW50aW1lKVxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm4ge3N0cmluZ30gcHJlZmVycmVkIGxhbmd1YWdlIGtleVxuICAgICAgICovXG4gICAgICAkdHJhbnNsYXRlLnByZWZlcnJlZExhbmd1YWdlID0gZnVuY3Rpb24gKGxhbmdLZXkpIHtcbiAgICAgICAgaWYobGFuZ0tleSkge1xuICAgICAgICAgIHNldHVwUHJlZmVycmVkTGFuZ3VhZ2UobGFuZ0tleSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICRwcmVmZXJyZWRMYW5ndWFnZTtcbiAgICAgIH07XG5cbiAgICAgIC8qKlxuICAgICAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAgICAgKiBAbmFtZSBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGUjY2xvYWtDbGFzc05hbWVcbiAgICAgICAqIEBtZXRob2RPZiBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVcbiAgICAgICAqXG4gICAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgICAqIFJldHVybnMgdGhlIGNvbmZpZ3VyZWQgY2xhc3MgbmFtZSBmb3IgYHRyYW5zbGF0ZS1jbG9ha2AgZGlyZWN0aXZlLlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm4ge3N0cmluZ30gY2xvYWtDbGFzc05hbWVcbiAgICAgICAqL1xuICAgICAgJHRyYW5zbGF0ZS5jbG9ha0NsYXNzTmFtZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICRjbG9ha0NsYXNzTmFtZTtcbiAgICAgIH07XG5cbiAgICAgIC8qKlxuICAgICAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAgICAgKiBAbmFtZSBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGUjZmFsbGJhY2tMYW5ndWFnZVxuICAgICAgICogQG1ldGhvZE9mIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVxuICAgICAgICpcbiAgICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAgICogUmV0dXJucyB0aGUgbGFuZ3VhZ2Uga2V5IGZvciB0aGUgZmFsbGJhY2sgbGFuZ3VhZ2VzIG9yIHNldHMgYSBuZXcgZmFsbGJhY2sgc3RhY2suXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtzdHJpbmc9fSBsYW5nS2V5IGxhbmd1YWdlIFN0cmluZyBvciBBcnJheSBvZiBmYWxsYmFjayBsYW5ndWFnZXMgdG8gYmUgdXNlZCAodG8gY2hhbmdlIHN0YWNrIGF0IHJ1bnRpbWUpXG4gICAgICAgKlxuICAgICAgICogQHJldHVybiB7c3RyaW5nfHxhcnJheX0gZmFsbGJhY2sgbGFuZ3VhZ2Uga2V5XG4gICAgICAgKi9cbiAgICAgICR0cmFuc2xhdGUuZmFsbGJhY2tMYW5ndWFnZSA9IGZ1bmN0aW9uIChsYW5nS2V5KSB7XG4gICAgICAgIGlmIChsYW5nS2V5ICE9PSB1bmRlZmluZWQgJiYgbGFuZ0tleSAhPT0gbnVsbCkge1xuICAgICAgICAgIGZhbGxiYWNrU3RhY2sobGFuZ0tleSk7XG5cbiAgICAgICAgICAvLyBhcyB3ZSBtaWdodCBoYXZlIGFuIGFzeW5jIGxvYWRlciBpbml0aWF0ZWQgYW5kIGEgbmV3IHRyYW5zbGF0aW9uIGxhbmd1YWdlIG1pZ2h0IGhhdmUgYmVlbiBkZWZpbmVkXG4gICAgICAgICAgLy8gd2UgbmVlZCB0byBhZGQgdGhlIHByb21pc2UgdG8gdGhlIHN0YWNrIGFsc28uIFNvIC0gaXRlcmF0ZS5cbiAgICAgICAgICBpZiAoJGxvYWRlckZhY3RvcnkpIHtcbiAgICAgICAgICAgIGlmICgkZmFsbGJhY2tMYW5ndWFnZSAmJiAkZmFsbGJhY2tMYW5ndWFnZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9ICRmYWxsYmFja0xhbmd1YWdlLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFsYW5nUHJvbWlzZXNbJGZhbGxiYWNrTGFuZ3VhZ2VbaV1dKSB7XG4gICAgICAgICAgICAgICAgICBsYW5nUHJvbWlzZXNbJGZhbGxiYWNrTGFuZ3VhZ2VbaV1dID0gbG9hZEFzeW5jKCRmYWxsYmFja0xhbmd1YWdlW2ldKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgJHRyYW5zbGF0ZS51c2UoJHRyYW5zbGF0ZS51c2UoKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCRmYWxsYmFja1dhc1N0cmluZykge1xuICAgICAgICAgIHJldHVybiAkZmFsbGJhY2tMYW5ndWFnZVswXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gJGZhbGxiYWNrTGFuZ3VhZ2U7XG4gICAgICAgIH1cblxuICAgICAgfTtcblxuICAgICAgLyoqXG4gICAgICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICAgICAqIEBuYW1lIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZSN1c2VGYWxsYmFja0xhbmd1YWdlXG4gICAgICAgKiBAbWV0aG9kT2YgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlXG4gICAgICAgKlxuICAgICAgICogQGRlc2NyaXB0aW9uXG4gICAgICAgKiBTZXRzIHRoZSBmaXJzdCBrZXkgb2YgdGhlIGZhbGxiYWNrIGxhbmd1YWdlIHN0YWNrIHRvIGJlIHVzZWQgZm9yIHRyYW5zbGF0aW9uLlxuICAgICAgICogVGhlcmVmb3JlIGFsbCBsYW5ndWFnZXMgaW4gdGhlIGZhbGxiYWNrIGFycmF5IEJFRk9SRSB0aGlzIGtleSB3aWxsIGJlIHNraXBwZWQhXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtzdHJpbmc9fSBsYW5nS2V5IENvbnRhaW5zIHRoZSBsYW5nS2V5IHRoZSBpdGVyYXRpb24gc2hhbGwgc3RhcnQgd2l0aC4gU2V0IHRvIGZhbHNlIGlmIHlvdSB3YW50IHRvXG4gICAgICAgKiBnZXQgYmFjayB0byB0aGUgd2hvbGUgc3RhY2tcbiAgICAgICAqL1xuICAgICAgJHRyYW5zbGF0ZS51c2VGYWxsYmFja0xhbmd1YWdlID0gZnVuY3Rpb24gKGxhbmdLZXkpIHtcbiAgICAgICAgaWYgKGxhbmdLZXkgIT09IHVuZGVmaW5lZCAmJiBsYW5nS2V5ICE9PSBudWxsKSB7XG4gICAgICAgICAgaWYgKCFsYW5nS2V5KSB7XG4gICAgICAgICAgICBzdGFydEZhbGxiYWNrSXRlcmF0aW9uID0gMDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIGxhbmdLZXlQb3NpdGlvbiA9IGluZGV4T2YoJGZhbGxiYWNrTGFuZ3VhZ2UsIGxhbmdLZXkpO1xuICAgICAgICAgICAgaWYgKGxhbmdLZXlQb3NpdGlvbiA+IC0xKSB7XG4gICAgICAgICAgICAgIHN0YXJ0RmFsbGJhY2tJdGVyYXRpb24gPSBsYW5nS2V5UG9zaXRpb247XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgfTtcblxuICAgICAgLyoqXG4gICAgICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICAgICAqIEBuYW1lIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZSNwcm9wb3NlZExhbmd1YWdlXG4gICAgICAgKiBAbWV0aG9kT2YgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlXG4gICAgICAgKlxuICAgICAgICogQGRlc2NyaXB0aW9uXG4gICAgICAgKiBSZXR1cm5zIHRoZSBsYW5ndWFnZSBrZXkgb2YgbGFuZ3VhZ2UgdGhhdCBpcyBjdXJyZW50bHkgbG9hZGVkIGFzeW5jaHJvbm91c2x5LlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm4ge3N0cmluZ30gbGFuZ3VhZ2Uga2V5XG4gICAgICAgKi9cbiAgICAgICR0cmFuc2xhdGUucHJvcG9zZWRMYW5ndWFnZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICRuZXh0TGFuZztcbiAgICAgIH07XG5cbiAgICAgIC8qKlxuICAgICAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAgICAgKiBAbmFtZSBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGUjc3RvcmFnZVxuICAgICAgICogQG1ldGhvZE9mIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVxuICAgICAgICpcbiAgICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAgICogUmV0dXJucyByZWdpc3RlcmVkIHN0b3JhZ2UuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybiB7b2JqZWN0fSBTdG9yYWdlXG4gICAgICAgKi9cbiAgICAgICR0cmFuc2xhdGUuc3RvcmFnZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIFN0b3JhZ2U7XG4gICAgICB9O1xuXG4gICAgICAvKipcbiAgICAgICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgICAgICogQG5hbWUgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlI3VzZVxuICAgICAgICogQG1ldGhvZE9mIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVxuICAgICAgICpcbiAgICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAgICogVGVsbHMgYW5ndWxhci10cmFuc2xhdGUgd2hpY2ggbGFuZ3VhZ2UgdG8gdXNlIGJ5IGdpdmVuIGxhbmd1YWdlIGtleS4gVGhpcyBtZXRob2QgaXNcbiAgICAgICAqIHVzZWQgdG8gY2hhbmdlIGxhbmd1YWdlIGF0IHJ1bnRpbWUuIEl0IGFsc28gdGFrZXMgY2FyZSBvZiBzdG9yaW5nIHRoZSBsYW5ndWFnZVxuICAgICAgICoga2V5IGluIGEgY29uZmlndXJlZCBzdG9yZSB0byBsZXQgeW91ciBhcHAgcmVtZW1iZXIgdGhlIGNob29zZWQgbGFuZ3VhZ2UuXG4gICAgICAgKlxuICAgICAgICogV2hlbiB0cnlpbmcgdG8gJ3VzZScgYSBsYW5ndWFnZSB3aGljaCBpc24ndCBhdmFpbGFibGUgaXQgdHJpZXMgdG8gbG9hZCBpdFxuICAgICAgICogYXN5bmNocm9ub3VzbHkgd2l0aCByZWdpc3RlcmVkIGxvYWRlcnMuXG4gICAgICAgKlxuICAgICAgICogUmV0dXJucyBwcm9taXNlIG9iamVjdCB3aXRoIGxvYWRlZCBsYW5ndWFnZSBmaWxlIGRhdGFcbiAgICAgICAqIEBleGFtcGxlXG4gICAgICAgKiAkdHJhbnNsYXRlLnVzZShcImVuX1VTXCIpLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgKiAgICRzY29wZS50ZXh0ID0gJHRyYW5zbGF0ZShcIkhFTExPXCIpO1xuICAgICAgICogfSk7XG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGtleSBMYW5ndWFnZSBrZXlcbiAgICAgICAqIEByZXR1cm4ge3N0cmluZ30gTGFuZ3VhZ2Uga2V5XG4gICAgICAgKi9cbiAgICAgICR0cmFuc2xhdGUudXNlID0gZnVuY3Rpb24gKGtleSkge1xuICAgICAgICBpZiAoIWtleSkge1xuICAgICAgICAgIHJldHVybiAkdXNlcztcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgICAgJHJvb3RTY29wZS4kZW1pdCgnJHRyYW5zbGF0ZUNoYW5nZVN0YXJ0Jywge2xhbmd1YWdlOiBrZXl9KTtcblxuICAgICAgICAvLyBUcnkgdG8gZ2V0IHRoZSBhbGlhc2VkIGxhbmd1YWdlIGtleVxuICAgICAgICB2YXIgYWxpYXNlZEtleSA9IG5lZ290aWF0ZUxvY2FsZShrZXkpO1xuICAgICAgICBpZiAoYWxpYXNlZEtleSkge1xuICAgICAgICAgIGtleSA9IGFsaWFzZWRLZXk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiB0aGVyZSBpc24ndCBhIHRyYW5zbGF0aW9uIHRhYmxlIGZvciB0aGUgbGFuZ3VhZ2Ugd2UndmUgcmVxdWVzdGVkLFxuICAgICAgICAvLyB3ZSBsb2FkIGl0IGFzeW5jaHJvbm91c2x5XG4gICAgICAgIGlmICghJHRyYW5zbGF0aW9uVGFibGVba2V5XSAmJiAkbG9hZGVyRmFjdG9yeSAmJiAhbGFuZ1Byb21pc2VzW2tleV0pIHtcbiAgICAgICAgICAkbmV4dExhbmcgPSBrZXk7XG4gICAgICAgICAgbGFuZ1Byb21pc2VzW2tleV0gPSBsb2FkQXN5bmMoa2V5KS50aGVuKGZ1bmN0aW9uICh0cmFuc2xhdGlvbikge1xuICAgICAgICAgICAgdHJhbnNsYXRpb25zKHRyYW5zbGF0aW9uLmtleSwgdHJhbnNsYXRpb24udGFibGUpO1xuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh0cmFuc2xhdGlvbi5rZXkpO1xuXG4gICAgICAgICAgICB1c2VMYW5ndWFnZSh0cmFuc2xhdGlvbi5rZXkpO1xuICAgICAgICAgICAgaWYgKCRuZXh0TGFuZyA9PT0ga2V5KSB7XG4gICAgICAgICAgICAgICRuZXh0TGFuZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cmFuc2xhdGlvbjtcbiAgICAgICAgICB9LCBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICBpZiAoJG5leHRMYW5nID09PSBrZXkpIHtcbiAgICAgICAgICAgICAgJG5leHRMYW5nID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgJHJvb3RTY29wZS4kZW1pdCgnJHRyYW5zbGF0ZUNoYW5nZUVycm9yJywge2xhbmd1YWdlOiBrZXl9KTtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChrZXkpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kZW1pdCgnJHRyYW5zbGF0ZUNoYW5nZUVuZCcsIHtsYW5ndWFnZToga2V5fSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShrZXkpO1xuICAgICAgICAgIHVzZUxhbmd1YWdlKGtleSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgIH07XG5cbiAgICAgIC8qKlxuICAgICAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAgICAgKiBAbmFtZSBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGUjc3RvcmFnZUtleVxuICAgICAgICogQG1ldGhvZE9mIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVxuICAgICAgICpcbiAgICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAgICogUmV0dXJucyB0aGUga2V5IGZvciB0aGUgc3RvcmFnZS5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IHN0b3JhZ2Uga2V5XG4gICAgICAgKi9cbiAgICAgICR0cmFuc2xhdGUuc3RvcmFnZUtleSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHN0b3JhZ2VLZXkoKTtcbiAgICAgIH07XG5cbiAgICAgIC8qKlxuICAgICAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAgICAgKiBAbmFtZSBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGUjaXNQb3N0Q29tcGlsaW5nRW5hYmxlZFxuICAgICAgICogQG1ldGhvZE9mIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVxuICAgICAgICpcbiAgICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAgICogUmV0dXJucyB3aGV0aGVyIHBvc3QgY29tcGlsaW5nIGlzIGVuYWJsZWQgb3Igbm90XG4gICAgICAgKlxuICAgICAgICogQHJldHVybiB7Ym9vbH0gc3RvcmFnZSBrZXlcbiAgICAgICAqL1xuICAgICAgJHRyYW5zbGF0ZS5pc1Bvc3RDb21waWxpbmdFbmFibGVkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gJHBvc3RDb21waWxpbmdFbmFibGVkO1xuICAgICAgfTtcblxuICAgICAgLyoqXG4gICAgICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICAgICAqIEBuYW1lIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZSNyZWZyZXNoXG4gICAgICAgKiBAbWV0aG9kT2YgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlXG4gICAgICAgKlxuICAgICAgICogQGRlc2NyaXB0aW9uXG4gICAgICAgKiBSZWZyZXNoZXMgYSB0cmFuc2xhdGlvbiB0YWJsZSBwb2ludGVkIGJ5IHRoZSBnaXZlbiBsYW5nS2V5LiBJZiBsYW5nS2V5IGlzIG5vdCBzcGVjaWZpZWQsXG4gICAgICAgKiB0aGUgbW9kdWxlIHdpbGwgZHJvcCBhbGwgZXhpc3RlbnQgdHJhbnNsYXRpb24gdGFibGVzIGFuZCBsb2FkIG5ldyB2ZXJzaW9uIG9mIHRob3NlIHdoaWNoXG4gICAgICAgKiBhcmUgY3VycmVudGx5IGluIHVzZS5cbiAgICAgICAqXG4gICAgICAgKiBSZWZyZXNoIG1lYW5zIHRoYXQgdGhlIG1vZHVsZSB3aWxsIGRyb3AgdGFyZ2V0IHRyYW5zbGF0aW9uIHRhYmxlIGFuZCB0cnkgdG8gbG9hZCBpdCBhZ2Fpbi5cbiAgICAgICAqXG4gICAgICAgKiBJbiBjYXNlIHRoZXJlIGFyZSBubyBsb2FkZXJzIHJlZ2lzdGVyZWQgdGhlIHJlZnJlc2goKSBtZXRob2Qgd2lsbCB0aHJvdyBhbiBFcnJvci5cbiAgICAgICAqXG4gICAgICAgKiBJZiB0aGUgbW9kdWxlIGlzIGFibGUgdG8gcmVmcmVzaCB0cmFuc2xhdGlvbiB0YWJsZXMgcmVmcmVzaCgpIG1ldGhvZCB3aWxsIGJyb2FkY2FzdFxuICAgICAgICogJHRyYW5zbGF0ZVJlZnJlc2hTdGFydCBhbmQgJHRyYW5zbGF0ZVJlZnJlc2hFbmQgZXZlbnRzLlxuICAgICAgICpcbiAgICAgICAqIEBleGFtcGxlXG4gICAgICAgKiAvLyB0aGlzIHdpbGwgZHJvcCBhbGwgY3VycmVudGx5IGV4aXN0ZW50IHRyYW5zbGF0aW9uIHRhYmxlcyBhbmQgcmVsb2FkIHRob3NlIHdoaWNoIGFyZVxuICAgICAgICogLy8gY3VycmVudGx5IGluIHVzZVxuICAgICAgICogJHRyYW5zbGF0ZS5yZWZyZXNoKCk7XG4gICAgICAgKiAvLyB0aGlzIHdpbGwgcmVmcmVzaCBhIHRyYW5zbGF0aW9uIHRhYmxlIGZvciB0aGUgZW5fVVMgbGFuZ3VhZ2VcbiAgICAgICAqICR0cmFuc2xhdGUucmVmcmVzaCgnZW5fVVMnKTtcbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge3N0cmluZ30gbGFuZ0tleSBBIGxhbmd1YWdlIGtleSBvZiB0aGUgdGFibGUsIHdoaWNoIGhhcyB0byBiZSByZWZyZXNoZWRcbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJuIHtwcm9taXNlfSBQcm9taXNlLCB3aGljaCB3aWxsIGJlIHJlc29sdmVkIGluIGNhc2UgYSB0cmFuc2xhdGlvbiB0YWJsZXMgcmVmcmVzaGluZ1xuICAgICAgICogcHJvY2VzcyBpcyBmaW5pc2hlZCBzdWNjZXNzZnVsbHksIGFuZCByZWplY3QgaWYgbm90LlxuICAgICAgICovXG4gICAgICAkdHJhbnNsYXRlLnJlZnJlc2ggPSBmdW5jdGlvbiAobGFuZ0tleSkge1xuICAgICAgICBpZiAoISRsb2FkZXJGYWN0b3J5KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZG5cXCd0IHJlZnJlc2ggdHJhbnNsYXRpb24gdGFibGUsIG5vIGxvYWRlciByZWdpc3RlcmVkIScpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgICBmdW5jdGlvbiByZXNvbHZlKCkge1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcbiAgICAgICAgICAkcm9vdFNjb3BlLiRlbWl0KCckdHJhbnNsYXRlUmVmcmVzaEVuZCcsIHtsYW5ndWFnZTogbGFuZ0tleX0pO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0KCkge1xuICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xuICAgICAgICAgICRyb290U2NvcGUuJGVtaXQoJyR0cmFuc2xhdGVSZWZyZXNoRW5kJywge2xhbmd1YWdlOiBsYW5nS2V5fSk7XG4gICAgICAgIH1cblxuICAgICAgICAkcm9vdFNjb3BlLiRlbWl0KCckdHJhbnNsYXRlUmVmcmVzaFN0YXJ0Jywge2xhbmd1YWdlOiBsYW5nS2V5fSk7XG5cbiAgICAgICAgaWYgKCFsYW5nS2V5KSB7XG4gICAgICAgICAgLy8gaWYgdGhlcmUncyBubyBsYW5ndWFnZSBrZXkgc3BlY2lmaWVkIHdlIHJlZnJlc2ggQUxMIFRIRSBUSElOR1MhXG4gICAgICAgICAgdmFyIHRhYmxlcyA9IFtdLCBsb2FkaW5nS2V5cyA9IHt9O1xuXG4gICAgICAgICAgLy8gcmVsb2FkIHJlZ2lzdGVyZWQgZmFsbGJhY2sgbGFuZ3VhZ2VzXG4gICAgICAgICAgaWYgKCRmYWxsYmFja0xhbmd1YWdlICYmICRmYWxsYmFja0xhbmd1YWdlLmxlbmd0aCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9ICRmYWxsYmFja0xhbmd1YWdlLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgIHRhYmxlcy5wdXNoKGxvYWRBc3luYygkZmFsbGJhY2tMYW5ndWFnZVtpXSkpO1xuICAgICAgICAgICAgICBsb2FkaW5nS2V5c1skZmFsbGJhY2tMYW5ndWFnZVtpXV0gPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIHJlbG9hZCBjdXJyZW50bHkgdXNlZCBsYW5ndWFnZVxuICAgICAgICAgIGlmICgkdXNlcyAmJiAhbG9hZGluZ0tleXNbJHVzZXNdKSB7XG4gICAgICAgICAgICB0YWJsZXMucHVzaChsb2FkQXN5bmMoJHVzZXMpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAkcS5hbGwodGFibGVzKS50aGVuKGZ1bmN0aW9uICh0YWJsZURhdGEpIHtcbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCh0YWJsZURhdGEsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgIGlmICgkdHJhbnNsYXRpb25UYWJsZVtkYXRhLmtleV0pIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgJHRyYW5zbGF0aW9uVGFibGVbZGF0YS5rZXldO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHRyYW5zbGF0aW9ucyhkYXRhLmtleSwgZGF0YS50YWJsZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICgkdXNlcykge1xuICAgICAgICAgICAgICB1c2VMYW5ndWFnZSgkdXNlcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgfSBlbHNlIGlmICgkdHJhbnNsYXRpb25UYWJsZVtsYW5nS2V5XSkge1xuXG4gICAgICAgICAgbG9hZEFzeW5jKGxhbmdLZXkpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHRyYW5zbGF0aW9ucyhkYXRhLmtleSwgZGF0YS50YWJsZSk7XG4gICAgICAgICAgICBpZiAobGFuZ0tleSA9PT0gJHVzZXMpIHtcbiAgICAgICAgICAgICAgdXNlTGFuZ3VhZ2UoJHVzZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgIH0sIHJlamVjdCk7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgIH07XG5cbiAgICAgIC8qKlxuICAgICAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAgICAgKiBAbmFtZSBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGUjaW5zdGFudFxuICAgICAgICogQG1ldGhvZE9mIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZVxuICAgICAgICpcbiAgICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAgICogUmV0dXJucyBhIHRyYW5zbGF0aW9uIGluc3RhbnRseSBmcm9tIHRoZSBpbnRlcm5hbCBzdGF0ZSBvZiBsb2FkZWQgdHJhbnNsYXRpb24uIEFsbCBydWxlc1xuICAgICAgICogcmVnYXJkaW5nIHRoZSBjdXJyZW50IGxhbmd1YWdlLCB0aGUgcHJlZmVycmVkIGxhbmd1YWdlIG9mIGV2ZW4gZmFsbGJhY2sgbGFuZ3VhZ2VzIHdpbGwgYmVcbiAgICAgICAqIHVzZWQgZXhjZXB0IGFueSBwcm9taXNlIGhhbmRsaW5nLiBJZiBhIGxhbmd1YWdlIHdhcyBub3QgZm91bmQsIGFuIGFzeW5jaHJvbm91cyBsb2FkaW5nXG4gICAgICAgKiB3aWxsIGJlIGludm9rZWQgaW4gdGhlIGJhY2tncm91bmQuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtzdHJpbmd8YXJyYXl9IHRyYW5zbGF0aW9uSWQgQSB0b2tlbiB3aGljaCByZXByZXNlbnRzIGEgdHJhbnNsYXRpb24gaWRcbiAgICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRoaXMgY2FuIGJlIG9wdGlvbmFsbHkgYW4gYXJyYXkgb2YgdHJhbnNsYXRpb24gaWRzIHdoaWNoXG4gICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzIHRoYXQgdGhlIGZ1bmN0aW9uJ3MgcHJvbWlzZSByZXR1cm5zIGFuIG9iamVjdCB3aGVyZVxuICAgICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWFjaCBrZXkgaXMgdGhlIHRyYW5zbGF0aW9uIGlkIGFuZCB0aGUgdmFsdWUgdGhlIHRyYW5zbGF0aW9uLlxuICAgICAgICogQHBhcmFtIHtvYmplY3R9IGludGVycG9sYXRlUGFyYW1zIFBhcmFtc1xuICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGludGVycG9sYXRpb25JZCBUaGUgaWQgb2YgdGhlIGludGVycG9sYXRpb24gdG8gdXNlXG4gICAgICAgKlxuICAgICAgICogQHJldHVybiB7c3RyaW5nfSB0cmFuc2xhdGlvblxuICAgICAgICovXG4gICAgICAkdHJhbnNsYXRlLmluc3RhbnQgPSBmdW5jdGlvbiAodHJhbnNsYXRpb25JZCwgaW50ZXJwb2xhdGVQYXJhbXMsIGludGVycG9sYXRpb25JZCkge1xuXG4gICAgICAgIC8vIERldGVjdCB1bmRlZmluZWQgYW5kIG51bGwgdmFsdWVzIHRvIHNob3J0ZW4gdGhlIGV4ZWN1dGlvbiBhbmQgcHJldmVudCBleGNlcHRpb25zXG4gICAgICAgIGlmICh0cmFuc2xhdGlvbklkID09PSBudWxsIHx8IGFuZ3VsYXIuaXNVbmRlZmluZWQodHJhbnNsYXRpb25JZCkpIHtcbiAgICAgICAgICByZXR1cm4gdHJhbnNsYXRpb25JZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIER1Y2sgZGV0ZWN0aW9uOiBJZiB0aGUgZmlyc3QgYXJndW1lbnQgaXMgYW4gYXJyYXksIGEgYnVuY2ggb2YgdHJhbnNsYXRpb25zIHdhcyByZXF1ZXN0ZWQuXG4gICAgICAgIC8vIFRoZSByZXN1bHQgaXMgYW4gb2JqZWN0LlxuICAgICAgICBpZiAoYW5ndWxhci5pc0FycmF5KHRyYW5zbGF0aW9uSWQpKSB7XG4gICAgICAgICAgdmFyIHJlc3VsdHMgPSB7fTtcbiAgICAgICAgICBmb3IgKHZhciBpID0gMCwgYyA9IHRyYW5zbGF0aW9uSWQubGVuZ3RoOyBpIDwgYzsgaSsrKSB7XG4gICAgICAgICAgICByZXN1bHRzW3RyYW5zbGF0aW9uSWRbaV1dID0gJHRyYW5zbGF0ZS5pbnN0YW50KHRyYW5zbGF0aW9uSWRbaV0sIGludGVycG9sYXRlUGFyYW1zLCBpbnRlcnBvbGF0aW9uSWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFdlIGRpc2NhcmRlZCB1bmFjY2VwdGFibGUgdmFsdWVzLiBTbyB3ZSBqdXN0IG5lZWQgdG8gdmVyaWZ5IGlmIHRyYW5zbGF0aW9uSWQgaXMgZW1wdHkgU3RyaW5nXG4gICAgICAgIGlmIChhbmd1bGFyLmlzU3RyaW5nKHRyYW5zbGF0aW9uSWQpICYmIHRyYW5zbGF0aW9uSWQubGVuZ3RoIDwgMSkge1xuICAgICAgICAgIHJldHVybiB0cmFuc2xhdGlvbklkO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdHJpbSBvZmYgYW55IHdoaXRlc3BhY2VcbiAgICAgICAgaWYgKHRyYW5zbGF0aW9uSWQpIHtcbiAgICAgICAgICB0cmFuc2xhdGlvbklkID0gdHJpbS5hcHBseSh0cmFuc2xhdGlvbklkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciByZXN1bHQsIHBvc3NpYmxlTGFuZ0tleXMgPSBbXTtcbiAgICAgICAgaWYgKCRwcmVmZXJyZWRMYW5ndWFnZSkge1xuICAgICAgICAgIHBvc3NpYmxlTGFuZ0tleXMucHVzaCgkcHJlZmVycmVkTGFuZ3VhZ2UpO1xuICAgICAgICB9XG4gICAgICAgIGlmICgkdXNlcykge1xuICAgICAgICAgIHBvc3NpYmxlTGFuZ0tleXMucHVzaCgkdXNlcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCRmYWxsYmFja0xhbmd1YWdlICYmICRmYWxsYmFja0xhbmd1YWdlLmxlbmd0aCkge1xuICAgICAgICAgIHBvc3NpYmxlTGFuZ0tleXMgPSBwb3NzaWJsZUxhbmdLZXlzLmNvbmNhdCgkZmFsbGJhY2tMYW5ndWFnZSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgaiA9IDAsIGQgPSBwb3NzaWJsZUxhbmdLZXlzLmxlbmd0aDsgaiA8IGQ7IGorKykge1xuICAgICAgICAgIHZhciBwb3NzaWJsZUxhbmdLZXkgPSBwb3NzaWJsZUxhbmdLZXlzW2pdO1xuICAgICAgICAgIGlmICgkdHJhbnNsYXRpb25UYWJsZVtwb3NzaWJsZUxhbmdLZXldKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mICR0cmFuc2xhdGlvblRhYmxlW3Bvc3NpYmxlTGFuZ0tleV1bdHJhbnNsYXRpb25JZF0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgIHJlc3VsdCA9IGRldGVybWluZVRyYW5zbGF0aW9uSW5zdGFudCh0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgaW50ZXJwb2xhdGlvbklkKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoJG5vdEZvdW5kSW5kaWNhdG9yTGVmdCB8fCAkbm90Rm91bmRJbmRpY2F0b3JSaWdodCkge1xuICAgICAgICAgICAgICByZXN1bHQgPSBhcHBseU5vdEZvdW5kSW5kaWNhdG9ycyh0cmFuc2xhdGlvbklkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHR5cGVvZiByZXN1bHQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXJlc3VsdCAmJiByZXN1bHQgIT09ICcnKSB7XG4gICAgICAgICAgLy8gUmV0dXJuIHRyYW5zbGF0aW9uIG9mIGRlZmF1bHQgaW50ZXJwb2xhdG9yIGlmIG5vdCBmb3VuZCBhbnl0aGluZy5cbiAgICAgICAgICByZXN1bHQgPSBkZWZhdWx0SW50ZXJwb2xhdG9yLmludGVycG9sYXRlKHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zKTtcbiAgICAgICAgICBpZiAoJG1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXJGYWN0b3J5ICYmICFwZW5kaW5nTG9hZGVyKSB7XG4gICAgICAgICAgICByZXN1bHQgPSB0cmFuc2xhdGVCeUhhbmRsZXIodHJhbnNsYXRpb25JZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH07XG5cbiAgICAgIC8qKlxuICAgICAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAgICAgKiBAbmFtZSBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGUjdmVyc2lvbkluZm9cbiAgICAgICAqIEBtZXRob2RPZiBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVcbiAgICAgICAqXG4gICAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgICAqIFJldHVybnMgdGhlIGN1cnJlbnQgdmVyc2lvbiBpbmZvcm1hdGlvbiBmb3IgdGhlIGFuZ3VsYXItdHJhbnNsYXRlIGxpYnJhcnlcbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IGFuZ3VsYXItdHJhbnNsYXRlIHZlcnNpb25cbiAgICAgICAqL1xuICAgICAgJHRyYW5zbGF0ZS52ZXJzaW9uSW5mbyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHZlcnNpb247XG4gICAgICB9O1xuXG4gICAgICAvKipcbiAgICAgICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgICAgICogQG5hbWUgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlI2xvYWRlckNhY2hlXG4gICAgICAgKiBAbWV0aG9kT2YgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlXG4gICAgICAgKlxuICAgICAgICogQGRlc2NyaXB0aW9uXG4gICAgICAgKiBSZXR1cm5zIHRoZSBkZWZpbmVkIGxvYWRlckNhY2hlLlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm4ge2Jvb2xlYW58c3RyaW5nfG9iamVjdH0gY3VycmVudCB2YWx1ZSBvZiBsb2FkZXJDYWNoZVxuICAgICAgICovXG4gICAgICAkdHJhbnNsYXRlLmxvYWRlckNhY2hlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbG9hZGVyQ2FjaGU7XG4gICAgICB9O1xuXG4gICAgICAvLyBpbnRlcm5hbCBwdXJwb3NlIG9ubHlcbiAgICAgICR0cmFuc2xhdGUuZGlyZWN0aXZlUHJpb3JpdHkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBkaXJlY3RpdmVQcmlvcml0eTtcbiAgICAgIH07XG5cbiAgICAgIGlmICgkbG9hZGVyRmFjdG9yeSkge1xuXG4gICAgICAgIC8vIElmIGF0IGxlYXN0IG9uZSBhc3luYyBsb2FkZXIgaXMgZGVmaW5lZCBhbmQgdGhlcmUgYXJlIG5vXG4gICAgICAgIC8vIChkZWZhdWx0KSB0cmFuc2xhdGlvbnMgYXZhaWxhYmxlIHdlIHNob3VsZCB0cnkgdG8gbG9hZCB0aGVtLlxuICAgICAgICBpZiAoYW5ndWxhci5lcXVhbHMoJHRyYW5zbGF0aW9uVGFibGUsIHt9KSkge1xuICAgICAgICAgICR0cmFuc2xhdGUudXNlKCR0cmFuc2xhdGUudXNlKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWxzbywgaWYgdGhlcmUgYXJlIGFueSBmYWxsYmFjayBsYW5ndWFnZSByZWdpc3RlcmVkLCB3ZSBzdGFydFxuICAgICAgICAvLyBsb2FkaW5nIHRoZW0gYXN5bmNocm9ub3VzbHkgYXMgc29vbiBhcyB3ZSBjYW4uXG4gICAgICAgIGlmICgkZmFsbGJhY2tMYW5ndWFnZSAmJiAkZmFsbGJhY2tMYW5ndWFnZS5sZW5ndGgpIHtcbiAgICAgICAgICB2YXIgcHJvY2Vzc0FzeW5jUmVzdWx0ID0gZnVuY3Rpb24gKHRyYW5zbGF0aW9uKSB7XG4gICAgICAgICAgICB0cmFuc2xhdGlvbnModHJhbnNsYXRpb24ua2V5LCB0cmFuc2xhdGlvbi50YWJsZSk7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRlbWl0KCckdHJhbnNsYXRlQ2hhbmdlRW5kJywgeyBsYW5ndWFnZTogdHJhbnNsYXRpb24ua2V5IH0pO1xuICAgICAgICAgICAgcmV0dXJuIHRyYW5zbGF0aW9uO1xuICAgICAgICAgIH07XG4gICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9ICRmYWxsYmFja0xhbmd1YWdlLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICBsYW5nUHJvbWlzZXNbJGZhbGxiYWNrTGFuZ3VhZ2VbaV1dID0gbG9hZEFzeW5jKCRmYWxsYmFja0xhbmd1YWdlW2ldKS50aGVuKHByb2Nlc3NBc3luY1Jlc3VsdCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAkdHJhbnNsYXRlO1xuICAgIH1cbiAgXTtcbn1dKTtcblxuLyoqXG4gKiBAbmdkb2Mgb2JqZWN0XG4gKiBAbmFtZSBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVEZWZhdWx0SW50ZXJwb2xhdGlvblxuICogQHJlcXVpcmVzICRpbnRlcnBvbGF0ZVxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogVXNlcyBhbmd1bGFyJ3MgYCRpbnRlcnBvbGF0ZWAgc2VydmljZXMgdG8gaW50ZXJwb2xhdGUgc3RyaW5ncyBhZ2FpbnN0IHNvbWUgdmFsdWVzLlxuICpcbiAqIEByZXR1cm4ge29iamVjdH0gJHRyYW5zbGF0ZUludGVycG9sYXRvciBJbnRlcnBvbGF0b3Igc2VydmljZVxuICovXG5hbmd1bGFyLm1vZHVsZSgncGFzY2FscHJlY2h0LnRyYW5zbGF0ZScpLmZhY3RvcnkoJyR0cmFuc2xhdGVEZWZhdWx0SW50ZXJwb2xhdGlvbicsIFsnJGludGVycG9sYXRlJywgZnVuY3Rpb24gKCRpbnRlcnBvbGF0ZSkge1xuXG4gIHZhciAkdHJhbnNsYXRlSW50ZXJwb2xhdG9yID0ge30sXG4gICAgICAkbG9jYWxlLFxuICAgICAgJGlkZW50aWZpZXIgPSAnZGVmYXVsdCcsXG4gICAgICAkc2FuaXRpemVWYWx1ZVN0cmF0ZWd5ID0gbnVsbCxcbiAgICAgIC8vIG1hcCBvZiBhbGwgc2FuaXRpemUgc3RyYXRlZ2llc1xuICAgICAgc2FuaXRpemVWYWx1ZVN0cmF0ZWdpZXMgPSB7XG4gICAgICAgIGVzY2FwZWQ6IGZ1bmN0aW9uIChwYXJhbXMpIHtcbiAgICAgICAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgICAgICAgZm9yICh2YXIga2V5IGluIHBhcmFtcykge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChwYXJhbXMsIGtleSkpIHtcbiAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNOdW1iZXIocGFyYW1zW2tleV0pKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gPSBwYXJhbXNba2V5XTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9IGFuZ3VsYXIuZWxlbWVudCgnPGRpdj48L2Rpdj4nKS50ZXh0KHBhcmFtc1trZXldKS5odG1sKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICB2YXIgc2FuaXRpemVQYXJhbXMgPSBmdW5jdGlvbiAocGFyYW1zKSB7XG4gICAgdmFyIHJlc3VsdDtcbiAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKHNhbml0aXplVmFsdWVTdHJhdGVnaWVzWyRzYW5pdGl6ZVZhbHVlU3RyYXRlZ3ldKSkge1xuICAgICAgcmVzdWx0ID0gc2FuaXRpemVWYWx1ZVN0cmF0ZWdpZXNbJHNhbml0aXplVmFsdWVTdHJhdGVneV0ocGFyYW1zKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0ID0gcGFyYW1zO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8qKlxuICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICogQG5hbWUgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlRGVmYXVsdEludGVycG9sYXRpb24jc2V0TG9jYWxlXG4gICAqIEBtZXRob2RPZiBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVEZWZhdWx0SW50ZXJwb2xhdGlvblxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogU2V0cyBjdXJyZW50IGxvY2FsZSAodGhpcyBpcyBjdXJyZW50bHkgbm90IHVzZSBpbiB0aGlzIGludGVycG9sYXRpb24pLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbG9jYWxlIExhbmd1YWdlIGtleSBvciBsb2NhbGUuXG4gICAqL1xuICAkdHJhbnNsYXRlSW50ZXJwb2xhdG9yLnNldExvY2FsZSA9IGZ1bmN0aW9uIChsb2NhbGUpIHtcbiAgICAkbG9jYWxlID0gbG9jYWxlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICogQG5hbWUgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlRGVmYXVsdEludGVycG9sYXRpb24jZ2V0SW50ZXJwb2xhdGlvbklkZW50aWZpZXJcbiAgICogQG1ldGhvZE9mIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZURlZmF1bHRJbnRlcnBvbGF0aW9uXG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBSZXR1cm5zIGFuIGlkZW50aWZpZXIgZm9yIHRoaXMgaW50ZXJwb2xhdGlvbiBzZXJ2aWNlLlxuICAgKlxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSAkaWRlbnRpZmllclxuICAgKi9cbiAgJHRyYW5zbGF0ZUludGVycG9sYXRvci5nZXRJbnRlcnBvbGF0aW9uSWRlbnRpZmllciA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJGlkZW50aWZpZXI7XG4gIH07XG5cbiAgJHRyYW5zbGF0ZUludGVycG9sYXRvci51c2VTYW5pdGl6ZVZhbHVlU3RyYXRlZ3kgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAkc2FuaXRpemVWYWx1ZVN0cmF0ZWd5ID0gdmFsdWU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLiR0cmFuc2xhdGVEZWZhdWx0SW50ZXJwb2xhdGlvbiNpbnRlcnBvbGF0ZVxuICAgKiBAbWV0aG9kT2YgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlRGVmYXVsdEludGVycG9sYXRpb25cbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIEludGVycG9sYXRlcyBnaXZlbiBzdHJpbmcgYWdhaW5zIGdpdmVuIGludGVycG9sYXRlIHBhcmFtcyB1c2luZyBhbmd1bGFyc1xuICAgKiBgJGludGVycG9sYXRlYCBzZXJ2aWNlLlxuICAgKlxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSBpbnRlcnBvbGF0ZWQgc3RyaW5nLlxuICAgKi9cbiAgJHRyYW5zbGF0ZUludGVycG9sYXRvci5pbnRlcnBvbGF0ZSA9IGZ1bmN0aW9uIChzdHJpbmcsIGludGVycG9sYXRlUGFyYW1zKSB7XG4gICAgaWYgKCRzYW5pdGl6ZVZhbHVlU3RyYXRlZ3kpIHtcbiAgICAgIGludGVycG9sYXRlUGFyYW1zID0gc2FuaXRpemVQYXJhbXMoaW50ZXJwb2xhdGVQYXJhbXMpO1xuICAgIH1cbiAgICByZXR1cm4gJGludGVycG9sYXRlKHN0cmluZykoaW50ZXJwb2xhdGVQYXJhbXMgfHwge30pO1xuICB9O1xuXG4gIHJldHVybiAkdHJhbnNsYXRlSW50ZXJwb2xhdG9yO1xufV0pO1xuXG5hbmd1bGFyLm1vZHVsZSgncGFzY2FscHJlY2h0LnRyYW5zbGF0ZScpLmNvbnN0YW50KCckU1RPUkFHRV9LRVknLCAnTkdfVFJBTlNMQVRFX0xBTkdfS0VZJyk7XG5cbmFuZ3VsYXIubW9kdWxlKCdwYXNjYWxwcmVjaHQudHJhbnNsYXRlJylcbi8qKlxuICogQG5nZG9jIGRpcmVjdGl2ZVxuICogQG5hbWUgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS5kaXJlY3RpdmU6dHJhbnNsYXRlXG4gKiBAcmVxdWlyZXMgJGNvbXBpbGVcbiAqIEByZXF1aXJlcyAkZmlsdGVyXG4gKiBAcmVxdWlyZXMgJGludGVycG9sYXRlXG4gKiBAcmVzdHJpY3QgQVxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogVHJhbnNsYXRlcyBnaXZlbiB0cmFuc2xhdGlvbiBpZCBlaXRoZXIgdGhyb3VnaCBhdHRyaWJ1dGUgb3IgRE9NIGNvbnRlbnQuXG4gKiBJbnRlcm5hbGx5IGl0IHVzZXMgYHRyYW5zbGF0ZWAgZmlsdGVyIHRvIHRyYW5zbGF0ZSB0cmFuc2xhdGlvbiBpZC4gSXQgcG9zc2libGUgdG9cbiAqIHBhc3MgYW4gb3B0aW9uYWwgYHRyYW5zbGF0ZS12YWx1ZXNgIG9iamVjdCBsaXRlcmFsIGFzIHN0cmluZyBpbnRvIHRyYW5zbGF0aW9uIGlkLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nPX0gdHJhbnNsYXRlIFRyYW5zbGF0aW9uIGlkIHdoaWNoIGNvdWxkIGJlIGVpdGhlciBzdHJpbmcgb3IgaW50ZXJwb2xhdGVkIHN0cmluZy5cbiAqIEBwYXJhbSB7c3RyaW5nPX0gdHJhbnNsYXRlLXZhbHVlcyBWYWx1ZXMgdG8gcGFzcyBpbnRvIHRyYW5zbGF0aW9uIGlkLiBDYW4gYmUgcGFzc2VkIGFzIG9iamVjdCBsaXRlcmFsIHN0cmluZyBvciBpbnRlcnBvbGF0ZWQgb2JqZWN0LlxuICogQHBhcmFtIHtzdHJpbmc9fSB0cmFuc2xhdGUtYXR0ci1BVFRSIHRyYW5zbGF0ZSBUcmFuc2xhdGlvbiBpZCBhbmQgcHV0IGl0IGludG8gQVRUUiBhdHRyaWJ1dGUuXG4gKiBAcGFyYW0ge3N0cmluZz19IHRyYW5zbGF0ZS1kZWZhdWx0IHdpbGwgYmUgdXNlZCB1bmxlc3MgdHJhbnNsYXRpb24gd2FzIHN1Y2Nlc3NmdWxcbiAqIEBwYXJhbSB7Ym9vbGVhbj19IHRyYW5zbGF0ZS1jb21waWxlIChkZWZhdWx0IHRydWUgaWYgcHJlc2VudCkgZGVmaW5lcyBsb2NhbGx5IGFjdGl2YXRpb24gb2Yge0BsaW5rIHBhc2NhbHByZWNodC50cmFuc2xhdGUuJHRyYW5zbGF0ZSN1c2VQb3N0Q29tcGlsaW5nfVxuICpcbiAqIEBleGFtcGxlXG4gICA8ZXhhbXBsZSBtb2R1bGU9XCJuZ1ZpZXdcIj5cbiAgICA8ZmlsZSBuYW1lPVwiaW5kZXguaHRtbFwiPlxuICAgICAgPGRpdiBuZy1jb250cm9sbGVyPVwiVHJhbnNsYXRlQ3RybFwiPlxuXG4gICAgICAgIDxwcmUgdHJhbnNsYXRlPVwiVFJBTlNMQVRJT05fSURcIj48L3ByZT5cbiAgICAgICAgPHByZSB0cmFuc2xhdGU+VFJBTlNMQVRJT05fSUQ8L3ByZT5cbiAgICAgICAgPHByZSB0cmFuc2xhdGUgdHJhbnNsYXRlLWF0dHItdGl0bGU9XCJUUkFOU0xBVElPTl9JRFwiPjwvcHJlPlxuICAgICAgICA8cHJlIHRyYW5zbGF0ZT1cInt7dHJhbnNsYXRpb25JZH19XCI+PC9wcmU+XG4gICAgICAgIDxwcmUgdHJhbnNsYXRlPnt7dHJhbnNsYXRpb25JZH19PC9wcmU+XG4gICAgICAgIDxwcmUgdHJhbnNsYXRlPVwiV0lUSF9WQUxVRVNcIiB0cmFuc2xhdGUtdmFsdWVzPVwie3ZhbHVlOiA1fVwiPjwvcHJlPlxuICAgICAgICA8cHJlIHRyYW5zbGF0ZSB0cmFuc2xhdGUtdmFsdWVzPVwie3ZhbHVlOiA1fVwiPldJVEhfVkFMVUVTPC9wcmU+XG4gICAgICAgIDxwcmUgdHJhbnNsYXRlPVwiV0lUSF9WQUxVRVNcIiB0cmFuc2xhdGUtdmFsdWVzPVwie3t2YWx1ZXN9fVwiPjwvcHJlPlxuICAgICAgICA8cHJlIHRyYW5zbGF0ZSB0cmFuc2xhdGUtdmFsdWVzPVwie3t2YWx1ZXN9fVwiPldJVEhfVkFMVUVTPC9wcmU+XG4gICAgICAgIDxwcmUgdHJhbnNsYXRlIHRyYW5zbGF0ZS1hdHRyLXRpdGxlPVwiV0lUSF9WQUxVRVNcIiB0cmFuc2xhdGUtdmFsdWVzPVwie3t2YWx1ZXN9fVwiPjwvcHJlPlxuXG4gICAgICA8L2Rpdj5cbiAgICA8L2ZpbGU+XG4gICAgPGZpbGUgbmFtZT1cInNjcmlwdC5qc1wiPlxuICAgICAgYW5ndWxhci5tb2R1bGUoJ25nVmlldycsIFsncGFzY2FscHJlY2h0LnRyYW5zbGF0ZSddKVxuXG4gICAgICAuY29uZmlnKGZ1bmN0aW9uICgkdHJhbnNsYXRlUHJvdmlkZXIpIHtcblxuICAgICAgICAkdHJhbnNsYXRlUHJvdmlkZXIudHJhbnNsYXRpb25zKCdlbicse1xuICAgICAgICAgICdUUkFOU0xBVElPTl9JRCc6ICdIZWxsbyB0aGVyZSEnLFxuICAgICAgICAgICdXSVRIX1ZBTFVFUyc6ICdUaGUgZm9sbG93aW5nIHZhbHVlIGlzIGR5bmFtaWM6IHt7dmFsdWV9fSdcbiAgICAgICAgfSkucHJlZmVycmVkTGFuZ3VhZ2UoJ2VuJyk7XG5cbiAgICAgIH0pO1xuXG4gICAgICBhbmd1bGFyLm1vZHVsZSgnbmdWaWV3JykuY29udHJvbGxlcignVHJhbnNsYXRlQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUpIHtcbiAgICAgICAgJHNjb3BlLnRyYW5zbGF0aW9uSWQgPSAnVFJBTlNMQVRJT05fSUQnO1xuXG4gICAgICAgICRzY29wZS52YWx1ZXMgPSB7XG4gICAgICAgICAgdmFsdWU6IDc4XG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICA8L2ZpbGU+XG4gICAgPGZpbGUgbmFtZT1cInNjZW5hcmlvLmpzXCI+XG4gICAgICBpdCgnc2hvdWxkIHRyYW5zbGF0ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaW5qZWN0KGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkY29tcGlsZSkge1xuICAgICAgICAgICRyb290U2NvcGUudHJhbnNsYXRpb25JZCA9ICdUUkFOU0xBVElPTl9JRCc7XG5cbiAgICAgICAgICBlbGVtZW50ID0gJGNvbXBpbGUoJzxwIHRyYW5zbGF0ZT1cIlRSQU5TTEFUSU9OX0lEXCI+PC9wPicpKCRyb290U2NvcGUpO1xuICAgICAgICAgICRyb290U2NvcGUuJGRpZ2VzdCgpO1xuICAgICAgICAgIGV4cGVjdChlbGVtZW50LnRleHQoKSkudG9CZSgnSGVsbG8gdGhlcmUhJyk7XG5cbiAgICAgICAgICBlbGVtZW50ID0gJGNvbXBpbGUoJzxwIHRyYW5zbGF0ZT1cInt7dHJhbnNsYXRpb25JZH19XCI+PC9wPicpKCRyb290U2NvcGUpO1xuICAgICAgICAgICRyb290U2NvcGUuJGRpZ2VzdCgpO1xuICAgICAgICAgIGV4cGVjdChlbGVtZW50LnRleHQoKSkudG9CZSgnSGVsbG8gdGhlcmUhJyk7XG5cbiAgICAgICAgICBlbGVtZW50ID0gJGNvbXBpbGUoJzxwIHRyYW5zbGF0ZT5UUkFOU0xBVElPTl9JRDwvcD4nKSgkcm9vdFNjb3BlKTtcbiAgICAgICAgICAkcm9vdFNjb3BlLiRkaWdlc3QoKTtcbiAgICAgICAgICBleHBlY3QoZWxlbWVudC50ZXh0KCkpLnRvQmUoJ0hlbGxvIHRoZXJlIScpO1xuXG4gICAgICAgICAgZWxlbWVudCA9ICRjb21waWxlKCc8cCB0cmFuc2xhdGU+e3t0cmFuc2xhdGlvbklkfX08L3A+JykoJHJvb3RTY29wZSk7XG4gICAgICAgICAgJHJvb3RTY29wZS4kZGlnZXN0KCk7XG4gICAgICAgICAgZXhwZWN0KGVsZW1lbnQudGV4dCgpKS50b0JlKCdIZWxsbyB0aGVyZSEnKTtcblxuICAgICAgICAgIGVsZW1lbnQgPSAkY29tcGlsZSgnPHAgdHJhbnNsYXRlIHRyYW5zbGF0ZS1hdHRyLXRpdGxlPVwiVFJBTlNMQVRJT05fSURcIj48L3A+JykoJHJvb3RTY29wZSk7XG4gICAgICAgICAgJHJvb3RTY29wZS4kZGlnZXN0KCk7XG4gICAgICAgICAgZXhwZWN0KGVsZW1lbnQuYXR0cigndGl0bGUnKSkudG9CZSgnSGVsbG8gdGhlcmUhJyk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgPC9maWxlPlxuICAgPC9leGFtcGxlPlxuICovXG4uZGlyZWN0aXZlKCd0cmFuc2xhdGUnLCBbJyR0cmFuc2xhdGUnLCAnJHEnLCAnJGludGVycG9sYXRlJywgJyRjb21waWxlJywgJyRwYXJzZScsICckcm9vdFNjb3BlJywgZnVuY3Rpb24gKCR0cmFuc2xhdGUsICRxLCAkaW50ZXJwb2xhdGUsICRjb21waWxlLCAkcGFyc2UsICRyb290U2NvcGUpIHtcblxuICAvKipcbiAgICogQG5hbWUgdHJpbVxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogdHJpbSBwb2x5ZmlsbFxuICAgKlxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgc3RyaW5nIHN0cmlwcGVkIG9mIHdoaXRlc3BhY2UgZnJvbSBib3RoIGVuZHNcbiAgICovXG4gIHZhciB0cmltID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdBRScsXG4gICAgc2NvcGU6IHRydWUsXG4gICAgcHJpb3JpdHk6ICR0cmFuc2xhdGUuZGlyZWN0aXZlUHJpb3JpdHkoKSxcbiAgICBjb21waWxlOiBmdW5jdGlvbiAodEVsZW1lbnQsIHRBdHRyKSB7XG5cbiAgICAgIHZhciB0cmFuc2xhdGVWYWx1ZXNFeGlzdCA9ICh0QXR0ci50cmFuc2xhdGVWYWx1ZXMpID9cbiAgICAgICAgdEF0dHIudHJhbnNsYXRlVmFsdWVzIDogdW5kZWZpbmVkO1xuXG4gICAgICB2YXIgdHJhbnNsYXRlSW50ZXJwb2xhdGlvbiA9ICh0QXR0ci50cmFuc2xhdGVJbnRlcnBvbGF0aW9uKSA/XG4gICAgICAgIHRBdHRyLnRyYW5zbGF0ZUludGVycG9sYXRpb24gOiB1bmRlZmluZWQ7XG5cbiAgICAgIHZhciB0cmFuc2xhdGVWYWx1ZUV4aXN0ID0gdEVsZW1lbnRbMF0ub3V0ZXJIVE1MLm1hdGNoKC90cmFuc2xhdGUtdmFsdWUtKy9pKTtcblxuICAgICAgdmFyIGludGVycG9sYXRlUmVnRXhwID0gJ14oLiopKCcgKyAkaW50ZXJwb2xhdGUuc3RhcnRTeW1ib2woKSArICcuKicgKyAkaW50ZXJwb2xhdGUuZW5kU3ltYm9sKCkgKyAnKSguKiknLFxuICAgICAgICAgIHdhdGNoZXJSZWdFeHAgPSAnXiguKiknICsgJGludGVycG9sYXRlLnN0YXJ0U3ltYm9sKCkgKyAnKC4qKScgKyAkaW50ZXJwb2xhdGUuZW5kU3ltYm9sKCkgKyAnKC4qKSc7XG5cbiAgICAgIHJldHVybiBmdW5jdGlvbiBsaW5rRm4oc2NvcGUsIGlFbGVtZW50LCBpQXR0cikge1xuXG4gICAgICAgIHNjb3BlLmludGVycG9sYXRlUGFyYW1zID0ge307XG4gICAgICAgIHNjb3BlLnByZVRleHQgPSAnJztcbiAgICAgICAgc2NvcGUucG9zdFRleHQgPSAnJztcbiAgICAgICAgdmFyIHRyYW5zbGF0aW9uSWRzID0ge307XG5cbiAgICAgICAgLy8gRW5zdXJlcyBhbnkgY2hhbmdlIG9mIHRoZSBhdHRyaWJ1dGUgXCJ0cmFuc2xhdGVcIiBjb250YWluaW5nIHRoZSBpZCB3aWxsXG4gICAgICAgIC8vIGJlIHJlLXN0b3JlZCB0byB0aGUgc2NvcGUncyBcInRyYW5zbGF0aW9uSWRcIi5cbiAgICAgICAgLy8gSWYgdGhlIGF0dHJpYnV0ZSBoYXMgbm8gY29udGVudCwgdGhlIGVsZW1lbnQncyB0ZXh0IHZhbHVlICh3aGl0ZSBzcGFjZXMgdHJpbW1lZCBvZmYpIHdpbGwgYmUgdXNlZC5cbiAgICAgICAgdmFyIG9ic2VydmVFbGVtZW50VHJhbnNsYXRpb24gPSBmdW5jdGlvbiAodHJhbnNsYXRpb25JZCkge1xuXG4gICAgICAgICAgLy8gUmVtb3ZlIGFueSBvbGQgd2F0Y2hlclxuICAgICAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24ob2JzZXJ2ZUVsZW1lbnRUcmFuc2xhdGlvbi5fdW53YXRjaE9sZCkpIHtcbiAgICAgICAgICAgIG9ic2VydmVFbGVtZW50VHJhbnNsYXRpb24uX3Vud2F0Y2hPbGQoKTtcbiAgICAgICAgICAgIG9ic2VydmVFbGVtZW50VHJhbnNsYXRpb24uX3Vud2F0Y2hPbGQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGFuZ3VsYXIuZXF1YWxzKHRyYW5zbGF0aW9uSWQgLCAnJykgfHwgIWFuZ3VsYXIuaXNEZWZpbmVkKHRyYW5zbGF0aW9uSWQpKSB7XG4gICAgICAgICAgICAvLyBSZXNvbHZlIHRyYW5zbGF0aW9uIGlkIGJ5IGlubmVyIGh0bWwgaWYgcmVxdWlyZWRcbiAgICAgICAgICAgIHZhciBpbnRlcnBvbGF0ZU1hdGNoZXMgPSB0cmltLmFwcGx5KGlFbGVtZW50LnRleHQoKSkubWF0Y2goaW50ZXJwb2xhdGVSZWdFeHApO1xuICAgICAgICAgICAgLy8gSW50ZXJwb2xhdGUgdHJhbnNsYXRpb24gaWQgaWYgcmVxdWlyZWRcbiAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzQXJyYXkoaW50ZXJwb2xhdGVNYXRjaGVzKSkge1xuICAgICAgICAgICAgICBzY29wZS5wcmVUZXh0ID0gaW50ZXJwb2xhdGVNYXRjaGVzWzFdO1xuICAgICAgICAgICAgICBzY29wZS5wb3N0VGV4dCA9IGludGVycG9sYXRlTWF0Y2hlc1szXTtcbiAgICAgICAgICAgICAgdHJhbnNsYXRpb25JZHMudHJhbnNsYXRlID0gJGludGVycG9sYXRlKGludGVycG9sYXRlTWF0Y2hlc1syXSkoc2NvcGUuJHBhcmVudCk7XG4gICAgICAgICAgICAgIHZhciB3YXRjaGVyTWF0Y2hlcyA9IGlFbGVtZW50LnRleHQoKS5tYXRjaCh3YXRjaGVyUmVnRXhwKTtcbiAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNBcnJheSh3YXRjaGVyTWF0Y2hlcykgJiYgd2F0Y2hlck1hdGNoZXNbMl0gJiYgd2F0Y2hlck1hdGNoZXNbMl0ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZUVsZW1lbnRUcmFuc2xhdGlvbi5fdW53YXRjaE9sZCA9IHNjb3BlLiR3YXRjaCh3YXRjaGVyTWF0Y2hlc1syXSwgZnVuY3Rpb24gKG5ld1ZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICB0cmFuc2xhdGlvbklkcy50cmFuc2xhdGUgPSBuZXdWYWx1ZTtcbiAgICAgICAgICAgICAgICAgIHVwZGF0ZVRyYW5zbGF0aW9ucygpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0cmFuc2xhdGlvbklkcy50cmFuc2xhdGUgPSBpRWxlbWVudC50ZXh0KCkucmVwbGFjZSgvXlxccyt8XFxzKyQvZywnJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRyYW5zbGF0aW9uSWRzLnRyYW5zbGF0ZSA9IHRyYW5zbGF0aW9uSWQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIHVwZGF0ZVRyYW5zbGF0aW9ucygpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBvYnNlcnZlQXR0cmlidXRlVHJhbnNsYXRpb24gPSBmdW5jdGlvbiAodHJhbnNsYXRlQXR0cikge1xuICAgICAgICAgIGlBdHRyLiRvYnNlcnZlKHRyYW5zbGF0ZUF0dHIsIGZ1bmN0aW9uICh0cmFuc2xhdGlvbklkKSB7XG4gICAgICAgICAgICB0cmFuc2xhdGlvbklkc1t0cmFuc2xhdGVBdHRyXSA9IHRyYW5zbGF0aW9uSWQ7XG4gICAgICAgICAgICB1cGRhdGVUcmFuc2xhdGlvbnMoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgZmlyc3RBdHRyaWJ1dGVDaGFuZ2VkRXZlbnQgPSB0cnVlO1xuICAgICAgICBpQXR0ci4kb2JzZXJ2ZSgndHJhbnNsYXRlJywgZnVuY3Rpb24gKHRyYW5zbGF0aW9uSWQpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIHRyYW5zbGF0aW9uSWQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAvLyBjYXNlIG9mIGVsZW1lbnQgXCI8dHJhbnNsYXRlPnh5ejwvdHJhbnNsYXRlPlwiXG4gICAgICAgICAgICBvYnNlcnZlRWxlbWVudFRyYW5zbGF0aW9uKCcnKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gY2FzZSBvZiByZWd1bGFyIGF0dHJpYnV0ZVxuICAgICAgICAgICAgaWYgKHRyYW5zbGF0aW9uSWQgIT09ICcnIHx8ICFmaXJzdEF0dHJpYnV0ZUNoYW5nZWRFdmVudCkge1xuICAgICAgICAgICAgICB0cmFuc2xhdGlvbklkcy50cmFuc2xhdGUgPSB0cmFuc2xhdGlvbklkO1xuICAgICAgICAgICAgICB1cGRhdGVUcmFuc2xhdGlvbnMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgZmlyc3RBdHRyaWJ1dGVDaGFuZ2VkRXZlbnQgPSBmYWxzZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZm9yICh2YXIgdHJhbnNsYXRlQXR0ciBpbiBpQXR0cikge1xuICAgICAgICAgIGlmIChpQXR0ci5oYXNPd25Qcm9wZXJ0eSh0cmFuc2xhdGVBdHRyKSAmJiB0cmFuc2xhdGVBdHRyLnN1YnN0cigwLCAxMykgPT09ICd0cmFuc2xhdGVBdHRyJykge1xuICAgICAgICAgICAgb2JzZXJ2ZUF0dHJpYnV0ZVRyYW5zbGF0aW9uKHRyYW5zbGF0ZUF0dHIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlBdHRyLiRvYnNlcnZlKCd0cmFuc2xhdGVEZWZhdWx0JywgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgc2NvcGUuZGVmYXVsdFRleHQgPSB2YWx1ZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHRyYW5zbGF0ZVZhbHVlc0V4aXN0KSB7XG4gICAgICAgICAgaUF0dHIuJG9ic2VydmUoJ3RyYW5zbGF0ZVZhbHVlcycsIGZ1bmN0aW9uIChpbnRlcnBvbGF0ZVBhcmFtcykge1xuICAgICAgICAgICAgaWYgKGludGVycG9sYXRlUGFyYW1zKSB7XG4gICAgICAgICAgICAgIHNjb3BlLiRwYXJlbnQuJHdhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmV4dGVuZChzY29wZS5pbnRlcnBvbGF0ZVBhcmFtcywgJHBhcnNlKGludGVycG9sYXRlUGFyYW1zKShzY29wZS4kcGFyZW50KSk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRyYW5zbGF0ZVZhbHVlRXhpc3QpIHtcbiAgICAgICAgICB2YXIgb2JzZXJ2ZVZhbHVlQXR0cmlidXRlID0gZnVuY3Rpb24gKGF0dHJOYW1lKSB7XG4gICAgICAgICAgICBpQXR0ci4kb2JzZXJ2ZShhdHRyTmFtZSwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgIHZhciBhdHRyaWJ1dGVOYW1lID0gYW5ndWxhci5sb3dlcmNhc2UoYXR0ck5hbWUuc3Vic3RyKDE0LCAxKSkgKyBhdHRyTmFtZS5zdWJzdHIoMTUpO1xuICAgICAgICAgICAgICBzY29wZS5pbnRlcnBvbGF0ZVBhcmFtc1thdHRyaWJ1dGVOYW1lXSA9IHZhbHVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgICBmb3IgKHZhciBhdHRyIGluIGlBdHRyKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGlBdHRyLCBhdHRyKSAmJiBhdHRyLnN1YnN0cigwLCAxNCkgPT09ICd0cmFuc2xhdGVWYWx1ZScgJiYgYXR0ciAhPT0gJ3RyYW5zbGF0ZVZhbHVlcycpIHtcbiAgICAgICAgICAgICAgb2JzZXJ2ZVZhbHVlQXR0cmlidXRlKGF0dHIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE1hc3RlciB1cGRhdGUgZnVuY3Rpb25cbiAgICAgICAgdmFyIHVwZGF0ZVRyYW5zbGF0aW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gdHJhbnNsYXRpb25JZHMpIHtcbiAgICAgICAgICAgIGlmICh0cmFuc2xhdGlvbklkcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgIHVwZGF0ZVRyYW5zbGF0aW9uKGtleSwgdHJhbnNsYXRpb25JZHNba2V5XSwgc2NvcGUsIHNjb3BlLmludGVycG9sYXRlUGFyYW1zLCBzY29wZS5kZWZhdWx0VGV4dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFB1dCB0cmFuc2xhdGlvbiBwcm9jZXNzaW5nIGZ1bmN0aW9uIG91dHNpZGUgbG9vcFxuICAgICAgICB2YXIgdXBkYXRlVHJhbnNsYXRpb24gPSBmdW5jdGlvbih0cmFuc2xhdGVBdHRyLCB0cmFuc2xhdGlvbklkLCBzY29wZSwgaW50ZXJwb2xhdGVQYXJhbXMsIGRlZmF1bHRUcmFuc2xhdGlvblRleHQpIHtcbiAgICAgICAgICBpZiAodHJhbnNsYXRpb25JZCkge1xuICAgICAgICAgICAgJHRyYW5zbGF0ZSh0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgdHJhbnNsYXRlSW50ZXJwb2xhdGlvbiwgZGVmYXVsdFRyYW5zbGF0aW9uVGV4dClcbiAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHRyYW5zbGF0aW9uKSB7XG4gICAgICAgICAgICAgICAgYXBwbHlUcmFuc2xhdGlvbih0cmFuc2xhdGlvbiwgc2NvcGUsIHRydWUsIHRyYW5zbGF0ZUF0dHIpO1xuICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAodHJhbnNsYXRpb25JZCkge1xuICAgICAgICAgICAgICAgIGFwcGx5VHJhbnNsYXRpb24odHJhbnNsYXRpb25JZCwgc2NvcGUsIGZhbHNlLCB0cmFuc2xhdGVBdHRyKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGFzIGFuIGVtcHR5IHN0cmluZyBjYW5ub3QgYmUgdHJhbnNsYXRlZCwgd2UgY2FuIHNvbHZlIHRoaXMgdXNpbmcgc3VjY2Vzc2Z1bD1mYWxzZVxuICAgICAgICAgICAgYXBwbHlUcmFuc2xhdGlvbih0cmFuc2xhdGlvbklkLCBzY29wZSwgZmFsc2UsIHRyYW5zbGF0ZUF0dHIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgYXBwbHlUcmFuc2xhdGlvbiA9IGZ1bmN0aW9uICh2YWx1ZSwgc2NvcGUsIHN1Y2Nlc3NmdWwsIHRyYW5zbGF0ZUF0dHIpIHtcbiAgICAgICAgICBpZiAodHJhbnNsYXRlQXR0ciA9PT0gJ3RyYW5zbGF0ZScpIHtcbiAgICAgICAgICAgIC8vIGRlZmF1bHQgdHJhbnNsYXRlIGludG8gaW5uZXJIVE1MXG4gICAgICAgICAgICBpZiAoIXN1Y2Nlc3NmdWwgJiYgdHlwZW9mIHNjb3BlLmRlZmF1bHRUZXh0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICB2YWx1ZSA9IHNjb3BlLmRlZmF1bHRUZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaUVsZW1lbnQuaHRtbChzY29wZS5wcmVUZXh0ICsgdmFsdWUgKyBzY29wZS5wb3N0VGV4dCk7XG4gICAgICAgICAgICB2YXIgZ2xvYmFsbHlFbmFibGVkID0gJHRyYW5zbGF0ZS5pc1Bvc3RDb21waWxpbmdFbmFibGVkKCk7XG4gICAgICAgICAgICB2YXIgbG9jYWxseURlZmluZWQgPSB0eXBlb2YgdEF0dHIudHJhbnNsYXRlQ29tcGlsZSAhPT0gJ3VuZGVmaW5lZCc7XG4gICAgICAgICAgICB2YXIgbG9jYWxseUVuYWJsZWQgPSBsb2NhbGx5RGVmaW5lZCAmJiB0QXR0ci50cmFuc2xhdGVDb21waWxlICE9PSAnZmFsc2UnO1xuICAgICAgICAgICAgaWYgKChnbG9iYWxseUVuYWJsZWQgJiYgIWxvY2FsbHlEZWZpbmVkKSB8fCBsb2NhbGx5RW5hYmxlZCkge1xuICAgICAgICAgICAgICAkY29tcGlsZShpRWxlbWVudC5jb250ZW50cygpKShzY29wZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHRyYW5zbGF0ZSBhdHRyaWJ1dGVcbiAgICAgICAgICAgIGlmICghc3VjY2Vzc2Z1bCAmJiB0eXBlb2Ygc2NvcGUuZGVmYXVsdFRleHQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgIHZhbHVlID0gc2NvcGUuZGVmYXVsdFRleHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgYXR0cmlidXRlTmFtZSA9IGlBdHRyLiRhdHRyW3RyYW5zbGF0ZUF0dHJdLnN1YnN0cigxNSk7XG4gICAgICAgICAgICBpRWxlbWVudC5hdHRyKGF0dHJpYnV0ZU5hbWUsIHZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgc2NvcGUuJHdhdGNoKCdpbnRlcnBvbGF0ZVBhcmFtcycsIHVwZGF0ZVRyYW5zbGF0aW9ucywgdHJ1ZSk7XG5cbiAgICAgICAgLy8gRW5zdXJlcyB0aGUgdGV4dCB3aWxsIGJlIHJlZnJlc2hlZCBhZnRlciB0aGUgY3VycmVudCBsYW5ndWFnZSB3YXMgY2hhbmdlZFxuICAgICAgICAvLyB3LyAkdHJhbnNsYXRlLnVzZSguLi4pXG4gICAgICAgIHZhciB1bmJpbmQgPSAkcm9vdFNjb3BlLiRvbignJHRyYW5zbGF0ZUNoYW5nZVN1Y2Nlc3MnLCB1cGRhdGVUcmFuc2xhdGlvbnMpO1xuXG4gICAgICAgIC8vIGVuc3VyZSB0cmFuc2xhdGlvbiB3aWxsIGJlIGxvb2tlZCB1cCBhdCBsZWFzdCBvbmVcbiAgICAgICAgaWYgKGlFbGVtZW50LnRleHQoKS5sZW5ndGgpIHtcbiAgICAgICAgICBvYnNlcnZlRWxlbWVudFRyYW5zbGF0aW9uKCcnKTtcbiAgICAgICAgfVxuICAgICAgICB1cGRhdGVUcmFuc2xhdGlvbnMoKTtcbiAgICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIHVuYmluZCk7XG4gICAgICB9O1xuICAgIH1cbiAgfTtcbn1dKTtcblxuYW5ndWxhci5tb2R1bGUoJ3Bhc2NhbHByZWNodC50cmFuc2xhdGUnKVxuLyoqXG4gKiBAbmdkb2MgZGlyZWN0aXZlXG4gKiBAbmFtZSBwYXNjYWxwcmVjaHQudHJhbnNsYXRlLmRpcmVjdGl2ZTp0cmFuc2xhdGVDbG9ha1xuICogQHJlcXVpcmVzICRyb290U2NvcGVcbiAqIEByZXF1aXJlcyAkdHJhbnNsYXRlXG4gKiBAcmVzdHJpY3QgQVxuICpcbiAqICRkZXNjcmlwdGlvblxuICogQWRkcyBhIGB0cmFuc2xhdGUtY2xvYWtgIGNsYXNzIG5hbWUgdG8gdGhlIGdpdmVuIGVsZW1lbnQgd2hlcmUgdGhpcyBkaXJlY3RpdmVcbiAqIGlzIGFwcGxpZWQgaW5pdGlhbGx5IGFuZCByZW1vdmVzIGl0LCBvbmNlIGEgbG9hZGVyIGhhcyBmaW5pc2hlZCBsb2FkaW5nLlxuICpcbiAqIFRoaXMgZGlyZWN0aXZlIGNhbiBiZSB1c2VkIHRvIHByZXZlbnQgaW5pdGlhbCBmbGlja2VyaW5nIHdoZW4gbG9hZGluZyB0cmFuc2xhdGlvblxuICogZGF0YSBhc3luY2hyb25vdXNseS5cbiAqXG4gKiBUaGUgY2xhc3MgbmFtZSBpcyBkZWZpbmVkIGluXG4gKiB7QGxpbmsgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlUHJvdmlkZXIjY2xvYWtDbGFzc05hbWUgJHRyYW5zbGF0ZS5jbG9ha0NsYXNzTmFtZSgpfS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZz19IHRyYW5zbGF0ZS1jbG9hayBJZiBhIHRyYW5zbGF0aW9uSWQgaXMgcHJvdmlkZWQsIGl0IHdpbGwgYmUgdXNlZCBmb3Igc2hvd2luZ1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3IgaGlkaW5nIHRoZSBjbG9hay4gQmFzaWNhbGx5IGl0IHJlbGllcyBvbiB0aGUgdHJhbnNsYXRpb25cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUuXG4gKi9cbi5kaXJlY3RpdmUoJ3RyYW5zbGF0ZUNsb2FrJywgWyckcm9vdFNjb3BlJywgJyR0cmFuc2xhdGUnLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJHRyYW5zbGF0ZSkge1xuXG4gIHJldHVybiB7XG4gICAgY29tcGlsZTogZnVuY3Rpb24gKHRFbGVtZW50KSB7XG4gICAgICB2YXIgYXBwbHlDbG9hayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdEVsZW1lbnQuYWRkQ2xhc3MoJHRyYW5zbGF0ZS5jbG9ha0NsYXNzTmFtZSgpKTtcbiAgICAgIH0sXG4gICAgICByZW1vdmVDbG9hayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdEVsZW1lbnQucmVtb3ZlQ2xhc3MoJHRyYW5zbGF0ZS5jbG9ha0NsYXNzTmFtZSgpKTtcbiAgICAgIH0sXG4gICAgICByZW1vdmVMaXN0ZW5lciA9ICRyb290U2NvcGUuJG9uKCckdHJhbnNsYXRlQ2hhbmdlRW5kJywgZnVuY3Rpb24gKCkge1xuICAgICAgICByZW1vdmVDbG9haygpO1xuICAgICAgICByZW1vdmVMaXN0ZW5lcigpO1xuICAgICAgICByZW1vdmVMaXN0ZW5lciA9IG51bGw7XG4gICAgICB9KTtcbiAgICAgIGFwcGx5Q2xvYWsoKTtcblxuICAgICAgcmV0dXJuIGZ1bmN0aW9uIGxpbmtGbihzY29wZSwgaUVsZW1lbnQsIGlBdHRyKSB7XG4gICAgICAgIC8vIFJlZ2lzdGVyIGEgd2F0Y2hlciBmb3IgdGhlIGRlZmluZWQgdHJhbnNsYXRpb24gYWxsb3dpbmcgYSBmaW5lIHR1bmVkIGNsb2FrXG4gICAgICAgIGlmIChpQXR0ci50cmFuc2xhdGVDbG9hayAmJiBpQXR0ci50cmFuc2xhdGVDbG9hay5sZW5ndGgpIHtcbiAgICAgICAgICBpQXR0ci4kb2JzZXJ2ZSgndHJhbnNsYXRlQ2xvYWsnLCBmdW5jdGlvbiAodHJhbnNsYXRpb25JZCkge1xuICAgICAgICAgICAgJHRyYW5zbGF0ZSh0cmFuc2xhdGlvbklkKS50aGVuKHJlbW92ZUNsb2FrLCBhcHBseUNsb2FrKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG4gIH07XG59XSk7XG5cbmFuZ3VsYXIubW9kdWxlKCdwYXNjYWxwcmVjaHQudHJhbnNsYXRlJylcbi8qKlxuICogQG5nZG9jIGZpbHRlclxuICogQG5hbWUgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS5maWx0ZXI6dHJhbnNsYXRlXG4gKiBAcmVxdWlyZXMgJHBhcnNlXG4gKiBAcmVxdWlyZXMgcGFzY2FscHJlY2h0LnRyYW5zbGF0ZS4kdHJhbnNsYXRlXG4gKiBAZnVuY3Rpb25cbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIFVzZXMgYCR0cmFuc2xhdGVgIHNlcnZpY2UgdG8gdHJhbnNsYXRlIGNvbnRlbnRzLiBBY2NlcHRzIGludGVycG9sYXRlIHBhcmFtZXRlcnNcbiAqIHRvIHBhc3MgZHluYW1pemVkIHZhbHVlcyB0aG91Z2ggdHJhbnNsYXRpb24uXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHRyYW5zbGF0aW9uSWQgQSB0cmFuc2xhdGlvbiBpZCB0byBiZSB0cmFuc2xhdGVkLlxuICogQHBhcmFtIHsqPX0gaW50ZXJwb2xhdGVQYXJhbXMgT3B0aW9uYWwgb2JqZWN0IGxpdGVyYWwgKGFzIGhhc2ggb3Igc3RyaW5nKSB0byBwYXNzIHZhbHVlcyBpbnRvIHRyYW5zbGF0aW9uLlxuICpcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRyYW5zbGF0ZWQgdGV4dC5cbiAqXG4gKiBAZXhhbXBsZVxuICAgPGV4YW1wbGUgbW9kdWxlPVwibmdWaWV3XCI+XG4gICAgPGZpbGUgbmFtZT1cImluZGV4Lmh0bWxcIj5cbiAgICAgIDxkaXYgbmctY29udHJvbGxlcj1cIlRyYW5zbGF0ZUN0cmxcIj5cblxuICAgICAgICA8cHJlPnt7ICdUUkFOU0xBVElPTl9JRCcgfCB0cmFuc2xhdGUgfX08L3ByZT5cbiAgICAgICAgPHByZT57eyB0cmFuc2xhdGlvbklkIHwgdHJhbnNsYXRlIH19PC9wcmU+XG4gICAgICAgIDxwcmU+e3sgJ1dJVEhfVkFMVUVTJyB8IHRyYW5zbGF0ZTone3ZhbHVlOiA1fScgfX08L3ByZT5cbiAgICAgICAgPHByZT57eyAnV0lUSF9WQUxVRVMnIHwgdHJhbnNsYXRlOnZhbHVlcyB9fTwvcHJlPlxuXG4gICAgICA8L2Rpdj5cbiAgICA8L2ZpbGU+XG4gICAgPGZpbGUgbmFtZT1cInNjcmlwdC5qc1wiPlxuICAgICAgYW5ndWxhci5tb2R1bGUoJ25nVmlldycsIFsncGFzY2FscHJlY2h0LnRyYW5zbGF0ZSddKVxuXG4gICAgICAuY29uZmlnKGZ1bmN0aW9uICgkdHJhbnNsYXRlUHJvdmlkZXIpIHtcblxuICAgICAgICAkdHJhbnNsYXRlUHJvdmlkZXIudHJhbnNsYXRpb25zKCdlbicsIHtcbiAgICAgICAgICAnVFJBTlNMQVRJT05fSUQnOiAnSGVsbG8gdGhlcmUhJyxcbiAgICAgICAgICAnV0lUSF9WQUxVRVMnOiAnVGhlIGZvbGxvd2luZyB2YWx1ZSBpcyBkeW5hbWljOiB7e3ZhbHVlfX0nXG4gICAgICAgIH0pO1xuICAgICAgICAkdHJhbnNsYXRlUHJvdmlkZXIucHJlZmVycmVkTGFuZ3VhZ2UoJ2VuJyk7XG5cbiAgICAgIH0pO1xuXG4gICAgICBhbmd1bGFyLm1vZHVsZSgnbmdWaWV3JykuY29udHJvbGxlcignVHJhbnNsYXRlQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUpIHtcbiAgICAgICAgJHNjb3BlLnRyYW5zbGF0aW9uSWQgPSAnVFJBTlNMQVRJT05fSUQnO1xuXG4gICAgICAgICRzY29wZS52YWx1ZXMgPSB7XG4gICAgICAgICAgdmFsdWU6IDc4XG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICA8L2ZpbGU+XG4gICA8L2V4YW1wbGU+XG4gKi9cbi5maWx0ZXIoJ3RyYW5zbGF0ZScsIFsnJHBhcnNlJywgJyR0cmFuc2xhdGUnLCBmdW5jdGlvbiAoJHBhcnNlLCAkdHJhbnNsYXRlKSB7XG4gIHZhciB0cmFuc2xhdGVGaWx0ZXIgPSBmdW5jdGlvbiAodHJhbnNsYXRpb25JZCwgaW50ZXJwb2xhdGVQYXJhbXMsIGludGVycG9sYXRpb24pIHtcblxuICAgIGlmICghYW5ndWxhci5pc09iamVjdChpbnRlcnBvbGF0ZVBhcmFtcykpIHtcbiAgICAgIGludGVycG9sYXRlUGFyYW1zID0gJHBhcnNlKGludGVycG9sYXRlUGFyYW1zKSh0aGlzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gJHRyYW5zbGF0ZS5pbnN0YW50KHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zLCBpbnRlcnBvbGF0aW9uKTtcbiAgfTtcblxuICAvLyBTaW5jZSBBbmd1bGFySlMgMS4zLCBmaWx0ZXJzIHdoaWNoIGFyZSBub3Qgc3RhdGVsZXNzIChkZXBlbmRpbmcgYXQgdGhlIHNjb3BlKVxuICAvLyBoYXZlIHRvIGV4cGxpY2l0IGRlZmluZSB0aGlzIGJlaGF2aW9yLlxuICB0cmFuc2xhdGVGaWx0ZXIuJHN0YXRlZnVsID0gdHJ1ZTtcblxuICByZXR1cm4gdHJhbnNsYXRlRmlsdGVyO1xufV0pO1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9PYmplY3RQYXRoLmpzJykuT2JqZWN0UGF0aDtcbiIsIid1c2Ugc3RyaWN0JztcblxuOyFmdW5jdGlvbih1bmRlZmluZWQpIHtcblxuXHR2YXIgT2JqZWN0UGF0aCA9IHtcblx0XHRwYXJzZTogZnVuY3Rpb24oc3RyKXtcblx0XHRcdGlmKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKXtcblx0XHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignT2JqZWN0UGF0aC5wYXJzZSBtdXN0IGJlIHBhc3NlZCBhIHN0cmluZycpO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgaSA9IDA7XG5cdFx0XHR2YXIgcGFydHMgPSBbXTtcblx0XHRcdHZhciBkLCBiLCBxLCBjO1xuXHRcdFx0d2hpbGUgKGkgPCBzdHIubGVuZ3RoKXtcblx0XHRcdFx0ZCA9IHN0ci5pbmRleE9mKCcuJywgaSk7XG5cdFx0XHRcdGIgPSBzdHIuaW5kZXhPZignWycsIGkpO1xuXG5cdFx0XHRcdC8vIHdlJ3ZlIHJlYWNoZWQgdGhlIGVuZFxuXHRcdFx0XHRpZiAoZCA9PT0gLTEgJiYgYiA9PT0gLTEpe1xuXHRcdFx0XHRcdHBhcnRzLnB1c2goc3RyLnNsaWNlKGksIHN0ci5sZW5ndGgpKTtcblx0XHRcdFx0XHRpID0gc3RyLmxlbmd0aDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIGRvdHNcblx0XHRcdFx0ZWxzZSBpZiAoYiA9PT0gLTEgfHwgKGQgIT09IC0xICYmIGQgPCBiKSkge1xuXHRcdFx0XHRcdHBhcnRzLnB1c2goc3RyLnNsaWNlKGksIGQpKTtcblx0XHRcdFx0XHRpID0gZCArIDE7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBicmFja2V0c1xuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRpZiAoYiA+IGkpe1xuXHRcdFx0XHRcdFx0cGFydHMucHVzaChzdHIuc2xpY2UoaSwgYikpO1xuXHRcdFx0XHRcdFx0aSA9IGI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHEgPSBzdHIuc2xpY2UoYisxLCBiKzIpO1xuXHRcdFx0XHRcdGlmIChxICE9PSAnXCInICYmIHEgIT09J1xcJycpIHtcblx0XHRcdFx0XHRcdGMgPSBzdHIuaW5kZXhPZignXScsIGIpO1xuXHRcdFx0XHRcdFx0aWYgKGMgPT09IC0xKSBjID0gc3RyLmxlbmd0aDtcblx0XHRcdFx0XHRcdHBhcnRzLnB1c2goc3RyLnNsaWNlKGkgKyAxLCBjKSk7XG5cdFx0XHRcdFx0XHRpID0gKHN0ci5zbGljZShjICsgMSwgYyArIDIpID09PSAnLicpID8gYyArIDIgOiBjICsgMTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0YyA9IHN0ci5pbmRleE9mKHErJ10nLCBiKTtcblx0XHRcdFx0XHRcdGlmIChjID09PSAtMSkgYyA9IHN0ci5sZW5ndGg7XG5cdFx0XHRcdFx0XHR3aGlsZSAoc3RyLnNsaWNlKGMgLSAxLCBjKSA9PT0gJ1xcXFwnICYmIGIgPCBzdHIubGVuZ3RoKXtcblx0XHRcdFx0XHRcdFx0YisrO1xuXHRcdFx0XHRcdFx0XHRjID0gc3RyLmluZGV4T2YocSsnXScsIGIpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0cGFydHMucHVzaChzdHIuc2xpY2UoaSArIDIsIGMpLnJlcGxhY2UobmV3IFJlZ0V4cCgnXFxcXCcrcSwnZycpLCBxKSk7XG5cdFx0XHRcdFx0XHRpID0gKHN0ci5zbGljZShjICsgMiwgYyArIDMpID09PSAnLicpID8gYyArIDMgOiBjICsgMjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBwYXJ0cztcblx0XHR9LFxuXG5cdFx0Ly8gcm9vdCA9PT0gdHJ1ZSA6IGF1dG8gY2FsY3VsYXRlIHJvb3Q7IG11c3QgYmUgZG90LW5vdGF0aW9uIGZyaWVuZGx5XG5cdFx0Ly8gcm9vdCBTdHJpbmcgOiB0aGUgc3RyaW5nIHRvIHVzZSBhcyByb290XG5cdFx0c3RyaW5naWZ5OiBmdW5jdGlvbihhcnIsIHF1b3RlKXtcblxuXHRcdFx0aWYoIUFycmF5LmlzQXJyYXkoYXJyKSlcblx0XHRcdFx0YXJyID0gW2Fyci50b1N0cmluZygpXTtcblxuXHRcdFx0cXVvdGUgPSBxdW90ZSA9PT0gJ1wiJyA/ICdcIicgOiAnXFwnJztcblxuXHRcdFx0cmV0dXJuIGFyci5tYXAoZnVuY3Rpb24obil7IHJldHVybiAnWycgKyBxdW90ZSArIChuLnRvU3RyaW5nKCkpLnJlcGxhY2UobmV3IFJlZ0V4cChxdW90ZSwgJ2cnKSwgJ1xcXFwnICsgcXVvdGUpICsgcXVvdGUgKyAnXSc7IH0pLmpvaW4oJycpO1xuXHRcdH0sXG5cblx0XHRub3JtYWxpemU6IGZ1bmN0aW9uKGRhdGEsIHF1b3RlKXtcblx0XHRcdHJldHVybiBPYmplY3RQYXRoLnN0cmluZ2lmeShBcnJheS5pc0FycmF5KGRhdGEpID8gZGF0YSA6IE9iamVjdFBhdGgucGFyc2UoZGF0YSksIHF1b3RlKTtcblx0XHR9LFxuXG5cdFx0Ly8gQW5ndWxhclxuXHRcdHJlZ2lzdGVyTW9kdWxlOiBmdW5jdGlvbihhbmd1bGFyKSB7XG5cdFx0XHRhbmd1bGFyLm1vZHVsZSgnT2JqZWN0UGF0aCcsIFtdKS5wcm92aWRlcignT2JqZWN0UGF0aCcsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHRoaXMucGFyc2UgPSBPYmplY3RQYXRoLnBhcnNlO1xuXHRcdFx0XHR0aGlzLnN0cmluZ2lmeSA9IE9iamVjdFBhdGguc3RyaW5naWZ5O1xuXHRcdFx0XHR0aGlzLm5vcm1hbGl6ZSA9IE9iamVjdFBhdGgubm9ybWFsaXplO1xuXHRcdFx0XHR0aGlzLiRnZXQgPSBmdW5jdGlvbigpe1xuXHRcdFx0XHRcdHJldHVybiBPYmplY3RQYXRoO1xuXHRcdFx0XHR9O1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9O1xuXG5cdC8vIEFNRFxuXHRpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG5cdFx0ZGVmaW5lKGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIE9iamVjdFBhdGg7XG5cdFx0fSk7XG5cdH1cblxuXHQvLyBDb21tb25KU1xuXHRlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcblx0XHRleHBvcnRzLk9iamVjdFBhdGggPSBPYmplY3RQYXRoO1xuXHR9XG5cblx0Ly8gQnJvd3NlciBnbG9iYWxcblx0ZWxzZSB7XG5cdFx0d2luZG93Lk9iamVjdFBhdGggPSBPYmplY3RQYXRoO1xuXHR9XG5cdFxufSgpOyIsIi8qXG5BdXRob3I6IEdlcmFpbnQgTHVmZiBhbmQgb3RoZXJzXG5ZZWFyOiAyMDEzXG5cblRoaXMgY29kZSBpcyByZWxlYXNlZCBpbnRvIHRoZSBcInB1YmxpYyBkb21haW5cIiBieSBpdHMgYXV0aG9yKHMpLiAgQW55Ym9keSBtYXkgdXNlLCBhbHRlciBhbmQgZGlzdHJpYnV0ZSB0aGUgY29kZSB3aXRob3V0IHJlc3RyaWN0aW9uLiAgVGhlIGF1dGhvciBtYWtlcyBubyBndWFyYW50ZWVzLCBhbmQgdGFrZXMgbm8gbGlhYmlsaXR5IG9mIGFueSBraW5kIGZvciB1c2Ugb2YgdGhpcyBjb2RlLlxuXG5JZiB5b3UgZmluZCBhIGJ1ZyBvciBtYWtlIGFuIGltcHJvdmVtZW50LCBpdCB3b3VsZCBiZSBjb3VydGVvdXMgdG8gbGV0IHRoZSBhdXRob3Iga25vdywgYnV0IGl0IGlzIG5vdCBjb21wdWxzb3J5LlxuKi9cbihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgZGVmaW5lKFtdLCBmYWN0b3J5KTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cyl7XG4gICAgLy8gQ29tbW9uSlMuIERlZmluZSBleHBvcnQuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gQnJvd3NlciBnbG9iYWxzXG4gICAgZ2xvYmFsLnR2NCA9IGZhY3RvcnkoKTtcbiAgfVxufSh0aGlzLCBmdW5jdGlvbiAoKSB7XG5cbi8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL09iamVjdC9rZXlzP3JlZGlyZWN0bG9jYWxlPWVuLVVTJnJlZGlyZWN0c2x1Zz1KYXZhU2NyaXB0JTJGUmVmZXJlbmNlJTJGR2xvYmFsX09iamVjdHMlMkZPYmplY3QlMkZrZXlzXG5pZiAoIU9iamVjdC5rZXlzKSB7XG5cdE9iamVjdC5rZXlzID0gKGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LFxuXHRcdFx0aGFzRG9udEVudW1CdWcgPSAhKHt0b1N0cmluZzogbnVsbH0pLnByb3BlcnR5SXNFbnVtZXJhYmxlKCd0b1N0cmluZycpLFxuXHRcdFx0ZG9udEVudW1zID0gW1xuXHRcdFx0XHQndG9TdHJpbmcnLFxuXHRcdFx0XHQndG9Mb2NhbGVTdHJpbmcnLFxuXHRcdFx0XHQndmFsdWVPZicsXG5cdFx0XHRcdCdoYXNPd25Qcm9wZXJ0eScsXG5cdFx0XHRcdCdpc1Byb3RvdHlwZU9mJyxcblx0XHRcdFx0J3Byb3BlcnR5SXNFbnVtZXJhYmxlJyxcblx0XHRcdFx0J2NvbnN0cnVjdG9yJ1xuXHRcdFx0XSxcblx0XHRcdGRvbnRFbnVtc0xlbmd0aCA9IGRvbnRFbnVtcy5sZW5ndGg7XG5cblx0XHRyZXR1cm4gZnVuY3Rpb24gKG9iaikge1xuXHRcdFx0aWYgKHR5cGVvZiBvYmogIT09ICdvYmplY3QnICYmIHR5cGVvZiBvYmogIT09ICdmdW5jdGlvbicgfHwgb2JqID09PSBudWxsKSB7XG5cdFx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ09iamVjdC5rZXlzIGNhbGxlZCBvbiBub24tb2JqZWN0Jyk7XG5cdFx0XHR9XG5cblx0XHRcdHZhciByZXN1bHQgPSBbXTtcblxuXHRcdFx0Zm9yICh2YXIgcHJvcCBpbiBvYmopIHtcblx0XHRcdFx0aWYgKGhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkge1xuXHRcdFx0XHRcdHJlc3VsdC5wdXNoKHByb3ApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmIChoYXNEb250RW51bUJ1Zykge1xuXHRcdFx0XHRmb3IgKHZhciBpPTA7IGkgPCBkb250RW51bXNMZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgZG9udEVudW1zW2ldKSkge1xuXHRcdFx0XHRcdFx0cmVzdWx0LnB1c2goZG9udEVudW1zW2ldKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fTtcblx0fSkoKTtcbn1cbi8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL09iamVjdC9jcmVhdGVcbmlmICghT2JqZWN0LmNyZWF0ZSkge1xuXHRPYmplY3QuY3JlYXRlID0gKGZ1bmN0aW9uKCl7XG5cdFx0ZnVuY3Rpb24gRigpe31cblxuXHRcdHJldHVybiBmdW5jdGlvbihvKXtcblx0XHRcdGlmIChhcmd1bWVudHMubGVuZ3RoICE9PSAxKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcignT2JqZWN0LmNyZWF0ZSBpbXBsZW1lbnRhdGlvbiBvbmx5IGFjY2VwdHMgb25lIHBhcmFtZXRlci4nKTtcblx0XHRcdH1cblx0XHRcdEYucHJvdG90eXBlID0gbztcblx0XHRcdHJldHVybiBuZXcgRigpO1xuXHRcdH07XG5cdH0pKCk7XG59XG4vLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS9pc0FycmF5P3JlZGlyZWN0bG9jYWxlPWVuLVVTJnJlZGlyZWN0c2x1Zz1KYXZhU2NyaXB0JTJGUmVmZXJlbmNlJTJGR2xvYmFsX09iamVjdHMlMkZBcnJheSUyRmlzQXJyYXlcbmlmKCFBcnJheS5pc0FycmF5KSB7XG5cdEFycmF5LmlzQXJyYXkgPSBmdW5jdGlvbiAodkFyZykge1xuXHRcdHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodkFyZykgPT09IFwiW29iamVjdCBBcnJheV1cIjtcblx0fTtcbn1cbi8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5L2luZGV4T2Y/cmVkaXJlY3Rsb2NhbGU9ZW4tVVMmcmVkaXJlY3RzbHVnPUphdmFTY3JpcHQlMkZSZWZlcmVuY2UlMkZHbG9iYWxfT2JqZWN0cyUyRkFycmF5JTJGaW5kZXhPZlxuaWYgKCFBcnJheS5wcm90b3R5cGUuaW5kZXhPZikge1xuXHRBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA9IGZ1bmN0aW9uIChzZWFyY2hFbGVtZW50IC8qLCBmcm9tSW5kZXggKi8gKSB7XG5cdFx0aWYgKHRoaXMgPT09IG51bGwpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoKTtcblx0XHR9XG5cdFx0dmFyIHQgPSBPYmplY3QodGhpcyk7XG5cdFx0dmFyIGxlbiA9IHQubGVuZ3RoID4+PiAwO1xuXG5cdFx0aWYgKGxlbiA9PT0gMCkge1xuXHRcdFx0cmV0dXJuIC0xO1xuXHRcdH1cblx0XHR2YXIgbiA9IDA7XG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG5cdFx0XHRuID0gTnVtYmVyKGFyZ3VtZW50c1sxXSk7XG5cdFx0XHRpZiAobiAhPT0gbikgeyAvLyBzaG9ydGN1dCBmb3IgdmVyaWZ5aW5nIGlmIGl0J3MgTmFOXG5cdFx0XHRcdG4gPSAwO1xuXHRcdFx0fSBlbHNlIGlmIChuICE9PSAwICYmIG4gIT09IEluZmluaXR5ICYmIG4gIT09IC1JbmZpbml0eSkge1xuXHRcdFx0XHRuID0gKG4gPiAwIHx8IC0xKSAqIE1hdGguZmxvb3IoTWF0aC5hYnMobikpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAobiA+PSBsZW4pIHtcblx0XHRcdHJldHVybiAtMTtcblx0XHR9XG5cdFx0dmFyIGsgPSBuID49IDAgPyBuIDogTWF0aC5tYXgobGVuIC0gTWF0aC5hYnMobiksIDApO1xuXHRcdGZvciAoOyBrIDwgbGVuOyBrKyspIHtcblx0XHRcdGlmIChrIGluIHQgJiYgdFtrXSA9PT0gc2VhcmNoRWxlbWVudCkge1xuXHRcdFx0XHRyZXR1cm4gaztcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIC0xO1xuXHR9O1xufVxuXG4vLyBHcnVuZ2V5IE9iamVjdC5pc0Zyb3plbiBoYWNrXG5pZiAoIU9iamVjdC5pc0Zyb3plbikge1xuXHRPYmplY3QuaXNGcm96ZW4gPSBmdW5jdGlvbiAob2JqKSB7XG5cdFx0dmFyIGtleSA9IFwidHY0X3Rlc3RfZnJvemVuX2tleVwiO1xuXHRcdHdoaWxlIChvYmouaGFzT3duUHJvcGVydHkoa2V5KSkge1xuXHRcdFx0a2V5ICs9IE1hdGgucmFuZG9tKCk7XG5cdFx0fVxuXHRcdHRyeSB7XG5cdFx0XHRvYmpba2V5XSA9IHRydWU7XG5cdFx0XHRkZWxldGUgb2JqW2tleV07XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9O1xufVxuLy8gQmFzZWQgb246IGh0dHBzOi8vZ2l0aHViLmNvbS9nZXJhaW50bHVmZi91cmktdGVtcGxhdGVzLCBidXQgd2l0aCBhbGwgdGhlIGRlLXN1YnN0aXR1dGlvbiBzdHVmZiByZW1vdmVkXG5cbnZhciB1cmlUZW1wbGF0ZUdsb2JhbE1vZGlmaWVycyA9IHtcblx0XCIrXCI6IHRydWUsXG5cdFwiI1wiOiB0cnVlLFxuXHRcIi5cIjogdHJ1ZSxcblx0XCIvXCI6IHRydWUsXG5cdFwiO1wiOiB0cnVlLFxuXHRcIj9cIjogdHJ1ZSxcblx0XCImXCI6IHRydWVcbn07XG52YXIgdXJpVGVtcGxhdGVTdWZmaWNlcyA9IHtcblx0XCIqXCI6IHRydWVcbn07XG5cbmZ1bmN0aW9uIG5vdFJlYWxseVBlcmNlbnRFbmNvZGUoc3RyaW5nKSB7XG5cdHJldHVybiBlbmNvZGVVUkkoc3RyaW5nKS5yZXBsYWNlKC8lMjVbMC05XVswLTldL2csIGZ1bmN0aW9uIChkb3VibGVFbmNvZGVkKSB7XG5cdFx0cmV0dXJuIFwiJVwiICsgZG91YmxlRW5jb2RlZC5zdWJzdHJpbmcoMyk7XG5cdH0pO1xufVxuXG5mdW5jdGlvbiB1cmlUZW1wbGF0ZVN1YnN0aXR1dGlvbihzcGVjKSB7XG5cdHZhciBtb2RpZmllciA9IFwiXCI7XG5cdGlmICh1cmlUZW1wbGF0ZUdsb2JhbE1vZGlmaWVyc1tzcGVjLmNoYXJBdCgwKV0pIHtcblx0XHRtb2RpZmllciA9IHNwZWMuY2hhckF0KDApO1xuXHRcdHNwZWMgPSBzcGVjLnN1YnN0cmluZygxKTtcblx0fVxuXHR2YXIgc2VwYXJhdG9yID0gXCJcIjtcblx0dmFyIHByZWZpeCA9IFwiXCI7XG5cdHZhciBzaG91bGRFc2NhcGUgPSB0cnVlO1xuXHR2YXIgc2hvd1ZhcmlhYmxlcyA9IGZhbHNlO1xuXHR2YXIgdHJpbUVtcHR5U3RyaW5nID0gZmFsc2U7XG5cdGlmIChtb2RpZmllciA9PT0gJysnKSB7XG5cdFx0c2hvdWxkRXNjYXBlID0gZmFsc2U7XG5cdH0gZWxzZSBpZiAobW9kaWZpZXIgPT09IFwiLlwiKSB7XG5cdFx0cHJlZml4ID0gXCIuXCI7XG5cdFx0c2VwYXJhdG9yID0gXCIuXCI7XG5cdH0gZWxzZSBpZiAobW9kaWZpZXIgPT09IFwiL1wiKSB7XG5cdFx0cHJlZml4ID0gXCIvXCI7XG5cdFx0c2VwYXJhdG9yID0gXCIvXCI7XG5cdH0gZWxzZSBpZiAobW9kaWZpZXIgPT09ICcjJykge1xuXHRcdHByZWZpeCA9IFwiI1wiO1xuXHRcdHNob3VsZEVzY2FwZSA9IGZhbHNlO1xuXHR9IGVsc2UgaWYgKG1vZGlmaWVyID09PSAnOycpIHtcblx0XHRwcmVmaXggPSBcIjtcIjtcblx0XHRzZXBhcmF0b3IgPSBcIjtcIjtcblx0XHRzaG93VmFyaWFibGVzID0gdHJ1ZTtcblx0XHR0cmltRW1wdHlTdHJpbmcgPSB0cnVlO1xuXHR9IGVsc2UgaWYgKG1vZGlmaWVyID09PSAnPycpIHtcblx0XHRwcmVmaXggPSBcIj9cIjtcblx0XHRzZXBhcmF0b3IgPSBcIiZcIjtcblx0XHRzaG93VmFyaWFibGVzID0gdHJ1ZTtcblx0fSBlbHNlIGlmIChtb2RpZmllciA9PT0gJyYnKSB7XG5cdFx0cHJlZml4ID0gXCImXCI7XG5cdFx0c2VwYXJhdG9yID0gXCImXCI7XG5cdFx0c2hvd1ZhcmlhYmxlcyA9IHRydWU7XG5cdH1cblxuXHR2YXIgdmFyTmFtZXMgPSBbXTtcblx0dmFyIHZhckxpc3QgPSBzcGVjLnNwbGl0KFwiLFwiKTtcblx0dmFyIHZhclNwZWNzID0gW107XG5cdHZhciB2YXJTcGVjTWFwID0ge307XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgdmFyTGlzdC5sZW5ndGg7IGkrKykge1xuXHRcdHZhciB2YXJOYW1lID0gdmFyTGlzdFtpXTtcblx0XHR2YXIgdHJ1bmNhdGUgPSBudWxsO1xuXHRcdGlmICh2YXJOYW1lLmluZGV4T2YoXCI6XCIpICE9PSAtMSkge1xuXHRcdFx0dmFyIHBhcnRzID0gdmFyTmFtZS5zcGxpdChcIjpcIik7XG5cdFx0XHR2YXJOYW1lID0gcGFydHNbMF07XG5cdFx0XHR0cnVuY2F0ZSA9IHBhcnNlSW50KHBhcnRzWzFdLCAxMCk7XG5cdFx0fVxuXHRcdHZhciBzdWZmaWNlcyA9IHt9O1xuXHRcdHdoaWxlICh1cmlUZW1wbGF0ZVN1ZmZpY2VzW3Zhck5hbWUuY2hhckF0KHZhck5hbWUubGVuZ3RoIC0gMSldKSB7XG5cdFx0XHRzdWZmaWNlc1t2YXJOYW1lLmNoYXJBdCh2YXJOYW1lLmxlbmd0aCAtIDEpXSA9IHRydWU7XG5cdFx0XHR2YXJOYW1lID0gdmFyTmFtZS5zdWJzdHJpbmcoMCwgdmFyTmFtZS5sZW5ndGggLSAxKTtcblx0XHR9XG5cdFx0dmFyIHZhclNwZWMgPSB7XG5cdFx0XHR0cnVuY2F0ZTogdHJ1bmNhdGUsXG5cdFx0XHRuYW1lOiB2YXJOYW1lLFxuXHRcdFx0c3VmZmljZXM6IHN1ZmZpY2VzXG5cdFx0fTtcblx0XHR2YXJTcGVjcy5wdXNoKHZhclNwZWMpO1xuXHRcdHZhclNwZWNNYXBbdmFyTmFtZV0gPSB2YXJTcGVjO1xuXHRcdHZhck5hbWVzLnB1c2godmFyTmFtZSk7XG5cdH1cblx0dmFyIHN1YkZ1bmN0aW9uID0gZnVuY3Rpb24gKHZhbHVlRnVuY3Rpb24pIHtcblx0XHR2YXIgcmVzdWx0ID0gXCJcIjtcblx0XHR2YXIgc3RhcnRJbmRleCA9IDA7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB2YXJTcGVjcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIHZhclNwZWMgPSB2YXJTcGVjc1tpXTtcblx0XHRcdHZhciB2YWx1ZSA9IHZhbHVlRnVuY3Rpb24odmFyU3BlYy5uYW1lKTtcblx0XHRcdGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IChBcnJheS5pc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5sZW5ndGggPT09IDApIHx8ICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIE9iamVjdC5rZXlzKHZhbHVlKS5sZW5ndGggPT09IDApKSB7XG5cdFx0XHRcdHN0YXJ0SW5kZXgrKztcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHRpZiAoaSA9PT0gc3RhcnRJbmRleCkge1xuXHRcdFx0XHRyZXN1bHQgKz0gcHJlZml4O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmVzdWx0ICs9IChzZXBhcmF0b3IgfHwgXCIsXCIpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG5cdFx0XHRcdGlmIChzaG93VmFyaWFibGVzKSB7XG5cdFx0XHRcdFx0cmVzdWx0ICs9IHZhclNwZWMubmFtZSArIFwiPVwiO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgdmFsdWUubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0XHRpZiAoaiA+IDApIHtcblx0XHRcdFx0XHRcdHJlc3VsdCArPSB2YXJTcGVjLnN1ZmZpY2VzWycqJ10gPyAoc2VwYXJhdG9yIHx8IFwiLFwiKSA6IFwiLFwiO1xuXHRcdFx0XHRcdFx0aWYgKHZhclNwZWMuc3VmZmljZXNbJyonXSAmJiBzaG93VmFyaWFibGVzKSB7XG5cdFx0XHRcdFx0XHRcdHJlc3VsdCArPSB2YXJTcGVjLm5hbWUgKyBcIj1cIjtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmVzdWx0ICs9IHNob3VsZEVzY2FwZSA/IGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZVtqXSkucmVwbGFjZSgvIS9nLCBcIiUyMVwiKSA6IG5vdFJlYWxseVBlcmNlbnRFbmNvZGUodmFsdWVbal0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0XHRpZiAoc2hvd1ZhcmlhYmxlcyAmJiAhdmFyU3BlYy5zdWZmaWNlc1snKiddKSB7XG5cdFx0XHRcdFx0cmVzdWx0ICs9IHZhclNwZWMubmFtZSArIFwiPVwiO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHZhciBmaXJzdCA9IHRydWU7XG5cdFx0XHRcdGZvciAodmFyIGtleSBpbiB2YWx1ZSkge1xuXHRcdFx0XHRcdGlmICghZmlyc3QpIHtcblx0XHRcdFx0XHRcdHJlc3VsdCArPSB2YXJTcGVjLnN1ZmZpY2VzWycqJ10gPyAoc2VwYXJhdG9yIHx8IFwiLFwiKSA6IFwiLFwiO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRmaXJzdCA9IGZhbHNlO1xuXHRcdFx0XHRcdHJlc3VsdCArPSBzaG91bGRFc2NhcGUgPyBlbmNvZGVVUklDb21wb25lbnQoa2V5KS5yZXBsYWNlKC8hL2csIFwiJTIxXCIpIDogbm90UmVhbGx5UGVyY2VudEVuY29kZShrZXkpO1xuXHRcdFx0XHRcdHJlc3VsdCArPSB2YXJTcGVjLnN1ZmZpY2VzWycqJ10gPyAnPScgOiBcIixcIjtcblx0XHRcdFx0XHRyZXN1bHQgKz0gc2hvdWxkRXNjYXBlID8gZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlW2tleV0pLnJlcGxhY2UoLyEvZywgXCIlMjFcIikgOiBub3RSZWFsbHlQZXJjZW50RW5jb2RlKHZhbHVlW2tleV0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZiAoc2hvd1ZhcmlhYmxlcykge1xuXHRcdFx0XHRcdHJlc3VsdCArPSB2YXJTcGVjLm5hbWU7XG5cdFx0XHRcdFx0aWYgKCF0cmltRW1wdHlTdHJpbmcgfHwgdmFsdWUgIT09IFwiXCIpIHtcblx0XHRcdFx0XHRcdHJlc3VsdCArPSBcIj1cIjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHZhclNwZWMudHJ1bmNhdGUgIT0gbnVsbCkge1xuXHRcdFx0XHRcdHZhbHVlID0gdmFsdWUuc3Vic3RyaW5nKDAsIHZhclNwZWMudHJ1bmNhdGUpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJlc3VsdCArPSBzaG91bGRFc2NhcGUgPyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpLnJlcGxhY2UoLyEvZywgXCIlMjFcIik6IG5vdFJlYWxseVBlcmNlbnRFbmNvZGUodmFsdWUpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9O1xuXHRzdWJGdW5jdGlvbi52YXJOYW1lcyA9IHZhck5hbWVzO1xuXHRyZXR1cm4ge1xuXHRcdHByZWZpeDogcHJlZml4LFxuXHRcdHN1YnN0aXR1dGlvbjogc3ViRnVuY3Rpb25cblx0fTtcbn1cblxuZnVuY3Rpb24gVXJpVGVtcGxhdGUodGVtcGxhdGUpIHtcblx0aWYgKCEodGhpcyBpbnN0YW5jZW9mIFVyaVRlbXBsYXRlKSkge1xuXHRcdHJldHVybiBuZXcgVXJpVGVtcGxhdGUodGVtcGxhdGUpO1xuXHR9XG5cdHZhciBwYXJ0cyA9IHRlbXBsYXRlLnNwbGl0KFwie1wiKTtcblx0dmFyIHRleHRQYXJ0cyA9IFtwYXJ0cy5zaGlmdCgpXTtcblx0dmFyIHByZWZpeGVzID0gW107XG5cdHZhciBzdWJzdGl0dXRpb25zID0gW107XG5cdHZhciB2YXJOYW1lcyA9IFtdO1xuXHR3aGlsZSAocGFydHMubGVuZ3RoID4gMCkge1xuXHRcdHZhciBwYXJ0ID0gcGFydHMuc2hpZnQoKTtcblx0XHR2YXIgc3BlYyA9IHBhcnQuc3BsaXQoXCJ9XCIpWzBdO1xuXHRcdHZhciByZW1haW5kZXIgPSBwYXJ0LnN1YnN0cmluZyhzcGVjLmxlbmd0aCArIDEpO1xuXHRcdHZhciBmdW5jcyA9IHVyaVRlbXBsYXRlU3Vic3RpdHV0aW9uKHNwZWMpO1xuXHRcdHN1YnN0aXR1dGlvbnMucHVzaChmdW5jcy5zdWJzdGl0dXRpb24pO1xuXHRcdHByZWZpeGVzLnB1c2goZnVuY3MucHJlZml4KTtcblx0XHR0ZXh0UGFydHMucHVzaChyZW1haW5kZXIpO1xuXHRcdHZhck5hbWVzID0gdmFyTmFtZXMuY29uY2F0KGZ1bmNzLnN1YnN0aXR1dGlvbi52YXJOYW1lcyk7XG5cdH1cblx0dGhpcy5maWxsID0gZnVuY3Rpb24gKHZhbHVlRnVuY3Rpb24pIHtcblx0XHR2YXIgcmVzdWx0ID0gdGV4dFBhcnRzWzBdO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc3Vic3RpdHV0aW9ucy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIHN1YnN0aXR1dGlvbiA9IHN1YnN0aXR1dGlvbnNbaV07XG5cdFx0XHRyZXN1bHQgKz0gc3Vic3RpdHV0aW9uKHZhbHVlRnVuY3Rpb24pO1xuXHRcdFx0cmVzdWx0ICs9IHRleHRQYXJ0c1tpICsgMV07XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH07XG5cdHRoaXMudmFyTmFtZXMgPSB2YXJOYW1lcztcblx0dGhpcy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xufVxuVXJpVGVtcGxhdGUucHJvdG90eXBlID0ge1xuXHR0b1N0cmluZzogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiB0aGlzLnRlbXBsYXRlO1xuXHR9LFxuXHRmaWxsRnJvbU9iamVjdDogZnVuY3Rpb24gKG9iaikge1xuXHRcdHJldHVybiB0aGlzLmZpbGwoZnVuY3Rpb24gKHZhck5hbWUpIHtcblx0XHRcdHJldHVybiBvYmpbdmFyTmFtZV07XG5cdFx0fSk7XG5cdH1cbn07XG52YXIgVmFsaWRhdG9yQ29udGV4dCA9IGZ1bmN0aW9uIFZhbGlkYXRvckNvbnRleHQocGFyZW50LCBjb2xsZWN0TXVsdGlwbGUsIGVycm9yTWVzc2FnZXMsIGNoZWNrUmVjdXJzaXZlLCB0cmFja1Vua25vd25Qcm9wZXJ0aWVzKSB7XG5cdHRoaXMubWlzc2luZyA9IFtdO1xuXHR0aGlzLm1pc3NpbmdNYXAgPSB7fTtcblx0dGhpcy5mb3JtYXRWYWxpZGF0b3JzID0gcGFyZW50ID8gT2JqZWN0LmNyZWF0ZShwYXJlbnQuZm9ybWF0VmFsaWRhdG9ycykgOiB7fTtcblx0dGhpcy5zY2hlbWFzID0gcGFyZW50ID8gT2JqZWN0LmNyZWF0ZShwYXJlbnQuc2NoZW1hcykgOiB7fTtcblx0dGhpcy5jb2xsZWN0TXVsdGlwbGUgPSBjb2xsZWN0TXVsdGlwbGU7XG5cdHRoaXMuZXJyb3JzID0gW107XG5cdHRoaXMuaGFuZGxlRXJyb3IgPSBjb2xsZWN0TXVsdGlwbGUgPyB0aGlzLmNvbGxlY3RFcnJvciA6IHRoaXMucmV0dXJuRXJyb3I7XG5cdGlmIChjaGVja1JlY3Vyc2l2ZSkge1xuXHRcdHRoaXMuY2hlY2tSZWN1cnNpdmUgPSB0cnVlO1xuXHRcdHRoaXMuc2Nhbm5lZCA9IFtdO1xuXHRcdHRoaXMuc2Nhbm5lZEZyb3plbiA9IFtdO1xuXHRcdHRoaXMuc2Nhbm5lZEZyb3plblNjaGVtYXMgPSBbXTtcblx0XHR0aGlzLnNjYW5uZWRGcm96ZW5WYWxpZGF0aW9uRXJyb3JzID0gW107XG5cdFx0dGhpcy52YWxpZGF0ZWRTY2hlbWFzS2V5ID0gJ3R2NF92YWxpZGF0aW9uX2lkJztcblx0XHR0aGlzLnZhbGlkYXRpb25FcnJvcnNLZXkgPSAndHY0X3ZhbGlkYXRpb25fZXJyb3JzX2lkJztcblx0fVxuXHRpZiAodHJhY2tVbmtub3duUHJvcGVydGllcykge1xuXHRcdHRoaXMudHJhY2tVbmtub3duUHJvcGVydGllcyA9IHRydWU7XG5cdFx0dGhpcy5rbm93blByb3BlcnR5UGF0aHMgPSB7fTtcblx0XHR0aGlzLnVua25vd25Qcm9wZXJ0eVBhdGhzID0ge307XG5cdH1cblx0dGhpcy5lcnJvck1lc3NhZ2VzID0gZXJyb3JNZXNzYWdlcztcblx0dGhpcy5kZWZpbmVkS2V5d29yZHMgPSB7fTtcblx0aWYgKHBhcmVudCkge1xuXHRcdGZvciAodmFyIGtleSBpbiBwYXJlbnQuZGVmaW5lZEtleXdvcmRzKSB7XG5cdFx0XHR0aGlzLmRlZmluZWRLZXl3b3Jkc1trZXldID0gcGFyZW50LmRlZmluZWRLZXl3b3Jkc1trZXldLnNsaWNlKDApO1xuXHRcdH1cblx0fVxufTtcblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLmRlZmluZUtleXdvcmQgPSBmdW5jdGlvbiAoa2V5d29yZCwga2V5d29yZEZ1bmN0aW9uKSB7XG5cdHRoaXMuZGVmaW5lZEtleXdvcmRzW2tleXdvcmRdID0gdGhpcy5kZWZpbmVkS2V5d29yZHNba2V5d29yZF0gfHwgW107XG5cdHRoaXMuZGVmaW5lZEtleXdvcmRzW2tleXdvcmRdLnB1c2goa2V5d29yZEZ1bmN0aW9uKTtcbn07XG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5jcmVhdGVFcnJvciA9IGZ1bmN0aW9uIChjb2RlLCBtZXNzYWdlUGFyYW1zLCBkYXRhUGF0aCwgc2NoZW1hUGF0aCwgc3ViRXJyb3JzKSB7XG5cdHZhciBtZXNzYWdlVGVtcGxhdGUgPSB0aGlzLmVycm9yTWVzc2FnZXNbY29kZV0gfHwgRXJyb3JNZXNzYWdlc0RlZmF1bHRbY29kZV07XG5cdGlmICh0eXBlb2YgbWVzc2FnZVRlbXBsYXRlICE9PSAnc3RyaW5nJykge1xuXHRcdHJldHVybiBuZXcgVmFsaWRhdGlvbkVycm9yKGNvZGUsIFwiVW5rbm93biBlcnJvciBjb2RlIFwiICsgY29kZSArIFwiOiBcIiArIEpTT04uc3RyaW5naWZ5KG1lc3NhZ2VQYXJhbXMpLCBtZXNzYWdlUGFyYW1zLCBkYXRhUGF0aCwgc2NoZW1hUGF0aCwgc3ViRXJyb3JzKTtcblx0fVxuXHQvLyBBZGFwdGVkIGZyb20gQ3JvY2tmb3JkJ3Mgc3VwcGxhbnQoKVxuXHR2YXIgbWVzc2FnZSA9IG1lc3NhZ2VUZW1wbGF0ZS5yZXBsYWNlKC9cXHsoW157fV0qKVxcfS9nLCBmdW5jdGlvbiAod2hvbGUsIHZhck5hbWUpIHtcblx0XHR2YXIgc3ViVmFsdWUgPSBtZXNzYWdlUGFyYW1zW3Zhck5hbWVdO1xuXHRcdHJldHVybiB0eXBlb2Ygc3ViVmFsdWUgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBzdWJWYWx1ZSA9PT0gJ251bWJlcicgPyBzdWJWYWx1ZSA6IHdob2xlO1xuXHR9KTtcblx0cmV0dXJuIG5ldyBWYWxpZGF0aW9uRXJyb3IoY29kZSwgbWVzc2FnZSwgbWVzc2FnZVBhcmFtcywgZGF0YVBhdGgsIHNjaGVtYVBhdGgsIHN1YkVycm9ycyk7XG59O1xuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUucmV0dXJuRXJyb3IgPSBmdW5jdGlvbiAoZXJyb3IpIHtcblx0cmV0dXJuIGVycm9yO1xufTtcblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLmNvbGxlY3RFcnJvciA9IGZ1bmN0aW9uIChlcnJvcikge1xuXHRpZiAoZXJyb3IpIHtcblx0XHR0aGlzLmVycm9ycy5wdXNoKGVycm9yKTtcblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5wcmVmaXhFcnJvcnMgPSBmdW5jdGlvbiAoc3RhcnRJbmRleCwgZGF0YVBhdGgsIHNjaGVtYVBhdGgpIHtcblx0Zm9yICh2YXIgaSA9IHN0YXJ0SW5kZXg7IGkgPCB0aGlzLmVycm9ycy5sZW5ndGg7IGkrKykge1xuXHRcdHRoaXMuZXJyb3JzW2ldID0gdGhpcy5lcnJvcnNbaV0ucHJlZml4V2l0aChkYXRhUGF0aCwgc2NoZW1hUGF0aCk7XG5cdH1cblx0cmV0dXJuIHRoaXM7XG59O1xuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUuYmFuVW5rbm93blByb3BlcnRpZXMgPSBmdW5jdGlvbiAoKSB7XG5cdGZvciAodmFyIHVua25vd25QYXRoIGluIHRoaXMudW5rbm93blByb3BlcnR5UGF0aHMpIHtcblx0XHR2YXIgZXJyb3IgPSB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuVU5LTk9XTl9QUk9QRVJUWSwge3BhdGg6IHVua25vd25QYXRofSwgdW5rbm93blBhdGgsIFwiXCIpO1xuXHRcdHZhciByZXN1bHQgPSB0aGlzLmhhbmRsZUVycm9yKGVycm9yKTtcblx0XHRpZiAocmVzdWx0KSB7XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLmFkZEZvcm1hdCA9IGZ1bmN0aW9uIChmb3JtYXQsIHZhbGlkYXRvcikge1xuXHRpZiAodHlwZW9mIGZvcm1hdCA9PT0gJ29iamVjdCcpIHtcblx0XHRmb3IgKHZhciBrZXkgaW4gZm9ybWF0KSB7XG5cdFx0XHR0aGlzLmFkZEZvcm1hdChrZXksIGZvcm1hdFtrZXldKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0dGhpcy5mb3JtYXRWYWxpZGF0b3JzW2Zvcm1hdF0gPSB2YWxpZGF0b3I7XG59O1xuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUucmVzb2x2ZVJlZnMgPSBmdW5jdGlvbiAoc2NoZW1hLCB1cmxIaXN0b3J5KSB7XG5cdGlmIChzY2hlbWFbJyRyZWYnXSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0dXJsSGlzdG9yeSA9IHVybEhpc3RvcnkgfHwge307XG5cdFx0aWYgKHVybEhpc3Rvcnlbc2NoZW1hWyckcmVmJ11dKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLkNJUkNVTEFSX1JFRkVSRU5DRSwge3VybHM6IE9iamVjdC5rZXlzKHVybEhpc3RvcnkpLmpvaW4oJywgJyl9LCAnJywgJycpO1xuXHRcdH1cblx0XHR1cmxIaXN0b3J5W3NjaGVtYVsnJHJlZiddXSA9IHRydWU7XG5cdFx0c2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoc2NoZW1hWyckcmVmJ10sIHVybEhpc3RvcnkpO1xuXHR9XG5cdHJldHVybiBzY2hlbWE7XG59O1xuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUuZ2V0U2NoZW1hID0gZnVuY3Rpb24gKHVybCwgdXJsSGlzdG9yeSkge1xuXHR2YXIgc2NoZW1hO1xuXHRpZiAodGhpcy5zY2hlbWFzW3VybF0gIT09IHVuZGVmaW5lZCkge1xuXHRcdHNjaGVtYSA9IHRoaXMuc2NoZW1hc1t1cmxdO1xuXHRcdHJldHVybiB0aGlzLnJlc29sdmVSZWZzKHNjaGVtYSwgdXJsSGlzdG9yeSk7XG5cdH1cblx0dmFyIGJhc2VVcmwgPSB1cmw7XG5cdHZhciBmcmFnbWVudCA9IFwiXCI7XG5cdGlmICh1cmwuaW5kZXhPZignIycpICE9PSAtMSkge1xuXHRcdGZyYWdtZW50ID0gdXJsLnN1YnN0cmluZyh1cmwuaW5kZXhPZihcIiNcIikgKyAxKTtcblx0XHRiYXNlVXJsID0gdXJsLnN1YnN0cmluZygwLCB1cmwuaW5kZXhPZihcIiNcIikpO1xuXHR9XG5cdGlmICh0eXBlb2YgdGhpcy5zY2hlbWFzW2Jhc2VVcmxdID09PSAnb2JqZWN0Jykge1xuXHRcdHNjaGVtYSA9IHRoaXMuc2NoZW1hc1tiYXNlVXJsXTtcblx0XHR2YXIgcG9pbnRlclBhdGggPSBkZWNvZGVVUklDb21wb25lbnQoZnJhZ21lbnQpO1xuXHRcdGlmIChwb2ludGVyUGF0aCA9PT0gXCJcIikge1xuXHRcdFx0cmV0dXJuIHRoaXMucmVzb2x2ZVJlZnMoc2NoZW1hLCB1cmxIaXN0b3J5KTtcblx0XHR9IGVsc2UgaWYgKHBvaW50ZXJQYXRoLmNoYXJBdCgwKSAhPT0gXCIvXCIpIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHRcdHZhciBwYXJ0cyA9IHBvaW50ZXJQYXRoLnNwbGl0KFwiL1wiKS5zbGljZSgxKTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgY29tcG9uZW50ID0gcGFydHNbaV0ucmVwbGFjZSgvfjEvZywgXCIvXCIpLnJlcGxhY2UoL34wL2csIFwiflwiKTtcblx0XHRcdGlmIChzY2hlbWFbY29tcG9uZW50XSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHNjaGVtYSA9IHVuZGVmaW5lZDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0XHRzY2hlbWEgPSBzY2hlbWFbY29tcG9uZW50XTtcblx0XHR9XG5cdFx0aWYgKHNjaGVtYSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5yZXNvbHZlUmVmcyhzY2hlbWEsIHVybEhpc3RvcnkpO1xuXHRcdH1cblx0fVxuXHRpZiAodGhpcy5taXNzaW5nW2Jhc2VVcmxdID09PSB1bmRlZmluZWQpIHtcblx0XHR0aGlzLm1pc3NpbmcucHVzaChiYXNlVXJsKTtcblx0XHR0aGlzLm1pc3NpbmdbYmFzZVVybF0gPSBiYXNlVXJsO1xuXHRcdHRoaXMubWlzc2luZ01hcFtiYXNlVXJsXSA9IGJhc2VVcmw7XG5cdH1cbn07XG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5zZWFyY2hTY2hlbWFzID0gZnVuY3Rpb24gKHNjaGVtYSwgdXJsKSB7XG5cdGlmIChBcnJheS5pc0FycmF5KHNjaGVtYSkpIHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNjaGVtYS5sZW5ndGg7IGkrKykge1xuXHRcdFx0dGhpcy5zZWFyY2hTY2hlbWFzKHNjaGVtYVtpXSwgdXJsKTtcblx0XHR9XG5cdH0gZWxzZSBpZiAoc2NoZW1hICYmIHR5cGVvZiBzY2hlbWEgPT09IFwib2JqZWN0XCIpIHtcblx0XHRpZiAodHlwZW9mIHNjaGVtYS5pZCA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0aWYgKGlzVHJ1c3RlZFVybCh1cmwsIHNjaGVtYS5pZCkpIHtcblx0XHRcdFx0aWYgKHRoaXMuc2NoZW1hc1tzY2hlbWEuaWRdID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHR0aGlzLnNjaGVtYXNbc2NoZW1hLmlkXSA9IHNjaGVtYTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRmb3IgKHZhciBrZXkgaW4gc2NoZW1hKSB7XG5cdFx0XHRpZiAoa2V5ICE9PSBcImVudW1cIikge1xuXHRcdFx0XHRpZiAodHlwZW9mIHNjaGVtYVtrZXldID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRcdFx0dGhpcy5zZWFyY2hTY2hlbWFzKHNjaGVtYVtrZXldLCB1cmwpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGtleSA9PT0gXCIkcmVmXCIpIHtcblx0XHRcdFx0XHR2YXIgdXJpID0gZ2V0RG9jdW1lbnRVcmkoc2NoZW1hW2tleV0pO1xuXHRcdFx0XHRcdGlmICh1cmkgJiYgdGhpcy5zY2hlbWFzW3VyaV0gPT09IHVuZGVmaW5lZCAmJiB0aGlzLm1pc3NpbmdNYXBbdXJpXSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHR0aGlzLm1pc3NpbmdNYXBbdXJpXSA9IHVyaTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cbn07XG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5hZGRTY2hlbWEgPSBmdW5jdGlvbiAodXJsLCBzY2hlbWEpIHtcblx0Ly9vdmVybG9hZFxuXHRpZiAodHlwZW9mIHVybCAhPT0gJ3N0cmluZycgfHwgdHlwZW9mIHNjaGVtYSA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRpZiAodHlwZW9mIHVybCA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHVybC5pZCA9PT0gJ3N0cmluZycpIHtcblx0XHRcdHNjaGVtYSA9IHVybDtcblx0XHRcdHVybCA9IHNjaGVtYS5pZDtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHR9XG5cdGlmICh1cmwgPT09IGdldERvY3VtZW50VXJpKHVybCkgKyBcIiNcIikge1xuXHRcdC8vIFJlbW92ZSBlbXB0eSBmcmFnbWVudFxuXHRcdHVybCA9IGdldERvY3VtZW50VXJpKHVybCk7XG5cdH1cblx0dGhpcy5zY2hlbWFzW3VybF0gPSBzY2hlbWE7XG5cdGRlbGV0ZSB0aGlzLm1pc3NpbmdNYXBbdXJsXTtcblx0bm9ybVNjaGVtYShzY2hlbWEsIHVybCk7XG5cdHRoaXMuc2VhcmNoU2NoZW1hcyhzY2hlbWEsIHVybCk7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5nZXRTY2hlbWFNYXAgPSBmdW5jdGlvbiAoKSB7XG5cdHZhciBtYXAgPSB7fTtcblx0Zm9yICh2YXIga2V5IGluIHRoaXMuc2NoZW1hcykge1xuXHRcdG1hcFtrZXldID0gdGhpcy5zY2hlbWFzW2tleV07XG5cdH1cblx0cmV0dXJuIG1hcDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLmdldFNjaGVtYVVyaXMgPSBmdW5jdGlvbiAoZmlsdGVyUmVnRXhwKSB7XG5cdHZhciBsaXN0ID0gW107XG5cdGZvciAodmFyIGtleSBpbiB0aGlzLnNjaGVtYXMpIHtcblx0XHRpZiAoIWZpbHRlclJlZ0V4cCB8fCBmaWx0ZXJSZWdFeHAudGVzdChrZXkpKSB7XG5cdFx0XHRsaXN0LnB1c2goa2V5KTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGxpc3Q7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5nZXRNaXNzaW5nVXJpcyA9IGZ1bmN0aW9uIChmaWx0ZXJSZWdFeHApIHtcblx0dmFyIGxpc3QgPSBbXTtcblx0Zm9yICh2YXIga2V5IGluIHRoaXMubWlzc2luZ01hcCkge1xuXHRcdGlmICghZmlsdGVyUmVnRXhwIHx8IGZpbHRlclJlZ0V4cC50ZXN0KGtleSkpIHtcblx0XHRcdGxpc3QucHVzaChrZXkpO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gbGlzdDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLmRyb3BTY2hlbWFzID0gZnVuY3Rpb24gKCkge1xuXHR0aGlzLnNjaGVtYXMgPSB7fTtcblx0dGhpcy5yZXNldCgpO1xufTtcblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gKCkge1xuXHR0aGlzLm1pc3NpbmcgPSBbXTtcblx0dGhpcy5taXNzaW5nTWFwID0ge307XG5cdHRoaXMuZXJyb3JzID0gW107XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZUFsbCA9IGZ1bmN0aW9uIChkYXRhLCBzY2hlbWEsIGRhdGFQYXRoUGFydHMsIHNjaGVtYVBhdGhQYXJ0cywgZGF0YVBvaW50ZXJQYXRoKSB7XG5cdHZhciB0b3BMZXZlbDtcblx0c2NoZW1hID0gdGhpcy5yZXNvbHZlUmVmcyhzY2hlbWEpO1xuXHRpZiAoIXNjaGVtYSkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9IGVsc2UgaWYgKHNjaGVtYSBpbnN0YW5jZW9mIFZhbGlkYXRpb25FcnJvcikge1xuXHRcdHRoaXMuZXJyb3JzLnB1c2goc2NoZW1hKTtcblx0XHRyZXR1cm4gc2NoZW1hO1xuXHR9XG5cblx0dmFyIHN0YXJ0RXJyb3JDb3VudCA9IHRoaXMuZXJyb3JzLmxlbmd0aDtcblx0dmFyIGZyb3plbkluZGV4LCBzY2FubmVkRnJvemVuU2NoZW1hSW5kZXggPSBudWxsLCBzY2FubmVkU2NoZW1hc0luZGV4ID0gbnVsbDtcblx0aWYgKHRoaXMuY2hlY2tSZWN1cnNpdmUgJiYgZGF0YSAmJiB0eXBlb2YgZGF0YSA9PT0gJ29iamVjdCcpIHtcblx0XHR0b3BMZXZlbCA9ICF0aGlzLnNjYW5uZWQubGVuZ3RoO1xuXHRcdGlmIChkYXRhW3RoaXMudmFsaWRhdGVkU2NoZW1hc0tleV0pIHtcblx0XHRcdHZhciBzY2hlbWFJbmRleCA9IGRhdGFbdGhpcy52YWxpZGF0ZWRTY2hlbWFzS2V5XS5pbmRleE9mKHNjaGVtYSk7XG5cdFx0XHRpZiAoc2NoZW1hSW5kZXggIT09IC0xKSB7XG5cdFx0XHRcdHRoaXMuZXJyb3JzID0gdGhpcy5lcnJvcnMuY29uY2F0KGRhdGFbdGhpcy52YWxpZGF0aW9uRXJyb3JzS2V5XVtzY2hlbWFJbmRleF0pO1xuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKE9iamVjdC5pc0Zyb3plbihkYXRhKSkge1xuXHRcdFx0ZnJvemVuSW5kZXggPSB0aGlzLnNjYW5uZWRGcm96ZW4uaW5kZXhPZihkYXRhKTtcblx0XHRcdGlmIChmcm96ZW5JbmRleCAhPT0gLTEpIHtcblx0XHRcdFx0dmFyIGZyb3plblNjaGVtYUluZGV4ID0gdGhpcy5zY2FubmVkRnJvemVuU2NoZW1hc1tmcm96ZW5JbmRleF0uaW5kZXhPZihzY2hlbWEpO1xuXHRcdFx0XHRpZiAoZnJvemVuU2NoZW1hSW5kZXggIT09IC0xKSB7XG5cdFx0XHRcdFx0dGhpcy5lcnJvcnMgPSB0aGlzLmVycm9ycy5jb25jYXQodGhpcy5zY2FubmVkRnJvemVuVmFsaWRhdGlvbkVycm9yc1tmcm96ZW5JbmRleF1bZnJvemVuU2NoZW1hSW5kZXhdKTtcblx0XHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHR0aGlzLnNjYW5uZWQucHVzaChkYXRhKTtcblx0XHRpZiAoT2JqZWN0LmlzRnJvemVuKGRhdGEpKSB7XG5cdFx0XHRpZiAoZnJvemVuSW5kZXggPT09IC0xKSB7XG5cdFx0XHRcdGZyb3plbkluZGV4ID0gdGhpcy5zY2FubmVkRnJvemVuLmxlbmd0aDtcblx0XHRcdFx0dGhpcy5zY2FubmVkRnJvemVuLnB1c2goZGF0YSk7XG5cdFx0XHRcdHRoaXMuc2Nhbm5lZEZyb3plblNjaGVtYXMucHVzaChbXSk7XG5cdFx0XHR9XG5cdFx0XHRzY2FubmVkRnJvemVuU2NoZW1hSW5kZXggPSB0aGlzLnNjYW5uZWRGcm96ZW5TY2hlbWFzW2Zyb3plbkluZGV4XS5sZW5ndGg7XG5cdFx0XHR0aGlzLnNjYW5uZWRGcm96ZW5TY2hlbWFzW2Zyb3plbkluZGV4XVtzY2FubmVkRnJvemVuU2NoZW1hSW5kZXhdID0gc2NoZW1hO1xuXHRcdFx0dGhpcy5zY2FubmVkRnJvemVuVmFsaWRhdGlvbkVycm9yc1tmcm96ZW5JbmRleF1bc2Nhbm5lZEZyb3plblNjaGVtYUluZGV4XSA9IFtdO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAoIWRhdGFbdGhpcy52YWxpZGF0ZWRTY2hlbWFzS2V5XSkge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkYXRhLCB0aGlzLnZhbGlkYXRlZFNjaGVtYXNLZXksIHtcblx0XHRcdFx0XHRcdHZhbHVlOiBbXSxcblx0XHRcdFx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkYXRhLCB0aGlzLnZhbGlkYXRpb25FcnJvcnNLZXksIHtcblx0XHRcdFx0XHRcdHZhbHVlOiBbXSxcblx0XHRcdFx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0Ly9JRSA3Lzggd29ya2Fyb3VuZFxuXHRcdFx0XHRcdGRhdGFbdGhpcy52YWxpZGF0ZWRTY2hlbWFzS2V5XSA9IFtdO1xuXHRcdFx0XHRcdGRhdGFbdGhpcy52YWxpZGF0aW9uRXJyb3JzS2V5XSA9IFtdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRzY2FubmVkU2NoZW1hc0luZGV4ID0gZGF0YVt0aGlzLnZhbGlkYXRlZFNjaGVtYXNLZXldLmxlbmd0aDtcblx0XHRcdGRhdGFbdGhpcy52YWxpZGF0ZWRTY2hlbWFzS2V5XVtzY2FubmVkU2NoZW1hc0luZGV4XSA9IHNjaGVtYTtcblx0XHRcdGRhdGFbdGhpcy52YWxpZGF0aW9uRXJyb3JzS2V5XVtzY2FubmVkU2NoZW1hc0luZGV4XSA9IFtdO1xuXHRcdH1cblx0fVxuXG5cdHZhciBlcnJvckNvdW50ID0gdGhpcy5lcnJvcnMubGVuZ3RoO1xuXHR2YXIgZXJyb3IgPSB0aGlzLnZhbGlkYXRlQmFzaWMoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZU51bWVyaWMoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZVN0cmluZyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCB0aGlzLnZhbGlkYXRlQXJyYXkoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZU9iamVjdChkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCB0aGlzLnZhbGlkYXRlQ29tYmluYXRpb25zKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVIeXBlcm1lZGlhKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVGb3JtYXQoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZURlZmluZWRLZXl3b3JkcyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCBudWxsO1xuXG5cdGlmICh0b3BMZXZlbCkge1xuXHRcdHdoaWxlICh0aGlzLnNjYW5uZWQubGVuZ3RoKSB7XG5cdFx0XHR2YXIgaXRlbSA9IHRoaXMuc2Nhbm5lZC5wb3AoKTtcblx0XHRcdGRlbGV0ZSBpdGVtW3RoaXMudmFsaWRhdGVkU2NoZW1hc0tleV07XG5cdFx0fVxuXHRcdHRoaXMuc2Nhbm5lZEZyb3plbiA9IFtdO1xuXHRcdHRoaXMuc2Nhbm5lZEZyb3plblNjaGVtYXMgPSBbXTtcblx0fVxuXG5cdGlmIChlcnJvciB8fCBlcnJvckNvdW50ICE9PSB0aGlzLmVycm9ycy5sZW5ndGgpIHtcblx0XHR3aGlsZSAoKGRhdGFQYXRoUGFydHMgJiYgZGF0YVBhdGhQYXJ0cy5sZW5ndGgpIHx8IChzY2hlbWFQYXRoUGFydHMgJiYgc2NoZW1hUGF0aFBhcnRzLmxlbmd0aCkpIHtcblx0XHRcdHZhciBkYXRhUGFydCA9IChkYXRhUGF0aFBhcnRzICYmIGRhdGFQYXRoUGFydHMubGVuZ3RoKSA/IFwiXCIgKyBkYXRhUGF0aFBhcnRzLnBvcCgpIDogbnVsbDtcblx0XHRcdHZhciBzY2hlbWFQYXJ0ID0gKHNjaGVtYVBhdGhQYXJ0cyAmJiBzY2hlbWFQYXRoUGFydHMubGVuZ3RoKSA/IFwiXCIgKyBzY2hlbWFQYXRoUGFydHMucG9wKCkgOiBudWxsO1xuXHRcdFx0aWYgKGVycm9yKSB7XG5cdFx0XHRcdGVycm9yID0gZXJyb3IucHJlZml4V2l0aChkYXRhUGFydCwgc2NoZW1hUGFydCk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLnByZWZpeEVycm9ycyhlcnJvckNvdW50LCBkYXRhUGFydCwgc2NoZW1hUGFydCk7XG5cdFx0fVxuXHR9XG5cblx0aWYgKHNjYW5uZWRGcm96ZW5TY2hlbWFJbmRleCAhPT0gbnVsbCkge1xuXHRcdHRoaXMuc2Nhbm5lZEZyb3plblZhbGlkYXRpb25FcnJvcnNbZnJvemVuSW5kZXhdW3NjYW5uZWRGcm96ZW5TY2hlbWFJbmRleF0gPSB0aGlzLmVycm9ycy5zbGljZShzdGFydEVycm9yQ291bnQpO1xuXHR9IGVsc2UgaWYgKHNjYW5uZWRTY2hlbWFzSW5kZXggIT09IG51bGwpIHtcblx0XHRkYXRhW3RoaXMudmFsaWRhdGlvbkVycm9yc0tleV1bc2Nhbm5lZFNjaGVtYXNJbmRleF0gPSB0aGlzLmVycm9ycy5zbGljZShzdGFydEVycm9yQ291bnQpO1xuXHR9XG5cblx0cmV0dXJuIHRoaXMuaGFuZGxlRXJyb3IoZXJyb3IpO1xufTtcblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlRm9ybWF0ID0gZnVuY3Rpb24gKGRhdGEsIHNjaGVtYSkge1xuXHRpZiAodHlwZW9mIHNjaGVtYS5mb3JtYXQgIT09ICdzdHJpbmcnIHx8ICF0aGlzLmZvcm1hdFZhbGlkYXRvcnNbc2NoZW1hLmZvcm1hdF0pIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHR2YXIgZXJyb3JNZXNzYWdlID0gdGhpcy5mb3JtYXRWYWxpZGF0b3JzW3NjaGVtYS5mb3JtYXRdLmNhbGwobnVsbCwgZGF0YSwgc2NoZW1hKTtcblx0aWYgKHR5cGVvZiBlcnJvck1lc3NhZ2UgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBlcnJvck1lc3NhZ2UgPT09ICdudW1iZXInKSB7XG5cdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5GT1JNQVRfQ1VTVE9NLCB7bWVzc2FnZTogZXJyb3JNZXNzYWdlfSkucHJlZml4V2l0aChudWxsLCBcImZvcm1hdFwiKTtcblx0fSBlbHNlIGlmIChlcnJvck1lc3NhZ2UgJiYgdHlwZW9mIGVycm9yTWVzc2FnZSA9PT0gJ29iamVjdCcpIHtcblx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLkZPUk1BVF9DVVNUT00sIHttZXNzYWdlOiBlcnJvck1lc3NhZ2UubWVzc2FnZSB8fCBcIj9cIn0sIGVycm9yTWVzc2FnZS5kYXRhUGF0aCB8fCBudWxsLCBlcnJvck1lc3NhZ2Uuc2NoZW1hUGF0aCB8fCBcIi9mb3JtYXRcIik7XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVEZWZpbmVkS2V5d29yZHMgPSBmdW5jdGlvbiAoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpIHtcblx0Zm9yICh2YXIga2V5IGluIHRoaXMuZGVmaW5lZEtleXdvcmRzKSB7XG5cdFx0aWYgKHR5cGVvZiBzY2hlbWFba2V5XSA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdGNvbnRpbnVlO1xuXHRcdH1cblx0XHR2YXIgdmFsaWRhdGlvbkZ1bmN0aW9ucyA9IHRoaXMuZGVmaW5lZEtleXdvcmRzW2tleV07XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB2YWxpZGF0aW9uRnVuY3Rpb25zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgZnVuYyA9IHZhbGlkYXRpb25GdW5jdGlvbnNbaV07XG5cdFx0XHR2YXIgcmVzdWx0ID0gZnVuYyhkYXRhLCBzY2hlbWFba2V5XSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpO1xuXHRcdFx0aWYgKHR5cGVvZiByZXN1bHQgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiByZXN1bHQgPT09ICdudW1iZXInKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuS0VZV09SRF9DVVNUT00sIHtrZXk6IGtleSwgbWVzc2FnZTogcmVzdWx0fSkucHJlZml4V2l0aChudWxsLCBcImZvcm1hdFwiKTtcblx0XHRcdH0gZWxzZSBpZiAocmVzdWx0ICYmIHR5cGVvZiByZXN1bHQgPT09ICdvYmplY3QnKSB7XG5cdFx0XHRcdHZhciBjb2RlID0gcmVzdWx0LmNvZGU7XG5cdFx0XHRcdGlmICh0eXBlb2YgY29kZSA9PT0gJ3N0cmluZycpIHtcblx0XHRcdFx0XHRpZiAoIUVycm9yQ29kZXNbY29kZV0pIHtcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcignVW5kZWZpbmVkIGVycm9yIGNvZGUgKHVzZSBkZWZpbmVFcnJvcik6ICcgKyBjb2RlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y29kZSA9IEVycm9yQ29kZXNbY29kZV07XG5cdFx0XHRcdH0gZWxzZSBpZiAodHlwZW9mIGNvZGUgIT09ICdudW1iZXInKSB7XG5cdFx0XHRcdFx0Y29kZSA9IEVycm9yQ29kZXMuS0VZV09SRF9DVVNUT007XG5cdFx0XHRcdH1cblx0XHRcdFx0dmFyIG1lc3NhZ2VQYXJhbXMgPSAodHlwZW9mIHJlc3VsdC5tZXNzYWdlID09PSAnb2JqZWN0JykgPyByZXN1bHQubWVzc2FnZSA6IHtrZXk6IGtleSwgbWVzc2FnZTogcmVzdWx0Lm1lc3NhZ2UgfHwgXCI/XCJ9O1xuXHRcdFx0XHR2YXIgc2NoZW1hUGF0aCA9IHJlc3VsdC5zY2hlbWFQYXRoIHx8KCBcIi9cIiArIGtleS5yZXBsYWNlKC9+L2csICd+MCcpLnJlcGxhY2UoL1xcLy9nLCAnfjEnKSk7XG5cdFx0XHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKGNvZGUsIG1lc3NhZ2VQYXJhbXMsIHJlc3VsdC5kYXRhUGF0aCB8fCBudWxsLCBzY2hlbWFQYXRoKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5mdW5jdGlvbiByZWN1cnNpdmVDb21wYXJlKEEsIEIpIHtcblx0aWYgKEEgPT09IEIpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHRpZiAodHlwZW9mIEEgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIEIgPT09IFwib2JqZWN0XCIpIHtcblx0XHRpZiAoQXJyYXkuaXNBcnJheShBKSAhPT0gQXJyYXkuaXNBcnJheShCKSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShBKSkge1xuXHRcdFx0aWYgKEEubGVuZ3RoICE9PSBCLmxlbmd0aCkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IEEubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKCFyZWN1cnNpdmVDb21wYXJlKEFbaV0sIEJbaV0pKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBrZXk7XG5cdFx0XHRmb3IgKGtleSBpbiBBKSB7XG5cdFx0XHRcdGlmIChCW2tleV0gPT09IHVuZGVmaW5lZCAmJiBBW2tleV0gIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Zm9yIChrZXkgaW4gQikge1xuXHRcdFx0XHRpZiAoQVtrZXldID09PSB1bmRlZmluZWQgJiYgQltrZXldICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGZvciAoa2V5IGluIEEpIHtcblx0XHRcdFx0aWYgKCFyZWN1cnNpdmVDb21wYXJlKEFba2V5XSwgQltrZXldKSkge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHRyZXR1cm4gZmFsc2U7XG59XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlQmFzaWMgPSBmdW5jdGlvbiB2YWxpZGF0ZUJhc2ljKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKSB7XG5cdHZhciBlcnJvcjtcblx0aWYgKGVycm9yID0gdGhpcy52YWxpZGF0ZVR5cGUoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpKSB7XG5cdFx0cmV0dXJuIGVycm9yLnByZWZpeFdpdGgobnVsbCwgXCJ0eXBlXCIpO1xuXHR9XG5cdGlmIChlcnJvciA9IHRoaXMudmFsaWRhdGVFbnVtKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKSkge1xuXHRcdHJldHVybiBlcnJvci5wcmVmaXhXaXRoKG51bGwsIFwidHlwZVwiKTtcblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlVHlwZSA9IGZ1bmN0aW9uIHZhbGlkYXRlVHlwZShkYXRhLCBzY2hlbWEpIHtcblx0aWYgKHNjaGVtYS50eXBlID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHR2YXIgZGF0YVR5cGUgPSB0eXBlb2YgZGF0YTtcblx0aWYgKGRhdGEgPT09IG51bGwpIHtcblx0XHRkYXRhVHlwZSA9IFwibnVsbFwiO1xuXHR9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoZGF0YSkpIHtcblx0XHRkYXRhVHlwZSA9IFwiYXJyYXlcIjtcblx0fVxuXHR2YXIgYWxsb3dlZFR5cGVzID0gc2NoZW1hLnR5cGU7XG5cdGlmICh0eXBlb2YgYWxsb3dlZFR5cGVzICE9PSBcIm9iamVjdFwiKSB7XG5cdFx0YWxsb3dlZFR5cGVzID0gW2FsbG93ZWRUeXBlc107XG5cdH1cblxuXHRmb3IgKHZhciBpID0gMDsgaSA8IGFsbG93ZWRUeXBlcy5sZW5ndGg7IGkrKykge1xuXHRcdHZhciB0eXBlID0gYWxsb3dlZFR5cGVzW2ldO1xuXHRcdGlmICh0eXBlID09PSBkYXRhVHlwZSB8fCAodHlwZSA9PT0gXCJpbnRlZ2VyXCIgJiYgZGF0YVR5cGUgPT09IFwibnVtYmVyXCIgJiYgKGRhdGEgJSAxID09PSAwKSkpIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLklOVkFMSURfVFlQRSwge3R5cGU6IGRhdGFUeXBlLCBleHBlY3RlZDogYWxsb3dlZFR5cGVzLmpvaW4oXCIvXCIpfSk7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZUVudW0gPSBmdW5jdGlvbiB2YWxpZGF0ZUVudW0oZGF0YSwgc2NoZW1hKSB7XG5cdGlmIChzY2hlbWFbXCJlbnVtXCJdID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHRmb3IgKHZhciBpID0gMDsgaSA8IHNjaGVtYVtcImVudW1cIl0ubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgZW51bVZhbCA9IHNjaGVtYVtcImVudW1cIl1baV07XG5cdFx0aWYgKHJlY3Vyc2l2ZUNvbXBhcmUoZGF0YSwgZW51bVZhbCkpIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLkVOVU1fTUlTTUFUQ0gsIHt2YWx1ZTogKHR5cGVvZiBKU09OICE9PSAndW5kZWZpbmVkJykgPyBKU09OLnN0cmluZ2lmeShkYXRhKSA6IGRhdGF9KTtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlTnVtZXJpYyA9IGZ1bmN0aW9uIHZhbGlkYXRlTnVtZXJpYyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aCkge1xuXHRyZXR1cm4gdGhpcy52YWxpZGF0ZU11bHRpcGxlT2YoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZU1pbk1heChkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCB0aGlzLnZhbGlkYXRlTmFOKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IG51bGw7XG59O1xuXG52YXIgQ0xPU0VfRU5PVUdIX0xPVyA9IE1hdGgucG93KDIsIC01MSk7XG52YXIgQ0xPU0VfRU5PVUdIX0hJR0ggPSAxIC0gQ0xPU0VfRU5PVUdIX0xPVztcblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlTXVsdGlwbGVPZiA9IGZ1bmN0aW9uIHZhbGlkYXRlTXVsdGlwbGVPZihkYXRhLCBzY2hlbWEpIHtcblx0dmFyIG11bHRpcGxlT2YgPSBzY2hlbWEubXVsdGlwbGVPZiB8fCBzY2hlbWEuZGl2aXNpYmxlQnk7XG5cdGlmIChtdWx0aXBsZU9mID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHRpZiAodHlwZW9mIGRhdGEgPT09IFwibnVtYmVyXCIpIHtcblx0XHR2YXIgcmVtYWluZGVyID0gKGRhdGEvbXVsdGlwbGVPZiklMTtcblx0XHRpZiAocmVtYWluZGVyID49IENMT1NFX0VOT1VHSF9MT1cgJiYgcmVtYWluZGVyIDwgQ0xPU0VfRU5PVUdIX0hJR0gpIHtcblx0XHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuTlVNQkVSX01VTFRJUExFX09GLCB7dmFsdWU6IGRhdGEsIG11bHRpcGxlT2Y6IG11bHRpcGxlT2Z9KTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZU1pbk1heCA9IGZ1bmN0aW9uIHZhbGlkYXRlTWluTWF4KGRhdGEsIHNjaGVtYSkge1xuXHRpZiAodHlwZW9mIGRhdGEgIT09IFwibnVtYmVyXCIpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHRpZiAoc2NoZW1hLm1pbmltdW0gIT09IHVuZGVmaW5lZCkge1xuXHRcdGlmIChkYXRhIDwgc2NoZW1hLm1pbmltdW0pIHtcblx0XHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuTlVNQkVSX01JTklNVU0sIHt2YWx1ZTogZGF0YSwgbWluaW11bTogc2NoZW1hLm1pbmltdW19KS5wcmVmaXhXaXRoKG51bGwsIFwibWluaW11bVwiKTtcblx0XHR9XG5cdFx0aWYgKHNjaGVtYS5leGNsdXNpdmVNaW5pbXVtICYmIGRhdGEgPT09IHNjaGVtYS5taW5pbXVtKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLk5VTUJFUl9NSU5JTVVNX0VYQ0xVU0lWRSwge3ZhbHVlOiBkYXRhLCBtaW5pbXVtOiBzY2hlbWEubWluaW11bX0pLnByZWZpeFdpdGgobnVsbCwgXCJleGNsdXNpdmVNaW5pbXVtXCIpO1xuXHRcdH1cblx0fVxuXHRpZiAoc2NoZW1hLm1heGltdW0gIT09IHVuZGVmaW5lZCkge1xuXHRcdGlmIChkYXRhID4gc2NoZW1hLm1heGltdW0pIHtcblx0XHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuTlVNQkVSX01BWElNVU0sIHt2YWx1ZTogZGF0YSwgbWF4aW11bTogc2NoZW1hLm1heGltdW19KS5wcmVmaXhXaXRoKG51bGwsIFwibWF4aW11bVwiKTtcblx0XHR9XG5cdFx0aWYgKHNjaGVtYS5leGNsdXNpdmVNYXhpbXVtICYmIGRhdGEgPT09IHNjaGVtYS5tYXhpbXVtKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLk5VTUJFUl9NQVhJTVVNX0VYQ0xVU0lWRSwge3ZhbHVlOiBkYXRhLCBtYXhpbXVtOiBzY2hlbWEubWF4aW11bX0pLnByZWZpeFdpdGgobnVsbCwgXCJleGNsdXNpdmVNYXhpbXVtXCIpO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlTmFOID0gZnVuY3Rpb24gdmFsaWRhdGVOYU4oZGF0YSkge1xuXHRpZiAodHlwZW9mIGRhdGEgIT09IFwibnVtYmVyXCIpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHRpZiAoaXNOYU4oZGF0YSkgPT09IHRydWUgfHwgZGF0YSA9PT0gSW5maW5pdHkgfHwgZGF0YSA9PT0gLUluZmluaXR5KSB7XG5cdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5OVU1CRVJfTk9UX0FfTlVNQkVSLCB7dmFsdWU6IGRhdGF9KS5wcmVmaXhXaXRoKG51bGwsIFwidHlwZVwiKTtcblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlU3RyaW5nID0gZnVuY3Rpb24gdmFsaWRhdGVTdHJpbmcoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpIHtcblx0cmV0dXJuIHRoaXMudmFsaWRhdGVTdHJpbmdMZW5ndGgoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZVN0cmluZ1BhdHRlcm4oZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlU3RyaW5nTGVuZ3RoID0gZnVuY3Rpb24gdmFsaWRhdGVTdHJpbmdMZW5ndGgoZGF0YSwgc2NoZW1hKSB7XG5cdGlmICh0eXBlb2YgZGF0YSAhPT0gXCJzdHJpbmdcIikge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdGlmIChzY2hlbWEubWluTGVuZ3RoICE9PSB1bmRlZmluZWQpIHtcblx0XHRpZiAoZGF0YS5sZW5ndGggPCBzY2hlbWEubWluTGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLlNUUklOR19MRU5HVEhfU0hPUlQsIHtsZW5ndGg6IGRhdGEubGVuZ3RoLCBtaW5pbXVtOiBzY2hlbWEubWluTGVuZ3RofSkucHJlZml4V2l0aChudWxsLCBcIm1pbkxlbmd0aFwiKTtcblx0XHR9XG5cdH1cblx0aWYgKHNjaGVtYS5tYXhMZW5ndGggIT09IHVuZGVmaW5lZCkge1xuXHRcdGlmIChkYXRhLmxlbmd0aCA+IHNjaGVtYS5tYXhMZW5ndGgpIHtcblx0XHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuU1RSSU5HX0xFTkdUSF9MT05HLCB7bGVuZ3RoOiBkYXRhLmxlbmd0aCwgbWF4aW11bTogc2NoZW1hLm1heExlbmd0aH0pLnByZWZpeFdpdGgobnVsbCwgXCJtYXhMZW5ndGhcIik7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVTdHJpbmdQYXR0ZXJuID0gZnVuY3Rpb24gdmFsaWRhdGVTdHJpbmdQYXR0ZXJuKGRhdGEsIHNjaGVtYSkge1xuXHRpZiAodHlwZW9mIGRhdGEgIT09IFwic3RyaW5nXCIgfHwgc2NoZW1hLnBhdHRlcm4gPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdHZhciByZWdleHAgPSBuZXcgUmVnRXhwKHNjaGVtYS5wYXR0ZXJuKTtcblx0aWYgKCFyZWdleHAudGVzdChkYXRhKSkge1xuXHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuU1RSSU5HX1BBVFRFUk4sIHtwYXR0ZXJuOiBzY2hlbWEucGF0dGVybn0pLnByZWZpeFdpdGgobnVsbCwgXCJwYXR0ZXJuXCIpO1xuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlQXJyYXkgPSBmdW5jdGlvbiB2YWxpZGF0ZUFycmF5KGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKSB7XG5cdGlmICghQXJyYXkuaXNBcnJheShkYXRhKSkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdHJldHVybiB0aGlzLnZhbGlkYXRlQXJyYXlMZW5ndGgoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZUFycmF5VW5pcXVlSXRlbXMoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZUFycmF5SXRlbXMoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlQXJyYXlMZW5ndGggPSBmdW5jdGlvbiB2YWxpZGF0ZUFycmF5TGVuZ3RoKGRhdGEsIHNjaGVtYSkge1xuXHR2YXIgZXJyb3I7XG5cdGlmIChzY2hlbWEubWluSXRlbXMgIT09IHVuZGVmaW5lZCkge1xuXHRcdGlmIChkYXRhLmxlbmd0aCA8IHNjaGVtYS5taW5JdGVtcykge1xuXHRcdFx0ZXJyb3IgPSAodGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLkFSUkFZX0xFTkdUSF9TSE9SVCwge2xlbmd0aDogZGF0YS5sZW5ndGgsIG1pbmltdW06IHNjaGVtYS5taW5JdGVtc30pKS5wcmVmaXhXaXRoKG51bGwsIFwibWluSXRlbXNcIik7XG5cdFx0XHRpZiAodGhpcy5oYW5kbGVFcnJvcihlcnJvcikpIHtcblx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRpZiAoc2NoZW1hLm1heEl0ZW1zICE9PSB1bmRlZmluZWQpIHtcblx0XHRpZiAoZGF0YS5sZW5ndGggPiBzY2hlbWEubWF4SXRlbXMpIHtcblx0XHRcdGVycm9yID0gKHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5BUlJBWV9MRU5HVEhfTE9ORywge2xlbmd0aDogZGF0YS5sZW5ndGgsIG1heGltdW06IHNjaGVtYS5tYXhJdGVtc30pKS5wcmVmaXhXaXRoKG51bGwsIFwibWF4SXRlbXNcIik7XG5cdFx0XHRpZiAodGhpcy5oYW5kbGVFcnJvcihlcnJvcikpIHtcblx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlQXJyYXlVbmlxdWVJdGVtcyA9IGZ1bmN0aW9uIHZhbGlkYXRlQXJyYXlVbmlxdWVJdGVtcyhkYXRhLCBzY2hlbWEpIHtcblx0aWYgKHNjaGVtYS51bmlxdWVJdGVtcykge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuXHRcdFx0Zm9yICh2YXIgaiA9IGkgKyAxOyBqIDwgZGF0YS5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRpZiAocmVjdXJzaXZlQ29tcGFyZShkYXRhW2ldLCBkYXRhW2pdKSkge1xuXHRcdFx0XHRcdHZhciBlcnJvciA9ICh0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuQVJSQVlfVU5JUVVFLCB7bWF0Y2gxOiBpLCBtYXRjaDI6IGp9KSkucHJlZml4V2l0aChudWxsLCBcInVuaXF1ZUl0ZW1zXCIpO1xuXHRcdFx0XHRcdGlmICh0aGlzLmhhbmRsZUVycm9yKGVycm9yKSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlQXJyYXlJdGVtcyA9IGZ1bmN0aW9uIHZhbGlkYXRlQXJyYXlJdGVtcyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aCkge1xuXHRpZiAoc2NoZW1hLml0ZW1zID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHR2YXIgZXJyb3IsIGk7XG5cdGlmIChBcnJheS5pc0FycmF5KHNjaGVtYS5pdGVtcykpIHtcblx0XHRmb3IgKGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKGkgPCBzY2hlbWEuaXRlbXMubGVuZ3RoKSB7XG5cdFx0XHRcdGlmIChlcnJvciA9IHRoaXMudmFsaWRhdGVBbGwoZGF0YVtpXSwgc2NoZW1hLml0ZW1zW2ldLCBbaV0sIFtcIml0ZW1zXCIsIGldLCBkYXRhUG9pbnRlclBhdGggKyBcIi9cIiArIGkpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKHNjaGVtYS5hZGRpdGlvbmFsSXRlbXMgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRpZiAodHlwZW9mIHNjaGVtYS5hZGRpdGlvbmFsSXRlbXMgPT09IFwiYm9vbGVhblwiKSB7XG5cdFx0XHRcdFx0aWYgKCFzY2hlbWEuYWRkaXRpb25hbEl0ZW1zKSB7XG5cdFx0XHRcdFx0XHRlcnJvciA9ICh0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuQVJSQVlfQURESVRJT05BTF9JVEVNUywge30pKS5wcmVmaXhXaXRoKFwiXCIgKyBpLCBcImFkZGl0aW9uYWxJdGVtc1wiKTtcblx0XHRcdFx0XHRcdGlmICh0aGlzLmhhbmRsZUVycm9yKGVycm9yKSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2UgaWYgKGVycm9yID0gdGhpcy52YWxpZGF0ZUFsbChkYXRhW2ldLCBzY2hlbWEuYWRkaXRpb25hbEl0ZW1zLCBbaV0sIFtcImFkZGl0aW9uYWxJdGVtc1wiXSwgZGF0YVBvaW50ZXJQYXRoICsgXCIvXCIgKyBpKSkge1xuXHRcdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRmb3IgKGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKGVycm9yID0gdGhpcy52YWxpZGF0ZUFsbChkYXRhW2ldLCBzY2hlbWEuaXRlbXMsIFtpXSwgW1wiaXRlbXNcIl0sIGRhdGFQb2ludGVyUGF0aCArIFwiL1wiICsgaSkpIHtcblx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlT2JqZWN0ID0gZnVuY3Rpb24gdmFsaWRhdGVPYmplY3QoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpIHtcblx0aWYgKHR5cGVvZiBkYXRhICE9PSBcIm9iamVjdFwiIHx8IGRhdGEgPT09IG51bGwgfHwgQXJyYXkuaXNBcnJheShkYXRhKSkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdHJldHVybiB0aGlzLnZhbGlkYXRlT2JqZWN0TWluTWF4UHJvcGVydGllcyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCB0aGlzLnZhbGlkYXRlT2JqZWN0UmVxdWlyZWRQcm9wZXJ0aWVzKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVPYmplY3RQcm9wZXJ0aWVzKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVPYmplY3REZXBlbmRlbmNpZXMoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlT2JqZWN0TWluTWF4UHJvcGVydGllcyA9IGZ1bmN0aW9uIHZhbGlkYXRlT2JqZWN0TWluTWF4UHJvcGVydGllcyhkYXRhLCBzY2hlbWEpIHtcblx0dmFyIGtleXMgPSBPYmplY3Qua2V5cyhkYXRhKTtcblx0dmFyIGVycm9yO1xuXHRpZiAoc2NoZW1hLm1pblByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCkge1xuXHRcdGlmIChrZXlzLmxlbmd0aCA8IHNjaGVtYS5taW5Qcm9wZXJ0aWVzKSB7XG5cdFx0XHRlcnJvciA9IHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5PQkpFQ1RfUFJPUEVSVElFU19NSU5JTVVNLCB7cHJvcGVydHlDb3VudDoga2V5cy5sZW5ndGgsIG1pbmltdW06IHNjaGVtYS5taW5Qcm9wZXJ0aWVzfSkucHJlZml4V2l0aChudWxsLCBcIm1pblByb3BlcnRpZXNcIik7XG5cdFx0XHRpZiAodGhpcy5oYW5kbGVFcnJvcihlcnJvcikpIHtcblx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRpZiAoc2NoZW1hLm1heFByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCkge1xuXHRcdGlmIChrZXlzLmxlbmd0aCA+IHNjaGVtYS5tYXhQcm9wZXJ0aWVzKSB7XG5cdFx0XHRlcnJvciA9IHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5PQkpFQ1RfUFJPUEVSVElFU19NQVhJTVVNLCB7cHJvcGVydHlDb3VudDoga2V5cy5sZW5ndGgsIG1heGltdW06IHNjaGVtYS5tYXhQcm9wZXJ0aWVzfSkucHJlZml4V2l0aChudWxsLCBcIm1heFByb3BlcnRpZXNcIik7XG5cdFx0XHRpZiAodGhpcy5oYW5kbGVFcnJvcihlcnJvcikpIHtcblx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlT2JqZWN0UmVxdWlyZWRQcm9wZXJ0aWVzID0gZnVuY3Rpb24gdmFsaWRhdGVPYmplY3RSZXF1aXJlZFByb3BlcnRpZXMoZGF0YSwgc2NoZW1hKSB7XG5cdGlmIChzY2hlbWEucmVxdWlyZWQgIT09IHVuZGVmaW5lZCkge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc2NoZW1hLnJlcXVpcmVkLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIga2V5ID0gc2NoZW1hLnJlcXVpcmVkW2ldO1xuXHRcdFx0aWYgKGRhdGFba2V5XSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHZhciBlcnJvciA9IHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5PQkpFQ1RfUkVRVUlSRUQsIHtrZXk6IGtleX0pLnByZWZpeFdpdGgobnVsbCwgXCJcIiArIGkpLnByZWZpeFdpdGgobnVsbCwgXCJyZXF1aXJlZFwiKTtcblx0XHRcdFx0aWYgKHRoaXMuaGFuZGxlRXJyb3IoZXJyb3IpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVPYmplY3RQcm9wZXJ0aWVzID0gZnVuY3Rpb24gdmFsaWRhdGVPYmplY3RQcm9wZXJ0aWVzKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKSB7XG5cdHZhciBlcnJvcjtcblx0Zm9yICh2YXIga2V5IGluIGRhdGEpIHtcblx0XHR2YXIga2V5UG9pbnRlclBhdGggPSBkYXRhUG9pbnRlclBhdGggKyBcIi9cIiArIGtleS5yZXBsYWNlKC9+L2csICd+MCcpLnJlcGxhY2UoL1xcLy9nLCAnfjEnKTtcblx0XHR2YXIgZm91bmRNYXRjaCA9IGZhbHNlO1xuXHRcdGlmIChzY2hlbWEucHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICYmIHNjaGVtYS5wcm9wZXJ0aWVzW2tleV0gIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Zm91bmRNYXRjaCA9IHRydWU7XG5cdFx0XHRpZiAoZXJyb3IgPSB0aGlzLnZhbGlkYXRlQWxsKGRhdGFba2V5XSwgc2NoZW1hLnByb3BlcnRpZXNba2V5XSwgW2tleV0sIFtcInByb3BlcnRpZXNcIiwga2V5XSwga2V5UG9pbnRlclBhdGgpKSB7XG5cdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKHNjaGVtYS5wYXR0ZXJuUHJvcGVydGllcyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRmb3IgKHZhciBwYXR0ZXJuS2V5IGluIHNjaGVtYS5wYXR0ZXJuUHJvcGVydGllcykge1xuXHRcdFx0XHR2YXIgcmVnZXhwID0gbmV3IFJlZ0V4cChwYXR0ZXJuS2V5KTtcblx0XHRcdFx0aWYgKHJlZ2V4cC50ZXN0KGtleSkpIHtcblx0XHRcdFx0XHRmb3VuZE1hdGNoID0gdHJ1ZTtcblx0XHRcdFx0XHRpZiAoZXJyb3IgPSB0aGlzLnZhbGlkYXRlQWxsKGRhdGFba2V5XSwgc2NoZW1hLnBhdHRlcm5Qcm9wZXJ0aWVzW3BhdHRlcm5LZXldLCBba2V5XSwgW1wicGF0dGVyblByb3BlcnRpZXNcIiwgcGF0dGVybktleV0sIGtleVBvaW50ZXJQYXRoKSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoIWZvdW5kTWF0Y2gpIHtcblx0XHRcdGlmIChzY2hlbWEuYWRkaXRpb25hbFByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRpZiAodGhpcy50cmFja1Vua25vd25Qcm9wZXJ0aWVzKSB7XG5cdFx0XHRcdFx0dGhpcy5rbm93blByb3BlcnR5UGF0aHNba2V5UG9pbnRlclBhdGhdID0gdHJ1ZTtcblx0XHRcdFx0XHRkZWxldGUgdGhpcy51bmtub3duUHJvcGVydHlQYXRoc1trZXlQb2ludGVyUGF0aF07XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHR5cGVvZiBzY2hlbWEuYWRkaXRpb25hbFByb3BlcnRpZXMgPT09IFwiYm9vbGVhblwiKSB7XG5cdFx0XHRcdFx0aWYgKCFzY2hlbWEuYWRkaXRpb25hbFByb3BlcnRpZXMpIHtcblx0XHRcdFx0XHRcdGVycm9yID0gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLk9CSkVDVF9BRERJVElPTkFMX1BST1BFUlRJRVMsIHt9KS5wcmVmaXhXaXRoKGtleSwgXCJhZGRpdGlvbmFsUHJvcGVydGllc1wiKTtcblx0XHRcdFx0XHRcdGlmICh0aGlzLmhhbmRsZUVycm9yKGVycm9yKSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGlmIChlcnJvciA9IHRoaXMudmFsaWRhdGVBbGwoZGF0YVtrZXldLCBzY2hlbWEuYWRkaXRpb25hbFByb3BlcnRpZXMsIFtrZXldLCBbXCJhZGRpdGlvbmFsUHJvcGVydGllc1wiXSwga2V5UG9pbnRlclBhdGgpKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKHRoaXMudHJhY2tVbmtub3duUHJvcGVydGllcyAmJiAhdGhpcy5rbm93blByb3BlcnR5UGF0aHNba2V5UG9pbnRlclBhdGhdKSB7XG5cdFx0XHRcdHRoaXMudW5rbm93blByb3BlcnR5UGF0aHNba2V5UG9pbnRlclBhdGhdID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKHRoaXMudHJhY2tVbmtub3duUHJvcGVydGllcykge1xuXHRcdFx0dGhpcy5rbm93blByb3BlcnR5UGF0aHNba2V5UG9pbnRlclBhdGhdID0gdHJ1ZTtcblx0XHRcdGRlbGV0ZSB0aGlzLnVua25vd25Qcm9wZXJ0eVBhdGhzW2tleVBvaW50ZXJQYXRoXTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZU9iamVjdERlcGVuZGVuY2llcyA9IGZ1bmN0aW9uIHZhbGlkYXRlT2JqZWN0RGVwZW5kZW5jaWVzKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKSB7XG5cdHZhciBlcnJvcjtcblx0aWYgKHNjaGVtYS5kZXBlbmRlbmNpZXMgIT09IHVuZGVmaW5lZCkge1xuXHRcdGZvciAodmFyIGRlcEtleSBpbiBzY2hlbWEuZGVwZW5kZW5jaWVzKSB7XG5cdFx0XHRpZiAoZGF0YVtkZXBLZXldICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0dmFyIGRlcCA9IHNjaGVtYS5kZXBlbmRlbmNpZXNbZGVwS2V5XTtcblx0XHRcdFx0aWYgKHR5cGVvZiBkZXAgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0XHRpZiAoZGF0YVtkZXBdID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdGVycm9yID0gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLk9CSkVDVF9ERVBFTkRFTkNZX0tFWSwge2tleTogZGVwS2V5LCBtaXNzaW5nOiBkZXB9KS5wcmVmaXhXaXRoKG51bGwsIGRlcEtleSkucHJlZml4V2l0aChudWxsLCBcImRlcGVuZGVuY2llc1wiKTtcblx0XHRcdFx0XHRcdGlmICh0aGlzLmhhbmRsZUVycm9yKGVycm9yKSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoZGVwKSkge1xuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZGVwLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHR2YXIgcmVxdWlyZWRLZXkgPSBkZXBbaV07XG5cdFx0XHRcdFx0XHRpZiAoZGF0YVtyZXF1aXJlZEtleV0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0XHRlcnJvciA9IHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5PQkpFQ1RfREVQRU5ERU5DWV9LRVksIHtrZXk6IGRlcEtleSwgbWlzc2luZzogcmVxdWlyZWRLZXl9KS5wcmVmaXhXaXRoKG51bGwsIFwiXCIgKyBpKS5wcmVmaXhXaXRoKG51bGwsIGRlcEtleSkucHJlZml4V2l0aChudWxsLCBcImRlcGVuZGVuY2llc1wiKTtcblx0XHRcdFx0XHRcdFx0aWYgKHRoaXMuaGFuZGxlRXJyb3IoZXJyb3IpKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGlmIChlcnJvciA9IHRoaXMudmFsaWRhdGVBbGwoZGF0YSwgZGVwLCBbXSwgW1wiZGVwZW5kZW5jaWVzXCIsIGRlcEtleV0sIGRhdGFQb2ludGVyUGF0aCkpIHtcblx0XHRcdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZUNvbWJpbmF0aW9ucyA9IGZ1bmN0aW9uIHZhbGlkYXRlQ29tYmluYXRpb25zKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKSB7XG5cdHJldHVybiB0aGlzLnZhbGlkYXRlQWxsT2YoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZUFueU9mKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVPbmVPZihkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCB0aGlzLnZhbGlkYXRlTm90KGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZUFsbE9mID0gZnVuY3Rpb24gdmFsaWRhdGVBbGxPZihkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aCkge1xuXHRpZiAoc2NoZW1hLmFsbE9mID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHR2YXIgZXJyb3I7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgc2NoZW1hLmFsbE9mLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIHN1YlNjaGVtYSA9IHNjaGVtYS5hbGxPZltpXTtcblx0XHRpZiAoZXJyb3IgPSB0aGlzLnZhbGlkYXRlQWxsKGRhdGEsIHN1YlNjaGVtYSwgW10sIFtcImFsbE9mXCIsIGldLCBkYXRhUG9pbnRlclBhdGgpKSB7XG5cdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVBbnlPZiA9IGZ1bmN0aW9uIHZhbGlkYXRlQW55T2YoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpIHtcblx0aWYgKHNjaGVtYS5hbnlPZiA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0dmFyIGVycm9ycyA9IFtdO1xuXHR2YXIgc3RhcnRFcnJvckNvdW50ID0gdGhpcy5lcnJvcnMubGVuZ3RoO1xuXHR2YXIgb2xkVW5rbm93blByb3BlcnR5UGF0aHMsIG9sZEtub3duUHJvcGVydHlQYXRocztcblx0aWYgKHRoaXMudHJhY2tVbmtub3duUHJvcGVydGllcykge1xuXHRcdG9sZFVua25vd25Qcm9wZXJ0eVBhdGhzID0gdGhpcy51bmtub3duUHJvcGVydHlQYXRocztcblx0XHRvbGRLbm93blByb3BlcnR5UGF0aHMgPSB0aGlzLmtub3duUHJvcGVydHlQYXRocztcblx0fVxuXHR2YXIgZXJyb3JBdEVuZCA9IHRydWU7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgc2NoZW1hLmFueU9mLmxlbmd0aDsgaSsrKSB7XG5cdFx0aWYgKHRoaXMudHJhY2tVbmtub3duUHJvcGVydGllcykge1xuXHRcdFx0dGhpcy51bmtub3duUHJvcGVydHlQYXRocyA9IHt9O1xuXHRcdFx0dGhpcy5rbm93blByb3BlcnR5UGF0aHMgPSB7fTtcblx0XHR9XG5cdFx0dmFyIHN1YlNjaGVtYSA9IHNjaGVtYS5hbnlPZltpXTtcblxuXHRcdHZhciBlcnJvckNvdW50ID0gdGhpcy5lcnJvcnMubGVuZ3RoO1xuXHRcdHZhciBlcnJvciA9IHRoaXMudmFsaWRhdGVBbGwoZGF0YSwgc3ViU2NoZW1hLCBbXSwgW1wiYW55T2ZcIiwgaV0sIGRhdGFQb2ludGVyUGF0aCk7XG5cblx0XHRpZiAoZXJyb3IgPT09IG51bGwgJiYgZXJyb3JDb3VudCA9PT0gdGhpcy5lcnJvcnMubGVuZ3RoKSB7XG5cdFx0XHR0aGlzLmVycm9ycyA9IHRoaXMuZXJyb3JzLnNsaWNlKDAsIHN0YXJ0RXJyb3JDb3VudCk7XG5cblx0XHRcdGlmICh0aGlzLnRyYWNrVW5rbm93blByb3BlcnRpZXMpIHtcblx0XHRcdFx0Zm9yICh2YXIga25vd25LZXkgaW4gdGhpcy5rbm93blByb3BlcnR5UGF0aHMpIHtcblx0XHRcdFx0XHRvbGRLbm93blByb3BlcnR5UGF0aHNba25vd25LZXldID0gdHJ1ZTtcblx0XHRcdFx0XHRkZWxldGUgb2xkVW5rbm93blByb3BlcnR5UGF0aHNba25vd25LZXldO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGZvciAodmFyIHVua25vd25LZXkgaW4gdGhpcy51bmtub3duUHJvcGVydHlQYXRocykge1xuXHRcdFx0XHRcdGlmICghb2xkS25vd25Qcm9wZXJ0eVBhdGhzW3Vua25vd25LZXldKSB7XG5cdFx0XHRcdFx0XHRvbGRVbmtub3duUHJvcGVydHlQYXRoc1t1bmtub3duS2V5XSA9IHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIFdlIG5lZWQgdG8gY29udGludWUgbG9vcGluZyBzbyB3ZSBjYXRjaCBhbGwgdGhlIHByb3BlcnR5IGRlZmluaXRpb25zLCBidXQgd2UgZG9uJ3Qgd2FudCB0byByZXR1cm4gYW4gZXJyb3Jcblx0XHRcdFx0ZXJyb3JBdEVuZCA9IGZhbHNlO1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHRcdGlmIChlcnJvcikge1xuXHRcdFx0ZXJyb3JzLnB1c2goZXJyb3IucHJlZml4V2l0aChudWxsLCBcIlwiICsgaSkucHJlZml4V2l0aChudWxsLCBcImFueU9mXCIpKTtcblx0XHR9XG5cdH1cblx0aWYgKHRoaXMudHJhY2tVbmtub3duUHJvcGVydGllcykge1xuXHRcdHRoaXMudW5rbm93blByb3BlcnR5UGF0aHMgPSBvbGRVbmtub3duUHJvcGVydHlQYXRocztcblx0XHR0aGlzLmtub3duUHJvcGVydHlQYXRocyA9IG9sZEtub3duUHJvcGVydHlQYXRocztcblx0fVxuXHRpZiAoZXJyb3JBdEVuZCkge1xuXHRcdGVycm9ycyA9IGVycm9ycy5jb25jYXQodGhpcy5lcnJvcnMuc2xpY2Uoc3RhcnRFcnJvckNvdW50KSk7XG5cdFx0dGhpcy5lcnJvcnMgPSB0aGlzLmVycm9ycy5zbGljZSgwLCBzdGFydEVycm9yQ291bnQpO1xuXHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuQU5ZX09GX01JU1NJTkcsIHt9LCBcIlwiLCBcIi9hbnlPZlwiLCBlcnJvcnMpO1xuXHR9XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZU9uZU9mID0gZnVuY3Rpb24gdmFsaWRhdGVPbmVPZihkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aCkge1xuXHRpZiAoc2NoZW1hLm9uZU9mID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHR2YXIgdmFsaWRJbmRleCA9IG51bGw7XG5cdHZhciBlcnJvcnMgPSBbXTtcblx0dmFyIHN0YXJ0RXJyb3JDb3VudCA9IHRoaXMuZXJyb3JzLmxlbmd0aDtcblx0dmFyIG9sZFVua25vd25Qcm9wZXJ0eVBhdGhzLCBvbGRLbm93blByb3BlcnR5UGF0aHM7XG5cdGlmICh0aGlzLnRyYWNrVW5rbm93blByb3BlcnRpZXMpIHtcblx0XHRvbGRVbmtub3duUHJvcGVydHlQYXRocyA9IHRoaXMudW5rbm93blByb3BlcnR5UGF0aHM7XG5cdFx0b2xkS25vd25Qcm9wZXJ0eVBhdGhzID0gdGhpcy5rbm93blByb3BlcnR5UGF0aHM7XG5cdH1cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzY2hlbWEub25lT2YubGVuZ3RoOyBpKyspIHtcblx0XHRpZiAodGhpcy50cmFja1Vua25vd25Qcm9wZXJ0aWVzKSB7XG5cdFx0XHR0aGlzLnVua25vd25Qcm9wZXJ0eVBhdGhzID0ge307XG5cdFx0XHR0aGlzLmtub3duUHJvcGVydHlQYXRocyA9IHt9O1xuXHRcdH1cblx0XHR2YXIgc3ViU2NoZW1hID0gc2NoZW1hLm9uZU9mW2ldO1xuXG5cdFx0dmFyIGVycm9yQ291bnQgPSB0aGlzLmVycm9ycy5sZW5ndGg7XG5cdFx0dmFyIGVycm9yID0gdGhpcy52YWxpZGF0ZUFsbChkYXRhLCBzdWJTY2hlbWEsIFtdLCBbXCJvbmVPZlwiLCBpXSwgZGF0YVBvaW50ZXJQYXRoKTtcblxuXHRcdGlmIChlcnJvciA9PT0gbnVsbCAmJiBlcnJvckNvdW50ID09PSB0aGlzLmVycm9ycy5sZW5ndGgpIHtcblx0XHRcdGlmICh2YWxpZEluZGV4ID09PSBudWxsKSB7XG5cdFx0XHRcdHZhbGlkSW5kZXggPSBpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5lcnJvcnMgPSB0aGlzLmVycm9ycy5zbGljZSgwLCBzdGFydEVycm9yQ291bnQpO1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLk9ORV9PRl9NVUxUSVBMRSwge2luZGV4MTogdmFsaWRJbmRleCwgaW5kZXgyOiBpfSwgXCJcIiwgXCIvb25lT2ZcIik7XG5cdFx0XHR9XG5cdFx0XHRpZiAodGhpcy50cmFja1Vua25vd25Qcm9wZXJ0aWVzKSB7XG5cdFx0XHRcdGZvciAodmFyIGtub3duS2V5IGluIHRoaXMua25vd25Qcm9wZXJ0eVBhdGhzKSB7XG5cdFx0XHRcdFx0b2xkS25vd25Qcm9wZXJ0eVBhdGhzW2tub3duS2V5XSA9IHRydWU7XG5cdFx0XHRcdFx0ZGVsZXRlIG9sZFVua25vd25Qcm9wZXJ0eVBhdGhzW2tub3duS2V5XTtcblx0XHRcdFx0fVxuXHRcdFx0XHRmb3IgKHZhciB1bmtub3duS2V5IGluIHRoaXMudW5rbm93blByb3BlcnR5UGF0aHMpIHtcblx0XHRcdFx0XHRpZiAoIW9sZEtub3duUHJvcGVydHlQYXRoc1t1bmtub3duS2V5XSkge1xuXHRcdFx0XHRcdFx0b2xkVW5rbm93blByb3BlcnR5UGF0aHNbdW5rbm93bktleV0gPSB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoZXJyb3IpIHtcblx0XHRcdGVycm9ycy5wdXNoKGVycm9yKTtcblx0XHR9XG5cdH1cblx0aWYgKHRoaXMudHJhY2tVbmtub3duUHJvcGVydGllcykge1xuXHRcdHRoaXMudW5rbm93blByb3BlcnR5UGF0aHMgPSBvbGRVbmtub3duUHJvcGVydHlQYXRocztcblx0XHR0aGlzLmtub3duUHJvcGVydHlQYXRocyA9IG9sZEtub3duUHJvcGVydHlQYXRocztcblx0fVxuXHRpZiAodmFsaWRJbmRleCA9PT0gbnVsbCkge1xuXHRcdGVycm9ycyA9IGVycm9ycy5jb25jYXQodGhpcy5lcnJvcnMuc2xpY2Uoc3RhcnRFcnJvckNvdW50KSk7XG5cdFx0dGhpcy5lcnJvcnMgPSB0aGlzLmVycm9ycy5zbGljZSgwLCBzdGFydEVycm9yQ291bnQpO1xuXHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuT05FX09GX01JU1NJTkcsIHt9LCBcIlwiLCBcIi9vbmVPZlwiLCBlcnJvcnMpO1xuXHR9IGVsc2Uge1xuXHRcdHRoaXMuZXJyb3JzID0gdGhpcy5lcnJvcnMuc2xpY2UoMCwgc3RhcnRFcnJvckNvdW50KTtcblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlTm90ID0gZnVuY3Rpb24gdmFsaWRhdGVOb3QoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpIHtcblx0aWYgKHNjaGVtYS5ub3QgPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdHZhciBvbGRFcnJvckNvdW50ID0gdGhpcy5lcnJvcnMubGVuZ3RoO1xuXHR2YXIgb2xkVW5rbm93blByb3BlcnR5UGF0aHMsIG9sZEtub3duUHJvcGVydHlQYXRocztcblx0aWYgKHRoaXMudHJhY2tVbmtub3duUHJvcGVydGllcykge1xuXHRcdG9sZFVua25vd25Qcm9wZXJ0eVBhdGhzID0gdGhpcy51bmtub3duUHJvcGVydHlQYXRocztcblx0XHRvbGRLbm93blByb3BlcnR5UGF0aHMgPSB0aGlzLmtub3duUHJvcGVydHlQYXRocztcblx0XHR0aGlzLnVua25vd25Qcm9wZXJ0eVBhdGhzID0ge307XG5cdFx0dGhpcy5rbm93blByb3BlcnR5UGF0aHMgPSB7fTtcblx0fVxuXHR2YXIgZXJyb3IgPSB0aGlzLnZhbGlkYXRlQWxsKGRhdGEsIHNjaGVtYS5ub3QsIG51bGwsIG51bGwsIGRhdGFQb2ludGVyUGF0aCk7XG5cdHZhciBub3RFcnJvcnMgPSB0aGlzLmVycm9ycy5zbGljZShvbGRFcnJvckNvdW50KTtcblx0dGhpcy5lcnJvcnMgPSB0aGlzLmVycm9ycy5zbGljZSgwLCBvbGRFcnJvckNvdW50KTtcblx0aWYgKHRoaXMudHJhY2tVbmtub3duUHJvcGVydGllcykge1xuXHRcdHRoaXMudW5rbm93blByb3BlcnR5UGF0aHMgPSBvbGRVbmtub3duUHJvcGVydHlQYXRocztcblx0XHR0aGlzLmtub3duUHJvcGVydHlQYXRocyA9IG9sZEtub3duUHJvcGVydHlQYXRocztcblx0fVxuXHRpZiAoZXJyb3IgPT09IG51bGwgJiYgbm90RXJyb3JzLmxlbmd0aCA9PT0gMCkge1xuXHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuTk9UX1BBU1NFRCwge30sIFwiXCIsIFwiL25vdFwiKTtcblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlSHlwZXJtZWRpYSA9IGZ1bmN0aW9uIHZhbGlkYXRlQ29tYmluYXRpb25zKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKSB7XG5cdGlmICghc2NoZW1hLmxpbmtzKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0dmFyIGVycm9yO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHNjaGVtYS5saW5rcy5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBsZG8gPSBzY2hlbWEubGlua3NbaV07XG5cdFx0aWYgKGxkby5yZWwgPT09IFwiZGVzY3JpYmVkYnlcIikge1xuXHRcdFx0dmFyIHRlbXBsYXRlID0gbmV3IFVyaVRlbXBsYXRlKGxkby5ocmVmKTtcblx0XHRcdHZhciBhbGxQcmVzZW50ID0gdHJ1ZTtcblx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgdGVtcGxhdGUudmFyTmFtZXMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0aWYgKCEodGVtcGxhdGUudmFyTmFtZXNbal0gaW4gZGF0YSkpIHtcblx0XHRcdFx0XHRhbGxQcmVzZW50ID0gZmFsc2U7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmIChhbGxQcmVzZW50KSB7XG5cdFx0XHRcdHZhciBzY2hlbWFVcmwgPSB0ZW1wbGF0ZS5maWxsRnJvbU9iamVjdChkYXRhKTtcblx0XHRcdFx0dmFyIHN1YlNjaGVtYSA9IHtcIiRyZWZcIjogc2NoZW1hVXJsfTtcblx0XHRcdFx0aWYgKGVycm9yID0gdGhpcy52YWxpZGF0ZUFsbChkYXRhLCBzdWJTY2hlbWEsIFtdLCBbXCJsaW5rc1wiLCBpXSwgZGF0YVBvaW50ZXJQYXRoKSkge1xuXHRcdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxufTtcblxuLy8gcGFyc2VVUkkoKSBhbmQgcmVzb2x2ZVVybCgpIGFyZSBmcm9tIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tLzEwODg4NTBcbi8vICAgLSAgcmVsZWFzZWQgYXMgcHVibGljIGRvbWFpbiBieSBhdXRob3IgKFwiWWFmZmxlXCIpIC0gc2VlIGNvbW1lbnRzIG9uIGdpc3RcblxuZnVuY3Rpb24gcGFyc2VVUkkodXJsKSB7XG5cdHZhciBtID0gU3RyaW5nKHVybCkucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpLm1hdGNoKC9eKFteOlxcLz8jXSs6KT8oXFwvXFwvKD86W146QF0qKD86OlteOkBdKik/QCk/KChbXjpcXC8/I10qKSg/OjooXFxkKikpPykpPyhbXj8jXSopKFxcP1teI10qKT8oI1tcXHNcXFNdKik/Lyk7XG5cdC8vIGF1dGhvcml0eSA9ICcvLycgKyB1c2VyICsgJzonICsgcGFzcyAnQCcgKyBob3N0bmFtZSArICc6JyBwb3J0XG5cdHJldHVybiAobSA/IHtcblx0XHRocmVmICAgICA6IG1bMF0gfHwgJycsXG5cdFx0cHJvdG9jb2wgOiBtWzFdIHx8ICcnLFxuXHRcdGF1dGhvcml0eTogbVsyXSB8fCAnJyxcblx0XHRob3N0ICAgICA6IG1bM10gfHwgJycsXG5cdFx0aG9zdG5hbWUgOiBtWzRdIHx8ICcnLFxuXHRcdHBvcnQgICAgIDogbVs1XSB8fCAnJyxcblx0XHRwYXRobmFtZSA6IG1bNl0gfHwgJycsXG5cdFx0c2VhcmNoICAgOiBtWzddIHx8ICcnLFxuXHRcdGhhc2ggICAgIDogbVs4XSB8fCAnJ1xuXHR9IDogbnVsbCk7XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVVcmwoYmFzZSwgaHJlZikgey8vIFJGQyAzOTg2XG5cblx0ZnVuY3Rpb24gcmVtb3ZlRG90U2VnbWVudHMoaW5wdXQpIHtcblx0XHR2YXIgb3V0cHV0ID0gW107XG5cdFx0aW5wdXQucmVwbGFjZSgvXihcXC5cXC4/KFxcL3wkKSkrLywgJycpXG5cdFx0XHQucmVwbGFjZSgvXFwvKFxcLihcXC98JCkpKy9nLCAnLycpXG5cdFx0XHQucmVwbGFjZSgvXFwvXFwuXFwuJC8sICcvLi4vJylcblx0XHRcdC5yZXBsYWNlKC9cXC8/W15cXC9dKi9nLCBmdW5jdGlvbiAocCkge1xuXHRcdFx0XHRpZiAocCA9PT0gJy8uLicpIHtcblx0XHRcdFx0XHRvdXRwdXQucG9wKCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0b3V0cHV0LnB1c2gocCk7XG5cdFx0XHRcdH1cblx0XHR9KTtcblx0XHRyZXR1cm4gb3V0cHV0LmpvaW4oJycpLnJlcGxhY2UoL15cXC8vLCBpbnB1dC5jaGFyQXQoMCkgPT09ICcvJyA/ICcvJyA6ICcnKTtcblx0fVxuXG5cdGhyZWYgPSBwYXJzZVVSSShocmVmIHx8ICcnKTtcblx0YmFzZSA9IHBhcnNlVVJJKGJhc2UgfHwgJycpO1xuXG5cdHJldHVybiAhaHJlZiB8fCAhYmFzZSA/IG51bGwgOiAoaHJlZi5wcm90b2NvbCB8fCBiYXNlLnByb3RvY29sKSArXG5cdFx0KGhyZWYucHJvdG9jb2wgfHwgaHJlZi5hdXRob3JpdHkgPyBocmVmLmF1dGhvcml0eSA6IGJhc2UuYXV0aG9yaXR5KSArXG5cdFx0cmVtb3ZlRG90U2VnbWVudHMoaHJlZi5wcm90b2NvbCB8fCBocmVmLmF1dGhvcml0eSB8fCBocmVmLnBhdGhuYW1lLmNoYXJBdCgwKSA9PT0gJy8nID8gaHJlZi5wYXRobmFtZSA6IChocmVmLnBhdGhuYW1lID8gKChiYXNlLmF1dGhvcml0eSAmJiAhYmFzZS5wYXRobmFtZSA/ICcvJyA6ICcnKSArIGJhc2UucGF0aG5hbWUuc2xpY2UoMCwgYmFzZS5wYXRobmFtZS5sYXN0SW5kZXhPZignLycpICsgMSkgKyBocmVmLnBhdGhuYW1lKSA6IGJhc2UucGF0aG5hbWUpKSArXG5cdFx0KGhyZWYucHJvdG9jb2wgfHwgaHJlZi5hdXRob3JpdHkgfHwgaHJlZi5wYXRobmFtZSA/IGhyZWYuc2VhcmNoIDogKGhyZWYuc2VhcmNoIHx8IGJhc2Uuc2VhcmNoKSkgK1xuXHRcdGhyZWYuaGFzaDtcbn1cblxuZnVuY3Rpb24gZ2V0RG9jdW1lbnRVcmkodXJpKSB7XG5cdHJldHVybiB1cmkuc3BsaXQoJyMnKVswXTtcbn1cbmZ1bmN0aW9uIG5vcm1TY2hlbWEoc2NoZW1hLCBiYXNlVXJpKSB7XG5cdGlmIChzY2hlbWEgJiYgdHlwZW9mIHNjaGVtYSA9PT0gXCJvYmplY3RcIikge1xuXHRcdGlmIChiYXNlVXJpID09PSB1bmRlZmluZWQpIHtcblx0XHRcdGJhc2VVcmkgPSBzY2hlbWEuaWQ7XG5cdFx0fSBlbHNlIGlmICh0eXBlb2Ygc2NoZW1hLmlkID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRiYXNlVXJpID0gcmVzb2x2ZVVybChiYXNlVXJpLCBzY2hlbWEuaWQpO1xuXHRcdFx0c2NoZW1hLmlkID0gYmFzZVVyaTtcblx0XHR9XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkoc2NoZW1hKSkge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzY2hlbWEubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0bm9ybVNjaGVtYShzY2hlbWFbaV0sIGJhc2VVcmkpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAodHlwZW9mIHNjaGVtYVsnJHJlZiddID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdHNjaGVtYVsnJHJlZiddID0gcmVzb2x2ZVVybChiYXNlVXJpLCBzY2hlbWFbJyRyZWYnXSk7XG5cdFx0XHR9XG5cdFx0XHRmb3IgKHZhciBrZXkgaW4gc2NoZW1hKSB7XG5cdFx0XHRcdGlmIChrZXkgIT09IFwiZW51bVwiKSB7XG5cdFx0XHRcdFx0bm9ybVNjaGVtYShzY2hlbWFba2V5XSwgYmFzZVVyaSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cblxudmFyIEVycm9yQ29kZXMgPSB7XG5cdElOVkFMSURfVFlQRTogMCxcblx0RU5VTV9NSVNNQVRDSDogMSxcblx0QU5ZX09GX01JU1NJTkc6IDEwLFxuXHRPTkVfT0ZfTUlTU0lORzogMTEsXG5cdE9ORV9PRl9NVUxUSVBMRTogMTIsXG5cdE5PVF9QQVNTRUQ6IDEzLFxuXHQvLyBOdW1lcmljIGVycm9yc1xuXHROVU1CRVJfTVVMVElQTEVfT0Y6IDEwMCxcblx0TlVNQkVSX01JTklNVU06IDEwMSxcblx0TlVNQkVSX01JTklNVU1fRVhDTFVTSVZFOiAxMDIsXG5cdE5VTUJFUl9NQVhJTVVNOiAxMDMsXG5cdE5VTUJFUl9NQVhJTVVNX0VYQ0xVU0lWRTogMTA0LFxuXHROVU1CRVJfTk9UX0FfTlVNQkVSOiAxMDUsXG5cdC8vIFN0cmluZyBlcnJvcnNcblx0U1RSSU5HX0xFTkdUSF9TSE9SVDogMjAwLFxuXHRTVFJJTkdfTEVOR1RIX0xPTkc6IDIwMSxcblx0U1RSSU5HX1BBVFRFUk46IDIwMixcblx0Ly8gT2JqZWN0IGVycm9yc1xuXHRPQkpFQ1RfUFJPUEVSVElFU19NSU5JTVVNOiAzMDAsXG5cdE9CSkVDVF9QUk9QRVJUSUVTX01BWElNVU06IDMwMSxcblx0T0JKRUNUX1JFUVVJUkVEOiAzMDIsXG5cdE9CSkVDVF9BRERJVElPTkFMX1BST1BFUlRJRVM6IDMwMyxcblx0T0JKRUNUX0RFUEVOREVOQ1lfS0VZOiAzMDQsXG5cdC8vIEFycmF5IGVycm9yc1xuXHRBUlJBWV9MRU5HVEhfU0hPUlQ6IDQwMCxcblx0QVJSQVlfTEVOR1RIX0xPTkc6IDQwMSxcblx0QVJSQVlfVU5JUVVFOiA0MDIsXG5cdEFSUkFZX0FERElUSU9OQUxfSVRFTVM6IDQwMyxcblx0Ly8gQ3VzdG9tL3VzZXItZGVmaW5lZCBlcnJvcnNcblx0Rk9STUFUX0NVU1RPTTogNTAwLFxuXHRLRVlXT1JEX0NVU1RPTTogNTAxLFxuXHQvLyBTY2hlbWEgc3RydWN0dXJlXG5cdENJUkNVTEFSX1JFRkVSRU5DRTogNjAwLFxuXHQvLyBOb24tc3RhbmRhcmQgdmFsaWRhdGlvbiBvcHRpb25zXG5cdFVOS05PV05fUFJPUEVSVFk6IDEwMDBcbn07XG52YXIgRXJyb3JDb2RlTG9va3VwID0ge307XG5mb3IgKHZhciBrZXkgaW4gRXJyb3JDb2Rlcykge1xuXHRFcnJvckNvZGVMb29rdXBbRXJyb3JDb2Rlc1trZXldXSA9IGtleTtcbn1cbnZhciBFcnJvck1lc3NhZ2VzRGVmYXVsdCA9IHtcblx0SU5WQUxJRF9UWVBFOiBcIkludmFsaWQgdHlwZToge3R5cGV9IChleHBlY3RlZCB7ZXhwZWN0ZWR9KVwiLFxuXHRFTlVNX01JU01BVENIOiBcIk5vIGVudW0gbWF0Y2ggZm9yOiB7dmFsdWV9XCIsXG5cdEFOWV9PRl9NSVNTSU5HOiBcIkRhdGEgZG9lcyBub3QgbWF0Y2ggYW55IHNjaGVtYXMgZnJvbSBcXFwiYW55T2ZcXFwiXCIsXG5cdE9ORV9PRl9NSVNTSU5HOiBcIkRhdGEgZG9lcyBub3QgbWF0Y2ggYW55IHNjaGVtYXMgZnJvbSBcXFwib25lT2ZcXFwiXCIsXG5cdE9ORV9PRl9NVUxUSVBMRTogXCJEYXRhIGlzIHZhbGlkIGFnYWluc3QgbW9yZSB0aGFuIG9uZSBzY2hlbWEgZnJvbSBcXFwib25lT2ZcXFwiOiBpbmRpY2VzIHtpbmRleDF9IGFuZCB7aW5kZXgyfVwiLFxuXHROT1RfUEFTU0VEOiBcIkRhdGEgbWF0Y2hlcyBzY2hlbWEgZnJvbSBcXFwibm90XFxcIlwiLFxuXHQvLyBOdW1lcmljIGVycm9yc1xuXHROVU1CRVJfTVVMVElQTEVfT0Y6IFwiVmFsdWUge3ZhbHVlfSBpcyBub3QgYSBtdWx0aXBsZSBvZiB7bXVsdGlwbGVPZn1cIixcblx0TlVNQkVSX01JTklNVU06IFwiVmFsdWUge3ZhbHVlfSBpcyBsZXNzIHRoYW4gbWluaW11bSB7bWluaW11bX1cIixcblx0TlVNQkVSX01JTklNVU1fRVhDTFVTSVZFOiBcIlZhbHVlIHt2YWx1ZX0gaXMgZXF1YWwgdG8gZXhjbHVzaXZlIG1pbmltdW0ge21pbmltdW19XCIsXG5cdE5VTUJFUl9NQVhJTVVNOiBcIlZhbHVlIHt2YWx1ZX0gaXMgZ3JlYXRlciB0aGFuIG1heGltdW0ge21heGltdW19XCIsXG5cdE5VTUJFUl9NQVhJTVVNX0VYQ0xVU0lWRTogXCJWYWx1ZSB7dmFsdWV9IGlzIGVxdWFsIHRvIGV4Y2x1c2l2ZSBtYXhpbXVtIHttYXhpbXVtfVwiLFxuXHROVU1CRVJfTk9UX0FfTlVNQkVSOiBcIlZhbHVlIHt2YWx1ZX0gaXMgbm90IGEgdmFsaWQgbnVtYmVyXCIsXG5cdC8vIFN0cmluZyBlcnJvcnNcblx0U1RSSU5HX0xFTkdUSF9TSE9SVDogXCJTdHJpbmcgaXMgdG9vIHNob3J0ICh7bGVuZ3RofSBjaGFycyksIG1pbmltdW0ge21pbmltdW19XCIsXG5cdFNUUklOR19MRU5HVEhfTE9ORzogXCJTdHJpbmcgaXMgdG9vIGxvbmcgKHtsZW5ndGh9IGNoYXJzKSwgbWF4aW11bSB7bWF4aW11bX1cIixcblx0U1RSSU5HX1BBVFRFUk46IFwiU3RyaW5nIGRvZXMgbm90IG1hdGNoIHBhdHRlcm46IHtwYXR0ZXJufVwiLFxuXHQvLyBPYmplY3QgZXJyb3JzXG5cdE9CSkVDVF9QUk9QRVJUSUVTX01JTklNVU06IFwiVG9vIGZldyBwcm9wZXJ0aWVzIGRlZmluZWQgKHtwcm9wZXJ0eUNvdW50fSksIG1pbmltdW0ge21pbmltdW19XCIsXG5cdE9CSkVDVF9QUk9QRVJUSUVTX01BWElNVU06IFwiVG9vIG1hbnkgcHJvcGVydGllcyBkZWZpbmVkICh7cHJvcGVydHlDb3VudH0pLCBtYXhpbXVtIHttYXhpbXVtfVwiLFxuXHRPQkpFQ1RfUkVRVUlSRUQ6IFwiTWlzc2luZyByZXF1aXJlZCBwcm9wZXJ0eToge2tleX1cIixcblx0T0JKRUNUX0FERElUSU9OQUxfUFJPUEVSVElFUzogXCJBZGRpdGlvbmFsIHByb3BlcnRpZXMgbm90IGFsbG93ZWRcIixcblx0T0JKRUNUX0RFUEVOREVOQ1lfS0VZOiBcIkRlcGVuZGVuY3kgZmFpbGVkIC0ga2V5IG11c3QgZXhpc3Q6IHttaXNzaW5nfSAoZHVlIHRvIGtleToge2tleX0pXCIsXG5cdC8vIEFycmF5IGVycm9yc1xuXHRBUlJBWV9MRU5HVEhfU0hPUlQ6IFwiQXJyYXkgaXMgdG9vIHNob3J0ICh7bGVuZ3RofSksIG1pbmltdW0ge21pbmltdW19XCIsXG5cdEFSUkFZX0xFTkdUSF9MT05HOiBcIkFycmF5IGlzIHRvbyBsb25nICh7bGVuZ3RofSksIG1heGltdW0ge21heGltdW19XCIsXG5cdEFSUkFZX1VOSVFVRTogXCJBcnJheSBpdGVtcyBhcmUgbm90IHVuaXF1ZSAoaW5kaWNlcyB7bWF0Y2gxfSBhbmQge21hdGNoMn0pXCIsXG5cdEFSUkFZX0FERElUSU9OQUxfSVRFTVM6IFwiQWRkaXRpb25hbCBpdGVtcyBub3QgYWxsb3dlZFwiLFxuXHQvLyBGb3JtYXQgZXJyb3JzXG5cdEZPUk1BVF9DVVNUT006IFwiRm9ybWF0IHZhbGlkYXRpb24gZmFpbGVkICh7bWVzc2FnZX0pXCIsXG5cdEtFWVdPUkRfQ1VTVE9NOiBcIktleXdvcmQgZmFpbGVkOiB7a2V5fSAoe21lc3NhZ2V9KVwiLFxuXHQvLyBTY2hlbWEgc3RydWN0dXJlXG5cdENJUkNVTEFSX1JFRkVSRU5DRTogXCJDaXJjdWxhciAkcmVmczoge3VybHN9XCIsXG5cdC8vIE5vbi1zdGFuZGFyZCB2YWxpZGF0aW9uIG9wdGlvbnNcblx0VU5LTk9XTl9QUk9QRVJUWTogXCJVbmtub3duIHByb3BlcnR5IChub3QgaW4gc2NoZW1hKVwiXG59O1xuXG5mdW5jdGlvbiBWYWxpZGF0aW9uRXJyb3IoY29kZSwgbWVzc2FnZSwgcGFyYW1zLCBkYXRhUGF0aCwgc2NoZW1hUGF0aCwgc3ViRXJyb3JzKSB7XG5cdEVycm9yLmNhbGwodGhpcyk7XG5cdGlmIChjb2RlID09PSB1bmRlZmluZWQpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IgKFwiTm8gY29kZSBzdXBwbGllZCBmb3IgZXJyb3I6IFwiKyBtZXNzYWdlKTtcblx0fVxuXHR0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuXHR0aGlzLnBhcmFtcyA9IHBhcmFtcztcblx0dGhpcy5jb2RlID0gY29kZTtcblx0dGhpcy5kYXRhUGF0aCA9IGRhdGFQYXRoIHx8IFwiXCI7XG5cdHRoaXMuc2NoZW1hUGF0aCA9IHNjaGVtYVBhdGggfHwgXCJcIjtcblx0dGhpcy5zdWJFcnJvcnMgPSBzdWJFcnJvcnMgfHwgbnVsbDtcblxuXHR2YXIgZXJyID0gbmV3IEVycm9yKHRoaXMubWVzc2FnZSk7XG5cdHRoaXMuc3RhY2sgPSBlcnIuc3RhY2sgfHwgZXJyLnN0YWNrdHJhY2U7XG5cdGlmICghdGhpcy5zdGFjaykge1xuXHRcdHRyeSB7XG5cdFx0XHR0aHJvdyBlcnI7XG5cdFx0fVxuXHRcdGNhdGNoKGVycikge1xuXHRcdFx0dGhpcy5zdGFjayA9IGVyci5zdGFjayB8fCBlcnIuc3RhY2t0cmFjZTtcblx0XHR9XG5cdH1cbn1cblZhbGlkYXRpb25FcnJvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVycm9yLnByb3RvdHlwZSk7XG5WYWxpZGF0aW9uRXJyb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVmFsaWRhdGlvbkVycm9yO1xuVmFsaWRhdGlvbkVycm9yLnByb3RvdHlwZS5uYW1lID0gJ1ZhbGlkYXRpb25FcnJvcic7XG5cblZhbGlkYXRpb25FcnJvci5wcm90b3R5cGUucHJlZml4V2l0aCA9IGZ1bmN0aW9uIChkYXRhUHJlZml4LCBzY2hlbWFQcmVmaXgpIHtcblx0aWYgKGRhdGFQcmVmaXggIT09IG51bGwpIHtcblx0XHRkYXRhUHJlZml4ID0gZGF0YVByZWZpeC5yZXBsYWNlKC9+L2csIFwifjBcIikucmVwbGFjZSgvXFwvL2csIFwifjFcIik7XG5cdFx0dGhpcy5kYXRhUGF0aCA9IFwiL1wiICsgZGF0YVByZWZpeCArIHRoaXMuZGF0YVBhdGg7XG5cdH1cblx0aWYgKHNjaGVtYVByZWZpeCAhPT0gbnVsbCkge1xuXHRcdHNjaGVtYVByZWZpeCA9IHNjaGVtYVByZWZpeC5yZXBsYWNlKC9+L2csIFwifjBcIikucmVwbGFjZSgvXFwvL2csIFwifjFcIik7XG5cdFx0dGhpcy5zY2hlbWFQYXRoID0gXCIvXCIgKyBzY2hlbWFQcmVmaXggKyB0aGlzLnNjaGVtYVBhdGg7XG5cdH1cblx0aWYgKHRoaXMuc3ViRXJyb3JzICE9PSBudWxsKSB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnN1YkVycm9ycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dGhpcy5zdWJFcnJvcnNbaV0ucHJlZml4V2l0aChkYXRhUHJlZml4LCBzY2hlbWFQcmVmaXgpO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gdGhpcztcbn07XG5cbmZ1bmN0aW9uIGlzVHJ1c3RlZFVybChiYXNlVXJsLCB0ZXN0VXJsKSB7XG5cdGlmKHRlc3RVcmwuc3Vic3RyaW5nKDAsIGJhc2VVcmwubGVuZ3RoKSA9PT0gYmFzZVVybCl7XG5cdFx0dmFyIHJlbWFpbmRlciA9IHRlc3RVcmwuc3Vic3RyaW5nKGJhc2VVcmwubGVuZ3RoKTtcblx0XHRpZiAoKHRlc3RVcmwubGVuZ3RoID4gMCAmJiB0ZXN0VXJsLmNoYXJBdChiYXNlVXJsLmxlbmd0aCAtIDEpID09PSBcIi9cIilcblx0XHRcdHx8IHJlbWFpbmRlci5jaGFyQXQoMCkgPT09IFwiI1wiXG5cdFx0XHR8fCByZW1haW5kZXIuY2hhckF0KDApID09PSBcIj9cIikge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBmYWxzZTtcbn1cblxudmFyIGxhbmd1YWdlcyA9IHt9O1xuZnVuY3Rpb24gY3JlYXRlQXBpKGxhbmd1YWdlKSB7XG5cdHZhciBnbG9iYWxDb250ZXh0ID0gbmV3IFZhbGlkYXRvckNvbnRleHQoKTtcblx0dmFyIGN1cnJlbnRMYW5ndWFnZSA9IGxhbmd1YWdlIHx8ICdlbic7XG5cdHZhciBhcGkgPSB7XG5cdFx0YWRkRm9ybWF0OiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRnbG9iYWxDb250ZXh0LmFkZEZvcm1hdC5hcHBseShnbG9iYWxDb250ZXh0LCBhcmd1bWVudHMpO1xuXHRcdH0sXG5cdFx0bGFuZ3VhZ2U6IGZ1bmN0aW9uIChjb2RlKSB7XG5cdFx0XHRpZiAoIWNvZGUpIHtcblx0XHRcdFx0cmV0dXJuIGN1cnJlbnRMYW5ndWFnZTtcblx0XHRcdH1cblx0XHRcdGlmICghbGFuZ3VhZ2VzW2NvZGVdKSB7XG5cdFx0XHRcdGNvZGUgPSBjb2RlLnNwbGl0KCctJylbMF07IC8vIGZhbGwgYmFjayB0byBiYXNlIGxhbmd1YWdlXG5cdFx0XHR9XG5cdFx0XHRpZiAobGFuZ3VhZ2VzW2NvZGVdKSB7XG5cdFx0XHRcdGN1cnJlbnRMYW5ndWFnZSA9IGNvZGU7XG5cdFx0XHRcdHJldHVybiBjb2RlOyAvLyBzbyB5b3UgY2FuIHRlbGwgaWYgZmFsbC1iYWNrIGhhcyBoYXBwZW5lZFxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0sXG5cdFx0YWRkTGFuZ3VhZ2U6IGZ1bmN0aW9uIChjb2RlLCBtZXNzYWdlTWFwKSB7XG5cdFx0XHR2YXIga2V5O1xuXHRcdFx0Zm9yIChrZXkgaW4gRXJyb3JDb2Rlcykge1xuXHRcdFx0XHRpZiAobWVzc2FnZU1hcFtrZXldICYmICFtZXNzYWdlTWFwW0Vycm9yQ29kZXNba2V5XV0pIHtcblx0XHRcdFx0XHRtZXNzYWdlTWFwW0Vycm9yQ29kZXNba2V5XV0gPSBtZXNzYWdlTWFwW2tleV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHZhciByb290Q29kZSA9IGNvZGUuc3BsaXQoJy0nKVswXTtcblx0XHRcdGlmICghbGFuZ3VhZ2VzW3Jvb3RDb2RlXSkgeyAvLyB1c2UgZm9yIGJhc2UgbGFuZ3VhZ2UgaWYgbm90IHlldCBkZWZpbmVkXG5cdFx0XHRcdGxhbmd1YWdlc1tjb2RlXSA9IG1lc3NhZ2VNYXA7XG5cdFx0XHRcdGxhbmd1YWdlc1tyb290Q29kZV0gPSBtZXNzYWdlTWFwO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0bGFuZ3VhZ2VzW2NvZGVdID0gT2JqZWN0LmNyZWF0ZShsYW5ndWFnZXNbcm9vdENvZGVdKTtcblx0XHRcdFx0Zm9yIChrZXkgaW4gbWVzc2FnZU1hcCkge1xuXHRcdFx0XHRcdGlmICh0eXBlb2YgbGFuZ3VhZ2VzW3Jvb3RDb2RlXVtrZXldID09PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHRcdFx0bGFuZ3VhZ2VzW3Jvb3RDb2RlXVtrZXldID0gbWVzc2FnZU1hcFtrZXldO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRsYW5ndWFnZXNbY29kZV1ba2V5XSA9IG1lc3NhZ2VNYXBba2V5XTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fSxcblx0XHRmcmVzaEFwaTogZnVuY3Rpb24gKGxhbmd1YWdlKSB7XG5cdFx0XHR2YXIgcmVzdWx0ID0gY3JlYXRlQXBpKCk7XG5cdFx0XHRpZiAobGFuZ3VhZ2UpIHtcblx0XHRcdFx0cmVzdWx0Lmxhbmd1YWdlKGxhbmd1YWdlKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fSxcblx0XHR2YWxpZGF0ZTogZnVuY3Rpb24gKGRhdGEsIHNjaGVtYSwgY2hlY2tSZWN1cnNpdmUsIGJhblVua25vd25Qcm9wZXJ0aWVzKSB7XG5cdFx0XHR2YXIgY29udGV4dCA9IG5ldyBWYWxpZGF0b3JDb250ZXh0KGdsb2JhbENvbnRleHQsIGZhbHNlLCBsYW5ndWFnZXNbY3VycmVudExhbmd1YWdlXSwgY2hlY2tSZWN1cnNpdmUsIGJhblVua25vd25Qcm9wZXJ0aWVzKTtcblx0XHRcdGlmICh0eXBlb2Ygc2NoZW1hID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdHNjaGVtYSA9IHtcIiRyZWZcIjogc2NoZW1hfTtcblx0XHRcdH1cblx0XHRcdGNvbnRleHQuYWRkU2NoZW1hKFwiXCIsIHNjaGVtYSk7XG5cdFx0XHR2YXIgZXJyb3IgPSBjb250ZXh0LnZhbGlkYXRlQWxsKGRhdGEsIHNjaGVtYSwgbnVsbCwgbnVsbCwgXCJcIik7XG5cdFx0XHRpZiAoIWVycm9yICYmIGJhblVua25vd25Qcm9wZXJ0aWVzKSB7XG5cdFx0XHRcdGVycm9yID0gY29udGV4dC5iYW5Vbmtub3duUHJvcGVydGllcygpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5lcnJvciA9IGVycm9yO1xuXHRcdFx0dGhpcy5taXNzaW5nID0gY29udGV4dC5taXNzaW5nO1xuXHRcdFx0dGhpcy52YWxpZCA9IChlcnJvciA9PT0gbnVsbCk7XG5cdFx0XHRyZXR1cm4gdGhpcy52YWxpZDtcblx0XHR9LFxuXHRcdHZhbGlkYXRlUmVzdWx0OiBmdW5jdGlvbiAoKSB7XG5cdFx0XHR2YXIgcmVzdWx0ID0ge307XG5cdFx0XHR0aGlzLnZhbGlkYXRlLmFwcGx5KHJlc3VsdCwgYXJndW1lbnRzKTtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fSxcblx0XHR2YWxpZGF0ZU11bHRpcGxlOiBmdW5jdGlvbiAoZGF0YSwgc2NoZW1hLCBjaGVja1JlY3Vyc2l2ZSwgYmFuVW5rbm93blByb3BlcnRpZXMpIHtcblx0XHRcdHZhciBjb250ZXh0ID0gbmV3IFZhbGlkYXRvckNvbnRleHQoZ2xvYmFsQ29udGV4dCwgdHJ1ZSwgbGFuZ3VhZ2VzW2N1cnJlbnRMYW5ndWFnZV0sIGNoZWNrUmVjdXJzaXZlLCBiYW5Vbmtub3duUHJvcGVydGllcyk7XG5cdFx0XHRpZiAodHlwZW9mIHNjaGVtYSA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRzY2hlbWEgPSB7XCIkcmVmXCI6IHNjaGVtYX07XG5cdFx0XHR9XG5cdFx0XHRjb250ZXh0LmFkZFNjaGVtYShcIlwiLCBzY2hlbWEpO1xuXHRcdFx0Y29udGV4dC52YWxpZGF0ZUFsbChkYXRhLCBzY2hlbWEsIG51bGwsIG51bGwsIFwiXCIpO1xuXHRcdFx0aWYgKGJhblVua25vd25Qcm9wZXJ0aWVzKSB7XG5cdFx0XHRcdGNvbnRleHQuYmFuVW5rbm93blByb3BlcnRpZXMoKTtcblx0XHRcdH1cblx0XHRcdHZhciByZXN1bHQgPSB7fTtcblx0XHRcdHJlc3VsdC5lcnJvcnMgPSBjb250ZXh0LmVycm9ycztcblx0XHRcdHJlc3VsdC5taXNzaW5nID0gY29udGV4dC5taXNzaW5nO1xuXHRcdFx0cmVzdWx0LnZhbGlkID0gKHJlc3VsdC5lcnJvcnMubGVuZ3RoID09PSAwKTtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fSxcblx0XHRhZGRTY2hlbWE6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBnbG9iYWxDb250ZXh0LmFkZFNjaGVtYS5hcHBseShnbG9iYWxDb250ZXh0LCBhcmd1bWVudHMpO1xuXHRcdH0sXG5cdFx0Z2V0U2NoZW1hOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gZ2xvYmFsQ29udGV4dC5nZXRTY2hlbWEuYXBwbHkoZ2xvYmFsQ29udGV4dCwgYXJndW1lbnRzKTtcblx0XHR9LFxuXHRcdGdldFNjaGVtYU1hcDogZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIGdsb2JhbENvbnRleHQuZ2V0U2NoZW1hTWFwLmFwcGx5KGdsb2JhbENvbnRleHQsIGFyZ3VtZW50cyk7XG5cdFx0fSxcblx0XHRnZXRTY2hlbWFVcmlzOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gZ2xvYmFsQ29udGV4dC5nZXRTY2hlbWFVcmlzLmFwcGx5KGdsb2JhbENvbnRleHQsIGFyZ3VtZW50cyk7XG5cdFx0fSxcblx0XHRnZXRNaXNzaW5nVXJpczogZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIGdsb2JhbENvbnRleHQuZ2V0TWlzc2luZ1VyaXMuYXBwbHkoZ2xvYmFsQ29udGV4dCwgYXJndW1lbnRzKTtcblx0XHR9LFxuXHRcdGRyb3BTY2hlbWFzOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRnbG9iYWxDb250ZXh0LmRyb3BTY2hlbWFzLmFwcGx5KGdsb2JhbENvbnRleHQsIGFyZ3VtZW50cyk7XG5cdFx0fSxcblx0XHRkZWZpbmVLZXl3b3JkOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRnbG9iYWxDb250ZXh0LmRlZmluZUtleXdvcmQuYXBwbHkoZ2xvYmFsQ29udGV4dCwgYXJndW1lbnRzKTtcblx0XHR9LFxuXHRcdGRlZmluZUVycm9yOiBmdW5jdGlvbiAoY29kZU5hbWUsIGNvZGVOdW1iZXIsIGRlZmF1bHRNZXNzYWdlKSB7XG5cdFx0XHRpZiAodHlwZW9mIGNvZGVOYW1lICE9PSAnc3RyaW5nJyB8fCAhL15bQS1aXSsoX1tBLVpdKykqJC8udGVzdChjb2RlTmFtZSkpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdDb2RlIG5hbWUgbXVzdCBiZSBhIHN0cmluZyBpbiBVUFBFUl9DQVNFX1dJVEhfVU5ERVJTQ09SRVMnKTtcblx0XHRcdH1cblx0XHRcdGlmICh0eXBlb2YgY29kZU51bWJlciAhPT0gJ251bWJlcicgfHwgY29kZU51bWJlciUxICE9PSAwIHx8IGNvZGVOdW1iZXIgPCAxMDAwMCkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0NvZGUgbnVtYmVyIG11c3QgYmUgYW4gaW50ZWdlciA+IDEwMDAwJyk7XG5cdFx0XHR9XG5cdFx0XHRpZiAodHlwZW9mIEVycm9yQ29kZXNbY29kZU5hbWVdICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yIGFscmVhZHkgZGVmaW5lZDogJyArIGNvZGVOYW1lICsgJyBhcyAnICsgRXJyb3JDb2Rlc1tjb2RlTmFtZV0pO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHR5cGVvZiBFcnJvckNvZGVMb29rdXBbY29kZU51bWJlcl0gIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcignRXJyb3IgY29kZSBhbHJlYWR5IHVzZWQ6ICcgKyBFcnJvckNvZGVMb29rdXBbY29kZU51bWJlcl0gKyAnIGFzICcgKyBjb2RlTnVtYmVyKTtcblx0XHRcdH1cblx0XHRcdEVycm9yQ29kZXNbY29kZU5hbWVdID0gY29kZU51bWJlcjtcblx0XHRcdEVycm9yQ29kZUxvb2t1cFtjb2RlTnVtYmVyXSA9IGNvZGVOYW1lO1xuXHRcdFx0RXJyb3JNZXNzYWdlc0RlZmF1bHRbY29kZU5hbWVdID0gRXJyb3JNZXNzYWdlc0RlZmF1bHRbY29kZU51bWJlcl0gPSBkZWZhdWx0TWVzc2FnZTtcblx0XHRcdGZvciAodmFyIGxhbmdDb2RlIGluIGxhbmd1YWdlcykge1xuXHRcdFx0XHR2YXIgbGFuZ3VhZ2UgPSBsYW5ndWFnZXNbbGFuZ0NvZGVdO1xuXHRcdFx0XHRpZiAobGFuZ3VhZ2VbY29kZU5hbWVdKSB7XG5cdFx0XHRcdFx0bGFuZ3VhZ2VbY29kZU51bWJlcl0gPSBsYW5ndWFnZVtjb2RlTnVtYmVyXSB8fCBsYW5ndWFnZVtjb2RlTmFtZV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXHRcdHJlc2V0OiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRnbG9iYWxDb250ZXh0LnJlc2V0KCk7XG5cdFx0XHR0aGlzLmVycm9yID0gbnVsbDtcblx0XHRcdHRoaXMubWlzc2luZyA9IFtdO1xuXHRcdFx0dGhpcy52YWxpZCA9IHRydWU7XG5cdFx0fSxcblx0XHRtaXNzaW5nOiBbXSxcblx0XHRlcnJvcjogbnVsbCxcblx0XHR2YWxpZDogdHJ1ZSxcblx0XHRub3JtU2NoZW1hOiBub3JtU2NoZW1hLFxuXHRcdHJlc29sdmVVcmw6IHJlc29sdmVVcmwsXG5cdFx0Z2V0RG9jdW1lbnRVcmk6IGdldERvY3VtZW50VXJpLFxuXHRcdGVycm9yQ29kZXM6IEVycm9yQ29kZXNcblx0fTtcblx0cmV0dXJuIGFwaTtcbn1cblxudmFyIHR2NCA9IGNyZWF0ZUFwaSgpO1xudHY0LmFkZExhbmd1YWdlKCdlbi1nYicsIEVycm9yTWVzc2FnZXNEZWZhdWx0KTtcblxuLy9sZWdhY3kgcHJvcGVydHlcbnR2NC50djQgPSB0djQ7XG5cbnJldHVybiB0djQ7IC8vIHVzZWQgYnkgX2hlYWRlci5qcyB0byBnbG9iYWxpc2UuXG5cbn0pKTsiLCJ2YXIgXyA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG52YXIgU3RlcHMgPSBbJ3BsYXknLCAnZm9ybScsICdyZXN1bHQnXTtcblxuZnVuY3Rpb24gSW5zdGFudFdpbihDdXJyZW50VXNlciwgU2hpcCkge1xuICB2YXIgQ0hBTkdFX0VWRU5UID0gW1wiU0hJUF9DSEFOR0VcIiwgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwMDAwMDAwMDAwKV0uam9pbignXycpO1xuXG4gIHZhciBBcHBTdGF0ZSA9IHt9O1xuXG4gIGZ1bmN0aW9uIGluaXRTdGF0ZSh1c2VyLCBzaGlwKSB7XG4gICAgQXBwU3RhdGUgPSB7XG4gICAgICBzaGlwOiBfLm9taXQoc2hpcCwgJ3NldHRpbmdzJywgJ3Jlc291cmNlcycsICd0cmFuc2xhdGlvbnMnKSxcbiAgICAgIHNldHRpbmdzOiBzaGlwLnNldHRpbmdzLFxuICAgICAgZm9ybTogc2hpcC5yZXNvdXJjZXMuZm9ybSxcbiAgICAgIGFjaGlldmVtZW50OiBzaGlwLnJlc291cmNlcy5pbnN0YW50X3dpbixcbiAgICAgIHRyYW5zbGF0aW9uczogc2hpcC50cmFuc2xhdGlvbnMsXG4gICAgICB1c2VyOiB1c2VyLFxuICAgICAgYmFkZ2U6IChzaGlwLnJlc291cmNlcy5pbnN0YW50X3dpbiAmJiBzaGlwLnJlc291cmNlcy5pbnN0YW50X3dpbi5iYWRnZSlcbiAgICB9O1xuICAgIGVtaXRDaGFuZ2UoKTtcbiAgICByZXR1cm4gQXBwU3RhdGU7XG4gIH07XG5cbiAgZnVuY3Rpb24gZW1pdENoYW5nZSh0bXApIHtcbiAgICB2YXIgcyA9IGdldEFwcFN0YXRlKHRtcCk7XG4gICAgSHVsbC5lbWl0KENIQU5HRV9FVkVOVCwgcyk7XG4gIH1cblxuICAvLyBDdXN0b21pemF0aW9uIHN1cHBvcnRcblxuICBmdW5jdGlvbiB1cGRhdGVTZXR0aW5ncyhzZXR0aW5ncykge1xuICAgIEFwcFN0YXRlLnNldHRpbmdzID0gc2V0dGluZ3M7XG4gICAgZW1pdENoYW5nZSh7IGNoYW5nZWQ6ICdzZXR0aW5ncycgfSk7XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVUcmFuc2xhdGlvbnModHJhbnNsYXRpb25zKSB7XG4gICAgQXBwU3RhdGUudHJhbnNsYXRpb25zID0gdHJhbnNsYXRpb25zO1xuICAgIGVtaXRDaGFuZ2UoeyBjaGFuZ2VkOiAndHJhbnNsYXRpb25zJyB9KTtcbiAgfVxuXG4gIC8vIFVzZXIgYWN0aW9uc1xuXG4gIGZ1bmN0aW9uIHByb2Nlc3NGb3JtRGF0YShmb3JtRGF0YSkge1xuICAgIHZhciBmaWVsZHMgPSBBcHBTdGF0ZS5mb3JtLmZpZWxkc19saXN0O1xuICAgIHZhciByZXQgPSBmaWVsZHMucmVkdWNlKGZ1bmN0aW9uKGRhdGEsIGZpZWxkKSB7XG4gICAgICB2YXIgdmFsID0gZm9ybURhdGFbZmllbGQubmFtZV07XG4gICAgICBpZiAodmFsLnRvU3RyaW5nKCkubGVuZ3RoID4gMCkge1xuICAgICAgICBzd2l0Y2ggKGZpZWxkLmZpZWxkX3R5cGUpIHtcbiAgICAgICAgICBjYXNlICdkYXRlJzpcbiAgICAgICAgICAgIHJlcyA9IG5ldyBEYXRlKHZhbCkudG9JU09TdHJpbmcoKS5zdWJzdHJpbmcoMCwxMCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmVzID0gZm9ybURhdGFbZmllbGQubmFtZV07XG4gICAgICAgIH1cbiAgICAgICAgZGF0YVtmaWVsZC5uYW1lXSA9IHJlcztcbiAgICAgIH1cbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH0sIHt9KTtcbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgZnVuY3Rpb24gc3VibWl0Rm9ybShmb3JtRGF0YSkge1xuICAgIHZhciBkYXRhID0gcHJvY2Vzc0Zvcm1EYXRhKGZvcm1EYXRhKTtcbiAgICBlbWl0Q2hhbmdlKHsgY2hhbmdlZDogJ2xvYWRpbmcnLCBsb2FkaW5nOiAnZm9ybScgfSk7XG4gICAgSHVsbC5hcGkoQXBwU3RhdGUuZm9ybS5pZCArIFwiL3N1Ym1pdFwiLCB7IGRhdGE6IGRhdGEgfSwgJ3B1dCcpLnRoZW4oZnVuY3Rpb24oZm9ybSkge1xuICAgICAgQXBwU3RhdGUuZm9ybSA9IGZvcm07XG4gICAgICBlbWl0Q2hhbmdlKHsgY2hhbmdlZDogJ2Zvcm0nIH0pO1xuICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgZW1pdENoYW5nZSh7IGVycm9yX21lc3NhZ2U6ICdpbnZhbGlkX2Zvcm0nLCBlcnJvcjogZXJyIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gcGxheShwcm92aWRlcikge1xuICAgIGlmICh1c2VyQ2FuUGxheSgpKSB7XG4gICAgICBlbWl0Q2hhbmdlKHsgY2hhbmdlZDogJ2xvYWRpbmcnLCBsb2FkaW5nOiAnYmFkZ2UnIH0pO1xuICAgICAgcmV0dXJuIEh1bGwuYXBpKEFwcFN0YXRlLmFjaGlldmVtZW50LmlkICsgXCIvYWNoaWV2ZVwiLCAncG9zdCcpLnRoZW4oZnVuY3Rpb24oYmFkZ2UpIHtcbiAgICAgICAgQXBwU3RhdGUuYmFkZ2UgPSBiYWRnZTtcbiAgICAgICAgZW1pdENoYW5nZSh7IGNoYW5nZWQ6ICdiYWRnZScgfSk7XG4gICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgZW1pdENoYW5nZSh7IGVycm9yX21lc3NhZ2U6ICdlcnJvcl9vbl9hY2hpZXZlJywgZXJyb3I6IGVyciB9KTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAocHJvdmlkZXIgJiYgIUFwcFN0YXRlLnVzZXIpIHtcbiAgICAgIGxvZ2luQW5kUGxheShwcm92aWRlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVtaXRDaGFuZ2UoeyBlcnJvcl9tZXNzYWdlOiAndXNlcl9jYW5ub3RfcGxheScgfSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIGF1dG9QbGF5ID0gZmFsc2U7XG4gIGZ1bmN0aW9uIGxvZ2luQW5kUGxheShwcm92aWRlciwgb3B0aW9ucykge1xuICAgIGlmIChwcm92aWRlcikge1xuICAgICAgYXV0b1BsYXkgPSB0cnVlO1xuICAgICAgZW1pdENoYW5nZSh7IGlzTG9nZ2luZ0luOiB0cnVlIH0pO1xuICAgICAgSHVsbC5sb2dpbihwcm92aWRlciwgb3B0aW9ucyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IFwiW0luc3RhbnRXaW5dIEVycm9yIGluIGxvZ2luQW5kUGxheSBtZXRob2Q6IG1pc3NpbmcgYHByb3ZpZGVyYFwiO1xuICAgIH1cbiAgfVxuXG4gIC8vIFN0YXRlIG1hbmFnZW1lbnRcblxuICBmdW5jdGlvbiBnZXRBcHBTdGF0ZSh0bXApIHtcbiAgICB2YXIgc3RlcCA9IGN1cnJlbnRTdGVwKCk7XG4gICAgdmFyIHJldCA9IF8uZXh0ZW5kKHt9LCBBcHBTdGF0ZSwge1xuICAgICAgdXNlckNhblBsYXk6IHVzZXJDYW5QbGF5KCksXG4gICAgICB1c2VySGFzUGxheWVkOiB1c2VySGFzUGxheWVkKCksXG4gICAgICB1c2VySGFzV29uOiB1c2VySGFzV29uKCksXG4gICAgICBjdXJyZW50U3RlcDogc3RlcCxcbiAgICAgIGN1cnJlbnRTdGVwSW5kZXg6IHN0ZXBJbmRleChzdGVwKSxcbiAgICAgIGlzRm9ybUNvbXBsZXRlOiBpc0Zvcm1Db21wbGV0ZSgpLFxuICAgIH0sIHRtcCk7XG4gICAgcmV0dXJuIF8uZGVlcENsb25lKHJldCk7XG4gIH1cblxuICBmdW5jdGlvbiB1c2VyQ2FuUGxheSgpIHtcbiAgICByZXR1cm4gY2FuUGxheSgpID09PSB0cnVlO1xuICB9XG5cbiAgZnVuY3Rpb24gY2FuUGxheSgpIHtcbiAgICBpZiAoIUFwcFN0YXRlLnVzZXIpIHJldHVybiBcIk5vIGN1cnJlbnQgdXNlclwiO1xuICAgIGlmICh1c2VySGFzV29uKCkpIHJldHVybiBcIkFscmVhZHkgd29uXCI7XG4gICAgdmFyIGJhZGdlID0gQXBwU3RhdGUuYmFkZ2U7XG4gICAgaWYgKCFiYWRnZSB8fCAhYmFkZ2UuZGF0YS5hdHRlbXB0cykgcmV0dXJuIHRydWU7XG4gICAgdmFyIGQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkuc2xpY2UoMCwgMTApO1xuICAgIGlmIChiYWRnZS5kYXRhLmF0dGVtcHRzW2RdKSB7XG4gICAgICByZXR1cm4gXCJPbmUgYXR0ZW1wdCBhbHJlYWR5IHRvZGF5XCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHVzZXJIYXNQbGF5ZWQoKSB7XG4gICAgcmV0dXJuICEhQXBwU3RhdGUuYmFkZ2U7XG4gIH1cblxuICBmdW5jdGlvbiB1c2VySGFzV29uKCkge1xuICAgIHZhciBiYWRnZSA9IEFwcFN0YXRlLmJhZGdlO1xuICAgIGlmICghYmFkZ2UgfHwgIWJhZGdlLmRhdGEpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gYmFkZ2UuZGF0YS53aW5uZXIgPT09IHRydWU7XG4gIH1cblxuICBmdW5jdGlvbiBjdXJyZW50U3RlcCgpIHtcbiAgICBpZiAoIUFwcFN0YXRlLnVzZXIgfHwgdXNlckNhblBsYXkoKSkgcmV0dXJuICdwbGF5JztcbiAgICBpZiAoIWlzRm9ybUNvbXBsZXRlKCkpIHJldHVybiAnZm9ybSc7XG4gICAgcmV0dXJuICdyZXN1bHQnO1xuICB9XG5cbiAgZnVuY3Rpb24gc3RlcEluZGV4KHN0ZXApIHtcbiAgICByZXR1cm4gU3RlcHMuaW5kZXhPZihzdGVwKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzRm9ybUNvbXBsZXRlKCkge1xuICAgIGlmICghQXBwU3RhdGUudXNlcikgcmV0dXJuIGZhbHNlO1xuICAgIHZhciBmaWVsZHMgPSBBcHBTdGF0ZS5mb3JtICYmIEFwcFN0YXRlLmZvcm0uZmllbGRzX2xpc3Q7XG4gICAgdmFyIHJldCA9IEFwcFN0YXRlLmZvcm0udXNlcl9kYXRhLmNyZWF0ZWRfYXQgJiYgZmllbGRzICYmIGZpZWxkcy5yZWR1Y2UoZnVuY3Rpb24ocmVzLCBmaWVsZCkge1xuICAgICAgcmV0dXJuIHJlcyAmJiAhIWZpZWxkLnZhbHVlO1xuICAgIH0sIHRydWUpO1xuICAgIHJldHVybiByZXQgfHwgZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiByZXNldCgpIHtcbiAgICBpZiAoQXBwU3RhdGUudXNlci5pc19hZG1pbikge1xuICAgICAgZW1pdENoYW5nZSh7IGxvYWRpbmc6ICdyZXNldCcgfSk7XG4gICAgICBpZiAoQXBwU3RhdGUuYmFkZ2UgJiYgQXBwU3RhdGUuYmFkZ2UuaWQpIHtcbiAgICAgICAgSHVsbC5hcGkoQXBwU3RhdGUuYmFkZ2UuaWQsICdkZWxldGUnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBBcHBTdGF0ZS5iYWRnZSA9IG51bGw7XG4gICAgICAgICAgSHVsbC5hcGkoQXBwU3RhdGUuZm9ybS5pZCArICcvc3VibWl0JywgJ2RlbGV0ZScsIGZ1bmN0aW9uKGZvcm0pIHtcbiAgICAgICAgICAgIEFwcFN0YXRlLmZvcm0gPSBmb3JtO1xuICAgICAgICAgICAgZW1pdENoYW5nZSh7IGNoYW5nZWQ6ICdyZXNldCcgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgIGVtaXRDaGFuZ2UoeyBlcnJvcl9tZXNzYWdlOiAnZXJyb3JfZGVsZXRpbmdfYmFkZ2UnLCBlcnJvcjogZXJyIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVtaXRDaGFuZ2UoeyBjaGFuZ2VkOiAncmVzZXQnIH0pO1xuICAgICAgICB0aHJvdyBcIltJbnN0YW50V2luXSBObyBiYWRnZSBmb3VuZCBoZXJlLi4uXCI7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IFwiW0luc3RhbnRXaW5dIFlvdSBuZWVkIHRvIGJlIGEgYWRtaW5pc3RyYXRvciB0byByZXNldCBiYWRnZXNcIjtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB0cmFuc2xhdGUobGFuZykge1xuICAgIHZhciByZXQgPSBBcHBTdGF0ZS50cmFuc2xhdGlvbnNbbGFuZ10gfHwgQXBwU3RhdGUudHJhbnNsYXRpb25zWydlbiddIHx8IHt9O1xuICAgIHZhciByZXN1bHQgPSBPYmplY3Qua2V5cyhyZXQpLnJlZHVjZShmdW5jdGlvbih0ciwgaykge1xuICAgICAgdmFyIHQgPSByZXRba107XG4gICAgICBpZiAodCAmJiB0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgdHJba10gPSB0O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRyO1xuICAgIH0sIHt9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gb25BdXRoRXZlbnQoKSB7XG4gICAgZW1pdENoYW5nZSh7IGNoYW5nZWQ6ICdsb2FkaW5nJywgbG9hZGluZzogJ3NoaXAnIH0pO1xuICAgIEh1bGwuYXBpKFNoaXAuaWQsIHsgZmllbGRzOiAnYmFkZ2UnIH0pLnRoZW4oZnVuY3Rpb24oc2hpcCkge1xuICAgICAgaW5pdFN0YXRlKEh1bGwuY3VycmVudFVzZXIoKSwgc2hpcCk7XG4gICAgICBpZiAoYXV0b1BsYXkgJiYgdXNlckNhblBsYXkoKSkgcGxheSgpO1xuICAgICAgYXV0b1BsYXkgPSBmYWxzZTtcbiAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGVtaXRDaGFuZ2UoeyBlcnJvcl9tZXNzYWdlOiAnc2hpcF9ub3RfZm91bmQnLCBlcnJvcjogZXJyIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgSHVsbC5vbignaHVsbC51c2VyLnVwZGF0ZScsIG9uQXV0aEV2ZW50KTtcbiAgSHVsbC5vbignaHVsbC51c2VyLmxvZ2luJywgb25BdXRoRXZlbnQpO1xuICBIdWxsLm9uKCdodWxsLnVzZXIubG9nb3V0Jywgb25BdXRoRXZlbnQpO1xuICBIdWxsLm9uKCdodWxsLnVzZXIuZmFpbCcsIG9uQXV0aEV2ZW50KTtcblxuICB2YXIgX2xpc3RlbmVycyA9IFtdO1xuXG4gIC8vIFB1YmxpYyBBUElcblxuICB0aGlzLm9uQ2hhbmdlID0gZnVuY3Rpb24oY2IpIHtcbiAgICB2YXIgY2FsbGJhY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgY2IuYXBwbHkodW5kZWZpbmVkLCBhcmdzKTtcbiAgICAgIH0pXG4gICAgfTtcbiAgICBfbGlzdGVuZXJzLnB1c2goY2FsbGJhY2spO1xuICAgIEh1bGwub24oQ0hBTkdFX0VWRU5ULCBjYWxsYmFjayk7XG4gIH07XG5cbiAgdGhpcy50ZWFyZG93biA9IGZ1bmN0aW9uKCkge1xuICAgIEh1bGwub2ZmKCdodWxsLnVzZXIudXBkYXRlJywgb25BdXRoRXZlbnQpO1xuICAgIEh1bGwub2ZmKCdodWxsLnVzZXIubG9naW4nLCBvbkF1dGhFdmVudCk7XG4gICAgSHVsbC5vZmYoJ2h1bGwudXNlci5sb2dvdXQnLCBvbkF1dGhFdmVudCk7XG4gICAgSHVsbC5vZmYoJ2h1bGwudXNlci5mYWlsJywgb25BdXRoRXZlbnQpO1xuICAgIGZvciAodmFyIGwgPSAwOyBsIDwgX2xpc3RlbmVycy5sZW5ndGg7IGwrKykge1xuICAgICAgSHVsbC5vZmYoQ0hBTkdFX0VWRU5ULCBsaXN0ZW5lcnNbbF0pO1xuICAgIH1cbiAgfTtcblxuICB0aGlzLmdldFN0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGdldEFwcFN0YXRlKCk7XG4gIH07XG5cbiAgdGhpcy5wbGF5ID0gcGxheTtcbiAgdGhpcy5yZXNldCA9IHJlc2V0O1xuICB0aGlzLnN1Ym1pdEZvcm0gPSBzdWJtaXRGb3JtO1xuICB0aGlzLnRyYW5zbGF0ZSA9IHRyYW5zbGF0ZTtcblxuICBpZiAoU2hpcCkge1xuICAgIGluaXRTdGF0ZShDdXJyZW50VXNlciwgU2hpcCk7XG4gIH1cblxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgZnVuY3Rpb24oZSkge1xuICAgIHZhciBtZXNzYWdlID0gZS5kYXRhO1xuICAgIGlmIChtZXNzYWdlICYmIG1lc3NhZ2UuZXZlbnQgPT09IFwic2hpcC51cGRhdGVcIikge1xuICAgICAgdXBkYXRlU2V0dGluZ3MobWVzc2FnZS5zaGlwLnNldHRpbmdzKTtcbiAgICAgIHVwZGF0ZVRyYW5zbGF0aW9ucyhtZXNzYWdlLnNoaXAudHJhbnNsYXRpb25zIHx8IHt9KTtcbiAgICB9XG4gIH0sIGZhbHNlKTtcbn07XG5cbkluc3RhbnRXaW4uU3RlcHMgPSBTdGVwcztcblxubW9kdWxlLmV4cG9ydHMgPSBJbnN0YW50V2luO1xuIiwiYW5ndWxhci5tb2R1bGUoJ3NjaGVtYUZvcm0nKS5jb25maWcoXG5bJ3NjaGVtYUZvcm1Qcm92aWRlcicsICdzY2hlbWFGb3JtRGVjb3JhdG9yc1Byb3ZpZGVyJywgJ3NmUGF0aFByb3ZpZGVyJyxcbiAgZnVuY3Rpb24oc2NoZW1hRm9ybVByb3ZpZGVyLCAgc2NoZW1hRm9ybURlY29yYXRvcnNQcm92aWRlciwgc2ZQYXRoUHJvdmlkZXIpIHtcblxuICAgIHZhciBkYXRlcGlja2VyID0gZnVuY3Rpb24obmFtZSwgc2NoZW1hLCBvcHRpb25zKSB7XG4gICAgICBpZiAoc2NoZW1hLnR5cGUgPT09ICdzdHJpbmcnICYmIChzY2hlbWEuZm9ybWF0ID09PSAnZGF0ZScgfHwgc2NoZW1hLmZvcm1hdCA9PT0gJ2RhdGUtdGltZScpKSB7XG4gICAgICAgIHZhciBmID0gc2NoZW1hRm9ybVByb3ZpZGVyLnN0ZEZvcm1PYmoobmFtZSwgc2NoZW1hLCBvcHRpb25zKTtcbiAgICAgICAgZi5rZXkgID0gb3B0aW9ucy5wYXRoO1xuICAgICAgICBmLnR5cGUgPSAnZGF0ZXBpY2tlcic7XG4gICAgICAgIG9wdGlvbnMubG9va3VwW3NmUGF0aFByb3ZpZGVyLnN0cmluZ2lmeShvcHRpb25zLnBhdGgpXSA9IGY7XG4gICAgICAgIHJldHVybiBmO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBzY2hlbWFGb3JtUHJvdmlkZXIuZGVmYXVsdHMuc3RyaW5nLnVuc2hpZnQoZGF0ZXBpY2tlcik7XG5cbiAgICAvL0FkZCB0byB0aGUgRm91bmRhdGlvbiBkaXJlY3RpdmVcbiAgICBzY2hlbWFGb3JtRGVjb3JhdG9yc1Byb3ZpZGVyLmFkZE1hcHBpbmcoXG4gICAgICAnZm91bmRhdGlvbkRlY29yYXRvcicsXG4gICAgICAnZGF0ZXBpY2tlcicsXG4gICAgICAnZGlyZWN0aXZlcy9kZWNvcmF0b3JzL2ZvdW5kYXRpb24vZGF0ZXBpY2tlci5odG1sJ1xuICAgICk7XG4gICAgc2NoZW1hRm9ybURlY29yYXRvcnNQcm92aWRlci5jcmVhdGVEaXJlY3RpdmUoXG4gICAgICAnZGF0ZXBpY2tlcicsXG4gICAgICAnZGlyZWN0aXZlcy9kZWNvcmF0b3JzL2ZvdW5kYXRpb24vZGF0ZXBpY2tlci5odG1sJ1xuICAgICk7XG4gIH1cbl0pO1xuIiwicmVxdWlyZSgnLi9mb3VuZGF0aW9uLWRlY29yYXRvci1kYXRlcGlja2VyJyk7XG5hbmd1bGFyLm1vZHVsZSgnc2NoZW1hRm9ybScpLmNvbmZpZyhbJ3NjaGVtYUZvcm1EZWNvcmF0b3JzUHJvdmlkZXInLCBmdW5jdGlvbihkZWNvcmF0b3JzUHJvdmlkZXIpIHtcbiAgdmFyIGJhc2UgPSAnZGlyZWN0aXZlcy9kZWNvcmF0b3JzL2ZvdW5kYXRpb24vJztcblxuICBkZWNvcmF0b3JzUHJvdmlkZXIuY3JlYXRlRGVjb3JhdG9yKCdmb3VuZGF0aW9uRGVjb3JhdG9yJywge1xuICAgIHRleHRhcmVhOiBiYXNlICsgJ3RleHRhcmVhLmh0bWwnLFxuICAgIGZpZWxkc2V0OiBiYXNlICsgJ2ZpZWxkc2V0Lmh0bWwnLFxuICAgIGFycmF5OiBiYXNlICsgJ2FycmF5Lmh0bWwnLFxuICAgIHRhYmFycmF5OiBiYXNlICsgJ3RhYmFycmF5Lmh0bWwnLFxuICAgIHRhYnM6IGJhc2UgKyAndGFicy5odG1sJyxcbiAgICBzZWN0aW9uOiBiYXNlICsgJ3NlY3Rpb24uaHRtbCcsXG4gICAgY29uZGl0aW9uYWw6IGJhc2UgKyAnc2VjdGlvbi5odG1sJyxcbiAgICBhY3Rpb25zOiBiYXNlICsgJ2FjdGlvbnMuaHRtbCcsXG4gICAgZGF0ZXBpY2tlcjogYmFzZSArICdkYXRlcGlja2VyLmh0bWwnLFxuICAgIHNlbGVjdDogYmFzZSArICdzZWxlY3QuaHRtbCcsXG4gICAgY2hlY2tib3g6IGJhc2UgKyAnY2hlY2tib3guaHRtbCcsXG4gICAgY2hlY2tib3hlczogYmFzZSArICdjaGVja2JveGVzLmh0bWwnLFxuICAgIG51bWJlcjogYmFzZSArICdkZWZhdWx0Lmh0bWwnLFxuICAgIHBhc3N3b3JkOiBiYXNlICsgJ2RlZmF1bHQuaHRtbCcsXG4gICAgc3VibWl0OiBiYXNlICsgJ3N1Ym1pdC5odG1sJyxcbiAgICBidXR0b246IGJhc2UgKyAnc3VibWl0Lmh0bWwnLFxuICAgIHJhZGlvczogYmFzZSArICdyYWRpb3MuaHRtbCcsXG4gICAgJ3JhZGlvcy1pbmxpbmUnOiBiYXNlICsgJ3JhZGlvcy1pbmxpbmUuaHRtbCcsXG4gICAgcmFkaW9idXR0b25zOiBiYXNlICsgJ3JhZGlvLWJ1dHRvbnMuaHRtbCcsXG4gICAgaGVscDogYmFzZSArICdoZWxwLmh0bWwnLFxuICAgICdkZWZhdWx0JzogYmFzZSArICdkZWZhdWx0Lmh0bWwnXG4gIH0sIFtcbiAgICBmdW5jdGlvbihmb3JtKSB7XG4gICAgICBpZiAoZm9ybS5yZWFkb25seSAmJiBmb3JtLmtleSAmJiBmb3JtLnR5cGUgIT09ICdmaWVsZHNldCcpIHtcbiAgICAgICAgcmV0dXJuIGJhc2UgKyAncmVhZG9ubHkuaHRtbCc7XG4gICAgICB9XG4gICAgfVxuICBdLCB7IGNsYXNzTmFtZTogXCJyb3dcIiB9KTtcblxuICAvL21hbnVhbCB1c2UgZGlyZWN0aXZlc1xuICBkZWNvcmF0b3JzUHJvdmlkZXIuY3JlYXRlRGlyZWN0aXZlcyh7XG4gICAgdGV4dGFyZWE6IGJhc2UgKyAndGV4dGFyZWEuaHRtbCcsXG4gICAgc2VsZWN0OiBiYXNlICsgJ3NlbGVjdC5odG1sJyxcbiAgICBjaGVja2JveDogYmFzZSArICdjaGVja2JveC5odG1sJyxcbiAgICBjaGVja2JveGVzOiBiYXNlICsgJ2NoZWNrYm94ZXMuaHRtbCcsXG4gICAgbnVtYmVyOiBiYXNlICsgJ2RlZmF1bHQuaHRtbCcsXG4gICAgc3VibWl0OiBiYXNlICsgJ3N1Ym1pdC5odG1sJyxcbiAgICBidXR0b246IGJhc2UgKyAnc3VibWl0Lmh0bWwnLFxuICAgIHRleHQ6IGJhc2UgKyAnZGVmYXVsdC5odG1sJyxcbiAgICBkYXRlOiBiYXNlICsgJ2RlZmF1bHQuaHRtbCcsXG4gICAgcGFzc3dvcmQ6IGJhc2UgKyAnZGVmYXVsdC5odG1sJyxcbiAgICBkYXRlcGlja2VyOiBiYXNlICsgJ2RhdGVwaWNrZXIuaHRtbCcsXG4gICAgaW5wdXQ6IGJhc2UgKyAnZGVmYXVsdC5odG1sJyxcbiAgICByYWRpb3M6IGJhc2UgKyAncmFkaW9zLmh0bWwnLFxuICAgICdyYWRpb3MtaW5saW5lJzogYmFzZSArICdyYWRpb3MtaW5saW5lLmh0bWwnLFxuICAgIHJhZGlvYnV0dG9uczogYmFzZSArICdyYWRpby1idXR0b25zLmh0bWwnLFxuICB9KTtcblxufV0pLmRpcmVjdGl2ZSgnc2ZGaWVsZHNldCcsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgc2NvcGU6IHRydWUsXG4gICAgdGVtcGxhdGVVcmw6ICdkaXJlY3RpdmVzL2RlY29yYXRvcnMvZm91bmRhdGlvbi9maWVsZHNldC10cmNsLmh0bWwnLFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgc2NvcGUudGl0bGUgPSBzY29wZS4kZXZhbChhdHRycy50aXRsZSk7XG4gICAgfVxuICB9O1xufSk7XG4iLCJmdW5jdGlvbiBpc09iamVjdChvYmopIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2Ygb2JqO1xuICByZXR1cm4gdHlwZSA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlID09PSAnb2JqZWN0JyAmJiAhIW9iajtcbn07XG5cblxuIGZ1bmN0aW9uIGV4dGVuZChvYmopIHtcbiAgaWYgKCFpc09iamVjdChvYmopKSByZXR1cm4gb2JqO1xuICB2YXIgc291cmNlLCBwcm9wO1xuICBmb3IgKHZhciBpID0gMSwgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgc291cmNlID0gYXJndW1lbnRzW2ldO1xuICAgIGZvciAocHJvcCBpbiBzb3VyY2UpIHtcbiAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwgcHJvcCkpIHtcbiAgICAgICAgICBvYmpbcHJvcF0gPSBzb3VyY2VbcHJvcF07XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBvYmo7XG59O1xuXG5mdW5jdGlvbiBvbWl0KG9iaiAvKiBrZXlzICovKSB7XG4gIHZhciB3aXRob3V0S2V5cyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgcmV0dXJuIG9iaiAmJiBPYmplY3Qua2V5cyhvYmopLnJlZHVjZShmdW5jdGlvbihzLCBrKSB7XG4gICAgaWYgKHdpdGhvdXRLZXlzLmluZGV4T2YoaykgPT09IC0xKSBzW2tdID0gb2JqW2tdXG4gICAgcmV0dXJuIHM7XG4gIH0sIHt9KTtcbn07XG5cbmZ1bmN0aW9uIGRlZXBDbG9uZShvYmopIHtcbiAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob2JqKSk7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGV4dGVuZDogZXh0ZW5kLFxuICBvbWl0OiBvbWl0LFxuICBpc09iamVjdDogaXNPYmplY3QsXG4gIGRlZXBDbG9uZTogZGVlcENsb25lXG59O1xuIl19
