class BridgeSimulation {
    constructor() {
        this.canvas = document.getElementById('bridgeCanvas');
        this.world = new PhysicsWorld();
        this.renderer = new Renderer(this.canvas);
        this.weights = [];
        this.isRunning = true;
        this.isTestRunning = false;
        this.testWeight = 0;
        this.testInterval = null;
        
        this.config = {
            bridgeType: 'beam',
            thickness: 8,
            supportCount: 2,
            currentWeight: 100
        };

        this.bridge = new BridgeBuilder(this.world, {
            bridgeType: this.config.bridgeType,
            thickness: this.config.thickness,
            supportCount: this.config.supportCount
        }).build();

        this.initControls();
        this.initCanvasEvents();
        this.animate();
        this.updateInfo();
    }

    initControls() {
        document.getElementById('btnBeam').addEventListener('click', () => {
            this.setBridgeType('beam');
        });

        document.getElementById('btnArch').addEventListener('click', () => {
            this.setBridgeType('arch');
        });

        const thicknessSlider = document.getElementById('thickness');
        thicknessSlider.addEventListener('input', (e) => {
            this.config.thickness = parseInt(e.target.value);
            document.getElementById('thicknessValue').textContent = this.config.thickness;
            this.rebuildBridge();
        });

        const supportSlider = document.getElementById('supports');
        supportSlider.addEventListener('input', (e) => {
            this.config.supportCount = parseInt(e.target.value);
            document.getElementById('supportValue').textContent = this.config.supportCount;
            this.rebuildBridge();
        });

        const weightSlider = document.getElementById('weight');
        weightSlider.addEventListener('input', (e) => {
            this.config.currentWeight = parseInt(e.target.value);
            document.getElementById('weightValue').textContent = this.config.currentWeight;
        });

        document.getElementById('btnAddWeight').addEventListener('click', () => {
            this.addWeightAtCenter();
        });

        document.getElementById('btnClearWeight').addEventListener('click', () => {
            this.clearWeights();
        });

        document.getElementById('btnTest').addEventListener('click', () => {
            this.runLimitTest();
        });

        document.getElementById('btnReset').addEventListener('click', () => {
            this.reset();
        });

        document.getElementById('showStress').addEventListener('change', (e) => {
            this.renderer.showStress = e.target.checked;
        });

        document.getElementById('showGrid').addEventListener('change', (e) => {
            this.renderer.showGrid = e.target.checked;
        });
    }

    initCanvasEvents() {
        this.canvas.addEventListener('click', (e) => {
            if (this.isTestRunning) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;

            this.addWeightAtPosition(x, y);
        });
    }

    setBridgeType(type) {
        this.config.bridgeType = type;
        
        document.getElementById('btnBeam').classList.toggle('active', type === 'beam');
        document.getElementById('btnArch').classList.toggle('active', type === 'arch');
        document.getElementById('bridgeType').textContent = type === 'beam' ? '梁式桥' : '拱式桥';
        
        this.rebuildBridge();
    }

    rebuildBridge() {
        if (this.isTestRunning) {
            this.stopLimitTest();
        }
        
        this.bridge.updateConfig({
            bridgeType: this.config.bridgeType,
            thickness: this.config.thickness,
            supportCount: this.config.supportCount
        });
        
        this.reattachWeights();
    }

    reattachWeights() {
        const oldWeights = [...this.weights];
        this.weights = [];

        for (const weight of oldWeights) {
            const particle = this.bridge.findNearestTopParticle(weight.x, this.bridge.baseY);
            if (particle) {
                const newWeight = new Weight(weight.x, weight.y, weight.mass);
                newWeight.attachToParticle(particle);
                this.weights.push(newWeight);
            }
        }
    }

    addWeightAtPosition(x, y) {
        const particle = this.bridge.findNearestTopParticle(x, y);
        if (particle) {
            const weight = new Weight(particle.pos.x, particle.pos.y - 10, this.config.currentWeight);
            weight.attachToParticle(particle);
            this.weights.push(weight);
        }
    }

    addWeightAtCenter() {
        const centerX = (this.bridge.config.startX + this.bridge.config.endX) / 2;
        this.addWeightAtPosition(centerX, this.bridge.baseY);
    }

    clearWeights() {
        if (this.isTestRunning) {
            this.stopLimitTest();
        }
        
        for (const weight of this.weights) {
            if (weight.attached && weight.particle) {
                weight.particle.mass -= weight.mass * 0.01;
            }
        }
        this.weights = [];
    }

    runLimitTest() {
        if (this.isTestRunning) return;
        
        this.clearWeights();
        this.isTestRunning = true;
        this.testWeight = 0;
        
        const btn = document.getElementById('btnTest');
        btn.textContent = '测试中...';
        btn.disabled = true;

        this.testInterval = setInterval(() => {
            this.testWeight += 50;
            
            if (this.testWeight > 5000) {
                this.stopLimitTest();
                return;
            }

            const centerX = (this.bridge.config.startX + this.bridge.config.endX) / 2;
            const particle = this.bridge.findNearestTopParticle(centerX, this.bridge.baseY);
            if (particle) {
                const weight = new Weight(particle.pos.x, particle.pos.y - 10, 50);
                weight.attachToParticle(particle);
                this.weights.push(weight);
            }

            const maxStress = this.bridge.getMaxStress();
            if (maxStress >= 95) {
                this.stopLimitTest();
            }
        }, 100);
    }

    stopLimitTest() {
        this.isTestRunning = false;
        if (this.testInterval) {
            clearInterval(this.testInterval);
            this.testInterval = null;
        }
        
        const btn = document.getElementById('btnTest');
        btn.textContent = '极限承重测试';
        btn.disabled = false;
    }

    reset() {
        this.stopLimitTest();
        this.clearWeights();
        this.rebuildBridge();
    }

    updateInfo() {
        const maxDeflection = this.bridge.getMaxDeflection();
        const maxStress = this.bridge.getMaxStress();
        const totalWeight = this.weights.reduce((sum, w) => sum + w.mass, 0);

        document.getElementById('maxDeflection').textContent = maxDeflection.toFixed(1) + ' px';
        document.getElementById('totalWeight').textContent = totalWeight + ' kg';

        const stressStatus = document.getElementById('stressStatus');
        stressStatus.className = 'value';
        
        if (maxStress < 30) {
            stressStatus.textContent = '正常';
            stressStatus.classList.add('status-normal');
        } else if (maxStress < 60) {
            stressStatus.textContent = '轻微受力';
            stressStatus.classList.add('status-warning');
        } else if (maxStress < 85) {
            stressStatus.textContent = '重载警告';
            stressStatus.classList.add('status-danger');
        } else {
            stressStatus.textContent = '极限状态';
            stressStatus.classList.add('status-critical');
        }
    }

    update() {
        if (this.isRunning) {
            this.bridge.update();
            
            for (const weight of this.weights) {
                weight.update();
            }
        }
    }

    render() {
        this.renderer.render(this.bridge, this.weights);
        this.updateInfo();
    }

    animate() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new BridgeSimulation();
});
