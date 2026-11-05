const iconByTechnology: Record<string, string> = {
  "react": "react",
  "react.js": "react",
  "react js": "react",
  "reactjs": "react",
  "next.js": "nextdotjs",
  "nextjs": "nextdotjs",
  "tailwind": "tailwindcss",
  "tailwind css": "tailwindcss",
  "bootstrap": "bootstrap",
  "python": "python",
  "django": "django",
  "javascript": "javascript",
  "js": "javascript",
  "typescript": "typescript",
  "ts": "typescript",
  "node.js": "nodedotjs",
  "nodejs": "nodedotjs",
  "express": "express",
  "html": "html5",
  "html5": "html5",
  "css": "css3",
  "css3": "css3",
  "postgres": "postgresql",
  "postgresql": "postgresql",
  "sqlite": "sqlite",
  "mongodb": "mongodb",
  "mysql": "mysql",
  "supabase": "supabase",
  "firebase": "firebase",
  "docker": "docker",
  "git": "git",
  "github": "github",
  "figma": "figma",
  "java": "java",
  "c#": "sharp",
  "c++": "cplusplus",
  "php": "php",
  "laravel": "laravel",
  "vue": "vuedotjs",
  "vue.js": "vuedotjs",
  "angular": "angular",
  "svelte": "svelte",
  "ruby": "ruby",
  "rails": "rubyonrails",
  "go": "go",
  "rust": "rust",
  "kotlin": "kotlin",
  "swift": "swift",
  "wordpress": "wordpress",
};

export function technologyIconUrlFor(label: string, color?: string) {
  const normalized = label.trim().toLowerCase().replace(/^[([{]+|[)\]}]+$/g, "").replace(/\s+/g, " ");
  const slug = iconByTechnology[normalized];
  return slug ? `https://cdn.simpleicons.org/${slug}${color ? `/${color}` : ""}` : undefined;
}

export function TechnologyTags({ technologies, className = "", tagClassName = "" }: {
  technologies: string[];
  className?: string;
  tagClassName?: string;
}) {
  if (!technologies.length) return null;

  return <div className={className}>{technologies.map((technology, index) => {
    const iconUrl = technologyIconUrlFor(technology);
    return <span className={`technology-tag ${tagClassName}`} key={`${technology}-${index}`}>
      {iconUrl && <span className="technology-icon" style={{ backgroundImage: `url("${iconUrl}")` }} aria-hidden="true" />}
      <span>{technology}</span>
    </span>;
  })}</div>;
}
