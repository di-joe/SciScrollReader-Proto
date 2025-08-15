/* (script.js) Lines 1–90 */
// Optional: register ScrollTrigger if you plan to use it soon
if (window.gsap && !gsap.core.globals().ScrollTrigger) {
    try { gsap.registerPlugin(ScrollTrigger); } catch (e) { }
}

// ── Splash: load SVG, then run the GSAP timeline (same IDs as your previous site)
const SPLASH_SVG = "splashScreen_v3.svg";

fetch(SPLASH_SVG)
    .then(r => r.ok ? r.text() : Promise.reject(new Error("Failed to load splash SVG")))
    .then(svgText => {
        const host = document.getElementById("splashScreen");
        if (!host) return;
        host.innerHTML = svgText;

        const svg = host.querySelector("svg");
        if (svg && !svg.hasAttribute("viewBox")) {
            svg.setAttribute("viewBox", "0 0 1920 1080"); // keep your artboard ratio
        }

        // Respect reduced motion (accessibility): show a static end state
        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        // 1) Hide everything we’ll animate in
        const toHide = [
            "#logoD", "#logoI", "#d2", "#flask", "#flaskLip",
            "#d1", "#d3", "#d4", "#d5", "#d6", "#d7", "#d8", "#d9",
            "#scroll", "#underscore"
        ];
        if (window.gsap) gsap.set(toHide, { opacity: 0 });

        if (prefersReduced || !window.gsap) {
            // Static fallback: flask + scroll cue visible, no motion
            if (window.gsap) gsap.set(["#flask", "#flaskLip", "#scroll"], { opacity: 1 });
            return;
        }

        // 2) Main logo timeline (letters drop, punctuation pops, swap to flask)
        const tl = gsap.timeline();

        tl.to("#logoD", { opacity: 1, duration: 1 })
            .to(["#logoI", "#d2"], { opacity: 1, duration: 1, stagger: 0.5 }, "+=0.1")
            .to("#underscore", { opacity: 1, duration: 0.5 })
            .to("#underscore", { opacity: 0, repeat: 3, yoyo: true, duration: 0.5, ease: "none" }, "+=0.1")
            .to({}, { duration: 0.3 }); // tiny pause

        const letters = ["#S", "#c", "#i", "#e", "#n", "#c2", "#e2"];
        letters.forEach((sel) => {
            tl.from(sel, {
                y: "-200vh",
                opacity: 0,
                duration: 0.6,
                ease: "back.out(2)"
            }, "<+=0.1");
        });

        tl.from("#exclamation", {
            scale: 100, opacity: 0, duration: 0.4, transformOrigin: "center center", ease: "none"
        }, "+=0.1")
            .from("#point2", {
                scale: 100, opacity: 0, duration: 0.4, transformOrigin: "center center", ease: "none"
            }, "<+=0.1")
            .to("#point2", {
                rotate: 3600, duration: 1.5, ease: "power4.out", transformOrigin: "center center"
            }, "<")
            .to("#logoI", { opacity: 0, duration: 0.6 }, "+=0.3")
            .to(["#flask", "#flaskLip"], { opacity: 1, duration: 0.6, stagger: 0.1 }, "<");

        // 3) Looping bubbles (start after main TL completes, staggered)
        const bubbles = ["#d1", "#d3", "#d4", "#d5", "#d6", "#d7", "#d8", "#d9"];
        bubbles.forEach((sel, i) => {
            gsap.fromTo(sel,
                { scale: 0, opacity: 0 },
                {
                    scale: 1, opacity: 1, duration: 1,
                    repeat: -1, yoyo: true, ease: "sine.inOut",
                    transformOrigin: "center center",
                    delay: tl.duration() + i * 0.3
                }
            );
        });

        // 4) Scroll cue bounce (begins after the timeline)
        gsap.fromTo("#scroll",
            { opacity: 0, y: 0 },
            { opacity: 1, y: -10, duration: 1, repeat: -1, yoyo: true, ease: "sine.inOut", delay: tl.duration() + 0.5 }
        );
    })
    .catch(err => {
        console.warn("Splash SVG issue:", err);
        const host = document.getElementById("splashScreen");
        if (host) host.innerHTML = '<p style="color:white;font:600 1rem/1.4 system-ui">Loading…</p>';
    });


// 2) Dismiss splash on first scroll or key (Space/Enter), with a fade
let splashDismissed = false;

function hideSplash() {
    if (splashDismissed) return;
    splashDismissed = true;

    const el = document.getElementById("splashScreen");
    if (!el) return;
    el.style.opacity = "0";
    // Remove from layout after transition ends
    setTimeout(() => {
        if (el && el.parentNode) el.parentNode.removeChild(el);

        // After removing the splash element:
        afterSplashRemovedInitScenes();

        // If you’ll add ScrollTriggers later, refresh here.
        try { ScrollTrigger && ScrollTrigger.refresh && ScrollTrigger.refresh(); } catch (e) { }
    }, 650);
}

// Dismiss splash on the first clear user intent (works even if the page can't scroll yet)
function bindSplashDismissEvents() {
    const oncePassive = { once: true, passive: true };

    // Mouse/trackpad intent
    window.addEventListener("wheel", hideSplash, oncePassive);
    // Touch intent (phones/tablets)
    window.addEventListener("touchstart", hideSplash, oncePassive);
    // Pointer/click anywhere
    window.addEventListener("pointerdown", hideSplash, oncePassive);
    // Actual scroll (will fire on longer pages)
    window.addEventListener("scroll", hideSplash, oncePassive);

    // Keys that imply "go down"
    window.addEventListener(
        "keydown",
        (e) => {
            const k = e.code || e.key;
            if (["Space", "Enter", "ArrowDown", "PageDown"].includes(k)) hideSplash();
        },
        { once: true }
    );
}

// Ensure listeners are attached after the DOM is ready
document.addEventListener("DOMContentLoaded", bindSplashDismissEvents);

// ───────────────── Scene Engine: pin + progress + caption layout ─────────────────

// Call this after the splash is removed (see hook below)
function initScenes() {
    const scenes = Array.from(document.querySelectorAll('.scene'));
    scenes.forEach(setupScene);

    // Keep captions aligned on resize/refresh
    window.addEventListener('resize', layoutAllCaptions);
    if (window.ScrollTrigger) {
        ScrollTrigger.addEventListener('refresh', layoutAllCaptions);
    }

    layoutAllCaptions();
}

function setupScene(scene) {
    const pinPct = parseInt(scene.dataset.pin || '120', 10); // default 120%
    const st = ScrollTrigger.create({
        trigger: scene,
        start: 'top top',
        end: `+=${pinPct}%`,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        onUpdate: (self) => {
            // If this scene exposes a progress hook, call it with 0→1
            const hook = scene.dataset.progress;
            if (hook && typeof sceneProgressHooks[hook] === 'function') {
                sceneProgressHooks[hook](scene, self.progress);
            }
            // Also drive caption show/hide via data thresholds (optional)
            updateCaptionVisibility(scene, self.progress);
        }
    });

    // Initial layout of captions for this scene
    layoutCaptionsForScene(scene);
    return st;
}

// Simple registry for named progress hooks (attach your timelines here)
const sceneProgressHooks = {
    // Example: tie evaporation progress to your sun/cloud/water animation
    evapProgress(scene, p) {
        // placeholder: you’ll wire GSAP tweens here using `p` (0..1)
        // e.g., gsap.to('#sun', { yPercent: gsap.utils.mapRange(0,1,200,0)(p), overwrite: 'auto' });
    }
};

// ── Caption positioning relative to a 1920x1080 stage box ──
function layoutAllCaptions() {
    document.querySelectorAll('.scene').forEach(layoutCaptionsForScene);
}

function layoutCaptionsForScene(scene) {
    const stage = scene.querySelector('.stage');
    const overlays = scene.querySelector('.overlays');
    if (!stage || !overlays) return;

    // Determine the visible box where the 16:9 content lives (letterboxed inside .stage)
    const stageRect = stage.getBoundingClientRect();
    const aspect = 16 / 9;
    let boxW = stageRect.width;
    let boxH = boxW / aspect;
    if (boxH > stageRect.height) {
        boxH = stageRect.height;
        boxW = boxH * aspect;
    }
    const boxLeft = (stageRect.width - boxW) / 2;
    const boxTop = (stageRect.height - boxH) / 2;

    // Position each .cap based on data-x / data-y (percent of 1920x1080)
    const caps = overlays.querySelectorAll('.cap');
    caps.forEach(cap => {
        const x = parseFloat(cap.dataset.x || '50'); // percent of width
        const y = parseFloat(cap.dataset.y || '50'); // percent of height

        // Convert percents to pixels inside the letterboxed area
        const leftPx = boxLeft + (x / 100) * boxW;
        const topPx = boxTop + (y / 100) * boxH;

        // Because overlays is absolute inside the scene, set offsets relative to stage top-left
        cap.style.left = `${leftPx}px`;
        cap.style.top = `${topPx}px`;
    });
}

// Optional: show/hide captions by scene progress gates
function updateCaptionVisibility(scene, p) {
    const caps = scene.querySelectorAll('.overlays .cap');
    caps.forEach(cap => {
        const showAt = parseFloat(cap.dataset.show || '0'); // e.g., 0.25
        const hideAt = parseFloat(cap.dataset.hide || '2'); // default >1 means never hide
        const isOn = p >= showAt && p <= hideAt;
        cap.style.opacity = isOn ? '1' : '0';
        cap.style.visibility = isOn ? 'visible' : 'hidden';
    });
}

// ── Hook scene init after splash is gone ──
// In your existing hideSplash(), after removing the splash, call initScenes() and refresh:
function afterSplashRemovedInitScenes() {
    try { initScenes(); ScrollTrigger && ScrollTrigger.refresh && ScrollTrigger.refresh(); } catch (e) { }
}

