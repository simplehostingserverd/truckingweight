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

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import ErrorBoundary from '@/components/ErrorBoundary';

// Logo data
const TRUCKING_LOGOS = [
  { name: 'JB Hunt', logo: '/logos/jb-hunt.svg' },
  { name: 'Schneider', logo: '/logos/schneider.svg' },
  { name: 'Swift Transportation', logo: '/logos/swift.svg' },
  { name: 'Werner Enterprises', logo: '/logos/werner.svg' },
  { name: 'Knight-Swift', logo: '/logos/knight-swift.svg' },
  { name: 'XPO Logistics', logo: '/logos/xpo.svg' },
  { name: 'Old Dominion', logo: '/logos/old-dominion.svg' },
  { name: 'Yellow', logo: '/logos/yellow.svg' },
  { name: 'Estes Express', logo: '/logos/estes.svg' },
  { name: 'Saia', logo: '/logos/saia.svg' },
];

const CITY_LOGOS = [
  { name: 'Houston', logo: '/logos/cities/houston.svg' },
  { name: 'Dallas', logo: '/logos/cities/dallas.svg' },
  { name: 'San Antonio', logo: '/logos/cities/san-antonio.svg' },
  { name: 'Austin', logo: '/logos/cities/austin.svg' },
  { name: 'Fort Worth', logo: '/logos/cities/fort-worth.svg' },
  { name: 'El Paso', logo: '/logos/cities/el-paso.svg' },
  { name: 'Arlington', logo: '/logos/cities/arlington.svg' },
  { name: 'Corpus Christi', logo: '/logos/cities/corpus-christi.svg' },
  { name: 'Plano', logo: '/logos/cities/plano.svg' },
  { name: 'Lubbock', logo: '/logos/cities/lubbock.svg' },
];

// Placeholder image for missing logos
const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTkiPkxvZ288L3RleHQ+PC9zdmc+';

interface LogoCarouselProps {
  type: 'trucking' | 'city';
  title: string;
  subtitle: string;
}

const LogoCarousel: React.FC<LogoCarouselProps> = ({ type, title, subtitle }) => {
  const [logos, setLogos] = useState<{ name: string; logo: string }[]>([]);
  const [duplicatedLogos, setDuplicatedLogos] = useState<{ name: string; logo: string }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Set logos based on type
  useEffect(() => {
    const logoSet = type === 'trucking' ? TRUCKING_LOGOS : CITY_LOGOS;
    setLogos(logoSet);

    // Duplicate logos for infinite scroll effect
    setDuplicatedLogos([...logoSet, ...logoSet]);
  }, [type]);

  // Get container width for animation
  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.scrollWidth / 2);
      }
    };

    // Initial measurement
    updateContainerWidth();

    // Add resize listener
    window.addEventListener('resize', updateContainerWidth);

    // Cleanup
    return () => window.removeEventListener('resize', updateContainerWidth);
  }, []);

  return (
    <ErrorBoundary>
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">{subtitle}</p>
          </div>

          <div className="overflow-hidden">
            <div ref={containerRef} className="relative">
              {containerWidth > 0 && (
                <motion.div
                  className="flex items-center"
                  animate={{
                    x: [-containerWidth, 0],
                  }}
                  transition={{
                    x: {
                      repeat: Infinity,
                      repeatType: 'loop',
                      duration: 30,
                      ease: 'linear',
                    },
                  }}
                >
                  {duplicatedLogos.map((logo, index) => (
                    <div
                      key={`${logo.name}-${index}`}
                      className="flex-shrink-0 mx-8 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm flex items-center justify-center h-24 w-40"
                    >
                      <div className="relative h-16 w-32">
                        <Image
                          src={logo.logo}
                          alt={logo.name}
                          fill
                          sizes="128px"
                          loading="lazy"
                          className="object-contain"
                          onError={e => {
                            // Fallback to placeholder if image fails to load
                            (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>
    </ErrorBoundary>
  );
};

export default LogoCarousel;
