import SiteHeader from "@portfolio/ui/site-header";

const NAV_ITEMS = [
  { id: "about", path: "/#about" },
  { id: "projects", path: "/#projects" },
  { id: "canvas", path: "/#canvas" },
  { id: "sketches", path: "/#sketches" },
];

const SOCIAL_ITEMS = [
  { label: "Email", link: "/email" },
  { label: "Instagram", link: "/ig_main" },
  { label: "beli", link: "/beli" },
  { label: "Spotify", link: "/spotify" },
];

export default function EmilyHeader() {
  return (
    <SiteHeader
      brandName="Emily Chang"
      brandHref="/"
      brandVariant="italic"
      navItems={NAV_ITEMS}
      navLinkClassName="relative font-body text-base transition-colors duration-200 outline-none"
      hideAtPageBottom
      staggeredMenu={{
        colors: ["hsl(var(--accent))", "hsl(var(--background))"],
        accentColor: "hsl(var(--accent))",
        menuButtonColor: "hsl(var(--foreground))",
        openMenuButtonColor: "hsl(var(--foreground))",
        changeMenuColorOnOpen: false,
        itemVariant: "italic",
        toggleVariant: "body",
        socialGroups: [
          {
            titleKey: "footer.socialContact",
            fallbackTitle: "Social & Contact",
            items: SOCIAL_ITEMS,
          },
        ],
      }}
    />
  );
}
