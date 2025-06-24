'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function TestFixesPage() {
  const [testResults, setTestResults] = useState<{
    signatures: string;
    users: string;
    mapbox: string;
    images: string;
  }>({
    signatures: 'Testing...',
    users: 'Testing...',
    mapbox: 'Testing...',
    images: 'Testing...',
  });

  useEffect(() => {
    const runTests = async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const supabase = createClient();

      // Test 1: Signatures table access
      try {
        const { data, error } = await supabase.from('signatures').select('*').limit(5);
        if (error) {
          setTestResults(prev => ({ ...prev, signatures: `❌ Error: ${error.message}` }));
        } else {
          setTestResults(prev => ({ ...prev, signatures: `✅ Success: Found ${data?.length || 0} signatures` }));
        }
      } catch (err) {
        setTestResults(prev => ({ ...prev, signatures: `❌ Exception: ${err}` }));
      }

      // Test 2: Users table access
      try {
        const { data, error } = await supabase.from('users').select('company_id').limit(1);
        if (error) {
          setTestResults(prev => ({ ...prev, users: `❌ Error: ${error.message}` }));
        } else {
          setTestResults(prev => ({ ...prev, users: `✅ Success: Users table accessible` }));
        }
      } catch (err) {
        setTestResults(prev => ({ ...prev, users: `❌ Exception: ${err}` }));
      }

      // Test 3: Mapbox API access (just check if we can construct URL)
      try {
        const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        if (mapboxToken) {
          setTestResults(prev => ({ ...prev, mapbox: `✅ Success: Mapbox token available` }));
        } else {
          setTestResults(prev => ({ ...prev, mapbox: `❌ Error: No Mapbox token` }));
        }
      } catch (err) {
        setTestResults(prev => ({ ...prev, mapbox: `❌ Exception: ${err}` }));
      }

      // Test 4: Image loading (placeholder URLs)
      try {
        const img = new Image();
        img.onload = () => {
          setTestResults(prev => ({ ...prev, images: `✅ Success: Placeholder images load` }));
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        img.onerror = () => {
          setTestResults(prev => ({ ...prev, images: `❌ Error: Placeholder images blocked` }));
        };
        img.src = 'https://via.placeholder.com/100x50/4A90E2/FFFFFF?text=Test';
      } catch (err) {
        setTestResults(prev => ({ ...prev, images: `❌ Exception: ${err}` }));
      }
    };

    runTests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Console Error Fixes Test</h1>
        
        <div className="grid gap-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
                <span className="font-medium">Signatures Table Access:</span>
                <span className="text-sm">{testResults.signatures}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
                <span className="font-medium">Users Table Access:</span>
                <span className="text-sm">{testResults.users}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
                <span className="font-medium">Mapbox Configuration:</span>
                <span className="text-sm">{testResults.mapbox}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
                <span className="font-medium">Image Loading (CSP):</span>
                <span className="text-sm">{testResults.images}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Sample Signature Images</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <img 
                  src="https://via.placeholder.com/200x100/4A90E2/FFFFFF?text=John+Smith"
                  alt="John Smith Signature"
                  className="mx-auto mb-2 border border-gray-600 rounded"
                />
                <p className="text-sm text-gray-400">John Smith</p>
              </div>
              <div className="text-center">
                <img 
                  src="https://via.placeholder.com/200x100/50C878/FFFFFF?text=Jane+Doe"
                  alt="Jane Doe Signature"
                  className="mx-auto mb-2 border border-gray-600 rounded"
                />
                <p className="text-sm text-gray-400">Jane Doe</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Console Check</h2>
            <p className="text-gray-300 mb-4">
              Open your browser's developer console (F12) and check for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>❌ No more "Refused to load" CSP errors</li>
              <li>❌ No more 406 errors from Supabase API calls</li>
              <li>❌ No more 404 errors for signatures endpoint</li>
              <li>❌ No more example.com image loading errors</li>
              <li>✅ Mapbox API calls should work (if token is valid)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
