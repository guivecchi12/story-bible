import { LocationBase } from "./LocationBase";

export class Region extends LocationBase {
  constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    name: string,
    description?: string,
    climate?: string,
    culture?: string,
    parentId?: string
  ) {
    super(id, createdAt, updatedAt, name, "region", description, climate, culture, parentId);
  }

  summarize(): string {
    return `Region: ${this.name}${this.culture ? ` — ${this.culture.slice(0, 100)}` : ""}`;
  }

  display(): object {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      description: this.description,
      climate: this.climate,
      culture: this.culture,
    };
  }
}
