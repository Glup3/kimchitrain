import type { ZeroOptions } from '@rocicorp/zero'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { HeadContent, Link, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { ArrowLeft } from 'lucide-react'
import { lazy } from 'react'

import { schema } from '#/db/zero-schema'
import { env } from '#/env'
import { mutators } from '#/lib/mutators'

import appCss from '../styles.css?url'

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: 'utf-8',
			},
			{
				name: 'viewport',
				content: 'width=device-width, initial-scale=1',
			},
			{
				title: 'TanStack Start Starter',
			},
		],
		links: [
			{
				rel: 'stylesheet',
				href: appCss,
			},
		],
	}),
	shellComponent: RootDocument,
	notFoundComponent: NotFound,
})

const ZeroProvider = lazy(() =>
	import('@rocicorp/zero/react').then((mod) => ({
		default: mod.ZeroProvider,
	})),
)

const opts: ZeroOptions = {
	userID: 'anon',
	cacheURL: env.VITE_ZERO_SERVER,
	schema,
	mutators,
}

function NotFound() {
	return (
		<div className="mx-auto w-[min(1080px,calc(100%-2rem))] py-8">
			<Link to="/" className="flex items-center gap-1.5 text-sm text-(--lagoon-deep) no-underline">
				<ArrowLeft size={16} />
				Back to orders
			</Link>
			<p className="mt-4 text-base text-(--sea-ink-soft)">Page not found</p>
		</div>
	)
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
				<HeadContent />
			</head>
			<body className="font-sans wrap-anywhere antialiased selection:bg-[rgba(79,184,178,0.24)]">
				<ZeroProvider {...opts}>{children}</ZeroProvider>
				<TanStackDevtools
					config={{
						position: 'bottom-right',
					}}
					plugins={[
						{
							name: 'Tanstack Router',
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	)
}
