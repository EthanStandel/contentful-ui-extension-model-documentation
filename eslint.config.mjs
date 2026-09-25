import path from "node:path";
import tsParser from "@typescript-eslint/parser";
import unusedImports from "eslint-plugin-unused-imports";

const aliasParentImports = {
  meta: {
    type: "problem",
    fixable: "code",
    schema: [],
    messages: {
      useAlias: 'Use the ~ alias: "{{aliased}}".',
    },
  },
  create(context) {
    const report = (node) => {
      const specifier = node?.value;
      if (typeof specifier !== "string" || !specifier.startsWith("../")) return;

      const target = path.resolve(path.dirname(context.filename), specifier);
      const fromSrc = path.relative(path.join(context.cwd, "src"), target);
      if (fromSrc.startsWith("..")) return;

      const aliased = `~/${fromSrc.split(path.sep).join("/")}`;
      context.report({
        node,
        messageId: "useAlias",
        data: { aliased },
        fix: (fixer) => fixer.replaceText(node, JSON.stringify(aliased)),
      });
    };

    return {
      ImportDeclaration: (node) => report(node.source),
      ExportNamedDeclaration: (node) => report(node.source),
      ExportAllDeclaration: (node) => report(node.source),
      ImportExpression: (node) => report(node.source),
    };
  },
};

export default [
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      local: { rules: { "alias-parent-imports": aliasParentImports } },
      "unused-imports": unusedImports,
    },
    rules: {
      "local/alias-parent-imports": "error",
      "unused-imports/no-unused-imports": "error",
    },
  },
];
