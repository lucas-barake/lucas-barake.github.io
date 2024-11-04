// src/plugins/rehype-spotlight.mjs
import { visit } from "unist-util-visit";

export function rehypeSpotlight() {
  return (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName === "pre") {
        const [codeEl] = node.children.filter((n) => n.tagName === "code");

        if (codeEl) {
          const lineSpans = codeEl.children.filter(
            (n) => n.type === "element" && n.tagName === "span" && n.properties.className?.includes("line")
          );

          const hasSpotlights = lineSpans.some((span) => {
            const hasMarker = (node) => {
              if (node.value) {
                return node.value.includes("// spotlight-start") || node.value.includes("// spotlight-end");
              }
              return node.children?.some(hasMarker) || false;
            };
            return hasMarker(span);
          });

          if (hasSpotlights) {
            codeEl.properties.className = [...(codeEl.properties.className || []), "has-spotlights"];
            let isSpotlighting = false;

            lineSpans.forEach((span) => {
              const getText = (node) => {
                if (node.value) return node.value;
                return node.children?.map(getText).join("") || "";
              };
              const text = getText(span);

              // Classify the line FIRST
              if (text.includes("// spotlight-start")) {
                isSpotlighting = true;
              } else if (text.includes("// spotlight-end")) {
                isSpotlighting = false;
              } else if (isSpotlighting) {
                span.properties.className = [...span.properties.className, "spotlight"];
              } else {
                span.properties.className = [...span.properties.className, "dim"];
              }

              // THEN transform the text nodes to remove spotlight markers
              const transformNode = (node) => {
                if (node.value) {
                  node.value = node.value.replace(/\/\/ spotlight-start\s*/, "").replace(/\/\/ spotlight-end\s*/, "");
                  return node.value.trim() === "";
                }
                if (node.children) {
                  node.children = node.children.filter((child) => !transformNode(child));
                  return node.children.length === 0;
                }
                return false;
              };

              const isEmpty = transformNode(span);
              if (isEmpty) {
                span.children = [];
              }
            });

            // Filter out empty spans at the end
            codeEl.children = codeEl.children.filter(
              (child) =>
                !(
                  child.type === "element" &&
                  child.tagName === "span" &&
                  (!child.children || child.children.length === 0)
                )
            );
          }
        }
      }
    });
  };
}
