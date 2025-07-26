"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Palette, Save } from "lucide-react";
import { ThemeSettings as ThemeSettingsType } from "../types";

interface ThemeSettingsProps {
  settings: ThemeSettingsType;
  onUpdate: (settings: ThemeSettingsType) => void;
  onSave: () => void;
  loading: boolean;
}

export const ThemeSettings = ({
  settings,
  onUpdate,
  onSave,
  loading,
}: ThemeSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Palette className="h-5 w-5 text-pink-500" />
          <CardTitle>Theme</CardTitle>
        </div>
        <div className="text-sm text-gray-600">
          Choose theme for changing display
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                Enable set theme page?
              </p>
              <p className="text-sm text-gray-600">
                Yes
              </p>
            </div>
            <Switch
              checked={settings.enableSetTheme}
              onCheckedChange={(checked) =>
                onUpdate({ ...settings, enableSetTheme: checked })
              }

            />
          </div>
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-2"

            >
              Choose theme (no change)
            </label>
            <Select
              value={settings.chooseTheme}
              onValueChange={(value) =>
                onUpdate({ ...settings, chooseTheme: value })
              }

            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="No">
                  No
                </SelectItem>
                <SelectItem value="Dark">
                  Dark
                </SelectItem>
                <SelectItem value="Light">
                  Light
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={settings.additionalFooterText}
              onCheckedChange={(checked) =>
                onUpdate({ ...settings, additionalFooterText: checked })
              }

            />

            <span className="text-sm">
              Show terms for different global footers, and show sidebar links
              too
            </span>
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
