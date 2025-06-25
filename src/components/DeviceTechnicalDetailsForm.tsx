
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface DeviceTechnicalDetailsFormProps {
  details: string;
  onChange: (value: string) => void;
}

export const DeviceTechnicalDetailsForm = ({ details, onChange }: DeviceTechnicalDetailsFormProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="details">Technical Details</Label>
      <Textarea
        id="details"
        value={details}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Describe the device's functionality and use cases..."
        rows={3}
      />
    </div>
  );
};
