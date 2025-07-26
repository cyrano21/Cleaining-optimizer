import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = ({ 
  variant = "default",
  showNewsletter = true,
  showSocial = true,
  showPaymentMethods = true,
  companyInfo = {},
  quickLinks = [],
  categories = [],
  customerService = [],
  className = ""
}) => {
  // Données par défaut
  const defaultCompanyInfo = {
    name: "Ecomus",
    description: "Your premier destination for quality products and exceptional service.",
    address: "123 Commerce Street, Business District, City 12345",
    phone: "+1 (555) 123-4567",
    email: "contact@ecomus.com"
  };

  const defaultQuickLinks = [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Blog", href: "/blog" },
    { name: "Careers", href: "/careers" }
  ];

  const defaultCategories = [
    { name: "Electronics", href: "/category/electronics" },
    { name: "Fashion", href: "/category/fashion" },
    { name: "Home & Garden", href: "/category/home-garden" },
    { name: "Sports", href: "/category/sports" }
  ];

  const defaultCustomerService = [
    { name: "Help Center", href: "/help" },
    { name: "Returns", href: "/returns" },
    { name: "Shipping Info", href: "/shipping" },
    { name: "Size Guide", href: "/size-guide" }
  ];

  const finalCompanyInfo = { ...defaultCompanyInfo, ...companyInfo };
  const finalQuickLinks = quickLinks.length > 0 ? quickLinks : defaultQuickLinks;
  const finalCategories = categories.length > 0 ? categories : defaultCategories;
  const finalCustomerService = customerService.length > 0 ? customerService : defaultCustomerService;

  const getVariantClasses = () => {
    switch (variant) {
      case 'fashion':
        return 'bg-pink-50 text-gray-900';
      case 'electronic':
        return 'bg-blue-50 text-gray-900';
      case 'cosmetic':
        return 'bg-purple-50 text-gray-900';
      case 'dark':
        return 'bg-gray-900 text-white';
      default:
        return 'bg-gray-100 text-gray-900';
    }
  };

  const paymentMethods = [
    { name: "Visa", icon: "💳" },
    { name: "Mastercard", icon: "💳" },
    { name: "PayPal", icon: "💰" },
    { name: "Apple Pay", icon: "📱" },
    { name: "Google Pay", icon: "📱" }
  ];

  const socialLinks = [
    { name: "Facebook", href: "#", icon: "📘" },
    { name: "Twitter", href: "#", icon: "🐦" },
    { name: "Instagram", href: "#", icon: "📷" },
    { name: "LinkedIn", href: "#", icon: "💼" }
  ];

  return (
    <footer className={`pt-16 pb-8 ${getVariantClasses()} ${className}`}>
      <div className="container mx-auto px-4">
        {/* Newsletter Section */}
        {showNewsletter && (
          <div className="border-b border-gray-200 pb-12 mb-12">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-2xl font-bold mb-4">Stay in the Loop</h3>
              <p className="text-gray-600 mb-6">
                Subscribe to our newsletter for exclusive offers and updates
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold mb-4">{finalCompanyInfo.name}</h3>
            <p className="text-gray-600 mb-4">{finalCompanyInfo.description}</p>
            
            <div className="space-y-2 text-sm text-gray-600">
              <p>{finalCompanyInfo.address}</p>
              <p>{finalCompanyInfo.phone}</p>
              <p>{finalCompanyInfo.email}</p>
            </div>

            {/* Social Links */}
            {showSocial && (
              <div className="flex space-x-4 mt-6">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="text-2xl hover:opacity-75 transition-opacity"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {finalQuickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2">
              {finalCategories.map((category) => (
                <li key={category.name}>
                  <Link 
                    href={category.href}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              {finalCustomerService.map((service) => (
                <li key={service.name}>
                  <Link 
                    href={service.href}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600 mb-4 md:mb-0">
              © 2024 {finalCompanyInfo.name}. All rights reserved.
            </p>
            
            {/* Payment Methods */}
            {showPaymentMethods && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">We accept:</span>
                <div className="flex space-x-2">
                  {paymentMethods.map((method) => (
                    <span 
                      key={method.name}
                      className="text-lg"
                      title={method.name}
                    >
                      {method.icon}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Legal Links */}
          <div className="flex flex-wrap justify-center md:justify-start space-x-6 mt-4">
            <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
