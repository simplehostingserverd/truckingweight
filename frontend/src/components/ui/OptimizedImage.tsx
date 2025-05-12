'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * OptimizedImage component with lazy loading, blur-up effect, and error handling
 * This component extends Next.js Image with additional optimizations
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  fill = false,
  sizes,
  quality = 75,
  loading = 'lazy',
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  // Default blur data URL for placeholder
  const defaultBlurDataURL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PC9zdmc+';

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (!imageRef.current || priority) {
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        rootMargin: '200px', // Load images 200px before they come into view
        threshold: 0.1,
      }
    );

    observer.observe(imageRef.current);

    return () => {
      if (imageRef.current) {
        observer.unobserve(imageRef.current);
      }
    };
  }, [priority]);

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  // Handle image error
  const handleError = () => {
    setHasError(true);
    if (onError) onError();
  };

  // Fallback image for errors
  const fallbackImage = '/images/image-placeholder.svg';

  return (
    <div
      ref={imageRef}
      className={cn(
        'relative overflow-hidden',
        !isLoaded && 'bg-gray-200 animate-pulse',
        className
      )}
      style={{
        width: fill ? '100%' : width,
        height: fill ? '100%' : height,
      }}
    >
      {(isIntersecting || priority) && (
        <Image
          src={hasError ? fallbackImage : src}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          priority={priority}
          placeholder={placeholder}
          blurDataURL={blurDataURL || defaultBlurDataURL}
          fill={fill}
          sizes={sizes}
          quality={quality}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}
    </div>
  );
}

interface OptimizedBackgroundImageProps {
  src: string;
  className?: string;
  children?: React.ReactNode;
  priority?: boolean;
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * OptimizedBackgroundImage component for background images with optimizations
 */
export function OptimizedBackgroundImage({
  src,
  className,
  children,
  priority = false,
  quality = 75,
  onLoad,
  onError,
  ...props
}: OptimizedBackgroundImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (!containerRef.current || priority) {
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        rootMargin: '200px',
        threshold: 0.1,
      }
    );

    observer.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [priority]);

  // Load image when in viewport
  useEffect(() => {
    if (!isIntersecting) return;

    const img = new Image();
    img.src = src;
    img.onload = () => {
      setIsLoaded(true);
      if (onLoad) onLoad();
    };
    img.onerror = () => {
      setHasError(true);
      if (onError) onError();
    };
  }, [isIntersecting, src, onLoad, onError]);

  // Fallback image for errors
  const fallbackImage = '/images/image-placeholder.svg';

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative',
        !isLoaded && 'bg-gray-200 animate-pulse',
        className
      )}
      style={{
        backgroundImage: isLoaded ? `url(${hasError ? fallbackImage : src})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      {...props}
    >
      {children}
    </div>
  );
}

interface OptimizedAvatarProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * OptimizedAvatar component for user avatars with optimizations
 */
export function OptimizedAvatar({
  src,
  alt,
  size = 40,
  className,
  fallback,
  onLoad,
  onError,
  ...props
}: OptimizedAvatarProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  // Handle image error
  const handleError = () => {
    setHasError(true);
    if (onError) onError();
  };

  // Generate initials for fallback
  const initials = alt
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  // Fallback image or initials
  const fallbackSrc = fallback || '/images/avatar-placeholder.svg';

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-full bg-gray-200',
        className
      )}
      style={{ width: size, height: size }}
      {...props}
    >
      {hasError ? (
        fallback ? (
          <Image
            src={fallbackSrc}
            alt={alt}
            width={size}
            height={size}
            className="object-cover"
          />
        ) : (
          <div
            className="flex items-center justify-center w-full h-full bg-primary-500 text-white font-medium"
            style={{ fontSize: size / 2.5 }}
          >
            {initials}
          </div>
        )
      ) : (
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          className={cn(
            'object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
}
