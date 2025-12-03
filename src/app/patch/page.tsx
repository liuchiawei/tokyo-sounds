import Link from "next/link";
import BackToHomeButton from "@/components/common/BackToHomeButton";
import { Button } from "@/components/ui/button";

export default function PatchPage() {
  return (
    <>
      <h1>Patch Page</h1>
      <div className="flex items-center justify-between">
        <Link href="/patch/v1">
          <Button>V1</Button>
        </Link>
        <Link href="/patch/v2">
          <Button>V2</Button>
        </Link>
      </div>
      <BackToHomeButton />
    </>
  );
}
