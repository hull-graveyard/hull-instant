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
      console.warn('Change !', instant);
      $scope.$apply(function() {
        $scope.instant = instant;
        setStyles(instant.settings);
        console.warn("Refreshing translations...");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvamF2YXNjcmlwdC9hcHAuanMiLCJub2RlX21vZHVsZXMvYW5ndWxhci1kYXRlcGlja2VyL2J1aWxkL2FuZ3VsYXItZGF0ZXBpY2tlci5qcyIsIm5vZGVfbW9kdWxlcy9hbmd1bGFyLXNjaGVtYS1mb3JtL2Rpc3Qvc2NoZW1hLWZvcm0uanMiLCJub2RlX21vZHVsZXMvYW5ndWxhci10cmFuc2xhdGUvZGlzdC9hbmd1bGFyLXRyYW5zbGF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9vYmplY3RwYXRoL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL29iamVjdHBhdGgvbGliL09iamVjdFBhdGguanMiLCJub2RlX21vZHVsZXMvdHY0L3R2NC5qcyIsInNyYy9qYXZhc2NyaXB0L2luc3RhbnQuanMiLCJzcmMvamF2YXNjcmlwdC9zY2hlbWEtZm9ybS9mb3VuZGF0aW9uLWRlY29yYXRvci1kYXRlcGlja2VyLmpzIiwic3JjL2phdmFzY3JpcHQvc2NoZW1hLWZvcm0vZm91bmRhdGlvbi1kZWNvcmF0b3IuanMiLCJzcmMvamF2YXNjcmlwdC91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0NENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvN0JBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIEluc3RhbnRXaW4gPSByZXF1aXJlKCcuL2luc3RhbnQnKTtcbnZhciBTdGVwcyA9IEluc3RhbnRXaW4uU3RlcHM7XG52YXIgZGVmYXVsdFN0ZXAgPSBTdGVwc1swXTtcblxud2luZG93LnR2NCA9IHJlcXVpcmUoJ3R2NCcpO1xudmFyIE9iamVjdFBhdGggPSByZXF1aXJlKCdvYmplY3RwYXRoJyk7XG5cbnRyeSB7XG4gIGFuZ3VsYXIubW9kdWxlKCdPYmplY3RQYXRoJywgW10pLnByb3ZpZGVyKCdPYmplY3RQYXRoJywgZnVuY3Rpb24oKXtcbiAgICB0aGlzLnBhcnNlID0gT2JqZWN0UGF0aC5wYXJzZTtcbiAgICB0aGlzLnN0cmluZ2lmeSA9IE9iamVjdFBhdGguc3RyaW5naWZ5O1xuICAgIHRoaXMubm9ybWFsaXplID0gT2JqZWN0UGF0aC5ub3JtYWxpemU7XG4gICAgdGhpcy4kZ2V0ID0gZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBPYmplY3RQYXRoO1xuICAgIH07XG4gIH0pO1xufSBjYXRjaChlKSB7fVxuXG5yZXF1aXJlKCdhbmd1bGFyLXNjaGVtYS1mb3JtL2Rpc3Qvc2NoZW1hLWZvcm0nKTtcbnJlcXVpcmUoJy4vc2NoZW1hLWZvcm0vZm91bmRhdGlvbi1kZWNvcmF0b3InKTtcbnJlcXVpcmUoJy4vc2NoZW1hLWZvcm0vZm91bmRhdGlvbi1kZWNvcmF0b3ItZGF0ZXBpY2tlcicpO1xucmVxdWlyZSgnYW5ndWxhci1kYXRlcGlja2VyL2J1aWxkL2FuZ3VsYXItZGF0ZXBpY2tlcicpO1xucmVxdWlyZSgnYW5ndWxhci10cmFuc2xhdGUnKTtcblxudmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdodWxsLWluc3RhbnQnLCBbJ25nQW5pbWF0ZScsICdzY2hlbWFGb3JtJywgJ2FuZ3VsYXItZGF0ZXBpY2tlcicsICdwYXNjYWxwcmVjaHQudHJhbnNsYXRlJ10pXG5cbi5jb25maWcoW1wiJHRyYW5zbGF0ZVByb3ZpZGVyXCIsIGZ1bmN0aW9uICgkdHJhbnNsYXRlUHJvdmlkZXIpIHtcbiAgJHRyYW5zbGF0ZVByb3ZpZGVyLnVzZUxvYWRlcihcIiR0cmFuc2xhdGVTaGlwTG9hZGVyXCIpO1xuICAkdHJhbnNsYXRlUHJvdmlkZXIucHJlZmVycmVkTGFuZ3VhZ2UoXCJlblwiKTtcbn1dKVxuXG5cbi5mYWN0b3J5KFwiJGluc3RhbnRcIiwgW1wiJGh1bGxJbml0XCIsIGZ1bmN0aW9uKCRodWxsSW5pdCkge1xuICB2YXIgaW5zdGFudCA9IG5ldyBJbnN0YW50V2luKCRodWxsSW5pdC51c2VyLCAkaHVsbEluaXQuc2hpcCk7XG4gIHdpbmRvdy4kaW5zdGFudCA9IGluc3RhbnQ7XG4gIHJldHVybiBpbnN0YW50O1xufV0pXG5cbi5mYWN0b3J5KFwiJHRyYW5zbGF0ZVNoaXBMb2FkZXJcIiwgW1wiJHFcIiwgXCIkaW5zdGFudFwiLCBmdW5jdGlvbiAoJHEsICRpbnN0YW50KSB7XG4gIHJldHVybiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgZGVmZXJyZWQucmVzb2x2ZSgkaW5zdGFudC50cmFuc2xhdGUob3B0aW9ucy5rZXkpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbn1dKVxuXG4uZGlyZWN0aXZlKFwicHJvZ3Jlc3NcIiwgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogXCJBXCIsXG4gICAgc2NvcGU6IHsgc3RlcDogXCI9XCIsIHN0ZXBzOiBcIj1cIiwgc3RlcEluZGV4OiBcIj1cIiB9LFxuICAgIHRlbXBsYXRlVXJsOiBcImRpcmVjdGl2ZXMvcHJvZ3Jlc3MuaHRtbFwiLFxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSkge1xuICAgICAgJHNjb3BlLnByb2dyZXNzUmF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gMTAwICogKCRzY29wZS5zdGVwSW5kZXggKyAxKSAvICgkc2NvcGUuc3RlcHMubGVuZ3RoICsgMSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufSlcblxuLmRpcmVjdGl2ZShcInNwaW5uZXJcIiwgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogXCJFQVwiLFxuICAgIHNjb3BlOiB7IHNwaW5uaW5nOiBcIj1cIiB9LFxuICAgIHRlbXBsYXRlVXJsOiBcImRpcmVjdGl2ZXMvc3Bpbm5lci5odG1sXCJcbiAgfTtcbn0pXG5cbi5jb250cm9sbGVyKCdGb3JtQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRpbnN0YW50JywgZnVuY3Rpb24oJHNjb3BlKSB7XG4gICRzY29wZS5tb2RlbCA9IHt9O1xuICB2YXIgZmllbGRzID0gKCRzY29wZS5pbnN0YW50LmZvcm0gJiYgJHNjb3BlLmluc3RhbnQuZm9ybS5maWVsZHNfbGlzdCkgfHwgW107XG4gIGFuZ3VsYXIuZm9yRWFjaChmaWVsZHMsIGZ1bmN0aW9uKGZpZWxkKSB7XG4gICAgJHNjb3BlLm1vZGVsW2ZpZWxkLm5hbWVdID0gZmllbGQudmFsdWU7XG4gIH0pO1xuICAkc2NvcGUuc2NoZW1hID0gJHNjb3BlLmluc3RhbnQuZm9ybS5maWVsZHNfc2NoZW1hO1xuICAkc2NvcGUuZm9ybSA9IFtcbiAgICB7XG4gICAgICBcInR5cGVcIjogXCJmaWVsZHNldFwiLFxuICAgICAgXCJ0aXRsZVwiIDogXCJGb3JtXCIsXG4gICAgICBcIml0ZW1zXCIgOiBbIFwiKlwiIF0sXG4gICAgfSxcbiAgICB7IFwidHlwZVwiOiBcInN1Ym1pdFwiLCBcInRpdGxlXCI6IFwiU2F2ZVwiIH1cbiAgXTtcblxuICAkc2NvcGUub25TdWJtaXQgPSBmdW5jdGlvbihmb3JtKSB7XG4gICAgLy8gRmlyc3Qgd2UgYnJvYWRjYXN0IGFuIGV2ZW50IHNvIGFsbCBmaWVsZHMgdmFsaWRhdGUgdGhlbXNlbHZlc1xuICAgICRzY29wZS4kYnJvYWRjYXN0KCdzY2hlbWFGb3JtVmFsaWRhdGUnKTtcblxuICAgIC8vIFRoZW4gd2UgY2hlY2sgaWYgdGhlIGZvcm0gaXMgdmFsaWRcbiAgICBpZiAoZm9ybS4kdmFsaWQpIHtcbiAgICAgICRpbnN0YW50LnN1Ym1pdEZvcm0oJHNjb3BlLm1vZGVsKTtcbiAgICB9XG4gIH1cbn1dKVxuXG4uY29udHJvbGxlcignSW5zdGFudFdpbkNvbnRyb2xsZXInLFsnJHNjb3BlJywgJyRpbnN0YW50JywgJyR0cmFuc2xhdGUnLFxuICBmdW5jdGlvbiBJbnN0YW50V2luQ29udHJvbGxlcigkc2NvcGUsICRpbnN0YW50LCAkdHJhbnNsYXRlKSB7XG4gICAgJHNjb3BlLnN0eWxlcyAgID0ge307XG4gICAgJHNjb3BlLmxvZ2luICAgID0gSHVsbC5sb2dpbjtcbiAgICAkc2NvcGUubG9nb3V0ICAgPSBIdWxsLmxvZ291dDtcbiAgICAkc2NvcGUucGxheSAgICAgPSAkaW5zdGFudC5wbGF5O1xuXG4gICAgJHNjb3BlLnN0ZXBzID0gU3RlcHM7XG4gICAgJHNjb3BlLiRpbnN0YW50ID0gJGluc3RhbnQ7XG4gICAgJHNjb3BlLmluc3RhbnQgID0gJGluc3RhbnQuZ2V0U3RhdGUoKTtcblxuICAgIGZ1bmN0aW9uIHNldFN0eWxlcyhzZXR0aW5ncykge1xuICAgICAgdmFyIHN0eWxlcyA9IHt9O1xuICAgICAgYW5ndWxhci5mb3JFYWNoKHNldHRpbmdzLmltYWdlcywgZnVuY3Rpb24oaW1nLCB0YXJnZXQpIHtcbiAgICAgICAgaWYgKGltZykge1xuICAgICAgICAgIHN0eWxlc1t0YXJnZXRdID0gc3R5bGVzW3RhcmdldF0gfHwge307XG4gICAgICAgICAgc3R5bGVzW3RhcmdldF0uYmFja2dyb3VuZEltYWdlID0gJ3VybCgnICsgaW1nICsgJyknO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgICRzY29wZS5zdHlsZXMgPSBzdHlsZXM7XG4gICAgfVxuXG4gICAgc2V0U3R5bGVzKCRzY29wZS5pbnN0YW50LnNldHRpbmdzKTtcblxuXG4gICAgZnVuY3Rpb24gb25DaGFuZ2UoaW5zdGFudCkge1xuICAgICAgY29uc29sZS53YXJuKCdDaGFuZ2UgIScsIGluc3RhbnQpO1xuICAgICAgJHNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcbiAgICAgICAgJHNjb3BlLmluc3RhbnQgPSBpbnN0YW50O1xuICAgICAgICBzZXRTdHlsZXMoaW5zdGFudC5zZXR0aW5ncyk7XG4gICAgICAgIGNvbnNvbGUud2FybihcIlJlZnJlc2hpbmcgdHJhbnNsYXRpb25zLi4uXCIpO1xuICAgICAgICAkdHJhbnNsYXRlLnJlZnJlc2goKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgICRpbnN0YW50Lm9uQ2hhbmdlKG9uQ2hhbmdlKTtcbiAgfVxuXSk7XG5cblxuSHVsbC5yZWFkeShmdW5jdGlvbihfLCBjdXJyZW50VXNlciwgc2hpcCwgb3JnKSB7XG4gIHZhciBIdWxsSW5pdCA9IHtcbiAgICB1c2VyOiBjdXJyZW50VXNlcixcbiAgICBzaGlwOiBzaGlwLFxuICAgIG9yZzogb3JnXG4gIH07XG4gIGFwcC52YWx1ZSgnJGh1bGxJbml0JywgSHVsbEluaXQpO1xuICBhbmd1bGFyLmJvb3RzdHJhcChkb2N1bWVudCwgWydodWxsLWluc3RhbnQnXSk7XG59KTtcbiIsIi8qIVxuICogcGlja2FkYXRlLmpzIHYzLjQuMCwgMjAxNC8wMi8xNVxuICogQnkgQW1zdWwsIGh0dHA6Ly9hbXN1bC5jYVxuICogSG9zdGVkIG9uIGh0dHA6Ly9hbXN1bC5naXRodWIuaW8vcGlja2FkYXRlLmpzXG4gKiBMaWNlbnNlZCB1bmRlciBNSVRcbiAqL1xuIWZ1bmN0aW9uKGEpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJwaWNrZXJcIixbXCJhbmd1bGFyXCJdLGEpOnRoaXMuUGlja2VyPWEoYW5ndWxhcil9KGZ1bmN0aW9uKGEpe2Z1bmN0aW9uIGIoYSxkLGUsZyl7ZnVuY3Rpb24gaCgpe3JldHVybiBiLl8ubm9kZShcImRpdlwiLGIuXy5ub2RlKFwiZGl2XCIsYi5fLm5vZGUoXCJkaXZcIixiLl8ubm9kZShcImRpdlwiLHIuY29tcG9uZW50Lm5vZGVzKG8ub3Blbiksbi5ib3gpLG4ud3JhcCksbi5mcmFtZSksbi5ob2xkZXIpfWZ1bmN0aW9uIGkoKXtwLmRhdGEoZCxyKSxwLmFkZENsYXNzKG4uaW5wdXQpLHBbMF0udmFsdWU9cC5hdHRyKFwiZGF0YS12YWx1ZVwiKT9yLmdldChcInNlbGVjdFwiLG0uZm9ybWF0KTphLnZhbHVlLGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiI1wiK28uaWQpKS5vbihcImZvY3VzXCIsbCksYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIjXCIrby5pZCkpLm9uKFwiY2xpY2tcIixsKSxtLmVkaXRhYmxlfHxhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIiNcIitvLmlkKSkub24oXCJrZXlkb3duXCIsZnVuY3Rpb24oYSl7dmFyIGI9YS5rZXlDb2RlLGM9L14oOHw0NikkLy50ZXN0KGIpO3JldHVybiAyNz09Yj8oci5jbG9zZSgpLCExKTp2b2lkKCgzMj09Ynx8Y3x8IW8ub3BlbiYmci5jb21wb25lbnQua2V5W2JdKSYmKGEucHJldmVudERlZmF1bHQoKSxhLnN0b3BQcm9wYWdhdGlvbigpLGM/ci5jbGVhcigpLmNsb3NlKCk6ci5vcGVuKCkpKX0pLGMoYSx7aGFzcG9wdXA6ITAsZXhwYW5kZWQ6ITEscmVhZG9ubHk6ITEsb3duczphLmlkK1wiX3Jvb3RcIisoci5faGlkZGVuP1wiIFwiK3IuX2hpZGRlbi5pZDpcIlwiKX0pfWZ1bmN0aW9uIGooKXtmdW5jdGlvbiBkKCl7YW5ndWxhci5lbGVtZW50KHIuJHJvb3RbMF0ucXVlcnlTZWxlY3RvckFsbChcIltkYXRhLXBpY2tdLCBbZGF0YS1uYXZdLCBbZGF0YS1jbGVhcl1cIikpLm9uKFwiY2xpY2tcIixmdW5jdGlvbigpe3ZhciBjPWFuZ3VsYXIuZWxlbWVudCh0aGlzKSxlPWMuaGFzQ2xhc3Mobi5uYXZEaXNhYmxlZCl8fGMuaGFzQ2xhc3Mobi5kaXNhYmxlZCksZj1kb2N1bWVudC5hY3RpdmVFbGVtZW50O2Y9ZiYmKGYudHlwZXx8Zi5ocmVmKSYmZiwoZXx8ZiYmIXIuJHJvb3RbMF0uY29udGFpbnMoZikpJiZhLmZvY3VzKCksYy5hdHRyKFwiZGF0YS1uYXZcIikmJiFlPyhyLnNldChcImhpZ2hsaWdodFwiLHIuY29tcG9uZW50Lml0ZW0uaGlnaGxpZ2h0LHtuYXY6cGFyc2VJbnQoYy5hdHRyKFwiZGF0YS1uYXZcIikpfSksZCgpKTpiLl8uaXNJbnRlZ2VyKHBhcnNlSW50KGMuYXR0cihcImRhdGEtcGlja1wiKSkpJiYhZT8oci5zZXQoXCJzZWxlY3RcIixwYXJzZUludChjLmF0dHIoXCJkYXRhLXBpY2tcIikpKS5jbG9zZSghMCksZCgpKTpjLmF0dHIoXCJkYXRhLWNsZWFyXCIpJiYoci5jbGVhcigpLmNsb3NlKCEwKSxkKCkpfSl9ci4kcm9vdC5vbihcImZvY3VzaW5cIixmdW5jdGlvbihhKXtyLiRyb290LnJlbW92ZUNsYXNzKG4uZm9jdXNlZCksYyhyLiRyb290WzBdLFwic2VsZWN0ZWRcIiwhMSksYS5zdG9wUHJvcGFnYXRpb24oKX0pLHIuJHJvb3Qub24oXCJtb3VzZWRvd24gY2xpY2tcIixmdW5jdGlvbihiKXt2YXIgYz1iLnRhcmdldDtjIT1yLiRyb290LmNoaWxkcmVuKClbMF0mJihiLnN0b3BQcm9wYWdhdGlvbigpLFwibW91c2Vkb3duXCI9PWIudHlwZSYmXCJpbnB1dFwiIT09YW5ndWxhci5lbGVtZW50KGMpWzBdLnRhZ05hbWUmJlwiT1BUSU9OXCIhPWMubm9kZU5hbWUmJihiLnByZXZlbnREZWZhdWx0KCksYS5mb2N1cygpKSl9KSxkKCksYyhyLiRyb290WzBdLFwiaGlkZGVuXCIsITApfWZ1bmN0aW9uIGsoKXt2YXIgYj1bXCJzdHJpbmdcIj09dHlwZW9mIG0uaGlkZGVuUHJlZml4P20uaGlkZGVuUHJlZml4OlwiXCIsXCJzdHJpbmdcIj09dHlwZW9mIG0uaGlkZGVuU3VmZml4P20uaGlkZGVuU3VmZml4OlwiX3N1Ym1pdFwiXTtyLl9oaWRkZW49YW5ndWxhci5lbGVtZW50KCc8aW5wdXQgdHlwZT1oaWRkZW4gbmFtZT1cIicrYlswXSthLm5hbWUrYlsxXSsnXCJpZD1cIicrYlswXSthLmlkK2JbMV0rJ1wiJysocC5hdHRyKFwiZGF0YS12YWx1ZVwiKXx8YS52YWx1ZT8nIHZhbHVlPVwiJytyLmdldChcInNlbGVjdFwiLG0uZm9ybWF0U3VibWl0KSsnXCInOlwiXCIpK1wiPlwiKVswXSxwLm9uKFwiY2hhbmdlLlwiK28uaWQsZnVuY3Rpb24oKXtyLl9oaWRkZW4udmFsdWU9YS52YWx1ZT9yLmdldChcInNlbGVjdFwiLG0uZm9ybWF0U3VibWl0KTpcIlwifSkuYWZ0ZXIoci5faGlkZGVuKX1mdW5jdGlvbiBsKGEpe2Euc3RvcFByb3BhZ2F0aW9uKCksXCJmb2N1c1wiPT1hLnR5cGUmJihyLiRyb290LmFkZENsYXNzKG4uZm9jdXNlZCksYyhyLiRyb290WzBdLFwic2VsZWN0ZWRcIiwhMCkpLHIub3BlbigpfWlmKCFhKXJldHVybiBiO3ZhciBtO2U/KG09ZS5kZWZhdWx0cyxhbmd1bGFyLmV4dGVuZChtLGcpKTptPWd8fHt9O3ZhciBuPWIua2xhc3NlcygpO2FuZ3VsYXIuZXh0ZW5kKG4sbS5rbGFzcyk7dmFyIG89e2lkOmEuaWR8fFwiUFwiK01hdGguYWJzKH5+KE1hdGgucmFuZG9tKCkqbmV3IERhdGUpKX0scD1hbmd1bGFyLmVsZW1lbnQoYSkscT1mdW5jdGlvbigpe3JldHVybiB0aGlzLnN0YXJ0KCl9LHI9cS5wcm90b3R5cGU9e2NvbnN0cnVjdG9yOnEsJG5vZGU6cCxzdGFydDpmdW5jdGlvbigpe3JldHVybiBvJiZvLnN0YXJ0P3I6KG8ubWV0aG9kcz17fSxvLnN0YXJ0PSEwLG8ub3Blbj0hMSxvLnR5cGU9YS50eXBlLGEuYXV0b2ZvY3VzPWE9PWRvY3VtZW50LmFjdGl2ZUVsZW1lbnQsYS50eXBlPVwidGV4dFwiLGEucmVhZE9ubHk9IW0uZWRpdGFibGUsYS5pZD1hLmlkfHxvLmlkLHIuY29tcG9uZW50PW5ldyBlKHIsbSksci4kcm9vdD1hbmd1bGFyLmVsZW1lbnQoYi5fLm5vZGUoXCJkaXZcIixoKCksbi5waWNrZXIsJ2lkPVwiJythLmlkKydfcm9vdFwiJykpLGooKSxtLmZvcm1hdFN1Ym1pdCYmaygpLGkoKSxtLmNvbnRhaW5lcj9hbmd1bGFyLmVsZW1lbnQobS5jb250YWluZXIpLmFwcGVuZChyLiRyb290KTpwLmFmdGVyKHIuJHJvb3QpLHIub24oe3N0YXJ0OnIuY29tcG9uZW50Lm9uU3RhcnQscmVuZGVyOnIuY29tcG9uZW50Lm9uUmVuZGVyLHN0b3A6ci5jb21wb25lbnQub25TdG9wLG9wZW46ci5jb21wb25lbnQub25PcGVuLGNsb3NlOnIuY29tcG9uZW50Lm9uQ2xvc2Usc2V0OnIuY29tcG9uZW50Lm9uU2V0fSkub24oe3N0YXJ0Om0ub25TdGFydCxyZW5kZXI6bS5vblJlbmRlcixzdG9wOm0ub25TdG9wLG9wZW46bS5vbk9wZW4sY2xvc2U6bS5vbkNsb3NlLHNldDptLm9uU2V0fSksYS5hdXRvZm9jdXMmJnIub3BlbigpLHIudHJpZ2dlcihcInN0YXJ0XCIpLnRyaWdnZXIoXCJyZW5kZXJcIikpfSxyZW5kZXI6ZnVuY3Rpb24oYSl7cmV0dXJuIGE/ci4kcm9vdC5odG1sKGgoKSk6YW5ndWxhci5lbGVtZW50KHIuJHJvb3RbMF0ucXVlcnlTZWxlY3RvckFsbChcIi5cIituLmJveCkpLmh0bWwoci5jb21wb25lbnQubm9kZXMoby5vcGVuKSksci50cmlnZ2VyKFwicmVuZGVyXCIpfSxzdG9wOmZ1bmN0aW9uKCl7cmV0dXJuIG8uc3RhcnQ/KHIuY2xvc2UoKSxyLl9oaWRkZW4mJnIuX2hpZGRlbi5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHIuX2hpZGRlbiksci4kcm9vdC5yZW1vdmUoKSxwLnJlbW92ZUNsYXNzKG4uaW5wdXQpLnJlbW92ZURhdGEoZCksc2V0VGltZW91dChmdW5jdGlvbigpe3Aub2ZmKFwiLlwiK28uaWQpfSwwKSxhLnR5cGU9by50eXBlLGEucmVhZE9ubHk9ITEsci50cmlnZ2VyKFwic3RvcFwiKSxvLm1ldGhvZHM9e30sby5zdGFydD0hMSxyKTpyfSxvcGVuOmZ1bmN0aW9uKGQpe3JldHVybiBvLm9wZW4/cjoocC5hZGRDbGFzcyhuLmFjdGl2ZSksYyhhLFwiZXhwYW5kZWRcIiwhMCksci4kcm9vdC5hZGRDbGFzcyhuLm9wZW5lZCksYyhyLiRyb290WzBdLFwiaGlkZGVuXCIsITEpLGQhPT0hMSYmKG8ub3Blbj0hMCxwLnRyaWdnZXJIYW5kbGVyKFwiZm9jdXNcIiksYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIjXCIrby5pZCkpLm9uKFwiY2xpY2sgZm9jdXNpblwiLGZ1bmN0aW9uKGIpe3ZhciBjPWIudGFyZ2V0O2MhPWEmJmMhPWRvY3VtZW50JiYzIT1iLndoaWNoJiZyLmNsb3NlKGM9PT1yLiRyb290LmNoaWxkcmVuKClbMF0pfSksYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIjXCIrby5pZCkpLm9uKFwia2V5ZG93blwiLGZ1bmN0aW9uKGMpe3ZhciBkPWMua2V5Q29kZSxlPXIuY29tcG9uZW50LmtleVtkXSxmPWMudGFyZ2V0OzI3PT1kP3IuY2xvc2UoITApOmYhPWF8fCFlJiYxMyE9ZD9yLiRyb290WzBdLmNvbnRhaW5zKGYpJiYxMz09ZCYmKGMucHJldmVudERlZmF1bHQoKSxmLmNsaWNrKCkpOihjLnByZXZlbnREZWZhdWx0KCksZT9iLl8udHJpZ2dlcihyLmNvbXBvbmVudC5rZXkuZ28scixbYi5fLnRyaWdnZXIoZSldKTphbmd1bGFyLmVsZW1lbnQoci4kcm9vdFswXS5xdWVyeVNlbGVjdG9yQWxsKFwiLlwiK24uaGlnaGxpZ2h0ZWQpKS5oYXNDbGFzcyhuLmRpc2FibGVkKXx8ci5zZXQoXCJzZWxlY3RcIixyLmNvbXBvbmVudC5pdGVtLmhpZ2hsaWdodCkuY2xvc2UoKSl9KSksci50cmlnZ2VyKFwib3BlblwiKSl9LGNsb3NlOmZ1bmN0aW9uKGIpe3JldHVybiBiJiYocC5vZmYoXCJmb2N1cy5cIitvLmlkKSxwLnRyaWdnZXJIYW5kbGVyKFwiZm9jdXNcIiksc2V0VGltZW91dChmdW5jdGlvbigpe2FuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiI1wiK28uaWQpKS5vbihcImZvY3VzXCIsbCl9LDApKSxwLnJlbW92ZUNsYXNzKG4uYWN0aXZlKSxjKGEsXCJleHBhbmRlZFwiLCExKSxyLiRyb290LnJlbW92ZUNsYXNzKG4ub3BlbmVkK1wiIFwiK24uZm9jdXNlZCksYyhyLiRyb290WzBdLFwiaGlkZGVuXCIsITApLGMoci4kcm9vdFswXSxcInNlbGVjdGVkXCIsITEpLG8ub3Blbj8oc2V0VGltZW91dChmdW5jdGlvbigpe28ub3Blbj0hMX0sMWUzKSxmLm9mZihcIi5cIitvLmlkKSxyLnRyaWdnZXIoXCJjbG9zZVwiKSk6cn0sY2xlYXI6ZnVuY3Rpb24oKXtyZXR1cm4gci5zZXQoXCJjbGVhclwiKX0sc2V0OmZ1bmN0aW9uKGEsYixjKXt2YXIgZCxlLGY9YW5ndWxhci5pc09iamVjdChhKSxnPWY/YTp7fTtpZihjPWYmJmFuZ3VsYXIuaXNPYmplY3QoYik/YjpjfHx7fSxhKXtmfHwoZ1thXT1iKTtmb3IoZCBpbiBnKWU9Z1tkXSxkIGluIHIuY29tcG9uZW50Lml0ZW0mJnIuY29tcG9uZW50LnNldChkLGUsYyksKFwic2VsZWN0XCI9PWR8fFwiY2xlYXJcIj09ZCkmJihwWzBdLnZhbHVlPVwiY2xlYXJcIj09ZD9cIlwiOnIuZ2V0KGQsbS5mb3JtYXQpLHAudHJpZ2dlckhhbmRsZXIoXCJjaGFuZ2VcIikpO3IucmVuZGVyKCl9cmV0dXJuIGMubXV0ZWQ/cjpyLnRyaWdnZXIoXCJzZXRcIixnKX0sZ2V0OmZ1bmN0aW9uKGMsZCl7cmV0dXJuIGM9Y3x8XCJ2YWx1ZVwiLG51bGwhPW9bY10/b1tjXTpcInZhbHVlXCI9PWM/YS52YWx1ZTpjIGluIHIuY29tcG9uZW50Lml0ZW0/XCJzdHJpbmdcIj09dHlwZW9mIGQ/Yi5fLnRyaWdnZXIoci5jb21wb25lbnQuZm9ybWF0cy50b1N0cmluZyxyLmNvbXBvbmVudCxbZCxyLmNvbXBvbmVudC5nZXQoYyldKTpyLmNvbXBvbmVudC5nZXQoYyk6dm9pZCAwfSxvbjpmdW5jdGlvbihhLGIpe3ZhciBjLGQsZT1hbmd1bGFyLmlzT2JqZWN0KGEpLGY9ZT9hOnt9O2lmKGEpe2V8fChmW2FdPWIpO2ZvcihjIGluIGYpZD1mW2NdLG8ubWV0aG9kc1tjXT1vLm1ldGhvZHNbY118fFtdLG8ubWV0aG9kc1tjXS5wdXNoKGQpfXJldHVybiByfSxvZmY6ZnVuY3Rpb24oKXt2YXIgYSxiLGM9YXJndW1lbnRzO2ZvcihhPTAsbmFtZXNDb3VudD1jLmxlbmd0aDtuYW1lc0NvdW50PmE7YSs9MSliPWNbYV0sYiBpbiBvLm1ldGhvZHMmJmRlbGV0ZSBvLm1ldGhvZHNbYl07cmV0dXJuIHJ9LHRyaWdnZXI6ZnVuY3Rpb24oYSxjKXt2YXIgZD1vLm1ldGhvZHNbYV07cmV0dXJuIGQmJmQubWFwKGZ1bmN0aW9uKGEpe2IuXy50cmlnZ2VyKGEscixbY10pfSkscn19O3JldHVybiBuZXcgcX1mdW5jdGlvbiBjKGEsYixjKXtpZihhbmd1bGFyLmlzT2JqZWN0KGIpKWZvcih2YXIgZSBpbiBiKWQoYSxlLGJbZV0pO2Vsc2UgZChhLGIsYyl9ZnVuY3Rpb24gZChhLGIsYyl7YW5ndWxhci5lbGVtZW50KGEpLmF0dHIoKFwicm9sZVwiPT1iP1wiXCI6XCJhcmlhLVwiKStiLGMpfWZ1bmN0aW9uIGUoYSxiKXthbmd1bGFyLmlzT2JqZWN0KGEpfHwoYT17YXR0cmlidXRlOmJ9KSxiPVwiXCI7Zm9yKHZhciBjIGluIGEpe3ZhciBkPShcInJvbGVcIj09Yz9cIlwiOlwiYXJpYS1cIikrYyxlPWFbY107Yis9bnVsbD09ZT9cIlwiOmQrJz1cIicrYVtjXSsnXCInfXJldHVybiBifXZhciBmPWFuZ3VsYXIuZWxlbWVudChkb2N1bWVudCk7cmV0dXJuIGIua2xhc3Nlcz1mdW5jdGlvbihhKXtyZXR1cm4gYT1hfHxcInBpY2tlclwiLHtwaWNrZXI6YSxvcGVuZWQ6YStcIi0tb3BlbmVkXCIsZm9jdXNlZDphK1wiLS1mb2N1c2VkXCIsaW5wdXQ6YStcIl9faW5wdXRcIixhY3RpdmU6YStcIl9faW5wdXQtLWFjdGl2ZVwiLGhvbGRlcjphK1wiX19ob2xkZXJcIixmcmFtZTphK1wiX19mcmFtZVwiLHdyYXA6YStcIl9fd3JhcFwiLGJveDphK1wiX19ib3hcIn19LGIuXz17Z3JvdXA6ZnVuY3Rpb24oYSl7Zm9yKHZhciBjLGQ9XCJcIixlPWIuXy50cmlnZ2VyKGEubWluLGEpO2U8PWIuXy50cmlnZ2VyKGEubWF4LGEsW2VdKTtlKz1hLmkpYz1iLl8udHJpZ2dlcihhLml0ZW0sYSxbZV0pLGQrPWIuXy5ub2RlKGEubm9kZSxjWzBdLGNbMV0sY1syXSk7cmV0dXJuIGR9LG5vZGU6ZnVuY3Rpb24oYixjLGQsZSl7cmV0dXJuIGM/KGM9YS5pc0FycmF5KGMpP2Muam9pbihcIlwiKTpjLGQ9ZD8nIGNsYXNzPVwiJytkKydcIic6XCJcIixlPWU/XCIgXCIrZTpcIlwiLFwiPFwiK2IrZCtlK1wiPlwiK2MrXCI8L1wiK2IrXCI+XCIpOlwiXCJ9LGxlYWQ6ZnVuY3Rpb24oYSl7cmV0dXJuKDEwPmE/XCIwXCI6XCJcIikrYX0sdHJpZ2dlcjpmdW5jdGlvbihhLGIsYyl7cmV0dXJuXCJmdW5jdGlvblwiPT10eXBlb2YgYT9hLmFwcGx5KGIsY3x8W10pOmF9LGRpZ2l0czpmdW5jdGlvbihhKXtyZXR1cm4vXFxkLy50ZXN0KGFbMV0pPzI6MX0saXNEYXRlOmZ1bmN0aW9uKGEpe3JldHVybnt9LnRvU3RyaW5nLmNhbGwoYSkuaW5kZXhPZihcIkRhdGVcIik+LTEmJnRoaXMuaXNJbnRlZ2VyKGEuZ2V0RGF0ZSgpKX0saXNJbnRlZ2VyOmZ1bmN0aW9uKGEpe3JldHVybnt9LnRvU3RyaW5nLmNhbGwoYSkuaW5kZXhPZihcIk51bWJlclwiKT4tMSYmYSUxPT09MH0sYXJpYUF0dHI6ZX0sYi5leHRlbmQ9ZnVuY3Rpb24oYSxjKXthbmd1bGFyLmVsZW1lbnQucHJvdG90eXBlW2FdPWZ1bmN0aW9uKGQsZSl7dmFyIGY9dGhpcy5kYXRhKGEpO2lmKFwicGlja2VyXCI9PWQpcmV0dXJuIGY7aWYoZiYmXCJzdHJpbmdcIj09dHlwZW9mIGQpcmV0dXJuIGIuXy50cmlnZ2VyKGZbZF0sZixbZV0pLHRoaXM7Zm9yKHZhciBnPTA7Zzx0aGlzLmxlbmd0aDtnKyspe3ZhciBoPWFuZ3VsYXIuZWxlbWVudCh0aGlzW2ddKTtoLmRhdGEoYSl8fG5ldyBiKGhbMF0sYSxjLGQpfX0sYW5ndWxhci5lbGVtZW50LnByb3RvdHlwZVthXS5kZWZhdWx0cz1jLmRlZmF1bHRzfSxifSk7XG4vKiFcbiAqIERhdGUgcGlja2VyIGZvciBwaWNrYWRhdGUuanMgdjMuNC4wXG4gKiBodHRwOi8vYW1zdWwuZ2l0aHViLmlvL3BpY2thZGF0ZS5qcy9kYXRlLmh0bVxuICovXG4hZnVuY3Rpb24oYSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShbXCJwaWNrZXJcIixcImFuZ3VsYXJcIl0sYSk6YShQaWNrZXIsYW5ndWxhcil9KGZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gYyhhLGMpe3ZhciBkPXRoaXMsZT1hLiRub2RlWzBdLnZhbHVlLGY9YS4kbm9kZS5hdHRyKFwiZGF0YS12YWx1ZVwiKSxnPWZ8fGUsaD1mP2MuZm9ybWF0U3VibWl0OmMuZm9ybWF0LGk9ZnVuY3Rpb24oKXtyZXR1cm5cInJ0bFwiPT09Z2V0Q29tcHV0ZWRTdHlsZShhLiRyb290WzBdKS5kaXJlY3Rpb259O2Quc2V0dGluZ3M9YyxkLiRub2RlPWEuJG5vZGUsZC5xdWV1ZT17bWluOlwibWVhc3VyZSBjcmVhdGVcIixtYXg6XCJtZWFzdXJlIGNyZWF0ZVwiLG5vdzpcIm5vdyBjcmVhdGVcIixzZWxlY3Q6XCJwYXJzZSBjcmVhdGUgdmFsaWRhdGVcIixoaWdobGlnaHQ6XCJwYXJzZSBuYXZpZ2F0ZSBjcmVhdGUgdmFsaWRhdGVcIix2aWV3OlwicGFyc2UgY3JlYXRlIHZhbGlkYXRlIHZpZXdzZXRcIixkaXNhYmxlOlwiZGVhY3RpdmF0ZVwiLGVuYWJsZTpcImFjdGl2YXRlXCJ9LGQuaXRlbT17fSxkLml0ZW0uZGlzYWJsZT0oYy5kaXNhYmxlfHxbXSkuc2xpY2UoMCksZC5pdGVtLmVuYWJsZT0tZnVuY3Rpb24oYSl7cmV0dXJuIGFbMF09PT0hMD9hLnNoaWZ0KCk6LTF9KGQuaXRlbS5kaXNhYmxlKSxkLnNldChcIm1pblwiLGMubWluKS5zZXQoXCJtYXhcIixjLm1heCkuc2V0KFwibm93XCIpLGc/ZC5zZXQoXCJzZWxlY3RcIixnLHtmb3JtYXQ6aCxmcm9tVmFsdWU6ISFlfSk6ZC5zZXQoXCJzZWxlY3RcIixudWxsKS5zZXQoXCJoaWdobGlnaHRcIixkLml0ZW0ubm93KSxkLmtleT17NDA6NywzODotNywzOTpmdW5jdGlvbigpe3JldHVybiBpKCk/LTE6MX0sMzc6ZnVuY3Rpb24oKXtyZXR1cm4gaSgpPzE6LTF9LGdvOmZ1bmN0aW9uKGEpe3ZhciBiPWQuaXRlbS5oaWdobGlnaHQsYz1uZXcgRGF0ZShiLnllYXIsYi5tb250aCxiLmRhdGUrYSk7ZC5zZXQoXCJoaWdobGlnaHRcIixbYy5nZXRGdWxsWWVhcigpLGMuZ2V0TW9udGgoKSxjLmdldERhdGUoKV0se2ludGVydmFsOmF9KSx0aGlzLnJlbmRlcigpfX0sYS5vbihcInJlbmRlclwiLGZ1bmN0aW9uKCl7Yi5lbGVtZW50KGEuJHJvb3RbMF0ucXVlcnlTZWxlY3RvckFsbChcIi5cIitjLmtsYXNzLnNlbGVjdE1vbnRoKSkub24oXCJjaGFuZ2VcIixmdW5jdGlvbigpe3ZhciBkPXRoaXMudmFsdWU7ZCYmKGEuc2V0KFwiaGlnaGxpZ2h0XCIsW2EuZ2V0KFwidmlld1wiKS55ZWFyLGQsYS5nZXQoXCJoaWdobGlnaHRcIikuZGF0ZV0pLGIuZWxlbWVudChhLiRyb290WzBdLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuXCIrYy5rbGFzcy5zZWxlY3RNb250aCkpLnRyaWdnZXJIYW5kbGVyKFwiZm9jdXNcIikpfSksYi5lbGVtZW50KGEuJHJvb3RbMF0ucXVlcnlTZWxlY3RvckFsbChcIi5cIitjLmtsYXNzLnNlbGVjdFllYXIpKS5vbihcImNoYW5nZVwiLGZ1bmN0aW9uKCl7dmFyIGQ9dGhpcy52YWx1ZTtkJiYoYS5zZXQoXCJoaWdobGlnaHRcIixbZCxhLmdldChcInZpZXdcIikubW9udGgsYS5nZXQoXCJoaWdobGlnaHRcIikuZGF0ZV0pLGIuZWxlbWVudChhLiRyb290WzBdLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuXCIrYy5rbGFzcy5zZWxlY3RZZWFyKSkudHJpZ2dlckhhbmRsZXIoXCJmb2N1c1wiKSl9KX0pLm9uKFwib3BlblwiLGZ1bmN0aW9uKCl7Yi5lbGVtZW50KGEuJHJvb3RbMF0ucXVlcnlTZWxlY3RvckFsbChcImJ1dHRvbiwgc2VsZWN0XCIpKS5hdHRyKFwiZGlzYWJsZWRcIiwhMSl9KS5vbihcImNsb3NlXCIsZnVuY3Rpb24oKXtiLmVsZW1lbnQoYS4kcm9vdFswXS5xdWVyeVNlbGVjdG9yQWxsKFwiYnV0dG9uLCBzZWxlY3RcIikpLmF0dHIoXCJkaXNhYmxlZFwiLCEwKX0pfXZhciBkPTcsZT02LGY9YS5fO2MucHJvdG90eXBlLnNldD1mdW5jdGlvbihhLGIsYyl7dmFyIGQ9dGhpcyxlPWQuaXRlbTtyZXR1cm4gbnVsbD09PWI/KGVbYV09YixkKTooZVtcImVuYWJsZVwiPT1hP1wiZGlzYWJsZVwiOlwiZmxpcFwiPT1hP1wiZW5hYmxlXCI6YV09ZC5xdWV1ZVthXS5zcGxpdChcIiBcIikubWFwKGZ1bmN0aW9uKGUpe3JldHVybiBiPWRbZV0oYSxiLGMpfSkucG9wKCksXCJzZWxlY3RcIj09YT9kLnNldChcImhpZ2hsaWdodFwiLGUuc2VsZWN0LGMpOlwiaGlnaGxpZ2h0XCI9PWE/ZC5zZXQoXCJ2aWV3XCIsZS5oaWdobGlnaHQsYyk6YS5tYXRjaCgvXihmbGlwfG1pbnxtYXh8ZGlzYWJsZXxlbmFibGUpJC8pJiYoZS5zZWxlY3QmJmQuZGlzYWJsZWQoZS5zZWxlY3QpJiZkLnNldChcInNlbGVjdFwiLGUuc2VsZWN0LGMpLGUuaGlnaGxpZ2h0JiZkLmRpc2FibGVkKGUuaGlnaGxpZ2h0KSYmZC5zZXQoXCJoaWdobGlnaHRcIixlLmhpZ2hsaWdodCxjKSksZCl9LGMucHJvdG90eXBlLmdldD1mdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5pdGVtW2FdfSxjLnByb3RvdHlwZS5jcmVhdGU9ZnVuY3Rpb24oYSxjLGQpe3ZhciBlLGc9dGhpcztyZXR1cm4gYz12b2lkIDA9PT1jP2E6YyxjPT0tMS8wfHwxLzA9PWM/ZT1jOmIuaXNPYmplY3QoYykmJmYuaXNJbnRlZ2VyKGMucGljayk/Yz1jLm9iajpiLmlzQXJyYXkoYyk/KGM9bmV3IERhdGUoY1swXSxjWzFdLGNbMl0pLGM9Zi5pc0RhdGUoYyk/YzpnLmNyZWF0ZSgpLm9iaik6Yz1mLmlzSW50ZWdlcihjKXx8Zi5pc0RhdGUoYyk/Zy5ub3JtYWxpemUobmV3IERhdGUoYyksZCk6Zy5ub3coYSxjLGQpLHt5ZWFyOmV8fGMuZ2V0RnVsbFllYXIoKSxtb250aDplfHxjLmdldE1vbnRoKCksZGF0ZTplfHxjLmdldERhdGUoKSxkYXk6ZXx8Yy5nZXREYXkoKSxvYmo6ZXx8YyxwaWNrOmV8fGMuZ2V0VGltZSgpfX0sYy5wcm90b3R5cGUuY3JlYXRlUmFuZ2U9ZnVuY3Rpb24oYSxjKXt2YXIgZD10aGlzLGU9ZnVuY3Rpb24oYSl7cmV0dXJuIGE9PT0hMHx8Yi5pc0FycmF5KGEpfHxmLmlzRGF0ZShhKT9kLmNyZWF0ZShhKTphfTtyZXR1cm4gZi5pc0ludGVnZXIoYSl8fChhPWUoYSkpLGYuaXNJbnRlZ2VyKGMpfHwoYz1lKGMpKSxmLmlzSW50ZWdlcihhKSYmYi5pc09iamVjdChjKT9hPVtjLnllYXIsYy5tb250aCxjLmRhdGUrYV06Zi5pc0ludGVnZXIoYykmJmIuaXNPYmplY3QoYSkmJihjPVthLnllYXIsYS5tb250aCxhLmRhdGUrY10pLHtmcm9tOmUoYSksdG86ZShjKX19LGMucHJvdG90eXBlLndpdGhpblJhbmdlPWZ1bmN0aW9uKGEsYil7cmV0dXJuIGE9dGhpcy5jcmVhdGVSYW5nZShhLmZyb20sYS50byksYi5waWNrPj1hLmZyb20ucGljayYmYi5waWNrPD1hLnRvLnBpY2t9LGMucHJvdG90eXBlLm92ZXJsYXBSYW5nZXM9ZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzO3JldHVybiBhPWMuY3JlYXRlUmFuZ2UoYS5mcm9tLGEudG8pLGI9Yy5jcmVhdGVSYW5nZShiLmZyb20sYi50byksYy53aXRoaW5SYW5nZShhLGIuZnJvbSl8fGMud2l0aGluUmFuZ2UoYSxiLnRvKXx8Yy53aXRoaW5SYW5nZShiLGEuZnJvbSl8fGMud2l0aGluUmFuZ2UoYixhLnRvKX0sYy5wcm90b3R5cGUubm93PWZ1bmN0aW9uKGEsYixjKXtyZXR1cm4gYj1uZXcgRGF0ZSxjJiZjLnJlbCYmYi5zZXREYXRlKGIuZ2V0RGF0ZSgpK2MucmVsKSx0aGlzLm5vcm1hbGl6ZShiLGMpfSxjLnByb3RvdHlwZS5uYXZpZ2F0ZT1mdW5jdGlvbihhLGMsZCl7dmFyIGUsZixnLGgsaT1iLmlzQXJyYXkoYyksaj1iLmlzT2JqZWN0KGMpLGs9dGhpcy5pdGVtLnZpZXc7aWYoaXx8ail7Zm9yKGo/KGY9Yy55ZWFyLGc9Yy5tb250aCxoPWMuZGF0ZSk6KGY9K2NbMF0sZz0rY1sxXSxoPStjWzJdKSxkJiZkLm5hdiYmayYmay5tb250aCE9PWcmJihmPWsueWVhcixnPWsubW9udGgpLGU9bmV3IERhdGUoZixnKyhkJiZkLm5hdj9kLm5hdjowKSwxKSxmPWUuZ2V0RnVsbFllYXIoKSxnPWUuZ2V0TW9udGgoKTtuZXcgRGF0ZShmLGcsaCkuZ2V0TW9udGgoKSE9PWc7KWgtPTE7Yz1bZixnLGhdfXJldHVybiBjfSxjLnByb3RvdHlwZS5ub3JtYWxpemU9ZnVuY3Rpb24oYSl7cmV0dXJuIGEuc2V0SG91cnMoMCwwLDAsMCksYX0sYy5wcm90b3R5cGUubWVhc3VyZT1mdW5jdGlvbihhLGIpe3ZhciBjPXRoaXM7cmV0dXJuIGI/Zi5pc0ludGVnZXIoYikmJihiPWMubm93KGEsYix7cmVsOmJ9KSk6Yj1cIm1pblwiPT1hPy0xLzA6MS8wLGJ9LGMucHJvdG90eXBlLnZpZXdzZXQ9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gdGhpcy5jcmVhdGUoW2IueWVhcixiLm1vbnRoLDFdKX0sYy5wcm90b3R5cGUudmFsaWRhdGU9ZnVuY3Rpb24oYSxjLGQpe3ZhciBlLGcsaCxpLGo9dGhpcyxrPWMsbD1kJiZkLmludGVydmFsP2QuaW50ZXJ2YWw6MSxtPS0xPT09ai5pdGVtLmVuYWJsZSxuPWouaXRlbS5taW4sbz1qLml0ZW0ubWF4LHA9bSYmai5pdGVtLmRpc2FibGUuZmlsdGVyKGZ1bmN0aW9uKGEpe2lmKGIuaXNBcnJheShhKSl7dmFyIGQ9ai5jcmVhdGUoYSkucGljaztkPGMucGljaz9lPSEwOmQ+Yy5waWNrJiYoZz0hMCl9cmV0dXJuIGYuaXNJbnRlZ2VyKGEpfSkubGVuZ3RoO2lmKCghZHx8IWQubmF2KSYmKCFtJiZqLmRpc2FibGVkKGMpfHxtJiZqLmRpc2FibGVkKGMpJiYocHx8ZXx8Zyl8fCFtJiYoYy5waWNrPD1uLnBpY2t8fGMucGljaz49by5waWNrKSkpZm9yKG0mJiFwJiYoIWcmJmw+MHx8IWUmJjA+bCkmJihsKj0tMSk7ai5kaXNhYmxlZChjKSYmKE1hdGguYWJzKGwpPjEmJihjLm1vbnRoPGsubW9udGh8fGMubW9udGg+ay5tb250aCkmJihjPWssbD1sPjA/MTotMSksYy5waWNrPD1uLnBpY2s/KGg9ITAsbD0xLGM9ai5jcmVhdGUoW24ueWVhcixuLm1vbnRoLG4uZGF0ZS0xXSkpOmMucGljaz49by5waWNrJiYoaT0hMCxsPS0xLGM9ai5jcmVhdGUoW28ueWVhcixvLm1vbnRoLG8uZGF0ZSsxXSkpLCFofHwhaSk7KWM9ai5jcmVhdGUoW2MueWVhcixjLm1vbnRoLGMuZGF0ZStsXSk7cmV0dXJuIGN9LGMucHJvdG90eXBlLmRpc2FibGVkPWZ1bmN0aW9uKGEpe3ZhciBjPXRoaXMsZD1jLml0ZW0uZGlzYWJsZS5maWx0ZXIoZnVuY3Rpb24oZCl7cmV0dXJuIGYuaXNJbnRlZ2VyKGQpP2EuZGF5PT09KGMuc2V0dGluZ3MuZmlyc3REYXk/ZDpkLTEpJTc6Yi5pc0FycmF5KGQpfHxmLmlzRGF0ZShkKT9hLnBpY2s9PT1jLmNyZWF0ZShkKS5waWNrOmIuaXNPYmplY3QoZCk/Yy53aXRoaW5SYW5nZShkLGEpOnZvaWQgMH0pO3JldHVybiBkPWQubGVuZ3RoJiYhZC5maWx0ZXIoZnVuY3Rpb24oYSl7cmV0dXJuIGIuaXNBcnJheShhKSYmXCJpbnZlcnRlZFwiPT1hWzNdfHxiLmlzT2JqZWN0KGEpJiZhLmludmVydGVkfSkubGVuZ3RoLC0xPT09Yy5pdGVtLmVuYWJsZT8hZDpkfHxhLnBpY2s8Yy5pdGVtLm1pbi5waWNrfHxhLnBpY2s+Yy5pdGVtLm1heC5waWNrfSxjLnByb3RvdHlwZS5wYXJzZT1mdW5jdGlvbihhLGMsZCl7dmFyIGUsZz10aGlzLGg9e307cmV0dXJuIWN8fGYuaXNJbnRlZ2VyKGMpfHxiLmlzQXJyYXkoYyl8fGYuaXNEYXRlKGMpfHxiLmlzT2JqZWN0KGMpJiZmLmlzSW50ZWdlcihjLnBpY2spP2M6KGQmJmQuZm9ybWF0fHwoZD1kfHx7fSxkLmZvcm1hdD1nLnNldHRpbmdzLmZvcm1hdCksZT1cInN0cmluZ1wiIT10eXBlb2YgY3x8ZC5mcm9tVmFsdWU/MDoxLGcuZm9ybWF0cy50b0FycmF5KGQuZm9ybWF0KS5tYXAoZnVuY3Rpb24oYSl7dmFyIGI9Zy5mb3JtYXRzW2FdLGQ9Yj9mLnRyaWdnZXIoYixnLFtjLGhdKTphLnJlcGxhY2UoL14hLyxcIlwiKS5sZW5ndGg7YiYmKGhbYV09Yy5zdWJzdHIoMCxkKSksYz1jLnN1YnN0cihkKX0pLFtoLnl5eXl8fGgueXksKyhoLm1tfHxoLm0pLWUsaC5kZHx8aC5kXSl9LGMucHJvdG90eXBlLmZvcm1hdHM9ZnVuY3Rpb24oKXtmdW5jdGlvbiBhKGEsYixjKXt2YXIgZD1hLm1hdGNoKC9cXHcrLylbMF07cmV0dXJuIGMubW18fGMubXx8KGMubT1iLmluZGV4T2YoZCkpLGQubGVuZ3RofWZ1bmN0aW9uIGIoYSl7cmV0dXJuIGEubWF0Y2goL1xcdysvKVswXS5sZW5ndGh9cmV0dXJue2Q6ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT9mLmRpZ2l0cyhhKTpiLmRhdGV9LGRkOmZ1bmN0aW9uKGEsYil7cmV0dXJuIGE/MjpmLmxlYWQoYi5kYXRlKX0sZGRkOmZ1bmN0aW9uKGEsYyl7cmV0dXJuIGE/YihhKTp0aGlzLnNldHRpbmdzLndlZWtkYXlzU2hvcnRbYy5kYXldfSxkZGRkOmZ1bmN0aW9uKGEsYyl7cmV0dXJuIGE/YihhKTp0aGlzLnNldHRpbmdzLndlZWtkYXlzRnVsbFtjLmRheV19LG06ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT9mLmRpZ2l0cyhhKTpiLm1vbnRoKzF9LG1tOmZ1bmN0aW9uKGEsYil7cmV0dXJuIGE/MjpmLmxlYWQoYi5tb250aCsxKX0sbW1tOmZ1bmN0aW9uKGIsYyl7dmFyIGQ9dGhpcy5zZXR0aW5ncy5tb250aHNTaG9ydDtyZXR1cm4gYj9hKGIsZCxjKTpkW2MubW9udGhdfSxtbW1tOmZ1bmN0aW9uKGIsYyl7dmFyIGQ9dGhpcy5zZXR0aW5ncy5tb250aHNGdWxsO3JldHVybiBiP2EoYixkLGMpOmRbYy5tb250aF19LHl5OmZ1bmN0aW9uKGEsYil7cmV0dXJuIGE/MjooXCJcIitiLnllYXIpLnNsaWNlKDIpfSx5eXl5OmZ1bmN0aW9uKGEsYil7cmV0dXJuIGE/NDpiLnllYXJ9LHRvQXJyYXk6ZnVuY3Rpb24oYSl7cmV0dXJuIGEuc3BsaXQoLyhkezEsNH18bXsxLDR9fHl7NH18eXl8IS4pL2cpfSx0b1N0cmluZzpmdW5jdGlvbihhLGIpe3ZhciBjPXRoaXM7cmV0dXJuIGMuZm9ybWF0cy50b0FycmF5KGEpLm1hcChmdW5jdGlvbihhKXtyZXR1cm4gZi50cmlnZ2VyKGMuZm9ybWF0c1thXSxjLFswLGJdKXx8YS5yZXBsYWNlKC9eIS8sXCJcIil9KS5qb2luKFwiXCIpfX19KCksYy5wcm90b3R5cGUuaXNEYXRlRXhhY3Q9ZnVuY3Rpb24oYSxjKXt2YXIgZD10aGlzO3JldHVybiBmLmlzSW50ZWdlcihhKSYmZi5pc0ludGVnZXIoYyl8fFwiYm9vbGVhblwiPT10eXBlb2YgYSYmXCJib29sZWFuXCI9PXR5cGVvZiBjP2E9PT1jOihmLmlzRGF0ZShhKXx8Yi5pc0FycmF5KGEpKSYmKGYuaXNEYXRlKGMpfHxiLmlzQXJyYXkoYykpP2QuY3JlYXRlKGEpLnBpY2s9PT1kLmNyZWF0ZShjKS5waWNrOmIuaXNPYmplY3QoYSkmJmIuaXNPYmplY3QoYyk/ZC5pc0RhdGVFeGFjdChhLmZyb20sYy5mcm9tKSYmZC5pc0RhdGVFeGFjdChhLnRvLGMudG8pOiExfSxjLnByb3RvdHlwZS5pc0RhdGVPdmVybGFwPWZ1bmN0aW9uKGEsYyl7dmFyIGQ9dGhpcztyZXR1cm4gZi5pc0ludGVnZXIoYSkmJihmLmlzRGF0ZShjKXx8Yi5pc0FycmF5KGMpKT9hPT09ZC5jcmVhdGUoYykuZGF5KzE6Zi5pc0ludGVnZXIoYykmJihmLmlzRGF0ZShhKXx8Yi5pc0FycmF5KGEpKT9jPT09ZC5jcmVhdGUoYSkuZGF5KzE6Yi5pc09iamVjdChhKSYmYi5pc09iamVjdChjKT9kLm92ZXJsYXBSYW5nZXMoYSxjKTohMX0sYy5wcm90b3R5cGUuZmxpcEVuYWJsZT1mdW5jdGlvbihhKXt2YXIgYj10aGlzLml0ZW07Yi5lbmFibGU9YXx8KC0xPT1iLmVuYWJsZT8xOi0xKX0sYy5wcm90b3R5cGUuZGVhY3RpdmF0ZT1mdW5jdGlvbihhLGMpe3ZhciBkPXRoaXMsZT1kLml0ZW0uZGlzYWJsZS5zbGljZSgwKTtyZXR1cm5cImZsaXBcIj09Yz9kLmZsaXBFbmFibGUoKTpjPT09ITE/KGQuZmxpcEVuYWJsZSgxKSxlPVtdKTpjPT09ITA/KGQuZmxpcEVuYWJsZSgtMSksZT1bXSk6Yy5tYXAoZnVuY3Rpb24oYSl7Zm9yKHZhciBjLGc9MDtnPGUubGVuZ3RoO2crPTEpaWYoZC5pc0RhdGVFeGFjdChhLGVbZ10pKXtjPSEwO2JyZWFrfWN8fChmLmlzSW50ZWdlcihhKXx8Zi5pc0RhdGUoYSl8fGIuaXNBcnJheShhKXx8Yi5pc09iamVjdChhKSYmYS5mcm9tJiZhLnRvKSYmZS5wdXNoKGEpfSksZX0sYy5wcm90b3R5cGUuYWN0aXZhdGU9ZnVuY3Rpb24oYSxjKXt2YXIgZD10aGlzLGU9ZC5pdGVtLmRpc2FibGUsZz1lLmxlbmd0aDtyZXR1cm5cImZsaXBcIj09Yz9kLmZsaXBFbmFibGUoKTpjPT09ITA/KGQuZmxpcEVuYWJsZSgxKSxlPVtdKTpjPT09ITE/KGQuZmxpcEVuYWJsZSgtMSksZT1bXSk6Yy5tYXAoZnVuY3Rpb24oYSl7dmFyIGMsaCxpLGo7Zm9yKGk9MDtnPmk7aSs9MSl7aWYoaD1lW2ldLGQuaXNEYXRlRXhhY3QoaCxhKSl7Yz1lW2ldPW51bGwsaj0hMDticmVha31pZihkLmlzRGF0ZU92ZXJsYXAoaCxhKSl7Yi5pc09iamVjdChhKT8oYS5pbnZlcnRlZD0hMCxjPWEpOmIuaXNBcnJheShhKT8oYz1hLGNbM118fGMucHVzaChcImludmVydGVkXCIpKTpmLmlzRGF0ZShhKSYmKGM9W2EuZ2V0RnVsbFllYXIoKSxhLmdldE1vbnRoKCksYS5nZXREYXRlKCksXCJpbnZlcnRlZFwiXSk7YnJlYWt9fWlmKGMpZm9yKGk9MDtnPmk7aSs9MSlpZihkLmlzRGF0ZUV4YWN0KGVbaV0sYSkpe2VbaV09bnVsbDticmVha31pZihqKWZvcihpPTA7Zz5pO2krPTEpaWYoZC5pc0RhdGVPdmVybGFwKGVbaV0sYSkpe2VbaV09bnVsbDticmVha31jJiZlLnB1c2goYyl9KSxlLmZpbHRlcihmdW5jdGlvbihhKXtyZXR1cm4gbnVsbCE9YX0pfSxjLnByb3RvdHlwZS5ub2Rlcz1mdW5jdGlvbihhKXt2YXIgYj10aGlzLGM9Yi5zZXR0aW5ncyxnPWIuaXRlbSxoPWcubm93LGk9Zy5zZWxlY3Qsaj1nLmhpZ2hsaWdodCxrPWcudmlldyxsPWcuZGlzYWJsZSxtPWcubWluLG49Zy5tYXgsbz1mdW5jdGlvbihhKXtyZXR1cm4gYy5maXJzdERheSYmYS5wdXNoKGEuc2hpZnQoKSksZi5ub2RlKFwidGhlYWRcIixmLm5vZGUoXCJ0clwiLGYuZ3JvdXAoe21pbjowLG1heDpkLTEsaToxLG5vZGU6XCJ0aFwiLGl0ZW06ZnVuY3Rpb24oYil7cmV0dXJuW2FbYl0sYy5rbGFzcy53ZWVrZGF5c119fSkpKX0oKGMuc2hvd1dlZWtkYXlzRnVsbD9jLndlZWtkYXlzRnVsbDpjLndlZWtkYXlzU2hvcnQpLnNsaWNlKDApKSxwPWZ1bmN0aW9uKGEpe3JldHVybiBmLm5vZGUoXCJkaXZcIixcIiBcIixjLmtsYXNzW1wibmF2XCIrKGE/XCJOZXh0XCI6XCJQcmV2XCIpXSsoYSYmay55ZWFyPj1uLnllYXImJmsubW9udGg+PW4ubW9udGh8fCFhJiZrLnllYXI8PW0ueWVhciYmay5tb250aDw9bS5tb250aD9cIiBcIitjLmtsYXNzLm5hdkRpc2FibGVkOlwiXCIpLFwiZGF0YS1uYXY9XCIrKGF8fC0xKSl9LHE9ZnVuY3Rpb24oYil7cmV0dXJuIGMuc2VsZWN0TW9udGhzP2Yubm9kZShcInNlbGVjdFwiLGYuZ3JvdXAoe21pbjowLG1heDoxMSxpOjEsbm9kZTpcIm9wdGlvblwiLGl0ZW06ZnVuY3Rpb24oYSl7cmV0dXJuW2JbYV0sMCxcInZhbHVlPVwiK2ErKGsubW9udGg9PWE/XCIgc2VsZWN0ZWRcIjpcIlwiKSsoay55ZWFyPT1tLnllYXImJmE8bS5tb250aHx8ay55ZWFyPT1uLnllYXImJmE+bi5tb250aD9cIiBkaXNhYmxlZFwiOlwiXCIpXX19KSxjLmtsYXNzLnNlbGVjdE1vbnRoLGE/XCJcIjpcImRpc2FibGVkXCIpOmYubm9kZShcImRpdlwiLGJbay5tb250aF0sYy5rbGFzcy5tb250aCl9LHI9ZnVuY3Rpb24oKXt2YXIgYj1rLnllYXIsZD1jLnNlbGVjdFllYXJzPT09ITA/NTp+fihjLnNlbGVjdFllYXJzLzIpO2lmKGQpe3ZhciBlPW0ueWVhcixnPW4ueWVhcixoPWItZCxpPWIrZDtpZihlPmgmJihpKz1lLWgsaD1lKSxpPmcpe3ZhciBqPWgtZSxsPWktZztoLT1qPmw/bDpqLGk9Z31yZXR1cm4gZi5ub2RlKFwic2VsZWN0XCIsZi5ncm91cCh7bWluOmgsbWF4OmksaToxLG5vZGU6XCJvcHRpb25cIixpdGVtOmZ1bmN0aW9uKGEpe3JldHVyblthLDAsXCJ2YWx1ZT1cIithKyhiPT1hP1wiIHNlbGVjdGVkXCI6XCJcIildfX0pLGMua2xhc3Muc2VsZWN0WWVhcixhP1wiXCI6XCJkaXNhYmxlZFwiKX1yZXR1cm4gZi5ub2RlKFwiZGl2XCIsYixjLmtsYXNzLnllYXIpfTtyZXR1cm4gZi5ub2RlKFwiZGl2XCIscCgpK3AoMSkrcShjLnNob3dNb250aHNTaG9ydD9jLm1vbnRoc1Nob3J0OmMubW9udGhzRnVsbCkrcigpLGMua2xhc3MuaGVhZGVyKStmLm5vZGUoXCJ0YWJsZVwiLG8rZi5ub2RlKFwidGJvZHlcIixmLmdyb3VwKHttaW46MCxtYXg6ZS0xLGk6MSxub2RlOlwidHJcIixpdGVtOmZ1bmN0aW9uKGEpe3ZhciBlPWMuZmlyc3REYXkmJjA9PT1iLmNyZWF0ZShbay55ZWFyLGsubW9udGgsMV0pLmRheT8tNzowO3JldHVybltmLmdyb3VwKHttaW46ZCphLWsuZGF5K2UrMSxtYXg6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5taW4rZC0xfSxpOjEsbm9kZTpcInRkXCIsaXRlbTpmdW5jdGlvbihhKXthPWIuY3JlYXRlKFtrLnllYXIsay5tb250aCxhKyhjLmZpcnN0RGF5PzE6MCldKTt2YXIgZD1pJiZpLnBpY2s9PWEucGljayxlPWomJmoucGljaz09YS5waWNrLGc9bCYmYi5kaXNhYmxlZChhKXx8YS5waWNrPG0ucGlja3x8YS5waWNrPm4ucGljaztyZXR1cm5bZi5ub2RlKFwiZGl2XCIsYS5kYXRlLGZ1bmN0aW9uKGIpe3JldHVybiBiLnB1c2goay5tb250aD09YS5tb250aD9jLmtsYXNzLmluZm9jdXM6Yy5rbGFzcy5vdXRmb2N1cyksaC5waWNrPT1hLnBpY2smJmIucHVzaChjLmtsYXNzLm5vdyksZCYmYi5wdXNoKGMua2xhc3Muc2VsZWN0ZWQpLGUmJmIucHVzaChjLmtsYXNzLmhpZ2hsaWdodGVkKSxnJiZiLnB1c2goYy5rbGFzcy5kaXNhYmxlZCksYi5qb2luKFwiIFwiKX0oW2Mua2xhc3MuZGF5XSksXCJkYXRhLXBpY2s9XCIrYS5waWNrK1wiIFwiK2YuYXJpYUF0dHIoe3JvbGU6XCJidXR0b25cIixjb250cm9sczpiLiRub2RlWzBdLmlkLGNoZWNrZWQ6ZCYmYi4kbm9kZVswXS52YWx1ZT09PWYudHJpZ2dlcihiLmZvcm1hdHMudG9TdHJpbmcsYixbYy5mb3JtYXQsYV0pPyEwOm51bGwsYWN0aXZlZGVzY2VuZGFudDplPyEwOm51bGwsZGlzYWJsZWQ6Zz8hMDpudWxsfSkpXX19KV19fSkpLGMua2xhc3MudGFibGUpK2Yubm9kZShcImRpdlwiLGYubm9kZShcImJ1dHRvblwiLGMudG9kYXksYy5rbGFzcy5idXR0b25Ub2RheSxcInR5cGU9YnV0dG9uIGRhdGEtcGljaz1cIitoLnBpY2srKGE/XCJcIjpcIiBkaXNhYmxlZFwiKSkrZi5ub2RlKFwiYnV0dG9uXCIsYy5jbGVhcixjLmtsYXNzLmJ1dHRvbkNsZWFyLFwidHlwZT1idXR0b24gZGF0YS1jbGVhcj0xXCIrKGE/XCJcIjpcIiBkaXNhYmxlZFwiKSksYy5rbGFzcy5mb290ZXIpfSxjLmRlZmF1bHRzPWZ1bmN0aW9uKGEpe3JldHVybnttb250aHNGdWxsOltcIkphbnVhcnlcIixcIkZlYnJ1YXJ5XCIsXCJNYXJjaFwiLFwiQXByaWxcIixcIk1heVwiLFwiSnVuZVwiLFwiSnVseVwiLFwiQXVndXN0XCIsXCJTZXB0ZW1iZXJcIixcIk9jdG9iZXJcIixcIk5vdmVtYmVyXCIsXCJEZWNlbWJlclwiXSxtb250aHNTaG9ydDpbXCJKYW5cIixcIkZlYlwiLFwiTWFyXCIsXCJBcHJcIixcIk1heVwiLFwiSnVuXCIsXCJKdWxcIixcIkF1Z1wiLFwiU2VwXCIsXCJPY3RcIixcIk5vdlwiLFwiRGVjXCJdLHdlZWtkYXlzRnVsbDpbXCJTdW5kYXlcIixcIk1vbmRheVwiLFwiVHVlc2RheVwiLFwiV2VkbmVzZGF5XCIsXCJUaHVyc2RheVwiLFwiRnJpZGF5XCIsXCJTYXR1cmRheVwiXSx3ZWVrZGF5c1Nob3J0OltcIlN1blwiLFwiTW9uXCIsXCJUdWVcIixcIldlZFwiLFwiVGh1XCIsXCJGcmlcIixcIlNhdFwiXSx0b2RheTpcIlRvZGF5XCIsY2xlYXI6XCJDbGVhclwiLGZvcm1hdDpcImQgbW1tbSwgeXl5eVwiLGtsYXNzOnt0YWJsZTphK1widGFibGVcIixoZWFkZXI6YStcImhlYWRlclwiLG5hdlByZXY6YStcIm5hdi0tcHJldlwiLG5hdk5leHQ6YStcIm5hdi0tbmV4dFwiLG5hdkRpc2FibGVkOmErXCJuYXYtLWRpc2FibGVkXCIsbW9udGg6YStcIm1vbnRoXCIseWVhcjphK1wieWVhclwiLHNlbGVjdE1vbnRoOmErXCJzZWxlY3QtLW1vbnRoXCIsc2VsZWN0WWVhcjphK1wic2VsZWN0LS15ZWFyXCIsd2Vla2RheXM6YStcIndlZWtkYXlcIixkYXk6YStcImRheVwiLGRpc2FibGVkOmErXCJkYXktLWRpc2FibGVkXCIsc2VsZWN0ZWQ6YStcImRheS0tc2VsZWN0ZWRcIixoaWdobGlnaHRlZDphK1wiZGF5LS1oaWdobGlnaHRlZFwiLG5vdzphK1wiZGF5LS10b2RheVwiLGluZm9jdXM6YStcImRheS0taW5mb2N1c1wiLG91dGZvY3VzOmErXCJkYXktLW91dGZvY3VzXCIsZm9vdGVyOmErXCJmb290ZXJcIixidXR0b25DbGVhcjphK1wiYnV0dG9uLS1jbGVhclwiLGJ1dHRvblRvZGF5OmErXCJidXR0b24tLXRvZGF5XCJ9fX0oYS5rbGFzc2VzKCkucGlja2VyK1wiX19cIiksYS5leHRlbmQoXCJwaWNrYWRhdGVcIixjKX0pO1xuLyohXG4gKiBUaW1lIHBpY2tlciBmb3IgcGlja2FkYXRlLmpzIHYzLjQuMFxuICogaHR0cDovL2Ftc3VsLmdpdGh1Yi5pby9waWNrYWRhdGUuanMvdGltZS5odG1cbiAqL1xuIWZ1bmN0aW9uKGEpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoW1wicGlja2VyXCIsXCJhbmd1bGFyXCJdLGEpOmEoUGlja2VyLGFuZ3VsYXIpfShmdW5jdGlvbihhLGIpe2Z1bmN0aW9uIGMoYSxiKXt2YXIgYz10aGlzLGQ9YS4kbm9kZVswXS52YWx1ZSxlPWEuJG5vZGUuZGF0YShcInZhbHVlXCIpLGY9ZXx8ZCxnPWU/Yi5mb3JtYXRTdWJtaXQ6Yi5mb3JtYXQ7Yy5zZXR0aW5ncz1iLGMuJG5vZGU9YS4kbm9kZSxjLnF1ZXVlPXtpbnRlcnZhbDpcImlcIixtaW46XCJtZWFzdXJlIGNyZWF0ZVwiLG1heDpcIm1lYXN1cmUgY3JlYXRlXCIsbm93Olwibm93IGNyZWF0ZVwiLHNlbGVjdDpcInBhcnNlIGNyZWF0ZSB2YWxpZGF0ZVwiLGhpZ2hsaWdodDpcInBhcnNlIGNyZWF0ZSB2YWxpZGF0ZVwiLHZpZXc6XCJwYXJzZSBjcmVhdGUgdmFsaWRhdGVcIixkaXNhYmxlOlwiZGVhY3RpdmF0ZVwiLGVuYWJsZTpcImFjdGl2YXRlXCJ9LGMuaXRlbT17fSxjLml0ZW0uaW50ZXJ2YWw9Yi5pbnRlcnZhbHx8MzAsYy5pdGVtLmRpc2FibGU9KGIuZGlzYWJsZXx8W10pLnNsaWNlKDApLGMuaXRlbS5lbmFibGU9LWZ1bmN0aW9uKGEpe3JldHVybiBhWzBdPT09ITA/YS5zaGlmdCgpOi0xfShjLml0ZW0uZGlzYWJsZSksYy5zZXQoXCJtaW5cIixiLm1pbikuc2V0KFwibWF4XCIsYi5tYXgpLnNldChcIm5vd1wiKSxmP2Muc2V0KFwic2VsZWN0XCIsZix7Zm9ybWF0OmcsZnJvbVZhbHVlOiEhZH0pOmMuc2V0KFwic2VsZWN0XCIsbnVsbCkuc2V0KFwiaGlnaGxpZ2h0XCIsYy5pdGVtLm5vdyksYy5rZXk9ezQwOjEsMzg6LTEsMzk6MSwzNzotMSxnbzpmdW5jdGlvbihhKXtjLnNldChcImhpZ2hsaWdodFwiLGMuaXRlbS5oaWdobGlnaHQucGljaythKmMuaXRlbS5pbnRlcnZhbCx7aW50ZXJ2YWw6YSpjLml0ZW0uaW50ZXJ2YWx9KSx0aGlzLnJlbmRlcigpfX0sYS5vbihcInJlbmRlclwiLGZ1bmN0aW9uKCl7dmFyIGM9YS4kcm9vdC5jaGlsZHJlbigpLGQ9Yy5maW5kKFwiLlwiK2Iua2xhc3Mudmlld3NldCk7ZC5sZW5ndGgmJihjWzBdLnNjcm9sbFRvcD1+fmQucG9zaXRpb24oKS50b3AtMipkWzBdLmNsaWVudEhlaWdodCl9KS5vbihcIm9wZW5cIixmdW5jdGlvbigpe2EuJHJvb3QuZmluZChcImJ1dHRvblwiKS5hdHRyKFwiZGlzYWJsZVwiLCExKX0pLm9uKFwiY2xvc2VcIixmdW5jdGlvbigpe2EuJHJvb3QuZmluZChcImJ1dHRvblwiKS5hdHRyKFwiZGlzYWJsZVwiLCEwKX0pfXZhciBkPTI0LGU9NjAsZj0xMixnPWQqZSxoPWEuXztjLnByb3RvdHlwZS5zZXQ9ZnVuY3Rpb24oYSxiLGMpe3ZhciBkPXRoaXMsZT1kLml0ZW07cmV0dXJuIG51bGw9PT1iPyhlW2FdPWIsZCk6KGVbXCJlbmFibGVcIj09YT9cImRpc2FibGVcIjpcImZsaXBcIj09YT9cImVuYWJsZVwiOmFdPWQucXVldWVbYV0uc3BsaXQoXCIgXCIpLm1hcChmdW5jdGlvbihlKXtyZXR1cm4gYj1kW2VdKGEsYixjKX0pLnBvcCgpLFwic2VsZWN0XCI9PWE/ZC5zZXQoXCJoaWdobGlnaHRcIixlLnNlbGVjdCxjKTpcImhpZ2hsaWdodFwiPT1hP2Quc2V0KFwidmlld1wiLGUuaGlnaGxpZ2h0LGMpOlwiaW50ZXJ2YWxcIj09YT9kLnNldChcIm1pblwiLGUubWluLGMpLnNldChcIm1heFwiLGUubWF4LGMpOmEubWF0Y2goL14oZmxpcHxtaW58bWF4fGRpc2FibGV8ZW5hYmxlKSQvKSYmKFwibWluXCI9PWEmJmQuc2V0KFwibWF4XCIsZS5tYXgsYyksZS5zZWxlY3QmJmQuZGlzYWJsZWQoZS5zZWxlY3QpJiZkLnNldChcInNlbGVjdFwiLGUuc2VsZWN0LGMpLGUuaGlnaGxpZ2h0JiZkLmRpc2FibGVkKGUuaGlnaGxpZ2h0KSYmZC5zZXQoXCJoaWdobGlnaHRcIixlLmhpZ2hsaWdodCxjKSksZCl9LGMucHJvdG90eXBlLmdldD1mdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5pdGVtW2FdfSxjLnByb3RvdHlwZS5jcmVhdGU9ZnVuY3Rpb24oYSxjLGYpe3ZhciBpPXRoaXM7cmV0dXJuIGM9dm9pZCAwPT09Yz9hOmMsaC5pc0RhdGUoYykmJihjPVtjLmdldEhvdXJzKCksYy5nZXRNaW51dGVzKCldKSxiLmlzT2JqZWN0KGMpJiZoLmlzSW50ZWdlcihjLnBpY2spP2M9Yy5waWNrOmIuaXNBcnJheShjKT9jPStjWzBdKmUrICtjWzFdOmguaXNJbnRlZ2VyKGMpfHwoYz1pLm5vdyhhLGMsZikpLFwibWF4XCI9PWEmJmM8aS5pdGVtLm1pbi5waWNrJiYoYys9ZyksXCJtaW5cIiE9YSYmXCJtYXhcIiE9YSYmKGMtaS5pdGVtLm1pbi5waWNrKSVpLml0ZW0uaW50ZXJ2YWwhPT0wJiYoYys9aS5pdGVtLmludGVydmFsKSxjPWkubm9ybWFsaXplKGEsYyxmKSx7aG91cjp+fihkK2MvZSklZCxtaW5zOihlK2MlZSklZSx0aW1lOihnK2MpJWcscGljazpjfX0sYy5wcm90b3R5cGUuY3JlYXRlUmFuZ2U9ZnVuY3Rpb24oYSxjKXt2YXIgZD10aGlzLGU9ZnVuY3Rpb24oYSl7cmV0dXJuIGE9PT0hMHx8Yi5pc0FycmF5KGEpfHxoLmlzRGF0ZShhKT9kLmNyZWF0ZShhKTphfTtyZXR1cm4gaC5pc0ludGVnZXIoYSl8fChhPWUoYSkpLGguaXNJbnRlZ2VyKGMpfHwoYz1lKGMpKSxoLmlzSW50ZWdlcihhKSYmYi5pc09iamVjdChjKT9hPVtjLmhvdXIsYy5taW5zK2EqZC5zZXR0aW5ncy5pbnRlcnZhbF06aC5pc0ludGVnZXIoYykmJmIuaXNPYmplY3QoYSkmJihjPVthLmhvdXIsYS5taW5zK2MqZC5zZXR0aW5ncy5pbnRlcnZhbF0pLHtmcm9tOmUoYSksdG86ZShjKX19LGMucHJvdG90eXBlLndpdGhpblJhbmdlPWZ1bmN0aW9uKGEsYil7cmV0dXJuIGE9dGhpcy5jcmVhdGVSYW5nZShhLmZyb20sYS50byksYi5waWNrPj1hLmZyb20ucGljayYmYi5waWNrPD1hLnRvLnBpY2t9LGMucHJvdG90eXBlLm92ZXJsYXBSYW5nZXM9ZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzO3JldHVybiBhPWMuY3JlYXRlUmFuZ2UoYS5mcm9tLGEudG8pLGI9Yy5jcmVhdGVSYW5nZShiLmZyb20sYi50byksYy53aXRoaW5SYW5nZShhLGIuZnJvbSl8fGMud2l0aGluUmFuZ2UoYSxiLnRvKXx8Yy53aXRoaW5SYW5nZShiLGEuZnJvbSl8fGMud2l0aGluUmFuZ2UoYixhLnRvKX0sYy5wcm90b3R5cGUubm93PWZ1bmN0aW9uKGEsYil7dmFyIGMsZD10aGlzLml0ZW0uaW50ZXJ2YWwsZj1uZXcgRGF0ZSxnPWYuZ2V0SG91cnMoKSplK2YuZ2V0TWludXRlcygpLGk9aC5pc0ludGVnZXIoYik7cmV0dXJuIGctPWclZCxjPTA+YiYmLWQ+PWQqYitnLGcrPVwibWluXCI9PWEmJmM/MDpkLGkmJihnKz1kKihjJiZcIm1heFwiIT1hP2IrMTpiKSksZ30sYy5wcm90b3R5cGUubm9ybWFsaXplPWZ1bmN0aW9uKGEsYil7dmFyIGM9dGhpcy5pdGVtLmludGVydmFsLGQ9dGhpcy5pdGVtLm1pbiYmdGhpcy5pdGVtLm1pbi5waWNrfHwwO3JldHVybiBiLT1cIm1pblwiPT1hPzA6KGItZCklY30sYy5wcm90b3R5cGUubWVhc3VyZT1mdW5jdGlvbihhLGMsZil7dmFyIGc9dGhpcztyZXR1cm4gYz9jPT09ITB8fGguaXNJbnRlZ2VyKGMpP2M9Zy5ub3coYSxjLGYpOmIuaXNPYmplY3QoYykmJmguaXNJbnRlZ2VyKGMucGljaykmJihjPWcubm9ybWFsaXplKGEsYy5waWNrLGYpKTpjPVwibWluXCI9PWE/WzAsMF06W2QtMSxlLTFdLGN9LGMucHJvdG90eXBlLnZhbGlkYXRlPWZ1bmN0aW9uKGEsYixjKXt2YXIgZD10aGlzLGU9YyYmYy5pbnRlcnZhbD9jLmludGVydmFsOmQuaXRlbS5pbnRlcnZhbDtyZXR1cm4gZC5kaXNhYmxlZChiKSYmKGI9ZC5zaGlmdChiLGUpKSxiPWQuc2NvcGUoYiksZC5kaXNhYmxlZChiKSYmKGI9ZC5zaGlmdChiLC0xKmUpKSxifSxjLnByb3RvdHlwZS5kaXNhYmxlZD1mdW5jdGlvbihhKXt2YXIgYz10aGlzLGQ9Yy5pdGVtLmRpc2FibGUuZmlsdGVyKGZ1bmN0aW9uKGQpe3JldHVybiBoLmlzSW50ZWdlcihkKT9hLmhvdXI9PWQ6Yi5pc0FycmF5KGQpfHxoLmlzRGF0ZShkKT9hLnBpY2s9PWMuY3JlYXRlKGQpLnBpY2s6Yi5pc09iamVjdChkKT9jLndpdGhpblJhbmdlKGQsYSk6dm9pZCAwfSk7cmV0dXJuIGQ9ZC5sZW5ndGgmJiFkLmZpbHRlcihmdW5jdGlvbihhKXtyZXR1cm4gYi5pc0FycmF5KGEpJiZcImludmVydGVkXCI9PWFbMl18fGIuaXNPYmplY3QoYSkmJmEuaW52ZXJ0ZWR9KS5sZW5ndGgsLTE9PT1jLml0ZW0uZW5hYmxlPyFkOmR8fGEucGljazxjLml0ZW0ubWluLnBpY2t8fGEucGljaz5jLml0ZW0ubWF4LnBpY2t9LGMucHJvdG90eXBlLnNoaWZ0PWZ1bmN0aW9uKGEsYil7dmFyIGM9dGhpcyxkPWMuaXRlbS5taW4ucGljayxlPWMuaXRlbS5tYXgucGljaztmb3IoYj1ifHxjLml0ZW0uaW50ZXJ2YWw7Yy5kaXNhYmxlZChhKSYmKGE9Yy5jcmVhdGUoYS5waWNrKz1iKSwhKGEucGljazw9ZHx8YS5waWNrPj1lKSk7KTtyZXR1cm4gYX0sYy5wcm90b3R5cGUuc2NvcGU9ZnVuY3Rpb24oYSl7dmFyIGI9dGhpcy5pdGVtLm1pbi5waWNrLGM9dGhpcy5pdGVtLm1heC5waWNrO3JldHVybiB0aGlzLmNyZWF0ZShhLnBpY2s+Yz9jOmEucGljazxiP2I6YSl9LGMucHJvdG90eXBlLnBhcnNlPWZ1bmN0aW9uKGEsYyxkKXt2YXIgZixnLGksaixrLGw9dGhpcyxtPXt9O2lmKCFjfHxoLmlzSW50ZWdlcihjKXx8Yi5pc0FycmF5KGMpfHxoLmlzRGF0ZShjKXx8Yi5pc09iamVjdChjKSYmaC5pc0ludGVnZXIoYy5waWNrKSlyZXR1cm4gYztkJiZkLmZvcm1hdHx8KGQ9ZHx8e30sZC5mb3JtYXQ9bC5zZXR0aW5ncy5mb3JtYXQpLGwuZm9ybWF0cy50b0FycmF5KGQuZm9ybWF0KS5tYXAoZnVuY3Rpb24oYSl7dmFyIGIsZD1sLmZvcm1hdHNbYV0sZT1kP2gudHJpZ2dlcihkLGwsW2MsbV0pOmEucmVwbGFjZSgvXiEvLFwiXCIpLmxlbmd0aDtkJiYoYj1jLnN1YnN0cigwLGUpLG1bYV09Yi5tYXRjaCgvXlxcZCskLyk/K2I6YiksYz1jLnN1YnN0cihlKX0pO2ZvcihqIGluIG0paz1tW2pdLGguaXNJbnRlZ2VyKGspP2oubWF0Y2goL14oaHxoaCkkL2kpPyhmPWssKFwiaFwiPT1qfHxcImhoXCI9PWopJiYoZiU9MTIpKTpcImlcIj09aiYmKGc9ayk6ai5tYXRjaCgvXmEkL2kpJiZrLm1hdGNoKC9ecC9pKSYmKFwiaFwiaW4gbXx8XCJoaFwiaW4gbSkmJihpPSEwKTtyZXR1cm4oaT9mKzEyOmYpKmUrZ30sYy5wcm90b3R5cGUuZm9ybWF0cz17aDpmdW5jdGlvbihhLGIpe3JldHVybiBhP2guZGlnaXRzKGEpOmIuaG91ciVmfHxmfSxoaDpmdW5jdGlvbihhLGIpe3JldHVybiBhPzI6aC5sZWFkKGIuaG91ciVmfHxmKX0sSDpmdW5jdGlvbihhLGIpe3JldHVybiBhP2guZGlnaXRzKGEpOlwiXCIrYi5ob3VyJTI0fSxISDpmdW5jdGlvbihhLGIpe3JldHVybiBhP2guZGlnaXRzKGEpOmgubGVhZChiLmhvdXIlMjQpfSxpOmZ1bmN0aW9uKGEsYil7cmV0dXJuIGE/MjpoLmxlYWQoYi5taW5zKX0sYTpmdW5jdGlvbihhLGIpe3JldHVybiBhPzQ6Zy8yPmIudGltZSVnP1wiYS5tLlwiOlwicC5tLlwifSxBOmZ1bmN0aW9uKGEsYil7cmV0dXJuIGE/MjpnLzI+Yi50aW1lJWc/XCJBTVwiOlwiUE1cIn0sdG9BcnJheTpmdW5jdGlvbihhKXtyZXR1cm4gYS5zcGxpdCgvKGh7MSwyfXxIezEsMn18aXxhfEF8IS4pL2cpfSx0b1N0cmluZzpmdW5jdGlvbihhLGIpe3ZhciBjPXRoaXM7cmV0dXJuIGMuZm9ybWF0cy50b0FycmF5KGEpLm1hcChmdW5jdGlvbihhKXtyZXR1cm4gaC50cmlnZ2VyKGMuZm9ybWF0c1thXSxjLFswLGJdKXx8YS5yZXBsYWNlKC9eIS8sXCJcIil9KS5qb2luKFwiXCIpfX0sYy5wcm90b3R5cGUuaXNUaW1lRXhhY3Q9ZnVuY3Rpb24oYSxjKXt2YXIgZD10aGlzO3JldHVybiBoLmlzSW50ZWdlcihhKSYmaC5pc0ludGVnZXIoYyl8fFwiYm9vbGVhblwiPT10eXBlb2YgYSYmXCJib29sZWFuXCI9PXR5cGVvZiBjP2E9PT1jOihoLmlzRGF0ZShhKXx8Yi5pc0FycmF5KGEpKSYmKGguaXNEYXRlKGMpfHxiLmlzQXJyYXkoYykpP2QuY3JlYXRlKGEpLnBpY2s9PT1kLmNyZWF0ZShjKS5waWNrOmIuaXNPYmplY3QoYSkmJmIuaXNPYmplY3QoYyk/ZC5pc1RpbWVFeGFjdChhLmZyb20sYy5mcm9tKSYmZC5pc1RpbWVFeGFjdChhLnRvLGMudG8pOiExfSxjLnByb3RvdHlwZS5pc1RpbWVPdmVybGFwPWZ1bmN0aW9uKGEsYyl7dmFyIGQ9dGhpcztyZXR1cm4gaC5pc0ludGVnZXIoYSkmJihoLmlzRGF0ZShjKXx8Yi5pc0FycmF5KGMpKT9hPT09ZC5jcmVhdGUoYykuaG91cjpoLmlzSW50ZWdlcihjKSYmKGguaXNEYXRlKGEpfHxiLmlzQXJyYXkoYSkpP2M9PT1kLmNyZWF0ZShhKS5ob3VyOmIuaXNPYmplY3QoYSkmJmIuaXNPYmplY3QoYyk/ZC5vdmVybGFwUmFuZ2VzKGEsYyk6ITF9LGMucHJvdG90eXBlLmZsaXBFbmFibGU9ZnVuY3Rpb24oYSl7dmFyIGI9dGhpcy5pdGVtO2IuZW5hYmxlPWF8fCgtMT09Yi5lbmFibGU/MTotMSl9LGMucHJvdG90eXBlLmRlYWN0aXZhdGU9ZnVuY3Rpb24oYSxjKXt2YXIgZD10aGlzLGU9ZC5pdGVtLmRpc2FibGUuc2xpY2UoMCk7cmV0dXJuXCJmbGlwXCI9PWM/ZC5mbGlwRW5hYmxlKCk6Yz09PSExPyhkLmZsaXBFbmFibGUoMSksZT1bXSk6Yz09PSEwPyhkLmZsaXBFbmFibGUoLTEpLGU9W10pOmMubWFwKGZ1bmN0aW9uKGEpe2Zvcih2YXIgYyxmPTA7ZjxlLmxlbmd0aDtmKz0xKWlmKGQuaXNUaW1lRXhhY3QoYSxlW2ZdKSl7Yz0hMDticmVha31jfHwoaC5pc0ludGVnZXIoYSl8fGguaXNEYXRlKGEpfHxiLmlzQXJyYXkoYSl8fGIuaXNPYmplY3QoYSkmJmEuZnJvbSYmYS50bykmJmUucHVzaChhKX0pLGV9LGMucHJvdG90eXBlLmFjdGl2YXRlPWZ1bmN0aW9uKGEsYyl7dmFyIGQ9dGhpcyxlPWQuaXRlbS5kaXNhYmxlLGY9ZS5sZW5ndGg7cmV0dXJuXCJmbGlwXCI9PWM/ZC5mbGlwRW5hYmxlKCk6Yz09PSEwPyhkLmZsaXBFbmFibGUoMSksZT1bXSk6Yz09PSExPyhkLmZsaXBFbmFibGUoLTEpLGU9W10pOmMubWFwKGZ1bmN0aW9uKGEpe3ZhciBjLGcsaSxqO2ZvcihpPTA7Zj5pO2krPTEpe2lmKGc9ZVtpXSxkLmlzVGltZUV4YWN0KGcsYSkpe2M9ZVtpXT1udWxsLGo9ITA7YnJlYWt9aWYoZC5pc1RpbWVPdmVybGFwKGcsYSkpe2IuaXNPYmplY3QoYSk/KGEuaW52ZXJ0ZWQ9ITAsYz1hKTpiLmlzQXJyYXkoYSk/KGM9YSxjWzJdfHxjLnB1c2goXCJpbnZlcnRlZFwiKSk6aC5pc0RhdGUoYSkmJihjPVthLmdldEZ1bGxZZWFyKCksYS5nZXRNb250aCgpLGEuZ2V0RGF0ZSgpLFwiaW52ZXJ0ZWRcIl0pO2JyZWFrfX1pZihjKWZvcihpPTA7Zj5pO2krPTEpaWYoZC5pc1RpbWVFeGFjdChlW2ldLGEpKXtlW2ldPW51bGw7YnJlYWt9aWYoailmb3IoaT0wO2Y+aTtpKz0xKWlmKGQuaXNUaW1lT3ZlcmxhcChlW2ldLGEpKXtlW2ldPW51bGw7YnJlYWt9YyYmZS5wdXNoKGMpfSksZS5maWx0ZXIoZnVuY3Rpb24oYSl7cmV0dXJuIG51bGwhPWF9KX0sYy5wcm90b3R5cGUuaT1mdW5jdGlvbihhLGIpe3JldHVybiBoLmlzSW50ZWdlcihiKSYmYj4wP2I6dGhpcy5pdGVtLmludGVydmFsfSxjLnByb3RvdHlwZS5ub2Rlcz1mdW5jdGlvbihhKXt2YXIgYj10aGlzLGM9Yi5zZXR0aW5ncyxkPWIuaXRlbS5zZWxlY3QsZT1iLml0ZW0uaGlnaGxpZ2h0LGY9Yi5pdGVtLnZpZXcsZz1iLml0ZW0uZGlzYWJsZTtyZXR1cm4gaC5ub2RlKFwidWxcIixoLmdyb3VwKHttaW46Yi5pdGVtLm1pbi5waWNrLG1heDpiLml0ZW0ubWF4LnBpY2ssaTpiLml0ZW0uaW50ZXJ2YWwsbm9kZTpcImxpXCIsaXRlbTpmdW5jdGlvbihhKXthPWIuY3JlYXRlKGEpO3ZhciBpPWEucGljayxqPWQmJmQucGljaz09aSxrPWUmJmUucGljaz09aSxsPWcmJmIuZGlzYWJsZWQoYSk7cmV0dXJuW2gudHJpZ2dlcihiLmZvcm1hdHMudG9TdHJpbmcsYixbaC50cmlnZ2VyKGMuZm9ybWF0TGFiZWwsYixbYV0pfHxjLmZvcm1hdCxhXSksZnVuY3Rpb24oYSl7cmV0dXJuIGomJmEucHVzaChjLmtsYXNzLnNlbGVjdGVkKSxrJiZhLnB1c2goYy5rbGFzcy5oaWdobGlnaHRlZCksZiYmZi5waWNrPT1pJiZhLnB1c2goYy5rbGFzcy52aWV3c2V0KSxsJiZhLnB1c2goYy5rbGFzcy5kaXNhYmxlZCksYS5qb2luKFwiIFwiKX0oW2Mua2xhc3MubGlzdEl0ZW1dKSxcImRhdGEtcGljaz1cIithLnBpY2srXCIgXCIraC5hcmlhQXR0cih7cm9sZTpcImJ1dHRvblwiLGNvbnRyb2xzOmIuJG5vZGVbMF0uaWQsY2hlY2tlZDpqJiZiLiRub2RlLnZhbCgpPT09aC50cmlnZ2VyKGIuZm9ybWF0cy50b1N0cmluZyxiLFtjLmZvcm1hdCxhXSk/ITA6bnVsbCxhY3RpdmVkZXNjZW5kYW50Oms/ITA6bnVsbCxkaXNhYmxlZDpsPyEwOm51bGx9KV19fSkraC5ub2RlKFwibGlcIixoLm5vZGUoXCJidXR0b25cIixjLmNsZWFyLGMua2xhc3MuYnV0dG9uQ2xlYXIsXCJ0eXBlPWJ1dHRvbiBkYXRhLWNsZWFyPTFcIisoYT9cIlwiOlwiIGRpc2FibGVcIikpKSxjLmtsYXNzLmxpc3QpfSxjLmRlZmF1bHRzPWZ1bmN0aW9uKGEpe3JldHVybntjbGVhcjpcIkNsZWFyXCIsZm9ybWF0OlwiaDppIEFcIixpbnRlcnZhbDozMCxrbGFzczp7cGlja2VyOmErXCIgXCIrYStcIi0tdGltZVwiLGhvbGRlcjphK1wiX19ob2xkZXJcIixsaXN0OmErXCJfX2xpc3RcIixsaXN0SXRlbTphK1wiX19saXN0LWl0ZW1cIixkaXNhYmxlZDphK1wiX19saXN0LWl0ZW0tLWRpc2FibGVkXCIsc2VsZWN0ZWQ6YStcIl9fbGlzdC1pdGVtLS1zZWxlY3RlZFwiLGhpZ2hsaWdodGVkOmErXCJfX2xpc3QtaXRlbS0taGlnaGxpZ2h0ZWRcIix2aWV3c2V0OmErXCJfX2xpc3QtaXRlbS0tdmlld3NldFwiLG5vdzphK1wiX19saXN0LWl0ZW0tLW5vd1wiLGJ1dHRvbkNsZWFyOmErXCJfX2J1dHRvbi0tY2xlYXJcIn19fShhLmtsYXNzZXMoKS5waWNrZXIpLGEuZXh0ZW5kKFwicGlja2F0aW1lXCIsYyl9KTtcbi8qIVxuICogTGVnYWN5IGJyb3dzZXIgc3VwcG9ydFxuICovXG5bXS5tYXB8fChBcnJheS5wcm90b3R5cGUubWFwPWZ1bmN0aW9uKGEsYil7Zm9yKHZhciBjPXRoaXMsZD1jLmxlbmd0aCxlPW5ldyBBcnJheShkKSxmPTA7ZD5mO2YrKylmIGluIGMmJihlW2ZdPWEuY2FsbChiLGNbZl0sZixjKSk7cmV0dXJuIGV9KSxbXS5maWx0ZXJ8fChBcnJheS5wcm90b3R5cGUuZmlsdGVyPWZ1bmN0aW9uKGEpe2lmKG51bGw9PXRoaXMpdGhyb3cgbmV3IFR5cGVFcnJvcjt2YXIgYj1PYmplY3QodGhpcyksYz1iLmxlbmd0aD4+PjA7aWYoXCJmdW5jdGlvblwiIT10eXBlb2YgYSl0aHJvdyBuZXcgVHlwZUVycm9yO2Zvcih2YXIgZD1bXSxlPWFyZ3VtZW50c1sxXSxmPTA7Yz5mO2YrKylpZihmIGluIGIpe3ZhciBnPWJbZl07YS5jYWxsKGUsZyxmLGIpJiZkLnB1c2goZyl9cmV0dXJuIGR9KSxbXS5pbmRleE9mfHwoQXJyYXkucHJvdG90eXBlLmluZGV4T2Y9ZnVuY3Rpb24oYSl7aWYobnVsbD09dGhpcyl0aHJvdyBuZXcgVHlwZUVycm9yO3ZhciBiPU9iamVjdCh0aGlzKSxjPWIubGVuZ3RoPj4+MDtpZigwPT09YylyZXR1cm4tMTt2YXIgZD0wO2lmKGFyZ3VtZW50cy5sZW5ndGg+MSYmKGQ9TnVtYmVyKGFyZ3VtZW50c1sxXSksZCE9ZD9kPTA6MCE9PWQmJjEvMCE9ZCYmZCE9LTEvMCYmKGQ9KGQ+MHx8LTEpKk1hdGguZmxvb3IoTWF0aC5hYnMoZCkpKSksZD49YylyZXR1cm4tMTtmb3IodmFyIGU9ZD49MD9kOk1hdGgubWF4KGMtTWF0aC5hYnMoZCksMCk7Yz5lO2UrKylpZihlIGluIGImJmJbZV09PT1hKXJldHVybiBlO3JldHVybi0xfSk7LyohXG4gKiBDcm9zcy1Ccm93c2VyIFNwbGl0IDEuMS4xXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDEyIFN0ZXZlbiBMZXZpdGhhbiA8c3RldmVubGV2aXRoYW4uY29tPlxuICogQXZhaWxhYmxlIHVuZGVyIHRoZSBNSVQgTGljZW5zZVxuICogaHR0cDovL2Jsb2cuc3RldmVubGV2aXRoYW4uY29tL2FyY2hpdmVzL2Nyb3NzLWJyb3dzZXItc3BsaXRcbiAqL1xudmFyIG5hdGl2ZVNwbGl0PVN0cmluZy5wcm90b3R5cGUuc3BsaXQsY29tcGxpYW50RXhlY05wY2c9dm9pZCAwPT09LygpPz8vLmV4ZWMoXCJcIilbMV07U3RyaW5nLnByb3RvdHlwZS5zcGxpdD1mdW5jdGlvbihhLGIpe3ZhciBjPXRoaXM7aWYoXCJbb2JqZWN0IFJlZ0V4cF1cIiE9PU9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhKSlyZXR1cm4gbmF0aXZlU3BsaXQuY2FsbChjLGEsYik7dmFyIGQsZSxmLGcsaD1bXSxpPShhLmlnbm9yZUNhc2U/XCJpXCI6XCJcIikrKGEubXVsdGlsaW5lP1wibVwiOlwiXCIpKyhhLmV4dGVuZGVkP1wieFwiOlwiXCIpKyhhLnN0aWNreT9cInlcIjpcIlwiKSxqPTA7Zm9yKGE9bmV3IFJlZ0V4cChhLnNvdXJjZSxpK1wiZ1wiKSxjKz1cIlwiLGNvbXBsaWFudEV4ZWNOcGNnfHwoZD1uZXcgUmVnRXhwKFwiXlwiK2Euc291cmNlK1wiJCg/IVxcXFxzKVwiLGkpKSxiPXZvaWQgMD09PWI/LTE+Pj4wOmI+Pj4wOyhlPWEuZXhlYyhjKSkmJihmPWUuaW5kZXgrZVswXS5sZW5ndGgsIShmPmomJihoLnB1c2goYy5zbGljZShqLGUuaW5kZXgpKSwhY29tcGxpYW50RXhlY05wY2cmJmUubGVuZ3RoPjEmJmVbMF0ucmVwbGFjZShkLGZ1bmN0aW9uKCl7Zm9yKHZhciBhPTE7YTxhcmd1bWVudHMubGVuZ3RoLTI7YSsrKXZvaWQgMD09PWFyZ3VtZW50c1thXSYmKGVbYV09dm9pZCAwKX0pLGUubGVuZ3RoPjEmJmUuaW5kZXg8Yy5sZW5ndGgmJkFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KGgsZS5zbGljZSgxKSksZz1lWzBdLmxlbmd0aCxqPWYsaC5sZW5ndGg+PWIpKSk7KWEubGFzdEluZGV4PT09ZS5pbmRleCYmYS5sYXN0SW5kZXgrKztyZXR1cm4gaj09PWMubGVuZ3RoPyhnfHwhYS50ZXN0KFwiXCIpKSYmaC5wdXNoKFwiXCIpOmgucHVzaChjLnNsaWNlKGopKSxoLmxlbmd0aD5iP2guc2xpY2UoMCxiKTpofTtcbmFuZ3VsYXIubW9kdWxlKFwiYW5ndWxhci1kYXRlcGlja2VyXCIsW10pLmRpcmVjdGl2ZShcInBpY2tBRGF0ZVwiLGZ1bmN0aW9uKCl7cmV0dXJue3Jlc3RyaWN0OlwiQVwiLHNjb3BlOntwaWNrQURhdGU6XCI9XCIscGlja0FEYXRlT3B0aW9uczpcIj1cIn0sbGluazpmdW5jdGlvbihhLGIpe2Z1bmN0aW9uIGMoYyl7aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgZiYmZi5hcHBseSh0aGlzLGFyZ3VtZW50cyksIWEuJCRwaGFzZSYmIWEuJHJvb3QuJCRwaGFzZSl7dmFyIGQ9Yi5waWNrYWRhdGUoXCJwaWNrZXJcIikuZ2V0KFwic2VsZWN0XCIpO2EuJGFwcGx5KGZ1bmN0aW9uKCl7cmV0dXJuIGMuaGFzT3duUHJvcGVydHkoXCJjbGVhclwiKT92b2lkKGEucGlja0FEYXRlPW51bGwpOihhLnBpY2tBRGF0ZSYmXCJzdHJpbmdcIiE9dHlwZW9mIGEucGlja0FEYXRlfHwoYS5waWNrQURhdGU9bmV3IERhdGUoMCkpLGEucGlja0FEYXRlLnNldFllYXIoZC5vYmouZ2V0WWVhcigpKzE5MDApLGEucGlja0FEYXRlLnNldE1vbnRoKGQub2JqLmdldE1vbnRoKCkpLHZvaWQgYS5waWNrQURhdGUuc2V0RGF0ZShkLm9iai5nZXREYXRlKCkpKX0pfX1mdW5jdGlvbiBkKCl7aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgZyYmZy5hcHBseSh0aGlzLGFyZ3VtZW50cyksXCJ1bmRlZmluZWRcIiE9dHlwZW9mIGNvcmRvdmEmJmNvcmRvdmEucGx1Z2lucyYmY29yZG92YS5wbHVnaW5zLktleWJvYXJkKXt2YXIgYT1mdW5jdGlvbigpe2NvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5jbG9zZSgpLHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwibmF0aXZlLmtleWJvYXJkc2hvd1wiLHRoaXMpfTt3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm5hdGl2ZS5rZXlib2FyZHNob3dcIixhKSxzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJuYXRpdmUua2V5Ym9hcmRzaG93XCIsYSl9LDUwMCl9fXZhciBlPWEucGlja0FEYXRlT3B0aW9uc3x8e30sZj1lLm9uU2V0LGc9ZS5vbkNsb3NlO2IucGlja2FkYXRlKGFuZ3VsYXIuZXh0ZW5kKGUse29uU2V0OmMsb25DbG9zZTpkLGNvbnRhaW5lcjpkb2N1bWVudC5ib2R5fSkpLHNldFRpbWVvdXQoZnVuY3Rpb24oKXthLnBpY2tBRGF0ZSYmYi5waWNrYWRhdGUoXCJwaWNrZXJcIikuc2V0KFwic2VsZWN0XCIsYS5waWNrQURhdGUpfSwxZTMpfX19KS5kaXJlY3RpdmUoXCJwaWNrQVRpbWVcIixmdW5jdGlvbigpe3JldHVybntyZXN0cmljdDpcIkFcIixzY29wZTp7cGlja0FUaW1lOlwiPVwiLHBpY2tBVGltZU9wdGlvbnM6XCI9XCJ9LGxpbms6ZnVuY3Rpb24oYSxiKXtmdW5jdGlvbiBjKGMpe2lmKFwiZnVuY3Rpb25cIj09dHlwZW9mIGYmJmYuYXBwbHkodGhpcyxhcmd1bWVudHMpLCFhLiQkcGhhc2UmJiFhLiRyb290LiQkcGhhc2Upe3ZhciBkPWIucGlja2F0aW1lKFwicGlja2VyXCIpLmdldChcInNlbGVjdFwiKTthLiRhcHBseShmdW5jdGlvbigpe3JldHVybiBjLmhhc093blByb3BlcnR5KFwiY2xlYXJcIik/dm9pZChhLnBpY2tBVGltZT1udWxsKTooYS5waWNrQVRpbWUmJlwic3RyaW5nXCIhPXR5cGVvZiBhLnBpY2tBVGltZXx8KGEucGlja0FUaW1lPW5ldyBEYXRlKSxhLnBpY2tBVGltZS5zZXRIb3VycyhkLmhvdXIpLGEucGlja0FUaW1lLnNldE1pbnV0ZXMoZC5taW5zKSxhLnBpY2tBVGltZS5zZXRTZWNvbmRzKDApLHZvaWQgYS5waWNrQVRpbWUuc2V0TWlsbGlzZWNvbmRzKDApKX0pfX1mdW5jdGlvbiBkKCl7aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgZyYmZy5hcHBseSh0aGlzLGFyZ3VtZW50cyksXCJ1bmRlZmluZWRcIiE9dHlwZW9mIGNvcmRvdmEmJmNvcmRvdmEucGx1Z2lucyYmY29yZG92YS5wbHVnaW5zLktleWJvYXJkKXt2YXIgYT1mdW5jdGlvbigpe2NvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5jbG9zZSgpLHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwibmF0aXZlLmtleWJvYXJkc2hvd1wiLHRoaXMpfTt3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm5hdGl2ZS5rZXlib2FyZHNob3dcIixhKSxzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJuYXRpdmUua2V5Ym9hcmRzaG93XCIsYSl9LDUwMCl9fXZhciBlPWEucGlja0FUaW1lT3B0aW9uc3x8e30sZj1lLm9uU2V0LGc9ZS5vbkNsb3NlO2IucGlja2F0aW1lKGFuZ3VsYXIuZXh0ZW5kKGUse29uU2V0OmMsb25DbG9zZTpkLGNvbnRhaW5lcjpkb2N1bWVudC5ib2R5fSkpLHNldFRpbWVvdXQoZnVuY3Rpb24oKXthLnBpY2tBVGltZSYmYi5waWNrYXRpbWUoXCJwaWNrZXJcIikuc2V0KFwic2VsZWN0XCIsYS5waWNrQVRpbWUpfSwxZTMpfX19KTsiLCIvLyBEZXBzIGlzIHNvcnQgb2YgYSBwcm9ibGVtIGZvciB1cywgbWF5YmUgaW4gdGhlIGZ1dHVyZSB3ZSB3aWxsIGFzayB0aGUgdXNlciB0byBkZXBlbmRcbi8vIG9uIG1vZHVsZXMgZm9yIGFkZC1vbnNcblxudmFyIGRlcHMgPSBbJ09iamVjdFBhdGgnXTtcbnRyeSB7XG4gIC8vVGhpcyB0aHJvd3MgYW4gZXhwZWN0aW9uIGlmIG1vZHVsZSBkb2VzIG5vdCBleGlzdC5cbiAgYW5ndWxhci5tb2R1bGUoJ25nU2FuaXRpemUnKTtcbiAgZGVwcy5wdXNoKCduZ1Nhbml0aXplJyk7XG59IGNhdGNoIChlKSB7fVxuXG50cnkge1xuICAvL1RoaXMgdGhyb3dzIGFuIGV4cGVjdGlvbiBpZiBtb2R1bGUgZG9lcyBub3QgZXhpc3QuXG4gIGFuZ3VsYXIubW9kdWxlKCd1aS5zb3J0YWJsZScpO1xuICBkZXBzLnB1c2goJ3VpLnNvcnRhYmxlJyk7XG59IGNhdGNoIChlKSB7fVxuXG50cnkge1xuICAvL1RoaXMgdGhyb3dzIGFuIGV4cGVjdGlvbiBpZiBtb2R1bGUgZG9lcyBub3QgZXhpc3QuXG4gIGFuZ3VsYXIubW9kdWxlKCdhbmd1bGFyU3BlY3RydW1Db2xvcnBpY2tlcicpO1xuICBkZXBzLnB1c2goJ2FuZ3VsYXJTcGVjdHJ1bUNvbG9ycGlja2VyJyk7XG59IGNhdGNoIChlKSB7fVxuXG5hbmd1bGFyLm1vZHVsZSgnc2NoZW1hRm9ybScsIGRlcHMpO1xuXG5hbmd1bGFyLm1vZHVsZSgnc2NoZW1hRm9ybScpLnByb3ZpZGVyKCdzZlBhdGgnLFxuWydPYmplY3RQYXRoUHJvdmlkZXInLCBmdW5jdGlvbihPYmplY3RQYXRoUHJvdmlkZXIpIHtcbiAgdmFyIE9iamVjdFBhdGggPSB7cGFyc2U6IE9iamVjdFBhdGhQcm92aWRlci5wYXJzZX07XG5cbiAgLy8gaWYgd2UncmUgb24gQW5ndWxhciAxLjIueCwgd2UgbmVlZCB0byBjb250aW51ZSB1c2luZyBkb3Qgbm90YXRpb25cbiAgaWYgKGFuZ3VsYXIudmVyc2lvbi5tYWpvciA9PT0gMSAmJiBhbmd1bGFyLnZlcnNpb24ubWlub3IgPCAzKSB7XG4gICAgT2JqZWN0UGF0aC5zdHJpbmdpZnkgPSBmdW5jdGlvbihhcnIpIHtcbiAgICAgIHJldHVybiBBcnJheS5pc0FycmF5KGFycikgPyBhcnIuam9pbignLicpIDogYXJyLnRvU3RyaW5nKCk7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICBPYmplY3RQYXRoLnN0cmluZ2lmeSA9IE9iamVjdFBhdGhQcm92aWRlci5zdHJpbmdpZnk7XG4gIH1cblxuICAvLyBXZSB3YW50IHRoaXMgdG8gdXNlIHdoaWNoZXZlciBzdHJpbmdpZnkgbWV0aG9kIGlzIGRlZmluZWQgYWJvdmUsXG4gIC8vIHNvIHdlIGhhdmUgdG8gY29weSB0aGUgY29kZSBoZXJlLlxuICBPYmplY3RQYXRoLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKGRhdGEsIHF1b3RlKSB7XG4gICAgcmV0dXJuIE9iamVjdFBhdGguc3RyaW5naWZ5KEFycmF5LmlzQXJyYXkoZGF0YSkgPyBkYXRhIDogT2JqZWN0UGF0aC5wYXJzZShkYXRhKSwgcXVvdGUpO1xuICB9O1xuXG4gIHRoaXMucGFyc2UgPSBPYmplY3RQYXRoLnBhcnNlO1xuICB0aGlzLnN0cmluZ2lmeSA9IE9iamVjdFBhdGguc3RyaW5naWZ5O1xuICB0aGlzLm5vcm1hbGl6ZSA9IE9iamVjdFBhdGgubm9ybWFsaXplO1xuICB0aGlzLiRnZXQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gT2JqZWN0UGF0aDtcbiAgfTtcbn1dKTtcblxuLyoqXG4gKiBAbmdkb2Mgc2VydmljZVxuICogQG5hbWUgc2ZTZWxlY3RcbiAqIEBraW5kIGZ1bmN0aW9uXG4gKlxuICovXG5hbmd1bGFyLm1vZHVsZSgnc2NoZW1hRm9ybScpLmZhY3RvcnkoJ3NmU2VsZWN0JywgWydzZlBhdGgnLCBmdW5jdGlvbihzZlBhdGgpIHtcbiAgdmFyIG51bVJlID0gL15cXGQrJC87XG5cbiAgLyoqXG4gICAgKiBAZGVzY3JpcHRpb25cbiAgICAqIFV0aWxpdHkgbWV0aG9kIHRvIGFjY2VzcyBkZWVwIHByb3BlcnRpZXMgd2l0aG91dFxuICAgICogdGhyb3dpbmcgZXJyb3JzIHdoZW4gdGhpbmdzIGFyZSBub3QgZGVmaW5lZC5cbiAgICAqIENhbiBhbHNvIHNldCBhIHZhbHVlIGluIGEgZGVlcCBzdHJ1Y3R1cmUsIGNyZWF0aW5nIG9iamVjdHMgd2hlbiBtaXNzaW5nXG4gICAgKiBleC5cbiAgICAqIHZhciBmb28gPSBTZWxlY3QoJ2FkZHJlc3MuY29udGFjdC5uYW1lJyxvYmopXG4gICAgKiBTZWxlY3QoJ2FkZHJlc3MuY29udGFjdC5uYW1lJyxvYmosJ0xlZXJveScpXG4gICAgKlxuICAgICogQHBhcmFtIHtzdHJpbmd9IHByb2plY3Rpb24gQSBkb3QgcGF0aCB0byB0aGUgcHJvcGVydHkgeW91IHdhbnQgdG8gZ2V0L3NldFxuICAgICogQHBhcmFtIHtvYmplY3R9IG9iaiAgIChvcHRpb25hbCkgVGhlIG9iamVjdCB0byBwcm9qZWN0IG9uLCBkZWZhdWx0cyB0byAndGhpcydcbiAgICAqIEBwYXJhbSB7QW55fSAgICB2YWx1ZVRvU2V0IChvcGlvbmFsKSAgVGhlIHZhbHVlIHRvIHNldCwgaWYgcGFydHMgb2YgdGhlIHBhdGggb2ZcbiAgICAqICAgICAgICAgICAgICAgICB0aGUgcHJvamVjdGlvbiBpcyBtaXNzaW5nIGVtcHR5IG9iamVjdHMgd2lsbCBiZSBjcmVhdGVkLlxuICAgICogQHJldHVybnMge0FueXx1bmRlZmluZWR9IHJldHVybnMgdGhlIHZhbHVlIGF0IHRoZSBlbmQgb2YgdGhlIHByb2plY3Rpb24gcGF0aFxuICAgICogICAgICAgICAgICAgICAgICAgICAgICAgIG9yIHVuZGVmaW5lZCBpZiB0aGVyZSBpcyBub25lLlxuICAgICovXG4gIHJldHVybiBmdW5jdGlvbihwcm9qZWN0aW9uLCBvYmosIHZhbHVlVG9TZXQpIHtcbiAgICBpZiAoIW9iaikge1xuICAgICAgb2JqID0gdGhpcztcbiAgICB9XG4gICAgLy9TdXBwb3J0IFtdIGFycmF5IHN5bnRheFxuICAgIHZhciBwYXJ0cyA9IHR5cGVvZiBwcm9qZWN0aW9uID09PSAnc3RyaW5nJyA/IHNmUGF0aC5wYXJzZShwcm9qZWN0aW9uKSA6IHByb2plY3Rpb247XG5cbiAgICBpZiAodHlwZW9mIHZhbHVlVG9TZXQgIT09ICd1bmRlZmluZWQnICYmIHBhcnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgLy9zcGVjaWFsIGNhc2UsIGp1c3Qgc2V0dGluZyBvbmUgdmFyaWFibGVcbiAgICAgIG9ialtwYXJ0c1swXV0gPSB2YWx1ZVRvU2V0O1xuICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHZhbHVlVG9TZXQgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICAgIHR5cGVvZiBvYmpbcGFydHNbMF1dID09PSAndW5kZWZpbmVkJykge1xuICAgICAgIC8vIFdlIG5lZWQgdG8gbG9vayBhaGVhZCB0byBjaGVjayBpZiBhcnJheSBpcyBhcHByb3ByaWF0ZVxuICAgICAgb2JqW3BhcnRzWzBdXSA9IHBhcnRzLmxlbmd0aCA+IDIgJiYgbnVtUmUudGVzdChwYXJ0c1sxXSkgPyBbXSA6IHt9O1xuICAgIH1cblxuICAgIHZhciB2YWx1ZSA9IG9ialtwYXJ0c1swXV07XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBwYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgICAgLy8gU3BlY2lhbCBjYXNlOiBXZSBhbGxvdyBKU09OIEZvcm0gc3ludGF4IGZvciBhcnJheXMgdXNpbmcgZW1wdHkgYnJhY2tldHNcbiAgICAgIC8vIFRoZXNlIHdpbGwgb2YgY291cnNlIG5vdCB3b3JrIGhlcmUgc28gd2UgZXhpdCBpZiB0aGV5IGFyZSBmb3VuZC5cbiAgICAgIGlmIChwYXJ0c1tpXSA9PT0gJycpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgdmFsdWVUb1NldCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgaWYgKGkgPT09IHBhcnRzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAvL2xhc3Qgc3RlcC4gTGV0J3Mgc2V0IHRoZSB2YWx1ZVxuICAgICAgICAgIHZhbHVlW3BhcnRzW2ldXSA9IHZhbHVlVG9TZXQ7XG4gICAgICAgICAgcmV0dXJuIHZhbHVlVG9TZXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gTWFrZSBzdXJlIHRvIGNyZWF0ZSBuZXcgb2JqZWN0cyBvbiB0aGUgd2F5IGlmIHRoZXkgYXJlIG5vdCB0aGVyZS5cbiAgICAgICAgICAvLyBXZSBuZWVkIHRvIGxvb2sgYWhlYWQgdG8gY2hlY2sgaWYgYXJyYXkgaXMgYXBwcm9wcmlhdGVcbiAgICAgICAgICB2YXIgdG1wID0gdmFsdWVbcGFydHNbaV1dO1xuICAgICAgICAgIGlmICh0eXBlb2YgdG1wID09PSAndW5kZWZpbmVkJyB8fCB0bXAgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRtcCA9IG51bVJlLnRlc3QocGFydHNbaSArIDFdKSA/IFtdIDoge307XG4gICAgICAgICAgICB2YWx1ZVtwYXJ0c1tpXV0gPSB0bXA7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhbHVlID0gdG1wO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHZhbHVlKSB7XG4gICAgICAgIC8vSnVzdCBnZXQgbmV4IHZhbHVlLlxuICAgICAgICB2YWx1ZSA9IHZhbHVlW3BhcnRzW2ldXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xufV0pO1xuXG5hbmd1bGFyLm1vZHVsZSgnc2NoZW1hRm9ybScpLnByb3ZpZGVyKCdzY2hlbWFGb3JtRGVjb3JhdG9ycycsXG5bJyRjb21waWxlUHJvdmlkZXInLCAnc2ZQYXRoUHJvdmlkZXInLCBmdW5jdGlvbigkY29tcGlsZVByb3ZpZGVyLCBzZlBhdGhQcm92aWRlcikge1xuICB2YXIgZGVmYXVsdERlY29yYXRvciA9ICcnO1xuICB2YXIgZGlyZWN0aXZlcyA9IHt9O1xuXG4gIHZhciB0ZW1wbGF0ZVVybCA9IGZ1bmN0aW9uKG5hbWUsIGZvcm0pIHtcbiAgICAvL3NjaGVtYURlY29yYXRvciBpcyBhbGlhcyBmb3Igd2hhdGV2ZXIgaXMgc2V0IGFzIGRlZmF1bHRcbiAgICBpZiAobmFtZSA9PT0gJ3NmRGVjb3JhdG9yJykge1xuICAgICAgbmFtZSA9IGRlZmF1bHREZWNvcmF0b3I7XG4gICAgfVxuXG4gICAgdmFyIGRpcmVjdGl2ZSA9IGRpcmVjdGl2ZXNbbmFtZV07XG5cbiAgICAvL3J1bGVzIGZpcnN0XG4gICAgdmFyIHJ1bGVzID0gZGlyZWN0aXZlLnJ1bGVzO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcnVsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciByZXMgPSBydWxlc1tpXShmb3JtKTtcbiAgICAgIGlmIChyZXMpIHtcbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvL3RoZW4gY2hlY2sgbWFwcGluZ1xuICAgIGlmIChkaXJlY3RpdmUubWFwcGluZ3NbZm9ybS50eXBlXSkge1xuICAgICAgcmV0dXJuIGRpcmVjdGl2ZS5tYXBwaW5nc1tmb3JtLnR5cGVdO1xuICAgIH1cblxuICAgIC8vdHJ5IGRlZmF1bHRcbiAgICByZXR1cm4gZGlyZWN0aXZlLm1hcHBpbmdzWydkZWZhdWx0J107XG4gIH07XG5cbiAgdmFyIGNyZWF0ZURpcmVjdGl2ZSA9IGZ1bmN0aW9uKG5hbWUsIG9wdGlvbnMpIHtcbiAgICAkY29tcGlsZVByb3ZpZGVyLmRpcmVjdGl2ZShuYW1lLCBbJyRwYXJzZScsICckY29tcGlsZScsICckaHR0cCcsICckdGVtcGxhdGVDYWNoZScsXG4gICAgICBmdW5jdGlvbigkcGFyc2UsICAkY29tcGlsZSwgICRodHRwLCAgJHRlbXBsYXRlQ2FjaGUpIHtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHJlc3RyaWN0OiAnQUUnLFxuICAgICAgICAgIHJlcGxhY2U6IGZhbHNlLFxuICAgICAgICAgIHRyYW5zY2x1ZGU6IGZhbHNlLFxuICAgICAgICAgIHNjb3BlOiB0cnVlLFxuICAgICAgICAgIHJlcXVpcmU6ICc/XnNmU2NoZW1hJyxcbiAgICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIHNmU2NoZW1hKSB7XG4gICAgICAgICAgICAvL3JlYmluZCBvdXIgcGFydCBvZiB0aGUgZm9ybSB0byB0aGUgc2NvcGUuXG4gICAgICAgICAgICB2YXIgb25jZSA9IHNjb3BlLiR3YXRjaChhdHRycy5mb3JtLCBmdW5jdGlvbihmb3JtKSB7XG5cbiAgICAgICAgICAgICAgaWYgKGZvcm0pIHtcbiAgICAgICAgICAgICAgICBzY29wZS5mb3JtICA9IGZvcm07XG5cbiAgICAgICAgICAgICAgICAvL29rIGxldCdzIHJlcGxhY2UgdGhhdCB0ZW1wbGF0ZSFcbiAgICAgICAgICAgICAgICAvL1dlIGRvIHRoaXMgbWFudWFsbHkgc2luY2Ugd2UgbmVlZCB0byBiaW5kIG5nLW1vZGVsIHByb3Blcmx5IGFuZCBhbHNvXG4gICAgICAgICAgICAgICAgLy9mb3IgZmllbGRzZXRzIHRvIHJlY3Vyc2UgcHJvcGVybHkuXG4gICAgICAgICAgICAgICAgdmFyIHVybCA9IHRlbXBsYXRlVXJsKG5hbWUsIGZvcm0pO1xuICAgICAgICAgICAgICAgICRodHRwLmdldCh1cmwsIHtjYWNoZTogJHRlbXBsYXRlQ2FjaGV9KS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IGZvcm0ua2V5ID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZlBhdGhQcm92aWRlci5zdHJpbmdpZnkoZm9ybS5rZXkpLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKSA6ICcnO1xuICAgICAgICAgICAgICAgICAgdmFyIHRlbXBsYXRlID0gcmVzLmRhdGEucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgL1xcJFxcJHZhbHVlXFwkXFwkL2csXG4gICAgICAgICAgICAgICAgICAgICdtb2RlbCcgKyAoa2V5WzBdICE9PSAnWycgPyAnLicgOiAnJykgKyBrZXlcbiAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICAgICAgICBcdGVsZW1lbnQuYWRkQ2xhc3Mob3B0aW9ucy5jbGFzc05hbWUpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgZWxlbWVudC5odG1sKHRlbXBsYXRlKTtcbiAgICAgICAgICAgICAgICAgICRjb21waWxlKGVsZW1lbnQuY29udGVudHMoKSkoc2NvcGUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIG9uY2UoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vS2VlcCBlcnJvciBwcm9uZSBsb2dpYyBmcm9tIHRoZSB0ZW1wbGF0ZVxuICAgICAgICAgICAgc2NvcGUuc2hvd1RpdGxlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBzY29wZS5mb3JtICYmIHNjb3BlLmZvcm0ubm90aXRsZSAhPT0gdHJ1ZSAmJiBzY29wZS5mb3JtLnRpdGxlO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2NvcGUubGlzdFRvQ2hlY2tib3hWYWx1ZXMgPSBmdW5jdGlvbihsaXN0KSB7XG4gICAgICAgICAgICAgIHZhciB2YWx1ZXMgPSB7fTtcbiAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGxpc3QsIGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZXNbdl0gPSB0cnVlO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlcztcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNjb3BlLmNoZWNrYm94VmFsdWVzVG9MaXN0ID0gZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgICAgICAgIHZhciBsc3QgPSBbXTtcbiAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHZhbHVlcywgZnVuY3Rpb24odiwgaykge1xuICAgICAgICAgICAgICAgIGlmICh2KSB7XG4gICAgICAgICAgICAgICAgICBsc3QucHVzaChrKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICByZXR1cm4gbHN0O1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2NvcGUuYnV0dG9uQ2xpY2sgPSBmdW5jdGlvbigkZXZlbnQsIGZvcm0pIHtcbiAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNGdW5jdGlvbihmb3JtLm9uQ2xpY2spKSB7XG4gICAgICAgICAgICAgICAgZm9ybS5vbkNsaWNrKCRldmVudCwgZm9ybSk7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoYW5ndWxhci5pc1N0cmluZyhmb3JtLm9uQ2xpY2spKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNmU2NoZW1hKSB7XG4gICAgICAgICAgICAgICAgICAvL2V2YWx1YXRpbmcgaW4gc2NvcGUgb3V0c2lkZSBvZiBzZlNjaGVtYXMgaXNvbGF0ZWQgc2NvcGVcbiAgICAgICAgICAgICAgICAgIHNmU2NoZW1hLmV2YWxJblBhcmVudFNjb3BlKGZvcm0ub25DbGljaywgeyckZXZlbnQnOiAkZXZlbnQsIGZvcm06IGZvcm19KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgc2NvcGUuJGV2YWwoZm9ybS5vbkNsaWNrLCB7JyRldmVudCc6ICRldmVudCwgZm9ybTogZm9ybX0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBFdmFsdWF0ZSBhbiBleHByZXNzaW9uLCBpLmUuIHNjb3BlLiRldmFsXG4gICAgICAgICAgICAgKiBidXQgZG8gaXQgaW4gc2ZTY2hlbWFzIHBhcmVudCBzY29wZSBzZi1zY2hlbWEgZGlyZWN0aXZlIGlzIHVzZWRcbiAgICAgICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBleHByZXNzaW9uXG4gICAgICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gbG9jYWxzIChvcHRpb25hbClcbiAgICAgICAgICAgICAqIEByZXR1cm4ge0FueX0gdGhlIHJlc3VsdCBvZiB0aGUgZXhwcmVzc2lvblxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBzY29wZS5ldmFsRXhwciA9IGZ1bmN0aW9uKGV4cHJlc3Npb24sIGxvY2Fscykge1xuICAgICAgICAgICAgICBpZiAoc2ZTY2hlbWEpIHtcbiAgICAgICAgICAgICAgICAvL2V2YWx1YXRpbmcgaW4gc2NvcGUgb3V0c2lkZSBvZiBzZlNjaGVtYXMgaXNvbGF0ZWQgc2NvcGVcbiAgICAgICAgICAgICAgICByZXR1cm4gc2ZTY2hlbWEuZXZhbEluUGFyZW50U2NvcGUoZXhwcmVzc2lvbiwgbG9jYWxzKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHJldHVybiBzY29wZS4kZXZhbChleHByZXNzaW9uLCBsb2NhbHMpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBFdmFsdWF0ZSBhbiBleHByZXNzaW9uLCBpLmUuIHNjb3BlLiRldmFsXG4gICAgICAgICAgICAgKiBpbiB0aGlzIGRlY29yYXRvcnMgc2NvcGVcbiAgICAgICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBleHByZXNzaW9uXG4gICAgICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gbG9jYWxzIChvcHRpb25hbClcbiAgICAgICAgICAgICAqIEByZXR1cm4ge0FueX0gdGhlIHJlc3VsdCBvZiB0aGUgZXhwcmVzc2lvblxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBzY29wZS5ldmFsSW5TY29wZSA9IGZ1bmN0aW9uKGV4cHJlc3Npb24sIGxvY2Fscykge1xuICAgICAgICAgICAgICBpZiAoZXhwcmVzc2lvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBzY29wZS4kZXZhbChleHByZXNzaW9uLCBsb2NhbHMpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEVycm9yIG1lc3NhZ2UgaGFuZGxlclxuICAgICAgICAgICAgICogQW4gZXJyb3IgY2FuIGVpdGhlciBiZSBhIHNjaGVtYSB2YWxpZGF0aW9uIG1lc3NhZ2Ugb3IgYSBhbmd1bGFyIGpzIHZhbGlkdGlvblxuICAgICAgICAgICAgICogZXJyb3IgKGkuZS4gcmVxdWlyZWQpXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHNjb3BlLmVycm9yTWVzc2FnZSA9IGZ1bmN0aW9uKHNjaGVtYUVycm9yKSB7XG4gICAgICAgICAgICAgIC8vVXNlciBoYXMgc3VwcGxpZWQgdmFsaWRhdGlvbiBtZXNzYWdlc1xuICAgICAgICAgICAgICBpZiAoc2NvcGUuZm9ybS52YWxpZGF0aW9uTWVzc2FnZSkge1xuICAgICAgICAgICAgICAgIGlmIChzY2hlbWFFcnJvcikge1xuICAgICAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNTdHJpbmcoc2NvcGUuZm9ybS52YWxpZGF0aW9uTWVzc2FnZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNjb3BlLmZvcm0udmFsaWRhdGlvbk1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIHJldHVybiBzY29wZS5mb3JtLnZhbGlkYXRpb25NZXNzYWdlW3NjaGVtYUVycm9yLmNvZGVdIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuZm9ybS52YWxpZGF0aW9uTWVzc2FnZVsnZGVmYXVsdCddO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gc2NvcGUuZm9ybS52YWxpZGF0aW9uTWVzc2FnZS5udW1iZXIgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5mb3JtLnZhbGlkYXRpb25NZXNzYWdlWydkZWZhdWx0J10gfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5mb3JtLnZhbGlkYXRpb25NZXNzYWdlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vTm8gdXNlciBzdXBwbGllZCB2YWxpZGF0aW9uIG1lc3NhZ2UuXG4gICAgICAgICAgICAgIGlmIChzY2hlbWFFcnJvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBzY2hlbWFFcnJvci5tZXNzYWdlOyAvL3VzZSB0djQuanMgdmFsaWRhdGlvbiBtZXNzYWdlXG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvL090aGVyd2lzZSB3ZSBvbmx5IGhhdmUgaW5wdXQgbnVtYmVyIG5vdCBiZWluZyBhIG51bWJlclxuICAgICAgICAgICAgICByZXR1cm4gJ05vdCBhIG51bWJlcic7XG5cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIF0pO1xuICB9O1xuXG4gIHZhciBjcmVhdGVNYW51YWxEaXJlY3RpdmUgPSBmdW5jdGlvbih0eXBlLCB0ZW1wbGF0ZVVybCwgdHJhbnNjbHVkZSkge1xuICAgIHRyYW5zY2x1ZGUgPSBhbmd1bGFyLmlzRGVmaW5lZCh0cmFuc2NsdWRlKSA/IHRyYW5zY2x1ZGUgOiBmYWxzZTtcbiAgICAkY29tcGlsZVByb3ZpZGVyLmRpcmVjdGl2ZSgnc2YnICsgYW5ndWxhci51cHBlcmNhc2UodHlwZVswXSkgKyB0eXBlLnN1YnN0cigxKSwgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0VBQycsXG4gICAgICAgIHNjb3BlOiB0cnVlLFxuICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICB0cmFuc2NsdWRlOiB0cmFuc2NsdWRlLFxuICAgICAgICB0ZW1wbGF0ZTogJzxzZi1kZWNvcmF0b3IgZm9ybT1cImZvcm1cIj48L3NmLWRlY29yYXRvcj4nLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICB2YXIgd2F0Y2hUaGlzID0ge1xuICAgICAgICAgICAgJ2l0ZW1zJzogJ2MnLFxuICAgICAgICAgICAgJ3RpdGxlTWFwJzogJ2MnLFxuICAgICAgICAgICAgJ3NjaGVtYSc6ICdjJ1xuICAgICAgICAgIH07XG4gICAgICAgICAgdmFyIGZvcm0gPSB7dHlwZTogdHlwZX07XG4gICAgICAgICAgdmFyIG9uY2UgPSB0cnVlO1xuICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChhdHRycywgZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgICAgICAgIGlmIChuYW1lWzBdICE9PSAnJCcgJiYgbmFtZS5pbmRleE9mKCduZycpICE9PSAwICYmIG5hbWUgIT09ICdzZkZpZWxkJykge1xuXG4gICAgICAgICAgICAgIHZhciB1cGRhdGVGb3JtID0gZnVuY3Rpb24odmFsKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKHZhbCkgJiYgdmFsICE9PSBmb3JtW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgICBmb3JtW25hbWVdID0gdmFsO1xuXG4gICAgICAgICAgICAgICAgICAvL3doZW4gd2UgaGF2ZSB0eXBlLCBhbmQgaWYgc3BlY2lmaWVkIGtleSB3ZSBhcHBseSBpdCBvbiBzY29wZS5cbiAgICAgICAgICAgICAgICAgIGlmIChvbmNlICYmIGZvcm0udHlwZSAmJiAoZm9ybS5rZXkgfHwgYW5ndWxhci5pc1VuZGVmaW5lZChhdHRycy5rZXkpKSkge1xuICAgICAgICAgICAgICAgICAgICBzY29wZS5mb3JtID0gZm9ybTtcbiAgICAgICAgICAgICAgICAgICAgb25jZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICBpZiAobmFtZSA9PT0gJ21vZGVsJykge1xuICAgICAgICAgICAgICAgIC8vXCJtb2RlbFwiIGlzIGJvdW5kIHRvIHNjb3BlIHVuZGVyIHRoZSBuYW1lIFwibW9kZWxcIiBzaW5jZSB0aGlzIGlzIHdoYXQgdGhlIGRlY29yYXRvcnNcbiAgICAgICAgICAgICAgICAvL2tub3cgYW5kIGxvdmUuXG4gICAgICAgICAgICAgICAgc2NvcGUuJHdhdGNoKHZhbHVlLCBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICAgICAgICAgIGlmICh2YWwgJiYgc2NvcGUubW9kZWwgIT09IHZhbCkge1xuICAgICAgICAgICAgICAgICAgICBzY29wZS5tb2RlbCA9IHZhbDtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmICh3YXRjaFRoaXNbbmFtZV0gPT09ICdjJykge1xuICAgICAgICAgICAgICAgIC8vd2F0Y2ggY29sbGVjdGlvblxuICAgICAgICAgICAgICAgIHNjb3BlLiR3YXRjaENvbGxlY3Rpb24odmFsdWUsIHVwZGF0ZUZvcm0pO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vJG9ic2VydmVcbiAgICAgICAgICAgICAgICBhdHRycy4kb2JzZXJ2ZShuYW1lLCB1cGRhdGVGb3JtKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBkZWNvcmF0b3IgZGlyZWN0aXZlIGFuZCBpdHMgc2libGluZyBcIm1hbnVhbFwiIHVzZSBkaXJlY3RpdmVzLlxuICAgKiBUaGUgZGlyZWN0aXZlIGNhbiBiZSB1c2VkIHRvIGNyZWF0ZSBmb3JtIGZpZWxkcyBvciBvdGhlciBmb3JtIGVudGl0aWVzLlxuICAgKiBJdCBjYW4gYmUgdXNlZCBpbiBjb25qdW5jdGlvbiB3aXRoIDxzY2hlbWEtZm9ybT4gZGlyZWN0aXZlIGluIHdoaWNoIGNhc2UgdGhlIGRlY29yYXRvciBpc1xuICAgKiBnaXZlbiBpdCdzIGNvbmZpZ3VyYXRpb24gdmlhIGEgdGhlIFwiZm9ybVwiIGF0dHJpYnV0ZS5cbiAgICpcbiAgICogZXguIEJhc2ljIHVzYWdlXG4gICAqICAgPHNmLWRlY29yYXRvciBmb3JtPVwibXlmb3JtXCI+PC9zZi1kZWNvcmF0b3I+XG4gICAqKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBkaXJlY3RpdmUgbmFtZSAoQ2FtZWxDYXNlZClcbiAgICogQHBhcmFtIHtPYmplY3R9IG1hcHBpbmdzLCBhbiBvYmplY3QgdGhhdCBtYXBzIFwidHlwZVwiID0+IFwidGVtcGxhdGVVcmxcIlxuICAgKiBAcGFyYW0ge0FycmF5fSAgcnVsZXMgKG9wdGlvbmFsKSBhIGxpc3Qgb2YgZnVuY3Rpb25zLCBmdW5jdGlvbihmb3JtKSB7fSwgdGhhdCBhcmUgZWFjaCB0cmllZCBpblxuICAgKiAgICAgICAgICAgICAgICAgdHVybixcbiAgICogICAgICAgICAgICAgICAgIGlmIHRoZXkgcmV0dXJuIGEgc3RyaW5nIHRoZW4gdGhhdCBpcyB1c2VkIGFzIHRoZSB0ZW1wbGF0ZVVybC4gUnVsZXMgY29tZSBiZWZvcmVcbiAgICogICAgICAgICAgICAgICAgIG1hcHBpbmdzLlxuICAgKi9cbiAgdGhpcy5jcmVhdGVEZWNvcmF0b3IgPSBmdW5jdGlvbihuYW1lLCBtYXBwaW5ncywgcnVsZXMsIG9wdGlvbnMpIHtcbiAgICBkaXJlY3RpdmVzW25hbWVdID0ge1xuICAgICAgbWFwcGluZ3M6IG1hcHBpbmdzIHx8IHt9LFxuICAgICAgcnVsZXM6ICAgIHJ1bGVzICAgIHx8IFtdXG4gICAgfTtcblxuICAgIGlmICghZGlyZWN0aXZlc1tkZWZhdWx0RGVjb3JhdG9yXSkge1xuICAgICAgZGVmYXVsdERlY29yYXRvciA9IG5hbWU7XG4gICAgfVxuICAgIGNyZWF0ZURpcmVjdGl2ZShuYW1lLCBvcHRpb25zKTtcbiAgfTtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGRpcmVjdGl2ZSBvZiBhIGRlY29yYXRvclxuICAgKiBVc2FibGUgd2hlbiB5b3Ugd2FudCB0byB1c2UgdGhlIGRlY29yYXRvcnMgd2l0aG91dCB1c2luZyA8c2NoZW1hLWZvcm0+IGRpcmVjdGl2ZS5cbiAgICogU3BlY2lmaWNhbGx5IHdoZW4geW91IG5lZWQgdG8gcmV1c2Ugc3R5bGluZy5cbiAgICpcbiAgICogZXguIGNyZWF0ZURpcmVjdGl2ZSgndGV4dCcsJy4uLicpXG4gICAqICA8c2YtdGV4dCB0aXRsZT1cImZvb2JhclwiIG1vZGVsPVwicGVyc29uXCIga2V5PVwibmFtZVwiIHNjaGVtYT1cInNjaGVtYVwiPjwvc2YtdGV4dD5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9ICB0eXBlIFRoZSB0eXBlIG9mIHRoZSBkaXJlY3RpdmUsIHJlc3VsdGluZyBkaXJlY3RpdmUgd2lsbCBoYXZlIHNmLSBwcmVmaXhlZFxuICAgKiBAcGFyYW0ge3N0cmluZ30gIHRlbXBsYXRlVXJsXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gdHJhbnNjbHVkZSAob3B0aW9uYWwpIHNldHMgdHJhbnNjbHVkZSBvcHRpb24gb2YgZGlyZWN0aXZlLCBkZWZhdWx0cyB0byBmYWxzZS5cbiAgICovXG4gIHRoaXMuY3JlYXRlRGlyZWN0aXZlID0gY3JlYXRlTWFudWFsRGlyZWN0aXZlO1xuXG4gIC8qKlxuICAgKiBTYW1lIGFzIGNyZWF0ZURpcmVjdGl2ZSwgYnV0IHRha2VzIGFuIG9iamVjdCB3aGVyZSBrZXkgaXMgJ3R5cGUnIGFuZCB2YWx1ZSBpcyAndGVtcGxhdGVVcmwnXG4gICAqIFVzZWZ1bCBmb3IgYmF0Y2hpbmcuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBtYXBwaW5nc1xuICAgKi9cbiAgdGhpcy5jcmVhdGVEaXJlY3RpdmVzID0gZnVuY3Rpb24obWFwcGluZ3MpIHtcbiAgICBhbmd1bGFyLmZvckVhY2gobWFwcGluZ3MsIGZ1bmN0aW9uKHVybCwgdHlwZSkge1xuICAgICAgY3JlYXRlTWFudWFsRGlyZWN0aXZlKHR5cGUsIHVybCk7XG4gICAgfSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEdldHRlciBmb3IgZGlyZWN0aXZlIG1hcHBpbmdzXG4gICAqIENhbiBiZSB1c2VkIHRvIG92ZXJyaWRlIGEgbWFwcGluZyBvciBhZGQgYSBydWxlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIChvcHRpb25hbCkgZGVmYXVsdHMgdG8gZGVmYXVsdERlY29yYXRvclxuICAgKiBAcmV0dXJuIHtPYmplY3R9IHJ1bGVzIGFuZCBtYXBwaW5ncyB7IHJ1bGVzOiBbXSxtYXBwaW5nczoge319XG4gICAqL1xuICB0aGlzLmRpcmVjdGl2ZSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBuYW1lID0gbmFtZSB8fCBkZWZhdWx0RGVjb3JhdG9yO1xuICAgIHJldHVybiBkaXJlY3RpdmVzW25hbWVdO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBZGRzIGEgbWFwcGluZyB0byBhbiBleGlzdGluZyBkZWNvcmF0b3IuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIERlY29yYXRvciBuYW1lXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlIEZvcm0gdHlwZSBmb3IgdGhlIG1hcHBpbmdcbiAgICogQHBhcmFtIHtTdHJpbmd9IHVybCAgVGhlIHRlbXBsYXRlIHVybFxuICAgKi9cbiAgdGhpcy5hZGRNYXBwaW5nID0gZnVuY3Rpb24obmFtZSwgdHlwZSwgdXJsKSB7XG4gICAgaWYgKGRpcmVjdGl2ZXNbbmFtZV0pIHtcbiAgICAgIGRpcmVjdGl2ZXNbbmFtZV0ubWFwcGluZ3NbdHlwZV0gPSB1cmw7XG4gICAgfVxuICB9O1xuXG4gIC8vU2VydmljZSBpcyBqdXN0IGEgZ2V0dGVyIGZvciBkaXJlY3RpdmUgbWFwcGluZ3MgYW5kIHJ1bGVzXG4gIHRoaXMuJGdldCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBkaXJlY3RpdmU6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZXNbbmFtZV07XG4gICAgICB9LFxuICAgICAgZGVmYXVsdERlY29yYXRvcjogZGVmYXVsdERlY29yYXRvclxuICAgIH07XG4gIH07XG5cbiAgLy9DcmVhdGUgYSBkZWZhdWx0IGRpcmVjdGl2ZVxuICBjcmVhdGVEaXJlY3RpdmUoJ3NmRGVjb3JhdG9yJyk7XG5cbn1dKTtcblxuLyoqXG4gKiBTY2hlbWEgZm9ybSBzZXJ2aWNlLlxuICogVGhpcyBzZXJ2aWNlIGlzIG5vdCB0aGF0IHVzZWZ1bCBvdXRzaWRlIG9mIHNjaGVtYSBmb3JtIGRpcmVjdGl2ZVxuICogYnV0IG1ha2VzIHRoZSBjb2RlIG1vcmUgdGVzdGFibGUuXG4gKi9cbmFuZ3VsYXIubW9kdWxlKCdzY2hlbWFGb3JtJykucHJvdmlkZXIoJ3NjaGVtYUZvcm0nLFxuWydzZlBhdGhQcm92aWRlcicsIGZ1bmN0aW9uKHNmUGF0aFByb3ZpZGVyKSB7XG5cbiAgLy9DcmVhdGVzIGFuIGRlZmF1bHQgdGl0bGVNYXAgbGlzdCBmcm9tIGFuIGVudW0sIGkuZS4gYSBsaXN0IG9mIHN0cmluZ3MuXG4gIHZhciBlbnVtVG9UaXRsZU1hcCA9IGZ1bmN0aW9uKGVubSkge1xuICAgIHZhciB0aXRsZU1hcCA9IFtdOyAvL2Nhbm9uaWNhbCB0aXRsZU1hcCBmb3JtYXQgaXMgYSBsaXN0LlxuICAgIGVubS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHRpdGxlTWFwLnB1c2goe25hbWU6IG5hbWUsIHZhbHVlOiBuYW1lfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRpdGxlTWFwO1xuICB9O1xuXG4gIC8vIFRha2VzIGEgdGl0bGVNYXAgaW4gZWl0aGVyIG9iamVjdCBvciBsaXN0IGZvcm1hdCBhbmQgcmV0dXJucyBvbmUgaW5cbiAgLy8gaW4gdGhlIGxpc3QgZm9ybWF0LlxuICB2YXIgY2Fub25pY2FsVGl0bGVNYXAgPSBmdW5jdGlvbih0aXRsZU1hcCwgb3JpZ2luYWxFbnVtKSB7XG4gICAgaWYgKCFhbmd1bGFyLmlzQXJyYXkodGl0bGVNYXApKSB7XG4gICAgICB2YXIgY2Fub25pY2FsID0gW107XG4gICAgICBpZiAob3JpZ2luYWxFbnVtKSB7XG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaChvcmlnaW5hbEVudW0sIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgIGNhbm9uaWNhbC5wdXNoKHtuYW1lOiB0aXRsZU1hcFt2YWx1ZV0sIHZhbHVlOiB2YWx1ZX0pO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaCh0aXRsZU1hcCwgZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICAgICAgICBjYW5vbmljYWwucHVzaCh7bmFtZTogbmFtZSwgdmFsdWU6IHZhbHVlfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNhbm9uaWNhbDtcbiAgICB9XG4gICAgcmV0dXJuIHRpdGxlTWFwO1xuICB9O1xuXG4gIHZhciBkZWZhdWx0Rm9ybURlZmluaXRpb24gPSBmdW5jdGlvbihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpIHtcbiAgICB2YXIgcnVsZXMgPSBkZWZhdWx0c1tzY2hlbWEudHlwZV07XG4gICAgaWYgKHJ1bGVzKSB7XG4gICAgICB2YXIgZGVmO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBydWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBkZWYgPSBydWxlc1tpXShuYW1lLCBzY2hlbWEsIG9wdGlvbnMpO1xuICAgICAgICAvL2ZpcnN0IGhhbmRsZXIgaW4gbGlzdCB0aGF0IGFjdHVhbGx5IHJldHVybnMgc29tZXRoaW5nIGlzIG91ciBoYW5kbGVyIVxuICAgICAgICBpZiAoZGVmKSB7XG4gICAgICAgICAgcmV0dXJuIGRlZjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvL0NyZWF0ZXMgYSBmb3JtIG9iamVjdCB3aXRoIGFsbCBjb21tb24gcHJvcGVydGllc1xuICB2YXIgc3RkRm9ybU9iaiA9IGZ1bmN0aW9uKG5hbWUsIHNjaGVtYSwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHZhciBmID0gb3B0aW9ucy5nbG9iYWwgJiYgb3B0aW9ucy5nbG9iYWwuZm9ybURlZmF1bHRzID9cbiAgICAgICAgICAgIGFuZ3VsYXIuY29weShvcHRpb25zLmdsb2JhbC5mb3JtRGVmYXVsdHMpIDoge307XG4gICAgaWYgKG9wdGlvbnMuZ2xvYmFsICYmIG9wdGlvbnMuZ2xvYmFsLnN1cHJlc3NQcm9wZXJ0eVRpdGxlcyA9PT0gdHJ1ZSkge1xuICAgICAgZi50aXRsZSA9IHNjaGVtYS50aXRsZTtcbiAgICB9IGVsc2Uge1xuICAgICAgZi50aXRsZSA9IHNjaGVtYS50aXRsZSB8fCBuYW1lO1xuICAgIH1cblxuICAgIGlmIChzY2hlbWEuZGVzY3JpcHRpb24pIHsgZi5kZXNjcmlwdGlvbiA9IHNjaGVtYS5kZXNjcmlwdGlvbjsgfVxuICAgIGlmIChvcHRpb25zLnJlcXVpcmVkID09PSB0cnVlIHx8IHNjaGVtYS5yZXF1aXJlZCA9PT0gdHJ1ZSkgeyBmLnJlcXVpcmVkID0gdHJ1ZTsgfVxuICAgIGlmIChzY2hlbWEubWF4TGVuZ3RoKSB7IGYubWF4bGVuZ3RoID0gc2NoZW1hLm1heExlbmd0aDsgfVxuICAgIGlmIChzY2hlbWEubWluTGVuZ3RoKSB7IGYubWlubGVuZ3RoID0gc2NoZW1hLm1heExlbmd0aDsgfVxuICAgIGlmIChzY2hlbWEucmVhZE9ubHkgfHwgc2NoZW1hLnJlYWRvbmx5KSB7IGYucmVhZG9ubHkgID0gdHJ1ZTsgfVxuICAgIGlmIChzY2hlbWEubWluaW11bSkgeyBmLm1pbmltdW0gPSBzY2hlbWEubWluaW11bSArIChzY2hlbWEuZXhjbHVzaXZlTWluaW11bSA/IDEgOiAwKTsgfVxuICAgIGlmIChzY2hlbWEubWF4aW11bSkgeyBmLm1heGltdW0gPSBzY2hlbWEubWF4aW11bSAtIChzY2hlbWEuZXhjbHVzaXZlTWF4aW11bSA/IDEgOiAwKTsgfVxuXG4gICAgLy9Ob24gc3RhbmRhcmQgYXR0cmlidXRlc1xuICAgIGlmIChzY2hlbWEudmFsaWRhdGlvbk1lc3NhZ2UpIHsgZi52YWxpZGF0aW9uTWVzc2FnZSA9IHNjaGVtYS52YWxpZGF0aW9uTWVzc2FnZTsgfVxuICAgIGlmIChzY2hlbWEuZW51bU5hbWVzKSB7IGYudGl0bGVNYXAgPSBjYW5vbmljYWxUaXRsZU1hcChzY2hlbWEuZW51bU5hbWVzLCBzY2hlbWFbJ2VudW0nXSk7IH1cbiAgICBmLnNjaGVtYSA9IHNjaGVtYTtcblxuICAgIC8vIE5nIG1vZGVsIG9wdGlvbnMgZG9lc24ndCBwbGF5IG5pY2Ugd2l0aCB1bmRlZmluZWQsIG1pZ2h0IGJlIGRlZmluZWRcbiAgICAvLyBnbG9iYWxseSB0aG91Z2hcbiAgICBmLm5nTW9kZWxPcHRpb25zID0gZi5uZ01vZGVsT3B0aW9ucyB8fCB7fTtcbiAgICByZXR1cm4gZjtcbiAgfTtcblxuICB2YXIgdGV4dCA9IGZ1bmN0aW9uKG5hbWUsIHNjaGVtYSwgb3B0aW9ucykge1xuICAgIGlmIChzY2hlbWEudHlwZSA9PT0gJ3N0cmluZycgJiYgIXNjaGVtYVsnZW51bSddKSB7XG4gICAgICB2YXIgZiA9IHN0ZEZvcm1PYmoobmFtZSwgc2NoZW1hLCBvcHRpb25zKTtcbiAgICAgIGYua2V5ICA9IG9wdGlvbnMucGF0aDtcbiAgICAgIGYudHlwZSA9ICd0ZXh0JztcbiAgICAgIG9wdGlvbnMubG9va3VwW3NmUGF0aFByb3ZpZGVyLnN0cmluZ2lmeShvcHRpb25zLnBhdGgpXSA9IGY7XG4gICAgICByZXR1cm4gZjtcbiAgICB9XG4gIH07XG5cbiAgLy9kZWZhdWx0IGluIGpzb24gZm9ybSBmb3IgbnVtYmVyIGFuZCBpbnRlZ2VyIGlzIGEgdGV4dCBmaWVsZFxuICAvL2lucHV0IHR5cGU9XCJudW1iZXJcIiB3b3VsZCBiZSBtb3JlIHN1aXRhYmxlIGRvbid0IHlhIHRoaW5rP1xuICB2YXIgbnVtYmVyID0gZnVuY3Rpb24obmFtZSwgc2NoZW1hLCBvcHRpb25zKSB7XG4gICAgaWYgKHNjaGVtYS50eXBlID09PSAnbnVtYmVyJykge1xuICAgICAgdmFyIGYgPSBzdGRGb3JtT2JqKG5hbWUsIHNjaGVtYSwgb3B0aW9ucyk7XG4gICAgICBmLmtleSAgPSBvcHRpb25zLnBhdGg7XG4gICAgICBmLnR5cGUgPSAnbnVtYmVyJztcbiAgICAgIG9wdGlvbnMubG9va3VwW3NmUGF0aFByb3ZpZGVyLnN0cmluZ2lmeShvcHRpb25zLnBhdGgpXSA9IGY7XG4gICAgICByZXR1cm4gZjtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGludGVnZXIgPSBmdW5jdGlvbihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpIHtcbiAgICBpZiAoc2NoZW1hLnR5cGUgPT09ICdpbnRlZ2VyJykge1xuICAgICAgdmFyIGYgPSBzdGRGb3JtT2JqKG5hbWUsIHNjaGVtYSwgb3B0aW9ucyk7XG4gICAgICBmLmtleSAgPSBvcHRpb25zLnBhdGg7XG4gICAgICBmLnR5cGUgPSAnbnVtYmVyJztcbiAgICAgIG9wdGlvbnMubG9va3VwW3NmUGF0aFByb3ZpZGVyLnN0cmluZ2lmeShvcHRpb25zLnBhdGgpXSA9IGY7XG4gICAgICByZXR1cm4gZjtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGNoZWNrYm94ID0gZnVuY3Rpb24obmFtZSwgc2NoZW1hLCBvcHRpb25zKSB7XG4gICAgaWYgKHNjaGVtYS50eXBlID09PSAnYm9vbGVhbicpIHtcbiAgICAgIHZhciBmID0gc3RkRm9ybU9iaihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpO1xuICAgICAgZi5rZXkgID0gb3B0aW9ucy5wYXRoO1xuICAgICAgZi50eXBlID0gJ2NoZWNrYm94JztcbiAgICAgIG9wdGlvbnMubG9va3VwW3NmUGF0aFByb3ZpZGVyLnN0cmluZ2lmeShvcHRpb25zLnBhdGgpXSA9IGY7XG4gICAgICByZXR1cm4gZjtcbiAgICB9XG4gIH07XG5cbiAgdmFyIHNlbGVjdCA9IGZ1bmN0aW9uKG5hbWUsIHNjaGVtYSwgb3B0aW9ucykge1xuICAgIGlmIChzY2hlbWEudHlwZSA9PT0gJ3N0cmluZycgJiYgc2NoZW1hWydlbnVtJ10pIHtcbiAgICAgIHZhciBmID0gc3RkRm9ybU9iaihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpO1xuICAgICAgZi5rZXkgID0gb3B0aW9ucy5wYXRoO1xuICAgICAgZi50eXBlID0gJ3NlbGVjdCc7XG4gICAgICBpZiAoIWYudGl0bGVNYXApIHtcbiAgICAgICAgZi50aXRsZU1hcCA9IGVudW1Ub1RpdGxlTWFwKHNjaGVtYVsnZW51bSddKTtcbiAgICAgIH1cbiAgICAgIG9wdGlvbnMubG9va3VwW3NmUGF0aFByb3ZpZGVyLnN0cmluZ2lmeShvcHRpb25zLnBhdGgpXSA9IGY7XG4gICAgICByZXR1cm4gZjtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGNoZWNrYm94ZXMgPSBmdW5jdGlvbihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpIHtcbiAgICBpZiAoc2NoZW1hLnR5cGUgPT09ICdhcnJheScgJiYgc2NoZW1hLml0ZW1zICYmIHNjaGVtYS5pdGVtc1snZW51bSddKSB7XG4gICAgICB2YXIgZiA9IHN0ZEZvcm1PYmoobmFtZSwgc2NoZW1hLCBvcHRpb25zKTtcbiAgICAgIGYua2V5ICA9IG9wdGlvbnMucGF0aDtcbiAgICAgIGYudHlwZSA9ICdjaGVja2JveGVzJztcbiAgICAgIGlmICghZi50aXRsZU1hcCkge1xuICAgICAgICBmLnRpdGxlTWFwID0gZW51bVRvVGl0bGVNYXAoc2NoZW1hLml0ZW1zWydlbnVtJ10pO1xuICAgICAgfVxuICAgICAgb3B0aW9ucy5sb29rdXBbc2ZQYXRoUHJvdmlkZXIuc3RyaW5naWZ5KG9wdGlvbnMucGF0aCldID0gZjtcbiAgICAgIHJldHVybiBmO1xuICAgIH1cbiAgfTtcblxuICB2YXIgZmllbGRzZXQgPSBmdW5jdGlvbihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpIHtcbiAgICBpZiAoc2NoZW1hLnR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgICB2YXIgZiAgID0gc3RkRm9ybU9iaihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpO1xuICAgICAgZi50eXBlICA9ICdmaWVsZHNldCc7XG4gICAgICBmLml0ZW1zID0gW107XG4gICAgICBvcHRpb25zLmxvb2t1cFtzZlBhdGhQcm92aWRlci5zdHJpbmdpZnkob3B0aW9ucy5wYXRoKV0gPSBmO1xuXG4gICAgICAvL3JlY3Vyc2UgZG93biBpbnRvIHByb3BlcnRpZXNcbiAgICAgIGFuZ3VsYXIuZm9yRWFjaChzY2hlbWEucHJvcGVydGllcywgZnVuY3Rpb24odiwgaykge1xuICAgICAgICB2YXIgcGF0aCA9IG9wdGlvbnMucGF0aC5zbGljZSgpO1xuICAgICAgICBwYXRoLnB1c2goayk7XG4gICAgICAgIGlmIChvcHRpb25zLmlnbm9yZVtzZlBhdGhQcm92aWRlci5zdHJpbmdpZnkocGF0aCldICE9PSB0cnVlKSB7XG4gICAgICAgICAgdmFyIHJlcXVpcmVkID0gc2NoZW1hLnJlcXVpcmVkICYmIHNjaGVtYS5yZXF1aXJlZC5pbmRleE9mKGspICE9PSAtMTtcblxuICAgICAgICAgIHZhciBkZWYgPSBkZWZhdWx0Rm9ybURlZmluaXRpb24oaywgdiwge1xuICAgICAgICAgICAgcGF0aDogcGF0aCxcbiAgICAgICAgICAgIHJlcXVpcmVkOiByZXF1aXJlZCB8fCBmYWxzZSxcbiAgICAgICAgICAgIGxvb2t1cDogb3B0aW9ucy5sb29rdXAsXG4gICAgICAgICAgICBpZ25vcmU6IG9wdGlvbnMuaWdub3JlXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWYgKGRlZikge1xuICAgICAgICAgICAgZi5pdGVtcy5wdXNoKGRlZik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGY7XG4gICAgfVxuXG4gIH07XG5cbiAgdmFyIGFycmF5ID0gZnVuY3Rpb24obmFtZSwgc2NoZW1hLCBvcHRpb25zKSB7XG5cbiAgICBpZiAoc2NoZW1hLnR5cGUgPT09ICdhcnJheScpIHtcbiAgICAgIHZhciBmICAgPSBzdGRGb3JtT2JqKG5hbWUsIHNjaGVtYSwgb3B0aW9ucyk7XG4gICAgICBmLnR5cGUgID0gJ2FycmF5JztcbiAgICAgIGYua2V5ICAgPSBvcHRpb25zLnBhdGg7XG4gICAgICBvcHRpb25zLmxvb2t1cFtzZlBhdGhQcm92aWRlci5zdHJpbmdpZnkob3B0aW9ucy5wYXRoKV0gPSBmO1xuXG4gICAgICB2YXIgcmVxdWlyZWQgPSBzY2hlbWEucmVxdWlyZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgIHNjaGVtYS5yZXF1aXJlZC5pbmRleE9mKG9wdGlvbnMucGF0aFtvcHRpb25zLnBhdGgubGVuZ3RoIC0gMV0pICE9PSAtMTtcblxuICAgICAgLy8gVGhlIGRlZmF1bHQgaXMgdG8gYWx3YXlzIGp1c3QgY3JlYXRlIG9uZSBjaGlsZC4gVGhpcyB3b3JrcyBzaW5jZSBpZiB0aGVcbiAgICAgIC8vIHNjaGVtYXMgaXRlbXMgZGVjbGFyYXRpb24gaXMgb2YgdHlwZTogXCJvYmplY3RcIiB0aGVuIHdlIGdldCBhIGZpZWxkc2V0LlxuICAgICAgLy8gV2UgYWxzbyBmb2xsb3cganNvbiBmb3JtIG5vdGF0YXRpb24sIGFkZGluZyBlbXB0eSBicmFja2V0cyBcIltdXCIgdG9cbiAgICAgIC8vIHNpZ25pZnkgYXJyYXlzLlxuXG4gICAgICB2YXIgYXJyUGF0aCA9IG9wdGlvbnMucGF0aC5zbGljZSgpO1xuICAgICAgYXJyUGF0aC5wdXNoKCcnKTtcblxuICAgICAgZi5pdGVtcyA9IFtkZWZhdWx0Rm9ybURlZmluaXRpb24obmFtZSwgc2NoZW1hLml0ZW1zLCB7XG4gICAgICAgIHBhdGg6IGFyclBhdGgsXG4gICAgICAgIHJlcXVpcmVkOiByZXF1aXJlZCB8fCBmYWxzZSxcbiAgICAgICAgbG9va3VwOiBvcHRpb25zLmxvb2t1cCxcbiAgICAgICAgaWdub3JlOiBvcHRpb25zLmlnbm9yZSxcbiAgICAgICAgZ2xvYmFsOiBvcHRpb25zLmdsb2JhbFxuICAgICAgfSldO1xuXG4gICAgICByZXR1cm4gZjtcbiAgICB9XG5cbiAgfTtcblxuICAvL0ZpcnN0IHNvcnRlZCBieSBzY2hlbWEgdHlwZSB0aGVuIGEgbGlzdC5cbiAgLy9PcmRlciBoYXMgaW1wb3J0YW5jZS4gRmlyc3QgaGFuZGxlciByZXR1cm5pbmcgYW4gZm9ybSBzbmlwcGV0IHdpbGwgYmUgdXNlZC5cbiAgdmFyIGRlZmF1bHRzID0ge1xuICAgIHN0cmluZzogIFtzZWxlY3QsIHRleHRdLFxuICAgIG9iamVjdDogIFtmaWVsZHNldF0sXG4gICAgbnVtYmVyOiAgW251bWJlcl0sXG4gICAgaW50ZWdlcjogW2ludGVnZXJdLFxuICAgIGJvb2xlYW46IFtjaGVja2JveF0sXG4gICAgYXJyYXk6ICAgW2NoZWNrYm94ZXMsIGFycmF5XVxuICB9O1xuXG4gIHZhciBwb3N0UHJvY2Vzc0ZuID0gZnVuY3Rpb24oZm9ybSkgeyByZXR1cm4gZm9ybTsgfTtcblxuICAvKipcbiAgICogUHJvdmlkZXIgQVBJXG4gICAqL1xuICB0aGlzLmRlZmF1bHRzICAgICAgICAgICAgICA9IGRlZmF1bHRzO1xuICB0aGlzLnN0ZEZvcm1PYmogICAgICAgICAgICA9IHN0ZEZvcm1PYmo7XG4gIHRoaXMuZGVmYXVsdEZvcm1EZWZpbml0aW9uID0gZGVmYXVsdEZvcm1EZWZpbml0aW9uO1xuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBhIHBvc3QgcHJvY2VzcyBmdW5jdGlvbi5cbiAgICogVGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgd2l0aCB0aGUgZnVsbHkgbWVyZ2VkXG4gICAqIGZvcm0gZGVmaW5pdGlvbiAoaS5lLiBhZnRlciBtZXJnaW5nIHdpdGggc2NoZW1hKVxuICAgKiBhbmQgd2hhdGV2ZXIgaXQgcmV0dXJucyBpcyB1c2VkIGFzIGZvcm0uXG4gICAqL1xuICB0aGlzLnBvc3RQcm9jZXNzID0gZnVuY3Rpb24oZm4pIHtcbiAgICBwb3N0UHJvY2Vzc0ZuID0gZm47XG4gIH07XG5cbiAgLyoqXG4gICAqIEFwcGVuZCBkZWZhdWx0IGZvcm0gcnVsZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gICB0eXBlIGpzb24gc2NoZW1hIHR5cGVcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gcnVsZSBhIGZ1bmN0aW9uKHByb3BlcnR5TmFtZSxwcm9wZXJ0eVNjaGVtYSxvcHRpb25zKSB0aGF0IHJldHVybnMgYSBmb3JtXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgZGVmaW5pdGlvbiBvciB1bmRlZmluZWRcbiAgICovXG4gIHRoaXMuYXBwZW5kUnVsZSA9IGZ1bmN0aW9uKHR5cGUsIHJ1bGUpIHtcbiAgICBpZiAoIWRlZmF1bHRzW3R5cGVdKSB7XG4gICAgICBkZWZhdWx0c1t0eXBlXSA9IFtdO1xuICAgIH1cbiAgICBkZWZhdWx0c1t0eXBlXS5wdXNoKHJ1bGUpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBQcmVwZW5kIGRlZmF1bHQgZm9ybSBydWxlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSAgIHR5cGUganNvbiBzY2hlbWEgdHlwZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBydWxlIGEgZnVuY3Rpb24ocHJvcGVydHlOYW1lLHByb3BlcnR5U2NoZW1hLG9wdGlvbnMpIHRoYXQgcmV0dXJucyBhIGZvcm1cbiAgICogICAgICAgICAgICAgICAgICAgICAgICBkZWZpbml0aW9uIG9yIHVuZGVmaW5lZFxuICAgKi9cbiAgdGhpcy5wcmVwZW5kUnVsZSA9IGZ1bmN0aW9uKHR5cGUsIHJ1bGUpIHtcbiAgICBpZiAoIWRlZmF1bHRzW3R5cGVdKSB7XG4gICAgICBkZWZhdWx0c1t0eXBlXSA9IFtdO1xuICAgIH1cbiAgICBkZWZhdWx0c1t0eXBlXS51bnNoaWZ0KHJ1bGUpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBVdGlsaXR5IGZ1bmN0aW9uIHRvIGNyZWF0ZSBhIHN0YW5kYXJkIGZvcm0gb2JqZWN0LlxuICAgKiBUaGlzIGRvZXMgKm5vdCogc2V0IHRoZSB0eXBlIG9mIHRoZSBmb3JtIGJ1dCByYXRoZXIgYWxsIHNoYXJlZCBhdHRyaWJ1dGVzLlxuICAgKiBZb3UgcHJvYmFibHkgd2FudCB0byBzdGFydCB5b3VyIHJ1bGUgd2l0aCBjcmVhdGluZyB0aGUgZm9ybSB3aXRoIHRoaXMgbWV0aG9kXG4gICAqIHRoZW4gc2V0dGluZyB0eXBlIGFuZCBhbnkgb3RoZXIgdmFsdWVzIHlvdSBuZWVkLlxuICAgKiBAcGFyYW0ge09iamVjdH0gc2NoZW1hXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAqIEByZXR1cm4ge09iamVjdH0gYSBmb3JtIGZpZWxkIGRlZmludGlvblxuICAgKi9cbiAgdGhpcy5jcmVhdGVTdGFuZGFyZEZvcm0gPSBzdGRGb3JtT2JqO1xuICAvKiBFbmQgUHJvdmlkZXIgQVBJICovXG5cbiAgdGhpcy4kZ2V0ID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgc2VydmljZSA9IHt9O1xuXG4gICAgc2VydmljZS5tZXJnZSA9IGZ1bmN0aW9uKHNjaGVtYSwgZm9ybSwgaWdub3JlLCBvcHRpb25zLCByZWFkb25seSkge1xuICAgICAgZm9ybSAgPSBmb3JtIHx8IFsnKiddO1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICAgIC8vIEdldCByZWFkb25seSBmcm9tIHJvb3Qgb2JqZWN0XG4gICAgICByZWFkb25seSA9IHJlYWRvbmx5IHx8IHNjaGVtYS5yZWFkb25seSB8fCBzY2hlbWEucmVhZE9ubHk7XG5cbiAgICAgIHZhciBzdGRGb3JtID0gc2VydmljZS5kZWZhdWx0cyhzY2hlbWEsIGlnbm9yZSwgb3B0aW9ucyk7XG5cbiAgICAgIC8vc2ltcGxlIGNhc2UsIHdlIGhhdmUgYSBcIipcIiwganVzdCBwdXQgdGhlIHN0ZEZvcm0gdGhlcmVcbiAgICAgIHZhciBpZHggPSBmb3JtLmluZGV4T2YoJyonKTtcbiAgICAgIGlmIChpZHggIT09IC0xKSB7XG4gICAgICAgIGZvcm0gID0gZm9ybS5zbGljZSgwLCBpZHgpXG4gICAgICAgICAgICAgICAgICAgIC5jb25jYXQoc3RkRm9ybS5mb3JtKVxuICAgICAgICAgICAgICAgICAgICAuY29uY2F0KGZvcm0uc2xpY2UoaWR4ICsgMSkpO1xuICAgICAgfVxuXG4gICAgICAvL29rIGxldCdzIG1lcmdlIVxuICAgICAgLy9XZSBsb29rIGF0IHRoZSBzdXBwbGllZCBmb3JtIGFuZCBleHRlbmQgaXQgd2l0aCBzY2hlbWEgc3RhbmRhcmRzXG4gICAgICB2YXIgbG9va3VwID0gc3RkRm9ybS5sb29rdXA7XG5cbiAgICAgIHJldHVybiBwb3N0UHJvY2Vzc0ZuKGZvcm0ubWFwKGZ1bmN0aW9uKG9iaikge1xuXG4gICAgICAgIC8vaGFuZGxlIHRoZSBzaG9ydGN1dCB3aXRoIGp1c3QgYSBuYW1lXG4gICAgICAgIGlmICh0eXBlb2Ygb2JqID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIG9iaiA9IHtrZXk6IG9ian07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob2JqLmtleSkge1xuICAgICAgICAgIGlmICh0eXBlb2Ygb2JqLmtleSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIG9iai5rZXkgPSBzZlBhdGhQcm92aWRlci5wYXJzZShvYmoua2V5KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvL0lmIGl0IGhhcyBhIHRpdGxlTWFwIG1ha2Ugc3VyZSBpdCdzIGEgbGlzdFxuICAgICAgICBpZiAob2JqLnRpdGxlTWFwKSB7XG4gICAgICAgICAgb2JqLnRpdGxlTWFwID0gY2Fub25pY2FsVGl0bGVNYXAob2JqLnRpdGxlTWFwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vXG4gICAgICAgIGlmIChvYmouaXRlbUZvcm0pIHtcbiAgICAgICAgICBvYmouaXRlbXMgPSBbXTtcbiAgICAgICAgICB2YXIgc3RyID0gc2ZQYXRoUHJvdmlkZXIuc3RyaW5naWZ5KG9iai5rZXkpO1xuICAgICAgICAgIHZhciBzdGRGb3JtID0gbG9va3VwW3N0cl07XG4gICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHN0ZEZvcm0uaXRlbXMsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgIHZhciBvID0gYW5ndWxhci5jb3B5KG9iai5pdGVtRm9ybSk7XG4gICAgICAgICAgICBvLmtleSA9IGl0ZW0ua2V5O1xuICAgICAgICAgICAgb2JqLml0ZW1zLnB1c2gobyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvL2V4dGVuZCB3aXRoIHN0ZCBmb3JtIGZyb20gc2NoZW1hLlxuXG4gICAgICAgIGlmIChvYmoua2V5KSB7XG4gICAgICAgICAgdmFyIHN0cmlkID0gc2ZQYXRoUHJvdmlkZXIuc3RyaW5naWZ5KG9iai5rZXkpO1xuICAgICAgICAgIGlmIChsb29rdXBbc3RyaWRdKSB7XG4gICAgICAgICAgICBvYmogPSBhbmd1bGFyLmV4dGVuZChsb29rdXBbc3RyaWRdLCBvYmopO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFyZSB3ZSBpbmhlcml0aW5nIHJlYWRvbmx5P1xuICAgICAgICBpZiAocmVhZG9ubHkgPT09IHRydWUpIHsgLy8gSW5oZXJpdGluZyBmYWxzZSBpcyBub3QgY29vbC5cbiAgICAgICAgICBvYmoucmVhZG9ubHkgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9pZiBpdCdzIGEgdHlwZSB3aXRoIGl0ZW1zLCBtZXJnZSAnZW0hXG4gICAgICAgIGlmIChvYmouaXRlbXMpIHtcbiAgICAgICAgICBvYmouaXRlbXMgPSBzZXJ2aWNlLm1lcmdlKHNjaGVtYSwgb2JqLml0ZW1zLCBpZ25vcmUsIG9wdGlvbnMsIG9iai5yZWFkb25seSk7XG4gICAgICAgIH1cblxuICAgICAgICAvL2lmIGl0cyBoYXMgdGFicywgbWVyZ2UgdGhlbSBhbHNvIVxuICAgICAgICBpZiAob2JqLnRhYnMpIHtcbiAgICAgICAgICBhbmd1bGFyLmZvckVhY2gob2JqLnRhYnMsIGZ1bmN0aW9uKHRhYikge1xuICAgICAgICAgICAgdGFiLml0ZW1zID0gc2VydmljZS5tZXJnZShzY2hlbWEsIHRhYi5pdGVtcywgaWdub3JlLCBvcHRpb25zLCBvYmoucmVhZG9ubHkpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU3BlY2lhbCBjYXNlOiBjaGVja2JveFxuICAgICAgICAvLyBTaW5jZSBoYXZlIHRvIHRlcm5hcnkgc3RhdGUgd2UgbmVlZCBhIGRlZmF1bHRcbiAgICAgICAgaWYgKG9iai50eXBlID09PSAnY2hlY2tib3gnICYmIGFuZ3VsYXIuaXNVbmRlZmluZWQob2JqLnNjaGVtYVsnZGVmYXVsdCddKSkge1xuICAgICAgICAgIG9iai5zY2hlbWFbJ2RlZmF1bHQnXSA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgIH0pKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGZvcm0gZGVmYXVsdHMgZnJvbSBzY2hlbWFcbiAgICAgKi9cbiAgICBzZXJ2aWNlLmRlZmF1bHRzID0gZnVuY3Rpb24oc2NoZW1hLCBpZ25vcmUsIGdsb2JhbE9wdGlvbnMpIHtcbiAgICAgIHZhciBmb3JtICAgPSBbXTtcbiAgICAgIHZhciBsb29rdXAgPSB7fTsgLy9NYXAgcGF0aCA9PiBmb3JtIG9iaiBmb3IgZmFzdCBsb29rdXAgaW4gbWVyZ2luZ1xuICAgICAgaWdub3JlID0gaWdub3JlIHx8IHt9O1xuICAgICAgZ2xvYmFsT3B0aW9ucyA9IGdsb2JhbE9wdGlvbnMgfHwge307XG5cbiAgICAgIGlmIChzY2hlbWEudHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKHNjaGVtYS5wcm9wZXJ0aWVzLCBmdW5jdGlvbih2LCBrKSB7XG4gICAgICAgICAgaWYgKGlnbm9yZVtrXSAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgdmFyIHJlcXVpcmVkID0gc2NoZW1hLnJlcXVpcmVkICYmIHNjaGVtYS5yZXF1aXJlZC5pbmRleE9mKGspICE9PSAtMTtcbiAgICAgICAgICAgIHZhciBkZWYgPSBkZWZhdWx0Rm9ybURlZmluaXRpb24oaywgdiwge1xuICAgICAgICAgICAgICBwYXRoOiBba10sICAgICAgICAgLy8gUGF0aCB0byB0aGlzIHByb3BlcnR5IGluIGJyYWNrZXQgbm90YXRpb24uXG4gICAgICAgICAgICAgIGxvb2t1cDogbG9va3VwLCAgICAvLyBFeHRyYSBtYXAgdG8gcmVnaXN0ZXIgd2l0aC4gT3B0aW1pemF0aW9uIGZvciBtZXJnZXIuXG4gICAgICAgICAgICAgIGlnbm9yZTogaWdub3JlLCAgICAvLyBUaGUgaWdub3JlIGxpc3Qgb2YgcGF0aHMgKHNhbnMgcm9vdCBsZXZlbCBuYW1lKVxuICAgICAgICAgICAgICByZXF1aXJlZDogcmVxdWlyZWQsIC8vIElzIGl0IHJlcXVpcmVkPyAodjQganNvbiBzY2hlbWEgc3R5bGUpXG4gICAgICAgICAgICAgIGdsb2JhbDogZ2xvYmFsT3B0aW9ucyAvLyBHbG9iYWwgb3B0aW9ucywgaW5jbHVkaW5nIGZvcm0gZGVmYXVsdHNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGRlZikge1xuICAgICAgICAgICAgICBmb3JtLnB1c2goZGVmKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZC4gT25seSB0eXBlIFwib2JqZWN0XCIgYWxsb3dlZCBhdCByb290IGxldmVsIG9mIHNjaGVtYS4nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7Zm9ybTogZm9ybSwgbG9va3VwOiBsb29rdXB9O1xuICAgIH07XG5cbiAgICAvL1V0aWxpdHkgZnVuY3Rpb25zXG4gICAgLyoqXG4gICAgICogVHJhdmVyc2UgYSBzY2hlbWEsIGFwcGx5aW5nIGEgZnVuY3Rpb24oc2NoZW1hLHBhdGgpIG9uIGV2ZXJ5IHN1YiBzY2hlbWFcbiAgICAgKiBpLmUuIGV2ZXJ5IHByb3BlcnR5IG9mIGFuIG9iamVjdC5cbiAgICAgKi9cbiAgICBzZXJ2aWNlLnRyYXZlcnNlU2NoZW1hID0gZnVuY3Rpb24oc2NoZW1hLCBmbiwgcGF0aCwgaWdub3JlQXJyYXlzKSB7XG4gICAgICBpZ25vcmVBcnJheXMgPSBhbmd1bGFyLmlzRGVmaW5lZChpZ25vcmVBcnJheXMpID8gaWdub3JlQXJyYXlzIDogdHJ1ZTtcblxuICAgICAgcGF0aCA9IHBhdGggfHwgW107XG5cbiAgICAgIHZhciB0cmF2ZXJzZSA9IGZ1bmN0aW9uKHNjaGVtYSwgZm4sIHBhdGgpIHtcbiAgICAgICAgZm4oc2NoZW1hLCBwYXRoKTtcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKHNjaGVtYS5wcm9wZXJ0aWVzLCBmdW5jdGlvbihwcm9wLCBuYW1lKSB7XG4gICAgICAgICAgdmFyIGN1cnJlbnRQYXRoID0gcGF0aC5zbGljZSgpO1xuICAgICAgICAgIGN1cnJlbnRQYXRoLnB1c2gobmFtZSk7XG4gICAgICAgICAgdHJhdmVyc2UocHJvcCwgZm4sIGN1cnJlbnRQYXRoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy9Pbmx5IHN1cHBvcnQgdHlwZSBcImFycmF5XCIgd2hpY2ggaGF2ZSBhIHNjaGVtYSBhcyBcIml0ZW1zXCIuXG4gICAgICAgIGlmICghaWdub3JlQXJyYXlzICYmIHNjaGVtYS5pdGVtcykge1xuICAgICAgICAgIHZhciBhcnJQYXRoID0gcGF0aC5zbGljZSgpOyBhcnJQYXRoLnB1c2goJycpO1xuICAgICAgICAgIHRyYXZlcnNlKHNjaGVtYS5pdGVtcywgZm4sIGFyclBhdGgpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICB0cmF2ZXJzZShzY2hlbWEsIGZuLCBwYXRoIHx8IFtdKTtcbiAgICB9O1xuXG4gICAgc2VydmljZS50cmF2ZXJzZUZvcm0gPSBmdW5jdGlvbihmb3JtLCBmbikge1xuICAgICAgZm4oZm9ybSk7XG4gICAgICBhbmd1bGFyLmZvckVhY2goZm9ybS5pdGVtcywgZnVuY3Rpb24oZikge1xuICAgICAgICBzZXJ2aWNlLnRyYXZlcnNlRm9ybShmLCBmbik7XG4gICAgICB9KTtcblxuICAgICAgaWYgKGZvcm0udGFicykge1xuICAgICAgICBhbmd1bGFyLmZvckVhY2goZm9ybS50YWJzLCBmdW5jdGlvbih0YWIpIHtcbiAgICAgICAgICBhbmd1bGFyLmZvckVhY2godGFiLml0ZW1zLCBmdW5jdGlvbihmKSB7XG4gICAgICAgICAgICBzZXJ2aWNlLnRyYXZlcnNlRm9ybShmLCBmbik7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gc2VydmljZTtcbiAgfTtcblxufV0pO1xuXG4vKiAgQ29tbW9uIGNvZGUgZm9yIHZhbGlkYXRpbmcgYSB2YWx1ZSBhZ2FpbnN0IGl0cyBmb3JtIGFuZCBzY2hlbWEgZGVmaW5pdGlvbiAqL1xuLyogZ2xvYmFsIHR2NCAqL1xuYW5ndWxhci5tb2R1bGUoJ3NjaGVtYUZvcm0nKS5mYWN0b3J5KCdzZlZhbGlkYXRvcicsIFtmdW5jdGlvbigpIHtcblxuICB2YXIgdmFsaWRhdG9yID0ge307XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRlIGEgdmFsdWUgYWdhaW5zdCBpdHMgZm9ybSBkZWZpbml0aW9uIGFuZCBzY2hlbWEuXG4gICAqIFRoZSB2YWx1ZSBzaG91bGQgZWl0aGVyIGJlIG9mIHByb3BlciB0eXBlIG9yIGEgc3RyaW5nLCBzb21lIHR5cGVcbiAgICogY29lcmNpb24gaXMgYXBwbGllZC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IGZvcm0gQSBtZXJnZWQgZm9ybSBkZWZpbml0aW9uLCBpLmUuIG9uZSB3aXRoIGEgc2NoZW1hLlxuICAgKiBAcGFyYW0ge0FueX0gdmFsdWUgdGhlIHZhbHVlIHRvIHZhbGlkYXRlLlxuICAgKiBAcmV0dXJuIGEgdHY0anMgcmVzdWx0IG9iamVjdC5cbiAgICovXG4gIHZhbGlkYXRvci52YWxpZGF0ZSA9IGZ1bmN0aW9uKGZvcm0sIHZhbHVlKSB7XG4gICAgaWYgKCFmb3JtKSB7XG4gICAgICByZXR1cm4ge3ZhbGlkOiB0cnVlfTtcbiAgICB9XG4gICAgdmFyIHNjaGVtYSA9IGZvcm0uc2NoZW1hO1xuXG4gICAgaWYgKCFzY2hlbWEpIHtcbiAgICAgIHJldHVybiB7dmFsaWQ6IHRydWV9O1xuICAgIH1cblxuICAgIC8vIElucHV0IG9mIHR5cGUgdGV4dCBhbmQgdGV4dGFyZWFzIHdpbGwgZ2l2ZSB1cyBhIHZpZXdWYWx1ZSBvZiAnJ1xuICAgIC8vIHdoZW4gZW1wdHksIHRoaXMgaXMgYSB2YWxpZCB2YWx1ZSBpbiBhIHNjaGVtYSBhbmQgZG9lcyBub3QgY291bnQgYXMgc29tZXRoaW5nXG4gICAgLy8gdGhhdCBicmVha3MgdmFsaWRhdGlvbiBvZiAncmVxdWlyZWQnLiBCdXQgZm9yIG91ciBvd24gc2FuaXR5IGFuIGVtcHR5IGZpZWxkIHNob3VsZFxuICAgIC8vIG5vdCB2YWxpZGF0ZSBpZiBpdCdzIHJlcXVpcmVkLlxuICAgIGlmICh2YWx1ZSA9PT0gJycpIHtcbiAgICAgIHZhbHVlID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIC8vIE51bWJlcnMgZmllbGRzIHdpbGwgZ2l2ZSBhIG51bGwgdmFsdWUsIHdoaWNoIGFsc28gbWVhbnMgZW1wdHkgZmllbGRcbiAgICBpZiAoZm9ybS50eXBlID09PSAnbnVtYmVyJyAmJiB2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgdmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgLy8gVmVyc2lvbiA0IG9mIEpTT04gU2NoZW1hIGhhcyB0aGUgcmVxdWlyZWQgcHJvcGVydHkgbm90IG9uIHRoZVxuICAgIC8vIHByb3BlcnR5IGl0c2VsZiBidXQgb24gdGhlIHdyYXBwaW5nIG9iamVjdC4gU2luY2Ugd2UgbGlrZSB0byB0ZXN0XG4gICAgLy8gb25seSB0aGlzIHByb3BlcnR5IHdlIHdyYXAgaXQgaW4gYSBmYWtlIG9iamVjdC5cbiAgICB2YXIgd3JhcCA9IHt0eXBlOiAnb2JqZWN0JywgJ3Byb3BlcnRpZXMnOiB7fX07XG4gICAgdmFyIHByb3BOYW1lID0gZm9ybS5rZXlbZm9ybS5rZXkubGVuZ3RoIC0gMV07XG4gICAgd3JhcC5wcm9wZXJ0aWVzW3Byb3BOYW1lXSA9IHNjaGVtYTtcblxuICAgIGlmIChmb3JtLnJlcXVpcmVkKSB7XG4gICAgICB3cmFwLnJlcXVpcmVkID0gW3Byb3BOYW1lXTtcbiAgICB9XG4gICAgdmFyIHZhbHVlV3JhcCA9IHt9O1xuICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZCh2YWx1ZSkpIHtcbiAgICAgIHZhbHVlV3JhcFtwcm9wTmFtZV0gPSB2YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHR2NC52YWxpZGF0ZVJlc3VsdCh2YWx1ZVdyYXAsIHdyYXApO1xuXG4gIH07XG5cbiAgcmV0dXJuIHZhbGlkYXRvcjtcbn1dKTtcblxuLyoqXG4gKiBEaXJlY3RpdmUgdGhhdCBoYW5kbGVzIHRoZSBtb2RlbCBhcnJheXNcbiAqL1xuYW5ndWxhci5tb2R1bGUoJ3NjaGVtYUZvcm0nKS5kaXJlY3RpdmUoJ3NmQXJyYXknLCBbJ3NmU2VsZWN0JywgJ3NjaGVtYUZvcm0nLCAnc2ZWYWxpZGF0b3InLFxuICBmdW5jdGlvbihzZlNlbGVjdCwgc2NoZW1hRm9ybSwgc2ZWYWxpZGF0b3IpIHtcblxuICAgIHZhciBzZXRJbmRleCA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZm9ybSkge1xuICAgICAgICBpZiAoZm9ybS5rZXkpIHtcbiAgICAgICAgICBmb3JtLmtleVtmb3JtLmtleS5pbmRleE9mKCcnKV0gPSBpbmRleDtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICBzY29wZTogdHJ1ZSxcbiAgICAgIHJlcXVpcmU6ICc/bmdNb2RlbCcsXG4gICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIG5nTW9kZWwpIHtcbiAgICAgICAgdmFyIGZvcm1EZWZDYWNoZSA9IHt9O1xuXG4gICAgICAgIC8vIFdhdGNoIGZvciB0aGUgZm9ybSBkZWZpbml0aW9uIGFuZCB0aGVuIHJld3JpdGUgaXQuXG4gICAgICAgIC8vIEl0J3MgdGhlIChmaXJzdCkgYXJyYXkgcGFydCBvZiB0aGUga2V5LCAnW10nIHRoYXQgbmVlZHMgYSBudW1iZXJcbiAgICAgICAgLy8gY29ycmVzcG9uZGluZyB0byBhbiBpbmRleCBvZiB0aGUgZm9ybS5cbiAgICAgICAgdmFyIG9uY2UgPSBzY29wZS4kd2F0Y2goYXR0cnMuc2ZBcnJheSwgZnVuY3Rpb24oZm9ybSkge1xuXG4gICAgICAgICAgLy8gQW4gYXJyYXkgbW9kZWwgYWx3YXlzIG5lZWRzIGEga2V5IHNvIHdlIGtub3cgd2hhdCBwYXJ0IG9mIHRoZSBtb2RlbFxuICAgICAgICAgIC8vIHRvIGxvb2sgYXQuIFRoaXMgbWFrZXMgdXMgYSBiaXQgaW5jb21wYXRpYmxlIHdpdGggSlNPTiBGb3JtLCBvbiB0aGVcbiAgICAgICAgICAvLyBvdGhlciBoYW5kIGl0IGVuYWJsZXMgdHdvIHdheSBiaW5kaW5nLlxuICAgICAgICAgIHZhciBsaXN0ID0gc2ZTZWxlY3QoZm9ybS5rZXksIHNjb3BlLm1vZGVsKTtcblxuICAgICAgICAgIC8vIFNpbmNlIG5nLW1vZGVsIGhhcHBpbHkgY3JlYXRlcyBvYmplY3RzIGluIGEgZGVlcCBwYXRoIHdoZW4gc2V0dGluZyBhXG4gICAgICAgICAgLy8gYSB2YWx1ZSBidXQgbm90IGFycmF5cyB3ZSBuZWVkIHRvIGNyZWF0ZSB0aGUgYXJyYXkuXG4gICAgICAgICAgaWYgKGFuZ3VsYXIuaXNVbmRlZmluZWQobGlzdCkpIHtcbiAgICAgICAgICAgIGxpc3QgPSBbXTtcbiAgICAgICAgICAgIHNmU2VsZWN0KGZvcm0ua2V5LCBzY29wZS5tb2RlbCwgbGlzdCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHNjb3BlLm1vZGVsQXJyYXkgPSBsaXN0O1xuXG4gICAgICAgICAgLy8gQXJyYXlzIHdpdGggdGl0bGVNYXBzLCBpLmUuIGNoZWNrYm94ZXMgZG9lc24ndCBoYXZlIGl0ZW1zLlxuICAgICAgICAgIGlmIChmb3JtLml0ZW1zKSB7XG5cbiAgICAgICAgICAgIC8vIFRvIGJlIG1vcmUgY29tcGF0aWJsZSB3aXRoIEpTT04gRm9ybSB3ZSBzdXBwb3J0IGFuIGFycmF5IG9mIGl0ZW1zXG4gICAgICAgICAgICAvLyBpbiB0aGUgZm9ybSBkZWZpbml0aW9uIG9mIFwiYXJyYXlcIiAodGhlIHNjaGVtYSBqdXN0IGEgdmFsdWUpLlxuICAgICAgICAgICAgLy8gZm9yIHRoZSBzdWJmb3JtcyBjb2RlIHRvIHdvcmsgdGhpcyBtZWFucyB3ZSB3cmFwIGV2ZXJ5dGhpbmcgaW4gYVxuICAgICAgICAgICAgLy8gc2VjdGlvbi4gVW5sZXNzIHRoZXJlIGlzIGp1c3Qgb25lLlxuICAgICAgICAgICAgdmFyIHN1YkZvcm0gPSBmb3JtLml0ZW1zWzBdO1xuICAgICAgICAgICAgaWYgKGZvcm0uaXRlbXMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICBzdWJGb3JtID0ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdzZWN0aW9uJyxcbiAgICAgICAgICAgICAgICBpdGVtczogZm9ybS5pdGVtcy5tYXAoZnVuY3Rpb24oaXRlbSl7XG4gICAgICAgICAgICAgICAgICBpdGVtLm5nTW9kZWxPcHRpb25zID0gZm9ybS5uZ01vZGVsT3B0aW9ucztcbiAgICAgICAgICAgICAgICAgIGl0ZW0ucmVhZG9ubHkgPSBmb3JtLnJlYWRvbmx5O1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFdlIGNlYXRlIGNvcGllcyBvZiB0aGUgZm9ybSBvbiBkZW1hbmQsIGNhY2hpbmcgdGhlbSBmb3JcbiAgICAgICAgICAvLyBsYXRlciByZXF1ZXN0c1xuICAgICAgICAgIHNjb3BlLmNvcHlXaXRoSW5kZXggPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAgICAgaWYgKCFmb3JtRGVmQ2FjaGVbaW5kZXhdKSB7XG4gICAgICAgICAgICAgIGlmIChzdWJGb3JtKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvcHkgPSBhbmd1bGFyLmNvcHkoc3ViRm9ybSk7XG4gICAgICAgICAgICAgICAgY29weS5hcnJheUluZGV4ID0gaW5kZXg7XG4gICAgICAgICAgICAgICAgc2NoZW1hRm9ybS50cmF2ZXJzZUZvcm0oY29weSwgc2V0SW5kZXgoaW5kZXgpKTtcbiAgICAgICAgICAgICAgICBmb3JtRGVmQ2FjaGVbaW5kZXhdID0gY29weTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZvcm1EZWZDYWNoZVtpbmRleF07XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIHNjb3BlLmFwcGVuZFRvQXJyYXkgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBsZW4gPSBsaXN0Lmxlbmd0aDtcbiAgICAgICAgICAgIHZhciBjb3B5ID0gc2NvcGUuY29weVdpdGhJbmRleChsZW4pO1xuICAgICAgICAgICAgc2NoZW1hRm9ybS50cmF2ZXJzZUZvcm0oY29weSwgZnVuY3Rpb24ocGFydCkge1xuICAgICAgICAgICAgICBpZiAocGFydC5rZXkgJiYgYW5ndWxhci5pc0RlZmluZWQocGFydFsnZGVmYXVsdCddKSkge1xuICAgICAgICAgICAgICAgIHNmU2VsZWN0KHBhcnQua2V5LCBzY29wZS5tb2RlbCwgcGFydFsnZGVmYXVsdCddKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIElmIHRoZXJlIGFyZSBubyBkZWZhdWx0cyBub3RoaW5nIGlzIGFkZGVkIHNvIHdlIG5lZWQgdG8gaW5pdGlhbGl6ZVxuICAgICAgICAgICAgLy8gdGhlIGFycmF5LiB1bmRlZmluZWQgZm9yIGJhc2ljIHZhbHVlcywge30gb3IgW10gZm9yIHRoZSBvdGhlcnMuXG4gICAgICAgICAgICBpZiAobGVuID09PSBsaXN0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICB2YXIgdHlwZSA9IHNmU2VsZWN0KCdzY2hlbWEuaXRlbXMudHlwZScsIGZvcm0pO1xuICAgICAgICAgICAgICB2YXIgZGZsdDtcbiAgICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgZGZsdCA9IHt9O1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdhcnJheScpIHtcbiAgICAgICAgICAgICAgICBkZmx0ID0gW107XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgbGlzdC5wdXNoKGRmbHQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBUcmlnZ2VyIHZhbGlkYXRpb24uXG4gICAgICAgICAgICBpZiAoc2NvcGUudmFsaWRhdGVBcnJheSkge1xuICAgICAgICAgICAgICBzY29wZS52YWxpZGF0ZUFycmF5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbGlzdDtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgc2NvcGUuZGVsZXRlRnJvbUFycmF5ID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgICAgIGxpc3Quc3BsaWNlKGluZGV4LCAxKTtcblxuICAgICAgICAgICAgLy8gVHJpZ2dlciB2YWxpZGF0aW9uLlxuICAgICAgICAgICAgaWYgKHNjb3BlLnZhbGlkYXRlQXJyYXkpIHtcbiAgICAgICAgICAgICAgc2NvcGUudmFsaWRhdGVBcnJheSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGxpc3Q7XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIC8vIEFsd2F5cyBzdGFydCB3aXRoIG9uZSBlbXB0eSBmb3JtIHVubGVzcyBjb25maWd1cmVkIG90aGVyd2lzZS5cbiAgICAgICAgICAvLyBTcGVjaWFsIGNhc2U6IGRvbid0IGRvIGl0IGlmIGZvcm0gaGFzIGEgdGl0bGVNYXBcbiAgICAgICAgICBpZiAoIWZvcm0udGl0bGVNYXAgJiYgZm9ybS5zdGFydEVtcHR5ICE9PSB0cnVlICYmIGxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBzY29wZS5hcHBlbmRUb0FycmF5KCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gVGl0bGUgTWFwIGhhbmRsaW5nXG4gICAgICAgICAgLy8gSWYgZm9ybSBoYXMgYSB0aXRsZU1hcCBjb25maWd1cmVkIHdlJ2QgbGlrZSB0byBlbmFibGUgbG9vcGluZyBvdmVyXG4gICAgICAgICAgLy8gdGl0bGVNYXAgaW5zdGVhZCBvZiBtb2RlbEFycmF5LCB0aGlzIGlzIHVzZWQgZm9yIGludGFuY2UgaW5cbiAgICAgICAgICAvLyBjaGVja2JveGVzLiBTbyBpbnN0ZWFkIG9mIHZhcmlhYmxlIG51bWJlciBvZiB0aGluZ3Mgd2UgbGlrZSB0byBjcmVhdGVcbiAgICAgICAgICAvLyBhIGFycmF5IHZhbHVlIGZyb20gYSBzdWJzZXQgb2YgdmFsdWVzIGluIHRoZSB0aXRsZU1hcC5cbiAgICAgICAgICAvLyBUaGUgcHJvYmxlbSBoZXJlIGlzIHRoYXQgbmctbW9kZWwgb24gYSBjaGVja2JveCBkb2Vzbid0IHJlYWxseSBtYXAgdG9cbiAgICAgICAgICAvLyBhIGxpc3Qgb2YgdmFsdWVzLiBUaGlzIGlzIGhlcmUgdG8gZml4IHRoYXQuXG4gICAgICAgICAgaWYgKGZvcm0udGl0bGVNYXAgJiYgZm9ybS50aXRsZU1hcC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBzY29wZS50aXRsZU1hcFZhbHVlcyA9IFtdO1xuXG4gICAgICAgICAgICAvLyBXZSB3YXRjaCB0aGUgbW9kZWwgZm9yIGNoYW5nZXMgYW5kIHRoZSB0aXRsZU1hcFZhbHVlcyB0byByZWZsZWN0XG4gICAgICAgICAgICAvLyB0aGUgbW9kZWxBcnJheVxuICAgICAgICAgICAgdmFyIHVwZGF0ZVRpdGxlTWFwVmFsdWVzID0gZnVuY3Rpb24oYXJyKSB7XG4gICAgICAgICAgICAgIHNjb3BlLnRpdGxlTWFwVmFsdWVzID0gW107XG4gICAgICAgICAgICAgIGFyciA9IGFyciB8fCBbXTtcblxuICAgICAgICAgICAgICBmb3JtLnRpdGxlTWFwLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgIHNjb3BlLnRpdGxlTWFwVmFsdWVzLnB1c2goYXJyLmluZGV4T2YoaXRlbS52YWx1ZSkgIT09IC0xKTtcbiAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvL0NhdGNoIGRlZmF1bHQgdmFsdWVzXG4gICAgICAgICAgICB1cGRhdGVUaXRsZU1hcFZhbHVlcyhzY29wZS5tb2RlbEFycmF5KTtcbiAgICAgICAgICAgIHNjb3BlLiR3YXRjaENvbGxlY3Rpb24oJ21vZGVsQXJyYXknLCB1cGRhdGVUaXRsZU1hcFZhbHVlcyk7XG5cbiAgICAgICAgICAgIC8vVG8gZ2V0IHR3byB3YXkgYmluZGluZyB3ZSBhbHNvIHdhdGNoIG91ciB0aXRsZU1hcFZhbHVlc1xuICAgICAgICAgICAgc2NvcGUuJHdhdGNoQ29sbGVjdGlvbigndGl0bGVNYXBWYWx1ZXMnLCBmdW5jdGlvbih2YWxzKSB7XG4gICAgICAgICAgICAgIGlmICh2YWxzKSB7XG4gICAgICAgICAgICAgICAgdmFyIGFyciA9IHNjb3BlLm1vZGVsQXJyYXk7XG5cbiAgICAgICAgICAgICAgICAvLyBBcHBhcmVudGx5IHRoZSBmYXN0ZXN0IHdheSB0byBjbGVhciBhbiBhcnJheSwgcmVhZGFibGUgdG9vLlxuICAgICAgICAgICAgICAgIC8vIGh0dHA6Ly9qc3BlcmYuY29tL2FycmF5LWRlc3Ryb3kvMzJcbiAgICAgICAgICAgICAgICB3aGlsZSAoYXJyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgIGFyci5zaGlmdCgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGZvcm0udGl0bGVNYXAuZm9yRWFjaChmdW5jdGlvbihpdGVtLCBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgaWYgKHZhbHNbaW5kZXhdKSB7XG4gICAgICAgICAgICAgICAgICAgIGFyci5wdXNoKGl0ZW0udmFsdWUpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIElmIHRoZXJlIGlzIGEgbmdNb2RlbCBwcmVzZW50IHdlIG5lZWQgdG8gdmFsaWRhdGUgd2hlbiBhc2tlZC5cbiAgICAgICAgICBpZiAobmdNb2RlbCkge1xuICAgICAgICAgICAgdmFyIGVycm9yO1xuXG4gICAgICAgICAgICBzY29wZS52YWxpZGF0ZUFycmF5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIC8vIFRoZSBhY3R1YWwgY29udGVudCBvZiB0aGUgYXJyYXkgaXMgdmFsaWRhdGVkIGJ5IGVhY2ggZmllbGRcbiAgICAgICAgICAgICAgLy8gc28gd2Ugc2V0dGxlIGZvciBjaGVja2luZyB2YWxpZGF0aW9ucyBzcGVjaWZpYyB0byBhcnJheXNcblxuICAgICAgICAgICAgICAvLyBTaW5jZSB3ZSBwcmVmaWxsIHdpdGggZW1wdHkgYXJyYXlzIHdlIGNhbiBnZXQgdGhlIGZ1bm55IHNpdHVhdGlvblxuICAgICAgICAgICAgICAvLyB3aGVyZSB0aGUgYXJyYXkgaXMgcmVxdWlyZWQgYnV0IGVtcHR5IGluIHRoZSBndWkgYnV0IHN0aWxsIHZhbGlkYXRlcy5cbiAgICAgICAgICAgICAgLy8gVGhhdHMgd2h5IHdlIGNoZWNrIHRoZSBsZW5ndGguXG4gICAgICAgICAgICAgIHZhciByZXN1bHQgPSBzZlZhbGlkYXRvci52YWxpZGF0ZShcbiAgICAgICAgICAgICAgICBmb3JtLFxuICAgICAgICAgICAgICAgIHNjb3BlLm1vZGVsQXJyYXkubGVuZ3RoID4gMCA/IHNjb3BlLm1vZGVsQXJyYXkgOiB1bmRlZmluZWRcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgaWYgKHJlc3VsdC52YWxpZCA9PT0gZmFsc2UgJiZcbiAgICAgICAgICAgICAgICAgIHJlc3VsdC5lcnJvciAmJlxuICAgICAgICAgICAgICAgICAgKHJlc3VsdC5lcnJvci5kYXRhUGF0aCA9PT0gJycgfHxcbiAgICAgICAgICAgICAgICAgIHJlc3VsdC5lcnJvci5kYXRhUGF0aCA9PT0gJy8nICsgZm9ybS5rZXlbZm9ybS5rZXkubGVuZ3RoIC0gMV0pKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBTZXQgdmlld1ZhbHVlIHRvIHRyaWdnZXIgJGRpcnR5IG9uIGZpZWxkLiBJZiBzb21lb25lIGtub3dzIGFcbiAgICAgICAgICAgICAgICAvLyBhIGJldHRlciB3YXkgdG8gZG8gaXQgcGxlYXNlIHRlbGwuXG4gICAgICAgICAgICAgICAgbmdNb2RlbC4kc2V0Vmlld1ZhbHVlKHNjb3BlLm1vZGVsQXJyYXkpO1xuICAgICAgICAgICAgICAgIGVycm9yID0gcmVzdWx0LmVycm9yO1xuICAgICAgICAgICAgICAgIG5nTW9kZWwuJHNldFZhbGlkaXR5KCdzY2hlbWEnLCBmYWxzZSk7XG5cbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZ01vZGVsLiRzZXRWYWxpZGl0eSgnc2NoZW1hJywgdHJ1ZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNjb3BlLiRvbignc2NoZW1hRm9ybVZhbGlkYXRlJywgc2NvcGUudmFsaWRhdGVBcnJheSk7XG5cbiAgICAgICAgICAgIHNjb3BlLmhhc1N1Y2Nlc3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIG5nTW9kZWwuJHZhbGlkICYmICFuZ01vZGVsLiRwcmlzdGluZTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNjb3BlLmhhc0Vycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBuZ01vZGVsLiRpbnZhbGlkO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2NvcGUuc2NoZW1hRXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGVycm9yO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgIH1cblxuICAgICAgICAgIG9uY2UoKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXSk7XG5cbi8qKlxuICogQSB2ZXJzaW9uIG9mIG5nLWNoYW5nZWQgdGhhdCBvbmx5IGxpc3RlbnMgaWZcbiAqIHRoZXJlIGlzIGFjdHVhbGx5IGEgb25DaGFuZ2UgZGVmaW5lZCBvbiB0aGUgZm9ybVxuICpcbiAqIFRha2VzIHRoZSBmb3JtIGRlZmluaXRpb24gYXMgYXJndW1lbnQuXG4gKiBJZiB0aGUgZm9ybSBkZWZpbml0aW9uIGhhcyBhIFwib25DaGFuZ2VcIiBkZWZpbmVkIGFzIGVpdGhlciBhIGZ1bmN0aW9uIG9yXG4gKi9cbmFuZ3VsYXIubW9kdWxlKCdzY2hlbWFGb3JtJykuZGlyZWN0aXZlKCdzZkNoYW5nZWQnLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHtcbiAgICByZXF1aXJlOiAnbmdNb2RlbCcsXG4gICAgcmVzdHJpY3Q6ICdBQycsXG4gICAgc2NvcGU6IGZhbHNlLFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xuICAgICAgdmFyIGZvcm0gPSBzY29wZS4kZXZhbChhdHRycy5zZkNoYW5nZWQpO1xuICAgICAgLy9cImZvcm1cIiBpcyByZWFsbHkgZ3VhcmFudGVlZCB0byBiZSBoZXJlIHNpbmNlIHRoZSBkZWNvcmF0b3IgZGlyZWN0aXZlXG4gICAgICAvL3dhaXRzIGZvciBpdC4gQnV0IGJlc3QgYmUgc3VyZS5cbiAgICAgIGlmIChmb3JtICYmIGZvcm0ub25DaGFuZ2UpIHtcbiAgICAgICAgY3RybC4kdmlld0NoYW5nZUxpc3RlbmVycy5wdXNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24oZm9ybS5vbkNoYW5nZSkpIHtcbiAgICAgICAgICAgIGZvcm0ub25DaGFuZ2UoY3RybC4kbW9kZWxWYWx1ZSwgZm9ybSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNjb3BlLmV2YWxFeHByKGZvcm0ub25DaGFuZ2UsIHsnbW9kZWxWYWx1ZSc6IGN0cmwuJG1vZGVsVmFsdWUsIGZvcm06IGZvcm19KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn0pO1xuXG4vKlxuRklYTUU6IHJlYWwgZG9jdW1lbnRhdGlvblxuPGZvcm0gc2YtZm9ybT1cImZvcm1cIiAgc2Ytc2NoZW1hPVwic2NoZW1hXCIgc2YtZGVjb3JhdG9yPVwiZm9vYmFyXCI+PC9mb3JtPlxuKi9cblxuYW5ndWxhci5tb2R1bGUoJ3NjaGVtYUZvcm0nKVxuICAgICAgIC5kaXJlY3RpdmUoJ3NmU2NoZW1hJyxcblsnJGNvbXBpbGUnLCAnc2NoZW1hRm9ybScsICdzY2hlbWFGb3JtRGVjb3JhdG9ycycsICdzZlNlbGVjdCcsXG4gIGZ1bmN0aW9uKCRjb21waWxlLCAgc2NoZW1hRm9ybSwgIHNjaGVtYUZvcm1EZWNvcmF0b3JzLCBzZlNlbGVjdCkge1xuXG4gICAgdmFyIFNOQUtFX0NBU0VfUkVHRVhQID0gL1tBLVpdL2c7XG4gICAgdmFyIHNuYWtlQ2FzZSA9IGZ1bmN0aW9uKG5hbWUsIHNlcGFyYXRvcikge1xuICAgICAgc2VwYXJhdG9yID0gc2VwYXJhdG9yIHx8ICdfJztcbiAgICAgIHJldHVybiBuYW1lLnJlcGxhY2UoU05BS0VfQ0FTRV9SRUdFWFAsIGZ1bmN0aW9uKGxldHRlciwgcG9zKSB7XG4gICAgICAgIHJldHVybiAocG9zID8gc2VwYXJhdG9yIDogJycpICsgbGV0dGVyLnRvTG93ZXJDYXNlKCk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHNjb3BlOiB7XG4gICAgICAgIHNjaGVtYTogJz1zZlNjaGVtYScsXG4gICAgICAgIGluaXRpYWxGb3JtOiAnPXNmRm9ybScsXG4gICAgICAgIG1vZGVsOiAnPXNmTW9kZWwnLFxuICAgICAgICBvcHRpb25zOiAnPXNmT3B0aW9ucydcbiAgICAgIH0sXG4gICAgICBjb250cm9sbGVyOiBbJyRzY29wZScsIGZ1bmN0aW9uKCRzY29wZSkge1xuICAgICAgICB0aGlzLmV2YWxJblBhcmVudFNjb3BlID0gZnVuY3Rpb24oZXhwciwgbG9jYWxzKSB7XG4gICAgICAgICAgcmV0dXJuICRzY29wZS4kcGFyZW50LiRldmFsKGV4cHIsIGxvY2Fscyk7XG4gICAgICAgIH07XG4gICAgICB9XSxcbiAgICAgIHJlcGxhY2U6IGZhbHNlLFxuICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICByZXF1aXJlOiAnP2Zvcm0nLFxuICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBmb3JtQ3RybCwgdHJhbnNjbHVkZSkge1xuXG4gICAgICAgIC8vZXhwb3NlIGZvcm0gY29udHJvbGxlciBvbiBzY29wZSBzbyB0aGF0IHdlIGRvbid0IGZvcmNlIGF1dGhvcnMgdG8gdXNlIG5hbWUgb24gZm9ybVxuICAgICAgICBzY29wZS5mb3JtQ3RybCA9IGZvcm1DdHJsO1xuXG4gICAgICAgIC8vV2UnZCBsaWtlIHRvIGhhbmRsZSBleGlzdGluZyBtYXJrdXAsXG4gICAgICAgIC8vYmVzaWRlcyB1c2luZyBpdCBpbiBvdXIgdGVtcGxhdGUgd2UgYWxzb1xuICAgICAgICAvL2NoZWNrIGZvciBuZy1tb2RlbCBhbmQgYWRkIHRoYXQgdG8gYW4gaWdub3JlIGxpc3RcbiAgICAgICAgLy9pLmUuIGV2ZW4gaWYgZm9ybSBoYXMgYSBkZWZpbml0aW9uIGZvciBpdCBvciBmb3JtIGlzIFtcIipcIl1cbiAgICAgICAgLy93ZSBkb24ndCBnZW5lcmF0ZSBpdC5cbiAgICAgICAgdmFyIGlnbm9yZSA9IHt9O1xuICAgICAgICB0cmFuc2NsdWRlKHNjb3BlLCBmdW5jdGlvbihjbG9uZSkge1xuICAgICAgICAgIGNsb25lLmFkZENsYXNzKCdzY2hlbWEtZm9ybS1pZ25vcmUnKTtcbiAgICAgICAgICBlbGVtZW50LnByZXBlbmQoY2xvbmUpO1xuXG4gICAgICAgICAgaWYgKGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvckFsbCkge1xuICAgICAgICAgICAgdmFyIG1vZGVscyA9IGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvckFsbCgnW25nLW1vZGVsXScpO1xuICAgICAgICAgICAgaWYgKG1vZGVscykge1xuICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vZGVscy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBrZXkgPSBtb2RlbHNbaV0uZ2V0QXR0cmlidXRlKCduZy1tb2RlbCcpO1xuICAgICAgICAgICAgICAgIC8vc2tpcCBmaXJzdCBwYXJ0IGJlZm9yZSAuXG4gICAgICAgICAgICAgICAgaWdub3JlW2tleS5zdWJzdHJpbmcoa2V5LmluZGV4T2YoJy4nKSArIDEpXSA9IHRydWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAvL1NpbmNlIHdlIGFyZSBkZXBlbmRhbnQgb24gdXAgdG8gdGhyZWVcbiAgICAgICAgLy9hdHRyaWJ1dGVzIHdlJ2xsIGRvIGEgY29tbW9uIHdhdGNoXG4gICAgICAgIHZhciBsYXN0RGlnZXN0ID0ge307XG5cbiAgICAgICAgc2NvcGUuJHdhdGNoKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgdmFyIHNjaGVtYSA9IHNjb3BlLnNjaGVtYTtcbiAgICAgICAgICB2YXIgZm9ybSAgID0gc2NvcGUuaW5pdGlhbEZvcm0gfHwgWycqJ107XG5cbiAgICAgICAgICAvL1RoZSBjaGVjayBmb3Igc2NoZW1hLnR5cGUgaXMgdG8gZW5zdXJlIHRoYXQgc2NoZW1hIGlzIG5vdCB7fVxuICAgICAgICAgIGlmIChmb3JtICYmIHNjaGVtYSAmJiBzY2hlbWEudHlwZSAmJlxuICAgICAgICAgICAgICAobGFzdERpZ2VzdC5mb3JtICE9PSBmb3JtIHx8IGxhc3REaWdlc3Quc2NoZW1hICE9PSBzY2hlbWEpICYmXG4gICAgICAgICAgICAgIE9iamVjdC5rZXlzKHNjaGVtYS5wcm9wZXJ0aWVzKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBsYXN0RGlnZXN0LnNjaGVtYSA9IHNjaGVtYTtcbiAgICAgICAgICAgIGxhc3REaWdlc3QuZm9ybSA9IGZvcm07XG5cbiAgICAgICAgICAgIHZhciBtZXJnZWQgPSBzY2hlbWFGb3JtLm1lcmdlKHNjaGVtYSwgZm9ybSwgaWdub3JlLCBzY29wZS5vcHRpb25zKTtcbiAgICAgICAgICAgIHZhciBmcmFnID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuXG4gICAgICAgICAgICAvL21ha2UgdGhlIGZvcm0gYXZhaWxhYmxlIHRvIGRlY29yYXRvcnNcbiAgICAgICAgICAgIHNjb3BlLnNjaGVtYUZvcm0gID0ge2Zvcm06ICBtZXJnZWQsIHNjaGVtYTogc2NoZW1hfTtcblxuICAgICAgICAgICAgLy9jbGVhbiBhbGwgYnV0IHByZSBleGlzdGluZyBodG1sLlxuICAgICAgICAgICAgZWxlbWVudC5jaGlsZHJlbignOm5vdCguc2NoZW1hLWZvcm0taWdub3JlKScpLnJlbW92ZSgpO1xuXG4gICAgICAgICAgICAvL0NyZWF0ZSBkaXJlY3RpdmVzIGZyb20gdGhlIGZvcm0gZGVmaW5pdGlvblxuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKG1lcmdlZCxmdW5jdGlvbihvYmosaSl7XG4gICAgICAgICAgICAgIHZhciBuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChhdHRycy5zZkRlY29yYXRvciB8fCBzbmFrZUNhc2Uoc2NoZW1hRm9ybURlY29yYXRvcnMuZGVmYXVsdERlY29yYXRvciwnLScpKTtcbiAgICAgICAgICAgICAgbi5zZXRBdHRyaWJ1dGUoJ2Zvcm0nLCdzY2hlbWFGb3JtLmZvcm1bJytpKyddJyk7XG4gICAgICAgICAgICAgIHZhciBzbG90O1xuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHNsb3QgPSBlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJypbc2YtaW5zZXJ0LWZpZWxkPVwiJyArIG9iai5rZXkgKyAnXCJdJyk7XG4gICAgICAgICAgICAgIH0gY2F0Y2goZXJyKSB7XG4gICAgICAgICAgICAgICAgLy8gZmllbGQgaW5zZXJ0aW9uIG5vdCBzdXBwb3J0ZWQgZm9yIGNvbXBsZXgga2V5c1xuICAgICAgICAgICAgICAgIHNsb3QgPSBudWxsO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmKHNsb3QpIHtcbiAgICAgICAgICAgICAgICBzbG90LmlubmVySFRNTCA9IFwiXCI7XG4gICAgICAgICAgICAgICAgc2xvdC5hcHBlbmRDaGlsZChuKTsgIFxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZyYWcuYXBwZW5kQ2hpbGQobik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBlbGVtZW50WzBdLmFwcGVuZENoaWxkKGZyYWcpO1xuXG4gICAgICAgICAgICAvL2NvbXBpbGUgb25seSBjaGlsZHJlblxuICAgICAgICAgICAgJGNvbXBpbGUoZWxlbWVudC5jaGlsZHJlbigpKShzY29wZSk7XG5cbiAgICAgICAgICAgIC8vb2ssIG5vdyB0aGF0IHRoYXQgaXMgZG9uZSBsZXQncyBzZXQgYW55IGRlZmF1bHRzXG4gICAgICAgICAgICBzY2hlbWFGb3JtLnRyYXZlcnNlU2NoZW1hKHNjaGVtYSwgZnVuY3Rpb24ocHJvcCwgcGF0aCkge1xuICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQocHJvcFsnZGVmYXVsdCddKSkge1xuICAgICAgICAgICAgICAgIHZhciB2YWwgPSBzZlNlbGVjdChwYXRoLCBzY29wZS5tb2RlbCk7XG4gICAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNVbmRlZmluZWQodmFsKSkge1xuICAgICAgICAgICAgICAgICAgc2ZTZWxlY3QocGF0aCwgc2NvcGUubW9kZWwsIHByb3BbJ2RlZmF1bHQnXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gIH1cbl0pO1xuXG5hbmd1bGFyLm1vZHVsZSgnc2NoZW1hRm9ybScpLmRpcmVjdGl2ZSgnc2NoZW1hVmFsaWRhdGUnLCBbJ3NmVmFsaWRhdG9yJywgZnVuY3Rpb24oc2ZWYWxpZGF0b3IpIHtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0EnLFxuICAgIHNjb3BlOiBmYWxzZSxcbiAgICAvLyBXZSB3YW50IHRoZSBsaW5rIGZ1bmN0aW9uIHRvIGJlICphZnRlciogdGhlIGlucHV0IGRpcmVjdGl2ZXMgbGluayBmdW5jdGlvbiBzbyB3ZSBnZXQgYWNjZXNzXG4gICAgLy8gdGhlIHBhcnNlZCB2YWx1ZSwgZXguIGEgbnVtYmVyIGluc3RlYWQgb2YgYSBzdHJpbmdcbiAgICBwcmlvcml0eTogMTAwMCxcbiAgICByZXF1aXJlOiAnbmdNb2RlbCcsXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBuZ01vZGVsKSB7XG4gICAgICAvL1NpbmNlIHdlIGhhdmUgc2NvcGUgZmFsc2UgdGhpcyBpcyB0aGUgc2FtZSBzY29wZVxuICAgICAgLy9hcyB0aGUgZGVjb3JhdG9yXG4gICAgICBzY29wZS5uZ01vZGVsID0gbmdNb2RlbDtcblxuICAgICAgdmFyIGVycm9yID0gbnVsbDtcblxuICAgICAgdmFyIGdldEZvcm0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCFmb3JtKSB7XG4gICAgICAgICAgZm9ybSA9IHNjb3BlLiRldmFsKGF0dHJzLnNjaGVtYVZhbGlkYXRlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZm9ybTtcbiAgICAgIH07XG4gICAgICB2YXIgZm9ybSAgID0gZ2V0Rm9ybSgpO1xuXG4gICAgICAvLyBWYWxpZGF0ZSBhZ2FpbnN0IHRoZSBzY2hlbWEuXG5cbiAgICAgIC8vIEdldCBpbiBsYXN0IG9mIHRoZSBwYXJzZXMgc28gdGhlIHBhcnNlZCB2YWx1ZSBoYXMgdGhlIGNvcnJlY3QgdHlwZS5cbiAgICAgIGlmIChuZ01vZGVsLiR2YWxpZGF0b3JzKSB7IC8vIEFuZ3VsYXIgMS4zXG4gICAgICAgIG5nTW9kZWwuJHZhbGlkYXRvcnMuc2NoZW1hID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICB2YXIgcmVzdWx0ID0gc2ZWYWxpZGF0b3IudmFsaWRhdGUoZ2V0Rm9ybSgpLCB2YWx1ZSk7XG4gICAgICAgICAgZXJyb3IgPSByZXN1bHQuZXJyb3I7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdC52YWxpZDtcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgLy8gQW5ndWxhciAxLjJcbiAgICAgICAgbmdNb2RlbC4kcGFyc2Vycy5wdXNoKGZ1bmN0aW9uKHZpZXdWYWx1ZSkge1xuICAgICAgICAgIGZvcm0gPSBnZXRGb3JtKCk7XG4gICAgICAgICAgLy9TdGlsbCBtaWdodCBiZSB1bmRlZmluZWRcbiAgICAgICAgICBpZiAoIWZvcm0pIHtcbiAgICAgICAgICAgIHJldHVybiB2aWV3VmFsdWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIHJlc3VsdCA9ICBzZlZhbGlkYXRvci52YWxpZGF0ZShmb3JtLCB2aWV3VmFsdWUpO1xuXG4gICAgICAgICAgaWYgKHJlc3VsdC52YWxpZCkge1xuICAgICAgICAgICAgLy8gaXQgaXMgdmFsaWRcbiAgICAgICAgICAgIG5nTW9kZWwuJHNldFZhbGlkaXR5KCdzY2hlbWEnLCB0cnVlKTtcbiAgICAgICAgICAgIHJldHVybiB2aWV3VmFsdWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGl0IGlzIGludmFsaWQsIHJldHVybiB1bmRlZmluZWQgKG5vIG1vZGVsIHVwZGF0ZSlcbiAgICAgICAgICAgIG5nTW9kZWwuJHNldFZhbGlkaXR5KCdzY2hlbWEnLCBmYWxzZSk7XG4gICAgICAgICAgICBlcnJvciA9IHJlc3VsdC5lcnJvcjtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuXG4gICAgICAvLyBMaXN0ZW4gdG8gYW4gZXZlbnQgc28gd2UgY2FuIHZhbGlkYXRlIHRoZSBpbnB1dCBvbiByZXF1ZXN0XG4gICAgICBzY29wZS4kb24oJ3NjaGVtYUZvcm1WYWxpZGF0ZScsIGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIGlmIChuZ01vZGVsLiR2YWxpZGF0ZSkge1xuICAgICAgICAgIG5nTW9kZWwuJHZhbGlkYXRlKCk7XG4gICAgICAgICAgaWYgKG5nTW9kZWwuJGludmFsaWQpIHsgLy8gVGhlIGZpZWxkIG11c3QgYmUgbWFkZSBkaXJ0eSBzbyB0aGUgZXJyb3IgbWVzc2FnZSBpcyBkaXNwbGF5ZWRcbiAgICAgICAgICAgIG5nTW9kZWwuJGRpcnR5ID0gdHJ1ZTtcbiAgICAgICAgICAgIG5nTW9kZWwuJHByaXN0aW5lID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5nTW9kZWwuJHNldFZpZXdWYWx1ZShuZ01vZGVsLiR2aWV3VmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy9UaGlzIHdvcmtzIHNpbmNlIHdlIG5vdyB3ZSdyZSBpbnNpZGUgYSBkZWNvcmF0b3IgYW5kIHRoYXQgdGhpcyBpcyB0aGUgZGVjb3JhdG9ycyBzY29wZS5cbiAgICAgIC8vSWYgJHByaXN0aW5lIGFuZCBlbXB0eSBkb24ndCBzaG93IHN1Y2Nlc3MgKGV2ZW4gaWYgaXQncyB2YWxpZClcbiAgICAgIHNjb3BlLmhhc1N1Y2Nlc3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5nTW9kZWwuJHZhbGlkICYmICghbmdNb2RlbC4kcHJpc3RpbmUgfHwgIW5nTW9kZWwuJGlzRW1wdHkobmdNb2RlbC4kbW9kZWxWYWx1ZSkpO1xuICAgICAgfTtcblxuICAgICAgc2NvcGUuaGFzRXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5nTW9kZWwuJGludmFsaWQgJiYgIW5nTW9kZWwuJHByaXN0aW5lO1xuICAgICAgfTtcblxuICAgICAgc2NvcGUuc2NoZW1hRXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGVycm9yO1xuICAgICAgfTtcblxuICAgIH1cbiAgfTtcbn1dKTtcbiIsIi8qIVxuICogYW5ndWxhci10cmFuc2xhdGUgLSB2Mi40LjIgLSAyMDE0LTEwLTIxXG4gKiBodHRwOi8vZ2l0aHViLmNvbS9hbmd1bGFyLXRyYW5zbGF0ZS9hbmd1bGFyLXRyYW5zbGF0ZVxuICogQ29weXJpZ2h0IChjKSAyMDE0IDsgTGljZW5zZWQgTUlUXG4gKi9cbmFuZ3VsYXIubW9kdWxlKCdwYXNjYWxwcmVjaHQudHJhbnNsYXRlJywgWyduZyddKS5ydW4oW1xuICAnJHRyYW5zbGF0ZScsXG4gIGZ1bmN0aW9uICgkdHJhbnNsYXRlKSB7XG4gICAgdmFyIGtleSA9ICR0cmFuc2xhdGUuc3RvcmFnZUtleSgpLCBzdG9yYWdlID0gJHRyYW5zbGF0ZS5zdG9yYWdlKCk7XG4gICAgaWYgKHN0b3JhZ2UpIHtcbiAgICAgIGlmICghc3RvcmFnZS5nZXQoa2V5KSkge1xuICAgICAgICBpZiAoYW5ndWxhci5pc1N0cmluZygkdHJhbnNsYXRlLnByZWZlcnJlZExhbmd1YWdlKCkpKSB7XG4gICAgICAgICAgJHRyYW5zbGF0ZS51c2UoJHRyYW5zbGF0ZS5wcmVmZXJyZWRMYW5ndWFnZSgpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdG9yYWdlLnNldChrZXksICR0cmFuc2xhdGUudXNlKCkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkdHJhbnNsYXRlLnVzZShzdG9yYWdlLmdldChrZXkpKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGFuZ3VsYXIuaXNTdHJpbmcoJHRyYW5zbGF0ZS5wcmVmZXJyZWRMYW5ndWFnZSgpKSkge1xuICAgICAgJHRyYW5zbGF0ZS51c2UoJHRyYW5zbGF0ZS5wcmVmZXJyZWRMYW5ndWFnZSgpKTtcbiAgICB9XG4gIH1cbl0pO1xuYW5ndWxhci5tb2R1bGUoJ3Bhc2NhbHByZWNodC50cmFuc2xhdGUnKS5wcm92aWRlcignJHRyYW5zbGF0ZScsIFtcbiAgJyRTVE9SQUdFX0tFWScsXG4gIGZ1bmN0aW9uICgkU1RPUkFHRV9LRVkpIHtcbiAgICB2YXIgJHRyYW5zbGF0aW9uVGFibGUgPSB7fSwgJHByZWZlcnJlZExhbmd1YWdlLCAkYXZhaWxhYmxlTGFuZ3VhZ2VLZXlzID0gW10sICRsYW5ndWFnZUtleUFsaWFzZXMsICRmYWxsYmFja0xhbmd1YWdlLCAkZmFsbGJhY2tXYXNTdHJpbmcsICR1c2VzLCAkbmV4dExhbmcsICRzdG9yYWdlRmFjdG9yeSwgJHN0b3JhZ2VLZXkgPSAkU1RPUkFHRV9LRVksICRzdG9yYWdlUHJlZml4LCAkbWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlckZhY3RvcnksICRpbnRlcnBvbGF0aW9uRmFjdG9yeSwgJGludGVycG9sYXRvckZhY3RvcmllcyA9IFtdLCAkaW50ZXJwb2xhdGlvblNhbml0aXphdGlvblN0cmF0ZWd5ID0gZmFsc2UsICRsb2FkZXJGYWN0b3J5LCAkY2xvYWtDbGFzc05hbWUgPSAndHJhbnNsYXRlLWNsb2FrJywgJGxvYWRlck9wdGlvbnMsICRub3RGb3VuZEluZGljYXRvckxlZnQsICRub3RGb3VuZEluZGljYXRvclJpZ2h0LCAkcG9zdENvbXBpbGluZ0VuYWJsZWQgPSBmYWxzZSwgTkVTVEVEX09CSkVDVF9ERUxJTUlURVIgPSAnLicsIGxvYWRlckNhY2hlO1xuICAgIHZhciB2ZXJzaW9uID0gJzIuNC4yJztcbiAgICB2YXIgZ2V0TG9jYWxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIG5hdiA9IHdpbmRvdy5uYXZpZ2F0b3I7XG4gICAgICByZXR1cm4gKChhbmd1bGFyLmlzQXJyYXkobmF2Lmxhbmd1YWdlcykgPyBuYXYubGFuZ3VhZ2VzWzBdIDogbmF2Lmxhbmd1YWdlIHx8IG5hdi5icm93c2VyTGFuZ3VhZ2UgfHwgbmF2LnN5c3RlbUxhbmd1YWdlIHx8IG5hdi51c2VyTGFuZ3VhZ2UpIHx8ICcnKS5zcGxpdCgnLScpLmpvaW4oJ18nKTtcbiAgICB9O1xuICAgIHZhciBpbmRleE9mID0gZnVuY3Rpb24gKGFycmF5LCBzZWFyY2hFbGVtZW50KSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gYXJyYXkubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgaWYgKGFycmF5W2ldID09PSBzZWFyY2hFbGVtZW50KSB7XG4gICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiAtMTtcbiAgICB9O1xuICAgIHZhciB0cmltID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xuICAgIH07XG4gICAgdmFyIG5lZ290aWF0ZUxvY2FsZSA9IGZ1bmN0aW9uIChwcmVmZXJyZWQpIHtcbiAgICAgIHZhciBhdmFpbCA9IFtdLCBsb2NhbGUgPSBhbmd1bGFyLmxvd2VyY2FzZShwcmVmZXJyZWQpLCBpID0gMCwgbiA9ICRhdmFpbGFibGVMYW5ndWFnZUtleXMubGVuZ3RoO1xuICAgICAgZm9yICg7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgYXZhaWwucHVzaChhbmd1bGFyLmxvd2VyY2FzZSgkYXZhaWxhYmxlTGFuZ3VhZ2VLZXlzW2ldKSk7XG4gICAgICB9XG4gICAgICBpZiAoaW5kZXhPZihhdmFpbCwgbG9jYWxlKSA+IC0xKSB7XG4gICAgICAgIHJldHVybiBwcmVmZXJyZWQ7XG4gICAgICB9XG4gICAgICBpZiAoJGxhbmd1YWdlS2V5QWxpYXNlcykge1xuICAgICAgICB2YXIgYWxpYXM7XG4gICAgICAgIGZvciAodmFyIGxhbmdLZXlBbGlhcyBpbiAkbGFuZ3VhZ2VLZXlBbGlhc2VzKSB7XG4gICAgICAgICAgdmFyIGhhc1dpbGRjYXJkS2V5ID0gZmFsc2U7XG4gICAgICAgICAgdmFyIGhhc0V4YWN0S2V5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKCRsYW5ndWFnZUtleUFsaWFzZXMsIGxhbmdLZXlBbGlhcykgJiYgYW5ndWxhci5sb3dlcmNhc2UobGFuZ0tleUFsaWFzKSA9PT0gYW5ndWxhci5sb3dlcmNhc2UocHJlZmVycmVkKTtcbiAgICAgICAgICBpZiAobGFuZ0tleUFsaWFzLnNsaWNlKC0xKSA9PT0gJyonKSB7XG4gICAgICAgICAgICBoYXNXaWxkY2FyZEtleSA9IGxhbmdLZXlBbGlhcy5zbGljZSgwLCAtMSkgPT09IHByZWZlcnJlZC5zbGljZSgwLCBsYW5nS2V5QWxpYXMubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChoYXNFeGFjdEtleSB8fCBoYXNXaWxkY2FyZEtleSkge1xuICAgICAgICAgICAgYWxpYXMgPSAkbGFuZ3VhZ2VLZXlBbGlhc2VzW2xhbmdLZXlBbGlhc107XG4gICAgICAgICAgICBpZiAoaW5kZXhPZihhdmFpbCwgYW5ndWxhci5sb3dlcmNhc2UoYWxpYXMpKSA+IC0xKSB7XG4gICAgICAgICAgICAgIHJldHVybiBhbGlhcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciBwYXJ0cyA9IHByZWZlcnJlZC5zcGxpdCgnXycpO1xuICAgICAgaWYgKHBhcnRzLmxlbmd0aCA+IDEgJiYgaW5kZXhPZihhdmFpbCwgYW5ndWxhci5sb3dlcmNhc2UocGFydHNbMF0pKSA+IC0xKSB7XG4gICAgICAgIHJldHVybiBwYXJ0c1swXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwcmVmZXJyZWQ7XG4gICAgfTtcbiAgICB2YXIgdHJhbnNsYXRpb25zID0gZnVuY3Rpb24gKGxhbmdLZXksIHRyYW5zbGF0aW9uVGFibGUpIHtcbiAgICAgIGlmICghbGFuZ0tleSAmJiAhdHJhbnNsYXRpb25UYWJsZSkge1xuICAgICAgICByZXR1cm4gJHRyYW5zbGF0aW9uVGFibGU7XG4gICAgICB9XG4gICAgICBpZiAobGFuZ0tleSAmJiAhdHJhbnNsYXRpb25UYWJsZSkge1xuICAgICAgICBpZiAoYW5ndWxhci5pc1N0cmluZyhsYW5nS2V5KSkge1xuICAgICAgICAgIHJldHVybiAkdHJhbnNsYXRpb25UYWJsZVtsYW5nS2V5XTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCFhbmd1bGFyLmlzT2JqZWN0KCR0cmFuc2xhdGlvblRhYmxlW2xhbmdLZXldKSkge1xuICAgICAgICAgICR0cmFuc2xhdGlvblRhYmxlW2xhbmdLZXldID0ge307XG4gICAgICAgIH1cbiAgICAgICAgYW5ndWxhci5leHRlbmQoJHRyYW5zbGF0aW9uVGFibGVbbGFuZ0tleV0sIGZsYXRPYmplY3QodHJhbnNsYXRpb25UYWJsZSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICB0aGlzLnRyYW5zbGF0aW9ucyA9IHRyYW5zbGF0aW9ucztcbiAgICB0aGlzLmNsb2FrQ2xhc3NOYW1lID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgIGlmICghbmFtZSkge1xuICAgICAgICByZXR1cm4gJGNsb2FrQ2xhc3NOYW1lO1xuICAgICAgfVxuICAgICAgJGNsb2FrQ2xhc3NOYW1lID0gbmFtZTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgdmFyIGZsYXRPYmplY3QgPSBmdW5jdGlvbiAoZGF0YSwgcGF0aCwgcmVzdWx0LCBwcmV2S2V5KSB7XG4gICAgICB2YXIga2V5LCBrZXlXaXRoUGF0aCwga2V5V2l0aFNob3J0UGF0aCwgdmFsO1xuICAgICAgaWYgKCFwYXRoKSB7XG4gICAgICAgIHBhdGggPSBbXTtcbiAgICAgIH1cbiAgICAgIGlmICghcmVzdWx0KSB7XG4gICAgICAgIHJlc3VsdCA9IHt9O1xuICAgICAgfVxuICAgICAgZm9yIChrZXkgaW4gZGF0YSkge1xuICAgICAgICBpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChkYXRhLCBrZXkpKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgdmFsID0gZGF0YVtrZXldO1xuICAgICAgICBpZiAoYW5ndWxhci5pc09iamVjdCh2YWwpKSB7XG4gICAgICAgICAgZmxhdE9iamVjdCh2YWwsIHBhdGguY29uY2F0KGtleSksIHJlc3VsdCwga2V5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBrZXlXaXRoUGF0aCA9IHBhdGgubGVuZ3RoID8gJycgKyBwYXRoLmpvaW4oTkVTVEVEX09CSkVDVF9ERUxJTUlURVIpICsgTkVTVEVEX09CSkVDVF9ERUxJTUlURVIgKyBrZXkgOiBrZXk7XG4gICAgICAgICAgaWYgKHBhdGgubGVuZ3RoICYmIGtleSA9PT0gcHJldktleSkge1xuICAgICAgICAgICAga2V5V2l0aFNob3J0UGF0aCA9ICcnICsgcGF0aC5qb2luKE5FU1RFRF9PQkpFQ1RfREVMSU1JVEVSKTtcbiAgICAgICAgICAgIHJlc3VsdFtrZXlXaXRoU2hvcnRQYXRoXSA9ICdAOicgKyBrZXlXaXRoUGF0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVzdWx0W2tleVdpdGhQYXRoXSA9IHZhbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICAgIHRoaXMuYWRkSW50ZXJwb2xhdGlvbiA9IGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgICAkaW50ZXJwb2xhdG9yRmFjdG9yaWVzLnB1c2goZmFjdG9yeSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIHRoaXMudXNlTWVzc2FnZUZvcm1hdEludGVycG9sYXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy51c2VJbnRlcnBvbGF0aW9uKCckdHJhbnNsYXRlTWVzc2FnZUZvcm1hdEludGVycG9sYXRpb24nKTtcbiAgICB9O1xuICAgIHRoaXMudXNlSW50ZXJwb2xhdGlvbiA9IGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgICAkaW50ZXJwb2xhdGlvbkZhY3RvcnkgPSBmYWN0b3J5O1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICB0aGlzLnVzZVNhbml0aXplVmFsdWVTdHJhdGVneSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgJGludGVycG9sYXRpb25TYW5pdGl6YXRpb25TdHJhdGVneSA9IHZhbHVlO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICB0aGlzLnByZWZlcnJlZExhbmd1YWdlID0gZnVuY3Rpb24gKGxhbmdLZXkpIHtcbiAgICAgIHNldHVwUHJlZmVycmVkTGFuZ3VhZ2UobGFuZ0tleSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIHZhciBzZXR1cFByZWZlcnJlZExhbmd1YWdlID0gZnVuY3Rpb24gKGxhbmdLZXkpIHtcbiAgICAgIGlmIChsYW5nS2V5KSB7XG4gICAgICAgICRwcmVmZXJyZWRMYW5ndWFnZSA9IGxhbmdLZXk7XG4gICAgICB9XG4gICAgICByZXR1cm4gJHByZWZlcnJlZExhbmd1YWdlO1xuICAgIH07XG4gICAgdGhpcy50cmFuc2xhdGlvbk5vdEZvdW5kSW5kaWNhdG9yID0gZnVuY3Rpb24gKGluZGljYXRvcikge1xuICAgICAgdGhpcy50cmFuc2xhdGlvbk5vdEZvdW5kSW5kaWNhdG9yTGVmdChpbmRpY2F0b3IpO1xuICAgICAgdGhpcy50cmFuc2xhdGlvbk5vdEZvdW5kSW5kaWNhdG9yUmlnaHQoaW5kaWNhdG9yKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgdGhpcy50cmFuc2xhdGlvbk5vdEZvdW5kSW5kaWNhdG9yTGVmdCA9IGZ1bmN0aW9uIChpbmRpY2F0b3IpIHtcbiAgICAgIGlmICghaW5kaWNhdG9yKSB7XG4gICAgICAgIHJldHVybiAkbm90Rm91bmRJbmRpY2F0b3JMZWZ0O1xuICAgICAgfVxuICAgICAgJG5vdEZvdW5kSW5kaWNhdG9yTGVmdCA9IGluZGljYXRvcjtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgdGhpcy50cmFuc2xhdGlvbk5vdEZvdW5kSW5kaWNhdG9yUmlnaHQgPSBmdW5jdGlvbiAoaW5kaWNhdG9yKSB7XG4gICAgICBpZiAoIWluZGljYXRvcikge1xuICAgICAgICByZXR1cm4gJG5vdEZvdW5kSW5kaWNhdG9yUmlnaHQ7XG4gICAgICB9XG4gICAgICAkbm90Rm91bmRJbmRpY2F0b3JSaWdodCA9IGluZGljYXRvcjtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgdGhpcy5mYWxsYmFja0xhbmd1YWdlID0gZnVuY3Rpb24gKGxhbmdLZXkpIHtcbiAgICAgIGZhbGxiYWNrU3RhY2sobGFuZ0tleSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIHZhciBmYWxsYmFja1N0YWNrID0gZnVuY3Rpb24gKGxhbmdLZXkpIHtcbiAgICAgIGlmIChsYW5nS2V5KSB7XG4gICAgICAgIGlmIChhbmd1bGFyLmlzU3RyaW5nKGxhbmdLZXkpKSB7XG4gICAgICAgICAgJGZhbGxiYWNrV2FzU3RyaW5nID0gdHJ1ZTtcbiAgICAgICAgICAkZmFsbGJhY2tMYW5ndWFnZSA9IFtsYW5nS2V5XTtcbiAgICAgICAgfSBlbHNlIGlmIChhbmd1bGFyLmlzQXJyYXkobGFuZ0tleSkpIHtcbiAgICAgICAgICAkZmFsbGJhY2tXYXNTdHJpbmcgPSBmYWxzZTtcbiAgICAgICAgICAkZmFsbGJhY2tMYW5ndWFnZSA9IGxhbmdLZXk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNTdHJpbmcoJHByZWZlcnJlZExhbmd1YWdlKSAmJiBpbmRleE9mKCRmYWxsYmFja0xhbmd1YWdlLCAkcHJlZmVycmVkTGFuZ3VhZ2UpIDwgMCkge1xuICAgICAgICAgICRmYWxsYmFja0xhbmd1YWdlLnB1c2goJHByZWZlcnJlZExhbmd1YWdlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICgkZmFsbGJhY2tXYXNTdHJpbmcpIHtcbiAgICAgICAgICByZXR1cm4gJGZhbGxiYWNrTGFuZ3VhZ2VbMF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuICRmYWxsYmFja0xhbmd1YWdlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgICB0aGlzLnVzZSA9IGZ1bmN0aW9uIChsYW5nS2V5KSB7XG4gICAgICBpZiAobGFuZ0tleSkge1xuICAgICAgICBpZiAoISR0cmFuc2xhdGlvblRhYmxlW2xhbmdLZXldICYmICEkbG9hZGVyRmFjdG9yeSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignJHRyYW5zbGF0ZVByb3ZpZGVyIGNvdWxkblxcJ3QgZmluZCB0cmFuc2xhdGlvblRhYmxlIGZvciBsYW5nS2V5OiBcXCcnICsgbGFuZ0tleSArICdcXCcnKTtcbiAgICAgICAgfVxuICAgICAgICAkdXNlcyA9IGxhbmdLZXk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgcmV0dXJuICR1c2VzO1xuICAgIH07XG4gICAgdmFyIHN0b3JhZ2VLZXkgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICBpZiAoIWtleSkge1xuICAgICAgICBpZiAoJHN0b3JhZ2VQcmVmaXgpIHtcbiAgICAgICAgICByZXR1cm4gJHN0b3JhZ2VQcmVmaXggKyAkc3RvcmFnZUtleTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJHN0b3JhZ2VLZXk7XG4gICAgICB9XG4gICAgICAkc3RvcmFnZUtleSA9IGtleTtcbiAgICB9O1xuICAgIHRoaXMuc3RvcmFnZUtleSA9IHN0b3JhZ2VLZXk7XG4gICAgdGhpcy51c2VVcmxMb2FkZXIgPSBmdW5jdGlvbiAodXJsLCBvcHRpb25zKSB7XG4gICAgICByZXR1cm4gdGhpcy51c2VMb2FkZXIoJyR0cmFuc2xhdGVVcmxMb2FkZXInLCBhbmd1bGFyLmV4dGVuZCh7IHVybDogdXJsIH0sIG9wdGlvbnMpKTtcbiAgICB9O1xuICAgIHRoaXMudXNlU3RhdGljRmlsZXNMb2FkZXIgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgcmV0dXJuIHRoaXMudXNlTG9hZGVyKCckdHJhbnNsYXRlU3RhdGljRmlsZXNMb2FkZXInLCBvcHRpb25zKTtcbiAgICB9O1xuICAgIHRoaXMudXNlTG9hZGVyID0gZnVuY3Rpb24gKGxvYWRlckZhY3RvcnksIG9wdGlvbnMpIHtcbiAgICAgICRsb2FkZXJGYWN0b3J5ID0gbG9hZGVyRmFjdG9yeTtcbiAgICAgICRsb2FkZXJPcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgdGhpcy51c2VMb2NhbFN0b3JhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy51c2VTdG9yYWdlKCckdHJhbnNsYXRlTG9jYWxTdG9yYWdlJyk7XG4gICAgfTtcbiAgICB0aGlzLnVzZUNvb2tpZVN0b3JhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy51c2VTdG9yYWdlKCckdHJhbnNsYXRlQ29va2llU3RvcmFnZScpO1xuICAgIH07XG4gICAgdGhpcy51c2VTdG9yYWdlID0gZnVuY3Rpb24gKHN0b3JhZ2VGYWN0b3J5KSB7XG4gICAgICAkc3RvcmFnZUZhY3RvcnkgPSBzdG9yYWdlRmFjdG9yeTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgdGhpcy5zdG9yYWdlUHJlZml4ID0gZnVuY3Rpb24gKHByZWZpeCkge1xuICAgICAgaWYgKCFwcmVmaXgpIHtcbiAgICAgICAgcmV0dXJuIHByZWZpeDtcbiAgICAgIH1cbiAgICAgICRzdG9yYWdlUHJlZml4ID0gcHJlZml4O1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICB0aGlzLnVzZU1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXJMb2cgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy51c2VNaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyKCckdHJhbnNsYXRlTWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlckxvZycpO1xuICAgIH07XG4gICAgdGhpcy51c2VNaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyID0gZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICAgICRtaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyRmFjdG9yeSA9IGZhY3Rvcnk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIHRoaXMudXNlUG9zdENvbXBpbGluZyA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgJHBvc3RDb21waWxpbmdFbmFibGVkID0gISF2YWx1ZTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgdGhpcy5kZXRlcm1pbmVQcmVmZXJyZWRMYW5ndWFnZSA9IGZ1bmN0aW9uIChmbikge1xuICAgICAgdmFyIGxvY2FsZSA9IGZuICYmIGFuZ3VsYXIuaXNGdW5jdGlvbihmbikgPyBmbigpIDogZ2V0TG9jYWxlKCk7XG4gICAgICBpZiAoISRhdmFpbGFibGVMYW5ndWFnZUtleXMubGVuZ3RoKSB7XG4gICAgICAgICRwcmVmZXJyZWRMYW5ndWFnZSA9IGxvY2FsZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICRwcmVmZXJyZWRMYW5ndWFnZSA9IG5lZ290aWF0ZUxvY2FsZShsb2NhbGUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICB0aGlzLnJlZ2lzdGVyQXZhaWxhYmxlTGFuZ3VhZ2VLZXlzID0gZnVuY3Rpb24gKGxhbmd1YWdlS2V5cywgYWxpYXNlcykge1xuICAgICAgaWYgKGxhbmd1YWdlS2V5cykge1xuICAgICAgICAkYXZhaWxhYmxlTGFuZ3VhZ2VLZXlzID0gbGFuZ3VhZ2VLZXlzO1xuICAgICAgICBpZiAoYWxpYXNlcykge1xuICAgICAgICAgICRsYW5ndWFnZUtleUFsaWFzZXMgPSBhbGlhc2VzO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgcmV0dXJuICRhdmFpbGFibGVMYW5ndWFnZUtleXM7XG4gICAgfTtcbiAgICB0aGlzLnVzZUxvYWRlckNhY2hlID0gZnVuY3Rpb24gKGNhY2hlKSB7XG4gICAgICBpZiAoY2FjaGUgPT09IGZhbHNlKSB7XG4gICAgICAgIGxvYWRlckNhY2hlID0gdW5kZWZpbmVkO1xuICAgICAgfSBlbHNlIGlmIChjYWNoZSA9PT0gdHJ1ZSkge1xuICAgICAgICBsb2FkZXJDYWNoZSA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBjYWNoZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgbG9hZGVyQ2FjaGUgPSAnJHRyYW5zbGF0aW9uQ2FjaGUnO1xuICAgICAgfSBlbHNlIGlmIChjYWNoZSkge1xuICAgICAgICBsb2FkZXJDYWNoZSA9IGNhY2hlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICB0aGlzLiRnZXQgPSBbXG4gICAgICAnJGxvZycsXG4gICAgICAnJGluamVjdG9yJyxcbiAgICAgICckcm9vdFNjb3BlJyxcbiAgICAgICckcScsXG4gICAgICBmdW5jdGlvbiAoJGxvZywgJGluamVjdG9yLCAkcm9vdFNjb3BlLCAkcSkge1xuICAgICAgICB2YXIgU3RvcmFnZSwgZGVmYXVsdEludGVycG9sYXRvciA9ICRpbmplY3Rvci5nZXQoJGludGVycG9sYXRpb25GYWN0b3J5IHx8ICckdHJhbnNsYXRlRGVmYXVsdEludGVycG9sYXRpb24nKSwgcGVuZGluZ0xvYWRlciA9IGZhbHNlLCBpbnRlcnBvbGF0b3JIYXNoTWFwID0ge30sIGxhbmdQcm9taXNlcyA9IHt9LCBmYWxsYmFja0luZGV4LCBzdGFydEZhbGxiYWNrSXRlcmF0aW9uO1xuICAgICAgICB2YXIgJHRyYW5zbGF0ZSA9IGZ1bmN0aW9uICh0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgaW50ZXJwb2xhdGlvbklkKSB7XG4gICAgICAgICAgaWYgKGFuZ3VsYXIuaXNBcnJheSh0cmFuc2xhdGlvbklkKSkge1xuICAgICAgICAgICAgdmFyIHRyYW5zbGF0ZUFsbCA9IGZ1bmN0aW9uICh0cmFuc2xhdGlvbklkcykge1xuICAgICAgICAgICAgICB2YXIgcmVzdWx0cyA9IHt9O1xuICAgICAgICAgICAgICB2YXIgcHJvbWlzZXMgPSBbXTtcbiAgICAgICAgICAgICAgdmFyIHRyYW5zbGF0ZSA9IGZ1bmN0aW9uICh0cmFuc2xhdGlvbklkKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgICAgICB2YXIgcmVnYXJkbGVzcyA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgcmVzdWx0c1t0cmFuc2xhdGlvbklkXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShbXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zbGF0aW9uSWQsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlXG4gICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICR0cmFuc2xhdGUodHJhbnNsYXRpb25JZCwgaW50ZXJwb2xhdGVQYXJhbXMsIGludGVycG9sYXRpb25JZCkudGhlbihyZWdhcmRsZXNzLCByZWdhcmRsZXNzKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGMgPSB0cmFuc2xhdGlvbklkcy5sZW5ndGg7IGkgPCBjOyBpKyspIHtcbiAgICAgICAgICAgICAgICBwcm9taXNlcy5wdXNoKHRyYW5zbGF0ZSh0cmFuc2xhdGlvbklkc1tpXSkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiAkcS5hbGwocHJvbWlzZXMpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gdHJhbnNsYXRlQWxsKHRyYW5zbGF0aW9uSWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgIGlmICh0cmFuc2xhdGlvbklkKSB7XG4gICAgICAgICAgICB0cmFuc2xhdGlvbklkID0gdHJpbS5hcHBseSh0cmFuc2xhdGlvbklkKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFyIHByb21pc2VUb1dhaXRGb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIHZhciBwcm9taXNlID0gJHByZWZlcnJlZExhbmd1YWdlID8gbGFuZ1Byb21pc2VzWyRwcmVmZXJyZWRMYW5ndWFnZV0gOiBsYW5nUHJvbWlzZXNbJHVzZXNdO1xuICAgICAgICAgICAgICBmYWxsYmFja0luZGV4ID0gMDtcbiAgICAgICAgICAgICAgaWYgKCRzdG9yYWdlRmFjdG9yeSAmJiAhcHJvbWlzZSkge1xuICAgICAgICAgICAgICAgIHZhciBsYW5nS2V5ID0gU3RvcmFnZS5nZXQoJHN0b3JhZ2VLZXkpO1xuICAgICAgICAgICAgICAgIHByb21pc2UgPSBsYW5nUHJvbWlzZXNbbGFuZ0tleV07XG4gICAgICAgICAgICAgICAgaWYgKCRmYWxsYmFja0xhbmd1YWdlICYmICRmYWxsYmFja0xhbmd1YWdlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gaW5kZXhPZigkZmFsbGJhY2tMYW5ndWFnZSwgbGFuZ0tleSk7XG4gICAgICAgICAgICAgICAgICBmYWxsYmFja0luZGV4ID0gaW5kZXggPT09IDAgPyAxIDogMDtcbiAgICAgICAgICAgICAgICAgIGlmIChpbmRleE9mKCRmYWxsYmFja0xhbmd1YWdlLCAkcHJlZmVycmVkTGFuZ3VhZ2UpIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAkZmFsbGJhY2tMYW5ndWFnZS5wdXNoKCRwcmVmZXJyZWRMYW5ndWFnZSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgICAgICAgfSgpO1xuICAgICAgICAgIGlmICghcHJvbWlzZVRvV2FpdEZvcikge1xuICAgICAgICAgICAgZGV0ZXJtaW5lVHJhbnNsYXRpb24odHJhbnNsYXRpb25JZCwgaW50ZXJwb2xhdGVQYXJhbXMsIGludGVycG9sYXRpb25JZCkudGhlbihkZWZlcnJlZC5yZXNvbHZlLCBkZWZlcnJlZC5yZWplY3QpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwcm9taXNlVG9XYWl0Rm9yLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICBkZXRlcm1pbmVUcmFuc2xhdGlvbih0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgaW50ZXJwb2xhdGlvbklkKS50aGVuKGRlZmVycmVkLnJlc29sdmUsIGRlZmVycmVkLnJlamVjdCk7XG4gICAgICAgICAgICB9LCBkZWZlcnJlZC5yZWplY3QpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIGFwcGx5Tm90Rm91bmRJbmRpY2F0b3JzID0gZnVuY3Rpb24gKHRyYW5zbGF0aW9uSWQpIHtcbiAgICAgICAgICBpZiAoJG5vdEZvdW5kSW5kaWNhdG9yTGVmdCkge1xuICAgICAgICAgICAgdHJhbnNsYXRpb25JZCA9IFtcbiAgICAgICAgICAgICAgJG5vdEZvdW5kSW5kaWNhdG9yTGVmdCxcbiAgICAgICAgICAgICAgdHJhbnNsYXRpb25JZFxuICAgICAgICAgICAgXS5qb2luKCcgJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICgkbm90Rm91bmRJbmRpY2F0b3JSaWdodCkge1xuICAgICAgICAgICAgdHJhbnNsYXRpb25JZCA9IFtcbiAgICAgICAgICAgICAgdHJhbnNsYXRpb25JZCxcbiAgICAgICAgICAgICAgJG5vdEZvdW5kSW5kaWNhdG9yUmlnaHRcbiAgICAgICAgICAgIF0uam9pbignICcpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdHJhbnNsYXRpb25JZDtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHVzZUxhbmd1YWdlID0gZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICR1c2VzID0ga2V5O1xuICAgICAgICAgICRyb290U2NvcGUuJGVtaXQoJyR0cmFuc2xhdGVDaGFuZ2VTdWNjZXNzJywgeyBsYW5ndWFnZToga2V5IH0pO1xuICAgICAgICAgIGlmICgkc3RvcmFnZUZhY3RvcnkpIHtcbiAgICAgICAgICAgIFN0b3JhZ2Uuc2V0KCR0cmFuc2xhdGUuc3RvcmFnZUtleSgpLCAkdXNlcyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGRlZmF1bHRJbnRlcnBvbGF0b3Iuc2V0TG9jYWxlKCR1c2VzKTtcbiAgICAgICAgICBhbmd1bGFyLmZvckVhY2goaW50ZXJwb2xhdG9ySGFzaE1hcCwgZnVuY3Rpb24gKGludGVycG9sYXRvciwgaWQpIHtcbiAgICAgICAgICAgIGludGVycG9sYXRvckhhc2hNYXBbaWRdLnNldExvY2FsZSgkdXNlcyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgJHJvb3RTY29wZS4kZW1pdCgnJHRyYW5zbGF0ZUNoYW5nZUVuZCcsIHsgbGFuZ3VhZ2U6IGtleSB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIGxvYWRBc3luYyA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICBpZiAoIWtleSkge1xuICAgICAgICAgICAgdGhyb3cgJ05vIGxhbmd1YWdlIGtleSBzcGVjaWZpZWQgZm9yIGxvYWRpbmcuJztcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAkcm9vdFNjb3BlLiRlbWl0KCckdHJhbnNsYXRlTG9hZGluZ1N0YXJ0JywgeyBsYW5ndWFnZToga2V5IH0pO1xuICAgICAgICAgIHBlbmRpbmdMb2FkZXIgPSB0cnVlO1xuICAgICAgICAgIHZhciBjYWNoZSA9IGxvYWRlckNhY2hlO1xuICAgICAgICAgIGlmICh0eXBlb2YgY2FjaGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBjYWNoZSA9ICRpbmplY3Rvci5nZXQoY2FjaGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgbG9hZGVyT3B0aW9ucyA9IGFuZ3VsYXIuZXh0ZW5kKHt9LCAkbG9hZGVyT3B0aW9ucywge1xuICAgICAgICAgICAgICBrZXk6IGtleSxcbiAgICAgICAgICAgICAgJGh0dHA6IGFuZ3VsYXIuZXh0ZW5kKHt9LCB7IGNhY2hlOiBjYWNoZSB9LCAkbG9hZGVyT3B0aW9ucy4kaHR0cClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICRpbmplY3Rvci5nZXQoJGxvYWRlckZhY3RvcnkpKGxvYWRlck9wdGlvbnMpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHZhciB0cmFuc2xhdGlvblRhYmxlID0ge307XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRlbWl0KCckdHJhbnNsYXRlTG9hZGluZ1N1Y2Nlc3MnLCB7IGxhbmd1YWdlOiBrZXkgfSk7XG4gICAgICAgICAgICBpZiAoYW5ndWxhci5pc0FycmF5KGRhdGEpKSB7XG4gICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChkYXRhLCBmdW5jdGlvbiAodGFibGUpIHtcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmV4dGVuZCh0cmFuc2xhdGlvblRhYmxlLCBmbGF0T2JqZWN0KHRhYmxlKSk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgYW5ndWxhci5leHRlbmQodHJhbnNsYXRpb25UYWJsZSwgZmxhdE9iamVjdChkYXRhKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwZW5kaW5nTG9hZGVyID0gZmFsc2U7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHtcbiAgICAgICAgICAgICAga2V5OiBrZXksXG4gICAgICAgICAgICAgIHRhYmxlOiB0cmFuc2xhdGlvblRhYmxlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICRyb290U2NvcGUuJGVtaXQoJyR0cmFuc2xhdGVMb2FkaW5nRW5kJywgeyBsYW5ndWFnZToga2V5IH0pO1xuICAgICAgICAgIH0sIGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgICRyb290U2NvcGUuJGVtaXQoJyR0cmFuc2xhdGVMb2FkaW5nRXJyb3InLCB7IGxhbmd1YWdlOiBrZXkgfSk7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZWplY3Qoa2V5KTtcbiAgICAgICAgICAgICRyb290U2NvcGUuJGVtaXQoJyR0cmFuc2xhdGVMb2FkaW5nRW5kJywgeyBsYW5ndWFnZToga2V5IH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuICAgICAgICBpZiAoJHN0b3JhZ2VGYWN0b3J5KSB7XG4gICAgICAgICAgU3RvcmFnZSA9ICRpbmplY3Rvci5nZXQoJHN0b3JhZ2VGYWN0b3J5KTtcbiAgICAgICAgICBpZiAoIVN0b3JhZ2UuZ2V0IHx8ICFTdG9yYWdlLnNldCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZG5cXCd0IHVzZSBzdG9yYWdlIFxcJycgKyAkc3RvcmFnZUZhY3RvcnkgKyAnXFwnLCBtaXNzaW5nIGdldCgpIG9yIHNldCgpIG1ldGhvZCEnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNGdW5jdGlvbihkZWZhdWx0SW50ZXJwb2xhdG9yLnVzZVNhbml0aXplVmFsdWVTdHJhdGVneSkpIHtcbiAgICAgICAgICBkZWZhdWx0SW50ZXJwb2xhdG9yLnVzZVNhbml0aXplVmFsdWVTdHJhdGVneSgkaW50ZXJwb2xhdGlvblNhbml0aXphdGlvblN0cmF0ZWd5KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoJGludGVycG9sYXRvckZhY3Rvcmllcy5sZW5ndGgpIHtcbiAgICAgICAgICBhbmd1bGFyLmZvckVhY2goJGludGVycG9sYXRvckZhY3RvcmllcywgZnVuY3Rpb24gKGludGVycG9sYXRvckZhY3RvcnkpIHtcbiAgICAgICAgICAgIHZhciBpbnRlcnBvbGF0b3IgPSAkaW5qZWN0b3IuZ2V0KGludGVycG9sYXRvckZhY3RvcnkpO1xuICAgICAgICAgICAgaW50ZXJwb2xhdG9yLnNldExvY2FsZSgkcHJlZmVycmVkTGFuZ3VhZ2UgfHwgJHVzZXMpO1xuICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNGdW5jdGlvbihpbnRlcnBvbGF0b3IudXNlU2FuaXRpemVWYWx1ZVN0cmF0ZWd5KSkge1xuICAgICAgICAgICAgICBpbnRlcnBvbGF0b3IudXNlU2FuaXRpemVWYWx1ZVN0cmF0ZWd5KCRpbnRlcnBvbGF0aW9uU2FuaXRpemF0aW9uU3RyYXRlZ3kpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW50ZXJwb2xhdG9ySGFzaE1hcFtpbnRlcnBvbGF0b3IuZ2V0SW50ZXJwb2xhdGlvbklkZW50aWZpZXIoKV0gPSBpbnRlcnBvbGF0b3I7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGdldFRyYW5zbGF0aW9uVGFibGUgPSBmdW5jdGlvbiAobGFuZ0tleSkge1xuICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCgkdHJhbnNsYXRpb25UYWJsZSwgbGFuZ0tleSkpIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoJHRyYW5zbGF0aW9uVGFibGVbbGFuZ0tleV0pO1xuICAgICAgICAgIH0gZWxzZSBpZiAobGFuZ1Byb21pc2VzW2xhbmdLZXldKSB7XG4gICAgICAgICAgICBsYW5nUHJvbWlzZXNbbGFuZ0tleV0udGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICB0cmFuc2xhdGlvbnMoZGF0YS5rZXksIGRhdGEudGFibGUpO1xuICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEudGFibGUpO1xuICAgICAgICAgICAgfSwgZGVmZXJyZWQucmVqZWN0KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgZ2V0RmFsbGJhY2tUcmFuc2xhdGlvbiA9IGZ1bmN0aW9uIChsYW5nS2V5LCB0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgSW50ZXJwb2xhdG9yKSB7XG4gICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICBnZXRUcmFuc2xhdGlvblRhYmxlKGxhbmdLZXkpLnRoZW4oZnVuY3Rpb24gKHRyYW5zbGF0aW9uVGFibGUpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodHJhbnNsYXRpb25UYWJsZSwgdHJhbnNsYXRpb25JZCkpIHtcbiAgICAgICAgICAgICAgSW50ZXJwb2xhdG9yLnNldExvY2FsZShsYW5nS2V5KTtcbiAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShJbnRlcnBvbGF0b3IuaW50ZXJwb2xhdGUodHJhbnNsYXRpb25UYWJsZVt0cmFuc2xhdGlvbklkXSwgaW50ZXJwb2xhdGVQYXJhbXMpKTtcbiAgICAgICAgICAgICAgSW50ZXJwb2xhdG9yLnNldExvY2FsZSgkdXNlcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LCBkZWZlcnJlZC5yZWplY3QpO1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgZ2V0RmFsbGJhY2tUcmFuc2xhdGlvbkluc3RhbnQgPSBmdW5jdGlvbiAobGFuZ0tleSwgdHJhbnNsYXRpb25JZCwgaW50ZXJwb2xhdGVQYXJhbXMsIEludGVycG9sYXRvcikge1xuICAgICAgICAgIHZhciByZXN1bHQsIHRyYW5zbGF0aW9uVGFibGUgPSAkdHJhbnNsYXRpb25UYWJsZVtsYW5nS2V5XTtcbiAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRyYW5zbGF0aW9uVGFibGUsIHRyYW5zbGF0aW9uSWQpKSB7XG4gICAgICAgICAgICBJbnRlcnBvbGF0b3Iuc2V0TG9jYWxlKGxhbmdLZXkpO1xuICAgICAgICAgICAgcmVzdWx0ID0gSW50ZXJwb2xhdG9yLmludGVycG9sYXRlKHRyYW5zbGF0aW9uVGFibGVbdHJhbnNsYXRpb25JZF0sIGludGVycG9sYXRlUGFyYW1zKTtcbiAgICAgICAgICAgIEludGVycG9sYXRvci5zZXRMb2NhbGUoJHVzZXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9O1xuICAgICAgICB2YXIgdHJhbnNsYXRlQnlIYW5kbGVyID0gZnVuY3Rpb24gKHRyYW5zbGF0aW9uSWQpIHtcbiAgICAgICAgICBpZiAoJG1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXJGYWN0b3J5KSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0U3RyaW5nID0gJGluamVjdG9yLmdldCgkbWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlckZhY3RvcnkpKHRyYW5zbGF0aW9uSWQsICR1c2VzKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHRTdHJpbmcgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0U3RyaW5nO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRyYW5zbGF0aW9uSWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0cmFuc2xhdGlvbklkO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHJlc29sdmVGb3JGYWxsYmFja0xhbmd1YWdlID0gZnVuY3Rpb24gKGZhbGxiYWNrTGFuZ3VhZ2VJbmRleCwgdHJhbnNsYXRpb25JZCwgaW50ZXJwb2xhdGVQYXJhbXMsIEludGVycG9sYXRvcikge1xuICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgaWYgKGZhbGxiYWNrTGFuZ3VhZ2VJbmRleCA8ICRmYWxsYmFja0xhbmd1YWdlLmxlbmd0aCkge1xuICAgICAgICAgICAgdmFyIGxhbmdLZXkgPSAkZmFsbGJhY2tMYW5ndWFnZVtmYWxsYmFja0xhbmd1YWdlSW5kZXhdO1xuICAgICAgICAgICAgZ2V0RmFsbGJhY2tUcmFuc2xhdGlvbihsYW5nS2V5LCB0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgSW50ZXJwb2xhdG9yKS50aGVuKGRlZmVycmVkLnJlc29sdmUsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgcmVzb2x2ZUZvckZhbGxiYWNrTGFuZ3VhZ2UoZmFsbGJhY2tMYW5ndWFnZUluZGV4ICsgMSwgdHJhbnNsYXRpb25JZCwgaW50ZXJwb2xhdGVQYXJhbXMsIEludGVycG9sYXRvcikudGhlbihkZWZlcnJlZC5yZXNvbHZlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHRyYW5zbGF0ZUJ5SGFuZGxlcih0cmFuc2xhdGlvbklkKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgcmVzb2x2ZUZvckZhbGxiYWNrTGFuZ3VhZ2VJbnN0YW50ID0gZnVuY3Rpb24gKGZhbGxiYWNrTGFuZ3VhZ2VJbmRleCwgdHJhbnNsYXRpb25JZCwgaW50ZXJwb2xhdGVQYXJhbXMsIEludGVycG9sYXRvcikge1xuICAgICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgICAgaWYgKGZhbGxiYWNrTGFuZ3VhZ2VJbmRleCA8ICRmYWxsYmFja0xhbmd1YWdlLmxlbmd0aCkge1xuICAgICAgICAgICAgdmFyIGxhbmdLZXkgPSAkZmFsbGJhY2tMYW5ndWFnZVtmYWxsYmFja0xhbmd1YWdlSW5kZXhdO1xuICAgICAgICAgICAgcmVzdWx0ID0gZ2V0RmFsbGJhY2tUcmFuc2xhdGlvbkluc3RhbnQobGFuZ0tleSwgdHJhbnNsYXRpb25JZCwgaW50ZXJwb2xhdGVQYXJhbXMsIEludGVycG9sYXRvcik7XG4gICAgICAgICAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgICAgICAgICByZXN1bHQgPSByZXNvbHZlRm9yRmFsbGJhY2tMYW5ndWFnZUluc3RhbnQoZmFsbGJhY2tMYW5ndWFnZUluZGV4ICsgMSwgdHJhbnNsYXRpb25JZCwgaW50ZXJwb2xhdGVQYXJhbXMsIEludGVycG9sYXRvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgICAgIHZhciBmYWxsYmFja1RyYW5zbGF0aW9uID0gZnVuY3Rpb24gKHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zLCBJbnRlcnBvbGF0b3IpIHtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZUZvckZhbGxiYWNrTGFuZ3VhZ2Uoc3RhcnRGYWxsYmFja0l0ZXJhdGlvbiA+IDAgPyBzdGFydEZhbGxiYWNrSXRlcmF0aW9uIDogZmFsbGJhY2tJbmRleCwgdHJhbnNsYXRpb25JZCwgaW50ZXJwb2xhdGVQYXJhbXMsIEludGVycG9sYXRvcik7XG4gICAgICAgIH07XG4gICAgICAgIHZhciBmYWxsYmFja1RyYW5zbGF0aW9uSW5zdGFudCA9IGZ1bmN0aW9uICh0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgSW50ZXJwb2xhdG9yKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmVGb3JGYWxsYmFja0xhbmd1YWdlSW5zdGFudChzdGFydEZhbGxiYWNrSXRlcmF0aW9uID4gMCA/IHN0YXJ0RmFsbGJhY2tJdGVyYXRpb24gOiBmYWxsYmFja0luZGV4LCB0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgSW50ZXJwb2xhdG9yKTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIGRldGVybWluZVRyYW5zbGF0aW9uID0gZnVuY3Rpb24gKHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zLCBpbnRlcnBvbGF0aW9uSWQpIHtcbiAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgIHZhciB0YWJsZSA9ICR1c2VzID8gJHRyYW5zbGF0aW9uVGFibGVbJHVzZXNdIDogJHRyYW5zbGF0aW9uVGFibGUsIEludGVycG9sYXRvciA9IGludGVycG9sYXRpb25JZCA/IGludGVycG9sYXRvckhhc2hNYXBbaW50ZXJwb2xhdGlvbklkXSA6IGRlZmF1bHRJbnRlcnBvbGF0b3I7XG4gICAgICAgICAgaWYgKHRhYmxlICYmIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0YWJsZSwgdHJhbnNsYXRpb25JZCkpIHtcbiAgICAgICAgICAgIHZhciB0cmFuc2xhdGlvbiA9IHRhYmxlW3RyYW5zbGF0aW9uSWRdO1xuICAgICAgICAgICAgaWYgKHRyYW5zbGF0aW9uLnN1YnN0cigwLCAyKSA9PT0gJ0A6Jykge1xuICAgICAgICAgICAgICAkdHJhbnNsYXRlKHRyYW5zbGF0aW9uLnN1YnN0cigyKSwgaW50ZXJwb2xhdGVQYXJhbXMsIGludGVycG9sYXRpb25JZCkudGhlbihkZWZlcnJlZC5yZXNvbHZlLCBkZWZlcnJlZC5yZWplY3QpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShJbnRlcnBvbGF0b3IuaW50ZXJwb2xhdGUodHJhbnNsYXRpb24sIGludGVycG9sYXRlUGFyYW1zKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBtaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyVHJhbnNsYXRpb247XG4gICAgICAgICAgICBpZiAoJG1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXJGYWN0b3J5ICYmICFwZW5kaW5nTG9hZGVyKSB7XG4gICAgICAgICAgICAgIG1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXJUcmFuc2xhdGlvbiA9IHRyYW5zbGF0ZUJ5SGFuZGxlcih0cmFuc2xhdGlvbklkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgkdXNlcyAmJiAkZmFsbGJhY2tMYW5ndWFnZSAmJiAkZmFsbGJhY2tMYW5ndWFnZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgZmFsbGJhY2tUcmFuc2xhdGlvbih0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgSW50ZXJwb2xhdG9yKS50aGVuKGZ1bmN0aW9uICh0cmFuc2xhdGlvbikge1xuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUodHJhbnNsYXRpb24pO1xuICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoX3RyYW5zbGF0aW9uSWQpIHtcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoYXBwbHlOb3RGb3VuZEluZGljYXRvcnMoX3RyYW5zbGF0aW9uSWQpKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCRtaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyRmFjdG9yeSAmJiAhcGVuZGluZ0xvYWRlciAmJiBtaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyVHJhbnNsYXRpb24pIHtcbiAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShtaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyVHJhbnNsYXRpb24pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGFwcGx5Tm90Rm91bmRJbmRpY2F0b3JzKHRyYW5zbGF0aW9uSWQpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG4gICAgICAgIHZhciBkZXRlcm1pbmVUcmFuc2xhdGlvbkluc3RhbnQgPSBmdW5jdGlvbiAodHJhbnNsYXRpb25JZCwgaW50ZXJwb2xhdGVQYXJhbXMsIGludGVycG9sYXRpb25JZCkge1xuICAgICAgICAgIHZhciByZXN1bHQsIHRhYmxlID0gJHVzZXMgPyAkdHJhbnNsYXRpb25UYWJsZVskdXNlc10gOiAkdHJhbnNsYXRpb25UYWJsZSwgSW50ZXJwb2xhdG9yID0gaW50ZXJwb2xhdGlvbklkID8gaW50ZXJwb2xhdG9ySGFzaE1hcFtpbnRlcnBvbGF0aW9uSWRdIDogZGVmYXVsdEludGVycG9sYXRvcjtcbiAgICAgICAgICBpZiAodGFibGUgJiYgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRhYmxlLCB0cmFuc2xhdGlvbklkKSkge1xuICAgICAgICAgICAgdmFyIHRyYW5zbGF0aW9uID0gdGFibGVbdHJhbnNsYXRpb25JZF07XG4gICAgICAgICAgICBpZiAodHJhbnNsYXRpb24uc3Vic3RyKDAsIDIpID09PSAnQDonKSB7XG4gICAgICAgICAgICAgIHJlc3VsdCA9IGRldGVybWluZVRyYW5zbGF0aW9uSW5zdGFudCh0cmFuc2xhdGlvbi5zdWJzdHIoMiksIGludGVycG9sYXRlUGFyYW1zLCBpbnRlcnBvbGF0aW9uSWQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVzdWx0ID0gSW50ZXJwb2xhdG9yLmludGVycG9sYXRlKHRyYW5zbGF0aW9uLCBpbnRlcnBvbGF0ZVBhcmFtcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBtaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyVHJhbnNsYXRpb247XG4gICAgICAgICAgICBpZiAoJG1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXJGYWN0b3J5ICYmICFwZW5kaW5nTG9hZGVyKSB7XG4gICAgICAgICAgICAgIG1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXJUcmFuc2xhdGlvbiA9IHRyYW5zbGF0ZUJ5SGFuZGxlcih0cmFuc2xhdGlvbklkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgkdXNlcyAmJiAkZmFsbGJhY2tMYW5ndWFnZSAmJiAkZmFsbGJhY2tMYW5ndWFnZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgZmFsbGJhY2tJbmRleCA9IDA7XG4gICAgICAgICAgICAgIHJlc3VsdCA9IGZhbGxiYWNrVHJhbnNsYXRpb25JbnN0YW50KHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zLCBJbnRlcnBvbGF0b3IpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICgkbWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlckZhY3RvcnkgJiYgIXBlbmRpbmdMb2FkZXIgJiYgbWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlclRyYW5zbGF0aW9uKSB7XG4gICAgICAgICAgICAgIHJlc3VsdCA9IG1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXJUcmFuc2xhdGlvbjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJlc3VsdCA9IGFwcGx5Tm90Rm91bmRJbmRpY2F0b3JzKHRyYW5zbGF0aW9uSWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9O1xuICAgICAgICAkdHJhbnNsYXRlLnByZWZlcnJlZExhbmd1YWdlID0gZnVuY3Rpb24gKGxhbmdLZXkpIHtcbiAgICAgICAgICBpZiAobGFuZ0tleSkge1xuICAgICAgICAgICAgc2V0dXBQcmVmZXJyZWRMYW5ndWFnZShsYW5nS2V5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuICRwcmVmZXJyZWRMYW5ndWFnZTtcbiAgICAgICAgfTtcbiAgICAgICAgJHRyYW5zbGF0ZS5jbG9ha0NsYXNzTmFtZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gJGNsb2FrQ2xhc3NOYW1lO1xuICAgICAgICB9O1xuICAgICAgICAkdHJhbnNsYXRlLmZhbGxiYWNrTGFuZ3VhZ2UgPSBmdW5jdGlvbiAobGFuZ0tleSkge1xuICAgICAgICAgIGlmIChsYW5nS2V5ICE9PSB1bmRlZmluZWQgJiYgbGFuZ0tleSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgZmFsbGJhY2tTdGFjayhsYW5nS2V5KTtcbiAgICAgICAgICAgIGlmICgkbG9hZGVyRmFjdG9yeSkge1xuICAgICAgICAgICAgICBpZiAoJGZhbGxiYWNrTGFuZ3VhZ2UgJiYgJGZhbGxiYWNrTGFuZ3VhZ2UubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9ICRmYWxsYmFja0xhbmd1YWdlLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoIWxhbmdQcm9taXNlc1skZmFsbGJhY2tMYW5ndWFnZVtpXV0pIHtcbiAgICAgICAgICAgICAgICAgICAgbGFuZ1Byb21pc2VzWyRmYWxsYmFja0xhbmd1YWdlW2ldXSA9IGxvYWRBc3luYygkZmFsbGJhY2tMYW5ndWFnZVtpXSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAkdHJhbnNsYXRlLnVzZSgkdHJhbnNsYXRlLnVzZSgpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCRmYWxsYmFja1dhc1N0cmluZykge1xuICAgICAgICAgICAgcmV0dXJuICRmYWxsYmFja0xhbmd1YWdlWzBdO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gJGZhbGxiYWNrTGFuZ3VhZ2U7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICAkdHJhbnNsYXRlLnVzZUZhbGxiYWNrTGFuZ3VhZ2UgPSBmdW5jdGlvbiAobGFuZ0tleSkge1xuICAgICAgICAgIGlmIChsYW5nS2V5ICE9PSB1bmRlZmluZWQgJiYgbGFuZ0tleSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKCFsYW5nS2V5KSB7XG4gICAgICAgICAgICAgIHN0YXJ0RmFsbGJhY2tJdGVyYXRpb24gPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdmFyIGxhbmdLZXlQb3NpdGlvbiA9IGluZGV4T2YoJGZhbGxiYWNrTGFuZ3VhZ2UsIGxhbmdLZXkpO1xuICAgICAgICAgICAgICBpZiAobGFuZ0tleVBvc2l0aW9uID4gLTEpIHtcbiAgICAgICAgICAgICAgICBzdGFydEZhbGxiYWNrSXRlcmF0aW9uID0gbGFuZ0tleVBvc2l0aW9uO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICAkdHJhbnNsYXRlLnByb3Bvc2VkTGFuZ3VhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuICRuZXh0TGFuZztcbiAgICAgICAgfTtcbiAgICAgICAgJHRyYW5zbGF0ZS5zdG9yYWdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiBTdG9yYWdlO1xuICAgICAgICB9O1xuICAgICAgICAkdHJhbnNsYXRlLnVzZSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICBpZiAoIWtleSkge1xuICAgICAgICAgICAgcmV0dXJuICR1c2VzO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICRyb290U2NvcGUuJGVtaXQoJyR0cmFuc2xhdGVDaGFuZ2VTdGFydCcsIHsgbGFuZ3VhZ2U6IGtleSB9KTtcbiAgICAgICAgICB2YXIgYWxpYXNlZEtleSA9IG5lZ290aWF0ZUxvY2FsZShrZXkpO1xuICAgICAgICAgIGlmIChhbGlhc2VkS2V5KSB7XG4gICAgICAgICAgICBrZXkgPSBhbGlhc2VkS2V5O1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoISR0cmFuc2xhdGlvblRhYmxlW2tleV0gJiYgJGxvYWRlckZhY3RvcnkgJiYgIWxhbmdQcm9taXNlc1trZXldKSB7XG4gICAgICAgICAgICAkbmV4dExhbmcgPSBrZXk7XG4gICAgICAgICAgICBsYW5nUHJvbWlzZXNba2V5XSA9IGxvYWRBc3luYyhrZXkpLnRoZW4oZnVuY3Rpb24gKHRyYW5zbGF0aW9uKSB7XG4gICAgICAgICAgICAgIHRyYW5zbGF0aW9ucyh0cmFuc2xhdGlvbi5rZXksIHRyYW5zbGF0aW9uLnRhYmxlKTtcbiAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh0cmFuc2xhdGlvbi5rZXkpO1xuICAgICAgICAgICAgICB1c2VMYW5ndWFnZSh0cmFuc2xhdGlvbi5rZXkpO1xuICAgICAgICAgICAgICBpZiAoJG5leHRMYW5nID09PSBrZXkpIHtcbiAgICAgICAgICAgICAgICAkbmV4dExhbmcgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgICAgaWYgKCRuZXh0TGFuZyA9PT0ga2V5KSB7XG4gICAgICAgICAgICAgICAgJG5leHRMYW5nID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICRyb290U2NvcGUuJGVtaXQoJyR0cmFuc2xhdGVDaGFuZ2VFcnJvcicsIHsgbGFuZ3VhZ2U6IGtleSB9KTtcbiAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGtleSk7XG4gICAgICAgICAgICAgICRyb290U2NvcGUuJGVtaXQoJyR0cmFuc2xhdGVDaGFuZ2VFbmQnLCB7IGxhbmd1YWdlOiBrZXkgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShrZXkpO1xuICAgICAgICAgICAgdXNlTGFuZ3VhZ2Uoa2V5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG4gICAgICAgICR0cmFuc2xhdGUuc3RvcmFnZUtleSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gc3RvcmFnZUtleSgpO1xuICAgICAgICB9O1xuICAgICAgICAkdHJhbnNsYXRlLmlzUG9zdENvbXBpbGluZ0VuYWJsZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuICRwb3N0Q29tcGlsaW5nRW5hYmxlZDtcbiAgICAgICAgfTtcbiAgICAgICAgJHRyYW5zbGF0ZS5yZWZyZXNoID0gZnVuY3Rpb24gKGxhbmdLZXkpIHtcbiAgICAgICAgICBpZiAoISRsb2FkZXJGYWN0b3J5KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkblxcJ3QgcmVmcmVzaCB0cmFuc2xhdGlvbiB0YWJsZSwgbm8gbG9hZGVyIHJlZ2lzdGVyZWQhJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgZnVuY3Rpb24gcmVzb2x2ZSgpIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcbiAgICAgICAgICAgICRyb290U2NvcGUuJGVtaXQoJyR0cmFuc2xhdGVSZWZyZXNoRW5kJywgeyBsYW5ndWFnZTogbGFuZ0tleSB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZnVuY3Rpb24gcmVqZWN0KCkge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRlbWl0KCckdHJhbnNsYXRlUmVmcmVzaEVuZCcsIHsgbGFuZ3VhZ2U6IGxhbmdLZXkgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgICRyb290U2NvcGUuJGVtaXQoJyR0cmFuc2xhdGVSZWZyZXNoU3RhcnQnLCB7IGxhbmd1YWdlOiBsYW5nS2V5IH0pO1xuICAgICAgICAgIGlmICghbGFuZ0tleSkge1xuICAgICAgICAgICAgdmFyIHRhYmxlcyA9IFtdLCBsb2FkaW5nS2V5cyA9IHt9O1xuICAgICAgICAgICAgaWYgKCRmYWxsYmFja0xhbmd1YWdlICYmICRmYWxsYmFja0xhbmd1YWdlLmxlbmd0aCkge1xuICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gJGZhbGxiYWNrTGFuZ3VhZ2UubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0YWJsZXMucHVzaChsb2FkQXN5bmMoJGZhbGxiYWNrTGFuZ3VhZ2VbaV0pKTtcbiAgICAgICAgICAgICAgICBsb2FkaW5nS2V5c1skZmFsbGJhY2tMYW5ndWFnZVtpXV0gPSB0cnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoJHVzZXMgJiYgIWxvYWRpbmdLZXlzWyR1c2VzXSkge1xuICAgICAgICAgICAgICB0YWJsZXMucHVzaChsb2FkQXN5bmMoJHVzZXMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICRxLmFsbCh0YWJsZXMpLnRoZW4oZnVuY3Rpb24gKHRhYmxlRGF0YSkge1xuICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2godGFibGVEYXRhLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIGlmICgkdHJhbnNsYXRpb25UYWJsZVtkYXRhLmtleV0pIHtcbiAgICAgICAgICAgICAgICAgIGRlbGV0ZSAkdHJhbnNsYXRpb25UYWJsZVtkYXRhLmtleV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRyYW5zbGF0aW9ucyhkYXRhLmtleSwgZGF0YS50YWJsZSk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBpZiAoJHVzZXMpIHtcbiAgICAgICAgICAgICAgICB1c2VMYW5ndWFnZSgkdXNlcyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIGlmICgkdHJhbnNsYXRpb25UYWJsZVtsYW5nS2V5XSkge1xuICAgICAgICAgICAgbG9hZEFzeW5jKGxhbmdLZXkpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgdHJhbnNsYXRpb25zKGRhdGEua2V5LCBkYXRhLnRhYmxlKTtcbiAgICAgICAgICAgICAgaWYgKGxhbmdLZXkgPT09ICR1c2VzKSB7XG4gICAgICAgICAgICAgICAgdXNlTGFuZ3VhZ2UoJHVzZXMpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH0sIHJlamVjdCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfTtcbiAgICAgICAgJHRyYW5zbGF0ZS5pbnN0YW50ID0gZnVuY3Rpb24gKHRyYW5zbGF0aW9uSWQsIGludGVycG9sYXRlUGFyYW1zLCBpbnRlcnBvbGF0aW9uSWQpIHtcbiAgICAgICAgICBpZiAodHJhbnNsYXRpb25JZCA9PT0gbnVsbCB8fCBhbmd1bGFyLmlzVW5kZWZpbmVkKHRyYW5zbGF0aW9uSWQpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJhbnNsYXRpb25JZDtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGFuZ3VsYXIuaXNBcnJheSh0cmFuc2xhdGlvbklkKSkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdHMgPSB7fTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBjID0gdHJhbnNsYXRpb25JZC5sZW5ndGg7IGkgPCBjOyBpKyspIHtcbiAgICAgICAgICAgICAgcmVzdWx0c1t0cmFuc2xhdGlvbklkW2ldXSA9ICR0cmFuc2xhdGUuaW5zdGFudCh0cmFuc2xhdGlvbklkW2ldLCBpbnRlcnBvbGF0ZVBhcmFtcywgaW50ZXJwb2xhdGlvbklkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoYW5ndWxhci5pc1N0cmluZyh0cmFuc2xhdGlvbklkKSAmJiB0cmFuc2xhdGlvbklkLmxlbmd0aCA8IDEpIHtcbiAgICAgICAgICAgIHJldHVybiB0cmFuc2xhdGlvbklkO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodHJhbnNsYXRpb25JZCkge1xuICAgICAgICAgICAgdHJhbnNsYXRpb25JZCA9IHRyaW0uYXBwbHkodHJhbnNsYXRpb25JZCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciByZXN1bHQsIHBvc3NpYmxlTGFuZ0tleXMgPSBbXTtcbiAgICAgICAgICBpZiAoJHByZWZlcnJlZExhbmd1YWdlKSB7XG4gICAgICAgICAgICBwb3NzaWJsZUxhbmdLZXlzLnB1c2goJHByZWZlcnJlZExhbmd1YWdlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCR1c2VzKSB7XG4gICAgICAgICAgICBwb3NzaWJsZUxhbmdLZXlzLnB1c2goJHVzZXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoJGZhbGxiYWNrTGFuZ3VhZ2UgJiYgJGZhbGxiYWNrTGFuZ3VhZ2UubGVuZ3RoKSB7XG4gICAgICAgICAgICBwb3NzaWJsZUxhbmdLZXlzID0gcG9zc2libGVMYW5nS2V5cy5jb25jYXQoJGZhbGxiYWNrTGFuZ3VhZ2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBmb3IgKHZhciBqID0gMCwgZCA9IHBvc3NpYmxlTGFuZ0tleXMubGVuZ3RoOyBqIDwgZDsgaisrKSB7XG4gICAgICAgICAgICB2YXIgcG9zc2libGVMYW5nS2V5ID0gcG9zc2libGVMYW5nS2V5c1tqXTtcbiAgICAgICAgICAgIGlmICgkdHJhbnNsYXRpb25UYWJsZVtwb3NzaWJsZUxhbmdLZXldKSB7XG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgJHRyYW5zbGF0aW9uVGFibGVbcG9zc2libGVMYW5nS2V5XVt0cmFuc2xhdGlvbklkXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBkZXRlcm1pbmVUcmFuc2xhdGlvbkluc3RhbnQodHJhbnNsYXRpb25JZCwgaW50ZXJwb2xhdGVQYXJhbXMsIGludGVycG9sYXRpb25JZCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2YgcmVzdWx0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFyZXN1bHQgJiYgcmVzdWx0ICE9PSAnJykge1xuICAgICAgICAgICAgcmVzdWx0ID0gZGVmYXVsdEludGVycG9sYXRvci5pbnRlcnBvbGF0ZSh0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcyk7XG4gICAgICAgICAgICBpZiAoJG1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXJGYWN0b3J5ICYmICFwZW5kaW5nTG9hZGVyKSB7XG4gICAgICAgICAgICAgIHJlc3VsdCA9IHRyYW5zbGF0ZUJ5SGFuZGxlcih0cmFuc2xhdGlvbklkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICAgICAgJHRyYW5zbGF0ZS52ZXJzaW9uSW5mbyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gdmVyc2lvbjtcbiAgICAgICAgfTtcbiAgICAgICAgJHRyYW5zbGF0ZS5sb2FkZXJDYWNoZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gbG9hZGVyQ2FjaGU7XG4gICAgICAgIH07XG4gICAgICAgIGlmICgkbG9hZGVyRmFjdG9yeSkge1xuICAgICAgICAgIGlmIChhbmd1bGFyLmVxdWFscygkdHJhbnNsYXRpb25UYWJsZSwge30pKSB7XG4gICAgICAgICAgICAkdHJhbnNsYXRlLnVzZSgkdHJhbnNsYXRlLnVzZSgpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCRmYWxsYmFja0xhbmd1YWdlICYmICRmYWxsYmFja0xhbmd1YWdlLmxlbmd0aCkge1xuICAgICAgICAgICAgdmFyIHByb2Nlc3NBc3luY1Jlc3VsdCA9IGZ1bmN0aW9uICh0cmFuc2xhdGlvbikge1xuICAgICAgICAgICAgICB0cmFuc2xhdGlvbnModHJhbnNsYXRpb24ua2V5LCB0cmFuc2xhdGlvbi50YWJsZSk7XG4gICAgICAgICAgICAgICRyb290U2NvcGUuJGVtaXQoJyR0cmFuc2xhdGVDaGFuZ2VFbmQnLCB7IGxhbmd1YWdlOiB0cmFuc2xhdGlvbi5rZXkgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9ICRmYWxsYmFja0xhbmd1YWdlLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgIGxhbmdQcm9taXNlc1skZmFsbGJhY2tMYW5ndWFnZVtpXV0gPSBsb2FkQXN5bmMoJGZhbGxiYWNrTGFuZ3VhZ2VbaV0pLnRoZW4ocHJvY2Vzc0FzeW5jUmVzdWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICR0cmFuc2xhdGU7XG4gICAgICB9XG4gICAgXTtcbiAgfVxuXSk7XG5hbmd1bGFyLm1vZHVsZSgncGFzY2FscHJlY2h0LnRyYW5zbGF0ZScpLmZhY3RvcnkoJyR0cmFuc2xhdGVEZWZhdWx0SW50ZXJwb2xhdGlvbicsIFtcbiAgJyRpbnRlcnBvbGF0ZScsXG4gIGZ1bmN0aW9uICgkaW50ZXJwb2xhdGUpIHtcbiAgICB2YXIgJHRyYW5zbGF0ZUludGVycG9sYXRvciA9IHt9LCAkbG9jYWxlLCAkaWRlbnRpZmllciA9ICdkZWZhdWx0JywgJHNhbml0aXplVmFsdWVTdHJhdGVneSA9IG51bGwsIHNhbml0aXplVmFsdWVTdHJhdGVnaWVzID0ge1xuICAgICAgICBlc2NhcGVkOiBmdW5jdGlvbiAocGFyYW1zKSB7XG4gICAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICAgICAgIGZvciAodmFyIGtleSBpbiBwYXJhbXMpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocGFyYW1zLCBrZXkpKSB7XG4gICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gYW5ndWxhci5lbGVtZW50KCc8ZGl2PjwvZGl2PicpLnRleHQocGFyYW1zW2tleV0pLmh0bWwoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB2YXIgc2FuaXRpemVQYXJhbXMgPSBmdW5jdGlvbiAocGFyYW1zKSB7XG4gICAgICB2YXIgcmVzdWx0O1xuICAgICAgaWYgKGFuZ3VsYXIuaXNGdW5jdGlvbihzYW5pdGl6ZVZhbHVlU3RyYXRlZ2llc1skc2FuaXRpemVWYWx1ZVN0cmF0ZWd5XSkpIHtcbiAgICAgICAgcmVzdWx0ID0gc2FuaXRpemVWYWx1ZVN0cmF0ZWdpZXNbJHNhbml0aXplVmFsdWVTdHJhdGVneV0ocGFyYW1zKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdCA9IHBhcmFtcztcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgICAkdHJhbnNsYXRlSW50ZXJwb2xhdG9yLnNldExvY2FsZSA9IGZ1bmN0aW9uIChsb2NhbGUpIHtcbiAgICAgICRsb2NhbGUgPSBsb2NhbGU7XG4gICAgfTtcbiAgICAkdHJhbnNsYXRlSW50ZXJwb2xhdG9yLmdldEludGVycG9sYXRpb25JZGVudGlmaWVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuICRpZGVudGlmaWVyO1xuICAgIH07XG4gICAgJHRyYW5zbGF0ZUludGVycG9sYXRvci51c2VTYW5pdGl6ZVZhbHVlU3RyYXRlZ3kgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICRzYW5pdGl6ZVZhbHVlU3RyYXRlZ3kgPSB2YWx1ZTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgJHRyYW5zbGF0ZUludGVycG9sYXRvci5pbnRlcnBvbGF0ZSA9IGZ1bmN0aW9uIChzdHJpbmcsIGludGVycG9sYXRlUGFyYW1zKSB7XG4gICAgICBpZiAoJHNhbml0aXplVmFsdWVTdHJhdGVneSkge1xuICAgICAgICBpbnRlcnBvbGF0ZVBhcmFtcyA9IHNhbml0aXplUGFyYW1zKGludGVycG9sYXRlUGFyYW1zKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAkaW50ZXJwb2xhdGUoc3RyaW5nKShpbnRlcnBvbGF0ZVBhcmFtcyB8fCB7fSk7XG4gICAgfTtcbiAgICByZXR1cm4gJHRyYW5zbGF0ZUludGVycG9sYXRvcjtcbiAgfVxuXSk7XG5hbmd1bGFyLm1vZHVsZSgncGFzY2FscHJlY2h0LnRyYW5zbGF0ZScpLmNvbnN0YW50KCckU1RPUkFHRV9LRVknLCAnTkdfVFJBTlNMQVRFX0xBTkdfS0VZJyk7XG5hbmd1bGFyLm1vZHVsZSgncGFzY2FscHJlY2h0LnRyYW5zbGF0ZScpLmRpcmVjdGl2ZSgndHJhbnNsYXRlJywgW1xuICAnJHRyYW5zbGF0ZScsXG4gICckcScsXG4gICckaW50ZXJwb2xhdGUnLFxuICAnJGNvbXBpbGUnLFxuICAnJHBhcnNlJyxcbiAgJyRyb290U2NvcGUnLFxuICBmdW5jdGlvbiAoJHRyYW5zbGF0ZSwgJHEsICRpbnRlcnBvbGF0ZSwgJGNvbXBpbGUsICRwYXJzZSwgJHJvb3RTY29wZSkge1xuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0FFJyxcbiAgICAgIHNjb3BlOiB0cnVlLFxuICAgICAgY29tcGlsZTogZnVuY3Rpb24gKHRFbGVtZW50LCB0QXR0cikge1xuICAgICAgICB2YXIgdHJhbnNsYXRlVmFsdWVzRXhpc3QgPSB0QXR0ci50cmFuc2xhdGVWYWx1ZXMgPyB0QXR0ci50cmFuc2xhdGVWYWx1ZXMgOiB1bmRlZmluZWQ7XG4gICAgICAgIHZhciB0cmFuc2xhdGVJbnRlcnBvbGF0aW9uID0gdEF0dHIudHJhbnNsYXRlSW50ZXJwb2xhdGlvbiA/IHRBdHRyLnRyYW5zbGF0ZUludGVycG9sYXRpb24gOiB1bmRlZmluZWQ7XG4gICAgICAgIHZhciB0cmFuc2xhdGVWYWx1ZUV4aXN0ID0gdEVsZW1lbnRbMF0ub3V0ZXJIVE1MLm1hdGNoKC90cmFuc2xhdGUtdmFsdWUtKy9pKTtcbiAgICAgICAgdmFyIGludGVycG9sYXRlUmVnRXhwID0gJ14oLiopKCcgKyAkaW50ZXJwb2xhdGUuc3RhcnRTeW1ib2woKSArICcuKicgKyAkaW50ZXJwb2xhdGUuZW5kU3ltYm9sKCkgKyAnKSguKiknO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbGlua0ZuKHNjb3BlLCBpRWxlbWVudCwgaUF0dHIpIHtcbiAgICAgICAgICBzY29wZS5pbnRlcnBvbGF0ZVBhcmFtcyA9IHt9O1xuICAgICAgICAgIHNjb3BlLnByZVRleHQgPSAnJztcbiAgICAgICAgICBzY29wZS5wb3N0VGV4dCA9ICcnO1xuICAgICAgICAgIGlBdHRyLiRvYnNlcnZlKCd0cmFuc2xhdGUnLCBmdW5jdGlvbiAodHJhbnNsYXRpb25JZCkge1xuICAgICAgICAgICAgaWYgKGFuZ3VsYXIuZXF1YWxzKHRyYW5zbGF0aW9uSWQsICcnKSB8fCAhYW5ndWxhci5pc0RlZmluZWQodHJhbnNsYXRpb25JZCkpIHtcbiAgICAgICAgICAgICAgdmFyIGludGVycG9sYXRlTWF0Y2hlcyA9IGlFbGVtZW50LnRleHQoKS5tYXRjaChpbnRlcnBvbGF0ZVJlZ0V4cCk7XG4gICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzQXJyYXkoaW50ZXJwb2xhdGVNYXRjaGVzKSkge1xuICAgICAgICAgICAgICAgIHNjb3BlLnByZVRleHQgPSBpbnRlcnBvbGF0ZU1hdGNoZXNbMV07XG4gICAgICAgICAgICAgICAgc2NvcGUucG9zdFRleHQgPSBpbnRlcnBvbGF0ZU1hdGNoZXNbM107XG4gICAgICAgICAgICAgICAgc2NvcGUudHJhbnNsYXRpb25JZCA9ICRpbnRlcnBvbGF0ZShpbnRlcnBvbGF0ZU1hdGNoZXNbMl0pKHNjb3BlLiRwYXJlbnQpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNjb3BlLnRyYW5zbGF0aW9uSWQgPSBpRWxlbWVudC50ZXh0KCkucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzY29wZS50cmFuc2xhdGlvbklkID0gdHJhbnNsYXRpb25JZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpQXR0ci4kb2JzZXJ2ZSgndHJhbnNsYXRlRGVmYXVsdCcsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgc2NvcGUuZGVmYXVsdFRleHQgPSB2YWx1ZTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAodHJhbnNsYXRlVmFsdWVzRXhpc3QpIHtcbiAgICAgICAgICAgIGlBdHRyLiRvYnNlcnZlKCd0cmFuc2xhdGVWYWx1ZXMnLCBmdW5jdGlvbiAoaW50ZXJwb2xhdGVQYXJhbXMpIHtcbiAgICAgICAgICAgICAgaWYgKGludGVycG9sYXRlUGFyYW1zKSB7XG4gICAgICAgICAgICAgICAgc2NvcGUuJHBhcmVudC4kd2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgYW5ndWxhci5leHRlbmQoc2NvcGUuaW50ZXJwb2xhdGVQYXJhbXMsICRwYXJzZShpbnRlcnBvbGF0ZVBhcmFtcykoc2NvcGUuJHBhcmVudCkpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHRyYW5zbGF0ZVZhbHVlRXhpc3QpIHtcbiAgICAgICAgICAgIHZhciBmbiA9IGZ1bmN0aW9uIChhdHRyTmFtZSkge1xuICAgICAgICAgICAgICBpQXR0ci4kb2JzZXJ2ZShhdHRyTmFtZSwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgc2NvcGUuaW50ZXJwb2xhdGVQYXJhbXNbYW5ndWxhci5sb3dlcmNhc2UoYXR0ck5hbWUuc3Vic3RyKDE0LCAxKSkgKyBhdHRyTmFtZS5zdWJzdHIoMTUpXSA9IHZhbHVlO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBmb3IgKHZhciBhdHRyIGluIGlBdHRyKSB7XG4gICAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoaUF0dHIsIGF0dHIpICYmIGF0dHIuc3Vic3RyKDAsIDE0KSA9PT0gJ3RyYW5zbGF0ZVZhbHVlJyAmJiBhdHRyICE9PSAndHJhbnNsYXRlVmFsdWVzJykge1xuICAgICAgICAgICAgICAgIGZuKGF0dHIpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciBhcHBseUVsZW1lbnRDb250ZW50ID0gZnVuY3Rpb24gKHZhbHVlLCBzY29wZSwgc3VjY2Vzc2Z1bCkge1xuICAgICAgICAgICAgaWYgKCFzdWNjZXNzZnVsICYmIHR5cGVvZiBzY29wZS5kZWZhdWx0VGV4dCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgdmFsdWUgPSBzY29wZS5kZWZhdWx0VGV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlFbGVtZW50Lmh0bWwoc2NvcGUucHJlVGV4dCArIHZhbHVlICsgc2NvcGUucG9zdFRleHQpO1xuICAgICAgICAgICAgdmFyIGdsb2JhbGx5RW5hYmxlZCA9ICR0cmFuc2xhdGUuaXNQb3N0Q29tcGlsaW5nRW5hYmxlZCgpO1xuICAgICAgICAgICAgdmFyIGxvY2FsbHlEZWZpbmVkID0gdHlwZW9mIHRBdHRyLnRyYW5zbGF0ZUNvbXBpbGUgIT09ICd1bmRlZmluZWQnO1xuICAgICAgICAgICAgdmFyIGxvY2FsbHlFbmFibGVkID0gbG9jYWxseURlZmluZWQgJiYgdEF0dHIudHJhbnNsYXRlQ29tcGlsZSAhPT0gJ2ZhbHNlJztcbiAgICAgICAgICAgIGlmIChnbG9iYWxseUVuYWJsZWQgJiYgIWxvY2FsbHlEZWZpbmVkIHx8IGxvY2FsbHlFbmFibGVkKSB7XG4gICAgICAgICAgICAgICRjb21waWxlKGlFbGVtZW50LmNvbnRlbnRzKCkpKHNjb3BlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICAgIHZhciB1cGRhdGVUcmFuc2xhdGlvbkZuID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICBpZiAoIXRyYW5zbGF0ZVZhbHVlc0V4aXN0ICYmICF0cmFuc2xhdGVWYWx1ZUV4aXN0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgIHZhciB1bndhdGNoID0gc2NvcGUuJHdhdGNoKCd0cmFuc2xhdGlvbklkJywgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKHNjb3BlLnRyYW5zbGF0aW9uSWQgJiYgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICR0cmFuc2xhdGUodmFsdWUsIHt9LCB0cmFuc2xhdGVJbnRlcnBvbGF0aW9uKS50aGVuKGZ1bmN0aW9uICh0cmFuc2xhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBseUVsZW1lbnRDb250ZW50KHRyYW5zbGF0aW9uLCBzY29wZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHVud2F0Y2goKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uICh0cmFuc2xhdGlvbklkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGFwcGx5RWxlbWVudENvbnRlbnQodHJhbnNsYXRpb25JZCwgc2NvcGUsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdW53YXRjaCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LCB0cnVlKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICB2YXIgdXBkYXRlVHJhbnNsYXRpb25zID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2NvcGUudHJhbnNsYXRpb25JZCAmJiBzY29wZS5pbnRlcnBvbGF0ZVBhcmFtcykge1xuICAgICAgICAgICAgICAgICAgICAgICR0cmFuc2xhdGUoc2NvcGUudHJhbnNsYXRpb25JZCwgc2NvcGUuaW50ZXJwb2xhdGVQYXJhbXMsIHRyYW5zbGF0ZUludGVycG9sYXRpb24pLnRoZW4oZnVuY3Rpb24gKHRyYW5zbGF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHBseUVsZW1lbnRDb250ZW50KHRyYW5zbGF0aW9uLCBzY29wZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKHRyYW5zbGF0aW9uSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcGx5RWxlbWVudENvbnRlbnQodHJhbnNsYXRpb25JZCwgc2NvcGUsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgIHNjb3BlLiR3YXRjaCgnaW50ZXJwb2xhdGVQYXJhbXMnLCB1cGRhdGVUcmFuc2xhdGlvbnMsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgc2NvcGUuJHdhdGNoKCd0cmFuc2xhdGlvbklkJywgdXBkYXRlVHJhbnNsYXRpb25zKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KCk7XG4gICAgICAgICAgdmFyIHVuYmluZCA9ICRyb290U2NvcGUuJG9uKCckdHJhbnNsYXRlQ2hhbmdlU3VjY2VzcycsIHVwZGF0ZVRyYW5zbGF0aW9uRm4pO1xuICAgICAgICAgIHVwZGF0ZVRyYW5zbGF0aW9uRm4oKTtcbiAgICAgICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgdW5iaW5kKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5dKTtcbmFuZ3VsYXIubW9kdWxlKCdwYXNjYWxwcmVjaHQudHJhbnNsYXRlJykuZGlyZWN0aXZlKCd0cmFuc2xhdGVDbG9haycsIFtcbiAgJyRyb290U2NvcGUnLFxuICAnJHRyYW5zbGF0ZScsXG4gIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkdHJhbnNsYXRlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbXBpbGU6IGZ1bmN0aW9uICh0RWxlbWVudCkge1xuICAgICAgICB2YXIgYXBwbHlDbG9hayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRFbGVtZW50LmFkZENsYXNzKCR0cmFuc2xhdGUuY2xvYWtDbGFzc05hbWUoKSk7XG4gICAgICAgICAgfSwgcmVtb3ZlQ2xvYWsgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0RWxlbWVudC5yZW1vdmVDbGFzcygkdHJhbnNsYXRlLmNsb2FrQ2xhc3NOYW1lKCkpO1xuICAgICAgICAgIH0sIHJlbW92ZUxpc3RlbmVyID0gJHJvb3RTY29wZS4kb24oJyR0cmFuc2xhdGVDaGFuZ2VFbmQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZW1vdmVDbG9haygpO1xuICAgICAgICAgICAgcmVtb3ZlTGlzdGVuZXIoKTtcbiAgICAgICAgICAgIHJlbW92ZUxpc3RlbmVyID0gbnVsbDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgYXBwbHlDbG9haygpO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbGlua0ZuKHNjb3BlLCBpRWxlbWVudCwgaUF0dHIpIHtcbiAgICAgICAgICBpZiAoaUF0dHIudHJhbnNsYXRlQ2xvYWsgJiYgaUF0dHIudHJhbnNsYXRlQ2xvYWsubGVuZ3RoKSB7XG4gICAgICAgICAgICBpQXR0ci4kb2JzZXJ2ZSgndHJhbnNsYXRlQ2xvYWsnLCBmdW5jdGlvbiAodHJhbnNsYXRpb25JZCkge1xuICAgICAgICAgICAgICAkdHJhbnNsYXRlKHRyYW5zbGF0aW9uSWQpLnRoZW4ocmVtb3ZlQ2xvYWssIGFwcGx5Q2xvYWspO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH07XG4gIH1cbl0pO1xuYW5ndWxhci5tb2R1bGUoJ3Bhc2NhbHByZWNodC50cmFuc2xhdGUnKS5maWx0ZXIoJ3RyYW5zbGF0ZScsIFtcbiAgJyRwYXJzZScsXG4gICckdHJhbnNsYXRlJyxcbiAgZnVuY3Rpb24gKCRwYXJzZSwgJHRyYW5zbGF0ZSkge1xuICAgIHZhciB0cmFuc2xhdGVGaWx0ZXIgPSBmdW5jdGlvbiAodHJhbnNsYXRpb25JZCwgaW50ZXJwb2xhdGVQYXJhbXMsIGludGVycG9sYXRpb24pIHtcbiAgICAgIGlmICghYW5ndWxhci5pc09iamVjdChpbnRlcnBvbGF0ZVBhcmFtcykpIHtcbiAgICAgICAgaW50ZXJwb2xhdGVQYXJhbXMgPSAkcGFyc2UoaW50ZXJwb2xhdGVQYXJhbXMpKHRoaXMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuICR0cmFuc2xhdGUuaW5zdGFudCh0cmFuc2xhdGlvbklkLCBpbnRlcnBvbGF0ZVBhcmFtcywgaW50ZXJwb2xhdGlvbik7XG4gICAgfTtcbiAgICB0cmFuc2xhdGVGaWx0ZXIuJHN0YXRlZnVsID0gdHJ1ZTtcbiAgICByZXR1cm4gdHJhbnNsYXRlRmlsdGVyO1xuICB9XG5dKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL09iamVjdFBhdGguanMnKS5PYmplY3RQYXRoO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG47IWZ1bmN0aW9uKHVuZGVmaW5lZCkge1xuXG5cdHZhciBPYmplY3RQYXRoID0ge1xuXHRcdHBhcnNlOiBmdW5jdGlvbihzdHIpe1xuXHRcdFx0aWYodHlwZW9mIHN0ciAhPT0gJ3N0cmluZycpe1xuXHRcdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdPYmplY3RQYXRoLnBhcnNlIG11c3QgYmUgcGFzc2VkIGEgc3RyaW5nJyk7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBpID0gMDtcblx0XHRcdHZhciBwYXJ0cyA9IFtdO1xuXHRcdFx0dmFyIGQsIGIsIHEsIGM7XG5cdFx0XHR3aGlsZSAoaSA8IHN0ci5sZW5ndGgpe1xuXHRcdFx0XHRkID0gc3RyLmluZGV4T2YoJy4nLCBpKTtcblx0XHRcdFx0YiA9IHN0ci5pbmRleE9mKCdbJywgaSk7XG5cblx0XHRcdFx0Ly8gd2UndmUgcmVhY2hlZCB0aGUgZW5kXG5cdFx0XHRcdGlmIChkID09PSAtMSAmJiBiID09PSAtMSl7XG5cdFx0XHRcdFx0cGFydHMucHVzaChzdHIuc2xpY2UoaSwgc3RyLmxlbmd0aCkpO1xuXHRcdFx0XHRcdGkgPSBzdHIubGVuZ3RoO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gZG90c1xuXHRcdFx0XHRlbHNlIGlmIChiID09PSAtMSB8fCAoZCAhPT0gLTEgJiYgZCA8IGIpKSB7XG5cdFx0XHRcdFx0cGFydHMucHVzaChzdHIuc2xpY2UoaSwgZCkpO1xuXHRcdFx0XHRcdGkgPSBkICsgMTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIGJyYWNrZXRzXG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdGlmIChiID4gaSl7XG5cdFx0XHRcdFx0XHRwYXJ0cy5wdXNoKHN0ci5zbGljZShpLCBiKSk7XG5cdFx0XHRcdFx0XHRpID0gYjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cSA9IHN0ci5zbGljZShiKzEsIGIrMik7XG5cdFx0XHRcdFx0aWYgKHEgIT09ICdcIicgJiYgcSAhPT0nXFwnJykge1xuXHRcdFx0XHRcdFx0YyA9IHN0ci5pbmRleE9mKCddJywgYik7XG5cdFx0XHRcdFx0XHRpZiAoYyA9PT0gLTEpIGMgPSBzdHIubGVuZ3RoO1xuXHRcdFx0XHRcdFx0cGFydHMucHVzaChzdHIuc2xpY2UoaSArIDEsIGMpKTtcblx0XHRcdFx0XHRcdGkgPSAoc3RyLnNsaWNlKGMgKyAxLCBjICsgMikgPT09ICcuJykgPyBjICsgMiA6IGMgKyAxO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRjID0gc3RyLmluZGV4T2YocSsnXScsIGIpO1xuXHRcdFx0XHRcdFx0aWYgKGMgPT09IC0xKSBjID0gc3RyLmxlbmd0aDtcblx0XHRcdFx0XHRcdHdoaWxlIChzdHIuc2xpY2UoYyAtIDEsIGMpID09PSAnXFxcXCcgJiYgYiA8IHN0ci5sZW5ndGgpe1xuXHRcdFx0XHRcdFx0XHRiKys7XG5cdFx0XHRcdFx0XHRcdGMgPSBzdHIuaW5kZXhPZihxKyddJywgYik7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRwYXJ0cy5wdXNoKHN0ci5zbGljZShpICsgMiwgYykucmVwbGFjZShuZXcgUmVnRXhwKCdcXFxcJytxLCdnJyksIHEpKTtcblx0XHRcdFx0XHRcdGkgPSAoc3RyLnNsaWNlKGMgKyAyLCBjICsgMykgPT09ICcuJykgPyBjICsgMyA6IGMgKyAyO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHBhcnRzO1xuXHRcdH0sXG5cblx0XHQvLyByb290ID09PSB0cnVlIDogYXV0byBjYWxjdWxhdGUgcm9vdDsgbXVzdCBiZSBkb3Qtbm90YXRpb24gZnJpZW5kbHlcblx0XHQvLyByb290IFN0cmluZyA6IHRoZSBzdHJpbmcgdG8gdXNlIGFzIHJvb3Rcblx0XHRzdHJpbmdpZnk6IGZ1bmN0aW9uKGFyciwgcXVvdGUpe1xuXG5cdFx0XHRpZighQXJyYXkuaXNBcnJheShhcnIpKVxuXHRcdFx0XHRhcnIgPSBbYXJyLnRvU3RyaW5nKCldO1xuXG5cdFx0XHRxdW90ZSA9IHF1b3RlID09PSAnXCInID8gJ1wiJyA6ICdcXCcnO1xuXG5cdFx0XHRyZXR1cm4gYXJyLm1hcChmdW5jdGlvbihuKXsgcmV0dXJuICdbJyArIHF1b3RlICsgKG4udG9TdHJpbmcoKSkucmVwbGFjZShuZXcgUmVnRXhwKHF1b3RlLCAnZycpLCAnXFxcXCcgKyBxdW90ZSkgKyBxdW90ZSArICddJzsgfSkuam9pbignJyk7XG5cdFx0fSxcblxuXHRcdG5vcm1hbGl6ZTogZnVuY3Rpb24oZGF0YSwgcXVvdGUpe1xuXHRcdFx0cmV0dXJuIE9iamVjdFBhdGguc3RyaW5naWZ5KEFycmF5LmlzQXJyYXkoZGF0YSkgPyBkYXRhIDogT2JqZWN0UGF0aC5wYXJzZShkYXRhKSwgcXVvdGUpO1xuXHRcdH1cblx0fTtcblxuXHQvLyBBTURcblx0aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuXHRcdGRlZmluZShmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBPYmplY3RQYXRoO1xuXHRcdH0pO1xuXHR9XG5cblx0Ly8gQ29tbW9uSlNcblx0ZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG5cdFx0ZXhwb3J0cy5PYmplY3RQYXRoID0gT2JqZWN0UGF0aDtcblx0fVxuXG5cdC8vIEFuZ3VsYXJcblx0ZWxzZSBpZiAodHlwZW9mIGFuZ3VsYXIgPT09ICdvYmplY3QnKSB7XG5cdFx0YW5ndWxhci5tb2R1bGUoJ09iamVjdFBhdGgnLCBbXSkucHJvdmlkZXIoJ09iamVjdFBhdGgnLCBmdW5jdGlvbigpe1xuXHRcdFx0dGhpcy5wYXJzZSA9IE9iamVjdFBhdGgucGFyc2U7XG5cdFx0XHR0aGlzLnN0cmluZ2lmeSA9IE9iamVjdFBhdGguc3RyaW5naWZ5O1xuXHRcdFx0dGhpcy5ub3JtYWxpemUgPSBPYmplY3RQYXRoLm5vcm1hbGl6ZTtcblx0XHRcdHRoaXMuJGdldCA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHJldHVybiBPYmplY3RQYXRoO1xuXHRcdFx0fTtcblx0XHR9KTtcblx0fVxuXG5cdC8vIEJyb3dzZXIgZ2xvYmFsLlxuXHRlbHNlIHtcblx0XHR3aW5kb3cuT2JqZWN0UGF0aCA9IE9iamVjdFBhdGg7XG5cdH1cbn0oKTsiLCIvKlxuQXV0aG9yOiBHZXJhaW50IEx1ZmYgYW5kIG90aGVyc1xuWWVhcjogMjAxM1xuXG5UaGlzIGNvZGUgaXMgcmVsZWFzZWQgaW50byB0aGUgXCJwdWJsaWMgZG9tYWluXCIgYnkgaXRzIGF1dGhvcihzKS4gIEFueWJvZHkgbWF5IHVzZSwgYWx0ZXIgYW5kIGRpc3RyaWJ1dGUgdGhlIGNvZGUgd2l0aG91dCByZXN0cmljdGlvbi4gIFRoZSBhdXRob3IgbWFrZXMgbm8gZ3VhcmFudGVlcywgYW5kIHRha2VzIG5vIGxpYWJpbGl0eSBvZiBhbnkga2luZCBmb3IgdXNlIG9mIHRoaXMgY29kZS5cblxuSWYgeW91IGZpbmQgYSBidWcgb3IgbWFrZSBhbiBpbXByb3ZlbWVudCwgaXQgd291bGQgYmUgY291cnRlb3VzIHRvIGxldCB0aGUgYXV0aG9yIGtub3csIGJ1dCBpdCBpcyBub3QgY29tcHVsc29yeS5cbiovXG4oZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuICAgIGRlZmluZShbXSwgZmFjdG9yeSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpe1xuICAgIC8vIENvbW1vbkpTLiBEZWZpbmUgZXhwb3J0LlxuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICB9IGVsc2Uge1xuICAgIC8vIEJyb3dzZXIgZ2xvYmFsc1xuICAgIGdsb2JhbC50djQgPSBmYWN0b3J5KCk7XG4gIH1cbn0odGhpcywgZnVuY3Rpb24gKCkge1xuXG4vLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9PYmplY3Qva2V5cz9yZWRpcmVjdGxvY2FsZT1lbi1VUyZyZWRpcmVjdHNsdWc9SmF2YVNjcmlwdCUyRlJlZmVyZW5jZSUyRkdsb2JhbF9PYmplY3RzJTJGT2JqZWN0JTJGa2V5c1xuaWYgKCFPYmplY3Qua2V5cykge1xuXHRPYmplY3Qua2V5cyA9IChmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSxcblx0XHRcdGhhc0RvbnRFbnVtQnVnID0gISh7dG9TdHJpbmc6IG51bGx9KS5wcm9wZXJ0eUlzRW51bWVyYWJsZSgndG9TdHJpbmcnKSxcblx0XHRcdGRvbnRFbnVtcyA9IFtcblx0XHRcdFx0J3RvU3RyaW5nJyxcblx0XHRcdFx0J3RvTG9jYWxlU3RyaW5nJyxcblx0XHRcdFx0J3ZhbHVlT2YnLFxuXHRcdFx0XHQnaGFzT3duUHJvcGVydHknLFxuXHRcdFx0XHQnaXNQcm90b3R5cGVPZicsXG5cdFx0XHRcdCdwcm9wZXJ0eUlzRW51bWVyYWJsZScsXG5cdFx0XHRcdCdjb25zdHJ1Y3Rvcidcblx0XHRcdF0sXG5cdFx0XHRkb250RW51bXNMZW5ndGggPSBkb250RW51bXMubGVuZ3RoO1xuXG5cdFx0cmV0dXJuIGZ1bmN0aW9uIChvYmopIHtcblx0XHRcdGlmICh0eXBlb2Ygb2JqICE9PSAnb2JqZWN0JyAmJiB0eXBlb2Ygb2JqICE9PSAnZnVuY3Rpb24nIHx8IG9iaiA9PT0gbnVsbCkge1xuXHRcdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdPYmplY3Qua2V5cyBjYWxsZWQgb24gbm9uLW9iamVjdCcpO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgcmVzdWx0ID0gW107XG5cblx0XHRcdGZvciAodmFyIHByb3AgaW4gb2JqKSB7XG5cdFx0XHRcdGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIHtcblx0XHRcdFx0XHRyZXN1bHQucHVzaChwcm9wKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoaGFzRG9udEVudW1CdWcpIHtcblx0XHRcdFx0Zm9yICh2YXIgaT0wOyBpIDwgZG9udEVudW1zTGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRpZiAoaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGRvbnRFbnVtc1tpXSkpIHtcblx0XHRcdFx0XHRcdHJlc3VsdC5wdXNoKGRvbnRFbnVtc1tpXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH07XG5cdH0pKCk7XG59XG4vLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9PYmplY3QvY3JlYXRlXG5pZiAoIU9iamVjdC5jcmVhdGUpIHtcblx0T2JqZWN0LmNyZWF0ZSA9IChmdW5jdGlvbigpe1xuXHRcdGZ1bmN0aW9uIEYoKXt9XG5cblx0XHRyZXR1cm4gZnVuY3Rpb24obyl7XG5cdFx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCAhPT0gMSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ09iamVjdC5jcmVhdGUgaW1wbGVtZW50YXRpb24gb25seSBhY2NlcHRzIG9uZSBwYXJhbWV0ZXIuJyk7XG5cdFx0XHR9XG5cdFx0XHRGLnByb3RvdHlwZSA9IG87XG5cdFx0XHRyZXR1cm4gbmV3IEYoKTtcblx0XHR9O1xuXHR9KSgpO1xufVxuLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXkvaXNBcnJheT9yZWRpcmVjdGxvY2FsZT1lbi1VUyZyZWRpcmVjdHNsdWc9SmF2YVNjcmlwdCUyRlJlZmVyZW5jZSUyRkdsb2JhbF9PYmplY3RzJTJGQXJyYXklMkZpc0FycmF5XG5pZighQXJyYXkuaXNBcnJheSkge1xuXHRBcnJheS5pc0FycmF5ID0gZnVuY3Rpb24gKHZBcmcpIHtcblx0XHRyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZBcmcpID09PSBcIltvYmplY3QgQXJyYXldXCI7XG5cdH07XG59XG4vLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS9pbmRleE9mP3JlZGlyZWN0bG9jYWxlPWVuLVVTJnJlZGlyZWN0c2x1Zz1KYXZhU2NyaXB0JTJGUmVmZXJlbmNlJTJGR2xvYmFsX09iamVjdHMlMkZBcnJheSUyRmluZGV4T2ZcbmlmICghQXJyYXkucHJvdG90eXBlLmluZGV4T2YpIHtcblx0QXJyYXkucHJvdG90eXBlLmluZGV4T2YgPSBmdW5jdGlvbiAoc2VhcmNoRWxlbWVudCAvKiwgZnJvbUluZGV4ICovICkge1xuXHRcdGlmICh0aGlzID09PSBudWxsKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCk7XG5cdFx0fVxuXHRcdHZhciB0ID0gT2JqZWN0KHRoaXMpO1xuXHRcdHZhciBsZW4gPSB0Lmxlbmd0aCA+Pj4gMDtcblxuXHRcdGlmIChsZW4gPT09IDApIHtcblx0XHRcdHJldHVybiAtMTtcblx0XHR9XG5cdFx0dmFyIG4gPSAwO1xuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuXHRcdFx0biA9IE51bWJlcihhcmd1bWVudHNbMV0pO1xuXHRcdFx0aWYgKG4gIT09IG4pIHsgLy8gc2hvcnRjdXQgZm9yIHZlcmlmeWluZyBpZiBpdCdzIE5hTlxuXHRcdFx0XHRuID0gMDtcblx0XHRcdH0gZWxzZSBpZiAobiAhPT0gMCAmJiBuICE9PSBJbmZpbml0eSAmJiBuICE9PSAtSW5maW5pdHkpIHtcblx0XHRcdFx0biA9IChuID4gMCB8fCAtMSkgKiBNYXRoLmZsb29yKE1hdGguYWJzKG4pKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKG4gPj0gbGVuKSB7XG5cdFx0XHRyZXR1cm4gLTE7XG5cdFx0fVxuXHRcdHZhciBrID0gbiA+PSAwID8gbiA6IE1hdGgubWF4KGxlbiAtIE1hdGguYWJzKG4pLCAwKTtcblx0XHRmb3IgKDsgayA8IGxlbjsgaysrKSB7XG5cdFx0XHRpZiAoayBpbiB0ICYmIHRba10gPT09IHNlYXJjaEVsZW1lbnQpIHtcblx0XHRcdFx0cmV0dXJuIGs7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiAtMTtcblx0fTtcbn1cblxuLy8gR3J1bmdleSBPYmplY3QuaXNGcm96ZW4gaGFja1xuaWYgKCFPYmplY3QuaXNGcm96ZW4pIHtcblx0T2JqZWN0LmlzRnJvemVuID0gZnVuY3Rpb24gKG9iaikge1xuXHRcdHZhciBrZXkgPSBcInR2NF90ZXN0X2Zyb3plbl9rZXlcIjtcblx0XHR3aGlsZSAob2JqLmhhc093blByb3BlcnR5KGtleSkpIHtcblx0XHRcdGtleSArPSBNYXRoLnJhbmRvbSgpO1xuXHRcdH1cblx0XHR0cnkge1xuXHRcdFx0b2JqW2tleV0gPSB0cnVlO1xuXHRcdFx0ZGVsZXRlIG9ialtrZXldO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0fTtcbn1cbi8vIEJhc2VkIG9uOiBodHRwczovL2dpdGh1Yi5jb20vZ2VyYWludGx1ZmYvdXJpLXRlbXBsYXRlcywgYnV0IHdpdGggYWxsIHRoZSBkZS1zdWJzdGl0dXRpb24gc3R1ZmYgcmVtb3ZlZFxuXG52YXIgdXJpVGVtcGxhdGVHbG9iYWxNb2RpZmllcnMgPSB7XG5cdFwiK1wiOiB0cnVlLFxuXHRcIiNcIjogdHJ1ZSxcblx0XCIuXCI6IHRydWUsXG5cdFwiL1wiOiB0cnVlLFxuXHRcIjtcIjogdHJ1ZSxcblx0XCI/XCI6IHRydWUsXG5cdFwiJlwiOiB0cnVlXG59O1xudmFyIHVyaVRlbXBsYXRlU3VmZmljZXMgPSB7XG5cdFwiKlwiOiB0cnVlXG59O1xuXG5mdW5jdGlvbiBub3RSZWFsbHlQZXJjZW50RW5jb2RlKHN0cmluZykge1xuXHRyZXR1cm4gZW5jb2RlVVJJKHN0cmluZykucmVwbGFjZSgvJTI1WzAtOV1bMC05XS9nLCBmdW5jdGlvbiAoZG91YmxlRW5jb2RlZCkge1xuXHRcdHJldHVybiBcIiVcIiArIGRvdWJsZUVuY29kZWQuc3Vic3RyaW5nKDMpO1xuXHR9KTtcbn1cblxuZnVuY3Rpb24gdXJpVGVtcGxhdGVTdWJzdGl0dXRpb24oc3BlYykge1xuXHR2YXIgbW9kaWZpZXIgPSBcIlwiO1xuXHRpZiAodXJpVGVtcGxhdGVHbG9iYWxNb2RpZmllcnNbc3BlYy5jaGFyQXQoMCldKSB7XG5cdFx0bW9kaWZpZXIgPSBzcGVjLmNoYXJBdCgwKTtcblx0XHRzcGVjID0gc3BlYy5zdWJzdHJpbmcoMSk7XG5cdH1cblx0dmFyIHNlcGFyYXRvciA9IFwiXCI7XG5cdHZhciBwcmVmaXggPSBcIlwiO1xuXHR2YXIgc2hvdWxkRXNjYXBlID0gdHJ1ZTtcblx0dmFyIHNob3dWYXJpYWJsZXMgPSBmYWxzZTtcblx0dmFyIHRyaW1FbXB0eVN0cmluZyA9IGZhbHNlO1xuXHRpZiAobW9kaWZpZXIgPT09ICcrJykge1xuXHRcdHNob3VsZEVzY2FwZSA9IGZhbHNlO1xuXHR9IGVsc2UgaWYgKG1vZGlmaWVyID09PSBcIi5cIikge1xuXHRcdHByZWZpeCA9IFwiLlwiO1xuXHRcdHNlcGFyYXRvciA9IFwiLlwiO1xuXHR9IGVsc2UgaWYgKG1vZGlmaWVyID09PSBcIi9cIikge1xuXHRcdHByZWZpeCA9IFwiL1wiO1xuXHRcdHNlcGFyYXRvciA9IFwiL1wiO1xuXHR9IGVsc2UgaWYgKG1vZGlmaWVyID09PSAnIycpIHtcblx0XHRwcmVmaXggPSBcIiNcIjtcblx0XHRzaG91bGRFc2NhcGUgPSBmYWxzZTtcblx0fSBlbHNlIGlmIChtb2RpZmllciA9PT0gJzsnKSB7XG5cdFx0cHJlZml4ID0gXCI7XCI7XG5cdFx0c2VwYXJhdG9yID0gXCI7XCI7XG5cdFx0c2hvd1ZhcmlhYmxlcyA9IHRydWU7XG5cdFx0dHJpbUVtcHR5U3RyaW5nID0gdHJ1ZTtcblx0fSBlbHNlIGlmIChtb2RpZmllciA9PT0gJz8nKSB7XG5cdFx0cHJlZml4ID0gXCI/XCI7XG5cdFx0c2VwYXJhdG9yID0gXCImXCI7XG5cdFx0c2hvd1ZhcmlhYmxlcyA9IHRydWU7XG5cdH0gZWxzZSBpZiAobW9kaWZpZXIgPT09ICcmJykge1xuXHRcdHByZWZpeCA9IFwiJlwiO1xuXHRcdHNlcGFyYXRvciA9IFwiJlwiO1xuXHRcdHNob3dWYXJpYWJsZXMgPSB0cnVlO1xuXHR9XG5cblx0dmFyIHZhck5hbWVzID0gW107XG5cdHZhciB2YXJMaXN0ID0gc3BlYy5zcGxpdChcIixcIik7XG5cdHZhciB2YXJTcGVjcyA9IFtdO1xuXHR2YXIgdmFyU3BlY01hcCA9IHt9O1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHZhckxpc3QubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgdmFyTmFtZSA9IHZhckxpc3RbaV07XG5cdFx0dmFyIHRydW5jYXRlID0gbnVsbDtcblx0XHRpZiAodmFyTmFtZS5pbmRleE9mKFwiOlwiKSAhPT0gLTEpIHtcblx0XHRcdHZhciBwYXJ0cyA9IHZhck5hbWUuc3BsaXQoXCI6XCIpO1xuXHRcdFx0dmFyTmFtZSA9IHBhcnRzWzBdO1xuXHRcdFx0dHJ1bmNhdGUgPSBwYXJzZUludChwYXJ0c1sxXSwgMTApO1xuXHRcdH1cblx0XHR2YXIgc3VmZmljZXMgPSB7fTtcblx0XHR3aGlsZSAodXJpVGVtcGxhdGVTdWZmaWNlc1t2YXJOYW1lLmNoYXJBdCh2YXJOYW1lLmxlbmd0aCAtIDEpXSkge1xuXHRcdFx0c3VmZmljZXNbdmFyTmFtZS5jaGFyQXQodmFyTmFtZS5sZW5ndGggLSAxKV0gPSB0cnVlO1xuXHRcdFx0dmFyTmFtZSA9IHZhck5hbWUuc3Vic3RyaW5nKDAsIHZhck5hbWUubGVuZ3RoIC0gMSk7XG5cdFx0fVxuXHRcdHZhciB2YXJTcGVjID0ge1xuXHRcdFx0dHJ1bmNhdGU6IHRydW5jYXRlLFxuXHRcdFx0bmFtZTogdmFyTmFtZSxcblx0XHRcdHN1ZmZpY2VzOiBzdWZmaWNlc1xuXHRcdH07XG5cdFx0dmFyU3BlY3MucHVzaCh2YXJTcGVjKTtcblx0XHR2YXJTcGVjTWFwW3Zhck5hbWVdID0gdmFyU3BlYztcblx0XHR2YXJOYW1lcy5wdXNoKHZhck5hbWUpO1xuXHR9XG5cdHZhciBzdWJGdW5jdGlvbiA9IGZ1bmN0aW9uICh2YWx1ZUZ1bmN0aW9uKSB7XG5cdFx0dmFyIHJlc3VsdCA9IFwiXCI7XG5cdFx0dmFyIHN0YXJ0SW5kZXggPSAwO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdmFyU3BlY3MubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciB2YXJTcGVjID0gdmFyU3BlY3NbaV07XG5cdFx0XHR2YXIgdmFsdWUgPSB2YWx1ZUZ1bmN0aW9uKHZhclNwZWMubmFtZSk7XG5cdFx0XHRpZiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCB8fCAoQXJyYXkuaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUubGVuZ3RoID09PSAwKSB8fCAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiBPYmplY3Qua2V5cyh2YWx1ZSkubGVuZ3RoID09PSAwKSkge1xuXHRcdFx0XHRzdGFydEluZGV4Kys7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGkgPT09IHN0YXJ0SW5kZXgpIHtcblx0XHRcdFx0cmVzdWx0ICs9IHByZWZpeDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJlc3VsdCArPSAoc2VwYXJhdG9yIHx8IFwiLFwiKTtcblx0XHRcdH1cblx0XHRcdGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuXHRcdFx0XHRpZiAoc2hvd1ZhcmlhYmxlcykge1xuXHRcdFx0XHRcdHJlc3VsdCArPSB2YXJTcGVjLm5hbWUgKyBcIj1cIjtcblx0XHRcdFx0fVxuXHRcdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IHZhbHVlLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdFx0aWYgKGogPiAwKSB7XG5cdFx0XHRcdFx0XHRyZXN1bHQgKz0gdmFyU3BlYy5zdWZmaWNlc1snKiddID8gKHNlcGFyYXRvciB8fCBcIixcIikgOiBcIixcIjtcblx0XHRcdFx0XHRcdGlmICh2YXJTcGVjLnN1ZmZpY2VzWycqJ10gJiYgc2hvd1ZhcmlhYmxlcykge1xuXHRcdFx0XHRcdFx0XHRyZXN1bHQgKz0gdmFyU3BlYy5uYW1lICsgXCI9XCI7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJlc3VsdCArPSBzaG91bGRFc2NhcGUgPyBlbmNvZGVVUklDb21wb25lbnQodmFsdWVbal0pLnJlcGxhY2UoLyEvZywgXCIlMjFcIikgOiBub3RSZWFsbHlQZXJjZW50RW5jb2RlKHZhbHVlW2pdKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdFx0aWYgKHNob3dWYXJpYWJsZXMgJiYgIXZhclNwZWMuc3VmZmljZXNbJyonXSkge1xuXHRcdFx0XHRcdHJlc3VsdCArPSB2YXJTcGVjLm5hbWUgKyBcIj1cIjtcblx0XHRcdFx0fVxuXHRcdFx0XHR2YXIgZmlyc3QgPSB0cnVlO1xuXHRcdFx0XHRmb3IgKHZhciBrZXkgaW4gdmFsdWUpIHtcblx0XHRcdFx0XHRpZiAoIWZpcnN0KSB7XG5cdFx0XHRcdFx0XHRyZXN1bHQgKz0gdmFyU3BlYy5zdWZmaWNlc1snKiddID8gKHNlcGFyYXRvciB8fCBcIixcIikgOiBcIixcIjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Zmlyc3QgPSBmYWxzZTtcblx0XHRcdFx0XHRyZXN1bHQgKz0gc2hvdWxkRXNjYXBlID8gZW5jb2RlVVJJQ29tcG9uZW50KGtleSkucmVwbGFjZSgvIS9nLCBcIiUyMVwiKSA6IG5vdFJlYWxseVBlcmNlbnRFbmNvZGUoa2V5KTtcblx0XHRcdFx0XHRyZXN1bHQgKz0gdmFyU3BlYy5zdWZmaWNlc1snKiddID8gJz0nIDogXCIsXCI7XG5cdFx0XHRcdFx0cmVzdWx0ICs9IHNob3VsZEVzY2FwZSA/IGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZVtrZXldKS5yZXBsYWNlKC8hL2csIFwiJTIxXCIpIDogbm90UmVhbGx5UGVyY2VudEVuY29kZSh2YWx1ZVtrZXldKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aWYgKHNob3dWYXJpYWJsZXMpIHtcblx0XHRcdFx0XHRyZXN1bHQgKz0gdmFyU3BlYy5uYW1lO1xuXHRcdFx0XHRcdGlmICghdHJpbUVtcHR5U3RyaW5nIHx8IHZhbHVlICE9PSBcIlwiKSB7XG5cdFx0XHRcdFx0XHRyZXN1bHQgKz0gXCI9XCI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICh2YXJTcGVjLnRydW5jYXRlICE9IG51bGwpIHtcblx0XHRcdFx0XHR2YWx1ZSA9IHZhbHVlLnN1YnN0cmluZygwLCB2YXJTcGVjLnRydW5jYXRlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXN1bHQgKz0gc2hvdWxkRXNjYXBlID8gZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKS5yZXBsYWNlKC8hL2csIFwiJTIxXCIpOiBub3RSZWFsbHlQZXJjZW50RW5jb2RlKHZhbHVlKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fTtcblx0c3ViRnVuY3Rpb24udmFyTmFtZXMgPSB2YXJOYW1lcztcblx0cmV0dXJuIHtcblx0XHRwcmVmaXg6IHByZWZpeCxcblx0XHRzdWJzdGl0dXRpb246IHN1YkZ1bmN0aW9uXG5cdH07XG59XG5cbmZ1bmN0aW9uIFVyaVRlbXBsYXRlKHRlbXBsYXRlKSB7XG5cdGlmICghKHRoaXMgaW5zdGFuY2VvZiBVcmlUZW1wbGF0ZSkpIHtcblx0XHRyZXR1cm4gbmV3IFVyaVRlbXBsYXRlKHRlbXBsYXRlKTtcblx0fVxuXHR2YXIgcGFydHMgPSB0ZW1wbGF0ZS5zcGxpdChcIntcIik7XG5cdHZhciB0ZXh0UGFydHMgPSBbcGFydHMuc2hpZnQoKV07XG5cdHZhciBwcmVmaXhlcyA9IFtdO1xuXHR2YXIgc3Vic3RpdHV0aW9ucyA9IFtdO1xuXHR2YXIgdmFyTmFtZXMgPSBbXTtcblx0d2hpbGUgKHBhcnRzLmxlbmd0aCA+IDApIHtcblx0XHR2YXIgcGFydCA9IHBhcnRzLnNoaWZ0KCk7XG5cdFx0dmFyIHNwZWMgPSBwYXJ0LnNwbGl0KFwifVwiKVswXTtcblx0XHR2YXIgcmVtYWluZGVyID0gcGFydC5zdWJzdHJpbmcoc3BlYy5sZW5ndGggKyAxKTtcblx0XHR2YXIgZnVuY3MgPSB1cmlUZW1wbGF0ZVN1YnN0aXR1dGlvbihzcGVjKTtcblx0XHRzdWJzdGl0dXRpb25zLnB1c2goZnVuY3Muc3Vic3RpdHV0aW9uKTtcblx0XHRwcmVmaXhlcy5wdXNoKGZ1bmNzLnByZWZpeCk7XG5cdFx0dGV4dFBhcnRzLnB1c2gocmVtYWluZGVyKTtcblx0XHR2YXJOYW1lcyA9IHZhck5hbWVzLmNvbmNhdChmdW5jcy5zdWJzdGl0dXRpb24udmFyTmFtZXMpO1xuXHR9XG5cdHRoaXMuZmlsbCA9IGZ1bmN0aW9uICh2YWx1ZUZ1bmN0aW9uKSB7XG5cdFx0dmFyIHJlc3VsdCA9IHRleHRQYXJ0c1swXTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHN1YnN0aXR1dGlvbnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBzdWJzdGl0dXRpb24gPSBzdWJzdGl0dXRpb25zW2ldO1xuXHRcdFx0cmVzdWx0ICs9IHN1YnN0aXR1dGlvbih2YWx1ZUZ1bmN0aW9uKTtcblx0XHRcdHJlc3VsdCArPSB0ZXh0UGFydHNbaSArIDFdO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9O1xuXHR0aGlzLnZhck5hbWVzID0gdmFyTmFtZXM7XG5cdHRoaXMudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcbn1cblVyaVRlbXBsYXRlLnByb3RvdHlwZSA9IHtcblx0dG9TdHJpbmc6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gdGhpcy50ZW1wbGF0ZTtcblx0fSxcblx0ZmlsbEZyb21PYmplY3Q6IGZ1bmN0aW9uIChvYmopIHtcblx0XHRyZXR1cm4gdGhpcy5maWxsKGZ1bmN0aW9uICh2YXJOYW1lKSB7XG5cdFx0XHRyZXR1cm4gb2JqW3Zhck5hbWVdO1xuXHRcdH0pO1xuXHR9XG59O1xudmFyIFZhbGlkYXRvckNvbnRleHQgPSBmdW5jdGlvbiBWYWxpZGF0b3JDb250ZXh0KHBhcmVudCwgY29sbGVjdE11bHRpcGxlLCBlcnJvck1lc3NhZ2VzLCBjaGVja1JlY3Vyc2l2ZSwgdHJhY2tVbmtub3duUHJvcGVydGllcykge1xuXHR0aGlzLm1pc3NpbmcgPSBbXTtcblx0dGhpcy5taXNzaW5nTWFwID0ge307XG5cdHRoaXMuZm9ybWF0VmFsaWRhdG9ycyA9IHBhcmVudCA/IE9iamVjdC5jcmVhdGUocGFyZW50LmZvcm1hdFZhbGlkYXRvcnMpIDoge307XG5cdHRoaXMuc2NoZW1hcyA9IHBhcmVudCA/IE9iamVjdC5jcmVhdGUocGFyZW50LnNjaGVtYXMpIDoge307XG5cdHRoaXMuY29sbGVjdE11bHRpcGxlID0gY29sbGVjdE11bHRpcGxlO1xuXHR0aGlzLmVycm9ycyA9IFtdO1xuXHR0aGlzLmhhbmRsZUVycm9yID0gY29sbGVjdE11bHRpcGxlID8gdGhpcy5jb2xsZWN0RXJyb3IgOiB0aGlzLnJldHVybkVycm9yO1xuXHRpZiAoY2hlY2tSZWN1cnNpdmUpIHtcblx0XHR0aGlzLmNoZWNrUmVjdXJzaXZlID0gdHJ1ZTtcblx0XHR0aGlzLnNjYW5uZWQgPSBbXTtcblx0XHR0aGlzLnNjYW5uZWRGcm96ZW4gPSBbXTtcblx0XHR0aGlzLnNjYW5uZWRGcm96ZW5TY2hlbWFzID0gW107XG5cdFx0dGhpcy5zY2FubmVkRnJvemVuVmFsaWRhdGlvbkVycm9ycyA9IFtdO1xuXHRcdHRoaXMudmFsaWRhdGVkU2NoZW1hc0tleSA9ICd0djRfdmFsaWRhdGlvbl9pZCc7XG5cdFx0dGhpcy52YWxpZGF0aW9uRXJyb3JzS2V5ID0gJ3R2NF92YWxpZGF0aW9uX2Vycm9yc19pZCc7XG5cdH1cblx0aWYgKHRyYWNrVW5rbm93blByb3BlcnRpZXMpIHtcblx0XHR0aGlzLnRyYWNrVW5rbm93blByb3BlcnRpZXMgPSB0cnVlO1xuXHRcdHRoaXMua25vd25Qcm9wZXJ0eVBhdGhzID0ge307XG5cdFx0dGhpcy51bmtub3duUHJvcGVydHlQYXRocyA9IHt9O1xuXHR9XG5cdHRoaXMuZXJyb3JNZXNzYWdlcyA9IGVycm9yTWVzc2FnZXM7XG5cdHRoaXMuZGVmaW5lZEtleXdvcmRzID0ge307XG5cdGlmIChwYXJlbnQpIHtcblx0XHRmb3IgKHZhciBrZXkgaW4gcGFyZW50LmRlZmluZWRLZXl3b3Jkcykge1xuXHRcdFx0dGhpcy5kZWZpbmVkS2V5d29yZHNba2V5XSA9IHBhcmVudC5kZWZpbmVkS2V5d29yZHNba2V5XS5zbGljZSgwKTtcblx0XHR9XG5cdH1cbn07XG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5kZWZpbmVLZXl3b3JkID0gZnVuY3Rpb24gKGtleXdvcmQsIGtleXdvcmRGdW5jdGlvbikge1xuXHR0aGlzLmRlZmluZWRLZXl3b3Jkc1trZXl3b3JkXSA9IHRoaXMuZGVmaW5lZEtleXdvcmRzW2tleXdvcmRdIHx8IFtdO1xuXHR0aGlzLmRlZmluZWRLZXl3b3Jkc1trZXl3b3JkXS5wdXNoKGtleXdvcmRGdW5jdGlvbik7XG59O1xuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUuY3JlYXRlRXJyb3IgPSBmdW5jdGlvbiAoY29kZSwgbWVzc2FnZVBhcmFtcywgZGF0YVBhdGgsIHNjaGVtYVBhdGgsIHN1YkVycm9ycykge1xuXHR2YXIgbWVzc2FnZVRlbXBsYXRlID0gdGhpcy5lcnJvck1lc3NhZ2VzW2NvZGVdIHx8IEVycm9yTWVzc2FnZXNEZWZhdWx0W2NvZGVdO1xuXHRpZiAodHlwZW9mIG1lc3NhZ2VUZW1wbGF0ZSAhPT0gJ3N0cmluZycpIHtcblx0XHRyZXR1cm4gbmV3IFZhbGlkYXRpb25FcnJvcihjb2RlLCBcIlVua25vd24gZXJyb3IgY29kZSBcIiArIGNvZGUgKyBcIjogXCIgKyBKU09OLnN0cmluZ2lmeShtZXNzYWdlUGFyYW1zKSwgbWVzc2FnZVBhcmFtcywgZGF0YVBhdGgsIHNjaGVtYVBhdGgsIHN1YkVycm9ycyk7XG5cdH1cblx0Ly8gQWRhcHRlZCBmcm9tIENyb2NrZm9yZCdzIHN1cHBsYW50KClcblx0dmFyIG1lc3NhZ2UgPSBtZXNzYWdlVGVtcGxhdGUucmVwbGFjZSgvXFx7KFtee31dKilcXH0vZywgZnVuY3Rpb24gKHdob2xlLCB2YXJOYW1lKSB7XG5cdFx0dmFyIHN1YlZhbHVlID0gbWVzc2FnZVBhcmFtc1t2YXJOYW1lXTtcblx0XHRyZXR1cm4gdHlwZW9mIHN1YlZhbHVlID09PSAnc3RyaW5nJyB8fCB0eXBlb2Ygc3ViVmFsdWUgPT09ICdudW1iZXInID8gc3ViVmFsdWUgOiB3aG9sZTtcblx0fSk7XG5cdHJldHVybiBuZXcgVmFsaWRhdGlvbkVycm9yKGNvZGUsIG1lc3NhZ2UsIG1lc3NhZ2VQYXJhbXMsIGRhdGFQYXRoLCBzY2hlbWFQYXRoLCBzdWJFcnJvcnMpO1xufTtcblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnJldHVybkVycm9yID0gZnVuY3Rpb24gKGVycm9yKSB7XG5cdHJldHVybiBlcnJvcjtcbn07XG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5jb2xsZWN0RXJyb3IgPSBmdW5jdGlvbiAoZXJyb3IpIHtcblx0aWYgKGVycm9yKSB7XG5cdFx0dGhpcy5lcnJvcnMucHVzaChlcnJvcik7XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUucHJlZml4RXJyb3JzID0gZnVuY3Rpb24gKHN0YXJ0SW5kZXgsIGRhdGFQYXRoLCBzY2hlbWFQYXRoKSB7XG5cdGZvciAodmFyIGkgPSBzdGFydEluZGV4OyBpIDwgdGhpcy5lcnJvcnMubGVuZ3RoOyBpKyspIHtcblx0XHR0aGlzLmVycm9yc1tpXSA9IHRoaXMuZXJyb3JzW2ldLnByZWZpeFdpdGgoZGF0YVBhdGgsIHNjaGVtYVBhdGgpO1xuXHR9XG5cdHJldHVybiB0aGlzO1xufTtcblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLmJhblVua25vd25Qcm9wZXJ0aWVzID0gZnVuY3Rpb24gKCkge1xuXHRmb3IgKHZhciB1bmtub3duUGF0aCBpbiB0aGlzLnVua25vd25Qcm9wZXJ0eVBhdGhzKSB7XG5cdFx0dmFyIGVycm9yID0gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLlVOS05PV05fUFJPUEVSVFksIHtwYXRoOiB1bmtub3duUGF0aH0sIHVua25vd25QYXRoLCBcIlwiKTtcblx0XHR2YXIgcmVzdWx0ID0gdGhpcy5oYW5kbGVFcnJvcihlcnJvcik7XG5cdFx0aWYgKHJlc3VsdCkge1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5hZGRGb3JtYXQgPSBmdW5jdGlvbiAoZm9ybWF0LCB2YWxpZGF0b3IpIHtcblx0aWYgKHR5cGVvZiBmb3JtYXQgPT09ICdvYmplY3QnKSB7XG5cdFx0Zm9yICh2YXIga2V5IGluIGZvcm1hdCkge1xuXHRcdFx0dGhpcy5hZGRGb3JtYXQoa2V5LCBmb3JtYXRba2V5XSk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdHRoaXMuZm9ybWF0VmFsaWRhdG9yc1tmb3JtYXRdID0gdmFsaWRhdG9yO1xufTtcblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnJlc29sdmVSZWZzID0gZnVuY3Rpb24gKHNjaGVtYSwgdXJsSGlzdG9yeSkge1xuXHRpZiAoc2NoZW1hWyckcmVmJ10gIT09IHVuZGVmaW5lZCkge1xuXHRcdHVybEhpc3RvcnkgPSB1cmxIaXN0b3J5IHx8IHt9O1xuXHRcdGlmICh1cmxIaXN0b3J5W3NjaGVtYVsnJHJlZiddXSkge1xuXHRcdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5DSVJDVUxBUl9SRUZFUkVOQ0UsIHt1cmxzOiBPYmplY3Qua2V5cyh1cmxIaXN0b3J5KS5qb2luKCcsICcpfSwgJycsICcnKTtcblx0XHR9XG5cdFx0dXJsSGlzdG9yeVtzY2hlbWFbJyRyZWYnXV0gPSB0cnVlO1xuXHRcdHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKHNjaGVtYVsnJHJlZiddLCB1cmxIaXN0b3J5KTtcblx0fVxuXHRyZXR1cm4gc2NoZW1hO1xufTtcblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLmdldFNjaGVtYSA9IGZ1bmN0aW9uICh1cmwsIHVybEhpc3RvcnkpIHtcblx0dmFyIHNjaGVtYTtcblx0aWYgKHRoaXMuc2NoZW1hc1t1cmxdICE9PSB1bmRlZmluZWQpIHtcblx0XHRzY2hlbWEgPSB0aGlzLnNjaGVtYXNbdXJsXTtcblx0XHRyZXR1cm4gdGhpcy5yZXNvbHZlUmVmcyhzY2hlbWEsIHVybEhpc3RvcnkpO1xuXHR9XG5cdHZhciBiYXNlVXJsID0gdXJsO1xuXHR2YXIgZnJhZ21lbnQgPSBcIlwiO1xuXHRpZiAodXJsLmluZGV4T2YoJyMnKSAhPT0gLTEpIHtcblx0XHRmcmFnbWVudCA9IHVybC5zdWJzdHJpbmcodXJsLmluZGV4T2YoXCIjXCIpICsgMSk7XG5cdFx0YmFzZVVybCA9IHVybC5zdWJzdHJpbmcoMCwgdXJsLmluZGV4T2YoXCIjXCIpKTtcblx0fVxuXHRpZiAodHlwZW9mIHRoaXMuc2NoZW1hc1tiYXNlVXJsXSA9PT0gJ29iamVjdCcpIHtcblx0XHRzY2hlbWEgPSB0aGlzLnNjaGVtYXNbYmFzZVVybF07XG5cdFx0dmFyIHBvaW50ZXJQYXRoID0gZGVjb2RlVVJJQ29tcG9uZW50KGZyYWdtZW50KTtcblx0XHRpZiAocG9pbnRlclBhdGggPT09IFwiXCIpIHtcblx0XHRcdHJldHVybiB0aGlzLnJlc29sdmVSZWZzKHNjaGVtYSwgdXJsSGlzdG9yeSk7XG5cdFx0fSBlbHNlIGlmIChwb2ludGVyUGF0aC5jaGFyQXQoMCkgIT09IFwiL1wiKSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0XHR2YXIgcGFydHMgPSBwb2ludGVyUGF0aC5zcGxpdChcIi9cIikuc2xpY2UoMSk7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwYXJ0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGNvbXBvbmVudCA9IHBhcnRzW2ldLnJlcGxhY2UoL34xL2csIFwiL1wiKS5yZXBsYWNlKC9+MC9nLCBcIn5cIik7XG5cdFx0XHRpZiAoc2NoZW1hW2NvbXBvbmVudF0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRzY2hlbWEgPSB1bmRlZmluZWQ7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdFx0c2NoZW1hID0gc2NoZW1hW2NvbXBvbmVudF07XG5cdFx0fVxuXHRcdGlmIChzY2hlbWEgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cmV0dXJuIHRoaXMucmVzb2x2ZVJlZnMoc2NoZW1hLCB1cmxIaXN0b3J5KTtcblx0XHR9XG5cdH1cblx0aWYgKHRoaXMubWlzc2luZ1tiYXNlVXJsXSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0dGhpcy5taXNzaW5nLnB1c2goYmFzZVVybCk7XG5cdFx0dGhpcy5taXNzaW5nW2Jhc2VVcmxdID0gYmFzZVVybDtcblx0XHR0aGlzLm1pc3NpbmdNYXBbYmFzZVVybF0gPSBiYXNlVXJsO1xuXHR9XG59O1xuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUuc2VhcmNoU2NoZW1hcyA9IGZ1bmN0aW9uIChzY2hlbWEsIHVybCkge1xuXHRpZiAoc2NoZW1hICYmIHR5cGVvZiBzY2hlbWEgPT09IFwib2JqZWN0XCIpIHtcblx0XHRpZiAodHlwZW9mIHNjaGVtYS5pZCA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0aWYgKGlzVHJ1c3RlZFVybCh1cmwsIHNjaGVtYS5pZCkpIHtcblx0XHRcdFx0aWYgKHRoaXMuc2NoZW1hc1tzY2hlbWEuaWRdID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHR0aGlzLnNjaGVtYXNbc2NoZW1hLmlkXSA9IHNjaGVtYTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRmb3IgKHZhciBrZXkgaW4gc2NoZW1hKSB7XG5cdFx0XHRpZiAoa2V5ICE9PSBcImVudW1cIikge1xuXHRcdFx0XHRpZiAodHlwZW9mIHNjaGVtYVtrZXldID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRcdFx0dGhpcy5zZWFyY2hTY2hlbWFzKHNjaGVtYVtrZXldLCB1cmwpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGtleSA9PT0gXCIkcmVmXCIpIHtcblx0XHRcdFx0XHR2YXIgdXJpID0gZ2V0RG9jdW1lbnRVcmkoc2NoZW1hW2tleV0pO1xuXHRcdFx0XHRcdGlmICh1cmkgJiYgdGhpcy5zY2hlbWFzW3VyaV0gPT09IHVuZGVmaW5lZCAmJiB0aGlzLm1pc3NpbmdNYXBbdXJpXSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHR0aGlzLm1pc3NpbmdNYXBbdXJpXSA9IHVyaTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cbn07XG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5hZGRTY2hlbWEgPSBmdW5jdGlvbiAodXJsLCBzY2hlbWEpIHtcblx0Ly9vdmVybG9hZFxuXHRpZiAodHlwZW9mIHVybCAhPT0gJ3N0cmluZycgfHwgdHlwZW9mIHNjaGVtYSA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRpZiAodHlwZW9mIHVybCA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHVybC5pZCA9PT0gJ3N0cmluZycpIHtcblx0XHRcdHNjaGVtYSA9IHVybDtcblx0XHRcdHVybCA9IHNjaGVtYS5pZDtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHR9XG5cdGlmICh1cmwgPT09IGdldERvY3VtZW50VXJpKHVybCkgKyBcIiNcIikge1xuXHRcdC8vIFJlbW92ZSBlbXB0eSBmcmFnbWVudFxuXHRcdHVybCA9IGdldERvY3VtZW50VXJpKHVybCk7XG5cdH1cblx0dGhpcy5zY2hlbWFzW3VybF0gPSBzY2hlbWE7XG5cdGRlbGV0ZSB0aGlzLm1pc3NpbmdNYXBbdXJsXTtcblx0bm9ybVNjaGVtYShzY2hlbWEsIHVybCk7XG5cdHRoaXMuc2VhcmNoU2NoZW1hcyhzY2hlbWEsIHVybCk7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5nZXRTY2hlbWFNYXAgPSBmdW5jdGlvbiAoKSB7XG5cdHZhciBtYXAgPSB7fTtcblx0Zm9yICh2YXIga2V5IGluIHRoaXMuc2NoZW1hcykge1xuXHRcdG1hcFtrZXldID0gdGhpcy5zY2hlbWFzW2tleV07XG5cdH1cblx0cmV0dXJuIG1hcDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLmdldFNjaGVtYVVyaXMgPSBmdW5jdGlvbiAoZmlsdGVyUmVnRXhwKSB7XG5cdHZhciBsaXN0ID0gW107XG5cdGZvciAodmFyIGtleSBpbiB0aGlzLnNjaGVtYXMpIHtcblx0XHRpZiAoIWZpbHRlclJlZ0V4cCB8fCBmaWx0ZXJSZWdFeHAudGVzdChrZXkpKSB7XG5cdFx0XHRsaXN0LnB1c2goa2V5KTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGxpc3Q7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS5nZXRNaXNzaW5nVXJpcyA9IGZ1bmN0aW9uIChmaWx0ZXJSZWdFeHApIHtcblx0dmFyIGxpc3QgPSBbXTtcblx0Zm9yICh2YXIga2V5IGluIHRoaXMubWlzc2luZ01hcCkge1xuXHRcdGlmICghZmlsdGVyUmVnRXhwIHx8IGZpbHRlclJlZ0V4cC50ZXN0KGtleSkpIHtcblx0XHRcdGxpc3QucHVzaChrZXkpO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gbGlzdDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLmRyb3BTY2hlbWFzID0gZnVuY3Rpb24gKCkge1xuXHR0aGlzLnNjaGVtYXMgPSB7fTtcblx0dGhpcy5yZXNldCgpO1xufTtcblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gKCkge1xuXHR0aGlzLm1pc3NpbmcgPSBbXTtcblx0dGhpcy5taXNzaW5nTWFwID0ge307XG5cdHRoaXMuZXJyb3JzID0gW107XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZUFsbCA9IGZ1bmN0aW9uIChkYXRhLCBzY2hlbWEsIGRhdGFQYXRoUGFydHMsIHNjaGVtYVBhdGhQYXJ0cywgZGF0YVBvaW50ZXJQYXRoKSB7XG5cdHZhciB0b3BMZXZlbDtcblx0c2NoZW1hID0gdGhpcy5yZXNvbHZlUmVmcyhzY2hlbWEpO1xuXHRpZiAoIXNjaGVtYSkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9IGVsc2UgaWYgKHNjaGVtYSBpbnN0YW5jZW9mIFZhbGlkYXRpb25FcnJvcikge1xuXHRcdHRoaXMuZXJyb3JzLnB1c2goc2NoZW1hKTtcblx0XHRyZXR1cm4gc2NoZW1hO1xuXHR9XG5cblx0dmFyIHN0YXJ0RXJyb3JDb3VudCA9IHRoaXMuZXJyb3JzLmxlbmd0aDtcblx0dmFyIGZyb3plbkluZGV4LCBzY2FubmVkRnJvemVuU2NoZW1hSW5kZXggPSBudWxsLCBzY2FubmVkU2NoZW1hc0luZGV4ID0gbnVsbDtcblx0aWYgKHRoaXMuY2hlY2tSZWN1cnNpdmUgJiYgZGF0YSAmJiB0eXBlb2YgZGF0YSA9PT0gJ29iamVjdCcpIHtcblx0XHR0b3BMZXZlbCA9ICF0aGlzLnNjYW5uZWQubGVuZ3RoO1xuXHRcdGlmIChkYXRhW3RoaXMudmFsaWRhdGVkU2NoZW1hc0tleV0pIHtcblx0XHRcdHZhciBzY2hlbWFJbmRleCA9IGRhdGFbdGhpcy52YWxpZGF0ZWRTY2hlbWFzS2V5XS5pbmRleE9mKHNjaGVtYSk7XG5cdFx0XHRpZiAoc2NoZW1hSW5kZXggIT09IC0xKSB7XG5cdFx0XHRcdHRoaXMuZXJyb3JzID0gdGhpcy5lcnJvcnMuY29uY2F0KGRhdGFbdGhpcy52YWxpZGF0aW9uRXJyb3JzS2V5XVtzY2hlbWFJbmRleF0pO1xuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKE9iamVjdC5pc0Zyb3plbihkYXRhKSkge1xuXHRcdFx0ZnJvemVuSW5kZXggPSB0aGlzLnNjYW5uZWRGcm96ZW4uaW5kZXhPZihkYXRhKTtcblx0XHRcdGlmIChmcm96ZW5JbmRleCAhPT0gLTEpIHtcblx0XHRcdFx0dmFyIGZyb3plblNjaGVtYUluZGV4ID0gdGhpcy5zY2FubmVkRnJvemVuU2NoZW1hc1tmcm96ZW5JbmRleF0uaW5kZXhPZihzY2hlbWEpO1xuXHRcdFx0XHRpZiAoZnJvemVuU2NoZW1hSW5kZXggIT09IC0xKSB7XG5cdFx0XHRcdFx0dGhpcy5lcnJvcnMgPSB0aGlzLmVycm9ycy5jb25jYXQodGhpcy5zY2FubmVkRnJvemVuVmFsaWRhdGlvbkVycm9yc1tmcm96ZW5JbmRleF1bZnJvemVuU2NoZW1hSW5kZXhdKTtcblx0XHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHR0aGlzLnNjYW5uZWQucHVzaChkYXRhKTtcblx0XHRpZiAoT2JqZWN0LmlzRnJvemVuKGRhdGEpKSB7XG5cdFx0XHRpZiAoZnJvemVuSW5kZXggPT09IC0xKSB7XG5cdFx0XHRcdGZyb3plbkluZGV4ID0gdGhpcy5zY2FubmVkRnJvemVuLmxlbmd0aDtcblx0XHRcdFx0dGhpcy5zY2FubmVkRnJvemVuLnB1c2goZGF0YSk7XG5cdFx0XHRcdHRoaXMuc2Nhbm5lZEZyb3plblNjaGVtYXMucHVzaChbXSk7XG5cdFx0XHR9XG5cdFx0XHRzY2FubmVkRnJvemVuU2NoZW1hSW5kZXggPSB0aGlzLnNjYW5uZWRGcm96ZW5TY2hlbWFzW2Zyb3plbkluZGV4XS5sZW5ndGg7XG5cdFx0XHR0aGlzLnNjYW5uZWRGcm96ZW5TY2hlbWFzW2Zyb3plbkluZGV4XVtzY2FubmVkRnJvemVuU2NoZW1hSW5kZXhdID0gc2NoZW1hO1xuXHRcdFx0dGhpcy5zY2FubmVkRnJvemVuVmFsaWRhdGlvbkVycm9yc1tmcm96ZW5JbmRleF1bc2Nhbm5lZEZyb3plblNjaGVtYUluZGV4XSA9IFtdO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAoIWRhdGFbdGhpcy52YWxpZGF0ZWRTY2hlbWFzS2V5XSkge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkYXRhLCB0aGlzLnZhbGlkYXRlZFNjaGVtYXNLZXksIHtcblx0XHRcdFx0XHRcdHZhbHVlOiBbXSxcblx0XHRcdFx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkYXRhLCB0aGlzLnZhbGlkYXRpb25FcnJvcnNLZXksIHtcblx0XHRcdFx0XHRcdHZhbHVlOiBbXSxcblx0XHRcdFx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0Ly9JRSA3Lzggd29ya2Fyb3VuZFxuXHRcdFx0XHRcdGRhdGFbdGhpcy52YWxpZGF0ZWRTY2hlbWFzS2V5XSA9IFtdO1xuXHRcdFx0XHRcdGRhdGFbdGhpcy52YWxpZGF0aW9uRXJyb3JzS2V5XSA9IFtdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRzY2FubmVkU2NoZW1hc0luZGV4ID0gZGF0YVt0aGlzLnZhbGlkYXRlZFNjaGVtYXNLZXldLmxlbmd0aDtcblx0XHRcdGRhdGFbdGhpcy52YWxpZGF0ZWRTY2hlbWFzS2V5XVtzY2FubmVkU2NoZW1hc0luZGV4XSA9IHNjaGVtYTtcblx0XHRcdGRhdGFbdGhpcy52YWxpZGF0aW9uRXJyb3JzS2V5XVtzY2FubmVkU2NoZW1hc0luZGV4XSA9IFtdO1xuXHRcdH1cblx0fVxuXG5cdHZhciBlcnJvckNvdW50ID0gdGhpcy5lcnJvcnMubGVuZ3RoO1xuXHR2YXIgZXJyb3IgPSB0aGlzLnZhbGlkYXRlQmFzaWMoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZU51bWVyaWMoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZVN0cmluZyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCB0aGlzLnZhbGlkYXRlQXJyYXkoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZU9iamVjdChkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCB0aGlzLnZhbGlkYXRlQ29tYmluYXRpb25zKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVIeXBlcm1lZGlhKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVGb3JtYXQoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZURlZmluZWRLZXl3b3JkcyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCBudWxsO1xuXG5cdGlmICh0b3BMZXZlbCkge1xuXHRcdHdoaWxlICh0aGlzLnNjYW5uZWQubGVuZ3RoKSB7XG5cdFx0XHR2YXIgaXRlbSA9IHRoaXMuc2Nhbm5lZC5wb3AoKTtcblx0XHRcdGRlbGV0ZSBpdGVtW3RoaXMudmFsaWRhdGVkU2NoZW1hc0tleV07XG5cdFx0fVxuXHRcdHRoaXMuc2Nhbm5lZEZyb3plbiA9IFtdO1xuXHRcdHRoaXMuc2Nhbm5lZEZyb3plblNjaGVtYXMgPSBbXTtcblx0fVxuXG5cdGlmIChlcnJvciB8fCBlcnJvckNvdW50ICE9PSB0aGlzLmVycm9ycy5sZW5ndGgpIHtcblx0XHR3aGlsZSAoKGRhdGFQYXRoUGFydHMgJiYgZGF0YVBhdGhQYXJ0cy5sZW5ndGgpIHx8IChzY2hlbWFQYXRoUGFydHMgJiYgc2NoZW1hUGF0aFBhcnRzLmxlbmd0aCkpIHtcblx0XHRcdHZhciBkYXRhUGFydCA9IChkYXRhUGF0aFBhcnRzICYmIGRhdGFQYXRoUGFydHMubGVuZ3RoKSA/IFwiXCIgKyBkYXRhUGF0aFBhcnRzLnBvcCgpIDogbnVsbDtcblx0XHRcdHZhciBzY2hlbWFQYXJ0ID0gKHNjaGVtYVBhdGhQYXJ0cyAmJiBzY2hlbWFQYXRoUGFydHMubGVuZ3RoKSA/IFwiXCIgKyBzY2hlbWFQYXRoUGFydHMucG9wKCkgOiBudWxsO1xuXHRcdFx0aWYgKGVycm9yKSB7XG5cdFx0XHRcdGVycm9yID0gZXJyb3IucHJlZml4V2l0aChkYXRhUGFydCwgc2NoZW1hUGFydCk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLnByZWZpeEVycm9ycyhlcnJvckNvdW50LCBkYXRhUGFydCwgc2NoZW1hUGFydCk7XG5cdFx0fVxuXHR9XG5cblx0aWYgKHNjYW5uZWRGcm96ZW5TY2hlbWFJbmRleCAhPT0gbnVsbCkge1xuXHRcdHRoaXMuc2Nhbm5lZEZyb3plblZhbGlkYXRpb25FcnJvcnNbZnJvemVuSW5kZXhdW3NjYW5uZWRGcm96ZW5TY2hlbWFJbmRleF0gPSB0aGlzLmVycm9ycy5zbGljZShzdGFydEVycm9yQ291bnQpO1xuXHR9IGVsc2UgaWYgKHNjYW5uZWRTY2hlbWFzSW5kZXggIT09IG51bGwpIHtcblx0XHRkYXRhW3RoaXMudmFsaWRhdGlvbkVycm9yc0tleV1bc2Nhbm5lZFNjaGVtYXNJbmRleF0gPSB0aGlzLmVycm9ycy5zbGljZShzdGFydEVycm9yQ291bnQpO1xuXHR9XG5cblx0cmV0dXJuIHRoaXMuaGFuZGxlRXJyb3IoZXJyb3IpO1xufTtcblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlRm9ybWF0ID0gZnVuY3Rpb24gKGRhdGEsIHNjaGVtYSkge1xuXHRpZiAodHlwZW9mIHNjaGVtYS5mb3JtYXQgIT09ICdzdHJpbmcnIHx8ICF0aGlzLmZvcm1hdFZhbGlkYXRvcnNbc2NoZW1hLmZvcm1hdF0pIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHR2YXIgZXJyb3JNZXNzYWdlID0gdGhpcy5mb3JtYXRWYWxpZGF0b3JzW3NjaGVtYS5mb3JtYXRdLmNhbGwobnVsbCwgZGF0YSwgc2NoZW1hKTtcblx0aWYgKHR5cGVvZiBlcnJvck1lc3NhZ2UgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBlcnJvck1lc3NhZ2UgPT09ICdudW1iZXInKSB7XG5cdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5GT1JNQVRfQ1VTVE9NLCB7bWVzc2FnZTogZXJyb3JNZXNzYWdlfSkucHJlZml4V2l0aChudWxsLCBcImZvcm1hdFwiKTtcblx0fSBlbHNlIGlmIChlcnJvck1lc3NhZ2UgJiYgdHlwZW9mIGVycm9yTWVzc2FnZSA9PT0gJ29iamVjdCcpIHtcblx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLkZPUk1BVF9DVVNUT00sIHttZXNzYWdlOiBlcnJvck1lc3NhZ2UubWVzc2FnZSB8fCBcIj9cIn0sIGVycm9yTWVzc2FnZS5kYXRhUGF0aCB8fCBudWxsLCBlcnJvck1lc3NhZ2Uuc2NoZW1hUGF0aCB8fCBcIi9mb3JtYXRcIik7XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVEZWZpbmVkS2V5d29yZHMgPSBmdW5jdGlvbiAoZGF0YSwgc2NoZW1hKSB7XG5cdGZvciAodmFyIGtleSBpbiB0aGlzLmRlZmluZWRLZXl3b3Jkcykge1xuXHRcdGlmICh0eXBlb2Ygc2NoZW1hW2tleV0gPT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cdFx0dmFyIHZhbGlkYXRpb25GdW5jdGlvbnMgPSB0aGlzLmRlZmluZWRLZXl3b3Jkc1trZXldO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdmFsaWRhdGlvbkZ1bmN0aW9ucy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGZ1bmMgPSB2YWxpZGF0aW9uRnVuY3Rpb25zW2ldO1xuXHRcdFx0dmFyIHJlc3VsdCA9IGZ1bmMoZGF0YSwgc2NoZW1hW2tleV0sIHNjaGVtYSk7XG5cdFx0XHRpZiAodHlwZW9mIHJlc3VsdCA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHJlc3VsdCA9PT0gJ251bWJlcicpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5LRVlXT1JEX0NVU1RPTSwge2tleToga2V5LCBtZXNzYWdlOiByZXN1bHR9KS5wcmVmaXhXaXRoKG51bGwsIFwiZm9ybWF0XCIpO1xuXHRcdFx0fSBlbHNlIGlmIChyZXN1bHQgJiYgdHlwZW9mIHJlc3VsdCA9PT0gJ29iamVjdCcpIHtcblx0XHRcdFx0dmFyIGNvZGUgPSByZXN1bHQuY29kZSB8fCBFcnJvckNvZGVzLktFWVdPUkRfQ1VTVE9NO1xuXHRcdFx0XHRpZiAodHlwZW9mIGNvZGUgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRcdFx0aWYgKCFFcnJvckNvZGVzW2NvZGVdKSB7XG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ1VuZGVmaW5lZCBlcnJvciBjb2RlICh1c2UgZGVmaW5lRXJyb3IpOiAnICsgY29kZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvZGUgPSBFcnJvckNvZGVzW2NvZGVdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHZhciBtZXNzYWdlUGFyYW1zID0gKHR5cGVvZiByZXN1bHQubWVzc2FnZSA9PT0gJ29iamVjdCcpID8gcmVzdWx0Lm1lc3NhZ2UgOiB7a2V5OiBrZXksIG1lc3NhZ2U6IHJlc3VsdC5tZXNzYWdlIHx8IFwiP1wifTtcblx0XHRcdFx0dmFyIHNjaGVtYVBhdGggPSByZXN1bHQuc2NoZW1hUGF0aCB8fCggXCIvXCIgKyBrZXkucmVwbGFjZSgvfi9nLCAnfjAnKS5yZXBsYWNlKC9cXC8vZywgJ34xJykpO1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihjb2RlLCBtZXNzYWdlUGFyYW1zLCByZXN1bHQuZGF0YVBhdGggfHwgbnVsbCwgc2NoZW1hUGF0aCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuZnVuY3Rpb24gcmVjdXJzaXZlQ29tcGFyZShBLCBCKSB7XG5cdGlmIChBID09PSBCKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblx0aWYgKHR5cGVvZiBBID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBCID09PSBcIm9iamVjdFwiKSB7XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkoQSkgIT09IEFycmF5LmlzQXJyYXkoQikpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoQSkpIHtcblx0XHRcdGlmIChBLmxlbmd0aCAhPT0gQi5sZW5ndGgpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBBLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmICghcmVjdXJzaXZlQ29tcGFyZShBW2ldLCBCW2ldKSkge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIga2V5O1xuXHRcdFx0Zm9yIChrZXkgaW4gQSkge1xuXHRcdFx0XHRpZiAoQltrZXldID09PSB1bmRlZmluZWQgJiYgQVtrZXldICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGZvciAoa2V5IGluIEIpIHtcblx0XHRcdFx0aWYgKEFba2V5XSA9PT0gdW5kZWZpbmVkICYmIEJba2V5XSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRmb3IgKGtleSBpbiBBKSB7XG5cdFx0XHRcdGlmICghcmVjdXJzaXZlQ29tcGFyZShBW2tleV0sIEJba2V5XSkpIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufVxuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZUJhc2ljID0gZnVuY3Rpb24gdmFsaWRhdGVCYXNpYyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aCkge1xuXHR2YXIgZXJyb3I7XG5cdGlmIChlcnJvciA9IHRoaXMudmFsaWRhdGVUeXBlKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKSkge1xuXHRcdHJldHVybiBlcnJvci5wcmVmaXhXaXRoKG51bGwsIFwidHlwZVwiKTtcblx0fVxuXHRpZiAoZXJyb3IgPSB0aGlzLnZhbGlkYXRlRW51bShkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aCkpIHtcblx0XHRyZXR1cm4gZXJyb3IucHJlZml4V2l0aChudWxsLCBcInR5cGVcIik7XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZVR5cGUgPSBmdW5jdGlvbiB2YWxpZGF0ZVR5cGUoZGF0YSwgc2NoZW1hKSB7XG5cdGlmIChzY2hlbWEudHlwZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0dmFyIGRhdGFUeXBlID0gdHlwZW9mIGRhdGE7XG5cdGlmIChkYXRhID09PSBudWxsKSB7XG5cdFx0ZGF0YVR5cGUgPSBcIm51bGxcIjtcblx0fSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGRhdGEpKSB7XG5cdFx0ZGF0YVR5cGUgPSBcImFycmF5XCI7XG5cdH1cblx0dmFyIGFsbG93ZWRUeXBlcyA9IHNjaGVtYS50eXBlO1xuXHRpZiAodHlwZW9mIGFsbG93ZWRUeXBlcyAhPT0gXCJvYmplY3RcIikge1xuXHRcdGFsbG93ZWRUeXBlcyA9IFthbGxvd2VkVHlwZXNdO1xuXHR9XG5cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhbGxvd2VkVHlwZXMubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgdHlwZSA9IGFsbG93ZWRUeXBlc1tpXTtcblx0XHRpZiAodHlwZSA9PT0gZGF0YVR5cGUgfHwgKHR5cGUgPT09IFwiaW50ZWdlclwiICYmIGRhdGFUeXBlID09PSBcIm51bWJlclwiICYmIChkYXRhICUgMSA9PT0gMCkpKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5JTlZBTElEX1RZUEUsIHt0eXBlOiBkYXRhVHlwZSwgZXhwZWN0ZWQ6IGFsbG93ZWRUeXBlcy5qb2luKFwiL1wiKX0pO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVFbnVtID0gZnVuY3Rpb24gdmFsaWRhdGVFbnVtKGRhdGEsIHNjaGVtYSkge1xuXHRpZiAoc2NoZW1hW1wiZW51bVwiXSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzY2hlbWFbXCJlbnVtXCJdLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIGVudW1WYWwgPSBzY2hlbWFbXCJlbnVtXCJdW2ldO1xuXHRcdGlmIChyZWN1cnNpdmVDb21wYXJlKGRhdGEsIGVudW1WYWwpKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5FTlVNX01JU01BVENILCB7dmFsdWU6ICh0eXBlb2YgSlNPTiAhPT0gJ3VuZGVmaW5lZCcpID8gSlNPTi5zdHJpbmdpZnkoZGF0YSkgOiBkYXRhfSk7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZU51bWVyaWMgPSBmdW5jdGlvbiB2YWxpZGF0ZU51bWVyaWMoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpIHtcblx0cmV0dXJuIHRoaXMudmFsaWRhdGVNdWx0aXBsZU9mKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVNaW5NYXgoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZU5hTihkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVNdWx0aXBsZU9mID0gZnVuY3Rpb24gdmFsaWRhdGVNdWx0aXBsZU9mKGRhdGEsIHNjaGVtYSkge1xuXHR2YXIgbXVsdGlwbGVPZiA9IHNjaGVtYS5tdWx0aXBsZU9mIHx8IHNjaGVtYS5kaXZpc2libGVCeTtcblx0aWYgKG11bHRpcGxlT2YgPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdGlmICh0eXBlb2YgZGF0YSA9PT0gXCJudW1iZXJcIikge1xuXHRcdGlmIChkYXRhICUgbXVsdGlwbGVPZiAhPT0gMCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5OVU1CRVJfTVVMVElQTEVfT0YsIHt2YWx1ZTogZGF0YSwgbXVsdGlwbGVPZjogbXVsdGlwbGVPZn0pO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlTWluTWF4ID0gZnVuY3Rpb24gdmFsaWRhdGVNaW5NYXgoZGF0YSwgc2NoZW1hKSB7XG5cdGlmICh0eXBlb2YgZGF0YSAhPT0gXCJudW1iZXJcIikge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdGlmIChzY2hlbWEubWluaW11bSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0aWYgKGRhdGEgPCBzY2hlbWEubWluaW11bSkge1xuXHRcdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5OVU1CRVJfTUlOSU1VTSwge3ZhbHVlOiBkYXRhLCBtaW5pbXVtOiBzY2hlbWEubWluaW11bX0pLnByZWZpeFdpdGgobnVsbCwgXCJtaW5pbXVtXCIpO1xuXHRcdH1cblx0XHRpZiAoc2NoZW1hLmV4Y2x1c2l2ZU1pbmltdW0gJiYgZGF0YSA9PT0gc2NoZW1hLm1pbmltdW0pIHtcblx0XHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuTlVNQkVSX01JTklNVU1fRVhDTFVTSVZFLCB7dmFsdWU6IGRhdGEsIG1pbmltdW06IHNjaGVtYS5taW5pbXVtfSkucHJlZml4V2l0aChudWxsLCBcImV4Y2x1c2l2ZU1pbmltdW1cIik7XG5cdFx0fVxuXHR9XG5cdGlmIChzY2hlbWEubWF4aW11bSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0aWYgKGRhdGEgPiBzY2hlbWEubWF4aW11bSkge1xuXHRcdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5OVU1CRVJfTUFYSU1VTSwge3ZhbHVlOiBkYXRhLCBtYXhpbXVtOiBzY2hlbWEubWF4aW11bX0pLnByZWZpeFdpdGgobnVsbCwgXCJtYXhpbXVtXCIpO1xuXHRcdH1cblx0XHRpZiAoc2NoZW1hLmV4Y2x1c2l2ZU1heGltdW0gJiYgZGF0YSA9PT0gc2NoZW1hLm1heGltdW0pIHtcblx0XHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuTlVNQkVSX01BWElNVU1fRVhDTFVTSVZFLCB7dmFsdWU6IGRhdGEsIG1heGltdW06IHNjaGVtYS5tYXhpbXVtfSkucHJlZml4V2l0aChudWxsLCBcImV4Y2x1c2l2ZU1heGltdW1cIik7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVOYU4gPSBmdW5jdGlvbiB2YWxpZGF0ZU5hTihkYXRhKSB7XG5cdGlmICh0eXBlb2YgZGF0YSAhPT0gXCJudW1iZXJcIikge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdGlmIChpc05hTihkYXRhKSA9PT0gdHJ1ZSB8fCBkYXRhID09PSBJbmZpbml0eSB8fCBkYXRhID09PSAtSW5maW5pdHkpIHtcblx0XHRyZXR1cm4gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLk5VTUJFUl9OT1RfQV9OVU1CRVIsIHt2YWx1ZTogZGF0YX0pLnByZWZpeFdpdGgobnVsbCwgXCJ0eXBlXCIpO1xuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVTdHJpbmcgPSBmdW5jdGlvbiB2YWxpZGF0ZVN0cmluZyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aCkge1xuXHRyZXR1cm4gdGhpcy52YWxpZGF0ZVN0cmluZ0xlbmd0aChkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCB0aGlzLnZhbGlkYXRlU3RyaW5nUGF0dGVybihkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVTdHJpbmdMZW5ndGggPSBmdW5jdGlvbiB2YWxpZGF0ZVN0cmluZ0xlbmd0aChkYXRhLCBzY2hlbWEpIHtcblx0aWYgKHR5cGVvZiBkYXRhICE9PSBcInN0cmluZ1wiKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0aWYgKHNjaGVtYS5taW5MZW5ndGggIT09IHVuZGVmaW5lZCkge1xuXHRcdGlmIChkYXRhLmxlbmd0aCA8IHNjaGVtYS5taW5MZW5ndGgpIHtcblx0XHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuU1RSSU5HX0xFTkdUSF9TSE9SVCwge2xlbmd0aDogZGF0YS5sZW5ndGgsIG1pbmltdW06IHNjaGVtYS5taW5MZW5ndGh9KS5wcmVmaXhXaXRoKG51bGwsIFwibWluTGVuZ3RoXCIpO1xuXHRcdH1cblx0fVxuXHRpZiAoc2NoZW1hLm1heExlbmd0aCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0aWYgKGRhdGEubGVuZ3RoID4gc2NoZW1hLm1heExlbmd0aCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5TVFJJTkdfTEVOR1RIX0xPTkcsIHtsZW5ndGg6IGRhdGEubGVuZ3RoLCBtYXhpbXVtOiBzY2hlbWEubWF4TGVuZ3RofSkucHJlZml4V2l0aChudWxsLCBcIm1heExlbmd0aFwiKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZVN0cmluZ1BhdHRlcm4gPSBmdW5jdGlvbiB2YWxpZGF0ZVN0cmluZ1BhdHRlcm4oZGF0YSwgc2NoZW1hKSB7XG5cdGlmICh0eXBlb2YgZGF0YSAhPT0gXCJzdHJpbmdcIiB8fCBzY2hlbWEucGF0dGVybiA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0dmFyIHJlZ2V4cCA9IG5ldyBSZWdFeHAoc2NoZW1hLnBhdHRlcm4pO1xuXHRpZiAoIXJlZ2V4cC50ZXN0KGRhdGEpKSB7XG5cdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5TVFJJTkdfUEFUVEVSTiwge3BhdHRlcm46IHNjaGVtYS5wYXR0ZXJufSkucHJlZml4V2l0aChudWxsLCBcInBhdHRlcm5cIik7XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVBcnJheSA9IGZ1bmN0aW9uIHZhbGlkYXRlQXJyYXkoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpIHtcblx0aWYgKCFBcnJheS5pc0FycmF5KGRhdGEpKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0cmV0dXJuIHRoaXMudmFsaWRhdGVBcnJheUxlbmd0aChkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCB0aGlzLnZhbGlkYXRlQXJyYXlVbmlxdWVJdGVtcyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCB0aGlzLnZhbGlkYXRlQXJyYXlJdGVtcyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVBcnJheUxlbmd0aCA9IGZ1bmN0aW9uIHZhbGlkYXRlQXJyYXlMZW5ndGgoZGF0YSwgc2NoZW1hKSB7XG5cdHZhciBlcnJvcjtcblx0aWYgKHNjaGVtYS5taW5JdGVtcyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0aWYgKGRhdGEubGVuZ3RoIDwgc2NoZW1hLm1pbkl0ZW1zKSB7XG5cdFx0XHRlcnJvciA9ICh0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuQVJSQVlfTEVOR1RIX1NIT1JULCB7bGVuZ3RoOiBkYXRhLmxlbmd0aCwgbWluaW11bTogc2NoZW1hLm1pbkl0ZW1zfSkpLnByZWZpeFdpdGgobnVsbCwgXCJtaW5JdGVtc1wiKTtcblx0XHRcdGlmICh0aGlzLmhhbmRsZUVycm9yKGVycm9yKSkge1xuXHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdGlmIChzY2hlbWEubWF4SXRlbXMgIT09IHVuZGVmaW5lZCkge1xuXHRcdGlmIChkYXRhLmxlbmd0aCA+IHNjaGVtYS5tYXhJdGVtcykge1xuXHRcdFx0ZXJyb3IgPSAodGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLkFSUkFZX0xFTkdUSF9MT05HLCB7bGVuZ3RoOiBkYXRhLmxlbmd0aCwgbWF4aW11bTogc2NoZW1hLm1heEl0ZW1zfSkpLnByZWZpeFdpdGgobnVsbCwgXCJtYXhJdGVtc1wiKTtcblx0XHRcdGlmICh0aGlzLmhhbmRsZUVycm9yKGVycm9yKSkge1xuXHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVBcnJheVVuaXF1ZUl0ZW1zID0gZnVuY3Rpb24gdmFsaWRhdGVBcnJheVVuaXF1ZUl0ZW1zKGRhdGEsIHNjaGVtYSkge1xuXHRpZiAoc2NoZW1hLnVuaXF1ZUl0ZW1zKSB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRmb3IgKHZhciBqID0gaSArIDE7IGogPCBkYXRhLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdGlmIChyZWN1cnNpdmVDb21wYXJlKGRhdGFbaV0sIGRhdGFbal0pKSB7XG5cdFx0XHRcdFx0dmFyIGVycm9yID0gKHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5BUlJBWV9VTklRVUUsIHttYXRjaDE6IGksIG1hdGNoMjogan0pKS5wcmVmaXhXaXRoKG51bGwsIFwidW5pcXVlSXRlbXNcIik7XG5cdFx0XHRcdFx0aWYgKHRoaXMuaGFuZGxlRXJyb3IoZXJyb3IpKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVBcnJheUl0ZW1zID0gZnVuY3Rpb24gdmFsaWRhdGVBcnJheUl0ZW1zKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKSB7XG5cdGlmIChzY2hlbWEuaXRlbXMgPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdHZhciBlcnJvciwgaTtcblx0aWYgKEFycmF5LmlzQXJyYXkoc2NoZW1hLml0ZW1zKSkge1xuXHRcdGZvciAoaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpZiAoaSA8IHNjaGVtYS5pdGVtcy5sZW5ndGgpIHtcblx0XHRcdFx0aWYgKGVycm9yID0gdGhpcy52YWxpZGF0ZUFsbChkYXRhW2ldLCBzY2hlbWEuaXRlbXNbaV0sIFtpXSwgW1wiaXRlbXNcIiwgaV0sIGRhdGFQb2ludGVyUGF0aCArIFwiL1wiICsgaSkpIHtcblx0XHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAoc2NoZW1hLmFkZGl0aW9uYWxJdGVtcyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdGlmICh0eXBlb2Ygc2NoZW1hLmFkZGl0aW9uYWxJdGVtcyA9PT0gXCJib29sZWFuXCIpIHtcblx0XHRcdFx0XHRpZiAoIXNjaGVtYS5hZGRpdGlvbmFsSXRlbXMpIHtcblx0XHRcdFx0XHRcdGVycm9yID0gKHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5BUlJBWV9BRERJVElPTkFMX0lURU1TLCB7fSkpLnByZWZpeFdpdGgoXCJcIiArIGksIFwiYWRkaXRpb25hbEl0ZW1zXCIpO1xuXHRcdFx0XHRcdFx0aWYgKHRoaXMuaGFuZGxlRXJyb3IoZXJyb3IpKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSBpZiAoZXJyb3IgPSB0aGlzLnZhbGlkYXRlQWxsKGRhdGFbaV0sIHNjaGVtYS5hZGRpdGlvbmFsSXRlbXMsIFtpXSwgW1wiYWRkaXRpb25hbEl0ZW1zXCJdLCBkYXRhUG9pbnRlclBhdGggKyBcIi9cIiArIGkpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdGZvciAoaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpZiAoZXJyb3IgPSB0aGlzLnZhbGlkYXRlQWxsKGRhdGFbaV0sIHNjaGVtYS5pdGVtcywgW2ldLCBbXCJpdGVtc1wiXSwgZGF0YVBvaW50ZXJQYXRoICsgXCIvXCIgKyBpKSkge1xuXHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVPYmplY3QgPSBmdW5jdGlvbiB2YWxpZGF0ZU9iamVjdChkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aCkge1xuXHRpZiAodHlwZW9mIGRhdGEgIT09IFwib2JqZWN0XCIgfHwgZGF0YSA9PT0gbnVsbCB8fCBBcnJheS5pc0FycmF5KGRhdGEpKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0cmV0dXJuIHRoaXMudmFsaWRhdGVPYmplY3RNaW5NYXhQcm9wZXJ0aWVzKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVPYmplY3RSZXF1aXJlZFByb3BlcnRpZXMoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZU9iamVjdFByb3BlcnRpZXMoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZU9iamVjdERlcGVuZGVuY2llcyhkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVPYmplY3RNaW5NYXhQcm9wZXJ0aWVzID0gZnVuY3Rpb24gdmFsaWRhdGVPYmplY3RNaW5NYXhQcm9wZXJ0aWVzKGRhdGEsIHNjaGVtYSkge1xuXHR2YXIga2V5cyA9IE9iamVjdC5rZXlzKGRhdGEpO1xuXHR2YXIgZXJyb3I7XG5cdGlmIChzY2hlbWEubWluUHJvcGVydGllcyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0aWYgKGtleXMubGVuZ3RoIDwgc2NoZW1hLm1pblByb3BlcnRpZXMpIHtcblx0XHRcdGVycm9yID0gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLk9CSkVDVF9QUk9QRVJUSUVTX01JTklNVU0sIHtwcm9wZXJ0eUNvdW50OiBrZXlzLmxlbmd0aCwgbWluaW11bTogc2NoZW1hLm1pblByb3BlcnRpZXN9KS5wcmVmaXhXaXRoKG51bGwsIFwibWluUHJvcGVydGllc1wiKTtcblx0XHRcdGlmICh0aGlzLmhhbmRsZUVycm9yKGVycm9yKSkge1xuXHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdGlmIChzY2hlbWEubWF4UHJvcGVydGllcyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0aWYgKGtleXMubGVuZ3RoID4gc2NoZW1hLm1heFByb3BlcnRpZXMpIHtcblx0XHRcdGVycm9yID0gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLk9CSkVDVF9QUk9QRVJUSUVTX01BWElNVU0sIHtwcm9wZXJ0eUNvdW50OiBrZXlzLmxlbmd0aCwgbWF4aW11bTogc2NoZW1hLm1heFByb3BlcnRpZXN9KS5wcmVmaXhXaXRoKG51bGwsIFwibWF4UHJvcGVydGllc1wiKTtcblx0XHRcdGlmICh0aGlzLmhhbmRsZUVycm9yKGVycm9yKSkge1xuXHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVPYmplY3RSZXF1aXJlZFByb3BlcnRpZXMgPSBmdW5jdGlvbiB2YWxpZGF0ZU9iamVjdFJlcXVpcmVkUHJvcGVydGllcyhkYXRhLCBzY2hlbWEpIHtcblx0aWYgKHNjaGVtYS5yZXF1aXJlZCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzY2hlbWEucmVxdWlyZWQubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBrZXkgPSBzY2hlbWEucmVxdWlyZWRbaV07XG5cdFx0XHRpZiAoZGF0YVtrZXldID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0dmFyIGVycm9yID0gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLk9CSkVDVF9SRVFVSVJFRCwge2tleToga2V5fSkucHJlZml4V2l0aChudWxsLCBcIlwiICsgaSkucHJlZml4V2l0aChudWxsLCBcInJlcXVpcmVkXCIpO1xuXHRcdFx0XHRpZiAodGhpcy5oYW5kbGVFcnJvcihlcnJvcikpIHtcblx0XHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZU9iamVjdFByb3BlcnRpZXMgPSBmdW5jdGlvbiB2YWxpZGF0ZU9iamVjdFByb3BlcnRpZXMoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpIHtcblx0dmFyIGVycm9yO1xuXHRmb3IgKHZhciBrZXkgaW4gZGF0YSkge1xuXHRcdHZhciBrZXlQb2ludGVyUGF0aCA9IGRhdGFQb2ludGVyUGF0aCArIFwiL1wiICsga2V5LnJlcGxhY2UoL34vZywgJ34wJykucmVwbGFjZSgvXFwvL2csICd+MScpO1xuXHRcdHZhciBmb3VuZE1hdGNoID0gZmFsc2U7XG5cdFx0aWYgKHNjaGVtYS5wcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgJiYgc2NoZW1hLnByb3BlcnRpZXNba2V5XSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRmb3VuZE1hdGNoID0gdHJ1ZTtcblx0XHRcdGlmIChlcnJvciA9IHRoaXMudmFsaWRhdGVBbGwoZGF0YVtrZXldLCBzY2hlbWEucHJvcGVydGllc1trZXldLCBba2V5XSwgW1wicHJvcGVydGllc1wiLCBrZXldLCBrZXlQb2ludGVyUGF0aCkpIHtcblx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoc2NoZW1hLnBhdHRlcm5Qcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdGZvciAodmFyIHBhdHRlcm5LZXkgaW4gc2NoZW1hLnBhdHRlcm5Qcm9wZXJ0aWVzKSB7XG5cdFx0XHRcdHZhciByZWdleHAgPSBuZXcgUmVnRXhwKHBhdHRlcm5LZXkpO1xuXHRcdFx0XHRpZiAocmVnZXhwLnRlc3Qoa2V5KSkge1xuXHRcdFx0XHRcdGZvdW5kTWF0Y2ggPSB0cnVlO1xuXHRcdFx0XHRcdGlmIChlcnJvciA9IHRoaXMudmFsaWRhdGVBbGwoZGF0YVtrZXldLCBzY2hlbWEucGF0dGVyblByb3BlcnRpZXNbcGF0dGVybktleV0sIFtrZXldLCBbXCJwYXR0ZXJuUHJvcGVydGllc1wiLCBwYXR0ZXJuS2V5XSwga2V5UG9pbnRlclBhdGgpKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmICghZm91bmRNYXRjaCkge1xuXHRcdFx0aWYgKHNjaGVtYS5hZGRpdGlvbmFsUHJvcGVydGllcyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdGlmICh0aGlzLnRyYWNrVW5rbm93blByb3BlcnRpZXMpIHtcblx0XHRcdFx0XHR0aGlzLmtub3duUHJvcGVydHlQYXRoc1trZXlQb2ludGVyUGF0aF0gPSB0cnVlO1xuXHRcdFx0XHRcdGRlbGV0ZSB0aGlzLnVua25vd25Qcm9wZXJ0eVBhdGhzW2tleVBvaW50ZXJQYXRoXTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAodHlwZW9mIHNjaGVtYS5hZGRpdGlvbmFsUHJvcGVydGllcyA9PT0gXCJib29sZWFuXCIpIHtcblx0XHRcdFx0XHRpZiAoIXNjaGVtYS5hZGRpdGlvbmFsUHJvcGVydGllcykge1xuXHRcdFx0XHRcdFx0ZXJyb3IgPSB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuT0JKRUNUX0FERElUSU9OQUxfUFJPUEVSVElFUywge30pLnByZWZpeFdpdGgoa2V5LCBcImFkZGl0aW9uYWxQcm9wZXJ0aWVzXCIpO1xuXHRcdFx0XHRcdFx0aWYgKHRoaXMuaGFuZGxlRXJyb3IoZXJyb3IpKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0aWYgKGVycm9yID0gdGhpcy52YWxpZGF0ZUFsbChkYXRhW2tleV0sIHNjaGVtYS5hZGRpdGlvbmFsUHJvcGVydGllcywgW2tleV0sIFtcImFkZGl0aW9uYWxQcm9wZXJ0aWVzXCJdLCBrZXlQb2ludGVyUGF0aCkpIHtcblx0XHRcdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAodGhpcy50cmFja1Vua25vd25Qcm9wZXJ0aWVzICYmICF0aGlzLmtub3duUHJvcGVydHlQYXRoc1trZXlQb2ludGVyUGF0aF0pIHtcblx0XHRcdFx0dGhpcy51bmtub3duUHJvcGVydHlQYXRoc1trZXlQb2ludGVyUGF0aF0gPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAodGhpcy50cmFja1Vua25vd25Qcm9wZXJ0aWVzKSB7XG5cdFx0XHR0aGlzLmtub3duUHJvcGVydHlQYXRoc1trZXlQb2ludGVyUGF0aF0gPSB0cnVlO1xuXHRcdFx0ZGVsZXRlIHRoaXMudW5rbm93blByb3BlcnR5UGF0aHNba2V5UG9pbnRlclBhdGhdO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlT2JqZWN0RGVwZW5kZW5jaWVzID0gZnVuY3Rpb24gdmFsaWRhdGVPYmplY3REZXBlbmRlbmNpZXMoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpIHtcblx0dmFyIGVycm9yO1xuXHRpZiAoc2NoZW1hLmRlcGVuZGVuY2llcyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0Zm9yICh2YXIgZGVwS2V5IGluIHNjaGVtYS5kZXBlbmRlbmNpZXMpIHtcblx0XHRcdGlmIChkYXRhW2RlcEtleV0gIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHR2YXIgZGVwID0gc2NoZW1hLmRlcGVuZGVuY2llc1tkZXBLZXldO1xuXHRcdFx0XHRpZiAodHlwZW9mIGRlcCA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRcdGlmIChkYXRhW2RlcF0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0ZXJyb3IgPSB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuT0JKRUNUX0RFUEVOREVOQ1lfS0VZLCB7a2V5OiBkZXBLZXksIG1pc3Npbmc6IGRlcH0pLnByZWZpeFdpdGgobnVsbCwgZGVwS2V5KS5wcmVmaXhXaXRoKG51bGwsIFwiZGVwZW5kZW5jaWVzXCIpO1xuXHRcdFx0XHRcdFx0aWYgKHRoaXMuaGFuZGxlRXJyb3IoZXJyb3IpKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShkZXApKSB7XG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkZXAubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdHZhciByZXF1aXJlZEtleSA9IGRlcFtpXTtcblx0XHRcdFx0XHRcdGlmIChkYXRhW3JlcXVpcmVkS2V5XSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHRcdGVycm9yID0gdGhpcy5jcmVhdGVFcnJvcihFcnJvckNvZGVzLk9CSkVDVF9ERVBFTkRFTkNZX0tFWSwge2tleTogZGVwS2V5LCBtaXNzaW5nOiByZXF1aXJlZEtleX0pLnByZWZpeFdpdGgobnVsbCwgXCJcIiArIGkpLnByZWZpeFdpdGgobnVsbCwgZGVwS2V5KS5wcmVmaXhXaXRoKG51bGwsIFwiZGVwZW5kZW5jaWVzXCIpO1xuXHRcdFx0XHRcdFx0XHRpZiAodGhpcy5oYW5kbGVFcnJvcihlcnJvcikpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0aWYgKGVycm9yID0gdGhpcy52YWxpZGF0ZUFsbChkYXRhLCBkZXAsIFtdLCBbXCJkZXBlbmRlbmNpZXNcIiwgZGVwS2V5XSwgZGF0YVBvaW50ZXJQYXRoKSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlQ29tYmluYXRpb25zID0gZnVuY3Rpb24gdmFsaWRhdGVDb21iaW5hdGlvbnMoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpIHtcblx0cmV0dXJuIHRoaXMudmFsaWRhdGVBbGxPZihkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aClcblx0XHR8fCB0aGlzLnZhbGlkYXRlQW55T2YoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgdGhpcy52YWxpZGF0ZU9uZU9mKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKVxuXHRcdHx8IHRoaXMudmFsaWRhdGVOb3QoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpXG5cdFx0fHwgbnVsbDtcbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlQWxsT2YgPSBmdW5jdGlvbiB2YWxpZGF0ZUFsbE9mKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKSB7XG5cdGlmIChzY2hlbWEuYWxsT2YgPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdHZhciBlcnJvcjtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzY2hlbWEuYWxsT2YubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgc3ViU2NoZW1hID0gc2NoZW1hLmFsbE9mW2ldO1xuXHRcdGlmIChlcnJvciA9IHRoaXMudmFsaWRhdGVBbGwoZGF0YSwgc3ViU2NoZW1hLCBbXSwgW1wiYWxsT2ZcIiwgaV0sIGRhdGFQb2ludGVyUGF0aCkpIHtcblx0XHRcdHJldHVybiBlcnJvcjtcblx0XHR9XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5WYWxpZGF0b3JDb250ZXh0LnByb3RvdHlwZS52YWxpZGF0ZUFueU9mID0gZnVuY3Rpb24gdmFsaWRhdGVBbnlPZihkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aCkge1xuXHRpZiAoc2NoZW1hLmFueU9mID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHR2YXIgZXJyb3JzID0gW107XG5cdHZhciBzdGFydEVycm9yQ291bnQgPSB0aGlzLmVycm9ycy5sZW5ndGg7XG5cdHZhciBvbGRVbmtub3duUHJvcGVydHlQYXRocywgb2xkS25vd25Qcm9wZXJ0eVBhdGhzO1xuXHRpZiAodGhpcy50cmFja1Vua25vd25Qcm9wZXJ0aWVzKSB7XG5cdFx0b2xkVW5rbm93blByb3BlcnR5UGF0aHMgPSB0aGlzLnVua25vd25Qcm9wZXJ0eVBhdGhzO1xuXHRcdG9sZEtub3duUHJvcGVydHlQYXRocyA9IHRoaXMua25vd25Qcm9wZXJ0eVBhdGhzO1xuXHR9XG5cdHZhciBlcnJvckF0RW5kID0gdHJ1ZTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzY2hlbWEuYW55T2YubGVuZ3RoOyBpKyspIHtcblx0XHRpZiAodGhpcy50cmFja1Vua25vd25Qcm9wZXJ0aWVzKSB7XG5cdFx0XHR0aGlzLnVua25vd25Qcm9wZXJ0eVBhdGhzID0ge307XG5cdFx0XHR0aGlzLmtub3duUHJvcGVydHlQYXRocyA9IHt9O1xuXHRcdH1cblx0XHR2YXIgc3ViU2NoZW1hID0gc2NoZW1hLmFueU9mW2ldO1xuXG5cdFx0dmFyIGVycm9yQ291bnQgPSB0aGlzLmVycm9ycy5sZW5ndGg7XG5cdFx0dmFyIGVycm9yID0gdGhpcy52YWxpZGF0ZUFsbChkYXRhLCBzdWJTY2hlbWEsIFtdLCBbXCJhbnlPZlwiLCBpXSwgZGF0YVBvaW50ZXJQYXRoKTtcblxuXHRcdGlmIChlcnJvciA9PT0gbnVsbCAmJiBlcnJvckNvdW50ID09PSB0aGlzLmVycm9ycy5sZW5ndGgpIHtcblx0XHRcdHRoaXMuZXJyb3JzID0gdGhpcy5lcnJvcnMuc2xpY2UoMCwgc3RhcnRFcnJvckNvdW50KTtcblxuXHRcdFx0aWYgKHRoaXMudHJhY2tVbmtub3duUHJvcGVydGllcykge1xuXHRcdFx0XHRmb3IgKHZhciBrbm93bktleSBpbiB0aGlzLmtub3duUHJvcGVydHlQYXRocykge1xuXHRcdFx0XHRcdG9sZEtub3duUHJvcGVydHlQYXRoc1trbm93bktleV0gPSB0cnVlO1xuXHRcdFx0XHRcdGRlbGV0ZSBvbGRVbmtub3duUHJvcGVydHlQYXRoc1trbm93bktleV07XG5cdFx0XHRcdH1cblx0XHRcdFx0Zm9yICh2YXIgdW5rbm93bktleSBpbiB0aGlzLnVua25vd25Qcm9wZXJ0eVBhdGhzKSB7XG5cdFx0XHRcdFx0aWYgKCFvbGRLbm93blByb3BlcnR5UGF0aHNbdW5rbm93bktleV0pIHtcblx0XHRcdFx0XHRcdG9sZFVua25vd25Qcm9wZXJ0eVBhdGhzW3Vua25vd25LZXldID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gV2UgbmVlZCB0byBjb250aW51ZSBsb29waW5nIHNvIHdlIGNhdGNoIGFsbCB0aGUgcHJvcGVydHkgZGVmaW5pdGlvbnMsIGJ1dCB3ZSBkb24ndCB3YW50IHRvIHJldHVybiBhbiBlcnJvclxuXHRcdFx0XHRlcnJvckF0RW5kID0gZmFsc2U7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdFx0aWYgKGVycm9yKSB7XG5cdFx0XHRlcnJvcnMucHVzaChlcnJvci5wcmVmaXhXaXRoKG51bGwsIFwiXCIgKyBpKS5wcmVmaXhXaXRoKG51bGwsIFwiYW55T2ZcIikpO1xuXHRcdH1cblx0fVxuXHRpZiAodGhpcy50cmFja1Vua25vd25Qcm9wZXJ0aWVzKSB7XG5cdFx0dGhpcy51bmtub3duUHJvcGVydHlQYXRocyA9IG9sZFVua25vd25Qcm9wZXJ0eVBhdGhzO1xuXHRcdHRoaXMua25vd25Qcm9wZXJ0eVBhdGhzID0gb2xkS25vd25Qcm9wZXJ0eVBhdGhzO1xuXHR9XG5cdGlmIChlcnJvckF0RW5kKSB7XG5cdFx0ZXJyb3JzID0gZXJyb3JzLmNvbmNhdCh0aGlzLmVycm9ycy5zbGljZShzdGFydEVycm9yQ291bnQpKTtcblx0XHR0aGlzLmVycm9ycyA9IHRoaXMuZXJyb3JzLnNsaWNlKDAsIHN0YXJ0RXJyb3JDb3VudCk7XG5cdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5BTllfT0ZfTUlTU0lORywge30sIFwiXCIsIFwiL2FueU9mXCIsIGVycm9ycyk7XG5cdH1cbn07XG5cblZhbGlkYXRvckNvbnRleHQucHJvdG90eXBlLnZhbGlkYXRlT25lT2YgPSBmdW5jdGlvbiB2YWxpZGF0ZU9uZU9mKGRhdGEsIHNjaGVtYSwgZGF0YVBvaW50ZXJQYXRoKSB7XG5cdGlmIChzY2hlbWEub25lT2YgPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdHZhciB2YWxpZEluZGV4ID0gbnVsbDtcblx0dmFyIGVycm9ycyA9IFtdO1xuXHR2YXIgc3RhcnRFcnJvckNvdW50ID0gdGhpcy5lcnJvcnMubGVuZ3RoO1xuXHR2YXIgb2xkVW5rbm93blByb3BlcnR5UGF0aHMsIG9sZEtub3duUHJvcGVydHlQYXRocztcblx0aWYgKHRoaXMudHJhY2tVbmtub3duUHJvcGVydGllcykge1xuXHRcdG9sZFVua25vd25Qcm9wZXJ0eVBhdGhzID0gdGhpcy51bmtub3duUHJvcGVydHlQYXRocztcblx0XHRvbGRLbm93blByb3BlcnR5UGF0aHMgPSB0aGlzLmtub3duUHJvcGVydHlQYXRocztcblx0fVxuXHRmb3IgKHZhciBpID0gMDsgaSA8IHNjaGVtYS5vbmVPZi5sZW5ndGg7IGkrKykge1xuXHRcdGlmICh0aGlzLnRyYWNrVW5rbm93blByb3BlcnRpZXMpIHtcblx0XHRcdHRoaXMudW5rbm93blByb3BlcnR5UGF0aHMgPSB7fTtcblx0XHRcdHRoaXMua25vd25Qcm9wZXJ0eVBhdGhzID0ge307XG5cdFx0fVxuXHRcdHZhciBzdWJTY2hlbWEgPSBzY2hlbWEub25lT2ZbaV07XG5cblx0XHR2YXIgZXJyb3JDb3VudCA9IHRoaXMuZXJyb3JzLmxlbmd0aDtcblx0XHR2YXIgZXJyb3IgPSB0aGlzLnZhbGlkYXRlQWxsKGRhdGEsIHN1YlNjaGVtYSwgW10sIFtcIm9uZU9mXCIsIGldLCBkYXRhUG9pbnRlclBhdGgpO1xuXG5cdFx0aWYgKGVycm9yID09PSBudWxsICYmIGVycm9yQ291bnQgPT09IHRoaXMuZXJyb3JzLmxlbmd0aCkge1xuXHRcdFx0aWYgKHZhbGlkSW5kZXggPT09IG51bGwpIHtcblx0XHRcdFx0dmFsaWRJbmRleCA9IGk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLmVycm9ycyA9IHRoaXMuZXJyb3JzLnNsaWNlKDAsIHN0YXJ0RXJyb3JDb3VudCk7XG5cdFx0XHRcdHJldHVybiB0aGlzLmNyZWF0ZUVycm9yKEVycm9yQ29kZXMuT05FX09GX01VTFRJUExFLCB7aW5kZXgxOiB2YWxpZEluZGV4LCBpbmRleDI6IGl9LCBcIlwiLCBcIi9vbmVPZlwiKTtcblx0XHRcdH1cblx0XHRcdGlmICh0aGlzLnRyYWNrVW5rbm93blByb3BlcnRpZXMpIHtcblx0XHRcdFx0Zm9yICh2YXIga25vd25LZXkgaW4gdGhpcy5rbm93blByb3BlcnR5UGF0aHMpIHtcblx0XHRcdFx0XHRvbGRLbm93blByb3BlcnR5UGF0aHNba25vd25LZXldID0gdHJ1ZTtcblx0XHRcdFx0XHRkZWxldGUgb2xkVW5rbm93blByb3BlcnR5UGF0aHNba25vd25LZXldO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGZvciAodmFyIHVua25vd25LZXkgaW4gdGhpcy51bmtub3duUHJvcGVydHlQYXRocykge1xuXHRcdFx0XHRcdGlmICghb2xkS25vd25Qcm9wZXJ0eVBhdGhzW3Vua25vd25LZXldKSB7XG5cdFx0XHRcdFx0XHRvbGRVbmtub3duUHJvcGVydHlQYXRoc1t1bmtub3duS2V5XSA9IHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChlcnJvcikge1xuXHRcdFx0ZXJyb3JzLnB1c2goZXJyb3IpO1xuXHRcdH1cblx0fVxuXHRpZiAodGhpcy50cmFja1Vua25vd25Qcm9wZXJ0aWVzKSB7XG5cdFx0dGhpcy51bmtub3duUHJvcGVydHlQYXRocyA9IG9sZFVua25vd25Qcm9wZXJ0eVBhdGhzO1xuXHRcdHRoaXMua25vd25Qcm9wZXJ0eVBhdGhzID0gb2xkS25vd25Qcm9wZXJ0eVBhdGhzO1xuXHR9XG5cdGlmICh2YWxpZEluZGV4ID09PSBudWxsKSB7XG5cdFx0ZXJyb3JzID0gZXJyb3JzLmNvbmNhdCh0aGlzLmVycm9ycy5zbGljZShzdGFydEVycm9yQ291bnQpKTtcblx0XHR0aGlzLmVycm9ycyA9IHRoaXMuZXJyb3JzLnNsaWNlKDAsIHN0YXJ0RXJyb3JDb3VudCk7XG5cdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5PTkVfT0ZfTUlTU0lORywge30sIFwiXCIsIFwiL29uZU9mXCIsIGVycm9ycyk7XG5cdH0gZWxzZSB7XG5cdFx0dGhpcy5lcnJvcnMgPSB0aGlzLmVycm9ycy5zbGljZSgwLCBzdGFydEVycm9yQ291bnQpO1xuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVOb3QgPSBmdW5jdGlvbiB2YWxpZGF0ZU5vdChkYXRhLCBzY2hlbWEsIGRhdGFQb2ludGVyUGF0aCkge1xuXHRpZiAoc2NoZW1hLm5vdCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0dmFyIG9sZEVycm9yQ291bnQgPSB0aGlzLmVycm9ycy5sZW5ndGg7XG5cdHZhciBvbGRVbmtub3duUHJvcGVydHlQYXRocywgb2xkS25vd25Qcm9wZXJ0eVBhdGhzO1xuXHRpZiAodGhpcy50cmFja1Vua25vd25Qcm9wZXJ0aWVzKSB7XG5cdFx0b2xkVW5rbm93blByb3BlcnR5UGF0aHMgPSB0aGlzLnVua25vd25Qcm9wZXJ0eVBhdGhzO1xuXHRcdG9sZEtub3duUHJvcGVydHlQYXRocyA9IHRoaXMua25vd25Qcm9wZXJ0eVBhdGhzO1xuXHRcdHRoaXMudW5rbm93blByb3BlcnR5UGF0aHMgPSB7fTtcblx0XHR0aGlzLmtub3duUHJvcGVydHlQYXRocyA9IHt9O1xuXHR9XG5cdHZhciBlcnJvciA9IHRoaXMudmFsaWRhdGVBbGwoZGF0YSwgc2NoZW1hLm5vdCwgbnVsbCwgbnVsbCwgZGF0YVBvaW50ZXJQYXRoKTtcblx0dmFyIG5vdEVycm9ycyA9IHRoaXMuZXJyb3JzLnNsaWNlKG9sZEVycm9yQ291bnQpO1xuXHR0aGlzLmVycm9ycyA9IHRoaXMuZXJyb3JzLnNsaWNlKDAsIG9sZEVycm9yQ291bnQpO1xuXHRpZiAodGhpcy50cmFja1Vua25vd25Qcm9wZXJ0aWVzKSB7XG5cdFx0dGhpcy51bmtub3duUHJvcGVydHlQYXRocyA9IG9sZFVua25vd25Qcm9wZXJ0eVBhdGhzO1xuXHRcdHRoaXMua25vd25Qcm9wZXJ0eVBhdGhzID0gb2xkS25vd25Qcm9wZXJ0eVBhdGhzO1xuXHR9XG5cdGlmIChlcnJvciA9PT0gbnVsbCAmJiBub3RFcnJvcnMubGVuZ3RoID09PSAwKSB7XG5cdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXJyb3IoRXJyb3JDb2Rlcy5OT1RfUEFTU0VELCB7fSwgXCJcIiwgXCIvbm90XCIpO1xuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuVmFsaWRhdG9yQ29udGV4dC5wcm90b3R5cGUudmFsaWRhdGVIeXBlcm1lZGlhID0gZnVuY3Rpb24gdmFsaWRhdGVDb21iaW5hdGlvbnMoZGF0YSwgc2NoZW1hLCBkYXRhUG9pbnRlclBhdGgpIHtcblx0aWYgKCFzY2hlbWEubGlua3MpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHR2YXIgZXJyb3I7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgc2NoZW1hLmxpbmtzLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIGxkbyA9IHNjaGVtYS5saW5rc1tpXTtcblx0XHRpZiAobGRvLnJlbCA9PT0gXCJkZXNjcmliZWRieVwiKSB7XG5cdFx0XHR2YXIgdGVtcGxhdGUgPSBuZXcgVXJpVGVtcGxhdGUobGRvLmhyZWYpO1xuXHRcdFx0dmFyIGFsbFByZXNlbnQgPSB0cnVlO1xuXHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCB0ZW1wbGF0ZS52YXJOYW1lcy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRpZiAoISh0ZW1wbGF0ZS52YXJOYW1lc1tqXSBpbiBkYXRhKSkge1xuXHRcdFx0XHRcdGFsbFByZXNlbnQgPSBmYWxzZTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKGFsbFByZXNlbnQpIHtcblx0XHRcdFx0dmFyIHNjaGVtYVVybCA9IHRlbXBsYXRlLmZpbGxGcm9tT2JqZWN0KGRhdGEpO1xuXHRcdFx0XHR2YXIgc3ViU2NoZW1hID0ge1wiJHJlZlwiOiBzY2hlbWFVcmx9O1xuXHRcdFx0XHRpZiAoZXJyb3IgPSB0aGlzLnZhbGlkYXRlQWxsKGRhdGEsIHN1YlNjaGVtYSwgW10sIFtcImxpbmtzXCIsIGldLCBkYXRhUG9pbnRlclBhdGgpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59O1xuXG4vLyBwYXJzZVVSSSgpIGFuZCByZXNvbHZlVXJsKCkgYXJlIGZyb20gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vMTA4ODg1MFxuLy8gICAtICByZWxlYXNlZCBhcyBwdWJsaWMgZG9tYWluIGJ5IGF1dGhvciAoXCJZYWZmbGVcIikgLSBzZWUgY29tbWVudHMgb24gZ2lzdFxuXG5mdW5jdGlvbiBwYXJzZVVSSSh1cmwpIHtcblx0dmFyIG0gPSBTdHJpbmcodXJsKS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJykubWF0Y2goL14oW146XFwvPyNdKzopPyhcXC9cXC8oPzpbXjpAXSooPzo6W146QF0qKT9AKT8oKFteOlxcLz8jXSopKD86OihcXGQqKSk/KSk/KFtePyNdKikoXFw/W14jXSopPygjW1xcc1xcU10qKT8vKTtcblx0Ly8gYXV0aG9yaXR5ID0gJy8vJyArIHVzZXIgKyAnOicgKyBwYXNzICdAJyArIGhvc3RuYW1lICsgJzonIHBvcnRcblx0cmV0dXJuIChtID8ge1xuXHRcdGhyZWYgICAgIDogbVswXSB8fCAnJyxcblx0XHRwcm90b2NvbCA6IG1bMV0gfHwgJycsXG5cdFx0YXV0aG9yaXR5OiBtWzJdIHx8ICcnLFxuXHRcdGhvc3QgICAgIDogbVszXSB8fCAnJyxcblx0XHRob3N0bmFtZSA6IG1bNF0gfHwgJycsXG5cdFx0cG9ydCAgICAgOiBtWzVdIHx8ICcnLFxuXHRcdHBhdGhuYW1lIDogbVs2XSB8fCAnJyxcblx0XHRzZWFyY2ggICA6IG1bN10gfHwgJycsXG5cdFx0aGFzaCAgICAgOiBtWzhdIHx8ICcnXG5cdH0gOiBudWxsKTtcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZVVybChiYXNlLCBocmVmKSB7Ly8gUkZDIDM5ODZcblxuXHRmdW5jdGlvbiByZW1vdmVEb3RTZWdtZW50cyhpbnB1dCkge1xuXHRcdHZhciBvdXRwdXQgPSBbXTtcblx0XHRpbnB1dC5yZXBsYWNlKC9eKFxcLlxcLj8oXFwvfCQpKSsvLCAnJylcblx0XHRcdC5yZXBsYWNlKC9cXC8oXFwuKFxcL3wkKSkrL2csICcvJylcblx0XHRcdC5yZXBsYWNlKC9cXC9cXC5cXC4kLywgJy8uLi8nKVxuXHRcdFx0LnJlcGxhY2UoL1xcLz9bXlxcL10qL2csIGZ1bmN0aW9uIChwKSB7XG5cdFx0XHRcdGlmIChwID09PSAnLy4uJykge1xuXHRcdFx0XHRcdG91dHB1dC5wb3AoKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRvdXRwdXQucHVzaChwKTtcblx0XHRcdFx0fVxuXHRcdH0pO1xuXHRcdHJldHVybiBvdXRwdXQuam9pbignJykucmVwbGFjZSgvXlxcLy8sIGlucHV0LmNoYXJBdCgwKSA9PT0gJy8nID8gJy8nIDogJycpO1xuXHR9XG5cblx0aHJlZiA9IHBhcnNlVVJJKGhyZWYgfHwgJycpO1xuXHRiYXNlID0gcGFyc2VVUkkoYmFzZSB8fCAnJyk7XG5cblx0cmV0dXJuICFocmVmIHx8ICFiYXNlID8gbnVsbCA6IChocmVmLnByb3RvY29sIHx8IGJhc2UucHJvdG9jb2wpICtcblx0XHQoaHJlZi5wcm90b2NvbCB8fCBocmVmLmF1dGhvcml0eSA/IGhyZWYuYXV0aG9yaXR5IDogYmFzZS5hdXRob3JpdHkpICtcblx0XHRyZW1vdmVEb3RTZWdtZW50cyhocmVmLnByb3RvY29sIHx8IGhyZWYuYXV0aG9yaXR5IHx8IGhyZWYucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycgPyBocmVmLnBhdGhuYW1lIDogKGhyZWYucGF0aG5hbWUgPyAoKGJhc2UuYXV0aG9yaXR5ICYmICFiYXNlLnBhdGhuYW1lID8gJy8nIDogJycpICsgYmFzZS5wYXRobmFtZS5zbGljZSgwLCBiYXNlLnBhdGhuYW1lLmxhc3RJbmRleE9mKCcvJykgKyAxKSArIGhyZWYucGF0aG5hbWUpIDogYmFzZS5wYXRobmFtZSkpICtcblx0XHQoaHJlZi5wcm90b2NvbCB8fCBocmVmLmF1dGhvcml0eSB8fCBocmVmLnBhdGhuYW1lID8gaHJlZi5zZWFyY2ggOiAoaHJlZi5zZWFyY2ggfHwgYmFzZS5zZWFyY2gpKSArXG5cdFx0aHJlZi5oYXNoO1xufVxuXG5mdW5jdGlvbiBnZXREb2N1bWVudFVyaSh1cmkpIHtcblx0cmV0dXJuIHVyaS5zcGxpdCgnIycpWzBdO1xufVxuZnVuY3Rpb24gbm9ybVNjaGVtYShzY2hlbWEsIGJhc2VVcmkpIHtcblx0aWYgKHNjaGVtYSAmJiB0eXBlb2Ygc2NoZW1hID09PSBcIm9iamVjdFwiKSB7XG5cdFx0aWYgKGJhc2VVcmkgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0YmFzZVVyaSA9IHNjaGVtYS5pZDtcblx0XHR9IGVsc2UgaWYgKHR5cGVvZiBzY2hlbWEuaWQgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdGJhc2VVcmkgPSByZXNvbHZlVXJsKGJhc2VVcmksIHNjaGVtYS5pZCk7XG5cdFx0XHRzY2hlbWEuaWQgPSBiYXNlVXJpO1xuXHRcdH1cblx0XHRpZiAoQXJyYXkuaXNBcnJheShzY2hlbWEpKSB7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNjaGVtYS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRub3JtU2NoZW1hKHNjaGVtYVtpXSwgYmFzZVVyaSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICh0eXBlb2Ygc2NoZW1hWyckcmVmJ10gPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0c2NoZW1hWyckcmVmJ10gPSByZXNvbHZlVXJsKGJhc2VVcmksIHNjaGVtYVsnJHJlZiddKTtcblx0XHRcdH1cblx0XHRcdGZvciAodmFyIGtleSBpbiBzY2hlbWEpIHtcblx0XHRcdFx0aWYgKGtleSAhPT0gXCJlbnVtXCIpIHtcblx0XHRcdFx0XHRub3JtU2NoZW1hKHNjaGVtYVtrZXldLCBiYXNlVXJpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuXG52YXIgRXJyb3JDb2RlcyA9IHtcblx0SU5WQUxJRF9UWVBFOiAwLFxuXHRFTlVNX01JU01BVENIOiAxLFxuXHRBTllfT0ZfTUlTU0lORzogMTAsXG5cdE9ORV9PRl9NSVNTSU5HOiAxMSxcblx0T05FX09GX01VTFRJUExFOiAxMixcblx0Tk9UX1BBU1NFRDogMTMsXG5cdC8vIE51bWVyaWMgZXJyb3JzXG5cdE5VTUJFUl9NVUxUSVBMRV9PRjogMTAwLFxuXHROVU1CRVJfTUlOSU1VTTogMTAxLFxuXHROVU1CRVJfTUlOSU1VTV9FWENMVVNJVkU6IDEwMixcblx0TlVNQkVSX01BWElNVU06IDEwMyxcblx0TlVNQkVSX01BWElNVU1fRVhDTFVTSVZFOiAxMDQsXG5cdE5VTUJFUl9OT1RfQV9OVU1CRVI6IDEwNSxcblx0Ly8gU3RyaW5nIGVycm9yc1xuXHRTVFJJTkdfTEVOR1RIX1NIT1JUOiAyMDAsXG5cdFNUUklOR19MRU5HVEhfTE9ORzogMjAxLFxuXHRTVFJJTkdfUEFUVEVSTjogMjAyLFxuXHQvLyBPYmplY3QgZXJyb3JzXG5cdE9CSkVDVF9QUk9QRVJUSUVTX01JTklNVU06IDMwMCxcblx0T0JKRUNUX1BST1BFUlRJRVNfTUFYSU1VTTogMzAxLFxuXHRPQkpFQ1RfUkVRVUlSRUQ6IDMwMixcblx0T0JKRUNUX0FERElUSU9OQUxfUFJPUEVSVElFUzogMzAzLFxuXHRPQkpFQ1RfREVQRU5ERU5DWV9LRVk6IDMwNCxcblx0Ly8gQXJyYXkgZXJyb3JzXG5cdEFSUkFZX0xFTkdUSF9TSE9SVDogNDAwLFxuXHRBUlJBWV9MRU5HVEhfTE9ORzogNDAxLFxuXHRBUlJBWV9VTklRVUU6IDQwMixcblx0QVJSQVlfQURESVRJT05BTF9JVEVNUzogNDAzLFxuXHQvLyBDdXN0b20vdXNlci1kZWZpbmVkIGVycm9yc1xuXHRGT1JNQVRfQ1VTVE9NOiA1MDAsXG5cdEtFWVdPUkRfQ1VTVE9NOiA1MDEsXG5cdC8vIFNjaGVtYSBzdHJ1Y3R1cmVcblx0Q0lSQ1VMQVJfUkVGRVJFTkNFOiA2MDAsXG5cdC8vIE5vbi1zdGFuZGFyZCB2YWxpZGF0aW9uIG9wdGlvbnNcblx0VU5LTk9XTl9QUk9QRVJUWTogMTAwMFxufTtcbnZhciBFcnJvckNvZGVMb29rdXAgPSB7fTtcbmZvciAodmFyIGtleSBpbiBFcnJvckNvZGVzKSB7XG5cdEVycm9yQ29kZUxvb2t1cFtFcnJvckNvZGVzW2tleV1dID0ga2V5O1xufVxudmFyIEVycm9yTWVzc2FnZXNEZWZhdWx0ID0ge1xuXHRJTlZBTElEX1RZUEU6IFwiSW52YWxpZCB0eXBlOiB7dHlwZX0gKGV4cGVjdGVkIHtleHBlY3RlZH0pXCIsXG5cdEVOVU1fTUlTTUFUQ0g6IFwiTm8gZW51bSBtYXRjaCBmb3I6IHt2YWx1ZX1cIixcblx0QU5ZX09GX01JU1NJTkc6IFwiRGF0YSBkb2VzIG5vdCBtYXRjaCBhbnkgc2NoZW1hcyBmcm9tIFxcXCJhbnlPZlxcXCJcIixcblx0T05FX09GX01JU1NJTkc6IFwiRGF0YSBkb2VzIG5vdCBtYXRjaCBhbnkgc2NoZW1hcyBmcm9tIFxcXCJvbmVPZlxcXCJcIixcblx0T05FX09GX01VTFRJUExFOiBcIkRhdGEgaXMgdmFsaWQgYWdhaW5zdCBtb3JlIHRoYW4gb25lIHNjaGVtYSBmcm9tIFxcXCJvbmVPZlxcXCI6IGluZGljZXMge2luZGV4MX0gYW5kIHtpbmRleDJ9XCIsXG5cdE5PVF9QQVNTRUQ6IFwiRGF0YSBtYXRjaGVzIHNjaGVtYSBmcm9tIFxcXCJub3RcXFwiXCIsXG5cdC8vIE51bWVyaWMgZXJyb3JzXG5cdE5VTUJFUl9NVUxUSVBMRV9PRjogXCJWYWx1ZSB7dmFsdWV9IGlzIG5vdCBhIG11bHRpcGxlIG9mIHttdWx0aXBsZU9mfVwiLFxuXHROVU1CRVJfTUlOSU1VTTogXCJWYWx1ZSB7dmFsdWV9IGlzIGxlc3MgdGhhbiBtaW5pbXVtIHttaW5pbXVtfVwiLFxuXHROVU1CRVJfTUlOSU1VTV9FWENMVVNJVkU6IFwiVmFsdWUge3ZhbHVlfSBpcyBlcXVhbCB0byBleGNsdXNpdmUgbWluaW11bSB7bWluaW11bX1cIixcblx0TlVNQkVSX01BWElNVU06IFwiVmFsdWUge3ZhbHVlfSBpcyBncmVhdGVyIHRoYW4gbWF4aW11bSB7bWF4aW11bX1cIixcblx0TlVNQkVSX01BWElNVU1fRVhDTFVTSVZFOiBcIlZhbHVlIHt2YWx1ZX0gaXMgZXF1YWwgdG8gZXhjbHVzaXZlIG1heGltdW0ge21heGltdW19XCIsXG5cdE5VTUJFUl9OT1RfQV9OVU1CRVI6IFwiVmFsdWUge3ZhbHVlfSBpcyBub3QgYSB2YWxpZCBudW1iZXJcIixcblx0Ly8gU3RyaW5nIGVycm9yc1xuXHRTVFJJTkdfTEVOR1RIX1NIT1JUOiBcIlN0cmluZyBpcyB0b28gc2hvcnQgKHtsZW5ndGh9IGNoYXJzKSwgbWluaW11bSB7bWluaW11bX1cIixcblx0U1RSSU5HX0xFTkdUSF9MT05HOiBcIlN0cmluZyBpcyB0b28gbG9uZyAoe2xlbmd0aH0gY2hhcnMpLCBtYXhpbXVtIHttYXhpbXVtfVwiLFxuXHRTVFJJTkdfUEFUVEVSTjogXCJTdHJpbmcgZG9lcyBub3QgbWF0Y2ggcGF0dGVybjoge3BhdHRlcm59XCIsXG5cdC8vIE9iamVjdCBlcnJvcnNcblx0T0JKRUNUX1BST1BFUlRJRVNfTUlOSU1VTTogXCJUb28gZmV3IHByb3BlcnRpZXMgZGVmaW5lZCAoe3Byb3BlcnR5Q291bnR9KSwgbWluaW11bSB7bWluaW11bX1cIixcblx0T0JKRUNUX1BST1BFUlRJRVNfTUFYSU1VTTogXCJUb28gbWFueSBwcm9wZXJ0aWVzIGRlZmluZWQgKHtwcm9wZXJ0eUNvdW50fSksIG1heGltdW0ge21heGltdW19XCIsXG5cdE9CSkVDVF9SRVFVSVJFRDogXCJNaXNzaW5nIHJlcXVpcmVkIHByb3BlcnR5OiB7a2V5fVwiLFxuXHRPQkpFQ1RfQURESVRJT05BTF9QUk9QRVJUSUVTOiBcIkFkZGl0aW9uYWwgcHJvcGVydGllcyBub3QgYWxsb3dlZFwiLFxuXHRPQkpFQ1RfREVQRU5ERU5DWV9LRVk6IFwiRGVwZW5kZW5jeSBmYWlsZWQgLSBrZXkgbXVzdCBleGlzdDoge21pc3Npbmd9IChkdWUgdG8ga2V5OiB7a2V5fSlcIixcblx0Ly8gQXJyYXkgZXJyb3JzXG5cdEFSUkFZX0xFTkdUSF9TSE9SVDogXCJBcnJheSBpcyB0b28gc2hvcnQgKHtsZW5ndGh9KSwgbWluaW11bSB7bWluaW11bX1cIixcblx0QVJSQVlfTEVOR1RIX0xPTkc6IFwiQXJyYXkgaXMgdG9vIGxvbmcgKHtsZW5ndGh9KSwgbWF4aW11bSB7bWF4aW11bX1cIixcblx0QVJSQVlfVU5JUVVFOiBcIkFycmF5IGl0ZW1zIGFyZSBub3QgdW5pcXVlIChpbmRpY2VzIHttYXRjaDF9IGFuZCB7bWF0Y2gyfSlcIixcblx0QVJSQVlfQURESVRJT05BTF9JVEVNUzogXCJBZGRpdGlvbmFsIGl0ZW1zIG5vdCBhbGxvd2VkXCIsXG5cdC8vIEZvcm1hdCBlcnJvcnNcblx0Rk9STUFUX0NVU1RPTTogXCJGb3JtYXQgdmFsaWRhdGlvbiBmYWlsZWQgKHttZXNzYWdlfSlcIixcblx0S0VZV09SRF9DVVNUT006IFwiS2V5d29yZCBmYWlsZWQ6IHtrZXl9ICh7bWVzc2FnZX0pXCIsXG5cdC8vIFNjaGVtYSBzdHJ1Y3R1cmVcblx0Q0lSQ1VMQVJfUkVGRVJFTkNFOiBcIkNpcmN1bGFyICRyZWZzOiB7dXJsc31cIixcblx0Ly8gTm9uLXN0YW5kYXJkIHZhbGlkYXRpb24gb3B0aW9uc1xuXHRVTktOT1dOX1BST1BFUlRZOiBcIlVua25vd24gcHJvcGVydHkgKG5vdCBpbiBzY2hlbWEpXCJcbn07XG5cbmZ1bmN0aW9uIFZhbGlkYXRpb25FcnJvcihjb2RlLCBtZXNzYWdlLCBwYXJhbXMsIGRhdGFQYXRoLCBzY2hlbWFQYXRoLCBzdWJFcnJvcnMpIHtcblx0RXJyb3IuY2FsbCh0aGlzKTtcblx0aWYgKGNvZGUgPT09IHVuZGVmaW5lZCkge1xuXHRcdHRocm93IG5ldyBFcnJvciAoXCJObyBjb2RlIHN1cHBsaWVkIGZvciBlcnJvcjogXCIrIG1lc3NhZ2UpO1xuXHR9XG5cdHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG5cdHRoaXMucGFyYW1zID0gcGFyYW1zO1xuXHR0aGlzLmNvZGUgPSBjb2RlO1xuXHR0aGlzLmRhdGFQYXRoID0gZGF0YVBhdGggfHwgXCJcIjtcblx0dGhpcy5zY2hlbWFQYXRoID0gc2NoZW1hUGF0aCB8fCBcIlwiO1xuXHR0aGlzLnN1YkVycm9ycyA9IHN1YkVycm9ycyB8fCBudWxsO1xuXG5cdHZhciBlcnIgPSBuZXcgRXJyb3IodGhpcy5tZXNzYWdlKTtcblx0dGhpcy5zdGFjayA9IGVyci5zdGFjayB8fCBlcnIuc3RhY2t0cmFjZTtcblx0aWYgKCF0aGlzLnN0YWNrKSB7XG5cdFx0dHJ5IHtcblx0XHRcdHRocm93IGVycjtcblx0XHR9XG5cdFx0Y2F0Y2goZXJyKSB7XG5cdFx0XHR0aGlzLnN0YWNrID0gZXJyLnN0YWNrIHx8IGVyci5zdGFja3RyYWNlO1xuXHRcdH1cblx0fVxufVxuVmFsaWRhdGlvbkVycm9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRXJyb3IucHJvdG90eXBlKTtcblZhbGlkYXRpb25FcnJvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBWYWxpZGF0aW9uRXJyb3I7XG5WYWxpZGF0aW9uRXJyb3IucHJvdG90eXBlLm5hbWUgPSAnVmFsaWRhdGlvbkVycm9yJztcblxuVmFsaWRhdGlvbkVycm9yLnByb3RvdHlwZS5wcmVmaXhXaXRoID0gZnVuY3Rpb24gKGRhdGFQcmVmaXgsIHNjaGVtYVByZWZpeCkge1xuXHRpZiAoZGF0YVByZWZpeCAhPT0gbnVsbCkge1xuXHRcdGRhdGFQcmVmaXggPSBkYXRhUHJlZml4LnJlcGxhY2UoL34vZywgXCJ+MFwiKS5yZXBsYWNlKC9cXC8vZywgXCJ+MVwiKTtcblx0XHR0aGlzLmRhdGFQYXRoID0gXCIvXCIgKyBkYXRhUHJlZml4ICsgdGhpcy5kYXRhUGF0aDtcblx0fVxuXHRpZiAoc2NoZW1hUHJlZml4ICE9PSBudWxsKSB7XG5cdFx0c2NoZW1hUHJlZml4ID0gc2NoZW1hUHJlZml4LnJlcGxhY2UoL34vZywgXCJ+MFwiKS5yZXBsYWNlKC9cXC8vZywgXCJ+MVwiKTtcblx0XHR0aGlzLnNjaGVtYVBhdGggPSBcIi9cIiArIHNjaGVtYVByZWZpeCArIHRoaXMuc2NoZW1hUGF0aDtcblx0fVxuXHRpZiAodGhpcy5zdWJFcnJvcnMgIT09IG51bGwpIHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc3ViRXJyb3JzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR0aGlzLnN1YkVycm9yc1tpXS5wcmVmaXhXaXRoKGRhdGFQcmVmaXgsIHNjaGVtYVByZWZpeCk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiB0aGlzO1xufTtcblxuZnVuY3Rpb24gaXNUcnVzdGVkVXJsKGJhc2VVcmwsIHRlc3RVcmwpIHtcblx0aWYodGVzdFVybC5zdWJzdHJpbmcoMCwgYmFzZVVybC5sZW5ndGgpID09PSBiYXNlVXJsKXtcblx0XHR2YXIgcmVtYWluZGVyID0gdGVzdFVybC5zdWJzdHJpbmcoYmFzZVVybC5sZW5ndGgpO1xuXHRcdGlmICgodGVzdFVybC5sZW5ndGggPiAwICYmIHRlc3RVcmwuY2hhckF0KGJhc2VVcmwubGVuZ3RoIC0gMSkgPT09IFwiL1wiKVxuXHRcdFx0fHwgcmVtYWluZGVyLmNoYXJBdCgwKSA9PT0gXCIjXCJcblx0XHRcdHx8IHJlbWFpbmRlci5jaGFyQXQoMCkgPT09IFwiP1wiKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufVxuXG52YXIgbGFuZ3VhZ2VzID0ge307XG5mdW5jdGlvbiBjcmVhdGVBcGkobGFuZ3VhZ2UpIHtcblx0dmFyIGdsb2JhbENvbnRleHQgPSBuZXcgVmFsaWRhdG9yQ29udGV4dCgpO1xuXHR2YXIgY3VycmVudExhbmd1YWdlID0gbGFuZ3VhZ2UgfHwgJ2VuJztcblx0dmFyIGFwaSA9IHtcblx0XHRhZGRGb3JtYXQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdGdsb2JhbENvbnRleHQuYWRkRm9ybWF0LmFwcGx5KGdsb2JhbENvbnRleHQsIGFyZ3VtZW50cyk7XG5cdFx0fSxcblx0XHRsYW5ndWFnZTogZnVuY3Rpb24gKGNvZGUpIHtcblx0XHRcdGlmICghY29kZSkge1xuXHRcdFx0XHRyZXR1cm4gY3VycmVudExhbmd1YWdlO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCFsYW5ndWFnZXNbY29kZV0pIHtcblx0XHRcdFx0Y29kZSA9IGNvZGUuc3BsaXQoJy0nKVswXTsgLy8gZmFsbCBiYWNrIHRvIGJhc2UgbGFuZ3VhZ2Vcblx0XHRcdH1cblx0XHRcdGlmIChsYW5ndWFnZXNbY29kZV0pIHtcblx0XHRcdFx0Y3VycmVudExhbmd1YWdlID0gY29kZTtcblx0XHRcdFx0cmV0dXJuIGNvZGU7IC8vIHNvIHlvdSBjYW4gdGVsbCBpZiBmYWxsLWJhY2sgaGFzIGhhcHBlbmVkXG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSxcblx0XHRhZGRMYW5ndWFnZTogZnVuY3Rpb24gKGNvZGUsIG1lc3NhZ2VNYXApIHtcblx0XHRcdHZhciBrZXk7XG5cdFx0XHRmb3IgKGtleSBpbiBFcnJvckNvZGVzKSB7XG5cdFx0XHRcdGlmIChtZXNzYWdlTWFwW2tleV0gJiYgIW1lc3NhZ2VNYXBbRXJyb3JDb2Rlc1trZXldXSkge1xuXHRcdFx0XHRcdG1lc3NhZ2VNYXBbRXJyb3JDb2Rlc1trZXldXSA9IG1lc3NhZ2VNYXBba2V5XTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dmFyIHJvb3RDb2RlID0gY29kZS5zcGxpdCgnLScpWzBdO1xuXHRcdFx0aWYgKCFsYW5ndWFnZXNbcm9vdENvZGVdKSB7IC8vIHVzZSBmb3IgYmFzZSBsYW5ndWFnZSBpZiBub3QgeWV0IGRlZmluZWRcblx0XHRcdFx0bGFuZ3VhZ2VzW2NvZGVdID0gbWVzc2FnZU1hcDtcblx0XHRcdFx0bGFuZ3VhZ2VzW3Jvb3RDb2RlXSA9IG1lc3NhZ2VNYXA7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRsYW5ndWFnZXNbY29kZV0gPSBPYmplY3QuY3JlYXRlKGxhbmd1YWdlc1tyb290Q29kZV0pO1xuXHRcdFx0XHRmb3IgKGtleSBpbiBtZXNzYWdlTWFwKSB7XG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBsYW5ndWFnZXNbcm9vdENvZGVdW2tleV0gPT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdFx0XHRsYW5ndWFnZXNbcm9vdENvZGVdW2tleV0gPSBtZXNzYWdlTWFwW2tleV07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGxhbmd1YWdlc1tjb2RlXVtrZXldID0gbWVzc2FnZU1hcFtrZXldO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9LFxuXHRcdGZyZXNoQXBpOiBmdW5jdGlvbiAobGFuZ3VhZ2UpIHtcblx0XHRcdHZhciByZXN1bHQgPSBjcmVhdGVBcGkoKTtcblx0XHRcdGlmIChsYW5ndWFnZSkge1xuXHRcdFx0XHRyZXN1bHQubGFuZ3VhZ2UobGFuZ3VhZ2UpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9LFxuXHRcdHZhbGlkYXRlOiBmdW5jdGlvbiAoZGF0YSwgc2NoZW1hLCBjaGVja1JlY3Vyc2l2ZSwgYmFuVW5rbm93blByb3BlcnRpZXMpIHtcblx0XHRcdHZhciBjb250ZXh0ID0gbmV3IFZhbGlkYXRvckNvbnRleHQoZ2xvYmFsQ29udGV4dCwgZmFsc2UsIGxhbmd1YWdlc1tjdXJyZW50TGFuZ3VhZ2VdLCBjaGVja1JlY3Vyc2l2ZSwgYmFuVW5rbm93blByb3BlcnRpZXMpO1xuXHRcdFx0aWYgKHR5cGVvZiBzY2hlbWEgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0c2NoZW1hID0ge1wiJHJlZlwiOiBzY2hlbWF9O1xuXHRcdFx0fVxuXHRcdFx0Y29udGV4dC5hZGRTY2hlbWEoXCJcIiwgc2NoZW1hKTtcblx0XHRcdHZhciBlcnJvciA9IGNvbnRleHQudmFsaWRhdGVBbGwoZGF0YSwgc2NoZW1hLCBudWxsLCBudWxsLCBcIlwiKTtcblx0XHRcdGlmICghZXJyb3IgJiYgYmFuVW5rbm93blByb3BlcnRpZXMpIHtcblx0XHRcdFx0ZXJyb3IgPSBjb250ZXh0LmJhblVua25vd25Qcm9wZXJ0aWVzKCk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLmVycm9yID0gZXJyb3I7XG5cdFx0XHR0aGlzLm1pc3NpbmcgPSBjb250ZXh0Lm1pc3Npbmc7XG5cdFx0XHR0aGlzLnZhbGlkID0gKGVycm9yID09PSBudWxsKTtcblx0XHRcdHJldHVybiB0aGlzLnZhbGlkO1xuXHRcdH0sXG5cdFx0dmFsaWRhdGVSZXN1bHQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHZhciByZXN1bHQgPSB7fTtcblx0XHRcdHRoaXMudmFsaWRhdGUuYXBwbHkocmVzdWx0LCBhcmd1bWVudHMpO1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9LFxuXHRcdHZhbGlkYXRlTXVsdGlwbGU6IGZ1bmN0aW9uIChkYXRhLCBzY2hlbWEsIGNoZWNrUmVjdXJzaXZlLCBiYW5Vbmtub3duUHJvcGVydGllcykge1xuXHRcdFx0dmFyIGNvbnRleHQgPSBuZXcgVmFsaWRhdG9yQ29udGV4dChnbG9iYWxDb250ZXh0LCB0cnVlLCBsYW5ndWFnZXNbY3VycmVudExhbmd1YWdlXSwgY2hlY2tSZWN1cnNpdmUsIGJhblVua25vd25Qcm9wZXJ0aWVzKTtcblx0XHRcdGlmICh0eXBlb2Ygc2NoZW1hID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdHNjaGVtYSA9IHtcIiRyZWZcIjogc2NoZW1hfTtcblx0XHRcdH1cblx0XHRcdGNvbnRleHQuYWRkU2NoZW1hKFwiXCIsIHNjaGVtYSk7XG5cdFx0XHRjb250ZXh0LnZhbGlkYXRlQWxsKGRhdGEsIHNjaGVtYSwgbnVsbCwgbnVsbCwgXCJcIik7XG5cdFx0XHRpZiAoYmFuVW5rbm93blByb3BlcnRpZXMpIHtcblx0XHRcdFx0Y29udGV4dC5iYW5Vbmtub3duUHJvcGVydGllcygpO1xuXHRcdFx0fVxuXHRcdFx0dmFyIHJlc3VsdCA9IHt9O1xuXHRcdFx0cmVzdWx0LmVycm9ycyA9IGNvbnRleHQuZXJyb3JzO1xuXHRcdFx0cmVzdWx0Lm1pc3NpbmcgPSBjb250ZXh0Lm1pc3Npbmc7XG5cdFx0XHRyZXN1bHQudmFsaWQgPSAocmVzdWx0LmVycm9ycy5sZW5ndGggPT09IDApO1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9LFxuXHRcdGFkZFNjaGVtYTogZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIGdsb2JhbENvbnRleHQuYWRkU2NoZW1hLmFwcGx5KGdsb2JhbENvbnRleHQsIGFyZ3VtZW50cyk7XG5cdFx0fSxcblx0XHRnZXRTY2hlbWE6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBnbG9iYWxDb250ZXh0LmdldFNjaGVtYS5hcHBseShnbG9iYWxDb250ZXh0LCBhcmd1bWVudHMpO1xuXHRcdH0sXG5cdFx0Z2V0U2NoZW1hTWFwOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gZ2xvYmFsQ29udGV4dC5nZXRTY2hlbWFNYXAuYXBwbHkoZ2xvYmFsQ29udGV4dCwgYXJndW1lbnRzKTtcblx0XHR9LFxuXHRcdGdldFNjaGVtYVVyaXM6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBnbG9iYWxDb250ZXh0LmdldFNjaGVtYVVyaXMuYXBwbHkoZ2xvYmFsQ29udGV4dCwgYXJndW1lbnRzKTtcblx0XHR9LFxuXHRcdGdldE1pc3NpbmdVcmlzOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gZ2xvYmFsQ29udGV4dC5nZXRNaXNzaW5nVXJpcy5hcHBseShnbG9iYWxDb250ZXh0LCBhcmd1bWVudHMpO1xuXHRcdH0sXG5cdFx0ZHJvcFNjaGVtYXM6IGZ1bmN0aW9uICgpIHtcblx0XHRcdGdsb2JhbENvbnRleHQuZHJvcFNjaGVtYXMuYXBwbHkoZ2xvYmFsQ29udGV4dCwgYXJndW1lbnRzKTtcblx0XHR9LFxuXHRcdGRlZmluZUtleXdvcmQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdGdsb2JhbENvbnRleHQuZGVmaW5lS2V5d29yZC5hcHBseShnbG9iYWxDb250ZXh0LCBhcmd1bWVudHMpO1xuXHRcdH0sXG5cdFx0ZGVmaW5lRXJyb3I6IGZ1bmN0aW9uIChjb2RlTmFtZSwgY29kZU51bWJlciwgZGVmYXVsdE1lc3NhZ2UpIHtcblx0XHRcdGlmICh0eXBlb2YgY29kZU5hbWUgIT09ICdzdHJpbmcnIHx8ICEvXltBLVpdKyhfW0EtWl0rKSokLy50ZXN0KGNvZGVOYW1lKSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0NvZGUgbmFtZSBtdXN0IGJlIGEgc3RyaW5nIGluIFVQUEVSX0NBU0VfV0lUSF9VTkRFUlNDT1JFUycpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHR5cGVvZiBjb2RlTnVtYmVyICE9PSAnbnVtYmVyJyB8fCBjb2RlTnVtYmVyJTEgIT09IDAgfHwgY29kZU51bWJlciA8IDEwMDAwKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcignQ29kZSBudW1iZXIgbXVzdCBiZSBhbiBpbnRlZ2VyID4gMTAwMDAnKTtcblx0XHRcdH1cblx0XHRcdGlmICh0eXBlb2YgRXJyb3JDb2Rlc1tjb2RlTmFtZV0gIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcignRXJyb3IgYWxyZWFkeSBkZWZpbmVkOiAnICsgY29kZU5hbWUgKyAnIGFzICcgKyBFcnJvckNvZGVzW2NvZGVOYW1lXSk7XG5cdFx0XHR9XG5cdFx0XHRpZiAodHlwZW9mIEVycm9yQ29kZUxvb2t1cFtjb2RlTnVtYmVyXSAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdFcnJvciBjb2RlIGFscmVhZHkgdXNlZDogJyArIEVycm9yQ29kZUxvb2t1cFtjb2RlTnVtYmVyXSArICcgYXMgJyArIGNvZGVOdW1iZXIpO1xuXHRcdFx0fVxuXHRcdFx0RXJyb3JDb2Rlc1tjb2RlTmFtZV0gPSBjb2RlTnVtYmVyO1xuXHRcdFx0RXJyb3JDb2RlTG9va3VwW2NvZGVOdW1iZXJdID0gY29kZU5hbWU7XG5cdFx0XHRFcnJvck1lc3NhZ2VzRGVmYXVsdFtjb2RlTmFtZV0gPSBFcnJvck1lc3NhZ2VzRGVmYXVsdFtjb2RlTnVtYmVyXSA9IGRlZmF1bHRNZXNzYWdlO1xuXHRcdFx0Zm9yICh2YXIgbGFuZ0NvZGUgaW4gbGFuZ3VhZ2VzKSB7XG5cdFx0XHRcdHZhciBsYW5ndWFnZSA9IGxhbmd1YWdlc1tsYW5nQ29kZV07XG5cdFx0XHRcdGlmIChsYW5ndWFnZVtjb2RlTmFtZV0pIHtcblx0XHRcdFx0XHRsYW5ndWFnZVtjb2RlTnVtYmVyXSA9IGxhbmd1YWdlW2NvZGVOdW1iZXJdIHx8IGxhbmd1YWdlW2NvZGVOYW1lXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0cmVzZXQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdGdsb2JhbENvbnRleHQucmVzZXQoKTtcblx0XHRcdHRoaXMuZXJyb3IgPSBudWxsO1xuXHRcdFx0dGhpcy5taXNzaW5nID0gW107XG5cdFx0XHR0aGlzLnZhbGlkID0gdHJ1ZTtcblx0XHR9LFxuXHRcdG1pc3Npbmc6IFtdLFxuXHRcdGVycm9yOiBudWxsLFxuXHRcdHZhbGlkOiB0cnVlLFxuXHRcdG5vcm1TY2hlbWE6IG5vcm1TY2hlbWEsXG5cdFx0cmVzb2x2ZVVybDogcmVzb2x2ZVVybCxcblx0XHRnZXREb2N1bWVudFVyaTogZ2V0RG9jdW1lbnRVcmksXG5cdFx0ZXJyb3JDb2RlczogRXJyb3JDb2Rlc1xuXHR9O1xuXHRyZXR1cm4gYXBpO1xufVxuXG52YXIgdHY0ID0gY3JlYXRlQXBpKCk7XG50djQuYWRkTGFuZ3VhZ2UoJ2VuLWdiJywgRXJyb3JNZXNzYWdlc0RlZmF1bHQpO1xuXG4vL2xlZ2FjeSBwcm9wZXJ0eVxudHY0LnR2NCA9IHR2NDtcblxucmV0dXJuIHR2NDsgLy8gdXNlZCBieSBfaGVhZGVyLmpzIHRvIGdsb2JhbGlzZS5cblxufSkpOyIsInZhciBfID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbnZhciBTdGVwcyA9IFsncGxheScsICdmb3JtJywgJ3Jlc3VsdCddO1xuXG5mdW5jdGlvbiBJbnN0YW50V2luKEN1cnJlbnRVc2VyLCBTaGlwKSB7XG5cbiAgdmFyIENIQU5HRV9FVkVOVCA9IFtcIlNISVBfQ0hBTkdFXCIsIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMDAwMDAwMDAwMCldLmpvaW4oJ18nKTtcblxuICB2YXIgQXBwU3RhdGUgPSB7fTtcblxuICBmdW5jdGlvbiBpbml0U3RhdGUodXNlciwgc2hpcCkge1xuICAgIEFwcFN0YXRlID0ge1xuICAgICAgc2hpcDogXy5vbWl0KHNoaXAsICdzZXR0aW5ncycsICdyZXNvdXJjZXMnLCAndHJhbnNsYXRpb25zJyksXG4gICAgICBzZXR0aW5nczogc2hpcC5zZXR0aW5ncyxcbiAgICAgIGZvcm06IHNoaXAucmVzb3VyY2VzLmZvcm0sXG4gICAgICBhY2hpZXZlbWVudDogc2hpcC5yZXNvdXJjZXMuYWNoaWV2ZW1lbnQsXG4gICAgICB0cmFuc2xhdGlvbnM6IHNoaXAudHJhbnNsYXRpb25zLFxuICAgICAgdXNlcjogdXNlcixcbiAgICAgIGJhZGdlOiAoc2hpcC5yZXNvdXJjZXMuYWNoaWV2ZW1lbnQgJiYgc2hpcC5yZXNvdXJjZXMuYWNoaWV2ZW1lbnQuYmFkZ2UpXG4gICAgfTtcbiAgICBlbWl0Q2hhbmdlKCk7XG4gICAgcmV0dXJuIEFwcFN0YXRlO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGVtaXRDaGFuZ2UodG1wKSB7XG4gICAgdmFyIHMgPSBnZXRBcHBTdGF0ZSh0bXApO1xuICAgIEh1bGwuZW1pdChDSEFOR0VfRVZFTlQsIHMpO1xuICB9XG5cblxuICAvLyBDdXN0b21pemF0aW9uIHN1cHBvcnRcblxuICBmdW5jdGlvbiB1cGRhdGVTZXR0aW5ncyhzZXR0aW5ncykge1xuICAgIEFwcFN0YXRlLnNldHRpbmdzID0gc2V0dGluZ3M7XG4gICAgZW1pdENoYW5nZSh7IGNoYW5nZWQ6ICdzZXR0aW5ncycgfSk7XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVUcmFuc2xhdGlvbnModHJhbnNsYXRpb25zKSB7XG4gICAgQXBwU3RhdGUudHJhbnNsYXRpb25zID0gdHJhbnNsYXRpb25zO1xuICAgIGVtaXRDaGFuZ2UoeyBjaGFuZ2VkOiAndHJhbnNsYXRpb25zJyB9KTtcbiAgfVxuXG4gIC8vIFVzZXIgYWN0aW9uc1xuXG4gIGZ1bmN0aW9uIHByb2Nlc3NGb3JtRGF0YShmb3JtRGF0YSkge1xuICAgIHZhciBmaWVsZHMgPSBBcHBTdGF0ZS5mb3JtLmZpZWxkc19saXN0O1xuICAgIHZhciByZXQgPSBmaWVsZHMucmVkdWNlKGZ1bmN0aW9uKGRhdGEsIGZpZWxkKSB7XG4gICAgICB2YXIgdmFsID0gZm9ybURhdGFbZmllbGQubmFtZV07XG4gICAgICBpZiAodmFsLnRvU3RyaW5nKCkubGVuZ3RoID4gMCkge1xuICAgICAgICBzd2l0Y2ggKGZpZWxkLmZpZWxkX3R5cGUpIHtcbiAgICAgICAgICBjYXNlICdkYXRlJzpcbiAgICAgICAgICAgIHJlcyA9IG5ldyBEYXRlKHZhbCkudG9JU09TdHJpbmcoKS5zdWJzdHJpbmcoMCwxMCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmVzID0gZm9ybURhdGFbZmllbGQubmFtZV07XG4gICAgICAgIH1cbiAgICAgICAgZGF0YVtmaWVsZC5uYW1lXSA9IHJlcztcbiAgICAgIH1cbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH0sIHt9KTtcbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgZnVuY3Rpb24gc3VibWl0Rm9ybShmb3JtRGF0YSkge1xuICAgIHZhciBkYXRhID0gcHJvY2Vzc0Zvcm1EYXRhKGZvcm1EYXRhKTtcbiAgICBlbWl0Q2hhbmdlKHsgY2hhbmdlZDogJ2xvYWRpbmcnLCBsb2FkaW5nOiAnZm9ybScgfSk7XG4gICAgSHVsbC5hcGkucHV0KEFwcFN0YXRlLmZvcm0uaWQgKyBcIi9zdWJtaXRcIiwgeyBkYXRhOiBkYXRhIH0pLnRoZW4oZnVuY3Rpb24oZm9ybSkge1xuICAgICAgQXBwU3RhdGUuZm9ybSA9IGZvcm07XG4gICAgICBlbWl0Q2hhbmdlKHsgY2hhbmdlZDogJ2Zvcm0nIH0pO1xuICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgZW1pdENoYW5nZSh7IGVycm9yX21lc3NhZ2U6ICdpbnZhbGlkX2Zvcm0nLCBlcnJvcjogZXJyIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gcGxheShwcm92aWRlcikge1xuICAgIGlmICh1c2VyQ2FuUGxheSgpKSB7XG4gICAgICBlbWl0Q2hhbmdlKHsgY2hhbmdlZDogJ2xvYWRpbmcnLCBsb2FkaW5nOiAnYmFkZ2UnIH0pO1xuICAgICAgcmV0dXJuIEh1bGwuYXBpLnBvc3QoQXBwU3RhdGUuYWNoaWV2ZW1lbnQuaWQgKyBcIi9hY2hpZXZlXCIpLnRoZW4oZnVuY3Rpb24oYmFkZ2UpIHtcbiAgICAgICAgQXBwU3RhdGUuYmFkZ2UgPSBiYWRnZTtcbiAgICAgICAgZW1pdENoYW5nZSh7IGNoYW5nZWQ6ICdiYWRnZScgfSk7XG4gICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgZW1pdENoYW5nZSh7IGVycm9yX21lc3NhZ2U6ICdlcnJvcl9vbl9hY2hpZXZlJywgZXJyb3I6IGVyciB9KTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAocHJvdmlkZXIgJiYgIUFwcFN0YXRlLnVzZXIpIHtcbiAgICAgIGxvZ2luQW5kUGxheShwcm92aWRlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVtaXRDaGFuZ2UoeyBlcnJvcl9tZXNzYWdlOiAndXNlcl9jYW5ub3RfcGxheScgfSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIGF1dG9QbGF5ID0gZmFsc2U7XG4gIGZ1bmN0aW9uIGxvZ2luQW5kUGxheShwcm92aWRlciwgb3B0aW9ucykge1xuICAgIGlmIChwcm92aWRlcikge1xuICAgICAgYXV0b1BsYXkgPSB0cnVlO1xuICAgICAgZW1pdENoYW5nZSh7IGlzTG9nZ2luZ0luOiB0cnVlIH0pO1xuICAgICAgSHVsbC5sb2dpbihwcm92aWRlciwgb3B0aW9ucyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IFwiW0luc3RhbnRXaW5dIEVycm9yIGluIGxvZ2luQW5kUGxheSBtZXRob2Q6IG1pc3NpbmcgYHByb3ZpZGVyYFwiO1xuICAgIH1cbiAgfVxuXG4gIC8vIFN0YXRlIG1hbmFnZW1lbnRcblxuICBmdW5jdGlvbiBnZXRBcHBTdGF0ZSh0bXApIHtcbiAgICB2YXIgc3RlcCA9IGN1cnJlbnRTdGVwKCk7XG4gICAgdmFyIHJldCA9IF8uZXh0ZW5kKHt9LCBBcHBTdGF0ZSwge1xuICAgICAgdXNlckNhblBsYXk6IHVzZXJDYW5QbGF5KCksXG4gICAgICB1c2VySGFzUGxheWVkOiB1c2VySGFzUGxheWVkKCksXG4gICAgICB1c2VySGFzV29uOiB1c2VySGFzV29uKCksXG4gICAgICBjdXJyZW50U3RlcDogc3RlcCxcbiAgICAgIGN1cnJlbnRTdGVwSW5kZXg6IHN0ZXBJbmRleChzdGVwKSxcbiAgICAgIGlzRm9ybUNvbXBsZXRlOiBpc0Zvcm1Db21wbGV0ZSgpLFxuICAgIH0sIHRtcCk7XG4gICAgcmV0dXJuIF8uZGVlcENsb25lKHJldCk7XG4gIH1cblxuICBmdW5jdGlvbiB1c2VyQ2FuUGxheSgpIHtcbiAgICByZXR1cm4gY2FuUGxheSgpID09PSB0cnVlO1xuICB9XG5cbiAgZnVuY3Rpb24gY2FuUGxheSgpIHtcbiAgICBpZiAoIUFwcFN0YXRlLnVzZXIpIHJldHVybiBcIk5vIGN1cnJlbnQgdXNlclwiO1xuICAgIGlmICh1c2VySGFzV29uKCkpIHJldHVybiBcIkFscmVhZHkgd29uXCI7XG4gICAgdmFyIGJhZGdlID0gQXBwU3RhdGUuYmFkZ2U7XG4gICAgaWYgKCFiYWRnZSB8fCAhYmFkZ2UuZGF0YS5hdHRlbXB0cykgcmV0dXJuIHRydWU7XG4gICAgdmFyIGQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkuc2xpY2UoMCwgMTApO1xuICAgIGlmIChiYWRnZS5kYXRhLmF0dGVtcHRzW2RdKSB7XG4gICAgICByZXR1cm4gXCJPbmUgYXR0ZW1wdCBhbHJlYWR5IHRvZGF5XCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHVzZXJIYXNQbGF5ZWQoKSB7XG4gICAgcmV0dXJuICEhQXBwU3RhdGUuYmFkZ2U7XG4gIH1cblxuICBmdW5jdGlvbiB1c2VySGFzV29uKCkge1xuICAgIHZhciBiYWRnZSA9IEFwcFN0YXRlLmJhZGdlO1xuICAgIGlmICghYmFkZ2UgfHwgIWJhZGdlLmRhdGEpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gYmFkZ2UuZGF0YS53aW5uZXIgPT09IHRydWU7XG4gIH1cblxuICBmdW5jdGlvbiBjdXJyZW50U3RlcCgpIHtcbiAgICBpZiAoIUFwcFN0YXRlLnVzZXIgfHwgdXNlckNhblBsYXkoKSkgcmV0dXJuICdwbGF5JztcbiAgICBpZiAoIWlzRm9ybUNvbXBsZXRlKCkpIHJldHVybiAnZm9ybSc7XG4gICAgcmV0dXJuICdyZXN1bHQnO1xuICB9XG5cbiAgZnVuY3Rpb24gc3RlcEluZGV4KHN0ZXApIHtcbiAgICByZXR1cm4gU3RlcHMuaW5kZXhPZihzdGVwKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzRm9ybUNvbXBsZXRlKCkge1xuICAgIGlmICghQXBwU3RhdGUudXNlcikgcmV0dXJuIGZhbHNlO1xuICAgIHZhciBmaWVsZHMgPSBBcHBTdGF0ZS5mb3JtICYmIEFwcFN0YXRlLmZvcm0uZmllbGRzX2xpc3Q7XG4gICAgdmFyIHJldCA9IEFwcFN0YXRlLmZvcm0udXNlcl9kYXRhLmNyZWF0ZWRfYXQgJiYgZmllbGRzICYmIGZpZWxkcy5yZWR1Y2UoZnVuY3Rpb24ocmVzLCBmaWVsZCkge1xuICAgICAgcmV0dXJuIHJlcyAmJiAhIWZpZWxkLnZhbHVlO1xuICAgIH0sIHRydWUpO1xuICAgIHJldHVybiByZXQgfHwgZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiByZXNldCgpIHtcbiAgICBpZiAoQXBwU3RhdGUudXNlci5pc19hZG1pbikge1xuICAgICAgZW1pdENoYW5nZSh7IGxvYWRpbmc6ICdyZXNldCcgfSk7XG4gICAgICBpZiAoQXBwU3RhdGUuYmFkZ2UgJiYgQXBwU3RhdGUuYmFkZ2UuaWQpIHtcbiAgICAgICAgSHVsbC5hcGkoQXBwU3RhdGUuYmFkZ2UuaWQsICdkZWxldGUnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBBcHBTdGF0ZS5iYWRnZSA9IG51bGw7XG4gICAgICAgICAgSHVsbC5hcGkoQXBwU3RhdGUuZm9ybS5pZCArICcvc3VibWl0JywgJ2RlbGV0ZScsIGZ1bmN0aW9uKGZvcm0pIHtcbiAgICAgICAgICAgIEFwcFN0YXRlLmZvcm0gPSBmb3JtO1xuICAgICAgICAgICAgZW1pdENoYW5nZSh7IGNoYW5nZWQ6ICdyZXNldCcgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgIGNvbnNvbGUud2FybihcIkVycm9yOiBcIiwgZXJyKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbWl0Q2hhbmdlKHsgY2hhbmdlZDogJ3Jlc2V0JyB9KTtcbiAgICAgICAgdGhyb3cgXCJbSW5zdGFudFdpbl0gTm8gYmFkZ2UgZm91bmQgaGVyZS4uLlwiO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBcIltJbnN0YW50V2luXSBZb3UgbmVlZCB0byBiZSBhIGFkbWluaXN0cmF0b3IgdG8gcmVzZXQgYmFkZ2VzXCI7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdHJhbnNsYXRlKGxhbmcpIHtcbiAgICB2YXIgcmV0ID0gQXBwU3RhdGUudHJhbnNsYXRpb25zW2xhbmddIHx8IEFwcFN0YXRlLnRyYW5zbGF0aW9uc1snZW4nXSB8fCB7fTtcbiAgICB2YXIgcmVzdWx0ID0gT2JqZWN0LmtleXMocmV0KS5yZWR1Y2UoZnVuY3Rpb24odHIsIGspIHtcbiAgICAgIHZhciB0ID0gcmV0W2tdO1xuICAgICAgaWYgKHQgJiYgdC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRyW2tdID0gdDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cjtcbiAgICB9LCB7fSk7XG4gICAgY29uc29sZS53YXJuKFwidHJhbnNsYXRpb25zOiBcIiwgbGFuZywgcmVzdWx0KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gb25BdXRoRXZlbnQoKSB7XG4gICAgZW1pdENoYW5nZSh7IGNoYW5nZWQ6ICdsb2FkaW5nJywgbG9hZGluZzogJ3NoaXAnIH0pO1xuICAgIEh1bGwuYXBpKFNoaXAuaWQsIHsgZmllbGRzOiAnYmFkZ2UnIH0pLnRoZW4oZnVuY3Rpb24oc2hpcCkge1xuICAgICAgaW5pdFN0YXRlKEh1bGwuY3VycmVudFVzZXIoKSwgc2hpcCk7XG4gICAgICBpZiAoYXV0b1BsYXkgJiYgdXNlckNhblBsYXkoKSkgcGxheSgpO1xuICAgICAgYXV0b1BsYXkgPSBmYWxzZTtcbiAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGVtaXRDaGFuZ2UoeyBlcnJvcl9tZXNzYWdlOiAnc2hpcF9ub3RfZm91bmQnLCBlcnJvcjogZXJyIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgSHVsbC5vbignaHVsbC5hdXRoLmxvZ2luJywgIG9uQXV0aEV2ZW50KTtcbiAgSHVsbC5vbignaHVsbC5hdXRoLmxvZ291dCcsIG9uQXV0aEV2ZW50KTtcbiAgSHVsbC5vbignaHVsbC5hdXRoLmZhaWwnLCBvbkF1dGhFdmVudCk7XG5cbiAgdmFyIF9saXN0ZW5lcnMgPSBbXTtcblxuICAvLyBQdWJsaWMgQVBJXG5cbiAgdGhpcy5vbkNoYW5nZSA9IGZ1bmN0aW9uKGNiKSB7XG4gICAgdmFyIGNhbGxiYWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIGNiLmFwcGx5KHVuZGVmaW5lZCwgYXJncyk7XG4gICAgICB9KVxuICAgIH07XG4gICAgX2xpc3RlbmVycy5wdXNoKGNhbGxiYWNrKTtcbiAgICBIdWxsLm9uKENIQU5HRV9FVkVOVCwgY2FsbGJhY2spO1xuICB9O1xuXG4gIHRoaXMudGVhcmRvd24gPSBmdW5jdGlvbigpIHtcbiAgICBIdWxsLm9mZignaHVsbC5hdXRoLmxvZ2luJywgIG9uQXV0aEV2ZW50KTtcbiAgICBIdWxsLm9mZignaHVsbC5hdXRoLmxvZ291dCcsIG9uQXV0aEV2ZW50KTtcbiAgICBIdWxsLm9mZignaHVsbC5hdXRoLmZhaWwnLCBvbkF1dGhFdmVudCk7XG4gICAgZm9yICh2YXIgbD0wOyBsIDwgX2xpc3RlbmVycy5sZW5ndGg7IGwrKykge1xuICAgICAgSHVsbC5vZmYoQ0hBTkdFX0VWRU5ULCBsaXN0ZW5lcnNbbF0pO1xuICAgIH1cbiAgfTtcblxuICB0aGlzLmdldFN0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGdldEFwcFN0YXRlKCk7XG4gIH07XG5cbiAgdGhpcy5wbGF5ICAgICAgICAgPSBwbGF5O1xuICB0aGlzLnJlc2V0ICAgICAgICA9IHJlc2V0O1xuICB0aGlzLnN1Ym1pdEZvcm0gICA9IHN1Ym1pdEZvcm07XG4gIHRoaXMudHJhbnNsYXRlICAgID0gdHJhbnNsYXRlO1xuXG4gIGlmIChTaGlwKSB7XG4gICAgaW5pdFN0YXRlKEN1cnJlbnRVc2VyLCBTaGlwKTtcbiAgfVxuXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBmdW5jdGlvbihlKSB7XG4gICAgdmFyIG1lc3NhZ2UgPSBlLmRhdGE7XG4gICAgaWYgKG1lc3NhZ2UgJiYgbWVzc2FnZS5ldmVudCA9PT0gXCJzaGlwLnVwZGF0ZVwiKSB7XG4gICAgICB1cGRhdGVTZXR0aW5ncyhtZXNzYWdlLnNoaXAuc2V0dGluZ3MpO1xuICAgICAgdXBkYXRlVHJhbnNsYXRpb25zKG1lc3NhZ2Uuc2hpcC50cmFuc2xhdGlvbnMgfHwge30pO1xuICAgIH1cbiAgfSwgZmFsc2UpO1xuXG59O1xuXG5cblxuSW5zdGFudFdpbi5TdGVwcyA9IFN0ZXBzO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEluc3RhbnRXaW47XG4iLCJhbmd1bGFyLm1vZHVsZSgnc2NoZW1hRm9ybScpLmNvbmZpZyhcblsnc2NoZW1hRm9ybVByb3ZpZGVyJywgJ3NjaGVtYUZvcm1EZWNvcmF0b3JzUHJvdmlkZXInLCAnc2ZQYXRoUHJvdmlkZXInLFxuICBmdW5jdGlvbihzY2hlbWFGb3JtUHJvdmlkZXIsICBzY2hlbWFGb3JtRGVjb3JhdG9yc1Byb3ZpZGVyLCBzZlBhdGhQcm92aWRlcikge1xuXG4gICAgdmFyIGRhdGVwaWNrZXIgPSBmdW5jdGlvbihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpIHtcbiAgICAgIGlmIChzY2hlbWEudHlwZSA9PT0gJ3N0cmluZycgJiYgKHNjaGVtYS5mb3JtYXQgPT09ICdkYXRlJyB8fCBzY2hlbWEuZm9ybWF0ID09PSAnZGF0ZS10aW1lJykpIHtcbiAgICAgICAgdmFyIGYgPSBzY2hlbWFGb3JtUHJvdmlkZXIuc3RkRm9ybU9iaihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpO1xuICAgICAgICBmLmtleSAgPSBvcHRpb25zLnBhdGg7XG4gICAgICAgIGYudHlwZSA9ICdkYXRlcGlja2VyJztcbiAgICAgICAgb3B0aW9ucy5sb29rdXBbc2ZQYXRoUHJvdmlkZXIuc3RyaW5naWZ5KG9wdGlvbnMucGF0aCldID0gZjtcbiAgICAgICAgcmV0dXJuIGY7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHNjaGVtYUZvcm1Qcm92aWRlci5kZWZhdWx0cy5zdHJpbmcudW5zaGlmdChkYXRlcGlja2VyKTtcblxuICAgIC8vQWRkIHRvIHRoZSBGb3VuZGF0aW9uIGRpcmVjdGl2ZVxuICAgIHNjaGVtYUZvcm1EZWNvcmF0b3JzUHJvdmlkZXIuYWRkTWFwcGluZyhcbiAgICAgICdmb3VuZGF0aW9uRGVjb3JhdG9yJyxcbiAgICAgICdkYXRlcGlja2VyJyxcbiAgICAgICdkaXJlY3RpdmVzL2RlY29yYXRvcnMvZm91bmRhdGlvbi9kYXRlcGlja2VyLmh0bWwnXG4gICAgKTtcbiAgICBzY2hlbWFGb3JtRGVjb3JhdG9yc1Byb3ZpZGVyLmNyZWF0ZURpcmVjdGl2ZShcbiAgICAgICdkYXRlcGlja2VyJyxcbiAgICAgICdkaXJlY3RpdmVzL2RlY29yYXRvcnMvZm91bmRhdGlvbi9kYXRlcGlja2VyLmh0bWwnXG4gICAgKTtcbiAgfVxuXSk7XG4iLCJyZXF1aXJlKCcuL2ZvdW5kYXRpb24tZGVjb3JhdG9yLWRhdGVwaWNrZXInKTtcbmFuZ3VsYXIubW9kdWxlKCdzY2hlbWFGb3JtJykuY29uZmlnKFsnc2NoZW1hRm9ybURlY29yYXRvcnNQcm92aWRlcicsIGZ1bmN0aW9uKGRlY29yYXRvcnNQcm92aWRlcikge1xuICB2YXIgYmFzZSA9ICdkaXJlY3RpdmVzL2RlY29yYXRvcnMvZm91bmRhdGlvbi8nO1xuXG4gIGRlY29yYXRvcnNQcm92aWRlci5jcmVhdGVEZWNvcmF0b3IoJ2ZvdW5kYXRpb25EZWNvcmF0b3InLCB7XG4gICAgdGV4dGFyZWE6IGJhc2UgKyAndGV4dGFyZWEuaHRtbCcsXG4gICAgZmllbGRzZXQ6IGJhc2UgKyAnZmllbGRzZXQuaHRtbCcsXG4gICAgYXJyYXk6IGJhc2UgKyAnYXJyYXkuaHRtbCcsXG4gICAgdGFiYXJyYXk6IGJhc2UgKyAndGFiYXJyYXkuaHRtbCcsXG4gICAgdGFiczogYmFzZSArICd0YWJzLmh0bWwnLFxuICAgIHNlY3Rpb246IGJhc2UgKyAnc2VjdGlvbi5odG1sJyxcbiAgICBjb25kaXRpb25hbDogYmFzZSArICdzZWN0aW9uLmh0bWwnLFxuICAgIGFjdGlvbnM6IGJhc2UgKyAnYWN0aW9ucy5odG1sJyxcbiAgICBkYXRlcGlja2VyOiBiYXNlICsgJ2RhdGVwaWNrZXIuaHRtbCcsXG4gICAgc2VsZWN0OiBiYXNlICsgJ3NlbGVjdC5odG1sJyxcbiAgICBjaGVja2JveDogYmFzZSArICdjaGVja2JveC5odG1sJyxcbiAgICBjaGVja2JveGVzOiBiYXNlICsgJ2NoZWNrYm94ZXMuaHRtbCcsXG4gICAgbnVtYmVyOiBiYXNlICsgJ2RlZmF1bHQuaHRtbCcsXG4gICAgcGFzc3dvcmQ6IGJhc2UgKyAnZGVmYXVsdC5odG1sJyxcbiAgICBzdWJtaXQ6IGJhc2UgKyAnc3VibWl0Lmh0bWwnLFxuICAgIGJ1dHRvbjogYmFzZSArICdzdWJtaXQuaHRtbCcsXG4gICAgcmFkaW9zOiBiYXNlICsgJ3JhZGlvcy5odG1sJyxcbiAgICAncmFkaW9zLWlubGluZSc6IGJhc2UgKyAncmFkaW9zLWlubGluZS5odG1sJyxcbiAgICByYWRpb2J1dHRvbnM6IGJhc2UgKyAncmFkaW8tYnV0dG9ucy5odG1sJyxcbiAgICBoZWxwOiBiYXNlICsgJ2hlbHAuaHRtbCcsXG4gICAgJ2RlZmF1bHQnOiBiYXNlICsgJ2RlZmF1bHQuaHRtbCdcbiAgfSwgW1xuICAgIGZ1bmN0aW9uKGZvcm0pIHtcbiAgICAgIGlmIChmb3JtLnJlYWRvbmx5ICYmIGZvcm0ua2V5ICYmIGZvcm0udHlwZSAhPT0gJ2ZpZWxkc2V0Jykge1xuICAgICAgICByZXR1cm4gYmFzZSArICdyZWFkb25seS5odG1sJztcbiAgICAgIH1cbiAgICB9XG4gIF0sIHsgY2xhc3NOYW1lOiBcInJvd1wiIH0pO1xuXG4gIC8vbWFudWFsIHVzZSBkaXJlY3RpdmVzXG4gIGRlY29yYXRvcnNQcm92aWRlci5jcmVhdGVEaXJlY3RpdmVzKHtcbiAgICB0ZXh0YXJlYTogYmFzZSArICd0ZXh0YXJlYS5odG1sJyxcbiAgICBzZWxlY3Q6IGJhc2UgKyAnc2VsZWN0Lmh0bWwnLFxuICAgIGNoZWNrYm94OiBiYXNlICsgJ2NoZWNrYm94Lmh0bWwnLFxuICAgIGNoZWNrYm94ZXM6IGJhc2UgKyAnY2hlY2tib3hlcy5odG1sJyxcbiAgICBudW1iZXI6IGJhc2UgKyAnZGVmYXVsdC5odG1sJyxcbiAgICBzdWJtaXQ6IGJhc2UgKyAnc3VibWl0Lmh0bWwnLFxuICAgIGJ1dHRvbjogYmFzZSArICdzdWJtaXQuaHRtbCcsXG4gICAgdGV4dDogYmFzZSArICdkZWZhdWx0Lmh0bWwnLFxuICAgIGRhdGU6IGJhc2UgKyAnZGVmYXVsdC5odG1sJyxcbiAgICBwYXNzd29yZDogYmFzZSArICdkZWZhdWx0Lmh0bWwnLFxuICAgIGRhdGVwaWNrZXI6IGJhc2UgKyAnZGF0ZXBpY2tlci5odG1sJyxcbiAgICBpbnB1dDogYmFzZSArICdkZWZhdWx0Lmh0bWwnLFxuICAgIHJhZGlvczogYmFzZSArICdyYWRpb3MuaHRtbCcsXG4gICAgJ3JhZGlvcy1pbmxpbmUnOiBiYXNlICsgJ3JhZGlvcy1pbmxpbmUuaHRtbCcsXG4gICAgcmFkaW9idXR0b25zOiBiYXNlICsgJ3JhZGlvLWJ1dHRvbnMuaHRtbCcsXG4gIH0pO1xuXG59XSkuZGlyZWN0aXZlKCdzZkZpZWxkc2V0JywgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7XG4gICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICBzY29wZTogdHJ1ZSxcbiAgICB0ZW1wbGF0ZVVybDogJ2RpcmVjdGl2ZXMvZGVjb3JhdG9ycy9mb3VuZGF0aW9uL2ZpZWxkc2V0LXRyY2wuaHRtbCcsXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICBzY29wZS50aXRsZSA9IHNjb3BlLiRldmFsKGF0dHJzLnRpdGxlKTtcbiAgICB9XG4gIH07XG59KTtcbiIsImZ1bmN0aW9uIGlzT2JqZWN0KG9iaikge1xuICB2YXIgdHlwZSA9IHR5cGVvZiBvYmo7XG4gIHJldHVybiB0eXBlID09PSAnZnVuY3Rpb24nIHx8IHR5cGUgPT09ICdvYmplY3QnICYmICEhb2JqO1xufTtcblxuXG4gZnVuY3Rpb24gZXh0ZW5kKG9iaikge1xuICBpZiAoIWlzT2JqZWN0KG9iaikpIHJldHVybiBvYmo7XG4gIHZhciBzb3VyY2UsIHByb3A7XG4gIGZvciAodmFyIGkgPSAxLCBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBzb3VyY2UgPSBhcmd1bWVudHNbaV07XG4gICAgZm9yIChwcm9wIGluIHNvdXJjZSkge1xuICAgICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBwcm9wKSkge1xuICAgICAgICAgIG9ialtwcm9wXSA9IHNvdXJjZVtwcm9wXTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG9iajtcbn07XG5cbmZ1bmN0aW9uIG9taXQob2JqIC8qIGtleXMgKi8pIHtcbiAgdmFyIHdpdGhvdXRLZXlzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICByZXR1cm4gb2JqICYmIE9iamVjdC5rZXlzKG9iaikucmVkdWNlKGZ1bmN0aW9uKHMsIGspIHtcbiAgICBpZiAod2l0aG91dEtleXMuaW5kZXhPZihrKSA9PT0gLTEpIHNba10gPSBvYmpba11cbiAgICByZXR1cm4gcztcbiAgfSwge30pO1xufTtcblxuZnVuY3Rpb24gZGVlcENsb25lKG9iaikge1xuICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvYmopKTtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZXh0ZW5kOiBleHRlbmQsXG4gIG9taXQ6IG9taXQsXG4gIGlzT2JqZWN0OiBpc09iamVjdCxcbiAgZGVlcENsb25lOiBkZWVwQ2xvbmVcbn07XG4iXX0=
