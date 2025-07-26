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
import { Globe, Save } from "lucide-react";
import { GeneralInfoSettings as GeneralInfoSettingsType } from "../types";

interface GeneralInfoSettingsProps {
  settings: GeneralInfoSettingsType;
  onUpdate: (settings: GeneralInfoSettingsType) => void;
  onSave: () => void;
  loading: boolean;
}

export const GeneralInfoSettings = ({
  settings,
  onUpdate,
  onSave,
  loading,
}: GeneralInfoSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Globe className="h-5 w-5 text-gray-500" />
          <CardTitle>General Information</CardTitle>
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
              Admin email
            </label>
            <Input
              type="email"
              value={settings.adminEmail}
              onChange={(e) =>
                onUpdate({
                  ...settings,
                  adminEmail: e.target.value,
                })
              }

            />
          </div>
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-2"

            >
              Timezone
            </label>
            <Select
              value={settings.timezone}
              onValueChange={(value) =>
                onUpdate({ ...settings, timezone: value })
              }

            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">
                  UTC
                </SelectItem>
                <SelectItem value="America/New_York">
                  Eastern Time
                </SelectItem>
                <SelectItem value="America/Los_Angeles">
                  Pacific Time
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={settings.rtlLanguage}
            onCheckedChange={(checked) =>
              onUpdate({ ...settings, rtlLanguage: checked })
            }

          />

          <span className="text-sm">
            You can add vs in 5 minutes
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
