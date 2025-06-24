/**
 * Maintenance Management Component Tests
 * Testing maintenance dashboard, work orders, and scheduling components
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Mock Next.js router
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/maintenance',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock fetch for API calls
const fetchMock = jest.fn();

beforeEach(() => {
  global.fetch = fetchMock;
});

afterEach(() => {
  jest.restoreAllMocks();
});

// Import components to test
import MaintenancePage from '../app/(dashboard)/maintenance/page';

// Mock data
const mockWorkOrders = [
  {
    id: 1,
    title: 'Oil Change',
    status: 'pending',
    priority: 'medium',
    scheduled_date: '2025-01-25T10:00:00Z',
    vehicle: {
      id: 1,
      unit_number: 'T001',
      make: 'Freightliner',
      model: 'Cascadia',
    },
    vendor: {
      id: 1,
      name: 'ABC Service Center',
    },
    estimated_cost: 150.0,
  },
  {
    id: 2,
    title: 'Brake Inspection',
    status: 'in_progress',
    priority: 'high',
    scheduled_date: '2025-01-24T14:00:00Z',
    vehicle: {
      id: 2,
      unit_number: 'T002',
      make: 'Peterbilt',
      model: '579',
    },
    vendor: {
      id: 2,
      name: 'Quick Fix Garage',
    },
    estimated_cost: 450.0,
  },
];

const mockMaintenanceMetrics = {
  workOrders: {
    total: 25,
    byStatus: {
      pending: 8,
      in_progress: 5,
      completed: 10,
      cancelled: 2,
    },
  },
  costs: {
    total: 12500,
    average: 500,
  },
  scheduling: {
    upcoming: 6,
    overdue: 2,
    avgCompletionTime: 2.5,
  },
  inventory: {
    lowStockParts: 4,
  },
};

const mockUpcomingMaintenance = [
  {
    id: 1,
    maintenance_type: 'oil_change',
    next_due_date: '2025-01-28',
    vehicle: {
      unit_number: 'T001',
      current_mileage: 125000,
    },
  },
  {
    id: 2,
    maintenance_type: 'tire_rotation',
    next_due_date: '2025-01-30',
    vehicle: {
      unit_number: 'T003',
      current_mileage: 98000,
    },
  },
];

describe('Maintenance Management Tests', () => {
  beforeEach(() => {
    fetchMock.mockImplementation((url: string, options?: RequestInit) => {
      if (url.includes('/api/maintenance/work-orders')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              workOrders: mockWorkOrders,
              pagination: { page: 1, limit: 20, total: 2, pages: 1 },
            }),
        });
      }

      if (url.includes('/api/maintenance/metrics')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockMaintenanceMetrics),
        });
      }

      if (url.includes('/api/maintenance/schedules')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUpcomingMaintenance),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  });

  describe('Maintenance Dashboard', () => {
    it('should render maintenance dashboard with metrics', async () => {
      render(<MaintenancePage />);

      // Check for main heading
      expect(screen.getByText('Maintenance Management')).toBeInTheDocument();

      // Wait for metrics to load
      await waitFor(() => {
        expect(screen.getByText('25')).toBeInTheDocument(); // Total work orders
        expect(screen.getByText('$12,500')).toBeInTheDocument(); // Total costs
        expect(screen.getByText('6')).toBeInTheDocument(); // Upcoming maintenance
        expect(screen.getByText('4')).toBeInTheDocument(); // Low stock parts
      });
    });

    it('should display work orders in the overview tab', async () => {
      render(<MaintenancePage />);

      await waitFor(() => {
        expect(screen.getByText('Oil Change')).toBeInTheDocument();
        expect(screen.getByText('Brake Inspection')).toBeInTheDocument();
        expect(screen.getByText('T001')).toBeInTheDocument();
        expect(screen.getByText('T002')).toBeInTheDocument();
      });
    });

    it('should show work order status badges', async () => {
      render(<MaintenancePage />);

      await waitFor(() => {
        expect(screen.getByText('pending')).toBeInTheDocument();
        expect(screen.getByText('in_progress')).toBeInTheDocument();
      });
    });

    it('should display priority indicators', async () => {
      render(<MaintenancePage />);

      await waitFor(() => {
        expect(screen.getByText('medium')).toBeInTheDocument();
        expect(screen.getByText('high')).toBeInTheDocument();
      });
    });
  });

  describe('Work Orders Tab', () => {
    it('should switch to work orders tab', async () => {
      render(<MaintenancePage />);

      const workOrdersTab = screen.getByRole('tab', { name: /work orders/i });
      fireEvent.click(workOrdersTab);

      await waitFor(() => {
        expect(screen.getByText('Create Work Order')).toBeInTheDocument();
      });
    });

    it('should filter work orders by status', async () => {
      render(<MaintenancePage />);

      const workOrdersTab = screen.getByRole('tab', { name: /work orders/i });
      fireEvent.click(workOrdersTab);

      await waitFor(() => {
        const statusFilter = screen.getByDisplayValue('All Statuses');
        fireEvent.click(statusFilter);

        const pendingOption = screen.getByText('Pending');
        fireEvent.click(pendingOption);
      });

      // Should make API call with status filter
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('status=pending'),
        expect.any(Object)
      );
    });

    it('should filter work orders by priority', async () => {
      render(<MaintenancePage />);

      const workOrdersTab = screen.getByRole('tab', { name: /work orders/i });
      fireEvent.click(workOrdersTab);

      await waitFor(() => {
        const priorityFilter = screen.getByDisplayValue('All Priorities');
        fireEvent.click(priorityFilter);

        const highOption = screen.getByText('High');
        fireEvent.click(highOption);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('priority=high'),
        expect.any(Object)
      );
    });
  });

  describe('Scheduling Tab', () => {
    it('should display upcoming maintenance schedules', async () => {
      render(<MaintenancePage />);

      const schedulingTab = screen.getByRole('tab', { name: /scheduling/i });
      fireEvent.click(schedulingTab);

      await waitFor(() => {
        expect(screen.getByText('oil_change')).toBeInTheDocument();
        expect(screen.getByText('tire_rotation')).toBeInTheDocument();
        expect(screen.getByText('T001')).toBeInTheDocument();
        expect(screen.getByText('T003')).toBeInTheDocument();
      });
    });

    it('should show due dates for maintenance', async () => {
      render(<MaintenancePage />);

      const schedulingTab = screen.getByRole('tab', { name: /scheduling/i });
      fireEvent.click(schedulingTab);

      await waitFor(() => {
        expect(screen.getByText('2025-01-28')).toBeInTheDocument();
        expect(screen.getByText('2025-01-30')).toBeInTheDocument();
      });
    });
  });

  describe('Parts Inventory Tab', () => {
    it('should switch to parts inventory tab', async () => {
      render(<MaintenancePage />);

      const partsTab = screen.getByRole('tab', { name: /parts inventory/i });
      fireEvent.click(partsTab);

      await waitFor(() => {
        expect(screen.getByText('Add Part')).toBeInTheDocument();
      });
    });

    it('should show low stock alert', async () => {
      render(<MaintenancePage />);

      await waitFor(() => {
        expect(screen.getByText(/4 parts are running low on stock/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      fetchMock.mockRejectedValueOnce(new Error('API Error'));

      render(<MaintenancePage />);

      await waitFor(() => {
        expect(screen.getByText(/error loading maintenance data/i)).toBeInTheDocument();
      });
    });

    it('should show loading state', () => {
      fetchMock.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

      render(<MaintenancePage />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to create work order page', async () => {
      render(<MaintenancePage />);

      const createButton = screen.getByText('Create Work Order');
      fireEvent.click(createButton);

      expect(mockPush).toHaveBeenCalledWith('/maintenance/work-orders/new');
    });

    it('should navigate to work order details', async () => {
      render(<MaintenancePage />);

      await waitFor(() => {
        const viewButton = screen.getAllByText('View Details')[0];
        fireEvent.click(viewButton);
      });

      expect(mockPush).toHaveBeenCalledWith('/maintenance/work-orders/1');
    });
  });

  describe('Data Refresh', () => {
    it('should refresh data when refresh button is clicked', async () => {
      render(<MaintenancePage />);

      const refreshButton = screen.getByLabelText(/refresh/i);
      fireEvent.click(refreshButton);

      // Should make new API calls
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(6); // Initial + refresh calls
      });
    });
  });

  describe('Responsive Design', () => {
    it('should adapt to mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<MaintenancePage />);

      // Check that mobile-specific classes are applied
      const container = screen.getByTestId('maintenance-container');
      expect(container).toHaveClass('px-4'); // Mobile padding
    });
  });
});

// Integration test for work order creation flow
describe('Work Order Creation Integration', () => {
  it('should create a new work order successfully', async () => {
    fetchMock.mockImplementation((url: string, options?: RequestInit) => {
      if (options?.method === 'POST' && url.includes('/api/maintenance/work-orders')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              workOrder: {
                id: 3,
                title: 'New Work Order',
                status: 'pending',
              },
            }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });

    render(<MaintenancePage />);

    // Navigate to work orders tab
    const workOrdersTab = screen.getByRole('tab', { name: /work orders/i });
    fireEvent.click(workOrdersTab);

    // Click create work order button
    await waitFor(() => {
      const createButton = screen.getByText('Create Work Order');
      fireEvent.click(createButton);
    });

    expect(mockPush).toHaveBeenCalledWith('/maintenance/work-orders/new');
  });
});
