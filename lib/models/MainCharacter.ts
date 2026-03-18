import {
  CharacterBase,
  CharacterPowerData,
  CharacterMotivationData,
} from "./CharacterBase";

export class MainCharacter extends CharacterBase {
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
      "main",
      powers,
      motivations,
      description,
      backstory,
      factionId,
    );
  }

  summarize(): string {
    const primaryPower = this.getPrimaryPower();
    const topMotivation = this.getMotivationsByPriority()[0];
    return `Main Character: ${this.name}${primaryPower ? ` | Power: ${primaryPower.name}` : ""}${topMotivation ? ` | Drive: ${topMotivation.name}` : ""}`;
  }

  display(): object {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      description: this.description,
      backstory: this.backstory,
      powers: this.powers,
      motivations: this.getMotivationsByPriority(),
      primaryPower: this.getPrimaryPower(),
    };
  }
}
