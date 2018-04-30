Graphics = function () {
    let ctx;
    let sprites = [];
    let renderer;
    let updater;
    let width;
    let height;
    let tasks = [];
    let step;
    let back;
    let center = {};
    let started = false;

    function redraw() {
        ctx.clearRect(0, 0, width, height);
        if (back) {
            ctx.globalAlpha = 1;
            ctx.fillStyle = back;
            ctx.fillRect(0, 0, width, height);
        }
        const centX = (center.x || 0) - width / 2;
        const centY = (center.y || 0) - height / 2;
        sprites.forEach(s => {
            const px = (s.x || 0) - centX;
            const py = (s.y || 0) - centY;
            if (s.shape) {
                ctx.globalAlpha = s.alpha || 1;
                const sx = s.scaleX || 1;
                const sy = s.scaleY || 1;
                (s.shape.rectangles || []).forEach(r => {
                    const w = sx * r.width || 0;
                    const h = sy * r.height || 0;
                    const cx = sx * r.x || -w / 2;
                    const cy = sy * r.y || -h / 2;
                    ctx.fillStyle = r.color || "black";
                    ctx.strokeStyle = r.color || "black";
                    ctx.fillRect(px + cx, py + cy, w, h);
                });
                (s.shape.text || []).forEach(r => {
                    const t = r.string || "";
                    const cx = sx * (r.x || 0);
                    const cy = sy * (r.y || 0);
                    ctx.fillStyle = r.color || "black";
                    ctx.font = (r.size || 12) + "px Georgia";
                    const attr = r.stroke ? "strokeText" : "fillText";
                    ctx[attr](t, px + cx, py + cy);
                });
            }
        });
    }

    function update() {
        const tmp = tasks.slice();
        tasks = [];
        tmp.forEach(f => f());
        const move = s => {
            if (s.dx) {
                s.x += s.dx / step;
            }
            if (s.dy) {
                s.y += s.dy / step;
            }
        };
        const update = s => {
            if (s.update) {
                s.update();
            }
        };
        sprites.forEach(move);
        sprites.forEach(checkCollisions);
        sprites.forEach(update);
    }

    function checkCollisions(s) {
        if (s.shape) {
            const sx = s.scaleX || 1;
            const sy = s.scaleY || 1;
            (s.shape.bounds || []).forEach(r => {
                const w = sx * r.width || 0;
                const h = sy * r.height || 0;
                const cx = sx * (r.x || -w / 2) + (s.x || 0);
                const cy = sy * (r.y || -h / 2) + (s.y || 0);
                sprites.filter(o => o !== s).forEach(o => {
                    const osx = o.scaleX || 1;
                    const osy = o.scaleY || 1;
                    if (o.shape)
                        (o.shape.bounds || []).forEach(b => {
                            const bw = osx * (b.width || 0);
                            const bh = osy * (b.height || 0);
                            const p1 = {
                                x: ((osx * b.x) || -bw / 2) + (o.x || 0),
                                y: ((osy * b.y) || -bh / 2) + (o.y || 0)
                            };
                            const p2 = {x: p1.x + bw, y: p1.y};
                            const p3 = {x: p1.x + bw, y: p1.y + bh};
                            const p4 = {x: p1.x, y: p1.y + bh};

                            function overlap(pt) {
                                if (pt.x >= cx && pt.x <= (cx + w)) {
                                    if (pt.y > cy && pt.y <= (cy + h)) {
                                        return true;
                                    }
                                }
                                return false;
                            }

                            if ([p1, p2, p3, p4].map(overlap).includes(true)) {
                                if (o.collision) {
                                    o.collision(s, r.id || s.id);
                                }
                                if (s.collision) {
                                    s.collision(o, b.id || o.id);
                                }
                            }
                        });
                });
            });
        }
    }

    function fadeBetween(sprite, current, final, time) {
        const next = fadeBetween.bind(null, sprite, final, current, time);
        change("alpha", sprite, current, final, time, next, step * time);
    }

    function wait(steps, callback) {
        steps > 0 ? tasks.push(wait.bind(this, steps - 1, callback)) : callback.call(this);
    }

    function RandomParticle(sprite, coloring, particles) {
        this.x = sprite.x;
        this.y = sprite.y;
        const theta = Math.random() * 2 * Math.PI;
        const r = Math.random();
        this.shape = {
            rectangles: [
                {width: particles, height: particles, color: coloring}
            ]
        };
        this.dx = 180 * r * Math.cos(theta);
        this.dy = 180 * r * Math.sin(theta);
    }

    function burst(sprite, color, time, size, num) {
        let tmp = [];
        for (let i = 0; i < Math.random() * num * 2 + 4; i++) {
            const p = new RandomParticle(sprite, color, size);
            Graphics.add(p);
            tmp.push(p);
            Graphics.delete(p, time);
        }
        return tmp;
    }

    function change(attr, sprite, current, final, time, callback, count) {
        const delta = (final - current) / time / step;
        if (!sprite[attr]) {
            sprite[attr] = 1.0;
        }
        if (--count > 0) {
            sprite[attr] += delta;
            tasks.push(change.bind(null, attr, sprite, current, final, time, callback, count));
        } else {
            sprite[attr] = final;
            tasks.push(callback.bind(sprite));
        }
    }

    function removeSprite() {
        sprites = sprites.filter(p => p !== this);
    }

    return {
        start: function (fps = 60, w = 800, h = 600, canvas = "game") {
            if (started) {
                return;
            } else {
                started = true;
            }
            const can = document.getElementById(canvas);
            can.width = w;
            can.height = h;
            width = w;
            height = h;
            step = fps;
            ctx = can.getContext("2d");
            if (renderer) {
                clearInterval(renderer);
            }
            if (updater) {
                clearInterval(updater);
            }
            renderer = setInterval(redraw, 1000 / fps);
            updater = setInterval(update, 1000 / fps);
        },
        clear: function () {
          sprites = [];
          tasks = [];
        },
        pause: function () {
            if (renderer) {
                clearInterval(renderer);
            }
            if (updater) {
                clearInterval(updater);
            }
        },
        resume: function () {
            Graphics.pause();
            renderer = setInterval(redraw, 1000 / step);
            updater = setInterval(update, 1000 / step);
        },
        blink: function (sprite, alpha = 0, time = 0.5) {
            fadeBetween(sprite, sprite.alpha || 1, alpha, time);
        },
        fade: function (sprite, final, time = 1, callback = () => {
        }) {
            tasks.push(() => change("alpha", sprite, sprite.alpha || 1, final, time, callback.bind(sprite), step * time));
        },
        resizeX: function (sprite, final, time = 1, callback = () => {
        }) {
            tasks.push(() => change("scaleX", sprite, sprite.alpha || 1, final, time, callback.bind(sprite), step * time));
        },
        resizeY: function (sprite, final, time = 1, callback = () => {
        }) {
            tasks.push(() => change("scaleY", sprite, sprite.alpha || 1, final, time, callback.bind(sprite), step * time));
        },
        after: function (time, callback) {
            tasks.push(() => wait(step * time, callback));
        },
        explosion: function (location, color = "black", time = 0.5, size = 10, num = 8) {
            return burst(location, color, time, size, num);
        },
        set background(b) {
            back = b;
        },
        delete: function (s, time = 0) {
            if (sprites.includes(s)) {
                const tmp = {x: s.x, y: s.y, alpha: s.alpha || 1, dx: s.dx, dy: s.dy};
                if (s.shape) {
                    tmp.shape = s.shape;
                    tmp.shape.bounds = [];
                    tmp.scaleX = s.scaleX;
                    tmp.scaleY = s.scaleY;
                    tmp.alpha = s.alpha;
                }
                removeSprite.call(s);
                Graphics.add(tmp);
                tasks.push(() => change("alpha", tmp, tmp.alpha, 0.1, time, removeSprite.bind(tmp), step * time));
                return tmp;
            }
        },
        add: function (...s) {
            s.forEach(p => sprites.push(p));
            s.filter(p => p.start).forEach(p => tasks.push(p.start.bind(p)));
        },
        get sprites() {
            return sprites.slice();
        },
        toFront: function (sprite) {
            if (sprites.includes(sprite)) {
                sprites = sprites.filter(s => s !== sprite);
                sprites.push(sprite);
            }
        },
        toBack: function (sprite) {
            if (sprites.includes(sprite)) {
                sprites = sprites.filter(s => s !== sprite);
                sprites.unshift(sprite);
            }
        },
        get step() {
            return step;
        },
        set center(c) {
            center = c;
        },
        get center() {
            return center;
        }
    }
}();
Object.freeze(Graphics);



