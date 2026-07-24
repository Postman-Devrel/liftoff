import { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { getAllModules } from "@/lib/content-loader";
import InlineMarkdown from "@/components/lesson/InlineMarkdown";
import { ranks } from "@/lib/scoring";
import { BASE_PATH, apiPath } from "@/lib/base-path";

async function getAppUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "quickstarts.postman.com";
  const proto = h.get("x-forwarded-proto") || "https";
  return `${proto}://${host}${BASE_PATH}`;
}

interface Props {
  params: Promise<{ type: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type, id } = await params;
  const appUrl = await getAppUrl();

  let title = "LiftOff — Learn APIs by Doing";
  let description = "Interactive learning modules with real-time Postman API validation.";
  let ogTitle = "LiftOff";
  let ogSubtitle = "";
  let badgeUrl = "";

  if (type === "module") {
    const modules = getAllModules();
    const mod = modules.find((m) => m.id === id);
    if (mod) {
      ogTitle = `Module Complete: ${mod.title}`;
      ogSubtitle = mod.description;
      title = `${mod.title} — LiftOff`;
      description = mod.description;
      badgeUrl = `${appUrl}/api/modules/${mod.id}/badge`;
    }
  } else if (type === "rank") {
    const rank = ranks.find((r) => r.id === id);
    if (rank) {
      ogTitle = `Rank: ${rank.title}`;
      ogSubtitle = rank.description;
      title = `${rank.title} — LiftOff`;
      description = rank.description;
      badgeUrl = rank.badgeImgFull
        ? `${appUrl}${rank.badgeImgFull.split("?")[0]}`
        : "";
    }
  }

  const ogParams = new URLSearchParams({ type, title: ogTitle, subtitle: ogSubtitle });
  if (badgeUrl) ogParams.set("badge", badgeUrl);
  const ogImage = `${appUrl}/api/og?${ogParams.toString()}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: ogTitle }],
      siteName: "LiftOff by Postman",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function SharePage({ params }: Props) {
  const { type, id } = await params;

  if (type === "module") {
    const modules = getAllModules();
    const mod = modules.find((m) => m.id === id);
    if (!mod) notFound();

    const totalSteps = mod.lessons.reduce((a, l) => a + l.steps.length, 0);

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full opacity-15 blur-3xl"
            style={{ background: `radial-gradient(circle, ${mod.color}, transparent)` }}
          />
          <div
            className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
            style={{ background: "radial-gradient(circle, #EC4899, transparent)" }}
          />
        </div>

        <div className="relative glass-card p-10 text-center max-w-lg w-full">
          <img
            src={apiPath(`/api/modules/${mod.id}/badge/`)}
            alt={`${mod.title} badge`}
            width={140}
            height={140}
            className="w-[140px] h-[140px] rounded-2xl mx-auto mb-6"
            style={{ boxShadow: `0 0 50px ${mod.color}30` }}
          />

          <h1
            className="text-3xl font-black mb-2"
            style={{
              background: `linear-gradient(135deg, ${mod.color}, #EC4899)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {mod.title}
          </h1>

          <p className="text-[var(--text-secondary)] leading-relaxed mb-2">
            <InlineMarkdown>{mod.description}</InlineMarkdown>
          </p>

          <p className="text-sm text-[var(--text-tertiary)] mb-8">
            {mod.lessons.length} lessons · {totalSteps} steps
          </p>

          <Link
            href={`/modules/${mod.id}`}
            className="btn-primary inline-block text-lg px-8 py-3"
          >
            Get Started
          </Link>

          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="text-2xl font-black"><span className="text-white">Lift</span><span className="gradient-text">Off</span></span>
            <span className="text-sm text-[var(--text-tertiary)]">by Postman</span>
          </div>
        </div>
      </div>
    );
  }

  if (type === "rank") {
    const rank = ranks.find((r) => r.id === id);
    if (!rank) notFound();

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full opacity-15 blur-3xl"
            style={{ background: "radial-gradient(circle, #8B5CF6, transparent)" }}
          />
        </div>

        <div className="relative glass-card p-10 text-center max-w-lg w-full">
          {rank.badgeImgFull ? (
            <img
              src={`${BASE_PATH}${rank.badgeImgFull.split("?")[0]}`}
              alt={rank.title}
              width={160}
              height={160}
              className="w-[160px] h-[160px] mx-auto mb-6"
            />
          ) : (
            <div className="text-7xl mb-6">{rank.badge}</div>
          )}

          <h1
            className="text-3xl font-black mb-2"
            style={{
              background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {rank.title}
          </h1>

          <p className="text-[var(--text-secondary)] leading-relaxed mb-8">
            {rank.description}
          </p>

          <Link href="/" className="btn-primary inline-block text-lg px-8 py-3">
            Start Learning
          </Link>

          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="text-2xl font-black"><span className="text-white">Lift</span><span className="gradient-text">Off</span></span>
            <span className="text-sm text-[var(--text-tertiary)]">by Postman</span>
          </div>
        </div>
      </div>
    );
  }

  notFound();
}
