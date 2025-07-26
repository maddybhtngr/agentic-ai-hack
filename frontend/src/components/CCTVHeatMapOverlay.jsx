import { useEffect, useRef } from 'react';

const CCTVHeatMapOverlay = ({ heatmapPoints = [], width = 300, height = 200, maxOpacity = 0.8, minOpacity = 0.1 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !heatmapPoints.length) return;

    const ctx = canvas.getContext('2d');
    const { width: canvasWidth, height: canvasHeight } = canvas;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Find max value for normalization
    const maxValue = Math.max(...heatmapPoints.map(point => point.value), 100);

    // Create a temporary canvas for better blending
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasWidth;
    tempCanvas.height = canvasHeight;
    const tempCtx = tempCanvas.getContext('2d');

    // Draw heatmap points with improved heat colors
    heatmapPoints.forEach(point => {
      const x = point.x * canvasWidth;
      const y = point.y * canvasHeight;
      const intensity = point.value / maxValue;
      
      // Create radial gradient for each point with larger radius for smoother effect
      const radius = 35;
      const gradient = tempCtx.createRadialGradient(x, y, 0, x, y, radius);
      
      // Calculate opacity based on intensity
      const opacity = minOpacity + (maxOpacity - minOpacity) * intensity;
      
      // Use proper heat map colors: green (low) → yellow (medium) → red (high)
      let color;
      if (intensity < 0.2) {
        // Very low - transparent blue
        color = `rgba(0, 100, 255, ${opacity * 0.3})`;
      } else if (intensity < 0.4) {
        // Low - green
        color = `rgba(0, 255, 0, ${opacity * 0.6})`;
      } else if (intensity < 0.6) {
        // Medium-low - yellow-green
        color = `rgba(128, 255, 0, ${opacity * 0.7})`;
      } else if (intensity < 0.8) {
        // Medium-high - yellow
        color = `rgba(255, 255, 0, ${opacity * 0.8})`;
      } else if (intensity < 0.9) {
        // High - orange
        color = `rgba(255, 165, 0, ${opacity})`;
      } else {
        // Very high - red
        color = `rgba(255, 0, 0, ${opacity})`;
      }
      
      // Create smoother gradient with multiple color stops
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.4, color.replace(/[\d\.]+\)$/g, (opacity * 0.6) + ')'));
      gradient.addColorStop(0.7, color.replace(/[\d\.]+\)$/g, (opacity * 0.3) + ')'));
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      tempCtx.fillStyle = gradient;
      tempCtx.globalCompositeOperation = 'screen'; // Better blending for heat effects
      tempCtx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    });

    // Apply blur for smoother appearance
    tempCtx.filter = 'blur(8px)';
    tempCtx.globalCompositeOperation = 'source-over';
    tempCtx.drawImage(tempCanvas, 0, 0);

    // Draw the final result to main canvas
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(tempCanvas, 0, 0);

    // Add a subtle overlay for better contrast
    const overlayGradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    overlayGradient.addColorStop(0, 'rgba(0, 0, 0, 0.05)');
    overlayGradient.addColorStop(1, 'rgba(0, 0, 0, 0.15)');
    ctx.fillStyle = overlayGradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  }, [heatmapPoints, width, height, maxOpacity, minOpacity]);

  if (!heatmapPoints.length) {
    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b',
          fontSize: '0.875rem',
          fontWeight: 500,
          borderRadius: '12px 12px 0 0'
        }}
      >
        No Heat Data Available
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 5,
        borderRadius: '12px 12px 0 0',
        mixBlendMode: 'multiply' // Better integration with background
      }}
    />
  );
};

export default CCTVHeatMapOverlay; 