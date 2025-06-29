
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

interface AddDeviceFormProps {
  onDeviceAdded: () => void;
  onCancel: () => void;
}

const AddDeviceForm: React.FC<AddDeviceFormProps> = ({ onDeviceAdded, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    vendor_name: '',
    product_name: '',
    ics_type: '',
    actual_url: '',
    url_text: '',
    details: '',
    lovable_description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('devices')
        .insert([formData]);

      if (error) {
        console.error('Error adding device:', error);
        toast.error('Failed to add device: ' + error.message);
      } else {
        toast.success('Device added successfully!');
        setFormData({
          vendor_name: '',
          product_name: '',
          ics_type: '',
          actual_url: '',
          url_text: '',
          details: '',
          lovable_description: ''
        });
        onDeviceAdded();
      }
    } catch (error) {
      console.error('Error adding device:', error);
      toast.error('Failed to add device');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add New Device
        </CardTitle>
        <CardDescription>
          Enter the details of the ICS device you want to add to the repository
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendor_name">Vendor Name *</Label>
              <Input
                id="vendor_name"
                value={formData.vendor_name}
                onChange={(e) => handleInputChange('vendor_name', e.target.value)}
                placeholder="e.g., Siemens, Schneider Electric"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="product_name">Product Name *</Label>
              <Input
                id="product_name"
                value={formData.product_name}
                onChange={(e) => handleInputChange('product_name', e.target.value)}
                placeholder="e.g., SIMATIC S7-1200"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ics_type">ICS Type</Label>
            <Input
              id="ics_type"
              value={formData.ics_type}
              onChange={(e) => handleInputChange('ics_type', e.target.value)}
              placeholder="e.g., PLC, HMI, SCADA"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="actual_url">Device URL</Label>
            <Input
              id="actual_url"
              type="url"
              value={formData.actual_url}
              onChange={(e) => handleInputChange('actual_url', e.target.value)}
              placeholder="https://example.com/device"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url_text">URL Description</Label>
            <Input
              id="url_text"
              value={formData.url_text}
              onChange={(e) => handleInputChange('url_text', e.target.value)}
              placeholder="Brief description of the URL"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Technical Details</Label>
            <Textarea
              id="details"
              value={formData.details}
              onChange={(e) => handleInputChange('details', e.target.value)}
              placeholder="Enter technical specifications, protocols, ports, etc."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lovable_description">Description</Label>
            <Textarea
              id="lovable_description"
              value={formData.lovable_description}
              onChange={(e) => handleInputChange('lovable_description', e.target.value)}
              placeholder="General description of the device"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Adding Device...' : 'Add Device'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddDeviceForm;
