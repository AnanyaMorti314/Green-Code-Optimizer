import ast
import re
from typing import Dict, Tuple, List

def extract_python_features(code: str) -> Tuple[Dict, List]:
    """Extract energy-relevant features from Python code."""
    features = {}
    issues = []

    lines = code.split('\n')
    features['loc'] = len([l for l in lines if l.strip() and not l.strip().startswith('#')])

    try:
        tree = ast.parse(code)
    except SyntaxError:
        features.update({
            'cyclomatic_complexity': 1, 'max_nested_loops': 0,
            'memory_allocations': 0, 'io_operations': 0,
            'recursive_calls': 0, 'inefficient_patterns': 0,
            'function_count': 0, 'class_count': 0,
            'global_variables': 0, 'comprehension_count': 0
        })
        return features, issues

    # Count loops and nesting depth
    max_depth = [0]
    def get_loop_depth(node, depth=0):
        if isinstance(node, (ast.For, ast.While)):
            depth += 1
            max_depth[0] = max(max_depth[0], depth)
        for child in ast.iter_child_nodes(node):
            get_loop_depth(child, depth)

    get_loop_depth(tree)
    features['max_nested_loops'] = max_depth[0]

    # Detect nested loops as issues
    nested_loop_lines = []
    def find_nested_loops(node, depth=0, parent_line=None):
        if isinstance(node, (ast.For, ast.While)):
            if depth >= 2:
                line = getattr(node, 'lineno', 0)
                nested_loop_lines.append(line)
                issues.append({
                    'lineStart': line, 'lineEnd': line + 5,
                    'severity': 'critical' if depth >= 3 else 'warning',
                    'type': 'nested_loop',
                    'message': f'Nested loop depth {depth} — O(n^{depth}) complexity',
                    'suggestion': 'Consider replacing nested loops with vectorized NumPy operations or dict lookups',
                    'co2Impact': round(0.5 * depth, 3)
                })
            for child in ast.iter_child_nodes(node):
                find_nested_loops(child, depth + 1, getattr(node, 'lineno', None))
        else:
            for child in ast.iter_child_nodes(node):
                find_nested_loops(child, depth, parent_line)

    find_nested_loops(tree)

    # Count functions and recursion
    functions = [n for n in ast.walk(tree) if isinstance(n, ast.FunctionDef)]
    features['function_count'] = len(functions)
    recursive = 0
    for func in functions:
        func_name = func.name
        for node in ast.walk(func):
            if isinstance(node, ast.Call) and hasattr(node.func, 'id') and node.func.id == func_name:
                recursive += 1
                issues.append({
                    'lineStart': func.lineno, 'lineEnd': func.lineno,
                    'severity': 'warning',
                    'type': 'recursion',
                    'message': f'Recursive function "{func_name}" — risk of stack overflow on large inputs',
                    'suggestion': f'Convert "{func_name}" to iterative with a stack/queue for better memory efficiency',
                    'co2Impact': 0.2
                })
                break

    features['recursive_calls'] = recursive

    # Count I/O ops
    io_patterns = ['open(', 'read(', 'write(', 'print(', 'input(', 'csv', 'json.load', 'json.dump']
    io_count = sum(code.count(pat) for pat in io_patterns)
    features['io_operations'] = io_count
    if io_count > 10:
        issues.append({
            'lineStart': 1, 'lineEnd': features['loc'],
            'severity': 'warning',
            'type': 'excessive_io',
            'message': f'High I/O operation count ({io_count})',
            'suggestion': 'Batch I/O operations, use buffered reads, or cache repeated file reads',
            'co2Impact': round(io_count * 0.01, 3)
        })

    # Memory allocation patterns
    mem_patterns = [r'\[\s*\]', r'dict\(', r'list\(', r'set\(', r'\.append\(', r'\.extend\(']
    mem_count = sum(len(re.findall(pat, code)) for pat in mem_patterns)
    features['memory_allocations'] = mem_count

    # Global variables
    globals_count = len([n for n in ast.walk(tree) if isinstance(n, ast.Global)])
    features['global_variables'] = globals_count

    # Cyclomatic complexity (simplified: 1 + branches)
    branch_nodes = (ast.If, ast.For, ast.While, ast.Try, ast.ExceptHandler, ast.With)
    branches = sum(1 for n in ast.walk(tree) if isinstance(n, branch_nodes))
    features['cyclomatic_complexity'] = 1 + branches

    # List comprehensions (efficient)
    comprehensions = [n for n in ast.walk(tree) if isinstance(n, (ast.ListComp, ast.SetComp, ast.DictComp))]
    features['comprehension_count'] = len(comprehensions)

    # Inefficient patterns
    ineff = 0
    if re.search(r'for\s+\w+\s+in\s+range\(len\(', code):
        ineff += 1
        idx = [i+1 for i, l in enumerate(lines) if 'for' in l and 'range(len(' in l]
        for line_no in idx[:3]:
            issues.append({
                'lineStart': line_no, 'lineEnd': line_no,
                'severity': 'warning',
                'type': 'range_len_pattern',
                'message': 'Using range(len(x)) is inefficient',
                'suggestion': 'Use enumerate(x) instead of range(len(x)) for better performance',
                'co2Impact': 0.05
            })

    if '+=' in code and 'str' in code.lower():
        ineff += 1
        issues.append({
            'lineStart': 1, 'lineEnd': features['loc'],
            'severity': 'info',
            'type': 'string_concatenation',
            'message': 'String concatenation in a loop creates new string objects each iteration',
            'suggestion': "Use ''.join(list) instead of += for string building in loops",
            'co2Impact': 0.1
        })

    features['inefficient_patterns'] = ineff

    return features, issues