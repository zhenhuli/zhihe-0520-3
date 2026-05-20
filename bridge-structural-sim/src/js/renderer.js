class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.showStress = true;
        this.showGrid = true;
        this.stressColors = {
            low: '#4ade80',
            medium: '#facc15',
            high: '#f87171',
            critical: '#7f1d1d'
        };
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGrid() {
        if (!this.showGrid) return;
        
        const ctx = this.ctx;
        const gridSize = 40;
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        for (let x = 0; x <= this.canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height);
            ctx.stroke();
        }
        
        for (let y = 0; y <= this.canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvas.width, y);
            ctx.stroke();
        }
    }

    getStressColor(stressLevel) {
        return this.stressColors[stressLevel] || '#60a5fa';
    }

    interpolateColor(stress) {
        const ratio = Math.min(stress / 100, 100) / 100;
        
        if (ratio < 0.3) {
            return this.lerpColor('#4ade80', '#facc15', ratio / 0.3);
        } else if (ratio < 0.6) {
            return this.lerpColor('#facc15', '#f87171', (ratio - 0.3) / 0.3);
        } else {
            return this.lerpColor('#f87171', '#7f1d1d', (ratio - 0.6) / 0.4);
        }
    }

    lerpColor(color1, color2, t) {
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);
        const r = Math.round(c1.r + (c2.r - c1.r) * t);
        const g = Math.round(c1.g + (c2.g - c1.g) * t);
        const b = Math.round(c1.b + (c2.b - c1.b) * t);
        return `rgb(${r}, ${g}, ${b})`;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    drawBridge(bridge) {
        const ctx = this.ctx;
        const world = bridge.world;

        for (const spring of world.springs) {
            const p1 = spring.p1;
            const p2 = spring.p2;

            ctx.beginPath();
            ctx.moveTo(p1.pos.x, p1.pos.y);
            ctx.lineTo(p2.pos.x, p2.pos.y);

            if (this.showStress) {
                ctx.strokeStyle = this.interpolateColor(spring.stress);
            } else {
                ctx.strokeStyle = '#3b82f6';
            }
            
            ctx.lineWidth = Math.max(1, spring.thickness * 0.8);
            ctx.lineCap = 'round';
            ctx.stroke();
        }

        this.drawBridgeDeck(bridge);
        this.drawSupports(bridge);
    }

    drawBridgeDeck(bridge) {
        const ctx = this.ctx;
        const { topParticles, bottomParticles } = bridge;

        if (topParticles.length < 2) return;

        ctx.beginPath();
        ctx.moveTo(topParticles[0].pos.x, topParticles[0].pos.y);
        
        for (let i = 1; i < topParticles.length; i++) {
            ctx.lineTo(topParticles[i].pos.x, topParticles[i].pos.y);
        }
        
        for (let i = bottomParticles.length - 1; i >= 0; i--) {
            ctx.lineTo(bottomParticles[i].pos.x, bottomParticles[i].pos.y);
        }
        
        ctx.closePath();

        const maxStress = bridge.getMaxStress();
        if (this.showStress) {
            const baseColor = this.interpolateColor(maxStress * 0.5);
            ctx.fillStyle = baseColor + '60';
        } else {
            ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
        }
        ctx.fill();
        
        ctx.strokeStyle = this.showStress ? this.interpolateColor(maxStress * 0.7) : '#3b82f6';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    drawSupports(bridge) {
        const ctx = this.ctx;

        for (const support of bridge.supports) {
            const x = support.x;
            const groundY = this.canvas.height * 0.6;

            const gradient = ctx.createLinearGradient(x - 20, 0, x + 20, 0);
            gradient.addColorStop(0, '#4a5568');
            gradient.addColorStop(0.5, '#718096');
            gradient.addColorStop(1, '#4a5568');

            ctx.fillStyle = gradient;
            ctx.fillRect(x - 15, support.y + bridge.config.thickness, 30, groundY - support.y - bridge.config.thickness);

            ctx.fillStyle = '#2d3748';
            ctx.fillRect(x - 25, groundY - 5, 50, 10);

            ctx.beginPath();
            ctx.arc(support.topParticle.pos.x, support.topParticle.pos.y, 8, 0, Math.PI * 2);
            ctx.fillStyle = '#fbbf24';
            ctx.fill();
            ctx.strokeStyle = '#d97706';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    drawWeights(weights) {
        const ctx = this.ctx;

        for (const weight of weights) {
            const x = weight.x;
            const y = weight.y;
            const r = weight.radius;

            ctx.beginPath();
            ctx.moveTo(x - r * 0.8, y - r * 0.3);
            ctx.lineTo(x + r * 0.8, y - r * 0.3);
            ctx.lineTo(x + r * 0.6, y + r * 0.8);
            ctx.lineTo(x - r * 0.6, y + r * 0.8);
            ctx.closePath();

            const gradient = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
            gradient.addColorStop(0, '#6b7280');
            gradient.addColorStop(0.5, '#9ca3af');
            gradient.addColorStop(1, '#4b5563');

            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.strokeStyle = '#374151';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${weight.mass}kg`, x, y + r * 0.25);
        }
    }

    drawParticles(bridge) {
        const ctx = this.ctx;

        for (const particle of bridge.topParticles) {
            ctx.beginPath();
            ctx.arc(particle.pos.x, particle.pos.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = particle.fixed ? '#fbbf24' : '#60a5fa';
            ctx.fill();
        }
    }

    drawWater() {
        const ctx = this.ctx;
        const waterY = this.canvas.height * 0.6;

        ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
        ctx.fillRect(0, waterY, this.canvas.width, this.canvas.height - waterY);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        const time = Date.now() / 1000;
        
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            const y = waterY + 10 + i * 15;
            for (let x = 0; x <= this.canvas.width; x += 10) {
                const waveY = y + Math.sin(x * 0.02 + time + i) * 2;
                if (x === 0) {
                    ctx.moveTo(x, waveY);
                } else {
                    ctx.lineTo(x, waveY);
                }
            }
            ctx.stroke();
        }
    }

    render(bridge, weights) {
        this.clear();
        this.drawGrid();
        this.drawWater();
        this.drawBridge(bridge);
        this.drawWeights(weights);
    }
}
