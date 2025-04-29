import { NavTabsTrigger, Tabs, TabsList } from "@/components/ui/tabs";
import React from "react";
import { Outlet, useMatches, useNavigate } from "react-router-dom";

const navTabs = [
  {
    label: "Website",
    value: "website",
    path: "/source/",
  },
  {
    label: "URLs",
    value: "urls",
    path: "/source/urls",
  },
  {
    label: "Files",
    value: "files",
    path: "/source/files",
  },
];

export const Source = () => {
  const matches = useMatches();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = React.useState("website");

  React.useEffect(() => {
    // Determine the current tab based on the URL
    const currentPath = matches[matches.length - 1]?.pathname || '';
    
    // Find matching tab or default to "website"
    const matchedTab = navTabs.find(nav => 
      currentPath === nav.path || 
      (nav.value === 'website' && currentPath === '/source')
    );
    
    setCurrentTab(matchedTab?.value || "website");
  }, [matches]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    const tab = navTabs.find(nav => nav.value === value);
    if (tab) {
      navigate(tab.path);
    }
  };

  return (
    <div className="flex">
      <div className="mt-[5vh] mr-6">
        <Tabs
          value={currentTab}
          onValueChange={handleTabChange}
          orientation="vertical"
        >
          <TabsList className="flex flex-col h-auto">
            {navTabs.map((nav) => (
              <NavTabsTrigger {...nav} key={nav.value} className="w-[80px]" />
            ))}
          </TabsList>
        </Tabs>
      </div>
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};
