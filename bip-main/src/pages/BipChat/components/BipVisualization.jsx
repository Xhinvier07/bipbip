import { useEffect, useRef } from 'react';

const BipVisualization = ({ type, data, height = 250 }) => {
  const chartRef = useRef(null);
  
  useEffect(() => {
    if (chartRef.current) {
      const canvas = chartRef.current;
      const ctx = canvas.getContext('2d');
      
      // Clear previous chart
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
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
        default:
          // Draw placeholder
          drawPlaceholder(ctx, canvas.width, canvas.height);
      }
    }
  }, [type, data, chartRef]);
  
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
  
  return (
    <div className="bip-visualization" style={{ height: `${height}px` }}>
      <canvas
        ref={chartRef}
        width={600}
        height={height}
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  );
};

export default BipVisualization;