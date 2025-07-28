import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AIProviderSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const AI_PROVIDERS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'google', label: 'Google' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'ollama', label: 'Ollama' },
  { value: 'huggingface', label: 'Hugging Face' },
];

export function AIProviderSelector({ value, onChange }: AIProviderSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Sélectionner un fournisseur IA" />
      </SelectTrigger>
      <SelectContent>
        {AI_PROVIDERS.map((provider) => (
          <SelectItem key={provider.value} value={provider.value}>
            {provider.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
