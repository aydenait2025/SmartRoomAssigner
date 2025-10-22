# 🚀 Getting Started with SmartRoomAssigner

## Welcome to SmartRoomAssigner!

This comprehensive guide will help you get up and running with the SmartRoomAssigner system in just a few minutes.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software
- **Node.js** 16.0 or higher
- **npm** (comes with Node.js)
- **Python** 3.8 or higher
- **pip** (comes with Python)
- **Git** for version control

### Optional but Recommended
- **Docker** and **Docker Compose** (for containerized deployment)
- **PostgreSQL** (for production database)

## ⚡ Quick Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/smartroomassigner.git
cd smartroomassigner
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python app.py  # This will create the database and sample data
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Admin Dashboard**: http://localhost:3000/admin/dashboard

## 🔑 Default Login Credentials

### Administrator Access
- **Email**: `alice@examspace.com`
- **Password**: `password`

### Other Test Accounts
- **Dr. Bob** (Professor): `bob@university.edu` / `password`
- **Tom TA** (TA): `tom@university.edu` / `password`
- **Student Sara** (Student): `sara@student.edu` / `password`

## 🎯 Next Steps

### Immediate Actions
1. **Login** to the admin dashboard
2. **Import your data** (buildings, rooms, students)
3. **Schedule your first exam**
4. **Generate room assignments**

### Recommended Reading
- **[Admin Guide](./user-guides/admin-guide.md)** - Complete administration manual
- **[API Reference](./technical-docs/api-reference.md)** - Developer integration guide
- **[Troubleshooting](./admin-docs/troubleshooting.md)** - Common issues and solutions

## 🛠️ System Architecture

SmartRoomAssigner consists of:

- **Backend**: Flask application with SQLAlchemy ORM
- **Frontend**: React application with modern UI
- **Database**: SQLite (development) / PostgreSQL (production)
- **Maps**: Leaflet integration for building locator
- **Authentication**: Session-based with role management

## 📞 Support

If you encounter any issues:

1. **Check the documentation** in the Help & Support section
2. **Review the troubleshooting guide**
3. **Contact support** via the in-app support system

## 🎉 You're All Set!

Your SmartRoomAssigner system is now ready to use. Start by exploring the admin dashboard and importing your institutional data.

Happy assigning! 🎯
