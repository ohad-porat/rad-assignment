import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

const Toaster = () => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as "light" | "dark" | "system"}
      className="toaster group"
      position="top-right"
      offset={16}
      expand={false}
      toastOptions={{
        style: {
          color: "#1f2937",
          backgroundColor: "#ffffff",
          marginTop: "64px",
        },
      }}
    />
  );
};

export { Toaster };
