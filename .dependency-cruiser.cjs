/** @typedef {import("dependency-cruiser").IConfiguration} DependencyCruiserConfig */

/** @type {DependencyCruiserConfig} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment: "Keep frontend modules acyclic.",
      from: {
        path: "^(?:src|vite[.]config[.]ts)",
        pathNot: "^src/shared/schemas/",
      },
      to: {
        circular: true,
      },
    },
    {
      name: "not-to-unresolvable",
      severity: "error",
      comment:
        "Every import must resolve through package.json or tsconfig paths.",
      from: {},
      to: {
        couldNotResolve: true,
      },
    },
    {
      name: "no-shared-to-features",
      severity: "error",
      comment: "Shared code must stay feature-agnostic.",
      from: {
        path: "^src/shared/",
      },
      to: {
        path: "^src/features/",
      },
    },
    {
      name: "no-shared-to-app",
      severity: "error",
      comment: "Shared code must not depend on app composition.",
      from: {
        path: "^src/shared/",
      },
      to: {
        path: "^src/app/",
      },
    },
    {
      name: "no-features-to-app",
      severity: "error",
      comment: "Features should not depend on app-level wiring.",
      from: {
        path: "^src/features/",
      },
      to: {
        path: "^src/app/",
      },
    },
  ],
  options: {
    doNotFollow: {
      path: ["node_modules"],
    },
    exclude: {
      path: [
        "^dist/",
        "^dist-ssr/",
        "^coverage/",
        "^node_modules/",
        "^reports/",
        "^temp/",
      ],
    },
    moduleSystems: ["cjs", "es6"],
    tsConfig: {
      fileName: "tsconfig.json",
    },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "browser", "default", "types"],
      extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
      mainFields: ["module", "browser", "main", "types", "typings"],
    },
    skipAnalysisNotInRules: true,
  },
};
