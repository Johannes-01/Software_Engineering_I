import { Home, Inbox, Calendar, Search, Settings } from "lucide-react"
import {
    Sidebar,
    SidebarContent, SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "../components/ui/sidebar"
  
// Menu items.
const items = [
    {
      title: "Gallery",
      url: "#",
      icon: Inbox,
    },
    {
      title: "Save",
      url: "#",
      icon: Calendar,
    },
  ]
   
  export function AppSidebar() {
    return (
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
          <SidebarFooter>Logout</SidebarFooter>
      </Sidebar>
    )
  }