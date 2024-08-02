(func_body
  func_body: (_) @function.inside) @function.around

(param_list
  ((_)? @parameter.inside . ","? @parameter.around) @parameter.around)
(arg_list
  ((_)? @parameter.inside . ","? @parameter.around) @parameter.around)

[
  (line_comment)
  (block_comment)
] @comment.inside

(line_comment)+ @comment.around
(block_comment) @comment.around
