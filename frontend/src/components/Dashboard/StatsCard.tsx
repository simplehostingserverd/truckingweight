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


import { cn } from '@/lib/utils';

interface StatsCardProps {
  label: string;
  value: string;
  className?: string;
}

export default function StatsCard({ label, value, className }: StatsCardProps) {
  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-lg shadow-md p-6', className)}>
      <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">{label}</h3>
      <p className="text-3xl font-bold text-primary-600 dark:text-primary-400 mt-2">{value}</p>
    </div>
  );
}
