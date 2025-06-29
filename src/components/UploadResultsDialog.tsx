
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";

interface Device {
  vendor_name: string;
  product_name: string;
  ics_type?: string;
  url_text?: string;
  actual_url?: string;
  details?: string;
}

interface UploadResultsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  results: Device[];
  onDevicesAdded: () => void;
}

export const UploadResultsDialog = ({ 
  isOpen, 
  onClose, 
  results, 
  onDevicesAdded 
}: UploadResultsDialogProps) => {
  const [devices, setDevices] = useState<Device[]>(results);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = (index: number) => {
    setEditingIndex(index);
  };

  const handleSaveEdit = (index: number, updatedDevice: Device) => {
    const newDevices = [...devices];
    newDevices[index] = updatedDevice;
    setDevices(newDevices);
    setEditingIndex(null);
  };

  const handleDelete = (index: number) => {
    const newDevices = devices.filter((_, i) => i !== index);
    setDevices(newDevices);
  };

  const handleAddAll = async () => {
    if (devices.length === 0) {
      toast.error("No devices to add");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('devices')
        .insert(devices);

      if (error) {
        console.error('Error adding devices:', error);
        toast.error('Failed to add devices: ' + error.message);
      } else {
        toast.success(`Successfully added ${devices.length} device(s)`);
        onDevicesAdded();
        onClose();
      }
    } catch (error) {
      console.error('Error adding devices:', error);
      toast.error('Failed to add devices');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Upload Results - {devices.length} Device(s) Found
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {devices.map((device, index) => (
            <Card key={index} className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {device.vendor_name} - {device.product_name}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(index)}
                      size="sm"
                      variant="outline"
                      disabled={editingIndex === index}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(index)}
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editingIndex === index ? (
                  <EditDeviceForm
                    device={device}
                    onSave={(updatedDevice) => handleSaveEdit(index, updatedDevice)}
                    onCancel={() => setEditingIndex(null)}
                  />
                ) : (
                  <DevicePreview device={device} />
                )}
              </CardContent>
            </Card>
          ))}

          {devices.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No devices to display
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={handleAddAll}
              disabled={isSubmitting || devices.length === 0}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {isSubmitting ? 'Adding Devices...' : `Add All ${devices.length} Device(s)`}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const DevicePreview = ({ device }: { device: Device }) => (
  <div className="grid grid-cols-2 gap-4 text-sm">
    <div>
      <p className="font-medium text-gray-700">Vendor:</p>
      <p>{device.vendor_name}</p>
    </div>
    <div>
      <p className="font-medium text-gray-700">Product:</p>
      <p>{device.product_name}</p>
    </div>
    <div>
      <p className="font-medium text-gray-700">ICS Type:</p>
      <p>{device.ics_type || 'Not specified'}</p>
    </div>
    <div>
      <p className="font-medium text-gray-700">URL:</p>
      <p className="truncate">{device.actual_url || 'Not specified'}</p>
    </div>
    {device.details && (
      <div className="col-span-2">
        <p className="font-medium text-gray-700">Details:</p>
        <p className="text-gray-600">{device.details}</p>
      </div>
    )}
  </div>
);

const EditDeviceForm = ({ 
  device, 
  onSave, 
  onCancel 
}: { 
  device: Device; 
  onSave: (device: Device) => void; 
  onCancel: () => void; 
}) => {
  const [formData, setFormData] = useState(device);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: keyof Device, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vendor_name">Vendor Name *</Label>
          <Input
            id="vendor_name"
            value={formData.vendor_name}
            onChange={(e) => handleChange('vendor_name', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="product_name">Product Name *</Label>
          <Input
            id="product_name"
            value={formData.product_name}
            onChange={(e) => handleChange('product_name', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ics_type">ICS Type</Label>
          <Input
            id="ics_type"
            value={formData.ics_type || ''}
            onChange={(e) => handleChange('ics_type', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="actual_url">URL</Label>
          <Input
            id="actual_url"
            value={formData.actual_url || ''}
            onChange={(e) => handleChange('actual_url', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="url_text">URL Description</Label>
        <Input
          id="url_text"
          value={formData.url_text || ''}
          onChange={(e) => handleChange('url_text', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="details">Details</Label>
        <Textarea
          id="details"
          value={formData.details || ''}
          onChange={(e) => handleChange('details', e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="sm">
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        <Button type="button" onClick={onCancel} variant="outline" size="sm">
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </form>
  );
};
