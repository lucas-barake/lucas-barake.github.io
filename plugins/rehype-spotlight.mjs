// src/plugins/rehype-spotlight.mjs
import { visit } from "unist-util-visit";

export function rehypeSpotlight() {
  return (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName === "pre") {
        const [codeEl] = node.children.filter((n) => n.tagName === "code");

        if (codeEl) {
          const lineSpans = codeEl.children.filter(
            (n) =>
              n.type === "element" &&
              n.tagName === "span" &&
              n.properties.className?.includes("line")
          );

          const lastSpan = lineSpans[lineSpans.length - 1];
          if (lastSpan) {
            const getText = (node) => {
              if (node.value) return node.value;
              return node.children?.map(getText).join("") || "";
            };
            const lastText = getText(lastSpan);
            if (lastText.trim() === "") {
              lastSpan.shouldRemove = true;
              const lastSpanIndex = codeEl.children.indexOf(lastSpan);
              const prevNode = codeEl.children[lastSpanIndex - 1];
              if (prevNode && prevNode.type === "text" && prevNode.value === "\n") {
                prevNode.shouldRemove = true;
              }
            }
          }

          codeEl.children = codeEl.children.filter((child) => !child.shouldRemove);

          const hasSpotlights = lineSpans.some((span) => {
            const hasMarker = (node) => {
              if (node.value) {
                return (
                  node.value.includes("// spotlight-start") ||
                  node.value.includes("// spotlight-end")
                );
              }
              return node.children?.some(hasMarker) || false;
            };
            return hasMarker(span);
          });

          if (hasSpotlights) {
            codeEl.properties.className = [
              ...(codeEl.properties.className || []),
              "has-spotlights"
            ];
            let isSpotlighting = false;

            lineSpans.forEach((span, index) => {
              const getText = (node) => {
                if (node.value) return node.value;
                return node.children?.map(getText).join("") || "";
              };
              const text = getText(span);

              if (text.trim() === "// spotlight-start" || text.trim() === "// spotlight-end") {
                span.shouldRemove = true;
                const nextNode = codeEl.children[codeEl.children.indexOf(span) + 1];
                if (nextNode && nextNode.type === "text" && nextNode.value === "\n") {
                  nextNode.shouldRemove = true;
                }

                if (text.includes("spotlight-start")) {
                  isSpotlighting = true;
                } else {
                  isSpotlighting = false;
                }
              } else if (text.includes("// spotlight-start")) {
                isSpotlighting = true;
                const transformNode = (node) => {
                  if (node.value) {
                    node.value = node.value.replace(/\/\/ spotlight-start\s*/, "");
                  }
                  if (node.children) {
                    node.children.forEach(transformNode);
                  }
                };
                transformNode(span);
              } else if (text.includes("// spotlight-end")) {
                isSpotlighting = false;
                const transformNode = (node) => {
                  if (node.value) {
                    node.value = node.value.replace(/\/\/ spotlight-end\s*/, "");
                  }
                  if (node.children) {
                    node.children.forEach(transformNode);
                  }
                };
                transformNode(span);
              } else if (isSpotlighting) {
                span.properties.className = [...span.properties.className, "spotlight"];
                if (text.trim() === "") {
                  span.children = [{ type: "text", value: "\u00A0" }];
                }
              } else {
                span.properties.className = [...span.properties.className, "dim"];
              }
            });

            codeEl.children = codeEl.children.filter((child) => !child.shouldRemove);
          }
        }
      }
    });
  };
}
