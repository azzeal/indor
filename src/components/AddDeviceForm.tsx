
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SmartDeviceUpload } from "./SmartDeviceUpload";
import { Plus, Minus, Link } from "lucide-react";

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

export const AddDeviceForm = ({ onSubmit }: AddDeviceFormProps) => {
  const [formData, setFormData] = useState<Device>({
    vendor_name: "",
    product_name: "",
    ics_type: "",
    url_text: "",
    actual_url: "",
    details: "",
  });

  const [linkPairs, setLinkPairs] = useState<LinkPair[]>([
    { text: "", url: "" }
  ]);

  const [showSmartUpload, setShowSmartUpload] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine all link pairs into the primary url fields
    const validLinks = linkPairs.filter(pair => pair.text.trim() || pair.url.trim());
    let deviceData = { ...formData };
    
    if (validLinks.length > 0) {
      deviceData.url_text = validLinks[0].text;
      deviceData.actual_url = validLinks[0].url;
      
      // Add additional links to details if more than one
      if (validLinks.length > 1) {
        const additionalLinks = validLinks.slice(1)
          .map(link => `${link.text}: ${link.url}`)
          .join('\n');
        deviceData.details = `${deviceData.details}\n\nAdditional Links:\n${additionalLinks}`.trim();
      }
    }
    
    // Remove empty string values
    const cleanedData = Object.fromEntries(
      Object.entries(deviceData).filter(([_, value]) => value !== "")
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
    setLinkPairs([{ text: "", url: "" }]);
  };

  const handleChange = (field: keyof Device, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSmartExtraction = (extractedData: Device) => {
    setFormData(prev => ({
      ...prev,
      ...extractedData
    }));
    setShowSmartUpload(false);
  };

  const addLinkPair = () => {
    setLinkPairs([...linkPairs, { text: "", url: "" }]);
  };

  const removeLinkPair = (index: number) => {
    if (linkPairs.length > 1) {
      setLinkPairs(linkPairs.filter((_, i) => i !== index));
    }
  };

  const updateLinkPair = (index: number, field: 'text' | 'url', value: string) => {
    const updated = [...linkPairs];
    updated[index][field] = value;
    setLinkPairs(updated);
  };

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Add New Device</span>
        </DialogTitle>
      </DialogHeader>
      
      {showSmartUpload && (
        <SmartDeviceUpload onDeviceExtracted={handleSmartExtraction} />
      )}
      
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
        
        {/* Multiple Links Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Links & References</Label>
            <Button
              type="button"
              onClick={addLinkPair}
              variant="outline"
              size="sm"
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Link
            </Button>
          </div>
          
          {linkPairs.map((pair, index) => (
            <div key={index} className="space-y-2 p-3 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Link className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Link {index + 1}</span>
                </div>
                {linkPairs.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeLinkPair(index)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={pair.text}
                  onChange={(e) => updateLinkPair(index, 'text', e.target.value)}
                  placeholder="Link description"
                />
                <Input
                  type="url"
                  value={pair.url}
                  onChange={(e) => updateLinkPair(index, 'url', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </div>
          ))}
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
