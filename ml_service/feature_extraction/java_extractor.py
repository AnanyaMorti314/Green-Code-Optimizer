import re
from typing import Dict, Tuple, List

def extract_java_features(code: str) -> Tuple[Dict, List]:
    """Extract energy-relevant features from Java code."""
    features = {}
    issues = []
    lines = code.split('\n')
    features['loc'] = len([l for l in lines if l.strip() and not l.strip().startswith('//')])

    # Nested loops
    loop_kw = r'\b(for|while|do)\b'
    depth = 0
    max_depth = 0
    for i, line in enumerate(lines, 1):
        opens = len(re.findall(loop_kw, line))
        closes = line.count('}')
        depth = max(0, depth + opens - closes)
        max_depth = max(max_depth, depth)
        if depth >= 2:
            issues.append({
                'lineStart': i, 'lineEnd': i,
                'severity': 'critical' if depth >= 3 else 'warning',
                'type': 'nested_loop',
                'message': f'Nested loop depth {depth}',
                'suggestion': 'Use HashMap for O(1) lookups instead of nested loops',
                'co2Impact': round(0.5 * depth, 3)
            })

    features['max_nested_loops'] = max_depth

    # String concatenation in loops
    in_loop = False
    for i, line in enumerate(lines, 1):
        if re.search(loop_kw, line):
            in_loop = True
        if in_loop and re.search(r'String\s+\w+\s*\+=|String\s+\w+\s*=.*\+', line):
            issues.append({
                'lineStart': i, 'lineEnd': i,
                'severity': 'warning',
                'type': 'string_concat_loop',
                'message': 'String concatenation inside loop creates excessive garbage',
                'suggestion': 'Use StringBuilder.append() in loops instead of String +=',
                'co2Impact': 0.3
            })

    # System.out.println in loops
    for i, line in enumerate(lines, 1):
        if 'System.out.print' in line:
            issues.append({
                'lineStart': i, 'lineEnd': i,
                'severity': 'info',
                'type': 'excessive_stdout',
                'message': 'System.out.println is slow in production — unsynchronized access issue',
                'suggestion': 'Use a Logger (SLF4J/Log4j) instead of System.out.println',
                'co2Impact': 0.05
            })

    features['io_operations'] = len(re.findall(r'\b(System\.out|FileReader|FileWriter|BufferedReader)\b', code))
    features['memory_allocations'] = len(re.findall(r'\bnew\s+\w+', code))
    features['function_count'] = len(re.findall(r'(public|private|protected)\s+\w+\s+\w+\s*\(', code))
    features['class_count'] = len(re.findall(r'\bclass\s+\w+', code))
    features['global_variables'] = len(re.findall(r'(public|private|protected)\s+static\s+', code))
    features['recursive_calls'] = 0
    features['comprehension_count'] = 0
    features['inefficient_patterns'] = 0

    branches = len(re.findall(r'\b(if|else|for|while|do|switch|case|catch)\b', code))
    features['cyclomatic_complexity'] = 1 + branches

    return features, issues