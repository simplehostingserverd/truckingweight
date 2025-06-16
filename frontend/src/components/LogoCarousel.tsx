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
import { useErrorHandler } from '@/utils/errorHandler';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface Logo {
  id: number;
  name: string;
  logo_url: string;
  website: string;
  type: string;
}

interface LogoCarouselProps {
  type?: 'trucking' | 'city' | 'all';
  title?: string;
  subtitle?: string;
}

// Fallback logos for when Supabase fetch fails
const FALLBACK_TRUCKING_LOGOS: Logo[] = [
  {
    id: 1,
    name: 'JB Hunt',
    logo_url: '/logos/jb-hunt.svg',
    website: 'https://www.jbhunt.com',
    type: 'trucking',
  },
  {
    id: 2,
    name: 'Schneider',
    logo_url: '/logos/schneider.svg',
    website: 'https://schneider.com',
    type: 'trucking',
  },
  {
    id: 3,
    name: 'Swift Transportation',
    logo_url: '/logos/swift.svg',
    website: 'https://www.swifttrans.com',
    type: 'trucking',
  },
  {
    id: 4,
    name: 'Werner Enterprises',
    logo_url: '/logos/werner.svg',
    website: 'https://www.werner.com',
    type: 'trucking',
  },
  {
    id: 5,
    name: 'Knight-Swift',
    logo_url: '/logos/knight-swift.svg',
    website: 'https://www.knightswift.com',
    type: 'trucking',
  },
];

const FALLBACK_CITY_LOGOS: Logo[] = [
  {
    id: 6,
    name: 'Houston',
    logo_url: '/logos/cities/houston.svg',
    website: 'https://www.houstontx.gov',
    type: 'city',
  },
  {
    id: 7,
    name: 'Dallas',
    logo_url: '/logos/cities/dallas.svg',
    website: 'https://www.dallascityhall.com',
    type: 'city',
  },
  {
    id: 8,
    name: 'San Antonio',
    logo_url: '/logos/cities/san-antonio.svg',
    website: 'https://www.sanantonio.gov',
    type: 'city',
  },
  {
    id: 9,
    name: 'Austin',
    logo_url: '/logos/cities/austin.svg',
    website: 'https://www.austintexas.gov',
    type: 'city',
  },
  {
    id: 10,
    name: 'Fort Worth',
    logo_url: '/logos/cities/fort-worth.svg',
    website: 'https://www.fortworthtexas.gov',
    type: 'city',
  },
];

// Placeholder image for missing logos
const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTkiPkxvZ288L3RleHQ+PC9zdmc+';

export default function LogoCarousel({
  type = 'all',
  title = 'Trusted by Industry Leaders',
  subtitle = 'Join the growing network of companies and municipalities using our platform',
}: LogoCarouselProps) {
  const [logos, setLogos] = useState<Logo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { handleError } = useErrorHandler();

  // Set logos based on type only once during component mount
  // This prevents the maximum update depth exceeded error
  useEffect(() => {
    setIsLoading(true);

    try {
      // Always use fallback logos to prevent CORS issues
      // This is a temporary solution until the Supabase CORS issue is fully resolved
      if (type === 'trucking') {
        setLogos(FALLBACK_TRUCKING_LOGOS);
      } else if (type === 'city') {
        setLogos(FALLBACK_CITY_LOGOS);
      } else {
        // For 'all' type, combine both sets
        setLogos([...FALLBACK_TRUCKING_LOGOS, ...FALLBACK_CITY_LOGOS]);
      }
    } catch (error) {
      console.error('Error in LogoCarousel:', error);
      // Don't call handleError here to avoid potential re-renders
    } finally {
      setIsLoading(false);
    }

    // Only run this effect once when the component mounts
  }, [type]);

  if (isLoading) {
    return (
      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
            <p className="text-gray-600 mt-2">{subtitle}</p>
          </div>
          <div className="flex justify-center items-center h-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </div>
    );
  }

  if (logos.length === 0) {
    return null;
  }

  return (
    <div className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-600 mt-2">{subtitle}</p>
        </div>

        {/* Logo carousel */}
        <div className="relative overflow-hidden">
          <div className="flex animate-carousel">
            {/* First set of logos */}
            {logos.map(logo => (
              <div
                key={`first-${logo.id}`}
                className="flex-shrink-0 flex items-center justify-center mx-8 w-32 h-20 md:w-40 md:h-24"
              >
                <a
                  href={logo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  <Image
                    src={logo.logo_url}
                    alt={logo.name}
                    width={160}
                    height={80}
                    loading="lazy"
                    className="max-h-16 md:max-h-20 w-auto object-contain"
                    onError={e => {
                      // Fallback to placeholder if image fails to load
                      (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                      // Prevent infinite error loops
                      (e.target as HTMLImageElement).onerror = null;
                    }}
                  />
                </a>
              </div>
            ))}

            {/* Duplicate logos for seamless looping */}
            {logos.map(logo => (
              <div
                key={`second-${logo.id}`}
                className="flex-shrink-0 flex items-center justify-center mx-8 w-32 h-20 md:w-40 md:h-24"
              >
                <a
                  href={logo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  <Image
                    src={logo.logo_url}
                    alt={logo.name}
                    width={160}
                    height={80}
                    loading="lazy"
                    className="max-h-16 md:max-h-20 w-auto object-contain"
                    onError={e => {
                      // Fallback to placeholder if image fails to load
                      (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                      // Prevent infinite error loops
                      (e.target as HTMLImageElement).onerror = null;
                    }}
                  />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
