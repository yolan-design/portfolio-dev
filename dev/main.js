import * as PROJECTS from "./import/projects.js";
import "./import/vh-fix.js";

import "./main.scss"

const doc = document.documentElement;

// HELPER FUNCTIONS

// call function at end of css transition of element (no propagation, option to do it only once)
function eventAtTransitionEnd(elem, func, {property = false, once = true, debug = false}) {
    if (!property) { // will check for all css properties
        elem.addEventListener("transitionend", () => { func(); }, { once : once });
    } else { // will check only for specified css property
        elem.addEventListener("transitionend", (ev) => { if (ev.propertyName == property) { func(); }}, { once : once });
    }

    // debug transition events
    if (debug) { elem.addEventListener("transitionend", (ev) => { console.debug("tr end: "+ ev.propertyName + ((property) ? (" (selected)") : "")); }); }

    var isNotAlready = true;
    trEndAlready.forEach((e) => { isNotAlready &= (e == elem) ? false : true; }); // check if already checking for trEnd
    if (isNotAlready) {
        trEndAlready.push(elem);
        elem.childNodes.forEach((el) => { el.addEventListener("transitionend", (ev) => { ev.stopPropagation(); })});
    }
} var trEndAlready = [];

// add/remove class to query selected elements
function addClassAll(selector, c) {
    document.querySelectorAll(selector).forEach((el) => { el.classList.add(c); });
}
function removeClassAll(selector, c) {
    document.querySelectorAll(selector).forEach((el) => { el.classList.remove(c); });
}

function randomIntFromInterval(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min)
}


// RUN

// footer button email copy*
const footerCTA = document.querySelector("footer-cta button");
footerCTA.addEventListener("click", () => {
    navigator.clipboard.writeText("hello@yolan.design");
    footerCTA.classList.add("copied");

    footerCTA.style.setProperty('--random-rotate', randomIntFromInterval(-45, 45) +"deg");
    footerCTA.classList.add("copied-anim-bounce");
    setTimeout(() => {
        footerCTA.classList.remove("copied-anim-bounce");
    }, 180);
})
footerCTA.addEventListener("mouseenter", () => {
    footerCTA.classList.remove("copied");
})