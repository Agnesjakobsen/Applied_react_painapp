import React, { useState, useEffect } from 'react';
import { 
  LineChart, XAxis, YAxis, Tooltip, Legend, Line, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, Cell
} from 'recharts';
import { format, subDays, subMonths, subYears, parseISO } from 'date-fns';

function Reports() {
  const [painData, setPainData] = useState([]);
  const [rangeOption, setRangeOption] = useState('Last 7 days');
  const [filteredData, setFilteredData] = useState([]);
  const [averagePain, setAveragePain] = useState(0);
  const [mostPainfulArea, setMostPainfulArea] = useState('None');
  const [previousAveragePain, setPreviousAveragePain] = useState(0);
  const [previousMostPainfulArea, setPreviousMostPainfulArea] = useState('None');
  
  // Load data from localStorage
  useEffect(() => {
    const loadedData = JSON.parse(localStorage.getItem('painLog') || '[]');
    // Convert date strings to Date objects
    const processedData = loadedData.map(entry => ({
      ...entry,
      date: parseISO(entry.date)
    }));
    
    setPainData(processedData);
  }, []);
  
  // Filter data based on selected range
  useEffect(() => {
    if (painData.length === 0) return;
    
    const today = new Date();
    let cutoffDate;
    
    switch (rangeOption) {
      case 'Last 7 days':
        cutoffDate = subDays(today, 7);
        break;
      case 'Last month':
        cutoffDate = subMonths(today, 1);
        break;
      case 'Last year':
        cutoffDate = subYears(today, 1);
        break;
      default: // All time
        cutoffDate = new Date(0); // earliest possible date
    }
    
    const filtered = painData.filter(entry => entry.date >= cutoffDate);
    setFilteredData(filtered);
    
    // Calculate metrics for current period
    if (filtered.length > 0) {
      // Average pain
      const avgPain = filtered.reduce((sum, entry) => sum + entry.bpi5, 0) / filtered.length;
      setAveragePain(avgPain);
      
      // Most painful area
      const areaCounts = {};
      filtered.forEach(entry => {
        if (entry.bpi2) {
          entry.bpi2.split(', ').forEach(area => {
            areaCounts[area] = (areaCounts[area] || 0) + 1;
          });
        }
      });
      
      let maxCount = 0;
      let maxArea = 'None';
      
      Object.entries(areaCounts).forEach(([area, count]) => {
        if (count > maxCount) {
          maxCount = count;
          maxArea = area;
        }
      });
      
      setMostPainfulArea(maxArea);
    }
    
    // Calculate metrics for previous period
    const previousCutoffStart = (() => {
      switch (rangeOption) {
        case 'Last 7 days':
          return subDays(cutoffDate, 7);
        case 'Last month':
          return subMonths(cutoffDate, 1);
        case 'Last year':
          return subYears(cutoffDate, 1);
        default:
          return null;
      }
    })();
    
    if (previousCutoffStart) {
      const previousFiltered = painData.filter(
        entry => entry.date >= previousCutoffStart && entry.date < cutoffDate
      );
      
      if (previousFiltered.length > 0) {
        // Previous average pain
        const prevAvgPain = previousFiltered.reduce((sum, entry) => sum + entry.bpi5, 0) / previousFiltered.length;
        setPreviousAveragePain(prevAvgPain);
        
        // Previous most painful area
        const prevAreaCounts = {};
        previousFiltered.forEach(entry => {
          if (entry.bpi2) {
            entry.bpi2.split(', ').forEach(area => {
              prevAreaCounts[area] = (prevAreaCounts[area] || 0) + 1;
            });
          }
        });
        
        let prevMaxCount = 0;
        let prevMaxArea = 'None';
        
        Object.entries(prevAreaCounts).forEach(([area, count]) => {
          if (count > prevMaxCount) {
            prevMaxCount = count;
            prevMaxArea = area;
          }
        });
        
        setPreviousMostPainfulArea(prevMaxArea);
      }
    }
  }, [painData, rangeOption]);
  
  // Prepare chart data
  const prepareChartData = () => {
    // Group by day/week/month based on range
    const groupedData = {};
    
    filteredData.forEach(entry => {
      let periodKey;
      
      switch (