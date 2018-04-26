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
    let started = false;

    function redraw() {
        ctx.clearRect(0, 0, width, height);
        if (back) {
            ctx.globalAlpha = 1;
            ctx.fillStyle = back;
            ctx.fillRect(0, 0, width, height);
        }
        sprites.forEach(s => {
            let px = s.x || 0;
            let py = s.y || 0;
            if (s.shape) {
                ctx.globalAlpha = s.alpha || 1;
                (s.shape.rectangles || []).forEach(r => {
                    let w = r.width || 0;
                    let h = r.height || 0;
                    let cx = r.x || -w / 2;
                    let cy = r.y || -h / 2;
                    ctx.fillStyle = r.color || "black";
                    ctx.fillRect(px + cx, py + cy, w, h);
                });
            }
        });
    }

    function update() {
        let tmp = [];
        tasks.forEach(t => tmp.push(t));
        tasks = [];
        tmp.forEach(f => f());
        sprites.forEach(s => {
            if (s.dx) {
                s.x += s.dx / step;
            }
            if (s.dy) {
                s.y += s.dy / step;
            }
            checkCollisions(s);
            if (s.update) {
                s.update(step);
            }
        });
    }

    function checkCollisions(s) {
        if (s.shape)
            (s.shape.bounds || []).forEach(r => {
                let w = r.width || 0;
                let h = r.height || 0;
                let cx = (r.x || -w / 2) + (s.x || 0);
                let cy = (r.y || -h / 2) + (s.y || 0);
                sprites.filter(o => o != s).forEach(o => {
                    if (o.shape)
                        (o.shape.bounds || []).forEach(b => {
                            let bw = b.width || 0;
                            let bh = b.height || 0;
                            let p1 = {
                                x: (b.x || -bw / 2) + (o.x || 0),
                                y: (b.y || -bh / 2) + (o.y || 0)
                            };
                            let p2 = {x: p1.x + bw, y: p1.y};
                            let p3 = {x: p1.x + bw, y: p1.y + bh};
                            let p4 = {x: p1.x, y: p1.y + bh};

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
                                    o.collision(s);
                                }
                                if (s.collision) {
                                    s.collision(o);
                                }
                            }
                        });
                });
            });
    }

    function fadeBetween(sprite, current, final, time) {
        let next = fadeBetween.bind(null, sprite, final, current, time);
        changeAlpha(sprite, current, final, time, next, step * time);
    }

    function wait(steps, callback) {
        steps > 0 ? tasks.push(wait.bind(this, steps - 1, callback)) : callback.call(this);
    }

    function RandomParticle(sprite, coloring, particles) {
        this.x = sprite.x;
        this.y = sprite.y;
        let theta = Math.random() * 2 * Math.PI;
        let r = Math.random();
        this.shape = {
            rectangles: [
                {width: particles, height: particles, color: coloring}
            ]
        }
        this.dx = 180 * r * Math.cos(theta);
        this.dy = 180 * r * Math.sin(theta);
    }

    function burst(sprite, color, size) {
        for (let i = 0; i < Math.random() * 16 + 4; i++) {
            let p = new RandomParticle(sprite, color, size);
            Graphics.add(p);
            Graphics.delete(p, 0.5);
        }
    }

    function changeAlpha(sprite, current, final, time, callback, count) {
        let delta = (final - current) / time / step;
        if (!sprite.alpha) {
            sprite.alpha = 1.0;
        }
        if (--count > 0) {
            sprite.alpha += delta;
            tasks.push(changeAlpha.bind(null, sprite, current, final, time, callback, count));
        } else {
            sprite.alpha = final;
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
            let can = document.getElementById(canvas);
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
            tasks.push(() => changeAlpha(sprite, sprite.alpha || 1, final, time, callback.bind(sprite), step * time));
        },
        after: function (time, callback) {
            tasks.push(() => wait(step * time, callback));
        },
        explosion: function (location, color = "black", size = 10) {
            burst(location, color, size);
        },
        background: function(b) {
            back = b;
        },
        delete: function (s, time = 0) {
            if (sprites.includes(s)) {
                let tmp = {x: s.x, y: s.y, alpha: s.alpha || 1, dx: s.dx, dy: s.dy};
                if (s.shape) {
                    tmp.shape = s.shape;
                    tmp.shape.bounds = [];
                }
                removeSprite.call(s);
                Graphics.add(tmp);
                tasks.push(() => changeAlpha(tmp, tmp.alpha, 0.1, time, removeSprite.bind(tmp), step * time));
            }
        },
        add: function (...s) {
            s.forEach(p => sprites.push(p));
            s.filter(p => p.start).forEach(p => tasks.push(p.start.bind(p)));
        }
    }
}();
Object.freeze(Graphics);



