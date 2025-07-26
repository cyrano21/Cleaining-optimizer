'use client';

import React from 'react';

const Testimonials = ({ config }) => {
  const { variant = 'default', title = 'What Our Customers Say', limit = 6 } = config;

  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      rating: 5,
      comment: 'Amazing quality and fast shipping!',
      avatar: '👩'
    },
    {
      id: 2,
      name: 'Mike Chen',
      rating: 5,
      comment: 'Great customer service and products.',
      avatar: '👨'
    },
    {
      id: 3,
      name: 'Emily Davis',
      rating: 5,
      comment: 'Exactly what I was looking for!',
      avatar: '👩‍🦱'
    }
  ].slice(0, limit);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-600">
            Real feedback from our satisfied customers
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-3">{testimonial.avatar}</div>
                <div>
                  <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                  <div className="flex text-yellow-400">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i}>⭐</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600">{testimonial.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
