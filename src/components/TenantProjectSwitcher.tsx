import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Building2, ChevronDown } from "lucide-react";
import { useTenantStore } from "@/stores/tenantStore";
import { useAIAssistantStore } from "@/stores/aiAssistantStore";
import { useSelectionStore } from "@/stores/selectionStore";
import { useEffect, type FC } from "react";

export const TenantProjectSwitcher: FC = () => {
  const { tenants, currentTenant, currentProject, setCurrentTenant, setCurrentProject } =
    useTenantStore();
  const { clearMessages, close } = useAIAssistantStore();
  const { clearSelection } = useSelectionStore();

  useEffect(() => {
    if (!currentTenant && tenants.length > 0) {
      setCurrentTenant(tenants[0]);
    }
  }, [currentTenant, setCurrentTenant, tenants]);

  const handleTenantSwitch = (tenant: any) => {
    setCurrentTenant(tenant);
    setCurrentProject(null);
    clearSelection();
    clearMessages();
    close();
  };

  const handleProjectSwitch = (tenant: any, project: any) => {
    setCurrentTenant(tenant);
    setCurrentProject(project);
    clearSelection();
    clearMessages();
    close();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="gap-2 ml-10 bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-500">
          <Building2 className="h-4 w-4 text-slate-400" />
          <span className="text-slate-200">
            {currentTenant?.name}
            {currentProject && ` / ${currentProject.name}`}
          </span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        {tenants.map((tenant) => (
          <DropdownMenuGroup key={tenant.id}>
            <DropdownMenuItem
              onClick={() => handleTenantSwitch(tenant)}
              className={`font-semibold ${
                currentTenant?.id === tenant.id && !currentProject
                  ? "bg-slate-200 dark:bg-slate-600"
                  : ""
              }`}
            >
              {tenant.name}
            </DropdownMenuItem>
            {tenant.projects.map((project) => (
              <DropdownMenuItem
                key={project.id}
                className={`pl-6 ${
                  currentProject?.id === project.id ? "bg-slate-200 dark:bg-slate-600" : ""
                }`}
                onClick={() => handleProjectSwitch(tenant, project)}
              >
                {project.name}
              </DropdownMenuItem>
            ))}
            {tenant !== tenants[tenants.length - 1] && <DropdownMenuSeparator />}
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
