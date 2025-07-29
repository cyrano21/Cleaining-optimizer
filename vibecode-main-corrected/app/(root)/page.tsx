import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className=" z-20 flex flex-col items-center justify-start min-h-screen py-2 mt-10">
      
      <div className="flex flex-col justify-center items-center my-5">
      <Image src={"/hero.svg"} alt="Hero-Section" height={500}  width={500}/>
      
      <h1 className=" z-20 text-6xl mt-5 font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-rose-500 via-red-500 to-pink-500 dark:from-rose-400 dark:via-red-400 dark:to-pink-400 tracking-tight leading-[1.3] ">
        Vibe Code with Intelligence
      </h1>
      </div>
     

      <p className="mt-2 text-lg text-center text-gray-600 dark:text-gray-400 px-5 py-10 max-w-2xl">
        VibeCode Editor is a powerful and intelligent code editor that enhances
        your coding experience with advanced features and seamless integration.
        It is designed to help you write, debug, and optimize your code
        efficiently.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <Link href={"/dashboard"}>
          <Button variant={"brand"} className="mb-4" size={"lg"}>
            Get Started
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
        <Link href={"/lovable-clone"}>
          <Button variant={"default"} className="mb-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600" size={"lg"}>
            Try Lovable Clone
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
        <Link href={"/visual-editor"}>
          <Button variant={"outline"} className="mb-4" size={"lg"}>
            Try Visual Editor
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
