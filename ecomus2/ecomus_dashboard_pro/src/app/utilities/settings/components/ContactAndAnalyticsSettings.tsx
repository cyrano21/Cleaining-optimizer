"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Save, BarChart3 } from "lucide-react";
import {
  ContactSettings as ContactSettingsType,
  GoogleAnalyticsSettings as AnalyticsSettingsType,
} from "../types";

interface ContactAndAnalyticsSettingsProps {
  contactSettings: ContactSettingsType;
  analyticsSettings: AnalyticsSettingsType;
  onUpdateContact: (settings: ContactSettingsType) => void;
  onUpdateAnalytics: (settings: AnalyticsSettingsType) => void;
  onSaveContact: () => void;
  onSaveAnalytics: () => void;
  loading: boolean;
}

export const ContactAndAnalyticsSettings = ({
  contactSettings,
  analyticsSettings,
  onUpdateContact,
  onUpdateAnalytics,
  onSaveContact,
  onSaveAnalytics,
  loading,
}: ContactAndAnalyticsSettingsProps) => {
  return (
    <>
      {/* Contact Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-blue-500" />
            <CardTitle>Contact</CardTitle>
          </div>
          <div className="text-sm text-gray-600">
            Contact setting for configuration
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"

          >
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"

              >
                Workday keywords
              </label>
              <Button variant="outline" className="w-full">
                <span className="mr-2">
                  📤
                </span>
                Send file +
              </Button>
              <div
                className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-600"

              >
                <span className="mr-1">
                  ℹ️
                </span>
                Some content messages for employees keywords to be added. Please
                keywords in blog entries/internal
              </div>
            </div>
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"

              >
                Workday email domains
              </label>
              <Button variant="outline" className="w-full">
                <span className="mr-2">
                  📤
                </span>
                Send file +
              </Button>
              <div
                className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-600"

              >
                <span className="mr-1">
                  ℹ️
                </span>
                Some content messages for employees keywords to be added. Please
                keywords in blog entries/internal
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-500">
              ✓
            </span>
            <span className="text-sm text-green-600">
              Enable contact form validation
            </span>
          </div>
          <Button onClick={onSaveContact} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Google Analytics */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-orange-500" />
            <CardTitle>Google Analytics</CardTitle>
          </div>
          <div className="text-sm text-gray-600">
            Google measurement ID for Google Analytics.
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"

          >
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"

              >
                Google Tag ID
              </label>
              <Input
                value={analyticsSettings.googleTagId}
                onChange={(e) =>
                  onUpdateAnalytics({
                    ...analyticsSettings,
                    googleTagId: e.target.value,
                  })
                }
                placeholder="Enter your Google Tag ID"

              />
            </div>
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"

              >
                Property Data
              </label>
              <Input
                value={analyticsSettings.propertyData}
                onChange={(e) =>
                  onUpdateAnalytics({
                    ...analyticsSettings,
                    propertyData: e.target.value,
                  })
                }
                placeholder="Enter your Property ID here"

              />
            </div>
          </div>
          <Button
            onClick={onSaveAnalytics}
            disabled={loading}

          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </CardContent>
      </Card>
    </>
  );
};
