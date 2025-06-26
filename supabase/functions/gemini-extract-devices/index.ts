
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, fileContent, fileName } = await req.json();
    
    const apiKey = 'AIzaSyBUZdegzDnJS901kyZpmrCxuRc2qIBuAvY';
    
    let fullPrompt = `
You are an expert in industrial control systems (ICS) and IoT devices. Extract device information from the provided text or file content and return it as a JSON array of devices.

Each device should have these fields:
- vendor_name (string, required): The manufacturer/vendor name
- product_name (string, required): The product/model name
- ics_type (string, optional): Type of device (PLC, HMI, SCADA, Controller, Sensor, etc.)
- url_text (string, optional): Description text for any URL/link
- actual_url (string, optional): The actual URL if mentioned
- details (string, optional): Additional technical details
- lovable_description (string, optional): A friendly description of the device

Return ONLY a valid JSON array, no other text. Example:
[
  {
    "vendor_name": "Siemens",
    "product_name": "SIMATIC S7-1200",
    "ics_type": "PLC",
    "details": "Compact controller for discrete and continuous control",
    "lovable_description": "A reliable programmable logic controller perfect for automation tasks"
  }
]

User input: ${prompt}
${fileContent ? `\nFile content (${fileName}): ${fileContent}` : ''}
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates[0]?.content?.parts[0]?.text || '';
    
    let devices = [];
    try {
      // Try to extract JSON from the response
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        devices = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: try to parse the entire response
        devices = JSON.parse(generatedText);
      }
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      console.log('Raw response:', generatedText);
      
      // Fallback: create a simple device from the prompt
      devices = [{
        vendor_name: "Unknown",
        product_name: prompt.slice(0, 50) || "Extracted Device",
        ics_type: "Industrial Device",
        details: generatedText,
        lovable_description: "Device extracted from AI analysis"
      }];
    }

    // Ensure devices is an array
    if (!Array.isArray(devices)) {
      devices = [devices];
    }

    // Validate and clean up devices
    devices = devices.map(device => ({
      vendor_name: device.vendor_name || "Unknown",
      product_name: device.product_name || "Unknown Device",
      ics_type: device.ics_type || undefined,
      url_text: device.url_text || undefined,
      actual_url: device.actual_url || undefined,
      details: device.details || undefined,
      lovable_description: device.lovable_description || undefined,
    })).filter(device => device.vendor_name && device.product_name);

    return new Response(JSON.stringify({ devices }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in gemini-extract-devices function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      devices: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
