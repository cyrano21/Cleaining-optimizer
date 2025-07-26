"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Zap, Save } from "lucide-react";
import { OptimizePageSpeedSettings as OptimizeSettingsType } from "../types";

interface OptimizeSettingsProps {
  settings: OptimizeSettingsType;
  onUpdate: (settings: OptimizeSettingsType) => void;
  onSave: () => void;
  loading: boolean;
}

export const OptimizeSettings = ({
  settings,
  onUpdate,
  onSave,
  loading,
}: OptimizeSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-green-500" />
          <CardTitle>Optimize page speed</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">
              Enable optimize speed?
            </p>
            <p className="text-sm text-gray-600">
              Yes
            </p>
          </div>
          <Switch
            checked={settings.enableOptimizeSpeed}
            onCheckedChange={(checked) =>
              onUpdate({ ...settings, enableOptimizeSpeed: checked })
            }

          />
        </div>
        <Button onClick={onSave} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Saving..." : "Save changes"}
        </Button>
      </CardContent>
    </Card>
  );
};
