import { v } from "convex/values";
import { components, internal } from "./_generated/api";
import { internalMutation, mutation } from "./_generated/server";
import { vEmailId, vEmailEvent, Resend } from "@convex-dev/resend";

export const resend: Resend = new Resend(components.resend, {
  testMode: false,
  onEmailEvent: internal.emails.handleEmailEvent,
});

export const sendSuggestionDismissedEmail = mutation({
  args: { userTrailerId: v.id("userTrailers") },
  handler: async (ctx, args) => {
    await resend.sendEmail(ctx, {
      from: "Test <onboarding@resend.dev>",
      to: "tyler@flock.games",
      subject: "Suggestion dismissed",
      html: `The suggestion "${args.userTrailerId}" was dismissed.`,
    });
  },
});

export const handleEmailEvent = internalMutation({
  args: {
    id: vEmailId,
    event: vEmailEvent,
  },
  handler: async (_, args) => {
    console.log("Got called back!", args.id, args.event);
    // Probably do something with the event if you care about deliverability!
  },
});
