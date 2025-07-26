"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  ShoppingBag,
  MapPin,
  CreditCard,
  User,
  ChevronDown,
  Star,
  ShoppingCart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";

// Interfaces for the profile page
interface OrderItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity?: number;
}

interface Order {
  id: string;
  date: string;
  total: number;
  recipient: string;
  items: OrderItem[];
  status?: string;
}

// Removed unused interfaces Address and PaymentCard

interface UserProfile {
  fullName: string;
  contactNumber: string;
  address: string;
  email: string;
  password: string;
}

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState("orders");
  // real data for addresses (currently not used in UI)
  // const addresses: Address[] = [...];

  const { data: session } = useSession();
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    avatar: "",
  });

  // real data for payment cards (currently not used in UI)
  // const paymentCards: PaymentCard[] = [...];

  // real data for user profile (currently not used in UI)
  // const userProfile: UserProfile = {...};

  const [timeFilter] = useState("all");

  // Featured products data
  const featuredProducts: Product[] = [
    {
      id: "7",
      name: "Wireless Earbuds",
      price: 129.99,
      image: "/images/placeholder.svg",
      rating: 4.6,
      reviews: 89,
      purchaseDate: "Dec 15, 2023",
    },
    {
      id: "8",
      name: "USB-C Cable",
      price: 19.99,
      image: "/images/placeholder.svg",
      rating: 4.4,
      reviews: 156,
      purchaseDate: "Nov 28, 2023",
    },
    {
      id: "9",
      name: "Portable Charger",
      price: 39.99,
      image: "/images/placeholder.svg",
      rating: 4.5,
      reviews: 203,
      purchaseDate: "Oct 10, 2023",
    },
    {
      id: "10",
      name: "Screen Protector",
      price: 14.99,
      image: "/images/placeholder.svg",
      rating: 4.3,
      reviews: 78,
      purchaseDate: "Sep 22, 2023",
    },
  ];

  // Buy again products data
  const buyAgainProducts: Product[] = [
    {
      id: "1",
      name: "Wireless Headphones",
      price: 99.99,
      image: "/images/placeholder.svg",
      rating: 4.5,
      reviews: 128,
    },
    {
      id: "2",
      name: "Smart Watch",
      price: 199.99,
      image: "/images/placeholder.svg",
      rating: 4.8,
      reviews: 256,
    },
    {
      id: "3",
      name: "Bluetooth Speaker",
      price: 79.99,
      image: "/images/placeholder.svg",
      rating: 4.3,
      reviews: 89,
    },
    {
      id: "4",
      name: "Phone Case",
      price: 24.99,
      image: "/images/placeholder.svg",
      rating: 4.6,
      reviews: 45,
    },
    {
      id: "5",
      name: "Laptop Stand",
      price: 49.99,
      image: "/images/placeholder.svg",
      rating: 4.4,
      reviews: 67,
    },
    {
      id: "6",
      name: "Gaming Mouse",
      price: 69.99,
      image: "/images/placeholder.svg",
      rating: 4.7,
      reviews: 134,
    },
  ];

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch("/api/settings/profile");
        if (response.ok) {
          const data = await response.json();
          setProfileData(data.profile);
        } else {
          // Fallback to session data
          if (session?.user) {
            setProfileData({
              firstName: session.user.name?.split(" ")[0] || "",
              lastName: session.user.name?.split(" ")[1] || "",
              email: session.user.email || "",
              avatar: session.user.image || "",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        // Fallback to session data
        if (session?.user) {
          setProfileData({
            firstName: session.user.name?.split(" ")[0] || "",
            lastName: session.user.name?.split(" ")[1] || "",
            email: session.user.email || "",
            avatar: session.user.image || "",
          });
        }
      }
    };

    if (session) {
      fetchProfileData();
    }
  }, [session]);

  const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();

  // real orders data
  const orders: Order[] = [
    {
      id: "1",
      date: "January 15, 2024",
      total: 156.99,
      recipient: fullName || "User",
      status: "Delivered",
      items: [
        {
          id: "1",
          name: "Blue Handbag",
          price: 56.0,
          image: "/images/placeholder.svg",
          quantity: 1,
        },
      ],
    },
    {
      id: "#123456790",
      date: "January 10, 2024",
      total: 89.99,
      recipient: fullName || "User",
      items: [
        {
          id: "2",
          name: "Pink Sweater",
          price: 65.0,
          image: "/images/placeholder.svg",
        },
      ],
    },
  ];

  interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    rating: number;
    reviews: number;
    purchaseDate?: string;
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-6">Welcome Elon</h1>

            {/* Navigation Tabs */}
            <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg">
              <Button
                variant="ghost"
                onClick={() => setActiveTab("orders")}
                className={`flex items-center space-x-2 ${
                  activeTab === "orders"
                    ? "text-white bg-slate-700"
                    : "text-slate-400 hover:text-white hover:bg-slate-700"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Your Orders</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveTab("address")}
                className={`flex items-center space-x-2 ${
                  activeTab === "address"
                    ? "text-white bg-slate-700"
                    : "text-slate-400 hover:text-white hover:bg-slate-700"
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Your Address</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveTab("cards")}
                className={`flex items-center space-x-2 ${
                  activeTab === "cards"
                    ? "text-white bg-slate-700"
                    : "text-slate-400 hover:text-white hover:bg-slate-700"
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Your Cards</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveTab("profile")}
                className={`flex items-center space-x-2 ${
                  activeTab === "profile"
                    ? "text-white bg-slate-700"
                    : "text-slate-400 hover:text-white hover:bg-slate-700"
                }`}
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Orders Section */}
              {activeTab === "orders" && (
                <>
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-white">
                          3 Orders placed in
                        </CardTitle>
                        <Button
                          variant="outline"
                          className="border-slate-600 text-slate-300 bg-slate-800 hover:bg-slate-700"
                        >
                          {timeFilter} <ChevronDown className="ml-2 w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {orders.map((order) => (
                          <div
                            key={order.id}
                            className="border border-slate-700 rounded-lg p-6"
                          >
                            {/* Order Header */}
                            <div className="grid grid-cols-3 gap-4 mb-4 text-sm text-slate-400">
                              <div>
                                <div>Order Placed</div>
                                <div className="text-white">{order.date}</div>
                              </div>
                              <div>
                                <div>Total</div>
                                <div className="text-white">
                                  ${order.total.toFixed(2)}
                                </div>
                              </div>
                              <div>
                                <div>Ship to</div>
                                <div className="text-white">
                                  {order.recipient}
                                </div>
                              </div>
                            </div>

                            <div className="text-right mb-4">
                              <span className="text-slate-400">Order ID: </span>
                              <span className="text-red-400">{order.id}</span>
                            </div>

                            {/* Order Items */}
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between"
                              >
                                <div className="flex items-center space-x-4">
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    width={64}
                                    height={64}
                                    className="w-16 h-16 rounded-lg object-cover"
                                  />
                                  <div>
                                    <h3 className="text-white font-medium">
                                      {item.name}
                                    </h3>
                                    <p className="text-red-400">
                                      ${item.price}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex space-x-4">
                                  <Button className="bg-red-500 hover:bg-red-600">
                                    Buy It Again{" "}
                                    <ChevronDown className="ml-2 w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}

                            <div className="flex space-x-4 mt-4 text-sm">
                              <button className="text-red-400 hover:underline">
                                Invoice
                              </button>
                              <span className="text-slate-500">|</span>
                              <button className="text-red-400 hover:underline">
                                Write a Review
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="text-center mt-6">
                        <Button className="bg-red-500 hover:bg-red-600">
                          Load More
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Featured Products */}
                  <Card className="bg-slate-800 border-slate-700 mt-8">
                    <CardHeader>
                      <CardTitle className="text-white">
                        Featured Products
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto scrollbar-hide">
                        <div
                          className="flex gap-4 pb-4"
                        >
                          {featuredProducts.map((product: Product) => (
                            <motion.div
                              key={product.id}
                              whileHover={{ scale: 1.05, y: -5 }}
                              style={{
                                position: "relative",
                                flexShrink: 0,
                                width: "16rem",
                                cursor: "pointer",
                              }}
                            >
                              {product.id === "6" && (
                                <Badge className="absolute top-2 left-2 bg-yellow-500 text-black z-10">
                                  SOLD
                                </Badge>
                              )}
                              <div className="relative overflow-hidden rounded-lg">
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  width={256}
                                  height={192}
                                  className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                              </div>
                              <div className="mt-4">
                                <h3 className="text-white font-medium truncate">
                                  {product.name}
                                </h3>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-red-400 font-bold">
                                    ${product.price.toFixed(2)}
                                  </span>
                                  <div className="flex items-center space-x-1">
                                    <div className="flex">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-3 h-3 ${
                                            i < Math.floor(product.rating)
                                              ? "text-yellow-400 fill-current"
                                              : "text-slate-600"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-yellow-400 text-sm">
                                      {product.rating}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-slate-400 text-xs mt-1">
                                  {product.reviews.toLocaleString()} Ratings
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                      <style jsx>{`
                        .scrollbar-hide {
                          -ms-overflow-style: none;
                          scrollbar-width: none;
                        }
                        .scrollbar-hide::-webkit-scrollbar {
                          display: none;
                        }
                      `}</style>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Address Section */}
              {activeTab === "address" && (
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-white">
                        Your Addresses
                      </CardTitle>
                      <Button className="bg-red-500 hover:bg-red-600">
                        Add Address
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border border-slate-700 rounded-lg p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-white font-medium mb-2">
                              {fullName || "User"}
                            </h3>
                            <p className="text-slate-300">1 Rocket Road</p>
                            <p className="text-slate-300">
                              Hawthorne, CA 90250
                            </p>
                            <p className="text-slate-300">United States</p>
                            <p className="text-slate-300 mt-2">
                              Phone: +1 (555) 123-4567
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-slate-600 text-slate-300"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-slate-600 text-slate-300"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                        <div className="mt-4">
                          <Badge className="bg-green-500 text-white">
                            Default
                          </Badge>
                        </div>
                      </div>
                      <div className="border border-slate-700 rounded-lg p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-white font-medium mb-2">
                              {fullName || "User"}
                            </h3>
                            <p className="text-slate-300">Tesla Gigafactory</p>
                            <p className="text-slate-300">1 Electric Avenue</p>
                            <p className="text-slate-300">Austin, TX 78725</p>
                            <p className="text-slate-300">United States</p>
                            <p className="text-slate-300 mt-2">
                              Phone: +1 (555) 987-6543
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-slate-600 text-slate-300"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-slate-600 text-slate-300"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Cards Section */}
              {activeTab === "cards" && (
                <div className="space-y-6">
                  {/* Card Management Dropdowns */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">
                        Card Type
                      </label>
                      <select
                        id="card-type-filter"
                        title="Select card type to filter"
                        className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-red-500 focus:outline-none"
                      >
                        <option value="all">All Cards</option>
                        <option value="credit">Credit Cards</option>
                        <option value="debit">Debit Cards</option>
                        <option value="prepaid">Prepaid Cards</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">
                        Sort By
                      </label>
                      <select
                        id="sort-by"
                        title="Select sort option"
                        className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-red-500 focus:outline-none"
                      >
                        <option value="recent">Recently Added</option>
                        <option value="expiry">Expiry Date</option>
                        <option value="name">Card Name</option>
                        <option value="type">Card Type</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">
                        Status
                      </label>
                      <select
                        id="card-status"
                        title="Filter by card status"
                        className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-red-500 focus:outline-none"
                      >
                        <option value="active">Active Cards</option>
                        <option value="expired">Expired Cards</option>
                        <option value="blocked">Blocked Cards</option>
                        <option value="all">All Status</option>
                      </select>
                    </div>
                  </div>

                  {/* Your Payment Options */}
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">
                        Your Payment Options
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Default Payment Preference */}
                        <div className="border border-slate-700 rounded-lg p-6">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-white font-semibold">
                              Your Default Payment Preference
                            </h3>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-slate-600 text-slate-300"
                            >
                              Update preference
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <p className="text-slate-400 text-sm mb-1">
                                Name:
                              </p>
                              <p className="text-white font-medium">
                                {fullName || "User"}
                              </p>
                              <p className="text-slate-400 text-sm mt-3 mb-1">
                                Address:
                              </p>
                              <p className="text-white">
                                265, Hill View, Rochester Avenue. Kentucky -
                                40062
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-400 text-sm mb-1">
                                Payment Method:
                              </p>
                              <p className="text-white font-medium">
                                Bank Of America Debit Card ending in 0654
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Your Saved Debit & Credit Cards */}
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">
                        Your Saved Debit & Credit Cards
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-96 overflow-y-auto scrollbar-hide">
                        <div className="space-y-4">
                          {/* BOA Debit Card 0654 */}
                          <div className="border border-slate-700 rounded-lg p-4 hover:bg-slate-700/30 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <Image
                                  src="/images/placeholder.svg"
                                  alt="BOA Card"
                                  width={60}
                                  height={40}
                                  className="w-15 h-10 rounded object-cover"
                                />
                                <div>
                                  <h4 className="text-white font-medium">
                                    BOA Debit Card 0654
                                  </h4>
                                  <p className="text-slate-400 text-sm">
                                    {fullName || "User"}
                                  </p>
                                  <p className="text-slate-400 text-xs">
                                    255, Hill View, Rochester Avenue. Kentucky -
                                    40062
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-slate-300 text-sm mb-1">
                                  Expires On
                                </p>
                                <p className="text-white font-medium">
                                  03 / 2022
                                </p>
                                <div className="flex space-x-2 mt-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-600 text-slate-300 text-xs"
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-600 text-slate-300 text-xs"
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* CB Credit Card 6549 */}
                          <div className="border border-slate-700 rounded-lg p-4 hover:bg-slate-700/30 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <Image
                                  src="/images/placeholder.svg"
                                  alt="CB Card"
                                  width={60}
                                  height={40}
                                  className="w-15 h-10 rounded object-cover"
                                />
                                <div>
                                  <h4 className="text-white font-medium">
                                    CB Credit Card 6549
                                  </h4>
                                  <p className="text-slate-400 text-sm">
                                    {fullName || "User"}
                                  </p>
                                  <p className="text-slate-400 text-xs">
                                    255, Hill View, Rochester Avenue. Kentucky -
                                    40062
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-slate-300 text-sm mb-1">
                                  Expires On
                                </p>
                                <p className="text-white font-medium">
                                  05 / 2026
                                </p>
                                <div className="flex space-x-2 mt-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-600 text-slate-300 text-xs"
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-600 text-slate-300 text-xs"
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* BB Debit Card 7852 */}
                          <div className="border border-slate-700 rounded-lg p-4 hover:bg-slate-700/30 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <Image
                                  src="/images/placeholder.svg"
                                  alt="BB Card"
                                  width={60}
                                  height={40}
                                  className="w-15 h-10 rounded object-cover"
                                />
                                <div>
                                  <h4 className="text-white font-medium">
                                    BB Debit Card 7852
                                  </h4>
                                  <p className="text-slate-400 text-sm">
                                    {fullName || "User"}
                                  </p>
                                  <p className="text-slate-400 text-xs">
                                    255, Hill View, Rochester Avenue. Kentucky -
                                    40062
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-slate-300 text-sm mb-1">
                                  Expires On
                                </p>
                                <p className="text-white font-medium">
                                  06 / 2030
                                </p>
                                <div className="flex space-x-2 mt-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-600 text-slate-300 text-xs"
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-600 text-slate-300 text-xs"
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* BOA Debit Card 6555 - Expired */}
                          <div className="border border-red-700/50 rounded-lg p-4 hover:bg-slate-700/30 transition-colors opacity-75">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <Image
                                  src="/images/placeholder.svg"
                                  alt="BOA Card"
                                  width={60}
                                  height={40}
                                  className="w-15 h-10 rounded object-cover grayscale"
                                />
                                <div>
                                  <h4 className="text-white font-medium">
                                    BOA Debit Card 6555
                                  </h4>
                                  <p className="text-slate-400 text-sm">
                                    {fullName || "User"}
                                  </p>
                                  <p className="text-slate-400 text-xs">
                                    255, Hill View, Rochester Avenue. Kentucky -
                                    40062
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-slate-300 text-sm mb-1">
                                  Expires On
                                </p>
                                <p className="text-red-400 font-medium">
                                  Expired 08/2021
                                </p>
                                <div className="flex space-x-2 mt-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-600 text-slate-300 text-xs"
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-600 text-slate-300 text-xs"
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <style jsx>{`
                        .scrollbar-hide {
                          -ms-overflow-style: none;
                          scrollbar-width: none;
                        }
                        .scrollbar-hide::-webkit-scrollbar {
                          display: none;
                        }
                      `}</style>
                    </CardContent>
                  </Card>

                  {/* Add a New Payment Method */}
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">
                        Add a New Payment Method
                      </CardTitle>
                      <p className="text-slate-400 text-sm">
                        Credit or Debit Cards
                      </p>
                      <p className="text-slate-400 text-xs">
                        We accept all major credit and debit card
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-slate-300 text-sm mb-2 block">
                            Card Type
                          </label>
                          <select
                            id="card-type"
                            title="Select card type"
                            className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-red-500 focus:outline-none"
                          >
                            <option value="credit">Credit Card</option>
                            <option value="debit">Debit Card</option>
                            <option value="prepaid">Prepaid Card</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-slate-300 text-sm mb-2 block">
                            Card Number
                          </label>
                          <input
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-red-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-slate-300 text-sm mb-2 block">
                            Card Holder Name
                          </label>
                          <input
                            type="text"
                            placeholder={fullName || "Your Name"}
                            className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-red-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-slate-300 text-sm mb-2 block">
                            Bank
                          </label>
                          <select
                            id="bank-selection"
                            title="Select bank"
                            className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-red-500 focus:outline-none"
                          >
                            <option value="">Select Bank</option>
                            <option value="boa">Bank of America</option>
                            <option value="chase">Chase Bank</option>
                            <option value="wells">Wells Fargo</option>
                            <option value="citi">Citibank</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-slate-300 text-sm mb-2 block">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-red-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-slate-300 text-sm mb-2 block">
                            CVV
                          </label>
                          <input
                            type="text"
                            placeholder="123"
                            className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-red-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <Button className="w-full bg-red-500 hover:bg-red-600">
                        Add a credit or debit card
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Profile Section */}
              {activeTab === "profile" && (
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Profile Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center space-x-6">
                        <div className="relative">
                          <Image
                            src="/images/placeholder.svg"
                            alt="Profile"
                            width={96}
                            height={96}
                            className="w-24 h-24 rounded-full object-cover"
                          />
                          <Button
                            size="sm"
                            className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0 bg-red-500 hover:bg-red-600"
                          >
                            <User className="w-4 h-4" />
                          </Button>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">
                            {fullName || "User"}
                          </h2>
                          <p className="text-slate-400">
                            CEO & Product Architect
                          </p>
                          <p className="text-slate-400">Tesla, Inc.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label
                            htmlFor="fullName"
                            className="block text-sm font-medium text-slate-300 mb-2"
                          >
                            Full Name
                          </label>
                          <input
                            id="fullName"
                            type="text"
                            value={fullName || "User"}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            aria-label="Enter your full name"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="email"
                            className="block text-sm font-medium text-slate-300 mb-2"
                          >
                            Email
                          </label>
                          <input
                            id="email"
                            type="email"
                            value="elon@tesla.com"
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            aria-label="Enter your email address"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="phone"
                            className="block text-sm font-medium text-slate-300 mb-2"
                          >
                            Phone
                          </label>
                          <input
                            id="phone"
                            type="tel"
                            value="+1 (555) 123-4567"
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            aria-required="true"
                            aria-label="Enter your phone number"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="dateOfBirth"
                            className="block text-sm font-medium text-slate-300 mb-2"
                          >
                            Date of Birth
                          </label>
                          <input
                            id="dateOfBirth"
                            type="date"
                            value="1971-06-28"
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            aria-label="Select your date of birth"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="bio"
                          className="block text-sm font-medium text-slate-300 mb-2"
                        >
                          Bio
                        </label>
                        <textarea
                          id="bio"
                          rows={4}
                          value="Entrepreneur and business magnate. CEO of Tesla and SpaceX. Working to accelerate the world's transition to sustainable energy and make life multiplanetary."
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          aria-required="false"
                          aria-label="Enter your bio"
                        />
                      </div>

                      <div className="flex space-x-4">
                        <Button className="bg-red-500 hover:bg-red-600">
                          Save Changes
                        </Button>
                        <Button
                          variant="outline"
                          className="border-slate-600 text-slate-300"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Buy It Again */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Buy It Again</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-80 overflow-y-auto scrollbar-hide">
                    <div className="space-y-4">
                      {buyAgainProducts.map((product: Product) => (
                        <div
                          key={product.id}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer hover:scale-105 transform duration-200"
                        >
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="text-white text-sm font-medium">
                              {product.name}
                            </h4>
                            <p className="text-red-400 font-bold">
                              ${product.price}
                            </p>
                            <p className="text-slate-400 text-xs">
                              Buy on {product.purchaseDate}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            className="bg-red-500 hover:bg-red-600 rounded-full w-8 h-8 p-0 flex-shrink-0"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <style jsx>{`
                    .scrollbar-hide {
                      -ms-overflow-style: none;
                      scrollbar-width: none;
                    }
                    .scrollbar-hide::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>
                </CardContent>
              </Card>

              {/* New Collection */}
              <Card className="bg-slate-800 border-slate-700 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    <Image
                      src="/images/placeholder.svg"
                      alt="Biker&apos;s Jacket"
                      width={400}
                      height={160}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div>
                        <h3 className="text-white font-bold text-lg mb-1">
                          New Collection for you
                        </h3>
                        <p className="text-slate-200 text-sm mb-3">
                          Get 20% off on Biker&apos;s Jacket
                        </p>
                        <Button
                          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105"
                          size="sm"
                        >
                          View Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

