import re
from typing import Dict, Tuple, List

def extract_c_features(code: str) -> Tuple[Dict, List]:
    """Extract energy-relevant features from C code."""
    features = {}
    issues = []
    lines = code.split('\n')
    features['loc'] = len([l for l in lines if l.strip() and not l.strip().startswith('//')])

    # Detect nested loops
    loop_keywords = r'\b(for|while|do)\b'
    depth = 0
    max_depth = 0
    for i, line in enumerate(lines, 1):
        opens = len(re.findall(loop_keywords, line))
        closes = line.count('}')
        depth = max(0, depth + opens - closes)
        max_depth = max(max_depth, depth)
        if depth >= 2:
            issues.append({
                'lineStart': i, 'lineEnd': i,
                'severity': 'critical' if depth >= 3 else 'warning',
                'type': 'nested_loop',
                'message': f'Nested loop depth {depth} — O(n^{depth}) time complexity',
                'suggestion': 'Flatten loops using pointer arithmetic or lookup tables',
                'co2Impact': round(0.5 * depth, 3)
            })

    features['max_nested_loops'] = max_depth

    # malloc/calloc/realloc
    mem_ops = len(re.findall(r'\b(malloc|calloc|realloc)\b', code))
    features['memory_allocations'] = mem_ops
    free_ops = len(re.findall(r'\bfree\b', code))
    if mem_ops > free_ops:
        issues.append({
            'lineStart': 1, 'lineEnd': features['loc'],
            'severity': 'critical',
            'type': 'memory_leak',
            'message': f'Possible memory leak: {mem_ops} allocations vs {free_ops} free() calls',
            'suggestion': 'Ensure every malloc/calloc has a corresponding free()',
            'co2Impact': round((mem_ops - free_ops) * 0.3, 3)
        })

    # I/O
    io_count = len(re.findall(r'\b(printf|scanf|fopen|fclose|fread|fwrite|puts|gets)\b', code))
    features['io_operations'] = io_count

    # Recursion (function calls same name as definition)
    func_defs = re.findall(r'\b\w+\s+(\w+)\s*\([^)]*\)\s*\{', code)
    recursive = 0
    for fname in func_defs:
        pattern = rf'\b{re.escape(fname)}\s*\('
        calls = len(re.findall(pattern, code))
        if calls > 1:
            recursive += 1

    features['recursive_calls'] = recursive

    # Cyclomatic complexity
    branch_keywords = r'\b(if|else|for|while|do|switch|case|catch)\b'
    branches = len(re.findall(branch_keywords, code))
    features['cyclomatic_complexity'] = 1 + branches

    features['global_variables'] = len(re.findall(r'^\s*(int|float|double|char)\s+\w+\s*;', code, re.MULTILINE))
    features['function_count'] = len(func_defs)
    features['class_count'] = 0
    features['comprehension_count'] = 0
    features['inefficient_patterns'] = 0

    return features, issues