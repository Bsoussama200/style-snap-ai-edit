
import React from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ResultDisplayProps {
  generatedImage: string;
  originalImage: string;
  onDownload: () => void;
  onReset: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({
  generatedImage,
  originalImage,
  onDownload,
  onReset
}) => {
  return (
    <Card className="glass-card max-w-2xl mx-auto">
      <CardContent className="p-6 space-y-4">
        <h2 className="text-2xl font-semibold text-center">
          Your Styled Image
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Original</p>
            <img 
              src={originalImage} 
              alt="Original" 
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Styled</p>
            <img 
              src={generatedImage} 
              alt="Generated" 
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={onDownload} className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Download Image
          </Button>
          <Button onClick={onReset} variant="outline" className="flex-1">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Another
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultDisplay;
