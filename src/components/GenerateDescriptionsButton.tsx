
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

const GEMINI_API_KEY = "AIzaSyC6s1WCHqBh0GVxqZO6RGUqRFWLjHukG_g";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

interface Device {
  id: string;
  vendor_name: string;
  product_name: string;
  ics_type?: string;
  details?: string;
  lovable_description?: string;
}

export const GenerateDescriptionsButton = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  const generateDescription = async (device: Device): Promise<string> => {
    const prompt = `
    Persona: You are 'Cy', an enthusiastic and supportive AI assistant for cybersecurity researchers.
    Task: Create a short (1-2 sentences), engaging, and 'lovable' description for the following device.
    Tone: Cheerful, supportive, and slightly humorous. Use the word 'we' or 'us'.
    
    Device Data:
    - Product Name: ${device.product_name}
    - Vendor: ${device.vendor_name}
    - Type: ${device.ics_type || 'N/A'}
    - Details: ${device.details || 'N/A'}

    Example Output: This is a ${device.product_name} from ${device.vendor_name}, often serving as the main gateway in networks. Let's explore it together!

    Create a 'Lovable' Description:
    `;

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!generatedText) {
        throw new Error('No text generated from Gemini API');
      }

      return generatedText.trim();
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return `Meet the ${device.product_name} from ${device.vendor_name} - a reliable companion in your network infrastructure. Let's discover what makes it special!`;
    }
  };

  const generateDescriptionsMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      
      // Fetch devices without AI descriptions
      const { data: devices, error: fetchError } = await supabase
        .from('devices')
        .select('*')
        .is('lovable_description', null);

      if (fetchError) {
        throw fetchError;
      }

      if (!devices || devices.length === 0) {
        toast.info("All devices already have AI descriptions!");
        return;
      }

      toast.info(`Generating descriptions for ${devices.length} devices...`);

      let successCount = 0;
      let errorCount = 0;

      // Process devices one by one to avoid rate limits
      for (const device of devices) {
        try {
          const description = await generateDescription(device);
          
          const { error: updateError } = await supabase
            .from('devices')
            .update({ lovable_description: description })
            .eq('id', device.id);

          if (updateError) {
            console.error(`Error updating device ${device.id}:`, updateError);
            errorCount++;
          } else {
            successCount++;
          }

          // Add a small delay to respect API rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Error processing device ${device.id}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Generated ${successCount} AI descriptions successfully!`);
      }
      
      if (errorCount > 0) {
        toast.error(`Failed to generate ${errorCount} descriptions`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
    onError: (error) => {
      console.error('Error generating descriptions:', error);
      toast.error("Failed to generate descriptions");
    },
    onSettled: () => {
      setIsGenerating(false);
    },
  });

  return (
    <Button
      onClick={() => generateDescriptionsMutation.mutate()}
      disabled={isGenerating}
      variant="outline"
      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none shadow-lg"
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4 mr-2" />
      )}
      {isGenerating ? 'Generating...' : 'Generate AI Descriptions'}
    </Button>
  );
};
