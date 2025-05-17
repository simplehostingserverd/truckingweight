/**
 * Copyright (c) 2025 Cosmo Exploit Group LLC. All Rights Reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This file is part of the Cosmo Exploit Group LLC Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * 
 * This file contains proprietary and confidential information of 
 * Cosmo Exploit Group LLC and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */


'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { WeighTicket, AxleWeight, ComplianceIssue } from '@/types/scale-master';

interface ComplianceCheckProps {
  ticketId: number;
}

export default function ComplianceCheck({ ticketId }: ComplianceCheckProps) {
  const supabase = createClientComponentClient();
  const [ticket, setTicket] = useState<WeighTicket | null>(null);
  const [axleWeights, setAxleWeights] = useState<AxleWeight[]>([]);
  const [complianceIssues, setComplianceIssues] = useState<ComplianceIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load ticket and compliance data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch the ticket with related data
        const { data: ticketData, error: ticketError } = await supabase
          .from('weigh_tickets')
          .select(
            `
            *,
            vehicle:vehicle_id(*),
            axle_weights(*),
            compliance_issues(*)
          `
          )
          .eq('id', ticketId)
          .single();

        if (ticketError) {
          throw new Error(`Failed to fetch ticket: ${ticketError.message}`);
        }

        setTicket(ticketData);
        setAxleWeights(ticketData.axle_weights || []);
        setComplianceIssues(ticketData.compliance_issues || []);

        // If there are no compliance issues but the ticket is non-compliant,
        // generate them automatically
        if (
          (!ticketData.compliance_issues || ticketData.compliance_issues.length === 0) &&
          ticketData.compliance_status === 'Non-Compliant' &&
          ticketData.axle_weights &&
          ticketData.axle_weights.length > 0
        ) {
          await generateComplianceIssues(ticketData, ticketData.axle_weights);
        }
      } catch (error) {
        console.error('Error fetching compliance data:', error);
        setError(
          `Failed to load compliance data: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [supabase, ticketId]);

  // Generate compliance issues based on axle weights
  const generateComplianceIssues = async (ticket: WeighTicket, axleWeights: AxleWeight[]) => {
    try {
      const issues: Omit<ComplianceIssue, 'id' | 'created_at'>[] = [];

      // Check for overweight axles
      const overweightAxles = axleWeights.filter(aw => aw.weight > aw.max_legal_weight);

      if (overweightAxles.length > 0) {
        // Add an issue for each overweight axle
        for (const axle of overweightAxles) {
          const overAmount = axle.weight - axle.max_legal_weight;
          const overPercent = Math.round((overAmount / axle.max_legal_weight) * 100);

          issues.push({
            weigh_ticket_id: ticketId,
            issue_type: 'Overweight Axle',
            description: `Axle ${axle.axle_position} is ${overAmount.toLocaleString()} lbs (${overPercent}%) over the legal limit of ${axle.max_legal_weight.toLocaleString()} lbs.`,
            severity: overPercent > 10 ? 'Critical' : overPercent > 5 ? 'High' : 'Medium',
            recommendation: `Redistribute weight to bring axle ${axle.axle_position} within legal limits.`,
          });
        }
      }

      // Check for gross weight issues
      if (ticket.gross_weight && ticket.vehicle?.max_gross_weight) {
        const maxGrossWeight = parseInt(ticket.vehicle.max_gross_weight);

        if (ticket.gross_weight > maxGrossWeight) {
          const overAmount = ticket.gross_weight - maxGrossWeight;
          const overPercent = Math.round((overAmount / maxGrossWeight) * 100);

          issues.push({
            weigh_ticket_id: ticketId,
            issue_type: 'Overweight Gross',
            description: `Gross weight is ${overAmount.toLocaleString()} lbs (${overPercent}%) over the legal limit of ${maxGrossWeight.toLocaleString()} lbs.`,
            severity: overPercent > 10 ? 'Critical' : overPercent > 5 ? 'High' : 'Medium',
            recommendation: 'Reduce the total load weight to comply with gross weight limits.',
          });
        }
      }

      // Add a general compliance issue if none were found but the ticket is non-compliant
      if (issues.length === 0 && ticket.compliance_status === 'Non-Compliant') {
        issues.push({
          weigh_ticket_id: ticketId,
          issue_type: 'General Compliance',
          description: 'This weight record has been marked as non-compliant.',
          severity: 'Medium',
          recommendation: 'Review weight distribution and ensure compliance with all regulations.',
        });
      }

      // Save the issues to the database
      if (issues.length > 0) {
        const { data: savedIssues, error } = await supabase
          .from('compliance_issues')
          .insert(issues)
          .select();

        if (error) {
          throw new Error(`Failed to save compliance issues: ${error.message}`);
        }

        setComplianceIssues(savedIssues);
      }
    } catch (error) {
      console.error('Error generating compliance issues:', error);
    }
  };

  // Get the status badge color
  const getStatusBadgeColor = (status: string | null) => {
    switch (status) {
      case 'Compliant':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Warning':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'Non-Compliant':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Get the severity badge color
  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'Low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Medium':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Get the status icon
  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'Compliant':
        return <CheckCircleIcon className="h-6 w-6 text-green-500 dark:text-green-400" />;
      case 'Warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-amber-500 dark:text-amber-400" />;
      case 'Non-Compliant':
        return <ExclamationCircleIcon className="h-6 w-6 text-red-500 dark:text-red-400" />;
      default:
        return <InformationCircleIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-md">
          <ExclamationCircleIcon className="h-6 w-6 inline mr-2" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Compliance Check</h2>

      {ticket && (
        <div className="space-y-6">
          {/* Overall Compliance Status */}
          <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            {getStatusIcon(ticket.compliance_status)}
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Overall Status</h3>
              <div className="mt-1">
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(ticket.compliance_status)}`}
                >
                  {ticket.compliance_status || 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          {/* Axle Weights */}
          {axleWeights.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Axle Weights
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Axle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Weight
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Max Legal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {axleWeights.map(axle => (
                      <tr key={axle.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          Axle {axle.axle_position}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {axle.weight.toLocaleString()} lbs
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {axle.max_legal_weight.toLocaleString()} lbs
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(axle.compliance_status)}`}
                          >
                            {axle.compliance_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Compliance Issues */}
          {complianceIssues.length > 0 ? (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Compliance Issues
              </h3>
              <div className="space-y-4">
                {complianceIssues.map(issue => (
                  <div key={issue.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityBadgeColor(issue.severity)}`}
                      >
                        {issue.severity}
                      </span>
                      <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {issue.issue_type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{issue.description}</p>
                    {issue.recommendation && (
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-sm rounded">
                        <strong>Recommendation:</strong> {issue.recommendation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : ticket.compliance_status === 'Compliant' ? (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-lg flex items-center">
              <CheckCircleIcon className="h-6 w-6 mr-2" />
              <span>This weight record is compliant with all regulations.</span>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-300 rounded-lg">
              <InformationCircleIcon className="h-6 w-6 inline mr-2" />
              No specific compliance issues found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
