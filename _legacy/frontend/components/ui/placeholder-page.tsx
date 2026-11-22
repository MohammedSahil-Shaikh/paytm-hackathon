import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardContent className="flex flex-col items-start gap-5 py-10 sm:items-center sm:text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <Construction className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-900">{title}</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-500">
              {description}
            </p>
          </div>
          <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50 px-4 py-3 text-sm text-ink-600">
            Feature coming soon — this section is intentionally unimplemented in the
            foundation stage.
          </div>
          <Link href="/dashboard">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
