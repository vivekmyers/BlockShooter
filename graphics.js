Graphics = function () {
    let ctx;
    let sprites = [];
    let renderer;
    let updater;
    let width;
    let height;
    let tasks = [];
    let step;

    function redraw() {
        ctx.clearRect(0, 0, width, height);
        sprites.forEach(s => {
            let px = s.x || 0;
            let py = s.y || 0;
            if (s.shape) {
                ctx.globalAlpha = s.alpha || 1;
                (s.shape.rectangles || []).forEach(r => {
                    let w = r.width || 0;
                    let h = r.width || 0;
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
                s.x -= s.dx / step;
            }
            if (s.dy) {
                s.y -= s.dy / step;
            }
            if (s.update) {
                s.update(step);
            }

        });
    }

    function changeAlpha(sprite, current, final, time, callback, count) {
        let delta = (final - current) / time / step;
        if (count-- > 0) {
            sprite.alpha += delta;
            tasks.push(changeAlpha.bind(null, sprite, current, final, time, callback, count));
        } else {
            tasks.push(callback);
        }
    }

    function removeSprite() {
        sprites = sprites.filter(p => p != this);
    }

    return {
        start: function (fps = 60, rate = 60, w = 800, h = 600, canvas = "game") {
            let can = document.getElementById(canvas);
            can.width = w;
            can.height = h;
            width = w;
            height = h;
            step = rate;
            ctx = can.getContext("2d");
            if (renderer) {
                clearInterval(renderer);
            }
            if (updater) {
                clearInterval(updater);
            }
            renderer = setInterval(redraw, 1000 / fps);
            updater = setInterval(update, 1000 / rate);
        },
        stop: function () {
            if (renderer) {
                clearInterval(renderer);
            }
            if (updater) {
                clearInterval(updater);
            }
        },
        fade: function (sprite, final, time = 1, callback = () => {}) {
            changeAlpha(sprite, sprite.alpha, final, time, callback, step * time);
        },
        delete: function (sprite, time = 0) {
            changeAlpha(sprite, sprite.alpha, 0, time, removeSprite.bind(sprite), step * time);
        },
        add: function (s) {
            sprites.push(s);
        }
    }
}();
Object.freeze(Graphics);



