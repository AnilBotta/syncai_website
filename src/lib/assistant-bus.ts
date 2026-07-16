"use client";

/**
 * Tiny event bridge so anything on the page (the header's "Let's talk" button)
 * can open the assistant widget and start a voice call, without hoisting the
 * widget's state into a global provider just for one button.
 */
export const OPEN_VOICE_EVENT = "syncai:open-voice";

/** Opens the assistant on the Voice tab and starts a call with the agent. */
export function requestVoiceCall() {
  window.dispatchEvent(new CustomEvent(OPEN_VOICE_EVENT));
}
