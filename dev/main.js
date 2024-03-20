import * as PROJECTS from "./import/projects.js";
import "./import/vh-fix.js";

import "./main.scss"


// LIBRARIES
import hotkeys from 'hotkeys-js';
import LoconativeScroll from "./import/dependencies/loconative/loconative-scroll.min.js";


// GLOBAL VARIABLES
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
function addClassAll(e, c)    { e.forEach((el) => { el.classList.add(c); }); }
function removeClassAll(e, c) { e.forEach((el) => { el.classList.remove(c); }); }
function toggleClassAll(e, c) { e.forEach((el) => { el.classList.toggle(c); }); }

function randomIntFromInterval(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min)
}


// RUN

// SMOOTH SCROLL
// https://github.com/quentinhocde/loconative-scroll
const scrollDoc = new LoconativeScroll({
    smooth: true,
    duration: 0.85,
    easing: (x) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x)),
    scrollToEasing: (x) => (x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1),
    offset: ["0%", "0%"],
});
const scrollToDuration = 1;

// footer button email copy
const footerCTA = document.querySelector("footer-cta button");
footerCTA.addEventListener("click", () => {
    navigator.clipboard.writeText("hello@yolan.design").then(() => {
        // success
        footerCTA.classList.add("copied");
        footerCTA.style.setProperty('--random-rotate', randomIntFromInterval(-45, 45) +"deg");
    },
    () => {
        // failed to copy
        location.href = "mailto:hello@yolan.design";
        //TOFIX le texte reste "cliquez pour copier", ce serait bien de pouvoir changer avant même le clique pour "cliquez pour me contacter"
    });

    // bounce
    footerCTA.classList.add("copied-anim-bounce");
    setTimeout(() => {
        footerCTA.classList.remove("copied-anim-bounce");
    }, 180);
})
footerCTA.addEventListener("mouseenter", () => {
    footerCTA.classList.remove("copied");
})

// GGRID display
const ggridDisplay = document.querySelectorAll("ggrid");
if (ggridDisplay) {
    hotkeys('shift+g', {keydown: true}, function(event, handler){
        if (event.type === 'keydown') {
            event.preventDefault()
            toggleClassAll(ggridDisplay, "hidden");
        }
    });
}