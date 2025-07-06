"use client";

import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName) {
      setError("First name and last name are required");
      return false;
    }
    if (!formData.email) {
      setError("Email is required");
      return false;
    }
    if (!formData.password || formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (!agreeToTerms) {
      setError("You must agree to the terms and conditions");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to login page with success message
        router.push(
          "/auth/login?message=Registration successful. Please sign in.",
        );
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
      data-oid="-0fott:"
    >
      <div className="max-w-md w-full space-y-8" data-oid="9t2_u0j">
        <div className="text-center" data-oid="ig0uxhz">
          <h2
            className="mt-6 text-3xl font-extrabold text-gray-900"
            data-oid=":o4vkxw"
          >
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600" data-oid="rbv9w-.">
            Or{" "}
            <Link
              href="/auth/login"
              className="font-medium text-blue-600 hover:text-blue-500"
              data-oid="5grr3:v"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <Card data-oid=".y3mggq">
          <CardHeader data-oid="i6fmm5:">
            <CardTitle className="text-center" data-oid="8lai8.n">
              Join Us Today
            </CardTitle>
          </CardHeader>
          <CardContent data-oid="9q:.tpc">
            <form
              onSubmit={handleSubmit}
              className="space-y-6"
              data-oid="vkfw057"
            >
              {error && (
                <div
                  className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm"
                  data-oid="efpkq4y"
                >
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4" data-oid="tk3qlpj">
                <div data-oid="4v2.rya">
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700"
                    data-oid="iabafax"
                  >
                    First name
                  </label>
                  <div className="mt-1 relative" data-oid="sfyox5:">
                    <div
                      className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                      data-oid="e14c139"
                    >
                      <User
                        className="h-5 w-5 text-gray-400"
                        data-oid=":rdik:n"
                      />
                    </div>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="First name"
                      data-oid="yfr:pi7"
                    />
                  </div>
                </div>

                <div data-oid="rmol285">
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700"
                    data-oid="e43fxtw"
                  >
                    Last name
                  </label>
                  <div className="mt-1 relative" data-oid="_t9-dsj">
                    <div
                      className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                      data-oid="_6s46e-"
                    >
                      <User
                        className="h-5 w-5 text-gray-400"
                        data-oid="jjr95em"
                      />
                    </div>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="Last name"
                      data-oid="cq-bnqh"
                    />
                  </div>
                </div>
              </div>

              <div data-oid="hc5-ie:">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                  data-oid="fhsmynq"
                >
                  Email address
                </label>
                <div className="mt-1 relative" data-oid="9b2irq8">
                  <div
                    className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                    data-oid="xwqgkix"
                  >
                    <Mail
                      className="h-5 w-5 text-gray-400"
                      data-oid="nkw.pus"
                    />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    placeholder="Enter your email"
                    data-oid="l:n18pa"
                  />
                </div>
              </div>

              <div data-oid="u_7-6ej">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                  data-oid="t5u7_gj"
                >
                  Phone number (optional)
                </label>
                <div className="mt-1 relative" data-oid="o0fx:50">
                  <div
                    className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                    data-oid="dd9noo5"
                  >
                    <Phone
                      className="h-5 w-5 text-gray-400"
                      data-oid="6vwnbny"
                    />
                  </div>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="pl-10"
                    placeholder="Enter your phone number"
                    data-oid="cq8qhmu"
                  />
                </div>
              </div>

              <div data-oid="kh8v7wd">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                  data-oid="k1q7113"
                >
                  Password
                </label>
                <div className="mt-1 relative" data-oid="2tbuxf6">
                  <div
                    className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                    data-oid="57qf5rc"
                  >
                    <Lock
                      className="h-5 w-5 text-gray-400"
                      data-oid=":30g1d2"
                    />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                    placeholder="Create a password"
                    data-oid=":vkefug"
                  />

                  <div
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    data-oid="lpid-jv"
                  >
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600"
                      data-oid="b_k4x3v"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" data-oid="5q6w766" />
                      ) : (
                        <Eye className="h-5 w-5" data-oid="alllydz" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500" data-oid=":v74nd:">
                  Password must be at least 8 characters long
                </p>
              </div>

              <div data-oid="z38b4nq">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                  data-oid="sea1sjk"
                >
                  Confirm password
                </label>
                <div className="mt-1 relative" data-oid="anzt401">
                  <div
                    className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                    data-oid="ixmq-59"
                  >
                    <Lock
                      className="h-5 w-5 text-gray-400"
                      data-oid="8jjg0cc"
                    />
                  </div>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                    placeholder="Confirm your password"
                    data-oid="mez-3sf"
                  />

                  <div
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    data-oid="rig-n-m"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="text-gray-400 hover:text-gray-600"
                      data-oid="85_6w40"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" data-oid="jtddreq" />
                      ) : (
                        <Eye className="h-5 w-5" data-oid="_uwxq08" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center" data-oid="ijb1mvf">
                <Checkbox
                  id="agree-terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) =>
                    setAgreeToTerms(checked as boolean)
                  }
                  data-oid="f1eay.y"
                />

                <label
                  htmlFor="agree-terms"
                  className="ml-2 block text-sm text-gray-900"
                  data-oid="acmla.m"
                >
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-blue-600 hover:text-blue-500"
                    data-oid="a4jj6l1"
                  >
                    Terms and Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-blue-600 hover:text-blue-500"
                    data-oid="08q-mlv"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <div data-oid="_d.k2yr">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                  data-oid="9x4xn.b"
                >
                  {loading ? "Creating account..." : "Create account"}
                </Button>
              </div>
            </form>

            <div className="mt-6" data-oid="n6eda-j">
              <div className="relative" data-oid="riezkzh">
                <div
                  className="absolute inset-0 flex items-center"
                  data-oid=":-19vo2"
                >
                  <div
                    className="w-full border-t border-gray-300"
                    data-oid="t_2luaf"
                  />
                </div>
                <div
                  className="relative flex justify-center text-sm"
                  data-oid="vhzoy_h"
                >
                  <span
                    className="px-2 bg-white text-gray-500"
                    data-oid="kiynl7h"
                  >
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3" data-oid="b-9qr09">
                <Button variant="outline" className="w-full" data-oid="._:-hff">
                  <svg
                    className="w-5 h-5 mr-2"
                    viewBox="0 0 24 24"
                    data-oid=".49y6qh"
                  >
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      data-oid="1bd_gmp"
                    />

                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      data-oid="lnoovou"
                    />

                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      data-oid="2gbuyn-"
                    />

                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      data-oid="jzd650s"
                    />
                  </svg>
                  Google
                </Button>
                <Button variant="outline" className="w-full" data-oid="4kdrimh">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    data-oid="e4ahny4"
                  >
                    <path
                      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                      data-oid="ti4.22j"
                    />
                  </svg>
                  Facebook
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-600" data-oid="vul_sfz">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-blue-600 hover:text-blue-500"
            data-oid="-p7c-o8"
          >
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
