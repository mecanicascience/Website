'use client'

import styles from './animation.module.css'
import { useCallback, useEffect, useMemo } from "react";
import React from "react";
import Canvas from '../../api/canvas/canvas';

class Simulation {
    // Particles properties
    private particlesCount: number;
    private positions: Array<{x: number, y: number}>;
    private velocities: Array<{x: number, y: number}>;
    private radius: Array<number>;
    private alpha: Array<number>;

    // Link between particles
    private links: Array<{p0Index: number, p1Index: number}>;

    // Window size
    private width: number;
    private height: number;

    // Mouse
    private mouse: {x: number, y: number};
    private mousePressed: boolean;

    constructor(particlesCount: number, width: number, height: number) {
        this.particlesCount = particlesCount;
        this.width = width;
        this.height = height;
        this.mouse = {x: -1000, y: -1000};
        this.mousePressed = false;

        // Set initial positions and velocities
        this.positions = new Array(particlesCount).fill(0).map(() => {return {
            x: Math.random() * width, y: Math.random() * height
        }});
        this.positions.push(this.mouse);
        const maxVelocity = 60;
        this.velocities = new Array(2 * particlesCount).fill(0).map(() => {return {
            x: Math.random() * maxVelocity - maxVelocity / 2, y: Math.random() * maxVelocity - maxVelocity / 2
        }});

        // Set radius
        const minRadius = 0.8;
        const maxRadius = 3;
        this.radius = new Array(particlesCount).fill(0).map(() => Math.random() * (maxRadius - minRadius) + minRadius);

        // Set alpha
        const minAlpha = 0.1;
        const maxAlpha = 0.4;
        this.alpha = new Array(particlesCount).fill(0).map(() => Math.random() * (maxAlpha - minAlpha) + minAlpha);

        // Set links
        this.links = [];
        this.updateLinks();
    }

    updateLinks() {
        // Find links
        const minDistance = 300;
        let links: Array<{p0Index: number, p1Index: number}> = [];
        for (let i = 0; i < this.particlesCount; i++) {
            for (let j = i + 1; j < this.particlesCount; j++) {
                const p0 = this.positions[i];
                const p1 = this.positions[j];
                const distance = Math.sqrt((p0.x - p1.x) ** 2 + (p0.y - p1.y) ** 2);
                if (distance < minDistance) {
                    links.push({p0Index: i, p1Index: j});
                }
            }
        }

        // Update velocities based on links
        for (let i = 0; i < links.length; i++) {
            const p0 = this.positions[links[i].p0Index];
            const p1 = this.positions[links[i].p1Index];
            const distance = Math.sqrt((p0.x - p1.x) ** 2 + (p0.y - p1.y) ** 2);

            // Apply repulsion if too close
            const minDistance = 100;
            if (distance < minDistance) {
                const angle = Math.atan2(p1.y - p0.y, p1.x - p0.x);
                const force = 5 / distance;
                this.velocities[links[i].p0Index].x -= force * Math.cos(angle);
                this.velocities[links[i].p0Index].y -= force * Math.sin(angle);
                this.velocities[links[i].p1Index].x += force * Math.cos(angle);
                this.velocities[links[i].p1Index].y += force * Math.sin(angle);
            }
        }

        // Set links
        this.links = links;
    }

    update(dt: number) {
        const mouse = this.mouse;

        // Update positions and velocities
        for (let i = 0; i < this.particlesCount-1; i++) {
            const position = this.positions[i];
            const velocity = this.velocities[i];

            // p = p + v * dt
            position.x += velocity.x * dt;
            position.y += velocity.y * dt;

            // Add mouse repulsion
            const mouseDist = Math.min(Math.sqrt((position.x - mouse.x) ** 2 + (position.y - mouse.y) ** 2), 300);
            if (mouseDist < 0.1 * this.width) {
                const mouseAngle = Math.atan2(position.y - mouse.y, position.x - mouse.x);
                const mouseForce = (this.mousePressed ? 1 : -1) * Math.min(8000 / mouseDist, 80);
                velocity.x += mouseForce * Math.cos(mouseAngle) * dt;
                velocity.y += mouseForce * Math.sin(mouseAngle) * dt;
            }

            // Maximize velocity
            const maxVelocity = 80;
            const velocityNorm = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
            if (velocityNorm > maxVelocity) {
                velocity.x *= maxVelocity / velocityNorm;
                velocity.y *= maxVelocity / velocityNorm;
            }

            // Handle edges
            const [width, height] = [this.width, this.height];
            if (position.x < 0) position.x = width;
            if (position.x > width) position.x = 0;
            if (position.y < 0) position.y = height;
            if (position.y > height) position.y = 0;
        }

        // Last particle is at mouse position
        this.positions[this.particlesCount-1] = mouse;

        // Update links
        this.updateLinks();
    }

    draw(context: CanvasRenderingContext2D) {
        // Draw particles
        for (let i = 0; i < this.particlesCount; i++) {
            const position = this.positions[i];
            const radius = this.radius[i];

            // Draw particle
            context.beginPath();
            context.arc(position.x, position.y, radius, 0, 2 * Math.PI);
            context.fillStyle = `rgba(120, 143, 185, ${this.alpha[i]})`;
            context.fill();
        }

        // Draw links
        for (let i = 0; i < this.links.length; i++) {
            const link = this.links[i];
            const p0 = this.positions[link.p0Index];
            const p1 = this.positions[link.p1Index];
            const dist = Math.sqrt((p0.x - p1.x) ** 2 + (p0.y - p1.y) ** 2);

            let d = 130;
            let a = 0.7;
            // If one particle is mouse, increase max distance and alpha
            if (link.p0Index === this.particlesCount-1 || link.p1Index === this.particlesCount-1) {
                d = 200;
                a = 0.9;
            }
            const formattedDist = Math.min(1, Math.max(0, dist / d));
            const alpha = a * (1 - formattedDist);

            // Draw link
            context.beginPath();
            context.moveTo(p0.x, p0.y);
            context.lineTo(p1.x, p1.y);
            context.strokeStyle = `rgba(80, 103, 145, ${alpha})`;
            context.lineWidth = 0.6;
            context.stroke();
        }
    }

    setMouse(x: number, y: number) {
        this.mouse = {x, y};
    }
    setMousePressed(pressed: boolean) {
        this.mousePressed = pressed;
    }
}

export default function HeaderAnimation() {
    // Get window size
    const divRef = React.useRef<HTMLDivElement>(null);
    let [width, setWidth] = React.useState(0);
    let [height, setHeight] = React.useState(0);
    useEffect(() => {
        setWidth(window.document.body.clientWidth);
        setHeight(1.1 * window.innerHeight);
    }, []);

    // Create simulation
    const particlesCount = width < 600 ? 150 : 300;
    const physics = useMemo(
        () => new Simulation(particlesCount, width, height),
    [particlesCount, width, height]);

    // Get mouse pressed
    const intervalRef = React.useRef<NodeJS.Timeout>();
    const startCounter = () => {
        if (intervalRef.current) return;
        intervalRef.current = setInterval(() => {
            physics.setMousePressed(true);
        }, 10);
    };
    const stopCounter = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            physics.setMousePressed(false);
            intervalRef.current = undefined;
        }
    }, [physics]);

    // Get mouse position
    useEffect(() => {
        const updateMouse = (event: MouseEvent) => {
            physics.setMouse(event.clientX, event.clientY + window.scrollY);
        }
        const currentDiv = document.body;
        currentDiv?.addEventListener('mousemove', updateMouse);
        return () => {
            currentDiv?.removeEventListener('mousemove', updateMouse);
            stopCounter();
        };
    }, [physics, stopCounter]);

    return (
        <div className={styles.container} onMouseDown={startCounter} onMouseUp={stopCounter} onMouseLeave={stopCounter}>
            <Canvas width={width} height={height} instance={physics} />
        </div>
    )
}