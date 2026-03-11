import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface EventSectionProps {
  title: string;
  href?: string;
  children: ReactNode;
}

export function EventSection({ title, href, children }: EventSectionProps) {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl md:text-3xl font-bold font-headline">
          {title}
        </h2>
        {href && (
          <Button variant="ghost" asChild>
            <Link href={href}>
              See All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
      <ScrollArea>
        <div className="flex space-x-6 pb-4">{children}</div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}
