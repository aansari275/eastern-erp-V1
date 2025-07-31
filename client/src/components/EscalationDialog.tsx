import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { useToast } from '../hooks/use-toast';
import { AlertTriangle, Mail, Shield } from 'lucide-react';
import { apiRequest } from '../lib/queryClient';

interface EscalationDialogProps {
  inspectionId: string;
  inspection: any;
  trigger: React.ReactNode;
  onEscalationSent?: () => void;
}

const EscalationDialog: React.FC<EscalationDialogProps> = ({
  inspectionId,
  inspection,
  trigger,
  onEscalationSent
}) => {
  const [open, setOpen] = useState(false);
  const [approverEmail, setApproverEmail] = useState('');
  const [escalationReason, setEscalationReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Pre-defined escalation contacts based on company
  const escalationContacts = {
    EHI: [
      { email: 'quality.manager@easternmills.com', title: 'Quality Manager' },
      { email: 'zakir@easternmills.com', title: 'General Manager' }
    ],
    EMPL: [
      { email: 'quality.manager@easternmills.com', title: 'Quality Manager' },
      { email: 'operations@easternmills.com', title: 'Operations Manager' }
    ]
  };

  const company = inspection?.company || 'EHI';
  const contacts = escalationContacts[company as keyof typeof escalationContacts] || escalationContacts.EHI;

  const handleSendEscalation = async () => {
    if (!approverEmail || !escalationReason.trim()) {
      toast({
        title: "❌ Missing Information",
        description: "Please select an approver and provide an escalation reason.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest('/api/escalations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inspectionId,
          approverEmail,
          escalationReason
        })
      });

      toast({
        title: "✅ Escalation Sent",
        description: `Escalation email sent to ${approverEmail} with approve/fail buttons.`,
        duration: 5000
      });

      setOpen(false);
      setApproverEmail('');
      setEscalationReason('');
      onEscalationSent?.();

    } catch (error) {
      console.error('❌ Escalation error:', error);
      toast({
        title: "❌ Escalation Failed",
        description: "Failed to send escalation email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Escalate Failed Inspection
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Inspection Summary */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <h4 className="font-medium text-red-800 mb-2">Inspection Details</h4>
            <div className="text-sm text-red-700 space-y-1">
              <p><span className="font-medium">ID:</span> {inspectionId}</p>
              <p><span className="font-medium">Material:</span> {inspection?.materialType || 'Not specified'}</p>
              <p><span className="font-medium">Supplier:</span> {inspection?.supplierName || 'Not specified'}</p>
              <p><span className="font-medium">Company:</span> {company}</p>
            </div>
          </div>

          {/* Approver Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Select Approver
            </label>
            <Select value={approverEmail} onValueChange={setApproverEmail}>
              <SelectTrigger>
                <SelectValue placeholder="Choose escalation contact..." />
              </SelectTrigger>
              <SelectContent>
                {contacts.map((contact) => (
                  <SelectItem key={contact.email} value={contact.email}>
                    {contact.title} ({contact.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Escalation Reason */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Escalation Reason</label>
            <Textarea
              placeholder="Explain why this inspection failed and requires escalation..."
              value={escalationReason}
              onChange={(e) => setEscalationReason(e.target.value)}
              rows={3}
            />
          </div>

          {/* Email Preview */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Preview
            </h4>
            <div className="text-sm text-blue-700">
              <p>The recipient will receive an email with:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>✅ <span className="font-medium">Approve</span> button (green)</li>
                <li>❌ <span className="font-medium">Fail</span> button (red)</li>
                <li>Complete inspection details and reasoning</li>
                <li>Direct action links (no login required)</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendEscalation}
              disabled={isLoading || !approverEmail || !escalationReason.trim()}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Send Escalation
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EscalationDialog;