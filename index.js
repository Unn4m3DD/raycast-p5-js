/// <reference path="./p5.d/p5.global-mode.d.ts" />
var LineMeta = /** @class */ (function () {
    function LineMeta(x1, y1, x2, y2) {
        this.start = createVector(x1, y1);
        this.end = createVector(x2, y2);
        this.slope = (y2 - y1) / (x2 - x1);
        if (this.slope == Infinity)
            this.slope = 999999;
        this.origin = y1 - this.slope * x1;
        this.max_x = Math.max(x1, x2);
        this.min_x = Math.min(x1, x2);
        this.max_y = Math.max(y1, y2);
        this.min_y = Math.min(y1, y2);
    }
    LineMeta.prototype.intersect = function (other) {
        var a = this.slope;
        var c = this.origin;
        var b = other.slope;
        var d = other.origin;
        var x = (d - c) / (a - b);
        var y = a * (d - c) / (a - b) + c;
        if ((other.min_x <= x && x <= other.max_x) &&
            (other.min_y <= y && y <= other.max_y) &&
            (this.min_x <= x && x <= this.max_x) &&
            (this.min_y <= y && y <= this.max_y))
            return createVector(x, y);
        return null;
    };
    LineMeta.prototype.render = function (walls) {
        var _this = this;
        if (walls.length != 0) {
            var available_targets = walls
                .map(function (e) { return _this.intersect(e); })
                .filter(function (e) { return e != null; });
            if (available_targets.length == 0)
                return;
            var target = available_targets
                .reduce(function (result, item) { return (p5.Vector.dist(_this.start, item) < p5.Vector.dist(_this.start, result) ? item : result); }, createVector(9999, 9999));
            line(this.start.x, this.start.y, target.x, target.y);
        }
        else
            line(this.start.x, this.start.y, this.end.x, this.end.y);
    };
    return LineMeta;
}());
var Focus = /** @class */ (function () {
    function Focus(x, y) {
        this.res = 362;
        this.position = createVector(x, y);
    }
    Focus.prototype.render = function (walls) {
        for (var a = 0; a < 360; a += 360 / this.res) {
            var line_end = p5.Vector.mult(p5.Vector.fromAngle(radians(a)), max_length);
            var ray_cast = new LineMeta(this.position.x, this.position.y, line_end.x + this.position.x, line_end.y + this.position.y);
            //line(this.position.x, this.position.y, line_end.x + this.position.x, line_end.y + this.position.y)
            ray_cast.render(walls);
        }
    };
    return Focus;
}());
var max_length;
var current_focus;
var walls = [];
function setup() {
    createCanvas(windowWidth * .99, windowHeight * .98);
    max_length = Math.sqrt(width * width + height * height);
    walls.push(new LineMeta(30, 30, width - 30, 30 + 5));
    walls.push(new LineMeta(30 + 1, 30, +30, height - 30));
    walls.push(new LineMeta(30, height - 30, width - 30, height - 30 - 5));
    walls.push(new LineMeta(width + 1 - 30, 0 + 30, width - 30, height - 30));
    for (var i = 0; i < 15; i++) {
        walls.push(new LineMeta(random(0, width), random(0, width), random(0, height), random(0, height)));
    }
}
function draw() {
    background(0);
    if (0 < mouseX && mouseX < width && 0 < mouseY && mouseY < height) {
        current_focus = new Focus(mouseX, mouseY);
        current_focus.render(walls);
    }
    stroke(255, 255, 255, 150);
    for (var _i = 0, walls_1 = walls; _i < walls_1.length; _i++) {
        var wall = walls_1[_i];
        wall.render([]);
    }
}
