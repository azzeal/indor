
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Save, Trash2 } from "lucide-react";
import { DeviceLinksForm } from "@/components/DeviceLinksForm";
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
  lovable_description?: string;
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
    lovable_description: device.lovable_description || "",
  });

  // Initialize links from existing device data
  const [linkPairs, setLinkPairs] = useState<LinkPair[]>(() => {
    if (device.url_text && device.actual_url) {
      return [{
        text: device.url_text,
        url: device.actual_url
      }];
    }
    return [{ text: "", url: "" }];
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get the first link for backward compatibility
    const firstLink = linkPairs.find(link => link.text && link.url);
    
    // Remove empty string values and create update object
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
          <Label htmlFor="lovable_description">AI Description</Label>
          <Textarea
            id="lovable_description"
            value={formData.lovable_description}
            onChange={(e) => handleChange("lovable_description", e.target.value)}
            placeholder="AI-generated friendly description..."
            rows={2}
            className="bg-green-50 border-green-200"
          />
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
  );
};
