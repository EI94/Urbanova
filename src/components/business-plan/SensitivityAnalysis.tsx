'use client';

/**
 * 📊 SENSITIVITY ANALYSIS - JOHNNY IVE STYLE
 * 
 * Componente per analisi di sensibilità interattiva
 * Con slider fluidi, animazioni delicate e feedback visivo immediato
 * 
 * Design Principles:
 * - Minimale ma potente
 * - Feedback immediato e chiaro
 * - Animazioni naturali e fluide
 * - Progressive disclosure
 * - Zero friction
 */

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, Info, DollarSign, Calendar, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import type { SensitivityOutput } from '@/lib/businessPlanService';

interface SensitivityAnalysisProps {
  sensitivity: SensitivityOutput[];
  baseScenarioName: string;
  onVariableChange?: (variable: string, value: number) => void;
}

export default function SensitivityAnalysis({
  sensitivity,
  baseScenarioName,
  onVariableChange
}: SensitivityAnalysisProps) {
  const [selectedVariable, setSelectedVariable] = useState<string>(sensitivity[0]?.variable || '');
  const [selectedValue, setSelectedValue] = useState<number>(0);
  const [expandedChart, setExpandedChart] = useState<string | null>(null);
  const [hoverPoint, setHoverPoint] = useState<number | null>(null);
  
  // Trova i dati della variabile selezionata
  const currentSensitivity = sensitivity.find(s => s.variable === selectedVariable);
  
  // Effetto per aggiornare il valore quando cambia la variabile
  useEffect(() => {
    if (currentSensitivity) {
      const baseValue = currentSensitivity.values.find(v => v.value === 0);
      setSelectedValue(baseValue?.value || 0);
    }
  }, [currentSensitivity]);
  
  const formatNumber = (num: number) => {
    if (Math.abs(num) >= 1000000) {
      return `€${(num / 1000000).toFixed(2)}M`;
    }
    if (Math.abs(num) >= 1000) {
      return `€${(num / 1000).toFixed(0)}k`;
    }
    return `€${num.toFixed(0)}`;
  };
  
  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };
  
  const getVariableIcon = (variable: string) => {
    if (variable.toLowerCase().includes('prezz')) return DollarSign;
    if (variable.toLowerCase().includes('cost')) return DollarSign;
    if (variable.toLowerCase().includes('tass')) return TrendingUp;
    if (variable.toLowerCase().includes('contribu')) return DollarSign;
    if (variable.toLowerCase().includes('paga')) return DollarSign;
    if (variable.toLowerCase().includes('ritard') || variable.toLowerCase().includes('tempo')) return Calendar;
    return Zap;
  };
  
  const getVariableColor = (variable: string) => {
    if (variable.toLowerCase().includes('prezz')) return 'text-green-600 bg-green-100 border-green-200';
    if (variable.toLowerCase().includes('cost')) return 'text-orange-600 bg-orange-100 border-orange-200';
    if (variable.toLowerCase().includes('tass')) return 'text-blue-600 bg-blue-100 border-blue-200';
    if (variable.toLowerCase().includes('contribu')) return 'text-purple-600 bg-purple-100 border-purple-200';
    if (variable.toLowerCase().includes('paga')) return 'text-pink-600 bg-pink-100 border-pink-200';
    return 'text-gray-600 bg-gray-100 border-gray-200';
  };
  
  // Calcola range per chart
  const getChartRange = (values: number[]) => {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1;
    return { min: min - padding, max: max + padding };
  };
  
  // Normalizza valore per posizione nel chart (0-100%)
  const normalizeValue = (value: number, range: { min: number; max: number }) => {
    return ((value - range.min) / (range.max - range.min)) * 100;
  };
  
  if (!currentSensitivity) {
    return (
      <div className="bg-gray-50 rounded-2xl p-8 text-center">
        <Info className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Nessuna analisi di sensibilità disponibile</p>
      </div>
    );
  }
  
  // Trova valore selezionato
  const selectedData = currentSensitivity.values.find(v => v.value === selectedValue) || currentSensitivity.values[0];
  const baseData = currentSensitivity.values.find(v => v.value === 0);
  
  // Calcola delta rispetto al base
  const deltaNPV = baseData ? selectedData.npv - baseData.npv : 0;
  const deltaIRR = baseData ? selectedData.irr - baseData.irr : 0;
  const deltaMargin = baseData ? selectedData.margin - baseData.margin : 0;
  
  return (
    <div className="space-y-6">
      {/* Header Elegante */}
      <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-1">Analisi di Sensibilità</h3>
            <p className="text-sm text-gray-600">Scenario base: {baseScenarioName}</p>
          </div>
          
          <div className="flex items-center space-x-2 bg-white rounded-xl px-4 py-2 shadow-sm border border-purple-200">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">Interattivo</span>
          </div>
        </div>
      </div>
      
      {/* Selezione Variabile - Pills Eleganti */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-4">Seleziona Variabile</label>
        
        <div className="flex flex-wrap gap-3">
          {sensitivity.map((sens) => {
            const Icon = getVariableIcon(sens.variable);
            const isSelected = sens.variable === selectedVariable;
            const colorClass = getVariableColor(sens.variable);
            
            return (
              <button
                key={sens.variable}
                onClick={() => setSelectedVariable(sens.variable)}
                className={`
                  group relative flex items-center space-x-2 px-5 py-3 rounded-xl
                  border-2 transition-all duration-300 ease-out
                  ${isSelected 
                    ? `${colorClass} shadow-lg scale-105` 
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-md hover:scale-102'
                  }
                `}
              >
                <Icon className={`w-4 h-4 transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className={`text-sm font-medium transition-colors ${isSelected ? '' : 'text-gray-700'}`}>
                  {sens.variable}
                </span>
                
                {/* Indicatore Break-Even */}
                {sens.breakEvenPoint && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white shadow-sm">
                    <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Slider Premium con Visual Feedback */}
      <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium text-gray-700">
              Valore {currentSensitivity.variable}
            </label>
            
            {/* Display Valore Grande e Chiaro */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-1">Valore Selezionato</div>
                <div className="text-2xl font-bold text-gray-900">
                  {currentSensitivity.variable.includes('€') 
                    ? formatNumber(selectedValue)
                    : currentSensitivity.variable.includes('%')
                    ? formatPercentage(selectedValue)
                    : selectedValue.toFixed(0)
                  }
                </div>
              </div>
            </div>
          </div>
          
          {/* Slider Custom Premium */}
          <div className="relative pt-6 pb-8">
            {/* Track Background */}
            <div className="absolute top-9 left-0 right-0 h-2 bg-gray-200 rounded-full overflow-hidden">
              {/* Gradient Fill fino al valore selezionato */}
              <div 
                className="absolute top-0 left-1/2 h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
                style={{ 
                  width: `${Math.abs(selectedValue / Math.max(...currentSensitivity.values.map(v => Math.abs(v.value)))) * 50}%`,
                  transform: selectedValue >= 0 ? 'translateX(0)' : 'translateX(-100%)'
                }}
              ></div>
            </div>
            
            {/* Marker punto zero */}
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
              <div className="w-1 h-4 bg-gray-400 rounded-full"></div>
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                <span className="text-xs text-gray-500 font-medium">Base</span>
              </div>
            </div>
            
            {/* Slider Input - Invisibile ma funzionale */}
            <input
              type="range"
              min={Math.min(...currentSensitivity.values.map(v => v.value))}
              max={Math.max(...currentSensitivity.values.map(v => v.value))}
              step={currentSensitivity.values.length > 1 
                ? currentSensitivity.values[1].value - currentSensitivity.values[0].value 
                : 1
              }
              value={selectedValue}
              onChange={(e) => {
                const newValue = parseFloat(e.target.value);
                setSelectedValue(newValue);
                onVariableChange?.(currentSensitivity.variable, newValue);
              }}
              className="absolute top-8 left-0 right-0 w-full h-4 appearance-none bg-transparent cursor-pointer z-10
                [&::-webkit-slider-thumb]:appearance-none 
                [&::-webkit-slider-thumb]:w-6 
                [&::-webkit-slider-thumb]:h-6 
                [&::-webkit-slider-thumb]:rounded-full 
                [&::-webkit-slider-thumb]:bg-white 
                [&::-webkit-slider-thumb]:border-4 
                [&::-webkit-slider-thumb]:border-blue-500 
                [&::-webkit-slider-thumb]:shadow-xl
                [&::-webkit-slider-thumb]:transition-all
                [&::-webkit-slider-thumb]:duration-200
                [&::-webkit-slider-thumb]:hover:scale-125
                [&::-webkit-slider-thumb]:active:scale-110
                [&::-moz-range-thumb]:appearance-none 
                [&::-moz-range-thumb]:w-6 
                [&::-moz-range-thumb]:h-6 
                [&::-moz-range-thumb]:rounded-full 
                [&::-moz-range-thumb]:bg-white 
                [&::-moz-range-thumb]:border-4 
                [&::-moz-range-thumb]:border-blue-500 
                [&::-moz-range-thumb]:shadow-xl
                [&::-moz-range-thumb]:transition-all
                [&::-moz-range-thumb]:duration-200
                [&::-moz-range-thumb]:hover:scale-125
                [&::-moz-range-thumb]:active:scale-110
              "
            />
            
            {/* Labels Range */}
            <div className="absolute top-14 left-0 right-0 flex justify-between text-xs text-gray-500">
              <span className="font-medium">
                {currentSensitivity.variable.includes('€') 
                  ? formatNumber(Math.min(...currentSensitivity.values.map(v => v.value)))
                  : Math.min(...currentSensitivity.values.map(v => v.value)).toFixed(0)
                }
              </span>
              <span className="font-medium">
                {currentSensitivity.variable.includes('€') 
                  ? formatNumber(Math.max(...currentSensitivity.values.map(v => v.value)))
                  : Math.max(...currentSensitivity.values.map(v => v.value)).toFixed(0)
                }
              </span>
            </div>
          </div>
        </div>
        
        {/* Quick Value Buttons */}
        <div className="flex flex-wrap gap-2 mt-8">
          <span className="text-xs text-gray-500 font-medium self-center mr-2">Quick:</span>
          {currentSensitivity.values.filter(v => v.value % 5 === 0 || v.value === 0).map((val) => (
            <button
              key={val.value}
              onClick={() => setSelectedValue(val.value)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                ${val.value === selectedValue
                  ? 'bg-blue-600 text-white shadow-md scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                }
              `}
            >
              {val.value > 0 ? '+' : ''}{val.value}
              {currentSensitivity.variable.includes('%') ? '%' : ''}
            </button>
          ))}
        </div>
      </div>
      
      {/* Metriche Impatto - Cards Eleganti con Animazioni */}
      <div className="grid grid-cols-3 gap-4">
        {/* VAN */}
        <div className="group bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-600">VAN</div>
            {deltaNPV !== 0 && (
              deltaNPV > 0 
                ? <TrendingUp className="w-5 h-5 text-green-500 animate-bounce" />
                : <TrendingDown className="w-5 h-5 text-red-500 animate-bounce" />
            )}
          </div>
          
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(selectedData.npv)}
            </div>
            
            {baseData && deltaNPV !== 0 && (
              <div className={`flex items-center space-x-2 text-sm font-medium ${
                deltaNPV > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                <span>{deltaNPV > 0 ? '+' : ''}{formatNumber(deltaNPV)}</span>
                <span className="text-xs">
                  ({deltaNPV > 0 ? '+' : ''}{((deltaNPV / baseData.npv) * 100).toFixed(1)}%)
                </span>
              </div>
            )}
          </div>
          
          {/* Progress Bar Sottile */}
          <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ease-out ${
                selectedData.npv > 0 ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-red-400 to-red-600'
              }`}
              style={{ width: `${Math.min(Math.abs((selectedData.npv / (baseData?.npv || 1)) * 100), 100)}%` }}
            ></div>
          </div>
        </div>
        
        {/* TIR */}
        <div className="group bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-600">TIR</div>
            {deltaIRR !== 0 && (
              deltaIRR > 0 
                ? <TrendingUp className="w-5 h-5 text-blue-500 animate-bounce" />
                : <TrendingDown className="w-5 h-5 text-red-500 animate-bounce" />
            )}
          </div>
          
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-900">
              {formatPercentage(selectedData.irr)}
            </div>
            
            {baseData && deltaIRR !== 0 && (
              <div className={`flex items-center space-x-2 text-sm font-medium ${
                deltaIRR > 0 ? 'text-blue-600' : 'text-red-600'
              }`}>
                <span>{deltaIRR > 0 ? '+' : ''}{deltaIRR.toFixed(1)}pt</span>
              </div>
            )}
          </div>
          
          <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-1000 ease-out"
              style={{ width: `${Math.min((selectedData.irr / 30) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
        
        {/* Margine */}
        <div className="group bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-600">Margine</div>
            {deltaMargin !== 0 && (
              deltaMargin > 0 
                ? <TrendingUp className="w-5 h-5 text-purple-500 animate-bounce" />
                : <TrendingDown className="w-5 h-5 text-red-500 animate-bounce" />
            )}
          </div>
          
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-900">
              {formatPercentage(selectedData.margin)}
            </div>
            
            {baseData && deltaMargin !== 0 && (
              <div className={`flex items-center space-x-2 text-sm font-medium ${
                deltaMargin > 0 ? 'text-purple-600' : 'text-red-600'
              }`}>
                <span>{deltaMargin > 0 ? '+' : ''}{deltaMargin.toFixed(1)}pt</span>
              </div>
            )}
          </div>
          
          <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-1000 ease-out"
              style={{ width: `${Math.min((selectedData.margin / 30) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Chart Linea Elegante */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-semibold text-gray-900">Grafico Sensibilità VAN</h4>
          
          <button
            onClick={() => setExpandedChart(expandedChart ? null : 'npv')}
            className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span>{expandedChart ? 'Riduci' : 'Espandi'}</span>
            {expandedChart ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
        
        <div className={`relative transition-all duration-500 ${expandedChart ? 'h-96' : 'h-64'}`}>
          {/* Asse Y */}
          <div className="absolute left-0 top-0 bottom-8 w-20 flex flex-col justify-between text-xs text-gray-500 text-right pr-2">
            {[...Array(5)].map((_, i) => {
              const range = getChartRange(currentSensitivity.values.map(v => v.npv));
              const value = range.max - (i * (range.max - range.min) / 4);
              return (
                <span key={i} className="font-medium">
                  {formatNumber(value)}
                </span>
              );
            })}
          </div>
          
          {/* Chart Area */}
          <div className="absolute left-20 right-0 top-0 bottom-8">
            {/* Grid Lines Subtle */}
            <div className="absolute inset-0">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className="absolute left-0 right-0 border-t border-gray-100"
                  style={{ top: `${i * 25}%` }}
                ></div>
              ))}
            </div>
            
            {/* Zero Line */}
            {(() => {
              const range = getChartRange(currentSensitivity.values.map(v => v.npv));
              if (range.min < 0 && range.max > 0) {
                const zeroPosition = normalizeValue(0, range);
                return (
                  <div 
                    className="absolute left-0 right-0 border-t-2 border-gray-400 border-dashed"
                    style={{ top: `${100 - zeroPosition}%` }}
                  >
                    <span className="absolute left-2 -top-2 text-xs text-gray-500 bg-white px-1">Zero</span>
                  </div>
                );
              }
              return null;
            })()}
            
            {/* Line Path con SVG */}
            <svg className="absolute inset-0 w-full h-full overflow-visible">
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
                
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              
              {/* Area sotto la linea */}
              <path
                d={(() => {
                  const range = getChartRange(currentSensitivity.values.map(v => v.npv));
                  const points = currentSensitivity.values.map((val, i) => {
                    const x = (i / (currentSensitivity.values.length - 1)) * 100;
                    const y = 100 - normalizeValue(val.npv, range);
                    return `${x},${y}`;
                  });
                  return `M 0,100 L ${points.join(' L ')} L 100,100 Z`;
                })()}
                fill="url(#areaGradient)"
                className="transition-all duration-1000"
              />
              
              {/* Linea principale */}
              <polyline
                points={currentSensitivity.values.map((val, i) => {
                  const range = getChartRange(currentSensitivity.values.map(v => v.npv));
                  const x = (i / (currentSensitivity.values.length - 1)) * 100;
                  const y = 100 - normalizeValue(val.npv, range);
                  return `${x}%,${y}%`;
                }).join(' ')}
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-1000"
              />
              
              {/* Punti interattivi */}
              {currentSensitivity.values.map((val, i) => {
                const range = getChartRange(currentSensitivity.values.map(v => v.npv));
                const x = (i / (currentSensitivity.values.length - 1)) * 100;
                const y = 100 - normalizeValue(val.npv, range);
                const isSelected = val.value === selectedValue;
                const isHovered = hoverPoint === i;
                
                return (
                  <g key={i}>
                    <circle
                      cx={`${x}%`}
                      cy={`${y}%`}
                      r={isSelected ? "8" : isHovered ? "6" : "4"}
                      fill="white"
                      stroke={isSelected ? "#3B82F6" : "#8B5CF6"}
                      strokeWidth={isSelected ? "3" : "2"}
                      className="cursor-pointer transition-all duration-200 hover:scale-125"
                      onClick={() => setSelectedValue(val.value)}
                      onMouseEnter={() => setHoverPoint(i)}
                      onMouseLeave={() => setHoverPoint(null)}
                    />
                    
                    {/* Tooltip on hover */}
                    {(isHovered || isSelected) && (
                      <g>
                        <rect
                          x={`${x}%`}
                          y={`${y - 15}%`}
                          width="100"
                          height="40"
                          rx="8"
                          fill="white"
                          stroke="#E5E7EB"
                          strokeWidth="1"
                          className="opacity-95 shadow-xl"
                          transform="translate(-50, -50)"
                        />
                        <text
                          x={`${x}%`}
                          y={`${y - 10}%`}
                          textAnchor="middle"
                          className="text-xs font-medium fill-gray-900"
                          transform="translate(0, -30)"
                        >
                          {val.value > 0 ? '+' : ''}{val.value}
                          {currentSensitivity.variable.includes('%') ? '%' : ''}
                        </text>
                        <text
                          x={`${x}%`}
                          y={`${y - 10}%`}
                          textAnchor="middle"
                          className="text-xs font-bold fill-blue-600"
                          transform="translate(0, -15)"
                        >
                          {formatNumber(val.npv)}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
          
          {/* Asse X */}
          <div className="absolute left-20 right-0 bottom-0 h-8 flex justify-between items-center text-xs text-gray-500">
            <span className="font-medium">
              {Math.min(...currentSensitivity.values.map(v => v.value))}
            </span>
            <span className="font-medium text-gray-700">
              {currentSensitivity.variable}
            </span>
            <span className="font-medium">
              {Math.max(...currentSensitivity.values.map(v => v.value))}
            </span>
          </div>
        </div>
      </div>
      
      {/* Break-Even Point (se presente) */}
      {currentSensitivity.breakEvenPoint && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <AlertCircle className="w-6 h-6 text-yellow-900" />
            </div>
            
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-900 mb-2">Punto di Break-Even</h4>
              <p className="text-sm text-yellow-800 mb-3">{currentSensitivity.breakEvenPoint.description}</p>
              
              <div className="inline-flex items-center space-x-2 bg-white rounded-xl px-4 py-2 shadow-sm">
                <span className="text-sm font-medium text-gray-700">Break-even a:</span>
                <span className="text-lg font-bold text-yellow-900">
                  {currentSensitivity.variable.includes('€') 
                    ? formatNumber(currentSensitivity.breakEvenPoint.value)
                    : currentSensitivity.variable.includes('%')
                    ? formatPercentage(currentSensitivity.breakEvenPoint.value)
                    : currentSensitivity.breakEvenPoint.value.toFixed(2)
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Tabella Dati Completa (Collassabile) */}
      <details className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden group">
        <summary className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between">
          <span className="font-medium text-gray-900">Dati Dettagliati</span>
          <ChevronDown className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform duration-300" />
        </summary>
        
        <div className="px-6 pb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Valore</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700">VAN</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700">TIR</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700">Margine</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700">DSCR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentSensitivity.values.map((val, i) => {
                  const isBase = val.value === 0;
                  const isSelected = val.value === selectedValue;
                  
                  return (
                    <tr 
                      key={i}
                      className={`
                        hover:bg-blue-50 transition-colors cursor-pointer
                        ${isSelected ? 'bg-blue-100' : ''}
                        ${isBase ? 'bg-green-50 font-medium' : ''}
                      `}
                      onClick={() => setSelectedValue(val.value)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          {isBase && (
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          )}
                          <span className={isBase ? 'font-bold text-green-900' : ''}>
                            {val.value > 0 ? '+' : ''}{val.value}
                            {currentSensitivity.variable.includes('%') ? '%' : ''}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">{formatNumber(val.npv)}</td>
                      <td className="px-4 py-3 text-right">{formatPercentage(val.irr)}</td>
                      <td className="px-4 py-3 text-right">{formatPercentage(val.margin)}</td>
                      <td className="px-4 py-3 text-right">{val.dscr.toFixed(2)}x</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </details>
    </div>
  );
}

