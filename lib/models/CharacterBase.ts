import { StoryElement } from "./StoryElement";

export interface CharacterPowerData {
  powerId: string;
  name: string;
  strengthLevel: number;
  isPrimary: boolean;
  notes?: string;
}

export interface CharacterMotivationData {
  motivationId: string;
  name: string;
  priority: number;
  personalNotes?: string;
}

export abstract class CharacterBase extends StoryElement {
  name: string;
  type: "main" | "supporting";
  description?: string;
  backstory?: string;
  factionId?: string;
  powers: CharacterPowerData[];
  motivations: CharacterMotivationData[];

  constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    name: string,
    type: "main" | "supporting",
    powers: CharacterPowerData[] = [],
    motivations: CharacterMotivationData[] = [],
    description?: string,
    backstory?: string,
    factionId?: string
  ) {
    super(id, createdAt, updatedAt);
    this.name = name;
    this.type = type;
    this.description = description;
    this.backstory = backstory;
    this.factionId = factionId;
    this.powers = powers;
    this.motivations = motivations;
  }

  getMotivationsByPriority(): CharacterMotivationData[] {
    return [...this.motivations].sort((a, b) => a.priority - b.priority);
  }

  getPrimaryPower(): CharacterPowerData | undefined {
    return this.powers.find((p) => p.isPrimary) || this.powers[0];
  }

  validate(): boolean {
    return this.name.length > 0 && this.name.length <= 200;
  }
}
