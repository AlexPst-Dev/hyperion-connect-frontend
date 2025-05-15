module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }]],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            "@assets": "./src/assets",
            "@components": "./src/components",
            "@icons": "./src/icons",
            "@styles": "./src/styles",
          },
          extensions: [".js", ".jsx", ".ts", ".tsx", ".svg"],
        },
        "nativewind/babel",
      ],
    ],
  };
};
