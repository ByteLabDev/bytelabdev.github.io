window.addEventListener('load', () => {
    const animate = Motion.animate;

    const dropElements = document.querySelectorAll('#crunch-name .drop');
    const spaceElements = document.querySelectorAll('#crunch-name .space');

    // --- SETUP: Measure precise native widths in memory to stop layout jumping ---
    const dropWidths = Array.from(dropElements).map(el => {
        el.style.width = 'auto';
        const width = el.getBoundingClientRect().width;
        el.style.width = '0px'; // Reset back to collapsed for starting state
        return width;
    });

    const spaceWidths = Array.from(spaceElements).map(el => {
        el.style.width = 'auto';
        const width = el.getBoundingClientRect().width;
        el.style.width = '0px'; // Reset back to collapsed for starting state
        return width;
    });

    // Centralized state machine to run entry/exit transitions cleanly
    async function runCycle() {
        // --- 1. EXPAND OUT TO FULL NAME ---
        
        // Prepare hidden strings overhead before making them visible
        dropElements.forEach(el => {
            el.style.transform = "translateY(-25px) scale(0.95)";
        });

        // Fluidly expand widths using calculated pixel variables instead of "auto"
        const expandDrops = Array.from(dropElements).map((el, i) => 
            animate(el, { width: `${dropWidths[i]}px` }, { duration: 0.4, easing: "easeOut" }).finished
        );

        const expandSpaces = Array.from(spaceElements).map((el, i) => 
            animate(el, { width: `${spaceWidths[i]}px` }, { duration: 0.4, easing: "easeOut" }).finished
        );

        await Promise.all([...expandDrops, ...expandSpaces]);

        // Drop letters down and settle them with high-fidelity easing
        await animate(
            [...dropElements, ...spaceElements],
            { opacity: 1, y: 0, scale: 1 },
            { duration: 0.4*2, easing: [0.175, 0.885, 0.32, 1.2] }
        ).finished;


        // --- 2. HOLD STATE ---
        await new Promise(resolve => setTimeout(resolve, 3000));


        // --- 3. CRUNCH BACK DOWN TO DOMAIN ---
        
        // Slide "dem" and "elim" out of view smoothly
        const dropCollapse = animate(
            dropElements,
            { opacity: 0, y: 25, scale: 0.95 },
            { duration: 0.35*2, easing: "easeIn" }
        ).finished;

        const spaceCollapse = animate(
            spaceElements,
            { opacity: 0 },
            { duration: 0.25*2 }
        ).finished;

        await Promise.all([dropCollapse, spaceCollapse]);

        // Retract layouts back to zero width so text merges together cleanly
        const shrinkDrops = Array.from(dropElements).map(el => 
            animate(el, { width: "0px" }, { duration: 0.4, easing: "easeIn" }).finished
        );

        const shrinkSpaces = Array.from(spaceElements).map(el => 
            animate(el, { width: "0px" }, { duration: 0.4, easing: "easeIn" }).finished
        );

        await Promise.all([...shrinkDrops, ...shrinkSpaces]);


        // --- 4. HOLD STATE & CONTINUE TIMELINE ---
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Safe tail call recursion avoids memory stack overflow bugs from basic intervals
        runCycle();
    }

    // Initialize loop sequence after a brief onboarding delay
    setTimeout(runCycle, 750);
});