window.onload = main;

function main() {
    var sprite = {
        x: 100,
        dx: 120,
        y: 300,
        alpha: 1.0,
        shape: {
            rectangles: [
                {width: 100, height: 100, x:0, y:0, color: "blue"}
            ]
        },
        update: function () {
            if (Math.abs(this.x - 400) > 300) {
                this.dx = -this.dx;
                if (this.dx < 0)
                    Graphics.fade(this, 0.2);
                else
                    Graphics.fade(this, 0.8);
            }
        }
    };
    Graphics.add(sprite);
    Graphics.start(fps = 60);
}