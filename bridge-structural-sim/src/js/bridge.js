class BridgeBuilder {
    constructor(world, config = {}) {
        this.world = world;
        this.config = {
            startX: config.startX || 100,
            endX: config.endX || 800,
            baseY: config.baseY || 250,
            segmentCount: config.segmentCount || 20,
            thickness: config.thickness || 8,
            supportCount: config.supportCount || 2,
            bridgeType: config.bridgeType || 'beam',
            archHeight: config.archHeight || 80,
            stiffness: config.stiffness || 0.85
        };
        this.topParticles = [];
        this.bottomParticles = [];
        this.supports = [];
        this.baseY = this.config.baseY;
    }

    build() {
        this.world.clear();
        this.topParticles = [];
        this.bottomParticles = [];
        this.supports = [];

        const { startX, endX, baseY, segmentCount, thickness, bridgeType, archHeight } = this.config;
        const span = endX - startX;
        const segmentLength = span / segmentCount;

        const getYOffset = (t) => {
            if (bridgeType === 'arch') {
                return -Math.sin(t * Math.PI) * archHeight;
            }
            return 0;
        };

        for (let i = 0; i <= segmentCount; i++) {
            const t = i / segmentCount;
            const x = startX + t * span;
            const yOffset = getYOffset(t);
            const topY = baseY + yOffset;
            const bottomY = topY + thickness;

            const isSupport = this.isSupportPoint(i, segmentCount);
            const topParticle = this.world.addParticle(new Particle(x, topY, isSupport, 1));
            const bottomParticle = this.world.addParticle(new Particle(x, bottomY, isSupport, 1));

            this.topParticles.push(topParticle);
            this.bottomParticles.push(bottomParticle);

            if (isSupport) {
                this.supports.push({ x, y: topY, topParticle, bottomParticle });
            }
        }

        this.connectStructure();
        return this;
    }

    isSupportPoint(index, segmentCount) {
        const { supportCount } = this.config;
        
        if (supportCount <= 2) {
            return index === 0 || index === segmentCount;
        }

        if (index === 0 || index === segmentCount) return true;

        const internalSupports = supportCount - 2;
        const step = segmentCount / (internalSupports + 1);
        
        for (let i = 1; i <= internalSupports; i++) {
            if (Math.abs(index - Math.round(step * i)) < 0.5) {
                return true;
            }
        }
        return false;
    }

    connectStructure() {
        const { stiffness, thickness, segmentCount } = this.config;
        const thicknessFactor = thickness / 8;
        const springStiffness = stiffness * (0.5 + thicknessFactor * 0.5);

        for (let i = 0; i < this.topParticles.length; i++) {
            const top = this.topParticles[i];
            const bottom = this.bottomParticles[i];
            this.world.createSpring(top, bottom, null, springStiffness * 1.5, thickness);
        }

        for (let i = 0; i < this.topParticles.length - 1; i++) {
            const top1 = this.topParticles[i];
            const top2 = this.topParticles[i + 1];
            const bottom1 = this.bottomParticles[i];
            const bottom2 = this.bottomParticles[i + 1];

            this.world.createSpring(top1, top2, null, springStiffness, thickness);
            this.world.createSpring(bottom1, bottom2, null, springStiffness, thickness);

            this.world.createSpring(top1, bottom2, null, springStiffness * 0.7, thickness * 0.5);
            this.world.createSpring(bottom1, top2, null, springStiffness * 0.7, thickness * 0.5);
        }

        if (this.config.bridgeType === 'arch' && this.supports.length >= 2) {
            const leftSupport = this.supports[0];
            const rightSupport = this.supports[this.supports.length - 1];

            for (let i = 1; i < this.topParticles.length - 1; i++) {
                const particle = this.topParticles[i];
                if (i % 3 === 0) {
                    this.world.createSpring(leftSupport.topParticle, particle, null, springStiffness * 0.3, thickness * 0.3);
                    this.world.createSpring(rightSupport.topParticle, particle, null, springStiffness * 0.3, thickness * 0.3);
                }
            }
        }

        for (let i = 0; i < this.supports.length; i++) {
            const support = this.supports[i];
            const groundParticle = this.world.addParticle(
                new Particle(support.x, support.y + 100, true, 1000)
            );
            this.world.createSpring(support.bottomParticle, groundParticle, 100, springStiffness * 2, thickness * 2);
        }
    }

    findNearestTopParticle(x, y) {
        let nearest = null;
        let minDist = Infinity;

        for (const particle of this.topParticles) {
            const dist = Math.sqrt(
                Math.pow(particle.pos.x - x, 2) + 
                Math.pow(particle.pos.y - y, 2)
            );
            if (dist < minDist && dist < 50) {
                minDist = dist;
                nearest = particle;
            }
        }

        return nearest;
    }

    getBridgeBounds() {
        return {
            minX: this.config.startX,
            maxX: this.config.endX,
            minY: this.baseY - (this.config.bridgeType === 'arch' ? this.config.archHeight : 0) - 20,
            maxY: this.baseY + this.config.thickness + 20
        };
    }

    getMaxDeflection() {
        return this.world.getMaxDeflection(this.baseY);
    }

    getMaxStress() {
        return this.world.getMaxStress();
    }

    update() {
        this.world.update(1);
    }

    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
        return this.build();
    }
}
