from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import AnalysisRequest, AnalysisResponse
from model import predict_green_score
from feature_extraction.python_extractor import extract_python_features
from feature_extraction.java_extractor import extract_java_features
from feature_extraction.c_extractor import extract_c_features
from feature_extraction.cpp_extractor import extract_cpp_features
from utils.suggestion_engine import generate_suggestions
from utils.co2_calculator import calculate_co2

app = FastAPI(title="Green Code ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

EXTRACTORS = {
    "python": extract_python_features,
    "java":   extract_java_features,
    "c":      extract_c_features,
    "cpp":    extract_cpp_features,
}

@app.get("/health")
def health():
    return {"status": "ok", "model": "loaded"}

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze(req: AnalysisRequest):
    try:
        extractor = EXTRACTORS.get(req.language)
        if not extractor:
            raise HTTPException(status_code=400, detail=f"Unsupported language: {req.language}")

        # Extract features from code
        features, issues = extractor(req.code)

        # Predict green score using ML model
        green_score = predict_green_score(features, req.language)

        # Calculate CO2 estimate
        co2 = calculate_co2(features, green_score)

        # Generate suggestions for each issue
        enriched_issues = generate_suggestions(issues, req.language)

        return AnalysisResponse(
            filename=req.filename,
            language=req.language,
            greenScore=round(green_score, 1),
            co2Estimate=round(co2, 4),
            issues=enriched_issues,
            metrics={
                "cyclomaticComplexity": features.get("cyclomatic_complexity", 0),
                "linesOfCode": features.get("loc", 0),
                "nestedLoopDepth": features.get("max_nested_loops", 0),
                "memoryAllocations": features.get("memory_allocations", 0),
                "ioOperations": features.get("io_operations", 0),
                "recursiveCalls": features.get("recursive_calls", 0),
                "inefficientPatterns": features.get("inefficient_patterns", 0),
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))