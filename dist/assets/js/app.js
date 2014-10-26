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
    $scope.styles   = {};
    $scope.login    = Hull.login;
    $scope.logout   = Hull.logout;
    $scope.play     = $instant.play;

    $scope.steps = Steps;
    $scope.$instant       = $instant;
    $scope.instant        = $instant.getState();
    $scope.authServices   = $hullConfig.getAuthServices();

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


Hull.ready(function(_, currentUser, ship, org) {
  var HullInit = {
    user: currentUser,
    ship: ship,
    org: org
  };
  app.value('$hullInit', HullInit);
  angular.bootstrap(document, ['hull-instant']);
});

},{"./instant":"/Users/sbellity/code/h/ships/instant/src/javascript/instant.js","./schema-form/foundation-decorator":"/Users/sbellity/code/h/ships/instant/src/javascript/schema-form/foundation-decorator.js","./schema-form/foundation-decorator-datepicker":"/Users/sbellity/code/h/ships/instant/src/javascript/schema-form/foundation-decorator-datepicker.js","angular-datepicker/build/angular-datepicker":"/Users/sbellity/code/h/ships/instant/node_modules/angular-datepicker/build/angular-datepicker.js","angular-schema-form/dist/schema-form":"/Users/sbellity/code/h/ships/instant/node_modules/angular-schema-form/dist/schema-form.js","angular-translate":"/Users/sbellity/code/h/ships/instant/node_modules/angular-translate/dist/angular-translate.js","objectpath":"/Users/sbellity/code/h/ships/instant/node_modules/objectpath/index.js","tv4":"/Users/sbellity/code/h/ships/instant/node_modules/tv4/tv4.js"}],"/Users/sbellity/code/h/ships/instant/node_modules/angular-datepicker/build/angular-datepicker.js":[function(require,module,exports){
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
},{}],"/Users/sbellity/code/h/ships/instant/node_modules/angular-schema-form/dist/schema-form.js":[function(require,module,exports){
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

},{}],"/Users/sbellity/code/h/ships/instant/node_modules/angular-translate/dist/angular-translate.js":[function(require,module,exports){
/*!
 * angular-translate - v2.4.2 - 2014-10-21
 * http://github.com/angular-translate/angular-translate
 * Copyright (c) 2014 ; Licensed MIT
 */
angular.module('pascalprecht.translate', ['ng']).run([
  '$translate',
  function ($translate) {
    var key = $translate.storageKey(), storage = $translate.storage();
    if (storage) {
      if (!storage.get(key)) {
        if (angular.isString($translate.preferredLanguage())) {
          $translate.use($translate.preferredLanguage());
        } else {
          storage.set(key, $translate.use());
        }
      } else {
        $translate.use(storage.get(key));
      }
    } else if (angular.isString($translate.preferredLanguage())) {
      $translate.use($translate.preferredLanguage());
    }
  }
]);
angular.module('pascalprecht.translate').provider('$translate', [
  '$STORAGE_KEY',
  function ($STORAGE_KEY) {
    var $translationTable = {}, $preferredLanguage, $availableLanguageKeys = [], $languageKeyAliases, $fallbackLanguage, $fallbackWasString, $uses, $nextLang, $storageFactory, $storageKey = $STORAGE_KEY, $storagePrefix, $missingTranslationHandlerFactory, $interpolationFactory, $interpolatorFactories = [], $interpolationSanitizationStrategy = false, $loaderFactory, $cloakClassName = 'translate-cloak', $loaderOptions, $notFoundIndicatorLeft, $notFoundIndicatorRight, $postCompilingEnabled = false, NESTED_OBJECT_DELIMITER = '.', loaderCache;
    var version = '2.4.2';
    var getLocale = function () {
      var nav = window.navigator;
      return ((angular.isArray(nav.languages) ? nav.languages[0] : nav.language || nav.browserLanguage || nav.systemLanguage || nav.userLanguage) || '').split('-').join('_');
    };
    var indexOf = function (array, searchElement) {
      for (var i = 0, len = array.length; i < len; i++) {
        if (array[i] === searchElement) {
          return i;
        }
      }
      return -1;
    };
    var trim = function () {
      return this.replace(/^\s+|\s+$/g, '');
    };
    var negotiateLocale = function (preferred) {
      var avail = [], locale = angular.lowercase(preferred), i = 0, n = $availableLanguageKeys.length;
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
          var hasExactKey = Object.prototype.hasOwnProperty.call($languageKeyAliases, langKeyAlias) && angular.lowercase(langKeyAlias) === angular.lowercase(preferred);
          if (langKeyAlias.slice(-1) === '*') {
            hasWildcardKey = langKeyAlias.slice(0, -1) === preferred.slice(0, langKeyAlias.length - 1);
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
      return preferred;
    };
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
    this.cloakClassName = function (name) {
      if (!name) {
        return $cloakClassName;
      }
      $cloakClassName = name;
      return this;
    };
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
          keyWithPath = path.length ? '' + path.join(NESTED_OBJECT_DELIMITER) + NESTED_OBJECT_DELIMITER + key : key;
          if (path.length && key === prevKey) {
            keyWithShortPath = '' + path.join(NESTED_OBJECT_DELIMITER);
            result[keyWithShortPath] = '@:' + keyWithPath;
          }
          result[keyWithPath] = val;
        }
      }
      return result;
    };
    this.addInterpolation = function (factory) {
      $interpolatorFactories.push(factory);
      return this;
    };
    this.useMessageFormatInterpolation = function () {
      return this.useInterpolation('$translateMessageFormatInterpolation');
    };
    this.useInterpolation = function (factory) {
      $interpolationFactory = factory;
      return this;
    };
    this.useSanitizeValueStrategy = function (value) {
      $interpolationSanitizationStrategy = value;
      return this;
    };
    this.preferredLanguage = function (langKey) {
      setupPreferredLanguage(langKey);
      return this;
    };
    var setupPreferredLanguage = function (langKey) {
      if (langKey) {
        $preferredLanguage = langKey;
      }
      return $preferredLanguage;
    };
    this.translationNotFoundIndicator = function (indicator) {
      this.translationNotFoundIndicatorLeft(indicator);
      this.translationNotFoundIndicatorRight(indicator);
      return this;
    };
    this.translationNotFoundIndicatorLeft = function (indicator) {
      if (!indicator) {
        return $notFoundIndicatorLeft;
      }
      $notFoundIndicatorLeft = indicator;
      return this;
    };
    this.translationNotFoundIndicatorRight = function (indicator) {
      if (!indicator) {
        return $notFoundIndicatorRight;
      }
      $notFoundIndicatorRight = indicator;
      return this;
    };
    this.fallbackLanguage = function (langKey) {
      fallbackStack(langKey);
      return this;
    };
    var fallbackStack = function (langKey) {
      if (langKey) {
        if (angular.isString(langKey)) {
          $fallbackWasString = true;
          $fallbackLanguage = [langKey];
        } else if (angular.isArray(langKey)) {
          $fallbackWasString = false;
          $fallbackLanguage = langKey;
        }
        if (angular.isString($preferredLanguage) && indexOf($fallbackLanguage, $preferredLanguage) < 0) {
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
    this.use = function (langKey) {
      if (langKey) {
        if (!$translationTable[langKey] && !$loaderFactory) {
          throw new Error('$translateProvider couldn\'t find translationTable for langKey: \'' + langKey + '\'');
        }
        $uses = langKey;
        return this;
      }
      return $uses;
    };
    var storageKey = function (key) {
      if (!key) {
        if ($storagePrefix) {
          return $storagePrefix + $storageKey;
        }
        return $storageKey;
      }
      $storageKey = key;
    };
    this.storageKey = storageKey;
    this.useUrlLoader = function (url, options) {
      return this.useLoader('$translateUrlLoader', angular.extend({ url: url }, options));
    };
    this.useStaticFilesLoader = function (options) {
      return this.useLoader('$translateStaticFilesLoader', options);
    };
    this.useLoader = function (loaderFactory, options) {
      $loaderFactory = loaderFactory;
      $loaderOptions = options || {};
      return this;
    };
    this.useLocalStorage = function () {
      return this.useStorage('$translateLocalStorage');
    };
    this.useCookieStorage = function () {
      return this.useStorage('$translateCookieStorage');
    };
    this.useStorage = function (storageFactory) {
      $storageFactory = storageFactory;
      return this;
    };
    this.storagePrefix = function (prefix) {
      if (!prefix) {
        return prefix;
      }
      $storagePrefix = prefix;
      return this;
    };
    this.useMissingTranslationHandlerLog = function () {
      return this.useMissingTranslationHandler('$translateMissingTranslationHandlerLog');
    };
    this.useMissingTranslationHandler = function (factory) {
      $missingTranslationHandlerFactory = factory;
      return this;
    };
    this.usePostCompiling = function (value) {
      $postCompilingEnabled = !!value;
      return this;
    };
    this.determinePreferredLanguage = function (fn) {
      var locale = fn && angular.isFunction(fn) ? fn() : getLocale();
      if (!$availableLanguageKeys.length) {
        $preferredLanguage = locale;
      } else {
        $preferredLanguage = negotiateLocale(locale);
      }
      return this;
    };
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
    this.useLoaderCache = function (cache) {
      if (cache === false) {
        loaderCache = undefined;
      } else if (cache === true) {
        loaderCache = true;
      } else if (typeof cache === 'undefined') {
        loaderCache = '$translationCache';
      } else if (cache) {
        loaderCache = cache;
      }
      return this;
    };
    this.$get = [
      '$log',
      '$injector',
      '$rootScope',
      '$q',
      function ($log, $injector, $rootScope, $q) {
        var Storage, defaultInterpolator = $injector.get($interpolationFactory || '$translateDefaultInterpolation'), pendingLoader = false, interpolatorHashMap = {}, langPromises = {}, fallbackIndex, startFallbackIteration;
        var $translate = function (translationId, interpolateParams, interpolationId) {
          if (angular.isArray(translationId)) {
            var translateAll = function (translationIds) {
              var results = {};
              var promises = [];
              var translate = function (translationId) {
                var deferred = $q.defer();
                var regardless = function (value) {
                  results[translationId] = value;
                  deferred.resolve([
                    translationId,
                    value
                  ]);
                };
                $translate(translationId, interpolateParams, interpolationId).then(regardless, regardless);
                return deferred.promise;
              };
              for (var i = 0, c = translationIds.length; i < c; i++) {
                promises.push(translate(translationIds[i]));
              }
              return $q.all(promises).then(function () {
                return results;
              });
            };
            return translateAll(translationId);
          }
          var deferred = $q.defer();
          if (translationId) {
            translationId = trim.apply(translationId);
          }
          var promiseToWaitFor = function () {
              var promise = $preferredLanguage ? langPromises[$preferredLanguage] : langPromises[$uses];
              fallbackIndex = 0;
              if ($storageFactory && !promise) {
                var langKey = Storage.get($storageKey);
                promise = langPromises[langKey];
                if ($fallbackLanguage && $fallbackLanguage.length) {
                  var index = indexOf($fallbackLanguage, langKey);
                  fallbackIndex = index === 0 ? 1 : 0;
                  if (indexOf($fallbackLanguage, $preferredLanguage) < 0) {
                    $fallbackLanguage.push($preferredLanguage);
                  }
                }
              }
              return promise;
            }();
          if (!promiseToWaitFor) {
            determineTranslation(translationId, interpolateParams, interpolationId).then(deferred.resolve, deferred.reject);
          } else {
            promiseToWaitFor.then(function () {
              determineTranslation(translationId, interpolateParams, interpolationId).then(deferred.resolve, deferred.reject);
            }, deferred.reject);
          }
          return deferred.promise;
        };
        var applyNotFoundIndicators = function (translationId) {
          if ($notFoundIndicatorLeft) {
            translationId = [
              $notFoundIndicatorLeft,
              translationId
            ].join(' ');
          }
          if ($notFoundIndicatorRight) {
            translationId = [
              translationId,
              $notFoundIndicatorRight
            ].join(' ');
          }
          return translationId;
        };
        var useLanguage = function (key) {
          $uses = key;
          $rootScope.$emit('$translateChangeSuccess', { language: key });
          if ($storageFactory) {
            Storage.set($translate.storageKey(), $uses);
          }
          defaultInterpolator.setLocale($uses);
          angular.forEach(interpolatorHashMap, function (interpolator, id) {
            interpolatorHashMap[id].setLocale($uses);
          });
          $rootScope.$emit('$translateChangeEnd', { language: key });
        };
        var loadAsync = function (key) {
          if (!key) {
            throw 'No language key specified for loading.';
          }
          var deferred = $q.defer();
          $rootScope.$emit('$translateLoadingStart', { language: key });
          pendingLoader = true;
          var cache = loaderCache;
          if (typeof cache === 'string') {
            cache = $injector.get(cache);
          }
          var loaderOptions = angular.extend({}, $loaderOptions, {
              key: key,
              $http: angular.extend({}, { cache: cache }, $loaderOptions.$http)
            });
          $injector.get($loaderFactory)(loaderOptions).then(function (data) {
            var translationTable = {};
            $rootScope.$emit('$translateLoadingSuccess', { language: key });
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
            $rootScope.$emit('$translateLoadingEnd', { language: key });
          }, function (key) {
            $rootScope.$emit('$translateLoadingError', { language: key });
            deferred.reject(key);
            $rootScope.$emit('$translateLoadingEnd', { language: key });
          });
          return deferred.promise;
        };
        if ($storageFactory) {
          Storage = $injector.get($storageFactory);
          if (!Storage.get || !Storage.set) {
            throw new Error('Couldn\'t use storage \'' + $storageFactory + '\', missing get() or set() method!');
          }
        }
        if (angular.isFunction(defaultInterpolator.useSanitizeValueStrategy)) {
          defaultInterpolator.useSanitizeValueStrategy($interpolationSanitizationStrategy);
        }
        if ($interpolatorFactories.length) {
          angular.forEach($interpolatorFactories, function (interpolatorFactory) {
            var interpolator = $injector.get(interpolatorFactory);
            interpolator.setLocale($preferredLanguage || $uses);
            if (angular.isFunction(interpolator.useSanitizeValueStrategy)) {
              interpolator.useSanitizeValueStrategy($interpolationSanitizationStrategy);
            }
            interpolatorHashMap[interpolator.getInterpolationIdentifier()] = interpolator;
          });
        }
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
        var getFallbackTranslation = function (langKey, translationId, interpolateParams, Interpolator) {
          var deferred = $q.defer();
          getTranslationTable(langKey).then(function (translationTable) {
            if (Object.prototype.hasOwnProperty.call(translationTable, translationId)) {
              Interpolator.setLocale(langKey);
              deferred.resolve(Interpolator.interpolate(translationTable[translationId], interpolateParams));
              Interpolator.setLocale($uses);
            } else {
              deferred.reject();
            }
          }, deferred.reject);
          return deferred.promise;
        };
        var getFallbackTranslationInstant = function (langKey, translationId, interpolateParams, Interpolator) {
          var result, translationTable = $translationTable[langKey];
          if (Object.prototype.hasOwnProperty.call(translationTable, translationId)) {
            Interpolator.setLocale(langKey);
            result = Interpolator.interpolate(translationTable[translationId], interpolateParams);
            Interpolator.setLocale($uses);
          }
          return result;
        };
        var translateByHandler = function (translationId) {
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
        var resolveForFallbackLanguage = function (fallbackLanguageIndex, translationId, interpolateParams, Interpolator) {
          var deferred = $q.defer();
          if (fallbackLanguageIndex < $fallbackLanguage.length) {
            var langKey = $fallbackLanguage[fallbackLanguageIndex];
            getFallbackTranslation(langKey, translationId, interpolateParams, Interpolator).then(deferred.resolve, function () {
              resolveForFallbackLanguage(fallbackLanguageIndex + 1, translationId, interpolateParams, Interpolator).then(deferred.resolve);
            });
          } else {
            deferred.resolve(translateByHandler(translationId));
          }
          return deferred.promise;
        };
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
        var fallbackTranslation = function (translationId, interpolateParams, Interpolator) {
          return resolveForFallbackLanguage(startFallbackIteration > 0 ? startFallbackIteration : fallbackIndex, translationId, interpolateParams, Interpolator);
        };
        var fallbackTranslationInstant = function (translationId, interpolateParams, Interpolator) {
          return resolveForFallbackLanguageInstant(startFallbackIteration > 0 ? startFallbackIteration : fallbackIndex, translationId, interpolateParams, Interpolator);
        };
        var determineTranslation = function (translationId, interpolateParams, interpolationId) {
          var deferred = $q.defer();
          var table = $uses ? $translationTable[$uses] : $translationTable, Interpolator = interpolationId ? interpolatorHashMap[interpolationId] : defaultInterpolator;
          if (table && Object.prototype.hasOwnProperty.call(table, translationId)) {
            var translation = table[translationId];
            if (translation.substr(0, 2) === '@:') {
              $translate(translation.substr(2), interpolateParams, interpolationId).then(deferred.resolve, deferred.reject);
            } else {
              deferred.resolve(Interpolator.interpolate(translation, interpolateParams));
            }
          } else {
            var missingTranslationHandlerTranslation;
            if ($missingTranslationHandlerFactory && !pendingLoader) {
              missingTranslationHandlerTranslation = translateByHandler(translationId);
            }
            if ($uses && $fallbackLanguage && $fallbackLanguage.length) {
              fallbackTranslation(translationId, interpolateParams, Interpolator).then(function (translation) {
                deferred.resolve(translation);
              }, function (_translationId) {
                deferred.reject(applyNotFoundIndicators(_translationId));
              });
            } else if ($missingTranslationHandlerFactory && !pendingLoader && missingTranslationHandlerTranslation) {
              deferred.resolve(missingTranslationHandlerTranslation);
            } else {
              deferred.reject(applyNotFoundIndicators(translationId));
            }
          }
          return deferred.promise;
        };
        var determineTranslationInstant = function (translationId, interpolateParams, interpolationId) {
          var result, table = $uses ? $translationTable[$uses] : $translationTable, Interpolator = interpolationId ? interpolatorHashMap[interpolationId] : defaultInterpolator;
          if (table && Object.prototype.hasOwnProperty.call(table, translationId)) {
            var translation = table[translationId];
            if (translation.substr(0, 2) === '@:') {
              result = determineTranslationInstant(translation.substr(2), interpolateParams, interpolationId);
            } else {
              result = Interpolator.interpolate(translation, interpolateParams);
            }
          } else {
            var missingTranslationHandlerTranslation;
            if ($missingTranslationHandlerFactory && !pendingLoader) {
              missingTranslationHandlerTranslation = translateByHandler(translationId);
            }
            if ($uses && $fallbackLanguage && $fallbackLanguage.length) {
              fallbackIndex = 0;
              result = fallbackTranslationInstant(translationId, interpolateParams, Interpolator);
            } else if ($missingTranslationHandlerFactory && !pendingLoader && missingTranslationHandlerTranslation) {
              result = missingTranslationHandlerTranslation;
            } else {
              result = applyNotFoundIndicators(translationId);
            }
          }
          return result;
        };
        $translate.preferredLanguage = function (langKey) {
          if (langKey) {
            setupPreferredLanguage(langKey);
          }
          return $preferredLanguage;
        };
        $translate.cloakClassName = function () {
          return $cloakClassName;
        };
        $translate.fallbackLanguage = function (langKey) {
          if (langKey !== undefined && langKey !== null) {
            fallbackStack(langKey);
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
        $translate.proposedLanguage = function () {
          return $nextLang;
        };
        $translate.storage = function () {
          return Storage;
        };
        $translate.use = function (key) {
          if (!key) {
            return $uses;
          }
          var deferred = $q.defer();
          $rootScope.$emit('$translateChangeStart', { language: key });
          var aliasedKey = negotiateLocale(key);
          if (aliasedKey) {
            key = aliasedKey;
          }
          if (!$translationTable[key] && $loaderFactory && !langPromises[key]) {
            $nextLang = key;
            langPromises[key] = loadAsync(key).then(function (translation) {
              translations(translation.key, translation.table);
              deferred.resolve(translation.key);
              useLanguage(translation.key);
              if ($nextLang === key) {
                $nextLang = undefined;
              }
            }, function (key) {
              if ($nextLang === key) {
                $nextLang = undefined;
              }
              $rootScope.$emit('$translateChangeError', { language: key });
              deferred.reject(key);
              $rootScope.$emit('$translateChangeEnd', { language: key });
            });
          } else {
            deferred.resolve(key);
            useLanguage(key);
          }
          return deferred.promise;
        };
        $translate.storageKey = function () {
          return storageKey();
        };
        $translate.isPostCompilingEnabled = function () {
          return $postCompilingEnabled;
        };
        $translate.refresh = function (langKey) {
          if (!$loaderFactory) {
            throw new Error('Couldn\'t refresh translation table, no loader registered!');
          }
          var deferred = $q.defer();
          function resolve() {
            deferred.resolve();
            $rootScope.$emit('$translateRefreshEnd', { language: langKey });
          }
          function reject() {
            deferred.reject();
            $rootScope.$emit('$translateRefreshEnd', { language: langKey });
          }
          $rootScope.$emit('$translateRefreshStart', { language: langKey });
          if (!langKey) {
            var tables = [], loadingKeys = {};
            if ($fallbackLanguage && $fallbackLanguage.length) {
              for (var i = 0, len = $fallbackLanguage.length; i < len; i++) {
                tables.push(loadAsync($fallbackLanguage[i]));
                loadingKeys[$fallbackLanguage[i]] = true;
              }
            }
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
        $translate.instant = function (translationId, interpolateParams, interpolationId) {
          if (translationId === null || angular.isUndefined(translationId)) {
            return translationId;
          }
          if (angular.isArray(translationId)) {
            var results = {};
            for (var i = 0, c = translationId.length; i < c; i++) {
              results[translationId[i]] = $translate.instant(translationId[i], interpolateParams, interpolationId);
            }
            return results;
          }
          if (angular.isString(translationId) && translationId.length < 1) {
            return translationId;
          }
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
              }
            }
            if (typeof result !== 'undefined') {
              break;
            }
          }
          if (!result && result !== '') {
            result = defaultInterpolator.interpolate(translationId, interpolateParams);
            if ($missingTranslationHandlerFactory && !pendingLoader) {
              result = translateByHandler(translationId);
            }
          }
          return result;
        };
        $translate.versionInfo = function () {
          return version;
        };
        $translate.loaderCache = function () {
          return loaderCache;
        };
        if ($loaderFactory) {
          if (angular.equals($translationTable, {})) {
            $translate.use($translate.use());
          }
          if ($fallbackLanguage && $fallbackLanguage.length) {
            var processAsyncResult = function (translation) {
              translations(translation.key, translation.table);
              $rootScope.$emit('$translateChangeEnd', { language: translation.key });
            };
            for (var i = 0, len = $fallbackLanguage.length; i < len; i++) {
              langPromises[$fallbackLanguage[i]] = loadAsync($fallbackLanguage[i]).then(processAsyncResult);
            }
          }
        }
        return $translate;
      }
    ];
  }
]);
angular.module('pascalprecht.translate').factory('$translateDefaultInterpolation', [
  '$interpolate',
  function ($interpolate) {
    var $translateInterpolator = {}, $locale, $identifier = 'default', $sanitizeValueStrategy = null, sanitizeValueStrategies = {
        escaped: function (params) {
          var result = {};
          for (var key in params) {
            if (Object.prototype.hasOwnProperty.call(params, key)) {
              result[key] = angular.element('<div></div>').text(params[key]).html();
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
    $translateInterpolator.setLocale = function (locale) {
      $locale = locale;
    };
    $translateInterpolator.getInterpolationIdentifier = function () {
      return $identifier;
    };
    $translateInterpolator.useSanitizeValueStrategy = function (value) {
      $sanitizeValueStrategy = value;
      return this;
    };
    $translateInterpolator.interpolate = function (string, interpolateParams) {
      if ($sanitizeValueStrategy) {
        interpolateParams = sanitizeParams(interpolateParams);
      }
      return $interpolate(string)(interpolateParams || {});
    };
    return $translateInterpolator;
  }
]);
angular.module('pascalprecht.translate').constant('$STORAGE_KEY', 'NG_TRANSLATE_LANG_KEY');
angular.module('pascalprecht.translate').directive('translate', [
  '$translate',
  '$q',
  '$interpolate',
  '$compile',
  '$parse',
  '$rootScope',
  function ($translate, $q, $interpolate, $compile, $parse, $rootScope) {
    return {
      restrict: 'AE',
      scope: true,
      compile: function (tElement, tAttr) {
        var translateValuesExist = tAttr.translateValues ? tAttr.translateValues : undefined;
        var translateInterpolation = tAttr.translateInterpolation ? tAttr.translateInterpolation : undefined;
        var translateValueExist = tElement[0].outerHTML.match(/translate-value-+/i);
        var interpolateRegExp = '^(.*)(' + $interpolate.startSymbol() + '.*' + $interpolate.endSymbol() + ')(.*)';
        return function linkFn(scope, iElement, iAttr) {
          scope.interpolateParams = {};
          scope.preText = '';
          scope.postText = '';
          iAttr.$observe('translate', function (translationId) {
            if (angular.equals(translationId, '') || !angular.isDefined(translationId)) {
              var interpolateMatches = iElement.text().match(interpolateRegExp);
              if (angular.isArray(interpolateMatches)) {
                scope.preText = interpolateMatches[1];
                scope.postText = interpolateMatches[3];
                scope.translationId = $interpolate(interpolateMatches[2])(scope.$parent);
              } else {
                scope.translationId = iElement.text().replace(/^\s+|\s+$/g, '');
              }
            } else {
              scope.translationId = translationId;
            }
          });
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
            var fn = function (attrName) {
              iAttr.$observe(attrName, function (value) {
                scope.interpolateParams[angular.lowercase(attrName.substr(14, 1)) + attrName.substr(15)] = value;
              });
            };
            for (var attr in iAttr) {
              if (Object.prototype.hasOwnProperty.call(iAttr, attr) && attr.substr(0, 14) === 'translateValue' && attr !== 'translateValues') {
                fn(attr);
              }
            }
          }
          var applyElementContent = function (value, scope, successful) {
            if (!successful && typeof scope.defaultText !== 'undefined') {
              value = scope.defaultText;
            }
            iElement.html(scope.preText + value + scope.postText);
            var globallyEnabled = $translate.isPostCompilingEnabled();
            var locallyDefined = typeof tAttr.translateCompile !== 'undefined';
            var locallyEnabled = locallyDefined && tAttr.translateCompile !== 'false';
            if (globallyEnabled && !locallyDefined || locallyEnabled) {
              $compile(iElement.contents())(scope);
            }
          };
          var updateTranslationFn = function () {
              if (!translateValuesExist && !translateValueExist) {
                return function () {
                  var unwatch = scope.$watch('translationId', function (value) {
                      if (scope.translationId && value) {
                        $translate(value, {}, translateInterpolation).then(function (translation) {
                          applyElementContent(translation, scope, true);
                          unwatch();
                        }, function (translationId) {
                          applyElementContent(translationId, scope, false);
                          unwatch();
                        });
                      }
                    }, true);
                };
              } else {
                return function () {
                  var updateTranslations = function () {
                    if (scope.translationId && scope.interpolateParams) {
                      $translate(scope.translationId, scope.interpolateParams, translateInterpolation).then(function (translation) {
                        applyElementContent(translation, scope, true);
                      }, function (translationId) {
                        applyElementContent(translationId, scope, false);
                      });
                    }
                  };
                  scope.$watch('interpolateParams', updateTranslations, true);
                  scope.$watch('translationId', updateTranslations);
                };
              }
            }();
          var unbind = $rootScope.$on('$translateChangeSuccess', updateTranslationFn);
          updateTranslationFn();
          scope.$on('$destroy', unbind);
        };
      }
    };
  }
]);
angular.module('pascalprecht.translate').directive('translateCloak', [
  '$rootScope',
  '$translate',
  function ($rootScope, $translate) {
    return {
      compile: function (tElement) {
        var applyCloak = function () {
            tElement.addClass($translate.cloakClassName());
          }, removeCloak = function () {
            tElement.removeClass($translate.cloakClassName());
          }, removeListener = $rootScope.$on('$translateChangeEnd', function () {
            removeCloak();
            removeListener();
            removeListener = null;
          });
        applyCloak();
        return function linkFn(scope, iElement, iAttr) {
          if (iAttr.translateCloak && iAttr.translateCloak.length) {
            iAttr.$observe('translateCloak', function (translationId) {
              $translate(translationId).then(removeCloak, applyCloak);
            });
          }
        };
      }
    };
  }
]);
angular.module('pascalprecht.translate').filter('translate', [
  '$parse',
  '$translate',
  function ($parse, $translate) {
    var translateFilter = function (translationId, interpolateParams, interpolation) {
      if (!angular.isObject(interpolateParams)) {
        interpolateParams = $parse(interpolateParams)(this);
      }
      return $translate.instant(translationId, interpolateParams, interpolation);
    };
    translateFilter.$stateful = true;
    return translateFilter;
  }
]);
},{}],"/Users/sbellity/code/h/ships/instant/node_modules/objectpath/index.js":[function(require,module,exports){
module.exports = require('./lib/ObjectPath.js').ObjectPath;

},{"./lib/ObjectPath.js":"/Users/sbellity/code/h/ships/instant/node_modules/objectpath/lib/ObjectPath.js"}],"/Users/sbellity/code/h/ships/instant/node_modules/objectpath/lib/ObjectPath.js":[function(require,module,exports){
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
},{}],"/Users/sbellity/code/h/ships/instant/node_modules/tv4/tv4.js":[function(require,module,exports){
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
},{}],"/Users/sbellity/code/h/ships/instant/src/javascript/instant.js":[function(require,module,exports){
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
    Hull.api.put(AppState.form.id + "/submit", { data: data }).then(function(form) {
      AppState.form = form;
      emitChange({ changed: 'form' });
    }, function(err) {
      emitChange({ error_message: 'invalid_form', error: err });
    });
  }

  function play(provider) {
    if (userCanPlay()) {
      emitChange({ changed: 'loading', loading: 'badge' });
      return Hull.api.post(AppState.achievement.id + "/achieve").then(function(badge) {
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

  Hull.on('hull.auth.login',  onAuthEvent);
  Hull.on('hull.auth.logout', onAuthEvent);
  Hull.on('hull.auth.fail', onAuthEvent);

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
    Hull.off('hull.auth.fail', onAuthEvent);
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
  this.translate    = translate;

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

},{"./util":"/Users/sbellity/code/h/ships/instant/src/javascript/util.js"}],"/Users/sbellity/code/h/ships/instant/src/javascript/schema-form/foundation-decorator-datepicker.js":[function(require,module,exports){
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

},{}],"/Users/sbellity/code/h/ships/instant/src/javascript/schema-form/foundation-decorator.js":[function(require,module,exports){
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

},{"./foundation-decorator-datepicker":"/Users/sbellity/code/h/ships/instant/src/javascript/schema-form/foundation-decorator-datepicker.js"}],"/Users/sbellity/code/h/ships/instant/src/javascript/util.js":[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvamF2YXNjcmlwdC9hcHAuanMiLCJub2RlX21vZHVsZXMvYW5ndWxhci1kYXRlcGlja2VyL2J1aWxkL2FuZ3VsYXItZGF0ZXBpY2tlci5qcyIsIm5vZGVfbW9kdWxlcy9hbmd1bGFyLXNjaGVtYS1mb3JtL2Rpc3Qvc2NoZW1hLWZvcm0uanMiLCJub2RlX21vZHVsZXMvYW5ndWxhci10cmFuc2xhdGUvZGlzdC9hbmd1bGFyLXRyYW5zbGF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9vYmplY3RwYXRoL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL29iamVjdHBhdGgvbGliL09iamVjdFBhdGguanMiLCJub2RlX21vZHVsZXMvdHY0L3R2NC5qcyIsInNyYy9qYXZhc2NyaXB0L2luc3RhbnQuanMiLCJzcmMvamF2YXNjcmlwdC9zY2hlbWEtZm9ybS9mb3VuZGF0aW9uLWRlY29yYXRvci1kYXRlcGlja2VyLmpzIiwic3JjL2phdmFzY3JpcHQvc2NoZW1hLWZvcm0vZm91bmRhdGlvbi1kZWNvcmF0b3IuanMiLCJzcmMvamF2YXNjcmlwdC91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3Q0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy83QkE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2psREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIEluc3RhbnRXaW4gPSByZXF1aXJlKCcuL2luc3RhbnQnKTtcbnZhciBTdGVwcyA9IEluc3RhbnRXaW4uU3RlcHM7XG52YXIgZGVmYXVsdFN0ZXAgPSBTdGVwc1swXTtcblxud2luZG93LnR2NCA9IHJlcXVpcmUoJ3R2NCcpO1xudmFyIE9iamVjdFBhdGggPSByZXF1aXJlKCdvYmplY3RwYXRoJyk7XG5cbnRyeSB7XG4gIGFuZ3VsYXIubW9kdWxlKCdPYmplY3RQYXRoJywgW10pLnByb3ZpZGVyKCdPYmplY3RQYXRoJywgZnVuY3Rpb24oKXtcbiAgICB0aGlzLnBhcnNlID0gT2JqZWN0UGF0aC5wYXJzZTtcbiAgICB0aGlzLnN0cmluZ2lmeSA9IE9iamVjdFBhdGguc3RyaW5naWZ5O1xuICAgIHRoaXMubm9ybWFsaXplID0gT2JqZWN0UGF0aC5ub3JtYWxpemU7XG4gICAgdGhpcy4kZ2V0ID0gZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBPYmplY3RQYXRoO1xuICAgIH07XG4gIH0pO1xufSBjYXRjaChlKSB7fVxuXG5yZXF1aXJlKCdhbmd1bGFyLXNjaGVtYS1mb3JtL2Rpc3Qvc2NoZW1hLWZvcm0nKTtcbnJlcXVpcmUoJy4vc2NoZW1hLWZvcm0vZm91bmRhdGlvbi1kZWNvcmF0b3InKTtcbnJlcXVpcmUoJy4vc2NoZW1hLWZvcm0vZm91bmRhdGlvbi1kZWNvcmF0b3ItZGF0ZXBpY2tlcicpO1xucmVxdWlyZSgnYW5ndWxhci1kYXRlcGlja2VyL2J1aWxkL2FuZ3VsYXItZGF0ZXBpY2tlcicpO1xucmVxdWlyZSgnYW5ndWxhci10cmFuc2xhdGUnKTtcblxudmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdodWxsLWluc3RhbnQnLCBbJ25nQW5pbWF0ZScsICdzY2hlbWFGb3JtJywgJ2FuZ3VsYXItZGF0ZXBpY2tlcicsICdwYXNjYWxwcmVjaHQudHJhbnNsYXRlJ10pXG5cbi5jb25maWcoW1wiJHRyYW5zbGF0ZVByb3ZpZGVyXCIsIGZ1bmN0aW9uICgkdHJhbnNsYXRlUHJvdmlkZXIpIHtcbiAgJHRyYW5zbGF0ZVByb3ZpZGVyLnVzZUxvYWRlcihcIiR0cmFuc2xhdGVTaGlwTG9hZGVyXCIpO1xuICAkdHJhbnNsYXRlUHJvdmlkZXIucHJlZmVycmVkTGFuZ3VhZ2UoXCJlblwiKTtcbn1dKVxuXG5cbi5mYWN0b3J5KFwiJGluc3RhbnRcIiwgW1wiJGh1bGxJbml0XCIsIGZ1bmN0aW9uKCRodWxsSW5pdCkge1xuICB2YXIgaW5zdGFudCA9IG5ldyBJbnN0YW50V2luKCRodWxsSW5pdC51c2VyLCAkaHVsbEluaXQuc2hpcCk7XG4gIHdpbmRvdy4kaW5zdGFudCA9IGluc3RhbnQ7XG4gIHJldHVybiBpbnN0YW50O1xufV0pXG5cbi5mYWN0b3J5KFwiJHRyYW5zbGF0ZVNoaXBMb2FkZXJcIiwgW1wiJHFcIiwgXCIkaW5zdGFudFwiLCBmdW5jdGlvbiAoJHEsICRpbnN0YW50KSB7XG4gIHJldHVybiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgZGVmZXJyZWQucmVzb2x2ZSgkaW5zdGFudC50cmFuc2xhdGUob3B0aW9ucy5rZXkpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbn1dKVxuXG4uZmFjdG9yeSgnJGh1bGxDb25maWcnLCBbJyRodWxsSW5pdCcsIGZ1bmN0aW9uKCRodWxsSW5pdCkge1xuXG4gIGZ1bmN0aW9uIGdldEF1dGhTZXJ2aWNlcygpIHtcbiAgICB2YXIgYXV0aCA9IEh1bGwuY29uZmlnKCdzZXJ2aWNlcycpLmF1dGggfHwge307XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKGF1dGgpLmZpbHRlcihmdW5jdGlvbihzKSB7IHJldHVybiBzICE9PSAnaHVsbCc7IH0pO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBnZXRBdXRoU2VydmljZXM6IGdldEF1dGhTZXJ2aWNlc1xuICB9O1xuXG59XSlcblxuXG4uZGlyZWN0aXZlKFwicHJvZ3Jlc3NcIiwgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogXCJBXCIsXG4gICAgc2NvcGU6IHsgc3RlcDogXCI9XCIsIHN0ZXBzOiBcIj1cIiwgc3RlcEluZGV4OiBcIj1cIiB9LFxuICAgIHRlbXBsYXRlVXJsOiBcImRpcmVjdGl2ZXMvcHJvZ3Jlc3MuaHRtbFwiLFxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSkge1xuICAgICAgJHNjb3BlLnByb2dyZXNzUmF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gMTAwICogKCRzY29wZS5zdGVwSW5kZXggKyAxKSAvICgkc2NvcGUuc3RlcHMubGVuZ3RoICsgMSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufSlcblxuLmRpcmVjdGl2ZShcInNwaW5uZXJcIiwgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogXCJFQVwiLFxuICAgIHNjb3BlOiB7IHNwaW5uaW5nOiBcIj1cIiB9LFxuICAgIHRlbXBsYXRlVXJsOiBcImRpcmVjdGl2ZXMvc3Bpbm5lci5odG1sXCJcbiAgfTtcbn0pXG5cbi5maWx0ZXIoJ2NhcGl0YWxpemUnLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGlucHV0LCBhbGwpIHtcbiAgICByZXR1cm4gKCEhaW5wdXQpID8gaW5wdXQucmVwbGFjZSgvKFteXFxXX10rW15cXHMtXSopICovZywgZnVuY3Rpb24odHh0KXsgcmV0dXJuIHR4dC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHR4dC5zdWJzdHIoMSkudG9Mb3dlckNhc2UoKTsgfSkgOiAnJztcbiAgfVxufSlcblxuLmNvbnRyb2xsZXIoJ0Zvcm1Db250cm9sbGVyJywgWyckc2NvcGUnLCAnJGluc3RhbnQnLCBmdW5jdGlvbigkc2NvcGUpIHtcbiAgJHNjb3BlLm1vZGVsID0ge307XG4gIHZhciBmaWVsZHMgPSAoJHNjb3BlLmluc3RhbnQuZm9ybSAmJiAkc2NvcGUuaW5zdGFudC5mb3JtLmZpZWxkc19saXN0KSB8fCBbXTtcbiAgYW5ndWxhci5mb3JFYWNoKGZpZWxkcywgZnVuY3Rpb24oZmllbGQpIHtcbiAgICAkc2NvcGUubW9kZWxbZmllbGQubmFtZV0gPSBmaWVsZC52YWx1ZTtcbiAgfSk7XG4gICRzY29wZS5zY2hlbWEgPSAkc2NvcGUuaW5zdGFudC5mb3JtLmZpZWxkc19zY2hlbWE7XG4gICRzY29wZS5mb3JtID0gW1xuICAgIHtcbiAgICAgIFwidHlwZVwiOiBcImZpZWxkc2V0XCIsXG4gICAgICBcInRpdGxlXCIgOiBcIkZvcm1cIixcbiAgICAgIFwiaXRlbXNcIiA6IFsgXCIqXCIgXSxcbiAgICB9LFxuICAgIHsgXCJ0eXBlXCI6IFwic3VibWl0XCIsIFwidGl0bGVcIjogXCJTYXZlXCIgfVxuICBdO1xuXG4gICRzY29wZS5vblN1Ym1pdCA9IGZ1bmN0aW9uKGZvcm0pIHtcbiAgICAvLyBGaXJzdCB3ZSBicm9hZGNhc3QgYW4gZXZlbnQgc28gYWxsIGZpZWxkcyB2YWxpZGF0ZSB0aGVtc2VsdmVzXG4gICAgJHNjb3BlLiRicm9hZGNhc3QoJ3NjaGVtYUZvcm1WYWxpZGF0ZScpO1xuXG4gICAgLy8gVGhlbiB3ZSBjaGVjayBpZiB0aGUgZm9ybSBpcyB2YWxpZFxuICAgIGlmIChmb3JtLiR2YWxpZCkge1xuICAgICAgJGluc3RhbnQuc3VibWl0Rm9ybSgkc2NvcGUubW9kZWwpO1xuICAgIH1cbiAgfVxufV0pXG5cbi5jb250cm9sbGVyKCdJbnN0YW50V2luQ29udHJvbGxlcicsWyckc2NvcGUnLCAnJGluc3RhbnQnLCAnJHRyYW5zbGF0ZScsICckaHVsbENvbmZpZycsXG4gIGZ1bmN0aW9uIEluc3RhbnRXaW5Db250cm9sbGVyKCRzY29wZSwgJGluc3RhbnQsICR0cmFuc2xhdGUsICRodWxsQ29uZmlnKSB7XG4gICAgJHNjb3BlLnN0eWxlcyAgID0ge307XG4gICAgJHNjb3BlLmxvZ2luICAgID0gSHVsbC5sb2dpbjtcbiAgICAkc2NvcGUubG9nb3V0ICAgPSBIdWxsLmxvZ291dDtcbiAgICAkc2NvcGUucGxheSAgICAgPSAkaW5zdGFudC5wbGF5O1xuXG4gICAgJHNjb3BlLnN0ZXBzID0gU3RlcHM7XG4gICAgJHNjb3BlLiRpbnN0YW50ICAgICAgID0gJGluc3RhbnQ7XG4gICAgJHNjb3BlLmluc3RhbnQgICAgICAgID0gJGluc3RhbnQuZ2V0U3RhdGUoKTtcbiAgICAkc2NvcGUuYXV0aFNlcnZpY2VzICAgPSAkaHVsbENvbmZpZy5nZXRBdXRoU2VydmljZXMoKTtcblxuICAgIGZ1bmN0aW9uIHNldFN0eWxlcyhzZXR0aW5ncykge1xuICAgICAgdmFyIHN0eWxlcyA9IHt9O1xuICAgICAgYW5ndWxhci5mb3JFYWNoKHNldHRpbmdzLmltYWdlcywgZnVuY3Rpb24oaW1nLCB0YXJnZXQpIHtcbiAgICAgICAgaWYgKGltZykge1xuICAgICAgICAgIHN0eWxlc1t0YXJnZXRdID0gc3R5bGVzW3RhcmdldF0gfHwge307XG4gICAgICAgICAgc3R5bGVzW3RhcmdldF0uYmFja2dyb3VuZEltYWdlID0gJ3VybCgnICsgaW1nICsgJyknO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgICRzY29wZS5zdHlsZXMgPSBzdHlsZXM7XG4gICAgfVxuXG4gICAgc2V0U3R5bGVzKCRzY29wZS5pbnN0YW50LnNldHRpbmdzKTtcblxuXG4gICAgZnVuY3Rpb24gb25DaGFuZ2UoaW5zdGFudCkge1xuICAgICAgJHNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcbiAgICAgICAgJHNjb3BlLmluc3RhbnQgPSBpbnN0YW50O1xuICAgICAgICBzZXRTdHlsZXMoaW5zdGFudC5zZXR0aW5ncyk7XG4gICAgICAgICR0cmFuc2xhdGUucmVmcmVzaCgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgJGluc3RhbnQub25DaGFuZ2Uob25DaGFuZ2UpO1xuICB9XG5dKTtcblxuXG5IdWxsLnJlYWR5KGZ1bmN0aW9uKF8sIGN1cnJlbnRVc2VyLCBzaGlwLCBvcmcpIHtcbiAgdmFyIEh1bGxJbml0ID0ge1xuICAgIHVzZXI6IGN1cnJlbnRVc2VyLFxuICAgIHNoaXA6IHNoaXAsXG4gICAgb3JnOiBvcmdcbiAgfTtcbiAgYXBwLnZhbHVlKCckaHVsbEluaXQnLCBIdWxsSW5pdCk7XG4gIGFuZ3VsYXIuYm9vdHN0cmFwKGRvY3VtZW50LCBbJ2h1bGwtaW5zdGFudCddKTtcbn0pO1xuIiwiLyohXG4gKiBwaWNrYWRhdGUuanMgdjMuNC4wLCAyMDE0LzAyLzE1XG4gKiBCeSBBbXN1bCwgaHR0cDovL2Ftc3VsLmNhXG4gKiBIb3N0ZWQgb24gaHR0cDovL2Ftc3VsLmdpdGh1Yi5pby9waWNrYWRhdGUuanNcbiAqIExpY2Vuc2VkIHVuZGVyIE1JVFxuICovXG4hZnVuY3Rpb24oYSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcInBpY2tlclwiLFtcImFuZ3VsYXJcIl0sYSk6dGhpcy5QaWNrZXI9YShhbmd1bGFyKX0oZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYihhLGQsZSxnKXtmdW5jdGlvbiBoKCl7cmV0dXJuIGIuXy5ub2RlKFwiZGl2XCIsYi5fLm5vZGUoXCJkaXZcIixiLl8ubm9kZShcImRpdlwiLGIuXy5ub2RlKFwiZGl2XCIsci5jb21wb25lbnQubm9kZXMoby5vcGVuKSxuLmJveCksbi53cmFwKSxuLmZyYW1lKSxuLmhvbGRlcil9ZnVuY3Rpb24gaSgpe3AuZGF0YShkLHIpLHAuYWRkQ2xhc3Mobi5pbnB1dCkscFswXS52YWx1ZT1wLmF0dHIoXCJkYXRhLXZhbHVlXCIpP3IuZ2V0KFwic2VsZWN0XCIsbS5mb3JtYXQpOmEudmFsdWUsYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIjXCIrby5pZCkpLm9uKFwiZm9jdXNcIixsKSxhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIiNcIitvLmlkKSkub24oXCJjbGlja1wiLGwpLG0uZWRpdGFibGV8fGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiI1wiK28uaWQpKS5vbihcImtleWRvd25cIixmdW5jdGlvbihhKXt2YXIgYj1hLmtleUNvZGUsYz0vXig4fDQ2KSQvLnRlc3QoYik7cmV0dXJuIDI3PT1iPyhyLmNsb3NlKCksITEpOnZvaWQoKDMyPT1ifHxjfHwhby5vcGVuJiZyLmNvbXBvbmVudC5rZXlbYl0pJiYoYS5wcmV2ZW50RGVmYXVsdCgpLGEuc3RvcFByb3BhZ2F0aW9uKCksYz9yLmNsZWFyKCkuY2xvc2UoKTpyLm9wZW4oKSkpfSksYyhhLHtoYXNwb3B1cDohMCxleHBhbmRlZDohMSxyZWFkb25seTohMSxvd25zOmEuaWQrXCJfcm9vdFwiKyhyLl9oaWRkZW4/XCIgXCIrci5faGlkZGVuLmlkOlwiXCIpfSl9ZnVuY3Rpb24gaigpe2Z1bmN0aW9uIGQoKXthbmd1bGFyLmVsZW1lbnQoci4kcm9vdFswXS5xdWVyeVNlbGVjdG9yQWxsKFwiW2RhdGEtcGlja10sIFtkYXRhLW5hdl0sIFtkYXRhLWNsZWFyXVwiKSkub24oXCJjbGlja1wiLGZ1bmN0aW9uKCl7dmFyIGM9YW5ndWxhci5lbGVtZW50KHRoaXMpLGU9Yy5oYXNDbGFzcyhuLm5hdkRpc2FibGVkKXx8Yy5oYXNDbGFzcyhuLmRpc2FibGVkKSxmPWRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7Zj1mJiYoZi50eXBlfHxmLmhyZWYpJiZmLChlfHxmJiYhci4kcm9vdFswXS5jb250YWlucyhmKSkmJmEuZm9jdXMoKSxjLmF0dHIoXCJkYXRhLW5hdlwiKSYmIWU/KHIuc2V0KFwiaGlnaGxpZ2h0XCIsci5jb21wb25lbnQuaXRlbS5oaWdobGlnaHQse25hdjpwYXJzZUludChjLmF0dHIoXCJkYXRhLW5hdlwiKSl9KSxkKCkpOmIuXy5pc0ludGVnZXIocGFyc2VJbnQoYy5hdHRyKFwiZGF0YS1waWNrXCIpKSkmJiFlPyhyLnNldChcInNlbGVjdFwiLHBhcnNlSW50KGMuYXR0cihcImRhdGEtcGlja1wiKSkpLmNsb3NlKCEwKSxkKCkpOmMuYXR0cihcImRhdGEtY2xlYXJcIikmJihyLmNsZWFyKCkuY2xvc2UoITApLGQoKSl9KX1yLiRyb290Lm9uKFwiZm9jdXNpblwiLGZ1bmN0aW9uKGEpe3IuJHJvb3QucmVtb3ZlQ2xhc3Mobi5mb2N1c2VkKSxjKHIuJHJvb3RbMF0sXCJzZWxlY3RlZFwiLCExKSxhLnN0b3BQcm9wYWdhdGlvbigpfSksci4kcm9vdC5vbihcIm1vdXNlZG93biBjbGlja1wiLGZ1bmN0aW9uKGIpe3ZhciBjPWIudGFyZ2V0O2MhPXIuJHJvb3QuY2hpbGRyZW4oKVswXSYmKGIuc3RvcFByb3BhZ2F0aW9uKCksXCJtb3VzZWRvd25cIj09Yi50eXBlJiZcImlucHV0XCIhPT1hbmd1bGFyLmVsZW1lbnQoYylbMF0udGFnTmFtZSYmXCJPUFRJT05cIiE9Yy5ub2RlTmFtZSYmKGIucHJldmVudERlZmF1bHQoKSxhLmZvY3VzKCkpKX0pLGQoKSxjKHIuJHJvb3RbMF0sXCJoaWRkZW5cIiwhMCl9ZnVuY3Rpb24gaygpe3ZhciBiPVtcInN0cmluZ1wiPT10eXBlb2YgbS5oaWRkZW5QcmVmaXg/bS5oaWRkZW5QcmVmaXg6XCJcIixcInN0cmluZ1wiPT10eXBlb2YgbS5oaWRkZW5TdWZmaXg/bS5oaWRkZW5TdWZmaXg6XCJfc3VibWl0XCJdO3IuX2hpZGRlbj1hbmd1bGFyLmVsZW1lbnQoJzxpbnB1dCB0eXBlPWhpZGRlbiBuYW1lPVwiJytiWzBdK2EubmFtZStiWzFdKydcImlkPVwiJytiWzBdK2EuaWQrYlsxXSsnXCInKyhwLmF0dHIoXCJkYXRhLXZhbHVlXCIpfHxhLnZhbHVlPycgdmFsdWU9XCInK3IuZ2V0KFwic2VsZWN0XCIsbS5mb3JtYXRTdWJtaXQpKydcIic6XCJcIikrXCI+XCIpWzBdLHAub24oXCJjaGFuZ2UuXCIrby5pZCxmdW5jdGlvbigpe3IuX2hpZGRlbi52YWx1ZT1hLnZhbHVlP3IuZ2V0KFwic2VsZWN0XCIsbS5mb3JtYXRTdWJtaXQpOlwiXCJ9KS5hZnRlcihyLl9oaWRkZW4pfWZ1bmN0aW9uIGwoYSl7YS5zdG9wUHJvcGFnYXRpb24oKSxcImZvY3VzXCI9PWEudHlwZSYmKHIuJHJvb3QuYWRkQ2xhc3Mobi5mb2N1c2VkKSxjKHIuJHJvb3RbMF0sXCJzZWxlY3RlZFwiLCEwKSksci5vcGVuKCl9aWYoIWEpcmV0dXJuIGI7dmFyIG07ZT8obT1lLmRlZmF1bHRzLGFuZ3VsYXIuZXh0ZW5kKG0sZykpOm09Z3x8e307dmFyIG49Yi5rbGFzc2VzKCk7YW5ndWxhci5leHRlbmQobixtLmtsYXNzKTt2YXIgbz17aWQ6YS5pZHx8XCJQXCIrTWF0aC5hYnMofn4oTWF0aC5yYW5kb20oKSpuZXcgRGF0ZSkpfSxwPWFuZ3VsYXIuZWxlbWVudChhKSxxPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuc3RhcnQoKX0scj1xLnByb3RvdHlwZT17Y29uc3RydWN0b3I6cSwkbm9kZTpwLHN0YXJ0OmZ1bmN0aW9uKCl7cmV0dXJuIG8mJm8uc3RhcnQ/cjooby5tZXRob2RzPXt9LG8uc3RhcnQ9ITAsby5vcGVuPSExLG8udHlwZT1hLnR5cGUsYS5hdXRvZm9jdXM9YT09ZG9jdW1lbnQuYWN0aXZlRWxlbWVudCxhLnR5cGU9XCJ0ZXh0XCIsYS5yZWFkT25seT0hbS5lZGl0YWJsZSxhLmlkPWEuaWR8fG8uaWQsci5jb21wb25lbnQ9bmV3IGUocixtKSxyLiRyb290PWFuZ3VsYXIuZWxlbWVudChiLl8ubm9kZShcImRpdlwiLGgoKSxuLnBpY2tlciwnaWQ9XCInK2EuaWQrJ19yb290XCInKSksaigpLG0uZm9ybWF0U3VibWl0JiZrKCksaSgpLG0uY29udGFpbmVyP2FuZ3VsYXIuZWxlbWVudChtLmNvbnRhaW5lcikuYXBwZW5kKHIuJHJvb3QpOnAuYWZ0ZXIoci4kcm9vdCksci5vbih7c3RhcnQ6ci5jb21wb25lbnQub25TdGFydCxyZW5kZXI6ci5jb21wb25lbnQub25SZW5kZXIsc3RvcDpyLmNvbXBvbmVudC5vblN0b3Asb3BlbjpyLmNvbXBvbmVudC5vbk9wZW4sY2xvc2U6ci5jb21wb25lbnQub25DbG9zZSxzZXQ6ci5jb21wb25lbnQub25TZXR9KS5vbih7c3RhcnQ6bS5vblN0YXJ0LHJlbmRlcjptLm9uUmVuZGVyLHN0b3A6bS5vblN0b3Asb3BlbjptLm9uT3BlbixjbG9zZTptLm9uQ2xvc2Usc2V0Om0ub25TZXR9KSxhLmF1dG9mb2N1cyYmci5vcGVuKCksci50cmlnZ2VyKFwic3RhcnRcIikudHJpZ2dlcihcInJlbmRlclwiKSl9LHJlbmRlcjpmdW5jdGlvbihhKXtyZXR1cm4gYT9yLiRyb290Lmh0bWwoaCgpKTphbmd1bGFyLmVsZW1lbnQoci4kcm9vdFswXS5xdWVyeVNlbGVjdG9yQWxsKFwiLlwiK24uYm94KSkuaHRtbChyLmNvbXBvbmVudC5ub2RlcyhvLm9wZW4pKSxyLnRyaWdnZXIoXCJyZW5kZXJcIil9LHN0b3A6ZnVuY3Rpb24oKXtyZXR1cm4gby5zdGFydD8oci5jbG9zZSgpLHIuX2hpZGRlbiYmci5faGlkZGVuLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoci5faGlkZGVuKSxyLiRyb290LnJlbW92ZSgpLHAucmVtb3ZlQ2xhc3Mobi5pbnB1dCkucmVtb3ZlRGF0YShkKSxzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7cC5vZmYoXCIuXCIrby5pZCl9LDApLGEudHlwZT1vLnR5cGUsYS5yZWFkT25seT0hMSxyLnRyaWdnZXIoXCJzdG9wXCIpLG8ubWV0aG9kcz17fSxvLnN0YXJ0PSExLHIpOnJ9LG9wZW46ZnVuY3Rpb24oZCl7cmV0dXJuIG8ub3Blbj9yOihwLmFkZENsYXNzKG4uYWN0aXZlKSxjKGEsXCJleHBhbmRlZFwiLCEwKSxyLiRyb290LmFkZENsYXNzKG4ub3BlbmVkKSxjKHIuJHJvb3RbMF0sXCJoaWRkZW5cIiwhMSksZCE9PSExJiYoby5vcGVuPSEwLHAudHJpZ2dlckhhbmRsZXIoXCJmb2N1c1wiKSxhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIiNcIitvLmlkKSkub24oXCJjbGljayBmb2N1c2luXCIsZnVuY3Rpb24oYil7dmFyIGM9Yi50YXJnZXQ7YyE9YSYmYyE9ZG9jdW1lbnQmJjMhPWIud2hpY2gmJnIuY2xvc2UoYz09PXIuJHJvb3QuY2hpbGRyZW4oKVswXSl9KSxhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIiNcIitvLmlkKSkub24oXCJrZXlkb3duXCIsZnVuY3Rpb24oYyl7dmFyIGQ9Yy5rZXlDb2RlLGU9ci5jb21wb25lbnQua2V5W2RdLGY9Yy50YXJnZXQ7Mjc9PWQ/ci5jbG9zZSghMCk6ZiE9YXx8IWUmJjEzIT1kP3IuJHJvb3RbMF0uY29udGFpbnMoZikmJjEzPT1kJiYoYy5wcmV2ZW50RGVmYXVsdCgpLGYuY2xpY2soKSk6KGMucHJldmVudERlZmF1bHQoKSxlP2IuXy50cmlnZ2VyKHIuY29tcG9uZW50LmtleS5nbyxyLFtiLl8udHJpZ2dlcihlKV0pOmFuZ3VsYXIuZWxlbWVudChyLiRyb290WzBdLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuXCIrbi5oaWdobGlnaHRlZCkpLmhhc0NsYXNzKG4uZGlzYWJsZWQpfHxyLnNldChcInNlbGVjdFwiLHIuY29tcG9uZW50Lml0ZW0uaGlnaGxpZ2h0KS5jbG9zZSgpKX0pKSxyLnRyaWdnZXIoXCJvcGVuXCIpKX0sY2xvc2U6ZnVuY3Rpb24oYil7cmV0dXJuIGImJihwLm9mZihcImZvY3VzLlwiK28uaWQpLHAudHJpZ2dlckhhbmRsZXIoXCJmb2N1c1wiKSxzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7YW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIjXCIrby5pZCkpLm9uKFwiZm9jdXNcIixsKX0sMCkpLHAucmVtb3ZlQ2xhc3Mobi5hY3RpdmUpLGMoYSxcImV4cGFuZGVkXCIsITEpLHIuJHJvb3QucmVtb3ZlQ2xhc3Mobi5vcGVuZWQrXCIgXCIrbi5mb2N1c2VkKSxjKHIuJHJvb3RbMF0sXCJoaWRkZW5cIiwhMCksYyhyLiRyb290WzBdLFwic2VsZWN0ZWRcIiwhMSksby5vcGVuPyhzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7by5vcGVuPSExfSwxZTMpLGYub2ZmKFwiLlwiK28uaWQpLHIudHJpZ2dlcihcImNsb3NlXCIpKTpyfSxjbGVhcjpmdW5jdGlvbigpe3JldHVybiByLnNldChcImNsZWFyXCIpfSxzZXQ6ZnVuY3Rpb24oYSxiLGMpe3ZhciBkLGUsZj1hbmd1bGFyLmlzT2JqZWN0KGEpLGc9Zj9hOnt9O2lmKGM9ZiYmYW5ndWxhci5pc09iamVjdChiKT9iOmN8fHt9LGEpe2Z8fChnW2FdPWIpO2ZvcihkIGluIGcpZT1nW2RdLGQgaW4gci5jb21wb25lbnQuaXRlbSYmci5jb21wb25lbnQuc2V0KGQsZSxjKSwoXCJzZWxlY3RcIj09ZHx8XCJjbGVhclwiPT1kKSYmKHBbMF0udmFsdWU9XCJjbGVhclwiPT1kP1wiXCI6ci5nZXQoZCxtLmZvcm1hdCkscC50cmlnZ2VySGFuZGxlcihcImNoYW5nZVwiKSk7ci5yZW5kZXIoKX1yZXR1cm4gYy5tdXRlZD9yOnIudHJpZ2dlcihcInNldFwiLGcpfSxnZXQ6ZnVuY3Rpb24oYyxkKXtyZXR1cm4gYz1jfHxcInZhbHVlXCIsbnVsbCE9b1tjXT9vW2NdOlwidmFsdWVcIj09Yz9hLnZhbHVlOmMgaW4gci5jb21wb25lbnQuaXRlbT9cInN0cmluZ1wiPT10eXBlb2YgZD9iLl8udHJpZ2dlcihyLmNvbXBvbmVudC5mb3JtYXRzLnRvU3RyaW5nLHIuY29tcG9uZW50LFtkLHIuY29tcG9uZW50LmdldChjKV0pOnIuY29tcG9uZW50LmdldChjKTp2b2lkIDB9LG9uOmZ1bmN0aW9uKGEsYil7dmFyIGMsZCxlPWFuZ3VsYXIuaXNPYmplY3QoYSksZj1lP2E6e307aWYoYSl7ZXx8KGZbYV09Yik7Zm9yKGMgaW4gZilkPWZbY10sby5tZXRob2RzW2NdPW8ubWV0aG9kc1tjXXx8W10sby5tZXRob2RzW2NdLnB1c2goZCl9cmV0dXJuIHJ9LG9mZjpmdW5jdGlvbigpe3ZhciBhLGIsYz1hcmd1bWVudHM7Zm9yKGE9MCxuYW1lc0NvdW50PWMubGVuZ3RoO25hbWVzQ291bnQ+YTthKz0xKWI9Y1thXSxiIGluIG8ubWV0aG9kcyYmZGVsZXRlIG8ubWV0aG9kc1tiXTtyZXR1cm4gcn0sdHJpZ2dlcjpmdW5jdGlvbihhLGMpe3ZhciBkPW8ubWV0aG9kc1thXTtyZXR1cm4gZCYmZC5tYXAoZnVuY3Rpb24oYSl7Yi5fLnRyaWdnZXIoYSxyLFtjXSl9KSxyfX07cmV0dXJuIG5ldyBxfWZ1bmN0aW9uIGMoYSxiLGMpe2lmKGFuZ3VsYXIuaXNPYmplY3QoYikpZm9yKHZhciBlIGluIGIpZChhLGUsYltlXSk7ZWxzZSBkKGEsYixjKX1mdW5jdGlvbiBkKGEsYixjKXthbmd1bGFyLmVsZW1lbnQoYSkuYXR0cigoXCJyb2xlXCI9PWI/XCJcIjpcImFyaWEtXCIpK2IsYyl9ZnVuY3Rpb24gZShhLGIpe2FuZ3VsYXIuaXNPYmplY3QoYSl8fChhPXthdHRyaWJ1dGU6Yn0pLGI9XCJcIjtmb3IodmFyIGMgaW4gYSl7dmFyIGQ9KFwicm9sZVwiPT1jP1wiXCI6XCJhcmlhLVwiKStjLGU9YVtjXTtiKz1udWxsPT1lP1wiXCI6ZCsnPVwiJythW2NdKydcIid9cmV0dXJuIGJ9dmFyIGY9YW5ndWxhci5lbGVtZW50KGRvY3VtZW50KTtyZXR1cm4gYi5rbGFzc2VzPWZ1bmN0aW9uKGEpe3JldHVybiBhPWF8fFwicGlja2VyXCIse3BpY2tlcjphLG9wZW5lZDphK1wiLS1vcGVuZWRcIixmb2N1c2VkOmErXCItLWZvY3VzZWRcIixpbnB1dDphK1wiX19pbnB1dFwiLGFjdGl2ZTphK1wiX19pbnB1dC0tYWN0aXZlXCIsaG9sZGVyOmErXCJfX2hvbGRlclwiLGZyYW1lOmErXCJfX2ZyYW1lXCIsd3JhcDphK1wiX193cmFwXCIsYm94OmErXCJfX2JveFwifX0sYi5fPXtncm91cDpmdW5jdGlvbihhKXtmb3IodmFyIGMsZD1cIlwiLGU9Yi5fLnRyaWdnZXIoYS5taW4sYSk7ZTw9Yi5fLnRyaWdnZXIoYS5tYXgsYSxbZV0pO2UrPWEuaSljPWIuXy50cmlnZ2VyKGEuaXRlbSxhLFtlXSksZCs9Yi5fLm5vZGUoYS5ub2RlLGNbMF0sY1sxXSxjWzJdKTtyZXR1cm4gZH0sbm9kZTpmdW5jdGlvbihiLGMsZCxlKXtyZXR1cm4gYz8oYz1hLmlzQXJyYXkoYyk/Yy5qb2luKFwiXCIpOmMsZD1kPycgY2xhc3M9XCInK2QrJ1wiJzpcIlwiLGU9ZT9cIiBcIitlOlwiXCIsXCI8XCIrYitkK2UrXCI+XCIrYytcIjwvXCIrYitcIj5cIik6XCJcIn0sbGVhZDpmdW5jdGlvbihhKXtyZXR1cm4oMTA+YT9cIjBcIjpcIlwiKSthfSx0cmlnZ2VyOmZ1bmN0aW9uKGEsYixjKXtyZXR1cm5cImZ1bmN0aW9uXCI9PXR5cGVvZiBhP2EuYXBwbHkoYixjfHxbXSk6YX0sZGlnaXRzOmZ1bmN0aW9uKGEpe3JldHVybi9cXGQvLnRlc3QoYVsxXSk/MjoxfSxpc0RhdGU6ZnVuY3Rpb24oYSl7cmV0dXJue30udG9TdHJpbmcuY2FsbChhKS5pbmRleE9mKFwiRGF0ZVwiKT4tMSYmdGhpcy5pc0ludGVnZXIoYS5nZXREYXRlKCkpfSxpc0ludGVnZXI6ZnVuY3Rpb24oYSl7cmV0dXJue30udG9TdHJpbmcuY2FsbChhKS5pbmRleE9mKFwiTnVtYmVyXCIpPi0xJiZhJTE9PT0wfSxhcmlhQXR0cjplfSxiLmV4dGVuZD1mdW5jdGlvbihhLGMpe2FuZ3VsYXIuZWxlbWVudC5wcm90b3R5cGVbYV09ZnVuY3Rpb24oZCxlKXt2YXIgZj10aGlzLmRhdGEoYSk7aWYoXCJwaWNrZXJcIj09ZClyZXR1cm4gZjtpZihmJiZcInN0cmluZ1wiPT10eXBlb2YgZClyZXR1cm4gYi5fLnRyaWdnZXIoZltkXSxmLFtlXSksdGhpcztmb3IodmFyIGc9MDtnPHRoaXMubGVuZ3RoO2crKyl7dmFyIGg9YW5ndWxhci5lbGVtZW50KHRoaXNbZ10pO2guZGF0YShhKXx8bmV3IGIoaFswXSxhLGMsZCl9fSxhbmd1bGFyLmVsZW1lbnQucHJvdG90eXBlW2FdLmRlZmF1bHRzPWMuZGVmYXVsdHN9LGJ9KTtcbi8qIVxuICogRGF0ZSBwaWNrZXIgZm9yIHBpY2thZGF0ZS5qcyB2My40LjBcbiAqIGh0dHA6Ly9hbXN1bC5naXRodWIuaW8vcGlja2FkYXRlLmpzL2RhdGUuaHRtXG4gKi9cbiFmdW5jdGlvbihhKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtcInBpY2tlclwiLFwiYW5ndWxhclwiXSxhKTphKFBpY2tlcixhbmd1bGFyKX0oZnVuY3Rpb24oYSxiKXtmdW5jdGlvbiBjKGEsYyl7dmFyIGQ9dGhpcyxlPWEuJG5vZGVbMF0udmFsdWUsZj1hLiRub2RlLmF0dHIoXCJkYXRhLXZhbHVlXCIpLGc9Znx8ZSxoPWY/Yy5mb3JtYXRTdWJtaXQ6Yy5mb3JtYXQsaT1mdW5jdGlvbigpe3JldHVyblwicnRsXCI9PT1nZXRDb21wdXRlZFN0eWxlKGEuJHJvb3RbMF0pLmRpcmVjdGlvbn07ZC5zZXR0aW5ncz1jLGQuJG5vZGU9YS4kbm9kZSxkLnF1ZXVlPXttaW46XCJtZWFzdXJlIGNyZWF0ZVwiLG1heDpcIm1lYXN1cmUgY3JlYXRlXCIsbm93Olwibm93IGNyZWF0ZVwiLHNlbGVjdDpcInBhcnNlIGNyZWF0ZSB2YWxpZGF0ZVwiLGhpZ2hsaWdodDpcInBhcnNlIG5hdmlnYXRlIGNyZWF0ZSB2YWxpZGF0ZVwiLHZpZXc6XCJwYXJzZSBjcmVhdGUgdmFsaWRhdGUgdmlld3NldFwiLGRpc2FibGU6XCJkZWFjdGl2YXRlXCIsZW5hYmxlOlwiYWN0aXZhdGVcIn0sZC5pdGVtPXt9LGQuaXRlbS5kaXNhYmxlPShjLmRpc2FibGV8fFtdKS5zbGljZSgwKSxkLml0ZW0uZW5hYmxlPS1mdW5jdGlvbihhKXtyZXR1cm4gYVswXT09PSEwP2Euc2hpZnQoKTotMX0oZC5pdGVtLmRpc2FibGUpLGQuc2V0KFwibWluXCIsYy5taW4pLnNldChcIm1heFwiLGMubWF4KS5zZXQoXCJub3dcIiksZz9kLnNldChcInNlbGVjdFwiLGcse2Zvcm1hdDpoLGZyb21WYWx1ZTohIWV9KTpkLnNldChcInNlbGVjdFwiLG51bGwpLnNldChcImhpZ2hsaWdodFwiLGQuaXRlbS5ub3cpLGQua2V5PXs0MDo3LDM4Oi03LDM5OmZ1bmN0aW9uKCl7cmV0dXJuIGkoKT8tMToxfSwzNzpmdW5jdGlvbigpe3JldHVybiBpKCk/MTotMX0sZ286ZnVuY3Rpb24oYSl7dmFyIGI9ZC5pdGVtLmhpZ2hsaWdodCxjPW5ldyBEYXRlKGIueWVhcixiLm1vbnRoLGIuZGF0ZSthKTtkLnNldChcImhpZ2hsaWdodFwiLFtjLmdldEZ1bGxZZWFyKCksYy5nZXRNb250aCgpLGMuZ2V0RGF0ZSgpXSx7aW50ZXJ2YWw6YX0pLHRoaXMucmVuZGVyKCl9fSxhLm9uKFwicmVuZGVyXCIsZnVuY3Rpb24oKXtiLmVsZW1lbnQoYS4kcm9vdFswXS5xdWVyeVNlbGVjdG9yQWxsKFwiLlwiK2Mua2xhc3Muc2VsZWN0TW9udGgpKS5vbihcImNoYW5nZVwiLGZ1bmN0aW9uKCl7dmFyIGQ9dGhpcy52YWx1ZTtkJiYoYS5zZXQoXCJoaWdobGlnaHRcIixbYS5nZXQoXCJ2aWV3XCIpLnllYXIsZCxhLmdldChcImhpZ2hsaWdodFwiKS5kYXRlXSksYi5lbGVtZW50KGEuJHJvb3RbMF0ucXVlcnlTZWxlY3RvckFsbChcIi5cIitjLmtsYXNzLnNlbGVjdE1vbnRoKSkudHJpZ2dlckhhbmRsZXIoXCJmb2N1c1wiKSl9KSxiLmVsZW1lbnQoYS4kcm9vdFswXS5xdWVyeVNlbGVjdG9yQWxsKFwiLlwiK2Mua2xhc3Muc2VsZWN0WWVhcikpLm9uKFwiY2hhbmdlXCIsZnVuY3Rpb24oKXt2YXIgZD10aGlzLnZhbHVlO2QmJihhLnNldChcImhpZ2hsaWdodFwiLFtkLGEuZ2V0KFwidmlld1wiKS5tb250aCxhLmdldChcImhpZ2hsaWdodFwiKS5kYXRlXSksYi5lbGVtZW50KGEuJHJvb3RbMF0ucXVlcnlTZWxlY3RvckFsbChcIi5cIitjLmtsYXNzLnNlbGVjdFllYXIpKS50cmlnZ2VySGFuZGxlcihcImZvY3VzXCIpKX0pfSkub24oXCJvcGVuXCIsZnVuY3Rpb24oKXtiLmVsZW1lbnQoYS4kcm9vdFswXS5xdWVyeVNlbGVjdG9yQWxsKFwiYnV0dG9uLCBzZWxlY3RcIikpLmF0dHIoXCJkaXNhYmxlZFwiLCExKX0pLm9uKFwiY2xvc2VcIixmdW5jdGlvbigpe2IuZWxlbWVudChhLiRyb290WzBdLnF1ZXJ5U2VsZWN0b3JBbGwoXCJidXR0b24sIHNlbGVjdFwiKSkuYXR0cihcImRpc2FibGVkXCIsITApfSl9dmFyIGQ9NyxlPTYsZj1hLl87Yy5wcm90b3R5cGUuc2V0PWZ1bmN0aW9uKGEsYixjKXt2YXIgZD10aGlzLGU9ZC5pdGVtO3JldHVybiBudWxsPT09Yj8oZVthXT1iLGQpOihlW1wiZW5hYmxlXCI9PWE/XCJkaXNhYmxlXCI6XCJmbGlwXCI9PWE/XCJlbmFibGVcIjphXT1kLnF1ZXVlW2FdLnNwbGl0KFwiIFwiKS5tYXAoZnVuY3Rpb24oZSl7cmV0dXJuIGI9ZFtlXShhLGIsYyl9KS5wb3AoKSxcInNlbGVjdFwiPT1hP2Quc2V0KFwiaGlnaGxpZ2h0XCIsZS5zZWxlY3QsYyk6XCJoaWdobGlnaHRcIj09YT9kLnNldChcInZpZXdcIixlLmhpZ2hsaWdodCxjKTphLm1hdGNoKC9eKGZsaXB8bWlufG1heHxkaXNhYmxlfGVuYWJsZSkkLykmJihlLnNlbGVjdCYmZC5kaXNhYmxlZChlLnNlbGVjdCkmJmQuc2V0KFwic2VsZWN0XCIsZS5zZWxlY3QsYyksZS5oaWdobGlnaHQmJmQuZGlzYWJsZWQoZS5oaWdobGlnaHQpJiZkLnNldChcImhpZ2hsaWdodFwiLGUuaGlnaGxpZ2h0LGMpKSxkKX0sYy5wcm90b3R5cGUuZ2V0PWZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLml0ZW1bYV19LGMucHJvdG90eXBlLmNyZWF0ZT1mdW5jdGlvbihhLGMsZCl7dmFyIGUsZz10aGlzO3JldHVybiBjPXZvaWQgMD09PWM/YTpjLGM9PS0xLzB8fDEvMD09Yz9lPWM6Yi5pc09iamVjdChjKSYmZi5pc0ludGVnZXIoYy5waWNrKT9jPWMub2JqOmIuaXNBcnJheShjKT8oYz1uZXcgRGF0ZShjWzBdLGNbMV0sY1syXSksYz1mLmlzRGF0ZShjKT9jOmcuY3JlYXRlKCkub2JqKTpjPWYuaXNJbnRlZ2VyKGMpfHxmLmlzRGF0ZShjKT9nLm5vcm1hbGl6ZShuZXcgRGF0ZShjKSxkKTpnLm5vdyhhLGMsZCkse3llYXI6ZXx8Yy5nZXRGdWxsWWVhcigpLG1vbnRoOmV8fGMuZ2V0TW9udGgoKSxkYXRlOmV8fGMuZ2V0RGF0ZSgpLGRheTplfHxjLmdldERheSgpLG9iajplfHxjLHBpY2s6ZXx8Yy5nZXRUaW1lKCl9fSxjLnByb3RvdHlwZS5jcmVhdGVSYW5nZT1mdW5jdGlvbihhLGMpe3ZhciBkPXRoaXMsZT1mdW5jdGlvbihhKXtyZXR1cm4gYT09PSEwfHxiLmlzQXJyYXkoYSl8fGYuaXNEYXRlKGEpP2QuY3JlYXRlKGEpOmF9O3JldHVybiBmLmlzSW50ZWdlcihhKXx8KGE9ZShhKSksZi5pc0ludGVnZXIoYyl8fChjPWUoYykpLGYuaXNJbnRlZ2VyKGEpJiZiLmlzT2JqZWN0KGMpP2E9W2MueWVhcixjLm1vbnRoLGMuZGF0ZSthXTpmLmlzSW50ZWdlcihjKSYmYi5pc09iamVjdChhKSYmKGM9W2EueWVhcixhLm1vbnRoLGEuZGF0ZStjXSkse2Zyb206ZShhKSx0bzplKGMpfX0sYy5wcm90b3R5cGUud2l0aGluUmFuZ2U9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT10aGlzLmNyZWF0ZVJhbmdlKGEuZnJvbSxhLnRvKSxiLnBpY2s+PWEuZnJvbS5waWNrJiZiLnBpY2s8PWEudG8ucGlja30sYy5wcm90b3R5cGUub3ZlcmxhcFJhbmdlcz1mdW5jdGlvbihhLGIpe3ZhciBjPXRoaXM7cmV0dXJuIGE9Yy5jcmVhdGVSYW5nZShhLmZyb20sYS50byksYj1jLmNyZWF0ZVJhbmdlKGIuZnJvbSxiLnRvKSxjLndpdGhpblJhbmdlKGEsYi5mcm9tKXx8Yy53aXRoaW5SYW5nZShhLGIudG8pfHxjLndpdGhpblJhbmdlKGIsYS5mcm9tKXx8Yy53aXRoaW5SYW5nZShiLGEudG8pfSxjLnByb3RvdHlwZS5ub3c9ZnVuY3Rpb24oYSxiLGMpe3JldHVybiBiPW5ldyBEYXRlLGMmJmMucmVsJiZiLnNldERhdGUoYi5nZXREYXRlKCkrYy5yZWwpLHRoaXMubm9ybWFsaXplKGIsYyl9LGMucHJvdG90eXBlLm5hdmlnYXRlPWZ1bmN0aW9uKGEsYyxkKXt2YXIgZSxmLGcsaCxpPWIuaXNBcnJheShjKSxqPWIuaXNPYmplY3QoYyksaz10aGlzLml0ZW0udmlldztpZihpfHxqKXtmb3Ioaj8oZj1jLnllYXIsZz1jLm1vbnRoLGg9Yy5kYXRlKTooZj0rY1swXSxnPStjWzFdLGg9K2NbMl0pLGQmJmQubmF2JiZrJiZrLm1vbnRoIT09ZyYmKGY9ay55ZWFyLGc9ay5tb250aCksZT1uZXcgRGF0ZShmLGcrKGQmJmQubmF2P2QubmF2OjApLDEpLGY9ZS5nZXRGdWxsWWVhcigpLGc9ZS5nZXRNb250aCgpO25ldyBEYXRlKGYsZyxoKS5nZXRNb250aCgpIT09ZzspaC09MTtjPVtmLGcsaF19cmV0dXJuIGN9LGMucHJvdG90eXBlLm5vcm1hbGl6ZT1mdW5jdGlvbihhKXtyZXR1cm4gYS5zZXRIb3VycygwLDAsMCwwKSxhfSxjLnByb3RvdHlwZS5tZWFzdXJlPWZ1bmN0aW9uKGEsYil7dmFyIGM9dGhpcztyZXR1cm4gYj9mLmlzSW50ZWdlcihiKSYmKGI9Yy5ub3coYSxiLHtyZWw6Yn0pKTpiPVwibWluXCI9PWE/LTEvMDoxLzAsYn0sYy5wcm90b3R5cGUudmlld3NldD1mdW5jdGlvbihhLGIpe3JldHVybiB0aGlzLmNyZWF0ZShbYi55ZWFyLGIubW9udGgsMV0pfSxjLnByb3RvdHlwZS52YWxpZGF0ZT1mdW5jdGlvbihhLGMsZCl7dmFyIGUsZyxoLGksaj10aGlzLGs9YyxsPWQmJmQuaW50ZXJ2YWw/ZC5pbnRlcnZhbDoxLG09LTE9PT1qLml0ZW0uZW5hYmxlLG49ai5pdGVtLm1pbixvPWouaXRlbS5tYXgscD1tJiZqLml0ZW0uZGlzYWJsZS5maWx0ZXIoZnVuY3Rpb24oYSl7aWYoYi5pc0FycmF5KGEpKXt2YXIgZD1qLmNyZWF0ZShhKS5waWNrO2Q8Yy5waWNrP2U9ITA6ZD5jLnBpY2smJihnPSEwKX1yZXR1cm4gZi5pc0ludGVnZXIoYSl9KS5sZW5ndGg7aWYoKCFkfHwhZC5uYXYpJiYoIW0mJmouZGlzYWJsZWQoYyl8fG0mJmouZGlzYWJsZWQoYykmJihwfHxlfHxnKXx8IW0mJihjLnBpY2s8PW4ucGlja3x8Yy5waWNrPj1vLnBpY2spKSlmb3IobSYmIXAmJighZyYmbD4wfHwhZSYmMD5sKSYmKGwqPS0xKTtqLmRpc2FibGVkKGMpJiYoTWF0aC5hYnMobCk+MSYmKGMubW9udGg8ay5tb250aHx8Yy5tb250aD5rLm1vbnRoKSYmKGM9ayxsPWw+MD8xOi0xKSxjLnBpY2s8PW4ucGljaz8oaD0hMCxsPTEsYz1qLmNyZWF0ZShbbi55ZWFyLG4ubW9udGgsbi5kYXRlLTFdKSk6Yy5waWNrPj1vLnBpY2smJihpPSEwLGw9LTEsYz1qLmNyZWF0ZShbby55ZWFyLG8ubW9udGgsby5kYXRlKzFdKSksIWh8fCFpKTspYz1qLmNyZWF0ZShbYy55ZWFyLGMubW9udGgsYy5kYXRlK2xdKTtyZXR1cm4gY30sYy5wcm90b3R5cGUuZGlzYWJsZWQ9ZnVuY3Rpb24oYSl7dmFyIGM9dGhpcyxkPWMuaXRlbS5kaXNhYmxlLmZpbHRlcihmdW5jdGlvbihkKXtyZXR1cm4gZi5pc0ludGVnZXIoZCk/YS5kYXk9PT0oYy5zZXR0aW5ncy5maXJzdERheT9kOmQtMSklNzpiLmlzQXJyYXkoZCl8fGYuaXNEYXRlKGQpP2EucGljaz09PWMuY3JlYXRlKGQpLnBpY2s6Yi5pc09iamVjdChkKT9jLndpdGhpblJhbmdlKGQsYSk6dm9pZCAwfSk7cmV0dXJuIGQ9ZC5sZW5ndGgmJiFkLmZpbHRlcihmdW5jdGlvbihhKXtyZXR1cm4gYi5pc0FycmF5KGEpJiZcImludmVydGVkXCI9PWFbM118fGIuaXNPYmplY3QoYSkmJmEuaW52ZXJ0ZWR9KS5sZW5ndGgsLTE9PT1jLml0ZW0uZW5hYmxlPyFkOmR8fGEucGljazxjLml0ZW0ubWluLnBpY2t8fGEucGljaz5jLml0ZW0ubWF4LnBpY2t9LGMucHJvdG90eXBlLnBhcnNlPWZ1bmN0aW9uKGEsYyxkKXt2YXIgZSxnPXRoaXMsaD17fTtyZXR1cm4hY3x8Zi5pc0ludGVnZXIoYyl8fGIuaXNBcnJheShjKXx8Zi5pc0RhdGUoYyl8fGIuaXNPYmplY3QoYykmJmYuaXNJbnRlZ2VyKGMucGljayk/YzooZCYmZC5mb3JtYXR8fChkPWR8fHt9LGQuZm9ybWF0PWcuc2V0dGluZ3MuZm9ybWF0KSxlPVwic3RyaW5nXCIhPXR5cGVvZiBjfHxkLmZyb21WYWx1ZT8wOjEsZy5mb3JtYXRzLnRvQXJyYXkoZC5mb3JtYXQpLm1hcChmdW5jdGlvbihhKXt2YXIgYj1nLmZvcm1hdHNbYV0sZD1iP2YudHJpZ2dlcihiLGcsW2MsaF0pOmEucmVwbGFjZSgvXiEvLFwiXCIpLmxlbmd0aDtiJiYoaFthXT1jLnN1YnN0cigwLGQpKSxjPWMuc3Vic3RyKGQpfSksW2gueXl5eXx8aC55eSwrKGgubW18fGgubSktZSxoLmRkfHxoLmRdKX0sYy5wcm90b3R5cGUuZm9ybWF0cz1mdW5jdGlvbigpe2Z1bmN0aW9uIGEoYSxiLGMpe3ZhciBkPWEubWF0Y2goL1xcdysvKVswXTtyZXR1cm4gYy5tbXx8Yy5tfHwoYy5tPWIuaW5kZXhPZihkKSksZC5sZW5ndGh9ZnVuY3Rpb24gYihhKXtyZXR1cm4gYS5tYXRjaCgvXFx3Ky8pWzBdLmxlbmd0aH1yZXR1cm57ZDpmdW5jdGlvbihhLGIpe3JldHVybiBhP2YuZGlnaXRzKGEpOmIuZGF0ZX0sZGQ6ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT8yOmYubGVhZChiLmRhdGUpfSxkZGQ6ZnVuY3Rpb24oYSxjKXtyZXR1cm4gYT9iKGEpOnRoaXMuc2V0dGluZ3Mud2Vla2RheXNTaG9ydFtjLmRheV19LGRkZGQ6ZnVuY3Rpb24oYSxjKXtyZXR1cm4gYT9iKGEpOnRoaXMuc2V0dGluZ3Mud2Vla2RheXNGdWxsW2MuZGF5XX0sbTpmdW5jdGlvbihhLGIpe3JldHVybiBhP2YuZGlnaXRzKGEpOmIubW9udGgrMX0sbW06ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT8yOmYubGVhZChiLm1vbnRoKzEpfSxtbW06ZnVuY3Rpb24oYixjKXt2YXIgZD10aGlzLnNldHRpbmdzLm1vbnRoc1Nob3J0O3JldHVybiBiP2EoYixkLGMpOmRbYy5tb250aF19LG1tbW06ZnVuY3Rpb24oYixjKXt2YXIgZD10aGlzLnNldHRpbmdzLm1vbnRoc0Z1bGw7cmV0dXJuIGI/YShiLGQsYyk6ZFtjLm1vbnRoXX0seXk6ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT8yOihcIlwiK2IueWVhcikuc2xpY2UoMil9LHl5eXk6ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT80OmIueWVhcn0sdG9BcnJheTpmdW5jdGlvbihhKXtyZXR1cm4gYS5zcGxpdCgvKGR7MSw0fXxtezEsNH18eXs0fXx5eXwhLikvZyl9LHRvU3RyaW5nOmZ1bmN0aW9uKGEsYil7dmFyIGM9dGhpcztyZXR1cm4gYy5mb3JtYXRzLnRvQXJyYXkoYSkubWFwKGZ1bmN0aW9uKGEpe3JldHVybiBmLnRyaWdnZXIoYy5mb3JtYXRzW2FdLGMsWzAsYl0pfHxhLnJlcGxhY2UoL14hLyxcIlwiKX0pLmpvaW4oXCJcIil9fX0oKSxjLnByb3RvdHlwZS5pc0RhdGVFeGFjdD1mdW5jdGlvbihhLGMpe3ZhciBkPXRoaXM7cmV0dXJuIGYuaXNJbnRlZ2VyKGEpJiZmLmlzSW50ZWdlcihjKXx8XCJib29sZWFuXCI9PXR5cGVvZiBhJiZcImJvb2xlYW5cIj09dHlwZW9mIGM/YT09PWM6KGYuaXNEYXRlKGEpfHxiLmlzQXJyYXkoYSkpJiYoZi5pc0RhdGUoYyl8fGIuaXNBcnJheShjKSk/ZC5jcmVhdGUoYSkucGljaz09PWQuY3JlYXRlKGMpLnBpY2s6Yi5pc09iamVjdChhKSYmYi5pc09iamVjdChjKT9kLmlzRGF0ZUV4YWN0KGEuZnJvbSxjLmZyb20pJiZkLmlzRGF0ZUV4YWN0KGEudG8sYy50byk6ITF9LGMucHJvdG90eXBlLmlzRGF0ZU92ZXJsYXA9ZnVuY3Rpb24oYSxjKXt2YXIgZD10aGlzO3JldHVybiBmLmlzSW50ZWdlcihhKSYmKGYuaXNEYXRlKGMpfHxiLmlzQXJyYXkoYykpP2E9PT1kLmNyZWF0ZShjKS5kYXkrMTpmLmlzSW50ZWdlcihjKSYmKGYuaXNEYXRlKGEpfHxiLmlzQXJyYXkoYSkpP2M9PT1kLmNyZWF0ZShhKS5kYXkrMTpiLmlzT2JqZWN0KGEpJiZiLmlzT2JqZWN0KGMpP2Qub3ZlcmxhcFJhbmdlcyhhLGMpOiExfSxjLnByb3RvdHlwZS5mbGlwRW5hYmxlPWZ1bmN0aW9uKGEpe3ZhciBiPXRoaXMuaXRlbTtiLmVuYWJsZT1hfHwoLTE9PWIuZW5hYmxlPzE6LTEpfSxjLnByb3RvdHlwZS5kZWFjdGl2YXRlPWZ1bmN0aW9uKGEsYyl7dmFyIGQ9dGhpcyxlPWQuaXRlbS5kaXNhYmxlLnNsaWNlKDApO3JldHVyblwiZmxpcFwiPT1jP2QuZmxpcEVuYWJsZSgpOmM9PT0hMT8oZC5mbGlwRW5hYmxlKDEpLGU9W10pOmM9PT0hMD8oZC5mbGlwRW5hYmxlKC0xKSxlPVtdKTpjLm1hcChmdW5jdGlvbihhKXtmb3IodmFyIGMsZz0wO2c8ZS5sZW5ndGg7Zys9MSlpZihkLmlzRGF0ZUV4YWN0KGEsZVtnXSkpe2M9ITA7YnJlYWt9Y3x8KGYuaXNJbnRlZ2VyKGEpfHxmLmlzRGF0ZShhKXx8Yi5pc0FycmF5KGEpfHxiLmlzT2JqZWN0KGEpJiZhLmZyb20mJmEudG8pJiZlLnB1c2goYSl9KSxlfSxjLnByb3RvdHlwZS5hY3RpdmF0ZT1mdW5jdGlvbihhLGMpe3ZhciBkPXRoaXMsZT1kLml0ZW0uZGlzYWJsZSxnPWUubGVuZ3RoO3JldHVyblwiZmxpcFwiPT1jP2QuZmxpcEVuYWJsZSgpOmM9PT0hMD8oZC5mbGlwRW5hYmxlKDEpLGU9W10pOmM9PT0hMT8oZC5mbGlwRW5hYmxlKC0xKSxlPVtdKTpjLm1hcChmdW5jdGlvbihhKXt2YXIgYyxoLGksajtmb3IoaT0wO2c+aTtpKz0xKXtpZihoPWVbaV0sZC5pc0RhdGVFeGFjdChoLGEpKXtjPWVbaV09bnVsbCxqPSEwO2JyZWFrfWlmKGQuaXNEYXRlT3ZlcmxhcChoLGEpKXtiLmlzT2JqZWN0KGEpPyhhLmludmVydGVkPSEwLGM9YSk6Yi5pc0FycmF5KGEpPyhjPWEsY1szXXx8Yy5wdXNoKFwiaW52ZXJ0ZWRcIikpOmYuaXNEYXRlKGEpJiYoYz1bYS5nZXRGdWxsWWVhcigpLGEuZ2V0TW9udGgoKSxhLmdldERhdGUoKSxcImludmVydGVkXCJdKTticmVha319aWYoYylmb3IoaT0wO2c+aTtpKz0xKWlmKGQuaXNEYXRlRXhhY3QoZVtpXSxhKSl7ZVtpXT1udWxsO2JyZWFrfWlmKGopZm9yKGk9MDtnPmk7aSs9MSlpZihkLmlzRGF0ZU92ZXJsYXAoZVtpXSxhKSl7ZVtpXT1udWxsO2JyZWFrfWMmJmUucHVzaChjKX0pLGUuZmlsdGVyKGZ1bmN0aW9uKGEpe3JldHVybiBudWxsIT1hfSl9LGMucHJvdG90eXBlLm5vZGVzPWZ1bmN0aW9uKGEpe3ZhciBiPXRoaXMsYz1iLnNldHRpbmdzLGc9Yi5pdGVtLGg9Zy5ub3csaT1nLnNlbGVjdCxqPWcuaGlnaGxpZ2h0LGs9Zy52aWV3LGw9Zy5kaXNhYmxlLG09Zy5taW4sbj1nLm1heCxvPWZ1bmN0aW9uKGEpe3JldHVybiBjLmZpcnN0RGF5JiZhLnB1c2goYS5zaGlmdCgpKSxmLm5vZGUoXCJ0aGVhZFwiLGYubm9kZShcInRyXCIsZi5ncm91cCh7bWluOjAsbWF4OmQtMSxpOjEsbm9kZTpcInRoXCIsaXRlbTpmdW5jdGlvbihiKXtyZXR1cm5bYVtiXSxjLmtsYXNzLndlZWtkYXlzXX19KSkpfSgoYy5zaG93V2Vla2RheXNGdWxsP2Mud2Vla2RheXNGdWxsOmMud2Vla2RheXNTaG9ydCkuc2xpY2UoMCkpLHA9ZnVuY3Rpb24oYSl7cmV0dXJuIGYubm9kZShcImRpdlwiLFwiIFwiLGMua2xhc3NbXCJuYXZcIisoYT9cIk5leHRcIjpcIlByZXZcIildKyhhJiZrLnllYXI+PW4ueWVhciYmay5tb250aD49bi5tb250aHx8IWEmJmsueWVhcjw9bS55ZWFyJiZrLm1vbnRoPD1tLm1vbnRoP1wiIFwiK2Mua2xhc3MubmF2RGlzYWJsZWQ6XCJcIiksXCJkYXRhLW5hdj1cIisoYXx8LTEpKX0scT1mdW5jdGlvbihiKXtyZXR1cm4gYy5zZWxlY3RNb250aHM/Zi5ub2RlKFwic2VsZWN0XCIsZi5ncm91cCh7bWluOjAsbWF4OjExLGk6MSxub2RlOlwib3B0aW9uXCIsaXRlbTpmdW5jdGlvbihhKXtyZXR1cm5bYlthXSwwLFwidmFsdWU9XCIrYSsoay5tb250aD09YT9cIiBzZWxlY3RlZFwiOlwiXCIpKyhrLnllYXI9PW0ueWVhciYmYTxtLm1vbnRofHxrLnllYXI9PW4ueWVhciYmYT5uLm1vbnRoP1wiIGRpc2FibGVkXCI6XCJcIildfX0pLGMua2xhc3Muc2VsZWN0TW9udGgsYT9cIlwiOlwiZGlzYWJsZWRcIik6Zi5ub2RlKFwiZGl2XCIsYltrLm1vbnRoXSxjLmtsYXNzLm1vbnRoKX0scj1mdW5jdGlvbigpe3ZhciBiPWsueWVhcixkPWMuc2VsZWN0WWVhcnM9PT0hMD81On5+KGMuc2VsZWN0WWVhcnMvMik7aWYoZCl7dmFyIGU9bS55ZWFyLGc9bi55ZWFyLGg9Yi1kLGk9YitkO2lmKGU+aCYmKGkrPWUtaCxoPWUpLGk+Zyl7dmFyIGo9aC1lLGw9aS1nO2gtPWo+bD9sOmosaT1nfXJldHVybiBmLm5vZGUoXCJzZWxlY3RcIixmLmdyb3VwKHttaW46aCxtYXg6aSxpOjEsbm9kZTpcIm9wdGlvblwiLGl0ZW06ZnVuY3Rpb24oYSl7cmV0dXJuW2EsMCxcInZhbHVlPVwiK2ErKGI9PWE/XCIgc2VsZWN0ZWRcIjpcIlwiKV19fSksYy5rbGFzcy5zZWxlY3RZZWFyLGE/XCJcIjpcImRpc2FibGVkXCIpfXJldHVybiBmLm5vZGUoXCJkaXZcIixiLGMua2xhc3MueWVhcil9O3JldHVybiBmLm5vZGUoXCJkaXZcIixwKCkrcCgxKStxKGMuc2hvd01vbnRoc1Nob3J0P2MubW9udGhzU2hvcnQ6Yy5tb250aHNGdWxsKStyKCksYy5rbGFzcy5oZWFkZXIpK2Yubm9kZShcInRhYmxlXCIsbytmLm5vZGUoXCJ0Ym9keVwiLGYuZ3JvdXAoe21pbjowLG1heDplLTEsaToxLG5vZGU6XCJ0clwiLGl0ZW06ZnVuY3Rpb24oYSl7dmFyIGU9Yy5maXJzdERheSYmMD09PWIuY3JlYXRlKFtrLnllYXIsay5tb250aCwxXSkuZGF5Py03OjA7cmV0dXJuW2YuZ3JvdXAoe21pbjpkKmEtay5kYXkrZSsxLG1heDpmdW5jdGlvbigpe3JldHVybiB0aGlzLm1pbitkLTF9LGk6MSxub2RlOlwidGRcIixpdGVtOmZ1bmN0aW9uKGEpe2E9Yi5jcmVhdGUoW2sueWVhcixrLm1vbnRoLGErKGMuZmlyc3REYXk/MTowKV0pO3ZhciBkPWkmJmkucGljaz09YS5waWNrLGU9aiYmai5waWNrPT1hLnBpY2ssZz1sJiZiLmRpc2FibGVkKGEpfHxhLnBpY2s8bS5waWNrfHxhLnBpY2s+bi5waWNrO3JldHVybltmLm5vZGUoXCJkaXZcIixhLmRhdGUsZnVuY3Rpb24oYil7cmV0dXJuIGIucHVzaChrLm1vbnRoPT1hLm1vbnRoP2Mua2xhc3MuaW5mb2N1czpjLmtsYXNzLm91dGZvY3VzKSxoLnBpY2s9PWEucGljayYmYi5wdXNoKGMua2xhc3Mubm93KSxkJiZiLnB1c2goYy5rbGFzcy5zZWxlY3RlZCksZSYmYi5wdXNoKGMua2xhc3MuaGlnaGxpZ2h0ZWQpLGcmJmIucHVzaChjLmtsYXNzLmRpc2FibGVkKSxiLmpvaW4oXCIgXCIpfShbYy5rbGFzcy5kYXldKSxcImRhdGEtcGljaz1cIithLnBpY2srXCIgXCIrZi5hcmlhQXR0cih7cm9sZTpcImJ1dHRvblwiLGNvbnRyb2xzOmIuJG5vZGVbMF0uaWQsY2hlY2tlZDpkJiZiLiRub2RlWzBdLnZhbHVlPT09Zi50cmlnZ2VyKGIuZm9ybWF0cy50b1N0cmluZyxiLFtjLmZvcm1hdCxhXSk/ITA6bnVsbCxhY3RpdmVkZXNjZW5kYW50OmU/ITA6bnVsbCxkaXNhYmxlZDpnPyEwOm51bGx9KSldfX0pXX19KSksYy5rbGFzcy50YWJsZSkrZi5ub2RlKFwiZGl2XCIsZi5ub2RlKFwiYnV0dG9uXCIsYy50b2RheSxjLmtsYXNzLmJ1dHRvblRvZGF5LFwidHlwZT1idXR0b24gZGF0YS1waWNrPVwiK2gucGljaysoYT9cIlwiOlwiIGRpc2FibGVkXCIpKStmLm5vZGUoXCJidXR0b25cIixjLmNsZWFyLGMua2xhc3MuYnV0dG9uQ2xlYXIsXCJ0eXBlPWJ1dHRvbiBkYXRhLWNsZWFyPTFcIisoYT9cIlwiOlwiIGRpc2FibGVkXCIpKSxjLmtsYXNzLmZvb3Rlcil9LGMuZGVmYXVsdHM9ZnVuY3Rpb24oYSl7cmV0dXJue21vbnRoc0Z1bGw6W1wiSmFudWFyeVwiLFwiRmVicnVhcnlcIixcIk1hcmNoXCIsXCJBcHJpbFwiLFwiTWF5XCIsXCJKdW5lXCIsXCJKdWx5XCIsXCJBdWd1c3RcIixcIlNlcHRlbWJlclwiLFwiT2N0b2JlclwiLFwiTm92ZW1iZXJcIixcIkRlY2VtYmVyXCJdLG1vbnRoc1Nob3J0OltcIkphblwiLFwiRmViXCIsXCJNYXJcIixcIkFwclwiLFwiTWF5XCIsXCJKdW5cIixcIkp1bFwiLFwiQXVnXCIsXCJTZXBcIixcIk9jdFwiLFwiTm92XCIsXCJEZWNcIl0sd2Vla2RheXNGdWxsOltcIlN1bmRheVwiLFwiTW9uZGF5XCIsXCJUdWVzZGF5XCIsXCJXZWRuZXNkYXlcIixcIlRodXJzZGF5XCIsXCJGcmlkYXlcIixcIlNhdHVyZGF5XCJdLHdlZWtkYXlzU2hvcnQ6W1wiU3VuXCIsXCJNb25cIixcIlR1ZVwiLFwiV2VkXCIsXCJUaHVcIixcIkZyaVwiLFwiU2F0XCJdLHRvZGF5OlwiVG9kYXlcIixjbGVhcjpcIkNsZWFyXCIsZm9ybWF0OlwiZCBtbW1tLCB5eXl5XCIsa2xhc3M6e3RhYmxlOmErXCJ0YWJsZVwiLGhlYWRlcjphK1wiaGVhZGVyXCIsbmF2UHJldjphK1wibmF2LS1wcmV2XCIsbmF2TmV4dDphK1wibmF2LS1uZXh0XCIsbmF2RGlzYWJsZWQ6YStcIm5hdi0tZGlzYWJsZWRcIixtb250aDphK1wibW9udGhcIix5ZWFyOmErXCJ5ZWFyXCIsc2VsZWN0TW9udGg6YStcInNlbGVjdC0tbW9udGhcIixzZWxlY3RZZWFyOmErXCJzZWxlY3QtLXllYXJcIix3ZWVrZGF5czphK1wid2Vla2RheVwiLGRheTphK1wiZGF5XCIsZGlzYWJsZWQ6YStcImRheS0tZGlzYWJsZWRcIixzZWxlY3RlZDphK1wiZGF5LS1zZWxlY3RlZFwiLGhpZ2hsaWdodGVkOmErXCJkYXktLWhpZ2hsaWdodGVkXCIsbm93OmErXCJkYXktLXRvZGF5XCIsaW5mb2N1czphK1wiZGF5LS1pbmZvY3VzXCIsb3V0Zm9jdXM6YStcImRheS0tb3V0Zm9jdXNcIixmb290ZXI6YStcImZvb3RlclwiLGJ1dHRvbkNsZWFyOmErXCJidXR0b24tLWNsZWFyXCIsYnV0dG9uVG9kYXk6YStcImJ1dHRvbi0tdG9kYXlcIn19fShhLmtsYXNzZXMoKS5waWNrZXIrXCJfX1wiKSxhLmV4dGVuZChcInBpY2thZGF0ZVwiLGMpfSk7XG4vKiFcbiAqIFRpbWUgcGlja2VyIGZvciBwaWNrYWRhdGUuanMgdjMuNC4wXG4gKiBodHRwOi8vYW1zdWwuZ2l0aHViLmlvL3BpY2thZGF0ZS5qcy90aW1lLmh0bVxuICovXG4hZnVuY3Rpb24oYSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShbXCJwaWNrZXJcIixcImFuZ3VsYXJcIl0sYSk6YShQaWNrZXIsYW5ndWxhcil9KGZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gYyhhLGIpe3ZhciBjPXRoaXMsZD1hLiRub2RlWzBdLnZhbHVlLGU9YS4kbm9kZS5kYXRhKFwidmFsdWVcIiksZj1lfHxkLGc9ZT9iLmZvcm1hdFN1Ym1pdDpiLmZvcm1hdDtjLnNldHRpbmdzPWIsYy4kbm9kZT1hLiRub2RlLGMucXVldWU9e2ludGVydmFsOlwiaVwiLG1pbjpcIm1lYXN1cmUgY3JlYXRlXCIsbWF4OlwibWVhc3VyZSBjcmVhdGVcIixub3c6XCJub3cgY3JlYXRlXCIsc2VsZWN0OlwicGFyc2UgY3JlYXRlIHZhbGlkYXRlXCIsaGlnaGxpZ2h0OlwicGFyc2UgY3JlYXRlIHZhbGlkYXRlXCIsdmlldzpcInBhcnNlIGNyZWF0ZSB2YWxpZGF0ZVwiLGRpc2FibGU6XCJkZWFjdGl2YXRlXCIsZW5hYmxlOlwiYWN0aXZhdGVcIn0sYy5pdGVtPXt9LGMuaXRlbS5pbnRlcnZhbD1iLmludGVydmFsfHwzMCxjLml0ZW0uZGlzYWJsZT0oYi5kaXNhYmxlfHxbXSkuc2xpY2UoMCksYy5pdGVtLmVuYWJsZT0tZnVuY3Rpb24oYSl7cmV0dXJuIGFbMF09PT0hMD9hLnNoaWZ0KCk6LTF9KGMuaXRlbS5kaXNhYmxlKSxjLnNldChcIm1pblwiLGIubWluKS5zZXQoXCJtYXhcIixiLm1heCkuc2V0KFwibm93XCIpLGY/Yy5zZXQoXCJzZWxlY3RcIixmLHtmb3JtYXQ6Zyxmcm9tVmFsdWU6ISFkfSk6Yy5zZXQoXCJzZWxlY3RcIixudWxsKS5zZXQoXCJoaWdobGlnaHRcIixjLml0ZW0ubm93KSxjLmtleT17NDA6MSwzODotMSwzOToxLDM3Oi0xLGdvOmZ1bmN0aW9uKGEpe2Muc2V0KFwiaGlnaGxpZ2h0XCIsYy5pdGVtLmhpZ2hsaWdodC5waWNrK2EqYy5pdGVtLmludGVydmFsLHtpbnRlcnZhbDphKmMuaXRlbS5pbnRlcnZhbH0pLHRoaXMucmVuZGVyKCl9fSxhLm9uKFwicmVuZGVyXCIsZnVuY3Rpb24oKXt2YXIgYz1hLiRyb290LmNoaWxkcmVuKCksZD1jLmZpbmQoXCIuXCIrYi5rbGFzcy52aWV3c2V0KTtkLmxlbmd0aCYmKGNbMF0uc2Nyb2xsVG9wPX5+ZC5wb3NpdGlvbigpLnRvcC0yKmRbMF0uY2xpZW50SGVpZ2h0KX0pLm9uKFwib3BlblwiLGZ1bmN0aW9uKCl7YS4kcm9vdC5maW5kKFwiYnV0dG9uXCIpLmF0dHIoXCJkaXNhYmxlXCIsITEpfSkub24oXCJjbG9zZVwiLGZ1bmN0aW9uKCl7YS4kcm9vdC5maW5kKFwiYnV0dG9uXCIpLmF0dHIoXCJkaXNhYmxlXCIsITApfSl9dmFyIGQ9MjQsZT02MCxmPTEyLGc9ZCplLGg9YS5fO2MucHJvdG90eXBlLnNldD1mdW5jdGlvbihhLGIsYyl7dmFyIGQ9dGhpcyxlPWQuaXRlbTtyZXR1cm4gbnVsbD09PWI/KGVbYV09YixkKTooZVtcImVuYWJsZVwiPT1hP1wiZGlzYWJsZVwiOlwiZmxpcFwiPT1hP1wiZW5hYmxlXCI6YV09ZC5xdWV1ZVthXS5zcGxpdChcIiBcIikubWFwKGZ1bmN0aW9uKGUpe3JldHVybiBiPWRbZV0oYSxiLGMpfSkucG9wKCksXCJzZWxlY3RcIj09YT9kLnNldChcImhpZ2hsaWdodFwiLGUuc2VsZWN0LGMpOlwiaGlnaGxpZ2h0XCI9PWE/ZC5zZXQoXCJ2aWV3XCIsZS5oaWdobGlnaHQsYyk6XCJpbnRlcnZhbFwiPT1hP2Quc2V0KFwibWluXCIsZS5taW4sYykuc2V0KFwibWF4XCIsZS5tYXgsYyk6YS5tYXRjaCgvXihmbGlwfG1pbnxtYXh8ZGlzYWJsZXxlbmFibGUpJC8pJiYoXCJtaW5cIj09YSYmZC5zZXQoXCJtYXhcIixlLm1heCxjKSxlLnNlbGVjdCYmZC5kaXNhYmxlZChlLnNlbGVjdCkmJmQuc2V0KFwic2VsZWN0XCIsZS5zZWxlY3QsYyksZS5oaWdobGlnaHQmJmQuZGlzYWJsZWQoZS5oaWdobGlnaHQpJiZkLnNldChcImhpZ2hsaWdodFwiLGUuaGlnaGxpZ2h0LGMpKSxkKX0sYy5wcm90b3R5cGUuZ2V0PWZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLml0ZW1bYV19LGMucHJvdG90eXBlLmNyZWF0ZT1mdW5jdGlvbihhLGMsZil7dmFyIGk9dGhpcztyZXR1cm4gYz12b2lkIDA9PT1jP2E6YyxoLmlzRGF0ZShjKSYmKGM9W2MuZ2V0SG91cnMoKSxjLmdldE1pbnV0ZXMoKV0pLGIuaXNPYmplY3QoYykmJmguaXNJbnRlZ2VyKGMucGljayk/Yz1jLnBpY2s6Yi5pc0FycmF5KGMpP2M9K2NbMF0qZSsgK2NbMV06aC5pc0ludGVnZXIoYyl8fChjPWkubm93KGEsYyxmKSksXCJtYXhcIj09YSYmYzxpLml0ZW0ubWluLnBpY2smJihjKz1nKSxcIm1pblwiIT1hJiZcIm1heFwiIT1hJiYoYy1pLml0ZW0ubWluLnBpY2spJWkuaXRlbS5pbnRlcnZhbCE9PTAmJihjKz1pLml0ZW0uaW50ZXJ2YWwpLGM9aS5ub3JtYWxpemUoYSxjLGYpLHtob3VyOn5+KGQrYy9lKSVkLG1pbnM6KGUrYyVlKSVlLHRpbWU6KGcrYyklZyxwaWNrOmN9fSxjLnByb3RvdHlwZS5jcmVhdGVSYW5nZT1mdW5jdGlvbihhLGMpe3ZhciBkPXRoaXMsZT1mdW5jdGlvbihhKXtyZXR1cm4gYT09PSEwfHxiLmlzQXJyYXkoYSl8fGguaXNEYXRlKGEpP2QuY3JlYXRlKGEpOmF9O3JldHVybiBoLmlzSW50ZWdlcihhKXx8KGE9ZShhKSksaC5pc0ludGVnZXIoYyl8fChjPWUoYykpLGguaXNJbnRlZ2VyKGEpJiZiLmlzT2JqZWN0KGMpP2E9W2MuaG91cixjLm1pbnMrYSpkLnNldHRpbmdzLmludGVydmFsXTpoLmlzSW50ZWdlcihjKSYmYi5pc09iamVjdChhKSYmKGM9W2EuaG91cixhLm1pbnMrYypkLnNldHRpbmdzLmludGVydmFsXSkse2Zyb206ZShhKSx0bzplKGMpfX0sYy5wcm90b3R5cGUud2l0aGluUmFuZ2U9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT10aGlzLmNyZWF0ZVJhbmdlKGEuZnJvbSxhLnRvKSxiLnBpY2s+PWEuZnJvbS5waWNrJiZiLnBpY2s8PWEudG8ucGlja30sYy5wcm90b3R5cGUub3ZlcmxhcFJhbmdlcz1mdW5jdGlvbihhLGIpe3ZhciBjPXRoaXM7cmV0dXJuIGE9Yy5jcmVhdGVSYW5nZShhLmZyb20sYS50byksYj1jLmNyZWF0ZVJhbmdlKGIuZnJvbSxiLnRvKSxjLndpdGhpblJhbmdlKGEsYi5mcm9tKXx8Yy53aXRoaW5SYW5nZShhLGIudG8pfHxjLndpdGhpblJhbmdlKGIsYS5mcm9tKXx8Yy53aXRoaW5SYW5nZShiLGEudG8pfSxjLnByb3RvdHlwZS5ub3c9ZnVuY3Rpb24oYSxiKXt2YXIgYyxkPXRoaXMuaXRlbS5pbnRlcnZhbCxmPW5ldyBEYXRlLGc9Zi5nZXRIb3VycygpKmUrZi5nZXRNaW51dGVzKCksaT1oLmlzSW50ZWdlcihiKTtyZXR1cm4gZy09ZyVkLGM9MD5iJiYtZD49ZCpiK2csZys9XCJtaW5cIj09YSYmYz8wOmQsaSYmKGcrPWQqKGMmJlwibWF4XCIhPWE/YisxOmIpKSxnfSxjLnByb3RvdHlwZS5ub3JtYWxpemU9ZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzLml0ZW0uaW50ZXJ2YWwsZD10aGlzLml0ZW0ubWluJiZ0aGlzLml0ZW0ubWluLnBpY2t8fDA7cmV0dXJuIGItPVwibWluXCI9PWE/MDooYi1kKSVjfSxjLnByb3RvdHlwZS5tZWFzdXJlPWZ1bmN0aW9uKGEsYyxmKXt2YXIgZz10aGlzO3JldHVybiBjP2M9PT0hMHx8aC5pc0ludGVnZXIoYyk/Yz1nLm5vdyhhLGMsZik6Yi5pc09iamVjdChjKSYmaC5pc0ludGVnZXIoYy5waWNrKSYmKGM9Zy5ub3JtYWxpemUoYSxjLnBpY2ssZikpOmM9XCJtaW5cIj09YT9bMCwwXTpbZC0xLGUtMV0sY30sYy5wcm90b3R5cGUudmFsaWRhdGU9ZnVuY3Rpb24oYSxiLGMpe3ZhciBkPXRoaXMsZT1jJiZjLmludGVydmFsP2MuaW50ZXJ2YWw6ZC5pdGVtLmludGVydmFsO3JldHVybiBkLmRpc2FibGVkKGIpJiYoYj1kLnNoaWZ0KGIsZSkpLGI9ZC5zY29wZShiKSxkLmRpc2FibGVkKGIpJiYoYj1kLnNoaWZ0KGIsLTEqZSkpLGJ9LGMucHJvdG90eXBlLmRpc2FibGVkPWZ1bmN0aW9uKGEpe3ZhciBjPXRoaXMsZD1jLml0ZW0uZGlzYWJsZS5maWx0ZXIoZnVuY3Rpb24oZCl7cmV0dXJuIGguaXNJbnRlZ2VyKGQpP2EuaG91cj09ZDpiLmlzQXJyYXkoZCl8fGguaXNEYXRlKGQpP2EucGljaz09Yy5jcmVhdGUoZCkucGljazpiLmlzT2JqZWN0KGQpP2Mud2l0aGluUmFuZ2UoZCxhKTp2b2lkIDB9KTtyZXR1cm4gZD1kLmxlbmd0aCYmIWQuZmlsdGVyKGZ1bmN0aW9uKGEpe3JldHVybiBiLmlzQXJyYXkoYSkmJlwiaW52ZXJ0ZWRcIj09YVsyXXx8Yi5pc09iamVjdChhKSYmYS5pbnZlcnRlZH0pLmxlbmd0aCwtMT09PWMuaXRlbS5lbmFibGU/IWQ6ZHx8YS5waWNrPGMuaXRlbS5taW4ucGlja3x8YS5waWNrPmMuaXRlbS5tYXgucGlja30sYy5wcm90b3R5cGUuc2hpZnQ9ZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzLGQ9Yy5pdGVtLm1pbi5waWNrLGU9Yy5pdGVtLm1heC5waWNrO2ZvcihiPWJ8fGMuaXRlbS5pbnRlcnZhbDtjLmRpc2FibGVkKGEpJiYoYT1jLmNyZWF0ZShhLnBpY2srPWIpLCEoYS5waWNrPD1kfHxhLnBpY2s+PWUpKTspO3JldHVybiBhfSxjLnByb3RvdHlwZS5zY29wZT1mdW5jdGlvbihhKXt2YXIgYj10aGlzLml0ZW0ubWluLnBpY2ssYz10aGlzLml0ZW0ubWF4LnBpY2s7cmV0dXJuIHRoaXMuY3JlYXRlKGEucGljaz5jP2M6YS5waWNrPGI/YjphKX0sYy5wcm90b3R5cGUucGFyc2U9ZnVuY3Rpb24oYSxjLGQpe3ZhciBmLGcsaSxqLGssbD10aGlzLG09e307aWYoIWN8fGguaXNJbnRlZ2VyKGMpfHxiLmlzQXJyYXkoYyl8fGguaXNEYXRlKGMpfHxiLmlzT2JqZWN0KGMpJiZoLmlzSW50ZWdlcihjLnBpY2spKXJldHVybiBjO2QmJmQuZm9ybWF0fHwoZD1kfHx7fSxkLmZvcm1hdD1sLnNldHRpbmdzLmZvcm1hdCksbC5mb3JtYXRzLnRvQXJyYXkoZC5mb3JtYXQpLm1hcChmdW5jdGlvbihhKXt2YXIgYixkPWwuZm9ybWF0c1thXSxlPWQ/aC50cmlnZ2VyKGQsbCxbYyxtXSk6YS5yZXBsYWNlKC9eIS8sXCJcIikubGVuZ3RoO2QmJihiPWMuc3Vic3RyKDAsZSksbVthXT1iLm1hdGNoKC9eXFxkKyQvKT8rYjpiKSxjPWMuc3Vic3RyKGUpfSk7Zm9yKGogaW4gbSlrPW1bal0saC5pc0ludGVnZXIoayk/ai5tYXRjaCgvXihofGhoKSQvaSk/KGY9aywoXCJoXCI9PWp8fFwiaGhcIj09aikmJihmJT0xMikpOlwiaVwiPT1qJiYoZz1rKTpqLm1hdGNoKC9eYSQvaSkmJmsubWF0Y2goL15wL2kpJiYoXCJoXCJpbiBtfHxcImhoXCJpbiBtKSYmKGk9ITApO3JldHVybihpP2YrMTI6ZikqZStnfSxjLnByb3RvdHlwZS5mb3JtYXRzPXtoOmZ1bmN0aW9uKGEsYil7cmV0dXJuIGE/aC5kaWdpdHMoYSk6Yi5ob3VyJWZ8fGZ9LGhoOmZ1bmN0aW9uKGEsYil7cmV0dXJuIGE/MjpoLmxlYWQoYi5ob3VyJWZ8fGYpfSxIOmZ1bmN0aW9uKGEsYil7cmV0dXJuIGE/aC5kaWdpdHMoYSk6XCJcIitiLmhvdXIlMjR9LEhIOmZ1bmN0aW9uKGEsYil7cmV0dXJuIGE/aC5kaWdpdHMoYSk6aC5sZWFkKGIuaG91ciUyNCl9LGk6ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT8yOmgubGVhZChiLm1pbnMpfSxhOmZ1bmN0aW9uKGEsYil7cmV0dXJuIGE/NDpnLzI+Yi50aW1lJWc/XCJhLm0uXCI6XCJwLm0uXCJ9LEE6ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT8yOmcvMj5iLnRpbWUlZz9cIkFNXCI6XCJQTVwifSx0b0FycmF5OmZ1bmN0aW9uKGEpe3JldHVybiBhLnNwbGl0KC8oaHsxLDJ9fEh7MSwyfXxpfGF8QXwhLikvZyl9LHRvU3RyaW5nOmZ1bmN0aW9uKGEsYil7dmFyIGM9dGhpcztyZXR1cm4gYy5mb3JtYXRzLnRvQXJyYXkoYSkubWFwKGZ1bmN0aW9uKGEpe3JldHVybiBoLnRyaWdnZXIoYy5mb3JtYXRzW2FdLGMsWzAsYl0pfHxhLnJlcGxhY2UoL14hLyxcIlwiKX0pLmpvaW4oXCJcIil9fSxjLnByb3RvdHlwZS5pc1RpbWVFeGFjdD1mdW5jdGlvbihhLGMpe3ZhciBkPXRoaXM7cmV0dXJuIGguaXNJbnRlZ2VyKGEpJiZoLmlzSW50ZWdlcihjKXx8XCJib29sZWFuXCI9PXR5cGVvZiBhJiZcImJvb2xlYW5cIj09dHlwZW9mIGM/YT09PWM6KGguaXNEYXRlKGEpfHxiLmlzQXJyYXkoYSkpJiYoaC5pc0RhdGUoYyl8fGIuaXNBcnJheShjKSk/ZC5jcmVhdGUoYSkucGljaz09PWQuY3JlYXRlKGMpLnBpY2s6Yi5pc09iamVjdChhKSYmYi5pc09iamVjdChjKT9kLmlzVGltZUV4YWN0KGEuZnJvbSxjLmZyb20pJiZkLmlzVGltZUV4YWN0KGEudG8sYy50byk6ITF9LGMucHJvdG90eXBlLmlzVGltZU92ZXJsYXA9ZnVuY3Rpb24oYSxjKXt2YXIgZD10aGlzO3JldHVybiBoLmlzSW50ZWdlcihhKSYmKGguaXNEYXRlKGMpfHxiLmlzQXJyYXkoYykpP2E9PT1kLmNyZWF0ZShjKS5ob3VyOmguaXNJbnRlZ2VyKGMpJiYoaC5pc0RhdGUoYSl8fGIuaXNBcnJheShhKSk/Yz09PWQuY3JlYXRlKGEpLmhvdXI6Yi5pc09iamVjdChhKSYmYi5pc09iamVjdChjKT9kLm92ZXJsYXBSYW5nZXMoYSxjKTohMX0sYy5wcm90b3R5cGUuZmxpcEVuYWJsZT1mdW5jdGlvbihhKXt2YXIgYj10aGlzLml0ZW07Yi5lbmFibGU9YXx8KC0xPT1iLmVuYWJsZT8xOi0xKX0sYy5wcm90b3R5cGUuZGVhY3RpdmF0ZT1mdW5jdGlvbihhLGMpe3ZhciBkPXRoaXMsZT1kLml0ZW0uZGlzYWJsZS5zbGljZSgwKTtyZXR1cm5cImZsaXBcIj09Yz9kLmZsaXBFbmFibGUoKTpjPT09ITE/KGQuZmxpcEVuYWJsZSgxKSxlPVtdKTpjPT09ITA/KGQuZmxpcEVuYWJsZSgtMSksZT1bXSk6Yy5tYXAoZnVuY3Rpb24oYSl7Zm9yKHZhciBjLGY9MDtmPGUubGVuZ3RoO2YrPTEpaWYoZC5pc1RpbWVFeGFjdChhLGVbZl0pKXtjPSEwO2JyZWFrfWN8fChoLmlzSW50ZWdlcihhKXx8aC5pc0RhdGUoYSl8fGIuaXNBcnJheShhKXx8Yi5pc09iamVjdChhKSYmYS5mcm9tJiZhLnRvKSYmZS5wdXNoKGEpfSksZX0sYy5wcm90b3R5cGUuYWN0aXZhdGU9ZnVuY3Rpb24oYSxjKXt2YXIgZD10aGlzLGU9ZC5pdGVtLmRpc2FibGUsZj1lLmxlbmd0aDtyZXR1cm5cImZsaXBcIj09Yz9kLmZsaXBFbmFibGUoKTpjPT09ITA/KGQuZmxpcEVuYWJsZSgxKSxlPVtdKTpjPT09ITE/KGQuZmxpcEVuYWJsZSgtMSksZT1bXSk6Yy5tYXAoZnVuY3Rpb24oYSl7dmFyIGMsZyxpLGo7Zm9yKGk9MDtmPmk7aSs9MSl7aWYoZz1lW2ldLGQuaXNUaW1lRXhhY3QoZyxhKSl7Yz1lW2ldPW51bGwsaj0hMDticmVha31pZihkLmlzVGltZU92ZXJsYXAoZyxhKSl7Yi5pc09iamVjdChhKT8oYS5pbnZlcnRlZD0hMCxjPWEpOmIuaXNBcnJheShhKT8oYz1hLGNbMl18fGMucHVzaChcImludmVydGVkXCIpKTpoLmlzRGF0ZShhKSYmKGM9W2EuZ2V0RnVsbFllYXIoKSxhLmdldE1vbnRoKCksYS5nZXREYXRlKCksXCJpbnZlcnRlZFwiXSk7YnJlYWt9fWlmKGMpZm9yKGk9MDtmPmk7aSs9MSlpZihkLmlzVGltZUV4YWN0KGVbaV0sYSkpe2VbaV09bnVsbDticmVha31pZihqKWZvcihpPTA7Zj5pO2krPTEpaWYoZC5pc1RpbWVPdmVybGFwKGVbaV0sYSkpe2VbaV09bnVsbDticmVha31jJiZlLnB1c2goYyl9KSxlLmZpbHRlcihmdW5jdGlvbihhKXtyZXR1cm4gbnVsbCE9YX0pfSxjLnByb3RvdHlwZS5pPWZ1bmN0aW9uKGEsYil7cmV0dXJuIGguaXNJbnRlZ2VyKGIpJiZiPjA/Yjp0aGlzLml0ZW0uaW50ZXJ2YWx9LGMucHJvdG90eXBlLm5vZGVzPWZ1bmN0aW9uKGEpe3ZhciBiPXRoaXMsYz1iLnNldHRpbmdzLGQ9Yi5pdGVtLnNlbGVjdCxlPWIuaXRlbS5oaWdobGlnaHQsZj1iLml0ZW0udmlldyxnPWIuaXRlbS5kaXNhYmxlO3JldHVybiBoLm5vZGUoXCJ1bFwiLGguZ3JvdXAoe21pbjpiLml0ZW0ubWluLnBpY2ssbWF4OmIuaXRlbS5tYXgucGljayxpOmIuaXRlbS5pbnRlcnZhbCxub2RlOlwibGlcIixpdGVtOmZ1bmN0aW9uKGEpe2E9Yi5jcmVhdGUoYSk7dmFyIGk9YS5waWNrLGo9ZCYmZC5waWNrPT1pLGs9ZSYmZS5waWNrPT1pLGw9ZyYmYi5kaXNhYmxlZChhKTtyZXR1cm5baC50cmlnZ2VyKGIuZm9ybWF0cy50b1N0cmluZyxiLFtoLnRyaWdnZXIoYy5mb3JtYXRMYWJlbCxiLFthXSl8fGMuZm9ybWF0LGFdKSxmdW5jdGlvbihhKXtyZXR1cm4gaiYmYS5wdXNoKGMua2xhc3Muc2VsZWN0ZWQpLGsmJmEucHVzaChjLmtsYXNzLmhpZ2hsaWdodGVkKSxmJiZmLnBpY2s9PWkmJmEucHVzaChjLmtsYXNzLnZpZXdzZXQpLGwmJmEucHVzaChjLmtsYXNzLmRpc2FibGVkKSxhLmpvaW4oXCIgXCIpfShbYy5rbGFzcy5saXN0SXRlbV0pLFwiZGF0YS1waWNrPVwiK2EucGljaytcIiBcIitoLmFyaWFBdHRyKHtyb2xlOlwiYnV0dG9uXCIsY29udHJvbHM6Yi4kbm9kZVswXS5pZCxjaGVja2VkOmomJmIuJG5vZGUudmFsKCk9PT1oLnRyaWdnZXIoYi5mb3JtYXRzLnRvU3RyaW5nLGIsW2MuZm9ybWF0LGFdKT8hMDpudWxsLGFjdGl2ZWRlc2NlbmRhbnQ6az8hMDpudWxsLGRpc2FibGVkOmw/ITA6bnVsbH0pXX19KStoLm5vZGUoXCJsaVwiLGgubm9kZShcImJ1dHRvblwiLGMuY2xlYXIsYy5rbGFzcy5idXR0b25DbGVhcixcInR5cGU9YnV0dG9uIGRhdGEtY2xlYXI9MVwiKyhhP1wiXCI6XCIgZGlzYWJsZVwiKSkpLGMua2xhc3MubGlzdCl9LGMuZGVmYXVsdHM9ZnVuY3Rpb24oYSl7cmV0dXJue2NsZWFyOlwiQ2xlYXJcIixmb3JtYXQ6XCJoOmkgQVwiLGludGVydmFsOjMwLGtsYXNzOntwaWNrZXI6YStcIiBcIithK1wiLS10aW1lXCIsaG9sZGVyOmErXCJfX2hvbGRlclwiLGxpc3Q6YStcIl9fbGlzdFwiLGxpc3RJdGVtOmErXCJfX2xpc3QtaXRlbVwiLGRpc2FibGVkOmErXCJfX2xpc3QtaXRlbS0tZGlzYWJsZWRcIixzZWxlY3RlZDphK1wiX19saXN0LWl0ZW0tLXNlbGVjdGVkXCIsaGlnaGxpZ2h0ZWQ6YStcIl9fbGlzdC1pdGVtLS1oaWdobGlnaHRlZFwiLHZpZXdzZXQ6YStcIl9fbGlzdC1pdGVtLS12aWV3c2V0XCIsbm93OmErXCJfX2xpc3QtaXRlbS0tbm93XCIsYnV0dG9uQ2xlYXI6YStcIl9fYnV0dG9uLS1jbGVhclwifX19KGEua2xhc3NlcygpLnBpY2tlciksYS5leHRlbmQoXCJwaWNrYXRpbWVcIixjKX0pO1xuLyohXG4gKiBMZWdhY3kgYnJvd3NlciBzdXBwb3J0XG4gKi9cbltdLm1hcHx8KEFycmF5LnByb3RvdHlwZS5tYXA9ZnVuY3Rpb24oYSxiKXtmb3IodmFyIGM9dGhpcyxkPWMubGVuZ3RoLGU9bmV3IEFycmF5KGQpLGY9MDtkPmY7ZisrKWYgaW4gYyYmKGVbZl09YS5jYWxsKGIsY1tmXSxmLGMpKTtyZXR1cm4gZX0pLFtdLmZpbHRlcnx8KEFycmF5LnByb3RvdHlwZS5maWx0ZXI9ZnVuY3Rpb24oYSl7aWYobnVsbD09dGhpcyl0aHJvdyBuZXcgVHlwZUVycm9yO3ZhciBiPU9iamVjdCh0aGlzKSxjPWIubGVuZ3RoPj4+MDtpZihcImZ1bmN0aW9uXCIhPXR5cGVvZiBhKXRocm93IG5ldyBUeXBlRXJyb3I7Zm9yKHZhciBkPVtdLGU9YXJndW1lbnRzWzFdLGY9MDtjPmY7ZisrKWlmKGYgaW4gYil7dmFyIGc9YltmXTthLmNhbGwoZSxnLGYsYikmJmQucHVzaChnKX1yZXR1cm4gZH0pLFtdLmluZGV4T2Z8fChBcnJheS5wcm90b3R5cGUuaW5kZXhPZj1mdW5jdGlvbihhKXtpZihudWxsPT10aGlzKXRocm93IG5ldyBUeXBlRXJyb3I7dmFyIGI9T2JqZWN0KHRoaXMpLGM9Yi5sZW5ndGg+Pj4wO2lmKDA9PT1jKXJldHVybi0xO3ZhciBkPTA7aWYoYXJndW1lbnRzLmxlbmd0aD4xJiYoZD1OdW1iZXIoYXJndW1lbnRzWzFdKSxkIT1kP2Q9MDowIT09ZCYmMS8wIT1kJiZkIT0tMS8wJiYoZD0oZD4wfHwtMSkqTWF0aC5mbG9vcihNYXRoLmFicyhkKSkpKSxkPj1jKXJldHVybi0xO2Zvcih2YXIgZT1kPj0wP2Q6TWF0aC5tYXgoYy1NYXRoLmFicyhkKSwwKTtjPmU7ZSsrKWlmKGUgaW4gYiYmYltlXT09PWEpcmV0dXJuIGU7cmV0dXJuLTF9KTsvKiFcbiAqIENyb3NzLUJyb3dzZXIgU3BsaXQgMS4xLjFcbiAqIENvcHlyaWdodCAyMDA3LTIwMTIgU3RldmVuIExldml0aGFuIDxzdGV2ZW5sZXZpdGhhbi5jb20+XG4gKiBBdmFpbGFibGUgdW5kZXIgdGhlIE1JVCBMaWNlbnNlXG4gKiBodHRwOi8vYmxvZy5zdGV2ZW5sZXZpdGhhbi5jb20vYXJjaGl2ZXMvY3Jvc3MtYnJvd3Nlci1zcGxpdFxuICovXG52YXIgbmF0aXZlU3BsaXQ9U3RyaW5nLnByb3RvdHlwZS5zcGxpdCxjb21wbGlhbnRFeGVjTnBjZz12b2lkIDA9PT0vKCk/Py8uZXhlYyhcIlwiKVsxXTtTdHJpbmcucHJvdG90eXBlLnNwbGl0PWZ1bmN0aW9uKGEsYil7dmFyIGM9dGhpcztpZihcIltvYmplY3QgUmVnRXhwXVwiIT09T2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGEpKXJldHVybiBuYXRpdmVTcGxpdC5jYWxsKGMsYSxiKTt2YXIgZCxlLGYsZyxoPVtdLGk9KGEuaWdub3JlQ2FzZT9cImlcIjpcIlwiKSsoYS5tdWx0aWxpbmU/XCJtXCI6XCJcIikrKGEuZXh0ZW5kZWQ/XCJ4XCI6XCJcIikrKGEuc3RpY2t5P1wieVwiOlwiXCIpLGo9MDtmb3IoYT1uZXcgUmVnRXhwKGEuc291cmNlLGkrXCJnXCIpLGMrPVwiXCIsY29tcGxpYW50RXhlY05wY2d8fChkPW5ldyBSZWdFeHAoXCJeXCIrYS5zb3VyY2UrXCIkKD8hXFxcXHMpXCIsaSkpLGI9dm9pZCAwPT09Yj8tMT4+PjA6Yj4+PjA7KGU9YS5leGVjKGMpKSYmKGY9ZS5pbmRleCtlWzBdLmxlbmd0aCwhKGY+aiYmKGgucHVzaChjLnNsaWNlKGosZS5pbmRleCkpLCFjb21wbGlhbnRFeGVjTnBjZyYmZS5sZW5ndGg+MSYmZVswXS5yZXBsYWNlKGQsZnVuY3Rpb24oKXtmb3IodmFyIGE9MTthPGFyZ3VtZW50cy5sZW5ndGgtMjthKyspdm9pZCAwPT09YXJndW1lbnRzW2FdJiYoZVthXT12b2lkIDApfSksZS5sZW5ndGg+MSYmZS5pbmRleDxjLmxlbmd0aCYmQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoaCxlLnNsaWNlKDEpKSxnPWVbMF0ubGVuZ3RoLGo9ZixoLmxlbmd0aD49YikpKTspYS5sYXN0SW5kZXg9PT1lLmluZGV4JiZhLmxhc3RJbmRleCsrO3JldHVybiBqPT09Yy5sZW5ndGg/KGd8fCFhLnRlc3QoXCJcIikpJiZoLnB1c2goXCJcIik6aC5wdXNoKGMuc2xpY2UoaikpLGgubGVuZ3RoPmI/aC5zbGljZSgwLGIpOmh9O1xuYW5ndWxhci5tb2R1bGUoXCJhbmd1bGFyLWRhdGVwaWNrZXJcIixbXSkuZGlyZWN0aXZlKFwicGlja0FEYXRlXCIsZnVuY3Rpb24oKXtyZXR1cm57cmVzdHJpY3Q6XCJBXCIsc2NvcGU6e3BpY2tBRGF0ZTpcIj1cIixwaWNrQURhdGVPcHRpb25zOlwiPVwifSxsaW5rOmZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gYyhjKXtpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBmJiZmLmFwcGx5KHRoaXMsYXJndW1lbnRzKSwhYS4kJHBoYXNlJiYhYS4kcm9vdC4kJHBoYXNlKXt2YXIgZD1iLnBpY2thZGF0ZShcInBpY2tlclwiKS5nZXQoXCJzZWxlY3RcIik7YS4kYXBwbHkoZnVuY3Rpb24oKXtyZXR1cm4gYy5oYXNPd25Qcm9wZXJ0eShcImNsZWFyXCIpP3ZvaWQoYS5waWNrQURhdGU9bnVsbCk6KGEucGlja0FEYXRlJiZcInN0cmluZ1wiIT10eXBlb2YgYS5waWNrQURhdGV8fChhLnBpY2tBRGF0ZT1uZXcgRGF0ZSgwKSksYS5waWNrQURhdGUuc2V0WWVhcihkLm9iai5nZXRZZWFyKCkrMTkwMCksYS5waWNrQURhdGUuc2V0TW9udGgoZC5vYmouZ2V0TW9udGgoKSksdm9pZCBhLnBpY2tBRGF0ZS5zZXREYXRlKGQub2JqLmdldERhdGUoKSkpfSl9fWZ1bmN0aW9uIGQoKXtpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBnJiZnLmFwcGx5KHRoaXMsYXJndW1lbnRzKSxcInVuZGVmaW5lZFwiIT10eXBlb2YgY29yZG92YSYmY29yZG92YS5wbHVnaW5zJiZjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQpe3ZhciBhPWZ1bmN0aW9uKCl7Y29yZG92YS5wbHVnaW5zLktleWJvYXJkLmNsb3NlKCksd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJuYXRpdmUua2V5Ym9hcmRzaG93XCIsdGhpcyl9O3dpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibmF0aXZlLmtleWJvYXJkc2hvd1wiLGEpLHNldFRpbWVvdXQoZnVuY3Rpb24oKXt3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm5hdGl2ZS5rZXlib2FyZHNob3dcIixhKX0sNTAwKX19dmFyIGU9YS5waWNrQURhdGVPcHRpb25zfHx7fSxmPWUub25TZXQsZz1lLm9uQ2xvc2U7Yi5waWNrYWRhdGUoYW5ndWxhci5leHRlbmQoZSx7b25TZXQ6YyxvbkNsb3NlOmQsY29udGFpbmVyOmRvY3VtZW50LmJvZHl9KSksc2V0VGltZW91dChmdW5jdGlvbigpe2EucGlja0FEYXRlJiZiLnBpY2thZGF0ZShcInBpY2tlclwiKS5zZXQoXCJzZWxlY3RcIixhLnBpY2tBRGF0ZSl9LDFlMyl9fX0pLmRpcmVjdGl2ZShcInBpY2tBVGltZVwiLGZ1bmN0aW9uKCl7cmV0dXJue3Jlc3RyaWN0OlwiQVwiLHNjb3BlOntwaWNrQVRpbWU6XCI9XCIscGlja0FUaW1lT3B0aW9uczpcIj1cIn0sbGluazpmdW5jdGlvbihhLGIpe2Z1bmN0aW9uIGMoYyl7aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgZiYmZi5hcHBseSh0aGlzLGFyZ3VtZW50cyksIWEuJCRwaGFzZSYmIWEuJHJvb3QuJCRwaGFzZSl7dmFyIGQ9Yi5waWNrYXRpbWUoXCJwaWNrZXJcIikuZ2V0KFwic2VsZWN0XCIpO2EuJGFwcGx5KGZ1bmN0aW9uKCl7cmV0dXJuIGMuaGFzT3duUHJvcGVydHkoXCJjbGVhclwiKT92b2lkKGEucGlja0FUaW1lPW51bGwpOihhLnBpY2tBVGltZSYmXCJzdHJpbmdcIiE9dHlwZW9mIGEucGlja0FUaW1lfHwoYS5waWNrQVRpbWU9bmV3IERhdGUpLGEucGlja0FUaW1lLnNldEhvdXJzKGQuaG91ciksYS5waWNrQVRpbWUuc2V0TWludXRlcyhkLm1pbnMpLGEucGlja0FUaW1lLnNldFNlY29uZHMoMCksdm9pZCBhLnBpY2tBVGltZS5zZXRNaWxsaXNlY29uZHMoMCkpfSl9fWZ1bmN0aW9uIGQoKXtpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBnJiZnLmFwcGx5KHRoaXMsYXJndW1lbnRzKSxcInVuZGVmaW5lZFwiIT10eXBlb2YgY29yZG92YSYmY29yZG92YS5wbHVnaW5zJiZjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQpe3ZhciBhPWZ1bmN0aW9uKCl7Y29yZG92YS5wbHVnaW5zLktleWJvYXJkLmNsb3NlKCksd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJuYXRpdmUua2V5Ym9hcmRzaG93XCIsdGhpcyl9O3dpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibmF0aXZlLmtleWJvYXJkc2hvd1wiLGEpLHNldFRpbWVvdXQoZnVuY3Rpb24oKXt3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm5hdGl2ZS5rZXlib2FyZHNob3dcIixhKX0sNTAwKX19dmFyIGU9YS5waWNrQVRpbWVPcHRpb25zfHx7fSxmPWUub25TZXQsZz1lLm9uQ2xvc2U7Yi5waWNrYXRpbWUoYW5ndWxhci5leHRlbmQoZSx7b25TZXQ6YyxvbkNsb3NlOmQsY29udGFpbmVyOmRvY3VtZW50LmJvZHl9KSksc2V0VGltZW91dChmdW5jdGlvbigpe2EucGlja0FUaW1lJiZiLnBpY2thdGltZShcInBpY2tlclwiKS5zZXQoXCJzZWxlY3RcIixhLnBpY2tBVGltZSl9LDFlMyl9fX0pOyIsIi8vIERlcHMgaXMgc29ydCBvZiBhIHByb2JsZW0gZm9yIHVzLCBtYXliZSBpbiB0aGUgZnV0dXJlIHdlIHdpbGwgYXNrIHRoZSB1c2VyIHRvIGRlcGVuZFxuLy8gb24gbW9kdWxlcyBmb3IgYWRkLW9uc1xuXG52YXIgZGVwcyA9IFsnT2JqZWN0UGF0aCddO1xudHJ5IHtcbiAgLy9UaGlzIHRocm93cyBhbiBleHBlY3Rpb24gaWYgbW9kdWxlIGRvZXMgbm90IGV4aXN0LlxuICBhbmd1bGFyLm1vZHVsZSgnbmdTYW5pdGl6ZScpO1xuICBkZXBzLnB1c2goJ25nU2FuaXRpemUnKTtcbn0gY2F0Y2ggKGUpIHt9XG5cbnRyeSB7XG4gIC8vVGhpcyB0aHJvd3MgYW4gZXhwZWN0aW9uIGlmIG1vZHVsZSBkb2VzIG5vdCBleGlzdC5cbiAgYW5ndWxhci5tb2R1bGUoJ3VpLnNvcnRhYmxlJyk7XG4gIGRlcHMucHVzaCgndWkuc29ydGFibGUnKTtcbn0gY2F0Y2ggKGUpIHt9XG5cbnRyeSB7XG4gIC8vVGhpcyB0aHJvd3MgYW4gZXhwZWN0aW9uIGlmIG1vZHVsZSBkb2VzIG5vdCBleGlzdC5cbiAgYW5ndWxhci5tb2R1bGUoJ2FuZ3VsYXJTcGVjdHJ1bUNvbG9ycGlja2VyJyk7XG4gIGRlcHMucHVzaCgnYW5ndWxhclNwZWN0cnVtQ29sb3JwaWNrZXInKTtcbn0gY2F0Y2ggKGUpIHt9XG5cbmFuZ3VsYXIubW9kdWxlKCdzY2hlbWFGb3JtJywgZGVwcyk7XG5cbmFuZ3VsYXIubW9kdWxlKCdzY2hlbWFGb3JtJykucHJvdmlkZXIoJ3NmUGF0aCcsXG5bJ09iamVjdFBhdGhQcm92aWRlcicsIGZ1bmN0aW9uKE9iamVjdFBhdGhQcm92aWRlcikge1xuICB2YXIgT2JqZWN0UGF0aCA9IHtwYXJzZTogT2JqZWN0UGF0aFByb3ZpZGVyLnBhcnNlfTtcblxuICAvLyBpZiB3ZSdyZSBvbiBBbmd1bGFyIDEuMi54LCB3ZSBuZWVkIHRvIGNvbnRpbnVlIHVzaW5nIGRvdCBub3RhdGlvblxuICBpZiAoYW5ndWxhci52ZXJzaW9uLm1ham9yID09PSAxICYmIGFuZ3VsYXIudmVyc2lvbi5taW5vciA8IDMpIHtcbiAgICBPYmplY3RQYXRoLnN0cmluZ2lmeSA9IGZ1bmN0aW9uKGFycikge1xuICAgICAgcmV0dXJuIEFycmF5LmlzQXJyYXkoYXJyKSA/IGFyci5qb2luKCcuJykgOiBhcnIudG9TdHJpbmcoKTtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIE9iamVjdFBhdGguc3RyaW5naWZ5ID0gT2JqZWN0UGF0aFByb3ZpZGVyLnN0cmluZ2lmeTtcbiAgfVxuXG4gIC8vIFdlIHdhbnQgdGhpcyB0byB1c2Ugd2hpY2hldmVyIHN0cmluZ2lmeSBtZXRob2QgaXMgZGVmaW5lZCBhYm92ZSxcbiAgLy8gc28gd2UgaGF2ZSB0byBjb3B5IHRoZSBjb2RlIGhlcmUuXG4gIE9iamVjdFBhdGgubm9ybWFsaXplID0gZnVuY3Rpb24oZGF0YSwgcXVvdGUpIHtcbiAgICByZXR1cm4gT2JqZWN0UGF0aC5zdHJpbmdpZnkoQXJyYXkuaXNBcnJheShkYXRhKSA/IGRhdGEgOiBPYmplY3RQYXRoLnBhcnNlKGRhdGEpLCBxdW90ZSk7XG4gIH07XG5cbiAgdGhpcy5wYXJzZSA9IE9iamVjdFBhdGgucGFyc2U7XG4gIHRoaXMuc3RyaW5naWZ5ID0gT2JqZWN0UGF0aC5zdHJpbmdpZnk7XG4gIHRoaXMubm9ybWFsaXplID0gT2JqZWN0UGF0aC5ub3JtYWxpemU7XG4gIHRoaXMuJGdldCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBPYmplY3RQYXRoO1xuICB9O1xufV0pO1xuXG4vKipcbiAqIEBuZ2RvYyBzZXJ2aWNlXG4gKiBAbmFtZSBzZlNlbGVjdFxuICogQGtpbmQgZnVuY3Rpb25cbiAqXG4gKi9cbmFuZ3VsYXIubW9kdWxlKCdzY2hlbWFGb3JtJykuZmFjdG9yeSgnc2ZTZWxlY3QnLCBbJ3NmUGF0aCcsIGZ1bmN0aW9uKHNmUGF0aCkge1xuICB2YXIgbnVtUmUgPSAvXlxcZCskLztcblxuICAvKipcbiAgICAqIEBkZXNjcmlwdGlvblxuICAgICogVXRpbGl0eSBtZXRob2QgdG8gYWNjZXNzIGRlZXAgcHJvcGVydGllcyB3aXRob3V0XG4gICAgKiB0aHJvd2luZyBlcnJvcnMgd2hlbiB0aGluZ3MgYXJlIG5vdCBkZWZpbmVkLlxuICAgICogQ2FuIGFsc28gc2V0IGEgdmFsdWUgaW4gYSBkZWVwIHN0cnVjdHVyZSwgY3JlYXRpbmcgb2JqZWN0cyB3aGVuIG1pc3NpbmdcbiAgICAqIGV4LlxuICAgICogdmFyIGZvbyA9IFNlbGVjdCgnYWRkcmVzcy5jb250YWN0Lm5hbWUnLG9iailcbiAgICAqIFNlbGVjdCgnYWRkcmVzcy5jb250YWN0Lm5hbWUnLG9iaiwnTGVlcm95JylcbiAgICAqXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gcHJvamVjdGlvbiBBIGRvdCBwYXRoIHRvIHRoZSBwcm9wZXJ0eSB5b3Ugd2FudCB0byBnZXQvc2V0XG4gICAgKiBAcGFyYW0ge29iamVjdH0gb2JqICAgKG9wdGlvbmFsKSBUaGUgb2JqZWN0IHRvIHByb2plY3Qgb24sIGRlZmF1bHRzIHRvICd0aGlzJ1xuICAgICogQHBhcmFtIHtBbnl9ICAgIHZhbHVlVG9TZXQgKG9waW9uYWwpICBUaGUgdmFsdWUgdG8gc2V0LCBpZiBwYXJ0cyBvZiB0aGUgcGF0aCBvZlxuICAgICogICAgICAgICAgICAgICAgIHRoZSBwcm9qZWN0aW9uIGlzIG1pc3NpbmcgZW1wdHkgb2JqZWN0cyB3aWxsIGJlIGNyZWF0ZWQuXG4gICAgKiBAcmV0dXJucyB7QW55fHVuZGVmaW5lZH0gcmV0dXJucyB0aGUgdmFsdWUgYXQgdGhlIGVuZCBvZiB0aGUgcHJvamVjdGlvbiBwYXRoXG4gICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgb3IgdW5kZWZpbmVkIGlmIHRoZXJlIGlzIG5vbmUuXG4gICAgKi9cbiAgcmV0dXJuIGZ1bmN0aW9uKHByb2plY3Rpb24sIG9iaiwgdmFsdWVUb1NldCkge1xuICAgIGlmICghb2JqKSB7XG4gICAgICBvYmogPSB0aGlzO1xuICAgIH1cbiAgICAvL1N1cHBvcnQgW10gYXJyYXkgc3ludGF4XG4gICAgdmFyIHBhcnRzID0gdHlwZW9mIHByb2plY3Rpb24gPT09ICdzdHJpbmcnID8gc2ZQYXRoLnBhcnNlKHByb2plY3Rpb24pIDogcHJvamVjdGlvbjtcblxuICAgIGlmICh0eXBlb2YgdmFsdWVUb1NldCAhPT0gJ3VuZGVmaW5lZCcgJiYgcGFydHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAvL3NwZWNpYWwgY2FzZSwganVzdCBzZXR0aW5nIG9uZSB2YXJpYWJsZVxuICAgICAgb2JqW3BhcnRzWzBdXSA9IHZhbHVlVG9TZXQ7XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgdmFsdWVUb1NldCAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgICAgdHlwZW9mIG9ialtwYXJ0c1swXV0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgLy8gV2UgbmVlZCB0byBsb29rIGFoZWFkIHRvIGNoZWNrIGlmIGFycmF5IGlzIGFwcHJvcHJpYXRlXG4gICAgICBvYmpbcGFydHNbMF1dID0gcGFydHMubGVuZ3RoID4gMiAmJiBudW1SZS50ZXN0KHBhcnRzWzFdKSA/IFtdIDoge307XG4gICAgfVxuXG4gICAgdmFyIHZhbHVlID0gb2JqW3BhcnRzWzBdXTtcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IHBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAvLyBTcGVjaWFsIGNhc2U6IFdlIGFsbG93IEpTT04gRm9ybSBzeW50YXggZm9yIGFycmF5cyB1c2luZyBlbXB0eSBicmFja2V0c1xuICAgICAgLy8gVGhlc2Ugd2lsbCBvZiBjb3Vyc2Ugbm90IHdvcmsgaGVyZSBzbyB3ZSBleGl0IGlmIHRoZXkgYXJlIGZvdW5kLlxuICAgICAgaWYgKHBhcnRzW2ldID09PSAnJykge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiB2YWx1ZVRvU2V0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBpZiAoaSA9PT0gcGFydHMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgIC8vbGFzdCBzdGVwLiBMZXQncyBzZXQgdGhlIHZhbHVlXG4gICAgICAgICAgdmFsdWVbcGFydHNbaV1dID0gdmFsdWVUb1NldDtcbiAgICAgICAgICByZXR1cm4gdmFsdWVUb1NldDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBNYWtlIHN1cmUgdG8gY3JlYXRlIG5ldyBvYmplY3RzIG9uIHRoZSB3YXkgaWYgdGhleSBhcmUgbm90IHRoZXJlLlxuICAgICAgICAgIC8vIFdlIG5lZWQgdG8gbG9vayBhaGVhZCB0byBjaGVjayBpZiBhcnJheSBpcyBhcHByb3ByaWF0ZVxuICAgICAgICAgIHZhciB0bXAgPSB2YWx1ZVtwYXJ0c1tpXV07XG4gICAgICAgICAgaWYgKHR5cGVvZiB0bXAgPT09ICd1bmRlZmluZWQnIHx8IHRtcCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdG1wID0gbnVtUmUudGVzdChwYXJ0c1tpICsgMV0pID8gW10gOiB7fTtcbiAgICAgICAgICAgIHZhbHVlW3BhcnRzW2ldXSA9IHRtcDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFsdWUgPSB0bXA7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodmFsdWUpIHtcbiAgICAgICAgLy9KdXN0IGdldCBuZXggdmFsdWUuXG4gICAgICAgIHZhbHVlID0gdmFsdWVbcGFydHNbaV1dO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG59XSk7XG5cbmFuZ3VsYXIubW9kdWxlKCdzY2hlbWFGb3JtJykucHJvdmlkZXIoJ3NjaGVtYUZvcm1EZWNvcmF0b3JzJyxcblsnJGNvbXBpbGVQcm92aWRlcicsICdzZlBhdGhQcm92aWRlcicsIGZ1bmN0aW9uKCRjb21waWxlUHJvdmlkZXIsIHNmUGF0aFByb3ZpZGVyKSB7XG4gIHZhciBkZWZhdWx0RGVjb3JhdG9yID0gJyc7XG4gIHZhciBkaXJlY3RpdmVzID0ge307XG5cbiAgdmFyIHRlbXBsYXRlVXJsID0gZnVuY3Rpb24obmFtZSwgZm9ybSkge1xuICAgIC8vc2NoZW1hRGVjb3JhdG9yIGlzIGFsaWFzIGZvciB3aGF0ZXZlciBpcyBzZXQgYXMgZGVmYXVsdFxuICAgIGlmIChuYW1lID09PSAnc2ZEZWNvcmF0b3InKSB7XG4gICAgICBuYW1lID0gZGVmYXVsdERlY29yYXRvcjtcbiAgICB9XG5cbiAgICB2YXIgZGlyZWN0aXZlID0gZGlyZWN0aXZlc1tuYW1lXTtcblxuICAgIC8vcnVsZXMgZmlyc3RcbiAgICB2YXIgcnVsZXMgPSBkaXJlY3RpdmUucnVsZXM7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBydWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHJlcyA9IHJ1bGVzW2ldKGZvcm0pO1xuICAgICAgaWYgKHJlcykge1xuICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vdGhlbiBjaGVjayBtYXBwaW5nXG4gICAgaWYgKGRpcmVjdGl2ZS5tYXBwaW5nc1tmb3JtLnR5cGVdKSB7XG4gICAgICByZXR1cm4gZGlyZWN0aXZlLm1hcHBpbmdzW2Zvcm0udHlwZV07XG4gICAgfVxuXG4gICAgLy90cnkgZGVmYXVsdFxuICAgIHJldHVybiBkaXJlY3RpdmUubWFwcGluZ3NbJ2RlZmF1bHQnXTtcbiAgfTtcblxuICB2YXIgY3JlYXRlRGlyZWN0aXZlID0gZnVuY3Rpb24obmFtZSwgb3B0aW9ucykge1xuICAgICRjb21waWxlUHJvdmlkZXIuZGlyZWN0aXZlKG5hbWUsIFsnJHBhcnNlJywgJyRjb21waWxlJywgJyRodHRwJywgJyR0ZW1wbGF0ZUNhY2hlJyxcbiAgICAgIGZ1bmN0aW9uKCRwYXJzZSwgICRjb21waWxlLCAgJGh0dHAsICAkdGVtcGxhdGVDYWNoZSkge1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgcmVzdHJpY3Q6ICdBRScsXG4gICAgICAgICAgcmVwbGFjZTogZmFsc2UsXG4gICAgICAgICAgdHJhbnNjbHVkZTogZmFsc2UsXG4gICAgICAgICAgc2NvcGU6IHRydWUsXG4gICAgICAgICAgcmVxdWlyZTogJz9ec2ZTY2hlbWEnLFxuICAgICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgc2ZTY2hlbWEpIHtcbiAgICAgICAgICAgIC8vcmViaW5kIG91ciBwYXJ0IG9mIHRoZSBmb3JtIHRvIHRoZSBzY29wZS5cbiAgICAgICAgICAgIHZhciBvbmNlID0gc2NvcGUuJHdhdGNoKGF0dHJzLmZvcm0sIGZ1bmN0aW9uKGZvcm0pIHtcblxuICAgICAgICAgICAgICBpZiAoZm9ybSkge1xuICAgICAgICAgICAgICAgIHNjb3BlLmZvcm0gID0gZm9ybTtcblxuICAgICAgICAgICAgICAgIC8vb2sgbGV0J3MgcmVwbGFjZSB0aGF0IHRlbXBsYXRlIVxuICAgICAgICAgICAgICAgIC8vV2UgZG8gdGhpcyBtYW51YWxseSBzaW5jZSB3ZSBuZWVkIHRvIGJpbmQgbmctbW9kZWwgcHJvcGVybHkgYW5kIGFsc29cbiAgICAgICAgICAgICAgICAvL2ZvciBmaWVsZHNldHMgdG8gcmVjdXJzZSBwcm9wZXJseS5cbiAgICAgICAgICAgICAgICB2YXIgdXJsID0gdGVtcGxhdGVVcmwobmFtZSwgZm9ybSk7XG4gICAgICAgICAgICAgICAgJGh0dHAuZ2V0KHVybCwge2NhY2hlOiAkdGVtcGxhdGVDYWNoZX0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgICB2YXIga2V5ID0gZm9ybS5rZXkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNmUGF0aFByb3ZpZGVyLnN0cmluZ2lmeShmb3JtLmtleSkucmVwbGFjZSgvXCIvZywgJyZxdW90OycpIDogJyc7XG4gICAgICAgICAgICAgICAgICB2YXIgdGVtcGxhdGUgPSByZXMuZGF0YS5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICAvXFwkXFwkdmFsdWVcXCRcXCQvZyxcbiAgICAgICAgICAgICAgICAgICAgJ21vZGVsJyArIChrZXlbMF0gIT09ICdbJyA/ICcuJyA6ICcnKSArIGtleVxuICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5jbGFzc05hbWUpIHtcbiAgICAgICAgICAgICAgICAgIFx0ZWxlbWVudC5hZGRDbGFzcyhvcHRpb25zLmNsYXNzTmFtZSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBlbGVtZW50Lmh0bWwodGVtcGxhdGUpO1xuICAgICAgICAgICAgICAgICAgJGNvbXBpbGUoZWxlbWVudC5jb250ZW50cygpKShzY29wZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgb25jZSgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy9LZWVwIGVycm9yIHByb25lIGxvZ2ljIGZyb20gdGhlIHRlbXBsYXRlXG4gICAgICAgICAgICBzY29wZS5zaG93VGl0bGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHNjb3BlLmZvcm0gJiYgc2NvcGUuZm9ybS5ub3RpdGxlICE9PSB0cnVlICYmIHNjb3BlLmZvcm0udGl0bGU7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzY29wZS5saXN0VG9DaGVja2JveFZhbHVlcyA9IGZ1bmN0aW9uKGxpc3QpIHtcbiAgICAgICAgICAgICAgdmFyIHZhbHVlcyA9IHt9O1xuICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2gobGlzdCwgZnVuY3Rpb24odikge1xuICAgICAgICAgICAgICAgIHZhbHVlc1t2XSA9IHRydWU7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICByZXR1cm4gdmFsdWVzO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2NvcGUuY2hlY2tib3hWYWx1ZXNUb0xpc3QgPSBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgICAgICAgdmFyIGxzdCA9IFtdO1xuICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2godmFsdWVzLCBmdW5jdGlvbih2LCBrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHYpIHtcbiAgICAgICAgICAgICAgICAgIGxzdC5wdXNoKGspO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIHJldHVybiBsc3Q7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzY29wZS5idXR0b25DbGljayA9IGZ1bmN0aW9uKCRldmVudCwgZm9ybSkge1xuICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKGZvcm0ub25DbGljaykpIHtcbiAgICAgICAgICAgICAgICBmb3JtLm9uQ2xpY2soJGV2ZW50LCBmb3JtKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChhbmd1bGFyLmlzU3RyaW5nKGZvcm0ub25DbGljaykpIHtcbiAgICAgICAgICAgICAgICBpZiAoc2ZTY2hlbWEpIHtcbiAgICAgICAgICAgICAgICAgIC8vZXZhbHVhdGluZyBpbiBzY29wZSBvdXRzaWRlIG9mIHNmU2NoZW1hcyBpc29sYXRlZCBzY29wZVxuICAgICAgICAgICAgICAgICAgc2ZTY2hlbWEuZXZhbEluUGFyZW50U2NvcGUoZm9ybS5vbkNsaWNrLCB7JyRldmVudCc6ICRldmVudCwgZm9ybTogZm9ybX0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBzY29wZS4kZXZhbChmb3JtLm9uQ2xpY2ssIHsnJGV2ZW50JzogJGV2ZW50LCBmb3JtOiBmb3JtfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEV2YWx1YXRlIGFuIGV4cHJlc3Npb24sIGkuZS4gc2NvcGUuJGV2YWxcbiAgICAgICAgICAgICAqIGJ1dCBkbyBpdCBpbiBzZlNjaGVtYXMgcGFyZW50IHNjb3BlIHNmLXNjaGVtYSBkaXJlY3RpdmUgaXMgdXNlZFxuICAgICAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGV4cHJlc3Npb25cbiAgICAgICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBsb2NhbHMgKG9wdGlvbmFsKVxuICAgICAgICAgICAgICogQHJldHVybiB7QW55fSB0aGUgcmVzdWx0IG9mIHRoZSBleHByZXNzaW9uXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHNjb3BlLmV2YWxFeHByID0gZnVuY3Rpb24oZXhwcmVzc2lvbiwgbG9jYWxzKSB7XG4gICAgICAgICAgICAgIGlmIChzZlNjaGVtYSkge1xuICAgICAgICAgICAgICAgIC8vZXZhbHVhdGluZyBpbiBzY29wZSBvdXRzaWRlIG9mIHNmU2NoZW1hcyBpc29sYXRlZCBzY29wZVxuICAgICAgICAgICAgICAgIHJldHVybiBzZlNjaGVtYS5ldmFsSW5QYXJlbnRTY29wZShleHByZXNzaW9uLCBsb2NhbHMpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgcmV0dXJuIHNjb3BlLiRldmFsKGV4cHJlc3Npb24sIGxvY2Fscyk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEV2YWx1YXRlIGFuIGV4cHJlc3Npb24sIGkuZS4gc2NvcGUuJGV2YWxcbiAgICAgICAgICAgICAqIGluIHRoaXMgZGVjb3JhdG9ycyBzY29wZVxuICAgICAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGV4cHJlc3Npb25cbiAgICAgICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBsb2NhbHMgKG9wdGlvbmFsKVxuICAgICAgICAgICAgICogQHJldHVybiB7QW55fSB0aGUgcmVzdWx0IG9mIHRoZSBleHByZXNzaW9uXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHNjb3BlLmV2YWxJblNjb3BlID0gZnVuY3Rpb24oZXhwcmVzc2lvbiwgbG9jYWxzKSB7XG4gICAgICAgICAgICAgIGlmIChleHByZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNjb3BlLiRldmFsKGV4cHJlc3Npb24sIGxvY2Fscyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogRXJyb3IgbWVzc2FnZSBoYW5kbGVyXG4gICAgICAgICAgICAgKiBBbiBlcnJvciBjYW4gZWl0aGVyIGJlIGEgc2NoZW1hIHZhbGlkYXRpb24gbWVzc2FnZSBvciBhIGFuZ3VsYXIganMgdmFsaWR0aW9uXG4gICAgICAgICAgICAgKiBlcnJvciAoaS5lLiByZXF1aXJlZClcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgc2NvcGUuZXJyb3JNZXNzYWdlID0gZnVuY3Rpb24oc2NoZW1hRXJyb3IpIHtcbiAgICAgICAgICAgICAgLy9Vc2VyIGhhcyBzdXBwbGllZCB2YWxpZGF0aW9uIG1lc3NhZ2VzXG4gICAgICAgICAgICAgIGlmIChzY29wZS5mb3JtLnZhbGlkYXRpb25NZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNjaGVtYUVycm9yKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc1N0cmluZyhzY29wZS5mb3JtLnZhbGlkYXRpb25NZXNzYWdlKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2NvcGUuZm9ybS52YWxpZGF0aW9uTWVzc2FnZTtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgcmV0dXJuIHNjb3BlLmZvcm0udmFsaWRhdGlvbk1lc3NhZ2Vbc2NoZW1hRXJyb3IuY29kZV0gfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5mb3JtLnZhbGlkYXRpb25NZXNzYWdlWydkZWZhdWx0J107XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBzY29wZS5mb3JtLnZhbGlkYXRpb25NZXNzYWdlLm51bWJlciB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmZvcm0udmFsaWRhdGlvbk1lc3NhZ2VbJ2RlZmF1bHQnXSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmZvcm0udmFsaWRhdGlvbk1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLy9ObyB1c2VyIHN1cHBsaWVkIHZhbGlkYXRpb24gbWVzc2FnZS5cbiAgICAgICAgICAgICAgaWYgKHNjaGVtYUVycm9yKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNjaGVtYUVycm9yLm1lc3NhZ2U7IC8vdXNlIHR2NC5qcyB2YWxpZGF0aW9uIG1lc3NhZ2VcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vT3RoZXJ3aXNlIHdlIG9ubHkgaGF2ZSBpbnB1dCBudW1iZXIgbm90IGJlaW5nIGEgbnVtYmVyXG4gICAgICAgICAgICAgIHJldHVybiAnTm90IGEgbnVtYmVyJztcblxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgXSk7XG4gIH07XG5cbiAgdmFyIGNyZWF0ZU1hbnVhbERpcmVjdGl2ZSA9IGZ1bmN0aW9uKHR5cGUsIHRlbXBsYXRlVXJsLCB0cmFuc2NsdWRlKSB7XG4gICAgdHJhbnNjbHVkZSA9IGFuZ3VsYXIuaXNEZWZpbmVkKHRyYW5zY2x1ZGUpID8gdHJhbnNjbHVkZSA6IGZhbHNlO1xuICAgICRjb21waWxlUHJvdmlkZXIuZGlyZWN0aXZlKCdzZicgKyBhbmd1bGFyLnVwcGVyY2FzZSh0eXBlWzBdKSArIHR5cGUuc3Vic3RyKDEpLCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRUFDJyxcbiAgICAgICAgc2NvcGU6IHRydWUsXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRyYW5zY2x1ZGUsXG4gICAgICAgIHRlbXBsYXRlOiAnPHNmLWRlY29yYXRvciBmb3JtPVwiZm9ybVwiPjwvc2YtZGVjb3JhdG9yPicsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICAgIHZhciB3YXRjaFRoaXMgPSB7XG4gICAgICAgICAgICAnaXRlbXMnOiAnYycsXG4gICAgICAgICAgICAndGl0bGVNYXAnOiAnYycsXG4gICAgICAgICAgICAnc2NoZW1hJzogJ2MnXG4gICAgICAgICAgfTtcbiAgICAgICAgICB2YXIgZm9ybSA9IHt0eXBlOiB0eXBlfTtcbiAgICAgICAgICB2YXIgb25jZSA9IHRydWU7XG4gICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGF0dHJzLCBmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICAgICAgaWYgKG5hbWVbMF0gIT09ICckJyAmJiBuYW1lLmluZGV4T2YoJ25nJykgIT09IDAgJiYgbmFtZSAhPT0gJ3NmRmllbGQnKSB7XG5cbiAgICAgICAgICAgICAgdmFyIHVwZGF0ZUZvcm0gPSBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQodmFsKSAmJiB2YWwgIT09IGZvcm1bbmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgIGZvcm1bbmFtZV0gPSB2YWw7XG5cbiAgICAgICAgICAgICAgICAgIC8vd2hlbiB3ZSBoYXZlIHR5cGUsIGFuZCBpZiBzcGVjaWZpZWQga2V5IHdlIGFwcGx5IGl0IG9uIHNjb3BlLlxuICAgICAgICAgICAgICAgICAgaWYgKG9uY2UgJiYgZm9ybS50eXBlICYmIChmb3JtLmtleSB8fCBhbmd1bGFyLmlzVW5kZWZpbmVkKGF0dHJzLmtleSkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmZvcm0gPSBmb3JtO1xuICAgICAgICAgICAgICAgICAgICBvbmNlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgIGlmIChuYW1lID09PSAnbW9kZWwnKSB7XG4gICAgICAgICAgICAgICAgLy9cIm1vZGVsXCIgaXMgYm91bmQgdG8gc2NvcGUgdW5kZXIgdGhlIG5hbWUgXCJtb2RlbFwiIHNpbmNlIHRoaXMgaXMgd2hhdCB0aGUgZGVjb3JhdG9yc1xuICAgICAgICAgICAgICAgIC8va25vdyBhbmQgbG92ZS5cbiAgICAgICAgICAgICAgICBzY29wZS4kd2F0Y2godmFsdWUsIGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgICAgICAgaWYgKHZhbCAmJiBzY29wZS5tb2RlbCAhPT0gdmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLm1vZGVsID0gdmFsO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKHdhdGNoVGhpc1tuYW1lXSA9PT0gJ2MnKSB7XG4gICAgICAgICAgICAgICAgLy93YXRjaCBjb2xsZWN0aW9uXG4gICAgICAgICAgICAgICAgc2NvcGUuJHdhdGNoQ29sbGVjdGlvbih2YWx1ZSwgdXBkYXRlRm9ybSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8kb2JzZXJ2ZVxuICAgICAgICAgICAgICAgIGF0dHJzLiRvYnNlcnZlKG5hbWUsIHVwZGF0ZUZvcm0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGRlY29yYXRvciBkaXJlY3RpdmUgYW5kIGl0cyBzaWJsaW5nIFwibWFudWFsXCIgdXNlIGRpcmVjdGl2ZXMuXG4gICAqIFRoZSBkaXJlY3RpdmUgY2FuIGJlIHVzZWQgdG8gY3JlYXRlIGZvcm0gZmllbGRzIG9yIG90aGVyIGZvcm0gZW50aXRpZXMuXG4gICAqIEl0IGNhbiBiZSB1c2VkIGluIGNvbmp1bmN0aW9uIHdpdGggPHNjaGVtYS1mb3JtPiBkaXJlY3RpdmUgaW4gd2hpY2ggY2FzZSB0aGUgZGVjb3JhdG9yIGlzXG4gICAqIGdpdmVuIGl0J3MgY29uZmlndXJhdGlvbiB2aWEgYSB0aGUgXCJmb3JtXCIgYXR0cmlidXRlLlxuICAgKlxuICAgKiBleC4gQmFzaWMgdXNhZ2VcbiAgICogICA8c2YtZGVjb3JhdG9yIGZvcm09XCJteWZvcm1cIj48L3NmLWRlY29yYXRvcj5cbiAgICoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIGRpcmVjdGl2ZSBuYW1lIChDYW1lbENhc2VkKVxuICAgKiBAcGFyYW0ge09iamVjdH0gbWFwcGluZ3MsIGFuIG9iamVjdCB0aGF0IG1hcHMgXCJ0eXBlXCIgPT4gXCJ0ZW1wbGF0ZVVybFwiXG4gICAqIEBwYXJhbSB7QXJyYXl9ICBydWxlcyAob3B0aW9uYWwpIGEgbGlzdCBvZiBmdW5jdGlvbnMsIGZ1bmN0aW9uKGZvcm0pIHt9LCB0aGF0IGFyZSBlYWNoIHRyaWVkIGluXG4gICAqICAgICAgICAgICAgICAgICB0dXJuLFxuICAgKiAgICAgICAgICAgICAgICAgaWYgdGhleSByZXR1cm4gYSBzdHJpbmcgdGhlbiB0aGF0IGlzIHVzZWQgYXMgdGhlIHRlbXBsYXRlVXJsLiBSdWxlcyBjb21lIGJlZm9yZVxuICAgKiAgICAgICAgICAgICAgICAgbWFwcGluZ3MuXG4gICAqL1xuICB0aGlzLmNyZWF0ZURlY29yYXRvciA9IGZ1bmN0aW9uKG5hbWUsIG1hcHBpbmdzLCBydWxlcywgb3B0aW9ucykge1xuICAgIGRpcmVjdGl2ZXNbbmFtZV0gPSB7XG4gICAgICBtYXBwaW5nczogbWFwcGluZ3MgfHwge30sXG4gICAgICBydWxlczogICAgcnVsZXMgICAgfHwgW11cbiAgICB9O1xuXG4gICAgaWYgKCFkaXJlY3RpdmVzW2RlZmF1bHREZWNvcmF0b3JdKSB7XG4gICAgICBkZWZhdWx0RGVjb3JhdG9yID0gbmFtZTtcbiAgICB9XG4gICAgY3JlYXRlRGlyZWN0aXZlKG5hbWUsIG9wdGlvbnMpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgZGlyZWN0aXZlIG9mIGEgZGVjb3JhdG9yXG4gICAqIFVzYWJsZSB3aGVuIHlvdSB3YW50IHRvIHVzZSB0aGUgZGVjb3JhdG9ycyB3aXRob3V0IHVzaW5nIDxzY2hlbWEtZm9ybT4gZGlyZWN0aXZlLlxuICAgKiBTcGVjaWZpY2FsbHkgd2hlbiB5b3UgbmVlZCB0byByZXVzZSBzdHlsaW5nLlxuICAgKlxuICAgKiBleC4gY3JlYXRlRGlyZWN0aXZlKCd0ZXh0JywnLi4uJylcbiAgICogIDxzZi10ZXh0IHRpdGxlPVwiZm9vYmFyXCIgbW9kZWw9XCJwZXJzb25cIiBrZXk9XCJuYW1lXCIgc2NoZW1hPVwic2NoZW1hXCI+PC9zZi10ZXh0PlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gIHR5cGUgVGhlIHR5cGUgb2YgdGhlIGRpcmVjdGl2ZSwgcmVzdWx0aW5nIGRpcmVjdGl2ZSB3aWxsIGhhdmUgc2YtIHByZWZpeGVkXG4gICAqIEBwYXJhbSB7c3RyaW5nfSAgdGVtcGxhdGVVcmxcbiAgICogQHBhcmFtIHtib29sZWFufSB0cmFuc2NsdWRlIChvcHRpb25hbCkgc2V0cyB0cmFuc2NsdWRlIG9wdGlvbiBvZiBkaXJlY3RpdmUsIGRlZmF1bHRzIHRvIGZhbHNlLlxuICAgKi9cbiAgdGhpcy5jcmVhdGVEaXJlY3RpdmUgPSBjcmVhdGVNYW51YWxEaXJlY3RpdmU7XG5cbiAgLyoqXG4gICAqIFNhbWUgYXMgY3JlYXRlRGlyZWN0aXZlLCBidXQgdGFrZXMgYW4gb2JqZWN0IHdoZXJlIGtleSBpcyAndHlwZScgYW5kIHZhbHVlIGlzICd0ZW1wbGF0ZVVybCdcbiAgICogVXNlZnVsIGZvciBiYXRjaGluZy5cbiAgICogQHBhcmFtIHtPYmplY3R9IG1hcHBpbmdzXG4gICAqL1xuICB0aGlzLmNyZWF0ZURpcmVjdGl2ZXMgPSBmdW5jdGlvbihtYXBwaW5ncykge1xuICAgIGFuZ3VsYXIuZm9yRWFjaChtYXBwaW5ncywgZnVuY3Rpb24odXJsLCB0eXBlKSB7XG4gICAgICBjcmVhdGVNYW51YWxEaXJlY3RpdmUodHlwZSwgdXJsKTtcbiAgICB9KTtcbiAgfTtcblxuICAvKipcbiAgICogR2V0dGVyIGZvciBkaXJlY3RpdmUgbWFwcGluZ3NcbiAgICogQ2FuIGJlIHVzZWQgdG8gb3ZlcnJpZGUgYSBtYXBwaW5nIG9yIGFkZCBhIHJ1bGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgKG9wdGlvbmFsKSBkZWZhdWx0cyB0byBkZWZhdWx0RGVjb3JhdG9yXG4gICAqIEByZXR1cm4ge09iamVjdH0gcnVsZXMgYW5kIG1hcHBpbmdzIHsgcnVsZXM6IFtdLG1hcHBpbmdzOiB7fX1cbiAgICovXG4gIHRoaXMuZGlyZWN0aXZlID0gZnVuY3Rpb24obmFtZSkge1xuICAgIG5hbWUgPSBuYW1lIHx8IGRlZmF1bHREZWNvcmF0b3I7XG4gICAgcmV0dXJuIGRpcmVjdGl2ZXNbbmFtZV07XG4gIH07XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBtYXBwaW5nIHRvIGFuIGV4aXN0aW5nIGRlY29yYXRvci5cbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgRGVjb3JhdG9yIG5hbWVcbiAgICogQHBhcmFtIHtTdHJpbmd9IHR5cGUgRm9ybSB0eXBlIGZvciB0aGUgbWFwcGluZ1xuICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsICBUaGUgdGVtcGxhdGUgdXJsXG4gICAqL1xuICB0aGlzLmFkZE1hcHBpbmcgPSBmdW5jdGlvbihuYW1lLCB0eXBlLCB1cmwpIHtcbiAgICBpZiAoZGlyZWN0aXZlc1tuYW1lXSkge1xuICAgICAgZGlyZWN0aXZlc1tuYW1lXS5tYXBwaW5nc1t0eXBlXSA9IHVybDtcbiAgICB9XG4gIH07XG5cbiAgLy9TZXJ2aWNlIGlzIGp1c3QgYSBnZXR0ZXIgZm9yIGRpcmVjdGl2ZSBtYXBwaW5ncyBhbmQgcnVsZXNcbiAgdGhpcy4kZ2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRpcmVjdGl2ZTogZnVuY3Rpb24obmFtZSkge1xuICAgICAgICByZXR1cm4gZGlyZWN0aXZlc1tuYW1lXTtcbiAgICAgIH0sXG4gICAgICBkZWZhdWx0RGVjb3JhdG9yOiBkZWZhdWx0RGVjb3JhdG9yXG4gICAgfTtcbiAgfTtcblxuICAvL0NyZWF0ZSBhIGRlZmF1bHQgZGlyZWN0aXZlXG4gIGNyZWF0ZURpcmVjdGl2ZSgnc2ZEZWNvcmF0b3InKTtcblxufV0pO1xuXG4vKipcbiAqIFNjaGVtYSBmb3JtIHNlcnZpY2UuXG4gKiBUaGlzIHNlcnZpY2UgaXMgbm90IHRoYXQgdXNlZnVsIG91dHNpZGUgb2Ygc2NoZW1hIGZvcm0gZGlyZWN0aXZlXG4gKiBidXQgbWFrZXMgdGhlIGNvZGUgbW9yZSB0ZXN0YWJsZS5cbiAqL1xuYW5ndWxhci5tb2R1bGUoJ3NjaGVtYUZvcm0nKS5wcm92aWRlcignc2NoZW1hRm9ybScsXG5bJ3NmUGF0aFByb3ZpZGVyJywgZnVuY3Rpb24oc2ZQYXRoUHJvdmlkZXIpIHtcblxuICAvL0NyZWF0ZXMgYW4gZGVmYXVsdCB0aXRsZU1hcCBsaXN0IGZyb20gYW4gZW51bSwgaS5lLiBhIGxpc3Qgb2Ygc3RyaW5ncy5cbiAgdmFyIGVudW1Ub1RpdGxlTWFwID0gZnVuY3Rpb24oZW5tKSB7XG4gICAgdmFyIHRpdGxlTWFwID0gW107IC8vY2Fub25pY2FsIHRpdGxlTWFwIGZvcm1hdCBpcyBhIGxpc3QuXG4gICAgZW5tLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgdGl0bGVNYXAucHVzaCh7bmFtZTogbmFtZSwgdmFsdWU6IG5hbWV9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gdGl0bGVNYXA7XG4gIH07XG5cbiAgLy8gVGFrZXMgYSB0aXRsZU1hcCBpbiBlaXRoZXIgb2JqZWN0IG9yIGxpc3QgZm9ybWF0IGFuZCByZXR1cm5zIG9uZSBpblxuICAvLyBpbiB0aGUgbGlzdCBmb3JtYXQuXG4gIHZhciBjYW5vbmljYWxUaXRsZU1hcCA9IGZ1bmN0aW9uKHRpdGxlTWFwLCBvcmlnaW5hbEVudW0pIHtcbiAgICBpZiAoIWFuZ3VsYXIuaXNBcnJheSh0aXRsZU1hcCkpIHtcbiAgICAgIHZhciBjYW5vbmljYWwgPSBbXTtcbiAgICAgIGlmIChvcmlnaW5hbEVudW0pIHtcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKG9yaWdpbmFsRW51bSwgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgY2Fub25pY2FsLnB1c2goe25hbWU6IHRpdGxlTWFwW3ZhbHVlXSwgdmFsdWU6IHZhbHVlfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRpdGxlTWFwLCBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgICAgICAgIGNhbm9uaWNhbC5wdXNoKHtuYW1lOiBuYW1lLCB2YWx1ZTogdmFsdWV9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gY2Fub25pY2FsO1xuICAgIH1cbiAgICByZXR1cm4gdGl0bGVNYXA7XG4gIH07XG5cbiAgdmFyIGRlZmF1bHRGb3JtRGVmaW5pdGlvbiA9IGZ1bmN0aW9uKG5hbWUsIHNjaGVtYSwgb3B0aW9ucykge1xuICAgIHZhciBydWxlcyA9IGRlZmF1bHRzW3NjaGVtYS50eXBlXTtcbiAgICBpZiAocnVsZXMpIHtcbiAgICAgIHZhciBkZWY7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJ1bGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGRlZiA9IHJ1bGVzW2ldKG5hbWUsIHNjaGVtYSwgb3B0aW9ucyk7XG4gICAgICAgIC8vZmlyc3QgaGFuZGxlciBpbiBsaXN0IHRoYXQgYWN0dWFsbHkgcmV0dXJucyBzb21ldGhpbmcgaXMgb3VyIGhhbmRsZXIhXG4gICAgICAgIGlmIChkZWYpIHtcbiAgICAgICAgICByZXR1cm4gZGVmO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIC8vQ3JlYXRlcyBhIGZvcm0gb2JqZWN0IHdpdGggYWxsIGNvbW1vbiBwcm9wZXJ0aWVzXG4gIHZhciBzdGRGb3JtT2JqID0gZnVuY3Rpb24obmFtZSwgc2NoZW1hLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdmFyIGYgPSBvcHRpb25zLmdsb2JhbCAmJiBvcHRpb25zLmdsb2JhbC5mb3JtRGVmYXVsdHMgP1xuICAgICAgICAgICAgYW5ndWxhci5jb3B5KG9wdGlvbnMuZ2xvYmFsLmZvcm1EZWZhdWx0cykgOiB7fTtcbiAgICBpZiAob3B0aW9ucy5nbG9iYWwgJiYgb3B0aW9ucy5nbG9iYWwuc3VwcmVzc1Byb3BlcnR5VGl0bGVzID09PSB0cnVlKSB7XG4gICAgICBmLnRpdGxlID0gc2NoZW1hLnRpdGxlO1xuICAgIH0gZWxzZSB7XG4gICAgICBmLnRpdGxlID0gc2NoZW1hLnRpdGxlIHx8IG5hbWU7XG4gICAgfVxuXG4gICAgaWYgKHNjaGVtYS5kZXNjcmlwdGlvbikgeyBmLmRlc2NyaXB0aW9uID0gc2NoZW1hLmRlc2NyaXB0aW9uOyB9XG4gICAgaWYgKG9wdGlvbnMucmVxdWlyZWQgPT09IHRydWUgfHwgc2NoZW1hLnJlcXVpcmVkID09PSB0cnVlKSB7IGYucmVxdWlyZWQgPSB0cnVlOyB9XG4gICAgaWYgKHNjaGVtYS5tYXhMZW5ndGgpIHsgZi5tYXhsZW5ndGggPSBzY2hlbWEubWF4TGVuZ3RoOyB9XG4gICAgaWYgKHNjaGVtYS5taW5MZW5ndGgpIHsgZi5taW5sZW5ndGggPSBzY2hlbWEubWF4TGVuZ3RoOyB9XG4gICAgaWYgKHNjaGVtYS5yZWFkT25seSB8fCBzY2hlbWEucmVhZG9ubHkpIHsgZi5yZWFkb25seSAgPSB0cnVlOyB9XG4gICAgaWYgKHNjaGVtYS5taW5pbXVtKSB7IGYubWluaW11bSA9IHNjaGVtYS5taW5pbXVtICsgKHNjaGVtYS5leGNsdXNpdmVNaW5pbXVtID8gMSA6IDApOyB9XG4gICAgaWYgKHNjaGVtYS5tYXhpbXVtKSB7IGYubWF4aW11bSA9IHNjaGVtYS5tYXhpbXVtIC0gKHNjaGVtYS5leGNsdXNpdmVNYXhpbXVtID8gMSA6IDApOyB9XG5cbiAgICAvL05vbiBzdGFuZGFyZCBhdHRyaWJ1dGVzXG4gICAgaWYgKHNjaGVtYS52YWxpZGF0aW9uTWVzc2FnZSkgeyBmLnZhbGlkYXRpb25NZXNzYWdlID0gc2NoZW1hLnZhbGlkYXRpb25NZXNzYWdlOyB9XG4gICAgaWYgKHNjaGVtYS5lbnVtTmFtZXMpIHsgZi50aXRsZU1hcCA9IGNhbm9uaWNhbFRpdGxlTWFwKHNjaGVtYS5lbnVtTmFtZXMsIHNjaGVtYVsnZW51bSddKTsgfVxuICAgIGYuc2NoZW1hID0gc2NoZW1hO1xuXG4gICAgLy8gTmcgbW9kZWwgb3B0aW9ucyBkb2Vzbid0IHBsYXkgbmljZSB3aXRoIHVuZGVmaW5lZCwgbWlnaHQgYmUgZGVmaW5lZFxuICAgIC8vIGdsb2JhbGx5IHRob3VnaFxuICAgIGYubmdNb2RlbE9wdGlvbnMgPSBmLm5nTW9kZWxPcHRpb25zIHx8IHt9O1xuICAgIHJldHVybiBmO1xuICB9O1xuXG4gIHZhciB0ZXh0ID0gZnVuY3Rpb24obmFtZSwgc2NoZW1hLCBvcHRpb25zKSB7XG4gICAgaWYgKHNjaGVtYS50eXBlID09PSAnc3RyaW5nJyAmJiAhc2NoZW1hWydlbnVtJ10pIHtcbiAgICAgIHZhciBmID0gc3RkRm9ybU9iaihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpO1xuICAgICAgZi5rZXkgID0gb3B0aW9ucy5wYXRoO1xuICAgICAgZi50eXBlID0gJ3RleHQnO1xuICAgICAgb3B0aW9ucy5sb29rdXBbc2ZQYXRoUHJvdmlkZXIuc3RyaW5naWZ5KG9wdGlvbnMucGF0aCldID0gZjtcbiAgICAgIHJldHVybiBmO1xuICAgIH1cbiAgfTtcblxuICAvL2RlZmF1bHQgaW4ganNvbiBmb3JtIGZvciBudW1iZXIgYW5kIGludGVnZXIgaXMgYSB0ZXh0IGZpZWxkXG4gIC8vaW5wdXQgdHlwZT1cIm51bWJlclwiIHdvdWxkIGJlIG1vcmUgc3VpdGFibGUgZG9uJ3QgeWEgdGhpbms/XG4gIHZhciBudW1iZXIgPSBmdW5jdGlvbihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpIHtcbiAgICBpZiAoc2NoZW1hLnR5cGUgPT09ICdudW1iZXInKSB7XG4gICAgICB2YXIgZiA9IHN0ZEZvcm1PYmoobmFtZSwgc2NoZW1hLCBvcHRpb25zKTtcbiAgICAgIGYua2V5ICA9IG9wdGlvbnMucGF0aDtcbiAgICAgIGYudHlwZSA9ICdudW1iZXInO1xuICAgICAgb3B0aW9ucy5sb29rdXBbc2ZQYXRoUHJvdmlkZXIuc3RyaW5naWZ5KG9wdGlvbnMucGF0aCldID0gZjtcbiAgICAgIHJldHVybiBmO1xuICAgIH1cbiAgfTtcblxuICB2YXIgaW50ZWdlciA9IGZ1bmN0aW9uKG5hbWUsIHNjaGVtYSwgb3B0aW9ucykge1xuICAgIGlmIChzY2hlbWEudHlwZSA9PT0gJ2ludGVnZXInKSB7XG4gICAgICB2YXIgZiA9IHN0ZEZvcm1PYmoobmFtZSwgc2NoZW1hLCBvcHRpb25zKTtcbiAgICAgIGYua2V5ICA9IG9wdGlvbnMucGF0aDtcbiAgICAgIGYudHlwZSA9ICdudW1iZXInO1xuICAgICAgb3B0aW9ucy5sb29rdXBbc2ZQYXRoUHJvdmlkZXIuc3RyaW5naWZ5KG9wdGlvbnMucGF0aCldID0gZjtcbiAgICAgIHJldHVybiBmO1xuICAgIH1cbiAgfTtcblxuICB2YXIgY2hlY2tib3ggPSBmdW5jdGlvbihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpIHtcbiAgICBpZiAoc2NoZW1hLnR5cGUgPT09ICdib29sZWFuJykge1xuICAgICAgdmFyIGYgPSBzdGRGb3JtT2JqKG5hbWUsIHNjaGVtYSwgb3B0aW9ucyk7XG4gICAgICBmLmtleSAgPSBvcHRpb25zLnBhdGg7XG4gICAgICBmLnR5cGUgPSAnY2hlY2tib3gnO1xuICAgICAgb3B0aW9ucy5sb29rdXBbc2ZQYXRoUHJvdmlkZXIuc3RyaW5naWZ5KG9wdGlvbnMucGF0aCldID0gZjtcbiAgICAgIHJldHVybiBmO1xuICAgIH1cbiAgfTtcblxuICB2YXIgc2VsZWN0ID0gZnVuY3Rpb24obmFtZSwgc2NoZW1hLCBvcHRpb25zKSB7XG4gICAgaWYgKHNjaGVtYS50eXBlID09PSAnc3RyaW5nJyAmJiBzY2hlbWFbJ2VudW0nXSkge1xuICAgICAgdmFyIGYgPSBzdGRGb3JtT2JqKG5hbWUsIHNjaGVtYSwgb3B0aW9ucyk7XG4gICAgICBmLmtleSAgPSBvcHRpb25zLnBhdGg7XG4gICAgICBmLnR5cGUgPSAnc2VsZWN0JztcbiAgICAgIGlmICghZi50aXRsZU1hcCkge1xuICAgICAgICBmLnRpdGxlTWFwID0gZW51bVRvVGl0bGVNYXAoc2NoZW1hWydlbnVtJ10pO1xuICAgICAgfVxuICAgICAgb3B0aW9ucy5sb29rdXBbc2ZQYXRoUHJvdmlkZXIuc3RyaW5naWZ5KG9wdGlvbnMucGF0aCldID0gZjtcbiAgICAgIHJldHVybiBmO1xuICAgIH1cbiAgfTtcblxuICB2YXIgY2hlY2tib3hlcyA9IGZ1bmN0aW9uKG5hbWUsIHNjaGVtYSwgb3B0aW9ucykge1xuICAgIGlmIChzY2hlbWEudHlwZSA9PT0gJ2FycmF5JyAmJiBzY2hlbWEuaXRlbXMgJiYgc2NoZW1hLml0ZW1zWydlbnVtJ10pIHtcbiAgICAgIHZhciBmID0gc3RkRm9ybU9iaihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpO1xuICAgICAgZi5rZXkgID0gb3B0aW9ucy5wYXRoO1xuICAgICAgZi50eXBlID0gJ2NoZWNrYm94ZXMnO1xuICAgICAgaWYgKCFmLnRpdGxlTWFwKSB7XG4gICAgICAgIGYudGl0bGVNYXAgPSBlbnVtVG9UaXRsZU1hcChzY2hlbWEuaXRlbXNbJ2VudW0nXSk7XG4gICAgICB9XG4gICAgICBvcHRpb25zLmxvb2t1cFtzZlBhdGhQcm92aWRlci5zdHJpbmdpZnkob3B0aW9ucy5wYXRoKV0gPSBmO1xuICAgICAgcmV0dXJuIGY7XG4gICAgfVxuICB9O1xuXG4gIHZhciBmaWVsZHNldCA9IGZ1bmN0aW9uKG5hbWUsIHNjaGVtYSwgb3B0aW9ucykge1xuICAgIGlmIChzY2hlbWEudHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHZhciBmICAgPSBzdGRGb3JtT2JqKG5hbWUsIHNjaGVtYSwgb3B0aW9ucyk7XG4gICAgICBmLnR5cGUgID0gJ2ZpZWxkc2V0JztcbiAgICAgIGYuaXRlbXMgPSBbXTtcbiAgICAgIG9wdGlvbnMubG9va3VwW3NmUGF0aFByb3ZpZGVyLnN0cmluZ2lmeShvcHRpb25zLnBhdGgpXSA9IGY7XG5cbiAgICAgIC8vcmVjdXJzZSBkb3duIGludG8gcHJvcGVydGllc1xuICAgICAgYW5ndWxhci5mb3JFYWNoKHNjaGVtYS5wcm9wZXJ0aWVzLCBmdW5jdGlvbih2LCBrKSB7XG4gICAgICAgIHZhciBwYXRoID0gb3B0aW9ucy5wYXRoLnNsaWNlKCk7XG4gICAgICAgIHBhdGgucHVzaChrKTtcbiAgICAgICAgaWYgKG9wdGlvbnMuaWdub3JlW3NmUGF0aFByb3ZpZGVyLnN0cmluZ2lmeShwYXRoKV0gIT09IHRydWUpIHtcbiAgICAgICAgICB2YXIgcmVxdWlyZWQgPSBzY2hlbWEucmVxdWlyZWQgJiYgc2NoZW1hLnJlcXVpcmVkLmluZGV4T2YoaykgIT09IC0xO1xuXG4gICAgICAgICAgdmFyIGRlZiA9IGRlZmF1bHRGb3JtRGVmaW5pdGlvbihrLCB2LCB7XG4gICAgICAgICAgICBwYXRoOiBwYXRoLFxuICAgICAgICAgICAgcmVxdWlyZWQ6IHJlcXVpcmVkIHx8IGZhbHNlLFxuICAgICAgICAgICAgbG9va3VwOiBvcHRpb25zLmxvb2t1cCxcbiAgICAgICAgICAgIGlnbm9yZTogb3B0aW9ucy5pZ25vcmVcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAoZGVmKSB7XG4gICAgICAgICAgICBmLml0ZW1zLnB1c2goZGVmKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gZjtcbiAgICB9XG5cbiAgfTtcblxuICB2YXIgYXJyYXkgPSBmdW5jdGlvbihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpIHtcblxuICAgIGlmIChzY2hlbWEudHlwZSA9PT0gJ2FycmF5Jykge1xuICAgICAgdmFyIGYgICA9IHN0ZEZvcm1PYmoobmFtZSwgc2NoZW1hLCBvcHRpb25zKTtcbiAgICAgIGYudHlwZSAgPSAnYXJyYXknO1xuICAgICAgZi5rZXkgICA9IG9wdGlvbnMucGF0aDtcbiAgICAgIG9wdGlvbnMubG9va3VwW3NmUGF0aFByb3ZpZGVyLnN0cmluZ2lmeShvcHRpb25zLnBhdGgpXSA9IGY7XG5cbiAgICAgIHZhciByZXF1aXJlZCA9IHNjaGVtYS5yZXF1aXJlZCAmJlxuICAgICAgICAgICAgICAgICAgICAgc2NoZW1hLnJlcXVpcmVkLmluZGV4T2Yob3B0aW9ucy5wYXRoW29wdGlvbnMucGF0aC5sZW5ndGggLSAxXSkgIT09IC0xO1xuXG4gICAgICAvLyBUaGUgZGVmYXVsdCBpcyB0byBhbHdheXMganVzdCBjcmVhdGUgb25lIGNoaWxkLiBUaGlzIHdvcmtzIHNpbmNlIGlmIHRoZVxuICAgICAgLy8gc2NoZW1hcyBpdGVtcyBkZWNsYXJhdGlvbiBpcyBvZiB0eXBlOiBcIm9iamVjdFwiIHRoZW4gd2UgZ2V0IGEgZmllbGRzZXQuXG4gICAgICAvLyBXZSBhbHNvIGZvbGxvdyBqc29uIGZvcm0gbm90YXRhdGlvbiwgYWRkaW5nIGVtcHR5IGJyYWNrZXRzIFwiW11cIiB0b1xuICAgICAgLy8gc2lnbmlmeSBhcnJheXMuXG5cbiAgICAgIHZhciBhcnJQYXRoID0gb3B0aW9ucy5wYXRoLnNsaWNlKCk7XG4gICAgICBhcnJQYXRoLnB1c2goJycpO1xuXG4gICAgICBmLml0ZW1zID0gW2RlZmF1bHRGb3JtRGVmaW5pdGlvbihuYW1lLCBzY2hlbWEuaXRlbXMsIHtcbiAgICAgICAgcGF0aDogYXJyUGF0aCxcbiAgICAgICAgcmVxdWlyZWQ6IHJlcXVpcmVkIHx8IGZhbHNlLFxuICAgICAgICBsb29rdXA6IG9wdGlvbnMubG9va3VwLFxuICAgICAgICBpZ25vcmU6IG9wdGlvbnMuaWdub3JlLFxuICAgICAgICBnbG9iYWw6IG9wdGlvbnMuZ2xvYmFsXG4gICAgICB9KV07XG5cbiAgICAgIHJldHVybiBmO1xuICAgIH1cblxuICB9O1xuXG4gIC8vRmlyc3Qgc29ydGVkIGJ5IHNjaGVtYSB0eXBlIHRoZW4gYSBsaXN0LlxuICAvL09yZGVyIGhhcyBpbXBvcnRhbmNlLiBGaXJzdCBoYW5kbGVyIHJldHVybmluZyBhbiBmb3JtIHNuaXBwZXQgd2lsbCBiZSB1c2VkLlxuICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgc3RyaW5nOiAgW3NlbGVjdCwgdGV4dF0sXG4gICAgb2JqZWN0OiAgW2ZpZWxkc2V0XSxcbiAgICBudW1iZXI6ICBbbnVtYmVyXSxcbiAgICBpbnRlZ2VyOiBbaW50ZWdlcl0sXG4gICAgYm9vbGVhbjogW2NoZWNrYm94XSxcbiAgICBhcnJheTogICBbY2hlY2tib3hlcywgYXJyYXldXG4gIH07XG5cbiAgdmFyIHBvc3RQcm9jZXNzRm4gPSBmdW5jdGlvbihmb3JtKSB7IHJldHVybiBmb3JtOyB9O1xuXG4gIC8qKlxuICAgKiBQcm92aWRlciBBUElcbiAgICovXG4gIHRoaXMuZGVmYXVsdHMgICAgICAgICAgICAgID0gZGVmYXVsdHM7XG4gIHRoaXMuc3RkRm9ybU9iaiAgICAgICAgICAgID0gc3RkRm9ybU9iajtcbiAgdGhpcy5kZWZhdWx0Rm9ybURlZmluaXRpb24gPSBkZWZhdWx0Rm9ybURlZmluaXRpb247XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGEgcG9zdCBwcm9jZXNzIGZ1bmN0aW9uLlxuICAgKiBUaGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCB3aXRoIHRoZSBmdWxseSBtZXJnZWRcbiAgICogZm9ybSBkZWZpbml0aW9uIChpLmUuIGFmdGVyIG1lcmdpbmcgd2l0aCBzY2hlbWEpXG4gICAqIGFuZCB3aGF0ZXZlciBpdCByZXR1cm5zIGlzIHVzZWQgYXMgZm9ybS5cbiAgICovXG4gIHRoaXMucG9zdFByb2Nlc3MgPSBmdW5jdGlvbihmbikge1xuICAgIHBvc3RQcm9jZXNzRm4gPSBmbjtcbiAgfTtcblxuICAvKipcbiAgICogQXBwZW5kIGRlZmF1bHQgZm9ybSBydWxlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSAgIHR5cGUganNvbiBzY2hlbWEgdHlwZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBydWxlIGEgZnVuY3Rpb24ocHJvcGVydHlOYW1lLHByb3BlcnR5U2NoZW1hLG9wdGlvbnMpIHRoYXQgcmV0dXJucyBhIGZvcm1cbiAgICogICAgICAgICAgICAgICAgICAgICAgICBkZWZpbml0aW9uIG9yIHVuZGVmaW5lZFxuICAgKi9cbiAgdGhpcy5hcHBlbmRSdWxlID0gZnVuY3Rpb24odHlwZSwgcnVsZSkge1xuICAgIGlmICghZGVmYXVsdHNbdHlwZV0pIHtcbiAgICAgIGRlZmF1bHRzW3R5cGVdID0gW107XG4gICAgfVxuICAgIGRlZmF1bHRzW3R5cGVdLnB1c2gocnVsZSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFByZXBlbmQgZGVmYXVsdCBmb3JtIHJ1bGVcbiAgICogQHBhcmFtIHtzdHJpbmd9ICAgdHlwZSBqc29uIHNjaGVtYSB0eXBlXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IHJ1bGUgYSBmdW5jdGlvbihwcm9wZXJ0eU5hbWUscHJvcGVydHlTY2hlbWEsb3B0aW9ucykgdGhhdCByZXR1cm5zIGEgZm9ybVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmluaXRpb24gb3IgdW5kZWZpbmVkXG4gICAqL1xuICB0aGlzLnByZXBlbmRSdWxlID0gZnVuY3Rpb24odHlwZSwgcnVsZSkge1xuICAgIGlmICghZGVmYXVsdHNbdHlwZV0pIHtcbiAgICAgIGRlZmF1bHRzW3R5cGVdID0gW107XG4gICAgfVxuICAgIGRlZmF1bHRzW3R5cGVdLnVuc2hpZnQocnVsZSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFV0aWxpdHkgZnVuY3Rpb24gdG8gY3JlYXRlIGEgc3RhbmRhcmQgZm9ybSBvYmplY3QuXG4gICAqIFRoaXMgZG9lcyAqbm90KiBzZXQgdGhlIHR5cGUgb2YgdGhlIGZvcm0gYnV0IHJhdGhlciBhbGwgc2hhcmVkIGF0dHJpYnV0ZXMuXG4gICAqIFlvdSBwcm9iYWJseSB3YW50IHRvIHN0YXJ0IHlvdXIgcnVsZSB3aXRoIGNyZWF0aW5nIHRoZSBmb3JtIHdpdGggdGhpcyBtZXRob2RcbiAgICogdGhlbiBzZXR0aW5nIHR5cGUgYW5kIGFueSBvdGhlciB2YWx1ZXMgeW91IG5lZWQuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBzY2hlbWFcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICogQHJldHVybiB7T2JqZWN0fSBhIGZvcm0gZmllbGQgZGVmaW50aW9uXG4gICAqL1xuICB0aGlzLmNyZWF0ZVN0YW5kYXJkRm9ybSA9IHN0ZEZvcm1PYmo7XG4gIC8qIEVuZCBQcm92aWRlciBBUEkgKi9cblxuICB0aGlzLiRnZXQgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZXJ2aWNlID0ge307XG5cbiAgICBzZXJ2aWNlLm1lcmdlID0gZnVuY3Rpb24oc2NoZW1hLCBmb3JtLCBpZ25vcmUsIG9wdGlvbnMsIHJlYWRvbmx5KSB7XG4gICAgICBmb3JtICA9IGZvcm0gfHwgWycqJ107XG4gICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgICAgLy8gR2V0IHJlYWRvbmx5IGZyb20gcm9vdCBvYmplY3RcbiAgICAgIHJlYWRvbmx5ID0gcmVhZG9ubHkgfHwgc2NoZW1hLnJlYWRvbmx5IHx8IHNjaGVtYS5yZWFkT25seTtcblxuICAgICAgdmFyIHN0ZEZvcm0gPSBzZXJ2aWNlLmRlZmF1bHRzKHNjaGVtYSwgaWdub3JlLCBvcHRpb25zKTtcblxuICAgICAgLy9zaW1wbGUgY2FzZSwgd2UgaGF2ZSBhIFwiKlwiLCBqdXN0IHB1dCB0aGUgc3RkRm9ybSB0aGVyZVxuICAgICAgdmFyIGlkeCA9IGZvcm0uaW5kZXhPZignKicpO1xuICAgICAgaWYgKGlkeCAhPT0gLTEpIHtcbiAgICAgICAgZm9ybSAgPSBmb3JtLnNsaWNlKDAsIGlkeClcbiAgICAgICAgICAgICAgICAgICAgLmNvbmNhdChzdGRGb3JtLmZvcm0pXG4gICAgICAgICAgICAgICAgICAgIC5jb25jYXQoZm9ybS5zbGljZShpZHggKyAxKSk7XG4gICAgICB9XG5cbiAgICAgIC8vb2sgbGV0J3MgbWVyZ2UhXG4gICAgICAvL1dlIGxvb2sgYXQgdGhlIHN1cHBsaWVkIGZvcm0gYW5kIGV4dGVuZCBpdCB3aXRoIHNjaGVtYSBzdGFuZGFyZHNcbiAgICAgIHZhciBsb29rdXAgPSBzdGRGb3JtLmxvb2t1cDtcblxuICAgICAgcmV0dXJuIHBvc3RQcm9jZXNzRm4oZm9ybS5tYXAoZnVuY3Rpb24ob2JqKSB7XG5cbiAgICAgICAgLy9oYW5kbGUgdGhlIHNob3J0Y3V0IHdpdGgganVzdCBhIG5hbWVcbiAgICAgICAgaWYgKHR5cGVvZiBvYmogPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgb2JqID0ge2tleTogb2JqfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvYmoua2V5KSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBvYmoua2V5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgb2JqLmtleSA9IHNmUGF0aFByb3ZpZGVyLnBhcnNlKG9iai5rZXkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vSWYgaXQgaGFzIGEgdGl0bGVNYXAgbWFrZSBzdXJlIGl0J3MgYSBsaXN0XG4gICAgICAgIGlmIChvYmoudGl0bGVNYXApIHtcbiAgICAgICAgICBvYmoudGl0bGVNYXAgPSBjYW5vbmljYWxUaXRsZU1hcChvYmoudGl0bGVNYXApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9cbiAgICAgICAgaWYgKG9iai5pdGVtRm9ybSkge1xuICAgICAgICAgIG9iai5pdGVtcyA9IFtdO1xuICAgICAgICAgIHZhciBzdHIgPSBzZlBhdGhQcm92aWRlci5zdHJpbmdpZnkob2JqLmtleSk7XG4gICAgICAgICAgdmFyIHN0ZEZvcm0gPSBsb29rdXBbc3RyXTtcbiAgICAgICAgICBhbmd1bGFyLmZvckVhY2goc3RkRm9ybS5pdGVtcywgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgdmFyIG8gPSBhbmd1bGFyLmNvcHkob2JqLml0ZW1Gb3JtKTtcbiAgICAgICAgICAgIG8ua2V5ID0gaXRlbS5rZXk7XG4gICAgICAgICAgICBvYmouaXRlbXMucHVzaChvKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vZXh0ZW5kIHdpdGggc3RkIGZvcm0gZnJvbSBzY2hlbWEuXG5cbiAgICAgICAgaWYgKG9iai5rZXkpIHtcbiAgICAgICAgICB2YXIgc3RyaWQgPSBzZlBhdGhQcm92aWRlci5zdHJpbmdpZnkob2JqLmtleSk7XG4gICAgICAgICAgaWYgKGxvb2t1cFtzdHJpZF0pIHtcbiAgICAgICAgICAgIG9iaiA9IGFuZ3VsYXIuZXh0ZW5kKGxvb2t1cFtzdHJpZF0sIG9iaik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQXJlIHdlIGluaGVyaXRpbmcgcmVhZG9ubHk/XG4gICAgICAgIGlmIChyZWFkb25seSA9PT0gdHJ1ZSkgeyAvLyBJbmhlcml0aW5nIGZhbHNlIGlzIG5vdCBjb29sLlxuICAgICAgICAgIG9iai5yZWFkb25seSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvL2lmIGl0J3MgYSB0eXBlIHdpdGggaXRlbXMsIG1lcmdlICdlbSFcbiAgICAgICAgaWYgKG9iai5pdGVtcykge1xuICAgICAgICAgIG9iai5pdGVtcyA9IHNlcnZpY2UubWVyZ2Uoc2NoZW1hLCBvYmouaXRlbXMsIGlnbm9yZSwgb3B0aW9ucywgb2JqLnJlYWRvbmx5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vaWYgaXRzIGhhcyB0YWJzLCBtZXJnZSB0aGVtIGFsc28hXG4gICAgICAgIGlmIChvYmoudGFicykge1xuICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChvYmoudGFicywgZnVuY3Rpb24odGFiKSB7XG4gICAgICAgICAgICB0YWIuaXRlbXMgPSBzZXJ2aWNlLm1lcmdlKHNjaGVtYSwgdGFiLml0ZW1zLCBpZ25vcmUsIG9wdGlvbnMsIG9iai5yZWFkb25seSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTcGVjaWFsIGNhc2U6IGNoZWNrYm94XG4gICAgICAgIC8vIFNpbmNlIGhhdmUgdG8gdGVybmFyeSBzdGF0ZSB3ZSBuZWVkIGEgZGVmYXVsdFxuICAgICAgICBpZiAob2JqLnR5cGUgPT09ICdjaGVja2JveCcgJiYgYW5ndWxhci5pc1VuZGVmaW5lZChvYmouc2NoZW1hWydkZWZhdWx0J10pKSB7XG4gICAgICAgICAgb2JqLnNjaGVtYVsnZGVmYXVsdCddID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgfSkpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgZm9ybSBkZWZhdWx0cyBmcm9tIHNjaGVtYVxuICAgICAqL1xuICAgIHNlcnZpY2UuZGVmYXVsdHMgPSBmdW5jdGlvbihzY2hlbWEsIGlnbm9yZSwgZ2xvYmFsT3B0aW9ucykge1xuICAgICAgdmFyIGZvcm0gICA9IFtdO1xuICAgICAgdmFyIGxvb2t1cCA9IHt9OyAvL01hcCBwYXRoID0+IGZvcm0gb2JqIGZvciBmYXN0IGxvb2t1cCBpbiBtZXJnaW5nXG4gICAgICBpZ25vcmUgPSBpZ25vcmUgfHwge307XG4gICAgICBnbG9iYWxPcHRpb25zID0gZ2xvYmFsT3B0aW9ucyB8fCB7fTtcblxuICAgICAgaWYgKHNjaGVtYS50eXBlID09PSAnb2JqZWN0Jykge1xuICAgICAgICBhbmd1bGFyLmZvckVhY2goc2NoZW1hLnByb3BlcnRpZXMsIGZ1bmN0aW9uKHYsIGspIHtcbiAgICAgICAgICBpZiAoaWdub3JlW2tdICE9PSB0cnVlKSB7XG4gICAgICAgICAgICB2YXIgcmVxdWlyZWQgPSBzY2hlbWEucmVxdWlyZWQgJiYgc2NoZW1hLnJlcXVpcmVkLmluZGV4T2YoaykgIT09IC0xO1xuICAgICAgICAgICAgdmFyIGRlZiA9IGRlZmF1bHRGb3JtRGVmaW5pdGlvbihrLCB2LCB7XG4gICAgICAgICAgICAgIHBhdGg6IFtrXSwgICAgICAgICAvLyBQYXRoIHRvIHRoaXMgcHJvcGVydHkgaW4gYnJhY2tldCBub3RhdGlvbi5cbiAgICAgICAgICAgICAgbG9va3VwOiBsb29rdXAsICAgIC8vIEV4dHJhIG1hcCB0byByZWdpc3RlciB3aXRoLiBPcHRpbWl6YXRpb24gZm9yIG1lcmdlci5cbiAgICAgICAgICAgICAgaWdub3JlOiBpZ25vcmUsICAgIC8vIFRoZSBpZ25vcmUgbGlzdCBvZiBwYXRocyAoc2FucyByb290IGxldmVsIG5hbWUpXG4gICAgICAgICAgICAgIHJlcXVpcmVkOiByZXF1aXJlZCwgLy8gSXMgaXQgcmVxdWlyZWQ/ICh2NCBqc29uIHNjaGVtYSBzdHlsZSlcbiAgICAgICAgICAgICAgZ2xvYmFsOiBnbG9iYWxPcHRpb25zIC8vIEdsb2JhbCBvcHRpb25zLCBpbmNsdWRpbmcgZm9ybSBkZWZhdWx0c1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoZGVmKSB7XG4gICAgICAgICAgICAgIGZvcm0ucHVzaChkZWYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkLiBPbmx5IHR5cGUgXCJvYmplY3RcIiBhbGxvd2VkIGF0IHJvb3QgbGV2ZWwgb2Ygc2NoZW1hLicpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtmb3JtOiBmb3JtLCBsb29rdXA6IGxvb2t1cH07XG4gICAgfTtcblxuICAgIC8vVXRpbGl0eSBmdW5jdGlvbnNcbiAgICAvKipcbiAgICAgKiBUcmF2ZXJzZSBhIHNjaGVtYSwgYXBwbHlpbmcgYSBmdW5jdGlvbihzY2hlbWEscGF0aCkgb24gZXZlcnkgc3ViIHNjaGVtYVxuICAgICAqIGkuZS4gZXZlcnkgcHJvcGVydHkgb2YgYW4gb2JqZWN0LlxuICAgICAqL1xuICAgIHNlcnZpY2UudHJhdmVyc2VTY2hlbWEgPSBmdW5jdGlvbihzY2hlbWEsIGZuLCBwYXRoLCBpZ25vcmVBcnJheXMpIHtcbiAgICAgIGlnbm9yZUFycmF5cyA9IGFuZ3VsYXIuaXNEZWZpbmVkKGlnbm9yZUFycmF5cykgPyBpZ25vcmVBcnJheXMgOiB0cnVlO1xuXG4gICAgICBwYXRoID0gcGF0aCB8fCBbXTtcblxuICAgICAgdmFyIHRyYXZlcnNlID0gZnVuY3Rpb24oc2NoZW1hLCBmbiwgcGF0aCkge1xuICAgICAgICBmbihzY2hlbWEsIHBhdGgpO1xuICAgICAgICBhbmd1bGFyLmZvckVhY2goc2NoZW1hLnByb3BlcnRpZXMsIGZ1bmN0aW9uKHByb3AsIG5hbWUpIHtcbiAgICAgICAgICB2YXIgY3VycmVudFBhdGggPSBwYXRoLnNsaWNlKCk7XG4gICAgICAgICAgY3VycmVudFBhdGgucHVzaChuYW1lKTtcbiAgICAgICAgICB0cmF2ZXJzZShwcm9wLCBmbiwgY3VycmVudFBhdGgpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvL09ubHkgc3VwcG9ydCB0eXBlIFwiYXJyYXlcIiB3aGljaCBoYXZlIGEgc2NoZW1hIGFzIFwiaXRlbXNcIi5cbiAgICAgICAgaWYgKCFpZ25vcmVBcnJheXMgJiYgc2NoZW1hLml0ZW1zKSB7XG4gICAgICAgICAgdmFyIGFyclBhdGggPSBwYXRoLnNsaWNlKCk7IGFyclBhdGgucHVzaCgnJyk7XG4gICAgICAgICAgdHJhdmVyc2Uoc2NoZW1hLml0ZW1zLCBmbiwgYXJyUGF0aCk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHRyYXZlcnNlKHNjaGVtYSwgZm4sIHBhdGggfHwgW10pO1xuICAgIH07XG5cbiAgICBzZXJ2aWNlLnRyYXZlcnNlRm9ybSA9IGZ1bmN0aW9uKGZvcm0sIGZuKSB7XG4gICAgICBmbihmb3JtKTtcbiAgICAgIGFuZ3VsYXIuZm9yRWFjaChmb3JtLml0ZW1zLCBmdW5jdGlvbihmKSB7XG4gICAgICAgIHNlcnZpY2UudHJhdmVyc2VGb3JtKGYsIGZuKTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoZm9ybS50YWJzKSB7XG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaChmb3JtLnRhYnMsIGZ1bmN0aW9uKHRhYikge1xuICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCh0YWIuaXRlbXMsIGZ1bmN0aW9uKGYpIHtcbiAgICAgICAgICAgIHNlcnZpY2UudHJhdmVyc2VGb3JtKGYsIGZuKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBzZXJ2aWNlO1xuICB9O1xuXG59XSk7XG5cbi8qICBDb21tb24gY29kZSBmb3IgdmFsaWRhdGluZyBhIHZhbHVlIGFnYWluc3QgaXRzIGZvcm0gYW5kIHNjaGVtYSBkZWZpbml0aW9uICovXG4vKiBnbG9iYWwgdHY0ICovXG5hbmd1bGFyLm1vZHVsZSgnc2NoZW1hRm9ybScpLmZhY3RvcnkoJ3NmVmFsaWRhdG9yJywgW2Z1bmN0aW9uKCkge1xuXG4gIHZhciB2YWxpZGF0b3IgPSB7fTtcblxuICAvKipcbiAgICogVmFsaWRhdGUgYSB2YWx1ZSBhZ2FpbnN0IGl0cyBmb3JtIGRlZmluaXRpb24gYW5kIHNjaGVtYS5cbiAgICogVGhlIHZhbHVlIHNob3VsZCBlaXRoZXIgYmUgb2YgcHJvcGVyIHR5cGUgb3IgYSBzdHJpbmcsIHNvbWUgdHlwZVxuICAgKiBjb2VyY2lvbiBpcyBhcHBsaWVkLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gZm9ybSBBIG1lcmdlZCBmb3JtIGRlZmluaXRpb24sIGkuZS4gb25lIHdpdGggYSBzY2hlbWEuXG4gICAqIEBwYXJhbSB7QW55fSB2YWx1ZSB0aGUgdmFsdWUgdG8gdmFsaWRhdGUuXG4gICAqIEByZXR1cm4gYSB0djRqcyByZXN1bHQgb2JqZWN0LlxuICAgKi9cbiAgdmFsaWRhdG9yLnZhbGlkYXRlID0gZnVuY3Rpb24oZm9ybSwgdmFsdWUpIHtcbiAgICBpZiAoIWZvcm0pIHtcbiAgICAgIHJldHVybiB7dmFsaWQ6IHRydWV9O1xuICAgIH1cbiAgICB2YXIgc2NoZW1hID0gZm9ybS5zY2hlbWE7XG5cbiAgICBpZiAoIXNjaGVtYSkge1xuICAgICAgcmV0dXJuIHt2YWxpZDogdHJ1ZX07XG4gICAgfVxuXG4gICAgLy8gSW5wdXQgb2YgdHlwZSB0ZXh0IGFuZCB0ZXh0YXJlYXMgd2lsbCBnaXZlIHVzIGEgdmlld1ZhbHVlIG9mICcnXG4gICAgLy8gd2hlbiBlbXB0eSwgdGhpcyBpcyBhIHZhbGlkIHZhbHVlIGluIGEgc2NoZW1hIGFuZCBkb2VzIG5vdCBjb3VudCBhcyBzb21ldGhpbmdcbiAgICAvLyB0aGF0IGJyZWFrcyB2YWxpZGF0aW9uIG9mICdyZXF1aXJlZCcuIEJ1dCBmb3Igb3VyIG93biBzYW5pdHkgYW4gZW1wdHkgZmllbGQgc2hvdWxkXG4gICAgLy8gbm90IHZhbGlkYXRlIGlmIGl0J3MgcmVxdWlyZWQuXG4gICAgaWYgKHZhbHVlID09PSAnJykge1xuICAgICAgdmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgLy8gTnVtYmVycyBmaWVsZHMgd2lsbCBnaXZlIGEgbnVsbCB2YWx1ZSwgd2hpY2ggYWxzbyBtZWFucyBlbXB0eSBmaWVsZFxuICAgIGlmIChmb3JtLnR5cGUgPT09ICdudW1iZXInICYmIHZhbHVlID09PSBudWxsKSB7XG4gICAgICB2YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICAvLyBWZXJzaW9uIDQgb2YgSlNPTiBTY2hlbWEgaGFzIHRoZSByZXF1aXJlZCBwcm9wZXJ0eSBub3Qgb24gdGhlXG4gICAgLy8gcHJvcGVydHkgaXRzZWxmIGJ1dCBvbiB0aGUgd3JhcHBpbmcgb2JqZWN0LiBTaW5jZSB3ZSBsaWtlIHRvIHRlc3RcbiAgICAvLyBvbmx5IHRoaXMgcHJvcGVydHkgd2Ugd3JhcCBpdCBpbiBhIGZha2Ugb2JqZWN0LlxuICAgIHZhciB3cmFwID0ge3R5cGU6ICdvYmplY3QnLCAncHJvcGVydGllcyc6IHt9fTtcbiAgICB2YXIgcHJvcE5hbWUgPSBmb3JtLmtleVtmb3JtLmtleS5sZW5ndGggLSAxXTtcbiAgICB3cmFwLnByb3BlcnRpZXNbcHJvcE5hbWVdID0gc2NoZW1hO1xuXG4gICAgaWYgKGZvcm0ucmVxdWlyZWQpIHtcbiAgICAgIHdyYXAucmVxdWlyZWQgPSBbcHJvcE5hbWVdO1xuICAgIH1cbiAgICB2YXIgdmFsdWVXcmFwID0ge307XG4gICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKHZhbHVlKSkge1xuICAgICAgdmFsdWVXcmFwW3Byb3BOYW1lXSA9IHZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gdHY0LnZhbGlkYXRlUmVzdWx0KHZhbHVlV3JhcCwgd3JhcCk7XG5cbiAgfTtcblxuICByZXR1cm4gdmFsaWRhdG9yO1xufV0pO1xuXG4vKipcbiAqIERpcmVjdGl2ZSB0aGF0IGhhbmRsZXMgdGhlIG1vZGVsIGFycmF5c1xuICovXG5hbmd1bGFyLm1vZHVsZSgnc2NoZW1hRm9ybScpLmRpcmVjdGl2ZSgnc2ZBcnJheScsIFsnc2ZTZWxlY3QnLCAnc2NoZW1hRm9ybScsICdzZlZhbGlkYXRvcicsXG4gIGZ1bmN0aW9uKHNmU2VsZWN0LCBzY2hlbWFGb3JtLCBzZlZhbGlkYXRvcikge1xuXG4gICAgdmFyIHNldEluZGV4ID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihmb3JtKSB7XG4gICAgICAgIGlmIChmb3JtLmtleSkge1xuICAgICAgICAgIGZvcm0ua2V5W2Zvcm0ua2V5LmluZGV4T2YoJycpXSA9IGluZGV4O1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgIHNjb3BlOiB0cnVlLFxuICAgICAgcmVxdWlyZTogJz9uZ01vZGVsJyxcbiAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgbmdNb2RlbCkge1xuICAgICAgICB2YXIgZm9ybURlZkNhY2hlID0ge307XG5cbiAgICAgICAgLy8gV2F0Y2ggZm9yIHRoZSBmb3JtIGRlZmluaXRpb24gYW5kIHRoZW4gcmV3cml0ZSBpdC5cbiAgICAgICAgLy8gSXQncyB0aGUgKGZpcnN0KSBhcnJheSBwYXJ0IG9mIHRoZSBrZXksICdbXScgdGhhdCBuZWVkcyBhIG51bWJlclxuICAgICAgICAvLyBjb3JyZXNwb25kaW5nIHRvIGFuIGluZGV4IG9mIHRoZSBmb3JtLlxuICAgICAgICB2YXIgb25jZSA9IHNjb3BlLiR3YXRjaChhdHRycy5zZkFycmF5LCBmdW5jdGlvbihmb3JtKSB7XG5cbiAgICAgICAgICAvLyBBbiBhcnJheSBtb2RlbCBhbHdheXMgbmVlZHMgYSBrZXkgc28gd2Uga25vdyB3aGF0IHBhcnQgb2YgdGhlIG1vZGVsXG4gICAgICAgICAgLy8gdG8gbG9vayBhdC4gVGhpcyBtYWtlcyB1cyBhIGJpdCBpbmNvbXBhdGlibGUgd2l0aCBKU09OIEZvcm0sIG9uIHRoZVxuICAgICAgICAgIC8vIG90aGVyIGhhbmQgaXQgZW5hYmxlcyB0d28gd2F5IGJpbmRpbmcuXG4gICAgICAgICAgdmFyIGxpc3QgPSBzZlNlbGVjdChmb3JtLmtleSwgc2NvcGUubW9kZWwpO1xuXG4gICAgICAgICAgLy8gU2luY2UgbmctbW9kZWwgaGFwcGlseSBjcmVhdGVzIG9iamVjdHMgaW4gYSBkZWVwIHBhdGggd2hlbiBzZXR0aW5nIGFcbiAgICAgICAgICAvLyBhIHZhbHVlIGJ1dCBub3QgYXJyYXlzIHdlIG5lZWQgdG8gY3JlYXRlIHRoZSBhcnJheS5cbiAgICAgICAgICBpZiAoYW5ndWxhci5pc1VuZGVmaW5lZChsaXN0KSkge1xuICAgICAgICAgICAgbGlzdCA9IFtdO1xuICAgICAgICAgICAgc2ZTZWxlY3QoZm9ybS5rZXksIHNjb3BlLm1vZGVsLCBsaXN0KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgc2NvcGUubW9kZWxBcnJheSA9IGxpc3Q7XG5cbiAgICAgICAgICAvLyBBcnJheXMgd2l0aCB0aXRsZU1hcHMsIGkuZS4gY2hlY2tib3hlcyBkb2Vzbid0IGhhdmUgaXRlbXMuXG4gICAgICAgICAgaWYgKGZvcm0uaXRlbXMpIHtcblxuICAgICAgICAgICAgLy8gVG8gYmUgbW9yZSBjb21wYXRpYmxlIHdpdGggSlNPTiBGb3JtIHdlIHN1cHBvcnQgYW4gYXJyYXkgb2YgaXRlbXNcbiAgICAgICAgICAgIC8vIGluIHRoZSBmb3JtIGRlZmluaXRpb24gb2YgXCJhcnJheVwiICh0aGUgc2NoZW1hIGp1c3QgYSB2YWx1ZSkuXG4gICAgICAgICAgICAvLyBmb3IgdGhlIHN1YmZvcm1zIGNvZGUgdG8gd29yayB0aGlzIG1lYW5zIHdlIHdyYXAgZXZlcnl0aGluZyBpbiBhXG4gICAgICAgICAgICAvLyBzZWN0aW9uLiBVbmxlc3MgdGhlcmUgaXMganVzdCBvbmUuXG4gICAgICAgICAgICB2YXIgc3ViRm9ybSA9IGZvcm0uaXRlbXNbMF07XG4gICAgICAgICAgICBpZiAoZm9ybS5pdGVtcy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgIHN1YkZvcm0gPSB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3NlY3Rpb24nLFxuICAgICAgICAgICAgICAgIGl0ZW1zOiBmb3JtLml0ZW1zLm1hcChmdW5jdGlvbihpdGVtKXtcbiAgICAgICAgICAgICAgICAgIGl0ZW0ubmdNb2RlbE9wdGlvbnMgPSBmb3JtLm5nTW9kZWxPcHRpb25zO1xuICAgICAgICAgICAgICAgICAgaXRlbS5yZWFkb25seSA9IGZvcm0ucmVhZG9ubHk7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gV2UgY2VhdGUgY29waWVzIG9mIHRoZSBmb3JtIG9uIGRlbWFuZCwgY2FjaGluZyB0aGVtIGZvclxuICAgICAgICAgIC8vIGxhdGVyIHJlcXVlc3RzXG4gICAgICAgICAgc2NvcGUuY29weVdpdGhJbmRleCA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgICAgICBpZiAoIWZvcm1EZWZDYWNoZVtpbmRleF0pIHtcbiAgICAgICAgICAgICAgaWYgKHN1YkZvcm0pIHtcbiAgICAgICAgICAgICAgICB2YXIgY29weSA9IGFuZ3VsYXIuY29weShzdWJGb3JtKTtcbiAgICAgICAgICAgICAgICBjb3B5LmFycmF5SW5kZXggPSBpbmRleDtcbiAgICAgICAgICAgICAgICBzY2hlbWFGb3JtLnRyYXZlcnNlRm9ybShjb3B5LCBzZXRJbmRleChpbmRleCkpO1xuICAgICAgICAgICAgICAgIGZvcm1EZWZDYWNoZVtpbmRleF0gPSBjb3B5O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZm9ybURlZkNhY2hlW2luZGV4XTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgc2NvcGUuYXBwZW5kVG9BcnJheSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGxlbiA9IGxpc3QubGVuZ3RoO1xuICAgICAgICAgICAgdmFyIGNvcHkgPSBzY29wZS5jb3B5V2l0aEluZGV4KGxlbik7XG4gICAgICAgICAgICBzY2hlbWFGb3JtLnRyYXZlcnNlRm9ybShjb3B5LCBmdW5jdGlvbihwYXJ0KSB7XG4gICAgICAgICAgICAgIGlmIChwYXJ0LmtleSAmJiBhbmd1bGFyLmlzRGVmaW5lZChwYXJ0WydkZWZhdWx0J10pKSB7XG4gICAgICAgICAgICAgICAgc2ZTZWxlY3QocGFydC5rZXksIHNjb3BlLm1vZGVsLCBwYXJ0WydkZWZhdWx0J10pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gSWYgdGhlcmUgYXJlIG5vIGRlZmF1bHRzIG5vdGhpbmcgaXMgYWRkZWQgc28gd2UgbmVlZCB0byBpbml0aWFsaXplXG4gICAgICAgICAgICAvLyB0aGUgYXJyYXkuIHVuZGVmaW5lZCBmb3IgYmFzaWMgdmFsdWVzLCB7fSBvciBbXSBmb3IgdGhlIG90aGVycy5cbiAgICAgICAgICAgIGlmIChsZW4gPT09IGxpc3QubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIHZhciB0eXBlID0gc2ZTZWxlY3QoJ3NjaGVtYS5pdGVtcy50eXBlJywgZm9ybSk7XG4gICAgICAgICAgICAgIHZhciBkZmx0O1xuICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICBkZmx0ID0ge307XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2FycmF5Jykge1xuICAgICAgICAgICAgICAgIGRmbHQgPSBbXTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBsaXN0LnB1c2goZGZsdCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFRyaWdnZXIgdmFsaWRhdGlvbi5cbiAgICAgICAgICAgIGlmIChzY29wZS52YWxpZGF0ZUFycmF5KSB7XG4gICAgICAgICAgICAgIHNjb3BlLnZhbGlkYXRlQXJyYXkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBsaXN0O1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICBzY29wZS5kZWxldGVGcm9tQXJyYXkgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAgICAgbGlzdC5zcGxpY2UoaW5kZXgsIDEpO1xuXG4gICAgICAgICAgICAvLyBUcmlnZ2VyIHZhbGlkYXRpb24uXG4gICAgICAgICAgICBpZiAoc2NvcGUudmFsaWRhdGVBcnJheSkge1xuICAgICAgICAgICAgICBzY29wZS52YWxpZGF0ZUFycmF5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbGlzdDtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgLy8gQWx3YXlzIHN0YXJ0IHdpdGggb25lIGVtcHR5IGZvcm0gdW5sZXNzIGNvbmZpZ3VyZWQgb3RoZXJ3aXNlLlxuICAgICAgICAgIC8vIFNwZWNpYWwgY2FzZTogZG9uJ3QgZG8gaXQgaWYgZm9ybSBoYXMgYSB0aXRsZU1hcFxuICAgICAgICAgIGlmICghZm9ybS50aXRsZU1hcCAmJiBmb3JtLnN0YXJ0RW1wdHkgIT09IHRydWUgJiYgbGlzdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHNjb3BlLmFwcGVuZFRvQXJyYXkoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBUaXRsZSBNYXAgaGFuZGxpbmdcbiAgICAgICAgICAvLyBJZiBmb3JtIGhhcyBhIHRpdGxlTWFwIGNvbmZpZ3VyZWQgd2UnZCBsaWtlIHRvIGVuYWJsZSBsb29waW5nIG92ZXJcbiAgICAgICAgICAvLyB0aXRsZU1hcCBpbnN0ZWFkIG9mIG1vZGVsQXJyYXksIHRoaXMgaXMgdXNlZCBmb3IgaW50YW5jZSBpblxuICAgICAgICAgIC8vIGNoZWNrYm94ZXMuIFNvIGluc3RlYWQgb2YgdmFyaWFibGUgbnVtYmVyIG9mIHRoaW5ncyB3ZSBsaWtlIHRvIGNyZWF0ZVxuICAgICAgICAgIC8vIGEgYXJyYXkgdmFsdWUgZnJvbSBhIHN1YnNldCBvZiB2YWx1ZXMgaW4gdGhlIHRpdGxlTWFwLlxuICAgICAgICAgIC8vIFRoZSBwcm9ibGVtIGhlcmUgaXMgdGhhdCBuZy1tb2RlbCBvbiBhIGNoZWNrYm94IGRvZXNuJ3QgcmVhbGx5IG1hcCB0b1xuICAgICAgICAgIC8vIGEgbGlzdCBvZiB2YWx1ZXMuIFRoaXMgaXMgaGVyZSB0byBmaXggdGhhdC5cbiAgICAgICAgICBpZiAoZm9ybS50aXRsZU1hcCAmJiBmb3JtLnRpdGxlTWFwLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHNjb3BlLnRpdGxlTWFwVmFsdWVzID0gW107XG5cbiAgICAgICAgICAgIC8vIFdlIHdhdGNoIHRoZSBtb2RlbCBmb3IgY2hhbmdlcyBhbmQgdGhlIHRpdGxlTWFwVmFsdWVzIHRvIHJlZmxlY3RcbiAgICAgICAgICAgIC8vIHRoZSBtb2RlbEFycmF5XG4gICAgICAgICAgICB2YXIgdXBkYXRlVGl0bGVNYXBWYWx1ZXMgPSBmdW5jdGlvbihhcnIpIHtcbiAgICAgICAgICAgICAgc2NvcGUudGl0bGVNYXBWYWx1ZXMgPSBbXTtcbiAgICAgICAgICAgICAgYXJyID0gYXJyIHx8IFtdO1xuXG4gICAgICAgICAgICAgIGZvcm0udGl0bGVNYXAuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgc2NvcGUudGl0bGVNYXBWYWx1ZXMucHVzaChhcnIuaW5kZXhPZihpdGVtLnZhbHVlKSAhPT0gLTEpO1xuICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8vQ2F0Y2ggZGVmYXVsdCB2YWx1ZXNcbiAgICAgICAgICAgIHVwZGF0ZVRpdGxlTWFwVmFsdWVzKHNjb3BlLm1vZGVsQXJyYXkpO1xuICAgICAgICAgICAgc2NvcGUuJHdhdGNoQ29sbGVjdGlvbignbW9kZWxBcnJheScsIHVwZGF0ZVRpdGxlTWFwVmFsdWVzKTtcblxuICAgICAgICAgICAgLy9UbyBnZXQgdHdvIHdheSBiaW5kaW5nIHdlIGFsc28gd2F0Y2ggb3VyIHRpdGxlTWFwVmFsdWVzXG4gICAgICAgICAgICBzY29wZS4kd2F0Y2hDb2xsZWN0aW9uKCd0aXRsZU1hcFZhbHVlcycsIGZ1bmN0aW9uKHZhbHMpIHtcbiAgICAgICAgICAgICAgaWYgKHZhbHMpIHtcbiAgICAgICAgICAgICAgICB2YXIgYXJyID0gc2NvcGUubW9kZWxBcnJheTtcblxuICAgICAgICAgICAgICAgIC8vIEFwcGFyZW50bHkgdGhlIGZhc3Rlc3Qgd2F5IHRvIGNsZWFyIGFuIGFycmF5LCByZWFkYWJsZSB0b28uXG4gICAgICAgICAgICAgICAgLy8gaHR0cDovL2pzcGVyZi5jb20vYXJyYXktZGVzdHJveS8zMlxuICAgICAgICAgICAgICAgIHdoaWxlIChhcnIubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgYXJyLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9ybS50aXRsZU1hcC5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0sIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICBpZiAodmFsc1tpbmRleF0pIHtcbiAgICAgICAgICAgICAgICAgICAgYXJyLnB1c2goaXRlbS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gSWYgdGhlcmUgaXMgYSBuZ01vZGVsIHByZXNlbnQgd2UgbmVlZCB0byB2YWxpZGF0ZSB3aGVuIGFza2VkLlxuICAgICAgICAgIGlmIChuZ01vZGVsKSB7XG4gICAgICAgICAgICB2YXIgZXJyb3I7XG5cbiAgICAgICAgICAgIHNjb3BlLnZhbGlkYXRlQXJyYXkgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgLy8gVGhlIGFjdHVhbCBjb250ZW50IG9mIHRoZSBhcnJheSBpcyB2YWxpZGF0ZWQgYnkgZWFjaCBmaWVsZFxuICAgICAgICAgICAgICAvLyBzbyB3ZSBzZXR0bGUgZm9yIGNoZWNraW5nIHZhbGlkYXRpb25zIHNwZWNpZmljIHRvIGFycmF5c1xuXG4gICAgICAgICAgICAgIC8vIFNpbmNlIHdlIHByZWZpbGwgd2l0aCBlbXB0eSBhcnJheXMgd2UgY2FuIGdldCB0aGUgZnVubnkgc2l0dWF0aW9uXG4gICAgICAgICAgICAgIC8vIHdoZXJlIHRoZSBhcnJheSBpcyByZXF1aXJlZCBidXQgZW1wdHkgaW4gdGhlIGd1aSBidXQgc3RpbGwgdmFsaWRhdGVzLlxuICAgICAgICAgICAgICAvLyBUaGF0cyB3aHkgd2UgY2hlY2sgdGhlIGxlbmd0aC5cbiAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHNmVmFsaWRhdG9yLnZhbGlkYXRlKFxuICAgICAgICAgICAgICAgIGZvcm0sXG4gICAgICAgICAgICAgICAgc2NvcGUubW9kZWxBcnJheS5sZW5ndGggPiAwID8gc2NvcGUubW9kZWxBcnJheSA6IHVuZGVmaW5lZFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICBpZiAocmVzdWx0LnZhbGlkID09PSBmYWxzZSAmJlxuICAgICAgICAgICAgICAgICAgcmVzdWx0LmVycm9yICYmXG4gICAgICAgICAgICAgICAgICAocmVzdWx0LmVycm9yLmRhdGFQYXRoID09PSAnJyB8fFxuICAgICAgICAgICAgICAgICAgcmVzdWx0LmVycm9yLmRhdGFQYXRoID09PSAnLycgKyBmb3JtLmtleVtmb3JtLmtleS5sZW5ndGggLSAxXSkpIHtcblxuICAgICAgICAgICAgICAgIC8vIFNldCB2aWV3VmFsdWUgdG8gdHJpZ2dlciAkZGlydHkgb24gZmllbGQuIElmIHNvbWVvbmUga25vd3MgYVxuICAgICAgICAgICAgICAgIC8vIGEgYmV0dGVyIHdheSB0byBkbyBpdCBwbGVhc2UgdGVsbC5cbiAgICAgICAgICAgICAgICBuZ01vZGVsLiRzZXRWaWV3VmFsdWUoc2NvcGUubW9kZWxBcnJheSk7XG4gICAgICAgICAgICAgICAgZXJyb3IgPSByZXN1bHQuZXJyb3I7XG4gICAgICAgICAgICAgICAgbmdNb2RlbC4kc2V0VmFsaWRpdHkoJ3NjaGVtYScsIGZhbHNlKTtcblxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5nTW9kZWwuJHNldFZhbGlkaXR5KCdzY2hlbWEnLCB0cnVlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2NvcGUuJG9uKCdzY2hlbWFGb3JtVmFsaWRhdGUnLCBzY29wZS52YWxpZGF0ZUFycmF5KTtcblxuICAgICAgICAgICAgc2NvcGUuaGFzU3VjY2VzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gbmdNb2RlbC4kdmFsaWQgJiYgIW5nTW9kZWwuJHByaXN0aW5lO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2NvcGUuaGFzRXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIG5nTW9kZWwuJGludmFsaWQ7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzY29wZS5zY2hlbWFFcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gZXJyb3I7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgb25jZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5dKTtcblxuLyoqXG4gKiBBIHZlcnNpb24gb2YgbmctY2hhbmdlZCB0aGF0IG9ubHkgbGlzdGVucyBpZlxuICogdGhlcmUgaXMgYWN0dWFsbHkgYSBvbkNoYW5nZSBkZWZpbmVkIG9uIHRoZSBmb3JtXG4gKlxuICogVGFrZXMgdGhlIGZvcm0gZGVmaW5pdGlvbiBhcyBhcmd1bWVudC5cbiAqIElmIHRoZSBmb3JtIGRlZmluaXRpb24gaGFzIGEgXCJvbkNoYW5nZVwiIGRlZmluZWQgYXMgZWl0aGVyIGEgZnVuY3Rpb24gb3JcbiAqL1xuYW5ndWxhci5tb2R1bGUoJ3NjaGVtYUZvcm0nKS5kaXJlY3RpdmUoJ3NmQ2hhbmdlZCcsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHJlcXVpcmU6ICduZ01vZGVsJyxcbiAgICByZXN0cmljdDogJ0FDJyxcbiAgICBzY29wZTogZmFsc2UsXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XG4gICAgICB2YXIgZm9ybSA9IHNjb3BlLiRldmFsKGF0dHJzLnNmQ2hhbmdlZCk7XG4gICAgICAvL1wiZm9ybVwiIGlzIHJlYWxseSBndWFyYW50ZWVkIHRvIGJlIGhlcmUgc2luY2UgdGhlIGRlY29yYXRvciBkaXJlY3RpdmVcbiAgICAgIC8vd2FpdHMgZm9yIGl0LiBCdXQgYmVzdCBiZSBzdXJlLlxuICAgICAgaWYgKGZvcm0gJiYgZm9ybS5vbkNoYW5nZSkge1xuICAgICAgICBjdHJsLiR2aWV3Q2hhbmdlTGlzdGVuZXJzLnB1c2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKGFuZ3VsYXIuaXNGdW5jdGlvbihmb3JtLm9uQ2hhbmdlKSkge1xuICAgICAgICAgICAgZm9ybS5vbkNoYW5nZShjdHJsLiRtb2RlbFZhbHVlLCBmb3JtKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2NvcGUuZXZhbEV4cHIoZm9ybS5vbkNoYW5nZSwgeydtb2RlbFZhbHVlJzogY3RybC4kbW9kZWxWYWx1ZSwgZm9ybTogZm9ybX0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufSk7XG5cbi8qXG5GSVhNRTogcmVhbCBkb2N1bWVudGF0aW9uXG48Zm9ybSBzZi1mb3JtPVwiZm9ybVwiICBzZi1zY2hlbWE9XCJzY2hlbWFcIiBzZi1kZWNvcmF0b3I9XCJmb29iYXJcIj48L2Zvcm0+XG4qL1xuXG5hbmd1bGFyLm1vZHVsZSgnc2NoZW1hRm9ybScpXG4gICAgICAgLmRpcmVjdGl2ZSgnc2ZTY2hlbWEnLFxuWyckY29tcGlsZScsICdzY2hlbWFGb3JtJywgJ3NjaGVtYUZvcm1EZWNvcmF0b3JzJywgJ3NmU2VsZWN0JyxcbiAgZnVuY3Rpb24oJGNvbXBpbGUsICBzY2hlbWFGb3JtLCAgc2NoZW1hRm9ybURlY29yYXRvcnMsIHNmU2VsZWN0KSB7XG5cbiAgICB2YXIgU05BS0VfQ0FTRV9SRUdFWFAgPSAvW0EtWl0vZztcbiAgICB2YXIgc25ha2VDYXNlID0gZnVuY3Rpb24obmFtZSwgc2VwYXJhdG9yKSB7XG4gICAgICBzZXBhcmF0b3IgPSBzZXBhcmF0b3IgfHwgJ18nO1xuICAgICAgcmV0dXJuIG5hbWUucmVwbGFjZShTTkFLRV9DQVNFX1JFR0VYUCwgZnVuY3Rpb24obGV0dGVyLCBwb3MpIHtcbiAgICAgICAgcmV0dXJuIChwb3MgPyBzZXBhcmF0b3IgOiAnJykgKyBsZXR0ZXIudG9Mb3dlckNhc2UoKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgc2NvcGU6IHtcbiAgICAgICAgc2NoZW1hOiAnPXNmU2NoZW1hJyxcbiAgICAgICAgaW5pdGlhbEZvcm06ICc9c2ZGb3JtJyxcbiAgICAgICAgbW9kZWw6ICc9c2ZNb2RlbCcsXG4gICAgICAgIG9wdGlvbnM6ICc9c2ZPcHRpb25zJ1xuICAgICAgfSxcbiAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgZnVuY3Rpb24oJHNjb3BlKSB7XG4gICAgICAgIHRoaXMuZXZhbEluUGFyZW50U2NvcGUgPSBmdW5jdGlvbihleHByLCBsb2NhbHMpIHtcbiAgICAgICAgICByZXR1cm4gJHNjb3BlLiRwYXJlbnQuJGV2YWwoZXhwciwgbG9jYWxzKTtcbiAgICAgICAgfTtcbiAgICAgIH1dLFxuICAgICAgcmVwbGFjZTogZmFsc2UsXG4gICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgIHJlcXVpcmU6ICc/Zm9ybScsXG4gICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIGZvcm1DdHJsLCB0cmFuc2NsdWRlKSB7XG5cbiAgICAgICAgLy9leHBvc2UgZm9ybSBjb250cm9sbGVyIG9uIHNjb3BlIHNvIHRoYXQgd2UgZG9uJ3QgZm9yY2UgYXV0aG9ycyB0byB1c2UgbmFtZSBvbiBmb3JtXG4gICAgICAgIHNjb3BlLmZvcm1DdHJsID0gZm9ybUN0cmw7XG5cbiAgICAgICAgLy9XZSdkIGxpa2UgdG8gaGFuZGxlIGV4aXN0aW5nIG1hcmt1cCxcbiAgICAgICAgLy9iZXNpZGVzIHVzaW5nIGl0IGluIG91ciB0ZW1wbGF0ZSB3ZSBhbHNvXG4gICAgICAgIC8vY2hlY2sgZm9yIG5nLW1vZGVsIGFuZCBhZGQgdGhhdCB0byBhbiBpZ25vcmUgbGlzdFxuICAgICAgICAvL2kuZS4gZXZlbiBpZiBmb3JtIGhhcyBhIGRlZmluaXRpb24gZm9yIGl0IG9yIGZvcm0gaXMgW1wiKlwiXVxuICAgICAgICAvL3dlIGRvbid0IGdlbmVyYXRlIGl0LlxuICAgICAgICB2YXIgaWdub3JlID0ge307XG4gICAgICAgIHRyYW5zY2x1ZGUoc2NvcGUsIGZ1bmN0aW9uKGNsb25lKSB7XG4gICAgICAgICAgY2xvbmUuYWRkQ2xhc3MoJ3NjaGVtYS1mb3JtLWlnbm9yZScpO1xuICAgICAgICAgIGVsZW1lbnQucHJlcGVuZChjbG9uZSk7XG5cbiAgICAgICAgICBpZiAoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yQWxsKSB7XG4gICAgICAgICAgICB2YXIgbW9kZWxzID0gZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yQWxsKCdbbmctbW9kZWxdJyk7XG4gICAgICAgICAgICBpZiAobW9kZWxzKSB7XG4gICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW9kZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGtleSA9IG1vZGVsc1tpXS5nZXRBdHRyaWJ1dGUoJ25nLW1vZGVsJyk7XG4gICAgICAgICAgICAgICAgLy9za2lwIGZpcnN0IHBhcnQgYmVmb3JlIC5cbiAgICAgICAgICAgICAgICBpZ25vcmVba2V5LnN1YnN0cmluZyhrZXkuaW5kZXhPZignLicpICsgMSldID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vU2luY2Ugd2UgYXJlIGRlcGVuZGFudCBvbiB1cCB0byB0aHJlZVxuICAgICAgICAvL2F0dHJpYnV0ZXMgd2UnbGwgZG8gYSBjb21tb24gd2F0Y2hcbiAgICAgICAgdmFyIGxhc3REaWdlc3QgPSB7fTtcblxuICAgICAgICBzY29wZS4kd2F0Y2goZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICB2YXIgc2NoZW1hID0gc2NvcGUuc2NoZW1hO1xuICAgICAgICAgIHZhciBmb3JtICAgPSBzY29wZS5pbml0aWFsRm9ybSB8fCBbJyonXTtcblxuICAgICAgICAgIC8vVGhlIGNoZWNrIGZvciBzY2hlbWEudHlwZSBpcyB0byBlbnN1cmUgdGhhdCBzY2hlbWEgaXMgbm90IHt9XG4gICAgICAgICAgaWYgKGZvcm0gJiYgc2NoZW1hICYmIHNjaGVtYS50eXBlICYmXG4gICAgICAgICAgICAgIChsYXN0RGlnZXN0LmZvcm0gIT09IGZvcm0gfHwgbGFzdERpZ2VzdC5zY2hlbWEgIT09IHNjaGVtYSkgJiZcbiAgICAgICAgICAgICAgT2JqZWN0LmtleXMoc2NoZW1hLnByb3BlcnRpZXMpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGxhc3REaWdlc3Quc2NoZW1hID0gc2NoZW1hO1xuICAgICAgICAgICAgbGFzdERpZ2VzdC5mb3JtID0gZm9ybTtcblxuICAgICAgICAgICAgdmFyIG1lcmdlZCA9IHNjaGVtYUZvcm0ubWVyZ2Uoc2NoZW1hLCBmb3JtLCBpZ25vcmUsIHNjb3BlLm9wdGlvbnMpO1xuICAgICAgICAgICAgdmFyIGZyYWcgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG5cbiAgICAgICAgICAgIC8vbWFrZSB0aGUgZm9ybSBhdmFpbGFibGUgdG8gZGVjb3JhdG9yc1xuICAgICAgICAgICAgc2NvcGUuc2NoZW1hRm9ybSAgPSB7Zm9ybTogIG1lcmdlZCwgc2NoZW1hOiBzY2hlbWF9O1xuXG4gICAgICAgICAgICAvL2NsZWFuIGFsbCBidXQgcHJlIGV4aXN0aW5nIGh0bWwuXG4gICAgICAgICAgICBlbGVtZW50LmNoaWxkcmVuKCc6bm90KC5zY2hlbWEtZm9ybS1pZ25vcmUpJykucmVtb3ZlKCk7XG5cbiAgICAgICAgICAgIC8vQ3JlYXRlIGRpcmVjdGl2ZXMgZnJvbSB0aGUgZm9ybSBkZWZpbml0aW9uXG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2gobWVyZ2VkLGZ1bmN0aW9uKG9iaixpKXtcbiAgICAgICAgICAgICAgdmFyIG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGF0dHJzLnNmRGVjb3JhdG9yIHx8IHNuYWtlQ2FzZShzY2hlbWFGb3JtRGVjb3JhdG9ycy5kZWZhdWx0RGVjb3JhdG9yLCctJykpO1xuICAgICAgICAgICAgICBuLnNldEF0dHJpYnV0ZSgnZm9ybScsJ3NjaGVtYUZvcm0uZm9ybVsnK2krJ10nKTtcbiAgICAgICAgICAgICAgdmFyIHNsb3Q7XG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgc2xvdCA9IGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignKltzZi1pbnNlcnQtZmllbGQ9XCInICsgb2JqLmtleSArICdcIl0nKTtcbiAgICAgICAgICAgICAgfSBjYXRjaChlcnIpIHtcbiAgICAgICAgICAgICAgICAvLyBmaWVsZCBpbnNlcnRpb24gbm90IHN1cHBvcnRlZCBmb3IgY29tcGxleCBrZXlzXG4gICAgICAgICAgICAgICAgc2xvdCA9IG51bGw7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYoc2xvdCkge1xuICAgICAgICAgICAgICAgIHNsb3QuaW5uZXJIVE1MID0gXCJcIjtcbiAgICAgICAgICAgICAgICBzbG90LmFwcGVuZENoaWxkKG4pOyAgXG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZnJhZy5hcHBlbmRDaGlsZChuKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGVsZW1lbnRbMF0uYXBwZW5kQ2hpbGQoZnJhZyk7XG5cbiAgICAgICAgICAgIC8vY29tcGlsZSBvbmx5IGNoaWxkcmVuXG4gICAgICAgICAgICAkY29tcGlsZShlbGVtZW50LmNoaWxkcmVuKCkpKHNjb3BlKTtcblxuICAgICAgICAgICAgLy9vaywgbm93IHRoYXQgdGhhdCBpcyBkb25lIGxldCdzIHNldCBhbnkgZGVmYXVsdHNcbiAgICAgICAgICAgIHNjaGVtYUZvcm0udHJhdmVyc2VTY2hlbWEoc2NoZW1hLCBmdW5jdGlvbihwcm9wLCBwYXRoKSB7XG4gICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZChwcm9wWydkZWZhdWx0J10pKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZhbCA9IHNmU2VsZWN0KHBhdGgsIHNjb3BlLm1vZGVsKTtcbiAgICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc1VuZGVmaW5lZCh2YWwpKSB7XG4gICAgICAgICAgICAgICAgICBzZlNlbGVjdChwYXRoLCBzY29wZS5tb2RlbCwgcHJvcFsnZGVmYXVsdCddKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXSk7XG5cbmFuZ3VsYXIubW9kdWxlKCdzY2hlbWFGb3JtJykuZGlyZWN0aXZlKCdzY2hlbWFWYWxpZGF0ZScsIFsnc2ZWYWxpZGF0b3InLCBmdW5jdGlvbihzZlZhbGlkYXRvcikge1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnQScsXG4gICAgc2NvcGU6IGZhbHNlLFxuICAgIC8vIFdlIHdhbnQgdGhlIGxpbmsgZnVuY3Rpb24gdG8gYmUgKmFmdGVyKiB0aGUgaW5wdXQgZGlyZWN0aXZlcyBsaW5rIGZ1bmN0aW9uIHNvIHdlIGdldCBhY2Nlc3NcbiAgICAvLyB0aGUgcGFyc2VkIHZhbHVlLCBleC4gYSBudW1iZXIgaW5zdGVhZCBvZiBhIHN0cmluZ1xuICAgIHByaW9yaXR5OiAxMDAwLFxuICAgIHJlcXVpcmU6ICduZ01vZGVsJyxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIG5nTW9kZWwpIHtcbiAgICAgIC8vU2luY2Ugd2UgaGF2ZSBzY29wZSBmYWxzZSB0aGlzIGlzIHRoZSBzYW1lIHNjb3BlXG4gICAgICAvL2FzIHRoZSBkZWNvcmF0b3JcbiAgICAgIHNjb3BlLm5nTW9kZWwgPSBuZ01vZGVsO1xuXG4gICAgICB2YXIgZXJyb3IgPSBudWxsO1xuXG4gICAgICB2YXIgZ2V0Rm9ybSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIWZvcm0pIHtcbiAgICAgICAgICBmb3JtID0gc2NvcGUuJGV2YWwoYXR0cnMuc2NoZW1hVmFsaWRhdGUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmb3JtO1xuICAgICAgfTtcbiAgICAgIHZhciBmb3JtICAgPSBnZXRGb3JtKCk7XG5cbiAgICAgIC8vIFZhbGlkYXRlIGFnYWluc3QgdGhlIHNjaGVtYS5cblxuICAgICAgLy8gR2V0IGluIGxhc3Qgb2YgdGhlIHBhcnNlcyBzbyB0aGUgcGFyc2VkIHZhbHVlIGhhcyB0aGUgY29ycmVjdCB0eXBlLlxuICAgICAgaWYgKG5nTW9kZWwuJHZhbGlkYXRvcnMpIHsgLy8gQW5ndWxhciAxLjNcbiAgICAgICAgbmdNb2RlbC4kdmFsaWRhdG9ycy5zY2hlbWEgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIHZhciByZXN1bHQgPSBzZlZhbGlkYXRvci52YWxpZGF0ZShnZXRGb3JtKCksIHZhbHVlKTtcbiAgICAgICAgICBlcnJvciA9IHJlc3VsdC5lcnJvcjtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0LnZhbGlkO1xuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcblxuICAgICAgICAvLyBBbmd1bGFyIDEuMlxuICAgICAgICBuZ01vZGVsLiRwYXJzZXJzLnB1c2goZnVuY3Rpb24odmlld1ZhbHVlKSB7XG4gICAgICAgICAgZm9ybSA9IGdldEZvcm0oKTtcbiAgICAgICAgICAvL1N0aWxsIG1pZ2h0IGJlIHVuZGVmaW5lZFxuICAgICAgICAgIGlmICghZm9ybSkge1xuICAgICAgICAgICAgcmV0dXJuIHZpZXdWYWx1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgcmVzdWx0ID0gIHNmVmFsaWRhdG9yLnZhbGlkYXRlKGZvcm0sIHZpZXdWYWx1ZSk7XG5cbiAgICAgICAgICBpZiAocmVzdWx0LnZhbGlkKSB7XG4gICAgICAgICAgICAvLyBpdCBpcyB2YWxpZFxuICAgICAgICAgICAgbmdNb2RlbC4kc2V0VmFsaWRpdHkoJ3NjaGVtYScsIHRydWUpO1xuICAgICAgICAgICAgcmV0dXJuIHZpZXdWYWx1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gaXQgaXMgaW52YWxpZCwgcmV0dXJuIHVuZGVmaW5lZCAobm8gbW9kZWwgdXBkYXRlKVxuICAgICAgICAgICAgbmdNb2RlbC4kc2V0VmFsaWRpdHkoJ3NjaGVtYScsIGZhbHNlKTtcbiAgICAgICAgICAgIGVycm9yID0gcmVzdWx0LmVycm9yO1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG5cbiAgICAgIC8vIExpc3RlbiB0byBhbiBldmVudCBzbyB3ZSBjYW4gdmFsaWRhdGUgdGhlIGlucHV0IG9uIHJlcXVlc3RcbiAgICAgIHNjb3BlLiRvbignc2NoZW1hRm9ybVZhbGlkYXRlJywgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgaWYgKG5nTW9kZWwuJHZhbGlkYXRlKSB7XG4gICAgICAgICAgbmdNb2RlbC4kdmFsaWRhdGUoKTtcbiAgICAgICAgICBpZiAobmdNb2RlbC4kaW52YWxpZCkgeyAvLyBUaGUgZmllbGQgbXVzdCBiZSBtYWRlIGRpcnR5IHNvIHRoZSBlcnJvciBtZXNzYWdlIGlzIGRpc3BsYXllZFxuICAgICAgICAgICAgbmdNb2RlbC4kZGlydHkgPSB0cnVlO1xuICAgICAgICAgICAgbmdNb2RlbC4kcHJpc3RpbmUgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmdNb2RlbC4kc2V0Vmlld1ZhbHVlKG5nTW9kZWwuJHZpZXdWYWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvL1RoaXMgd29ya3Mgc2luY2Ugd2Ugbm93IHdlJ3JlIGluc2lkZSBhIGRlY29yYXRvciBhbmQgdGhhdCB0aGlzIGlzIHRoZSBkZWNvcmF0b3JzIHNjb3BlLlxuICAgICAgLy9JZiAkcHJpc3RpbmUgYW5kIGVtcHR5IGRvbid0IHNob3cgc3VjY2VzcyAoZXZlbiBpZiBpdCdzIHZhbGlkKVxuICAgICAgc2NvcGUuaGFzU3VjY2VzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbmdNb2RlbC4kdmFsaWQgJiYgKCFuZ01vZGVsLiRwcmlzdGluZSB8fCAhbmdNb2RlbC4kaXNFbXB0eShuZ01vZGVsLiRtb2RlbFZhbHVlKSk7XG4gICAgICB9O1xuXG4gICAgICBzY29wZS5oYXNFcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbmdNb2RlbC4kaW52YWxpZCAmJiAhbmdNb2RlbC4kcHJpc3RpbmU7XG4gICAgICB9O1xuXG4gICAgICBzY29wZS5zY2hlbWFFcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gZXJyb3I7XG4gICAgICB9O1xuXG4gICAgfVxuICB9O1xufV0pO1xuIiwiLyohXG4gKiBhbmd1bGFyLXRyYW5zbGF0ZSAtIHYyLjQuMiAtIDIwMTQtMTAtMjFcbiAqIGh0dHA6Ly9naXRodWIuY29tL2FuZ3VsYXItdHJhbnNsYXRlL2FuZ3VsYXItdHJhbnNsYXRlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQgOyBMaWNlbnNlZCBNSVRcbiAqL1xuYW5ndWxhci5tb2R1bGUoJ3Bhc2NhbHByZWNodC50cmFuc2xhdGUnLCBbJ25nJ10pLnJ1bihbXG4gICckdHJhbnNsYXRlJyxcbiAgZnVuY3Rpb24gKCR0cmFuc2xhdGUpIHtcbiAgICB2YXIga2V5ID0gJHRyYW5zbGF0ZS5zdG9yYWdlS2V5KCksIHN0b3JhZ2UgPSAkdHJhbnNsYXRlLnN0b3JhZ2UoKTtcbiAgICBpZiAoc3RvcmFnZSkge1xuICAgICAgaWYgKCFzdG9yYWdlLmdldChrZXkpKSB7XG4gICAgICAgIGlmIChhbmd1bGFyLmlzU3RyaW5nKCR0cmFuc2xhdGUucHJlZmVycmVkTGFuZ3VhZ2UoKSkpIHtcbiAgICAgICAgICAkdHJhbnNsYXRlLnVzZSgkdHJhbnNsYXRlLnByZWZlcnJlZExhbmd1YWdlKCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0b3JhZ2Uuc2V0KGtleSwgJHRyYW5zbGF0ZS51c2UoKSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICR0cmFuc2xhdGUudXNlKHN0b3JhZ2UuZ2V0KGtleSkpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoYW5ndWxhci5pc1N0cmluZygkdHJhbnNsYXRlLnByZWZlcnJlZExhbmd1YWdlKCkpKSB7XG4gICAgICAkdHJhbnNsYXRlLnVzZSgkdHJhbnNsYXRlLnByZWZlcnJlZExhbmd1YWdlKCkpO1xuICAgIH1cbiAgfVxuXSk7XG5hbmd1bGFyLm1vZHVsZSgncGFzY2FscHJlY2h0LnRyYW5zbGF0ZScpLnByb3ZpZGVyKCckdHJhbnNsYXRlJywgW1xuICAnJFNUT1JBR0VfS0VZJyxcbiAgZnVuY3Rpb24gKCRTVE9SQUdFX0tFWSkge1xuICAgIHZhciAkdHJhbnNsYXRpb25UYWJsZSA9IHt9LCAkcHJlZmVycmVkTGFuZ3VhZ2UsICRhdmFpbGFibGVMYW5ndWFnZUtleXMgPSBbXSwgJGxhbmd1YWdlS2V5QWxpYXNlcywgJGZhbGxiYWNrTGFuZ3VhZ2UsICRmYWxsYmFja1dhc1N0cmluZywgJHVzZXMsICRuZXh0TGFuZywgJHN0b3JhZ2VGYWN0b3J5LCAkc3RvcmFnZUtleSA9ICRTVE9SQUdFX0tFWSwgJHN0b3JhZ2VQcmVmaXgsICRtaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyRmFjdG9yeSwgJGludGVycG9sYXRpb25GYWN0b3J5LCAkaW50ZXJwb2xhdG9yRmFjdG9yaWVzID0gW10sICRpbnRlcnBvbGF0aW9uU2FuaXRpemF0aW9uU3RyYXRlZ3kgPSBmYWxzZSwgJGxvYWRlckZhY3RvcnksICRjbG9ha0NsYXNzTmFtZSA9ICd0cmFuc2xhdGUtY2xvYWsnLCAkbG9hZGVyT3B0aW9ucywgJG5vdEZvdW5kSW5kaWNhdG9yTGVmdCwgJG5vdEZvdW5kSW5kaWNhdG9yUmlnaHQsICRwb3N0Q29tcGlsaW5nRW5hYmxlZCA9IGZhbHNlLCBORVNURURfT0JKRUNUX0RFTElNSVRFUiA9ICcuJywgbG9hZGVyQ2FjaGU7XG4gICAgdmFyIHZlcnNpb24gPSAnMi40LjInO1xuICAgIHZhciBnZXRMb2NhbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgbmF2ID0gd2luZG93Lm5hdmlnYXRvcjtcbiAgICAgIHJldHVybiAoKGFuZ3VsYXIuaXNBcnJheShuYXYubGFuZ3VhZ2VzKSA/IG5hdi5sYW5ndWFnZXNbMF0gOiBuYXYubGFuZ3VhZ2UgfHwgbmF2LmJyb3dzZXJMYW5ndWFnZSB8fCBuYXYuc3lzdGVtTGFuZ3VhZ2UgfHwgbmF2LnVzZXJMYW5ndWFnZSkgfHwgJycpLnNwbGl0KCctJykuam9pbignXycpO1xuICAgIH07XG4gICAgdmFyIGluZGV4T2YgPSBmdW5jdGlvbiAoYXJyYXksIHNlYXJjaEVsZW1lbnQpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBhcnJheS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBpZiAoYXJyYXlbaV0gPT09IHNlYXJjaEVsZW1lbnQpIHtcbiAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIC0xO1xuICAgIH07XG4gICAgdmFyIHRyaW0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG4gICAgfTtcbiAgICB2YXIgbmVnb3RpYXRlTG9jYWxlID0gZnVuY3Rpb24gKHByZWZlcnJlZCkge1xuICAgICAgdmFyIGF2YWlsID0gW10sIGxvY2FsZSA9IGFuZ3VsYXIubG93ZXJjYXNlKHByZWZlcnJlZCksIGkgPSAwLCBuID0gJGF2YWlsYWJsZUxhbmd1YWdlS2V5cy5sZW5ndGg7XG4gICAgICBmb3IgKDsgaSA8IG47IGkrKykge1xuICAgICAgICBhdmFpbC5wdXNoKGFuZ3VsYXIubG93ZXJjYXNlKCRhdmFpbGFibGVMYW5ndWFnZUtleXNbaV0pKTtcbiAgICAgIH1cbiAgICAgIGlmIChpbmRleE9mKGF2YWlsLCBsb2NhbGUpID4gLTEpIHtcbiAgICAgICAgcmV0dXJuIHByZWZlcnJlZDtcbiAgICAgIH1cbiAgICAgIGlmICgkbGFuZ3VhZ2VLZXlBbGlhc2VzKSB7XG4gICAgICAgIHZhciBhbGlhcztcbiAgICAgICAgZm9yICh2YXIgbGFuZ0tleUFsaWFzIGluICRsYW5ndWFnZUtleUFsaWFzZXMpIHtcbiAgICAgICAgICB2YXIgaGFzV2lsZGNhcmRLZXkgPSBmYWxzZTtcbiAgICAgICAgICB2YXIgaGFzRXhhY3RLZXkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoJGxhbmd1YWdlS2V5QWxpYXNlcywgbGFuZ0tleUFsaWFzKSAmJiBhbmd1bGFyLmxvd2VyY2FzZShsYW5nS2V5QWxpYXMpID09PSBhbmd1bGFyLmxvd2VyY2FzZShwcmVmZXJyZWQpO1xuICAgICAgICAgIGlmIChsYW5nS2V5QWxpYXMuc2xpY2UoLTEpID09PSAnKicpIHtcbiAgICAgICAgICAgIGhhc1dpbGRjYXJkS2V5ID0gbGFuZ0tleUFsaWFzLnNsaWNlKDAsIC0xKSA9PT0gcHJlZmVycmVkLnNsaWNlKDAsIGxhbmdLZXlBbGlhcy5sZW5ndGggLSAxKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGhhc0V4YWN0S2V5IHx8IGhhc1dpbGRjYXJkS2V5KSB7XG4gICAgICAgICAgICBhbGlhcyA9ICRsYW5ndWFnZUtleUFsaWFzZXNbbGFuZ0tleUFsaWFzXTtcbiAgICAgICAgICAgIGlmIChpbmRleE9mKGF2YWlsLCBhbmd1bGFyLmxvd2VyY2FzZShhbGlhcykpID4gLTEpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGFsaWFzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmFyIHBhcnRzID0gcHJlZmVycmVkLnNwbGl0KCdfJyk7XG4gICAgICBpZiAocGFydHMubGVuZ3RoID4gMSAmJiBpbmRleE9mKGF2YWlsLCBhbmd1bGFyLmxvd2VyY2FzZShwYXJ0c1swXSkpID4gLTEpIHtcbiAgICAgICAgcmV0dXJuIHBhcnRzWzBdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByZWZlcnJlZDtcbiAgICB9O1xuICAgIHZhciB0cmFuc2xhdGlvbnMgPSBmdW5jdGlvbiAobGFuZ0tleSwgdHJhbnNsYXRpb25UYWJsZSkge1xuICAgICAgaWYgKCFsYW5nS2V5ICYmICF0cmFuc2xhdGlvblRhYmxlKSB7XG4gICAgICAgIHJldHVybiAkdHJhbnNsYXRpb25UYWJsZTtcbiAgICAgIH1cbiAgICAgIGlmIChsYW5nS2V5ICYmICF0cmFuc2xhdGlvblRhYmxlKSB7XG4gICAgICAgIGlmIChhbmd1bGFyLmlzU3RyaW5nKGxhbmdLZXkpKSB7XG4gICAgICAgICAgcmV0dXJuICR0cmFuc2xhdGlvblRhYmxlW2xhbmdLZXldO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoIWFuZ3VsYXIuaXNPYmplY3QoJHRyYW5zbGF0aW9uVGFibGVbbGFuZ0tleV0pKSB7XG4gICAgICAgICAgJHRyYW5zbGF0aW9uVGFibGVbbGFuZ0tleV0gPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBhbmd1bGFyLmV4dGVuZCgkdHJhbnNsYXRpb25UYWJsZVtsYW5nS2V5XSwgZmxhdE9iamVjdCh0cmFuc2xhdGlvblRhYmxlKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIHRoaXMudHJhbnNsYXRpb25zID0gdHJhbnNsYXRpb25zO1xuICAgIHRoaXMuY2xvYWtDbGFzc05hbWUgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgaWYgKCFuYW1lKSB7XG4gICAgICAgIHJldHVybiAkY2xvYWtDbGFzc05hbWU7XG4gICAgICB9XG4gICAgICAkY2xvYWtDbGFzc05hbWUgPSBuYW1lO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICB2YXIgZmxhdE9iamVjdCA9IGZ1bmN0aW9uIChkYXRhLCBwYXRoLCByZXN1bHQsIHByZXZLZXkpIHtcbiAgICAgIHZhciBrZXksIGtleVdpdGhQYXRoLCBrZXlXaXRoU2hvcnRQYXRoLCB2YWw7XG4gICAgICBpZiAoIXBhdGgpIHtcbiAgICAgICAgcGF0aCA9IFtdO1xuICAgICAgfVxuICAgICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgICAgcmVzdWx0ID0ge307XG4gICAgICB9XG4gICAgICBmb3IgKGtleSBpbiBkYXRhKSB7XG4gICAgICAgIGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGRhdGEsIGtleSkpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICB2YWwgPSBkYXRhW2tleV07XG4gICAgICAgIGlmIChhbmd1bGFyLmlzT2JqZWN0KHZhbCkpIHtcbiAgICAgICAgICBmbGF0T2JqZWN0KHZhbCwgcGF0aC5jb25jYXQoa2V5KSwgcmVzdWx0LCBrZXkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGtleVdpdGhQYXRoID0gcGF0aC5sZW5ndGggPyAnJyArIHBhdGguam9pbihORVNURURfT0JKRUNUX0RFTElNSVRFUikgKyBORVNURURfT0JKRUNUX0RFTElNSVRFUiArIGtleSA6IGtleTtcbiAgICAgICAgICBpZiAocGF0aC5sZW5ndGggJiYga2V5ID09PSBwcmV2S2V5KSB7XG4gICAgICAgICAgICBrZXlXaXRoU2hvcnRQYXRoID0gJycgKyBwYXRoLmpvaW4oTkVTVEVEX09CSkVDVF9ERUxJTUlURVIpO1xuICAgICAgICAgICAgcmVzdWx0W2tleVdpdGhTaG9ydFBhdGhdID0gJ0A6JyArIGtleVdpdGhQYXRoO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXN1bHRba2V5V2l0aFBhdGhdID0gdmFsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gICAgdGhpcy5hZGRJbnRlcnBvbGF0aW9uID0gZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICAgICRpbnRlcnBvbGF0b3JGYWN0b3JpZXMucHVzaChmYWN0b3J5KTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgdGhpcy51c2VNZXNzYWdlRm9ybWF0SW50ZXJwb2xhdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLnVzZUludGVycG9sYXRpb24oJyR0cmFuc2xhdGVNZXNzYWdlRm9ybWF0SW50ZXJwb2xhdGlvbicpO1xuICAgIH07XG4gICAgdGhpcy51c2VJbnRlcnBvbGF0aW9uID0gZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICAgICRpbnRlcnBvbGF0aW9uRmFjdG9yeSA9IGZhY3Rvcnk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIHRoaXMudXNlU2FuaXRpemVWYWx1ZVN0cmF0ZWd5ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAkaW50ZXJwb2xhdGlvblNhbml0aXphdGlvblN0cmF0ZWd5ID0gdmFsdWU7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIHRoaXMucHJlZmVycmVkTGFuZ3VhZ2UgPSBmdW5jdGlvbiAobGFuZ0tleSkge1xuICAgICAgc2V0dXBQcmVmZXJyZWRMYW5ndWFnZShsYW5nS2V5KTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgdmFyIHNldHVwUHJlZmVycmVkTGFuZ3VhZ2UgPSBmdW5jdGlvbiAobGFuZ0tleSkge1xuICAgICAgaWYgKGxhbmdLZXkpIHtcbiAgICAgICAgJHByZWZlcnJlZExhbmd1YWdlID0gbGFuZ0tleTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAkcHJlZmVycmVkTGFuZ3VhZ2U7XG4gICAgfTtcbiAgICB0aGlzLnRyYW5zbGF0aW9uTm90Rm91bmRJbmRpY2F0b3IgPSBmdW5jdGlvbiAoaW5kaWNhdG9yKSB7XG4gICAgICB0aGlzLnRyYW5zbGF0aW9uTm90Rm91bmRJbmRpY2F0b3JMZWZ0KGluZGljYXRvcik7XG4gICAgICB0aGlzLnRyYW5zbGF0aW9uTm90Rm91bmRJbmRpY2F0b3JSaWdodChpbmRpY2F0b3IpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICB0aGlzLnRyYW5zbGF0aW9uTm90Rm91bmRJbmRpY2F0b3JMZWZ0ID0gZnVuY3Rpb24gKGluZGljYXRvcikge1xuICAgICAgaWYgKCFpbmRpY2F0b3IpIHtcbiAgICAgICAgcmV0dXJuICRub3RGb3VuZEluZGljYXRvckxlZnQ7XG4gICAgICB9XG4gICAgICAkbm90Rm91bmRJbmRpY2F0b3JMZWZ0ID0gaW5kaWNhdG9yO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICB0aGlzLnRyYW5zbGF0aW9uTm90Rm91bmRJbmRpY2F0b3JSaWdodCA9IGZ1bmN0aW9uIChpbmRpY2F0b3IpIHtcbiAgICAgIGlmICghaW5kaWNhdG9yKSB7XG4gICAgICAgIHJldHVybiAkbm90Rm91bmRJbmRpY2F0b3JSaWdodDtcbiAgICAgIH1cbiAgICAgICRub3RGb3VuZEluZGljYXRvclJpZ2h0ID0gaW5kaWNhdG9yO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICB0aGlzLmZhbGxiYWNrTGFuZ3VhZ2UgPSBmdW5jdGlvbiAobGFuZ0tleSkge1xuICAgICAgZmFsbGJhY2tTdGFjayhsYW5nS2V5KTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgdmFyIGZhbGxiYWNrU3RhY2sgPSBmdW5jdGlvbiAobGFuZ0tleSkge1xuICAgICAgaWYgKGxhbmdLZXkpIHtcbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNTdHJpbmcobGFuZ0tleSkpIHtcbiAgICAgICAgICAkZmFsbGJhY2tXYXNTdHJpbmcgPSB0cnVlO1xuICAgICAgICAgICRmYWxsYmFja0xhbmd1YWdlID0gW2xhbmdLZXldO1xuICAgICAgICB9IGVsc2UgaWYgKGFuZ3VsYXIuaXNBcnJheShsYW5nS2V5KSkge1xuICAgICAgICAgICRmYWxsYmFja1dhc1N0cmluZyA9IGZhbHNlO1xuICAgICAgICAgICRmYWxsYmFja0xhbmd1YWdlID0gbGFuZ0tleTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYW5ndWxhci5pc1N0cmluZygkcHJlZmVycmVkTGFuZ3VhZ2UpICYmIGluZGV4T2YoJGZhbGxiYWNrTGFuZ3VhZ2UsICRwcmVmZXJyZWRMYW5ndWFnZSkgPCAwKSB7XG4gICAgICAgICAgJGZhbGxiYWNrTGFuZ3VhZ2UucHVzaCgkcHJlZmVycmVkTGFuZ3VhZ2UpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCRmYWxsYmFja1dhc1N0cmluZykge1xuICAgICAgICAgIHJldHVybiAkZmFsbGJhY2tMYW5ndWFnZVswXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gJGZhbGxiYWNrTGFuZ3VhZ2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICAgIHRoaXMudXNlID0gZnVuY3Rpb24gKGxhbmdLZXkpIHtcbiAgICAgIGlmIChsYW5nS2V5KSB7XG4gICAgICAgIGlmICghJHRyYW5zbGF0aW9uVGFibGVbbGFuZ0tleV0gJiYgISRsb2FkZXJGYWN0b3J5KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCckdHJhbnNsYXRlUHJvdmlkZXIgY291bGRuXFwndCBmaW5kIHRyYW5zbGF0aW9uVGFibGUgZm9yIGxhbmdLZXk6IFxcJycgKyBsYW5nS2V5ICsgJ1xcJycpO1xuICAgICAgICB9XG4gICAgICAgICR1c2VzID0gbGFuZ0tleTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgICByZXR1cm4gJHVzZXM7XG4gICAgfTtcbiAgICB2YXIgc3RvcmFnZUtleSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIGlmICgha2V5KSB7XG4gICAgICAgIGlmICgkc3RvcmFnZVByZWZpeCkge1xuICAgICAgICAgIHJldHVybiAkc3RvcmFnZVByZWZpeCArICRzdG9yYWdlS2V5O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAkc3RvcmFnZUtleTtcbiAgICAgIH1cbiAgICAgICRzdG9yYWdlS2V5ID0ga2V5O1xuICAgIH07XG4gICAgdGhpcy5zdG9yYWdlS2V5ID0gc3RvcmFnZUtleTtcbiAgICB0aGlzLnVzZVVybExvYWRlciA9IGZ1bmN0aW9uICh1cmwsIG9wdGlvbnMpIHtcbiAgICAgIHJldHVybiB0aGlzLnVzZUxvYWRlcignJHRyYW5zbGF0ZVVybExvYWRlcicsIGFuZ3VsYXIuZXh0ZW5kKHsgdXJsOiB1cmwgfSwgb3B0aW9ucykpO1xuICAgIH07XG4gICAgdGhpcy51c2VTdGF0aWNGaWxlc0xvYWRlciA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICByZXR1cm4gdGhpcy51c2VMb2FkZXIoJyR0cmFuc2xhdGVTdGF0aWNGaWxlc0xvYWRlcicsIG9wdGlvbnMpO1xuICAgIH07XG4gICAgdGhpcy51c2VMb2FkZXIgPSBmdW5jdGlvbiAobG9hZGVyRmFjdG9yeSwgb3B0aW9ucykge1xuICAgICAgJGxvYWRlckZhY3RvcnkgPSBsb2FkZXJGYWN0b3J5O1xuICAgICAgJGxvYWRlck9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICB0aGlzLnVzZUxvY2FsU3RvcmFnZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLnVzZVN0b3JhZ2UoJyR0cmFuc2xhdGVMb2NhbFN0b3JhZ2UnKTtcbiAgICB9O1xuICAgIHRoaXMudXNlQ29va2llU3RvcmFnZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLnVzZVN0b3JhZ2UoJyR0cmFuc2xhdGVDb29raWVTdG9yYWdlJyk7XG4gICAgfTtcbiAgICB0aGlzLnVzZVN0b3JhZ2UgPSBmdW5jdGlvbiAoc3RvcmFnZUZhY3RvcnkpIHtcbiAgICAgICRzdG9yYWdlRmFjdG9yeSA9IHN0b3JhZ2VGYWN0b3J5O1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICB0aGlzLnN0b3JhZ2VQcmVmaXggPSBmdW5jdGlvbiAocHJlZml4KSB7XG4gICAgICBpZiAoIXByZWZpeCkge1xuICAgICAgICByZXR1cm4gcHJlZml4O1xuICAgICAgfVxuICAgICAgJHN0b3JhZ2VQcmVmaXggPSBwcmVmaXg7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIHRoaXMudXNlTWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlckxvZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLnVzZU1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXIoJyR0cmFuc2xhdGVNaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyTG9nJyk7XG4gICAgfTtcbiAgICB0aGlzLnVzZU1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXIgPSBmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgICAgJG1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXJGYWN0b3J5ID0gZmFjdG9yeTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgdGhpcy51c2VQb3N0Q29tcGlsaW5nID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAkcG9zdENvbXBpbGluZ0VuYWJsZWQgPSAhIXZhbHVlO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICB0aGlzLmRldGVybWluZVByZWZlcnJlZExhbmd1YWdlID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgICB2YXIgbG9jYWxlID0gZm4gJiYgYW5ndWxhci5pc0Z1bmN0aW9uKGZuKSA/IGZuKCkgOiBnZXRMb2NhbGUoKTtcbiAgICAgIGlmICghJGF2YWlsYWJsZUxhbmd1YWdlS2V5cy5sZW5ndGgpIHtcbiAgICAgICAgJHByZWZlcnJlZExhbmd1YWdlID0gbG9jYWxlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJHByZWZlcnJlZExhbmd1YWdlID0gbmVnb3RpYXRlTG9jYWxlKGxvY2FsZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIHRoaXMucmVnaXN0ZXJBdmFpbGFibGVMYW5ndWFnZUtleXMgPSBmdW5jdGlvbiAobGFuZ3VhZ2VLZXlzLCBhbGlhc2VzKSB7XG4gICAgICBpZiAobGFuZ3VhZ2VLZXlzKSB7XG4gICAgICAgICRhdmFpbGFibGVMYW5ndWFnZUtleXMgPSBsYW5ndWFnZUtleXM7XG4gICAgICAgIGlmIChhbGlhc2VzKSB7XG4gICAgICAgICAgJGxhbmd1YWdlS2V5QWxpYXNlcyA9IGFsaWFzZXM7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgICByZXR1cm4gJGF2YWlsYWJsZUxhbmd1YWdlS2V5cztcbiAgICB9O1xuICAgIHRoaXMudXNlTG9hZGVyQ2FjaGUgPSBmdW5jdGlvbiAoY2FjaGUpIHtcbiAgICAgIGlmIChjYWNoZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgbG9hZGVyQ2FjaGUgPSB1bmRlZmluZWQ7XG4gICAgICB9IGVsc2UgaWYgKGNhY2hlID09PSB0cnVlKSB7XG4gICAgICAgIGxvYWRlckNhY2hlID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGNhY2hlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBsb2FkZXJDYWNoZSA9ICckdHJhbnNsYXRpb25DYWNoZSc7XG4gICAgICB9IGVsc2UgaWYgKGNhY2hlKSB7XG4gICAgICAgIGxvYWRlckNhY2hlID0gY2FjaGU7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIHRoaXMuJGdldCA9IFtcbiAgICAgICckbG9nJyxcbiAgICAgICckaW5qZWN0b3InLFxuICAgICAgJyRyb290U2NvcGUnLFxuICAgICAgJyRxJyxcbiAgICAgIGZ1bmN0aW9uICgkbG9nLCAkaW5qZWN0b3IsICRyb290U2NvcGUsICRxKSB7XG4gICAgICAgIHZhciBTdG9yYWdlLCBkZWZhdWx0SW50ZXJwb2xhdG9yID0gJGluamVjdG9yLmdldCgkaW50ZXJwb2xhdGlvbkZhY3RvcnkgfHwgJyR0cmFuc2xhdGVEZWZhdWx0SW50ZXJwb2xhdGlvbicpLCBwZW5kaW5nTG9hZGVyID0gZmFsc2UsIGludGVycG9sYXRvckhhc2hNYXAgPSB7fSwgbGFuZ1Byb21pc2VzID0ge30sIGZhbGxiYWNrSW5kZXgsIHN0YXJ0RmFsbGJhY2tJdGVyYXRpb247XG4gICAgICAgIHZhciAkdHJhbnNsYXRlID0gZnVuY3Rpb24gKHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zLCBpbnRlcnBvbGF0aW9uSWQpIHtcbiAgICAgICAgICBpZiAoYW5ndWxhci5pc0FycmF5KHRyYW5zbGF0aW9uSWQpKSB7XG4gICAgICAgICAgICB2YXIgdHJhbnNsYXRlQWxsID0gZnVuY3Rpb24gKHRyYW5zbGF0aW9uSWRzKSB7XG4gICAgICAgICAgICAgIHZhciByZXN1bHRzID0ge307XG4gICAgICAgICAgICAgIHZhciBwcm9taXNlcyA9IFtdO1xuICAgICAgICAgICAgICB2YXIgdHJhbnNsYXRlID0gZnVuY3Rpb24gKHRyYW5zbGF0aW9uSWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgICAgIHZhciByZWdhcmRsZXNzID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICByZXN1bHRzW3RyYW5zbGF0aW9uSWRdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKFtcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNsYXRpb25JZCxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVcbiAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgJHRyYW5zbGF0ZSh0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgaW50ZXJwb2xhdGlvbklkKS50aGVuKHJlZ2FyZGxlc3MsIHJlZ2FyZGxlc3MpO1xuICAgICAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgYyA9IHRyYW5zbGF0aW9uSWRzLmxlbmd0aDsgaSA8IGM7IGkrKykge1xuICAgICAgICAgICAgICAgIHByb21pc2VzLnB1c2godHJhbnNsYXRlKHRyYW5zbGF0aW9uSWRzW2ldKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuICRxLmFsbChwcm9taXNlcykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiB0cmFuc2xhdGVBbGwodHJhbnNsYXRpb25JZCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgaWYgKHRyYW5zbGF0aW9uSWQpIHtcbiAgICAgICAgICAgIHRyYW5zbGF0aW9uSWQgPSB0cmltLmFwcGx5KHRyYW5zbGF0aW9uSWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgcHJvbWlzZVRvV2FpdEZvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgdmFyIHByb21pc2UgPSAkcHJlZmVycmVkTGFuZ3VhZ2UgPyBsYW5nUHJvbWlzZXNbJHByZWZlcnJlZExhbmd1YWdlXSA6IGxhbmdQcm9taXNlc1skdXNlc107XG4gICAgICAgICAgICAgIGZhbGxiYWNrSW5kZXggPSAwO1xuICAgICAgICAgICAgICBpZiAoJHN0b3JhZ2VGYWN0b3J5ICYmICFwcm9taXNlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGxhbmdLZXkgPSBTdG9yYWdlLmdldCgkc3RvcmFnZUtleSk7XG4gICAgICAgICAgICAgICAgcHJvbWlzZSA9IGxhbmdQcm9taXNlc1tsYW5nS2V5XTtcbiAgICAgICAgICAgICAgICBpZiAoJGZhbGxiYWNrTGFuZ3VhZ2UgJiYgJGZhbGxiYWNrTGFuZ3VhZ2UubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSBpbmRleE9mKCRmYWxsYmFja0xhbmd1YWdlLCBsYW5nS2V5KTtcbiAgICAgICAgICAgICAgICAgIGZhbGxiYWNrSW5kZXggPSBpbmRleCA9PT0gMCA/IDEgOiAwO1xuICAgICAgICAgICAgICAgICAgaWYgKGluZGV4T2YoJGZhbGxiYWNrTGFuZ3VhZ2UsICRwcmVmZXJyZWRMYW5ndWFnZSkgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgICRmYWxsYmFja0xhbmd1YWdlLnB1c2goJHByZWZlcnJlZExhbmd1YWdlKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICAgICAgICB9KCk7XG4gICAgICAgICAgaWYgKCFwcm9taXNlVG9XYWl0Rm9yKSB7XG4gICAgICAgICAgICBkZXRlcm1pbmVUcmFuc2xhdGlvbih0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgaW50ZXJwb2xhdGlvbklkKS50aGVuKGRlZmVycmVkLnJlc29sdmUsIGRlZmVycmVkLnJlamVjdCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHByb21pc2VUb1dhaXRGb3IudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIGRldGVybWluZVRyYW5zbGF0aW9uKHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zLCBpbnRlcnBvbGF0aW9uSWQpLnRoZW4oZGVmZXJyZWQucmVzb2x2ZSwgZGVmZXJyZWQucmVqZWN0KTtcbiAgICAgICAgICAgIH0sIGRlZmVycmVkLnJlamVjdCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgYXBwbHlOb3RGb3VuZEluZGljYXRvcnMgPSBmdW5jdGlvbiAodHJhbnNsYXRpb25JZCkge1xuICAgICAgICAgIGlmICgkbm90Rm91bmRJbmRpY2F0b3JMZWZ0KSB7XG4gICAgICAgICAgICB0cmFuc2xhdGlvbklkID0gW1xuICAgICAgICAgICAgICAkbm90Rm91bmRJbmRpY2F0b3JMZWZ0LFxuICAgICAgICAgICAgICB0cmFuc2xhdGlvbklkXG4gICAgICAgICAgICBdLmpvaW4oJyAnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCRub3RGb3VuZEluZGljYXRvclJpZ2h0KSB7XG4gICAgICAgICAgICB0cmFuc2xhdGlvbklkID0gW1xuICAgICAgICAgICAgICB0cmFuc2xhdGlvbklkLFxuICAgICAgICAgICAgICAkbm90Rm91bmRJbmRpY2F0b3JSaWdodFxuICAgICAgICAgICAgXS5qb2luKCcgJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0cmFuc2xhdGlvbklkO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgdXNlTGFuZ3VhZ2UgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgJHVzZXMgPSBrZXk7XG4gICAgICAgICAgJHJvb3RTY29wZS4kZW1pdCgnJHRyYW5zbGF0ZUNoYW5nZVN1Y2Nlc3MnLCB7IGxhbmd1YWdlOiBrZXkgfSk7XG4gICAgICAgICAgaWYgKCRzdG9yYWdlRmFjdG9yeSkge1xuICAgICAgICAgICAgU3RvcmFnZS5zZXQoJHRyYW5zbGF0ZS5zdG9yYWdlS2V5KCksICR1c2VzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZGVmYXVsdEludGVycG9sYXRvci5zZXRMb2NhbGUoJHVzZXMpO1xuICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChpbnRlcnBvbGF0b3JIYXNoTWFwLCBmdW5jdGlvbiAoaW50ZXJwb2xhdG9yLCBpZCkge1xuICAgICAgICAgICAgaW50ZXJwb2xhdG9ySGFzaE1hcFtpZF0uc2V0TG9jYWxlKCR1c2VzKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICAkcm9vdFNjb3BlLiRlbWl0KCckdHJhbnNsYXRlQ2hhbmdlRW5kJywgeyBsYW5ndWFnZToga2V5IH0pO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgbG9hZEFzeW5jID0gZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgIGlmICgha2V5KSB7XG4gICAgICAgICAgICB0aHJvdyAnTm8gbGFuZ3VhZ2Uga2V5IHNwZWNpZmllZCBmb3IgbG9hZGluZy4nO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICRyb290U2NvcGUuJGVtaXQoJyR0cmFuc2xhdGVMb2FkaW5nU3RhcnQnLCB7IGxhbmd1YWdlOiBrZXkgfSk7XG4gICAgICAgICAgcGVuZGluZ0xvYWRlciA9IHRydWU7XG4gICAgICAgICAgdmFyIGNhY2hlID0gbG9hZGVyQ2FjaGU7XG4gICAgICAgICAgaWYgKHR5cGVvZiBjYWNoZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGNhY2hlID0gJGluamVjdG9yLmdldChjYWNoZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciBsb2FkZXJPcHRpb25zID0gYW5ndWxhci5leHRlbmQoe30sICRsb2FkZXJPcHRpb25zLCB7XG4gICAgICAgICAgICAgIGtleToga2V5LFxuICAgICAgICAgICAgICAkaHR0cDogYW5ndWxhci5leHRlbmQoe30sIHsgY2FjaGU6IGNhY2hlIH0sICRsb2FkZXJPcHRpb25zLiRodHRwKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgJGluamVjdG9yLmdldCgkbG9hZGVyRmFjdG9yeSkobG9hZGVyT3B0aW9ucykudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgdmFyIHRyYW5zbGF0aW9uVGFibGUgPSB7fTtcbiAgICAgICAgICAgICRyb290U2NvcGUuJGVtaXQoJyR0cmFuc2xhdGVMb2FkaW5nU3VjY2VzcycsIHsgbGFuZ3VhZ2U6IGtleSB9KTtcbiAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzQXJyYXkoZGF0YSkpIHtcbiAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGRhdGEsIGZ1bmN0aW9uICh0YWJsZSkge1xuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHRyYW5zbGF0aW9uVGFibGUsIGZsYXRPYmplY3QodGFibGUpKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBhbmd1bGFyLmV4dGVuZCh0cmFuc2xhdGlvblRhYmxlLCBmbGF0T2JqZWN0KGRhdGEpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBlbmRpbmdMb2FkZXIgPSBmYWxzZTtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoe1xuICAgICAgICAgICAgICBrZXk6IGtleSxcbiAgICAgICAgICAgICAgdGFibGU6IHRyYW5zbGF0aW9uVGFibGVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kZW1pdCgnJHRyYW5zbGF0ZUxvYWRpbmdFbmQnLCB7IGxhbmd1YWdlOiBrZXkgfSk7XG4gICAgICAgICAgfSwgZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kZW1pdCgnJHRyYW5zbGF0ZUxvYWRpbmdFcnJvcicsIHsgbGFuZ3VhZ2U6IGtleSB9KTtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChrZXkpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kZW1pdCgnJHRyYW5zbGF0ZUxvYWRpbmdFbmQnLCB7IGxhbmd1YWdlOiBrZXkgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG4gICAgICAgIGlmICgkc3RvcmFnZUZhY3RvcnkpIHtcbiAgICAgICAgICBTdG9yYWdlID0gJGluamVjdG9yLmdldCgkc3RvcmFnZUZhY3RvcnkpO1xuICAgICAgICAgIGlmICghU3RvcmFnZS5nZXQgfHwgIVN0b3JhZ2Uuc2V0KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkblxcJ3QgdXNlIHN0b3JhZ2UgXFwnJyArICRzdG9yYWdlRmFjdG9yeSArICdcXCcsIG1pc3NpbmcgZ2V0KCkgb3Igc2V0KCkgbWV0aG9kIScpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKGRlZmF1bHRJbnRlcnBvbGF0b3IudXNlU2FuaXRpemVWYWx1ZVN0cmF0ZWd5KSkge1xuICAgICAgICAgIGRlZmF1bHRJbnRlcnBvbGF0b3IudXNlU2FuaXRpemVWYWx1ZVN0cmF0ZWd5KCRpbnRlcnBvbGF0aW9uU2FuaXRpemF0aW9uU3RyYXRlZ3kpO1xuICAgICAgICB9XG4gICAgICAgIGlmICgkaW50ZXJwb2xhdG9yRmFjdG9yaWVzLmxlbmd0aCkge1xuICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCgkaW50ZXJwb2xhdG9yRmFjdG9yaWVzLCBmdW5jdGlvbiAoaW50ZXJwb2xhdG9yRmFjdG9yeSkge1xuICAgICAgICAgICAgdmFyIGludGVycG9sYXRvciA9ICRpbmplY3Rvci5nZXQoaW50ZXJwb2xhdG9yRmFjdG9yeSk7XG4gICAgICAgICAgICBpbnRlcnBvbGF0b3Iuc2V0TG9jYWxlKCRwcmVmZXJyZWRMYW5ndWFnZSB8fCAkdXNlcyk7XG4gICAgICAgICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKGludGVycG9sYXRvci51c2VTYW5pdGl6ZVZhbHVlU3RyYXRlZ3kpKSB7XG4gICAgICAgICAgICAgIGludGVycG9sYXRvci51c2VTYW5pdGl6ZVZhbHVlU3RyYXRlZ3koJGludGVycG9sYXRpb25TYW5pdGl6YXRpb25TdHJhdGVneSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbnRlcnBvbGF0b3JIYXNoTWFwW2ludGVycG9sYXRvci5nZXRJbnRlcnBvbGF0aW9uSWRlbnRpZmllcigpXSA9IGludGVycG9sYXRvcjtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZ2V0VHJhbnNsYXRpb25UYWJsZSA9IGZ1bmN0aW9uIChsYW5nS2V5KSB7XG4gICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKCR0cmFuc2xhdGlvblRhYmxlLCBsYW5nS2V5KSkge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgkdHJhbnNsYXRpb25UYWJsZVtsYW5nS2V5XSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChsYW5nUHJvbWlzZXNbbGFuZ0tleV0pIHtcbiAgICAgICAgICAgIGxhbmdQcm9taXNlc1tsYW5nS2V5XS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgIHRyYW5zbGF0aW9ucyhkYXRhLmtleSwgZGF0YS50YWJsZSk7XG4gICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YS50YWJsZSk7XG4gICAgICAgICAgICB9LCBkZWZlcnJlZC5yZWplY3QpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG4gICAgICAgIHZhciBnZXRGYWxsYmFja1RyYW5zbGF0aW9uID0gZnVuY3Rpb24gKGxhbmdLZXksIHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zLCBJbnRlcnBvbGF0b3IpIHtcbiAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgIGdldFRyYW5zbGF0aW9uVGFibGUobGFuZ0tleSkudGhlbihmdW5jdGlvbiAodHJhbnNsYXRpb25UYWJsZSkge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0cmFuc2xhdGlvblRhYmxlLCB0cmFuc2xhdGlvbklkKSkge1xuICAgICAgICAgICAgICBJbnRlcnBvbGF0b3Iuc2V0TG9jYWxlKGxhbmdLZXkpO1xuICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKEludGVycG9sYXRvci5pbnRlcnBvbGF0ZSh0cmFuc2xhdGlvblRhYmxlW3RyYW5zbGF0aW9uSWRdLCBpbnRlcnBvbGF0ZVBhcmFtcykpO1xuICAgICAgICAgICAgICBJbnRlcnBvbGF0b3Iuc2V0TG9jYWxlKCR1c2VzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sIGRlZmVycmVkLnJlamVjdCk7XG4gICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG4gICAgICAgIHZhciBnZXRGYWxsYmFja1RyYW5zbGF0aW9uSW5zdGFudCA9IGZ1bmN0aW9uIChsYW5nS2V5LCB0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgSW50ZXJwb2xhdG9yKSB7XG4gICAgICAgICAgdmFyIHJlc3VsdCwgdHJhbnNsYXRpb25UYWJsZSA9ICR0cmFuc2xhdGlvblRhYmxlW2xhbmdLZXldO1xuICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodHJhbnNsYXRpb25UYWJsZSwgdHJhbnNsYXRpb25JZCkpIHtcbiAgICAgICAgICAgIEludGVycG9sYXRvci5zZXRMb2NhbGUobGFuZ0tleSk7XG4gICAgICAgICAgICByZXN1bHQgPSBJbnRlcnBvbGF0b3IuaW50ZXJwb2xhdGUodHJhbnNsYXRpb25UYWJsZVt0cmFuc2xhdGlvbklkXSwgaW50ZXJwb2xhdGVQYXJhbXMpO1xuICAgICAgICAgICAgSW50ZXJwb2xhdG9yLnNldExvY2FsZSgkdXNlcyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgICAgIHZhciB0cmFuc2xhdGVCeUhhbmRsZXIgPSBmdW5jdGlvbiAodHJhbnNsYXRpb25JZCkge1xuICAgICAgICAgIGlmICgkbWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlckZhY3RvcnkpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHRTdHJpbmcgPSAkaW5qZWN0b3IuZ2V0KCRtaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyRmFjdG9yeSkodHJhbnNsYXRpb25JZCwgJHVzZXMpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdFN0cmluZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgIHJldHVybiByZXN1bHRTdHJpbmc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4gdHJhbnNsYXRpb25JZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRyYW5zbGF0aW9uSWQ7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB2YXIgcmVzb2x2ZUZvckZhbGxiYWNrTGFuZ3VhZ2UgPSBmdW5jdGlvbiAoZmFsbGJhY2tMYW5ndWFnZUluZGV4LCB0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgSW50ZXJwb2xhdG9yKSB7XG4gICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICBpZiAoZmFsbGJhY2tMYW5ndWFnZUluZGV4IDwgJGZhbGxiYWNrTGFuZ3VhZ2UubGVuZ3RoKSB7XG4gICAgICAgICAgICB2YXIgbGFuZ0tleSA9ICRmYWxsYmFja0xhbmd1YWdlW2ZhbGxiYWNrTGFuZ3VhZ2VJbmRleF07XG4gICAgICAgICAgICBnZXRGYWxsYmFja1RyYW5zbGF0aW9uKGxhbmdLZXksIHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zLCBJbnRlcnBvbGF0b3IpLnRoZW4oZGVmZXJyZWQucmVzb2x2ZSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICByZXNvbHZlRm9yRmFsbGJhY2tMYW5ndWFnZShmYWxsYmFja0xhbmd1YWdlSW5kZXggKyAxLCB0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgSW50ZXJwb2xhdG9yKS50aGVuKGRlZmVycmVkLnJlc29sdmUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUodHJhbnNsYXRlQnlIYW5kbGVyKHRyYW5zbGF0aW9uSWQpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG4gICAgICAgIHZhciByZXNvbHZlRm9yRmFsbGJhY2tMYW5ndWFnZUluc3RhbnQgPSBmdW5jdGlvbiAoZmFsbGJhY2tMYW5ndWFnZUluZGV4LCB0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgSW50ZXJwb2xhdG9yKSB7XG4gICAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgICBpZiAoZmFsbGJhY2tMYW5ndWFnZUluZGV4IDwgJGZhbGxiYWNrTGFuZ3VhZ2UubGVuZ3RoKSB7XG4gICAgICAgICAgICB2YXIgbGFuZ0tleSA9ICRmYWxsYmFja0xhbmd1YWdlW2ZhbGxiYWNrTGFuZ3VhZ2VJbmRleF07XG4gICAgICAgICAgICByZXN1bHQgPSBnZXRGYWxsYmFja1RyYW5zbGF0aW9uSW5zdGFudChsYW5nS2V5LCB0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgSW50ZXJwb2xhdG9yKTtcbiAgICAgICAgICAgIGlmICghcmVzdWx0KSB7XG4gICAgICAgICAgICAgIHJlc3VsdCA9IHJlc29sdmVGb3JGYWxsYmFja0xhbmd1YWdlSW5zdGFudChmYWxsYmFja0xhbmd1YWdlSW5kZXggKyAxLCB0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgSW50ZXJwb2xhdG9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIGZhbGxiYWNrVHJhbnNsYXRpb24gPSBmdW5jdGlvbiAodHJhbnNsYXRpb25JZCwgaW50ZXJwb2xhdGVQYXJhbXMsIEludGVycG9sYXRvcikge1xuICAgICAgICAgIHJldHVybiByZXNvbHZlRm9yRmFsbGJhY2tMYW5ndWFnZShzdGFydEZhbGxiYWNrSXRlcmF0aW9uID4gMCA/IHN0YXJ0RmFsbGJhY2tJdGVyYXRpb24gOiBmYWxsYmFja0luZGV4LCB0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgSW50ZXJwb2xhdG9yKTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIGZhbGxiYWNrVHJhbnNsYXRpb25JbnN0YW50ID0gZnVuY3Rpb24gKHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zLCBJbnRlcnBvbGF0b3IpIHtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZUZvckZhbGxiYWNrTGFuZ3VhZ2VJbnN0YW50KHN0YXJ0RmFsbGJhY2tJdGVyYXRpb24gPiAwID8gc3RhcnRGYWxsYmFja0l0ZXJhdGlvbiA6IGZhbGxiYWNrSW5kZXgsIHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zLCBJbnRlcnBvbGF0b3IpO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgZGV0ZXJtaW5lVHJhbnNsYXRpb24gPSBmdW5jdGlvbiAodHJhbnNsYXRpb25JZCwgaW50ZXJwb2xhdGVQYXJhbXMsIGludGVycG9sYXRpb25JZCkge1xuICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgdmFyIHRhYmxlID0gJHVzZXMgPyAkdHJhbnNsYXRpb25UYWJsZVskdXNlc10gOiAkdHJhbnNsYXRpb25UYWJsZSwgSW50ZXJwb2xhdG9yID0gaW50ZXJwb2xhdGlvbklkID8gaW50ZXJwb2xhdG9ySGFzaE1hcFtpbnRlcnBvbGF0aW9uSWRdIDogZGVmYXVsdEludGVycG9sYXRvcjtcbiAgICAgICAgICBpZiAodGFibGUgJiYgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRhYmxlLCB0cmFuc2xhdGlvbklkKSkge1xuICAgICAgICAgICAgdmFyIHRyYW5zbGF0aW9uID0gdGFibGVbdHJhbnNsYXRpb25JZF07XG4gICAgICAgICAgICBpZiAodHJhbnNsYXRpb24uc3Vic3RyKDAsIDIpID09PSAnQDonKSB7XG4gICAgICAgICAgICAgICR0cmFuc2xhdGUodHJhbnNsYXRpb24uc3Vic3RyKDIpLCBpbnRlcnBvbGF0ZVBhcmFtcywgaW50ZXJwb2xhdGlvbklkKS50aGVuKGRlZmVycmVkLnJlc29sdmUsIGRlZmVycmVkLnJlamVjdCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKEludGVycG9sYXRvci5pbnRlcnBvbGF0ZSh0cmFuc2xhdGlvbiwgaW50ZXJwb2xhdGVQYXJhbXMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIG1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXJUcmFuc2xhdGlvbjtcbiAgICAgICAgICAgIGlmICgkbWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlckZhY3RvcnkgJiYgIXBlbmRpbmdMb2FkZXIpIHtcbiAgICAgICAgICAgICAgbWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlclRyYW5zbGF0aW9uID0gdHJhbnNsYXRlQnlIYW5kbGVyKHRyYW5zbGF0aW9uSWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCR1c2VzICYmICRmYWxsYmFja0xhbmd1YWdlICYmICRmYWxsYmFja0xhbmd1YWdlLmxlbmd0aCkge1xuICAgICAgICAgICAgICBmYWxsYmFja1RyYW5zbGF0aW9uKHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zLCBJbnRlcnBvbGF0b3IpLnRoZW4oZnVuY3Rpb24gKHRyYW5zbGF0aW9uKSB7XG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh0cmFuc2xhdGlvbik7XG4gICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChfdHJhbnNsYXRpb25JZCkge1xuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChhcHBseU5vdEZvdW5kSW5kaWNhdG9ycyhfdHJhbnNsYXRpb25JZCkpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoJG1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXJGYWN0b3J5ICYmICFwZW5kaW5nTG9hZGVyICYmIG1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXJUcmFuc2xhdGlvbikge1xuICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKG1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXJUcmFuc2xhdGlvbik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoYXBwbHlOb3RGb3VuZEluZGljYXRvcnModHJhbnNsYXRpb25JZCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIGRldGVybWluZVRyYW5zbGF0aW9uSW5zdGFudCA9IGZ1bmN0aW9uICh0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgaW50ZXJwb2xhdGlvbklkKSB7XG4gICAgICAgICAgdmFyIHJlc3VsdCwgdGFibGUgPSAkdXNlcyA/ICR0cmFuc2xhdGlvblRhYmxlWyR1c2VzXSA6ICR0cmFuc2xhdGlvblRhYmxlLCBJbnRlcnBvbGF0b3IgPSBpbnRlcnBvbGF0aW9uSWQgPyBpbnRlcnBvbGF0b3JIYXNoTWFwW2ludGVycG9sYXRpb25JZF0gOiBkZWZhdWx0SW50ZXJwb2xhdG9yO1xuICAgICAgICAgIGlmICh0YWJsZSAmJiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGFibGUsIHRyYW5zbGF0aW9uSWQpKSB7XG4gICAgICAgICAgICB2YXIgdHJhbnNsYXRpb24gPSB0YWJsZVt0cmFuc2xhdGlvbklkXTtcbiAgICAgICAgICAgIGlmICh0cmFuc2xhdGlvbi5zdWJzdHIoMCwgMikgPT09ICdAOicpIHtcbiAgICAgICAgICAgICAgcmVzdWx0ID0gZGV0ZXJtaW5lVHJhbnNsYXRpb25JbnN0YW50KHRyYW5zbGF0aW9uLnN1YnN0cigyKSwgaW50ZXJwb2xhdGVQYXJhbXMsIGludGVycG9sYXRpb25JZCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXN1bHQgPSBJbnRlcnBvbGF0b3IuaW50ZXJwb2xhdGUodHJhbnNsYXRpb24sIGludGVycG9sYXRlUGFyYW1zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIG1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXJUcmFuc2xhdGlvbjtcbiAgICAgICAgICAgIGlmICgkbWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlckZhY3RvcnkgJiYgIXBlbmRpbmdMb2FkZXIpIHtcbiAgICAgICAgICAgICAgbWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlclRyYW5zbGF0aW9uID0gdHJhbnNsYXRlQnlIYW5kbGVyKHRyYW5zbGF0aW9uSWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCR1c2VzICYmICRmYWxsYmFja0xhbmd1YWdlICYmICRmYWxsYmFja0xhbmd1YWdlLmxlbmd0aCkge1xuICAgICAgICAgICAgICBmYWxsYmFja0luZGV4ID0gMDtcbiAgICAgICAgICAgICAgcmVzdWx0ID0gZmFsbGJhY2tUcmFuc2xhdGlvbkluc3RhbnQodHJhbnNsYXRpb25JZCwgaW50ZXJwb2xhdGVQYXJhbXMsIEludGVycG9sYXRvcik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCRtaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyRmFjdG9yeSAmJiAhcGVuZGluZ0xvYWRlciAmJiBtaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyVHJhbnNsYXRpb24pIHtcbiAgICAgICAgICAgICAgcmVzdWx0ID0gbWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlclRyYW5zbGF0aW9uO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVzdWx0ID0gYXBwbHlOb3RGb3VuZEluZGljYXRvcnModHJhbnNsYXRpb25JZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgICAgICR0cmFuc2xhdGUucHJlZmVycmVkTGFuZ3VhZ2UgPSBmdW5jdGlvbiAobGFuZ0tleSkge1xuICAgICAgICAgIGlmIChsYW5nS2V5KSB7XG4gICAgICAgICAgICBzZXR1cFByZWZlcnJlZExhbmd1YWdlKGxhbmdLZXkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gJHByZWZlcnJlZExhbmd1YWdlO1xuICAgICAgICB9O1xuICAgICAgICAkdHJhbnNsYXRlLmNsb2FrQ2xhc3NOYW1lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiAkY2xvYWtDbGFzc05hbWU7XG4gICAgICAgIH07XG4gICAgICAgICR0cmFuc2xhdGUuZmFsbGJhY2tMYW5ndWFnZSA9IGZ1bmN0aW9uIChsYW5nS2V5KSB7XG4gICAgICAgICAgaWYgKGxhbmdLZXkgIT09IHVuZGVmaW5lZCAmJiBsYW5nS2V5ICE9PSBudWxsKSB7XG4gICAgICAgICAgICBmYWxsYmFja1N0YWNrKGxhbmdLZXkpO1xuICAgICAgICAgICAgaWYgKCRsb2FkZXJGYWN0b3J5KSB7XG4gICAgICAgICAgICAgIGlmICgkZmFsbGJhY2tMYW5ndWFnZSAmJiAkZmFsbGJhY2tMYW5ndWFnZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gJGZhbGxiYWNrTGFuZ3VhZ2UubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgIGlmICghbGFuZ1Byb21pc2VzWyRmYWxsYmFja0xhbmd1YWdlW2ldXSkge1xuICAgICAgICAgICAgICAgICAgICBsYW5nUHJvbWlzZXNbJGZhbGxiYWNrTGFuZ3VhZ2VbaV1dID0gbG9hZEFzeW5jKCRmYWxsYmFja0xhbmd1YWdlW2ldKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICR0cmFuc2xhdGUudXNlKCR0cmFuc2xhdGUudXNlKCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoJGZhbGxiYWNrV2FzU3RyaW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gJGZhbGxiYWNrTGFuZ3VhZ2VbMF07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAkZmFsbGJhY2tMYW5ndWFnZTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgICR0cmFuc2xhdGUudXNlRmFsbGJhY2tMYW5ndWFnZSA9IGZ1bmN0aW9uIChsYW5nS2V5KSB7XG4gICAgICAgICAgaWYgKGxhbmdLZXkgIT09IHVuZGVmaW5lZCAmJiBsYW5nS2V5ICE9PSBudWxsKSB7XG4gICAgICAgICAgICBpZiAoIWxhbmdLZXkpIHtcbiAgICAgICAgICAgICAgc3RhcnRGYWxsYmFja0l0ZXJhdGlvbiA9IDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB2YXIgbGFuZ0tleVBvc2l0aW9uID0gaW5kZXhPZigkZmFsbGJhY2tMYW5ndWFnZSwgbGFuZ0tleSk7XG4gICAgICAgICAgICAgIGlmIChsYW5nS2V5UG9zaXRpb24gPiAtMSkge1xuICAgICAgICAgICAgICAgIHN0YXJ0RmFsbGJhY2tJdGVyYXRpb24gPSBsYW5nS2V5UG9zaXRpb247XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgICR0cmFuc2xhdGUucHJvcG9zZWRMYW5ndWFnZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gJG5leHRMYW5nO1xuICAgICAgICB9O1xuICAgICAgICAkdHJhbnNsYXRlLnN0b3JhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIFN0b3JhZ2U7XG4gICAgICAgIH07XG4gICAgICAgICR0cmFuc2xhdGUudXNlID0gZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgIGlmICgha2V5KSB7XG4gICAgICAgICAgICByZXR1cm4gJHVzZXM7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgJHJvb3RTY29wZS4kZW1pdCgnJHRyYW5zbGF0ZUNoYW5nZVN0YXJ0JywgeyBsYW5ndWFnZToga2V5IH0pO1xuICAgICAgICAgIHZhciBhbGlhc2VkS2V5ID0gbmVnb3RpYXRlTG9jYWxlKGtleSk7XG4gICAgICAgICAgaWYgKGFsaWFzZWRLZXkpIHtcbiAgICAgICAgICAgIGtleSA9IGFsaWFzZWRLZXk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghJHRyYW5zbGF0aW9uVGFibGVba2V5XSAmJiAkbG9hZGVyRmFjdG9yeSAmJiAhbGFuZ1Byb21pc2VzW2tleV0pIHtcbiAgICAgICAgICAgICRuZXh0TGFuZyA9IGtleTtcbiAgICAgICAgICAgIGxhbmdQcm9taXNlc1trZXldID0gbG9hZEFzeW5jKGtleSkudGhlbihmdW5jdGlvbiAodHJhbnNsYXRpb24pIHtcbiAgICAgICAgICAgICAgdHJhbnNsYXRpb25zKHRyYW5zbGF0aW9uLmtleSwgdHJhbnNsYXRpb24udGFibGUpO1xuICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHRyYW5zbGF0aW9uLmtleSk7XG4gICAgICAgICAgICAgIHVzZUxhbmd1YWdlKHRyYW5zbGF0aW9uLmtleSk7XG4gICAgICAgICAgICAgIGlmICgkbmV4dExhbmcgPT09IGtleSkge1xuICAgICAgICAgICAgICAgICRuZXh0TGFuZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgICBpZiAoJG5leHRMYW5nID09PSBrZXkpIHtcbiAgICAgICAgICAgICAgICAkbmV4dExhbmcgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgJHJvb3RTY29wZS4kZW1pdCgnJHRyYW5zbGF0ZUNoYW5nZUVycm9yJywgeyBsYW5ndWFnZToga2V5IH0pO1xuICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3Qoa2V5KTtcbiAgICAgICAgICAgICAgJHJvb3RTY29wZS4kZW1pdCgnJHRyYW5zbGF0ZUNoYW5nZUVuZCcsIHsgbGFuZ3VhZ2U6IGtleSB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGtleSk7XG4gICAgICAgICAgICB1c2VMYW5ndWFnZShrZXkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfTtcbiAgICAgICAgJHRyYW5zbGF0ZS5zdG9yYWdlS2V5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiBzdG9yYWdlS2V5KCk7XG4gICAgICAgIH07XG4gICAgICAgICR0cmFuc2xhdGUuaXNQb3N0Q29tcGlsaW5nRW5hYmxlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gJHBvc3RDb21waWxpbmdFbmFibGVkO1xuICAgICAgICB9O1xuICAgICAgICAkdHJhbnNsYXRlLnJlZnJlc2ggPSBmdW5jdGlvbiAobGFuZ0tleSkge1xuICAgICAgICAgIGlmICghJGxvYWRlckZhY3RvcnkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGRuXFwndCByZWZyZXNoIHRyYW5zbGF0aW9uIHRhYmxlLCBubyBsb2FkZXIgcmVnaXN0ZXJlZCEnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICBmdW5jdGlvbiByZXNvbHZlKCkge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kZW1pdCgnJHRyYW5zbGF0ZVJlZnJlc2hFbmQnLCB7IGxhbmd1YWdlOiBsYW5nS2V5IH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBmdW5jdGlvbiByZWplY3QoKSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcbiAgICAgICAgICAgICRyb290U2NvcGUuJGVtaXQoJyR0cmFuc2xhdGVSZWZyZXNoRW5kJywgeyBsYW5ndWFnZTogbGFuZ0tleSB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgJHJvb3RTY29wZS4kZW1pdCgnJHRyYW5zbGF0ZVJlZnJlc2hTdGFydCcsIHsgbGFuZ3VhZ2U6IGxhbmdLZXkgfSk7XG4gICAgICAgICAgaWYgKCFsYW5nS2V5KSB7XG4gICAgICAgICAgICB2YXIgdGFibGVzID0gW10sIGxvYWRpbmdLZXlzID0ge307XG4gICAgICAgICAgICBpZiAoJGZhbGxiYWNrTGFuZ3VhZ2UgJiYgJGZhbGxiYWNrTGFuZ3VhZ2UubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSAkZmFsbGJhY2tMYW5ndWFnZS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIHRhYmxlcy5wdXNoKGxvYWRBc3luYygkZmFsbGJhY2tMYW5ndWFnZVtpXSkpO1xuICAgICAgICAgICAgICAgIGxvYWRpbmdLZXlzWyRmYWxsYmFja0xhbmd1YWdlW2ldXSA9IHRydWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgkdXNlcyAmJiAhbG9hZGluZ0tleXNbJHVzZXNdKSB7XG4gICAgICAgICAgICAgIHRhYmxlcy5wdXNoKGxvYWRBc3luYygkdXNlcykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgJHEuYWxsKHRhYmxlcykudGhlbihmdW5jdGlvbiAodGFibGVEYXRhKSB7XG4gICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCh0YWJsZURhdGEsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgaWYgKCR0cmFuc2xhdGlvblRhYmxlW2RhdGEua2V5XSkge1xuICAgICAgICAgICAgICAgICAgZGVsZXRlICR0cmFuc2xhdGlvblRhYmxlW2RhdGEua2V5XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdHJhbnNsYXRpb25zKGRhdGEua2V5LCBkYXRhLnRhYmxlKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIGlmICgkdXNlcykge1xuICAgICAgICAgICAgICAgIHVzZUxhbmd1YWdlKCR1c2VzKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2UgaWYgKCR0cmFuc2xhdGlvblRhYmxlW2xhbmdLZXldKSB7XG4gICAgICAgICAgICBsb2FkQXN5bmMobGFuZ0tleSkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICB0cmFuc2xhdGlvbnMoZGF0YS5rZXksIGRhdGEudGFibGUpO1xuICAgICAgICAgICAgICBpZiAobGFuZ0tleSA9PT0gJHVzZXMpIHtcbiAgICAgICAgICAgICAgICB1c2VMYW5ndWFnZSgkdXNlcyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfSwgcmVqZWN0KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVqZWN0KCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuICAgICAgICAkdHJhbnNsYXRlLmluc3RhbnQgPSBmdW5jdGlvbiAodHJhbnNsYXRpb25JZCwgaW50ZXJwb2xhdGVQYXJhbXMsIGludGVycG9sYXRpb25JZCkge1xuICAgICAgICAgIGlmICh0cmFuc2xhdGlvbklkID09PSBudWxsIHx8IGFuZ3VsYXIuaXNVbmRlZmluZWQodHJhbnNsYXRpb25JZCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cmFuc2xhdGlvbklkO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoYW5ndWxhci5pc0FycmF5KHRyYW5zbGF0aW9uSWQpKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0cyA9IHt9O1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGMgPSB0cmFuc2xhdGlvbklkLmxlbmd0aDsgaSA8IGM7IGkrKykge1xuICAgICAgICAgICAgICByZXN1bHRzW3RyYW5zbGF0aW9uSWRbaV1dID0gJHRyYW5zbGF0ZS5pbnN0YW50KHRyYW5zbGF0aW9uSWRbaV0sIGludGVycG9sYXRlUGFyYW1zLCBpbnRlcnBvbGF0aW9uSWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChhbmd1bGFyLmlzU3RyaW5nKHRyYW5zbGF0aW9uSWQpICYmIHRyYW5zbGF0aW9uSWQubGVuZ3RoIDwgMSkge1xuICAgICAgICAgICAgcmV0dXJuIHRyYW5zbGF0aW9uSWQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0cmFuc2xhdGlvbklkKSB7XG4gICAgICAgICAgICB0cmFuc2xhdGlvbklkID0gdHJpbS5hcHBseSh0cmFuc2xhdGlvbklkKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFyIHJlc3VsdCwgcG9zc2libGVMYW5nS2V5cyA9IFtdO1xuICAgICAgICAgIGlmICgkcHJlZmVycmVkTGFuZ3VhZ2UpIHtcbiAgICAgICAgICAgIHBvc3NpYmxlTGFuZ0tleXMucHVzaCgkcHJlZmVycmVkTGFuZ3VhZ2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoJHVzZXMpIHtcbiAgICAgICAgICAgIHBvc3NpYmxlTGFuZ0tleXMucHVzaCgkdXNlcyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICgkZmFsbGJhY2tMYW5ndWFnZSAmJiAkZmFsbGJhY2tMYW5ndWFnZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHBvc3NpYmxlTGFuZ0tleXMgPSBwb3NzaWJsZUxhbmdLZXlzLmNvbmNhdCgkZmFsbGJhY2tMYW5ndWFnZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGZvciAodmFyIGogPSAwLCBkID0gcG9zc2libGVMYW5nS2V5cy5sZW5ndGg7IGogPCBkOyBqKyspIHtcbiAgICAgICAgICAgIHZhciBwb3NzaWJsZUxhbmdLZXkgPSBwb3NzaWJsZUxhbmdLZXlzW2pdO1xuICAgICAgICAgICAgaWYgKCR0cmFuc2xhdGlvblRhYmxlW3Bvc3NpYmxlTGFuZ0tleV0pIHtcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiAkdHJhbnNsYXRpb25UYWJsZVtwb3NzaWJsZUxhbmdLZXldW3RyYW5zbGF0aW9uSWRdICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGRldGVybWluZVRyYW5zbGF0aW9uSW5zdGFudCh0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgaW50ZXJwb2xhdGlvbklkKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiByZXN1bHQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIXJlc3VsdCAmJiByZXN1bHQgIT09ICcnKSB7XG4gICAgICAgICAgICByZXN1bHQgPSBkZWZhdWx0SW50ZXJwb2xhdG9yLmludGVycG9sYXRlKHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zKTtcbiAgICAgICAgICAgIGlmICgkbWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlckZhY3RvcnkgJiYgIXBlbmRpbmdMb2FkZXIpIHtcbiAgICAgICAgICAgICAgcmVzdWx0ID0gdHJhbnNsYXRlQnlIYW5kbGVyKHRyYW5zbGF0aW9uSWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9O1xuICAgICAgICAkdHJhbnNsYXRlLnZlcnNpb25JbmZvID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiB2ZXJzaW9uO1xuICAgICAgICB9O1xuICAgICAgICAkdHJhbnNsYXRlLmxvYWRlckNhY2hlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiBsb2FkZXJDYWNoZTtcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKCRsb2FkZXJGYWN0b3J5KSB7XG4gICAgICAgICAgaWYgKGFuZ3VsYXIuZXF1YWxzKCR0cmFuc2xhdGlvblRhYmxlLCB7fSkpIHtcbiAgICAgICAgICAgICR0cmFuc2xhdGUudXNlKCR0cmFuc2xhdGUudXNlKCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoJGZhbGxiYWNrTGFuZ3VhZ2UgJiYgJGZhbGxiYWNrTGFuZ3VhZ2UubGVuZ3RoKSB7XG4gICAgICAgICAgICB2YXIgcHJvY2Vzc0FzeW5jUmVzdWx0ID0gZnVuY3Rpb24gKHRyYW5zbGF0aW9uKSB7XG4gICAgICAgICAgICAgIHRyYW5zbGF0aW9ucyh0cmFuc2xhdGlvbi5rZXksIHRyYW5zbGF0aW9uLnRhYmxlKTtcbiAgICAgICAgICAgICAgJHJvb3RTY29wZS4kZW1pdCgnJHRyYW5zbGF0ZUNoYW5nZUVuZCcsIHsgbGFuZ3VhZ2U6IHRyYW5zbGF0aW9uLmtleSB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gJGZhbGxiYWNrTGFuZ3VhZ2UubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgbGFuZ1Byb21pc2VzWyRmYWxsYmFja0xhbmd1YWdlW2ldXSA9IGxvYWRBc3luYygkZmFsbGJhY2tMYW5ndWFnZVtpXSkudGhlbihwcm9jZXNzQXN5bmNSZXN1bHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJHRyYW5zbGF0ZTtcbiAgICAgIH1cbiAgICBdO1xuICB9XG5dKTtcbmFuZ3VsYXIubW9kdWxlKCdwYXNjYWxwcmVjaHQudHJhbnNsYXRlJykuZmFjdG9yeSgnJHRyYW5zbGF0ZURlZmF1bHRJbnRlcnBvbGF0aW9uJywgW1xuICAnJGludGVycG9sYXRlJyxcbiAgZnVuY3Rpb24gKCRpbnRlcnBvbGF0ZSkge1xuICAgIHZhciAkdHJhbnNsYXRlSW50ZXJwb2xhdG9yID0ge30sICRsb2NhbGUsICRpZGVudGlmaWVyID0gJ2RlZmF1bHQnLCAkc2FuaXRpemVWYWx1ZVN0cmF0ZWd5ID0gbnVsbCwgc2FuaXRpemVWYWx1ZVN0cmF0ZWdpZXMgPSB7XG4gICAgICAgIGVzY2FwZWQ6IGZ1bmN0aW9uIChwYXJhbXMpIHtcbiAgICAgICAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgICAgICAgZm9yICh2YXIga2V5IGluIHBhcmFtcykge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChwYXJhbXMsIGtleSkpIHtcbiAgICAgICAgICAgICAgcmVzdWx0W2tleV0gPSBhbmd1bGFyLmVsZW1lbnQoJzxkaXY+PC9kaXY+JykudGV4dChwYXJhbXNba2V5XSkuaHRtbCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIHZhciBzYW5pdGl6ZVBhcmFtcyA9IGZ1bmN0aW9uIChwYXJhbXMpIHtcbiAgICAgIHZhciByZXN1bHQ7XG4gICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKHNhbml0aXplVmFsdWVTdHJhdGVnaWVzWyRzYW5pdGl6ZVZhbHVlU3RyYXRlZ3ldKSkge1xuICAgICAgICByZXN1bHQgPSBzYW5pdGl6ZVZhbHVlU3RyYXRlZ2llc1skc2FuaXRpemVWYWx1ZVN0cmF0ZWd5XShwYXJhbXMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0ID0gcGFyYW1zO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICAgICR0cmFuc2xhdGVJbnRlcnBvbGF0b3Iuc2V0TG9jYWxlID0gZnVuY3Rpb24gKGxvY2FsZSkge1xuICAgICAgJGxvY2FsZSA9IGxvY2FsZTtcbiAgICB9O1xuICAgICR0cmFuc2xhdGVJbnRlcnBvbGF0b3IuZ2V0SW50ZXJwb2xhdGlvbklkZW50aWZpZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gJGlkZW50aWZpZXI7XG4gICAgfTtcbiAgICAkdHJhbnNsYXRlSW50ZXJwb2xhdG9yLnVzZVNhbml0aXplVmFsdWVTdHJhdGVneSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgJHNhbml0aXplVmFsdWVTdHJhdGVneSA9IHZhbHVlO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICAkdHJhbnNsYXRlSW50ZXJwb2xhdG9yLmludGVycG9sYXRlID0gZnVuY3Rpb24gKHN0cmluZywgaW50ZXJwb2xhdGVQYXJhbXMpIHtcbiAgICAgIGlmICgkc2FuaXRpemVWYWx1ZVN0cmF0ZWd5KSB7XG4gICAgICAgIGludGVycG9sYXRlUGFyYW1zID0gc2FuaXRpemVQYXJhbXMoaW50ZXJwb2xhdGVQYXJhbXMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuICRpbnRlcnBvbGF0ZShzdHJpbmcpKGludGVycG9sYXRlUGFyYW1zIHx8IHt9KTtcbiAgICB9O1xuICAgIHJldHVybiAkdHJhbnNsYXRlSW50ZXJwb2xhdG9yO1xuICB9XG5dKTtcbmFuZ3VsYXIubW9kdWxlKCdwYXNjYWxwcmVjaHQudHJhbnNsYXRlJykuY29uc3RhbnQoJyRTVE9SQUdFX0tFWScsICdOR19UUkFOU0xBVEVfTEFOR19LRVknKTtcbmFuZ3VsYXIubW9kdWxlKCdwYXNjYWxwcmVjaHQudHJhbnNsYXRlJykuZGlyZWN0aXZlKCd0cmFuc2xhdGUnLCBbXG4gICckdHJhbnNsYXRlJyxcbiAgJyRxJyxcbiAgJyRpbnRlcnBvbGF0ZScsXG4gICckY29tcGlsZScsXG4gICckcGFyc2UnLFxuICAnJHJvb3RTY29wZScsXG4gIGZ1bmN0aW9uICgkdHJhbnNsYXRlLCAkcSwgJGludGVycG9sYXRlLCAkY29tcGlsZSwgJHBhcnNlLCAkcm9vdFNjb3BlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnQUUnLFxuICAgICAgc2NvcGU6IHRydWUsXG4gICAgICBjb21waWxlOiBmdW5jdGlvbiAodEVsZW1lbnQsIHRBdHRyKSB7XG4gICAgICAgIHZhciB0cmFuc2xhdGVWYWx1ZXNFeGlzdCA9IHRBdHRyLnRyYW5zbGF0ZVZhbHVlcyA/IHRBdHRyLnRyYW5zbGF0ZVZhbHVlcyA6IHVuZGVmaW5lZDtcbiAgICAgICAgdmFyIHRyYW5zbGF0ZUludGVycG9sYXRpb24gPSB0QXR0ci50cmFuc2xhdGVJbnRlcnBvbGF0aW9uID8gdEF0dHIudHJhbnNsYXRlSW50ZXJwb2xhdGlvbiA6IHVuZGVmaW5lZDtcbiAgICAgICAgdmFyIHRyYW5zbGF0ZVZhbHVlRXhpc3QgPSB0RWxlbWVudFswXS5vdXRlckhUTUwubWF0Y2goL3RyYW5zbGF0ZS12YWx1ZS0rL2kpO1xuICAgICAgICB2YXIgaW50ZXJwb2xhdGVSZWdFeHAgPSAnXiguKikoJyArICRpbnRlcnBvbGF0ZS5zdGFydFN5bWJvbCgpICsgJy4qJyArICRpbnRlcnBvbGF0ZS5lbmRTeW1ib2woKSArICcpKC4qKSc7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBsaW5rRm4oc2NvcGUsIGlFbGVtZW50LCBpQXR0cikge1xuICAgICAgICAgIHNjb3BlLmludGVycG9sYXRlUGFyYW1zID0ge307XG4gICAgICAgICAgc2NvcGUucHJlVGV4dCA9ICcnO1xuICAgICAgICAgIHNjb3BlLnBvc3RUZXh0ID0gJyc7XG4gICAgICAgICAgaUF0dHIuJG9ic2VydmUoJ3RyYW5zbGF0ZScsIGZ1bmN0aW9uICh0cmFuc2xhdGlvbklkKSB7XG4gICAgICAgICAgICBpZiAoYW5ndWxhci5lcXVhbHModHJhbnNsYXRpb25JZCwgJycpIHx8ICFhbmd1bGFyLmlzRGVmaW5lZCh0cmFuc2xhdGlvbklkKSkge1xuICAgICAgICAgICAgICB2YXIgaW50ZXJwb2xhdGVNYXRjaGVzID0gaUVsZW1lbnQudGV4dCgpLm1hdGNoKGludGVycG9sYXRlUmVnRXhwKTtcbiAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNBcnJheShpbnRlcnBvbGF0ZU1hdGNoZXMpKSB7XG4gICAgICAgICAgICAgICAgc2NvcGUucHJlVGV4dCA9IGludGVycG9sYXRlTWF0Y2hlc1sxXTtcbiAgICAgICAgICAgICAgICBzY29wZS5wb3N0VGV4dCA9IGludGVycG9sYXRlTWF0Y2hlc1szXTtcbiAgICAgICAgICAgICAgICBzY29wZS50cmFuc2xhdGlvbklkID0gJGludGVycG9sYXRlKGludGVycG9sYXRlTWF0Y2hlc1syXSkoc2NvcGUuJHBhcmVudCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2NvcGUudHJhbnNsYXRpb25JZCA9IGlFbGVtZW50LnRleHQoKS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHNjb3BlLnRyYW5zbGF0aW9uSWQgPSB0cmFuc2xhdGlvbklkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlBdHRyLiRvYnNlcnZlKCd0cmFuc2xhdGVEZWZhdWx0JywgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBzY29wZS5kZWZhdWx0VGV4dCA9IHZhbHVlO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmICh0cmFuc2xhdGVWYWx1ZXNFeGlzdCkge1xuICAgICAgICAgICAgaUF0dHIuJG9ic2VydmUoJ3RyYW5zbGF0ZVZhbHVlcycsIGZ1bmN0aW9uIChpbnRlcnBvbGF0ZVBhcmFtcykge1xuICAgICAgICAgICAgICBpZiAoaW50ZXJwb2xhdGVQYXJhbXMpIHtcbiAgICAgICAgICAgICAgICBzY29wZS4kcGFyZW50LiR3YXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICBhbmd1bGFyLmV4dGVuZChzY29wZS5pbnRlcnBvbGF0ZVBhcmFtcywgJHBhcnNlKGludGVycG9sYXRlUGFyYW1zKShzY29wZS4kcGFyZW50KSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodHJhbnNsYXRlVmFsdWVFeGlzdCkge1xuICAgICAgICAgICAgdmFyIGZuID0gZnVuY3Rpb24gKGF0dHJOYW1lKSB7XG4gICAgICAgICAgICAgIGlBdHRyLiRvYnNlcnZlKGF0dHJOYW1lLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBzY29wZS5pbnRlcnBvbGF0ZVBhcmFtc1thbmd1bGFyLmxvd2VyY2FzZShhdHRyTmFtZS5zdWJzdHIoMTQsIDEpKSArIGF0dHJOYW1lLnN1YnN0cigxNSldID0gdmFsdWU7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGZvciAodmFyIGF0dHIgaW4gaUF0dHIpIHtcbiAgICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChpQXR0ciwgYXR0cikgJiYgYXR0ci5zdWJzdHIoMCwgMTQpID09PSAndHJhbnNsYXRlVmFsdWUnICYmIGF0dHIgIT09ICd0cmFuc2xhdGVWYWx1ZXMnKSB7XG4gICAgICAgICAgICAgICAgZm4oYXR0cik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgdmFyIGFwcGx5RWxlbWVudENvbnRlbnQgPSBmdW5jdGlvbiAodmFsdWUsIHNjb3BlLCBzdWNjZXNzZnVsKSB7XG4gICAgICAgICAgICBpZiAoIXN1Y2Nlc3NmdWwgJiYgdHlwZW9mIHNjb3BlLmRlZmF1bHRUZXh0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICB2YWx1ZSA9IHNjb3BlLmRlZmF1bHRUZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaUVsZW1lbnQuaHRtbChzY29wZS5wcmVUZXh0ICsgdmFsdWUgKyBzY29wZS5wb3N0VGV4dCk7XG4gICAgICAgICAgICB2YXIgZ2xvYmFsbHlFbmFibGVkID0gJHRyYW5zbGF0ZS5pc1Bvc3RDb21waWxpbmdFbmFibGVkKCk7XG4gICAgICAgICAgICB2YXIgbG9jYWxseURlZmluZWQgPSB0eXBlb2YgdEF0dHIudHJhbnNsYXRlQ29tcGlsZSAhPT0gJ3VuZGVmaW5lZCc7XG4gICAgICAgICAgICB2YXIgbG9jYWxseUVuYWJsZWQgPSBsb2NhbGx5RGVmaW5lZCAmJiB0QXR0ci50cmFuc2xhdGVDb21waWxlICE9PSAnZmFsc2UnO1xuICAgICAgICAgICAgaWYgKGdsb2JhbGx5RW5hYmxlZCAmJiAhbG9jYWxseURlZmluZWQgfHwgbG9jYWxseUVuYWJsZWQpIHtcbiAgICAgICAgICAgICAgJGNvbXBpbGUoaUVsZW1lbnQuY29udGVudHMoKSkoc2NvcGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgICAgdmFyIHVwZGF0ZVRyYW5zbGF0aW9uRm4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIGlmICghdHJhbnNsYXRlVmFsdWVzRXhpc3QgJiYgIXRyYW5zbGF0ZVZhbHVlRXhpc3QpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgdmFyIHVud2F0Y2ggPSBzY29wZS4kd2F0Y2goJ3RyYW5zbGF0aW9uSWQnLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAoc2NvcGUudHJhbnNsYXRpb25JZCAmJiB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHRyYW5zbGF0ZSh2YWx1ZSwge30sIHRyYW5zbGF0ZUludGVycG9sYXRpb24pLnRoZW4oZnVuY3Rpb24gKHRyYW5zbGF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGFwcGx5RWxlbWVudENvbnRlbnQodHJhbnNsYXRpb24sIHNjb3BlLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdW53YXRjaCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKHRyYW5zbGF0aW9uSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwbHlFbGVtZW50Q29udGVudCh0cmFuc2xhdGlvbklkLCBzY29wZSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICB1bndhdGNoKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sIHRydWUpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgIHZhciB1cGRhdGVUcmFuc2xhdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzY29wZS50cmFuc2xhdGlvbklkICYmIHNjb3BlLmludGVycG9sYXRlUGFyYW1zKSB7XG4gICAgICAgICAgICAgICAgICAgICAgJHRyYW5zbGF0ZShzY29wZS50cmFuc2xhdGlvbklkLCBzY29wZS5pbnRlcnBvbGF0ZVBhcmFtcywgdHJhbnNsYXRlSW50ZXJwb2xhdGlvbikudGhlbihmdW5jdGlvbiAodHJhbnNsYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcGx5RWxlbWVudENvbnRlbnQodHJhbnNsYXRpb24sIHNjb3BlLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAodHJhbnNsYXRpb25JZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBwbHlFbGVtZW50Q29udGVudCh0cmFuc2xhdGlvbklkLCBzY29wZSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgc2NvcGUuJHdhdGNoKCdpbnRlcnBvbGF0ZVBhcmFtcycsIHVwZGF0ZVRyYW5zbGF0aW9ucywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICBzY29wZS4kd2F0Y2goJ3RyYW5zbGF0aW9uSWQnLCB1cGRhdGVUcmFuc2xhdGlvbnMpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0oKTtcbiAgICAgICAgICB2YXIgdW5iaW5kID0gJHJvb3RTY29wZS4kb24oJyR0cmFuc2xhdGVDaGFuZ2VTdWNjZXNzJywgdXBkYXRlVHJhbnNsYXRpb25Gbik7XG4gICAgICAgICAgdXBkYXRlVHJhbnNsYXRpb25GbigpO1xuICAgICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCB1bmJpbmQpO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgIH07XG4gIH1cbl0pO1xuYW5ndWxhci5tb2R1bGUoJ3Bhc2NhbHByZWNodC50cmFuc2xhdGUnKS5kaXJlY3RpdmUoJ3RyYW5zbGF0ZUNsb2FrJywgW1xuICAnJHJvb3RTY29wZScsXG4gICckdHJhbnNsYXRlJyxcbiAgZnVuY3Rpb24gKCRyb290U2NvcGUsICR0cmFuc2xhdGUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29tcGlsZTogZnVuY3Rpb24gKHRFbGVtZW50KSB7XG4gICAgICAgIHZhciBhcHBseUNsb2FrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdEVsZW1lbnQuYWRkQ2xhc3MoJHRyYW5zbGF0ZS5jbG9ha0NsYXNzTmFtZSgpKTtcbiAgICAgICAgICB9LCByZW1vdmVDbG9hayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRFbGVtZW50LnJlbW92ZUNsYXNzKCR0cmFuc2xhdGUuY2xvYWtDbGFzc05hbWUoKSk7XG4gICAgICAgICAgfSwgcmVtb3ZlTGlzdGVuZXIgPSAkcm9vdFNjb3BlLiRvbignJHRyYW5zbGF0ZUNoYW5nZUVuZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJlbW92ZUNsb2FrKCk7XG4gICAgICAgICAgICByZW1vdmVMaXN0ZW5lcigpO1xuICAgICAgICAgICAgcmVtb3ZlTGlzdGVuZXIgPSBudWxsO1xuICAgICAgICAgIH0pO1xuICAgICAgICBhcHBseUNsb2FrKCk7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBsaW5rRm4oc2NvcGUsIGlFbGVtZW50LCBpQXR0cikge1xuICAgICAgICAgIGlmIChpQXR0ci50cmFuc2xhdGVDbG9hayAmJiBpQXR0ci50cmFuc2xhdGVDbG9hay5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlBdHRyLiRvYnNlcnZlKCd0cmFuc2xhdGVDbG9haycsIGZ1bmN0aW9uICh0cmFuc2xhdGlvbklkKSB7XG4gICAgICAgICAgICAgICR0cmFuc2xhdGUodHJhbnNsYXRpb25JZCkudGhlbihyZW1vdmVDbG9haywgYXBwbHlDbG9hayk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXSk7XG5hbmd1bGFyLm1vZHVsZSgncGFzY2FscHJlY2h0LnRyYW5zbGF0ZScpLmZpbHRlcigndHJhbnNsYXRlJywgW1xuICAnJHBhcnNlJyxcbiAgJyR0cmFuc2xhdGUnLFxuICBmdW5jdGlvbiAoJHBhcnNlLCAkdHJhbnNsYXRlKSB7XG4gICAgdmFyIHRyYW5zbGF0ZUZpbHRlciA9IGZ1bmN0aW9uICh0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgaW50ZXJwb2xhdGlvbikge1xuICAgICAgaWYgKCFhbmd1bGFyLmlzT2JqZWN0KGludGVycG9sYXRlUGFyYW1zKSkge1xuICAgICAgICBpbnRlcnBvbGF0ZVBhcmFtcyA9ICRwYXJzZShpbnRlcnBvbGF0ZVBhcmFtcykodGhpcyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gJHRyYW5zbGF0ZS5pbnN0YW50KHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zLCBpbnRlcnBvbGF0aW9uKTtcbiAgICB9O1xuICAgIHRyYW5zbGF0ZUZpbHRlci4kc3RhdGVmdWwgPSB0cnVlO1xuICAgIHJldHVybiB0cmFuc2xhdGVGaWx0ZXI7XG4gIH1cbl0pOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvT2JqZWN0UGF0aC5qcycpLk9iamVjdFBhdGg7XG4iLCIndXNlIHN0cmljdCc7XG5cbjshZnVuY3Rpb24odW5kZWZpbmVkKSB7XG5cblx0dmFyIE9iamVjdFBhdGggPSB7XG5cdFx0cGFyc2U6IGZ1bmN0aW9uKHN0cil7XG5cdFx0XHRpZih0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJyl7XG5cdFx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ09iamVjdFBhdGgucGFyc2UgbXVzdCBiZSBwYXNzZWQgYSBzdHJpbmcnKTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIGkgPSAwO1xuXHRcdFx0dmFyIHBhcnRzID0gW107XG5cdFx0XHR2YXIgZCwgYiwgcSwgYztcblx0XHRcdHdoaWxlIChpIDwgc3RyLmxlbmd0aCl7XG5cdFx0XHRcdGQgPSBzdHIuaW5kZXhPZignLicsIGkpO1xuXHRcdFx0XHRiID0gc3RyLmluZGV4T2YoJ1snLCBpKTtcblxuXHRcdFx0XHQvLyB3ZSd2ZSByZWFjaGVkIHRoZSBlbmRcblx0XHRcdFx0aWYgKGQgPT09IC0xICYmIGIgPT09IC0xKXtcblx0XHRcdFx0XHRwYXJ0cy5wdXNoKHN0ci5zbGljZShpLCBzdHIubGVuZ3RoKSk7XG5cdFx0XHRcdFx0aSA9IHN0ci5sZW5ndGg7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBkb3RzXG5cdFx0XHRcdGVsc2UgaWYgKGIgPT09IC0xIHx8IChkICE9PSAtMSAmJiBkIDwgYikpIHtcblx0XHRcdFx0XHRwYXJ0cy5wdXNoKHN0ci5zbGljZShpLCBkKSk7XG5cdFx0XHRcdFx0aSA9IGQgKyAxO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gYnJhY2tldHNcblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0aWYgKGIgPiBpKXtcblx0XHRcdFx0XHRcdHBhcnRzLnB1c2goc3RyLnNsaWNlKGksIGIpKTtcblx0XHRcdFx0XHRcdGkgPSBiO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRxID0gc3RyLnNsaWNlKGIrMSwgYisyKTtcblx0XHRcdFx0XHRpZiAocSAhPT0gJ1wiJyAmJiBxICE9PSdcXCcnKSB7XG5cdFx0XHRcdFx0XHRjID0gc3RyLmluZGV4T2YoJ10nLCBiKTtcblx0XHRcdFx0XHRcdGlmIChjID09PSAtMSkgYyA9IHN0ci5sZW5ndGg7XG5cdFx0XHRcdFx0XHRwYXJ0cy5wdXNoKHN0ci5zbGljZShpICsgMSwgYykpO1xuXHRcdFx0XHRcdFx0aSA9IChzdHIuc2xpY2UoYyArIDEsIGMgKyAyKSA9PT0gJy4nKSA/IGMgKyAyIDogYyArIDE7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGMgPSBzdHIuaW5kZXhPZihxKyddJywgYik7XG5cdFx0XHRcdFx0XHRpZiAoYyA9PT0gLTEpIGMgPSBzdHIubGVuZ3RoO1xuXHRcdFx0XHRcdFx0d2hpbGUgKHN0ci5zbGljZShjIC0gMSwgYykgPT09ICdcXFxcJyAmJiBiIDwgc3RyLmxlbmd0aCl7XG5cdFx0XHRcdFx0XHRcdGIrKztcblx0XHRcdFx0XHRcdFx0YyA9IHN0ci5pbmRleE9mKHErJ10nLCBiKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHBhcnRzLnB1c2goc3RyLnNsaWNlKGkgKyAyLCBjKS5yZXBsYWNlKG5ldyBSZWdFeHAoJ1xcXFwnK3EsJ2cnKSwgcSkpO1xuXHRcdFx0XHRcdFx0aSA9IChzdHIuc2xpY2UoYyArIDIsIGMgKyAzKSA9PT0gJy4nKSA/IGMgKyAzIDogYyArIDI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcGFydHM7XG5cdFx0fSxcblxuXHRcdC8vIHJvb3QgPT09IHRydWUgOiBhdXRvIGNhbGN1bGF0ZSByb290OyBtdXN0IGJlIGRvdC1ub3RhdGlvbiBmcmllbmRseVxuXHRcdC8vIHJvb3QgU3RyaW5nIDogdGhlIHN0cmluZyB0byB1c2UgYXMgcm9vdFxuXHRcdHN0cmluZ2lmeTogZnVuY3Rpb24oYXJyLCBxdW90ZSl7XG5cblx0XHRcdGlmKCFBcnJheS5pc0FycmF5KGFycikpXG5cdFx0XHRcdGFyciA9IFthcnIudG9TdHJpbmcoKV07XG5cblx0XHRcdHF1b3RlID0gcXVvdGUgPT09ICdcIicgPyAnXCInIDogJ1xcJyc7XG5cblx0XHRcdHJldHVybiBhcnIubWFwKGZ1bmN0aW9uKG4peyByZXR1cm4gJ1snICsgcXVvdGUgKyAobi50b1N0cmluZygpKS5yZXBsYWNlKG5ldyBSZWdFeHAocXVvdGUsICdnJyksICdcXFxcJyArIHF1b3RlKSArIHF1b3RlICsgJ10nOyB9KS5qb2luKCcnKTtcblx0XHR9LFxuXG5cdFx0bm9ybWFsaXplOiBmdW5jdGlvbihkYXRhLCBxdW90ZSl7XG5cdFx0XHRyZXR1cm4gT2JqZWN0UGF0aC5zdHJpbmdpZnkoQXJyYXkuaXNBcnJheShkYXRhKSA/IGRhdGEgOiBPYmplY3RQYXRoLnBhcnNlKGRhdGEpLCBxdW90ZSk7XG5cdFx0fVxuXHR9O1xuXG5cdC8vIEFNRFxuXHRpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG5cdFx0ZGVmaW5lKGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIE9iamVjdFBhdGg7XG5cdFx0fSk7XG5cdH1cblxuXHQvLyBDb21tb25KU1xuXHRlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcblx0XHRleHBvcnRzLk9iamVjdFBhdGggPSBPYmplY3RQYXRoO1xuXHR9XG5cblx0Ly8gQW5ndWxhclxuXHRlbHNlIGlmICh0eXBlb2YgYW5ndWxhciA9PT0gJ29iamVjdCcpIHtcblx0XHRhbmd1bGFyLm1vZHVsZSgnT2JqZWN0UGF0aCcsIFtdKS5wcm92aWRlcignT2JqZWN0UGF0aCcsIGZ1bmN0aW9uKCl7XG5cdFx0XHR0aGlzLnBhcnNlID0gT2JqZWN0UGF0aC5wYXJzZTtcblx0XHRcdHRoaXMuc3RyaW5naWZ5ID0gT2JqZWN0UGF0aC5zdHJpbmdpZnk7XG5cdFx0XHR0aGlzLm5vcm1hbGl6ZSA9IE9iamVjdFBhdGgubm9ybWFsaXplO1xuXHRcdFx0dGhpcy4kZ2V0ID0gZnVuY3Rpb24oKXtcblx0XHRcdFx0cmV0dXJuIE9iamVjdFBhdGg7XG5cdFx0XHR9O1xuXHRcdH0pO1xuXHR9XG5cblx0Ly8gQnJvd3NlciBnbG9iYWwuXG5cdGVsc2Uge1xuXHRcdHdpbmRvdy5PYmplY3RQYXRoID0gT2JqZWN0UGF0aDtcblx0fVxufSgpOyIsIi8qXG5BdXRob3I6IEdlcmFpbnQgTHVmZiBhbmQgb3RoZXJzXG5ZZWFyOiAyMDEzXG5cblRoaXMgY29kZSBpcyByZWxlYXNlZCBpbnRvIHRoZSBcInB1YmxpYyBkb21haW5cIiBieSBpdHMgYXV0aG9yKHMpLiAgQW55Ym9keSBtYXkgdXNlLCBhbHRlciBhbmQgZGlzdHJpYnV0ZSB0aGUgY29kZSB3aXRob3V0IHJlc3RyaWN0aW9uLiAgVGhlIGF1dGhvciBtYWtlcyBubyBndWFyYW50ZWVzLCBhbmQgdGFrZXMgbm8gbGlhYmlsaXR5IG9mIGFueSBraW5kIGZvciB1c2Ugb2YgdGhpcyBjb2RlLlxuXG5JZiB5b3UgZmluZCBhIGJ1ZyBvciBtYWtlIGFuIGltcHJvdmVtZW50LCBpdCB3b3VsZCBiZSBjb3VydGVvdXMgdG8gbGV0IHRoZSBhdXRob3Iga25vdywgYnV0IGl0IGlzIG5vdCBjb21wdWxzb3J5LlxuKi9cbihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgZGVmaW5lKFtdLCBmYWN0b3J5KTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cyl7XG4gICAgLy8gQ29tbW9uSlMuIERlZmluZSBleHBvcnQuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gQnJvd3NlciBnbG9iYWxzXG4gICAgZ2xvYmFsLnR2NCA9IGZhY3RvcnkoKTtcbiAgfVxufSh0aGlzLCBmdW5jdGlvbiAoKSB7XG5cbi8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL09iamVjdC9rZXlzP3JlZGlyZWN0bG9jYWxlPWVuLVVTJnJlZGlyZWN0c2x1Zz1KYXZhU2NyaXB0JTJGUmVmZXJlbmNlJTJGR2xvYmFsX09iamVjdHMlMkZPYmplY3QlMkZrZXlzXG5pZiAoIU9iamVjdC5rZXlzKSB7XG5cdE9iamVjdC5rZXlzID0gKGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LFxuXHRcdFx0aGFzRG9udEVudW1CdWcgPSAhKHt0b1N0cmluZzogbnVsbH0pLnByb3BlcnR5SXNFbnVtZXJhYmxlKCd0b1N0cmluZycpLFxuXHRcdFx0ZG9udEVudW1zID0gW1xuXHRcdFx0XHQndG9TdHJpbmcnLFxuXHRcdFx0XHQndG9Mb2NhbGVTdHJpbmcnLFxuXHRcdFx0XHQndmFsdWVPZicsXG5cdFx0XHRcdCdoYXNPd25Qcm9wZXJ0eScsXG5cdFx0XHRcdCdpc1Byb3RvdHlwZU9mJyxcblx0XHRcdFx0J3Byb3BlcnR5SXNFbnVtZXJhYmxlJyxcblx0XHRcdFx0J2NvbnN0cnVjdG9yJ1xuXHRcdFx0XSxcblx0XHRcdGRvbnRFbnVtc0xlbmd0aCA9IGRvbnRFbnVtcy5sZW5ndGg7XG5cblx0XHRyZXR1cm4gZnVuY3Rpb24gKG9iaikge1xuXHRcdFx0aWYgKHR5cGVvZiBvYmogIT09ICdvYmplY3QnICYmIHR5cGVvZiBvYmogIT09ICdmdW5jdGlvbicgfHwgb2JqID09PSBudWxsKSB7XG5cdFx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ09iamVjdC5rZXlzIGNhbGxlZCBvbiBub24tb2JqZWN0Jyk7XG5cdFx0XHR9XG5cblx0XHRcdHZhciByZXN1bHQgPSBbXTtcblxuXHRcdFx0Zm9yICh2YXIgcHJvcCBpbiBvYmopIHtcblx0XHRcdFx0aWYgKGhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkge1xuXHRcdFx0XHRcdHJlc3VsdC5wdXNoKHByb3ApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmIChoYXNEb250RW51bUJ1Zykge1xuXHRcdFx0XHRmb3IgKHZhciBpPTA7IGkgPCBkb250RW51bXNMZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgZG9udEVudW1zW2ldKSkge1xuXHRcdFx0XHRcdFx0cmVzdWx0LnB1c2goZG9udEVudW1zW2ldKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fTtcblx0fSkoKTtcbn1cbi8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL09iamVjdC9jcmVhdGVcbmlmICghT2JqZWN0LmNyZWF0ZSkge1xuXHRPYmplY3QuY3JlYXRlID0gKGZ1bmN0aW9uKCl7XG5cdFx0ZnVuY3Rpb24gRigpe31cblxuXHRcdHJldHVybiBmdW5jdGlvbihvKXtcblx0XHRcdGlmIChhcmd1bWVudHMubGVuZ3RoICE9PSAxKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcignT2JqZWN0LmNyZWF0ZSBpbXBsZW1lbnRhdGlvbiBvbmx5IGFjY2VwdHMgb25lIHBhcmFtZXRlci4nKTtcblx0XHRcdH1cblx0XHRcdEYucHJvdG90eXBlID0gbztcblx0XHRcdHJldHVybiBuZXcgRigpO1xuXHRcdH07XG5cdH0pKCk7XG59XG4vLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS9pc0FycmF5P3JlZGlyZWN0bG9jYWxlPWVuLVVTJnJlZGlyZWN0c2x1Zz1KYXZhU2NyaXB0JTJGUmVmZXJlbmNlJTJGR2xvYmFsX09iamVjdHMlMkZBcnJheSUyRmlzQXJyYXlcbmlmKCFBcnJheS5pc0FycmF5KSB7XG5cdEFycmF5LmlzQXJyYXkgPSBmdW5jdGlvbiAodkFyZykge1xuXHRcdHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodkFyZykgPT09IFwiW29iamVjdCBBcnJheV1cIjtcblx0fTtcbn1cbi8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5L2luZGV4T2Y/cmVkaXJlY3Rsb2NhbGU9ZW4tVVMmcmVkaXJlY3RzbHVnPUphdmFTY3JpcHQlMkZSZWZlcmVuY2UlMkZHbG9iYWxfT2JqZWN0cyUyRkFycmF5JTJGaW5kZXhPZlxuaWYgKCFBcnJheS5wcm90b3R5cGUuaW5kZXhPZikge1xuXHRBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA9IGZ1bmN0aW9uIChzZWFyY2hFbGVtZW50IC8qLCBmcm9tSW5kZXggKi8gKSB7XG5cdFx0aWYgKHRoaXMgPT09IG51bGwpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoKTtcblx0XHR9XG5cdFx0dmFyIHQgPSBPYmplY3QodGhpcyk7XG5cdFx0dmFyIGxlbiA9IHQubGVuZ3RoID4+PiAwO1xuXG5cdFx0aWYgKGxlbiA9PT0gMCkge1xuXHRcdFx0cmV0dXJuIC0xO1xuXHRcdH1cblx0XHR2YXIgbiA9IDA7XG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG5cdFx0XHRuID0gTnVtYmVyKGFyZ3VtZW50c1sxXSk7XG5cdFx0XHRpZiAobiAhPT0gbikgeyAvLyBzaG9ydGN1dCBmb3IgdmVyaWZ5aW5nIGlmIGl0J3MgTmFOXG5cdFx0XHRcdG4gPSAwO1xuXHRcdFx0fSBlbHNlIGlmIChuICE9PSAwICYmIG4gIT09IEluZmluaXR5ICYmIG4gIT09IC1JbmZpbml0eSkge1xuXHRcdFx0XHRuID0gKG4gPiAwIHx8IC0xKSAqIE1hdGguZmxvb3IoTWF0aC5hYnMobikpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAobiA+PSBsZW4pIHtcblx0XHRcdHJldHVybiAtMTtcblx0XHR9XG5cdFx0dmFyIGsgPSBuID49IDAgPyBuIDogTWF0aC5tYXgobGVuIC0gTWF0aC5hYnMobiksIDApO1xuXHRcdGZvciAoOyBrIDwgbGVuOyBrKyspIHtcblx0XHRcdGlmIChrIGluIHQgJiYgdFtrXSA9PT0gc2VhcmNoRWxlbWVudCkge1xuXHRcdFx0XHRyZXR1cm4gaztcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIC0xO1xuXHR9O1xufVxuXG4vLyBHcnVuZ2V5IE9iamVjdC5pc0Zyb3plbiBoYWNrXG5pZiAoIU9iamVjdC5pc0Zyb3plbikge1xuXHRPYmplY3QuaXNGcm96ZW4gPSBmdW5jdGlvbiAob2JqKSB7XG5cdFx0dmFyIGtleSA9IFwidHY0X3Rlc3RfZnJvemVuX2tleVwiO1xuXHRcdHdoaWxlIChvYmouaGFzT3duUHJvcGVydHkoa2V5KSkge1xuXHRcdFx0a2V5ICs9IE1hdGgucmFuZG9tKCk7XG5cdFx0fVxuXHRcdHRyeSB7XG5cdFx0XHRvYmpba2V5XSA9IHRydWU7XG5cdFx0XHRkZWxldGUgb2JqW2tleV07XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9O1xufVxuLy8gQmFzZWQgb246IGh0dHBzOi8vZ2l0aHViLmNvbS9nZXJhaW50bHVmZi91cmktdGVtcGxhdGVzLCBidXQgd2l0aCBhbGwgdGhlIGRlLXN1YnN0aXR1dGlvbiBzdHVmZiByZW1vdmVkXG5cbnZhciB1cmlUZW1wbGF0ZUdsb2JhbE1vZGlmaWVycyA9IHtcblx0XCIrXCI6IHRydWUsXG5cdFwiI1wiOiB0cnVlLFxuXHRcIi5cIjogdHJ1ZSxcblx0XCIvXCI6IHRydWUsXG5cdFwiO1wiOiB0cnVlLFxuXHRcIj9cIjogdHJ1ZSxcblx0XCImXCI6IHRydWVcbn07XG52YXIgdXJpVGVtcGxhdGVTdWZmaWNlcyA9IHtcblx0XCIqXCI6IHRydWVcbn07XG5cbmZ1bmN0aW9uIG5vdFJlYWxseVBlcmNlbnRFbmNvZGUoc3RyaW5nKSB7XG5cdHJldHVybiBlbmNvZGVVUkkoc3RyaW5nKS5yZXBsYWNlKC8lMjVbMC05XVswLTldL2csIGZ1bmN0aW9uIChkb3VibGVFbmNvZGVkKSB7XG5cdFx0cmV0dXJuIFwiJVwiICsgZG91YmxlRW5jb2RlZC5zdWJzdHJpbmcoMyk7XG5cdH0pO1xufVxuXG5mdW5jdGlvbiB1cmlUZW1wbGF0ZVN1YnN0aXR1dGlvbihzcGVjKSB7XG5cdHZhciBtb2RpZmllciA9IFwiXCI7XG5cdGlmICh1cmlUZW1wbGF0ZUdsb2JhbE1vZGlmaWVyc1tzcGVjLmNoYXJBdCgwKV0pIHtcblx0XHRtb2RpZmllciA9IHNwZWMuY2hhckF0KDApO1xuXHRcdHNwZWMgPSBzcGVjLnN1YnN0cmluZygxKTtcblx0fVxuXHR2YXIgc2VwYXJhdG9yID0gXCJcIjtcblx0dmFyIHByZWZpeCA9IFwiXCI7XG5cdHZhciBzaG91bGRFc2NhcGUgPSB0cnVlO1xuXHR2YXIgc2hvd1ZhcmlhYmxlcyA9IGZhbHNlO1xuXHR2YXIgdHJpbUVtcHR5U3RyaW5nID0gZmFsc2U7XG5cdGlmIChtb2RpZmllciA9PT0gJysnKSB7XG5cdFx0c2hvdWxkRXNjYXBlID0gZmFsc2U7XG5cdH0gZWxzZSBpZiAobW9kaWZpZXIgPT09IFwiLlwiKSB7XG5cdFx0cHJlZml4ID0gXCIuXCI7XG5cdFx0c2VwYXJhdG9yID0gXCIuXCI7XG5cdH0gZWxzZSBpZiAobW9kaWZpZXIgPT09IFwiL1wiKSB7XG5cdFx0cHJlZml4ID0gXCIvXCI7XG5cdFx0c2VwYXJhdG9yID0gXCIvXCI7XG5cdH0gZWxzZSBpZiAobW9kaWZpZXIgPT09ICcjJykge1xuXHRcdHByZWZpeCA9IFwiI1wiO1xuXHRcdHNob3VsZEVzY2FwZSA9IGZhbHNlO1xuXHR9IGVsc2UgaWYgKG1vZGlmaWVyID09PSAnOycpIHtcblx0XHRwcmVmaXggPSBcIjtcIjtcblx0XHRzZXBhcmF0b3IgPSBcIjtcIjtcblx0XHRzaG93VmFyaWFibGVzID0gdHJ1ZTtcblx0XHR0cmltRW1wdHlTdHJpbmcgPSB0cnVlO1xuXHR9IGVsc2UgaWYgKG1vZGlmaWVyID09PSAnPycpIHtcblx0XHRwcmVmaXggPSBcIj9cIjtcblx0XHRzZXBhcmF0b3IgPSBcIiZcIjtcblx0XHRzaG93VmFyaWFibGVzID0gdHJ1ZTtcblx0fSBlbHNlIGlmIChtb2RpZmllciA9PT0gJyYnKSB7XG5cdFx0cHJlZml4ID0gXCImXCI7XG5cdFx0c2VwYXJhdG9yID0gXCImXCI7XG5cdFx0c2hvd1ZhcmlhYmxlcyA9IHRydWU7XG5cdH1cblxuXHR2YXIgdmFyTmFtZXMgPSBbXTtcblx0dmFyIHZhckxpc3QgPSBzcGVjLnNwbGl0KFwiLFwiKTtcblx0dmFyIHZhclNwZWNzID0gW107XG5cdHZhciB2YXJTcGVjTWFwID0ge307XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgdmFyTGlzdC5sZW5ndGg7IGkrKykge1xuXHRcdHZhciB2YXJOYW1lID0gdmFyTGlzdFtpXTtcblx0XHR2YXIgdHJ1bmNhdGUgPSBudWxsO1xuXHRcdGlmICh2YXJOYW1lLmluZGV4T2YoXCI6XCIpICE9PSAtMSkge1xuXHRcdFx0dmFyIHBhcnRzID0gdmFyTmFtZS5zcGxpdChcIjpcIik7XG5cdFx0XHR2YXJOYW1lID0gcGFydHNbMF07XG5cdFx0XHR0cnVuY2F0ZSA9IHBhcnNlSW50KHBhcnRzWzFdLCAxMCk7XG5cdFx0fVxuXHRcdHZhciBzdWZmaWNlcyA9IHt9O1xuXHRcdHdoaWxlICh1cmlUZW1wbGF0ZVN1ZmZpY2VzW3Zhck5hbWUuY2hhckF0KHZhck5hbWUubGVuZ3RoIC0gMSldKSB7XG5cdFx0XHRzdWZmaWNlc1t2YXJOYW1lLmNoYXJBdCh2YXJOYW1lLmxlbmd0aCAtIDEpXSA9IHRydWU7XG5cdFx0XHR2YXJOYW1lID0gdmFyTmFtZS5zdWJzdHJpbmcoMCwgdmFyTmFtZS5sZW5ndGggLSAxKTtcblx0XHR9XG5cdFx0dmFyIHZhclNwZWMgPSB7XG5cdFx0XHR0cnVuY2F0ZTogdHJ1bmNhdGUsXG5cdFx0XHRuYW1lOiB2YXJOYW1lLFxuXHRcdFx0c3VmZmljZXM6IHN1ZmZpY2VzXG5cdFx0fTtcblx0XHR2YXJTcGVjcy5wdXNoKHZhclNwZWMpO1xuXHRcdHZhclNwZWNNYXBbdmFyTmFtZV0gPSB2YXJTcGVjO1xuXHRcdHZhck5hbWVzLnB1c2godmFyTmFtZSk7XG5cdH1cblx0dmFyIHN1YkZ1bmN0aW9uID0gZnVuY3Rpb24gKHZhbHVlRnVuY3Rpb24pIHtcblx0XHR2YXIgcmVzdWx0ID0gXCJcIjtcblx0XHR2YXIgc3RhcnRJbmRleCA9IDA7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB2YXJTcGVjcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIHZhclNwZWMgPSB2YXJTcGVjc1tpXTtcblx0XHRcdHZhciB2YWx1ZSA9IHZhbHVlRnVuY3Rpb24odmFyU3BlYy5uYW1lKTtcblx0XHRcdGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IChBcnJheS5pc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5sZW5ndGggPT09IDApIHx8ICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIE9iamVjdC5rZXlzKHZhbHVlKS5sZW5ndGggPT09IDApKSB7XG5cdFx0XHRcdHN0YXJ0SW5kZXgrKztcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHRpZiAoaSA9PT0gc3RhcnRJbmRleCkge1xuXHRcdFx0XHRyZXN1bHQgKz0gcHJlZml4O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmVzdWx0ICs9IChzZXBhcmF0b3IgfHwgXCIsXCIpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG5cdFx0XHRcdGlmIChzaG93VmFyaWFibGVzKSB7XG5cdFx0XHRcdFx0cmVzdWx0ICs9IHZhclNwZWMubmFtZSArIFwiPVwiO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgdmFsdWUubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0XHRpZiAoaiA+IDApIHtcblx0XHRcdFx0XHRcdHJlc3VsdCArPSB2YXJTcGVjLnN1ZmZpY2VzWycqJ10gPyAoc2VwYXJhdG9yIHx8IFwiLFwiKSA6IFwiLFwiO1xuXHRcdFx0XHRcdFx0aWYgKHZhclNwZWMuc3VmZmljZXNbJyonXSAmJiBzaG93VmFyaWFibGVzKSB7XG5cdFx0XHRcdFx0XHRcdHJlc3VsdCArPSB2YXJTcGVjLm5hbWUgKyBcIj1cIjtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmVzdWx0ICs9IHNob3VsZEVzY2FwZSA/IGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZVtqXSkucmVwbGFjZSgvIS9nLCBcIiUyMVwiKSA6IG5vdFJlYWxseVBlcmNlbnRFbmNvZGUodmFsdWVbal0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0XHRpZiAoc2hvd1ZhcmlhYmxlcyAmJiAhdmFyU3BlYy5zdWZmaWNlc1snKiddKSB7XG5cdFx0XHRcdFx0cmVzdWx0ICs9IHZhclNwZWMubmFtZSArIFwiPVwiO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHZhciBmaXJzdCA9IHRydWU7XG5cdFx0XHRcdGZvciAodmFyIGtleSBpbiB2YWx1ZSkge1xuXHRcdFx0XHRcdGlmICghZmlyc3QpIHtcblx0XHRcdFx0XHRcdHJlc3VsdCArPSB2YXJTcGVjLnN1ZmZpY2VzWycqJ10gPyAoc2VwYXJhdG9yIHx8IFwiLFwiKSA6IFwiLFwiO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRmaXJzdCA9IGZhbHNlO1xuXHRcdFx0XHRcdHJlc3VsdCArPSBzaG91bGRFc2NhcGUgPyBlbmNvZGVVUklDb21wb25lbnQoa2V5KS5yZXBsYWNlKC8hL2csIFwiJTIxXCIpIDogbm90UmVhbGx5UGVyY2VudEVuY29kZShrZXkpO1xuXHRcdFx0XHRcdHJlc3VsdCArPSB2YXJTcGVjLnN1ZmZpY2VzWycqJ10gPyAnPScgOiBcIixcIjtcblx0XHRcdFx0XHRyZXN1bHQgKz0gc2hvdWxkRXNjYXBlID8gZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlW2tleV0pLnJlcGxhY2UoLyEvZywgXCIlMjFcIikgOiBub3RSZWFsbHlQZXJjZW50RW5jb2RlKHZhbHVlW2tleV0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZiAoc2hvd1ZhcmlhYmxlcykge1xuXHRcdFx0XHRcdHJlc3VsdCArPSB2YXJTcGVjLm5hbWU7XG5cdFx0XHRcdFx0aWYgKCF0cmltRW1wdHlTdHJpbmcgfHwgdmFsdWUgIT09IFwiXCIpIHtcblx0XHRcdFx0XHRcdHJlc3VsdCArPSBcIj1cIjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHZhclNwZWMudHJ1bmNhdGUgIT0gbnVsbCkge1xuXHRcdFx0XHRcdHZhbHVlID0gdmFsdWUuc3Vic3RyaW5nKDAsIHZhclNwZWMudHJ1bmNhdGUpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJlc3VsdCArPSBzaG91bGRFc2NhcGUgPyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpLnJlcGxhY2UoLyEvZywgXCIlMjFcIik6IG5vdFJlYWxseVBlcmNlbnRFbmNvZGUodmFsdWUpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9O1xuXHRzdWJGdW5jdGlvbi52YXJOYW1lcyA9IHZhck5hbWVzO1xuXHRyZXR1cm4ge1xuXHRcdHByZWZpeDogcHJlZml4LFxuXHRcdHN1YnN0aXR1dGlvbjogc3ViRnVuY3Rpb25cblx0fTtcbn1cblxuZnVuY3Rpb24gVXJpVGVtcGxhdGUodGVtcGxhdGUpIHtcblx0aWYgKCEodGhpcyBpbnN0YW5jZW9mIFVyaVRlbXBsYXRlKSkge1xuXHRcdHJldHVybiBuZXcgVXJpVGVtcGxhdGUodGVtcGxhdGUpO1xuXHR9XG5cdHZhciBwYXJ0cyA9IHRlbXBsYXRlLnNwbGl0KFwie1wiKTtcblx0dmFyIHRleHRQYXJ0cyA9IFtwYXJ0cy5zaGlmdCgpXTtcblx0dmFyIHByZWZpeGVzID0gW107XG5cdHZhciBzdWJzdGl0dXRpb25zID0gW107XG5cdHZhciB2YXJOYW1lcyA9IFtdO1xuXHR3aGlsZSAocGFydHMubGVuZ3RoID4gMCkge1xuXHRcdHZhciBwYXJ0ID0gcGFydHMuc2hpZnQoKTtcblx0XHR2YXIgc3BlYyA9IHBhcnQuc3BsaXQoXCJ9XCIpWzBdO1xuXHRcdHZhciByZW1haW5kZXIgPSBwYXJ0LnN1YnN0cmluZyhzcGVjLmxlbmd0aCArIDEpO1xuXHRcdHZhciBmdW5jcyA9IHVyaVRlbXBsYXRlU3Vic3RpdHV0aW9uKHNwZWMpO1xuXHRcdHN1YnN0aXR1dGlvbnMucHVzaChmdW5jcy5zdWJzdGl0dXRpb24pO1xuXHRcdHByZWZpeGVzLnB1c2goZnVuY3MucHJlZml4KTtcblx0XHR0ZXh0UGFydHMucHVzaChyZW1haW5kZXIpO1xuXHRcdHZhck5hbWVzID0gdmFyTmFtZXMuY29uY2F0KGZ1bmNzLnN1YnN0aXR1dGlvbi52YXJOYW1lcyk7XG5cdH1cblx0dGhpcy5maWxsID0gZnVuY3Rpb24gKHZhbHVlRnVuY3Rpb24pIHtcblx0XHR2YXIgcmVzdWx0ID0gdGV4dFBhcnRzWzBdO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc3Vic3RpdHV0aW9ucy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIHN1YnN0aXR1dGlvbiA9IHN1YnN0aXR1dGlvbnNbaV07XG5cdFx0XHRyZXN1bHQgKz0gc3Vic3RpdHV0aW9uKHZhbHVlRnVuY3Rpb24pO1xuXHRcdFx0cmVzdWx0ICs9IHRleHRQYXJ0c1tpICsgMV07XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH07XG5cdHRoaXMudmFyTmFtZXMgPSB2YXJOYW1lcztcblx0dGhpcy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xufVxuVXJpVGVtcGxhdGUucHJvdG90eXBlID0ge1xuXHR0b1N0cmluZzogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiB0aGlzLnRlbXBsYXRlO1xuXHR9LFxuXHRmaWxsRnJvbU9iamVjdDogZnVuY3Rpb24gKG9iaikge1xuXHRcdHJldHVybiB0aGlzLmZpbGwoZnVuY3Rpb24gKHZhck5hbWUpIHtcblx0XHRcdHJldHVybiBvYmpbdmFyTmFtZV07XG5cdFx0fSk7XG5cdH1cbn07XG52YXIgVmFsaWRhdG9yQ29udGV4dCA9IGZ1bmN0aW9uIFZhbGlkYXRvckNvbnRleHQocGFyZW50LCBjb2xsZWN0TXVsdGlwbGUsIGVycm9yTWVzc2FnZXMsIGNoZWNrUmVjdXJzaXZlLCB0cmFja1Vua25vd25Qcm9wZXJ0aWVzKSB7XG5cdHRoaXMubWlzc2luZyA9IFtdO1xuXHR0aGlzLm1pc3NpbmdNYXAgPSB7fTtcblx0dGhpcy5mb3JtYXRWYWxpZGF0b3JzID0gcGFyZW50ID8gT2JqZWN0LmNyZWF0ZShwYXJlbnQuZm9ybWF0VmFsaWRhdG9ycykgOiB7fTtcblx0dGhpcy5zY2hlbWFzID0gcGFyZW50ID8gT2JqZWN0LmNyZWF0ZShwYXJlbnQuc2NoZW1hcykgOiB7fTtcblx0dGhpcy5jb2xsZWN0TXVsdGlwbGUgPSBjb2xsZWN0TXVsdGlwbGU7XG5cdHRoaXMuZXJyb3JzID0gW107XG5cdHRoaXMuaGFuZGxlRXJyb3IgPSBjb2xsZWN0TXVsdGlwbGUgPyB0aGlzLmNvbGxlY3RFcnJvciA6IHRoaXMucmV0dXJuRXJyb3I7XG5cdGlmIChjaGVja1JlY3Vyc2l2ZSkge1xuXHRcdHRoaXMuY2hlY2tSZWN1cnNpdmUgPSB0cnVlO1xuXHRcdHRoaXMuc2Nhbm5lZCA9IFtdO1xuXHRcdHRoaXMuc2Nhbm5lZEZyb3plbiA9IFtdO1xuXHRcdHRoaXMuc2Nhbm5lZEZyb3plblNjaGVtYXMgPSBbXTtcblx0XHR0aGlzLnNjYW5uZWRGcm96ZW5WYWxpZGF0aW9uRXJyb3JzID0gW107XG5cdFx0dGhpcy52YWxpZGF0ZWRTY2hlbWFzS2V5ID0gJ3R2NF92YWxpZGF0aW9uX2lkJztcblx0XHR0aGlzLnZhbGlkYXRpb25FcnJvcnNLZXkgPSAndHY0X3ZhbGlkYXRpb25fZXJyb3JzX2lkJztcblx0fVxuXHRpZiAodHJhY2tVbmtub3duUHJvcGVydGllcykge1xuXHRcdHRoaXMudHJhY2tVbmtub3duUHJvcGVydGllcyA9IHRydWU7XG5cdFx0dGhpcy5rbm93blByb3BlcnR5UGF0aHMgPSB7fTtcblx0XHR0aGlzLnVua25vd25Qcm9wZXJ0eVBhdGhzID0ge307XG5cdH1cblx0dGhpcy5lcnJvck1lc3NhZ2VzID0gZXJyb3JNZXNzYWdlcztcblx0dGhpcy5kZWZpbmVkS2V5d29yZHMgPSB7fTtcblx0aWYgKHBhcmVudCkge1xuXHRcdGZvciAodmFyIGtleSBpbiBwYXJlbnQuZGVmaW5lZEtleXdvcmRzKSB7XG5cdFx0XHR0aGlzLmRlZmluZWRLZXl3b3Jkc1trZXldID0gcGFyZW50LmRlZmluZWRLZXl3b3Jkc1trZXldLnNsaWNlKDApO1xuXHRcdH1cblx0fVxufTtcblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLmRlZmluZUtleXdvcmQgPSBmdW5jdGlvbiAoa2V5d29yZCwga2V5d29yZEZ1bmN0aW9uKSB7XG5cdHRoaXMuZGVmaW5lZEtleXdvcmRzW2tleXdvcmRdID0gdGhpcy5kZWZpbmVkS2V5d29yZHNba2V5d29yZF0gfHwgW107XG5cdHRoaXMuZGVmaW5lZEtleXdvcmRzW2tleXdvcmRdLnB1c2goa2V5d29yZEZ1bmN0aW9uKTtcbn07XG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5jcmVhdGVFcnJvciA9IGZ1bmN0aW9uIChjb2RlLCBtZXNzYWdlUGFyYW1zLCBkYXRhUGF0aCwgc2NoZW1hUGF0aCwgc3ViRXJyb3JzKSB7XG5cdHZhciBtZXNzYWdlVGVtcGxhdGUgPSB0aGlzLmVycm9yTWVzc2FnZXNbY29kZV0gfHwgRXJyb3JNZXNzYWdlc0RlZmF1bHRbY29kZV07XG5cdGlmICh0eXBlb2YgbWVzc2FnZVRlbXBsYXRlICE9PSAnc3RyaW5nJykge1xuXHRcdHJldHVybiBuZXcgVmFsaWRhdGlvbkVycm9yKGNvZGUsIFwiVW5rbm93biBlcnJvciBjb2RlIFwiICsgY29kZSArIFwiOiBcIiArIEpTT04uc3RyaW5naWZ5KG1lc3NhZ2VQYXJhbXMpLCBtZXNzYWdlUGFyYW1zLCBkYXRhUGF0aCwgc2NoZW1hUGF0aCwgc3ViRXJyb3JzKTtcblx0fVxuXHQvLyBBZGFwdGVkIGZyb20gQ3JvY2tmb3JkJ3Mgc3VwcGxhbnQoKVxuXHR2YXIgbWVzc2FnZSA9IG1lc3NhZ2VUZW1wbGF0ZS5yZXBsYWNlKC9cXHsoW157fV0qKVxcfS9nLCBmdW5jdGlvbiAod2hvbGUsIHZhck5hbWUpIHtcblx0XHR2YXIgc3ViVmFsdWUgPSBtZXNzYWdlUGFyYW1zW3Zhck5hbWVdO1xuXHRcdHJldHVybiB0eXBlb2Ygc3ViVmFsdWUgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBzdWJWYWx1ZSA9PT0gJ251bWJlcicgPyBzdWJWYWx1ZSA6IHdob2xlO1xuXHR9KTtcblx0cmV0dXJuIG5ldyBWYWxpZGF0aW9uRXJyb3IoY29kZSwgbWVzc2FnZSwgbWVzc2FnZVBhcmFtcywgZGF0YVBhdGgsIHNjaGVtYVBhdGgsIHN1YkVycm9ycyk7XG59O1xuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUucmV0dXJuRXJyb3IgPSBmdW5jdGlvbiAoZXJyb3IpIHtcblx0cmV0dXJuIGVycm9yO1xufTtcblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLmNvbGxlY3RFcnJvciA9IGZ1bmN0aW9uIChlcnJvcikge1xuXHRpZiAoZXJyb3IpIHtcblx0XHR0aGlzLmVycm9ycy5wdXNoKGVycm9yKTtcblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5wcmVmaXhFcnJvcnMgPSBmdW5jdGlvbiAoc3RhcnRJbmRleCwgZGF0YVBhdGgsIHNjaGVtYVBhdGgpIHtcblx0Zm9yICh2YXIgaSA9IHN0YXJ0SW5kZXg7IGkgPCB0aGlzLmVycm9ycy5sZW5ndGg7IGkrKykge1xuXHRcdHRoaXMuZXJyb3JzW2ldID0gdGhpcy5lcnJvcnNbaV0ucHJlZml4V2l0aChkYXRhUGF0aCwgc2NoZW1hUGF0aCk7XG5cdH1cblx0cmV0dXJuIHRoaXM7XG59O1xuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUuYmFuVW5rbm93blByb3BlcnRpZXMgPSBmdW5jdGlvbiAoKSB7XG5cdGZvciAodmFyIHVua25vd25QYXRoIGluIHRoaXMudW5rbm93blByb3BlcnR5UGF0aHMpIHtcblx0XHR2YXIgZXJyb3IgPSB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuVU5LTk9XTl9QUk9QRVJUWSwge3BhdGg6IHVua25vd25QYXRofSwgdW5rbm93blBhdGgsIFwiXCIpO1xuXHRcdHZhciByZXN1bHQgPSB0aGlzLmhhbmRsZUVycm9yKGVycm9yKTtcblx0XHRpZiAocmVzdWx0KSB7XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLmFkZEZvcm1hdCA9IGZ1bmN0aW9uIChmb3JtYXQsIHZhbGlkYXRvcikge1xuXHRpZiAodHlwZW9mIGZvcm1hdCA9PT0gJ29iamVjdCcpIHtcblx0XHRmb3IgKHZhciBrZXkgaW4gZm9ybWF0KSB7XG5cdFx0XHR0aGlzLmFkZEZvcm1hdChrZXksIGZvcm1hdFtrZXldKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0dGhpcy5mb3JtYXRWYWxpZGF0b3JzW2Zvcm1hdF0gPSB2YWxpZGF0b3I7XG59O1xuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUucmVzb2x2ZVJlZnMgPSBmdW5jdGlvbiAoc2NoZW1hLCB1cmxIaXN0b3J5KSB7XG5cdGlmIChzY2hlbWFbJyRyZWYnXSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0dXJsSGlzdG9yeSA9IHVybEhpc3RvcnkgfHwge307XG5cdFx0aWYgKHVybEhpc3Rvcnlbc2NoZW1hWyckcmVmJ11dKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLkNJUkNVTEFSX1JFRkVSRU5DRSwge3VybHM6IE9iamVjdC5rZXlzKHVybEhpc3RvcnkpLmpvaW4oJywgJyl9LCAnJywgJycpO1xuXHRcdH1cblx0XHR1cmxIaXN0b3J5W3NjaGVtYVsnJHJlZiddXSA9IHRydWU7XG5cdFx0c2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoc2NoZW1hWyckcmVmJ10sIHVybEhpc3RvcnkpO1xuXHR9XG5cdHJldHVybiBzY2hlbWE7XG59O1xuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUuZ2V0U2NoZW1hID0gZnVuY3Rpb24gKHVybCwgdXJsSGlzdG9yeSkge1xuXHR2YXIgc2NoZW1hO1xuXHRpZiAodGhpcy5zY2hlbWFzW3VybF0gIT09IHVuZGVmaW5lZCkge1xuXHRcdHNjaGVtYSA9IHRoaXMuc2NoZW1hc1t1cmxdO1xuXHRcdHJldHVybiB0aGlzLnJlc29sdmVSZWZzKHNjaGVtYSwgdXJsSGlzdG9yeSk7XG5cdH1cblx0dmFyIGJhc2VVcmwgPSB1cmw7XG5cdHZhciBmcmFnbWVudCA9IFwiXCI7XG5cdGlmICh1cmwuaW5kZXhPZignIycpICE9PSAtMSkge1xuXHRcdGZyYWdtZW50ID0gdXJsLnN1YnN0cmluZyh1cmwuaW5kZXhPZihcIiNcIikgKyAxKTtcblx0XHRiYXNlVXJsID0gdXJsLnN1YnN0cmluZygwLCB1cmwuaW5kZXhPZihcIiNcIikpO1xuXHR9XG5cdGlmICh0eXBlb2YgdGhpcy5zY2hlbWFzW2Jhc2VVcmxdID09PSAnb2JqZWN0Jykge1xuXHRcdHNjaGVtYSA9IHRoaXMuc2NoZW1hc1tiYXNlVXJsXTtcblx0XHR2YXIgcG9pbnRlclBhdGggPSBkZWNvZGVVUklDb21wb25lbnQoZnJhZ21lbnQpO1xuXHRcdGlmIChwb2ludGVyUGF0aCA9PT0gXCJcIikge1xuXHRcdFx0cmV0dXJuIHRoaXMucmVzb2x2ZVJlZnMoc2NoZW1hLCB1cmxIaXN0b3J5KTtcblx0XHR9IGVsc2UgaWYgKHBvaW50ZXJQYXRoLmNoYXJBdCgwKSAhPT0gXCIvXCIpIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHRcdHZhciBwYXJ0cyA9IHBvaW50ZXJQYXRoLnNwbGl0KFwiL1wiKS5zbGljZSgxKTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgY29tcG9uZW50ID0gcGFydHNbaV0ucmVwbGFjZSgvfjEvZywgXCIvXCIpLnJlcGxhY2UoL34wL2csIFwiflwiKTtcblx0XHRcdGlmIChzY2hlbWFbY29tcG9uZW50XSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHNjaGVtYSA9IHVuZGVmaW5lZDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0XHRzY2hlbWEgPSBzY2hlbWFbY29tcG9uZW50XTtcblx0XHR9XG5cdFx0aWYgKHNjaGVtYSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5yZXNvbHZlUmVmcyhzY2hlbWEsIHVybEhpc3RvcnkpO1xuXHRcdH1cblx0fVxuXHRpZiAodGhpcy5taXNzaW5nW2Jhc2VVcmxdID09PSB1bmRlZmluZWQpIHtcblx0XHR0aGlzLm1pc3NpbmcucHVzaChiYXNlVXJsKTtcblx0XHR0aGlzLm1pc3NpbmdbYmFzZVVybF0gPSBiYXNlVXJsO1xuXHRcdHRoaXMubWlzc2luZ01hcFtiYXNlVXJsXSA9IGJhc2VVcmw7XG5cdH1cbn07XG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5zZWFyY2hTY2hlbWFzID0gZnVuY3Rpb24gKHNjaGVtYSwgdXJsKSB7XG5cdGlmIChzY2hlbWEgJiYgdHlwZW9mIHNjaGVtYSA9PT0gXCJvYmplY3RcIikge1xuXHRcdGlmICh0eXBlb2Ygc2NoZW1hLmlkID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRpZiAoaXNUcnVzdGVkVXJsKHVybCwgc2NoZW1hLmlkKSkge1xuXHRcdFx0XHRpZiAodGhpcy5zY2hlbWFzW3NjaGVtYS5pZF0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdHRoaXMuc2NoZW1hc1tzY2hlbWEuaWRdID0gc2NoZW1hO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGZvciAodmFyIGtleSBpbiBzY2hlbWEpIHtcblx0XHRcdGlmIChrZXkgIT09IFwiZW51bVwiKSB7XG5cdFx0XHRcdGlmICh0eXBlb2Ygc2NoZW1hW2tleV0gPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdFx0XHR0aGlzLnNlYXJjaFNjaGVtYXMoc2NoZW1hW2tleV0sIHVybCk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoa2V5ID09PSBcIiRyZWZcIikge1xuXHRcdFx0XHRcdHZhciB1cmkgPSBnZXREb2N1bWVudFVyaShzY2hlbWFba2V5XSk7XG5cdFx0XHRcdFx0aWYgKHVyaSAmJiB0aGlzLnNjaGVtYXNbdXJpXSA9PT0gdW5kZWZpbmVkICYmIHRoaXMubWlzc2luZ01hcFt1cmldID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdHRoaXMubWlzc2luZ01hcFt1cmldID0gdXJpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxufTtcblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLmFkZFNjaGVtYSA9IGZ1bmN0aW9uICh1cmwsIHNjaGVtYSkge1xuXHQvL292ZXJsb2FkXG5cdGlmICh0eXBlb2YgdXJsICE9PSAnc3RyaW5nJyB8fCB0eXBlb2Ygc2NoZW1hID09PSAndW5kZWZpbmVkJykge1xuXHRcdGlmICh0eXBlb2YgdXJsID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgdXJsLmlkID09PSAnc3RyaW5nJykge1xuXHRcdFx0c2NoZW1hID0gdXJsO1xuXHRcdFx0dXJsID0gc2NoZW1hLmlkO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdH1cblx0aWYgKHVybCA9PT0gZ2V0RG9jdW1lbnRVcmkodXJsKSArIFwiI1wiKSB7XG5cdFx0Ly8gUmVtb3ZlIGVtcHR5IGZyYWdtZW50XG5cdFx0dXJsID0gZ2V0RG9jdW1lbnRVcmkodXJsKTtcblx0fVxuXHR0aGlzLnNjaGVtYXNbdXJsXSA9IHNjaGVtYTtcblx0ZGVsZXRlIHRoaXMubWlzc2luZ01hcFt1cmxdO1xuXHRub3JtU2NoZW1hKHNjaGVtYSwgdXJsKTtcblx0dGhpcy5zZWFyY2hTY2hlbWFzKHNjaGVtYSwgdXJsKTtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLmdldFNjaGVtYU1hcCA9IGZ1bmN0aW9uICgpIHtcblx0dmFyIG1hcCA9IHt9O1xuXHRmb3IgKHZhciBrZXkgaW4gdGhpcy5zY2hlbWFzKSB7XG5cdFx0bWFwW2tleV0gPSB0aGlzLnNjaGVtYXNba2V5XTtcblx0fVxuXHRyZXR1cm4gbWFwO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUuZ2V0U2NoZW1hVXJpcyA9IGZ1bmN0aW9uIChmaWx0ZXJSZWdFeHApIHtcblx0dmFyIGxpc3QgPSBbXTtcblx0Zm9yICh2YXIga2V5IGluIHRoaXMuc2NoZW1hcykge1xuXHRcdGlmICghZmlsdGVyUmVnRXhwIHx8IGZpbHRlclJlZ0V4cC50ZXN0KGtleSkpIHtcblx0XHRcdGxpc3QucHVzaChrZXkpO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gbGlzdDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLmdldE1pc3NpbmdVcmlzID0gZnVuY3Rpb24gKGZpbHRlclJlZ0V4cCkge1xuXHR2YXIgbGlzdCA9IFtdO1xuXHRmb3IgKHZhciBrZXkgaW4gdGhpcy5taXNzaW5nTWFwKSB7XG5cdFx0aWYgKCFmaWx0ZXJSZWdFeHAgfHwgZmlsdGVyUmVnRXhwLnRlc3Qoa2V5KSkge1xuXHRcdFx0bGlzdC5wdXNoKGtleSk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBsaXN0O1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUuZHJvcFNjaGVtYXMgPSBmdW5jdGlvbiAoKSB7XG5cdHRoaXMuc2NoZW1hcyA9IHt9O1xuXHR0aGlzLnJlc2V0KCk7XG59O1xuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbiAoKSB7XG5cdHRoaXMubWlzc2luZyA9IFtdO1xuXHR0aGlzLm1pc3NpbmdNYXAgPSB7fTtcblx0dGhpcy5lcnJvcnMgPSBbXTtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlQWxsID0gZnVuY3Rpb24gKGRhdGEsIHNjaGVtYSwgZGF0YVBhdGhQYXJ0cywgc2NoZW1hUGF0aFBhcnRzLCBkYXRhUG9pbnRlclBhdGgpIHtcblx0dmFyIHRvcExldmVsO1xuXHRzY2hlbWEgPSB0aGlzLnJlc29sdmVSZWZzKHNjaGVtYSk7XG5cdGlmICghc2NoZW1hKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH0gZWxzZSBpZiAoc2NoZW1hIGluc3RhbmNlb2YgVmFsaWRhdGlvbkVycm9yKSB7XG5cdFx0dGhpcy5lcnJvcnMucHVzaChzY2hlbWEpO1xuXHRcdHJldHVybiBzY2hlbWE7XG5cdH1cblxuXHR2YXIgc3RhcnRFcnJvckNvdW50ID0gdGhpcy5lcnJvcnMubGVuZ3RoO1xuXHR2YXIgZnJvemVuSW5kZXgsIHNjYW5uZWRGcm96ZW5TY2hlbWFJbmRleCA9IG51bGwsIHNjYW5uZWRTY2hlbWFzSW5kZXggPSBudWxsO1xuXHRpZiAodGhpcy5jaGVja1JlY3Vyc2l2ZSAmJiBkYXRhICYmIHR5cGVvZiBkYXRhID09PSAnb2JqZWN0Jykge1xuXHRcdHRvcExldmVsID0gIXRoaXMuc2Nhbm5lZC5sZW5ndGg7XG5cdFx0aWYgKGRhdGFbdGhpcy52YWxpZGF0ZWRTY2hlbWFzS2V5XSkge1xuXHRcdFx0dmFyIHNjaGVtYUluZGV4ID0gZGF0YVt0aGlzLnZhbGlkYXRlZFNjaGVtYXNLZXldLmluZGV4T2Yoc2NoZW1hKTtcblx0XHRcdGlmIChzY2hlbWFJbmRleCAhPT0gLTEpIHtcblx0XHRcdFx0dGhpcy5lcnJvcnMgPSB0aGlzLmVycm9ycy5jb25jYXQoZGF0YVt0aGlzLnZhbGlkYXRpb25FcnJvcnNLZXldW3NjaGVtYUluZGV4XSk7XG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoT2JqZWN0LmlzRnJvemVuKGRhdGEpKSB7XG5cdFx0XHRmcm96ZW5JbmRleCA9IHRoaXMuc2Nhbm5lZEZyb3plbi5pbmRleE9mKGRhdGEpO1xuXHRcdFx0aWYgKGZyb3plbkluZGV4ICE9PSAtMSkge1xuXHRcdFx0XHR2YXIgZnJvemVuU2NoZW1hSW5kZXggPSB0aGlzLnNjYW5uZWRGcm96ZW5TY2hlbWFzW2Zyb3plbkluZGV4XS5pbmRleE9mKHNjaGVtYSk7XG5cdFx0XHRcdGlmIChmcm96ZW5TY2hlbWFJbmRleCAhPT0gLTEpIHtcblx0XHRcdFx0XHR0aGlzLmVycm9ycyA9IHRoaXMuZXJyb3JzLmNvbmNhdCh0aGlzLnNjYW5uZWRGcm96ZW5WYWxpZGF0aW9uRXJyb3JzW2Zyb3plbkluZGV4XVtmcm96ZW5TY2hlbWFJbmRleF0pO1xuXHRcdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHRoaXMuc2Nhbm5lZC5wdXNoKGRhdGEpO1xuXHRcdGlmIChPYmplY3QuaXNGcm96ZW4oZGF0YSkpIHtcblx0XHRcdGlmIChmcm96ZW5JbmRleCA9PT0gLTEpIHtcblx0XHRcdFx0ZnJvemVuSW5kZXggPSB0aGlzLnNjYW5uZWRGcm96ZW4ubGVuZ3RoO1xuXHRcdFx0XHR0aGlzLnNjYW5uZWRGcm96ZW4ucHVzaChkYXRhKTtcblx0XHRcdFx0dGhpcy5zY2FubmVkRnJvemVuU2NoZW1hcy5wdXNoKFtdKTtcblx0XHRcdH1cblx0XHRcdHNjYW5uZWRGcm96ZW5TY2hlbWFJbmRleCA9IHRoaXMuc2Nhbm5lZEZyb3plblNjaGVtYXNbZnJvemVuSW5kZXhdLmxlbmd0aDtcblx0XHRcdHRoaXMuc2Nhbm5lZEZyb3plblNjaGVtYXNbZnJvemVuSW5kZXhdW3NjYW5uZWRGcm96ZW5TY2hlbWFJbmRleF0gPSBzY2hlbWE7XG5cdFx0XHR0aGlzLnNjYW5uZWRGcm96ZW5WYWxpZGF0aW9uRXJyb3JzW2Zyb3plbkluZGV4XVtzY2FubmVkRnJvemVuU2NoZW1hSW5kZXhdID0gW107XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICghZGF0YVt0aGlzLnZhbGlkYXRlZFNjaGVtYXNLZXldKSB7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGRhdGEsIHRoaXMudmFsaWRhdGVkU2NoZW1hc0tleSwge1xuXHRcdFx0XHRcdFx0dmFsdWU6IFtdLFxuXHRcdFx0XHRcdFx0Y29uZmlndXJhYmxlOiB0cnVlXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGRhdGEsIHRoaXMudmFsaWRhdGlvbkVycm9yc0tleSwge1xuXHRcdFx0XHRcdFx0dmFsdWU6IFtdLFxuXHRcdFx0XHRcdFx0Y29uZmlndXJhYmxlOiB0cnVlXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHQvL0lFIDcvOCB3b3JrYXJvdW5kXG5cdFx0XHRcdFx0ZGF0YVt0aGlzLnZhbGlkYXRlZFNjaGVtYXNLZXldID0gW107XG5cdFx0XHRcdFx0ZGF0YVt0aGlzLnZhbGlkYXRpb25FcnJvcnNLZXldID0gW107XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHNjYW5uZWRTY2hlbWFzSW5kZXggPSBkYXRhW3RoaXMudmFsaWRhdGVkU2NoZW1hc0tleV0ubGVuZ3RoO1xuXHRcdFx0ZGF0YVt0aGlzLnZhbGlkYXRlZFNjaGVtYXNLZXldW3NjYW5uZWRTY2hlbWFzSW5kZXhdID0gc2NoZW1hO1xuXHRcdFx0ZGF0YVt0aGlzLnZhbGlkYXRpb25FcnJvcnNLZXldW3NjYW5uZWRTY2hlbWFzSW5kZXhdID0gW107XG5cdFx0fVxuXHR9XG5cblx0dmFyIGVycm9yQ291bnQgPSB0aGlzLmVycm9ycy5sZW5ndGg7XG5cdHZhciBlcnJvciA9IHRoaXMudmFsaWRhdGVCYXNpYyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCB0aGlzLnZhbGlkYXRlTnVtZXJpYyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCB0aGlzLnZhbGlkYXRlU3RyaW5nKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVBcnJheShkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCB0aGlzLnZhbGlkYXRlT2JqZWN0KGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVDb21iaW5hdGlvbnMoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZUh5cGVybWVkaWEoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZUZvcm1hdChkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCB0aGlzLnZhbGlkYXRlRGVmaW5lZEtleXdvcmRzKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IG51bGw7XG5cblx0aWYgKHRvcExldmVsKSB7XG5cdFx0d2hpbGUgKHRoaXMuc2Nhbm5lZC5sZW5ndGgpIHtcblx0XHRcdHZhciBpdGVtID0gdGhpcy5zY2FubmVkLnBvcCgpO1xuXHRcdFx0ZGVsZXRlIGl0ZW1bdGhpcy52YWxpZGF0ZWRTY2hlbWFzS2V5XTtcblx0XHR9XG5cdFx0dGhpcy5zY2FubmVkRnJvemVuID0gW107XG5cdFx0dGhpcy5zY2FubmVkRnJvemVuU2NoZW1hcyA9IFtdO1xuXHR9XG5cblx0aWYgKGVycm9yIHx8IGVycm9yQ291bnQgIT09IHRoaXMuZXJyb3JzLmxlbmd0aCkge1xuXHRcdHdoaWxlICgoZGF0YVBhdGhQYXJ0cyAmJiBkYXRhUGF0aFBhcnRzLmxlbmd0aCkgfHwgKHNjaGVtYVBhdGhQYXJ0cyAmJiBzY2hlbWFQYXRoUGFydHMubGVuZ3RoKSkge1xuXHRcdFx0dmFyIGRhdGFQYXJ0ID0gKGRhdGFQYXRoUGFydHMgJiYgZGF0YVBhdGhQYXJ0cy5sZW5ndGgpID8gXCJcIiArIGRhdGFQYXRoUGFydHMucG9wKCkgOiBudWxsO1xuXHRcdFx0dmFyIHNjaGVtYVBhcnQgPSAoc2NoZW1hUGF0aFBhcnRzICYmIHNjaGVtYVBhdGhQYXJ0cy5sZW5ndGgpID8gXCJcIiArIHNjaGVtYVBhdGhQYXJ0cy5wb3AoKSA6IG51bGw7XG5cdFx0XHRpZiAoZXJyb3IpIHtcblx0XHRcdFx0ZXJyb3IgPSBlcnJvci5wcmVmaXhXaXRoKGRhdGFQYXJ0LCBzY2hlbWFQYXJ0KTtcblx0XHRcdH1cblx0XHRcdHRoaXMucHJlZml4RXJyb3JzKGVycm9yQ291bnQsIGRhdGFQYXJ0LCBzY2hlbWFQYXJ0KTtcblx0XHR9XG5cdH1cblxuXHRpZiAoc2Nhbm5lZEZyb3plblNjaGVtYUluZGV4ICE9PSBudWxsKSB7XG5cdFx0dGhpcy5zY2FubmVkRnJvemVuVmFsaWRhdGlvbkVycm9yc1tmcm96ZW5JbmRleF1bc2Nhbm5lZEZyb3plblNjaGVtYUluZGV4XSA9IHRoaXMuZXJyb3JzLnNsaWNlKHN0YXJ0RXJyb3JDb3VudCk7XG5cdH0gZWxzZSBpZiAoc2Nhbm5lZFNjaGVtYXNJbmRleCAhPT0gbnVsbCkge1xuXHRcdGRhdGFbdGhpcy52YWxpZGF0aW9uRXJyb3JzS2V5XVtzY2FubmVkU2NoZW1hc0luZGV4XSA9IHRoaXMuZXJyb3JzLnNsaWNlKHN0YXJ0RXJyb3JDb3VudCk7XG5cdH1cblxuXHRyZXR1cm4gdGhpcy5oYW5kbGVFcnJvcihlcnJvcik7XG59O1xuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVGb3JtYXQgPSBmdW5jdGlvbiAoZGF0YSwgc2NoZW1hKSB7XG5cdGlmICh0eXBlb2Ygc2NoZW1hLmZvcm1hdCAhPT0gJ3N0cmluZycgfHwgIXRoaXMuZm9ybWF0VmFsaWRhdG9yc1tzY2hlbWEuZm9ybWF0XSkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdHZhciBlcnJvck1lc3NhZ2UgPSB0aGlzLmZvcm1hdFZhbGlkYXRvcnNbc2NoZW1hLmZvcm1hdF0uY2FsbChudWxsLCBkYXRhLCBzY2hlbWEpO1xuXHRpZiAodHlwZW9mIGVycm9yTWVzc2FnZSA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIGVycm9yTWVzc2FnZSA9PT0gJ251bWJlcicpIHtcblx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLkZPUk1BVF9DVVNUT00sIHttZXNzYWdlOiBlcnJvck1lc3NhZ2V9KS5wcmVmaXhXaXRoKG51bGwsIFwiZm9ybWF0XCIpO1xuXHR9IGVsc2UgaWYgKGVycm9yTWVzc2FnZSAmJiB0eXBlb2YgZXJyb3JNZXNzYWdlID09PSAnb2JqZWN0Jykge1xuXHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuRk9STUFUX0NVU1RPTSwge21lc3NhZ2U6IGVycm9yTWVzc2FnZS5tZXNzYWdlIHx8IFwiP1wifSwgZXJyb3JNZXNzYWdlLmRhdGFQYXRoIHx8IG51bGwsIGVycm9yTWVzc2FnZS5zY2hlbWFQYXRoIHx8IFwiL2Zvcm1hdFwiKTtcblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZURlZmluZWRLZXl3b3JkcyA9IGZ1bmN0aW9uIChkYXRhLCBzY2hlbWEpIHtcblx0Zm9yICh2YXIga2V5IGluIHRoaXMuZGVmaW5lZEtleXdvcmRzKSB7XG5cdFx0aWYgKHR5cGVvZiBzY2hlbWFba2V5XSA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdGNvbnRpbnVlO1xuXHRcdH1cblx0XHR2YXIgdmFsaWRhdGlvbkZ1bmN0aW9ucyA9IHRoaXMuZGVmaW5lZEtleXdvcmRzW2tleV07XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB2YWxpZGF0aW9uRnVuY3Rpb25zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgZnVuYyA9IHZhbGlkYXRpb25GdW5jdGlvbnNbaV07XG5cdFx0XHR2YXIgcmVzdWx0ID0gZnVuYyhkYXRhLCBzY2hlbWFba2V5XSwgc2NoZW1hKTtcblx0XHRcdGlmICh0eXBlb2YgcmVzdWx0ID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgcmVzdWx0ID09PSAnbnVtYmVyJykge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLktFWVdPUkRfQ1VTVE9NLCB7a2V5OiBrZXksIG1lc3NhZ2U6IHJlc3VsdH0pLnByZWZpeFdpdGgobnVsbCwgXCJmb3JtYXRcIik7XG5cdFx0XHR9IGVsc2UgaWYgKHJlc3VsdCAmJiB0eXBlb2YgcmVzdWx0ID09PSAnb2JqZWN0Jykge1xuXHRcdFx0XHR2YXIgY29kZSA9IHJlc3VsdC5jb2RlIHx8IEVycm9yQ29kZXMuS0VZV09SRF9DVVNUT007XG5cdFx0XHRcdGlmICh0eXBlb2YgY29kZSA9PT0gJ3N0cmluZycpIHtcblx0XHRcdFx0XHRpZiAoIUVycm9yQ29kZXNbY29kZV0pIHtcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcignVW5kZWZpbmVkIGVycm9yIGNvZGUgKHVzZSBkZWZpbmVFcnJvcik6ICcgKyBjb2RlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y29kZSA9IEVycm9yQ29kZXNbY29kZV07XG5cdFx0XHRcdH1cblx0XHRcdFx0dmFyIG1lc3NhZ2VQYXJhbXMgPSAodHlwZW9mIHJlc3VsdC5tZXNzYWdlID09PSAnb2JqZWN0JykgPyByZXN1bHQubWVzc2FnZSA6IHtrZXk6IGtleSwgbWVzc2FnZTogcmVzdWx0Lm1lc3NhZ2UgfHwgXCI/XCJ9O1xuXHRcdFx0XHR2YXIgc2NoZW1hUGF0aCA9IHJlc3VsdC5zY2hlbWFQYXRoIHx8KCBcIi9cIiArIGtleS5yZXBsYWNlKC9+L2csICd+MCcpLnJlcGxhY2UoL1xcLy9nLCAnfjEnKSk7XG5cdFx0XHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKGNvZGUsIG1lc3NhZ2VQYXJhbXMsIHJlc3VsdC5kYXRhUGF0aCB8fCBudWxsLCBzY2hlbWFQYXRoKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5mdW5jdGlvbiByZWN1cnNpdmVDb21wYXJlKEEsIEIpIHtcblx0aWYgKEEgPT09IEIpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHRpZiAodHlwZW9mIEEgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIEIgPT09IFwib2JqZWN0XCIpIHtcblx0XHRpZiAoQXJyYXkuaXNBcnJheShBKSAhPT0gQXJyYXkuaXNBcnJheShCKSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShBKSkge1xuXHRcdFx0aWYgKEEubGVuZ3RoICE9PSBCLmxlbmd0aCkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IEEubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKCFyZWN1cnNpdmVDb21wYXJlKEFbaV0sIEJbaV0pKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBrZXk7XG5cdFx0XHRmb3IgKGtleSBpbiBBKSB7XG5cdFx0XHRcdGlmIChCW2tleV0gPT09IHVuZGVmaW5lZCAmJiBBW2tleV0gIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Zm9yIChrZXkgaW4gQikge1xuXHRcdFx0XHRpZiAoQVtrZXldID09PSB1bmRlZmluZWQgJiYgQltrZXldICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGZvciAoa2V5IGluIEEpIHtcblx0XHRcdFx0aWYgKCFyZWN1cnNpdmVDb21wYXJlKEFba2V5XSwgQltrZXldKSkge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHRyZXR1cm4gZmFsc2U7XG59XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlQmFzaWMgPSBmdW5jdGlvbiB2YWxpZGF0ZUJhc2ljKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKSB7XG5cdHZhciBlcnJvcjtcblx0aWYgKGVycm9yID0gdGhpcy52YWxpZGF0ZVR5cGUoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpKSB7XG5cdFx0cmV0dXJuIGVycm9yLnByZWZpeFdpdGgobnVsbCwgXCJ0eXBlXCIpO1xuXHR9XG5cdGlmIChlcnJvciA9IHRoaXMudmFsaWRhdGVFbnVtKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKSkge1xuXHRcdHJldHVybiBlcnJvci5wcmVmaXhXaXRoKG51bGwsIFwidHlwZVwiKTtcblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlVHlwZSA9IGZ1bmN0aW9uIHZhbGlkYXRlVHlwZShkYXRhLCBzY2hlbWEpIHtcblx0aWYgKHNjaGVtYS50eXBlID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHR2YXIgZGF0YVR5cGUgPSB0eXBlb2YgZGF0YTtcblx0aWYgKGRhdGEgPT09IG51bGwpIHtcblx0XHRkYXRhVHlwZSA9IFwibnVsbFwiO1xuXHR9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoZGF0YSkpIHtcblx0XHRkYXRhVHlwZSA9IFwiYXJyYXlcIjtcblx0fVxuXHR2YXIgYWxsb3dlZFR5cGVzID0gc2NoZW1hLnR5cGU7XG5cdGlmICh0eXBlb2YgYWxsb3dlZFR5cGVzICE9PSBcIm9iamVjdFwiKSB7XG5cdFx0YWxsb3dlZFR5cGVzID0gW2FsbG93ZWRUeXBlc107XG5cdH1cblxuXHRmb3IgKHZhciBpID0gMDsgaSA8IGFsbG93ZWRUeXBlcy5sZW5ndGg7IGkrKykge1xuXHRcdHZhciB0eXBlID0gYWxsb3dlZFR5cGVzW2ldO1xuXHRcdGlmICh0eXBlID09PSBkYXRhVHlwZSB8fCAodHlwZSA9PT0gXCJpbnRlZ2VyXCIgJiYgZGF0YVR5cGUgPT09IFwibnVtYmVyXCIgJiYgKGRhdGEgJSAxID09PSAwKSkpIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLklOVkFMSURfVFlQRSwge3R5cGU6IGRhdGFUeXBlLCBleHBlY3RlZDogYWxsb3dlZFR5cGVzLmpvaW4oXCIvXCIpfSk7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZUVudW0gPSBmdW5jdGlvbiB2YWxpZGF0ZUVudW0oZGF0YSwgc2NoZW1hKSB7XG5cdGlmIChzY2hlbWFbXCJlbnVtXCJdID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHRmb3IgKHZhciBpID0gMDsgaSA8IHNjaGVtYVtcImVudW1cIl0ubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgZW51bVZhbCA9IHNjaGVtYVtcImVudW1cIl1baV07XG5cdFx0aWYgKHJlY3Vyc2l2ZUNvbXBhcmUoZGF0YSwgZW51bVZhbCkpIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLkVOVU1fTUlTTUFUQ0gsIHt2YWx1ZTogKHR5cGVvZiBKU09OICE9PSAndW5kZWZpbmVkJykgPyBKU09OLnN0cmluZ2lmeShkYXRhKSA6IGRhdGF9KTtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlTnVtZXJpYyA9IGZ1bmN0aW9uIHZhbGlkYXRlTnVtZXJpYyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aCkge1xuXHRyZXR1cm4gdGhpcy52YWxpZGF0ZU11bHRpcGxlT2YoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZU1pbk1heChkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCB0aGlzLnZhbGlkYXRlTmFOKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZU11bHRpcGxlT2YgPSBmdW5jdGlvbiB2YWxpZGF0ZU11bHRpcGxlT2YoZGF0YSwgc2NoZW1hKSB7XG5cdHZhciBtdWx0aXBsZU9mID0gc2NoZW1hLm11bHRpcGxlT2YgfHwgc2NoZW1hLmRpdmlzaWJsZUJ5O1xuXHRpZiAobXVsdGlwbGVPZiA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0aWYgKHR5cGVvZiBkYXRhID09PSBcIm51bWJlclwiKSB7XG5cdFx0aWYgKGRhdGEgJSBtdWx0aXBsZU9mICE9PSAwKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLk5VTUJFUl9NVUxUSVBMRV9PRiwge3ZhbHVlOiBkYXRhLCBtdWx0aXBsZU9mOiBtdWx0aXBsZU9mfSk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVNaW5NYXggPSBmdW5jdGlvbiB2YWxpZGF0ZU1pbk1heChkYXRhLCBzY2hlbWEpIHtcblx0aWYgKHR5cGVvZiBkYXRhICE9PSBcIm51bWJlclwiKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0aWYgKHNjaGVtYS5taW5pbXVtICE9PSB1bmRlZmluZWQpIHtcblx0XHRpZiAoZGF0YSA8IHNjaGVtYS5taW5pbXVtKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLk5VTUJFUl9NSU5JTVVNLCB7dmFsdWU6IGRhdGEsIG1pbmltdW06IHNjaGVtYS5taW5pbXVtfSkucHJlZml4V2l0aChudWxsLCBcIm1pbmltdW1cIik7XG5cdFx0fVxuXHRcdGlmIChzY2hlbWEuZXhjbHVzaXZlTWluaW11bSAmJiBkYXRhID09PSBzY2hlbWEubWluaW11bSkge1xuXHRcdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5OVU1CRVJfTUlOSU1VTV9FWENMVVNJVkUsIHt2YWx1ZTogZGF0YSwgbWluaW11bTogc2NoZW1hLm1pbmltdW19KS5wcmVmaXhXaXRoKG51bGwsIFwiZXhjbHVzaXZlTWluaW11bVwiKTtcblx0XHR9XG5cdH1cblx0aWYgKHNjaGVtYS5tYXhpbXVtICE9PSB1bmRlZmluZWQpIHtcblx0XHRpZiAoZGF0YSA+IHNjaGVtYS5tYXhpbXVtKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLk5VTUJFUl9NQVhJTVVNLCB7dmFsdWU6IGRhdGEsIG1heGltdW06IHNjaGVtYS5tYXhpbXVtfSkucHJlZml4V2l0aChudWxsLCBcIm1heGltdW1cIik7XG5cdFx0fVxuXHRcdGlmIChzY2hlbWEuZXhjbHVzaXZlTWF4aW11bSAmJiBkYXRhID09PSBzY2hlbWEubWF4aW11bSkge1xuXHRcdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5OVU1CRVJfTUFYSU1VTV9FWENMVVNJVkUsIHt2YWx1ZTogZGF0YSwgbWF4aW11bTogc2NoZW1hLm1heGltdW19KS5wcmVmaXhXaXRoKG51bGwsIFwiZXhjbHVzaXZlTWF4aW11bVwiKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZU5hTiA9IGZ1bmN0aW9uIHZhbGlkYXRlTmFOKGRhdGEpIHtcblx0aWYgKHR5cGVvZiBkYXRhICE9PSBcIm51bWJlclwiKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0aWYgKGlzTmFOKGRhdGEpID09PSB0cnVlIHx8IGRhdGEgPT09IEluZmluaXR5IHx8IGRhdGEgPT09IC1JbmZpbml0eSkge1xuXHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuTlVNQkVSX05PVF9BX05VTUJFUiwge3ZhbHVlOiBkYXRhfSkucHJlZml4V2l0aChudWxsLCBcInR5cGVcIik7XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZVN0cmluZyA9IGZ1bmN0aW9uIHZhbGlkYXRlU3RyaW5nKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKSB7XG5cdHJldHVybiB0aGlzLnZhbGlkYXRlU3RyaW5nTGVuZ3RoKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVTdHJpbmdQYXR0ZXJuKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZVN0cmluZ0xlbmd0aCA9IGZ1bmN0aW9uIHZhbGlkYXRlU3RyaW5nTGVuZ3RoKGRhdGEsIHNjaGVtYSkge1xuXHRpZiAodHlwZW9mIGRhdGEgIT09IFwic3RyaW5nXCIpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHRpZiAoc2NoZW1hLm1pbkxlbmd0aCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0aWYgKGRhdGEubGVuZ3RoIDwgc2NoZW1hLm1pbkxlbmd0aCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5TVFJJTkdfTEVOR1RIX1NIT1JULCB7bGVuZ3RoOiBkYXRhLmxlbmd0aCwgbWluaW11bTogc2NoZW1hLm1pbkxlbmd0aH0pLnByZWZpeFdpdGgobnVsbCwgXCJtaW5MZW5ndGhcIik7XG5cdFx0fVxuXHR9XG5cdGlmIChzY2hlbWEubWF4TGVuZ3RoICE9PSB1bmRlZmluZWQpIHtcblx0XHRpZiAoZGF0YS5sZW5ndGggPiBzY2hlbWEubWF4TGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLlNUUklOR19MRU5HVEhfTE9ORywge2xlbmd0aDogZGF0YS5sZW5ndGgsIG1heGltdW06IHNjaGVtYS5tYXhMZW5ndGh9KS5wcmVmaXhXaXRoKG51bGwsIFwibWF4TGVuZ3RoXCIpO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlU3RyaW5nUGF0dGVybiA9IGZ1bmN0aW9uIHZhbGlkYXRlU3RyaW5nUGF0dGVybihkYXRhLCBzY2hlbWEpIHtcblx0aWYgKHR5cGVvZiBkYXRhICE9PSBcInN0cmluZ1wiIHx8IHNjaGVtYS5wYXR0ZXJuID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHR2YXIgcmVnZXhwID0gbmV3IFJlZ0V4cChzY2hlbWEucGF0dGVybik7XG5cdGlmICghcmVnZXhwLnRlc3QoZGF0YSkpIHtcblx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLlNUUklOR19QQVRURVJOLCB7cGF0dGVybjogc2NoZW1hLnBhdHRlcm59KS5wcmVmaXhXaXRoKG51bGwsIFwicGF0dGVyblwiKTtcblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZUFycmF5ID0gZnVuY3Rpb24gdmFsaWRhdGVBcnJheShkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aCkge1xuXHRpZiAoIUFycmF5LmlzQXJyYXkoZGF0YSkpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHRyZXR1cm4gdGhpcy52YWxpZGF0ZUFycmF5TGVuZ3RoKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVBcnJheVVuaXF1ZUl0ZW1zKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVBcnJheUl0ZW1zKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZUFycmF5TGVuZ3RoID0gZnVuY3Rpb24gdmFsaWRhdGVBcnJheUxlbmd0aChkYXRhLCBzY2hlbWEpIHtcblx0dmFyIGVycm9yO1xuXHRpZiAoc2NoZW1hLm1pbkl0ZW1zICE9PSB1bmRlZmluZWQpIHtcblx0XHRpZiAoZGF0YS5sZW5ndGggPCBzY2hlbWEubWluSXRlbXMpIHtcblx0XHRcdGVycm9yID0gKHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5BUlJBWV9MRU5HVEhfU0hPUlQsIHtsZW5ndGg6IGRhdGEubGVuZ3RoLCBtaW5pbXVtOiBzY2hlbWEubWluSXRlbXN9KSkucHJlZml4V2l0aChudWxsLCBcIm1pbkl0ZW1zXCIpO1xuXHRcdFx0aWYgKHRoaXMuaGFuZGxlRXJyb3IoZXJyb3IpKSB7XG5cdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0aWYgKHNjaGVtYS5tYXhJdGVtcyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0aWYgKGRhdGEubGVuZ3RoID4gc2NoZW1hLm1heEl0ZW1zKSB7XG5cdFx0XHRlcnJvciA9ICh0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuQVJSQVlfTEVOR1RIX0xPTkcsIHtsZW5ndGg6IGRhdGEubGVuZ3RoLCBtYXhpbXVtOiBzY2hlbWEubWF4SXRlbXN9KSkucHJlZml4V2l0aChudWxsLCBcIm1heEl0ZW1zXCIpO1xuXHRcdFx0aWYgKHRoaXMuaGFuZGxlRXJyb3IoZXJyb3IpKSB7XG5cdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZUFycmF5VW5pcXVlSXRlbXMgPSBmdW5jdGlvbiB2YWxpZGF0ZUFycmF5VW5pcXVlSXRlbXMoZGF0YSwgc2NoZW1hKSB7XG5cdGlmIChzY2hlbWEudW5pcXVlSXRlbXMpIHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcblx0XHRcdGZvciAodmFyIGogPSBpICsgMTsgaiA8IGRhdGEubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0aWYgKHJlY3Vyc2l2ZUNvbXBhcmUoZGF0YVtpXSwgZGF0YVtqXSkpIHtcblx0XHRcdFx0XHR2YXIgZXJyb3IgPSAodGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLkFSUkFZX1VOSVFVRSwge21hdGNoMTogaSwgbWF0Y2gyOiBqfSkpLnByZWZpeFdpdGgobnVsbCwgXCJ1bmlxdWVJdGVtc1wiKTtcblx0XHRcdFx0XHRpZiAodGhpcy5oYW5kbGVFcnJvcihlcnJvcikpIHtcblx0XHRcdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZUFycmF5SXRlbXMgPSBmdW5jdGlvbiB2YWxpZGF0ZUFycmF5SXRlbXMoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpIHtcblx0aWYgKHNjaGVtYS5pdGVtcyA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0dmFyIGVycm9yLCBpO1xuXHRpZiAoQXJyYXkuaXNBcnJheShzY2hlbWEuaXRlbXMpKSB7XG5cdFx0Zm9yIChpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmIChpIDwgc2NoZW1hLml0ZW1zLmxlbmd0aCkge1xuXHRcdFx0XHRpZiAoZXJyb3IgPSB0aGlzLnZhbGlkYXRlQWxsKGRhdGFbaV0sIHNjaGVtYS5pdGVtc1tpXSwgW2ldLCBbXCJpdGVtc1wiLCBpXSwgZGF0YVBvaW50ZXJQYXRoICsgXCIvXCIgKyBpKSkge1xuXHRcdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChzY2hlbWEuYWRkaXRpb25hbEl0ZW1zICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBzY2hlbWEuYWRkaXRpb25hbEl0ZW1zID09PSBcImJvb2xlYW5cIikge1xuXHRcdFx0XHRcdGlmICghc2NoZW1hLmFkZGl0aW9uYWxJdGVtcykge1xuXHRcdFx0XHRcdFx0ZXJyb3IgPSAodGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLkFSUkFZX0FERElUSU9OQUxfSVRFTVMsIHt9KSkucHJlZml4V2l0aChcIlwiICsgaSwgXCJhZGRpdGlvbmFsSXRlbXNcIik7XG5cdFx0XHRcdFx0XHRpZiAodGhpcy5oYW5kbGVFcnJvcihlcnJvcikpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIGlmIChlcnJvciA9IHRoaXMudmFsaWRhdGVBbGwoZGF0YVtpXSwgc2NoZW1hLmFkZGl0aW9uYWxJdGVtcywgW2ldLCBbXCJhZGRpdGlvbmFsSXRlbXNcIl0sIGRhdGFQb2ludGVyUGF0aCArIFwiL1wiICsgaSkpIHtcblx0XHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0Zm9yIChpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmIChlcnJvciA9IHRoaXMudmFsaWRhdGVBbGwoZGF0YVtpXSwgc2NoZW1hLml0ZW1zLCBbaV0sIFtcIml0ZW1zXCJdLCBkYXRhUG9pbnRlclBhdGggKyBcIi9cIiArIGkpKSB7XG5cdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZU9iamVjdCA9IGZ1bmN0aW9uIHZhbGlkYXRlT2JqZWN0KGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKSB7XG5cdGlmICh0eXBlb2YgZGF0YSAhPT0gXCJvYmplY3RcIiB8fCBkYXRhID09PSBudWxsIHx8IEFycmF5LmlzQXJyYXkoZGF0YSkpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHRyZXR1cm4gdGhpcy52YWxpZGF0ZU9iamVjdE1pbk1heFByb3BlcnRpZXMoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZU9iamVjdFJlcXVpcmVkUHJvcGVydGllcyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCB0aGlzLnZhbGlkYXRlT2JqZWN0UHJvcGVydGllcyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCB0aGlzLnZhbGlkYXRlT2JqZWN0RGVwZW5kZW5jaWVzKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZU9iamVjdE1pbk1heFByb3BlcnRpZXMgPSBmdW5jdGlvbiB2YWxpZGF0ZU9iamVjdE1pbk1heFByb3BlcnRpZXMoZGF0YSwgc2NoZW1hKSB7XG5cdHZhciBrZXlzID0gT2JqZWN0LmtleXMoZGF0YSk7XG5cdHZhciBlcnJvcjtcblx0aWYgKHNjaGVtYS5taW5Qcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQpIHtcblx0XHRpZiAoa2V5cy5sZW5ndGggPCBzY2hlbWEubWluUHJvcGVydGllcykge1xuXHRcdFx0ZXJyb3IgPSB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuT0JKRUNUX1BST1BFUlRJRVNfTUlOSU1VTSwge3Byb3BlcnR5Q291bnQ6IGtleXMubGVuZ3RoLCBtaW5pbXVtOiBzY2hlbWEubWluUHJvcGVydGllc30pLnByZWZpeFdpdGgobnVsbCwgXCJtaW5Qcm9wZXJ0aWVzXCIpO1xuXHRcdFx0aWYgKHRoaXMuaGFuZGxlRXJyb3IoZXJyb3IpKSB7XG5cdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0aWYgKHNjaGVtYS5tYXhQcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQpIHtcblx0XHRpZiAoa2V5cy5sZW5ndGggPiBzY2hlbWEubWF4UHJvcGVydGllcykge1xuXHRcdFx0ZXJyb3IgPSB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuT0JKRUNUX1BST1BFUlRJRVNfTUFYSU1VTSwge3Byb3BlcnR5Q291bnQ6IGtleXMubGVuZ3RoLCBtYXhpbXVtOiBzY2hlbWEubWF4UHJvcGVydGllc30pLnByZWZpeFdpdGgobnVsbCwgXCJtYXhQcm9wZXJ0aWVzXCIpO1xuXHRcdFx0aWYgKHRoaXMuaGFuZGxlRXJyb3IoZXJyb3IpKSB7XG5cdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZU9iamVjdFJlcXVpcmVkUHJvcGVydGllcyA9IGZ1bmN0aW9uIHZhbGlkYXRlT2JqZWN0UmVxdWlyZWRQcm9wZXJ0aWVzKGRhdGEsIHNjaGVtYSkge1xuXHRpZiAoc2NoZW1hLnJlcXVpcmVkICE9PSB1bmRlZmluZWQpIHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNjaGVtYS5yZXF1aXJlZC5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGtleSA9IHNjaGVtYS5yZXF1aXJlZFtpXTtcblx0XHRcdGlmIChkYXRhW2tleV0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHR2YXIgZXJyb3IgPSB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuT0JKRUNUX1JFUVVJUkVELCB7a2V5OiBrZXl9KS5wcmVmaXhXaXRoKG51bGwsIFwiXCIgKyBpKS5wcmVmaXhXaXRoKG51bGwsIFwicmVxdWlyZWRcIik7XG5cdFx0XHRcdGlmICh0aGlzLmhhbmRsZUVycm9yKGVycm9yKSkge1xuXHRcdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlT2JqZWN0UHJvcGVydGllcyA9IGZ1bmN0aW9uIHZhbGlkYXRlT2JqZWN0UHJvcGVydGllcyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aCkge1xuXHR2YXIgZXJyb3I7XG5cdGZvciAodmFyIGtleSBpbiBkYXRhKSB7XG5cdFx0dmFyIGtleVBvaW50ZXJQYXRoID0gZGF0YVBvaW50ZXJQYXRoICsgXCIvXCIgKyBrZXkucmVwbGFjZSgvfi9nLCAnfjAnKS5yZXBsYWNlKC9cXC8vZywgJ34xJyk7XG5cdFx0dmFyIGZvdW5kTWF0Y2ggPSBmYWxzZTtcblx0XHRpZiAoc2NoZW1hLnByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCAmJiBzY2hlbWEucHJvcGVydGllc1trZXldICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdGZvdW5kTWF0Y2ggPSB0cnVlO1xuXHRcdFx0aWYgKGVycm9yID0gdGhpcy52YWxpZGF0ZUFsbChkYXRhW2tleV0sIHNjaGVtYS5wcm9wZXJ0aWVzW2tleV0sIFtrZXldLCBbXCJwcm9wZXJ0aWVzXCIsIGtleV0sIGtleVBvaW50ZXJQYXRoKSkge1xuXHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChzY2hlbWEucGF0dGVyblByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Zm9yICh2YXIgcGF0dGVybktleSBpbiBzY2hlbWEucGF0dGVyblByb3BlcnRpZXMpIHtcblx0XHRcdFx0dmFyIHJlZ2V4cCA9IG5ldyBSZWdFeHAocGF0dGVybktleSk7XG5cdFx0XHRcdGlmIChyZWdleHAudGVzdChrZXkpKSB7XG5cdFx0XHRcdFx0Zm91bmRNYXRjaCA9IHRydWU7XG5cdFx0XHRcdFx0aWYgKGVycm9yID0gdGhpcy52YWxpZGF0ZUFsbChkYXRhW2tleV0sIHNjaGVtYS5wYXR0ZXJuUHJvcGVydGllc1twYXR0ZXJuS2V5XSwgW2tleV0sIFtcInBhdHRlcm5Qcm9wZXJ0aWVzXCIsIHBhdHRlcm5LZXldLCBrZXlQb2ludGVyUGF0aCkpIHtcblx0XHRcdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKCFmb3VuZE1hdGNoKSB7XG5cdFx0XHRpZiAoc2NoZW1hLmFkZGl0aW9uYWxQcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0aWYgKHRoaXMudHJhY2tVbmtub3duUHJvcGVydGllcykge1xuXHRcdFx0XHRcdHRoaXMua25vd25Qcm9wZXJ0eVBhdGhzW2tleVBvaW50ZXJQYXRoXSA9IHRydWU7XG5cdFx0XHRcdFx0ZGVsZXRlIHRoaXMudW5rbm93blByb3BlcnR5UGF0aHNba2V5UG9pbnRlclBhdGhdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICh0eXBlb2Ygc2NoZW1hLmFkZGl0aW9uYWxQcm9wZXJ0aWVzID09PSBcImJvb2xlYW5cIikge1xuXHRcdFx0XHRcdGlmICghc2NoZW1hLmFkZGl0aW9uYWxQcm9wZXJ0aWVzKSB7XG5cdFx0XHRcdFx0XHRlcnJvciA9IHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5PQkpFQ1RfQURESVRJT05BTF9QUk9QRVJUSUVTLCB7fSkucHJlZml4V2l0aChrZXksIFwiYWRkaXRpb25hbFByb3BlcnRpZXNcIik7XG5cdFx0XHRcdFx0XHRpZiAodGhpcy5oYW5kbGVFcnJvcihlcnJvcikpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRpZiAoZXJyb3IgPSB0aGlzLnZhbGlkYXRlQWxsKGRhdGFba2V5XSwgc2NoZW1hLmFkZGl0aW9uYWxQcm9wZXJ0aWVzLCBba2V5XSwgW1wiYWRkaXRpb25hbFByb3BlcnRpZXNcIl0sIGtleVBvaW50ZXJQYXRoKSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmICh0aGlzLnRyYWNrVW5rbm93blByb3BlcnRpZXMgJiYgIXRoaXMua25vd25Qcm9wZXJ0eVBhdGhzW2tleVBvaW50ZXJQYXRoXSkge1xuXHRcdFx0XHR0aGlzLnVua25vd25Qcm9wZXJ0eVBhdGhzW2tleVBvaW50ZXJQYXRoXSA9IHRydWU7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICh0aGlzLnRyYWNrVW5rbm93blByb3BlcnRpZXMpIHtcblx0XHRcdHRoaXMua25vd25Qcm9wZXJ0eVBhdGhzW2tleVBvaW50ZXJQYXRoXSA9IHRydWU7XG5cdFx0XHRkZWxldGUgdGhpcy51bmtub3duUHJvcGVydHlQYXRoc1trZXlQb2ludGVyUGF0aF07XG5cdFx0fVxuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVPYmplY3REZXBlbmRlbmNpZXMgPSBmdW5jdGlvbiB2YWxpZGF0ZU9iamVjdERlcGVuZGVuY2llcyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aCkge1xuXHR2YXIgZXJyb3I7XG5cdGlmIChzY2hlbWEuZGVwZW5kZW5jaWVzICE9PSB1bmRlZmluZWQpIHtcblx0XHRmb3IgKHZhciBkZXBLZXkgaW4gc2NoZW1hLmRlcGVuZGVuY2llcykge1xuXHRcdFx0aWYgKGRhdGFbZGVwS2V5XSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHZhciBkZXAgPSBzY2hlbWEuZGVwZW5kZW5jaWVzW2RlcEtleV07XG5cdFx0XHRcdGlmICh0eXBlb2YgZGVwID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdFx0aWYgKGRhdGFbZGVwXSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHRlcnJvciA9IHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5PQkpFQ1RfREVQRU5ERU5DWV9LRVksIHtrZXk6IGRlcEtleSwgbWlzc2luZzogZGVwfSkucHJlZml4V2l0aChudWxsLCBkZXBLZXkpLnByZWZpeFdpdGgobnVsbCwgXCJkZXBlbmRlbmNpZXNcIik7XG5cdFx0XHRcdFx0XHRpZiAodGhpcy5oYW5kbGVFcnJvcihlcnJvcikpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGRlcCkpIHtcblx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGRlcC5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0dmFyIHJlcXVpcmVkS2V5ID0gZGVwW2ldO1xuXHRcdFx0XHRcdFx0aWYgKGRhdGFbcmVxdWlyZWRLZXldID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdFx0ZXJyb3IgPSB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuT0JKRUNUX0RFUEVOREVOQ1lfS0VZLCB7a2V5OiBkZXBLZXksIG1pc3Npbmc6IHJlcXVpcmVkS2V5fSkucHJlZml4V2l0aChudWxsLCBcIlwiICsgaSkucHJlZml4V2l0aChudWxsLCBkZXBLZXkpLnByZWZpeFdpdGgobnVsbCwgXCJkZXBlbmRlbmNpZXNcIik7XG5cdFx0XHRcdFx0XHRcdGlmICh0aGlzLmhhbmRsZUVycm9yKGVycm9yKSkge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRpZiAoZXJyb3IgPSB0aGlzLnZhbGlkYXRlQWxsKGRhdGEsIGRlcCwgW10sIFtcImRlcGVuZGVuY2llc1wiLCBkZXBLZXldLCBkYXRhUG9pbnRlclBhdGgpKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVDb21iaW5hdGlvbnMgPSBmdW5jdGlvbiB2YWxpZGF0ZUNvbWJpbmF0aW9ucyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aCkge1xuXHRyZXR1cm4gdGhpcy52YWxpZGF0ZUFsbE9mKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVBbnlPZihkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCB0aGlzLnZhbGlkYXRlT25lT2YoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZU5vdChkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVBbGxPZiA9IGZ1bmN0aW9uIHZhbGlkYXRlQWxsT2YoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpIHtcblx0aWYgKHNjaGVtYS5hbGxPZiA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0dmFyIGVycm9yO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHNjaGVtYS5hbGxPZi5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBzdWJTY2hlbWEgPSBzY2hlbWEuYWxsT2ZbaV07XG5cdFx0aWYgKGVycm9yID0gdGhpcy52YWxpZGF0ZUFsbChkYXRhLCBzdWJTY2hlbWEsIFtdLCBbXCJhbGxPZlwiLCBpXSwgZGF0YVBvaW50ZXJQYXRoKSkge1xuXHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlQW55T2YgPSBmdW5jdGlvbiB2YWxpZGF0ZUFueU9mKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKSB7XG5cdGlmIChzY2hlbWEuYW55T2YgPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdHZhciBlcnJvcnMgPSBbXTtcblx0dmFyIHN0YXJ0RXJyb3JDb3VudCA9IHRoaXMuZXJyb3JzLmxlbmd0aDtcblx0dmFyIG9sZFVua25vd25Qcm9wZXJ0eVBhdGhzLCBvbGRLbm93blByb3BlcnR5UGF0aHM7XG5cdGlmICh0aGlzLnRyYWNrVW5rbm93blByb3BlcnRpZXMpIHtcblx0XHRvbGRVbmtub3duUHJvcGVydHlQYXRocyA9IHRoaXMudW5rbm93blByb3BlcnR5UGF0aHM7XG5cdFx0b2xkS25vd25Qcm9wZXJ0eVBhdGhzID0gdGhpcy5rbm93blByb3BlcnR5UGF0aHM7XG5cdH1cblx0dmFyIGVycm9yQXRFbmQgPSB0cnVlO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHNjaGVtYS5hbnlPZi5sZW5ndGg7IGkrKykge1xuXHRcdGlmICh0aGlzLnRyYWNrVW5rbm93blByb3BlcnRpZXMpIHtcblx0XHRcdHRoaXMudW5rbm93blByb3BlcnR5UGF0aHMgPSB7fTtcblx0XHRcdHRoaXMua25vd25Qcm9wZXJ0eVBhdGhzID0ge307XG5cdFx0fVxuXHRcdHZhciBzdWJTY2hlbWEgPSBzY2hlbWEuYW55T2ZbaV07XG5cblx0XHR2YXIgZXJyb3JDb3VudCA9IHRoaXMuZXJyb3JzLmxlbmd0aDtcblx0XHR2YXIgZXJyb3IgPSB0aGlzLnZhbGlkYXRlQWxsKGRhdGEsIHN1YlNjaGVtYSwgW10sIFtcImFueU9mXCIsIGldLCBkYXRhUG9pbnRlclBhdGgpO1xuXG5cdFx0aWYgKGVycm9yID09PSBudWxsICYmIGVycm9yQ291bnQgPT09IHRoaXMuZXJyb3JzLmxlbmd0aCkge1xuXHRcdFx0dGhpcy5lcnJvcnMgPSB0aGlzLmVycm9ycy5zbGljZSgwLCBzdGFydEVycm9yQ291bnQpO1xuXG5cdFx0XHRpZiAodGhpcy50cmFja1Vua25vd25Qcm9wZXJ0aWVzKSB7XG5cdFx0XHRcdGZvciAodmFyIGtub3duS2V5IGluIHRoaXMua25vd25Qcm9wZXJ0eVBhdGhzKSB7XG5cdFx0XHRcdFx0b2xkS25vd25Qcm9wZXJ0eVBhdGhzW2tub3duS2V5XSA9IHRydWU7XG5cdFx0XHRcdFx0ZGVsZXRlIG9sZFVua25vd25Qcm9wZXJ0eVBhdGhzW2tub3duS2V5XTtcblx0XHRcdFx0fVxuXHRcdFx0XHRmb3IgKHZhciB1bmtub3duS2V5IGluIHRoaXMudW5rbm93blByb3BlcnR5UGF0aHMpIHtcblx0XHRcdFx0XHRpZiAoIW9sZEtub3duUHJvcGVydHlQYXRoc1t1bmtub3duS2V5XSkge1xuXHRcdFx0XHRcdFx0b2xkVW5rbm93blByb3BlcnR5UGF0aHNbdW5rbm93bktleV0gPSB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBXZSBuZWVkIHRvIGNvbnRpbnVlIGxvb3Bpbmcgc28gd2UgY2F0Y2ggYWxsIHRoZSBwcm9wZXJ0eSBkZWZpbml0aW9ucywgYnV0IHdlIGRvbid0IHdhbnQgdG8gcmV0dXJuIGFuIGVycm9yXG5cdFx0XHRcdGVycm9yQXRFbmQgPSBmYWxzZTtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblx0XHRpZiAoZXJyb3IpIHtcblx0XHRcdGVycm9ycy5wdXNoKGVycm9yLnByZWZpeFdpdGgobnVsbCwgXCJcIiArIGkpLnByZWZpeFdpdGgobnVsbCwgXCJhbnlPZlwiKSk7XG5cdFx0fVxuXHR9XG5cdGlmICh0aGlzLnRyYWNrVW5rbm93blByb3BlcnRpZXMpIHtcblx0XHR0aGlzLnVua25vd25Qcm9wZXJ0eVBhdGhzID0gb2xkVW5rbm93blByb3BlcnR5UGF0aHM7XG5cdFx0dGhpcy5rbm93blByb3BlcnR5UGF0aHMgPSBvbGRLbm93blByb3BlcnR5UGF0aHM7XG5cdH1cblx0aWYgKGVycm9yQXRFbmQpIHtcblx0XHRlcnJvcnMgPSBlcnJvcnMuY29uY2F0KHRoaXMuZXJyb3JzLnNsaWNlKHN0YXJ0RXJyb3JDb3VudCkpO1xuXHRcdHRoaXMuZXJyb3JzID0gdGhpcy5lcnJvcnMuc2xpY2UoMCwgc3RhcnRFcnJvckNvdW50KTtcblx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLkFOWV9PRl9NSVNTSU5HLCB7fSwgXCJcIiwgXCIvYW55T2ZcIiwgZXJyb3JzKTtcblx0fVxufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVPbmVPZiA9IGZ1bmN0aW9uIHZhbGlkYXRlT25lT2YoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpIHtcblx0aWYgKHNjaGVtYS5vbmVPZiA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0dmFyIHZhbGlkSW5kZXggPSBudWxsO1xuXHR2YXIgZXJyb3JzID0gW107XG5cdHZhciBzdGFydEVycm9yQ291bnQgPSB0aGlzLmVycm9ycy5sZW5ndGg7XG5cdHZhciBvbGRVbmtub3duUHJvcGVydHlQYXRocywgb2xkS25vd25Qcm9wZXJ0eVBhdGhzO1xuXHRpZiAodGhpcy50cmFja1Vua25vd25Qcm9wZXJ0aWVzKSB7XG5cdFx0b2xkVW5rbm93blByb3BlcnR5UGF0aHMgPSB0aGlzLnVua25vd25Qcm9wZXJ0eVBhdGhzO1xuXHRcdG9sZEtub3duUHJvcGVydHlQYXRocyA9IHRoaXMua25vd25Qcm9wZXJ0eVBhdGhzO1xuXHR9XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgc2NoZW1hLm9uZU9mLmxlbmd0aDsgaSsrKSB7XG5cdFx0aWYgKHRoaXMudHJhY2tVbmtub3duUHJvcGVydGllcykge1xuXHRcdFx0dGhpcy51bmtub3duUHJvcGVydHlQYXRocyA9IHt9O1xuXHRcdFx0dGhpcy5rbm93blByb3BlcnR5UGF0aHMgPSB7fTtcblx0XHR9XG5cdFx0dmFyIHN1YlNjaGVtYSA9IHNjaGVtYS5vbmVPZltpXTtcblxuXHRcdHZhciBlcnJvckNvdW50ID0gdGhpcy5lcnJvcnMubGVuZ3RoO1xuXHRcdHZhciBlcnJvciA9IHRoaXMudmFsaWRhdGVBbGwoZGF0YSwgc3ViU2NoZW1hLCBbXSwgW1wib25lT2ZcIiwgaV0sIGRhdGFQb2ludGVyUGF0aCk7XG5cblx0XHRpZiAoZXJyb3IgPT09IG51bGwgJiYgZXJyb3JDb3VudCA9PT0gdGhpcy5lcnJvcnMubGVuZ3RoKSB7XG5cdFx0XHRpZiAodmFsaWRJbmRleCA9PT0gbnVsbCkge1xuXHRcdFx0XHR2YWxpZEluZGV4ID0gaTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuZXJyb3JzID0gdGhpcy5lcnJvcnMuc2xpY2UoMCwgc3RhcnRFcnJvckNvdW50KTtcblx0XHRcdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5PTkVfT0ZfTVVMVElQTEUsIHtpbmRleDE6IHZhbGlkSW5kZXgsIGluZGV4MjogaX0sIFwiXCIsIFwiL29uZU9mXCIpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHRoaXMudHJhY2tVbmtub3duUHJvcGVydGllcykge1xuXHRcdFx0XHRmb3IgKHZhciBrbm93bktleSBpbiB0aGlzLmtub3duUHJvcGVydHlQYXRocykge1xuXHRcdFx0XHRcdG9sZEtub3duUHJvcGVydHlQYXRoc1trbm93bktleV0gPSB0cnVlO1xuXHRcdFx0XHRcdGRlbGV0ZSBvbGRVbmtub3duUHJvcGVydHlQYXRoc1trbm93bktleV07XG5cdFx0XHRcdH1cblx0XHRcdFx0Zm9yICh2YXIgdW5rbm93bktleSBpbiB0aGlzLnVua25vd25Qcm9wZXJ0eVBhdGhzKSB7XG5cdFx0XHRcdFx0aWYgKCFvbGRLbm93blByb3BlcnR5UGF0aHNbdW5rbm93bktleV0pIHtcblx0XHRcdFx0XHRcdG9sZFVua25vd25Qcm9wZXJ0eVBhdGhzW3Vua25vd25LZXldID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKGVycm9yKSB7XG5cdFx0XHRlcnJvcnMucHVzaChlcnJvcik7XG5cdFx0fVxuXHR9XG5cdGlmICh0aGlzLnRyYWNrVW5rbm93blByb3BlcnRpZXMpIHtcblx0XHR0aGlzLnVua25vd25Qcm9wZXJ0eVBhdGhzID0gb2xkVW5rbm93blByb3BlcnR5UGF0aHM7XG5cdFx0dGhpcy5rbm93blByb3BlcnR5UGF0aHMgPSBvbGRLbm93blByb3BlcnR5UGF0aHM7XG5cdH1cblx0aWYgKHZhbGlkSW5kZXggPT09IG51bGwpIHtcblx0XHRlcnJvcnMgPSBlcnJvcnMuY29uY2F0KHRoaXMuZXJyb3JzLnNsaWNlKHN0YXJ0RXJyb3JDb3VudCkpO1xuXHRcdHRoaXMuZXJyb3JzID0gdGhpcy5lcnJvcnMuc2xpY2UoMCwgc3RhcnRFcnJvckNvdW50KTtcblx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLk9ORV9PRl9NSVNTSU5HLCB7fSwgXCJcIiwgXCIvb25lT2ZcIiwgZXJyb3JzKTtcblx0fSBlbHNlIHtcblx0XHR0aGlzLmVycm9ycyA9IHRoaXMuZXJyb3JzLnNsaWNlKDAsIHN0YXJ0RXJyb3JDb3VudCk7XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZU5vdCA9IGZ1bmN0aW9uIHZhbGlkYXRlTm90KGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKSB7XG5cdGlmIChzY2hlbWEubm90ID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHR2YXIgb2xkRXJyb3JDb3VudCA9IHRoaXMuZXJyb3JzLmxlbmd0aDtcblx0dmFyIG9sZFVua25vd25Qcm9wZXJ0eVBhdGhzLCBvbGRLbm93blByb3BlcnR5UGF0aHM7XG5cdGlmICh0aGlzLnRyYWNrVW5rbm93blByb3BlcnRpZXMpIHtcblx0XHRvbGRVbmtub3duUHJvcGVydHlQYXRocyA9IHRoaXMudW5rbm93blByb3BlcnR5UGF0aHM7XG5cdFx0b2xkS25vd25Qcm9wZXJ0eVBhdGhzID0gdGhpcy5rbm93blByb3BlcnR5UGF0aHM7XG5cdFx0dGhpcy51bmtub3duUHJvcGVydHlQYXRocyA9IHt9O1xuXHRcdHRoaXMua25vd25Qcm9wZXJ0eVBhdGhzID0ge307XG5cdH1cblx0dmFyIGVycm9yID0gdGhpcy52YWxpZGF0ZUFsbChkYXRhLCBzY2hlbWEubm90LCBudWxsLCBudWxsLCBkYXRhUG9pbnRlclBhdGgpO1xuXHR2YXIgbm90RXJyb3JzID0gdGhpcy5lcnJvcnMuc2xpY2Uob2xkRXJyb3JDb3VudCk7XG5cdHRoaXMuZXJyb3JzID0gdGhpcy5lcnJvcnMuc2xpY2UoMCwgb2xkRXJyb3JDb3VudCk7XG5cdGlmICh0aGlzLnRyYWNrVW5rbm93blByb3BlcnRpZXMpIHtcblx0XHR0aGlzLnVua25vd25Qcm9wZXJ0eVBhdGhzID0gb2xkVW5rbm93blByb3BlcnR5UGF0aHM7XG5cdFx0dGhpcy5rbm93blByb3BlcnR5UGF0aHMgPSBvbGRLbm93blByb3BlcnR5UGF0aHM7XG5cdH1cblx0aWYgKGVycm9yID09PSBudWxsICYmIG5vdEVycm9ycy5sZW5ndGggPT09IDApIHtcblx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLk5PVF9QQVNTRUQsIHt9LCBcIlwiLCBcIi9ub3RcIik7XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZUh5cGVybWVkaWEgPSBmdW5jdGlvbiB2YWxpZGF0ZUNvbWJpbmF0aW9ucyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aCkge1xuXHRpZiAoIXNjaGVtYS5saW5rcykge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdHZhciBlcnJvcjtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzY2hlbWEubGlua3MubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgbGRvID0gc2NoZW1hLmxpbmtzW2ldO1xuXHRcdGlmIChsZG8ucmVsID09PSBcImRlc2NyaWJlZGJ5XCIpIHtcblx0XHRcdHZhciB0ZW1wbGF0ZSA9IG5ldyBVcmlUZW1wbGF0ZShsZG8uaHJlZik7XG5cdFx0XHR2YXIgYWxsUHJlc2VudCA9IHRydWU7XG5cdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IHRlbXBsYXRlLnZhck5hbWVzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdGlmICghKHRlbXBsYXRlLnZhck5hbWVzW2pdIGluIGRhdGEpKSB7XG5cdFx0XHRcdFx0YWxsUHJlc2VudCA9IGZhbHNlO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAoYWxsUHJlc2VudCkge1xuXHRcdFx0XHR2YXIgc2NoZW1hVXJsID0gdGVtcGxhdGUuZmlsbEZyb21PYmplY3QoZGF0YSk7XG5cdFx0XHRcdHZhciBzdWJTY2hlbWEgPSB7XCIkcmVmXCI6IHNjaGVtYVVybH07XG5cdFx0XHRcdGlmIChlcnJvciA9IHRoaXMudmFsaWRhdGVBbGwoZGF0YSwgc3ViU2NoZW1hLCBbXSwgW1wibGlua3NcIiwgaV0sIGRhdGFQb2ludGVyUGF0aCkpIHtcblx0XHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cbn07XG5cbi8vIHBhcnNlVVJJKCkgYW5kIHJlc29sdmVVcmwoKSBhcmUgZnJvbSBodHRwczovL2dpc3QuZ2l0aHViLmNvbS8xMDg4ODUwXG4vLyAgIC0gIHJlbGVhc2VkIGFzIHB1YmxpYyBkb21haW4gYnkgYXV0aG9yIChcIllhZmZsZVwiKSAtIHNlZSBjb21tZW50cyBvbiBnaXN0XG5cbmZ1bmN0aW9uIHBhcnNlVVJJKHVybCkge1xuXHR2YXIgbSA9IFN0cmluZyh1cmwpLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKS5tYXRjaCgvXihbXjpcXC8/I10rOik/KFxcL1xcLyg/OlteOkBdKig/OjpbXjpAXSopP0ApPygoW146XFwvPyNdKikoPzo6KFxcZCopKT8pKT8oW14/I10qKShcXD9bXiNdKik/KCNbXFxzXFxTXSopPy8pO1xuXHQvLyBhdXRob3JpdHkgPSAnLy8nICsgdXNlciArICc6JyArIHBhc3MgJ0AnICsgaG9zdG5hbWUgKyAnOicgcG9ydFxuXHRyZXR1cm4gKG0gPyB7XG5cdFx0aHJlZiAgICAgOiBtWzBdIHx8ICcnLFxuXHRcdHByb3RvY29sIDogbVsxXSB8fCAnJyxcblx0XHRhdXRob3JpdHk6IG1bMl0gfHwgJycsXG5cdFx0aG9zdCAgICAgOiBtWzNdIHx8ICcnLFxuXHRcdGhvc3RuYW1lIDogbVs0XSB8fCAnJyxcblx0XHRwb3J0ICAgICA6IG1bNV0gfHwgJycsXG5cdFx0cGF0aG5hbWUgOiBtWzZdIHx8ICcnLFxuXHRcdHNlYXJjaCAgIDogbVs3XSB8fCAnJyxcblx0XHRoYXNoICAgICA6IG1bOF0gfHwgJydcblx0fSA6IG51bGwpO1xufVxuXG5mdW5jdGlvbiByZXNvbHZlVXJsKGJhc2UsIGhyZWYpIHsvLyBSRkMgMzk4NlxuXG5cdGZ1bmN0aW9uIHJlbW92ZURvdFNlZ21lbnRzKGlucHV0KSB7XG5cdFx0dmFyIG91dHB1dCA9IFtdO1xuXHRcdGlucHV0LnJlcGxhY2UoL14oXFwuXFwuPyhcXC98JCkpKy8sICcnKVxuXHRcdFx0LnJlcGxhY2UoL1xcLyhcXC4oXFwvfCQpKSsvZywgJy8nKVxuXHRcdFx0LnJlcGxhY2UoL1xcL1xcLlxcLiQvLCAnLy4uLycpXG5cdFx0XHQucmVwbGFjZSgvXFwvP1teXFwvXSovZywgZnVuY3Rpb24gKHApIHtcblx0XHRcdFx0aWYgKHAgPT09ICcvLi4nKSB7XG5cdFx0XHRcdFx0b3V0cHV0LnBvcCgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG91dHB1dC5wdXNoKHApO1xuXHRcdFx0XHR9XG5cdFx0fSk7XG5cdFx0cmV0dXJuIG91dHB1dC5qb2luKCcnKS5yZXBsYWNlKC9eXFwvLywgaW5wdXQuY2hhckF0KDApID09PSAnLycgPyAnLycgOiAnJyk7XG5cdH1cblxuXHRocmVmID0gcGFyc2VVUkkoaHJlZiB8fCAnJyk7XG5cdGJhc2UgPSBwYXJzZVVSSShiYXNlIHx8ICcnKTtcblxuXHRyZXR1cm4gIWhyZWYgfHwgIWJhc2UgPyBudWxsIDogKGhyZWYucHJvdG9jb2wgfHwgYmFzZS5wcm90b2NvbCkgK1xuXHRcdChocmVmLnByb3RvY29sIHx8IGhyZWYuYXV0aG9yaXR5ID8gaHJlZi5hdXRob3JpdHkgOiBiYXNlLmF1dGhvcml0eSkgK1xuXHRcdHJlbW92ZURvdFNlZ21lbnRzKGhyZWYucHJvdG9jb2wgfHwgaHJlZi5hdXRob3JpdHkgfHwgaHJlZi5wYXRobmFtZS5jaGFyQXQoMCkgPT09ICcvJyA/IGhyZWYucGF0aG5hbWUgOiAoaHJlZi5wYXRobmFtZSA/ICgoYmFzZS5hdXRob3JpdHkgJiYgIWJhc2UucGF0aG5hbWUgPyAnLycgOiAnJykgKyBiYXNlLnBhdGhuYW1lLnNsaWNlKDAsIGJhc2UucGF0aG5hbWUubGFzdEluZGV4T2YoJy8nKSArIDEpICsgaHJlZi5wYXRobmFtZSkgOiBiYXNlLnBhdGhuYW1lKSkgK1xuXHRcdChocmVmLnByb3RvY29sIHx8IGhyZWYuYXV0aG9yaXR5IHx8IGhyZWYucGF0aG5hbWUgPyBocmVmLnNlYXJjaCA6IChocmVmLnNlYXJjaCB8fCBiYXNlLnNlYXJjaCkpICtcblx0XHRocmVmLmhhc2g7XG59XG5cbmZ1bmN0aW9uIGdldERvY3VtZW50VXJpKHVyaSkge1xuXHRyZXR1cm4gdXJpLnNwbGl0KCcjJylbMF07XG59XG5mdW5jdGlvbiBub3JtU2NoZW1hKHNjaGVtYSwgYmFzZVVyaSkge1xuXHRpZiAoc2NoZW1hICYmIHR5cGVvZiBzY2hlbWEgPT09IFwib2JqZWN0XCIpIHtcblx0XHRpZiAoYmFzZVVyaSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRiYXNlVXJpID0gc2NoZW1hLmlkO1xuXHRcdH0gZWxzZSBpZiAodHlwZW9mIHNjaGVtYS5pZCA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0YmFzZVVyaSA9IHJlc29sdmVVcmwoYmFzZVVyaSwgc2NoZW1hLmlkKTtcblx0XHRcdHNjaGVtYS5pZCA9IGJhc2VVcmk7XG5cdFx0fVxuXHRcdGlmIChBcnJheS5pc0FycmF5KHNjaGVtYSkpIHtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc2NoZW1hLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdG5vcm1TY2hlbWEoc2NoZW1hW2ldLCBiYXNlVXJpKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKHR5cGVvZiBzY2hlbWFbJyRyZWYnXSA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRzY2hlbWFbJyRyZWYnXSA9IHJlc29sdmVVcmwoYmFzZVVyaSwgc2NoZW1hWyckcmVmJ10pO1xuXHRcdFx0fVxuXHRcdFx0Zm9yICh2YXIga2V5IGluIHNjaGVtYSkge1xuXHRcdFx0XHRpZiAoa2V5ICE9PSBcImVudW1cIikge1xuXHRcdFx0XHRcdG5vcm1TY2hlbWEoc2NoZW1hW2tleV0sIGJhc2VVcmkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbnZhciBFcnJvckNvZGVzID0ge1xuXHRJTlZBTElEX1RZUEU6IDAsXG5cdEVOVU1fTUlTTUFUQ0g6IDEsXG5cdEFOWV9PRl9NSVNTSU5HOiAxMCxcblx0T05FX09GX01JU1NJTkc6IDExLFxuXHRPTkVfT0ZfTVVMVElQTEU6IDEyLFxuXHROT1RfUEFTU0VEOiAxMyxcblx0Ly8gTnVtZXJpYyBlcnJvcnNcblx0TlVNQkVSX01VTFRJUExFX09GOiAxMDAsXG5cdE5VTUJFUl9NSU5JTVVNOiAxMDEsXG5cdE5VTUJFUl9NSU5JTVVNX0VYQ0xVU0lWRTogMTAyLFxuXHROVU1CRVJfTUFYSU1VTTogMTAzLFxuXHROVU1CRVJfTUFYSU1VTV9FWENMVVNJVkU6IDEwNCxcblx0TlVNQkVSX05PVF9BX05VTUJFUjogMTA1LFxuXHQvLyBTdHJpbmcgZXJyb3JzXG5cdFNUUklOR19MRU5HVEhfU0hPUlQ6IDIwMCxcblx0U1RSSU5HX0xFTkdUSF9MT05HOiAyMDEsXG5cdFNUUklOR19QQVRURVJOOiAyMDIsXG5cdC8vIE9iamVjdCBlcnJvcnNcblx0T0JKRUNUX1BST1BFUlRJRVNfTUlOSU1VTTogMzAwLFxuXHRPQkpFQ1RfUFJPUEVSVElFU19NQVhJTVVNOiAzMDEsXG5cdE9CSkVDVF9SRVFVSVJFRDogMzAyLFxuXHRPQkpFQ1RfQURESVRJT05BTF9QUk9QRVJUSUVTOiAzMDMsXG5cdE9CSkVDVF9ERVBFTkRFTkNZX0tFWTogMzA0LFxuXHQvLyBBcnJheSBlcnJvcnNcblx0QVJSQVlfTEVOR1RIX1NIT1JUOiA0MDAsXG5cdEFSUkFZX0xFTkdUSF9MT05HOiA0MDEsXG5cdEFSUkFZX1VOSVFVRTogNDAyLFxuXHRBUlJBWV9BRERJVElPTkFMX0lURU1TOiA0MDMsXG5cdC8vIEN1c3RvbS91c2VyLWRlZmluZWQgZXJyb3JzXG5cdEZPUk1BVF9DVVNUT006IDUwMCxcblx0S0VZV09SRF9DVVNUT006IDUwMSxcblx0Ly8gU2NoZW1hIHN0cnVjdHVyZVxuXHRDSVJDVUxBUl9SRUZFUkVOQ0U6IDYwMCxcblx0Ly8gTm9uLXN0YW5kYXJkIHZhbGlkYXRpb24gb3B0aW9uc1xuXHRVTktOT1dOX1BST1BFUlRZOiAxMDAwXG59O1xudmFyIEVycm9yQ29kZUxvb2t1cCA9IHt9O1xuZm9yICh2YXIga2V5IGluIEVycm9yQ29kZXMpIHtcblx0RXJyb3JDb2RlTG9va3VwW0Vycm9yQ29kZXNba2V5XV0gPSBrZXk7XG59XG52YXIgRXJyb3JNZXNzYWdlc0RlZmF1bHQgPSB7XG5cdElOVkFMSURfVFlQRTogXCJJbnZhbGlkIHR5cGU6IHt0eXBlfSAoZXhwZWN0ZWQge2V4cGVjdGVkfSlcIixcblx0RU5VTV9NSVNNQVRDSDogXCJObyBlbnVtIG1hdGNoIGZvcjoge3ZhbHVlfVwiLFxuXHRBTllfT0ZfTUlTU0lORzogXCJEYXRhIGRvZXMgbm90IG1hdGNoIGFueSBzY2hlbWFzIGZyb20gXFxcImFueU9mXFxcIlwiLFxuXHRPTkVfT0ZfTUlTU0lORzogXCJEYXRhIGRvZXMgbm90IG1hdGNoIGFueSBzY2hlbWFzIGZyb20gXFxcIm9uZU9mXFxcIlwiLFxuXHRPTkVfT0ZfTVVMVElQTEU6IFwiRGF0YSBpcyB2YWxpZCBhZ2FpbnN0IG1vcmUgdGhhbiBvbmUgc2NoZW1hIGZyb20gXFxcIm9uZU9mXFxcIjogaW5kaWNlcyB7aW5kZXgxfSBhbmQge2luZGV4Mn1cIixcblx0Tk9UX1BBU1NFRDogXCJEYXRhIG1hdGNoZXMgc2NoZW1hIGZyb20gXFxcIm5vdFxcXCJcIixcblx0Ly8gTnVtZXJpYyBlcnJvcnNcblx0TlVNQkVSX01VTFRJUExFX09GOiBcIlZhbHVlIHt2YWx1ZX0gaXMgbm90IGEgbXVsdGlwbGUgb2Yge211bHRpcGxlT2Z9XCIsXG5cdE5VTUJFUl9NSU5JTVVNOiBcIlZhbHVlIHt2YWx1ZX0gaXMgbGVzcyB0aGFuIG1pbmltdW0ge21pbmltdW19XCIsXG5cdE5VTUJFUl9NSU5JTVVNX0VYQ0xVU0lWRTogXCJWYWx1ZSB7dmFsdWV9IGlzIGVxdWFsIHRvIGV4Y2x1c2l2ZSBtaW5pbXVtIHttaW5pbXVtfVwiLFxuXHROVU1CRVJfTUFYSU1VTTogXCJWYWx1ZSB7dmFsdWV9IGlzIGdyZWF0ZXIgdGhhbiBtYXhpbXVtIHttYXhpbXVtfVwiLFxuXHROVU1CRVJfTUFYSU1VTV9FWENMVVNJVkU6IFwiVmFsdWUge3ZhbHVlfSBpcyBlcXVhbCB0byBleGNsdXNpdmUgbWF4aW11bSB7bWF4aW11bX1cIixcblx0TlVNQkVSX05PVF9BX05VTUJFUjogXCJWYWx1ZSB7dmFsdWV9IGlzIG5vdCBhIHZhbGlkIG51bWJlclwiLFxuXHQvLyBTdHJpbmcgZXJyb3JzXG5cdFNUUklOR19MRU5HVEhfU0hPUlQ6IFwiU3RyaW5nIGlzIHRvbyBzaG9ydCAoe2xlbmd0aH0gY2hhcnMpLCBtaW5pbXVtIHttaW5pbXVtfVwiLFxuXHRTVFJJTkdfTEVOR1RIX0xPTkc6IFwiU3RyaW5nIGlzIHRvbyBsb25nICh7bGVuZ3RofSBjaGFycyksIG1heGltdW0ge21heGltdW19XCIsXG5cdFNUUklOR19QQVRURVJOOiBcIlN0cmluZyBkb2VzIG5vdCBtYXRjaCBwYXR0ZXJuOiB7cGF0dGVybn1cIixcblx0Ly8gT2JqZWN0IGVycm9yc1xuXHRPQkpFQ1RfUFJPUEVSVElFU19NSU5JTVVNOiBcIlRvbyBmZXcgcHJvcGVydGllcyBkZWZpbmVkICh7cHJvcGVydHlDb3VudH0pLCBtaW5pbXVtIHttaW5pbXVtfVwiLFxuXHRPQkpFQ1RfUFJPUEVSVElFU19NQVhJTVVNOiBcIlRvbyBtYW55IHByb3BlcnRpZXMgZGVmaW5lZCAoe3Byb3BlcnR5Q291bnR9KSwgbWF4aW11bSB7bWF4aW11bX1cIixcblx0T0JKRUNUX1JFUVVJUkVEOiBcIk1pc3NpbmcgcmVxdWlyZWQgcHJvcGVydHk6IHtrZXl9XCIsXG5cdE9CSkVDVF9BRERJVElPTkFMX1BST1BFUlRJRVM6IFwiQWRkaXRpb25hbCBwcm9wZXJ0aWVzIG5vdCBhbGxvd2VkXCIsXG5cdE9CSkVDVF9ERVBFTkRFTkNZX0tFWTogXCJEZXBlbmRlbmN5IGZhaWxlZCAtIGtleSBtdXN0IGV4aXN0OiB7bWlzc2luZ30gKGR1ZSB0byBrZXk6IHtrZXl9KVwiLFxuXHQvLyBBcnJheSBlcnJvcnNcblx0QVJSQVlfTEVOR1RIX1NIT1JUOiBcIkFycmF5IGlzIHRvbyBzaG9ydCAoe2xlbmd0aH0pLCBtaW5pbXVtIHttaW5pbXVtfVwiLFxuXHRBUlJBWV9MRU5HVEhfTE9ORzogXCJBcnJheSBpcyB0b28gbG9uZyAoe2xlbmd0aH0pLCBtYXhpbXVtIHttYXhpbXVtfVwiLFxuXHRBUlJBWV9VTklRVUU6IFwiQXJyYXkgaXRlbXMgYXJlIG5vdCB1bmlxdWUgKGluZGljZXMge21hdGNoMX0gYW5kIHttYXRjaDJ9KVwiLFxuXHRBUlJBWV9BRERJVElPTkFMX0lURU1TOiBcIkFkZGl0aW9uYWwgaXRlbXMgbm90IGFsbG93ZWRcIixcblx0Ly8gRm9ybWF0IGVycm9yc1xuXHRGT1JNQVRfQ1VTVE9NOiBcIkZvcm1hdCB2YWxpZGF0aW9uIGZhaWxlZCAoe21lc3NhZ2V9KVwiLFxuXHRLRVlXT1JEX0NVU1RPTTogXCJLZXl3b3JkIGZhaWxlZDoge2tleX0gKHttZXNzYWdlfSlcIixcblx0Ly8gU2NoZW1hIHN0cnVjdHVyZVxuXHRDSVJDVUxBUl9SRUZFUkVOQ0U6IFwiQ2lyY3VsYXIgJHJlZnM6IHt1cmxzfVwiLFxuXHQvLyBOb24tc3RhbmRhcmQgdmFsaWRhdGlvbiBvcHRpb25zXG5cdFVOS05PV05fUFJPUEVSVFk6IFwiVW5rbm93biBwcm9wZXJ0eSAobm90IGluIHNjaGVtYSlcIlxufTtcblxuZnVuY3Rpb24gVmFsaWRhdGlvbkVycm9yKGNvZGUsIG1lc3NhZ2UsIHBhcmFtcywgZGF0YVBhdGgsIHNjaGVtYVBhdGgsIHN1YkVycm9ycykge1xuXHRFcnJvci5jYWxsKHRoaXMpO1xuXHRpZiAoY29kZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yIChcIk5vIGNvZGUgc3VwcGxpZWQgZm9yIGVycm9yOiBcIisgbWVzc2FnZSk7XG5cdH1cblx0dGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcblx0dGhpcy5wYXJhbXMgPSBwYXJhbXM7XG5cdHRoaXMuY29kZSA9IGNvZGU7XG5cdHRoaXMuZGF0YVBhdGggPSBkYXRhUGF0aCB8fCBcIlwiO1xuXHR0aGlzLnNjaGVtYVBhdGggPSBzY2hlbWFQYXRoIHx8IFwiXCI7XG5cdHRoaXMuc3ViRXJyb3JzID0gc3ViRXJyb3JzIHx8IG51bGw7XG5cblx0dmFyIGVyciA9IG5ldyBFcnJvcih0aGlzLm1lc3NhZ2UpO1xuXHR0aGlzLnN0YWNrID0gZXJyLnN0YWNrIHx8IGVyci5zdGFja3RyYWNlO1xuXHRpZiAoIXRoaXMuc3RhY2spIHtcblx0XHR0cnkge1xuXHRcdFx0dGhyb3cgZXJyO1xuXHRcdH1cblx0XHRjYXRjaChlcnIpIHtcblx0XHRcdHRoaXMuc3RhY2sgPSBlcnIuc3RhY2sgfHwgZXJyLnN0YWNrdHJhY2U7XG5cdFx0fVxuXHR9XG59XG5WYWxpZGF0aW9uRXJyb3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFcnJvci5wcm90b3R5cGUpO1xuVmFsaWRhdGlvbkVycm9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFZhbGlkYXRpb25FcnJvcjtcblZhbGlkYXRpb25FcnJvci5wcm90b3R5cGUubmFtZSA9ICdWYWxpZGF0aW9uRXJyb3InO1xuXG5WYWxpZGF0aW9uRXJyb3IucHJvdG90eXBlLnByZWZpeFdpdGggPSBmdW5jdGlvbiAoZGF0YVByZWZpeCwgc2NoZW1hUHJlZml4KSB7XG5cdGlmIChkYXRhUHJlZml4ICE9PSBudWxsKSB7XG5cdFx0ZGF0YVByZWZpeCA9IGRhdGFQcmVmaXgucmVwbGFjZSgvfi9nLCBcIn4wXCIpLnJlcGxhY2UoL1xcLy9nLCBcIn4xXCIpO1xuXHRcdHRoaXMuZGF0YVBhdGggPSBcIi9cIiArIGRhdGFQcmVmaXggKyB0aGlzLmRhdGFQYXRoO1xuXHR9XG5cdGlmIChzY2hlbWFQcmVmaXggIT09IG51bGwpIHtcblx0XHRzY2hlbWFQcmVmaXggPSBzY2hlbWFQcmVmaXgucmVwbGFjZSgvfi9nLCBcIn4wXCIpLnJlcGxhY2UoL1xcLy9nLCBcIn4xXCIpO1xuXHRcdHRoaXMuc2NoZW1hUGF0aCA9IFwiL1wiICsgc2NoZW1hUHJlZml4ICsgdGhpcy5zY2hlbWFQYXRoO1xuXHR9XG5cdGlmICh0aGlzLnN1YkVycm9ycyAhPT0gbnVsbCkge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zdWJFcnJvcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHRoaXMuc3ViRXJyb3JzW2ldLnByZWZpeFdpdGgoZGF0YVByZWZpeCwgc2NoZW1hUHJlZml4KTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHRoaXM7XG59O1xuXG5mdW5jdGlvbiBpc1RydXN0ZWRVcmwoYmFzZVVybCwgdGVzdFVybCkge1xuXHRpZih0ZXN0VXJsLnN1YnN0cmluZygwLCBiYXNlVXJsLmxlbmd0aCkgPT09IGJhc2VVcmwpe1xuXHRcdHZhciByZW1haW5kZXIgPSB0ZXN0VXJsLnN1YnN0cmluZyhiYXNlVXJsLmxlbmd0aCk7XG5cdFx0aWYgKCh0ZXN0VXJsLmxlbmd0aCA+IDAgJiYgdGVzdFVybC5jaGFyQXQoYmFzZVVybC5sZW5ndGggLSAxKSA9PT0gXCIvXCIpXG5cdFx0XHR8fCByZW1haW5kZXIuY2hhckF0KDApID09PSBcIiNcIlxuXHRcdFx0fHwgcmVtYWluZGVyLmNoYXJBdCgwKSA9PT0gXCI/XCIpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gZmFsc2U7XG59XG5cbnZhciBsYW5ndWFnZXMgPSB7fTtcbmZ1bmN0aW9uIGNyZWF0ZUFwaShsYW5ndWFnZSkge1xuXHR2YXIgZ2xvYmFsQ29udGV4dCA9IG5ldyBWYWxpZGF0b3JDb250ZXh0KCk7XG5cdHZhciBjdXJyZW50TGFuZ3VhZ2UgPSBsYW5ndWFnZSB8fCAnZW4nO1xuXHR2YXIgYXBpID0ge1xuXHRcdGFkZEZvcm1hdDogZnVuY3Rpb24gKCkge1xuXHRcdFx0Z2xvYmFsQ29udGV4dC5hZGRGb3JtYXQuYXBwbHkoZ2xvYmFsQ29udGV4dCwgYXJndW1lbnRzKTtcblx0XHR9LFxuXHRcdGxhbmd1YWdlOiBmdW5jdGlvbiAoY29kZSkge1xuXHRcdFx0aWYgKCFjb2RlKSB7XG5cdFx0XHRcdHJldHVybiBjdXJyZW50TGFuZ3VhZ2U7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIWxhbmd1YWdlc1tjb2RlXSkge1xuXHRcdFx0XHRjb2RlID0gY29kZS5zcGxpdCgnLScpWzBdOyAvLyBmYWxsIGJhY2sgdG8gYmFzZSBsYW5ndWFnZVxuXHRcdFx0fVxuXHRcdFx0aWYgKGxhbmd1YWdlc1tjb2RlXSkge1xuXHRcdFx0XHRjdXJyZW50TGFuZ3VhZ2UgPSBjb2RlO1xuXHRcdFx0XHRyZXR1cm4gY29kZTsgLy8gc28geW91IGNhbiB0ZWxsIGlmIGZhbGwtYmFjayBoYXMgaGFwcGVuZWRcblx0XHRcdH1cblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9LFxuXHRcdGFkZExhbmd1YWdlOiBmdW5jdGlvbiAoY29kZSwgbWVzc2FnZU1hcCkge1xuXHRcdFx0dmFyIGtleTtcblx0XHRcdGZvciAoa2V5IGluIEVycm9yQ29kZXMpIHtcblx0XHRcdFx0aWYgKG1lc3NhZ2VNYXBba2V5XSAmJiAhbWVzc2FnZU1hcFtFcnJvckNvZGVzW2tleV1dKSB7XG5cdFx0XHRcdFx0bWVzc2FnZU1hcFtFcnJvckNvZGVzW2tleV1dID0gbWVzc2FnZU1hcFtrZXldO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR2YXIgcm9vdENvZGUgPSBjb2RlLnNwbGl0KCctJylbMF07XG5cdFx0XHRpZiAoIWxhbmd1YWdlc1tyb290Q29kZV0pIHsgLy8gdXNlIGZvciBiYXNlIGxhbmd1YWdlIGlmIG5vdCB5ZXQgZGVmaW5lZFxuXHRcdFx0XHRsYW5ndWFnZXNbY29kZV0gPSBtZXNzYWdlTWFwO1xuXHRcdFx0XHRsYW5ndWFnZXNbcm9vdENvZGVdID0gbWVzc2FnZU1hcDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGxhbmd1YWdlc1tjb2RlXSA9IE9iamVjdC5jcmVhdGUobGFuZ3VhZ2VzW3Jvb3RDb2RlXSk7XG5cdFx0XHRcdGZvciAoa2V5IGluIG1lc3NhZ2VNYXApIHtcblx0XHRcdFx0XHRpZiAodHlwZW9mIGxhbmd1YWdlc1tyb290Q29kZV1ba2V5XSA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0XHRcdGxhbmd1YWdlc1tyb290Q29kZV1ba2V5XSA9IG1lc3NhZ2VNYXBba2V5XTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0bGFuZ3VhZ2VzW2NvZGVdW2tleV0gPSBtZXNzYWdlTWFwW2tleV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH0sXG5cdFx0ZnJlc2hBcGk6IGZ1bmN0aW9uIChsYW5ndWFnZSkge1xuXHRcdFx0dmFyIHJlc3VsdCA9IGNyZWF0ZUFwaSgpO1xuXHRcdFx0aWYgKGxhbmd1YWdlKSB7XG5cdFx0XHRcdHJlc3VsdC5sYW5ndWFnZShsYW5ndWFnZSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH0sXG5cdFx0dmFsaWRhdGU6IGZ1bmN0aW9uIChkYXRhLCBzY2hlbWEsIGNoZWNrUmVjdXJzaXZlLCBiYW5Vbmtub3duUHJvcGVydGllcykge1xuXHRcdFx0dmFyIGNvbnRleHQgPSBuZXcgVmFsaWRhdG9yQ29udGV4dChnbG9iYWxDb250ZXh0LCBmYWxzZSwgbGFuZ3VhZ2VzW2N1cnJlbnRMYW5ndWFnZV0sIGNoZWNrUmVjdXJzaXZlLCBiYW5Vbmtub3duUHJvcGVydGllcyk7XG5cdFx0XHRpZiAodHlwZW9mIHNjaGVtYSA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRzY2hlbWEgPSB7XCIkcmVmXCI6IHNjaGVtYX07XG5cdFx0XHR9XG5cdFx0XHRjb250ZXh0LmFkZFNjaGVtYShcIlwiLCBzY2hlbWEpO1xuXHRcdFx0dmFyIGVycm9yID0gY29udGV4dC52YWxpZGF0ZUFsbChkYXRhLCBzY2hlbWEsIG51bGwsIG51bGwsIFwiXCIpO1xuXHRcdFx0aWYgKCFlcnJvciAmJiBiYW5Vbmtub3duUHJvcGVydGllcykge1xuXHRcdFx0XHRlcnJvciA9IGNvbnRleHQuYmFuVW5rbm93blByb3BlcnRpZXMoKTtcblx0XHRcdH1cblx0XHRcdHRoaXMuZXJyb3IgPSBlcnJvcjtcblx0XHRcdHRoaXMubWlzc2luZyA9IGNvbnRleHQubWlzc2luZztcblx0XHRcdHRoaXMudmFsaWQgPSAoZXJyb3IgPT09IG51bGwpO1xuXHRcdFx0cmV0dXJuIHRoaXMudmFsaWQ7XG5cdFx0fSxcblx0XHR2YWxpZGF0ZVJlc3VsdDogZnVuY3Rpb24gKCkge1xuXHRcdFx0dmFyIHJlc3VsdCA9IHt9O1xuXHRcdFx0dGhpcy52YWxpZGF0ZS5hcHBseShyZXN1bHQsIGFyZ3VtZW50cyk7XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH0sXG5cdFx0dmFsaWRhdGVNdWx0aXBsZTogZnVuY3Rpb24gKGRhdGEsIHNjaGVtYSwgY2hlY2tSZWN1cnNpdmUsIGJhblVua25vd25Qcm9wZXJ0aWVzKSB7XG5cdFx0XHR2YXIgY29udGV4dCA9IG5ldyBWYWxpZGF0b3JDb250ZXh0KGdsb2JhbENvbnRleHQsIHRydWUsIGxhbmd1YWdlc1tjdXJyZW50TGFuZ3VhZ2VdLCBjaGVja1JlY3Vyc2l2ZSwgYmFuVW5rbm93blByb3BlcnRpZXMpO1xuXHRcdFx0aWYgKHR5cGVvZiBzY2hlbWEgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0c2NoZW1hID0ge1wiJHJlZlwiOiBzY2hlbWF9O1xuXHRcdFx0fVxuXHRcdFx0Y29udGV4dC5hZGRTY2hlbWEoXCJcIiwgc2NoZW1hKTtcblx0XHRcdGNvbnRleHQudmFsaWRhdGVBbGwoZGF0YSwgc2NoZW1hLCBudWxsLCBudWxsLCBcIlwiKTtcblx0XHRcdGlmIChiYW5Vbmtub3duUHJvcGVydGllcykge1xuXHRcdFx0XHRjb250ZXh0LmJhblVua25vd25Qcm9wZXJ0aWVzKCk7XG5cdFx0XHR9XG5cdFx0XHR2YXIgcmVzdWx0ID0ge307XG5cdFx0XHRyZXN1bHQuZXJyb3JzID0gY29udGV4dC5lcnJvcnM7XG5cdFx0XHRyZXN1bHQubWlzc2luZyA9IGNvbnRleHQubWlzc2luZztcblx0XHRcdHJlc3VsdC52YWxpZCA9IChyZXN1bHQuZXJyb3JzLmxlbmd0aCA9PT0gMCk7XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH0sXG5cdFx0YWRkU2NoZW1hOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gZ2xvYmFsQ29udGV4dC5hZGRTY2hlbWEuYXBwbHkoZ2xvYmFsQ29udGV4dCwgYXJndW1lbnRzKTtcblx0XHR9LFxuXHRcdGdldFNjaGVtYTogZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIGdsb2JhbENvbnRleHQuZ2V0U2NoZW1hLmFwcGx5KGdsb2JhbENvbnRleHQsIGFyZ3VtZW50cyk7XG5cdFx0fSxcblx0XHRnZXRTY2hlbWFNYXA6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBnbG9iYWxDb250ZXh0LmdldFNjaGVtYU1hcC5hcHBseShnbG9iYWxDb250ZXh0LCBhcmd1bWVudHMpO1xuXHRcdH0sXG5cdFx0Z2V0U2NoZW1hVXJpczogZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIGdsb2JhbENvbnRleHQuZ2V0U2NoZW1hVXJpcy5hcHBseShnbG9iYWxDb250ZXh0LCBhcmd1bWVudHMpO1xuXHRcdH0sXG5cdFx0Z2V0TWlzc2luZ1VyaXM6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBnbG9iYWxDb250ZXh0LmdldE1pc3NpbmdVcmlzLmFwcGx5KGdsb2JhbENvbnRleHQsIGFyZ3VtZW50cyk7XG5cdFx0fSxcblx0XHRkcm9wU2NoZW1hczogZnVuY3Rpb24gKCkge1xuXHRcdFx0Z2xvYmFsQ29udGV4dC5kcm9wU2NoZW1hcy5hcHBseShnbG9iYWxDb250ZXh0LCBhcmd1bWVudHMpO1xuXHRcdH0sXG5cdFx0ZGVmaW5lS2V5d29yZDogZnVuY3Rpb24gKCkge1xuXHRcdFx0Z2xvYmFsQ29udGV4dC5kZWZpbmVLZXl3b3JkLmFwcGx5KGdsb2JhbENvbnRleHQsIGFyZ3VtZW50cyk7XG5cdFx0fSxcblx0XHRkZWZpbmVFcnJvcjogZnVuY3Rpb24gKGNvZGVOYW1lLCBjb2RlTnVtYmVyLCBkZWZhdWx0TWVzc2FnZSkge1xuXHRcdFx0aWYgKHR5cGVvZiBjb2RlTmFtZSAhPT0gJ3N0cmluZycgfHwgIS9eW0EtWl0rKF9bQS1aXSspKiQvLnRlc3QoY29kZU5hbWUpKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcignQ29kZSBuYW1lIG11c3QgYmUgYSBzdHJpbmcgaW4gVVBQRVJfQ0FTRV9XSVRIX1VOREVSU0NPUkVTJyk7XG5cdFx0XHR9XG5cdFx0XHRpZiAodHlwZW9mIGNvZGVOdW1iZXIgIT09ICdudW1iZXInIHx8IGNvZGVOdW1iZXIlMSAhPT0gMCB8fCBjb2RlTnVtYmVyIDwgMTAwMDApIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdDb2RlIG51bWJlciBtdXN0IGJlIGFuIGludGVnZXIgPiAxMDAwMCcpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHR5cGVvZiBFcnJvckNvZGVzW2NvZGVOYW1lXSAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdFcnJvciBhbHJlYWR5IGRlZmluZWQ6ICcgKyBjb2RlTmFtZSArICcgYXMgJyArIEVycm9yQ29kZXNbY29kZU5hbWVdKTtcblx0XHRcdH1cblx0XHRcdGlmICh0eXBlb2YgRXJyb3JDb2RlTG9va3VwW2NvZGVOdW1iZXJdICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yIGNvZGUgYWxyZWFkeSB1c2VkOiAnICsgRXJyb3JDb2RlTG9va3VwW2NvZGVOdW1iZXJdICsgJyBhcyAnICsgY29kZU51bWJlcik7XG5cdFx0XHR9XG5cdFx0XHRFcnJvckNvZGVzW2NvZGVOYW1lXSA9IGNvZGVOdW1iZXI7XG5cdFx0XHRFcnJvckNvZGVMb29rdXBbY29kZU51bWJlcl0gPSBjb2RlTmFtZTtcblx0XHRcdEVycm9yTWVzc2FnZXNEZWZhdWx0W2NvZGVOYW1lXSA9IEVycm9yTWVzc2FnZXNEZWZhdWx0W2NvZGVOdW1iZXJdID0gZGVmYXVsdE1lc3NhZ2U7XG5cdFx0XHRmb3IgKHZhciBsYW5nQ29kZSBpbiBsYW5ndWFnZXMpIHtcblx0XHRcdFx0dmFyIGxhbmd1YWdlID0gbGFuZ3VhZ2VzW2xhbmdDb2RlXTtcblx0XHRcdFx0aWYgKGxhbmd1YWdlW2NvZGVOYW1lXSkge1xuXHRcdFx0XHRcdGxhbmd1YWdlW2NvZGVOdW1iZXJdID0gbGFuZ3VhZ2VbY29kZU51bWJlcl0gfHwgbGFuZ3VhZ2VbY29kZU5hbWVdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRyZXNldDogZnVuY3Rpb24gKCkge1xuXHRcdFx0Z2xvYmFsQ29udGV4dC5yZXNldCgpO1xuXHRcdFx0dGhpcy5lcnJvciA9IG51bGw7XG5cdFx0XHR0aGlzLm1pc3NpbmcgPSBbXTtcblx0XHRcdHRoaXMudmFsaWQgPSB0cnVlO1xuXHRcdH0sXG5cdFx0bWlzc2luZzogW10sXG5cdFx0ZXJyb3I6IG51bGwsXG5cdFx0dmFsaWQ6IHRydWUsXG5cdFx0bm9ybVNjaGVtYTogbm9ybVNjaGVtYSxcblx0XHRyZXNvbHZlVXJsOiByZXNvbHZlVXJsLFxuXHRcdGdldERvY3VtZW50VXJpOiBnZXREb2N1bWVudFVyaSxcblx0XHRlcnJvckNvZGVzOiBFcnJvckNvZGVzXG5cdH07XG5cdHJldHVybiBhcGk7XG59XG5cbnZhciB0djQgPSBjcmVhdGVBcGkoKTtcbnR2NC5hZGRMYW5ndWFnZSgnZW4tZ2InLCBFcnJvck1lc3NhZ2VzRGVmYXVsdCk7XG5cbi8vbGVnYWN5IHByb3BlcnR5XG50djQudHY0ID0gdHY0O1xuXG5yZXR1cm4gdHY0OyAvLyB1c2VkIGJ5IF9oZWFkZXIuanMgdG8gZ2xvYmFsaXNlLlxuXG59KSk7IiwidmFyIF8gPSByZXF1aXJlKCcuL3V0aWwnKTtcblxudmFyIFN0ZXBzID0gWydwbGF5JywgJ2Zvcm0nLCAncmVzdWx0J107XG5cbmZ1bmN0aW9uIEluc3RhbnRXaW4oQ3VycmVudFVzZXIsIFNoaXApIHtcblxuICB2YXIgQ0hBTkdFX0VWRU5UID0gW1wiU0hJUF9DSEFOR0VcIiwgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwMDAwMDAwMDAwKV0uam9pbignXycpO1xuXG4gIHZhciBBcHBTdGF0ZSA9IHt9O1xuXG4gIGZ1bmN0aW9uIGluaXRTdGF0ZSh1c2VyLCBzaGlwKSB7XG4gICAgQXBwU3RhdGUgPSB7XG4gICAgICBzaGlwOiBfLm9taXQoc2hpcCwgJ3NldHRpbmdzJywgJ3Jlc291cmNlcycsICd0cmFuc2xhdGlvbnMnKSxcbiAgICAgIHNldHRpbmdzOiBzaGlwLnNldHRpbmdzLFxuICAgICAgZm9ybTogc2hpcC5yZXNvdXJjZXMuZm9ybSxcbiAgICAgIGFjaGlldmVtZW50OiBzaGlwLnJlc291cmNlcy5hY2hpZXZlbWVudCxcbiAgICAgIHRyYW5zbGF0aW9uczogc2hpcC50cmFuc2xhdGlvbnMsXG4gICAgICB1c2VyOiB1c2VyLFxuICAgICAgYmFkZ2U6IChzaGlwLnJlc291cmNlcy5hY2hpZXZlbWVudCAmJiBzaGlwLnJlc291cmNlcy5hY2hpZXZlbWVudC5iYWRnZSlcbiAgICB9O1xuICAgIGVtaXRDaGFuZ2UoKTtcbiAgICByZXR1cm4gQXBwU3RhdGU7XG4gIH07XG5cbiAgZnVuY3Rpb24gZW1pdENoYW5nZSh0bXApIHtcbiAgICB2YXIgcyA9IGdldEFwcFN0YXRlKHRtcCk7XG4gICAgSHVsbC5lbWl0KENIQU5HRV9FVkVOVCwgcyk7XG4gIH1cblxuXG4gIC8vIEN1c3RvbWl6YXRpb24gc3VwcG9ydFxuXG4gIGZ1bmN0aW9uIHVwZGF0ZVNldHRpbmdzKHNldHRpbmdzKSB7XG4gICAgQXBwU3RhdGUuc2V0dGluZ3MgPSBzZXR0aW5ncztcbiAgICBlbWl0Q2hhbmdlKHsgY2hhbmdlZDogJ3NldHRpbmdzJyB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZVRyYW5zbGF0aW9ucyh0cmFuc2xhdGlvbnMpIHtcbiAgICBBcHBTdGF0ZS50cmFuc2xhdGlvbnMgPSB0cmFuc2xhdGlvbnM7XG4gICAgZW1pdENoYW5nZSh7IGNoYW5nZWQ6ICd0cmFuc2xhdGlvbnMnIH0pO1xuICB9XG5cbiAgLy8gVXNlciBhY3Rpb25zXG5cbiAgZnVuY3Rpb24gcHJvY2Vzc0Zvcm1EYXRhKGZvcm1EYXRhKSB7XG4gICAgdmFyIGZpZWxkcyA9IEFwcFN0YXRlLmZvcm0uZmllbGRzX2xpc3Q7XG4gICAgdmFyIHJldCA9IGZpZWxkcy5yZWR1Y2UoZnVuY3Rpb24oZGF0YSwgZmllbGQpIHtcbiAgICAgIHZhciB2YWwgPSBmb3JtRGF0YVtmaWVsZC5uYW1lXTtcbiAgICAgIGlmICh2YWwudG9TdHJpbmcoKS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHN3aXRjaCAoZmllbGQuZmllbGRfdHlwZSkge1xuICAgICAgICAgIGNhc2UgJ2RhdGUnOlxuICAgICAgICAgICAgcmVzID0gbmV3IERhdGUodmFsKS50b0lTT1N0cmluZygpLnN1YnN0cmluZygwLDEwKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXMgPSBmb3JtRGF0YVtmaWVsZC5uYW1lXTtcbiAgICAgICAgfVxuICAgICAgICBkYXRhW2ZpZWxkLm5hbWVdID0gcmVzO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfSwge30pO1xuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICBmdW5jdGlvbiBzdWJtaXRGb3JtKGZvcm1EYXRhKSB7XG4gICAgdmFyIGRhdGEgPSBwcm9jZXNzRm9ybURhdGEoZm9ybURhdGEpO1xuICAgIGVtaXRDaGFuZ2UoeyBjaGFuZ2VkOiAnbG9hZGluZycsIGxvYWRpbmc6ICdmb3JtJyB9KTtcbiAgICBIdWxsLmFwaS5wdXQoQXBwU3RhdGUuZm9ybS5pZCArIFwiL3N1Ym1pdFwiLCB7IGRhdGE6IGRhdGEgfSkudGhlbihmdW5jdGlvbihmb3JtKSB7XG4gICAgICBBcHBTdGF0ZS5mb3JtID0gZm9ybTtcbiAgICAgIGVtaXRDaGFuZ2UoeyBjaGFuZ2VkOiAnZm9ybScgfSk7XG4gICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICBlbWl0Q2hhbmdlKHsgZXJyb3JfbWVzc2FnZTogJ2ludmFsaWRfZm9ybScsIGVycm9yOiBlcnIgfSk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBwbGF5KHByb3ZpZGVyKSB7XG4gICAgaWYgKHVzZXJDYW5QbGF5KCkpIHtcbiAgICAgIGVtaXRDaGFuZ2UoeyBjaGFuZ2VkOiAnbG9hZGluZycsIGxvYWRpbmc6ICdiYWRnZScgfSk7XG4gICAgICByZXR1cm4gSHVsbC5hcGkucG9zdChBcHBTdGF0ZS5hY2hpZXZlbWVudC5pZCArIFwiL2FjaGlldmVcIikudGhlbihmdW5jdGlvbihiYWRnZSkge1xuICAgICAgICBBcHBTdGF0ZS5iYWRnZSA9IGJhZGdlO1xuICAgICAgICBlbWl0Q2hhbmdlKHsgY2hhbmdlZDogJ2JhZGdlJyB9KTtcbiAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICBlbWl0Q2hhbmdlKHsgZXJyb3JfbWVzc2FnZTogJ2Vycm9yX29uX2FjaGlldmUnLCBlcnJvcjogZXJyIH0pO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChwcm92aWRlciAmJiAhQXBwU3RhdGUudXNlcikge1xuICAgICAgbG9naW5BbmRQbGF5KHByb3ZpZGVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZW1pdENoYW5nZSh7IGVycm9yX21lc3NhZ2U6ICd1c2VyX2Nhbm5vdF9wbGF5JyB9KTtcbiAgICB9XG4gIH1cblxuICB2YXIgYXV0b1BsYXkgPSBmYWxzZTtcbiAgZnVuY3Rpb24gbG9naW5BbmRQbGF5KHByb3ZpZGVyLCBvcHRpb25zKSB7XG4gICAgaWYgKHByb3ZpZGVyKSB7XG4gICAgICBhdXRvUGxheSA9IHRydWU7XG4gICAgICBlbWl0Q2hhbmdlKHsgaXNMb2dnaW5nSW46IHRydWUgfSk7XG4gICAgICBIdWxsLmxvZ2luKHByb3ZpZGVyLCBvcHRpb25zKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgXCJbSW5zdGFudFdpbl0gRXJyb3IgaW4gbG9naW5BbmRQbGF5IG1ldGhvZDogbWlzc2luZyBgcHJvdmlkZXJgXCI7XG4gICAgfVxuICB9XG5cbiAgLy8gU3RhdGUgbWFuYWdlbWVudFxuXG4gIGZ1bmN0aW9uIGdldEFwcFN0YXRlKHRtcCkge1xuICAgIHZhciBzdGVwID0gY3VycmVudFN0ZXAoKTtcbiAgICB2YXIgcmV0ID0gXy5leHRlbmQoe30sIEFwcFN0YXRlLCB7XG4gICAgICB1c2VyQ2FuUGxheTogdXNlckNhblBsYXkoKSxcbiAgICAgIHVzZXJIYXNQbGF5ZWQ6IHVzZXJIYXNQbGF5ZWQoKSxcbiAgICAgIHVzZXJIYXNXb246IHVzZXJIYXNXb24oKSxcbiAgICAgIGN1cnJlbnRTdGVwOiBzdGVwLFxuICAgICAgY3VycmVudFN0ZXBJbmRleDogc3RlcEluZGV4KHN0ZXApLFxuICAgICAgaXNGb3JtQ29tcGxldGU6IGlzRm9ybUNvbXBsZXRlKCksXG4gICAgfSwgdG1wKTtcbiAgICByZXR1cm4gXy5kZWVwQ2xvbmUocmV0KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVzZXJDYW5QbGF5KCkge1xuICAgIHJldHVybiBjYW5QbGF5KCkgPT09IHRydWU7XG4gIH1cblxuICBmdW5jdGlvbiBjYW5QbGF5KCkge1xuICAgIGlmICghQXBwU3RhdGUudXNlcikgcmV0dXJuIFwiTm8gY3VycmVudCB1c2VyXCI7XG4gICAgaWYgKHVzZXJIYXNXb24oKSkgcmV0dXJuIFwiQWxyZWFkeSB3b25cIjtcbiAgICB2YXIgYmFkZ2UgPSBBcHBTdGF0ZS5iYWRnZTtcbiAgICBpZiAoIWJhZGdlIHx8ICFiYWRnZS5kYXRhLmF0dGVtcHRzKSByZXR1cm4gdHJ1ZTtcbiAgICB2YXIgZCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5zbGljZSgwLCAxMCk7XG4gICAgaWYgKGJhZGdlLmRhdGEuYXR0ZW1wdHNbZF0pIHtcbiAgICAgIHJldHVybiBcIk9uZSBhdHRlbXB0IGFscmVhZHkgdG9kYXlcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdXNlckhhc1BsYXllZCgpIHtcbiAgICByZXR1cm4gISFBcHBTdGF0ZS5iYWRnZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVzZXJIYXNXb24oKSB7XG4gICAgdmFyIGJhZGdlID0gQXBwU3RhdGUuYmFkZ2U7XG4gICAgaWYgKCFiYWRnZSB8fCAhYmFkZ2UuZGF0YSkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiBiYWRnZS5kYXRhLndpbm5lciA9PT0gdHJ1ZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGN1cnJlbnRTdGVwKCkge1xuICAgIGlmICghQXBwU3RhdGUudXNlciB8fCB1c2VyQ2FuUGxheSgpKSByZXR1cm4gJ3BsYXknO1xuICAgIGlmICghaXNGb3JtQ29tcGxldGUoKSkgcmV0dXJuICdmb3JtJztcbiAgICByZXR1cm4gJ3Jlc3VsdCc7XG4gIH1cblxuICBmdW5jdGlvbiBzdGVwSW5kZXgoc3RlcCkge1xuICAgIHJldHVybiBTdGVwcy5pbmRleE9mKHN0ZXApO1xuICB9XG5cbiAgZnVuY3Rpb24gaXNGb3JtQ29tcGxldGUoKSB7XG4gICAgaWYgKCFBcHBTdGF0ZS51c2VyKSByZXR1cm4gZmFsc2U7XG4gICAgdmFyIGZpZWxkcyA9IEFwcFN0YXRlLmZvcm0gJiYgQXBwU3RhdGUuZm9ybS5maWVsZHNfbGlzdDtcbiAgICB2YXIgcmV0ID0gQXBwU3RhdGUuZm9ybS51c2VyX2RhdGEuY3JlYXRlZF9hdCAmJiBmaWVsZHMgJiYgZmllbGRzLnJlZHVjZShmdW5jdGlvbihyZXMsIGZpZWxkKSB7XG4gICAgICByZXR1cm4gcmVzICYmICEhZmllbGQudmFsdWU7XG4gICAgfSwgdHJ1ZSk7XG4gICAgcmV0dXJuIHJldCB8fCBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgIGlmIChBcHBTdGF0ZS51c2VyLmlzX2FkbWluKSB7XG4gICAgICBlbWl0Q2hhbmdlKHsgbG9hZGluZzogJ3Jlc2V0JyB9KTtcbiAgICAgIGlmIChBcHBTdGF0ZS5iYWRnZSAmJiBBcHBTdGF0ZS5iYWRnZS5pZCkge1xuICAgICAgICBIdWxsLmFwaShBcHBTdGF0ZS5iYWRnZS5pZCwgJ2RlbGV0ZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIEFwcFN0YXRlLmJhZGdlID0gbnVsbDtcbiAgICAgICAgICBIdWxsLmFwaShBcHBTdGF0ZS5mb3JtLmlkICsgJy9zdWJtaXQnLCAnZGVsZXRlJywgZnVuY3Rpb24oZm9ybSkge1xuICAgICAgICAgICAgQXBwU3RhdGUuZm9ybSA9IGZvcm07XG4gICAgICAgICAgICBlbWl0Q2hhbmdlKHsgY2hhbmdlZDogJ3Jlc2V0JyB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgZW1pdENoYW5nZSh7IGVycm9yX21lc3NhZ2U6ICdlcnJvcl9kZWxldGluZ19iYWRnZScsIGVycm9yOiBlcnIgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZW1pdENoYW5nZSh7IGNoYW5nZWQ6ICdyZXNldCcgfSk7XG4gICAgICAgIHRocm93IFwiW0luc3RhbnRXaW5dIE5vIGJhZGdlIGZvdW5kIGhlcmUuLi5cIjtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgXCJbSW5zdGFudFdpbl0gWW91IG5lZWQgdG8gYmUgYSBhZG1pbmlzdHJhdG9yIHRvIHJlc2V0IGJhZGdlc1wiO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHRyYW5zbGF0ZShsYW5nKSB7XG4gICAgdmFyIHJldCA9IEFwcFN0YXRlLnRyYW5zbGF0aW9uc1tsYW5nXSB8fCBBcHBTdGF0ZS50cmFuc2xhdGlvbnNbJ2VuJ10gfHwge307XG4gICAgdmFyIHJlc3VsdCA9IE9iamVjdC5rZXlzKHJldCkucmVkdWNlKGZ1bmN0aW9uKHRyLCBrKSB7XG4gICAgICB2YXIgdCA9IHJldFtrXTtcbiAgICAgIGlmICh0ICYmIHQubGVuZ3RoID4gMCkge1xuICAgICAgICB0cltrXSA9IHQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHI7XG4gICAgfSwge30pO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBvbkF1dGhFdmVudCgpIHtcbiAgICBlbWl0Q2hhbmdlKHsgY2hhbmdlZDogJ2xvYWRpbmcnLCBsb2FkaW5nOiAnc2hpcCcgfSk7XG4gICAgSHVsbC5hcGkoU2hpcC5pZCwgeyBmaWVsZHM6ICdiYWRnZScgfSkudGhlbihmdW5jdGlvbihzaGlwKSB7XG4gICAgICBpbml0U3RhdGUoSHVsbC5jdXJyZW50VXNlcigpLCBzaGlwKTtcbiAgICAgIGlmIChhdXRvUGxheSAmJiB1c2VyQ2FuUGxheSgpKSBwbGF5KCk7XG4gICAgICBhdXRvUGxheSA9IGZhbHNlO1xuICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgZW1pdENoYW5nZSh7IGVycm9yX21lc3NhZ2U6ICdzaGlwX25vdF9mb3VuZCcsIGVycm9yOiBlcnIgfSk7XG4gICAgfSk7XG4gIH1cblxuICBIdWxsLm9uKCdodWxsLmF1dGgubG9naW4nLCAgb25BdXRoRXZlbnQpO1xuICBIdWxsLm9uKCdodWxsLmF1dGgubG9nb3V0Jywgb25BdXRoRXZlbnQpO1xuICBIdWxsLm9uKCdodWxsLmF1dGguZmFpbCcsIG9uQXV0aEV2ZW50KTtcblxuICB2YXIgX2xpc3RlbmVycyA9IFtdO1xuXG4gIC8vIFB1YmxpYyBBUElcblxuICB0aGlzLm9uQ2hhbmdlID0gZnVuY3Rpb24oY2IpIHtcbiAgICB2YXIgY2FsbGJhY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgY2IuYXBwbHkodW5kZWZpbmVkLCBhcmdzKTtcbiAgICAgIH0pXG4gICAgfTtcbiAgICBfbGlzdGVuZXJzLnB1c2goY2FsbGJhY2spO1xuICAgIEh1bGwub24oQ0hBTkdFX0VWRU5ULCBjYWxsYmFjayk7XG4gIH07XG5cbiAgdGhpcy50ZWFyZG93biA9IGZ1bmN0aW9uKCkge1xuICAgIEh1bGwub2ZmKCdodWxsLmF1dGgubG9naW4nLCAgb25BdXRoRXZlbnQpO1xuICAgIEh1bGwub2ZmKCdodWxsLmF1dGgubG9nb3V0Jywgb25BdXRoRXZlbnQpO1xuICAgIEh1bGwub2ZmKCdodWxsLmF1dGguZmFpbCcsIG9uQXV0aEV2ZW50KTtcbiAgICBmb3IgKHZhciBsPTA7IGwgPCBfbGlzdGVuZXJzLmxlbmd0aDsgbCsrKSB7XG4gICAgICBIdWxsLm9mZihDSEFOR0VfRVZFTlQsIGxpc3RlbmVyc1tsXSk7XG4gICAgfVxuICB9O1xuXG4gIHRoaXMuZ2V0U3RhdGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZ2V0QXBwU3RhdGUoKTtcbiAgfTtcblxuICB0aGlzLnBsYXkgICAgICAgICA9IHBsYXk7XG4gIHRoaXMucmVzZXQgICAgICAgID0gcmVzZXQ7XG4gIHRoaXMuc3VibWl0Rm9ybSAgID0gc3VibWl0Rm9ybTtcbiAgdGhpcy50cmFuc2xhdGUgICAgPSB0cmFuc2xhdGU7XG5cbiAgaWYgKFNoaXApIHtcbiAgICBpbml0U3RhdGUoQ3VycmVudFVzZXIsIFNoaXApO1xuICB9XG5cbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgbWVzc2FnZSA9IGUuZGF0YTtcbiAgICBpZiAobWVzc2FnZSAmJiBtZXNzYWdlLmV2ZW50ID09PSBcInNoaXAudXBkYXRlXCIpIHtcbiAgICAgIHVwZGF0ZVNldHRpbmdzKG1lc3NhZ2Uuc2hpcC5zZXR0aW5ncyk7XG4gICAgICB1cGRhdGVUcmFuc2xhdGlvbnMobWVzc2FnZS5zaGlwLnRyYW5zbGF0aW9ucyB8fCB7fSk7XG4gICAgfVxuICB9LCBmYWxzZSk7XG5cbn07XG5cblxuXG5JbnN0YW50V2luLlN0ZXBzID0gU3RlcHM7XG5cbm1vZHVsZS5leHBvcnRzID0gSW5zdGFudFdpbjtcbiIsImFuZ3VsYXIubW9kdWxlKCdzY2hlbWFGb3JtJykuY29uZmlnKFxuWydzY2hlbWFGb3JtUHJvdmlkZXInLCAnc2NoZW1hRm9ybURlY29yYXRvcnNQcm92aWRlcicsICdzZlBhdGhQcm92aWRlcicsXG4gIGZ1bmN0aW9uKHNjaGVtYUZvcm1Qcm92aWRlciwgIHNjaGVtYUZvcm1EZWNvcmF0b3JzUHJvdmlkZXIsIHNmUGF0aFByb3ZpZGVyKSB7XG5cbiAgICB2YXIgZGF0ZXBpY2tlciA9IGZ1bmN0aW9uKG5hbWUsIHNjaGVtYSwgb3B0aW9ucykge1xuICAgICAgaWYgKHNjaGVtYS50eXBlID09PSAnc3RyaW5nJyAmJiAoc2NoZW1hLmZvcm1hdCA9PT0gJ2RhdGUnIHx8IHNjaGVtYS5mb3JtYXQgPT09ICdkYXRlLXRpbWUnKSkge1xuICAgICAgICB2YXIgZiA9IHNjaGVtYUZvcm1Qcm92aWRlci5zdGRGb3JtT2JqKG5hbWUsIHNjaGVtYSwgb3B0aW9ucyk7XG4gICAgICAgIGYua2V5ICA9IG9wdGlvbnMucGF0aDtcbiAgICAgICAgZi50eXBlID0gJ2RhdGVwaWNrZXInO1xuICAgICAgICBvcHRpb25zLmxvb2t1cFtzZlBhdGhQcm92aWRlci5zdHJpbmdpZnkob3B0aW9ucy5wYXRoKV0gPSBmO1xuICAgICAgICByZXR1cm4gZjtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgc2NoZW1hRm9ybVByb3ZpZGVyLmRlZmF1bHRzLnN0cmluZy51bnNoaWZ0KGRhdGVwaWNrZXIpO1xuXG4gICAgLy9BZGQgdG8gdGhlIEZvdW5kYXRpb24gZGlyZWN0aXZlXG4gICAgc2NoZW1hRm9ybURlY29yYXRvcnNQcm92aWRlci5hZGRNYXBwaW5nKFxuICAgICAgJ2ZvdW5kYXRpb25EZWNvcmF0b3InLFxuICAgICAgJ2RhdGVwaWNrZXInLFxuICAgICAgJ2RpcmVjdGl2ZXMvZGVjb3JhdG9ycy9mb3VuZGF0aW9uL2RhdGVwaWNrZXIuaHRtbCdcbiAgICApO1xuICAgIHNjaGVtYUZvcm1EZWNvcmF0b3JzUHJvdmlkZXIuY3JlYXRlRGlyZWN0aXZlKFxuICAgICAgJ2RhdGVwaWNrZXInLFxuICAgICAgJ2RpcmVjdGl2ZXMvZGVjb3JhdG9ycy9mb3VuZGF0aW9uL2RhdGVwaWNrZXIuaHRtbCdcbiAgICApO1xuICB9XG5dKTtcbiIsInJlcXVpcmUoJy4vZm91bmRhdGlvbi1kZWNvcmF0b3ItZGF0ZXBpY2tlcicpO1xuYW5ndWxhci5tb2R1bGUoJ3NjaGVtYUZvcm0nKS5jb25maWcoWydzY2hlbWFGb3JtRGVjb3JhdG9yc1Byb3ZpZGVyJywgZnVuY3Rpb24oZGVjb3JhdG9yc1Byb3ZpZGVyKSB7XG4gIHZhciBiYXNlID0gJ2RpcmVjdGl2ZXMvZGVjb3JhdG9ycy9mb3VuZGF0aW9uLyc7XG5cbiAgZGVjb3JhdG9yc1Byb3ZpZGVyLmNyZWF0ZURlY29yYXRvcignZm91bmRhdGlvbkRlY29yYXRvcicsIHtcbiAgICB0ZXh0YXJlYTogYmFzZSArICd0ZXh0YXJlYS5odG1sJyxcbiAgICBmaWVsZHNldDogYmFzZSArICdmaWVsZHNldC5odG1sJyxcbiAgICBhcnJheTogYmFzZSArICdhcnJheS5odG1sJyxcbiAgICB0YWJhcnJheTogYmFzZSArICd0YWJhcnJheS5odG1sJyxcbiAgICB0YWJzOiBiYXNlICsgJ3RhYnMuaHRtbCcsXG4gICAgc2VjdGlvbjogYmFzZSArICdzZWN0aW9uLmh0bWwnLFxuICAgIGNvbmRpdGlvbmFsOiBiYXNlICsgJ3NlY3Rpb24uaHRtbCcsXG4gICAgYWN0aW9uczogYmFzZSArICdhY3Rpb25zLmh0bWwnLFxuICAgIGRhdGVwaWNrZXI6IGJhc2UgKyAnZGF0ZXBpY2tlci5odG1sJyxcbiAgICBzZWxlY3Q6IGJhc2UgKyAnc2VsZWN0Lmh0bWwnLFxuICAgIGNoZWNrYm94OiBiYXNlICsgJ2NoZWNrYm94Lmh0bWwnLFxuICAgIGNoZWNrYm94ZXM6IGJhc2UgKyAnY2hlY2tib3hlcy5odG1sJyxcbiAgICBudW1iZXI6IGJhc2UgKyAnZGVmYXVsdC5odG1sJyxcbiAgICBwYXNzd29yZDogYmFzZSArICdkZWZhdWx0Lmh0bWwnLFxuICAgIHN1Ym1pdDogYmFzZSArICdzdWJtaXQuaHRtbCcsXG4gICAgYnV0dG9uOiBiYXNlICsgJ3N1Ym1pdC5odG1sJyxcbiAgICByYWRpb3M6IGJhc2UgKyAncmFkaW9zLmh0bWwnLFxuICAgICdyYWRpb3MtaW5saW5lJzogYmFzZSArICdyYWRpb3MtaW5saW5lLmh0bWwnLFxuICAgIHJhZGlvYnV0dG9uczogYmFzZSArICdyYWRpby1idXR0b25zLmh0bWwnLFxuICAgIGhlbHA6IGJhc2UgKyAnaGVscC5odG1sJyxcbiAgICAnZGVmYXVsdCc6IGJhc2UgKyAnZGVmYXVsdC5odG1sJ1xuICB9LCBbXG4gICAgZnVuY3Rpb24oZm9ybSkge1xuICAgICAgaWYgKGZvcm0ucmVhZG9ubHkgJiYgZm9ybS5rZXkgJiYgZm9ybS50eXBlICE9PSAnZmllbGRzZXQnKSB7XG4gICAgICAgIHJldHVybiBiYXNlICsgJ3JlYWRvbmx5Lmh0bWwnO1xuICAgICAgfVxuICAgIH1cbiAgXSwgeyBjbGFzc05hbWU6IFwicm93XCIgfSk7XG5cbiAgLy9tYW51YWwgdXNlIGRpcmVjdGl2ZXNcbiAgZGVjb3JhdG9yc1Byb3ZpZGVyLmNyZWF0ZURpcmVjdGl2ZXMoe1xuICAgIHRleHRhcmVhOiBiYXNlICsgJ3RleHRhcmVhLmh0bWwnLFxuICAgIHNlbGVjdDogYmFzZSArICdzZWxlY3QuaHRtbCcsXG4gICAgY2hlY2tib3g6IGJhc2UgKyAnY2hlY2tib3guaHRtbCcsXG4gICAgY2hlY2tib3hlczogYmFzZSArICdjaGVja2JveGVzLmh0bWwnLFxuICAgIG51bWJlcjogYmFzZSArICdkZWZhdWx0Lmh0bWwnLFxuICAgIHN1Ym1pdDogYmFzZSArICdzdWJtaXQuaHRtbCcsXG4gICAgYnV0dG9uOiBiYXNlICsgJ3N1Ym1pdC5odG1sJyxcbiAgICB0ZXh0OiBiYXNlICsgJ2RlZmF1bHQuaHRtbCcsXG4gICAgZGF0ZTogYmFzZSArICdkZWZhdWx0Lmh0bWwnLFxuICAgIHBhc3N3b3JkOiBiYXNlICsgJ2RlZmF1bHQuaHRtbCcsXG4gICAgZGF0ZXBpY2tlcjogYmFzZSArICdkYXRlcGlja2VyLmh0bWwnLFxuICAgIGlucHV0OiBiYXNlICsgJ2RlZmF1bHQuaHRtbCcsXG4gICAgcmFkaW9zOiBiYXNlICsgJ3JhZGlvcy5odG1sJyxcbiAgICAncmFkaW9zLWlubGluZSc6IGJhc2UgKyAncmFkaW9zLWlubGluZS5odG1sJyxcbiAgICByYWRpb2J1dHRvbnM6IGJhc2UgKyAncmFkaW8tYnV0dG9ucy5odG1sJyxcbiAgfSk7XG5cbn1dKS5kaXJlY3RpdmUoJ3NmRmllbGRzZXQnLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHtcbiAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgIHNjb3BlOiB0cnVlLFxuICAgIHRlbXBsYXRlVXJsOiAnZGlyZWN0aXZlcy9kZWNvcmF0b3JzL2ZvdW5kYXRpb24vZmllbGRzZXQtdHJjbC5odG1sJyxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgIHNjb3BlLnRpdGxlID0gc2NvcGUuJGV2YWwoYXR0cnMudGl0bGUpO1xuICAgIH1cbiAgfTtcbn0pO1xuIiwiZnVuY3Rpb24gaXNPYmplY3Qob2JqKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIG9iajtcbiAgcmV0dXJuIHR5cGUgPT09ICdmdW5jdGlvbicgfHwgdHlwZSA9PT0gJ29iamVjdCcgJiYgISFvYmo7XG59O1xuXG5cbiBmdW5jdGlvbiBleHRlbmQob2JqKSB7XG4gIGlmICghaXNPYmplY3Qob2JqKSkgcmV0dXJuIG9iajtcbiAgdmFyIHNvdXJjZSwgcHJvcDtcbiAgZm9yICh2YXIgaSA9IDEsIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTtcbiAgICBmb3IgKHByb3AgaW4gc291cmNlKSB7XG4gICAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIHByb3ApKSB7XG4gICAgICAgICAgb2JqW3Byb3BdID0gc291cmNlW3Byb3BdO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gb2JqO1xufTtcblxuZnVuY3Rpb24gb21pdChvYmogLyoga2V5cyAqLykge1xuICB2YXIgd2l0aG91dEtleXMgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gIHJldHVybiBvYmogJiYgT2JqZWN0LmtleXMob2JqKS5yZWR1Y2UoZnVuY3Rpb24ocywgaykge1xuICAgIGlmICh3aXRob3V0S2V5cy5pbmRleE9mKGspID09PSAtMSkgc1trXSA9IG9ialtrXVxuICAgIHJldHVybiBzO1xuICB9LCB7fSk7XG59O1xuXG5mdW5jdGlvbiBkZWVwQ2xvbmUob2JqKSB7XG4gIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9iaikpO1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBleHRlbmQ6IGV4dGVuZCxcbiAgb21pdDogb21pdCxcbiAgaXNPYmplY3Q6IGlzT2JqZWN0LFxuICBkZWVwQ2xvbmU6IGRlZXBDbG9uZVxufTtcbiJdfQ==
