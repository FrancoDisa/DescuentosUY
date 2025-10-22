#!/usr/bin/env python3
"""
Bundle Size Analyzer for Next.js Applications

This script analyzes the Next.js build output to identify:
- Large bundles that could be code-split
- Duplicate dependencies
- Opportunities for optimization

Usage:
    python analyze_bundle.py [path_to_nextjs_project]

Example:
    python analyze_bundle.py .
    python analyze_bundle.py /path/to/descuentosuy
"""

import os
import sys
import json
import re
from pathlib import Path
from typing import Dict, List, Tuple

def find_build_manifest(project_path: str) -> Path:
    """Find the build manifest file in the Next.js build directory."""
    build_manifest = Path(project_path) / ".next" / "build-manifest.json"

    if not build_manifest.exists():
        print("Error: No build found. Run 'npm run build' first.")
        sys.exit(1)

    return build_manifest

def parse_build_manifest(manifest_path: Path) -> Dict:
    """Parse the Next.js build manifest."""
    with open(manifest_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_chunk_sizes(project_path: str) -> Dict[str, int]:
    """Get the size of each chunk in bytes."""
    static_dir = Path(project_path) / ".next" / "static" / "chunks"

    if not static_dir.exists():
        print("Error: Static chunks directory not found.")
        return {}

    chunk_sizes = {}

    for chunk_file in static_dir.rglob("*.js"):
        size = chunk_file.stat().st_size
        name = chunk_file.name
        chunk_sizes[name] = size

    return chunk_sizes

def format_size(size_bytes: int) -> str:
    """Format bytes to human-readable size."""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    else:
        return f"{size_bytes / (1024 * 1024):.1f} MB"

def analyze_large_bundles(chunk_sizes: Dict[str, int], threshold_kb: int = 200) -> List[Tuple[str, int]]:
    """Identify bundles larger than the threshold."""
    threshold_bytes = threshold_kb * 1024
    large_bundles = [
        (name, size) for name, size in chunk_sizes.items()
        if size > threshold_bytes
    ]

    return sorted(large_bundles, key=lambda x: x[1], reverse=True)

def analyze_total_size(chunk_sizes: Dict[str, int]) -> Dict[str, any]:
    """Calculate total bundle size statistics."""
    total_size = sum(chunk_sizes.values())
    average_size = total_size / len(chunk_sizes) if chunk_sizes else 0

    return {
        "total": total_size,
        "average": average_size,
        "count": len(chunk_sizes)
    }

def print_report(chunk_sizes: Dict[str, int], project_path: str):
    """Print a formatted analysis report."""
    print("\n" + "="*60)
    print("📦 BUNDLE SIZE ANALYSIS REPORT")
    print("="*60)

    # Total Statistics
    stats = analyze_total_size(chunk_sizes)
    print(f"\n📊 Overall Statistics:")
    print(f"   Total Bundles: {stats['count']}")
    print(f"   Total Size: {format_size(stats['total'])}")
    print(f"   Average Size: {format_size(int(stats['average']))}")

    # Large Bundles
    print(f"\n⚠️  Large Bundles (>200 KB):")
    large_bundles = analyze_large_bundles(chunk_sizes, threshold_kb=200)

    if large_bundles:
        for name, size in large_bundles:
            print(f"   • {name}: {format_size(size)}")

            # Suggestions based on chunk name
            if "node_modules" in name or "vendor" in name:
                print(f"     💡 Consider code-splitting this vendor bundle")
            elif "page" in name:
                print(f"     💡 Check if this page can use dynamic imports")
    else:
        print("   ✅ No large bundles found!")

    # Top 10 Largest Bundles
    print(f"\n📈 Top 10 Largest Bundles:")
    top_bundles = sorted(chunk_sizes.items(), key=lambda x: x[1], reverse=True)[:10]

    for idx, (name, size) in enumerate(top_bundles, 1):
        print(f"   {idx:2}. {name}: {format_size(size)}")

    # Recommendations
    print(f"\n💡 Optimization Recommendations:")

    total_mb = stats['total'] / (1024 * 1024)
    if total_mb > 5:
        print("   ⚠️  Total bundle size is large. Consider:")
        print("      • Enable code splitting with dynamic imports")
        print("      • Analyze dependencies with @next/bundle-analyzer")
        print("      • Remove unused dependencies")

    if len(large_bundles) > 3:
        print("   ⚠️  Multiple large bundles detected. Consider:")
        print("      • Lazy-load heavy components")
        print("      • Use next/dynamic for client components")
        print("      • Split vendor bundles")

    # Check for common heavy libraries
    heavy_libs = ["leaflet", "chart", "pdf", "markdown", "monaco"]
    found_heavy = [lib for lib in heavy_libs if any(lib in name.lower() for name in chunk_sizes.keys())]

    if found_heavy:
        print(f"   📦 Heavy libraries detected: {', '.join(found_heavy)}")
        print("      • Use dynamic imports: import dynamic from 'next/dynamic'")
        print("      • Load these libraries only when needed")

    print("\n" + "="*60)
    print("📚 Next Steps:")
    print("   1. Run: npm install @next/bundle-analyzer")
    print("   2. Add to next.config.js: withBundleAnalyzer(nextConfig)")
    print("   3. Run: ANALYZE=true npm run build")
    print("   4. Review the interactive bundle visualization")
    print("="*60 + "\n")

def main():
    """Main entry point."""
    # Get project path from args or use current directory
    project_path = sys.argv[1] if len(sys.argv) > 1 else "."

    if not os.path.exists(project_path):
        print(f"Error: Project path '{project_path}' does not exist.")
        sys.exit(1)

    print(f"🔍 Analyzing Next.js build in: {os.path.abspath(project_path)}")

    # Find and parse build manifest
    manifest_path = find_build_manifest(project_path)

    # Get chunk sizes
    chunk_sizes = get_chunk_sizes(project_path)

    if not chunk_sizes:
        print("Error: No chunks found in build directory.")
        sys.exit(1)

    # Print analysis report
    print_report(chunk_sizes, project_path)

if __name__ == "__main__":
    main()
