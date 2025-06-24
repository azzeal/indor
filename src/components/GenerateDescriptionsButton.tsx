
import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Device {
  id: string;
  vendor_name: string;
  product_name: string;
  ics_type?: string;
  details?: string;
  lovable_description?: string;
}

export const GenerateDescriptionsButton = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [systemPrompt, setSystemPrompt] = useState(
    "You are 'Cy', an enthusiastic and supportive AI assistant for cybersecurity researchers. Create short (1-2 sentences), engaging, and 'lovable' descriptions for devices. Use a cheerful, supportive tone and include 'we' or 'us' in your descriptions. Make technical devices sound approachable and interesting."
  );
  const queryClient = useQueryClient();

  const { data: devicesNeedingDescriptions } = useQuery({
    queryKey: ['devices-needing-descriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('devices')
        .select('id, vendor_name, product_name, ics_type, details, lovable_description')
        .is('lovable_description', null);
      
      if (error) throw error;
      return data as Device[];
    },
  });

  const generateDescriptionsMutation = useMutation({
    mutationFn: async ({ apiKey, systemPrompt }: { apiKey: string; systemPrompt: string }) => {
      if (!devicesNeedingDescriptions || devicesNeedingDescriptions.length === 0) {
        throw new Error("No devices need descriptions");
      }

      const results = [];
      
      for (const device of devicesNeedingDescriptions) {
        try {
          // Create prompt for OpenAI
          const userPrompt = `
Device Information:
- Product: ${device.product_name}
- Vendor: ${device.vendor_name}
- Type: ${device.ics_type || 'Unknown'}
- Details: ${device.details || 'No additional details'}

Create a friendly, engaging description that makes this device sound approachable and interesting:
          `;

          // Call OpenAI API
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: 'gpt-3.5-turbo',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
              ],
              max_tokens: 150,
              temperature: 0.7,
            }),
          });

          if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`);
          }

          const aiResponse = await response.json();
          const generatedText = aiResponse.choices?.[0]?.message?.content?.trim();

          if (generatedText) {
            // Update device with AI description
            const { error } = await supabase
              .from('devices')
              .update({ lovable_description: generatedText })
              .eq('id', device.id);

            if (error) throw error;

            results.push({
              device: device.product_name,
              success: true,
              description: generatedText
            });
          }

          // Add delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          console.error(`Error processing device ${device.product_name}:`, error);
          results.push({
            device: device.product_name,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['devices-needing-descriptions'] });
      setIsDialogOpen(false);
      
      const successCount = results.filter(r => r.success).length;
      const totalCount = results.length;
      
      if (successCount === totalCount) {
        toast.success(`Successfully generated descriptions for all ${successCount} devices!`);
      } else {
        toast.success(`Generated descriptions for ${successCount}/${totalCount} devices`);
      }
    },
    onError: (error) => {
      console.error('Error generating descriptions:', error);
      toast.error(error instanceof Error ? error.message : "Failed to generate descriptions");
    },
  });

  const handleGenerate = () => {
    if (!apiKey.trim()) {
      toast.error("Please enter your OpenAI API key");
      return;
    }

    generateDescriptionsMutation.mutate({ apiKey, systemPrompt });
  };

  const pendingCount = devicesNeedingDescriptions?.length || 0;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="border-purple-200 text-purple-700 hover:bg-purple-50"
          disabled={pendingCount === 0}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Generate AI Descriptions
          {pendingCount > 0 && (
            <span className="ml-2 bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
              {pendingCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5" />
            <span>Generate AI Descriptions</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {pendingCount > 0 ? (
            <>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>{pendingCount}</strong> devices are waiting for AI-generated descriptions.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="api-key">OpenAI API Key *</Label>
                <Input
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  required
                />
                <p className="text-xs text-gray-500">
                  Your API key is only used for this session and not stored.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="system-prompt">AI System Prompt</Label>
                <Textarea
                  id="system-prompt"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={4}
                  className="text-sm"
                />
              </div>
              
              <Button 
                onClick={handleGenerate}
                disabled={generateDescriptionsMutation.isPending || !apiKey.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {generateDescriptionsMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate {pendingCount} Descriptions
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className="text-center py-6">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">All Set!</h3>
              <p className="text-gray-500">
                All your devices already have AI-generated descriptions.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
