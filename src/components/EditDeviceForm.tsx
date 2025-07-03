import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Save, Trash2, Brain } from "lucide-react";
import { DeviceLinksForm } from "@/components/DeviceLinksForm";
import { AIExplanationDialog } from "@/components/AIExplanationDialog";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Device {
  id: string;
  vendor_name: string;
  product_name: string;
  ics_type?: string;
  url_text?: string;
  actual_url?: string;
  details?: string;
  created_at: string;
  updated_at: string;
}

interface EditDeviceFormProps {
  device: Device;
  onSubmit: (device: Partial<Device>) => void;
  onDelete: (deviceId: string) => void;
}

interface LinkPair {
  text: string;
  url: string;
}

const ICS_TYPES = [
  "HTTP Server",
  "Industrial Controller",
  "SCADA System",
  "Human Machine Interface",
  "Motor Control",
  "Network Device",
  "Sensor",
  "Other"
];

export const EditDeviceForm = ({ device, onSubmit, onDelete }: EditDeviceFormProps) => {
  const [formData, setFormData] = useState({
    vendor_name: device.vendor_name,
    product_name: device.product_name,
    ics_type: device.ics_type || "",
    details: device.details || "",
  });

  const [linkPairs, setLinkPairs] = useState<LinkPair[]>(() => {
    if (device.url_text && device.actual_url) {
      return [{
        text: device.url_text,
        url: device.actual_url
      }];
    }
    return [{ text: "", url: "" }];
  });

  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const firstLink = linkPairs.find(link => link.text && link.url);
    
    const updateData = Object.fromEntries(
      Object.entries({
        ...formData,
        url_text: firstLink?.text || null,
        actual_url: firstLink?.url || null,
      }).filter(([_, value]) => value !== "" && value !== null)
    );
    
    console.log('Submitting update data:', updateData);
    onSubmit(updateData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAIExplain = async () => {
    if (!formData.vendor_name || !formData.product_name) {
      toast.error('Please fill in vendor name and product name first');
      return;
    }

    setIsAILoading(true);
    setIsAIDialogOpen(true);
    setAiExplanation('');

    try {
      const deviceData = {
        vendor_name: formData.vendor_name,
        product_name: formData.product_name,
        ics_type: formData.ics_type,
        details: formData.details,
        url_text: linkPairs[0]?.text || '',
        actual_url: linkPairs[0]?.url || ''
      };

      console.log('Sending device data to n8n:', deviceData);

      const response = await fetch('https://muhsofyan.app.n8n.cloud/webhook-test/6ad2d7fc-c8b4-4e35-bbd2-8aaa0aeb6431', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deviceData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('AI explanation result:', result);
      
      // Assuming the n8n webhook returns the explanation in a field called 'explanation' or 'result'
      const explanation = result.explanation || result.result || result.output || 'AI explanation received but format is unclear.';
      setAiExplanation(explanation);
      
    } catch (error) {
      console.error('Error getting AI explanation:', error);
      setAiExplanation('Failed to get AI explanation. Please try again.');
      toast.error('Failed to get AI explanation');
    } finally {
      setIsAILoading(false);
    }
  };

  const handleAddLink = () => {
    setLinkPairs(prev => [...prev, { text: "", url: "" }]);
  };

  const handleRemoveLink = (index: number) => {
    setLinkPairs(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateLink = (index: number, field: 'text' | 'url', value: string) => {
    setLinkPairs(prev => prev.map((link, i) => 
      i === index ? { ...link, [field]: value } : link
    ));
  };

  const handleDelete = () => {
    console.log('Deleting device:', device.id);
    onDelete(device.id);
  };

  return (
    <>
      <div className="space-y-6">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Edit className="h-5 w-5" />
            <span>Edit Device</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendor_name">Vendor Name *</Label>
              <Input
                id="vendor_name"
                value={formData.vendor_name}
                onChange={(e) => handleChange("vendor_name", e.target.value)}
                placeholder="e.g., Cisco, Siemens"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="product_name">Product Name *</Label>
              <Input
                id="product_name"
                value={formData.product_name}
                onChange={(e) => handleChange("product_name", e.target.value)}
                placeholder="e.g., Web Server, PLC Controller"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ics_type">Device Type</Label>
            <Select value={formData.ics_type} onValueChange={(value) => handleChange("ics_type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select device type" />
              </SelectTrigger>
              <SelectContent>
                {ICS_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DeviceLinksForm
            linkPairs={linkPairs}
            onAddLink={handleAddLink}
            onRemoveLink={handleRemoveLink}
            onUpdateLink={handleUpdateLink}
          />
          
          <div className="space-y-2">
            <Label htmlFor="details">Vulnerability</Label>
            <Textarea
              id="details"
              value={formData.details}
              onChange={(e) => handleChange("details", e.target.value)}
              placeholder="Vulnerability details..."
              rows={2}
            />
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAIExplain}
                disabled={isAILoading}
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                <Brain className="h-4 w-4 mr-2" />
                {isAILoading ? 'Analyzing...' : 'AI Explain Vulnerability'}
              </Button>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  type="button" 
                  variant="destructive"
                  className="px-4"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Device</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{device.product_name}" by {device.vendor_name}? 
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Device
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </form>
      </div>

      <AIExplanationDialog
        isOpen={isAIDialogOpen}
        onClose={() => setIsAIDialogOpen(false)}
        explanation={aiExplanation}
        isLoading={isAILoading}
      />
    </>
  );
};
