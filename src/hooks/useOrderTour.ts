import { useState } from 'react'
import { useJoyride, STATUS } from 'react-joyride'
import type { Status as StatusType } from 'react-joyride'

const TOUR_COMPLETED_KEY = 'kimchi-train:tour-completed'

const steps = [
	{
		target: '[data-tour="name-input"]',
		content: 'Enter your name here so everyone knows which items are yours. This is saved for next time!',
		title: 'Step 1 — Set your name',
		placement: 'bottom' as const,
	},
	{
		target: '[data-tour="dish-menu-1"]',
		content: 'Browse the menu and tap any dish to add it to your order.',
		title: 'Step 2 — Pick your dishes',
		placement: 'right' as const,
	},
	{
		target: '[data-tour="order-summary"]',
		content: 'Your selected items appear here with the running total.',
		title: 'Step 3 — Review your order',
		placement: 'left' as const,
	},
	{
		target: '[data-tour="complete-btn"]',
		content:
			"Once you've called in the order, mark it complete. This locks the order and lets you track who has paid you back.",
		title: 'Step 4 — Complete & collect',
		placement: 'bottom' as const,
	},
	{
		target: '[data-tour="share-btn"]',
		content: 'Share this link with others so they can add their orders too.',
		title: 'Step 5 — Share with friends',
		placement: 'bottom' as const,
	},
]

function markTourCompleted() {
	try {
		localStorage.setItem(TOUR_COMPLETED_KEY, '1')
	} catch {}
}

export function useOrderTour() {
	const [runTour, setRunTour] = useState(() => {
		try {
			return !localStorage.getItem(TOUR_COMPLETED_KEY)
		} catch {
			return true
		}
	})

	const { Tour, controls } = useJoyride({
		continuous: true,
		run: runTour,
		options: {
			primaryColor: '#f87171',
			backgroundColor: '#292524',
			textColor: '#fafaf9',
			arrowColor: '#292524',
			buttons: ['back', 'close', 'primary', 'skip'],
			skipBeacon: true,
			closeButtonAction: 'skip',
			overlayClickAction: 'next',
		},
		steps,
		onEvent: (data) => {
			if (([STATUS.FINISHED, STATUS.SKIPPED] as unknown as StatusType).includes(data.status)) {
				setRunTour(false)
				markTourCompleted()
				return
			}

			if (data.type === 'step:after' && data.action === 'close' && data.origin === 'overlay') {
				controls.skip()
			}
		},
	})

	return { Tour, restartTour: () => controls.reset(true) }
}
