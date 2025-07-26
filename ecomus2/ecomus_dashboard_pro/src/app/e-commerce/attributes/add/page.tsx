"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tags, ArrowLeft } from "lucide-react";

export default function AddAttributePage() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Ici, vous pourriez implémenter la logique pour sauvegarder l'attribut
    // Pour l'instant, nous allons simplement rediriger vers la page des attributs
    router.push("/e-commerce/attributes");
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 mb-2"
                onClick={() => router.push("/e-commerce/attributes")}

              >
                <ArrowLeft className="h-4 w-4" />
                Back to attributes
              </Button>
            </div>
            <h1
              className="text-3xl font-bold flex items-center gap-2"

            >
              <Tags className="h-6 w-6" />
              Add Attribute
            </h1>
            <p className="text-gray-600 mt-1">
              Create a new product attribute with values
            </p>
          </div>
        </div>

        {/* Add Attribute Form */}
        <Card>
          <CardHeader>
            <CardTitle>Attribute Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="space-y-6"

            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="attributeName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Attribute name
                  </label>
                  <Input
                    id="attributeName"
                    placeholder="Attribute name"
                    required

                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="attributeValue" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Attribute value
                    <span
                      className="text-sm text-gray-500 ml-2"

                    >
                      (Separate multiple values with commas)
                    </span>
                  </label>
                  <Textarea
                    id="attributeValue"
                    placeholder="Attribute value"
                    className="min-h-[100px]"
                    required

                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="attributeDescription" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Description (optional)
                  </label>
                  <Textarea
                    id="attributeDescription"
                    placeholder="Enter a description for this attribute"
                    className="min-h-[100px]"

                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/e-commerce/attributes")}

                >
                  Cancel
                </Button>
                <Button type="submit">
                  Save
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
