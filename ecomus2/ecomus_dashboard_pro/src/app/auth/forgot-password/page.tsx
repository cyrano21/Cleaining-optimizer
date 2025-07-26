"use client";

import { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || "Failed to send reset email");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"

      >
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div
              className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center"

            >
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <h2
              className="mt-6 text-3xl font-extrabold text-gray-900"

            >
              Check your email
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We've sent a password reset link to {email}
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                <div className="space-y-2">                  <Button
                    onClick={() => {
                      setSuccess(false);
                      setEmail("");
                    }}
                    className="w-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  >
                    Try again
                  </Button>                  <Link href="/auth/signin" className="block">                    <Button
                      className="w-full hover:bg-gray-100 text-gray-600"
                      asChild
                    >
                      <span>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to sign in
                      </span>
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"

    >
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2
            className="mt-6 text-3xl font-extrabold text-gray-900"

          >
            Forgot your password?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            No worries! Enter your email address and we'll send you a link to
            reset your password.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              Reset Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="space-y-6"

            >
              {error && (
                <div
                  className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm"

                >
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"

                >
                  Email address
                </label>
                <div className="mt-1 relative">
                  <div
                    className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"

                  >
                    <Mail
                      className="h-5 w-5 text-gray-400"

                    />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="Enter your email address"

                  />
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}

                >
                  {loading ? "Sending..." : "Send reset link"}
                </Button>
              </div>
            </form>

            <div className="mt-6">              <Link href="/auth/signin">
                <Button className="w-full hover:bg-gray-100 text-gray-600">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to sign in
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            href="/auth/register"
            className="font-medium text-blue-600 hover:text-blue-500"

          >
            Sign up now
          </Link>
        </div>
      </div>
    </div>
  );
}
