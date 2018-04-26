function Player(x, y) {
    this.type = "Player";
    this.speed = 200;
    this.dy = 0;
    this.x = x;
    this.y = y;
    this.alpha = 1.0;
    this.loaded = true;
    this.shape = {
        rectangles: [
            {width: 35, height: 35, color: "violet"}
        ],
        bounds: [
            {width: 35, height: 35}
        ]
    };
    this.update = function () {
        this.dy += 10;
        if (action == 'd') {
            this.dx = this.speed;
        }
        else if (action == 'a') {
            this.dx = -this.speed;
        }
        else if (action == '') {
            this.dx = 0;
        }
        else if (action == ' ' && this.loaded) {
            this.loaded = false;
            Graphics.after(1, () => this.loaded = true);
            const p = new Projectile(this.x + 10, this.y);
            Graphics.add(p);
        }
    };
    this.collision = function (o) {
        if (o.type == "Ground") {
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
    this.type = "Barrier";
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
            {width: 100, height: 100}
        ]
    };
}

function Ground(h) {
    this.type = "Ground";
    this.x = 0;
    this.y = 600;
    this.alpha = 1.0;
    this.shape = {
        rectangles: [
            {width: 9999, height: h - 5, color: "gray"}
        ],
        bounds: [
            {width: 9999, height: h}
        ]
    }
}

function Projectile(x, y) {
    this.type = "Projectile";
    this.dx = 300;
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
    }
    this.start = function () {
        Graphics.after(2, () => Graphics.delete(this, 0.5));
    }
    this.collision = function (o) {
        if (o.type == "Barrier") {
            Graphics.explosion(this, "red");
            Graphics.delete(o, 0.5);
            Graphics.delete(this, 0.5);
        }
    }
}