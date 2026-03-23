"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  FileText,
  Users,
  Clock,
  BookOpen,
  MapPin,
  Shield,
  Loader2,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

const reports = [
  {
    type: "character-sheet",
    title: "Character Sheet Report",
    description:
      "Full character profiles with powers, motivations, factions, locations, and items",
    icon: Users,
  },
  {
    type: "timeline",
    title: "Timeline Report",
    description:
      "All timeline events sorted by order with era, dates, locations, and characters",
    icon: Clock,
  },
  {
    type: "story-arc",
    title: "Story Arc Report",
    description: "All arcs with subplots and associated plot events",
    icon: BookOpen,
  },
  {
    type: "world-summary",
    title: "World Summary Report",
    description:
      "All locations in hierarchy with descriptions, climate, and culture",
    icon: MapPin,
  },
  {
    type: "faction",
    title: "Faction Report",
    description: "All factions with their members and motivations",
    icon: Shield,
  },
];

export default function ReportsPage() {
  const [generating, setGenerating] = useState<string | null>(null);
  const { addToast } = useToast();

  const generateReport = async (type: string) => {
    setGenerating(type);
    try {
      const res = await apiFetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (!res.ok) throw new Error("Failed to generate report");
      const reportData = await res.json();
      generatePDF(reportData);
      addToast({
        title: "Report generated",
        description: "PDF download started",
      });
    } catch {
      addToast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setGenerating(null);
    }
  };

  const generatePDF = (reportData: any) => {
    import("jspdf").then(({ jsPDF }) => {
      import("jspdf-autotable").then((autoTableModule) => {
        const doc = new jsPDF();
        const autoTable = autoTableModule.default;
        const { type, data, generatedAt } = reportData;
        const timestamp = new Date(generatedAt).toLocaleString();

        doc.setFontSize(20);
        doc.text(getReportTitle(type), 14, 22);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated: ${timestamp}`, 14, 30);
        doc.setTextColor(0);

        let startY = 38;

        switch (type) {
          case "character-sheet":
            data.forEach((char: any, idx: number) => {
              if (idx > 0) {
                doc.addPage();
                startY = 20;
              }
              doc.setFontSize(16);
              doc.text(char.name, 14, startY);
              doc.setFontSize(10);
              doc.text(
                `Type: ${char.type} | Factions: ${char.factions?.map((cf: any) => cf.faction.name).join(", ") || "None"}`,
                14,
                startY + 7,
              );
              if (char.description) {
                doc.text(
                  `Description: ${char.description.slice(0, 200)}`,
                  14,
                  startY + 14,
                );
                startY += 7;
              }
              startY += 18;

              if (char.powers?.length) {
                autoTable(doc, {
                  startY,
                  head: [["Power", "Strength", "Primary", "Notes"]],
                  body: char.powers.map((cp: any) => [
                    cp.power.name,
                    `${cp.strengthLevel}/10`,
                    cp.isPrimary ? "Yes" : "No",
                    cp.notes || "",
                  ]),
                  margin: { left: 14 },
                  styles: { fontSize: 8 },
                });
                startY = (doc as any).lastAutoTable.finalY + 8;
              }

              if (char.motivations?.length) {
                autoTable(doc, {
                  startY,
                  head: [["Motivation", "Category", "Priority"]],
                  body: char.motivations.map((cm: any) => [
                    cm.motivation.name,
                    cm.motivation.category,
                    cm.priority,
                  ]),
                  margin: { left: 14 },
                  styles: { fontSize: 8 },
                });
                startY = (doc as any).lastAutoTable.finalY + 8;
              }
            });
            break;

          case "timeline":
            autoTable(doc, {
              startY,
              head: [
                [
                  "#",
                  "Title",
                  "Era",
                  "In-World Date",
                  "Location",
                  "Characters",
                ],
              ],
              body: data.map((e: any) => [
                e.order,
                e.title,
                e.era || "",
                e.inWorldDate || "",
                e.location?.name || "",
                e.characters?.map((c: any) => c.character.name).join(", ") ||
                  "",
              ]),
              margin: { left: 14 },
              styles: { fontSize: 8 },
            });
            break;

          case "story-arc":
            data.forEach((arc: any, idx: number) => {
              if (idx > 0) {
                doc.addPage();
                startY = 20;
              }
              doc.setFontSize(14);
              doc.text(`${arc.title} [${arc.status}]`, 14, startY);
              doc.setFontSize(10);
              doc.text(
                `Type: ${arc.type}${arc.description ? ` | ${arc.description.slice(0, 100)}` : ""}`,
                14,
                startY + 7,
              );
              startY += 16;

              if (arc.subPlots?.length) {
                doc.text("Subplots:", 14, startY);
                startY += 6;
                arc.subPlots.forEach((sp: any) => {
                  doc.text(`  - ${sp.title} [${sp.status}]`, 14, startY);
                  startY += 5;
                });
                startY += 4;
              }

              if (arc.plotEvents?.length) {
                autoTable(doc, {
                  startY,
                  head: [["#", "Event", "Location", "Characters"]],
                  body: arc.plotEvents.map((pe: any) => [
                    pe.order,
                    pe.title,
                    pe.location?.name || "",
                    pe.characters
                      ?.map((c: any) => c.character.name)
                      .join(", ") || "",
                  ]),
                  margin: { left: 14 },
                  styles: { fontSize: 8 },
                });
                startY = (doc as any).lastAutoTable.finalY + 8;
              }
            });
            break;

          case "world-summary":
            autoTable(doc, {
              startY,
              head: [["Name", "Type", "Parent", "Climate", "Culture"]],
              body: data.map((l: any) => [
                l.name,
                l.type,
                l.parent?.name || "—",
                l.climate || "",
                (l.culture || "").slice(0, 60),
              ]),
              margin: { left: 14 },
              styles: { fontSize: 8 },
            });
            break;

          case "faction":
            data.forEach((faction: any, idx: number) => {
              if (idx > 0) {
                doc.addPage();
                startY = 20;
              }
              doc.setFontSize(14);
              doc.text(faction.name, 14, startY);
              if (faction.description) {
                doc.setFontSize(10);
                doc.text(faction.description.slice(0, 200), 14, startY + 7);
                startY += 7;
              }
              startY += 12;

              if (faction.characters?.length) {
                autoTable(doc, {
                  startY,
                  head: [["Member", "Type"]],
                  body: faction.characters.map((cf: any) => [cf.character.name, cf.character.type]),
                  margin: { left: 14 },
                  styles: { fontSize: 8 },
                });
                startY = (doc as any).lastAutoTable.finalY + 8;
              }

              if (faction.motivations?.length) {
                autoTable(doc, {
                  startY,
                  head: [["Motivation", "Category", "Priority"]],
                  body: faction.motivations.map((fm: any) => [
                    fm.motivation.name,
                    fm.motivation.category,
                    fm.priority,
                  ]),
                  margin: { left: 14 },
                  styles: { fontSize: 8 },
                });
                startY = (doc as any).lastAutoTable.finalY + 8;
              }
            });
            break;
        }

        doc.save(
          `story-bible-${type}-${new Date().toISOString().slice(0, 10)}.pdf`,
        );
      });
    });
  };

  const getReportTitle = (type: string): string => {
    const titles: Record<string, string> = {
      "character-sheet": "Character Sheet Report",
      timeline: "Timeline Report",
      "story-arc": "Story Arc Report",
      "world-summary": "World Summary Report",
      faction: "Faction Report",
    };
    return titles[type] || "Report";
  };

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Generate downloadable PDF reports"
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.type} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-3">
                <report.icon className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-base">{report.title}</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {report.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="mt-auto">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => generateReport(report.type)}
                disabled={generating === report.type}
              >
                {generating === report.type ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate PDF
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
