"use client";

import MarkdownContent from "@/components/lesson/MarkdownContent";

interface ModuleGettingStartedProps {
	title?: string;
	content: string;
	color: string;
}

export default function ModuleGettingStarted({
	title = "Open LiftOff in Postman",
	content,
	color,
}: ModuleGettingStartedProps) {
	return (
		<div
			className="glass-card p-5 mb-6"
			style={{
				borderLeftWidth: "3px",
				borderLeftColor: color,
				background: `linear-gradient(135deg, ${color}12, transparent)`,
			}}
		>
			<div className="flex items-start gap-3 mb-3">
				<div
					className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-base"
					style={{ background: `${color}20`, color }}
					aria-hidden
				>
					🌐
				</div>
				<h2 className="text-sm font-bold text-white pt-1.5">{title}</h2>
			</div>
			<MarkdownContent>{content}</MarkdownContent>
		</div>
	);
}
