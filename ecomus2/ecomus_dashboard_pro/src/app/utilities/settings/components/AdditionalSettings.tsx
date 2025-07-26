"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Save, Shield } from "lucide-react";
import {
  BlogSettings as BlogSettingsType,
  NewsletterSettings as NewsletterSettingsType,
  CaptchaSettings as CaptchaSettingsType,
  SimpleSlidersSettings as SimpleSliderSettingsType,
} from "../types";

interface AdditionalSettingsProps {
  blogSettings: BlogSettingsType;
  newsletterSettings: NewsletterSettingsType;
  captchaSettings: CaptchaSettingsType;
  sliderSettings: SimpleSliderSettingsType;
  onUpdateBlog: (settings: BlogSettingsType) => void;
  onUpdateNewsletter: (settings: NewsletterSettingsType) => void;
  onUpdateCaptcha: (settings: CaptchaSettingsType) => void;
  onUpdateSlider: (settings: SimpleSliderSettingsType) => void;
  onSaveBlog: () => void;
  onSaveNewsletter: () => void;
  onSaveCaptcha: () => void;
  onSaveSlider: () => void;
  loading: boolean;
}

export const AdditionalSettings = ({
  blogSettings,
  newsletterSettings,
  captchaSettings,
  sliderSettings,
  onUpdateBlog,
  onUpdateNewsletter,
  onUpdateCaptcha,
  onUpdateSlider,
  onSaveBlog,
  onSaveNewsletter,
  onSaveCaptcha,
  onSaveSlider,
  loading,
}: AdditionalSettingsProps) => {
  return (
    <>
      {/* Blog Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Blog</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={blogSettings.enableBlog}
                onCheckedChange={(checked) =>
                  onUpdateBlog({ ...blogSettings, enableBlog: checked })
                }

              />

              <span className="text-sm">
                Enable blog Post (Homepage)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={blogSettings.showSidebar}
                onCheckedChange={(checked) =>
                  onUpdateBlog({ ...blogSettings, showSidebar: checked })
                }

              />

              <span className="text-sm">
                Show blog sidebar (Homepage) for Show Please in blog
              </span>
            </div>
          </div>
          <Button onClick={onSaveBlog} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Newsletter Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Newsletter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                Enable newsletter sections via API?
              </p>
            </div>
            <Switch
              checked={newsletterSettings.enableNewsletterSection}
              onCheckedChange={(checked) =>
                onUpdateNewsletter({
                  ...newsletterSettings,
                  enableNewsletterSection: checked,
                })
              }

            />
          </div>
          <Button
            onClick={onSaveNewsletter}
            disabled={loading}

          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Captcha Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Captcha</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                Enable Captcha
              </p>
            </div>
            <Switch
              checked={captchaSettings.enableCaptcha}
              onCheckedChange={(checked) =>
                onUpdateCaptcha({ ...captchaSettings, enableCaptcha: checked })
              }

            />
          </div>
          <Button onClick={onSaveCaptcha} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Simple Sliders */}
      <Card>
        <CardHeader>
          <CardTitle>Simple sliders</CardTitle>
          <div className="text-sm text-gray-600">
            Simple sliders product
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                Choose default product?
              </p>
              <p className="text-sm text-gray-600">
                Yes
              </p>
            </div>
            <Switch
              checked={sliderSettings.chooseDefaultProduct}
              onCheckedChange={(checked) =>
                onUpdateSlider({
                  ...sliderSettings,
                  chooseDefaultProduct: checked,
                })
              }

            />
          </div>
          <div
            className="p-4 bg-gray-50 rounded text-sm text-gray-600"

          >
            It using simple sliders to get/post data (Simple sliders display in
            e-commerce simple sliders). Note: this feature must be set in a
            timely and stable way, without adding Simple sliders.
          </div>
          <Button onClick={onSaveSlider} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </CardContent>
      </Card>
    </>
  );
};
