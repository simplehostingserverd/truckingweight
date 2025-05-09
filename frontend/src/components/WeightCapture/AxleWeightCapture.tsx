'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { 
  TruckIcon, 
  ArrowPathIcon, 
  CheckCircleIcon,
  XCircleIcon,
  PlusCircleIcon,
  MinusCircleIcon
} from '@heroicons/react/24/outline';
import WeightReader from './WeightReader';

interface AxleWeightCaptureProps {
  scale: any;
  vehicleId: number;
  onAxleWeightsCaptured: (axleWeights: Array<{ axleNumber: number; weight: number; axleType?: string }>) => void;
}

export default function AxleWeightCapture({ 
  scale, 
  vehicleId,
  onAxleWeightsCaptured
}: AxleWeightCaptureProps) {
  const supabase = createClientComponentClient<Database>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [axleConfiguration, setAxleConfiguration] = useState<any>(null);
  const [axleWeights, setAxleWeights] = useState<Array<{ axleNumber: number; weight: number; axleType?: string }>>([]);
  const [currentAxle, setCurrentAxle] = useState(1);
  const [completed, setCompleted] = useState(false);

  // Fetch vehicle's axle configuration
  useEffect(() => {
    const fetchAxleConfiguration = async () => {
      try {
        setLoading(true);
        
        // Get auth token from supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          throw new Error('No active session');
        }
        
        // Fetch vehicle details
        const response = await fetch(`/api/vehicles/${vehicleId}`, {
          headers: {
            'x-auth-token': session.access_token
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch vehicle details');
        }
        
        const vehicleData = await response.json();
        
        // If vehicle has axle configuration, fetch it
        if (vehicleData.axle_configuration_id) {
          const axleConfigResponse = await fetch(`/api/axle-configurations/${vehicleData.axle_configuration_id}`, {
            headers: {
              'x-auth-token': session.access_token
            }
          });
          
          if (!axleConfigResponse.ok) {
            const errorData = await axleConfigResponse.json();
            throw new Error(errorData.message || 'Failed to fetch axle configuration');
          }
          
          const axleConfigData = await axleConfigResponse.json();
          setAxleConfiguration(axleConfigData);
        } else {
          // Default to 5 axles if no configuration is set
          setAxleConfiguration({
            axle_count: 5,
            name: 'Default Configuration',
            configuration_type: 'custom'
          });
        }
      } catch (error: any) {
        console.error('Error fetching axle configuration:', error);
        setError(error.message);
        
        // Default to 5 axles if there's an error
        setAxleConfiguration({
          axle_count: 5,
          name: 'Default Configuration',
          configuration_type: 'custom'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAxleConfiguration();
  }, [supabase, vehicleId]);

  const handleAxleWeightCaptured = (weight: number) => {
    // Determine axle type based on position
    let axleType = 'unknown';
    
    if (currentAxle === 1) {
      axleType = 'steering';
    } else if (currentAxle === 2 || currentAxle === 3) {
      axleType = 'drive';
    } else {
      axleType = 'trailer';
    }
    
    // Add the captured weight
    const newAxleWeight = {
      axleNumber: currentAxle,
      weight,
      axleType
    };
    
    // Update axle weights
    setAxleWeights(prev => {
      // Check if this axle already exists
      const existingIndex = prev.findIndex(a => a.axleNumber === currentAxle);
      
      if (existingIndex >= 0) {
        // Replace existing axle weight
        const newWeights = [...prev];
        newWeights[existingIndex] = newAxleWeight;
        return newWeights;
      } else {
        // Add new axle weight
        return [...prev, newAxleWeight];
      }
    });
    
    // Move to next axle if not at the end
    if (axleConfiguration && currentAxle < axleConfiguration.axle_count) {
      setCurrentAxle(currentAxle + 1);
    } else {
      // All axles captured
      setCompleted(true);
    }
  };

  const handleComplete = () => {
    onAxleWeightsCaptured(axleWeights);
  };

  const handleReset = () => {
    setAxleWeights([]);
    setCurrentAxle(1);
    setCompleted(false);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
        <div className="flex items-center mb-4">
          <div className="bg-gray-200 dark:bg-gray-700 h-8 w-8 rounded-full mr-2"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        </div>
        <div className="space-y-3">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="text-red-500 dark:text-red-400 flex items-center mb-4">
          <XCircleIcon className="h-6 w-6 mr-2" />
          <h2 className="text-xl font-semibold">Error Loading Axle Configuration</h2>
        </div>
        <p className="text-gray-700 dark:text-gray-300">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <TruckIcon className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-2" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Axle-by-Axle Weight Capture</h2>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Configuration: {axleConfiguration?.name || 'Default'} ({axleConfiguration?.axle_count || 5} axles)
        </div>
      </div>
      
      {/* Axle progress indicators */}
      <div className="flex justify-between mb-6 px-2">
        {Array.from({ length: axleConfiguration?.axle_count || 5 }).map((_, index) => {
          const axleNum = index + 1;
          const isCurrent = axleNum === currentAxle;
          const isCompleted = axleWeights.some(a => a.axleNumber === axleNum);
          
          return (
            <div 
              key={axleNum} 
              className={`flex flex-col items-center ${isCurrent ? 'scale-110' : ''}`}
            >
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : isCurrent 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 ring-2 ring-blue-500' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                {isCompleted ? (
                  <CheckCircleIcon className="h-6 w-6" />
                ) : (
                  <span className="font-bold">A{axleNum}</span>
                )}
              </div>
              <span className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                {isCompleted ? (
                  axleWeights.find(a => a.axleNumber === axleNum)?.weight.toLocaleString() + ' lbs'
                ) : (
                  `Axle ${axleNum}`
                )}
              </span>
            </div>
          );
        })}
      </div>
      
      {completed ? (
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg mb-6">
          <div className="flex items-center mb-4">
            <CheckCircleIcon className="h-8 w-8 text-green-500 dark:text-green-400 mr-3" />
            <h3 className="text-lg font-medium text-green-800 dark:text-green-200">All Axles Captured</h3>
          </div>
          
          <div className="space-y-3 mb-6">
            {axleWeights.map((axle) => (
              <div key={axle.axleNumber} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm">
                <div>
                  <span className="font-medium">Axle {axle.axleNumber}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">({axle.axleType})</span>
                </div>
                <span className="font-bold">{axle.weight.toLocaleString()} lbs</span>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={handleReset}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Reset
            </button>
            
            <button
              onClick={handleComplete}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              Complete
            </button>
          </div>
        </div>
      ) : (
        <WeightReader 
          scale={scale} 
          readingType="axle" 
          axleNumber={currentAxle}
          onWeightCaptured={handleAxleWeightCaptured}
          autoCapture={false}
        />
      )}
      
      {/* Axle navigation */}
      {!completed && (
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrentAxle(prev => Math.max(1, prev - 1))}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            disabled={currentAxle === 1}
          >
            <MinusCircleIcon className="h-4 w-4 mr-2" />
            Previous Axle
          </button>
          
          <button
            onClick={() => setCurrentAxle(prev => Math.min(axleConfiguration?.axle_count || 5, prev + 1))}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            disabled={currentAxle === (axleConfiguration?.axle_count || 5)}
          >
            Next Axle
            <PlusCircleIcon className="h-4 w-4 ml-2" />
          </button>
        </div>
      )}
    </div>
  );
}
