
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { removeBackground, loadImage } from '@/utils/backgroundRemoval';
import { toast } from 'sonner';
import { ImageIcon, Download } from 'lucide-react';

export const BackgroundRemovalTool = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    try {
      console.log('Loading image...');
      const imageElement = await loadImage(file);
      
      console.log('Removing background...');
      const processedBlob = await removeBackground(imageElement);
      
      // Create URL for the processed image
      const url = URL.createObjectURL(processedBlob);
      setProcessedImageUrl(url);
      
      toast.success('Background removed successfully!');
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to remove background. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (processedImageUrl) {
      const link = document.createElement('a');
      link.href = processedImageUrl;
      link.download = 'logo-no-background.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Remove Logo Background</h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="logo-upload" className="cursor-pointer">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">
                Click to upload your logo image
              </p>
              <p className="text-sm text-gray-500 mt-2">
                PNG, JPG up to 10MB
              </p>
            </div>
          </label>
          <input
            id="logo-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            disabled={isProcessing}
          />
        </div>

        {isProcessing && (
          <div className="text-center py-4">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-600">Processing image...</p>
          </div>
        )}

        {processedImageUrl && (
          <div className="space-y-4">
            <div className="text-center">
              <img 
                src={processedImageUrl} 
                alt="Logo with background removed" 
                className="max-w-full h-auto max-h-64 mx-auto rounded-lg shadow-md"
              />
            </div>
            <Button
              onClick={handleDownload}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Logo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
