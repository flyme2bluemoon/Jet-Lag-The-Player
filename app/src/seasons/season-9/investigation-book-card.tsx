"use client";

import Image from "next/image";
import { BookOpen, Check, Clock3, Coins, ImageIcon, X } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { InvestigationMap } from "./investigation-map";
import {
    formatSeasonNineTimestamp,
    type InvestigationQuestion,
    type QuestionCategory,
    type SeasonNineState,
} from "./timeline-data";

const CATEGORY_STYLES: Record<QuestionCategory, string> = {
    relative: "border-question-relative/35 bg-question-relative/15 text-question-relative dark:border-paper/35 dark:bg-question-relative dark:text-paper",
    radar: "border-question-radar/35 bg-question-radar/15 text-question-radar dark:border-paper/35 dark:bg-question-radar/20 dark:text-question-radar",
    photo: "border-question-photo/35 bg-question-photo/15 text-question-photo dark:border-paper/35 dark:bg-question-photo/20 dark:text-question-photo",
    oddball: "border-question-oddball/35 bg-question-oddball/15 text-question-oddball dark:border-paper/35 dark:bg-question-oddball/20 dark:text-question-oddball",
    precision: "border-question-precision/35 bg-question-precision/15 text-question-precision dark:border-paper/35 dark:bg-question-precision/20 dark:text-question-precision",
    unknown: "border-control/35 bg-control/10 text-control dark:border-paper/35 dark:bg-paper/10 dark:text-paper",
};

function getQuestionTitle(question: InvestigationQuestion) {
    switch (question.category) {
        case "radar":
            return `${question.label.replace(/\bmiles\b/gi, "mile")} Radar`;
        case "photo":
            return `Photo of ${question.label}`;
        default:
            return question.description;
    }
}

function QuestionResponse({ question }: { question: InvestigationQuestion }) {
    if (question.status === "waiting" || question.status === "received") {
        return (
            <p className="text-card-meta mt-3 flex items-center gap-2 text-sm">
                <Clock3 className="size-4" aria-hidden="true" />
                {question.status === "waiting" ? "Waiting for response" : "Response incoming"}
            </p>
        );
    }

    return (
        <div className="mt-3">
            <p className={cn(
                "flex items-start gap-2 text-sm font-medium",
                question.status === "vetoed" ? "text-jet-lag-red" : "text-foreground",
            )}>
                {question.status === "vetoed"
                    ? <X className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    : <Check className="text-jet-lag-green mt-0.5 size-4 shrink-0" aria-hidden="true" />}
                <span>{question.response}</span>
            </p>
            {question.responseAsset && (
                <Accordion type="single" collapsible className="mt-2">
                    <AccordionItem value="photo" className="border-none">
                        <AccordionTrigger className="text-card-meta hover:text-foreground py-1.5 text-xs font-semibold no-underline hover:no-underline">
                            <span className="flex items-center gap-2"><ImageIcon className="size-3.5" aria-hidden="true" />View photo response</span>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 pb-0">
                            <div className="border-paper/20 bg-surface relative mx-auto aspect-video w-full max-w-sm overflow-hidden rounded-lg border">
                                <Image
                                    src={question.responseAsset}
                                    alt={`Hider response to ${question.label}`}
                                    fill
                                    sizes="(max-width: 640px) calc(100vw - 5rem), 24rem"
                                    className="object-cover"
                                />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            )}
        </div>
    );
}

export function InvestigationBookCard({ state }: { state: SeasonNineState }) {
    return (
        <section className="border-paper/25 bg-panel w-full overflow-hidden rounded-lg border" aria-labelledby="investigation-book-title">
            <header className="border-paper/20 flex items-center justify-between gap-4 border-b p-6">
                <div className="flex min-w-0 items-center gap-3">
                    <BookOpen className="text-signal size-6 shrink-0" aria-hidden="true" />
                    <h2 id="investigation-book-title" className="font-heading text-3xl leading-none font-bold tracking-tight uppercase">
                        Investigation Book
                    </h2>
                </div>
                <div className="border-jet-lag-yellow/35 bg-jet-lag-yellow/12 flex shrink-0 items-center gap-2 rounded-full border px-3 py-2" aria-label={`${state.coinBalance} hider coins`}>
                    <Coins className="text-jet-lag-yellow size-4" aria-hidden="true" />
                    <span className="font-display text-lg leading-none font-bold tabular-nums">{state.coinBalance}</span>
                </div>
            </header>

            <div className="border-paper/20 border-b">
                <InvestigationMap state={state} />
            </div>

            <div className="p-5 sm:p-6">
                <div className="mb-4 flex items-center gap-3">
                    <h3 className="font-heading text-xl font-bold uppercase">Questions</h3>
                    <span className="bg-paper/20 h-px flex-1" />
                </div>

                {state.questions.length === 0 ? (
                    <div className="border-paper/15 bg-paper/3.5 rounded-lg border px-5 py-8 text-center">
                        <ImageIcon className="text-card-meta mx-auto size-6" aria-hidden="true" />
                        <p className="text-card-meta mt-3 text-sm">No questions asked yet.</p>
                    </div>
                ) : (
                    <ol className="max-h-[44rem] space-y-3 overflow-y-auto pr-1">
                        {state.questions.toReversed().map((question) => {
                            const title = getQuestionTitle(question);
                            return (
                                <li key={question.eventId} className="border-paper/15 bg-paper/3.5 rounded-lg border p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <p className="font-heading text-lg leading-tight font-bold break-words uppercase">{title}</p>
                                            {title !== question.description && (
                                                <p className="text-card-meta mt-2 text-sm leading-relaxed">{question.description}</p>
                                            )}
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            <span className={cn("rounded-full border px-2 py-1 font-display text-xs font-bold uppercase", CATEGORY_STYLES[question.category])}>{question.category}</span>
                                            <span className="border-paper/20 bg-paper/5 flex items-center gap-1 rounded-full border px-2 py-1 font-display text-xs font-bold">
                                                <Coins className="size-3" aria-hidden="true" />+{question.coins}
                                            </span>
                                        </div>
                                    </div>
                                    <QuestionResponse question={question} />
                                    <p className="text-card-meta mt-3 font-display text-xs font-bold uppercase">Asked at {formatSeasonNineTimestamp(question.askedAt)}</p>
                                </li>
                            );
                        })}
                    </ol>
                )}

                {state.curseLogVisible && (
                    <>
                        <div className="mt-7 mb-4 flex items-center gap-3">
                            <h3 className="font-heading text-xl font-bold uppercase">Curse log</h3>
                            <span className="bg-paper/20 h-px flex-1" />
                        </div>
                        {state.curses.length === 0 ? (
                            <p className="text-card-meta border-paper/15 bg-paper/3.5 rounded-lg border border-dashed px-4 py-5 text-center text-sm">No curses rolled.</p>
                        ) : (
                            <ol className="space-y-3">
                                {state.curses.toReversed().map((curse) => (
                                    <li key={curse.purchaseId} className="border-paper/15 bg-paper/3.5 grid grid-cols-[0.625rem_minmax(0,1fr)] gap-x-3 rounded-lg border p-4">
                                        <span className={cn("mt-1.5 size-2.5 shrink-0 rounded-full", curse.active ? "bg-jet-lag-curse-purple" : "bg-card-meta")} />
                                        <div className="min-w-0">
                                            <p className="font-heading font-bold uppercase">{curse.name}</p>
                                            <p className="text-card-meta mt-1 text-xs">Used {curse.diceCount} {curse.diceCount === 1 ? "die" : "dice"} to roll a {curse.roll} · {curse.active ? "Active" : "Cleared"}</p>
                                            <p className="text-card-meta mt-1 text-xs">{formatSeasonNineTimestamp(curse.rolledAt)}</p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}
