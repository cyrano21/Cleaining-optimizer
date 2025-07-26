import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Blogs = ({ 
  title = "Latest Blog Posts",
  subtitle = "Discover our latest articles and insights",
  blogs = [],
  layout = "grid",
  showDate = true,
  showExcerpt = true,
  variant = "default",
  className = ""
}) => {
  // Données par défaut pour la démonstration
  const defaultBlogs = [
    {
      id: 1,
      title: "The Ultimate Guide to Modern Fashion",
      excerpt: "Discover the latest trends and timeless pieces that define contemporary style.",
      image: "/images/blog/blog-1.jpg",
      date: "2024-01-15",
      category: "Fashion",
      slug: "ultimate-guide-modern-fashion"
    },
    {
      id: 2,
      title: "Sustainable Shopping: Making Better Choices",
      excerpt: "Learn how to make environmentally conscious decisions while shopping.",
      image: "/images/blog/blog-2.jpg",
      date: "2024-01-10",
      category: "Lifestyle",
      slug: "sustainable-shopping-guide"
    },
    {
      id: 3,
      title: "Tech Innovations Changing Retail",
      excerpt: "Explore how technology is revolutionizing the shopping experience.",
      image: "/images/blog/blog-3.jpg",
      date: "2024-01-05",
      category: "Technology",
      slug: "tech-innovations-retail"
    }
  ];

  const blogData = blogs.length > 0 ? blogs : defaultBlogs;

  const getVariantClasses = () => {
    switch (variant) {
      case 'fashion':
        return 'bg-gradient-to-b from-pink-50 to-white';
      case 'electronic':
        return 'bg-gradient-to-b from-blue-50 to-white';
      case 'cosmetic':
        return 'bg-gradient-to-b from-purple-50 to-white';
      default:
        return 'bg-gray-50';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <section className={`py-16 md:py-24 ${getVariantClasses()} ${className}`}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Blog Grid */}
        <div className={`grid gap-8 ${
          layout === 'list' 
            ? 'grid-cols-1' 
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {blogData.map((blog) => (
            <article 
              key={blog.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={blog.image}
                  alt={blog.title}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
                {blog.category && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                      {blog.category}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                {showDate && blog.date && (
                  <p className="text-sm text-gray-500 mb-2">
                    {formatDate(blog.date)}
                  </p>
                )}
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                  <Link href={`/blog/${blog.slug}`}>
                    {blog.title}
                  </Link>
                </h3>
                
                {showExcerpt && blog.excerpt && (
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {blog.excerpt}
                  </p>
                )}
                
                <Link 
                  href={`/blog/${blog.slug}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Read More
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href="/blog"
            className="inline-flex items-center px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            View All Posts
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Blogs;
