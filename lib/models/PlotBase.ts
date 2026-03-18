import { StoryElement } from "./StoryElement";

export abstract class PlotBase extends StoryElement {
  title: string;
  description?: string;
  type: string;
  status: string;

  constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    title: string,
    type: string,
    status: string,
    description?: string,
  ) {
    super(id, createdAt, updatedAt);
    this.title = title;
    this.type = type;
    this.status = status;
    this.description = description;
  }

  validate(): boolean {
    return this.title.length > 0;
  }
}
