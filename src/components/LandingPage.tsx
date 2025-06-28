import React from 'react';
import { Link } from 'react-router-dom';
import { DropletIcon, SearchIcon, MapPinIcon, AlertTriangleIcon, BarChartIcon, UsersIcon, ShieldCheckIcon, TrendingUpIcon, EyeIcon } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden -mt-20 pt-20">
        <div className="absolute inset-0">
          <img 
            src="https://cdn.dribbble.com/userupload/25420095/file/original-e224be2327d05e9acbdb57393afe42ee.png?resize=752x564&vertical=center" 
            alt="Water Quality Dashboard" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-800/70 to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 backdrop-blur-sm rounded-full border border-blue-300/30">
                  <ShieldCheckIcon className="h-4 w-4 mr-2 text-blue-300" />
                  <span className="text-sm font-medium text-blue-100">Trusted Water Quality Data</span>
                </div>
                <h1 className="text-6xl lg:text-7xl font-bold leading-tight">
                  Safe Water
                  <span className="block text-blue-300">For Everyone</span>
                </h1>
                <p className="text-xl lg:text-2xl text-blue-100 leading-relaxed max-w-lg">
                  Discover, monitor, and ensure the safety of your drinking water with real-time data and comprehensive analytics.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/search" 
                  className="group bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <SearchIcon className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Find Your Water System
                </Link>
                <Link 
                  to="/map" 
                  className="group bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 flex items-center justify-center border border-white/30 hover:border-white/50"
                >
                  <MapPinIcon className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Explore Interactive Map
                </Link>
              </div>
              
              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">10K+</div>
                  <div className="text-sm text-blue-200">Water Systems</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">50M+</div>
                  <div className="text-sm text-blue-200">Data Points</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">99.9%</div>
                  <div className="text-sm text-blue-200">Accuracy</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Why Water Quality Matters Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Why Water Quality Matters</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Understanding your water quality is crucial for protecting your health, your family, and your community.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="group text-center p-8 rounded-2xl bg-white hover:bg-blue-50 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl inline-flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <DropletIcon className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Health Protection</h3>
              <p className="text-gray-600 leading-relaxed">Clean water is fundamental to your health and well-being. Contaminants in drinking water can cause immediate illness or long-term health issues.</p>
            </div>
            
            <div className="group text-center p-8 rounded-2xl bg-white hover:bg-orange-50 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl inline-flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <AlertTriangleIcon className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Risk Awareness</h3>
              <p className="text-gray-600 leading-relaxed">Stay informed about potential contaminants in your local water supply to take appropriate preventive measures and protect your family.</p>
            </div>
            
            <div className="group text-center p-8 rounded-2xl bg-white hover:bg-green-50 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl inline-flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <UsersIcon className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Community Impact</h3>
              <p className="text-gray-600 leading-relaxed">Water quality affects entire communities. Together, we can advocate for clean, safe water and hold authorities accountable.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-24 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2523ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Powerful Tools at Your Fingertips</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">Comprehensive water quality monitoring and analysis tools designed for everyone.</p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="group bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/20 transition-all duration-500 border border-white/20 hover:border-white/40 transform hover:-translate-y-2">
              <div className="mb-6">
                <div className="bg-blue-500 p-4 rounded-xl inline-flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <SearchIcon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Smart Water System Search</h3>
              </div>
              <p className="text-blue-100 mb-6 leading-relaxed">Find detailed information about your local water supply system, including recent test results, safety records, and compliance history.</p>
              <Link to="/search" className="group/link inline-flex items-center text-blue-300 hover:text-white font-semibold transition-colors duration-300">
                Search Now 
                <svg className="ml-2 h-4 w-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            
            <div className="group bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/20 transition-all duration-500 border border-white/20 hover:border-white/40 transform hover:-translate-y-2">
              <div className="mb-6">
                <div className="bg-green-500 p-4 rounded-xl inline-flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <MapPinIcon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Interactive Mapping</h3>
              </div>
              <p className="text-blue-100 mb-6 leading-relaxed">Visualize water quality data across regions, identify trends, and compare water systems with our advanced interactive mapping platform.</p>
              <Link to="/map" className="group/link inline-flex items-center text-blue-300 hover:text-white font-semibold transition-colors duration-300">
                Explore Map 
                <svg className="ml-2 h-4 w-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            
            <div className="group bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/20 transition-all duration-500 border border-white/20 hover:border-white/40 transform hover:-translate-y-2">
              <div className="mb-6">
                <div className="bg-purple-500 p-4 rounded-xl inline-flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BarChartIcon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Analytics Dashboard</h3>
              </div>
              <p className="text-blue-100 mb-6 leading-relaxed">Access comprehensive analytics and insights about water quality trends, violations, safety compliance, and predictive modeling.</p>
              <Link to="/dashboard" className="group/link inline-flex items-center text-blue-300 hover:text-white font-semibold transition-colors duration-300">
                View Dashboard 
                <svg className="ml-2 h-4 w-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Real Stories Section */}
      <section className="py-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Real Stories, Real Impact</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">See how our platform has helped communities protect their water quality and health.</p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl p-12 shadow-2xl border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-green-500 to-purple-500"></div>
              
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                <div className="flex-1">
                  <blockquote className="text-2xl lg:text-3xl text-gray-800 leading-relaxed font-medium mb-6">
                    "After discovering high lead levels in our community's water supply through this platform, we were able to alert local authorities and get immediate action. This tool saved our neighborhood from a potential health crisis."
                  </blockquote>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">S</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">Sarah Johnson</p>
                      <p className="text-gray-600">Community Health Advocate • Atlanta, GA</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 grid grid-cols-3 gap-6 pt-8 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">24hrs</div>
                  <div className="text-sm text-gray-600">Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
                  <div className="text-sm text-gray-600">Families Protected</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">100%</div>
                  <div className="text-sm text-gray-600">Issue Resolved</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Water Quality Issues Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Water Quality Issues We Monitor</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Stay informed about the most common water quality threats and how they can affect your health.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
              <div className="h-48 bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 text-center text-white">
                  <AlertTriangleIcon className="h-16 w-16 mx-auto mb-2" />
                  <div className="text-sm font-semibold">TOXIC METAL</div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Lead Contamination</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">Lead in drinking water can cause serious health problems, especially for children and pregnant women.</p>
                <Link to="/issues/lead" className="group/link inline-flex items-center text-red-600 hover:text-red-700 font-semibold transition-colors duration-300">
                  Learn more 
                  <svg className="ml-2 h-4 w-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
            
            <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
              <div className="h-48 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 text-center text-white">
                  <svg className="h-16 w-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 114 0 2 2 0 01-4 0zm8 0a2 2 0 114 0 2 2 0 01-4 0z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm font-semibold">BIOLOGICAL</div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Bacterial Contaminants</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">E. coli, coliform, and other bacteria can cause immediate illness if present in drinking water.</p>
                <Link to="/issues/bacteria" className="group/link inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold transition-colors duration-300">
                  Learn more 
                  <svg className="ml-2 h-4 w-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
            
            <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
              <div className="h-48 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 text-center text-white">
                  <svg className="h-16 w-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm font-semibold">CHEMICAL</div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Chemical Contaminants</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">Industrial chemicals, pesticides, and fertilizers can contaminate groundwater sources.</p>
                <Link to="/issues/chemicals" className="group/link inline-flex items-center text-purple-600 hover:text-purple-700 font-semibold transition-colors duration-300">
                  Learn more 
                  <svg className="ml-2 h-4 w-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
            
            <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
              <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 text-center text-white">
                  <svg className="h-16 w-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm font-semibold">TREATMENT</div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Treatment Byproducts</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">Sometimes water treatment processes can create harmful byproducts that pose health risks.</p>
                <Link to="/issues/byproducts" className="group/link inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-300">
                  Learn more 
                  <svg className="ml-2 h-4 w-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M11%2018c3.866%200%207-3.134%207-7s-3.134-7-7-7-7%203.134-7%207%203.134%207%207%207zm48%2025c3.866%200%207-3.134%207-7s-3.134-7-7-7-7%203.134-7%207%203.134%207%207%207zm-43-7c1.657%200%203-1.343%203-3s-1.343-3-3-3-3%201.343-3%203%201.343%203%203%203zm63%2031c1.657%200%203-1.343%203-3s-1.343-3-3-3-3%201.343-3%203%201.343%203%203%203zM34%2090c1.657%200%203-1.343%203-3s-1.343-3-3-3-3%201.343-3%203%201.343%203%203%203zm56-76c1.657%200%203-1.343%203-3s-1.343-3-3-3-3%201.343-3%203%201.343%203%203%203zM12%2086c2.21%200%204-1.79%204-4s-1.79-4-4-4-4%201.79-4%204%201.79%204%204%204zm28-65c2.21%200%204-1.79%204-4s-1.79-4-4-4-4%201.79-4%204%201.79%204%204%204zm23-11c2.76%200%205-2.24%205-5s-2.24-5-5-5-5%202.24-5%205%202.24%205%205%205zm-6%2060c2.21%200%204-1.79%204-4s-1.79-4-4-4-4%201.79-4%204%201.79%204%204%204zm29%2022c2.76%200%205-2.24%205-5s-2.24-5-5-5-5%202.24-5%205%202.24%205%205%205zM32%2063c2.76%200%205-2.24%205-5s-2.24-5-5-5-5%202.24-5%205%202.24%205%205%205zm57-13c2.76%200%205-2.24%205-5s-2.24-5-5-5-5%202.24-5%205%202.24%205%205%205zm-9-21c1.105%200%202-.895%202-2s-.895-2-2-2-2%20.895-2%202%20.895%202%202%202zM60%2091c1.105%200%202-.895%202-2s-.895-2-2-2-2%20.895-2%202%20.895%202%202%202zM35%2041c1.105%200%202-.895%202-2s-.895-2-2-2-2%20.895-2%202%20.895%202%202%202zM12%2060c1.105%200%202-.895%202-2s-.895-2-2-2-2%20.895-2%202%20.895%202%202%202z%22%20fill%3D%22%2523ffffff%22%20fill-opacity%3D%220.1%22%20fill-rule%3D%22evenodd%22/%3E%3C/svg%3E')] opacity-30"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
              <ShieldCheckIcon className="h-5 w-5 mr-2 text-blue-300" />
              <span className="text-sm font-medium text-blue-100">Join thousands protecting their water quality</span>
            </div>
            
            <h2 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Take Control of Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">Water Safety Today</span>
            </h2>
            
            <p className="text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto mb-12 leading-relaxed">
              Knowledge is power. Start monitoring your drinking water quality and protect what matters most – your family's health.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link 
                to="/search" 
                className="group bg-white hover:bg-gray-100 text-blue-900 font-bold px-10 py-5 rounded-2xl transition-all duration-300 text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 flex items-center"
              >
                <SearchIcon className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                Start Monitoring Now
              </Link>
              
              <Link 
                to="/map" 
                className="group bg-transparent hover:bg-white/10 text-white font-bold px-10 py-5 rounded-2xl transition-all duration-300 text-lg border-2 border-white/30 hover:border-white/50 flex items-center"
              >
                <EyeIcon className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                Explore the Map
              </Link>
            </div>
            
            <div className="mt-12 flex justify-center items-center space-x-8 text-sm text-blue-200">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                Free to use
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                Real-time data
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                Trusted by communities
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};


