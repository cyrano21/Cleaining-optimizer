"use client";

import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          rememberMe,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token in localStorage or cookie
        localStorage.setItem("token", data.token);
        router.push("/");
      } else {
        setError(data.message || "Login failed");
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
      data-oid="6lfhiau"
    >
      <div className="max-w-md w-full space-y-8" data-oid="1ll8iwc">
        <div className="text-center" data-oid="azha2hi">
          <h2
            className="mt-6 text-3xl font-extrabold text-gray-900"
            data-oid="enoawp2"
          >
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600" data-oid="v:a48mm">
            Or{" "}
            <Link
              href="/auth/register"
              className="font-medium text-blue-600 hover:text-blue-500"
              data-oid="gpu2kpo"
            >
              create a new account
            </Link>
          </p>
        </div>

        <Card data-oid="kyya0-3">
          <CardHeader data-oid="8h-.zk.">
            <CardTitle className="text-center" data-oid="pmgfoai">
              Welcome Back
            </CardTitle>
          </CardHeader>
          <CardContent data-oid="7-5qozp">
            <form
              onSubmit={handleSubmit}
              className="space-y-6"
              data-oid="jj1qn1l"
            >
              {error && (
                <div
                  className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm"
                  data-oid="7rduacx"
                >
                  {error}
                </div>
              )}

              <div data-oid="tgmjk3l">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                  data-oid="d:-toat"
                >
                  Email address
                </label>
                <div className="mt-1 relative" data-oid="vp.4279">
                  <div
                    className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                    data-oid="uo77h03"
                  >
                    <Mail
                      className="h-5 w-5 text-gray-400"
                      data-oid="gedz7po"
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
                    placeholder="Enter your email"
                    data-oid="u5ei6rq"
                  />
                </div>
              </div>

              <div data-oid="xj.or3p">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                  data-oid="8rc09oh"
                >
                  Password
                </label>
                <div className="mt-1 relative" data-oid="6u1:jnw">
                  <div
                    className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                    data-oid=":eyxlo7"
                  >
                    <Lock
                      className="h-5 w-5 text-gray-400"
                      data-oid="f1pmw57"
                    />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    placeholder="Enter your password"
                    data-oid="b0cscb2"
                  />

                  <div
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    data-oid="xy3dt6z"
                  >
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600"
                      data-oid="hi8_z39"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" data-oid="_b0bn9a" />
                      ) : (
                        <Eye className="h-5 w-5" data-oid="dpzg8dq" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div
                className="flex items-center justify-between"
                data-oid="emymvd:"
              >
                <div className="flex items-center" data-oid="k67cfvx">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setRememberMe(checked as boolean)
                    }
                    data-oid="wh837rm"
                  />

                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-900"
                    data-oid="9g-dz0n"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm" data-oid="o5crura">
                  <Link
                    href="/auth/forgot-password"
                    className="font-medium text-blue-600 hover:text-blue-500"
                    data-oid="k.n_3ys"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <div data-oid="odhx_2w">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                  data-oid="s3ge5xz"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </div>
            </form>

            <div className="mt-6" data-oid="rfsny4:">
              <div className="relative" data-oid="pkpphpe">
                <div
                  className="absolute inset-0 flex items-center"
                  data-oid="vd0gh2c"
                >
                  <div
                    className="w-full border-t border-gray-300"
                    data-oid="z5g:fjc"
                  />
                </div>
                <div
                  className="relative flex justify-center text-sm"
                  data-oid="qnmmegl"
                >
                  <span
                    className="px-2 bg-white text-gray-500"
                    data-oid="4.19h-."
                  >
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3" data-oid="61aw.2w">
                <Button variant="outline" className="w-full" data-oid="fafdz.s">
                  <svg
                    className="w-5 h-5 mr-2"
                    viewBox="0 0 24 24"
                    data-oid="ch68iiu"
                  >
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      data-oid="yj0if3b"
                    />

                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      data-oid="mck2iyr"
                    />

                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      data-oid="bu5.u-8"
                    />

                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      data-oid="057p_-y"
                    />
                  </svg>
                  Google
                </Button>
                <Button variant="outline" className="w-full" data-oid="zceafc0">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    data-oid="c:k53h2"
                  >
                    <path
                      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                      data-oid="jys4nq4"
                    />
                  </svg>
                  Facebook
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-600" data-oid="3k-fif2">
          Don't have an account?{" "}
          <Link
            href="/auth/register"
            className="font-medium text-blue-600 hover:text-blue-500"
            data-oid="02wn-jp"
          >
            Sign up now
          </Link>
        </div>
      </div>
    </div>
  );
}
