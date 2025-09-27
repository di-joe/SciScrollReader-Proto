gsap.registerPlugin(Draggable, DrawSVGPlugin, MorphSVGPlugin, MotionPathPlugin);

// --- SPLASH SCREEN LOGIC ---
const SPLASH_SVG = "splashScreen_v3.svg";
let splashTimeline;

fetch(SPLASH_SVG)
    .then(r => r.ok ? r.text() : Promise.reject(new Error("Failed to load splash SVG")))
    .then(svgText => {
        const host = document.getElementById("splashScreen");
        if (!host) return;
        host.innerHTML = svgText;
        const svg = host.querySelector("svg");
        if (svg && !svg.hasAttribute("viewBox")) {
            svg.setAttribute("viewBox", "0 0 1920 1080");
        }
        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReduced || !window.gsap) {
            if (window.gsap) gsap.set(["#flask", "#flaskLip"], { autoAlpha: 1 });
            return;
        }

        // gsap.to("#start-container", { autoAlpha: 1, duration: 1 });


        splashTimeline = gsap.timeline();
        splashTimeline.set(["#logoD", "#logoI", "#d2", "#flask", "#flaskLip", "#d1", "#d3", "#d4", "#d5", "#d6", "#d7", "#d8", "#d9", "#scroll", "#underscore", "#newDot"], { autoAlpha: 0 })
            .to("#logoD", { autoAlpha: 1, duration: .8 })
            .to(["#logoI", "#d2"], { autoAlpha: 1, duration: .8, stagger: 0.8 })
            .to("#underscore", { autoAlpha: 1, duration: 0.4 })
            .to("#underscore", { autoAlpha: 0, repeat: 3, yoyo: true, duration: 0.4, ease: "none" }, "+=0.1")
            .to({}, { duration: 0.3 });
        const letters = ["#S", "#c", "#i", "#e", "#n", "#c2", "#e2"];
        letters.forEach((sel) => {
            splashTimeline.from(sel, { y: "-200vh", autoAlpha: 0, duration: 0.4, ease: "back.out(2)" }, "<+=0.1");
        });
        splashTimeline.from("#exclamation", { scale: 100, autoAlpha: 0, duration: 0.2, transformOrigin: "center center", ease: "none" }, "+=0.1")
            .from("#point2", { scale: 100, autoAlpha: 0, duration: 0.2, transformOrigin: "center center", ease: "none" }, "<+=0.1")
            .to("#point2", { rotate: 3600, duration: 1.5, ease: "power4.out", transformOrigin: "center center" }, "<")
            .to(["#logoI", "#d2"], { autoAlpha: 0, duration: 0.5 }, "+=0.3")
            .to(["#flask", "#flaskLip", "#newDot"], { autoAlpha: 1, duration: 0.5, stagger: 0.1 }, "<")
            .call(() => {
                gsap.to("#start-container", { autoAlpha: 1, duration: 1 });
            });
        const bubbles = ["#d1", "#d3", "#d4", "#d5", "#d6", "#d7", "#d8", "#d9"];
        bubbles.forEach((sel, i) => {
            splashTimeline.fromTo(sel, { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1, repeat: -1, yoyo: true, ease: "sine.inOut", transformOrigin: "50% 50%", }, "<" + (i * 0.3));
        });


    })
    .catch(err => {
        console.warn("Splash SVG issue:", err);
        const host = document.getElementById("splashScreen");
        if (host) host.innerHTML = '<p style="color:white;font:600 1rem/1.4 system-ui">Loading…</p>';
    });

// --- MAIN APPLICATION LOGIC ---
document.addEventListener("DOMContentLoaded", () => {

    // --- STATE MANAGEMENT ---
    let currentTimelineIndex = 0;
    const slides = gsap.utils.toArray(".slide");
    const slideAnimations = [];

    // --- BUTTON REFERENCES ---
    const startBtn = document.getElementById("startBtn");
    const nextBtn = document.getElementById("nextBtn");
    const prevBtn = document.getElementById("prevBtn");
    const replayBtn = document.getElementById("replayBtn");

    // ========== NAVIGATION LOGIC ==========
    function goToTimeline(newIndex) {
        // Look up which HTML slide to show from our map
        const slideIndexToShow = window.timelineToSlideMap[newIndex];

        // Show the correct HTML slide and hide others
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === slideIndexToShow);
        });

        // Play the correct animation timeline
        if (slideAnimations[newIndex]) {
            slideAnimations[newIndex].play(0);
        }

        // Update the state
        currentTimelineIndex = newIndex;
        updateButtons();
    }

    function updateButtons() {
        // Base the button state on the number of TIMELINES
        prevBtn.disabled = currentTimelineIndex === 0;
        nextBtn.disabled = currentTimelineIndex === slideAnimations.length - 1;
    }

    // ========== EVENT LISTENERS ==========


    nextBtn.addEventListener('click', () => {
        // Get the timeline that is currently playing or has just finished
        const currentTimeline = slideAnimations[currentTimelineIndex];

        // Fast-forward it to the end before proceeding
        if (currentTimeline) {
            currentTimeline.progress(1);
        }

        // Now, go to the next timeline as usual
        if (currentTimelineIndex < slideAnimations.length - 1) {
            goToTimeline(currentTimelineIndex + 1);
        }
    });

    prevBtn.addEventListener('click', () => {
        const currentTimeline = slideAnimations[currentTimelineIndex];

        // Fast-forward it to the end
        if (currentTimeline) {
            currentTimeline.pause(0);
        }

        // Now, go to the previous timeline
        if (currentTimelineIndex > 0) {
            goToTimeline(currentTimelineIndex - 1);
        }
    });

    replayBtn.addEventListener('click', () => {
        if (slideAnimations[currentTimelineIndex]) {
            slideAnimations[currentTimelineIndex].play(0);
        }
    });

    // --- Load Main SVG and Define All Timelines ---
    const waterCyclePromise = fetch("waterCycle_evaporation-02a.svg")
        .then(response => response.text())
        .then(svgText => {
            const container = document.querySelector(".fixed-svg-container");
            if (container) {
                container.innerHTML = svgText;
                const svg = container.querySelector("svg");
                if (svg) {
                    svg.removeAttribute("width");
                    svg.removeAttribute("height");
                    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
                }
            }
        });

    Promise.all([waterCyclePromise]).then(() => {
        gsap.set(".fixed-svg-container", { autoAlpha: 0 });


        const snowVideo = document.querySelector(".slide-7 .background-image");


        // Timeline for Slide 1

        const slide1Timeline = gsap.timeline({ paused: true, });



        slide1Timeline

            .from(".slide-1 .background-image", { autoAlpha: 0, duration: 3 }, 1)

            .to(".slide-1 .title-wrapper", { opacity: 1, duration: 1.5, transform: 'translateY(0)', ease: "power2.out" }, ">-1")

            .from(".bottom-chip", { xPercent: 100, duration: 0.7 }, ">")

            .to(".navigation-controls", { autoAlpha: 1, duration: 1 }, ">1")



        slideAnimations.push(slide1Timeline);



        // Slide 1a



        const slide1aTimeline = gsap.timeline({ paused: true })

        slide1aTimeline

            .to(".slide-1 .title-wrapper", { opacity: 0, transform: 'translateY(-50vh)', }, "+=0")

            .to(".bottom-chip", { xPercent: 100, duration: .2 }, "-=0.5")

            .to(".slide-1 .copy", { opacity: 1, transform: 'translateY(0)', duration: 1, ease: "back.out(0.5)" })

            ;

        slideAnimations.push(slide1aTimeline);


        // Slide 2 timelines Evaporation macro and blowout

        const slide2Timeline = gsap.timeline({ paused: true });


        slide2Timeline

            .set(["#clouds", "moreclouds"], { opacity: 0 })

            .set("#sunlight", { opacity: 0 })

            .set("#treeGroup", { opacity: 0 })

            .to(".slide-2 .content-wrapper", { opacity: 1, transform: 'translateY(0)', duration: 1, ease: "back.out(0.5)" })

            .to(".fixed-svg-container", { autoAlpha: 1, duration: 3 }, "<")

            ;

        slideAnimations.push(slide2Timeline);

        // 2a sub timeline

        const slide2aSub = gsap.timeline({ repeat: 3 });

        slide2aSub
            .from(["#arrowStroke1", "#arrowStroke2", "#arrowStroke3"], { duration: .5, drawSVG: 0 })

            .from(["#arrowHead1", "#arrowHead2", "#arrowHead3"], { autoAlpha: 0, duration: .5 }, ">-.1")

            .to(["#arrowStroke1", "#arrowStroke2", "#arrowStroke3"], { duration: .5, drawSVG: "100% 100%" }, ">-.2")

            .to(["#arrowStroke1", "#arrowStroke2", "#arrowStroke3", "#arrowHead1", "#arrowHead2", "#arrowHead3"], { autoAlpha: 0, duration: .5 }, ">-.2")

            .from("#glow", { opacity: 0, duration: .5 }, ">-1")

            .from(["#e5", "#e4", "#e6", "#e3", "#e7", "#e2", "#e8", "#e1", "#e9"], { duration: .5, drawSVG: 0, stagger: 0.05, ease: "power2.out" }, ">-.2")

            .from(["#ea5", "#ea4", "#ea6", "#ea3", "#ea7", "#ea2", "#ea8", "#ea1", "#ea9"], { opacity: 0, stagger: 0.05, duration: .2 }, ">-.4") // - the #ea1, etc. are element IDs not colors... //

            .to(["#e5", "#e4", "#e6", "#e3", "#e7", "#e2", "#e8", "#e1", "#e9"], { duration: .5, drawSVG: "100% 100%", stagger: 0.05, ease: "power2.in" }, ">-.2")

            .to(["#ea5", "#ea4", "#ea6", "#ea3", "#ea7", "#ea2", "#ea8", "#ea1", "#ea9"], { opacity: 0, duration: .2, stagger: 0.05 }, ">-.4")

            .to("#glow", { opacity: 0, duration: .5 }, ">-.75")

            ;

        // 2a tl

        const slide2aTimeline = gsap.timeline({ paused: true });

        slide2aTimeline

            .to(".slide-2 .content-wrapper", { opacity: 0, transform: 'translateY(-10vh)' })

            .to("#night", { opacity: 0, duration: .5, ease: "power2.in" }, ">")

            .to("#evaporation-caption", { autoAlpha: 1, y: -10, duration: 1 }, ">")

            .from("#sun", { y: "400%", duration: 1.5, transformOrigin: "50% 50%", ease: "power2.out" }, ">")

            .add(slide2aSub)
            ;

        slideAnimations.push(slide2aTimeline);


        // 2b

        // --- Blowout Timeline

        const blowoutTimeline = gsap.timeline({ paused: true })

        blowoutTimeline

            .to("#mol1, #mol4", { x: -150, y: 50, duration: 4, repeat: -1, stagger: 0.1, yoyo: true, ease: "sine.inOut" }, "<")

            .to("#mol6, #mol12", { x: -200, y: 40, duration: 4, repeat: -1, stagger: -0.1, yoyo: true, ease: "sine.inOut" }, "<")

            .to("#mol2", { y: -50, x: 125, duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut" }, "<")

            .to("#mol8, #mol10", { y: 20, x: 140, duration: 3, repeat: -1, stagger: 0.1, yoyo: true, ease: "sine.inOut" }, "<")

            .to("#mol3, #mol9", { x: 200, y: 10, duration: 3.5, repeat: -1, stagger: -0.1, yoyo: true, ease: "sine.inOut" }, "<")

            .to("#mol7", { x: 175, y: 40, duration: 3.5, repeat: -1, yoyo: true, ease: "sine.inOut" }, "<")

            .to("#mol5, #mol11", { x: 200, y: -10, duration: 3.5, repeat: 3, stagger: 0.1, yoyo: true, ease: "sine.inOut" }, "<")

            .to("#topMol1, #topMol3, #topMol5", { x: 70, y: 20, duration: 2, repeat: -1, yoyo: true, ease: "sine.inOut" }, "<")

            .to("#topMol2, #topMol4", { x: -70, y: 10, duration: 2, repeat: -1, yoyo: true, ease: "sine.inOut" }, "<")

            .to("#sunlight", { autoAlpha: 1, duration: 1 }, 5)

            .to(["#topMol1", "#topMol3", "#topMol5"], { y: -350, duration: 1, ease: "power4.in", stagger: 0.1, opacity: 0 }, ">")

            .to("#sunlight", { autoAlpha: 0, duration: 2 })



        const slide2bTimeline = gsap.timeline({ paused: true });

        slide2bTimeline

            .to("#evaporation-caption", { autoAlpha: 0, y: -10, duration: 1 })

            .to("#blowoutCaption1", { autoAlpha: 1, y: 10, duration: 1 })

            .to("#evaporationScene", { autoAlpha: 0, duration: 1 }, "<.5")

            .from("#blowoutScene", { scale: .10, transformOrigin: "50% 75%", duration: 1 }, "<")

            .call(() => blowoutTimeline.restart())

            .to({}, { duration: 8 })

            .to("#blowoutContents", { autoAlpha: 0, duration: 1 })

            .call(() => blowoutTimeline.restart())

            .to("#blowoutContents", { autoAlpha: 1, duration: 1 })

            .to({}, { duration: 8 })

            .to("#blowoutContents", { autoAlpha: 0, duration: 1 })

            .call(() => blowoutTimeline.restart())

            .to("#blowoutContents", { autoAlpha: 1, duration: 1 })


            ;


        slideAnimations.push(slide2bTimeline);



        // --- Slide 3 - transpiration

        const slide3Timeline = gsap.timeline({ paused: true });

        slide3Timeline


            .to("#blowoutCaption1", { autoAlpha: 0, y: -20, duration: 1 })

            .to("#blowoutScene", { autoAlpha: 0, duration: 1 }, "<")

            .to(".slide-3 .content-wrapper", { opacity: 1, transform: 'translateY(0)', duration: 1, ease: "back.out(0.5)" }, "<")

            .set(["#wa1, #wa2, #wa3, #treeSun"], { opacity: 0 })


            ;

        slideAnimations.push(slide3Timeline);


        // transpiration sub

        const transpirationSub = gsap.timeline({ paused: true, repeat: 2 });

        transpirationSub
            .to("#wa1, #wa2, #wa3", { opacity: "100%", duration: .5 }, "<")

            .to("#wa1", { duration: 2, motionPath: { path: "#path1", align: "#path1", alignOrigin: [0.5, 0.5], autoRotate: 180 }, ease: "power3.inOut" }, "<")

            .to("#wa2", { duration: 1.8, motionPath: { path: "#path2", align: "#path2", alignOrigin: [0.5, 0.5], autoRotate: 25 }, ease: "power3.inOut" }, "<")

            .to("#wa3", { duration: 2.2, motionPath: { path: "#path3", align: "#path3", alignOrigin: [0.5, 0.5], autoRotate: true }, ease: "power3.inOut" }, "<")

            .to(["#wa1, #wa2, #wa3"], { opacity: 0, duration: .1 })

            .from(["#tr1", "#tr2", "#tr3", "#tr4", "#tr5", "#tr6", "#tr7", "#tr8"], { duration: 1, drawSVG: 0, stagger: 0.1, ease: "power3.inOut" }, ">-.5")

            .from(["#tra1", "#tra2", "#tra3", "#tra4", "#tra5", "#tra6", "#tra7", "#tra8"], { opacity: 0, duration: .5 }, ">-0.5")

            .to(["#tr1", "#tr2", "#tr3", "#tr4", "#tr5", "#tr6", "#tr7", "#tr8"], { duration: 1, drawSVG: "100% 100%", stagger: 0.1, ease: "power3.inOut" }, ">-1")

            .to(["#tra1", "#tra2", "#tra3", "#tra4", "#tra5", "#tra6", "#tra7", "#tra8"], { opacity: 0, duration: .5 }, ">-0.5")





        const slide3aTimeline = gsap.timeline({ paused: true });

        slide3aTimeline


            .to("#treeGroup", { opacity: 1, duration: 2 })

            .to(".slide-3 .content-wrapper", { opacity: 0, transform: 'translateY(-10vh)' }, "<")

            .to("#transpirationCaption", { autoAlpha: 1, duration: 2 }, ">1")

            .to("#treeSun", { opacity: .4, duration: 1 }, ">-.5")

            .call(() => transpirationSub.restart(), [], ">-1")

            .to(["#leftWater", "#rightWater", "#centerWater"], { y: 60, duration: 16, ease: "power1.out" })

            .to("#treeSun", { opacity: 0, duration: 1 })


            ;

        slideAnimations.push(slide3aTimeline);



        // --- Slide 4 - condensation

        const condensationTimeline = gsap.timeline({ repeat: 3 })

        gsap.to(["#dust1", "#dust3", "#dust5", "#dust7"], { transformOrigin: "50% 50%", x: 10, y: 5, rotate: 720, duration: 4, repeat: -1, yoyo: true, ease: "power2.Out" });

        gsap.to(["#dust2", "#dust4", "#dust6", "#dust8"], { transformOrigin: "50% 50%", x: 15, y: 10, rotate: -720, duration: 6, repeat: -1, yoyo: true, ease: "power2.Out" });




        condensationTimeline

            .from("#temperatureLine", { duration: 9, drawSVG: "0%" }, 0)

            .to("#altimiter", { y: -410, duration: 9 }, 0)

            .to("#slow1", { duration: 3, motionPath: { path: "#slowPath1", align: "#slowPath1" }, ease: "power2.out" }, "<")

            .to("#slow2", { duration: 3, motionPath: { path: "#slowPath2", align: "#slowPath2" }, ease: "power2.out" }, "<")

            .to("#slow3", { duration: 3, motionPath: { path: "#slowPath3", align: "#slowPath3" }, ease: "power2.out" }, "<")

            .to("#slow4", { duration: 3, motionPath: { path: "#slowPath4", align: "#slowPath4" }, ease: "power2.out" }, "<")

            .to("#bubble1", { duration: 3, transformOrigin: "50% 50%", rotate: 30, motionPath: { path: "#slowPath1", align: "#slowPath1" }, ease: "power2.out" }, "<")

            .to("#bubble2", { duration: 2.5, transformOrigin: "50% 50%", rotate: 30, motionPath: { path: "#slowPath2", align: "#slowPath2" }, ease: "power2.out" }, "<")

            .to("#bubble3", { duration: 3, transformOrigin: "50% 50%", rotate: 30, motionPath: { path: "#slowPath3", align: "#slowPath3" }, ease: "power2.out" }, "<")

            .to("#_bub1", { duration: 3, transformOrigin: "50% 50%", rotate: 180, motionPath: { path: "#slowPath1", align: "#slowPath1" }, ease: "power2.out" }, "<")

            .to("#_bub2", { duration: 3, transformOrigin: "50% 50%", rotate: 180, motionPath: { path: "#slowPath2", align: "#slowPath2" }, ease: "power2.out" }, "<")

            .to("#_bub3", { duration: 3, transformOrigin: "50% 50%", rotate: 180, motionPath: { path: "#slowPath3", align: "#slowPath3" }, ease: "power2.out" }, "<")

            .to("#fast1", { duration: 2, motionPath: { path: "#fastPath1", align: "#fastPath1" }, ease: "power2.out" }, 1)

            .set(["#slow1", "#fast1"], { autoAlpha: 0 }, ">")

            .from("#bubble1", { scale: 0.2, autoAlpha: 0, duration: 0.5, ease: "back.out(1.7)" }, ">-.5")

            .to("#bubble1", { y: -3, duration: 6, rotate: 30, yoyo: true, repeat: 6 }, ">-.15")

            .to("#fast1a", { duration: 2, motionPath: { path: "#fastPath1", align: "#fastPath1" }, ease: "power2.out" }, 4)

            .set(["#fast1a", "#bubble1"], { autoAlpha: 0 }, ">")

            .from("#_bub1", { scale: 0.2, autoAlpha: 0, duration: 0.5, ease: "back.out(1.7)" }, ">-.2")

            .to("#_bub1", { y: -5, duration: 6, rotate: 360, yoyo: true, repeat: 6 }, ">-.15")

            .to("#fast2", { duration: 2, motionPath: { path: "#fastPath2", align: "#fastPath2" }, ease: "power2.out" }, 1.5)

            .set(["#slow2", "#fast2"], { autoAlpha: 0 }, ">")

            .from("#bubble2", { scale: 0.2, autoAlpha: 0, duration: 0.5, ease: "back.out(1.7)" }, ">-.8")

            .to("#bubble2", { y: 5, duration: 6, rotate: 30, yoyo: true, repeat: 6 }, ">-.15")

            .to("#fast2a", { duration: 2, motionPath: { path: "#fastPath2", align: "#fastPath2" }, ease: "power2.out" }, 4.2)

            .set(["#fast2a", "#bubble2"], { autoAlpha: 0 }, ">")

            .from("#_bub2", { scale: 0.2, autoAlpha: 0, duration: 0.5, ease: "back.out(1.7)" }, ">-.2")

            .set("#dust2", { autoAlpha: 0 }, "<")

            .to("#_bub2", { y: -5, duration: 6, rotate: 360, yoyo: true, repeat: 6 }, ">-.15")

            .to("#fast3", { duration: 2, motionPath: { path: "#fastPath3", align: "#fastPath3" }, ease: "power2.out" }, 2)

            .set(["#slow3", "#fast3"], { autoAlpha: 0 }, ">")

            .from("#bubble3", { scale: 0.2, autoAlpha: 0, duration: 0.5, ease: "back.out(1.7)" }, ">-.5")

            .to("#bubble3", { y: -2, duration: 6, rotate: 30, yoyo: true, repeat: 6 }, ">-.15")

            .to("#fast3a", { duration: 2, motionPath: { path: "#fastPath3", align: "#fastPath3" }, ease: "power2.out" }, 6.5)

            .set(["#fast3a", "#bubble3"], { autoAlpha: 0 }, ">")

            .from("#_bub3", { scale: 0.2, autoAlpha: 0, duration: 0.5, ease: "back.out(1.7)" }, ">-.2")

            .to("#_bub3", { y: -5, duration: 6, rotate: 360, yoyo: true, repeat: 6 }, ">-.15")

            .from(["#invisibub1", "#invisibub2", "#invisibub3", "#invisibub4", "#invisibub5", "#invisibub6", "#invisibub7", "#invisibub8"], { transformOrigin: "50% 50%", scale: 0.2, autoAlpha: 0, duration: 2, ease: "back.out(1.7)", stagger: .25 }, 8)

            .to(["#invisibub1", "#invisibub2", "#invisibub3", "#invisibub4", "#invisibub5", "#invisibub6", "#invisibub7", "#invisibub8"], { y: -5, duration: 6, rotate: 30, yoyo: true, repeat: 6, stagger: .25 }, 8.5)

            .to("#fast4", { duration: 2, motionPath: { path: "#fastPath4", align: "#fastPath4" }, ease: "power2.out" }, 2.5)

            .from("#condCloud", { duration: 4, autoAlpha: 0 }, 6.5)


            .to("#condCloseupGroup", { autoAlpha: 0, duration: 2.5, ease: "power4.out" }, 12)

            .to("#condensationGroup", { autoAlpha: 0, duration: 5 }, "<")

            .from("#zoomCloud", { transformOrigin: "50% 50%", scale: 10, autoAlpha: 0, duration: 5, ease: "power4.out" }, "<")

            .to("#moreclouds", { transformOrigin: "50% 50%", scale: 0.4, duration: 10 }, "<")

            ;



        const slide4Timeline = gsap.timeline({ paused: true });


        slide4Timeline

            .to("#transpirationCaption", { autoAlpha: 0, duration: 1 }, 0)

            .to("#treeGroup", { autoAlpha: 0, duration: 1 }, 0)

            .to(".slide-4 .content-wrapper", { autoAlpha: 1, transform: 'translateY(0)', duration: 1, ease: "back.out(0.5)" }, "<")

            ;

        slideAnimations.push(slide4Timeline)

        const slide4aTimeline = gsap.timeline({ paused: true });


        slide4aTimeline
            .to(".slide-4 .content-wrapper", { opacity: 0, transform: 'translateY(-10vh)' })

            .from("#condensationGroup", { autoAlpha: 0, duration: 2 }, "<")

            .to("#condensation-caption", { autoAlpha: 1, y: -10, duration: 1 }, ">")

            // .call(() => condensationTimeline.play())

            .add(condensationTimeline)

            ;

        slideAnimations.push(slide4aTimeline);


        // --- Slide 5 - precipitation

        const slide5Timeline = gsap.timeline({ paused: true });


        slide5Timeline


            .to("#condensation-caption", { autoAlpha: 0, duration: 1 }, 0)

            .to(".slide-5 .content-wrapper", { autoAlpha: 1, transform: 'translateY(0)', duration: 1, ease: "back.out(0.5)" }, "<")

            ;

        slideAnimations.push(slide5Timeline);




        const slide6Timeline = gsap.timeline({ paused: true });

        slide6Timeline

            .to(".slide-5 .content-wrapper", { opacity: 0, transform: 'translateY(-10vh)' }, 0)

            .to("#zoomCloud", { autoAlpha: 0, duration: 1.5 })

            .from("#storm", { autoAlpha: 0, duration: 2 }, "<")

            .from("#stormClouds1", { autoAlpha: 0, duration: 1 })

            .from("#stormClouds2", { autoAlpha: 0, duration: .75 }, "<")

            .from("#stormBkgd", { autoAlpha: 0, duration: 2.5 }, .5)

            .from("#lightning1", { autoAlpha: 0, duration: .04, repeat: 3, yoyo: true }, ">-.25")

            .from("#lightning2", { autoAlpha: 0, duration: .03, repeat: 3, yoyo: true }, ">.25")

            .to("#storm", { autoAlpha: 0, duration: 2 }, ">.5")

            .from(".slide-6 .background-image", { autoAlpha: 0, duration: 1 }, ">-1")

            .to("#rain-caption", { autoAlpha: 1, y: -10, duration: 1 }, "<.5")

            ;

        slideAnimations.push(slide6Timeline);

        // Slide 7 snow

        const slide7Timeline = gsap.timeline({ paused: true });

        slide7Timeline

            .to("#rain-caption", { autoAlpha: 0, duration: 1 }, 0)

            .from(snowVideo, { autoAlpha: 0, duration: 1 }, "<")
            .call(() => snowVideo.play(), [], 0)
            .to("#snow-caption", { autoAlpha: 1, y: -10, duration: 1 }, 0)

            ;

        slideAnimations.push(slide7Timeline);

        // Slide 8 hail

        const slide8Timeline = gsap.timeline({ paused: true });

        slide8Timeline


            .to("#snow-caption", { autoAlpha: 0, duration: 1 }, 0)
            .call(() => snowVideo.pause(), [], "<")
            .to(snowVideo, { autoAlpha: 0, duration: 1 }, 0)
            .from(".slide-8 .background-image", { autoAlpha: 0, duration: 1 })
            .to("#hail-caption", { autoAlpha: 1, y: -10, duration: 1 })

            ;

        slideAnimations.push(slide8Timeline);

        // Slide 9 hail

        const slide9Timeline = gsap.timeline({ paused: true });

        slide9Timeline

            .to("#hail-caption", { autoAlpha: 0, duration: 1 }, 0)
            .to(".slide-8 .background-image", { autoAlpha: 0, duration: 1 }, 0)
            .from(".slide-9 .background-image", { autoAlpha: 0, duration: 1 }, 0)
            .to("#sleet-caption", { autoAlpha: 1, y: -10, duration: 1 })

            ;

        slideAnimations.push(slide9Timeline);


        // Slide 10 wrap-up

        const slide10Timeline = gsap.timeline({ paused: true });

        slide10Timeline

            .to("#sleet-caption", { autoAlpha: 0, duration: 1 }, 0)
            .to(".slide-9 .background-image", { autoAlpha: 0, duration: 1 }, 0)
            .to(".slide-10 .content-wrapper", { autoAlpha: 1, transform: 'translateY(0)', duration: 1, ease: "back.out(0.5)" }, "<")




            ;

        slideAnimations.push(slide10Timeline);






        // --- Map timelines to html sections(slides) ---
        window.timelineToSlideMap = [
            0, // slide1Timeline (title)
            0, // slide1aTimeline (intro copy)
            1, // slide2Timeline (evaporation copy)
            1, // slide2aTimeline (evaporation macro animation)
            1, // slide2bTimeline (evaporation blowout animation)
            2, // slide3Timeline (transpiration copy)
            2, // slide3aTimeline (transpiration animation)
            3, // slide4Timeline (condensation copy)
            3, // slide4aTimeline (condensation animation)
            4, // slide5Timeline (precipitation copy)
            5, // slide6Timeline (rain photo)
            6, // slide7Timeline (snow video)
            7, // slide8Timeline (hail photo)
            8, // slide9Timeline (sleet photo)
            9, // slide10Timeline (wrap up copy)
        ];

        startBtn.addEventListener('click', () => {
            gsap.to("#start-container", { autoAlpha: 0, duration: 0.3 });
            gsap.to("#splashScreen", {
                opacity: 0,
                duration: 0.5,
                onComplete: () => {
                    const el = document.getElementById("splashScreen");
                    if (el) el.remove();
                }
            });
            // Start the lesson by going to the FIRST timeline
            goToTimeline(0);
        });
    });
});