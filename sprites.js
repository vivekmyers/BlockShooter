function Player(x, y) {
    this.speed = 200;
    this.dy = 0;
    this.x = x;
    this.y = y;
    this.alpha = 1.0;
    this.loaded = true;
    this.scaleX = 1;
    this.walk = 1;
    this.legPosition = 0;
    this.moveLegs = function (x) {
        this.shape = {
            rectangles: [
                {width: 20, height: 4, y: 3, color: "tan"},
                {width: 6, height: 3, y: 2, x: 8, color: "black"},
                {width: 10, height: 10, y: 15, x: -8 - x / 2, color: "tan"},
                {width: 10, height: 10, y: 15, x: 5 - x / 2 * 0.8, color: "tan"},
                {width: 10, height: 35, color: "darkblue"},
                {width: 18, height: 18, y: -18, color: "tan"},
                {width: 3, height: 3, y: -12, x: -5, color: "black"},
                {width: 3, height: 3, y: -12, x: 5, color: "black"},
                {width: 18, height: 2, y: -18, color: "brown"},
                {width: 13.5, height: 2, y: -18.5, color: "brown"},
                {width: 9, height: 2, y: -19, color: "brown"}
            ]
        };
        this.shape.bounds = this.shape.rectangles;
    };
    this.id = "Player";
    this.moveLegs(0);
    this.update = function (step) {
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.x > 800) {
            this.x = 800;
        }
        let d2y = 1000 / step;
        this.dy += d2y;
        if (this.dx !== 0) {
            if (this.walk) {
                this.legPosition += this.walk * 50 / step;
                this.moveLegs(this.legPosition);
                if (this.legPosition > 10 || this.legPosition < 0) {
                    this.walk = -this.walk;
                }
            }
        }
        if (action == 'd') {
            this.scaleX = 1;
            this.dx = this.speed;
        }
        else if (action == 'a') {
            this.scaleX = -1;
            this.dx = -this.speed;
        }
        else if (action == '') {
            this.dx = 0;
        }
        else if (action == ' ' && this.loaded) {
            this.loaded = false;
            Graphics.after(1, () => this.loaded = true);
            const p = new Projectile(this.x + 15 * this.scaleX, this.y, this.dx + 400 * this.scaleX, (this.dy - d2y) / 4);
            Graphics.add(p);
        }
    };
    this.collision = function (o, t) {
        if (t == "Ground") {
            if (action == 'w') {
                this.dy = -this.speed * 4;
            }
            if (this.dy > 0) {
                this.dy = 0;
            }
        }
    }
}

function Barrier(x, y) {
    this.x = x;
    this.y = y;
    this.dy = 60;
    this.flip = function () {
        this.dy = -this.dy;
        Graphics.after(2, this.flip.bind(this));
    };
    this.alpha = 1.0;
    this.start = function () {
        Graphics.blink(this, 0.5);
        this.flip.call(this);
    };
    this.color = ["red", "green", "blue", "yellow", "purple"][Math.floor(Math.random() * 5)];
    this.shape = {
        rectangles: [
            {width: 75, height: 75, color: this.color}
        ],
        bounds: [
            {width: 100, height: 100, id: "Barrier"}
        ]
    };
}

function Ground(h) {
    this.x = 0;
    this.y = 600;
    this.alpha = 1.0;
    this.shape = {
        rectangles: [
            {width: 9999, height: h - 5, color: "gray"}
        ],
        bounds: [
            {width: 9999, height: h, id: "Ground"}
        ]
    }
}

function Projectile(x, y, dx, dy) {
    this.type = "Projectile";
    this.dx = dx;
    this.dy = dy;
    this.x = x;
    this.y = y;
    this.alpha = 0.8;
    this.shape = {
        rectangles: [
            {width: 10, height: 10, color: "black"}
        ],
        bounds: [
            {width: 15, height: 15}
        ]
    };
    this.start = function () {
        Graphics.after(2, () => Graphics.delete(this, 0.5));
    };
    this.collision = function (o, t) {
        if (t == "Barrier") {
            Graphics.explosion(this, "red");
            Graphics.delete(o, 0.5);
            Graphics.delete(this, 0.5);
        } else if (t == "Ground") {
            Graphics.delete(this, 0.1);
        }
    }
}