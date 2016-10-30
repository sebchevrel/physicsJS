'use strict';
var SHAPE_CIRCLE = 0,
	SHAPE_RECTANGLE = 1;

/*
 *	Vector2D
 */
function Vector2D(x, y) {
	this.x = x;
	this.y = y;
}
Vector2D.prototype.getLength = function () {
	return Math.sqrt(this.dotProduct(this));
};
Vector2D.prototype.addVector = function (b) {
	return new Vector2D(this.x + b.x, this.y + b.y);
};
Vector2D.prototype.subVector = function (b) {
	return new Vector2D(this.x - b.x, this.y - b.y);
};
Vector2D.prototype.multiplyScalar = function (s) {
	return new Vector2D(this.x * s, this.y * s);
};
Vector2D.prototype.divideScalar = function (s) {
	return new Vector2D(this.x / s, this.y / s);
};
Vector2D.prototype.getAngle = function (b) {
	return Math.atan2(this.crossProduct(b), this.dotProduct(b));
};
Vector2D.prototype.rotate = function (a) {
	var sin = Math.sin(a),
		cos = Math.cos(a);
	return new Vector2D(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
};
Vector2D.prototype.dotProduct = function (b) {
	return (this.x * b.x + this.y * b.y);
};
Vector2D.prototype.crossProduct = function (b) {
	return (this.x * b.y - this.y * b.x);
};
Vector2D.prototype.clone = function () {
	return new Vector2D(this.x, this.y);
};

/*
 *	Rectangle
 */
function Rectangle(x, y, w, h) {
	this.x = this.left = x;
	this.y = this.top = y;
	this.width = w;
	this.height = h;
	this.right = this.left + this.width;
	this.bottom = this.top + this.height;
}
Rectangle.prototype.contains = function (pt) {
	if (pt.x < this.left) return false;
	if (pt.x > this.right) return false;
	if (pt.y < this.top) return false;
	if (pt.y > this.bottom) return false;
	return true;
};
Rectangle.prototype.overlaps = function (rect) {
	if (rect.right < this.left) return false;
	if (rect.left > this.right) return false;
	if (rect.bottom < this.top) return false;
	if (rect.top > this.bottom) return false;
	return true;
};

/*
 * Triangle
 */
function Triangle(a, b, c) {
	this.a = a;
	this.b = b;
	this.c = c;
}
Triangle.prototype.contains = function (pt) {
	// Compute vectors        
	var v0 = this.c.subVector(this.a),
		v1 = this.b.subVector(this.a),
		v2 = pt.subvector(this.a);
	// Compute dot products
	var dot00 = v0.dotProduct(v0),
		dot01 = v0.dotProduct(v1),
		dot02 = v0.dotProduct(v2),
		dot11 = v1.dotProduct(v1),
		dot12 = v1.dotProduct(v2);
	// Compute barycentric coordinates
	var invDenom = 1 / (dot00 * dot11 - dot01 * dot01),
		u = (dot11 * dot02 - dot01 * dot12) * invDenom,
		v = (dot00 * dot12 - dot01 * dot02) * invDenom;
	// Check if point is in triangle
	return (u >= 0) && (v >= 0) && (u + v < 1);
};

/*
 *	Body
 */
function Body(init) {
	// Defaults
	this.mass = 1;
	this.isStatic = false;
	this.position = new Vector2D(0, 0);
	this.lastPosition = new Vector2D(0, 0);
	this.velocity = new Vector2D(0, 0);
	this.acceleration = new Vector2D(0, 0);

	this.shape = SHAPE_CIRCLE;
	this.radius = 8;

	// Constructor init object
	for (var key in init)
		if (init.hasOwnProperty(key)) this[key] = init[key];

	this.lastPosition = this.position.clone();
	this.updateBoundingBox();
}
Body.prototype.updateBoundingBox = function () {
	switch (this.shape) {
	case SHAPE_CIRCLE:
		var a = this.radius * 2;
		this.boundingBox = new Rectangle(this.position.x - this.radius, this.position.y - this.radius, a, a);
		break;
	case SHAPE_RECTANGLE:
		this.boundingBox = new Rectangle(this.position.x, this.position.y, this.width, this.height);
		break;
	}
};
Body.prototype.update = function (dt) {
	// verlet
	var dt2 = dt * dt;
	this.velocity = this.position.subVector(this.lastPosition);
	var newPosition = this.position.addVector(this.velocity).addVector(this.acceleration.multiplyScalar(dt2));
	this.lastPosition = this.position.clone();
	this.position = newPosition;
	this.acceleration = new Vector2D(0, 0);
};
Body.prototype.isCollidingWidth = function (body) {
	if (this.shape == body.shape) {

	} else {

	}
};
Body.prototype.render = function (c2d) {
	c2d.beginPath();
	if (this.shape == SHAPE_CIRCLE) c2d.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
	else if (this.shape == SHAPE_RECTANGLE) c2d.rect(this.position.x, this.position.y, this.width, this.height);
	c2d.fill();
	c2d.stroke();
};

/*
 *	Constraints
 */
function DistanceConstraint(init) {
	this.a = null;
	this.b = null;
	this.distance = 0;
	this.t = 0;
	// Constructor init object
	for (var key in init)
		if (init.hasOwnProperty(key)) this[key] = init[key];

	this.update();

	if (this.motor) {
		if (!this.amplitude) this.amplitude = this.distance * 0.5;
	}
}
DistanceConstraint.prototype.update = function () {
	this.distance = this.b.position.subVector(this.a.position).getLength();
};
DistanceConstraint.prototype.apply = function (dt) {
	if (this.motor) {
		this.t += dt * this.speed;
		this.distance = Math.sin(this.t) * this.amplitude + this.amplitude * 2;
	}
	// Apply distance constraint to A and B
	var delta = this.b.position.subVector(this.a.position);
	var distance = delta.getLength();
	var acceleration = delta.multiplyScalar(dt * 0.5 * (distance - this.distance) / distance);
	if (!this.a.static) this.a.position = this.a.position.addVector(acceleration);
	if (!this.b.static) this.b.position = this.b.position.subVector(acceleration);
};
DistanceConstraint.prototype.render = function (c2d) {
	c2d.beginPath();
	c2d.moveTo(this.a.position.x, this.a.position.y);
	c2d.lineTo(this.b.position.x, this.b.position.y);
	c2d.stroke();
};

function AngleConstraint(init) {
	this.a = null;
	this.b = null;
	this.c = null;
	this.min = 0;
	this.max = Math.PI;
	this.t = 0;
	// Constructor init object
	for (var key in init)
		if (init.hasOwnProperty(key)) this[key] = init[key];
	this.update();
}
AngleConstraint.prototype.update = function () {
	this.angle = this.b.position.subVector(this.a.position).getAngle(this.c.position.subVector(this.a.position));
	this.min = this.max = this.angle;
};
AngleConstraint.prototype.apply = function (dt) {
	var delta1 = this.b.position.subVector(this.a.position);
	var delta2 = this.c.position.subVector(this.a.position);
	var angle = delta1.getAngle(delta2);
	var acceleration = (angle < this.min) ? angle - this.min : (angle > this.max) ? angle - this.max : 0;
	if (acceleration === 0) return;
	acceleration *= 0.5 * dt;
	this.b.position = delta1.rotate(acceleration).addVector(this.a.position);
	this.c.position = delta2.rotate(-acceleration).addVector(this.a.position);
};
AngleConstraint.prototype.render = function (c2d) {
	c2d.beginPath();
	c2d.moveTo(this.a.position.x, this.a.position.y);
	c2d.lineTo(this.b.position.x, this.b.position.y);
	c2d.lineTo(this.c.position.x, this.c.position.y);
	c2d.lineTo(this.a.position.x, this.a.position.y);
	c2d.fill();
};

/*
 *	World
 */
function World(init) {
	// Defaults
	this.gravity = new Vector2D(0, 0.1);
	this.bodies = [];
	this.constraints = [];
	this.c2d = null;

	// Constructor init object
	for (var key in init)
		if (init.hasOwnProperty(key)) this[key] = init[key];
}
World.prototype.getBodiesAt = function (pos) {
	var bodies = [];
	for (var i = 0, max = this.bodies.length; i < max; i++) {
		if (this.bodies[i].position.subVector(pos).getLength() < this.bodies[i].radius) bodies.push(this.bodies[i]);
	}
	return bodies;
};
World.prototype.addConstraint = function (constraint) {
	this.constraints.push(constraint);
};
World.prototype.removeConstraint = function (constraint) {
	for (var i = 0, max = this.constraints.length; i < max; i++)
		if (this.constraints[i] == constraint) this.constraints.splice(i--, 1);
};
World.prototype.addBody = function (body) {
	this.bodies.push(body);
};
World.prototype.removeBody = function (body) {
	for (var i = 0, max = this.bodies.length; i < max; i++)
		if (this.bodies[i] == body) this.bodies.splice(i--, 1);
};

World.prototype.updateConstraints = function () {
	for (var i = 0, max = this.constraints.length; i < max; i++) this.constraints[i].update();

};
World.prototype.update = function (dt) {
	var i, max;
	// apply constraints

	for (i = 0, max = this.constraints.length; i < max; i++) {
		this.constraints[i].apply(dt);
	}

	// update bodies
	for (i = 0, max = this.bodies.length; i < max; i++) {

		// update objects
		if (!this.bodies[i].static) {
			this.bodies[i].position = this.bodies[i].position.addVector(this.gravity);
			this.bodies[i].update(dt);
		}

		// collisions
		//*
		for (var j = i + 1, max2 = this.bodies.length; j < max2; j++) {
			var delta = this.bodies[j].position.subVector(this.bodies[i].position);
			var minLength = this.bodies[i].radius + this.bodies[j].radius;
			var length = delta.getLength();
			if (length < minLength) {
				var acceleration = delta.multiplyScalar(0.5 * (length - minLength) / length);
				this.bodies[i].position = this.bodies[i].position.addVector(acceleration);
				this.bodies[j].position = this.bodies[j].position.subVector(acceleration);
			}
		}
		//*/

		var frictionRestitution = 1;
		var overBottom = this.bodies[i].position.y - this.c2d.canvas.height;
		if (overBottom >= 0) {
			this.bodies[i].position.y -= overBottom;
			this.bodies[i].position.x -= (this.bodies[i].position.x - this.bodies[i].lastPosition.x) * frictionRestitution;
		}
		if (this.bodies[i].position.y <= 0) {
			this.bodies[i].position.y -= this.bodies[i].position.y;
			this.bodies[i].position.x -= (this.bodies[i].position.x - this.bodies[i].lastPosition.x) * frictionRestitution;
		}
		var overRight = this.bodies[i].position.x - this.c2d.canvas.width;
		if (overRight >= 0) {
			this.bodies[i].position.x -= overRight;
			this.bodies[i].position.y -= (this.bodies[i].position.y - this.bodies[i].lastPosition.y) * frictionRestitution;
		}
		if (this.bodies[i].position.x <= 0) {
			this.bodies[i].position.x -= this.bodies[i].position.x;
			this.bodies[i].position.y -= (this.bodies[i].position.y - this.bodies[i].lastPosition.y) * frictionRestitution;
		}

	}

};
World.prototype.render = function () {
	var i, max;
	// render constraints
	for (i = 0, max = this.constraints.length; i < max; i++)
		this.constraints[i].render(this.c2d);
	// update bodies
	for (i = 0, max = this.bodies.length; i < max; i++)
		this.bodies[i].render(this.c2d);
};