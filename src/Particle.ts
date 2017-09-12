export interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    energy: number;
    brightness: number;
    size: number;
}

export function updateParticles(particles: Particle[]) {
    for (const particle of particles) {
        particle.energy *= 0.9;
        if (particle.energy <= 0.01) {
            const idx = particles.indexOf(particle);
            particles.splice(idx, 1);
        } else {
            particle.x += particle.vx;
            particle.y -= particle.vy;
        }
    }
}

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
    particles.forEach((particle) => {
        const alpha = particle.brightness === 0 ? 1 : Math.min(1, particle.energy);
        ctx.fillStyle = `rgba(${particle.brightness},${particle.brightness},${particle.brightness},${alpha})`;
        const sz = particle.brightness === 0 ? particle.size : particle.size - alpha * particle.size;
        particle.vy -= 0.04;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, sz, 0, Math.PI * 2);
        ctx.fill();
    });
}
