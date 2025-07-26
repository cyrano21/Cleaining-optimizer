import React from "react";
import { cn } from "../../lib/utils";

const SidebarClean: React.FC = () => {
  const collapsed = false; // Replace with actual collapsed state

  return (
    <aside
      className={cn(
        "w-full max-w-xs",
        collapsed ? "w-16 lg:w-16" : "w-72 lg:w-72"
      )}
    >
      {/* Rest of the component content */}
    </aside>
  );
};

export default SidebarClean;
