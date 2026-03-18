import { PlotBase } from "./PlotBase";

export class SubPlot extends PlotBase {
  parentArcId?: string;

  constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    title: string,
    status: string = "planned",
    description?: string,
    parentArcId?: string,
  ) {
    super(id, createdAt, updatedAt, title, "subplot", status, description);
    this.parentArcId = parentArcId;
  }

  summarize(): string {
    return `Subplot: ${this.title} [${this.status}]`;
  }

  display(): object {
    return {
      id: this.id,
      title: this.title,
      type: this.type,
      status: this.status,
      description: this.description,
      parentArcId: this.parentArcId,
    };
  }
}
