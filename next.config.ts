import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // permite que arquivos .md/.mdx sejam páginas/imports
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
};

const withMDX = createMDX({
  options: {
    // Turbopack exige nomes de plugin como string (não função importada).
    // remark-frontmatter faz o bloco YAML (---) não renderizar como texto.
    remarkPlugins: ["remark-frontmatter"],
  },
});

export default withMDX(nextConfig);
