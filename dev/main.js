import * as DATA_PROJECTS from "./import/projects.js";
import * as DATA_LANG from "./import/lang.js";
import "./import/vh-fix.js";

import "./main.scss"


// LIBRARIES
import hotkeys from 'hotkeys-js';
import LoconativeScroll from "./import/dependencies/loconative/loconative-scroll.js";
import anime from 'animejs/lib/anime.es.js';

// GLOBAL VARIABLES
const doc = document.documentElement,
      docSizePhone = 700;


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


// BOOM ANIM
function boomAnimInit({boomOrigin, target, container, special, eventType = "mousedown"}) {
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
            target.addEventListener("mouseup", () => { boomRemove(); });
            target.addEventListener("mouseleave", () => { boomRemove(); });
        }
        // else dismiss right away
        else { boomRemove(); }
    }
    else { boomRemove(); }
}



// RUN

// CURRENT PAGE
let pageID = window.location.pathname.split("/");
if (pageID[pageID.length -1] == "") { pageID.pop(); }
pageID = pageID[pageID.length -1];
pageID = (pageID == "") ? "home" : pageID;
doc.setAttribute("page", pageID);


// LANG
let LANG = {
    translations : DATA_LANG.translations,
    langBrowser : (navigator.language).split("-")[0], // navigator's language
    langCurrent : "",
    langList : ["en", "fr"],
}
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
}

// init content
translateElements({});


// TRANSLATE SWITCHES
const translateSwitches = doc.querySelectorAll("[translate-switch]");
if(translateSwitches) {
    translateSwitches.forEach((btn) => {
        btn.addEventListener("click", () => {
            translateElements({langSwitch : true});
        })
        boomAnimInit({boomOrigin : false, target : btn, special : "btn-translate", eventType : "click"});
    })
}


// SMOOTH SCROLL
// https://github.com/quentinhocde/loconative-scroll
const scrollDoc = new LoconativeScroll({
    smooth: true,
    duration: 0.85,
    easing: (x) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x)),
    scrollToEasing: (x) => (x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2),
    offset: ["40%", 0],
    repeat: true,
    reloadOnContextChange : false,
});
const scrollToDuration = 1.4;


// NAV MENU TOGGLE
const navMenuButton = document.querySelectorAll("nav-bar #nav-btn-toggle-menu");
if (navMenuButton) {
    navMenuButton.forEach((btn) => {
        btn.addEventListener("click", () => {
            doc.classList.toggle("nav-menu-open");
        })
    })
}


// TRANSITION BG-DYNAMIC
let DYNAMIC_COLORS = {
    default : {
        accent : getComputedStyle(doc).getPropertyValue("--rgb-main-fill"),
        fill : getComputedStyle(doc).getPropertyValue("--rgb-main-fill"),
        bg : getComputedStyle(doc).getPropertyValue("--rgb-main-bg"),
    },
    current : {
        accent : "",
        fill : "",
        bg : "",
    },
    applied : {}
}
DYNAMIC_COLORS.applied = {
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
           DYNAMIC_COLORS.current.accent != el.getAttribute("dynamic_color-accent")
        || DYNAMIC_COLORS.current.fill != el.getAttribute("dynamic_color-fill")
        || DYNAMIC_COLORS.current.bg != el.getAttribute("dynamic_color-bg")
        ) {

        DYNAMIC_COLORS.current.accent = el.getAttribute("dynamic_color-accent");
        DYNAMIC_COLORS.current.fill = el.getAttribute("dynamic_color-fill");
        DYNAMIC_COLORS.current.bg = el.getAttribute("dynamic_color-bg");

        const colorsVar = {
            dynamicAccent: DYNAMIC_COLORS.applied.accent,
            dynamicFill: DYNAMIC_COLORS.applied.fill,
            dynamicBg: DYNAMIC_COLORS.applied.bg,
        }
        anime({
            targets: colorsVar,
            easing: 'easeInOutCubic',
            duration: 2200,
            round: 100,

            dynamicAccent: [DYNAMIC_COLORS.applied.accent, el.getAttribute("dynamic_color-accent")],
            dynamicFill: [DYNAMIC_COLORS.applied.fill, el.getAttribute("dynamic_color-fill")],
            dynamicBg: [DYNAMIC_COLORS.applied.bg, el.getAttribute("dynamic_color-bg")],

            update: () => {
                doc.style.setProperty('--dynamic-accent', colorsVar.dynamicAccent);
                doc.style.setProperty('--dynamic-fill', colorsVar.dynamicFill);
                doc.style.setProperty('--dynamic-bg', colorsVar.dynamicBg);

                DYNAMIC_COLORS.applied.accent = colorsVar.dynamicAccent;
                DYNAMIC_COLORS.applied.fill = colorsVar.dynamicFill;
                DYNAMIC_COLORS.applied.bg = colorsVar.dynamicBg;
            },
        });
    }
}


// NAV ANCHORS
const pageAnchorsSections = document.querySelectorAll("[nav-anchor-section]"),
      // pageAnchorsScrolls = document.querySelectorAll("[nav-anchor-scoll]"),
      anchorLinks = document.querySelectorAll("[nav-anchor-link]");

if (pageAnchorsSections) {
    elSetDefaultDynamicColor({targets : pageAnchorsSections, attribute : "dynamic_color-bg", defaultColor : DYNAMIC_COLORS.default.bg});
    elSetDefaultDynamicColor({targets : pageAnchorsSections, attribute : "dynamic_color-fill", defaultColor : DYNAMIC_COLORS.default.fill});
    elSetDefaultDynamicColor({targets : pageAnchorsSections, attribute : "dynamic_color-accent", defaultFromAttribute : "dynamic_color-fill", defaultColorFallback : DYNAMIC_COLORS.default.accent});

    // scroll updates
    scrollDoc.on('scroll', (args) => {
        pageAnchorsSections.forEach((anchorSection) => {
            const anchorSectionRect = anchorSection.getBoundingClientRect(),
                  anchorLink = document.querySelector("[nav-anchor-link='"+ anchorSection.getAttribute("nav-anchor-section") +"']"),
                  splitSection = doc.clientHeight / 2;

            if (anchorSectionRect.y < splitSection && anchorSectionRect.bottom > splitSection) {
                if (anchorLink) { anchorLink.classList.add("active"); }
                //doc.style.setProperty('--bg-dynamic', anchorSection.getAttribute("dynamic_color-bg"));
                dynamicColorUpdate(anchorSection);
            } else {
                if (anchorLink) { anchorLink.classList.remove("active"); }
            }
        })
    });
}


// failed attempt at using IntersectionObserver
/* let pageAnchorsIO = new IntersectionObserver((entries) => {
    console.log("---");
    entries.forEach(entry => {
        if(entry.isIntersecting) {
            console.log(entry.target.getAttribute("nav-anchor-section"));
            const anchorLink = document.querySelector("[nav-anchor-link='"+ entry.target.getAttribute("nav-anchor-section") +"']")

            if (anchorLink) {
                anchorLink.classList.add("active");
            }
        } else {
            document.querySelector("*:not([nav-anchor-link='"+ entry.target.getAttribute("nav-anchor-section") +"'])").classList.remove("active");
        }
    })
}, {
    rootMargin: "-50%",
    threshold: [0, 0.05, 0.15, 0.85, 0.95, 1]
})
if (pageAnchorsSections) { pageAnchorsSections.forEach((anchorSection) => { pageAnchorsIO.observe(anchorSection); }) };
 */


// NAV ANCHORS SCROLL TO
if (anchorLinks) {
    anchorLinks.forEach((anchorLink) => {
        anchorLink.addEventListener("click", () => {
            const anchorID = anchorLink.getAttribute("nav-anchor-link"),
                  scrollToTarget = document.querySelector("[nav-anchor-scroll='"+ anchorID +"']");

            if (scrollToTarget) {
                if (anchorID == "contact") {
                    scrollDoc.scrollTo("bottom", {
                        duration : scrollToDuration,
                        offset : 0
                    })
                } else {
                    scrollDoc.scrollTo(scrollToTarget, {
                        duration : scrollToDuration,
                        offset : doc.clientHeight * -0.15 //-150
                    })
                }

                // hide active nav-anchor-link during the scrollTo
                setTimeout(() => {
                    document.querySelector("nav-anchors").classList.add("active-pause");
                    setTimeout(() => {
                        document.querySelector("nav-anchors").classList.remove("active-pause");
                    }, scrollToDuration * 550);
                }, scrollToDuration * 300);

                // close menu if mobile
                if (doc.clientWidth < docSizePhone) {
                    doc.classList.remove("nav-menu-open");
                }
            }
        })
    })
};


// FOOTER BUTTON EMAIL COPY
const footerCTA = document.querySelector("footer-cta button");
if (footerCTA) {

    const footerCTA_copiedNotif = footerCTA.querySelector(".tip.copied-notif span"),
          footerCTA_copiedNotif_alt = translateGet({id : "footer-cta-email-click-notif--array", getPage : "_general"});

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

    footerCTA.addEventListener("click", () => {
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
    })
    footerCTA.addEventListener("mouseenter", () => {
        footerCTA.classList.remove("copied");
        footerCTA_copiedNotif.innerText = footerCTA_copiedNotif_alt[0];
    })
}


// FOOTER SCROLL REVEAL
scrollDoc.on('scroll', (args) => {
    if(typeof args.currentElements['footer-contact'] === 'object') {
        // const progress = Math.min((doc.clientHeight / args.currentElements['footer-contact'].el.getBoundingClientRect().bottom) + 0.0015, 1);
        const elParentRect = args.currentElements['footer-contact'].el.parentElement.getBoundingClientRect(),
              progressFactor = mapRangeClamp(((elParentRect.top - doc.clientHeight) * -1.0015), 0, elParentRect.height, 0, 1);

        args.currentElements['footer-contact'].el.style.opacity = progressFactor;
        args.currentElements['footer-contact'].el.style.transform = "translate3d(0, "+ (-100 * (progressFactor - 1)) +"px, 0)"; // scale("+ (0.75 + progress / 4) +")
    }
});


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
