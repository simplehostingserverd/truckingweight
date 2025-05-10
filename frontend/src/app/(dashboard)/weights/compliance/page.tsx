'use client';

import { useState } from 'react';
import Link from 'next/link';
import ComplianceChecker from '@/components/Weights/ComplianceChecker';
import { ComplianceResult } from '@/services/complianceService';
import { formatWeight } from '@/utils/formatters';

export default function WeightCompliancePage() {
  const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null);
  
  const handleComplianceChange = (result: ComplianceResult) => {
    setComplianceResult(result);
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Weight Compliance</h1>
          <p className="mt-1 text-sm text-gray-400">
            Check if your vehicle configuration complies with federal and state weight regulations.
          </p>
        </div>
        <div className="flex space-x-2">
          <Link
            href="/weights"
            className="inline-flex items-center px-4 py-2 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-200 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Weights
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ComplianceChecker onComplianceChange={handleComplianceChange} />
        </div>
        
        <div>
          <div className="bg-[#1A1A1A] rounded-lg shadow-lg overflow-hidden border border-gray-800 sticky top-4">
            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Compliance Summary</h2>
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
            </div>
            
            <div className="p-6">
              {complianceResult ? (
                <div className="space-y-6">
                  <div className={`p-4 rounded-lg ${complianceResult.isCompliant ? 'bg-green-900/20 border border-green-800' : 'bg-red-900/20 border border-red-800'}`}>
                    <h3 className={`text-lg font-medium ${complianceResult.isCompliant ? 'text-green-400' : 'text-red-400'}`}>
                      {complianceResult.isCompliant ? 'Compliant' : 'Non-Compliant'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-300">
                      {complianceResult.isCompliant 
                        ? 'Your vehicle configuration complies with all weight regulations.'
                        : `Your vehicle configuration has ${complianceResult.violations.length} weight violation(s).`
                      }
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">Maximum Allowed Weight</h3>
                      <p className="text-xl font-semibold text-white">{formatWeight(complianceResult.maxAllowedWeight)}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">Current Gross Weight</h3>
                      <p className={`text-xl font-semibold ${complianceResult.overWeight > 0 ? 'text-red-400' : 'text-white'}`}>
                        {formatWeight(complianceResult.violations.find(v => v.type === 'Gross Weight')?.actual || 0)}
                      </p>
                    </div>
                    
                    {complianceResult.overWeight > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-400">Overweight Amount</h3>
                        <p className="text-xl font-semibold text-red-400">{formatWeight(complianceResult.overWeight)}</p>
                      </div>
                    )}
                  </div>
                  
                  {!complianceResult.isCompliant && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-400">Violation Summary</h3>
                      <ul className="space-y-2">
                        {complianceResult.violations.map((violation, index) => (
                          <li key={index} className="text-sm text-gray-300 flex items-start">
                            <span className="inline-block w-3 h-3 rounded-full bg-red-500 mt-1 mr-2 flex-shrink-0"></span>
                            <span>
                              {violation.type}: {formatWeight(violation.overWeight)} over limit
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-gray-800">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Compliance Tips</h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-start">
                        <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mt-1 mr-2 flex-shrink-0"></span>
                        <span>Distribute weight evenly across axles</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mt-1 mr-2 flex-shrink-0"></span>
                        <span>Increase axle spacing to improve bridge formula compliance</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mt-1 mr-2 flex-shrink-0"></span>
                        <span>Consider adding axles for heavier loads</span>
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">
                    Use the compliance checker to see results
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <div className="bg-[#1A1A1A] rounded-lg shadow-lg overflow-hidden border border-gray-800">
          <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Weight Regulations Information</h2>
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Federal Weight Limits</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span className="text-gray-300">Single Axle:</span>
                    <span className="text-white font-medium">20,000 lbs</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-300">Tandem Axle:</span>
                    <span className="text-white font-medium">34,000 lbs</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-300">Tridem Axle:</span>
                    <span className="text-white font-medium">42,000 lbs</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-300">Gross Vehicle Weight:</span>
                    <span className="text-white font-medium">80,000 lbs</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Bridge Formula</h3>
                <p className="text-gray-300 mb-2">
                  The Bridge Formula establishes the maximum weight any set of axles on a motor vehicle may carry on the Interstate highway system.
                </p>
                <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                  <p className="text-white font-mono">W = 500(LN/(N-1) + 12N + 36)</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Where:<br />
                    W = maximum weight in pounds<br />
                    L = distance in feet between axles<br />
                    N = number of axles being considered
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium text-white mb-2">State Variations</h3>
              <p className="text-gray-300 mb-4">
                Weight limits can vary by state. Always check the specific regulations for the states you'll be traveling through.
              </p>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 bg-gray-800 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">State</th>
                      <th className="px-4 py-3 bg-gray-800 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Single Axle</th>
                      <th className="px-4 py-3 bg-gray-800 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tandem Axle</th>
                      <th className="px-4 py-3 bg-gray-800 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Gross Weight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    <tr>
                      <td className="px-4 py-3 text-sm text-white">California</td>
                      <td className="px-4 py-3 text-sm text-gray-300">20,000 lbs</td>
                      <td className="px-4 py-3 text-sm text-gray-300">34,000 lbs</td>
                      <td className="px-4 py-3 text-sm text-gray-300">80,000 lbs</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-white">Texas</td>
                      <td className="px-4 py-3 text-sm text-gray-300">20,000 lbs</td>
                      <td className="px-4 py-3 text-sm text-gray-300">34,000 lbs</td>
                      <td className="px-4 py-3 text-sm text-gray-300">80,000 lbs</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-white">New York</td>
                      <td className="px-4 py-3 text-sm text-gray-300">22,400 lbs</td>
                      <td className="px-4 py-3 text-sm text-gray-300">36,000 lbs</td>
                      <td className="px-4 py-3 text-sm text-gray-300">80,000 lbs</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-white">Florida</td>
                      <td className="px-4 py-3 text-sm text-gray-300">22,000 lbs</td>
                      <td className="px-4 py-3 text-sm text-gray-300">44,000 lbs</td>
                      <td className="px-4 py-3 text-sm text-gray-300">80,000 lbs</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
