// .eslintrc.cjs
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module"
  },
  plugins: ["@typescript-eslint", "import", "promise"],
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:promise/recommended",
    "prettier"
  ],
  rules: {
    // Genel
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
    ]
  },
  ignorePatterns: ["node_modules", ".next", "out"],
  overrides: [
    // ✅ API: hızlı geliştirme için any uyarısını kapat
    {
      files: ["src/app/api/**/*.{ts,tsx}"],
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unused-vars": [
          "warn",
          { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
        ]
      }
    },
    // ✅ UI: <img> uyarısı kırmasın (zaten next/image'a geçtik)
    {
      files: ["src/components/**/*.{ts,tsx}"],
      rules: {
        "@next/next/no-img-element": "warn"
      }
    }
  ]
};
