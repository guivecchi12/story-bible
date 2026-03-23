import { vi } from "vitest";

// Create a mock prisma client with all models
function createMockModel() {
  return {
    findMany: vi.fn().mockResolvedValue([]),
    findUnique: vi.fn().mockResolvedValue(null),
    findFirst: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockImplementation((args: any) => Promise.resolve({ id: "test-id", ...args.data })),
    createMany: vi.fn().mockResolvedValue({ count: 0 }),
    update: vi.fn().mockImplementation((args: any) => Promise.resolve({ id: args.where?.id, ...args.data })),
    upsert: vi.fn().mockImplementation((args: any) => Promise.resolve({ id: "test-id", ...args.create })),
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
  timeline: createMockModel(),
  item: createMockModel(),
  characterPower: createMockModel(),
  characterMotivation: createMockModel(),
  characterLocation: createMockModel(),
  characterItem: createMockModel(),
  factionMotivation: createMockModel(),
  characterFaction: createMockModel(),
  plotEventCharacter: createMockModel(),
  plotEventItem: createMockModel(),
  timelineCharacterState: createMockModel(),
  timelineCharacterFaction: createMockModel(),
  timelineItemState: createMockModel(),
  timelineFactionState: createMockModel(),
  timelineLocationState: createMockModel(),
  timelineCharacterMotivation: createMockModel(),
  timelineFactionMotivation: createMockModel(),
  timelineCharacterPower: createMockModel(),
  timelineCharacterLocation: createMockModel(),
  timelineCharacterItem: createMockModel(),
  user: createMockModel(),
  book: createMockModel(),
  bookMember: createMockModel(),
  invitation: createMockModel(),
  $transaction: vi.fn().mockImplementation((fn: any) => fn(prismaMock)),
};

// Mock the prisma module
vi.mock("@/lib/db", () => ({
  prisma: prismaMock,
}));
