"use client";

import { Fragment, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface InlineMarkdownProps {
	children: string;
}

export default function InlineMarkdown({ children }: InlineMarkdownProps) {
	return (
		<ReactMarkdown
			remarkPlugins={[remarkGfm]}
			components={{
				p: ({ children: paragraphChildren }: { children?: ReactNode }) => (
					<Fragment>{paragraphChildren}</Fragment>
				),
				a: ({ href, children: linkChildren }: { href?: string; children?: ReactNode }) => (
					<a
						href={href}
						target="_blank"
						rel="noopener noreferrer"
						className="underline underline-offset-2 text-[var(--orange)] hover:text-[var(--orange)]"
					>
						{linkChildren}
					</a>
				),
			}}
		>
			{children}
		</ReactMarkdown>
	);
}
