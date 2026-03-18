import { vi } from "vitest";

// Create a mock prisma client with all models
function createMockModel() {
  return {
    findMany: vi.fn().mockResolvedValue([]),
    findUnique: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockImplementation((args: any) => Promise.resolve({ id: "test-id", ...args.data })),
    update: vi.fn().mockImplementation((args: any) => Promise.resolve({ id: args.where?.id, ...args.data })),
    delete: vi.fn().mockResolvedValue({}),
    count: vi.fn().mockResolvedValue(0),
  };
}

export const prismaMock = {
  character: createMockModel(),
  power: createMockModel(),
  motivation: createMockModel(),
  faction: createMockModel(),
  location: createMockModel(),
  storyArc: createMockModel(),
  plotEvent: createMockModel(),
  timelineEvent: createMockModel(),
  item: createMockModel(),
  characterPower: createMockModel(),
  characterMotivation: createMockModel(),
  characterLocation: createMockModel(),
  characterItem: createMockModel(),
  factionMotivation: createMockModel(),
  plotEventCharacter: createMockModel(),
  plotEventItem: createMockModel(),
  timelineEventCharacter: createMockModel(),
  user: createMockModel(),
  book: createMockModel(),
  bookMember: createMockModel(),
  invitation: createMockModel(),
};

// Mock the prisma module
vi.mock("@/lib/db", () => ({
  prisma: prismaMock,
}));
