from schemas import IssueSchema

SUGGESTION_DB = {
    "nested_loop": {
        "python": "Use NumPy vectorization or dict-based lookups to eliminate nested loops.",
        "java":   "Replace inner loop with HashMap.get() for O(1) average complexity.",
        "c":      "Consider lookup tables or pointer arithmetic to flatten nested loops.",
        "cpp":    "Use std::unordered_map or algorithm headers like std::transform."
    },
    "memory_leak": {
        "c":  "Every malloc() must have a corresponding free() to prevent memory leaks.",
        "cpp": "Prefer RAII: use std::unique_ptr/std::shared_ptr instead of raw pointers."
    },
    "recursion": {
        "python": "Convert to iterative with an explicit stack for deep recursions.",
        "java":   "Use iteration + Deque instead of recursion for large inputs.",
        "c":      "Use an iterative loop with a stack array to avoid stack overflow.",
        "cpp":    "Use std::stack-based iteration to improve performance."
    },
    "string_concat_loop": {
        "java":   "Use StringBuilder.append() inside loops, then call .toString() once.",
        "python": "Use ''.join(parts) instead of += inside loops."
    },
    "excessive_io": {
        "python": "Batch file reads with BufferedReader; cache repeated reads in memory.",
        "java":   "Wrap IO with BufferedReader/BufferedWriter to minimize system calls.",
        "c":      "Use fread() with large buffers instead of character-by-character reads.",
        "cpp":    "Use std::ios_base::sync_with_stdio(false) and cin.tie(NULL)."
    }
}

def generate_suggestions(issues: list, language: str) -> list:
    enriched = []
    for issue in issues:
        issue_type = issue.get('type', '')
        lang_suggestions = SUGGESTION_DB.get(issue_type, {})
        lang_specific = lang_suggestions.get(language, issue.get('suggestion', ''))
        if lang_specific:
            issue['suggestion'] = lang_specific
        enriched.append(IssueSchema(**issue))
    return enriched