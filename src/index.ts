/// <reference path="../p5.d/p5.global-mode.d.ts" />
class LineMeta {
  min_x: number;
  max_x: number;
  min_y: number;
  max_y: number;
  start: p5.Vector;
  end: p5.Vector;
  slope: number;
  origin: number;
  constructor(x1: number, y1: number, x2: number, y2: number) {
    this.start = createVector(x1, y1);
    this.end = createVector(x2, y2);
    this.slope = (y2 - y1) / (x2 - x1)
    if (this.slope == Infinity) this.slope = 999999;
    this.origin = y1 - this.slope * x1;
    this.max_x = Math.max(x1, x2);
    this.min_x = Math.min(x1, x2);
    this.max_y = Math.max(y1, y2);
    this.min_y = Math.min(y1, y2);
  }

  intersect(other: LineMeta): p5.Vector | null {
    let a = this.slope;
    let c = this.origin;
    let b = other.slope;
    let d = other.origin;
    let x = (d - c) / (a - b);
    let y = a * (d - c) / (a - b) + c;
    if (
      (other.min_x <= x && x <= other.max_x) &&
      (other.min_y <= y && y <= other.max_y) &&
      (this.min_x <= x && x <= this.max_x) &&
      (this.min_y <= y && y <= this.max_y)
    ) return createVector(x, y);
    return null;
  }

  render(walls: LineMeta[]) {
    if (walls.length != 0) {
      let available_targets = walls
        .map(e => this.intersect(e))
        .filter(e => e != null);
      if (available_targets.length == 0) return
      let target = available_targets
        .reduce((result, item) => (p5.Vector.dist(this.start, item) < p5.Vector.dist(this.start, result) ? item : result),
          createVector(9999, 9999))
      line(this.start.x, this.start.y, target.x, target.y)
    } else
      line(this.start.x, this.start.y, this.end.x, this.end.y)

  }
}
class Focus {
  position: p5.Vector;
  constructor(x, y) {
    this.position = createVector(x, y);
  }

  delete(walls: LineMeta[]) {
    for (let a = 0; a < 360; a += 360 / 8) {
      let line_end = p5.Vector.mult(p5.Vector.fromAngle(radians(a)), delete_radius);
      let ray_cast = new LineMeta(this.position.x, this.position.y, line_end.x + this.position.x, line_end.y + this.position.y)
      let to_delete: number[] = [];
      for (let i = 0; i < walls.length; i++) {
        if (ray_cast.intersect(walls[i])) {
          to_delete.push(i);
        }
      }
      to_delete.filter((a, b) => to_delete.indexOf(a) === b)
      for (let i of to_delete.reverse()) {
        walls.splice(i, 1);
      }
    }
  }

  render(walls: LineMeta[]) {
    for (let a = 0; a < 360; a += 360 / resolution) {
      let line_end = p5.Vector.mult(p5.Vector.fromAngle(radians(a)), max_length);
      let ray_cast = new LineMeta(this.position.x, this.position.y, line_end.x + this.position.x, line_end.y + this.position.y)
      //line(this.position.x, this.position.y, line_end.x + this.position.x, line_end.y + this.position.y)
      ray_cast.render(walls);
    }
  }
}
let max_length: number;


let current_focus: Focus;
let walls: LineMeta[] = [];
let resolution = 362;
let step = 15;
let delete_radius = 15;
function setup() {
  if (document.cookie == "") {
    alert("Welcome to RayCast!\n" +
      "Press space to disable raycast\n" +
      "When raycast is on use mouse button to delete walls\n" +
      "When raycast is off use mouse button to create walls\n"+
      "Use the scroll wheel to increase or decrease raycast amount"
    )
  }
  createCanvas(windowWidth * .99, windowHeight * .98);
  max_length = Math.sqrt(width * width + height * height);
  walls.push(new LineMeta(30, 30, width - 30, 30 + 5))
  walls.push(new LineMeta(30 + 1, 30, + 30, height - 30))
  walls.push(new LineMeta(30, height - 30, width - 30, height - 30 - 5))
  walls.push(new LineMeta(width + 1 - 30, 0 + 30, width - 30, height - 30))
  for (let i = 0; i < 15; i++) {
    walls.push(new LineMeta(random(0, width), random(0, width), random(0, height), random(0, height),))
  }
}

let drawing = true;
function keyPressed(key): void {
  if (key.code == "Space")
    drawing = !drawing;


}
let new_wall_x1: number | null = null;
let new_wall_y1: number | null = null;
//@ts-ignore
function mouseClicked() {
  if (!drawing)
    if (new_wall_x1 == null || new_wall_y1 == null) {
      new_wall_x1 = mouseX;
      new_wall_y1 = mouseY;
    } else {
      walls.push(new LineMeta(new_wall_x1, new_wall_y1, mouseX, mouseY))
      new_wall_x1 = null;
      new_wall_y1 = null;
    }
  else
    current_focus.delete(walls);
}
function mouseWheel(event): void {
  resolution += -1 * Math.sign(event.delta) * step
  if (resolution < 7) resolution = 7;
}

function draw(): void {
  background(0);
  if (drawing && 0 < mouseX && mouseX < width && 0 < mouseY && mouseY < height) {
    current_focus = new Focus(mouseX, mouseY);
    current_focus.render(walls);
  } else {
    if (new_wall_x1 != null && new_wall_y1 != null) {
      line(new_wall_x1, new_wall_y1, mouseX, mouseY)
    }
  }
  stroke(255, 255, 255, 150)
  for (let wall of walls) {
    wall.render([]);
  }

}