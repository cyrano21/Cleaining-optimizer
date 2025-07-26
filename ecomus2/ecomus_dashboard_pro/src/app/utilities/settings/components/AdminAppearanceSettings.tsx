"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Palette, Save, Users } from "lucide-react";
import { AdminAppearanceSettings as AdminAppearanceSettingsType } from "../types";

interface AdminAppearanceSettingsProps {
  settings: AdminAppearanceSettingsType;
  onUpdate: (settings: AdminAppearanceSettingsType) => void;
  onSave: () => void;
  loading: boolean;
}

export const AdminAppearanceSettings = ({
  settings,
  onUpdate,
  onSave,
  loading,
}: AdminAppearanceSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Palette className="h-5 w-5 text-purple-500" />
          <CardTitle>Admin appearance</CardTitle>
        </div>
        <div className="text-sm text-gray-600">
          Admin appearance
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"

        >
          <div className="text-center">
            <div
              className="w-16 h-16 bg-blue-100 rounded-lg mx-auto mb-2 flex items-center justify-center"

            >
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-sm font-medium">
              Option 1
            </p>
            <p className="text-xs text-gray-500">
              Current: admin/general
            </p>
          </div>
          <div className="text-center">
            <div
              className="w-16 h-16 bg-green-100 rounded-lg mx-auto mb-2 flex items-center justify-center"

            >
              <Users className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-sm font-medium">
              Option 2
            </p>
            <p className="text-xs text-gray-500">
              Current: general
            </p>
          </div>
          <div className="text-center">
            <div
              className="w-16 h-16 bg-orange-100 rounded-lg mx-auto mb-2 flex items-center justify-center"

            >
              <Users className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-sm font-medium">
              Option 3
            </p>
            <p className="text-xs text-gray-500">
              Current: -
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-2"

            >
              Admin title
            </label>
            <Input
              value={settings.adminTitle}
              onChange={(e) =>
                onUpdate({
                  ...settings,
                  adminTitle: e.target.value,
                })
              }

            />
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"

          >
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"

              >
                Admin language direction
              </label>
              <Select
                value={settings.adminLanguageDirection}
                onValueChange={(value) =>
                  onUpdate({
                    ...settings,
                    adminLanguageDirection: value,
                  })
                }

              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">
                    English
                  </SelectItem>
                  <SelectItem value="Arabic">
                    Arabic
                  </SelectItem>
                  <SelectItem value="French">
                    French
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div
              className="flex items-center space-x-2 pt-6"

            >
              <Switch
                checked={settings.rightToLeft}
                onCheckedChange={(checked) =>
                  onUpdate({
                    ...settings,
                    rightToLeft: checked,
                  })
                }

              />

              <span className="text-sm">
                Right to Left
              </span>
            </div>
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
