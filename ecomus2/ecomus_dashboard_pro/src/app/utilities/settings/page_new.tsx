"use client";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { useSettings } from "./useSettings";
import {
  RecentOrderSettings,
  GeneralInfoSettings,
  AdminAppearanceSettings,
  CacheSettings,
  DatabaseSettings,
  ThemeSettings,
  OptimizeSettings,
  ContactAndAnalyticsSettings,
  AdditionalSettings,
} from "./components";

export default function UtilitiesSettingsPage() {
  const { settings, loading, updateSettings, handleSave, isSectionSaved } =
    useSettings();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-3xl font-bold tracking-tight"

            >
              Settings
            </h1>
            <p className="text-gray-600 mt-1">
              Configure system settings and preferences
            </p>
          </div>
        </div>

        {/* Recent Order Settings */}
        <RecentOrderSettings
          settings={settings.recentOrder}
          onUpdate={(newSettings) => updateSettings("recentOrder", newSettings)}
          onSave={() => handleSave("recentOrder")}
          loading={loading}

        />

        {/* General Information */}
        <GeneralInfoSettings
          settings={settings.generalInfo}
          onUpdate={(newSettings) => updateSettings("generalInfo", newSettings)}
          onSave={() => handleSave("generalInfo")}
          loading={loading}

        />

        {/* Admin Appearance */}
        <AdminAppearanceSettings
          settings={settings.adminAppearance}
          onUpdate={(newSettings) =>
            updateSettings("adminAppearance", newSettings)
          }
          onSave={() => handleSave("adminAppearance")}
          loading={loading}

        />

        {/* Cache Settings */}
        <CacheSettings
          settings={settings.cache}
          onUpdate={(newSettings) => updateSettings("cache", newSettings)}
          onSave={() => handleSave("cache")}
          loading={loading}

        />

        {/* Database Settings */}
        <DatabaseSettings
          settings={settings.database}
          onUpdate={(newSettings) => updateSettings("database", newSettings)}
          onSave={() => handleSave("database")}
          loading={loading}

        />

        {/* Optimize Page Speed */}
        <OptimizeSettings
          settings={settings.optimizePageSpeed}
          onUpdate={(newSettings) =>
            updateSettings("optimizePageSpeed", newSettings)
          }
          onSave={() => handleSave("optimizePageSpeed")}
          loading={loading}

        />

        {/* Theme Settings */}
        <ThemeSettings
          settings={settings.theme}
          onUpdate={(newSettings) => updateSettings("theme", newSettings)}
          onSave={() => handleSave("theme")}
          loading={loading}

        />

        {/* Contact & Google Analytics */}
        <ContactAndAnalyticsSettings
          contactSettings={settings.contact}
          analyticsSettings={settings.googleAnalytics}
          onUpdateContact={(newSettings) =>
            updateSettings("contact", newSettings)
          }
          onUpdateAnalytics={(newSettings) =>
            updateSettings("googleAnalytics", newSettings)
          }
          onSaveContact={() => handleSave("contact")}
          onSaveAnalytics={() => handleSave("googleAnalytics")}
          loading={loading}

        />

        {/* Additional Settings (Blog, Newsletter, Captcha, Simple Sliders) */}
        <AdditionalSettings
          blogSettings={settings.blog}
          newsletterSettings={settings.newsletter}
          captchaSettings={settings.captcha}
          sliderSettings={settings.simpleSliders}
          onUpdateBlog={(newSettings) => updateSettings("blog", newSettings)}
          onUpdateNewsletter={(newSettings) =>
            updateSettings("newsletter", newSettings)
          }
          onUpdateCaptcha={(newSettings) =>
            updateSettings("captcha", newSettings)
          }
          onUpdateSlider={(newSettings) =>
            updateSettings("simpleSliders", newSettings)
          }
          onSaveBlog={() => handleSave("blog")}
          onSaveNewsletter={() => handleSave("newsletter")}
          onSaveCaptcha={() => handleSave("captcha")}
          onSaveSlider={() => handleSave("simpleSliders")}
          loading={loading}

        />
      </div>
    </DashboardLayout>
  );
}
