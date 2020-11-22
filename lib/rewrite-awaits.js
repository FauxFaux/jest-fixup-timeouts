module.exports = ({ types: t }) => ({
  visitor: {
    AwaitExpression(path) {
      const original = path.node.argument;

      if (t.isMemberExpression(original.callee)) {
        const member = original.callee;
        if (
          t.isIdentifier(member.object, { name: 'expect' }) &&
          t.isIdentifier(member.property, { name: 'withinDeadline' })
        ) {
          return;
        }
      }

      path.replaceWith(
        t.awaitExpression(
          t.callExpression(
            t.memberExpression(
              t.identifier('expect'),
              t.identifier('withinDeadline'),
            ),
            [path.node.argument],
          ),
        ),
      );
    },
  },
});
