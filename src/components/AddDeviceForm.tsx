
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DeviceBasicInfoForm } from "./DeviceBasicInfoForm";
import { DeviceTechnicalDetailsForm } from "./DeviceTechnicalDetailsForm";
import { DeviceLinksForm } from "./DeviceLinksForm";
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

interface LinkPair {
  text: string;
  url: string;
}

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
    
    // Create clean device object ensuring required fields are present
    const cleanedData: Device = {
      vendor_name: deviceData.vendor_name || "",
      product_name: deviceData.product_name || "",
      ...(deviceData.ics_type && { ics_type: deviceData.ics_type }),
      ...(deviceData.url_text && { url_text: deviceData.url_text }),
      ...(deviceData.actual_url && { actual_url: deviceData.actual_url }),
      ...(deviceData.details && { details: deviceData.details }),
    };
    
    onSubmit(cleanedData);
    
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
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <DeviceBasicInfoForm 
          formData={formData} 
          onChange={handleChange}
        />
        
        <DeviceTechnicalDetailsForm 
          details={formData.details || ""} 
          onChange={(value) => handleChange("details", value)}
        />
        
        <DeviceLinksForm 
          linkPairs={linkPairs}
          onAddLink={addLinkPair}
          onRemoveLink={removeLinkPair}
          onUpdateLink={updateLinkPair}
        />
        
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
