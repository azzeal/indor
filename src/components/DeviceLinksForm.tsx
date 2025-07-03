
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Minus, Link } from "lucide-react";

interface LinkPair {
  text: string;
  url: string;
}

interface DeviceLinksFormProps {
  linkPairs: LinkPair[];
  onAddLink: () => void;
  onRemoveLink: (index: number) => void;
  onUpdateLink: (index: number, field: 'text' | 'url', value: string) => void;
}

export const DeviceLinksForm = ({ 
  linkPairs, 
  onAddLink, 
  onRemoveLink, 
  onUpdateLink 
}: DeviceLinksFormProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Source</Label>
        <Button
          type="button"
          onClick={onAddLink}
          variant="outline"
          size="sm"
          className="text-blue-600 border-blue-600 hover:bg-blue-50"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Link
        </Button>
      </div>
      
      {linkPairs.map((pair, index) => (
        <div key={index} className="space-y-2 p-3 border rounded-lg bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Link {index + 1}</span>
            </div>
            {linkPairs.length > 1 && (
              <Button
                type="button"
                onClick={() => onRemoveLink(index)}
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Minus className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Input
              value={pair.text}
              onChange={(e) => onUpdateLink(index, 'text', e.target.value)}
              placeholder="Link description"
            />
            <Input
              type="url"
              value={pair.url}
              onChange={(e) => onUpdateLink(index, 'url', e.target.value)}
              placeholder="https://example.com"
            />
          </div>
        </div>
      ))}
    </div>
  );
};
