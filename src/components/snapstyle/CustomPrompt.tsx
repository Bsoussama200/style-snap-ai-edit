
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface CustomPromptProps {
  customPrompt: string;
  onCustomPromptChange: (value: string) => void;
}

const CustomPrompt: React.FC<CustomPromptProps> = ({
  customPrompt,
  onCustomPromptChange
}) => {
  return (
    <Card className="glass-card max-w-2xl mx-auto">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Custom Prompt (Optional)</h2>
        <textarea
          value={customPrompt}
          onChange={(e) => onCustomPromptChange(e.target.value)}
          placeholder="Enter your custom styling instructions here... (leave empty to use selected style)"
          className="w-full h-24 p-3 border rounded-lg resize-none"
        />
      </CardContent>
    </Card>
  );
};

export default CustomPrompt;
