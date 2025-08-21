import { useState, useEffect, useRef } from 'react';
import './BipVisualization.css';

const BipVisualization = ({ type, data, height = 250, title, caption }) => {
  const chartRef = useRef(null);
  const [canvasReady, setCanvasReady] = useState(false);
  
  useEffect(() => {
    if (chartRef.current) {
      const canvas = chartRef.current;
      const ctx = canvas.getContext('2d');
      
      // Clear previous chart
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Get visualization title from props or data
      const chartTitle = title || (data && data.title ? data.title : null);
      
      switch (type) {
        case 'barChart':
          drawBarChart(ctx, data, canvas.width, canvas.height);
          break;
        case 'lineChart':
          drawLineChart(ctx, data, canvas.width, canvas.height);
          break;
        case 'pieChart':
          drawPieChart(ctx, data, canvas.width, canvas.height);
          break;
        case 'map':
          drawMap(ctx, data, canvas.width, canvas.height);
          break;
        case 'gauge':
          // New chart type for gauge visualization
          drawGauge(ctx, data, canvas.width, canvas.height);
          break;
        case 'heatmap':
          // New chart type for heatmaps
          drawHeatmap(ctx, data, canvas.width, canvas.height);
          break;
        default:
          // Draw placeholder
          drawPlaceholder(ctx, canvas.width, canvas.height);
      }
    }
  }, [type, data, chartRef, title]);
  
  // Bar Chart Drawing
  const drawBarChart = (ctx, data, width, height) => {
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const barWidth = chartWidth / data.labels.length / 1.5;
    const maxValue = Math.max(...data.datasets.map(dataset => Math.max(...dataset.data)));
    
    // Draw axes
    ctx.beginPath();
    ctx.strokeStyle = '#ddd';
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Draw Y-axis labels
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    
    // Add gridlines and labels for Y-axis
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight - chartHeight * i / 5);
      const value = Math.round((maxValue * i / 5));
      
      ctx.fillText(value, padding - 5, y);
      
      ctx.beginPath();
      ctx.strokeStyle = '#eee';
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }
    
    // Draw bars for each dataset
    data.datasets.forEach((dataset, datasetIndex) => {
      ctx.fillStyle = dataset.backgroundColor || '#FEA000';
      
      dataset.data.forEach((value, index) => {
        const x = padding + index * (chartWidth / data.labels.length) + barWidth * datasetIndex;
        const y = height - padding - (value / maxValue) * chartHeight;
        const barHeight = (value / maxValue) * chartHeight;
        
        ctx.fillRect(x, y, barWidth, barHeight);
      });
    });
    
    // Draw X-axis labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    
    data.labels.forEach((label, index) => {
      const x = padding + index * (chartWidth / data.labels.length) + (barWidth * data.datasets.length) / 2;
      ctx.fillText(label, x, height - padding + 5);
    });
    
    // Draw legend if multiple datasets
    if (data.datasets.length > 1) {
      const legendY = padding / 2;
      
      data.datasets.forEach((dataset, index) => {
        const legendX = padding + index * 100;
        
        ctx.fillStyle = dataset.backgroundColor || '#FEA000';
        ctx.fillRect(legendX, legendY, 10, 10);
        
        ctx.fillStyle = '#666';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(dataset.label, legendX + 15, legendY + 5);
      });
    }
  };
  
  // Line Chart Drawing
  const drawLineChart = (ctx, data, width, height) => {
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const maxValue = Math.max(...data.datasets.map(dataset => Math.max(...dataset.data)));
    
    // Draw axes
    ctx.beginPath();
    ctx.strokeStyle = '#ddd';
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Draw Y-axis labels
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight - chartHeight * i / 5);
      const value = Math.round((maxValue * i / 5));
      
      ctx.fillText(value, padding - 5, y);
      
      ctx.beginPath();
      ctx.strokeStyle = '#eee';
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }
    
    // Draw lines for each dataset
    data.datasets.forEach((dataset) => {
      ctx.beginPath();
      ctx.strokeStyle = dataset.borderColor || '#FEA000';
      ctx.lineWidth = 2;
      
      dataset.data.forEach((value, index) => {
        const x = padding + index * (chartWidth / (dataset.data.length - 1));
        const y = height - padding - (value / maxValue) * chartHeight;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
      
      // Draw points
      dataset.data.forEach((value, index) => {
        const x = padding + index * (chartWidth / (dataset.data.length - 1));
        const y = height - padding - (value / maxValue) * chartHeight;
        
        ctx.beginPath();
        ctx.fillStyle = dataset.pointBackgroundColor || dataset.borderColor || '#FEA000';
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.fillStyle = '#fff';
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      });
    });
    
    // Draw X-axis labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    
    data.labels.forEach((label, index) => {
      const x = padding + index * (chartWidth / (data.labels.length - 1));
      ctx.fillText(label, x, height - padding + 5);
    });
    
    // Draw legend if multiple datasets
    if (data.datasets.length > 1) {
      const legendY = padding / 2;
      
      data.datasets.forEach((dataset, index) => {
        const legendX = padding + index * 100;
        
        ctx.strokeStyle = dataset.borderColor || '#FEA000';
        ctx.beginPath();
        ctx.moveTo(legendX, legendY + 5);
        ctx.lineTo(legendX + 10, legendY + 5);
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.fillStyle = dataset.borderColor || '#FEA000';
        ctx.beginPath();
        ctx.arc(legendX + 5, legendY + 5, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#666';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(dataset.label, legendX + 15, legendY + 5);
      });
    }
  };
  
  // Pie Chart Drawing
  const drawPieChart = (ctx, data, width, height) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 40;
    
    let startAngle = -0.5 * Math.PI; // Start from top
    
    // Draw segments
    data.forEach((item) => {
      const sliceAngle = 2 * Math.PI * item.value / total;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      
      ctx.fillStyle = item.color;
      ctx.fill();
      
      startAngle += sliceAngle;
    });
    
    // Draw legend
    const legendX = centerX - radius;
    let legendY = centerY + radius + 20;
    
    data.forEach((item) => {
      // Draw color box
      ctx.fillStyle = item.color;
      ctx.fillRect(legendX, legendY, 10, 10);
      
      // Draw label text
      ctx.fillStyle = '#666';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.font = '11px Arial';
      ctx.fillText(`${item.label}: ${item.value} (${Math.round(item.value / total * 100)}%)`, legendX + 15, legendY + 5);
      
      legendY += 20;
    });
  };
  
  // Map Drawing (simplified)
  const drawMap = (ctx, data, width, height) => {
    // Draw a simple map outline placeholder
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(20, 20, width - 40, height - 40);
    
    // Draw some map-like features
    ctx.strokeStyle = '#ddd';
    ctx.beginPath();
    ctx.moveTo(20, height / 2);
    ctx.bezierCurveTo(width / 3, height / 3, width * 2/3, height * 2/3, width - 20, height / 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(width / 2, 20);
    ctx.bezierCurveTo(width / 3, height / 3, width * 2/3, height * 2/3, width / 2, height - 20);
    ctx.stroke();
    
    // Draw data points
    if (data && data.points) {
      data.points.forEach(point => {
        const x = 20 + (width - 40) * (point.x / 100);
        const y = 20 + (height - 40) * (point.y / 100);
        
        // Draw point
        ctx.beginPath();
        ctx.fillStyle = point.color || '#FEA000';
        ctx.arc(x, y, point.size || 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw label
        if (point.label) {
          ctx.fillStyle = '#333';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.font = '10px Arial';
          ctx.fillText(point.label, x, y - 8);
        }
      });
    }
    
    // Draw note that this is a simplified map visualization
    ctx.fillStyle = '#999';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.font = '10px Arial';
    ctx.fillText('Branch location map (placeholder)', width / 2, height - 5);
  };
  
  // Gauge Chart Drawing (for metrics like utilization)
  const drawGauge = (ctx, data, width, height) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2.5;
    
    // Get value from data (0-100)
    const value = data.value || 0;
    const minValue = data.minValue || 0;
    const maxValue = data.maxValue || 100;
    
    // Calculate angles
    const startAngle = Math.PI * 0.75;
    const endAngle = Math.PI * 2.25;
    const valueAngle = startAngle + (endAngle - startAngle) * ((value - minValue) / (maxValue - minValue));
    
    // Draw background arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.lineWidth = 20;
    ctx.strokeStyle = '#f0f0f0';
    ctx.stroke();
    
    // Draw value arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, valueAngle);
    ctx.lineWidth = 20;
    
    // Determine color based on value
    let color = '#00BFA6'; // Green for high values
    if (value < 65) color = '#FEA000'; // Orange for medium values
    if (value < 40) color = '#CF3D58'; // Red for low values
    
    ctx.strokeStyle = color;
    ctx.stroke();
    
    // Draw value text
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(value)}%`, centerX, centerY);
    
    // Draw label
    if (data.label) {
      ctx.font = '14px Arial';
      ctx.fillStyle = '#777';
      ctx.fillText(data.label, centerX, centerY + 30);
    }
    
    // Draw min and max labels
    ctx.font = '12px Arial';
    ctx.fillStyle = '#999';
    ctx.textAlign = 'left';
    ctx.fillText(`${minValue}`, centerX - radius, centerY + 40);
    ctx.textAlign = 'right';
    ctx.fillText(`${maxValue}`, centerX + radius, centerY + 40);
  };
  
  // Heatmap Drawing (for showing busy times, etc)
  const drawHeatmap = (ctx, data, width, height) => {
    if (!data || !data.matrix || !data.rowLabels || !data.colLabels) {
      drawPlaceholder(ctx, width, height);
      return;
    }
    
    const padding = 50;
    const cellWidth = (width - padding * 2) / data.colLabels.length;
    const cellHeight = (height - padding * 2) / data.rowLabels.length;
    
    // Draw cells
    data.matrix.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        // Determine color based on value (0-100)
        let r = 255, g = 255, b = 255;
        
        if (value > 75) { // Hot - red
          r = 207; g = 61; b = 88; // #CF3D58
        } else if (value > 50) { // Medium - orange
          r = 254; g = 160; b = 0; // #FEA000
        } else if (value > 25) { // Low - green
          r = 0; g = 191; b = 166; // #00BFA6
        } else { // Very low - light blue
          r = 235; g = 248; b = 255;
        }
        
        const alpha = 0.2 + (value / 100) * 0.8;
        
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fillRect(
          padding + colIndex * cellWidth,
          padding + rowIndex * cellHeight,
          cellWidth,
          cellHeight
        );
        
        // Draw value text if the cell is big enough
        if (cellWidth > 30 && cellHeight > 25) {
          ctx.fillStyle = value > 50 ? 'white' : '#333';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            `${Math.round(value)}%`, 
            padding + colIndex * cellWidth + cellWidth / 2,
            padding + rowIndex * cellHeight + cellHeight / 2
          );
        }
      });
    });
    
    // Draw grid
    ctx.strokeStyle = '#ddd';
    ctx.beginPath();
    
    // Vertical lines
    for (let i = 0; i <= data.colLabels.length; i++) {
      const x = padding + i * cellWidth;
      ctx.moveTo(x, padding);
      ctx.lineTo(x, padding + data.rowLabels.length * cellHeight);
    }
    
    // Horizontal lines
    for (let i = 0; i <= data.rowLabels.length; i++) {
      const y = padding + i * cellHeight;
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + data.colLabels.length * cellWidth, y);
    }
    
    ctx.stroke();
    
    // Draw labels
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    // Column labels (usually time)
    data.colLabels.forEach((label, i) => {
      ctx.fillText(
        label,
        padding + i * cellWidth + cellWidth / 2,
        padding / 2
      );
    });
    
    // Row labels (usually days)
    ctx.textAlign = 'right';
    data.rowLabels.forEach((label, i) => {
      ctx.fillText(
        label,
        padding - 10,
        padding + i * cellHeight + cellHeight / 2
      );
    });
  };
  
  // Placeholder Drawing
  const drawPlaceholder = (ctx, width, height) => {
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = '#ccc';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '14px Arial';
    ctx.fillText('Visualization placeholder', width / 2, height / 2);
  };
  
  // Function to download chart as image
  const downloadChart = () => {
    if (chartRef.current && canvasReady) {
      const canvas = chartRef.current;
      const link = document.createElement('a');
      link.download = `${title || 'bip-visualization'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };
  
  // Set canvas as ready after rendering
  useEffect(() => {
    if (chartRef.current) {
      setCanvasReady(true);
    }
    return () => setCanvasReady(false);
  }, [data, type]);
  
  return (
    <div className="bip-visualization" style={{ height: `${height + 40}px` }}>
      {title && <div className="bip-visualization-title">{title}</div>}
      <div className="bip-visualization-chart">
        <canvas
          ref={chartRef}
          width={600}
          height={height}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
        <button 
          className="download-chart-btn" 
          onClick={downloadChart}
          title="Download chart"
          aria-label="Download chart"
          disabled={!canvasReady}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
        </button>
      </div>
      {caption && <div className="bip-visualization-caption">{caption}</div>}
    </div>
  );
};

export default BipVisualization;