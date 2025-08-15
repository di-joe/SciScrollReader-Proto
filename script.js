/* (script.js) Lines 1–90 */
// Optional: register ScrollTrigger if you plan to use it soon
if (window.gsap && !gsap.core.globals().ScrollTrigger) {
    try { gsap.registerPlugin(ScrollTrigger); } catch (e) { }
}

// 1) Load and inject the splash SVG (from repo root)
const SPLASH_SVG = "splashScreen_v3.svg";

fetch(SPLASH_SVG)
    .then(r => r.ok ? r.text() : Promise.reject(new Error("Failed to load splash SVG")))
    .then(svgText => {
        const host = document.getElementById("splashScreen");
        if (!host) return;
        host.innerHTML = svgText;

        // Ensure viewBox exists for responsive scaling
        const splashSvg = host.querySelector("svg");
        if (splashSvg && !splashSvg.hasAttribute("viewBox")) {
            splashSvg.setAttribute("viewBox", "0 0 1920 1080");
        }
    })
    .catch(err => {
        console.warn("Splash SVG issue:", err);
        // Fallback: simple text so user isn’t stuck on a blank screen
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

// First user intent: scroll OR keys
window.addEventListener("scroll", hideSplash, { once: true, passive: true });
window.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.code === "Enter") hideSplash();
}, { once: true });
