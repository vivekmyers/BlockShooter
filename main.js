window.onload = main;

function main() {
    const g = new Game();
    const request = new XMLHttpRequest();
    const time = new Date();
    const formatted = time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
    request.open("POST", "/?log=blockshooter-[" + formatted + "]", true);
    request.send();
    g.load(1);
    window.fps = 60;
    Graphics.start(fps);
}
