'use client';

import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface UsageData {
  date: string;
  ocr: number;
  feasibility: number;
  scraper: number;
  market: number;
  questionnaires: number;
}

interface UsageChartProps {
  data: UsageData[];
  period: 'week' | 'month' | 'year';
}

export default function UsageChart({ data, period }: UsageChartProps) {
  const maxValue = Math.max(
    ...data.flatMap(d => [d.ocr, d.feasibility, d.scraper, d.market, d.questionnaires])
  );

  const getBarHeight = (value: number) => {
    return Math.max((value / maxValue) * 100, 2); // Minimum 2% height for visibility
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    switch (period) {
      case 'week':
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      case 'month':
        return date.getDate().toString();
      case 'year':
        return date.toLocaleDateString('en-US', { month: 'short' });
      default:
        return dateStr;
    }
  };

  const calculateTrend = () => {
    if (data.length < 2) return { direction: 'stable', percentage: 0 };

    const latest = data[data.length - 1];
    const previous = data[data.length - 2];

    const latestTotal =
      latest.ocr + latest.feasibility + latest.scraper + latest.market + latest.questionnaires;
    const previousTotal =
      previous.ocr +
      previous.feasibility +
      previous.scraper +
      previous.market +
      previous.questionnaires;

    if (latestTotal === previousTotal) return { direction: 'stable', percentage: 0 };

    const percentage = Math.abs(((latestTotal - previousTotal) / previousTotal) * 100);
    const direction = latestTotal > previousTotal ? 'up' : 'down';

    return { direction, percentage: Math.round(percentage) };
  };

  const trend = calculateTrend();

  const getTrendIcon = () => {
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (trend.direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">Usage Trends</h3>
          </div>

          <div className="flex items-center space-x-2">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${getTrendColor()}`}>
              {trend.percentage > 0 && `${trend.percentage}%`}
              {trend.direction === 'up' && ' increase'}
              {trend.direction === 'down' && ' decrease'}
              {trend.direction === 'stable' && 'No change'}
            </span>
          </div>
        </div>

        {/* Chart */}
        <div className="relative h-64">
          <div className="absolute inset-0 flex items-end justify-between space-x-2">
            {data.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full flex flex-col items-end space-y-1 mb-2"
                  style={{ height: '200px' }}
                >
                  {/* OCR */}
                  <div
                    className="w-full bg-blue-500 rounded-t-sm"
                    style={{ height: `${getBarHeight(item.ocr)}%` }}
                    title={`OCR: ${item.ocr}`}
                  ></div>

                  {/* Feasibility */}
                  <div
                    className="w-full bg-purple-500"
                    style={{ height: `${getBarHeight(item.feasibility)}%` }}
                    title={`Feasibility: ${item.feasibility}`}
                  ></div>

                  {/* Scraper */}
                  <div
                    className="w-full bg-green-500"
                    style={{ height: `${getBarHeight(item.scraper)}%` }}
                    title={`Scraper: ${item.scraper}`}
                  ></div>

                  {/* Market */}
                  <div
                    className="w-full bg-yellow-500"
                    style={{ height: `${getBarHeight(item.market)}%` }}
                    title={`Market: ${item.market}`}
                  ></div>

                  {/* Questionnaires */}
                  <div
                    className="w-full bg-red-500 rounded-b-sm"
                    style={{ height: `${getBarHeight(item.questionnaires)}%` }}
                    title={`Questionnaires: ${item.questionnaires}`}
                  ></div>
                </div>

                <span className="text-xs text-gray-500 mt-2">{formatDate(item.date)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap items-center justify-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-600">OCR</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span className="text-sm text-gray-600">Feasibility</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Scraper</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-sm text-gray-600">Market</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-600">Questionnaires</span>
          </div>
        </div>
      </div>
    </div>
  );
}
