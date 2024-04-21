// SLIDER INFINITE 20240421
let SliderInfinite = {
    idleLoop: undefined,
    elements: undefined,
    check: undefined,
    instances: [],

    properties: {
        idle: {
            state: false,
            move: -0.8, // px per frame
        },
        scroll:{
            strength: -0.6, // velocity multiplicator
            move: 0,
        },
        drag: {
            isDragging: false,
            strength: 2.5, // multiplicator
            mousePrevious: undefined,
            mouseCurrent: undefined,
            move: 0,
            target: 0,
        },
    },
    animate: {
        toAnimate: 0,
        move: 0,
        target: 0,
        applied: 0,

        from: 0,
        toAnimating: 0,
        toTarget: 0,
    }
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

function sliderInfinite_animateCycle(targetSlider, index) { // TOFIX
    // update dragging
    if (SliderInfinite.properties.drag.isDragging) {
        SliderInfinite.properties.drag.move = (SliderInfinite.properties.drag.mouseCurrent - SliderInfinite.properties.drag.mousePrevious) * SliderInfinite.properties.drag.strength;
        SliderInfinite.properties.drag.mousePrevious = SliderInfinite.properties.drag.mouseCurrent;

        SliderInfinite.properties.scroll.move = 0;
    }

    // to animate
    SliderInfinite.animate.toAnimate =
        (SliderInfinite.properties.idle.state && !SliderInfinite.properties.drag.isDragging) ? SliderInfinite.properties.idle.move : 0
      + SliderInfinite.properties.drag.move
    ;

    // animate
    if (SliderInfinite.animate.from != SliderInfinite.animate.toTarget) { // only run if new move
        SliderInfinite.animate.toAnimating = SliderInfinite.animate.from;

        const posVar = {
            move: SliderInfinite.animate.move,
        }
        anime({
            targets: posVar,
            easing: "easeOutExpo",
            duration: 1350,
            round: 1000,

            move: [SliderInfinite.animate.toAnimating, SliderInfinite.animate.toTarget],

            update: () => {
                SliderInfinite.animate.toAnimating = posVar.move;
                SliderInfinite.animate.applied = posVar.move;
            },
        });
    } else {
        SliderInfinite.animate.applied = SliderInfinite.animate.move + SliderInfinite.properties.scroll.move;
    }

    // apply move
    sliderInfinite_apply(targetSlider, index, SliderInfinite.animate.applied);

    console.log(SliderInfinite.animate.toAnimate, SliderInfinite.animate.applied);
}

function sliderInfinite_idle(targetSlider, index) {
    if (!SliderInfinite.idleLoop) {
        function loop() { // TODO redo the RAF when [is-inview]
            if (SliderInfinite.idleLoop) {
                if (targetSlider.classList.contains("is-inview")) {
                    SliderInfinite.properties.idle.state = true;
                    sliderInfinite_animateCycle(targetSlider, index);
                }
                else if(ScrollMain.lenisInstance.targetScroll < 5) { // hotfix : locomotive bug? : class [is-inview] is removed at [scroll-position = 0]
                    SliderInfinite.properties.idle.state = true;
                    sliderInfinite_animateCycle(targetSlider, 0); // [index = 0] : only on the first slider because performances
                }
                else {
                    SliderInfinite.properties.idle.state = false;
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
        if (targetSlider.classList.contains("is-inview") && !SliderInfinite.properties.drag.isDragging) {
            // sliderInfinite_apply(targetSlider, targetSlider.getAttribute("y-slider-infinite-id"), (Math.abs(velocity) * -0.6));
            SliderInfinite.properties.scroll.move = (Math.abs(velocity) * SliderInfinite.properties.scroll.strength);
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
    SliderInfinite.properties.drag.move = 0;
    SliderInfinite.properties.drag.isDragging = false;
}
function sliderInfinite_dragMove(e) {
    if (SliderInfinite.properties.drag.isDragging) {
        SliderInfinite.properties.drag.mouseCurrent = e.clientX;
    }
}