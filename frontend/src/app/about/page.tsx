import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/Layout/Layout';

export const metadata = {
  title: 'About Us | TruckingSemis',
  description:
    'Learn about TruckingSemis, our mission, and how our weight management system helps trucking companies stay compliant and efficient.',
};

export default function AboutPage() {
  return (
    <Layout>
      <main>
        {/* Hero Section */}
        <section className="bg-primary-700 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">About TruckingSemis</h1>
              <p className="text-xl opacity-90 mb-8">
                Revolutionizing weight management and load tracking for the modern trucking industry
              </p>
              <div className="flex justify-center">
                <div className="w-24 h-1 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2">
                <Image
                  src="/icons/truck-icon.svg"
                  alt="TruckingSemis Mission"
                  width={400}
                  height={400}
                  className="rounded-lg shadow-lg"
                />
              </div>
              <div className="md:w-1/2">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                <p className="text-lg text-gray-700 mb-6">
                  At TruckingSemis, our mission is to provide trucking companies with the most
                  comprehensive and user-friendly weight management system on the market. We
                  understand the challenges faced by the trucking industry when it comes to
                  compliance with weight regulations and efficient load management.
                </p>
                <p className="text-lg text-gray-700 mb-6">
                  Founded by industry experts with over 20 years of experience in transportation
                  logistics, we've built a solution that addresses the real-world needs of trucking
                  companies of all sizes.
                </p>
                <p className="text-lg text-gray-700">
                  Our goal is to help you reduce compliance issues, optimize load distribution, and
                  ultimately increase your bottom line through more efficient operations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Features of Our System</h2>
              <p className="text-lg text-gray-700">
                Our comprehensive weight management system is designed to address all aspects of
                trucking operations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Feature 1 */}
              <div className="bg-white p-8 rounded-lg shadow-sm flex">
                <div className="mr-6">
                  <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Image
                      src="/icons/scale-icon.svg"
                      alt="Weight Management"
                      width={40}
                      height={40}
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Advanced Weight Tracking
                  </h3>
                  <p className="text-gray-700">
                    Our system allows you to track axle weights, gross vehicle weights, and load
                    distribution with precision. Ensure compliance with state and federal
                    regulations to avoid costly fines.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-8 rounded-lg shadow-sm flex">
                <div className="mr-6">
                  <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Image
                      src="/icons/load-icon.svg"
                      alt="Load Management"
                      width={40}
                      height={40}
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Comprehensive Load Management
                  </h3>
                  <p className="text-gray-700">
                    Manage your loads from pickup to delivery with real-time tracking and status
                    updates. Optimize routes and improve delivery times with our intelligent routing
                    suggestions.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-8 rounded-lg shadow-sm flex">
                <div className="mr-6">
                  <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Image
                      src="/icons/driver-icon.svg"
                      alt="Driver Management"
                      width={40}
                      height={40}
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Driver Management</h3>
                  <p className="text-gray-700">
                    Keep track of driver information, licenses, certifications, and performance
                    metrics. Ensure your drivers are compliant with regulations and operating at
                    peak efficiency.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="bg-white p-8 rounded-lg shadow-sm flex">
                <div className="mr-6">
                  <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Image
                      src="/icons/vehicle-icon.svg"
                      alt="Vehicle Management"
                      width={40}
                      height={40}
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Vehicle Fleet Management
                  </h3>
                  <p className="text-gray-700">
                    Maintain detailed records of your vehicles, including maintenance schedules,
                    inspection dates, and performance metrics. Maximize uptime and minimize
                    maintenance costs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
                Frequently Asked Questions
              </h2>

              <div className="space-y-8">
                {/* FAQ Item 1 */}
                <div className="border-b border-gray-200 pb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    How does the weight management system work?
                  </h3>
                  <p className="text-gray-700">
                    Our system integrates with your existing scales or can work with manual weight
                    entries. It tracks all weight data, compares it against regulatory limits, and
                    alerts you to any compliance issues. The system also provides suggestions for
                    load redistribution to optimize weight distribution.
                  </p>
                </div>

                {/* FAQ Item 2 */}
                <div className="border-b border-gray-200 pb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Is the system compliant with DOT regulations?
                  </h3>
                  <p className="text-gray-700">
                    Yes, our system is designed to keep you compliant with all Department of
                    Transportation (DOT) regulations regarding vehicle weights. We regularly update
                    our compliance rules to reflect any changes in federal or state regulations.
                  </p>
                </div>

                {/* FAQ Item 3 */}
                <div className="border-b border-gray-200 pb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Can I access the system on mobile devices?
                  </h3>
                  <p className="text-gray-700">
                    Absolutely! Our system is fully responsive and works on desktops, tablets, and
                    smartphones. We also offer dedicated mobile apps for iOS and Android for an
                    optimized mobile experience.
                  </p>
                </div>

                {/* FAQ Item 4 */}
                <div className="border-b border-gray-200 pb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    How secure is my data?
                  </h3>
                  <p className="text-gray-700">
                    Security is a top priority. We use industry-standard encryption for all data
                    transmission and storage. Our systems are regularly audited for security
                    vulnerabilities, and we maintain strict access controls to protect your data.
                  </p>
                </div>

                {/* FAQ Item 5 */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Do you offer training and support?
                  </h3>
                  <p className="text-gray-700">
                    Yes, we provide comprehensive training for all users and ongoing support through
                    multiple channels including phone, email, and live chat. Our support team is
                    available 24/7 to assist with any issues or questions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary-700 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Trucking Operations?
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
              Join the hundreds of trucking companies that have improved compliance, reduced costs,
              and optimized their operations with TruckingSemis.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="px-8 py-3 bg-white text-primary-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
              >
                Get Started Today
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3 bg-transparent border-2 border-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
