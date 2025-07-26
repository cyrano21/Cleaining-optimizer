"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Zap, Save } from "lucide-react";
import { CacheSettings as CacheSettingsType } from "../types";

interface CacheSettingsProps {
  settings: CacheSettingsType;
  onUpdate: (settings: CacheSettingsType) => void;
  onSave: () => void;
  loading: boolean;
}

export const CacheSettings = ({
  settings,
  onUpdate,
  onSave,
  loading,
}: CacheSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          <CardTitle>Cache</CardTitle>
        </div>
        <div className="text-sm text-gray-600">
          Cache config for system cache optimization usage
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                Enable cache?
              </p>
              <p className="text-sm text-gray-600">
                Yes
              </p>
            </div>
            <Switch
              checked={settings.enableCache}
              onCheckedChange={(checked) =>
                onUpdate({ ...settings, enableCache: checked })
              }

            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                Cache auto cleanup
              </p>
              <p className="text-sm text-gray-600">
                Yes
              </p>
            </div>
            <Switch
              checked={settings.cacheAutoCleanup}
              onCheckedChange={(checked) =>
                onUpdate({ ...settings, cacheAutoCleanup: checked })
              }

            />
          </div>
        </div>
        <Button onClick={onSave} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Saving..." : "Save changes"}
        </Button>
      </CardContent>
    </Card>
  );
};
