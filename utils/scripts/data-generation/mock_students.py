#!/usr/bin/env python3
"""
Mock Student Data Generator for SmartRoomAssigner
Generates 600 diverse students with international names and realistic academic data
"""

import csv
import random
import uuid
from typing import List, Dict

# International student names from multiple countries
INTERNATIONAL_NAMES = {
    "USA": [
        ("James", "Smith"), ("Michael", "Johnson"), ("Emma", "Davis"), ("Olivia", "Wilson"),
        ("Sophia", "Brown"), ("Mason", "Jones"), ("Ava", "Garcia"), ("William", "Miller"),
        ("Isabella", "Martinez"), ("Ethan", "Anderson"), ("Charlotte", "Taylor"), ("Alexander", "Thomas"),
        ("Amelia", "Jackson"), ("Benjamin", "White"), ("Mia", "Harris"), ("Daniel", "Clark"),
        ("Harper", "Rodriguez"), ("Matthew", "Lewis"), ("Evelyn", "Robinson"), ("Jack", "Walker")
    ],
    "Canada": [
        ("Liam", "MacDonald"), ("Oliver", "Thompson"), ("Aiden", "MacKenzie"), ("Lucas", "Campbell"),
        ("Logan", "Stewart"), ("Jacob", "Ross"), ("William", "Graham"), ("Noah", "MacGregor"),
        ("Mason", "Murray"), ("Jack", "Cameron"), ("Lucas", "Grant"), ("Owen", "Norman"),
        ("Ethan", "Wood"), ("Ella", "Fisher"), ("Avery", "Stevens"), ("Sophie", "Matthews"),
        ("Lily", "Morgan"), ("Grace", "Russell"), ("Zoey", "Bell"), ("Victoria", "Ford")
    ],
    "UK": [
        ("Harry", "Wilson"), ("Oliver", "Thompson"), ("Jack", "Brown"), ("George", "Jones"),
        ("Amelia", "Taylor"), ("Isabella", "Williams"), ("Poppy", "Davies"), ("Freya", "Evans"),
        ("Florence", "Thomas"), ("Daisy", "Roberts"), ("Charlotte", "Lewis"), ("Lilly", "Evans"),
        ("Mia", "Murdoch"), ("Imogen", "Campbell"), ("Layla", "MacDonald"), ("Ella", "Wilson"),
        ("Sebastian", "Taylor"), ("Callum", "Brown"), ("Finlay", "Thompson"), ("Kyle", "MacLeod")
    ],
    "China": [
        ("Wei", "Wang"), ("Li", "Zhang"), ("Ming", "Liu"), ("Tao", "Chen"), ("Fang", "Yang"),
        ("Hong", "Zhao"), ("Xia", "Wu"), ("Gang", "Xu"), ("Xiaoming", "Zhang"), ("Weiwei", "Li"),
        ("Xiaoling", "Liu"), ("Xiaofang", "Wang"), ("Na", "Zhang"), ("Xiaoyu", "Liu"), ("Wenfang", "Chen"),
        ("Hui", "Yang"), ("Dongmei", "Wang"), ("Haiyan", "Zhang"), ("Feng", "Li"), ("Lan", "Liu")
    ],
    "India": [
        ("Ravi", "Patel"), ("Priya", "Singh"), ("Arjun", "Sharma"), ("Aisha", "Kumar"),
        ("Rahul", "Verma"), ("Sunita", "Gupta"), ("Amit", "Sharma"), ("Meera", "Patel"),
        ("Vikram", "Singh"), ("Kavita", "Sharma"), ("Rajesh", "Kumar"), ("Anita", "Verma"),
        ("Sandeep", "Gupta"), ("Poonam", "Patel"), ("Vijay", "Singh"), ("Sarika", "Sharma"),
        ("Naresh", "Kumar"), ("Lata", "Verma"), ("Sudhir", "Gupta"), ("Usha", "Patel")
    ],
    "Germany": [
        ("Hans", "Schneider"), ("Anna", "Mueller"), ("Thomas", "Fischer"), ("Sabine", "Weber"),
        ("Michael", "Meyer"), ("Julia", "Wagner"), ("Peter", "Schulz"), ("Maria", "Becker"),
        ("Wolfgang", "Hoffmann"), ("Katrin", "Schneider"), ("Stefan", "Mueller"), ("Nicole", "Fischer"),
        ("Robert", "Weber"), ("Sandra", "Meyer"), ("Markus", "Wagner"), ("Heike", "Schulz"),
        ("Alexander", "Becker"), ("Christine", "Hoffmann"), ("Dirk", "Schneider"), ("Gabriele", "Mueller")
    ],
    "France": [
        ("Pierre", "Dubois"), ("Marie", "Martin"), ("Jean", "Bernard"), ("Sophie", "Durand"),
        ("Michel", "Dubois"), ("Anne", "Laurent"), ("Pierre", "Michel"), ("Marie", "Lefebvre"),
        ("Henri", "Bertrand"), ("Catherine", "Rousseau"), ("Alain", "Garneau"), ("Nicole", "Fournier"),
        ("Marcel", "Moreau"), ("Christiane", "Simon"), ("Jacques", "Michel"), ("Claudine", "Laurent"),
        ("Luc", "Leroy"), ("Barbara", "Michel"), ("Simon", "Moreau"), ("Evelyne", "Simon")
    ],
    "Japan": [
        ("Haruto", "Sato"), ("Sakura", "Tanaka"), ("Yuki", "Suzuki"), ("Ryoto", "Takahashi"),
        ("Aiko", "Sato"), ("Hinata", "Tanaka"), ("Yuto", "Suzuki"), ("Riko", "Takahashi"),
        ("Ren", "Watanabe"), ("Yukiko", "Ito"), ("Taro", "Yamamoto"), ("Meiko", "Nakamura"),
        ("Koki", "Kobayashi"), ("Misaki", "Yoshida"), ("Ryo", "Sasaki"), ("Nana", "Shimizu"),
        ("Haruka", "Abe"), ("Rui", "Yamada"), ("Mio", "Matsumoto"), ("Sora", "Inoue")
    ],
    "Brazil": [
        ("Carlos", "Silva"), ("Maria", "Santos"), ("João", "Oliveira"), ("Ana", "Souza"),
        ("Pedro", "Fernandes"), ("Carmen", "Rodrigues"), ("Luiz", "Almeida"), ("Paula", "Costa"),
        ("Ricardo", "Pereira"), ("Sonia", "Lima"), ("Rafael", "Barbosa"), ("Renata", "Alves"),
        ("Felipe", "Matos"), ("Cristina", "Dias"), ("Daniel", "Santiago"), ("Leticia", "Cardoso"),
        ("Roberto", "Quintana"), ("Camila", "Mira"), ("Fernando", "Rocha"), ("Isabela", "Correia")
    ],
    "Mexico": [
        ("Carlos", "Garcia"), ("Maria", "Rodriguez"), ("José", "Gonzalez"), ("Ana", "Lopez"),
        ("Miguel", "Hernandez"), ("Carmen", "Martinez"), ("Juan", "Perez"), ("Rosa", "Sanchez"),
        ("Luis", "Flores"), ("Elena", "Torres"), ("Antonio", "Ramirez"), ("Patricia", "Morales"),
        ("Pedro", "Ortiz"), ("Lucia", "Chavez"), ("Francisco", "Medina"), ("Dolores", "Castillo"),
        ("Roberto", "Juarez"), ("Claudia", "Ruiz"), ("Hector", "Alvarez"), ("Victoria", "Mendoza")
    ],
    "Australia": [
        ("Liam", "Smith"), ("Oliver", "Brown"), ("William", "Wilson"), ("Benjamin", "Taylor"),
        ("Amelia", "Jones"), ("Charlotte", "Williams"), ("Olivia", "Davis"), ("Sophia", "Miller"),
        ("Ethan", "Anderson"), ("Jack", "Thomas"), ("Ashley", "Martins"), ("Retta", "Hawkins"),
        ("Monty", "Bosch"), ("Quinn", "Hawker"), ("Nico", "Bombardiere"), ("Rudi", "Hawkins"),
        ("Marj", "Sayers"), ("Barney", "Golding"), ("Shiloh", "Morris"), ("Korben", "Golding")
    ]
}

# Academic departments
DEPARTMENTS = [
    "Computer Science", "Electrical Engineering", "Mechanical Engineering", "Chemistry",
    "Physics", "Mathematics", "Biology", "Business Administration", "Psychology",
    "Political Science", "Economics", "History", "English Literature", "Philosophy",
    "Civil Engineering", "Chemical Engineering", "Environmental Science", "Data Science",
    "Artificial Intelligence", "International Relations", "Sociology", "Anthropology",
    "Fine Arts", "Music", "Theatre", "Religious Studies", "Law", "Medicine",
    "Nursing", "Education", "Information Technology", "Communication", "Marketing",
    "Finance", "Statistics", "Geology", "Astronomy", "Agricultural Science", "Forestry"
]

# Course codes by department
COURSE_CODES = {
    "Computer Science": ["CS101", "CS201", "CS301", "CS401", "CS501", "CS601", "CS701", "CS801"],
    "Electrical Engineering": ["EE101", "EE201", "EE301", "EE401", "EE501", "EE601", "EE701", "EE801"],
    "Mechanical Engineering": ["ME101", "ME201", "ME301", "ME401", "ME501", "ME601", "ME701", "ME801"],
    "Chemistry": ["CHEM101", "CHEM201", "CHEM301", "CHEM401", "CHEM501", "CHEM601"],
    "Physics": ["PHYS101", "PHYS201", "PHYS301", "PHYS401", "PHYS501", "PHYS601"],
    "Mathematics": ["MATH101", "MATH201", "MATH301", "MATH401", "MATH501", "MATH601"],
    "Biology": ["BIO101", "BIO201", "BIO301", "BIO401", "BIO501", "BIO601"],
    "Business Administration": ["BUS101", "BUS201", "BUS301", "BUS401", "BUS501", "BUS601"],
    "Psychology": ["PSY101", "PSY201", "PSY301", "PSY401", "PSY501", "PSY601"],
    "English Literature": ["ENG101", "ENG201", "ENG301", "ENG401", "ENG501", "ENG601"],
    "Law": ["LAW101", "LAW201", "LAW301", "LAW401", "LAW501", "LAW601"],
    "Medicine": ["MED101", "MED201", "MED301", "MED401", "MED501", "MED601"],
    "Economics": ["ECON101", "ECON201", "ECON301", "ECON401", "ECON501", "ECON601"],
    "History": ["HIST101", "HIST201", "HIST301", "HIST401", "HIST501", "HIST601"],
    "Information Technology": ["IT101", "IT201", "IT301", "IT401", "IT501", "IT601"],
    "Data Science": ["DS101", "DS201", "DS301", "DS401", "DS501", "DS601"],
    "General": ["GEN101", "GEN201", "GEN301", "GEN401", "GEN501", "GEN601"]
}

# University domains
UNIVERSITY_DOMAINS = [
    "university.edu", "college.edu", "institute.edu", "academia.edu", "studium.edu",
    "scholar.edu", "academy.edu", "learning.edu", "educational.edu", "campus.edu"
]

def generate_student_data(num_students: int = 600) -> List[Dict]:
    """Generate mock student data with international diversity"""

    students = []
    countries = list(INTERNATIONAL_NAMES.keys())
    used_ids = set()

    print(f"Generating {num_students} mock students...")

    for i in range(num_students):
        # Select country and get names
        country = random.choice(countries)
        first_name, last_name = random.choice(INTERNATIONAL_NAMES[country])

        # Generate unique student number
        student_number = f"{random.randint(10000000, 99999999)}"

        # Generate unique email
        base_name = f"{first_name.lower()}.{last_name.lower()}"
        domain = random.choice(UNIVERSITY_DOMAINS)
        email = f"{base_name}@{domain}"

        # Ensure unique student_id
        counter = 1
        original_email = email
        while email in used_ids:
            email = f"{base_name}{counter}@{domain}"
            counter += 1
        used_ids.add(email)

        # Select department (with slight bias towards popular ones)
        if random.random() < 0.4:
            department = random.choice(DEPARTMENTS[:15])  # Favor first 15 departments
        else:
            department = random.choice(DEPARTMENTS)

        # Generate courses (3-6 courses based on department)
        dept_courses = COURSE_CODES.get(department, COURSE_CODES["General"])
        num_courses = random.randint(3, 6)
        courses = random.sample(dept_courses, min(num_courses, len(dept_courses)))
        courses_str = ",".join(courses)

        # Assignment status (about 45% assigned, 55% unassigned)
        has_assignment = random.random() < 0.45

        student = {
            'first_name': first_name,
            'last_name': last_name,
            'student_number': student_number,
            'student_id': email,
            'department': department,
            'courses': courses_str,
            'assignment': has_assignment  # This will be used for assignment status
        }

        students.append(student)

        if (i + 1) % 100 == 0:
            print(f"Generated {i + 1} students...")

    print("✅ Student data generation complete!")
    return students

def save_to_csv(students: List[Dict], filename: str = "mock_students.csv"):
    """Save student data to CSV format matching the import requirements"""

    fieldnames = ['first_name', 'last_name', 'student_number', 'student_id', 'department', 'courses']

    print(f"💾 Saving {len(students)} students to {filename}...")

    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()

        for student in students:
            # Remove the assignment field as it's not part of CSV import
            row_data = {k: v for k, v in student.items() if k != 'assignment'}
            writer.writerow(row_data)

    print(f"✅ CSV file saved successfully: {filename}")

def analyze_generated_data(students: List[Dict]):
    """Analyze the generated dataset"""

    print("\n📊 DATA ANALYSIS:")
    print("=" * 50)

    # Country distribution (simplified by using last name characteristics)
    countries_count = {}
    departments_count = {}
    assigned_count = 0

    for student in students:
        # Rough country estimation based on name patterns
        last_name = student['last_name']
        if last_name.endswith(('ez', 'ez')) or student['first_name'] in ['Carlos', 'Miguel', 'Juan']:
            country = 'Mexico/Brazil'
        elif last_name in ['Li', 'Wang', 'Zhang', 'Liu', 'Chen']:
            country = 'China'
        elif last_name in ['Patel', 'Singh', 'Sharma', 'Kumar']:
            country = 'India'
        elif last_name.endswith(('mann', 'stein')) or student['first_name'] in ['Hans', 'Anna', 'Thomas']:
            country = 'Germany'
        elif student['first_name'] in ['Pierre', 'Marie', 'Jean']:
            country = 'France'
        elif student['first_name'].endswith(('ro', 'ko')) or student['last_name'] in ['Tanaka', 'Suzuki']:
            country = 'Japan'
        elif student['first_name'] in ['Liam', 'Oliver', 'Aiden']:
            country = 'Canada/UK'
        else:
            country = 'USA/Others'

        countries_count[country] = countries_count.get(country, 0) + 1
        departments_count[student['department']] = departments_count.get(student['department'], 0) + 1

        if student['assignment']:
            assigned_count += 1

    print(f"Total Students: {len(students)}")
    print(f"Assigned Students: {assigned_count} ({assigned_count/len(students)*100:.1f}%)")
    print(f"Unassigned Students: {len(students) - assigned_count} ({(len(students)-assigned_count)/len(students)*100:.1f}%)")

    print("\n🗺️ Country Distribution (approximated):")
    for country, count in sorted(countries_count.items(), key=lambda x: x[1], reverse=True):
        print(f"  {country}: {count} students ({count/len(students)*100:.1f}%)")

    print(f"\n🏫 Top 10 Departments:")
    for dept, count in sorted(departments_count.items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"  {dept}: {count} students")

    # Sample of interesting students
    print("\n🌟 Interesting Student Samples:")
    sample_indices = [0, 99, 199, 299, 399, 499, 599]  # First, some middle, last
    for idx in sample_indices:
        if 0 <= idx < len(students):
            student = students[idx]
            print(f"  {student['first_name']} {student['last_name']} ({student['department']}) - {student['student_id']}")

def main():
    """Main execution function"""

    print("🎓 SmartRoomAssigner - Mock Student Data Generator")
    print("=" * 60)

    # Generate additional student data to reach 1000 total
    # Currently have 95 students, need 905 more
    students = generate_student_data(905)

    # Save to CSV
    save_to_csv(students, "mock_students_905.csv")

    # Analyze the data
    analyze_generated_data(students)

    print("\n🎉 Generation Complete!")
    print("💡 Use this CSV file to test bulk import in the Student Management page")
    print("📂 File: mock_students_905.csv")
    print("🎯 This will bring total student count to 1000")

if __name__ == "__main__":
    main()
