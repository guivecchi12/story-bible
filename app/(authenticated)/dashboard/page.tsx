import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Zap,
  Heart,
  Shield,
  MapPin,
  BookOpen,
  GitBranch,
  Clock,
  Gem,
} from "lucide-react";
import Link from "next/link";

async function getCounts(bookId: string) {
  const [
    characters,
    powers,
    motivations,
    factions,
    locations,
    storyArcs,
    plotEvents,
    timelineEvents,
    items,
  ] = await Promise.all([
    prisma.character.count({ where: { bookId } }),
    prisma.power.count({ where: { bookId } }),
    prisma.motivation.count({ where: { bookId } }),
    prisma.faction.count({ where: { bookId } }),
    prisma.location.count({ where: { bookId } }),
    prisma.storyArc.count({ where: { bookId } }),
    prisma.plotEvent.count({ where: { bookId } }),
    prisma.timelineEvent.count({ where: { bookId } }),
    prisma.item.count({ where: { bookId } }),
  ]);
  return {
    characters,
    powers,
    motivations,
    factions,
    locations,
    storyArcs,
    plotEvents,
    timelineEvents,
    items,
  };
}

async function getRecentActivity(bookId: string) {
  const [recentCharacters, recentEvents] = await Promise.all([
    prisma.character.findMany({
      where: { bookId },
      take: 5,
      orderBy: { updatedAt: "desc" },
      select: { id: true, name: true, type: true, updatedAt: true },
    }),
    prisma.plotEvent.findMany({
      where: { bookId },
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: { storyArc: { select: { title: true } } },
    }),
  ]);
  return { recentCharacters, recentEvents };
}

type Activity = Awaited<ReturnType<typeof getRecentActivity>>;
export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const user = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: { activeBookId: true },
      })
    : null;
  const bookId = user?.activeBookId;

  if (!bookId) {
    return (
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Select or create a book to get started.
        </p>
      </div>
    );
  }

  const counts = await getCounts(bookId);
  const activity = await getRecentActivity(bookId);

  const stats = [
    {
      label: "Characters",
      count: counts.characters,
      icon: Users,
      href: "/characters",
      color: "text-blue-500",
    },
    {
      label: "Powers",
      count: counts.powers,
      icon: Zap,
      href: "/powers",
      color: "text-yellow-500",
    },
    {
      label: "Motivations",
      count: counts.motivations,
      icon: Heart,
      href: "/motivations",
      color: "text-red-500",
    },
    {
      label: "Factions",
      count: counts.factions,
      icon: Shield,
      href: "/factions",
      color: "text-green-500",
    },
    {
      label: "Locations",
      count: counts.locations,
      icon: MapPin,
      href: "/locations",
      color: "text-purple-500",
    },
    {
      label: "Story Arcs",
      count: counts.storyArcs,
      icon: BookOpen,
      href: "/story-arcs",
      color: "text-indigo-500",
    },
    {
      label: "Plot Events",
      count: counts.plotEvents,
      icon: GitBranch,
      href: "/plot-events",
      color: "text-orange-500",
    },
    {
      label: "Timeline",
      count: counts.timelineEvents,
      icon: Clock,
      href: "/timeline",
      color: "text-cyan-500",
    },
    {
      label: "Items",
      count: counts.items,
      icon: Gem,
      href: "/items",
      color: "text-pink-500",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your story world
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.count}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Characters</CardTitle>
          </CardHeader>
          <CardContent>
            {activity.recentCharacters.length === 0 ? (
              <p className="text-sm text-muted-foreground">No characters yet</p>
            ) : (
              <div className="space-y-3">
                {activity.recentCharacters.map(
                  (char: Activity["recentCharacters"][number]) => (
                    <Link
                      key={char.id}
                      href={`/characters/${char.id}`}
                      className="flex items-center justify-between hover:bg-muted/50 rounded p-2 -mx-2"
                    >
                      <div>
                        <p className="font-medium text-sm">{char.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {char.type}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(char.updatedAt).toLocaleDateString()}
                      </p>
                    </Link>
                  ),
                )}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Plot Events</CardTitle>
          </CardHeader>
          <CardContent>
            {activity.recentEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No plot events yet
              </p>
            ) : (
              <div className="space-y-3">
                {activity.recentEvents.map(
                  (event: Activity["recentEvents"][number]) => (
                    <Link
                      key={event.id}
                      href={`/plot-events/${event.id}`}
                      className="flex items-center justify-between hover:bg-muted/50 rounded p-2 -mx-2"
                    >
                      <div>
                        <p className="font-medium text-sm">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.storyArc.title}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.updatedAt).toLocaleDateString()}
                      </p>
                    </Link>
                  ),
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
