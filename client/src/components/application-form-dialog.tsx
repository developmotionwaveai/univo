import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { LogIn } from "lucide-react";

interface ApplicationFormProps {
  clubId: string;
  clubName: string;
  onSubmitSuccess?: () => void;
}

export function ApplicationFormDialog({
  clubId,
  clubName,
  onSubmitSuccess,
}: ApplicationFormProps) {
  const [open, setOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!coverLetter.trim()) {
      toast({
        title: "Required",
        description: "Please write a cover letter explaining why you want to join",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/clubs/${clubId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ coverLetter }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit application");
      }

      toast({
        title: "Success! 🎉",
        description: `Your application to join ${clubName} has been submitted. Club officers will review it soon.`,
      });

      setCoverLetter("");
      setOpen(false);
      onSubmitSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <LogIn className="h-4 w-4 mr-2" />
          Apply to Join
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Apply to Join {clubName}</DialogTitle>
          <DialogDescription>
            Tell us why you're interested in joining this club. This helps officers get to know you!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="coverLetter"
              className="block text-sm font-medium"
              style={{ color: "var(--gray-12)" }}
            >
              Why do you want to join?
            </label>
            <Textarea
              id="coverLetter"
              placeholder="Share your interests, goals, or what excites you about this club..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="min-h-32"
            />
            <p className="text-xs" style={{ color: "var(--gray-10)" }}>
              {coverLetter.length}/500 characters
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
