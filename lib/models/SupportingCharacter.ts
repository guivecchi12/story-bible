import {
  CharacterBase,
  CharacterPowerData,
  CharacterMotivationData,
} from "./CharacterBase";

export class SupportingCharacter extends CharacterBase {
  constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    name: string,
    powers: CharacterPowerData[] = [],
    motivations: CharacterMotivationData[] = [],
    description?: string,
    backstory?: string,
    factionId?: string,
  ) {
    super(
      id,
      createdAt,
      updatedAt,
      name,
      "supporting",
      powers,
      motivations,
      description,
      backstory,
      factionId,
    );
  }

  summarize(): string {
    return `Supporting Character: ${this.name}${this.description ? ` — ${this.description.slice(0, 100)}` : ""}`;
  }

  display(): object {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      description: this.description,
      powers: this.powers,
      motivations: this.getMotivationsByPriority(),
    };
  }
}
