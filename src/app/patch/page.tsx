import Link from "next/link";
import BackToHomeButton from "@/components/common/BackToHomeButton";
import { Button } from "@/components/ui/button";

export default function PatchPage() {
  return (
    <section className="w-full h-full max-w-5xl mx-auto min-h-screen flex flex-col justify-center items-center gap-4">
      <h1>Patch Page</h1>
      <div className="flex items-center justify-between gap-2">
        <Link href="/patch/v1">
          <Button>V1</Button>
        </Link>
        <Link href="/patch/v2">
          <Button>V2</Button>
        </Link>
      </div>
      <BackToHomeButton />
    </section>
  );
}
