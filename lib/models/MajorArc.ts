import { PlotBase } from "./PlotBase";

export class MajorArc extends PlotBase {
  constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    title: string,
    status: string = "planned",
    description?: string
  ) {
    super(id, createdAt, updatedAt, title, "main", status, description);
  }

  summarize(): string {
    return `Major Arc: ${this.title} [${this.status}]`;
  }

  display(): object {
    return {
      id: this.id,
      title: this.title,
      type: this.type,
      status: this.status,
      description: this.description,
    };
  }
}
