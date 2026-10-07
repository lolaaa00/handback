import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";
import { globalIgnores } from "eslint/config";

const config = [
  ...nextVitals,
  ...nextTypeScript,
  globalIgnores([
    ".next/**",
    ".venv/**",
    "artifacts/**",
    "coverage/**",
    "node_modules/**",
    "work/**",
  ]),
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default config;
