// DRAFT copy for the FAQ and Terms sections. Edit freely; the page renders
// whatever is here. Items about policy we haven't finalized (late arrivals,
// groups, refunds) are worded cautiously. Review before sharing the QR code.
import {
	CONTACT_EMAIL,
	EVENT_ADDRESS,
	EVENT_DATE_LABEL,
	EVENT_LABEL,
	HOURS_LABEL,
	PRICE_LABEL,
	SLOT_LENGTH_MINUTES,
} from "./config";

export type FaqItem = { question: string; answer: string };
export type TermsItem = { title: string; body: string };

export const FAQS: FaqItem[] = [
	{
		question: "When and where is Santa?",
		answer: `${EVENT_DATE_LABEL} at the ${EVENT_LABEL}, ${EVENT_ADDRESS}. Santa is here ${HOURS_LABEL}.`,
	},
	{
		question: "How long is a visit, and what do I get?",
		answer: `Each visit is a ${SLOT_LENGTH_MINUTES}-minute time slot. You'll take home an instant 4×6 print of your photo with Santa.`,
	},
	{
		question: "How much does it cost?",
		answer: `${PRICE_LABEL} per visit, paid online when you reserve your time. Proceeds benefit St. Columba Catholic School.`,
	},
	{
		question: "Do I have to reserve a time?",
		answer:
			"No. Walk-ins are welcome, but reserved times are served first, so booking a spot is the best way to skip the wait.",
	},
	{
		question: "What should I bring?",
		answer:
			"Just your smile! Please bring your confirmation (a screenshot of the “You're booked!” page works) and arrive a few minutes before your time.",
	},
	{
		question: "What if I'm running late?",
		answer:
			"Check in with the Santa photo team when you arrive and we'll fit you in as best we can. Because each slot is short, we can't always hold a time past its start.",
	},
	{
		question: "Can my whole family be in the photo? Do I need more than one time?",
		answer: `A reserved time is for one visit. If you have a larger group or want to book back-to-back times, email ${CONTACT_EMAIL} and we'll help.`,
	},
	{
		question: "How do I change or cancel my time?",
		answer: `Email ${CONTACT_EMAIL} as early as you can with your name and time, and we'll do our best to help.`,
	},
];

export const TERMS: TermsItem[] = [
	{
		title: "Reservations",
		body: "A time is held for 30 minutes while you check out. Your reservation is confirmed once your payment goes through, and each time can be booked by one person only.",
	},
	{
		title: "Payment",
		body: `Each ${SLOT_LENGTH_MINUTES}-minute visit is ${PRICE_LABEL} and includes one instant 4×6 print. Payments are processed securely by Stripe; we never see or store your card details.`,
	},
	{
		title: "Changes and cancellations",
		body: `To change or cancel, email ${CONTACT_EMAIL} as early as you can. Changes, rebooking and refunds are handled case by case.`,
	},
	{
		title: "Arrival and late visits",
		body: "Please arrive a few minutes before your time. If you're late, we'll fit you in as best we can, but we can't guarantee your original time.",
	},
	{
		title: "Walk-ins",
		body: "Walk-ins are accepted when time allows. Reserved times are always served first.",
	},
	{
		title: "Schedule changes",
		body: "Santa's schedule may change because of weather or other circumstances. If it does, we'll contact you using the phone number you gave us.",
	},
	{
		title: "Your information",
		body: "We collect your name and phone number only to manage your reservation and to reach you about your time.",
	},
];
