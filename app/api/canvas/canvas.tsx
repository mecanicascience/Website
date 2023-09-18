'use client'

import { useEffect, useRef } from "react";
import logger from "../logger/logger";
import { ErrorBoundary } from "react-error-boundary";

/**
 * Interface for a renderable instance
 */
export interface CanvasElement {
    /**
     * Update the instance
     * @param dt Delta time
     */
    update(dt: number): void;

    /**
     * Draw the instance
     * @param context Canvas rendering context
     */
    draw(context: CanvasRenderingContext2D): void;
}

/**
 * Canvas component
 * @param props
 * @param props.width Width of the canvas
 * @param props.height Height of the canvas
 * @param props.instance Instance of the renderable instance, must implement CanvasElement
 * @param props.errorFallback Fallback to render if an error occurs (if not specified, nothing is rendered)
 */
export default function Canvas(props: { width: number, height: number, instance: CanvasElement, errorFallback?: JSX.Element }) {
    // Create canvas
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D>(null!);

    useEffect(() => {
        // Get canvas and context
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = props.width;
            canvas.height = props.height;
        }
        const context = canvas?.getContext('2d');
        if (!context) {
            logger.error('Could not get 2d canvas context');
        }
        contextRef.current = context!;

        // Render loop
        let animationFrameId: number;
        let lastTime: number = new Date().getTime();
        const render = () => {
            // Calculate delta time
            const time = new Date().getTime();
            const dt = (time - lastTime) / 1000;
            lastTime = time;

            // Clear context
            context?.clearRect(0, 0, props.width, props.height);

            // Update and draw
            props.instance.update.bind(props.instance)(dt);
            props.instance.draw.bind(props.instance)(context!);

            // Request next frame
            animationFrameId = window.requestAnimationFrame(render);
        };
        render();

        // Cleanup
        return () => {
            window.cancelAnimationFrame(animationFrameId);
        };
    }, [props.width, props.height, props.instance]);


    return (
        <ErrorBoundary fallback={props.errorFallback ?? <></>}>
            <canvas ref={canvasRef} width={props.width} height={props.height} />
        </ErrorBoundary>
    );
}
