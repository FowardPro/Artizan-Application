export default [
  {
    title: "Dashboard",
    icon: "mdi-view-dashboard-outline",
    to: "/dashboard",
    role: "admin"
  },
  {
    title: "My Artwork",
    icon: "mdi-alert-circle-outline",
    to: "/ui-components/alert",
    role: "artist"
  },
  {
    title: "Manage Artworks",
    icon: "mdi-alert-circle-outline",
    to: "/ui-components/approvals",
    role: "admin"
  },
  {
    title: "Art Gallery",
    icon: "mdi-file-image",
    to: "/ui-components/buttons",
    role: "*"
  },
  {
    title: "Payments",
    icon: "mdi-cash",
    to: "/ui-components/menus",
    role: "*"

  },
  {
    title: "Reports",
    icon: "mdi-chart-bar",
    to: "/ui-components/",
    role: "blocked"
  },
  {
    title: "History",
    icon: "mdi-view-dashboard-outline",
    to: "/history",
    role: "blocked"
  },
  {
    title: "Settings",
    icon: "mdi-cog",
    to: "/ui-components/tables",
    role: "*"
  },
  {
    title: "Logout",
    icon: "mdi-logout",
    to: "/auth/login",
    role: "*"
  }
];
