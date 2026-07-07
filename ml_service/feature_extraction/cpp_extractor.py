import re
from feature_extraction.c_extractor import extract_c_features
from typing import Dict, Tuple, List

def extract_cpp_features(code: str) -> Tuple[Dict, List]:
    """Extract energy-relevant features from C++ code (extends C)."""
    features, issues = extract_c_features(code)

    lines = code.split('\n')

    # C++ specific: class count
    features['class_count'] = len(re.findall(r'\bclass\s+\w+', code))

    # STL inefficiencies
    if re.search(r'vector<.*>.*push_back', code):
        # Check for push_back in loop
        in_loop = False
        for i, line in enumerate(lines, 1):
            if re.search(r'\b(for|while)\b', line):
                in_loop = True
            if in_loop and 'push_back' in line:
                issues.append({
                    'lineStart': i, 'lineEnd': i,
                    'severity': 'warning',
                    'type': 'vector_push_back_loop',
                    'message': 'push_back in loop causes multiple reallocations',
                    'suggestion': 'Use reserve() before the loop to pre-allocate vector memory',
                    'co2Impact': 0.15
                })
                in_loop = False

    # Detect cout << in loops (expensive)
    for i, line in enumerate(lines, 1):
        if 'cout' in line and i > 1:
            prev = lines[i-2] if i > 1 else ''
            if re.search(r'\b(for|while)\b', prev):
                issues.append({
                    'lineStart': i, 'lineEnd': i,
                    'severity': 'warning',
                    'type': 'io_in_loop',
                    'message': 'cout inside loop is very slow (I/O flush on every iteration)',
                    'suggestion': 'Build string with ostringstream and print once after the loop',
                    'co2Impact': 0.2
                })

    return features, issues