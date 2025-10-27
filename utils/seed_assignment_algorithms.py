#!/usr/bin/env python3
"""
Seed Assignment Algorithms Script
Seeds the default assignment algorithms into the database for demo purposes.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

try:
    from backend.app import create_app
except ImportError:
    # Try alternative import path
    try:
        sys.path.append('backend')
        from app import create_app
    except ImportError:
        print("❌ Could not import create_app. Check your PYTHONPATH or run from project root.")
        sys.exit(1)
from backend.app.models.assignment_algorithm import AssignmentAlgorithm

def main():
    """Seed default assignment algorithms into database."""
    print("🔄 Seeding assignment algorithms...")

    app = create_app()

    with app.app_context():
        try:
            # Check if algorithms already exist
            existing_count = AssignmentAlgorithm.query.count()
            if existing_count > 0:
                print(f"ℹ️  {existing_count} algorithms already exist. Skipping seeding.")
                return

            # Seed default algorithms
            print("📝 Creating default assignment algorithms...")

            # Use the model's seed method
            success = AssignmentAlgorithm.seed_default_algorithms()

            if success:
                algorithms = AssignmentAlgorithm.query.all()
                print(f"✅ Successfully seeded {len(algorithms)} assignment algorithms!")

                for algo in algorithms:
                    print(f"   • {algo.name}: {algo.description}")

                activated = AssignmentAlgorithm.query.filter_by(is_active=True).first()
                if activated:
                    print(f"🟢 Activated default algorithm: {activated.name}")

            else:
                print("❌ Failed to seed default algorithms.")

        except Exception as e:
            print(f"❌ Error seeding algorithms: {e}")

if __name__ == '__main__':
    main()
