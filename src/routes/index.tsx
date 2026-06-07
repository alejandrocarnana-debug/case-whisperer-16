import { createFileRoute } from "@tanstack/react-router";
import { CaseDesk } from "@/components/CaseDesk";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CaseDesk — Fraud Triage for Bank Analysts" },
      { name: "description", content: "Analyst workbench for triaging flagged bank transactions: ranked cases, evidence, and recommended actions." },
      { property: "og:title", content: "CaseDesk — Fraud Triage" },
      { property: "og:description", content: "Triage flagged bank transactions with evidence and recommended actions." },
    ],
  }),
  component: CaseDesk,
});
