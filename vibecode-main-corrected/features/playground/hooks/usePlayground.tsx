
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { getPlaygroundById, SaveUpdatedCode } from '@/features/playground/actions';
import { syncLocalProject } from '@/features/playground/actions/local-project';
import type { TemplateFolder } from '@/features/playground/libs/path-to-json';

interface PlaygroundData {
  id: string;
  name?: string;
  [key: string]: any;
}

interface UsePlaygroundReturn {
  playgroundData: PlaygroundData | null;
  templateData: TemplateFolder | null;
  isLoading: boolean;
  error: string | null;
  loadPlayground: () => Promise<void>;
  saveTemplateData: (data: TemplateFolder) => Promise<void>;
}

export const usePlayground = (id: string): UsePlaygroundReturn => {
  const [playgroundData, setPlaygroundData] = useState<PlaygroundData | null>(null);
  const [templateData, setTemplateData] = useState<TemplateFolder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlayground = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);

      // Check if this is a direct template name (like 'nextjs-new')
      const templateNames = ['nextjs-new', 'react-ts', 'express-simple', 'vue', 'hono-nodejs-starter', 'angular'];
      const isDirectTemplate = templateNames.includes(id);

      if (isDirectTemplate) {
        // Load template directly without playground ID
        const res = await fetch(`/api/template/direct/${id}`);
        if (!res.ok) throw new Error(`Failed to load template: ${res.status}`);

        const templateRes = await res.json();
        if (templateRes.templateJson && Array.isArray(templateRes.templateJson)) {
          setTemplateData({
            folderName: "Root",
            items: templateRes.templateJson,
          });
        } else {
          setTemplateData(templateRes.templateJson || {
            folderName: "Root",
            items: [],
          });
        }

        // Set mock playground data for direct templates
        setPlaygroundData({
          id: id,
          name: id.charAt(0).toUpperCase() + id.slice(1).replace('-', ' '),
          template: id,
          isDirect: true
        });

        toast.success("Template loaded successfully");
        return;
      }

      // Original logic for playground IDs
      const data = await getPlaygroundById(id);
    //   @ts-ignore
      setPlaygroundData(data);

      const rawContent = data?.templateFiles?.[0]?.content;
      if (typeof rawContent === "string") {
        const parsedContent = JSON.parse(rawContent);
        setTemplateData(parsedContent);
        toast.success("Playground loaded successfully");
        return;
      }

      // Load template from API if not in saved content
      const res = await fetch(`/api/template/${id}`);
      if (!res.ok) throw new Error(`Failed to load template: ${res.status}`);

      const templateRes = await res.json();
      if (templateRes.templateJson && Array.isArray(templateRes.templateJson)) {
        setTemplateData({
          folderName: "Root",
          items: templateRes.templateJson,
        });
      } else {
        setTemplateData(templateRes.templateJson || {
          folderName: "Root",
          items: [],
        });
      }

      toast.success("Template loaded successfully");
    } catch (error) {
      console.error("Error loading playground:", error);
      setError("Failed to load playground data");
      toast.error("Failed to load playground data");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const saveTemplateData = useCallback(async (data: TemplateFolder) => {
    try {
      // Check if this is a direct template (not a saved playground)
      const templateNames = ['nextjs-new', 'react-ts', 'express-simple', 'vue', 'hono-nodejs-starter', 'angular'];
      const isDirectTemplate = templateNames.includes(id);
      
      if (isDirectTemplate) {
        // For direct templates, just update local state (no database save)
        setTemplateData(data);
        toast.success("Changes updated locally (not saved to database)");
        return;
      }
      
      // Check if this is a local project
      if (playgroundData?.localPath) {
        // Sync with local filesystem and update database
        await syncLocalProject(id, data, playgroundData.localPath);
        setTemplateData(data);
        toast.success("Changes saved to local project and database");
        return;
      }
      
      // Original logic for playground IDs
      await SaveUpdatedCode(id, data);
      setTemplateData(data);
      toast.success("Changes saved successfully");
    } catch (error) {
      console.error("Error saving template data:", error);
      toast.error("Failed to save changes");
      throw error;
    }
  }, [id, playgroundData?.localPath]);

  useEffect(() => {
    loadPlayground();
  }, [loadPlayground]);

  return {
    playgroundData,
    templateData,
    isLoading,
    error,
    loadPlayground,
    saveTemplateData,
  };
};