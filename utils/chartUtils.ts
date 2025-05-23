
import type { Chart as ChartJSChart, ChartConfiguration, ChartData } from 'chart.js';
import { User, HeadToHeadStats } from '../types';

// Declare Chart.js to be available globally after CDN load
declare var Chart: typeof ChartJSChart;

export const destroyChart = (chartInstance: ChartJSChart | null): void => {
  if (chartInstance) {
    chartInstance.destroy();
  }
};

export const renderHeadToHeadPieChart = (
  canvasElement: HTMLCanvasElement | null,
  existingChart: ChartJSChart | null,
  selectedUser: User,
  comparisonUser: User,
  headToHeadStats: HeadToHeadStats
): ChartJSChart | null => {
  destroyChart(existingChart);

  if (!canvasElement || !selectedUser || !comparisonUser || !headToHeadStats || headToHeadStats.gamesPlayed === 0) {
    return null;
  }

  const pieData: ChartData<'pie'> = {
    labels: [
      `${selectedUser.name} Wins`,
      `${comparisonUser.name} Wins`,
      'Ties'
    ],
    datasets: [{
      label: 'Game Outcomes',
      data: [
        headToHeadStats.selectedUserWins,
        headToHeadStats.comparisonUserWins,
        headToHeadStats.ties
      ],
      backgroundColor: [
        'rgba(54, 162, 235, 0.7)', // Blue
        'rgba(255, 99, 132, 0.7)',  // Red
        'rgba(255, 206, 86, 0.7)'  // Yellow/Orange
      ],
      borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(255, 206, 86, 1)'
      ],
      borderWidth: 1
    }]
  };

  const pieConfig: ChartConfiguration<'pie'> = {
    type: 'pie',
    data: pieData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: `Head-to-Head Game Outcomes: ${selectedUser.name} vs ${comparisonUser.name}`,
          font: { size: 16 }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed !== null) {
                label += context.parsed;
              }
              return label;
            }
          }
        }
      }
    }
  };
  
  if (typeof Chart !== 'undefined') {
    return new Chart(canvasElement, pieConfig);
  } else {
    console.error("Chart.js is not loaded.");
    return null;
  }
};
