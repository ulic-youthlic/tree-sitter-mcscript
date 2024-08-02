; -------
; Types
; -------

[
  (number_type)
  "Array"
] @type.builtin

; -------
; Promitives
; -------

(number_value) @constant.numberic.integer
(number number_prefix: ["0x" "0X" "0"]? @namespace)
(string_literal) @string
(line_comment) @comment.line
(block_comment) @comment.block


; -------
; Punctuation
; -------

[
  "::"
  "."
  ";"
  ","
  ":"
] @punctuation.delimiter

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

(array_type
  [
    "<"
    ">"
  ] @punctuation.bracket)

; -------
; Variables
; -------

(var_def
  var_name: (ident) @variable)

(decl
  (ident) @constant)

; -------
; Keywords
; -------

"new" @keyword

[
  "if"
  "else"
] @keyword.control.conditional

"while" @keyword.control.repeat

[
  "break"
  "continue"
  "return"
] @keyword.control.return

[
  "let"
] @keyword.storage
"fn" @keyword.function
"run_command!" @function.macro


; -------
; Operations
; -------

[
  "*"
  "<="
  "="
  "=="
  "!"
  "!="
  "%"
  "%="
  "||"
  "*="
  "-"
  "-="
  "+"
  "+="
  "/"
  "/="
  ">"
  "<"
  ">="
  "<="
] @operator

(namespaced_ident
  scope: (_)? @namespace)

(func_def
  func_params: (_
    (func_param func_param_name: (_) @variable)))

(method) @function.method

(ident) @constant
