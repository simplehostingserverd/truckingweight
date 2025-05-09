import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  TruckIcon, 
  PencilIcon, 
  ArrowLeftIcon,
  ScaleIcon,
  CalendarIcon,
  IdentificationIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { formatDate } from '@/lib/utils';

export default async function VehicleDetail({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  const { id } = params;
  
  // Get user data
  const { data: { user } } = await supabase.auth.getUser();
  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user?.id)
    .single();
  
  // Get vehicle data
  const { data: vehicle, error } = await supabase
    .from('vehicles')
    .select(`
      *,
      weights:weights(
        id,
        weight,
        date,
        time,
        status
      ),
      loads:loads(
        id,
        description,
        origin,
        destination,
        status
      )
    `)
    .eq('id', id)
    .eq('company_id', userData?.company_id)
    .single();
  
  if (error || !vehicle) {
    console.error('Error fetching vehicle:', error);
    notFound();
  }
  
  // Get recent weights
  const recentWeights = vehicle.weights?.slice(0, 5) || [];
  
  // Get active loads
  const activeLoads = vehicle.loads?.filter(load => load.status === 'In Transit' || load.status === 'Pending') || [];
  
  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Maintenance':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'Out of Service':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };
  
  // Get weight status badge color
  const getWeightStatusBadgeColor = (status: string) => {
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
  
  // Get load status badge color
  const getLoadStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'In Transit':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="flex items-center">
          <Link
            href="/vehicles"
            className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{vehicle.name}</h1>
          <span className={`ml-4 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(vehicle.status)}`}>
            {vehicle.status}
          </span>
        </div>
        
        <Link
          href={`/vehicles/${id}/edit`}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PencilIcon className="h-4 w-4 mr-2" />
          Edit Vehicle
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicle Details */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-primary-700 text-white">
              <h2 className="text-xl font-semibold">Vehicle Details</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <TruckIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</h3>
                    <p className="text-base font-medium text-gray-900 dark:text-white">{vehicle.type}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <IdentificationIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">License Plate</h3>
                    <p className="text-base font-medium text-gray-900 dark:text-white">{vehicle.license_plate}</p>
                  </div>
                </div>
                
                {vehicle.vin && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <IdentificationIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">VIN</h3>
                      <p className="text-base font-medium text-gray-900 dark:text-white">{vehicle.vin}</p>
                    </div>
                  </div>
                )}
                
                {(vehicle.make || vehicle.model) && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <BuildingOfficeIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Make/Model</h3>
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        {vehicle.make} {vehicle.model}
                      </p>
                    </div>
                  </div>
                )}
                
                {vehicle.year && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <CalendarIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Year</h3>
                      <p className="text-base font-medium text-gray-900 dark:text-white">{vehicle.year}</p>
                    </div>
                  </div>
                )}
                
                {vehicle.max_weight && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <ScaleIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Maximum Weight</h3>
                      <p className="text-base font-medium text-gray-900 dark:text-white">{vehicle.max_weight}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Recent Weights */}
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-primary-700 text-white">
              <h2 className="text-xl font-semibold">Recent Weight Records</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Weight
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {recentWeights.length > 0 ? (
                    recentWeights.map((weight) => (
                      <tr key={weight.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(weight.date)} {weight.time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {weight.weight} lbs
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getWeightStatusBadgeColor(weight.status)}`}>
                            {weight.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <Link href={`/weights/${weight.id}`} className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        No weight records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900">
              <Link
                href="/weights/new"
                className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
              >
                Add new weight record →
              </Link>
            </div>
          </div>
        </div>
        
        {/* Active Loads */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-primary-700 text-white">
              <h2 className="text-xl font-semibold">Active Loads</h2>
            </div>
            <div className="p-6">
              {activeLoads.length > 0 ? (
                <div className="space-y-4">
                  {activeLoads.map((load) => (
                    <div key={load.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{load.description}</h3>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getLoadStatusBadgeColor(load.status)}`}>
                          {load.status}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <p>From: {load.origin}</p>
                        <p>To: {load.destination}</p>
                      </div>
                      <div className="mt-3">
                        <Link
                          href={`/loads/${load.id}`}
                          className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
                        >
                          View details →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 dark:text-gray-400">No active loads</p>
                  <Link
                    href="/loads/create"
                    className="mt-2 inline-block text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                  >
                    Create new load →
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-primary-700 text-white">
              <h2 className="text-xl font-semibold">Quick Actions</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <Link
                  href="/weights/new"
                  className="block w-full text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Add Weight Record
                </Link>
                <Link
                  href="/loads/create"
                  className="block w-full text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Create Load
                </Link>
                <Link
                  href={`/vehicles/${id}/edit`}
                  className="block w-full text-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Edit Vehicle
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
