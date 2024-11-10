import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@radix-ui/react-tooltip";

import { MdOutlineKeyboardBackspace } from "react-icons/md";

import { Button } from "./button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const BackButtonWithTooltip = ({
  tooltipText = "Go Back",
  onClick,
  className = "",
}: {
  onClick?: () => void;
  tooltipText: string;
  className?: string;
}) => {
  const router = useRouter();

  const handleClick = onClick || (() => router.back());

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Button
            className={cn("bg-inherit hover:bg-light-gray", className)}
            onClick={handleClick}
          >
            <MdOutlineKeyboardBackspace className="text-black" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-sans text-sm">{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default BackButtonWithTooltip;
