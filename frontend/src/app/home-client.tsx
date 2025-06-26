"use client";

import React from 'react';
import Head from 'next/head';
import { ArrowRight, Truck, Weight, Zap } from 'lucide-react';
import LogoCarousel from '@/components/LogoCarousel';

const HomeClient = () => {
  return (
    <>
      <Head>
        <title>CargoScale Pro - Smart Truck Weighing & Management</title>
        <meta
          name="description"
          content="Revolutionizing the trucking industry with AI-powered weight management, automated tolling, and real-time compliance solutions. Boost efficiency and profitability with CargoScale Pro."
        />
        <meta name="keywords" content="truck weighing, logistics, fleet management, AI, compliance, tolling, transportation" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="https://cargoscalepro.com" />
        <meta property="og:title" content="CargoScale Pro - Smart Truck Weighing & Management" />
        <meta property="og:description" content="AI-powered solutions for modern trucking. Optimize loads, automate tolls, and ensure compliance effortlessly." />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:url" content="https://cargoscalepro.com" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <div className="min-h-screen bg-gray-900 text-white">
        <main className="isolate">
          {/* Hero Section */}
          <div className="relative pt-14">
            <div
              className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
              aria-hidden="true"
            >
              <div
                className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                style={{
                  clipPath:
                    'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                }}
              />
            </div>
            <div className="py-24 sm:py-32">
              <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                  <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                    The Future of Trucking is Here
                  </h1>
                  <p className="mt-6 text-lg leading-8 text-gray-300">
                    CargoScale Pro integrates AI-powered weight management, automated tolling, and real-time compliance to streamline your logistics operations. Drive smarter, not harder.
                  </p>
                  <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
                    <a
                      href="/city/login"
                      className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      City Login
                    </a>
                    <a
                      href="/login"
                      className="rounded-md bg-gray-700 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-700"
                    >
                      Trucking Dashboard Login
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <section id="features" className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl lg:text-center">
                <h2 className="text-base font-semibold leading-7 text-indigo-400">Everything You Need</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  A Unified Platform for Modern Logistics
                </p>
                <p className="mt-6 text-lg leading-8 text-gray-300">
                  From weigh station automation to predictive maintenance, our platform provides the tools you need to stay ahead of the curve.
                </p>
              </div>
              <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
                <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                  <div className="relative pl-16">
                    <dt className="text-base font-semibold leading-7 text-white">
                      <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                        <Weight className="h-6 w-6 text-white" aria-hidden="true" />
                      </div>
                      AI-Powered Weight Management
                    </dt>
                    <dd className="mt-2 text-base leading-7 text-gray-300">
                      Optimize load distribution in real-time to maximize capacity and avoid costly overweight fines. Our AI analyzes axle weights and suggests adjustments instantly.
                    </dd>
                  </div>
                  <div className="relative pl-16">
                    <dt className="text-base font-semibold leading-7 text-white">
                      <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                        <Truck className="h-6 w-6 text-white" aria-hidden="true" />
                      </div>
                      Automated Tolling & Compliance
                    </dt>
                    <dd className="mt-2 text-base leading-7 text-gray-300">
                      Seamlessly integrate with national tolling systems and automate IFTA reporting. Stay compliant with ELD and HOS regulations effortlessly.
                    </dd>
                  </div>
                  <div className="relative pl-16">
                    <dt className="text-base font-semibold leading-7 text-white">
                      <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                        <Zap className="h-6 w-6 text-white" aria-hidden="true" />
                      </div>
                      Predictive Maintenance
                    </dt>
                    <dd className="mt-2 text-base leading-7 text-gray-300">
                      Leverage telematics data to predict maintenance needs before they become critical issues, reducing downtime and extending vehicle lifespan.
                    </dd>
                  </div>
                   <div className="relative pl-16">
                    <dt className="text-base font-semibold leading-7 text-white">
                      <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                        <ArrowRight className="h-6 w-6 text-white" aria-hidden="true" />
                      </div>
                      Route & Dispatch Optimization
                    </dt>
                    <dd className="mt-2 text-base leading-7 text-gray-300">
                      Our smart routing algorithms consider traffic, weather, and weight restrictions to find the most efficient path for every haul.
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </section>

          {/* Key Features Section */}
          <section className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl lg:text-center">
                <h2 className="text-base font-semibold leading-7 text-indigo-400">Core Advantages</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Why Choose CargoScale Pro?
                </p>
                <p className="mt-6 text-lg leading-8 text-gray-300">
                  Our platform is built from the ground up to address the most critical challenges in the transportation industry, delivering tangible benefits to your bottom line.
                </p>
              </div>
              <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                <div className="group relative rounded-2xl bg-gray-800/50 p-8 transition-all duration-300 hover:bg-gray-800/80 ring-1 ring-white/10 hover:ring-indigo-400">
                  <div className="absolute -inset-px rounded-2xl opacity-0 transition-all duration-300 group-hover:opacity-100"
                       style={{background: 'radial-gradient(400px at 50% 50%, rgba(79, 70, 229, 0.15), transparent 80%)'}}></div>
                  <h3 className="text-lg font-semibold leading-7 text-white">Enhanced Efficiency</h3>
                  <p className="mt-4 text-base leading-7 text-gray-300">Automate manual processes, from weight verification to toll payments, freeing up your team to focus on core operations and strategic growth.</p>
                </div>
                <div className="group relative rounded-2xl bg-gray-800/50 p-8 transition-all duration-300 hover:bg-gray-800/80 ring-1 ring-white/10 hover:ring-indigo-400">
                  <div className="absolute -inset-px rounded-2xl opacity-0 transition-all duration-300 group-hover:opacity-100"
                       style={{background: 'radial-gradient(400px at 50% 50%, rgba(79, 70, 229, 0.15), transparent 80%)'}}></div>
                  <h3 className="text-lg font-semibold leading-7 text-white">Cost Reduction</h3>
                  <p className="mt-4 text-base leading-7 text-gray-300">Minimize overweight fines, reduce fuel consumption through optimized routing, and lower administrative overhead with our integrated platform.</p>
                </div>
                <div className="group relative rounded-2xl bg-gray-800/50 p-8 transition-all duration-300 hover:bg-gray-800/80 ring-1 ring-white/10 hover:ring-indigo-400">
                  <div className="absolute -inset-px rounded-2xl opacity-0 transition-all duration-300 group-hover:opacity-100"
                       style={{background: 'radial-gradient(400px at 50% 50%, rgba(79, 70, 229, 0.15), transparent 80%)'}}></div>
                  <h3 className="text-lg font-semibold leading-7 text-white">Data-Driven Insights</h3>
                  <p className="mt-4 text-base leading-7 text-gray-300">Gain a competitive edge with powerful analytics. Access real-time data on fleet performance, compliance metrics, and financial reporting to make informed decisions.</p>
                </div>
              </div>
            </div>
          </section>

        </main>

        {/* Footer */}
        <footer className="bg-gray-900 border-t border-gray-800">
          <div className="mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8">
            <nav className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12" aria-label="Footer">
              <div className="pb-6">
                <a href="#features" className="text-sm leading-6 text-gray-300 hover:text-white">Features</a>
              </div>
              <div className="pb-6">
                <a href="#" className="text-sm leading-6 text-gray-300 hover:text-white">Pricing</a>
              </div>
              <div className="pb-6">
                <a href="#" className="text-sm leading-6 text-gray-300 hover:text-white">Company</a>
              </div>
              <div className="pb-6">
                <a href="#" className="text-sm leading-6 text-gray-300 hover:text-white">Contact</a>
              </div>
            </nav>
            <p className="mt-10 text-center text-xs leading-5 text-gray-400">
              &copy; {new Date().getFullYear()} CargoScale Pro, Inc. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default HomeClient;
