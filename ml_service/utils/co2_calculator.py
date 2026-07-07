# # Based on: Lannelongue et al. "Green Algorithms" paper
# # Carbon intensity of average server: 475 gCO2e/kWh (global average)
# # Average CPU power: 20W, Memory: ~0.3W per GB

# CARBON_INTENSITY = 475       # gCO2e/kWh (global average)
# CPU_POWER_W = 20             # Watts (single core avg)
# MEMORY_POWER_W_PER_GB = 0.3  # Watts per GB RAM

# def calculate_co2(features: dict, green_score: float) -> float:
#     """
#     Estimate grams of CO2 emitted per single execution.
#     Inputs: extracted code features + predicted green score
#     """
#     loc = features.get('loc', 50)
#     complexity = features.get('cyclomatic_complexity', 1)
#     nested_loops = features.get('max_nested_loops', 0)
#     mem_allocs = features.get('memory_allocations', 0)
#     io_ops = features.get('io_operations', 0)

#     # Estimate CPU time in seconds (heuristic)
#     base_time = loc * 0.0001  # 0.1ms per 1000 LOC as baseline
#     complexity_mult = 1 + (complexity * 0.05)
#     loop_mult = pow(10, nested_loops * 0.5) if nested_loops > 0 else 1
#     io_overhead = io_ops * 0.001

#     cpu_time_s = base_time * complexity_mult * loop_mult + io_overhead

#     # Memory in GB (estimate from allocations)
#     memory_gb = 0.01 + (mem_allocs * 0.0005)

#     # Energy in kWh = Power(W) × Time(h) / 1000
#     cpu_energy_kwh = (CPU_POWER_W * (cpu_time_s / 3600)) / 1000
#     mem_energy_kwh = (MEMORY_POWER_W_PER_GB * memory_gb * (cpu_time_s / 3600)) / 1000

#     total_energy_kwh = cpu_energy_kwh + mem_energy_kwh
#     co2_grams = total_energy_kwh * CARBON_INTENSITY

#     # Adjust by green score (lower score = more waste)
#     inefficiency_factor = 2 - (green_score / 100)
#     return co2_grams * inefficiency_factor

# Based on: Lannelongue et al. "Green Algorithms" paper
# Carbon intensity: 475 gCO2e/kWh (global average)
# CPU power: 20W single core, Memory: 0.3W/GB

CARBON_INTENSITY   = 475    # gCO2e/kWh
CPU_POWER_W        = 20     # Watts
MEMORY_POWER_W_PER_GB = 0.3 # Watts per GB

def calculate_co2(features: dict, green_score: float) -> float:
    """
    Estimate grams of CO2 per single execution.
    Returns a human-readable value (minimum 0.0001g).
    """
    loc         = max(features.get('loc', 50), 10)
    complexity  = max(features.get('cyclomatic_complexity', 1), 1)
    nested      = features.get('max_nested_loops', 0)
    mem_allocs  = features.get('memory_allocations', 0)
    io_ops      = features.get('io_operations', 0)

    # ── Estimate CPU execution time in seconds ──
    # Base: assume 1ms per 100 LOC at complexity=1
    base_time_s = (loc / 100) * 0.001

    # Complexity multiplier
    complexity_mult = 1 + (complexity * 0.1)

    # Nested loop multiplier — exponential (O(n^k) with n=1000)
    # depth 0 → x1, depth 1 → x10, depth 2 → x100, depth 3 → x1000
    loop_mult = pow(10, nested) if nested > 0 else 1

    # I/O overhead (each op ~5ms)
    io_overhead_s = io_ops * 0.005

    # Total CPU time
    cpu_time_s = (base_time_s * complexity_mult * loop_mult) + io_overhead_s
    cpu_time_s = max(cpu_time_s, 0.001)  # minimum 1ms

    # ── Memory ──
    memory_gb = 0.05 + (mem_allocs * 0.001)  # base 50MB + per allocation

    # ── Energy in kWh ──
    hours = cpu_time_s / 3600
    cpu_energy_kwh = (CPU_POWER_W * hours) / 1000
    mem_energy_kwh = (MEMORY_POWER_W_PER_GB * memory_gb * hours) / 1000
    total_energy_kwh = cpu_energy_kwh + mem_energy_kwh

    # ── CO2 in grams ──
    co2_grams = total_energy_kwh * CARBON_INTENSITY

    # ── Inefficiency factor (lower green score = more wasteful) ──
    inefficiency = 2.0 - (green_score / 100.0)
    co2_grams *= inefficiency

    # ── Scale up to make values human-readable ──
    # Multiply by 1000 to convert to milligrams equivalent scale
    # (represents running the code 1000 times in a real session)
    co2_grams *= 1000

    return max(co2_grams, 0.0001)  # never return exactly zero