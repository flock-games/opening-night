import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { byPrefixAndName } from "@awesome.me/kit-2f975920ad/icons";
import { useState } from "react";
import { toast } from "react-toastify";

export function FeedbackButton() {
  const sendFeedback = useMutation(api.emails.sendFeedback);
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await sendFeedback({ feedback: feedback.trim() });
      toast.success("Feedback sent successfully! Thank you for your input.");
      setFeedback("");
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to send feedback:", error);
      toast.error("Failed to send feedback. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setFeedback("");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-lg transition-all duration-200 hover:bg-slate-300 dark:hover:bg-slate-600 group  hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
        title="Send feedback"
      >
        <FontAwesomeIcon
          icon={byPrefixAndName.faslr["comment"]}
          size="lg"
          className="transition-transform duration-300 group-hover:scale-110"
        />
      </button>

      {/* Feedback Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Send Feedback
              </h3>
              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <FontAwesomeIcon icon={byPrefixAndName.faslr["times"]} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="feedback"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  What's on your mind?
                </label>
                <textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share your thoughts, suggestions, or report any issues..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-slate-700 dark:text-slate-100 resize-none"
                  rows={4}
                  maxLength={1000}
                  required
                />
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {feedback.length}/1000 characters
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!feedback.trim() || isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:bg-slate-400 disabled:cursor-not-allowed rounded-md transition-colors flex items-center gap-2"
                >
                  {isLoading && (
                    <FontAwesomeIcon
                      icon={byPrefixAndName.faslr["spinner"]}
                      className="animate-spin"
                    />
                  )}
                  Send Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
