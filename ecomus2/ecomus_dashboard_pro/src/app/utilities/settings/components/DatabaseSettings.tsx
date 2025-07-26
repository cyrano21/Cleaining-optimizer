"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Database, Save } from "lucide-react";
import { DatabaseSettings as DatabaseSettingsType } from "../types";

interface DatabaseSettingsProps {
  settings: DatabaseSettingsType;
  onUpdate: (settings: DatabaseSettingsType) => void;
  onSave: () => void;
  loading: boolean;
}

export const DatabaseSettings = ({
  settings,
  onUpdate,
  onSave,
  loading,
}: DatabaseSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Database className="h-5 w-5 text-blue-500" />
          <CardTitle>Database</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                Default store created method?
              </p>
              <p className="text-sm text-gray-600">
                No
              </p>
            </div>
            <Switch
              checked={settings.defaultStoreCreatedMethod}
              onCheckedChange={(checked) =>
                onUpdate({
                  ...settings,
                  defaultStoreCreatedMethod: checked,
                })
              }

            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                Default store select method
              </p>
              <p className="text-sm text-gray-600">
                No
              </p>
            </div>
            <Switch
              checked={settings.defaultStoreSelectMethod}
              onCheckedChange={(checked) =>
                onUpdate({
                  ...settings,
                  defaultStoreSelectMethod: checked,
                })
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
