"use client";

import { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CopyableBlockquote, CopyableCode, CopyableCodeBlock } from "./CopyableBlock";

const proseClassName =
	"text-sm text-[var(--text-secondary)] leading-relaxed prose prose-invert prose-sm max-w-none prose-p:my-2 prose-strong:text-white prose-code:text-[var(--text-primary)] prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono prose-code:before:content-none prose-code:after:content-none prose-a:text-[var(--orange)] prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-[var(--orange)] prose-ol:my-3 prose-ol:pl-5 prose-li:my-1.5 prose-pre:overflow-x-auto prose-pre:max-w-full";

interface MarkdownContentProps {
	children: string;
	className?: string;
}

export default function MarkdownContent({
	children,
	className = "",
}: MarkdownContentProps) {
	return (
		<div className={`${proseClassName} ${className}`.trim()}>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				components={{
					pre: CopyableCodeBlock,
					code: CopyableCode,
					blockquote: CopyableBlockquote,
					a: ({ href, children: linkChildren }: { href?: string; children?: ReactNode }) => (
						<a href={href} target="_blank" rel="noopener noreferrer">
							{linkChildren}
						</a>
					),
				}}
			>
				{children}
			</ReactMarkdown>
		</div>
	);
}
