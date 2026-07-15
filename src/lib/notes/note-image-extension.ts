import Image from "@tiptap/extension-image";

export const NoteImageExtension = Image.extend({
  name: "noteImage",

  addAttributes() {
    return {
      ...this.parent?.(),
      "data-storage-path": {
        default: null,
        parseHTML: (element) => element.getAttribute("data-storage-path"),
        renderHTML: (attributes) => {
          const path = attributes["data-storage-path"];
          if (!path) return {};
          return { "data-storage-path": path };
        },
      },
    };
  },
});
