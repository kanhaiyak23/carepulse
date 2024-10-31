import Image from "next/image";
import { Button } from "@/components/ui/button"
export default function Home() {
  return (
   <div>
    <h1 className="text-white text-3xl underline">Home</h1>
    <Button>Click me</Button>
   </div>
  );
}
