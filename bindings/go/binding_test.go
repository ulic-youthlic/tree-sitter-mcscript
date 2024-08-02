package tree_sitter_mcscript_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/tree-sitter/tree-sitter-mcscript"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_mcscript.Language())
	if language == nil {
		t.Errorf("Error loading Mcscript grammar")
	}
}
