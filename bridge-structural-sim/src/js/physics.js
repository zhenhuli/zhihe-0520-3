class Vec2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        return new Vec2(this.x + v.x, this.y + v.y);
    }

    sub(v) {
        return new Vec2(this.x - v.x, this.y - v.y);
    }

    mul(s) {
        return new Vec2(this.x * s, this.y * s);
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const len = this.length();
        if (len === 0) return new Vec2(0, 0);
        return new Vec2(this.x / len, this.y / len);
    }

    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    clone() {
        return new Vec2(this.x, this.y);
    }
}

class Particle {
    constructor(x, y, fixed = false, mass = 1) {
        this.pos = new Vec2(x, y);
        this.prevPos = new Vec2(x, y);
        this.acc = new Vec2(0, 0);
        this.fixed = fixed;
        this.mass = mass;
        this.radius = 4;
    }

    applyForce(force) {
        if (this.fixed) return;
        this.acc = this.acc.add(force.mul(1 / this.mass));
    }

    update(dt, damping = 0.98) {
        if (this.fixed) return;

        const vel = this.pos.sub(this.prevPos).mul(damping);
        const newPos = this.pos.add(vel).add(this.acc.mul(dt * dt));

        this.prevPos = this.pos.clone();
        this.pos = newPos;
        this.acc = new Vec2(0, 0);
    }
}

class Spring {
    constructor(p1, p2, restLength = null, stiffness = 0.8, thickness = 1) {
        this.p1 = p1;
        this.p2 = p2;
        this.restLength = restLength || p1.pos.sub(p2.pos).length();
        this.stiffness = stiffness;
        this.thickness = thickness;
        this.stress = 0;
        this.maxStress = 100;
    }

    satisfy() {
        const diff = this.p2.pos.sub(this.p1.pos);
        const dist = diff.length();
        const error = dist - this.restLength;
        const stressRatio = Math.abs(error) / this.restLength;
        this.stress = Math.min(stressRatio * 1000, this.maxStress);

        if (dist === 0) return;

        const correction = diff.normalize().mul(error * 0.5 * this.stiffness);

        if (!this.p1.fixed) {
            this.p1.pos = this.p1.pos.add(correction);
        }
        if (!this.p2.fixed) {
            this.p2.pos = this.p2.pos.sub(correction);
        }
    }

    getStressLevel() {
        const ratio = this.stress / this.maxStress;
        if (ratio < 0.3) return 'low';
        if (ratio < 0.6) return 'medium';
        if (ratio < 0.85) return 'high';
        return 'critical';
    }
}

class PhysicsWorld {
    constructor() {
        this.particles = [];
        this.springs = [];
        this.gravity = new Vec2(0, 0.5);
        this.damping = 0.98;
        this.iterations = 8;
    }

    addParticle(particle) {
        this.particles.push(particle);
        return particle;
    }

    addSpring(spring) {
        this.springs.push(spring);
        return spring;
    }

    createSpring(p1, p2, restLength = null, stiffness = 0.8, thickness = 1) {
        const spring = new Spring(p1, p2, restLength, stiffness, thickness);
        this.springs.push(spring);
        return spring;
    }

    update(dt = 1) {
        for (const particle of this.particles) {
            particle.applyForce(this.gravity);
            particle.update(dt, this.damping);
        }

        for (let i = 0; i < this.iterations; i++) {
            for (const spring of this.springs) {
                spring.satisfy();
            }
        }
    }

    getMaxDeflection(baseY) {
        let maxDeflection = 0;
        for (const particle of this.particles) {
            if (!particle.fixed) {
                const deflection = particle.pos.y - baseY;
                if (deflection > maxDeflection) {
                    maxDeflection = deflection;
                }
            }
        }
        return maxDeflection;
    }

    getMaxStress() {
        let maxStress = 0;
        for (const spring of this.springs) {
            if (spring.stress > maxStress) {
                maxStress = spring.stress;
            }
        }
        return maxStress;
    }

    clear() {
        this.particles = [];
        this.springs = [];
    }
}

class Weight {
    constructor(x, y, mass = 100) {
        this.x = x;
        this.y = y;
        this.mass = mass;
        this.particle = null;
        this.attached = false;
        this.radius = Math.max(10, Math.sqrt(mass) * 0.8);
    }

    attachToParticle(particle) {
        this.particle = particle;
        this.attached = true;
        particle.mass += this.mass * 0.01;
    }

    update() {
        if (this.attached && this.particle) {
            this.x = this.particle.pos.x;
            this.y = this.particle.pos.y;
        }
    }
}
