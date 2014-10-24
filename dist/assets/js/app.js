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

.controller('InstantWinController',['$scope', '$instant', '$translate',
  function InstantWinController($scope, $instant, $translate) {
    $scope.styles   = {};
    $scope.login    = Hull.login;
    $scope.logout   = Hull.logout;
    $scope.play     = $instant.play;

    $scope.steps = Steps;
    $scope.$instant = $instant;
    $scope.instant  = $instant.getState();

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

},{"./instant":"/Users/sbellity/code/h/instant-win/src/javascript/instant.js","./schema-form/foundation-decorator":"/Users/sbellity/code/h/instant-win/src/javascript/schema-form/foundation-decorator.js","./schema-form/foundation-decorator-datepicker":"/Users/sbellity/code/h/instant-win/src/javascript/schema-form/foundation-decorator-datepicker.js","angular-datepicker/build/angular-datepicker":"/Users/sbellity/code/h/instant-win/node_modules/angular-datepicker/build/angular-datepicker.js","angular-schema-form/dist/schema-form":"/Users/sbellity/code/h/instant-win/node_modules/angular-schema-form/dist/schema-form.js","angular-translate":"/Users/sbellity/code/h/instant-win/node_modules/angular-translate/dist/angular-translate.js","objectpath":"/Users/sbellity/code/h/instant-win/node_modules/objectpath/index.js","tv4":"/Users/sbellity/code/h/instant-win/node_modules/tv4/tv4.js"}],"/Users/sbellity/code/h/instant-win/node_modules/angular-datepicker/build/angular-datepicker.js":[function(require,module,exports){
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
},{}],"/Users/sbellity/code/h/instant-win/node_modules/angular-schema-form/dist/schema-form.js":[function(require,module,exports){
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

},{}],"/Users/sbellity/code/h/instant-win/node_modules/angular-translate/dist/angular-translate.js":[function(require,module,exports){
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

  function translate(lang) {
    var ret = AppState.translations[lang] || AppState.translations['en'] || {};
    var result = Object.keys(ret).reduce(function(tr, k) {
      var t = ret[k];
      if (t && t.length > 0) {
        tr[k] = t;
      }
      return tr;
    }, {});
    console.warn("translations: ", lang, result);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvamF2YXNjcmlwdC9hcHAuanMiLCJub2RlX21vZHVsZXMvYW5ndWxhci1kYXRlcGlja2VyL2J1aWxkL2FuZ3VsYXItZGF0ZXBpY2tlci5qcyIsIm5vZGVfbW9kdWxlcy9hbmd1bGFyLXNjaGVtYS1mb3JtL2Rpc3Qvc2NoZW1hLWZvcm0uanMiLCJub2RlX21vZHVsZXMvYW5ndWxhci10cmFuc2xhdGUvZGlzdC9hbmd1bGFyLXRyYW5zbGF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9vYmplY3RwYXRoL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL29iamVjdHBhdGgvbGliL09iamVjdFBhdGguanMiLCJub2RlX21vZHVsZXMvdHY0L3R2NC5qcyIsInNyYy9qYXZhc2NyaXB0L2luc3RhbnQuanMiLCJzcmMvamF2YXNjcmlwdC9zY2hlbWEtZm9ybS9mb3VuZGF0aW9uLWRlY29yYXRvci1kYXRlcGlja2VyLmpzIiwic3JjL2phdmFzY3JpcHQvc2NoZW1hLWZvcm0vZm91bmRhdGlvbi1kZWNvcmF0b3IuanMiLCJzcmMvamF2YXNjcmlwdC91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3Q0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy83QkE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2psREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgSW5zdGFudFdpbiA9IHJlcXVpcmUoJy4vaW5zdGFudCcpO1xudmFyIFN0ZXBzID0gSW5zdGFudFdpbi5TdGVwcztcbnZhciBkZWZhdWx0U3RlcCA9IFN0ZXBzWzBdO1xuXG53aW5kb3cudHY0ID0gcmVxdWlyZSgndHY0Jyk7XG52YXIgT2JqZWN0UGF0aCA9IHJlcXVpcmUoJ29iamVjdHBhdGgnKTtcblxudHJ5IHtcbiAgYW5ndWxhci5tb2R1bGUoJ09iamVjdFBhdGgnLCBbXSkucHJvdmlkZXIoJ09iamVjdFBhdGgnLCBmdW5jdGlvbigpe1xuICAgIHRoaXMucGFyc2UgPSBPYmplY3RQYXRoLnBhcnNlO1xuICAgIHRoaXMuc3RyaW5naWZ5ID0gT2JqZWN0UGF0aC5zdHJpbmdpZnk7XG4gICAgdGhpcy5ub3JtYWxpemUgPSBPYmplY3RQYXRoLm5vcm1hbGl6ZTtcbiAgICB0aGlzLiRnZXQgPSBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIE9iamVjdFBhdGg7XG4gICAgfTtcbiAgfSk7XG59IGNhdGNoKGUpIHt9XG5cbnJlcXVpcmUoJ2FuZ3VsYXItc2NoZW1hLWZvcm0vZGlzdC9zY2hlbWEtZm9ybScpO1xucmVxdWlyZSgnLi9zY2hlbWEtZm9ybS9mb3VuZGF0aW9uLWRlY29yYXRvcicpO1xucmVxdWlyZSgnLi9zY2hlbWEtZm9ybS9mb3VuZGF0aW9uLWRlY29yYXRvci1kYXRlcGlja2VyJyk7XG5yZXF1aXJlKCdhbmd1bGFyLWRhdGVwaWNrZXIvYnVpbGQvYW5ndWxhci1kYXRlcGlja2VyJyk7XG5yZXF1aXJlKCdhbmd1bGFyLXRyYW5zbGF0ZScpO1xuXG52YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2h1bGwtaW5zdGFudCcsIFsnbmdBbmltYXRlJywgJ3NjaGVtYUZvcm0nLCAnYW5ndWxhci1kYXRlcGlja2VyJywgJ3Bhc2NhbHByZWNodC50cmFuc2xhdGUnXSlcblxuLmNvbmZpZyhbXCIkdHJhbnNsYXRlUHJvdmlkZXJcIiwgZnVuY3Rpb24gKCR0cmFuc2xhdGVQcm92aWRlcikge1xuICAkdHJhbnNsYXRlUHJvdmlkZXIudXNlTG9hZGVyKFwiJHRyYW5zbGF0ZVNoaXBMb2FkZXJcIik7XG4gICR0cmFuc2xhdGVQcm92aWRlci5wcmVmZXJyZWRMYW5ndWFnZShcImVuXCIpO1xufV0pXG5cblxuLmZhY3RvcnkoXCIkaW5zdGFudFwiLCBbXCIkaHVsbEluaXRcIiwgZnVuY3Rpb24oJGh1bGxJbml0KSB7XG4gIHZhciBpbnN0YW50ID0gbmV3IEluc3RhbnRXaW4oJGh1bGxJbml0LnVzZXIsICRodWxsSW5pdC5zaGlwKTtcbiAgd2luZG93LiRpbnN0YW50ID0gaW5zdGFudDtcbiAgcmV0dXJuIGluc3RhbnQ7XG59XSlcblxuLmZhY3RvcnkoXCIkdHJhbnNsYXRlU2hpcExvYWRlclwiLCBbXCIkcVwiLCBcIiRpbnN0YW50XCIsIGZ1bmN0aW9uICgkcSwgJGluc3RhbnQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICBkZWZlcnJlZC5yZXNvbHZlKCRpbnN0YW50LnRyYW5zbGF0ZShvcHRpb25zLmtleSkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xufV0pXG5cbi5kaXJlY3RpdmUoXCJwcm9ncmVzc1wiLCBmdW5jdGlvbigpe1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiBcIkFcIixcbiAgICBzY29wZTogeyBzdGVwOiBcIj1cIiwgc3RlcHM6IFwiPVwiLCBzdGVwSW5kZXg6IFwiPVwiIH0sXG4gICAgdGVtcGxhdGVVcmw6IFwiZGlyZWN0aXZlcy9wcm9ncmVzcy5odG1sXCIsXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlKSB7XG4gICAgICAkc2NvcGUucHJvZ3Jlc3NSYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAxMDAgKiAoJHNjb3BlLnN0ZXBJbmRleCArIDEpIC8gKCRzY29wZS5zdGVwcy5sZW5ndGggKyAxKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59KVxuXG4uZGlyZWN0aXZlKFwic3Bpbm5lclwiLCBmdW5jdGlvbigpe1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiBcIkVBXCIsXG4gICAgc2NvcGU6IHsgc3Bpbm5pbmc6IFwiPVwiIH0sXG4gICAgdGVtcGxhdGVVcmw6IFwiZGlyZWN0aXZlcy9zcGlubmVyLmh0bWxcIlxuICB9O1xufSlcblxuLmNvbnRyb2xsZXIoJ0Zvcm1Db250cm9sbGVyJywgWyckc2NvcGUnLCAnJGluc3RhbnQnLCBmdW5jdGlvbigkc2NvcGUpIHtcbiAgJHNjb3BlLm1vZGVsID0ge307XG4gIHZhciBmaWVsZHMgPSAoJHNjb3BlLmluc3RhbnQuZm9ybSAmJiAkc2NvcGUuaW5zdGFudC5mb3JtLmZpZWxkc19saXN0KSB8fCBbXTtcbiAgYW5ndWxhci5mb3JFYWNoKGZpZWxkcywgZnVuY3Rpb24oZmllbGQpIHtcbiAgICAkc2NvcGUubW9kZWxbZmllbGQubmFtZV0gPSBmaWVsZC52YWx1ZTtcbiAgfSk7XG4gICRzY29wZS5zY2hlbWEgPSAkc2NvcGUuaW5zdGFudC5mb3JtLmZpZWxkc19zY2hlbWE7XG4gICRzY29wZS5mb3JtID0gW1xuICAgIHtcbiAgICAgIFwidHlwZVwiOiBcImZpZWxkc2V0XCIsXG4gICAgICBcInRpdGxlXCIgOiBcIkZvcm1cIixcbiAgICAgIFwiaXRlbXNcIiA6IFsgXCIqXCIgXSxcbiAgICB9LFxuICAgIHsgXCJ0eXBlXCI6IFwic3VibWl0XCIsIFwidGl0bGVcIjogXCJTYXZlXCIgfVxuICBdO1xuXG4gICRzY29wZS5vblN1Ym1pdCA9IGZ1bmN0aW9uKGZvcm0pIHtcbiAgICAvLyBGaXJzdCB3ZSBicm9hZGNhc3QgYW4gZXZlbnQgc28gYWxsIGZpZWxkcyB2YWxpZGF0ZSB0aGVtc2VsdmVzXG4gICAgJHNjb3BlLiRicm9hZGNhc3QoJ3NjaGVtYUZvcm1WYWxpZGF0ZScpO1xuXG4gICAgLy8gVGhlbiB3ZSBjaGVjayBpZiB0aGUgZm9ybSBpcyB2YWxpZFxuICAgIGlmIChmb3JtLiR2YWxpZCkge1xuICAgICAgJGluc3RhbnQuc3VibWl0Rm9ybSgkc2NvcGUubW9kZWwpO1xuICAgIH1cbiAgfVxufV0pXG5cbi5jb250cm9sbGVyKCdJbnN0YW50V2luQ29udHJvbGxlcicsWyckc2NvcGUnLCAnJGluc3RhbnQnLCAnJHRyYW5zbGF0ZScsXG4gIGZ1bmN0aW9uIEluc3RhbnRXaW5Db250cm9sbGVyKCRzY29wZSwgJGluc3RhbnQsICR0cmFuc2xhdGUpIHtcbiAgICAkc2NvcGUuc3R5bGVzICAgPSB7fTtcbiAgICAkc2NvcGUubG9naW4gICAgPSBIdWxsLmxvZ2luO1xuICAgICRzY29wZS5sb2dvdXQgICA9IEh1bGwubG9nb3V0O1xuICAgICRzY29wZS5wbGF5ICAgICA9ICRpbnN0YW50LnBsYXk7XG5cbiAgICAkc2NvcGUuc3RlcHMgPSBTdGVwcztcbiAgICAkc2NvcGUuJGluc3RhbnQgPSAkaW5zdGFudDtcbiAgICAkc2NvcGUuaW5zdGFudCAgPSAkaW5zdGFudC5nZXRTdGF0ZSgpO1xuXG4gICAgZnVuY3Rpb24gc2V0U3R5bGVzKHNldHRpbmdzKSB7XG4gICAgICB2YXIgc3R5bGVzID0ge307XG4gICAgICBhbmd1bGFyLmZvckVhY2goc2V0dGluZ3MuaW1hZ2VzLCBmdW5jdGlvbihpbWcsIHRhcmdldCkge1xuICAgICAgICBpZiAoaW1nKSB7XG4gICAgICAgICAgc3R5bGVzW3RhcmdldF0gPSBzdHlsZXNbdGFyZ2V0XSB8fCB7fTtcbiAgICAgICAgICBzdHlsZXNbdGFyZ2V0XS5iYWNrZ3JvdW5kSW1hZ2UgPSAndXJsKCcgKyBpbWcgKyAnKSc7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgJHNjb3BlLnN0eWxlcyA9IHN0eWxlcztcbiAgICB9XG5cbiAgICBzZXRTdHlsZXMoJHNjb3BlLmluc3RhbnQuc2V0dGluZ3MpO1xuXG5cbiAgICBmdW5jdGlvbiBvbkNoYW5nZShpbnN0YW50KSB7XG4gICAgICAkc2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xuICAgICAgICAkc2NvcGUuaW5zdGFudCA9IGluc3RhbnQ7XG4gICAgICAgIHNldFN0eWxlcyhpbnN0YW50LnNldHRpbmdzKTtcbiAgICAgICAgJHRyYW5zbGF0ZS5yZWZyZXNoKCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAkaW5zdGFudC5vbkNoYW5nZShvbkNoYW5nZSk7XG4gIH1cbl0pO1xuXG5cbkh1bGwucmVhZHkoZnVuY3Rpb24oXywgY3VycmVudFVzZXIsIHNoaXAsIG9yZykge1xuICB2YXIgSHVsbEluaXQgPSB7XG4gICAgdXNlcjogY3VycmVudFVzZXIsXG4gICAgc2hpcDogc2hpcCxcbiAgICBvcmc6IG9yZ1xuICB9O1xuICBhcHAudmFsdWUoJyRodWxsSW5pdCcsIEh1bGxJbml0KTtcbiAgYW5ndWxhci5ib290c3RyYXAoZG9jdW1lbnQsIFsnaHVsbC1pbnN0YW50J10pO1xufSk7XG4iLCIvKiFcbiAqIHBpY2thZGF0ZS5qcyB2My40LjAsIDIwMTQvMDIvMTVcbiAqIEJ5IEFtc3VsLCBodHRwOi8vYW1zdWwuY2FcbiAqIEhvc3RlZCBvbiBodHRwOi8vYW1zdWwuZ2l0aHViLmlvL3BpY2thZGF0ZS5qc1xuICogTGljZW5zZWQgdW5kZXIgTUlUXG4gKi9cbiFmdW5jdGlvbihhKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwicGlja2VyXCIsW1wiYW5ndWxhclwiXSxhKTp0aGlzLlBpY2tlcj1hKGFuZ3VsYXIpfShmdW5jdGlvbihhKXtmdW5jdGlvbiBiKGEsZCxlLGcpe2Z1bmN0aW9uIGgoKXtyZXR1cm4gYi5fLm5vZGUoXCJkaXZcIixiLl8ubm9kZShcImRpdlwiLGIuXy5ub2RlKFwiZGl2XCIsYi5fLm5vZGUoXCJkaXZcIixyLmNvbXBvbmVudC5ub2RlcyhvLm9wZW4pLG4uYm94KSxuLndyYXApLG4uZnJhbWUpLG4uaG9sZGVyKX1mdW5jdGlvbiBpKCl7cC5kYXRhKGQscikscC5hZGRDbGFzcyhuLmlucHV0KSxwWzBdLnZhbHVlPXAuYXR0cihcImRhdGEtdmFsdWVcIik/ci5nZXQoXCJzZWxlY3RcIixtLmZvcm1hdCk6YS52YWx1ZSxhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIiNcIitvLmlkKSkub24oXCJmb2N1c1wiLGwpLGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiI1wiK28uaWQpKS5vbihcImNsaWNrXCIsbCksbS5lZGl0YWJsZXx8YW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIjXCIrby5pZCkpLm9uKFwia2V5ZG93blwiLGZ1bmN0aW9uKGEpe3ZhciBiPWEua2V5Q29kZSxjPS9eKDh8NDYpJC8udGVzdChiKTtyZXR1cm4gMjc9PWI/KHIuY2xvc2UoKSwhMSk6dm9pZCgoMzI9PWJ8fGN8fCFvLm9wZW4mJnIuY29tcG9uZW50LmtleVtiXSkmJihhLnByZXZlbnREZWZhdWx0KCksYS5zdG9wUHJvcGFnYXRpb24oKSxjP3IuY2xlYXIoKS5jbG9zZSgpOnIub3BlbigpKSl9KSxjKGEse2hhc3BvcHVwOiEwLGV4cGFuZGVkOiExLHJlYWRvbmx5OiExLG93bnM6YS5pZCtcIl9yb290XCIrKHIuX2hpZGRlbj9cIiBcIityLl9oaWRkZW4uaWQ6XCJcIil9KX1mdW5jdGlvbiBqKCl7ZnVuY3Rpb24gZCgpe2FuZ3VsYXIuZWxlbWVudChyLiRyb290WzBdLnF1ZXJ5U2VsZWN0b3JBbGwoXCJbZGF0YS1waWNrXSwgW2RhdGEtbmF2XSwgW2RhdGEtY2xlYXJdXCIpKS5vbihcImNsaWNrXCIsZnVuY3Rpb24oKXt2YXIgYz1hbmd1bGFyLmVsZW1lbnQodGhpcyksZT1jLmhhc0NsYXNzKG4ubmF2RGlzYWJsZWQpfHxjLmhhc0NsYXNzKG4uZGlzYWJsZWQpLGY9ZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtmPWYmJihmLnR5cGV8fGYuaHJlZikmJmYsKGV8fGYmJiFyLiRyb290WzBdLmNvbnRhaW5zKGYpKSYmYS5mb2N1cygpLGMuYXR0cihcImRhdGEtbmF2XCIpJiYhZT8oci5zZXQoXCJoaWdobGlnaHRcIixyLmNvbXBvbmVudC5pdGVtLmhpZ2hsaWdodCx7bmF2OnBhcnNlSW50KGMuYXR0cihcImRhdGEtbmF2XCIpKX0pLGQoKSk6Yi5fLmlzSW50ZWdlcihwYXJzZUludChjLmF0dHIoXCJkYXRhLXBpY2tcIikpKSYmIWU/KHIuc2V0KFwic2VsZWN0XCIscGFyc2VJbnQoYy5hdHRyKFwiZGF0YS1waWNrXCIpKSkuY2xvc2UoITApLGQoKSk6Yy5hdHRyKFwiZGF0YS1jbGVhclwiKSYmKHIuY2xlYXIoKS5jbG9zZSghMCksZCgpKX0pfXIuJHJvb3Qub24oXCJmb2N1c2luXCIsZnVuY3Rpb24oYSl7ci4kcm9vdC5yZW1vdmVDbGFzcyhuLmZvY3VzZWQpLGMoci4kcm9vdFswXSxcInNlbGVjdGVkXCIsITEpLGEuc3RvcFByb3BhZ2F0aW9uKCl9KSxyLiRyb290Lm9uKFwibW91c2Vkb3duIGNsaWNrXCIsZnVuY3Rpb24oYil7dmFyIGM9Yi50YXJnZXQ7YyE9ci4kcm9vdC5jaGlsZHJlbigpWzBdJiYoYi5zdG9wUHJvcGFnYXRpb24oKSxcIm1vdXNlZG93blwiPT1iLnR5cGUmJlwiaW5wdXRcIiE9PWFuZ3VsYXIuZWxlbWVudChjKVswXS50YWdOYW1lJiZcIk9QVElPTlwiIT1jLm5vZGVOYW1lJiYoYi5wcmV2ZW50RGVmYXVsdCgpLGEuZm9jdXMoKSkpfSksZCgpLGMoci4kcm9vdFswXSxcImhpZGRlblwiLCEwKX1mdW5jdGlvbiBrKCl7dmFyIGI9W1wic3RyaW5nXCI9PXR5cGVvZiBtLmhpZGRlblByZWZpeD9tLmhpZGRlblByZWZpeDpcIlwiLFwic3RyaW5nXCI9PXR5cGVvZiBtLmhpZGRlblN1ZmZpeD9tLmhpZGRlblN1ZmZpeDpcIl9zdWJtaXRcIl07ci5faGlkZGVuPWFuZ3VsYXIuZWxlbWVudCgnPGlucHV0IHR5cGU9aGlkZGVuIG5hbWU9XCInK2JbMF0rYS5uYW1lK2JbMV0rJ1wiaWQ9XCInK2JbMF0rYS5pZCtiWzFdKydcIicrKHAuYXR0cihcImRhdGEtdmFsdWVcIil8fGEudmFsdWU/JyB2YWx1ZT1cIicrci5nZXQoXCJzZWxlY3RcIixtLmZvcm1hdFN1Ym1pdCkrJ1wiJzpcIlwiKStcIj5cIilbMF0scC5vbihcImNoYW5nZS5cIitvLmlkLGZ1bmN0aW9uKCl7ci5faGlkZGVuLnZhbHVlPWEudmFsdWU/ci5nZXQoXCJzZWxlY3RcIixtLmZvcm1hdFN1Ym1pdCk6XCJcIn0pLmFmdGVyKHIuX2hpZGRlbil9ZnVuY3Rpb24gbChhKXthLnN0b3BQcm9wYWdhdGlvbigpLFwiZm9jdXNcIj09YS50eXBlJiYoci4kcm9vdC5hZGRDbGFzcyhuLmZvY3VzZWQpLGMoci4kcm9vdFswXSxcInNlbGVjdGVkXCIsITApKSxyLm9wZW4oKX1pZighYSlyZXR1cm4gYjt2YXIgbTtlPyhtPWUuZGVmYXVsdHMsYW5ndWxhci5leHRlbmQobSxnKSk6bT1nfHx7fTt2YXIgbj1iLmtsYXNzZXMoKTthbmd1bGFyLmV4dGVuZChuLG0ua2xhc3MpO3ZhciBvPXtpZDphLmlkfHxcIlBcIitNYXRoLmFicyh+fihNYXRoLnJhbmRvbSgpKm5ldyBEYXRlKSl9LHA9YW5ndWxhci5lbGVtZW50KGEpLHE9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5zdGFydCgpfSxyPXEucHJvdG90eXBlPXtjb25zdHJ1Y3RvcjpxLCRub2RlOnAsc3RhcnQ6ZnVuY3Rpb24oKXtyZXR1cm4gbyYmby5zdGFydD9yOihvLm1ldGhvZHM9e30sby5zdGFydD0hMCxvLm9wZW49ITEsby50eXBlPWEudHlwZSxhLmF1dG9mb2N1cz1hPT1kb2N1bWVudC5hY3RpdmVFbGVtZW50LGEudHlwZT1cInRleHRcIixhLnJlYWRPbmx5PSFtLmVkaXRhYmxlLGEuaWQ9YS5pZHx8by5pZCxyLmNvbXBvbmVudD1uZXcgZShyLG0pLHIuJHJvb3Q9YW5ndWxhci5lbGVtZW50KGIuXy5ub2RlKFwiZGl2XCIsaCgpLG4ucGlja2VyLCdpZD1cIicrYS5pZCsnX3Jvb3RcIicpKSxqKCksbS5mb3JtYXRTdWJtaXQmJmsoKSxpKCksbS5jb250YWluZXI/YW5ndWxhci5lbGVtZW50KG0uY29udGFpbmVyKS5hcHBlbmQoci4kcm9vdCk6cC5hZnRlcihyLiRyb290KSxyLm9uKHtzdGFydDpyLmNvbXBvbmVudC5vblN0YXJ0LHJlbmRlcjpyLmNvbXBvbmVudC5vblJlbmRlcixzdG9wOnIuY29tcG9uZW50Lm9uU3RvcCxvcGVuOnIuY29tcG9uZW50Lm9uT3BlbixjbG9zZTpyLmNvbXBvbmVudC5vbkNsb3NlLHNldDpyLmNvbXBvbmVudC5vblNldH0pLm9uKHtzdGFydDptLm9uU3RhcnQscmVuZGVyOm0ub25SZW5kZXIsc3RvcDptLm9uU3RvcCxvcGVuOm0ub25PcGVuLGNsb3NlOm0ub25DbG9zZSxzZXQ6bS5vblNldH0pLGEuYXV0b2ZvY3VzJiZyLm9wZW4oKSxyLnRyaWdnZXIoXCJzdGFydFwiKS50cmlnZ2VyKFwicmVuZGVyXCIpKX0scmVuZGVyOmZ1bmN0aW9uKGEpe3JldHVybiBhP3IuJHJvb3QuaHRtbChoKCkpOmFuZ3VsYXIuZWxlbWVudChyLiRyb290WzBdLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuXCIrbi5ib3gpKS5odG1sKHIuY29tcG9uZW50Lm5vZGVzKG8ub3BlbikpLHIudHJpZ2dlcihcInJlbmRlclwiKX0sc3RvcDpmdW5jdGlvbigpe3JldHVybiBvLnN0YXJ0PyhyLmNsb3NlKCksci5faGlkZGVuJiZyLl9oaWRkZW4ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChyLl9oaWRkZW4pLHIuJHJvb3QucmVtb3ZlKCkscC5yZW1vdmVDbGFzcyhuLmlucHV0KS5yZW1vdmVEYXRhKGQpLHNldFRpbWVvdXQoZnVuY3Rpb24oKXtwLm9mZihcIi5cIitvLmlkKX0sMCksYS50eXBlPW8udHlwZSxhLnJlYWRPbmx5PSExLHIudHJpZ2dlcihcInN0b3BcIiksby5tZXRob2RzPXt9LG8uc3RhcnQ9ITEscik6cn0sb3BlbjpmdW5jdGlvbihkKXtyZXR1cm4gby5vcGVuP3I6KHAuYWRkQ2xhc3Mobi5hY3RpdmUpLGMoYSxcImV4cGFuZGVkXCIsITApLHIuJHJvb3QuYWRkQ2xhc3Mobi5vcGVuZWQpLGMoci4kcm9vdFswXSxcImhpZGRlblwiLCExKSxkIT09ITEmJihvLm9wZW49ITAscC50cmlnZ2VySGFuZGxlcihcImZvY3VzXCIpLGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiI1wiK28uaWQpKS5vbihcImNsaWNrIGZvY3VzaW5cIixmdW5jdGlvbihiKXt2YXIgYz1iLnRhcmdldDtjIT1hJiZjIT1kb2N1bWVudCYmMyE9Yi53aGljaCYmci5jbG9zZShjPT09ci4kcm9vdC5jaGlsZHJlbigpWzBdKX0pLGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiI1wiK28uaWQpKS5vbihcImtleWRvd25cIixmdW5jdGlvbihjKXt2YXIgZD1jLmtleUNvZGUsZT1yLmNvbXBvbmVudC5rZXlbZF0sZj1jLnRhcmdldDsyNz09ZD9yLmNsb3NlKCEwKTpmIT1hfHwhZSYmMTMhPWQ/ci4kcm9vdFswXS5jb250YWlucyhmKSYmMTM9PWQmJihjLnByZXZlbnREZWZhdWx0KCksZi5jbGljaygpKTooYy5wcmV2ZW50RGVmYXVsdCgpLGU/Yi5fLnRyaWdnZXIoci5jb21wb25lbnQua2V5LmdvLHIsW2IuXy50cmlnZ2VyKGUpXSk6YW5ndWxhci5lbGVtZW50KHIuJHJvb3RbMF0ucXVlcnlTZWxlY3RvckFsbChcIi5cIituLmhpZ2hsaWdodGVkKSkuaGFzQ2xhc3Mobi5kaXNhYmxlZCl8fHIuc2V0KFwic2VsZWN0XCIsci5jb21wb25lbnQuaXRlbS5oaWdobGlnaHQpLmNsb3NlKCkpfSkpLHIudHJpZ2dlcihcIm9wZW5cIikpfSxjbG9zZTpmdW5jdGlvbihiKXtyZXR1cm4gYiYmKHAub2ZmKFwiZm9jdXMuXCIrby5pZCkscC50cmlnZ2VySGFuZGxlcihcImZvY3VzXCIpLHNldFRpbWVvdXQoZnVuY3Rpb24oKXthbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIiNcIitvLmlkKSkub24oXCJmb2N1c1wiLGwpfSwwKSkscC5yZW1vdmVDbGFzcyhuLmFjdGl2ZSksYyhhLFwiZXhwYW5kZWRcIiwhMSksci4kcm9vdC5yZW1vdmVDbGFzcyhuLm9wZW5lZCtcIiBcIituLmZvY3VzZWQpLGMoci4kcm9vdFswXSxcImhpZGRlblwiLCEwKSxjKHIuJHJvb3RbMF0sXCJzZWxlY3RlZFwiLCExKSxvLm9wZW4/KHNldFRpbWVvdXQoZnVuY3Rpb24oKXtvLm9wZW49ITF9LDFlMyksZi5vZmYoXCIuXCIrby5pZCksci50cmlnZ2VyKFwiY2xvc2VcIikpOnJ9LGNsZWFyOmZ1bmN0aW9uKCl7cmV0dXJuIHIuc2V0KFwiY2xlYXJcIil9LHNldDpmdW5jdGlvbihhLGIsYyl7dmFyIGQsZSxmPWFuZ3VsYXIuaXNPYmplY3QoYSksZz1mP2E6e307aWYoYz1mJiZhbmd1bGFyLmlzT2JqZWN0KGIpP2I6Y3x8e30sYSl7Znx8KGdbYV09Yik7Zm9yKGQgaW4gZyllPWdbZF0sZCBpbiByLmNvbXBvbmVudC5pdGVtJiZyLmNvbXBvbmVudC5zZXQoZCxlLGMpLChcInNlbGVjdFwiPT1kfHxcImNsZWFyXCI9PWQpJiYocFswXS52YWx1ZT1cImNsZWFyXCI9PWQ/XCJcIjpyLmdldChkLG0uZm9ybWF0KSxwLnRyaWdnZXJIYW5kbGVyKFwiY2hhbmdlXCIpKTtyLnJlbmRlcigpfXJldHVybiBjLm11dGVkP3I6ci50cmlnZ2VyKFwic2V0XCIsZyl9LGdldDpmdW5jdGlvbihjLGQpe3JldHVybiBjPWN8fFwidmFsdWVcIixudWxsIT1vW2NdP29bY106XCJ2YWx1ZVwiPT1jP2EudmFsdWU6YyBpbiByLmNvbXBvbmVudC5pdGVtP1wic3RyaW5nXCI9PXR5cGVvZiBkP2IuXy50cmlnZ2VyKHIuY29tcG9uZW50LmZvcm1hdHMudG9TdHJpbmcsci5jb21wb25lbnQsW2Qsci5jb21wb25lbnQuZ2V0KGMpXSk6ci5jb21wb25lbnQuZ2V0KGMpOnZvaWQgMH0sb246ZnVuY3Rpb24oYSxiKXt2YXIgYyxkLGU9YW5ndWxhci5pc09iamVjdChhKSxmPWU/YTp7fTtpZihhKXtlfHwoZlthXT1iKTtmb3IoYyBpbiBmKWQ9ZltjXSxvLm1ldGhvZHNbY109by5tZXRob2RzW2NdfHxbXSxvLm1ldGhvZHNbY10ucHVzaChkKX1yZXR1cm4gcn0sb2ZmOmZ1bmN0aW9uKCl7dmFyIGEsYixjPWFyZ3VtZW50cztmb3IoYT0wLG5hbWVzQ291bnQ9Yy5sZW5ndGg7bmFtZXNDb3VudD5hO2ErPTEpYj1jW2FdLGIgaW4gby5tZXRob2RzJiZkZWxldGUgby5tZXRob2RzW2JdO3JldHVybiByfSx0cmlnZ2VyOmZ1bmN0aW9uKGEsYyl7dmFyIGQ9by5tZXRob2RzW2FdO3JldHVybiBkJiZkLm1hcChmdW5jdGlvbihhKXtiLl8udHJpZ2dlcihhLHIsW2NdKX0pLHJ9fTtyZXR1cm4gbmV3IHF9ZnVuY3Rpb24gYyhhLGIsYyl7aWYoYW5ndWxhci5pc09iamVjdChiKSlmb3IodmFyIGUgaW4gYilkKGEsZSxiW2VdKTtlbHNlIGQoYSxiLGMpfWZ1bmN0aW9uIGQoYSxiLGMpe2FuZ3VsYXIuZWxlbWVudChhKS5hdHRyKChcInJvbGVcIj09Yj9cIlwiOlwiYXJpYS1cIikrYixjKX1mdW5jdGlvbiBlKGEsYil7YW5ndWxhci5pc09iamVjdChhKXx8KGE9e2F0dHJpYnV0ZTpifSksYj1cIlwiO2Zvcih2YXIgYyBpbiBhKXt2YXIgZD0oXCJyb2xlXCI9PWM/XCJcIjpcImFyaWEtXCIpK2MsZT1hW2NdO2IrPW51bGw9PWU/XCJcIjpkKyc9XCInK2FbY10rJ1wiJ31yZXR1cm4gYn12YXIgZj1hbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQpO3JldHVybiBiLmtsYXNzZXM9ZnVuY3Rpb24oYSl7cmV0dXJuIGE9YXx8XCJwaWNrZXJcIix7cGlja2VyOmEsb3BlbmVkOmErXCItLW9wZW5lZFwiLGZvY3VzZWQ6YStcIi0tZm9jdXNlZFwiLGlucHV0OmErXCJfX2lucHV0XCIsYWN0aXZlOmErXCJfX2lucHV0LS1hY3RpdmVcIixob2xkZXI6YStcIl9faG9sZGVyXCIsZnJhbWU6YStcIl9fZnJhbWVcIix3cmFwOmErXCJfX3dyYXBcIixib3g6YStcIl9fYm94XCJ9fSxiLl89e2dyb3VwOmZ1bmN0aW9uKGEpe2Zvcih2YXIgYyxkPVwiXCIsZT1iLl8udHJpZ2dlcihhLm1pbixhKTtlPD1iLl8udHJpZ2dlcihhLm1heCxhLFtlXSk7ZSs9YS5pKWM9Yi5fLnRyaWdnZXIoYS5pdGVtLGEsW2VdKSxkKz1iLl8ubm9kZShhLm5vZGUsY1swXSxjWzFdLGNbMl0pO3JldHVybiBkfSxub2RlOmZ1bmN0aW9uKGIsYyxkLGUpe3JldHVybiBjPyhjPWEuaXNBcnJheShjKT9jLmpvaW4oXCJcIik6YyxkPWQ/JyBjbGFzcz1cIicrZCsnXCInOlwiXCIsZT1lP1wiIFwiK2U6XCJcIixcIjxcIitiK2QrZStcIj5cIitjK1wiPC9cIitiK1wiPlwiKTpcIlwifSxsZWFkOmZ1bmN0aW9uKGEpe3JldHVybigxMD5hP1wiMFwiOlwiXCIpK2F9LHRyaWdnZXI6ZnVuY3Rpb24oYSxiLGMpe3JldHVyblwiZnVuY3Rpb25cIj09dHlwZW9mIGE/YS5hcHBseShiLGN8fFtdKTphfSxkaWdpdHM6ZnVuY3Rpb24oYSl7cmV0dXJuL1xcZC8udGVzdChhWzFdKT8yOjF9LGlzRGF0ZTpmdW5jdGlvbihhKXtyZXR1cm57fS50b1N0cmluZy5jYWxsKGEpLmluZGV4T2YoXCJEYXRlXCIpPi0xJiZ0aGlzLmlzSW50ZWdlcihhLmdldERhdGUoKSl9LGlzSW50ZWdlcjpmdW5jdGlvbihhKXtyZXR1cm57fS50b1N0cmluZy5jYWxsKGEpLmluZGV4T2YoXCJOdW1iZXJcIik+LTEmJmElMT09PTB9LGFyaWFBdHRyOmV9LGIuZXh0ZW5kPWZ1bmN0aW9uKGEsYyl7YW5ndWxhci5lbGVtZW50LnByb3RvdHlwZVthXT1mdW5jdGlvbihkLGUpe3ZhciBmPXRoaXMuZGF0YShhKTtpZihcInBpY2tlclwiPT1kKXJldHVybiBmO2lmKGYmJlwic3RyaW5nXCI9PXR5cGVvZiBkKXJldHVybiBiLl8udHJpZ2dlcihmW2RdLGYsW2VdKSx0aGlzO2Zvcih2YXIgZz0wO2c8dGhpcy5sZW5ndGg7ZysrKXt2YXIgaD1hbmd1bGFyLmVsZW1lbnQodGhpc1tnXSk7aC5kYXRhKGEpfHxuZXcgYihoWzBdLGEsYyxkKX19LGFuZ3VsYXIuZWxlbWVudC5wcm90b3R5cGVbYV0uZGVmYXVsdHM9Yy5kZWZhdWx0c30sYn0pO1xuLyohXG4gKiBEYXRlIHBpY2tlciBmb3IgcGlja2FkYXRlLmpzIHYzLjQuMFxuICogaHR0cDovL2Ftc3VsLmdpdGh1Yi5pby9waWNrYWRhdGUuanMvZGF0ZS5odG1cbiAqL1xuIWZ1bmN0aW9uKGEpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoW1wicGlja2VyXCIsXCJhbmd1bGFyXCJdLGEpOmEoUGlja2VyLGFuZ3VsYXIpfShmdW5jdGlvbihhLGIpe2Z1bmN0aW9uIGMoYSxjKXt2YXIgZD10aGlzLGU9YS4kbm9kZVswXS52YWx1ZSxmPWEuJG5vZGUuYXR0cihcImRhdGEtdmFsdWVcIiksZz1mfHxlLGg9Zj9jLmZvcm1hdFN1Ym1pdDpjLmZvcm1hdCxpPWZ1bmN0aW9uKCl7cmV0dXJuXCJydGxcIj09PWdldENvbXB1dGVkU3R5bGUoYS4kcm9vdFswXSkuZGlyZWN0aW9ufTtkLnNldHRpbmdzPWMsZC4kbm9kZT1hLiRub2RlLGQucXVldWU9e21pbjpcIm1lYXN1cmUgY3JlYXRlXCIsbWF4OlwibWVhc3VyZSBjcmVhdGVcIixub3c6XCJub3cgY3JlYXRlXCIsc2VsZWN0OlwicGFyc2UgY3JlYXRlIHZhbGlkYXRlXCIsaGlnaGxpZ2h0OlwicGFyc2UgbmF2aWdhdGUgY3JlYXRlIHZhbGlkYXRlXCIsdmlldzpcInBhcnNlIGNyZWF0ZSB2YWxpZGF0ZSB2aWV3c2V0XCIsZGlzYWJsZTpcImRlYWN0aXZhdGVcIixlbmFibGU6XCJhY3RpdmF0ZVwifSxkLml0ZW09e30sZC5pdGVtLmRpc2FibGU9KGMuZGlzYWJsZXx8W10pLnNsaWNlKDApLGQuaXRlbS5lbmFibGU9LWZ1bmN0aW9uKGEpe3JldHVybiBhWzBdPT09ITA/YS5zaGlmdCgpOi0xfShkLml0ZW0uZGlzYWJsZSksZC5zZXQoXCJtaW5cIixjLm1pbikuc2V0KFwibWF4XCIsYy5tYXgpLnNldChcIm5vd1wiKSxnP2Quc2V0KFwic2VsZWN0XCIsZyx7Zm9ybWF0OmgsZnJvbVZhbHVlOiEhZX0pOmQuc2V0KFwic2VsZWN0XCIsbnVsbCkuc2V0KFwiaGlnaGxpZ2h0XCIsZC5pdGVtLm5vdyksZC5rZXk9ezQwOjcsMzg6LTcsMzk6ZnVuY3Rpb24oKXtyZXR1cm4gaSgpPy0xOjF9LDM3OmZ1bmN0aW9uKCl7cmV0dXJuIGkoKT8xOi0xfSxnbzpmdW5jdGlvbihhKXt2YXIgYj1kLml0ZW0uaGlnaGxpZ2h0LGM9bmV3IERhdGUoYi55ZWFyLGIubW9udGgsYi5kYXRlK2EpO2Quc2V0KFwiaGlnaGxpZ2h0XCIsW2MuZ2V0RnVsbFllYXIoKSxjLmdldE1vbnRoKCksYy5nZXREYXRlKCldLHtpbnRlcnZhbDphfSksdGhpcy5yZW5kZXIoKX19LGEub24oXCJyZW5kZXJcIixmdW5jdGlvbigpe2IuZWxlbWVudChhLiRyb290WzBdLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuXCIrYy5rbGFzcy5zZWxlY3RNb250aCkpLm9uKFwiY2hhbmdlXCIsZnVuY3Rpb24oKXt2YXIgZD10aGlzLnZhbHVlO2QmJihhLnNldChcImhpZ2hsaWdodFwiLFthLmdldChcInZpZXdcIikueWVhcixkLGEuZ2V0KFwiaGlnaGxpZ2h0XCIpLmRhdGVdKSxiLmVsZW1lbnQoYS4kcm9vdFswXS5xdWVyeVNlbGVjdG9yQWxsKFwiLlwiK2Mua2xhc3Muc2VsZWN0TW9udGgpKS50cmlnZ2VySGFuZGxlcihcImZvY3VzXCIpKX0pLGIuZWxlbWVudChhLiRyb290WzBdLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuXCIrYy5rbGFzcy5zZWxlY3RZZWFyKSkub24oXCJjaGFuZ2VcIixmdW5jdGlvbigpe3ZhciBkPXRoaXMudmFsdWU7ZCYmKGEuc2V0KFwiaGlnaGxpZ2h0XCIsW2QsYS5nZXQoXCJ2aWV3XCIpLm1vbnRoLGEuZ2V0KFwiaGlnaGxpZ2h0XCIpLmRhdGVdKSxiLmVsZW1lbnQoYS4kcm9vdFswXS5xdWVyeVNlbGVjdG9yQWxsKFwiLlwiK2Mua2xhc3Muc2VsZWN0WWVhcikpLnRyaWdnZXJIYW5kbGVyKFwiZm9jdXNcIikpfSl9KS5vbihcIm9wZW5cIixmdW5jdGlvbigpe2IuZWxlbWVudChhLiRyb290WzBdLnF1ZXJ5U2VsZWN0b3JBbGwoXCJidXR0b24sIHNlbGVjdFwiKSkuYXR0cihcImRpc2FibGVkXCIsITEpfSkub24oXCJjbG9zZVwiLGZ1bmN0aW9uKCl7Yi5lbGVtZW50KGEuJHJvb3RbMF0ucXVlcnlTZWxlY3RvckFsbChcImJ1dHRvbiwgc2VsZWN0XCIpKS5hdHRyKFwiZGlzYWJsZWRcIiwhMCl9KX12YXIgZD03LGU9NixmPWEuXztjLnByb3RvdHlwZS5zZXQ9ZnVuY3Rpb24oYSxiLGMpe3ZhciBkPXRoaXMsZT1kLml0ZW07cmV0dXJuIG51bGw9PT1iPyhlW2FdPWIsZCk6KGVbXCJlbmFibGVcIj09YT9cImRpc2FibGVcIjpcImZsaXBcIj09YT9cImVuYWJsZVwiOmFdPWQucXVldWVbYV0uc3BsaXQoXCIgXCIpLm1hcChmdW5jdGlvbihlKXtyZXR1cm4gYj1kW2VdKGEsYixjKX0pLnBvcCgpLFwic2VsZWN0XCI9PWE/ZC5zZXQoXCJoaWdobGlnaHRcIixlLnNlbGVjdCxjKTpcImhpZ2hsaWdodFwiPT1hP2Quc2V0KFwidmlld1wiLGUuaGlnaGxpZ2h0LGMpOmEubWF0Y2goL14oZmxpcHxtaW58bWF4fGRpc2FibGV8ZW5hYmxlKSQvKSYmKGUuc2VsZWN0JiZkLmRpc2FibGVkKGUuc2VsZWN0KSYmZC5zZXQoXCJzZWxlY3RcIixlLnNlbGVjdCxjKSxlLmhpZ2hsaWdodCYmZC5kaXNhYmxlZChlLmhpZ2hsaWdodCkmJmQuc2V0KFwiaGlnaGxpZ2h0XCIsZS5oaWdobGlnaHQsYykpLGQpfSxjLnByb3RvdHlwZS5nZXQ9ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuaXRlbVthXX0sYy5wcm90b3R5cGUuY3JlYXRlPWZ1bmN0aW9uKGEsYyxkKXt2YXIgZSxnPXRoaXM7cmV0dXJuIGM9dm9pZCAwPT09Yz9hOmMsYz09LTEvMHx8MS8wPT1jP2U9YzpiLmlzT2JqZWN0KGMpJiZmLmlzSW50ZWdlcihjLnBpY2spP2M9Yy5vYmo6Yi5pc0FycmF5KGMpPyhjPW5ldyBEYXRlKGNbMF0sY1sxXSxjWzJdKSxjPWYuaXNEYXRlKGMpP2M6Zy5jcmVhdGUoKS5vYmopOmM9Zi5pc0ludGVnZXIoYyl8fGYuaXNEYXRlKGMpP2cubm9ybWFsaXplKG5ldyBEYXRlKGMpLGQpOmcubm93KGEsYyxkKSx7eWVhcjplfHxjLmdldEZ1bGxZZWFyKCksbW9udGg6ZXx8Yy5nZXRNb250aCgpLGRhdGU6ZXx8Yy5nZXREYXRlKCksZGF5OmV8fGMuZ2V0RGF5KCksb2JqOmV8fGMscGljazplfHxjLmdldFRpbWUoKX19LGMucHJvdG90eXBlLmNyZWF0ZVJhbmdlPWZ1bmN0aW9uKGEsYyl7dmFyIGQ9dGhpcyxlPWZ1bmN0aW9uKGEpe3JldHVybiBhPT09ITB8fGIuaXNBcnJheShhKXx8Zi5pc0RhdGUoYSk/ZC5jcmVhdGUoYSk6YX07cmV0dXJuIGYuaXNJbnRlZ2VyKGEpfHwoYT1lKGEpKSxmLmlzSW50ZWdlcihjKXx8KGM9ZShjKSksZi5pc0ludGVnZXIoYSkmJmIuaXNPYmplY3QoYyk/YT1bYy55ZWFyLGMubW9udGgsYy5kYXRlK2FdOmYuaXNJbnRlZ2VyKGMpJiZiLmlzT2JqZWN0KGEpJiYoYz1bYS55ZWFyLGEubW9udGgsYS5kYXRlK2NdKSx7ZnJvbTplKGEpLHRvOmUoYyl9fSxjLnByb3RvdHlwZS53aXRoaW5SYW5nZT1mdW5jdGlvbihhLGIpe3JldHVybiBhPXRoaXMuY3JlYXRlUmFuZ2UoYS5mcm9tLGEudG8pLGIucGljaz49YS5mcm9tLnBpY2smJmIucGljazw9YS50by5waWNrfSxjLnByb3RvdHlwZS5vdmVybGFwUmFuZ2VzPWZ1bmN0aW9uKGEsYil7dmFyIGM9dGhpcztyZXR1cm4gYT1jLmNyZWF0ZVJhbmdlKGEuZnJvbSxhLnRvKSxiPWMuY3JlYXRlUmFuZ2UoYi5mcm9tLGIudG8pLGMud2l0aGluUmFuZ2UoYSxiLmZyb20pfHxjLndpdGhpblJhbmdlKGEsYi50byl8fGMud2l0aGluUmFuZ2UoYixhLmZyb20pfHxjLndpdGhpblJhbmdlKGIsYS50byl9LGMucHJvdG90eXBlLm5vdz1mdW5jdGlvbihhLGIsYyl7cmV0dXJuIGI9bmV3IERhdGUsYyYmYy5yZWwmJmIuc2V0RGF0ZShiLmdldERhdGUoKStjLnJlbCksdGhpcy5ub3JtYWxpemUoYixjKX0sYy5wcm90b3R5cGUubmF2aWdhdGU9ZnVuY3Rpb24oYSxjLGQpe3ZhciBlLGYsZyxoLGk9Yi5pc0FycmF5KGMpLGo9Yi5pc09iamVjdChjKSxrPXRoaXMuaXRlbS52aWV3O2lmKGl8fGope2ZvcihqPyhmPWMueWVhcixnPWMubW9udGgsaD1jLmRhdGUpOihmPStjWzBdLGc9K2NbMV0saD0rY1syXSksZCYmZC5uYXYmJmsmJmsubW9udGghPT1nJiYoZj1rLnllYXIsZz1rLm1vbnRoKSxlPW5ldyBEYXRlKGYsZysoZCYmZC5uYXY/ZC5uYXY6MCksMSksZj1lLmdldEZ1bGxZZWFyKCksZz1lLmdldE1vbnRoKCk7bmV3IERhdGUoZixnLGgpLmdldE1vbnRoKCkhPT1nOyloLT0xO2M9W2YsZyxoXX1yZXR1cm4gY30sYy5wcm90b3R5cGUubm9ybWFsaXplPWZ1bmN0aW9uKGEpe3JldHVybiBhLnNldEhvdXJzKDAsMCwwLDApLGF9LGMucHJvdG90eXBlLm1lYXN1cmU9ZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzO3JldHVybiBiP2YuaXNJbnRlZ2VyKGIpJiYoYj1jLm5vdyhhLGIse3JlbDpifSkpOmI9XCJtaW5cIj09YT8tMS8wOjEvMCxifSxjLnByb3RvdHlwZS52aWV3c2V0PWZ1bmN0aW9uKGEsYil7cmV0dXJuIHRoaXMuY3JlYXRlKFtiLnllYXIsYi5tb250aCwxXSl9LGMucHJvdG90eXBlLnZhbGlkYXRlPWZ1bmN0aW9uKGEsYyxkKXt2YXIgZSxnLGgsaSxqPXRoaXMsaz1jLGw9ZCYmZC5pbnRlcnZhbD9kLmludGVydmFsOjEsbT0tMT09PWouaXRlbS5lbmFibGUsbj1qLml0ZW0ubWluLG89ai5pdGVtLm1heCxwPW0mJmouaXRlbS5kaXNhYmxlLmZpbHRlcihmdW5jdGlvbihhKXtpZihiLmlzQXJyYXkoYSkpe3ZhciBkPWouY3JlYXRlKGEpLnBpY2s7ZDxjLnBpY2s/ZT0hMDpkPmMucGljayYmKGc9ITApfXJldHVybiBmLmlzSW50ZWdlcihhKX0pLmxlbmd0aDtpZigoIWR8fCFkLm5hdikmJighbSYmai5kaXNhYmxlZChjKXx8bSYmai5kaXNhYmxlZChjKSYmKHB8fGV8fGcpfHwhbSYmKGMucGljazw9bi5waWNrfHxjLnBpY2s+PW8ucGljaykpKWZvcihtJiYhcCYmKCFnJiZsPjB8fCFlJiYwPmwpJiYobCo9LTEpO2ouZGlzYWJsZWQoYykmJihNYXRoLmFicyhsKT4xJiYoYy5tb250aDxrLm1vbnRofHxjLm1vbnRoPmsubW9udGgpJiYoYz1rLGw9bD4wPzE6LTEpLGMucGljazw9bi5waWNrPyhoPSEwLGw9MSxjPWouY3JlYXRlKFtuLnllYXIsbi5tb250aCxuLmRhdGUtMV0pKTpjLnBpY2s+PW8ucGljayYmKGk9ITAsbD0tMSxjPWouY3JlYXRlKFtvLnllYXIsby5tb250aCxvLmRhdGUrMV0pKSwhaHx8IWkpOyljPWouY3JlYXRlKFtjLnllYXIsYy5tb250aCxjLmRhdGUrbF0pO3JldHVybiBjfSxjLnByb3RvdHlwZS5kaXNhYmxlZD1mdW5jdGlvbihhKXt2YXIgYz10aGlzLGQ9Yy5pdGVtLmRpc2FibGUuZmlsdGVyKGZ1bmN0aW9uKGQpe3JldHVybiBmLmlzSW50ZWdlcihkKT9hLmRheT09PShjLnNldHRpbmdzLmZpcnN0RGF5P2Q6ZC0xKSU3OmIuaXNBcnJheShkKXx8Zi5pc0RhdGUoZCk/YS5waWNrPT09Yy5jcmVhdGUoZCkucGljazpiLmlzT2JqZWN0KGQpP2Mud2l0aGluUmFuZ2UoZCxhKTp2b2lkIDB9KTtyZXR1cm4gZD1kLmxlbmd0aCYmIWQuZmlsdGVyKGZ1bmN0aW9uKGEpe3JldHVybiBiLmlzQXJyYXkoYSkmJlwiaW52ZXJ0ZWRcIj09YVszXXx8Yi5pc09iamVjdChhKSYmYS5pbnZlcnRlZH0pLmxlbmd0aCwtMT09PWMuaXRlbS5lbmFibGU/IWQ6ZHx8YS5waWNrPGMuaXRlbS5taW4ucGlja3x8YS5waWNrPmMuaXRlbS5tYXgucGlja30sYy5wcm90b3R5cGUucGFyc2U9ZnVuY3Rpb24oYSxjLGQpe3ZhciBlLGc9dGhpcyxoPXt9O3JldHVybiFjfHxmLmlzSW50ZWdlcihjKXx8Yi5pc0FycmF5KGMpfHxmLmlzRGF0ZShjKXx8Yi5pc09iamVjdChjKSYmZi5pc0ludGVnZXIoYy5waWNrKT9jOihkJiZkLmZvcm1hdHx8KGQ9ZHx8e30sZC5mb3JtYXQ9Zy5zZXR0aW5ncy5mb3JtYXQpLGU9XCJzdHJpbmdcIiE9dHlwZW9mIGN8fGQuZnJvbVZhbHVlPzA6MSxnLmZvcm1hdHMudG9BcnJheShkLmZvcm1hdCkubWFwKGZ1bmN0aW9uKGEpe3ZhciBiPWcuZm9ybWF0c1thXSxkPWI/Zi50cmlnZ2VyKGIsZyxbYyxoXSk6YS5yZXBsYWNlKC9eIS8sXCJcIikubGVuZ3RoO2ImJihoW2FdPWMuc3Vic3RyKDAsZCkpLGM9Yy5zdWJzdHIoZCl9KSxbaC55eXl5fHxoLnl5LCsoaC5tbXx8aC5tKS1lLGguZGR8fGguZF0pfSxjLnByb3RvdHlwZS5mb3JtYXRzPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gYShhLGIsYyl7dmFyIGQ9YS5tYXRjaCgvXFx3Ky8pWzBdO3JldHVybiBjLm1tfHxjLm18fChjLm09Yi5pbmRleE9mKGQpKSxkLmxlbmd0aH1mdW5jdGlvbiBiKGEpe3JldHVybiBhLm1hdGNoKC9cXHcrLylbMF0ubGVuZ3RofXJldHVybntkOmZ1bmN0aW9uKGEsYil7cmV0dXJuIGE/Zi5kaWdpdHMoYSk6Yi5kYXRlfSxkZDpmdW5jdGlvbihhLGIpe3JldHVybiBhPzI6Zi5sZWFkKGIuZGF0ZSl9LGRkZDpmdW5jdGlvbihhLGMpe3JldHVybiBhP2IoYSk6dGhpcy5zZXR0aW5ncy53ZWVrZGF5c1Nob3J0W2MuZGF5XX0sZGRkZDpmdW5jdGlvbihhLGMpe3JldHVybiBhP2IoYSk6dGhpcy5zZXR0aW5ncy53ZWVrZGF5c0Z1bGxbYy5kYXldfSxtOmZ1bmN0aW9uKGEsYil7cmV0dXJuIGE/Zi5kaWdpdHMoYSk6Yi5tb250aCsxfSxtbTpmdW5jdGlvbihhLGIpe3JldHVybiBhPzI6Zi5sZWFkKGIubW9udGgrMSl9LG1tbTpmdW5jdGlvbihiLGMpe3ZhciBkPXRoaXMuc2V0dGluZ3MubW9udGhzU2hvcnQ7cmV0dXJuIGI/YShiLGQsYyk6ZFtjLm1vbnRoXX0sbW1tbTpmdW5jdGlvbihiLGMpe3ZhciBkPXRoaXMuc2V0dGluZ3MubW9udGhzRnVsbDtyZXR1cm4gYj9hKGIsZCxjKTpkW2MubW9udGhdfSx5eTpmdW5jdGlvbihhLGIpe3JldHVybiBhPzI6KFwiXCIrYi55ZWFyKS5zbGljZSgyKX0seXl5eTpmdW5jdGlvbihhLGIpe3JldHVybiBhPzQ6Yi55ZWFyfSx0b0FycmF5OmZ1bmN0aW9uKGEpe3JldHVybiBhLnNwbGl0KC8oZHsxLDR9fG17MSw0fXx5ezR9fHl5fCEuKS9nKX0sdG9TdHJpbmc6ZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzO3JldHVybiBjLmZvcm1hdHMudG9BcnJheShhKS5tYXAoZnVuY3Rpb24oYSl7cmV0dXJuIGYudHJpZ2dlcihjLmZvcm1hdHNbYV0sYyxbMCxiXSl8fGEucmVwbGFjZSgvXiEvLFwiXCIpfSkuam9pbihcIlwiKX19fSgpLGMucHJvdG90eXBlLmlzRGF0ZUV4YWN0PWZ1bmN0aW9uKGEsYyl7dmFyIGQ9dGhpcztyZXR1cm4gZi5pc0ludGVnZXIoYSkmJmYuaXNJbnRlZ2VyKGMpfHxcImJvb2xlYW5cIj09dHlwZW9mIGEmJlwiYm9vbGVhblwiPT10eXBlb2YgYz9hPT09YzooZi5pc0RhdGUoYSl8fGIuaXNBcnJheShhKSkmJihmLmlzRGF0ZShjKXx8Yi5pc0FycmF5KGMpKT9kLmNyZWF0ZShhKS5waWNrPT09ZC5jcmVhdGUoYykucGljazpiLmlzT2JqZWN0KGEpJiZiLmlzT2JqZWN0KGMpP2QuaXNEYXRlRXhhY3QoYS5mcm9tLGMuZnJvbSkmJmQuaXNEYXRlRXhhY3QoYS50byxjLnRvKTohMX0sYy5wcm90b3R5cGUuaXNEYXRlT3ZlcmxhcD1mdW5jdGlvbihhLGMpe3ZhciBkPXRoaXM7cmV0dXJuIGYuaXNJbnRlZ2VyKGEpJiYoZi5pc0RhdGUoYyl8fGIuaXNBcnJheShjKSk/YT09PWQuY3JlYXRlKGMpLmRheSsxOmYuaXNJbnRlZ2VyKGMpJiYoZi5pc0RhdGUoYSl8fGIuaXNBcnJheShhKSk/Yz09PWQuY3JlYXRlKGEpLmRheSsxOmIuaXNPYmplY3QoYSkmJmIuaXNPYmplY3QoYyk/ZC5vdmVybGFwUmFuZ2VzKGEsYyk6ITF9LGMucHJvdG90eXBlLmZsaXBFbmFibGU9ZnVuY3Rpb24oYSl7dmFyIGI9dGhpcy5pdGVtO2IuZW5hYmxlPWF8fCgtMT09Yi5lbmFibGU/MTotMSl9LGMucHJvdG90eXBlLmRlYWN0aXZhdGU9ZnVuY3Rpb24oYSxjKXt2YXIgZD10aGlzLGU9ZC5pdGVtLmRpc2FibGUuc2xpY2UoMCk7cmV0dXJuXCJmbGlwXCI9PWM/ZC5mbGlwRW5hYmxlKCk6Yz09PSExPyhkLmZsaXBFbmFibGUoMSksZT1bXSk6Yz09PSEwPyhkLmZsaXBFbmFibGUoLTEpLGU9W10pOmMubWFwKGZ1bmN0aW9uKGEpe2Zvcih2YXIgYyxnPTA7ZzxlLmxlbmd0aDtnKz0xKWlmKGQuaXNEYXRlRXhhY3QoYSxlW2ddKSl7Yz0hMDticmVha31jfHwoZi5pc0ludGVnZXIoYSl8fGYuaXNEYXRlKGEpfHxiLmlzQXJyYXkoYSl8fGIuaXNPYmplY3QoYSkmJmEuZnJvbSYmYS50bykmJmUucHVzaChhKX0pLGV9LGMucHJvdG90eXBlLmFjdGl2YXRlPWZ1bmN0aW9uKGEsYyl7dmFyIGQ9dGhpcyxlPWQuaXRlbS5kaXNhYmxlLGc9ZS5sZW5ndGg7cmV0dXJuXCJmbGlwXCI9PWM/ZC5mbGlwRW5hYmxlKCk6Yz09PSEwPyhkLmZsaXBFbmFibGUoMSksZT1bXSk6Yz09PSExPyhkLmZsaXBFbmFibGUoLTEpLGU9W10pOmMubWFwKGZ1bmN0aW9uKGEpe3ZhciBjLGgsaSxqO2ZvcihpPTA7Zz5pO2krPTEpe2lmKGg9ZVtpXSxkLmlzRGF0ZUV4YWN0KGgsYSkpe2M9ZVtpXT1udWxsLGo9ITA7YnJlYWt9aWYoZC5pc0RhdGVPdmVybGFwKGgsYSkpe2IuaXNPYmplY3QoYSk/KGEuaW52ZXJ0ZWQ9ITAsYz1hKTpiLmlzQXJyYXkoYSk/KGM9YSxjWzNdfHxjLnB1c2goXCJpbnZlcnRlZFwiKSk6Zi5pc0RhdGUoYSkmJihjPVthLmdldEZ1bGxZZWFyKCksYS5nZXRNb250aCgpLGEuZ2V0RGF0ZSgpLFwiaW52ZXJ0ZWRcIl0pO2JyZWFrfX1pZihjKWZvcihpPTA7Zz5pO2krPTEpaWYoZC5pc0RhdGVFeGFjdChlW2ldLGEpKXtlW2ldPW51bGw7YnJlYWt9aWYoailmb3IoaT0wO2c+aTtpKz0xKWlmKGQuaXNEYXRlT3ZlcmxhcChlW2ldLGEpKXtlW2ldPW51bGw7YnJlYWt9YyYmZS5wdXNoKGMpfSksZS5maWx0ZXIoZnVuY3Rpb24oYSl7cmV0dXJuIG51bGwhPWF9KX0sYy5wcm90b3R5cGUubm9kZXM9ZnVuY3Rpb24oYSl7dmFyIGI9dGhpcyxjPWIuc2V0dGluZ3MsZz1iLml0ZW0saD1nLm5vdyxpPWcuc2VsZWN0LGo9Zy5oaWdobGlnaHQsaz1nLnZpZXcsbD1nLmRpc2FibGUsbT1nLm1pbixuPWcubWF4LG89ZnVuY3Rpb24oYSl7cmV0dXJuIGMuZmlyc3REYXkmJmEucHVzaChhLnNoaWZ0KCkpLGYubm9kZShcInRoZWFkXCIsZi5ub2RlKFwidHJcIixmLmdyb3VwKHttaW46MCxtYXg6ZC0xLGk6MSxub2RlOlwidGhcIixpdGVtOmZ1bmN0aW9uKGIpe3JldHVyblthW2JdLGMua2xhc3Mud2Vla2RheXNdfX0pKSl9KChjLnNob3dXZWVrZGF5c0Z1bGw/Yy53ZWVrZGF5c0Z1bGw6Yy53ZWVrZGF5c1Nob3J0KS5zbGljZSgwKSkscD1mdW5jdGlvbihhKXtyZXR1cm4gZi5ub2RlKFwiZGl2XCIsXCIgXCIsYy5rbGFzc1tcIm5hdlwiKyhhP1wiTmV4dFwiOlwiUHJldlwiKV0rKGEmJmsueWVhcj49bi55ZWFyJiZrLm1vbnRoPj1uLm1vbnRofHwhYSYmay55ZWFyPD1tLnllYXImJmsubW9udGg8PW0ubW9udGg/XCIgXCIrYy5rbGFzcy5uYXZEaXNhYmxlZDpcIlwiKSxcImRhdGEtbmF2PVwiKyhhfHwtMSkpfSxxPWZ1bmN0aW9uKGIpe3JldHVybiBjLnNlbGVjdE1vbnRocz9mLm5vZGUoXCJzZWxlY3RcIixmLmdyb3VwKHttaW46MCxtYXg6MTEsaToxLG5vZGU6XCJvcHRpb25cIixpdGVtOmZ1bmN0aW9uKGEpe3JldHVybltiW2FdLDAsXCJ2YWx1ZT1cIithKyhrLm1vbnRoPT1hP1wiIHNlbGVjdGVkXCI6XCJcIikrKGsueWVhcj09bS55ZWFyJiZhPG0ubW9udGh8fGsueWVhcj09bi55ZWFyJiZhPm4ubW9udGg/XCIgZGlzYWJsZWRcIjpcIlwiKV19fSksYy5rbGFzcy5zZWxlY3RNb250aCxhP1wiXCI6XCJkaXNhYmxlZFwiKTpmLm5vZGUoXCJkaXZcIixiW2subW9udGhdLGMua2xhc3MubW9udGgpfSxyPWZ1bmN0aW9uKCl7dmFyIGI9ay55ZWFyLGQ9Yy5zZWxlY3RZZWFycz09PSEwPzU6fn4oYy5zZWxlY3RZZWFycy8yKTtpZihkKXt2YXIgZT1tLnllYXIsZz1uLnllYXIsaD1iLWQsaT1iK2Q7aWYoZT5oJiYoaSs9ZS1oLGg9ZSksaT5nKXt2YXIgaj1oLWUsbD1pLWc7aC09aj5sP2w6aixpPWd9cmV0dXJuIGYubm9kZShcInNlbGVjdFwiLGYuZ3JvdXAoe21pbjpoLG1heDppLGk6MSxub2RlOlwib3B0aW9uXCIsaXRlbTpmdW5jdGlvbihhKXtyZXR1cm5bYSwwLFwidmFsdWU9XCIrYSsoYj09YT9cIiBzZWxlY3RlZFwiOlwiXCIpXX19KSxjLmtsYXNzLnNlbGVjdFllYXIsYT9cIlwiOlwiZGlzYWJsZWRcIil9cmV0dXJuIGYubm9kZShcImRpdlwiLGIsYy5rbGFzcy55ZWFyKX07cmV0dXJuIGYubm9kZShcImRpdlwiLHAoKStwKDEpK3EoYy5zaG93TW9udGhzU2hvcnQ/Yy5tb250aHNTaG9ydDpjLm1vbnRoc0Z1bGwpK3IoKSxjLmtsYXNzLmhlYWRlcikrZi5ub2RlKFwidGFibGVcIixvK2Yubm9kZShcInRib2R5XCIsZi5ncm91cCh7bWluOjAsbWF4OmUtMSxpOjEsbm9kZTpcInRyXCIsaXRlbTpmdW5jdGlvbihhKXt2YXIgZT1jLmZpcnN0RGF5JiYwPT09Yi5jcmVhdGUoW2sueWVhcixrLm1vbnRoLDFdKS5kYXk/LTc6MDtyZXR1cm5bZi5ncm91cCh7bWluOmQqYS1rLmRheStlKzEsbWF4OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMubWluK2QtMX0saToxLG5vZGU6XCJ0ZFwiLGl0ZW06ZnVuY3Rpb24oYSl7YT1iLmNyZWF0ZShbay55ZWFyLGsubW9udGgsYSsoYy5maXJzdERheT8xOjApXSk7dmFyIGQ9aSYmaS5waWNrPT1hLnBpY2ssZT1qJiZqLnBpY2s9PWEucGljayxnPWwmJmIuZGlzYWJsZWQoYSl8fGEucGljazxtLnBpY2t8fGEucGljaz5uLnBpY2s7cmV0dXJuW2Yubm9kZShcImRpdlwiLGEuZGF0ZSxmdW5jdGlvbihiKXtyZXR1cm4gYi5wdXNoKGsubW9udGg9PWEubW9udGg/Yy5rbGFzcy5pbmZvY3VzOmMua2xhc3Mub3V0Zm9jdXMpLGgucGljaz09YS5waWNrJiZiLnB1c2goYy5rbGFzcy5ub3cpLGQmJmIucHVzaChjLmtsYXNzLnNlbGVjdGVkKSxlJiZiLnB1c2goYy5rbGFzcy5oaWdobGlnaHRlZCksZyYmYi5wdXNoKGMua2xhc3MuZGlzYWJsZWQpLGIuam9pbihcIiBcIil9KFtjLmtsYXNzLmRheV0pLFwiZGF0YS1waWNrPVwiK2EucGljaytcIiBcIitmLmFyaWFBdHRyKHtyb2xlOlwiYnV0dG9uXCIsY29udHJvbHM6Yi4kbm9kZVswXS5pZCxjaGVja2VkOmQmJmIuJG5vZGVbMF0udmFsdWU9PT1mLnRyaWdnZXIoYi5mb3JtYXRzLnRvU3RyaW5nLGIsW2MuZm9ybWF0LGFdKT8hMDpudWxsLGFjdGl2ZWRlc2NlbmRhbnQ6ZT8hMDpudWxsLGRpc2FibGVkOmc/ITA6bnVsbH0pKV19fSldfX0pKSxjLmtsYXNzLnRhYmxlKStmLm5vZGUoXCJkaXZcIixmLm5vZGUoXCJidXR0b25cIixjLnRvZGF5LGMua2xhc3MuYnV0dG9uVG9kYXksXCJ0eXBlPWJ1dHRvbiBkYXRhLXBpY2s9XCIraC5waWNrKyhhP1wiXCI6XCIgZGlzYWJsZWRcIikpK2Yubm9kZShcImJ1dHRvblwiLGMuY2xlYXIsYy5rbGFzcy5idXR0b25DbGVhcixcInR5cGU9YnV0dG9uIGRhdGEtY2xlYXI9MVwiKyhhP1wiXCI6XCIgZGlzYWJsZWRcIikpLGMua2xhc3MuZm9vdGVyKX0sYy5kZWZhdWx0cz1mdW5jdGlvbihhKXtyZXR1cm57bW9udGhzRnVsbDpbXCJKYW51YXJ5XCIsXCJGZWJydWFyeVwiLFwiTWFyY2hcIixcIkFwcmlsXCIsXCJNYXlcIixcIkp1bmVcIixcIkp1bHlcIixcIkF1Z3VzdFwiLFwiU2VwdGVtYmVyXCIsXCJPY3RvYmVyXCIsXCJOb3ZlbWJlclwiLFwiRGVjZW1iZXJcIl0sbW9udGhzU2hvcnQ6W1wiSmFuXCIsXCJGZWJcIixcIk1hclwiLFwiQXByXCIsXCJNYXlcIixcIkp1blwiLFwiSnVsXCIsXCJBdWdcIixcIlNlcFwiLFwiT2N0XCIsXCJOb3ZcIixcIkRlY1wiXSx3ZWVrZGF5c0Z1bGw6W1wiU3VuZGF5XCIsXCJNb25kYXlcIixcIlR1ZXNkYXlcIixcIldlZG5lc2RheVwiLFwiVGh1cnNkYXlcIixcIkZyaWRheVwiLFwiU2F0dXJkYXlcIl0sd2Vla2RheXNTaG9ydDpbXCJTdW5cIixcIk1vblwiLFwiVHVlXCIsXCJXZWRcIixcIlRodVwiLFwiRnJpXCIsXCJTYXRcIl0sdG9kYXk6XCJUb2RheVwiLGNsZWFyOlwiQ2xlYXJcIixmb3JtYXQ6XCJkIG1tbW0sIHl5eXlcIixrbGFzczp7dGFibGU6YStcInRhYmxlXCIsaGVhZGVyOmErXCJoZWFkZXJcIixuYXZQcmV2OmErXCJuYXYtLXByZXZcIixuYXZOZXh0OmErXCJuYXYtLW5leHRcIixuYXZEaXNhYmxlZDphK1wibmF2LS1kaXNhYmxlZFwiLG1vbnRoOmErXCJtb250aFwiLHllYXI6YStcInllYXJcIixzZWxlY3RNb250aDphK1wic2VsZWN0LS1tb250aFwiLHNlbGVjdFllYXI6YStcInNlbGVjdC0teWVhclwiLHdlZWtkYXlzOmErXCJ3ZWVrZGF5XCIsZGF5OmErXCJkYXlcIixkaXNhYmxlZDphK1wiZGF5LS1kaXNhYmxlZFwiLHNlbGVjdGVkOmErXCJkYXktLXNlbGVjdGVkXCIsaGlnaGxpZ2h0ZWQ6YStcImRheS0taGlnaGxpZ2h0ZWRcIixub3c6YStcImRheS0tdG9kYXlcIixpbmZvY3VzOmErXCJkYXktLWluZm9jdXNcIixvdXRmb2N1czphK1wiZGF5LS1vdXRmb2N1c1wiLGZvb3RlcjphK1wiZm9vdGVyXCIsYnV0dG9uQ2xlYXI6YStcImJ1dHRvbi0tY2xlYXJcIixidXR0b25Ub2RheTphK1wiYnV0dG9uLS10b2RheVwifX19KGEua2xhc3NlcygpLnBpY2tlcitcIl9fXCIpLGEuZXh0ZW5kKFwicGlja2FkYXRlXCIsYyl9KTtcbi8qIVxuICogVGltZSBwaWNrZXIgZm9yIHBpY2thZGF0ZS5qcyB2My40LjBcbiAqIGh0dHA6Ly9hbXN1bC5naXRodWIuaW8vcGlja2FkYXRlLmpzL3RpbWUuaHRtXG4gKi9cbiFmdW5jdGlvbihhKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtcInBpY2tlclwiLFwiYW5ndWxhclwiXSxhKTphKFBpY2tlcixhbmd1bGFyKX0oZnVuY3Rpb24oYSxiKXtmdW5jdGlvbiBjKGEsYil7dmFyIGM9dGhpcyxkPWEuJG5vZGVbMF0udmFsdWUsZT1hLiRub2RlLmRhdGEoXCJ2YWx1ZVwiKSxmPWV8fGQsZz1lP2IuZm9ybWF0U3VibWl0OmIuZm9ybWF0O2Muc2V0dGluZ3M9YixjLiRub2RlPWEuJG5vZGUsYy5xdWV1ZT17aW50ZXJ2YWw6XCJpXCIsbWluOlwibWVhc3VyZSBjcmVhdGVcIixtYXg6XCJtZWFzdXJlIGNyZWF0ZVwiLG5vdzpcIm5vdyBjcmVhdGVcIixzZWxlY3Q6XCJwYXJzZSBjcmVhdGUgdmFsaWRhdGVcIixoaWdobGlnaHQ6XCJwYXJzZSBjcmVhdGUgdmFsaWRhdGVcIix2aWV3OlwicGFyc2UgY3JlYXRlIHZhbGlkYXRlXCIsZGlzYWJsZTpcImRlYWN0aXZhdGVcIixlbmFibGU6XCJhY3RpdmF0ZVwifSxjLml0ZW09e30sYy5pdGVtLmludGVydmFsPWIuaW50ZXJ2YWx8fDMwLGMuaXRlbS5kaXNhYmxlPShiLmRpc2FibGV8fFtdKS5zbGljZSgwKSxjLml0ZW0uZW5hYmxlPS1mdW5jdGlvbihhKXtyZXR1cm4gYVswXT09PSEwP2Euc2hpZnQoKTotMX0oYy5pdGVtLmRpc2FibGUpLGMuc2V0KFwibWluXCIsYi5taW4pLnNldChcIm1heFwiLGIubWF4KS5zZXQoXCJub3dcIiksZj9jLnNldChcInNlbGVjdFwiLGYse2Zvcm1hdDpnLGZyb21WYWx1ZTohIWR9KTpjLnNldChcInNlbGVjdFwiLG51bGwpLnNldChcImhpZ2hsaWdodFwiLGMuaXRlbS5ub3cpLGMua2V5PXs0MDoxLDM4Oi0xLDM5OjEsMzc6LTEsZ286ZnVuY3Rpb24oYSl7Yy5zZXQoXCJoaWdobGlnaHRcIixjLml0ZW0uaGlnaGxpZ2h0LnBpY2srYSpjLml0ZW0uaW50ZXJ2YWwse2ludGVydmFsOmEqYy5pdGVtLmludGVydmFsfSksdGhpcy5yZW5kZXIoKX19LGEub24oXCJyZW5kZXJcIixmdW5jdGlvbigpe3ZhciBjPWEuJHJvb3QuY2hpbGRyZW4oKSxkPWMuZmluZChcIi5cIitiLmtsYXNzLnZpZXdzZXQpO2QubGVuZ3RoJiYoY1swXS5zY3JvbGxUb3A9fn5kLnBvc2l0aW9uKCkudG9wLTIqZFswXS5jbGllbnRIZWlnaHQpfSkub24oXCJvcGVuXCIsZnVuY3Rpb24oKXthLiRyb290LmZpbmQoXCJidXR0b25cIikuYXR0cihcImRpc2FibGVcIiwhMSl9KS5vbihcImNsb3NlXCIsZnVuY3Rpb24oKXthLiRyb290LmZpbmQoXCJidXR0b25cIikuYXR0cihcImRpc2FibGVcIiwhMCl9KX12YXIgZD0yNCxlPTYwLGY9MTIsZz1kKmUsaD1hLl87Yy5wcm90b3R5cGUuc2V0PWZ1bmN0aW9uKGEsYixjKXt2YXIgZD10aGlzLGU9ZC5pdGVtO3JldHVybiBudWxsPT09Yj8oZVthXT1iLGQpOihlW1wiZW5hYmxlXCI9PWE/XCJkaXNhYmxlXCI6XCJmbGlwXCI9PWE/XCJlbmFibGVcIjphXT1kLnF1ZXVlW2FdLnNwbGl0KFwiIFwiKS5tYXAoZnVuY3Rpb24oZSl7cmV0dXJuIGI9ZFtlXShhLGIsYyl9KS5wb3AoKSxcInNlbGVjdFwiPT1hP2Quc2V0KFwiaGlnaGxpZ2h0XCIsZS5zZWxlY3QsYyk6XCJoaWdobGlnaHRcIj09YT9kLnNldChcInZpZXdcIixlLmhpZ2hsaWdodCxjKTpcImludGVydmFsXCI9PWE/ZC5zZXQoXCJtaW5cIixlLm1pbixjKS5zZXQoXCJtYXhcIixlLm1heCxjKTphLm1hdGNoKC9eKGZsaXB8bWlufG1heHxkaXNhYmxlfGVuYWJsZSkkLykmJihcIm1pblwiPT1hJiZkLnNldChcIm1heFwiLGUubWF4LGMpLGUuc2VsZWN0JiZkLmRpc2FibGVkKGUuc2VsZWN0KSYmZC5zZXQoXCJzZWxlY3RcIixlLnNlbGVjdCxjKSxlLmhpZ2hsaWdodCYmZC5kaXNhYmxlZChlLmhpZ2hsaWdodCkmJmQuc2V0KFwiaGlnaGxpZ2h0XCIsZS5oaWdobGlnaHQsYykpLGQpfSxjLnByb3RvdHlwZS5nZXQ9ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuaXRlbVthXX0sYy5wcm90b3R5cGUuY3JlYXRlPWZ1bmN0aW9uKGEsYyxmKXt2YXIgaT10aGlzO3JldHVybiBjPXZvaWQgMD09PWM/YTpjLGguaXNEYXRlKGMpJiYoYz1bYy5nZXRIb3VycygpLGMuZ2V0TWludXRlcygpXSksYi5pc09iamVjdChjKSYmaC5pc0ludGVnZXIoYy5waWNrKT9jPWMucGljazpiLmlzQXJyYXkoYyk/Yz0rY1swXSplKyArY1sxXTpoLmlzSW50ZWdlcihjKXx8KGM9aS5ub3coYSxjLGYpKSxcIm1heFwiPT1hJiZjPGkuaXRlbS5taW4ucGljayYmKGMrPWcpLFwibWluXCIhPWEmJlwibWF4XCIhPWEmJihjLWkuaXRlbS5taW4ucGljayklaS5pdGVtLmludGVydmFsIT09MCYmKGMrPWkuaXRlbS5pbnRlcnZhbCksYz1pLm5vcm1hbGl6ZShhLGMsZikse2hvdXI6fn4oZCtjL2UpJWQsbWluczooZStjJWUpJWUsdGltZTooZytjKSVnLHBpY2s6Y319LGMucHJvdG90eXBlLmNyZWF0ZVJhbmdlPWZ1bmN0aW9uKGEsYyl7dmFyIGQ9dGhpcyxlPWZ1bmN0aW9uKGEpe3JldHVybiBhPT09ITB8fGIuaXNBcnJheShhKXx8aC5pc0RhdGUoYSk/ZC5jcmVhdGUoYSk6YX07cmV0dXJuIGguaXNJbnRlZ2VyKGEpfHwoYT1lKGEpKSxoLmlzSW50ZWdlcihjKXx8KGM9ZShjKSksaC5pc0ludGVnZXIoYSkmJmIuaXNPYmplY3QoYyk/YT1bYy5ob3VyLGMubWlucythKmQuc2V0dGluZ3MuaW50ZXJ2YWxdOmguaXNJbnRlZ2VyKGMpJiZiLmlzT2JqZWN0KGEpJiYoYz1bYS5ob3VyLGEubWlucytjKmQuc2V0dGluZ3MuaW50ZXJ2YWxdKSx7ZnJvbTplKGEpLHRvOmUoYyl9fSxjLnByb3RvdHlwZS53aXRoaW5SYW5nZT1mdW5jdGlvbihhLGIpe3JldHVybiBhPXRoaXMuY3JlYXRlUmFuZ2UoYS5mcm9tLGEudG8pLGIucGljaz49YS5mcm9tLnBpY2smJmIucGljazw9YS50by5waWNrfSxjLnByb3RvdHlwZS5vdmVybGFwUmFuZ2VzPWZ1bmN0aW9uKGEsYil7dmFyIGM9dGhpcztyZXR1cm4gYT1jLmNyZWF0ZVJhbmdlKGEuZnJvbSxhLnRvKSxiPWMuY3JlYXRlUmFuZ2UoYi5mcm9tLGIudG8pLGMud2l0aGluUmFuZ2UoYSxiLmZyb20pfHxjLndpdGhpblJhbmdlKGEsYi50byl8fGMud2l0aGluUmFuZ2UoYixhLmZyb20pfHxjLndpdGhpblJhbmdlKGIsYS50byl9LGMucHJvdG90eXBlLm5vdz1mdW5jdGlvbihhLGIpe3ZhciBjLGQ9dGhpcy5pdGVtLmludGVydmFsLGY9bmV3IERhdGUsZz1mLmdldEhvdXJzKCkqZStmLmdldE1pbnV0ZXMoKSxpPWguaXNJbnRlZ2VyKGIpO3JldHVybiBnLT1nJWQsYz0wPmImJi1kPj1kKmIrZyxnKz1cIm1pblwiPT1hJiZjPzA6ZCxpJiYoZys9ZCooYyYmXCJtYXhcIiE9YT9iKzE6YikpLGd9LGMucHJvdG90eXBlLm5vcm1hbGl6ZT1mdW5jdGlvbihhLGIpe3ZhciBjPXRoaXMuaXRlbS5pbnRlcnZhbCxkPXRoaXMuaXRlbS5taW4mJnRoaXMuaXRlbS5taW4ucGlja3x8MDtyZXR1cm4gYi09XCJtaW5cIj09YT8wOihiLWQpJWN9LGMucHJvdG90eXBlLm1lYXN1cmU9ZnVuY3Rpb24oYSxjLGYpe3ZhciBnPXRoaXM7cmV0dXJuIGM/Yz09PSEwfHxoLmlzSW50ZWdlcihjKT9jPWcubm93KGEsYyxmKTpiLmlzT2JqZWN0KGMpJiZoLmlzSW50ZWdlcihjLnBpY2spJiYoYz1nLm5vcm1hbGl6ZShhLGMucGljayxmKSk6Yz1cIm1pblwiPT1hP1swLDBdOltkLTEsZS0xXSxjfSxjLnByb3RvdHlwZS52YWxpZGF0ZT1mdW5jdGlvbihhLGIsYyl7dmFyIGQ9dGhpcyxlPWMmJmMuaW50ZXJ2YWw/Yy5pbnRlcnZhbDpkLml0ZW0uaW50ZXJ2YWw7cmV0dXJuIGQuZGlzYWJsZWQoYikmJihiPWQuc2hpZnQoYixlKSksYj1kLnNjb3BlKGIpLGQuZGlzYWJsZWQoYikmJihiPWQuc2hpZnQoYiwtMSplKSksYn0sYy5wcm90b3R5cGUuZGlzYWJsZWQ9ZnVuY3Rpb24oYSl7dmFyIGM9dGhpcyxkPWMuaXRlbS5kaXNhYmxlLmZpbHRlcihmdW5jdGlvbihkKXtyZXR1cm4gaC5pc0ludGVnZXIoZCk/YS5ob3VyPT1kOmIuaXNBcnJheShkKXx8aC5pc0RhdGUoZCk/YS5waWNrPT1jLmNyZWF0ZShkKS5waWNrOmIuaXNPYmplY3QoZCk/Yy53aXRoaW5SYW5nZShkLGEpOnZvaWQgMH0pO3JldHVybiBkPWQubGVuZ3RoJiYhZC5maWx0ZXIoZnVuY3Rpb24oYSl7cmV0dXJuIGIuaXNBcnJheShhKSYmXCJpbnZlcnRlZFwiPT1hWzJdfHxiLmlzT2JqZWN0KGEpJiZhLmludmVydGVkfSkubGVuZ3RoLC0xPT09Yy5pdGVtLmVuYWJsZT8hZDpkfHxhLnBpY2s8Yy5pdGVtLm1pbi5waWNrfHxhLnBpY2s+Yy5pdGVtLm1heC5waWNrfSxjLnByb3RvdHlwZS5zaGlmdD1mdW5jdGlvbihhLGIpe3ZhciBjPXRoaXMsZD1jLml0ZW0ubWluLnBpY2ssZT1jLml0ZW0ubWF4LnBpY2s7Zm9yKGI9Ynx8Yy5pdGVtLmludGVydmFsO2MuZGlzYWJsZWQoYSkmJihhPWMuY3JlYXRlKGEucGljays9YiksIShhLnBpY2s8PWR8fGEucGljaz49ZSkpOyk7cmV0dXJuIGF9LGMucHJvdG90eXBlLnNjb3BlPWZ1bmN0aW9uKGEpe3ZhciBiPXRoaXMuaXRlbS5taW4ucGljayxjPXRoaXMuaXRlbS5tYXgucGljaztyZXR1cm4gdGhpcy5jcmVhdGUoYS5waWNrPmM/YzphLnBpY2s8Yj9iOmEpfSxjLnByb3RvdHlwZS5wYXJzZT1mdW5jdGlvbihhLGMsZCl7dmFyIGYsZyxpLGosayxsPXRoaXMsbT17fTtpZighY3x8aC5pc0ludGVnZXIoYyl8fGIuaXNBcnJheShjKXx8aC5pc0RhdGUoYyl8fGIuaXNPYmplY3QoYykmJmguaXNJbnRlZ2VyKGMucGljaykpcmV0dXJuIGM7ZCYmZC5mb3JtYXR8fChkPWR8fHt9LGQuZm9ybWF0PWwuc2V0dGluZ3MuZm9ybWF0KSxsLmZvcm1hdHMudG9BcnJheShkLmZvcm1hdCkubWFwKGZ1bmN0aW9uKGEpe3ZhciBiLGQ9bC5mb3JtYXRzW2FdLGU9ZD9oLnRyaWdnZXIoZCxsLFtjLG1dKTphLnJlcGxhY2UoL14hLyxcIlwiKS5sZW5ndGg7ZCYmKGI9Yy5zdWJzdHIoMCxlKSxtW2FdPWIubWF0Y2goL15cXGQrJC8pPytiOmIpLGM9Yy5zdWJzdHIoZSl9KTtmb3IoaiBpbiBtKWs9bVtqXSxoLmlzSW50ZWdlcihrKT9qLm1hdGNoKC9eKGh8aGgpJC9pKT8oZj1rLChcImhcIj09anx8XCJoaFwiPT1qKSYmKGYlPTEyKSk6XCJpXCI9PWomJihnPWspOmoubWF0Y2goL15hJC9pKSYmay5tYXRjaCgvXnAvaSkmJihcImhcImluIG18fFwiaGhcImluIG0pJiYoaT0hMCk7cmV0dXJuKGk/ZisxMjpmKSplK2d9LGMucHJvdG90eXBlLmZvcm1hdHM9e2g6ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT9oLmRpZ2l0cyhhKTpiLmhvdXIlZnx8Zn0saGg6ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT8yOmgubGVhZChiLmhvdXIlZnx8Zil9LEg6ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT9oLmRpZ2l0cyhhKTpcIlwiK2IuaG91ciUyNH0sSEg6ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT9oLmRpZ2l0cyhhKTpoLmxlYWQoYi5ob3VyJTI0KX0saTpmdW5jdGlvbihhLGIpe3JldHVybiBhPzI6aC5sZWFkKGIubWlucyl9LGE6ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT80OmcvMj5iLnRpbWUlZz9cImEubS5cIjpcInAubS5cIn0sQTpmdW5jdGlvbihhLGIpe3JldHVybiBhPzI6Zy8yPmIudGltZSVnP1wiQU1cIjpcIlBNXCJ9LHRvQXJyYXk6ZnVuY3Rpb24oYSl7cmV0dXJuIGEuc3BsaXQoLyhoezEsMn18SHsxLDJ9fGl8YXxBfCEuKS9nKX0sdG9TdHJpbmc6ZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzO3JldHVybiBjLmZvcm1hdHMudG9BcnJheShhKS5tYXAoZnVuY3Rpb24oYSl7cmV0dXJuIGgudHJpZ2dlcihjLmZvcm1hdHNbYV0sYyxbMCxiXSl8fGEucmVwbGFjZSgvXiEvLFwiXCIpfSkuam9pbihcIlwiKX19LGMucHJvdG90eXBlLmlzVGltZUV4YWN0PWZ1bmN0aW9uKGEsYyl7dmFyIGQ9dGhpcztyZXR1cm4gaC5pc0ludGVnZXIoYSkmJmguaXNJbnRlZ2VyKGMpfHxcImJvb2xlYW5cIj09dHlwZW9mIGEmJlwiYm9vbGVhblwiPT10eXBlb2YgYz9hPT09YzooaC5pc0RhdGUoYSl8fGIuaXNBcnJheShhKSkmJihoLmlzRGF0ZShjKXx8Yi5pc0FycmF5KGMpKT9kLmNyZWF0ZShhKS5waWNrPT09ZC5jcmVhdGUoYykucGljazpiLmlzT2JqZWN0KGEpJiZiLmlzT2JqZWN0KGMpP2QuaXNUaW1lRXhhY3QoYS5mcm9tLGMuZnJvbSkmJmQuaXNUaW1lRXhhY3QoYS50byxjLnRvKTohMX0sYy5wcm90b3R5cGUuaXNUaW1lT3ZlcmxhcD1mdW5jdGlvbihhLGMpe3ZhciBkPXRoaXM7cmV0dXJuIGguaXNJbnRlZ2VyKGEpJiYoaC5pc0RhdGUoYyl8fGIuaXNBcnJheShjKSk/YT09PWQuY3JlYXRlKGMpLmhvdXI6aC5pc0ludGVnZXIoYykmJihoLmlzRGF0ZShhKXx8Yi5pc0FycmF5KGEpKT9jPT09ZC5jcmVhdGUoYSkuaG91cjpiLmlzT2JqZWN0KGEpJiZiLmlzT2JqZWN0KGMpP2Qub3ZlcmxhcFJhbmdlcyhhLGMpOiExfSxjLnByb3RvdHlwZS5mbGlwRW5hYmxlPWZ1bmN0aW9uKGEpe3ZhciBiPXRoaXMuaXRlbTtiLmVuYWJsZT1hfHwoLTE9PWIuZW5hYmxlPzE6LTEpfSxjLnByb3RvdHlwZS5kZWFjdGl2YXRlPWZ1bmN0aW9uKGEsYyl7dmFyIGQ9dGhpcyxlPWQuaXRlbS5kaXNhYmxlLnNsaWNlKDApO3JldHVyblwiZmxpcFwiPT1jP2QuZmxpcEVuYWJsZSgpOmM9PT0hMT8oZC5mbGlwRW5hYmxlKDEpLGU9W10pOmM9PT0hMD8oZC5mbGlwRW5hYmxlKC0xKSxlPVtdKTpjLm1hcChmdW5jdGlvbihhKXtmb3IodmFyIGMsZj0wO2Y8ZS5sZW5ndGg7Zis9MSlpZihkLmlzVGltZUV4YWN0KGEsZVtmXSkpe2M9ITA7YnJlYWt9Y3x8KGguaXNJbnRlZ2VyKGEpfHxoLmlzRGF0ZShhKXx8Yi5pc0FycmF5KGEpfHxiLmlzT2JqZWN0KGEpJiZhLmZyb20mJmEudG8pJiZlLnB1c2goYSl9KSxlfSxjLnByb3RvdHlwZS5hY3RpdmF0ZT1mdW5jdGlvbihhLGMpe3ZhciBkPXRoaXMsZT1kLml0ZW0uZGlzYWJsZSxmPWUubGVuZ3RoO3JldHVyblwiZmxpcFwiPT1jP2QuZmxpcEVuYWJsZSgpOmM9PT0hMD8oZC5mbGlwRW5hYmxlKDEpLGU9W10pOmM9PT0hMT8oZC5mbGlwRW5hYmxlKC0xKSxlPVtdKTpjLm1hcChmdW5jdGlvbihhKXt2YXIgYyxnLGksajtmb3IoaT0wO2Y+aTtpKz0xKXtpZihnPWVbaV0sZC5pc1RpbWVFeGFjdChnLGEpKXtjPWVbaV09bnVsbCxqPSEwO2JyZWFrfWlmKGQuaXNUaW1lT3ZlcmxhcChnLGEpKXtiLmlzT2JqZWN0KGEpPyhhLmludmVydGVkPSEwLGM9YSk6Yi5pc0FycmF5KGEpPyhjPWEsY1syXXx8Yy5wdXNoKFwiaW52ZXJ0ZWRcIikpOmguaXNEYXRlKGEpJiYoYz1bYS5nZXRGdWxsWWVhcigpLGEuZ2V0TW9udGgoKSxhLmdldERhdGUoKSxcImludmVydGVkXCJdKTticmVha319aWYoYylmb3IoaT0wO2Y+aTtpKz0xKWlmKGQuaXNUaW1lRXhhY3QoZVtpXSxhKSl7ZVtpXT1udWxsO2JyZWFrfWlmKGopZm9yKGk9MDtmPmk7aSs9MSlpZihkLmlzVGltZU92ZXJsYXAoZVtpXSxhKSl7ZVtpXT1udWxsO2JyZWFrfWMmJmUucHVzaChjKX0pLGUuZmlsdGVyKGZ1bmN0aW9uKGEpe3JldHVybiBudWxsIT1hfSl9LGMucHJvdG90eXBlLmk9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gaC5pc0ludGVnZXIoYikmJmI+MD9iOnRoaXMuaXRlbS5pbnRlcnZhbH0sYy5wcm90b3R5cGUubm9kZXM9ZnVuY3Rpb24oYSl7dmFyIGI9dGhpcyxjPWIuc2V0dGluZ3MsZD1iLml0ZW0uc2VsZWN0LGU9Yi5pdGVtLmhpZ2hsaWdodCxmPWIuaXRlbS52aWV3LGc9Yi5pdGVtLmRpc2FibGU7cmV0dXJuIGgubm9kZShcInVsXCIsaC5ncm91cCh7bWluOmIuaXRlbS5taW4ucGljayxtYXg6Yi5pdGVtLm1heC5waWNrLGk6Yi5pdGVtLmludGVydmFsLG5vZGU6XCJsaVwiLGl0ZW06ZnVuY3Rpb24oYSl7YT1iLmNyZWF0ZShhKTt2YXIgaT1hLnBpY2ssaj1kJiZkLnBpY2s9PWksaz1lJiZlLnBpY2s9PWksbD1nJiZiLmRpc2FibGVkKGEpO3JldHVybltoLnRyaWdnZXIoYi5mb3JtYXRzLnRvU3RyaW5nLGIsW2gudHJpZ2dlcihjLmZvcm1hdExhYmVsLGIsW2FdKXx8Yy5mb3JtYXQsYV0pLGZ1bmN0aW9uKGEpe3JldHVybiBqJiZhLnB1c2goYy5rbGFzcy5zZWxlY3RlZCksayYmYS5wdXNoKGMua2xhc3MuaGlnaGxpZ2h0ZWQpLGYmJmYucGljaz09aSYmYS5wdXNoKGMua2xhc3Mudmlld3NldCksbCYmYS5wdXNoKGMua2xhc3MuZGlzYWJsZWQpLGEuam9pbihcIiBcIil9KFtjLmtsYXNzLmxpc3RJdGVtXSksXCJkYXRhLXBpY2s9XCIrYS5waWNrK1wiIFwiK2guYXJpYUF0dHIoe3JvbGU6XCJidXR0b25cIixjb250cm9sczpiLiRub2RlWzBdLmlkLGNoZWNrZWQ6aiYmYi4kbm9kZS52YWwoKT09PWgudHJpZ2dlcihiLmZvcm1hdHMudG9TdHJpbmcsYixbYy5mb3JtYXQsYV0pPyEwOm51bGwsYWN0aXZlZGVzY2VuZGFudDprPyEwOm51bGwsZGlzYWJsZWQ6bD8hMDpudWxsfSldfX0pK2gubm9kZShcImxpXCIsaC5ub2RlKFwiYnV0dG9uXCIsYy5jbGVhcixjLmtsYXNzLmJ1dHRvbkNsZWFyLFwidHlwZT1idXR0b24gZGF0YS1jbGVhcj0xXCIrKGE/XCJcIjpcIiBkaXNhYmxlXCIpKSksYy5rbGFzcy5saXN0KX0sYy5kZWZhdWx0cz1mdW5jdGlvbihhKXtyZXR1cm57Y2xlYXI6XCJDbGVhclwiLGZvcm1hdDpcImg6aSBBXCIsaW50ZXJ2YWw6MzAsa2xhc3M6e3BpY2tlcjphK1wiIFwiK2ErXCItLXRpbWVcIixob2xkZXI6YStcIl9faG9sZGVyXCIsbGlzdDphK1wiX19saXN0XCIsbGlzdEl0ZW06YStcIl9fbGlzdC1pdGVtXCIsZGlzYWJsZWQ6YStcIl9fbGlzdC1pdGVtLS1kaXNhYmxlZFwiLHNlbGVjdGVkOmErXCJfX2xpc3QtaXRlbS0tc2VsZWN0ZWRcIixoaWdobGlnaHRlZDphK1wiX19saXN0LWl0ZW0tLWhpZ2hsaWdodGVkXCIsdmlld3NldDphK1wiX19saXN0LWl0ZW0tLXZpZXdzZXRcIixub3c6YStcIl9fbGlzdC1pdGVtLS1ub3dcIixidXR0b25DbGVhcjphK1wiX19idXR0b24tLWNsZWFyXCJ9fX0oYS5rbGFzc2VzKCkucGlja2VyKSxhLmV4dGVuZChcInBpY2thdGltZVwiLGMpfSk7XG4vKiFcbiAqIExlZ2FjeSBicm93c2VyIHN1cHBvcnRcbiAqL1xuW10ubWFwfHwoQXJyYXkucHJvdG90eXBlLm1hcD1mdW5jdGlvbihhLGIpe2Zvcih2YXIgYz10aGlzLGQ9Yy5sZW5ndGgsZT1uZXcgQXJyYXkoZCksZj0wO2Q+ZjtmKyspZiBpbiBjJiYoZVtmXT1hLmNhbGwoYixjW2ZdLGYsYykpO3JldHVybiBlfSksW10uZmlsdGVyfHwoQXJyYXkucHJvdG90eXBlLmZpbHRlcj1mdW5jdGlvbihhKXtpZihudWxsPT10aGlzKXRocm93IG5ldyBUeXBlRXJyb3I7dmFyIGI9T2JqZWN0KHRoaXMpLGM9Yi5sZW5ndGg+Pj4wO2lmKFwiZnVuY3Rpb25cIiE9dHlwZW9mIGEpdGhyb3cgbmV3IFR5cGVFcnJvcjtmb3IodmFyIGQ9W10sZT1hcmd1bWVudHNbMV0sZj0wO2M+ZjtmKyspaWYoZiBpbiBiKXt2YXIgZz1iW2ZdO2EuY2FsbChlLGcsZixiKSYmZC5wdXNoKGcpfXJldHVybiBkfSksW10uaW5kZXhPZnx8KEFycmF5LnByb3RvdHlwZS5pbmRleE9mPWZ1bmN0aW9uKGEpe2lmKG51bGw9PXRoaXMpdGhyb3cgbmV3IFR5cGVFcnJvcjt2YXIgYj1PYmplY3QodGhpcyksYz1iLmxlbmd0aD4+PjA7aWYoMD09PWMpcmV0dXJuLTE7dmFyIGQ9MDtpZihhcmd1bWVudHMubGVuZ3RoPjEmJihkPU51bWJlcihhcmd1bWVudHNbMV0pLGQhPWQ/ZD0wOjAhPT1kJiYxLzAhPWQmJmQhPS0xLzAmJihkPShkPjB8fC0xKSpNYXRoLmZsb29yKE1hdGguYWJzKGQpKSkpLGQ+PWMpcmV0dXJuLTE7Zm9yKHZhciBlPWQ+PTA/ZDpNYXRoLm1heChjLU1hdGguYWJzKGQpLDApO2M+ZTtlKyspaWYoZSBpbiBiJiZiW2VdPT09YSlyZXR1cm4gZTtyZXR1cm4tMX0pOy8qIVxuICogQ3Jvc3MtQnJvd3NlciBTcGxpdCAxLjEuMVxuICogQ29weXJpZ2h0IDIwMDctMjAxMiBTdGV2ZW4gTGV2aXRoYW4gPHN0ZXZlbmxldml0aGFuLmNvbT5cbiAqIEF2YWlsYWJsZSB1bmRlciB0aGUgTUlUIExpY2Vuc2VcbiAqIGh0dHA6Ly9ibG9nLnN0ZXZlbmxldml0aGFuLmNvbS9hcmNoaXZlcy9jcm9zcy1icm93c2VyLXNwbGl0XG4gKi9cbnZhciBuYXRpdmVTcGxpdD1TdHJpbmcucHJvdG90eXBlLnNwbGl0LGNvbXBsaWFudEV4ZWNOcGNnPXZvaWQgMD09PS8oKT8/Ly5leGVjKFwiXCIpWzFdO1N0cmluZy5wcm90b3R5cGUuc3BsaXQ9ZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzO2lmKFwiW29iamVjdCBSZWdFeHBdXCIhPT1PYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYSkpcmV0dXJuIG5hdGl2ZVNwbGl0LmNhbGwoYyxhLGIpO3ZhciBkLGUsZixnLGg9W10saT0oYS5pZ25vcmVDYXNlP1wiaVwiOlwiXCIpKyhhLm11bHRpbGluZT9cIm1cIjpcIlwiKSsoYS5leHRlbmRlZD9cInhcIjpcIlwiKSsoYS5zdGlja3k/XCJ5XCI6XCJcIiksaj0wO2ZvcihhPW5ldyBSZWdFeHAoYS5zb3VyY2UsaStcImdcIiksYys9XCJcIixjb21wbGlhbnRFeGVjTnBjZ3x8KGQ9bmV3IFJlZ0V4cChcIl5cIithLnNvdXJjZStcIiQoPyFcXFxccylcIixpKSksYj12b2lkIDA9PT1iPy0xPj4+MDpiPj4+MDsoZT1hLmV4ZWMoYykpJiYoZj1lLmluZGV4K2VbMF0ubGVuZ3RoLCEoZj5qJiYoaC5wdXNoKGMuc2xpY2UoaixlLmluZGV4KSksIWNvbXBsaWFudEV4ZWNOcGNnJiZlLmxlbmd0aD4xJiZlWzBdLnJlcGxhY2UoZCxmdW5jdGlvbigpe2Zvcih2YXIgYT0xO2E8YXJndW1lbnRzLmxlbmd0aC0yO2ErKyl2b2lkIDA9PT1hcmd1bWVudHNbYV0mJihlW2FdPXZvaWQgMCl9KSxlLmxlbmd0aD4xJiZlLmluZGV4PGMubGVuZ3RoJiZBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShoLGUuc2xpY2UoMSkpLGc9ZVswXS5sZW5ndGgsaj1mLGgubGVuZ3RoPj1iKSkpOylhLmxhc3RJbmRleD09PWUuaW5kZXgmJmEubGFzdEluZGV4Kys7cmV0dXJuIGo9PT1jLmxlbmd0aD8oZ3x8IWEudGVzdChcIlwiKSkmJmgucHVzaChcIlwiKTpoLnB1c2goYy5zbGljZShqKSksaC5sZW5ndGg+Yj9oLnNsaWNlKDAsYik6aH07XG5hbmd1bGFyLm1vZHVsZShcImFuZ3VsYXItZGF0ZXBpY2tlclwiLFtdKS5kaXJlY3RpdmUoXCJwaWNrQURhdGVcIixmdW5jdGlvbigpe3JldHVybntyZXN0cmljdDpcIkFcIixzY29wZTp7cGlja0FEYXRlOlwiPVwiLHBpY2tBRGF0ZU9wdGlvbnM6XCI9XCJ9LGxpbms6ZnVuY3Rpb24oYSxiKXtmdW5jdGlvbiBjKGMpe2lmKFwiZnVuY3Rpb25cIj09dHlwZW9mIGYmJmYuYXBwbHkodGhpcyxhcmd1bWVudHMpLCFhLiQkcGhhc2UmJiFhLiRyb290LiQkcGhhc2Upe3ZhciBkPWIucGlja2FkYXRlKFwicGlja2VyXCIpLmdldChcInNlbGVjdFwiKTthLiRhcHBseShmdW5jdGlvbigpe3JldHVybiBjLmhhc093blByb3BlcnR5KFwiY2xlYXJcIik/dm9pZChhLnBpY2tBRGF0ZT1udWxsKTooYS5waWNrQURhdGUmJlwic3RyaW5nXCIhPXR5cGVvZiBhLnBpY2tBRGF0ZXx8KGEucGlja0FEYXRlPW5ldyBEYXRlKDApKSxhLnBpY2tBRGF0ZS5zZXRZZWFyKGQub2JqLmdldFllYXIoKSsxOTAwKSxhLnBpY2tBRGF0ZS5zZXRNb250aChkLm9iai5nZXRNb250aCgpKSx2b2lkIGEucGlja0FEYXRlLnNldERhdGUoZC5vYmouZ2V0RGF0ZSgpKSl9KX19ZnVuY3Rpb24gZCgpe2lmKFwiZnVuY3Rpb25cIj09dHlwZW9mIGcmJmcuYXBwbHkodGhpcyxhcmd1bWVudHMpLFwidW5kZWZpbmVkXCIhPXR5cGVvZiBjb3Jkb3ZhJiZjb3Jkb3ZhLnBsdWdpbnMmJmNvcmRvdmEucGx1Z2lucy5LZXlib2FyZCl7dmFyIGE9ZnVuY3Rpb24oKXtjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuY2xvc2UoKSx3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm5hdGl2ZS5rZXlib2FyZHNob3dcIix0aGlzKX07d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJuYXRpdmUua2V5Ym9hcmRzaG93XCIsYSksc2V0VGltZW91dChmdW5jdGlvbigpe3dpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwibmF0aXZlLmtleWJvYXJkc2hvd1wiLGEpfSw1MDApfX12YXIgZT1hLnBpY2tBRGF0ZU9wdGlvbnN8fHt9LGY9ZS5vblNldCxnPWUub25DbG9zZTtiLnBpY2thZGF0ZShhbmd1bGFyLmV4dGVuZChlLHtvblNldDpjLG9uQ2xvc2U6ZCxjb250YWluZXI6ZG9jdW1lbnQuYm9keX0pKSxzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7YS5waWNrQURhdGUmJmIucGlja2FkYXRlKFwicGlja2VyXCIpLnNldChcInNlbGVjdFwiLGEucGlja0FEYXRlKX0sMWUzKX19fSkuZGlyZWN0aXZlKFwicGlja0FUaW1lXCIsZnVuY3Rpb24oKXtyZXR1cm57cmVzdHJpY3Q6XCJBXCIsc2NvcGU6e3BpY2tBVGltZTpcIj1cIixwaWNrQVRpbWVPcHRpb25zOlwiPVwifSxsaW5rOmZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gYyhjKXtpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBmJiZmLmFwcGx5KHRoaXMsYXJndW1lbnRzKSwhYS4kJHBoYXNlJiYhYS4kcm9vdC4kJHBoYXNlKXt2YXIgZD1iLnBpY2thdGltZShcInBpY2tlclwiKS5nZXQoXCJzZWxlY3RcIik7YS4kYXBwbHkoZnVuY3Rpb24oKXtyZXR1cm4gYy5oYXNPd25Qcm9wZXJ0eShcImNsZWFyXCIpP3ZvaWQoYS5waWNrQVRpbWU9bnVsbCk6KGEucGlja0FUaW1lJiZcInN0cmluZ1wiIT10eXBlb2YgYS5waWNrQVRpbWV8fChhLnBpY2tBVGltZT1uZXcgRGF0ZSksYS5waWNrQVRpbWUuc2V0SG91cnMoZC5ob3VyKSxhLnBpY2tBVGltZS5zZXRNaW51dGVzKGQubWlucyksYS5waWNrQVRpbWUuc2V0U2Vjb25kcygwKSx2b2lkIGEucGlja0FUaW1lLnNldE1pbGxpc2Vjb25kcygwKSl9KX19ZnVuY3Rpb24gZCgpe2lmKFwiZnVuY3Rpb25cIj09dHlwZW9mIGcmJmcuYXBwbHkodGhpcyxhcmd1bWVudHMpLFwidW5kZWZpbmVkXCIhPXR5cGVvZiBjb3Jkb3ZhJiZjb3Jkb3ZhLnBsdWdpbnMmJmNvcmRvdmEucGx1Z2lucy5LZXlib2FyZCl7dmFyIGE9ZnVuY3Rpb24oKXtjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuY2xvc2UoKSx3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm5hdGl2ZS5rZXlib2FyZHNob3dcIix0aGlzKX07d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJuYXRpdmUua2V5Ym9hcmRzaG93XCIsYSksc2V0VGltZW91dChmdW5jdGlvbigpe3dpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwibmF0aXZlLmtleWJvYXJkc2hvd1wiLGEpfSw1MDApfX12YXIgZT1hLnBpY2tBVGltZU9wdGlvbnN8fHt9LGY9ZS5vblNldCxnPWUub25DbG9zZTtiLnBpY2thdGltZShhbmd1bGFyLmV4dGVuZChlLHtvblNldDpjLG9uQ2xvc2U6ZCxjb250YWluZXI6ZG9jdW1lbnQuYm9keX0pKSxzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7YS5waWNrQVRpbWUmJmIucGlja2F0aW1lKFwicGlja2VyXCIpLnNldChcInNlbGVjdFwiLGEucGlja0FUaW1lKX0sMWUzKX19fSk7IiwiLy8gRGVwcyBpcyBzb3J0IG9mIGEgcHJvYmxlbSBmb3IgdXMsIG1heWJlIGluIHRoZSBmdXR1cmUgd2Ugd2lsbCBhc2sgdGhlIHVzZXIgdG8gZGVwZW5kXG4vLyBvbiBtb2R1bGVzIGZvciBhZGQtb25zXG5cbnZhciBkZXBzID0gWydPYmplY3RQYXRoJ107XG50cnkge1xuICAvL1RoaXMgdGhyb3dzIGFuIGV4cGVjdGlvbiBpZiBtb2R1bGUgZG9lcyBub3QgZXhpc3QuXG4gIGFuZ3VsYXIubW9kdWxlKCduZ1Nhbml0aXplJyk7XG4gIGRlcHMucHVzaCgnbmdTYW5pdGl6ZScpO1xufSBjYXRjaCAoZSkge31cblxudHJ5IHtcbiAgLy9UaGlzIHRocm93cyBhbiBleHBlY3Rpb24gaWYgbW9kdWxlIGRvZXMgbm90IGV4aXN0LlxuICBhbmd1bGFyLm1vZHVsZSgndWkuc29ydGFibGUnKTtcbiAgZGVwcy5wdXNoKCd1aS5zb3J0YWJsZScpO1xufSBjYXRjaCAoZSkge31cblxudHJ5IHtcbiAgLy9UaGlzIHRocm93cyBhbiBleHBlY3Rpb24gaWYgbW9kdWxlIGRvZXMgbm90IGV4aXN0LlxuICBhbmd1bGFyLm1vZHVsZSgnYW5ndWxhclNwZWN0cnVtQ29sb3JwaWNrZXInKTtcbiAgZGVwcy5wdXNoKCdhbmd1bGFyU3BlY3RydW1Db2xvcnBpY2tlcicpO1xufSBjYXRjaCAoZSkge31cblxuYW5ndWxhci5tb2R1bGUoJ3NjaGVtYUZvcm0nLCBkZXBzKTtcblxuYW5ndWxhci5tb2R1bGUoJ3NjaGVtYUZvcm0nKS5wcm92aWRlcignc2ZQYXRoJyxcblsnT2JqZWN0UGF0aFByb3ZpZGVyJywgZnVuY3Rpb24oT2JqZWN0UGF0aFByb3ZpZGVyKSB7XG4gIHZhciBPYmplY3RQYXRoID0ge3BhcnNlOiBPYmplY3RQYXRoUHJvdmlkZXIucGFyc2V9O1xuXG4gIC8vIGlmIHdlJ3JlIG9uIEFuZ3VsYXIgMS4yLngsIHdlIG5lZWQgdG8gY29udGludWUgdXNpbmcgZG90IG5vdGF0aW9uXG4gIGlmIChhbmd1bGFyLnZlcnNpb24ubWFqb3IgPT09IDEgJiYgYW5ndWxhci52ZXJzaW9uLm1pbm9yIDwgMykge1xuICAgIE9iamVjdFBhdGguc3RyaW5naWZ5ID0gZnVuY3Rpb24oYXJyKSB7XG4gICAgICByZXR1cm4gQXJyYXkuaXNBcnJheShhcnIpID8gYXJyLmpvaW4oJy4nKSA6IGFyci50b1N0cmluZygpO1xuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgT2JqZWN0UGF0aC5zdHJpbmdpZnkgPSBPYmplY3RQYXRoUHJvdmlkZXIuc3RyaW5naWZ5O1xuICB9XG5cbiAgLy8gV2Ugd2FudCB0aGlzIHRvIHVzZSB3aGljaGV2ZXIgc3RyaW5naWZ5IG1ldGhvZCBpcyBkZWZpbmVkIGFib3ZlLFxuICAvLyBzbyB3ZSBoYXZlIHRvIGNvcHkgdGhlIGNvZGUgaGVyZS5cbiAgT2JqZWN0UGF0aC5ub3JtYWxpemUgPSBmdW5jdGlvbihkYXRhLCBxdW90ZSkge1xuICAgIHJldHVybiBPYmplY3RQYXRoLnN0cmluZ2lmeShBcnJheS5pc0FycmF5KGRhdGEpID8gZGF0YSA6IE9iamVjdFBhdGgucGFyc2UoZGF0YSksIHF1b3RlKTtcbiAgfTtcblxuICB0aGlzLnBhcnNlID0gT2JqZWN0UGF0aC5wYXJzZTtcbiAgdGhpcy5zdHJpbmdpZnkgPSBPYmplY3RQYXRoLnN0cmluZ2lmeTtcbiAgdGhpcy5ub3JtYWxpemUgPSBPYmplY3RQYXRoLm5vcm1hbGl6ZTtcbiAgdGhpcy4kZ2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIE9iamVjdFBhdGg7XG4gIH07XG59XSk7XG5cbi8qKlxuICogQG5nZG9jIHNlcnZpY2VcbiAqIEBuYW1lIHNmU2VsZWN0XG4gKiBAa2luZCBmdW5jdGlvblxuICpcbiAqL1xuYW5ndWxhci5tb2R1bGUoJ3NjaGVtYUZvcm0nKS5mYWN0b3J5KCdzZlNlbGVjdCcsIFsnc2ZQYXRoJywgZnVuY3Rpb24oc2ZQYXRoKSB7XG4gIHZhciBudW1SZSA9IC9eXFxkKyQvO1xuXG4gIC8qKlxuICAgICogQGRlc2NyaXB0aW9uXG4gICAgKiBVdGlsaXR5IG1ldGhvZCB0byBhY2Nlc3MgZGVlcCBwcm9wZXJ0aWVzIHdpdGhvdXRcbiAgICAqIHRocm93aW5nIGVycm9ycyB3aGVuIHRoaW5ncyBhcmUgbm90IGRlZmluZWQuXG4gICAgKiBDYW4gYWxzbyBzZXQgYSB2YWx1ZSBpbiBhIGRlZXAgc3RydWN0dXJlLCBjcmVhdGluZyBvYmplY3RzIHdoZW4gbWlzc2luZ1xuICAgICogZXguXG4gICAgKiB2YXIgZm9vID0gU2VsZWN0KCdhZGRyZXNzLmNvbnRhY3QubmFtZScsb2JqKVxuICAgICogU2VsZWN0KCdhZGRyZXNzLmNvbnRhY3QubmFtZScsb2JqLCdMZWVyb3knKVxuICAgICpcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBwcm9qZWN0aW9uIEEgZG90IHBhdGggdG8gdGhlIHByb3BlcnR5IHlvdSB3YW50IHRvIGdldC9zZXRcbiAgICAqIEBwYXJhbSB7b2JqZWN0fSBvYmogICAob3B0aW9uYWwpIFRoZSBvYmplY3QgdG8gcHJvamVjdCBvbiwgZGVmYXVsdHMgdG8gJ3RoaXMnXG4gICAgKiBAcGFyYW0ge0FueX0gICAgdmFsdWVUb1NldCAob3Bpb25hbCkgIFRoZSB2YWx1ZSB0byBzZXQsIGlmIHBhcnRzIG9mIHRoZSBwYXRoIG9mXG4gICAgKiAgICAgICAgICAgICAgICAgdGhlIHByb2plY3Rpb24gaXMgbWlzc2luZyBlbXB0eSBvYmplY3RzIHdpbGwgYmUgY3JlYXRlZC5cbiAgICAqIEByZXR1cm5zIHtBbnl8dW5kZWZpbmVkfSByZXR1cm5zIHRoZSB2YWx1ZSBhdCB0aGUgZW5kIG9mIHRoZSBwcm9qZWN0aW9uIHBhdGhcbiAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICBvciB1bmRlZmluZWQgaWYgdGhlcmUgaXMgbm9uZS5cbiAgICAqL1xuICByZXR1cm4gZnVuY3Rpb24ocHJvamVjdGlvbiwgb2JqLCB2YWx1ZVRvU2V0KSB7XG4gICAgaWYgKCFvYmopIHtcbiAgICAgIG9iaiA9IHRoaXM7XG4gICAgfVxuICAgIC8vU3VwcG9ydCBbXSBhcnJheSBzeW50YXhcbiAgICB2YXIgcGFydHMgPSB0eXBlb2YgcHJvamVjdGlvbiA9PT0gJ3N0cmluZycgPyBzZlBhdGgucGFyc2UocHJvamVjdGlvbikgOiBwcm9qZWN0aW9uO1xuXG4gICAgaWYgKHR5cGVvZiB2YWx1ZVRvU2V0ICE9PSAndW5kZWZpbmVkJyAmJiBwYXJ0cy5sZW5ndGggPT09IDEpIHtcbiAgICAgIC8vc3BlY2lhbCBjYXNlLCBqdXN0IHNldHRpbmcgb25lIHZhcmlhYmxlXG4gICAgICBvYmpbcGFydHNbMF1dID0gdmFsdWVUb1NldDtcbiAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB2YWx1ZVRvU2V0ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAgICB0eXBlb2Ygb2JqW3BhcnRzWzBdXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAvLyBXZSBuZWVkIHRvIGxvb2sgYWhlYWQgdG8gY2hlY2sgaWYgYXJyYXkgaXMgYXBwcm9wcmlhdGVcbiAgICAgIG9ialtwYXJ0c1swXV0gPSBwYXJ0cy5sZW5ndGggPiAyICYmIG51bVJlLnRlc3QocGFydHNbMV0pID8gW10gOiB7fTtcbiAgICB9XG5cbiAgICB2YXIgdmFsdWUgPSBvYmpbcGFydHNbMF1dO1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgcGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIFNwZWNpYWwgY2FzZTogV2UgYWxsb3cgSlNPTiBGb3JtIHN5bnRheCBmb3IgYXJyYXlzIHVzaW5nIGVtcHR5IGJyYWNrZXRzXG4gICAgICAvLyBUaGVzZSB3aWxsIG9mIGNvdXJzZSBub3Qgd29yayBoZXJlIHNvIHdlIGV4aXQgaWYgdGhleSBhcmUgZm91bmQuXG4gICAgICBpZiAocGFydHNbaV0gPT09ICcnKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHZhbHVlVG9TZXQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGlmIChpID09PSBwYXJ0cy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgLy9sYXN0IHN0ZXAuIExldCdzIHNldCB0aGUgdmFsdWVcbiAgICAgICAgICB2YWx1ZVtwYXJ0c1tpXV0gPSB2YWx1ZVRvU2V0O1xuICAgICAgICAgIHJldHVybiB2YWx1ZVRvU2V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE1ha2Ugc3VyZSB0byBjcmVhdGUgbmV3IG9iamVjdHMgb24gdGhlIHdheSBpZiB0aGV5IGFyZSBub3QgdGhlcmUuXG4gICAgICAgICAgLy8gV2UgbmVlZCB0byBsb29rIGFoZWFkIHRvIGNoZWNrIGlmIGFycmF5IGlzIGFwcHJvcHJpYXRlXG4gICAgICAgICAgdmFyIHRtcCA9IHZhbHVlW3BhcnRzW2ldXTtcbiAgICAgICAgICBpZiAodHlwZW9mIHRtcCA9PT0gJ3VuZGVmaW5lZCcgfHwgdG1wID09PSBudWxsKSB7XG4gICAgICAgICAgICB0bXAgPSBudW1SZS50ZXN0KHBhcnRzW2kgKyAxXSkgPyBbXSA6IHt9O1xuICAgICAgICAgICAgdmFsdWVbcGFydHNbaV1dID0gdG1wO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YWx1ZSA9IHRtcDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh2YWx1ZSkge1xuICAgICAgICAvL0p1c3QgZ2V0IG5leCB2YWx1ZS5cbiAgICAgICAgdmFsdWUgPSB2YWx1ZVtwYXJ0c1tpXV07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcbn1dKTtcblxuYW5ndWxhci5tb2R1bGUoJ3NjaGVtYUZvcm0nKS5wcm92aWRlcignc2NoZW1hRm9ybURlY29yYXRvcnMnLFxuWyckY29tcGlsZVByb3ZpZGVyJywgJ3NmUGF0aFByb3ZpZGVyJywgZnVuY3Rpb24oJGNvbXBpbGVQcm92aWRlciwgc2ZQYXRoUHJvdmlkZXIpIHtcbiAgdmFyIGRlZmF1bHREZWNvcmF0b3IgPSAnJztcbiAgdmFyIGRpcmVjdGl2ZXMgPSB7fTtcblxuICB2YXIgdGVtcGxhdGVVcmwgPSBmdW5jdGlvbihuYW1lLCBmb3JtKSB7XG4gICAgLy9zY2hlbWFEZWNvcmF0b3IgaXMgYWxpYXMgZm9yIHdoYXRldmVyIGlzIHNldCBhcyBkZWZhdWx0XG4gICAgaWYgKG5hbWUgPT09ICdzZkRlY29yYXRvcicpIHtcbiAgICAgIG5hbWUgPSBkZWZhdWx0RGVjb3JhdG9yO1xuICAgIH1cblxuICAgIHZhciBkaXJlY3RpdmUgPSBkaXJlY3RpdmVzW25hbWVdO1xuXG4gICAgLy9ydWxlcyBmaXJzdFxuICAgIHZhciBydWxlcyA9IGRpcmVjdGl2ZS5ydWxlcztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJ1bGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgcmVzID0gcnVsZXNbaV0oZm9ybSk7XG4gICAgICBpZiAocmVzKSB7XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy90aGVuIGNoZWNrIG1hcHBpbmdcbiAgICBpZiAoZGlyZWN0aXZlLm1hcHBpbmdzW2Zvcm0udHlwZV0pIHtcbiAgICAgIHJldHVybiBkaXJlY3RpdmUubWFwcGluZ3NbZm9ybS50eXBlXTtcbiAgICB9XG5cbiAgICAvL3RyeSBkZWZhdWx0XG4gICAgcmV0dXJuIGRpcmVjdGl2ZS5tYXBwaW5nc1snZGVmYXVsdCddO1xuICB9O1xuXG4gIHZhciBjcmVhdGVEaXJlY3RpdmUgPSBmdW5jdGlvbihuYW1lLCBvcHRpb25zKSB7XG4gICAgJGNvbXBpbGVQcm92aWRlci5kaXJlY3RpdmUobmFtZSwgWyckcGFyc2UnLCAnJGNvbXBpbGUnLCAnJGh0dHAnLCAnJHRlbXBsYXRlQ2FjaGUnLFxuICAgICAgZnVuY3Rpb24oJHBhcnNlLCAgJGNvbXBpbGUsICAkaHR0cCwgICR0ZW1wbGF0ZUNhY2hlKSB7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICByZXN0cmljdDogJ0FFJyxcbiAgICAgICAgICByZXBsYWNlOiBmYWxzZSxcbiAgICAgICAgICB0cmFuc2NsdWRlOiBmYWxzZSxcbiAgICAgICAgICBzY29wZTogdHJ1ZSxcbiAgICAgICAgICByZXF1aXJlOiAnP15zZlNjaGVtYScsXG4gICAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBzZlNjaGVtYSkge1xuICAgICAgICAgICAgLy9yZWJpbmQgb3VyIHBhcnQgb2YgdGhlIGZvcm0gdG8gdGhlIHNjb3BlLlxuICAgICAgICAgICAgdmFyIG9uY2UgPSBzY29wZS4kd2F0Y2goYXR0cnMuZm9ybSwgZnVuY3Rpb24oZm9ybSkge1xuXG4gICAgICAgICAgICAgIGlmIChmb3JtKSB7XG4gICAgICAgICAgICAgICAgc2NvcGUuZm9ybSAgPSBmb3JtO1xuXG4gICAgICAgICAgICAgICAgLy9vayBsZXQncyByZXBsYWNlIHRoYXQgdGVtcGxhdGUhXG4gICAgICAgICAgICAgICAgLy9XZSBkbyB0aGlzIG1hbnVhbGx5IHNpbmNlIHdlIG5lZWQgdG8gYmluZCBuZy1tb2RlbCBwcm9wZXJseSBhbmQgYWxzb1xuICAgICAgICAgICAgICAgIC8vZm9yIGZpZWxkc2V0cyB0byByZWN1cnNlIHByb3Blcmx5LlxuICAgICAgICAgICAgICAgIHZhciB1cmwgPSB0ZW1wbGF0ZVVybChuYW1lLCBmb3JtKTtcbiAgICAgICAgICAgICAgICAkaHR0cC5nZXQodXJsLCB7Y2FjaGU6ICR0ZW1wbGF0ZUNhY2hlfSkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBmb3JtLmtleSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2ZQYXRoUHJvdmlkZXIuc3RyaW5naWZ5KGZvcm0ua2V5KS5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7JykgOiAnJztcbiAgICAgICAgICAgICAgICAgIHZhciB0ZW1wbGF0ZSA9IHJlcy5kYXRhLnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgIC9cXCRcXCR2YWx1ZVxcJFxcJC9nLFxuICAgICAgICAgICAgICAgICAgICAnbW9kZWwnICsgKGtleVswXSAhPT0gJ1snID8gJy4nIDogJycpICsga2V5XG4gICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLmNsYXNzTmFtZSkge1xuICAgICAgICAgICAgICAgICAgXHRlbGVtZW50LmFkZENsYXNzKG9wdGlvbnMuY2xhc3NOYW1lKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGVsZW1lbnQuaHRtbCh0ZW1wbGF0ZSk7XG4gICAgICAgICAgICAgICAgICAkY29tcGlsZShlbGVtZW50LmNvbnRlbnRzKCkpKHNjb3BlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBvbmNlKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvL0tlZXAgZXJyb3IgcHJvbmUgbG9naWMgZnJvbSB0aGUgdGVtcGxhdGVcbiAgICAgICAgICAgIHNjb3BlLnNob3dUaXRsZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gc2NvcGUuZm9ybSAmJiBzY29wZS5mb3JtLm5vdGl0bGUgIT09IHRydWUgJiYgc2NvcGUuZm9ybS50aXRsZTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNjb3BlLmxpc3RUb0NoZWNrYm94VmFsdWVzID0gZnVuY3Rpb24obGlzdCkge1xuICAgICAgICAgICAgICB2YXIgdmFsdWVzID0ge307XG4gICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChsaXN0LCBmdW5jdGlvbih2KSB7XG4gICAgICAgICAgICAgICAgdmFsdWVzW3ZdID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIHJldHVybiB2YWx1ZXM7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzY29wZS5jaGVja2JveFZhbHVlc1RvTGlzdCA9IGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICAgICAgICB2YXIgbHN0ID0gW107XG4gICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCh2YWx1ZXMsIGZ1bmN0aW9uKHYsIGspIHtcbiAgICAgICAgICAgICAgICBpZiAodikge1xuICAgICAgICAgICAgICAgICAgbHN0LnB1c2goayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgcmV0dXJuIGxzdDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNjb3BlLmJ1dHRvbkNsaWNrID0gZnVuY3Rpb24oJGV2ZW50LCBmb3JtKSB7XG4gICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24oZm9ybS5vbkNsaWNrKSkge1xuICAgICAgICAgICAgICAgIGZvcm0ub25DbGljaygkZXZlbnQsIGZvcm0pO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGFuZ3VsYXIuaXNTdHJpbmcoZm9ybS5vbkNsaWNrKSkge1xuICAgICAgICAgICAgICAgIGlmIChzZlNjaGVtYSkge1xuICAgICAgICAgICAgICAgICAgLy9ldmFsdWF0aW5nIGluIHNjb3BlIG91dHNpZGUgb2Ygc2ZTY2hlbWFzIGlzb2xhdGVkIHNjb3BlXG4gICAgICAgICAgICAgICAgICBzZlNjaGVtYS5ldmFsSW5QYXJlbnRTY29wZShmb3JtLm9uQ2xpY2ssIHsnJGV2ZW50JzogJGV2ZW50LCBmb3JtOiBmb3JtfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHNjb3BlLiRldmFsKGZvcm0ub25DbGljaywgeyckZXZlbnQnOiAkZXZlbnQsIGZvcm06IGZvcm19KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogRXZhbHVhdGUgYW4gZXhwcmVzc2lvbiwgaS5lLiBzY29wZS4kZXZhbFxuICAgICAgICAgICAgICogYnV0IGRvIGl0IGluIHNmU2NoZW1hcyBwYXJlbnQgc2NvcGUgc2Ytc2NoZW1hIGRpcmVjdGl2ZSBpcyB1c2VkXG4gICAgICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXhwcmVzc2lvblxuICAgICAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGxvY2FscyAob3B0aW9uYWwpXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHtBbnl9IHRoZSByZXN1bHQgb2YgdGhlIGV4cHJlc3Npb25cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgc2NvcGUuZXZhbEV4cHIgPSBmdW5jdGlvbihleHByZXNzaW9uLCBsb2NhbHMpIHtcbiAgICAgICAgICAgICAgaWYgKHNmU2NoZW1hKSB7XG4gICAgICAgICAgICAgICAgLy9ldmFsdWF0aW5nIGluIHNjb3BlIG91dHNpZGUgb2Ygc2ZTY2hlbWFzIGlzb2xhdGVkIHNjb3BlXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNmU2NoZW1hLmV2YWxJblBhcmVudFNjb3BlKGV4cHJlc3Npb24sIGxvY2Fscyk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICByZXR1cm4gc2NvcGUuJGV2YWwoZXhwcmVzc2lvbiwgbG9jYWxzKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogRXZhbHVhdGUgYW4gZXhwcmVzc2lvbiwgaS5lLiBzY29wZS4kZXZhbFxuICAgICAgICAgICAgICogaW4gdGhpcyBkZWNvcmF0b3JzIHNjb3BlXG4gICAgICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXhwcmVzc2lvblxuICAgICAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGxvY2FscyAob3B0aW9uYWwpXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHtBbnl9IHRoZSByZXN1bHQgb2YgdGhlIGV4cHJlc3Npb25cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgc2NvcGUuZXZhbEluU2NvcGUgPSBmdW5jdGlvbihleHByZXNzaW9uLCBsb2NhbHMpIHtcbiAgICAgICAgICAgICAgaWYgKGV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2NvcGUuJGV2YWwoZXhwcmVzc2lvbiwgbG9jYWxzKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBFcnJvciBtZXNzYWdlIGhhbmRsZXJcbiAgICAgICAgICAgICAqIEFuIGVycm9yIGNhbiBlaXRoZXIgYmUgYSBzY2hlbWEgdmFsaWRhdGlvbiBtZXNzYWdlIG9yIGEgYW5ndWxhciBqcyB2YWxpZHRpb25cbiAgICAgICAgICAgICAqIGVycm9yIChpLmUuIHJlcXVpcmVkKVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBzY29wZS5lcnJvck1lc3NhZ2UgPSBmdW5jdGlvbihzY2hlbWFFcnJvcikge1xuICAgICAgICAgICAgICAvL1VzZXIgaGFzIHN1cHBsaWVkIHZhbGlkYXRpb24gbWVzc2FnZXNcbiAgICAgICAgICAgICAgaWYgKHNjb3BlLmZvcm0udmFsaWRhdGlvbk1lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgICBpZiAoc2NoZW1hRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzU3RyaW5nKHNjb3BlLmZvcm0udmFsaWRhdGlvbk1lc3NhZ2UpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzY29wZS5mb3JtLnZhbGlkYXRpb25NZXNzYWdlO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICByZXR1cm4gc2NvcGUuZm9ybS52YWxpZGF0aW9uTWVzc2FnZVtzY2hlbWFFcnJvci5jb2RlXSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmZvcm0udmFsaWRhdGlvbk1lc3NhZ2VbJ2RlZmF1bHQnXTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHNjb3BlLmZvcm0udmFsaWRhdGlvbk1lc3NhZ2UubnVtYmVyIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuZm9ybS52YWxpZGF0aW9uTWVzc2FnZVsnZGVmYXVsdCddIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuZm9ybS52YWxpZGF0aW9uTWVzc2FnZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvL05vIHVzZXIgc3VwcGxpZWQgdmFsaWRhdGlvbiBtZXNzYWdlLlxuICAgICAgICAgICAgICBpZiAoc2NoZW1hRXJyb3IpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2NoZW1hRXJyb3IubWVzc2FnZTsgLy91c2UgdHY0LmpzIHZhbGlkYXRpb24gbWVzc2FnZVxuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLy9PdGhlcndpc2Ugd2Ugb25seSBoYXZlIGlucHV0IG51bWJlciBub3QgYmVpbmcgYSBudW1iZXJcbiAgICAgICAgICAgICAgcmV0dXJuICdOb3QgYSBudW1iZXInO1xuXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICBdKTtcbiAgfTtcblxuICB2YXIgY3JlYXRlTWFudWFsRGlyZWN0aXZlID0gZnVuY3Rpb24odHlwZSwgdGVtcGxhdGVVcmwsIHRyYW5zY2x1ZGUpIHtcbiAgICB0cmFuc2NsdWRlID0gYW5ndWxhci5pc0RlZmluZWQodHJhbnNjbHVkZSkgPyB0cmFuc2NsdWRlIDogZmFsc2U7XG4gICAgJGNvbXBpbGVQcm92aWRlci5kaXJlY3RpdmUoJ3NmJyArIGFuZ3VsYXIudXBwZXJjYXNlKHR5cGVbMF0pICsgdHlwZS5zdWJzdHIoMSksIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFQUMnLFxuICAgICAgICBzY29wZTogdHJ1ZSxcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJhbnNjbHVkZSxcbiAgICAgICAgdGVtcGxhdGU6ICc8c2YtZGVjb3JhdG9yIGZvcm09XCJmb3JtXCI+PC9zZi1kZWNvcmF0b3I+JyxcbiAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgdmFyIHdhdGNoVGhpcyA9IHtcbiAgICAgICAgICAgICdpdGVtcyc6ICdjJyxcbiAgICAgICAgICAgICd0aXRsZU1hcCc6ICdjJyxcbiAgICAgICAgICAgICdzY2hlbWEnOiAnYydcbiAgICAgICAgICB9O1xuICAgICAgICAgIHZhciBmb3JtID0ge3R5cGU6IHR5cGV9O1xuICAgICAgICAgIHZhciBvbmNlID0gdHJ1ZTtcbiAgICAgICAgICBhbmd1bGFyLmZvckVhY2goYXR0cnMsIGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICAgICAgICBpZiAobmFtZVswXSAhPT0gJyQnICYmIG5hbWUuaW5kZXhPZignbmcnKSAhPT0gMCAmJiBuYW1lICE9PSAnc2ZGaWVsZCcpIHtcblxuICAgICAgICAgICAgICB2YXIgdXBkYXRlRm9ybSA9IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZCh2YWwpICYmIHZhbCAhPT0gZm9ybVtuYW1lXSkge1xuICAgICAgICAgICAgICAgICAgZm9ybVtuYW1lXSA9IHZhbDtcblxuICAgICAgICAgICAgICAgICAgLy93aGVuIHdlIGhhdmUgdHlwZSwgYW5kIGlmIHNwZWNpZmllZCBrZXkgd2UgYXBwbHkgaXQgb24gc2NvcGUuXG4gICAgICAgICAgICAgICAgICBpZiAob25jZSAmJiBmb3JtLnR5cGUgJiYgKGZvcm0ua2V5IHx8IGFuZ3VsYXIuaXNVbmRlZmluZWQoYXR0cnMua2V5KSkpIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuZm9ybSA9IGZvcm07XG4gICAgICAgICAgICAgICAgICAgIG9uY2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgaWYgKG5hbWUgPT09ICdtb2RlbCcpIHtcbiAgICAgICAgICAgICAgICAvL1wibW9kZWxcIiBpcyBib3VuZCB0byBzY29wZSB1bmRlciB0aGUgbmFtZSBcIm1vZGVsXCIgc2luY2UgdGhpcyBpcyB3aGF0IHRoZSBkZWNvcmF0b3JzXG4gICAgICAgICAgICAgICAgLy9rbm93IGFuZCBsb3ZlLlxuICAgICAgICAgICAgICAgIHNjb3BlLiR3YXRjaCh2YWx1ZSwgZnVuY3Rpb24odmFsKSB7XG4gICAgICAgICAgICAgICAgICBpZiAodmFsICYmIHNjb3BlLm1vZGVsICE9PSB2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUubW9kZWwgPSB2YWw7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAod2F0Y2hUaGlzW25hbWVdID09PSAnYycpIHtcbiAgICAgICAgICAgICAgICAvL3dhdGNoIGNvbGxlY3Rpb25cbiAgICAgICAgICAgICAgICBzY29wZS4kd2F0Y2hDb2xsZWN0aW9uKHZhbHVlLCB1cGRhdGVGb3JtKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyRvYnNlcnZlXG4gICAgICAgICAgICAgICAgYXR0cnMuJG9ic2VydmUobmFtZSwgdXBkYXRlRm9ybSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KTtcbiAgfTtcblxuICAvKipcbiAgICogQ3JlYXRlIGEgZGVjb3JhdG9yIGRpcmVjdGl2ZSBhbmQgaXRzIHNpYmxpbmcgXCJtYW51YWxcIiB1c2UgZGlyZWN0aXZlcy5cbiAgICogVGhlIGRpcmVjdGl2ZSBjYW4gYmUgdXNlZCB0byBjcmVhdGUgZm9ybSBmaWVsZHMgb3Igb3RoZXIgZm9ybSBlbnRpdGllcy5cbiAgICogSXQgY2FuIGJlIHVzZWQgaW4gY29uanVuY3Rpb24gd2l0aCA8c2NoZW1hLWZvcm0+IGRpcmVjdGl2ZSBpbiB3aGljaCBjYXNlIHRoZSBkZWNvcmF0b3IgaXNcbiAgICogZ2l2ZW4gaXQncyBjb25maWd1cmF0aW9uIHZpYSBhIHRoZSBcImZvcm1cIiBhdHRyaWJ1dGUuXG4gICAqXG4gICAqIGV4LiBCYXNpYyB1c2FnZVxuICAgKiAgIDxzZi1kZWNvcmF0b3IgZm9ybT1cIm15Zm9ybVwiPjwvc2YtZGVjb3JhdG9yPlxuICAgKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgZGlyZWN0aXZlIG5hbWUgKENhbWVsQ2FzZWQpXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBtYXBwaW5ncywgYW4gb2JqZWN0IHRoYXQgbWFwcyBcInR5cGVcIiA9PiBcInRlbXBsYXRlVXJsXCJcbiAgICogQHBhcmFtIHtBcnJheX0gIHJ1bGVzIChvcHRpb25hbCkgYSBsaXN0IG9mIGZ1bmN0aW9ucywgZnVuY3Rpb24oZm9ybSkge30sIHRoYXQgYXJlIGVhY2ggdHJpZWQgaW5cbiAgICogICAgICAgICAgICAgICAgIHR1cm4sXG4gICAqICAgICAgICAgICAgICAgICBpZiB0aGV5IHJldHVybiBhIHN0cmluZyB0aGVuIHRoYXQgaXMgdXNlZCBhcyB0aGUgdGVtcGxhdGVVcmwuIFJ1bGVzIGNvbWUgYmVmb3JlXG4gICAqICAgICAgICAgICAgICAgICBtYXBwaW5ncy5cbiAgICovXG4gIHRoaXMuY3JlYXRlRGVjb3JhdG9yID0gZnVuY3Rpb24obmFtZSwgbWFwcGluZ3MsIHJ1bGVzLCBvcHRpb25zKSB7XG4gICAgZGlyZWN0aXZlc1tuYW1lXSA9IHtcbiAgICAgIG1hcHBpbmdzOiBtYXBwaW5ncyB8fCB7fSxcbiAgICAgIHJ1bGVzOiAgICBydWxlcyAgICB8fCBbXVxuICAgIH07XG5cbiAgICBpZiAoIWRpcmVjdGl2ZXNbZGVmYXVsdERlY29yYXRvcl0pIHtcbiAgICAgIGRlZmF1bHREZWNvcmF0b3IgPSBuYW1lO1xuICAgIH1cbiAgICBjcmVhdGVEaXJlY3RpdmUobmFtZSwgb3B0aW9ucyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBkaXJlY3RpdmUgb2YgYSBkZWNvcmF0b3JcbiAgICogVXNhYmxlIHdoZW4geW91IHdhbnQgdG8gdXNlIHRoZSBkZWNvcmF0b3JzIHdpdGhvdXQgdXNpbmcgPHNjaGVtYS1mb3JtPiBkaXJlY3RpdmUuXG4gICAqIFNwZWNpZmljYWxseSB3aGVuIHlvdSBuZWVkIHRvIHJldXNlIHN0eWxpbmcuXG4gICAqXG4gICAqIGV4LiBjcmVhdGVEaXJlY3RpdmUoJ3RleHQnLCcuLi4nKVxuICAgKiAgPHNmLXRleHQgdGl0bGU9XCJmb29iYXJcIiBtb2RlbD1cInBlcnNvblwiIGtleT1cIm5hbWVcIiBzY2hlbWE9XCJzY2hlbWFcIj48L3NmLXRleHQ+XG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSAgdHlwZSBUaGUgdHlwZSBvZiB0aGUgZGlyZWN0aXZlLCByZXN1bHRpbmcgZGlyZWN0aXZlIHdpbGwgaGF2ZSBzZi0gcHJlZml4ZWRcbiAgICogQHBhcmFtIHtzdHJpbmd9ICB0ZW1wbGF0ZVVybFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHRyYW5zY2x1ZGUgKG9wdGlvbmFsKSBzZXRzIHRyYW5zY2x1ZGUgb3B0aW9uIG9mIGRpcmVjdGl2ZSwgZGVmYXVsdHMgdG8gZmFsc2UuXG4gICAqL1xuICB0aGlzLmNyZWF0ZURpcmVjdGl2ZSA9IGNyZWF0ZU1hbnVhbERpcmVjdGl2ZTtcblxuICAvKipcbiAgICogU2FtZSBhcyBjcmVhdGVEaXJlY3RpdmUsIGJ1dCB0YWtlcyBhbiBvYmplY3Qgd2hlcmUga2V5IGlzICd0eXBlJyBhbmQgdmFsdWUgaXMgJ3RlbXBsYXRlVXJsJ1xuICAgKiBVc2VmdWwgZm9yIGJhdGNoaW5nLlxuICAgKiBAcGFyYW0ge09iamVjdH0gbWFwcGluZ3NcbiAgICovXG4gIHRoaXMuY3JlYXRlRGlyZWN0aXZlcyA9IGZ1bmN0aW9uKG1hcHBpbmdzKSB7XG4gICAgYW5ndWxhci5mb3JFYWNoKG1hcHBpbmdzLCBmdW5jdGlvbih1cmwsIHR5cGUpIHtcbiAgICAgIGNyZWF0ZU1hbnVhbERpcmVjdGl2ZSh0eXBlLCB1cmwpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBHZXR0ZXIgZm9yIGRpcmVjdGl2ZSBtYXBwaW5nc1xuICAgKiBDYW4gYmUgdXNlZCB0byBvdmVycmlkZSBhIG1hcHBpbmcgb3IgYWRkIGEgcnVsZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAob3B0aW9uYWwpIGRlZmF1bHRzIHRvIGRlZmF1bHREZWNvcmF0b3JcbiAgICogQHJldHVybiB7T2JqZWN0fSBydWxlcyBhbmQgbWFwcGluZ3MgeyBydWxlczogW10sbWFwcGluZ3M6IHt9fVxuICAgKi9cbiAgdGhpcy5kaXJlY3RpdmUgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgbmFtZSA9IG5hbWUgfHwgZGVmYXVsdERlY29yYXRvcjtcbiAgICByZXR1cm4gZGlyZWN0aXZlc1tuYW1lXTtcbiAgfTtcblxuICAvKipcbiAgICogQWRkcyBhIG1hcHBpbmcgdG8gYW4gZXhpc3RpbmcgZGVjb3JhdG9yLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSBEZWNvcmF0b3IgbmFtZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gdHlwZSBGb3JtIHR5cGUgZm9yIHRoZSBtYXBwaW5nXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB1cmwgIFRoZSB0ZW1wbGF0ZSB1cmxcbiAgICovXG4gIHRoaXMuYWRkTWFwcGluZyA9IGZ1bmN0aW9uKG5hbWUsIHR5cGUsIHVybCkge1xuICAgIGlmIChkaXJlY3RpdmVzW25hbWVdKSB7XG4gICAgICBkaXJlY3RpdmVzW25hbWVdLm1hcHBpbmdzW3R5cGVdID0gdXJsO1xuICAgIH1cbiAgfTtcblxuICAvL1NlcnZpY2UgaXMganVzdCBhIGdldHRlciBmb3IgZGlyZWN0aXZlIG1hcHBpbmdzIGFuZCBydWxlc1xuICB0aGlzLiRnZXQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZGlyZWN0aXZlOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIHJldHVybiBkaXJlY3RpdmVzW25hbWVdO1xuICAgICAgfSxcbiAgICAgIGRlZmF1bHREZWNvcmF0b3I6IGRlZmF1bHREZWNvcmF0b3JcbiAgICB9O1xuICB9O1xuXG4gIC8vQ3JlYXRlIGEgZGVmYXVsdCBkaXJlY3RpdmVcbiAgY3JlYXRlRGlyZWN0aXZlKCdzZkRlY29yYXRvcicpO1xuXG59XSk7XG5cbi8qKlxuICogU2NoZW1hIGZvcm0gc2VydmljZS5cbiAqIFRoaXMgc2VydmljZSBpcyBub3QgdGhhdCB1c2VmdWwgb3V0c2lkZSBvZiBzY2hlbWEgZm9ybSBkaXJlY3RpdmVcbiAqIGJ1dCBtYWtlcyB0aGUgY29kZSBtb3JlIHRlc3RhYmxlLlxuICovXG5hbmd1bGFyLm1vZHVsZSgnc2NoZW1hRm9ybScpLnByb3ZpZGVyKCdzY2hlbWFGb3JtJyxcblsnc2ZQYXRoUHJvdmlkZXInLCBmdW5jdGlvbihzZlBhdGhQcm92aWRlcikge1xuXG4gIC8vQ3JlYXRlcyBhbiBkZWZhdWx0IHRpdGxlTWFwIGxpc3QgZnJvbSBhbiBlbnVtLCBpLmUuIGEgbGlzdCBvZiBzdHJpbmdzLlxuICB2YXIgZW51bVRvVGl0bGVNYXAgPSBmdW5jdGlvbihlbm0pIHtcbiAgICB2YXIgdGl0bGVNYXAgPSBbXTsgLy9jYW5vbmljYWwgdGl0bGVNYXAgZm9ybWF0IGlzIGEgbGlzdC5cbiAgICBlbm0uZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICB0aXRsZU1hcC5wdXNoKHtuYW1lOiBuYW1lLCB2YWx1ZTogbmFtZX0pO1xuICAgIH0pO1xuICAgIHJldHVybiB0aXRsZU1hcDtcbiAgfTtcblxuICAvLyBUYWtlcyBhIHRpdGxlTWFwIGluIGVpdGhlciBvYmplY3Qgb3IgbGlzdCBmb3JtYXQgYW5kIHJldHVybnMgb25lIGluXG4gIC8vIGluIHRoZSBsaXN0IGZvcm1hdC5cbiAgdmFyIGNhbm9uaWNhbFRpdGxlTWFwID0gZnVuY3Rpb24odGl0bGVNYXAsIG9yaWdpbmFsRW51bSkge1xuICAgIGlmICghYW5ndWxhci5pc0FycmF5KHRpdGxlTWFwKSkge1xuICAgICAgdmFyIGNhbm9uaWNhbCA9IFtdO1xuICAgICAgaWYgKG9yaWdpbmFsRW51bSkge1xuICAgICAgICBhbmd1bGFyLmZvckVhY2gob3JpZ2luYWxFbnVtLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgICBjYW5vbmljYWwucHVzaCh7bmFtZTogdGl0bGVNYXBbdmFsdWVdLCB2YWx1ZTogdmFsdWV9KTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhbmd1bGFyLmZvckVhY2godGl0bGVNYXAsIGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgICAgICAgY2Fub25pY2FsLnB1c2goe25hbWU6IG5hbWUsIHZhbHVlOiB2YWx1ZX0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjYW5vbmljYWw7XG4gICAgfVxuICAgIHJldHVybiB0aXRsZU1hcDtcbiAgfTtcblxuICB2YXIgZGVmYXVsdEZvcm1EZWZpbml0aW9uID0gZnVuY3Rpb24obmFtZSwgc2NoZW1hLCBvcHRpb25zKSB7XG4gICAgdmFyIHJ1bGVzID0gZGVmYXVsdHNbc2NoZW1hLnR5cGVdO1xuICAgIGlmIChydWxlcykge1xuICAgICAgdmFyIGRlZjtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcnVsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZGVmID0gcnVsZXNbaV0obmFtZSwgc2NoZW1hLCBvcHRpb25zKTtcbiAgICAgICAgLy9maXJzdCBoYW5kbGVyIGluIGxpc3QgdGhhdCBhY3R1YWxseSByZXR1cm5zIHNvbWV0aGluZyBpcyBvdXIgaGFuZGxlciFcbiAgICAgICAgaWYgKGRlZikge1xuICAgICAgICAgIHJldHVybiBkZWY7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLy9DcmVhdGVzIGEgZm9ybSBvYmplY3Qgd2l0aCBhbGwgY29tbW9uIHByb3BlcnRpZXNcbiAgdmFyIHN0ZEZvcm1PYmogPSBmdW5jdGlvbihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB2YXIgZiA9IG9wdGlvbnMuZ2xvYmFsICYmIG9wdGlvbnMuZ2xvYmFsLmZvcm1EZWZhdWx0cyA/XG4gICAgICAgICAgICBhbmd1bGFyLmNvcHkob3B0aW9ucy5nbG9iYWwuZm9ybURlZmF1bHRzKSA6IHt9O1xuICAgIGlmIChvcHRpb25zLmdsb2JhbCAmJiBvcHRpb25zLmdsb2JhbC5zdXByZXNzUHJvcGVydHlUaXRsZXMgPT09IHRydWUpIHtcbiAgICAgIGYudGl0bGUgPSBzY2hlbWEudGl0bGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGYudGl0bGUgPSBzY2hlbWEudGl0bGUgfHwgbmFtZTtcbiAgICB9XG5cbiAgICBpZiAoc2NoZW1hLmRlc2NyaXB0aW9uKSB7IGYuZGVzY3JpcHRpb24gPSBzY2hlbWEuZGVzY3JpcHRpb247IH1cbiAgICBpZiAob3B0aW9ucy5yZXF1aXJlZCA9PT0gdHJ1ZSB8fCBzY2hlbWEucmVxdWlyZWQgPT09IHRydWUpIHsgZi5yZXF1aXJlZCA9IHRydWU7IH1cbiAgICBpZiAoc2NoZW1hLm1heExlbmd0aCkgeyBmLm1heGxlbmd0aCA9IHNjaGVtYS5tYXhMZW5ndGg7IH1cbiAgICBpZiAoc2NoZW1hLm1pbkxlbmd0aCkgeyBmLm1pbmxlbmd0aCA9IHNjaGVtYS5tYXhMZW5ndGg7IH1cbiAgICBpZiAoc2NoZW1hLnJlYWRPbmx5IHx8IHNjaGVtYS5yZWFkb25seSkgeyBmLnJlYWRvbmx5ICA9IHRydWU7IH1cbiAgICBpZiAoc2NoZW1hLm1pbmltdW0pIHsgZi5taW5pbXVtID0gc2NoZW1hLm1pbmltdW0gKyAoc2NoZW1hLmV4Y2x1c2l2ZU1pbmltdW0gPyAxIDogMCk7IH1cbiAgICBpZiAoc2NoZW1hLm1heGltdW0pIHsgZi5tYXhpbXVtID0gc2NoZW1hLm1heGltdW0gLSAoc2NoZW1hLmV4Y2x1c2l2ZU1heGltdW0gPyAxIDogMCk7IH1cblxuICAgIC8vTm9uIHN0YW5kYXJkIGF0dHJpYnV0ZXNcbiAgICBpZiAoc2NoZW1hLnZhbGlkYXRpb25NZXNzYWdlKSB7IGYudmFsaWRhdGlvbk1lc3NhZ2UgPSBzY2hlbWEudmFsaWRhdGlvbk1lc3NhZ2U7IH1cbiAgICBpZiAoc2NoZW1hLmVudW1OYW1lcykgeyBmLnRpdGxlTWFwID0gY2Fub25pY2FsVGl0bGVNYXAoc2NoZW1hLmVudW1OYW1lcywgc2NoZW1hWydlbnVtJ10pOyB9XG4gICAgZi5zY2hlbWEgPSBzY2hlbWE7XG5cbiAgICAvLyBOZyBtb2RlbCBvcHRpb25zIGRvZXNuJ3QgcGxheSBuaWNlIHdpdGggdW5kZWZpbmVkLCBtaWdodCBiZSBkZWZpbmVkXG4gICAgLy8gZ2xvYmFsbHkgdGhvdWdoXG4gICAgZi5uZ01vZGVsT3B0aW9ucyA9IGYubmdNb2RlbE9wdGlvbnMgfHwge307XG4gICAgcmV0dXJuIGY7XG4gIH07XG5cbiAgdmFyIHRleHQgPSBmdW5jdGlvbihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpIHtcbiAgICBpZiAoc2NoZW1hLnR5cGUgPT09ICdzdHJpbmcnICYmICFzY2hlbWFbJ2VudW0nXSkge1xuICAgICAgdmFyIGYgPSBzdGRGb3JtT2JqKG5hbWUsIHNjaGVtYSwgb3B0aW9ucyk7XG4gICAgICBmLmtleSAgPSBvcHRpb25zLnBhdGg7XG4gICAgICBmLnR5cGUgPSAndGV4dCc7XG4gICAgICBvcHRpb25zLmxvb2t1cFtzZlBhdGhQcm92aWRlci5zdHJpbmdpZnkob3B0aW9ucy5wYXRoKV0gPSBmO1xuICAgICAgcmV0dXJuIGY7XG4gICAgfVxuICB9O1xuXG4gIC8vZGVmYXVsdCBpbiBqc29uIGZvcm0gZm9yIG51bWJlciBhbmQgaW50ZWdlciBpcyBhIHRleHQgZmllbGRcbiAgLy9pbnB1dCB0eXBlPVwibnVtYmVyXCIgd291bGQgYmUgbW9yZSBzdWl0YWJsZSBkb24ndCB5YSB0aGluaz9cbiAgdmFyIG51bWJlciA9IGZ1bmN0aW9uKG5hbWUsIHNjaGVtYSwgb3B0aW9ucykge1xuICAgIGlmIChzY2hlbWEudHlwZSA9PT0gJ251bWJlcicpIHtcbiAgICAgIHZhciBmID0gc3RkRm9ybU9iaihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpO1xuICAgICAgZi5rZXkgID0gb3B0aW9ucy5wYXRoO1xuICAgICAgZi50eXBlID0gJ251bWJlcic7XG4gICAgICBvcHRpb25zLmxvb2t1cFtzZlBhdGhQcm92aWRlci5zdHJpbmdpZnkob3B0aW9ucy5wYXRoKV0gPSBmO1xuICAgICAgcmV0dXJuIGY7XG4gICAgfVxuICB9O1xuXG4gIHZhciBpbnRlZ2VyID0gZnVuY3Rpb24obmFtZSwgc2NoZW1hLCBvcHRpb25zKSB7XG4gICAgaWYgKHNjaGVtYS50eXBlID09PSAnaW50ZWdlcicpIHtcbiAgICAgIHZhciBmID0gc3RkRm9ybU9iaihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpO1xuICAgICAgZi5rZXkgID0gb3B0aW9ucy5wYXRoO1xuICAgICAgZi50eXBlID0gJ251bWJlcic7XG4gICAgICBvcHRpb25zLmxvb2t1cFtzZlBhdGhQcm92aWRlci5zdHJpbmdpZnkob3B0aW9ucy5wYXRoKV0gPSBmO1xuICAgICAgcmV0dXJuIGY7XG4gICAgfVxuICB9O1xuXG4gIHZhciBjaGVja2JveCA9IGZ1bmN0aW9uKG5hbWUsIHNjaGVtYSwgb3B0aW9ucykge1xuICAgIGlmIChzY2hlbWEudHlwZSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICB2YXIgZiA9IHN0ZEZvcm1PYmoobmFtZSwgc2NoZW1hLCBvcHRpb25zKTtcbiAgICAgIGYua2V5ICA9IG9wdGlvbnMucGF0aDtcbiAgICAgIGYudHlwZSA9ICdjaGVja2JveCc7XG4gICAgICBvcHRpb25zLmxvb2t1cFtzZlBhdGhQcm92aWRlci5zdHJpbmdpZnkob3B0aW9ucy5wYXRoKV0gPSBmO1xuICAgICAgcmV0dXJuIGY7XG4gICAgfVxuICB9O1xuXG4gIHZhciBzZWxlY3QgPSBmdW5jdGlvbihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpIHtcbiAgICBpZiAoc2NoZW1hLnR5cGUgPT09ICdzdHJpbmcnICYmIHNjaGVtYVsnZW51bSddKSB7XG4gICAgICB2YXIgZiA9IHN0ZEZvcm1PYmoobmFtZSwgc2NoZW1hLCBvcHRpb25zKTtcbiAgICAgIGYua2V5ICA9IG9wdGlvbnMucGF0aDtcbiAgICAgIGYudHlwZSA9ICdzZWxlY3QnO1xuICAgICAgaWYgKCFmLnRpdGxlTWFwKSB7XG4gICAgICAgIGYudGl0bGVNYXAgPSBlbnVtVG9UaXRsZU1hcChzY2hlbWFbJ2VudW0nXSk7XG4gICAgICB9XG4gICAgICBvcHRpb25zLmxvb2t1cFtzZlBhdGhQcm92aWRlci5zdHJpbmdpZnkob3B0aW9ucy5wYXRoKV0gPSBmO1xuICAgICAgcmV0dXJuIGY7XG4gICAgfVxuICB9O1xuXG4gIHZhciBjaGVja2JveGVzID0gZnVuY3Rpb24obmFtZSwgc2NoZW1hLCBvcHRpb25zKSB7XG4gICAgaWYgKHNjaGVtYS50eXBlID09PSAnYXJyYXknICYmIHNjaGVtYS5pdGVtcyAmJiBzY2hlbWEuaXRlbXNbJ2VudW0nXSkge1xuICAgICAgdmFyIGYgPSBzdGRGb3JtT2JqKG5hbWUsIHNjaGVtYSwgb3B0aW9ucyk7XG4gICAgICBmLmtleSAgPSBvcHRpb25zLnBhdGg7XG4gICAgICBmLnR5cGUgPSAnY2hlY2tib3hlcyc7XG4gICAgICBpZiAoIWYudGl0bGVNYXApIHtcbiAgICAgICAgZi50aXRsZU1hcCA9IGVudW1Ub1RpdGxlTWFwKHNjaGVtYS5pdGVtc1snZW51bSddKTtcbiAgICAgIH1cbiAgICAgIG9wdGlvbnMubG9va3VwW3NmUGF0aFByb3ZpZGVyLnN0cmluZ2lmeShvcHRpb25zLnBhdGgpXSA9IGY7XG4gICAgICByZXR1cm4gZjtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGZpZWxkc2V0ID0gZnVuY3Rpb24obmFtZSwgc2NoZW1hLCBvcHRpb25zKSB7XG4gICAgaWYgKHNjaGVtYS50eXBlID09PSAnb2JqZWN0Jykge1xuICAgICAgdmFyIGYgICA9IHN0ZEZvcm1PYmoobmFtZSwgc2NoZW1hLCBvcHRpb25zKTtcbiAgICAgIGYudHlwZSAgPSAnZmllbGRzZXQnO1xuICAgICAgZi5pdGVtcyA9IFtdO1xuICAgICAgb3B0aW9ucy5sb29rdXBbc2ZQYXRoUHJvdmlkZXIuc3RyaW5naWZ5KG9wdGlvbnMucGF0aCldID0gZjtcblxuICAgICAgLy9yZWN1cnNlIGRvd24gaW50byBwcm9wZXJ0aWVzXG4gICAgICBhbmd1bGFyLmZvckVhY2goc2NoZW1hLnByb3BlcnRpZXMsIGZ1bmN0aW9uKHYsIGspIHtcbiAgICAgICAgdmFyIHBhdGggPSBvcHRpb25zLnBhdGguc2xpY2UoKTtcbiAgICAgICAgcGF0aC5wdXNoKGspO1xuICAgICAgICBpZiAob3B0aW9ucy5pZ25vcmVbc2ZQYXRoUHJvdmlkZXIuc3RyaW5naWZ5KHBhdGgpXSAhPT0gdHJ1ZSkge1xuICAgICAgICAgIHZhciByZXF1aXJlZCA9IHNjaGVtYS5yZXF1aXJlZCAmJiBzY2hlbWEucmVxdWlyZWQuaW5kZXhPZihrKSAhPT0gLTE7XG5cbiAgICAgICAgICB2YXIgZGVmID0gZGVmYXVsdEZvcm1EZWZpbml0aW9uKGssIHYsIHtcbiAgICAgICAgICAgIHBhdGg6IHBhdGgsXG4gICAgICAgICAgICByZXF1aXJlZDogcmVxdWlyZWQgfHwgZmFsc2UsXG4gICAgICAgICAgICBsb29rdXA6IG9wdGlvbnMubG9va3VwLFxuICAgICAgICAgICAgaWdub3JlOiBvcHRpb25zLmlnbm9yZVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmIChkZWYpIHtcbiAgICAgICAgICAgIGYuaXRlbXMucHVzaChkZWYpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBmO1xuICAgIH1cblxuICB9O1xuXG4gIHZhciBhcnJheSA9IGZ1bmN0aW9uKG5hbWUsIHNjaGVtYSwgb3B0aW9ucykge1xuXG4gICAgaWYgKHNjaGVtYS50eXBlID09PSAnYXJyYXknKSB7XG4gICAgICB2YXIgZiAgID0gc3RkRm9ybU9iaihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpO1xuICAgICAgZi50eXBlICA9ICdhcnJheSc7XG4gICAgICBmLmtleSAgID0gb3B0aW9ucy5wYXRoO1xuICAgICAgb3B0aW9ucy5sb29rdXBbc2ZQYXRoUHJvdmlkZXIuc3RyaW5naWZ5KG9wdGlvbnMucGF0aCldID0gZjtcblxuICAgICAgdmFyIHJlcXVpcmVkID0gc2NoZW1hLnJlcXVpcmVkICYmXG4gICAgICAgICAgICAgICAgICAgICBzY2hlbWEucmVxdWlyZWQuaW5kZXhPZihvcHRpb25zLnBhdGhbb3B0aW9ucy5wYXRoLmxlbmd0aCAtIDFdKSAhPT0gLTE7XG5cbiAgICAgIC8vIFRoZSBkZWZhdWx0IGlzIHRvIGFsd2F5cyBqdXN0IGNyZWF0ZSBvbmUgY2hpbGQuIFRoaXMgd29ya3Mgc2luY2UgaWYgdGhlXG4gICAgICAvLyBzY2hlbWFzIGl0ZW1zIGRlY2xhcmF0aW9uIGlzIG9mIHR5cGU6IFwib2JqZWN0XCIgdGhlbiB3ZSBnZXQgYSBmaWVsZHNldC5cbiAgICAgIC8vIFdlIGFsc28gZm9sbG93IGpzb24gZm9ybSBub3RhdGF0aW9uLCBhZGRpbmcgZW1wdHkgYnJhY2tldHMgXCJbXVwiIHRvXG4gICAgICAvLyBzaWduaWZ5IGFycmF5cy5cblxuICAgICAgdmFyIGFyclBhdGggPSBvcHRpb25zLnBhdGguc2xpY2UoKTtcbiAgICAgIGFyclBhdGgucHVzaCgnJyk7XG5cbiAgICAgIGYuaXRlbXMgPSBbZGVmYXVsdEZvcm1EZWZpbml0aW9uKG5hbWUsIHNjaGVtYS5pdGVtcywge1xuICAgICAgICBwYXRoOiBhcnJQYXRoLFxuICAgICAgICByZXF1aXJlZDogcmVxdWlyZWQgfHwgZmFsc2UsXG4gICAgICAgIGxvb2t1cDogb3B0aW9ucy5sb29rdXAsXG4gICAgICAgIGlnbm9yZTogb3B0aW9ucy5pZ25vcmUsXG4gICAgICAgIGdsb2JhbDogb3B0aW9ucy5nbG9iYWxcbiAgICAgIH0pXTtcblxuICAgICAgcmV0dXJuIGY7XG4gICAgfVxuXG4gIH07XG5cbiAgLy9GaXJzdCBzb3J0ZWQgYnkgc2NoZW1hIHR5cGUgdGhlbiBhIGxpc3QuXG4gIC8vT3JkZXIgaGFzIGltcG9ydGFuY2UuIEZpcnN0IGhhbmRsZXIgcmV0dXJuaW5nIGFuIGZvcm0gc25pcHBldCB3aWxsIGJlIHVzZWQuXG4gIHZhciBkZWZhdWx0cyA9IHtcbiAgICBzdHJpbmc6ICBbc2VsZWN0LCB0ZXh0XSxcbiAgICBvYmplY3Q6ICBbZmllbGRzZXRdLFxuICAgIG51bWJlcjogIFtudW1iZXJdLFxuICAgIGludGVnZXI6IFtpbnRlZ2VyXSxcbiAgICBib29sZWFuOiBbY2hlY2tib3hdLFxuICAgIGFycmF5OiAgIFtjaGVja2JveGVzLCBhcnJheV1cbiAgfTtcblxuICB2YXIgcG9zdFByb2Nlc3NGbiA9IGZ1bmN0aW9uKGZvcm0pIHsgcmV0dXJuIGZvcm07IH07XG5cbiAgLyoqXG4gICAqIFByb3ZpZGVyIEFQSVxuICAgKi9cbiAgdGhpcy5kZWZhdWx0cyAgICAgICAgICAgICAgPSBkZWZhdWx0cztcbiAgdGhpcy5zdGRGb3JtT2JqICAgICAgICAgICAgPSBzdGRGb3JtT2JqO1xuICB0aGlzLmRlZmF1bHRGb3JtRGVmaW5pdGlvbiA9IGRlZmF1bHRGb3JtRGVmaW5pdGlvbjtcblxuICAvKipcbiAgICogUmVnaXN0ZXIgYSBwb3N0IHByb2Nlc3MgZnVuY3Rpb24uXG4gICAqIFRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIHdpdGggdGhlIGZ1bGx5IG1lcmdlZFxuICAgKiBmb3JtIGRlZmluaXRpb24gKGkuZS4gYWZ0ZXIgbWVyZ2luZyB3aXRoIHNjaGVtYSlcbiAgICogYW5kIHdoYXRldmVyIGl0IHJldHVybnMgaXMgdXNlZCBhcyBmb3JtLlxuICAgKi9cbiAgdGhpcy5wb3N0UHJvY2VzcyA9IGZ1bmN0aW9uKGZuKSB7XG4gICAgcG9zdFByb2Nlc3NGbiA9IGZuO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBcHBlbmQgZGVmYXVsdCBmb3JtIHJ1bGVcbiAgICogQHBhcmFtIHtzdHJpbmd9ICAgdHlwZSBqc29uIHNjaGVtYSB0eXBlXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IHJ1bGUgYSBmdW5jdGlvbihwcm9wZXJ0eU5hbWUscHJvcGVydHlTY2hlbWEsb3B0aW9ucykgdGhhdCByZXR1cm5zIGEgZm9ybVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmluaXRpb24gb3IgdW5kZWZpbmVkXG4gICAqL1xuICB0aGlzLmFwcGVuZFJ1bGUgPSBmdW5jdGlvbih0eXBlLCBydWxlKSB7XG4gICAgaWYgKCFkZWZhdWx0c1t0eXBlXSkge1xuICAgICAgZGVmYXVsdHNbdHlwZV0gPSBbXTtcbiAgICB9XG4gICAgZGVmYXVsdHNbdHlwZV0ucHVzaChydWxlKTtcbiAgfTtcblxuICAvKipcbiAgICogUHJlcGVuZCBkZWZhdWx0IGZvcm0gcnVsZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gICB0eXBlIGpzb24gc2NoZW1hIHR5cGVcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gcnVsZSBhIGZ1bmN0aW9uKHByb3BlcnR5TmFtZSxwcm9wZXJ0eVNjaGVtYSxvcHRpb25zKSB0aGF0IHJldHVybnMgYSBmb3JtXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgZGVmaW5pdGlvbiBvciB1bmRlZmluZWRcbiAgICovXG4gIHRoaXMucHJlcGVuZFJ1bGUgPSBmdW5jdGlvbih0eXBlLCBydWxlKSB7XG4gICAgaWYgKCFkZWZhdWx0c1t0eXBlXSkge1xuICAgICAgZGVmYXVsdHNbdHlwZV0gPSBbXTtcbiAgICB9XG4gICAgZGVmYXVsdHNbdHlwZV0udW5zaGlmdChydWxlKTtcbiAgfTtcblxuICAvKipcbiAgICogVXRpbGl0eSBmdW5jdGlvbiB0byBjcmVhdGUgYSBzdGFuZGFyZCBmb3JtIG9iamVjdC5cbiAgICogVGhpcyBkb2VzICpub3QqIHNldCB0aGUgdHlwZSBvZiB0aGUgZm9ybSBidXQgcmF0aGVyIGFsbCBzaGFyZWQgYXR0cmlidXRlcy5cbiAgICogWW91IHByb2JhYmx5IHdhbnQgdG8gc3RhcnQgeW91ciBydWxlIHdpdGggY3JlYXRpbmcgdGhlIGZvcm0gd2l0aCB0aGlzIG1ldGhvZFxuICAgKiB0aGVuIHNldHRpbmcgdHlwZSBhbmQgYW55IG90aGVyIHZhbHVlcyB5b3UgbmVlZC5cbiAgICogQHBhcmFtIHtPYmplY3R9IHNjaGVtYVxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgKiBAcmV0dXJuIHtPYmplY3R9IGEgZm9ybSBmaWVsZCBkZWZpbnRpb25cbiAgICovXG4gIHRoaXMuY3JlYXRlU3RhbmRhcmRGb3JtID0gc3RkRm9ybU9iajtcbiAgLyogRW5kIFByb3ZpZGVyIEFQSSAqL1xuXG4gIHRoaXMuJGdldCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlcnZpY2UgPSB7fTtcblxuICAgIHNlcnZpY2UubWVyZ2UgPSBmdW5jdGlvbihzY2hlbWEsIGZvcm0sIGlnbm9yZSwgb3B0aW9ucywgcmVhZG9ubHkpIHtcbiAgICAgIGZvcm0gID0gZm9ybSB8fCBbJyonXTtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgICAvLyBHZXQgcmVhZG9ubHkgZnJvbSByb290IG9iamVjdFxuICAgICAgcmVhZG9ubHkgPSByZWFkb25seSB8fCBzY2hlbWEucmVhZG9ubHkgfHwgc2NoZW1hLnJlYWRPbmx5O1xuXG4gICAgICB2YXIgc3RkRm9ybSA9IHNlcnZpY2UuZGVmYXVsdHMoc2NoZW1hLCBpZ25vcmUsIG9wdGlvbnMpO1xuXG4gICAgICAvL3NpbXBsZSBjYXNlLCB3ZSBoYXZlIGEgXCIqXCIsIGp1c3QgcHV0IHRoZSBzdGRGb3JtIHRoZXJlXG4gICAgICB2YXIgaWR4ID0gZm9ybS5pbmRleE9mKCcqJyk7XG4gICAgICBpZiAoaWR4ICE9PSAtMSkge1xuICAgICAgICBmb3JtICA9IGZvcm0uc2xpY2UoMCwgaWR4KVxuICAgICAgICAgICAgICAgICAgICAuY29uY2F0KHN0ZEZvcm0uZm9ybSlcbiAgICAgICAgICAgICAgICAgICAgLmNvbmNhdChmb3JtLnNsaWNlKGlkeCArIDEpKTtcbiAgICAgIH1cblxuICAgICAgLy9vayBsZXQncyBtZXJnZSFcbiAgICAgIC8vV2UgbG9vayBhdCB0aGUgc3VwcGxpZWQgZm9ybSBhbmQgZXh0ZW5kIGl0IHdpdGggc2NoZW1hIHN0YW5kYXJkc1xuICAgICAgdmFyIGxvb2t1cCA9IHN0ZEZvcm0ubG9va3VwO1xuXG4gICAgICByZXR1cm4gcG9zdFByb2Nlc3NGbihmb3JtLm1hcChmdW5jdGlvbihvYmopIHtcblxuICAgICAgICAvL2hhbmRsZSB0aGUgc2hvcnRjdXQgd2l0aCBqdXN0IGEgbmFtZVxuICAgICAgICBpZiAodHlwZW9mIG9iaiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBvYmogPSB7a2V5OiBvYmp9O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9iai5rZXkpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIG9iai5rZXkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBvYmoua2V5ID0gc2ZQYXRoUHJvdmlkZXIucGFyc2Uob2JqLmtleSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy9JZiBpdCBoYXMgYSB0aXRsZU1hcCBtYWtlIHN1cmUgaXQncyBhIGxpc3RcbiAgICAgICAgaWYgKG9iai50aXRsZU1hcCkge1xuICAgICAgICAgIG9iai50aXRsZU1hcCA9IGNhbm9uaWNhbFRpdGxlTWFwKG9iai50aXRsZU1hcCk7XG4gICAgICAgIH1cblxuICAgICAgICAvL1xuICAgICAgICBpZiAob2JqLml0ZW1Gb3JtKSB7XG4gICAgICAgICAgb2JqLml0ZW1zID0gW107XG4gICAgICAgICAgdmFyIHN0ciA9IHNmUGF0aFByb3ZpZGVyLnN0cmluZ2lmeShvYmoua2V5KTtcbiAgICAgICAgICB2YXIgc3RkRm9ybSA9IGxvb2t1cFtzdHJdO1xuICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChzdGRGb3JtLml0ZW1zLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICB2YXIgbyA9IGFuZ3VsYXIuY29weShvYmouaXRlbUZvcm0pO1xuICAgICAgICAgICAgby5rZXkgPSBpdGVtLmtleTtcbiAgICAgICAgICAgIG9iai5pdGVtcy5wdXNoKG8pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9leHRlbmQgd2l0aCBzdGQgZm9ybSBmcm9tIHNjaGVtYS5cblxuICAgICAgICBpZiAob2JqLmtleSkge1xuICAgICAgICAgIHZhciBzdHJpZCA9IHNmUGF0aFByb3ZpZGVyLnN0cmluZ2lmeShvYmoua2V5KTtcbiAgICAgICAgICBpZiAobG9va3VwW3N0cmlkXSkge1xuICAgICAgICAgICAgb2JqID0gYW5ndWxhci5leHRlbmQobG9va3VwW3N0cmlkXSwgb2JqKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBcmUgd2UgaW5oZXJpdGluZyByZWFkb25seT9cbiAgICAgICAgaWYgKHJlYWRvbmx5ID09PSB0cnVlKSB7IC8vIEluaGVyaXRpbmcgZmFsc2UgaXMgbm90IGNvb2wuXG4gICAgICAgICAgb2JqLnJlYWRvbmx5ID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vaWYgaXQncyBhIHR5cGUgd2l0aCBpdGVtcywgbWVyZ2UgJ2VtIVxuICAgICAgICBpZiAob2JqLml0ZW1zKSB7XG4gICAgICAgICAgb2JqLml0ZW1zID0gc2VydmljZS5tZXJnZShzY2hlbWEsIG9iai5pdGVtcywgaWdub3JlLCBvcHRpb25zLCBvYmoucmVhZG9ubHkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9pZiBpdHMgaGFzIHRhYnMsIG1lcmdlIHRoZW0gYWxzbyFcbiAgICAgICAgaWYgKG9iai50YWJzKSB7XG4gICAgICAgICAgYW5ndWxhci5mb3JFYWNoKG9iai50YWJzLCBmdW5jdGlvbih0YWIpIHtcbiAgICAgICAgICAgIHRhYi5pdGVtcyA9IHNlcnZpY2UubWVyZ2Uoc2NoZW1hLCB0YWIuaXRlbXMsIGlnbm9yZSwgb3B0aW9ucywgb2JqLnJlYWRvbmx5KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNwZWNpYWwgY2FzZTogY2hlY2tib3hcbiAgICAgICAgLy8gU2luY2UgaGF2ZSB0byB0ZXJuYXJ5IHN0YXRlIHdlIG5lZWQgYSBkZWZhdWx0XG4gICAgICAgIGlmIChvYmoudHlwZSA9PT0gJ2NoZWNrYm94JyAmJiBhbmd1bGFyLmlzVW5kZWZpbmVkKG9iai5zY2hlbWFbJ2RlZmF1bHQnXSkpIHtcbiAgICAgICAgICBvYmouc2NoZW1hWydkZWZhdWx0J10gPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgICB9KSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBmb3JtIGRlZmF1bHRzIGZyb20gc2NoZW1hXG4gICAgICovXG4gICAgc2VydmljZS5kZWZhdWx0cyA9IGZ1bmN0aW9uKHNjaGVtYSwgaWdub3JlLCBnbG9iYWxPcHRpb25zKSB7XG4gICAgICB2YXIgZm9ybSAgID0gW107XG4gICAgICB2YXIgbG9va3VwID0ge307IC8vTWFwIHBhdGggPT4gZm9ybSBvYmogZm9yIGZhc3QgbG9va3VwIGluIG1lcmdpbmdcbiAgICAgIGlnbm9yZSA9IGlnbm9yZSB8fCB7fTtcbiAgICAgIGdsb2JhbE9wdGlvbnMgPSBnbG9iYWxPcHRpb25zIHx8IHt9O1xuXG4gICAgICBpZiAoc2NoZW1hLnR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaChzY2hlbWEucHJvcGVydGllcywgZnVuY3Rpb24odiwgaykge1xuICAgICAgICAgIGlmIChpZ25vcmVba10gIT09IHRydWUpIHtcbiAgICAgICAgICAgIHZhciByZXF1aXJlZCA9IHNjaGVtYS5yZXF1aXJlZCAmJiBzY2hlbWEucmVxdWlyZWQuaW5kZXhPZihrKSAhPT0gLTE7XG4gICAgICAgICAgICB2YXIgZGVmID0gZGVmYXVsdEZvcm1EZWZpbml0aW9uKGssIHYsIHtcbiAgICAgICAgICAgICAgcGF0aDogW2tdLCAgICAgICAgIC8vIFBhdGggdG8gdGhpcyBwcm9wZXJ0eSBpbiBicmFja2V0IG5vdGF0aW9uLlxuICAgICAgICAgICAgICBsb29rdXA6IGxvb2t1cCwgICAgLy8gRXh0cmEgbWFwIHRvIHJlZ2lzdGVyIHdpdGguIE9wdGltaXphdGlvbiBmb3IgbWVyZ2VyLlxuICAgICAgICAgICAgICBpZ25vcmU6IGlnbm9yZSwgICAgLy8gVGhlIGlnbm9yZSBsaXN0IG9mIHBhdGhzIChzYW5zIHJvb3QgbGV2ZWwgbmFtZSlcbiAgICAgICAgICAgICAgcmVxdWlyZWQ6IHJlcXVpcmVkLCAvLyBJcyBpdCByZXF1aXJlZD8gKHY0IGpzb24gc2NoZW1hIHN0eWxlKVxuICAgICAgICAgICAgICBnbG9iYWw6IGdsb2JhbE9wdGlvbnMgLy8gR2xvYmFsIG9wdGlvbnMsIGluY2x1ZGluZyBmb3JtIGRlZmF1bHRzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChkZWYpIHtcbiAgICAgICAgICAgICAgZm9ybS5wdXNoKGRlZik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQuIE9ubHkgdHlwZSBcIm9iamVjdFwiIGFsbG93ZWQgYXQgcm9vdCBsZXZlbCBvZiBzY2hlbWEuJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4ge2Zvcm06IGZvcm0sIGxvb2t1cDogbG9va3VwfTtcbiAgICB9O1xuXG4gICAgLy9VdGlsaXR5IGZ1bmN0aW9uc1xuICAgIC8qKlxuICAgICAqIFRyYXZlcnNlIGEgc2NoZW1hLCBhcHBseWluZyBhIGZ1bmN0aW9uKHNjaGVtYSxwYXRoKSBvbiBldmVyeSBzdWIgc2NoZW1hXG4gICAgICogaS5lLiBldmVyeSBwcm9wZXJ0eSBvZiBhbiBvYmplY3QuXG4gICAgICovXG4gICAgc2VydmljZS50cmF2ZXJzZVNjaGVtYSA9IGZ1bmN0aW9uKHNjaGVtYSwgZm4sIHBhdGgsIGlnbm9yZUFycmF5cykge1xuICAgICAgaWdub3JlQXJyYXlzID0gYW5ndWxhci5pc0RlZmluZWQoaWdub3JlQXJyYXlzKSA/IGlnbm9yZUFycmF5cyA6IHRydWU7XG5cbiAgICAgIHBhdGggPSBwYXRoIHx8IFtdO1xuXG4gICAgICB2YXIgdHJhdmVyc2UgPSBmdW5jdGlvbihzY2hlbWEsIGZuLCBwYXRoKSB7XG4gICAgICAgIGZuKHNjaGVtYSwgcGF0aCk7XG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaChzY2hlbWEucHJvcGVydGllcywgZnVuY3Rpb24ocHJvcCwgbmFtZSkge1xuICAgICAgICAgIHZhciBjdXJyZW50UGF0aCA9IHBhdGguc2xpY2UoKTtcbiAgICAgICAgICBjdXJyZW50UGF0aC5wdXNoKG5hbWUpO1xuICAgICAgICAgIHRyYXZlcnNlKHByb3AsIGZuLCBjdXJyZW50UGF0aCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vT25seSBzdXBwb3J0IHR5cGUgXCJhcnJheVwiIHdoaWNoIGhhdmUgYSBzY2hlbWEgYXMgXCJpdGVtc1wiLlxuICAgICAgICBpZiAoIWlnbm9yZUFycmF5cyAmJiBzY2hlbWEuaXRlbXMpIHtcbiAgICAgICAgICB2YXIgYXJyUGF0aCA9IHBhdGguc2xpY2UoKTsgYXJyUGF0aC5wdXNoKCcnKTtcbiAgICAgICAgICB0cmF2ZXJzZShzY2hlbWEuaXRlbXMsIGZuLCBhcnJQYXRoKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgdHJhdmVyc2Uoc2NoZW1hLCBmbiwgcGF0aCB8fCBbXSk7XG4gICAgfTtcblxuICAgIHNlcnZpY2UudHJhdmVyc2VGb3JtID0gZnVuY3Rpb24oZm9ybSwgZm4pIHtcbiAgICAgIGZuKGZvcm0pO1xuICAgICAgYW5ndWxhci5mb3JFYWNoKGZvcm0uaXRlbXMsIGZ1bmN0aW9uKGYpIHtcbiAgICAgICAgc2VydmljZS50cmF2ZXJzZUZvcm0oZiwgZm4pO1xuICAgICAgfSk7XG5cbiAgICAgIGlmIChmb3JtLnRhYnMpIHtcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKGZvcm0udGFicywgZnVuY3Rpb24odGFiKSB7XG4gICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRhYi5pdGVtcywgZnVuY3Rpb24oZikge1xuICAgICAgICAgICAgc2VydmljZS50cmF2ZXJzZUZvcm0oZiwgZm4pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIHNlcnZpY2U7XG4gIH07XG5cbn1dKTtcblxuLyogIENvbW1vbiBjb2RlIGZvciB2YWxpZGF0aW5nIGEgdmFsdWUgYWdhaW5zdCBpdHMgZm9ybSBhbmQgc2NoZW1hIGRlZmluaXRpb24gKi9cbi8qIGdsb2JhbCB0djQgKi9cbmFuZ3VsYXIubW9kdWxlKCdzY2hlbWFGb3JtJykuZmFjdG9yeSgnc2ZWYWxpZGF0b3InLCBbZnVuY3Rpb24oKSB7XG5cbiAgdmFyIHZhbGlkYXRvciA9IHt9O1xuXG4gIC8qKlxuICAgKiBWYWxpZGF0ZSBhIHZhbHVlIGFnYWluc3QgaXRzIGZvcm0gZGVmaW5pdGlvbiBhbmQgc2NoZW1hLlxuICAgKiBUaGUgdmFsdWUgc2hvdWxkIGVpdGhlciBiZSBvZiBwcm9wZXIgdHlwZSBvciBhIHN0cmluZywgc29tZSB0eXBlXG4gICAqIGNvZXJjaW9uIGlzIGFwcGxpZWQuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBmb3JtIEEgbWVyZ2VkIGZvcm0gZGVmaW5pdGlvbiwgaS5lLiBvbmUgd2l0aCBhIHNjaGVtYS5cbiAgICogQHBhcmFtIHtBbnl9IHZhbHVlIHRoZSB2YWx1ZSB0byB2YWxpZGF0ZS5cbiAgICogQHJldHVybiBhIHR2NGpzIHJlc3VsdCBvYmplY3QuXG4gICAqL1xuICB2YWxpZGF0b3IudmFsaWRhdGUgPSBmdW5jdGlvbihmb3JtLCB2YWx1ZSkge1xuICAgIGlmICghZm9ybSkge1xuICAgICAgcmV0dXJuIHt2YWxpZDogdHJ1ZX07XG4gICAgfVxuICAgIHZhciBzY2hlbWEgPSBmb3JtLnNjaGVtYTtcblxuICAgIGlmICghc2NoZW1hKSB7XG4gICAgICByZXR1cm4ge3ZhbGlkOiB0cnVlfTtcbiAgICB9XG5cbiAgICAvLyBJbnB1dCBvZiB0eXBlIHRleHQgYW5kIHRleHRhcmVhcyB3aWxsIGdpdmUgdXMgYSB2aWV3VmFsdWUgb2YgJydcbiAgICAvLyB3aGVuIGVtcHR5LCB0aGlzIGlzIGEgdmFsaWQgdmFsdWUgaW4gYSBzY2hlbWEgYW5kIGRvZXMgbm90IGNvdW50IGFzIHNvbWV0aGluZ1xuICAgIC8vIHRoYXQgYnJlYWtzIHZhbGlkYXRpb24gb2YgJ3JlcXVpcmVkJy4gQnV0IGZvciBvdXIgb3duIHNhbml0eSBhbiBlbXB0eSBmaWVsZCBzaG91bGRcbiAgICAvLyBub3QgdmFsaWRhdGUgaWYgaXQncyByZXF1aXJlZC5cbiAgICBpZiAodmFsdWUgPT09ICcnKSB7XG4gICAgICB2YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICAvLyBOdW1iZXJzIGZpZWxkcyB3aWxsIGdpdmUgYSBudWxsIHZhbHVlLCB3aGljaCBhbHNvIG1lYW5zIGVtcHR5IGZpZWxkXG4gICAgaWYgKGZvcm0udHlwZSA9PT0gJ251bWJlcicgJiYgdmFsdWUgPT09IG51bGwpIHtcbiAgICAgIHZhbHVlID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIC8vIFZlcnNpb24gNCBvZiBKU09OIFNjaGVtYSBoYXMgdGhlIHJlcXVpcmVkIHByb3BlcnR5IG5vdCBvbiB0aGVcbiAgICAvLyBwcm9wZXJ0eSBpdHNlbGYgYnV0IG9uIHRoZSB3cmFwcGluZyBvYmplY3QuIFNpbmNlIHdlIGxpa2UgdG8gdGVzdFxuICAgIC8vIG9ubHkgdGhpcyBwcm9wZXJ0eSB3ZSB3cmFwIGl0IGluIGEgZmFrZSBvYmplY3QuXG4gICAgdmFyIHdyYXAgPSB7dHlwZTogJ29iamVjdCcsICdwcm9wZXJ0aWVzJzoge319O1xuICAgIHZhciBwcm9wTmFtZSA9IGZvcm0ua2V5W2Zvcm0ua2V5Lmxlbmd0aCAtIDFdO1xuICAgIHdyYXAucHJvcGVydGllc1twcm9wTmFtZV0gPSBzY2hlbWE7XG5cbiAgICBpZiAoZm9ybS5yZXF1aXJlZCkge1xuICAgICAgd3JhcC5yZXF1aXJlZCA9IFtwcm9wTmFtZV07XG4gICAgfVxuICAgIHZhciB2YWx1ZVdyYXAgPSB7fTtcbiAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQodmFsdWUpKSB7XG4gICAgICB2YWx1ZVdyYXBbcHJvcE5hbWVdID0gdmFsdWU7XG4gICAgfVxuICAgIHJldHVybiB0djQudmFsaWRhdGVSZXN1bHQodmFsdWVXcmFwLCB3cmFwKTtcblxuICB9O1xuXG4gIHJldHVybiB2YWxpZGF0b3I7XG59XSk7XG5cbi8qKlxuICogRGlyZWN0aXZlIHRoYXQgaGFuZGxlcyB0aGUgbW9kZWwgYXJyYXlzXG4gKi9cbmFuZ3VsYXIubW9kdWxlKCdzY2hlbWFGb3JtJykuZGlyZWN0aXZlKCdzZkFycmF5JywgWydzZlNlbGVjdCcsICdzY2hlbWFGb3JtJywgJ3NmVmFsaWRhdG9yJyxcbiAgZnVuY3Rpb24oc2ZTZWxlY3QsIHNjaGVtYUZvcm0sIHNmVmFsaWRhdG9yKSB7XG5cbiAgICB2YXIgc2V0SW5kZXggPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGZvcm0pIHtcbiAgICAgICAgaWYgKGZvcm0ua2V5KSB7XG4gICAgICAgICAgZm9ybS5rZXlbZm9ybS5rZXkuaW5kZXhPZignJyldID0gaW5kZXg7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgc2NvcGU6IHRydWUsXG4gICAgICByZXF1aXJlOiAnP25nTW9kZWwnLFxuICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBuZ01vZGVsKSB7XG4gICAgICAgIHZhciBmb3JtRGVmQ2FjaGUgPSB7fTtcblxuICAgICAgICAvLyBXYXRjaCBmb3IgdGhlIGZvcm0gZGVmaW5pdGlvbiBhbmQgdGhlbiByZXdyaXRlIGl0LlxuICAgICAgICAvLyBJdCdzIHRoZSAoZmlyc3QpIGFycmF5IHBhcnQgb2YgdGhlIGtleSwgJ1tdJyB0aGF0IG5lZWRzIGEgbnVtYmVyXG4gICAgICAgIC8vIGNvcnJlc3BvbmRpbmcgdG8gYW4gaW5kZXggb2YgdGhlIGZvcm0uXG4gICAgICAgIHZhciBvbmNlID0gc2NvcGUuJHdhdGNoKGF0dHJzLnNmQXJyYXksIGZ1bmN0aW9uKGZvcm0pIHtcblxuICAgICAgICAgIC8vIEFuIGFycmF5IG1vZGVsIGFsd2F5cyBuZWVkcyBhIGtleSBzbyB3ZSBrbm93IHdoYXQgcGFydCBvZiB0aGUgbW9kZWxcbiAgICAgICAgICAvLyB0byBsb29rIGF0LiBUaGlzIG1ha2VzIHVzIGEgYml0IGluY29tcGF0aWJsZSB3aXRoIEpTT04gRm9ybSwgb24gdGhlXG4gICAgICAgICAgLy8gb3RoZXIgaGFuZCBpdCBlbmFibGVzIHR3byB3YXkgYmluZGluZy5cbiAgICAgICAgICB2YXIgbGlzdCA9IHNmU2VsZWN0KGZvcm0ua2V5LCBzY29wZS5tb2RlbCk7XG5cbiAgICAgICAgICAvLyBTaW5jZSBuZy1tb2RlbCBoYXBwaWx5IGNyZWF0ZXMgb2JqZWN0cyBpbiBhIGRlZXAgcGF0aCB3aGVuIHNldHRpbmcgYVxuICAgICAgICAgIC8vIGEgdmFsdWUgYnV0IG5vdCBhcnJheXMgd2UgbmVlZCB0byBjcmVhdGUgdGhlIGFycmF5LlxuICAgICAgICAgIGlmIChhbmd1bGFyLmlzVW5kZWZpbmVkKGxpc3QpKSB7XG4gICAgICAgICAgICBsaXN0ID0gW107XG4gICAgICAgICAgICBzZlNlbGVjdChmb3JtLmtleSwgc2NvcGUubW9kZWwsIGxpc3QpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzY29wZS5tb2RlbEFycmF5ID0gbGlzdDtcblxuICAgICAgICAgIC8vIEFycmF5cyB3aXRoIHRpdGxlTWFwcywgaS5lLiBjaGVja2JveGVzIGRvZXNuJ3QgaGF2ZSBpdGVtcy5cbiAgICAgICAgICBpZiAoZm9ybS5pdGVtcykge1xuXG4gICAgICAgICAgICAvLyBUbyBiZSBtb3JlIGNvbXBhdGlibGUgd2l0aCBKU09OIEZvcm0gd2Ugc3VwcG9ydCBhbiBhcnJheSBvZiBpdGVtc1xuICAgICAgICAgICAgLy8gaW4gdGhlIGZvcm0gZGVmaW5pdGlvbiBvZiBcImFycmF5XCIgKHRoZSBzY2hlbWEganVzdCBhIHZhbHVlKS5cbiAgICAgICAgICAgIC8vIGZvciB0aGUgc3ViZm9ybXMgY29kZSB0byB3b3JrIHRoaXMgbWVhbnMgd2Ugd3JhcCBldmVyeXRoaW5nIGluIGFcbiAgICAgICAgICAgIC8vIHNlY3Rpb24uIFVubGVzcyB0aGVyZSBpcyBqdXN0IG9uZS5cbiAgICAgICAgICAgIHZhciBzdWJGb3JtID0gZm9ybS5pdGVtc1swXTtcbiAgICAgICAgICAgIGlmIChmb3JtLml0ZW1zLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgc3ViRm9ybSA9IHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnc2VjdGlvbicsXG4gICAgICAgICAgICAgICAgaXRlbXM6IGZvcm0uaXRlbXMubWFwKGZ1bmN0aW9uKGl0ZW0pe1xuICAgICAgICAgICAgICAgICAgaXRlbS5uZ01vZGVsT3B0aW9ucyA9IGZvcm0ubmdNb2RlbE9wdGlvbnM7XG4gICAgICAgICAgICAgICAgICBpdGVtLnJlYWRvbmx5ID0gZm9ybS5yZWFkb25seTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBXZSBjZWF0ZSBjb3BpZXMgb2YgdGhlIGZvcm0gb24gZGVtYW5kLCBjYWNoaW5nIHRoZW0gZm9yXG4gICAgICAgICAgLy8gbGF0ZXIgcmVxdWVzdHNcbiAgICAgICAgICBzY29wZS5jb3B5V2l0aEluZGV4ID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgICAgIGlmICghZm9ybURlZkNhY2hlW2luZGV4XSkge1xuICAgICAgICAgICAgICBpZiAoc3ViRm9ybSkge1xuICAgICAgICAgICAgICAgIHZhciBjb3B5ID0gYW5ndWxhci5jb3B5KHN1YkZvcm0pO1xuICAgICAgICAgICAgICAgIGNvcHkuYXJyYXlJbmRleCA9IGluZGV4O1xuICAgICAgICAgICAgICAgIHNjaGVtYUZvcm0udHJhdmVyc2VGb3JtKGNvcHksIHNldEluZGV4KGluZGV4KSk7XG4gICAgICAgICAgICAgICAgZm9ybURlZkNhY2hlW2luZGV4XSA9IGNvcHk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmb3JtRGVmQ2FjaGVbaW5kZXhdO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICBzY29wZS5hcHBlbmRUb0FycmF5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgbGVuID0gbGlzdC5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgY29weSA9IHNjb3BlLmNvcHlXaXRoSW5kZXgobGVuKTtcbiAgICAgICAgICAgIHNjaGVtYUZvcm0udHJhdmVyc2VGb3JtKGNvcHksIGZ1bmN0aW9uKHBhcnQpIHtcbiAgICAgICAgICAgICAgaWYgKHBhcnQua2V5ICYmIGFuZ3VsYXIuaXNEZWZpbmVkKHBhcnRbJ2RlZmF1bHQnXSkpIHtcbiAgICAgICAgICAgICAgICBzZlNlbGVjdChwYXJ0LmtleSwgc2NvcGUubW9kZWwsIHBhcnRbJ2RlZmF1bHQnXSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBJZiB0aGVyZSBhcmUgbm8gZGVmYXVsdHMgbm90aGluZyBpcyBhZGRlZCBzbyB3ZSBuZWVkIHRvIGluaXRpYWxpemVcbiAgICAgICAgICAgIC8vIHRoZSBhcnJheS4gdW5kZWZpbmVkIGZvciBiYXNpYyB2YWx1ZXMsIHt9IG9yIFtdIGZvciB0aGUgb3RoZXJzLlxuICAgICAgICAgICAgaWYgKGxlbiA9PT0gbGlzdC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgdmFyIHR5cGUgPSBzZlNlbGVjdCgnc2NoZW1hLml0ZW1zLnR5cGUnLCBmb3JtKTtcbiAgICAgICAgICAgICAgdmFyIGRmbHQ7XG4gICAgICAgICAgICAgIGlmICh0eXBlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIGRmbHQgPSB7fTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnYXJyYXknKSB7XG4gICAgICAgICAgICAgICAgZGZsdCA9IFtdO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGxpc3QucHVzaChkZmx0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVHJpZ2dlciB2YWxpZGF0aW9uLlxuICAgICAgICAgICAgaWYgKHNjb3BlLnZhbGlkYXRlQXJyYXkpIHtcbiAgICAgICAgICAgICAgc2NvcGUudmFsaWRhdGVBcnJheSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGxpc3Q7XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIHNjb3BlLmRlbGV0ZUZyb21BcnJheSA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgICAgICBsaXN0LnNwbGljZShpbmRleCwgMSk7XG5cbiAgICAgICAgICAgIC8vIFRyaWdnZXIgdmFsaWRhdGlvbi5cbiAgICAgICAgICAgIGlmIChzY29wZS52YWxpZGF0ZUFycmF5KSB7XG4gICAgICAgICAgICAgIHNjb3BlLnZhbGlkYXRlQXJyYXkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBsaXN0O1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICAvLyBBbHdheXMgc3RhcnQgd2l0aCBvbmUgZW1wdHkgZm9ybSB1bmxlc3MgY29uZmlndXJlZCBvdGhlcndpc2UuXG4gICAgICAgICAgLy8gU3BlY2lhbCBjYXNlOiBkb24ndCBkbyBpdCBpZiBmb3JtIGhhcyBhIHRpdGxlTWFwXG4gICAgICAgICAgaWYgKCFmb3JtLnRpdGxlTWFwICYmIGZvcm0uc3RhcnRFbXB0eSAhPT0gdHJ1ZSAmJiBsaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgc2NvcGUuYXBwZW5kVG9BcnJheSgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFRpdGxlIE1hcCBoYW5kbGluZ1xuICAgICAgICAgIC8vIElmIGZvcm0gaGFzIGEgdGl0bGVNYXAgY29uZmlndXJlZCB3ZSdkIGxpa2UgdG8gZW5hYmxlIGxvb3Bpbmcgb3ZlclxuICAgICAgICAgIC8vIHRpdGxlTWFwIGluc3RlYWQgb2YgbW9kZWxBcnJheSwgdGhpcyBpcyB1c2VkIGZvciBpbnRhbmNlIGluXG4gICAgICAgICAgLy8gY2hlY2tib3hlcy4gU28gaW5zdGVhZCBvZiB2YXJpYWJsZSBudW1iZXIgb2YgdGhpbmdzIHdlIGxpa2UgdG8gY3JlYXRlXG4gICAgICAgICAgLy8gYSBhcnJheSB2YWx1ZSBmcm9tIGEgc3Vic2V0IG9mIHZhbHVlcyBpbiB0aGUgdGl0bGVNYXAuXG4gICAgICAgICAgLy8gVGhlIHByb2JsZW0gaGVyZSBpcyB0aGF0IG5nLW1vZGVsIG9uIGEgY2hlY2tib3ggZG9lc24ndCByZWFsbHkgbWFwIHRvXG4gICAgICAgICAgLy8gYSBsaXN0IG9mIHZhbHVlcy4gVGhpcyBpcyBoZXJlIHRvIGZpeCB0aGF0LlxuICAgICAgICAgIGlmIChmb3JtLnRpdGxlTWFwICYmIGZvcm0udGl0bGVNYXAubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgc2NvcGUudGl0bGVNYXBWYWx1ZXMgPSBbXTtcblxuICAgICAgICAgICAgLy8gV2Ugd2F0Y2ggdGhlIG1vZGVsIGZvciBjaGFuZ2VzIGFuZCB0aGUgdGl0bGVNYXBWYWx1ZXMgdG8gcmVmbGVjdFxuICAgICAgICAgICAgLy8gdGhlIG1vZGVsQXJyYXlcbiAgICAgICAgICAgIHZhciB1cGRhdGVUaXRsZU1hcFZhbHVlcyA9IGZ1bmN0aW9uKGFycikge1xuICAgICAgICAgICAgICBzY29wZS50aXRsZU1hcFZhbHVlcyA9IFtdO1xuICAgICAgICAgICAgICBhcnIgPSBhcnIgfHwgW107XG5cbiAgICAgICAgICAgICAgZm9ybS50aXRsZU1hcC5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICBzY29wZS50aXRsZU1hcFZhbHVlcy5wdXNoKGFyci5pbmRleE9mKGl0ZW0udmFsdWUpICE9PSAtMSk7XG4gICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLy9DYXRjaCBkZWZhdWx0IHZhbHVlc1xuICAgICAgICAgICAgdXBkYXRlVGl0bGVNYXBWYWx1ZXMoc2NvcGUubW9kZWxBcnJheSk7XG4gICAgICAgICAgICBzY29wZS4kd2F0Y2hDb2xsZWN0aW9uKCdtb2RlbEFycmF5JywgdXBkYXRlVGl0bGVNYXBWYWx1ZXMpO1xuXG4gICAgICAgICAgICAvL1RvIGdldCB0d28gd2F5IGJpbmRpbmcgd2UgYWxzbyB3YXRjaCBvdXIgdGl0bGVNYXBWYWx1ZXNcbiAgICAgICAgICAgIHNjb3BlLiR3YXRjaENvbGxlY3Rpb24oJ3RpdGxlTWFwVmFsdWVzJywgZnVuY3Rpb24odmFscykge1xuICAgICAgICAgICAgICBpZiAodmFscykge1xuICAgICAgICAgICAgICAgIHZhciBhcnIgPSBzY29wZS5tb2RlbEFycmF5O1xuXG4gICAgICAgICAgICAgICAgLy8gQXBwYXJlbnRseSB0aGUgZmFzdGVzdCB3YXkgdG8gY2xlYXIgYW4gYXJyYXksIHJlYWRhYmxlIHRvby5cbiAgICAgICAgICAgICAgICAvLyBodHRwOi8vanNwZXJmLmNvbS9hcnJheS1kZXN0cm95LzMyXG4gICAgICAgICAgICAgICAgd2hpbGUgKGFyci5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICBhcnIuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBmb3JtLnRpdGxlTWFwLmZvckVhY2goZnVuY3Rpb24oaXRlbSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgIGlmICh2YWxzW2luZGV4XSkge1xuICAgICAgICAgICAgICAgICAgICBhcnIucHVzaChpdGVtLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBJZiB0aGVyZSBpcyBhIG5nTW9kZWwgcHJlc2VudCB3ZSBuZWVkIHRvIHZhbGlkYXRlIHdoZW4gYXNrZWQuXG4gICAgICAgICAgaWYgKG5nTW9kZWwpIHtcbiAgICAgICAgICAgIHZhciBlcnJvcjtcblxuICAgICAgICAgICAgc2NvcGUudmFsaWRhdGVBcnJheSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAvLyBUaGUgYWN0dWFsIGNvbnRlbnQgb2YgdGhlIGFycmF5IGlzIHZhbGlkYXRlZCBieSBlYWNoIGZpZWxkXG4gICAgICAgICAgICAgIC8vIHNvIHdlIHNldHRsZSBmb3IgY2hlY2tpbmcgdmFsaWRhdGlvbnMgc3BlY2lmaWMgdG8gYXJyYXlzXG5cbiAgICAgICAgICAgICAgLy8gU2luY2Ugd2UgcHJlZmlsbCB3aXRoIGVtcHR5IGFycmF5cyB3ZSBjYW4gZ2V0IHRoZSBmdW5ueSBzaXR1YXRpb25cbiAgICAgICAgICAgICAgLy8gd2hlcmUgdGhlIGFycmF5IGlzIHJlcXVpcmVkIGJ1dCBlbXB0eSBpbiB0aGUgZ3VpIGJ1dCBzdGlsbCB2YWxpZGF0ZXMuXG4gICAgICAgICAgICAgIC8vIFRoYXRzIHdoeSB3ZSBjaGVjayB0aGUgbGVuZ3RoLlxuICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gc2ZWYWxpZGF0b3IudmFsaWRhdGUoXG4gICAgICAgICAgICAgICAgZm9ybSxcbiAgICAgICAgICAgICAgICBzY29wZS5tb2RlbEFycmF5Lmxlbmd0aCA+IDAgPyBzY29wZS5tb2RlbEFycmF5IDogdW5kZWZpbmVkXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIGlmIChyZXN1bHQudmFsaWQgPT09IGZhbHNlICYmXG4gICAgICAgICAgICAgICAgICByZXN1bHQuZXJyb3IgJiZcbiAgICAgICAgICAgICAgICAgIChyZXN1bHQuZXJyb3IuZGF0YVBhdGggPT09ICcnIHx8XG4gICAgICAgICAgICAgICAgICByZXN1bHQuZXJyb3IuZGF0YVBhdGggPT09ICcvJyArIGZvcm0ua2V5W2Zvcm0ua2V5Lmxlbmd0aCAtIDFdKSkge1xuXG4gICAgICAgICAgICAgICAgLy8gU2V0IHZpZXdWYWx1ZSB0byB0cmlnZ2VyICRkaXJ0eSBvbiBmaWVsZC4gSWYgc29tZW9uZSBrbm93cyBhXG4gICAgICAgICAgICAgICAgLy8gYSBiZXR0ZXIgd2F5IHRvIGRvIGl0IHBsZWFzZSB0ZWxsLlxuICAgICAgICAgICAgICAgIG5nTW9kZWwuJHNldFZpZXdWYWx1ZShzY29wZS5tb2RlbEFycmF5KTtcbiAgICAgICAgICAgICAgICBlcnJvciA9IHJlc3VsdC5lcnJvcjtcbiAgICAgICAgICAgICAgICBuZ01vZGVsLiRzZXRWYWxpZGl0eSgnc2NoZW1hJywgZmFsc2UpO1xuXG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbmdNb2RlbC4kc2V0VmFsaWRpdHkoJ3NjaGVtYScsIHRydWUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzY29wZS4kb24oJ3NjaGVtYUZvcm1WYWxpZGF0ZScsIHNjb3BlLnZhbGlkYXRlQXJyYXkpO1xuXG4gICAgICAgICAgICBzY29wZS5oYXNTdWNjZXNzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBuZ01vZGVsLiR2YWxpZCAmJiAhbmdNb2RlbC4kcHJpc3RpbmU7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzY29wZS5oYXNFcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gbmdNb2RlbC4kaW52YWxpZDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNjb3BlLnNjaGVtYUVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBlcnJvcjtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBvbmNlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gIH1cbl0pO1xuXG4vKipcbiAqIEEgdmVyc2lvbiBvZiBuZy1jaGFuZ2VkIHRoYXQgb25seSBsaXN0ZW5zIGlmXG4gKiB0aGVyZSBpcyBhY3R1YWxseSBhIG9uQ2hhbmdlIGRlZmluZWQgb24gdGhlIGZvcm1cbiAqXG4gKiBUYWtlcyB0aGUgZm9ybSBkZWZpbml0aW9uIGFzIGFyZ3VtZW50LlxuICogSWYgdGhlIGZvcm0gZGVmaW5pdGlvbiBoYXMgYSBcIm9uQ2hhbmdlXCIgZGVmaW5lZCBhcyBlaXRoZXIgYSBmdW5jdGlvbiBvclxuICovXG5hbmd1bGFyLm1vZHVsZSgnc2NoZW1hRm9ybScpLmRpcmVjdGl2ZSgnc2ZDaGFuZ2VkJywgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7XG4gICAgcmVxdWlyZTogJ25nTW9kZWwnLFxuICAgIHJlc3RyaWN0OiAnQUMnLFxuICAgIHNjb3BlOiBmYWxzZSxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmwpIHtcbiAgICAgIHZhciBmb3JtID0gc2NvcGUuJGV2YWwoYXR0cnMuc2ZDaGFuZ2VkKTtcbiAgICAgIC8vXCJmb3JtXCIgaXMgcmVhbGx5IGd1YXJhbnRlZWQgdG8gYmUgaGVyZSBzaW5jZSB0aGUgZGVjb3JhdG9yIGRpcmVjdGl2ZVxuICAgICAgLy93YWl0cyBmb3IgaXQuIEJ1dCBiZXN0IGJlIHN1cmUuXG4gICAgICBpZiAoZm9ybSAmJiBmb3JtLm9uQ2hhbmdlKSB7XG4gICAgICAgIGN0cmwuJHZpZXdDaGFuZ2VMaXN0ZW5lcnMucHVzaChmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKGZvcm0ub25DaGFuZ2UpKSB7XG4gICAgICAgICAgICBmb3JtLm9uQ2hhbmdlKGN0cmwuJG1vZGVsVmFsdWUsIGZvcm0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzY29wZS5ldmFsRXhwcihmb3JtLm9uQ2hhbmdlLCB7J21vZGVsVmFsdWUnOiBjdHJsLiRtb2RlbFZhbHVlLCBmb3JtOiBmb3JtfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59KTtcblxuLypcbkZJWE1FOiByZWFsIGRvY3VtZW50YXRpb25cbjxmb3JtIHNmLWZvcm09XCJmb3JtXCIgIHNmLXNjaGVtYT1cInNjaGVtYVwiIHNmLWRlY29yYXRvcj1cImZvb2JhclwiPjwvZm9ybT5cbiovXG5cbmFuZ3VsYXIubW9kdWxlKCdzY2hlbWFGb3JtJylcbiAgICAgICAuZGlyZWN0aXZlKCdzZlNjaGVtYScsXG5bJyRjb21waWxlJywgJ3NjaGVtYUZvcm0nLCAnc2NoZW1hRm9ybURlY29yYXRvcnMnLCAnc2ZTZWxlY3QnLFxuICBmdW5jdGlvbigkY29tcGlsZSwgIHNjaGVtYUZvcm0sICBzY2hlbWFGb3JtRGVjb3JhdG9ycywgc2ZTZWxlY3QpIHtcblxuICAgIHZhciBTTkFLRV9DQVNFX1JFR0VYUCA9IC9bQS1aXS9nO1xuICAgIHZhciBzbmFrZUNhc2UgPSBmdW5jdGlvbihuYW1lLCBzZXBhcmF0b3IpIHtcbiAgICAgIHNlcGFyYXRvciA9IHNlcGFyYXRvciB8fCAnXyc7XG4gICAgICByZXR1cm4gbmFtZS5yZXBsYWNlKFNOQUtFX0NBU0VfUkVHRVhQLCBmdW5jdGlvbihsZXR0ZXIsIHBvcykge1xuICAgICAgICByZXR1cm4gKHBvcyA/IHNlcGFyYXRvciA6ICcnKSArIGxldHRlci50b0xvd2VyQ2FzZSgpO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICBzY29wZToge1xuICAgICAgICBzY2hlbWE6ICc9c2ZTY2hlbWEnLFxuICAgICAgICBpbml0aWFsRm9ybTogJz1zZkZvcm0nLFxuICAgICAgICBtb2RlbDogJz1zZk1vZGVsJyxcbiAgICAgICAgb3B0aW9uczogJz1zZk9wdGlvbnMnXG4gICAgICB9LFxuICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCBmdW5jdGlvbigkc2NvcGUpIHtcbiAgICAgICAgdGhpcy5ldmFsSW5QYXJlbnRTY29wZSA9IGZ1bmN0aW9uKGV4cHIsIGxvY2Fscykge1xuICAgICAgICAgIHJldHVybiAkc2NvcGUuJHBhcmVudC4kZXZhbChleHByLCBsb2NhbHMpO1xuICAgICAgICB9O1xuICAgICAgfV0sXG4gICAgICByZXBsYWNlOiBmYWxzZSxcbiAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgcmVxdWlyZTogJz9mb3JtJyxcbiAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgZm9ybUN0cmwsIHRyYW5zY2x1ZGUpIHtcblxuICAgICAgICAvL2V4cG9zZSBmb3JtIGNvbnRyb2xsZXIgb24gc2NvcGUgc28gdGhhdCB3ZSBkb24ndCBmb3JjZSBhdXRob3JzIHRvIHVzZSBuYW1lIG9uIGZvcm1cbiAgICAgICAgc2NvcGUuZm9ybUN0cmwgPSBmb3JtQ3RybDtcblxuICAgICAgICAvL1dlJ2QgbGlrZSB0byBoYW5kbGUgZXhpc3RpbmcgbWFya3VwLFxuICAgICAgICAvL2Jlc2lkZXMgdXNpbmcgaXQgaW4gb3VyIHRlbXBsYXRlIHdlIGFsc29cbiAgICAgICAgLy9jaGVjayBmb3IgbmctbW9kZWwgYW5kIGFkZCB0aGF0IHRvIGFuIGlnbm9yZSBsaXN0XG4gICAgICAgIC8vaS5lLiBldmVuIGlmIGZvcm0gaGFzIGEgZGVmaW5pdGlvbiBmb3IgaXQgb3IgZm9ybSBpcyBbXCIqXCJdXG4gICAgICAgIC8vd2UgZG9uJ3QgZ2VuZXJhdGUgaXQuXG4gICAgICAgIHZhciBpZ25vcmUgPSB7fTtcbiAgICAgICAgdHJhbnNjbHVkZShzY29wZSwgZnVuY3Rpb24oY2xvbmUpIHtcbiAgICAgICAgICBjbG9uZS5hZGRDbGFzcygnc2NoZW1hLWZvcm0taWdub3JlJyk7XG4gICAgICAgICAgZWxlbWVudC5wcmVwZW5kKGNsb25lKTtcblxuICAgICAgICAgIGlmIChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3JBbGwpIHtcbiAgICAgICAgICAgIHZhciBtb2RlbHMgPSBlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tuZy1tb2RlbF0nKTtcbiAgICAgICAgICAgIGlmIChtb2RlbHMpIHtcbiAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb2RlbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIga2V5ID0gbW9kZWxzW2ldLmdldEF0dHJpYnV0ZSgnbmctbW9kZWwnKTtcbiAgICAgICAgICAgICAgICAvL3NraXAgZmlyc3QgcGFydCBiZWZvcmUgLlxuICAgICAgICAgICAgICAgIGlnbm9yZVtrZXkuc3Vic3RyaW5nKGtleS5pbmRleE9mKCcuJykgKyAxKV0gPSB0cnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy9TaW5jZSB3ZSBhcmUgZGVwZW5kYW50IG9uIHVwIHRvIHRocmVlXG4gICAgICAgIC8vYXR0cmlidXRlcyB3ZSdsbCBkbyBhIGNvbW1vbiB3YXRjaFxuICAgICAgICB2YXIgbGFzdERpZ2VzdCA9IHt9O1xuXG4gICAgICAgIHNjb3BlLiR3YXRjaChmdW5jdGlvbigpIHtcblxuICAgICAgICAgIHZhciBzY2hlbWEgPSBzY29wZS5zY2hlbWE7XG4gICAgICAgICAgdmFyIGZvcm0gICA9IHNjb3BlLmluaXRpYWxGb3JtIHx8IFsnKiddO1xuXG4gICAgICAgICAgLy9UaGUgY2hlY2sgZm9yIHNjaGVtYS50eXBlIGlzIHRvIGVuc3VyZSB0aGF0IHNjaGVtYSBpcyBub3Qge31cbiAgICAgICAgICBpZiAoZm9ybSAmJiBzY2hlbWEgJiYgc2NoZW1hLnR5cGUgJiZcbiAgICAgICAgICAgICAgKGxhc3REaWdlc3QuZm9ybSAhPT0gZm9ybSB8fCBsYXN0RGlnZXN0LnNjaGVtYSAhPT0gc2NoZW1hKSAmJlxuICAgICAgICAgICAgICBPYmplY3Qua2V5cyhzY2hlbWEucHJvcGVydGllcykubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgbGFzdERpZ2VzdC5zY2hlbWEgPSBzY2hlbWE7XG4gICAgICAgICAgICBsYXN0RGlnZXN0LmZvcm0gPSBmb3JtO1xuXG4gICAgICAgICAgICB2YXIgbWVyZ2VkID0gc2NoZW1hRm9ybS5tZXJnZShzY2hlbWEsIGZvcm0sIGlnbm9yZSwgc2NvcGUub3B0aW9ucyk7XG4gICAgICAgICAgICB2YXIgZnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcblxuICAgICAgICAgICAgLy9tYWtlIHRoZSBmb3JtIGF2YWlsYWJsZSB0byBkZWNvcmF0b3JzXG4gICAgICAgICAgICBzY29wZS5zY2hlbWFGb3JtICA9IHtmb3JtOiAgbWVyZ2VkLCBzY2hlbWE6IHNjaGVtYX07XG5cbiAgICAgICAgICAgIC8vY2xlYW4gYWxsIGJ1dCBwcmUgZXhpc3RpbmcgaHRtbC5cbiAgICAgICAgICAgIGVsZW1lbnQuY2hpbGRyZW4oJzpub3QoLnNjaGVtYS1mb3JtLWlnbm9yZSknKS5yZW1vdmUoKTtcblxuICAgICAgICAgICAgLy9DcmVhdGUgZGlyZWN0aXZlcyBmcm9tIHRoZSBmb3JtIGRlZmluaXRpb25cbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChtZXJnZWQsZnVuY3Rpb24ob2JqLGkpe1xuICAgICAgICAgICAgICB2YXIgbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoYXR0cnMuc2ZEZWNvcmF0b3IgfHwgc25ha2VDYXNlKHNjaGVtYUZvcm1EZWNvcmF0b3JzLmRlZmF1bHREZWNvcmF0b3IsJy0nKSk7XG4gICAgICAgICAgICAgIG4uc2V0QXR0cmlidXRlKCdmb3JtJywnc2NoZW1hRm9ybS5mb3JtWycraSsnXScpO1xuICAgICAgICAgICAgICB2YXIgc2xvdDtcbiAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBzbG90ID0gZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcqW3NmLWluc2VydC1maWVsZD1cIicgKyBvYmoua2V5ICsgJ1wiXScpO1xuICAgICAgICAgICAgICB9IGNhdGNoKGVycikge1xuICAgICAgICAgICAgICAgIC8vIGZpZWxkIGluc2VydGlvbiBub3Qgc3VwcG9ydGVkIGZvciBjb21wbGV4IGtleXNcbiAgICAgICAgICAgICAgICBzbG90ID0gbnVsbDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZihzbG90KSB7XG4gICAgICAgICAgICAgICAgc2xvdC5pbm5lckhUTUwgPSBcIlwiO1xuICAgICAgICAgICAgICAgIHNsb3QuYXBwZW5kQ2hpbGQobik7ICBcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmcmFnLmFwcGVuZENoaWxkKG4pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZWxlbWVudFswXS5hcHBlbmRDaGlsZChmcmFnKTtcblxuICAgICAgICAgICAgLy9jb21waWxlIG9ubHkgY2hpbGRyZW5cbiAgICAgICAgICAgICRjb21waWxlKGVsZW1lbnQuY2hpbGRyZW4oKSkoc2NvcGUpO1xuXG4gICAgICAgICAgICAvL29rLCBub3cgdGhhdCB0aGF0IGlzIGRvbmUgbGV0J3Mgc2V0IGFueSBkZWZhdWx0c1xuICAgICAgICAgICAgc2NoZW1hRm9ybS50cmF2ZXJzZVNjaGVtYShzY2hlbWEsIGZ1bmN0aW9uKHByb3AsIHBhdGgpIHtcbiAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKHByb3BbJ2RlZmF1bHQnXSkpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmFsID0gc2ZTZWxlY3QocGF0aCwgc2NvcGUubW9kZWwpO1xuICAgICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzVW5kZWZpbmVkKHZhbCkpIHtcbiAgICAgICAgICAgICAgICAgIHNmU2VsZWN0KHBhdGgsIHNjb3BlLm1vZGVsLCBwcm9wWydkZWZhdWx0J10pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5dKTtcblxuYW5ndWxhci5tb2R1bGUoJ3NjaGVtYUZvcm0nKS5kaXJlY3RpdmUoJ3NjaGVtYVZhbGlkYXRlJywgWydzZlZhbGlkYXRvcicsIGZ1bmN0aW9uKHNmVmFsaWRhdG9yKSB7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdBJyxcbiAgICBzY29wZTogZmFsc2UsXG4gICAgLy8gV2Ugd2FudCB0aGUgbGluayBmdW5jdGlvbiB0byBiZSAqYWZ0ZXIqIHRoZSBpbnB1dCBkaXJlY3RpdmVzIGxpbmsgZnVuY3Rpb24gc28gd2UgZ2V0IGFjY2Vzc1xuICAgIC8vIHRoZSBwYXJzZWQgdmFsdWUsIGV4LiBhIG51bWJlciBpbnN0ZWFkIG9mIGEgc3RyaW5nXG4gICAgcHJpb3JpdHk6IDEwMDAsXG4gICAgcmVxdWlyZTogJ25nTW9kZWwnLFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgbmdNb2RlbCkge1xuICAgICAgLy9TaW5jZSB3ZSBoYXZlIHNjb3BlIGZhbHNlIHRoaXMgaXMgdGhlIHNhbWUgc2NvcGVcbiAgICAgIC8vYXMgdGhlIGRlY29yYXRvclxuICAgICAgc2NvcGUubmdNb2RlbCA9IG5nTW9kZWw7XG5cbiAgICAgIHZhciBlcnJvciA9IG51bGw7XG5cbiAgICAgIHZhciBnZXRGb3JtID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghZm9ybSkge1xuICAgICAgICAgIGZvcm0gPSBzY29wZS4kZXZhbChhdHRycy5zY2hlbWFWYWxpZGF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZvcm07XG4gICAgICB9O1xuICAgICAgdmFyIGZvcm0gICA9IGdldEZvcm0oKTtcblxuICAgICAgLy8gVmFsaWRhdGUgYWdhaW5zdCB0aGUgc2NoZW1hLlxuXG4gICAgICAvLyBHZXQgaW4gbGFzdCBvZiB0aGUgcGFyc2VzIHNvIHRoZSBwYXJzZWQgdmFsdWUgaGFzIHRoZSBjb3JyZWN0IHR5cGUuXG4gICAgICBpZiAobmdNb2RlbC4kdmFsaWRhdG9ycykgeyAvLyBBbmd1bGFyIDEuM1xuICAgICAgICBuZ01vZGVsLiR2YWxpZGF0b3JzLnNjaGVtYSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgdmFyIHJlc3VsdCA9IHNmVmFsaWRhdG9yLnZhbGlkYXRlKGdldEZvcm0oKSwgdmFsdWUpO1xuICAgICAgICAgIGVycm9yID0gcmVzdWx0LmVycm9yO1xuICAgICAgICAgIHJldHVybiByZXN1bHQudmFsaWQ7XG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuXG4gICAgICAgIC8vIEFuZ3VsYXIgMS4yXG4gICAgICAgIG5nTW9kZWwuJHBhcnNlcnMucHVzaChmdW5jdGlvbih2aWV3VmFsdWUpIHtcbiAgICAgICAgICBmb3JtID0gZ2V0Rm9ybSgpO1xuICAgICAgICAgIC8vU3RpbGwgbWlnaHQgYmUgdW5kZWZpbmVkXG4gICAgICAgICAgaWYgKCFmb3JtKSB7XG4gICAgICAgICAgICByZXR1cm4gdmlld1ZhbHVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciByZXN1bHQgPSAgc2ZWYWxpZGF0b3IudmFsaWRhdGUoZm9ybSwgdmlld1ZhbHVlKTtcblxuICAgICAgICAgIGlmIChyZXN1bHQudmFsaWQpIHtcbiAgICAgICAgICAgIC8vIGl0IGlzIHZhbGlkXG4gICAgICAgICAgICBuZ01vZGVsLiRzZXRWYWxpZGl0eSgnc2NoZW1hJywgdHJ1ZSk7XG4gICAgICAgICAgICByZXR1cm4gdmlld1ZhbHVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBpdCBpcyBpbnZhbGlkLCByZXR1cm4gdW5kZWZpbmVkIChubyBtb2RlbCB1cGRhdGUpXG4gICAgICAgICAgICBuZ01vZGVsLiRzZXRWYWxpZGl0eSgnc2NoZW1hJywgZmFsc2UpO1xuICAgICAgICAgICAgZXJyb3IgPSByZXN1bHQuZXJyb3I7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cblxuICAgICAgLy8gTGlzdGVuIHRvIGFuIGV2ZW50IHNvIHdlIGNhbiB2YWxpZGF0ZSB0aGUgaW5wdXQgb24gcmVxdWVzdFxuICAgICAgc2NvcGUuJG9uKCdzY2hlbWFGb3JtVmFsaWRhdGUnLCBmdW5jdGlvbigpIHtcblxuICAgICAgICBpZiAobmdNb2RlbC4kdmFsaWRhdGUpIHtcbiAgICAgICAgICBuZ01vZGVsLiR2YWxpZGF0ZSgpO1xuICAgICAgICAgIGlmIChuZ01vZGVsLiRpbnZhbGlkKSB7IC8vIFRoZSBmaWVsZCBtdXN0IGJlIG1hZGUgZGlydHkgc28gdGhlIGVycm9yIG1lc3NhZ2UgaXMgZGlzcGxheWVkXG4gICAgICAgICAgICBuZ01vZGVsLiRkaXJ0eSA9IHRydWU7XG4gICAgICAgICAgICBuZ01vZGVsLiRwcmlzdGluZSA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuZ01vZGVsLiRzZXRWaWV3VmFsdWUobmdNb2RlbC4kdmlld1ZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vVGhpcyB3b3JrcyBzaW5jZSB3ZSBub3cgd2UncmUgaW5zaWRlIGEgZGVjb3JhdG9yIGFuZCB0aGF0IHRoaXMgaXMgdGhlIGRlY29yYXRvcnMgc2NvcGUuXG4gICAgICAvL0lmICRwcmlzdGluZSBhbmQgZW1wdHkgZG9uJ3Qgc2hvdyBzdWNjZXNzIChldmVuIGlmIGl0J3MgdmFsaWQpXG4gICAgICBzY29wZS5oYXNTdWNjZXNzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZ01vZGVsLiR2YWxpZCAmJiAoIW5nTW9kZWwuJHByaXN0aW5lIHx8ICFuZ01vZGVsLiRpc0VtcHR5KG5nTW9kZWwuJG1vZGVsVmFsdWUpKTtcbiAgICAgIH07XG5cbiAgICAgIHNjb3BlLmhhc0Vycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZ01vZGVsLiRpbnZhbGlkICYmICFuZ01vZGVsLiRwcmlzdGluZTtcbiAgICAgIH07XG5cbiAgICAgIHNjb3BlLnNjaGVtYUVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBlcnJvcjtcbiAgICAgIH07XG5cbiAgICB9XG4gIH07XG59XSk7XG4iLCIvKiFcbiAqIGFuZ3VsYXItdHJhbnNsYXRlIC0gdjIuNC4yIC0gMjAxNC0xMC0yMVxuICogaHR0cDovL2dpdGh1Yi5jb20vYW5ndWxhci10cmFuc2xhdGUvYW5ndWxhci10cmFuc2xhdGVcbiAqIENvcHlyaWdodCAoYykgMjAxNCA7IExpY2Vuc2VkIE1JVFxuICovXG5hbmd1bGFyLm1vZHVsZSgncGFzY2FscHJlY2h0LnRyYW5zbGF0ZScsIFsnbmcnXSkucnVuKFtcbiAgJyR0cmFuc2xhdGUnLFxuICBmdW5jdGlvbiAoJHRyYW5zbGF0ZSkge1xuICAgIHZhciBrZXkgPSAkdHJhbnNsYXRlLnN0b3JhZ2VLZXkoKSwgc3RvcmFnZSA9ICR0cmFuc2xhdGUuc3RvcmFnZSgpO1xuICAgIGlmIChzdG9yYWdlKSB7XG4gICAgICBpZiAoIXN0b3JhZ2UuZ2V0KGtleSkpIHtcbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNTdHJpbmcoJHRyYW5zbGF0ZS5wcmVmZXJyZWRMYW5ndWFnZSgpKSkge1xuICAgICAgICAgICR0cmFuc2xhdGUudXNlKCR0cmFuc2xhdGUucHJlZmVycmVkTGFuZ3VhZ2UoKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RvcmFnZS5zZXQoa2V5LCAkdHJhbnNsYXRlLnVzZSgpKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJHRyYW5zbGF0ZS51c2Uoc3RvcmFnZS5nZXQoa2V5KSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChhbmd1bGFyLmlzU3RyaW5nKCR0cmFuc2xhdGUucHJlZmVycmVkTGFuZ3VhZ2UoKSkpIHtcbiAgICAgICR0cmFuc2xhdGUudXNlKCR0cmFuc2xhdGUucHJlZmVycmVkTGFuZ3VhZ2UoKSk7XG4gICAgfVxuICB9XG5dKTtcbmFuZ3VsYXIubW9kdWxlKCdwYXNjYWxwcmVjaHQudHJhbnNsYXRlJykucHJvdmlkZXIoJyR0cmFuc2xhdGUnLCBbXG4gICckU1RPUkFHRV9LRVknLFxuICBmdW5jdGlvbiAoJFNUT1JBR0VfS0VZKSB7XG4gICAgdmFyICR0cmFuc2xhdGlvblRhYmxlID0ge30sICRwcmVmZXJyZWRMYW5ndWFnZSwgJGF2YWlsYWJsZUxhbmd1YWdlS2V5cyA9IFtdLCAkbGFuZ3VhZ2VLZXlBbGlhc2VzLCAkZmFsbGJhY2tMYW5ndWFnZSwgJGZhbGxiYWNrV2FzU3RyaW5nLCAkdXNlcywgJG5leHRMYW5nLCAkc3RvcmFnZUZhY3RvcnksICRzdG9yYWdlS2V5ID0gJFNUT1JBR0VfS0VZLCAkc3RvcmFnZVByZWZpeCwgJG1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXJGYWN0b3J5LCAkaW50ZXJwb2xhdGlvbkZhY3RvcnksICRpbnRlcnBvbGF0b3JGYWN0b3JpZXMgPSBbXSwgJGludGVycG9sYXRpb25TYW5pdGl6YXRpb25TdHJhdGVneSA9IGZhbHNlLCAkbG9hZGVyRmFjdG9yeSwgJGNsb2FrQ2xhc3NOYW1lID0gJ3RyYW5zbGF0ZS1jbG9haycsICRsb2FkZXJPcHRpb25zLCAkbm90Rm91bmRJbmRpY2F0b3JMZWZ0LCAkbm90Rm91bmRJbmRpY2F0b3JSaWdodCwgJHBvc3RDb21waWxpbmdFbmFibGVkID0gZmFsc2UsIE5FU1RFRF9PQkpFQ1RfREVMSU1JVEVSID0gJy4nLCBsb2FkZXJDYWNoZTtcbiAgICB2YXIgdmVyc2lvbiA9ICcyLjQuMic7XG4gICAgdmFyIGdldExvY2FsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBuYXYgPSB3aW5kb3cubmF2aWdhdG9yO1xuICAgICAgcmV0dXJuICgoYW5ndWxhci5pc0FycmF5KG5hdi5sYW5ndWFnZXMpID8gbmF2Lmxhbmd1YWdlc1swXSA6IG5hdi5sYW5ndWFnZSB8fCBuYXYuYnJvd3Nlckxhbmd1YWdlIHx8IG5hdi5zeXN0ZW1MYW5ndWFnZSB8fCBuYXYudXNlckxhbmd1YWdlKSB8fCAnJykuc3BsaXQoJy0nKS5qb2luKCdfJyk7XG4gICAgfTtcbiAgICB2YXIgaW5kZXhPZiA9IGZ1bmN0aW9uIChhcnJheSwgc2VhcmNoRWxlbWVudCkge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGFycmF5Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGlmIChhcnJheVtpXSA9PT0gc2VhcmNoRWxlbWVudCkge1xuICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gLTE7XG4gICAgfTtcbiAgICB2YXIgdHJpbSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcbiAgICB9O1xuICAgIHZhciBuZWdvdGlhdGVMb2NhbGUgPSBmdW5jdGlvbiAocHJlZmVycmVkKSB7XG4gICAgICB2YXIgYXZhaWwgPSBbXSwgbG9jYWxlID0gYW5ndWxhci5sb3dlcmNhc2UocHJlZmVycmVkKSwgaSA9IDAsIG4gPSAkYXZhaWxhYmxlTGFuZ3VhZ2VLZXlzLmxlbmd0aDtcbiAgICAgIGZvciAoOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgIGF2YWlsLnB1c2goYW5ndWxhci5sb3dlcmNhc2UoJGF2YWlsYWJsZUxhbmd1YWdlS2V5c1tpXSkpO1xuICAgICAgfVxuICAgICAgaWYgKGluZGV4T2YoYXZhaWwsIGxvY2FsZSkgPiAtMSkge1xuICAgICAgICByZXR1cm4gcHJlZmVycmVkO1xuICAgICAgfVxuICAgICAgaWYgKCRsYW5ndWFnZUtleUFsaWFzZXMpIHtcbiAgICAgICAgdmFyIGFsaWFzO1xuICAgICAgICBmb3IgKHZhciBsYW5nS2V5QWxpYXMgaW4gJGxhbmd1YWdlS2V5QWxpYXNlcykge1xuICAgICAgICAgIHZhciBoYXNXaWxkY2FyZEtleSA9IGZhbHNlO1xuICAgICAgICAgIHZhciBoYXNFeGFjdEtleSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCgkbGFuZ3VhZ2VLZXlBbGlhc2VzLCBsYW5nS2V5QWxpYXMpICYmIGFuZ3VsYXIubG93ZXJjYXNlKGxhbmdLZXlBbGlhcykgPT09IGFuZ3VsYXIubG93ZXJjYXNlKHByZWZlcnJlZCk7XG4gICAgICAgICAgaWYgKGxhbmdLZXlBbGlhcy5zbGljZSgtMSkgPT09ICcqJykge1xuICAgICAgICAgICAgaGFzV2lsZGNhcmRLZXkgPSBsYW5nS2V5QWxpYXMuc2xpY2UoMCwgLTEpID09PSBwcmVmZXJyZWQuc2xpY2UoMCwgbGFuZ0tleUFsaWFzLmxlbmd0aCAtIDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaGFzRXhhY3RLZXkgfHwgaGFzV2lsZGNhcmRLZXkpIHtcbiAgICAgICAgICAgIGFsaWFzID0gJGxhbmd1YWdlS2V5QWxpYXNlc1tsYW5nS2V5QWxpYXNdO1xuICAgICAgICAgICAgaWYgKGluZGV4T2YoYXZhaWwsIGFuZ3VsYXIubG93ZXJjYXNlKGFsaWFzKSkgPiAtMSkge1xuICAgICAgICAgICAgICByZXR1cm4gYWxpYXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2YXIgcGFydHMgPSBwcmVmZXJyZWQuc3BsaXQoJ18nKTtcbiAgICAgIGlmIChwYXJ0cy5sZW5ndGggPiAxICYmIGluZGV4T2YoYXZhaWwsIGFuZ3VsYXIubG93ZXJjYXNlKHBhcnRzWzBdKSkgPiAtMSkge1xuICAgICAgICByZXR1cm4gcGFydHNbMF07XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJlZmVycmVkO1xuICAgIH07XG4gICAgdmFyIHRyYW5zbGF0aW9ucyA9IGZ1bmN0aW9uIChsYW5nS2V5LCB0cmFuc2xhdGlvblRhYmxlKSB7XG4gICAgICBpZiAoIWxhbmdLZXkgJiYgIXRyYW5zbGF0aW9uVGFibGUpIHtcbiAgICAgICAgcmV0dXJuICR0cmFuc2xhdGlvblRhYmxlO1xuICAgICAgfVxuICAgICAgaWYgKGxhbmdLZXkgJiYgIXRyYW5zbGF0aW9uVGFibGUpIHtcbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNTdHJpbmcobGFuZ0tleSkpIHtcbiAgICAgICAgICByZXR1cm4gJHRyYW5zbGF0aW9uVGFibGVbbGFuZ0tleV07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghYW5ndWxhci5pc09iamVjdCgkdHJhbnNsYXRpb25UYWJsZVtsYW5nS2V5XSkpIHtcbiAgICAgICAgICAkdHJhbnNsYXRpb25UYWJsZVtsYW5nS2V5XSA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIGFuZ3VsYXIuZXh0ZW5kKCR0cmFuc2xhdGlvblRhYmxlW2xhbmdLZXldLCBmbGF0T2JqZWN0KHRyYW5zbGF0aW9uVGFibGUpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgdGhpcy50cmFuc2xhdGlvbnMgPSB0cmFuc2xhdGlvbnM7XG4gICAgdGhpcy5jbG9ha0NsYXNzTmFtZSA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICBpZiAoIW5hbWUpIHtcbiAgICAgICAgcmV0dXJuICRjbG9ha0NsYXNzTmFtZTtcbiAgICAgIH1cbiAgICAgICRjbG9ha0NsYXNzTmFtZSA9IG5hbWU7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIHZhciBmbGF0T2JqZWN0ID0gZnVuY3Rpb24gKGRhdGEsIHBhdGgsIHJlc3VsdCwgcHJldktleSkge1xuICAgICAgdmFyIGtleSwga2V5V2l0aFBhdGgsIGtleVdpdGhTaG9ydFBhdGgsIHZhbDtcbiAgICAgIGlmICghcGF0aCkge1xuICAgICAgICBwYXRoID0gW107XG4gICAgICB9XG4gICAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgICByZXN1bHQgPSB7fTtcbiAgICAgIH1cbiAgICAgIGZvciAoa2V5IGluIGRhdGEpIHtcbiAgICAgICAgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZGF0YSwga2V5KSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIHZhbCA9IGRhdGFba2V5XTtcbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNPYmplY3QodmFsKSkge1xuICAgICAgICAgIGZsYXRPYmplY3QodmFsLCBwYXRoLmNvbmNhdChrZXkpLCByZXN1bHQsIGtleSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAga2V5V2l0aFBhdGggPSBwYXRoLmxlbmd0aCA/ICcnICsgcGF0aC5qb2luKE5FU1RFRF9PQkpFQ1RfREVMSU1JVEVSKSArIE5FU1RFRF9PQkpFQ1RfREVMSU1JVEVSICsga2V5IDoga2V5O1xuICAgICAgICAgIGlmIChwYXRoLmxlbmd0aCAmJiBrZXkgPT09IHByZXZLZXkpIHtcbiAgICAgICAgICAgIGtleVdpdGhTaG9ydFBhdGggPSAnJyArIHBhdGguam9pbihORVNURURfT0JKRUNUX0RFTElNSVRFUik7XG4gICAgICAgICAgICByZXN1bHRba2V5V2l0aFNob3J0UGF0aF0gPSAnQDonICsga2V5V2l0aFBhdGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlc3VsdFtrZXlXaXRoUGF0aF0gPSB2YWw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgICB0aGlzLmFkZEludGVycG9sYXRpb24gPSBmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgICAgJGludGVycG9sYXRvckZhY3Rvcmllcy5wdXNoKGZhY3RvcnkpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICB0aGlzLnVzZU1lc3NhZ2VGb3JtYXRJbnRlcnBvbGF0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMudXNlSW50ZXJwb2xhdGlvbignJHRyYW5zbGF0ZU1lc3NhZ2VGb3JtYXRJbnRlcnBvbGF0aW9uJyk7XG4gICAgfTtcbiAgICB0aGlzLnVzZUludGVycG9sYXRpb24gPSBmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgICAgJGludGVycG9sYXRpb25GYWN0b3J5ID0gZmFjdG9yeTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgdGhpcy51c2VTYW5pdGl6ZVZhbHVlU3RyYXRlZ3kgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICRpbnRlcnBvbGF0aW9uU2FuaXRpemF0aW9uU3RyYXRlZ3kgPSB2YWx1ZTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgdGhpcy5wcmVmZXJyZWRMYW5ndWFnZSA9IGZ1bmN0aW9uIChsYW5nS2V5KSB7XG4gICAgICBzZXR1cFByZWZlcnJlZExhbmd1YWdlKGxhbmdLZXkpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICB2YXIgc2V0dXBQcmVmZXJyZWRMYW5ndWFnZSA9IGZ1bmN0aW9uIChsYW5nS2V5KSB7XG4gICAgICBpZiAobGFuZ0tleSkge1xuICAgICAgICAkcHJlZmVycmVkTGFuZ3VhZ2UgPSBsYW5nS2V5O1xuICAgICAgfVxuICAgICAgcmV0dXJuICRwcmVmZXJyZWRMYW5ndWFnZTtcbiAgICB9O1xuICAgIHRoaXMudHJhbnNsYXRpb25Ob3RGb3VuZEluZGljYXRvciA9IGZ1bmN0aW9uIChpbmRpY2F0b3IpIHtcbiAgICAgIHRoaXMudHJhbnNsYXRpb25Ob3RGb3VuZEluZGljYXRvckxlZnQoaW5kaWNhdG9yKTtcbiAgICAgIHRoaXMudHJhbnNsYXRpb25Ob3RGb3VuZEluZGljYXRvclJpZ2h0KGluZGljYXRvcik7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIHRoaXMudHJhbnNsYXRpb25Ob3RGb3VuZEluZGljYXRvckxlZnQgPSBmdW5jdGlvbiAoaW5kaWNhdG9yKSB7XG4gICAgICBpZiAoIWluZGljYXRvcikge1xuICAgICAgICByZXR1cm4gJG5vdEZvdW5kSW5kaWNhdG9yTGVmdDtcbiAgICAgIH1cbiAgICAgICRub3RGb3VuZEluZGljYXRvckxlZnQgPSBpbmRpY2F0b3I7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIHRoaXMudHJhbnNsYXRpb25Ob3RGb3VuZEluZGljYXRvclJpZ2h0ID0gZnVuY3Rpb24gKGluZGljYXRvcikge1xuICAgICAgaWYgKCFpbmRpY2F0b3IpIHtcbiAgICAgICAgcmV0dXJuICRub3RGb3VuZEluZGljYXRvclJpZ2h0O1xuICAgICAgfVxuICAgICAgJG5vdEZvdW5kSW5kaWNhdG9yUmlnaHQgPSBpbmRpY2F0b3I7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIHRoaXMuZmFsbGJhY2tMYW5ndWFnZSA9IGZ1bmN0aW9uIChsYW5nS2V5KSB7XG4gICAgICBmYWxsYmFja1N0YWNrKGxhbmdLZXkpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICB2YXIgZmFsbGJhY2tTdGFjayA9IGZ1bmN0aW9uIChsYW5nS2V5KSB7XG4gICAgICBpZiAobGFuZ0tleSkge1xuICAgICAgICBpZiAoYW5ndWxhci5pc1N0cmluZyhsYW5nS2V5KSkge1xuICAgICAgICAgICRmYWxsYmFja1dhc1N0cmluZyA9IHRydWU7XG4gICAgICAgICAgJGZhbGxiYWNrTGFuZ3VhZ2UgPSBbbGFuZ0tleV07XG4gICAgICAgIH0gZWxzZSBpZiAoYW5ndWxhci5pc0FycmF5KGxhbmdLZXkpKSB7XG4gICAgICAgICAgJGZhbGxiYWNrV2FzU3RyaW5nID0gZmFsc2U7XG4gICAgICAgICAgJGZhbGxiYWNrTGFuZ3VhZ2UgPSBsYW5nS2V5O1xuICAgICAgICB9XG4gICAgICAgIGlmIChhbmd1bGFyLmlzU3RyaW5nKCRwcmVmZXJyZWRMYW5ndWFnZSkgJiYgaW5kZXhPZigkZmFsbGJhY2tMYW5ndWFnZSwgJHByZWZlcnJlZExhbmd1YWdlKSA8IDApIHtcbiAgICAgICAgICAkZmFsbGJhY2tMYW5ndWFnZS5wdXNoKCRwcmVmZXJyZWRMYW5ndWFnZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoJGZhbGxiYWNrV2FzU3RyaW5nKSB7XG4gICAgICAgICAgcmV0dXJuICRmYWxsYmFja0xhbmd1YWdlWzBdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiAkZmFsbGJhY2tMYW5ndWFnZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gICAgdGhpcy51c2UgPSBmdW5jdGlvbiAobGFuZ0tleSkge1xuICAgICAgaWYgKGxhbmdLZXkpIHtcbiAgICAgICAgaWYgKCEkdHJhbnNsYXRpb25UYWJsZVtsYW5nS2V5XSAmJiAhJGxvYWRlckZhY3RvcnkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJyR0cmFuc2xhdGVQcm92aWRlciBjb3VsZG5cXCd0IGZpbmQgdHJhbnNsYXRpb25UYWJsZSBmb3IgbGFuZ0tleTogXFwnJyArIGxhbmdLZXkgKyAnXFwnJyk7XG4gICAgICAgIH1cbiAgICAgICAgJHVzZXMgPSBsYW5nS2V5O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIHJldHVybiAkdXNlcztcbiAgICB9O1xuICAgIHZhciBzdG9yYWdlS2V5ID0gZnVuY3Rpb24gKGtleSkge1xuICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgaWYgKCRzdG9yYWdlUHJlZml4KSB7XG4gICAgICAgICAgcmV0dXJuICRzdG9yYWdlUHJlZml4ICsgJHN0b3JhZ2VLZXk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICRzdG9yYWdlS2V5O1xuICAgICAgfVxuICAgICAgJHN0b3JhZ2VLZXkgPSBrZXk7XG4gICAgfTtcbiAgICB0aGlzLnN0b3JhZ2VLZXkgPSBzdG9yYWdlS2V5O1xuICAgIHRoaXMudXNlVXJsTG9hZGVyID0gZnVuY3Rpb24gKHVybCwgb3B0aW9ucykge1xuICAgICAgcmV0dXJuIHRoaXMudXNlTG9hZGVyKCckdHJhbnNsYXRlVXJsTG9hZGVyJywgYW5ndWxhci5leHRlbmQoeyB1cmw6IHVybCB9LCBvcHRpb25zKSk7XG4gICAgfTtcbiAgICB0aGlzLnVzZVN0YXRpY0ZpbGVzTG9hZGVyID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgIHJldHVybiB0aGlzLnVzZUxvYWRlcignJHRyYW5zbGF0ZVN0YXRpY0ZpbGVzTG9hZGVyJywgb3B0aW9ucyk7XG4gICAgfTtcbiAgICB0aGlzLnVzZUxvYWRlciA9IGZ1bmN0aW9uIChsb2FkZXJGYWN0b3J5LCBvcHRpb25zKSB7XG4gICAgICAkbG9hZGVyRmFjdG9yeSA9IGxvYWRlckZhY3Rvcnk7XG4gICAgICAkbG9hZGVyT3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIHRoaXMudXNlTG9jYWxTdG9yYWdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMudXNlU3RvcmFnZSgnJHRyYW5zbGF0ZUxvY2FsU3RvcmFnZScpO1xuICAgIH07XG4gICAgdGhpcy51c2VDb29raWVTdG9yYWdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMudXNlU3RvcmFnZSgnJHRyYW5zbGF0ZUNvb2tpZVN0b3JhZ2UnKTtcbiAgICB9O1xuICAgIHRoaXMudXNlU3RvcmFnZSA9IGZ1bmN0aW9uIChzdG9yYWdlRmFjdG9yeSkge1xuICAgICAgJHN0b3JhZ2VGYWN0b3J5ID0gc3RvcmFnZUZhY3Rvcnk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIHRoaXMuc3RvcmFnZVByZWZpeCA9IGZ1bmN0aW9uIChwcmVmaXgpIHtcbiAgICAgIGlmICghcHJlZml4KSB7XG4gICAgICAgIHJldHVybiBwcmVmaXg7XG4gICAgICB9XG4gICAgICAkc3RvcmFnZVByZWZpeCA9IHByZWZpeDtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgdGhpcy51c2VNaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyTG9nID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMudXNlTWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlcignJHRyYW5zbGF0ZU1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXJMb2cnKTtcbiAgICB9O1xuICAgIHRoaXMudXNlTWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlciA9IGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgICAkbWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlckZhY3RvcnkgPSBmYWN0b3J5O1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICB0aGlzLnVzZVBvc3RDb21waWxpbmcgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICRwb3N0Q29tcGlsaW5nRW5hYmxlZCA9ICEhdmFsdWU7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIHRoaXMuZGV0ZXJtaW5lUHJlZmVycmVkTGFuZ3VhZ2UgPSBmdW5jdGlvbiAoZm4pIHtcbiAgICAgIHZhciBsb2NhbGUgPSBmbiAmJiBhbmd1bGFyLmlzRnVuY3Rpb24oZm4pID8gZm4oKSA6IGdldExvY2FsZSgpO1xuICAgICAgaWYgKCEkYXZhaWxhYmxlTGFuZ3VhZ2VLZXlzLmxlbmd0aCkge1xuICAgICAgICAkcHJlZmVycmVkTGFuZ3VhZ2UgPSBsb2NhbGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkcHJlZmVycmVkTGFuZ3VhZ2UgPSBuZWdvdGlhdGVMb2NhbGUobG9jYWxlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgdGhpcy5yZWdpc3RlckF2YWlsYWJsZUxhbmd1YWdlS2V5cyA9IGZ1bmN0aW9uIChsYW5ndWFnZUtleXMsIGFsaWFzZXMpIHtcbiAgICAgIGlmIChsYW5ndWFnZUtleXMpIHtcbiAgICAgICAgJGF2YWlsYWJsZUxhbmd1YWdlS2V5cyA9IGxhbmd1YWdlS2V5cztcbiAgICAgICAgaWYgKGFsaWFzZXMpIHtcbiAgICAgICAgICAkbGFuZ3VhZ2VLZXlBbGlhc2VzID0gYWxpYXNlcztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIHJldHVybiAkYXZhaWxhYmxlTGFuZ3VhZ2VLZXlzO1xuICAgIH07XG4gICAgdGhpcy51c2VMb2FkZXJDYWNoZSA9IGZ1bmN0aW9uIChjYWNoZSkge1xuICAgICAgaWYgKGNhY2hlID09PSBmYWxzZSkge1xuICAgICAgICBsb2FkZXJDYWNoZSA9IHVuZGVmaW5lZDtcbiAgICAgIH0gZWxzZSBpZiAoY2FjaGUgPT09IHRydWUpIHtcbiAgICAgICAgbG9hZGVyQ2FjaGUgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgY2FjaGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGxvYWRlckNhY2hlID0gJyR0cmFuc2xhdGlvbkNhY2hlJztcbiAgICAgIH0gZWxzZSBpZiAoY2FjaGUpIHtcbiAgICAgICAgbG9hZGVyQ2FjaGUgPSBjYWNoZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgdGhpcy4kZ2V0ID0gW1xuICAgICAgJyRsb2cnLFxuICAgICAgJyRpbmplY3RvcicsXG4gICAgICAnJHJvb3RTY29wZScsXG4gICAgICAnJHEnLFxuICAgICAgZnVuY3Rpb24gKCRsb2csICRpbmplY3RvciwgJHJvb3RTY29wZSwgJHEpIHtcbiAgICAgICAgdmFyIFN0b3JhZ2UsIGRlZmF1bHRJbnRlcnBvbGF0b3IgPSAkaW5qZWN0b3IuZ2V0KCRpbnRlcnBvbGF0aW9uRmFjdG9yeSB8fCAnJHRyYW5zbGF0ZURlZmF1bHRJbnRlcnBvbGF0aW9uJyksIHBlbmRpbmdMb2FkZXIgPSBmYWxzZSwgaW50ZXJwb2xhdG9ySGFzaE1hcCA9IHt9LCBsYW5nUHJvbWlzZXMgPSB7fSwgZmFsbGJhY2tJbmRleCwgc3RhcnRGYWxsYmFja0l0ZXJhdGlvbjtcbiAgICAgICAgdmFyICR0cmFuc2xhdGUgPSBmdW5jdGlvbiAodHJhbnNsYXRpb25JZCwgaW50ZXJwb2xhdGVQYXJhbXMsIGludGVycG9sYXRpb25JZCkge1xuICAgICAgICAgIGlmIChhbmd1bGFyLmlzQXJyYXkodHJhbnNsYXRpb25JZCkpIHtcbiAgICAgICAgICAgIHZhciB0cmFuc2xhdGVBbGwgPSBmdW5jdGlvbiAodHJhbnNsYXRpb25JZHMpIHtcbiAgICAgICAgICAgICAgdmFyIHJlc3VsdHMgPSB7fTtcbiAgICAgICAgICAgICAgdmFyIHByb21pc2VzID0gW107XG4gICAgICAgICAgICAgIHZhciB0cmFuc2xhdGUgPSBmdW5jdGlvbiAodHJhbnNsYXRpb25JZCkge1xuICAgICAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICAgICAgdmFyIHJlZ2FyZGxlc3MgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgIHJlc3VsdHNbdHJhbnNsYXRpb25JZF0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoW1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGlvbklkLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZVxuICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAkdHJhbnNsYXRlKHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zLCBpbnRlcnBvbGF0aW9uSWQpLnRoZW4ocmVnYXJkbGVzcywgcmVnYXJkbGVzcyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBjID0gdHJhbnNsYXRpb25JZHMubGVuZ3RoOyBpIDwgYzsgaSsrKSB7XG4gICAgICAgICAgICAgICAgcHJvbWlzZXMucHVzaCh0cmFuc2xhdGUodHJhbnNsYXRpb25JZHNbaV0pKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gJHEuYWxsKHByb21pc2VzKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIHRyYW5zbGF0ZUFsbCh0cmFuc2xhdGlvbklkKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICBpZiAodHJhbnNsYXRpb25JZCkge1xuICAgICAgICAgICAgdHJhbnNsYXRpb25JZCA9IHRyaW0uYXBwbHkodHJhbnNsYXRpb25JZCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciBwcm9taXNlVG9XYWl0Rm9yID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICB2YXIgcHJvbWlzZSA9ICRwcmVmZXJyZWRMYW5ndWFnZSA/IGxhbmdQcm9taXNlc1skcHJlZmVycmVkTGFuZ3VhZ2VdIDogbGFuZ1Byb21pc2VzWyR1c2VzXTtcbiAgICAgICAgICAgICAgZmFsbGJhY2tJbmRleCA9IDA7XG4gICAgICAgICAgICAgIGlmICgkc3RvcmFnZUZhY3RvcnkgJiYgIXByb21pc2UpIHtcbiAgICAgICAgICAgICAgICB2YXIgbGFuZ0tleSA9IFN0b3JhZ2UuZ2V0KCRzdG9yYWdlS2V5KTtcbiAgICAgICAgICAgICAgICBwcm9taXNlID0gbGFuZ1Byb21pc2VzW2xhbmdLZXldO1xuICAgICAgICAgICAgICAgIGlmICgkZmFsbGJhY2tMYW5ndWFnZSAmJiAkZmFsbGJhY2tMYW5ndWFnZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IGluZGV4T2YoJGZhbGxiYWNrTGFuZ3VhZ2UsIGxhbmdLZXkpO1xuICAgICAgICAgICAgICAgICAgZmFsbGJhY2tJbmRleCA9IGluZGV4ID09PSAwID8gMSA6IDA7XG4gICAgICAgICAgICAgICAgICBpZiAoaW5kZXhPZigkZmFsbGJhY2tMYW5ndWFnZSwgJHByZWZlcnJlZExhbmd1YWdlKSA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgJGZhbGxiYWNrTGFuZ3VhZ2UucHVzaCgkcHJlZmVycmVkTGFuZ3VhZ2UpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgICAgICAgIH0oKTtcbiAgICAgICAgICBpZiAoIXByb21pc2VUb1dhaXRGb3IpIHtcbiAgICAgICAgICAgIGRldGVybWluZVRyYW5zbGF0aW9uKHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zLCBpbnRlcnBvbGF0aW9uSWQpLnRoZW4oZGVmZXJyZWQucmVzb2x2ZSwgZGVmZXJyZWQucmVqZWN0KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcHJvbWlzZVRvV2FpdEZvci50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgZGV0ZXJtaW5lVHJhbnNsYXRpb24odHJhbnNsYXRpb25JZCwgaW50ZXJwb2xhdGVQYXJhbXMsIGludGVycG9sYXRpb25JZCkudGhlbihkZWZlcnJlZC5yZXNvbHZlLCBkZWZlcnJlZC5yZWplY3QpO1xuICAgICAgICAgICAgfSwgZGVmZXJyZWQucmVqZWN0KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG4gICAgICAgIHZhciBhcHBseU5vdEZvdW5kSW5kaWNhdG9ycyA9IGZ1bmN0aW9uICh0cmFuc2xhdGlvbklkKSB7XG4gICAgICAgICAgaWYgKCRub3RGb3VuZEluZGljYXRvckxlZnQpIHtcbiAgICAgICAgICAgIHRyYW5zbGF0aW9uSWQgPSBbXG4gICAgICAgICAgICAgICRub3RGb3VuZEluZGljYXRvckxlZnQsXG4gICAgICAgICAgICAgIHRyYW5zbGF0aW9uSWRcbiAgICAgICAgICAgIF0uam9pbignICcpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoJG5vdEZvdW5kSW5kaWNhdG9yUmlnaHQpIHtcbiAgICAgICAgICAgIHRyYW5zbGF0aW9uSWQgPSBbXG4gICAgICAgICAgICAgIHRyYW5zbGF0aW9uSWQsXG4gICAgICAgICAgICAgICRub3RGb3VuZEluZGljYXRvclJpZ2h0XG4gICAgICAgICAgICBdLmpvaW4oJyAnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRyYW5zbGF0aW9uSWQ7XG4gICAgICAgIH07XG4gICAgICAgIHZhciB1c2VMYW5ndWFnZSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAkdXNlcyA9IGtleTtcbiAgICAgICAgICAkcm9vdFNjb3BlLiRlbWl0KCckdHJhbnNsYXRlQ2hhbmdlU3VjY2VzcycsIHsgbGFuZ3VhZ2U6IGtleSB9KTtcbiAgICAgICAgICBpZiAoJHN0b3JhZ2VGYWN0b3J5KSB7XG4gICAgICAgICAgICBTdG9yYWdlLnNldCgkdHJhbnNsYXRlLnN0b3JhZ2VLZXkoKSwgJHVzZXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBkZWZhdWx0SW50ZXJwb2xhdG9yLnNldExvY2FsZSgkdXNlcyk7XG4gICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGludGVycG9sYXRvckhhc2hNYXAsIGZ1bmN0aW9uIChpbnRlcnBvbGF0b3IsIGlkKSB7XG4gICAgICAgICAgICBpbnRlcnBvbGF0b3JIYXNoTWFwW2lkXS5zZXRMb2NhbGUoJHVzZXMpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgICRyb290U2NvcGUuJGVtaXQoJyR0cmFuc2xhdGVDaGFuZ2VFbmQnLCB7IGxhbmd1YWdlOiBrZXkgfSk7XG4gICAgICAgIH07XG4gICAgICAgIHZhciBsb2FkQXN5bmMgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICAgIHRocm93ICdObyBsYW5ndWFnZSBrZXkgc3BlY2lmaWVkIGZvciBsb2FkaW5nLic7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgJHJvb3RTY29wZS4kZW1pdCgnJHRyYW5zbGF0ZUxvYWRpbmdTdGFydCcsIHsgbGFuZ3VhZ2U6IGtleSB9KTtcbiAgICAgICAgICBwZW5kaW5nTG9hZGVyID0gdHJ1ZTtcbiAgICAgICAgICB2YXIgY2FjaGUgPSBsb2FkZXJDYWNoZTtcbiAgICAgICAgICBpZiAodHlwZW9mIGNhY2hlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgY2FjaGUgPSAkaW5qZWN0b3IuZ2V0KGNhY2hlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFyIGxvYWRlck9wdGlvbnMgPSBhbmd1bGFyLmV4dGVuZCh7fSwgJGxvYWRlck9wdGlvbnMsIHtcbiAgICAgICAgICAgICAga2V5OiBrZXksXG4gICAgICAgICAgICAgICRodHRwOiBhbmd1bGFyLmV4dGVuZCh7fSwgeyBjYWNoZTogY2FjaGUgfSwgJGxvYWRlck9wdGlvbnMuJGh0dHApXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAkaW5qZWN0b3IuZ2V0KCRsb2FkZXJGYWN0b3J5KShsb2FkZXJPcHRpb25zKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICB2YXIgdHJhbnNsYXRpb25UYWJsZSA9IHt9O1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kZW1pdCgnJHRyYW5zbGF0ZUxvYWRpbmdTdWNjZXNzJywgeyBsYW5ndWFnZToga2V5IH0pO1xuICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNBcnJheShkYXRhKSkge1xuICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goZGF0YSwgZnVuY3Rpb24gKHRhYmxlKSB7XG4gICAgICAgICAgICAgICAgYW5ndWxhci5leHRlbmQodHJhbnNsYXRpb25UYWJsZSwgZmxhdE9iamVjdCh0YWJsZSkpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHRyYW5zbGF0aW9uVGFibGUsIGZsYXRPYmplY3QoZGF0YSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGVuZGluZ0xvYWRlciA9IGZhbHNlO1xuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgICAgICAgIGtleToga2V5LFxuICAgICAgICAgICAgICB0YWJsZTogdHJhbnNsYXRpb25UYWJsZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRlbWl0KCckdHJhbnNsYXRlTG9hZGluZ0VuZCcsIHsgbGFuZ3VhZ2U6IGtleSB9KTtcbiAgICAgICAgICB9LCBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRlbWl0KCckdHJhbnNsYXRlTG9hZGluZ0Vycm9yJywgeyBsYW5ndWFnZToga2V5IH0pO1xuICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGtleSk7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRlbWl0KCckdHJhbnNsYXRlTG9hZGluZ0VuZCcsIHsgbGFuZ3VhZ2U6IGtleSB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKCRzdG9yYWdlRmFjdG9yeSkge1xuICAgICAgICAgIFN0b3JhZ2UgPSAkaW5qZWN0b3IuZ2V0KCRzdG9yYWdlRmFjdG9yeSk7XG4gICAgICAgICAgaWYgKCFTdG9yYWdlLmdldCB8fCAhU3RvcmFnZS5zZXQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGRuXFwndCB1c2Ugc3RvcmFnZSBcXCcnICsgJHN0b3JhZ2VGYWN0b3J5ICsgJ1xcJywgbWlzc2luZyBnZXQoKSBvciBzZXQoKSBtZXRob2QhJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24oZGVmYXVsdEludGVycG9sYXRvci51c2VTYW5pdGl6ZVZhbHVlU3RyYXRlZ3kpKSB7XG4gICAgICAgICAgZGVmYXVsdEludGVycG9sYXRvci51c2VTYW5pdGl6ZVZhbHVlU3RyYXRlZ3koJGludGVycG9sYXRpb25TYW5pdGl6YXRpb25TdHJhdGVneSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCRpbnRlcnBvbGF0b3JGYWN0b3JpZXMubGVuZ3RoKSB7XG4gICAgICAgICAgYW5ndWxhci5mb3JFYWNoKCRpbnRlcnBvbGF0b3JGYWN0b3JpZXMsIGZ1bmN0aW9uIChpbnRlcnBvbGF0b3JGYWN0b3J5KSB7XG4gICAgICAgICAgICB2YXIgaW50ZXJwb2xhdG9yID0gJGluamVjdG9yLmdldChpbnRlcnBvbGF0b3JGYWN0b3J5KTtcbiAgICAgICAgICAgIGludGVycG9sYXRvci5zZXRMb2NhbGUoJHByZWZlcnJlZExhbmd1YWdlIHx8ICR1c2VzKTtcbiAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24oaW50ZXJwb2xhdG9yLnVzZVNhbml0aXplVmFsdWVTdHJhdGVneSkpIHtcbiAgICAgICAgICAgICAgaW50ZXJwb2xhdG9yLnVzZVNhbml0aXplVmFsdWVTdHJhdGVneSgkaW50ZXJwb2xhdGlvblNhbml0aXphdGlvblN0cmF0ZWd5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGludGVycG9sYXRvckhhc2hNYXBbaW50ZXJwb2xhdG9yLmdldEludGVycG9sYXRpb25JZGVudGlmaWVyKCldID0gaW50ZXJwb2xhdG9yO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHZhciBnZXRUcmFuc2xhdGlvblRhYmxlID0gZnVuY3Rpb24gKGxhbmdLZXkpIHtcbiAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoJHRyYW5zbGF0aW9uVGFibGUsIGxhbmdLZXkpKSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCR0cmFuc2xhdGlvblRhYmxlW2xhbmdLZXldKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGxhbmdQcm9taXNlc1tsYW5nS2V5XSkge1xuICAgICAgICAgICAgbGFuZ1Byb21pc2VzW2xhbmdLZXldLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgdHJhbnNsYXRpb25zKGRhdGEua2V5LCBkYXRhLnRhYmxlKTtcbiAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhLnRhYmxlKTtcbiAgICAgICAgICAgIH0sIGRlZmVycmVkLnJlamVjdCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIGdldEZhbGxiYWNrVHJhbnNsYXRpb24gPSBmdW5jdGlvbiAobGFuZ0tleSwgdHJhbnNsYXRpb25JZCwgaW50ZXJwb2xhdGVQYXJhbXMsIEludGVycG9sYXRvcikge1xuICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgZ2V0VHJhbnNsYXRpb25UYWJsZShsYW5nS2V5KS50aGVuKGZ1bmN0aW9uICh0cmFuc2xhdGlvblRhYmxlKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRyYW5zbGF0aW9uVGFibGUsIHRyYW5zbGF0aW9uSWQpKSB7XG4gICAgICAgICAgICAgIEludGVycG9sYXRvci5zZXRMb2NhbGUobGFuZ0tleSk7XG4gICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoSW50ZXJwb2xhdG9yLmludGVycG9sYXRlKHRyYW5zbGF0aW9uVGFibGVbdHJhbnNsYXRpb25JZF0sIGludGVycG9sYXRlUGFyYW1zKSk7XG4gICAgICAgICAgICAgIEludGVycG9sYXRvci5zZXRMb2NhbGUoJHVzZXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSwgZGVmZXJyZWQucmVqZWN0KTtcbiAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIGdldEZhbGxiYWNrVHJhbnNsYXRpb25JbnN0YW50ID0gZnVuY3Rpb24gKGxhbmdLZXksIHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zLCBJbnRlcnBvbGF0b3IpIHtcbiAgICAgICAgICB2YXIgcmVzdWx0LCB0cmFuc2xhdGlvblRhYmxlID0gJHRyYW5zbGF0aW9uVGFibGVbbGFuZ0tleV07XG4gICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0cmFuc2xhdGlvblRhYmxlLCB0cmFuc2xhdGlvbklkKSkge1xuICAgICAgICAgICAgSW50ZXJwb2xhdG9yLnNldExvY2FsZShsYW5nS2V5KTtcbiAgICAgICAgICAgIHJlc3VsdCA9IEludGVycG9sYXRvci5pbnRlcnBvbGF0ZSh0cmFuc2xhdGlvblRhYmxlW3RyYW5zbGF0aW9uSWRdLCBpbnRlcnBvbGF0ZVBhcmFtcyk7XG4gICAgICAgICAgICBJbnRlcnBvbGF0b3Iuc2V0TG9jYWxlKCR1c2VzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHRyYW5zbGF0ZUJ5SGFuZGxlciA9IGZ1bmN0aW9uICh0cmFuc2xhdGlvbklkKSB7XG4gICAgICAgICAgaWYgKCRtaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyRmFjdG9yeSkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdFN0cmluZyA9ICRpbmplY3Rvci5nZXQoJG1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXJGYWN0b3J5KSh0cmFuc2xhdGlvbklkLCAkdXNlcyk7XG4gICAgICAgICAgICBpZiAocmVzdWx0U3RyaW5nICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdFN0cmluZztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiB0cmFuc2xhdGlvbklkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdHJhbnNsYXRpb25JZDtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHZhciByZXNvbHZlRm9yRmFsbGJhY2tMYW5ndWFnZSA9IGZ1bmN0aW9uIChmYWxsYmFja0xhbmd1YWdlSW5kZXgsIHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zLCBJbnRlcnBvbGF0b3IpIHtcbiAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgIGlmIChmYWxsYmFja0xhbmd1YWdlSW5kZXggPCAkZmFsbGJhY2tMYW5ndWFnZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhciBsYW5nS2V5ID0gJGZhbGxiYWNrTGFuZ3VhZ2VbZmFsbGJhY2tMYW5ndWFnZUluZGV4XTtcbiAgICAgICAgICAgIGdldEZhbGxiYWNrVHJhbnNsYXRpb24obGFuZ0tleSwgdHJhbnNsYXRpb25JZCwgaW50ZXJwb2xhdGVQYXJhbXMsIEludGVycG9sYXRvcikudGhlbihkZWZlcnJlZC5yZXNvbHZlLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIHJlc29sdmVGb3JGYWxsYmFja0xhbmd1YWdlKGZhbGxiYWNrTGFuZ3VhZ2VJbmRleCArIDEsIHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zLCBJbnRlcnBvbGF0b3IpLnRoZW4oZGVmZXJyZWQucmVzb2x2ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh0cmFuc2xhdGVCeUhhbmRsZXIodHJhbnNsYXRpb25JZCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHJlc29sdmVGb3JGYWxsYmFja0xhbmd1YWdlSW5zdGFudCA9IGZ1bmN0aW9uIChmYWxsYmFja0xhbmd1YWdlSW5kZXgsIHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zLCBJbnRlcnBvbGF0b3IpIHtcbiAgICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICAgIGlmIChmYWxsYmFja0xhbmd1YWdlSW5kZXggPCAkZmFsbGJhY2tMYW5ndWFnZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhciBsYW5nS2V5ID0gJGZhbGxiYWNrTGFuZ3VhZ2VbZmFsbGJhY2tMYW5ndWFnZUluZGV4XTtcbiAgICAgICAgICAgIHJlc3VsdCA9IGdldEZhbGxiYWNrVHJhbnNsYXRpb25JbnN0YW50KGxhbmdLZXksIHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zLCBJbnRlcnBvbGF0b3IpO1xuICAgICAgICAgICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzb2x2ZUZvckZhbGxiYWNrTGFuZ3VhZ2VJbnN0YW50KGZhbGxiYWNrTGFuZ3VhZ2VJbmRleCArIDEsIHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zLCBJbnRlcnBvbGF0b3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9O1xuICAgICAgICB2YXIgZmFsbGJhY2tUcmFuc2xhdGlvbiA9IGZ1bmN0aW9uICh0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgSW50ZXJwb2xhdG9yKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmVGb3JGYWxsYmFja0xhbmd1YWdlKHN0YXJ0RmFsbGJhY2tJdGVyYXRpb24gPiAwID8gc3RhcnRGYWxsYmFja0l0ZXJhdGlvbiA6IGZhbGxiYWNrSW5kZXgsIHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zLCBJbnRlcnBvbGF0b3IpO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgZmFsbGJhY2tUcmFuc2xhdGlvbkluc3RhbnQgPSBmdW5jdGlvbiAodHJhbnNsYXRpb25JZCwgaW50ZXJwb2xhdGVQYXJhbXMsIEludGVycG9sYXRvcikge1xuICAgICAgICAgIHJldHVybiByZXNvbHZlRm9yRmFsbGJhY2tMYW5ndWFnZUluc3RhbnQoc3RhcnRGYWxsYmFja0l0ZXJhdGlvbiA+IDAgPyBzdGFydEZhbGxiYWNrSXRlcmF0aW9uIDogZmFsbGJhY2tJbmRleCwgdHJhbnNsYXRpb25JZCwgaW50ZXJwb2xhdGVQYXJhbXMsIEludGVycG9sYXRvcik7XG4gICAgICAgIH07XG4gICAgICAgIHZhciBkZXRlcm1pbmVUcmFuc2xhdGlvbiA9IGZ1bmN0aW9uICh0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgaW50ZXJwb2xhdGlvbklkKSB7XG4gICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICB2YXIgdGFibGUgPSAkdXNlcyA/ICR0cmFuc2xhdGlvblRhYmxlWyR1c2VzXSA6ICR0cmFuc2xhdGlvblRhYmxlLCBJbnRlcnBvbGF0b3IgPSBpbnRlcnBvbGF0aW9uSWQgPyBpbnRlcnBvbGF0b3JIYXNoTWFwW2ludGVycG9sYXRpb25JZF0gOiBkZWZhdWx0SW50ZXJwb2xhdG9yO1xuICAgICAgICAgIGlmICh0YWJsZSAmJiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGFibGUsIHRyYW5zbGF0aW9uSWQpKSB7XG4gICAgICAgICAgICB2YXIgdHJhbnNsYXRpb24gPSB0YWJsZVt0cmFuc2xhdGlvbklkXTtcbiAgICAgICAgICAgIGlmICh0cmFuc2xhdGlvbi5zdWJzdHIoMCwgMikgPT09ICdAOicpIHtcbiAgICAgICAgICAgICAgJHRyYW5zbGF0ZSh0cmFuc2xhdGlvbi5zdWJzdHIoMiksIGludGVycG9sYXRlUGFyYW1zLCBpbnRlcnBvbGF0aW9uSWQpLnRoZW4oZGVmZXJyZWQucmVzb2x2ZSwgZGVmZXJyZWQucmVqZWN0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoSW50ZXJwb2xhdG9yLmludGVycG9sYXRlKHRyYW5zbGF0aW9uLCBpbnRlcnBvbGF0ZVBhcmFtcykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgbWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlclRyYW5zbGF0aW9uO1xuICAgICAgICAgICAgaWYgKCRtaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyRmFjdG9yeSAmJiAhcGVuZGluZ0xvYWRlcikge1xuICAgICAgICAgICAgICBtaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyVHJhbnNsYXRpb24gPSB0cmFuc2xhdGVCeUhhbmRsZXIodHJhbnNsYXRpb25JZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoJHVzZXMgJiYgJGZhbGxiYWNrTGFuZ3VhZ2UgJiYgJGZhbGxiYWNrTGFuZ3VhZ2UubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGZhbGxiYWNrVHJhbnNsYXRpb24odHJhbnNsYXRpb25JZCwgaW50ZXJwb2xhdGVQYXJhbXMsIEludGVycG9sYXRvcikudGhlbihmdW5jdGlvbiAodHJhbnNsYXRpb24pIHtcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHRyYW5zbGF0aW9uKTtcbiAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKF90cmFuc2xhdGlvbklkKSB7XG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGFwcGx5Tm90Rm91bmRJbmRpY2F0b3JzKF90cmFuc2xhdGlvbklkKSk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmICgkbWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlckZhY3RvcnkgJiYgIXBlbmRpbmdMb2FkZXIgJiYgbWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlclRyYW5zbGF0aW9uKSB7XG4gICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUobWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlclRyYW5zbGF0aW9uKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChhcHBseU5vdEZvdW5kSW5kaWNhdG9ycyh0cmFuc2xhdGlvbklkKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgZGV0ZXJtaW5lVHJhbnNsYXRpb25JbnN0YW50ID0gZnVuY3Rpb24gKHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zLCBpbnRlcnBvbGF0aW9uSWQpIHtcbiAgICAgICAgICB2YXIgcmVzdWx0LCB0YWJsZSA9ICR1c2VzID8gJHRyYW5zbGF0aW9uVGFibGVbJHVzZXNdIDogJHRyYW5zbGF0aW9uVGFibGUsIEludGVycG9sYXRvciA9IGludGVycG9sYXRpb25JZCA/IGludGVycG9sYXRvckhhc2hNYXBbaW50ZXJwb2xhdGlvbklkXSA6IGRlZmF1bHRJbnRlcnBvbGF0b3I7XG4gICAgICAgICAgaWYgKHRhYmxlICYmIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0YWJsZSwgdHJhbnNsYXRpb25JZCkpIHtcbiAgICAgICAgICAgIHZhciB0cmFuc2xhdGlvbiA9IHRhYmxlW3RyYW5zbGF0aW9uSWRdO1xuICAgICAgICAgICAgaWYgKHRyYW5zbGF0aW9uLnN1YnN0cigwLCAyKSA9PT0gJ0A6Jykge1xuICAgICAgICAgICAgICByZXN1bHQgPSBkZXRlcm1pbmVUcmFuc2xhdGlvbkluc3RhbnQodHJhbnNsYXRpb24uc3Vic3RyKDIpLCBpbnRlcnBvbGF0ZVBhcmFtcywgaW50ZXJwb2xhdGlvbklkKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJlc3VsdCA9IEludGVycG9sYXRvci5pbnRlcnBvbGF0ZSh0cmFuc2xhdGlvbiwgaW50ZXJwb2xhdGVQYXJhbXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgbWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlclRyYW5zbGF0aW9uO1xuICAgICAgICAgICAgaWYgKCRtaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyRmFjdG9yeSAmJiAhcGVuZGluZ0xvYWRlcikge1xuICAgICAgICAgICAgICBtaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyVHJhbnNsYXRpb24gPSB0cmFuc2xhdGVCeUhhbmRsZXIodHJhbnNsYXRpb25JZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoJHVzZXMgJiYgJGZhbGxiYWNrTGFuZ3VhZ2UgJiYgJGZhbGxiYWNrTGFuZ3VhZ2UubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGZhbGxiYWNrSW5kZXggPSAwO1xuICAgICAgICAgICAgICByZXN1bHQgPSBmYWxsYmFja1RyYW5zbGF0aW9uSW5zdGFudCh0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgSW50ZXJwb2xhdG9yKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoJG1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXJGYWN0b3J5ICYmICFwZW5kaW5nTG9hZGVyICYmIG1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXJUcmFuc2xhdGlvbikge1xuICAgICAgICAgICAgICByZXN1bHQgPSBtaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyVHJhbnNsYXRpb247XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXN1bHQgPSBhcHBseU5vdEZvdW5kSW5kaWNhdG9ycyh0cmFuc2xhdGlvbklkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICAgICAgJHRyYW5zbGF0ZS5wcmVmZXJyZWRMYW5ndWFnZSA9IGZ1bmN0aW9uIChsYW5nS2V5KSB7XG4gICAgICAgICAgaWYgKGxhbmdLZXkpIHtcbiAgICAgICAgICAgIHNldHVwUHJlZmVycmVkTGFuZ3VhZ2UobGFuZ0tleSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiAkcHJlZmVycmVkTGFuZ3VhZ2U7XG4gICAgICAgIH07XG4gICAgICAgICR0cmFuc2xhdGUuY2xvYWtDbGFzc05hbWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuICRjbG9ha0NsYXNzTmFtZTtcbiAgICAgICAgfTtcbiAgICAgICAgJHRyYW5zbGF0ZS5mYWxsYmFja0xhbmd1YWdlID0gZnVuY3Rpb24gKGxhbmdLZXkpIHtcbiAgICAgICAgICBpZiAobGFuZ0tleSAhPT0gdW5kZWZpbmVkICYmIGxhbmdLZXkgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGZhbGxiYWNrU3RhY2sobGFuZ0tleSk7XG4gICAgICAgICAgICBpZiAoJGxvYWRlckZhY3RvcnkpIHtcbiAgICAgICAgICAgICAgaWYgKCRmYWxsYmFja0xhbmd1YWdlICYmICRmYWxsYmFja0xhbmd1YWdlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSAkZmFsbGJhY2tMYW5ndWFnZS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgICAgaWYgKCFsYW5nUHJvbWlzZXNbJGZhbGxiYWNrTGFuZ3VhZ2VbaV1dKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhbmdQcm9taXNlc1skZmFsbGJhY2tMYW5ndWFnZVtpXV0gPSBsb2FkQXN5bmMoJGZhbGxiYWNrTGFuZ3VhZ2VbaV0pO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgJHRyYW5zbGF0ZS51c2UoJHRyYW5zbGF0ZS51c2UoKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICgkZmFsbGJhY2tXYXNTdHJpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiAkZmFsbGJhY2tMYW5ndWFnZVswXTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuICRmYWxsYmFja0xhbmd1YWdlO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgJHRyYW5zbGF0ZS51c2VGYWxsYmFja0xhbmd1YWdlID0gZnVuY3Rpb24gKGxhbmdLZXkpIHtcbiAgICAgICAgICBpZiAobGFuZ0tleSAhPT0gdW5kZWZpbmVkICYmIGxhbmdLZXkgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGlmICghbGFuZ0tleSkge1xuICAgICAgICAgICAgICBzdGFydEZhbGxiYWNrSXRlcmF0aW9uID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHZhciBsYW5nS2V5UG9zaXRpb24gPSBpbmRleE9mKCRmYWxsYmFja0xhbmd1YWdlLCBsYW5nS2V5KTtcbiAgICAgICAgICAgICAgaWYgKGxhbmdLZXlQb3NpdGlvbiA+IC0xKSB7XG4gICAgICAgICAgICAgICAgc3RhcnRGYWxsYmFja0l0ZXJhdGlvbiA9IGxhbmdLZXlQb3NpdGlvbjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgJHRyYW5zbGF0ZS5wcm9wb3NlZExhbmd1YWdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiAkbmV4dExhbmc7XG4gICAgICAgIH07XG4gICAgICAgICR0cmFuc2xhdGUuc3RvcmFnZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gU3RvcmFnZTtcbiAgICAgICAgfTtcbiAgICAgICAgJHRyYW5zbGF0ZS51c2UgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICAgIHJldHVybiAkdXNlcztcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAkcm9vdFNjb3BlLiRlbWl0KCckdHJhbnNsYXRlQ2hhbmdlU3RhcnQnLCB7IGxhbmd1YWdlOiBrZXkgfSk7XG4gICAgICAgICAgdmFyIGFsaWFzZWRLZXkgPSBuZWdvdGlhdGVMb2NhbGUoa2V5KTtcbiAgICAgICAgICBpZiAoYWxpYXNlZEtleSkge1xuICAgICAgICAgICAga2V5ID0gYWxpYXNlZEtleTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCEkdHJhbnNsYXRpb25UYWJsZVtrZXldICYmICRsb2FkZXJGYWN0b3J5ICYmICFsYW5nUHJvbWlzZXNba2V5XSkge1xuICAgICAgICAgICAgJG5leHRMYW5nID0ga2V5O1xuICAgICAgICAgICAgbGFuZ1Byb21pc2VzW2tleV0gPSBsb2FkQXN5bmMoa2V5KS50aGVuKGZ1bmN0aW9uICh0cmFuc2xhdGlvbikge1xuICAgICAgICAgICAgICB0cmFuc2xhdGlvbnModHJhbnNsYXRpb24ua2V5LCB0cmFuc2xhdGlvbi50YWJsZSk7XG4gICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUodHJhbnNsYXRpb24ua2V5KTtcbiAgICAgICAgICAgICAgdXNlTGFuZ3VhZ2UodHJhbnNsYXRpb24ua2V5KTtcbiAgICAgICAgICAgICAgaWYgKCRuZXh0TGFuZyA9PT0ga2V5KSB7XG4gICAgICAgICAgICAgICAgJG5leHRMYW5nID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICAgIGlmICgkbmV4dExhbmcgPT09IGtleSkge1xuICAgICAgICAgICAgICAgICRuZXh0TGFuZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRlbWl0KCckdHJhbnNsYXRlQ2hhbmdlRXJyb3InLCB7IGxhbmd1YWdlOiBrZXkgfSk7XG4gICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChrZXkpO1xuICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRlbWl0KCckdHJhbnNsYXRlQ2hhbmdlRW5kJywgeyBsYW5ndWFnZToga2V5IH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoa2V5KTtcbiAgICAgICAgICAgIHVzZUxhbmd1YWdlKGtleSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuICAgICAgICAkdHJhbnNsYXRlLnN0b3JhZ2VLZXkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIHN0b3JhZ2VLZXkoKTtcbiAgICAgICAgfTtcbiAgICAgICAgJHRyYW5zbGF0ZS5pc1Bvc3RDb21waWxpbmdFbmFibGVkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiAkcG9zdENvbXBpbGluZ0VuYWJsZWQ7XG4gICAgICAgIH07XG4gICAgICAgICR0cmFuc2xhdGUucmVmcmVzaCA9IGZ1bmN0aW9uIChsYW5nS2V5KSB7XG4gICAgICAgICAgaWYgKCEkbG9hZGVyRmFjdG9yeSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZG5cXCd0IHJlZnJlc2ggdHJhbnNsYXRpb24gdGFibGUsIG5vIGxvYWRlciByZWdpc3RlcmVkIScpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgIGZ1bmN0aW9uIHJlc29sdmUoKSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRlbWl0KCckdHJhbnNsYXRlUmVmcmVzaEVuZCcsIHsgbGFuZ3VhZ2U6IGxhbmdLZXkgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGZ1bmN0aW9uIHJlamVjdCgpIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kZW1pdCgnJHRyYW5zbGF0ZVJlZnJlc2hFbmQnLCB7IGxhbmd1YWdlOiBsYW5nS2V5IH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICAkcm9vdFNjb3BlLiRlbWl0KCckdHJhbnNsYXRlUmVmcmVzaFN0YXJ0JywgeyBsYW5ndWFnZTogbGFuZ0tleSB9KTtcbiAgICAgICAgICBpZiAoIWxhbmdLZXkpIHtcbiAgICAgICAgICAgIHZhciB0YWJsZXMgPSBbXSwgbG9hZGluZ0tleXMgPSB7fTtcbiAgICAgICAgICAgIGlmICgkZmFsbGJhY2tMYW5ndWFnZSAmJiAkZmFsbGJhY2tMYW5ndWFnZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9ICRmYWxsYmFja0xhbmd1YWdlLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGFibGVzLnB1c2gobG9hZEFzeW5jKCRmYWxsYmFja0xhbmd1YWdlW2ldKSk7XG4gICAgICAgICAgICAgICAgbG9hZGluZ0tleXNbJGZhbGxiYWNrTGFuZ3VhZ2VbaV1dID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCR1c2VzICYmICFsb2FkaW5nS2V5c1skdXNlc10pIHtcbiAgICAgICAgICAgICAgdGFibGVzLnB1c2gobG9hZEFzeW5jKCR1c2VzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAkcS5hbGwodGFibGVzKS50aGVuKGZ1bmN0aW9uICh0YWJsZURhdGEpIHtcbiAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRhYmxlRGF0YSwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoJHRyYW5zbGF0aW9uVGFibGVbZGF0YS5rZXldKSB7XG4gICAgICAgICAgICAgICAgICBkZWxldGUgJHRyYW5zbGF0aW9uVGFibGVbZGF0YS5rZXldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0cmFuc2xhdGlvbnMoZGF0YS5rZXksIGRhdGEudGFibGUpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgaWYgKCR1c2VzKSB7XG4gICAgICAgICAgICAgICAgdXNlTGFuZ3VhZ2UoJHVzZXMpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSBpZiAoJHRyYW5zbGF0aW9uVGFibGVbbGFuZ0tleV0pIHtcbiAgICAgICAgICAgIGxvYWRBc3luYyhsYW5nS2V5KS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgIHRyYW5zbGF0aW9ucyhkYXRhLmtleSwgZGF0YS50YWJsZSk7XG4gICAgICAgICAgICAgIGlmIChsYW5nS2V5ID09PSAkdXNlcykge1xuICAgICAgICAgICAgICAgIHVzZUxhbmd1YWdlKCR1c2VzKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9LCByZWplY3QpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG4gICAgICAgICR0cmFuc2xhdGUuaW5zdGFudCA9IGZ1bmN0aW9uICh0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgaW50ZXJwb2xhdGlvbklkKSB7XG4gICAgICAgICAgaWYgKHRyYW5zbGF0aW9uSWQgPT09IG51bGwgfHwgYW5ndWxhci5pc1VuZGVmaW5lZCh0cmFuc2xhdGlvbklkKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRyYW5zbGF0aW9uSWQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChhbmd1bGFyLmlzQXJyYXkodHJhbnNsYXRpb25JZCkpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHRzID0ge307XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgYyA9IHRyYW5zbGF0aW9uSWQubGVuZ3RoOyBpIDwgYzsgaSsrKSB7XG4gICAgICAgICAgICAgIHJlc3VsdHNbdHJhbnNsYXRpb25JZFtpXV0gPSAkdHJhbnNsYXRlLmluc3RhbnQodHJhbnNsYXRpb25JZFtpXSwgaW50ZXJwb2xhdGVQYXJhbXMsIGludGVycG9sYXRpb25JZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGFuZ3VsYXIuaXNTdHJpbmcodHJhbnNsYXRpb25JZCkgJiYgdHJhbnNsYXRpb25JZC5sZW5ndGggPCAxKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJhbnNsYXRpb25JZDtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHRyYW5zbGF0aW9uSWQpIHtcbiAgICAgICAgICAgIHRyYW5zbGF0aW9uSWQgPSB0cmltLmFwcGx5KHRyYW5zbGF0aW9uSWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgcmVzdWx0LCBwb3NzaWJsZUxhbmdLZXlzID0gW107XG4gICAgICAgICAgaWYgKCRwcmVmZXJyZWRMYW5ndWFnZSkge1xuICAgICAgICAgICAgcG9zc2libGVMYW5nS2V5cy5wdXNoKCRwcmVmZXJyZWRMYW5ndWFnZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICgkdXNlcykge1xuICAgICAgICAgICAgcG9zc2libGVMYW5nS2V5cy5wdXNoKCR1c2VzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCRmYWxsYmFja0xhbmd1YWdlICYmICRmYWxsYmFja0xhbmd1YWdlLmxlbmd0aCkge1xuICAgICAgICAgICAgcG9zc2libGVMYW5nS2V5cyA9IHBvc3NpYmxlTGFuZ0tleXMuY29uY2F0KCRmYWxsYmFja0xhbmd1YWdlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZm9yICh2YXIgaiA9IDAsIGQgPSBwb3NzaWJsZUxhbmdLZXlzLmxlbmd0aDsgaiA8IGQ7IGorKykge1xuICAgICAgICAgICAgdmFyIHBvc3NpYmxlTGFuZ0tleSA9IHBvc3NpYmxlTGFuZ0tleXNbal07XG4gICAgICAgICAgICBpZiAoJHRyYW5zbGF0aW9uVGFibGVbcG9zc2libGVMYW5nS2V5XSkge1xuICAgICAgICAgICAgICBpZiAodHlwZW9mICR0cmFuc2xhdGlvblRhYmxlW3Bvc3NpYmxlTGFuZ0tleV1bdHJhbnNsYXRpb25JZF0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gZGV0ZXJtaW5lVHJhbnNsYXRpb25JbnN0YW50KHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zLCBpbnRlcnBvbGF0aW9uSWQpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIHJlc3VsdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghcmVzdWx0ICYmIHJlc3VsdCAhPT0gJycpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IGRlZmF1bHRJbnRlcnBvbGF0b3IuaW50ZXJwb2xhdGUodHJhbnNsYXRpb25JZCwgaW50ZXJwb2xhdGVQYXJhbXMpO1xuICAgICAgICAgICAgaWYgKCRtaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyRmFjdG9yeSAmJiAhcGVuZGluZ0xvYWRlcikge1xuICAgICAgICAgICAgICByZXN1bHQgPSB0cmFuc2xhdGVCeUhhbmRsZXIodHJhbnNsYXRpb25JZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgICAgICR0cmFuc2xhdGUudmVyc2lvbkluZm8gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIHZlcnNpb247XG4gICAgICAgIH07XG4gICAgICAgICR0cmFuc2xhdGUubG9hZGVyQ2FjaGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIGxvYWRlckNhY2hlO1xuICAgICAgICB9O1xuICAgICAgICBpZiAoJGxvYWRlckZhY3RvcnkpIHtcbiAgICAgICAgICBpZiAoYW5ndWxhci5lcXVhbHMoJHRyYW5zbGF0aW9uVGFibGUsIHt9KSkge1xuICAgICAgICAgICAgJHRyYW5zbGF0ZS51c2UoJHRyYW5zbGF0ZS51c2UoKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICgkZmFsbGJhY2tMYW5ndWFnZSAmJiAkZmFsbGJhY2tMYW5ndWFnZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhciBwcm9jZXNzQXN5bmNSZXN1bHQgPSBmdW5jdGlvbiAodHJhbnNsYXRpb24pIHtcbiAgICAgICAgICAgICAgdHJhbnNsYXRpb25zKHRyYW5zbGF0aW9uLmtleSwgdHJhbnNsYXRpb24udGFibGUpO1xuICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRlbWl0KCckdHJhbnNsYXRlQ2hhbmdlRW5kJywgeyBsYW5ndWFnZTogdHJhbnNsYXRpb24ua2V5IH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSAkZmFsbGJhY2tMYW5ndWFnZS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICBsYW5nUHJvbWlzZXNbJGZhbGxiYWNrTGFuZ3VhZ2VbaV1dID0gbG9hZEFzeW5jKCRmYWxsYmFja0xhbmd1YWdlW2ldKS50aGVuKHByb2Nlc3NBc3luY1Jlc3VsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiAkdHJhbnNsYXRlO1xuICAgICAgfVxuICAgIF07XG4gIH1cbl0pO1xuYW5ndWxhci5tb2R1bGUoJ3Bhc2NhbHByZWNodC50cmFuc2xhdGUnKS5mYWN0b3J5KCckdHJhbnNsYXRlRGVmYXVsdEludGVycG9sYXRpb24nLCBbXG4gICckaW50ZXJwb2xhdGUnLFxuICBmdW5jdGlvbiAoJGludGVycG9sYXRlKSB7XG4gICAgdmFyICR0cmFuc2xhdGVJbnRlcnBvbGF0b3IgPSB7fSwgJGxvY2FsZSwgJGlkZW50aWZpZXIgPSAnZGVmYXVsdCcsICRzYW5pdGl6ZVZhbHVlU3RyYXRlZ3kgPSBudWxsLCBzYW5pdGl6ZVZhbHVlU3RyYXRlZ2llcyA9IHtcbiAgICAgICAgZXNjYXBlZDogZnVuY3Rpb24gKHBhcmFtcykge1xuICAgICAgICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gcGFyYW1zKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHBhcmFtcywga2V5KSkge1xuICAgICAgICAgICAgICByZXN1bHRba2V5XSA9IGFuZ3VsYXIuZWxlbWVudCgnPGRpdj48L2Rpdj4nKS50ZXh0KHBhcmFtc1trZXldKS5odG1sKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgdmFyIHNhbml0aXplUGFyYW1zID0gZnVuY3Rpb24gKHBhcmFtcykge1xuICAgICAgdmFyIHJlc3VsdDtcbiAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24oc2FuaXRpemVWYWx1ZVN0cmF0ZWdpZXNbJHNhbml0aXplVmFsdWVTdHJhdGVneV0pKSB7XG4gICAgICAgIHJlc3VsdCA9IHNhbml0aXplVmFsdWVTdHJhdGVnaWVzWyRzYW5pdGl6ZVZhbHVlU3RyYXRlZ3ldKHBhcmFtcyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQgPSBwYXJhbXM7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gICAgJHRyYW5zbGF0ZUludGVycG9sYXRvci5zZXRMb2NhbGUgPSBmdW5jdGlvbiAobG9jYWxlKSB7XG4gICAgICAkbG9jYWxlID0gbG9jYWxlO1xuICAgIH07XG4gICAgJHRyYW5zbGF0ZUludGVycG9sYXRvci5nZXRJbnRlcnBvbGF0aW9uSWRlbnRpZmllciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiAkaWRlbnRpZmllcjtcbiAgICB9O1xuICAgICR0cmFuc2xhdGVJbnRlcnBvbGF0b3IudXNlU2FuaXRpemVWYWx1ZVN0cmF0ZWd5ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAkc2FuaXRpemVWYWx1ZVN0cmF0ZWd5ID0gdmFsdWU7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgICR0cmFuc2xhdGVJbnRlcnBvbGF0b3IuaW50ZXJwb2xhdGUgPSBmdW5jdGlvbiAoc3RyaW5nLCBpbnRlcnBvbGF0ZVBhcmFtcykge1xuICAgICAgaWYgKCRzYW5pdGl6ZVZhbHVlU3RyYXRlZ3kpIHtcbiAgICAgICAgaW50ZXJwb2xhdGVQYXJhbXMgPSBzYW5pdGl6ZVBhcmFtcyhpbnRlcnBvbGF0ZVBhcmFtcyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gJGludGVycG9sYXRlKHN0cmluZykoaW50ZXJwb2xhdGVQYXJhbXMgfHwge30pO1xuICAgIH07XG4gICAgcmV0dXJuICR0cmFuc2xhdGVJbnRlcnBvbGF0b3I7XG4gIH1cbl0pO1xuYW5ndWxhci5tb2R1bGUoJ3Bhc2NhbHByZWNodC50cmFuc2xhdGUnKS5jb25zdGFudCgnJFNUT1JBR0VfS0VZJywgJ05HX1RSQU5TTEFURV9MQU5HX0tFWScpO1xuYW5ndWxhci5tb2R1bGUoJ3Bhc2NhbHByZWNodC50cmFuc2xhdGUnKS5kaXJlY3RpdmUoJ3RyYW5zbGF0ZScsIFtcbiAgJyR0cmFuc2xhdGUnLFxuICAnJHEnLFxuICAnJGludGVycG9sYXRlJyxcbiAgJyRjb21waWxlJyxcbiAgJyRwYXJzZScsXG4gICckcm9vdFNjb3BlJyxcbiAgZnVuY3Rpb24gKCR0cmFuc2xhdGUsICRxLCAkaW50ZXJwb2xhdGUsICRjb21waWxlLCAkcGFyc2UsICRyb290U2NvcGUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdBRScsXG4gICAgICBzY29wZTogdHJ1ZSxcbiAgICAgIGNvbXBpbGU6IGZ1bmN0aW9uICh0RWxlbWVudCwgdEF0dHIpIHtcbiAgICAgICAgdmFyIHRyYW5zbGF0ZVZhbHVlc0V4aXN0ID0gdEF0dHIudHJhbnNsYXRlVmFsdWVzID8gdEF0dHIudHJhbnNsYXRlVmFsdWVzIDogdW5kZWZpbmVkO1xuICAgICAgICB2YXIgdHJhbnNsYXRlSW50ZXJwb2xhdGlvbiA9IHRBdHRyLnRyYW5zbGF0ZUludGVycG9sYXRpb24gPyB0QXR0ci50cmFuc2xhdGVJbnRlcnBvbGF0aW9uIDogdW5kZWZpbmVkO1xuICAgICAgICB2YXIgdHJhbnNsYXRlVmFsdWVFeGlzdCA9IHRFbGVtZW50WzBdLm91dGVySFRNTC5tYXRjaCgvdHJhbnNsYXRlLXZhbHVlLSsvaSk7XG4gICAgICAgIHZhciBpbnRlcnBvbGF0ZVJlZ0V4cCA9ICdeKC4qKSgnICsgJGludGVycG9sYXRlLnN0YXJ0U3ltYm9sKCkgKyAnLionICsgJGludGVycG9sYXRlLmVuZFN5bWJvbCgpICsgJykoLiopJztcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIGxpbmtGbihzY29wZSwgaUVsZW1lbnQsIGlBdHRyKSB7XG4gICAgICAgICAgc2NvcGUuaW50ZXJwb2xhdGVQYXJhbXMgPSB7fTtcbiAgICAgICAgICBzY29wZS5wcmVUZXh0ID0gJyc7XG4gICAgICAgICAgc2NvcGUucG9zdFRleHQgPSAnJztcbiAgICAgICAgICBpQXR0ci4kb2JzZXJ2ZSgndHJhbnNsYXRlJywgZnVuY3Rpb24gKHRyYW5zbGF0aW9uSWQpIHtcbiAgICAgICAgICAgIGlmIChhbmd1bGFyLmVxdWFscyh0cmFuc2xhdGlvbklkLCAnJykgfHwgIWFuZ3VsYXIuaXNEZWZpbmVkKHRyYW5zbGF0aW9uSWQpKSB7XG4gICAgICAgICAgICAgIHZhciBpbnRlcnBvbGF0ZU1hdGNoZXMgPSBpRWxlbWVudC50ZXh0KCkubWF0Y2goaW50ZXJwb2xhdGVSZWdFeHApO1xuICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc0FycmF5KGludGVycG9sYXRlTWF0Y2hlcykpIHtcbiAgICAgICAgICAgICAgICBzY29wZS5wcmVUZXh0ID0gaW50ZXJwb2xhdGVNYXRjaGVzWzFdO1xuICAgICAgICAgICAgICAgIHNjb3BlLnBvc3RUZXh0ID0gaW50ZXJwb2xhdGVNYXRjaGVzWzNdO1xuICAgICAgICAgICAgICAgIHNjb3BlLnRyYW5zbGF0aW9uSWQgPSAkaW50ZXJwb2xhdGUoaW50ZXJwb2xhdGVNYXRjaGVzWzJdKShzY29wZS4kcGFyZW50KTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzY29wZS50cmFuc2xhdGlvbklkID0gaUVsZW1lbnQudGV4dCgpLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgc2NvcGUudHJhbnNsYXRpb25JZCA9IHRyYW5zbGF0aW9uSWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaUF0dHIuJG9ic2VydmUoJ3RyYW5zbGF0ZURlZmF1bHQnLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHNjb3BlLmRlZmF1bHRUZXh0ID0gdmFsdWU7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWYgKHRyYW5zbGF0ZVZhbHVlc0V4aXN0KSB7XG4gICAgICAgICAgICBpQXR0ci4kb2JzZXJ2ZSgndHJhbnNsYXRlVmFsdWVzJywgZnVuY3Rpb24gKGludGVycG9sYXRlUGFyYW1zKSB7XG4gICAgICAgICAgICAgIGlmIChpbnRlcnBvbGF0ZVBhcmFtcykge1xuICAgICAgICAgICAgICAgIHNjb3BlLiRwYXJlbnQuJHdhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHNjb3BlLmludGVycG9sYXRlUGFyYW1zLCAkcGFyc2UoaW50ZXJwb2xhdGVQYXJhbXMpKHNjb3BlLiRwYXJlbnQpKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0cmFuc2xhdGVWYWx1ZUV4aXN0KSB7XG4gICAgICAgICAgICB2YXIgZm4gPSBmdW5jdGlvbiAoYXR0ck5hbWUpIHtcbiAgICAgICAgICAgICAgaUF0dHIuJG9ic2VydmUoYXR0ck5hbWUsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHNjb3BlLmludGVycG9sYXRlUGFyYW1zW2FuZ3VsYXIubG93ZXJjYXNlKGF0dHJOYW1lLnN1YnN0cigxNCwgMSkpICsgYXR0ck5hbWUuc3Vic3RyKDE1KV0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgZm9yICh2YXIgYXR0ciBpbiBpQXR0cikge1xuICAgICAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGlBdHRyLCBhdHRyKSAmJiBhdHRyLnN1YnN0cigwLCAxNCkgPT09ICd0cmFuc2xhdGVWYWx1ZScgJiYgYXR0ciAhPT0gJ3RyYW5zbGF0ZVZhbHVlcycpIHtcbiAgICAgICAgICAgICAgICBmbihhdHRyKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgYXBwbHlFbGVtZW50Q29udGVudCA9IGZ1bmN0aW9uICh2YWx1ZSwgc2NvcGUsIHN1Y2Nlc3NmdWwpIHtcbiAgICAgICAgICAgIGlmICghc3VjY2Vzc2Z1bCAmJiB0eXBlb2Ygc2NvcGUuZGVmYXVsdFRleHQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgIHZhbHVlID0gc2NvcGUuZGVmYXVsdFRleHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpRWxlbWVudC5odG1sKHNjb3BlLnByZVRleHQgKyB2YWx1ZSArIHNjb3BlLnBvc3RUZXh0KTtcbiAgICAgICAgICAgIHZhciBnbG9iYWxseUVuYWJsZWQgPSAkdHJhbnNsYXRlLmlzUG9zdENvbXBpbGluZ0VuYWJsZWQoKTtcbiAgICAgICAgICAgIHZhciBsb2NhbGx5RGVmaW5lZCA9IHR5cGVvZiB0QXR0ci50cmFuc2xhdGVDb21waWxlICE9PSAndW5kZWZpbmVkJztcbiAgICAgICAgICAgIHZhciBsb2NhbGx5RW5hYmxlZCA9IGxvY2FsbHlEZWZpbmVkICYmIHRBdHRyLnRyYW5zbGF0ZUNvbXBpbGUgIT09ICdmYWxzZSc7XG4gICAgICAgICAgICBpZiAoZ2xvYmFsbHlFbmFibGVkICYmICFsb2NhbGx5RGVmaW5lZCB8fCBsb2NhbGx5RW5hYmxlZCkge1xuICAgICAgICAgICAgICAkY29tcGlsZShpRWxlbWVudC5jb250ZW50cygpKShzY29wZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgICB2YXIgdXBkYXRlVHJhbnNsYXRpb25GbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgaWYgKCF0cmFuc2xhdGVWYWx1ZXNFeGlzdCAmJiAhdHJhbnNsYXRlVmFsdWVFeGlzdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICB2YXIgdW53YXRjaCA9IHNjb3BlLiR3YXRjaCgndHJhbnNsYXRpb25JZCcsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChzY29wZS50cmFuc2xhdGlvbklkICYmIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkdHJhbnNsYXRlKHZhbHVlLCB7fSwgdHJhbnNsYXRlSW50ZXJwb2xhdGlvbikudGhlbihmdW5jdGlvbiAodHJhbnNsYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwbHlFbGVtZW50Q29udGVudCh0cmFuc2xhdGlvbiwgc2NvcGUsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICB1bndhdGNoKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAodHJhbnNsYXRpb25JZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBseUVsZW1lbnRDb250ZW50KHRyYW5zbGF0aW9uSWQsIHNjb3BlLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHVud2F0Y2goKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgdmFyIHVwZGF0ZVRyYW5zbGF0aW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNjb3BlLnRyYW5zbGF0aW9uSWQgJiYgc2NvcGUuaW50ZXJwb2xhdGVQYXJhbXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAkdHJhbnNsYXRlKHNjb3BlLnRyYW5zbGF0aW9uSWQsIHNjb3BlLmludGVycG9sYXRlUGFyYW1zLCB0cmFuc2xhdGVJbnRlcnBvbGF0aW9uKS50aGVuKGZ1bmN0aW9uICh0cmFuc2xhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBwbHlFbGVtZW50Q29udGVudCh0cmFuc2xhdGlvbiwgc2NvcGUsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uICh0cmFuc2xhdGlvbklkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHBseUVsZW1lbnRDb250ZW50KHRyYW5zbGF0aW9uSWQsIHNjb3BlLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICBzY29wZS4kd2F0Y2goJ2ludGVycG9sYXRlUGFyYW1zJywgdXBkYXRlVHJhbnNsYXRpb25zLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgIHNjb3BlLiR3YXRjaCgndHJhbnNsYXRpb25JZCcsIHVwZGF0ZVRyYW5zbGF0aW9ucyk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSgpO1xuICAgICAgICAgIHZhciB1bmJpbmQgPSAkcm9vdFNjb3BlLiRvbignJHRyYW5zbGF0ZUNoYW5nZVN1Y2Nlc3MnLCB1cGRhdGVUcmFuc2xhdGlvbkZuKTtcbiAgICAgICAgICB1cGRhdGVUcmFuc2xhdGlvbkZuKCk7XG4gICAgICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIHVuYmluZCk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXSk7XG5hbmd1bGFyLm1vZHVsZSgncGFzY2FscHJlY2h0LnRyYW5zbGF0ZScpLmRpcmVjdGl2ZSgndHJhbnNsYXRlQ2xvYWsnLCBbXG4gICckcm9vdFNjb3BlJyxcbiAgJyR0cmFuc2xhdGUnLFxuICBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJHRyYW5zbGF0ZSkge1xuICAgIHJldHVybiB7XG4gICAgICBjb21waWxlOiBmdW5jdGlvbiAodEVsZW1lbnQpIHtcbiAgICAgICAgdmFyIGFwcGx5Q2xvYWsgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0RWxlbWVudC5hZGRDbGFzcygkdHJhbnNsYXRlLmNsb2FrQ2xhc3NOYW1lKCkpO1xuICAgICAgICAgIH0sIHJlbW92ZUNsb2FrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdEVsZW1lbnQucmVtb3ZlQ2xhc3MoJHRyYW5zbGF0ZS5jbG9ha0NsYXNzTmFtZSgpKTtcbiAgICAgICAgICB9LCByZW1vdmVMaXN0ZW5lciA9ICRyb290U2NvcGUuJG9uKCckdHJhbnNsYXRlQ2hhbmdlRW5kJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmVtb3ZlQ2xvYWsoKTtcbiAgICAgICAgICAgIHJlbW92ZUxpc3RlbmVyKCk7XG4gICAgICAgICAgICByZW1vdmVMaXN0ZW5lciA9IG51bGw7XG4gICAgICAgICAgfSk7XG4gICAgICAgIGFwcGx5Q2xvYWsoKTtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIGxpbmtGbihzY29wZSwgaUVsZW1lbnQsIGlBdHRyKSB7XG4gICAgICAgICAgaWYgKGlBdHRyLnRyYW5zbGF0ZUNsb2FrICYmIGlBdHRyLnRyYW5zbGF0ZUNsb2FrLmxlbmd0aCkge1xuICAgICAgICAgICAgaUF0dHIuJG9ic2VydmUoJ3RyYW5zbGF0ZUNsb2FrJywgZnVuY3Rpb24gKHRyYW5zbGF0aW9uSWQpIHtcbiAgICAgICAgICAgICAgJHRyYW5zbGF0ZSh0cmFuc2xhdGlvbklkKS50aGVuKHJlbW92ZUNsb2FrLCBhcHBseUNsb2FrKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5dKTtcbmFuZ3VsYXIubW9kdWxlKCdwYXNjYWxwcmVjaHQudHJhbnNsYXRlJykuZmlsdGVyKCd0cmFuc2xhdGUnLCBbXG4gICckcGFyc2UnLFxuICAnJHRyYW5zbGF0ZScsXG4gIGZ1bmN0aW9uICgkcGFyc2UsICR0cmFuc2xhdGUpIHtcbiAgICB2YXIgdHJhbnNsYXRlRmlsdGVyID0gZnVuY3Rpb24gKHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zLCBpbnRlcnBvbGF0aW9uKSB7XG4gICAgICBpZiAoIWFuZ3VsYXIuaXNPYmplY3QoaW50ZXJwb2xhdGVQYXJhbXMpKSB7XG4gICAgICAgIGludGVycG9sYXRlUGFyYW1zID0gJHBhcnNlKGludGVycG9sYXRlUGFyYW1zKSh0aGlzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAkdHJhbnNsYXRlLmluc3RhbnQodHJhbnNsYXRpb25JZCwgaW50ZXJwb2xhdGVQYXJhbXMsIGludGVycG9sYXRpb24pO1xuICAgIH07XG4gICAgdHJhbnNsYXRlRmlsdGVyLiRzdGF0ZWZ1bCA9IHRydWU7XG4gICAgcmV0dXJuIHRyYW5zbGF0ZUZpbHRlcjtcbiAgfVxuXSk7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9PYmplY3RQYXRoLmpzJykuT2JqZWN0UGF0aDtcbiIsIid1c2Ugc3RyaWN0JztcblxuOyFmdW5jdGlvbih1bmRlZmluZWQpIHtcblxuXHR2YXIgT2JqZWN0UGF0aCA9IHtcblx0XHRwYXJzZTogZnVuY3Rpb24oc3RyKXtcblx0XHRcdGlmKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKXtcblx0XHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignT2JqZWN0UGF0aC5wYXJzZSBtdXN0IGJlIHBhc3NlZCBhIHN0cmluZycpO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgaSA9IDA7XG5cdFx0XHR2YXIgcGFydHMgPSBbXTtcblx0XHRcdHZhciBkLCBiLCBxLCBjO1xuXHRcdFx0d2hpbGUgKGkgPCBzdHIubGVuZ3RoKXtcblx0XHRcdFx0ZCA9IHN0ci5pbmRleE9mKCcuJywgaSk7XG5cdFx0XHRcdGIgPSBzdHIuaW5kZXhPZignWycsIGkpO1xuXG5cdFx0XHRcdC8vIHdlJ3ZlIHJlYWNoZWQgdGhlIGVuZFxuXHRcdFx0XHRpZiAoZCA9PT0gLTEgJiYgYiA9PT0gLTEpe1xuXHRcdFx0XHRcdHBhcnRzLnB1c2goc3RyLnNsaWNlKGksIHN0ci5sZW5ndGgpKTtcblx0XHRcdFx0XHRpID0gc3RyLmxlbmd0aDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIGRvdHNcblx0XHRcdFx0ZWxzZSBpZiAoYiA9PT0gLTEgfHwgKGQgIT09IC0xICYmIGQgPCBiKSkge1xuXHRcdFx0XHRcdHBhcnRzLnB1c2goc3RyLnNsaWNlKGksIGQpKTtcblx0XHRcdFx0XHRpID0gZCArIDE7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBicmFja2V0c1xuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRpZiAoYiA+IGkpe1xuXHRcdFx0XHRcdFx0cGFydHMucHVzaChzdHIuc2xpY2UoaSwgYikpO1xuXHRcdFx0XHRcdFx0aSA9IGI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHEgPSBzdHIuc2xpY2UoYisxLCBiKzIpO1xuXHRcdFx0XHRcdGlmIChxICE9PSAnXCInICYmIHEgIT09J1xcJycpIHtcblx0XHRcdFx0XHRcdGMgPSBzdHIuaW5kZXhPZignXScsIGIpO1xuXHRcdFx0XHRcdFx0aWYgKGMgPT09IC0xKSBjID0gc3RyLmxlbmd0aDtcblx0XHRcdFx0XHRcdHBhcnRzLnB1c2goc3RyLnNsaWNlKGkgKyAxLCBjKSk7XG5cdFx0XHRcdFx0XHRpID0gKHN0ci5zbGljZShjICsgMSwgYyArIDIpID09PSAnLicpID8gYyArIDIgOiBjICsgMTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0YyA9IHN0ci5pbmRleE9mKHErJ10nLCBiKTtcblx0XHRcdFx0XHRcdGlmIChjID09PSAtMSkgYyA9IHN0ci5sZW5ndGg7XG5cdFx0XHRcdFx0XHR3aGlsZSAoc3RyLnNsaWNlKGMgLSAxLCBjKSA9PT0gJ1xcXFwnICYmIGIgPCBzdHIubGVuZ3RoKXtcblx0XHRcdFx0XHRcdFx0YisrO1xuXHRcdFx0XHRcdFx0XHRjID0gc3RyLmluZGV4T2YocSsnXScsIGIpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0cGFydHMucHVzaChzdHIuc2xpY2UoaSArIDIsIGMpLnJlcGxhY2UobmV3IFJlZ0V4cCgnXFxcXCcrcSwnZycpLCBxKSk7XG5cdFx0XHRcdFx0XHRpID0gKHN0ci5zbGljZShjICsgMiwgYyArIDMpID09PSAnLicpID8gYyArIDMgOiBjICsgMjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBwYXJ0cztcblx0XHR9LFxuXG5cdFx0Ly8gcm9vdCA9PT0gdHJ1ZSA6IGF1dG8gY2FsY3VsYXRlIHJvb3Q7IG11c3QgYmUgZG90LW5vdGF0aW9uIGZyaWVuZGx5XG5cdFx0Ly8gcm9vdCBTdHJpbmcgOiB0aGUgc3RyaW5nIHRvIHVzZSBhcyByb290XG5cdFx0c3RyaW5naWZ5OiBmdW5jdGlvbihhcnIsIHF1b3RlKXtcblxuXHRcdFx0aWYoIUFycmF5LmlzQXJyYXkoYXJyKSlcblx0XHRcdFx0YXJyID0gW2Fyci50b1N0cmluZygpXTtcblxuXHRcdFx0cXVvdGUgPSBxdW90ZSA9PT0gJ1wiJyA/ICdcIicgOiAnXFwnJztcblxuXHRcdFx0cmV0dXJuIGFyci5tYXAoZnVuY3Rpb24obil7IHJldHVybiAnWycgKyBxdW90ZSArIChuLnRvU3RyaW5nKCkpLnJlcGxhY2UobmV3IFJlZ0V4cChxdW90ZSwgJ2cnKSwgJ1xcXFwnICsgcXVvdGUpICsgcXVvdGUgKyAnXSc7IH0pLmpvaW4oJycpO1xuXHRcdH0sXG5cblx0XHRub3JtYWxpemU6IGZ1bmN0aW9uKGRhdGEsIHF1b3RlKXtcblx0XHRcdHJldHVybiBPYmplY3RQYXRoLnN0cmluZ2lmeShBcnJheS5pc0FycmF5KGRhdGEpID8gZGF0YSA6IE9iamVjdFBhdGgucGFyc2UoZGF0YSksIHF1b3RlKTtcblx0XHR9XG5cdH07XG5cblx0Ly8gQU1EXG5cdGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcblx0XHRkZWZpbmUoZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gT2JqZWN0UGF0aDtcblx0XHR9KTtcblx0fVxuXG5cdC8vIENvbW1vbkpTXG5cdGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuXHRcdGV4cG9ydHMuT2JqZWN0UGF0aCA9IE9iamVjdFBhdGg7XG5cdH1cblxuXHQvLyBBbmd1bGFyXG5cdGVsc2UgaWYgKHR5cGVvZiBhbmd1bGFyID09PSAnb2JqZWN0Jykge1xuXHRcdGFuZ3VsYXIubW9kdWxlKCdPYmplY3RQYXRoJywgW10pLnByb3ZpZGVyKCdPYmplY3RQYXRoJywgZnVuY3Rpb24oKXtcblx0XHRcdHRoaXMucGFyc2UgPSBPYmplY3RQYXRoLnBhcnNlO1xuXHRcdFx0dGhpcy5zdHJpbmdpZnkgPSBPYmplY3RQYXRoLnN0cmluZ2lmeTtcblx0XHRcdHRoaXMubm9ybWFsaXplID0gT2JqZWN0UGF0aC5ub3JtYWxpemU7XG5cdFx0XHR0aGlzLiRnZXQgPSBmdW5jdGlvbigpe1xuXHRcdFx0XHRyZXR1cm4gT2JqZWN0UGF0aDtcblx0XHRcdH07XG5cdFx0fSk7XG5cdH1cblxuXHQvLyBCcm93c2VyIGdsb2JhbC5cblx0ZWxzZSB7XG5cdFx0d2luZG93Lk9iamVjdFBhdGggPSBPYmplY3RQYXRoO1xuXHR9XG59KCk7IiwiLypcbkF1dGhvcjogR2VyYWludCBMdWZmIGFuZCBvdGhlcnNcblllYXI6IDIwMTNcblxuVGhpcyBjb2RlIGlzIHJlbGVhc2VkIGludG8gdGhlIFwicHVibGljIGRvbWFpblwiIGJ5IGl0cyBhdXRob3IocykuICBBbnlib2R5IG1heSB1c2UsIGFsdGVyIGFuZCBkaXN0cmlidXRlIHRoZSBjb2RlIHdpdGhvdXQgcmVzdHJpY3Rpb24uICBUaGUgYXV0aG9yIG1ha2VzIG5vIGd1YXJhbnRlZXMsIGFuZCB0YWtlcyBubyBsaWFiaWxpdHkgb2YgYW55IGtpbmQgZm9yIHVzZSBvZiB0aGlzIGNvZGUuXG5cbklmIHlvdSBmaW5kIGEgYnVnIG9yIG1ha2UgYW4gaW1wcm92ZW1lbnQsIGl0IHdvdWxkIGJlIGNvdXJ0ZW91cyB0byBsZXQgdGhlIGF1dGhvciBrbm93LCBidXQgaXQgaXMgbm90IGNvbXB1bHNvcnkuXG4qL1xuKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cbiAgICBkZWZpbmUoW10sIGZhY3RvcnkpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKXtcbiAgICAvLyBDb21tb25KUy4gRGVmaW5lIGV4cG9ydC5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBCcm93c2VyIGdsb2JhbHNcbiAgICBnbG9iYWwudHY0ID0gZmFjdG9yeSgpO1xuICB9XG59KHRoaXMsIGZ1bmN0aW9uICgpIHtcblxuLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvT2JqZWN0L2tleXM/cmVkaXJlY3Rsb2NhbGU9ZW4tVVMmcmVkaXJlY3RzbHVnPUphdmFTY3JpcHQlMkZSZWZlcmVuY2UlMkZHbG9iYWxfT2JqZWN0cyUyRk9iamVjdCUyRmtleXNcbmlmICghT2JqZWN0LmtleXMpIHtcblx0T2JqZWN0LmtleXMgPSAoZnVuY3Rpb24gKCkge1xuXHRcdHZhciBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHksXG5cdFx0XHRoYXNEb250RW51bUJ1ZyA9ICEoe3RvU3RyaW5nOiBudWxsfSkucHJvcGVydHlJc0VudW1lcmFibGUoJ3RvU3RyaW5nJyksXG5cdFx0XHRkb250RW51bXMgPSBbXG5cdFx0XHRcdCd0b1N0cmluZycsXG5cdFx0XHRcdCd0b0xvY2FsZVN0cmluZycsXG5cdFx0XHRcdCd2YWx1ZU9mJyxcblx0XHRcdFx0J2hhc093blByb3BlcnR5Jyxcblx0XHRcdFx0J2lzUHJvdG90eXBlT2YnLFxuXHRcdFx0XHQncHJvcGVydHlJc0VudW1lcmFibGUnLFxuXHRcdFx0XHQnY29uc3RydWN0b3InXG5cdFx0XHRdLFxuXHRcdFx0ZG9udEVudW1zTGVuZ3RoID0gZG9udEVudW1zLmxlbmd0aDtcblxuXHRcdHJldHVybiBmdW5jdGlvbiAob2JqKSB7XG5cdFx0XHRpZiAodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcgJiYgdHlwZW9mIG9iaiAhPT0gJ2Z1bmN0aW9uJyB8fCBvYmogPT09IG51bGwpIHtcblx0XHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignT2JqZWN0LmtleXMgY2FsbGVkIG9uIG5vbi1vYmplY3QnKTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHJlc3VsdCA9IFtdO1xuXG5cdFx0XHRmb3IgKHZhciBwcm9wIGluIG9iaikge1xuXHRcdFx0XHRpZiAoaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSB7XG5cdFx0XHRcdFx0cmVzdWx0LnB1c2gocHJvcCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKGhhc0RvbnRFbnVtQnVnKSB7XG5cdFx0XHRcdGZvciAodmFyIGk9MDsgaSA8IGRvbnRFbnVtc0xlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0aWYgKGhhc093blByb3BlcnR5LmNhbGwob2JqLCBkb250RW51bXNbaV0pKSB7XG5cdFx0XHRcdFx0XHRyZXN1bHQucHVzaChkb250RW51bXNbaV0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9O1xuXHR9KSgpO1xufVxuLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvT2JqZWN0L2NyZWF0ZVxuaWYgKCFPYmplY3QuY3JlYXRlKSB7XG5cdE9iamVjdC5jcmVhdGUgPSAoZnVuY3Rpb24oKXtcblx0XHRmdW5jdGlvbiBGKCl7fVxuXG5cdFx0cmV0dXJuIGZ1bmN0aW9uKG8pe1xuXHRcdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggIT09IDEpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdPYmplY3QuY3JlYXRlIGltcGxlbWVudGF0aW9uIG9ubHkgYWNjZXB0cyBvbmUgcGFyYW1ldGVyLicpO1xuXHRcdFx0fVxuXHRcdFx0Ri5wcm90b3R5cGUgPSBvO1xuXHRcdFx0cmV0dXJuIG5ldyBGKCk7XG5cdFx0fTtcblx0fSkoKTtcbn1cbi8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5L2lzQXJyYXk/cmVkaXJlY3Rsb2NhbGU9ZW4tVVMmcmVkaXJlY3RzbHVnPUphdmFTY3JpcHQlMkZSZWZlcmVuY2UlMkZHbG9iYWxfT2JqZWN0cyUyRkFycmF5JTJGaXNBcnJheVxuaWYoIUFycmF5LmlzQXJyYXkpIHtcblx0QXJyYXkuaXNBcnJheSA9IGZ1bmN0aW9uICh2QXJnKSB7XG5cdFx0cmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2QXJnKSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiO1xuXHR9O1xufVxuLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXkvaW5kZXhPZj9yZWRpcmVjdGxvY2FsZT1lbi1VUyZyZWRpcmVjdHNsdWc9SmF2YVNjcmlwdCUyRlJlZmVyZW5jZSUyRkdsb2JhbF9PYmplY3RzJTJGQXJyYXklMkZpbmRleE9mXG5pZiAoIUFycmF5LnByb3RvdHlwZS5pbmRleE9mKSB7XG5cdEFycmF5LnByb3RvdHlwZS5pbmRleE9mID0gZnVuY3Rpb24gKHNlYXJjaEVsZW1lbnQgLyosIGZyb21JbmRleCAqLyApIHtcblx0XHRpZiAodGhpcyA9PT0gbnVsbCkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcigpO1xuXHRcdH1cblx0XHR2YXIgdCA9IE9iamVjdCh0aGlzKTtcblx0XHR2YXIgbGVuID0gdC5sZW5ndGggPj4+IDA7XG5cblx0XHRpZiAobGVuID09PSAwKSB7XG5cdFx0XHRyZXR1cm4gLTE7XG5cdFx0fVxuXHRcdHZhciBuID0gMDtcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcblx0XHRcdG4gPSBOdW1iZXIoYXJndW1lbnRzWzFdKTtcblx0XHRcdGlmIChuICE9PSBuKSB7IC8vIHNob3J0Y3V0IGZvciB2ZXJpZnlpbmcgaWYgaXQncyBOYU5cblx0XHRcdFx0biA9IDA7XG5cdFx0XHR9IGVsc2UgaWYgKG4gIT09IDAgJiYgbiAhPT0gSW5maW5pdHkgJiYgbiAhPT0gLUluZmluaXR5KSB7XG5cdFx0XHRcdG4gPSAobiA+IDAgfHwgLTEpICogTWF0aC5mbG9vcihNYXRoLmFicyhuKSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChuID49IGxlbikge1xuXHRcdFx0cmV0dXJuIC0xO1xuXHRcdH1cblx0XHR2YXIgayA9IG4gPj0gMCA/IG4gOiBNYXRoLm1heChsZW4gLSBNYXRoLmFicyhuKSwgMCk7XG5cdFx0Zm9yICg7IGsgPCBsZW47IGsrKykge1xuXHRcdFx0aWYgKGsgaW4gdCAmJiB0W2tdID09PSBzZWFyY2hFbGVtZW50KSB7XG5cdFx0XHRcdHJldHVybiBrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gLTE7XG5cdH07XG59XG5cbi8vIEdydW5nZXkgT2JqZWN0LmlzRnJvemVuIGhhY2tcbmlmICghT2JqZWN0LmlzRnJvemVuKSB7XG5cdE9iamVjdC5pc0Zyb3plbiA9IGZ1bmN0aW9uIChvYmopIHtcblx0XHR2YXIga2V5ID0gXCJ0djRfdGVzdF9mcm96ZW5fa2V5XCI7XG5cdFx0d2hpbGUgKG9iai5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG5cdFx0XHRrZXkgKz0gTWF0aC5yYW5kb20oKTtcblx0XHR9XG5cdFx0dHJ5IHtcblx0XHRcdG9ialtrZXldID0gdHJ1ZTtcblx0XHRcdGRlbGV0ZSBvYmpba2V5XTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH07XG59XG4vLyBCYXNlZCBvbjogaHR0cHM6Ly9naXRodWIuY29tL2dlcmFpbnRsdWZmL3VyaS10ZW1wbGF0ZXMsIGJ1dCB3aXRoIGFsbCB0aGUgZGUtc3Vic3RpdHV0aW9uIHN0dWZmIHJlbW92ZWRcblxudmFyIHVyaVRlbXBsYXRlR2xvYmFsTW9kaWZpZXJzID0ge1xuXHRcIitcIjogdHJ1ZSxcblx0XCIjXCI6IHRydWUsXG5cdFwiLlwiOiB0cnVlLFxuXHRcIi9cIjogdHJ1ZSxcblx0XCI7XCI6IHRydWUsXG5cdFwiP1wiOiB0cnVlLFxuXHRcIiZcIjogdHJ1ZVxufTtcbnZhciB1cmlUZW1wbGF0ZVN1ZmZpY2VzID0ge1xuXHRcIipcIjogdHJ1ZVxufTtcblxuZnVuY3Rpb24gbm90UmVhbGx5UGVyY2VudEVuY29kZShzdHJpbmcpIHtcblx0cmV0dXJuIGVuY29kZVVSSShzdHJpbmcpLnJlcGxhY2UoLyUyNVswLTldWzAtOV0vZywgZnVuY3Rpb24gKGRvdWJsZUVuY29kZWQpIHtcblx0XHRyZXR1cm4gXCIlXCIgKyBkb3VibGVFbmNvZGVkLnN1YnN0cmluZygzKTtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIHVyaVRlbXBsYXRlU3Vic3RpdHV0aW9uKHNwZWMpIHtcblx0dmFyIG1vZGlmaWVyID0gXCJcIjtcblx0aWYgKHVyaVRlbXBsYXRlR2xvYmFsTW9kaWZpZXJzW3NwZWMuY2hhckF0KDApXSkge1xuXHRcdG1vZGlmaWVyID0gc3BlYy5jaGFyQXQoMCk7XG5cdFx0c3BlYyA9IHNwZWMuc3Vic3RyaW5nKDEpO1xuXHR9XG5cdHZhciBzZXBhcmF0b3IgPSBcIlwiO1xuXHR2YXIgcHJlZml4ID0gXCJcIjtcblx0dmFyIHNob3VsZEVzY2FwZSA9IHRydWU7XG5cdHZhciBzaG93VmFyaWFibGVzID0gZmFsc2U7XG5cdHZhciB0cmltRW1wdHlTdHJpbmcgPSBmYWxzZTtcblx0aWYgKG1vZGlmaWVyID09PSAnKycpIHtcblx0XHRzaG91bGRFc2NhcGUgPSBmYWxzZTtcblx0fSBlbHNlIGlmIChtb2RpZmllciA9PT0gXCIuXCIpIHtcblx0XHRwcmVmaXggPSBcIi5cIjtcblx0XHRzZXBhcmF0b3IgPSBcIi5cIjtcblx0fSBlbHNlIGlmIChtb2RpZmllciA9PT0gXCIvXCIpIHtcblx0XHRwcmVmaXggPSBcIi9cIjtcblx0XHRzZXBhcmF0b3IgPSBcIi9cIjtcblx0fSBlbHNlIGlmIChtb2RpZmllciA9PT0gJyMnKSB7XG5cdFx0cHJlZml4ID0gXCIjXCI7XG5cdFx0c2hvdWxkRXNjYXBlID0gZmFsc2U7XG5cdH0gZWxzZSBpZiAobW9kaWZpZXIgPT09ICc7Jykge1xuXHRcdHByZWZpeCA9IFwiO1wiO1xuXHRcdHNlcGFyYXRvciA9IFwiO1wiO1xuXHRcdHNob3dWYXJpYWJsZXMgPSB0cnVlO1xuXHRcdHRyaW1FbXB0eVN0cmluZyA9IHRydWU7XG5cdH0gZWxzZSBpZiAobW9kaWZpZXIgPT09ICc/Jykge1xuXHRcdHByZWZpeCA9IFwiP1wiO1xuXHRcdHNlcGFyYXRvciA9IFwiJlwiO1xuXHRcdHNob3dWYXJpYWJsZXMgPSB0cnVlO1xuXHR9IGVsc2UgaWYgKG1vZGlmaWVyID09PSAnJicpIHtcblx0XHRwcmVmaXggPSBcIiZcIjtcblx0XHRzZXBhcmF0b3IgPSBcIiZcIjtcblx0XHRzaG93VmFyaWFibGVzID0gdHJ1ZTtcblx0fVxuXG5cdHZhciB2YXJOYW1lcyA9IFtdO1xuXHR2YXIgdmFyTGlzdCA9IHNwZWMuc3BsaXQoXCIsXCIpO1xuXHR2YXIgdmFyU3BlY3MgPSBbXTtcblx0dmFyIHZhclNwZWNNYXAgPSB7fTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCB2YXJMaXN0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIHZhck5hbWUgPSB2YXJMaXN0W2ldO1xuXHRcdHZhciB0cnVuY2F0ZSA9IG51bGw7XG5cdFx0aWYgKHZhck5hbWUuaW5kZXhPZihcIjpcIikgIT09IC0xKSB7XG5cdFx0XHR2YXIgcGFydHMgPSB2YXJOYW1lLnNwbGl0KFwiOlwiKTtcblx0XHRcdHZhck5hbWUgPSBwYXJ0c1swXTtcblx0XHRcdHRydW5jYXRlID0gcGFyc2VJbnQocGFydHNbMV0sIDEwKTtcblx0XHR9XG5cdFx0dmFyIHN1ZmZpY2VzID0ge307XG5cdFx0d2hpbGUgKHVyaVRlbXBsYXRlU3VmZmljZXNbdmFyTmFtZS5jaGFyQXQodmFyTmFtZS5sZW5ndGggLSAxKV0pIHtcblx0XHRcdHN1ZmZpY2VzW3Zhck5hbWUuY2hhckF0KHZhck5hbWUubGVuZ3RoIC0gMSldID0gdHJ1ZTtcblx0XHRcdHZhck5hbWUgPSB2YXJOYW1lLnN1YnN0cmluZygwLCB2YXJOYW1lLmxlbmd0aCAtIDEpO1xuXHRcdH1cblx0XHR2YXIgdmFyU3BlYyA9IHtcblx0XHRcdHRydW5jYXRlOiB0cnVuY2F0ZSxcblx0XHRcdG5hbWU6IHZhck5hbWUsXG5cdFx0XHRzdWZmaWNlczogc3VmZmljZXNcblx0XHR9O1xuXHRcdHZhclNwZWNzLnB1c2godmFyU3BlYyk7XG5cdFx0dmFyU3BlY01hcFt2YXJOYW1lXSA9IHZhclNwZWM7XG5cdFx0dmFyTmFtZXMucHVzaCh2YXJOYW1lKTtcblx0fVxuXHR2YXIgc3ViRnVuY3Rpb24gPSBmdW5jdGlvbiAodmFsdWVGdW5jdGlvbikge1xuXHRcdHZhciByZXN1bHQgPSBcIlwiO1xuXHRcdHZhciBzdGFydEluZGV4ID0gMDtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHZhclNwZWNzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgdmFyU3BlYyA9IHZhclNwZWNzW2ldO1xuXHRcdFx0dmFyIHZhbHVlID0gdmFsdWVGdW5jdGlvbih2YXJTcGVjLm5hbWUpO1xuXHRcdFx0aWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgfHwgKEFycmF5LmlzQXJyYXkodmFsdWUpICYmIHZhbHVlLmxlbmd0aCA9PT0gMCkgfHwgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgT2JqZWN0LmtleXModmFsdWUpLmxlbmd0aCA9PT0gMCkpIHtcblx0XHRcdFx0c3RhcnRJbmRleCsrO1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHRcdGlmIChpID09PSBzdGFydEluZGV4KSB7XG5cdFx0XHRcdHJlc3VsdCArPSBwcmVmaXg7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXN1bHQgKz0gKHNlcGFyYXRvciB8fCBcIixcIik7XG5cdFx0XHR9XG5cdFx0XHRpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcblx0XHRcdFx0aWYgKHNob3dWYXJpYWJsZXMpIHtcblx0XHRcdFx0XHRyZXN1bHQgKz0gdmFyU3BlYy5uYW1lICsgXCI9XCI7XG5cdFx0XHRcdH1cblx0XHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCB2YWx1ZS5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcdGlmIChqID4gMCkge1xuXHRcdFx0XHRcdFx0cmVzdWx0ICs9IHZhclNwZWMuc3VmZmljZXNbJyonXSA/IChzZXBhcmF0b3IgfHwgXCIsXCIpIDogXCIsXCI7XG5cdFx0XHRcdFx0XHRpZiAodmFyU3BlYy5zdWZmaWNlc1snKiddICYmIHNob3dWYXJpYWJsZXMpIHtcblx0XHRcdFx0XHRcdFx0cmVzdWx0ICs9IHZhclNwZWMubmFtZSArIFwiPVwiO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXN1bHQgKz0gc2hvdWxkRXNjYXBlID8gZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlW2pdKS5yZXBsYWNlKC8hL2csIFwiJTIxXCIpIDogbm90UmVhbGx5UGVyY2VudEVuY29kZSh2YWx1ZVtqXSk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRcdGlmIChzaG93VmFyaWFibGVzICYmICF2YXJTcGVjLnN1ZmZpY2VzWycqJ10pIHtcblx0XHRcdFx0XHRyZXN1bHQgKz0gdmFyU3BlYy5uYW1lICsgXCI9XCI7XG5cdFx0XHRcdH1cblx0XHRcdFx0dmFyIGZpcnN0ID0gdHJ1ZTtcblx0XHRcdFx0Zm9yICh2YXIga2V5IGluIHZhbHVlKSB7XG5cdFx0XHRcdFx0aWYgKCFmaXJzdCkge1xuXHRcdFx0XHRcdFx0cmVzdWx0ICs9IHZhclNwZWMuc3VmZmljZXNbJyonXSA/IChzZXBhcmF0b3IgfHwgXCIsXCIpIDogXCIsXCI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGZpcnN0ID0gZmFsc2U7XG5cdFx0XHRcdFx0cmVzdWx0ICs9IHNob3VsZEVzY2FwZSA/IGVuY29kZVVSSUNvbXBvbmVudChrZXkpLnJlcGxhY2UoLyEvZywgXCIlMjFcIikgOiBub3RSZWFsbHlQZXJjZW50RW5jb2RlKGtleSk7XG5cdFx0XHRcdFx0cmVzdWx0ICs9IHZhclNwZWMuc3VmZmljZXNbJyonXSA/ICc9JyA6IFwiLFwiO1xuXHRcdFx0XHRcdHJlc3VsdCArPSBzaG91bGRFc2NhcGUgPyBlbmNvZGVVUklDb21wb25lbnQodmFsdWVba2V5XSkucmVwbGFjZSgvIS9nLCBcIiUyMVwiKSA6IG5vdFJlYWxseVBlcmNlbnRFbmNvZGUodmFsdWVba2V5XSk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmIChzaG93VmFyaWFibGVzKSB7XG5cdFx0XHRcdFx0cmVzdWx0ICs9IHZhclNwZWMubmFtZTtcblx0XHRcdFx0XHRpZiAoIXRyaW1FbXB0eVN0cmluZyB8fCB2YWx1ZSAhPT0gXCJcIikge1xuXHRcdFx0XHRcdFx0cmVzdWx0ICs9IFwiPVwiO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAodmFyU3BlYy50cnVuY2F0ZSAhPSBudWxsKSB7XG5cdFx0XHRcdFx0dmFsdWUgPSB2YWx1ZS5zdWJzdHJpbmcoMCwgdmFyU3BlYy50cnVuY2F0ZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmVzdWx0ICs9IHNob3VsZEVzY2FwZSA/IGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkucmVwbGFjZSgvIS9nLCBcIiUyMVwiKTogbm90UmVhbGx5UGVyY2VudEVuY29kZSh2YWx1ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH07XG5cdHN1YkZ1bmN0aW9uLnZhck5hbWVzID0gdmFyTmFtZXM7XG5cdHJldHVybiB7XG5cdFx0cHJlZml4OiBwcmVmaXgsXG5cdFx0c3Vic3RpdHV0aW9uOiBzdWJGdW5jdGlvblxuXHR9O1xufVxuXG5mdW5jdGlvbiBVcmlUZW1wbGF0ZSh0ZW1wbGF0ZSkge1xuXHRpZiAoISh0aGlzIGluc3RhbmNlb2YgVXJpVGVtcGxhdGUpKSB7XG5cdFx0cmV0dXJuIG5ldyBVcmlUZW1wbGF0ZSh0ZW1wbGF0ZSk7XG5cdH1cblx0dmFyIHBhcnRzID0gdGVtcGxhdGUuc3BsaXQoXCJ7XCIpO1xuXHR2YXIgdGV4dFBhcnRzID0gW3BhcnRzLnNoaWZ0KCldO1xuXHR2YXIgcHJlZml4ZXMgPSBbXTtcblx0dmFyIHN1YnN0aXR1dGlvbnMgPSBbXTtcblx0dmFyIHZhck5hbWVzID0gW107XG5cdHdoaWxlIChwYXJ0cy5sZW5ndGggPiAwKSB7XG5cdFx0dmFyIHBhcnQgPSBwYXJ0cy5zaGlmdCgpO1xuXHRcdHZhciBzcGVjID0gcGFydC5zcGxpdChcIn1cIilbMF07XG5cdFx0dmFyIHJlbWFpbmRlciA9IHBhcnQuc3Vic3RyaW5nKHNwZWMubGVuZ3RoICsgMSk7XG5cdFx0dmFyIGZ1bmNzID0gdXJpVGVtcGxhdGVTdWJzdGl0dXRpb24oc3BlYyk7XG5cdFx0c3Vic3RpdHV0aW9ucy5wdXNoKGZ1bmNzLnN1YnN0aXR1dGlvbik7XG5cdFx0cHJlZml4ZXMucHVzaChmdW5jcy5wcmVmaXgpO1xuXHRcdHRleHRQYXJ0cy5wdXNoKHJlbWFpbmRlcik7XG5cdFx0dmFyTmFtZXMgPSB2YXJOYW1lcy5jb25jYXQoZnVuY3Muc3Vic3RpdHV0aW9uLnZhck5hbWVzKTtcblx0fVxuXHR0aGlzLmZpbGwgPSBmdW5jdGlvbiAodmFsdWVGdW5jdGlvbikge1xuXHRcdHZhciByZXN1bHQgPSB0ZXh0UGFydHNbMF07XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzdWJzdGl0dXRpb25zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgc3Vic3RpdHV0aW9uID0gc3Vic3RpdHV0aW9uc1tpXTtcblx0XHRcdHJlc3VsdCArPSBzdWJzdGl0dXRpb24odmFsdWVGdW5jdGlvbik7XG5cdFx0XHRyZXN1bHQgKz0gdGV4dFBhcnRzW2kgKyAxXTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fTtcblx0dGhpcy52YXJOYW1lcyA9IHZhck5hbWVzO1xuXHR0aGlzLnRlbXBsYXRlID0gdGVtcGxhdGU7XG59XG5VcmlUZW1wbGF0ZS5wcm90b3R5cGUgPSB7XG5cdHRvU3RyaW5nOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHRoaXMudGVtcGxhdGU7XG5cdH0sXG5cdGZpbGxGcm9tT2JqZWN0OiBmdW5jdGlvbiAob2JqKSB7XG5cdFx0cmV0dXJuIHRoaXMuZmlsbChmdW5jdGlvbiAodmFyTmFtZSkge1xuXHRcdFx0cmV0dXJuIG9ialt2YXJOYW1lXTtcblx0XHR9KTtcblx0fVxufTtcbnZhciBWYWxpZGF0b3JDb250ZXh0ID0gZnVuY3Rpb24gVmFsaWRhdG9yQ29udGV4dChwYXJlbnQsIGNvbGxlY3RNdWx0aXBsZSwgZXJyb3JNZXNzYWdlcywgY2hlY2tSZWN1cnNpdmUsIHRyYWNrVW5rbm93blByb3BlcnRpZXMpIHtcblx0dGhpcy5taXNzaW5nID0gW107XG5cdHRoaXMubWlzc2luZ01hcCA9IHt9O1xuXHR0aGlzLmZvcm1hdFZhbGlkYXRvcnMgPSBwYXJlbnQgPyBPYmplY3QuY3JlYXRlKHBhcmVudC5mb3JtYXRWYWxpZGF0b3JzKSA6IHt9O1xuXHR0aGlzLnNjaGVtYXMgPSBwYXJlbnQgPyBPYmplY3QuY3JlYXRlKHBhcmVudC5zY2hlbWFzKSA6IHt9O1xuXHR0aGlzLmNvbGxlY3RNdWx0aXBsZSA9IGNvbGxlY3RNdWx0aXBsZTtcblx0dGhpcy5lcnJvcnMgPSBbXTtcblx0dGhpcy5oYW5kbGVFcnJvciA9IGNvbGxlY3RNdWx0aXBsZSA/IHRoaXMuY29sbGVjdEVycm9yIDogdGhpcy5yZXR1cm5FcnJvcjtcblx0aWYgKGNoZWNrUmVjdXJzaXZlKSB7XG5cdFx0dGhpcy5jaGVja1JlY3Vyc2l2ZSA9IHRydWU7XG5cdFx0dGhpcy5zY2FubmVkID0gW107XG5cdFx0dGhpcy5zY2FubmVkRnJvemVuID0gW107XG5cdFx0dGhpcy5zY2FubmVkRnJvemVuU2NoZW1hcyA9IFtdO1xuXHRcdHRoaXMuc2Nhbm5lZEZyb3plblZhbGlkYXRpb25FcnJvcnMgPSBbXTtcblx0XHR0aGlzLnZhbGlkYXRlZFNjaGVtYXNLZXkgPSAndHY0X3ZhbGlkYXRpb25faWQnO1xuXHRcdHRoaXMudmFsaWRhdGlvbkVycm9yc0tleSA9ICd0djRfdmFsaWRhdGlvbl9lcnJvcnNfaWQnO1xuXHR9XG5cdGlmICh0cmFja1Vua25vd25Qcm9wZXJ0aWVzKSB7XG5cdFx0dGhpcy50cmFja1Vua25vd25Qcm9wZXJ0aWVzID0gdHJ1ZTtcblx0XHR0aGlzLmtub3duUHJvcGVydHlQYXRocyA9IHt9O1xuXHRcdHRoaXMudW5rbm93blByb3BlcnR5UGF0aHMgPSB7fTtcblx0fVxuXHR0aGlzLmVycm9yTWVzc2FnZXMgPSBlcnJvck1lc3NhZ2VzO1xuXHR0aGlzLmRlZmluZWRLZXl3b3JkcyA9IHt9O1xuXHRpZiAocGFyZW50KSB7XG5cdFx0Zm9yICh2YXIga2V5IGluIHBhcmVudC5kZWZpbmVkS2V5d29yZHMpIHtcblx0XHRcdHRoaXMuZGVmaW5lZEtleXdvcmRzW2tleV0gPSBwYXJlbnQuZGVmaW5lZEtleXdvcmRzW2tleV0uc2xpY2UoMCk7XG5cdFx0fVxuXHR9XG59O1xuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUuZGVmaW5lS2V5d29yZCA9IGZ1bmN0aW9uIChrZXl3b3JkLCBrZXl3b3JkRnVuY3Rpb24pIHtcblx0dGhpcy5kZWZpbmVkS2V5d29yZHNba2V5d29yZF0gPSB0aGlzLmRlZmluZWRLZXl3b3Jkc1trZXl3b3JkXSB8fCBbXTtcblx0dGhpcy5kZWZpbmVkS2V5d29yZHNba2V5d29yZF0ucHVzaChrZXl3b3JkRnVuY3Rpb24pO1xufTtcblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLmNyZWF0ZUVycm9yID0gZnVuY3Rpb24gKGNvZGUsIG1lc3NhZ2VQYXJhbXMsIGRhdGFQYXRoLCBzY2hlbWFQYXRoLCBzdWJFcnJvcnMpIHtcblx0dmFyIG1lc3NhZ2VUZW1wbGF0ZSA9IHRoaXMuZXJyb3JNZXNzYWdlc1tjb2RlXSB8fCBFcnJvck1lc3NhZ2VzRGVmYXVsdFtjb2RlXTtcblx0aWYgKHR5cGVvZiBtZXNzYWdlVGVtcGxhdGUgIT09ICdzdHJpbmcnKSB7XG5cdFx0cmV0dXJuIG5ldyBWYWxpZGF0aW9uRXJyb3IoY29kZSwgXCJVbmtub3duIGVycm9yIGNvZGUgXCIgKyBjb2RlICsgXCI6IFwiICsgSlNPTi5zdHJpbmdpZnkobWVzc2FnZVBhcmFtcyksIG1lc3NhZ2VQYXJhbXMsIGRhdGFQYXRoLCBzY2hlbWFQYXRoLCBzdWJFcnJvcnMpO1xuXHR9XG5cdC8vIEFkYXB0ZWQgZnJvbSBDcm9ja2ZvcmQncyBzdXBwbGFudCgpXG5cdHZhciBtZXNzYWdlID0gbWVzc2FnZVRlbXBsYXRlLnJlcGxhY2UoL1xceyhbXnt9XSopXFx9L2csIGZ1bmN0aW9uICh3aG9sZSwgdmFyTmFtZSkge1xuXHRcdHZhciBzdWJWYWx1ZSA9IG1lc3NhZ2VQYXJhbXNbdmFyTmFtZV07XG5cdFx0cmV0dXJuIHR5cGVvZiBzdWJWYWx1ZSA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHN1YlZhbHVlID09PSAnbnVtYmVyJyA/IHN1YlZhbHVlIDogd2hvbGU7XG5cdH0pO1xuXHRyZXR1cm4gbmV3IFZhbGlkYXRpb25FcnJvcihjb2RlLCBtZXNzYWdlLCBtZXNzYWdlUGFyYW1zLCBkYXRhUGF0aCwgc2NoZW1hUGF0aCwgc3ViRXJyb3JzKTtcbn07XG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5yZXR1cm5FcnJvciA9IGZ1bmN0aW9uIChlcnJvcikge1xuXHRyZXR1cm4gZXJyb3I7XG59O1xuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUuY29sbGVjdEVycm9yID0gZnVuY3Rpb24gKGVycm9yKSB7XG5cdGlmIChlcnJvcikge1xuXHRcdHRoaXMuZXJyb3JzLnB1c2goZXJyb3IpO1xuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnByZWZpeEVycm9ycyA9IGZ1bmN0aW9uIChzdGFydEluZGV4LCBkYXRhUGF0aCwgc2NoZW1hUGF0aCkge1xuXHRmb3IgKHZhciBpID0gc3RhcnRJbmRleDsgaSA8IHRoaXMuZXJyb3JzLmxlbmd0aDsgaSsrKSB7XG5cdFx0dGhpcy5lcnJvcnNbaV0gPSB0aGlzLmVycm9yc1tpXS5wcmVmaXhXaXRoKGRhdGFQYXRoLCBzY2hlbWFQYXRoKTtcblx0fVxuXHRyZXR1cm4gdGhpcztcbn07XG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5iYW5Vbmtub3duUHJvcGVydGllcyA9IGZ1bmN0aW9uICgpIHtcblx0Zm9yICh2YXIgdW5rbm93blBhdGggaW4gdGhpcy51bmtub3duUHJvcGVydHlQYXRocykge1xuXHRcdHZhciBlcnJvciA9IHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5VTktOT1dOX1BST1BFUlRZLCB7cGF0aDogdW5rbm93blBhdGh9LCB1bmtub3duUGF0aCwgXCJcIik7XG5cdFx0dmFyIHJlc3VsdCA9IHRoaXMuaGFuZGxlRXJyb3IoZXJyb3IpO1xuXHRcdGlmIChyZXN1bHQpIHtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUuYWRkRm9ybWF0ID0gZnVuY3Rpb24gKGZvcm1hdCwgdmFsaWRhdG9yKSB7XG5cdGlmICh0eXBlb2YgZm9ybWF0ID09PSAnb2JqZWN0Jykge1xuXHRcdGZvciAodmFyIGtleSBpbiBmb3JtYXQpIHtcblx0XHRcdHRoaXMuYWRkRm9ybWF0KGtleSwgZm9ybWF0W2tleV0pO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXHR0aGlzLmZvcm1hdFZhbGlkYXRvcnNbZm9ybWF0XSA9IHZhbGlkYXRvcjtcbn07XG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5yZXNvbHZlUmVmcyA9IGZ1bmN0aW9uIChzY2hlbWEsIHVybEhpc3RvcnkpIHtcblx0aWYgKHNjaGVtYVsnJHJlZiddICE9PSB1bmRlZmluZWQpIHtcblx0XHR1cmxIaXN0b3J5ID0gdXJsSGlzdG9yeSB8fCB7fTtcblx0XHRpZiAodXJsSGlzdG9yeVtzY2hlbWFbJyRyZWYnXV0pIHtcblx0XHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuQ0lSQ1VMQVJfUkVGRVJFTkNFLCB7dXJsczogT2JqZWN0LmtleXModXJsSGlzdG9yeSkuam9pbignLCAnKX0sICcnLCAnJyk7XG5cdFx0fVxuXHRcdHVybEhpc3Rvcnlbc2NoZW1hWyckcmVmJ11dID0gdHJ1ZTtcblx0XHRzY2hlbWEgPSB0aGlzLmdldFNjaGVtYShzY2hlbWFbJyRyZWYnXSwgdXJsSGlzdG9yeSk7XG5cdH1cblx0cmV0dXJuIHNjaGVtYTtcbn07XG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5nZXRTY2hlbWEgPSBmdW5jdGlvbiAodXJsLCB1cmxIaXN0b3J5KSB7XG5cdHZhciBzY2hlbWE7XG5cdGlmICh0aGlzLnNjaGVtYXNbdXJsXSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0c2NoZW1hID0gdGhpcy5zY2hlbWFzW3VybF07XG5cdFx0cmV0dXJuIHRoaXMucmVzb2x2ZVJlZnMoc2NoZW1hLCB1cmxIaXN0b3J5KTtcblx0fVxuXHR2YXIgYmFzZVVybCA9IHVybDtcblx0dmFyIGZyYWdtZW50ID0gXCJcIjtcblx0aWYgKHVybC5pbmRleE9mKCcjJykgIT09IC0xKSB7XG5cdFx0ZnJhZ21lbnQgPSB1cmwuc3Vic3RyaW5nKHVybC5pbmRleE9mKFwiI1wiKSArIDEpO1xuXHRcdGJhc2VVcmwgPSB1cmwuc3Vic3RyaW5nKDAsIHVybC5pbmRleE9mKFwiI1wiKSk7XG5cdH1cblx0aWYgKHR5cGVvZiB0aGlzLnNjaGVtYXNbYmFzZVVybF0gPT09ICdvYmplY3QnKSB7XG5cdFx0c2NoZW1hID0gdGhpcy5zY2hlbWFzW2Jhc2VVcmxdO1xuXHRcdHZhciBwb2ludGVyUGF0aCA9IGRlY29kZVVSSUNvbXBvbmVudChmcmFnbWVudCk7XG5cdFx0aWYgKHBvaW50ZXJQYXRoID09PSBcIlwiKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5yZXNvbHZlUmVmcyhzY2hlbWEsIHVybEhpc3RvcnkpO1xuXHRcdH0gZWxzZSBpZiAocG9pbnRlclBhdGguY2hhckF0KDApICE9PSBcIi9cIikge1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdFx0dmFyIHBhcnRzID0gcG9pbnRlclBhdGguc3BsaXQoXCIvXCIpLnNsaWNlKDEpO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcGFydHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBjb21wb25lbnQgPSBwYXJ0c1tpXS5yZXBsYWNlKC9+MS9nLCBcIi9cIikucmVwbGFjZSgvfjAvZywgXCJ+XCIpO1xuXHRcdFx0aWYgKHNjaGVtYVtjb21wb25lbnRdID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0c2NoZW1hID0gdW5kZWZpbmVkO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHRcdHNjaGVtYSA9IHNjaGVtYVtjb21wb25lbnRdO1xuXHRcdH1cblx0XHRpZiAoc2NoZW1hICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHJldHVybiB0aGlzLnJlc29sdmVSZWZzKHNjaGVtYSwgdXJsSGlzdG9yeSk7XG5cdFx0fVxuXHR9XG5cdGlmICh0aGlzLm1pc3NpbmdbYmFzZVVybF0gPT09IHVuZGVmaW5lZCkge1xuXHRcdHRoaXMubWlzc2luZy5wdXNoKGJhc2VVcmwpO1xuXHRcdHRoaXMubWlzc2luZ1tiYXNlVXJsXSA9IGJhc2VVcmw7XG5cdFx0dGhpcy5taXNzaW5nTWFwW2Jhc2VVcmxdID0gYmFzZVVybDtcblx0fVxufTtcblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnNlYXJjaFNjaGVtYXMgPSBmdW5jdGlvbiAoc2NoZW1hLCB1cmwpIHtcblx0aWYgKHNjaGVtYSAmJiB0eXBlb2Ygc2NoZW1hID09PSBcIm9iamVjdFwiKSB7XG5cdFx0aWYgKHR5cGVvZiBzY2hlbWEuaWQgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdGlmIChpc1RydXN0ZWRVcmwodXJsLCBzY2hlbWEuaWQpKSB7XG5cdFx0XHRcdGlmICh0aGlzLnNjaGVtYXNbc2NoZW1hLmlkXSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0dGhpcy5zY2hlbWFzW3NjaGVtYS5pZF0gPSBzY2hlbWE7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0Zm9yICh2YXIga2V5IGluIHNjaGVtYSkge1xuXHRcdFx0aWYgKGtleSAhPT0gXCJlbnVtXCIpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBzY2hlbWFba2V5XSA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0XHRcdHRoaXMuc2VhcmNoU2NoZW1hcyhzY2hlbWFba2V5XSwgdXJsKTtcblx0XHRcdFx0fSBlbHNlIGlmIChrZXkgPT09IFwiJHJlZlwiKSB7XG5cdFx0XHRcdFx0dmFyIHVyaSA9IGdldERvY3VtZW50VXJpKHNjaGVtYVtrZXldKTtcblx0XHRcdFx0XHRpZiAodXJpICYmIHRoaXMuc2NoZW1hc1t1cmldID09PSB1bmRlZmluZWQgJiYgdGhpcy5taXNzaW5nTWFwW3VyaV0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0dGhpcy5taXNzaW5nTWFwW3VyaV0gPSB1cmk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59O1xuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUuYWRkU2NoZW1hID0gZnVuY3Rpb24gKHVybCwgc2NoZW1hKSB7XG5cdC8vb3ZlcmxvYWRcblx0aWYgKHR5cGVvZiB1cmwgIT09ICdzdHJpbmcnIHx8IHR5cGVvZiBzY2hlbWEgPT09ICd1bmRlZmluZWQnKSB7XG5cdFx0aWYgKHR5cGVvZiB1cmwgPT09ICdvYmplY3QnICYmIHR5cGVvZiB1cmwuaWQgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRzY2hlbWEgPSB1cmw7XG5cdFx0XHR1cmwgPSBzY2hlbWEuaWQ7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0fVxuXHRpZiAodXJsID09PSBnZXREb2N1bWVudFVyaSh1cmwpICsgXCIjXCIpIHtcblx0XHQvLyBSZW1vdmUgZW1wdHkgZnJhZ21lbnRcblx0XHR1cmwgPSBnZXREb2N1bWVudFVyaSh1cmwpO1xuXHR9XG5cdHRoaXMuc2NoZW1hc1t1cmxdID0gc2NoZW1hO1xuXHRkZWxldGUgdGhpcy5taXNzaW5nTWFwW3VybF07XG5cdG5vcm1TY2hlbWEoc2NoZW1hLCB1cmwpO1xuXHR0aGlzLnNlYXJjaFNjaGVtYXMoc2NoZW1hLCB1cmwpO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUuZ2V0U2NoZW1hTWFwID0gZnVuY3Rpb24gKCkge1xuXHR2YXIgbWFwID0ge307XG5cdGZvciAodmFyIGtleSBpbiB0aGlzLnNjaGVtYXMpIHtcblx0XHRtYXBba2V5XSA9IHRoaXMuc2NoZW1hc1trZXldO1xuXHR9XG5cdHJldHVybiBtYXA7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5nZXRTY2hlbWFVcmlzID0gZnVuY3Rpb24gKGZpbHRlclJlZ0V4cCkge1xuXHR2YXIgbGlzdCA9IFtdO1xuXHRmb3IgKHZhciBrZXkgaW4gdGhpcy5zY2hlbWFzKSB7XG5cdFx0aWYgKCFmaWx0ZXJSZWdFeHAgfHwgZmlsdGVyUmVnRXhwLnRlc3Qoa2V5KSkge1xuXHRcdFx0bGlzdC5wdXNoKGtleSk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBsaXN0O1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUuZ2V0TWlzc2luZ1VyaXMgPSBmdW5jdGlvbiAoZmlsdGVyUmVnRXhwKSB7XG5cdHZhciBsaXN0ID0gW107XG5cdGZvciAodmFyIGtleSBpbiB0aGlzLm1pc3NpbmdNYXApIHtcblx0XHRpZiAoIWZpbHRlclJlZ0V4cCB8fCBmaWx0ZXJSZWdFeHAudGVzdChrZXkpKSB7XG5cdFx0XHRsaXN0LnB1c2goa2V5KTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGxpc3Q7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5kcm9wU2NoZW1hcyA9IGZ1bmN0aW9uICgpIHtcblx0dGhpcy5zY2hlbWFzID0ge307XG5cdHRoaXMucmVzZXQoKTtcbn07XG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uICgpIHtcblx0dGhpcy5taXNzaW5nID0gW107XG5cdHRoaXMubWlzc2luZ01hcCA9IHt9O1xuXHR0aGlzLmVycm9ycyA9IFtdO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVBbGwgPSBmdW5jdGlvbiAoZGF0YSwgc2NoZW1hLCBkYXRhUGF0aFBhcnRzLCBzY2hlbWFQYXRoUGFydHMsIGRhdGFQb2ludGVyUGF0aCkge1xuXHR2YXIgdG9wTGV2ZWw7XG5cdHNjaGVtYSA9IHRoaXMucmVzb2x2ZVJlZnMoc2NoZW1hKTtcblx0aWYgKCFzY2hlbWEpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fSBlbHNlIGlmIChzY2hlbWEgaW5zdGFuY2VvZiBWYWxpZGF0aW9uRXJyb3IpIHtcblx0XHR0aGlzLmVycm9ycy5wdXNoKHNjaGVtYSk7XG5cdFx0cmV0dXJuIHNjaGVtYTtcblx0fVxuXG5cdHZhciBzdGFydEVycm9yQ291bnQgPSB0aGlzLmVycm9ycy5sZW5ndGg7XG5cdHZhciBmcm96ZW5JbmRleCwgc2Nhbm5lZEZyb3plblNjaGVtYUluZGV4ID0gbnVsbCwgc2Nhbm5lZFNjaGVtYXNJbmRleCA9IG51bGw7XG5cdGlmICh0aGlzLmNoZWNrUmVjdXJzaXZlICYmIGRhdGEgJiYgdHlwZW9mIGRhdGEgPT09ICdvYmplY3QnKSB7XG5cdFx0dG9wTGV2ZWwgPSAhdGhpcy5zY2FubmVkLmxlbmd0aDtcblx0XHRpZiAoZGF0YVt0aGlzLnZhbGlkYXRlZFNjaGVtYXNLZXldKSB7XG5cdFx0XHR2YXIgc2NoZW1hSW5kZXggPSBkYXRhW3RoaXMudmFsaWRhdGVkU2NoZW1hc0tleV0uaW5kZXhPZihzY2hlbWEpO1xuXHRcdFx0aWYgKHNjaGVtYUluZGV4ICE9PSAtMSkge1xuXHRcdFx0XHR0aGlzLmVycm9ycyA9IHRoaXMuZXJyb3JzLmNvbmNhdChkYXRhW3RoaXMudmFsaWRhdGlvbkVycm9yc0tleV1bc2NoZW1hSW5kZXhdKTtcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChPYmplY3QuaXNGcm96ZW4oZGF0YSkpIHtcblx0XHRcdGZyb3plbkluZGV4ID0gdGhpcy5zY2FubmVkRnJvemVuLmluZGV4T2YoZGF0YSk7XG5cdFx0XHRpZiAoZnJvemVuSW5kZXggIT09IC0xKSB7XG5cdFx0XHRcdHZhciBmcm96ZW5TY2hlbWFJbmRleCA9IHRoaXMuc2Nhbm5lZEZyb3plblNjaGVtYXNbZnJvemVuSW5kZXhdLmluZGV4T2Yoc2NoZW1hKTtcblx0XHRcdFx0aWYgKGZyb3plblNjaGVtYUluZGV4ICE9PSAtMSkge1xuXHRcdFx0XHRcdHRoaXMuZXJyb3JzID0gdGhpcy5lcnJvcnMuY29uY2F0KHRoaXMuc2Nhbm5lZEZyb3plblZhbGlkYXRpb25FcnJvcnNbZnJvemVuSW5kZXhdW2Zyb3plblNjaGVtYUluZGV4XSk7XG5cdFx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0dGhpcy5zY2FubmVkLnB1c2goZGF0YSk7XG5cdFx0aWYgKE9iamVjdC5pc0Zyb3plbihkYXRhKSkge1xuXHRcdFx0aWYgKGZyb3plbkluZGV4ID09PSAtMSkge1xuXHRcdFx0XHRmcm96ZW5JbmRleCA9IHRoaXMuc2Nhbm5lZEZyb3plbi5sZW5ndGg7XG5cdFx0XHRcdHRoaXMuc2Nhbm5lZEZyb3plbi5wdXNoKGRhdGEpO1xuXHRcdFx0XHR0aGlzLnNjYW5uZWRGcm96ZW5TY2hlbWFzLnB1c2goW10pO1xuXHRcdFx0fVxuXHRcdFx0c2Nhbm5lZEZyb3plblNjaGVtYUluZGV4ID0gdGhpcy5zY2FubmVkRnJvemVuU2NoZW1hc1tmcm96ZW5JbmRleF0ubGVuZ3RoO1xuXHRcdFx0dGhpcy5zY2FubmVkRnJvemVuU2NoZW1hc1tmcm96ZW5JbmRleF1bc2Nhbm5lZEZyb3plblNjaGVtYUluZGV4XSA9IHNjaGVtYTtcblx0XHRcdHRoaXMuc2Nhbm5lZEZyb3plblZhbGlkYXRpb25FcnJvcnNbZnJvemVuSW5kZXhdW3NjYW5uZWRGcm96ZW5TY2hlbWFJbmRleF0gPSBbXTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKCFkYXRhW3RoaXMudmFsaWRhdGVkU2NoZW1hc0tleV0pIHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZGF0YSwgdGhpcy52YWxpZGF0ZWRTY2hlbWFzS2V5LCB7XG5cdFx0XHRcdFx0XHR2YWx1ZTogW10sXG5cdFx0XHRcdFx0XHRjb25maWd1cmFibGU6IHRydWVcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZGF0YSwgdGhpcy52YWxpZGF0aW9uRXJyb3JzS2V5LCB7XG5cdFx0XHRcdFx0XHR2YWx1ZTogW10sXG5cdFx0XHRcdFx0XHRjb25maWd1cmFibGU6IHRydWVcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRcdC8vSUUgNy84IHdvcmthcm91bmRcblx0XHRcdFx0XHRkYXRhW3RoaXMudmFsaWRhdGVkU2NoZW1hc0tleV0gPSBbXTtcblx0XHRcdFx0XHRkYXRhW3RoaXMudmFsaWRhdGlvbkVycm9yc0tleV0gPSBbXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0c2Nhbm5lZFNjaGVtYXNJbmRleCA9IGRhdGFbdGhpcy52YWxpZGF0ZWRTY2hlbWFzS2V5XS5sZW5ndGg7XG5cdFx0XHRkYXRhW3RoaXMudmFsaWRhdGVkU2NoZW1hc0tleV1bc2Nhbm5lZFNjaGVtYXNJbmRleF0gPSBzY2hlbWE7XG5cdFx0XHRkYXRhW3RoaXMudmFsaWRhdGlvbkVycm9yc0tleV1bc2Nhbm5lZFNjaGVtYXNJbmRleF0gPSBbXTtcblx0XHR9XG5cdH1cblxuXHR2YXIgZXJyb3JDb3VudCA9IHRoaXMuZXJyb3JzLmxlbmd0aDtcblx0dmFyIGVycm9yID0gdGhpcy52YWxpZGF0ZUJhc2ljKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVOdW1lcmljKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVTdHJpbmcoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZUFycmF5KGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVPYmplY3QoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZUNvbWJpbmF0aW9ucyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCB0aGlzLnZhbGlkYXRlSHlwZXJtZWRpYShkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCB0aGlzLnZhbGlkYXRlRm9ybWF0KGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVEZWZpbmVkS2V5d29yZHMoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgbnVsbDtcblxuXHRpZiAodG9wTGV2ZWwpIHtcblx0XHR3aGlsZSAodGhpcy5zY2FubmVkLmxlbmd0aCkge1xuXHRcdFx0dmFyIGl0ZW0gPSB0aGlzLnNjYW5uZWQucG9wKCk7XG5cdFx0XHRkZWxldGUgaXRlbVt0aGlzLnZhbGlkYXRlZFNjaGVtYXNLZXldO1xuXHRcdH1cblx0XHR0aGlzLnNjYW5uZWRGcm96ZW4gPSBbXTtcblx0XHR0aGlzLnNjYW5uZWRGcm96ZW5TY2hlbWFzID0gW107XG5cdH1cblxuXHRpZiAoZXJyb3IgfHwgZXJyb3JDb3VudCAhPT0gdGhpcy5lcnJvcnMubGVuZ3RoKSB7XG5cdFx0d2hpbGUgKChkYXRhUGF0aFBhcnRzICYmIGRhdGFQYXRoUGFydHMubGVuZ3RoKSB8fCAoc2NoZW1hUGF0aFBhcnRzICYmIHNjaGVtYVBhdGhQYXJ0cy5sZW5ndGgpKSB7XG5cdFx0XHR2YXIgZGF0YVBhcnQgPSAoZGF0YVBhdGhQYXJ0cyAmJiBkYXRhUGF0aFBhcnRzLmxlbmd0aCkgPyBcIlwiICsgZGF0YVBhdGhQYXJ0cy5wb3AoKSA6IG51bGw7XG5cdFx0XHR2YXIgc2NoZW1hUGFydCA9IChzY2hlbWFQYXRoUGFydHMgJiYgc2NoZW1hUGF0aFBhcnRzLmxlbmd0aCkgPyBcIlwiICsgc2NoZW1hUGF0aFBhcnRzLnBvcCgpIDogbnVsbDtcblx0XHRcdGlmIChlcnJvcikge1xuXHRcdFx0XHRlcnJvciA9IGVycm9yLnByZWZpeFdpdGgoZGF0YVBhcnQsIHNjaGVtYVBhcnQpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5wcmVmaXhFcnJvcnMoZXJyb3JDb3VudCwgZGF0YVBhcnQsIHNjaGVtYVBhcnQpO1xuXHRcdH1cblx0fVxuXG5cdGlmIChzY2FubmVkRnJvemVuU2NoZW1hSW5kZXggIT09IG51bGwpIHtcblx0XHR0aGlzLnNjYW5uZWRGcm96ZW5WYWxpZGF0aW9uRXJyb3JzW2Zyb3plbkluZGV4XVtzY2FubmVkRnJvemVuU2NoZW1hSW5kZXhdID0gdGhpcy5lcnJvcnMuc2xpY2Uoc3RhcnRFcnJvckNvdW50KTtcblx0fSBlbHNlIGlmIChzY2FubmVkU2NoZW1hc0luZGV4ICE9PSBudWxsKSB7XG5cdFx0ZGF0YVt0aGlzLnZhbGlkYXRpb25FcnJvcnNLZXldW3NjYW5uZWRTY2hlbWFzSW5kZXhdID0gdGhpcy5lcnJvcnMuc2xpY2Uoc3RhcnRFcnJvckNvdW50KTtcblx0fVxuXG5cdHJldHVybiB0aGlzLmhhbmRsZUVycm9yKGVycm9yKTtcbn07XG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZUZvcm1hdCA9IGZ1bmN0aW9uIChkYXRhLCBzY2hlbWEpIHtcblx0aWYgKHR5cGVvZiBzY2hlbWEuZm9ybWF0ICE9PSAnc3RyaW5nJyB8fCAhdGhpcy5mb3JtYXRWYWxpZGF0b3JzW3NjaGVtYS5mb3JtYXRdKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0dmFyIGVycm9yTWVzc2FnZSA9IHRoaXMuZm9ybWF0VmFsaWRhdG9yc1tzY2hlbWEuZm9ybWF0XS5jYWxsKG51bGwsIGRhdGEsIHNjaGVtYSk7XG5cdGlmICh0eXBlb2YgZXJyb3JNZXNzYWdlID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgZXJyb3JNZXNzYWdlID09PSAnbnVtYmVyJykge1xuXHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuRk9STUFUX0NVU1RPTSwge21lc3NhZ2U6IGVycm9yTWVzc2FnZX0pLnByZWZpeFdpdGgobnVsbCwgXCJmb3JtYXRcIik7XG5cdH0gZWxzZSBpZiAoZXJyb3JNZXNzYWdlICYmIHR5cGVvZiBlcnJvck1lc3NhZ2UgPT09ICdvYmplY3QnKSB7XG5cdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5GT1JNQVRfQ1VTVE9NLCB7bWVzc2FnZTogZXJyb3JNZXNzYWdlLm1lc3NhZ2UgfHwgXCI/XCJ9LCBlcnJvck1lc3NhZ2UuZGF0YVBhdGggfHwgbnVsbCwgZXJyb3JNZXNzYWdlLnNjaGVtYVBhdGggfHwgXCIvZm9ybWF0XCIpO1xuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlRGVmaW5lZEtleXdvcmRzID0gZnVuY3Rpb24gKGRhdGEsIHNjaGVtYSkge1xuXHRmb3IgKHZhciBrZXkgaW4gdGhpcy5kZWZpbmVkS2V5d29yZHMpIHtcblx0XHRpZiAodHlwZW9mIHNjaGVtYVtrZXldID09PSAndW5kZWZpbmVkJykge1xuXHRcdFx0Y29udGludWU7XG5cdFx0fVxuXHRcdHZhciB2YWxpZGF0aW9uRnVuY3Rpb25zID0gdGhpcy5kZWZpbmVkS2V5d29yZHNba2V5XTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHZhbGlkYXRpb25GdW5jdGlvbnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBmdW5jID0gdmFsaWRhdGlvbkZ1bmN0aW9uc1tpXTtcblx0XHRcdHZhciByZXN1bHQgPSBmdW5jKGRhdGEsIHNjaGVtYVtrZXldLCBzY2hlbWEpO1xuXHRcdFx0aWYgKHR5cGVvZiByZXN1bHQgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiByZXN1bHQgPT09ICdudW1iZXInKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuS0VZV09SRF9DVVNUT00sIHtrZXk6IGtleSwgbWVzc2FnZTogcmVzdWx0fSkucHJlZml4V2l0aChudWxsLCBcImZvcm1hdFwiKTtcblx0XHRcdH0gZWxzZSBpZiAocmVzdWx0ICYmIHR5cGVvZiByZXN1bHQgPT09ICdvYmplY3QnKSB7XG5cdFx0XHRcdHZhciBjb2RlID0gcmVzdWx0LmNvZGUgfHwgRXJyb3JDb2Rlcy5LRVlXT1JEX0NVU1RPTTtcblx0XHRcdFx0aWYgKHR5cGVvZiBjb2RlID09PSAnc3RyaW5nJykge1xuXHRcdFx0XHRcdGlmICghRXJyb3JDb2Rlc1tjb2RlXSkge1xuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdVbmRlZmluZWQgZXJyb3IgY29kZSAodXNlIGRlZmluZUVycm9yKTogJyArIGNvZGUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjb2RlID0gRXJyb3JDb2Rlc1tjb2RlXTtcblx0XHRcdFx0fVxuXHRcdFx0XHR2YXIgbWVzc2FnZVBhcmFtcyA9ICh0eXBlb2YgcmVzdWx0Lm1lc3NhZ2UgPT09ICdvYmplY3QnKSA/IHJlc3VsdC5tZXNzYWdlIDoge2tleToga2V5LCBtZXNzYWdlOiByZXN1bHQubWVzc2FnZSB8fCBcIj9cIn07XG5cdFx0XHRcdHZhciBzY2hlbWFQYXRoID0gcmVzdWx0LnNjaGVtYVBhdGggfHwoIFwiL1wiICsga2V5LnJlcGxhY2UoL34vZywgJ34wJykucmVwbGFjZSgvXFwvL2csICd+MScpKTtcblx0XHRcdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoY29kZSwgbWVzc2FnZVBhcmFtcywgcmVzdWx0LmRhdGFQYXRoIHx8IG51bGwsIHNjaGVtYVBhdGgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cbmZ1bmN0aW9uIHJlY3Vyc2l2ZUNvbXBhcmUoQSwgQikge1xuXHRpZiAoQSA9PT0gQikge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cdGlmICh0eXBlb2YgQSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgQiA9PT0gXCJvYmplY3RcIikge1xuXHRcdGlmIChBcnJheS5pc0FycmF5KEEpICE9PSBBcnJheS5pc0FycmF5KEIpKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSBlbHNlIGlmIChBcnJheS5pc0FycmF5KEEpKSB7XG5cdFx0XHRpZiAoQS5sZW5ndGggIT09IEIubGVuZ3RoKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgQS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAoIXJlY3Vyc2l2ZUNvbXBhcmUoQVtpXSwgQltpXSkpIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIGtleTtcblx0XHRcdGZvciAoa2V5IGluIEEpIHtcblx0XHRcdFx0aWYgKEJba2V5XSA9PT0gdW5kZWZpbmVkICYmIEFba2V5XSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRmb3IgKGtleSBpbiBCKSB7XG5cdFx0XHRcdGlmIChBW2tleV0gPT09IHVuZGVmaW5lZCAmJiBCW2tleV0gIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Zm9yIChrZXkgaW4gQSkge1xuXHRcdFx0XHRpZiAoIXJlY3Vyc2l2ZUNvbXBhcmUoQVtrZXldLCBCW2tleV0pKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cdHJldHVybiBmYWxzZTtcbn1cblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVCYXNpYyA9IGZ1bmN0aW9uIHZhbGlkYXRlQmFzaWMoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpIHtcblx0dmFyIGVycm9yO1xuXHRpZiAoZXJyb3IgPSB0aGlzLnZhbGlkYXRlVHlwZShkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aCkpIHtcblx0XHRyZXR1cm4gZXJyb3IucHJlZml4V2l0aChudWxsLCBcInR5cGVcIik7XG5cdH1cblx0aWYgKGVycm9yID0gdGhpcy52YWxpZGF0ZUVudW0oZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpKSB7XG5cdFx0cmV0dXJuIGVycm9yLnByZWZpeFdpdGgobnVsbCwgXCJ0eXBlXCIpO1xuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVUeXBlID0gZnVuY3Rpb24gdmFsaWRhdGVUeXBlKGRhdGEsIHNjaGVtYSkge1xuXHRpZiAoc2NoZW1hLnR5cGUgPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdHZhciBkYXRhVHlwZSA9IHR5cGVvZiBkYXRhO1xuXHRpZiAoZGF0YSA9PT0gbnVsbCkge1xuXHRcdGRhdGFUeXBlID0gXCJudWxsXCI7XG5cdH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShkYXRhKSkge1xuXHRcdGRhdGFUeXBlID0gXCJhcnJheVwiO1xuXHR9XG5cdHZhciBhbGxvd2VkVHlwZXMgPSBzY2hlbWEudHlwZTtcblx0aWYgKHR5cGVvZiBhbGxvd2VkVHlwZXMgIT09IFwib2JqZWN0XCIpIHtcblx0XHRhbGxvd2VkVHlwZXMgPSBbYWxsb3dlZFR5cGVzXTtcblx0fVxuXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgYWxsb3dlZFR5cGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIHR5cGUgPSBhbGxvd2VkVHlwZXNbaV07XG5cdFx0aWYgKHR5cGUgPT09IGRhdGFUeXBlIHx8ICh0eXBlID09PSBcImludGVnZXJcIiAmJiBkYXRhVHlwZSA9PT0gXCJudW1iZXJcIiAmJiAoZGF0YSAlIDEgPT09IDApKSkge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHR9XG5cdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuSU5WQUxJRF9UWVBFLCB7dHlwZTogZGF0YVR5cGUsIGV4cGVjdGVkOiBhbGxvd2VkVHlwZXMuam9pbihcIi9cIil9KTtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlRW51bSA9IGZ1bmN0aW9uIHZhbGlkYXRlRW51bShkYXRhLCBzY2hlbWEpIHtcblx0aWYgKHNjaGVtYVtcImVudW1cIl0gPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgc2NoZW1hW1wiZW51bVwiXS5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBlbnVtVmFsID0gc2NoZW1hW1wiZW51bVwiXVtpXTtcblx0XHRpZiAocmVjdXJzaXZlQ29tcGFyZShkYXRhLCBlbnVtVmFsKSkge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHR9XG5cdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuRU5VTV9NSVNNQVRDSCwge3ZhbHVlOiAodHlwZW9mIEpTT04gIT09ICd1bmRlZmluZWQnKSA/IEpTT04uc3RyaW5naWZ5KGRhdGEpIDogZGF0YX0pO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVOdW1lcmljID0gZnVuY3Rpb24gdmFsaWRhdGVOdW1lcmljKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKSB7XG5cdHJldHVybiB0aGlzLnZhbGlkYXRlTXVsdGlwbGVPZihkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCB0aGlzLnZhbGlkYXRlTWluTWF4KGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVOYU4oZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlTXVsdGlwbGVPZiA9IGZ1bmN0aW9uIHZhbGlkYXRlTXVsdGlwbGVPZihkYXRhLCBzY2hlbWEpIHtcblx0dmFyIG11bHRpcGxlT2YgPSBzY2hlbWEubXVsdGlwbGVPZiB8fCBzY2hlbWEuZGl2aXNpYmxlQnk7XG5cdGlmIChtdWx0aXBsZU9mID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHRpZiAodHlwZW9mIGRhdGEgPT09IFwibnVtYmVyXCIpIHtcblx0XHRpZiAoZGF0YSAlIG11bHRpcGxlT2YgIT09IDApIHtcblx0XHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuTlVNQkVSX01VTFRJUExFX09GLCB7dmFsdWU6IGRhdGEsIG11bHRpcGxlT2Y6IG11bHRpcGxlT2Z9KTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZU1pbk1heCA9IGZ1bmN0aW9uIHZhbGlkYXRlTWluTWF4KGRhdGEsIHNjaGVtYSkge1xuXHRpZiAodHlwZW9mIGRhdGEgIT09IFwibnVtYmVyXCIpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHRpZiAoc2NoZW1hLm1pbmltdW0gIT09IHVuZGVmaW5lZCkge1xuXHRcdGlmIChkYXRhIDwgc2NoZW1hLm1pbmltdW0pIHtcblx0XHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuTlVNQkVSX01JTklNVU0sIHt2YWx1ZTogZGF0YSwgbWluaW11bTogc2NoZW1hLm1pbmltdW19KS5wcmVmaXhXaXRoKG51bGwsIFwibWluaW11bVwiKTtcblx0XHR9XG5cdFx0aWYgKHNjaGVtYS5leGNsdXNpdmVNaW5pbXVtICYmIGRhdGEgPT09IHNjaGVtYS5taW5pbXVtKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLk5VTUJFUl9NSU5JTVVNX0VYQ0xVU0lWRSwge3ZhbHVlOiBkYXRhLCBtaW5pbXVtOiBzY2hlbWEubWluaW11bX0pLnByZWZpeFdpdGgobnVsbCwgXCJleGNsdXNpdmVNaW5pbXVtXCIpO1xuXHRcdH1cblx0fVxuXHRpZiAoc2NoZW1hLm1heGltdW0gIT09IHVuZGVmaW5lZCkge1xuXHRcdGlmIChkYXRhID4gc2NoZW1hLm1heGltdW0pIHtcblx0XHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuTlVNQkVSX01BWElNVU0sIHt2YWx1ZTogZGF0YSwgbWF4aW11bTogc2NoZW1hLm1heGltdW19KS5wcmVmaXhXaXRoKG51bGwsIFwibWF4aW11bVwiKTtcblx0XHR9XG5cdFx0aWYgKHNjaGVtYS5leGNsdXNpdmVNYXhpbXVtICYmIGRhdGEgPT09IHNjaGVtYS5tYXhpbXVtKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLk5VTUJFUl9NQVhJTVVNX0VYQ0xVU0lWRSwge3ZhbHVlOiBkYXRhLCBtYXhpbXVtOiBzY2hlbWEubWF4aW11bX0pLnByZWZpeFdpdGgobnVsbCwgXCJleGNsdXNpdmVNYXhpbXVtXCIpO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlTmFOID0gZnVuY3Rpb24gdmFsaWRhdGVOYU4oZGF0YSkge1xuXHRpZiAodHlwZW9mIGRhdGEgIT09IFwibnVtYmVyXCIpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHRpZiAoaXNOYU4oZGF0YSkgPT09IHRydWUgfHwgZGF0YSA9PT0gSW5maW5pdHkgfHwgZGF0YSA9PT0gLUluZmluaXR5KSB7XG5cdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5OVU1CRVJfTk9UX0FfTlVNQkVSLCB7dmFsdWU6IGRhdGF9KS5wcmVmaXhXaXRoKG51bGwsIFwidHlwZVwiKTtcblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlU3RyaW5nID0gZnVuY3Rpb24gdmFsaWRhdGVTdHJpbmcoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpIHtcblx0cmV0dXJuIHRoaXMudmFsaWRhdGVTdHJpbmdMZW5ndGgoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZVN0cmluZ1BhdHRlcm4oZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlU3RyaW5nTGVuZ3RoID0gZnVuY3Rpb24gdmFsaWRhdGVTdHJpbmdMZW5ndGgoZGF0YSwgc2NoZW1hKSB7XG5cdGlmICh0eXBlb2YgZGF0YSAhPT0gXCJzdHJpbmdcIikge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdGlmIChzY2hlbWEubWluTGVuZ3RoICE9PSB1bmRlZmluZWQpIHtcblx0XHRpZiAoZGF0YS5sZW5ndGggPCBzY2hlbWEubWluTGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLlNUUklOR19MRU5HVEhfU0hPUlQsIHtsZW5ndGg6IGRhdGEubGVuZ3RoLCBtaW5pbXVtOiBzY2hlbWEubWluTGVuZ3RofSkucHJlZml4V2l0aChudWxsLCBcIm1pbkxlbmd0aFwiKTtcblx0XHR9XG5cdH1cblx0aWYgKHNjaGVtYS5tYXhMZW5ndGggIT09IHVuZGVmaW5lZCkge1xuXHRcdGlmIChkYXRhLmxlbmd0aCA+IHNjaGVtYS5tYXhMZW5ndGgpIHtcblx0XHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuU1RSSU5HX0xFTkdUSF9MT05HLCB7bGVuZ3RoOiBkYXRhLmxlbmd0aCwgbWF4aW11bTogc2NoZW1hLm1heExlbmd0aH0pLnByZWZpeFdpdGgobnVsbCwgXCJtYXhMZW5ndGhcIik7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVTdHJpbmdQYXR0ZXJuID0gZnVuY3Rpb24gdmFsaWRhdGVTdHJpbmdQYXR0ZXJuKGRhdGEsIHNjaGVtYSkge1xuXHRpZiAodHlwZW9mIGRhdGEgIT09IFwic3RyaW5nXCIgfHwgc2NoZW1hLnBhdHRlcm4gPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdHZhciByZWdleHAgPSBuZXcgUmVnRXhwKHNjaGVtYS5wYXR0ZXJuKTtcblx0aWYgKCFyZWdleHAudGVzdChkYXRhKSkge1xuXHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuU1RSSU5HX1BBVFRFUk4sIHtwYXR0ZXJuOiBzY2hlbWEucGF0dGVybn0pLnByZWZpeFdpdGgobnVsbCwgXCJwYXR0ZXJuXCIpO1xuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlQXJyYXkgPSBmdW5jdGlvbiB2YWxpZGF0ZUFycmF5KGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKSB7XG5cdGlmICghQXJyYXkuaXNBcnJheShkYXRhKSkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdHJldHVybiB0aGlzLnZhbGlkYXRlQXJyYXlMZW5ndGgoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZUFycmF5VW5pcXVlSXRlbXMoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZUFycmF5SXRlbXMoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlQXJyYXlMZW5ndGggPSBmdW5jdGlvbiB2YWxpZGF0ZUFycmF5TGVuZ3RoKGRhdGEsIHNjaGVtYSkge1xuXHR2YXIgZXJyb3I7XG5cdGlmIChzY2hlbWEubWluSXRlbXMgIT09IHVuZGVmaW5lZCkge1xuXHRcdGlmIChkYXRhLmxlbmd0aCA8IHNjaGVtYS5taW5JdGVtcykge1xuXHRcdFx0ZXJyb3IgPSAodGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLkFSUkFZX0xFTkdUSF9TSE9SVCwge2xlbmd0aDogZGF0YS5sZW5ndGgsIG1pbmltdW06IHNjaGVtYS5taW5JdGVtc30pKS5wcmVmaXhXaXRoKG51bGwsIFwibWluSXRlbXNcIik7XG5cdFx0XHRpZiAodGhpcy5oYW5kbGVFcnJvcihlcnJvcikpIHtcblx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRpZiAoc2NoZW1hLm1heEl0ZW1zICE9PSB1bmRlZmluZWQpIHtcblx0XHRpZiAoZGF0YS5sZW5ndGggPiBzY2hlbWEubWF4SXRlbXMpIHtcblx0XHRcdGVycm9yID0gKHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5BUlJBWV9MRU5HVEhfTE9ORywge2xlbmd0aDogZGF0YS5sZW5ndGgsIG1heGltdW06IHNjaGVtYS5tYXhJdGVtc30pKS5wcmVmaXhXaXRoKG51bGwsIFwibWF4SXRlbXNcIik7XG5cdFx0XHRpZiAodGhpcy5oYW5kbGVFcnJvcihlcnJvcikpIHtcblx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlQXJyYXlVbmlxdWVJdGVtcyA9IGZ1bmN0aW9uIHZhbGlkYXRlQXJyYXlVbmlxdWVJdGVtcyhkYXRhLCBzY2hlbWEpIHtcblx0aWYgKHNjaGVtYS51bmlxdWVJdGVtcykge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuXHRcdFx0Zm9yICh2YXIgaiA9IGkgKyAxOyBqIDwgZGF0YS5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRpZiAocmVjdXJzaXZlQ29tcGFyZShkYXRhW2ldLCBkYXRhW2pdKSkge1xuXHRcdFx0XHRcdHZhciBlcnJvciA9ICh0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuQVJSQVlfVU5JUVVFLCB7bWF0Y2gxOiBpLCBtYXRjaDI6IGp9KSkucHJlZml4V2l0aChudWxsLCBcInVuaXF1ZUl0ZW1zXCIpO1xuXHRcdFx0XHRcdGlmICh0aGlzLmhhbmRsZUVycm9yKGVycm9yKSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlQXJyYXlJdGVtcyA9IGZ1bmN0aW9uIHZhbGlkYXRlQXJyYXlJdGVtcyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aCkge1xuXHRpZiAoc2NoZW1hLml0ZW1zID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHR2YXIgZXJyb3IsIGk7XG5cdGlmIChBcnJheS5pc0FycmF5KHNjaGVtYS5pdGVtcykpIHtcblx0XHRmb3IgKGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKGkgPCBzY2hlbWEuaXRlbXMubGVuZ3RoKSB7XG5cdFx0XHRcdGlmIChlcnJvciA9IHRoaXMudmFsaWRhdGVBbGwoZGF0YVtpXSwgc2NoZW1hLml0ZW1zW2ldLCBbaV0sIFtcIml0ZW1zXCIsIGldLCBkYXRhUG9pbnRlclBhdGggKyBcIi9cIiArIGkpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKHNjaGVtYS5hZGRpdGlvbmFsSXRlbXMgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRpZiAodHlwZW9mIHNjaGVtYS5hZGRpdGlvbmFsSXRlbXMgPT09IFwiYm9vbGVhblwiKSB7XG5cdFx0XHRcdFx0aWYgKCFzY2hlbWEuYWRkaXRpb25hbEl0ZW1zKSB7XG5cdFx0XHRcdFx0XHRlcnJvciA9ICh0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuQVJSQVlfQURESVRJT05BTF9JVEVNUywge30pKS5wcmVmaXhXaXRoKFwiXCIgKyBpLCBcImFkZGl0aW9uYWxJdGVtc1wiKTtcblx0XHRcdFx0XHRcdGlmICh0aGlzLmhhbmRsZUVycm9yKGVycm9yKSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2UgaWYgKGVycm9yID0gdGhpcy52YWxpZGF0ZUFsbChkYXRhW2ldLCBzY2hlbWEuYWRkaXRpb25hbEl0ZW1zLCBbaV0sIFtcImFkZGl0aW9uYWxJdGVtc1wiXSwgZGF0YVBvaW50ZXJQYXRoICsgXCIvXCIgKyBpKSkge1xuXHRcdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRmb3IgKGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKGVycm9yID0gdGhpcy52YWxpZGF0ZUFsbChkYXRhW2ldLCBzY2hlbWEuaXRlbXMsIFtpXSwgW1wiaXRlbXNcIl0sIGRhdGFQb2ludGVyUGF0aCArIFwiL1wiICsgaSkpIHtcblx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlT2JqZWN0ID0gZnVuY3Rpb24gdmFsaWRhdGVPYmplY3QoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpIHtcblx0aWYgKHR5cGVvZiBkYXRhICE9PSBcIm9iamVjdFwiIHx8IGRhdGEgPT09IG51bGwgfHwgQXJyYXkuaXNBcnJheShkYXRhKSkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdHJldHVybiB0aGlzLnZhbGlkYXRlT2JqZWN0TWluTWF4UHJvcGVydGllcyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCB0aGlzLnZhbGlkYXRlT2JqZWN0UmVxdWlyZWRQcm9wZXJ0aWVzKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVPYmplY3RQcm9wZXJ0aWVzKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVPYmplY3REZXBlbmRlbmNpZXMoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlT2JqZWN0TWluTWF4UHJvcGVydGllcyA9IGZ1bmN0aW9uIHZhbGlkYXRlT2JqZWN0TWluTWF4UHJvcGVydGllcyhkYXRhLCBzY2hlbWEpIHtcblx0dmFyIGtleXMgPSBPYmplY3Qua2V5cyhkYXRhKTtcblx0dmFyIGVycm9yO1xuXHRpZiAoc2NoZW1hLm1pblByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCkge1xuXHRcdGlmIChrZXlzLmxlbmd0aCA8IHNjaGVtYS5taW5Qcm9wZXJ0aWVzKSB7XG5cdFx0XHRlcnJvciA9IHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5PQkpFQ1RfUFJPUEVSVElFU19NSU5JTVVNLCB7cHJvcGVydHlDb3VudDoga2V5cy5sZW5ndGgsIG1pbmltdW06IHNjaGVtYS5taW5Qcm9wZXJ0aWVzfSkucHJlZml4V2l0aChudWxsLCBcIm1pblByb3BlcnRpZXNcIik7XG5cdFx0XHRpZiAodGhpcy5oYW5kbGVFcnJvcihlcnJvcikpIHtcblx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRpZiAoc2NoZW1hLm1heFByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCkge1xuXHRcdGlmIChrZXlzLmxlbmd0aCA+IHNjaGVtYS5tYXhQcm9wZXJ0aWVzKSB7XG5cdFx0XHRlcnJvciA9IHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5PQkpFQ1RfUFJPUEVSVElFU19NQVhJTVVNLCB7cHJvcGVydHlDb3VudDoga2V5cy5sZW5ndGgsIG1heGltdW06IHNjaGVtYS5tYXhQcm9wZXJ0aWVzfSkucHJlZml4V2l0aChudWxsLCBcIm1heFByb3BlcnRpZXNcIik7XG5cdFx0XHRpZiAodGhpcy5oYW5kbGVFcnJvcihlcnJvcikpIHtcblx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlT2JqZWN0UmVxdWlyZWRQcm9wZXJ0aWVzID0gZnVuY3Rpb24gdmFsaWRhdGVPYmplY3RSZXF1aXJlZFByb3BlcnRpZXMoZGF0YSwgc2NoZW1hKSB7XG5cdGlmIChzY2hlbWEucmVxdWlyZWQgIT09IHVuZGVmaW5lZCkge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc2NoZW1hLnJlcXVpcmVkLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIga2V5ID0gc2NoZW1hLnJlcXVpcmVkW2ldO1xuXHRcdFx0aWYgKGRhdGFba2V5XSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHZhciBlcnJvciA9IHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5PQkpFQ1RfUkVRVUlSRUQsIHtrZXk6IGtleX0pLnByZWZpeFdpdGgobnVsbCwgXCJcIiArIGkpLnByZWZpeFdpdGgobnVsbCwgXCJyZXF1aXJlZFwiKTtcblx0XHRcdFx0aWYgKHRoaXMuaGFuZGxlRXJyb3IoZXJyb3IpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVPYmplY3RQcm9wZXJ0aWVzID0gZnVuY3Rpb24gdmFsaWRhdGVPYmplY3RQcm9wZXJ0aWVzKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKSB7XG5cdHZhciBlcnJvcjtcblx0Zm9yICh2YXIga2V5IGluIGRhdGEpIHtcblx0XHR2YXIga2V5UG9pbnRlclBhdGggPSBkYXRhUG9pbnRlclBhdGggKyBcIi9cIiArIGtleS5yZXBsYWNlKC9+L2csICd+MCcpLnJlcGxhY2UoL1xcLy9nLCAnfjEnKTtcblx0XHR2YXIgZm91bmRNYXRjaCA9IGZhbHNlO1xuXHRcdGlmIChzY2hlbWEucHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICYmIHNjaGVtYS5wcm9wZXJ0aWVzW2tleV0gIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Zm91bmRNYXRjaCA9IHRydWU7XG5cdFx0XHRpZiAoZXJyb3IgPSB0aGlzLnZhbGlkYXRlQWxsKGRhdGFba2V5XSwgc2NoZW1hLnByb3BlcnRpZXNba2V5XSwgW2tleV0sIFtcInByb3BlcnRpZXNcIiwga2V5XSwga2V5UG9pbnRlclBhdGgpKSB7XG5cdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKHNjaGVtYS5wYXR0ZXJuUHJvcGVydGllcyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRmb3IgKHZhciBwYXR0ZXJuS2V5IGluIHNjaGVtYS5wYXR0ZXJuUHJvcGVydGllcykge1xuXHRcdFx0XHR2YXIgcmVnZXhwID0gbmV3IFJlZ0V4cChwYXR0ZXJuS2V5KTtcblx0XHRcdFx0aWYgKHJlZ2V4cC50ZXN0KGtleSkpIHtcblx0XHRcdFx0XHRmb3VuZE1hdGNoID0gdHJ1ZTtcblx0XHRcdFx0XHRpZiAoZXJyb3IgPSB0aGlzLnZhbGlkYXRlQWxsKGRhdGFba2V5XSwgc2NoZW1hLnBhdHRlcm5Qcm9wZXJ0aWVzW3BhdHRlcm5LZXldLCBba2V5XSwgW1wicGF0dGVyblByb3BlcnRpZXNcIiwgcGF0dGVybktleV0sIGtleVBvaW50ZXJQYXRoKSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoIWZvdW5kTWF0Y2gpIHtcblx0XHRcdGlmIChzY2hlbWEuYWRkaXRpb25hbFByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRpZiAodGhpcy50cmFja1Vua25vd25Qcm9wZXJ0aWVzKSB7XG5cdFx0XHRcdFx0dGhpcy5rbm93blByb3BlcnR5UGF0aHNba2V5UG9pbnRlclBhdGhdID0gdHJ1ZTtcblx0XHRcdFx0XHRkZWxldGUgdGhpcy51bmtub3duUHJvcGVydHlQYXRoc1trZXlQb2ludGVyUGF0aF07XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHR5cGVvZiBzY2hlbWEuYWRkaXRpb25hbFByb3BlcnRpZXMgPT09IFwiYm9vbGVhblwiKSB7XG5cdFx0XHRcdFx0aWYgKCFzY2hlbWEuYWRkaXRpb25hbFByb3BlcnRpZXMpIHtcblx0XHRcdFx0XHRcdGVycm9yID0gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLk9CSkVDVF9BRERJVElPTkFMX1BST1BFUlRJRVMsIHt9KS5wcmVmaXhXaXRoKGtleSwgXCJhZGRpdGlvbmFsUHJvcGVydGllc1wiKTtcblx0XHRcdFx0XHRcdGlmICh0aGlzLmhhbmRsZUVycm9yKGVycm9yKSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGlmIChlcnJvciA9IHRoaXMudmFsaWRhdGVBbGwoZGF0YVtrZXldLCBzY2hlbWEuYWRkaXRpb25hbFByb3BlcnRpZXMsIFtrZXldLCBbXCJhZGRpdGlvbmFsUHJvcGVydGllc1wiXSwga2V5UG9pbnRlclBhdGgpKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKHRoaXMudHJhY2tVbmtub3duUHJvcGVydGllcyAmJiAhdGhpcy5rbm93blByb3BlcnR5UGF0aHNba2V5UG9pbnRlclBhdGhdKSB7XG5cdFx0XHRcdHRoaXMudW5rbm93blByb3BlcnR5UGF0aHNba2V5UG9pbnRlclBhdGhdID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKHRoaXMudHJhY2tVbmtub3duUHJvcGVydGllcykge1xuXHRcdFx0dGhpcy5rbm93blByb3BlcnR5UGF0aHNba2V5UG9pbnRlclBhdGhdID0gdHJ1ZTtcblx0XHRcdGRlbGV0ZSB0aGlzLnVua25vd25Qcm9wZXJ0eVBhdGhzW2tleVBvaW50ZXJQYXRoXTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZU9iamVjdERlcGVuZGVuY2llcyA9IGZ1bmN0aW9uIHZhbGlkYXRlT2JqZWN0RGVwZW5kZW5jaWVzKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKSB7XG5cdHZhciBlcnJvcjtcblx0aWYgKHNjaGVtYS5kZXBlbmRlbmNpZXMgIT09IHVuZGVmaW5lZCkge1xuXHRcdGZvciAodmFyIGRlcEtleSBpbiBzY2hlbWEuZGVwZW5kZW5jaWVzKSB7XG5cdFx0XHRpZiAoZGF0YVtkZXBLZXldICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0dmFyIGRlcCA9IHNjaGVtYS5kZXBlbmRlbmNpZXNbZGVwS2V5XTtcblx0XHRcdFx0aWYgKHR5cGVvZiBkZXAgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0XHRpZiAoZGF0YVtkZXBdID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdGVycm9yID0gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLk9CSkVDVF9ERVBFTkRFTkNZX0tFWSwge2tleTogZGVwS2V5LCBtaXNzaW5nOiBkZXB9KS5wcmVmaXhXaXRoKG51bGwsIGRlcEtleSkucHJlZml4V2l0aChudWxsLCBcImRlcGVuZGVuY2llc1wiKTtcblx0XHRcdFx0XHRcdGlmICh0aGlzLmhhbmRsZUVycm9yKGVycm9yKSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoZGVwKSkge1xuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZGVwLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHR2YXIgcmVxdWlyZWRLZXkgPSBkZXBbaV07XG5cdFx0XHRcdFx0XHRpZiAoZGF0YVtyZXF1aXJlZEtleV0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0XHRlcnJvciA9IHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5PQkpFQ1RfREVQRU5ERU5DWV9LRVksIHtrZXk6IGRlcEtleSwgbWlzc2luZzogcmVxdWlyZWRLZXl9KS5wcmVmaXhXaXRoKG51bGwsIFwiXCIgKyBpKS5wcmVmaXhXaXRoKG51bGwsIGRlcEtleSkucHJlZml4V2l0aChudWxsLCBcImRlcGVuZGVuY2llc1wiKTtcblx0XHRcdFx0XHRcdFx0aWYgKHRoaXMuaGFuZGxlRXJyb3IoZXJyb3IpKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGlmIChlcnJvciA9IHRoaXMudmFsaWRhdGVBbGwoZGF0YSwgZGVwLCBbXSwgW1wiZGVwZW5kZW5jaWVzXCIsIGRlcEtleV0sIGRhdGFQb2ludGVyUGF0aCkpIHtcblx0XHRcdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZUNvbWJpbmF0aW9ucyA9IGZ1bmN0aW9uIHZhbGlkYXRlQ29tYmluYXRpb25zKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKSB7XG5cdHJldHVybiB0aGlzLnZhbGlkYXRlQWxsT2YoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZUFueU9mKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVPbmVPZihkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCB0aGlzLnZhbGlkYXRlTm90KGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZUFsbE9mID0gZnVuY3Rpb24gdmFsaWRhdGVBbGxPZihkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aCkge1xuXHRpZiAoc2NoZW1hLmFsbE9mID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHR2YXIgZXJyb3I7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgc2NoZW1hLmFsbE9mLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIHN1YlNjaGVtYSA9IHNjaGVtYS5hbGxPZltpXTtcblx0XHRpZiAoZXJyb3IgPSB0aGlzLnZhbGlkYXRlQWxsKGRhdGEsIHN1YlNjaGVtYSwgW10sIFtcImFsbE9mXCIsIGldLCBkYXRhUG9pbnRlclBhdGgpKSB7XG5cdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVBbnlPZiA9IGZ1bmN0aW9uIHZhbGlkYXRlQW55T2YoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpIHtcblx0aWYgKHNjaGVtYS5hbnlPZiA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0dmFyIGVycm9ycyA9IFtdO1xuXHR2YXIgc3RhcnRFcnJvckNvdW50ID0gdGhpcy5lcnJvcnMubGVuZ3RoO1xuXHR2YXIgb2xkVW5rbm93blByb3BlcnR5UGF0aHMsIG9sZEtub3duUHJvcGVydHlQYXRocztcblx0aWYgKHRoaXMudHJhY2tVbmtub3duUHJvcGVydGllcykge1xuXHRcdG9sZFVua25vd25Qcm9wZXJ0eVBhdGhzID0gdGhpcy51bmtub3duUHJvcGVydHlQYXRocztcblx0XHRvbGRLbm93blByb3BlcnR5UGF0aHMgPSB0aGlzLmtub3duUHJvcGVydHlQYXRocztcblx0fVxuXHR2YXIgZXJyb3JBdEVuZCA9IHRydWU7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgc2NoZW1hLmFueU9mLmxlbmd0aDsgaSsrKSB7XG5cdFx0aWYgKHRoaXMudHJhY2tVbmtub3duUHJvcGVydGllcykge1xuXHRcdFx0dGhpcy51bmtub3duUHJvcGVydHlQYXRocyA9IHt9O1xuXHRcdFx0dGhpcy5rbm93blByb3BlcnR5UGF0aHMgPSB7fTtcblx0XHR9XG5cdFx0dmFyIHN1YlNjaGVtYSA9IHNjaGVtYS5hbnlPZltpXTtcblxuXHRcdHZhciBlcnJvckNvdW50ID0gdGhpcy5lcnJvcnMubGVuZ3RoO1xuXHRcdHZhciBlcnJvciA9IHRoaXMudmFsaWRhdGVBbGwoZGF0YSwgc3ViU2NoZW1hLCBbXSwgW1wiYW55T2ZcIiwgaV0sIGRhdGFQb2ludGVyUGF0aCk7XG5cblx0XHRpZiAoZXJyb3IgPT09IG51bGwgJiYgZXJyb3JDb3VudCA9PT0gdGhpcy5lcnJvcnMubGVuZ3RoKSB7XG5cdFx0XHR0aGlzLmVycm9ycyA9IHRoaXMuZXJyb3JzLnNsaWNlKDAsIHN0YXJ0RXJyb3JDb3VudCk7XG5cblx0XHRcdGlmICh0aGlzLnRyYWNrVW5rbm93blByb3BlcnRpZXMpIHtcblx0XHRcdFx0Zm9yICh2YXIga25vd25LZXkgaW4gdGhpcy5rbm93blByb3BlcnR5UGF0aHMpIHtcblx0XHRcdFx0XHRvbGRLbm93blByb3BlcnR5UGF0aHNba25vd25LZXldID0gdHJ1ZTtcblx0XHRcdFx0XHRkZWxldGUgb2xkVW5rbm93blByb3BlcnR5UGF0aHNba25vd25LZXldO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGZvciAodmFyIHVua25vd25LZXkgaW4gdGhpcy51bmtub3duUHJvcGVydHlQYXRocykge1xuXHRcdFx0XHRcdGlmICghb2xkS25vd25Qcm9wZXJ0eVBhdGhzW3Vua25vd25LZXldKSB7XG5cdFx0XHRcdFx0XHRvbGRVbmtub3duUHJvcGVydHlQYXRoc1t1bmtub3duS2V5XSA9IHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIFdlIG5lZWQgdG8gY29udGludWUgbG9vcGluZyBzbyB3ZSBjYXRjaCBhbGwgdGhlIHByb3BlcnR5IGRlZmluaXRpb25zLCBidXQgd2UgZG9uJ3Qgd2FudCB0byByZXR1cm4gYW4gZXJyb3Jcblx0XHRcdFx0ZXJyb3JBdEVuZCA9IGZhbHNlO1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHRcdGlmIChlcnJvcikge1xuXHRcdFx0ZXJyb3JzLnB1c2goZXJyb3IucHJlZml4V2l0aChudWxsLCBcIlwiICsgaSkucHJlZml4V2l0aChudWxsLCBcImFueU9mXCIpKTtcblx0XHR9XG5cdH1cblx0aWYgKHRoaXMudHJhY2tVbmtub3duUHJvcGVydGllcykge1xuXHRcdHRoaXMudW5rbm93blByb3BlcnR5UGF0aHMgPSBvbGRVbmtub3duUHJvcGVydHlQYXRocztcblx0XHR0aGlzLmtub3duUHJvcGVydHlQYXRocyA9IG9sZEtub3duUHJvcGVydHlQYXRocztcblx0fVxuXHRpZiAoZXJyb3JBdEVuZCkge1xuXHRcdGVycm9ycyA9IGVycm9ycy5jb25jYXQodGhpcy5lcnJvcnMuc2xpY2Uoc3RhcnRFcnJvckNvdW50KSk7XG5cdFx0dGhpcy5lcnJvcnMgPSB0aGlzLmVycm9ycy5zbGljZSgwLCBzdGFydEVycm9yQ291bnQpO1xuXHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuQU5ZX09GX01JU1NJTkcsIHt9LCBcIlwiLCBcIi9hbnlPZlwiLCBlcnJvcnMpO1xuXHR9XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZU9uZU9mID0gZnVuY3Rpb24gdmFsaWRhdGVPbmVPZihkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aCkge1xuXHRpZiAoc2NoZW1hLm9uZU9mID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHR2YXIgdmFsaWRJbmRleCA9IG51bGw7XG5cdHZhciBlcnJvcnMgPSBbXTtcblx0dmFyIHN0YXJ0RXJyb3JDb3VudCA9IHRoaXMuZXJyb3JzLmxlbmd0aDtcblx0dmFyIG9sZFVua25vd25Qcm9wZXJ0eVBhdGhzLCBvbGRLbm93blByb3BlcnR5UGF0aHM7XG5cdGlmICh0aGlzLnRyYWNrVW5rbm93blByb3BlcnRpZXMpIHtcblx0XHRvbGRVbmtub3duUHJvcGVydHlQYXRocyA9IHRoaXMudW5rbm93blByb3BlcnR5UGF0aHM7XG5cdFx0b2xkS25vd25Qcm9wZXJ0eVBhdGhzID0gdGhpcy5rbm93blByb3BlcnR5UGF0aHM7XG5cdH1cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzY2hlbWEub25lT2YubGVuZ3RoOyBpKyspIHtcblx0XHRpZiAodGhpcy50cmFja1Vua25vd25Qcm9wZXJ0aWVzKSB7XG5cdFx0XHR0aGlzLnVua25vd25Qcm9wZXJ0eVBhdGhzID0ge307XG5cdFx0XHR0aGlzLmtub3duUHJvcGVydHlQYXRocyA9IHt9O1xuXHRcdH1cblx0XHR2YXIgc3ViU2NoZW1hID0gc2NoZW1hLm9uZU9mW2ldO1xuXG5cdFx0dmFyIGVycm9yQ291bnQgPSB0aGlzLmVycm9ycy5sZW5ndGg7XG5cdFx0dmFyIGVycm9yID0gdGhpcy52YWxpZGF0ZUFsbChkYXRhLCBzdWJTY2hlbWEsIFtdLCBbXCJvbmVPZlwiLCBpXSwgZGF0YVBvaW50ZXJQYXRoKTtcblxuXHRcdGlmIChlcnJvciA9PT0gbnVsbCAmJiBlcnJvckNvdW50ID09PSB0aGlzLmVycm9ycy5sZW5ndGgpIHtcblx0XHRcdGlmICh2YWxpZEluZGV4ID09PSBudWxsKSB7XG5cdFx0XHRcdHZhbGlkSW5kZXggPSBpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5lcnJvcnMgPSB0aGlzLmVycm9ycy5zbGljZSgwLCBzdGFydEVycm9yQ291bnQpO1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLk9ORV9PRl9NVUxUSVBMRSwge2luZGV4MTogdmFsaWRJbmRleCwgaW5kZXgyOiBpfSwgXCJcIiwgXCIvb25lT2ZcIik7XG5cdFx0XHR9XG5cdFx0XHRpZiAodGhpcy50cmFja1Vua25vd25Qcm9wZXJ0aWVzKSB7XG5cdFx0XHRcdGZvciAodmFyIGtub3duS2V5IGluIHRoaXMua25vd25Qcm9wZXJ0eVBhdGhzKSB7XG5cdFx0XHRcdFx0b2xkS25vd25Qcm9wZXJ0eVBhdGhzW2tub3duS2V5XSA9IHRydWU7XG5cdFx0XHRcdFx0ZGVsZXRlIG9sZFVua25vd25Qcm9wZXJ0eVBhdGhzW2tub3duS2V5XTtcblx0XHRcdFx0fVxuXHRcdFx0XHRmb3IgKHZhciB1bmtub3duS2V5IGluIHRoaXMudW5rbm93blByb3BlcnR5UGF0aHMpIHtcblx0XHRcdFx0XHRpZiAoIW9sZEtub3duUHJvcGVydHlQYXRoc1t1bmtub3duS2V5XSkge1xuXHRcdFx0XHRcdFx0b2xkVW5rbm93blByb3BlcnR5UGF0aHNbdW5rbm93bktleV0gPSB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoZXJyb3IpIHtcblx0XHRcdGVycm9ycy5wdXNoKGVycm9yKTtcblx0XHR9XG5cdH1cblx0aWYgKHRoaXMudHJhY2tVbmtub3duUHJvcGVydGllcykge1xuXHRcdHRoaXMudW5rbm93blByb3BlcnR5UGF0aHMgPSBvbGRVbmtub3duUHJvcGVydHlQYXRocztcblx0XHR0aGlzLmtub3duUHJvcGVydHlQYXRocyA9IG9sZEtub3duUHJvcGVydHlQYXRocztcblx0fVxuXHRpZiAodmFsaWRJbmRleCA9PT0gbnVsbCkge1xuXHRcdGVycm9ycyA9IGVycm9ycy5jb25jYXQodGhpcy5lcnJvcnMuc2xpY2Uoc3RhcnRFcnJvckNvdW50KSk7XG5cdFx0dGhpcy5lcnJvcnMgPSB0aGlzLmVycm9ycy5zbGljZSgwLCBzdGFydEVycm9yQ291bnQpO1xuXHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuT05FX09GX01JU1NJTkcsIHt9LCBcIlwiLCBcIi9vbmVPZlwiLCBlcnJvcnMpO1xuXHR9IGVsc2Uge1xuXHRcdHRoaXMuZXJyb3JzID0gdGhpcy5lcnJvcnMuc2xpY2UoMCwgc3RhcnRFcnJvckNvdW50KTtcblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlTm90ID0gZnVuY3Rpb24gdmFsaWRhdGVOb3QoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpIHtcblx0aWYgKHNjaGVtYS5ub3QgPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdHZhciBvbGRFcnJvckNvdW50ID0gdGhpcy5lcnJvcnMubGVuZ3RoO1xuXHR2YXIgb2xkVW5rbm93blByb3BlcnR5UGF0aHMsIG9sZEtub3duUHJvcGVydHlQYXRocztcblx0aWYgKHRoaXMudHJhY2tVbmtub3duUHJvcGVydGllcykge1xuXHRcdG9sZFVua25vd25Qcm9wZXJ0eVBhdGhzID0gdGhpcy51bmtub3duUHJvcGVydHlQYXRocztcblx0XHRvbGRLbm93blByb3BlcnR5UGF0aHMgPSB0aGlzLmtub3duUHJvcGVydHlQYXRocztcblx0XHR0aGlzLnVua25vd25Qcm9wZXJ0eVBhdGhzID0ge307XG5cdFx0dGhpcy5rbm93blByb3BlcnR5UGF0aHMgPSB7fTtcblx0fVxuXHR2YXIgZXJyb3IgPSB0aGlzLnZhbGlkYXRlQWxsKGRhdGEsIHNjaGVtYS5ub3QsIG51bGwsIG51bGwsIGRhdGFQb2ludGVyUGF0aCk7XG5cdHZhciBub3RFcnJvcnMgPSB0aGlzLmVycm9ycy5zbGljZShvbGRFcnJvckNvdW50KTtcblx0dGhpcy5lcnJvcnMgPSB0aGlzLmVycm9ycy5zbGljZSgwLCBvbGRFcnJvckNvdW50KTtcblx0aWYgKHRoaXMudHJhY2tVbmtub3duUHJvcGVydGllcykge1xuXHRcdHRoaXMudW5rbm93blByb3BlcnR5UGF0aHMgPSBvbGRVbmtub3duUHJvcGVydHlQYXRocztcblx0XHR0aGlzLmtub3duUHJvcGVydHlQYXRocyA9IG9sZEtub3duUHJvcGVydHlQYXRocztcblx0fVxuXHRpZiAoZXJyb3IgPT09IG51bGwgJiYgbm90RXJyb3JzLmxlbmd0aCA9PT0gMCkge1xuXHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuTk9UX1BBU1NFRCwge30sIFwiXCIsIFwiL25vdFwiKTtcblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlSHlwZXJtZWRpYSA9IGZ1bmN0aW9uIHZhbGlkYXRlQ29tYmluYXRpb25zKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKSB7XG5cdGlmICghc2NoZW1hLmxpbmtzKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0dmFyIGVycm9yO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHNjaGVtYS5saW5rcy5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBsZG8gPSBzY2hlbWEubGlua3NbaV07XG5cdFx0aWYgKGxkby5yZWwgPT09IFwiZGVzY3JpYmVkYnlcIikge1xuXHRcdFx0dmFyIHRlbXBsYXRlID0gbmV3IFVyaVRlbXBsYXRlKGxkby5ocmVmKTtcblx0XHRcdHZhciBhbGxQcmVzZW50ID0gdHJ1ZTtcblx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgdGVtcGxhdGUudmFyTmFtZXMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0aWYgKCEodGVtcGxhdGUudmFyTmFtZXNbal0gaW4gZGF0YSkpIHtcblx0XHRcdFx0XHRhbGxQcmVzZW50ID0gZmFsc2U7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmIChhbGxQcmVzZW50KSB7XG5cdFx0XHRcdHZhciBzY2hlbWFVcmwgPSB0ZW1wbGF0ZS5maWxsRnJvbU9iamVjdChkYXRhKTtcblx0XHRcdFx0dmFyIHN1YlNjaGVtYSA9IHtcIiRyZWZcIjogc2NoZW1hVXJsfTtcblx0XHRcdFx0aWYgKGVycm9yID0gdGhpcy52YWxpZGF0ZUFsbChkYXRhLCBzdWJTY2hlbWEsIFtdLCBbXCJsaW5rc1wiLCBpXSwgZGF0YVBvaW50ZXJQYXRoKSkge1xuXHRcdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxufTtcblxuLy8gcGFyc2VVUkkoKSBhbmQgcmVzb2x2ZVVybCgpIGFyZSBmcm9tIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tLzEwODg4NTBcbi8vICAgLSAgcmVsZWFzZWQgYXMgcHVibGljIGRvbWFpbiBieSBhdXRob3IgKFwiWWFmZmxlXCIpIC0gc2VlIGNvbW1lbnRzIG9uIGdpc3RcblxuZnVuY3Rpb24gcGFyc2VVUkkodXJsKSB7XG5cdHZhciBtID0gU3RyaW5nKHVybCkucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpLm1hdGNoKC9eKFteOlxcLz8jXSs6KT8oXFwvXFwvKD86W146QF0qKD86OlteOkBdKik/QCk/KChbXjpcXC8/I10qKSg/OjooXFxkKikpPykpPyhbXj8jXSopKFxcP1teI10qKT8oI1tcXHNcXFNdKik/Lyk7XG5cdC8vIGF1dGhvcml0eSA9ICcvLycgKyB1c2VyICsgJzonICsgcGFzcyAnQCcgKyBob3N0bmFtZSArICc6JyBwb3J0XG5cdHJldHVybiAobSA/IHtcblx0XHRocmVmICAgICA6IG1bMF0gfHwgJycsXG5cdFx0cHJvdG9jb2wgOiBtWzFdIHx8ICcnLFxuXHRcdGF1dGhvcml0eTogbVsyXSB8fCAnJyxcblx0XHRob3N0ICAgICA6IG1bM10gfHwgJycsXG5cdFx0aG9zdG5hbWUgOiBtWzRdIHx8ICcnLFxuXHRcdHBvcnQgICAgIDogbVs1XSB8fCAnJyxcblx0XHRwYXRobmFtZSA6IG1bNl0gfHwgJycsXG5cdFx0c2VhcmNoICAgOiBtWzddIHx8ICcnLFxuXHRcdGhhc2ggICAgIDogbVs4XSB8fCAnJ1xuXHR9IDogbnVsbCk7XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVVcmwoYmFzZSwgaHJlZikgey8vIFJGQyAzOTg2XG5cblx0ZnVuY3Rpb24gcmVtb3ZlRG90U2VnbWVudHMoaW5wdXQpIHtcblx0XHR2YXIgb3V0cHV0ID0gW107XG5cdFx0aW5wdXQucmVwbGFjZSgvXihcXC5cXC4/KFxcL3wkKSkrLywgJycpXG5cdFx0XHQucmVwbGFjZSgvXFwvKFxcLihcXC98JCkpKy9nLCAnLycpXG5cdFx0XHQucmVwbGFjZSgvXFwvXFwuXFwuJC8sICcvLi4vJylcblx0XHRcdC5yZXBsYWNlKC9cXC8/W15cXC9dKi9nLCBmdW5jdGlvbiAocCkge1xuXHRcdFx0XHRpZiAocCA9PT0gJy8uLicpIHtcblx0XHRcdFx0XHRvdXRwdXQucG9wKCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0b3V0cHV0LnB1c2gocCk7XG5cdFx0XHRcdH1cblx0XHR9KTtcblx0XHRyZXR1cm4gb3V0cHV0LmpvaW4oJycpLnJlcGxhY2UoL15cXC8vLCBpbnB1dC5jaGFyQXQoMCkgPT09ICcvJyA/ICcvJyA6ICcnKTtcblx0fVxuXG5cdGhyZWYgPSBwYXJzZVVSSShocmVmIHx8ICcnKTtcblx0YmFzZSA9IHBhcnNlVVJJKGJhc2UgfHwgJycpO1xuXG5cdHJldHVybiAhaHJlZiB8fCAhYmFzZSA/IG51bGwgOiAoaHJlZi5wcm90b2NvbCB8fCBiYXNlLnByb3RvY29sKSArXG5cdFx0KGhyZWYucHJvdG9jb2wgfHwgaHJlZi5hdXRob3JpdHkgPyBocmVmLmF1dGhvcml0eSA6IGJhc2UuYXV0aG9yaXR5KSArXG5cdFx0cmVtb3ZlRG90U2VnbWVudHMoaHJlZi5wcm90b2NvbCB8fCBocmVmLmF1dGhvcml0eSB8fCBocmVmLnBhdGhuYW1lLmNoYXJBdCgwKSA9PT0gJy8nID8gaHJlZi5wYXRobmFtZSA6IChocmVmLnBhdGhuYW1lID8gKChiYXNlLmF1dGhvcml0eSAmJiAhYmFzZS5wYXRobmFtZSA/ICcvJyA6ICcnKSArIGJhc2UucGF0aG5hbWUuc2xpY2UoMCwgYmFzZS5wYXRobmFtZS5sYXN0SW5kZXhPZignLycpICsgMSkgKyBocmVmLnBhdGhuYW1lKSA6IGJhc2UucGF0aG5hbWUpKSArXG5cdFx0KGhyZWYucHJvdG9jb2wgfHwgaHJlZi5hdXRob3JpdHkgfHwgaHJlZi5wYXRobmFtZSA/IGhyZWYuc2VhcmNoIDogKGhyZWYuc2VhcmNoIHx8IGJhc2Uuc2VhcmNoKSkgK1xuXHRcdGhyZWYuaGFzaDtcbn1cblxuZnVuY3Rpb24gZ2V0RG9jdW1lbnRVcmkodXJpKSB7XG5cdHJldHVybiB1cmkuc3BsaXQoJyMnKVswXTtcbn1cbmZ1bmN0aW9uIG5vcm1TY2hlbWEoc2NoZW1hLCBiYXNlVXJpKSB7XG5cdGlmIChzY2hlbWEgJiYgdHlwZW9mIHNjaGVtYSA9PT0gXCJvYmplY3RcIikge1xuXHRcdGlmIChiYXNlVXJpID09PSB1bmRlZmluZWQpIHtcblx0XHRcdGJhc2VVcmkgPSBzY2hlbWEuaWQ7XG5cdFx0fSBlbHNlIGlmICh0eXBlb2Ygc2NoZW1hLmlkID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRiYXNlVXJpID0gcmVzb2x2ZVVybChiYXNlVXJpLCBzY2hlbWEuaWQpO1xuXHRcdFx0c2NoZW1hLmlkID0gYmFzZVVyaTtcblx0XHR9XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkoc2NoZW1hKSkge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzY2hlbWEubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0bm9ybVNjaGVtYShzY2hlbWFbaV0sIGJhc2VVcmkpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAodHlwZW9mIHNjaGVtYVsnJHJlZiddID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdHNjaGVtYVsnJHJlZiddID0gcmVzb2x2ZVVybChiYXNlVXJpLCBzY2hlbWFbJyRyZWYnXSk7XG5cdFx0XHR9XG5cdFx0XHRmb3IgKHZhciBrZXkgaW4gc2NoZW1hKSB7XG5cdFx0XHRcdGlmIChrZXkgIT09IFwiZW51bVwiKSB7XG5cdFx0XHRcdFx0bm9ybVNjaGVtYShzY2hlbWFba2V5XSwgYmFzZVVyaSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cblxudmFyIEVycm9yQ29kZXMgPSB7XG5cdElOVkFMSURfVFlQRTogMCxcblx0RU5VTV9NSVNNQVRDSDogMSxcblx0QU5ZX09GX01JU1NJTkc6IDEwLFxuXHRPTkVfT0ZfTUlTU0lORzogMTEsXG5cdE9ORV9PRl9NVUxUSVBMRTogMTIsXG5cdE5PVF9QQVNTRUQ6IDEzLFxuXHQvLyBOdW1lcmljIGVycm9yc1xuXHROVU1CRVJfTVVMVElQTEVfT0Y6IDEwMCxcblx0TlVNQkVSX01JTklNVU06IDEwMSxcblx0TlVNQkVSX01JTklNVU1fRVhDTFVTSVZFOiAxMDIsXG5cdE5VTUJFUl9NQVhJTVVNOiAxMDMsXG5cdE5VTUJFUl9NQVhJTVVNX0VYQ0xVU0lWRTogMTA0LFxuXHROVU1CRVJfTk9UX0FfTlVNQkVSOiAxMDUsXG5cdC8vIFN0cmluZyBlcnJvcnNcblx0U1RSSU5HX0xFTkdUSF9TSE9SVDogMjAwLFxuXHRTVFJJTkdfTEVOR1RIX0xPTkc6IDIwMSxcblx0U1RSSU5HX1BBVFRFUk46IDIwMixcblx0Ly8gT2JqZWN0IGVycm9yc1xuXHRPQkpFQ1RfUFJPUEVSVElFU19NSU5JTVVNOiAzMDAsXG5cdE9CSkVDVF9QUk9QRVJUSUVTX01BWElNVU06IDMwMSxcblx0T0JKRUNUX1JFUVVJUkVEOiAzMDIsXG5cdE9CSkVDVF9BRERJVElPTkFMX1BST1BFUlRJRVM6IDMwMyxcblx0T0JKRUNUX0RFUEVOREVOQ1lfS0VZOiAzMDQsXG5cdC8vIEFycmF5IGVycm9yc1xuXHRBUlJBWV9MRU5HVEhfU0hPUlQ6IDQwMCxcblx0QVJSQVlfTEVOR1RIX0xPTkc6IDQwMSxcblx0QVJSQVlfVU5JUVVFOiA0MDIsXG5cdEFSUkFZX0FERElUSU9OQUxfSVRFTVM6IDQwMyxcblx0Ly8gQ3VzdG9tL3VzZXItZGVmaW5lZCBlcnJvcnNcblx0Rk9STUFUX0NVU1RPTTogNTAwLFxuXHRLRVlXT1JEX0NVU1RPTTogNTAxLFxuXHQvLyBTY2hlbWEgc3RydWN0dXJlXG5cdENJUkNVTEFSX1JFRkVSRU5DRTogNjAwLFxuXHQvLyBOb24tc3RhbmRhcmQgdmFsaWRhdGlvbiBvcHRpb25zXG5cdFVOS05PV05fUFJPUEVSVFk6IDEwMDBcbn07XG52YXIgRXJyb3JDb2RlTG9va3VwID0ge307XG5mb3IgKHZhciBrZXkgaW4gRXJyb3JDb2Rlcykge1xuXHRFcnJvckNvZGVMb29rdXBbRXJyb3JDb2Rlc1trZXldXSA9IGtleTtcbn1cbnZhciBFcnJvck1lc3NhZ2VzRGVmYXVsdCA9IHtcblx0SU5WQUxJRF9UWVBFOiBcIkludmFsaWQgdHlwZToge3R5cGV9IChleHBlY3RlZCB7ZXhwZWN0ZWR9KVwiLFxuXHRFTlVNX01JU01BVENIOiBcIk5vIGVudW0gbWF0Y2ggZm9yOiB7dmFsdWV9XCIsXG5cdEFOWV9PRl9NSVNTSU5HOiBcIkRhdGEgZG9lcyBub3QgbWF0Y2ggYW55IHNjaGVtYXMgZnJvbSBcXFwiYW55T2ZcXFwiXCIsXG5cdE9ORV9PRl9NSVNTSU5HOiBcIkRhdGEgZG9lcyBub3QgbWF0Y2ggYW55IHNjaGVtYXMgZnJvbSBcXFwib25lT2ZcXFwiXCIsXG5cdE9ORV9PRl9NVUxUSVBMRTogXCJEYXRhIGlzIHZhbGlkIGFnYWluc3QgbW9yZSB0aGFuIG9uZSBzY2hlbWEgZnJvbSBcXFwib25lT2ZcXFwiOiBpbmRpY2VzIHtpbmRleDF9IGFuZCB7aW5kZXgyfVwiLFxuXHROT1RfUEFTU0VEOiBcIkRhdGEgbWF0Y2hlcyBzY2hlbWEgZnJvbSBcXFwibm90XFxcIlwiLFxuXHQvLyBOdW1lcmljIGVycm9yc1xuXHROVU1CRVJfTVVMVElQTEVfT0Y6IFwiVmFsdWUge3ZhbHVlfSBpcyBub3QgYSBtdWx0aXBsZSBvZiB7bXVsdGlwbGVPZn1cIixcblx0TlVNQkVSX01JTklNVU06IFwiVmFsdWUge3ZhbHVlfSBpcyBsZXNzIHRoYW4gbWluaW11bSB7bWluaW11bX1cIixcblx0TlVNQkVSX01JTklNVU1fRVhDTFVTSVZFOiBcIlZhbHVlIHt2YWx1ZX0gaXMgZXF1YWwgdG8gZXhjbHVzaXZlIG1pbmltdW0ge21pbmltdW19XCIsXG5cdE5VTUJFUl9NQVhJTVVNOiBcIlZhbHVlIHt2YWx1ZX0gaXMgZ3JlYXRlciB0aGFuIG1heGltdW0ge21heGltdW19XCIsXG5cdE5VTUJFUl9NQVhJTVVNX0VYQ0xVU0lWRTogXCJWYWx1ZSB7dmFsdWV9IGlzIGVxdWFsIHRvIGV4Y2x1c2l2ZSBtYXhpbXVtIHttYXhpbXVtfVwiLFxuXHROVU1CRVJfTk9UX0FfTlVNQkVSOiBcIlZhbHVlIHt2YWx1ZX0gaXMgbm90IGEgdmFsaWQgbnVtYmVyXCIsXG5cdC8vIFN0cmluZyBlcnJvcnNcblx0U1RSSU5HX0xFTkdUSF9TSE9SVDogXCJTdHJpbmcgaXMgdG9vIHNob3J0ICh7bGVuZ3RofSBjaGFycyksIG1pbmltdW0ge21pbmltdW19XCIsXG5cdFNUUklOR19MRU5HVEhfTE9ORzogXCJTdHJpbmcgaXMgdG9vIGxvbmcgKHtsZW5ndGh9IGNoYXJzKSwgbWF4aW11bSB7bWF4aW11bX1cIixcblx0U1RSSU5HX1BBVFRFUk46IFwiU3RyaW5nIGRvZXMgbm90IG1hdGNoIHBhdHRlcm46IHtwYXR0ZXJufVwiLFxuXHQvLyBPYmplY3QgZXJyb3JzXG5cdE9CSkVDVF9QUk9QRVJUSUVTX01JTklNVU06IFwiVG9vIGZldyBwcm9wZXJ0aWVzIGRlZmluZWQgKHtwcm9wZXJ0eUNvdW50fSksIG1pbmltdW0ge21pbmltdW19XCIsXG5cdE9CSkVDVF9QUk9QRVJUSUVTX01BWElNVU06IFwiVG9vIG1hbnkgcHJvcGVydGllcyBkZWZpbmVkICh7cHJvcGVydHlDb3VudH0pLCBtYXhpbXVtIHttYXhpbXVtfVwiLFxuXHRPQkpFQ1RfUkVRVUlSRUQ6IFwiTWlzc2luZyByZXF1aXJlZCBwcm9wZXJ0eToge2tleX1cIixcblx0T0JKRUNUX0FERElUSU9OQUxfUFJPUEVSVElFUzogXCJBZGRpdGlvbmFsIHByb3BlcnRpZXMgbm90IGFsbG93ZWRcIixcblx0T0JKRUNUX0RFUEVOREVOQ1lfS0VZOiBcIkRlcGVuZGVuY3kgZmFpbGVkIC0ga2V5IG11c3QgZXhpc3Q6IHttaXNzaW5nfSAoZHVlIHRvIGtleToge2tleX0pXCIsXG5cdC8vIEFycmF5IGVycm9yc1xuXHRBUlJBWV9MRU5HVEhfU0hPUlQ6IFwiQXJyYXkgaXMgdG9vIHNob3J0ICh7bGVuZ3RofSksIG1pbmltdW0ge21pbmltdW19XCIsXG5cdEFSUkFZX0xFTkdUSF9MT05HOiBcIkFycmF5IGlzIHRvbyBsb25nICh7bGVuZ3RofSksIG1heGltdW0ge21heGltdW19XCIsXG5cdEFSUkFZX1VOSVFVRTogXCJBcnJheSBpdGVtcyBhcmUgbm90IHVuaXF1ZSAoaW5kaWNlcyB7bWF0Y2gxfSBhbmQge21hdGNoMn0pXCIsXG5cdEFSUkFZX0FERElUSU9OQUxfSVRFTVM6IFwiQWRkaXRpb25hbCBpdGVtcyBub3QgYWxsb3dlZFwiLFxuXHQvLyBGb3JtYXQgZXJyb3JzXG5cdEZPUk1BVF9DVVNUT006IFwiRm9ybWF0IHZhbGlkYXRpb24gZmFpbGVkICh7bWVzc2FnZX0pXCIsXG5cdEtFWVdPUkRfQ1VTVE9NOiBcIktleXdvcmQgZmFpbGVkOiB7a2V5fSAoe21lc3NhZ2V9KVwiLFxuXHQvLyBTY2hlbWEgc3RydWN0dXJlXG5cdENJUkNVTEFSX1JFRkVSRU5DRTogXCJDaXJjdWxhciAkcmVmczoge3VybHN9XCIsXG5cdC8vIE5vbi1zdGFuZGFyZCB2YWxpZGF0aW9uIG9wdGlvbnNcblx0VU5LTk9XTl9QUk9QRVJUWTogXCJVbmtub3duIHByb3BlcnR5IChub3QgaW4gc2NoZW1hKVwiXG59O1xuXG5mdW5jdGlvbiBWYWxpZGF0aW9uRXJyb3IoY29kZSwgbWVzc2FnZSwgcGFyYW1zLCBkYXRhUGF0aCwgc2NoZW1hUGF0aCwgc3ViRXJyb3JzKSB7XG5cdEVycm9yLmNhbGwodGhpcyk7XG5cdGlmIChjb2RlID09PSB1bmRlZmluZWQpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IgKFwiTm8gY29kZSBzdXBwbGllZCBmb3IgZXJyb3I6IFwiKyBtZXNzYWdlKTtcblx0fVxuXHR0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuXHR0aGlzLnBhcmFtcyA9IHBhcmFtcztcblx0dGhpcy5jb2RlID0gY29kZTtcblx0dGhpcy5kYXRhUGF0aCA9IGRhdGFQYXRoIHx8IFwiXCI7XG5cdHRoaXMuc2NoZW1hUGF0aCA9IHNjaGVtYVBhdGggfHwgXCJcIjtcblx0dGhpcy5zdWJFcnJvcnMgPSBzdWJFcnJvcnMgfHwgbnVsbDtcblxuXHR2YXIgZXJyID0gbmV3IEVycm9yKHRoaXMubWVzc2FnZSk7XG5cdHRoaXMuc3RhY2sgPSBlcnIuc3RhY2sgfHwgZXJyLnN0YWNrdHJhY2U7XG5cdGlmICghdGhpcy5zdGFjaykge1xuXHRcdHRyeSB7XG5cdFx0XHR0aHJvdyBlcnI7XG5cdFx0fVxuXHRcdGNhdGNoKGVycikge1xuXHRcdFx0dGhpcy5zdGFjayA9IGVyci5zdGFjayB8fCBlcnIuc3RhY2t0cmFjZTtcblx0XHR9XG5cdH1cbn1cblZhbGlkYXRpb25FcnJvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVycm9yLnByb3RvdHlwZSk7XG5WYWxpZGF0aW9uRXJyb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVmFsaWRhdGlvbkVycm9yO1xuVmFsaWRhdGlvbkVycm9yLnByb3RvdHlwZS5uYW1lID0gJ1ZhbGlkYXRpb25FcnJvcic7XG5cblZhbGlkYXRpb25FcnJvci5wcm90b3R5cGUucHJlZml4V2l0aCA9IGZ1bmN0aW9uIChkYXRhUHJlZml4LCBzY2hlbWFQcmVmaXgpIHtcblx0aWYgKGRhdGFQcmVmaXggIT09IG51bGwpIHtcblx0XHRkYXRhUHJlZml4ID0gZGF0YVByZWZpeC5yZXBsYWNlKC9+L2csIFwifjBcIikucmVwbGFjZSgvXFwvL2csIFwifjFcIik7XG5cdFx0dGhpcy5kYXRhUGF0aCA9IFwiL1wiICsgZGF0YVByZWZpeCArIHRoaXMuZGF0YVBhdGg7XG5cdH1cblx0aWYgKHNjaGVtYVByZWZpeCAhPT0gbnVsbCkge1xuXHRcdHNjaGVtYVByZWZpeCA9IHNjaGVtYVByZWZpeC5yZXBsYWNlKC9+L2csIFwifjBcIikucmVwbGFjZSgvXFwvL2csIFwifjFcIik7XG5cdFx0dGhpcy5zY2hlbWFQYXRoID0gXCIvXCIgKyBzY2hlbWFQcmVmaXggKyB0aGlzLnNjaGVtYVBhdGg7XG5cdH1cblx0aWYgKHRoaXMuc3ViRXJyb3JzICE9PSBudWxsKSB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnN1YkVycm9ycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dGhpcy5zdWJFcnJvcnNbaV0ucHJlZml4V2l0aChkYXRhUHJlZml4LCBzY2hlbWFQcmVmaXgpO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gdGhpcztcbn07XG5cbmZ1bmN0aW9uIGlzVHJ1c3RlZFVybChiYXNlVXJsLCB0ZXN0VXJsKSB7XG5cdGlmKHRlc3RVcmwuc3Vic3RyaW5nKDAsIGJhc2VVcmwubGVuZ3RoKSA9PT0gYmFzZVVybCl7XG5cdFx0dmFyIHJlbWFpbmRlciA9IHRlc3RVcmwuc3Vic3RyaW5nKGJhc2VVcmwubGVuZ3RoKTtcblx0XHRpZiAoKHRlc3RVcmwubGVuZ3RoID4gMCAmJiB0ZXN0VXJsLmNoYXJBdChiYXNlVXJsLmxlbmd0aCAtIDEpID09PSBcIi9cIilcblx0XHRcdHx8IHJlbWFpbmRlci5jaGFyQXQoMCkgPT09IFwiI1wiXG5cdFx0XHR8fCByZW1haW5kZXIuY2hhckF0KDApID09PSBcIj9cIikge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBmYWxzZTtcbn1cblxudmFyIGxhbmd1YWdlcyA9IHt9O1xuZnVuY3Rpb24gY3JlYXRlQXBpKGxhbmd1YWdlKSB7XG5cdHZhciBnbG9iYWxDb250ZXh0ID0gbmV3IFZhbGlkYXRvckNvbnRleHQoKTtcblx0dmFyIGN1cnJlbnRMYW5ndWFnZSA9IGxhbmd1YWdlIHx8ICdlbic7XG5cdHZhciBhcGkgPSB7XG5cdFx0YWRkRm9ybWF0OiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRnbG9iYWxDb250ZXh0LmFkZEZvcm1hdC5hcHBseShnbG9iYWxDb250ZXh0LCBhcmd1bWVudHMpO1xuXHRcdH0sXG5cdFx0bGFuZ3VhZ2U6IGZ1bmN0aW9uIChjb2RlKSB7XG5cdFx0XHRpZiAoIWNvZGUpIHtcblx0XHRcdFx0cmV0dXJuIGN1cnJlbnRMYW5ndWFnZTtcblx0XHRcdH1cblx0XHRcdGlmICghbGFuZ3VhZ2VzW2NvZGVdKSB7XG5cdFx0XHRcdGNvZGUgPSBjb2RlLnNwbGl0KCctJylbMF07IC8vIGZhbGwgYmFjayB0byBiYXNlIGxhbmd1YWdlXG5cdFx0XHR9XG5cdFx0XHRpZiAobGFuZ3VhZ2VzW2NvZGVdKSB7XG5cdFx0XHRcdGN1cnJlbnRMYW5ndWFnZSA9IGNvZGU7XG5cdFx0XHRcdHJldHVybiBjb2RlOyAvLyBzbyB5b3UgY2FuIHRlbGwgaWYgZmFsbC1iYWNrIGhhcyBoYXBwZW5lZFxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0sXG5cdFx0YWRkTGFuZ3VhZ2U6IGZ1bmN0aW9uIChjb2RlLCBtZXNzYWdlTWFwKSB7XG5cdFx0XHR2YXIga2V5O1xuXHRcdFx0Zm9yIChrZXkgaW4gRXJyb3JDb2Rlcykge1xuXHRcdFx0XHRpZiAobWVzc2FnZU1hcFtrZXldICYmICFtZXNzYWdlTWFwW0Vycm9yQ29kZXNba2V5XV0pIHtcblx0XHRcdFx0XHRtZXNzYWdlTWFwW0Vycm9yQ29kZXNba2V5XV0gPSBtZXNzYWdlTWFwW2tleV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHZhciByb290Q29kZSA9IGNvZGUuc3BsaXQoJy0nKVswXTtcblx0XHRcdGlmICghbGFuZ3VhZ2VzW3Jvb3RDb2RlXSkgeyAvLyB1c2UgZm9yIGJhc2UgbGFuZ3VhZ2UgaWYgbm90IHlldCBkZWZpbmVkXG5cdFx0XHRcdGxhbmd1YWdlc1tjb2RlXSA9IG1lc3NhZ2VNYXA7XG5cdFx0XHRcdGxhbmd1YWdlc1tyb290Q29kZV0gPSBtZXNzYWdlTWFwO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0bGFuZ3VhZ2VzW2NvZGVdID0gT2JqZWN0LmNyZWF0ZShsYW5ndWFnZXNbcm9vdENvZGVdKTtcblx0XHRcdFx0Zm9yIChrZXkgaW4gbWVzc2FnZU1hcCkge1xuXHRcdFx0XHRcdGlmICh0eXBlb2YgbGFuZ3VhZ2VzW3Jvb3RDb2RlXVtrZXldID09PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHRcdFx0bGFuZ3VhZ2VzW3Jvb3RDb2RlXVtrZXldID0gbWVzc2FnZU1hcFtrZXldO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRsYW5ndWFnZXNbY29kZV1ba2V5XSA9IG1lc3NhZ2VNYXBba2V5XTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fSxcblx0XHRmcmVzaEFwaTogZnVuY3Rpb24gKGxhbmd1YWdlKSB7XG5cdFx0XHR2YXIgcmVzdWx0ID0gY3JlYXRlQXBpKCk7XG5cdFx0XHRpZiAobGFuZ3VhZ2UpIHtcblx0XHRcdFx0cmVzdWx0Lmxhbmd1YWdlKGxhbmd1YWdlKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fSxcblx0XHR2YWxpZGF0ZTogZnVuY3Rpb24gKGRhdGEsIHNjaGVtYSwgY2hlY2tSZWN1cnNpdmUsIGJhblVua25vd25Qcm9wZXJ0aWVzKSB7XG5cdFx0XHR2YXIgY29udGV4dCA9IG5ldyBWYWxpZGF0b3JDb250ZXh0KGdsb2JhbENvbnRleHQsIGZhbHNlLCBsYW5ndWFnZXNbY3VycmVudExhbmd1YWdlXSwgY2hlY2tSZWN1cnNpdmUsIGJhblVua25vd25Qcm9wZXJ0aWVzKTtcblx0XHRcdGlmICh0eXBlb2Ygc2NoZW1hID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdHNjaGVtYSA9IHtcIiRyZWZcIjogc2NoZW1hfTtcblx0XHRcdH1cblx0XHRcdGNvbnRleHQuYWRkU2NoZW1hKFwiXCIsIHNjaGVtYSk7XG5cdFx0XHR2YXIgZXJyb3IgPSBjb250ZXh0LnZhbGlkYXRlQWxsKGRhdGEsIHNjaGVtYSwgbnVsbCwgbnVsbCwgXCJcIik7XG5cdFx0XHRpZiAoIWVycm9yICYmIGJhblVua25vd25Qcm9wZXJ0aWVzKSB7XG5cdFx0XHRcdGVycm9yID0gY29udGV4dC5iYW5Vbmtub3duUHJvcGVydGllcygpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5lcnJvciA9IGVycm9yO1xuXHRcdFx0dGhpcy5taXNzaW5nID0gY29udGV4dC5taXNzaW5nO1xuXHRcdFx0dGhpcy52YWxpZCA9IChlcnJvciA9PT0gbnVsbCk7XG5cdFx0XHRyZXR1cm4gdGhpcy52YWxpZDtcblx0XHR9LFxuXHRcdHZhbGlkYXRlUmVzdWx0OiBmdW5jdGlvbiAoKSB7XG5cdFx0XHR2YXIgcmVzdWx0ID0ge307XG5cdFx0XHR0aGlzLnZhbGlkYXRlLmFwcGx5KHJlc3VsdCwgYXJndW1lbnRzKTtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fSxcblx0XHR2YWxpZGF0ZU11bHRpcGxlOiBmdW5jdGlvbiAoZGF0YSwgc2NoZW1hLCBjaGVja1JlY3Vyc2l2ZSwgYmFuVW5rbm93blByb3BlcnRpZXMpIHtcblx0XHRcdHZhciBjb250ZXh0ID0gbmV3IFZhbGlkYXRvckNvbnRleHQoZ2xvYmFsQ29udGV4dCwgdHJ1ZSwgbGFuZ3VhZ2VzW2N1cnJlbnRMYW5ndWFnZV0sIGNoZWNrUmVjdXJzaXZlLCBiYW5Vbmtub3duUHJvcGVydGllcyk7XG5cdFx0XHRpZiAodHlwZW9mIHNjaGVtYSA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRzY2hlbWEgPSB7XCIkcmVmXCI6IHNjaGVtYX07XG5cdFx0XHR9XG5cdFx0XHRjb250ZXh0LmFkZFNjaGVtYShcIlwiLCBzY2hlbWEpO1xuXHRcdFx0Y29udGV4dC52YWxpZGF0ZUFsbChkYXRhLCBzY2hlbWEsIG51bGwsIG51bGwsIFwiXCIpO1xuXHRcdFx0aWYgKGJhblVua25vd25Qcm9wZXJ0aWVzKSB7XG5cdFx0XHRcdGNvbnRleHQuYmFuVW5rbm93blByb3BlcnRpZXMoKTtcblx0XHRcdH1cblx0XHRcdHZhciByZXN1bHQgPSB7fTtcblx0XHRcdHJlc3VsdC5lcnJvcnMgPSBjb250ZXh0LmVycm9ycztcblx0XHRcdHJlc3VsdC5taXNzaW5nID0gY29udGV4dC5taXNzaW5nO1xuXHRcdFx0cmVzdWx0LnZhbGlkID0gKHJlc3VsdC5lcnJvcnMubGVuZ3RoID09PSAwKTtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fSxcblx0XHRhZGRTY2hlbWE6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBnbG9iYWxDb250ZXh0LmFkZFNjaGVtYS5hcHBseShnbG9iYWxDb250ZXh0LCBhcmd1bWVudHMpO1xuXHRcdH0sXG5cdFx0Z2V0U2NoZW1hOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gZ2xvYmFsQ29udGV4dC5nZXRTY2hlbWEuYXBwbHkoZ2xvYmFsQ29udGV4dCwgYXJndW1lbnRzKTtcblx0XHR9LFxuXHRcdGdldFNjaGVtYU1hcDogZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIGdsb2JhbENvbnRleHQuZ2V0U2NoZW1hTWFwLmFwcGx5KGdsb2JhbENvbnRleHQsIGFyZ3VtZW50cyk7XG5cdFx0fSxcblx0XHRnZXRTY2hlbWFVcmlzOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gZ2xvYmFsQ29udGV4dC5nZXRTY2hlbWFVcmlzLmFwcGx5KGdsb2JhbENvbnRleHQsIGFyZ3VtZW50cyk7XG5cdFx0fSxcblx0XHRnZXRNaXNzaW5nVXJpczogZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIGdsb2JhbENvbnRleHQuZ2V0TWlzc2luZ1VyaXMuYXBwbHkoZ2xvYmFsQ29udGV4dCwgYXJndW1lbnRzKTtcblx0XHR9LFxuXHRcdGRyb3BTY2hlbWFzOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRnbG9iYWxDb250ZXh0LmRyb3BTY2hlbWFzLmFwcGx5KGdsb2JhbENvbnRleHQsIGFyZ3VtZW50cyk7XG5cdFx0fSxcblx0XHRkZWZpbmVLZXl3b3JkOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRnbG9iYWxDb250ZXh0LmRlZmluZUtleXdvcmQuYXBwbHkoZ2xvYmFsQ29udGV4dCwgYXJndW1lbnRzKTtcblx0XHR9LFxuXHRcdGRlZmluZUVycm9yOiBmdW5jdGlvbiAoY29kZU5hbWUsIGNvZGVOdW1iZXIsIGRlZmF1bHRNZXNzYWdlKSB7XG5cdFx0XHRpZiAodHlwZW9mIGNvZGVOYW1lICE9PSAnc3RyaW5nJyB8fCAhL15bQS1aXSsoX1tBLVpdKykqJC8udGVzdChjb2RlTmFtZSkpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdDb2RlIG5hbWUgbXVzdCBiZSBhIHN0cmluZyBpbiBVUFBFUl9DQVNFX1dJVEhfVU5ERVJTQ09SRVMnKTtcblx0XHRcdH1cblx0XHRcdGlmICh0eXBlb2YgY29kZU51bWJlciAhPT0gJ251bWJlcicgfHwgY29kZU51bWJlciUxICE9PSAwIHx8IGNvZGVOdW1iZXIgPCAxMDAwMCkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0NvZGUgbnVtYmVyIG11c3QgYmUgYW4gaW50ZWdlciA+IDEwMDAwJyk7XG5cdFx0XHR9XG5cdFx0XHRpZiAodHlwZW9mIEVycm9yQ29kZXNbY29kZU5hbWVdICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yIGFscmVhZHkgZGVmaW5lZDogJyArIGNvZGVOYW1lICsgJyBhcyAnICsgRXJyb3JDb2Rlc1tjb2RlTmFtZV0pO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHR5cGVvZiBFcnJvckNvZGVMb29rdXBbY29kZU51bWJlcl0gIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcignRXJyb3IgY29kZSBhbHJlYWR5IHVzZWQ6ICcgKyBFcnJvckNvZGVMb29rdXBbY29kZU51bWJlcl0gKyAnIGFzICcgKyBjb2RlTnVtYmVyKTtcblx0XHRcdH1cblx0XHRcdEVycm9yQ29kZXNbY29kZU5hbWVdID0gY29kZU51bWJlcjtcblx0XHRcdEVycm9yQ29kZUxvb2t1cFtjb2RlTnVtYmVyXSA9IGNvZGVOYW1lO1xuXHRcdFx0RXJyb3JNZXNzYWdlc0RlZmF1bHRbY29kZU5hbWVdID0gRXJyb3JNZXNzYWdlc0RlZmF1bHRbY29kZU51bWJlcl0gPSBkZWZhdWx0TWVzc2FnZTtcblx0XHRcdGZvciAodmFyIGxhbmdDb2RlIGluIGxhbmd1YWdlcykge1xuXHRcdFx0XHR2YXIgbGFuZ3VhZ2UgPSBsYW5ndWFnZXNbbGFuZ0NvZGVdO1xuXHRcdFx0XHRpZiAobGFuZ3VhZ2VbY29kZU5hbWVdKSB7XG5cdFx0XHRcdFx0bGFuZ3VhZ2VbY29kZU51bWJlcl0gPSBsYW5ndWFnZVtjb2RlTnVtYmVyXSB8fCBsYW5ndWFnZVtjb2RlTmFtZV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXHRcdHJlc2V0OiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRnbG9iYWxDb250ZXh0LnJlc2V0KCk7XG5cdFx0XHR0aGlzLmVycm9yID0gbnVsbDtcblx0XHRcdHRoaXMubWlzc2luZyA9IFtdO1xuXHRcdFx0dGhpcy52YWxpZCA9IHRydWU7XG5cdFx0fSxcblx0XHRtaXNzaW5nOiBbXSxcblx0XHRlcnJvcjogbnVsbCxcblx0XHR2YWxpZDogdHJ1ZSxcblx0XHRub3JtU2NoZW1hOiBub3JtU2NoZW1hLFxuXHRcdHJlc29sdmVVcmw6IHJlc29sdmVVcmwsXG5cdFx0Z2V0RG9jdW1lbnRVcmk6IGdldERvY3VtZW50VXJpLFxuXHRcdGVycm9yQ29kZXM6IEVycm9yQ29kZXNcblx0fTtcblx0cmV0dXJuIGFwaTtcbn1cblxudmFyIHR2NCA9IGNyZWF0ZUFwaSgpO1xudHY0LmFkZExhbmd1YWdlKCdlbi1nYicsIEVycm9yTWVzc2FnZXNEZWZhdWx0KTtcblxuLy9sZWdhY3kgcHJvcGVydHlcbnR2NC50djQgPSB0djQ7XG5cbnJldHVybiB0djQ7IC8vIHVzZWQgYnkgX2hlYWRlci5qcyB0byBnbG9iYWxpc2UuXG5cbn0pKTsiLCJ2YXIgXyA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG52YXIgU3RlcHMgPSBbJ3BsYXknLCAnZm9ybScsICdyZXN1bHQnXTtcblxuZnVuY3Rpb24gSW5zdGFudFdpbihDdXJyZW50VXNlciwgU2hpcCkge1xuXG4gIHZhciBDSEFOR0VfRVZFTlQgPSBbXCJTSElQX0NIQU5HRVwiLCBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDAwMDAwMDAwMDApXS5qb2luKCdfJyk7XG5cbiAgdmFyIEFwcFN0YXRlID0ge307XG5cbiAgZnVuY3Rpb24gaW5pdFN0YXRlKHVzZXIsIHNoaXApIHtcbiAgICBBcHBTdGF0ZSA9IHtcbiAgICAgIHNoaXA6IF8ub21pdChzaGlwLCAnc2V0dGluZ3MnLCAncmVzb3VyY2VzJywgJ3RyYW5zbGF0aW9ucycpLFxuICAgICAgc2V0dGluZ3M6IHNoaXAuc2V0dGluZ3MsXG4gICAgICBmb3JtOiBzaGlwLnJlc291cmNlcy5mb3JtLFxuICAgICAgYWNoaWV2ZW1lbnQ6IHNoaXAucmVzb3VyY2VzLmFjaGlldmVtZW50LFxuICAgICAgdHJhbnNsYXRpb25zOiBzaGlwLnRyYW5zbGF0aW9ucyxcbiAgICAgIHVzZXI6IHVzZXIsXG4gICAgICBiYWRnZTogKHNoaXAucmVzb3VyY2VzLmFjaGlldmVtZW50ICYmIHNoaXAucmVzb3VyY2VzLmFjaGlldmVtZW50LmJhZGdlKVxuICAgIH07XG4gICAgZW1pdENoYW5nZSgpO1xuICAgIHJldHVybiBBcHBTdGF0ZTtcbiAgfTtcblxuICBmdW5jdGlvbiBlbWl0Q2hhbmdlKHRtcCkge1xuICAgIHZhciBzID0gZ2V0QXBwU3RhdGUodG1wKTtcbiAgICBIdWxsLmVtaXQoQ0hBTkdFX0VWRU5ULCBzKTtcbiAgfVxuXG5cbiAgLy8gQ3VzdG9taXphdGlvbiBzdXBwb3J0XG5cbiAgZnVuY3Rpb24gdXBkYXRlU2V0dGluZ3Moc2V0dGluZ3MpIHtcbiAgICBBcHBTdGF0ZS5zZXR0aW5ncyA9IHNldHRpbmdzO1xuICAgIGVtaXRDaGFuZ2UoeyBjaGFuZ2VkOiAnc2V0dGluZ3MnIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlVHJhbnNsYXRpb25zKHRyYW5zbGF0aW9ucykge1xuICAgIEFwcFN0YXRlLnRyYW5zbGF0aW9ucyA9IHRyYW5zbGF0aW9ucztcbiAgICBlbWl0Q2hhbmdlKHsgY2hhbmdlZDogJ3RyYW5zbGF0aW9ucycgfSk7XG4gIH1cblxuICAvLyBVc2VyIGFjdGlvbnNcblxuICBmdW5jdGlvbiBwcm9jZXNzRm9ybURhdGEoZm9ybURhdGEpIHtcbiAgICB2YXIgZmllbGRzID0gQXBwU3RhdGUuZm9ybS5maWVsZHNfbGlzdDtcbiAgICB2YXIgcmV0ID0gZmllbGRzLnJlZHVjZShmdW5jdGlvbihkYXRhLCBmaWVsZCkge1xuICAgICAgdmFyIHZhbCA9IGZvcm1EYXRhW2ZpZWxkLm5hbWVdO1xuICAgICAgaWYgKHZhbC50b1N0cmluZygpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgc3dpdGNoIChmaWVsZC5maWVsZF90eXBlKSB7XG4gICAgICAgICAgY2FzZSAnZGF0ZSc6XG4gICAgICAgICAgICByZXMgPSBuZXcgRGF0ZSh2YWwpLnRvSVNPU3RyaW5nKCkuc3Vic3RyaW5nKDAsMTApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJlcyA9IGZvcm1EYXRhW2ZpZWxkLm5hbWVdO1xuICAgICAgICB9XG4gICAgICAgIGRhdGFbZmllbGQubmFtZV0gPSByZXM7XG4gICAgICB9XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9LCB7fSk7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHN1Ym1pdEZvcm0oZm9ybURhdGEpIHtcbiAgICB2YXIgZGF0YSA9IHByb2Nlc3NGb3JtRGF0YShmb3JtRGF0YSk7XG4gICAgZW1pdENoYW5nZSh7IGNoYW5nZWQ6ICdsb2FkaW5nJywgbG9hZGluZzogJ2Zvcm0nIH0pO1xuICAgIEh1bGwuYXBpLnB1dChBcHBTdGF0ZS5mb3JtLmlkICsgXCIvc3VibWl0XCIsIHsgZGF0YTogZGF0YSB9KS50aGVuKGZ1bmN0aW9uKGZvcm0pIHtcbiAgICAgIEFwcFN0YXRlLmZvcm0gPSBmb3JtO1xuICAgICAgZW1pdENoYW5nZSh7IGNoYW5nZWQ6ICdmb3JtJyB9KTtcbiAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGVtaXRDaGFuZ2UoeyBlcnJvcl9tZXNzYWdlOiAnaW52YWxpZF9mb3JtJywgZXJyb3I6IGVyciB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBsYXkocHJvdmlkZXIpIHtcbiAgICBpZiAodXNlckNhblBsYXkoKSkge1xuICAgICAgZW1pdENoYW5nZSh7IGNoYW5nZWQ6ICdsb2FkaW5nJywgbG9hZGluZzogJ2JhZGdlJyB9KTtcbiAgICAgIHJldHVybiBIdWxsLmFwaS5wb3N0KEFwcFN0YXRlLmFjaGlldmVtZW50LmlkICsgXCIvYWNoaWV2ZVwiKS50aGVuKGZ1bmN0aW9uKGJhZGdlKSB7XG4gICAgICAgIEFwcFN0YXRlLmJhZGdlID0gYmFkZ2U7XG4gICAgICAgIGVtaXRDaGFuZ2UoeyBjaGFuZ2VkOiAnYmFkZ2UnIH0pO1xuICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGVtaXRDaGFuZ2UoeyBlcnJvcl9tZXNzYWdlOiAnZXJyb3Jfb25fYWNoaWV2ZScsIGVycm9yOiBlcnIgfSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHByb3ZpZGVyICYmICFBcHBTdGF0ZS51c2VyKSB7XG4gICAgICBsb2dpbkFuZFBsYXkocHJvdmlkZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbWl0Q2hhbmdlKHsgZXJyb3JfbWVzc2FnZTogJ3VzZXJfY2Fubm90X3BsYXknIH0pO1xuICAgIH1cbiAgfVxuXG4gIHZhciBhdXRvUGxheSA9IGZhbHNlO1xuICBmdW5jdGlvbiBsb2dpbkFuZFBsYXkocHJvdmlkZXIsIG9wdGlvbnMpIHtcbiAgICBpZiAocHJvdmlkZXIpIHtcbiAgICAgIGF1dG9QbGF5ID0gdHJ1ZTtcbiAgICAgIGVtaXRDaGFuZ2UoeyBpc0xvZ2dpbmdJbjogdHJ1ZSB9KTtcbiAgICAgIEh1bGwubG9naW4ocHJvdmlkZXIsIG9wdGlvbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBcIltJbnN0YW50V2luXSBFcnJvciBpbiBsb2dpbkFuZFBsYXkgbWV0aG9kOiBtaXNzaW5nIGBwcm92aWRlcmBcIjtcbiAgICB9XG4gIH1cblxuICAvLyBTdGF0ZSBtYW5hZ2VtZW50XG5cbiAgZnVuY3Rpb24gZ2V0QXBwU3RhdGUodG1wKSB7XG4gICAgdmFyIHN0ZXAgPSBjdXJyZW50U3RlcCgpO1xuICAgIHZhciByZXQgPSBfLmV4dGVuZCh7fSwgQXBwU3RhdGUsIHtcbiAgICAgIHVzZXJDYW5QbGF5OiB1c2VyQ2FuUGxheSgpLFxuICAgICAgdXNlckhhc1BsYXllZDogdXNlckhhc1BsYXllZCgpLFxuICAgICAgdXNlckhhc1dvbjogdXNlckhhc1dvbigpLFxuICAgICAgY3VycmVudFN0ZXA6IHN0ZXAsXG4gICAgICBjdXJyZW50U3RlcEluZGV4OiBzdGVwSW5kZXgoc3RlcCksXG4gICAgICBpc0Zvcm1Db21wbGV0ZTogaXNGb3JtQ29tcGxldGUoKSxcbiAgICB9LCB0bXApO1xuICAgIHJldHVybiBfLmRlZXBDbG9uZShyZXQpO1xuICB9XG5cbiAgZnVuY3Rpb24gdXNlckNhblBsYXkoKSB7XG4gICAgcmV0dXJuIGNhblBsYXkoKSA9PT0gdHJ1ZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNhblBsYXkoKSB7XG4gICAgaWYgKCFBcHBTdGF0ZS51c2VyKSByZXR1cm4gXCJObyBjdXJyZW50IHVzZXJcIjtcbiAgICBpZiAodXNlckhhc1dvbigpKSByZXR1cm4gXCJBbHJlYWR5IHdvblwiO1xuICAgIHZhciBiYWRnZSA9IEFwcFN0YXRlLmJhZGdlO1xuICAgIGlmICghYmFkZ2UgfHwgIWJhZGdlLmRhdGEuYXR0ZW1wdHMpIHJldHVybiB0cnVlO1xuICAgIHZhciBkID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpLnNsaWNlKDAsIDEwKTtcbiAgICBpZiAoYmFkZ2UuZGF0YS5hdHRlbXB0c1tkXSkge1xuICAgICAgcmV0dXJuIFwiT25lIGF0dGVtcHQgYWxyZWFkeSB0b2RheVwiO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB1c2VySGFzUGxheWVkKCkge1xuICAgIHJldHVybiAhIUFwcFN0YXRlLmJhZGdlO1xuICB9XG5cbiAgZnVuY3Rpb24gdXNlckhhc1dvbigpIHtcbiAgICB2YXIgYmFkZ2UgPSBBcHBTdGF0ZS5iYWRnZTtcbiAgICBpZiAoIWJhZGdlIHx8ICFiYWRnZS5kYXRhKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIGJhZGdlLmRhdGEud2lubmVyID09PSB0cnVlO1xuICB9XG5cbiAgZnVuY3Rpb24gY3VycmVudFN0ZXAoKSB7XG4gICAgaWYgKCFBcHBTdGF0ZS51c2VyIHx8IHVzZXJDYW5QbGF5KCkpIHJldHVybiAncGxheSc7XG4gICAgaWYgKCFpc0Zvcm1Db21wbGV0ZSgpKSByZXR1cm4gJ2Zvcm0nO1xuICAgIHJldHVybiAncmVzdWx0JztcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0ZXBJbmRleChzdGVwKSB7XG4gICAgcmV0dXJuIFN0ZXBzLmluZGV4T2Yoc3RlcCk7XG4gIH1cblxuICBmdW5jdGlvbiBpc0Zvcm1Db21wbGV0ZSgpIHtcbiAgICBpZiAoIUFwcFN0YXRlLnVzZXIpIHJldHVybiBmYWxzZTtcbiAgICB2YXIgZmllbGRzID0gQXBwU3RhdGUuZm9ybSAmJiBBcHBTdGF0ZS5mb3JtLmZpZWxkc19saXN0O1xuICAgIHZhciByZXQgPSBBcHBTdGF0ZS5mb3JtLnVzZXJfZGF0YS5jcmVhdGVkX2F0ICYmIGZpZWxkcyAmJiBmaWVsZHMucmVkdWNlKGZ1bmN0aW9uKHJlcywgZmllbGQpIHtcbiAgICAgIHJldHVybiByZXMgJiYgISFmaWVsZC52YWx1ZTtcbiAgICB9LCB0cnVlKTtcbiAgICByZXR1cm4gcmV0IHx8IGZhbHNlO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgaWYgKEFwcFN0YXRlLnVzZXIuaXNfYWRtaW4pIHtcbiAgICAgIGVtaXRDaGFuZ2UoeyBsb2FkaW5nOiAncmVzZXQnIH0pO1xuICAgICAgaWYgKEFwcFN0YXRlLmJhZGdlICYmIEFwcFN0YXRlLmJhZGdlLmlkKSB7XG4gICAgICAgIEh1bGwuYXBpKEFwcFN0YXRlLmJhZGdlLmlkLCAnZGVsZXRlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgQXBwU3RhdGUuYmFkZ2UgPSBudWxsO1xuICAgICAgICAgIEh1bGwuYXBpKEFwcFN0YXRlLmZvcm0uaWQgKyAnL3N1Ym1pdCcsICdkZWxldGUnLCBmdW5jdGlvbihmb3JtKSB7XG4gICAgICAgICAgICBBcHBTdGF0ZS5mb3JtID0gZm9ybTtcbiAgICAgICAgICAgIGVtaXRDaGFuZ2UoeyBjaGFuZ2VkOiAncmVzZXQnIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oXCJFcnJvcjogXCIsIGVycik7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZW1pdENoYW5nZSh7IGNoYW5nZWQ6ICdyZXNldCcgfSk7XG4gICAgICAgIHRocm93IFwiW0luc3RhbnRXaW5dIE5vIGJhZGdlIGZvdW5kIGhlcmUuLi5cIjtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgXCJbSW5zdGFudFdpbl0gWW91IG5lZWQgdG8gYmUgYSBhZG1pbmlzdHJhdG9yIHRvIHJlc2V0IGJhZGdlc1wiO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHRyYW5zbGF0ZShsYW5nKSB7XG4gICAgdmFyIHJldCA9IEFwcFN0YXRlLnRyYW5zbGF0aW9uc1tsYW5nXSB8fCBBcHBTdGF0ZS50cmFuc2xhdGlvbnNbJ2VuJ10gfHwge307XG4gICAgdmFyIHJlc3VsdCA9IE9iamVjdC5rZXlzKHJldCkucmVkdWNlKGZ1bmN0aW9uKHRyLCBrKSB7XG4gICAgICB2YXIgdCA9IHJldFtrXTtcbiAgICAgIGlmICh0ICYmIHQubGVuZ3RoID4gMCkge1xuICAgICAgICB0cltrXSA9IHQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHI7XG4gICAgfSwge30pO1xuICAgIGNvbnNvbGUud2FybihcInRyYW5zbGF0aW9uczogXCIsIGxhbmcsIHJlc3VsdCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uQXV0aEV2ZW50KCkge1xuICAgIGVtaXRDaGFuZ2UoeyBjaGFuZ2VkOiAnbG9hZGluZycsIGxvYWRpbmc6ICdzaGlwJyB9KTtcbiAgICBIdWxsLmFwaShTaGlwLmlkLCB7IGZpZWxkczogJ2JhZGdlJyB9KS50aGVuKGZ1bmN0aW9uKHNoaXApIHtcbiAgICAgIGluaXRTdGF0ZShIdWxsLmN1cnJlbnRVc2VyKCksIHNoaXApO1xuICAgICAgaWYgKGF1dG9QbGF5ICYmIHVzZXJDYW5QbGF5KCkpIHBsYXkoKTtcbiAgICAgIGF1dG9QbGF5ID0gZmFsc2U7XG4gICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICBlbWl0Q2hhbmdlKHsgZXJyb3JfbWVzc2FnZTogJ3NoaXBfbm90X2ZvdW5kJywgZXJyb3I6IGVyciB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIEh1bGwub24oJ2h1bGwuYXV0aC5sb2dpbicsICBvbkF1dGhFdmVudCk7XG4gIEh1bGwub24oJ2h1bGwuYXV0aC5sb2dvdXQnLCBvbkF1dGhFdmVudCk7XG4gIEh1bGwub24oJ2h1bGwuYXV0aC5mYWlsJywgb25BdXRoRXZlbnQpO1xuXG4gIHZhciBfbGlzdGVuZXJzID0gW107XG5cbiAgLy8gUHVibGljIEFQSVxuXG4gIHRoaXMub25DaGFuZ2UgPSBmdW5jdGlvbihjYikge1xuICAgIHZhciBjYWxsYmFjayA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBjYi5hcHBseSh1bmRlZmluZWQsIGFyZ3MpO1xuICAgICAgfSlcbiAgICB9O1xuICAgIF9saXN0ZW5lcnMucHVzaChjYWxsYmFjayk7XG4gICAgSHVsbC5vbihDSEFOR0VfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfTtcblxuICB0aGlzLnRlYXJkb3duID0gZnVuY3Rpb24oKSB7XG4gICAgSHVsbC5vZmYoJ2h1bGwuYXV0aC5sb2dpbicsICBvbkF1dGhFdmVudCk7XG4gICAgSHVsbC5vZmYoJ2h1bGwuYXV0aC5sb2dvdXQnLCBvbkF1dGhFdmVudCk7XG4gICAgSHVsbC5vZmYoJ2h1bGwuYXV0aC5mYWlsJywgb25BdXRoRXZlbnQpO1xuICAgIGZvciAodmFyIGw9MDsgbCA8IF9saXN0ZW5lcnMubGVuZ3RoOyBsKyspIHtcbiAgICAgIEh1bGwub2ZmKENIQU5HRV9FVkVOVCwgbGlzdGVuZXJzW2xdKTtcbiAgICB9XG4gIH07XG5cbiAgdGhpcy5nZXRTdGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBnZXRBcHBTdGF0ZSgpO1xuICB9O1xuXG4gIHRoaXMucGxheSAgICAgICAgID0gcGxheTtcbiAgdGhpcy5yZXNldCAgICAgICAgPSByZXNldDtcbiAgdGhpcy5zdWJtaXRGb3JtICAgPSBzdWJtaXRGb3JtO1xuICB0aGlzLnRyYW5zbGF0ZSAgICA9IHRyYW5zbGF0ZTtcblxuICBpZiAoU2hpcCkge1xuICAgIGluaXRTdGF0ZShDdXJyZW50VXNlciwgU2hpcCk7XG4gIH1cblxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgZnVuY3Rpb24oZSkge1xuICAgIHZhciBtZXNzYWdlID0gZS5kYXRhO1xuICAgIGlmIChtZXNzYWdlICYmIG1lc3NhZ2UuZXZlbnQgPT09IFwic2hpcC51cGRhdGVcIikge1xuICAgICAgdXBkYXRlU2V0dGluZ3MobWVzc2FnZS5zaGlwLnNldHRpbmdzKTtcbiAgICAgIHVwZGF0ZVRyYW5zbGF0aW9ucyhtZXNzYWdlLnNoaXAudHJhbnNsYXRpb25zIHx8IHt9KTtcbiAgICB9XG4gIH0sIGZhbHNlKTtcblxufTtcblxuXG5cbkluc3RhbnRXaW4uU3RlcHMgPSBTdGVwcztcblxubW9kdWxlLmV4cG9ydHMgPSBJbnN0YW50V2luO1xuIiwiYW5ndWxhci5tb2R1bGUoJ3NjaGVtYUZvcm0nKS5jb25maWcoXG5bJ3NjaGVtYUZvcm1Qcm92aWRlcicsICdzY2hlbWFGb3JtRGVjb3JhdG9yc1Byb3ZpZGVyJywgJ3NmUGF0aFByb3ZpZGVyJyxcbiAgZnVuY3Rpb24oc2NoZW1hRm9ybVByb3ZpZGVyLCAgc2NoZW1hRm9ybURlY29yYXRvcnNQcm92aWRlciwgc2ZQYXRoUHJvdmlkZXIpIHtcblxuICAgIHZhciBkYXRlcGlja2VyID0gZnVuY3Rpb24obmFtZSwgc2NoZW1hLCBvcHRpb25zKSB7XG4gICAgICBpZiAoc2NoZW1hLnR5cGUgPT09ICdzdHJpbmcnICYmIChzY2hlbWEuZm9ybWF0ID09PSAnZGF0ZScgfHwgc2NoZW1hLmZvcm1hdCA9PT0gJ2RhdGUtdGltZScpKSB7XG4gICAgICAgIHZhciBmID0gc2NoZW1hRm9ybVByb3ZpZGVyLnN0ZEZvcm1PYmoobmFtZSwgc2NoZW1hLCBvcHRpb25zKTtcbiAgICAgICAgZi5rZXkgID0gb3B0aW9ucy5wYXRoO1xuICAgICAgICBmLnR5cGUgPSAnZGF0ZXBpY2tlcic7XG4gICAgICAgIG9wdGlvbnMubG9va3VwW3NmUGF0aFByb3ZpZGVyLnN0cmluZ2lmeShvcHRpb25zLnBhdGgpXSA9IGY7XG4gICAgICAgIHJldHVybiBmO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBzY2hlbWFGb3JtUHJvdmlkZXIuZGVmYXVsdHMuc3RyaW5nLnVuc2hpZnQoZGF0ZXBpY2tlcik7XG5cbiAgICAvL0FkZCB0byB0aGUgRm91bmRhdGlvbiBkaXJlY3RpdmVcbiAgICBzY2hlbWFGb3JtRGVjb3JhdG9yc1Byb3ZpZGVyLmFkZE1hcHBpbmcoXG4gICAgICAnZm91bmRhdGlvbkRlY29yYXRvcicsXG4gICAgICAnZGF0ZXBpY2tlcicsXG4gICAgICAnZGlyZWN0aXZlcy9kZWNvcmF0b3JzL2ZvdW5kYXRpb24vZGF0ZXBpY2tlci5odG1sJ1xuICAgICk7XG4gICAgc2NoZW1hRm9ybURlY29yYXRvcnNQcm92aWRlci5jcmVhdGVEaXJlY3RpdmUoXG4gICAgICAnZGF0ZXBpY2tlcicsXG4gICAgICAnZGlyZWN0aXZlcy9kZWNvcmF0b3JzL2ZvdW5kYXRpb24vZGF0ZXBpY2tlci5odG1sJ1xuICAgICk7XG4gIH1cbl0pO1xuIiwicmVxdWlyZSgnLi9mb3VuZGF0aW9uLWRlY29yYXRvci1kYXRlcGlja2VyJyk7XG5hbmd1bGFyLm1vZHVsZSgnc2NoZW1hRm9ybScpLmNvbmZpZyhbJ3NjaGVtYUZvcm1EZWNvcmF0b3JzUHJvdmlkZXInLCBmdW5jdGlvbihkZWNvcmF0b3JzUHJvdmlkZXIpIHtcbiAgdmFyIGJhc2UgPSAnZGlyZWN0aXZlcy9kZWNvcmF0b3JzL2ZvdW5kYXRpb24vJztcblxuICBkZWNvcmF0b3JzUHJvdmlkZXIuY3JlYXRlRGVjb3JhdG9yKCdmb3VuZGF0aW9uRGVjb3JhdG9yJywge1xuICAgIHRleHRhcmVhOiBiYXNlICsgJ3RleHRhcmVhLmh0bWwnLFxuICAgIGZpZWxkc2V0OiBiYXNlICsgJ2ZpZWxkc2V0Lmh0bWwnLFxuICAgIGFycmF5OiBiYXNlICsgJ2FycmF5Lmh0bWwnLFxuICAgIHRhYmFycmF5OiBiYXNlICsgJ3RhYmFycmF5Lmh0bWwnLFxuICAgIHRhYnM6IGJhc2UgKyAndGFicy5odG1sJyxcbiAgICBzZWN0aW9uOiBiYXNlICsgJ3NlY3Rpb24uaHRtbCcsXG4gICAgY29uZGl0aW9uYWw6IGJhc2UgKyAnc2VjdGlvbi5odG1sJyxcbiAgICBhY3Rpb25zOiBiYXNlICsgJ2FjdGlvbnMuaHRtbCcsXG4gICAgZGF0ZXBpY2tlcjogYmFzZSArICdkYXRlcGlja2VyLmh0bWwnLFxuICAgIHNlbGVjdDogYmFzZSArICdzZWxlY3QuaHRtbCcsXG4gICAgY2hlY2tib3g6IGJhc2UgKyAnY2hlY2tib3guaHRtbCcsXG4gICAgY2hlY2tib3hlczogYmFzZSArICdjaGVja2JveGVzLmh0bWwnLFxuICAgIG51bWJlcjogYmFzZSArICdkZWZhdWx0Lmh0bWwnLFxuICAgIHBhc3N3b3JkOiBiYXNlICsgJ2RlZmF1bHQuaHRtbCcsXG4gICAgc3VibWl0OiBiYXNlICsgJ3N1Ym1pdC5odG1sJyxcbiAgICBidXR0b246IGJhc2UgKyAnc3VibWl0Lmh0bWwnLFxuICAgIHJhZGlvczogYmFzZSArICdyYWRpb3MuaHRtbCcsXG4gICAgJ3JhZGlvcy1pbmxpbmUnOiBiYXNlICsgJ3JhZGlvcy1pbmxpbmUuaHRtbCcsXG4gICAgcmFkaW9idXR0b25zOiBiYXNlICsgJ3JhZGlvLWJ1dHRvbnMuaHRtbCcsXG4gICAgaGVscDogYmFzZSArICdoZWxwLmh0bWwnLFxuICAgICdkZWZhdWx0JzogYmFzZSArICdkZWZhdWx0Lmh0bWwnXG4gIH0sIFtcbiAgICBmdW5jdGlvbihmb3JtKSB7XG4gICAgICBpZiAoZm9ybS5yZWFkb25seSAmJiBmb3JtLmtleSAmJiBmb3JtLnR5cGUgIT09ICdmaWVsZHNldCcpIHtcbiAgICAgICAgcmV0dXJuIGJhc2UgKyAncmVhZG9ubHkuaHRtbCc7XG4gICAgICB9XG4gICAgfVxuICBdLCB7IGNsYXNzTmFtZTogXCJyb3dcIiB9KTtcblxuICAvL21hbnVhbCB1c2UgZGlyZWN0aXZlc1xuICBkZWNvcmF0b3JzUHJvdmlkZXIuY3JlYXRlRGlyZWN0aXZlcyh7XG4gICAgdGV4dGFyZWE6IGJhc2UgKyAndGV4dGFyZWEuaHRtbCcsXG4gICAgc2VsZWN0OiBiYXNlICsgJ3NlbGVjdC5odG1sJyxcbiAgICBjaGVja2JveDogYmFzZSArICdjaGVja2JveC5odG1sJyxcbiAgICBjaGVja2JveGVzOiBiYXNlICsgJ2NoZWNrYm94ZXMuaHRtbCcsXG4gICAgbnVtYmVyOiBiYXNlICsgJ2RlZmF1bHQuaHRtbCcsXG4gICAgc3VibWl0OiBiYXNlICsgJ3N1Ym1pdC5odG1sJyxcbiAgICBidXR0b246IGJhc2UgKyAnc3VibWl0Lmh0bWwnLFxuICAgIHRleHQ6IGJhc2UgKyAnZGVmYXVsdC5odG1sJyxcbiAgICBkYXRlOiBiYXNlICsgJ2RlZmF1bHQuaHRtbCcsXG4gICAgcGFzc3dvcmQ6IGJhc2UgKyAnZGVmYXVsdC5odG1sJyxcbiAgICBkYXRlcGlja2VyOiBiYXNlICsgJ2RhdGVwaWNrZXIuaHRtbCcsXG4gICAgaW5wdXQ6IGJhc2UgKyAnZGVmYXVsdC5odG1sJyxcbiAgICByYWRpb3M6IGJhc2UgKyAncmFkaW9zLmh0bWwnLFxuICAgICdyYWRpb3MtaW5saW5lJzogYmFzZSArICdyYWRpb3MtaW5saW5lLmh0bWwnLFxuICAgIHJhZGlvYnV0dG9uczogYmFzZSArICdyYWRpby1idXR0b25zLmh0bWwnLFxuICB9KTtcblxufV0pLmRpcmVjdGl2ZSgnc2ZGaWVsZHNldCcsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgc2NvcGU6IHRydWUsXG4gICAgdGVtcGxhdGVVcmw6ICdkaXJlY3RpdmVzL2RlY29yYXRvcnMvZm91bmRhdGlvbi9maWVsZHNldC10cmNsLmh0bWwnLFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgc2NvcGUudGl0bGUgPSBzY29wZS4kZXZhbChhdHRycy50aXRsZSk7XG4gICAgfVxuICB9O1xufSk7XG4iLCJmdW5jdGlvbiBpc09iamVjdChvYmopIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2Ygb2JqO1xuICByZXR1cm4gdHlwZSA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlID09PSAnb2JqZWN0JyAmJiAhIW9iajtcbn07XG5cblxuIGZ1bmN0aW9uIGV4dGVuZChvYmopIHtcbiAgaWYgKCFpc09iamVjdChvYmopKSByZXR1cm4gb2JqO1xuICB2YXIgc291cmNlLCBwcm9wO1xuICBmb3IgKHZhciBpID0gMSwgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgc291cmNlID0gYXJndW1lbnRzW2ldO1xuICAgIGZvciAocHJvcCBpbiBzb3VyY2UpIHtcbiAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwgcHJvcCkpIHtcbiAgICAgICAgICBvYmpbcHJvcF0gPSBzb3VyY2VbcHJvcF07XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBvYmo7XG59O1xuXG5mdW5jdGlvbiBvbWl0KG9iaiAvKiBrZXlzICovKSB7XG4gIHZhciB3aXRob3V0S2V5cyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgcmV0dXJuIG9iaiAmJiBPYmplY3Qua2V5cyhvYmopLnJlZHVjZShmdW5jdGlvbihzLCBrKSB7XG4gICAgaWYgKHdpdGhvdXRLZXlzLmluZGV4T2YoaykgPT09IC0xKSBzW2tdID0gb2JqW2tdXG4gICAgcmV0dXJuIHM7XG4gIH0sIHt9KTtcbn07XG5cbmZ1bmN0aW9uIGRlZXBDbG9uZShvYmopIHtcbiAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob2JqKSk7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGV4dGVuZDogZXh0ZW5kLFxuICBvbWl0OiBvbWl0LFxuICBpc09iamVjdDogaXNPYmplY3QsXG4gIGRlZXBDbG9uZTogZGVlcENsb25lXG59O1xuIl19
