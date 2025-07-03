
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { EditDeviceForm } from "@/components/EditDeviceForm";
import { AIExplanationDialog } from "@/components/AIExplanationDialog";
import { 
  Server, 
  Cpu, 
  Monitor, 
  Zap, 
  ExternalLink, 
  Edit,
  Sparkles,
  Calendar,
  Building,
  Brain
} from "lucide-react";
import { toast } from "sonner";

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

interface DeviceCardProps {
  device: Device;
}

const getDeviceIcon = (icsType?: string) => {
  if (!icsType) return Server;
  
  const type = icsType.toLowerCase();
  if (type.includes('server') || type.includes('http')) return Server;
  if (type.includes('controller') || type.includes('plc')) return Cpu;
  if (type.includes('interface') || type.includes('hmi')) return Monitor;
  if (type.includes('scada') || type.includes('monitor')) return Zap;
  return Server;
};

export const DeviceCard = ({ device }: DeviceCardProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);
  const queryClient = useQueryClient();
  const IconComponent = getDeviceIcon(device.ics_type);

  const updateDeviceMutation = useMutation({
    mutationFn: async (updatedDevice: Partial<Device>) => {
      console.log('Updating device with data:', updatedDevice);
      const { data, error } = await supabase
        .from('devices')
        .update(updatedDevice)
        .eq('id', device.id)
        .select()
        .single();
      
      if (error) {
        console.error('Update error:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      setIsEditDialogOpen(false);
      toast.success("Device updated successfully!");
    },
    onError: (error) => {
      console.error('Error updating device:', error);
      toast.error("Failed to update device");
    },
  });

  const deleteDeviceMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      console.log('Deleting device with ID:', deviceId);
      const { error } = await supabase
        .from('devices')
        .delete()
        .eq('id', deviceId);
      
      if (error) {
        console.error('Delete error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      setIsEditDialogOpen(false);
      toast.success("Device deleted successfully!");
    },
    onError: (error) => {
      console.error('Error deleting device:', error);
      toast.error("Failed to delete device");
    },
  });

  const handleAIExplain = async () => {
    setIsAILoading(true);
    setIsAIDialogOpen(true);
    setAiExplanation('');

    try {
      // Only send the vulnerability text (details field) to n8n
      const vulnerabilityText = device.details || '';

      console.log('Sending vulnerability text to n8n:', vulnerabilityText);

      const response = await fetch('https://muhsofyan.app.n8n.cloud/webhook/6ad2d7fc-c8b4-4e35-bbd2-8aaa0aeb6431', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vulnerability: vulnerabilityText }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('AI explanation result:', result);
      
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

  const handleUpdateDevice = (deviceData: Partial<Device>) => {
    updateDeviceMutation.mutate(deviceData);
  };

  const handleDeleteDevice = (deviceId: string) => {
    deleteDeviceMutation.mutate(deviceId);
  };

  return (
    <>
      <Card className="group hover:shadow-xl transition-all duration-300 bg-white/70 backdrop-blur-sm border-gray-200 hover:border-indigo-300 hover:-translate-y-1">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg group-hover:from-blue-200 group-hover:to-purple-200 transition-colors">
                <IconComponent className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                  {device.product_name}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Building className="h-3 w-3 text-gray-500" />
                  <p className="text-sm text-gray-600 truncate">{device.vendor_name}</p>
                </div>
              </div>
            </div>
            
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <EditDeviceForm 
                  device={device} 
                  onSubmit={handleUpdateDevice}
                  onDelete={handleDeleteDevice}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {device.ics_type && (
            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-200">
              {device.ics_type}
            </Badge>
          )}
          
          {/* AI Description */}
          {device.lovable_description ? (
            <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">AI Description</span>
              </div>
              <p className="text-sm text-emerald-800 leading-relaxed">
                {device.lovable_description}
              </p>
            </div>
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 leading-relaxed">
                {device.details || "No description available"}
              </p>
            </div>
          )}

          {/* AI Explain Button */}
          {device.details && (
            <div className="flex justify-end">
              <Button
                onClick={handleAIExplain}
                variant="outline"
                size="sm"
                disabled={isAILoading}
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                <Brain className="h-4 w-4 mr-2" />
                {isAILoading ? 'Analyzing...' : 'AI Explain Vulnerability'}
              </Button>
            </div>
          )}
          
          {/* URL Link */}
          {device.actual_url && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {device.url_text || "Learn more"}
              </span>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="h-8 px-3 text-xs"
              >
                <a
                  href={device.actual_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Visit</span>
                </a>
              </Button>
            </div>
          )}
          
          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>Added {new Date(device.created_at).toLocaleDateString()}</span>
            </div>
            {device.lovable_description && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                AI Enhanced
              </Badge>
            )}
          </div>
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
