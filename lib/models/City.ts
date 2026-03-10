import { LocationBase } from "./LocationBase";

export class City extends LocationBase {
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
    super(id, createdAt, updatedAt, name, "city", description, climate, culture, parentId);
  }

  summarize(): string {
    return `City: ${this.name}${this.climate ? ` (${this.climate})` : ""}`;
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
