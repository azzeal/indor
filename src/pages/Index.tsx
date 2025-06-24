
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DeviceCard } from "@/components/DeviceCard";
import { AddDeviceForm } from "@/components/AddDeviceForm";
import { GenerateDescriptionsButton } from "@/components/GenerateDescriptionsButton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Zap, Shield } from "lucide-react";
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

const Index = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: devices, isLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching devices:', error);
        throw error;
      }
      
      return data as Device[];
    },
  });

  const addDeviceMutation = useMutation({
    mutationFn: async (newDevice: Omit<Device, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('devices')
        .insert([newDevice])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      setIsAddDialogOpen(false);
      toast.success("Device added successfully!");
    },
    onError: (error) => {
      console.error('Error adding device:', error);
      toast.error("Failed to add device");
    },
  });

  const handleAddDevice = (deviceData: Omit<Device, 'id' | 'created_at' | 'updated_at'>) => {
    addDeviceMutation.mutate(deviceData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading devices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Device Whisperer
                </h1>
                <p className="text-gray-600">AI-Powered Device Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <GenerateDescriptionsButton />
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Device
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <AddDeviceForm onSubmit={handleAddDevice} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Devices</p>
                <p className="text-2xl font-bold text-gray-900">{devices?.length || 0}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Descriptions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {devices?.filter(d => d.lovable_description).length || 0}
                </p>
              </div>
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {devices?.length ? Math.round((devices.filter(d => d.lovable_description).length / devices.length) * 100) : 0}%
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                <span className="text-white text-sm font-bold">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Devices Grid */}
        {devices && devices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map((device) => (
              <DeviceCard key={device.id} device={device} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No devices found</h3>
            <p className="text-gray-500 mb-6">Get started by adding your first device</p>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Device
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <AddDeviceForm onSubmit={handleAddDevice} />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
