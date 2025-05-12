'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ErrorBoundary from '@/components/ErrorBoundary/index';
import Layout from '@/components/Layout/Layout';
import LogoCarousel from '@/components/LogoCarousel';

interface Testimonial {
  id: string;
  name: string;
  position: string;
  company: string;
  rating: number;
  review: string;
}

interface HomeClientProps {
  testimonials: Testimonial[] | null;
}

export default function HomeClient({ testimonials }: HomeClientProps) {
  return (
    <ErrorBoundary>
      <Layout>
        <main>
          {/* Hero Section */}
          <section className="relative bg-gradient-to-r from-primary-700 to-primary-500 text-white overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-20 left-20 w-40 h-40 rounded-full bg-white blur-3xl"></div>
              <div className="absolute bottom-20 right-20 w-60 h-60 rounded-full bg-white blur-3xl"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-white blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 py-20 relative z-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="md:w-1/2 space-y-6">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                    Streamline Your Trucking Operations
                  </h1>
                  <p className="text-xl md:text-2xl opacity-90">
                    Comprehensive weight management and load tracking for modern trucking companies
                  </p>
                  <div className="flex flex-wrap gap-4 pt-4">
                    <Link
                      href="/register"
                      className="px-8 py-3 bg-white text-primary-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
                    >
                      Get Started
                    </Link>
                    <Link
                      href="/login"
                      className="px-8 py-3 bg-transparent border-2 border-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
                    >
                      Sign In
                    </Link>
                  </div>
                </div>
                <div className="md:w-1/2 flex justify-center">
                  <div className="relative w-full max-w-xl">
                    <Image
                      src="/images/hero-banner.svg"
                      alt="Trucking Weight Management System"
                      width={800}
                      height={400}
                      className="drop-shadow-2xl"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120">
                <path
                  fill="#ffffff"
                  fillOpacity="1"
                  d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
                ></path>
              </svg>
            </div>
          </section>

          {/* Trucking Companies Logo Carousel */}
          <LogoCarousel
            type="trucking"
            title="Trusted by Leading Trucking Companies"
            subtitle="Join these industry leaders who rely on our platform for their weight management needs"
          />

          {/* Features Section */}
          <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Powerful Features for Your Fleet
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Our comprehensive solution helps you manage weights, track loads, and ensure
                  compliance with federal regulations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Feature 1 */}
                <div className="bg-gray-50 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-primary-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Weight Management</h3>
                  <p className="text-gray-600">
                    Track and manage vehicle weights to ensure compliance with state and federal
                    regulations.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="bg-gray-50 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-primary-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Load Tracking</h3>
                  <p className="text-gray-600">
                    Monitor your loads from origin to destination with real-time updates and status
                    tracking.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="bg-gray-50 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-primary-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Compliance Reporting</h3>
                  <p className="text-gray-600">
                    Generate compliance reports to ensure your fleet meets all regulatory
                    requirements.
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="bg-gray-50 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-primary-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Driver Management</h3>
                  <p className="text-gray-600">
                    Keep track of driver information, licenses, and certifications in one central
                    location.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Trusted by Trucking Companies
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  See what our customers have to say about our weight management system.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {!testimonials || testimonials.length === 0 ? (
                  // Fallback testimonials
                  <>
                    {/* Testimonial 1 */}
                    <div className="bg-white rounded-xl p-8 shadow-sm">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                          <span className="text-primary-700 font-bold text-xl">MT</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Michael Thompson</h4>
                          <p className="text-gray-500 text-sm">Fleet Manager, Thompson Logistics</p>
                        </div>
                      </div>
                      <p className="text-gray-600 italic">
                        "TruckingWeight has completely transformed our weight compliance process. The real-time monitoring has saved us thousands in potential fines and improved our efficiency by 30%."
                      </p>
                    </div>

                    {/* Testimonial 2 */}
                    <div className="bg-white rounded-xl p-8 shadow-sm">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                          <span className="text-primary-700 font-bold text-xl">SR</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Sarah Rodriguez</h4>
                          <p className="text-gray-500 text-sm">Operations Director, Express Freight Solutions</p>
                        </div>
                      </div>
                      <p className="text-gray-600 italic">
                        "The analytics dashboard gives us insights we never had before. We can now make data-driven decisions that have improved our load efficiency and reduced overweight incidents to nearly zero."
                      </p>
                    </div>

                    {/* Testimonial 3 */}
                    <div className="bg-white rounded-xl p-8 shadow-sm">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                          <span className="text-primary-700 font-bold text-xl">DC</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">David Chen</h4>
                          <p className="text-gray-500 text-sm">CEO, Pacific Northwest Transport</p>
                        </div>
                      </div>
                      <p className="text-gray-600 italic">
                        "Implementation was smooth and the support team was incredibly helpful. The system paid for itself within the first three months through avoided fines and improved route planning."
                      </p>
                    </div>
                  </>
                ) : (
                  // Render testimonials from the database
                  testimonials.map((testimonial) => {
                    // Get initials for the avatar
                    const initials = testimonial.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase();

                    return (
                      <div key={testimonial.id} className="bg-white rounded-xl p-8 shadow-sm">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                            <span className="text-primary-700 font-bold text-xl">{initials}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                            <p className="text-gray-500 text-sm">{testimonial.position}, {testimonial.company}</p>
                          </div>
                        </div>
                        <div className="flex items-center mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg
                              key={i}
                              className={`w-5 h-5 ${
                                i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <p className="text-gray-600 italic">"{testimonial.review}"</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          {/* Texas Cities Logo Carousel */}
          <LogoCarousel
            type="city"
            title="Serving Texas Municipalities"
            subtitle="Partnering with cities across Texas to ensure road safety and infrastructure protection"
          />

          {/* City Login Section */}
          <section className="py-20 bg-gray-100">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="md:w-1/2">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                    Texas Municipal Weighing System
                  </h2>
                  <p className="text-xl text-gray-600 mb-8">
                    A centralized platform for city employees across Texas to manage municipal weighing operations,
                    enforce compliance, and generate reports.
                  </p>
                  <div className="bg-white p-8 rounded-xl shadow-md">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-6">City Employee Login</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                          Select City
                        </label>
                        <select
                          id="city"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="">Select your city</option>
                          <option value="austin">Austin</option>
                          <option value="dallas">Dallas</option>
                          <option value="houston">Houston</option>
                          <option value="san-antonio">San Antonio</option>
                          <option value="fort-worth">Fort Worth</option>
                          <option value="el-paso">El Paso</option>
                          <option value="arlington">Arlington</option>
                          <option value="corpus-christi">Corpus Christi</option>
                          <option value="plano">Plano</option>
                          <option value="laredo">Laredo</option>
                          <option value="lubbock">Lubbock</option>
                          <option value="garland">Garland</option>
                          <option value="irving">Irving</option>
                          <option value="amarillo">Amarillo</option>
                          <option value="grand-prairie">Grand Prairie</option>
                          <option value="brownsville">Brownsville</option>
                          <option value="mckinney">McKinney</option>
                          <option value="frisco">Frisco</option>
                          <option value="waco">Waco</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                          placeholder="city.employee@cityname.gov"
                        />
                      </div>
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                          Password
                        </label>
                        <input
                          type="password"
                          id="password"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="pt-2">
                        <Link
                          href="/city-weighing"
                          className="w-full inline-flex justify-center items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          Sign In
                        </Link>
                      </div>
                      <div className="text-center text-sm text-gray-500">
                        <Link href="/city-register" className="text-primary-600 hover:text-primary-500">
                          Request City Access
                        </Link>
                        {' | '}
                        <Link href="/city-forgot-password" className="text-primary-600 hover:text-primary-500">
                          Forgot Password?
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="md:w-1/2">
                  <div className="relative">
                    <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary-100 rounded-lg z-0"></div>
                    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary-100 rounded-lg z-0"></div>
                    <div className="relative z-10 bg-white p-6 rounded-xl shadow-lg">
                      <Image
                        src="/images/texas-map.svg"
                        alt="Texas Municipal Network"
                        width={500}
                        height={400}
                        className="w-full h-auto"
                      />
                      <div className="mt-6 space-y-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Statewide Compliance</h4>
                            <p className="text-gray-600 text-sm">Unified weight enforcement across all Texas municipalities</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Centralized Reporting</h4>
                            <p className="text-gray-600 text-sm">Generate comprehensive reports for your municipality</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Permit Management</h4>
                            <p className="text-gray-600 text-sm">Issue and track overweight permits efficiently</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 bg-primary-700 text-white">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Optimize Your Trucking Operations?
              </h2>
              <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
                Join hundreds of trucking companies that have streamlined their operations with our
                weight management system.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/register"
                  className="px-8 py-3 bg-white text-primary-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Get Started Today
                </Link>
                <Link
                  href="/about"
                  className="px-8 py-3 bg-transparent border-2 border-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </section>
        </main>
      </Layout>
    </ErrorBoundary>
  );
}
