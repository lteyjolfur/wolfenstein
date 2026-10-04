import globals from "globals";
import pluginJs from "@eslint/js";


export default [
  // dist is build output; index-doom.js and synthwave/ are unfinished experiments
  { ignores: ["dist/", "index-doom.js", "synthwave/"] },
  { languageOptions: { globals: globals.browser } },
  { files: ["vite.config.js"], languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  {
    rules: {
      "semi": ["error", "always"], // Enforce semicolons
      "space-infix-ops": ["error"], // Require spacing around infix operators
      "spaced-comment": ["error", "always"], // Enforce space after // or /* in comments
      "indent": ["error", 2], // Enforce 2-space indentation
    }
  }
];
