import { d, easeIO, pick, rnd, sleep } from "./pageTransitions";

export async function runBrowserTransition(stage, a, b, id) {
    const doc = stage.ownerDocument;
    const window = doc.defaultView;
    const NS = "http://www.w3.org/2000/svg";
    const dims = () => {
        const { width, height } = stage.getBoundingClientRect();
        return { W: width, H: height };
    };
    const tween = (ms, fn, ease = (t) => t) =>
        new Promise((resolve, reject) => {
            const start = window.performance.now();
            const frame = (now) => {
                try {
                    const t = Math.min(1, (now - start) / ms);
                    fn(ease(t));
                    if (t < 1) window.requestAnimationFrame(frame);
                    else resolve();
                } catch (error) {
                    reject(error);
                }
            };
            frame(start);
        });
    const el = (tag, cls, html) => {
        const element = doc.createElement(tag);
        element.className = "fx " + cls;
        if (html) element.innerHTML = html;
        stage.appendChild(element);
        return element;
    };
    const animate = (element, keyframes, options) =>
        element.animate(keyframes, { fill: "both", ...options }).finished;
    const svgEl = (tag, attributes) => {
        const element = doc.createElementNS(NS, tag);
        Object.entries(attributes).forEach(([name, value]) =>
            element.setAttribute(name, value),
        );
        return element;
    };
    const transitions = {
        sticky: async () => {
            const { W, H } = dims();
            a.style.zIndex = 2;
            b.style.zIndex = 1;
            const cw = W / 5,
                ch = H / 9;
            const palette = [
                "#fff08a",
                "#ffb3c7",
                "#a8e0ff",
                "#b9f2b0",
                "#ffd29a",
            ];
            const words = [
                "pickup 5pm",
                "textbooks $20",
                "desk lamp?",
                "free couch!",
                "laundry :(",
                "ramen",
                "move-in day",
                "dorm deal!",
                "study grp",
                "mini fridge",
                "lease?",
                "extension cord",
            ];
            const notes = [];
            for (let row = 0; row < 9; row += 1)
                for (let col = 0; col < 5; col += 1) {
                    const note = el(
                        "div",
                        "sticky",
                        Math.random() < 0.35 ? pick(words) : "",
                    );
                    note.style.cssText += `left:${col * cw - 8}px;top:${row * ch - 8}px;width:${cw + 16}px;height:${ch + 16}px;background:${pick(palette)}`;
                    notes.push({ note, rotation: rnd(-7, 7) });
                }
            await Promise.all(
                notes.map(({ note, rotation }) =>
                    animate(
                        note,
                        [
                            {
                                opacity: 0,
                                transform: `scale(1.9) rotate(${rotation + 25}deg)`,
                            },
                            {
                                opacity: 1,
                                transform: `scale(1) rotate(${rotation}deg)`,
                            },
                        ],
                        {
                            duration: d(180),
                            delay: d(rnd(0, 520)),
                            easing: "cubic-bezier(.2,.9,.3,1.3)",
                        },
                    ),
                ),
            );
            a.style.visibility = "hidden";
            await sleep(d(180));
            await Promise.all(
                notes.map(({ note, rotation }) =>
                    animate(
                        note,
                        [
                            { opacity: 1, transform: `rotate(${rotation}deg)` },
                            {
                                opacity: 0,
                                transform: `translate(${rnd(-40, 40)}px,${-rnd(120, 220)}px) rotateX(75deg) rotate(${rotation + rnd(-40, 40)}deg)`,
                            },
                        ],
                        {
                            duration: d(400),
                            delay: d(rnd(0, 430)),
                            easing: "ease-in",
                        },
                    ),
                ),
            );
        },
        plane: async () => {
            const { W, H } = dims();
            a.style.zIndex = 1;
            b.style.zIndex = 5;
            const mask =
                "linear-gradient(to top right,#000 var(--p),transparent calc(var(--p) + .4%))";
            b.style.webkitMaskImage = mask;
            b.style.maskImage = mask;
            b.style.setProperty("--p", "-1%");
            const trail = svgEl("svg", {
                class: "fx trail",
                viewBox: `0 0 ${W} ${H}`,
            });
            const line = svgEl("polyline", {
                fill: "none",
                stroke: "#7a0000",
                "stroke-width": 3,
                "stroke-linecap": "round",
                "stroke-dasharray": "1 9",
                opacity: 0.8,
            });
            trail.appendChild(line);
            stage.appendChild(trail);
            const plane = el(
                "div",
                "plane",
                '<svg viewBox="0 0 80 50" width="80" height="50"><polygon points="0,4 80,25 20,25" fill="#fff"/><polygon points="0,46 80,25 20,25" fill="#d9d4cb"/><polygon points="20,25 0,4 8,25" fill="#eee"/><line x1="20" y1="25" x2="80" y2="25" stroke="#bbb" stroke-width="1"/></svg>',
            );
            plane.style.transformOrigin = "100% 50%";
            const points = [],
                angle = (Math.atan2(-H, W) * 180) / Math.PI;
            await tween(
                d(1400),
                (t) => {
                    const s = -0.08 + t * 1.2,
                        wave = Math.sin(t * Math.PI * 3) * 34;
                    const normalX = -Math.sin((angle * Math.PI) / 180),
                        normalY = Math.cos((angle * Math.PI) / 180);
                    const x = W * s + normalX * wave,
                        y = H * (1 - s) + normalY * wave;
                    b.style.setProperty("--p", `${s * 100}%`);
                    plane.style.transform = `translate(${x - 80}px,${y - 25}px) rotate(${angle + Math.cos(t * Math.PI * 3) * 16}deg)`;
                    points.push(
                        `${x - 40 * Math.cos((angle * Math.PI) / 180)},${y - 40 * Math.sin((angle * Math.PI) / 180)}`,
                    );
                    line.setAttribute("points", points.join(" "));
                },
                easeIO,
            );
            await animate(trail, [{ opacity: 1 }, { opacity: 0 }], {
                duration: d(250),
            });
        },
    };
    a.classList.add("anim");
    b.classList.add("anim");
    try {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
            await animate(b, [{ opacity: 0 }, { opacity: 1 }], {
                duration: 200,
            });
        else await transitions[id](a, b);
    } finally {
        for (const screen of [a, b]) {
            screen.getAnimations?.().forEach((animation) => animation.cancel());
            screen.removeAttribute("style");
            screen.classList.remove("anim");
        }
        stage.querySelectorAll(".fx").forEach((effect) => {
            effect
                .getAnimations?.({ subtree: true })
                .forEach((animation) => animation.cancel());
            effect.remove();
        });
        stage.getAnimations?.().forEach((animation) => animation.cancel());
        a.classList.remove("active");
        b.classList.add("active");
    }
}
