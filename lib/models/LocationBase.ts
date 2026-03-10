import { StoryElement } from "./StoryElement";

export abstract class LocationBase extends StoryElement {
  name: string;
  type: string;
  description?: string;
  climate?: string;
  culture?: string;
  parentId?: string;

  constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    name: string,
    type: string,
    description?: string,
    climate?: string,
    culture?: string,
    parentId?: string
  ) {
    super(id, createdAt, updatedAt);
    this.name = name;
    this.type = type;
    this.description = description;
    this.climate = climate;
    this.culture = culture;
    this.parentId = parentId;
  }

  validate(): boolean {
    return this.name.length > 0;
  }
}
