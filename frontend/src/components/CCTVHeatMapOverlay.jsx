import { useEffect, useRef } from 'react';

const CCTVHeatMapOverlay = ({ heatmapPoints = [], width = 300, height = 200, maxOpacity = 0.8, minOpacity = 0.1 }) => {
  const canvasRef = useRef(null);

  const getColorFromIntensity = (intensity) => {
    // Smooth color transitions for heat map: blue -> green -> yellow -> orange -> red
    const colors = [
      { r: 0, g: 0, b: 255 },     // Blue (cold)
      { r: 0, g: 255, b: 255 },   // Cyan
      { r: 0, g: 255, b: 0 },     // Green
      { r: 255, g: 255, b: 0 },   // Yellow
      { r: 255, g: 165, b: 0 },   // Orange
      { r: 255, g: 0, b: 0 }      // Red (hot)
    ];

    const scaledIntensity = intensity * (colors.length - 1);
    const colorIndex = Math.floor(scaledIntensity);
    const fraction = scaledIntensity - colorIndex;

    if (colorIndex >= colors.length - 1) {
      return colors[colors.length - 1];
    }

    const color1 = colors[colorIndex];
    const color2 = colors[colorIndex + 1];

    return {
      r: Math.round(color1.r + (color2.r - color1.r) * fraction),
      g: Math.round(color1.g + (color2.g - color1.g) * fraction),
      b: Math.round(color1.b + (color2.b - color1.b) * fraction)
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !heatmapPoints.length) return;

    const ctx = canvas.getContext('2d');
    const { width: canvasWidth, height: canvasHeight } = canvas;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Create image data for pixel manipulation
    const imageData = ctx.createImageData(canvasWidth, canvasHeight);
    const data = imageData.data;

    // Find max value for normalization
    const maxValue = Math.max(...heatmapPoints.map(point => point.value || 100), 100);
    
    // Create intensity grid
    const intensityGrid = new Array(canvasHeight).fill(null).map(() => new Array(canvasWidth).fill(0));
    
    // Calculate influence radius based on canvas size
    const influenceRadius = Math.min(canvasWidth, canvasHeight) * 0.15; // 15% of smaller dimension
    
    // Apply gaussian influence for each heatmap point
    heatmapPoints.forEach(point => {
      const centerX = Math.round(point.x * canvasWidth);
      const centerY = Math.round(point.y * canvasHeight);
      const intensity = (point.value || 100) / maxValue;
      
      // Apply gaussian distribution around each point
      for (let y = 0; y < canvasHeight; y++) {
        for (let x = 0; x < canvasWidth; x++) {
          const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
          
          if (distance <= influenceRadius) {
            // Gaussian falloff
            const falloff = Math.exp(-(distance ** 2) / (2 * (influenceRadius / 3) ** 2));
            intensityGrid[y][x] += intensity * falloff;
          }
        }
      }
    });

    // Normalize intensity values and apply to image data
    let maxIntensity = 0;
    for (let y = 0; y < canvasHeight; y++) {
      for (let x = 0; x < canvasWidth; x++) {
        if (intensityGrid[y][x] > maxIntensity) {
          maxIntensity = intensityGrid[y][x];
        }
      }
    }

    // Apply colors to pixels
    for (let y = 0; y < canvasHeight; y++) {
      for (let x = 0; x < canvasWidth; x++) {
        const normalizedIntensity = maxIntensity > 0 ? intensityGrid[y][x] / maxIntensity : 0;
        
        if (normalizedIntensity > 0.01) { // Only render visible pixels
          const color = getColorFromIntensity(normalizedIntensity);
          const alpha = Math.round((minOpacity + (maxOpacity - minOpacity) * normalizedIntensity) * 255);
          
          const pixelIndex = (y * canvasWidth + x) * 4;
          data[pixelIndex] = color.r;     // Red
          data[pixelIndex + 1] = color.g; // Green
          data[pixelIndex + 2] = color.b; // Blue
          data[pixelIndex + 3] = alpha;   // Alpha
        }
      }
    }

    // Put the image data back to canvas
    ctx.putImageData(imageData, 0, 0);

    // Apply additional smoothing with canvas filter
    ctx.filter = 'blur(1px)';
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(canvas, 0, 0);
    ctx.filter = 'none';

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
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📊</div>
          <div>No Heat Data Available</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '4px' }}>
            Waiting for analysis data...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '12px 12px 0 0',
      overflow: 'hidden'
    }}>
      {/* Background gradient */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
        zIndex: 1
      }} />
      
      {/* Heatmap canvas */}
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
          zIndex: 2,
          mixBlendMode: 'screen' // Better integration with background
        }}
      />
      
      {/* Heat map legend */}
      <div style={{
        position: 'absolute',
        bottom: 8,
        right: 8,
        background: 'rgba(0, 0, 0, 0.8)',
        borderRadius: 8,
        padding: '8px 12px',
        zIndex: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        <div style={{
          width: 60,
          height: 12,
          background: 'linear-gradient(90deg, #0000ff 0%, #00ffff 20%, #00ff00 40%, #ffff00 60%, #ffa500 80%, #ff0000 100%)',
          borderRadius: 6,
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }} />
        <div style={{
          color: 'white',
          fontSize: '0.75rem',
          fontWeight: 500
        }}>
          Activity
        </div>
      </div>
      
      {/* Point count indicator */}
      <div style={{
        position: 'absolute',
        top: 8,
        right: 8,
        background: 'rgba(0, 0, 0, 0.8)',
        borderRadius: 16,
        padding: '4px 12px',
        zIndex: 3,
        color: 'white',
        fontSize: '0.75rem',
        fontWeight: 600
      }}>
        {heatmapPoints.length} points
      </div>
    </div>
  );
};

export default CCTVHeatMapOverlay; 