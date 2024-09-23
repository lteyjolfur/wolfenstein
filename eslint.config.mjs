import globals from "globals";
import pluginJs from "@eslint/js";


export default [
  {languageOptions: { globals: globals.browser }},
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