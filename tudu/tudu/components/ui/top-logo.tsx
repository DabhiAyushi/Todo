"use client";

import React from "react";
import { Button } from "./button";
import { LucidePlus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TodoInput } from "@/components/todos/todo-input";

const NavLogoIcon = ({ size }: { size: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width={size}
    height={size}
    className="my-auto"
  >
    <path
      fillRule="evenodd"
      d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z"
      clipRule="evenodd"
    />
  </svg>
);

interface TopLogoProps {
  onTodoCreated?: () => void;
}

export default function TopLogo({ onTodoCreated }: TopLogoProps) {
  const [open, setOpen] = React.useState(false);

  const handleTodoCreated = () => {
    onTodoCreated?.();
    setOpen(false);
  };

  return (
    <div className="sticky top-0 w-full bg-background/70 border-b backdrop-blur-md md:w-full z-50">
      <div className=" flex gap-2 p-3 max-w-4xl justify-between mx-auto">
        <div className="rounded-full w-fit gap-2 ps-2 my-auto pe-5 flex p-1 ">
          <NavLogoIcon size={20} />
          <span className="my-auto text-xl font-mono">TUDU</span>
        </div>

        <Popover modal open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant={"outline"} size={"icon"}>
              <LucidePlus />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[95vw] md:w-[500px] p-4 bg-secondary/20 backdrop-blur-md"
            align="center"
          >
            <TodoInput onTodoCreated={handleTodoCreated} />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
