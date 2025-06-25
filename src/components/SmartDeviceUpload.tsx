
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SmartDeviceUploadProps {
  onDeviceExtracted: (deviceData: any) => void;
}

export const SmartDeviceUpload = ({ onDeviceExtracted }: SmartDeviceUploadProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [narrative, setNarrative] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a PDF or image file (JPEG, PNG)");
        return;
      }
      setUploadedFile(file);
      toast.success(`File "${file.name}" uploaded successfully`);
    }
  };

  const processWithAI = async () => {
    if (!uploadedFile && !narrative.trim()) {
      toast.error("Please upload a file or provide a narrative description");
      return;
    }

    setIsProcessing(true);

    try {
      // For now, we'll simulate AI processing and extract device info from narrative
      // In a real implementation, you would send the file/narrative to an AI service
      
      let deviceData = {};
      
      if (narrative.trim()) {
        // Simple keyword extraction from narrative (you can enhance this with actual AI)
        const text = narrative.toLowerCase();
        
        // Extract vendor name
        const vendors = ['cisco', 'siemens', 'schneider', 'rockwell', 'ge', 'honeywell', 'abb'];
        const foundVendor = vendors.find(vendor => text.includes(vendor));
        
        // Extract device types
        const types = ['plc', 'scada', 'hmi', 'controller', 'sensor', 'motor', 'drive'];
        const foundType = types.find(type => text.includes(type));
        
        deviceData = {
          vendor_name: foundVendor ? foundVendor.charAt(0).toUpperCase() + foundVendor.slice(1) : "",
          product_name: foundType ? `${foundType.toUpperCase()} Device` : "Industrial Device",
          ics_type: foundType ? foundType.charAt(0).toUpperCase() + foundType.slice(1) : "Industrial Controller",
          details: narrative.trim(),
          lovable_description: `This device was identified from your description: "${narrative.slice(0, 100)}${narrative.length > 100 ? '...' : ''}"`
        };
      }

      // If file is uploaded, we could extract text from PDF or analyze image
      if (uploadedFile) {
        deviceData = {
          ...deviceData,
          details: `${deviceData.details || ''}\n\nFile uploaded: ${uploadedFile.name}`.trim()
        };
      }

      onDeviceExtracted(deviceData);
      setNarrative("");
      setUploadedFile(null);
      toast.success("Device information extracted successfully!");
      
    } catch (error) {
      console.error('Error processing with AI:', error);
      toast.error("Failed to process the information");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white/60 backdrop-blur-sm">
      <div className="flex items-center space-x-2 mb-3">
        <Upload className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Smart Device Detection</h3>
      </div>
      
      <div className="space-y-4">
        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="file-upload">Upload Device Documentation</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="file-upload"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="flex-1"
            />
            {uploadedFile && (
              <div className="flex items-center space-x-1 text-sm text-green-600">
                {uploadedFile.type.includes('pdf') ? <FileText className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                <span>{uploadedFile.name}</span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500">Upload PDF manuals, datasheets, or device images</p>
        </div>
        
        {/* Narrative Description */}
        <div className="space-y-2">
          <Label htmlFor="narrative">Describe Your Device</Label>
          <Textarea
            id="narrative"
            value={narrative}
            onChange={(e) => setNarrative(e.target.value)}
            placeholder="Describe the device you want to add. Include vendor, model, type, and any relevant details..."
            rows={4}
            className="bg-white/60"
          />
        </div>
        
        <Button 
          onClick={processWithAI}
          disabled={isProcessing || (!uploadedFile && !narrative.trim())}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Extract Device Info
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
