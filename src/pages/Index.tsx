
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DeviceCard } from "@/components/DeviceCard";
import { AddDeviceForm } from "@/components/AddDeviceForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Zap, LogOut, Search, User } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();
  const { user, signOut } = useAuth();

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

  // Filter devices based on search term
  const filteredDevices = devices?.filter(device =>
    device.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.ics_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.lovable_description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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

  const handleLogout = async () => {
    await signOut();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <img 
            src="/lovable-uploads/ec22ca17-2f59-43ab-920c-1c050143ecb5.png" 
            alt="Loading" 
            className="h-12 w-12 animate-spin mx-auto mb-4" 
          />
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
                <img 
                  src="/lovable-uploads/ec22ca17-2f59-43ab-920c-1c050143ecb5.png" 
                  alt="Indor Logo" 
                  className="h-8 w-8" 
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Indor
                </h1>
                <p className="text-gray-600">ICS Dork Repository</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user?.email}</span>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="text-gray-600 hover:text-gray-800"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Device
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <AddDeviceForm onSubmit={handleAddDevice} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search and Stats */}
        <div className="mb-8 space-y-6">
          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search devices by vendor, product, type, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/60 backdrop-blur-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Devices</p>
                  <p className="text-2xl font-bold text-gray-900">{devices?.length || 0}</p>
                </div>
                <img 
                  src="/lovable-uploads/ec22ca17-2f59-43ab-920c-1c050143ecb5.png" 
                  alt="Device Icon" 
                  className="h-8 w-8" 
                />
              </div>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Smart Descriptions</p>
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
                  <p className="text-sm font-medium text-gray-600">Search Results</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredDevices.length}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                  <Search className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Devices Grid */}
        {filteredDevices && filteredDevices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDevices.map((device) => (
              <DeviceCard key={device.id} device={device} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <img 
              src="/lovable-uploads/ec22ca17-2f59-43ab-920c-1c050143ecb5.png" 
              alt="No devices" 
              className="h-16 w-16 mx-auto mb-4 opacity-60" 
            />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm ? 'No devices found' : 'No devices found'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? `No devices match your search "${searchTerm}"`
                : 'Get started by adding your first device'
              }
            </p>
            {!searchTerm && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Device
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <AddDeviceForm onSubmit={handleAddDevice} />
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
