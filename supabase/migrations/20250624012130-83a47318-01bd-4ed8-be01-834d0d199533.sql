
-- Create devices table to store device information and AI-generated descriptions
CREATE TABLE public.devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_name TEXT NOT NULL,
  product_name TEXT NOT NULL,
  ics_type TEXT,
  url_text TEXT,
  actual_url TEXT,
  details TEXT,
  lovable_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) - making it public for demo purposes
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

-- Create policy that allows anyone to view devices (public access)
CREATE POLICY "Anyone can view devices" 
  ON public.devices 
  FOR SELECT 
  USING (true);

-- Create policy that allows anyone to insert devices (for demo purposes)
CREATE POLICY "Anyone can create devices" 
  ON public.devices 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy that allows anyone to update devices (for demo purposes)
CREATE POLICY "Anyone can update devices" 
  ON public.devices 
  FOR UPDATE 
  USING (true);

-- Insert some sample data
INSERT INTO public.devices (vendor_name, product_name, ics_type, details) VALUES 
('Cisco', 'Web Server', 'HTTP Server', 'A web server device commonly used as the main gateway in networks'),
('Siemens', 'PLC Controller', 'Industrial Controller', 'Programmable Logic Controller for industrial automation systems'),
('Schneider Electric', 'Energy Monitor', 'SCADA System', 'Real-time energy monitoring and control system'),
('Rockwell', 'HMI Panel', 'Human Machine Interface', 'Touch screen interface for industrial control systems'),
('ABB', 'Variable Frequency Drive', 'Motor Control', 'Electronic device for controlling motor speed and torque');
