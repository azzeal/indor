
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

interface Device {
  vendor_name: string;
  product_name: string;
  ics_type?: string;
  url_text?: string;
  actual_url?: string;
  details?: string;
}

interface AddDeviceFormProps {
  onSubmit: (device: Device) => void;
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

export const AddDeviceForm = ({ onSubmit }: AddDeviceFormProps) => {
  const [formData, setFormData] = useState<Device>({
    vendor_name: "",
    product_name: "",
    ics_type: "",
    url_text: "",
    actual_url: "",
    details: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Remove empty string values
    const cleanedData = Object.fromEntries(
      Object.entries(formData).filter(([_, value]) => value !== "")
    );
    
    onSubmit(cleanedData as Device);
    
    // Reset form
    setFormData({
      vendor_name: "",
      product_name: "",
      ics_type: "",
      url_text: "",
      actual_url: "",
      details: "",
    });
  };

  const handleChange = (field: keyof Device, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Add New Device</span>
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
        
        <div className="space-y-2">
          <Label htmlFor="details">Technical Details</Label>
          <Textarea
            id="details"
            value={formData.details}
            onChange={(e) => handleChange("details", e.target.value)}
            placeholder="Describe the device's functionality and use cases..."
            rows={3}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="url_text">Link Text</Label>
            <Input
              id="url_text"
              value={formData.url_text}
              onChange={(e) => handleChange("url_text", e.target.value)}
              placeholder="e.g., Documentation, Datasheet"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="actual_url">URL</Label>
            <Input
              id="actual_url"
              type="url"
              value={formData.actual_url}
              onChange={(e) => handleChange("actual_url", e.target.value)}
              placeholder="https://example.com"
            />
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Device
        </Button>
      </form>
    </div>
  );
};
