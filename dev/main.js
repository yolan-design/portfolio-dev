import * as DATA_PROJECTS from "./import/projects.js";
import * as DATA_LANG from "./import/lang.js";
import "./import/vh-fix.js";

import "./main.scss"


// LIBRARIES
import Swup from 'swup';
import SwupScrollPlugin from '@swup/scroll-plugin';
import SwupPreloadPlugin from '@swup/preload-plugin';
import LocomotiveScroll from "./import/dependencies/scroll/locomotive-scroll.js";
import anime from 'animejs/lib/anime.es.js';
import SplitType from 'split-type';
import hotkeys from 'hotkeys-js';


SplitType.setDefaults({
    tagName: "span",
});


// GLOBAL VARIABLES
const doc = document.documentElement,
      docSizePhone = 700;


// EVENT LISTENERS HANDLING
var eventListeners = {};
/*
if (!eventListeners.event__func) {
    eventListeners.event__func = el.addEventListener("event", () => func());
}
*/
/*
if (!el.onclick) { el.onclick = () => {
}}
*/


// HELPER FUNCTIONS

const requestAnimationFrame = window.requestAnimationFrame
  || window.mozRequestAnimationFrame
  || window.webkitRequestAnimationFrame
  || window.msRequestAnimationFrame;
const cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;


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

// will alternate between - and + at each call
let randomIntFromIntervalAlternate_currentAlt = parseInt(Math.random().toFixed());
function randomIntFromIntervalAlternate(min, max) {
    randomIntFromIntervalAlternate_currentAlt = (randomIntFromIntervalAlternate_currentAlt >= 0) ? -1 : 1; // invert
    return randomIntFromInterval(min, max) * randomIntFromIntervalAlternate_currentAlt;
}

// take a value, scale it from a range to another
function mapRange(value, low1, high1, low2, high2) { // Processing's map function
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}
function mapRangeClamp(value, low1, high1, low2, high2) {
    return Math.min(Math.max( low2 + (high2 - low2) * (value - low1) / (high1 - low1) , low2), high2); // clamped min/max to low2/high2
}
function mapRangeRound(value, low1, high1, low2, high2) {
    return parseFloat( low2 + (high2 - low2) * (value - low1) / (high1 - low1) ).toFixed(2); // round to .01
}

// clamp to min/max
function clamp(value, low, high) {
    return Math.min(Math.max(value, low), high);
}

// check if var is string
function isString(check) { return (typeof check === "string"); }

// convert to float and round to .01
function float(str) { return parseFloat(str.toFixed(2)) }

// get specified element's center position as tuple
function getCenterOfEl(el) {
    const elRect = el.getBoundingClientRect();
    return [elRect.left + (elRect.width / 2),
            elRect.top + (elRect.height / 2)]
}

// remove all classes starting with [prefix] from element
function removeClassStartingWith(el, prefix) {
    const classes = el.className.split(" ").filter(c => !c.startsWith(prefix));
    el.className = classes.join(" ").trim();
}

// GET AGE
function getAge(dateString) {
    let today = new Date();
    let birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    let m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; }
    return age;
}

// BOOM ANIM
function boomAnim_init({boomOrigin, target, container, special, eventType = "mousedown"}) {
    target.addEventListener(eventType, (ev) => { boomAnim({boomOrigin : (boomOrigin != undefined) ? boomOrigin : ev, target : target, container : container, special : special, eventType : eventType}); });
}

function boomAnim({
    // if specified ("mousedown" event var) will appear from cursor position,
    // else from center of target if specified,
    // else center of container
    boomOrigin = false,

    // if specified : will dismiss boom when "mouseup" or "mouseleave",
    // else will dismiss itself right away
    target = false,

    // boom will fill container
    // default: page viewport
    container = doc,

    // custom css styling (attribute value goes here)
    special = false,

    // dismiss delay (ms)
    fadeOutTime = 1500,

    eventType
}) {
    // origin position of boom
    var originX, originY;
    if (!boomOrigin) { // not at cursor position
        if (!target) { // not at target position
            // will be at center of container
            [originX, originY] = getCenterOfEl(container);
        } else {
            [originX, originY] = getCenterOfEl(target);
        }
    } else { // click position
        originX = boomOrigin.clientX,
        originY = boomOrigin.clientY;
    }

    const containerW = container.clientWidth, containerH = container.clientHeight,
          // get farthest corner from origin
          cornerX = Math.abs(originX - ((originX > containerW / 2) ? 0 : containerW)),
          cornerY = Math.abs(originY - ((originY > containerH / 2) ? 0 : containerH)),
          // use Pythagoras to get circle parameters
          circleDiameter = float(Math.sqrt(cornerX**2 + cornerY**2) + 5) * 2, // get diameter + add 5px to be sure it fills the whole container
          circleRotate = float(Math.atan(cornerX / cornerY) * 180 / Math.PI) * -1; // get angle to match middle of the circle div edge
          //console.table({containerW2,containerH2, originX,originY, cornerX,cornerY, circleDiameter,circleRotate}) // debug values

    // generate
    var boom = document.createElement("div"),
        boomCircle = document.createElement("div");

    boom.classList.add("boom");
    boomCircle.classList.add("circle");
    if(special) { boom.setAttribute("special", special); }

    boom.style.setProperty("--boom-rotate", circleRotate +"deg");
    boom.style.setProperty("--boom-x", originX +"px");
    boom.style.setProperty("--boom-y", originY +"px");

    // create
    const containerName = (container == doc) ? "boom-main-container" : "boom-container";
    let boomContainer = container.querySelector("["+ containerName +"]");
    if (!boomContainer) {
        boomContainer = document.createElement("div");
        boomContainer.setAttribute(containerName, "");
        container.appendChild(boomContainer);
    }
    boomContainer.appendChild(boom);

    boom.appendChild(boomCircle);

    // animation in
    setTimeout(function() { // delay for computing
        boomCircle.style.setProperty("--boom-size", circleDiameter +"px");
        boomCircle.style.setProperty("--boom-fadeout-time", fadeOutTime +"ms");
        boomCircle.classList.add("final-style");
    }, 10);

    // dismissing the boom
    function boomRemove() {
        setTimeout(function() { // delay for computing
            // animation out
            boomCircle.style.opacity = "0";
            setTimeout(function() {
                boom.remove();
            }, fadeOutTime);
        }, 10);
    }

    if (eventType == "mousedown") {
        // if there is a target element, wait for these events
        if(target) {
            if (!target.onmouseup) { target.onmouseup = () => {
                boomRemove();
            }}
            if (!target.onmouseleave) { target.onmouseleave = () => {
                boomRemove();
            }}
        }
        // else dismiss right away
        else { boomRemove(); }
    }
    else { boomRemove(); }
}



// RUN

// CURRENT PAGE
let pageID;
function getPageID() {
    pageID = window.location.pathname.split("/")
    if (pageID[pageID.length -1] == "") { pageID.pop(); }
    pageID = pageID[pageID.length -1];
    pageID = (pageID == "") ? "home" : pageID;
    doc.setAttribute("page", pageID);
}


// LANG
let LANG = {
    translations : DATA_LANG.translations,
    langBrowser : (navigator.language).split("-")[0], // navigator's language
    langCurrent : "",
    langList : ["en", "fr"],
}
let footerCTA_copiedNotif_alt;
// set the current language / fallback to default language if not listed
LANG.langCurrent = (LANG.langList.includes(LANG.langBrowser)) ? LANG.langBrowser : LANG.langList[0];
function langGetInvert() { return LANG.langList[Math.abs(LANG.langList.indexOf(LANG.langCurrent) - 1)]; }

// get translations from database with error handling
function translateGet({
    id, getLang = LANG.langCurrent, getPage,
    substitute = true // if translation not found : will substitute with other language
}) {
    const translateGrab = (id, getLang, getPage) => { return DATA_LANG.translations[getLang][(getPage) ? getPage : pageID][id]; }

    const grab = translateGrab(id, getLang, getPage);

    if (!grab) {
        if (substitute) {
            const translationSubstitute = translateGrab(id, langGetInvert(), getPage);
            if (!translationSubstitute) {
                console.error("TRANSLATION NOT FOUND IN [ ANY LANGUAGE ] FOR ["+ id +"]");
            } else {
                console.error("TRANSLATION NOT FOUND IN [ "+ LANG.langCurrent +" ] FOR [ "+ id +" ]", "\n", ">>> SUBSTITUTED WITH [ "+ langGetInvert() +" ]");
            }
            return translationSubstitute;
        } else {
            console.error("TRANSLATION NOT FOUND IN [ "+ LANG.langCurrent +" ] FOR ["+ id +"]");
        }
    }
    else {
        return grab;
    }
}

function translateElements({
    elements = doc.querySelectorAll("*[translate-id]"), // elements to translate
    langSwitch = false, // change language
    substitute
}) {

    // swtich language
    if (langSwitch) {
        LANG.langCurrent = langGetInvert();
    }

    // page title
    document.title = ((pageID != "home")
        ? translateGet({id : "nav-page-"+ pageID, getPage : "_general"}) + "\u205f\u205f·\u205f\u205f" : ""
        ) + "yolan.design";

    // css
    doc.setAttribute("translate-lang-current", LANG.langCurrent);

    if (elements) {
        elements.forEach((el) => {
            const tID = el.getAttribute("translate-id"),
                  tFrom = el.getAttribute("translate-from"),
                  translation = translateGet({id : tID, getPage : tFrom, substitute : substitute});

            if (tID.includes("--html")) {
                el.innerHTML = translation;
            } else {
                el.innerText = translation;
            }
        })
    }

    footerCTA_copiedNotif_alt = translateGet({id : "footer-cta-email-click-notif--array", getPage : "_general"});

    animOnView_initTxt();
}

// TRANSLATE SWITCHES
let translateSwitches;
function translateSwitches_init() {
    translateSwitches = doc.querySelectorAll("[translate-switch]");
    if(translateSwitches) {
        translateSwitches.forEach((btn) => {
            if (!btn.onclick) {
                btn.onclick = () => {
                    translateElements({langSwitch : true});
                }
                boomAnim_init({boomOrigin : false, target : btn, special : "btn-translate", eventType : "click"});
            }
        })
    }
}


// SMOOTH SCROLL
const ScrollMain_options = {
    global: {
        lenisOptions: {
            smoothWheel: true,
            smoothTouch: false,
            wheelMultiplier: 0.95,
            duration: 1.2,
            easing: (x) => Math.min(1, 1.001 - Math.pow(5, -6.1 * x)), // https://www.desmos.com/calculator/brs54l4xou
            orientation: 'vertical',
            gestureOrientation: 'vertical',
        },
        triggerRootMargin: '-1px -1px -1px -1px', // inview elements
        rafRootMargin: '100% 100% 100% 100%', // scroll elements
        autoResize: true,
        scrollCallback: ScrollMain_onScroll,
    },
    scrollTo: {
        duration: 1.4,
        lock: false,
        easing: (x) => (x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2),
    }
}
let ScrollMain;


// TRANSITION BG-DYNAMIC
let DYNAMIC_COLORS = {
    default : {
        lift : getComputedStyle(doc).getPropertyValue("--rgb-main-lift"),
        accent : getComputedStyle(doc).getPropertyValue("--rgb-main-fill"),
        fill : getComputedStyle(doc).getPropertyValue("--rgb-main-fill"),
        bg : getComputedStyle(doc).getPropertyValue("--rgb-main-bg"),
    },
    current : {
        lift : "",
        accent : "",
        fill : "",
        bg : "",
    },
    applied : {}
}
DYNAMIC_COLORS.applied = {
    lift : DYNAMIC_COLORS.default.lift,
    accent : DYNAMIC_COLORS.default.accent,
    fill : DYNAMIC_COLORS.default.fill,
    bg : DYNAMIC_COLORS.default.bg,
}

// default dynamic colors
function elSetDefaultDynamicColor({targets, attribute, defaultColor, defaultFromAttribute, defaultColorFallback}) {
    if (targets) {
        // doc.querySelectorAll("*["+ attribute +"]").forEach((el) => {
        targets.forEach((el) => {
            // set to default if does not exist
            if (!el.getAttribute(attribute)) {
                el.setAttribute(attribute,
                    ((defaultColor) ? defaultColor : (
                        (el.getAttribute(defaultFromAttribute)) ? el.getAttribute(defaultFromAttribute) : defaultColorFallback)
                        )
                    )
            }

            // remove "rgb( -- )"
            if (el.getAttribute(attribute).includes("(")) {
                el.setAttribute(attribute, el.getAttribute(attribute).match(/\(([^()]+)\)/)[1]);
            }
        })
    }
}

function dynamicColorUpdate(el) {
    if ( // only run if new color
           DYNAMIC_COLORS.current.lift != el.getAttribute("dynamic_color-lift")
        || DYNAMIC_COLORS.current.accent != el.getAttribute("dynamic_color-accent")
        || DYNAMIC_COLORS.current.fill != el.getAttribute("dynamic_color-fill")
        || DYNAMIC_COLORS.current.bg != el.getAttribute("dynamic_color-bg")
        ) {

        DYNAMIC_COLORS.current.lift = el.getAttribute("dynamic_color-lift");
        DYNAMIC_COLORS.current.accent = el.getAttribute("dynamic_color-accent");
        DYNAMIC_COLORS.current.fill = el.getAttribute("dynamic_color-fill");
        DYNAMIC_COLORS.current.bg = el.getAttribute("dynamic_color-bg");

        const colorsVar = {
            dynamicLift: DYNAMIC_COLORS.applied.lift,
            dynamicAccent: DYNAMIC_COLORS.applied.accent,
            dynamicFill: DYNAMIC_COLORS.applied.fill,
            dynamicBg: DYNAMIC_COLORS.applied.bg,
        }
        anime({
            targets: colorsVar,
            easing: 'easeInOutCubic',
            duration: 2000,
            round: 100,

            dynamicLift: [DYNAMIC_COLORS.applied.lift, el.getAttribute("dynamic_color-lift")],
            dynamicAccent: [DYNAMIC_COLORS.applied.accent, el.getAttribute("dynamic_color-accent")],
            dynamicFill: [DYNAMIC_COLORS.applied.fill, el.getAttribute("dynamic_color-fill")],
            dynamicBg: [DYNAMIC_COLORS.applied.bg, el.getAttribute("dynamic_color-bg")],

            update: () => {
                doc.style.setProperty('--dynamic-lift', colorsVar.dynamicLift);
                doc.style.setProperty('--dynamic-accent', colorsVar.dynamicAccent);
                doc.style.setProperty('--dynamic-fill', colorsVar.dynamicFill);
                doc.style.setProperty('--dynamic-bg', colorsVar.dynamicBg);

                DYNAMIC_COLORS.applied.lift = colorsVar.dynamicLift;
                DYNAMIC_COLORS.applied.accent = colorsVar.dynamicAccent;
                DYNAMIC_COLORS.applied.fill = colorsVar.dynamicFill;
                DYNAMIC_COLORS.applied.bg = colorsVar.dynamicBg;
            },
        });
    }
}


// NAV ANCHORS
let pageAnchorsSections, check_pageAnchorsSections, anchorLinks;

function navAnchors_init() {
    pageAnchorsSections = document.querySelectorAll("[nav-anchor-section]");
    check_pageAnchorsSections = (!!pageAnchorsSections);
    // pageAnchorsScrolls = document.querySelectorAll("[nav-anchor-scoll]");
    anchorLinks = document.querySelectorAll("[nav-anchor-link]");

    if (check_pageAnchorsSections) {
        elSetDefaultDynamicColor({targets : pageAnchorsSections, attribute : "dynamic_color-lift", defaultColor : DYNAMIC_COLORS.default.lift});
        elSetDefaultDynamicColor({targets : pageAnchorsSections, attribute : "dynamic_color-accent", defaultFromAttribute : "dynamic_color-fill", defaultColorFallback : DYNAMIC_COLORS.default.accent});
        elSetDefaultDynamicColor({targets : pageAnchorsSections, attribute : "dynamic_color-fill", defaultColor : DYNAMIC_COLORS.default.fill});
        elSetDefaultDynamicColor({targets : pageAnchorsSections, attribute : "dynamic_color-bg", defaultColor : DYNAMIC_COLORS.default.bg});
    }
}

function pageAnchorsSections_onScroll() {
    pageAnchorsSections.forEach((anchorSection) => {
        const anchorSectionRect = anchorSection.getBoundingClientRect(),
              anchorLink = document.querySelector("[nav-anchor-link='"+ anchorSection.getAttribute("nav-anchor-section") +"']"),
              splitSection = doc.clientHeight / 2;

        if (anchorSectionRect.y < splitSection && anchorSectionRect.bottom > splitSection) {
            if (anchorLink) { anchorLink.classList.add("active"); }
            dynamicColorUpdate(anchorSection);
        } else {
            if (anchorLink) { anchorLink.classList.remove("active"); }
        }
    })
}


// NAV ANCHORS SCROLL TO
function navAnchors_scrollTo() {
    if (anchorLinks) {
        anchorLinks.forEach((anchorLink) => {
            if (!anchorLink.onclick) { anchorLink.onclick = () => {
                const anchorID = anchorLink.getAttribute("nav-anchor-link"),
                        scrollToTarget = document.querySelector("[nav-anchor-scroll='"+ anchorID +"']");

                if (scrollToTarget) {
                    if (anchorID == "contact") {
                        ScrollMain.scrollTo("bottom", {
                            ...ScrollMain_options.scrollTo,
                            offset : 0
                        });
                    } else {
                        ScrollMain.scrollTo(scrollToTarget, {
                            ...ScrollMain_options.scrollTo,
                            offset : doc.clientHeight * -0.15 //-150
                        });
                    }

                    // hide active nav-anchor-link during the scrollTo
                    setTimeout(() => {
                        document.querySelector("nav-anchors").classList.add("active-pause");
                        setTimeout(() => {
                            document.querySelector("nav-anchors").classList.remove("active-pause");
                        }, ScrollMain_options.scrollTo.duration * 550);
                    }, ScrollMain_options.scrollTo.duration * 300);

                    // close menu if mobile
                    if (doc.clientWidth < docSizePhone) {
                        doc.classList.remove("nav-menu-open");
                    }
                }
            }}
        })
    };
}


// NAV MENU TOGGLE
const navMenuButton = document.querySelectorAll("nav-bar #nav-btn-toggle-menu");
if (navMenuButton) {
    navMenuButton.forEach((btn) => {
        if (!btn.onclick) { btn.onclick = () => {
            doc.classList.toggle("nav-menu-open");
        }}
    })
}


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


// FOOTER BUTTON EMAIL COPY
let footerCTA, footerContactWrapper, check_footerContactReveal;

function footer_init() {
    footerCTA = document.querySelector("footer-cta button");
    footerContactWrapper = doc.querySelector("footer-contact > wrapper");
    check_footerContactReveal = (!!footerContactWrapper);

    if (footerCTA) {
        const footerCTA_copiedNotif = footerCTA.querySelector(".tip.copied-notif span");

        let footerCTA_copiedRandom = 0,
        footerCTA_copiedComboCooldownStatus = 0;

        function footerCTA_copiedComboCooldown() {
            setTimeout(() => {
                footerCTA_copiedComboCooldownStatus -= 1;

                if (footerCTA_copiedComboCooldownStatus >= 1) {
                    footerCTA_copiedComboCooldown();
                }
            }, 500);
        }


        if (!footerCTA.onclick) { footerCTA.onclick = () => {
            navigator.clipboard.writeText("hello@yolan.design").then(() => { // success
                footerCTA.classList.add("copied");
                footerCTA.style.setProperty('--random-rotate', randomIntFromIntervalAlternate(5, 45) +"deg");

                // funny copy combo
                if (footerCTA_copiedComboCooldownStatus == 0) { footerCTA_copiedComboCooldown(); }
                footerCTA_copiedComboCooldownStatus += 1;

                if (footerCTA_copiedComboCooldownStatus >= 6) {
                    footerCTA_copiedComboCooldownStatus = 6; // max

                    const rand = randomIntFromInterval(1, footerCTA_copiedNotif_alt.length - 1);
                    footerCTA_copiedRandom = (rand == footerCTA_copiedRandom) ? rand - 1 : rand; // always different, worst case it will select "0"

                    footerCTA_copiedNotif.innerText = footerCTA_copiedNotif_alt[footerCTA_copiedRandom];
                } else {
                    footerCTA_copiedNotif.innerText = footerCTA_copiedNotif_alt[0];
                }
            },
            () => { // failed to copy
                location.href = "mailto:hello@yolan.design";
                //TOFIX le texte reste "cliquez pour copier", ce serait bien de pouvoir changer avant même le clique pour "cliquez pour me contacter"
            });

            // bounce
            footerCTA.classList.add("copied-anim-bounce");
            setTimeout(() => {
                footerCTA.classList.remove("copied-anim-bounce");
            }, 180);
        }}
        if (!footerCTA.onmouseenter) { footerCTA.onmouseenter = () => {
            footerCTA.classList.remove("copied");
            footerCTA_copiedNotif.innerText = footerCTA_copiedNotif_alt[0];
        }}
    }
}


// FOOTER SCROLL REVEAL
function footerContactReveal_onScroll() {
    // const progress = Math.min((doc.clientHeight / args.currentElements['footer-contact'].el.getBoundingClientRect().bottom) + 0.0015, 1);
    const elParentRect = footerContactWrapper.parentElement.getBoundingClientRect(),
          progressFactor = mapRangeClamp(((elParentRect.top - doc.clientHeight) * -1.05), 0, elParentRect.height, 0, 1);

    footerContactWrapper.style.opacity = progressFactor;
    footerContactWrapper.style.transform = "translate3d(0, "+ (-100 * (progressFactor - 1)) +"px, 0)"; // scale("+ (0.75 + progress / 4) +")
}


// ANIM STROKE ON SCROLL
function logoAnimSVG(e) {
    const { target, way, from } = e.detail;
    if (way == "enter" && from == "start") {
        anime({
            targets: target.querySelectorAll("g > *"),
            strokeDashoffset: [anime.setDashoffset, 0],
            easing: 'cubicBezier(0.4, 0.6, 0.4, 0.95)',
            duration: function(el, i) { return (el.hasAttribute("anim-duration")) ? parseInt(el.getAttribute("anim-duration")) : 2500 },
            loop: false,
            delay: function(el, i) { return i * 150 },
            update: function(anim) {
                if (anim.progress > 60) { target.querySelector("g").classList.add("fill-i");
                } else { target.querySelector("g").classList.remove("fill-i"); }
            }
        });
    }
};
window.addEventListener('logo_anim_svg_stroke', (e) => logoAnimSVG(e));


// ON SCOLL ZOOM IN REVEAL
let zoomInScrollElements, check_zoomInScroll;
function zoomInScroll_init() {
    zoomInScrollElements = doc.querySelectorAll("[y-onscroll-zoom-in]");
    check_zoomInScroll = (!!zoomInScrollElements);

    if (check_zoomInScroll) {
        zoomInScrollElements.forEach((el) => {
            /* el.setAttribute("data-scroll", "");
            el.setAttribute("data-scroll-css-progress", "");
            el.setAttribute("data-scroll-position", "start,start"); */
            el.setAttribute("data-scroll-offset", "0");
            el.setAttribute("y-onscroll-zoom-in--fraction",
                (el.getAttribute("y-onscroll-zoom-in--fraction")) ? el.getAttribute("y-onscroll-zoom-in--fraction") : 2);
            el.setAttribute("y-onscroll-zoom-in--strength",
                (el.getAttribute("y-onscroll-zoom-in--strength")) ? el.getAttribute("y-onscroll-zoom-in--strength") : 0.92);
            el.style.setProperty("--zoom-factor", parseFloat(el.getAttribute("y-onscroll-zoom-in--strength")));
        })
    }
}
function zoomInScroll_onScroll() {
    zoomInScrollElements.forEach((el) => {
        const elRect = el.getBoundingClientRect(),
              progressFactor = mapRangeClamp(
                    (doc.clientHeight - elRect.top),
                    0,
                    doc.clientHeight / parseFloat(el.getAttribute("y-onscroll-zoom-in--fraction")),
                    parseFloat(el.getAttribute("y-onscroll-zoom-in--strength")),
                    1
              );

        el.style.setProperty("--zoom-factor", progressFactor);
    })
}


// SLIDER INFINITE
let SliderInfinite = {
    idleLoop: undefined,
    elements: undefined,
    check: undefined,
    instances: [],

    properties: {
        idle: {
            move: -0.8, // px per frame
        },
        scroll:{
            strength: -0.6, // velocity multiplicator
        },
        drag: {
            isDragging: false,
            strength: 2.5, // multiplicator
            mousePrevious: undefined,
            mouseCurrent: undefined,

            posFrom: 0,
            posAnimated: 0,
            posTo: 0,
        },
    },
}

function sliderInfinite_init() {
    SliderInfinite.elements = doc.querySelectorAll("*[y-slider-infinite]");
    SliderInfinite.check = (!!SliderInfinite.elements);
    SliderInfinite.instances = [];

    if (SliderInfinite.check) {
        let sliderInstanceIndex = 0;

        SliderInfinite.elements.forEach(targetSlider => {
            targetSlider.setAttribute("data-scroll", "");
            targetSlider.setAttribute("data-scroll-repeat", "");
            targetSlider.setAttribute("data-scroll-position", "start,end");
            targetSlider.setAttribute("data-scroll-offset", "5%,-5%");
            targetSlider.setAttribute("y-slider-infinite-id", sliderInstanceIndex);

            // duplicate slider-items-group
            const itemsGroup = targetSlider.querySelector(".slider-items-group"),
                  itemsGroupClone = itemsGroup.cloneNode(true);
            itemsGroup.parentNode.appendChild(itemsGroupClone);

            SliderInfinite.instances.push([
                -100, // init position of each slider in order
                0, 0, 0, 0, 0 // init values / updated in [sliderInfinite_updateSizes]
            ]);

            sliderInfinite_idle(targetSlider, sliderInstanceIndex);

            // drag interactions
            if (!targetSlider.onmousemove) { targetSlider.onmousedown = (e) => sliderInfinite_dragToggleDown(e) };
            if (!targetSlider.onmousemove) { targetSlider.onmouseup = (e) => sliderInfinite_dragToggleUp(e) };
            if (!targetSlider.onmousemove) { targetSlider.onmouseout = (e) => sliderInfinite_dragToggleUp(e) };
            if (!targetSlider.onmousemove) { targetSlider.onmousemove = (e) => sliderInfinite_dragMove(e) };

            sliderInstanceIndex++
        });

        // global updates init
        sliderInfinite_updateSizes();
        if (!eventListeners.resize__sliderInfinite_updateSizes) {
            eventListeners.resize__sliderInfinite_updateSizes = window.addEventListener("resize", sliderInfinite_updateSizes);
        }
    }
}
function sliderInfinite_clear() {
    if (SliderInfinite.idleLoop) {
        SliderInfinite.idleLoop = false;
    }

    if (eventListeners.resize__sliderInfinite_updateSizes) {
        window.removeEventListener("resize", sliderInfinite_updateSizes);
        eventListeners.resize__sliderInfinite_updateSizes.remove();
    }
}

function sliderInfinite_updateSizes() {
    SliderInfinite.elements.forEach(targetSlider => {
        const index = targetSlider.getAttribute("y-slider-infinite-id"),
              itemWidth = targetSlider.querySelector(".slider-item").getBoundingClientRect().width,
              itemsToScreenProportion = doc.clientWidth / itemWidth,
              itemsNb = Math.ceil(itemsToScreenProportion),
              itemOffScreenPercent = itemsNb - itemsToScreenProportion,
              itemOffScreenPx = itemWidth * -itemOffScreenPercent,
              endOfLoop = -targetSlider.querySelector(".slider-items-group").getBoundingClientRect().width; // + ((itemWidth * itemsNb) - itemOffScreenPx)

        SliderInfinite.instances[index][1] = itemWidth;
        SliderInfinite.instances[index][2] = itemsNb;
        SliderInfinite.instances[index][3] = itemOffScreenPercent;
        SliderInfinite.instances[index][4] = itemOffScreenPx;
        SliderInfinite.instances[index][5] = endOfLoop;
    });
}

function sliderInfinite_apply(targetSlider, index, move) {
    // checks
    let newPos = SliderInfinite.instances[index][0] + move;
    if (newPos > 0) { // loop start
        sliderInfinite_updateSizes();
        newPos = SliderInfinite.instances[index][5];
    } else if (newPos < SliderInfinite.instances[index][5]) { // loop end
        sliderInfinite_updateSizes();
        newPos = 0;
    }

    // apply
    SliderInfinite.instances[index][0] = newPos;
    targetSlider.children[0].style.transform = "translate3D("+ newPos +"px, 0, 0)";
}

function sliderInfinite_idle(targetSlider, index) {
    if (!SliderInfinite.idleLoop) {

        function animate(index) {
            if (SliderInfinite.properties.drag.isDragging) {
                SliderInfinite.properties.drag.posFrom = (SliderInfinite.properties.drag.mouseCurrent - SliderInfinite.properties.drag.mousePrevious) * SliderInfinite.properties.drag.strength;
                SliderInfinite.properties.drag.mousePrevious = SliderInfinite.properties.drag.mouseCurrent;
            }

            // animate
            if (SliderInfinite.properties.drag.posFrom != SliderInfinite.properties.drag.posTo) {
                SliderInfinite.properties.drag.posTo = SliderInfinite.properties.drag.posFrom; // only run if new pos

                const posVar = {
                    move: SliderInfinite.properties.drag.posAnimated,
                }
                anime({
                    targets: posVar,
                    easing: "easeOutExpo",
                    duration: 1350,

                    move: [SliderInfinite.properties.drag.posAnimated, SliderInfinite.properties.drag.posFrom],

                    update: () => {
                        SliderInfinite.properties.drag.posAnimated = posVar.move;
                    },
                });
            }

            sliderInfinite_apply(targetSlider, index, SliderInfinite.properties.drag.posAnimated + SliderInfinite.properties.idle.move);
        }

        function loop() {
            if (SliderInfinite.idleLoop) {
                if (targetSlider.classList.contains("is-inview")) {
                    animate(index);
                }
                else if(ScrollMain.lenisInstance.targetScroll < 5) { // hotfix : locomotive bug? : class [is-inview] is removed at [scroll-position = 0]
                    animate(0); // [index = 0] : only on the first slider because performances
                }

                SliderInfinite.idleLoop = requestAnimationFrame(loop);
            }
        };

        SliderInfinite.idleLoop = true;
        SliderInfinite.idleLoop = requestAnimationFrame(loop);
    }
}

function sliderInfinite_onScroll(velocity) {
    SliderInfinite.elements.forEach(targetSlider => {
        if (targetSlider.classList.contains("is-inview")) {
            sliderInfinite_apply(targetSlider, targetSlider.getAttribute("y-slider-infinite-id"), (Math.abs(velocity) * SliderInfinite.properties.scroll.strength));
        }
    });
}

function sliderInfinite_dragToggleDown(e) {
    SliderInfinite.properties.drag.mouseCurrent = e.clientX;
    SliderInfinite.properties.drag.mousePrevious = SliderInfinite.properties.drag.mouseCurrent;
    SliderInfinite.properties.drag.isDragging = true;
}
function sliderInfinite_dragToggleUp(e) {
    e.stopPropagation(); // dunno if this works
    SliderInfinite.properties.drag.mouseCurrent = 0;
    SliderInfinite.properties.drag.mousePrevious = 0;
    SliderInfinite.properties.drag.posFrom = 0;
    SliderInfinite.properties.drag.isDragging = false;
}
function sliderInfinite_dragMove(e) {
    if (SliderInfinite.properties.drag.isDragging) {
        SliderInfinite.properties.drag.mouseCurrent = e.clientX;
    }
}


// ANIMATE ON VIEW
// TOFIX home approche cards dynamic color transition not smooth
function animOnView_initApply(A_GROUPS, isSplitTxt) {
    // apply functions
    function initAnim(elInitAnim, check) {
        if (check == "self") {
            elInitAnim.style.opacity = 0;
        }
        if (check == "children") {
            const gr = (elInitAnim.hasAttribute("y-animonview--target")) ? elInitAnim.querySelectorAll(elInitAnim.getAttribute("y-animonview--target")) : elInitAnim.children;
            [...gr].forEach((elInitAnimChild) => {
                elInitAnimChild.style.opacity = 0;
            })
        }
    }
    function initAttributes(elInitAttr, elGroupName) {
        elInitAttr.setAttribute("data-scroll", "");
        elInitAttr.setAttribute("data-scroll-offset", ((A_GROUPS[elGroupName].offsetView != undefined) ? (A_GROUPS[elGroupName].offsetView).toString() : "0") +",0");
        elInitAttr.setAttribute("data-scroll-call", "animOnView-"+ elGroupName);

        if (isSplitTxt) {
            elInitAttr.setAttribute("y-animonview-splittxt", "");
            elInitAttr.setAttribute("y-animonview-state", "");
        }
    }

    // logic
    Object.keys(A_GROUPS).forEach((elGroupName) => {
        A_GROUPS[elGroupName].elements.forEach((el) => {
            // split txt
            if (isSplitTxt) {
                if (!el.classList.contains("is-inview")) { // ignore if already animated
                    initAttributes(el, elGroupName);

                    SplitType.clearData();
                    SplitType.create(el, {
                        types: (A_GROUPS[elGroupName].splitTxt != undefined) ? A_GROUPS[elGroupName].splitTxt : "words",
                    });

                    setTimeout(() => {
                        initAnim(el, (A_GROUPS[elGroupName].initAnim != undefined) ? A_GROUPS[elGroupName].initAnim : "children");
                    }, 5);
                }
            }

            // other elements
            else {
                if (!el.hasAttribute("y-animonview")) { // ignore if already set
                    el.setAttribute("y-animonview", "true");

                    const each = (A_GROUPS[elGroupName].each != undefined) ? A_GROUPS[elGroupName].each : false;
                    if (!each) {
                        initAttributes(el, elGroupName);
                        initAnim(el, (A_GROUPS[elGroupName].initAnim != undefined) ? A_GROUPS[elGroupName].initAnim : "self");
                    }
                    else {
                        let delay = 0;
                        [...el.children].forEach((elChild) => {
                            initAttributes(el, elGroupName);
                            initAnim(elChild, "self");

                            elChild.setAttribute("y-animonview-stagger-delay", delay);
                            delay += each;
                        })
                    }
                }
            }
        })
    })
}

let animOnView = {}

function animOnView_initTxt() {
    let ANIM_GROUPS = {
        "perWord": {
            elements: [
                ...doc.querySelectorAll("h2:not([y-animonview--ignore])"),
                ...doc.querySelectorAll("h3:not([y-animonview--ignore])"),
            ],
            offsetView: "25%",
            splitTxt: "words",
        },
    };

    // set up [elements] array if not already existing
    Object.keys(ANIM_GROUPS).forEach((elGroupName) => {
        if (!ANIM_GROUPS[elGroupName].elements) {
            ANIM_GROUPS[elGroupName].elements = [];
        }
    })

    // automatically add elements with id specified
    doc.querySelectorAll("*[y-animonview--id-txt]").forEach((elAnimOnView) => {
        ANIM_GROUPS[elAnimOnView.getAttribute("y-animonview--id-txt")].elements.push(elAnimOnView);
    })

    // apply init
    animOnView_initApply(ANIM_GROUPS, true);

    /* if (ANIM_GROUPS["perWord"]) {
        ANIM_GROUPS["perWord"].forEach((el) => {
            if (!el.classList.contains("is-inview")) {
            }
        })
    }; */
}
function animOnView_txt_revertSplit(target) {
    target.setAttribute("y-animonview-state", "finished");
    SplitType.revert(target);
}
window.addEventListener('animOnView-perWord', (e) => {
    const { target } = e.detail,
          splitCount = target.children.length,
          animDuration = ((splitCount > 7) ? 140 : ((splitCount > 3) ? 275 : 335)) * splitCount,
          animStagger  = ((splitCount > 7) ? 110 : ((splitCount > 3) ? 220 : 235));

    anime({
        targets: target.children,
        duration: animDuration,
        delay: anime.stagger(animStagger, {easing: 'cubicBezier(0.5, 0.55, 0.7, 0.5)'}), // delay: (el, i) => ( 100 * i * ((i == splitCount - 1) ? 1.1 : 1) ),
        easing: "cubicBezier(0.25, 0.8, 0, 1)",

        translateY: ["35%", "0%"],
        rotateZ: 0.03,
        opacity: {
            value : [0, 1],
            duration : animDuration * 1.2,
        },

        update: (anim) => { if (anim.progress == 100) { animOnView_txt_revertSplit(target); } },
    });
});

animOnView.slideEasing = "cubicBezier(0.2, 0.7, 0.15, 1)";
animOnView.fadeEasing = "cubicBezier(0.45, 0.3, 0.1, 0.95)";
animOnView.staggerEachDefault = 100;

animOnView.animations = {};
    animOnView.animations.fadeIn = {};
        animOnView.animations.fadeIn.offsetView = "20%";
    animOnView.animations.glideIn = {};
        animOnView.animations.glideIn.offsetView = 175;
        animOnView.animations.glideIn.animProperties = {
            translateY: [animOnView.animations.glideIn.offsetView, "0"],
            opacity: {
                value: [0, 1],
                duration: 800,
            },
        };
    animOnView.animations.slideIn = {};
        animOnView.animations.slideIn.offsetView = "25%";
        animOnView.animations.slideIn.offsetView2 = "30%";
        animOnView.animations.slideIn.animProperties = {
            translateY: ["12rem", "0"],
            opacity: {
                value: [0, 1],
                duration: 1300,
            },
        };
function animOnView_initElements() {
    let ANIM_GROUPS = {
        "fadeIn": {
            elements: [
                ...doc.querySelectorAll(".section-side_to_side .content-container:not([y-animonview--ignore-children]) .content"),
                ...doc.querySelectorAll("*[nav-anchor-section^='transition-'] .content-container:not([y-animonview--ignore-children]) .content"),
            ],
            offsetView: animOnView.animations.fadeIn.offsetView,
        },
        "fadeInStagger": {
            offsetView: animOnView.animations.fadeIn.offsetView,
            initAnim: "children",
        },
        "fadeInStagger2": {
            offsetView: animOnView.animations.fadeIn.offsetView,
            initAnim: "children",
        },
        "glideIn": {
            offsetView: animOnView.animations.glideIn.offsetView,
        },
        "glideInStagger": {
            offsetView: animOnView.animations.glideIn.offsetView,
            initAnim: "children",
        },
        "glideInStaggerEach": {
            offsetView: animOnView.animations.glideIn.offsetView,
            each: animOnView.staggerEachDefault,
        },
        "glideInDirectional": {
            offsetView: animOnView.animations.glideIn.offsetView,
        },
        "slideIn": {
            offsetView: animOnView.animations.slideIn.offsetView,
        },
        "slideInStagger": {
            offsetView: animOnView.animations.slideIn.offsetView,
            initAnim: "children",
        },
        "slideInStagger2": {
            offsetView: animOnView.animations.slideIn.offsetView2,
            initAnim: "children",
        },
        "slideInStaggerEach": {
            offsetView: animOnView.animations.slideIn.offsetView,
            each: animOnView.staggerEachDefault,
        },
    };

    // set up [elements] array if not already existing
    Object.keys(ANIM_GROUPS).forEach((elGroupName) => {
        if (!ANIM_GROUPS[elGroupName].elements) {
            ANIM_GROUPS[elGroupName].elements = [];
        }
    })

    // automatically add elements with id specified
    doc.querySelectorAll("*[y-animonview--id]").forEach((elAnimOnView) => {
        ANIM_GROUPS[elAnimOnView.getAttribute("y-animonview--id")].elements.push(elAnimOnView);
    })
    doc.querySelectorAll("*[y-animonview--id-children]").forEach((elAnimOnView) => {
        ANIM_GROUPS[elAnimOnView.getAttribute("y-animonview--id-children")].elements.push(...elAnimOnView.children);
    })
    doc.querySelectorAll("*[y-animonview--id-children-wrapper]").forEach((elAnimOnView) => {
        ANIM_GROUPS[elAnimOnView.getAttribute("y-animonview--id-children-wrapper")].elements.push(...elAnimOnView.children.querySelector("wrapper"));
    })

    // apply init
    animOnView_initApply(ANIM_GROUPS);
}
window.addEventListener('animOnView-fadeIn', (e) => {
    const { target } = e.detail;

    anime({
        targets: target,
        duration: 1000,
        delay: 150,
        easing: animOnView.fadeEasing,

        opacity: [0, 1],
    });
});
window.addEventListener('animOnView-fadeInStagger', (e) => {
    const { target } = e.detail,
          splitCount = target.children.length,
          animDuration = 200 * splitCount,
          animStagger  = 200;

    anime({
        targets: target.children,
        duration: animDuration,
        delay: anime.stagger(animStagger, { start: 200 }),
        easing: animOnView.fadeEasing,

        opacity: [0, 1],
    });
});
window.addEventListener('animOnView-fadeInStagger2', (e) => {
    const { target } = e.detail,
          splitCount = target.children.length,
          animDuration = 175 * splitCount,
          animStagger  = 275;

    let targetSortCount = 0,
        target1 = [],
        target2 = [];
    [...target.children].forEach((child) => {
        if (targetSortCount % 2) { target1.push(child); } else { target2.push(child); }
        targetSortCount++
    });

    const animationSettings = {
        duration: animDuration,
        delay: anime.stagger(animStagger, { start: 200 }),
        easing: animOnView.fadeEasing,

        opacity: [0, 1],
    }
    anime({
        targets: target1,
        ...animationSettings,
    });
    anime({
        targets: target2,
        ...animationSettings,
    });
});
window.addEventListener('animOnView-glideIn', (e) => {
    const { target } = e.detail;

    anime({
        targets: target,
        duration: 1000,
        easing: animOnView.slideEasing,

        ...animOnView.animations.glideIn.animProperties,
    });
});
window.addEventListener('animOnView-glideInStagger', (e) => {
    const { target } = e.detail,
          splitCount = target.children.length,
          animDuration = 300 * splitCount,
          animStagger  = 115;

    anime({
        targets: target.children,
        duration: animDuration,
        delay: anime.stagger(animStagger, {easing: 'cubicBezier(0.5, 0.55, 0.7, 0.5)'}),
        easing: animOnView.slideEasing,

        ...animOnView.animations.glideIn.animProperties,
    });
});
window.addEventListener('animOnView-glideInStaggerEach', (e) => {
    const { target } = e.detail;

    anime({
        targets: target,
        duration: 1000,
        delay: parseInt(target.getAttribute("y-animonview-stagger-delay")),
        easing: animOnView.slideEasing,

        ...animOnView.animations.glideIn.animProperties,
    });
});
window.addEventListener('animOnView-glideInDirectional', (e) => { // TODO
    const { target } = e.detail,
          translate = animOnView.animations.glideIn.offsetView * ((getCenterOfEl(target)[1] > doc.clientWidth / 2) ? -1 : 1);

    anime({
        targets: target,
        duration: 1000,
        easing: animOnView.slideEasing,

        translateX: [translate, 0],
        opacity : animOnView.animations.glideIn.animProperties.opacity,
    });
});
window.addEventListener('animOnView-slideIn', (e) => {
    const { target } = e.detail;

    anime({
        targets: target,
        duration: 1000,
        easing: animOnView.slideEasing,

        ...animOnView.animations.slideIn.animProperties,
    });
});
window.addEventListener('animOnView-slideInStagger', (e) => {
    const { target } = e.detail,
          splitCount = target.children.length,
          animDuration = 300 * splitCount,
          animStagger  = 115;

    anime({
        targets: target.children,
        duration: animDuration,
        delay: anime.stagger(animStagger, {easing: 'cubicBezier(0.5, 0.55, 0.7, 0.5)'}),
        easing: animOnView.slideEasing,

        ...animOnView.animations.slideIn.animProperties,
    });
});
window.addEventListener('animOnView-slideInStagger2', (e) => {
    const { target } = e.detail,
          targetGroup = (target.hasAttribute("y-animonview--target")) ? target.querySelectorAll(target.getAttribute("y-animonview--target")) : target.children,
          splitCount = targetGroup.length,
          animDuration = 200 * splitCount,
          animStagger  = 200;

    let targetSortCount = 1,
        target1 = [],
        target2 = [];
    [...targetGroup].forEach((child) => {
        if (targetSortCount % 2) { target1.push(child); } else { target2.push(child); }
        targetSortCount++
    });

    const animationSettings = {
        duration: animDuration,
        delay: anime.stagger(animStagger),
        easing: animOnView.slideEasing,

        opacity : {
            ...animOnView.animations.slideIn.animProperties.opacity,
            delay: anime.stagger(animStagger, { start: 100 }),
        },
    };

    let animationSettingsTranslateAlt;
    if (target.hasAttribute("y-animonview--anim-alt")) {
        animationSettingsTranslateAlt = [{ left: ["-12rem", 0] }, { right: ["-12rem", 0] }];
    } else {
        animationSettingsTranslateAlt = [{ translateX: ["-12rem", 0] }, { translateX: ["12rem", 0] }];
    };

    anime({
        targets: target1,
        ...animationSettings,
        ...animationSettingsTranslateAlt[0],
    });
    anime({
        targets: target2,
        ...animationSettings,
        ...animationSettingsTranslateAlt[1],
    });
});
window.addEventListener('animOnView-slideInStaggerEach', (e) => {
    const { target } = e.detail;

    anime({
        targets: target,
        duration: 1000,
        delay: parseInt(target.getAttribute("y-animonview-stagger-delay")),
        easing: animOnView.slideEasing,

        ...animOnView.animations.slideIn.animProperties,
    });
});

// SCROLL CALLBACKS
function ScrollMain_onScroll({ scroll, limit, velocity, direction, progress }) {
    if (check_zoomInScroll) { zoomInScroll_onScroll(); }
    if (check_footerContactReveal) { footerContactReveal_onScroll(); }
    if (check_pageAnchorsSections) { pageAnchorsSections_onScroll(); }
    if (SliderInfinite.check && velocity) { sliderInfinite_onScroll(velocity); }
}


// LOADING SCREEN
// TODO


// log CREDITS
console.info(
    "\n%cwebsite made by yolan.design",
    "font-size: 1.2em; font-weight: 500; font-family: Work Sans, sans-serif; background-color:#180c0f; color: #fff; border-radius: 1em; padding: 0.75em 1.5em; margin: 0em auto 1em auto;",
    "\n\n"
);

// SWUP
const swup = new Swup({
    animationSelector: '[class*="swup_transition-"]',
    containers: ['#swup', "nav-anchors"],
    cache: true,
    animateHistoryBrowsing: true,

    plugins: [
        new SwupScrollPlugin({
            doScrollingRightAway: true,
            animateScroll: {
                betweenPages: false,
                samePageWithHash: false,
                samePage: false,
            },
        }),
        new SwupPreloadPlugin({
            preloadHoveredLinks: true,
        }),
    ],
});


swup.hooks.on('link:self', () => {
    // when clicking on page link : scroll to top if page is the same
    ScrollMain.scrollTo("top", {
        ...ScrollMain_options.scrollTo,
        offset: 0,
    })
});

swup.hooks.on('visit:start', () => {
    // close menu when clicking on page link
    doc.classList.remove("nav-menu-open");
});


// -- INIT
function init() {
    getPageID();

    translateElements({});
    translateSwitches_init();
    navAnchors_init();
    navAnchors_scrollTo();
    footer_init();
    zoomInScroll_init();
    animOnView_initElements();

    ScrollMain = new LocomotiveScroll(ScrollMain_options.global);
    setTimeout(() => {
        ScrollMain_onScroll({});
        sliderInfinite_init();
    }, 50);

    if (pageID == "about") {
        // age
        document.documentElement.querySelectorAll('.yolan-age').forEach((el) => { el.innerText = getAge('2002/07/26'); });
    }
}
// Run once when page loads
if (document.readyState === 'complete') { init(); } else { document.addEventListener('DOMContentLoaded', () => init()); }
// Run after every additional navigation by swup
swup.hooks.on('page:view', () => init());


// -- CLEANUP at unload
swup.hooks.before('content:replace', () => {
    sliderInfinite_clear();
    ScrollMain.destroy();
});