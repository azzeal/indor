
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Bot, Upload, FileText, Image as ImageIcon, Loader2, Send, Edit, Plus, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Device {
  vendor_name: string;
  product_name: string;
  ics_type?: string;
  url_text?: string;
  actual_url?: string;
  details?: string;
  lovable_description?: string;
}

interface AIDeviceExtractorProps {
  onDevicesExtracted: (devices: Device[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  devices?: Device[];
}

export const AIDeviceExtractor = ({ onDevicesExtracted, isOpen, onClose }: AIDeviceExtractorProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I can help you extract device information from files or descriptions. Please upload a file or describe the devices you want to add.'
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedDevices, setExtractedDevices] = useState<Device[]>([]);
  const [editingDeviceIndex, setEditingDeviceIndex] = useState<number | null>(null);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'text/plain'];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a PDF, image, or text file");
        return;
      }
      setUploadedFile(file);
      toast.success(`File "${file.name}" uploaded successfully`);
    }
  };

  const processWithGemini = async (prompt: string, fileContent?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-extract-devices', {
        body: {
          prompt,
          fileContent,
          fileName: uploadedFile?.name
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      return data?.devices || [];
    } catch (error) {
      console.error('Error processing with Gemini:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() && !uploadedFile) {
      toast.error("Please enter a message or upload a file");
      return;
    }

    setIsProcessing(true);
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: userInput || `Uploaded file: ${uploadedFile?.name}`
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      let fileContent = '';
      if (uploadedFile) {
        if (uploadedFile.type === 'text/plain') {
          fileContent = await uploadedFile.text();
        } else {
          // For images and PDFs, we'll send the file info to Gemini
          fileContent = `File type: ${uploadedFile.type}, Size: ${uploadedFile.size} bytes`;
        }
      }

      const devices = await processWithGemini(userInput, fileContent || undefined);
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: devices.length > 0 
          ? `I found ${devices.length} device(s) from your input. Please review them below and click "Add Selected Devices" when ready.`
          : "I couldn't extract any devices from the provided information. Could you provide more details about the devices?",
        devices: devices
      };

      setMessages(prev => [...prev, assistantMessage]);
      setExtractedDevices(devices);
      setUserInput("");
      setUploadedFile(null);
      
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: "Sorry, I encountered an error processing your request. Please try again."
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error("Failed to process with AI");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditDevice = (index: number) => {
    setEditingDeviceIndex(index);
    setEditingDevice({ ...extractedDevices[index] });
  };

  const handleSaveEdit = () => {
    if (editingDeviceIndex !== null && editingDevice) {
      const updatedDevices = [...extractedDevices];
      updatedDevices[editingDeviceIndex] = editingDevice;
      setExtractedDevices(updatedDevices);
      setEditingDeviceIndex(null);
      setEditingDevice(null);
      toast.success("Device updated successfully");
    }
  };

  const handleAddDevices = () => {
    if (extractedDevices.length > 0) {
      onDevicesExtracted(extractedDevices);
      setExtractedDevices([]);
      setMessages([{
        role: 'assistant',
        content: 'Devices added successfully! You can continue adding more devices or close this dialog.'
      }]);
      toast.success(`${extractedDevices.length} device(s) added successfully!`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-blue-600" />
            <span>Fill Device with AI</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 border rounded-lg p-4 bg-gray-50">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white border shadow-sm'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  
                  {/* Display extracted devices */}
                  {message.devices && message.devices.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.devices.map((device, deviceIndex) => (
                        <Card key={deviceIndex} className="bg-gray-50">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm">{device.product_name}</CardTitle>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditDevice(deviceIndex)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-1 text-xs">
                              <p><strong>Vendor:</strong> {device.vendor_name}</p>
                              {device.ics_type && <p><strong>Type:</strong> {device.ics_type}</p>}
                              {device.details && <p><strong>Details:</strong> {device.details}</p>}
                              {device.actual_url && <p><strong>URL:</strong> {device.actual_url}</p>}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      <Button
                        onClick={handleAddDevices}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Selected Devices ({message.devices.length})
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="space-y-3 border-t pt-4">
            {/* File Upload */}
            <div className="flex items-center space-x-2">
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.txt"
                onChange={handleFileUpload}
                className="flex-1"
              />
              {uploadedFile && (
                <Badge variant="secondary" className="text-xs">
                  {uploadedFile.type.includes('pdf') ? <FileText className="h-3 w-3 mr-1" /> : <ImageIcon className="h-3 w-3 mr-1" />}
                  {uploadedFile.name}
                </Badge>
              )}
            </div>

            {/* Text Input */}
            <div className="flex space-x-2">
              <Textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Describe the devices or ask questions about the uploaded file..."
                className="flex-1"
                rows={2}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isProcessing || (!userInput.trim() && !uploadedFile)}
                className="self-end"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Edit Device Modal */}
        {editingDevice && (
          <Dialog open={editingDeviceIndex !== null} onOpenChange={() => {
            setEditingDeviceIndex(null);
            setEditingDevice(null);
          }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Device</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Vendor Name</label>
                  <Input
                    value={editingDevice.vendor_name}
                    onChange={(e) => setEditingDevice({...editingDevice, vendor_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Product Name</label>
                  <Input
                    value={editingDevice.product_name}
                    onChange={(e) => setEditingDevice({...editingDevice, product_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">ICS Type</label>
                  <Input
                    value={editingDevice.ics_type || ""}
                    onChange={(e) => setEditingDevice({...editingDevice, ics_type: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Details</label>
                  <Textarea
                    value={editingDevice.details || ""}
                    onChange={(e) => setEditingDevice({...editingDevice, details: e.target.value})}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleSaveEdit} className="flex-1">
                    <Check className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
};
