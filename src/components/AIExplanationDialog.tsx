
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Brain, X } from "lucide-react";

interface AIExplanationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  explanation: string;
  isLoading: boolean;
}

export const AIExplanationDialog = ({ isOpen, onClose, explanation, isLoading }: AIExplanationDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            AI Vulnerability Explanation
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">AI is analyzing the vulnerability...</span>
            </div>
          ) : (
            <div className="prose max-w-none">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <p className="whitespace-pre-wrap text-gray-800">{explanation}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end mt-6">
          <Button onClick={onClose} variant="outline">
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
