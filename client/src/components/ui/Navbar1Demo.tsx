import { Book, Sunset, Trees, Zap, ShieldCheck, Package, Beaker } from "lucide-react";
import { Navbar1 } from "./shadcnblocks-com-navbar1";

const demoData = {
  logo: {
    url: "/",
    src: "/eastern-logo-main.png",
    alt: "Eastern Mills",
    title: "Eastern Mills",
  },
  menu: [
    {
      title: "Home",
      url: "/",
    },
    {
      title: "Quality",
      url: "/quality",
      items: [
        {
          title: "Compliance",
          description: "ISO 9001:2015 audit management and compliance tracking",
          icon: <ShieldCheck className="size-5 shrink-0" />,
          url: "/quality#compliance",
        },
        {
          title: "Lab Inspection",
          description: "Scientific material analysis and testing protocols",
          icon: <Beaker className="size-5 shrink-0" />,
          url: "/quality#lab",
        },
        {
          title: "Bazaar Inspection",
          description: "Market quality control and vendor assessments",
          icon: <Package className="size-5 shrink-0" />,
          url: "/quality#bazaar",
        },
        {
          title: "Final Inspection",
          description: "End-to-end quality validation before shipping",
          icon: <ShieldCheck className="size-5 shrink-0" />,
          url: "/quality#final",
        },
      ],
    },
    {
      title: "Sampling",
      url: "/sampling",
      items: [
        {
          title: "Create New Rug",
          description: "Design and specify new rug samples with materials",
          icon: <Package className="size-5 shrink-0" />,
          url: "/sampling#create",
        },
        {
          title: "Rug Gallery",
          description: "Browse and manage existing rug designs and samples",
          icon: <Trees className="size-5 shrink-0" />,
          url: "/sampling#gallery",
        },
      ],
    },
    {
      title: "Merchandising",
      url: "/merchandising",
    },
  ],
  mobileExtraLinks: [
    { name: "Reports", url: "/reports" },
    { name: "Support", url: "/support" },
    { name: "Documentation", url: "/docs" },
    { name: "Status", url: "/status" },
  ],
  auth: {
    login: { text: "Sign In", url: "/login" },
    signup: { text: "Contact Admin", url: "/contact" },
  },
};

function Navbar1Demo() {
  return <Navbar1 {...demoData} />;
}

export { Navbar1Demo };