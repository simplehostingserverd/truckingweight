'use client';

import { useEffect, useRef } from 'react';
import { AxleWeightReading } from '@/types/scale-master';

interface AxleWeightDisplayProps {
  axleWeights: AxleWeightReading[];
  width?: number;
  height?: number;
}

export default function AxleWeightDisplay({
  axleWeights,
  width = 800,
  height = 200,
}: AxleWeightDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the truck and axles
    drawTruckWithAxles(ctx, canvas.width, canvas.height, axleWeights);
  }, [axleWeights, width, height]);

  const drawTruckWithAxles = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    axleWeights: AxleWeightReading[]
  ) => {
    // Set up dimensions
    const padding = 20;
    const truckHeight = height * 0.4;
    const wheelRadius = height * 0.1;
    const axleSpacing = (width - padding * 2) / (axleWeights.length + 1);

    // Draw the truck body
    ctx.fillStyle = '#4B5563'; // Gray-600
    ctx.strokeStyle = '#1F2937'; // Gray-800
    ctx.lineWidth = 2;

    // Truck cab
    const cabWidth = axleSpacing * 1.2;
    const cabHeight = truckHeight * 0.8;
    const cabX = padding;
    const cabY = height / 2 - cabHeight;

    ctx.beginPath();
    ctx.roundRect(cabX, cabY, cabWidth, cabHeight, 5);
    ctx.fill();
    ctx.stroke();

    // Truck trailer
    const trailerWidth = width - padding * 2 - cabWidth + 10;
    const trailerHeight = truckHeight * 0.6;
    const trailerX = cabX + cabWidth - 10;
    const trailerY = height / 2 - trailerHeight;

    ctx.beginPath();
    ctx.roundRect(trailerX, trailerY, trailerWidth, trailerHeight, 5);
    ctx.fill();
    ctx.stroke();

    // Draw the axles and wheels
    axleWeights.forEach((axle, index) => {
      const axleX = padding + axleSpacing * (index + 1);
      const axleY = height / 2;

      // Determine color based on compliance
      let wheelColor;
      if (axle.weight > axle.maxLegal) {
        wheelColor = '#EF4444'; // Red-500
      } else if (axle.weight > axle.maxLegal * 0.95) {
        wheelColor = '#F59E0B'; // Amber-500
      } else {
        wheelColor = '#10B981'; // Green-500
      }

      // Draw axle
      ctx.strokeStyle = '#1F2937'; // Gray-800
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(axleX, axleY - wheelRadius - 5);
      ctx.lineTo(axleX, axleY + wheelRadius + 5);
      ctx.stroke();

      // Draw wheels
      ctx.fillStyle = wheelColor;
      ctx.strokeStyle = '#1F2937'; // Gray-800
      ctx.lineWidth = 2;

      // Top wheel
      ctx.beginPath();
      ctx.ellipse(axleX, axleY - wheelRadius - 15, wheelRadius, wheelRadius / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Bottom wheel
      ctx.beginPath();
      ctx.ellipse(axleX, axleY + wheelRadius + 15, wheelRadius, wheelRadius / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Draw weight label
      ctx.fillStyle = '#1F2937'; // Gray-800
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        `${Math.round(axle.weight).toLocaleString()} lb`,
        axleX,
        axleY + wheelRadius + 40
      );

      // Draw axle position label
      ctx.fillStyle = '#6B7280'; // Gray-500
      ctx.font = '10px sans-serif';
      ctx.fillText(`Axle ${axle.position}`, axleX, axleY + wheelRadius + 55);

      // Draw max weight label
      ctx.fillStyle = '#6B7280'; // Gray-500
      ctx.font = '10px sans-serif';
      ctx.fillText(
        `Max: ${Math.round(axle.maxLegal).toLocaleString()} lb`,
        axleX,
        axleY + wheelRadius + 70
      );

      // Draw weight percentage
      const percentage = Math.round((axle.weight / axle.maxLegal) * 100);
      ctx.fillStyle = wheelColor;
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(`${percentage}%`, axleX, axleY - wheelRadius - 30);
    });
  };

  return (
    <div className="flex justify-center">
      <canvas ref={canvasRef} width={width} height={height} className="max-w-full" />
    </div>
  );
}
