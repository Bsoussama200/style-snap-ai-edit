
import React from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ImageUploadProps {
  previewUrls: string[];
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  previewUrls,
  onImageUpload,
  fileInputRef
}) => {
  return (
    <Card className="glass-card max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Upload Product Images</h2>
          
          {previewUrls.length === 0 ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Click to upload your product images
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Supports JPG, JPEG, PNG (multiple files allowed)
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {previewUrls.map((url, index) => (
                  <img 
                    key={index}
                    src={url} 
                    alt={`Preview ${index + 1}`} 
                    className="w-full h-24 object-cover rounded-lg"
                  />
                ))}
              </div>
              <Button 
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full"
              >
                Change Images
              </Button>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png"
            multiple
            onChange={onImageUpload}
            className="hidden"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageUpload;
