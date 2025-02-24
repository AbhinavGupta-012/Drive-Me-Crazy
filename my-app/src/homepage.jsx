import React from 'react';
import { useState } from 'react';
import { Car, MapPin, Clock, Shield, Star, Menu, X } from 'lucide-react';

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">RideConnect</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-700 hover:text-blue-600">Book a Ride</a>
              <a href="#" className="text-gray-700 hover:text-blue-600">Services</a>
              <a href="#" className="text-gray-700 hover:text-blue-600">About</a>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Sign In
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-gray-900"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a href="#" className="block px-3 py-2 text-gray-700 hover:bg-gray-100">Book a Ride</a>
              <a href="#" className="block px-3 py-2 text-gray-700 hover:bg-gray-100">Services</a>
              <a href="#" className="block px-3 py-2 text-gray-700 hover:bg-gray-100">About</a>
              <a href="#" className="block px-3 py-2 text-gray-700 hover:bg-gray-100">Sign In</a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Your Ride, Your Way
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Book your ride instantly, travel safely, and enjoy a comfortable journey with our trusted drivers.
            </p>
            
            {/* Booking Form */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                      className="pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter pickup location"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Drop-off Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={dropoff}
                      onChange={(e) => setDropoff(e.target.value)}
                      className="pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter drop-off location"
                    />
                  </div>
                </div>
                
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  Book Now
                </button>
              </div>
            </div>
          </div>
          
          <div className="hidden md:block">
            <img
              src="/api/placeholder/600/400"
              alt="Ride booking illustration"
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose RideConnect?
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Clock className="text-blue-600 mb-4" size={32} />
              <h4 className="text-xl font-semibold mb-2">Quick Booking</h4>
              <p className="text-gray-600">Book your ride in seconds and get instant confirmation</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Shield className="text-blue-600 mb-4" size={32} />
              <h4 className="text-xl font-semibold mb-2">Safe Rides</h4>
              <p className="text-gray-600">All our drivers are verified and trained professionals</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Star className="text-blue-600 mb-4" size={32} />
              <h4 className="text-xl font-semibold mb-2">Top Rated</h4>
              <p className="text-gray-600">Consistently high-rated service by our users</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;