const PREC = {
  and: 5,
  or: 4,
  comparative: 3,
  additive: 2,
  multiplicative: 1,
};

module.exports = grammar({
  name: "mcscript",
  supertypes: ($) => [$._expr, $._stmt, $._type, $._def, $._primary],
  extras: ($) => [$.line_comment, $.block_comment, /\s/],
  word: ($) => $.ident,
  rules: {
    source_file: ($) => repeat($._def),

    // global
    _def: ($) => choice($.var_def, $.func_def),
    var_def: ($) =>
      seq(
        "let",
        field("var_name", $.ident),
        ":",
        field("var_type", $._type),
        "=",
        field("init_value", $._expr),
        ";"
      ),
    func_def: ($) =>
      seq(
        "fn",
        field("func_name", $.ident),
        field("func_params", $.param_list),
        field("func_body", $.block)
      ),
    param_list: ($) =>
      seq(
        "(",
        optional(seq($.func_param, repeat(seq(",", $.func_param)))),
        ")"
      ),
    func_param: ($) =>
      seq(
        field("func_param_name", $.ident),
        ":",
        field("func_param_type", $._type)
      ),
    block: ($) => seq("{", repeat($.block_item), "}"),
    block_item: ($) => choice($._stmt, $.decl),
    decl: ($) => seq("let", $.ident, "=", $._expr, ";"),

    // stmt
    _stmt: ($) =>
      choice(
        $.expr_stmt,
        $.continue_stmt,
        $.break_stmt,
        $.inline_command_stmt,
        $.while_stmt,
        $.if_else_stmt,
        $.return_stmt,
        $.assign_stmt,
        $.op_assign_stmt,
        $.block
      ),
    expr_stmt: ($) => seq($._expr, ";"),
    continue_stmt: ($) => seq("continue", ";"),
    break_stmt: ($) => seq("break", ";"),
    inline_command_stmt: ($) =>
      seq(
        "run_command!",
        "(",
        $.string_literal,
        repeat(seq(",", $._expr)),
        ")",
        ";"
      ),
    string_literal: ($) => /\"(\\\"|[^\"])*\"/,
    while_stmt: ($) => seq("while", $._expr, $.block),
    if_else_stmt: ($) =>
      seq(
        "if",
        $._expr,
        $.block,
        optional(seq("else", choice($.block, $.if_else_stmt)))
      ),
    return_stmt: ($) => seq("return", optional($._expr), ";"),
    assign_stmt: ($) => seq($._expr, "=", $._expr, ";"),
    op_assign_stmt: ($) =>
      seq($._expr, choice("+=", "*=", "/=", "-=", "%="), $._expr, ";"),

    // primitive type
    _type: ($) => choice($.number_type, $.array_type),
    number_type: ($) => "int",
    array_type: ($) => seq("Array", "<", field("element_type", $._type), ">"),
    ident: ($) => token(/[a-zA-Z_][a-zA-Z0-9_]*/),

    // expr
    _expr: ($) => choice($.binary, $.unary, $._primary),

    binary: ($) => {
      const table = [
        [PREC.and, "&&"],
        [PREC.or, "||"],
        [PREC.comparative, choice("==", "!=", "<", "<=", ">", ">=")],
        [PREC.additive, choice("+", "-")],
        [PREC.multiplicative, choice("*", "/", "%")],
      ];
      return choice(
        ...table.map(([precedence, operator]) =>
          prec.left(
            precedence,
            seq(
              field("operand", $._expr),
              field("operator", operator),
              field("operand", $._expr)
            )
          )
        )
      );
    },

    // unary
    unary: ($) => prec.right(seq(choice("!", "-", "+"), $._expr)),

    _primary: ($) =>
      choice(
        $.number,
        $.grouping,
        $.variable,
        $.func_call,
        $.array_element,
        $.array_method,
        $.new_array,
        $.square_brackets_array
      ),
    number: ($) => choice($._oct_number, $._hex_number, $._dec_number),
    _hex_number: ($) =>
      seq(
        field("number_prefix", choice("0x", "0X")),
        alias(/[1-9a-fA-F][0-9a-fA-f]*/, $.number_value)
      ),
    _oct_number: ($) =>
      seq(field("number_prefix", "0"), alias(/[1-7][0-7]*/, $.number_value)),
    _dec_number: ($) => $.number_value,
    number_value: ($) => choice(/[1-9][0-9]*/, "0"),
    grouping: ($) => seq("(", $._expr, ")"),
    variable: ($) => prec(1, $.namespaced_ident),
    func_call: ($) => prec(2, seq($.namespaced_ident, $.arg_list)),
    array_element: ($) => seq($._primary, $.subscript),
    array_method: ($) =>
      seq(
        $._primary,
        token.immediate("."),
        choice(
          seq(alias(choice("pop", "push", "size"), $.method), "(", ")"),
          seq(alias("insert", $.method), "(", $._expr, ",", $._expr, ")"),
          seq(alias("erase", $.method), "(", $._expr, ")")
        )
      ),
    new_array: ($) =>
      seq(
        choice(
          seq("[", $._expr, ";", $._expr, "]"),
          seq("new", "Array", "(", $._expr, ",", $._expr, ")")
        )
      ),
    square_brackets_array: ($) =>
      seq(
        $.array_type,
        "[",
        optional(seq($._expr, repeat(seq(",", $._expr)))),
        "]"
      ),

    namespaced_ident: ($) =>
      seq(optional(seq(field("scope", $.ident), "::")), $.ident),
    subscript: ($) => seq("[", $._expr, "]"),
    arg_list: ($) =>
      seq("(", optional(seq($._expr, repeat(seq(",", $._expr)))), ")"),
    line_comment: ($) => /\/\/.*/,
    block_comment: ($) => /\/\*[^(*/)]*\*\//,
  },
});
