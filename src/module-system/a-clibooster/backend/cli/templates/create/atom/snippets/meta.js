const __snippet_atom = `<%=argv.atomClassName%>: {
  info: {
    bean: '<%=argv.atomClassName%>',
    title: '<%=argv.atomClassNameCapitalize%>',
    tableName: '<%=argv.providerId%><%=argv.atomClassNameCapitalize%>',
    language: false,
    category: false,
    tag: false,
    comment: false,
    attachment: false,
    layout: {
      config: {
        // atomList: 'layoutAtomList<%=argv.atomClassNameCapitalize%>',
      },
    },
  },
  actions: {},
  validator: '<%=argv.atomClassName%>',
  search: {
    validator: '<%=argv.atomClassName%>Search',
  },
},`;
const __snippet_validator = `<%=argv.atomClassName%>: {
  schemas: '<%=argv.atomClassName%>',
},
<%=argv.atomClassName%>Search: {
  schemas: '<%=argv.atomClassName%>Search',
},`;
const __snippet_index = `<%=argv.providerId%><%=argv.atomClassNameCapitalize%>: 'createdAt,updatedAt,atomId',`;

module.exports = {
  file: 'backend/src/meta.js',
  async transform({ cli, ast, argv, ctx }) {
    // atom
    let code = await cli.template.renderContent({ content: __snippet_atom });
    ast.replace(
      `const meta = { base: { atoms: {$$$0},$$$1 },$$$2 }`,
      `const meta = { base: { atoms: { ${code} \n $$$0},$$$1 },$$$2 }`
    );
    // validator
    code = await cli.template.renderContent({ content: __snippet_validator });
    ast.replace(`validators: {$$$0}`, `validators: { ${code} \n $$$0}`);
    // index
    code = await cli.template.renderContent({ content: __snippet_index });
    ast.replace(`indexes: {$$$0}`, `indexes: { ${code} \n $$$0}`);
    // ok
    return ast;
  },
};
