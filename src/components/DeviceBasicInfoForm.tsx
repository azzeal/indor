
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Device {
  vendor_name: string;
  product_name: string;
  ics_type?: string;
}

interface DeviceBasicInfoFormProps {
  formData: Device;
  onChange: (field: keyof Device, value: string) => void;
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

export const DeviceBasicInfoForm = ({ formData, onChange }: DeviceBasicInfoFormProps) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vendor_name">Vendor Name *</Label>
          <Input
            id="vendor_name"
            value={formData.vendor_name}
            onChange={(e) => onChange("vendor_name", e.target.value)}
            placeholder="e.g., Cisco, Siemens"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="product_name">Product Name *</Label>
          <Input
            id="product_name"
            value={formData.product_name}
            onChange={(e) => onChange("product_name", e.target.value)}
            placeholder="e.g., Web Server, PLC Controller"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="ics_type">Device Type</Label>
        <Select value={formData.ics_type} onValueChange={(value) => onChange("ics_type", value)}>
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
    </>
  );
};
