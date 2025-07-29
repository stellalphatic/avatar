import React, { useEffect, useRef, useState, useCallback } from "react";

export const SparklesCore = ({
  id,
  background = "transparent",
  minSize = 0.8,
  maxSize = 2.0,
  particleDensity = 800, //Density of particles...
  className,
  particleColor = ["#FFFFFF"],
}) => {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: null, y: null, radius: 120 });
  const particles = useRef([]);

  const getParticleColor = useCallback(() => {
    if (Array.isArray(particleColor)) {
      return particleColor[Math.floor(Math.random() * particleColor.length)];
    }
    return particleColor;
  }, [particleColor]);

  const createParticle = useCallback((canvasWidth, canvasHeight) => {
    return {
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      size: Math.random() * (maxSize - minSize) + minSize,
      speedX: Math.random() * 0.7 - 0.35,
      speedY: Math.random() * 0.7 - 0.35,
      opacity: Math.random() * 0.8 + 0.2,
      fade: Math.random() * 0.008 + 0.003,
      color: getParticleColor(),
    };
  }, [minSize, maxSize, getParticleColor]);

  const initParticles = useCallback((canvasWidth, canvasHeight) => {
    particles.current = [];
    for (let i = 0; i < particleDensity; i++) {
      particles.current.push(createParticle(canvasWidth, canvasHeight));
    }
  }, [particleDensity, createParticle]);

  useEffect(() => {
    if (!canvasRef.current) return;

    // FIX: Correctly access the canvas DOM element from canvasRef.current
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initParticles(canvas.width, canvas.height);
    };

    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = event.clientX - rect.left;
      mouse.current.y = event.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.current.x = null;
      mouse.current.y = null;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.current.forEach((particle, index) => {
        const dx = mouse.current.x !== null ? mouse.current.x - particle.x : 0;
        const dy = mouse.current.y !== null ? mouse.current.y - particle.y : 0;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const normalSpeedX = Math.random() * 0.7 - 0.35;
        const normalSpeedY = Math.random() * 0.7 - 0.35;

        // Apply force based on proximity to mouse
        if (distance < mouse.current.radius && mouse.current.x !== null) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const forceMagnitude = (mouse.current.radius - distance) / mouse.current.radius;
          const attractionStrength = 0.8;

          particle.speedX = normalSpeedX + forceDirectionX * attractionStrength * forceMagnitude;
          particle.speedY = normalSpeedY + forceDirectionY * attractionStrength * forceMagnitude;

          particle.currentOpacity = Math.min(1, particle.opacity + (1 - forceMagnitude * 0.5));
          particle.currentSize = Math.min(maxSize * 1.8, particle.size + forceMagnitude * 0.8);
        } else {
          particle.speedX = normalSpeedX;
          particle.speedY = normalSpeedY;
          particle.currentOpacity = particle.opacity;
          particle.currentSize = particle.size;
        }

        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.opacity -= particle.fade;

        if (particle.opacity <= 0 || particle.currentOpacity <= 0) {
          particles.current[index] = createParticle(canvas.width, canvas.height);
          particles.current[index].opacity = Math.random() * 0.8 + 0.2;
        }

        if (particle.x < 0 || particle.x > canvas.width) {
          particle.speedX *= -1;
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.speedY *= -1;
        }

        ctx.save();
        ctx.globalAlpha = particle.currentOpacity || particle.opacity;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.currentSize || particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    initParticles(canvas.width, canvas.height);
    animate();

    window.addEventListener("resize", resizeCanvas);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [initParticles, createParticle, minSize, maxSize, particleDensity]); // Dependencies are fine

  return (
    <canvas
      ref={canvasRef}
      id={id}
      className={className}
      style={{ background }}
    />
  );
};