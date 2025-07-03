import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Brain } from 'lucide-react';
import { DeviceLinksForm } from '@/components/DeviceLinksForm';
import { AIExplanationDialog } from '@/components/AIExplanationDialog';

interface AddDeviceFormProps {
  onDeviceAdded: () => void;
  onCancel: () => void;
}

interface LinkPair {
  text: string;
  url: string;
}

const AddDeviceForm: React.FC<AddDeviceFormProps> = ({ onDeviceAdded, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    vendor_name: '',
    product_name: '',
    ics_type: '',
    details: ''
  });
  
  const [linkPairs, setLinkPairs] = useState<LinkPair[]>([{ text: "", url: "" }]);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const firstLink = linkPairs.find(link => link.text && link.url);
      
      const deviceData = {
        ...formData,
        actual_url: firstLink?.url || null,
        url_text: firstLink?.text || null,
      };

      const { error } = await supabase
        .from('devices')
        .insert([deviceData]);

      if (error) {
        console.error('Error adding device:', error);
        toast.error('Failed to add device: ' + error.message);
      } else {
        toast.success('Device added successfully!');
        setFormData({
          vendor_name: '',
          product_name: '',
          ics_type: '',
          details: ''
        });
        setLinkPairs([{ text: "", url: "" }]);
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

  return (
    <>
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
                onChange={(e) => handleInputChange('details', e.target.value)}
                placeholder="Vulnerability details of the device"
                rows={3}
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

      <AIExplanationDialog
        isOpen={isAIDialogOpen}
        onClose={() => setIsAIDialogOpen(false)}
        explanation={aiExplanation}
        isLoading={isAILoading}
      />
    </>
  );
};

export default AddDeviceForm;
