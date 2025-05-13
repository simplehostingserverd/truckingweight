'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useErrorHandler } from '@/utils/errorHandler';

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

export default function LogoCarousel({
  type = 'all',
  title = 'Trusted by Industry Leaders',
  subtitle = 'Join the growing network of companies and municipalities using our platform',
}: LogoCarouselProps) {
  const [logos, setLogos] = useState<Logo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();
  const { handleError } = useErrorHandler();

  useEffect(() => {
    const fetchLogos = async () => {
      try {
        setIsLoading(true);

        let query = supabase.from('company_logos').select('*');

        // Filter by type if specified
        if (type !== 'all') {
          query = query.eq('type', type);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        setLogos(data || []);
      } catch (error) {
        handleError(error, 'LogoCarousel');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogos();
  }, [supabase, type, handleError]);

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
                    className="max-h-16 md:max-h-20 w-auto object-contain"
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
                    className="max-h-16 md:max-h-20 w-auto object-contain"
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
