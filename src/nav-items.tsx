
import { Home, TestTubes } from "lucide-react";
import Index from "./pages/Index";
import Test from "./pages/Test";

export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <Home className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Test",
    to: "/test",
    icon: <TestTubes className="h-4 w-4" />,
    page: <Test />,
  },
];
