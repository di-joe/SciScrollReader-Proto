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
