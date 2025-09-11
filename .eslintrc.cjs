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
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        "argsIgnorePattern": "^_",   // ✅ Alt çizgi ile başlayan parametreler YOK SAYILACAK
        "varsIgnorePattern": "^_"    // ✅ Kullanılmayan değişkenlerde de geçerli
      }
    ]
  },
  ignorePatterns: ["node_modules", ".next", "out"]
};
