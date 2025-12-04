"use client";

import { THEME_NAMES, type ThemeName } from "@/lib/themes";
import { useTheme } from "./theme-context";
import { PaletteIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
} from "../ui/dropdown-menu";

interface ThemeSelectorProps {
  onThemeChange?: (theme: ThemeName) => void;
  showLabel?: boolean;
  compact?: boolean;
}

export default function ThemeSelector({
  onThemeChange,
  showLabel = true,
  compact = false,
}: ThemeSelectorProps) {
  const { currentTheme, setTheme } = useTheme();

  const handleThemeChange = (theme: ThemeName) => {
    setTheme(theme);
    onThemeChange?.(theme);
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <PaletteIcon className="text-primary"/>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Theme</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={currentTheme}
            onValueChange={(value) => handleThemeChange(value as ThemeName)}
          >
            {THEME_NAMES.map((theme) => (
              <DropdownMenuRadioItem key={theme.value} value={theme.value}>
                {theme.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
