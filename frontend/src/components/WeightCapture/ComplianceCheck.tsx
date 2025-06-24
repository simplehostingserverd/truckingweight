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

import React from 'react';
import { createClient } from '@/utils/supabase/client';
import { AxleWeight, ComplianceIssue, WeighTicket } from '@/types/scale-master';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface ComplianceCheckProps {
  ticketId: number;
}

export default function ComplianceCheck({ ticketId }: ComplianceCheckProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const supabase = createClient();
  const [ticket, setTicket] = useState<WeighTicket | null>(null);
  const [axleWeights, setAxleWeights] = useState<AxleWeight[]>([]);
  const [complianceIssues, setComplianceIssues] = useState<ComplianceIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load ticket and compliance data
  useEffect(() => {
    const fetchData = async () => {
      // Don't attempt to fetch if ticketId is invalid
      if (!ticketId || isNaN(Number(ticketId))) {
        setError('Invalid ticket ID provided');
        setIsLoading(false);
        return;
      }

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

        if (!ticketData) {
          throw new Error('Ticket not found');
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
        // Reset state on error
        setTicket(null);
        setAxleWeights([]);
        setComplianceIssues([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [supabase, ticketId]);

  // Generate compliance issues based on axle weights
  const generateComplianceIssues = async (ticket: WeighTicket, axleWeights: AxleWeight[]) => {
    try {
      // Validate inputs
      if (!ticket || !axleWeights || axleWeights.length === 0) {
        console.warn('Invalid inputs for compliance issue generation');
        return;
      }

      const issues: Omit<ComplianceIssue, 'id' | 'created_at'>[] = [];

      // Check for overweight axles
      const overweightAxles = axleWeights.filter(
        aw => aw.weight && aw.max_legal_weight && aw.weight > aw.max_legal_weight
      );

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
        // Ensure max_gross_weight is a valid number
        const maxGrossWeight = parseInt(String(ticket.vehicle.max_gross_weight));

        if (!isNaN(maxGrossWeight) && ticket.gross_weight > maxGrossWeight) {
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

        if (savedIssues) {
          setComplianceIssues(savedIssues);
        }
      }
    } catch (error) {
      console.error('Error generating compliance issues:', error);
      setError(
        `Error generating compliance issues: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
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

  // Get the status icon with proper accessibility attributes
  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'Compliant':
        return (
          <CheckCircleIcon
            className="h-6 w-6 text-green-500 dark:text-green-400"
            aria-hidden="true"
          />
        );
      case 'Warning':
        return (
          <ExclamationTriangleIcon
            className="h-6 w-6 text-amber-500 dark:text-amber-400"
            aria-hidden="true"
          />
        );
      case 'Non-Compliant':
        return (
          <ExclamationCircleIcon
            className="h-6 w-6 text-red-500 dark:text-red-400"
            aria-hidden="true"
          />
        );
      default:
        return (
          <InformationCircleIcon
            className="h-6 w-6 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
          />
        );
    }
  };

  // Render the component with a consistent outer container
  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
      role="region"
      aria-labelledby="compliance-check-heading"
    >
      <h2
        id="compliance-check-heading"
        className="text-xl font-semibold text-gray-800 dark:text-white mb-4"
      >
        Compliance Check
      </h2>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center h-40" role="status" aria-live="polite">
          <div
            className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"
            aria-hidden="true"
          ></div>
          <span className="sr-only">Loading compliance data...</span>
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div
          className="p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-md"
          role="alert"
          aria-live="assertive"
        >
          <ExclamationCircleIcon className="h-6 w-6 inline mr-2" aria-hidden="true" />
          {error}
        </div>
      )}

      {/* Content when data is loaded successfully */}
      {!isLoading && !error && ticket && (
        <div className="space-y-6">
          {/* Overall Compliance Status */}
          <div
            className="flex items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
            role="status"
            aria-labelledby="overall-status-heading"
          >
            {getStatusIcon(ticket.compliance_status)}
            <div className="ml-4">
              <h3
                id="overall-status-heading"
                className="text-lg font-medium text-gray-900 dark:text-white"
              >
                Overall Status
              </h3>
              <div className="mt-1">
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(ticket.compliance_status)}`}
                  aria-label={`Compliance status: ${ticket.compliance_status || 'Unknown'}`}
                >
                  {ticket.compliance_status || 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          {/* Axle Weights */}
          {axleWeights.length > 0 && (
            <div>
              <h3
                id="axle-weights-heading"
                className="text-lg font-medium text-gray-900 dark:text-white mb-2"
              >
                Axle Weights
              </h3>
              <div className="overflow-x-auto">
                <table
                  className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
                  aria-labelledby="axle-weights-heading"
                >
                  <caption className="sr-only">Axle weights and compliance status</caption>
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Axle
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Weight
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Max Legal
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
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
                            aria-label={`Axle ${axle.axle_position} status: ${axle.compliance_status}`}
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
              <h3
                id="compliance-issues-heading"
                className="text-lg font-medium text-gray-900 dark:text-white mb-2"
              >
                Compliance Issues
              </h3>
              <div className="space-y-4" role="list" aria-labelledby="compliance-issues-heading">
                {complianceIssues.map(issue => (
                  <div
                    key={issue.id}
                    className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                    role="listitem"
                  >
                    <div className="flex items-center mb-2">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityBadgeColor(issue.severity)}`}
                        aria-label={`Severity: ${issue.severity}`}
                      >
                        {issue.severity}
                      </span>
                      <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {issue.issue_type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{issue.description}</p>
                    {issue.recommendation && (
                      <div
                        className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-sm rounded"
                        aria-label="Recommendation"
                      >
                        <strong>Recommendation:</strong> {issue.recommendation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : ticket.compliance_status === 'Compliant' ? (
            <div
              className="p-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-lg flex items-center"
              role="status"
              aria-live="polite"
            >
              <CheckCircleIcon className="h-6 w-6 mr-2" aria-hidden="true" />
              <span>This weight record is compliant with all regulations.</span>
            </div>
          ) : (
            <div
              className="p-4 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-300 rounded-lg"
              role="status"
              aria-live="polite"
            >
              <InformationCircleIcon className="h-6 w-6 inline mr-2" aria-hidden="true" />
              No specific compliance issues found.
            </div>
          )}
        </div>
      )}

      {/* No data state - when not loading, no error, but no ticket */}
      {!isLoading && !error && !ticket && (
        <div
          className="p-4 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-300 rounded-lg"
          role="status"
          aria-live="polite"
        >
          <InformationCircleIcon className="h-6 w-6 inline mr-2" aria-hidden="true" />
          No compliance data available for this ticket.
        </div>
      )}
    </div>
  );
}
