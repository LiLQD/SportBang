module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./",
          },
        },
      ],
      // Plugin đặc trị lỗi import.meta cho Metro Web
      function ({ types: t }) {
        return {
          visitor: {
            MetaProperty(path) {
              if (path.node.meta.name === "import" && path.node.property.name === "meta") {
                path.replaceWith(
                  t.objectExpression([
                    t.objectProperty(t.identifier("url"), t.stringLiteral("")),
                    t.objectProperty(
                      t.identifier("env"),
                      t.objectExpression([
                        t.objectProperty(t.identifier("MODE"), t.stringLiteral("development")),
                        t.objectProperty(t.identifier("DEV"), t.booleanLiteral(true)),
                      ])
                    ),
                  ])
                );
              }
            },
          },
        };
      },
      "react-native-reanimated/plugin",
    ],
  };
};
