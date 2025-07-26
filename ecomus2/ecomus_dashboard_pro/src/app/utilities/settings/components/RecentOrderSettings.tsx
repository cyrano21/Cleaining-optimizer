"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, BarChart3, Save } from "lucide-react";
import { RecentOrderSettings as RecentOrderSettingsType } from "../types";

interface RecentOrderSettingsProps {
  settings: RecentOrderSettingsType;
  onUpdate: (settings: RecentOrderSettingsType) => void;
  onSave: () => void;
  loading: boolean;
}

export const RecentOrderSettings = ({
  settings,
  onUpdate,
  onSave,
  loading,
}: RecentOrderSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-orange-500" />
          <CardTitle>Recent Order</CardTitle>
        </div>
        <div
          className="flex items-center space-x-2 text-sm text-orange-600"

        >
          <AlertCircle className="h-4 w-4" />
          <span>
            See System in loaded, Please activate your license!
          </span>
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
              Your operations
            </label>
            <Input
              value={settings.operations}
              onChange={(e) =>
                onUpdate({
                  ...settings,
                  operations: e.target.value,
                })
              }
              placeholder="Enter your operations"

            />
          </div>
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-2"

            >
              Purchase code
            </label>
            <div className="flex space-x-2">
              <Input
                value={settings.purchaseCode}
                onChange={(e) =>
                  onUpdate({
                    ...settings,
                    purchaseCode: e.target.value,
                  })
                }
                placeholder="Enter your purchase code"

              />

              <Button variant="outline">
                Verify Now
              </Button>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={settings.showTimestamp}
            onCheckedChange={(checked) =>
              onUpdate({ ...settings, showTimestamp: checked })
            }

          />

          <span className="text-sm">
            Show time add vs 5 minutes
          </span>
        </div>
        <Button onClick={onSave} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Saving..." : "Save changes"}
        </Button>
      </CardContent>
    </Card>
  );
};
