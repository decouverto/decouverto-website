(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
var walksDivs=document.getElementsByClassName("walks"),walks=[],sectors=[],sectorsInput=document.getElementById("sectors-input"),themes=[],themesInput=document.getElementById("themes-input"),types=[],typesInput=document.getElementById("types-input");Array.prototype.forEach.call(walksDivs,function(e){var t={id:e.id,title:e.getElementsByClassName("title")[0].innerHTML,description:e.getElementsByClassName("description")[0].innerHTML,type:e.getElementsByClassName("type")[0].innerHTML,theme:e.getElementsByClassName("theme")[0].innerHTML,zone:e.getElementsByClassName("zone")[0].innerHTML};if(sectors.indexOf(t.zone)<0){sectors.push(t.zone);var s=document.createElement("option");s.text=t.zone,s.value=t.zone,sectorsInput.add(s)}if(types.indexOf(t.type)<0){types.push(t.type);var s=document.createElement("option");s.text=t.type,s.value=t.type,typesInput.add(s)}if(themes.indexOf(t.theme)<0){themes.push(t.theme);var s=document.createElement("option");s.text=t.theme,s.value=t.theme,themesInput.add(s)}walks.push(t)});
},{}]},{},[1]);
